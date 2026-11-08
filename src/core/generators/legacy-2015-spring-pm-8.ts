import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, table } from './definition';
import { spring2015PmPageAssetId, spring2015PmReference } from './legacy-2015-spring-pm-materials';
import { spring2015Pm0508Banks as banks, spring2015Pm0508Source as source } from './legacy-2015-spring-pm-05-08-source';
import {
  spring2015Pm0508Body as body, spring2015Pm0508Choices as choices, spring2015Pm0508Figure as figure,
  spring2015Pm0508Index as index, spring2015Pm0508Prompt as prompt,
} from './legacy-2015-spring-pm-05-08-shared';

const commonPages = [4, 5] as const;
const reference = spring2015PmReference('共通に使用される擬似言語の記述形式', commonPages);

type SelectInput = { readonly x: readonly number[]; readonly k: number };
const sourceTrace = source['q8-trace'], sourceCount = source['q8-count'], sourceMutation = source['q8-mutation'];
const settings = [
  { trace: sourceTrace, count: sourceCount, errors: sourceMutation.examples },
  { trace: { x: [1, 2, 3, 4, 7, 5, 6], k: 5 }, count: { x: [4, 1, 2, 2, 1, 3, 3], k: 3 },
    errors: [{ x: [2, 2, 2, 1, 1, 2], k: 3 }, { x: [2, 1, 2, 3, 1, 2], k: 3 }] },
  { trace: { x: [1, 3, 4, 5, 6, 2, 7], k: 5 }, count: { x: [1, 2, 4, 2, 3, 4, 3], k: 4 },
    errors: [{ x: [2, 1, 2, 4, 3, 2], k: 3 }, { x: [2, 4, 4, 1, 4, 4], k: 3 }] },
] as const;
type Round = { pivot: number; top: number; last: number; i: number; j: number; array: number[]; swaps: number };
type Result = { alpha: number; gamma: number; rounds: Round[] } &
  ({ status: 'returned'; value: number } | { status: 'outside'; subscript: number } | { status: 'cycle'; top: number; last: number });

export function spring2015Pm8Select(input: SelectInput, faulty = false): Result {
  const { k } = input, x = [...input.x], n = x.length;
  if (!Number.isSafeInteger(k) || k < 1 || k > n || !x.every(Number.isSafeInteger)) throw new Error('PARAMETER_CONSTRAINT');
  let top = 1, last = n, alpha = 0, gamma = 0;
  const seen = new Set<string>(), rounds: Round[] = [];
  const result = () => ({ alpha, gamma, rounds });
  while (top < last) {
    const state = [top, last, ...x].join(',');
    if (seen.has(state)) return { status: 'cycle', top, last, ...result() };
    seen.add(state);
    const pivot = x[k - 1];
    let i = top, j = last, swaps = 0;
    alpha++;
    while (true) {
      while (i <= n && (faulty ? x[i - 1] <= pivot : x[i - 1] < pivot)) i++;
      if (i > n) return { status: 'outside', subscript: i, ...result() };
      while (j >= 1 && pivot < x[j - 1]) j--;
      if (j < 1) return { status: 'outside', subscript: j, ...result() };
      if (i >= j) break;
      [x[i - 1], x[j - 1]] = [x[j - 1], x[i - 1]];
      i++;
      j--;
      swaps++;
      gamma++;
    }
    if (i <= k) top = j + 1;
    if (k <= j) last = i - 1;
    rounds.push({ pivot, top, last, i, j, array: [...x], swaps });
  }
  return { status: 'returned', value: x[k - 1], ...result() };
}

export function spring2015Pm8Model(values: number[]) {
  const s = settings[index(values, settings.length)];
  const trace = spring2015Pm8Select(s.trace), count = spring2015Pm8Select(s.count);
  const faults = s.errors.map(item => spring2015Pm8Select(item, true));
  if (trace.status !== 'returned' || trace.rounds.length < 3 || count.status !== 'returned' ||
    faults.some(result => result.status === 'returned')) throw new Error('PARAMETER_CONSTRAINT');
  const rangeChoices = trace.rounds.slice(0, 2).map(round =>
    banks[8].ab.findIndex(([top, last]) => round.top === top && round.last === last));
  if (rangeChoices.some(value => value < 0) || [count.alpha, count.gamma].some(value => value < 1 || value > banks[8].cd.length))
    throw new Error('PARAMETER_CONSTRAINT');
  return { ...s, trace, count, faults, rangeChoices, inputTrace: s.trace, inputCount: s.count };
}

const program = source['q8-program'], signature = source['q8-signature'];
const codeAlt = program.lines.map(([line, depth, kind, statement, comment]) =>
  line + ' ' + '　'.repeat(depth) + (kind === 'if' ? '▲' : kind === 'ifEnd' ? '▼' :
    kind === 'while' || kind === 'loopEnd' ? '■' : kind === 'statement' ? '・' : '') +
    statement + (comment ? ' /* ' + comment + ' */' : '')).join('\n') +
  '\nαは行6〜8，βは行10，γは行19〜23を右から矢印で示す。';

