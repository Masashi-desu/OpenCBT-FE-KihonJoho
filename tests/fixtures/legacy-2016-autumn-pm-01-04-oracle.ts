/** Independent source/control review, automata, CFG, SQLite and exact event clocks.
 * No production generator, answer function or numeric model is imported. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import type { GeneratedBody } from '../../src/core/generators/definition';
import type { Block } from '../../src/core/types';
import review from './legacy-2016-autumn-pm-01-04-review.json';

export function text(block:Block):string {
  if(block.type==='paragraph'||block.type==='heading'||block.type==='code'||block.type==='formula')return block.text;
  if(block.type==='list')return block.items.join('\n');
  if(block.type==='table')return block.caption+'\n'+block.columns.join('|')+'\n'+block.rows.map(r=>r.join('|')).join('\n');
  if(block.type==='diagram')return block.caption+'\n'+block.alt;
  return block.caption;
}
export function partChoices(body:GeneratedBody,partId:string){
 const part=body.answerParts!.find(p=>p.id===partId)!;assert(part,partId);
 return part.choiceIds.map(id=>{const index=Number(/^choice-value-(\d+)$/.exec(id)?.[1])-1;assert(Number.isSafeInteger(index)&&index>=0&&index<body.choices.length);return{id,blocks:body.choices[index],text:body.choices[index].map(text).join('\n')};});
}
export function checkPart(body:GeneratedBody,partId:string,predicate:(choice:ReturnType<typeof partChoices>[number],index:number)=>boolean){
 const choices=partChoices(body,partId),truth=choices.map(predicate),winners=choices.filter((_,i)=>truth[i]);assert.equal(winners.length,1,partId+': independently unique all-choice truth');
 const answer=body.partAnswers!.find(p=>p.kind==='choice'&&p.partId===partId);assert(answer&&answer.kind==='choice');assert.equal(answer.choiceId,winners[0].id,partId);return truth;
}
const eq=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);

type Rule={source:string;destination:string;port:number|null;allow:boolean};
function permits(rules:Rule[],source:string,destination:string,port:number){return rules.find(r=>(r.source==='任意'||r.source===source)&&(r.destination==='任意'||r.destination===destination)&&(r.port===null||r.port===port))?.allow??false;}
export function checkQuestion1(body:GeneratedBody,index:number){
 const expected=review.q1.cases[index],table=body.prompt.find(b=>b.type==='table'&&b.caption.startsWith('表1'));assert(table?.type==='table');
 assert.deepEqual(table.rows.map(r=>r[0]),['監視サーバからDBサーバ','タブレットからRPサーバ','RPサーバからWebサーバ','WebサーバからDBサーバ']);
 assert.deepEqual(table.rows.map(r=>Number(r[2])),[expected.monitorPort,443,80,expected.dbPort]);
 const rules:Rule[]=[{source:'任意',destination:'RPサーバ',port:443,allow:true},{source:'任意',destination:'DBサーバ',port:expected.dbPort,allow:true},{source:'任意',destination:'任意',port:null,allow:false}];
 function route(source:string,from:string,destination:string,to:string,port:number){return from===to||permits(rules,source,destination,port);}
 checkPart(body,'part-q1',choice=>{
  const block=choice.blocks[0];assert.equal(block.type,'table');if(block.type!=='table')return false;const [web,db]=block.rows[0];
  return route('RPサーバ','サーバ群X','Webサーバ',web,80)&&route('Webサーバ',web,'DBサーバ',db,expected.dbPort)&&route('監視サーバ','サーバ群Y','DBサーバ',db,expected.monitorPort);
 });
 assert.equal(permits(rules,'インターネット上の機器','DBサーバ',expected.dbPort),true);
 checkPart(body,'part-q2',choice=>{
  const changed=structuredClone(rules),s=choice.text,source=/送信元を“([^”]+)”に変更/.exec(s);
  if(source)changed[1].source=source[1];
  else if(/項番2の動作を“拒否”/.test(s))changed[1].allow=false;
  else {const added=/送信元が“([^”]+)”，宛先が“([^”]+)”，宛先ポート番号が“(\d+)”で動作が“許可”/.exec(s);assert(added);changed.unshift({source:added[1],destination:added[2],port:Number(added[3]),allow:true});}
  return !permits(changed,'インターネット上の機器','DBサーバ',expected.dbPort)&&permits(changed,'Webサーバ','DBサーバ',expected.dbPort)&&permits(changed,'タブレット','RPサーバ',443);
 });
 const controls=body.prompt.filter(b=>b.type==='paragraph'&&/^\([ivx]+\) /.test(b.text)).map(b=>(b as Extract<Block,{type:'paragraph'}>).text.replace(/^\([ivx]+\) /,''));
 assert.deepEqual(controls,expected.controls.map(c=>c.text),'reviewed meanings bind every actual control');
 const roles=['confidentiality','integrity','availability'];
 for(const [k,id]of ['a','b','c'].entries())checkPart(body,'part-'+id,choice=>{const roman=/^\((i|ii|iii|iv|v|vi)\)$/.exec(choice.text);assert(roman);const order=['i','ii','iii','iv','v','vi'].indexOf(roman[1]);return expected.controls[order].role===roles[k];});
 return {choiceTruthChecks:26,sourcePortChecks:4};
}

function words(alphabet:string[],length:number):string[]{let current=[''],all=[''];for(let n=1;n<=length;n++){current=current.flatMap(s=>alphabet.map(c=>s+c));all.push(...current);}return all;}
const lexicalWords=[...new Set([...words(review.q2.lexicalAlphabet,review.q2.allLexicalWordsThroughLength),...review.q2.validExtraWords,...review.q2.invalidExtraWords])];
function lexicalGrammar(s:string){return /^(?:(?:\d+\.\d*|\.\d+)(?:e[+-]?\d+)?|\d+e[+-]?\d+)$/.test(s);}
function automaton(s:string,a:string,b:string){
 const transitions:[[number,string,number],...[number,string,number][]]=[[0,'数字',1],[0,a,2],[2,'数字',3],[1,'数字',1],[1,'.',3],[1,b,4],[3,'数字',3],[3,'e',4],[4,'符号',5],[4,'数字',6],[5,'数字',6],[6,'数字',6]];
 let states=new Set([0]);for(const ch of s){const next=new Set<number>();for(const [from,label,to]of transitions){const matches=label==='数字'?/^[0-9]$/.test(ch):label==='符号'?ch==='+'||ch==='-':label===ch;if(states.has(from)&&matches)next.add(to);}states=next;}return states.has(3)||states.has(6);
}
type Tree=string|[string,Tree,Tree];
export function parseExpression(input:string):Tree {
 const tokens=input.match(/op1|op2|[vwxyz]|[()]/g)??[];assert.equal(tokens.join(''),input.replace(/\s/g,''));let position=0;
 function factor():Tree {if(tokens[position]==='('){position++;const node=expr();assert.equal(tokens[position++],')');return node;}const name=tokens[position++];assert(/^[vwxyz]$/.test(name));return name;}
 function term():Tree {let node=factor();while(tokens[position]==='op1'){position++;node=['op1',node,factor()];}return node;}
 function expr():Tree {let node=term();while(tokens[position]==='op2'){position++;node=['op2',node,term()];}return node;}
 const result=expr();assert.equal(position,tokens.length);return result;
}
// Earley recognition supports the original left-recursive grammar without
// using production's parser or assuming the answer's nonterminal in advance.
function recognizes(tokens:string[],c:string[],d:string){
 const rules:Record<string,string[][]>={S:[['E']],E:[['T'],c],T:[['F'],['T','op1','F']],F:[['N'],['(',d,')']],N:[['v'],['w'],['x'],['y'],['z']]};
 type Item={left:string;right:string[];dot:number;start:number};const chart=Array.from({length:tokens.length+1},()=>new Map<string,Item>()),key=(x:Item)=>JSON.stringify(x);
 const put=(at:number,item:Item)=>chart[at].set(key(item),item);put(0,{left:'S',right:['E'],dot:0,start:0});
 for(let at=0;at<=tokens.length;at++)for(const item of chart[at].values()){
  const next=item.right[item.dot];if(next===undefined){for(const parent of chart[item.start].values())if(parent.right[parent.dot]===item.left)put(at,{...parent,dot:parent.dot+1});}
  else if(rules[next])for(const right of rules[next])put(at,{left:next,right,dot:0,start:at});
  else if(next===tokens[at])put(at+1,{...item,dot:item.dot+1});
 }
 return [...chart[tokens.length].values()].some(x=>x.left==='S'&&x.dot===1&&x.start===0);
}
function production(s:string){const names:Record<string,string>={'式':'E','項':'T','因子':'F','名前':'N'};return (s.match(/op1|op2|因子|名前|式|項/g)??[]).map(token=>names[token]??token);}
export function checkQuestion2(body:GeneratedBody,index:number){
 const ab=partChoices(body,'part-a').map(c=>c.text);assert.deepEqual(partChoices(body,'part-b').map(c=>c.text),ab);
 let lexicalComparisons=0;const pairs:number[][]=[];for(let a=0;a<ab.length;a++)for(let b=0;b<ab.length;b++)if(lexicalWords.every(word=>{lexicalComparisons++;return automaton(word,ab[a],ab[b])===lexicalGrammar(word);}))pairs.push([a,b]);assert.deepEqual(pairs,[[0,1]]);
 checkPart(body,'part-a',(_,i)=>pairs.some(p=>p[0]===i));checkPart(body,'part-b',(_,i)=>pairs.some(p=>p[1]===i));
 const statement=body.prompt.find(b=>b.type==='paragraph'&&b.text.startsWith('例2：'));assert(statement?.type==='paragraph');const expression=statement.text.slice(3);assert.equal(expression,review.q2.expressions[index]);
 checkPart(body,'part-c',choice=>recognizes(['v','op2','w','op1','x'],production(choice.text),'E'));
 const tokens=expression.match(/op1|op2|[vwxyz]|[()]/g)!;
 checkPart(body,'part-d',choice=>recognizes(tokens,['E','op2','T'],production(choice.text)[0]));
 const tree=parseExpression(expression);
 checkPart(body,'part-e',choice=>{const block=choice.blocks[0];assert(block.type==='diagram'&&block.scene.kind==='source_figure');return eq(review.q2.trees[block.scene.values[0]],tree);});
 return {choiceTruthChecks:22,lexicalCandidatePairs:25,lexicalWords:lexicalWords.length,lexicalComparisons,syntaxChoices:8};
}

export function checkQuestion3(body:GeneratedBody,index:number){
 const c=review.q3.cases[index],db=new DatabaseSync(':memory:');let attempts=0;
 try{
  db.exec(`CREATE TABLE 従業員表(従業員番号 TEXT PRIMARY KEY NOT NULL,氏名 TEXT,住所 TEXT);
   CREATE TABLE 交通機関表(交通機関コード TEXT PRIMARY KEY NOT NULL,交通機関名 TEXT NOT NULL UNIQUE);
   CREATE TABLE 通勤費表(従業員番号 TEXT NOT NULL,交通機関コード TEXT NOT NULL,交通費 INTEGER NOT NULL,PRIMARY KEY(従業員番号,交通機関コード));
   CREATE TABLE 講習会受講表(従業員番号 TEXT NOT NULL,受講日 TEXT NOT NULL,PRIMARY KEY(従業員番号,受講日));`);
  const ids=Array.from({length:7},(_,i)=>'009801'+String(25+i)),routes=[['B00','始点バス'],['B01','○○バス'],['B02','△△バス'],['B03','駒込バス'],['B99','終点バス'],['S01','情報都市線'],['T01','別の鉄道'],['C01','自家用車']];
  for(const id of ids)db.prepare('INSERT INTO 従業員表 VALUES(?,?,?)').run(id,id==='00980125'?'情報太郎':'従業員'+id,'東京都文京区○○○');
  for(const row of routes)db.prepare('INSERT INTO 交通機関表 VALUES(?,?)').run(...row);
  const expenses:[string,string,number][]=[[ids[0],'B02',c.costs[0]],[ids[0],'S01',c.costs[1]],[ids[1],'B03',2000],[ids[1],'S01',4000],[ids[1],'C01',6000],[ids[2],'B03',3000],[ids[2],'B01',7000],[ids[3],'C01',5000],[ids[4],'C01',9000],[ids[4],'B99',3000],[ids[5],'B00',3500],[ids[5],'B99',5500],[ids[6],'T01',8000]];
  for(const row of expenses)db.prepare('INSERT INTO 通勤費表 VALUES(?,?,?)').run(...row);
  for(const row of [[ids[0],c.date],[ids[1],c.date],[ids[2],c.date],[ids[3],'20160301'],[ids[5],c.date],[ids[6],'20150420']])db.prepare('INSERT INTO 講習会受講表 VALUES(?,?)').run(...row);
  assert.throws(()=>db.prepare('INSERT INTO 講習会受講表 VALUES(?,?)').run(null,c.date));assert.throws(()=>db.prepare('INSERT INTO 講習会受講表 VALUES(?,?)').run(ids[4],null));
  function query(sql:string){attempts++;try{return db.prepare(sql).all();}catch{return null;}}
  const normalize=(rows:ReturnType<typeof query>)=>rows?.map(row=>[String(row.key),Number(row.value)]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
  const byEmployee=new Map<string,number[]>();for(const [id,,cost]of expenses)byEmployee.set(id,[...(byEmployee.get(id)??[]),cost]);
  const aggregate=(xs:number[],method:string)=>method==='SUM'?xs.reduce((a,b)=>a+b,0):method==='MAX'?Math.max(...xs):xs.reduce((a,b)=>a+b,0)/xs.length;
  const salary=[...byEmployee].map(([id,xs])=>[id,aggregate(xs,c.method)]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
  const bodyText=body.prompt.map(text).join('\n');assert(bodyText.includes(c.method==='SUM'?'交通費の合計':c.method==='MAX'?'各交通費のうち最大額':'各交通費の平均額'));
  function grouping(choice:string){const m=/^(交通機関表|従業員表|通勤費表)を(交通機関コード|従業員番号)で$/.exec(choice);assert(m);return {table:m[1],key:m[2]};}
  checkPart(body,'part-a',choice=>{const group=grouping(choice.text);return eq(normalize(query(`SELECT ${group.key} AS key, ${c.method}(交通費) AS value FROM ${group.table} GROUP BY ${group.key}`)),salary);});
  checkPart(body,'part-b',choice=>eq(normalize(query(`SELECT 従業員番号 AS key, ${choice.text}(交通費) AS value FROM 通勤費表 GROUP BY 従業員番号`)),salary));
  const usage=new Map<string,Set<string>>();for(const [id,code]of expenses){if(!usage.has(code))usage.set(code,new Set());usage.get(code)!.add(id);}const counts=[...usage].map(([code,users])=>[code,users.size]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
  checkPart(body,'part-c',choice=>{const group=grouping(choice.text);return eq(normalize(query(`SELECT ${group.key} AS key, COUNT(従業員番号) AS value FROM ${group.table} GROUP BY ${group.key}`)),counts);});
  checkPart(body,'part-d',choice=>eq(normalize(query(`SELECT 交通機関コード AS key, ${choice.text}(従業員番号) AS value FROM 通勤費表 GROUP BY 交通機関コード`)),counts));
  const bus=expenses.filter(([,code])=>code.startsWith('B')).map(([id,code])=>[id,routes.find(r=>r[0]===code)![1]]).sort();
  checkPart(body,'part-e',choice=>{const rows=query(`SELECT 通勤費表.従業員番号 AS id,交通機関表.交通機関名 AS name FROM 通勤費表,交通機関表 WHERE 通勤費表.交通機関コード=交通機関表.交通機関コード AND ${choice.text}`);return eq(rows?.map(row=>[String(row.id),String(row.name)]).sort(),bus);});
  const affected=[...new Set(expenses.filter(([,code])=>code==='B03'||code==='S01').map(([id])=>id))].sort();
  checkPart(body,'part-f',choice=>{const rows=query(`SELECT 通勤費表.従業員番号 AS id FROM 通勤費表 WHERE ${choice.text}`);return eq(rows?.map(row=>String(row.id)).sort(),affected);});
  const unattended=[ids[3],ids[4]].sort();
  checkPart(body,'part-g',choice=>{assert(choice.text.includes('IS NULL')||choice.text.includes(c.date));const rows=query(`SELECT 通勤費表.従業員番号 AS id FROM 通勤費表 WHERE 通勤費表.交通機関コード='C01' AND ${choice.text}`);return eq(rows?.map(row=>String(row.id)).sort(),unattended);});
  assert.equal(attempts,28);return {choiceTruthChecks:28,sqliteQueries:attempts,primaryKeyNullRejections:2};
 }finally{db.close();}
}

type Ratio={n:bigint;d:bigint};
const same=(a:Ratio,b:Ratio)=>a.n*b.d===b.n*a.d;
const fromDecimal=(s:string):Ratio=>{const m=/^(\d+)(?:\.(\d+))?$/.exec(s);assert(m);return {n:BigInt(m[1]+(m[2]??'')),d:10n**BigInt((m[2]??'').length)};};
type Timing={milliseconds:number;speed:number;fixedCount:number;fixedBytes:number;htmlBase:number;htmlPerItem:number;imageBytes:number};
/** Each request is a sequence of round-trip events and at most one payload.
 * Clock numerator denominator is speed×1000, avoiding floating-point rounding. */
