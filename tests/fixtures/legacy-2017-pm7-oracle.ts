import assert from'node:assert/strict';
import type{GeneratedBody}from'../../src/core/generators/definition';
import{pm7Figure,pm7Profile}from'../../src/core/generators/legacy-2017-pm7-data';
import{pm7SourceReview as review}from'./legacy-2017-pm7-source-review';
/** Independent table/rule interpreter. No producer arithmetic or answer map is imported. */
export function inspectPm7(body:GeneratedBody){
 const block=body.prompt.find(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile===pm7Profile&&b.scene.values[0]===3);assert(block?.type==='diagram'&&block.scene.kind==='source_figure');const table=pm7Figure(block.scene.profile,block.scene.values);assert(table.kind==='inventory');
 const computed=table.data.map(r=>{const weeks=review.rules.normal[r.group as 'A'|'B'|'C'][r.shelf as '短期品'|'中期品'|'長期品'];let old=0,next=0;for(let w=0;w<4;w++){old+=r.weekly[w];if(w<weeks)next+=r.weekly[w];}return{old:Math.max(0,old-r.stock),next:Math.max(0,next-r.stock)};});
 const expected=[computed[0].next,computed[2].old-computed[2].next,computed.reduce((n,r)=>n+r.old-r.next,0)],parts=body.answerParts!,answers=body.partAnswers!;let checked=0;
 function selected(i:number){const a=answers[i];assert(a.kind==='choice');return a.choiceId;}
 function choice(i:number,j:number){const id=parts[i].choiceIds[j],c=body.choices[Number(id.replace('choice-value-',''))-1];assert(c);return c;}
 for(let p=0;p<3;p++){const facts=review.knowledge[p];assert.equal(parts[p].choiceIds.length,4);assert.equal(facts.truth.filter(Boolean).length,1);facts.truth.forEach((truth,j)=>{assert(choice(p,j)[0].type==='paragraph');assert.equal(selected(p)===parts[p].choiceIds[j],truth);checked++;});}
 // The first three columns fix normal/A as 3,2,2; known remote/A columns fix 3,2.
 for(let j=0;j<6;j++){const b=choice(3,j)[0];assert(b.type==='diagram'&&b.scene.kind==='source_figure');const pair=pm7Figure(b.scene.profile,b.scene.values);assert(pair.kind==='pair');const categories=[pair.data[0],pair.data[1],...['短期品','中期品','長期品'].filter(x=>!pair.data.includes(x))]as ('短期品'|'中期品'|'長期品')[];const weeks=categories.map(s=>review.rules.normal.A[s]),remote=categories.slice(1).map(s=>review.rules.remote.A[s]);const truth=JSON.stringify(weeks)==='[3,2,2]'&&JSON.stringify(remote)==='[3,2]';assert.equal(selected(3)===parts[3].choiceIds[j],truth);checked++;}
 const targetWeeks=[review.rules.normal.B.長期品,review.rules.normal.B.中期品,review.rules.normal.B.短期品,review.rules.remote.A.長期品],expectedMatrix=[4,3,2].map(week=>targetWeeks.map(w=>w===week?'X':'−'));for(let j=0;j<6;j++){const b=choice(4,j)[0];assert(b.type==='diagram'&&b.scene.kind==='source_figure');const matrix=pm7Figure(b.scene.profile,b.scene.values);assert(matrix.kind==='matrix');const truth=JSON.stringify(matrix.data)===JSON.stringify(expectedMatrix);assert.equal(selected(4)===parts[4].choiceIds[j],truth);checked++;}
 expected.forEach((n,p)=>{const truths=parts[p+5].choiceIds.map((_,j)=>{const b=choice(p+5,j)[0];assert(b.type==='paragraph');const truth=Number(b.text)===n;assert.equal(selected(p+5)===parts[p+5].choiceIds[j],truth);checked++;return truth;});assert.equal(truths.filter(Boolean).length,1);});return{expected,checked};
}
