import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import facts from '../../fixtures/legacy-2016-spring-am-33-56-review.json';
import {knowledgeReview,independentSources,reviewedConclusionPatterns,reviewedChangedPrompts,q55ReviewedCases,assertQ55ReviewedBody} from '../../fixtures/legacy-2016-spring-am-33-56-oracle';
import {legacy2016SpringAm3356Definitions,legacy2016SpringAm3356FlowAllowed,legacy2016SpringAm3356FlowAlt,legacy2016SpringAm3356IncludedNumbers,legacy2016SpringAm3356HeldNumbers} from '../../../src/core/generators/legacy-2016-spring-am-33-56';
import {Legacy2016SpringAm3356FlowFigure} from '../../../src/ui/legacy-2016-spring-am-33-56-figures';
import type {GeneratedBody} from '../../../src/core/generators/definition';

const defs=legacy2016SpringAm3356Definitions();
function number(source:string){return Number(source.split('-').at(-1));}
function paragraph(body:GeneratedBody){const p=body.prompt[0];assert.equal(p.type,'paragraph');return p.type==='paragraph'?p.text:'';}
function choices(body:GeneratedBody):string[]{return body.choices.map(c=>{assert.equal(c.length,1);assert.equal(c[0].type,'paragraph');return c[0].type==='paragraph'?c[0].text:'';});}
function oracleTruth(n:number,candidate:number):boolean[]{
 const r=knowledgeReview[n],roles=r.roles[candidate]??r.roles[0];
 if(n===47){const rank=['data','stamp','control','external','common','content'];const weakest=Math.min(...roles.map(role=>{const at=rank.indexOf(role);assert(at>=0);return at;}));return roles.map(role=>rank.indexOf(role)===weakest);}
 return roles.map(role=>role===r.targets[candidate]);
}
function sourceFact(n:number){const f=facts.questions.find(q=>q.number===n);assert(f);return f;}

test('all 24 source numbers remain accounted for; material-held 46/56 have no executable body',()=>{
 assert.deepEqual(facts.scope,Array.from({length:24},(_,i)=>i+33));
 assert.deepEqual([...legacy2016SpringAm3356IncludedNumbers],facts.includedNumbers);
 assert.deepEqual([...legacy2016SpringAm3356HeldNumbers],facts.held.map(h=>h.number));
 assert.deepEqual([...facts.includedNumbers,...facts.held.map(h=>h.number)].sort((a,b)=>a-b),facts.scope);
 assert.equal(defs.length,22);assert.equal(new Set(defs.map(d=>d.source)).size,22);
 assert(defs.every(d=>!facts.held.some(h=>h.number===number(d.source))));
 for(const hold of facts.held){assert.equal(hold.status,'material_conditions_hold');assert(!('originalPrompt' in hold));assert(!('originalChoices' in hold));assert(!('crop' in hold));}
});

test('candidate zero reproduces every independently transcribed source premise, option and official key',()=>{
 for(const d of defs){const n=number(d.source),s=sourceFact(n),b=d.build([0]);
  assert.deepEqual(d.reference,[0]);assert.equal(paragraph(b),s.originalPrompt,'prompt '+n);
  assert.equal('アイウエ'[b.correctIndex!],s.officialKey);assert.equal(d.sourceAnswer,s.officialKey);
  assert.equal(b.choices.length,4);assert(!b.answerParts);assert(!b.partAnswers);
  if(n===35){const headers=['送信元（Webサーバ）のポート番号','宛先（PC）のポート番号'];assert.deepEqual(b.choices.map(c=>{assert.equal(c.length,1);assert.equal(c[0].type,'table');if(c[0].type!=='table')throw Error();assert.deepEqual(c[0].columns,headers);assert.equal(c[0].rows.length,1);return c[0].rows[0];}),s.originalChoices);}
  else assert.deepEqual(choices(b),s.originalChoices,'choices '+n);
  assert.match(s.crop.sha256,/^[a-f0-9]{64}$/);assert.equal(s.crop.width,s.crop.cropBox[2]-s.crop.cropBox[0]);assert.equal(s.crop.height,s.crop.cropBox[3]-s.crop.cropBox[1]);
  assert(s.alt.startsWith('問'+n+'。'+s.originalPrompt));assert(s.alt.includes('ア。')&&s.alt.includes('エ。'));
 }
});

