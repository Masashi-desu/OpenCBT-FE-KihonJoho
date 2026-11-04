// Remove repeated explanation bodies from provenance; never alter current content.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readDistributionBundle } from "./distribution-files";
import { catalogFileRecords, catalogKinds } from "../src/core/catalog-files";
import { contentHash } from "../src/core/hash";
import { refOf } from "../src/core/types";

const root = path.resolve("public/data"), bundle = readDistributionBundle(root);
const audits: object[] = [];
for (const source of ["2017h29h-fe-am-20", "sample-2022-dec-a-2"]) {
  const base = bundle.questions.find(q => q.id === `question-template-source-${source}`)!;
  const template = bundle.templates.find(t => t.id === `template-source-${source}`)!;
  const prior = base.origin.changes.slice(0, -1).filter(c => c.answerDetails !== undefined);
  if (!prior.length) continue;
  const before = structuredClone(base), oldBase = refOf(base), oldTemplateRevision = template.revision;
  for (const change of prior) delete change.answerDetails;
  base.revision++;
  base.origin.changes.push({ at: "2026-11-04T00:00:00Z", actorId: "codex", kind: "layout",
    summary: "改訂履歴から重複した解説本文を除去", details: "現行の本文・選択肢・正答・通常解説・詳細参照を保持し、以前の変更記録に重複していた解説本文のフィールドだけを除去する。", affectsAnswer: false });
  base.review.checkedOn = "2026-11-04";
  base.review.notes += " 2026-11-04：変更記録の重複解説を除去し、現行の本文・全選択肢・正答・通常解説と生成条件の不変を全フィールドで照合。";
  // Normalize only the reviewed audit fields and prove all content is identical.
  const normalized = structuredClone(base);
  normalized.revision = before.revision; normalized.origin.changes = before.origin.changes; normalized.review = before.review;
  if (JSON.stringify(normalized) !== JSON.stringify(before)) throw Error(`Content changed: ${source}`);
  template.revision++; template.baseQuestionRef = refOf(base); template.originalContentSha256 = await contentHash(base);
  for (const set of bundle.sets) {
    let changed = false;
    set.questionRefs = set.questionRefs.map(ref => {
      if (ref.questionId !== oldBase.questionId || ref.revision !== oldBase.revision) return ref;
      changed = true; return refOf(base);
    });
    for (const binding of set.generationBindings) if (binding.templateRef.id === template.id && binding.templateRef.revision === oldTemplateRevision) {
      changed = true; binding.templateRef.revision = template.revision; binding.questionRef = refOf(base);
    }
    if (changed) set.revision++;
  }
  audits.push({ source, removedDuplicateFields: prior.length, baseRevision: base.revision, templateRevision: template.revision, currentContentUnchanged: true });
}
// Retain the frozen semantic witnesses; update only the one revised metadata
// row, after proving all non-audit fields against the committed predecessor.
const baselineFile = "tests/fixtures/generator-composition-existing.json";
const baseline = JSON.parse(fs.readFileSync(baselineFile, "utf8"));
const revised = bundle.templates.find(t => t.id === "template-source-sample-2022-dec-a-2")!;
const revisedBase = bundle.questions.find(q => q.id === revised.baseQuestionRef.questionId)!;
const row = baseline.rows.find((r: any) => r.template.id === revised.id);
if (row.base.revision !== revisedBase.revision) {
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const committed = (file: string) => JSON.parse(execFileSync("git", ["show", `${commit}:public/data/${file}`], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));
  const catalog = committed("catalog.json");
  const find = (kind: string, id: string) => {
    for (const entry of catalog.files[kind]) {
      const value = committed(entry.path), rows = Array.isArray(value) ? value : [value];
      const record = rows.find((r: any) => r.id === id); if (record) return record;
    }
    throw Error(`Missing committed record: ${id}`);
  };
  const priorBase = find("questions", revisedBase.id), priorTemplate = find("templates", revised.id);
  if (await contentHash(priorBase) !== row.base.contentSha256 || await contentHash(priorTemplate) !== row.template.contentSha256) throw Error("Prior baseline mismatch");
  const comparableBase = structuredClone(revisedBase), comparableTemplate = structuredClone(revised);
  comparableBase.revision = priorBase.revision; comparableBase.origin.changes = priorBase.origin.changes; comparableBase.review = priorBase.review;
  comparableTemplate.revision = priorTemplate.revision; comparableTemplate.baseQuestionRef = priorTemplate.baseQuestionRef; comparableTemplate.originalContentSha256 = priorTemplate.originalContentSha256;
  if (JSON.stringify(comparableBase) !== JSON.stringify(priorBase) || JSON.stringify(comparableTemplate) !== JSON.stringify(priorTemplate)) throw Error("Non-audit content changed");
  row.base.revision = revisedBase.revision; row.base.contentSha256 = await contentHash(revisedBase);
  row.template.revision = revised.revision; row.template.contentSha256 = await contentHash(revised);
  baseline.source.appliedMainCandidateUpdates.push({ comparisonCommit: commit, reviewedOn: "2026-11-04",
    basis: "変更記録の重複解説だけを除去し、比較元の現行本文・通常解説・全選択肢・正答・生成条件の不変を全フィールド比較した。",
    rows: ["sample-2022-dec-a-2"], roots: [], note: "基準問題・テンプレートの改訂と参照hashだけを更新。他188系列、全176root、独立した意味の期待値は保持する。" });
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + "\n");
}
if (!audits.length) { console.log("No duplicate explanation bodies remain; baseline is current."); process.exit(0); }
for (const kind of catalogKinds) for (let i = 0; i < bundle.catalog.files[kind].length; i++) {
  const entry = bundle.catalog.files[kind][i], file = path.join(root, entry.path), bytesBefore = fs.readFileSync(file);
  const parsed = JSON.parse(bytesBefore.toString("utf8")), records = catalogFileRecords(entry, parsed);
  const current = new Map((bundle[kind] as { id: string }[]).map(r => [r.id, r]));
  const updated = records.map(r => current.get((r as { id: string }).id)!);
  if (JSON.stringify(records) === JSON.stringify(updated)) continue;
  const bytes = Buffer.from(Array.isArray(parsed) ? "[" + updated.map(r => JSON.stringify(r)).join(",") + "]\n" : JSON.stringify(updated[0], null, 2) + "\n");
  const hash = createHash("sha256").update(bytes).digest("hex"), next = Array.isArray(parsed) ? `${kind}/pack-${hash}.json` : entry.path;
  fs.writeFileSync(path.join(root, next), bytes); bundle.catalog.files[kind][i] = { ...entry, path: next, sha256: hash };
  if (next !== entry.path) fs.unlinkSync(file);
}
bundle.catalog.revision++;
fs.writeFileSync(path.join(root, "catalog.json"), JSON.stringify(bundle.catalog, null, 2) + "\n");
fs.mkdirSync("output/recovery", { recursive: true });
fs.writeFileSync("output/recovery/change-record-cleanup.json", JSON.stringify(audits, null, 2) + "\n");
console.log(audits);
