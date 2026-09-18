import React, { useRef, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";

interface YamlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onParse: (content: string) => void;
  onReset: () => void;
}

export const YamlEditor: React.FC<YamlEditorProps> = ({
  value,
  onChange,
  onParse,
  onReset,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value;
    }
  }, [value]);

  const handleAnalyze = () => {
    const directContent = textareaRef.current
      ? textareaRef.current.value
      : value;
    onChange(directContent);
    onParse(directContent);
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-[11px] border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-[#14161a]">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            Workflow Spec Editor
          </span>
          <span className="text-[10px] text-neutral-400">
            (.github/workflows/deploy.yml)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors tracking-wider cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>ANALYZE</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full min-h-0">
        <textarea
          ref={textareaRef}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full h-full p-4 bg-white dark:bg-[#0c0d0e] text-neutral-900 dark:text-neutral-100 font-mono text-xs leading-relaxed resize-none focus:outline-none border-none selection:bg-blue-600 selection:text-white"
          placeholder="# Paste your GitHub Actions workflow YAML here..."
        />
      </div>
    </div>
  );
};
