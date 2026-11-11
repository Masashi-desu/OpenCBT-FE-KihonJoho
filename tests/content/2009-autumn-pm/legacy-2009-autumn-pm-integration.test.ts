import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import test from 'node:test';
import { readDistributionBundle } from '../../../scripts/distribution-files';
import evidence from '../../../scripts/source-evidence/legacy-2009-autumn-pm-source-review.json';
import { displayedAnswerParts, gradeAnswer, partAnswerLabels } from '../../../src/core/answers';
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
const setId = 'set-annual-2009-autumn-pm';
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
  kind, mode, subject: 'B', year: 2009, size: 'public', bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});
const referenceAssets = (q: Question) => q.contexts.flatMap(context => context.content.blocks
  .flatMap(block => block.type === 'image' ? [block.assetId] : []));

function correctParts(question: Question, reverseGroups = false, omitCredited = false) {
  const selected: Record<string, string> = {};
  for (const answer of question.correctAnswer.parts!) {
    assert(answer.kind !== 'no_correct_answer');
    if (answer.kind === 'choice') {
      if (!omitCredited || answer.officialCreditReason === undefined) selected[answer.partId] = answer.choiceId;
    }
    else {
      const choices = reverseGroups ? [...answer.choiceIds].reverse() : answer.choiceIds;
      answer.partIds.forEach((partId, index) => { selected[partId] = choices[index]; });
    }
  }
  return selected;
}

