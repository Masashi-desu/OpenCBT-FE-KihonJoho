import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlan, requireCI } from './plan.mjs';
import { runPart } from './run-part.mjs';
import { aggregate } from './results.mjs';
export function runSelectedTests(args = process.argv.slice(2)) {
    const baseArg = args.find(a => a.startsWith('--base=')), bookletArg = args.find(a => !a.startsWith('--'));
    requireCI(args.every(a => a === '--full' || a.startsWith('--base=') || a === bookletArg), 'known test selection arguments');
    requireCI(!(bookletArg && baseArg), 'booklet subset and changed verification are different commands');
    const plan = createPlan({ forceFull: args.includes('--full'), baseCommit: baseArg?.slice(7), bookletScope: bookletArg, combineParts: true });
    const dir = fs.mkdtempSync(path.resolve('output', 'ci-local-'));
    fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify(plan, null, 2) + '\n');
    console.log(`Verification: ${plan.profile}; ${plan.selectedFiles.length}/${plan.files.length} files, ${plan.expectedCount}/${plan.fullTestCount} cases; ${(plan.features ?? plan.scopes).join(', ')}`);
    const report = runPart(plan, 'local', path.join(dir, 'local')), result = aggregate(plan, [report]);
    fs.writeFileSync(path.join(dir, 'aggregate.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ ...result, evidenceDirectory: dir }, null, 2));
    return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
    runSelectedTests();
