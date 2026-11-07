import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { code, field, p } from './definition';
import { spring2016PmPageAssetId, spring2016PmReference } from './legacy-2016-spring-pm-materials';
import { spring2016Pm0508Body as body, spring2016Pm0508Choices as choices, spring2016Pm0508Figure as figure,
  spring2016Pm0508Profile as profile } from './legacy-2016-spring-pm-05-08-shared';

const scenarios = [
  { added: ['Aoki', 'Imai', 'Uno', 'Endo'], remove: 0, replace: 2, replacement: 'Abe', from: 2, to: 0 },
  { added: ['Kato', 'Inoue', 'Ito', 'Sato'], remove: 0, replace: 2, replacement: 'Ota', from: 2, to: 0 },
  { added: ['Hara', 'Ueda', 'Mori', 'Ito'], remove: 1, replace: 1, replacement: 'Miura', from: 0, to: 2 },
  { added: ['Arai', 'Ono', 'Kuro', 'Endo'], remove: 2, replace: 0, replacement: 'Ei', from: 2, to: 1 },
  { added: ['A', 'Noda', 'Riku', 'Jin'], remove: 0, replace: 1, replacement: '', from: 1, to: 0 },
];
const ab = ['DataLen', 'DataLen ＋ 1', 'DataLen ＋ textLen', 'DataLen ＋ textLen ＋ 1', 'textLen', 'textLen ＋ 1'];
const c = ['MemoCnt － pos', 'pos － 1', 'pos', 'pos ＋ 1'];
const d = ['fromPos，i ≧ toPos － 1，－1', 'fromPos，i ≧ toPos ＋ 1，－1', 'toPos，i ≦ fromPos － 1，1', 'toPos，i ≦ fromPos ＋ 1，1'];
const originalBank = [0, 3, 4, 5, 7, 9, 10, 12, 13, 23];
export type Spring2016Pm8Snapshot = { pointers: number[]; records: string[]; dataLen: number };

export function spring2016Pm8Model(values: number[]) {
  const m = profile(values, scenarios);
  const pointers: number[] = [], records: string[] = [];
  let dataLen = 0;
  const snapshots: Spring2016Pm8Snapshot[] = [];
  const capture = () => snapshots.push({ pointers: [...pointers], records: [...records], dataLen });
  const append = (text: string) => {
    const location = dataLen;
    records.push(text);
    dataLen += text.length + 1;
    return location;
  };
  capture();
  for (const text of m.added) pointers.push(append(text));
  capture();
  pointers.splice(m.remove, 1);
  capture();
  pointers[m.replace] = append(m.replacement);
  capture();
  const [pointer] = pointers.splice(m.from, 1);
  pointers.splice(m.to, 0, pointer);
  capture();
  const data = spring2016Pm8Cells(snapshots[4]);
  const liveWidths = pointers.map(index => Number(data[index].value) + 1);
  const answers = [liveWidths[0], liveWidths[0] + liveWidths[1], liveWidths.reduce((total, width) => total + width, 0)];
  const liveWithoutLength = liveWidths.reduce((total, width) => total + width - 1, 0);
  const candidates = new Set([0, ...answers, dataLen, ...liveWidths.map(width => width - 1),
    liveWithoutLength, ...pointers, ...snapshots.slice(1, 4).map(snapshot => snapshot.dataLen),
    ...liveWidths, ...records.map(record => record.length)]);
  const bank = values[0] === 0 ? originalBank : [...candidates].slice(0, 10).sort((a, b) => a - b);
  if (bank.length !== 10 || dataLen > 25 || answers.some(answer => !bank.includes(answer)))
    throw new Error('PARAMETER_CONSTRAINT');
  return { ...m, snapshots, liveWidths, answers, bank };
}

export function spring2016Pm8Cells(snapshot: Spring2016Pm8Snapshot) {
  let pos = 0;
  return snapshot.records.flatMap(record => {
    const live = snapshot.pointers.includes(pos);
    pos += record.length + 1;
    return [{ value: String(record.length), header: true, live },
      ...[...record].map(value => ({ value, header: false, live }))];
  });
}

export const spring2016Pm8ScreenAlt = (added: readonly string[]) =>
  '簡易メモ帳の画面。表示順は' + added.join('、') + '。下部に追加，削除，変更，移動のボタン。';

