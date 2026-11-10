import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import test from 'node:test';
import { readDistributionBundle } from '../scripts/distribution-files';
import evidence from '../scripts/source-evidence/legacy-2012-spring-pm-source-review.json';
import { answerLabels, displayedAnswerParts, gradeAnswer } from '../src/core/answers';
import { bookmarkSource, bookmarkTemplate } from '../src/core/bookmarks';
import { generationCoverage } from '../src/core/generation-coverage';
import { sha256 } from '../src/core/hash';
import { chooseMenuSourceGroup, menuSourceGroups, menuSubjectOptions } from '../src/core/menu-selection';
import { questionSearchDocuments } from '../src/core/search';
import { selectQuestions } from '../src/core/selection';
import { finishRun, prepareRun, remaining, startRun, updatePartAnswer, validateRun } from '../src/core/session';
import { labels, refOf, type Question, type Run, type Selection } from '../src/core/types';
import { AnswerChoices } from '../src/ui/AnswerChoices';
import { Content } from '../src/ui/Content';

const bundle = readDistributionBundle();
const book = evidence.collectionId;
const setId = 'set-annual-2012-spring-pm';
const ref = (number: number) => ({ questionId: `question-ipa-${book}-${number}`, revision: 1 });
const original = (number: number) => {
  const question = bundle.questions.find(q => q.id === ref(number).questionId);
  assert(question, `official Q${number}`);
  return question;
};
const selection = (kind: 'annual' | 'mix', mode: 'study' | 'practice' = 'study'): Selection => ({
  kind, mode, subject: 'B', year: 2012, size: 'public',
  bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});
const referenceAssets = (q: Question) => q.contexts.flatMap(context => context.content.blocks
  .flatMap(block => block.type === 'image' ? [block.assetId] : []));

function chooseCorrect(question: Question, reverseGroups = false) {
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

test('2012 spring PM preserves 79 official answer fields and 79 saved slots, and one generated family per major', () => {
  const coverage = generationCoverage(bundle);
  const mix = bundle.sets.find(set => set.id === 'set-mix-2012-spring-pm');
  assert(mix);
  let slots = 0;
  let officialFields = 0;
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
    const expectedGroups = row.number === 10 ? [[1, 2, 3]] : [];
    assert.deepEqual(unorderedSlots, expectedGroups);
    assert.deepEqual(unordered.map(group => group.presentation), row.number === 10 ? [undefined] : []);
    for (const group of unorderedSlots) {
      assert.deepEqual(group.map(index => actual[index]).sort(), group.map(index => expected[index]).sort());
      for (const index of group) actual[index] = expected[index];
    }
    assert.deepEqual(actual, expected);
    slots += question.answerParts!.length;
    assert.equal(displayedAnswerParts(question).length, row.fields.length);
    officialFields += displayedAnswerParts(question).length;
    const { base, template } = bookmarkTemplate(bundle, refOf(question), coverage);
    assert.equal(base.id, `question-template-source-${book}-${row.number}`);
    assert.equal(template.generatorRef.id, `generator-source-${book}-${row.number}`);
    assert.equal(bookmarkSource(bundle, refOf(base), coverage).id, question.id);
    assert.deepEqual(mix.generationBindings[row.number - 1], {
      questionRef: refOf(base), templateRef: { id: template.id, revision: template.revision },
    });
  }
  assert.equal(slots, 79);
  assert.equal(officialFields, 79);
  assert.equal(mix.generationBindings.length, 13);
});

