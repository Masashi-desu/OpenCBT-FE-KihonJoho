import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { detailRuntimePlugin } from "./scripts/detail-runtime";
import {
  packageRootForModule,
  validateLicenseNotices,
} from "./scripts/licenses";
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    detailRuntimePlugin(),
    {
      name: "distribution-license-coverage",
      apply: "build",
      generateBundle(_options, bundle) {
        const roots = new Set<string>();
        for (const entry of Object.values(bundle))
          if (entry.type === "chunk")
            for (const [id, module] of Object.entries(entry.modules)) {
              if (!module.renderedLength) continue;
              const root = packageRootForModule(id);
              if (root) roots.add(root);
            }
        const result = validateLicenseNotices(process.cwd(), [...roots]);
        console.log(
          `Bundle licenses: ${result.bundledPackages} actual/declared packages covered by ${result.notices} notices`,
        );
      },
    },
    {
      name: "development-csp",
      transformIndexHtml(html) {
        return command === "serve"
          ? html.replace(
              /\s*<meta http-equiv="Content-Security-Policy"[^>]*\/>/,
              "",
            )
          : html;
      },
    },
  ],
  base: "./",
  server: {
    host: "127.0.0.1", port: 5175,
    // Review snapshots can contain whole checkouts and dependency links.
    // Watching them causes unrelated reloads and unbounded memory use.
    watch: { ignored: ["output", ".cache"].map(directory =>
      fileURLToPath(new URL(`./${directory}/**`, import.meta.url)).replaceAll("\\", "/")) },
  },
  preview: { host: "127.0.0.1", port: 4175 },
  build: { sourcemap: false, chunkSizeWarningLimit: 850 },
}));
