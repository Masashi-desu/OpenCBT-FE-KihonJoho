/** Source-local display data. No execution engine or third-party chart is shipped. */
export const legacy2018SpringPm12Profiles=['legacy-2018-spring-pm12-program','legacy-2018-spring-pm12-bank','legacy-2018-spring-pm12-figure','legacy-2018-spring-pm12-instruction','legacy-2018-spring-pm12-unicode-reference'] as const;
const examples=[
 {dto:567,nums:[1234,56789,9876],lead:2,gaps:[1,3],tail:1},
 {dto:123,nums:[2345,45678,8765],lead:0,gaps:[2,1],tail:0},
 {dto:209,nums:[3456,34567,7654],lead:1,gaps:[1,2],tail:2},
 {dto:804,nums:[4567,23456,6543],lead:3,gaps:[3,1],tail:1},
 {dto:910,nums:[5678,12345,5432],lead:0,gaps:[1,3],tail:3},
 {dto:999,nums:[6789,54321,4321],lead:1,gaps:[2,2],tail:0}
];
export function legacy2018SpringPm12Model(values:readonly number[]) {
 if(values.length!==2||values.some((n,i)=>!Number.isSafeInteger(n)||n<0||n>[1,5][i]))throw Error('PARAMETER_CONSTRAINT');
 const flag=values[0],e=examples[values[1]],text=' '.repeat(e.lead)+e.nums.map((n,i)=>(i?' '.repeat(e.gaps[i-1]):'')+n).join('')+' '.repeat(e.tail)+'.';
 return {flag,idle:flag===0?-1:0,active:flag===0?0:-1,...e,text,cIndex:flag===0?1:4};
}
export const legacy2018SpringPm12Banks=[
 ['ADDL GR5,GR4','SLL GR4,1','SLL GR4,2','SLL GR5,1','SLL GR5,2'],
 ['JNZ FIN','JNZ LP','JNZ NUM','JZE FIN','JZE LP','JZE NUM'],
 ['JNZ FIN','JNZ FIN2','JNZ NUM','JZE FIN','JZE FIN2','JZE NUM'],
 ['LAD GR6,1,GR1','LAD GR6,1,GR6','LAD GR7,1,GR2','LAD GR7,1,GR7','LD GR6,GR1','LD GR7,GR2'],
 ['JMI FIN','JMI NEXT','JPL FIN','JPL NEXT','JZE FIN','JZE NEXT'],
 ['ADDL GR0,GR5','ADDL GR5,GR4','LD GR5,GR4','SLL GR5,1','SRL GR5,1']
] as const;
export function legacy2018SpringPm12Programs(values:readonly number[]) {const m=legacy2018SpringPm12Model(values);return [
`DTOB    START
        RPUSH
        ADDL GR2,GR1
        LAD GR0,0         ; 戻り値の初期化
LP      CPL GR1,GR2       ; 変換終了？
        JZE FIN
        LD GR4,0,GR1      ; 数字1文字の取出し
        SUBL GR4,='0'     ; 1桁を数値に変換
        SLL GR0,1         ; GR0を10倍してGR4を加算
        LD GR5,GR0
        [a]
        ADDL GR0,GR5
        ADDL GR0,GR4
        LAD GR1,1,GR1
        JUMP LP
FIN     RPOP
        RET
        END`,
`GETWD   START
        RPUSH
        LD GR6,GR1
        LD GR7,GR2
        LD GR3,=${m.idle}       ; 数字列の処理状態フラグの初期化（未処理=${m.idle}）
        LAD GR6,-1,GR6
LP      LAD GR6,1,GR6
        LD GR4,0,GR6      ; 1文字の取出し
        CPL GR4,='.'
        JZE FIN
        CPL GR4,=' '
        [b]
        CALL SETWD
        JUMP LP
NUM     LD GR3,GR3        ; 数字列の処理中？（処理中=${m.active}）
        ${m.flag===0?'JZE':'JNZ'} LP
        LD GR3,=${m.active}        ; 次の数字列の処理開始（処理中=${m.active}）
        LD GR1,GR6        ; 数字列の先頭アドレスを退避
        JUMP LP
FIN     CALL SETWD
        LD GR2,=-1
        ST GR2,0,GR7      ; 数値の終わりを示す印を格納
        RPOP
        RET
SETWD   LD GR3,GR3
        [c]
        LD GR2,GR6
        SUBL GR2,GR1
        CALL DTOB         ; 数字列を数値に変換
        ST GR0,0,GR7
        LD GR3,=${m.idle}       ; 数字列の処理中状態を解除（未処理=${m.idle}）
        [d]
FIN2    RET
        END`,
`MULT    START
        RPUSH
        LAD GR2,CTBL
        CALL GETWD
        LD GR4,0,GR2      ; GR4 ← 被乗数
        LD GR5,1,GR2      ; GR5 ← 乗数
        LD GR0,=0
        LD GR5,GR5
LP      [e]
        LD GR3,GR5
        AND GR3,=#0001    ; 乗数の最下位ビットのチェック
        JZE NEXT
        ADDL GR0,GR4
NEXT    SLL GR4,1         ; 被乗数を1ビット左論理シフト
        [f]
        JUMP LP
FIN     RPOP
        RET
CTBL    DS 3              ; GETWD用管理テーブル
        END`
 ];}
