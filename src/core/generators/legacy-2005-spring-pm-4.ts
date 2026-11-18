import { code, p, strings, table } from './definition';
import { answers, asCode, bank, bankBlocks, define, single } from './legacy-2005-spring-pm-01-05-shared';
import { draw } from './legacy-2005-spring-pm-01-05-figures';
import { firstHeapStep } from './legacy-2005-spring-pm-01-05-models';
import { spring2005PmPageAssetId, spring2005PmReference } from './legacy-2005-spring-pm-materials';

const aBank=['L ← Top','L ← Top ＋ 1','L ← Top × 2','L ← Top × 2 ＋ 1'];
const bBank=['L ≦ Last','L ＜ Last','R ≦ Last − 1','R ≦ Last − 2'];
const numberBank=['2','3','4','5','6','7','8','9'];
const initBank=['Idx：1，Idx ≦ Last，2','Idx：1，Idx ≦ Last ÷ 2，1','Idx：Last，Idx ≧ 1，−2','Idx：Last ÷ 2，Idx ≧ 1，−1'];
const columns=['引数名','データ型','入力／出力','意味'];
const program=[
  '○ 整数型：A[1000000]                     /* 大域変数として用いる */',
  '',
  '○ HeapSort(整数型：Num)',
  '○ 整数型：Idx',
  '/* 最初にヒープを作成 */',
  '・InitHeap(Num)',
  '/* 並べ替え */',
  '■ Idx：Num，Idx ＞ 1，−1',
  '│  ・Swap(1, Idx)',
  '│  ・MakeHeap(1, Idx−1)',
  '■',
  '',
  '○ MakeHeap(整数型：Top, 整数型：Last)',
  '○ 整数型：L, R',
  '・［a］',
  '・R ← L ＋ 1',
  '▲ R ≦ Last                             /* 3個比較 */',
  '│  ▲ A[L] ＜ A[R]                       /* 右が大きい */',
  '│  │  ▲ A[Top] ＜ A[R]',
  '│  │  │  ・Swap(Top, R)',
  '│  │  │  ・MakeHeap(R, Last)',
  '│  │  ▼',
  '│  ├────                               /* 左が大きい */',
  '│  │  ▲ A[Top] ＜ A[L]',
  '│  │  │  ・Swap(Top, L)',
  '│  │  │  ・MakeHeap(L, Last)',
  '│  │  ▼',
  '│  ▼',
  '├────',
  '│  ▲ ［b］                              /* 2個比較 */',
  '│  │  ▲ A[Top] ＜ A[L]',
  '│  │  │  ・Swap(Top, L)',
  '│  │  │  ・MakeHeap(L, Last)',
  '│  │  ▼',
  '│  ▼',
  '▼',
  '',
  '○ Swap(整数型：X, 整数型：Y)',
  '○ 整数型：Tmp',
  '・Tmp ← A[X]',
  '・A[X] ← A[Y]',
  '・A[Y] ← Tmp',
].join('\n');
const init=[
  '○ InitHeap(整数型：Last)',
  '○ 整数型：Idx',
  '■ ［設問3］',
  '│  ・MakeHeap(Idx, Last)',
  '■',
].join('\n');
const refs=[2,3];
export function spring2005Pm4Pages(index:number,print=true) {
  const {last,initialValue}=firstHeapStep(index);
  return [
    [p('次のプログラムの説明及びプログラムを読んで，設問1～3に答えよ。'),
      p('〔プログラムの説明〕'),p('副プログラムHeapSortは，配列に格納されている整数値をヒープソートで昇順に整列するプログラムである。'),
      p('（1）整列するNum個（Num ≧ 2）の整数値は，大域変数の配列A[1]，A[2]，…，A[Num]に格納されている。'),
      p('（2）ヒープソートは，2分木を用いてデータを整列する。2分木を配列で表現するには，ある節がA[i]に対応するとき，その左側の子の節をA[2×i]に，右側の子の節をA[2×i＋1]に対応させる。図では，丸が節を，丸中の数字が節の値を示し，実際に値が格納されている配列の要素を丸の脇に示している。'),
      p('（3）ヒープとは，図のように，各節の値が自分の子の節の値以上になっている2分木である。'),
      draw('heap',index,'図　ヒープの例'),
      p('（4）整列の手順は，次のとおりである。'),
      p('① 配列Aの中の，A[1]，A[2]，…，A[Num]を整列対象とする。'),
      p('② 整列対象の各要素が，（2）で述べたような2分木を表現しているものとして，要素の値を入れ換えてヒープを作る。その結果，木の根（A[1]）には整列対象の要素の最大値が入る。'),
      p('③ 木の根（A[1]）の値と，木の最後の節（整列対象の最後の要素に対応する節）の値とを交換する。')],
    [p('④ 木の最後の節を2分木から取り除く（整列対象の要素を一つ減らす）。'),
      p('⑤ ④の結果が，木の根だけになるまで，②～④の処理を繰り返す。'),
      p('（5）ヒープを作り直す手順は，次のとおりである。'),
      p('① 木の根を親の節とする。'),p('② 子の節がなければ終了する。'),
      p('③ 二つの子の節のうち値が大きい方と親の節の値を比較し，親の節の方が小さいときは，値を交換する。親の節の値が子の節の値以上のときは，何もしないで終了する。'),
      p('④ 値を交換した子の節を根とする部分木に対して，①～③の処理を繰り返す。'),
      p('（6）副プログラムの引数の仕様を表1～4に示す。'),
      table('表1　HeapSortの引数の仕様',columns,[['Num','整数型','入力','木の最後の節に対応する配列要素の添字']]),
      table('表2　InitHeapの引数の仕様',columns,[['Last','整数型','入力','最初にヒープを作る木の，最後の節に対応する配列要素の添字']]),
      table('表3　MakeHeapの引数の仕様',columns,[['Top','整数型','入力','ヒープを作り直す部分木の，木の根に対応する配列要素の添字'],
        ['Last','整数型','入力','ヒープを作り直す部分木の，最後の節に対応する配列要素の添字']]),
      table('表4　Swapの引数の仕様',columns,[['X','整数型','入力','A[Y]と交換する配列要素の添字'],['Y','整数型','入力','A[X]と交換する配列要素の添字']])],
    [p('〔プログラム〕'),code(program)],
    [p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      ...(print?[...bankBlocks('aに関する解答群',asCode(aBank)),...bankBlocks('bに関する解答群',asCode(bBank))]:[]),
      p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('図のヒープを用いて，〔プログラムの説明〕の（4）の③，④を1回だけ実行して，②が終了したとき，最初A['+last+
        ']に入っていた値'+initialValue+'が格納されている配列要素の添字は［c］である。また，それまでに節の値を交換した回数は［d］である。'),
      ...(print?bank('解答群',numberBank):[]),
      p('設問3　最初にヒープを作成する副プログラムInitHeapはMakeHeapを使って作ることができる。次のプログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      code(init)],
    print?bankBlocks('解答群',asCode(initBank)):[],
  ];
}
export const spring2005Pm4=define(
  4,'最大ヒープの作成と最初の交換','a=ウ／b=ア／c=キ／d=ウ／設問3=エ',
  'ヒープの10節の値と最初に末尾から移動する値',
  '2分木・配列の添字とヒープの手順を保ち、最大ヒープの値と退避する末尾の値を変更する。',
  '1起点の添字、Num≧2、左子2×iと右子2×i＋1、比較・交換の順、降順の初期化走査、原紙の疑似言語を保持。',
  index=>{
    const {last,initialValue,endingIndex,swaps,trail}=firstHeapStep(index);
    return {prompt:spring2005Pm4Pages(index,false).flat(),contexts:[spring2005PmReference('共通に使用される擬似言語の記述形式',refs)],
      ...answers([asCode(aBank),asCode(bBank),strings(numberBank),asCode(initBank)],[
        single('a','a',0,2),single('b','b',1,0),single('c','c',2,endingIndex-2),single('d','d',2,swaps-2),single('s3','設問3',3,3),
      ]),explanation:'左の子の添字は2×Top。右の子が存在しない枝では，左の子が存在するL≦Lastを確認する。'+
        'A['+last+']にあった値'+initialValue+'は，'+trail.map(i=>'A['+i+']').join('→')+'へ移る。最初の根と末尾の交換を含めて'+swaps+
        '回交換し，添字は'+endingIndex+'となる。InitHeapは子を持ち得る最後の節Last÷2から1へ降順で進め，部分木の下から整える。'};
  },{fixedReferenceAssetIds:refs.map(spring2005PmPageAssetId)},
);
