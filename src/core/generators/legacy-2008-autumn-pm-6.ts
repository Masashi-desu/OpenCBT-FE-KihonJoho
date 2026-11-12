import {code,p,table} from './definition';
import {bank,createDefinition,selectionInstruction} from './legacy-2008-autumn-pm-06-09-support';

const conversionCases=[
  {radix:10,group:3,separator:',',examples:[1234567,-57482,63,-999999]},
  {radix:8,group:3,separator:'_',examples:[34272,-65535,7,-1000000]},
  {radix:16,group:3,separator:':',examples:[74565,-43981,15,-16777215]},
  {radix:10,group:4,separator:'_',examples:[123456789,-5708421,600,-99990000]},
] as const;
function example(value:number,radix:number,group:number,separator:string) {
  const magnitude=Math.abs(value).toString(radix).toUpperCase();
  const pieces=[];
  for(let end=magnitude.length;end>0;end-=group) pieces.unshift(magnitude.slice(Math.max(0,end-group),end));
  return (value<0?'-':'')+pieces.join(separator);
}
export function convertProgram(index:number) {
  const {radix,separator}=conversionCases[index];
  const digitTable='0123456789ABCDEF'.slice(0,radix);
  return String.raw`void convert(long, char[]);

void convert(long num, char str[]){
   int minus = 0, i = 0, j = 0;
   char table[] = "${digitTable}";
   char tmp;

   if(num < 0){
      minus = 1;
      num = -num;
   }

   do{
      str[j++] = table[num % ${radix}];   /* 数値の下位から順に文字に変換 */
      num ［a］;
      i++;
      if(［b］ == 0 && num != 0){
         str[j++] = '${separator}';
      }
   }while(num != 0);

   if(minus != 0){
      str[j++] = '-';
   }
   str[j--] = '\0';

   for(i = 0; ［c］){               /* 順序を逆にする。 */
      tmp = str[i];
      str[i] = str[j];
      str[j] = tmp;
   }
}`;
}
export const q6=createDefinition(6,'C：整数を区切り形式の文字列に変換','基数・区切り位置・区切り文字',
  'aオ bオ cエ',
  '符号の退避、下位からの抽出、数値が残る場合の区切り、末尾のヌル文字と逆順化、9けた以下・格納領域確保の前提を維持する。基数、区切り幅、文字と変換例を連動させる。',
  index=>{
    const {radix,group,separator,examples}=conversionCases[index];
    const intro=index===0?'金額を表すときのように，整数を3けた区切り形式の文字列に変換する関数 convert である。':
      '整数の絶対値を'+radix+'進表記に直し，'+group+'けた区切り形式の文字列に変換する関数 convert である。入力例の整数は10進表記で示し，変換後の数字にはプログラムの table に示す文字を用いる。';
    const groups=['(i + 1)','(i + 2)','(j + 1)','(j + 2)','i','j'].map(term=>term+' % '+group);
    return {
      pages:[
        {number:24,sourceOnlyBefore:selectionInstruction,blocks:[
          p('問6　次のCプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕'),p(intro),
          p('(1) 次のルールに基づいて変換を行う。'),
          p('① 整数値が負の場合，先頭にマイナス符号を付ける。'),
          p('② 数値の下位から'+group+'けたごとに'+(separator===','?'コンマ':'区切り文字「'+separator+'」')+'を挿入する。変換例を表に示す。'),
          table('表　変換例',['整数',group+'けた区切り形式の文字列'],examples.map(value=>[String(value),example(value,radix,group,separator)])),
          p('(2) プログラム中で定義されている関数の仕様は，次のとおりである。'),
          code('void convert(long num, char str[]);','c'),
          p('引数：整数 num，変換後の文字列 str[]'),
          p('返却値：なし'),
          p('機能：整数 num を'+group+'けた区切り形式の文字列に変換して str[] に先頭から格納する。str[] には変換後の文字列を格納するのに十分な領域が確保されているものとする。また，整数 num は'+(index===0?'':'10進表記で')+'9けた以下とする。'),
        ]},
        {number:25,blocks:[p('〔プログラム〕'),code(convertProgram(index),'c')]},
        {number:26,blocks:[p('設問　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')],banks:[
          bank('a',['%= '+radix,'*= -1','*= -'+radix,'*= '+radix,'/= '+radix],'オ','c',undefined,'aに関する解答群'),
          bank('b',groups,'オ','c',undefined,'bに関する解答群'),
          bank('c',['i != j; i++','i != j; i++, j--','i < j; i++','i < j; i++, j--'],'エ','c',undefined,'cに関する解答群'),
        ]},
      ],
      explanation:[
        'a：余り num % '+radix+' を対応する文字へ変換した後，整数除算 num /= '+radix+' で処理済みの最下位桁を取り除く。',
        'b：i は処理済みの桁数，j は区切り文字も含めた格納文字数。i が '+group+' の倍数で，まだ数値が残るときだけ区切る。',
        'c：符号を末尾に追加し，ヌル文字は動かさず，i を右へ，j を左へ移動しながら二つの文字を交換する。i < j で止めると偶数長でも交差を越えない。',
      ].join('\n'),
    };
  });
