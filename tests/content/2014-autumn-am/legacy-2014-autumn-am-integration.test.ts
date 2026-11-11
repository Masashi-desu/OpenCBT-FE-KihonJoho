import assert from 'node:assert/strict';
import test, { before } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixture, installFixtureGenerators } from '../../fixtures';
import official from '../../fixtures/legacy-2014-autumn-am-official-answers.json';
import review from '../../../scripts/source-evidence/legacy-2014-autumn-am-source-review.json';
import { sourceExclusions, sourceScope } from '../../../scripts/source-inventory';
import { bookmarkTemplate, makeBookmark } from '../../../src/core/bookmarks';
import { contentHash } from '../../../src/core/hash';
import { menuSourceGroups, menuSubjectOptions } from '../../../src/core/menu-selection';
import { mixProfile } from '../../../src/core/mix-profile';
import { emptySearch, findSearchDocuments, questionSearchDocuments, searchableQuestions } from '../../../src/core/search';
import { selectQuestions } from '../../../src/core/selection';
import { finishRun, prepareRun, remaining, startRun, updateAnswer, validateRun } from '../../../src/core/session';
import { sourceCollections } from '../../../src/core/source-collections';
import { displayQuestionNumber } from '../../../src/core/source-label';
import { refOf, type Run, type Selection } from '../../../src/core/types';
import { materialPages } from '../../../src/ui/MaterialViewer';
import { SourceFigure } from '../../../src/ui/SourceFigure';

const collection = official.collectionId;
const setId = `set-annual-${collection}`;
const held = review.held.map(row => row.number);
const published = official.records.filter(row => !held.includes(row.number));
const originalId = (n: number) => `question-ipa-${collection}-${n}`;
const config = (kind: 'annual' | 'mix'): Selection => ({ subject: 'A', kind, mode: 'practice', size: 'public',
  bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});

before(installFixtureGenerators);

test('S3-009 preserves all official obligations and admits only the reviewed source, base and generator pairs', async () => {
  const bundle = fixture();
  const annual = sourceCollections(bundle, 'A').find(item => item.id === setId);
  assert(annual);
  assert.equal(official.records.length, 80);
  assert.deepEqual(sourceScope.filter(id => id.startsWith(`${collection}-`)), official.records.map(row => `${collection}-${row.number}`));
  assert.deepEqual(annual.questionRefs.map(ref => ref.questionId), published.map(row => originalId(row.number)));
  const questions = new Map(bundle.questions.map(question => [question.id, question]));
  const mix = bundle.sets.find(set => set.id === 'set-mix-a');
  assert(mix);
  for (const row of published) {
    const original = questions.get(originalId(row.number));
    assert(original);
    assert.equal(original.learning.area, row.officialArea);
    assert.equal(original.correctAnswer.choiceId, original.choices['アイウエ'.indexOf(row.officialKey)].id);
    assert.equal(original.origin.sourceRefs.find(ref => ref.locator.questionNumber)?.locator.page, row.physicalPage);
    const { base, template } = bookmarkTemplate(bundle, refOf(original));
    assert.equal(await contentHash(base), template.originalContentSha256);
    assert.deepEqual(mix.generationBindings.filter(binding => binding.questionRef.questionId === base.id),
      [{ questionRef: refOf(base), templateRef: { id: template.id, revision: template.revision } }]);
    assert.equal(base.choiceShuffleAllowed, false);
  }
  for (const n of held) {
    const source = `${collection}-${n}`;
    assert(Object.hasOwn(sourceExclusions, source));
    assert(!questions.has(originalId(n)) && !questions.has(`question-template-source-${source}`));
    assert(!bundle.templates.some(template => template.id === `template-source-${source}`));
    assert(!bundle.assets.some(asset => asset.id === `asset-ipa-${source}`));
  }
});

