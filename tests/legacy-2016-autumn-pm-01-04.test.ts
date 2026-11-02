import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {specs} from '../scripts/legacy-2016-autumn-pm-01-04-specs';
import {legacy2016AutumnPm0104Figures,autumn2016Pm0104Profiles as profiles} from '../src/core/generators/legacy-2016-autumn-pm-figures-01-04';
import {legacy2016AutumnPm0104FigureRenderers} from '../src/ui/Legacy2016AutumnPm0104Figures';
import {validateBookletFigureExtensions,readBookletFigure} from '../src/core/booklet-figure-extension-contract';
import {validateBookletFigureRenderers} from '../src/ui/booklet-figure-renderer-contract';
import review from './fixtures/legacy-2016-autumn-pm-01-04-review.json';
import {checkQuestion1,checkQuestion2,checkQuestion3,checkQuestion4,partChoices,text,parseExpression} from './fixtures/legacy-2016-autumn-pm-01-04-oracle';
import type {GeneratedBody} from '../src/core/generators/definition';
import type {Block} from '../src/core/types';
import {Content} from '../src/ui/Content';
import {fixture} from './fixtures';
import {validateFormula} from '../src/core/validation';

const definitions=specs.map(s=>s.definition),marks='アイウエオカキク';
function officialMarks(body:GeneratedBody){return body.answerParts!.map(part=>{const answer=body.partAnswers!.find(a=>a.kind==='choice'&&a.partId===part.id);assert(answer&&answer.kind==='choice');return marks[part.choiceIds.indexOf(answer.choiceId)];});}
function render(profile:string,values:number[],caption='検証用の原図'){
 const figure=legacy2016AutumnPm0104FigureRenderers.find(r=>r.profile===profile);assert(figure);return renderToStaticMarkup(createElement(figure.component,{values,caption}));
}

test('Q1–4 preserve official source keys, all fields, shared answer groups, original pages and reference input',()=>{
 assert.deepEqual(definitions.map(d=>d.source),[1,2,3,4].map(n=>'2016h28a-fe-pm-'+n));
 for(const [i,spec]of specs.entries()){
  assert.deepEqual(spec.definition.reference,[0]);assert.equal(spec.definition.fields.length,1);assert.deepEqual([spec.definition.fields[0].minimum,spec.definition.fields[0].maximum],[0,3]);
  const original=spec.original;assert.deepEqual(officialMarks(original),(review.officialAnswers as Record<string,string[]>)[String(spec.number)]);
  assert.equal(original.answerParts!.length,review.answerFieldCounts[i]);assert.equal(original.choices.length,review.uniqueChoiceCounts[i]);assert.equal(original.answerParts!.reduce((n,p)=>n+p.choiceIds.length,0),review.answerReferenceCounts[i]);
  assert.equal(new Set(original.answerParts!.map(p=>p.id)).size,original.answerParts!.length);assert.equal(original.partAnswers!.length,original.answerParts!.length);assert.equal(original.correctIndex,undefined);
  assert.deepEqual(spec.pages,(review.sourcePages as Record<string,number[]>)[String(spec.number)]);assert.deepEqual(original,spec.definition.build([0]));
  assert(spec.definition.notes.includes('原'));assert(spec.definition.publicNotes.length>30);
 }
 assert.deepEqual(specs[0].original.answerParts!.slice(2).map(p=>p.choiceIds),Array(3).fill(specs[0].original.answerParts![2].choiceIds));
 assert.deepEqual(specs[1].original.answerParts![0].choiceIds,specs[1].original.answerParts![1].choiceIds);
 assert.deepEqual(specs[2].original.answerParts![0].choiceIds,specs[2].original.answerParts![2].choiceIds);assert.deepEqual(specs[2].original.answerParts![1].choiceIds,specs[2].original.answerParts![3].choiceIds);
 assert.deepEqual(specs[3].original.answerParts![0].choiceIds,specs[3].original.answerParts![1].choiceIds);assert.deepEqual(specs[3].original.answerParts![2].choiceIds,specs[3].original.answerParts![3].choiceIds);
});

