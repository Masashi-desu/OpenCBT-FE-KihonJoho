import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readDistributionBundle } from '../../../scripts/distribution-files';
import review from '../../../scripts/source-evidence/legacy-2006-spring-pm-source-review.json';
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
import { labels, refOf, type AnswerPart, type Question, type Run, type Selection } from '../../../src/core/types';
import { AnswerChoices } from '../../../src/ui/AnswerChoices';
import { Content } from '../../../src/ui/Content';

const bundle = readDistributionBundle();
const collection = review.collectionId;
const setId = 'set-annual-2006-spring-pm';
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
  kind, mode, subject: 'B', year: 2006, size: 'public',
  bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});
const contextAssets = (question: Question) => question.contexts.flatMap(context => context.content.blocks
  .flatMap(block => block.type === 'image' ? [block.assetId] : []));

function correctParts(question: Question) {
  const answers: [string, string][] = [];
  for (const answer of question.correctAnswer.parts ?? []) {
    if (answer.kind === 'choice') answers.push([answer.partId, answer.choiceId]);
    else {
      assert(answer.kind === 'unordered');
      const reversed = [...answer.choiceIds].reverse();
      answer.partIds.forEach((partId, index) => answers.push([partId, reversed[index]]));
    }
  }
  return Object.fromEntries(answers);
}

test('S3-044 keeps the 13 official majors, matches official and admitted answer fields with both kinds of unordered credit and binds each admitted generator', () => {
  assert.deepEqual(review.questions.map(row => row.number), Array.from({ length: 13 }, (_, index) => index + 1));
  assert.equal(review.questions.reduce((count, row) => count + row.answerSlots, 0), 59);
  assert.equal(review.questions.reduce((count, row) => count + row.selectionMarks, 0), 60);
  assert(held.includes(3) && held.includes(4));
  assert.equal(totalFields, 59 - review.questions.filter(row => held.includes(row.number))
    .reduce((count, row) => count + row.answerSlots, 0));
  assert.equal(totalMarks, totalFields + (held.includes(5) ? 0 : 1));
  for (const number of held) {
    assert(!bundle.questions.some(row => row.id === ref(number).questionId));
    assert(!bundle.templates.some(row => row.id === `template-source-${collection}-${number}`));
  }
  const coverage = generationCoverage(bundle);
  const mix = bundle.sets.find(set => set.id === 'set-mix-2006-spring-pm');
  assert(mix && mix.generationBindings.length === published.length);
  for (const [index, row] of published.entries()) {
    const question = original(row.number);
    assert.equal(question.origin.kind, 'official_reprint');
    assert.equal(question.origin.isModified, false);
    assert.deepEqual(question.origin.sourceRefs.map(source => source.locator.page), row.pages);
    assert(question.origin.sourceRefs.every(source => source.locator.year === 2006
      && source.locator.period === '春期' && source.locator.timeSlot === '午後'));
    assert.equal(question.correctAnswer.attribution.sourceRefs[0].locator.page, 1);
    assert.equal(displayedAnswerParts(question).length, row.answerSlots);
    assert.equal(question.answerParts?.length, row.selectionMarks);
    const official = question.correctAnswer.parts!;
    assert.equal(official.length, row.fields.length);
    let partIndex = 0;
    for (const [index, field] of row.fields.entries()) {
      const part: AnswerPart = question.answerParts![partIndex];
      const answer = official[index];
      const symbol = (id: string) => labels[part.choiceIds.indexOf(id)];
      if (field.scoring === 'one_choice') {
        assert(answer.kind === 'choice');
        assert.equal(answer.partId, part.id);
        assert.deepEqual([symbol(answer.choiceId)], field.key);
        partIndex++;
      } else {
        assert(answer.kind === 'unordered');
        assert.equal(answer.presentation === 'checklist', field.scoring === 'unordered_one_field');
        assert.deepEqual(answer.choiceIds.map(symbol).sort(), [...field.key].sort());
        assert.deepEqual(answer.partIds, question.answerParts!.slice(partIndex, partIndex + 2).map(item => item.id));
        partIndex += 2;
      }
    }
    assert.equal(partIndex, row.selectionMarks);
    const { base, template } = bookmarkTemplate(bundle, refOf(question), coverage);
    assert.equal(bookmarkSource(bundle, refOf(base), coverage).id, question.id);
    assert.equal(template.generatorRef.id, `generator-source-${collection}-${row.number}`);
    assert.deepEqual(mix.generationBindings[index], {
      questionRef: refOf(base), templateRef: { id: template.id, revision: template.revision },
    });
    for (let input = 0; input < 4; input++) {
      checkParameters(template, [input]);
      const generated = bindQuestion(base, template, [input], `source-review-${row.number}-${input}`, '2026-11-15T00:00:00Z');
      assert.doesNotThrow(() => validateSourceFormat(generated, template), `問${row.number}の条件${input}`);
      assert.equal(displayedAnswerParts(generated).length, row.answerSlots);
    }
  }
});

