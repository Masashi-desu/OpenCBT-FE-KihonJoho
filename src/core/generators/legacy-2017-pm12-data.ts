export const legacy2017Pm12AddProgram=[
'ADD64   START','        RPUSH','        LD    GR0,=0','        LAD   GR3,3,GR1','        LAD   GR4,3,GR2','LOOP    LD    GR5,=0','        ADDL  GR0,0,GR3','        JOV   OV1','        JUMP  NOV1','OV1     [a]','NOV1    ADDL  GR0,0,GR4','        JOV   OV2','        JUMP  NOV2','OV2     [a]','NOV2    ST    GR0,0,GR3','        LD    GR0,GR5','        [b]','        JZE   EXIT','        SUBL  GR3,=1','        SUBL  GR4,=1','        [c]','EXIT    RPOP','        RET','        END',
];
export const legacy2017Pm12MulProgram=`MUL32    START
         RPUSH
         LAD   GR7,TEMP       ; 初期化
         LD    GR0,0,GR1      ; GR1から始まる2語の領域の値を、
         ST    GR0,2,GR7      ; TEMPから始まる4語の領域のうちの
         LD    GR0,1,GR1      ; 下位2語に格納
         ST    GR0,3,GR7
         LD    GR0,=0
         ST    GR0,0,GR7      ; TEMPから始まる4語の領域のうちの
         ST    GR0,1,GR7      ; 上位2語に0を格納
         ST    GR0,0,GR3      ; GR3から始まる4語の領域に0を格納
         ST    GR0,1,GR3
         ST    GR0,2,GR3
         ST    GR0,3,GR3
         LD    GR5,=0         ; ループカウンタ
         LD    GR4,GR2        ; GR2の値をGR4に退避
LOOP     LD    GR6,GR5
         SUBL  GR6,=16
         [e]
         LD    GR0,0,GR2
         SRL   GR0,0,GR6
         JUMP  TESTBIT
LOWORD   LD    GR0,1,GR2
         SRL   GR0,0,GR5
TESTBIT  AND   GR0,=#0001
         JZE   EXITLOOP
         LD    GR1,GR3
         LAD   GR2,TEMP
         CALL  ADD64
EXITLOOP CPL   GR5,=31
         JZE   EXIT
         ADDL  GR5,=1
         LAD   GR1,TEMP
         [f]
         CALL  ADD64
         LD    GR2,GR4        ; GR4に退避した値をGR2に復帰
         JUMP  LOOP
EXIT     RPOP
         RET
TEMP     DS    4
         END`;
