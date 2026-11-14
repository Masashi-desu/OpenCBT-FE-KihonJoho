import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readDistributionBundle } from '../../../scripts/distribution-files';
import review from '../../../scripts/source-evidence/legacy-2008-spring-pm-source-review.json';
import { displayedAnswerParts } from '../../../src/core/answers';
import { bookmarkSource, bookmarkTemplate } from '../../../src/core/bookmarks';
import { bindQuestion, checkParameters } from '../../../src/core/generation';
import { generationCoverage } from '../../../src/core/generation-coverage';
import { validateSourceFormat } from '../../../src/core/generation-formats';
import { sha256 } from '../../../src/core/hash';
import { chooseMenuSourceGroup, menuSourceGroups, menuSubjectOptions } from '../../../src/core/menu-selection';
import { questionSearchDocuments } from '../../../src/core/search';
import { selectQuestions } from '../../../src/core/selection';
import { finishRun, prepareRun, remaining, startRun, updatePartAnswer, validateRun } from '../../../src/core/session';
import { labels, refOf, type Question, type Run, type Selection } from '../../../src/core/types';
import { AnswerChoices } from '../../../src/ui/AnswerChoices';
import { Content } from '../../../src/ui/Content';

const bundle = readDistributionBundle();
const collection = review.collectionId;
const setId = 'set-annual-2008-spring-pm';
const held = review.held.map((row: { number: number }) => row.number);
const published = review.questions.filter(row => !held.includes(row.number));
const totalFields = published.reduce((count, row) => count + row.answerSlots, 0);
const totalMarks = published.reduce((count, row) => count + row.selectionMarks, 0);
const ref = (number: number) => ({ questionId: `question-ipa-${collection}-${number}`, revision: 1 });
const original = (number: number) => {
  const question = bundle.questions.find(row => row.id === ref(number).questionId);
  assert(question, `原問題 問${number}`);
  return question;
};
const selection = (kind: 'annual' | 'mix', mode: 'study' | 'practice' = 'study'): Selection => ({
  kind, mode, subject: 'B', year: 2008, size: 'public',
  bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});
const contextAssets = (question: Question) => question.contexts.flatMap(context => context.content.blocks
  .flatMap(block => block.type === 'image' ? [block.assetId] : []));

function correctParts(question: Question) {
  return Object.fromEntries((question.correctAnswer.parts ?? []).map(answer => {
    assert(answer.kind === 'choice');
    return [answer.partId, answer.choiceId];
  }));
}

test('S3-036 keeps the 13 official majors, matches the 66 official and 56 admitted answer fields and binds each admitted generator', () => {
  assert.deepEqual(review.questions.map(row => row.number), Array.from({ length: 13 }, (_, index) => index + 1));
  assert.equal(review.questions.reduce((count, row) => count + row.answerSlots, 0), 66);
  assert.equal(review.questions.reduce((count, row) => count + row.selectionMarks, 0), 66);
  assert.deepEqual(held, [6, 11]);
  assert.equal(totalFields, 56);
  assert.equal(totalMarks, 56);
  for (const number of held) {
    assert(!bundle.questions.some(row => row.id === ref(number).questionId));
    assert(!bundle.templates.some(row => row.id === `template-source-${collection}-${number}`));
  }
  const coverage = generationCoverage(bundle);
  const mix = bundle.sets.find(set => set.id === 'set-mix-2008-spring-pm');
  assert(mix && mix.generationBindings.length === published.length);
  for (const [index, row] of published.entries()) {
    const question = original(row.number);
    assert.equal(question.origin.kind, 'official_reprint');
    assert.equal(question.origin.isModified, false);
    assert.deepEqual(question.origin.sourceRefs.map(source => source.locator.page), row.pages);
    assert(question.origin.sourceRefs.every(source => source.locator.year === 2008
      && source.locator.period === '春期' && source.locator.timeSlot === '午後'));
    assert.equal(question.correctAnswer.attribution.sourceRefs[0].locator.page, 1);
    assert.equal(question.explanation.attribution.sourceRefs[0].locator.page, row.commentaryPage);
    assert.equal(displayedAnswerParts(question).length, row.answerSlots);
    assert.equal(question.answerParts?.length, row.selectionMarks);
    const correct = correctParts(question);
    const marks = question.answerParts!.map(part => labels[part.choiceIds.indexOf(correct[part.id])]);
    let offset = 0;
    for (const field of row.fields) {
      const actual = marks.slice(offset, offset + field.key.length);
      offset += field.key.length;
      assert.deepEqual(actual, field.key, `問${row.number} ${field.locator}`);
    }
    assert.equal(offset, marks.length);
    const { base, template } = bookmarkTemplate(bundle, refOf(question), coverage);
    assert.equal(bookmarkSource(bundle, refOf(base), coverage).id, question.id);
    assert.equal(template.generatorRef.id, `generator-source-${collection}-${row.number}`);
    assert.deepEqual(mix.generationBindings[index], {
      questionRef: refOf(base), templateRef: { id: template.id, revision: template.revision },
    });
    for (let input = 0; input < 4; input++) {
      checkParameters(template, [input]);
      const generated = bindQuestion(base, template, [input], `source-review-${row.number}-${input}`, '2026-11-12T00:00:00Z');
      assert.doesNotThrow(() => validateSourceFormat(generated, template), `問${row.number}の条件${input}`);
      assert.equal(displayedAnswerParts(generated).length, row.answerSlots);
    }
  }
});

