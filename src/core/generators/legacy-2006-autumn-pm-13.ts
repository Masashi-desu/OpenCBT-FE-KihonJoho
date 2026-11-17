import { code, p } from './definition';
import { autumn2006PmPageAssetId, autumn2006PmReference } from './legacy-2006-autumn-pm-materials';
import { bank, createLanguageDefinition, languageFigure, page, standaloneBank } from './legacy-2006-autumn-pm-10-13-support';

const examples=[
  { source:'1011001110010001',prefix:5, pattern:'011100', replacement:'110010', m:5 },
  { source:'0101011100100111',prefix:3, pattern:'101110', replacement:'110001', m:3 },
  { source:'1011110100100010',prefix:4, pattern:'11010', replacement:'00110', m:6 },
  { source:'1101100011100100',prefix:8, pattern:'11100', replacement:'01010', m:7 },
];
const situations=[
  { data:'0001110100111001', find:'0111', replace:'1001' },
  { data:'1010101110101011', find:'10101', replace:'00111' },
  { data:'1100110011001100', find:'11', replace:'01' },
  { data:'0101010101010101', find:'0101010101010101', replace:'1010101010101010' },
];
const bits=(s:string)=>[...s].join(' ');
export const q13Replacement=languageFigure(13,'replacement','ビット列Bに一致した部分をビット列Cに置き換える例',i=>{
  const {source,prefix,pattern,replacement}=examples[i], width=pattern.length;
  const found=source.indexOf(pattern);
  const target=source.slice(0,found)+replacement+source.slice(found+width);
  if(found!==prefix) throw Error('SOURCE_FORMAT');
  return {kind:'bits',source,target,width,prefix,pattern,replacement,
    alt:'ビット列A：'+bits(source)+'。ビット列B：'+bits(pattern)+'。ビット列C：'+bits(replacement)+
      '。n＝'+width+'。Aの左から'+(prefix+1)+'ビット目からの'+width+'ビットがBと一致するので，そこをCに置換する。置換後：'+bits(target)+'。'};
});
export const q13Rotation=languageFigure(13,'rotation','16ビットを左に循環シフトする例',i=>{
  const {source,m}=examples[i], target=source.slice(m)+source.slice(0,m);
  return {kind:'bits',source,target,width:m,prefix:0,alt:'左循環シフト前：'+bits(source)+'。m＝'+m+
    '。先頭'+m+'ビットは右端に戻し，残りは左にシフトする。シフト後：'+bits(target)+'。'};
});
const first=`BREP    START
        RPUSH
        LD     GR5,=16     ; 未検査ビット数の初期化
        LD     GR6,=#8000  ; マスクの作成 ┐
        SRA    GR6,-1,GR4  ;                 ┘
LOOP    LD     GR7,0,GR1   ; GR7 ← ビット列A
        ［a］              ; 左端nビット以外を0にする。
        CPL    GR7,GR2     ; 左端nビットとビット列Bを比較
        JZE    MATCH       ; 一致
        LD     GR0,=1      ; 左循環シフトするビット数
        JUMP   CONT
MATCH   LD     GR7,0,GR1   ; GR7 ← ビット列A
        SLL    GR7,0,GR4   ; 左端nビットを0にする。┐
        SRL    GR7,0,GR4   ;                        ┘
        ［b］              ; ビット列Cを左端nビットに設定
        ST     GR7,0,GR1   ; 元の領域に戻す。
        LD     GR0,GR4     ; 左循環シフトするビット数
CONT    CALL   ROTSL       ; ビット列Aを左循環シフト
        SUBA   GR5,GR0     ; 未検査ビット数の更新
        CPA    GR5,GR4     ; 未検査ビット数とnを比較
        ［c］              ; n未満であれば終了処理へ
        JUMP   LOOP
FIN     LD     GR0,GR5     ; 未検査ビット数
        CALL   ROTSL       ; ビット位置を元に戻す。
        RPOP
        RET
;`;
const second=`ROTSL   RPUSH
        LD     GR3,GR0     ; GR3 ← m
        LD     GR4,=16
        SUBA   GR4,GR3     ; GR4 ← (16−m)
        LD     GR5,0,GR1
        LD     GR6,GR5
        SLL    GR5,0,GR3
        ［d］              ; はみ出すビット列
        OR     GR5,GR6     ; はみ出すビット列を右端に設定
        ST     GR5,0,GR1   ; 元の領域に戻す。
        RPOP
        RET
        END`;