test('all finite knowledge cases retain the reviewed four option meanings and exactly one true answer',()=>{
 const numerical=new Set([34,35,49,54]);
 assert.deepEqual(Object.keys(knowledgeReview).map(Number).sort((a,b)=>a-b),facts.includedNumbers.filter(n=>!numerical.has(n)));
 for(const[nText,r]of Object.entries(knowledgeReview)){
  const n=Number(nText),d=defs.find(d=>number(d.source)===n)!,original=sourceFact(n);
  assert.equal(d.fields[0].maximum+1,r.targets.length);assert(r.why.length>=3);
  for(const s of r.sources)assert(s in independentSources);
  for(let candidate=0;candidate<r.targets.length;candidate++){
   const b=d.build([candidate]),expected=r.changedChoices?.[candidate]??original.originalChoices;
   // Equality is against a fixed independently reviewed option record, not
   // a production-exported map. It prevents assigning old meanings to new text.
   assert.deepEqual(choices(b),expected,'actual four statements '+n+'/'+candidate);
   assert.equal(paragraph(b),reviewedChangedPrompts[n]?.[candidate]??original.originalPrompt,'full reviewed stem '+n+'/'+candidate);
   assert(paragraph(b).includes(r.promptTerms[candidate]),'target '+n+'/'+candidate);
   const truth=oracleTruth(n,candidate),valid=truth.flatMap((v,i)=>v?[i]:[]);
   assert.equal(valid.length,1,'unique truth '+n+'/'+candidate);assert.equal(b.correctIndex,valid[0]);
   assert(b.explanation.length>=60,'explain all roles '+n+'/'+candidate);
   assert.match(b.explanation,reviewedConclusionPatterns[n][candidate],'independently reviewed solution conclusion '+n+'/'+candidate);
   assert(!/正しくない|誤っている/.test(paragraph(b)),'no question-direction reversal');
   if(n===50)assert(paragraph(b).includes('起因しない'));
   if(n===47)assert(paragraph(b).includes('最も低い'));
  }
 }
});

test('IPv4 broadcast uses independent 32-bit mask oracle and keeps the original four distractor roles',()=>{
 const d=defs.find(d=>number(d.source)===34)!;
 for(let c=0;c<=d.fields[0].maximum;c++){
  const b=d.build([c]),m=paragraph(b).match(/IPアドレス(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)/);assert(m);
  const octets=m.slice(1,5).map(Number),prefix=Number(m[5]);assert.equal(prefix,22);
  const ip=octets.reduce((a,v)=>(a<<8n)|BigInt(v),0n),hostBits=(1n<<BigInt(32-prefix))-1n;
  const mask=((1n<<32n)-1n)^hostBits,network=ip&mask,answer=network|hostBits;
  const dotted=(value:bigint)=>[24n,16n,8n,0n].map(shift=>Number((value>>shift)&255n)).join('.');
  const actual=choices(b),expected=dotted(answer),valid=actual.flatMap((v,i)=>v===expected?[i]:[]);
  assert.deepEqual(valid,[b.correctIndex]);assert.equal(new Set(actual).size,4);assert(b.explanation.includes(expected));
  assert.equal(actual[0],dotted(network-1n));
  assert.equal(actual[1],dotted((ip&0xffffff00n)|255n));
  assert.equal(actual[3],dotted((ip&0xfffff800n)|2047n));
  assert(actual.every(v=>/^192\.168\.\d{2}\.255$/.test(v)),'source-scale precision');
 }
});

test('return ports are checked by reversing full endpoint identities, retaining two-column four-row form',()=>{
 const d=defs.find(d=>number(d.source)===35)!;
 for(let c=0;c<=d.fields[0].maximum;c++){
  const b=d.build([c]),text=paragraph(b),m=text.match(/割り当てた(\d+)，宛先ポート番号は(\d+)/);assert(m);
  const request={source:{host:'PC',port:Number(m[1])},destination:{host:'Webサーバ',port:Number(m[2])}};
  const response={source:request.destination,destination:request.source};
  assert.notEqual(response.source.port,response.destination.port);
  for(const endpoint of [response.source,response.destination])assert(endpoint.port>=1&&endpoint.port<=65535);
  const rows=b.choices.map(blocks=>{assert.equal(blocks.length,1);const t=blocks[0];assert.equal(t.type,'table');if(t.type!=='table')throw Error();assert.deepEqual(t.columns,['送信元（Webサーバ）のポート番号','宛先（PC）のポート番号']);assert.equal(t.rows.length,1);assert.equal(t.rows[0].length,2);return t.rows[0];});
  const valid=rows.flatMap((row,i)=>Number(row[0])===response.source.port&&Number(row[1])===response.destination.port?[i]:[]);
  assert.deepEqual(valid,[b.correctIndex]);assert.equal(new Set(rows.map(row=>JSON.stringify(row))).size,4);
  assert.equal(rows[2][0],m[2]+'と'+m[1]+'以外からサーバ側で割り当てた番号');assert.equal(rows[3][0],rows[2][0]);
  assert(b.explanation.includes(m[1])&&b.explanation.includes(m[2]));
 }
});

