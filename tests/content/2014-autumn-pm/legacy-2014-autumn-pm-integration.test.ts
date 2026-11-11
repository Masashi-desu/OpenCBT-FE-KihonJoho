import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import test from 'node:test';
import { readDistributionBundle } from '../../../scripts/distribution-files';
import evidence from '../../../scripts/source-evidence/legacy-2014-autumn-pm-source-review.json';
import { answerLabels, gradeAnswer } from '../../../src/core/answers';
import { bookmarkSource, bookmarkTemplate } from '../../../src/core/bookmarks';
import { generationCoverage } from '../../../src/core/generation-coverage';
import { sha256 } from '../../../src/core/hash';
import { chooseMenuSourceGroup, menuSourceGroups, menuSubjectOptions } from '../../../src/core/menu-selection';
import { questionSearchDocuments } from '../../../src/core/search';
import { selectQuestions } from '../../../src/core/selection';
import { finishRun, prepareRun, remaining, startRun, updatePartAnswer, validateRun } from '../../../src/core/session';
import { labels, refOf, type Question, type Run, type Selection } from '../../../src/core/types';
import { AnswerChoices } from '../../../src/ui/AnswerChoices';
import { Content } from '../../../src/ui/Content';

const bundle = readDistributionBundle();
const book = evidence.collectionId;
const setId = 'set-annual-2014-autumn-pm';
const ref = (number: number) => ({ questionId: `question-ipa-${book}-${number}`, revision: 1 });
const original = (number: number) => {
  const question = bundle.questions.find(q => q.id === ref(number).questionId);
  assert(question, `official Q${number}`);
  return question;
};
const selection = (kind: 'annual' | 'mix', mode: 'study' | 'practice' = 'study'): Selection => ({
  kind, mode, subject: 'B', year: 2014, size: 'public',
  bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});
const referenceAssets = (q: Question) => q.contexts.flatMap(context => context.content.blocks
  .flatMap(block => block.type === 'image' ? [block.assetId] : []));

function chooseCorrect(question: Question, reversePairs = false) {
  const selected: Record<string, string> = {};
  for (const answer of question.correctAnswer.parts!) {
    assert(answer.kind !== 'no_correct_answer');
    if (answer.kind === 'choice') selected[answer.partId] = answer.choiceId;
    else {
      const choices = reversePairs ? [...answer.choiceIds].reverse() : answer.choiceIds;
      answer.partIds.forEach((partId, index) => { selected[partId] = choices[index]; });
    }
  }
  return selected;
}

test('2014 autumn PM preserves 78 official answer rows, 79 selectable slots and one generated family per major', () => {
  const coverage = generationCoverage(bundle);
  const mix = bundle.sets.find(set => set.id === 'set-mix-2014-autumn-pm');
  assert(mix);
  let slots = 0;
  let officialRows = 0;
  for (const row of evidence.questions) {
    const question = original(row.number);
    assert.equal(question.origin.kind, 'official_reprint');
    assert.equal(question.origin.isModified, false);
    assert.deepEqual(question.origin.sourceRefs.map(ref => ref.locator.page), row.pages);
    assert.deepEqual(question.prompt.blocks.map(block => block.type === 'image' ? block.caption : ''),
      row.pages.map(page => `原資料 問${row.number}（印刷p.${page}／PDF p.${page}）`));
    assert.equal(question.correctAnswer.attribution.sourceRefs[0].locator.page, 1);
    const selected = chooseCorrect(question);
    const expected = row.fields.flatMap(field => field.key);
    const actual = question.answerParts!.map(part => labels[part.choiceIds.indexOf(selected[part.id])]);
    const unordered = question.correctAnswer.parts!.filter(answer => answer.kind === 'unordered');
    const unorderedSlots = unordered.map(group => group.partIds.map(id => question.answerParts!.findIndex(part => part.id === id)));
    assert.deepEqual(unorderedSlots, row.number === 2 ? [[3,4,5]] : row.number === 4 ? [[0,1]] : []);
    for (const group of unorderedSlots) {
      assert.deepEqual(group.map(index => actual[index]).sort(), group.map(index => expected[index]).sort());
      for (const index of group) actual[index] = expected[index];
    }
    assert.deepEqual(actual, expected);
    slots += question.answerParts!.length;
    officialRows += question.answerParts!.length - (row.number === 4 ? 1 : 0);
    const { base, template } = bookmarkTemplate(bundle, refOf(question), coverage);
    assert.equal(base.id, `question-template-source-${book}-${row.number}`);
    assert.equal(template.generatorRef.id, `generator-source-${book}-${row.number}`);
    assert.equal(bookmarkSource(bundle, refOf(base), coverage).id, question.id);
    assert.deepEqual(mix.generationBindings[row.number - 1], {
      questionRef: refOf(base), templateRef: { id: template.id, revision: template.revision },
    });
  }
  assert.equal(slots, 79);
  assert.equal(officialRows, 78);
  assert.equal(mix.generationBindings.length, 13);
});

