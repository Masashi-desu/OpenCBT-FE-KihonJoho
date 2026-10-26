import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';
export type Pm10Slip={date:number;branch:number;number:number;amount:number};
export type Pm10Month={month:number;branches:number[];total:number};
/** Map/group aggregation does not use the source's sequential sort/control-break procedure. */
export function pm10Reference(slips:Pm10Slip[]) {
  const groups=new Map<number,number[]>();
  for(const s of slips){const k=Math.floor(s.date/100),row=groups.get(k)??Array(8).fill(0);row[s.branch-1]+=s.amount;groups.set(k,row);}
  return [...groups].sort(([a],[b])=>a-b).map(([month,branches])=>({month,branches,total:branches.reduce((a,b)=>a+b,0)}));
}
export function pm10TestSlips(start:number,mode=0):Pm10Slip[]{
 const rows:Pm10Slip[]=[];for(let i=0;i<12;i++){const month=(start+i-1)%12+1,year=2024+Math.floor((start+i-1)/12);for(let b=1;b<=8;b++)for(let t=0;t<(mode===2&&i===0?1000:2);t++)rows.push({date:year*10000+month*100+1+t%28,branch:b,number:100000+b*10000+i*1000+t,amount:mode===0?((i*431+b*97+t*29)%9000)+1:mode===1?(13-i)*100+b*7+t*37:mode===2?999999:0});}
 return rows.filter((_,i)=>i%3===0).reverse().concat(rows.filter((_,i)=>i%3!==0).reverse());
}
/** Bounded interpreter of the independently reviewed a/b/c/d source holes.
 * Undefined CNT use is a genuine bad answer, not silently coerced to branch 1. */
