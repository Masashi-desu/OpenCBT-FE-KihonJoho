import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {requireCI,partSpec,heavyNames,sha,canonical} from './plan.mjs';
function relativeFile(file,root) {return path.relative(root,file.startsWith('file:')?fileURLToPath(file):file).split(path.sep).join('/');}
export function validateEvents(plan,part,events,exitCode,root=process.cwd()) {
  const spec=partSpec(plan,part); requireCI(exitCode===0,'test process exit');
  const summaries=events.filter(e=>e.type==='test:summary');
  const final=summaries.filter(e=>!e.data.file);requireCI(final.length===1,'one complete global summary');
  for(const {data:s} of summaries)requireCI(s.success===true&&s.counts.failed===0&&s.counts.cancelled===0&&s.counts.skipped===0&&s.counts.todo===0,'failed/cancelled/skipped/todo summary');
  requireCI(final[0].data.counts.tests===spec.expectedCount&&final[0].data.counts.passed===spec.expectedCount,'exact nonzero case count');
  const cases=events.filter(e=>e.type==='test:pass'&&e.data.file&&e.data.details?.type==='test')
    .map(e=>({file:relativeFile(e.data.file,root),name:e.data.name,nesting:e.data.nesting}))
    .filter(c=>c.name!==c.file&&c.name!==path.basename(c.file)&&!path.isAbsolute(c.name));
  requireCI(cases.length===spec.expectedCount,'actual case identities, not file-wrapper passes');
  requireCI(cases.every(c=>spec.files.includes(c.file)),'only planned files');
  const observed=[...new Set(cases.map(c=>c.file))].sort();requireCI(canonical(observed)===canonical(spec.files),'every planned file executed actual tests');
  if(part==='small'||part==='large') {
    requireCI(cases.length===1&&cases[0].name===heavyNames[part]&&cases[0].nesting===0,'one exact heavy case');
    const expected=plan.heavyDiagnostics?.[part],messages=events.filter(e=>e.type==='test:diagnostic').map(e=>e.data.message);
    requireCI(Array.isArray(expected)&&expected.length>0&&expected.every(message=>messages.filter(m=>m===message).length===1),'complete reviewed domain/input/route/history witness');
  }
  if(part==='other')requireCI(!cases.some(c=>Object.values(heavyNames).includes(c.name)),'heavy cases execute only in dedicated parts');
  if(part==='ui')for(const [file,n]of Object.entries(plan.uiTestCounts))requireCI(cases.filter(c=>c.file===file).length===n,'UI case coverage '+file);
  return {part,passed:cases.length,cases,summary:final[0].data,diagnostics:events.filter(e=>e.type==='test:diagnostic').map(e=>e.data.message)};
}
export function aggregate(plan,reports) {
  requireCI(reports.length===plan.parts.length,'all parts required');
  const seen=new Set();
  for(const report of reports){requireCI(plan.parts.includes(report.part)&&!seen.has(report.part),'distinct planned parts');seen.add(report.part);
    requireCI(report.planSHA256===sha(canonical(plan))&&report.commit===plan.commit&&report.runId===plan.runId&&report.attempt===plan.attempt,'same plan/commit/run/attempt');
    const proof=validateEvents(plan,report.part,report.events,report.exitCode,report.root);
    requireCI(canonical(proof)===canonical(report.proof),'recomputed part proof');
  }
  const cases=reports.flatMap(r=>r.proof.cases),expected=plan.profile==='ui'?Object.values(plan.uiTestCounts).reduce((a,b)=>a+b,0):plan.fullTestCount;
  requireCI(cases.length===expected,'complete aggregate case count');
  const files=[...new Set(cases.map(c=>c.file))].sort(),wanted=plan.profile==='ui'?Object.keys(plan.uiTestCounts).sort():plan.files;
  requireCI(canonical(files)===canonical(wanted),'complete aggregate file coverage');
  return {profile:plan.profile,commit:plan.commit,runId:plan.runId,attempt:plan.attempt,passed:cases.length,parts:plan.parts,files:files.length,planSHA256:sha(canonical(plan)),status:'pass'};
}
export function readEvents(file) {
  requireCI(fs.existsSync(file),'missing reporter witness');const lines=fs.readFileSync(file,'utf8').trim().split('\n');
  requireCI(lines.length>0,'nonempty reporter witness');return lines.map(line=>JSON.parse(line));
}
