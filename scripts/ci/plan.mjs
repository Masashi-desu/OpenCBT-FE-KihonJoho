import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const BASELINE='a5d72f9f0e982b513bdf2e200f0e5412f38d5ecc';
const UI_FILES=['tests/ci-verification.test.ts','tests/legacy-afternoon-selection.test.ts','tests/menu-selection.test.ts','tests/mix-profile.test.ts','tests/source-collections.test.ts','tests/stage1-partial-release-integration.test.ts'];
export const heavyNames = {
  small: 'every small-domain binding survives every applicable issuance path and endless history, including all old afternoon inputs',
  large: 'all larger domains retain 64 seeded bindings on every issuance path and after endless history',
};
export const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export const blob = bytes => crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
export const canonical = value => JSON.stringify(value);
export function requireCI(condition, message) { if(!condition) throw Error('CI_VERIFICATION: '+message); }
export function safePath(p) { requireCI(typeof p==='string'&&!path.isAbsolute(p)&&!p.includes('\\')&&p.split('/').every(x=>x&&x!=='.'&&x!=='..'),'relative input path'); return p; }
export function classify(baseline, current, approved, forceFull=false) {
  const changed=[...new Set([...Object.keys(baseline),...Object.keys(current)])].filter(p=>baseline[p]!==current[p]).sort();
  const unknown=changed.filter(p=>p==='scripts/ci/policy.json'?false:!current[p]||approved[p]!==current[p]);
  return {profile:forceFull||unknown.length?'full':'ui',changed,unknown};
}
function git(...args) { return execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024}); }
export function createPlan({forceFull=false}={}) {
  const policy=JSON.parse(fs.readFileSync('scripts/ci/policy.json','utf8'));
  requireCI(policy.version===1&&policy.baselineCommit===BASELINE&&policy.baselineFullTestCount===2090&&Number.isSafeInteger(policy.fullTestCount)&&policy.fullTestCount>2,'policy');
  const current={}, fileModes={};
  for(const name of new Set(git('ls-files','-c','-o','--exclude-standard','-z').split('\0').filter(Boolean))) {
    safePath(name); const stat=fs.lstatSync(name,{throwIfNoEntry:false});
    if(!stat) continue; requireCI(stat.isFile()&&!stat.isSymbolicLink(),'regular tracked input '+name);
    current[name]=blob(fs.readFileSync(name));fileModes[name]=stat.mode&0o111?'100755':'100644';
  }
  const baseline={};let baselineKnown=true;
  try {
    for(const row of git('ls-tree','-rz','--full-tree',policy.baselineCommit).split('\0').filter(Boolean)) {
      const [header,name]=row.split('\t'),[mode,type,hash]=header.split(' ');safePath(name);
      requireCI(type==='blob'&&['100644','100755'].includes(mode),'baseline regular blob');
      baseline[name]=mode+':'+hash;
    }
  }catch {baselineKnown=false;}
  const actual=Object.fromEntries(Object.entries(current).map(([p,h])=>[p,fileModes[p]+':'+h]));
  const approved=Object.fromEntries(Object.entries(policy.approvedChanges).map(([p,h])=>[safePath(p),'100644:'+h]));
  const selected=classify(baseline,actual,approved,forceFull||!baselineKnown);
  // The policy cannot authorize data/runtime bytes via an arbitrary allowlist.
  const forbidden=selected.changed.filter(p=>!isReviewableUIPath(p));
  if(baselineKnown&&selected.changed.includes('package.json')) {
    const previous=JSON.parse(git('show',policy.baselineCommit+':package.json')),currentPackage=JSON.parse(fs.readFileSync('package.json','utf8'));
    delete previous.scripts;delete currentPackage.scripts;
    if(canonical(previous)!==canonical(currentPackage))forbidden.push('package.json');
  }
  if(forbidden.length){selected.profile='full';selected.unknown=[...new Set([...selected.unknown,...forbidden])].sort();}
  const files=fs.readdirSync('tests').filter(n=>n.endsWith('.test.ts')).map(n=>'tests/'+n).sort();
  requireCI(files.length>0&&files.every(p=>current[p]),'complete tracked test-file inventory');
  const uiFiles=Object.keys(policy.uiTestCounts).sort();
  requireCI(canonical(uiFiles)===canonical(UI_FILES)&&uiFiles.every(p=>files.includes(p)&&Number.isSafeInteger(policy.uiTestCounts[p])&&policy.uiTestCounts[p]>0),'nonempty UI test manifest');
  const heavy=fs.readFileSync('tests/random-bindings.test.ts','utf8');
  for(const name of Object.values(heavyNames))requireCI(heavy.split(JSON.stringify(name)).length===2,'exact heavy callback literal '+name);
  const commit=git('rev-parse','HEAD').trim();
  if(process.env.GITHUB_SHA)requireCI(commit===process.env.GITHUB_SHA,'workflow checkout commit');
  return {version:1,commit,runId:process.env.GITHUB_RUN_ID??'local',attempt:process.env.GITHUB_RUN_ATTEMPT??'1',...selected,
    baselineCommit:policy.baselineCommit,baselineEvidence:policy.baselineEvidence,
    inputsSHA256:sha(canonical(Object.entries(actual).sort(([a],[b])=>a<b?-1:a>b?1:0))),
    testFilesSHA256:sha(canonical(files.map(p=>[p,sha(fs.readFileSync(p))]))),
    parts:selected.profile==='ui'?['ui']:['other','small','large'],files,uiTestCounts:policy.uiTestCounts,fullTestCount:policy.fullTestCount,heavyDiagnostics:policy.heavyDiagnostics};
}
export function isReviewableUIPath(p) {
  return ['src/core/menu-selection.ts','src/ui/App.tsx','README.md','AGENTS.md','package.json','docs/screens.md','docs/verification.md','docs/acceptance.md','.agents/skills/fe-question-generation/SKILL.md','.github/workflows/pages.yml',
    'tests/menu-selection.test.ts','tests/mix-profile.test.ts','tests/legacy-afternoon-selection.test.ts','tests/source-collections.test.ts','tests/stage1-partial-release-integration.test.ts','tests/legacy-2019-autumn-normal-flow.test.ts'].includes(p)||/^scripts\/ci\/[a-z-]+\.(mjs|json)$/.test(p)||p==='tests/ci-verification.test.ts';
}
export function partSpec(plan, part) {
  requireCI(plan.parts.includes(part),'unknown or unnecessary part '+part);
  const escaped=Object.fromEntries(Object.entries(heavyNames).map(([k,v])=>[k,v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')]));
  if(part==='ui')return {files:Object.keys(plan.uiTestCounts).sort(),expectedCount:Object.values(plan.uiTestCounts).reduce((a,b)=>a+b,0),filters:[]};
  if(part==='other')return {files:plan.files,expectedCount:plan.fullTestCount-2,filters:[`--test-skip-pattern=^(?:${escaped.small}|${escaped.large})$`]};
  return {files:['tests/random-bindings.test.ts'],expectedCount:1,filters:[`--test-name-pattern=^${escaped[part]}$`]};
}
export function assertSamePlan(plan) {
  const actual=createPlan({forceFull:plan.profile==='full'});
  requireCI(canonical(actual)===canonical(plan),'fresh checkout/plan/input equality');return actual;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const plan=createPlan({forceFull:process.argv.includes('--full')||process.env.GITHUB_EVENT_NAME==='workflow_dispatch'});
  const output=process.argv[2];requireCI(output&&output!=='--full','plan output path');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(plan,null,2)+'\n');
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`matrix=${JSON.stringify({part:plan.parts})}\nprofile=${plan.profile}\n`);
  console.log(`${plan.profile}: ${plan.parts.join(', ')}; ${plan.changed.length} changed inputs; ${plan.unknown.length} unclassified inputs`);
}
