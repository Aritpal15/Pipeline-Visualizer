import { PlatformType, WorkflowDefinition } from "@pipeline-visualizer/core-model";

export type DiagnosticSeverity = "error" | "warning" | "observation";

export interface AdapterDiagnostic {
  ruleId: string;
  severity: DiagnosticSeverity;
  message: string;
  affectedJobId?: string;
  line?: number;
  column?: number;
}

export interface ParseResult {
  success: boolean;
  workflow?: WorkflowDefinition;
  diagnostics: AdapterDiagnostic[];
}

export interface PipelineAdapter {
  readonly platform: PlatformType;
  supports(filename: string, content: string): boolean;
  parse(content: string, filename?: string): Promise<ParseResult> | ParseResult;
}
