import fs from "node:fs";
import crypto from "node:crypto";
import { validateBundle } from "../src/core/validation";
import type { Bundle } from "../src/core/types";
import { generationCoverage } from "../src/core/generation-coverage";
import { validateLicenseNotices } from "./licenses";
import { validateSourceInventory } from "./source-inventory";
const base = "public/data",
  raw = fs.readFileSync(`${base}/catalog.json`),
  catalog = JSON.parse(raw.toString());
const hash = (raw: Buffer) =>
  crypto.createHash("sha256").update(raw).digest("hex");
const bundle: Bundle = {
  catalog,
  catalogHash: hash(raw),
  questions: [],
  sources: [],
  rights: [],
  assets: [],
  sets: [],
  exams: [],
  templates: [],
};
for (const [kind, files] of Object.entries(catalog.files) as [
  string,
  { path: string; sha256: string }[],
][]) {
  for (const f of files) {
    const raw = fs.readFileSync(`${base}/${f.path}`);
    if (hash(raw) !== f.sha256) throw Error(`FILE_HASH ${f.path}`);
    (bundle[kind as keyof Bundle] as unknown[]).push(
      JSON.parse(raw.toString()),
    );
  }
}
await validateBundle(bundle);
const inventory = validateSourceInventory(bundle);
console.log(
  `Source inventory ${inventory.included}/${inventory.declared}: ${inventory.excluded} documented rights exclusion`,
);
const coverage = generationCoverage(bundle);
if (bundle.catalog.generationCoverage === "complete")
  console.log(
    `Generation coverage ${coverage.covered}/${coverage.total}: every official source has one validated template and mix binding`,
  );
for (const a of bundle.assets) {
  const raw = fs.readFileSync(`${base}/${a.path}`);
  if (
    hash(raw) !== a.sha256 ||
    raw.length !== a.byteLength ||
    raw.toString("ascii", 0, 4) !== "RIFF" ||
    raw.toString("ascii", 8, 12) !== "WEBP"
  )
    throw Error(`ASSET_HASH ${a.id}`);
}
const included = new Set([
  "catalog.json",
  ...Object.values(catalog.files)
    .flat()
    .map((f) => (f as { path: string }).path),
  ...bundle.assets.map((a) => a.path),
]);
const checkFiles = (directory = "") => {
  for (const entry of fs.readdirSync(`${base}/${directory}`, {
    withFileTypes: true,
  })) {
    const relative = directory ? `${directory}/${entry.name}` : entry.name;
    if (entry.isDirectory()) checkFiles(relative);
    else if (!included.has(relative)) throw Error(`UNLISTED_FILE ${relative}`);
  }
};
checkFiles();
const licenseResult = validateLicenseNotices();
if (
  fs.readFileSync("docs/public/notices/katex-0.19.0-LICENSE.txt", "utf8") !==
  fs.readFileSync("public/notices/katex-0.19.0-LICENSE.txt", "utf8")
)
  throw Error("KATEX_LICENSE");
console.log(
  `${bundle.questions.length} distribution questions (${bundle.questions.filter((q) => q.origin.kind === "official_reprint").length} official), ${bundle.assets.length} assets: Schema, rights, references and hashes passed`,
);
console.log(
  `${licenseResult.notices} local license notices: metadata, installed versions and original texts passed`,
);
