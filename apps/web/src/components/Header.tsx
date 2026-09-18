import React from "react";
import { Workflow, Layers } from "lucide-react";

interface HeaderProps {
  pipelineCount?: number;
  hasErrors?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pipelineCount = 1,
  hasErrors = false,
}) => {
  return (
    <header className="w-full bg-neo-yellow neo-box p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-neo-black p-2 text-white border-2 border-neo-black shadow-[2px_2px_0px_0px_#ffffff]">
          <Workflow className="w-7 h-7 text-neo-yellow" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider">
            Pipeline Visualizer
          </h1>
          <p className="text-xs font-bold uppercase tracking-tight text-neutral-800">
            Declarative CI/CD DAG Analyzer & Renderer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-white neo-box px-3 py-1.5 flex items-center gap-2 text-sm font-bold">
          <Layers className="w-4 h-4" />
          <span>Workflows: {pipelineCount}</span>
        </div>
        <div
          className={`px-3 py-1.5 border-2 border-neo-black shadow-[2px_2px_0px_0px_#121212] text-xs font-black uppercase tracking-wider ${
            hasErrors ? "bg-neo-pink text-white" : "bg-neo-green text-neo-black"
          }`}
        >
          {hasErrors ? "Status: Issues Detected" : "Status: Ready"}
        </div>
      </div>
    </header>
  );
};
