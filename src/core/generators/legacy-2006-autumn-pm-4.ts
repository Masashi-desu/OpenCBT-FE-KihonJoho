import { code, p, table } from './definition';
import { answers, bankBlocks, define, single } from './legacy-2006-autumn-pm-01-05-shared';
import { autumn2006PmPageAssetId, autumn2006PmReference } from './legacy-2006-autumn-pm-materials';

const referencePages=[2,3];
import { draw } from './legacy-2006-autumn-pm-01-05-figures';
import { tabExample } from './legacy-2006-autumn-pm-4-model';

const aOptions=['Didx ＋ 1','Didx − 1','Didx ＋ TabGap ＋ 1','Didx ＋ TabGap − 1'];
const bcOptions=['Didx ← Didx ＋ 1','Dst[Didx] ← Src[Sidx]','Dst[Didx ＋ 1] ← Src[Sidx]','Dst[Didx] ← Src[Sidx ＋ 1]'];
const deOptions=['TabPos ← TabSet[Tidx]','TabPos ← TabSet[Tidx] ＋ Didx','TabPos ← TabSet[Tidx] − Didx','Tidx ← Didx ＋ 1','Tidx ← TabPos ＋ 1','Tidx ← Tidx ＋ 1'];

const firstProgram=[
  '○TabSpc1(文字型: Src[], 文字型: Dst[], 整数型: TabGap)',
  '○整数型: Sidx, Didx, N, TabPos',
  '・Sidx ← 1',
  '・Didx ← 1',
  '■ Src[Sidx] ≠ EOS         /* EOS：文字列の終わりを表すシステム定数 */',
  '│  ▲ Src[Sidx] ＝ TAB         /* TAB：タブ文字を表すシステム定数 */',
  '│  │  ・N ← (［a］) ÷ TabGap',
  '│  │  ・TabPos ← TabGap × N ＋ 1',
  '│  │  ■ Didx ＜ TabPos',
  '│  │  │  ・Dst[Didx] ← SPC     /* SPC：間隔文字を表すシステム定数 */',
  '│  │  │  ・［b］',
  '│  │  ■',
  '│  ├─────',
  '│  │  ・［c］',
  '│  │  ・Didx ← Didx ＋ 1',
  '│  ▼',
  '│  ・Sidx ← Sidx ＋ 1',
  '■',
  '・Dst[Didx] ← EOS',
].join('\n');
const secondProgram=[
 '○TabSpc2(文字型: Src[], 文字型: Dst[], 整数型: TabSet[])',
 '○整数型: Sidx, Didx, Tidx, TabPos',
 '○論理型: Loop',
 '・Sidx ← 1',
 '・Didx ← 1',
 '・Tidx ← 1',
 '■ Src[Sidx] ≠ EOS',
 '│  ▲ Src[Sidx] ＝ TAB',
 '│  │  ・TabPos ← Didx ＋ 1',
 '│  │  ・Loop ← true',
 '│  │  ■ (TabSet[Tidx] ≠ −1) and (Loop ＝ true)',
 '│  │  │  ▲ Didx ＜ TabSet[Tidx]',
 '│  │  │  │  ・［d］',
 '│  │  │  │  ・Loop ← false',
 '│  │  │  ▼',
 '│  │  │  ・［e］',
 '│  │  ■',
 '│  │  ■ Didx ＜ TabPos',
 '│  │  │  ・Dst[Didx] ← SPC',
 '│  │  │  ・［b］',
 '│  │  ■',
 '│  ├─────',
 '│  │  ・［c］',
 '│  │  ・Didx ← Didx ＋ 1',
 '│  ▼',
 '│  ・Sidx ← Sidx ＋ 1',
 '■',
 '・Dst[Didx] ← EOS',
].join('\n');
const asCode=(xs:string[])=>xs.map(x=>[code(x,'pseudocode')]);

