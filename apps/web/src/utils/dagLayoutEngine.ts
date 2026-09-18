import {
  WorkflowDefinition,
  JobDefinition,
} from "@pipeline-visualizer/core-model";

export type EdgeRoutingStyle = "orthogonal" | "bezier" | "straight";

export interface LayoutOptions {
  routingStyle: EdgeRoutingStyle;
  colGap: number;
  rowGap: number;
  showGhostNodes: boolean;
}

export interface LayoutNode {
  id: string;
  job: JobDefinition;
  x: number;
  y: number;
  width: number;
  height: number;
  stageIndex: number;
  isGhost?: boolean;
}

export interface LayoutEdge {
  fromId: string;
  toId: string;
  path: string;
  isHighlighted: boolean;
  isGhostEdge?: boolean;
}

export interface DagLayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  canvasWidth: number;
  canvasHeight: number;
  hasCycle: boolean;
  cycleNodes: string[];
}

const NODE_WIDTH = 210;
const NODE_HEIGHT = 80;
const PADDING_X = 64;
const PADDING_Y = 64;

export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  routingStyle: "orthogonal",
  colGap: 72,
  rowGap: 40,
  showGhostNodes: true,
};

export function computeDagLayout(
  workflow: WorkflowDefinition | null,
  selectedJobId: string | null,
  tracePath: boolean,
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
): DagLayoutResult {
  if (!workflow || !workflow.jobs || Object.keys(workflow.jobs).length === 0) {
    return {
      nodes: [],
      edges: [],
      canvasWidth: 800,
      canvasHeight: 500,
      hasCycle: false,
      cycleNodes: [],
    };
  }

  const jobMap: Record<string, JobDefinition> = {};
  const ghostNodes = new Set<string>();

  for (const [id, job] of Object.entries(workflow.jobs)) {
    jobMap[id] = { ...job };
    if (options.showGhostNodes) {
      for (const dep of job.dependencies || []) {
        if (!workflow.jobs[dep]) {
          ghostNodes.add(dep);
        }
      }
    }
  }

  if (options.showGhostNodes) {
    ghostNodes.forEach((ghostId) => {
      jobMap[ghostId] = {
        id: ghostId,
        displayName: ghostId,
        dependencies: [],
        steps: [],
        runner: "UNDEFINED",
      };
    });
  }

  const allJobIds = Object.keys(jobMap);

  // Kahn's algorithm for cycle detection
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  allJobIds.forEach((id) => {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  });

  allJobIds.forEach((id) => {
    const deps = (jobMap[id].dependencies || []).filter((d) => jobMap[d]);
    deps.forEach((dep) => {
      adjacency.get(dep)?.push(id);
      inDegree.set(id, (inDegree.get(id) || 0) + 1);
    });
  });

  const queue: string[] = [];
  allJobIds.forEach((id) => {
    if ((inDegree.get(id) || 0) === 0) {
      queue.push(id);
    }
  });

  let processedCount = 0;
  const topoOrder: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    topoOrder.push(curr);
    processedCount++;

    for (const neighbor of adjacency.get(curr) || []) {
      const nextDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, nextDegree);
      if (nextDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  const hasCycle = processedCount < allJobIds.length;
  const cycleNodes = hasCycle
    ? allJobIds.filter((id) => (inDegree.get(id) || 0) > 0)
    : [];

  if (hasCycle) {
    return {
      nodes: [],
      edges: [],
      canvasWidth: 800,
      canvasHeight: 500,
      hasCycle: true,
      cycleNodes,
    };
  }

  // Assign stages
  const stages = new Map<string, number>();
  topoOrder.forEach((id) => {
    const deps = (jobMap[id].dependencies || []).filter((d) => jobMap[d]);
    if (deps.length === 0) {
      stages.set(id, 0);
    } else {
      const maxParentStage = Math.max(...deps.map((d) => stages.get(d) ?? 0));
      stages.set(id, maxParentStage + 1);
    }
  });

  const maxStage = Math.max(0, ...Array.from(stages.values()));
  const stageColumns: string[][] = Array.from(
    { length: maxStage + 1 },
    () => [],
  );

  allJobIds.forEach((id) => {
    const s = stages.get(id) || 0;
    stageColumns[s].push(id);
  });

  const maxRows = Math.max(...stageColumns.map((col) => col.length), 1);
  const totalStages = maxStage + 1;

  const canvasWidth = Math.max(
    950,
    PADDING_X * 2 +
      totalStages * NODE_WIDTH +
      Math.max(0, totalStages - 1) * options.colGap,
  );
  const canvasHeight = Math.max(
    560,
    PADDING_Y * 2 +
      maxRows * NODE_HEIGHT +
      Math.max(0, maxRows - 1) * options.rowGap,
  );

  const layoutMap = new Map<string, LayoutNode>();
  const layoutNodes: LayoutNode[] = [];

  stageColumns.forEach((colJobIds, colIdx) => {
    const columnHeight =
      colJobIds.length * NODE_HEIGHT +
      Math.max(0, colJobIds.length - 1) * options.rowGap;
    const startY = (canvasHeight - columnHeight) / 2;

    colJobIds.forEach((jobId, rowIdx) => {
      const x = PADDING_X + colIdx * (NODE_WIDTH + options.colGap);
      const y = startY + rowIdx * (NODE_HEIGHT + options.rowGap);
      const isGhost = ghostNodes.has(jobId);

      const node: LayoutNode = {
        id: jobId,
        job: jobMap[jobId],
        x,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        stageIndex: colIdx,
        isGhost,
      };

      layoutMap.set(jobId, node);
      layoutNodes.push(node);
    });
  });

  // Generate paths based on routing style
  const layoutEdges: LayoutEdge[] = [];

  layoutNodes.forEach((targetNode) => {
    const deps = (targetNode.job.dependencies || []).filter((d) =>
      layoutMap.has(d),
    );
    deps.forEach((depId, depIdx) => {
      const sourceNode = layoutMap.get(depId);
      if (!sourceNode) return;

      const startX = sourceNode.x + sourceNode.width;
      const startY = sourceNode.y + sourceNode.height / 2;
      const endX = targetNode.x;
      const endY = targetNode.y + targetNode.height / 2;

      let path = "";
      if (options.routingStyle === "bezier") {
        const dx = Math.max((endX - startX) * 0.5, 30);
        path = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
      } else if (options.routingStyle === "straight") {
        path = `M ${startX} ${startY} L ${endX} ${endY}`;
      } else {
        // Orthogonal (stepped)
        const stepOffset =
          deps.length > 1 ? (depIdx - (deps.length - 1) / 2) * 10 : 0;
        const midX = startX + (endX - startX) / 2 + stepOffset;
        path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
      }

      const isHighlighted =
        tracePath &&
        (selectedJobId === targetNode.id || selectedJobId === sourceNode.id);

      layoutEdges.push({
        fromId: sourceNode.id,
        toId: targetNode.id,
        path,
        isHighlighted,
        isGhostEdge: sourceNode.isGhost,
      });
    });
  });

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    canvasWidth,
    canvasHeight,
    hasCycle: false,
    cycleNodes,
  };
}
