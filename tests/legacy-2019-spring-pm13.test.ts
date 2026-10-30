import test from'node:test';import assert from'node:assert/strict';import{writeSpring2019Evidence}from'./fixtures/legacy-2019-spring-test-workspace';import{createElement as h}from'react';import{renderToStaticMarkup}from'react-dom/server';
import{legacy2019SpringPm13Definition as definition,spring2019Pm13SourceBody as sourceBody}from'../src/core/generators/legacy-2019-spring-pm13';
import{spring2019Pm13Data as data,spring2019Pm13Sheets as sheets,spring2019Pm13Figure as model,type Spring2019Sale}from'../src/core/generators/legacy-2019-spring-pm13-model';
import{Legacy2019SpringPm13Figure as Figure}from'../src/ui/Legacy2019SpringPm13Figure';
import{Spring2019SheetMachine as Machine}from'./fixtures/legacy-2019-spring-sheet-machine';
import gold from'./fixtures/legacy-2019-spring-pm13-source-review.json';
import negativeCorpus from'./fixtures/legacy-2019-spring-pm13-unassigned-negative-corpus.json';
const right=[5,2,2,4,4,1],offsets=[0,6,10,15,21,27],classRows=[['C','B','A'],['C','A','S'],['B','A','S']];
const normal=(s:string)=>s.replace(/\s/g,'').replaceAll('，',',').replaceAll('＋','+').replaceAll('−','-').replaceAll('＊','*').replaceAll('／','/').replaceAll('＝','=').replaceAll('＜','<').replaceAll('＞','>');
const decode=(s:string)=>s.replace(/<span[^>]*data-source-blank="([a-f])"[^>]*>[a-f]<\/span>/g,'［$1］').replace(/<[^>]*>/g,'').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&').replaceAll('&#x27;',"'").replaceAll('&quot;','"');
const serial=(date:string)=>Math.round((Date.parse(date+'T00:00:00Z')-Date.UTC(1900,0,1))/86400000);
function oracle(sales:Spring2019Sale[],product:string,members=Array.from({length:531},(_,i)=>i+1001)){
 const byMember=members.map(member=>{const rows=sales.filter(s=>s.member===member),visits=new Set(rows.map(s=>s.receipt)).size,amount=rows.map(s=>s.unitPrice*s.quantity).reduce((a,b)=>a+b,0),lastDate=rows.map(s=>s.date).sort().at(-1)??'';
  const amountRank=[0,40000,80000].filter(n=>amount>=n).length,visitRank=[0,6,12].filter(n=>visits>=n).length;
  return{member,amount,visits,lastDate,classification:classRows[visitRank-1][amountRank-1],coupon:Math.trunc(amount/50000)*1000};});
 const productRows=members.map(member=>{const rows=sales.filter(s=>s.member===member&&s.product===product);return{member,amount:rows.map(s=>s.unitPrice*s.quantity).reduce((a,b)=>a+b,0),lastDate:rows.map(s=>s.date).sort().at(-1)??''};}).filter(s=>s.amount>0).sort((a,b)=>a.amount!==b.amount?a.amount>b.amount?-1:1:a.lastDate<b.lastDate?-1:a.lastDate>b.lastDate?1:a.member-b.member);
 return{members:byMember,productRows};
}
function machine(sales:Spring2019Sale[],product:string,members:{member:number;amount:number;visits:number;lastDate:string}[],poison:number|'reject'=0){const m=new Machine('商品別管理',poison);m.set('商品別管理','B1',product);m.set('会員管理','B1',sales.length);m.set('会員管理','E1',members.length);
 sales.forEach((s,i)=>[s.receipt,serial(s.date),s.member,s.product,s.unitPrice,s.quantity,s.amount,s.sequence].forEach((v,j)=>m.set('販売データ','ABCDEFGH'[j]+(i+2),v)));
 members.forEach((row,i)=>[row.member,row.amount,row.visits,row.lastDate?serial(row.lastDate):null].forEach((v,j)=>m.set('会員管理','ABCD'[j]+(i+4),v)));
 [0,6,12].forEach((v,i)=>m.set('分類表','C'+(i+4),v));[0,40000,80000].forEach((v,i)=>m.set('分類表','DEF'[i]+'3',v));classRows.forEach((row,i)=>row.forEach((v,j)=>m.set('分類表','DEF'[j]+(i+4),v)));return m;}
