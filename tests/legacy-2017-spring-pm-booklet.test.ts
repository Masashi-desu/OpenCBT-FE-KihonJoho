import test from "node:test";
import assert from "node:assert/strict";
import baseline from "./fixtures/generator-composition-existing.json";
import { readDistributionBundle } from "../scripts/distribution-files";
import { refKey, refOf, type Ref, type Run, type Selection } from "../src/core/types";
import { sourceCollections } from "../src/core/source-collections";
import { familyOf, selectQuestions } from "../src/core/selection";
import { contentHash } from "../src/core/hash";
import { prepareRun, startRun, resultFor, finishRun, updatePartAnswer, validateRun } from "../src/core/session";

// Independent integration expectations from the 2017 spring cover/answer key:
// 1/8 mandatory, four of 2..7, one of 9..13; 13:00..15:30. The existing
// reviewed current189 fixture supplies identities only, never new PM content or
// semantic answer expectations. All per-major truth/oracles remain separate.
const numbers = Array.from({ length: 13 }, (_, index) => index + 1);
const fieldCounts = [5, 5, 5, 4, 5, 6, 8, 7, 7, 7, 7, 6, 6];
const collectionId = "set-annual-2017-spring-pm";
const originalId = (number: number) => `question-ipa-2017h29h-fe-pm-${number}`;
const baseId = (number: number) => `question-template-source-2017h29h-fe-pm-${number}`;
const templateId = (number: number) => `template-source-2017h29h-fe-pm-${number}`;
const at = Date.parse("2026-10-26T00:00:00Z");
const sorted = (ids: readonly string[]) => [...ids].sort();
const reverse = <T>(values: T[]): T[] => [...values].reverse();
const jsonRun = (run: Run): Run => JSON.parse(JSON.stringify(run));

function one<T extends { id: string }>(rows: readonly T[], id: string): T {
  const matching = rows.filter(row => row.id === id);
  assert.equal(matching.length, 1, `実配布カタログに ${id} が一意に必要です`);
  return matching[0]!;
}

function realBooklet() {
  // No private factory, injected registry, missing-data skip, or synthetic
  // booklet fallback: absent/newly unlisted distribution data must fail.
  const bundle = readDistributionBundle();
  const collection = one(bundle.sets, collectionId);
  const originals = numbers.map(number => one(bundle.questions, originalId(number)));
  const bases = numbers.map(number => one(bundle.questions, baseId(number)));
  const templates = numbers.map(number => one(bundle.templates, templateId(number)));
  return { bundle, collection, originals, bases, templates, refs: originals.map(refOf) };
}

function selection(kind: "annual" | "mix", selectedQuestionRefs?: Ref[], mode: "practice" | "study" = "practice"): Selection {
  return { subject: "B", kind, mode, size: "public", bindingMode: kind === "annual" ? "original_data" : "generated_values",
    ...(kind === "annual" ? { sourceCollectionId: collectionId } : { mixProfileCollectionId: collectionId }),
    ...(selectedQuestionRefs ? { selectedQuestionRefs } : {}) };
}

function* legalSelections() {
  // Enumerate the two omitted general majors, independently of runtime policy.
  for (let first = 2; first <= 7; first++) for (let second = first + 1; second <= 7; second++)
    for (let language = 9; language <= 13; language++)
      yield [1, ...[2, 3, 4, 5, 6, 7].filter(number => number !== first && number !== second), 8, language];
}

function correctEntries(run: Run) {
  for (const [index, question] of run.issued.entries()) {
    const answers: Record<string, string> = {};
    assert(question.answerParts);
    for (const answer of question.correctAnswer.parts!) {
      if (answer.kind === "choice") answers[answer.partId] = answer.choiceId;
      else if (answer.kind === "unordered") answer.partIds.forEach((id, i) => { answers[id] = answer.choiceIds[answer.choiceIds.length - i - 1]; });
      else assert.fail("2017春期の公式解答欄を正解なしへ置換してはいけません");
    }
    assert.equal(Object.keys(answers).length, question.answerParts.length);
    run.session.entries[index].selectedPartChoices = answers;
  }
}

