import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import test from 'node:test';
import evidence from '../../../scripts/source-evidence/legacy-2016-spring-pm-source-review.json';
import { readDistributionBundle } from '../../../scripts/distribution-files';
import { gradeAnswer, answerLabels } from '../../../src/core/answers';
import { bookmarkSource, bookmarkTemplate } from '../../../src/core/bookmarks';
import { generationCoverage } from '../../../src/core/generation-coverage';
import { sha256 } from '../../../src/core/hash';
import { menuSourceGroups, menuSubjectOptions, chooseMenuSourceGroup } from '../../../src/core/menu-selection';
import { questionSearchDocuments } from '../../../src/core/search';
import { selectQuestions } from '../../../src/core/selection';
import { finishRun, prepareRun, remaining, startRun, updatePartAnswer, validateRun } from '../../../src/core/session';
import { labels, refOf, type Question, type Run, type Selection } from '../../../src/core/types';
import { AnswerChoices } from '../../../src/ui/AnswerChoices';
import { Content } from '../../../src/ui/Content';

const bundle = readDistributionBundle();
const book = evidence.collectionId;
const setId = 'set-annual-2016-spring-pm';
const ref = (number: number) => ({ questionId: `question-ipa-${book}-${number}`, revision: 1 });
const original = (number: number) => {
  const question = bundle.questions.find(q => q.id === ref(number).questionId);
  assert(question, `official Q${number}`);
  return question;
};
const selection = (kind: 'annual' | 'mix', mode: 'study' | 'practice' = 'study'): Selection => ({
  kind, mode, subject: 'B', year: 2016, size: 'public',
  bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});
const assetIds = (q: Question) => q.contexts.flatMap(c => c.content.blocks.flatMap(b => b.type === 'image' ? [b.assetId] : []));

function selectedKeys(question: Question, reverseUnordered = false) {
  const selected: Record<string, string> = {};
  for (const answer of question.correctAnswer.parts!) {
    assert(answer.kind !== 'no_correct_answer');
    if (answer.kind === 'choice') selected[answer.partId] = answer.choiceId;
    else {
      const ids = reverseUnordered ? [...answer.choiceIds].reverse() : answer.choiceIds;
      answer.partIds.forEach((partId, i) => { selected[partId] = ids[i]; });
    }
  }
  return selected;
}

test('spring afternoon has one original, base, generator and mix binding for each official major and all 78 fields', () => {
  const coverage = generationCoverage(bundle);
  const seen = new Set<string>();
  let totalFields = 0;
  for (const row of evidence.questions) {
    const q = original(row.number);
    assert.equal(q.origin.kind, 'official_reprint');
    assert.equal(q.origin.isModified, false);
    assert.deepEqual(q.origin.sourceRefs.map(r => r.locator.page), row.pages);
    assert.equal(q.correctAnswer.attribution.sourceRefs[0].locator.page, evidence.answerPaper.keyPage);
    const selected = selectedKeys(q);
    const keys = q.answerParts!.map(part => labels[part.choiceIds.indexOf(selected[part.id])]).join('');
    assert.equal(keys, row.keys, `official answer table Q${row.number}`);
    const unordered = q.correctAnswer.parts!.filter(answer => answer.kind === 'unordered');
    assert.deepEqual(unordered.flatMap(group => group.partIds.map(id => q.answerParts!.findIndex(part => part.id === id) + 1)), row.unorderedFields ?? []);
    totalFields += q.answerParts!.length;
    const { base, template } = bookmarkTemplate(bundle, refOf(q), coverage);
    assert.equal(base.id, `question-template-source-${book}-${row.number}`);
    assert.equal(template.generatorRef.id, `generator-source-${book}-${row.number}`);
    assert.equal(bookmarkSource(bundle, refOf(base), coverage).id, q.id);
    seen.add(base.id);
  }
  assert.equal(totalFields, 78);
  const mix = bundle.sets.find(set => set.id === 'set-mix-2016-spring-pm')!;
  assert.equal(mix.generationBindings.length, 13);
  assert.deepEqual(new Set(mix.questionRefs.map(r => r.questionId)), seen);
});

