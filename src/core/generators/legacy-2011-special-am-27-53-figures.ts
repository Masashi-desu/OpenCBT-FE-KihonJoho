import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const profiles2011SpecialAm2753 = {
  multiplicity: 'legacy-2011-special-am-29-multiplicity',
  before: 'legacy-2011-special-am-51-plan-before',
  after: 'legacy-2011-special-am-51-plan-after',
} as const;

const multiplicities = [
  ['1', '1..*'], ['0..1', '0..*'], ['1..*', '0..*'], ['1', '0..1'],
] as const;

function checkedAt<T>(cases: readonly T[], values: number[]) {
  const [index] = values;
  if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= cases.length)
    throw new DataError('FIGURE_PROFILE', '図の値が登録された入力域と一致しません');
  return cases[index];
}

export function multiplicityAt(values: number[]) {
  return checkedAt(multiplicities, values);
}

export function multiplicityAlt(values: number[]) {
  const [organization, employee] = multiplicityAt(values);
  return '「組織」と「社員」を実線で結ぶUML関連。組織側の多重度は' + organization + '、社員側の多重度は' + employee + '。';
}

type Edge = { from: number; to: number; name: string; days: number; dummy?: true };
const scheduleCases = [
  [9, 3, 4, 2],
  [10, 4, 4, 2],
  [11, 5, 3, 3],
  [12, 4, 5, 3],
] as const;
const commonEdges: readonly Edge[] = [
  { from: 0, to: 1, name: 'A', days: 5 }, { from: 1, to: 2, name: 'B', days: 8 },
  { from: 1, to: 4, name: 'C', days: 7 }, { from: 2, to: 3, name: 'D', days: 7 },
  { from: 4, to: 5, name: 'F', days: 5 }, { from: 3, to: 7, name: 'G', days: 7 },
  { from: 5, to: 6, name: 'H', days: 4 }, { from: 6, to: 7, name: 'I', days: 2 },
];

export function scheduleAt(values: number[], after: boolean): Edge[] {
  const [e, e1, e2, e3] = checkedAt(scheduleCases, values);
  if (!after) return [...commonEdges, { from: 2, to: 5, name: 'E', days: e }];
  return [...commonEdges,
    { from: 2, to: 8, name: 'E1', days: e1 },
    { from: 2, to: 9, name: 'E2', days: e2 },
    { from: 9, to: 8, name: 'ダミー作業', days: 0, dummy: true },
    { from: 8, to: 5, name: 'E3', days: e3 },
  ];
}

export function scheduleAlt(values: number[], after: boolean) {
  const durations = scheduleAt(values, after).filter(edge => !edge.dummy).map(({ name, days }) => name + 'は' + days + '日').join('、');
  const changed = after ? 'Bの終了からE1とE2が分岐。E2終了点からE1終了点へダミー作業を結ぶ。E1終了点からE3へ進み、E3とFがHの開始点で合流。' :
    'Bの終了からEへ進み、EとFがHの開始点で合流。';
  return 'Aの終了からBとCが分岐。Bの終了からDを経てGへ進む。Cの終了からFへ進む。' +
    changed + 'Hの後にIへ進み、GとIが全体の終了点で合流。所要日数は' + durations + '。';
}

export const legacy2011SpecialAm2753Figures: readonly BookletFigureDefinition[] = [
  { profile: profiles2011SpecialAm2753.multiplicity, domain: [[0, multiplicities.length - 1]],
    validate(values) { multiplicityAt(values); }, alt: multiplicityAlt },
  { profile: profiles2011SpecialAm2753.before, domain: [[0, scheduleCases.length - 1]],
    validate(values) { scheduleAt(values, false); }, alt: values => scheduleAlt(values, false) },
  { profile: profiles2011SpecialAm2753.after, domain: [[0, scheduleCases.length - 1]],
    validate(values) { scheduleAt(values, true); }, alt: values => scheduleAlt(values, true) },
];
