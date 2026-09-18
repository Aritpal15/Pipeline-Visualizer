import React from "react";

interface TechnicalFooterProps {
  hasCycles?: boolean;
}

export const TechnicalFooter: React.FC<TechnicalFooterProps> = ({
  hasCycles = false,
}) => {
  return (
    <footer className="w-full border-t border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono select-none">
      <div className="flex flex-wrap items-center gap-4 text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 inline-block" />
          <span className="font-bold tracking-wider uppercase">SUCCESS</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-blue-600 inline-block" />
          <span className="font-bold tracking-wider uppercase">
            SELECTED / FOCUS
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-amber-500 inline-block" />
          <span className="font-bold tracking-wider uppercase">
            WAITING / GATED
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-rose-500 inline-block" />
          <span className="font-bold tracking-wider uppercase">FAILURE</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-pink-500 inline-block" />
          <span className="font-bold tracking-wider uppercase">
            SECONDARY ACCENT
          </span>
        </div>
      </div>

      <div className="text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
        PARSER: STRICT AST // {hasCycles ? "CYCLE DETECTED" : "ZERO CYCLES"}
      </div>
    </footer>
  );
};