function build(values: number[]) {
  const m = spring2015Pm8Model(values);
  const [first, second] = m.trace.rounds, rank = m.inputTrace.k;
  const arrayText = (xs: readonly number[]) => xs.join('，');
  const blocks = prompt(8, values, id => {
    if (id === 'q8-signature') return table(signature.caption, [...signature.columns], signature.rows.map(row => [...row]));
    if (id === 'q8-program') return figure(8, 'program', values, '〔プログラム〕', codeAlt);
    throw new Error('SOURCE_FORMAT');
  }, text => {
    if (text.startsWith('関数Selectの引数で与えられた配列xの要素番号')) {
      return text.replace(arrayText(sourceTrace.x), arrayText(m.inputTrace.x)).replace('kが3', 'kが' + rank);
    }
    if (text.startsWith('引数で与えられた配列xの要素番号')) {
      return text.replace(arrayText(sourceCount.x), arrayText(m.inputCount.x)).replace('kが3', 'kが' + m.inputCount.k);
    }
    if (text.startsWith('プログラム中のβの行')) {
      return text.replace(arrayText(sourceMutation.examples[0].x) + 'であり，nが6，kが3',
        arrayText(m.errors[0].x) + 'であり，nが' + m.errors[0].x.length + '，kが' + m.errors[0].k)
        .replace(arrayText(sourceMutation.examples[1].x) + 'であり，nが6，kが3',
          arrayText(m.errors[1].x) + 'であり，nが' + m.errors[1].x.length + '，kが' + m.errors[1].k);
    }
    if (text === arrayText(sourceTrace.example[0].arrayAfterPartition)) return arrayText(first.array);
    if (text === arrayText(sourceTrace.example[1].arrayAfterPartition)) return arrayText(second.array);
    return text.replace('配列xの3番目の要素x[3]の値6', '配列xの' + rank + '番目の要素x[' + rank + ']の値' + first.pivot)
      .replace('基準値Pivotにx[3]の値1', '基準値Pivotにx[' + rank + ']の値' + second.pivot)
      .replace(/([16])以下の数値のグループと\1以上/g, (_, originalPivot: string) => {
        const pivot = originalPivot === '6' ? first.pivot : second.pivot;
        return pivot + '以下の数値のグループと' + pivot + '以上';
      });
  });
  const eOrF = (result: Result) => result.status === 'outside' ? 4 : 3;
  const faultExplanation = (result: Result, letter: string) => {
    if (result.status === 'outside') return letter + 'では添字が' + result.subscript + 'に進み，配列全体の外を参照する。';
    if (result.status === 'cycle') return letter + 'ではTop=' + result.top + '，Last=' + result.last +
      'および配列の内容が再び同じ状態となり，選択処理が終わらない。';
    throw new Error('PARAMETER_CONSTRAINT');
  };
  const result = body(blocks, [
    { id: 'ab', choices: choices(banks[8].ab.map(([top, last]) => 'Topに値' + top + '，Lastに値' + last)) },
    { id: 'cd', choices: choices(banks[8].cd) },
    { id: 'ef', choices: choices(banks[8].ef) },
  ], [
    ...m.rangeChoices.map((correct, i) => ({ id: 'ab'[i], bank: 'ab', correct })),
    { id: 'c', bank: 'cd', correct: m.count.alpha - 1 }, { id: 'd', bank: 'cd', correct: m.count.gamma - 1 },
    ...m.faults.map((fault, i) => ({ id: 'ef'[i], bank: 'ef', correct: eOrF(fault) })),
  ],
  '分割ごとにx[k]を基準値とし，iとjが交差するまで左右から走査する。交換後はiを1増やしjを1減らす。' +
  '第1回の分割後はi=' + first.i + '，j=' + first.j + 'で，Top=' + first.top + '，Last=' + first.last +
  '（a）。第2回の分割後はi=' + second.i + '，j=' + second.j + 'で，Top=' + second.top + '，Last=' + second.last +
  '（b）。i≦kとk≦jの更新は二つの独立した条件である。設問2では外側の繰返しを' + m.count.alpha +
  '回実行し，それぞれの交換回数は' + m.count.rounds.map(round => round.swaps).join('，') + '回，合計' + m.count.gamma +
  '回である。設問3で等しい要素まで読み飛ばすと停止の性質が変わる。' + faultExplanation(m.faults[0], 'e') +
  faultExplanation(m.faults[1], 'f') + '走査範囲から外れても，配列の添字1〜nに入る参照は配列外ではない。');
  result.contexts = [reference];
  return result;
}

export const legacy2015SpringPm8Definition: AfternoonBookletDefinition = {
  source: '2015h27h-fe-pm-8', title: 'クイックソートを応用した選択アルゴリズム',
  version: '3.7.0', reference: [0], fields: [field('選択処理を追跡する配列と順位', 0, settings.length - 1)],
  sourceAnswer: 'ア／ウ／イ／エ／オ／エ',
  notes: '物理37–41／冊子36–40。必須、a/b共有6択・c/d共有6択・e/f共有5択。擬似言語の全32行、行6〜8α・行10β・行19〜23γ、1始まりと実長、基準値の更新、独立した2条件、厳密比較と誤った≦を保持。3条件の実配列・順位で経路、回数、誤変更時の配列外参照と状態循環を別々に検算する。',
  publicNotes: '疑似言語と問いの形式を保ち，追跡する配列・順位と比較を誤った場合の例を変更しました。',
  fixedReferenceAssetIds: commonPages.map(spring2015PmPageAssetId),
  build,
};