export function autumn2006Pm4Pages(index:number, print=true){
 const {gap,dst,stops}=tabExample(index);
 const finalLetter=dst.at(-2)!, last=dst.length-1;
 const example=index===0
   ? '“j”を Dst のタブ位置である文字位置13（＝4×3＋1）に格納したのでは，タブ文字が間隔文字に置き換わらないので，最も近い右のタブ位置である文字位置17（＝4×4＋1）に格納する。'
   : '実行例では最後のタブ文字も少なくとも一つの間隔文字に置換し，後続する “'+finalLetter+'” を次のタブ位置である文字位置'+last+'（＝'+gap+'×'+Math.floor((last-1)/gap)+'＋1）に格納する。';
 return [
  [p('次のプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
   p('〔プログラム1の説明〕'),p('副プログラム TabSpc1 は，タブ文字を展開するプログラムである。'),
   p('（1）TabSpc1 は，文字型配列 Src を先頭から調べ，Src 中のすべてのタブ文字をそれぞれ一つ以上の間隔文字（スペース）に置換して，文字型配列 Dst に格納する。タブ文字以外の文字は，そのまま Dst に格納する。'),
   p('（2）文字型配列の各要素には，文字を1文字ずつ順に格納し，最後の文字の次の要素にはシステム定数である EOS を格納する。なお，配列の添字は1から始まり，添字の値を文字位置と呼ぶ。'),
   p('（3）Src 中にタブ文字が出現した場合，次の文字が最も近い右のタブ位置に格納されるように，タブ文字を一つ以上の間隔文字に置換して，Dst に格納する。ここで，タブ位置とは，引数で渡されるタブ間隔（≧2）を用いた次の式で計算される文字位置である。'),
   p('タブ位置＝タブ間隔×n＋1　（n＝1，2，…）'),
   p('（4）タブ間隔が'+gap+'のときの実行例を図1に示す。'+example),
   draw('tab-run',index,'図1　タブ間隔が'+gap+'のときの TabSpc1 の実行例'),
   p('注　TABはタブ文字を，▼はタブ位置を，△は間隔文字を表す。'),
   p('（5）Dst は十分に大きいものとする。'),
   p('（6）副プログラム TabSpc1 の引数の仕様を表1に示す。')],
  [table('表1　TabSpc1 の引数の仕様',['引数','データ型','入力／出力','意味'],[
   ['Src[]','文字型','入力','対象となる文字型配列'],['Dst[]','文字型','出力','出力する文字型配列'],['TabGap','整数型','入力','タブ間隔（≧2）'],
   ]),
   p('〔プログラム1〕'),code(firstProgram,'pseudocode'),
   p('設問1　プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
   ...(print?[...bankBlocks('aに関する解答群',asCode(aOptions)),...bankBlocks('b，cに関する解答群',asCode(bcOptions))]:[])],
  [p('設問2　プログラム1を改造して，タブ位置を任意の文字位置に指定できるようなプログラム2を作成した。ただし，タブ位置は2以上の値で，隣り合うタブ位置の間隔も2以上とする。タブ位置は引数で渡される整数型配列 TabSet に昇順に格納され，最後のタブ位置が格納された次の配列要素には−1が格納されている。'),
   p('なお，最後のタブ位置以降にタブ文字が出現した場合は，一つの間隔文字に置換する。'),
   p('図1と同じ動作をさせる場合の TabSet の内容を図2に，プログラム2に示す副プログラム TabSpc2 の引数の仕様を表2に示す。'),
   p('プログラム2中の空欄に入れる正しい答えを，解答群の中から選べ。ただし，［b］，［c］には設問1の正しい答えが入っているものとする。'),
   draw('tab-stops',index,'図2　整数型配列 TabSet の内容（図1と同じ動作をさせる場合）'),
   table('表2　TabSpc2 の引数の仕様',['引数','データ型','入力／出力','意味'],[
    ['Src[]','文字型','入力','対象となる文字型配列'],['Dst[]','文字型','出力','出力する文字型配列'],['TabSet[]','整数型','入力','タブ位置を格納した整数型配列'],
   ])],
  [p('〔プログラム2〕'),code(secondProgram,'pseudocode'),
   ...(print?bankBlocks('d，eに関する解答群',asCode(deOptions)):[])],
 ];
}

export const autumn2006Pm4=define(4,'タブ文字の展開と配列で指定するタブ位置','a=エ／b=ア／c=イ／d=ア／e=カ',
 '文字列を構成する文字、タブ位置、間隔及び図の実行例',
 '空欄a〜eにより，固定間隔と配列指定の両方で少なくとも一文字以上の間隔を挿入する。',
 '原資料の字下げ・ループ制御線、タブ位置の閾値、添字1から、EOS/SPC/TAB、−1の終端及び十分な出力域を保持。連続する記号列と間隔を変更して実行例を同じ条件から再生成する。一般の手順の空欄は具体例だけに依存しないため答えは固定。',
 index=>{
  const {gap}=tabExample(index);
  return {prompt:autumn2006Pm4Pages(index,false).flat(),contexts:[autumn2006PmReference('共通擬似言語の記述形式',referencePages)],...answers([asCode(aOptions),asCode(bcOptions),asCode(deOptions)],[
   single('a','a',0,3),single('b','b',1,0),single('c','c',1,1),single('d','d',2,0),single('e','e',2,5),
  ]),explanation:'文字位置は1から数える。Didx−1 を TabGap で割った整数商に1を足すと、今の位置より厳密に右のタブ位置になる。したがって N の分子は Didx＋TabGap−1。間隔文字を1文字書くたびに Didx を1増加し、通常文字は現在の Src[Sidx] をそのまま Dst[Didx] へ格納する。任意位置版では最初の TabSet[Tidx]＞Didx を TabPos に取り、調べるたびに Tidx を1進める。−1に達した場合は初期値 Didx＋1 を使う。図1の間隔は'+gap+'である。'};
 },{answerVariation:'fixed',fixedReferenceAssetIds:referencePages.map(autumn2006PmPageAssetId)});
