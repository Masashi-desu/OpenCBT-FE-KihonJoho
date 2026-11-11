import { code, p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2010-spring-pm-01-04-shared';
import { draw } from './legacy-2010-spring-pm-01-04-figures';
import { cacheScenario, cacheTrace } from './legacy-2010-spring-pm-01-04-cache';
import { spring2010PmPageAssetId, spring2010PmReference } from './legacy-2010-spring-pm-materials';

const pseudocodePages = [3, 4];
const pairColumns = ['ブロック番号', 'フラグ'];
function choices(index: number) {
  const { base, constant } = cacheScenario(index);
  const blocks = Array.from({ length: 5 }, (_, i) => base / 100 + 1 + i);
  const pairs = blocks.flatMap(block => [[String(block), '0'], [String(block), '1']]);
  return { blocks: ['0', ...blocks.map(String)], pairs, constant };
}

export function spring2010Pm1Pages(index: number) {
  const { order, target, memory, constantAddress, constant, blockFor, program } = cacheScenario(index);
  const { blocks, pairs } = choices(index);
  const loop = '■ i: 99, i ≧ 0, －1\n│  ・' + target + '[i] ← ' + [...order].map(name => name + '[i]').join(' ＋ ') +
    '\n│  ・D[i] ← ' + target + '[i]\n■';
  return [[
    p('問1　キャッシュメモリに関する次の記述を読んで，設問1，2に答えよ。'),
    p('キャッシュメモリとは，主記憶とCPUの間に置く高速アクセスが可能なメモリである。キャッシュメモリとCPU及び主記憶との関係を図1に示す。データをキャッシュメモリに保持しておくことによって，CPUは速度の遅い主記憶に直接アクセスしなくて済むので，処理の高速化が図れる。'),
    draw('cacheLayer', 0, '図1　キャッシュメモリとCPU及び主記憶との関係'),
    p('ここでは，ハードウェアのアーキテクチャを次のように仮定する。'),
    p('（1） 主記憶はブロック（1ブロックは100語から成る）に分割されている。各ブロックには，その先頭番地が小さいものから順に1，2，3，…とブロック番号が振られている。主記憶とキャッシュメモリ間はブロック単位でデータが転送される。'),
    p('（2） キャッシュメモリには，命令を保持しておく命令キャッシュと，データを保持しておくデータキャッシュの2種類がある。ここでは，データキャッシュ（以下，キャッシュという）だけを考える。'),
    p('（3） キャッシュの構成は，図2のとおりとする。'),
    p('① キャッシュは，ディレクトリ部とデータ部から成る。'),
    p('② データ部はバッファ1〜3の三つのバッファから成り，各バッファは1ブロック分の主記憶の内容を保持できる。'),
  ], [
    p('③ ディレクトリ部は，データ部のバッファ1〜3に対応したディレクトリ1〜3から成る。それぞれのディレクトリは次の内容を保持する三つのフィールドから成る。'),
    p('なお，データ部のバッファが未使用の場合は，対応するディレクトリの三つのフィールドすべてに0が入っている。'),
    p('（イ） ブロック番号：対応するデータ部のバッファが保持する主記憶のブロック番号'),
    p('（ロ） 順位：キャッシュ内に最も古くから存在するブロックから順に1，2，3と番号が振られる。'),
    p('（ハ） フラグ：対応するデータ部のバッファにブロックを読み込んだとき，0に初期化される。対応するデータ部のバッファに保持されている内容がCPUの処理によって変更されると，1に変わる。'),
    draw('cacheExample', index, '図2　キャッシュの構成'),
    p('擬似言語で表現された次の繰返し処理を実行する場合について考える。'),
    p('〔繰返し処理〕'),
    code(loop),
    p('（1） 配列A，B，C及びDは100個の要素から成り，1要素は1語である。添字は0から始まるものとする。'),
  ], [
    p('（2） データ領域の主記憶への割付けは，次のとおりとする。'),
    p('① Aの配列領域：' + memory('A') + '〜' + (memory('A') + 99) + '番地（ブロック番号' + blockFor(memory('A')) +
      '）。A[0]は' + memory('A') + '番地，A[1]は' + (memory('A') + 1) + '番地という順に割り付けられる。'),
    ...[... 'BCD'].map((name, i) => p('②③④'[i] + ' ' + name + 'の配列領域：' + memory(name) + '〜' + (memory(name) + 99) +
      '番地（ブロック番号' + blockFor(memory(name)) + '）')),
    p('⑤ 定数－1と99の格納領域：' + constantAddress + '，' + (constantAddress + 1) + '番地（ブロック番号' + constant + '）'),
    p('（3） 変数iはレジスタを使用し，主記憶への割付けは行わない。'),
    p('（4） プログラム領域の内容は表1のとおりとする。参照ブロックの数値は，その命令を実行するときにCPUが参照するデータのブロック番号を示す。'),
    table('表1　プログラム領域の内容', ['番地', '命令', '処理の内容', '参照ブロック'],
      program.map(row => [String(row.address), row.command, row.operation, row.block ? String(row.block) : '－'])),
    p('命令の形式は次のとおりとする。'),
    code('LOAD / ADD / STORE    Rn, adr [, Rx] :', 'text'),
    p('定数adrはアドレスを示す。Rxは指標レジスタである（省略可能）。Rxを指定した場合の実効アドレスは，定数adrとRxの内容を加算した値が示す番地とする。'),
    p('LOADは，実効アドレスが示す番地に格納されている内容を，レジスタRnに設定する。'),
    p('ADDは，レジスタRnの内容に実効アドレスが示す番地に格納されている内容を加えて，レジスタRnに設定する。'),
    p('STOREは，レジスタRnの内容を実効アドレスが示す番地に格納する。'),
    p('ADDR　Rn, Rm：レジスタRnの内容にレジスタRmの内容を加えて，レジスタRnに設定する。'),
    p('JNM　adr：直前の演算結果が0以上ならばadr番地へジャンプする。'),
  ], [
    p('設問1　次の（1）〜（6）に従って，1000番地のLOAD命令を実行した直後，及び1006番地のSTORE命令を最初に実行した直後のディレクトリ部の内容を，図3と図4に示す。［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('（1） 参照ブロックがキャッシュ内にある場合は，キャッシュ内のデータが使用される。'),
    p('（2） 参照ブロックがキャッシュ内にない場合（以下，ミスという）は，参照ブロックが主記憶からキャッシュに読み込まれ，対応するディレクトリのフラグの内容は0に初期化される。'),
    p('（3） CPUが参照ブロックに対してSTORE命令を実行した場合は，対応するディレクトリのフラグの内容は1に変わる。'),
    p('（4） ミスが起こったときにキャッシュ内に未使用のバッファがある場合は，未使用のバッファの中で最も番号が小さいバッファに参照ブロックを読み込み，順位を更新する。'),
    p('（5） ミスが起こったときにキャッシュ内に未使用のバッファがない場合は，次のキャッシュ更新ロジックを用いる。'),
    p('キャッシュ内に最も古くから存在するブロックが格納されているバッファに，参照ブロックを読み込み，順位を更新する。ただし，対応するディレクトリのフラグの内容が1だったときは，そのブロックを主記憶に書き戻してから，参照ブロックを読み込み，順位を更新する。'),
    p('（6） プログラム実行開始時は，キャッシュ内にデータが入っていないものとする。'),
  ], [
    draw('cacheAfterLoad', index, '図3　1000番地のLOAD命令を実行した直後のディレクトリ部'),
    draw('cacheAfterStore', index, '図4　1006番地のSTORE命令を最初に実行した直後のディレクトリ部'),
    ...bank('解答群', blocks),
  ], [
    p('設問2　設問1の（5）のキャッシュ更新ロジックを，次に示す新しいキャッシュ更新ロジックに変えた場合の，ディレクトリ部のブロック番号とフラグの内容の変化を，表2に示す。［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('〔新しいキャッシュ更新ロジック〕'),
    p('参照されていない時間が最も長いブロックが格納されているバッファに，参照ブロックを読み込む。'),
    p('なお，この更新ロジックでは，順位の付け方も変更されていて，キャッシュ内で参照されていない時間が最も長いブロックから順に1，2，3と番号が振られる。'),
    draw('cacheTimeline', index, '表2　ディレクトリ部の内容の変化'),
    p('注　網掛けの部分は，表示していない。'),
  ], [
    table('解答群', ['', ...pairColumns], pairs.map((pair, i) => ['アイウエオカキクケコ'[i], ...pair])),
  ]];
}

export const legacy2010SpringPm1Definition = define(1, 'キャッシュメモリ', '設問1 a=カ・b=エ・c=ウ・設問2 d=イ・e=ク・f=ウ',
  '配列の主記憶番地，読込み順，更新する配列',
  '配列の番地、加算時の読込み順、先に格納する配列を変更し、二つの置換方式で追跡します。',
  'p.5〜11。ブロック100語・配列100要素・0始まり，データキャッシュのみ，3バッファと順位・変更フラグ，STORE，書戻し，未使用スロットの昇順，空状態，二つの観測時刻と二周目，解答表の空欄範囲を保持。', index => {
    const { blocks, pairs } = choices(index), fifo = cacheTrace(index, false), lru = cacheTrace(index, true);
    const [a, b, c] = [fifo[0][0].block, fifo[6][0].block, fifo[6][2].block];
    const last = [lru[6][1], lru[9][2], lru[10][0]];
    const selected = last.map(({ block, flag }) => pairs.findIndex(pair => pair[0] === String(block) && pair[1] === String(flag)));
    return {
      prompt: spring2010Pm1Pages(index).flat(),
      contexts: [spring2010PmReference('共通に使用される擬似言語の記述形式', pseudocodePages)],
      ...answers([strings(blocks), pairs.map(pair => [table('ディレクトリ', pairColumns, [pair])])], [
        single('a', '設問1 a', 0, blocks.indexOf(String(a))), single('b', '設問1 b', 0, blocks.indexOf(String(b))),
        single('c', '設問1 c', 0, blocks.indexOf(String(c))),
        ...[...'def'].map((id, i) => single(id, '設問2 ' + id, 1, selected[i])),
      ]),
      explanation: 'CPU（Central Processing Unit、中央処理装置）は表1の順にデータのブロックを参照する。最初のLOADでブロック' + a +
        'が空いているバッファ1に入る。先に入った順に置き換えるFIFO（First In, First Out、先入れ先出し）では，1006番地の直後のバッファ1は' + b + '，バッファ3は' + c +
        'である。長く参照していない順に置き換えるLRU（Least Recently Used）では，ヒットしたブロックの参照時刻も更新する。読み込んだ直後はフラグ0，STOREで1になる。FIFOでフラグ1のブロックを置き換えるときは，主記憶へ書き戻してから次のブロックを読む。' +
        '表2のd，e，fが指す（ブロック番号，フラグ）は順に' + last.map(({ block, flag }) => '（' + block + '，' + flag + '）').join('，') + 'である。',
    };
  }, { fixedReferenceAssetIds: pseudocodePages.map(spring2010PmPageAssetId) });
