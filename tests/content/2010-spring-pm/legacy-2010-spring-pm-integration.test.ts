import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import test from 'node:test';
import { readDistributionBundle } from '../../../scripts/distribution-files';
import evidence from '../../../scripts/source-evidence/legacy-2010-spring-pm-source-review.json';
import { displayedAnswerParts, gradeAnswer } from '../../../src/core/answers';
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
const setId = 'set-annual-2010-spring-pm';
const held = evidence.held.map((row: { number: number }) => row.number);
const admitted = evidence.questions.filter(row => !held.includes(row.number));
const fieldCount = admitted.reduce((sum, row) => sum + row.fields.length, 0);
const ref = (number: number) => ({ questionId: `question-ipa-${book}-${number}`, revision: 1 });
const original = (number: number) => {
  const question = bundle.questions.find(q => q.id === ref(number).questionId);
  assert(question, `official Q${number}`);
  return question;
};
const selection = (kind: 'annual' | 'mix', mode: 'study' | 'practice' = 'study'): Selection => ({
  kind, mode, subject: 'B', year: 2010, size: 'public', bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});
const referenceAssets = (q: Question) => q.contexts.flatMap(context => context.content.blocks
  .flatMap(block => block.type === 'image' ? [block.assetId] : []));

function correctParts(question: Question, reverseGroups = false) {
  const selected: Record<string, string> = {};
  for (const answer of question.correctAnswer.parts!) {
    assert(answer.kind !== 'no_correct_answer');
    if (answer.kind === 'choice') selected[answer.partId] = answer.choiceId;
    else {
      const choices = reverseGroups ? [...answer.choiceIds].reverse() : answer.choiceIds;
      answer.partIds.forEach((partId, index) => { selected[partId] = choices[index]; });
    }
  }
  return selected;
}

test('S3-028 keeps 13 official positions and 81 fields, and binds every admitted major to its own generator', () => {
  assert.deepEqual(evidence.questions.map(row => row.number), Array.from({ length: 13 }, (_, index) => index + 1));
  assert.equal(evidence.questions.reduce((sum, row) => sum + row.fields.length, 0), 81);
  const coverage = generationCoverage(bundle);
  const mix = bundle.sets.find(set => set.id === 'set-mix-2010-spring-pm');
  assert(mix);
  for (const [index, row] of admitted.entries()) {
    const question = original(row.number);
    assert.equal(question.origin.kind, 'official_reprint');
    assert.equal(question.origin.isModified, false);
    assert.deepEqual(question.origin.sourceRefs.map(ref => ref.locator.page), row.pages);
    assert(question.origin.sourceRefs.every(ref => ref.locator.period === '春期' && ref.locator.timeSlot === '午後'));
    assert.equal(question.correctAnswer.attribution.sourceRefs[0].locator.page, 1);
    const answers = correctParts(question);
    const marks = question.answerParts!.map(part => labels[part.choiceIds.indexOf(answers[part.id])]);
    const expected = row.fields.flatMap(field => field.key);
    assert.equal(displayedAnswerParts(question).length, expected.length);
    const unordered = question.correctAnswer.parts!.filter(answer => answer.kind === 'unordered');
    assert.deepEqual(unordered.map(group => group.partIds.map(id => question.answerParts!.findIndex(part => part.id === id))),
      row.number === 6 ? [[0, 1]] : []);
    assert(unordered.every(group => group.presentation === undefined));
    if (row.number === 6) {
      assert.deepEqual(marks.slice(0, 2).sort(), expected.slice(0, 2).sort());
      assert.deepEqual(marks.slice(2), expected.slice(2));
    } else assert.deepEqual(marks, expected);
    const { base, template } = bookmarkTemplate(bundle, refOf(question), coverage);
    assert.equal(base.id, `question-template-source-${book}-${row.number}`);
    assert.equal(template.generatorRef.id, `generator-source-${book}-${row.number}`);
    assert.equal(bookmarkSource(bundle, refOf(base), coverage).id, question.id);
    assert.deepEqual(mix.generationBindings[index], {
      questionRef: refOf(base), templateRef: { id: template.id, revision: template.revision },
    });
  }
  for (const n of held) assert(!bundle.questions.some(q => q.id === ref(n).questionId || q.id === `question-template-source-${book}-${n}`));
  assert.equal(mix.generationBindings.length, admitted.length);
});