test('Q1 all four conditions pass independent network reachability, first-match firewall and reviewed all-control meaning checks',ctx=>{
 for(let i=0;i<4;i++){const result=checkQuestion1(definitions[0].build([i]),i);assert.equal(result.choiceTruthChecks,26);ctx.diagnostic('Q1 input'+i+': '+JSON.stringify(result));}
});
test('Q2 all four conditions pass independent finite automata, left-recursive grammar recognition and recursive-descent trees',ctx=>{
 for(let i=0;i<4;i++){const result=checkQuestion2(definitions[1].build([i]),i);assert.equal(result.choiceTruthChecks,22);assert(result.lexicalWords>9000);ctx.diagnostic('Q2 input'+i+': '+JSON.stringify(result));}
 assert.deepEqual(parseExpression('v op1 w op1 x'),['op1',['op1','v','w'],'x']);assert.deepEqual(parseExpression('v op2 w op1 x'),['op2','v',['op1','w','x']]);
});
test('Q3 every SQL/grouping choice is checked on an independent SQLite database with duplicate, multiple-route, date and NULL counterexamples',ctx=>{
 for(let i=0;i<4;i++){const result=checkQuestion3(definitions[2].build([i]),i);assert.equal(result.sqliteQueries,28);assert.equal(result.primaryKeyNullRejections,2);ctx.diagnostic('Q3 input'+i+': '+JSON.stringify(result));}
});
test('Q4 all numeric and fractional choices agree with exact sequential event clocks, dimensions and the integer boundary on both sides',ctx=>{
 for(let i=0;i<4;i++){const body=definitions[3].build([i]),result=checkQuestion4(body,i);assert.equal(result.choiceTruthChecks,32);assert.equal(result.boundaryConfirmed,true);ctx.diagnostic('Q4 input'+i+': '+JSON.stringify(result));
  const ab=partChoices(body,'part-a').map(c=>c.text);assert.equal(new Set(ab).size,8);assert(ab.every(s=>/^\d+(?:\.\d{1,3})?$/.test(s)));if(i===0)assert.deepEqual(ab,review.q4.referenceNumericChoices);
 }
});

