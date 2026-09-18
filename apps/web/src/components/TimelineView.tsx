import React, { useMemo } from "react";
import {
  WorkflowDefinition,
  JobDefinition,
} from "@pipeline-visualizer/core-model";

interface TimelineViewProps {
  workflow: WorkflowDefinition | null;
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

interface TimelineRow {
  job: JobDefinition;
  startOffset: number;
  duration: number;
  stageIndex: number;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  workflow,
  selectedJobId,
  onSelectJob,
}) => {
  const { rows, totalDuration } = useMemo(() => {
    if (
      !workflow ||
      !workflow.jobs ||
      Object.keys(workflow.jobs).length === 0
    ) {
      return { rows: [], totalDuration: 10 };
    }

    const jobList = Object.values(workflow.jobs);

    // Topological stage assignment
    const stageMap = new Map<string, number>();
    const computeStage = (
      jobId: string,
      visited = new Set<string>(),
    ): number => {
      if (visited.has(jobId)) return 0;
      visited.add(jobId);
      const job = workflow.jobs[jobId];
      if (!job || !job.dependencies || job.dependencies.length === 0) return 0;
      const upstream = job.dependencies.map((d) =>
        computeStage(d, new Set(visited)),
      );
      return Math.max(...upstream, 0) + 1;
    };

    jobList.forEach((j) => stageMap.set(j.id, computeStage(j.id)));

    const computedRows: TimelineRow[] = jobList.map((job) => {
      const stage = stageMap.get(job.id) || 0;
      const stepCount = job.steps?.length || 1;
      const duration = Math.max(1.5, stepCount * 1.2);
      const startOffset = stage * 3.5;

      return {
        job,
        startOffset,
        duration,
        stageIndex: stage,
      };
    });

    computedRows.sort(
      (a, b) =>
        a.startOffset - b.startOffset || a.job.id.localeCompare(b.job.id),
    );

    const maxEnd = Math.max(
      ...computedRows.map((r) => r.startOffset + r.duration),
      10,
    );

    return {
      rows: computedRows,
      totalDuration: Math.ceil(maxEnd / 5) * 5,
    };
  }, [workflow]);

  if (!workflow || rows.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center font-mono text-xs text-neutral-500 bg-[#f5f5f5] dark:bg-[#0c0d0e]">
        NO TIMELINE METRICS AVAILABLE // PARSE WORKFLOW
      </div>
    );
  }

  const timeMarkers = Array.from(
    { length: Math.floor(totalDuration / 2) + 1 },
    (_, i) => i * 2,
  );

  return (
    <div className="w-full h-full p-6 bg-[#f5f5f5] dark:bg-[#0c0d0e] flex flex-col font-mono text-[11px] overflow-auto select-none">
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] flex flex-col shadow-sm">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-[#16181d]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 inline-block" />
            <span className="font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
              Execution Timeline & Concurrency
            </span>
          </div>
          <div className="text-[10px] text-neutral-500">
            TOTAL DURATION:{" "}
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              ~{totalDuration}m
            </span>
          </div>
        </div>

        {/* Time Scale Bar */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-[#141518] text-[10px] text-neutral-400">
          <div className="w-48 px-4 py-2 font-bold uppercase border-r border-neutral-200 dark:border-neutral-800 flex-shrink-0">
            Job Identifier
          </div>
          <div className="relative flex-1 h-8">
            {timeMarkers.map((m) => {
              const leftPercent = (m / totalDuration) * 100;
              return (
                <div
                  key={m}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center pt-1"
                >
                  <span className="font-mono text-[9px]">{m}m</span>
                  <span className="h-1.5 w-px bg-neutral-300 dark:bg-neutral-700 mt-0.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {rows.map((row) => {
            const isSelected = selectedJobId === row.job.id;
            const leftPercent = (row.startOffset / totalDuration) * 100;
            const widthPercent = (row.duration / totalDuration) * 100;

            return (
              <div
                key={row.job.id}
                onClick={() => onSelectJob(row.job.id)}
                className={`flex h-12 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-500/10"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                }`}
              >
                {/* Job Metadata */}
                <div className="w-48 px-4 flex flex-col justify-center border-r border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 ${
                        isSelected ? "bg-blue-600" : "bg-emerald-500"
                      }`}
                    />
                    <span className="font-bold uppercase text-[11px] truncate text-neutral-900 dark:text-neutral-100">
                      {row.job.id}
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-400 truncate pl-3">
                    {row.job.runner || "ubuntu-latest"}
                  </span>
                </div>

                {/* Track */}
                <div className="relative flex-1 h-full flex items-center px-2">
                  {/* Grid Lines */}
                  {timeMarkers.map((m) => (
                    <div
                      key={m}
                      style={{ left: `${(m / totalDuration) * 100}%` }}
                      className="absolute top-0 bottom-0 w-px bg-neutral-200/50 dark:bg-neutral-800/50 pointer-events-none"
                    />
                  ))}

                  {/* Gantt Bar */}
                  <div
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(widthPercent, 5)}%`,
                    }}
                    className={`absolute h-6 flex items-center justify-between px-2 font-mono text-[9px] border transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-neutral-800 dark:bg-neutral-700 text-neutral-100 border-neutral-700 dark:border-neutral-600"
                    }`}
                  >
                    <span className="font-bold truncate">
                      STAGE {row.stageIndex}
                    </span>
                    <span className="text-[8px] opacity-80 pl-1">
                      {row.duration.toFixed(1)}m
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
