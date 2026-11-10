import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { compoundQuestion, compoundRun } from './fixtures/compound-question';
import { fixture } from './fixtures';
import { answerLabels, displayedAnswerParts, gradeAnswer, validateAnswerDefinition, validateEntryAnswers } from '../src/core/answers';
import { contentHash } from '../src/core/hash';
import { finishRun, startRun, updatePartAnswer, validateRun } from '../src/core/session';
import type { Question, Run } from '../src/core/types';
import { schema } from '../src/core/validation';
import { AnswerChoices } from '../src/ui/AnswerChoices';

function setChecklist(question: Question) {
  const group = question.correctAnswer.parts!.find(key => key.kind === 'unordered');
  assert(group);
  group.presentation = 'checklist';
  validateAnswerDefinition(question);
  schema('question', question);
}

test('a checklist grades one field as a complete set and preserves historical separately marked slots', () => {
  const ordinary = compoundQuestion();
  const checklist = structuredClone(ordinary);
  setChecklist(checklist);
  assert.deepEqual(displayedAnswerParts(ordinary).map(part => part.id), ['part-a', 'part-b', 'part-c', 'part-f']);
  assert.deepEqual(displayedAnswerParts(checklist).map(part => part.id), ['part-a', 'part-b', 'part-f']);
  const responses = [
    [{ 'part-b': 'choice-one', 'part-c': 'choice-three' }, 'correct'],
    [{ 'part-b': 'choice-three', 'part-c': 'choice-one' }, 'correct'],
    [{ 'part-b': 'choice-one', 'part-c': 'choice-two' }, 'incorrect'],
    [{ 'part-b': 'choice-one' }, 'unanswered'],
  ] as const;
  for (const [selected, outcome] of responses) {
    const grade = gradeAnswer(checklist, { selectedPartChoices: { 'part-a': 'choice-two', ...selected } });
    assert.deepEqual(grade.parts, [
      { partId: 'part-a', outcome: 'correct' },
      { partId: 'part-b', outcome },
      { partId: 'part-f', outcome: 'unscored' },
    ]);
    assert.equal(grade.outcome, outcome);
  }
  const duplicate = { selectedPartChoices: { 'part-b': 'choice-one', 'part-c': 'choice-one' } };
  assert.doesNotThrow(() => validateEntryAnswers(ordinary, duplicate));
  assert.throws(() => validateEntryAnswers(checklist, duplicate), { code: 'ANSWER_REF' });
  const invalid = structuredClone(checklist);
  const key = invalid.correctAnswer.parts!.find(answer => answer.kind === 'unordered');
  assert(key);
  key.choiceIds[1] = key.choiceIds[0];
  assert.throws(() => validateAnswerDefinition(invalid), { code: 'ANSWER_PARTS' });
});

test('a saved checklist restores its chosen entries, presents one group and counts one scored field', async () => {
  const draft = await compoundRun();
  const question = draft.issued[0];
  setChecklist(question);
  draft.session.entries[0].issuedContent.contentSha256 = await contentHash(question);
  let run = startRun(draft, 101000);
  run = updatePartAnswer(run, 'part-a', 'choice-two', 102000);
  run = updatePartAnswer(run, 'part-b', 'choice-three', 102000);
  assert.throws(() => updatePartAnswer(run, 'part-c', 'choice-three', 102000), { code: 'ANSWER_REF' });
  run = updatePartAnswer(run, 'part-c', 'choice-one', 102000);
  const saved: Run = JSON.parse(JSON.stringify(run));
  await validateRun(saved);
  const finished = finishRun(saved, 'completed', 103000);
  await validateRun(finished);
  assert.deepEqual(finished.result?.partSummary, {
    total: 3, correct: 2, incorrect: 0, unanswered: 0, unscored: 1, learningAccuracyPercent: 100,
  });
  assert.match(answerLabels(question), /設問2 b：ア・ウ（順不同）/);
  assert.doesNotMatch(answerLabels(question), /設問2 c/);
  const html = renderToStaticMarkup(createElement(AnswerChoices, {
    question, entry: saved.session.entries[0], bundle: fixture(), assetUrls: {}, disabled: false,
    revealed: true, showResponse: true,
  }));
  assert.equal([...html.matchAll(/type="checkbox"/g)].length, 3);
  assert.equal([...html.matchAll(/type="radio"/g)].length, 6);
  assert.equal([...html.matchAll(/設問2 b（2つ選択）/g)].length, 1);
  assert(!html.includes('設問2 c'));
  assert.match(html, /aria-live="polite">2／2選択済み/);
  assert.equal([...html.matchAll(/type="checkbox"[^>]+disabled=""/g)].length, 1);
});
