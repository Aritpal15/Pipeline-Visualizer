export type ActiveTab =
  | "GRAPH"
  | "TIMELINE"
  | "PROBLEMS"
  | "EDITOR"
  | "EXAMPLES"
  | "SETTINGS";
export type ThemeMode = "light" | "dark";

export interface TopologyMeta {
  type: string;
  totalJobs: number;
  fanOut: string[];
  fanIn: string[];
}