test('S3-028 serves only the admitted images and labels the CASL II excerpt with its real page', async () => {
  const hashes = evidence.assetSHA256ByPage as Record<number, string>;
  const assets = bundle.assets.filter(asset => asset.id.startsWith(`asset-ipa-${book}-`));
  assert.deepEqual(assets.map(asset => Number(asset.attribution.sourceRefs[0].locator.page)).sort((a, b) => a - b), Object.keys(hashes).map(Number));
  for (const asset of assets) {
    const page = Number(asset.attribution.sourceRefs[0].locator.page);
    assert.equal(await sha256(fs.readFileSync(`public/data/${asset.path}`)), hashes[page]);
    assert.equal(asset.sha256, hashes[page]);
    if (page === 82) {
      assert.deepEqual([asset.width, asset.height], [906, 740]);
      assert.equal(asset.attribution.origin, 'adapted');
      assert.match(asset.path, /-casl-excerpt\.webp$/);
      assert(!asset.alt.includes('JIS X 0201'));
    }
  }
  assert(!assets.some(asset => /page-082\.webp$/.test(asset.path)));
  for (const number of [1, 8].filter(number => !held.includes(number))) {
    const expected = [3, 4].map(page => `asset-ipa-${book}-p00${page}`);
    assert.deepEqual(referenceAssets(original(number)), expected);
    assert.deepEqual(referenceAssets(bookmarkTemplate(bundle, ref(number), generationCoverage(bundle)).base), expected);
  }
  if (!held.includes(11)) assert.deepEqual(referenceAssets(original(11)), []);
  if (!held.includes(12)) assert(referenceAssets(original(12)).includes(`asset-ipa-${book}-p082-casl-excerpt`));
  if (!held.includes(13)) assert.deepEqual(referenceAssets(original(13)), [86, 87, 88].map(page => `asset-ipa-${book}-p0${page}`));
});

test('S3-028 groups spring AM and PM in both menu modes', () => {
  const groups = menuSourceGroups(bundle);
  const group = groups.find(item => item.collections.some(collection => collection.id === setId));
  assert(group);
  assert.equal(group.period, '春期');
  assert.equal(group.title, '旧制度 · 2010年度 春期');
  assert.deepEqual(group.collections.map(item => item.id), ['set-annual-2010h22h-fe-am', setId]);
  assert.deepEqual(menuSubjectOptions(group).map(item => [item.title, item.available]), [['旧制度・午前', true], ['旧制度・午後', true]]);
  for (const kind of ['annual', 'mix'] as const) {
    const afternoon = chooseMenuSourceGroup(groups, selection(kind), group.id, 'B');
    assert.equal(selectQuestions(bundle, afternoon, items => items).questions.length, admitted.length);
    const morning = chooseMenuSourceGroup(groups, afternoon, group.id, 'A');
    assert.equal(selectQuestions(bundle, morning, items => items).questions.length, 78);
  }
  const documents = new Set(questionSearchDocuments(bundle).map(document => document.question.id));
  assert(admitted.every(row => documents.has(ref(row.number).questionId)));
  assert(held.every(n => !documents.has(ref(n).questionId)));
});

test('S3-028 grades all published fields in both issuance modes after save and resume', async () => {
  for (const kind of ['annual', 'mix'] as const) {
    const config = selection(kind);
    const prepared = selectQuestions(bundle, config, items => items);
    let run = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    for (const [index, question] of run.issued.entries()) {
      run.session.currentIndex = index;
      const selected = correctParts(question, true);
      assert.equal(gradeAnswer(question, { selectedPartChoices: selected }).outcome, 'correct');
      for (const [partId, choiceId] of Object.entries(selected)) run = updatePartAnswer(run, partId, choiceId, 3000);
    }
    const saved = JSON.parse(JSON.stringify(run)) as Run;
    await validateRun(saved);
    assert.deepEqual(saved.session.entries, run.session.entries);
    const total = saved.session.entries.reduce((sum, row) => sum + Object.keys(row.selectedPartChoices ?? {}).length, 0);
    assert.equal(total, fieldCount);
    const result = finishRun(saved, 'completed', 4000);
    await validateRun(result);
    assert.deepEqual(result.result!.partSummary, { total: fieldCount, correct: fieldCount, incorrect: 0, unanswered: 0, unscored: 0, learningAccuracyPercent: 100 });
  }
});

