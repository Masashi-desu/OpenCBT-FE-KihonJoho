export const numberJa = (value: number) => value.toLocaleString('en-US');

type Transition = {
  company: string;
  existing: [number, number, number];
  rates: [[number, number, number, number], [number, number, number, number], [number, number, number, number]];
  incoming: [number, number, number, number];
  claimedAQ: number;
};
export const spring2013AmTransitions: Transition[] = [
  { company: 'T', existing: [10, 20, 80], rates: [[5, 3, 1, 1], [1, 6, 1, 1], [1, 1, 3, 3]], incoming: [5, 7, 13, 23], claimedAQ: 1 },
  { company: 'U', existing: [20, 30, 60], rates: [[4, 3, 2, 1], [1, 5, 2, 1], [1, 2, 3, 2]], incoming: [7, 8, 11, 12], claimedAQ: 6 },
  { company: 'V', existing: [30, 40, 50], rates: [[3, 4, 2, 1], [2, 4, 3, 1], [1, 2, 3, 3]], incoming: [6, 8, 10, 18], claimedAQ: 3 },
  { company: 'W', existing: [40, 30, 50], rates: [[4, 2, 2, 1], [1, 4, 3, 1], [1, 2, 3, 2]], incoming: [8, 9, 10, 14], claimedAQ: 4 },
];

export const oldProducts = ['A', 'B', 'C'] as const;
export const newProducts = ['P', 'Q', 'R', 'S'] as const;

export function transitionCustomers(data: Transition, from: number, to: number) {
  return data.existing[from] * data.rates[from][to] * 100;
}
export function existingByNewProduct(data: Transition, to: number) {
  return data.existing.reduce((total, _, from) => total + transitionCustomers(data, from, to), 0);
}

export type ProfitInput = { material: number; equipment: number; gainA: number; gainB: number; fourthModel: 'equipment-only' | 'incomplete' };
export const spring2013AmProfitInputs: ProfitInput[] = [
  { material: 16, equipment: 12, gainA: 5, gainB: 4, fourthModel: 'equipment-only' },
  { material: 14, equipment: 13, gainA: 6, gainB: 5, fourthModel: 'equipment-only' },
  { material: 20, equipment: 14, gainA: 6, gainB: 5, fourthModel: 'incomplete' },
  { material: 12, equipment: 10, gainA: 6, gainB: 5, fourthModel: 'equipment-only' },
];

export function profitConstraintRows({ material, equipment }: ProfitInput) {
  return [
    ['原料（kg／製品）', '2', '4', '1日当たり合計' + material + ' kgまで使用可能'],
    ['設備（時間／製品）', '3', '2', '1日当たり延べ' + equipment + '時間まで使用可能'],
  ];
}

export const spring2013AmContractCases = [
  { buyer: 'S', seller: 'K', item: '備品', arrangement: 'ordinary', acceptAt: 1 },
  { buyer: 'M', seller: 'N', item: '保管棚', arrangement: 'firm-quote', acceptAt: 0 },
  { buyer: 'P', seller: 'Q', item: '消耗品', arrangement: 'delivery', acceptAt: 2 },
] as const;

export const contractSteps = [
  { label: '見積り依頼', buyerSends: true },
  { label: '見積書', buyerSends: false },
  { label: '注文書', buyerSends: true, stage: '①' },
  { label: '注文請書', buyerSends: false, stage: '②' },
  { label: '納品／納品書', buyerSends: false, stage: '③' },
  { label: '受領書', buyerSends: true, stage: '④' },
  { label: '請求書', buyerSends: false },
  { label: '支払', buyerSends: true },
] as const;
