import autumn2017PMReview from "./source-evidence/stage2-2017-autumn-pm-review.json";
import spring2017PMReview from "./source-evidence/stage2-2017-spring-pm-review.json";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Bundle } from "../src/core/types";
import { CATEGORY_MAX_RECORDS } from "../src/core/catalog-files";
import { readDistributionBundle } from "./distribution-files";
import { generationCoverage } from "../src/core/generation-coverage";
import { validateSourceEvidence, type SourceEvidence } from "./verify-source-evidence";
import { aprilBReview } from "../tests/fixtures/pre-2023-sample-review";
import { decemberBReview } from "../tests/fixtures/dec-2022-b-review";
import {decemberAReview} from "../tests/fixtures/dec-2022-a-review";
import discoveryLedger from "./source-evidence/pre-2009-official-discovery-review.json";
import { auditPre2023Discovery, finalizePre2023Readiness } from "./pre-2023-discovery-gate";
import { assertLegacyEvidenceValues, losslessJSONCopy, pre2009HardPending, pre2009InventoryScope, readPre2009InventoryAdmission } from "./pre-2023-inventory-admission";

// Independent of both the acquisition file and distribution catalog. Deleting
// an unimplemented collection must not turn the requested expansion green.
export const pre2023LegacyScope = Array.from({ length: 11 }, (_, i) => 2009 + i).flatMap(year =>
  ["h", "a"].flatMap(period => {
    const stem = year === 2011 && period === "h" ? "2011h23tokubetsu"
      : year === 2019 && period === "a" ? "2019r01a" : `${year}h${year - 1988}${period}`;
    return (["am", "pm"] as const).map(slot => ({
      collectionId: `${stem}-fe-${slot}`, count: slot === "am" ? 80 : 13,
      subject: slot === "am" ? "A" : "B", compound: slot === "pm",
    }));
  }),
).concat([
  { collectionId: "2022-apr-sample-b", count: 6, subject: "B", compound: false },
  { collectionId: "2022-dec-sample-a", count: 60, subject: "A", compound: false },
  { collectionId: "2022-dec-sample-b", count: 20, subject: "B", compound: false },
]);

// Independent known minimum, not a historical upper bound.
export const pre2023Scope = [...pre2023LegacyScope, ...pre2009InventoryScope];

const requiredReviews = ["transcription", "rights", "originalSemantics", "generatorSemantics", "rendering"] as const;
type ReviewKind = typeof requiredReviews[number];
export type ImportReview = {
  collectionId: string; questionNumber: number; paperSha256: string;
  // Recording a review is not itself a successful execution of its tests.
  checks: Partial<Record<ReviewKind, "pass">>;
  testFiles: string[];
};
export const pre2023Reviews: ImportReview[] = aprilBReview.questions.map<ImportReview>(q => ({
  collectionId: aprilBReview.collectionId, questionNumber: q.number,
  paperSha256: aprilBReview.questionPaper.sha256,
  checks: { transcription: "pass", rights: "pass", originalSemantics: "pass", generatorSemantics: "pass", rendering: "pass" },
  testFiles: ["tests/pre-2023-sample-semantics.test.ts", "tests/april-generators.test.ts", "tests/source-prerequisites.test.ts", "tests/publication.test.ts", "scripts/verify-sample-browser.ts"],
})).concat(decemberBReview.questions.map<ImportReview>(q => ({
  collectionId: decemberBReview.collectionId, questionNumber: q.number,
  paperSha256: decemberBReview.questionPaper.sha256,
  checks: { transcription: "pass", rights: "pass", originalSemantics: "pass", generatorSemantics: "pass", rendering: "pass" },
  testFiles: ["tests/december-generators.test.ts", "tests/december-import.test.ts", "tests/source-prerequisites.test.ts", "tests/publication.test.ts", "scripts/verify-december-browser.ts"],
}))).concat(decemberAReview.questions.map<ImportReview>(q=>({
  collectionId:decemberAReview.collectionId,questionNumber:q.number,paperSha256:decemberAReview.questionPaper.sha256,
  checks:{transcription:"pass",rights:"pass",originalSemantics:"pass",generatorSemantics:"pass",rendering:"pass"},
  testFiles:["tests/december-a-generators.test.ts","tests/december-a-import.test.ts","tests/december-a-rendering.test.ts","tests/december-a-study-terms.test.ts","tests/source-prerequisites.test.ts","scripts/verify-december-a-browser.ts"],
}))).concat(spring2017PMReview.majorNumbers.map<ImportReview>(number => ({
  collectionId: spring2017PMReview.collectionId, questionNumber: number,
  paperSha256: spring2017PMReview.questionPaperSHA256,
  checks: { transcription: "pass", rights: "pass", originalSemantics: "pass", generatorSemantics: "pass", rendering: "pass" },
  testFiles: [`tests/legacy-2017-pm${number}.test.ts`, `tests/legacy-2017-pm${number}-records.test.ts`,
    "tests/legacy-2017-spring-pm-booklet.test.ts", "tests/legacy-afternoon-runtime.test.ts"],
}))).concat(autumn2017PMReview.majorNumbers.map<ImportReview>(number => ({
  collectionId: autumn2017PMReview.collectionId, questionNumber: number,
  paperSha256: autumn2017PMReview.questionPaperSHA256,
  checks: { transcription: "pass", rights: "pass", originalSemantics: "pass", generatorSemantics: "pass", rendering: "pass" },
  testFiles: [`tests/legacy-2017-autumn-pm${number}.test.ts`,
    number <= 4 ? `tests/legacy-2017-autumn-pm${number}-display.test.ts` : `tests/legacy-2017-autumn-pm${number}-records.test.ts`,
    "tests/legacy-2017-autumn-integration.test.ts", "tests/legacy-2017-autumn-booklet-release.test.ts"],
})));

