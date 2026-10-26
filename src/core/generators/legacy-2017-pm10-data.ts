export const legacy2017Pm10Program = [
"DATA DIVISION.","FILE SECTION.","SD SRT-FILE.","01 SRT-REC.","    02 SRT-BRANCH      PIC 9(2).","    02 SRT-NO          PIC 9(6).","    02 SRT-DATE.","        03 SRT-YYYYMM  PIC 9(6).","        03 SRT-DD      PIC 9(2).","    02 SRT-AMOUNT      PIC 9(6).","FD SAL-FILE.","01 SAL-REC             PIC X(22).","FD MST-FILE.","01 MST-REC.","    02 MST-YYYYMM.","        03 MST-YYYY    PIC 9(4).","        03 MST-MM      PIC 9(2).","    02 MST-AMOUNT      PIC 9(10).","    02 MST-TABLE.","        03 MST-BRANCH  PIC 9(9) OCCURS 8.","WORKING-STORAGE SECTION.","77 CNT                PIC 9(1).","77 SRT-FLAG           PIC X(1) VALUE SPACE.","    88 SRT-EOF        VALUE \"E\".","PROCEDURE DIVISION.","MAIN-PROC.","    OPEN EXTEND MST-FILE.","    SORT SRT-FILE ASCENDING KEY [a]","        USING SAL-FILE","        OUTPUT PROCEDURE IS RET-PROC.","    CLOSE MST-FILE.","    STOP RUN.","RET-PROC.","    INITIALIZE MST-REC.","    PERFORM UNTIL SRT-EOF","        RETURN SRT-FILE AT END SET SRT-EOF TO TRUE","                               PERFORM WRI-PROC","              NOT AT END PERFORM ADD-PROC","        END-RETURN","    END-PERFORM.","ADD-PROC.","    IF [b] THEN","        PERFORM WRI-PROC","        INITIALIZE MST-REC","        MOVE SRT-YYYYMM TO MST-YYYYMM","    END-IF.","    [c].","WRI-PROC.","    IF MST-YYYY NOT = ZERO THEN","        PERFORM VARYING CNT FROM 1 BY 1 UNTIL CNT > 8","            [d]","        END-PERFORM","        WRITE MST-REC","    END-IF.",
];
export const legacy2017Pm10Profiles=["legacy-2017-pm10-slip-record","legacy-2017-pm10-master-record","legacy-2017-pm10-output","legacy-2017-pm10-changes","legacy-2017-pm10-program","legacy-2017-pm10-choice-group"] as const;
function tuple(values:number[],bounds:number[]){
 if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype||values.length!==bounds.length||Reflect.ownKeys(values).length!==bounds.length+1)throw Error('PARAMETER_CONSTRAINT');
 return bounds.map((max,i)=>{const d=Object.getOwnPropertyDescriptor(values,String(i));if(!d||!('value'in d)||!Number.isSafeInteger(d.value)||Object.is(d.value,-0)||d.value<0||d.value>max)throw Error('PARAMETER_CONSTRAINT');return d.value as number;});
}
export function legacy2017Pm10Input(values:number[]){return tuple(values,[2])[0];}
export function legacy2017Pm10Model(v:number){
  if(!Number.isSafeInteger(v)||Object.is(v,-0)||v<0||v>2)throw Error('PARAMETER_CONSTRAINT');
  const start=4+v, month=(offset:number)=>(start+offset-1)%12+1;
  const quarters=Array.from({length:4},(_,i)=>[month(i*3),month(i*3+2)]);
  return{start,end:month(11),quarters,starts:quarters.map(q=>q[0]),ends:quarters.map(q=>q[1]),totals:[736055716,1088207339,865163702,1224859224]};
}
export function legacy2017Pm10ChoiceGroups(v:number){
 const m=legacy2017Pm10Model(v);
 return[
  {title:'aに関する解答群',items:['SRT-AMOUNT','SRT-BRANCH','SRT-DATE','SRT-NO'],page:49},
  {title:'bに関する解答群',items:['MST-YYYYMM = SRT-YYYYMM','MST-YYYYMM NOT = SRT-YYYYMM','MST-YYYYMM = ZERO','SRT-YYYYMM = ZERO'],page:49},
  {title:'c、dに関する解答群',items:['ADD MST-BRANCH(CNT) TO MST-AMOUNT','ADD MST-BRANCH(SRT-BRANCH) TO MST-AMOUNT','ADD SRT-AMOUNT TO MST-BRANCH(CNT)','ADD SRT-AMOUNT TO MST-BRANCH(SRT-BRANCH)','MOVE SRT-AMOUNT TO MST-BRANCH(SRT-BRANCH)'],page:49},
  {title:'eに関する解答群',items:['行番号30と31の間','行番号40と41の間','行番号47と48の間','行番号52と53の間'],page:50},
  {title:'fに関する解答群',items:['1 THRU 12',`${m.start} THRU ${m.start-1}`,m.starts.join(', '),m.ends.join(', ')],page:51},
  {title:'gに関する解答群',items:['ADD 1 TO CR-QUART','ADD 3 TO CR-QUART','MOVE CNT TO CR-QUART','MOVE ZERO TO CR-QUART'],page:51},
 ];
}
export function legacy2017Pm10Figure(profile:string,values:number[]){
  if(!legacy2017Pm10Profiles.includes(profile as typeof legacy2017Pm10Profiles[number]))throw Error('PARAMETER_CONSTRAINT');
  if(profile==='legacy-2017-pm10-choice-group'){
   const [v,g]=tuple(values,[2,5]),bank=legacy2017Pm10ChoiceGroups(v)[g];return{caption:bank.title,alt:bank.items.map((text,i)=>'アイウエオ'[i]+' '+text).join('。'),model:legacy2017Pm10Model(v),pages:[bank.page],bank};
  }
  legacy2017Pm10Input(values);
  const m=legacy2017Pm10Model(values[0]),i=legacy2017Pm10Profiles.indexOf(profile as typeof legacy2017Pm10Profiles[number]);
  const captions=['図1 売上伝票ファイルのレコード様式','図2 売上マスタファイルのレコード様式','図3 表示例','表1 プログラムの変更内容','プログラム'];
  const alts=['一行のレコード。支店番号2桁、伝票番号6桁、売上日8桁、売上金額6桁。','売上年月6桁、売上金額合計10桁、支店別売上金額は支店1から8まで各9桁。支店別の上に共通見出しを置く。','1ST、2ND、3RD、4TH QUARTERの4行。金額は順に736,055,716、1,088,207,339、865,163,702、1,224,859,224。','追加位置と変更内容の2列3行。行17/18間はQUART-MONTH VALUES［f］、行24/25間は四半期集計と表示に使う宣言、［e］の位置へ集計・表示・初期化・［g］を追加。',legacy2017Pm10Program.map((text,n)=>`${n+1} ${text}`).join('\n')];
  return{caption:captions[i],alt:alts[i],model:m,pages:[[47],[47],[50],[50],[48,49]][i],bank:undefined};
}
