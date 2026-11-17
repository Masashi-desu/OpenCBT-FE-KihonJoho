import { code,p } from './definition';
import { bank,draftQuestion,type Page } from './legacy-2006-autumn-pm-06-09-support';
import { drawing,exampleWidths } from './legacy-2006-autumn-pm-06-09-figures';
import { autumn2006PmReference } from './legacy-2006-autumn-pm-materials';

const firstOptions=['SLL   GR5,0,GR6','SLL   GR6,0,GR5','SRL   GR0,0,GR5','SRL   GR0,0,GR6','SRL   GR5,0,GR6','SRL   GR6,0,GR5'];
const secondOptions=['AND   GR6,0,GR1','AND   GR6,0,GR2','AND   GR7,0,GR1','AND   GR7,0,GR2','OR    GR5,GR6','OR    GR5,GR7','OR    GR7,GR5','OR    GR7,GR6'];

export const combining = [
  'COMBINE START',
  '        RPUSH',
  '        LD    GR0,0,GR1',
  '        LD    GR5,=16',
  '        SUBL  GR5,GR2         ; 16−m',
  '        ［a］                 ; ┐',
  '        SLL   GR0,0,GR5       ; ┘ 左側 m ビット以外のビットを 0 にする。',
  ';',
  '        LD    GR6,0,GR3',
  '        LD    GR7,=16',
  '        SUBL  GR7,GR4         ; 16−n',
  '        SRL   GR6,0,GR7',
  '        SUBL  GR5,GR4         ; 16−m−n',
  '        ［b］',
  '        OR    GR0,GR6',
  '        RPOP',
  '        RET',
  '        END',
].join('\n');

export const dividing = [
  'DIVIDE  START',
  '        RPUSH',
  '        LD    GR5,GR0',
  '        LD    GR6,=16',
  '        SUBL  GR6,GR2         ; 16−m',
  '        SRL   GR0,0,GR6',
  '        SLL   GR0,0,GR6',
  '        ST    GR0,0,GR1    ← α',
  ';',
  '        SUBL  GR6,GR4         ; 16−m−n',
  '        ［c］',
  '        LD    GR6,=16',
  '        SUBL  GR6,GR4         ; 16−n',
  '        SLL   GR5,0,GR6',
  '        ST    GR5,0,GR3    ← β',
  '        RPOP',
  '        RET',
  '        END',
].join('\n');

export const q9 = draftQuestion(9,'CASL II：上位ビット列の結合と分割','1語内のビット列長と残りの長さ','a=ウ b=イ c=オ d=ウ e=カ',
  '16ビット語、COMBINE・DIVIDE、m＋n≤16、アドレスとレジスタの割当て、α・βの二箇所の置換、残りを0にする場合と元のデータを保持する場合、5欄と二つの共通解答群を維持。図中では原問の記号 m・n に加え、狭い片側・16ビットを全て使う場合を含む長さの条件を変える。どの長さでも成立する命令を問う。CASL II仕様の必要部分のみを参照し、JIS文字コード表は使用しない。', (index,original)=>{
    const [m,n]=exampleWidths[index];
    const widthNote=index? 'ただし，m＋n≦16である。図の幅は m＝'+m+'，n＝'+n+' の例を示す。副プログラムは，条件を満たすほかの長さも処理する。':'ただし，m＋n≦16である。';
    const pages:Page[]=[
      {page:31,blocks:[
        p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラムの説明〕'),
        p('2語の中にあるビット列を結合してレジスタに設定する副プログラム COMBINE と，レジスタ中のビット列を分割して2語に格納する副プログラム DIVIDE である。'),
        p('（1）図1に COMBINE と DIVIDE のデータ形式と結果を示す。'+widthNote),
        drawing('9-word-format',index),
        p('（2）COMBINE は，GR1〜GR4 にそれぞれ次の内容が設定されて主プログラムから呼ばれる。'),
        p('GR1：C1 のアドレス'),p('GR2：C1 のビット列の長さ（m）'),
        p('GR3：C2 のアドレス'),p('GR4：C2 のビット列の長さ（n）'),
        p('（3）COMBINE は，結合した m＋n ビットを GR0 に左詰めで設定し，残りのビットには0を設定する。'),
        p('（4）DIVIDE は，GR0〜GR4 にそれぞれ次の内容が設定されて主プログラムから呼ばれる。'),
        p('GR0：分割するビット列'),p('GR1：D1 のアドレス'),
        p('GR2：D1 に格納するビット列の長さ（m）'),p('GR3：D2 のアドレス'),p('GR4：D2 に格納するビット列の長さ（n）'),
      ]},
      {page:32,blocks:[
        p('（5）DIVIDE は，D1 には m ビットを，D2 には n ビットをそれぞれ左詰めで格納し，残りのビットには0を格納する。'),
        p('（6）COMBINE 及び DIVIDE から戻るとき，汎用レジスタ GR1〜GR7 の内容は元に戻す。'),
        p('〔プログラム1〕'),code(combining,'casl2'),p('〔プログラム2〕'),code(dividing,'casl2'),
      ]},
      {page:33,blocks:[
        p('設問1　プログラム1及びプログラム2中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('設問2　次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('DIVIDE において，データを格納しない部分は元の内容を保持したままとするためには，プログラム2中のα，βの部分を次のように変更する必要がある。図2に変更後のデータ形式と結果を示す。'),
        drawing('9-keep-data',index),drawing('9-replacements',index),
      ],banks:[bank('abc',firstOptions,'ウイオ','casl2',1,'解答群'),bank('de',secondOptions,'ウカ','casl2',2,'解答群')],banksAfter:[1,5]},
    ];
    return {pages,contexts:[autumn2006PmReference('CASL IIの仕様',[55,56,57,58,59,60])],explanation:
      'a は C1 を右へ16−m移動する。直後の左シフトで右側が0になる。C2 の上位 n ビットは先に右詰めし，b で GR6 を左へ16−m−n移動して C1 の直後にそろえる。c は GR5 を右へ16−m−n移動して C2 の部分を右端に残す。続く左シフトにより n ビットが語の左端に移る。元のデータを保持するときは，d で D1 の残す下位部分だけを GR7 に取り出し，e で同様に取り出した D2 の下位部 GR7 を，既に上位 n ビットを収めた GR5 と論理和して格納する。'};
}, 'fixed');
