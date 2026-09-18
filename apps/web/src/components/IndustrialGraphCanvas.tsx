import React, { useMemo } from "react";
import { WorkflowDefinition } from "@pipeline-visualizer/core-model";
import {
  computeDagLayout,
  LayoutOptions,
  DEFAULT_LAYOUT_OPTIONS,
} from "../utils/dagLayoutEngine.js";
import { AlertOctagon, ArrowRight, HelpCircle } from "lucide-react";

interface IndustrialGraphCanvasProps {
  workflow: WorkflowDefinition | null;
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  zoom: number;
  tracePath: boolean;
  onGoToEditor?: () => void;
  layoutOptions?: LayoutOptions;
  showStepCount?: boolean;
  showRunnerLabel?: boolean;
}

export const IndustrialGraphCanvas: React.FC<IndustrialGraphCanvasProps> = ({
  workflow,
  selectedJobId,
  onSelectJob,
  zoom,
  tracePath,
  onGoToEditor,
  layoutOptions = DEFAULT_LAYOUT_OPTIONS,
  showStepCount = true,
  showRunnerLabel = true,
}) => {
  const layout = useMemo(
    () => computeDagLayout(workflow, selectedJobId, tracePath, layoutOptions),
    [workflow, selectedJobId, tracePath, layoutOptions],
  );

  if (layout.hasCycle) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#f5f5f5] dark:bg-[#0c0d0e] font-mono select-none">
        <div className="max-w-md w-full border border-red-500/50 bg-white dark:bg-[#121316] p-6 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertOctagon className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-sm tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
              Topology Fault // Circular Dependency
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Workflow graph contains one or more closed loops. DAG
              specifications must be acyclic.
            </p>
          </div>

          <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300">
            <span className="text-neutral-400 font-bold block mb-1">
              INVOLVED CYCLIC NODES:
            </span>
            <span className="font-mono text-red-600 dark:text-red-400 font-bold">
              {layout.cycleNodes.join(" ⇄ ")}
            </span>
          </div>

          {onGoToEditor && (
            <button
              onClick={onGoToEditor}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-black font-bold text-[11px] tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Jump to Editor to Resolve Loop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!workflow || layout.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5] dark:bg-[#0c0d0e] text-xs font-mono text-neutral-500">
        NO WORKFLOW LOADED // READY FOR PARSE
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-6 select-none bg-[#f5f5f5] dark:bg-[#0c0d0e]">
      <div
        id="pipeline-dag-container"
        style={{
          width: `${layout.canvasWidth * zoom}px`,
          height: `${layout.canvasHeight * zoom}px`,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
        className="relative"
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          width={layout.canvasWidth}
          height={layout.canvasHeight}
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 1 L 10 5 L 0 9 z"
                className="fill-neutral-400 dark:fill-neutral-600"
              />
            </marker>
            <marker
              id="arrow-highlight"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 1 L 10 5 L 0 9 z"
                className="fill-blue-600 dark:fill-blue-500"
              />
            </marker>
            <marker
              id="arrow-ghost"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" className="fill-red-500" />
            </marker>
          </defs>

          {layout.edges.map((edge, idx) => (
            <path
              key={`${edge.fromId}->${edge.toId}-${idx}`}
              d={edge.path}
              fill="none"
              stroke={
                edge.isGhostEdge
                  ? "#ef4444"
                  : edge.isHighlighted
                    ? "#2563eb"
                    : "currentColor"
              }
              strokeWidth={edge.isHighlighted ? 2 : 1}
              strokeDasharray={edge.isGhostEdge ? "4 3" : undefined}
              className={
                edge.isGhostEdge
                  ? "text-red-500"
                  : edge.isHighlighted
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-neutral-400 dark:text-neutral-700"
              }
              markerEnd={
                edge.isGhostEdge
                  ? "url(#arrow-ghost)"
                  : edge.isHighlighted
                    ? "url(#arrow-highlight)"
                    : "url(#arrow-default)"
              }
            />
          ))}
        </svg>

        {/* Nodes */}
        {layout.nodes.map((node) => {
          const isSelected = selectedJobId === node.id;
          const stepCount = node.job.steps ? node.job.steps.length : 0;

          if (node.isGhost) {
            return (
              <div
                key={node.id}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                }}
                className="absolute border-2 border-dashed border-red-500/80 bg-red-50/40 dark:bg-red-950/20 p-3 font-mono flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                  <span className="font-bold text-[10px] uppercase truncate">
                    MISSING // {node.id}
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                </div>
                <div className="text-[9px] text-red-600/80 dark:text-red-400/80 pt-1 border-t border-red-300 dark:border-red-900/60 uppercase">
                  Undefined Dependency
                </div>
              </div>
            );
          }

          return (
            <div
              key={node.id}
              onClick={() => onSelectJob(node.id)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`,
              }}
              className={`absolute cursor-pointer p-3 border font-mono transition-all duration-75 flex flex-col justify-between ${
                isSelected
                  ? "bg-white dark:bg-[#14161a] border-blue-600 shadow-[0_0_0_1px_#2563eb]"
                  : "bg-white dark:bg-[#121316] border-neutral-300 dark:border-neutral-800 hover:border-neutral-500 dark:hover:border-neutral-600"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-[11px] uppercase tracking-wider truncate text-neutral-900 dark:text-neutral-100">
                  {node.id}
                </span>
                <span
                  className={`w-2 h-2 flex-shrink-0 ${
                    isSelected ? "bg-blue-600" : "bg-emerald-500"
                  }`}
                />
              </div>

              {(showRunnerLabel || showStepCount) && (
                <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 pt-1.5 border-t border-neutral-200 dark:border-neutral-800">
                  {showRunnerLabel && (
                    <span className="truncate max-w-[110px]">
                      {node.job.runner
                        ? node.job.runner.toUpperCase()
                        : "UBUNTU-LATEST"}
                    </span>
                  )}
                  {showStepCount && (
                    <span className="font-bold ml-auto">
                      {stepCount} {stepCount === 1 ? "STEP" : "STEPS"}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
