/** Closed whole-booklet admission. Preparation, rights, App checks and release
 * are separate: none of these functions writes to public or changes a hold. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { Attribution, Bundle, Question, Source, SetRecord } from "../src/core/types";
import { refOf } from "../src/core/types";
import { contentHash, sha256 } from "../src/core/hash";
import { schema } from "../src/core/validation";
import { validateSourceFormat } from "../src/core/generation-formats";
import { checkFile, required2017SpringAfternoonReleaseCodePins as completeWorkspaceCodePins, type FilePin } from "./stage-2017-spring-afternoon";
import { autumn2017Afternoon as paper, autumn2017OriginalId, assertAutumn2017OriginalAnswers,
  autumn2017QuestionSelection, autumn2017Exam } from "./legacy-2017-autumn-afternoon-booklet";
import { apply2017AutumnPublicMetadata, type Autumn2017MetadataEdit } from "./stage-2017-autumn-afternoon-public-metadata";

export type Autumn2017Records = Pick<Bundle, "sources" | "rights" | "assets" | "questions" | "templates">;
export type Autumn2017Candidate = Autumn2017Records & Pick<Bundle, "sets" | "exams">;
export const autumn2017Crop = Object.freeze({
  png: "356919dfda4c5f38580b0fb7b05d89caf1d88fcf7e979e7d04136058ffbb2606",
  webp: "5a2b6a5dc3e28214571e8bc82341f584a8c1969a1d327e3dc65333127d86aa5e",
  width: 1432, height: 1240,
});
// Exact source scopes. API pages, erratum and appendices are not inferred from
// another booklet, nor from an asset's untrusted declared page count.
export const autumn2017AssetPages: readonly (readonly number[])[] = Object.freeze([
  [6,7,8], [9,10,11,12], [13,14,15,16,17], [18,19,20,21,22],
  [23,24,25,26,27,2], [28,29,30,31,32], [33,34,35,36,37],
  [38,39,40,41,42,43,44,45,4,5], [46,47,48,49,50,51,52], [53,54,55,56,57],
  [58,59,60,61,62,63,76,77,78], [64,65,66,67,79,80,81,82,83,84],
  [68,69,70,71,72,73,74,75,85,86,87,88,89,90,4,5],
].map(row => Object.freeze(row)));
const numbers = [...paper.majorNumbers];
const baseId = (number: number) => `question-template-source-2017h29a-fe-pm-${number}`;
const templateId = (number: number) => `template-source-2017h29a-fe-pm-${number}`;

export interface Autumn2017MajorReview {
  number: number;
  recordsSha256: string;
  questionPaperSHA256: string;
  answerPaperSHA256: string;
  reviewerIds: string[];
  checks: Record<"transcription" | "materials" | "independentSemantics" | "display", "pass">;
  evidence: FilePin[];
  codePins: FilePin[];
}
export interface Autumn2017MajorInput {
  number: number;
  prepared: Autumn2017Records;
  assetsRoot: string;
  review?: Autumn2017MajorReview;
}
export interface Autumn2017OfficialPacket {
  questionPaper: FilePin;
  answerPaper: FilePin;
  instructionPages: { page: 1 | 3; file: FilePin }[];
  acquisition: FilePin;
  crop: FilePin;
  review: { checkedOn: string; reviewerIds: string[]; reviewedPages: [1, 3]; evidence: FilePin[] };
}
export class Autumn2017StageError extends Error {
  constructor(public issues: string[]) { super(issues.join("\n")); this.name = "Autumn2017StageError"; }
}
const tree = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? tree(path.join(dir, entry.name)) : [path.resolve(dir, entry.name)]);
/** A review pins all owned source/UI/oracles plus the actual shared pipeline. */
export async function autumn2017MajorCodePins(number: number): Promise<FilePin[]> {
  assert(numbers.includes(number as typeof numbers[number]));
  const owned = new RegExp(`(?:legacy-2017-autumn-pm${number}(?:[.-])|Legacy2017AutumnPm${number}(?:[A-Z.]|$))`);
  const shared = new Set([
    "src/core/generation.ts", "src/core/generation-formats.ts", "src/core/source-figures.ts",
    "src/core/validation.ts", "src/core/generators/definition.ts", "src/core/generators/index.ts",
    "src/core/generators/legacy-afternoon-definitions.ts", "src/core/generators/legacy-afternoon-binding.ts",
    "src/core/generators/legacy-afternoon-public-notes.ts", "src/core/generators/legacy-afternoon-study-terms.ts",
    "src/core/legacy-afternoon-figures.ts", "src/ui/Content.tsx", "src/ui/ContentText.tsx",
    "src/ui/SourceFigure.tsx", "src/ui/LegacyAfternoonFigure.tsx", "src/ui/LegacyAfternoonCode.tsx",
    "src/ui/AnswerChoices.tsx", "src/ui/StudyTerms.tsx", "src/core/study-terms.ts",
    "src/ui/MaterialViewer.tsx", "src/ui/style.css", "src/ui/tokens.css", "src/ui/scrollbars.ts",
    "src/generated/validators.js", "scripts/legacy-2017-autumn-afternoon-booklet.ts",
    "scripts/stage-2017-autumn-afternoon.ts",
    "scripts/stage-2017-autumn-afternoon-public-metadata.ts", "scripts/source-evidence/stage2-2017-autumn-public-limits.json",
    "src/core/generators/legacy-2017-autumn-pm1-4-preparation.ts",
    "scripts/legacy-2017-autumn-pm1-4-local-schema.ts",
    "src/core/generators/legacy-2017-autumn-afternoon-definitions.ts",
    "src/core/generators/legacy-2017-autumn-fixed-materials.ts", "src/core/generators/legacy-2017-autumn-fixed-materials.json",
    "src/ui/Legacy2017AutumnNativeText.tsx", "src/ui/legacy-2017-autumn-native-text.css",
    "src/ui/CaptionFrame.tsx", "src/ui/tableChoiceName.ts", "src/ui/scrollbars.css", "scripts/stage-2017-spring-afternoon.ts",
  ].map(file => path.resolve(file)));
  const paths = [...new Set(["src", "scripts", "tests", "docs/public/schemas"].flatMap(tree)
    .filter(file => owned.test(path.basename(file)) || shared.has(file) ||
      file.startsWith(path.resolve("docs/public/schemas") + path.sep)))].sort();
  return Promise.all(paths.map(async file => {
    const bytes = fs.readFileSync(file);
    return { path: file, byteLength: bytes.byteLength, sha256: await sha256(bytes) };
  }));
}
function samePins(left: FilePin[], right: FilePin[]) {
  const normalize = (pins: FilePin[]) => [...pins].sort((a,b) => a.path.localeCompare(b.path))
    .map(pin => [pin.path,pin.sha256,pin.byteLength]);
  return left.length === new Set(left.map(pin => pin.path)).size &&
    JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}