export function pm10Interpreter(slips:Pm10Slip[],holes:number[]):Pm10Month[]{
 const [a,b,c,d]=holes,keys=['amount','branch','date','number'] as const;
 const rows=[...slips].sort((x,y)=>x[keys[a]]-y[keys[a]]),out:Pm10Month[]=[];
 let key=0,branches=Array(8).fill(0),total=0,cnt:number|undefined,last:Pm10Slip|undefined;
 const branch=(n:number|undefined)=>{if(n===undefined||n<1||n>8)throw Error('undefined/out of range subscript');return n-1;};
 const operation=(op:number,s:Pm10Slip)=>{switch(op){case 0:total+=branches[branch(cnt)];break;case 1:total+=branches[branch(s.branch)];break;case 2:branches[branch(cnt)]+=s.amount;break;case 3:branches[branch(s.branch)]+=s.amount;break;case 4:branches[branch(s.branch)]=s.amount;break;default:throw Error('bad hole');}};
 const write=()=>{if(key===0)return;assert(last);for(cnt=1;cnt<=8;cnt++)operation(d,last);out.push({month:key,branches:[...branches],total});};
 for(const s of rows){last=s;const k=Math.floor(s.date/100),condition=[key===k,key!==k,key===0,k===0][b];if(condition){write();key=0;branches=Array(8).fill(0);total=0;key=k;}operation(c,s);}
 write();return out;
}
export function pm10QuarterReference(rows:Pm10Month[]) {return Array.from({length:4},(_,i)=>rows.slice(i*3,i*3+3).reduce((n,r)=>n+r.total,0));}
export function assertPm10Body(body:GeneratedBody,value:number){
 const start=[4,5,6][value],sequence=Array.from({length:12},(_,i)=>(start+i-1)%12+1),ends=[sequence[2],sequence[5],sequence[8],sequence[11]],starts=[sequence[0],sequence[3],sequence[6],sequence[9]];
 assert.equal(body.choices.length,25);assert.equal(body.correctIndex,undefined);
 const counts=[4,4,5,5,4,4,4],offsets=[0,4,8,8,13,17,21],correct=[2,1,3,0,3,3,0];
 assert.deepEqual(body.answerParts,counts.map((n,i)=>({id:`part-${'abcdefg'[i]}`,label:`設問${i<4?1:2} ${'abcdefg'[i]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})));
 assert.deepEqual(body.partAnswers,correct.map((n,i)=>({kind:'choice',partId:`part-${'abcdefg'[i]}`,choiceId:`choice-value-${offsets[i]+n+1}`})));
 const strings=body.choices.map(c=>{assert.equal(c.length,1);const b=c[0];assert(b.type==='code'||b.type==='paragraph');return b.text;});
 assert.deepEqual(strings.slice(0,17),['SRT-AMOUNT','SRT-BRANCH','SRT-DATE','SRT-NO','MST-YYYYMM = SRT-YYYYMM','MST-YYYYMM NOT = SRT-YYYYMM','MST-YYYYMM = ZERO','SRT-YYYYMM = ZERO','ADD MST-BRANCH(CNT) TO MST-AMOUNT','ADD MST-BRANCH(SRT-BRANCH) TO MST-AMOUNT','ADD SRT-AMOUNT TO MST-BRANCH(CNT)','ADD SRT-AMOUNT TO MST-BRANCH(SRT-BRANCH)','MOVE SRT-AMOUNT TO MST-BRANCH(SRT-BRANCH)','行番号30と31の間','行番号40と41の間','行番号47と48の間','行番号52と53の間']);
 assert.deepEqual(strings.slice(17,21),['1 THRU 12',`${start} THRU ${start-1}`,starts.join(', '),ends.join(', ')]);
 assert.deepEqual(strings.slice(21),['ADD 1 TO CR-QUART','ADD 3 TO CR-QUART','MOVE CNT TO CR-QUART','MOVE ZERO TO CR-QUART']);
 const text=JSON.stringify(body.prompt);for(const condition of [`${start}月〜翌年${sequence[11]}月`,`毎年${start}月`,'レコード件数がゼロの月はない','各支店で一意','9桁を超えることはない','2000年度から前々年度','主キーは売上年月','順不同','西暦の年、月、日','01〜08'])assert(text.includes(condition),condition);
 const programs=body.prompt.filter(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile==='legacy-2017-pm10-program');assert.equal(programs.length,1);assert(programs[0].type==='diagram');const lines=programs[0].alt.split('\n');assert.equal(lines.length,54);
 const line=(n:number)=>lines[n-1].replace(/^\s*\d+\s+/,'').trim().replace(/ +/g,' ');
 const fixed:Record<number,string>={1:'DATA DIVISION.',2:'FILE SECTION.',3:'SD SRT-FILE.',4:'01 SRT-REC.',5:'02 SRT-BRANCH PIC 9(2).',6:'02 SRT-NO PIC 9(6).',7:'02 SRT-DATE.',8:'03 SRT-YYYYMM PIC 9(6).',9:'03 SRT-DD PIC 9(2).',10:'02 SRT-AMOUNT PIC 9(6).',11:'FD SAL-FILE.',12:'01 SAL-REC PIC X(22).',13:'FD MST-FILE.',14:'01 MST-REC.',15:'02 MST-YYYYMM.',16:'03 MST-YYYY PIC 9(4).',17:'03 MST-MM PIC 9(2).',18:'02 MST-AMOUNT PIC 9(10).',19:'02 MST-TABLE.',20:'03 MST-BRANCH PIC 9(9) OCCURS 8.',21:'WORKING-STORAGE SECTION.',22:'77 CNT PIC 9(1).',23:'77 SRT-FLAG PIC X(1) VALUE SPACE.',24:'88 SRT-EOF VALUE "E".',25:'PROCEDURE DIVISION.',26:'MAIN-PROC.',27:'OPEN EXTEND MST-FILE.',28:'SORT SRT-FILE ASCENDING KEY [a]',29:'USING SAL-FILE',30:'OUTPUT PROCEDURE IS RET-PROC.',31:'CLOSE MST-FILE.',32:'STOP RUN.',33:'RET-PROC.',34:'INITIALIZE MST-REC.',35:'PERFORM UNTIL SRT-EOF',36:'RETURN SRT-FILE AT END SET SRT-EOF TO TRUE',37:'PERFORM WRI-PROC',38:'NOT AT END PERFORM ADD-PROC',39:'END-RETURN',40:'END-PERFORM.',41:'ADD-PROC.',42:'IF [b] THEN',43:'PERFORM WRI-PROC',44:'INITIALIZE MST-REC',45:'MOVE SRT-YYYYMM TO MST-YYYYMM',46:'END-IF.',47:'[c].',48:'WRI-PROC.',49:'IF MST-YYYY NOT = ZERO THEN',50:'PERFORM VARYING CNT FROM 1 BY 1 UNTIL CNT > 8',51:'[d]',52:'END-PERFORM',53:'WRITE MST-REC',54:'END-IF.'};
 for(const [n,s]of Object.entries(fixed))assert.equal(line(Number(n)),s,`source line ${n}`);
 const banks=body.prompt.filter(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile==='legacy-2017-pm10-choice-group');assert.equal(banks.length,6);
 const bankOffsets=[0,4,8,13,17,21],bankCounts=[4,4,5,4,4,4];banks.forEach((b,i)=>{assert(b.type==='diagram'&&b.scene.kind==='source_figure');assert.deepEqual(b.scene.values,[value,i]);assert.equal(b.alt,strings.slice(bankOffsets[i],bankOffsets[i]+bankCounts[i]).map((text,j)=>'アイウエオ'[j]+' '+text).join('。'));});
 assert.equal(body.prompt.filter(b=>b.type==='table').length,0,'原の解答群を補助表へ変換しない');
 assert.equal(body.prompt.filter(b=>b.type==='diagram').length,11);assert(body.explanation.includes(ends.join('、')));assert(body.explanation.includes('最終月・第4四半期'));
}
