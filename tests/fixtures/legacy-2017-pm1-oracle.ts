/** Independent source order + repeated-addition/global allocation oracle.
 * No production model/producer import; all text/truth comes from image-reviewed facts. */
import assert from 'node:assert/strict';
import facts from './legacy-2017-pm1-facts.json';
import type {GeneratedBody} from '../../src/core/generators/definition';
import type {Block} from '../../src/core/types';
export const pm1Facts=facts;
const original=facts.original,methods=original.bcSharedChoices;
const money=(n:number)=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
const paragraph=(text:string):Block=>({type:'paragraph',text});
export function pm1IndependentCosts(months:number,people:number[]){
 return people.map(n=>{let vpn=100000,online=0,mail=0;for(let month=0;month<months;month++){vpn+=50000;for(let person=0;person<n;person++)online+=500;}for(let person=0;person<n;person++)mail+=30000;return[vpn,online,mail];});
}
export function pm1AllocationReview(months:number,people:number[],high:boolean[]){
 const costs=pm1IndependentCosts(months,people),assignments:{methods:number[];total:number}[]=[];
 for(let encoded=0;encoded<81;encoded++){let k=encoded;const assignment=Array.from({length:4},()=>{const v=k%3;k=Math.floor(k/3);return v;});if(assignment.some((method,i)=>high[i]&&method===1))continue;let total=0;for(let i=0;i<4;i++)total+=costs[i][assignment[i]];assignments.push({methods:assignment,total});}
 assignments.sort((a,b)=>a.total-b.total);assert(assignments[0].total<assignments[1].total);const selected=costs.map((row,i)=>{const eligible=row.map((cost,method)=>({cost,method})).filter(x=>!(high[i]&&x.method===1)).sort((a,b)=>a.cost-b.cost);assert(eligible[0].cost<eligible[1].cost);return eligible[0].method;});assert.deepEqual(assignments[0].methods,selected);return{costs,selected,assignments};
}
function expectedSourceBlocks(v:number){
 const condition=facts.conditions[v];assert(condition);const {months,people,high}=condition,{costs,selected}=pm1AllocationReview(months,people,high),d=facts.gaps.scenarios[v].dChoices;
 const out:Block[]=[];const add=(s:string)=>out.push(paragraph(s));const group=(items:readonly string[])=>items.forEach((s,i)=>add('アイウエオカキ'[i]+'　'+s));
 add(original.majorQuestion);add('問1 '+original.question);add(original.context[0]);add(original.context[1]);add(original.context[2].replace('[a]','［a］'));add('設問1 '+original.subquestions[0].prompt);add('解答群');group(original.subquestions[0].choices!);add('設問2 '+original.subquestions[1].prompt);add('aに関する解答群');group(original.subquestions[1].choices!);add('設問3 '+original.subquestions[2].prompt);add(original.subquestions[2].opening!.replace('期間は12か月','期間は'+months+'か月'));add('［'+original.instructionsTitle+'］');out.push({type:'list',ordered:true,items:original.instructions});add(original.table1Introduction);out.push({type:'table',caption:'表1 '+original.table1.caption,columns:original.table1.columns,rows:people.map((n,i)=>['PQRS'[i]+'社',String(n),high[i]?'“低”と“高”':'“低”だけ'])});add(original.candidatesIntroduction);add(original.candidatesHeading);original.candidateDescriptions.forEach((c,i)=>{add('('+String(i+1)+') '+c.method);add(c.text);});add(original.table2Intro);out.push({type:'table',caption:'表2 '+original.table2.caption,columns:original.table2.columns,rows:[['P社',methods[selected[0]],money(costs[0][selected[0]])],['Q社','［b］','非表示'],['R社','非表示','非表示'],['S社','［c］','［d］']]});add('注記 '+original.table2.note);add('b，cに関する解答群');group(methods);add('dに関する解答群');group(d.map(money));return out;
}
// Fixed knowledge account checks all original alternatives, rather than trusting the answer ID.
const knowledgeExplanation=[
 '設問1：暗号ファイルと復号鍵を別々のメールにしても、両方のメールが盗聴される可能性が残る。圧縮と暗号化の順序だけで解読の容易さは決まらず、共通鍵という分類だけで他の全方式より解読が容易ともいえない。ファイル名の保護は形式や設定により異なり、本文にはそれを特定する条件がない。別送鍵の秘匿が保証されないことを直接指摘する理由を選ぶ。',
 '設問2 a：送信者が暗号化に使うのは受信者の公開鍵で、対応する秘密鍵は受信者が秘匿する。相手のものであることを確認しないと、別人の公開鍵へ差し替えられるおそれがある。共通鍵、パスワード、ディジタル署名は暗号化のため取得する公開鍵そのものではない。',
 '設問3：協力会社ごとに方式を選べ、協力会社間の受渡しはない。各社の全参加者について、初期費用と全期間の運用費用を計上する。X社社員のオンライン運用費用とメール初期費用はこのプロジェクトに含めない。',
];
export function pm1ExpectedExplanation(v:number){
 const c=facts.conditions[v],r=pm1AllocationReview(c.months,c.people,c.high),lines=[...knowledgeExplanation];
 for(let i=0;i<4;i++){const row=r.costs[i],kind=c.high[i]?'“低”と“高”を扱うためオンラインストレージは利用禁止。':'“低”だけなのでオンラインストレージも候補。';lines.push('PQRS'[i]+'社：'+kind+'VPNは100,000＋50,000×'+c.months+'＝'+money(row[0])+'円、オンラインは'+c.people[i]+'×500×'+c.months+'＝'+money(row[1])+'円、メールは'+c.people[i]+'×30,000＝'+money(row[2])+'円。適合する方式のうち最小は'+methods[r.selected[i]]+'で'+money(row[r.selected[i]])+'円。');}
 const row=r.costs[3];lines.push('bは'+methods[r.selected[1]]+'、cは'+methods[r.selected[3]]+'、dは'+money(row[r.selected[3]])+'円。S社の三方式の数値は'+methods.map((s,i)=>s+'は'+money(row[i])+'円').join('、')+'だが、料金だけでなく機密度の条件も満たす必要がある。');
 lines.push(['30,000円はメール導入・研修の1人分だけを数えた値。',money(r.costs[0][1])+'円はP社のオンライン費用という別の行の値。',money(row[1])+'円はS社のオンライン費用だが、機密度“高”を扱うので採用できない。',money(r.costs[2][1])+'円はR社のオンライン費用という別の行の値。','S社のVPN '+money(row[0])+'円とメール '+money(row[2])+'円を比較し、適合する最小費用を選ぶ。',money(r.costs[2][2])+'円はR社全員のメール導入・研修費で、S社の費用ではない。'].join(' '));return lines.join('\n');
}
export function assertLegacy2017Pm1(body:GeneratedBody,v:number){
 assert(Number.isInteger(v)&&v>=0&&v<4);const condition=facts.conditions[v],truth=facts.truths[v],gap=facts.gaps.scenarios[v];assert.deepEqual(body.prompt,expectedSourceBlocks(v),'all source blocks in original order');assert.deepEqual(body.contexts,undefined);assert.equal(body.correctIndex,undefined);
 const opening=body.prompt[19];assert(opening.type==='paragraph');const months=Number(opening.text.match(/期間は(\d+)か月/)?.[1]);const table1=body.prompt[23];assert(table1.type==='table');const people=table1.rows.map(row=>Number(row[1])),high=table1.rows.map(row=>row[2]==='“低”と“高”');assert.deepEqual({months,people,high},{months:condition.months,people:condition.people,high:condition.high});
 const independent=pm1AllocationReview(months,people,high);assert.equal(independent.assignments.length,condition.eligibleAllocations);assert.deepEqual(independent.selected,condition.uniqueMinimumAssignment);assert.equal(independent.assignments[0].total,condition.minimumProjectSumNotShownToExaminee);assert.deepEqual(independent.costs,condition.allCompanyFacts.map(f=>f.costsByOriginalMethodOrder));
 const choices=body.choices.map(b=>{assert.equal(b.length,1);const p=b[0];assert(p.type==='paragraph');return p.text;});assert.deepEqual(choices,[...original.subquestions[0].choices!,...original.subquestions[1].choices!,...methods,...gap.dChoices.map(money)]);assert.equal(new Set(choices).size,19);assert.deepEqual(body.answerParts?.map(p=>p.choiceIds.length),[4,5,3,3,7]);assert.deepEqual(body.answerParts?.map(p=>p.id),['part-q1','part-a','part-b','part-c','part-d']);assert.deepEqual(body.answerParts?.map(p=>p.label),['設問1','設問2 a','設問3 b','設問3 c','設問3 d']);assert.deepEqual(body.answerParts?.[2].choiceIds,body.answerParts?.[3].choiceIds);assert.equal(body.partAnswers?.length,5);
 let predicates=0;truth.parts.forEach((part,i)=>{const ids=body.answerParts![i].choiceIds;assert.deepEqual(ids.map(id=>choices[Number(id.replace('choice-value-',''))-1]),part.choices.map(c=>c.text));const trueIndices=part.choices.flatMap((c,k)=>{predicates++;return c.matchesAskedPredicate?[k]:[];});assert.equal(trueIndices.length,1);const answer=body.partAnswers![i];assert.equal(answer.kind,'choice');assert('choiceId'in answer);assert.equal(answer.partId,body.answerParts![i].id);assert.equal(answer.choiceId,ids[trueIndices[0]]);});assert.equal(predicates,22);
 const d=choices.slice(12).map(s=>Number(s.replaceAll(',','')));assert.deepEqual(d,[30000,independent.costs[0][1],independent.costs[3][1],independent.costs[2][1],independent.costs[3][0],independent.costs[3][2],independent.costs[2][2]].sort((a,b)=>a-b));assert(d.every(Number.isInteger));assert.equal(d[4],gap.selectedSCost);assert.equal(Math.min(...d.filter(x=>x!==d[4]).map(x=>Math.abs(x-d[4]))),gap.nearestDisplayedDChoiceGap);const admissibleS=independent.costs[3].filter((_,i)=>!(high[3]&&i===1)).sort((a,b)=>a-b);assert.equal(admissibleS[1]-admissibleS[0],gap.methodRunnerUpGap);assert.equal(body.explanation,pm1ExpectedExplanation(v),'all knowledge, conditions, costs, distractor explanations');return{variant:v,allocations:81,eligible:independent.assignments.length,predicates,methodGap:gap.methodRunnerUpGap,numericGap:gap.nearestDisplayedDChoiceGap};
}
