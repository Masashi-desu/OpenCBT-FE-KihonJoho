import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure, p, strings } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { finite, original } from './legacy-2004-spring-am-27-53-shared';

const separator = '¥';
const paths = ['A', 'B', 'A¥A', 'A¥B', 'B¥A', 'B¥B', 'A¥A¥A', 'A¥B¥A', 'A¥B¥B'];
const stepsByCase = [
  ['¥A¥B', '..', '..¥B', '.¥A'],
  ['¥A¥B¥A', '..', '..¥A', '..'],
  ['¥B¥B', '..', '..¥A', '.¥A'],
  ['¥A¥A¥A', '..', '..¥B', '.¥A'],
];

function bookletFigure<T extends { alt: string }>(number: number, suffix: string, caption: string, derive: (index: number) => T) {
  const profile = 'legacy-2004-spring-am-' + number + '-' + suffix;
  const domain = [[0, 3]] as const;
  const validate = (values: number[]) => { selectCase(values, 4); };
  const panel = (values: number[]) => derive(selectCase(values, 4));
  const alt = (values: number[]) => panel(values).alt;
  return {
    definition: { profile, domain, validate, alt } satisfies BookletFigureDefinition,
    panel, block: (index: number) => figure(profile, [index], caption, alt([index])),
  };
}

export const directoryFigure = bookletFigure(34, 'directory-tree', 'ディレクトリの階層', () => ({
  paths, alt: 'ルートの直下にA、Bがある。ルート直下のAにはAとBがあり、そのAにA、そのBにAとBがある。ルート直下のBにはAとBがある。',
}));

function walk(current: string[], movement: string) {
  const next = movement.startsWith(separator) ? [] : [...current];
  for (const part of movement.split(separator).filter(Boolean)) {
    if (part === '.') continue;
    if (part === '..') next.pop();
    else next.push(part);
    if (next.length > 0 && !paths.includes(next.join(separator))) throw Error('存在しないディレクトリ');
  }
  return next;
}
const q34 = finite(34, '絶対パスと相対パスによる移動の組', 'エ', '円記号の区切り、ルート・現在・親の意味、移動順および4択を維持し、4つの移動経路を変える。', index => {
  const movements = stepsByCase[index];
  const trace: string[] = [];
  let current: string[] = [];
  for (const movement of movements) {
    current = walk(current, movement);
    trace.push(separator + current.join(separator));
  }
  const statement = original(34).prompt.replace(stepsByCase[0].join(' → '), movements.join(' → '));
  const choices = original(34).choices;
  return { prompt: [p(statement), directoryFigure.block(index)], choices: strings(choices),
    correctIndex: choices.indexOf(trace.at(-1)!),
    explanation: '¥で始まる指定はルートからたどる。相対指定では、各移動の直後の場所を次の基準にする。「.」はその場所、「..」は親である。' +
      movements.map((movement, i) => movement + ' の後は ' + trace[i]).join('、') + '。したがって最終位置は ' + trace.at(-1) + ' となる。',
  };
});

const overlayCases = [
  { members: ['A', 'B', 'C', 'D', 'E'], choices: ['B→C', 'C→D', 'F→A', 'G→F'] },
  { members: ['A', 'C', 'E', 'B', 'D'], choices: ['B→C', 'E→D', 'F→E', 'G→F'] },
  { members: ['A', 'E', 'B', 'C', 'D'], choices: ['E→B', 'D→E', 'F→D', 'G→F'] },
  { members: ['A', 'D', 'C', 'B', 'E'], choices: ['D→C', 'C→E', 'F→C', 'G→A'] },
];

export const overlayFigure = bookletFigure(41, 'module-overlay', 'オーバレイ構造', index => {
  const { members, choices } = overlayCases[index];
  const [root, branch, sibling, leaf, other] = members;
  return { members, choices, alt: '主記憶の上から' + root + '、互いに重なる' + branch + 'と' + sibling + '、' + branch +
    'の下の' + leaf + 'と' + other + 'を示す。共通ルーチンF、Gは図の下側で同じアドレスから配置される。' };
});

function residentPaths(members: string[]) {
  const [root, branch, sibling, leaf, other] = members;
  const bases = [[root], [root, branch], [root, sibling], [root, branch, leaf], [root, branch, other]];
  return bases.flatMap(base => [base, [...base, 'F'], [...base, 'G']]);
}

