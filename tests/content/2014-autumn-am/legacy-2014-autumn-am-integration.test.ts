import assert from 'node:assert/strict';
import test, { before } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixture, installFixtureGenerators } from '../../fixtures';
import official from '../../fixtures/legacy-2014-autumn-am-official-answers.json';
import { bindAdditionalQuestion, validateAdditionalFormat } from '../../../src/core/generators';
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
const held = official.records.filter(row => Object.hasOwn(sourceExclusions, row.source)).map(row => row.number);
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

test('S3-009 keeps search, bookmark identity and original numbering across the remaining publication gaps', () => {
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

test('問65の全候補の技術条件を独立に判定し、原画像と生成表示で利用条件を保持する', async () => {
  const bundle = fixture();
  const original = bundle.questions.find(item => item.id === originalId(65));
  assert(original);
  const { base, template } = bookmarkTemplate(bundle, refOf(original));
  const guide = 'rights-ipa-cf2013-guidance-2014-autumn-am-65-cc-by-sa-21jp';
  const guideSource = 'source-ipa-cf2013-guidance-q65-20261025';
  const asset = bundle.assets.find(item => item.id === 'asset-ipa-2014h26a-fe-am-65');
  const rights = bundle.rights.find(item => item.id === guide);
  assert(asset && asset.alt.includes('作成する。') && asset.alt.startsWith('問65'));
  assert(rights);
  assert.equal(rights.licenseId, 'CC-BY-SA-2.1-JP');
  assert.deepEqual(asset.attribution.sourceRefs.filter(ref => ref.sourceId === guideSource).map(ref => ref.locator.page), [12, 13]);
  assert(asset.attribution.rightsRefs.includes(guide));
  assert(!original.correctAnswer.attribution.rightsRefs.includes(guide));
  assert(!original.explanation.attribution.rightsRefs.includes(guide));
  assert.equal(original.correctAnswer.choiceId, 'choice-original-2');
  assert.equal(displayQuestionNumber(original, 0), '65');
  const search = findSearchDocuments(questionSearchDocuments(bundle), { ...emptySearch, query: '非機能要件の定義で行う作業', year: 2014 });
  assert(search.some(result => result.question.id === original.id));

  // ガイダンスの項1(3)は業務側の機能間受渡し・処理範囲・外部連携。
  // 項1(4)技術要件(c)(d)は実装言語又は開発時の基準を定める側。
  const roles = {
    flow: /機能間の情報|機能へ引き渡す|間で引き渡す/,
    scope: /実現する範囲|割当てを行うか|という分担|担当範囲/,
    interface: /他システムとの情報|配送システムへ|会計システムへ|決済サービスに/,
    technical: /プログラム言語に合わせた開発基準|ログの書式を開発標準|警告を開発標準|呼び出す方法を開発規約/,
  };
  const solutions = new Set<string>(), stems = new Set<string>();
  for (const value of [0, 1, 2, 3]) {
    const known = bindAdditionalQuestion(base, template, [value], `q65-review-${value}`, '2026-11-18T00:00:00Z');
    validateAdditionalFormat(known, template);
    const identified = known.choices.map(choice => {
      const [block] = choice.content.blocks;
      assert(block.type === 'paragraph');
      const matched = Object.entries(roles).filter(([, expression]) => expression.test(block.text));
      assert.equal(matched.length, 1, block.text);
      assert(choice.content.attribution.rightsRefs.includes(guide));
      return matched[0][0];
    });
    assert.deepEqual([...identified].sort(), Object.keys(roles).sort());
    assert.equal(known.correctAnswer.choiceId, known.choices[identified.indexOf('technical')].id);
    assert(known.correctAnswer.choiceId);
    solutions.add(known.correctAnswer.choiceId);
    stems.add(JSON.stringify(known.prompt.blocks));
    assert.deepEqual(known.explanation.attribution.rightsRefs, ['rights-original']);
  }
  assert.equal(solutions.size, 4);
  assert.equal(stems.size, 4);
});