function assertScore(run: Run, selectedNumbers: readonly number[]) {
  const expectedFields = selectedNumbers.reduce((sum, number) => sum + fieldCounts[number - 1], 0);
  const result = resultFor(run, at + 1000);
  assert.equal(result.total, selectedNumbers.length);
  assert.equal(result.correct, selectedNumbers.length);
  assert.equal(result.incorrect, 0); assert.equal(result.unanswered, 0);
  assert.equal(result.learningAccuracyPercent, 100);
  assert.deepEqual(result.partSummary, { total: expectedFields, correct: expectedFields,
    incorrect: 0, unanswered: 0, unscored: 0, learningAccuracyPercent: 100 });
  assert.deepEqual(result.entries.map(entry => entry.parts!.length), selectedNumbers.map(number => fieldCounts[number - 1]));
  if (selectedNumbers.length === 7) {
    assert(expectedFields < 78, "非選択大問の欄を採点分母へ含めません");
    // Change one real issued field while retaining all other persisted entries.
    const question = run.issued[0], part = question.answerParts![0], entry = run.session.entries[0];
    const correct = entry.selectedPartChoices![part.id];
    const wrong = part.choiceIds.find(id => id !== correct)!;
    assert(wrong);
    const changed: Run = { ...run, session: { ...run.session, entries: run.session.entries.map((value, index) => index ? value :
      { ...value, selectedPartChoices: { ...value.selectedPartChoices, [part.id]: wrong } }) } };
    const incorrect = resultFor(changed, at + 1000);
    assert.equal(incorrect.total, 7); assert.equal(incorrect.correct, 6); assert.equal(incorrect.incorrect, 1);
    assert.equal(incorrect.learningAccuracyPercent, 85.7);
    assert.equal(incorrect.partSummary!.total, expectedFields);
    assert.equal(incorrect.partSummary!.correct, expectedFields - 1); assert.equal(incorrect.partSummary!.incorrect, 1);
    assert.equal(incorrect.partSummary!.learningAccuracyPercent, Math.round((expectedFields - 1) / expectedFields * 1000) / 10);
    delete changed.session.entries[0].selectedPartChoices![part.id];
    const unanswered = resultFor(changed, at + 1000);
    assert.equal(unanswered.total, 7); assert.equal(unanswered.correct, 6); assert.equal(unanswered.unanswered, 1);
    assert.equal(unanswered.partSummary!.total, expectedFields); assert.equal(unanswered.partSummary!.unanswered, 1);
    assert.equal(unanswered.partSummary!.incorrect, 0);
  }
}

