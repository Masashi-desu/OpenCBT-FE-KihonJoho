import fs from "node:fs";
import path from "node:path";
import type { Bundle } from "../src/core/types";
import { loadDetailPackage, validateDetailAttribution } from "../src/core/detailed-explanation";

/** Missing optional directories are legal; existing distributed packages must be complete and reviewed. */
export async function validateDetailPackages(bundle: Bundle, publicRoot = "public") {
  const referenced = new Set<string>();
  let packages = 0;
  for (const question of bundle.questions) {
    const ref = question.detailedExplanationRef;
    if (!ref) continue;
    referenced.add(ref.directory);
    const directory = path.join(publicRoot, ref.directory);
    if (!fs.existsSync(directory)) continue;
    const fetcher = (async (url: URL | RequestInfo) => {
      const file = path.join(publicRoot, new URL(String(url)).pathname);
      return new Response(fs.readFileSync(file));
    }) as typeof fetch;
    const pkg = await loadDetailPackage(ref, new URL("https://detail.invalid/"), undefined, fetcher);
    if (!pkg) throw Error(`DETAIL_PACKAGE ${question.id}: パッケージの構造・版・hash・サイズが不正です`);
    validateDetailAttribution(pkg.manifest, bundle);
    const allowed = new Set(["manifest.json", ...Object.keys(pkg.files)]);
    const scan = (relative = "") => {
      for (const entry of fs.readdirSync(path.join(directory, relative), { withFileTypes: true })) {
        const file = relative ? `${relative}/${entry.name}` : entry.name;
        if (entry.isSymbolicLink()) throw Error(`DETAIL_SYMLINK ${file}`);
        if (entry.isDirectory()) scan(file);
        else if (!allowed.has(file)) throw Error(`DETAIL_UNLISTED_FILE ${file}`);
      }
    };
    scan(); packages++;
  }
  const root = path.join(publicRoot, "explanations");
  if (fs.existsSync(root)) {
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (entry.isSymbolicLink() || (entry.isDirectory() && !referenced.has(`explanations/${entry.name}/`)) ||
        (entry.isFile() && entry.name !== "host.html"))
        throw Error(`DETAIL_UNREGISTERED ${entry.name}`);
    }
  }
  return packages;
}
