/** IPA平成28年度秋期FE午後問10。COBOLは表示用の固定プログラム。 */
import{field,p,variableNotes,type GeneratedBody}from'./definition';
import type{AfternoonBookletDefinition}from'./afternoon-booklet-extension-contract';
import{selectCase,sourceDiagram,panelAlt,heading,answerBody,pageAlt,choiceBankText,type Panel,type SourcePage}from'./legacy-2016-autumn-pm-09-13-support';
export function q10Input(v:readonly number[]){const domain=[{history:10,delta:4},...[6,8,10].flatMap(history=>[3,4,5].map(delta=>({history,delta}))).filter(x=>x.history!==10||x.delta!==4)];return domain[selectCase(v,9)];}
export function q10Program(history:number){return` 1 DATA DIVISION.
 2 FILE SECTION.
 3 SD SORT-FILE.
 4 01 SORT-REC.
 5    02 SORT-NO           PIC 9(6).
 6    02 SORT-ELM          PIC X(15).
 7 FD MST-FILE.
 8 01 MST-REC.
 9    02 MST-NO            PIC 9(6).
10    02 MST-HISTORY       OCCURS ${history}.
11       03 MST-DATE       PIC 9(8).
12       03 MST-ELM.
13          04 MST-HEIGHT  PIC 9(3)V9(1).
14          04 MST-WEIGHT  PIC 9(3)V9(1).
15          04 MST-HIGHPRES PIC 9(3).
16          04 MST-LOWPRES  PIC 9(3).
17          04 MST-XRAY    PIC 9(1).
18 FD RSLT-FILE.
19 01 FIRST-REC.
20    02 RSLT-DATE         PIC 9(8).
21    02                  PIC X(13).
22 01 RSLT-REC             PIC X(21).
23 WORKING-STORAGE SECTION.
24 77 CNT                  PIC 9(2).
25 77 NEW-DATE             PIC 9(8).
26 77 RSLT-FLAG            PIC X(1) VALUE SPACE.
27    88 RSLT-EOF           VALUE "E".
28 77 SORT-FLAG            PIC X(1) VALUE SPACE.
29    88 SORT-EOF           VALUE "E".
30 PROCEDURE DIVISION.
31 MAIN-PROC.
32     OPEN I-O MST-FILE INPUT RSLT-FILE.
33     READ RSLT-FILE.
34     [a].
35     SORT SORT-FILE ASCENDING KEY SORT-NO
36         INPUT PROCEDURE IS REL-PROC
37         OUTPUT PROCEDURE IS RET-PROC.
38     CLOSE MST-FILE RSLT-FILE.
39     STOP RUN.
40 REL-PROC.
41     PERFORM UNTIL RSLT-EOF
42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE
43             NOT AT END [b]
44         END-READ
45     END-PERFORM.
46 RET-PROC.
47     PERFORM UNTIL SORT-EOF
48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE
49             NOT AT END PERFORM MATCHING-PROC
50         END-RETURN
51     END-PERFORM.
52 MATCHING-PROC.
53     READ MST-FILE.
54     PERFORM TEST BEFORE UNTIL [c]
55         READ MST-FILE END-READ
56     END-PERFORM.
57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0
58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1)
59     END-PERFORM.
60     MOVE NEW-DATE TO MST-DATE(1).
61     MOVE SORT-ELM TO MST-ELM(1).
62     REWRITE MST-REC.`;}
export function q10Banks(history:number,delta:number){return{ab:['MOVE RSLT-DATE TO NEW-DATE','MOVE ZERO TO CNT','MOVE ZERO TO NEW-DATE','PERFORM RET-PROC','RELEASE SORT-REC','RELEASE SORT-REC FROM RSLT-REC'],c:['MST-NO = SORT-NO','MST-NO < SORT-NO','MST-NO > SORT-NO','MST-NO NOT = SORT-NO'],d:['FROM 0 BY 1',`FROM ${history-1} BY -1`,`FROM ${history} BY -1`,'FROM CNT BY 1'],e:['行番号34と35の間','行番号45と46の間','行番号51と52の間','行番号52と53の間'],f:['MOVE 1 TO CNT',`MOVE ${history} TO CNT`,'MOVE MST-DATE(1) TO NEW-DATE','MOVE ZERO TO NEW-DATE'],g:[`MST-WEIGHT(1) >= MST-WEIGHT(2) + ${delta} OR\nMST-WEIGHT(1) <= MST-WEIGHT(2) - ${delta}`,`MST-WEIGHT(1) >= MST-WEIGHT(CNT) + ${delta} OR\nMST-WEIGHT(1) <= MST-WEIGHT(CNT) - ${delta}`,`MST-WEIGHT(${history}) >= MST-WEIGHT(${history-1}) + ${delta} OR\nMST-WEIGHT(${history}) <= MST-WEIGHT(${history-1}) - ${delta}`,`MST-WEIGHT(${history}) >= MST-WEIGHT(CNT) + ${delta} OR\nMST-WEIGHT(${history}) <= MST-WEIGHT(CNT) - ${delta}`]};}
export const q10ChangeParts={declarations:`77 MST-FLAG             PIC X(1) VALUE SPACE.
   88 MST-EOF           VALUE "E".
01 DISP-WK              PIC X(30).`,tail:`PERFORM UNTIL MST-EOF
    READ MST-FILE AT END SET MST-EOF TO TRUE
        NOT AT END DISPLAY MST-NO ": NO-DATA"
    END-READ
END-PERFORM.`,beforeRead:`DISPLAY MST-NO ": NO-DATA"`,checks:`[f].
MOVE SPACE TO DISP-WK.
IF MST-DATE(2) NOT = ZERO AND
    ([g]) THEN
    MOVE " WEIGHT" TO DISP-WK(CNT:)
    ADD 7 TO CNT
END-IF.
IF MST-HIGHPRES(1) >= 140 OR
    MST-HIGHPRES(1) <= 90 THEN
    MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)
    ADD 15 TO CNT
END-IF.
IF MST-XRAY(1) = 1 THEN
    MOVE " XRAY" TO DISP-WK(CNT:)
END-IF.
DISPLAY MST-NO ":" DISP-WK.`};
export const q10Profiles=['master-record-layout','result-record-layout','program','change-table','confirmation-output'];
export function q10Panel(suffix:string,v:number[]):Panel{const x=q10Input(v);if(suffix==='program')return{kind:'code',language:'cobol',text:q10Program(x.history)};if(suffix==='master-record-layout')return{kind:'record',rows:[{label:'',cells:[{text:'従業員番号',width:6},{text:'受診日',width:8},{text:'身長',width:4},{text:'体重',width:4},{text:'最高血圧',width:3},{text:'最低血圧',width:3},{text:'胸部X線',width:1}]}],repeat:`受診日から胸部X線までが結果履歴（${x.history}回分繰返し）`};if(suffix==='result-record-layout')return{kind:'record',rows:[{label:'様式1',cells:[{text:'受診日',width:8},{text:'未使用域',width:13}]},{label:'様式2',cells:[{text:'従業員番号',width:6},{text:'身長',width:4},{text:'体重',width:4},{text:'最高血圧',width:3},{text:'最低血圧',width:3},{text:'胸部X線',width:1}]}]};if(suffix==='change-table')return{kind:'table',columns:['処置','変更内容'],rows:[['行番号29と30の間に追加',q10ChangeParts.declarations],['[e]に追加',q10ChangeParts.tail],['行番号54と55の間に追加',q10ChangeParts.beforeRead],['行番号61と62の間に追加',q10ChangeParts.checks]]};if(suffix==='confirmation-output')return{kind:'code',language:'text',text:'920186: NO-DATA\n920189:\n920221: WEIGHT BLOOD-PRESSURE XRAY\n930015: WEIGHT\n930016:\n940047: NO-DATA\n    ⋮'};throw Error('FIGURE_PROFILE');}
export type Health10={date:number;height:number;weight:number;high:number;low:number;xray:number};
export type Employee10={id:number;history:Health10[]};
/** Source-shaped merge and backwards shift. Tests independently map/update arrays. */
export function q10Update(master:readonly Employee10[],results:readonly{id:number;result:Health10}[],historyCount:number,delta:number){const rows=structuredClone([...master]),sorted=structuredClone([...results]).sort((a,b)=>a.id-b.id),output:string[]=[];let cursor=0;for(const result of sorted){while(rows[cursor].id!==result.id){output.push(rows[cursor].id+': NO-DATA');cursor++;}const row=rows[cursor];for(let count=historyCount-1;count>0;count--)row.history[count]=structuredClone(row.history[count-1]);row.history[0]=structuredClone(result.result);let text='';if(row.history[1].date!==0&&(Math.round(row.history[0].weight*10)>=Math.round(row.history[1].weight*10)+delta*10||Math.round(row.history[0].weight*10)<=Math.round(row.history[1].weight*10)-delta*10))text+=' WEIGHT';if(row.history[0].high>=140||row.history[0].high<=90)text+=' BLOOD-PRESSURE';if(row.history[0].xray===1)text+=' XRAY';output.push(row.id+':'+text);cursor++;}while(cursor<rows.length)output.push(rows[cursor++].id+': NO-DATA');return{rows,output};}
function pages(index:number):SourcePage[]{const x=q10Input([index]),banks=q10Banks(x.history,x.delta);const fig=(s:string,c:string)=>sourceDiagram(10,s,index,c,panelAlt(q10Panel(s,[index])));return[
{page:47,blocks:[p('問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),heading('〔プログラムの説明〕'),p(`Z社では，毎年実施している従業員の健康診断を今年も実施した。健康診断の結果は，過去${x.history}回分が健康診断マスタファイルに記録されている。このプログラムは，今回の健康診断の結果が記録された結果ファイルを読み込み，健康診断マスタファイルに反映する。`),p('(1) 健康診断マスタファイルは，図1に示すレコード様式の順ファイルである。'),fig('master-record-layout','図1 健康診断マスタファイルのレコード様式'),p('① 全ての従業員に対するレコードが，従業員番号の昇順に格納される。'),p(`② 結果履歴には，当該従業員の過去${x.history}回分の健康診断の結果が，受診日の降順に格納される。受診回数が${x.history}回に満たない場合，残りの結果履歴には全てゼロが設定される。`),p('③ 受診日には，年，月，日が，それぞれ4桁，2桁，2桁の西暦で格納される。'),p('④ 身長（cm），体重（kg），最高血圧（mmHg），最低血圧（mmHg）には，それぞれの数値が格納される。身長と体重は小数点以下1桁までが格納される。胸部X線には，所見がない場合は0が，所見がある場合は1が格納される。'),p('(2) 結果ファイルは，図2に示すレコード様式の順ファイルである。')]},
{page:48,blocks:[fig('result-record-layout','図2 結果ファイルのレコード様式'),p('① 結果ファイルの先頭レコードとして，様式1のレコードが1件だけ格納される。受診日には，年，月，日が，それぞれ4桁，2桁，2桁の西暦で格納される。受診日は，健康診断マスタファイルに記録されているどの受診日よりも新しい。'),p('② 2件目以降のレコードとして，受診した従業員の様式2のレコードが順不同で格納される。受診していない従業員に対するレコードは存在しない。'),heading('〔プログラム〕'),fig('program','プログラム（行番号）')]},
{page:49,blocks:[]},
{page:50,blocks:[p('設問1 プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),p('設問2 プログラムを変更して，健康診断の結果を健康診断マスタファイルに反映するときに，全ての従業員の確認結果を図3に示すように表示する。表1中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),fig('confirmation-output','図3 確認結果の表示例')],banks:[choiceBankText('a，b',banks.ab),choiceBankText('c',banks.c),choiceBankText('d',banks.d)]},
{page:51,blocks:[heading('〔確認結果の表示についての説明〕'),p('次に該当する従業員は，従業員番号に続けて該当する文字列を表示する。なお，複数該当する場合は，その全てを表示する。'),p('① 今回受診していない場合はNO-DATA'),p(`② 今回と前回の体重を比較して，${x.delta}kg以上の増減がある場合はWEIGHT`),p('③ 今回の最高血圧が140mmHg以上（高血圧症状），又は90mmHg以下（低血圧症状）である場合はBLOOD-PRESSURE'),p('④ 今回の胸部X線の診断で所見がある場合はXRAY'),fig('change-table','表1 プログラムの変更内容')]},
{page:52,blocks:[],banks:[choiceBankText('e',banks.e),choiceBankText('f',banks.f),choiceBankText('g',banks.g)]}];}
export function q10OriginalPageAlt(){const alt=pageAlt(pages(0)),text=q10Program(10),split=text.indexOf('23 WORKING');alt[48]=alt[48].replace(text,text.slice(0,split));alt[49]=text.slice(split);return alt;}
export function q10Build(v:number[]):GeneratedBody{const i=selectCase(v,9),x=q10Input(v),b=q10Banks(x.history,x.delta);return answerBody(pages(i).flatMap(pg=>pg.blocks),[{names:['a','b'],labels:['設問1 a','設問1 b'],options:b.ab,keys:[0,5],language:'cobol'},{names:['c'],labels:['設問1 c'],options:b.c,keys:[0],language:'cobol'},{names:['d'],labels:['設問1 d'],options:b.d,keys:[1],language:'cobol'},{names:['e'],labels:['設問2 e'],options:b.e,keys:[2]},{names:['f'],labels:['設問2 f'],options:b.f,keys:[0],language:'cobol'},{names:['g'],labels:['設問2 g'],options:b.g,keys:[0],language:'cobol'}],`a：先頭レコードから受診日RSLT-DATEをNEW-DATEへ保持する。b：READした結果はRSLT-RECなので，FROMでその内容をSORT-RECへ移してRELEASEする。c：従業員番号が一致するまでマスタを読み進める。d：古い${x.history}番目を捨て，${x.history-1}から1へ降順にコピーする。昇順では元の履歴が上書きされ，${x.history}から開始すると配列外を参照する。e：SORTの出力手続RET-PROCが全受診者の照合を終えてから，MATCHING-PROCへは入らずに，残ったマスタの未受診者を読むので51と52の間。f：文字列の格納開始は1であり，前の繰返し後のCNTや初期値未規定の値を流用しない。g：更新後1番目が今回，2番目が前回で，体重差が±${x.delta}kg以上の両方向を含む。前回受診日0の場合は判定しない。血圧判定は今回の最高血圧で，140・90ちょうどを含む。複数の所見をそれぞれ表示する。`);}
export const legacy2016AutumnPm10Definition:AfternoonBookletDefinition={source:'2016h28a-fe-pm-10',title:'旧制度・午後：COBOLの健康診断マスタ更新',fields:[field('条件の選択番号',0,8)],reference:[0],sourceAnswer:'設問1 a=ア，b=カ，c=ア，d=イ／設問2 e=ウ，f=ア，g=ア',version:'3.6.0',publicNotes:'原問題のファイル様式・COBOLプログラム・確認結果の形式を維持し，履歴の保存回数と体重差の判定値を変更します。',notes:variableNotes+' 全6頁，7欄，26固有択／32参照。9有限候補。reference0=10回・4kg。昇順マスタと結果sort，レコード群の後方コピー，残件EOF，表示位置と未受診/初回判定を独立検算する。例示の元レコードは原問題非公開なので独自検証入力と原出力を区別。',build:q10Build};
