import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { refKey, refOf, type Question, type Run, type Selection } from "../src/core/types";
import { generationCoverage } from "../src/core/generation-coverage";
import { chooseMenuSourceGroup, menuSourceGroups, menuSubjectOptions } from "../src/core/menu-selection";
import { sourceCollections } from "../src/core/source-collections";
import { sourceQuestionLabel, originalBookletQuestionNumber, displayQuestionNumber } from "../src/core/source-label";
import { mixProfile } from "../src/core/mix-profile";
import { selectQuestions } from "../src/core/selection";
import { prepareRun, validateRun, startRun, updateAnswer, finishRun, remaining } from "../src/core/session";
import { bookmarkSource, bookmarkTemplate, makeBookmark, bookmarkGroupSelection } from "../src/core/bookmarks";
import { bookmarkAccuracy, type BookmarkHistory } from "../src/core/bookmark-accuracy";
import { emptySearch, questionSearchDocuments, findSearchDocuments, searchableQuestions } from "../src/core/search";
import { validateBundle } from "../src/core/validation";

// Release-cohort expectations fixed against the accepted, source-reviewed
// booklets. These do not reduce the official80-question scope or clear
// the retained material holds. A later supplemental release updates its cohort.
const cohorts = [
  { id: "2017h29h-fe-am", year: 2017, period: "春期", count: 78, held: [55, 66], quota: { technology: 50, management: 9, strategy: 19 } },
  { id: "2017h29a-fe-am", year: 2017, period: "秋期", count: 79, held: [55], quota: { technology: 50, management: 9, strategy: 20 } },
  { id: "2018h30h-fe-am", year: 2018, period: "春期", count: 77, held: [39, 47, 62], quota: { technology: 48, management: 10, strategy: 19 } },
  { id: "2018h30a-fe-am", year: 2018, period: "秋期", count: 78, held: [39, 65], quota: { technology: 49, management: 10, strategy: 19 } },
  { id: "2019h31h-fe-am", year: 2019, period: "春期", count: 77, held: [41, 51, 67], quota: { technology: 49, management: 9, strategy: 19 } },
  { id: "2019r01a-fe-am", year: 2019, period: "秋期", count: 78, held: [55, 57], quota: { technology: 50, management: 8, strategy: 20 } },
] as const;
type Cohort = typeof cohorts[number];
const bundle = fixture(), coverage = generationCoverage(bundle);
// The ordinary loader validates the bundle and installs its admitted lazy
// generators before session preparation. A filesystem fixture alone does not.
await validateBundle(bundle);
const questionByRef = new Map(bundle.questions.map(q => [refKey(refOf(q)), q]));
const originalId = (cohort: Cohort, number: number) => `question-ipa-${cohort.id}-${number}`;
const sourceSet = (cohort: Cohort) => {
  const set = sourceCollections(bundle, "A").find(s => s.id === `set-annual-${cohort.id}`);
  assert(set, cohort.id);
  return set;
};
const sourceNumber = (q: Question) => Number(q.origin.sourceRefs.find(r => r.locator.questionNumber)?.locator.questionNumber);
const eligibleNumbers = (cohort: Cohort) => Array.from({ length: 80 }, (_, i) => i + 1)
  .filter(n => !(cohort.held as readonly number[]).includes(n));
const selection = (cohort: Cohort, kind: "annual" | "mix", mode: "study" | "practice" = "practice"): Selection => ({
  subject: "A", kind, mode, size: "public", bindingMode: kind === "annual" ? "original_data" : "generated_values",
  ...(kind === "annual" ? { sourceCollectionId: `set-annual-${cohort.id}` } : { mixProfileCollectionId: `set-annual-${cohort.id}` }),
});
const isCohortOriginal = (q: Question, cohort: Cohort) => q.id.startsWith(`question-ipa-${cohort.id}-`);
const slimHistory = (run: Run): BookmarkHistory => ({
  session: { id: run.session.id, status: run.session.status, entries: structuredClone(run.session.entries) },
  result: { generatedAt: run.result!.generatedAt, validity: run.result!.validity, entries: structuredClone(run.result!.entries) },
});

