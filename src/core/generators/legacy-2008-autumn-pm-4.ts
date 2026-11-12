import { code, p, strings } from './definition';
import { answers, bank, bankBlocks, define, single } from './legacy-2008-autumn-pm-01-05-shared';
import { draw } from './legacy-2008-autumn-pm-01-05-figures';
import { graph, trace } from './legacy-2008-autumn-pm-4-model';
import { autumn2008PmPageAssetId, autumn2008PmReference } from './legacy-2008-autumn-pm-materials';

const referencePages = [2, 3] as const;
const expressions = ['Sd[i] + Dt[i][k]', 'Sd[i] + Dt[k][i]', 'Sd[k] + Dt[i][k]', 'Sd[k] + Dt[k][i]'];
const orders = [[2, 4, 3, 5], [2, 4, 5, 3], [4, 2, 3, 5], [4, 2, 5, 3]];
const orderOptions = orders.map(order => order.map(point => '地点' + point).join('，'));
const distances = [30, 40, 50, 60, 70, 80, 90, 100];

function shortest(index: number) {
  const edges = graph(index, false), steps = trace(edges), exercise = trace(graph(index, true));
  const d = (a: number, b: number) => edges.find(([from, to]) => from === a && to === b)![2];
  const bOptions = index === 3 ? [40, 50, 60, 70] : [30, 40, 50, 60];
  return { steps, exercise, d, bOptions };
}
const captions = ['グラフの例（地点数 N＝6）', '手順①の結果', '手順②の結果', '手順③の結果',
  '手順④の結果', '手順⑤の結果', '手順⑥の結果', 'グラフ'];