test("実配布は既存189系列（2022年86問を含む）と旧午後5冊各13系列を一対一に保持する", async () => {
  const { bundle, collection, originals, bases, templates, refs } = realBooklet();
  assert.equal(baseline.rows.length, 189);
  const previousOriginals = baseline.rows.flatMap(row => row.originals.map(original => original.ref.questionId));
  assert.equal(previousOriginals.length, 189); assert.equal(new Set(previousOriginals).size, 189);
  assert.deepEqual(sorted(bundle.questions.filter(q => q.origin.kind === "official_reprint").map(q => q.id)), sorted([...previousOriginals, ...numbers.map(originalId), ...numbers.map(n => `question-ipa-2017h29a-fe-pm-${n}`), ...numbers.map(n => `question-ipa-2018h30h-fe-pm-${n}`), ...numbers.map(n => `question-ipa-2018h30a-fe-pm-${n}`), ...numbers.map(n => `question-ipa-2019h31h-fe-pm-${n}`)]));
  assert.deepEqual(sorted(bundle.questions.filter(q => q.origin.kind !== "official_reprint").map(q => q.id)), sorted([...baseline.rows.map(row => row.base.id), ...numbers.map(baseId), ...numbers.map(n => `question-template-source-2017h29a-fe-pm-${n}`), ...numbers.map(n => `question-template-source-2018h30h-fe-pm-${n}`), ...numbers.map(n => `question-template-source-2018h30a-fe-pm-${n}`), ...numbers.map(n => `question-template-source-2019h31h-fe-pm-${n}`)]));
  assert.deepEqual(sorted(bundle.templates.map(t => t.id)), sorted([...baseline.rows.map(row => row.template.id), ...numbers.map(templateId), ...numbers.map(n => `template-source-2017h29a-fe-pm-${n}`), ...numbers.map(n => `template-source-2018h30h-fe-pm-${n}`), ...numbers.map(n => `template-source-2018h30a-fe-pm-${n}`), ...numbers.map(n => `template-source-2019h31h-fe-pm-${n}`)]));
  assert.equal(bundle.questions.length, 508); assert.equal(bundle.templates.length, 254);
  for (const [setId, prefix, count] of [["set-sample-2022-apr-b", "sample-2022-apr-b", 6],
    ["set-sample-2022-dec-a", "sample-2022-dec-a", 60], ["set-sample-2022-dec-b", "sample-2022-dec-b", 20]] as const) {
    const set = one(bundle.sets, setId);
    assert.deepEqual(set.questionRefs.map(ref => ref.questionId), Array.from({ length: count }, (_, i) => `question-ipa-${prefix}-${i + 1}`));
  }
  assert.equal(collection.distribution, "included"); assert.equal(collection.subject, "B");
  assert.deepEqual(collection.questionRefs, refs); assert.equal(collection.questionRefs.length, 13);
  assert(sourceCollections(bundle, "B").some(set => set.id === collectionId));
  const policy = collection.questionSelection!; assert(policy);
  assert.deepEqual(policy.requiredQuestionRefs, [refs[0], refs[7]]);
  assert.deepEqual(policy.optionalGroups.map(group => ({ refs: group.questionRefs, choose: group.choose })),
    [{ refs: refs.slice(1, 7), choose: 4 }, { refs: refs.slice(8), choose: 1 }]);
  assert.equal(policy.excessPolicy, "paper_order");
  const mix = one(bundle.sets, "set-mix-2017-spring-pm"), globalMix = one(bundle.sets, "set-mix-b");
  assert.deepEqual(mix.questionRefs, bases.map(refOf));
  assert.deepEqual(mix.generationBindings, bases.map((q, i) => ({ questionRef: refOf(q), templateRef: { id: templates[i].id, revision: templates[i].revision } })));
  for (const [index, original] of originals.entries()) {
    const base = bases[index], template = templates[index];
    assert.equal(original.answerParts!.length, fieldCounts[index]); assert.equal(base.answerParts!.length, fieldCounts[index]);
    for (const question of [original, base]) {
      assert.equal(question.distribution, "included"); assert.equal(question.lifecycle, "active"); assert.equal(question.choiceShuffleAllowed, false);
      assert(question.origin.sourceRefs.some(ref => ref.locator.year === 2017 && ref.locator.period === "春期" &&
        ref.locator.timeSlot === "午後" && ref.locator.questionNumber === String(index + 1)));
    }
    assert.deepEqual(base.origin.derivedFrom, [refOf(original)]);
    assert.deepEqual(template.baseQuestionRef, refOf(base)); assert.equal(template.distribution, "included"); assert.equal(template.lifecycle, "active");
    assert.equal(template.generatorRef.id, `generator-source-2017h29h-fe-pm-${index + 1}`);
    assert.equal(template.originalContentSha256, await contentHash(base));
    assert.equal(globalMix.questionRefs.filter(ref => refKey(ref) === refKey(refOf(base))).length, 1);
    assert.equal(globalMix.generationBindings.filter(binding => refKey(binding.questionRef) === refKey(refOf(base)) && binding.templateRef.id === template.id).length, 1);
  }
  assert.equal(originals.reduce((sum, q) => sum + q.answerParts!.length, 0), 78);
});

test("実冊子の全75選択はannual/mixで同じ7大問を原順・9000秒で発行し、選択欄だけ採点してJSON再開する", async () => {
  const { bundle, refs } = realBooklet();
  bundle.questions.reverse(); // Pack order and caller order cannot choose source order.
  let combinations = 0, runs = 0;
  for (const chosenNumbers of legalSelections()) {
    const chosenRefs = chosenNumbers.map(number => refs[number - 1]);
    for (const kind of ["annual", "mix"] as const) {
      const config = selection(kind, reverse(chosenRefs)), selected = selectQuestions(bundle, config, reverse);
      const expectedIds = chosenNumbers.map(kind === "annual" ? originalId : baseId);
      assert.deepEqual(selected.questions.map(q => q.id), expectedIds);
      assert.equal(selected.exam.questionCount, 7); assert.equal(selected.exam.timeLimitSeconds, 9000); assert.equal(selected.exam.questionOrder, "set");
      for (const [index, question] of selected.questions.entries()) assert(familyOf(question, bundle).includes(refKey(chosenRefs[index])));
      let run = startRun(await prepareRun(bundle, config, {}, at), at);
      assert.deepEqual(run.session.entries.map(entry => entry.questionRef.questionId), expectedIds);
      assert.deepEqual(run.issued.map(q => q.answerParts!.length), chosenNumbers.map(number => fieldCounts[number - 1]));
      assert.equal(run.issued.length, 7); assert.equal(run.exam.timeLimitSeconds, 9000); assert.equal(run.exam.questionOrder, "set");
      assert.equal(run.instances.length, kind === "mix" ? 7 : 0);
      if (kind === "mix") assert.deepEqual(run.instances.map(instance => instance.templateRef.id), chosenNumbers.map(templateId));
      assert.equal(one(run.bundle.sets, collectionId).questionRefs.length, 13);
      correctEntries(run); assertScore(run, chosenNumbers);
      run.session.currentIndex = 3; run.session.entries[3].reviewFlag = true;
      const resumed = jsonRun(run);
      // JSON Run/state compatibility only. Blob/IndexedDB/browser acceptance is
      // separately required; no fake image data is used to claim that coverage.
      await validateRun(resumed);
      assert.deepEqual(resumed.selection, config); assert.deepEqual(resumed.issued, run.issued);
      assert.deepEqual(resumed.instances, run.instances); assert.deepEqual(resumed.session, run.session);
      assert.equal(resumed.session.currentIndex, 3); assert(resumed.session.entries[3].reviewFlag);
      run = finishRun(resumed, "completed", at + 2000);
      await validateRun(jsonRun(run));
      assert.equal(run.result!.total, 7); assert.equal(run.result!.correct, 7);
      assert.equal(run.result!.partSummary!.total, chosenNumbers.reduce((sum, number) => sum + fieldCounts[number - 1], 0));
      runs++;
    }
    combinations++;
  }
  assert.equal(combinations, 75); assert.equal(runs, 150);
});

