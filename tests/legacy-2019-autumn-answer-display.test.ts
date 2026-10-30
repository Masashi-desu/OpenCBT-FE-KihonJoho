import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readDistributionBundle } from '../scripts/distribution-files';
import { AnswerChoices } from '../src/ui/AnswerChoices';
import { Content } from '../src/ui/Content';
import { bindQuestion } from '../src/core/generation';
import { legacy2019AutumnAfternoonDefinitions as definitions } from '../src/core/generators/legacy-2019-autumn-afternoon';
import type { Bundle, Question } from '../src/core/types';

const plain = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
function assertVisibleBanks(q: Question, bundle: Bundle, html: string) {
  const fields = [...html.matchAll(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/g)].map(m => m[1]);
  assert.equal(fields.length, q.answerParts!.length, q.id);
  for (let i = 0; i < fields.length; i++) {
    const part = q.answerParts![i], field = fields[i];
    assert.equal((field.match(/class="choice-body"/g) ?? []).length, part.choiceIds.length, `${q.id}:${part.id}`);
    for (const id of part.choiceIds) {
      const choice = q.choices.find(c => c.id === id)!;
      const expected = plain(renderToStaticMarkup(createElement(Content, { content: choice.content, bundle, assetUrls: {}, showAttribution: false })));
      assert(expected.length > 0, `${q.id}:${id} has visible text, program, table or figure`);
      assert(plain(field).includes(expected), `${q.id}:${part.id}:${id} actual answer-bank content must be readable`);
    }
  }
}

test('all13 autumn generated questions display every bank in each answer field, including tuples, code and diagrams', () => {
  const b = readDistributionBundle();
  assert.equal(definitions.length, 13);
  for (const d of definitions) {
    const t = b.templates.find(t => t.generatorRef.id === `generator-source-${d.source}`)!;
    const base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
    const alternate = d.fields.flatMap((f, i) => [f.minimum, f.maximum].map(value => d.reference.map((v, j) => j === i ? value : v)))
      .find(values => JSON.stringify(values) !== JSON.stringify(d.reference) && (() => { try { d.build(values); return true; } catch { return false; } })());
    assert(alternate, `${d.source} has a second condition`);
    for (const values of [[...d.reference], alternate]) {
      const q = bindQuestion(base, t, values, 'answer-display', '2026-10-30T00:00:00Z');
      const html = renderToStaticMarkup(createElement(AnswerChoices, { question: q, entry: { choiceOrder: q.choices.map(c => c.id) }, bundle: b, assetUrls: {}, disabled: false, revealed: false }));
      assertVisibleBanks(q, b, html);
      assert(!html.includes('本文の「'), `${d.source} does not replace its banks with letters`);
      const material = renderToStaticMarkup(createElement(Content, { content: q.prompt, bundle: b, assetUrls: {}, showAttribution: false }));
      assert(!/<style\b/i.test(material), `${d.source}: generated material respects production style-src-elem self`);
    }
  }
});

test('the display oracle rejects the previously observed letter-only autumn bank failure', () => {
  const b = readDistributionBundle(), q = b.questions.find(q => q.id === 'question-template-source-2019r01a-fe-pm-5')!;
  const hidden = q.answerParts!.map(p => `<fieldset>${p.choiceIds.map(() => '<span class="choice-body">本文の「ア」</span>').join('')}</fieldset>`).join('');
  assert.throws(() => assertVisibleBanks(q, b, hidden), /actual answer-bank content must be readable/);
});
