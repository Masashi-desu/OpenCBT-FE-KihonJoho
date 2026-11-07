import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, table } from './definition';
import { autumn2015Pm0508Banks as banks, autumn2015Pm0508Source as source } from './legacy-2015-autumn-pm-05-08-source';
import {
  autumn2015Pm0508Body as body, autumn2015Pm0508Choices as choices, autumn2015Pm0508Figure as figure,
  autumn2015Pm0508Index as index, autumn2015Pm0508Prompt as prompt, autumn2015PmNumber as format,
} from './legacy-2015-autumn-pm-05-08-shared';

const plans = [
  { initial: 100, remaining: [80, 120, 40, 140, 100] },
  { initial: 100, remaining: [60, 120, 40, 140, 80] },
  { initial: 100, remaining: [100, 120, 40, 140, 100] },
  { initial: 100, remaining: [60, 80, 40, 160, 80] },
  { initial: 105, remaining: [80, 120, 60, 140, 120] },
] as const;
const members = ['A', 'B', 'C', 'D', 'E'];
const overLabels = ['BD', 'BDE', 'ABDE', 'D'];
const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
const progress = (worked: number, hours: number) => {
  const numerator = worked * 100;
  return { value: Math.round(numerator / hours), approximate: numerator % hours !== 0 };
};
export function autumn2015Pm6Model(values: number[]) {
  const profile = index(values, plans.length), plan = plans[profile];
  const worked = 8 * 40, initialHours = 20 * plan.initial, remaining = sum(plan.remaining);
  const design = worked * members.length + remaining;
  const size = design / 20, programming = size * 10, testing = size * 10;
  const over = members.filter((_, i) => (worked + plan.remaining[i]) * members.length > initialHours).join('');
  const hours = plan.remaining.map(rest => Array.from({ length: 4 }, (_, i) => Math.max(0, Math.min(40, rest - i * 40)) || null));
  const rows = members.map((member, i) => ({
    member, progressPercent: progress(worked, worked + plan.remaining[i]), hoursByWeek: hours[i],
  }));
  rows.push({ member: '全体', progressPercent: progress(worked * members.length, design),
    hoursByWeek: Array.from({ length: 4 }, (_, i) => sum(hours.map(row => row[i] ?? 0))) });
  const choiceA = profile === 0 ? banks[6].a : [initialHours / 2, initialHours - 500, initialHours, initialHours + 500];
  const choiceB = [-2, 0, 2, 4].map(delta => size + delta);
  const choiceC = [-2, 0, 2, 5].map(delta => 40 * (size + delta));
  return { ...plan, initialHours, worked, design, size, programming, testing, remaining, over, rows,
    finish: (remaining + programming) / members.length, choiceA, choiceB, choiceC };
}

const scheduleAlt = (m: ReturnType<typeof autumn2015Pm6Model>) =>
  '列はメンバ名、進捗率（%）、9週から12週の予測時間（時）。' + m.rows.map(row =>
    row.member + '：' + (row.progressPercent.approximate ? '約' : '') + row.progressPercent.value + '%、' +
    row.hoursByWeek.map(hours => hours === null ? '空白' : hours).join('、')).join('。') + '。';

function build(values: number[]) {
  const m = autumn2015Pm6Model(values);
  return body(prompt(6, values, id => {
    switch (id) {
      case 'q6-t1': return table(source[id].caption, [...source[id].columns], source[id].rows.map(row => row.map(String)));
      case 'q6-t2': return figure(6, 'schedule', values, source[id].caption, scheduleAlt(m));
      default: throw new Error('SOURCE_FORMAT');
    }
  }, text => text.replace('100kステップであった', m.initial + 'kステップであった')), [
    { id: 'a', choices: choices(m.choiceA.map(format)) }, { id: 'b', choices: choices(m.choiceB) },
    { id: 'c', choices: choices(m.choiceC.map(format)) }, { id: 'd', choices: choices(banks[6].d) },
    { id: 's3', choices: choices(banks[6].s3) },
  ], [
    { id: 'a', bank: 'a', correct: 2 }, { id: 'b', bank: 'b', correct: 1 }, { id: 'c', bank: 'c', correct: 1 },
    { id: 'd', bank: 'd', correct: overLabels.indexOf(m.over) }, { id: 's3', label: '設問3', bank: 's3', correct: 0 },
  ],
  '当初の設計工数は' + m.initial + '÷0.05＝' + format(m.initialHours) + '人時であり，1人当たり' +
  format(m.initialHours / 5) + '人時。第8週末までの8×40×5＝1,600人時に，表2の残り' + format(m.remaining) +
  '人時を足すと設計は' + format(m.design) + '人時。再見積りの規模は' + format(m.design) + '×0.05＝' + m.size +
  'kステップである。表示用に丸めた進捗率から逆算しない。プログラミングとテストはそれぞれ' +
  format(m.programming) + '人時なので，3工程の合計は' + format(m.design + m.programming + m.testing) + '人時。' +
  '各人の設計は消費済み320人時と残り時間の合計を当初の1人分と比較し，超えるのは' + [...m.over].join('，') +
  '。等しい場合は含めない。設計変更がなければ，どちらの案も5人で残設計' + format(m.remaining) +
  '人時とプログラミング' + format(m.programming) + '人時を担い，終了をそろえるため，第8週末から各人' +
  m.finish + '作業時間の同じ時点で終了する。第1案が早いという評価が誤り。第1案では設計変更が既に開始したプログラミングに影響し，手戻りで工数が増える可能性がある。第2案は設計完了後にプログラミングを始めるので，この手戻りは生じない。');
}

export const legacy2015AutumnPm6Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-6', title: 'プロジェクトの見積り',
  version: '3.7.0', reference: [0], fields: [field('当初見積と残り設計工数の組', 0, plans.length - 1)],
  sourceAnswer: 'ウ／イ／イ／イ／ア',
  notes: '物理p26–28、5欄、4/4/4/4/3択。5人、8時間×5日、等生産性、第8週末、設計変更でも規模不変、設問3は誤りを選ぶ。5条件で当初と残工数を変更し、計算値は整数人時/kステップ、進捗率は表示だけ概数。誤答は工程換算の取り違い、当初人時との過不足や表2残工数20〜100人時の読み違いに対応。独立に予定表と二案のタイムライン、境界と全択を確認する。',
  publicNotes: '当初見積とメンバの残り設計工数を変更し，週別の予測，計算結果，正答，解説を同じ値で更新しました。',
  build,
};