test('S3-044 matches the source images and routes only the required language or notation pages to each major', async () => {
  const hashes: Record<string, string> = review.assetSHA256ByPage;
  const assets = bundle.assets.filter(asset => asset.id.startsWith(`asset-ipa-${collection}-`));
  assert.deepEqual(assets.map(asset => asset.attribution.sourceRefs[0].locator.page).sort((a, b) => a! - b!), Object.keys(hashes).map(Number));
  for (const page of [1, 2, 3, 4, 5, 63, 64, 65, ...review.questions.filter(row => held.includes(row.number)).flatMap(row => row.pages)])
    assert(!assets.some(asset => asset.attribution.sourceRefs[0].locator.page === page));
  for (const asset of assets) {
    const page = asset.attribution.sourceRefs[0].locator.page!;
    assert.equal(await sha256(fs.readFileSync(`public/data/${asset.path}`)), hashes[page]);
    assert.equal(asset.sha256, hashes[page]);
    assert(asset.alt.trim().length >= 40);
    if (page === review.caslExcerpt.page) {
      assert.equal(asset.attribution.origin, 'adapted');
      assert.deepEqual([asset.width, asset.height], [910, 721]);
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

test('S3-044 shows IPA and WARP credit while retaining the collection and search entry points', () => {
  const group = menuSourceGroups(bundle).find(row => row.title === '旧制度 · 2006年度 春期');
  assert(group);
  assert.deepEqual(group.collections.map(item => item.id), ['set-annual-2006h18h-fe-am', setId]);
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

test('S3-044 grades and resumes all answer fields in both study sources with reversed answer orders', async () => {
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

test('S3-044 keeps the original radio groups and renders one checklist for two choices in question 5', () => {
  for (const row of published) {
    const { base } = bookmarkTemplate(bundle, ref(row.number));
    const prompt = renderToStaticMarkup(createElement(Content, { content: base.prompt, bundle, assetUrls: {}, showAttribution: false }));
    assert(prompt.length > 150 && !prompt.includes('<details'));
    const answers = renderToStaticMarkup(createElement(AnswerChoices, {
      question: base, entry: { choiceOrder: base.choices.map(choice => choice.id) },
      bundle, assetUrls: {}, disabled: false, revealed: false,
    }));
    assert.equal((answers.match(/<fieldset/g) ?? []).length, row.answerSlots);
    const checklistParts = new Set(base.correctAnswer.parts!.flatMap(answer =>
      answer.kind === 'unordered' && answer.presentation === 'checklist' ? answer.partIds.slice(0, 1) : []));
    assert.equal(checklistParts.size, row.number === 5 ? 1 : 0);
    const checkboxCount = displayedAnswerParts(base).filter(part => checklistParts.has(part.id))
      .reduce((total, part) => total + part.choiceIds.length, 0);
    const radioCount = displayedAnswerParts(base).filter(part => !checklistParts.has(part.id))
      .reduce((total, part) => total + part.choiceIds.length, 0);
    assert.equal((answers.match(/type="radio"/g) ?? []).length, radioCount);
    assert.equal((answers.match(/type="checkbox"/g) ?? []).length, checkboxCount);
    assert(!answers.includes('正答'));
  }
});

test('S3-044 computes timed selection from admitted required and optional majors with the official 150 minutes', async () => {
  const numbers = published.map(row => row.number);
  const required = [1, 2, 3, 4, 5].filter(number => numbers.includes(number));
  const firstGroup = numbers.filter(number => number >= 6 && number <= 9);
  const secondGroup = numbers.filter(number => number >= 10 && number <= 13);
  assert(required.length > 0 && firstGroup.length > 0 && secondGroup.length > 0);
  for (const kind of ['annual', 'mix'] as const) {
    const timed = selection(kind, 'practice');
    for (const first of firstGroup) for (const second of secondGroup) {
      const expected = [...required, first, second];
      const config = { ...timed, selectedQuestionRefs: [...expected].reverse().map(ref) };
      const prepared = selectQuestions(bundle, config, items => items);
      assert.deepEqual(prepared.questions.map(question => Number(question.origin.sourceRefs[0].locator.questionNumber)), expected);
      assert.equal(prepared.exam.timeLimitSeconds, 9000);
    }
    const first = firstGroup[0];
    const second = secondGroup[0];
    for (const invalid of [[...required, first], [...required.slice(1), first, second], [...required, 3, first, second]]) {
      assert.throws(() => selectQuestions(bundle, { ...timed, selectedQuestionRefs: invalid.map(ref) }), { code: 'QUESTION_SELECTION' });
    }
    const config = { ...timed, selectedQuestionRefs: [...required, first, second].map(ref) };
    const prepared = selectQuestions(bundle, config, items => items);
    const run = startRun(await prepareRun(bundle, config, {}, 1000, undefined, prepared), 2000);
    assert.equal(remaining(run, 2000), 9000);
    assert.equal(run.issued.length, required.length + 2);
  }
});