const refs=[55,56,57,58,59,60], callOptions=['2','6','8','12','16'];
export const q13=createLanguageDefinition(13,'CASL II：ビット列の置換と左循環シフト','ビット列とパターン長','abcd2',
  'イウアエウ','置換・循環の図とCASL IIの原形式を保持。左端からの照合、置換後の飛越し、最後の位置復帰を含めて入力と設問2を可変化。',i=>{
    const {data,find,replace}=situations[i];
    let j=0;
    const shifts:number[]=[];
    while(j+find.length<=16) {
      const step=data.startsWith(find,j)?find.length:1;
      shifts.push(step);
      j+=step;
    }
    shifts.push(16-j);
    const index=callOptions.indexOf(String(shifts.length)), key='アイウエオ'[index];
    if(!key) throw Error('SOURCE_FORMAT');
    return {pages:[
      page(48,[
        p('次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラムの説明〕'),
        p('（1）副プログラムBREPは，16ビットからなるビット列Aの中に，nビットのビット列Bと一致する部分ビット列があれば，それをnビットのビット列Cに置き換えるプログラムである。'),
        q13Replacement.block(i),
        p('① GR1〜GR4にはそれぞれ次の内容を設定して，主プログラムから渡される。\nGR1：ビット列Aを格納している語のアドレス\nGR2：ビット列B（左詰めで設定され，残りのビットには0が設定されている。）\nGR3：ビット列C（左詰めで設定され，残りのビットには0が設定されている。）\nGR4：n（1≦n≦16）'),
        p('② ビット列Aの中にビット列Bに一致する部分ビット列が複数個あれば，それらのすべてをビット列Cに置き換える。'),
        p('③ ビット列Aの左端から検索する。ビット列Bと一致する部分ビット列をビット列Cに置き換えた場合，その部分ビット列の右隣のビットから検索を続ける。'),
        p('④ 副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        p('（2）副プログラムROTSLは，16ビットからなるビット列をmビットだけ左に循環シフトするプログラムである。'),
      ],undefined,undefined),
      page(49,[
        q13Rotation.block(i),
        p('① GR0とGR1にはそれぞれ次の内容を設定して，主プログラムから渡される。\nGR0：m（0≦m≦16）\nGR1：ビット列を格納している語のアドレス'),
        p('② 副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。'),
        p('〔プログラム〕'),code(first,'casl2'),
      ]),
      page(50,[code(second,'casl2'),p('設問1 プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')],[
        bank(1,'ab',['AND   GR7,GR3','AND   GR7,GR6','OR    GR7,GR3','OR    GR7,GR6'],'イウ','casl2'),
        bank(1,'c',['JMI   FIN','JNZ   FIN','JPL   FIN','JZE   FIN'],'ア','casl2'),
        bank(1,'d',['SLL   GR6,0,GR3','SLL   GR6,0,GR4','SRL   GR6,0,GR3','SRL   GR6,0,GR4'],'エ','casl2'),
      ]),
      page(51,[
        p('設問2 次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('主プログラムから渡されたビット列A，B，C及びnが次のとおりであったとき，副プログラムBREPは副プログラムROTSLを［　］回呼び出す。'),
        code('ビット列A：  '+data+'\nビット列B：  '+find+'\nビット列C：  '+replace+'\n         n：  '+find.length,'text'),
      ],[standaloneBank(2,callOptions,key)]),
    ],contexts:[autumn2006PmReference('アセンブラ言語の仕様（文字の符号表を除く）',refs)],
    explanation:'aはマスクとのANDで左端nビットだけを残す。bは左端nビットを0にした後，ORで置換値を入れる。cは未検査ビット数がnより小さいときの分岐。'+
      'dで元の語を右に16−mビットずらし，左へはみ出したビットを右端へ戻す。設問2のシフト数は順に'+shifts.join('，')+
      'で，最後の位置復帰も1回に数えて合計'+shifts.length+'回になる。'};
  },{fixedReferenceAssetIds:refs.map(autumn2006PmPageAssetId)});
