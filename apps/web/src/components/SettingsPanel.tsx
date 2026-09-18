import React, { useState } from "react";
import { EdgeRoutingStyle } from "../utils/dagLayoutEngine.js";
import { WorkflowDefinition } from "@pipeline-visualizer/core-model";
import {
  Sliders,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import * as graphExporter from "../utils/graphExporter.js";

const callGraphExporter = (
  names: string[],
  workflow: WorkflowDefinition | null,
  options: { routingStyle: EdgeRoutingStyle; colGap: number; rowGap: number },
) => {
  const exporters = graphExporter as Record<string, unknown>;
  const exporter = names
    .map((name) => exporters[name])
    .find(
      (candidate): candidate is (...args: unknown[]) => void =>
        typeof candidate === "function",
    );

  exporter?.(workflow, options);
};

const exportGraphAsSvg = (
  workflow: WorkflowDefinition | null,
  options: { routingStyle: EdgeRoutingStyle; colGap: number; rowGap: number },
) => callGraphExporter(["exportGraphAsSvg", "exportSvg"], workflow, options);

const exportGraphAsPng = (
  workflow: WorkflowDefinition | null,
  options: { routingStyle: EdgeRoutingStyle; colGap: number; rowGap: number },
) => callGraphExporter(["exportGraphAsPng", "exportPng"], workflow, options);

interface SettingsPanelProps {
  routingStyle: EdgeRoutingStyle;
  onChangeRoutingStyle: (style: EdgeRoutingStyle) => void;
  colGap: number;
  onChangeColGap: (gap: number) => void;
  rowGap: number;
  onChangeRowGap: (gap: number) => void;
  showStepCount: boolean;
  onToggleStepCount: () => void;
  showRunnerLabel: boolean;
  onToggleRunnerLabel: () => void;
  showGhostNodes: boolean;
  onToggleGhostNodes: () => void;
  workflow: WorkflowDefinition | null;
  rawYaml: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  routingStyle,
  onChangeRoutingStyle,
  colGap,
  onChangeColGap,
  rowGap,
  onChangeRowGap,
  showStepCount,
  onToggleStepCount,
  showRunnerLabel,
  onToggleRunnerLabel,
  showGhostNodes,
  onToggleGhostNodes,
  workflow,
  rawYaml,
}) => {
  const [copiedAst, setCopiedAst] = useState(false);

  const handleCopyAst = () => {
    if (!workflow) return;
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
    setCopiedAst(true);
    setTimeout(() => setCopiedAst(false), 2000);
  };

  const handleExportYaml = () => {
    const blob = new Blob([rawYaml], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workflow.yml";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full p-8 bg-[#f5f5f5] dark:bg-[#0c0d0e] font-mono text-[11px] overflow-auto select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Engine Configuration & Visual Parameters
            </h2>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
            Tune DAG layout geometry, connector routing, node density, and
            export pipeline specifications.
          </p>
        </div>

        {/* Section 1: Edge Routing Engine */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] p-5 space-y-4 shadow-sm">
          <div className="font-bold text-xs uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 pb-2 text-neutral-900 dark:text-neutral-100">
            Edge Routing Algorithm
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["orthogonal", "bezier", "straight"] as EdgeRoutingStyle[]).map(
              (style) => (
                <button
                  key={style}
                  onClick={() => onChangeRoutingStyle(style)}
                  className={`py-2 px-3 border text-left font-bold uppercase text-[10px] tracking-wider transition-colors ${
                    routingStyle === style
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                      : "border-neutral-300 dark:border-neutral-800 hover:border-neutral-500 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <div className="text-[11px]">{style}</div>
                  <div className="text-[9px] font-normal text-neutral-400 lowercase mt-0.5">
                    {style === "orthogonal" && "stepped 90° lines"}
                    {style === "bezier" && "smooth cubic curves"}
                    {style === "straight" && "direct vectors"}
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Section 2: Canvas Geometry & Spacing */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] p-5 space-y-4 shadow-sm">
          <div className="font-bold text-xs uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 pb-2 text-neutral-900 dark:text-neutral-100">
            Layout Geometry & Spacing
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                <span>STAGE GAP (COLUMNS):</span>
                <span className="font-bold">{colGap}px</span>
              </div>
              <input
                type="range"
                min="48"
                max="130"
                step="4"
                value={colGap}
                onChange={(e) => onChangeColGap(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                <span>LANE GAP (ROWS):</span>
                <span className="font-bold">{rowGap}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="80"
                step="4"
                value={rowGap}
                onChange={(e) => onChangeRowGap(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Display Elements */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] p-5 space-y-3 shadow-sm">
          <div className="font-bold text-xs uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 pb-2 text-neutral-900 dark:text-neutral-100">
            Node Metadata & Integrity Display
          </div>
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showStepCount}
                onChange={onToggleStepCount}
                className="accent-blue-600 rounded-none w-4 h-4"
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                Show Step Execution Counters (`X STEPS`)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showRunnerLabel}
                onChange={onToggleRunnerLabel}
                className="accent-blue-600 rounded-none w-4 h-4"
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                Show Runner Environment Tags (`UBUNTU-LATEST`, etc.)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showGhostNodes}
                onChange={onToggleGhostNodes}
                className="accent-blue-600 rounded-none w-4 h-4"
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                Synthesize Phantom Nodes for Undefined Dependencies
              </span>
            </label>
          </div>
        </div>

        {/* Section 4: Data & Schema Export */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] p-5 space-y-4 shadow-sm">
          <div className="font-bold text-xs uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 pb-2 text-neutral-900 dark:text-neutral-100">
            Pipeline Export Tools
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyAst}
              disabled={!workflow}
              className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-bold uppercase text-[10px] tracking-wider transition-colors disabled:opacity-40"
            >
              {copiedAst ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {copiedAst ? "COPIED AST JSON" : "COPY NORMALIZED AST"}
              </span>
            </button>

            <button
              onClick={handleExportYaml}
              className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-bold uppercase text-[10px] tracking-wider transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD YAML WORKFLOW</span>
            </button>

            <button
              onClick={() =>
                exportGraphAsSvg(workflow, { routingStyle, colGap, rowGap })
              }
              disabled={!workflow}
              className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-bold uppercase text-[10px] tracking-wider transition-colors disabled:opacity-40"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>EXPORT GRAPH AS SVG</span>
            </button>

            <button
              onClick={() =>
                exportGraphAsPng(workflow, { routingStyle, colGap, rowGap })
              }
              disabled={!workflow}
              className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-bold uppercase text-[10px] tracking-wider transition-colors disabled:opacity-40"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>EXPORT GRAPH AS PNG (2X)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