export function autumn2017LearningPayload(q: Question) {
  const { id, revision, lifecycle, subject, learning, contexts, contextRefs, prompt, choices,
    answerParts, correctAnswer, explanation, assetRefs, choiceShuffleAllowed } = q;
  return { id, revision, lifecycle, subject, learning, contexts, contextRefs, prompt, choices,
    answerParts, correctAnswer, explanation, assetRefs, choiceShuffleAllowed };
}
function shape(input: Autumn2017MajorInput) {
  const { number: n, prepared: p } = input;
  assert(numbers.includes(n as typeof numbers[number]), "unexpected_autumn_major");
  assert.equal(p.questions.length, 2); assert.equal(p.templates.length, 1);
  const original = p.questions.find(q => q.id === autumn2017OriginalId(n));
  const base = p.questions.find(q => q.id === baseId(n)), template = p.templates[0];
  assert(original && base); assertAutumn2017OriginalAnswers(original, n);
  assert.equal(base.origin.kind, "official_adaptation"); assert(base.origin.isModified);
  assert.deepEqual(base.origin.derivedFrom, [refOf(original)]);
  assert.equal(template.id, templateId(n)); assert.deepEqual(template.baseQuestionRef, refOf(base));
  assert.equal(template.generatorRef.id, `generator-source-2017h29a-fe-pm-${n}`);
  assert.equal(template.distribution, "excluded"); assert.equal(template.bindingBasis, "official_source");
  assert.equal(template.lifecycle, "active");
  for (const q of p.questions) {
    assert.equal(q.distribution, "excluded"); assert.equal(q.lifecycle, "active");
    assert.equal(q.subject, "B"); assert.equal(q.choiceShuffleAllowed, false);
    assert(Object.values(q.review.checks).every(value => value === "pass"), "unreviewed_autumn_question");
    assert(q.origin.sourceRefs.length > 0 && q.origin.sourceRefs.every(ref => ref.locator.year === 2017 &&
      ref.locator.period === "秋期" && ref.locator.timeSlot === "午後" && ref.locator.questionNumber === String(n)));
  }
  for (const [kind, rows] of Object.entries(p)) {
    assert.equal(new Set(rows.map(row => row.id)).size, rows.length, "duplicate_autumn_" + kind);
    for (const row of rows) schema(kind === "rights" ? "rights" : kind.slice(0,-1), row);
  }
  assert(p.rights.length && p.rights.every(r => Object.values(r.uses).every(use => use === "allowed") &&
    ["none_identified", "present_cleared"].includes(r.thirdParty.status)), "unverified_autumn_material_rights");
  const sourceIds = new Set(p.sources.map(source => source.id)), rightsIds = new Set(p.rights.map(right => right.id));
  assert(p.sources.length >= 2, "autumn_source_documents_missing");
  for (const source of p.sources) {
    assert(source.id.startsWith(`source-ipa-2017h29a-fe-pm-${n}-`), "foreign_autumn_source");
    const document = source.type === "official_answer" ? paper.answerPaper : paper.questionPaper;
    assert.equal(source.availability,"officially_published"); assert.equal(source.url,document.url);
    assert.equal(source.sha256,document.sha256,"autumn_source_document_sha256");
  }
  const credit = (attribution: Attribution) => {
    assert(attribution.sourceRefs.every(ref => sourceIds.has(ref.sourceId)), "foreign_autumn_material_source");
    assert(attribution.rightsRefs.every(id => rightsIds.has(id) || id === "rights-original"), "foreign_autumn_material_right");
  };
  for (const q of p.questions) {
    assert(q.origin.sourceRefs.every(ref => sourceIds.has(ref.sourceId)), "foreign_autumn_question_source");
    assert.deepEqual(q.contextRefs,q.contexts.map(context => context.id), "autumn_context_reference_closure");
    for (const content of [q.prompt,q.explanation,...q.choices.map(choice => choice.content),...q.contexts.map(context => context.content)]) {
      credit(content.attribution);
      for (const block of content.blocks) {
        if (block.type === "diagram") credit(block.attribution);
        if (block.type === "image") assert(p.assets.some(asset => asset.id === block.assetId), "foreign_autumn_material_asset");
      }
    }
    credit(q.correctAnswer.attribution);
  }
  for (const asset of p.assets) { assert.equal(asset.mediaType,"image/webp"); credit(asset.attribution); }
  const pages = p.assets.map(asset => {
    assert.equal(asset.attribution.sourceRefs.length, 1);
    const ref = asset.attribution.sourceRefs[0];
    assert.equal(ref.locator.year, 2017); assert.equal(ref.locator.period, "秋期");
    assert.equal(ref.locator.timeSlot, "午後"); assert.equal(ref.locator.questionNumber, String(n));
    if (ref.locator.page === 81) assert(n === 12 && asset.sha256 === autumn2017Crop.webp &&
      asset.width === autumn2017Crop.width && asset.height === autumn2017Crop.height, "unapproved_autumn_jis_page81");
    return ref.locator.page;
  });
  assert.deepEqual([...pages].sort((a,b) => a! - b!), [...autumn2017AssetPages[n-1]].sort((a,b) => a-b), "autumn_complete_material_pages");
  return { original, base, template };
}
async function packetIssues(packet?: Autumn2017OfficialPacket): Promise<string[]> {
  if (!packet) return ["autumn_official_packet_missing"];
  const issues: string[] = [];
  if (packet.questionPaper.sha256 !== paper.questionPaper.sha256 || packet.questionPaper.byteLength !== paper.questionPaper.byteLength ||
    packet.answerPaper.sha256 !== paper.answerPaper.sha256 || packet.answerPaper.byteLength !== paper.answerPaper.byteLength)
    issues.push("autumn_official_document_identity");
  if (JSON.stringify(packet.instructionPages.map(p => p.page)) !== "[1,3]" ||
    JSON.stringify(packet.review.reviewedPages) !== "[1,3]" || !packet.review.reviewerIds.length ||
    !/^\d{4}-\d{2}-\d{2}$/.test(packet.review.checkedOn) || !packet.review.evidence.length)
    issues.push("autumn_instruction_page_review");
  if (packet.crop.sha256 !== autumn2017Crop.png) issues.push("autumn_corrected_crop_missing");
  for (const pin of [packet.questionPaper, packet.answerPaper, packet.acquisition, packet.crop,
    ...packet.instructionPages.map(p => p.file), ...packet.review.evidence])
    try { await checkFile(pin); } catch (error) { issues.push("autumn_packet:" + String(error)); }
  return issues;
}
export async function inventory2017AutumnAfternoon(inputs: Autumn2017MajorInput[], packet?: Autumn2017OfficialPacket) {
  const issues = await packetIssues(packet), rows = [];
  if (new Set(inputs.map(i => i.number)).size !== inputs.length) issues.push("duplicate_autumn_major");
  for (const n of numbers) {
    const input = inputs.find(i => i.number === n), local: string[] = [];
    if (!input) { issues.push("missing_autumn_major:" + n); rows.push({ number: n, prepared: false, normalAppRegistered: false }); continue; }
    try {
      const { base, template } = shape(input);
      assert.equal(template.originalContentSha256, await contentHash(base));
      validateSourceFormat(base, template);
    } catch (error) { local.push("autumn_major_shape:" + n + ":" + String(error)); }
    const review = input.review;
    if (!review || review.number !== n || review.recordsSha256 !== await contentHash(input.prepared) ||
      review.questionPaperSHA256 !== paper.questionPaper.sha256 || review.answerPaperSHA256 !== paper.answerPaper.sha256 ||
      !review.reviewerIds.length || !review.evidence.length ||
      !["transcription", "materials", "independentSemantics", "display"].every(key => review.checks[key as keyof typeof review.checks] === "pass"))
      local.push("autumn_major_review_missing_or_stale:" + n);
    else {
      if (!samePins(review.codePins, await autumn2017MajorCodePins(n))) local.push("autumn_major_code_changed:" + n);
      for (const pin of review.evidence) try { await checkFile(pin); } catch (error) { local.push("autumn_major_evidence:" + n + ":" + String(error)); }
    }
    for (const asset of input.prepared.assets) try {
      assert(path.isAbsolute(input.assetsRoot), "absolute_autumn_asset_root_required");
      const file = path.resolve(input.assetsRoot, asset.path);
      assert(file.startsWith(path.resolve(input.assetsRoot) + path.sep), "autumn_asset_path_escape");
      await checkFile({ path: file, sha256: asset.sha256, byteLength: asset.byteLength });
    } catch (error) { local.push("autumn_asset:" + n + ":" + String(error)); }
    rows.push({ number: n, prepared: true, reviewVerified: !local.length, normalAppRegistered: false, issues: local });
    issues.push(...local);
  }
  if (inputs.some(i => !numbers.includes(i.number as typeof numbers[number]))) issues.push("unexpected_autumn_major");
  return { scope: paper.id, expectedMajors: 13, preparedMajors: rows.filter(r => r.prepared).length,
    normalAppRegistered: 0, rows, issues, status: issues.length ? "incomplete" : "content_ready_for_candidate",
    wholePre2023ReadinessUnchanged: true };
}
/** Only reviewed excluded records can cross admission. No terms flag is
 * promoted here; callers must supply separately reviewed rights first. */
