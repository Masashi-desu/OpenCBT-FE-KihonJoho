// Rebuild only managed template data from already recorded, verified public questions.
// This script neither collects remote questions nor converts PDFs.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { generationContracts, bindQuestion, validateTemplateContract } from "../src/core/generation";
import { additionalContracts, additionalDefinition } from "../src/core/generators";
import { ensureLegacyMorningGenerators } from "../src/core/generators/legacy-morning-install";
import { isLegacyMorningSource } from "../src/core/generators/legacy-morning-format";
import { ensureStage3MorningGenerators, isStage3MorningSource } from '../src/core/generators/stage3-morning-install';
import { legacyAfternoonDefinition } from "../src/core/generators/legacy-afternoon-definitions";
import { validateSourceFormat } from "../src/core/generation-formats";
import { encodeRecordPacks, readDistributionBundle } from "./distribution-files";
import { CATALOG_MAX_BYTES } from "../src/core/catalog-files";
import { contentHash } from "../src/core/hash";
import {
  refOf,
  type Question,
  type Template,
} from "../src/core/types";

const root = path.resolve("public/data");
const inputBundle = readDistributionBundle(root);
const catalog = structuredClone(inputBundle.catalog);
const questions = inputBundle.questions;
const originals = questions.filter((q) => q.origin.kind === "official_reprint");
const generated: {
  question: Question;
  template: Template;
}[] = [];
const refreshSources = new Set(
  (
    process.argv
      .find((a) => a.startsWith("--refresh-sources="))
      ?.split("=")[1] ?? ""
  )
    .split(",")
    .filter(Boolean),
);
for (const source of refreshSources) {
  // Morning booklets are admitted as a whole reviewed payload. Do not install
  // their definitions into the generic rebuild loop or refresh their bases.
  if ((isLegacyMorningSource(source)||isStage3MorningSource(source)) && inputBundle.templates.some(t => t.generatorRef.id === `generator-source-${source}`))
    throw Error(`BOOKLET_REVIEW_REQUIRED: ${source}; use its complete reviewed booklet staging workflow`);
  if (
    ![...generationContracts, ...additionalContracts].some(
      (c) => c.source === source,
    )
  )
    throw Error(`Unknown refresh source ${source}`);
}
let changed = false;
const refreshedSubjects = new Set<string>();
for (const c of [...generationContracts, ...additionalContracts]) {
  // Refresh selected series, preserving unrelated verified content and metadata.
  const existingQuestion = questions.find(
    (q) => q.id === `question-template-${c.id}`,
  );
  const revised = ["critical-path", "security-log"].includes(c.id);
  const additional = c.id.startsWith("source-");
  if (
    existingQuestion &&
    !(
      process.argv.includes("--refresh-all") ||
      refreshSources.has(c.source) ||
      (additional && process.argv.includes("--refresh-additional"))
    )
  ) {
    generated.push({
      question: existingQuestion,
      template: inputBundle.templates.find(t => t.id === `template-${c.id}`)!,
    });
    continue;
  }
  const original = originals.find((q) => q.id === `question-ipa-${c.source}`);
  if (!original) throw new Error(`Missing official source ${c.source}`);
  changed = true;
  refreshedSubjects.add(original.subject);
  const existingTemplate = existingQuestion
    ? inputBundle.templates.find(t => t.id === `template-${c.id}`)
    : undefined;
  const t: Template = {
    schemaVersion: "3.0.0",
    id: `template-${c.id}`,
    revision: existingTemplate
      ? existingTemplate.revision + 1
      : revised
        ? 3
        : 2,
    title: c.title,
    baseQuestionRef: refOf(original),
    generatorRef: {
      id: `generator-${c.id}`,
      version: c.version ?? "2.1.0",
    },
    parameterDomain: {
      values: {
        length: c.fields.length,
        minimum: Math.min(...c.fields.map((f) => f.minimum)),
        maximum: Math.max(...c.fields.map((f) => f.maximum)),
      },
      fields: c.fields,
    },
    referenceParameters: { values: c.reference },
    attribution: {
      origin: "adapted",
      sourceRefs: original.origin.sourceRefs,
      rightsRefs: [
        ...original.prompt.attribution.rightsRefs,
        "rights-original",
      ],
      creatorIds: ["codex"],
    },
    editorIds: ["codex"],
    lifecycle: "active",
    distribution: "included",
    bindingBasis: "official_source",
    originalContentSha256: "0".repeat(64),
  };
  const q = bindQuestion(
    original,
    t,
    c.reference,
    `template-${c.id}`,
    new Date().toISOString(),
  );
  // Refresh content while retaining the existing base's display-order policy.
  // The official image uses fixed symbol labels, whereas a prose generated
  // base may allow shuffling; bindQuestion now intentionally inherits policy.
  if (existingQuestion) q.choiceShuffleAllowed = existingQuestion.choiceShuffleAllowed;
  if (existingQuestion)
    q.origin.changes = [
      ...existingQuestion.origin.changes.map(({ answerDetails: _obsoleteAnswerDetails, ...change }) => change),
      q.origin.changes[q.origin.changes.length - 1],
    ];
  q.revision = t.revision;
  q.learning.tags = [
    ...q.learning.tags.filter((tag) => !tag.startsWith("annual-")),
    "parameterized",
    `template-${c.id}`,
  ];
  q.review.notes = `${c.notes} 公開原問題の画像を参照して構造・意味・計算規則を独自の生成器へ定義した改変問題。実在する公式問題の再録とは表示しない。基準値と入力域の照合、生成器の独立計算テストを適用する。`;
  q.review.checkedOn = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(q.origin.changes[q.origin.changes.length - 1].at));
  q.origin.changes[q.origin.changes.length - 1].summary =
    "原問題の出題形式・定義・前提・注記を維持する生成用基準問題を定義";
  t.baseQuestionRef = refOf(q);
  t.originalContentSha256 = await contentHash(q);
  generated.push({
    question: q,
    template: t,
  });
}
// Booklet-managed bases have source-owned appendices, per-material rights and
// their own admission review. They are not generic single-answer rebuilds.
// Preserve every such registered record when refreshing an unrelated source;
// an explicit bulk refresh must fail before writing rather than silently drop
// them or reconstruct them from an original image question.
const handledTemplates = new Set(generated.map(g => g.template.id));
// Install admitted morning definitions only after the generic refresh set was
// fixed. They are needed for validation, never generic regeneration.
await ensureLegacyMorningGenerators(inputBundle);
ensureStage3MorningGenerators(inputBundle);
for (const template of inputBundle.templates.filter(t => !handledTemplates.has(t.id))) {
  const source = template.generatorRef.id.replace(/^generator-source-/, "");
  const definition = legacyAfternoonDefinition(template.generatorRef.id) ??
    (isLegacyMorningSource(source)||isStage3MorningSource(source) ? additionalDefinition(template.generatorRef.id) : undefined);
  const question = inputBundle.questions.find(q => q.id === template.baseQuestionRef.questionId && q.revision === template.baseQuestionRef.revision);
  if (!definition || !question) throw Error(`Unmanaged existing template ${template.id}`);
  if (process.argv.includes("--refresh-all") || process.argv.includes("--refresh-additional") || refreshSources.has(definition.source))
    throw Error(`BOOKLET_REVIEW_REQUIRED: ${definition.source}; use its complete reviewed booklet staging workflow`);
  validateTemplateContract(template);
  if (template.originalContentSha256 !== await contentHash(question)) throw Error(`BASE_CONTENT ${template.id}`);
  validateSourceFormat(question, template);
  generated.push({ question, template });
}
if (!changed) {
  console.log("Managed generation data is unchanged; revisions preserved.");
  process.exit(0);
}
// Retain the existing record order when replacing selected series.
function inPriorOrder<T extends { id: string }>(prior: readonly T[], next: readonly T[]): T[] {
  const remaining = new Map(next.map(record => [record.id, record]));
  if (remaining.size !== next.length) throw Error("DUPLICATE_RECORD");
  const ordered: T[] = [];
  for (const previous of prior) {
    const replacement = remaining.get(previous.id);
    if (replacement) {
      ordered.push(replacement);
      remaining.delete(previous.id);
    }
  }
  ordered.push(...remaining.values());
  return ordered;
}
for (const subject of ["A", "B"] as const) {
  if (!refreshedSubjects.has(subject)) continue;
  const p = `sets/mix-${subject.toLowerCase()}.json`,
    s: SetRecord = inputBundle.sets.find(s => s.id === `set-mix-${subject.toLowerCase()}`)!,
    subset = generated.filter((g) => g.question.subject === subject);
  s.revision += 1;
  s.title = `科目${subject} ランダムミックス（値・図・正答を生成）`;
  s.questionRefs = subset.map((g) => refOf(g.question));
  s.generationBindings = subset.map((g) => ({
    questionRef: refOf(g.question),
    templateRef: { id: g.template.id, revision: g.template.revision },
  }));
  for (const mode of ["study", "practice"]) {
    const e = inputBundle.exams.find(e => e.id === `exam-mix-${subject.toLowerCase()}-${mode}`)!;
    e.revision = s.revision;
    e.title = s.title;
    e.duplicatePolicy = "instance_unique";
    e.choiceOrder = "shuffle";
  }
  s.examConfigRefs = s.examConfigRefs.map((r) => ({
    ...r,
    revision: s.revision,
  }));
}
const updates = {
  questions: inPriorOrder(inputBundle.questions, [...originals, ...generated.map(row => row.question)]),
  templates: inPriorOrder(inputBundle.templates, generated.map(row => row.template)),
  sets: inputBundle.sets.filter(set => !set.id.includes("independent")),
  exams: inputBundle.exams.filter(exam => !exam.id.includes("independent")),
};
const packs = Object.entries(updates).flatMap(([kind, rows]) => {
  const packed = encodeRecordPacks(kind, rows);
  catalog.files[kind] = packed.map(pack => pack.entry);
  return packed;
});
catalog.revision += 1;
catalog.generationCoverage = "complete";
// Replacement references must resolve after managed questions are revised.
for (const withdrawal of catalog.withdrawals) {
  if (!withdrawal.replacement) continue;
  const replacement = generated.find(
    (g) => g.question.id === withdrawal.replacement!.questionId,
  );
  if (replacement) withdrawal.replacement = refOf(replacement.question);
}
// Publish only the packed index. A one-file-per-record intermediate index
// exceeds the catalogue byte limit once enough historical problems are present.
const catalogPath = path.join(root, "catalog.json");
const catalogBytes = Buffer.from(JSON.stringify(catalog, null, 2) + "\n");
if (catalogBytes.length > CATALOG_MAX_BYTES) throw Error("SIZE catalog.json");
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
if (digest(fs.readFileSync(catalogPath)) !== inputBundle.catalogHash) throw Error("CATALOG_CHANGED");
const keep = new Set(Object.values(catalog.files).flatMap(files => files.map(file => file.path)));
const replaced = Object.values(inputBundle.catalog.files).flat().filter(file => !keep.has(file.path));
for (const file of replaced)
  if (digest(fs.readFileSync(path.join(root, file.path))) !== file.sha256) throw Error(`FILE_CHANGED ${file.path}`);
for (const { entry, bytes } of packs) {
  const file = path.join(root, entry.path);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) {
    if (digest(fs.readFileSync(file)) !== entry.sha256) throw Error(`PACK_COLLISION ${entry.path}`);
  } else fs.writeFileSync(file, bytes, { flag: "wx" });
}
const pendingCatalog = path.join(root, `.catalog-${process.pid}.json`);
fs.writeFileSync(pendingCatalog, catalogBytes, { flag: "wx" });
fs.renameSync(pendingCatalog, catalogPath);
for (const file of replaced)
  if (digest(fs.readFileSync(path.join(root, file.path))) === file.sha256) fs.unlinkSync(path.join(root, file.path));
console.log(
  `${originals.length} official originals, ${generated.length} image-based parameter templates; standalone independent sets removed.`,
);