export const legacy2018SpringPm12Instructions=[
 '設問1 プログラム1中の［　］に入れる正しい答えを、解答群の中から選べ。',
 '設問2 文字列の先頭から数字列を探索し、順に、対応する数値を管理テーブルに格納する副プログラムGETWDを、DTOBを使用して作成した。プログラム2中の［　］に入れる正しい答えを、解答群の中から選べ。',
 '設問3 GETWDを使用して、二つの整数の積を求める副プログラムMULTを作成した。プログラム3中の［　］に入れる正しい答えを、解答群の中から選べ。'
];
/** Twelve independently sourced facts only; this is not the held JIS character table. */
export const legacy2018SpringPm12UnicodeFacts=[['SPACE','#0020'],['FULL STOP','#002E'],...Array.from({length:10},(_,n)=>[String(n),`#003${n}`])];
export function legacy2018SpringPm12Figure(profile:string,values:readonly number[]) {const axis=values.slice(0,2),m=legacy2018SpringPm12Model(axis),group=values[2];
 if(!legacy2018SpringPm12Profiles.includes(profile as typeof legacy2018SpringPm12Profiles[number]))throw Error('UNKNOWN_LEGACY_2018_SPRING_PM12_PROFILE');
 const limit=profile.endsWith('-bank')?6:profile.endsWith('-unicode-reference')?1:3;
 if(values.length!==3||!Number.isSafeInteger(group)||group<0||group>=limit)throw Error('PARAMETER_CONSTRAINT');
 if(profile.endsWith('-program')){const text=legacy2018SpringPm12Programs(axis)[group];return{kind:'program' as const,text,caption:`プログラム${group+1}`,alt:`プログラム${group+1}。${text}`};}
 if(profile.endsWith('-bank')){const caption=`${'abcdef'[group]}に関する解答群`,text=legacy2018SpringPm12Banks[group].map((s,i)=>`${'アイウエオカ'[i]} ${s}`).join('\n');return{kind:'bank' as const,text,caption,alt:`${caption}。${text}`};}
 if(profile.endsWith('-instruction')){const text=legacy2018SpringPm12Instructions[group];return{kind:'instruction' as const,text,caption:`設問${group+1}の指示文`,alt:text};}
 if(profile.endsWith('-unicode-reference')){if(values.some(n=>n!==0))throw Error('PARAMETER_CONSTRAINT');const caption='独立参考：この問題で使用する文字と符号値（Unicode 17.0.0）',text=legacy2018SpringPm12UnicodeFacts.map(r=>r.join(' ')).join('\n');return{kind:'unicode' as const,text,caption,alt:caption+'。'+text+'。別資料から必要な12事実を再構成した独立参考で、公式の付属文字表そのものではない。原問題の文字定数・1語16ビットの規則は変更していない。'};}
 const captions=['図1 数字列の格納例','図2 文字列の例','図3 GETWDで処理して得た管理テーブル'],text=group===0?String(m.dto).split('').map((s,i)=>`#003${s}（${i+1}語目）`).join(' '):group===1?m.text.replaceAll(' ','△')+'\n注記 空白文字は“△”と表記する。':m.nums.join(' | ')+' | −1\n注記 数値は、10進数で表記している。';return{kind:'figure' as const,text,caption:captions[group],alt:`${captions[group]}。${text}`};
}
