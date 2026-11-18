import { code, p, table } from './definition';
import { answers, asCode, bankBlocks, define, single } from './legacy-2004-autumn-pm-01-05-shared';
import { radixCases } from './legacy-2004-autumn-pm-01-05-models';
import { autumn2004PmPageAssetId, autumn2004PmReference } from './legacy-2004-autumn-pm-materials';

const horner=['Rdx','Val','Val × Rdx','Val ÷ Rdx'];
const integerToDigits=['Quo ← Quo ÷ Rdx','Quo ← Quo ÷ Rem','Quo ← Rdx','Quo ← Rem ÷ Rdx','Quo ← Val',
  'Rem ← Rdx','Rem ← Val','Tmp ← ToStr(Quo) ＋ Tmp','Tmp ← ToStr(Rem) ＋ Tmp'];
const compare=['P ＜ Code[Idx]','P ＞ Code[Idx]','P ≦ Code[Idx]','P ≧ Code[Idx]'];
const columns=['引数名／返却値','データ型','意味'];
const refs=[2];
const program=[
  '○ 文字型：RadixConv(整数型：Frdx, 文字型：Fnum, 整数型：Trdx)',
  '・return IntToN(MToInt(Frdx, Fnum), Trdx)',
  '                         /* IntToNの値を関数の返却値とする */',
  '',
  '○ 整数型：MToInt(整数型：Rdx, 文字型：Num)',
  '○ 整数型：Idx, Val',
  '・Val ← 0',
  '■ Idx：1，Idx ≦ Length(Num)，1  /* LengthはNumの文字列長を返す */',
  '│  ・Val ← ［a］ ＋ ToInt(Substr(Num, Idx, 1))',
  '            /* SubstrはNumの先頭からIdx番目（≧1）の1文字を取り出す */',
  '■',
  '・return Val          /* Valを関数の返却値とする */',
  '',
  '○ 文字型：IntToN(整数型：Val, 整数型：Rdx)',
  '○ 整数型：Quo          /* 商 */',
  '○ 整数型：Rem          /* 剰余 */',
  '○ 文字型：Tmp',
  '・［b］',
  '・Tmp ← ""',
  '■ Quo ≧ Rdx',
  '│  ・Rem ← Quo % Rdx',
  '│  ・Tmp ← ToStr(Rem) ＋ Tmp        /* ＋は文字列を連結する演算子 */',
  '│  ・［c］',
  '■',
  '・［d］',
  '・return Tmp                   /* Tmpを関数の返却値とする */',
  '',
  '○ 整数型：ToInt(文字型：P)',
  '○ 整数型：Idx',
  '○ 文字型：Code[16]             /* 添字は0から始まる */',
  '/* Codeには，初期値として"0", "1", "2", "3", "4", "5", "6", "7", */',
  '/* "8", "9", "A", "B", "C", "D", "E", "F"がこの順に格納されている */',
  '/* 文字の値もこの順に大きくなる */',
  '・Idx ← 0',
  '■ ［e］                       /* 文字の比較 */',
  '│  ・Idx ← Idx ＋ 1',
  '■',
  '・return Idx                   /* Idxを関数の返却値とする */',
  '',
  '○ 文字型：ToStr(整数型：Q)',
  '○ 文字型：Code[16]             /* 添字は0から始まる */',
  '/* Codeには，初期値として"0", "1", "2", "3", "4", "5", "6", "7", */',
  '/* "8", "9", "A", "B", "C", "D", "E", "F"がこの順に格納されている */',
  '/* 文字の値もこの順に大きくなる */',
  '・return Code[Q]            /* Code[Q]を関数の返却値とする */',
].join('\n');

