import type{GenerationDefinition,GeneratedBody}from'./definition';import{autumn2018Tuple}from'./legacy-2018-autumn-pm-input';import{p,selectedLanguageNotice,languageAnswers,languageDrawing,materialContexts,type LanguageFigure}from'./legacy-2018-autumn-language-common';
export const autumn2018Pm12Profiles=['legacy-2018-autumn-pm12-program','legacy-2018-autumn-pm12-bank']as const;
export const autumn2018Pm12Materials=[{id:'casl',title:'CASL IIの仕様（原物理p78〜83，p80は命令表上部のみ）',pages:[78,79,80,81,82,83]}];
export function autumn2018Pm12Input(values:number[]){const v=autumn2018Tuple(values,[[0,7]]);return{v,epoch:[1970,1972,1980,1999,2000,2099,2100,2399][v[0]]};}
export const autumn2018Pm12Leap=(y:number)=>y%4===0&&(y%100!==0||y%400===0)?1:0;
export function autumn2018Pm12Offset(values:number[],date:[number,number,number]){const {epoch}=autumn2018Pm12Input(values),[y,m,d]=date;if(!Number.isInteger(y)||y<epoch||y>32767||!Number.isInteger(m)||m<1||m>12||!Number.isInteger(d)||d<1||d>[31,28+autumn2018Pm12Leap(y),31,30,31,30,31,31,30,31,30,31][m-1])throw Error('PARAMETER_CONSTRAINT');let n=d-1;for(let month=1;month<m;month++)n+=[31,28+autumn2018Pm12Leap(y),31,30,31,30,31,31,30,31,30,31][month-1];for(let year=epoch;year<y;year++)n+=365+autumn2018Pm12Leap(year);return{days:n,word:n&65535,overflow:n>65535};}
export function autumn2018Pm12Boundary(values:number[],days:number){if(!Number.isInteger(days)||days<0||days>65536)throw Error('PARAMETER_CONSTRAINT');const {epoch}=autumn2018Pm12Input(values);let y=epoch,m=1,d=1,n=days;while(n>=365+autumn2018Pm12Leap(y)){n-=365+autumn2018Pm12Leap(y);y++;}const months=[31,28+autumn2018Pm12Leap(y),31,30,31,30,31,31,30,31,30,31];while(n>=months[m-1]){n-=months[m-1];m++;}d+=n;return[y,m,d]as[number,number,number];}
export const autumn2018Pm12Banks=[['LAD GR4,ACCMDAYS','LAD GR4,ACCMDAYS,GR3','LAD GR4,ACCMDAYS,GR5','LD GR4,ACCMDAYS','LD GR4,ACCMDAYS,GR3','LD GR4,ACCMDAYS,GR5'],['JMI BREAK','JNZ BREAK','JOV BREAK','JPL BREAK','JUMP BREAK','JZE BREAK'],['JMI FIN','JNZ FIN','JOV FIN','JUMP FIN','JZE FIN'],['AND GR0,=#FFFE','AND GR0,=1','OR GR0,=#FFFE','OR GR0,=1','XOR GR0,=#FFFF','XOR GR0,=1'],['8','13','18','19','20'],['JMI','JNZ','JOV','JPL','JZE']];
export function autumn2018Pm12Programs(values:number[]){const x=autumn2018Pm12Input(values);return[` 1 DAYOFFST START
 2          RPUSH
 3          LD    GR5,0,GR2       ; GR5: 年
 4          LD    GR3,1,GR2       ; GR3: 月
 5          LD    GR1,2,GR2       ; GR1: 日
 6          SUBL  GR1,=1         ; GR1で日数をカウント
 7          ［a］
 8          ADDL  GR1,-1,GR4     ; 1月1日からの日数（平年）を求める
 9          CPA   GR3,=3        ; 月が3月以降のときうるう年を考慮
10          JMI   SKIP
11          LD    GR2,GR5
12          CALL  LEAPYEAR
13          ADDL  GR1,GR0
14 SKIP     LD    GR2,=${x.epoch} ; ${x.epoch}年から（年−1）年までの間（ただし，
15 LOOP     CPA   GR2,GR5       ; 年>${x.epoch}），1年の日数を加算
16          ［b］
17          CALL  LEAPYEAR
18          ADDL  GR0,=365
19          ADDL  GR1,GR0
20          ADDA  GR2,=1
21          JUMP  LOOP
22 BREAK    LD    GR0,GR1
23 EXIT     RPOP
24          RET
25 ; ACCMDAYSは，平年の各月1日の1月1日からの日数（1月1日は0日目）
26 ACCMDAYS DC    0,31,59,90,120,151,181,212,243,273,304,334
27          END`,` 1 LEAPYEAR START
 2          RPUSH
 3          SUBA GR0,GR0
 4          LD   GR3,GR2
 5          AND  GR3,=3
 6          ［c］
 7          LD   GR3,=100
 8          CALL DIVISIBL
 9          ［d］
10          JNZ  FIN
11          LD   GR3,=400
12          CALL DIVISIBL
13 FIN      RPOP
14          RET
15          END`];}
export function autumn2018Pm12Figure(profile:string,values:number[]):LanguageFigure{const z=autumn2018Tuple(values,[[0,7],[0,5]]),v=z.slice(0,1),g=z[1];if(profile===autumn2018Pm12Profiles[0]&&g<2)return{kind:'program',caption:`〔プログラム${g+1}〕`,lineNumbersLabel:true,alt:'全行番号・ラベル・注釈・空欄を保持。GR1〜GR7は各副プログラムから戻る際復元。',text:autumn2018Pm12Programs(v)[g]};if(profile===autumn2018Pm12Profiles[1])return{kind:'bank',caption:`${'abcdef'[g]}に関する解答群`,alt:'全33択。文字コードやJIS表に依存しない数値/命令の選択肢。',columns:['記号','内容'],rows:autumn2018Pm12Banks[g].map((s,i)=>['アイウエオカ'[i],s])};throw Error('PARAMETER_CONSTRAINT');}
const draw=(kind:string,v:number[],g=0)=>{const m=autumn2018Pm12Figure(`legacy-2018-autumn-pm12-${kind}`,[...v,g]);return languageDrawing(12,kind,v,g,m.caption,m.alt);};
export const legacy2018AutumnPm12Definition:GenerationDefinition={source:'2018h30a-fe-pm-12',title:'日数の計算（アセンブラ）',version:'3.2.0',answerVariation:'fixed',fields:[{name:'基準年（原問題1970年）',minimum:0,maximum:7}],reference:[0],sourceAnswer:'イ・カ・イ・カ・エ・ウ',notes:'原本文4頁/2プログラム/6欄33択/全注記を保持。基準年8候補を起算日/年下限/年ループ/解説/日数境界へ同時bind。1970は原referenceのまま。4/100/400年規則/1970以降という役割の年下限/32767年上限/16bitunsigned0〜65535/65536以上OF/GR1〜GR7復元を固定。原にないcaller日付は公式reference入力にしない。Gregorian独立整数式で全8×65536日，16bit命令機で境界/全命令候補の反例とregister/OFを検査。CASL物理78〜83，p80upper1432×1240だけ（JIS1.3不含）を固定資料へ。文字コード依存は追加しない。',build(values):GeneratedBody{const x=autumn2018Pm12Input(values),v=x.v,boundary=autumn2018Pm12Boundary(v,65535),over=autumn2018Pm12Boundary(v,65536);return{prompt:[
 p("選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。"),
 p("問12 次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。"),
 p("〔プログラムの説明〕"),
 p(`${x.epoch}年1月1日（以下，基準日という）から，指定された日付までの日数を求める副プログラム群である。日付は，全て西暦（グレゴリオ暦）の日付であり，基準日以降でなければならない。`),
 p("(1) プログラム1は，基準日から指定された日付までの日数を計算する副プログラムDAYOFFSTである。日付は，GR2に設定されたアドレスから始まる連続した3語に，年，月，日を表す数値でこの順に格納され，誤りはないものとする。基準日を0日目とし，指定された日付までの日数を，符号のない数値（0〜65535）としてGR0に設定して呼出し元に戻る。ただし，日付は基準日から65535日目までの日付で与えられる。"),
 p("(2) プログラム2は，うるう年を判定する副プログラムLEAPYEARである。GR2に設定された年が平年の場合は0を，うるう年の場合は1を，GR0に設定して呼出し元に戻る。年が平年であるか，うるう年であるかの判定は，次の順で行う。"),
 p("① 年が4で割り切れない場合，平年とする。"),
 p("② 年が4で割り切れ，かつ100で割り切れない場合，うるう年とする。"),
 p("③ 年が400で割り切れる場合，うるう年とする。"),
 p("④ ①〜③のいずれでも決定しなかった場合，平年とする。"),
 p("(3) 副プログラムDIVISIBLは，GR2に設定された整数値がGR3に設定された整数値で割り切れる場合は1を，割り切れない場合は0を，GR0に設定して呼出し元に戻る。このプログラムのソースコードは，省略する。"),
 p("(4) 各副プログラムから戻るとき，汎用レジスタGR1〜GR7の内容は元に戻す。"),
 draw('program',v,0),
 draw('program',v,1),
 p("設問1 プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。"),
 draw('bank',v,0),
 draw('bank',v,1),
 draw('bank',v,2),
 draw('bank',v,3),
 p("設問2 次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。"),
 p("副プログラムDAYOFFSTに，基準日から65536日目以降32767年12月31日までの日付を与えた場合には，あふれが発生し，正しい結果を返すことができない。あふれが発生したことを呼出し元に通知するために，フラグレジスタFRのOFが1の状態で呼出し元に戻るようにしたい。このためには，プログラム1の行番号［e］の行の直後に，［f］命令を挿入し，ラベルEXITの行に分岐する必要がある。"),
 draw('bank',v,4),
 draw('bank',v,5)
],contexts:materialContexts(12,autumn2018Pm12Materials),...languageAnswers(autumn2018Pm12Banks,[1,5,1,5,3,2].map((answer,i)=>({id:'abcdef'[i],bank:i,label:`設問${i<4?1:2} ${'abcdef'[i]}`,answer}))),explanation:`aはACCMDAYSに月の添字GR3を加えたアドレスをGR4へLADで設定する。次行の-1補正と合わせ平年の月初累積日数を読む。bは年ループが指定年と等しいときJZE BREAK。cはANDで得た年の下位2bitが非0ならJNZ FIN。dは100で割り切れる結果1を0へ，割り切れない0を1へXOR GR0,=1で反転し，非0ならFINへ分岐してうるう年の1を返す。400で割り切れる世紀年だけ最終的に1を返す。日数累計へ1年分をADDLする19行が16bit桁あふれを起こすので，その直後JOV EXITでOFを失う前に戻る。${x.epoch}年1月1日を0日とする65535日目は${boundary[0]}年${boundary[1]}月${boundary[2]}日，65536日目は${over[0]}年${over[1]}月${over[2]}日である。独自解説。`};}};
