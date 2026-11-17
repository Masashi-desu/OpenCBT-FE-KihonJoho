import { code, p, strings, table } from './definition';
import { spring2007PmPageAssetId, spring2007PmReference } from './legacy-2007-spring-pm-materials';
import { answers, bank, define, single } from './legacy-2007-spring-pm-01-05-shared';
import { draw } from './legacy-2007-spring-pm-01-05-figures';
import { displayNumber, sortCases } from './legacy-2007-spring-pm-4-model';

const ref = [2,3] as const;
const a = ['Idx1','Idx1 ＋ 1','Idx1 − 1'];
const bc = ['A[Idx2] ← A[Idx2＋1]','A[Idx2] ← A[Idx2−1]','A[Idx2] ← Tmp','A[Idx2＋1] ← A[Idx2]',
  'A[Idx2＋1] ← Tmp','A[Idx2−1] ← A[Idx2]','A[Idx2−1] ← Tmp'];
const f = ['整列が正しく行われなくなる','整列は正しく行われ，元の条件式の場合と比べて実行ステップ数は多くなる',
  '整列は正しく行われ，元の条件式の場合と比べて実行ステップ数は変わらない','整列は正しく行われ，元の条件式の場合と比べて実行ステップ数は少なくなる'];
function evaluated(index:number) {
  const model = sortCases[index];
  const shifts = (row:readonly number[])=>row.flatMap((a,i)=>row.slice(i+1).filter(b=>model.down ? a<b : a>b)).length;
  const d = shifts(model.rows[0]), e = shifts(model.rows[1]);
  const g = model.ratio * (model.large / model.small) * (model.logSmall / model.logLarge);
  const counts = index === 0 ? [2,3,4,19,20,21] : [Math.max(0,d-1),d,d+1,e-2,e-1,e];
  const gChoices = index === 0 ? [500,1000,5000,10000,50000,500000] :
    [g/10,g/5,g,g*2,g*10,g*100].map(Math.round);
  return {...model,d,e,g,counts,gChoices};
}
export function spring2007Pm4Pages(index:number,print = true) {
  const m=evaluated(index), first=m.base, second=first+1, sense=m.down?'降順':'昇順', compare=m.down?'＜':'＞';
  const program=[
    '○InsertSort(整数型: A[], 整数型: N)','○整数型: Idx1, Idx2, Tmp','○論理型: Loop',
    '■ Idx1: '+second+', Idx1 ≦ N, 1','│  ・Tmp ← A[Idx1]','│  ・Idx2 ← ［a］','│  ・Loop ← true',
    '│  ■ Idx2 ≧ '+first+' and Loop = true','│  │  ▲ A[Idx2] '+compare+' Tmp  ← α','│  │  │  ・［b］  ← β',
    '│  │  │  ・Idx2 ← Idx2 − 1','│  │  ├──────','│  │  │  ・Loop ← false','│  │  ▼','│  ■','│  ・［c］','■',
  ];
  const pages=[
    [p('次のプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),p('〔プログラムの説明〕'),
      p('整数型の1次元配列の要素 A['+first+']，…，A[N]（N＞'+first+'）を，挿入ソートで'+sense+'に整列する副プログラム InsertSort である。'),
      p('（1）挿入ソートの手順は，次のとおりである。'),
      p('① まず，A['+first+'] と A['+second+'] を整列し，次に A['+first+'] から A['+(second+1)+'] までを整列し，その次に A['+first+'] から A['+(second+2)+'] までというように，整列する区間の要素を一つずつ増やしていき，最終的に A['+first+'] から A[N] までを整列する。'),
      p('② 整列する区間が A['+first+'] から A[M]（'+second+'≦M≦N）までのとき，A[M] を既に整列された列 A['+first+']，…，A[M−1] 中の適切な位置に挿入する。その手順は次のとおりである。'),
      p('（a）A[M] の値を，作業領域 Tmp に格納する。'),
      p('（b）A[M−1] から A['+first+'] に向かって Tmp と比較し，Tmp よりも'+(m.down?'小さな':'大きな')+'値を順次隣（要素番号の大きい方）に移動する。'),
      p('（c）（b）で最後に移動した値の入っていた配列要素に Tmp の内容を格納する。（b）で移動がなかった場合には A[M] に格納する。'),
      p('（2）副プログラム InsertSort の引数の仕様を表に示す。'),
      table('表　InsertSort の引数の仕様',['引数','データ型','入力／出力','意味'],
        [['A[]','整数型','入出力','整列対象の1次元配列'],['N','整数型','入力','整列する区間の最後の要素番号']])],
    [p('〔プログラム〕'),code(program.join('\n')),p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')],
    [p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),p('1次元配列 A[] の内容例を図に示す。'),
      p('プログラム中の β の行が実行される回数は，図の例1では［d］回，例2では［e］回となる。'),
      p('また，プログラム中の α の条件式を A[Idx2] '+(m.down?'≦':'≧')+' Tmp とした場合，例3のように配列要素の中に同じ値が複数含まれるときには［f］。'),
      draw('sorting',index,'図　1次元配列 A[] の内容例')],
    [p('設問3　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('n 個のランダムなデータを整列する場合，挿入ソートの計算量は O(n²)，クイックソートの平均的な計算量は O(n log₂ n) なので，n の値が大きくなるとクイックソートの計算量の方が総じて小さくなる。'),
      p('InsertSort のほかに，クイックソートで'+sense+'に整列する副プログラム QuickSort を作成し，ランダムな'+displayNumber(m.small)+'個のデータを何組か用意して，それぞれの組に対して InsertSort と QuickSort の実行時間を測定したところ，QuickSort の平均実行時間が InsertSort の1／'+m.ratio+'であった。この結果を基にして，'+
        displayNumber(m.large)+'個のデータを整列したときの平均的実行時間を計算すると，QuickSort が InsertSort の約1／［g］と推定できる。ここで，log₂ '+m.small+' ≒ '+m.logSmall+'，log₂ '+m.large+' ≒ '+m.logLarge+' とする。')],
  ];
  if(print) {
    pages[1].push(...bank('aに関する解答群',a),...bank('b，cに関する解答群',bc));
    pages[2].push(...bank('d，eに関する解答群',m.counts),...bank('fに関する解答群',f));
    pages[3].push(...bank('解答群',m.gChoices.map(displayNumber)));
  }
  return pages;
}
export const spring2007Pm4=define(4,'挿入ソートの処理とクイックソートとの比較','a=ウ／b=エ／c=オ／d=イ／e=カ／f=イ／g=ウ',
  '添字の始点・整列方向・配列例・二つの標本規模','要素の挿入・移動回数を追い，計算量から実行時間を比較する。',
  'Nの条件・引数表・α/βと制御線・大小比較と同値の扱い・3配列と7欄の元の形式を保持。添字と整列方向，図の配列，実測の比と規模を変える。',index=>{
    const m=evaluated(index);
    return {prompt:spring2007Pm4Pages(index,false).flat(),contexts:[spring2007PmReference('疑似言語の記述形式',ref)],
      ...answers([strings(a),strings(bc),strings(m.counts.map(String)),strings(f),strings(m.gChoices.map(displayNumber))],[
        single('a','設問1 a',0,2),single('b','設問1 b',1,3),single('c','設問1 c',1,4),
        single('d','設問2 d',2,m.counts.indexOf(m.d)),single('e','設問2 e',2,m.counts.indexOf(m.e)),single('f','設問2 f',3,1),single('g','設問3',4,m.gChoices.indexOf(Math.round(m.g)))]),
      explanation:'手前の要素から比較し，先に移す値は添字を1増やした隣へ移動する。最後の比較位置の次に Tmp を格納する。例1の移動は'+m.d+'回，例2は'+m.e+
        '回。同値でも移す条件にすると，同じ値の組も余分に移すが整列結果の値の順は保つ。QuickSort／InsertSort の比は元の1／'+
        m.ratio+'に規模比の逆数 '+m.small+'／'+m.large+' と対数比 '+m.logLarge+'／'+m.logSmall+' を掛けるので1／'+displayNumber(m.g)+'となる。',
    };
  },{fixedReferenceAssetIds:ref.map(spring2007PmPageAssetId)});
