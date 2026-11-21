import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { catalogFileRecords, catalogKinds, CATALOG_MAX_BYTES } from '../src/core/catalog-files';
import { hasAssetSignature } from '../src/core/asset-signature';
import { contentHash } from '../src/core/hash';
import type { Asset, Rights, Source } from '../src/core/types';
import { labels } from '../src/core/types';
import { independentHuffmanDisplay, spring2004Pm3 } from '../src/core/generators/legacy-2004-spring-pm-3';
import { spring2004Pm3Figure } from '../src/core/generators/legacy-2004-spring-pm-3-figures';
import { huffmanCase } from '../src/core/generators/legacy-2004-spring-pm-3-model';
import { readDistributionBundle, encodeRecordPacks } from './distribution-files';
import { afternoonBookletSourceRef, makeAfternoonBookletRecords, type Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2004PmBooklet, spring2004PmSets } from './legacy-2004-spring-pm-metadata';
import initialReview from './source-evidence/legacy-2004-spring-pm-source-review.json';
import review from './source-evidence/legacy-2004-spring-pm-3-source-review.json';

const { collectionId, number, checkedOn } = review;
const source = collectionId + '-' + number;
const questionId = 'source-ipa-' + source + '-qs';
const answerId = 'source-ipa-' + source + '-ans';
const rightId = 'rights-ipa-' + source;
const ref = (page: number, answer = false) => afternoonBookletSourceRef(spring2004PmBooklet, number, page, answer);
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const { rows, text } = huffmanCase(0);
const alt: Record<number, string> = {
  10: '問3　ハフマン符号化。出現回数の偏りを利用して図1の100文字を圧縮する。全角1文字16ビット（2バイト）では1,600ビット。図1は△を空白とする独立編集した例で、先頭部と末尾部を示す。' +
    independentHuffmanDisplay(text).join('。') + '。図2の文字と出現回数：' + rows.map(row => row.symbol + ' ' + row.count).join('、') +
    '。設問1　37種類の文字を固定長で区別するには1文字に［a］ビットを対応させ、全体を［a］ビット／文字×100文字の長さで表現できる。',
  11: '続き。全角1文字を16ビットで表現する方式を100％とすると［b］％。表の列は表現の方式・1文字の長さ・対象文字列の長さ・圧縮の割合。全角16ビット方式は16ビット・1,600ビット・100％、37種類を固定長で表現する場合は［a］ビット・省略・［b］％。' +
    'aの解答群：ア 1、イ 6、ウ 7、エ 16、オ 20、カ 33、キ 37、ク 47、ケ 100。bの解答群：ア 2.3、イ 6.0、ウ 6.3、エ 16.2、オ 16.7、カ 37.0、キ 37.5、ク 43.2。' +
    'ハフマン符号化では、(1) 出現回数の多い順、同じ回数の文字は文字コードの昇順、仮想の文字の回数が同じときは直前の順序に並べる。(2) 末尾の2文字をまとめて回数を足した仮想の1文字を末尾に置く。(3) 2種類になるまで繰り返す。(4) 最後の2種類に1又は0の1ビットを対応させる。',
  12: '(5) 2種類の文字から戻り、各段階で直前のビット列の右端に1又は0を付けて元の37種類に割り当てる。(6) 対象の文字列を37種類のビット列で表現する。' +
    '設問2　図3は(1)〜(3)の実際の操作。①は［c］、②は［d］。図4のビット列で表すと全角1文字16ビット方式の約［e］％。図3：' +
    spring2004Pm3Figure.alt([0]) + '符号化したビット列を先頭から見れば、文字のビット列を一意に識別できる。',
  13: '図4 文字の出現回数と対応するビット列に関する情報。各文字を順に、出現回数、対応ビット列、ビット長、出現ビット長、出現ビット累計で示す。' +
    rows.map(row => [row.symbol, row.count, row.bits, row.length, row.weightedBits, row.runningBits].join('｜')).join('。') +
    '。出現ビット長は、ビット長×出現回数で計算する。',
  14: 'c・dに関する共通の解答群。アは25、イは32、ウは43、エは57、オは100。eに関する解答群。アは3.0、イは7.0、ウは18.8、エは30.3、オは43.8、カは50.0、キは80.7、クは85.7。',
};

