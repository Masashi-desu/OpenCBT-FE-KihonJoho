import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {assertSamePlan,partSpec,requireCI,sha,canonical} from './plan.mjs';
import {readEvents,validateEvents} from './results.mjs';
export function runPart(plan,part,dir) {
  requireCI(Number(process.versions.node.split('.')[0])===24,'Node.js24 required for witnessed test execution');assertSamePlan(plan);requireCI(!process.env.NODE_OPTIONS,'no inherited test filters/hooks');const spec=partSpec(plan,part);
  fs.mkdirSync(dir,{recursive:true});const witness=path.resolve(dir,'events.jsonl');
  const args=['--import','tsx','--test','--test-reporter='+path.resolve('scripts/ci/reporter.mjs'),'--test-reporter-destination='+witness,'--test-reporter=spec','--test-reporter-destination=stdout',...spec.filters,...spec.files];
  const started=Date.now(),child=spawnSync(process.execPath,args,{stdio:'inherit'}),events=readEvents(witness);
  const proof=validateEvents(plan,part,events,child.status);assertSamePlan(plan);
  const report={version:1,part,commit:plan.commit,runId:plan.runId,attempt:plan.attempt,planSHA256:sha(canonical(plan)),root:process.cwd(),argv:args,exitCode:child.status,elapsedMs:Date.now()-started,proof,events};
  fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify(report,null,2)+'\n');console.log(`${part}: ${proof.passed} actual tests passed`);return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [planFile,part,dir]=process.argv.slice(2);requireCI(planFile&&part&&dir,'plan/part/output arguments');runPart(JSON.parse(fs.readFileSync(planFile,'utf8')),part,dir);
}
