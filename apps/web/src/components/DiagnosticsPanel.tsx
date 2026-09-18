import React from "react";
import { AdapterDiagnostic } from "@pipeline-visualizer/adapter-shared";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface DiagnosticsPanelProps {
  diagnostics: AdapterDiagnostic[];
  isCustomSpec: boolean;
  onGoToEditor: () => void;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  diagnostics,
  isCustomSpec,
  onGoToEditor,
}) => {
  const errors = diagnostics.filter((d) => d.severity === "error");
  const warnings = diagnostics.filter((d) => d.severity === "warning");
  const hasIssues = diagnostics.length > 0;

  return (
    <div className="w-full h-full flex flex-col font-mono text-xs select-none space-y-4">
      {/* Source Scope Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215]">
        <div className="flex items-center gap-3">
          <span className="font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Diagnostics & Integrity Engine
          </span>
          <span className="text-neutral-400">|</span>
          <span className="text-neutral-500">TARGET:</span>
          <span
            className={`font-bold px-1.5 py-0.5 text-[10px] ${
              isCustomSpec
                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {isCustomSpec ? "CUSTOM USER WORKFLOW" : "BUNDLED EXAMPLE WORKFLOW"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
            <XCircle className="w-3.5 h-3.5" />
            {errors.length} {errors.length === 1 ? "ERROR" : "ERRORS"}
          </span>
          <span className="text-neutral-400">/</span>
          <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            {warnings.length} {warnings.length === 1 ? "WARNING" : "WARNINGS"}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {!hasIssues ? (
        /* Clean State Card */
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] p-8 flex flex-col items-center justify-center text-center space-y-4 flex-1">
          <div className="w-12 h-12 rounded-none bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
              Zero Integrity Faults Detected
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-md">
              {isCustomSpec
                ? "Your custom YAML parsed cleanly through the GitHub Actions AST adapter. All jobs, runner keys, and dependency references are topologically valid."
                : "The bundled reference workflow is valid. No orphan nodes, cyclic references, or syntax violations exist in this specification."}
            </p>
          </div>

          {/* Validation Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-[10px] text-left pt-2">
            <div className="border border-neutral-200 dark:border-neutral-800 p-2.5 bg-neutral-50/50 dark:bg-[#15171c]">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AST SYNTAX</span>
              </div>
              <span className="text-neutral-500">
                Valid YAML grammar and jobs mapping structure.
              </span>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 p-2.5 bg-neutral-50/50 dark:bg-[#15171c]">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>DAG TOPOLOGY</span>
              </div>
              <span className="text-neutral-500">
                Strict acyclic graph with resolvable dependencies.
              </span>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 p-2.5 bg-neutral-50/50 dark:bg-[#15171c]">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>EXECUTION SPEC</span>
              </div>
              <span className="text-neutral-500">
                Runner platforms and step actions validated.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Issues List Table */
        <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50 dark:bg-[#16181d] border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-600 dark:text-neutral-400">
              Active Fault Ledger ({diagnostics.length})
            </span>
            <button
              onClick={onGoToEditor}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Jump to Editor to Fix</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800">
            {diagnostics.map((diag, index) => {
              const isErr = diag.severity === "error";
              return (
                <div
                  key={index}
                  className="p-3 flex items-start justify-between gap-4 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border flex-shrink-0 mt-0.5 ${
                        isErr
                          ? "border-red-600 text-red-600 bg-red-50 dark:bg-red-950/40"
                          : "border-amber-600 text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                      }`}
                    >
                      {isErr ? "CRITICAL ERROR" : "WARNING"}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {diag.ruleId || "AST-VALIDATOR"}
                        </span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-[11px]">
                        {diag.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onGoToEditor}
                    className="p-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#181a20] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex-shrink-0"
                    title="Open in YAML Editor"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
