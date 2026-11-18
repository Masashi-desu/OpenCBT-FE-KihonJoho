import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { stage3AllMorningDefinitions } from '../src/core/generators/stage3-morning-install';
import { contentHash } from '../src/core/hash';
import type { Attribution, Bundle, Rights, Source, SourceRef } from '../src/core/types';
import { schema } from '../src/core/validation';
import officialAnswers from '../tests/fixtures/legacy-2016-spring-am-official-answers.json';
import reviewed from '../tests/fixtures/legacy-2016-spring-am-57-80-review.json';
import { makeStage3MorningRecords, spring2016SourceRef, type Stage3MorningFact } from './stage3-morning-records';

const collection = '2016h28h-fe-am';
const checkedOn = '2026-11-18';
const meti = '経済産業省';
const archivedMeti = 'https://warp.ndl.go.jp/20170101/20161211215810/http://www.meti.go.jp/';
const ipaCommonRight = 'rights-ipa-' + collection;
const metiTerms = 'source-meti-2016-website-terms';
const metiAppendix = 'source-meti-2016-website-terms-appendix';
const ccByTerms = 'source-cc-by-4-0-legal-code';

const materials = [
  {
    number: 60,
    page: 26,
    key: 'ウ',
    area: 'management',
    sourceId: 'source-meti-2004-system-audit',
    name: 'システム監査基準（平成16年10月8日改訂）',
    file: 'system_kansa.pdf',
    sha256: 'e74646a3135318b2a7eb7639d31adb994132f312e3a0adb2f31c9aabdb3e4d83',
    locators: [
      { page: 1, section: 'Ⅰ 前文' },
      { page: 2, section: 'Ⅱ システム監査の目的・Ⅲ 2.1 外観上の独立性' },
    ],
    scope: 'IPA問60のウに対応する統制の評価とITガバナンスへの寄与の表現、及びその表現を学習用に用いる原画像・代替文・基準・生成問題。',
    facts: '独立した評価・検証に基づく保証と助言という監査目的を照合。IPA原問のイにある運用部門の自己点検は同じ組織の別活動として区別する。',
    note: '対象節に第三者の文・図表の転載や別条件を示す注記は特定されない。原PDFのAuthor欄は「駿河台大学」。本文に同大学の執筆・権利表示はなく、METIの同時期掲載案内は同省の基準として扱う。PDFの製作分担・契約条件は未確認。',
    change: '原問題はIPA冊子から対象問を切り出した。基準・生成問題と解説は本プロジェクトが学習用に作成。生成では仕入・給与・受注の統制事例を用いる。',
  },
  {
    number: 63,
    page: 27,
    key: 'イ',
    area: 'strategy',
    sourceId: 'source-meti-2004-system-management',
    name: 'システム管理基準（平成16年10月8日策定）',
    file: 'system_kanri.pdf',
    sha256: '43a944ea78e26081bffa5d381b648db2e70574897d66c3f4f1d948d1302ae9f7',
    locators: [
      { page: 2, section: 'Ⅰ 情報戦略 1.1(3)(4)・1.3(1) 全体最適化計画' },
      { page: 3, section: 'Ⅱ 企画業務 1(2) 開発計画' },
      { page: 4, section: 'Ⅱ 企画業務 1(3) 開発計画・Ⅲ 開発業務 1(2)(3) 開発手順' },
      { page: 6, section: 'Ⅳ 運用業務 1(3) 運用手順' },
    ],
    scope: 'IPA問63の4肢に対応する平成16年版基準の開発計画・全体最適化計画・運用手順・開発手順の表現、及びその表現を学習用に用いる原画像・代替文・基準・生成問題。',
    facts: '開発計画を企画、全体最適化計画を情報戦略、運用手順を運用、開発手順を開発に対応付けた。IPAのウにある規模・期間・特性の列挙がⅣ 1(3)に特に近い。',
    note: '該当節の第三者の文・図表や個別利用制限は特定されない。既存のSAAJ同版とはバイト列が異なり、全12頁の抽出本文は一致する。採用出典はMETIの当時の配信。',
    change: '原問題はIPA冊子から対象問を切り出した。基準・生成問題と解説は本プロジェクトが学習用に作成。生成では個別の企画・運用・開発の段階と事例を用いる。',
  },
] as const;