test('2012 spring PM distributes exactly the reviewed 80 pages and uses independently written Java notes', async () => {
  const assets = bundle.assets.filter(asset => asset.id.startsWith(`asset-ipa-${book}-`));
  const hashes = evidence.assetSHA256ByPage as Record<number, string>;
  assert.equal(assets.length, 80);
  assert.deepEqual(assets.map(asset => Number(asset.attribution.sourceRefs[0].locator.page)).sort((a, b) => a - b), Object.keys(hashes).map(Number));
  for (const asset of assets) {
    const page = Number(asset.attribution.sourceRefs[0].locator.page);
    assert.equal(await sha256(fs.readFileSync(`public/data/${asset.path}`)), hashes[page]);
    assert.equal(asset.sha256, hashes[page]);
    if (page === 78) {
      assert.deepEqual([asset.width, asset.height], [1432, 1180]);
      assert.equal(asset.attribution.origin, 'adapted');
      assert.match(asset.path, /-casl-excerpt\.webp$/);
      assert(!asset.alt.includes('JIS X 0201'));
    }
  }
  assert(!assets.some(asset => /page-0(?:71|72|73|74|75|78)\.webp$/.test(asset.path)));
  assert.deepEqual(referenceAssets(original(5)), []);
  assert.deepEqual(referenceAssets(original(8)), [3, 4].map(page => `asset-ipa-${book}-p00${page}`));
  assert(referenceAssets(original(12)).includes(`asset-ipa-${book}-p078-casl-excerpt`));
  assert.equal(referenceAssets(original(13)).length, 8);
  const java = original(11).contexts.find(context => context.content.attribution.sourceRefs.some(ref => ref.locator.page === 71));
  assert(java);
  assert.equal(java.content.attribution.origin, 'original');
  assert.deepEqual(java.content.attribution.rightsRefs, ['rights-original']);
  assert.equal(java.content.attribution.sourceRefs.filter(ref => ref.sourceId.startsWith('source-java-se7-')).length, 9);
  assert(!java.content.blocks.some(block => block.type === 'image'));
  const digits = original(12).contexts.find(context => context.title === '数字文字の表現（独自整理）');
  assert(digits && digits.content.attribution.origin === 'original');
  assert.deepEqual(digits.content.attribution.rightsRefs, ['rights-original']);
  assert(digits.content.attribution.sourceRefs.some(ref => ref.sourceId === `source-fact-${book}-digit-encoding`));
  assert(!digits.content.blocks.some(block => block.type === 'image'));

});

test('2012 spring AM and PM share the menu group and timed PM uses seven chosen majors for 150 minutes', async () => {
  const groups = menuSourceGroups(bundle);
  const group = groups.find(item => item.collections.some(collection => collection.id === setId));
  assert(group);
  assert.deepEqual(menuSubjectOptions(group).map(item => [item.title, item.available]), [['旧制度・午前', true], ['旧制度・午後', true]]);
  for (const kind of ['annual', 'mix'] as const) {
    const afternoon = chooseMenuSourceGroup(groups, selection(kind), group.id, 'B');
    assert.equal(selectQuestions(bundle, afternoon, items => items).questions.length, 13);
    const morning = chooseMenuSourceGroup(groups, afternoon, group.id, 'A');
    assert.equal(selectQuestions(bundle, morning, items => items).questions.length, 80);
    const selectedQuestionRefs = [12, 8, 7, 6, 4, 3, 2].map(ref);
    const config = { ...selection(kind, 'practice'), selectedQuestionRefs };
    const prepared = selectQuestions(bundle, config, items => items);
    assert.deepEqual(prepared.questions.map(q => Number(q.origin.sourceRefs[0].locator.questionNumber)), [2, 3, 4, 6, 7, 8, 12]);
    const timed = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    assert.equal(remaining(timed, 2000), 9000);
    assert.throws(() => selectQuestions(bundle, { ...config, selectedQuestionRefs: selectedQuestionRefs.filter(row => row.questionId !== ref(8).questionId) }),
      { code: 'QUESTION_SELECTION' });
    assert.throws(() => selectQuestions(bundle, { ...config, selectedQuestionRefs: [...selectedQuestionRefs, ref(1)] }),
      { code: 'QUESTION_SELECTION' });
    assert.throws(() => selectQuestions(bundle, { ...config, selectedQuestionRefs: selectedQuestionRefs.slice(1) }),
      { code: 'QUESTION_SELECTION' });
  }
  const documents = new Set(questionSearchDocuments(bundle).map(document => document.question.id));
  for (const row of evidence.questions) assert(documents.has(ref(row.number).questionId));
});