test('source-local figures preserve a core/UI bijection, DFA transitions, syntax-tree topology, primary keys and merged table headers in SSR',()=>{
 const entries=[{scope:'2016-autumn-pm',figures:legacy2016AutumnPm0104Figures}],ui=[{scope:'2016-autumn-pm',renderers:legacy2016AutumnPm0104FigureRenderers}];
 assert.equal(validateBookletFigureExtensions(entries).length,21);assert.equal(validateBookletFigureRenderers(ui,entries).length,21);
 for(const f of legacy2016AutumnPm0104Figures)for(let value=f.domain[0][0];value<=f.domain[0][1];value++){
  const description=readBookletFigure(f,[value]);assert(description.trim().length>0);const markup=render(f.profile,[value]);assert(markup.includes('<figure'));assert(markup.includes('<figcaption'));assert(markup.includes('diagram-scroll'));assert(!markup.includes('#000')&&!markup.includes('#fff'));assert(!markup.includes('<img'));
 }
 const named:Record<string,string>={
  [profiles.inequality]:'bcd',[profiles.cia]:'abc',[profiles.prose2]:'e',[profiles.prose3]:'abcd',[profiles.prose4]:'ab',
  [profiles.expression]:'c',[profiles.factor]:'d',[profiles.queryE]:'e',[profiles.queryF]:'f',[profiles.queryG]:'g',
 };
 for(const [profile,letters] of Object.entries(named)){
  const f=legacy2016AutumnPm0104Figures.find(f=>f.profile===profile)!;
  const markup=Array.from({length:f.domain[0][1]+1},(_,i)=>render(profile,[i])).join('');
  assert.equal([...markup.matchAll(/data-answer-blank="([a-g])"/g)].map(m=>m[1]).join(''),letters);
  assert(!markup.includes('<details'));assert(!markup.includes('[[ '));
 }
 for(const profile of [profiles.lexical,profiles.expression,profiles.factor])assert(render(profile,[0]).includes('data-source-grammar='));
 assert(!render(profiles.lexical,[0]).includes('data-answer-blank')); // optional brackets are not answer blanks.
 assert(render(profiles.before,[0]).includes('東京都文京区○○○'));
 const dfa=render(profiles.dfa,[0]);assert.equal((dfa.match(/data-state=/g)??[]).length,7);assert.equal((dfa.match(/data-accepting=/g)??[]).length,2);assert.equal((dfa.match(/data-transition=/g)??[]).length,12);assert(dfa.includes('data-transition="1-b-4"')&&dfa.includes('data-transition="4-digit-6"'));
 assert.equal((render(profiles.network,[0]).match(/data-junction=/g)??[]).length,8);
 assert.equal((render(profiles.example,[0]).match(/data-traversal=/g)??[]).length,3);
 for(let choice=0;choice<4;choice++){
  const markup=render(profiles.tree,[choice]),nodes=new Map<string,string>();
  for(const m of markup.matchAll(/<text[^>]*data-tree-node="([^"]+)"[^>]*>([^<]+)<\/text>/g))nodes.set(m[1],m[2]);
  const expected=new Map<string,string>(),edges:string[]=[];function visit(tree:unknown,path='r'){if(typeof tree==='string'){expected.set(path,tree);return;}assert(Array.isArray(tree));expected.set(path,String(tree[0]));edges.push(path+'>'+path+'l',path+'>'+path+'r');visit(tree[1],path+'l');visit(tree[2],path+'r');}visit(review.q2.trees[choice]);assert.deepEqual([...nodes].sort(),[...expected].sort());
  const actual=[...markup.matchAll(/data-tree-parent="([^"]+)" data-tree-child="([^"]+)"/g)].map(m=>m[1]+'>'+m[2]);assert.deepEqual(actual.sort(),edges.sort());
 }
 assert.equal((render(profiles.before,[0]).match(/<u /g)??[]).length,1);assert.equal((render(profiles.after,[0]).match(/<u /g)??[]).length,4);assert.equal((render(profiles.training,[0]).match(/<u /g)??[]).length,2);
 assert(render(profiles.rules,[0]).includes('colSpan="3"')||render(profiles.rules,[0]).includes('colspan="3"'));assert.equal((render(profiles.transfers,[0]).match(/rowSpan="2"|rowspan="2"/g)??[]).length,2);
});

