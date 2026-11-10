export const procurementSteps = [
  '発注元はシステム化の目的や業務内容などを示し，調達先に情報提供を依頼する。',
  '発注元は調達対象システム，調達条件などを示し，提案書の提出を依頼する。',
  '発注元は提案書，能力などに基づいて，調達先を決定する。',
  '発注元と調達先の役割や責任分担などを，文書で相互に確認する。',
] as const;

export const procurementTargets = ['b', 'a', 'c', 'd'] as const;
export const productionTargets = ['a', 'b', 'c', 'd'] as const;
export const productionRows = [
  ['生産量', '少', '中', '多', '多'],
  ['主な生産形態', '受注生産', '受注・見込生産', '見込生産', '受注・見込生産'],
  ['生産品種', '多', '中', '少', '少'],
  ['段取り頻度', '多', '中', '少', '極少'],
  ['処理（例）', '組立て', '組立て', '組立て', '化学的'],
] as const;

export const linearCases = [
  { productA: [4, 9], productB: [8, 6], stocks: [40, 54], profits: [2, 3] },
  { productA: [5, 8], productB: [7, 4], stocks: [42, 56], profits: [3, 4] },
  { productA: [3, 7], productB: [9, 5], stocks: [45, 56], profits: [2, 5] },
  { productA: [6, 7], productB: [8, 5], stocks: [48, 60], profits: [4, 3] },
] as const;

export const accounts = [
  ['Ⅰ', '売上高'],
  ['Ⅱ', '売上原価'],
  ['Ⅲ', '販売費及び一般管理費'],
  ['Ⅳ', '営業外収益'],
  ['Ⅴ', '営業外費用'],
  ['Ⅵ', '特別利益'],
  ['Ⅶ', '特別損失'],
] as const;
export const subtotalAfter = [1, 2, 4, 6] as const;
export const incomeCases = [
  [1585, 951, 160, 80, 120, 5, 15],
  [1725, 1035, 185, 95, 125, 8, 20],
  [1640, 984, 190, 70, 115, 12, 25],
  [1835, 1101, 215, 90, 145, 10, 28],
] as const;

export const breakEvenCases = [
  { threshold: 100, fixed: [70, 30], side: 'above' },
  { threshold: 120, fixed: [72, 36], side: 'below' },
  { threshold: 150, fixed: [45, 90], side: 'above' },
  { threshold: 140, fixed: [56, 98], side: 'below' },
] as const;