test('S3-009 uses its year and period, the admitted count and the official 150-minute limit in both modes', () => {
  const bundle = fixture();
  const group = menuSourceGroups(bundle).find(item => item.collections.some(collection => collection.id === setId));
  assert(group);
  assert.equal(group.title, '旧制度 · 2014年度 秋期');
  const afternoonAvailable = sourceScope.some(id => id.startsWith('2014h26a-fe-pm-') && !Object.hasOwn(sourceExclusions, id));
  assert.deepEqual(menuSubjectOptions(group).map(option => [option.title, option.available]),
    [['旧制度・午前', true], ['旧制度・午後', afternoonAvailable]]);
  const profile = mixProfile(bundle, config('mix'));
  assert.deepEqual(profile.quota, Object.fromEntries(['technology', 'management', 'strategy'].map(area =>
    [area, published.filter(row => row.officialArea === area).length])));
  for (const kind of ['annual', 'mix'] as const) {
    const selected = selectQuestions(bundle, config(kind), items => items);
    assert.equal(selected.questions.length, published.length);
    assert.equal(selected.exam.questionCount, published.length);
    assert.equal(selected.exam.timeLimitSeconds, official.officialTimeLimitSeconds);
    assert.equal(selected.exam.practiceScope, 'public_subset');
  }
});

test('S3-009 keeps search, bookmark identity and original numbering across the three publication gaps', () => {
  const bundle = fixture();
  const originals = searchableQuestions(bundle).filter(question => question.id.startsWith(`question-ipa-${collection}-`));
  assert.deepEqual(originals.map(question => question.id).sort(), published.map(row => originalId(row.number)).sort());
  const matched = findSearchDocuments(questionSearchDocuments(bundle), { ...emptySearch, query: '基数変換法', year: 2014 });
  assert(matched.some(result => result.question.id === originalId(2)));
  for (const row of published) {
    const original = originals.find(item => item.id === originalId(row.number));
    assert(original);
    assert.equal(displayQuestionNumber(original, 0), String(row.number));
    const { base } = bookmarkTemplate(bundle, refOf(original));
    assert.deepEqual(makeBookmark(bundle, refOf(base), 0), makeBookmark(bundle, refOf(original), 0));
  }
});

test('S3-009 original and mix practice preserve timing, answered choices and actual grading denominator on resume', async () => {
  const bundle = fixture();
  for (const kind of ['annual', 'mix'] as const) {
    const selection = config(kind);
    let run = startRun(await prepareRun(bundle, selection, {}, 100000), 101000);
    assert.equal(run.issued.length, published.length);
    assert.equal(run.instances.length, kind === 'mix' ? published.length : 0);
    assert.equal(remaining(run, 101000), official.officialTimeLimitSeconds);
    run = updateAnswer(run, run.issued[0].correctAnswer.choiceId, 102000);
    const saved = JSON.parse(JSON.stringify(run)) as Run;
    await validateRun(saved);
    assert.equal(saved.session.entries[0].selectedChoiceId, run.issued[0].correctAnswer.choiceId);
    const completed = finishRun(saved, 'completed', 103000);
    await validateRun(completed);
    assert.equal(completed.result?.total, published.length);
    assert.equal(completed.result?.correct, 1);
    assert.equal(completed.result?.unanswered, published.length - 1);
  }
});

test('S3-009 places its own two common pages after the question, with the autumn source identity, exact versions and nine accessible logic symbols', () => {
  const bundle = fixture();
  const original = bundle.questions.find(question => question.id === originalId(21));
  assert(original);
  const { base } = bookmarkTemplate(bundle, refOf(original));
  for (const question of [original, base]) {
    const pages = materialPages(question);
    assert.deepEqual(pages[0].content.blocks, question.prompt.blocks);
    assert.equal(pages.filter(page => page.commonReference).length, 2);
  }
  const pages = materialPages(base).filter(page => page.commonReference);
  const standards = pages[0].content.blocks.find(block => block.type === 'table');
  assert(standards?.type === 'table');
  assert.equal(standards.rows.length, 12);
  assert.deepEqual(standards.rows.filter(([name]) => ['JIS Q 27001', 'JIS Q 27002', 'PMBOK'].includes(name)), [
    ['JIS Q 27001', 'JIS Q 27001:2006'], ['JIS Q 27002', 'JIS Q 27002:2006'], ['PMBOK', 'PMBOK ガイド 第4版'],
  ]);
  assert(!standards.rows.some(([name]) => name === 'JIS Q 27000'));
  const diagram = pages[1].content.blocks[0];
  assert(diagram.type === 'diagram' && diagram.scene.kind === 'source_figure');
  const html = renderToStaticMarkup(createElement(SourceFigure, { scene: diagram.scene, caption: diagram.caption }));
  assert(html.includes('data-common-reference="2014h26a-fe-am-p3"'));
  assert.equal([...html.matchAll(/data-common-gate=/g)].length, 9);
  assert(html.includes('論理状態の反転又は否定'));
});