test('S3-030 keeps 13 official positions and 81 fields, and binds every admitted major to its own generator', () => {
  assert.deepEqual(evidence.questions.map(row => row.number), Array.from({ length: 13 }, (_, index) => index + 1));
  assert.equal(evidence.questions.reduce((sum, row) => sum + row.fields.length, 0), 81);
  const coverage = generationCoverage(bundle);
  const mix = bundle.sets.find(set => set.id === 'set-mix-2009-autumn-pm');
  assert(mix);
  for (const [index, row] of admitted.entries()) {
    const question = original(row.number);
    assert.equal(question.origin.kind, 'official_reprint');
    assert.equal(question.origin.isModified, false);
    assert.deepEqual(question.origin.sourceRefs.map(ref => ref.locator.page), row.pages);
    assert(question.origin.sourceRefs.every(ref => ref.locator.period === '秋期' && ref.locator.timeSlot === '午後'));
    assert.equal(question.correctAnswer.attribution.sourceRefs[0].locator.page, 1);
    const answers = correctParts(question);
    const marks = question.answerParts!.map(part => labels[part.choiceIds.indexOf(answers[part.id])]);
    const expected = row.fields.flatMap(field => field.key);
    assert.equal(displayedAnswerParts(question).length, expected.length);
    const unordered = question.correctAnswer.parts!.filter(answer => answer.kind === 'unordered');
    const groups = evidence.unorderedGroups.filter(group => group.question === row.number)
      .map(group => group.fields.map(field => row.fields.findIndex(slot => slot.locator === field)));
    assert.deepEqual(unordered.map(group => group.partIds.map(id => question.answerParts!.findIndex(part => part.id === id))), groups);
    assert(unordered.every(group => group.presentation === undefined));
    for (const group of groups) assert.deepEqual(group.map(index => marks[index]).sort(), group.map(index => expected[index]).sort());
    marks.forEach((mark, index) => {
      if (groups.every(group => !group.includes(index))) assert.equal(mark, expected[index]);
    });
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

test('S3-030 serves only the admitted images and labels the CASL II excerpt with its real page', async () => {
  const hashes = evidence.assetSHA256ByPage as Record<number, string>;
  const assets = bundle.assets.filter(asset => asset.id.startsWith(`asset-ipa-${book}-`));
  assert.deepEqual(assets.map(asset => Number(asset.attribution.sourceRefs[0].locator.page)).sort((a, b) => a - b), Object.keys(hashes).map(Number));
  for (const asset of assets) {
    const page = Number(asset.attribution.sourceRefs[0].locator.page);
    assert.equal(await sha256(fs.readFileSync(`public/data/${asset.path}`)), hashes[page]);
    assert.equal(asset.sha256, hashes[page]);
    if (page === 68) {
      assert.deepEqual([asset.width, asset.height], [1264, 1018]);
      assert.equal(asset.attribution.origin, 'adapted');
      assert.match(asset.path, /-casl-excerpt\.webp$/);
      assert(!asset.alt.includes('JIS X 0201'));
    }
  }
  assert(!assets.some(asset => /page-068\.webp$/.test(asset.path)));
  const sharedMaterials = { 2: [5], 8: [3, 4] };
  for (const [number, pages] of Object.entries(sharedMaterials)) {
    if (held.includes(Number(number))) continue;
    const expected = pages.map(page => `asset-ipa-${book}-p00${page}`);
    const question = original(Number(number));
    assert.deepEqual(referenceAssets(question), expected);
    assert.deepEqual(referenceAssets(bookmarkTemplate(bundle, refOf(question), generationCoverage(bundle)).base), expected);
  }
  if (!held.includes(11)) assert.deepEqual(referenceAssets(original(11)), []);
  if (!held.includes(12)) assert(referenceAssets(original(12)).includes(`asset-ipa-${book}-p068-casl-excerpt`));
  if (!held.includes(13)) assert.deepEqual(referenceAssets(original(13)), [72, 73, 74].map(page => `asset-ipa-${book}-p0${page}`));
});

test('S3-030 groups autumn AM and PM in both menu modes', () => {
  const groups = menuSourceGroups(bundle);
  const group = groups.find(item => item.collections.some(collection => collection.id === setId));
  assert(group);
  assert.equal(group.period, '秋期');
  assert.equal(group.title, '旧制度 · 2009年度 秋期');
  assert.deepEqual(group.collections.map(item => item.id), ['set-annual-2009h21a-fe-am', setId]);
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

test('S3-030 grades all published fields in both issuance modes after save and resume', async () => {
  for (const kind of ['annual', 'mix'] as const) {
    const config = selection(kind);
    const prepared = selectQuestions(bundle, config, items => items);
    let run = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    for (const [index, question] of run.issued.entries()) {
      run.session.currentIndex = index;
      const selected = correctParts(question, true, true);
      assert.equal(gradeAnswer(question, { selectedPartChoices: selected }).outcome, 'correct');
      for (const [partId, choiceId] of Object.entries(selected)) run = updatePartAnswer(run, partId, choiceId, 3000);
    }
    const saved = JSON.parse(JSON.stringify(run)) as Run;
    await validateRun(saved);
    assert.deepEqual(saved.session.entries, run.session.entries);
    const total = saved.session.entries.reduce((sum, row) => sum + Object.keys(row.selectedPartChoices ?? {}).length, 0);
    assert.equal(total, fieldCount - (kind === "annual" && !held.includes(8) ? 2 : 0));
    const result = finishRun(saved, 'completed', 4000);
    await validateRun(result);
    assert.deepEqual(result.result!.partSummary, { total: fieldCount, correct: fieldCount, incorrect: 0, unanswered: 0, unscored: 0, learningAccuracyPercent: 100 });
  }
});

test('S3-030 generated bases show every separate field before revealing the answers', () => {
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

test('S3-030 preserves four unordered pairs as distinct answer fields', () => {
  for (const row of admitted) {
    const question = original(row.number);
    const parts = question.answerParts!;
    const answers = question.correctAnswer.parts!;
    const expected = evidence.unorderedGroups.filter(group => group.question === row.number);
    const actual = answers.filter(answer => answer.kind === 'unordered');
    assert.equal(new Set(parts.map(part => part.id)).size, row.fields.length);
    assert.equal(actual.length, expected.length);
    for (const [index, group] of actual.entries()) {
      assert(group.presentation === undefined);
      const expectedParts = expected[index].fields.map(field => parts[row.fields.findIndex(slot => slot.locator === field)]);
      assert.deepEqual(group.partIds, expectedParts.map(part => part.id));
      assert.deepEqual(expectedParts[0].choiceIds, expectedParts[1].choiceIds);
      for (const reverse of [false, true]) assert.equal(gradeAnswer(question,
        { selectedPartChoices: correctParts(question, reverse) }).outcome, 'correct');
      const repeated = correctParts(question);
      repeated[group.partIds[0]] = repeated[group.partIds[1]];
      assert.equal(gradeAnswer(question, { selectedPartChoices: repeated }).outcome, 'incorrect');
    }
  }
});

test('S3-030 applies the official all-candidate credit to original Q8 only', () => {
  const question = original(8);
  const { base } = bookmarkTemplate(bundle, refOf(question), generationCoverage(bundle));
  const notification = question.correctAnswer.attribution.sourceRefs.find(ref => ref.sourceId === `source-ipa-${book}-erratum`);
  assert(notification);
  assert.equal(notification.locator.page, 1);
  assert.equal(notification.locator.questionNumber, '8');
  assert.equal(bundle.sources.find(source => source.id === notification.sourceId)?.sha256, evidence.sourceInputs['errata.pdf'].sha256);
  const credited = question.correctAnswer.parts!.filter(answer => answer.kind === 'choice' && answer.officialCreditReason !== undefined);
  assert.equal(credited.length, 2);
  assert.deepEqual(credited.map(answer => answer.kind === 'choice' && answer.partId),
    question.answerParts!.slice(2, 4).map(part => part.id));
  assert(base.correctAnswer.parts!.every(answer => answer.kind !== 'choice' || answer.officialCreditReason === undefined));
  const order = question.choices.map(choice => choice.id);
  for (const part of question.answerParts!.slice(2, 4)) {
    assert.match(partAnswerLabels(question, part, order), /全員正解/);
    assert.doesNotMatch(partAnswerLabels(base, base.answerParts!.find(candidate => candidate.id === part.id)!, base.choices.map(choice => choice.id)), /全員正解/);
    for (const selected of [undefined, ...part.choiceIds]) {
      const selectedPartChoices = correctParts(question, false, true);
      if (selected) selectedPartChoices[part.id] = selected;
      assert.equal(gradeAnswer(question, { selectedPartChoices }).outcome, 'correct');
    }
  }
});

test('S3-030 follows every admitted official seven-major selection, or offers timed practice for the published subset', async () => {
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
