import assert from 'node:assert/strict';
import test, { before } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixture, installFixtureGenerators } from '../../fixtures';
import official from '../../fixtures/legacy-2009-spring-am-official-answers.json';
import review from '../../../scripts/source-evidence/legacy-2009-spring-am-source-review.json';
import { sourceExclusions, sourceScope } from '../../../scripts/source-inventory';
import { bookmarkTemplate, makeBookmark } from '../../../src/core/bookmarks';
import { bindQuestion } from '../../../src/core/generation';
import { validateSourceFormat } from '../../../src/core/generation-formats';
import { contentHash } from '../../../src/core/hash';
import { menuSourceGroups, menuSubjectOptions } from '../../../src/core/menu-selection';
import { mixProfile } from '../../../src/core/mix-profile';
import { emptySearch, findSearchDocuments, questionSearchDocuments, searchableQuestions } from '../../../src/core/search';
import { selectQuestions } from '../../../src/core/selection';
import { finishRun, prepareRun, remaining, startRun, updateAnswer, validateRun } from '../../../src/core/session';
import { sourceCollections } from '../../../src/core/source-collections';
import { displayQuestionNumber } from '../../../src/core/source-label';
import { refOf, type Run, type Selection } from '../../../src/core/types';
import { AnswerChoices } from '../../../src/ui/AnswerChoices';
import { materialPages } from '../../../src/ui/MaterialViewer';

const collection = official.collectionId;
const setId = `set-annual-${collection}`;
const held = review.held.map((row: { number: number }) => row.number);
const published = official.records.filter(row => !held.includes(row.number));
const originalId = (n: number) => `question-ipa-${collection}-${n}`;
const config = (kind: 'annual' | 'mix'): Selection => ({ subject: 'A', kind, mode: 'practice', size: 'public',
  bindingMode: kind === 'annual' ? 'original_data' : 'generated_values',
  ...(kind === 'annual' ? { sourceCollectionId: setId } : { mixProfileCollectionId: setId }),
});

before(installFixtureGenerators);

test('S3-031 preserves all official obligations and admits only the reviewed source, base and generator pairs', async () => {
  const bundle = fixture();
  const annual = sourceCollections(bundle, 'A').find(item => item.id === setId);
  assert(annual);
  assert.equal(official.records.length, 80);
  assert.equal(published.length + held.length, official.officialQuestionCount);
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
    const [domain, ...additionalFields] = template.parameterDomain.fields ?? [];
    assert(domain && !additionalFields.length);
    for (let value = domain.minimum; value <= domain.maximum; value++) {
      const generated = bindQuestion(base, template, [value], 's3-031-format-check', '2026-11-12T00:00:00Z');
      assert.doesNotThrow(() => validateSourceFormat(generated, template), `問${row.number} input ${value}`);
    }
  }
  for (const n of held) {
    const source = `${collection}-${n}`;
    assert(Object.hasOwn(sourceExclusions, source));
    assert(!questions.has(originalId(n)) && !questions.has(`question-template-source-${source}`));
    assert(!bundle.templates.some(template => template.id === `template-source-${source}`));
    assert(!bundle.assets.some(asset => asset.id === `asset-ipa-${source}`));
  }
});