export function autumn2004Pm4Pages(index:number,print=true) {
  const {from:[m0,m1],to:[n0,n1]}=radixCases[index];
  const range=(lo:number,name:string,hi:number)=>lo+' ≦ '+name+' ≦ '+hi;
  return [
    [p('次のプログラムの説明及びプログラムを読んで，設問に答えよ。'),p('〔プログラムの説明〕'),
      p('関数RadixConvは，M進数字列（'+range(m0,'M',m1)+'）を，N進数字列（'+range(n0,'N',n1)+'）に基数変換するプログラムである。'),
      p('（1）M進数字列は，文字であるM進数字だけで構成され，空白文字は含まない。11～16進数の10以上の数字には，“A”～“F”のアルファベットを用いる。'),
      ...(print?[]:[p('M進数字列には，少なくとも1文字の数字が含まれるものとする。')]),
      p('（2）RadixConvは，M進数字列を整数値に変換した後，その整数値をN進数字列に変換する。M進数字列を整数値に変換する関数はMToInt，整数値をN進数字列に変換する関数はIntToNである。'),
      p('（3）関数MToIntと関数IntToNでは，次の関数を利用する。'),
      p('① 1文字の数字P（“0”，“1”，…，“F”のいずれか）を整数値に変換する関数ToInt'),
      p('② 整数値Q（0 ≦ Q ≦ 15）を1文字の数字（“0”，“1”，…，“F”のいずれか）に変換する関数ToStr'),
      p('③ 文字列の長さを返す既定義の関数Length'),p('④ 文字列の一部を取り出す既定義の関数Substr'),
      p('（4）関数の引数と返却値の仕様を表1～5に示す。'),
      table('表1　RadixConv',columns,[
        ['Frdx','整数型','変換元の数字列の基数（'+range(m0,'Frdx',m1)+'）'],['Fnum','文字型','変換元の数字列'],
        ['Trdx','整数型','変換後の数字列の基数（'+range(n0,'Trdx',n1)+'）'],['返却値','文字型','変換後のTrdx進数字列']])],
    [table('表2　MToInt',columns,[
      ['Rdx','整数型','変換元の数字列の基数（'+range(m0,'Rdx',m1)+'）'],['Num','文字型','変換元の数字列'],['返却値','整数型','変換後の整数']]),
      table('表3　IntToN',columns,[
        ['Val','整数型','変換元の整数'],['Rdx','整数型','変換後の数字列の基数（'+range(n0,'Rdx',n1)+'）'],['返却値','文字型','変換後のRdx進数字列']]),
      table('表4　ToInt',columns,[
        ['P','文字型','変換元の1文字の数字（“0”，“1”，…，“F”）'],['返却値','整数型','変換後の整数']]),
      table('表5　ToStr',columns,[
        ['Q','整数型','変換元の整数（0 ≦ Q ≦ 15）'],['返却値','文字型','変換後の1文字の数字']])],
    [p('〔プログラム〕'),code(program)],
    [p('設問　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      ...(print?[...bankBlocks('aに関する解答群',asCode(horner)),...bankBlocks('b～dに関する解答群',asCode(integerToDigits)),
        ...bankBlocks('eに関する解答群',asCode(compare))]:[])],
  ];
}
export const autumn2004Pm4=define(
  4,'数字列から整数を介する基数変換','a=ウ／b=オ／c=ア／d=ク／e=イ',
  '変換元と変換先の基数の許容範囲',
  '基数範囲を変換元と変換先それぞれで変更し、表の引数仕様も同期させる。',
  '桁の重み、0と1起点の添字、Codeの順序、余りと商、文字列連結及び共通擬似言語p2を保持する。',
  i=>{
    const {from,to}=radixCases[i];
    return {prompt:autumn2004Pm4Pages(i,false).flat(),contexts:[autumn2004PmReference('共通に使用される擬似言語の記述形式',refs)],
      ...answers([asCode(horner),asCode(integerToDigits),asCode(compare)],[
        single('a','a',0,2),single('b','b',1,4),single('c','c',1,0),single('d','d',1,7),single('e','e',2,1),
      ]),explanation:'変換元の基数は'+from.join('～')+'，変換先は'+to.join('～')+'。MToIntはそれまでに読んだ値を基数倍して次の桁を足す。'+
        'IntToNは整数を最初の商にして，余りの桁を結果の先頭へ置くたびに商を基数で割る。最後に残る商を最上位の桁にする。'+
        'ToIntは順番に並ぶCodeを引数の文字より小さい間だけ進め，文字が一致した添字を返す。'};
  },{answerVariation:'fixed',fixedReferenceAssetIds:refs.map(autumn2004PmPageAssetId)},
);
