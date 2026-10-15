import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { transformWithEsbuild, type Plugin } from "vite";

export function detailRuntimeAssets(template: string, runtime: string) {
  const marker = 'src="./runtime.js"';
  if (template.split(marker).length !== 2) throw new Error("Detail host must reference the managed runtime exactly once");
  const revision = createHash("sha256").update(template).update("\0").update(runtime).digest("hex").slice(0, 32);
  const runtimeName = `runtime-${revision}.js`;
  return {
    hostFileName: `explanations/host-${revision}.html`,
    runtimeFileName: `explanations/${runtimeName}`,
    html: template.replace(marker, `src="./${runtimeName}"`), runtime,
  };
}

async function runtimeSource() {
  const [scrollbars, layout, runtime] = await Promise.all([
    fs.readFile("src/ui/scrollbars.ts", "utf8"),
    fs.readFile("src/ui/detail-layout.ts", "utf8"),
    fs.readFile("src/ui/detail-runtime.ts", "utf8"),
  ]);
  // Managed sources share one classic script in the opaque sandbox.
  const source = scrollbars.replace("export function", "function") + "\n" +
    layout.replace("export function", "function") + "\n" +
    runtime.replace(/^import .*;$/gm, "");
  return (await transformWithEsbuild(`(() => {\n${source}\n})();`, "detail-runtime.ts", {
    loader: "ts", target: "es2022", minify: true,
  })).code;
}

export function detailRuntimePlugin(): Plugin {
  let prepared: Promise<ReturnType<typeof detailRuntimeAssets>> | undefined;
  const assets = () => prepared ??= Promise.all([
    fs.readFile("public/explanations/host.html", "utf8"), runtimeSource(),
  ]).then(([template, runtime]) => detailRuntimeAssets(template, runtime));
  return {
    name: "isolated-detail-runtime",
    async config() {
      return { define: { "import.meta.env.DETAIL_HOST_PATH": JSON.stringify((await assets()).hostFileName) } };
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (!pathname?.startsWith("/explanations/")) return next();
        try {
          const detail = await assets();
          const isHost = pathname === "/" + detail.hostFileName;
          if (!isHost && pathname !== "/" + detail.runtimeFileName && pathname !== "/explanations/runtime.js") return next();
          res.setHeader("Content-Type", isHost ? "text/html; charset=utf-8" : "text/javascript; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(isHost ? detail.html : await runtimeSource());
        } catch (error) { next(error as Error); }
      });
    },
    async generateBundle() {
      const detail = await assets();
      this.emitFile({ type: "asset", fileName: detail.hostFileName, source: detail.html });
      this.emitFile({ type: "asset", fileName: detail.runtimeFileName, source: detail.runtime });
      // Older cached app entries can still use the original host and API.
      this.emitFile({ type: "asset", fileName: "explanations/runtime.js", source: detail.runtime });
    },
  };
}
