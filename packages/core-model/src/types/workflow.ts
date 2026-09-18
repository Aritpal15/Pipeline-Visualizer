export type PlatformType =
  | "github-actions"
  | "gitlab-ci"
  | "jenkins"
  | "azure-pipelines"
  | "circleci"
  | "bitbucket-pipelines";

export type JobStatus =
  | "neutral"
  | "selected"
  | "waiting"
  | "running"
  | "success"
  | "failure"
  | "warning";

export interface StepDefinition {
  id?: string;
  name: string;
  run?: string;
  uses?: string;
  with?: Record<string, unknown>;
}

export interface JobDefinition {
  id: string;
  displayName: string;
  dependencies: string[];
  steps: StepDefinition[];
  condition?: string;
  environment?: string;
  runner?: string;
  matrix?: {
    totalCombinations: number;
    matrixKeys: string[];
  };
  metadata?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  schemaVersion: string;
  platform: PlatformType;
  name: string;
  path?: string;
  branch?: string;
  triggers: string[];
  jobs: Record<string, JobDefinition>;
  metadata?: Record<string, unknown>;
}