test('2014 autumn PM distributes exactly the reviewed 86 pages and uses independently written Java notes', async () => {
  const assets = bundle.assets.filter(asset => asset.id.startsWith(`asset-ipa-${book}-`));
  const hashes = evidence.assetSHA256ByPage as Record<number, string>;
  assert.equal(assets.length, 86);
  assert.deepEqual(assets.map(asset => Number(asset.attribution.sourceRefs[0].locator.page)).sort((a, b) => a - b), Object.keys(hashes).map(Number));
  for (const asset of assets) {
    const page = Number(asset.attribution.sourceRefs[0].locator.page);
    assert.equal(await sha256(fs.readFileSync(`public/data/${asset.path}`)), hashes[page]);
    assert.equal(asset.sha256, hashes[page]);
    if (page === 81) {
      assert.deepEqual([asset.width, asset.height], [1433, 1184]);
      assert.equal(asset.attribution.origin, 'adapted');
      assert.match(asset.path, /-casl-excerpt\.webp$/);
      assert(!asset.alt.includes('JIS X 0201'));
    }
  }
  assert(!assets.some(asset => /page-0(?:70|78|81)\.webp$/.test(asset.path)));
  assert.deepEqual(referenceAssets(original(8)), [3, 4].map(page => `asset-ipa-${book}-p00${page}`));
  assert(referenceAssets(original(12)).includes(`asset-ipa-${book}-p081-casl-excerpt`));
  assert.equal(referenceAssets(original(13)).length, 8);
  const java = original(11).contexts.find(context => context.content.attribution.sourceRefs.some(ref => ref.locator.page === 78));
  assert(java);
  assert.equal(java.content.attribution.origin, 'original');
  assert.deepEqual(java.content.attribution.rightsRefs, ['rights-original']);
  assert.equal(java.content.attribution.sourceRefs.filter(ref => ref.sourceId.startsWith('source-java-se8-')).length, 1);
  assert(!java.content.blocks.some(block => block.type === 'image'));
  const characters = original(12).contexts.find(context => context.content.attribution.sourceRefs.some(ref => ref.sourceId.startsWith('source-rfc20-')));
  assert(characters);
  assert.equal(characters.content.attribution.origin, 'original');
  assert.deepEqual(characters.content.attribution.rightsRefs, ['rights-original']);
  assert(!characters.content.blocks.some(block => block.type === 'image'));
  assert.match(JSON.stringify(characters.content.blocks), /(?:#|0x|16進)30/);
});

test('2014 autumn AM and PM share the menu group and timed PM uses seven chosen majors for 150 minutes', async () => {
  const groups = menuSourceGroups(bundle);
  const group = groups.find(item => item.collections.some(collection => collection.id === setId));
  assert(group);
  assert.deepEqual(menuSubjectOptions(group).map(item => [item.title, item.available]), [['旧制度・午前', true], ['旧制度・午後', true]]);
  for (const kind of ['annual', 'mix'] as const) {
    const afternoon = chooseMenuSourceGroup(groups, selection(kind), group.id, 'B');
    assert.equal(selectQuestions(bundle, afternoon, items => items).questions.length, 13);
    const morning = chooseMenuSourceGroup(groups, afternoon, group.id, 'A');
    assert.equal(selectQuestions(bundle, morning, items => items).questions.length, 77);
    const selectedQuestionRefs = [12, 8, 7, 6, 4, 2, 1].map(ref);
    const config = { ...selection(kind, 'practice'), selectedQuestionRefs };
    const prepared = selectQuestions(bundle, config, items => items);
    assert.deepEqual(prepared.questions.map(q => Number(q.origin.sourceRefs[0].locator.questionNumber)), [1, 2, 4, 6, 7, 8, 12]);
    const timed = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    assert.equal(remaining(timed, 2000), 9000);
    assert.throws(() => selectQuestions(bundle, { ...config, selectedQuestionRefs: selectedQuestionRefs.slice(0, -1) }),
      { code: 'QUESTION_SELECTION' });
  }
  const documents = new Set(questionSearchDocuments(bundle).map(document => document.question.id));
  for (const row of evidence.questions) assert(documents.has(ref(row.number).questionId));
});

test('2014 autumn PM the unordered fields, choose-two field and all 79 slots grade after JSON save and resume', async () => {
  for (const kind of ['annual', 'mix'] as const) {
    const config = selection(kind);
    const prepared = selectQuestions(bundle, config, items => items);
    let run = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    for (const [index, question] of run.issued.entries()) {
      run.session.currentIndex = index;
      const selected = chooseCorrect(question, true);
      assert.equal(gradeAnswer(question, { selectedPartChoices: selected }).outcome, 'correct');
      for (const [partId, choiceId] of Object.entries(selected)) run = updatePartAnswer(run, partId, choiceId, 3000);
    }
    const saved = JSON.parse(JSON.stringify(run)) as Run;
    await validateRun(saved);
    assert.deepEqual(saved.session.entries, run.session.entries);
    assert.equal((answerLabels(saved.issued[1]).match(/順不同/g) ?? []).length, 3);
    assert.equal((answerLabels(saved.issued[3]).match(/順不同/g) ?? []).length, 2);
    const result = finishRun(saved, 'completed', 4000);
    await validateRun(result);
    assert.deepEqual(result.result!.partSummary, { total: 79, correct: 79, incorrect: 0, unanswered: 0, unscored: 0, learningAccuracyPercent: 100 });
  }
});

test('2014 autumn PM generated base renders all prompts and answer fields before revealing answers', () => {
  const coverage = generationCoverage(bundle);
  for (const row of evidence.questions) {
    const { base } = bookmarkTemplate(bundle, ref(row.number), coverage);
    const prompt = render(h(Content, { content: base.prompt, bundle, assetUrls: {}, showAttribution: false }));
    assert(prompt.length > 150);
    assert(!prompt.includes('<details'), `question ${row.number}: the main prompt must be visible`);
    const answers = render(h(AnswerChoices, { question: base, entry: { choiceOrder: base.choices.map(choice => choice.id) },
      bundle, assetUrls: {}, disabled: false, revealed: false }));
    assert.equal((answers.match(/<fieldset/g) ?? []).length, row.selectionSlots);
    assert(!answers.includes('正答'));
  }
});