async function install(dataDir: string, materialDir: string) {
  const before = readDistributionBundle(dataDir);
  assert.equal(initialReview.collectionId, collectionId);
  assert.equal(initialReview.sourceInputs['questions.pdf'].sha256, review.paperSHA256);
  assert.equal(initialReview.sourceInputs['answers.pdf'].sha256, review.answersSHA256);
  const official = initialReview.questions.find(row => row.number === number);
  assert(official);
  assert.deepEqual(official.pages, Object.keys(review.pages).map(Number));
  assert.deepEqual(official.fields.flatMap(field => field.key), review.parts);
  const [sourceQ1, answerQ1, rightsQ1] = [
    before.sources.find(row => row.id === 'source-ipa-' + collectionId + '-1-qs'),
    before.sources.find(row => row.id === 'source-ipa-' + collectionId + '-1-ans'),
    before.rights.find(row => row.id === 'rights-ipa-' + collectionId + '-1'),
  ] as const;
  assert(sourceQ1 && answerQ1 && rightsQ1);
  assert.equal(sourceQ1.sha256, review.paperSHA256);
  assert.equal(answerQ1.sha256, review.answersSHA256);
  const sources: Source[] = [
    { ...sourceQ1, id: questionId, checkedOn, title: spring2004PmBooklet.officialTitle + ' 問3（国立国会図書館WARP保存版）',
      scope: '原資料p.10の図1内の文字列を除く問3本文・図表・解答群。', sections: ['PDF p.10–14 問3'], limits: review.rightsBoundary },
    { ...answerQ1, id: answerId, checkedOn, title: spring2004PmBooklet.officialTitle + ' 問3 解答例（国立国会図書館WARP保存版）',
      scope: 'p.1 問3の公式解答5欄。', sections: ['PDF p.1 問3の解答例'] },
  ];
  const rights: Rights[] = [{
    ...rightsQ1, id: rightId, checkedOn, scope: '平成16年度春期 基本情報技術者試験 午後 問3のIPA出題部分・正答。',
    attributionText: '出典：平成16年度春期 基本情報技術者試験 午後 問3。©2004 IPA。国立国会図書館WARP保存版。',
    thirdParty: { status: 'none_identified', notes: review.rightsBoundary, rightsRefs: [] },
    evidence: [...rightsQ1.evidence.filter(entry => !entry.locator.questionNumber), ...official.pages.map(page => ref(page)), ref(1, true)],
    assessmentNotes: review.rightsBoundary,
  }];
  const assets: Asset[] = [];
  const bytesByPath = new Map<string, Uint8Array>();
  for (const [key, material] of Object.entries(review.pages)) {
    const page = Number(key);
    const bytes = fs.readFileSync(path.join(materialDir, material.filename));
    const { filename, ...metadata } = material;
    const asset: Asset = { schemaVersion: '3.0.0', id: spring2004PmBooklet.pageAssetId(page),
      path: 'assets/' + filename, mediaType: 'image/webp', ...metadata, alt: alt[page],
      attribution: {
        origin: page === 10 ? 'adapted' : 'official', sourceRefs: [ref(page)],
        rightsRefs: page === 10 ? [rightId, 'rights-original'] : [rightId], creatorIds: page === 10 ? ['ipa', 'codex'] : ['ipa'],
      } };
    assert(bytes.length === material.byteLength && sha256(bytes) === material.sha256 && hasAssetSignature(asset, bytes));
    assets.push(asset);
    bytesByPath.set(asset.path, bytes);
  }
  const spec: Stage3AfternoonQuestionSpec = {
    number, title: spring2004Pm3.title, pages: official.pages, definition: spring2004Pm3,
    original: spring2004Pm3.build([0]), originalPageAlt: alt,
    topics: ['データ圧縮', 'ハフマン符号化', '接頭語符号'], keywords: ['出現回数', '固定長', 'ビット列', '圧縮率'],
  };
  const records = await makeAfternoonBookletRecords(spring2004PmBooklet, { specs: [spec], assets, sources, rights, checkedOn,
    reviews: { [number]: { checkedOn, reviewerIds: ['codex'],
      checks: { publication: 'pass', terms: 'pass', thirdParty: 'pass', transcription: 'pass', answer: 'pass', explanation: 'pass' },
      notes: review.reviewNotes } } });
  const [original, base] = records.questions;
  assert.deepEqual(original.correctAnswer.parts?.map((part, index) => {
    assert(part.kind === 'choice');
    return labels[original.answerParts![index].choiceIds.indexOf(part.choiceId)];
  }), review.parts);
  original.origin.isModified = true;
  original.origin.changes[0].summary = '図1の文字列を独立編集した入力例へ差し替え';
  original.origin.changes[0].kind = 'diagram';
  original.origin.changes[0].details = review.rightsBoundary;
  const first = original.prompt.blocks[0];
  assert(first.type === 'image');
  first.caption = '図1の文字列を差し替えた原資料 問3（印刷p.10／PDF p.10）';
  for (const question of [original, base]) question.distribution = 'included';
  const [template] = records.templates;
  template.distribution = 'included';
  template.originalContentSha256 = await contentHash(base);

  const mix = before.sets.find(set => set.id === 'set-mix-b');
  const study = before.sets.find(set => set.id === 'set-annual-' + review.scope);
  assert(mix?.distribution === 'included' && study?.distribution === 'included' &&
    study.questionRefs.length === 7 && study.questionSelection?.requiredQuestionRefs.length === 2);
  const numbers = [...study.questionRefs.map(entry => Number(entry.questionId.split('-').at(-1))), number].sort((a, b) => a - b);
  const compiled = spring2004PmSets(numbers);
  const revisions = new Map<string, unknown>();
  for (const next of compiled.exams) {
    const previous = before.exams.find(exam => exam.id === next.id);
    assert(previous && next.questionCount === previous.questionCount + 1);
    revisions.set(next.id, { ...next, revision: previous.revision + 1 });
  }
  for (const next of compiled.sets) {
    const previous = before.sets.find(set => set.id === next.id);
    assert(previous?.distribution === 'included' && next.questionRefs.length === previous.questionRefs.length + 1);
    assert.deepEqual(next.questionRefs.filter(entry => !entry.questionId.endsWith('-' + number)), previous.questionRefs);
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

  const catalog = structuredClone(before.catalog);
  catalog.revision++;
  const obsolete: string[] = [];
  for (const kind of catalogKinds) {
    const known = new Set(before[kind].map(row => row.id));
    assert(records[kind].every(row => !known.has(row.id)), 'release records do not replace older question content');
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
          bytesByPath.set(next.path, encoded);
        }
      }
    }
    for (const { entry, bytes } of encodeRecordPacks(kind, records[kind])) {
      newPacks.push(entry);
      bytesByPath.set(entry.path, bytes);
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
  return { count: numbers.length, catalogSHA256: installed.catalogHash };
}

const [dataDir, materials] = process.argv.slice(2);
assert(dataDir && materials && process.argv.length === 4,
  'usage: tsx scripts/legacy-2004-spring-pm-3-prepare.ts <data-directory> <reviewed-webp-materials>');
console.log(JSON.stringify(await install(dataDir, materials)));