export async function build2017AutumnAfternoonCandidate(inputs: Autumn2017MajorInput[], packet: Autumn2017OfficialPacket) {
  const inventory = await inventory2017AutumnAfternoon(inputs, packet);
  if (inventory.issues.length) throw new Autumn2017StageError(inventory.issues);
  const candidate: Autumn2017Candidate = { sources: [], rights: [], assets: [], questions: [], templates: [], sets: [], exams: [] };
  const metadataEdits: (Autumn2017MetadataEdit & { number:number })[] = [];
  for (const input of [...inputs].sort((a,b) => a.number-b.number)) {
    const admitted = structuredClone(input.prepared);
    metadataEdits.push(...apply2017AutumnPublicMetadata(input.number,admitted).map(edit => ({ number:input.number,...edit })));
    for (const q of admitted.questions) q.distribution = "included";
    admitted.templates[0].distribution = "included";
    const base = admitted.questions.find(q => q.id === baseId(input.number))!;
    admitted.templates[0].originalContentSha256 = await contentHash(base);
    for (const q of admitted.questions) assert.deepEqual(autumn2017LearningPayload(q),
      autumn2017LearningPayload(input.prepared.questions.find(before => before.id === q.id)!));
    assert.deepEqual(admitted.rights, input.prepared.rights); assert.deepEqual(admitted.assets, input.prepared.assets);
    for (const kind of ["sources", "rights", "assets", "questions", "templates"] as const)
      (candidate[kind] as unknown[]).push(...admitted[kind]);
  }
  const source: Source = { schemaVersion: "3.0.0", id: "source-ipa-2017h29a-fe-pm-booklet",
    title: "平成29年度 秋期 基本情報技術者試験 午後 表紙・問題選択方法", publisher: "独立行政法人情報処理推進機構（IPA）",
    url: paper.questionPaper.url, sha256: paper.questionPaper.sha256, checkedOn: packet.review.checkedOn,
    type: "official_problem", availability: "officially_published", scope: "QS物理1頁と3頁の表紙・問題選択方法。物理2頁は問5の正誤表であり、別に参照する。",
    sections: ["物理p1 表紙・時間", "物理p3 問題選択・解答方法"], dateNote: "個別PDFの公開日と年度掲載ページの更新日を混同しない。",
    facts: ["13:00〜15:30、150分。問1・問8必須、問2〜7から4、問9〜13から1の計7大問。", "全13大問75欄。選択した7大問の解答欄数は35〜41欄。"],
    supports: ["annual-sets", "random-mix", "answer-validation"], limits: "方式と時間の出典のみ。個別本文・正誤表・言語付属資料の条件は各素材のsource/rightで確認する。" };
  candidate.sources.push(source);
  candidate.exams = [autumn2017Exam("study",false), autumn2017Exam("practice",false), autumn2017Exam("study",true), autumn2017Exam("practice",true)];
  const originals = numbers.map(n => refOf(candidate.questions.find(q => q.id === autumn2017OriginalId(n))!));
  const bases = numbers.map(n => refOf(candidate.questions.find(q => q.id === baseId(n))!));
  candidate.sets = [
    { schemaVersion: "3.0.0", id: "set-annual-2017-autumn-pm", revision: 1, title: "2017年度 秋期・午後", subject: "B", distribution: "included",
      questionRefs: originals, examConfigRefs: candidate.exams.slice(0,2).map(e => ({ id:e.id, revision:e.revision })), generationBindings: [], questionSelection: autumn2017QuestionSelection(originals) },
    { schemaVersion: "3.0.0", id: "set-mix-2017-autumn-pm", revision: 1, title: "2017年度 秋期・旧午後 ランダムミックス", subject: "B", distribution: "included",
      questionRefs: bases, examConfigRefs: candidate.exams.slice(2).map(e => ({ id:e.id, revision:e.revision })),
      generationBindings: bases.map((questionRef,i) => ({ questionRef, templateRef:{ id:templateId(i+1), revision:candidate.templates[i].revision } })) },
  ];
  for (const [kind, rows] of Object.entries(candidate)) {
    assert.equal(new Set(rows.map(row => row.id)).size, rows.length, "duplicate_autumn_candidate_" + kind);
    for (const row of rows) schema(kind === "rights" ? "rights" : kind.slice(0,-1), row);
  }
  assert.equal(candidate.questions.length,26); assert.equal(candidate.templates.length,13); assert.equal(candidate.assets.length,90);
  assert.equal(candidate.questions.filter(q => q.origin.kind === "official_reprint").reduce((sum,q) => sum+q.answerParts!.length,0),75);
  return { candidate, inventory, metadataEdits, candidateSHA256: await contentHash(candidate), status: "candidate_pending_normal_app_release_gate" };
}
export async function autumn2017GlobalMixPatch(existing: SetRecord, candidate: Autumn2017Candidate) {
  assert.equal(existing.id,"set-mix-b"); assert.equal(candidate.templates.length,13);
  const after = structuredClone(existing);
  for (const n of numbers) {
    const q = candidate.questions.find(q => q.id === baseId(n)), t = candidate.templates.find(t => t.id === templateId(n));
    assert(q && t); assert(!after.questionRefs.some(ref => ref.questionId === q.id));
    assert(!after.generationBindings.some(binding => binding.templateRef.id === t.id));
    const questionRef = refOf(q); after.questionRefs.push(questionRef);
    after.generationBindings.push({ questionRef, templateRef: { id:t.id, revision:t.revision } });
  }
  schema("set",after);
  return { before:structuredClone(existing), after, beforeSHA256:await contentHash(existing), afterSHA256:await contentHash(after),
    meaning:"Coverage bookkeeping only; old afternoon remains outside current subject-B sampling." };
}

