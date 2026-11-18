import { figure, p, table } from './definition';
import { finite, original } from './legacy-2005-autumn-am-27-53-shared';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

const timelines = [
  [76, 56, 112, 56, 112, 56, 66],
  [108, 45, 88, 68, 100, 42, 60],
  [90, 65, 82, 44, 126, 39, 68],
  [95, 56, 101, 36, 101, 61, 64],
];

const labels = ['t₁','r₁','t₂','r₂','t₃','r₃','t₄'];

export const reliability35 = {
  profile: 'legacy-2005-autumn-am-35-operation',
  domain: [[0, 3]] as const,
  validate(values: number[]) { selectCase(values, 4); },
  alt(values: number[]) {
    selectCase(values, 4);
    return '左から，稼働 t₁ の後で故障し，修理 r₁ を行う。次に稼働 t₂ の後で故障し，修理 r₂ を行う。さらに稼働 t₃ の後で故障し，修理 r₃ を行う。修理完了後は稼働 t₄ となり，時間軸が続く。';
  },
  panel(values: number[]) {
    const widths = timelines[selectCase(values, 4)];
    let start = 44;
    return widths.map((width, i) => {
      const interval = { start, end: start + width, repair: i % 2 !== 0, label: labels[i] };
      start += width;
      return interval;
    });
  },
} satisfies BookletFigureDefinition & { panel: (values: number[]) => { start: number; end: number; repair: boolean; label: string }[] };

export const legacy2005AutumnAm2753Figures = [reliability35];

const average = {
  operation: { name: 'MTBF', terms: '(Σᵢ₌₁ⁿ tᵢ)／n', explanation: '総稼働時間を稼働区間の数nで割る' },
  repair: { name: 'MTTR', terms: '(Σᵢ₌₁ⁿ rᵢ)／n', explanation: '総修理時間を修理区間の数nで割る' },
  cycle: { name: '1サイクルの平均時間', terms: '(Σᵢ₌₁ⁿ (tᵢ＋rᵢ))／n', explanation: '各組の稼働時間と修理時間を足し，全組の合計を組数nで割る' },
};

type Measure = keyof typeof average;
type AnswerPair = readonly [Measure, Measure];
const pairs: readonly AnswerPair[] = [
  ['repair','operation'], ['operation','repair'], ['operation','cycle'], ['cycle','repair'],
];
const measures: readonly AnswerPair[] = [['operation','repair'], ['operation','cycle'], ['repair','operation'], ['cycle','repair']];

export const availabilityDefinitions = [finite(35, '平均を求める稼働・修理の時間区間', 'イ',
  '元の稼働・故障・修理の時間線、区間tᵢとrᵢ及びi＝1〜nを保持する。同じ二列の組合せ表を使い、平均の対象を稼働時間、修理時間、稼働から修理完了までの1サイクルで四条件に変える。単位の追加や丸めをしない。', index => {
    const pair = measures[index];
    const topics = pair.map(metric => average[metric].name);
    const [left, right] = pair;
    const correctIndex = pairs.findIndex(([a,b]) => a === left && b === right);
    const statement = index === 0 ? original(35).prompt
      : 'システムの稼働モデルが図のように表されるとき，' + topics.join(' と ') +
        ' を表した式はどれか。ここで，tᵢ はシステムの稼働時間，rᵢ はシステムの修理時間を表す（i＝1，2，…，n）。稼働の開始からその区間に続く修理の完了までを1サイクルとする。';
    return {
      prompt: [p(statement), figure(reliability35.profile, [index], 'システムの稼働モデル', reliability35.alt([index]))],
      choices: pairs.map(pair => [table('指標の式の組合せ', topics, [pair.map(metric => average[metric].terms)])]),
      correctIndex,
      explanation: 'MTBF（Mean Time Between Failures、平均故障間隔）は稼働区間を，MTTR（Mean Time To Repair、平均修理時間）は修理区間を対象とする。' +
        topics[0] + 'は' + average[left].explanation + '。' + topics[1] + 'は' + average[right].explanation + '。',
    };
  })];
