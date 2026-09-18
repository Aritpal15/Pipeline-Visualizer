import YAML from "yaml";

function parseYaml(content: string): unknown {
  return YAML.parse(content);
}

import {
  WorkflowDefinition,
  JobDefinition,
  StepDefinition,
  PlatformType,
} from "@pipeline-visualizer/core-model";
type AdapterDiagnosticSeverity = "error" | "warning" | "info";

interface AdapterDiagnostic {
  ruleId: string;
  severity: AdapterDiagnosticSeverity;
  message: string;
  affectedJobId?: string;
}

interface ParseResultSuccess {
  success: true;
  workflow: WorkflowDefinition;
  diagnostics: AdapterDiagnostic[];
}

interface ParseResultFailure {
  success: false;
  diagnostics: AdapterDiagnostic[];
}

type ParseResult = ParseResultSuccess | ParseResultFailure;

interface PipelineAdapter {
  readonly platform: PlatformType;
  supports(filename: string, content: string): boolean;
  parse(content: string, filename?: string): ParseResult;
}

interface RawGitHubStep {
  id?: string;
  name?: string;
  run?: string;
  uses?: string;
  with?: Record<string, unknown>;
}

interface RawGitHubJob {
  name?: string;
  needs?: string | string[];
  "runs-on"?: string | string[];
  steps?: RawGitHubStep[];
  if?: string;
  environment?: string | { name?: string };
  strategy?: {
    matrix?: Record<string, unknown[]>;
  };
}

interface RawGitHubWorkflow {
  name?: string;
  on?: string | string[] | Record<string, unknown>;
  jobs?: Record<string, RawGitHubJob>;
}

export class GitHubActionsAdapter implements PipelineAdapter {
  readonly platform: PlatformType = "github-actions";

  supports(filename: string, content: string): boolean {
    const isYamlExt = /\.ya?ml$/i.test(filename);
    const hasGitHubKeywords =
      content.includes("runs-on") || content.includes("steps:");
    const isInWorkflowDir = filename.includes(".github/workflows");
    return (isYamlExt && hasGitHubKeywords) || isInWorkflowDir;
  }

  parse(content: string, filename = "workflow.yml"): ParseResult {
    const diagnostics: AdapterDiagnostic[] = [];

    let parsed: RawGitHubWorkflow;
    try {
      parsed = parseYaml(content) as RawGitHubWorkflow;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to parse YAML content";
      return {
        success: false,
        diagnostics: [
          {
            ruleId: "GHA-001",
            severity: "error",
            message: `Syntax Error: ${errorMsg}`,
          },
        ],
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return {
        success: false,
        diagnostics: [
          {
            ruleId: "GHA-002",
            severity: "error",
            message: "Document is empty or invalid YAML object hierarchy.",
          },
        ],
      };
    }

    const workflowName = parsed.name || filename.replace(/\.[^/.]+$/, "");
    const triggers: string[] = [];

    if (typeof parsed.on === "string") {
      triggers.push(parsed.on);
    } else if (Array.isArray(parsed.on)) {
      triggers.push(...parsed.on);
    } else if (parsed.on && typeof parsed.on === "object") {
      triggers.push(...Object.keys(parsed.on));
    }

    const rawJobs = parsed.jobs || {};
    const normalizedJobs: Record<string, JobDefinition> = {};

    for (const [jobId, jobData] of Object.entries(rawJobs)) {
      if (!jobData || typeof jobData !== "object") {
        diagnostics.push({
          ruleId: "GHA-003",
          severity: "warning",
          message: `Job definition for '${jobId}' is invalid or empty.`,
          affectedJobId: jobId,
        });
        continue;
      }

      let dependencies: string[] = [];
      if (typeof jobData.needs === "string") {
        dependencies = [jobData.needs];
      } else if (Array.isArray(jobData.needs)) {
        dependencies = jobData.needs.filter(Boolean);
      }

      const steps: StepDefinition[] = (jobData.steps || []).map(
        (step, idx) => ({
          id: step.id || `step-${idx + 1}`,
          name:
            step.name ||
            step.run?.slice(0, 30) ||
            step.uses ||
            `Step ${idx + 1}`,
          run: step.run,
          uses: step.uses,
          with: step.with,
        }),
      );

      let runner: string | undefined;
      if (typeof jobData["runs-on"] === "string") {
        runner = jobData["runs-on"];
      } else if (Array.isArray(jobData["runs-on"])) {
        runner = jobData["runs-on"].join(", ");
      }

      let environment: string | undefined;
      if (typeof jobData.environment === "string") {
        environment = jobData.environment;
      } else if (
        jobData.environment &&
        typeof jobData.environment === "object"
      ) {
        environment = jobData.environment.name;
      }

      let matrixConfig: JobDefinition["matrix"] = undefined;
      if (
        jobData.strategy?.matrix &&
        typeof jobData.strategy.matrix === "object"
      ) {
        const matrixKeys = Object.keys(jobData.strategy.matrix);
        const totalCombinations = matrixKeys.reduce((acc, key) => {
          const val = jobData.strategy?.matrix?.[key];
          return acc * (Array.isArray(val) && val.length > 0 ? val.length : 1);
        }, 1);
        matrixConfig = {
          matrixKeys,
          totalCombinations,
        };
      }

      normalizedJobs[jobId] = {
        id: jobId,
        displayName: jobData.name || jobId,
        dependencies,
        steps,
        condition: jobData.if,
        environment,
        runner,
        matrix: matrixConfig,
      };
    }

    const workflow: WorkflowDefinition = {
      schemaVersion: "1.0.0",
      platform: "github-actions",
      name: workflowName,
      path: filename,
      triggers,
      jobs: normalizedJobs,
    };

    return {
      success: true,
      workflow,
      diagnostics,
    };
  }
}
