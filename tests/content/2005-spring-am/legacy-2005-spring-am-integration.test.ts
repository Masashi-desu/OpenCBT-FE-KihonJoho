import assert from 'node:assert/strict';
import test, { before } from 'node:test';
import { fixture, installFixtureGenerators } from '../../fixtures';
import official from '../../fixtures/legacy-2005-spring-am-official-answers.json';
import review from '../../../scripts/source-evidence/legacy-2005-spring-am-source-review.json';
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
import { schema, validateFormula } from '../../../src/core/validation';
import { refOf, type Run, type Selection } from '../../../src/core/types';
import { materialPages } from '../../../src/ui/MaterialViewer';
import { spring2005SpreadsheetAssetId, spring2005SpreadsheetPages, spring2005SpreadsheetTitle }
  from '../../../src/core/generators/legacy-2005-spring-am-spreadsheet-reference';

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

test('S3-047 preserves all official obligations and admits only the reviewed source, base and generator pairs', async () => {
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
    const fields = template.parameterDomain.fields;
    assert(fields);
    assert.equal(fields.length, 1);
    const [condition] = fields;
    assert.deepEqual([condition.minimum, condition.maximum], [0, 3]);
    for (let value = condition.minimum; value <= condition.maximum; value++) {
      const generated = bindQuestion(base, template, [value], 's3-041-format-check', '2026-11-15T00:00:00Z');
      assert.doesNotThrow(() => validateSourceFormat(generated, template), `問${row.number} 条件${value}`);
      assert.doesNotThrow(() => schema('question', generated), `問${row.number} 条件${value} の配布形式`);
      for (const block of [...generated.prompt.blocks, ...generated.choices.flatMap(choice => choice.content.blocks)]) {
        if (block.type === 'formula' && block.format === 'latex')
          assert.doesNotThrow(() => validateFormula(block.text), `問${row.number} 条件${value} の数式`);
      }
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

test('S3-047 uses its year and period, the admitted count and the official 150-minute limit in both modes', () => {
  const bundle = fixture();
  const group = menuSourceGroups(bundle).find(item => item.collections.some(collection => collection.id === setId));
  assert(group);
  assert.equal(group.title, '旧制度 · 2005年度 春期');
  assert.equal(group.period, '春期');
  const afternoonAvailable = group.collections.some(set => set.subject === 'B');
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

test('S3-047 keeps search, bookmark identity and original numbering across publication gaps', () => {
  const bundle = fixture();
  const originals = searchableQuestions(bundle).filter(question => question.id.startsWith(`question-ipa-${collection}-`));
  assert.deepEqual(originals.map(question => question.id).sort(), published.map(row => originalId(row.number)).sort());
  const matched = findSearchDocuments(questionSearchDocuments(bundle), { ...emptySearch, query: '著作権法', year: 2005 });
  assert(matched.some(result => result.question.id === originalId(80)));
  for (const row of published) {
    const original = originals.find(item => item.id === originalId(row.number));
    assert(original);
    assert.equal(displayQuestionNumber(original, 0), String(row.number));
    const { base } = bookmarkTemplate(bundle, refOf(original));
    assert.deepEqual(makeBookmark(bundle, refOf(base), 0), makeBookmark(bundle, refOf(original), 0));
  }
});

test('S3-047 original and mix practice preserve timing, answered choices and actual grading denominator on resume', async () => {
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

test('S3-047 supplies the spreadsheet appendix only for question 39 and keeps other reference paths scoped', () => {
  const bundle = fixture();
  const pages = held.includes(39) ? [] : spring2005SpreadsheetPages;
  assert.deepEqual(review.commonPages, [...pages]);
  assert.deepEqual(bundle.assets.filter(asset => asset.id.startsWith(`asset-ipa-${collection}-common-`)).map(a=>a.id).sort(),
    pages.map(spring2005SpreadsheetAssetId).sort());
  for (const row of published) {
    const original = bundle.questions.find(question => question.id === originalId(row.number));
    assert(original);
    const { base, template } = bookmarkTemplate(bundle, refOf(original));
    const originalReferences = materialPages(original).filter(page => page.commonReference);
    const generatedReferences = materialPages(base).filter(page => page.commonReference);
    assert.deepEqual(originalReferences.map(page => page.label), row.number === 39 ? [spring2005SpreadsheetTitle] : []);
    assert.deepEqual(generatedReferences.map(page => page.label), row.number === 39 ? [spring2005SpreadsheetTitle] : []);
    if (row.number === 39) {
      const blocks = originalReferences[0].content.blocks;
      assert.deepEqual(blocks.map(block => block.type === 'image' ? block.assetId : undefined),
        pages.map(spring2005SpreadsheetAssetId));
      assert.deepEqual(originalReferences[0].content.attribution.sourceRefs.map(ref => ref.locator.page), [...pages]);
      assert(generatedReferences[0].content.blocks.every(block => block.type === 'paragraph' || block.type === 'table'));
      assert.deepEqual(template.attribution.sourceRefs.slice(1).map(ref=>ref.locator.page), [...pages]);
    }
    assert(![...original.origin.sourceRefs, ...template.attribution.sourceRefs]
      .some(ref => [2, 40].includes(ref.locator.page ?? 0)));
  }
});

test('S3-047 links both official papers through WARP and uses the original publisher terms', () => {
  const bundle = fixture();
  const prefix = `source-ipa-${collection}-`;
  const originalPublisher = '独立行政法人情報処理推進機構（IPA）';
  for (const [suffix, hash] of [['qs', official.questionPaperSHA256], ['ans', official.answerPaperSHA256]] as const) {
    const paper = bundle.sources.find(row => row.id === prefix + suffix);
    assert(paper);
    assert.equal(paper.publisher, originalPublisher);
    assert.equal(paper.sha256, hash);
    assert.equal(new URL(paper.url).hostname, 'warp.ndl.go.jp');
    assert(paper.title.includes('WARP保存版'));
    assert.match(paper.title, /^平成17年度 春期 基本情報技術者試験 午前 /);
    assert(typeof paper.dateNote === 'string' && paper.dateNote.includes('平成17年度春期'));
  }
  const archivePolicy = bundle.sources.find(row => row.id === prefix + 'warp-help');
  assert.equal(archivePolicy?.publisher, '国立国会図書館');
  assert.equal(archivePolicy?.url, 'https://warp.ndl.go.jp/info/help#section5-4');
  const rights = bundle.rights.find(row => row.id === `rights-ipa-${collection}`);
  assert.deepEqual(rights?.holders, [originalPublisher]);
  assert(rights?.evidence.some(ref => ref.sourceId === prefix + 'faq'));
  assert(rights?.evidence.some(ref => ref.sourceId === prefix + 'warp-help'));
});

test('S3-047 attributes each original and adaptation to the correct booklet and retains the IPA terms', () => {
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
