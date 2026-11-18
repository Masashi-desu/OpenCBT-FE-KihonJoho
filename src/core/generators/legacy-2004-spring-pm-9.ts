import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2004-spring-pm-06-09-support';
import { spring2004PmReference } from './legacy-2004-spring-pm-materials';

const parityCases=[
  {odd:false,word:0xA010},{odd:true,word:0xBC01},{odd:false,word:0x9045},{odd:true,word:0xA006},
];
const firstOptions=['AND   GR1,=1','AND   GR2,=1','SLL   GR1,1','SLL   GR2,1','SRL   GR1,1','SRL   GR2,1'];
const secondOptions=['AND   GR1,=#8000','OR    GR1,=#4000','XOR   GR1,=#8000','SLL   GR1,1','SRL   GR1,1'];
const hex=(word:number)=>'#'+word.toString(16).toUpperCase().padStart(4,'0');

export const q9=draftQuestion(9,'CASL IIでパリティビットを設定する','偶数・奇数の方式と元のGR1に入っている16ビット','イエウ',
  'GR1の0〜14番のデータ、15番のパリティ、GR2の退避と復元、SRL後のFRを保持。パリティ方式そして誤って1が入ったときの初期語を変え、カウンタ初期値と候補の数値を同期する。',index=>{
  const {odd,word}=parityCases[index];
  const type=odd?'奇数':'偶数', other=odd?'偶数':'奇数';
  const low=word&0x7FFF, left=(word*2)&0xFFFF, right=word>>>1;
  const values=[low,left,right,word,left|0x8000,right|0x8000].sort((a,b)=>a-b);
  const valueKey='アイウエオカ'[values.indexOf(word)];
  const program=`EPAR  START
      PUSH  0,GR2
      ST    GR1,TMP
      LAD   GR2,${odd?1:0}         ; カウンタの初期化
LP1   PUSH  0,GR1
      AND   GR1,=1
      JZE   NCNT
      ADDL  GR2,=1
NCNT  POP   GR1
      SRL   GR1,1
      JNZ   LP1
      LD    GR1,TMP
      [s]
      JZE   FIN
      OR    GR1,=#8000    ; ◀ α
FIN   POP   GR2
      RET
TMP   DS    1
      END`;
  return {
    pages:[
      {page:39,blocks:[
        p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラムの説明〕'),
        p(type+'パリティを設定する副プログラム EPAR である。'),
        p('（1）EPAR は，GR1中の1であるビットの個数が全体として'+type+'となるように，GR1のビット番号15にパリティビットを設定する。'),
        p('すなわち，GR1のビット番号0〜14の中で1であるビットの個数が'+other+'ならば1を，'+type+'ならば0をビット番号15に設定する。'),
        p('（2）主プログラムは，GR1のビット番号0〜14にビットデータ列を，ビット番号15に0を設定して EPAR を呼ぶ。'),
        p('（3）副プログラムから戻るとき，GR2の内容は元に戻す。'),
        p('〔プログラム〕'),code(program,'casl2'),
      ]},
      {page:40,blocks:[
        p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      ],banks:[bank('s',firstOptions,'イ','casl2',1,'解答群')]},
      {page:40,blocks:[
        p('設問2　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('誤ってGR1のビット番号15が1に設定されて主プログラムから呼ばれたとき，この副プログラムは正しい結果を返さない場合がある。GR1に'+hex(word)+'が設定されて呼ばれた場合，主プログラムに戻るときのGR1の内容は［a］となる。'),
        p('GR1のビット番号15が1に設定されて主プログラムから呼ばれた場合でも，ビット番号15にパリティビットが正しく設定されるようにしたい。このためには，αで示される1行を［b］と修正すればよい。'),
      ],banks:[bank('a',values.map(hex),valueKey,'casl2',2),bank('b',secondOptions,'ウ','casl2',2)]},
    ],
    contexts:[spring2004PmReference('アセンブラ言語の仕様',[60,61,62,63,64,65])],
    explanation:'GR1を右にシフトしながら各ビットを数える。'+(odd?'カウンタを1から始めると，入力中の1が偶数のとき判定の下位ビットが1。':'カウンタを0から始めるので，入力中の1が奇数のとき判定の下位ビットが1。')+
      'AND GR2,=1でこの下位ビットを調べ，0なら元のデータをそのまま返す。元のビット15が1なら，ORで同じ位置の1を設定しても結果は'+hex(word)+'のまま。XORなら必要な場合だけビット15が反転し，下位15ビットを保ったまま'+type+'パリティにできる。',
  };
},'fixed');