test("six partial old-AM booklets retain every eligible source number and exactly one usable generation/mix binding", () => {
  let total = 0, holds = 0;
  for (const cohort of cohorts) {
    const set = sourceSet(cohort), numbers = eligibleNumbers(cohort);
    assert.equal(set.questionRefs.length, cohort.count, cohort.id);
    assert.equal(set.generationBindings.length, 0);
    assert.equal(set.questionSelection, undefined, "morning does not inherit afternoon selection rules");
    const originals = set.questionRefs.map(ref => questionByRef.get(refKey(ref))!);
    assert.deepEqual(originals.map(sourceNumber), numbers, `${cohort.id} paper order and gaps`);
    assert.equal(bundle.questions.filter(q => isCohortOriginal(q, cohort)).length, cohort.count);
    for (const [index, original] of originals.entries()) {
      assert.equal(original.distribution, "included"); assert.equal(original.origin.kind, "official_reprint");
      const row = coverage.rows.find(r => r.original.id === original.id)!;
      assert.equal(row.templates.length, 1, original.id); assert.equal(row.linked.length, 1, original.id);
      const { base, template } = bookmarkTemplate(bundle, refOf(original), coverage);
      assert.equal(base.distribution, "included"); assert.equal(template.distribution, "included");
      assert.equal(bookmarkSource(bundle, refOf(base), coverage).id, original.id);
      assert.match(sourceQuestionLabel(original), new RegExp(`問${sourceNumber(original)}$`));
      assert.equal(originalBookletQuestionNumber(original), String(sourceNumber(original)));
      assert.equal(displayQuestionNumber(original, index), String(sourceNumber(original)), "source numbers retain gaps");
      assert.equal(originalBookletQuestionNumber(base), undefined);
      assert.equal(displayQuestionNumber(base, index), String(index + 1), "generated practice has its own issuance order");
    }
    for (const number of cohort.held) {
      assert(!bundle.questions.some(q => q.id === originalId(cohort, number) || q.id === `question-template-source-${cohort.id}-${number}`));
      assert(!bundle.templates.some(t => t.id === `template-source-${cohort.id}-${number}`));
      assert.throws(() => bookmarkSource(bundle, { questionId: originalId(cohort, number), revision: 1 }, coverage), { code: "BOOKMARK_REF" });
      holds++;
    }
    total += originals.length;
  }
  assert.equal(total, 467); assert.equal(holds, 13);
});

test("partial old-AM publications remain six independent menu choices beside their same-period afternoon booklets", () => {
  const groups = menuSourceGroups(bundle);
  for (const cohort of cohorts) {
    const group = groups.find(g => g.collections.some(s => s.id === sourceSet(cohort).id))!;
    assert(group, cohort.id);
    assert.equal(group.year, cohort.year); assert.equal(group.period, cohort.period); assert.equal(group.timeSlot, "午前");
    assert.equal(group.collections.length, 1);
    assert.deepEqual(menuSubjectOptions(group).map(o => [o.subject, o.title, o.available]), [["A", "旧制度・午前", true]]);
    assert(groups.some(g => g.year === cohort.year && g.period === cohort.period && g.timeSlot === "午後" && g.id !== group.id));
    for (const kind of ["annual", "mix"] as const) {
      const chosen = chooseMenuSourceGroup(groups, selection(cohort, kind), group.id);
      assert.equal(chosen[kind === "annual" ? "sourceCollectionId" : "mixProfileCollectionId"], sourceSet(cohort).id);
      assert.equal(chosen.size, "public");
      assert.throws(() => chooseMenuSourceGroup(groups, chosen, group.id, "B"), { code: "SOURCE_COLLECTION" });
    }
  }
});

test("partial old-AM mix sizes use the independently reviewed eligible area counts and150-minute paper setting", () => {
  for (const cohort of cohorts) {
    const profile = mixProfile(bundle, selection(cohort, "mix"));
    assert.equal(profile.legacy, true); assert.equal(profile.publicCount, cohort.count); assert.equal(profile.questionCount, cohort.count);
    assert.deepEqual(profile.quota, cohort.quota, cohort.id);
    assert.equal(profile.timeLimitSeconds, 9000); assert.equal(profile.fullCount, undefined);
    assert.throws(() => mixProfile(bundle, { ...selection(cohort, "mix"), size: "full" }), { code: "PROFILE_SCOPE" });
    for (const kind of ["annual", "mix"] as const) {
      const selected = selectQuestions(bundle, selection(cohort, kind), values => values);
      assert.equal(selected.questions.length, cohort.count); assert.equal(selected.exam.questionCount, cohort.count);
      assert.equal(selected.exam.timeLimitSeconds, 9000); assert.equal(selected.exam.practiceScope, "public_subset");
      assert.equal(selectQuestions(bundle, selection(cohort, kind, "study"), values => values).exam.timeLimitSeconds, undefined);
      assert.deepEqual(selected.questions.reduce((counts, q) => {
        counts[q.learning.area] = (counts[q.learning.area] ?? 0) + 1; return counts;
      }, {} as Record<string, number>), cohort.quota);
      const ownOriginals = new Set(sourceSet(cohort).questionRefs.map(refKey));
      if (kind === "annual") assert.deepEqual(selected.questions.map(refOf), sourceSet(cohort).questionRefs);
      else {
        assert.equal(new Set(selected.questions.map(q => q.id)).size, cohort.count, "identity ordering visits every eligible source once");
        assert(selected.questions.every(q => q.origin.derivedFrom.some(ref => ownOriginals.has(refKey(ref)))));
        assert.equal(selected.set.generationBindings.length, cohort.count);
      }
    }
  }
});

