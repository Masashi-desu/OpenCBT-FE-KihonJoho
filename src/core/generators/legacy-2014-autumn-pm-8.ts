import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, table } from './definition';
import {
  autumn2014Pm0508Banks as banks, autumn2014Pm0508PageAlt, q8GraphAlt, q8Matches, q8Program, q8SignatureTable,
  q8SourceDiagonals, type Point,
} from './legacy-2014-autumn-pm-05-08-source';
import { answerField, body, choiceBank, promptPages, q0508Figure, selectInput } from './legacy-2014-autumn-pm-05-08-shared';
import { autumn2014PmPageAssetId, autumn2014PmReference } from './legacy-2014-autumn-pm-materials';

const pairs = [['peace', 'people'], ['sells', 'lesser'], ['seems', 'assess']] as const;
export const q8CaseCount = pairs.length;
const common = [3, 4] as const;
const reference = autumn2014PmReference('共通に使用される擬似言語の記述形式', common);

export function q8ChoiceGraphs(values: number[]): Point[][] {
  const [from, to] = selectInput(values, pairs);
  if (values[0] === 0) return q8SourceDiagonals.map(diags => diags.map(([x, y]) => [x, y]));
  const matches = q8Matches(from, to);
  const earlier = matches.filter(([x]) => x > 0).map(([x, y]): Point => [x - 1, y]);
  const later = matches.filter(([x]) => x + 1 < from.length).map(([x, y]): Point => [x + 1, y]);
  const repeats = matches.filter(([x, y]) => from.indexOf(from[x]) !== from.lastIndexOf(from[x]) &&
    to.indexOf(to[y]) !== to.lastIndexOf(to[y]));
  const unique = (points: Point[]) => [...new Map(points.map(point => [point.join(','), point])).values()];
  return [later, earlier, matches, unique(repeats.flatMap(([x, y]): Point[] => y > 0 ? [[x, y - 1], [x, y]] : [[x, y]])),
    unique([...matches, ...earlier])];
}

function build(values: number[]) {
  const [from, to] = selectInput(values, pairs);
  const grid = Array.from({ length: from.length + 1 }, (_, x) => Array.from({ length: to.length + 1 }, (_, y) =>
    x === 0 ? y : y === 0 ? x : 0));
  let alpha = 0, beta = 0;
  for (let x = 1; x <= from.length; x++) {
    for (let y = 1; y <= to.length; y++) {
      const gap = Math.min(grid[x - 1][y], grid[x][y - 1]) + 1;
      if (from[x - 1] === to[y - 1]) {
        alpha++;
        grid[x][y] = Math.min(gap, grid[x - 1][y - 1]);
      } else {
        beta++;
        grid[x][y] = gap;
      }
    }
  }
  const distance = grid[from.length][to.length];
  const originalIllustration = autumn2014Pm0508PageAlt[41].split('\n\n').find(p => p.startsWith('図1　文字列'))!;
  const originalGraph = autumn2014Pm0508PageAlt[42].split('\n\n').find(p => p.startsWith('図2　Str1'))!;
  const prompt = promptPages(41, 46, id => {
    if (id === 'q8-signature') return table(q8SignatureTable.caption, q8SignatureTable.columns, q8SignatureTable.rows);
    if (id === 'q8-operations') return q0508Figure(id, [0], '図1　文字列の変換例', originalIllustration);
    if (id === 'q8-example') return q0508Figure(id, [0], '図2　エディットグラフと最短経路の例', originalGraph);
    if (id === 'q8-program') return q0508Figure(id, [0], '関数CalcEditDistanceのプログラム', q8Program);
    throw new Error('SOURCE_FORMAT');
  }, text => text.replaceAll('"peace"', '"' + from + '"').replaceAll('"people"', '"' + to + '"'));
  const graphs = q8ChoiceGraphs(values);
  const graphKey = (points: readonly Point[]) => points.map(point => point.join(',')).sort().join(';');
  const target = graphKey(q8Matches(from, to));
  const labels = 'アイウエオ';
  const graphAnswers = graphs.flatMap((graph, i) => graphKey(graph) === target ? [i] : []);
  if (graphAnswers.length !== 1 || new Set(graphs.map(graphKey)).size !== graphs.length)
    throw new Error('PARAMETER_CONSTRAINT');
  const graphBank = { id: 'c', choices: graphs.map((graph, i) =>
    [q0508Figure('q8-choice-' + i, values, '解答群c ' + labels[i] + 'のエディットグラフ', q8GraphAlt(from.length, to.length, graph))]) };
  const result = body(prompt, [...['8a', '8b'].map(choiceBank), graphBank, ...['8d', '8e', '8f'].map(choiceBank)], [
    answerField('a', '8a', banks['8a'][0]), answerField('b', '8b', banks['8b'][2]), { id: 'c', bank: 'c', correct: graphAnswers[0] },
    answerField('d', '8d', alpha), answerField('e', '8e', beta), answerField('f', '8f', distance),
  ], 'D[X, Y]は長さXとYの接頭辞を扱う。添字は0からなので，行αはStr1[X − 1]とStr2[Y − 1]が等しいときだけ使い（a），' +
    '全体の距離はD[Str1Len, Str2Len]から返す（b）。エディットグラフの右上がりの辺は文字一致の箇所だけで，' +
    labels[graphAnswers[0]] + '（c）。一致は' + alpha + '組なので行αは' + alpha + '回（d），残りの行βは' + beta +
    '回（e）。挿入と削除が各1で置換を直接行わないので，右上の最小費用は' + distance + '（f）。');
  result.contexts = [reference];
  return result;
}

export const legacy2014AutumnPm8Definition: AfternoonBookletDefinition = {
  source: '2014h26a-fe-pm-8', title: '編集距離',
  version: '3.7.0', reference: [0], fields: [field('比較する5文字と6文字の文字列', 0, q8CaseCount - 1)],
  sourceAnswer: 'ア／ウ／ウ／ウ／カ／イ',
  notes: '物理・冊子p41–46。必須、長さ1以上・0始まり、追加/削除だけ、格子・対角辺と重み・境界、Minの仕様、原擬似言語・αβ、5図と6欄を保持。原と同じ5×6の文字列を三条件で可変化し，実行回数、最短距離と全図の辺を検算。',
  publicNotes: '編集距離を求める二つの文字列を変更し，その文字に対応するグラフを出題します。',
  fixedReferenceAssetIds: common.map(autumn2014PmPageAssetId),
  build,
};
