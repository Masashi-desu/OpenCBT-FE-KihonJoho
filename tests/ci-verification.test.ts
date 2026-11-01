import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {classify,isReviewableUIPath,partSpec,heavyNames,sha,canonical} from '../scripts/ci/plan.mjs';
import {validateEvents,aggregate,readEvents} from '../scripts/ci/results.mjs';
const root=process.cwd();
function plan(profile='ui'):any{return {version:1,profile,commit:'reviewed-test-commit',runId:'synthetic',attempt:'1',parts:profile==='ui'?['ui']:['other','small','large'],files:['tests/other.test.ts','tests/random-bindings.test.ts'],uiTestCounts:{'tests/other.test.ts':1},fullTestCount:4,heavyDiagnostics:{small:['synthetic small work witness'],large:['synthetic large work witness']}};}
function events(cases:{file:string;name:string}[]):any[]{return [...cases.map(c=>({type:'test:pass',data:{file:path.join(root,c.file),name:c.name,nesting:0,details:{type:'test'}}})),{type:'test:summary',data:{success:true,counts:{tests:cases.length,passed:cases.length,failed:0,cancelled:0,skipped:0,todo:0}}}];}
function report(p:any,part:string,cases:{file:string;name:string}[]){const es=events(cases);for(const message of p.heavyDiagnostics?.[part]??[])es.push({type:'test:diagnostic',data:{message}});return {part,commit:p.commit,runId:p.runId,attempt:p.attempt,planSHA256:sha(canonical(p)),root,exitCode:0,events:es,proof:validateEvents(p,part,es,0,root)};}

