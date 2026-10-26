/** Independent bounded SQL reader for the reviewed source grammar only.
 * No dynamic SQL/JS evaluation, file/network calls or vendor extensions. */
export type Value=string|number|null;
export type Expr={kind:'column';table:string;name:string}|{kind:'number';value:number}|{kind:'null'}|{kind:'aggregate';name:string;value:Expr|'*'}|{kind:'equal';left:Expr;right:Expr}|{kind:'in';left:Expr;negate:boolean;query:Select}|{kind:'and';left:Expr;right:Expr};
export type Select={distinct:boolean;items:Expr[];from:string[];where?:Expr;groups:Expr[];having?:Expr};
const schema:Record<string,{columns:string[];pk:string[]}>= {
 保護者表:{columns:['保護者番号','保護者氏名','電話番号','住所'],pk:['保護者番号']},児童表:{columns:['児童番号','児童氏名','学年','保護者番号'],pk:['児童番号']},活動表:{columns:['児童番号','イベント番号'],pk:['児童番号','イベント番号']},イベント表:{columns:['イベント番号','イベント名','開催日'],pk:['イベント番号']}
};
export function readSQL(text:string):Select {
 const re=/\s+|[\p{L}_][\p{L}\p{N}_]*|[0-9]+|[(),.=*]/uy,tokens:string[]=[];let at=0;
 while(at<text.length){re.lastIndex=at;const m=re.exec(text);if(!m)throw Error('SQL_TOKEN:'+text.slice(at,at+15));at=re.lastIndex;if(!/^\s/.test(m[0]))tokens.push(/^[a-z]+$/i.test(m[0])?m[0].toUpperCase():m[0]);}
 let n=0;const peek=()=>tokens[n],take=(t?:string)=>{const v=tokens[n++];if(v===undefined||(t!==undefined&&v!==t))throw Error('SQL_EXPECT:'+t+':'+v);return v;},is=(t:string)=>peek()===t;
 const scalar=():Expr=>{const t=take();if(t==='NULL')return{kind:'null'};if(/^\d+$/.test(t)){const value=Number(t);if(!Number.isSafeInteger(value))throw Error('SQL_UNSAFE_INTEGER');return{kind:'number',value};}if(['COUNT','AVG','MAX','SUM'].includes(t)){take('(');const value=is('*')?(take('*'),'*' as const):scalar();take(')');return{kind:'aggregate',name:t,value};}take('.');const name=take();if(!schema[t]?.columns.includes(name))throw Error('SQL_COLUMN:'+t+'.'+name);return{kind:'column',table:t,name};};
 const predicate=():Expr=>{let left=scalar();if(is('=')){take('=');left={kind:'equal',left,right:scalar()};}else{let negate=false;if(is('NOT')){take('NOT');negate=true;}take('IN');take('(');const query=select();take(')');left={kind:'in',left,negate,query};}while(is('AND')){take('AND');left={kind:'and',left,right:predicate()};}return left;};
 const list=()=>{const rows=[scalar()];while(is(',')){take(',');rows.push(scalar());}return rows;};
 const select=():Select=>{take('SELECT');const distinct=is('DISTINCT');if(distinct)take('DISTINCT');const items=list();take('FROM');const from=[take()];while(is(',')){take(',');from.push(take());}for(const table of from)if(!schema[table])throw Error('SQL_TABLE:'+table);if(new Set(from).size!==from.length)throw Error('SQL_DUPLICATE_TABLE');const where=is('WHERE')?(take('WHERE'),predicate()):undefined;const groups=is('GROUP')?(take('GROUP'),take('BY'),list()):[];const having=is('HAVING')?(take('HAVING'),predicate()):undefined;return{distinct,items,from,...(where?{where}:{}),groups,...(having?{having}:{})};};
 const q=select();if(n!==tokens.length)throw Error('SQL_TRAILING:'+peek());return q;
}
const key=(e:Expr)=>e.kind==='column'?e.table+'.'+e.name:JSON.stringify(e);
const children=(e:Expr):Expr[]=>e.kind==='aggregate'?e.value==='*'?[]:[e.value]:e.kind==='equal'||e.kind==='and'?[e.left,e.right]:e.kind==='in'?[e.left]:[];
function refs(e:Expr,aggregate=false):Extract<Expr,{kind:'column'}>[] {if(e.kind==='aggregate')return[];return e.kind==='column'?[e]:children(e).flatMap(x=>refs(x,aggregate));}
const hasAggregate=(e:Expr):boolean=>e.kind==='aggregate'||children(e).some(hasAggregate);
export function validateSQL(q:Select):string|undefined {
 const all=[...q.items,...q.groups,...(q.where?[q.where]:[]),...(q.having?[q.having]:[])];
 const everyColumn=(e:Expr):string|undefined=>{if(e.kind==='column'&&!q.from.includes(e.table))return'UNBOUND_COLUMN:'+key(e);if(e.kind==='in'){const inner=validateSQL(e.query);if(inner)return inner;if(e.query.items.length!==1)return'IN_ARITY';}for(const c of children(e)){const x=everyColumn(c);if(x)return x;}return undefined;};for(const e of all){const x=everyColumn(e);if(x)return x;}
 if(q.where&&hasAggregate(q.where))return'AGGREGATE_IN_WHERE';const aggregate=q.groups.length>0||!!q.having||q.items.some(hasAggregate);if(!aggregate)return undefined;
 const grouped=new Set(q.groups.map(key));for(const e of [...q.items,...(q.having?[q.having]:[])])for(const ref of refs(e)){const fd=schema[ref.table].pk.every(c=>grouped.has(ref.table+'.'+c));if(!grouped.has(key(ref))&&!fd)return'UNGROUPED_COLUMN:'+key(ref);}
 return undefined;
}
export type Database=Record<string,Record<string,Value>[]>;type Env=Record<string,Record<string,Value>>;type Truth=true|false|null;
export function evaluateSQL(q:Select,db:Database):Value[][] {
 const error=validateSQL(q);if(error)throw Error(error);
 const and=(a:Truth,b:Truth):Truth=>a===false||b===false?false:a===null||b===null?null:true;
 const scalar=(e:Expr,row:Env,group?:Env[]):Value|Truth=>{
  switch(e.kind){case'column':{const r=row[e.table];if(!r||!Object.hasOwn(r,e.name))throw Error('MISSING_DATA:'+key(e));return r[e.name];}case'number':return e.value;case'null':return null;case'equal':{const a=scalar(e.left,row,group),b=scalar(e.right,row,group);return a===null||b===null?null:a===b;}case'and':return and(scalar(e.left,row,group)as Truth,scalar(e.right,row,group)as Truth);case'in':{const a=scalar(e.left,row,group),rows=evaluateSQL(e.query,db),vs=rows.map(r=>r[0]);let truth:Truth=vs.length===0?false:a!==null&&vs.some(v=>v!==null&&v===a)?true:a===null||vs.some(v=>v===null)?null:false;if(e.negate&&truth!==null)truth=!truth;return truth;}case'aggregate':{if(!group)throw Error('AGGREGATE_WITHOUT_GROUP');if(e.name==='COUNT'&&e.value==='*')return group.length;if(e.value==='*')throw Error('STAR_AGGREGATE');const vs=group.map(r=>scalar(e.value as Expr,r)).filter(v=>v!==null);if(e.name==='COUNT')return vs.length;if(vs.some(v=>typeof v!=='number'))throw Error('NON_NUMERIC_AGGREGATE');if(vs.length===0)return null;const ns=vs as number[];return e.name==='SUM'?ns.reduce((a,b)=>a+b,0):e.name==='MAX'?Math.max(...ns):ns.reduce((a,b)=>a+b,0)/ns.length;}}
 };
 let rows:Env[]=[{}];for(const table of q.from){if(!db[table])throw Error('MISSING_TABLE:'+table);rows=rows.flatMap(row=>db[table].map(value=>({...row,[table]:value})));}if(q.where)rows=rows.filter(row=>scalar(q.where!,row)===true);
 const aggregate=q.groups.length>0||!!q.having||q.items.some(hasAggregate);let output:Value[][];
 if(aggregate){const grouped=new Map<string,Env[]>();if(q.groups.length){for(const row of rows){const k=JSON.stringify(q.groups.map(g=>scalar(g,row))),group=grouped.get(k)??[];group.push(row);grouped.set(k,group);}}else grouped.set('[]',rows);output=[...grouped.values()].filter(group=>!q.having||scalar(q.having,group[0]??{},group)===true).map(group=>q.items.map(e=>scalar(e,group[0]??{},group)as Value));}
 else output=rows.map(row=>q.items.map(e=>scalar(e,row)as Value));
 if(q.distinct)output=[...new Map(output.map(row=>[JSON.stringify(row),row])).values()];return output.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

import assert from'node:assert/strict';import type{GeneratedBody}from'../../src/core/generators/definition';import facts from'./legacy-2018-pm-members-facts.json';
export function legacy2018MembersOracle(body:GeneratedBody,values:readonly number[]){
 assert.equal(values.length,2);assert(values.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1));const grade=[6,4][values[0]],event=[18001,18002][values[1]],expected=facts.sourceBlocks.map(b=>b.kind==='p'?{type:'paragraph',text:b.page===15&&b.text.startsWith('設問1')?b.text.replaceAll('6年生',grade+'年生'):b.page===15&&b.text.startsWith('設問2')?b.text.replaceAll('18001',String(event)):b.text}:{type:'figure',kind:b.kind,caption:b.kind==='tables'?b.text:`設問${['a','b','c'].indexOf(b.kind)+2} SQL文`});
 expected.splice(2,0,{type:'paragraph',text:'生成版の追加前提：'+facts.addedGeneratedPremise});assert.equal(body.prompt.length,expected.length);
 for(const[i,e]of expected.entries()){const b=body.prompt[i];if(e.type==='paragraph'){assert(b.type==='paragraph');assert.equal(b.text,e.text);}else{assert(b.type==='diagram'&&b.scene.kind==='source_figure');const kind='kind'in e?e.kind:undefined;assert.equal(b.scene.profile,kind==='tables'?'legacy-2018-members-tables':'legacy-2018-members-sql-scaffold');assert.deepEqual(b.scene.values,kind==='tables'?values:[['a','b','c'].indexOf(String(kind)),...values]);assert.equal(b.caption,'caption'in e?e.caption:undefined);assert(b.alt.length>30);if(kind==='tables'){for(const t of facts.tables){for(const s of[...t.columns,...t.primary])assert(b.alt.includes(s));for(const row of('shownData'in t?t.shownData:'knownPairs'in t?t.knownPairs:t.knownRows)!)for(const s of row)assert(b.alt.includes(String(s)));}assert(b.alt.includes('全レコードを示したものではない'));}else{const id=String(kind)as keyof typeof facts.scaffolds;assert.equal(b.alt,`設問${['a','b','c'].indexOf(id)+2}のSQL文。空欄${id}は一つ。\n${facts.scaffolds[id]}`);}}}
 const choices=facts.originalChoices.map((group,i)=>group.map(t=>i===0?t.replaceAll('学年 = 6','学年 = '+grade):i===1?t.replaceAll('18001',String(event)):t));assert.deepEqual(body.choices,choices.flat().map(text=>[{type:'code',text,language:'sql'}]));assert.equal(body.correctIndex,undefined);assert.equal(body.contexts,undefined);
 assert.deepEqual(body.answerParts,facts.partIds.map((id,i)=>({id,label:facts.partLabels[i],choiceIds:Array.from({length:4},(_,j)=>`choice-value-${i*4+j+1}`)})));
 assert.deepEqual(body.partAnswers,facts.truth.map((g,i)=>{assert.equal(g.filter(Boolean).length,1);return{kind:'choice',partId:facts.partIds[i],choiceId:`choice-value-${i*4+g.findIndex(Boolean)+1}`};}));
 for(const p of[/保護者番号で結合/,new RegExp('学年が'+grade),/DISTINCTで重複除去/,new RegExp('イベント番号'+event),/WHEREで指定/,/グループ化していない/,/一部SQL処理系の拡張/,/COUNT\(\*\)/,/識別値の平均・最大・合計/,/参加行がないイベントを含めるものではない/,/学年0で登録/,/学年7の児童を削除/,/追加前提.*NULLは含まれない/,/= NULLは真にならず/,/IN.*削除対象が逆/])assert.match(body.explanation,p);
 assert(!/[アイウエ]が正答|原問.*誤り|SQLite.*標準SQL/.test(body.explanation));
 return{truth:facts.truth,signature:body.partAnswers!.map(a=>a.kind==='choice'?a.choiceId:'').join('/'),grade,event};
}