test('2012 spring PM all 79 fields grade after JSON save and resume', async () => {
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
    const grouped = saved.issued[9];
    const answer = grouped.correctAnswer.parts!.find(part => part.kind === 'unordered');
    assert(answer);
    const partsWithUnorderedLabel = answerLabels(grouped).split('、').filter(label => label.includes('（順不同）'));
    const groupPartLabels = answer.partIds.map(id => grouped.answerParts!.find(part => part.id === id)!.label);
    assert.deepEqual(partsWithUnorderedLabel.map(label => label.split('：', 1)[0]), groupPartLabels);
    const result = finishRun(saved, 'completed', 4000);
    await validateRun(result);
    assert.deepEqual(result.result!.partSummary, { total: 79, correct: 79, incorrect: 0, unanswered: 0, unscored: 0, learningAccuracyPercent: 100 });
  }
});

test('2012 spring PM generated base renders all prompts and answer fields before revealing answers', () => {
  const coverage = generationCoverage(bundle);
  for (const row of evidence.questions) {
    const { base } = bookmarkTemplate(bundle, ref(row.number), coverage);
    const prompt = render(h(Content, { content: base.prompt, bundle, assetUrls: {}, showAttribution: false }));
    assert(prompt.length > 150);
    assert(!prompt.includes('<details'), `question ${row.number}: the main prompt must be visible`);
    const answers = render(h(AnswerChoices, { question: base, entry: { choiceOrder: base.choices.map(choice => choice.id) },
      bundle, assetUrls: {}, disabled: false, revealed: false }));
    assert.equal((answers.match(/<fieldset/g) ?? []).length, row.fields.length);
    assert.equal((answers.match(/type="checkbox"/g) ?? []).length, 0);
    assert(!answers.includes('正答'));
  }
});


test('2012 spring PM Q10 accepts every order of b/c/d and scores them as separate fields', () => {
  const question = original(10);
  const group = question.correctAnswer.parts!.find(answer => answer.kind === 'unordered');
  assert(group && group.presentation === undefined);
  assert.equal(group.partIds.length, 3);
  const [a, b, c] = group.choiceIds;
  const gradeGroup = (values: string[]) => {
    const selected = chooseCorrect(question);
    group.partIds.forEach((id, index) => {
      if (values[index] === undefined) delete selected[id];
      else selected[id] = values[index];
    });
    return gradeAnswer(question, { selectedPartChoices: selected });
  };
  for (const values of [[a,b,c],[a,c,b],[b,a,c],[b,c,a],[c,a,b],[c,b,a]]) {
    const result = gradeGroup(values);
    assert.equal(result.outcome, 'correct');
    assert.equal(result.parts!.length, 7);
    assert(result.parts!.every(part => part.outcome === 'correct'));
  }
  assert.equal(gradeGroup([a,a,c]).outcome, 'incorrect');
  const incomplete = gradeGroup([a,b]);
  assert.equal(incomplete.parts!.find(part => part.partId === group.partIds[2])?.outcome, 'unanswered');
  const first = question.answerParts!.find(part => part.id === group.partIds[0]);
  const wrong = first?.choiceIds.find(choice => !group.choiceIds.includes(choice));
  assert(wrong);
  assert.equal(gradeGroup([wrong,b,c]).outcome, 'incorrect');
});

test('2012 spring PM original and mix each preserve the 105 legal seven-major selections', () => {
  const general = [1,2,3,4,5,6,7];
  const language = [9,10,11,12,13];
  for (const kind of ['annual', 'mix'] as const) {
    const outputs = new Set<string>();
    for (const [index, omitted] of general.entries()) for (const second of general.slice(index+1)) for (const languageNumber of language) {
      const expected = [...general.filter(n => n !== omitted && n !== second), 8, languageNumber];
      const config = { ...selection(kind, 'practice'), selectedQuestionRefs: [...expected].reverse().map(ref) };
      const issued = selectQuestions(bundle, config, items => items);
      const numbers = issued.questions.map(q => Number(q.origin.sourceRefs[0].locator.questionNumber));
      assert.deepEqual(numbers, expected);
      outputs.add(numbers.join(','));
    }
    assert.equal(outputs.size, 105);
  }
});