test('spring afternoon includes only hash-pinned pages and the approved CASL excerpt', async () => {
  const assets = bundle.assets.filter(asset => asset.id.startsWith(`asset-ipa-${book}-`));
  assert.equal(assets.length, Object.keys(evidence.assetSHA256ByPage).length);
  const pageHashes = evidence.assetSHA256ByPage as Record<number, string>;
  for (const asset of assets) {
    const page = Number(asset.attribution.sourceRefs[0].locator.page);
    assert.equal(await sha256(fs.readFileSync(`public/data/${asset.path}`)), pageHashes[page]);
    assert.equal(asset.sha256, pageHashes[page]);
    if (page === 73) {
      assert.equal(asset.height, 1230);
      assert.equal(asset.attribution.origin, 'adapted');
      assert.match(asset.id, /-casl-excerpt$/);
    }
  }
  assert(!assets.some(asset => /page-0(?:69|70|73)\.webp$/.test(asset.path)));
  assert(assetIds(original(7)).some(id => id.endsWith('-p002')));
  assert.deepEqual(assetIds(original(8)), [`asset-ipa-${book}-p004`, `asset-ipa-${book}-p005`]);
  const java = original(11).contexts.find(c => c.content.attribution.sourceRefs.some(r => r.locator.page === 69));
  assert(java);
  assert.equal(java.content.attribution.origin, 'original');
  assert.deepEqual(java.content.attribution.sourceRefs.map(r => r.locator.page), [69, 70]);
  assert.deepEqual(java.content.attribution.rightsRefs, ['rights-original']);
  assert(!java.content.blocks.some(b => b.type === 'image'));
  assert(assetIds(original(12)).some(id => id.endsWith('-p073-casl-excerpt')));
});

test('spring afternoon is grouped with the existing morning booklet in both annual and mixed study', () => {
  const groups = menuSourceGroups(bundle);
  const group = groups.find(g => g.collections.some(c => c.id === setId));
  assert(group);
  assert.deepEqual(menuSubjectOptions(group).map(o => [o.title, o.available]), [['旧制度・午前', true], ['旧制度・午後', true]]);
  for (const kind of ['annual', 'mix'] as const) {
    const afternoon = chooseMenuSourceGroup(groups, selection(kind), group.id, 'B');
    assert.equal(selectQuestions(bundle, afternoon, q => q).questions.length, 13);
    const morning = chooseMenuSourceGroup(groups, afternoon, group.id, 'A');
    assert.equal(selectQuestions(bundle, morning, q => q).questions.length, 75);
  }
  const documents = new Set(questionSearchDocuments(bundle).map(d => d.question.id));
  for (const row of evidence.questions) assert(documents.has(ref(row.number).questionId));
});

test('spring afternoon timed practice keeps the chosen seven majors in paper order for 150 minutes', async () => {
  const refs = [12, 8, 7, 6, 4, 2, 1].map(ref);
  for (const kind of ['annual', 'mix'] as const) {
    const config = { ...selection(kind, 'practice'), selectedQuestionRefs: refs };
    const prepared = selectQuestions(bundle, config, q => q);
    assert.deepEqual(prepared.questions.map(q => Number(q.origin.sourceRefs[0].locator.questionNumber)), [1, 2, 4, 6, 7, 8, 12]);
    const timed = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    assert.equal(remaining(timed, 2000), 9000);
    assert.throws(() => selectQuestions(bundle, { ...config, selectedQuestionRefs: refs.slice(0, -1) }, q => q),
      { code: 'QUESTION_SELECTION' });
  }
});

test('spring afternoon unordered answers and the 78-field denominator survive save and resume', async () => {
  for (const kind of ['annual', 'mix'] as const) {
    const config = selection(kind);
    const prepared = selectQuestions(bundle, config, q => q);
    let run = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    for (const [i, question] of run.issued.entries()) {
      run.session.currentIndex = i;
      const selected = selectedKeys(question, true);
      assert.equal(gradeAnswer(question, { selectedPartChoices: selected }).outcome, 'correct');
      for (const [partId, choiceId] of Object.entries(selected))
        run = updatePartAnswer(run, partId, choiceId, 3000);
    }
    const saved = JSON.parse(JSON.stringify(run)) as Run;
    await validateRun(saved);
    assert.deepEqual(saved.session.entries, run.session.entries);
    assert.match(answerLabels(saved.issued[4]), /順不同/);
    const result = finishRun(saved, 'completed', 4000);
    await validateRun(result);
    assert.deepEqual(result.result!.partSummary, {
      total: 78, correct: 78, incorrect: 0, unanswered: 0, unscored: 0, learningAccuracyPercent: 100,
    });
  }
});

test('spring afternoon generated base questions render the full answer form with no revealed key', () => {
  const coverage = generationCoverage(bundle);
  for (const row of evidence.questions) {
    const { base } = bookmarkTemplate(bundle, ref(row.number), coverage);
    const prompt = render(h(Content, { content: base.prompt, bundle, assetUrls: {}, showAttribution: false }));
    assert(prompt.length > 150);
    assert(!prompt.includes('<details'), `question ${row.number}: necessary main prompt must be visible`);
    const choices = render(h(AnswerChoices, {
      question: base, entry: { choiceOrder: base.choices.map(c => c.id) }, bundle, assetUrls: {}, disabled: false, revealed: false,
    }));
    assert.equal((choices.match(/<fieldset/g) ?? []).length, row.keys.length);
    assert(!choices.includes('正答'));
  }
});