export const autumn2017ReleaseChecks = ["npmCheck", "annualStudy13", "annualPractice75Selections7At9000",
  "randomMix", "searchBookmarks", "answerGrading", "saveResumeHistory", "sourceLicenseDisplay",
  "visualLightDarkMobile", "existingCurrentAnd2022Regression"] as const;
export interface Autumn2017ReleaseReceipt {
  candidateSHA256: string;
  checks: Record<typeof autumn2017ReleaseChecks[number], { status: "pass"; evidence: FilePin[] }>;
  codePins: FilePin[];
  assetsRoot: string;
}
// The existing helper inventories every current src/test/schema/public/script
// and workflow file. It contains no Spring-only allowlist or receipt bypass.
export const autumn2017ReleaseCodePins = completeWorkspaceCodePins;
export async function check2017AutumnAfternoonRelease(candidate: Autumn2017Candidate, receipt: Autumn2017ReleaseReceipt) {
  const issues: string[] = [];
  if (receipt.candidateSHA256 !== await contentHash(candidate)) issues.push("stale_autumn_release_candidate");
  if (candidate.questions.length !== 26 || candidate.templates.length !== 13 || candidate.assets.length !== 90 ||
    candidate.sets.length !== 2 || candidate.exams.length !== 4) issues.push("incomplete_autumn_release_booklet");
  for (const [kind,rows] of Object.entries(candidate)) {
    if (new Set(rows.map(row => row.id)).size !== rows.length) issues.push("duplicate_autumn_release_" + kind);
    for (const row of rows) try { schema(kind === "rights" ? "rights" : kind.slice(0,-1),row); }
      catch (error) { issues.push("autumn_release_schema:" + kind + ":" + String(error)); }
  }
  for (const n of numbers) try {
    const source = `2017h29a-fe-pm-${n}`;
    const belongs = (id: string, prefix: string) => id === prefix+source || id.startsWith(prefix+source+"-");
    const prepared: Autumn2017Records = {
      sources:candidate.sources.filter(row => belongs(row.id,"source-ipa-")),
      rights:candidate.rights.filter(row => belongs(row.id,"rights-ipa-")),
      assets:candidate.assets.filter(row => row.attribution.sourceRefs[0]?.locator.questionNumber === String(n)),
      questions:structuredClone(candidate.questions.filter(q => [autumn2017OriginalId(n),baseId(n)].includes(q.id))),
      templates:structuredClone(candidate.templates.filter(t => t.id === templateId(n))),
    };
    assert(prepared.questions.every(q => q.distribution === "included") && prepared.templates.every(t => t.distribution === "included"), "autumn_release_excluded_record");
    for (const q of prepared.questions) q.distribution = "excluded";
    for (const t of prepared.templates) t.distribution = "excluded";
    shape({ number:n,prepared,assetsRoot:receipt.assetsRoot });
    const base = candidate.questions.find(q => q.id === baseId(n))!, template = candidate.templates.find(t => t.id === templateId(n))!;
    assert.equal(await contentHash(base),template.originalContentSha256); validateSourceFormat(base,template);
  } catch (error) { issues.push("autumn_release_major:" + n + ":" + String(error)); }
  const annual = candidate.sets.find(s => s.id === "set-annual-2017-autumn-pm");
  try {
    assert(annual); assert.equal(annual.questionRefs.length,13);
    assert.equal(annual.distribution,"included"); assert.equal(annual.generationBindings.length,0);
    assert.deepEqual(annual.questionRefs,numbers.map(n => refOf(candidate.questions.find(q => q.id === autumn2017OriginalId(n))!)));
    assert.deepEqual(annual.examConfigRefs,[autumn2017Exam("study",false),autumn2017Exam("practice",false)].map(exam => ({ id:exam.id,revision:exam.revision })));
    assert.deepEqual(annual.questionSelection,autumn2017QuestionSelection(annual.questionRefs));
    for (const mix of [false,true]) for (const mode of ["study","practice"] as const)
      assert.deepEqual(candidate.exams.find(e => e.id === autumn2017Exam(mode,mix).id),autumn2017Exam(mode,mix));
    const mix = candidate.sets.find(s => s.id === "set-mix-2017-autumn-pm");
    assert(mix && mix.generationBindings.length === 13 && mix.questionRefs.length === 13);
    assert.equal(mix.distribution,"included");
    assert.deepEqual(mix.examConfigRefs,[autumn2017Exam("study",true),autumn2017Exam("practice",true)].map(exam => ({ id:exam.id,revision:exam.revision })));
    numbers.forEach((n,i) => {
      const base = candidate.questions.find(q => q.id === baseId(n))!, t = candidate.templates.find(t => t.id === templateId(n))!;
      assert.deepEqual(mix.questionRefs[i],refOf(base));
      assert.deepEqual(mix.generationBindings[i],{ questionRef:refOf(base),templateRef:{ id:t.id,revision:t.revision } });
    });
  } catch (error) { issues.push("autumn_release_selection_or_mix:" + String(error)); }
  for (const asset of candidate.assets) try {
    assert(path.isAbsolute(receipt.assetsRoot)); const file = path.resolve(receipt.assetsRoot,asset.path);
    assert(file.startsWith(path.resolve(receipt.assetsRoot)+path.sep));
    await checkFile({ path:file,sha256:asset.sha256,byteLength:asset.byteLength });
  } catch (error) { issues.push("autumn_release_asset:" + String(error)); }
  if (!samePins(receipt.codePins,await autumn2017ReleaseCodePins())) issues.push("autumn_release_code_changed_or_incomplete");
  for (const pin of receipt.codePins) try { await checkFile(pin,{ allowEmpty:true }); }
    catch (error) { issues.push("autumn_release_code:" + String(error)); }
  for (const key of autumn2017ReleaseChecks) {
    const check = receipt.checks[key];
    if (check?.status !== "pass" || !check.evidence.length) { issues.push("autumn_release_check_missing:" + key); continue; }
    for (const pin of check.evidence) try { await checkFile(pin); }
      catch (error) { issues.push("autumn_release_check_evidence:" + key + ":" + String(error)); }
  }
  if (issues.length) throw new Autumn2017StageError(issues);
  return { scope:paper.id,status:"release_checks_pass",candidateSHA256:receipt.candidateSHA256,
    majors:13,answerFields:75,assets:90,broaderPre2023Readiness:"separate_unchanged_not_claimed_complete",pushPerformed:false };
}