test('S3-028 generated bases show every separate field before revealing the answers', () => {
  const coverage = generationCoverage(bundle);
  for (const row of admitted) {
    const { base } = bookmarkTemplate(bundle, ref(row.number), coverage);
    const prompt = render(h(Content, { content: base.prompt, bundle, assetUrls: {}, showAttribution: false }));
    assert(prompt.length > 150);
    assert(!prompt.includes('<details'), `question ${row.number}: the main prompt must be visible`);
    const answers = render(h(AnswerChoices, { question: base, entry: { choiceOrder: base.choices.map(choice => choice.id) },
      bundle, assetUrls: {}, disabled: false, revealed: false }));
    assert.equal((answers.match(/<fieldset/g) ?? []).length, row.fields.length);
    assert(!answers.includes('type="checkbox"') && !answers.includes('正答'));
  }
});

test('S3-028 treats Q6 a and b as separate fields that can be answered in either order', () => {
  if (!held.length) assert.equal(fieldCount, 81);
  for (const row of admitted) {
    const question = original(row.number);
    const parts = question.answerParts!;
    const answers = question.correctAnswer.parts!;
    assert.equal(new Set(parts.map(part => part.id)).size, row.fields.length);
    assert.equal(answers.length, row.fields.length - (row.number === 6 ? 1 : 0));
    assert(parts.every(part => part.choiceIds.length >= 2));
    if (row.number !== 6) {
      assert(answers.every(answer => answer.kind === 'choice'));
      continue;
    }
    const group = answers.find(answer => answer.kind === 'unordered');
    assert(group && group.presentation === undefined);
    assert.deepEqual(group.partIds, parts.slice(0, 2).map(part => part.id));
    assert.deepEqual(parts[0].choiceIds, parts[1].choiceIds);
    for (const reverse of [false, true]) assert.equal(gradeAnswer(question,
      { selectedPartChoices: correctParts(question, reverse) }).outcome, 'correct');
    const repeated = correctParts(question);
    repeated[group.partIds[0]] = repeated[group.partIds[1]];
    assert.equal(gradeAnswer(question, { selectedPartChoices: repeated }).outcome, 'incorrect');
  }
});

test('S3-028 follows every admitted official seven-major selection, or offers timed practice for the published subset', async () => {
  const numbers = admitted.map(row => row.number);
  const general = numbers.filter(number => number <= 7);
  const languages = numbers.filter(number => number >= 9);
  const annual = bundle.sets.find(set => set.id === setId);
  assert(annual);
  const official = numbers.includes(8) && general.length >= 5 && languages.length > 0;
  assert.equal(Boolean(annual.questionSelection), official);
  for (const kind of ['annual', 'mix'] as const) {
    const timed = selection(kind, 'practice');
    if (!official) {
      assert.equal(selectQuestions(bundle, timed, items => items).questions.length, numbers.length);
      continue;
    }
    const expectedSets = new Set<string>();
    for (let mask = 0; mask < 1 << general.length; mask++) {
      const five = general.filter((_, index) => mask & 1 << index);
      if (five.length !== 5) continue;
      for (const language of languages) {
        const expected = [...five, 8, language];
        const config = { ...timed, selectedQuestionRefs: [...expected].reverse().map(ref) };
        const prepared = selectQuestions(bundle, config, items => items);
        const issued = prepared.questions.map(q => Number(q.origin.sourceRefs[0].locator.questionNumber));
        assert.deepEqual(issued, expected);
        assert.equal(prepared.exam.timeLimitSeconds, 9000);
        expectedSets.add(issued.join(','));
      }
    }
    if (!held.length) assert.equal(expectedSets.size, 105);
    assert.throws(() => selectQuestions(bundle, { ...timed, selectedQuestionRefs: [...general.slice(0, 5), languages[0]].map(ref) }),
      { code: 'QUESTION_SELECTION' });
    const config = { ...timed, selectedQuestionRefs: [...general.slice(0, 5), 8, languages[0]].map(ref) };
    const prepared = selectQuestions(bundle, config, items => items);
    const run = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    assert.equal(remaining(run, 2000), 9000);
  }
});
