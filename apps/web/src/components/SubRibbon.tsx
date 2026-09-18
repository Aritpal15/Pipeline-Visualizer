import React from "react";

interface SubRibbonProps {
  jobCount: number;
  fanOutSummary?: string;
  fanInSummary?: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export const SubRibbon: React.FC<SubRibbonProps> = ({
  jobCount,
  fanOutSummary = "None",
  fanInSummary = "None",
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  return (
    <section className="w-full bg-neutral-100 dark:bg-[#16181d] border-b border-neutral-300 dark:border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 select-none">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-neutral-900 dark:text-neutral-200">
            TOPOLOGY:
          </span>
          <span className="text-neutral-700 dark:text-neutral-300">
            STRICT DAG
          </span>
        </div>

        <span className="text-neutral-300 dark:text-neutral-700">|</span>

        <div>
          <span className="font-bold text-neutral-900 dark:text-neutral-200">
            {jobCount}
          </span>{" "}
          JOBS
        </div>

        {fanOutSummary !== "None" && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">
              |
            </span>
            <div className="hidden sm:inline">
              <span className="text-neutral-400">FAN-OUT </span>
              <span className="text-neutral-700 dark:text-neutral-300">
                [{fanOutSummary}]
              </span>
            </div>
          </>
        )}

        {fanInSummary !== "None" && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700 hidden md:inline">
              |
            </span>
            <div className="hidden md:inline">
              <span className="text-neutral-400">FAN-IN </span>
              <span className="text-neutral-700 dark:text-neutral-300">
                [{fanInSummary}]
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#111215]">
          <span className="px-2 py-0.5 text-[10px] text-neutral-500 uppercase">
            ZOOM:
          </span>
          <button
            onClick={onZoomOut}
            className="px-2 py-0.5 border-l border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Zoom out"
          >
            -
          </button>
          <span className="px-2 py-0.5 text-[10px] font-bold text-neutral-800 dark:text-neutral-200 border-l border-neutral-300 dark:border-neutral-700 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="px-2 py-0.5 border-l border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Zoom in"
          >
            +
          </button>
        </div>

        <button
          onClick={onZoomReset}
          className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#111215] px-2 py-0.5 text-[10px] uppercase font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
        >
          RESET
        </button>
      </div>
    </section>
  );
};