test('S3-036 matches the source images and routes only the required language or notation pages to each major', async () => {
  const hashes: Record<string, string> = review.assetSHA256ByPage;
  const assets = bundle.assets.filter(asset => asset.id.startsWith(`asset-ipa-${collection}-`));
  assert.deepEqual(assets.map(asset => asset.attribution.sourceRefs[0].locator.page).sort((a, b) => a! - b!), Object.keys(hashes).map(Number));
  assert.equal(assets.length, 50);
  for (const asset of assets) {
    const page = asset.attribution.sourceRefs[0].locator.page!;
    assert.equal(await sha256(fs.readFileSync(`public/data/${asset.path}`)), hashes[page]);
    assert.equal(asset.sha256, hashes[page]);
    assert(asset.alt.length > 100);
    if (page === 57) {
      assert.equal(asset.attribution.origin, 'adapted');
      assert.deepEqual([asset.width, asset.height], [1145, 930]);
      assert(asset.path.endsWith('-casl-excerpt.webp'));
      assert.match(asset.alt, /PUSH.*POP.*CALL.*RET.*FR/);
      assert(!asset.alt.includes('JIS') && !asset.alt.includes('文字の符号表'));
    } else assert.equal(asset.attribution.origin, 'official');
  }
  const references: Record<string, number[]> = review.referencePagesByQuestion;
  const scopePages = (question: Question) => contextAssets(question).map(id =>
    assets.find(asset => asset.id === id)?.attribution.sourceRefs[0].locator.page);
  for (const row of published) {
    const question = original(row.number);
    const { base } = bookmarkTemplate(bundle, ref(row.number));
    assert.deepEqual(scopePages(question), references[row.number] ?? []);
    assert.deepEqual(scopePages(base), references[row.number] ?? []);
  }
});

test('S3-036 shows IPA and WARP credit while retaining the collection and search entry points', () => {
  const group = menuSourceGroups(bundle).find(row => row.title === '旧制度 · 2008年度 春期');
  assert(group);
  assert.deepEqual(group.collections.map(item => item.id), ['set-annual-2008h20h-fe-am', setId]);
  assert.deepEqual(menuSubjectOptions(group).map(item => [item.title, item.available]), [['旧制度・午前', true], ['旧制度・午後', true]]);
  for (const kind of ['annual', 'mix'] as const) {
    const afternoon = chooseMenuSourceGroup(menuSourceGroups(bundle), selection(kind), group.id, 'B');
    assert.equal(selectQuestions(bundle, afternoon, items => items).questions.length, published.length);
    const morning = chooseMenuSourceGroup(menuSourceGroups(bundle), afternoon, group.id, 'A');
    assert.equal(selectQuestions(bundle, morning, items => items).questions.length, 77);
  }
  const search = new Set(questionSearchDocuments(bundle).map(document => document.question.id));
  for (const row of published) {
    assert(search.has(ref(row.number).questionId));
    const question = original(row.number);
    const source = bundle.sources.find(item => item.id === question.origin.sourceRefs[0].sourceId);
    assert(source && source.title.includes('WARP保存版'));
    assert.equal(new URL(source.url).hostname, 'warp.ndl.go.jp');
    const right = bundle.rights.find(item => item.id === question.prompt.attribution.rightsRefs[0]);
    assert(right && right.holders[0].includes('IPA'));
    assert(right.evidence.some(ref => ref.sourceId === `source-ipa-${collection}-warp-help`));
  }
});

