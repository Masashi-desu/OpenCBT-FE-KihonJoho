// Rebuild only managed template data from already recorded, verified public questions.
// This script neither collects remote questions nor converts PDFs.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { generationContracts, bindQuestion, validateTemplateContract } from "../src/core/generation";
import { additionalContracts } from "../src/core/generators";
import { legacyAfternoonDefinition } from "../src/core/generators/legacy-afternoon-definitions";
import { validateSourceFormat } from "../src/core/generation-formats";
import { readDistributionBundle, compactDistribution } from "./distribution-files";
import { contentHash } from "../src/core/hash";
import {
  refOf,
  type Question,
  type Template,
  type Catalog,
  type SetRecord,
} from "../src/core/types";

const root = path.resolve("public/data");
const read = (p: string) =>
  JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const write = (p: string, v: unknown) => {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(v, null, 2) + "\n");
};
const catalog: Catalog = read("catalog.json");
const oldFiles = structuredClone(catalog.files);
const inputBundle = readDistributionBundle(root);
const questions = inputBundle.questions;
const originals = questions.filter((q) => q.origin.kind === "official_reprint");
const generated: {
  question: Question;
  template: Template;
  questionPath: string;
  templatePath: string;
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
for (const source of refreshSources)
  if (
    ![...generationContracts, ...additionalContracts].some(
      (c) => c.source === source,
    )
  )
    throw Error(`Unknown refresh source ${source}`);
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
    const questionPath = `questions/template-${c.id}.json`,
      templatePath = `templates/${c.id}.json`;
    generated.push({
      question: existingQuestion,
      template: inputBundle.templates.find(t => t.id === `template-${c.id}`)!,
      questionPath,
      templatePath,
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
    questionPath: `questions/template-${c.id}.json`,
    templatePath: `templates/${c.id}.json`,
  });
}
// Booklet-managed bases have source-owned appendices, per-material rights and
// their own admission review. They are not generic single-answer rebuilds.
// Preserve every such registered record when refreshing an unrelated source;
// an explicit bulk refresh must fail before writing rather than silently drop
// them or reconstruct them from an original image question.
const handledTemplates = new Set(generated.map(g => g.template.id));
for (const template of inputBundle.templates.filter(t => !handledTemplates.has(t.id))) {
  const definition = legacyAfternoonDefinition(template.generatorRef.id);
  const question = inputBundle.questions.find(q => q.id === template.baseQuestionRef.questionId && q.revision === template.baseQuestionRef.revision);
  if (!definition || !question) throw Error(`Unmanaged existing template ${template.id}`);
  if (process.argv.includes("--refresh-all") || process.argv.includes("--refresh-additional") || refreshSources.has(definition.source))
    throw Error(`BOOKLET_REVIEW_REQUIRED: ${definition.source}; use its complete reviewed booklet staging workflow`);
  validateTemplateContract(template);
  if (template.originalContentSha256 !== await contentHash(question)) throw Error(`BASE_CONTENT ${template.id}`);
  validateSourceFormat(question, template);
  generated.push({ question, template,
    questionPath: `questions/${question.id.replace(/^question-/, "")}.json`,
    templatePath: `templates/${template.id.replace(/^template-/, "")}.json` });
}
if (!changed) {
  console.log("Managed generation data is unchanged; revisions preserved.");
  process.exit(0);
}
for (const q of originals) write(`questions/${q.id.replace(/^question-/, "")}.json`, q);
for (const g of generated) {
  write(g.questionPath, g.question);
  write(g.templatePath, g.template);
}
const records = (files: { path: string; recordCount?: number }[]) =>
  files.map((f) => ({
    ...f,
    sha256: createHash("sha256")
      .update(fs.readFileSync(path.join(root, f.path)))
      .digest("hex"),
  }));
catalog.files.questions = records([
  ...originals.map(q => ({ path: `questions/${q.id.replace(/^question-/, "")}.json` })),
  ...generated.map((g) => ({ path: g.questionPath })),
]);
catalog.files.templates = records(
  generated.map((g) => ({ path: g.templatePath })),
);
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
  write(p, s);
  for (const mode of ["study", "practice"]) {
    const epath = `exams/mix-${subject.toLowerCase()}-${mode}.json`,
      e = inputBundle.exams.find(e => e.id === `exam-mix-${subject.toLowerCase()}-${mode}`)!;
    e.revision = s.revision;
    e.title = s.title;
    e.duplicatePolicy = "instance_unique";
    e.choiceOrder = "shuffle";
    write(epath, e);
  }
  s.examConfigRefs = s.examConfigRefs.map((r) => ({
    ...r,
    revision: s.revision,
  }));
  write(p, s);
}
catalog.files.sets = records(inputBundle.sets.filter(s => !s.id.includes("independent")).map(s => {
  const p = `sets/${s.id.replace(/^set-/, "")}.json`; write(p, s); return { path: p };
}));
catalog.files.exams = records(inputBundle.exams.filter(e => !e.id.includes("independent")).map(e => {
  const p = `exams/${e.id.replace(/^exam-/, "")}.json`; write(p, e); return { path: p };
}));
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
for (const kind of Object.keys(catalog.files))
  catalog.files[kind] = records(catalog.files[kind]);
write("catalog.json", catalog);
const keep = new Set(
  Object.values(catalog.files).flatMap((files) => files.map((f) => f.path)),
);
for (const files of Object.values(oldFiles))
  for (const f of files)
    if (!keep.has(f.path)) fs.rmSync(path.join(root, f.path));
compactDistribution(root);
console.log(
  `${originals.length} official originals, ${generated.length} image-based parameter templates; standalone independent sets removed.`,
);
