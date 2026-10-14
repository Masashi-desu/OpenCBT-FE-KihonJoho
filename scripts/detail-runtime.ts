import fs from "node:fs/promises";
import { transformWithEsbuild, type Plugin } from "vite";

async function runtimeSource() {
  const [scrollbars, runtime] = await Promise.all([
    fs.readFile("src/ui/scrollbars.ts", "utf8"),
    fs.readFile("src/ui/detail-runtime.ts", "utf8"),
  ]);
  // Both sources are managed code; TS-only imports/declarations disappear during transpilation.
  const source = scrollbars.replace("export function", "function") + "\n" +
    runtime.replace(/^import .*;$/gm, "");
  return (await transformWithEsbuild(`(() => {\n${source}\n})();`, "detail-runtime.ts", {
    loader: "ts", target: "es2022", minify: true,
  })).code;
}

export function detailRuntimePlugin(): Plugin {
  return {
    name: "isolated-detail-runtime",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== "/explanations/runtime.js") return next();
        try {
          res.setHeader("Content-Type", "text/javascript; charset=utf-8");
          res.end(await runtimeSource());
        } catch (error) { next(error as Error); }
      });
    },
    async generateBundle() {
      this.emitFile({ type: "asset", fileName: "explanations/runtime.js", source: await runtimeSource() });
    },
  };
}
