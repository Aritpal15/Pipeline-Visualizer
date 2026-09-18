import React from "react";
import {
  WorkflowDefinition,
  JobDefinition,
} from "@pipeline-visualizer/core-model";
import { Box, CheckCircle2, Cpu, Terminal } from "lucide-react";

interface GraphCanvasProps {
  workflow: WorkflowDefinition | null;
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  workflow,
  selectedJobId,
  onSelectJob,
}) => {
  if (!workflow) {
    return (
      <div className="w-full h-96 bg-white neo-box flex flex-col items-center justify-center p-8 text-center">
        <Box className="w-12 h-12 mb-3 text-neutral-400" />
        <p className="font-black uppercase text-lg">No workflow loaded</p>
        <p className="text-sm font-bold text-neutral-600">
          Paste a GitHub Actions YAML on the left to render the graph.
        </p>
      </div>
    );
  }

  const jobs = Object.values(workflow.jobs);

  // Group jobs into levels for clean vertical or horizontal layering
  const calculateLevels = (jobList: JobDefinition[]) => {
    const levels: Map<string, number> = new Map();

    const getLevel = (jobId: string, visited = new Set<string>()): number => {
      if (visited.has(jobId)) return 0;
      visited.add(jobId);

      const job = workflow.jobs[jobId];
      if (!job || job.dependencies.length === 0) return 0;

      const parentLevels = job.dependencies.map((dep) =>
        getLevel(dep, new Set(visited)),
      );
      return Math.max(...parentLevels, 0) + 1;
    };

    jobList.forEach((job) => {
      levels.set(job.id, getLevel(job.id));
    });

    return levels;
  };

  const jobLevels = calculateLevels(jobs);
  const maxLevel = Math.max(0, ...Array.from(jobLevels.values()));

  const columns: JobDefinition[][] = Array.from(
    { length: maxLevel + 1 },
    () => [],
  );
  jobs.forEach((job) => {
    const level = jobLevels.get(job.id) || 0;
    columns[level].push(job);
  });

  return (
    <div className="w-full min-h-[480px] bg-white neo-box p-6 overflow-x-auto">
      <div className="mb-4 flex items-center justify-between border-b-2 border-neo-black pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-neo-black" />
          <span className="font-black uppercase tracking-wide">
            Workflow: {workflow.name}
          </span>
        </div>
        <span className="text-xs font-bold uppercase bg-neo-black text-white px-2 py-0.5">
          {jobs.length} Nodes
        </span>
      </div>

      <div className="flex gap-12 items-start py-6 min-w-max">
        {columns.map((columnJobs, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-8 items-center">
            <div className="text-xs font-black uppercase tracking-wider bg-neo-bg px-2 py-1 border-2 border-neo-black shadow-[2px_2px_0px_0px_#121212]">
              Stage {colIdx + 1}
            </div>

            <div className="flex flex-col gap-6">
              {columnJobs.map((job) => {
                const isSelected = selectedJobId === job.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => onSelectJob(job.id)}
                    className={`w-64 text-left p-4 transition-all duration-100 ${
                      isSelected
                        ? "bg-neo-yellow neo-box-lg -translate-x-1 -translate-y-1"
                        : "bg-white neo-box hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-600 font-mono">
                        {job.id}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-neo-black" />
                    </div>

                    <h4 className="font-black text-base leading-tight mb-2">
                      {job.displayName}
                    </h4>

                    <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                      {job.runner && (
                        <span className="bg-neo-bg px-2 py-0.5 border border-neo-black flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          {job.runner}
                        </span>
                      )}
                      <span className="bg-neo-bg px-2 py-0.5 border border-neo-black">
                        {job.steps.length} Steps
                      </span>
                    </div>

                    {job.dependencies.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-dashed border-neo-black text-[11px] text-neutral-600">
                        <span className="font-bold">Depends on: </span>
                        {job.dependencies.join(", ")}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
