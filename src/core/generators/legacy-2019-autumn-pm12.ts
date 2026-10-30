import type{Block}from'../types';import{code,field,p,strings,type GeneratedBody,type GenerationDefinition}from'./definition';import{autumnCaslNumericReference,autumnPackedErratum}from'./legacy-2019-autumn-casl-reference';
export const autumnPackedSource='2019r01a-fe-pm-12';
export const autumnPackedExamples=[[246,57],[123,456],[135,468],[278,39],[487,235],[909,90],[111,222],[314,159],[265,358],[408,75],[698,147],[201,99],[801,98],[975,24],[100,899],[9,1]]as const;
export function autumnPackedModel(values:number[]){if(values.length!==2||values.some((v,i)=>!Number.isInteger(v)||v<0||v>[15,1][i]))throw Error('PARAMETER_CONSTRAINT');const[a,b]=autumnPackedExamples[values[0]],negative=values[1]===1,word=(n:number)=>parseInt(String(n).padStart(3,'0')+(negative?'D':'C'),16);return{a,b,negative,sign:negative?'D':'C',words:[word(a),word(b),word(a+b)],signed:[negative?-a:a,negative?-b:b,negative?-(a+b):a+b]};}
export function autumnPackedPrograms(){const setup=`    ST GR1,A
    ST GR2,B
    LAD GR3,4       ;ビット数カウンタの初期化
    [a]
    ST GR1,RESULT  ;符号部を退避
    LD GR1,A
    SRL GR1,0,GR3
    LD GR2,B
    SRL GR2,0,GR3
LOOP AND GR1,=#000F
    AND GR2,=#000F
    LAD GR0,0`,tail=`MERGE [c]
    OR GR1,RESULT   ;中間結果との併合
    LAD GR3,4,GR3
    CPL GR3,=16
    JZE FIN        ;終了判定
    ST GR1,RESULT   ;中間結果を退避
    LD GR1,A
    SRL GR1,0,GR3
    LD GR2,B
    SRL GR2,0,GR3`;
 return[`ADDP1 START
    RPUSH
${setup}
    ADDL GR1,GR2
    CPL GR1,=10
    [b]
    SUBL GR1,=10
    LAD GR0,1
${tail}
    ADDL GR1,GR0
    JUMP LOOP
FIN LD GR0,GR1
    RPOP
    RET
A DS 1
B DS 1
RESULT DS 1
    END`,
`ADDP2 START
    RPUSH
    CPL GR1,GR2
    [d]
    LD GR4,GR1
    LD GR1,GR2
    LD GR2,GR4
INI ${setup.trimStart()}
    SUBL GR1,GR2
    JPL MERGE
    [e]
    ADDL GR1,=10
    LAD GR0,1
${tail}
    [f]
    JUMP LOOP
FIN LD GR0,GR1
    CPL GR0,=#000D
    JNZ FIN2
    LAD GR0,#000C
FIN2 RPOP
    RET
A DS 1
B DS 1
RESULT DS 1
    END`,
`ADDP START
    LD GR0,GR1
    [g]
    SRL GR0,1
    [h]
    CALL ADDP1
    JUMP FIN
P2 CALL ADDP2
FIN RET
    END`];}
