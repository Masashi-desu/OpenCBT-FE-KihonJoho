import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { catalogFileRecords, catalogKinds } from '../src/core/catalog-files';
import { contentHash } from '../src/core/hash';
import { type Rights, type SourceRef } from '../src/core/types';
import { legacy2014AutumnAm65Definition } from '../src/core/generators/legacy-2014-autumn-am-65';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import { commonFramework65GuideRefs, commonFramework65GuideRight } from '../src/core/generators/common-framework65-material';
import { encodeRecordPacks, readDistributionBundle } from './distribution-files';
import { makeStage3MorningRecords, stage3MorningSourceRef } from './stage3-morning-records';
import official from '../tests/fixtures/legacy-2014-autumn-am-official-answers.json';
import sourceReview from './source-evidence/legacy-2014-autumn-am-source-review.json';
import supplementReview from './source-evidence/legacy-2014-autumn-am-65-review.json';

const id = '2014h26a-fe-am';
const number = 65;
const source = id + '-' + number;
const checkedOn = supplementReview.checkedOn;
const ipaRights = 'rights-ipa-' + source;
const guideRights = 'rights-ipa-cf2013-guidance-2014-autumn-am-65-cc-by-sa-21jp';
const adaptationRights = 'rights-2014-autumn-am-65-adaptations-cc-by-sa-21jp';
const reviewedCropHash = supplementReview.questionPaper.cropSHA256;
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