export function auditPre2023Readiness(bundle: Bundle, evidence: SourceEvidence, reviews = pre2023Reviews, discovery: unknown = discoveryLedger) {
  evidence = losslessJSONCopy(evidence);
  validateSourceEvidence(evidence);
  const historicalListingEvidence = auditPre2023Discovery(discovery);
  const expected = pre2023LegacyScope.map(s => s.collectionId).sort();
  if (JSON.stringify(expected) !== JSON.stringify(evidence.collections.map(c => c.id).sort()))
    throw Error("IMPORT_SCOPE: 依頼された47問題集の取得記録が不足又は重複しています");
  for (const scope of pre2023LegacyScope) if (evidence.collections.find(c => c.id === scope.collectionId)!.questionNumbers.length !== scope.count) throw Error(`IMPORT_COUNT: ${scope.collectionId}`);
  assertLegacyEvidenceValues(evidence.collections);
  const admission = readPre2009InventoryAdmission();
  const admittedIDs = new Set(admission.collections.map(c => c.id));
  const allEvidence = [...evidence.collections, ...admission.collections];
  if (new Set(allEvidence.map(c=>c.id)).size !== pre2023Scope.length || pre2023Scope.some(s=>!allEvidence.some(c=>c.id===s.collectionId))) throw Error('IMPORT_ADMISSION_SCOPE: joined known scope');
  const scopeDiscovery = {status:'pending_materials_and_boundaries',ready:false as const,
    listedCollections:historicalListingEvidence.listedCollections,listedQuestionAndAnswerLinks:historicalListingEvidence.listedQuestionAndAnswerLinks,
    acceptedInventoryCollections:20,acceptedInventoryUnits:930,incorporatedPendingUnits:930,pendingMaterialUnits:930,
    pendingCollections:admission.collections.map(c=>c.id),pendingBoundaries:[...historicalListingEvidence.pendingBoundaries],unknownBoundaryUnits:null,
    historicalListingEvidence,note:'67問題集・3062単位は既知列挙の最小。930単位は素材・解答欄対応・内容・生成・表示・実登録が保留。境界の問数は未知。'};
  const reviewMap = new Map<string, ImportReview>();
  for (const r of reviews) {
    const key = `${r.collectionId}:${r.questionNumber}`;
    if (admittedIDs.has(r.collectionId)) throw Error(`IMPORT_REVIEW: ${key}: M1 does not admit new20 content passes`);
    const c = evidence.collections.find(c => c.id === r.collectionId);
    if (!c?.questionNumbers.includes(r.questionNumber) || r.paperSha256 !== c.questionPaper.sha256 || reviewMap.has(key) ||
      (Object.keys(r.checks).length > 0 && r.testFiles.length === 0))
      throw Error(`IMPORT_REVIEW: ${key}`);
    reviewMap.set(key, r);
  }
  const sources = new Map(bundle.sources.map(s => [s.id, s]));
  const coverage = generationCoverage(bundle);
  const collections = pre2023Scope.map(scope => {
    const c = allEvidence.find(c => c.id === scope.collectionId)!;
    if (c.questionNumbers.length !== scope.count)
      throw Error(`IMPORT_COUNT: ${c.id}`);
    const sourceSets = bundle.sets.filter(set => {
      if (set.distribution !== "included" || set.subject !== scope.subject || set.generationBindings.length ||
        set.questionRefs.length !== scope.count) return false;
      const numbers = set.questionRefs.map(ref => {
        const q = bundle.questions.find(q => q.id === ref.questionId && q.revision === ref.revision && q.origin.kind === "official_reprint");
        return q?.origin.sourceRefs.find(ref => sources.get(ref.sourceId)?.sha256 === c.questionPaper.sha256)?.locator.questionNumber;
      });
      return new Set(numbers).size === scope.count && c.questionNumbers.every(n => numbers.includes(String(n)));
    });
    const questions = c.questionNumbers.map(number => {
      const matching = bundle.questions.filter(q => q.origin.kind === "official_reprint" && q.origin.sourceRefs.some(ref =>
        sources.get(ref.sourceId)?.sha256 === c.questionPaper.sha256 && ref.locator.questionNumber === String(number)));
      const question = matching.length === 1 ? matching[0] : undefined;
      const pending: string[] = [];
      if (matching.length !== 1) pending.push(matching.length ? "duplicate_original" : "missing_original");
      if (question) {
        const sourcePosition = question.origin.sourceRefs.some(ref => sources.get(ref.sourceId)?.sha256 === c.questionPaper.sha256 &&
          ref.locator.questionNumber === String(number) && (c.kind === "past_exam"
            ? ref.locator.year === c.year && ref.locator.period === c.period && ref.locator.timeSlot === c.timeSlot
            : ref.locator.year === undefined && ref.locator.subject === c.subject && sources.get(ref.sourceId)?.publishedOn === c.publishedOn));
        if (!sourcePosition || question.subject !== scope.subject) pending.push("source_position");
        if (question.lifecycle !== "active" || question.distribution !== "included") pending.push("inactive_original");
        const row = coverage.rows.find(row => row.original.id === question.id);
        if (row?.templates.length !== 1 || row.linked.length !== 1) pending.push("generation_binding");
        if (!sourceSets.some(s =>
          s.questionRefs.some(ref => ref.questionId === question.id && ref.revision === question.revision))) pending.push("source_collection");
      }
      const review = reviewMap.get(`${c.id}:${number}`);
      for (const kind of requiredReviews) if (review?.checks[kind] !== "pass") pending.push(kind);
      if (admittedIDs.has(c.id)) pending.push(...pre2009HardPending);
      // A legacy major question must keep its individual answer slots. The
      // shared model supports unordered groups and unscored official slots.
      if (scope.compound && question && !question.answerParts) pending.push("compound_answer_model");
      return { number, questionId: question?.id, originalSemanticsReviewed: review?.checks.originalSemantics === "pass", pending };
    });
    return { id: c.id, count: questions.length, compound: scope.compound,
      sourceURL: c.questionPaper.url, answerURL: c.answerPaper.url,
      questions, ready: questions.filter(q => q.pending.length === 0).length };
  });
  const rows = collections.flatMap(c => c.questions);
  const missingByCheck = Object.fromEntries([...new Set(rows.flatMap(r => r.pending))].sort().map(check => [check, rows.filter(r => r.pending.includes(check)).length]));
  const limits = ["questions", "templates"].map(kind => {
    const existing = kind === "questions" ? bundle.questions.length : bundle.templates.length;
    const required = existing + rows.filter(r => !r.questionId).length * (kind === "questions" ? 2 : 1);
    const maximum = CATEGORY_MAX_RECORDS;
    return { kind, requiredAtLeast: required, maximum, exceeds: required > maximum };
  });
  const ready = rows.filter(r => r.pending.length === 0).length;
  return {
    status: finalizePre2023Readiness(ready === rows.length, !limits.some(l => l.exceeds), scopeDiscovery),
    unitNote: "午前・サンプルは問、旧午後は大問。解答欄数とは異なる。未収録を利用条件による除外と扱わない。summaryのcollections/requestedUnitsは現在列挙済み分であり、新規発見資料の未確定の問数を含めない。",
    summary: { collections: collections.length, requestedUnits: rows.length,
      missingOriginals: rows.filter(r => r.pending.includes("missing_original")).length,
      originalSemanticsReviewed: rows.filter(r => r.originalSemanticsReviewed).length, ready },
    missingByCheck, capacity: limits, collections, scopeDiscovery,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const evidence = JSON.parse(fs.readFileSync(new URL("./source-evidence/ipa-pre-2023.json", import.meta.url), "utf8")) as SourceEvidence;
  const report = auditPre2023Readiness(readDistributionBundle(), evidence);
  if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Pre-2023 currently enumerated scope: ${report.summary.collections} collections / ${report.summary.requestedUnits} questions or major questions`);
    console.log(`Accepted source inventory: ${report.scopeDiscovery.acceptedInventoryCollections} collections / ${report.scopeDiscovery.acceptedInventoryUnits} units; pending materials: ${report.scopeDiscovery.pendingMaterialUnits}; unknown boundary units: unknown; pending earlier/predecessor investigations: ${report.scopeDiscovery.pendingBoundaries.length}`);
    console.log(`Original semantic reviews recorded: ${report.summary.originalSemanticsReviewed}; release-ready: ${report.summary.ready}; missing originals: ${report.summary.missingOriginals}`);
    console.log(JSON.stringify({ missingByCheck: report.missingByCheck, capacity: report.capacity }, null, 2));
    console.log("Current distribution checks do not certify this expansion. Use --json for every collection and question.");
  }
  if (report.status !== "ready") process.exitCode = 1;
}
