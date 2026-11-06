// Add the reviewed optional detail reference, preserving question content and generator code.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { readDistributionBundle } from "./distribution-files";
import { catalogFileRecords, catalogKinds } from "../src/core/catalog-files";
import { contentHash } from "../src/core/hash";
import { refOf } from "../src/core/types";

const root = path.resolve("public/data"), bundle = readDistributionBundle(root);
const original = bundle.questions.find(q => q.id === "question-ipa-2016h28a-fe-am-21")!;
if (original.detailedExplanationRef) {
  if (original.detailedExplanationRef.directory !== "explanations/ipa-2016-autumn-am-21/") throw Error("Unexpected existing explanation");
  console.log("LED detail reference already prepared; revisions preserved.");
  process.exit(0);
}
const base = bundle.questions.find(q => q.id === "question-template-source-2016h28a-fe-am-21")!;
const template = bundle.templates.find(t => t.id === "template-source-2016h28a-fe-am-21")!;
const oldOriginal = refOf(original), oldBase = refOf(base), oldTemplateRevision = template.revision;
const detail = { directory: "explanations/ipa-2016-autumn-am-21/", revision: 1 };
for (const q of [original, base]) {
  // A new edition must not retain repeated question/explanation text in past change records.
  for (const change of q.origin.changes) delete change.answerDetails;
  q.revision++;
  q.detailedExplanationRef = { ...detail };
  q.origin.changes.push({ at: "2026-11-06T00:00:00Z", actorId: "codex", kind: "layout", summary: "7セグメントLEDの詳細解説への参照を追加", details: "原本文・前提・図・選択肢・正答・通常解説を保持し、16進数の変換・端子ごとの点灯判定・選択肢の照合を段階操作できる詳細解説を追加。解説内の出力編集は保存済み問題から分離する。", affectsAnswer: false });
  q.review.checkedOn = "2026-11-06";
  q.review.notes += " 2026-11-06：公式問題p.13・解答例p.1と利用条件を再確認。詳細解説を回路から独立に読み取った端子の対応・全4択・全8生成入力と照合。同一AIの検証であり第三者査読ではない。";
}
base.origin.derivedFrom = base.origin.derivedFrom.map(r => r.questionId === original.id ? refOf(original) : r);
template.revision++; template.baseQuestionRef = refOf(base); template.originalContentSha256 = await contentHash(base);
for (const set of bundle.sets) {
  let changed = false;
  set.questionRefs = set.questionRefs.map(r => {
    if (r.questionId === oldOriginal.questionId && r.revision === oldOriginal.revision) { changed = true; return refOf(original); }
    if (r.questionId === oldBase.questionId && r.revision === oldBase.revision) { changed = true; return refOf(base); }
    return r;
  });
  for (const binding of set.generationBindings) if (binding.templateRef.id === template.id && binding.templateRef.revision === oldTemplateRevision) {
    changed = true; binding.templateRef.revision = template.revision; binding.questionRef = refOf(base);
  }
  if (changed) set.revision++;
}
// Only rewrite affected record packs; every unrelated record and its order is retained.
for (const kind of catalogKinds) for (let i = 0; i < bundle.catalog.files[kind].length; i++) {
  const entry = bundle.catalog.files[kind][i], file = path.join(root, entry.path), before = fs.readFileSync(file);
  const json = JSON.parse(before.toString("utf8")), records = catalogFileRecords(entry, json);
  const current = new Map((bundle[kind] as { id: string }[]).map(r => [r.id, r]));
  const updated = records.map(r => current.get((r as { id: string }).id)!);
  if (JSON.stringify(records) === JSON.stringify(updated)) continue;
  const bytes = Buffer.from(Array.isArray(json) ? "[" + updated.map(r => JSON.stringify(r)).join(",") + "]\n" : JSON.stringify(updated[0], null, 2) + "\n");
  const hash = createHash("sha256").update(bytes).digest("hex"), nextPath = Array.isArray(json) ? `${kind}/pack-${hash}.json` : entry.path;
  fs.writeFileSync(path.join(root, nextPath), bytes); bundle.catalog.files[kind][i] = { ...entry, path: nextPath, sha256: hash };
  if (nextPath !== entry.path) fs.unlinkSync(file);
}
bundle.catalog.revision++;
fs.writeFileSync(path.join(root, "catalog.json"), JSON.stringify(bundle.catalog, null, 2) + "\n");
console.log("LED detail added: original/base/template revision 2; generator 3.2.0 retained.");