export function spring2016Pm8SnapshotAlt(snapshot: Spring2016Pm8Snapshot) {
  const cells = spring2016Pm8Cells(snapshot);
  return 'MemoMax：5，DataMax：25。MemoCnt：' + snapshot.pointers.length + '，DataLen：' + snapshot.dataLen +
    '。Memo[]の要素0〜4：' + [...snapshot.pointers.map(String), ...Array<string>(5 - snapshot.pointers.length).fill('空き')].join('、') +
    '。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：' +
    [...cells.map(cell => cell.value + (cell.header ? '（下線付き文字列長）' : '') + (cell.live ? '' : '（斜線、参照なし）')),
      ...Array<string>(25 - cells.length).fill('空き')].join('、') + '。';
}

const program = [
  '○大域 整数型：MemoCnt，MemoMax，Memo[MemoMax]',
  '○大域 整数型：DataLen，DataMax',
  '○大域 8ビット論理型：Data[DataMax]',
  '',
  '○関数：resetMemo()',
  '　・MemoCnt ← 0',
  '　・DataLen ← 0',
  '',
  '○関数：addMemo(整数型：textLen，文字列型：text)',
  '　○整数型：i',
  '　・Memo[MemoCnt] ← ［a］',
  '　・MemoCnt ← MemoCnt ＋ 1',
  '　・Data[DataLen] ← textLen',
  '　・DataLen ← DataLen ＋ 1',
  '　■ i：0，i ＜ textLen，1',
  '　│ ・Data[DataLen ＋ i] ← text[i]',
  '　■',
  '　・DataLen ← ［b］',
  '',
  '○関数：deleteMemo(整数型：pos)',
  '　○整数型：i',
  '　・i ← ［c］',
  '　■ i ＜ MemoCnt',
  '　│ ・Memo[i － 1] ← Memo[i]',
  '　│ ・i ← i ＋ 1',
  '　■',
  '　・MemoCnt ← MemoCnt － 1',
  '',
  '○関数：changeMemo(整数型：pos，整数型：textLen，文字列型：text)',
  '　○整数型：i',
  '　・Memo[pos] ← DataLen',
  '　・Data[DataLen] ← textLen',
  '　・DataLen ← DataLen ＋ 1',
  '　■ i：0，i ＜ textLen，1',
  '　│ ・Data[DataLen ＋ i] ← text[i]',
  '　■',
  '　・DataLen ← ［b］',
  '',
  '○関数：moveMemo(整数型：fromPos，整数型：toPos)',
  '　○整数型：i，m',
  '　・m ← Memo[fromPos]',
  '　▲ fromPos ＜ toPos',
  '　│ ■ i：fromPos，i ≦ toPos － 1，1',
  '　│ │ ・Memo[i] ← Memo[i ＋ 1]',
  '　│ ■',
  '　▼',
  '　▲ fromPos ＞ toPos',
  '　│ ■ i：［d］',
  '　│ │ ・Memo[i] ← Memo[i － 1]',
  '　│ ■',
  '　▼',
  '　・Memo[toPos] ← m',
].join('\n');
const garbageProgram = [
  '○関数：clearGarbage()',
  '　○整数型：d，i，m',
  '　○8ビット論理型：temp[DataMax]',
  '　・DataLen ← 0',
  '　▲ MemoCnt ＝ 0',
  '　│ ・return',
  '　▼',
  '　■ m：0，m ＜ MemoCnt，1',
  '　│ ・d ← Memo[m]',
  '　│ ・Memo[m] ← DataLen',
  '　│ ■ i：0，i ≦ Data[d]，1',
  '　│ │ ・temp[DataLen] ← Data[d ＋ i]',
  '　│ │ ・DataLen ← DataLen ＋ 1',
  '　│ ■',
  '　■',
  '　■ d：0，d ＜ DataLen，1',
  '　│ ・Data[d] ← temp[d]',
  '　■',
].join('\n');

