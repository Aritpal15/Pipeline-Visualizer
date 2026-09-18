import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkflowDefinition } from '@pipeline-visualizer/core-model';
import { GitHubActionsAdapter } from '@pipeline-visualizer/adapter-github-actions';
import { AdapterDiagnostic } from '@pipeline-visualizer/adapter-shared';
import { TechnicalNavbar } from './components/TechnicalNavbar';
import { SubRibbon } from './components/SubRibbon';
import { IndustrialGraphCanvas } from './components/IndustrialGraphCanvas';
import { TimelineView } from './components/TimelineView';
import { TechnicalJobSpecInspector } from './components/TechnicalJobSpecInspector';
import { YamlEditor } from './components/YamlEditor';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { TechnicalFooter } from './components/TechnicalFooter';
import { ExamplesGallery } from './components/ExamplesGallery';
import { SettingsPanel } from './components/SettingsPanel';
import { DEFAULT_WORKFLOW_YAML } from './samples/default-workflow';
import { ActiveTab, ThemeMode } from './types';
import { validateWorkflowIntegrity } from './utils/workflowValidator';
import { EdgeRoutingStyle, LayoutOptions } from './utils/dagLayoutEngine';

export const App: React.FC = () => {
  const [yamlContent, setYamlContent] = useState<string>(DEFAULT_WORKFLOW_YAML);
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [diagnostics, setDiagnostics] = useState<AdapterDiagnostic[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("GRAPH");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [zoom, setZoom] = useState<number>(1.0);
  const [tracePath, setTracePath] = useState<boolean>(true);

  // Settings State
  const [routingStyle, setRoutingStyle] =
    useState<EdgeRoutingStyle>("orthogonal");
  const [colGap, setColGap] = useState<number>(72);
  const [rowGap, setRowGap] = useState<number>(40);
  const [showStepCount, setShowStepCount] = useState<boolean>(true);
  const [showRunnerLabel, setShowRunnerLabel] = useState<boolean>(true);
  const [showGhostNodes, setShowGhostNodes] = useState<boolean>(true);

  const layoutOptions = useMemo<LayoutOptions>(
    () => ({
      routingStyle,
      colGap,
      rowGap,
      showGhostNodes,
    }),
    [routingStyle, colGap, rowGap, showGhostNodes],
  );

  const adapter = useMemo(() => new GitHubActionsAdapter(), []);

  const isCustomSpec = useMemo(() => {
    return (
      yamlContent.trim().replace(/\r\n/g, "\n") !==
      DEFAULT_WORKFLOW_YAML.trim().replace(/\r\n/g, "\n")
    );
  }, [yamlContent]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const processWorkflow = useCallback(
    (content: string) => {
      try {
        const result = adapter.parse(content);

        if (!("workflow" in result)) {
          setWorkflow(null);
          setDiagnostics(
            (result.diagnostics || []).map((diagnostic) => ({
              ...diagnostic,
              severity:
                diagnostic.severity === "info"
                  ? "warning"
                  : diagnostic.severity,
            })),
          );
          setSelectedJobId(null);
          return;
        }

        const semanticErrors = validateWorkflowIntegrity(result.workflow);
        const allDiagnostics = [
          ...(result.diagnostics || []).map((diagnostic) => ({
            ...diagnostic,
            severity:
              diagnostic.severity === "info" ? "warning" : diagnostic.severity,
          })),
          ...semanticErrors,
        ];

        setWorkflow(result.workflow);
        setDiagnostics(allDiagnostics);

        if (result.workflow && Object.keys(result.workflow.jobs).length > 0) {
          const jobKeys = Object.keys(result.workflow.jobs);
          setSelectedJobId((currentId) => {
            if (currentId && result.workflow.jobs[currentId]) {
              return currentId;
            }
            return jobKeys[jobKeys.length - 1];
          });
        } else {
          setSelectedJobId(null);
        }
      } catch (err) {
        setDiagnostics([
          {
            severity: "error",
            ruleId: "PARSE_ERR",
            message:
              err instanceof Error ? err.message : "Unknown parsing error",
          },
        ]);
      }
    },
    [adapter],
  );

  useEffect(() => {
    processWorkflow(DEFAULT_WORKFLOW_YAML);
  }, [processWorkflow]);

  const { fanOutSummary, fanInSummary, jobCount } = useMemo(() => {
    if (!workflow) {
      return { fanOutSummary: "None", fanInSummary: "None", jobCount: 0 };
    }

    const jobs = Object.values(workflow.jobs);
    const dependentsMap: Record<string, string[]> = {};

    jobs.forEach((j) => {
      j.dependencies.forEach((dep) => {
        if (!dependentsMap[dep]) dependentsMap[dep] = [];
        dependentsMap[dep].push(j.id);
      });
    });

    const fanOutSources = Object.entries(dependentsMap).filter(
      ([, targets]) => targets.length > 1,
    );
    const fanInTargets = jobs.filter((j) => j.dependencies.length > 1);

    const fOut =
      fanOutSources.length > 0
        ? `${fanOutSources[0][0]} → [${fanOutSources[0][1].join(", ")}]`
        : "None";

    const fIn =
      fanInTargets.length > 0
        ? `[${fanInTargets[0].dependencies.join(", ")}] → ${fanInTargets[0].id}`
        : "None";

    return {
      fanOutSummary: fOut,
      fanInSummary: fIn,
      jobCount: jobs.length,
    };
  }, [workflow]);

  const selectedJob =
    workflow && selectedJobId ? workflow.jobs[selectedJobId] || null : null;
  const hasErrors = diagnostics.some((d) => d.severity === "error");
  const hasCycles = diagnostics.some((d) => d.ruleId === "GHA-CYCLE-DETECTED");

  return (
    <div className="h-screen w-screen bg-[#f5f5f5] dark:bg-[#0c0d0e] text-neutral-900 dark:text-neutral-100 flex flex-col font-mono selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Top Navbar */}
      <TechnicalNavbar
        workflowPath=".github/workflows/deploy.yml"
        branch="main"
        syntaxValid={!hasErrors}
        pinVersion="v4.1.0"
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        problemCount={diagnostics.length}
        theme={theme}
        onToggleTheme={setTheme}
        tracePath={tracePath}
        onToggleTracePath={() => setTracePath((prev) => !prev)}
        isCustomSpec={isCustomSpec}
      />

      {/* Sub-Ribbon */}
      <SubRibbon
        jobCount={jobCount}
        fanOutSummary={fanOutSummary}
        fanInSummary={fanInSummary}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(1.8, +(z + 0.1).toFixed(1)))}
        onZoomOut={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(1)))}
        onZoomReset={() => setZoom(1.0)}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* GRAPH TAB */}
        {activeTab === "GRAPH" && (
          <div className="flex-1 flex flex-row h-full w-full min-w-0 overflow-hidden">
            <div className="flex-1 h-full min-w-0 overflow-auto bg-[#f5f5f5] dark:bg-[#0c0d0e]">
              <IndustrialGraphCanvas
                workflow={workflow}
                selectedJobId={selectedJobId}
                onSelectJob={setSelectedJobId}
                zoom={zoom}
                tracePath={tracePath}
                onGoToEditor={() => setActiveTab("EDITOR")}
                layoutOptions={layoutOptions}
                showStepCount={showStepCount}
                showRunnerLabel={showRunnerLabel}
              />
            </div>

            {selectedJob && (
              <aside className="w-96 h-full flex-shrink-0 border-l border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xl z-20 overflow-y-auto">
                <TechnicalJobSpecInspector
                  job={selectedJob}
                  allJobs={workflow?.jobs || {}}
                  onClose={() => setSelectedJobId(null)}
                />
              </aside>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "TIMELINE" && (
          <div className="flex-1 flex flex-row h-full w-full min-w-0 overflow-hidden">
            <div className="flex-1 h-full min-w-0 overflow-auto bg-[#f5f5f5] dark:bg-[#0c0d0e]">
              <TimelineView
                workflow={workflow}
                selectedJobId={selectedJobId}
                onSelectJob={setSelectedJobId}
              />
            </div>

            {selectedJob && (
              <aside className="w-96 h-full flex-shrink-0 border-l border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#111215] shadow-2xl z-20 overflow-y-auto">
                <TechnicalJobSpecInspector
                  job={selectedJob}
                  allJobs={workflow?.jobs || {}}
                  onClose={() => setSelectedJobId(null)}
                />
              </aside>
            )}
          </div>
        )}

        {/* YAML EDITOR TAB */}
        {activeTab === "EDITOR" && (
          <div className="flex-1 h-full p-4 overflow-auto">
            <YamlEditor
              value={yamlContent}
              onChange={setYamlContent}
              onParse={(liveContent: string) => {
                setYamlContent(liveContent);
                processWorkflow(liveContent);
                setActiveTab("GRAPH");
              }}
              onReset={() => {
                setYamlContent(DEFAULT_WORKFLOW_YAML);
                processWorkflow(DEFAULT_WORKFLOW_YAML);
              }}
            />
          </div>
        )}

        {/* PROBLEMS TAB */}
        {activeTab === "PROBLEMS" && (
          <div className="flex-1 h-full p-4 overflow-auto">
            <DiagnosticsPanel
              diagnostics={diagnostics}
              isCustomSpec={isCustomSpec}
              onGoToEditor={() => setActiveTab("EDITOR")}
            />
          </div>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === "EXAMPLES" && (
          <div className="flex-1 h-full overflow-auto">
            <ExamplesGallery
              onSelectPreset={(preset) => {
                setYamlContent(preset.yaml);
                processWorkflow(preset.yaml);
                setActiveTab("GRAPH");
              }}
            />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "SETTINGS" && (
          <div className="flex-1 h-full overflow-auto">
            <SettingsPanel
              routingStyle={routingStyle}
              onChangeRoutingStyle={setRoutingStyle}
              colGap={colGap}
              onChangeColGap={setColGap}
              rowGap={rowGap}
              onChangeRowGap={setRowGap}
              showStepCount={showStepCount}
              onToggleStepCount={() => setShowStepCount((prev) => !prev)}
              showRunnerLabel={showRunnerLabel}
              onToggleRunnerLabel={() => setShowRunnerLabel((prev) => !prev)}
              showGhostNodes={showGhostNodes}
              onToggleGhostNodes={() => setShowGhostNodes((prev) => !prev)}
              workflow={workflow}
              rawYaml={yamlContent}
            />
          </div>
        )}
      </main>

      {/* Command Status Footer */}
      <TechnicalFooter hasCycles={hasCycles} />
    </div>
  );
};

export default App;