const conditions=[
 [[0x3f1d,0xb759,0x2e0c,0xa684],[0x2e0c,0xa684,0x3f1d,0xb759]],
 [[0x3f1d,0xb759,0x2e0c,0x1684],[0x2e0c,0xa684,0x3f1d,0x2759]],
 [[0x1234,0x7ffe,0x2345,0xfffe],[0x2345,0x1234,0x4567,0x0005]],
 [[0x2345,0x3456,0x4567,0x0005],[0x1111,0x2222,0x6789,0xff00]],
 [[0x0001,0xffff,0x1357,0x8000],[0x0002,0x0000,0x2468,0x8000]],
 [[0x0000,0x1234,0x2468,0x7fff],[0x0000,0xabcd,0x3579,0x8000]],
 [[0x3000,0x4567,0x3456,0xf000],[0x1000,0x6789,0x4567,0x1000]],
 [[0x1111,0x2222,0x4568,0x0100],[0x2222,0x3333,0x5678,0x0200]],
];
export const legacy2017Pm12Hex=(n:number)=>'#'+n.toString(16).toUpperCase().padStart(4,'0');
export function legacy2017Pm12Model(value:number){
 if(!Number.isSafeInteger(value)||value<0||value>7)throw Error('PARAMETER_CONSTRAINT');
 const [left,right]=structuredClone(conditions[value]);
 const lowTotal=left[3]+right[3],carry=lowTotal>65535?1:0,trace=left[2]+carry;
 return{left,right,carry,lowResult:lowTotal%65536,trace,d:[0,1,left[2],left[2]+1,right[2],right[2]+1]};
}
export const legacy2017Pm12Ab=['AND GR5,=1','CPL GR3,=0','CPL GR3,GR1','CPL GR3,GR2','LD GR5,=1'];
export const legacy2017Pm12C=['JOV LOOP','JUMP LOOP','JZE LOOP'];
export const legacy2017Pm12Ef=['JMI LOWORD','JNZ LOWORD','JPL LOWORD','JZE LOWORD','LAD GR2,TEMP','LD GR2,=1','LD GR2,GR3','LD GR2,TEMP'];
export const legacy2017Pm12Profiles=['legacy-2017-pm12-storage64','legacy-2017-pm12-values','legacy-2017-pm12-storage32','legacy-2017-pm12-ab-bank','legacy-2017-pm12-c-bank','legacy-2017-pm12-d-bank','legacy-2017-pm12-ef-bank','legacy-2017-pm12-program-add64','legacy-2017-pm12-program-mul32'] as const;
/** Original side-note groups, with statement rows counted from START as row 1. */
export const legacy2017Pm12MulNotes=[
 {start:3,end:3,lines:['初期化']},
 {start:4,end:7,lines:['GR1から始まる2語の領域の値を、','TEMPから始まる4語の領域のうちの','下位2語に格納']},
 {start:9,end:10,lines:['TEMPから始まる4語の領域のうちの','上位2語に0を格納']},
 {start:11,end:14,lines:['GR3から始まる4語の領域に0を格納']},
 {start:15,end:15,lines:['ループカウンタ']},
 {start:16,end:16,lines:['GR2の値をGR4に退避']},
 {start:36,end:36,lines:['GR4に退避した値をGR2に復帰']},
];
export const legacy2017Pm12MaterialAssetIds=[72,73,74,75,76,77].map(n=>`asset-ipa-2017h29h-fe-pm-12-p${n}${n===74?'-instructions':''}`);
export function legacy2017Pm12Figure(profile:string,values:number[]){
 if(values.length!==1||!legacy2017Pm12Profiles.includes(profile as typeof legacy2017Pm12Profiles[number]))throw Error('PARAMETER_CONSTRAINT');
 const m=legacy2017Pm12Model(values[0]),i=legacy2017Pm12Profiles.indexOf(profile as typeof legacy2017Pm12Profiles[number]);
 const captions=['図1 64ビット符号なし整数の主記憶への格納方法','図2 主記憶に格納した値','図3 32ビット符号なし整数の主記憶への格納方法','a、bに関する解答群','cに関する解答群','dに関する解答群','e、fに関する解答群','プログラム1','プログラム2'];
 const bank=[legacy2017Pm12Ab,legacy2017Pm12C,m.d.map(legacy2017Pm12Hex),legacy2017Pm12Ef][i-3];
 const programAlt=i===7?'ADD64の原行1〜24。aは行10と14、bは行17、cは行21の矩形空欄。'+legacy2017Pm12AddProgram.map((s,j)=>`${j+1}行 ${s}`).join('\n'):i===8?'MUL32の全41行。矩形空欄eとf。右側注記の括弧は行4〜7、9〜10、11〜14。'+legacy2017Pm12MulProgram:'';
 return{caption:captions[i],alt:i>=7?programAlt:i>=3?captions[i]+'。'+bank.map((s,j)=>'アイウエオカキク'[j]+' '+s).join('。'):[
 'N、N＋1、N＋2、N＋3番地の4語に、最上位、第2位、第3位、最下位の16ビットをこの順で格納。',
 'GR1の指す番地から4語は'+m.left.map(legacy2017Pm12Hex).join('、')+'。GR2の指す番地から4語は'+m.right.map(legacy2017Pm12Hex).join('、')+'。',
 'N、N＋1番地の2語に、上位、下位の16ビットをこの順で格納。',
 ][i],model:m,bank};
}