test('CI classification accepts only exact reviewed UI bytes; unknown, deleted and unreviewed inputs require full tests',()=>{
  const baseline={'src/core/menu-selection.ts':'old','src/core/session.ts':'stable'},approved={'src/core/menu-selection.ts':'new'};
  assert.equal(classify(baseline,{...baseline,'src/core/menu-selection.ts':'new'},approved).profile,'ui');
  for(const actual of [{...baseline,'src/core/menu-selection.ts':'unreviewed'},{'src/core/menu-selection.ts':'new'},{...baseline,'src/new.ts':'extra'}])assert.equal(classify(baseline,actual,approved).profile,'full');
  assert.equal(classify(baseline,baseline,approved,true).profile,'full');
});
test('UI approval cannot cover problem data, generator/session/answer logic, lockfiles or unknown test files',()=>{
  for(const p of ['public/data/catalog.json','public/data/questions/new.json','src/core/session.ts','src/core/generators/index.ts','src/core/answers.ts','package-lock.json','scripts/source-evidence/ipa-pre-2023.json','tests/unreviewed.test.ts'])assert.equal(isReviewableUIPath(p),false,p);
  assert.equal(isReviewableUIPath('src/core/menu-selection.ts'),true);
});
test('full partition covers the complete file inventory and selects only the two exact heavy callbacks separately',()=>{
  const p=plan('full');assert.deepEqual(partSpec(p,'other').files,p.files);
  for(const part of ['small','large']as const){const s=partSpec(p,part);assert.deepEqual(s.files,['tests/random-bindings.test.ts']);assert.equal(s.expectedCount,1);assert.equal(new RegExp(s.filters[0].split('=').slice(1).join('=')).test(heavyNames[part]),true);}
  assert.throws(()=>partSpec(p,'ui'));assert.throws(()=>partSpec(plan(),'small'));
});
test('part verification rejects zero/file-wrapper passes, wrong cases, nonzero exits and failed/skipped/cancelled/todo summaries',()=>{
  const p=plan(),good=events([{file:'tests/other.test.ts',name:'real assertion'}]);assert.equal(validateEvents(p,'ui',good,0).passed,1);
  assert.throws(()=>validateEvents(p,'ui',good,1));assert.throws(()=>validateEvents(p,'ui',[],0));
  const wrapper=events([{file:'tests/other.test.ts',name:path.join(root,'tests/other.test.ts')}]);assert.throws(()=>validateEvents(p,'ui',wrapper,0));
  for(const key of ['failed','skipped','cancelled','todo']){const bad=structuredClone(good);bad.at(-1).data.counts[key]=1;assert.throws(()=>validateEvents(p,'ui',bad,0));}
  const bad=structuredClone(good);bad.at(-1).data.success=false;assert.throws(()=>validateEvents(p,'ui',bad,0));
});
test('part verification checks per-file coverage, exact heavy identity and excludes heavy cases from the complement',()=>{
  const p=plan('full');assert.throws(()=>validateEvents(p,'small',events([{file:'tests/random-bindings.test.ts',name:heavyNames.small}]),0),'missing domain witness');assert.throws(()=>validateEvents(p,'small',events([{file:'tests/random-bindings.test.ts',name:'wrong callback'}]),0));
  assert.throws(()=>validateEvents(p,'other',events([{file:'tests/other.test.ts',name:'one'},{file:'tests/other.test.ts',name:'two'}]),0));
  assert.throws(()=>validateEvents(p,'other',events([{file:'tests/other.test.ts',name:'one'},{file:'tests/random-bindings.test.ts',name:heavyNames.small}]),0));
});
test('aggregation requires every distinct part from the same plan, commit, workflow run and attempt',()=>{
  const p=plan('full'),rs=[report(p,'other',[{file:'tests/other.test.ts',name:'one'},{file:'tests/random-bindings.test.ts',name:'other binding check'}]),report(p,'small',[{file:'tests/random-bindings.test.ts',name:heavyNames.small}]),report(p,'large',[{file:'tests/random-bindings.test.ts',name:heavyNames.large}])];
  assert.equal(aggregate(p,rs).passed,4);assert.throws(()=>aggregate(p,rs.slice(1)));assert.throws(()=>aggregate(p,[rs[0],rs[0],rs[2]]));
  for(const field of ['planSHA256','commit','runId','attempt']as const){const bad=structuredClone(rs);bad[0][field]='foreign';assert.throws(()=>aggregate(p,bad));}
});
test('aggregation independently recomputes event proofs and rejects substituted or missing tests',()=>{
  const p=plan(),r=report(p,'ui',[{file:'tests/other.test.ts',name:'assertion'}]);assert.equal(aggregate(p,[r]).status,'pass');
  const forged=structuredClone(r);forged.proof.passed=9;assert.throws(()=>aggregate(p,[forged]));
  const missing=structuredClone(r);missing.events.shift();assert.throws(()=>aggregate(p,[missing]));
});
test('actual Node reporter/name filtering distinguishes one executed callback from an empty selector',()=>{
  const dir=fs.mkdtempSync(path.join(root,'output','ci-protocol-'));
  try{const file=path.join(dir,'sample.test.mjs');fs.writeFileSync(file,"import test from 'node:test';import assert from 'node:assert/strict';test('selected callback',()=>assert.equal(1,1));test('other callback',()=>assert.equal(2,2));\n");
    const childEnv={...process.env};delete childEnv.NODE_TEST_CONTEXT;
    for(const [pattern,count]of [['^selected callback$',1],['^no such callback$',0]]as const){const output=path.join(dir,count?'positive.jsonl':'zero.jsonl');const child=spawnSync(process.execPath,['--test','--test-reporter='+path.join(root,'scripts/ci/reporter.mjs'),'--test-reporter-destination='+output,'--test-name-pattern='+pattern,file],{encoding:'utf8',env:childEnv});assert.equal(child.status,0);const es=readEvents(output),relative=path.relative(root,file).split(path.sep).join('/'),p={...plan(),uiTestCounts:{[relative]:1}};
      if(count)assert.equal(validateEvents(p,'ui',es,0).passed,1);else assert.throws(()=>validateEvents(p,'ui',es,0));
    }
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
