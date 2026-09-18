import { WorkflowDefinition } from "@pipeline-visualizer/core-model";
import { AdapterDiagnostic } from "@pipeline-visualizer/adapter-shared";

export function validateWorkflowIntegrity(
  workflow: WorkflowDefinition | null,
): AdapterDiagnostic[] {
  if (!workflow || !workflow.jobs) {
    return [
      {
        severity: "error",
        ruleId: "GHA-EMPTY",
        message: "No jobs found in workflow definition.",
      },
    ];
  }

  const diagnostics: AdapterDiagnostic[] = [];
  const jobMap = workflow.jobs;
  const jobIds = Object.keys(jobMap);

  // 1. Check for missing references and execution step issues
  for (const [id, job] of Object.entries(jobMap)) {
    // Missing upstream dependency
    for (const dep of job.dependencies || []) {
      if (!jobMap[dep]) {
        diagnostics.push({
          severity: "error",
          ruleId: "GHA-MISSING-REF",
          message: `Job '${id}' depends on undefined job '${dep}'.`,
        });
      }
    }

    // Missing steps
    if (!job.steps || job.steps.length === 0) {
      diagnostics.push({
        severity: "error",
        ruleId: "GHA-MISSING-STEPS",
        message: `Job '${id}' does not contain any execution steps.`,
      });
    }

    // Runner validation check
    const validRunners = ["ubuntu", "windows", "macos", "self-hosted"];
    if (
      job.runner &&
      !validRunners.some((r) => job.runner?.toLowerCase().includes(r))
    ) {
      diagnostics.push({
        severity: "warning",
        ruleId: "GHA-UNKNOWN-RUNNER",
        message: `Job '${id}' uses unrecognized runner '${job.runner}'.`,
      });
    }
  }

  // 2. Cycle Detection using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function detectCycle(current: string, path: string[]): boolean {
    visited.add(current);
    recursionStack.add(current);

    const job = jobMap[current];
    const deps = (job?.dependencies || []).filter((d) => Boolean(jobMap[d]));

    for (const dep of deps) {
      if (!visited.has(dep)) {
        if (detectCycle(dep, [...path, dep])) return true;
      } else if (recursionStack.has(dep)) {
        diagnostics.push({
          severity: "error",
          ruleId: "GHA-CYCLE-DETECTED",
          message: `Circular dependency detected: ${[...path, dep].join(" → ")}`,
        });
        return true;
      }
    }

    recursionStack.delete(current);
    return false;
  }

  for (const id of jobIds) {
    if (!visited.has(id)) {
      detectCycle(id, [id]);
    }
  }

  return diagnostics;
}
