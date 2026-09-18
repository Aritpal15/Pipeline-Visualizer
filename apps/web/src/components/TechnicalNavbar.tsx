import React from "react";
import { ActiveTab, ThemeMode } from "../types.js";

interface TechnicalNavbarProps {
  workflowPath: string;
  branch: string;
  syntaxValid: boolean;
  pinVersion: string;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  problemCount: number;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  tracePath: boolean;
  onToggleTracePath: () => void;
  isCustomSpec: boolean;
}

export const TechnicalNavbar: React.FC<TechnicalNavbarProps> = ({
  workflowPath,
  branch,
  syntaxValid,
  pinVersion,
  activeTab,
  onSelectTab,
  problemCount,
  theme,
  onToggleTheme,
  tracePath,
  onToggleTracePath,
  isCustomSpec,
}) => {
  const tabs: ActiveTab[] = [
    "GRAPH",
    "TIMELINE",
    "PROBLEMS",
    "EDITOR",
    "EXAMPLES",
    "SETTINGS",
  ];

  return (
    <header className="w-full border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] text-[11px] font-mono select-none">
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 gap-2 border-b border-neutral-200 dark:border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black tracking-tight text-xs">
            <span className="w-2.5 h-2.5 bg-black dark:bg-white inline-block"></span>
            <span className="tracking-widest uppercase">
              Pipeline Visualizer
            </span>
          </div>

          <span className="text-neutral-400">|</span>

          <div className="flex items-center gap-2">
            <span className="text-neutral-700 dark:text-neutral-300 font-bold">
              {workflowPath}
            </span>
            <button
              onClick={() => onSelectTab("EDITOR")}
              className={`border px-1.5 py-0.5 text-[9px] font-bold tracking-wider transition-colors ${
                isCustomSpec
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                  : "border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
              }`}
              title="Click to edit workflow YAML"
            >
              {isCustomSpec ? "[CUSTOM SPEC]" : "[EXAMPLE SPEC]"}
            </button>
            <span className="text-neutral-400">/</span>
            <div className="border border-neutral-400 dark:border-neutral-700 px-1.5 py-0.5 leading-none text-[10px]">
              <span className="text-neutral-400">branch: </span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {branch}
              </span>
            </div>
          </div>

          <div
            className={`border px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
              syntaxValid
                ? "border-emerald-600/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-red-600/60 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 ${syntaxValid ? "bg-emerald-500" : "bg-red-500"}`}
            ></span>
            <span>{syntaxValid ? "VALID SYNTAX" : "SYNTAX ERROR"}</span>
          </div>

          <div className="border border-rose-500/60 bg-rose-500/10 text-rose-500 px-1.5 py-0.5 text-[10px] font-bold">
            PIN: {pinVersion}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-neutral-300 dark:border-neutral-700">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onSelectTab(tab)}
                  className={`px-2.5 py-1 text-[10px] font-bold tracking-wider border-r last:border-r-0 border-neutral-300 dark:border-neutral-700 uppercase transition-colors ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {tab}
                  {tab === "PROBLEMS" && problemCount > 0 && (
                    <span
                      className={`ml-1 px-1 py-0.2 text-[9px] ${
                        isActive
                          ? "bg-red-500 text-white"
                          : "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black"
                      }`}
                    >
                      {problemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center border border-neutral-300 dark:border-neutral-700">
            <button
              onClick={() => onToggleTheme("light")}
              className={`px-2 py-1 text-[10px] font-bold border-r border-neutral-300 dark:border-neutral-700 ${
                theme === "light"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              ■ LIGHT
            </button>
            <button
              onClick={() => onToggleTheme("dark")}
              className={`px-2 py-1 text-[10px] font-bold ${
                theme === "dark"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              ■ DARK
            </button>
          </div>

          <button
            onClick={onToggleTracePath}
            className={`border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-[10px] font-bold flex items-center gap-1.5 uppercase ${
              tracePath
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 ${tracePath ? "bg-white" : "bg-blue-500"}`}
            ></span>
            TRACE PATH
          </button>
        </div>
      </div>
    </header>
  );
};
