import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const legacy2015SpringAm2753Profiles = {
  ledger: 'legacy-2015-spring-am-28-accounting-model',
  pipeline: 'legacy-2015-spring-am-30-query-pipeline',
  encryption: 'legacy-2015-spring-am-40-encryption-flow',
  curve: 'legacy-2015-spring-am-49-cumulative-bugs',
  coverage: 'legacy-2015-spring-am-50-coverage-flow',
} as const;

export const ledgerAlt = '勘定の属性は勘定コードと科目名，会計取引の属性は取引番号，計上日，摘要。両者の関連は勘定側が2..*，会計取引側が*。関連クラスの移動は金額を持ち，借方と貸方が移動を継承する。制約は，一つの会計取引に関する借方金額の合計と貸方金額の合計が一致すること。';

export const pipelineModes = [
  { start: 'クエリ', steps: ['構文解析', '最適化', 'コード生成'], orders: [[2, 0, 1], [2, 1, 0], [0, 2, 1], [0, 1, 2]] },
  { start: '解析済みの内部表現', steps: ['最適化', 'コード生成', '実行コード検証'], orders: [[2, 0, 1], [1, 0, 2], [0, 1, 2], [0, 2, 1]] },
] as const;

export function pipelineAlt([input]: number[]) {
  return pipelineModes[input].start + 'から，箱①，箱②，箱③，実行の箱へ，この順で左から右に矢印がつながる。';
}

export const encryptionModes = [
  { sender: 'A', receiver: 'B', text: '来月転居する予定です。', ciphertext: 'nd359fxj47ac …' },
  { sender: 'B', receiver: 'A', text: '出張先が決まりました。', ciphertext: 'mk624pvx17bu …' },
] as const;

export function encryptionAlt([input]: number[]) {
  const { sender, receiver, text, ciphertext } = encryptionModes[input];
  return `左の${sender}さん側では平文「${text}」を鍵Kで暗号化して「${ciphertext}」を得る。暗号文は右へネットワークを経由して${receiver}さんへ届く。右側では下の暗号文から${receiver}さんの秘密鍵による復号を経て，上の平文「${text}」へ戻る。`;
}

export const curveModes = [
  { control1: 14, control2: 38, wording: '右へ進むほど傾きが大きくなる' },
  { control1: 62, control2: 96, wording: '右へ進むほど傾きが小さくなる' },
  { control1: 100 / 3, control2: 200 / 3, wording: '全体で傾きがほぼ一定' },
] as const;

export function curveAlt([input]: number[]) {
  return '横軸はテスト項目消化件数，縦軸はバグ累積件数。原点から' + curveModes[input].wording +
    '曲線が，縦破線Xと横破線のバグ累積件数の目標値が交わる点に達する。';
}

export const coverageModes = [
  { predicate: 'A＞0 かつ B＝1', action: 'X←X＋1' },
  { predicate: 'A≧5 又は B≠0', action: 'X←X＋1' },
] as const;

export function coverageAlt([input]: number[]) {
  const { predicate, action } = coverageModes[input];
  return `上からひし形の判定「${predicate}」に進む。真なら右へ分岐して「${action}」を実行し，左へ戻って合流する。偽なら下へ直接進む。合流後は下向き矢印で続く。`;
}

const definition = (profile: string, size: number, alt: BookletFigureDefinition['alt']): BookletFigureDefinition => ({
  profile, domain: [[0, size - 1]],
  validate(values) {
    if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= size)
      throw new Error('FIGURE_DOMAIN');
  },
  alt,
});

export const legacy2015SpringAm2753Figures = [
  definition(legacy2015SpringAm2753Profiles.ledger, 1, () => ledgerAlt),
  definition(legacy2015SpringAm2753Profiles.pipeline, pipelineModes.length, pipelineAlt),
  definition(legacy2015SpringAm2753Profiles.encryption, encryptionModes.length, encryptionAlt),
  definition(legacy2015SpringAm2753Profiles.curve, curveModes.length, curveAlt),
  definition(legacy2015SpringAm2753Profiles.coverage, coverageModes.length, coverageAlt),
];
