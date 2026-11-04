import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireCI, partSpec, sha, canonical, testArguments } from './plan.mjs';
function relativeFile(file, root) { return path.relative(root, file.startsWith('file:') ? fileURLToPath(file) : file).split(path.sep).join('/'); }
export function validateEvents(plan, part, events, exitCode, root = process.cwd()) {
    const spec = partSpec(plan, part);
    requireCI(exitCode === 0, 'test process exit');
    requireCI(!events.some(e => e.type === 'test:fail' || e.data?.skip || e.data?.todo || e.data?.cancelled), 'no contradictory raw failure, skip, todo or cancellation events');
    const summaries = events.filter(e => e.type === 'test:summary'), final = summaries.filter(e => !e.data.file);
    requireCI(final.length === 1, 'one complete global summary');
    for (const { data: s } of summaries)
        requireCI(s.success === true && s.counts.failed === 0 && s.counts.cancelled === 0 && s.counts.skipped === 0 && s.counts.todo === 0, 'failed/cancelled/skipped/todo summary');
    requireCI(spec.expectedCount > 0 && final[0].data.counts.tests === spec.expectedCount && final[0].data.counts.passed === spec.expectedCount, 'exact nonzero case count');
    /** @type {Array<{file:string, name:string, nesting:number}>} */
    const rawCases = events.filter(e => e.type === 'test:pass' && e.data.file && e.data.details?.type === 'test').map(e => ({ file: relativeFile(e.data.file, root), name: e.data.name, nesting: e.data.nesting })).filter(c => c.name !== c.file && c.name !== path.basename(c.file) && !path.isAbsolute(c.name));
    const cases = rawCases.map(observed => {
        const matches = spec.files.filter(file => spec.expectedDeclarations?.[file]?.[observed.name] === observed.file ||
            !spec.expectedDeclarations?.[file] && file === observed.file);
        requireCI(matches.length === 1, 'one exact planned entry and declaration for each raw callback');
        return { ...observed, file: matches[0], declarationFile: observed.file };
    });
    requireCI(cases.length === spec.expectedCount, 'actual cases rather than file-wrapper passes');
    requireCI(cases.every(c => spec.files.includes(c.file)), 'only planned files');
    requireCI(new Set(cases.map(c => canonical(c))).size === cases.length, 'unique actual case identities');
    const observed = [...new Set(cases.map(c => c.file))].sort();
    requireCI(canonical(observed) === canonical(spec.files), 'every planned file executed tests');
    for (const file of spec.files) {
        const actual = cases.filter(c => c.file === file);
        requireCI(actual.length === spec.expectedByFile[file], 'exact per-file case coverage ' + file);
        if (spec.expectedNames?.[file])
            requireCI(canonical(actual.map(c => c.name).sort()) === canonical([...spec.expectedNames[file]].sort()), 'exact reviewed callback identities ' + file);
    }
    const diagnostics = events.filter(e => e.type === 'test:diagnostic').map(e => e.data.message);
    for (const message of spec.requiredDiagnostics ?? [])
        requireCI(diagnostics.filter(m => m === message).length === 1, 'complete domain/input/route/history work witness');
    return { part, passed: cases.length, cases, summary: final[0].data, diagnostics };
}
export function aggregate(plan, reports) {
    requireCI(reports.length === plan.parts.length, 'all planned parts required');
    const seen = new Set();
    for (const report of reports) {
        requireCI(plan.parts.includes(report.part) && !seen.has(report.part), 'distinct planned parts');
        seen.add(report.part);
        requireCI(report.planSHA256 === sha(canonical(plan)) && report.commit === plan.commit && report.runId === plan.runId && report.attempt === plan.attempt, 'same plan/commit/run/attempt');
        const spec = partSpec(plan, report.part);
        requireCI(typeof report.witness === 'string' && canonical(report.argv) === canonical(testArguments(report.root, spec, report.witness)), 'exact actual test argv without unplanned filters or hooks');
        const proof = validateEvents(plan, report.part, report.events, report.exitCode, report.root);
        requireCI(canonical(proof) === canonical(report.proof), 'independently recomputed result proof');
    }
    const cases = reports.flatMap(r => r.proof.cases);
    requireCI(cases.length === plan.expectedCount, 'complete selected case count');
    requireCI(new Set(cases.map(c => canonical(c))).size === cases.length, 'no duplicate actual cases across jobs');
    const files = [...new Set(cases.map(c => c.file))].sort();
    requireCI(canonical(files) === canonical(plan.selectedFiles), 'complete selected recursive file coverage');
    if (plan.profile === 'full')
        requireCI(canonical(files) === canonical(plan.files) && cases.length === plan.fullTestCount, 'full plan means every manifest case and file');
    return { profile: plan.profile, ...(plan.features ? { features: plan.features } : {}), scopes: plan.scopes, commit: plan.commit, runId: plan.runId, attempt: plan.attempt, passed: cases.length, totalManifestCases: plan.fullTestCount, parts: plan.parts, files: files.length, totalManifestFiles: plan.files.length, planSHA256: sha(canonical(plan)), status: 'pass' };
}
export function readEvents(file) { requireCI(fs.existsSync(file), 'missing reporter witness'); const lines = fs.readFileSync(file, 'utf8').trim().split('\n'); requireCI(lines.length > 0, 'nonempty reporter witness'); return lines.map(l => JSON.parse(l)); }
