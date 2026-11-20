import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Asset, Attribution, Bundle, Rights, Source, SourceRef } from '../src/core/types';
import { catalogFileRecords, catalogKinds, CATALOG_MAX_BYTES } from '../src/core/catalog-files';
import { hasAssetSignature } from '../src/core/asset-signature';
import { contentHash } from '../src/core/hash';
import { autumn2007Pm1, binary32ReferenceTitle } from '../src/core/generators/legacy-2007-autumn-pm-1';
import { readDistributionBundle, encodeRecordPacks } from './distribution-files';
import { afternoonBookletSourceRef, makeAfternoonBookletRecords, type Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2007PmBooklet, autumn2007PmCommentaryRefs, autumn2007PmSets } from './legacy-2007-autumn-pm-metadata';
import initialReview from './source-evidence/legacy-2007-autumn-pm-source-review.json';
import review from './source-evidence/legacy-2007-autumn-pm-1-source-review.json';

const { collectionId, number, checkedOn } = review;
const source = collectionId + '-' + number;
const questionId = 'source-ipa-' + source + '-qs';
const answerId = 'source-ipa-' + source + '-ans';
const rightId = 'rights-ipa-' + source;
const oracleId = 'source-oracle-binary32-2007-autumn-pm-1';
const ref = (page: number, answer = false) => afternoonBookletSourceRef(autumn2007PmBooklet, number, page, answer);
const oracle: SourceRef = { sourceId: oracleId, locator: { section: review.oracle.section } };
const sha256 = (value: Uint8Array) => createHash('sha256').update(value).digest('hex');

const alt = {
  5: '問1　浮動小数点表示法。仮数A・指数BでA×2^Bを表す。31は符号部（0は正、1は負）、30〜23は指数に127を加えた2進数、22〜0は正規化で1≦|A|＜2とした整数部1を省略した仮数部。ビット22が小数第1位。数値0の場合はすべて0。規格図1に相当する欄の配置は別の独立参考表に示す。設問1　10進45.625は2進101101.101、正規化すると1.01101101×2^5になる。図2　符号0、指数10000100、仮数01101101000000000000000。',
  6: '同じ方法で10進−0.75を表す。符号部はa、指数部はb、仮数部の上位8けた（22〜15）はc。解答群 ア 0、イ 1、ウ 01111110、エ 01111111、オ 10000000、カ 11000000。設問2　二つの単精度数を加算する。符号｜指数｜仮数の順に、一つ目は0｜10000000｜01000…0、二つ目は0｜10000010｜01000…0。解答群 ア 0｜10000000｜10010…0、イ 0｜10000000｜11100…0、ウ 0｜10000010｜10010…0、エ 0｜10000010｜11100…0。',
};

