import assert from "node:assert/strict";
import type {Block} from "../../src/core/types";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2019PmDatabaseReview as review} from "./legacy-2019-pm-database-review";
const text=(bs:Block[])=>bs.map(b=>b.type==="paragraph"||b.type==="code"?b.text:"").join("\n");
const oneText=(bs:Block[])=>{assert.equal(bs.length,1);assert.equal(bs[0].type,"paragraph");return text(bs);};
export function reviewedSqlLike(value:string,pattern:string):boolean{
  const table=Array.from({length:pattern.length+1},()=>Array(value.length+1).fill(false));table[0][0]=true;
  for(let i=1;i<=pattern.length;i++)for(let j=0;j<=value.length;j++)table[i][j]=pattern[i-1]==="%"?(table[i-1][j]||j>0&&table[i][j-1]):j>0&&table[i-1][j-1]&&(pattern[i-1]==="_"||pattern[i-1]===value[j-1]);
  return table[pattern.length][value.length];
}
export type ReviewedMeasurement={height:number|null;year:string;sex:string};
export type ReviewedCategory={name:string;low:number;high:number};
export type ReviewedJoinedRow={className:string;height:number|null};
/** Independent relational outer join, operating on explicitly provided rows.
 * It does not execute source SQL or import any production generation helper. */
