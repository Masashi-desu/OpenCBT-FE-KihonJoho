/** Source-local sorted COBOL update; test data are independent probes, not official reference calls. */
import type{GenerationDefinition,GeneratedBody}from'./definition';import{autumn2018Tuple}from'./legacy-2018-autumn-pm-input';import{p,selectedLanguageNotice,languageAnswers,languageDrawing,type LanguageFigure}from'./legacy-2018-autumn-language-common';
export const autumn2018Pm10Profiles=['legacy-2018-autumn-pm10-record','legacy-2018-autumn-pm10-program','legacy-2018-autumn-pm10-changes','legacy-2018-autumn-pm10-bank']as const;
export function autumn2018Pm10Input(values:number[]){const v=autumn2018Tuple(values,[[0,3],[0,1]]),start=[4,1,7,10][v[0]],month=(n:number)=>(start-1+n)%12+1,half=v[1],period=half===0?'当該事業年度の上期':'前事業年度の下期';return{v,start,half,first:[month(0),month(5)],second:[month(6),month(11)],runMonth:month((half+1)*6),period};}
export type AutumnQualificationRecord={no:string;dates:number[]};export type AutumnPassRecord={no:string;qualification:number;date:number};
export function autumn2018Pm10Update(owned:AutumnQualificationRecord[],passes:AutumnPassRecord[]){const db=new Map(owned.map(r=>[r.no,structuredClone(r)])),sorted=structuredClone(passes).sort((a,b)=>a.no.localeCompare(b.no)),counts=[0,0,0,0],awards:string[]=[],writes:string[]=[];let current:AutumnQualificationRecord|undefined;const write=()=>{if(current){if(current.dates.every(d=>d!==0))awards.push(current.no);db.set(current.no,structuredClone(current));writes.push(current.no);}};for(const row of sorted){if(row.qualification<1||row.qualification>4||!db.has(row.no))throw Error('PARAMETER_CONSTRAINT');if(current?.no!==row.no){write();current=structuredClone(db.get(row.no)!);}if(current.dates[row.qualification-1]!==0)throw Error('QUALIFICATION_RETAKE');current.dates[row.qualification-1]=row.date;counts[row.qualification-1]++;}write();return{records:[...db.values()].sort((a,b)=>a.no.localeCompare(b.no)),counts,awards,writes};}
export function autumn2018Pm10Banks(values:number[]){const x=autumn2018Pm10Input(values),p=x.period;return[['MOVE SPACE TO CR-NO','PERFORM UPD-PROC','PERFORM WRT-PROC','REWRITE QLF-REC'],['CR-NO = SPACE','SRT-NO = CR-NO','SRT-NO = SPACE','SRT-NO NOT = CR-NO'],['MOVE QLF-DATE(SRT-CD) TO QLF-DATE(SRT-CD + 1)','MOVE SRT-DATE TO QLF-DATE(SRT-CD)','MOVE SRT-NO TO QLF-DATE(SRT-CD)','MOVE ZERO TO QLF-DATE(SRT-CD)'],['行番号33と34の間','行番号35と36の間','行番号42と43の間','行番号46と47の間'],['QLF-DATE(CR-NO) = ZERO','QLF-DATE(W-CNT) = ZERO','QLF-INF NOT = ALL ZERO','W-CNT > 4'],[`${p}に，各資格試験に合格した従業員の数`,`${p}に，各資格試験を受験した従業員の数`,`${p}までに，各資格試験に合格した従業員の数`,`${p}までに，各資格試験に合格していない従業員の数`]];}
export const autumn2018Pm10Program=` 1  DATA DIVISION.
 2  FILE SECTION.
 3  SD SRT-FILE.
 4  01 SRT-REC.
 5     02 SRT-NO      PIC X(8).
 6     02 SRT-CD      PIC 9(1).
 7     02 SRT-DATE    PIC 9(8).
 8  FD QLF-FILE.
 9  01 QLF-REC.
10     02 QLF-NO      PIC X(8).
11     02 QLF-INF.
12        03 QLF-DATE PIC 9(8) OCCURS 4.
13  FD PAS-FILE.
14  01 PAS-REC.
15     02 PAS-NO      PIC X(8).
16     02 PAS-CD      PIC 9(1).
17     02 PAS-DATE    PIC 9(8).
18  WORKING-STORAGE SECTION.
19  77 SRT-FLAG      PIC X(1) VALUE SPACE.
20     88 SRT-EOF    VALUE "E".
21  77 CR-NO         PIC X(8) VALUE SPACE.
22  PROCEDURE DIVISION.
23  MAIN-PROC.
24      OPEN I-O QLF-FILE.
25      SORT SRT-FILE ASCENDING KEY SRT-NO
26           USING PAS-FILE
27           OUTPUT PROCEDURE IS RET-PROC.
28      CLOSE QLF-FILE.
29      STOP RUN.
30  RET-PROC.
31      PERFORM TEST BEFORE UNTIL SRT-EOF
32          RETURN SRT-FILE AT END SET SRT-EOF TO TRUE
33                              ［a］
34                      NOT AT END PERFORM UPD-PROC
35          END-RETURN
36      END-PERFORM.
37  UPD-PROC.
38      IF ［b］ THEN
39          PERFORM WRT-PROC
40          MOVE SRT-NO TO QLF-NO
41          READ QLF-FILE END-READ
42          MOVE QLF-NO TO CR-NO
43      END-IF.
44      ［c］.
45  WRT-PROC.
46      IF CR-NO NOT = SPACE THEN
47          REWRITE QLF-REC
48      END-IF.`;
export function autumn2018Pm10Figure(profile:string,values:number[]):LanguageFigure{const z=autumn2018Tuple(values,[[0,3],[0,1],[0,5]]),v=z.slice(0,2),g=z[2];if(profile===autumn2018Pm10Profiles[0]&&g<2)return{kind:'record',caption:`図${g+1} ${g===0?'保有資格':'合格'}ファイルのレコード様式`,alt:g===0?'従業員番号8桁と資格1〜4の各8桁。':'従業員番号8桁，資格種別1桁，合格日8桁。',columns:g===0?['従業員番号','資格1','資格2','資格3','資格4']:['従業員番号','資格種別','合格日'],rows:[g===0?['8桁','8桁','8桁','8桁','8桁']:['8桁','1桁','8桁']]};if(profile===autumn2018Pm10Profiles[1]&&g===0)return{kind:'program',caption:'〔プログラム〕',lineNumbersLabel:true,alt:'全データ定義，SORT/RETURN，EOF，社員境界と書戻しの行番号を保持。',text:autumn2018Pm10Program};if(profile===autumn2018Pm10Profiles[2]&&g<2)return{kind:'changes',caption:`表${g+1} プログラムの変更内容${g+1}`,alt:'挿入箇所と命令の対応を保持。',columns:['処置','変更内容'],rows:g===0?[['行番号21と22の間に追加','77 W-CNT PIC 9(4).'],['［d］に追加',`PERFORM VARYING W-CNT FROM 1 BY 1
    UNTIL W-CNT > 4 OR QLF-DATE(W-CNT) = ZERO
    CONTINUE
END-PERFORM
IF ［e］ THEN
    DISPLAY "EMPLOYEE-NO:" QLF-NO " COMPLETE"
END-IF`]]:[['行番号18と19の間に追加','01 W-LIC.\n   02 W-NUM PIC 9(4) OCCURS 4 VALUE ZERO.'],['行番号28と29の間に追加','DISPLAY W-NUM(1) ", " W-NUM(2) ", " W-NUM(3) ", " W-NUM(4).'],['行番号44と45の間に追加','ADD 1 TO W-NUM(SRT-CD).']]};if(profile===autumn2018Pm10Profiles[3])return{kind:'bank',caption:g===5?'解答群':`${'abcde'[g]}に関する解答群`,alt:'各4択，全部で24択。',columns:['記号','内容'],rows:autumn2018Pm10Banks(v)[g].map((s,i)=>['アイウエ'[i],s])};throw Error('PARAMETER_CONSTRAINT');}
const draw=(kind:string,v:number[],g=0)=>{const m=autumn2018Pm10Figure(`legacy-2018-autumn-pm10-${kind}`,[...v,g]);return languageDrawing(10,kind,v,g,m.caption,m.alt);};
export const legacy2018AutumnPm10Definition:GenerationDefinition={source:'2018h30a-fe-pm-10',title:'社内資格の保有状況の管理（COBOL）',version:'3.2.0',answerVariation:'fixed',fields:[{name:'事業年度の開始月の組',minimum:0,maximum:3},{name:'反映対象の上期又は下期',minimum:0,maximum:1}],reference:[0,0],sourceAnswer:'ウ・エ・イ・エ・エ・ア',notes:'原5頁/全48行/6欄24択を保持。資格4件、従業員番号8桁、資格種別1桁、日付8桁、SORT→RETURN/EOF最後書戻し、既存社員必在/再受験なし、原乱順合格fileを固定。事業年度開始月4候補×反映半期2の8条件で処理日・対象期間と全期間選択肢を連動。一般算法の正答は固定だが、日付条件/対象期間と実データ更新・集計は意味的に異なる。任意社員データを公式reference入力としない。独立event foldと全24択反例、全sort/EOF/社員境界/4列日付検査。配布未受入。',build(values):GeneratedBody{const x=autumn2018Pm10Input(values),v=x.v,range=(a:number[])=>`${a[0]}月〜${a[0]>a[1]?'翌年':''}${a[1]}月`;return{prompt:[
 p("選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。"),
 p("問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。"),
 p("〔プログラムの説明〕"),
 p("従業員の社内資格の保有状況を管理するプログラムである。"),
 p(`情報サービス企業であるP社には社内資格として資格1〜4があり，従業員に取得を奨励している。社内資格を取得するための試験（以下，資格試験という）は定期的に実施しており，全従業員の保有状況を保有資格ファイルで管理する。P社の事業年度は${x.start}月から${x.start===1?'同年':'翌年'}${x.start===1?12:x.start-1}月までであり，上期（${range(x.first)}）と下期（${range(x.second)}）の2期から成る。資格試験に合格した従業員の情報は合格ファイルに1期分を蓄積する。上期の合格者を蓄積した合格ファイルは${(x.start+5)%12+1}月初めに，下期の合格者を蓄積した合格ファイルは${x.start}月初めにプログラムを実行して，保有資格ファイルに反映する運用である。従業員は，合格した資格試験を再度受けることはない。`),
 p("(1) 保有資格ファイルは，図1に示すレコード様式の索引ファイルであり，全従業員のレコードが格納されている。主キーは従業員番号である。プログラムでは，乱呼出法で入出力している。"),
 draw('record',v,0),
 p("資格1〜4には，従業員番号で示される従業員が各資格試験に合格した日付として，西暦の年，月，日が，それぞれ4桁，2桁，2桁で格納されている。合格していない場合は，0が格納されている。"),
 p("(2) 合格ファイルは，図2に示すレコード様式の順ファイルであり，資格試験に合格した従業員のレコードが格納されている。同じ従業員が複数の資格試験に合格した場合は，合格した資格試験ごとにレコードが格納されている。レコードは，順不同で格納されている。"),
 draw('record',v,1),
 p("① 資格種別には，合格した資格試験を表す値が，資格1は1で，資格2は2で，資格3は3で，資格4は4で格納されている。"),
 p("② 合格日には，合格した日付として，西暦の年，月，日が，それぞれ4桁，2桁，2桁で格納されている。"),
 p("(3) 保有資格ファイルには，合格ファイルの従業員番号で示される従業員のレコードが必ず存在する。"),
 draw('program',v,0),
 p("設問1 プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。"),
 draw('bank',v,0),
 draw('bank',v,1),
 draw('bank',v,2),
 p("設問2 P社では，社内資格を四つ全て取得した従業員を表彰している。合格ファイルの内容を保有資格ファイルに反映するとき，新たに表彰の対象となった従業員の従業員番号を表示するようにプログラムを変更する。表1中の［　］に入れる正しい答えを，解答群の中から選べ。"),
 draw('changes',v,0),
 draw('bank',v,3),
 draw('bank',v,4),
 p(`設問3 プログラムを表2に示すとおり変更して，通常の運用どおり${x.runMonth}月初めに実行した。行番号28と29の間に追加したDISPLAYによって表示される内容に関する説明として適切な答えを，解答群の中から選べ。ここで，プログラムは設問2の変更を行う前のものとする。また，対象となる従業員の数は，10,000未満である。`),
 draw('changes',v,1),
 draw('bank',v,5)
],...languageAnswers(autumn2018Pm10Banks(v),[2,3,1,3,3,0].map((answer,i)=>({id:'abcdef'[i],bank:i,label:i===5?'設問3':`設問${i<3?1:2} ${'abcde'[i]}`,answer}))),explanation:`aでEOF到達時に最後の社員をWRT-PROCで書き戻す。bは従業員番号が変わったときだけ前社員を書き戻して次社員を読む条件。cは資格種別で選んだ日付欄に合格日を移す。dは社員を保存する直前の46/47行間で全4資格を確認し，eは4まで全て非ZEROならW-CNT>4となる。集計は今回RETURNした合格レコードごとに1回だけ行うので，${x.period}に各資格試験へ合格した従業員数を表す。独自解説。`};}};
