import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@pipeline-visualizer/core-model": path.resolve(
        __dirname,
        "../../packages/core-model/src/index.ts",
      ),
      "@pipeline-visualizer/adapter-shared": path.resolve(
        __dirname,
        "../../packages/adapters/shared/src/index.ts",
      ),
      "@pipeline-visualizer/adapter-github-actions": path.resolve(
        __dirname,
        "../../packages/adapters/github-actions/src/index.ts",
      ),
      "@pipeline-visualizer/analysis-engine": path.resolve(
        __dirname,
        "../../packages/analysis-engine/src/index.ts",
      ),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