export function reviewedRightJoin(categories:ReviewedCategory[],records:ReviewedMeasurement[],year:string,sex:string):ReviewedJoinedRow[][]{
  return categories.map(category=>{const matches=records.filter(r=>r.year===year&&r.sex===sex&&r.height!==null&&r.height>=category.low&&r.height<=category.high);return matches.length?matches.map(r=>({className:category.name,height:r.height})):[{className:category.name,height:null}];});
}
export function reviewedSqlAggregate(rows:ReviewedJoinedRow[],expression:string):number|string|null{
  if(expression==="COUNT(*)")return rows.length;
  if(expression==="COUNT(身長)")return rows.reduce((n,r)=>n+Number(r.height!==null),0);
  if(expression==="COUNT(身長階級)")return rows.reduce((n,r)=>n+Number(r.className!==null),0);
  if(expression==="MAX(身長)"){const h=rows.map(r=>r.height).filter((n):n is number=>n!==null);return h.length?Math.max(...h):null;}
  if(expression==="MAX(身長階級)")return rows.map(r=>r.className).sort().at(-1)??null;
  // The class column is a GROUP BY key and is legal here, but yields its
  // label rather than the requested person count. Height is not a group key.
  if(expression==="身長階級")return rows[0]?.className??null;
  return "NOT_A_GROUP_AGGREGATE";
}
function oneTable(bs:Block[]){assert.equal(bs.length,1);assert(bs[0].type==="table");return bs[0];}
const tenths=(s:string)=>{assert(/^\d{1,3}\.\d$/.test(s),s);const[a,b]=s.split(".");return Number(a)*10+Number(b);};
export function assertLegacy2019Database(source:string,body:GeneratedBody,values:number[]){
  assert.equal(source,review.source);const[decade,sex,yearOrder,gradeOrder,translation]=values,yearStart=2010+10*decade,yearEnd=yearStart+9,selectedSex=sex===0?"男":"女",prefix=String(yearStart).slice(0,3),heightDelta=translation*50,prompt=text(body.prompt);
  assert.equal(body.correctIndex,undefined);assert.deepEqual(body.answerParts?.map(p=>p.choiceIds.length),[6,5,4,5,5,6]);assert.equal(body.choices.length,31);
  for(const premise of review.premises)assert(prompt.includes(premise),premise);
  assert(prompt.includes(`${yearStart}年度から${yearEnd}年度`));assert(prompt.includes(`${sex===0?"男子":"女子"}生徒の体格`));
  const codes=body.prompt.filter(b=>b.type==="code");assert.equal(codes.length,5);for(const c of codes)assert.equal(c.language,"sql");
  assert.equal((prompt.match(/身長 DECIMAL\(4, 1\)/g)??[]).length,1);assert.equal((prompt.match(/体重 DECIMAL\(4, 1\)/g)??[]).length,1);for(const s of ["年度 CHAR(4)","学年 INT","肺活量 INT","氏名 VARCHAR(50)","ふりがな VARCHAR(50)","生年月日 DATE","性別 SMALLINT","特記事項 VARCHAR(512)","xには4を、yには1","測定結果ビュー (年度, 学年, 性別, 生年月日, 身長, 体重)","AVG(身長)","MIN(身長)","AVG(体重)","MAX(体重)","MIN(体重)","GROUP BY 年度, 学年, 性別","ORDER BY 年度 ［c1］, 学年 ［c2］"])assert(prompt.includes(s),s);
  const tables=body.prompt.filter(b=>b.type==="table");assert.equal(tables.length,3);const [transition,classTable,frequency]=tables;
  assert.deepEqual(transition.columns,["年度","学年","性別","平均身長","最大身長","最小身長","平均体重","最大体重","最小体重"]);assert.equal(transition.rows.length,5);assert.deepEqual(transition.rows[1],Array(9).fill("⋮"));
  const visible=transition.rows.filter(r=>r[0]!=="⋮"),targetYear=yearOrder===0?yearEnd:yearStart,startYear=yearOrder===0?yearStart:yearEnd,grades=gradeOrder===0?[1,2,3]:[3,2,1];
  const reference=[review.originalTransitionRows[0],...grades.map(g=>review.originalTransitionRows[g])];
  visible.forEach((r,i)=>{assert.equal(r.length,9);assert.equal(r[0],String(i?targetYear:startYear));assert.equal(r[1],String(i?grades[i-1]:grades[0]));assert.equal(r[2],selectedSex);for(let k=3;k<9;k++)assert.equal(tenths(r[k]),tenths(reference[i][k])+(k<6?heightDelta:0));});
  assert.deepEqual(classTable.columns,["身長階級","階級下限","階級上限"]);assert.equal(classTable.rows.length,7);
  const categories=classTable.rows.map((r,i)=>{assert.equal(r.length,3);const old=review.originalClasses[i],low=i?tenths(old[1])+heightDelta:0,high=i===6?9999:tenths(old[2])+heightDelta;assert.equal(tenths(r[1]),low);assert.equal(tenths(r[2]),high);assert.equal(r[0],i===0?`${(high+1)/10}cm未満`:i===6?`${low/10}cm以上`:`${low/10}cm以上${(high+1)/10}cm未満`);return{name:r[0],low,high};});
  categories.forEach((c,i)=>{if(i)assert.equal(c.low,categories[i-1].high+1);});assert.equal(categories[0].low,0);assert.equal(categories[6].high,9999);
  assert.deepEqual(frequency.columns,["身長階級","人数"]);assert.deepEqual(frequency.rows,categories.map((c,i)=>[c.name,String(review.originalWrongFrequencies[i])]));
  const maxHeight=Math.max(...visible.filter(r=>r[0]===String(targetYear)).map(r=>tenths(r[4]))),empty=categories[6];assert(maxHeight<empty.low);assert(prompt.includes(`全学年での最大身長が${(maxHeight/10).toFixed(1)}cm`));assert(prompt.includes(`${empty.low/10}cm以上の生徒は存在しない`));assert(prompt.includes(`${targetYear}年度の${sex===0?"男子":"女子"}`));
  assert(codes[4].text.includes(`AND 年度 = '${targetYear}'\n  AND 性別 = '${selectedSex}'`));assert(codes[4].text.includes("RIGHT OUTER JOIN 身長階級表 ON\n  身長 BETWEEN 階級下限 AND 階級上限"));assert(codes[4].text.includes("COUNT(*) AS 人数"));assert(!codes[4].text.includes("WHERE"));
  const aChoices=body.choices.slice(0,6).map(oneText);assert.deepEqual(aChoices,[`LIKE '${prefix}_'`,`LIKE '${yearStart}'`,`LIKE '${yearEnd}'`,`= '${prefix}%'`,`= '${prefix}_'`,`= '${prefix}*'`]);
  const expectedYears=Array.from({length:10},(_,i)=>String(yearStart+i)),candidates=[...Array.from({length:80},(_,i)=>String(1980+i)),String(yearStart)+"0","20","ABCD"];
  const aTruth=aChoices.map(choice=>{const match=choice.match(/^(LIKE|=) '([^']+)'$/);assert(match);const selected=candidates.filter(y=>match[1]==="LIKE"?reviewedSqlLike(y,match[2]):y===match[2]);return JSON.stringify(selected)===JSON.stringify(expectedYears);});
  const bChoices=body.choices.slice(6,11).map(oneText);assert.deepEqual(bChoices,[...review.originalChoices.b]);const bTruth=bChoices.map(literal=>literal===`'${selectedSex}'`);
  const cTruth=body.choices.slice(11,15).map((bs,i)=>{const t=oneTable(bs);assert.deepEqual(t.columns,["c1","c2"]);assert.deepEqual(t.rows,[[...review.originalChoices.c[i]]]);const direction=t.rows[0],pairs=visible.map(r=>[Number(r[0]),Number(r[1])]),sorted=[...pairs].sort((a,b)=>(a[0]-b[0])*(direction[0]==="ASC"?1:-1)||(a[1]-b[1])*(direction[1]==="ASC"?1:-1));return JSON.stringify(pairs)===JSON.stringify(sorted);});
  const constraintFacts={UNIQUE:{unique:true,notNull:false,parent:false},検査:{unique:false,notNull:false,parent:false},参照:{unique:false,notNull:false,parent:true},主キー:{unique:true,notNull:true,parent:false},非NULL:{unique:false,notNull:true,parent:false}};
  const constraints=(offset:number)=>body.choices.slice(offset,offset+5).map((bs,i)=>{const s=oneText(bs);assert.equal(s,review.originalChoices.constraints[i]);return constraintFacts[s as keyof typeof constraintFacts];});
  const dTruth=constraints(15).map(f=>f.unique&&f.notNull),eTruth=constraints(20).map(f=>f.parent);
  // An artificial independent counterexample, not the unpublished student
  // data behind IPA's aggregate tables. Include zero, repeated values,
  // interval edges, wrong ON filters and a NULL measurement.
  const input:ReviewedMeasurement[]=[0,categories[1].low,categories[1].low,categories[1].high,categories[2].low,maxHeight].map(height=>({height,year:String(targetYear),sex:selectedSex}));input.push({height:empty.low,year:String(targetYear+1),sex:selectedSex},{height:empty.low,year:String(targetYear),sex:selectedSex==="男"?"女":"男"},{height:null,year:String(targetYear),sex:selectedSex});
  const joined=reviewedRightJoin(categories,input,String(targetYear),selectedSex),counts=Array(7).fill(0);for(const r of input)if(r.year===String(targetYear)&&r.sex===selectedSex&&r.height!==null){const at=categories.findIndex(c=>r.height!>=c.low&&r.height!<=c.high);assert(at>=0);counts[at]++;}
  assert.equal(joined[6].length,1);assert.equal(joined[6][0].height,null);assert.equal(reviewedSqlAggregate(joined[6],"COUNT(*)"),1);assert.equal(reviewedSqlAggregate(joined[6],"COUNT(身長階級)"),1);assert.equal(reviewedSqlAggregate(joined[6],"COUNT(身長)"),0);
  const fTruth=body.choices.slice(25,31).map((bs,i)=>{const expression=oneText(bs);assert.equal(expression,review.originalChoices.f[i]);return joined.every((rows,j)=>reviewedSqlAggregate(rows,expression)===counts[j]);});
  const truth=[aTruth,bTruth,cTruth,dTruth,eTruth,fTruth],offsets=[0,6,11,15,20,25];assert.equal(body.partAnswers?.length,6);
  truth.forEach((facts,i)=>{assert.equal(facts.filter(Boolean).length,1,`part ${i} unique semantic answer`);const part=body.answerParts![i],answer=body.partAnswers![i];assert.equal(part.id,`part-${"abcdef"[i]}`);assert.deepEqual(part.choiceIds,facts.map((_,j)=>`choice-value-${offsets[i]+j+1}`));assert.equal(answer.kind,"choice");if(answer.kind==="choice"){assert.equal(answer.partId,part.id);assert.equal(answer.choiceId,part.choiceIds[facts.indexOf(true)]);}});
  for(const s of ["COUNT(身長)","COUNT(*)","COUNT(身長階級)","NULL","PRIMARY KEY","FOREIGN KEY","CASE",prefix,"_",yearOrder?"年度降順":"年度昇順",gradeOrder?"学年降順":"学年昇順"])assert(body.explanation.includes(s),s);
}
