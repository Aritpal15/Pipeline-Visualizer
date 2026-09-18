import React, { useEffect } from "react";
import { JobDefinition } from "@pipeline-visualizer/core-model";

interface TechnicalJobSpecInspectorProps {
  job: JobDefinition | null;
  allJobs: Record<string, JobDefinition>;
  onClose: () => void;
}

export const TechnicalJobSpecInspector: React.FC<
  TechnicalJobSpecInspectorProps
> = ({ job, allJobs, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const downstreamDependents = Object.values(allJobs)
    .filter((j) => j.dependencies.includes(job.id))
    .map((j) => j.id);

  return (
    <div className="w-full h-full flex flex-col font-mono text-[11px] select-none bg-white dark:bg-[#111215]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-[#16181d] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 inline-block" />
          <span className="font-bold tracking-wider text-neutral-900 dark:text-neutral-100">
            JOB SPEC // {job.id.toUpperCase()}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[10px] font-bold px-1 py-0.5 border border-transparent hover:border-neutral-400"
          title="Press ESC to close"
        >
          [ESC]
        </button>
      </div>

      {/* Spec Table */}
      <div className="p-3 space-y-4 overflow-y-auto flex-1">
        <table className="w-full border-collapse border border-neutral-200 dark:border-neutral-800 text-[10px]">
          <tbody>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <td className="p-2 font-bold uppercase text-neutral-500 bg-neutral-50 dark:bg-[#14161a] w-28">
                Status
              </td>
              <td className="p-2">
                <span className="bg-blue-600 text-white px-1.5 py-0.5 text-[9px] font-bold uppercase">
                  Active Focus
                </span>
              </td>
            </tr>

            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <td className="p-2 font-bold uppercase text-neutral-500 bg-neutral-50 dark:bg-[#14161a]">
                Runner
              </td>
              <td className="p-2 font-bold text-neutral-800 dark:text-neutral-200">
                {job.runner || "ubuntu-latest"}
              </td>
            </tr>

            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <td className="p-2 font-bold uppercase text-neutral-500 bg-neutral-50 dark:bg-[#14161a]">
                Needs (Upstream)
              </td>
              <td className="p-2 font-bold text-blue-600 dark:text-blue-400">
                {job.dependencies.length > 0
                  ? job.dependencies.join(", ")
                  : "None (Root Node)"}
              </td>
            </tr>

            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <td className="p-2 font-bold uppercase text-neutral-500 bg-neutral-50 dark:bg-[#14161a]">
                Dependents
              </td>
              <td className="p-2 text-neutral-700 dark:text-neutral-300">
                {downstreamDependents.length > 0
                  ? downstreamDependents.join(", ")
                  : "None (Terminal DAG)"}
              </td>
            </tr>

            <tr>
              <td className="p-2 font-bold uppercase text-neutral-500 bg-neutral-50 dark:bg-[#14161a]">
                Environment
              </td>
              <td className="p-2 font-bold text-neutral-800 dark:text-neutral-200">
                {job.environment || "production"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Step Sequence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase text-[10px] tracking-wider text-neutral-600 dark:text-neutral-400">
              Step Execution Sequence
            </span>
            <span className="text-[10px] text-neutral-400">
              {job.steps.length} {job.steps.length === 1 ? "STEP" : "STEPS"}
            </span>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {job.steps.map((step, idx) => (
              <div key={idx} className="p-2 text-[10px] flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400 w-5 flex-shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-neutral-800 dark:text-neutral-200">
                  {step.uses || step.run || `Step ${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