function displayedMacro(scenario:number,fill=right){const b=scenario===0?sourceBody(0):definition.build([scenario]),html=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm13-macro',values:[scenario,0],caption:'〔マクロ：manageMembers〕'}));
 const rows=[...html.matchAll(/data-macro-row="(\d+)" data-level="(\d+)" data-control="([^"]+)"[^>]*>[\s\S]*?<code>([\s\S]*?)<\/code><\/div>/g)].map((m,i)=>{assert.equal(Number(m[1]),i);return{level:Number(m[2]),control:m[3],text:decode(m[4]).replace(/［([d-f])］/g,(_,part)=>{const index='abcdef'.indexOf(part),choice=b.choices[offsets[index]+fill[index]][0];assert(choice.type==='paragraph');return choice.text;})};});assert.equal(rows.length,33);return{rows,html};}
function output(m:Machine,count:number){return Array.from({length:count},(_,i)=>['A','B','C'].map(c=>m.get('商品別管理',c+(i+3))));}
function copyDown(source:string,rows:number){return source.replace(/\b([A-Z]+)(\$?)(\d+)/g,(_,col,fixed,row)=>col+fixed+(Number(row)+(fixed?0:rows)));}
test('Q13 source0 literal cells, partial observations, all 33 source bank identities and all 33 macro rows/control levels match independent source gold',()=>{
 const s=sheets(0);for(const key of['product','salesCount','memberCount','productCount','sales','members','productRows']as const)assert.deepEqual(s[key],gold.source0[key]);
 assert.equal(s.kind,'partial-source');assert.throws(()=>data(0));
 const b=sourceBody(0);assert.equal(b.choices.length,33);assert.deepEqual(b.answerParts!.map(p=>p.choiceIds.length),[6,4,5,6,6,6]);
 for(let part=0;part<6;part++)assert.deepEqual(b.answerParts![part].choiceIds.map(id=>{const c=b.choices[Number(id.replace('choice-value-',''))-1][0];assert(c.type==='paragraph');return normal(c.text);}),gold.banks[part].map(normal));
 const actual=displayedMacro(0);
 assert(actual.html.indexOf('data-heading-position="before-program"')<actual.html.indexOf('data-spring2019-pm13-macro'));
 const rawHtml=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm13-macro',values:[0,0],caption:'〔マクロ：manageMembers〕'}));
 const raw=[...rawHtml.matchAll(/data-macro-row="(\d+)" data-level="(\d+)" data-control="([^"]+)"[^>]*>[\s\S]*?<code>([\s\S]*?)<\/code><\/div>/g)].map(m=>[Number(m[2]),m[3],decode(m[4])]);assert.deepEqual(raw,gold.macro);
 const links=[...rawHtml.matchAll(/data-control-link="(\d+):(\d+)"/g)].map(m=>[Number(m[1]),Number(m[2])]);assert.deepEqual(links,[[2,5],[8,13],[7,14],[18,22],[17,23],[16,24],[15,25],[28,30],[27,32]]);
});
test('Q13 all 16 complete synthetic inputs keep original-scale 3333 lines/531 members, all source data constraints, independent totals/ranks/coupons and actual displayed cells',()=>{
 let saleCount=0;const signatures=new Set<string>();
 for(let scenario=1;scenario<=16;scenario++){
  const d=data(scenario),expected=oracle(d.sales,d.product),s=sheets(scenario);assert.equal(d.sales.length,3333);assert.equal(d.members.length,531);assert.equal(d.productRows.length,531);assert.deepEqual(d.members,expected.members);assert.deepEqual(d.productRows,expected.productRows);assert.equal(s.kind,'complete-synthetic');assert.equal(s.salesCount,3333);assert.equal(s.memberCount,531);assert.equal(s.productCount,expected.productRows.length);
  const completed=new Set<number>(),visits=new Map<number,number>();let lastReceipt=-1,lastDate='';
  for(let i=0;i<d.sales.length;i++){
   const row=d.sales[i];assert.equal(String(row.receipt).length,8);assert(row.member>=1001&&row.member<=9999);assert(row.date>=lastDate&&row.date>='2018-10-01'&&row.date<='2019-03-31');assert.equal(row.amount,row.unitPrice*row.quantity);assert(row.unitPrice>0&&Number.isInteger(row.unitPrice)&&row.quantity>0);assert.equal(row.unitPrice%100,0);
   if(row.receipt!==lastReceipt){assert(!completed.has(row.receipt));if(lastReceipt!==-1)completed.add(lastReceipt);const count=(visits.get(row.member)??0)+1;visits.set(row.member,count);assert(count<1000);assert.equal(row.sequence,row.member*1000+count);assert.equal(String(row.sequence).length,7);}else{assert.equal(row.sequence,0);assert.equal(row.date,d.sales[i-1].date);assert.equal(row.member,d.sales[i-1].member);assert.notEqual(row.product,d.sales[i-1].product);}lastReceipt=row.receipt;lastDate=row.date;saleCount++;
  }
  for(const m of d.members)assert(m.amount>0&&m.amount<=999999);assert.equal(d.sales[0].date,'2018-10-01');assert.equal(d.sales.at(-1)!.date,'2019-03-31');
  const ties=d.tieMembers.map(member=>expected.productRows.find(r=>r.member===member)!);assert.equal(ties[0].amount,ties[1].amount);assert.notEqual(ties[0].lastDate,ties[1].lastDate);
  const numeric=(text:string)=>Number(text.replaceAll(',',''));for(const row of s.sales.filter(r=>/^\d+$/.test(r[0])&&r[1]!=='')){const sale=d.sales[Number(row[0])-2];assert.deepEqual(row.slice(1),[String(sale.receipt),sale.date,String(sale.member),sale.product,sale.unitPrice.toLocaleString('en-US'),String(sale.quantity),sale.amount.toLocaleString('en-US'),String(sale.sequence)]);}
  for(const row of s.members.filter(r=>/^\d+$/.test(r[0])&&r[1]!=='')){const member=expected.members[Number(row[0])-4];assert.equal(numeric(row[2]),member.amount);assert.equal(row[4],member.lastDate);assert.equal(row[5],member.classification);assert.equal(numeric(row[6]),member.coupon);}
  for(const row of s.productRows.filter(r=>/^\d+$/.test(r[0]))){const result=expected.productRows[Number(row[0])-3];assert.deepEqual([numeric(row[1]),numeric(row[2]),row[3]],[result.member,result.amount,result.lastDate]);}
  for(const[kind,rows]of[['sales',s.sales],['members',s.members],['product',s.productRows]]as const){const html=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm13-'+kind,values:[scenario,0],caption:'図'}));for(const row of rows)if(/^\d+$/.test(row[0]))for(const cell of row.slice(1))assert(decode(html).includes(cell));}
  signatures.add(JSON.stringify(s));
 }
 assert.equal(saleCount,53328);assert.equal(signatures.size,16);
});
test('Q13 all16 registered full-size inputs execute the actual complete macro strictly under both logical evaluations with every date assigned and independent sorted output',()=>{
 const results:unknown[]=[];
 assert.deepEqual(definition.reference,[1]);assert.deepEqual(definition.fields.map(f=>[f.minimum,f.maximum]),[[1,16]]);assert.throws(()=>definition.build([0]));
 for(let scenario=1;scenario<=16;scenario++)for(const logicalEvaluation of['short','eager']as const){const d=data(scenario),expected=oracle(d.sales,d.product),m=machine(d.sales,d.product,expected.members,'reject');m.logicalEvaluation=logicalEvaluation;const shown=displayedMacro(scenario),run=m.run(shown.rows);
  const required=expected.productRows.map(row=>[row.member,row.amount,serial(row.lastDate)]);assert.equal(required.length,531);assert.equal(run.unassignedReads,0);assert.deepEqual(output(m,531),required,`scenario ${scenario}`);assert.equal(m.get('商品別管理','A534'),null);assert.equal(m.get('商品別管理','C534'),null);assert.equal(m.arrays.get('532,1'),0);assert(!m.arrays.has('532,2'));
  results.push({scenario,saleRows:d.sales.length,members:531,productRows:531,lastOutputRow:533,steps:run.steps,unassignedReads:0,logicalEvaluation});
 }
 writeSpring2019Evidence('q13-full-macro-witnesses.json',JSON.stringify({generatedDomain:[1,16],sourceReferenceForAnnual:0,baseReference:1,actualFullDatasets:16,distinctSalesRows:53328,actualStrictMacroExecutions:32,source0:'partial only; no hidden source rows inferred',macroInput:'Actual native SSR rows, all33controls/non-hole statements consumed by parser',allRegisteredGeneratedInputsStrictlyExecuted:true,generalOriginalUnassignedRuleEstablished:false,sourceArrayInitializationNotChanged:true,newAllPurchasePremiseAddedToPrompt:false,normalPoolChoice:'Concrete permitted datasets with all531members buying the selected product;531dates assigned before sort; memberCount+1 sentinel only has amount0 and its date is not read.',results},null,2)+'\n');
});
test('Q13 actual source formulas copied down retain relative/absolute ranges and match all 8496 synthetic member rows plus unused blank tails',()=>{
 const body=sourceBody(0),paragraphs=body.prompt.filter(b=>b.type==='paragraph').map(b=>b.text),templates=[paragraphs.find(s=>s.startsWith('IF(論理和'))!,paragraphs.find(s=>s.includes('表引き(分類表!'))!,paragraphs.find(s=>s==='IF(A4＝null, null, ［c］)')!];assert(templates.every(Boolean));
 let count=0;for(let scenario=1;scenario<=16;scenario++){const d=data(scenario),expected=oracle(d.sales,d.product),m=machine(d.sales,d.product,expected.members);m.sheet='会員管理';for(let member=0;member<expected.members.length;member++){
   const row=expected.members[member],answers=[row.lastDate?serial(row.lastDate):null,row.classification,row.coupon];
   for(let part=0;part<3;part++){const choice=body.choices[offsets[part]+right[part]][0];assert(choice.type==='paragraph');const formula=copyDown(templates[part].replace('［'+'abc'[part]+'］',choice.text),member);assert.equal(m.value(formula),answers[part],`${scenario}/${member}/${part}`);}count++;
  }
  for(const blankRow of[535,9002])for(let part=0;part<3;part++){const choice=body.choices[offsets[part]+right[part]][0];assert(choice.type==='paragraph');assert.equal(m.value(copyDown(templates[part].replace('［'+'abc'[part]+'］',choice.text),blankRow-4)),null);}
 }
 assert.equal(count,8496);
});
test('Q13 every one of the 33 choice references has independent truth or explicit counterexample; no option is silently dropped',()=>{
 const b=sourceBody(0),checks:unknown[]=[];
 // Small fixtures here are counterexamples for general formulas. The complete
 // generated-domain verification above retains source-scale data separately.
 const smallSales:Spring2019Sale[]=[
  {receipt:81001001,date:'2018-10-01',member:1002,product:'X',unitPrice:100,quantity:1,amount:100,sequence:1002001},
  {receipt:81002001,date:'2018-10-02',member:1001,product:'Y',unitPrice:200,quantity:1,amount:200,sequence:1001001},
  {receipt:81003001,date:'2018-10-03',member:1002,product:'X',unitPrice:300,quantity:1,amount:300,sequence:1002002},
  {receipt:81003001,date:'2018-10-03',member:1002,product:'Y',unitPrice:500,quantity:1,amount:500,sequence:0},
  {receipt:81004001,date:'2018-10-04',member:1003,product:'X',unitPrice:400,quantity:1,amount:400,sequence:1003001}
 ];
 const ids=[1001,1002,1003],expected=oracle(smallSales,'X',ids);
 for(let part=0;part<6;part++){
  const truth:boolean[]=[];
  for(let choice=0;choice<b.answerParts![part].choiceIds.length;choice++){
   const block=b.choices[offsets[part]+choice][0];assert(block.type==='paragraph');let valid=true,witness:unknown=null;
   try{
    if(part===0){const m=machine(smallSales,'X',expected.members);m.sheet='会員管理';m.set('会員管理','A4',1002);m.set('会員管理','C4',2);const actual=m.value(block.text);if(actual!==serial('2018-10-03')){valid=false;witness={member:1002,actual,expected:serial('2018-10-03')};}}
    if(part===1){const m=machine([], 'X', []);m.sheet='会員管理';for(const amount of[0,39999,40000,79999,80000,198500])for(const visits of[0,5,6,11,12,20]){m.set('会員管理','B4',amount);m.set('会員管理','C4',visits);const actual=m.value('表引き(分類表!D$4:F$6,'+block.text+')'),required=classRows[visits<6?0:visits<12?1:2][amount<40000?0:amount<80000?1:2];if(actual!==required){valid=false;witness={amount,visits,actual,required};break;}}}
    if(part===2){const m=new Machine();for(const amount of[0,1,39999,44100,49999,50000,99999,100000,149999,150000,198500]){m.set('会員管理','B4',amount);const actual=m.value(block.text),required=Math.floor(amount/50000)*1000;if(actual!==required){valid=false;witness={amount,actual,required};break;}}}
    if(part>=3){const fill=right.slice();fill[part]=choice;const m=machine(smallSales,'X',expected.members,1);m.run(displayedMacro(0,fill).rows);const actual=output(m,expected.productRows.length),required=expected.productRows.map(r=>[r.member,r.amount,serial(r.lastDate)]);if(JSON.stringify(actual)!==JSON.stringify(required)||m.get('商品別管理','A'+(required.length+3))!==null){valid=false;witness={fixture:'small explicit receipt/sale/tie-index counterexample',actual,required};}}
    if(part===4&&valid){const m=new Machine();m.env.j=1;for(const a of[0,10,20])for(const b of[0,10,20])for(const dateA of[100,101])for(const dateB of[100,101]){m.arrays.set('1,1',a);m.arrays.set('2,1',b);m.arrays.set('1,2',dateA);m.arrays.set('2,2',dateB);const actual=m.value(block.text),required=a<b||a===b&&dateA>dateB;if(actual!==required){valid=false;witness={leftAmount:a,rightAmount:b,leftDate:dateA,rightDate:dateB,actual,required};break;}}}
   }catch(error){valid=false;witness={error:String(error),fixture:'explicit formula/index/control witness'};}
   truth.push(valid);checks.push({part:'abcdef'[part],choice:'アイウエオカ'[choice],valid,counterexample:witness});
  }
  assert.equal(truth.filter(Boolean).length,1,`${part}:${truth}`);assert.equal(truth.indexOf(true),right[part]);const answer=b.partAnswers![part];assert(answer.kind==='choice');assert.equal(b.answerParts![part].choiceIds.indexOf(answer.choiceId),right[part]);
 }
 assert.equal(checks.length,33);writeSpring2019Evidence('q13-option-witnesses.json',JSON.stringify({officialKeys:'カウウオオイ',checks},null,2)+'\n');
});
test('Q13 zero-purchase tail, all-purchase sentinel and unknown array-date fills do not change visible output',()=>{
 const rows:Spring2019Sale[]=[{receipt:81001001,date:'2018-10-01',member:1001,product:'X',unitPrice:100,quantity:1,amount:100,sequence:1001001},{receipt:81002001,date:'2018-10-02',member:1002,product:'X',unitPrice:100,quantity:1,amount:100,sequence:1002001}];
 for(const product of['X','absent'])for(const poison of[0,1,2,7]){const expected=oracle(rows,product,[1001,1002,1003]),m=machine(rows,product,expected.members,poison);m.run(displayedMacro(0).rows);assert.deepEqual(output(m,expected.productRows.length),expected.productRows.map(r=>[r.member,r.amount,serial(r.lastDate)]));assert.equal(m.get('商品別管理','A'+(expected.productRows.length+3)),null);}
 const all=oracle(rows,'X',[1001,1002]),m=machine(rows,'X',all.members,2);m.run(displayedMacro(0).rows);assert.equal(m.arrays.get('3,1'),0);assert.deepEqual(output(m,2),all.productRows.map(r=>[r.member,r.amount,serial(r.lastDate)]));
});
test('Q13 rejects unknown profiles, noninteger or out-of-domain scenarios/groups and wrong arity',()=>{
 for(const kind of['sales','members','ranks','classification','product','macro','bank'])for(const values of[[],[0],[0,0,0],[-1,0],[17,0],[.5,0],[NaN,0],[0,-1],[0,.5],[0,99]])assert.throws(()=>model('legacy-2019-spring-pm13-'+kind,values));assert.throws(()=>model('legacy-2019-spring-pm13-unknown',[0,0]));
});
test('Q13 every actual native worksheet cell at source0 and all 16 scenarios retains its independent row/column identity; reference operations remain live after cell changes',()=>{
 for(let scenario=0;scenario<=16;scenario++){
  const s=sheets(scenario),source=scenario===0?gold.source0:s;
  for(const[kind,rows,columns]of[['sales',source.sales,'ABCDEFGH'],['members',source.members,'ABCDEF'],['product',source.productRows,'ABC']]as const){const html=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm13-'+kind,values:[scenario,0],caption:'図'}));const cells=new Map([...html.matchAll(/<td[^>]*data-cell="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g)].map(m=>[m[1],decode(m[2])]));for(const row of rows)if(/^\d+$/.test(row[0]))for(let j=0;j<row.length-1;j++)assert.equal(cells.get(columns[j]+row[0]),row[j+1],`${scenario}/${kind}/${columns[j]}${row[0]}`);}
 }
 const html=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm13-classification',values:[0,0],caption:'図3'}));assert.match(html,/data-cell="C2">ランク<\/td>/);assert.match(html,/data-cell="F6">S<\/td>/);
 const m=new Machine();m.set('会員管理','A1',10);m.set('会員管理','A2',20);m.set('会員管理','B1',100);m.set('会員管理','B2',200);assert.equal(m.value('照合検索(20,A1:A2,B1:B2)'),200);m.set('会員管理','B2',300);assert.equal(m.value('照合検索(20,A1:A2,B1:B2)'),300);m.set('会員管理','E7',12);assert.equal(m.value('相対(B5,2,3)'),12);assert.throws(()=>m.value('表引き(A1:B2,3,1)'));
});
test('Q13 the preserved previous16 concrete datasets remain a separate strict-rejection corpus, not a source reconstruction or registered generated pool',()=>{
 const witnesses:unknown[]=[];assert.equal(negativeCorpus.cases.length,16);let rows=0;
 for(const previous of negativeCorpus.cases){const sales:Spring2019Sale[]=previous.rows.map(row=>({receipt:Number(row[0]),date:String(row[1]),member:Number(row[2]),product:String(row[3]),unitPrice:Number(row[4]),quantity:Number(row[5]),amount:Number(row[4])*Number(row[5]),sequence:Number(row[6])}));rows+=sales.length;const expected=oracle(sales,previous.product,previous.memberNumbers),m=machine(sales,previous.product,expected.members,'reject');let failure='';try{m.run(displayedMacro(0).rows);}catch(error){failure=String(error);}assert.match(failure,/UNASSIGNED_ARRAY_READ:\d+,2/);witnesses.push({previousScenario:previous.scenario,failure,steps:m.steps,memberCount:531,buyers:expected.productRows.length,zeroAmountTail:531-expected.productRows.length});}
 assert.equal(rows,53328);
 writeSpring2019Evidence('q13-unassigned-array-witnesses.json',JSON.stringify({status:'original_general_rule_not_established_negative_corpus_not_registered_pool',negativeCorpusCheckpoint:'checkpoint-3',negativeCorpusCases:16,negativeCorpusRows:53328,primaryRuleLocators:['QS3 declaration/assignment/control','QS4 operators and logic','QS85 §3(4) initial blank applies to worksheet cells','QS89 §7(2) variables','QS90 §7(3) arrays/allowed null and §7(4) common pseudo reference'],sourceInitialZeroNotInvented:true,officialCodeNotChanged:true,officialAnswersNotChanged:true,strictModeIsATestAssumptionNotAnOfficialRule:true,currentPositivePool:'q13-full-macro-witnesses.json',witnesses},null,2)+'\n');
});