test("実冊子の学習はannual/mixとも全13大問78欄を使い、部分選択や時間制限を引き継がない", async () => {
  const { bundle } = realBooklet();
  for (const kind of ["annual", "mix"] as const) {
    let run = startRun(await prepareRun(bundle, selection(kind, undefined, "study"), {}, at), at);
    assert.deepEqual(run.session.entries.map(entry => entry.questionRef.questionId), numbers.map(kind === "annual" ? originalId : baseId));
    assert.equal(run.issued.length, 13); assert.equal(run.exam.questionCount, 13); assert.equal(run.exam.timeLimitSeconds, undefined);
    assert.deepEqual(run.issued.map(q => q.answerParts!.length), fieldCounts);
    correctEntries(run); assertScore(run, numbers);
    // Exercise the real entry-edit API in addition to persisted field grading.
    const first = run.issued[0].answerParts![0], answer = run.session.entries[0].selectedPartChoices![first.id];
    run = updatePartAnswer(run, first.id, undefined, at + 500);
    assert.equal(resultFor(run, at + 600).partSummary!.unanswered, 1);
    run = updatePartAnswer(run, first.id, answer, at + 700);
    assertScore(run, numbers);
    await validateRun(jsonRun(run));
  }
});

test("実冊子の保存Runは合法な別大問への差替え・超過・重複・必須欠落・古い参照を拒否する", async () => {
  const { bundle, refs } = realBooklet();
  const chosen = [1, 2, 3, 4, 5, 8, 9].map(number => refs[number - 1]);
  for (const kind of ["annual", "mix"] as const) {
    const run = await prepareRun(bundle, selection(kind, chosen), {}, at);
    await validateRun(jsonRun(run));
    const otherLanguage = jsonRun(run);
    // Q9 and Q10 each have seven fields and share an area; quotas/length alone
    // must not let the saved language identity change beneath the issued run.
    otherLanguage.selection.selectedQuestionRefs![6] = refs[9];
    await assert.rejects(validateRun(otherLanguage), { code: "SESSION_CONFIG" });
    const otherGeneral = jsonRun(run); otherGeneral.selection.selectedQuestionRefs![4] = refs[5];
    await assert.rejects(validateRun(otherGeneral), { code: "SESSION_CONFIG" });
    for (const invalidRefs of [[...chosen, refs[9]], [chosen[0], ...chosen], chosen.filter(ref => refKey(ref) !== refKey(refs[7])),
      [...chosen.slice(0, -1), { ...refs[8], revision: refs[8].revision + 1 }]]) {
      const invalid = jsonRun(run); invalid.selection.selectedQuestionRefs = invalidRefs;
      await assert.rejects(validateRun(invalid), { code: "QUESTION_SELECTION" });
    }
    const mismatched = jsonRun(run);
    mismatched.selection.bindingMode = kind === "annual" ? "generated_values" : "original_data";
    await assert.rejects(validateRun(mismatched), { code: "SESSION_CONFIG" });
  }
});