test('S3-031 uses its year and period, the admitted count and the official 150-minute limit in both modes', () => {
  const bundle = fixture();
  const group = menuSourceGroups(bundle).find(item => item.collections.some(collection => collection.id === setId));
  assert(group);
  assert.equal(group.title, '旧制度 · 2009年度 春期');
  assert.equal(group.period, '春期');
  assert(!group.collections.some(collection => collection.id === 'set-annual-2009h21a-fe-am'));
  const afternoonAvailable = sourceScope.some(id => id.startsWith('2009h21h-fe-pm-') && !Object.hasOwn(sourceExclusions, id));
  assert.deepEqual(menuSubjectOptions(group).map(option => [option.title, option.available]),
    [['旧制度・午前', true], ['旧制度・午後', afternoonAvailable]]);
  const configured = bundle.exams.find(exam => exam.id === `exam-${collection}-practice`);
  assert.equal(configured?.practiceScope, 'public_subset');
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

test('S3-031 keeps search, bookmark identity and original numbering across publication gaps', () => {
  const bundle = fixture();
  const originals = searchableQuestions(bundle).filter(question => question.id.startsWith(`question-ipa-${collection}-`));
  assert.deepEqual(originals.map(question => question.id).sort(), published.map(row => originalId(row.number)).sort());
  const matched = findSearchDocuments(questionSearchDocuments(bundle), { ...emptySearch, query: 'クリティカルパス', year: 2009 });
  assert(matched.some(result => result.question.id === originalId(51)));
  for (const row of published) {
    const original = originals.find(item => item.id === originalId(row.number));
    assert(original);
    assert.equal(displayQuestionNumber(original, 0), String(row.number));
    const { base } = bookmarkTemplate(bundle, refOf(original));
    assert.deepEqual(makeBookmark(bundle, refOf(base), 0), makeBookmark(bundle, refOf(original), 0));
  }
});

test('S3-031 original and mix practice preserve timing, answered choices and actual grading denominator on resume', async () => {
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

test('S3-031 displays the nine circuit symbols and the inversion rule before answering', () => {
  const bundle = fixture();
  assert.deepEqual(review.commonPages, [2]);
  const common = bundle.assets.find(asset => asset.id === `asset-ipa-${collection}-common-2`);
  assert(common && common.alt.includes('論理一致素子') && common.alt.includes('スリーステートバッファ'));
  for (const row of published) {
    const original = bundle.questions.find(question => question.id === originalId(row.number));
    assert(original);
    const { base, template } = bookmarkTemplate(bundle, refOf(original));
    assert(materialPages(original).some(page => page.commonReference));
    assert(materialPages(base).some(page => page.commonReference));
    const generated = bindQuestion(base, template, [1], 'common-page-review', '2026-11-12T00:00:00Z');
    assert(materialPages(generated).some(page => page.commonReference));
    assert(original.origin.sourceRefs.some(ref => ref.locator.page === 2 && !ref.locator.questionNumber));
    assert(template.attribution.sourceRefs.some(ref => ref.locator.page === 2 && !ref.locator.questionNumber));
  }
});

test('S3-031 records METI sources and the public data license in originals and generated forms', () => {
  const bundle = fixture();
  const rightsId = `rights-meti-${collection}-59-80`;
  assert.equal(bundle.rights.find(row => row.id === rightsId)?.licenseId, 'PDL-1.0');
  for (const [number, identifier] of [[59, 'meti-management'], [80, 'meti-unauthorized-access']] as const) {
    const original = bundle.questions.find(question => question.id === originalId(number));
    assert(original);
    const { base, template } = bookmarkTemplate(bundle, refOf(original));
    const asset = bundle.assets.find(asset => asset.id === original.assetRefs[0]);
    const generated = bindQuestion(base, template, [1], 'source-credit-review', '2026-11-12T00:00:00Z');
    const sourceId = `source-ipa-${collection}-${identifier}`;
    assert.equal(bundle.sources.find(row => row.id === sourceId)?.publisher, '経済産業省');
    for (const attribution of [original.prompt.attribution, base.prompt.attribution, template.attribution, asset?.attribution, generated.prompt.attribution]) {
      assert(attribution);
    assert(attribution.rightsRefs.includes(rightsId));
      assert(attribution.sourceRefs.some(ref => ref.sourceId === sourceId));
    }
  }
});

test('S3-031 attributes each original and adaptation to the correct booklet and retains the IPA terms', () => {
  const bundle = fixture();
  const rightId = `rights-ipa-${collection}`;
  const rights = bundle.rights.find(row => row.id === rightId);
  assert(rights);
  assert.equal(rights.licenseId, 'LicenseRef-IPA-Past-Exam');
  assert.equal(rights.modificationNoticeRequired, true);
  assert(Object.values(rights.uses).every(value => value === 'allowed'));
  for (const row of published) {
    const original = bundle.questions.find(question => question.id === originalId(row.number));
    assert(original && !original.origin.isModified);
    const { base, template } = bookmarkTemplate(bundle, refOf(original));
    assert(base.origin.isModified);
    assert.equal(original.prompt.attribution.sourceRefs[0].sourceId, `source-ipa-${collection}-qs`);
    assert.equal(original.correctAnswer.attribution.sourceRefs[0].sourceId, `source-ipa-${collection}-ans`);
    assert(original.prompt.attribution.rightsRefs.includes(rightId));
    assert(base.prompt.attribution.rightsRefs.includes(rightId));
    assert(template.attribution.rightsRefs.includes(rightId));
    assert.deepEqual(original.explanation.attribution.rightsRefs, ['rights-original']);
    assert.deepEqual(base.explanation.attribution.rightsRefs, ['rights-original']);
  }
});

test('S3-031 preserves the original choice matrix headings and groups', () => {
  const bundle = fixture();
  const markup = (n: number, generated: boolean) => {
    const question = bundle.questions.find(row => row.id === (generated ? `question-template-source-${collection}-${n}` : originalId(n)));
    assert(question);
    const entry = { choiceOrder: question.choices.map(choice => choice.id) };
    return renderToStaticMarkup(createElement(AnswerChoices, { question, entry, bundle, assetUrls: {}, disabled: false, revealed: false }));
  };
  const matrices = new Map([
    [22, ['a', 'b', 'c']], [25, ['A', 'B']], [39, ['①', '②', '③']],
    [40, ['商店が利用する', '顧客が利用する']], [51, ['クリティカルパス', 'Hの最早開始日']],
  ]);
  for (const [number, headers] of matrices) {
    const body = markup(number, true);
    assert.equal((body.match(/<table/g) ?? []).length, 1);
    assert.equal((body.match(/scope="col"/g) ?? []).length, headers.length);
    assert.equal((body.match(/type="radio"/g) ?? []).length, 4);
    assert.deepEqual([...body.matchAll(/scope="col"[^>]*><p>([^<]+)<\/p>/g)].map(match => match[1]), headers);
    assert(!markup(number, false).includes('legacy-am-matrix'));
  }
});
