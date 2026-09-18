import React from "react";
import { JobDefinition } from "@pipeline-visualizer/core-model";
import { X, Layers, Clock, Cpu, PlayCircle } from "lucide-react";

interface JobDetailsPanelProps {
  job: JobDefinition | null;
  onClose: () => void;
}

export const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({
  job,
  onClose,
}) => {
  if (!job) {
    return null;
  }

  return (
    <div className="w-full bg-white neo-box p-4 space-y-4">
      <div className="flex items-start justify-between border-b-2 border-neo-black pb-3">
        <div>
          <span className="text-xs font-mono font-black uppercase text-neutral-500">
            Node Inspector
          </span>
          <h3 className="text-xl font-black uppercase tracking-tight">
            {job.displayName}
          </h3>
          <p className="text-xs font-mono font-bold text-neutral-700">
            ID: {job.id}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 border-2 border-neo-black bg-neo-bg hover:bg-neo-pink hover:text-white transition-colors"
          aria-label="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="p-2 border-2 border-neo-black bg-neo-bg flex items-center gap-2">
          <Cpu className="w-4 h-4 text-neutral-700 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-black uppercase text-neutral-500">
              Runner
            </div>
            <div className="font-bold">
              {job.runner || "Inherited / Default"}
            </div>
          </div>
        </div>

        <div className="p-2 border-2 border-neo-black bg-neo-bg flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-700 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-black uppercase text-neutral-500">
              Dependencies
            </div>
            <div className="font-bold">
              {job.dependencies.length > 0
                ? job.dependencies.join(", ")
                : "None (Root Node)"}
            </div>
          </div>
        </div>
      </div>

      {job.condition && (
        <div className="p-2 border-2 border-neo-black bg-yellow-50 text-xs">
          <div className="font-black uppercase text-neutral-600 mb-1">
            Execution Condition
          </div>
          <code className="font-mono bg-white px-1.5 py-0.5 border border-neo-black block overflow-x-auto">
            {job.condition}
          </code>
        </div>
      )}

      <div>
        <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <PlayCircle className="w-4 h-4" />
          <span>Execution Steps ({job.steps.length})</span>
        </h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {job.steps.map((step, idx) => (
            <div
              key={`${step.id || "step"}-${idx}`}
              className="p-2.5 border-2 border-neo-black bg-neutral-50 shadow-[2px_2px_0px_0px_#121212] text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black uppercase">
                  {step.name || step.id || `Step ${idx + 1}`}
                </span>
                {step.uses && (
                  <span className="bg-neo-cyan px-1.5 py-0.2 border border-neo-black font-mono text-[10px] font-bold">
                    Action
                  </span>
                )}
              </div>

              {step.uses && (
                <div className="font-mono text-[11px] text-neutral-700 truncate">
                  uses: {step.uses}
                </div>
              )}

              {step.run && (
                <pre className="mt-1 p-1.5 bg-neo-black text-neo-green font-mono text-[11px] overflow-x-auto rounded-none">
                  {step.run}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
