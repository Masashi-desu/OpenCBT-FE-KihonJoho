import fs from "node:fs";
import crypto from "node:crypto";
import type { Bundle } from "../src/core/types";
export function fixture(): Bundle {
  const raw = fs.readFileSync("public/data/catalog.json"),
    catalog = JSON.parse(raw.toString());
  const b: Bundle = {
    catalog,
    catalogHash: crypto.createHash("sha256").update(raw).digest("hex"),
    questions: [],
    sets: [],
    exams: [],
    templates: [],
    sources: [],
    rights: [],
    assets: [],
  };
  for (const [kind, entries] of Object.entries(catalog.files) as [
    string,
    { path: string }[],
  ][])
    for (const e of entries)
      (b[kind as keyof Bundle] as unknown[]).push(
        JSON.parse(fs.readFileSync("public/data/" + e.path, "utf8")),
      );
  b.questions.sort(
    (a, c) =>
      Number(a.origin.sourceRefs[0]?.locator.questionNumber ?? 0) -
      Number(c.origin.sourceRefs[0]?.locator.questionNumber ?? 0),
  );
  return b;
}
