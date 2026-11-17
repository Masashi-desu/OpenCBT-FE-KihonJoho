import { code, p } from './definition';
import { spring2007PmReference } from './legacy-2007-spring-pm-materials';
import { bank, draftQuestion } from './legacy-2007-spring-pm-06-09-support';
import { drawing, groupedBits } from './legacy-2007-spring-pm-06-09-figures';
import { bitExamples, registerExamples, symmetryCases } from './legacy-2007-spring-pm-06-09-model';

const listing=` 1  SYMTST  START
 2          RPUSH
 3          LD    GR3,=8
 4          LD    GR2,GR1
 5  LOOP    SLL   GR1,1
 6          JOV   OFLOW
 7          SRL   GR2,1   ; 右端のビットは1か？
 8          JOV   NG      ; 1であれば左右対称でない。
 9          JUMP  OK
10  OFLOW   SRL   GR2,1
11          ［a］
12  NG      LD    GR0,=0  ; 左右対称でない。
13          JUMP  FIN
14  OK      SUBA  GR3,=1
15          ［b］
16          LD    GR0,=1  ; 左右対称である。
17  FIN     RPOP
18          RET
19          END`;
const branches=['JMI   LOOP','JOV   NG','JOV   OFLOW','JOV   OK','JPL   LOOP','JZE   LOOP'];
export const q9 = draftQuestion(9,'CASL II：左右のビットを比較して対称性を調べる',
  '対称ビット列と非対称箇所','設問1 aエ bオ／設問2 イ／設問3 ウ',
  '16ビットの8組をシフト時のOFで比較し，対称性をGR0へ設定してGR1〜GR7を復元する。左右対称の例と1組だけ異なる例を変え，設問2の残りビットと設問3の行番号10の実行回数を更新する。JIS文字符号は使用しない。',
  index => {
    const {half,mismatch}=symmetryCases[index];
    const {symmetric}=bitExamples(index);
    const right=Number.parseInt(symmetric,2)>>>8;
    const count=[...half.slice(0,mismatch)].filter(bit=>bit==='1').length;
    return {
      pages:[
        {page:32,blocks:[
          p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
          p('〔プログラムの説明〕'),
          p('副プログラムSYMTSTは，16ビットからなるビット列が左右対称かどうかを検査するプログラムである。図に左右対称なビット列の例を示す。'),
          drawing('9-symmetric',index),
          p('(1) ビット列はGR1に設定されて，主プログラムから渡される。'),
          p('(2) ビット列が左右対称であればGR0に1を，そうでなければ0を設定して主プログラムに返す。'),
          p('(3) 副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
          p('〔プログラム〕'),p('（行番号）'),code(listing,'casl2'),
        ]},
        {page:33,banksAfter:[1,2,4],blocks:[
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　ビット列が図のとおりであった場合，行番号17のマクロ命令RPOPの実行直前におけるGR2の内容として正しい答えを，解答群の中から選べ。'),
          p('設問3　ビット列が次のとおりであった場合（▲で示されるビットが左右対称ではない場合），行番号10のSRL命令は何回実行されるか。正しい答えを，解答群の中から選べ。'),
          drawing('9-asymmetric',index),
        ],banks:[
          bank('ab',branches,'エオ','casl2',1,'解答群'),
          bank('s',registerExamples(index).map(groupedBits),'イ','text',2,'解答群'),
          bank('t',['1','2','3','4'],'アイウエ'[count-1],undefined,3,'解答群'),
        ]},
      ],
      contexts:[spring2007PmReference('CASL IIの仕様',[55,56,57,58,59,60])],
      explanation:[
        'a：左端が1だった場合，OFLOWで右端をシフトした結果もOF=1ならこの1組は一致する。JOV OKで一致の処理へ進む。',
        'b：一致して残りの組数を1減らし，正の間はJPLで次の組へ進む。0なら全8組が一致した。',
        '設問2：対称なときは論理右シフトを計8回行う。RPOP直前では上位8ビットは0，下位8ビットは元の上位8ビット' + right.toString(2).padStart(8,'0') + 'である。',
        '設問3：不一致の' + mismatch + '組目までで左側から取り出した' + half.slice(0,mismatch) +
          'に1が' + count + '個ある。左が1なら行番号10へ分岐するので，その命令を' + count + '回実行する。',
      ].join('\n'),
    };
  });