export function autumn2008Pm4Pages(index: number) {
  const { steps, d, bOptions } = shortest(index);
  const diagram = (i: number) => draw('shortestGraph', index * 8 + i, '図' + (i + 1) + '　' + captions[i]);
  const [step1, step2, , step4] = steps;
  const s1 = step1.distances, s2 = step2.distances, s4 = step4.distances;
  return [[
    p('問4　次のアルゴリズムの説明を読んで，設問1，2に答えよ。'),
    p('〔アルゴリズムの説明〕'),
    p('N個（N＞1）の地点から構成されるグラフにおいて，出発地点からそれ以外の地点までの最短距離を求めるアルゴリズム ShortestLength である。'),
    p('（1）図1に示す地点数N＝6のグラフを例として，ShortestLength を説明する。図1において，丸は地点を，矢印の向きは進行方向を，矢印に付けた数字は地点間の距離を表す。'),
    diagram(0),
    p('（2）ShortestLength では，次の配列を用いる。要素番号は1，2，…，Nで，地点と対応している。配列の添字は1から始まる。'),
    p('Dt[i][j]：地点iから地点jまでの距離が格納されているN×N個の要素からなる配列。地点iから地点jまでの直接の経路がない場合，進行方向が逆向きの場合及び Dt[i][i] の場合には∞（最大値を表す定数）が格納されている。図1の例では，Dt[i][j] の一部は次のとおりである。'),
    code('Dt[1][1]＝∞，Dt[1][2]＝' + d(1, 2) + '，\nDt[1][3]＝∞，Dt[2][1]＝∞'),
    p('Sd[i]：出発地である地点1から地点iまでの仮の最短距離（以下，仮最短距離という）を格納する配列。初期設定ではすべての要素に∞を格納する。'),
    p('Pe[i]：最短距離を求める過程で処理済となった地点を識別するための配列。初期設定ではすべて false に設定する。Pe[i] が true となったとき，Sd[i] には地点1から地点iまでの最短距離が求まっている。すべての要素が true になると処理は終了する。'),
    p('（3）最短距離を求める手順を，図1の例を使って示す。'),
    p('① 出発地は地点1なので，Pe[1] に true を設定し，地点1から直接つながる地点2，4，5までの距離 Dt[1][2]，Dt[1][4]，Dt[1][5] をそれぞれ Sd[2]，Sd[4]，Sd[5] に設定する。その結果，Sd[2]＝' +
      s1[2] + '，Sd[4]＝' + s1[4] + '，Sd[5]＝' + s1[5]),
  ], [
    p('となる。この結果を図2に示す。地点iの上又は下にある［ ］内の数値は，地点1から地点iまでの仮最短距離 Sd[i] を表し，網掛けの地点は処理済（Pe[i]＝true）を表す。'),
    diagram(1),
    p('② 未処理の地点のうち，地点1からの仮最短距離が最も短い地点2（2は Pe[k]＝false かつ Sd[k] が最小となる添字kの値）を選択し，Pe[2] を true にする。この時点で，Sd[2]＝' + s2[2] + ' が地点1から地点2の間の最短距離として確定する。'),
    p('次に，地点2から直接行ける地点3と地点5の仮最短距離 Sd[i] を更新する。ただし，Sd[i] の値が小さくならない場合は置き換えない。'),
    code('（更新前）　　（更新後）\nSd[3]＝∞ → Sd[3]＝Sd[2]＋Dt[2][3]＝' + s2[3] +
      '\nSd[5]＝' + s1[5] + ' → Sd[5]＝Sd[2]＋Dt[2][5]＝' + s2[5]),
    p('このとき，地点k（k＝2）を経由する地点i（i＝3，5）の仮最短距離 Sd[i] を更新するための代入文を擬似言語で書くと，次の〔プログラムの一部〕のとおりになる。ここで，関数 min は二つの引数のうち，小さい方の値を返すシステム関数である。'),
    p('〔プログラムの一部〕'), code('・Sd[i] ← min(Sd[i], ［a］)'),
    p('この結果を図3に示す。'), diagram(2),
  ], [
    p('③ 未処理の地点のうち，仮最短距離が最も短い地点は，地点4と地点5の二つである。このように複数ある場合は，要素番号の小さい地点4を選択し，処理済とする。この時点で，Sd[4] が地点1から地点4の間の最短距離として確定する。'),
    p('次に，地点4から直接行ける地点の仮最短距離を更新する。Sd[4]＋Dt[4][5]＝' + (s2[4] + d(4, 5)) +
      'となり，現在の Sd[5] の値より大きいので，更新しない。この結果を図4に示す。'), diagram(3),
    p('④ 未処理の地点のうち，仮最短距離が最も短い地点5を選択し，処理済とする。この時点で，Sd[5] が地点1から地点5の間の最短距離として確定する。'),
    p('次に，地点5から直接行ける地点の仮最短距離を更新する。'),
    code('Sd[3]＝' + s2[3] + ' → Sd[3]＝Sd[5]＋Dt[5][3]＝' + s4[3] + '\nSd[6]＝∞ → Sd[6]＝Sd[5]＋Dt[5][6]＝' + s4[6]),
    p('この結果を図5に示す。'), diagram(4),
    p('⑤ 未処理の地点のうち，仮最短距離が最も短い地点3を選択し，処理済とする。この時点で，Sd[3] が地点1から地点3の間の最短距離として確定する。次に，地点3から直接行ける地点6の仮最短距離を更新する。手順③と同様に計算し，地点6の仮最短距離 Sd[6] の値は［b］となる。この結果を図6に示す。'),
  ], [
    diagram(5),
    p('⑥ 未処理の地点のうち，仮最短距離が最も短い地点6を選択し，処理済とする。この時点で，Sd[6] が地点1から地点6の間の最短距離として確定する。すべての地点が処理済となったので終了となる。この結果を図7に示す。'),
    diagram(6),
    p('設問1　アルゴリズム ShortestLength の説明中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    ...bankBlocks('aに関する解答群', expressions.map(text => [code(text)])),
    ...bank('bに関する解答群', bOptions),
  ], [
    p('設問2　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('図8のグラフの場合，出発地を地点1としてアルゴリズム ShortestLength を実行したとき，最短距離が確定する順番は，次のとおりになる。'),
    p('地点1，［c］，地点6'),
    p('また，配列 Sd の要素 Sd[3]，Sd[5] 及び Sd[6] の値は，それぞれ［d］，［e］及び［f］となる。'),
    diagram(7),
    ...bank('cに関する解答群', orderOptions),
    ...bank('d〜fに関する解答群', distances),
  ]];
}

export const legacy2008AutumnPm4Definition = define(4, '有向グラフの最短距離 ShortestLength',
  '設問1 a=エ・b=ウ・設問2 c=エ・d=ウ・e=ア・f=エ',
  '例示と設問の有向グラフの距離', '二つの有向グラフの距離を変更し，例示の仮最短距離と処理順を対応させます。',
  'p.13〜17。方向付きの距離、配列添字、∞、未処理、同距離の小さい地点優先、表示空欄を保持。地点6の候補を更新する場合を含む。', index => {
    const { steps, exercise, bOptions } = shortest(index);
    const b = steps[5].distances[6], order = exercise.slice(1, -1).map(step => step.node), final = exercise[5].distances;
    const c = orders.findIndex(item => item.join(',') === order.join(','));
    return {
      prompt: autumn2008Pm4Pages(index).flat(),
      contexts: [autumn2008PmReference('共通に使用される擬似言語の記述形式', referencePages)],
      ...answers([expressions.map(text => [code(text)]), strings(bOptions.map(String)), strings(orderOptions), strings(distances.map(String))], [
        single('a', '設問1 a', 0, 3), single('b', '設問1 b', 1, bOptions.indexOf(b)),
        single('c', '設問2 c', 2, c), ...[3, 5, 6].map((node, i) => single('def'[i], '設問2 ' + 'def'[i], 3, distances.indexOf(final[node]))),
      ]),
      explanation: 'a：出発地点から地点kまでの確定した距離 Sd[k] に，kからiへの距離 Dt[k][i] を足す。既存の仮最短距離との小さい方を残す。' +
        'b：図1では，地点3を処理して地点6の仮最短距離を比較した結果，Sd[6] は' + b + 'になる。' +
        'c〜f：図8では，未処理の地点のうち最小の仮最短距離の地点を選ぶ。同値の場合は小さい地点番号を先に確定する。確定順は1→' +
        order.join('→') + '→6。地点3，5，6の距離は順に' + [final[3], final[5], final[6]].join('，') + 'である。',
    };
  }, { fixedReferenceAssetIds: referencePages.map(autumn2008PmPageAssetId) });