test('statement coverage is independently minimized over executable traces, not confused with path coverage',()=>{
 const d=defs.find(d=>number(d.source)===49)!,reviewed=[[0,0,1,2,1,2],[2,5,3,7,2,9],[4,1,5,8,4,6],[7,3,2,6,3,8]];
 for(let c=0;c<=d.fields[0].maximum;c++){
  const b=d.build([c]),f=b.prompt[1];assert.equal(f.type,'diagram');if(f.type!=='diagram'||f.scene.kind!=='source_figure')throw Error();
  assert.equal(f.scene.profile,'legacy-2016-spring-am-49');assert.deepEqual(f.scene.values,reviewed[c]);
  const[a0,b0,xYes,xNo,yYes,yNo]=reviewed[c];assert.notEqual(xYes,xNo);assert.notEqual(yYes,yNo);
  const execute=(a:number,b:number)=>({x:a===a0?xYes:xNo,y:b===b0?yYes:yNo,covered:new Set([a===a0?'x-yes':'x-no',b===b0?'y-yes':'y-no'])});
  const traces=[execute(a0,b0),execute(a0,b0+1),execute(a0+1,b0),execute(a0+1,b0+1)];
  assert.equal(new Set(traces.map(t=>t.x+','+t.y)).size,4,'all four paths feasible');
  let minimum=Infinity;
  for(let subset=1;subset<1<<traces.length;subset++){const selected=traces.filter((_,i)=>subset&(1<<i)),covered=new Set(selected.flatMap(t=>[...t.covered]));if(covered.size===4)minimum=Math.min(minimum,selected.length);}
  const valid=choices(b).flatMap((s,i)=>Number(s)===minimum?[i]:[]);assert.deepEqual(valid,[b.correctIndex]);assert.equal(minimum,2);assert.equal(d.answerVariation,'fixed');
  assert.equal(f.alt,legacy2016SpringAm3356FlowAlt(reviewed[c]));
  const svg=renderToStaticMarkup(createElement(Legacy2016SpringAm3356FlowFigure,{profile:f.scene.profile,values:f.scene.values,caption:'流れ図'}));
  for(const stmt of ['x-yes','x-no','y-yes','y-no'])assert(svg.includes('data-statement="'+stmt+'"'));
  for(const edge of ['entry','a-yes','a-no','x-yes-merge','x-no-merge','b-yes','b-no','y-yes-exit','y-no-merge'])assert(svg.includes('data-edge="'+edge+'"'));
  assert.equal((svg.match(/>Yes<\/text>/g)??[]).length,2);assert.equal((svg.match(/>No<\/text>/g)??[]).length,2);
  for(const label of ['a＝'+a0,'b＝'+b0,'x＝'+xYes,'x＝'+xNo,'y＝'+yYes,'y＝'+yNo])assert(svg.includes(label));
 }
 assert(!legacy2016SpringAm3356FlowAllowed('other',[0,0,1,2,1,2]));assert(!legacy2016SpringAm3356FlowAllowed('legacy-2016-spring-am-49',[0,0,1,2,1,999]));assert.throws(()=>legacy2016SpringAm3356FlowAlt([0,0,1,2,1,999]),/PARAMETER_CONSTRAINT/);
});

test('face-to-face time oracle enumerates unordered pairs and checks source-equivalent numeric effort',()=>{
 const d=defs.find(d=>number(d.source)===54)!,reviewedMembers=[16,8,24,32];
 for(let c=0;c<=d.fields[0].maximum;c++){
  const b=d.build([c]),m=paragraph(b).match(/メンバが(\d+)人/);assert(m);const members=Number(m[1]);assert.equal(members,reviewedMembers[c]);assert(paragraph(b).includes('2人ずつの総当たり'));assert(paragraph(b).includes('顔合わせ会1回の所要時間は0.5時間'));
  const pairs=new Set<string>();let duration=0;
  for(let left=0;left<members;left++)for(let right=0;right<members;right++)if(left<right){pairs.add(left+':'+right);duration+=.5;}
  assert.equal(pairs.size,duration*2);assert(members*(members-1)<1000,'same three-digit intermediate scale as original240');
  const values=choices(b).map(Number),valid=values.flatMap((v,i)=>v===duration?[i]:[]);
  assert.deepEqual(valid,[b.correctIndex]);assert.equal(new Set(values).size,4);assert(values.every(Number.isInteger));assert(values.every(v=>v>0&&v<1000));assert(b.explanation.includes('＝'+duration+'時間'));
  assert.equal(values[0],members*.5);assert.equal(values[1],members);assert.equal(values[2],duration/2);
  assert(Math.min(...values.filter(v=>v!==duration).map(v=>Math.abs(v-duration)))/duration>=.25,'not adjacent +/-1 distractors');
 }
});