export function eventClock(config:Timing,items:{bytes:number;cached:boolean;resend:boolean}[]):Ratio {
 let clock=0n;const roundtrip=BigInt(config.milliseconds)*BigInt(config.speed);
 for(const item of items){const events=item.cached&&!item.resend?['check']:['request','response','complete','payload'];for(const event of events)clock+=event==='payload'?BigInt(item.bytes)*1000n:roundtrip;}
 return {n:clock,d:BigInt(config.speed)*1000n};
}
function latexValue(input:string,n:number,speed:number){
 const fraction=/^\\frac\{(.+)\}\{e\}$/.exec(input),body=fraction?fraction[1]:input;
 const clean=body.replace(/10\^\{(\d+)\}/g,(_,power)=>String(10n**BigInt(power))).replaceAll('\\times','*').replace(/\s+/g,'');assert(/^[0-9n*+]+$/.test(clean),input);
 const numerator=clean.split('+').reduce((sum,term)=>sum+term.split('*').reduce((product,token)=>product*(token==='n'?BigInt(n):BigInt(token)),1n),0n);
 return {n:numerator,d:fraction?BigInt(speed):1n,seconds:Boolean(fraction)};
}
export function checkQuestion4(body:GeneratedBody,index:number){
 const c=review.q4.cases[index],allText=body.prompt.map(text).join('\n');assert(allText.includes('逐次実行')&&allText.includes('並行して行われることはない')&&allText.includes('変動データもブラウザにキャッシュされていない'));
 assert(allText.includes(String(c.fixedCount)+'個'));assert(allText.includes('t＝'+String(c.milliseconds/1000)));assert(allText.includes(String(c.speed/1000000)+'×10⁶'));
 const fixed=Array.from({length:c.fixedCount},()=>({bytes:c.fixedBytes,cached:false,resend:false})),cached=eventClock(c,fixed.map(item=>({...item,cached:true}))),uncached=eventClock(c,fixed);
 checkPart(body,'part-a',choice=>same(fromDecimal(choice.text),cached));checkPart(body,'part-b',choice=>same(fromDecimal(choice.text),uncached));
 checkPart(body,'part-c',choice=>[0,1,2,17].every(n=>{const v=latexValue(choice.text,n,c.speed);return v.seconds&&same(v,{n:BigInt(c.htmlBase+c.htmlPerItem*n),d:BigInt(c.speed)});}));
 checkPart(body,'part-d',choice=>[0,1,2,17].every(n=>{const v=latexValue(choice.text,n,c.speed);return v.seconds&&same(v,{n:BigInt(c.imageBytes),d:BigInt(c.speed)});}));
 let maximum=-1,boundary:Ratio|undefined,next:Ratio|undefined;
 for(let n=0;n<=200;n++){
  const items=[...fixed,{bytes:c.htmlBase+c.htmlPerItem*n,cached:false,resend:false},...Array.from({length:n},()=>({bytes:c.imageBytes,cached:false,resend:false}))],time=eventClock(c,items);
  if(time.n<=5n*time.d){maximum=n;boundary=time;}else{next=time;break;}
 }
 assert.equal(maximum,c.maximumN);assert(boundary&&next&&boundary.n<=5n*boundary.d&&next.n>5n*next.d);assert(body.explanation.includes('最大整数は'+maximum));
 assert(same(eventClock(c,[{bytes:c.fixedBytes,cached:true,resend:true}]),eventClock(c,[{bytes:c.fixedBytes,cached:false,resend:false}])),'cached retransmission is3t+v/e, not4t+v/e');
 return {choiceTruthChecks:32,maximumN:maximum,boundaryConfirmed:true};
}
