import { WorkflowDefinition } from "@pipeline-visualizer/core-model";
import {
  computeDagLayout,
  EdgeRoutingStyle,
  LayoutEdge,
  LayoutNode,
} from "./dagLayoutEngine.js";

interface ExportOptions {
  routingStyle?: EdgeRoutingStyle;
  colGap?: number;
  rowGap?: number;
  theme?: "dark" | "light";
  /** Minimum canvas size — content gets centered inside this if it's smaller */
  minWidth?: number;
  minHeight?: number;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

function buildSvgMarkup(
  workflow: WorkflowDefinition,
  options: ExportOptions = {},
): string {
  const {
    routingStyle = "orthogonal",
    colGap = 96,
    rowGap = 40,
    theme = "dark",
    minWidth = 1200,
    minHeight = 600,
  } = options;
  const layout = computeDagLayout(workflow, null, false, {
    colGap,
    rowGap,
    routingStyle,
    showGhostNodes: false,
  });

  const bgFill = theme === "dark" ? "#0c0d0e" : "#f5f5f5";
  const cardBg = theme === "dark" ? "#14171a" : "#ffffff";
  const cardBorder = theme === "dark" ? "#272b30" : "#d4d4d8";
  const textPrimary = theme === "dark" ? "#f4f4f5" : "#18181b";
  const textSecondary = theme === "dark" ? "#71717a" : "#a1a1aa";
  const edgeColor = theme === "dark" ? "#3b82f6" : "#2563eb";

  if (!layout.nodes || layout.nodes.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="${bgFill}"/></svg>`;
  }

  // Calculate actual bounding envelope of the graph content
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of layout.nodes) {
    if (node.x < minX) minX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.x + node.width > maxX) maxX = node.x + node.width;
    if (node.y + node.height > maxY) maxY = node.y + node.height;
  }

  const padding = 40;
  const contentWidth = Math.ceil(maxX - minX);
  const contentHeight = Math.ceil(maxY - minY);

  // Canvas is at least minWidth/minHeight, or bigger if content needs it
  const totalWidth = Math.max(minWidth, contentWidth + padding * 2);
  const totalHeight = Math.max(minHeight, contentHeight + padding * 2);

  // Center the content inside the canvas (not just pad it top-left)
  const offsetX = (totalWidth - contentWidth) / 2 - minX;
  const offsetY = (totalHeight - contentHeight) / 2 - minY;

  const edgesSvg = layout.edges
    .map(
      (edge: LayoutEdge) => `
      <path
        d="${edge.path}"
        fill="none"
        stroke="${edgeColor}"
        stroke-width="1.75"
        stroke-linecap="round"
        opacity="0.8"
      />`,
    )
    .join("\n");

  const nodesSvg = layout.nodes
    .map((node: LayoutNode) => {
      const x = node.x;
      const y = node.y;
      const w = node.width;
      const h = node.height;
      const rawJobName = (node.job?.displayName || node.id || "").substring(
        0,
        24,
      );
      const stepCount = `${node.job?.steps?.length ?? 0} STEPS`;
      const runner = (node.job?.runner || "UBUNTU-LATEST").toUpperCase();

      return `
      <g transform="translate(${x}, ${y})">
        <rect width="${w}" height="${h}" rx="3" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1.2" />
        <rect width="${w}" height="3" fill="#3b82f6" />
        <text x="14" y="24" fill="${textPrimary}" font-family="monospace" font-size="11" font-weight="700">
          ${escapeXml(rawJobName)}
        </text>
        <text x="14" y="42" fill="${textSecondary}" font-family="monospace" font-size="9">
          ${escapeXml(stepCount)} | ${escapeXml(runner)}
        </text>
      </g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 ${totalWidth} ${totalHeight}" 
  width="${totalWidth}" 
  height="${totalHeight}"
  style="background-color: ${bgFill}; display: block; max-width: 100%; height: auto;"
>
  <style>
    :root { background-color: ${bgFill}; color-scheme: ${theme}; }
  </style>
  <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${bgFill}" />
  <g transform="translate(${offsetX}, ${offsetY})">
    <g id="edges">${edgesSvg}</g>
    <g id="nodes">${nodesSvg}</g>
  </g>
</svg>`.trim();
}

export function exportGraphAsSvg(
  workflow: WorkflowDefinition | null,
  options: ExportOptions = {},
): void {
  if (!workflow) {
    alert("No active workflow loaded to export.");
    return;
  }

  const svgContent = buildSvgMarkup(workflow, options);
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${workflow.name || "pipeline"}-dag.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportGraphAsPng(
  workflow: WorkflowDefinition | null,
  options: ExportOptions = {},
): void {
  if (!workflow) {
    alert("No active workflow loaded to export.");
    return;
  }

  const svgContent = buildSvgMarkup(workflow, options);
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const scaleFactor = 2;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth * scaleFactor;
    canvas.height = img.naturalHeight * scaleFactor;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }

    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(img, 0, 0);

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${workflow.name || "pipeline"}-dag.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  img.src = url;
}