const q41 = finite(41, 'オーバレイ階層と参照元・参照先の組', 'ウ', '同じ記憶位置を使うモジュールの排他と、常駐領域への参照から4候補を判定する。', index => {
  const { members, choices } = overlayCases[index], [root, branch, , leaf] = members;
  const states = residentPaths(members);
  const permitted = choices.map(choice => {
    const [from, to] = choice.split('→');
    return states.filter(state => state.includes(from)).every(state => state.includes(to));
  });
  const correctIndex = permitted.indexOf(true);
  const stem = index === 0 ? original(41).prompt :
    'モジュールA〜Eと共通ルーチンF、Gを図のオーバレイ構造にした。例えば' + leaf + 'の実行時は' +
    [root, branch, leaf].join('、') + 'が主記憶にある。FとGはどの枝からでも同じ領域に一つずつ読み込む。X→YはXの実行中のY内の領域へのアクセスを表す。参照先が常に同時にロードされるとき、参照が許されるのはどれか。';
  return { prompt: [p(stem), overlayFigure.block(index)], choices: strings(choices), correctIndex,
    explanation: '実行中の枝のモジュールとその上位は同時に主記憶にある。別の枝へ切り替えると下位の領域は上書きされる。FとGも同じ領域を使う。' +
      choices.map((choice, i) => {
        const [from, to] = choice.split('→');
        const witness = states.find(state => state.includes(from) && !state.includes(to));
        return permitted[i] ? choice + 'では' + from + 'がロードされる構成のすべてに' + to + 'も含まれる' :
          choice + 'では' + witness!.join('・') + 'がロードされたときに' + to + 'がない';
      }).join('。') + '。',
  };
});

const notationCases = [
  { kind: 'data', alt: '長方形の顧客から注文が受注へ流れ、顧客マスタからも受注に情報が入る。受注伝票は在庫確認へ向かい、商品マスタも在庫確認へ情報を渡す。在庫確認から出荷指示書が出荷指示へ、チェック済受注伝票が売上計上へ向かう。出荷指示から出荷済報告書が売上計上へ向かう。処理を円、二つのマスタを平行線、データの流れを矢印で示す。',
    reason: '外部の顧客を長方形、処理を円、マスタの保存先を平行線で示している。矢印の受注伝票などは処理間を移動するデータを表すので、DFDである。' },
  { kind: 'state', alt: '初期点から待機に入る。待機から計測中へ「開始」で移り、計測中から待機へ「終了」で戻る。計測中から一時停止へ「中断」で移り、一時停止から計測中へ「再開」で戻る。',
    reason: '囲まれた待機・計測中・一時停止は対象の状態である。矢印に付いた開始などのイベントによって状態が移るので、状態遷移図である。' },
  { kind: 'flow', alt: '開始から「数量を読む」に進み、ひし形「数量＞0？」で分岐する。はいの経路は「合計へ加算」を通って終了へ、いいえの経路はそのまま終了へ進む。',
    reason: '四角い処理とひし形の判定が矢印でつながり、条件によって実行順が分かれる。開始から終了までの処理手順を図示する流れ図である。' },
  { kind: 'petri', alt: '黒点を一つずつ持つ二つの円が、矢印で一本の縦棒へ入る。縦棒からもう一つの円へ矢印が出る。二つの入力円は部品A、部品B、出力円は完成を表す。',
    reason: '円はプレース、黒点はトークン、棒はトランジションである。入力プレースにトークンがそろうとトランジションが発火し、出力プレースへトークンを移すペトリネットの表記である。' },
] as const;
export const notationFigure = bookletFigure(50, 'diagram-notation', '業務又は処理を表す図', index => notationCases[index]);
const q50 = finite(50, '図で示すデータ・状態・処理・トークンの関係', 'ア',
  '図に表示する対象と記法を変え、図から表記法名を選ぶ原形式と選択肢の順序を維持する。', index => ({
    prompt: [p(original(50).prompt), notationFigure.block(index)], choices: strings(original(50).choices),
    correctIndex: ['data', 'state', 'flow', 'petri'].indexOf(notationCases[index].kind),
    explanation: notationCases[index].reason + ' データの移動、対象の状態変化、処理順序、トークンの移動のうち、矢印が何を表すかを区別する。',
  }));

export const figureDefinitions = [q34, q41, q50];
export const legacy2004SpringAm2753Figures: readonly BookletFigureDefinition[] = [directoryFigure, overlayFigure, notationFigure]
  .map(item => item.definition);