async function install(dataDir: string, firstPath: string, secondPath: string) {
  const before = readDistributionBundle(dataDir);
  assert.equal(initialReview.collectionId, collectionId);
  assert.equal(initialReview.sourceInputs['questions.pdf'].sha256, review.paperSHA256);
  assert.equal(initialReview.sourceInputs['answers.pdf'].sha256, review.answersSHA256);
  const official = initialReview.questions.find(row => row.number === number);
  assert(official);
  assert.deepEqual(official.fields.flatMap(field => field.key), review.parts);
  const [sourceQ2, answerQ2, rightsQ2] = [
    before.sources.find(row => row.id === 'source-ipa-' + collectionId + '-2-qs'),
    before.sources.find(row => row.id === 'source-ipa-' + collectionId + '-2-ans'),
    before.rights.find(row => row.id === 'rights-ipa-' + collectionId + '-2'),
  ] as const;
  assert(sourceQ2 && answerQ2 && rightsQ2);
  assert.equal(sourceQ2.sha256, review.paperSHA256);
  assert.equal(answerQ2.sha256, review.answersSHA256);
  const sources: Source[] = [
    { ...sourceQ2, id: questionId, checkedOn, title: autumn2007PmBooklet.officialTitle + ' 問1（国立国会図書館WARP保存版）',
      scope: 'p.5の規格図を除く問1本文・例とp.6の全解答群。', sections: ['PDF p.5–6 問1'], limits: review.rightsBoundary },
    { ...answerQ2, id: answerId, checkedOn, title: autumn2007PmBooklet.officialTitle + ' 問1 解答例（国立国会図書館WARP保存版）',
      scope: 'p.1 問1の公式解答4欄。', sections: ['PDF p.1 問1'] },
    { schemaVersion: '3.0.0', id: oracleId, title: 'Numerical Computation Guide／Single Format', publisher: 'Oracle',
      url: review.oracle.url, sha256: review.oracle.sha256, checkedOn, availability: 'officially_published', type: 'independent_note',
      scope: '単精度の各欄の位置と幅の照合。', sections: [review.oracle.section],
      facts: ['符号部は1ビット、指数部は8ビット、仮数部は23ビット。指数のバイアスは127。'],
      supports: ['独立編集の参考表、正答検算'], dateNote: '資料確認日を試験日と区別する。', limits: '技術上の事実を照合し、説明文や図を利用しない。' },
  ];
  const rights: Rights[] = [{
    ...rightsQ2, id: rightId, checkedOn, scope: '平成19年度秋期 基本情報技術者試験 午後 問1のIPA出題部分・正答。',
    attributionText: '出典：平成19年度秋期 基本情報技術者試験 午後 問1。©2007 IPA。国立国会図書館WARP保存版。',
    thirdParty: { status: 'none_identified', notes: review.rightsBoundary, rightsRefs: [] },
    evidence: [...rightsQ2.evidence.filter(entry => !entry.locator.questionNumber), ref(5), ref(6), ref(1, true)],
    assessmentNotes: review.rightsBoundary,
  }];
  const assets: Asset[] = [];
  const bytesByPath = new Map<string, Buffer>();
  for (const [page, filename] of [[5, firstPath], [6, secondPath]] as const) {
    const bytes = fs.readFileSync(filename);
    const hash = review.pages[String(page) as keyof typeof review.pages].assetSHA256;
    assert.equal(sha256(bytes), hash);
    const attribution: Attribution = { origin: page === 5 ? 'adapted' : 'official', sourceRefs: [ref(page)],
      rightsRefs: [rightId], creatorIds: page === 5 ? ['ipa', 'codex'] : ['ipa'] };
    const asset: Asset = { schemaVersion: '3.0.0', id: autumn2007PmBooklet.pageAssetId(page),
      path: 'assets/' + collectionId + '-page-00' + page + (page === 5 ? '-reviewed.png' : '.png'),
      mediaType: 'image/png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20),
      byteLength: bytes.length, sha256: hash, alt: alt[page], attribution };
    assert(hasAssetSignature(asset, bytes));
    assert.deepEqual([asset.width, asset.height], [1323, page === 5 ? 1681 : 1872]);
    assets.push(asset);
    bytesByPath.set(asset.path, bytes);
  }
  const spec: Stage3AfternoonQuestionSpec = {
    number, title: autumn2007Pm1.title, pages: [5, 6], definition: autumn2007Pm1,
    original: autumn2007Pm1.build([0]), originalPageAlt: alt,
    topics: ['浮動小数点', '正規化', '単精度の加算'], keywords: ['IEEE 754', '2進小数', '指数部', '仮数部'],
    editorialContextTitles: [binary32ReferenceTitle], editorialContextSources: { [binary32ReferenceTitle]: [oracle] },
  };
  const records = await makeAfternoonBookletRecords(autumn2007PmBooklet, { specs: [spec], assets, sources, rights, checkedOn,
    reviews: { [number]: { checkedOn, reviewerIds: ['codex'],
      checks: { publication: 'pass', terms: 'pass', thirdParty: 'pass', transcription: 'pass', answer: 'pass', explanation: 'pass' },
      notes: review.reviewNotes } } });
  const [original, base] = records.questions;
  assert.deepEqual(original.correctAnswer.parts?.map((part, index) => {
    assert(part.kind === 'choice');
    return 'アイウエオカ'[original.answerParts![index].choiceIds.indexOf(part.choiceId)];
  }), review.parts);
  original.origin.isModified = true;
  original.origin.changes[0].summary = '原資料p.5の規格図を除き、必要な事実を示す参考表を追加';
  original.origin.changes[0].kind = 'diagram';
  original.origin.changes[0].details = review.rightsBoundary;
  for (const item of [original, base]) {
    item.explanation.attribution.sourceRefs.push(...autumn2007PmCommentaryRefs(number));
    item.distribution = 'included';
  }
  const [template] = records.templates;
  template.distribution = 'included';
  template.originalContentSha256 = await contentHash(base);

  const mix = before.sets.find(set => set.id === 'set-mix-b');
  const study = before.sets.find(set => set.id === 'set-annual-' + review.scope);
  assert(mix?.distribution === 'included' && study?.distribution === 'included' &&
    study.questionRefs.length === 11 && study.questionSelection?.requiredQuestionRefs.length === 4);
  const compiled = autumn2007PmSets([number, ...study.questionRefs.map(entry => Number(entry.questionId.split('-').at(-1)))]);
  const revisions = new Map<string, unknown>();
  for (const next of compiled.exams) {
    const previous = before.exams.find(exam => exam.id === next.id);
    assert(previous && next.questionCount === previous.questionCount + 1);
    revisions.set(next.id, { ...next, revision: previous.revision + 1 });
  }
  for (const next of compiled.sets) {
    const previous = before.sets.find(set => set.id === next.id);
    assert(previous?.distribution === 'included' && next.questionRefs.length === previous.questionRefs.length + 1);
    assert.deepEqual(next.questionRefs.slice(1), previous.questionRefs);
    revisions.set(next.id, { ...next, distribution: 'included', revision: previous.revision + 1,
      examConfigRefs: next.examConfigRefs.map(config => {
        const prior = previous.examConfigRefs.find(entry => entry.id === config.id);
        assert(prior);
        return { ...prior, revision: prior.revision + 1 };
      }),
    });
  }
  revisions.set(mix.id, { ...mix, revision: mix.revision + 1,
    questionRefs: [...mix.questionRefs, template.baseQuestionRef], generationBindings: [...mix.generationBindings, {
      questionRef: template.baseQuestionRef, templateRef: { id: template.id, revision: template.revision },
    }],
  });

  const additions: Pick<Bundle, typeof catalogKinds[number]> = records;
  const catalog = structuredClone(before.catalog);
  catalog.revision++;
  const obsolete: string[] = [];
  for (const kind of catalogKinds) {
    const known = new Set(before[kind].map(row => row.id));
    assert(additions[kind].every(row => !known.has(row.id)), 'release records do not replace older question content');
    const newPacks = [];
    for (const entry of catalog.files[kind]) {
      const bytes = fs.readFileSync(path.join(dataDir, entry.path));
      assert.equal(sha256(bytes), entry.sha256);
      const rows = catalogFileRecords(entry, JSON.parse(bytes.toString('utf8'))) as { id: string }[];
      if (!rows.some(row => revisions.has(row.id))) newPacks.push(entry);
      else {
        obsolete.push(entry.path);
        for (const { entry: next, bytes: encoded } of encodeRecordPacks(kind, rows.map(row => revisions.get(row.id) ?? row))) {
          newPacks.push(next);
          bytesByPath.set(next.path, Buffer.from(encoded));
        }
      }
    }
    for (const { entry, bytes } of encodeRecordPacks(kind, additions[kind])) {
      newPacks.push(entry);
      bytesByPath.set(entry.path, Buffer.from(bytes));
    }
    assert(newPacks.length <= 500 && new Set(newPacks.map(pack => pack.path)).size === newPacks.length);
    catalog.files[kind] = newPacks;
  }
  assert.equal(sha256(fs.readFileSync(path.join(dataDir, 'catalog.json'))), before.catalogHash);
  const nextCatalog = Buffer.from(JSON.stringify(catalog, null, 2) + '\n');
  assert(nextCatalog.length <= CATALOG_MAX_BYTES);
  const temp = path.join(dataDir, '.supplement-catalog.json');
  const created: string[] = [];
  try {
    for (const [name, bytes] of bytesByPath) {
      const target = path.join(dataDir, name);
      fs.writeFileSync(target, bytes, { flag: 'wx' });
      created.push(target);
    }
    fs.writeFileSync(temp, nextCatalog, { flag: 'wx' });
    created.push(temp);
    fs.renameSync(temp, path.join(dataDir, 'catalog.json'));
  } catch (error) {
    for (const target of created) fs.unlinkSync(target);
    throw error;
  }
  for (const name of obsolete) fs.unlinkSync(path.join(dataDir, name));
  const installed = readDistributionBundle(dataDir);
  assert.equal(installed.questions.length, before.questions.length + 2);
  return { count: study.questionRefs.length + 1, catalogSHA256: installed.catalogHash };
}

const [dataDir, first, second] = process.argv.slice(2);
assert(dataDir && first && second && process.argv.length === 5,
  'usage: tsx scripts/legacy-2007-autumn-pm-1-prepare.ts <data-directory> <reviewed-p05> <reviewed-p06>');
console.log(JSON.stringify(await install(dataDir, first, second)));