const policySources: Source[] = [
  {
    schemaVersion: '3.0.0',
    id: metiTerms,
    title: '経済産業省ウェブサイト利用規約（平成28年1月29日制定）',
    publisher: meti,
    url: archivedMeti + 'main/rules.html',
    dateNote: '平成28年1月29日制定。両基準PDFと同じ2016年12月11日の保存で確認。',
    checkedOn,
    sha256: '3d4d6c4fde79fae15946eb6043ef919ab7bc602ec5eca8518b3ed608d4f7937b',
    type: 'policy',
    availability: 'officially_published',
    scope: '出典・加工表示、別条件の素材と第三者権利の扱い、政府標準利用規約2.0とCC BY 4.0の選択を確認する。',
    sections: ['コンテンツの利用冒頭', '1）出典と編集・加工の表示', '2）第三者の権利', '3）個別法令', '4）適用除外', '7）イ・ウ CC BY 4.0でも利用可能'],
    facts: ['コンテンツの複製・公衆送信・翻案を認める。7）ウは対象コンテンツをCC BY 4.0で利用できると定める。'],
    supports: ['ingestion', 'attribution'],
    limits: '第三者の表現や別途の例外を自動的に許諾する規約ではない。',
  },
  {
    schemaVersion: '3.0.0',
    id: metiAppendix,
    title: '経済産業省ウェブサイト利用規約 別紙（平成28年12月6日更新）',
    publisher: meti,
    url: archivedMeti + 'main/rules_02.html',
    dateNote: '平成28年12月6日更新。同年12月11日の保存で確認。',
    checkedOn,
    sha256: 'b9084838904401a1cdb09c9d4a65dced18bf7436c17f33b1682360cfd249bea5',
    type: 'policy',
    availability: 'officially_published',
    scope: '第三者表示等の例と、経済産業省ウェブサイト利用規約の適用除外を列挙する別紙。',
    sections: ['3）別のルールを適用するコンテンツ'],
    facts: ['平成16年版のシステム監査基準とシステム管理基準の対象文は列挙されていない。'],
    supports: ['ingestion', 'attribution'],
    limits: '利用する箇所の個別制限・第三者の権利は基準とIPA冊子の対象箇所からも照合する。',
  },
  {
    schemaVersion: '3.0.0',
    id: ccByTerms,
    title: 'Creative Commons 表示 4.0 国際 ライセンス条文',
    publisher: 'Creative Commons',
    url: 'https://creativecommons.org/licenses/by/4.0/legalcode.ja',
    dateNote: '規約に指定された4.0国際の日本語条文。元資料の2004年改版日とは区別する。',
    checkedOn,
    type: 'policy',
    availability: 'officially_published',
    scope: '当時のMETIウェブサイト利用規約で選択できるCC BY 4.0の許諾・帰属表示条件。',
    sections: ['第2条 適用範囲', '第3条 ライセンス条件'],
    facts: ['許諾者が権限を持つ素材の複製・共有・翻案を認める。公表時に出典、ライセンス、改変の有無を表示する。'],
    supports: ['ingestion', 'attribution'],
    limits: 'IPA作問部分と独自解説を含む問題全体へのライセンスではない。',
  },
];

function checkedMaterialRows(bundle: Bundle) {
  const examSource = bundle.sources.find(s => s.id === 'source-ipa-' + collection + '-qs');
  const answerSource = bundle.sources.find(s => s.id === 'source-ipa-' + collection + '-ans');
  assert.equal(examSource?.sha256, reviewed.source.questionSHA256, 'IPA paper source must match reviewed original');
  assert.equal(answerSource?.sha256, officialAnswers.sha256, 'IPA key source must match reviewed key');
  return materials.map(material => {
    const fact = reviewed.questions.find(row => row.number === material.number);
    const answer = officialAnswers.questions.find(row => row.number === material.number);
    assert(fact && answer, 'apply the reviewed question content patch before staging');
    assert.equal(fact.pdfPage, material.page);
    assert.equal(fact.officialKey, material.key);
    assert.equal(answer.key, material.key);
    assert.equal(answer.area, material.area);
    return { material, fact };
  });
}

