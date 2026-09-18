import React from "react";
import {
  WORKFLOW_PRESETS,
  WorkflowPreset,
} from "../samples/workflowPresets.js";
import { ArrowRight, Layers, Cpu, GitMerge, AlertTriangle } from "lucide-react";

interface ExamplesGalleryProps {
  onSelectPreset: (preset: WorkflowPreset) => void;
}

export const ExamplesGallery: React.FC<ExamplesGalleryProps> = ({
  onSelectPreset,
}) => {
  const getCategoryIcon = (category: WorkflowPreset["category"]) => {
    switch (category) {
      case "STANDARD":
        return <Layers className="w-4 h-4 text-emerald-500" />;
      case "MATRIX":
        return <Cpu className="w-4 h-4 text-blue-500" />;
      case "MONOREPO":
        return <GitMerge className="w-4 h-4 text-purple-500" />;
      case "DIAGNOSTICS":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="w-full h-full p-8 bg-[#f5f5f5] dark:bg-[#0c0d0e] font-mono text-[11px] overflow-auto select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-blue-600 inline-block" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Workflow Architectural Presets
            </h2>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-[11px] max-w-2xl">
            Select a verified CI/CD topology pattern to analyze DAG layouts,
            concurrency timelines, and error diagnostic engines.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORKFLOW_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] p-5 cursor-pointer transition-all hover:border-neutral-500 dark:hover:border-neutral-600 hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(preset.category)}
                    <span className="font-bold text-[10px] tracking-wider text-neutral-400 uppercase">
                      {preset.category}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-bold">
                    {preset.nodeCount} JOBS
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {preset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-[10px] font-bold">
                <span>LOAD TOPOLOGY</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
