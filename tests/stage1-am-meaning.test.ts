import test from 'node:test';import assert from 'node:assert/strict';import {createHash}from'node:crypto';
import React from 'react';import {renderToStaticMarkup}from'react-dom/server';
import {makeLegacyMorningRegistry}from'../src/core/generators/legacy-morning-registry';
import {readDistributionBundle}from'../scripts/distribution-files';
import {bindQuestion}from'../src/core/generation';
import {Legacy2018PendingAmFigures}from'../src/ui/Legacy2018PendingAmFigures';
import {legacy2019AutumnCircuit}from'../src/core/generators/legacy-2019-autumn-computing';
import fixed from './fixtures/stage1-am-meaning-map.json';
import framework from './fixtures/common-framework65-semantic-review.json';
import type {GeneratedBody}from'../src/core/generators/definition';
import{legacy2017AutumnFoundationsOracle as oracle0}from"./fixtures/legacy-2017-autumn-foundations-oracle";
import{reviewAutumnAmAddition as oracle1}from"./fixtures/legacy-2017-autumn-am-additions-oracle";
import{legacy2017AutumnPlatformOracle as oracle2}from"./fixtures/legacy-2017-autumn-platform-oracle";
import{legacy2017NumericOracle as oracle3}from"./fixtures/legacy-2017-oracle";
import{legacy2017AutumnDataOracle as oracle4}from"./fixtures/legacy-2017-autumn-data-oracle";
import{legacy2017AutumnNetworkOracle as oracle5}from"./fixtures/legacy-2017-autumn-network-oracle";
import{legacy2017AutumnSecurityOracle as oracle6}from"./fixtures/legacy-2017-autumn-security-oracle";
import{legacy2017AutumnRelationsOracle as oracle7}from"./fixtures/legacy-2017-autumn-relations-oracle";
import{legacy2017AliasOracle as oracle8}from"./fixtures/legacy-2017-alias-oracle";
import{legacy2017AutumnQualityOracle as oracle9}from"./fixtures/legacy-2017-autumn-quality-oracle";
import{legacy2017AutumnPlanningOracle as oracle10}from"./fixtures/legacy-2017-autumn-planning-oracle";
import{legacy2017AutumnBusinessOracle as oracle11}from"./fixtures/legacy-2017-autumn-business-oracle";
import{legacy2017ComputingOracle as oracle12}from"./fixtures/legacy-2017-computing-oracle";
import{legacy2017KnowledgeOracle as oracle13}from"./fixtures/legacy-2017-knowledge-oracle";
import{legacy2017SystemsOracle as oracle14}from"./fixtures/legacy-2017-systems-oracle";
import{legacy2017InformationOracle as oracle15}from"./fixtures/legacy-2017-information-oracle";
import{legacy2017DevelopmentOracle as oracle16}from"./fixtures/legacy-2017-development-oracle";
import{legacy2017ManagementOracle as oracle17}from"./fixtures/legacy-2017-management-oracle";
import{legacy2017StrategyOracle as oracle18}from"./fixtures/legacy-2017-strategy-oracle";
import{legacy2017BusinessOracle as oracle19}from"./fixtures/legacy-2017-business-oracle";
import{legacy2018NumericOracle as oracle20}from"./fixtures/legacy-2018-oracle";
import{legacy2018AutumnKnowledgeOracle as oracle21}from"./fixtures/legacy-2018-autumn-foundations-knowledge-oracle";
import{legacy2018AutumnFoundationsOracle as oracle22}from"./fixtures/legacy-2018-autumn-foundations-oracle";
import{legacy2018AutumnMathOracle as oracle23}from"./fixtures/legacy-2018-autumn-foundations-math-oracle";
import{legacy2018AutumnSystemsKnowledgeOracle as oracle24}from"./fixtures/legacy-2018-autumn-systems-knowledge-oracle";
import{legacy2018KnowledgeOracle as oracle25}from"./fixtures/stage1-am-2018-knowledge-oracle";
import{legacy2018AutumnNandOracle as oracle26}from"./fixtures/legacy-2018-autumn-systems-nand-oracle";
import{legacy2018AliasOracle as oracle27}from"./fixtures/legacy-2018-alias-oracle";
import{legacy2018AutumnDataOracle as oracle28}from"./fixtures/legacy-2018-autumn-systems-data-oracle";
import{legacy2018AutumnNetworkOracle as oracle29}from"./fixtures/legacy-2018-autumn-network-oracle";
import{legacy2018AutumnLteOracle as oracle30}from"./fixtures/legacy-2018-autumn-lte-oracle";
import{remainingAmOracle as oracle31}from"./fixtures/legacy-2018-autumn-remaining-am-oracle";
import{legacy2018AutumnDevelopmentOracle as oracle32}from"./fixtures/legacy-2018-autumn-development-oracle";
import{assertAutumn58Meaning as oracle33}from"./fixtures/legacy-2018-autumn58-oracle";
import{pendingAmOracle as oracle34}from"./fixtures/legacy-2018-pending-am-oracle";
import{legacy2018ComputingOracle as oracle35}from"./fixtures/legacy-2018-computing-oracle";
import{legacy2018FundamentalOracle as oracle36}from"./fixtures/legacy-2018-fundamental-oracle";
import{legacy2018SystemOracle as oracle37}from"./fixtures/legacy-2018-system-oracle";
import{legacy2018TechnicalOracle as oracle38}from"./fixtures/legacy-2018-technical-oracle";
import{legacy2018TechnicalCircuitOracle as oracle39}from"./fixtures/legacy-2018-technical-circuit-oracle";
import{legacy2018TechnicalKnowledgeOracle as oracle40}from"./fixtures/legacy-2018-technical-knowledge-oracle";
import{legacy2018NetworkSecurityOracle as oracle41}from"./fixtures/legacy-2018-network-security-oracle";
import{legacy2018DevelopmentKnowledgeOracle as oracle42}from"./fixtures/legacy-2018-development-knowledge-oracle";
import{legacy2018DevelopmentMathOracle as oracle43}from"./fixtures/legacy-2018-development-math-oracle";
import{legacy2018StrategyOracle as oracle44}from"./fixtures/legacy-2018-strategy-oracle";
import{assertStage1SpringMeaning as oracle45}from"./fixtures/legacy-2019-spring-am-oracle";
import{decAGeneratorOracle as oracle46}from"./fixtures/dec-a-generator-oracle";
import{assertLegacy2019Quantitative as oracle47}from"./fixtures/legacy-2019-quantitative-oracle";
import{assertLegacy2019AutumnComputing as oracle48}from"./fixtures/legacy-2019-autumn-computing-oracle";
import{assertLegacy2019Platform as oracle49}from"./fixtures/legacy-2019-platform-oracle";
import{assertLegacy2019AutumnNetwork as oracle50}from"./fixtures/legacy-2019-autumn-network-oracle";
import{assertLegacy2019AutumnStructures as oracle51}from"./fixtures/legacy-2019-autumn-structures-oracle";
import{assertLegacy2019Algorithms as oracle52}from"./fixtures/legacy-2019-algorithms-oracle";
import{assertLegacy2019AutumnQuality as oracle53}from"./fixtures/legacy-2019-autumn-quality-oracle";
import{assertLegacy2019AutumnRemainingAm as oracle54}from"./fixtures/legacy-2019-autumn-remaining-am-oracle";
const oracles:Record<string,Function>={"tests/fixtures/legacy-2017-autumn-foundations-oracle.ts#legacy2017AutumnFoundationsOracle":oracle0,"tests/fixtures/legacy-2017-autumn-am-additions-oracle.ts#reviewAutumnAmAddition":oracle1,"tests/fixtures/legacy-2017-autumn-platform-oracle.ts#legacy2017AutumnPlatformOracle":oracle2,"tests/fixtures/legacy-2017-oracle.ts#legacy2017NumericOracle":oracle3,"tests/fixtures/legacy-2017-autumn-data-oracle.ts#legacy2017AutumnDataOracle":oracle4,"tests/fixtures/legacy-2017-autumn-network-oracle.ts#legacy2017AutumnNetworkOracle":oracle5,"tests/fixtures/legacy-2017-autumn-security-oracle.ts#legacy2017AutumnSecurityOracle":oracle6,"tests/fixtures/legacy-2017-autumn-relations-oracle.ts#legacy2017AutumnRelationsOracle":oracle7,"tests/fixtures/legacy-2017-alias-oracle.ts#legacy2017AliasOracle":oracle8,"tests/fixtures/legacy-2017-autumn-quality-oracle.ts#legacy2017AutumnQualityOracle":oracle9,"tests/fixtures/legacy-2017-autumn-planning-oracle.ts#legacy2017AutumnPlanningOracle":oracle10,"tests/fixtures/legacy-2017-autumn-business-oracle.ts#legacy2017AutumnBusinessOracle":oracle11,"tests/fixtures/legacy-2017-computing-oracle.ts#legacy2017ComputingOracle":oracle12,"tests/fixtures/legacy-2017-knowledge-oracle.ts#legacy2017KnowledgeOracle":oracle13,"tests/fixtures/legacy-2017-systems-oracle.ts#legacy2017SystemsOracle":oracle14,"tests/fixtures/legacy-2017-information-oracle.ts#legacy2017InformationOracle":oracle15,"tests/fixtures/legacy-2017-development-oracle.ts#legacy2017DevelopmentOracle":oracle16,"tests/fixtures/legacy-2017-management-oracle.ts#legacy2017ManagementOracle":oracle17,"tests/fixtures/legacy-2017-strategy-oracle.ts#legacy2017StrategyOracle":oracle18,"tests/fixtures/legacy-2017-business-oracle.ts#legacy2017BusinessOracle":oracle19,"tests/fixtures/legacy-2018-oracle.ts#legacy2018NumericOracle":oracle20,"tests/fixtures/legacy-2018-autumn-foundations-knowledge-oracle.ts#legacy2018AutumnKnowledgeOracle":oracle21,"tests/fixtures/legacy-2018-autumn-foundations-oracle.ts#legacy2018AutumnFoundationsOracle":oracle22,"tests/fixtures/legacy-2018-autumn-foundations-math-oracle.ts#legacy2018AutumnMathOracle":oracle23,"tests/fixtures/legacy-2018-autumn-systems-knowledge-oracle.ts#legacy2018AutumnSystemsKnowledgeOracle":oracle24,"tests/fixtures/stage1-am-2018-knowledge-oracle.ts#legacy2018KnowledgeOracle":oracle25,"tests/fixtures/legacy-2018-autumn-systems-nand-oracle.ts#legacy2018AutumnNandOracle":oracle26,"tests/fixtures/legacy-2018-alias-oracle.ts#legacy2018AliasOracle":oracle27,"tests/fixtures/legacy-2018-autumn-systems-data-oracle.ts#legacy2018AutumnDataOracle":oracle28,"tests/fixtures/legacy-2018-autumn-network-oracle.ts#legacy2018AutumnNetworkOracle":oracle29,"tests/fixtures/legacy-2018-autumn-lte-oracle.ts#legacy2018AutumnLteOracle":oracle30,"tests/fixtures/legacy-2018-autumn-remaining-am-oracle.ts#remainingAmOracle":oracle31,"tests/fixtures/legacy-2018-autumn-development-oracle.ts#legacy2018AutumnDevelopmentOracle":oracle32,"tests/fixtures/legacy-2018-autumn58-oracle.ts#assertAutumn58Meaning":oracle33,"tests/fixtures/legacy-2018-pending-am-oracle.ts#pendingAmOracle":oracle34,"tests/fixtures/legacy-2018-computing-oracle.ts#legacy2018ComputingOracle":oracle35,"tests/fixtures/legacy-2018-fundamental-oracle.ts#legacy2018FundamentalOracle":oracle36,"tests/fixtures/legacy-2018-system-oracle.ts#legacy2018SystemOracle":oracle37,"tests/fixtures/legacy-2018-technical-oracle.ts#legacy2018TechnicalOracle":oracle38,"tests/fixtures/legacy-2018-technical-circuit-oracle.ts#legacy2018TechnicalCircuitOracle":oracle39,"tests/fixtures/legacy-2018-technical-knowledge-oracle.ts#legacy2018TechnicalKnowledgeOracle":oracle40,"tests/fixtures/legacy-2018-network-security-oracle.ts#legacy2018NetworkSecurityOracle":oracle41,"tests/fixtures/legacy-2018-development-knowledge-oracle.ts#legacy2018DevelopmentKnowledgeOracle":oracle42,"tests/fixtures/legacy-2018-development-math-oracle.ts#legacy2018DevelopmentMathOracle":oracle43,"tests/fixtures/legacy-2018-strategy-oracle.ts#legacy2018StrategyOracle":oracle44,"tests/fixtures/legacy-2019-spring-am-oracle.ts#assertStage1SpringMeaning":oracle45,"tests/fixtures/dec-a-generator-oracle.ts#decAGeneratorOracle":oracle46,"tests/fixtures/legacy-2019-quantitative-oracle.ts#assertLegacy2019Quantitative":oracle47,"tests/fixtures/legacy-2019-autumn-computing-oracle.ts#assertLegacy2019AutumnComputing":oracle48,"tests/fixtures/legacy-2019-platform-oracle.ts#assertLegacy2019Platform":oracle49,"tests/fixtures/legacy-2019-autumn-network-oracle.ts#assertLegacy2019AutumnNetwork":oracle50,"tests/fixtures/legacy-2019-autumn-structures-oracle.ts#assertLegacy2019AutumnStructures":oracle51,"tests/fixtures/legacy-2019-algorithms-oracle.ts#assertLegacy2019Algorithms":oracle52,"tests/fixtures/legacy-2019-autumn-quality-oracle.ts#assertLegacy2019AutumnQuality":oracle53,"tests/fixtures/legacy-2019-autumn-remaining-am-oracle.ts#assertLegacy2019AutumnRemainingAm":oracle54};
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
function frameworkCheck(v:number,body:GeneratedBody){const r=framework.cases.find(r=>r.case===v)!;assert.equal(body.prompt.length,1);assert.equal(body.prompt[0].type,'paragraph');assert.equal(hash((body.prompt[0]as{text:string}).text),framework.stemSHA256);assert.equal(body.choices.length,4);const truths=body.choices.map(bs=>{assert.equal(bs.length,1);assert.equal(bs[0].type,'paragraph');const choice=r.choices.find(c=>c.textSHA256===hash((bs[0]as{text:string}).text));assert(choice);assert.equal(choice.truth,choice.category===framework.targetCategory);return choice.category===framework.targetCategory;});assert.equal(truths.filter(Boolean).length,1);assert.equal(body.correctIndex,truths.indexOf(true));assert(!/JIS|ISO|機能性|信頼性|使用性|効率性|保守性|移植性/u.test(JSON.stringify(body)));}
function check(row:typeof fixed[number],body:GeneratedBody,values:number[]){
 assert.equal(body.choices.length,4);assert.equal(new Set(body.choices.map(c=>JSON.stringify(c))).size,4,'four reviewed alternatives must remain distinct');
 if(row.oracle==='framework65')return frameworkCheck(values[0],body);
 const f=oracles[row.file+'#'+row.fn];assert(f,row.source);
 if(row.signature==='number-body-values')return f(row.canonicalNumber,body,values);
 if(row.signature==='body-values')return f(body,values);
 if(row.fn==='pendingAmOracle'&&['2018h30a-fe-am-66','2018h30a-fe-am-69'].includes(row.source)){const profile=row.source.endsWith('-66')?'legacy-2018-autumn-procurement-flow':'legacy-2018-autumn-customer-migration-table';return f(row.source,body,values,renderToStaticMarkup(React.createElement(Legacy2018PendingAmFigures,{profile,values})));}
 if(row.fn==='assertLegacy2019AutumnComputing'&&row.source==='2019r01a-fe-am-22')return f(row.source,body,values,legacy2019AutumnCircuit(values[0]));
 return f(row.source,body,values);
}
test('all467 released AM producers retain independently reviewed all-choice meanings and every finite input',async()=>{
 const bundle=readDistributionBundle(),defs=await makeLegacyMorningRegistry({...bundle,bindCore:bindQuestion});
 const templates=bundle.templates.filter(t=>fixed.some(r=>t.generatorRef.id==='generator-source-'+r.source));
 assert.equal(fixed.length,467);assert.equal(new Set(fixed.map(r=>r.source)).size,467);assert.equal(templates.length,467);
 assert.deepEqual(defs.map(d=>d.source).sort(),fixed.map(r=>r.source).sort());
 let accepted=0,rejected=0,negative=0;const books=new Map<string,number>();
 for(const row of fixed){const d=defs.find(d=>d.source===row.source)!;books.set(row.source.replace(/-\d+$/,''),(books.get(row.source.replace(/-\d+$/,''))??0)+1);
  function walk(v:number[]){if(v.length<d.fields.length){const f=d.fields[v.length];for(let n=f.minimum;n<=f.maximum;n++)walk([...v,n]);return;}
   let b:GeneratedBody;try{b=d.build(v);}catch(e){assert((e as Error).message==='PARAMETER_CONSTRAINT'||(e as {code?:string}).code==='PARAMETER_CONSTRAINT',row.source+' '+v);rejected++;return;}
   check(row,b,v);accepted++;const wrong=structuredClone(b);wrong.correctIndex=(b.correctIndex!+1)%4;assert.throws(()=>check(row,wrong,v),row.source+' answer '+v);negative++;
  }walk([]);
  const reference=d.build(d.reference);for(let i=0;i<4;i++){const bad=structuredClone(reference);bad.choices[i]=structuredClone(bad.choices[(i+1)%4]);assert.throws(()=>check(row,bad,d.reference),row.source+' choice '+i);negative++;}
 }
 assert.deepEqual(Object.fromEntries([...books].sort()),{'2017h29a-fe-am':79,'2017h29h-fe-am':78,'2018h30a-fe-am':78,'2018h30h-fe-am':77,'2019h31h-fe-am':77,'2019r01a-fe-am':78});
 assert.deepEqual({accepted,rejected,negative},{accepted:5702,rejected:1354,negative:7570});
});