test("search and bookmark pools expose all467 eligible originals without duplicate bases or any held source", () => {
  const searchable = searchableQuestions(bundle), documents = questionSearchDocuments(bundle);
  for (const cohort of cohorts) {
    const refs = sourceSet(cohort).questionRefs, own = new Set(refs.map(ref => ref.questionId));
    assert.deepEqual(searchable.filter(q => isCohortOriginal(q, cohort)).map(q => q.id).sort(), [...own].sort());
    const docs = documents.filter(d => isCohortOriginal(d.question, cohort));
    assert.equal(docs.length, cohort.count); assert(docs.every(d => d.body.length > 0 && d.title.includes(cohort.period)));
    const found = findSearchDocuments(documents, { ...emptySearch, year: cohort.year, subject: "A", kind: "question" });
    assert(docs.every(doc => found.some(result => result.id === doc.id)));
    assert(!documents.some(d => d.question.id.startsWith(`question-template-source-${cohort.id}-`)));
    for (const number of cohort.held) assert(!documents.some(d => d.question.id === originalId(cohort, number)));
    const afterGap = refs.find(ref => sourceNumber(questionByRef.get(refKey(ref))!) > cohort.held[0])!;
    const original = questionByRef.get(refKey(afterGap))!, { base } = bookmarkTemplate(bundle, afterGap, coverage);
    const bookmark = makeBookmark(bundle, afterGap, 100000), generatedBookmark = makeBookmark(bundle, refOf(base), 100000);
    assert.equal(bookmark.id, original.id); assert.deepEqual(generatedBookmark, bookmark);
    assert.match(bookmark.title, new RegExp(`問${sourceNumber(original)}$`));
    const group = bookmarkGroupSelection([bookmark]);
    const selected = selectQuestions(bundle, group, values => values);
    assert.deepEqual(selected.set.questionRefs, [refOf(base)]);
  }
});

for (const cohort of cohorts) test(`${cohort.id}: actual original and generated runs survive JSON restore and grade only the published questions`, async () => {
  const records: BookmarkHistory[] = [], first = questionByRef.get(refKey(sourceSet(cohort).questionRefs[0]))!;
  for (const kind of ["annual", "mix"] as const) {
    const s = selection(cohort, kind), prepared = selectQuestions(bundle, s, values => values);
    let run = startRun(await prepareRun(bundle, s, {}, 100000, undefined, prepared), 101000);
    assert.equal(run.issued.length, cohort.count); assert.equal(run.session.entries.length, cohort.count);
    assert.equal(run.instances.length, kind === "mix" ? cohort.count : 0);
    assert.equal(remaining(run, 101000), 9000);
    assert.deepEqual([...new Set(run.issued.map(sourceNumber))].sort((a, b) => a - b), eligibleNumbers(cohort));
    run.issued.forEach((q, index) => assert.equal(displayQuestionNumber(q, index),
      kind === "annual" ? String(sourceNumber(q)) : String(index + 1)));
    assert.equal(run.issued[0].origin.sourceRefs.find(r => r.locator.questionNumber)?.locator.questionNumber, "1");
    const own = new Set(sourceSet(cohort).questionRefs.map(refKey));
    assert(run.session.entries.every(entry => {
      const source = questionByRef.get(refKey(entry.questionRef));
      return source && (kind === "annual" ? own.has(refKey(refOf(source)))
        : source.origin.derivedFrom.some(ref => own.has(refKey(ref))));
    }));
    run = updateAnswer(run, run.issued[0].correctAnswer.choiceId, 102000);
    // Check the JSON-compatible saved shape without claiming to exercise
    // browser IndexedDB, its structured cloning, or image Blob I/O in Node.
    const saved = JSON.parse(JSON.stringify(run)) as Run;
    await validateRun(saved);
    assert.equal(saved.selection[kind === "annual" ? "sourceCollectionId" : "mixProfileCollectionId"], sourceSet(cohort).id);
    assert.deepEqual(saved.session.entries.map(e => e.questionRef), run.session.entries.map(e => e.questionRef));
    assert.equal(saved.session.entries[0].selectedChoiceId, run.issued[0].correctAnswer.choiceId);
    assert.equal(remaining(saved, 103000), 8998);
    const finished = finishRun(saved, "completed", 104000);
    assert.equal(finished.result!.total, cohort.count); assert.equal(finished.result!.entries.length, cohort.count);
    assert.equal(finished.result!.correct, 1); assert.equal(finished.result!.incorrect, 0); assert.equal(finished.result!.unanswered, cohort.count - 1);
    assert.equal(finished.result!.learningAccuracyPercent, Math.round(1000 / cohort.count) / 10);
    await validateRun(finished);
    records.push(slimHistory(finished));
    const changed = structuredClone(finished);
    changed.exam.questionCount = 80;
    await assert.rejects(validateRun(changed), { code: "SESSION_CONFIG" }, "missing official questions cannot become saved unanswered entries");
  }
  const bookmark = makeBookmark(bundle, refOf(first), 100000);
  assert.deepEqual(bookmarkAccuracy(bundle, [bookmark], records).get(bookmark.id), { answered: 2, correct: 2, accuracyPercent: 100 });
});
