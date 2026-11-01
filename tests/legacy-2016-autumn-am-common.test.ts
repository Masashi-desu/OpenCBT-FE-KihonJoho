import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {autumn2016CommonContexts,autumn2016CommonAlt,autumn2016CommonProfile} from '../src/core/generators/legacy-2016-autumn-am-common';
import {Legacy2016AutumnAmCommonRules} from '../src/ui/Legacy2016AutumnAmCommonRules';
import {spring2016CommonContexts} from '../src/core/generators/legacy-2016-spring-am-common';
import {validateSourceFigure,sourceFigureAlt} from '../src/core/source-figures';
import {SourceFigure} from '../src/ui/SourceFigure';
import {materialPages} from '../src/ui/MaterialViewer';
import {ownContexts} from '../src/core/generators/definition';
import type {Attribution,Question} from '../src/core/types';

// Independently transcribed from2016 autumn official QS p2–3, SHA256
// e288f1f0d8f8287702bbbba0b00643b0c24bfdb92660172806bbe137e93df7e5.
const expectedStandards=[
  ['JIS Q 9001','JIS Q 9001:2015'],['JIS Q 14001','JIS Q 14001:2015'],
  ['JIS Q 15001','JIS Q 15001:2006'],['JIS Q 20000-1','JIS Q 20000-1:2012'],
  ['JIS Q 20000-2','JIS Q 20000-2:2013'],['JIS Q 27000','JIS Q 27000:2014'],
  ['JIS Q 27001','JIS Q 27001:2014'],['JIS Q 27002','JIS Q 27002:2014'],
  ['JIS X 0160','JIS X 0160:2012'],['ISO 21500','ISO 21500:2012'],
  ['ITIL','ITIL 2011 edition'],['PMBOK','PMBOKガイド 第5版'],['共通フレーム','共通フレーム2013'],
];
test('autumn2016 common preconditions preserve all13 source standard/version rows and keep spring versions separate',()=>{
  const contexts=autumn2016CommonContexts();
  assert.equal(contexts.length,2);
  assert.match(contexts[0].blocks[0].type==='paragraph'?contexts[0].blocks[0].text:'',/各問題文中に注記がない限り/);
  const sourceTable=contexts[0].blocks[2];assert.equal(sourceTable.type,'table');
  if(sourceTable.type!=='table')throw Error('source standard table');
  assert.deepEqual(sourceTable.columns,['試験問題での表記','規格・標準の名称']);
  assert.deepEqual(sourceTable.rows,expectedStandards);
  const spring=spring2016CommonContexts()[0].blocks[2];assert.equal(spring.type,'table');
  if(spring.type!=='table')throw Error('spring standard table');
  assert.deepEqual(spring.rows.slice(0,2),[['JIS Q 9001','JIS Q 9001:2008'],['JIS Q 14001','JIS Q 14001:2004']]);
  sourceTable.rows[0][1]='changed outside definition';
  const fresh=autumn2016CommonContexts()[0].blocks[2];assert(fresh.type==='table');assert.deepEqual(fresh.rows,expectedStandards);
});
test('autumn2016 p3 includes both symbol tables, inversion note, both transistor polarities and the amplifier input signs',()=>{
  const html=renderToStaticMarkup(createElement(Legacy2016AutumnAmCommonRules,{profile:autumn2016CommonProfile,values:[0]}));
  assert.equal((html.match(/<table\b/g)??[]).length,2);
  assert.equal((html.match(/data-common-gate=/g)??[]).length,9);
  assert.equal((html.match(/data-common-circuit=/g)??[]).length,6);
  for(const text of ['2. 論理回路','3. 回路記号','論理積素子（AND）','否定論理積素子（NAND）','論理和素子（OR）',
    '否定論理和素子（NOR）','排他的論理和素子（XOR）','論理一致素子','バッファ','論理否定器（NOT）','スリーステートバッファ',
    '入力部又は出力部に示されている○印は，論理状態の反転又は否定を表す。','抵抗（R）','コンデンサ（C）','ダイオード（D）','トランジスタ（Tr）','接地','演算増幅器'])assert(html.includes(text),text);
  assert.equal((html.match(/data-emitter-arrow="outward"/g)??[]).length,1);
  assert.equal((html.match(/data-emitter-arrow="inward"/g)??[]).length,1);
  const arrows=[...html.matchAll(/data-emitter-arrow="(outward|inward)" data-emitter-branch="(lower|upper)">[\s\S]*?<path data-transistor-arrow="true" d="M([\d ]+) L([\d ]+) L([\d ]+)"/g)];
  assert.equal(arrows.length,2);
  for(const match of arrows){const a=match[3].split(' ').map(Number),tip=match[4].split(' ').map(Number),b=match[5].split(' ').map(Number);
    if(match[1]==='inward'){assert.equal(match[2],'upper');assert(tip[0]<a[0]&&tip[0]<b[0]&&tip[1]<24,'PNP source emitter arrow points inward on the upper branch');}
    else{assert.equal(match[2],'lower');assert(tip[0]>a[0]&&tip[0]>b[0]&&tip[1]>24,'NPN source emitter arrow points outward on the lower branch');}}
  assert(html.includes('data-positive-input="true"')&&html.includes('data-negative-input="true"'));
  const alt=autumn2016CommonAlt();
  for(const text of ['3. 回路記号','トランジスタ','右下の枝の矢印が外向き','右上の枝の矢印が内向き','左上の入力は＋','左下の入力は−'])assert(alt.includes(text),text);
  const diagram=autumn2016CommonContexts()[1].blocks[0];assert.equal(diagram.type,'diagram');
  if(diagram.type!=='diagram')throw Error('common symbol diagram');
  assert.equal(diagram.alt,alt);assert.deepEqual(diagram.scene,{kind:'source_figure',profile:autumn2016CommonProfile,values:[0]});
});
test('autumn2016 common drawing accepts only its fixed literal source-symbol input',()=>{
  for(const input of [{profile:'legacy-2016-spring-am-common-gates',values:[0]},{profile:autumn2016CommonProfile,values:[]},
    {profile:autumn2016CommonProfile,values:[1]},{profile:autumn2016CommonProfile,values:[0,0]}])
    assert.throws(()=>renderToStaticMarkup(createElement(Legacy2016AutumnAmCommonRules,input)),/AM_COMMON_PROFILE/);
});
test('the application diagram route validates the complete autumn reference and rejects altered symbol inputs',()=>{
  const scene={kind:'source_figure' as const,profile:autumn2016CommonProfile,values:[0]};
  validateSourceFigure(scene);assert.equal(sourceFigureAlt(scene.profile,scene.values),autumn2016CommonAlt());
  const html=renderToStaticMarkup(createElement(SourceFigure,{scene,caption:'図記号と説明'}));
  assert(html.includes('3. 回路記号')&&html.includes('data-common-circuit="transistor"'));
  for(const values of [[],[1],[-1],[0,0],[NaN],[0.5]]){
    assert.throws(()=>validateSourceFigure({...scene,values}),{code:'FIGURE_PROFILE'});
    assert.throws(()=>sourceFigureAlt(scene.profile,values),{code:'FIGURE_PROFILE'});
  }
});
test('only exact autumn common appendices follow the prompt; a question-specific condition stays before it',()=>{
  const attribution:Attribution={origin:'adapted',sourceRefs:[{sourceId:'source-ipa-2016h28a-fe-am-qs',locator:{
    section:'平成28年度 秋期 基本情報技術者試験 午前 問1',year:2016,period:'秋期',exam:'基本情報技術者試験',subject:'旧制度・午前',timeSlot:'午前',questionNumber:'1',page:4}}],rightsRefs:['rights-ipa-2016h28a-fe-am'],creatorIds:['codex']};
  const common=ownContexts({prompt:[],choices:[],explanation:'',contexts:autumn2016CommonContexts()},attribution);
  const condition={id:'condition',title:'この問題で用いる条件',content:{attribution,blocks:[{type:'paragraph' as const,text:'本文の前に読む固有の条件。'}]}};
  const q={origin:{kind:'official_adaptation',sourceRefs:attribution.sourceRefs},contexts:[...common,condition],contextRefs:[...common.map(c=>c.id),condition.id],prompt:{attribution,blocks:[{type:'paragraph',text:'問いの本文。'}]}} as Question;
  const pages=materialPages(q);
  assert.deepEqual(pages.map(p=>p.label),['この問題で用いる条件','問題本文','問題文中で共通に使用される表記ルール（p.2）','問題文中で共通に使用される表記ルール（p.3）']);
  const altered=structuredClone(q);const table=altered.contexts[0].content.blocks[2];assert(table.type==='table');table.rows[0][1]='JIS Q 9001:2008';
  assert.equal(materialPages(altered)[0].label,'問題文中で共通に使用される表記ルール（p.2）','an altered reference cannot hide among verified source appendices');
});
