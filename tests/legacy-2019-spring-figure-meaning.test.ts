import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import meanings from '../scripts/source-evidence/2019-spring-figure-meaning.json';
import profiles from '../src/core/generators/legacy-2019-spring-profiles.json';
import {sourceFigureDomains,sourceFigureAlt} from '../src/core/source-figures';
import {spring2019ExistingBank} from '../src/core/generators/legacy-2019-spring-pm-existing';
import {spring2019Pm9Figure} from '../src/core/generators/legacy-2019-spring-pm9-model';
import {spring2019Pm11Figure} from '../src/core/generators/legacy-2019-spring-pm11-model';
import {spring2019Pm12Figure} from '../src/core/generators/legacy-2019-spring-pm12-model';
import {spring2019Pm13Figure} from '../src/core/generators/legacy-2019-spring-pm13-model';
const text=fs.readFileSync(new URL('../scripts/generation-reference.ts',import.meta.url),'utf8');
const source=ts.createSourceFile('generation-reference.ts',text,ts.ScriptTarget.Latest,true);
function mappingExpression(){let result:ts.ObjectLiteralExpression|undefined;function visit(n:ts.Node){if(ts.isVariableDeclaration(n)&&n.name.getText(source)==='figureMeaning'&&n.initializer&&ts.isObjectLiteralExpression(n.initializer))result=n.initializer;ts.forEachChild(n,visit);}visit(source);assert.ok(result);return result;}
const positions=(s:string)=>[...new Set([...s.matchAll(/([0-9]+)：/g)].map(m=>Number(m[1])))].sort((a,b)=>a-b);
test('S205 figure meanings cover exactly all51 registered profiles and every actual value position',()=>{
 assert.equal(profiles.length,51);assert.deepEqual(Object.keys(meanings).sort(),[...profiles].sort());
 for(const name of profiles){const value=(meanings as Record<string,string>)[name];assert.equal(typeof value,'string');assert.ok(value.length>30,name);assert.ok(sourceFigureDomains[name],name);assert.deepEqual(positions(value),sourceFigureDomains[name].map((_,i)=>i),name);}
});
test('S205 mapping is imported and spread once without overriding existing literal or imported mappings',()=>{
 const imports=source.statements.filter(ts.isImportDeclaration).filter(n=>ts.isStringLiteral(n.moduleSpecifier)&&n.moduleSpecifier.text==='./source-evidence/2019-spring-figure-meaning.json');assert.equal(imports.length,1);assert.equal(imports[0].importClause?.name?.text,'spring2019FigureMeaning');
 const map=mappingExpression();const spreads=map.properties.filter(ts.isSpreadAssignment).filter(n=>n.expression.getText(source)==='spring2019FigureMeaning');assert.equal(spreads.length,1);
 for(const prop of map.properties){if(ts.isPropertyAssignment(prop)){const name=prop.name.getText(source).replace(/^["']|["']$/g,'');assert.ok(!Object.hasOwn(meanings,name),'duplicate '+name);}}
 const relative=new URL('../scripts/',import.meta.url);for(const n of source.statements.filter(ts.isImportDeclaration)){if(!ts.isStringLiteral(n.moduleSpecifier)||!n.moduleSpecifier.text.startsWith('./source-evidence/')||!n.moduleSpecifier.text.endsWith('figure-meaning.json')||n.moduleSpecifier.text.includes('2019-spring'))continue;const old=JSON.parse(fs.readFileSync(new URL(n.moduleSpecifier.text,relative),'utf8'));assert.ok(Object.keys(old).every(k=>!Object.hasOwn(meanings,k)));}
});
test('S205 position descriptions distinguish real model selectors, fixed references and original-only source0',()=>{
 // QS52図1: the two identifiers have different roles and fixed widths/order.
 const record='legacy-2019-ranking-record-layout';
 assert.match(sourceFigureAlt(record,[0]),/塾生番号6桁，校舎番号2桁/);
 assert.match(meanings[record],/塾生番号6桁→校舎番号2桁→国語\/数学\/英語\/理科\/社会各3桁（計23桁）/);
 assert.doesNotMatch(meanings[record],/校舎コード|受験者番号/);
 // Original QS26/27/29 and QS37/38 bank groups; existing model/data unchanged.
 assert.match(meanings['legacy-2019-spring-pm5-bank'],/原6\/6\/7\/5択/);
 assert.match(meanings['legacy-2019-spring-pm7-bank'],/原3\/5\/4\/4\/4\/4択/);
 for(const [number,domains,counts]of [[5,[2,2],[6,6,7,5]],[7,[9,3],[3,5,4,4,4,4]]]as const)
  for(let a=0;a<domains[0];a++)for(let b=0;b<domains[1];b++)for(let group=0;group<counts.length;group++)
   assert.equal(spring2019ExistingBank(`legacy-2019-spring-pm${number}-bank`,[a,b,group]).entries.length,counts[group]);

 const q9='legacy-2019-spring-pm9-';assert.equal(spring2019Pm9Figure(q9+'example',[0,0]).kind,'example');assert.equal(spring2019Pm9Figure(q9+'program',[0,1]).kind,'program');assert.equal(spring2019Pm9Figure(q9+'character-reference',[0]).kind,'characters');assert.throws(()=>spring2019Pm9Figure(q9+'character-reference',[1]));
 const p11='legacy-2019-spring-pm11-';for(let i=0;i<6;i++)assert.equal(spring2019Pm11Figure(p11+'program',[2,3,i]).kind,'program');assert.throws(()=>spring2019Pm11Figure(p11+'program',[2,3,6]));assert.equal(spring2019Pm11Figure(p11+'history',[2,3,0]).kind,'history');
 const p12='legacy-2019-spring-pm12-';const v=spring2019Pm12Figure(p12+'region',[2,1,0]);assert.equal(v.kind,'region');if(v.kind==='region')assert.deepEqual([v.position,v.length,v.firstIndex,v.lastIndex],[44,24,12,3]);for(let i=0;i<3;i++)assert.equal(spring2019Pm12Figure(p12+'program',[2,1,i]).kind,'program');assert.throws(()=>spring2019Pm12Figure(p12+'program',[2,1,3]));
 const p13='legacy-2019-spring-pm13-';const original=spring2019Pm13Figure(p13+'product',[0,0]);assert.equal(original.sheets.kind,'partial-source');assert.equal(original.sheets.productCount,223);for(let i=1;i<=16;i++){const regular=spring2019Pm13Figure(p13+'product',[i,0]);assert.equal(regular.sheets.kind,'complete-synthetic');assert.equal(regular.sheets.productCount,531);}
 assert.match(meanings[p13+'product' as keyof typeof meanings],/531・最終行533/);assert.match(meanings[p13+'product' as keyof typeof meanings],/223・225/);
});
