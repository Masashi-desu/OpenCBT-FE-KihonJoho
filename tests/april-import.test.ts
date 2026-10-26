import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { aprilBReview as review } from "./fixtures/pre-2023-sample-review";
import { selectQuestions } from "../src/core/selection";
import { sourceQuestionLabel } from "../src/core/source-label";
import { questionSearchDocuments, findSearchDocuments, emptySearch } from "../src/core/search";
import { prepareRun, startRun, finishRun, updateAnswer, validateRun } from "../src/core/session";

test("April sample collection preserves all pages, choices and answers without inventing an exam year", async () => {
  const b = fixture(), selection = { subject: "B", kind: "annual", sourceCollectionId: "set-sample-2022-apr-b", mode: "study", size: "public", bindingMode: "original_data" } as const;
  const selected = selectQuestions(b, selection);
  assert.equal(selected.questions.length, 6);
  for (const [index, q] of selected.questions.entries()) {
    const expected = review.questions[index], ref = q.origin.sourceRefs[0];
    assert.equal(q.id, `question-ipa-sample-2022-apr-b-${index + 1}`);
    assert.equal(ref.locator.year, undefined);
    assert.equal(b.sources.find(s => s.id === ref.sourceId)!.sha256, review.questionPaper.sha256);
    assert.equal(q.choices.length, expected.choices.length);
    const images = q.prompt.blocks.filter(block => block.type === "image");
    assert.deepEqual(images.map(i => b.assets.find(a => a.id === i.assetId)!.attribution.sourceRefs[0].locator.page), [...expected.pages]);
    assert(q.prompt.blocks.some(block => block.type === "code" && block.text.length > 100));
    assert.equal(q.correctAnswer.attribution.sourceRefs[0].locator.page, 11);
    assert.equal(q.choices.find(c => c.id === q.correctAnswer.choiceId)!.content.blocks[0].type, "paragraph");
    assert.equal(q.origin.isModified, false);
    assert(sourceQuestionLabel(q).startsWith("2022年4月公表 サンプル問題 科目B"));
    const rights = b.rights.find(r => r.id === q.prompt.attribution.rightsRefs[0])!;
    assert(rights.attributionText.includes(review.attribution));
    assert(rights.assessmentNotes.includes("プロジェクト判断"));
    assert(!rights.licenseId.includes("MIT"));
  }
  const timed = selectQuestions(b, { ...selection, mode: "practice" });
  assert.equal(timed.exam.timeLimitSeconds, 1800);
  let run = startRun(await prepareRun(b, selection, {}, 100000), 101000);
  for (const [i, q] of run.issued.entries()) {
    run.session.currentIndex = i;
    run = updateAnswer(run, q.correctAnswer.choiceId!, 102000 + i);
  }
  await validateRun(run);
  const complete = finishRun(run, "completed", 103000);
  assert.equal(complete.result!.correct, 6); assert.equal(complete.result!.learningAccuracyPercent, 100);
  await validateRun(complete);
});

test("publication-year search finds all six samples and keeps publication wording in their titles", () => {
  const b = fixture(), matches = findSearchDocuments(questionSearchDocuments(b), { ...emptySearch, year: 2022 }).filter(d => d.title.includes("4月公表"));
  assert.equal(matches.length, 6);
  assert(matches.every(d => d.year === 2022 && d.title.includes("2022年4月公表") && !d.title.includes("年度")));
});