test('S3-036 grades and resumes all 56 answer fields in both practice sources', async () => {
  for (const kind of ['annual', 'mix'] as const) {
    const config = selection(kind);
    const prepared = selectQuestions(bundle, config, items => items);
    let run = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    for (const [index, question] of run.issued.entries()) {
      run.session.currentIndex = index;
      for (const [partId, choiceId] of Object.entries(correctParts(question))) {
        run = updatePartAnswer(run, partId, choiceId, 3000);
      }
    }
    const saved = JSON.parse(JSON.stringify(run)) as Run;
    await validateRun(saved);
    assert.deepEqual(saved.session.entries, run.session.entries);
    assert.equal(saved.session.entries.reduce((count, row) => count + Object.keys(row.selectedPartChoices ?? {}).length, 0), totalMarks);
    const result = finishRun(saved, 'completed', 4000);
    await validateRun(result);
    assert.deepEqual(result.result!.partSummary, {
      total: totalFields, correct: totalFields, incorrect: 0, unanswered: 0, unscored: 0, learningAccuracyPercent: 100,
    });
  }
});

test('S3-036 uses one radio group per answer field and preserves all prompt and choice content', () => {
  for (const row of published) {
    const { base } = bookmarkTemplate(bundle, ref(row.number));
    const prompt = renderToStaticMarkup(createElement(Content, { content: base.prompt, bundle, assetUrls: {}, showAttribution: false }));
    assert(prompt.length > 150 && !prompt.includes('<details'));
    const answers = renderToStaticMarkup(createElement(AnswerChoices, {
      question: base, entry: { choiceOrder: base.choices.map(choice => choice.id) },
      bundle, assetUrls: {}, disabled: false, revealed: false,
    }));
    assert.equal((answers.match(/<fieldset/g) ?? []).length, row.answerSlots);
    assert(!answers.includes('type="checkbox"'));
    assert.equal((answers.match(/type="radio"/g) ?? []).length,
      base.answerParts!.reduce((count, part) => count + part.choiceIds.length, 0));
    assert(!answers.includes('正答'));
  }
});

test('S3-036 uses all 9 admitted two-language choices, seven issued majors and the official 150 minutes', async () => {
  const required = [1, 2, 3, 4, 5];
  for (const kind of ['annual', 'mix'] as const) {
    const timed = selection(kind, 'practice');
    for (const first of [7, 8, 9]) for (const second of [10, 12, 13]) {
      const expected = [...required, first, second];
      const config = { ...timed, selectedQuestionRefs: [...expected].reverse().map(ref) };
      const prepared = selectQuestions(bundle, config, items => items);
      assert.deepEqual(prepared.questions.map(question => Number(question.origin.sourceRefs[0].locator.questionNumber)), expected);
      assert.equal(prepared.exam.timeLimitSeconds, 9000);
    }
    for (const invalid of [[1,2,3,4,6,7,10], [1,2,3,4,5,7,8], [1,2,3,4,5,10,12], [1,2,3,4,5,7], [1,2,3,4,5,7,11], [1,2,3,4,5,6,10]]) {
      assert.throws(() => selectQuestions(bundle, { ...timed, selectedQuestionRefs: invalid.map(ref) }), { code: 'QUESTION_SELECTION' });
    }
    const config = { ...timed, selectedQuestionRefs: [...required, 7, 13].map(ref) };
    const prepared = selectQuestions(bundle, config, items => items);
    const run = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    assert.equal(remaining(run, 2000), 9000);
    assert.equal(run.issued.length, 7);
  }
});