async function prepare(cropPath: string, dataDir: string) {
  const bundle = readDistributionBundle(dataDir);
  const catalog = structuredClone(bundle.catalog);
  const crop = fs.readFileSync(cropPath);
  assert.equal(digest(crop), reviewedCropHash);
  const reviewed = official.records.find(record => record.number === number);
  assert(reviewed && reviewed.source === source && reviewed.physicalPage === 27 && reviewed.officialKey === 'イ');
  assert.equal(bundle.sources.find(record => record.id === 'source-ipa-' + id + '-qs')?.sha256, sourceReview.sourceInputs['question.pdf'].sha256);
  assert.equal(bundle.sources.find(record => record.id === 'source-ipa-' + id + '-ans')?.sha256, sourceReview.sourceInputs['answer.pdf'].sha256);
  const definition = stage3AllMorningDefinitions.find(item => item.source === source);
  assert(definition);
  const raw = legacy2014AutumnAm65Definition.build([0]);
  const alt = [`問${number}`, ...raw.prompt.map(block => block.type === 'paragraph' ? block.text : ''),
    ...raw.choices.map(([block], index) => `　${'アイウエ'[index]}　${block.type === 'paragraph' ? block.text : ''}`)].join('\n');
  const commonAssets = [2, 3].map(page => {
    const asset = bundle.assets.find(record => record.id === `asset-ipa-${id}-common-${page}`);
    assert(asset);
    return asset;
  });
  const definitionRefs: SourceRef[] = commonFramework65GuideRefs();
  const existingGuide = bundle.rights.find(right => right.id === commonFramework65GuideRight);
  const existingExam = bundle.rights.find(right => right.id === 'rights-ipa-' + id);
  assert(existingGuide && existingExam);
  const guide: Rights = {
    ...structuredClone(existingGuide),
    id: guideRights, checkedOn,
    scope: '2014年度秋期午前問65の4肢のうちガイダンスp.12項1(3)とp.13技術要件(c)(d)に対応する表現。原画像・altの該当文と、基準・生成問題の派生した選択肢を含む。',
    attributionText: '©2013 IPA『共通フレーム2013』第3部 ガイダンス p.12–13（CC BY-SA 2.1 日本）。',
    assessmentNotes: 'IPAの対象ガイダンスの使用条件に基づく。隣接のJISの引用・質特性一覧と試験冊子の組版はこの条件の範囲外。生成例では開発の対象・基準と比較する業務を変更した。',
  };
  const adaptation: Rights = {
    schemaVersion: '3.0.0', id: adaptationRights, holders: ['OpenCBT-FE-KihonJoho 教材編集者（actorId:codex）'],
    basis: 'own_work', uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
    evidence: [], checkedOn, licenseId: 'CC-BY-SA-2.1-JP', modificationNoticeRequired: true,
    scope: '問65の生成器に収録した開発事例・選択肢に本プロジェクトが追加した派生教材表現。',
    attributionText: '選択肢の転記と開発事例の変更はOpenCBT-FE-KihonJoho（CC BY-SA 2.1 日本）。',
    thirdParty: { status: 'present_cleared', notes: '元のガイダンスはIPAのライセンスを別掲する。', rightsRefs: [guideRights] },
    assessmentNotes: 'ガイダンスを基にした派生表現は同じ条件で提供する。',
  };
  const examRight: Rights = {
    ...structuredClone(existingExam), id: ipaRights, checkedOn,
    scope: '平成26年度 秋期 基本情報技術者試験 午前 問65のIPA作問部分、組版、公式正答。',
    attributionText: '出典：平成26年度 秋期 基本情報技術者試験 午前 問65。©2014 独立行政法人情報処理推進機構（IPA）。',
    thirdParty: { status: 'present_cleared', notes: '4肢の由来表現はIPAガイダンスのCC BY-SA 2.1 日本。試験等の利用条件と併記する。', rightsRefs: [guideRights] },
  };
  const selected = await makeStage3MorningRecords({
    collectionId: id, checkedOn, definitions: [definition], commonAssets, reviewedCommonPages: [2, 3],
    sources: [], rights: [guide, adaptation, examRight],
    facts: [{ source, number, page: 27, officialKey: 'イ', alt, area: 'strategy', choiceShuffleAllowed: false,
      crop: { path: cropPath, sha256: reviewedCropHash, width: crop.readUInt32BE(16), height: crop.readUInt32BE(20),
        byteLength: crop.length, cropBox: supplementReview.questionPaper.cropBox } }],
  });
  const [original, base] = selected.questions;
  const [template] = selected.templates;
  const image = selected.assets.find(asset => asset.id === 'asset-ipa-' + source);
  assert(image);
  const exam = stage3MorningSourceRef(id, number, 27);
  const officialAttr = { origin: 'official' as const, sourceRefs: [exam, ...definitionRefs], rightsRefs: [ipaRights, guideRights], creatorIds: ['ipa'] };
  const adaptedAttr = { ...officialAttr, rightsRefs: [...officialAttr.rightsRefs, adaptationRights], origin: 'adapted' as const, creatorIds: ['codex'] };
  original.prompt.attribution = officialAttr;
  original.choices.forEach(choice => { choice.content.attribution = officialAttr; });
  original.correctAnswer.attribution.rightsRefs = [ipaRights];
  image.attribution = officialAttr;
  for (const question of [original, base]) {
    question.origin.sourceRefs.push(...definitionRefs);
    question.distribution = 'included';
    question.review.notes = '原冊子p.27と公式解答p.1を照合。ガイダンス由来の選択肢は該当箇所だけCC BY-SA 2.1 日本で利用。試験の出典と利用条件を併記する。正答解説は各肢を独立に分類した記述。';
  }
  base.prompt.attribution = adaptedAttr;
  base.choices.forEach(choice => { choice.content.attribution = adaptedAttr; });
  template.attribution = adaptedAttr;
  template.distribution = 'included';
  template.originalContentSha256 = await contentHash(base);

  const annual = bundle.sets.find(set => set.id === 'set-annual-' + id);
  const mix = bundle.sets.find(set => set.id === 'set-mix-a');
  assert(annual && mix);
  const count = annual.questionRefs.length + 1;
  assert.equal(count, 78);
  const originalRef = { questionId: original.id, revision: original.revision };
  const baseRef = structuredClone(template.baseQuestionRef);
  const examConfigRefs = annual.examConfigRefs.map(ref => ({ ...ref, revision: ref.revision + 1 }));
  const exams = bundle.exams.filter(record => examConfigRefs.some(ref => ref.id === record.id));
  assert.equal(exams.length, 2);
  assert(exams.every(record => record.questionCount === count - 1));
  const originalNumber = (ref: typeof originalRef) => Number(ref.questionId.split('-').at(-1));
  const successors = new Map<string, unknown>([
    [annual.id, { ...annual, revision: annual.revision + 1, examConfigRefs, questionRefs: [...annual.questionRefs, originalRef].sort((a, b) => originalNumber(a) - originalNumber(b)) }],
    [mix.id, { ...mix, revision: mix.revision + 1, questionRefs: [...mix.questionRefs, baseRef],
      generationBindings: [...mix.generationBindings, { questionRef: baseRef, templateRef: { id: template.id, revision: template.revision } }] }],
    ...exams.map(record => [record.id, { ...record, revision: record.revision + 1, questionCount: count }] as const),
  ]);
  const additions = { questions: [original, base], templates: [template], assets: [image], rights: [guide, adaptation, examRight], sources: [], exams: [], sets: [] };
  for (const kind of catalogKinds) {
    const existing = new Set(bundle[kind].map(record => record.id));
    assert(additions[kind].every(record => !existing.has(record.id)), 'cannot overwrite a previously published question or material');
  }
  assert(!fs.existsSync(path.join(dataDir, image.path)));
  const removed = [];
  for (const kind of catalogKinds) {
    const upcoming = [];
    for (const entry of catalog.files[kind]) {
      const records = catalogFileRecords(entry, JSON.parse(fs.readFileSync(path.join(dataDir, entry.path), 'utf8'))) as { id: string }[];
      if (records.every(record => !successors.has(record.id))) upcoming.push(entry);
      else {
        removed.push(entry.path);
        const packs = encodeRecordPacks(kind, records.map(record => successors.get(record.id) ?? record));
        for (const { entry: replacement, bytes } of packs) {
          fs.writeFileSync(path.join(dataDir, replacement.path), bytes, { flag: 'wx' });
          upcoming.push(replacement);
        }
      }
    }
    for (const { entry, bytes } of encodeRecordPacks(kind, additions[kind])) {
      fs.writeFileSync(path.join(dataDir, entry.path), bytes, { flag: 'wx' });
      upcoming.push(entry);
    }
    catalog.files[kind] = upcoming;
  }
  fs.writeFileSync(path.join(dataDir, image.path), crop, { flag: 'wx' });
  catalog.revision++;
  const stage = path.join(dataDir, '.supplement-catalog.json');
  fs.writeFileSync(stage, JSON.stringify(catalog, null, 2) + '\n', { flag: 'wx' });
  fs.renameSync(stage, path.join(dataDir, 'catalog.json'));
  for (const obsolete of removed) fs.unlinkSync(path.join(dataDir, obsolete));
}

const [crop, destination = 'public/data'] = process.argv.slice(2);
assert(crop, 'usage: tsx scripts/legacy-2014-autumn-am-65-prepare.ts <reviewed-question-crop> [data-dir]');
await prepare(crop, destination);
