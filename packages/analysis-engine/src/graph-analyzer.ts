import { WorkflowDefinition } from "@pipeline-visualizer/core-model";

export interface AdapterDiagnostic {
  ruleId: string;
  severity: string;
  message: string;
  affectedJobId?: string;
}

export interface AnalysisReport {
  isValidDag: boolean;
  hasCycles: boolean;
  cycles: string[][];
  unreachableJobs: string[];
  diagnostics: AdapterDiagnostic[];
}

export class PipelineGraphAnalyzer {
  analyze(workflow: WorkflowDefinition): AnalysisReport {
    const diagnostics: AdapterDiagnostic[] = [];
    const jobIds = Object.keys(workflow.jobs);
    const adj = new Map<string, string[]>();

    for (const id of jobIds) {
      adj.set(id, []);
    }

    // Build dependency adjacency and check for undefined dependencies
    for (const [id, job] of Object.entries(workflow.jobs)) {
      for (const dep of job.dependencies) {
        if (!workflow.jobs[dep]) {
          diagnostics.push({
            ruleId: "DAG-001",
            severity: "error",
            message: `Job '${id}' depends on non-existent job '${dep}'.`,
            affectedJobId: id,
          });
        } else {
          adj.get(dep)?.push(id);
        }
      }
    }

    // Cycle detection via DFS with 3-color marking
    const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
    const parentMap = new Map<string, string | null>();
    const detectedCycles: string[][] = [];

    for (const id of jobIds) {
      visited.set(id, 0);
    }

    const dfs = (node: string, stack: string[]) => {
      visited.set(node, 1);
      stack.push(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        const state = visited.get(neighbor);
        if (state === 1) {
          const cycleStartIndex = stack.indexOf(neighbor);
          const cyclePath = [...stack.slice(cycleStartIndex), neighbor];
          detectedCycles.push(cyclePath);
          diagnostics.push({
            ruleId: "DAG-002",
            severity: "error",
            message: `Cyclic dependency detected: ${cyclePath.join(" -> ")}`,
            affectedJobId: node,
          });
        } else if (state === 0) {
          parentMap.set(neighbor, node);
          dfs(neighbor, stack);
        }
      }

      stack.pop();
      visited.set(node, 2);
    };

    for (const id of jobIds) {
      if (visited.get(id) === 0) {
        dfs(id, []);
      }
    }

    // Identify dangling/isolated jobs with no parents or dependents (observations)
    const unreachableJobs: string[] = [];
    for (const [id, job] of Object.entries(workflow.jobs)) {
      const hasDeps = job.dependencies.length > 0;
      const hasDependents = (adj.get(id) || []).length > 0;
      if (!hasDeps && !hasDependents && jobIds.length > 1) {
        unreachableJobs.push(id);
        diagnostics.push({
          ruleId: "DAG-003",
          severity: "observation",
          message: `Job '${id}' runs in complete isolation without dependencies or dependents.`,
          affectedJobId: id,
        });
      }
    }

    const hasCycles = detectedCycles.length > 0;
    const isValidDag =
      !hasCycles && diagnostics.every((d) => d.severity !== "error");

    return {
      isValidDag,
      hasCycles,
      cycles: detectedCycles,
      unreachableJobs,
      diagnostics,
    };
  }
}