test('finite capacities, deterministic bodies, source format, fixed-answer declaration and invalid boundaries',()=>{
 let total=0;
 for(const d of defs){const all:GeneratedBody[]=[],n=number(d.source),max=d.fields[0].maximum;assert.equal(d.fields.length,1);assert.equal(d.fields[0].minimum,0);assert(max>=1);
  for(let i=0;i<=max;i++){const b=d.build([i]);all.push(b);total++;assert.deepEqual(b,d.build([i]));assert.equal(b.choices.length,4);assert(b.explanation.trim());assert(b.correctIndex!==undefined&&b.correctIndex>=0&&b.correctIndex<4);assert.equal(b.prompt.length,n===49?2:1);assert.equal(new Set(b.choices.map(choice=>JSON.stringify(choice))).size,4);}
  assert.equal(new Set(all.map(b=>JSON.stringify({prompt:b.prompt,choices:b.choices}))).size,max+1,'substantive finite inputs '+n);
  const answers=new Set(all.map(b=>JSON.stringify(b.choices[b.correctIndex!])));if(d.answerVariation!=='fixed')assert(answers.size>=2,'answerCanVary signature capacity '+n);else assert.equal(answers.size,1,'fixed declaration equals actual one-answer domain '+n);
  for(const bad of [[],[0,1],[-1],[max+1],[.5],[NaN],[Infinity]])assert.throws(()=>d.build(bad),/PARAMETER_CONSTRAINT/);
 }
 assert.equal(total,68);
});

test('explanations include original acronyms and distinguish similar options without answer-time hints',()=>{
 const expected:Record<number,string[]>={33:['Dynamic Host Configuration Protocol','Domain Name System','Network Address Port Translation','Remote Authentication Dial In User Service'],34:['Internet Protocol','Classless Inter-Domain Routing'],35:['Personal Computer','HyperText Transfer Protocol','Transmission Control Protocol'],36:['Search Engine Optimization','Cross-Site Scripting'],37:['Structured Query Language','Distributed Denial of Service'],38:['HyperText Markup Language','Transmission Control Protocol','JavaScript'],39:['Certification Authority'],40:['Uniform Resource Locator'],41:['Software as a Service'],42:['Bring Your Own Device'],43:['Secure Sockets Layer','Virtual Private Network','Web Application Firewall','Transport Layer Security'],45:['Master Boot Record'],51:['Work Breakdown Structure','Critical Path Method'],55:['Operating System']};
 for(const[n,terms]of Object.entries(expected)){const d=defs.find(d=>number(d.source)===Number(n))!;for(let i=0;i<=d.fields[0].maximum;i++){const b=d.build([i]);for(const term of terms)assert(b.explanation.includes(term),'term '+n+'/'+term);}}
 assert(defs.find(d=>number(d.source)===41)!.build([0]).explanation.includes('必要なログ確認まで不要とするものではない'));
 assert(defs.find(d=>number(d.source)===45)!.build([0]).explanation.includes('SSDや故障媒体を同じ条件として扱わず'));
});

test('Q55 preserves one system category and all16 independent option judgments; rejects replacing the requested category',()=>{
 const d=defs.find(d=>number(d.source)===55)!,source=sourceFact(55);
 assert.equal(d.version,'3.2.0');assert.deepEqual(d.reference,[0]);assert.equal(d.sourceAnswer,'ウ');assert.equal(d.answerVariation,'fixed');
 assert.equal(q55ReviewedCases.length,4);let judged=0,rejected=0;
 const wrongCategories=['パイロットシステムの意味として，適切なものはどれか。','高負荷運転の意味として，適切なものはどれか。','基本ソフトウェアの意味として，適切なものはどれか。'];
 for(let candidate=0;candidate<4;candidate++){
  const body=d.build([candidate]);assertQ55ReviewedBody(candidate,body);assert.equal(paragraph(body),source.originalPrompt);
  assert.deepEqual(body.choices[2],[{type:'paragraph',text:source.originalChoices[2]}]);
  for(const option of q55ReviewedCases[candidate].options){assert.equal(typeof option.matchesMeaning,'boolean');assert(option.reason.length>20);judged++;}
  for(const prompt of wrongCategories){const bad=structuredClone(body);bad.prompt=[{type:'paragraph',text:prompt}];assert.throws(()=>assertQ55ReviewedBody(candidate,bad));rejected++;}
  for(let wrong=0;wrong<4;wrong++)if(wrong!==2){const bad=structuredClone(body);bad.correctIndex=wrong;assert.throws(()=>assertQ55ReviewedBody(candidate,bad));rejected++;}
  const mixed=structuredClone(body);mixed.choices[0]=[{type:'paragraph',text:'基本ソフトウェアの機能'}];assert.throws(()=>assertQ55ReviewedBody(candidate,mixed));rejected++;
 }
 assert.equal(judged,16);assert.equal(rejected,28);
 assert.deepEqual(choices(d.build([0])),source.originalChoices);
});