test('all source-specific conditions and required errata remain visible before answering and fixed references retain explicit editorial ownership',()=>{
 const pageFragments:Record<number,string[]>={6:['HTTPSをHTTPに変換','監視サーバ','Webサーバ2台'],7:['監視専用／1600','DB専用／1552','最初に一致'],8:['項番2の送信元を','関連（一部）','設問3'],9:['機密性／［a］','コンテンツが改ざん','カ(vi)'],10:['数字列 → 数字','最小単位','省略可能'],11:['最終状態は3と6','0から2へ［a］','帰り掛け'],12:['op1の優先順位','項 op1 因子','括弧内の演算'],13:['因子 → 名前','ア 根op2','イ 根op1','ウ 根op2','エ 根op1'],14:['10650','4800','5850','両方が組合せ主キー'],15:["LIKE 'B%'","LIKE 'B_'","LIKE ' B%'",'AVG','COUNT','MAX','SUM'],16:['同じ従業員番号は一つだけ','GROUP BY 通勤費表.交通機関コード','GROUP BY 通勤費表.従業員番号','レコードは存在しない'],17:['20160420','受講日 IS NULL','従業員番号 NOT IN','両方が組合せ主キー'],18:['並行して行われることはない','3×t＋v÷e','再転送が不要'],19:['合計100個','10⁴＋500×n','［b］＋3×t＋［c］＋(3×t＋［d］)×n≦5'],20:['ア0.005','ク2','カ(10⁴＋500×n)÷e','ク25×10³×n÷e']};
 for(const spec of specs){for(const page of spec.pages){const alt=spec.originalPageAlt[page];assert(typeof alt==='string'&&alt.trim());assert(!/全本文を保持|原頁参照だけ|転記待ち/.test(alt));for(const fragment of pageFragments[page])assert(alt.includes(fragment),`physical page${page}: ${fragment}`);}const body=spec.definition.build([0]);assert(body.prompt.length>10);assert(body.explanation.length>400);}
 for(const spec of specs)for(let i=0;i<4;i++){
  const body=spec.definition.build([i]),attribution={origin:'adapted' as const,sourceRefs:[],rightsRefs:[],creatorIds:[]};
  const markup=renderToStaticMarkup(createElement(Content,{content:{attribution,blocks:body.prompt},bundle:fixture(),assetUrls:{},showAttribution:false}));
  assert(!markup.includes('supplementary-text'),'required rules/SQL must remain visible in the actual Content renderer');
  for(const block of [...body.prompt,...body.choices.flat(),...(body.contexts??[]).flatMap(context=>context.blocks)])if(block.type==='formula'&&block.format==='latex')assert.doesNotThrow(()=>validateFormula(block.text),'every formula must pass the real shared command whitelist');
  if(spec.number===4){assert(markup.includes('data-transfer-inequality'));assert.equal((markup.match(/data-answer-blank="b"/g)??[]).length,2);for(const label of 'cd')assert(markup.includes(`data-answer-blank="${label}"`));}
  if(spec.number===2){assert.equal((markup.match(/data-source-grammar=/g)??[]).length,3);for(const label of 'cde')assert(markup.includes(`data-answer-blank="${label}"`));}
  if(spec.number===3){assert.equal((markup.match(/data-source-sql=/g)??[]).length,3);for(const label of 'abcdefg')assert(markup.includes(`data-answer-blank="${label}"`));}
 }
 const q1=specs[0],contexts=q1.original.contexts!;assert.deepEqual(q1.editorialContextTitles,['原資料を読む際の補足']);assert.equal(contexts.filter(c=>q1.editorialContextTitles!.includes(c.title)).length,1);
 const imageIds=contexts.flatMap(c=>c.blocks.filter(b=>b.type==='image').map(b=>(b as Extract<Block,{type:'image'}>).assetId));assert.deepEqual(imageIds,q1.definition.fixedReferenceAssetIds);assert.deepEqual(imageIds,['asset-ipa-2016h28a-fe-pm-p002']);assert(q1.originalPageAlt[2].includes('半年ごとの一連'));assert(q1.originalPageAlt[8].includes('関連（一部）'));assert(!q1.original.prompt.map(text).join('\n').includes('関連（一部）'));
 const q2=specs[1].original.prompt.map(text).join('\n');for(const condition of ['1文字ずつ','最終状態','優先順位','括弧内','帰り掛け'])assert(q2.includes(condition));
 const q3=specs[2].original.prompt.map(text).join('\n');for(const condition of ['同じ従業員番号は一つだけ表示','3文字の固定長','受講していない従業員のレコードは存在しない','主キー'])assert(q3.includes(condition));
 const q4=specs[3].original.prompt.map(text).join('\n');for(const condition of ['逐次実行','並行して行われることはない','表1で示した時間以外は無視','全て再転送が不要','変動データもブラウザにキャッシュされていない'])assert(q4.includes(condition));
});

test('input domains are finite and reject malformed, sparse, accessor, symbol, boundary and fractional values without reading getters',()=>{
 let invoked=0;const getter:number[]=[];Object.defineProperty(getter,'0',{get(){invoked++;return 0;}});const symbol=[0];Object.defineProperty(symbol,Symbol('unreviewed'),{value:1});
 const holeTail=[0];holeTail.length=2;const longHoleTail=[0];longHoleTail.length=50;
 for(const d of definitions)for(const input of [[],[0,0],[-1],[4],[0.5],[NaN],[Infinity],Array(1),getter,symbol,holeTail,longHoleTail])assert.throws(()=>d.build(input),/PARAMETER_CONSTRAINT/);
 assert.equal(invoked,0);
 for(const f of legacy2016AutumnPm0104Figures){assert.throws(()=>readBookletFigure(f,[]));assert.throws(()=>readBookletFigure(f,[f.domain[0][1]+1]));}
});