export const autumnPackedChoices={a:['AND GR1,=#000F','AND GR1,=#F000','AND GR1,=#FFFF','OR GR1,=#000F','OR GR1,=#F000','OR GR1,=#FFFF'],b:['JMI MERGE','JNZ MERGE','JPL MERGE','JOV MERGE','JZE MERGE'],c:['SLA GR1,0,GR3','SLL GR1,0,GR3','SLL GR1,=4','SRA GR1,0,GR3','SRL GR1,0,GR3','SRL GR1,=4'],d:['JMI INI','JNZ INI','JOV INI','JPL INI','JZE INI'],e:['JMI MERGE','JNZ MERGE','JOV MERGE','JZE MERGE','SLL GR1,0,GR3','SRL GR1,0,GR3'],f:['ADDA GR1,GR0','ADDL GR1,=1','ADDL GR1,GR0','ADDL GR3,GR0','SUBL GR1,=1','SUBL GR1,GR0'],g:['ADDL GR1,=1','AND GR0,GR2','OR GR1,GR2','SUBL GR1,=1','XOR GR0,GR2'],h:['JMI P2','JNZ P2','JOV P2','JPL P2','JZE P2']}as const;
export function autumnPackedAlt(profile:string,values:number[]){const m=autumnPackedModel(values),row=(n:number)=>n.toString(16).toUpperCase().padStart(4,'0').split('').join(' ');if(profile==='legacy-2019-autumn-pm12-packed-word')return`10進数${m.signed[0]}を16ビットのパック10進数で表す。16進は${row(m.words[0])}。最上位から3桁の10進各桁を4ビットずつ表し、最下位4ビットは符号${m.sign}。`;if(profile==='legacy-2019-autumn-pm12-packed-add')return`同符号のパック10進数${row(m.words[0])}と${row(m.words[1])}を加算し、${row(m.words[2])}を得る。10進値は${m.signed[0]}と${m.signed[1]}、結果${m.signed[2]}。`;throw Error('UNKNOWN_PACKED_FIGURE');}
function packedBody(values:number[],repaired:boolean):GeneratedBody{const m=autumnPackedModel(values),programs=autumnPackedPrograms(),banks=Object.values(autumnPackedChoices).map(v=>[...v]as string[]);if(repaired)banks[5][5]='ADDL GR2,GR0';const diagram=(profile:string,caption:string):Block=>({type:'diagram',id:'diagram-'+profile,rendererRef:{id:'renderer-source-figures',version:'1.0.0'},caption,alt:autumnPackedAlt(profile,values),scene:{kind:'source_figure',profile,values},attribution:{origin:'adapted',sourceRefs:[{sourceId:'source-ipa-'+autumnPackedSource+'-qs',locator:{section:'令和元年度 秋期 基本情報技術者試験 旧制度・午後 問12',page:64,year:2019,period:'秋期',subject:'旧制度・午後',questionNumber:'12'}}],rightsRefs:['rights-ipa-'+autumnPackedSource,'rights-original'],creatorIds:['codex']}}),offsets=[0,6,11,17,22,28,34,39];return{prompt:[p('問12 次のアセンブラプログラムの説明及びプログラムを読んで、設問1〜3に答えよ。'),p('公式注記（原PDF66ページ）：「'+autumnPackedErratum+'」。原問のfには公式正答がない。'),p(repaired?'この生成問題は、原fの問題誤りを踏まえプログラムの選択肢を修正した改変版である。以下の8欄の正答はこの改変版に対する独自のものであり、原fの公式正答を補うものではない。':'この原側の資料改変版は原のプログラム・8解答欄・全選択肢を保持し、fを正答なしとして扱う。解答欄の通常採点からfを除く扱いと、公式の受験者に対する措置は別のものである。'),p('パック10進数は、3桁の10進数の各桁を4ビットで表し、最下位4ビットに正又は0なら1100、負なら1101を置く16ビットの表現とする。'),diagram('legacy-2019-autumn-pm12-packed-word',`図1 10進数${m.signed[0]}のパック10進数表現`),diagram('legacy-2019-autumn-pm12-packed-add','図2 符号が同一である二つのパック10進数の加算例'),p('プログラム1のADDP1は、符号が同一の二つの16ビットパック10進数をGR1、GR2に設定して呼び出す。加算結果はGR0に入れ、GR1〜GR7を元に戻して呼出し元へ戻る。10進数の百の位からの桁上がりは発生しないものとする。'),code(programs[0],'casl2'),p('設問1 プログラム1中a〜cへ入れる正しい答えを各解答群から選べ。'),p('設問2 符号が異なる二つの16ビットパック10進数を加算するADDP2を作成した。プログラム2中d〜fへ入れる正しい答えを各解答群から選べ。a、cには設問1の正しい答えが入るものとする。'),p('ADDP2は入力をGR1、GR2に設定して呼び出し、結果をGR0に入れ、GR1〜GR7を元に戻して呼出し元へ戻る。'),code(programs[1],'casl2'),p('設問3 符号の組合せによってADDP1とADDP2を使い分け、符号にかかわらず二つの16ビットパック10進数を加算するADDPを作成した。プログラム3中g、hへ入れる正しい答えを各解答群から選べ。GR1、GR2に入力を設定して呼び出し、結果はGR0に入る。'),code(programs[2],'casl2'),...autumnCaslNumericReference()],choices:banks.flatMap(strings),answerParts:banks.map((bank,i)=>({id:'part-'+'abcdefgh'[i],label:`設問${i<3?1:i<6?2:3} ${'abcdefgh'[i]}`,choiceIds:bank.map((_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:[0,0,1,3,3,5,4,2].map((v,i)=>i===5&&!repaired?{kind:'no_correct_answer'as const,partId:'part-f',reason:autumnPackedErratum}:{kind:'choice'as const,partId:'part-'+'abcdefgh'[i],choiceId:'choice-value-'+(offsets[i]+v+1)}),explanation:'aは下位の符号4ビットを取り出して退避するAND。bは10未満なら桁上げをしないJMI。cは今の桁の値をビット数カウンタ分だけ論理左シフトする。dは符号を含む16ビットの論理大小で絶対値の大きい入力を先にし、eは差が0なら補正をせず併合する。'+(repaired?'修正したfは次の桁の減数GR2へ借りGR0を加える。被減数から借りを先に引いて0からの借りをマスクで失う元の候補とは異なる。':'原fはどの候補も全ての有効入力で成立せず、公式に正答なしである。')+' gは二つの符号の差をXORで取り出し、1ビット右へ送ったときのOFへ符号の差を出す。hはJOVで符号が異なるときADDP2へ分岐する。'};}
export const autumnPackedOriginalBody=()=>packedBody([0,0],false);
export const legacy2019AutumnPackedDefinitions:GenerationDefinition[]=[{source:autumnPackedSource,title:'旧制度・午後：CASL IIのパック10進数加算',version:'3.2.0',answerVariation:'fixed',fields:[field('numericExampleCase',0,15),field('sameSignCase',0,1)],reference:[0,0],sourceAnswer:'原：aア bア cイ dエ eエ f正答なし gオ hウ／改変生成fは独自修正カ',notes:'原64〜69の16bit/3桁BCD/C-D/0はC/同符号桁上がりなし/GR1〜7復元/3プログラム/2図/8欄と6/5/6/5/6/6/5/5択を保持。原f6候補は全て誤りなので原側はno_correct_answerと公式措置を保持する。生成側はfの最終候補をADDL GR2,GR0へ置換する独自修正として原側と分離する。数値例16条件×同符号2で32条件、命令の意味は固定。eにはア〜カ6択がある（旧preflight5は要訂正）。API/JIS原資料を自動引用せず数値ISAの独自参照へ原側も差替える。独立全域証拠は既存observerによる1998000組の異符号入力と999001組の同符号入力を対象とする。数値命令の検算器であり、native CASL処理系や全ISAの実装を意味しない。',build:values=>packedBody(values,true)}];