function materialSources(): Source[] {
  return [
    ...materials.map(material => ({
      schemaVersion: '3.0.0',
      id: material.sourceId,
      title: material.name,
      publisher: meti,
      url: archivedMeti + 'policy/netsecurity/downloadfiles/' + material.file,
      dateNote: '平成16年10月8日の版を、WARPに保存された平成28年12月11日のMETI公式配信PDFで照合。',
      checkedOn,
      type: 'policy',
      availability: 'officially_published',
      sha256: material.sha256,
      scope: material.scope,
      sections: material.locators.map(location => 'p' + location.page + ' ' + location.section),
      facts: [material.facts],
      supports: ['ingestion', 'attribution', 'answer-validation'],
      limits: material.note,
    })),
    ...policySources,
  ];
}

/** For the one-booklet release pack writer. Uses existing common assets and writes no files. */
export async function prepareSpring2016AmSupplement(bundle: Bundle, cropDir: string) {
  const rows = checkedMaterialRows(bundle);
  const previousIpaRight = bundle.rights.find(right => right.id === ipaCommonRight);
  assert(previousIpaRight, 'published IPA booklet right is required for the common notation');
  const commonAssets = [2, 3].map(page => {
    const asset = bundle.assets.find(item => item.id === 'asset-ipa-' + collection + '-common-' + page);
    assert(asset, 'published common asset is required');
    assert.deepEqual(asset.attribution.rightsRefs, [ipaCommonRight]);
    return asset;
  });

  const facts: Stage3MorningFact[] = [];
  const sources = materialSources();
  const rights: Rights[] = [];
  const assetFiles = new Map<string, string>();
  for (const { material, fact } of rows) {
    const cropPath = path.join(cropDir, 'q' + material.number + '.png');
    const crop = await readFile(cropPath);
    assert.equal(crop.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(createHash('sha256').update(crop).digest('hex'), fact.crop.sha256);
    assert.equal(crop.length, fact.crop.byteLength);
    assert.equal(crop.readUInt32BE(16), fact.crop.width);
    assert.equal(crop.readUInt32BE(20), fact.crop.height);
    facts.push({
      source: collection + '-' + material.number,
      number: material.number,
      page: material.page,
      officialKey: material.key,
      area: material.area,
      choiceShuffleAllowed: false,
      alt: fact.fullAlt,
      crop: {
        path: cropPath,
        sha256: fact.crop.sha256,
        width: fact.crop.width,
        height: fact.crop.height,
        byteLength: fact.crop.byteLength,
        cropBox: fact.crop.cropBox,
      },
    });

    const sourceRefs: SourceRef[] = material.locators.map(locator => ({ sourceId: material.sourceId, locator: { ...locator } }));
    const ownIpaRight = 'rights-ipa-' + collection + '-' + material.number;
    const specificMetiRight = 'rights-meti-2004-' + collection + '-' + material.number;
    rights.push(
      {
        ...structuredClone(previousIpaRight),
        id: ownIpaRight,
        checkedOn,
        evidence: [...previousIpaRight.evidence, spring2016SourceRef(material.number, material.page), spring2016SourceRef(material.number, 1, true)],
        scope: `平成28年度春期旧午前・問${material.number}のIPA作問部分、組版、公式正答、及び学習用の改変。共通表記p2–3には従来の問題集の権利情報が適用される。`,
        attributionText: `出典：平成28年度 春期 基本情報技術者試験 午前 問${material.number}。©2016 独立行政法人情報処理推進機構（IPA）。`,
        thirdParty: {
          status: 'present_cleared',
          notes: '当該問のMETI旧基準に由来する表現の範囲と条件は、経済産業省の個別権利記録に掲示する。',
          rightsRefs: [specificMetiRight],
        },
      },
      {
        schemaVersion: '3.0.0',
        id: specificMetiRight,
        holders: [meti],
        basis: 'official_policy',
        checkedOn,
        evidence: [
          ...sourceRefs,
          { sourceId: metiTerms, locator: { section: '1）出典・加工表示、2）・4）第三者・適用除外、7）ウ CC BY 4.0での利用選択' } },
          { sourceId: metiAppendix, locator: { section: '3）別のルールを適用するコンテンツ' } },
          { sourceId: ccByTerms, locator: { section: '第2条・第3条 利用許諾と表示条件' } },
        ],
        scope: material.scope,
        uses: { repositoryRedistribution: 'allowed', browserDisplay: 'allowed', adaptation: 'allowed' },
        attributionText: `${meti}「${material.name}」の該当表現を利用。資料の出典を併記し、学習用の切り出し・改変はOpenCBT-FE-KihonJohoが実施。`,
        modificationNoticeRequired: true,
        licenseId: 'CC-BY-4.0',
        thirdParty: { status: 'none_identified', notes: material.note, rightsRefs: [] },
        assessmentNotes: '旧PDFと同時期の配信元規約7）ウに従いCC BY 4.0を選択。WARPは根拠となる当時のMETI配信を保存している。資料・ライセンス・切り出しや改変の表示を維持する。原画像以外に基準PDFの転載はない。',
      },
    );
  }

  const definitions = stage3AllMorningDefinitions.filter(definition => facts.some(fact => fact.source === definition.source));
  const prepared = await makeStage3MorningRecords({
    collectionId: collection, checkedOn, facts, definitions, commonAssets, reviewedCommonPages: [2, 3], sources, rights,
  });

  for (const { material } of rows) {
    const source = collection + '-' + material.number;
    const original = prepared.questions.find(item => item.id === 'question-ipa-' + source);
    const base = prepared.questions.find(item => item.id === 'question-template-source-' + source);
    const template = prepared.templates.find(item => item.id === 'template-source-' + source);
    const image = prepared.assets.find(item => item.id === 'asset-ipa-' + source);
    const fact = facts.find(item => item.source === source);
    assert(original && base && template && image && fact);
    const ipaRight = 'rights-ipa-' + source;
    const metiRight = 'rights-meti-2004-' + source;
    const metiRefs: SourceRef[] = material.locators.map(locator => ({ sourceId: material.sourceId, locator: { ...locator } }));
    const official: Attribution = {
      origin: 'official',
      sourceRefs: [spring2016SourceRef(material.number, material.page), ...metiRefs],
      rightsRefs: [ipaRight, metiRight],
      creatorIds: ['ipa'],
    };
    const adapted: Attribution = {
      ...structuredClone(official), origin: 'adapted', rightsRefs: [...official.rightsRefs, 'rights-original'], creatorIds: ['codex'],
    };
    image.attribution = structuredClone(official);
    original.prompt.attribution = official;
    for (const choice of original.choices) {
      choice.content.attribution.rightsRefs = [ipaRight];
    }
    original.correctAnswer.attribution.rightsRefs = [ipaRight];
    base.prompt.attribution = adapted;
    for (const choice of base.choices) choice.content.attribution = structuredClone(adapted);
    for (const question of [original, base]) {
      question.origin.sourceRefs.push(...metiRefs);
      question.explanation.attribution.sourceRefs = structuredClone(metiRefs);
      question.review.notes = `IPA原紙と公式正答、METI平成16年版の該当範囲と全肢を照合。IPAの出典と旧基準の利用条件を併記する。${material.change}`;
      question.distribution = 'included';
    }
    const wording = base.origin.changes.find(change => change.kind === 'wording');
    assert(wording);
    wording.details += ' ' + material.change;
    template.attribution = structuredClone(adapted);
    template.distribution = 'included';
    template.originalContentSha256 = await contentHash(base);
    assetFiles.set(image.path, fact.crop.path);
  }

  const additions = {
    questions: prepared.questions,
    templates: prepared.templates,
    assets: prepared.assets.filter(asset => !commonAssets.some(common => common.id === asset.id)),
    sources: prepared.sources,
    rights: prepared.rights,
    exams: [],
    sets: [],
  };
  for (const kind of ['questions', 'templates', 'assets', 'sources', 'rights'] as const) {
    const existing = new Set(bundle[kind].map(item => item.id));
    const ids = new Set<string>();
    for (const item of additions[kind]) {
      assert(!existing.has(item.id) && !ids.has(item.id), 'record collision: ' + item.id);
      ids.add(item.id);
      schema({ questions: 'question', templates: 'template', assets: 'asset', sources: 'source', rights: 'rights' }[kind], item);
    }
  }
  return { additions, assetFiles };
}
