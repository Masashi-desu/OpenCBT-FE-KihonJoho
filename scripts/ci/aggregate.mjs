import fs from 'node:fs';
import path from 'node:path';
import {assertSamePlan,requireCI} from './plan.mjs';
import {aggregate} from './results.mjs';
const [planFile,directory]=process.argv.slice(2);requireCI(planFile&&directory,'plan/results directory');
const plan=JSON.parse(fs.readFileSync(planFile,'utf8'));assertSamePlan(plan);
const reports=[];
function visit(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){requireCI(!item.isSymbolicLink(),'no artifact symlinks');const p=path.join(dir,item.name);if(item.isDirectory())visit(p);else if(item.name==='result.json')reports.push(JSON.parse(fs.readFileSync(p,'utf8')));}}
visit(directory);const result=aggregate(plan,reports);console.log(JSON.stringify(result,null,2));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Verification\n\nProfile: **${result.profile}**, ${result.passed} tests, ${result.parts.join(' / ')}.\n\nCommit: ${result.commit}. Baseline: ${plan.baselineCommit}.\n`);