function spring2016Pm8Build(values: number[]) {
  const m = spring2016Pm8Model(values);
  const snapshot = (i: number, name: string) =>
    figure(8, 'memo-state-' + i, values, '図' + (i + 2) + ' 関数' + name + '実行後の配列・変数の状態', spring2016Pm8SnapshotAlt(m.snapshots[i]));
  const callArgs = (text: string) => text.length + '， “' + text + '”';
  const result = body([
    p('次の問8は必須問題です。必ず解答してください。'),
    p('問8 次のプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    p('携帯端末上で稼働する簡易メモ帳の機能のうち，メモの編集処理（メモの追加・削除・変更・移動）を行う部分のプログラムである。図1は，簡易メモ帳に4件のメモ' +
      m.added.map(text => '“' + text + '”').join('，') + 'を登録した場合の表示例である。'),
    figure(8, 'memo-screen', values, '図1 簡易メモ帳の表示例', spring2016Pm8ScreenAlt(m.added)),
    p('〔プログラムの説明〕'),
    p('(1) メモは，画面に表示可能な1バイトで表現できる文字から成る文字列である。各メモは，文字列の前に，文字列の長さ（0〜255）を1バイトの符号なし2進整数の形式で付け加えて格納する。例えば，メモ“Hello!”は，次の形式で格納する（以下，文字列の長さは10進数で表記し，その値に下線を付けて表す）。'),
    figure(8, 'memo-length-example', values, 'メモ“Hello!”の格納形式', '左から下線付きの6，H，e，l，l，o，!をそれぞれ1バイトに格納する。'),
    p('(2) メモの格納と管理のために，2個の配列Memo[]，Data[]と，4個の変数MemoCnt，MemoMax，DataLen，DataMaxを使用する。各メモは，配列Data[]の先頭から順に，1要素に1バイトずつ(1)で示した形式で格納し，その格納位置の情報を配列Memo[]に設定して管理する。'),
    p('MemoMaxは格納できるメモの最大件数（配列Memo[]の要素数），MemoCntは現在格納されているメモの件数である。DataMaxは格納できる最大文字数（配列Data[]の要素数），DataLenは現在格納されている文字数である（文字数には，文字列の長さの情報を含む）。'),
    p('(3) 簡易メモ帳の画面には，配列Memo[]の要素番号の昇順に，それが指すメモを取り出して，メモを表示する。図1の表示例は，図3（後出）の状態に対応している。'),
    p('(4) メモの編集処理を行うための関数の概要は，次の①〜⑤のとおりである。これらの関数が呼ばれるとき，引数の内容や配列の空き状態などは事前に検査済みで，正しく実行できるものとする。なお，以降の図に示す実行例では，MemoMax＝5，DataMax＝25としている。'),
    p('① 関数：resetMemo()　全てのメモを消去する。MemoCntとDataLenに0を設定することによって，Memo[]とData[]の全要素を“空き”の状態にする。resetMemo()を実行した後の配列・変数の状態を図2に示す。以降の図で，網掛け部分は，その配列要素が“空き”であることを表す。'),
    snapshot(0, 'resetMemo'),
    p('② 関数：addMemo(整数型：textLen，文字列型：text)　1件のメモを追加する。長さtextLenの文字列textをData[]の最初の空き要素以降に格納し，その格納位置の情報をMemo[]に設定する。図2の状態から，'),
    code(m.added.map(text => 'addMemo(' + callArgs(text) + ')').join('\n')),
    p('をこの順に実行した後の配列・変数の状態を，図3に示す。'), snapshot(1, 'addMemo（4件）'),
    p('③ 関数：deleteMemo(整数型：pos)　1件のメモを削除する。Memo[]の要素番号pos＋1以降の内容をそれぞれ一つ前の要素に移し，MemoCntから1を減じることによって，Memo[pos]が指すメモを削除する（表示の対象から除く）。Data[]中の参照されなくなったメモは，そのまま残す。図3の状態から，deleteMemo(' + m.remove + ')を実行した後の配列・変数の状態を，図4に示す。以降の図で，斜線部分は，参照されなくなったメモであることを表す。'),
    snapshot(2, 'deleteMemo'),
    p('④ 関数：changeMemo(整数型：pos，整数型：textLen，文字列型：text)　1件のメモの内容を変更する。長さtextLenの文字列textをData[]の最初の空き要素以降に格納し，その格納位置の情報をMemo[pos]に設定することによって，Memo[pos]が指すメモの内容を変更する。Data[]中の参照されなくなったメモは，そのまま残す。図4の状態から，changeMemo(' + m.replace + '，' + callArgs(m.replacement) + ')を実行した後の配列・変数の状態を，図5に示す。'),
    snapshot(3, 'changeMemo'),
    p('⑤ 関数：moveMemo(整数型：fromPos，整数型：toPos)　1件のメモを移動する。Memo[]の要素の並び順を変えて，Memo[fromPos]の内容をMemo[toPos]の位置に移動する。fromPos＜toPosの場合は，Memo[fromPos]の値を取り出し，Memo[fromPos＋1]〜Memo[toPos]の内容を前方に1要素分ずらし，取り出した値をMemo[toPos]に設定するという操作を行う。fromPos＞toPosの場合も，これと同様の操作を行う。図5の状態からmoveMemo(' + m.from + '，' + m.to + ')を実行した後の配列・変数の状態を，図6に示す。'),
    snapshot(4, 'moveMemo'),
    p('〔プログラム〕'), code(program),
    p('設問1 プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('設問2 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('このメモの管理方法では，削除されたメモや変更前のメモは，Data[]中に参照されない状態で残っている。その結果，DataLenの値は一方的に増加し，やがてData[]中の空き要素が枯渇する。次に示す関数clearGarbage()は，Data[]中の参照されなくなったメモを取り除き，空き要素を増やすための関数である。'),
    code(garbageProgram),
    p('プログラムの配列・変数が図6に示す状態のときに，clearGarbage()を実行すると，実行が終了した時点で，Memo[1]の値は［e］，Memo[2]の値は［f］，DataLenの値は［g］となる。'),
  ], [
    { id: 'ab', choices: choices(ab) }, { id: 'c', choices: choices(c) }, { id: 'd', choices: choices(d) },
    { id: 'efg', choices: choices(m.bank) },
  ], [
    { id: 'a', bank: 'ab', correct: 0 }, { id: 'b', bank: 'ab', correct: 2 }, { id: 'c', bank: 'c', correct: 3 },
    { id: 'd', bank: 'd', correct: 1 }, ...m.answers.map((answer, i) => ({ id: 'efg'[i], bank: 'efg', correct: m.bank.indexOf(answer) })),
  ],
  '設問1：メモの先頭は長さを格納する最初の空き位置DataLen（a）。長さ1バイトの分は既に加算したので，文字列の後はDataLen＋textLen（b）。削除ではpos＋1（c）から残りを手前へずらす。fromPos＞toPosでは，後方への上書きを避けるためfromPosからtoPos＋1まで逆順（d）で1要素前をコピーする。fromPos＝toPosならどちらの移動ループも実行しない。' +
  '設問2：clearGarbageは現在のMemo[]の順に参照中のレコードだけをtempへ移す。MemoCntが0ならDataLenを0にして戻る。各レコードの幅は長さ情報1バイトを含めて' +
  m.liveWidths.join('，') + 'バイト。先頭を0に置くので，Memo[1]は' + m.answers[0] + '，Memo[2]は' + m.answers[1] +
  '，DataLenは全幅の合計' + m.answers[2] + '。最後にtempからData[]へコピーする。');
  result.contexts = [spring2016PmReference('共通に使用する擬似言語の記述形式', [4, 5])];
  return result;
}

export const legacy2016SpringPm8Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-8', title: '長さ付きメモの配列編集と領域回収',
  version: '3.3.0', reference: [0], fields: [field('メモの文字列と削除・変更・移動の引数の組', 0, scenarios.length - 1)],
  sourceAnswer: 'ア／ウ／エ／イ／ウ／カ／ケ',
  fixedReferenceAssetIds: [spring2016PmPageAssetId(4), spring2016PmPageAssetId(5)],
  notes: '物理PDF p.35–40。7欄、a/b共有6、c/d各4、e/f/g共有10。1バイト文字、0〜255の長さの接頭1バイト、0始まり、引数・空きは検査済み、空きと未参照の区別、長さ下線、参照矢印、0件return、二方向移動と等しい場合の非実行を保持する。実際に問うデータと編集操作の5組（空文字、左右移動、使用領域上限を含む）をすべて独立のモデルで照合する。設問1の関数仕様を維持して式を固定する。数値候補は中間位置、長さバイトを除いた長さ、移動前のアドレス、旧DataLenなどを昇順で用いる。',
  publicNotes: 'メモの文字列と編集操作の引数を変更し，配列の状態，数値の解答群，正答，解説に反映しました。',
  build: spring2016Pm8Build,
};
