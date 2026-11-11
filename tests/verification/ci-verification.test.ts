import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { partSpec, sha, canonical, testArguments, trustedBase, validateTestManifest, makeParts, discoverTests,mergeFeatureManifest } from '../../scripts/ci/plan.mjs';
import { validateEvents, aggregate, readEvents } from '../../scripts/ci/results.mjs';
import { successfulBaseEvidence, collectBaseEvidence } from '../../scripts/ci/base-evidence.mjs';
import { callbackDeclarations } from '../../scripts/ci/callback-locations.mjs';
const root = process.cwd(), file = 'tests/one.test.ts', name = 'one real assertion';
test('every verification job installs the locked runtime before invoking dependency-bearing scripts and deployment requires aggregation',()=>{
 const workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
 const jobs=Object.fromEntries([...workflow.matchAll(/^  (plan|tests|aggregate|build|deploy):\n([\s\S]*?)(?=^  [a-z]+:\n|$(?![\s\S]))/gm)].map(m=>[m[1],m[2]]));
 for(const job of ['plan','tests','aggregate','build']){assert(jobs[job],job);const install=jobs[job].indexOf('- run: npm ci');assert(install>=0,job+' must install its locked TypeScript/runtime dependencies');const execution=jobs[job].search(/(?:node scripts\/ci\/|npm run (?:pretest|build))/);assert(execution>install,job+' must install before verification/build execution');}
 assert.match(jobs.aggregate,/needs: \[plan, tests\]/);assert.match(jobs.aggregate,/test "\$TEST_JOB_RESULT" = success/);assert.match(jobs.deploy,/needs: \[build, aggregate\]/);
});
function plan(): any { return { version: 2, profile: 'full', scopes: ['2016-autumn-pm'], commit: 'fixed', runId: 'synthetic', attempt: '1', parts: ['common'], partSpecs: { common: { files: [file], expectedByFile: { [file]: 1 }, expectedNames: { [file]: [name] }, expectedCount: 1, filters: [] } }, files: [file], selectedFiles: [file], expectedCount: 1, fullTestCount: 1 }; }
function events(f = file, n = name): any[] { return [{ type: 'test:pass', data: { file: path.join(root, f), name: n, nesting: 0, details: { type: 'test' } } }, { type: 'test:summary', data: { success: true, counts: { tests: 1, passed: 1, failed: 0, cancelled: 0, skipped: 0, todo: 0 } } }]; }
function report(p = plan()): any { const es = events(), witness = path.join(root, 'output', 'synthetic-events.jsonl'); return { part: 'common', commit: p.commit, runId: p.runId, attempt: p.attempt, planSHA256: sha(canonical(p)), root, witness, argv: testArguments(root, p.partSpecs.common, witness), exitCode: 0, events: es, proof: validateEvents(p, 'common', es, 0) }; }
test('only an exact main push after and a nonzero complete ancestor before authorize a scoped comparison', () => {
    const commit = 'a'.repeat(40), before = 'b'.repeat(40), args = { commit, eventName: 'push', event: { ref: 'refs/heads/main', after: commit, before }, isAncestor: (a: string, b: string) => a === before && b === commit };
    assert.equal(trustedBase(args).trusted, true);
    for (const event of [{ ...args.event, ref: 'refs/heads/feat' }, { ...args.event, after: before }, { ...args.event, before: '0'.repeat(40) }, { ...args.event, before: 'bad' }, { ...args.event, before: commit }])
        assert.equal(trustedBase({ ...args, event }).trusted, false);
    assert.equal(trustedBase({ ...args, isAncestor: () => false }).trusted, false);
    assert.equal(trustedBase({ ...args, eventName: 'workflow_dispatch' }).trusted, false);
    assert.equal(trustedBase({ ...args, eventName: undefined, localBase: before }).trusted, true);
});
test('manifest inventory rejects missing, stale, duplicate ownership, zero counts and unknown scope syntax', () => {
    const entry = { count: 1, scopes: ['2016-autumn-pm'] };
    validateTestManifest([file], { [file]: entry });
    for (const entries of [{}, { [file]: entry, 'tests/stale.test.ts': entry }, { [file]: { ...entry, count: 0 } }, { [file]: { ...entry, scopes: ['wrong'] } }, { [file]: { ...entry, scopes: [...entry.scopes, ...entry.scopes] } }])
        assert.throws(() => validateTestManifest([file], entries));
});
test('common and all intersecting scopes execute once, while unrelated booklet files are omitted', () => {
    const a = 'tests/a.test.ts', b = 'tests/b.test.ts', c = 'tests/booklets/2016-autumn-pm/random-bindings.test.ts';
    const entries: any = { [file]: { count: 1, scopes: [] }, [a]: { count: 2, scopes: ['2016-autumn-pm', '2016-spring-pm'] }, [b]: { count: 3, scopes: ['2017-spring-am'] }, [c]: { count: 2, scopes: ['2016-autumn-pm'], names: ['first callback', 'second callback'] } };
    const parts = makeParts([file, a, b, c], entries, ['2016-autumn-pm']);
    assert.deepEqual(Object.keys(parts).sort(), ['booklet-2016-autumn-pm', 'common', 'related']);
    assert.deepEqual(parts.related.files, [a]);
    assert.equal(Object.values(parts).reduce((n, p) => n + p.expectedCount, 0), 5);
    assert.equal(Object.values(makeParts([file, a, b, c], entries, [], true)).reduce((n, p) => n + p.expectedCount, 0), 8);
});
test('only a requested nonempty part can be executed', () => { assert.equal(partSpec(plan(), 'common').expectedCount, 1); assert.throws(() => partSpec(plan(), 'missing')); });
test('test evidence rejects zero tests, wrappers, wrong names/files, duplicates and nonzero exits', () => {
    const p = plan(), good = events();
    assert.equal(validateEvents(p, 'common', good, 0).passed, 1);
    for (const bad of [[], events(file, path.join(root, file)), events('tests/unplanned.test.ts'), events(file, 'unreviewed callback'), [good[0], ...good]])
        assert.throws(() => validateEvents(p, 'common', bad, 0));
    assert.throws(() => validateEvents(p, 'common', good, 1));
});
test('every failed, cancelled, skipped, todo and unsuccessful summary blocks publication', () => {
    for (const key of ['failed', 'cancelled', 'skipped', 'todo']) {
        const es = events();
        es.at(-1).data.counts[key] = 1;
        assert.throws(() => validateEvents(plan(), 'common', es, 0));
    }
    const es = events();
    es.at(-1).data.success = false;
    assert.throws(() => validateEvents(plan(), 'common', es, 0));
});
test('per-file counts cannot substitute one planned file with extra cases from another', () => {
    const p = plan();
    p.partSpecs.common.files.push('tests/two.test.ts');
    p.partSpecs.common.expectedByFile['tests/two.test.ts'] = 1;
    p.partSpecs.common.expectedCount = 2;
    const es = events();
    es.splice(1, 0, { ...es[0], data: { ...es[0].data, name: 'extra' } });
    es.at(-1).data.counts.tests = 2;
    es.at(-1).data.counts.passed = 2;
    assert.throws(() => validateEvents(p, 'common', es, 0));
});
test('reviewed work diagnostics are mandatory once, not optional progress messages', () => {
    const p = plan();
    p.partSpecs.common.requiredDiagnostics = ['one complete domain/input/route/history witness'];
    const es = events();
    assert.throws(() => validateEvents(p, 'common', es, 0));
    es.push({ type: 'test:diagnostic', data: { message: p.partSpecs.common.requiredDiagnostics[0] } });
    assert.equal(validateEvents(p, 'common', es, 0).passed, 1);
    es.push(es.at(-1));
    assert.throws(() => validateEvents(p, 'common', es, 0));
});
test('aggregation requires all distinct parts from the exact same plan, commit, run and attempt', () => {
    const p = plan(), r = report(p);
    assert.equal(aggregate(p, [r]).status, 'pass');
    assert.throws(() => aggregate(p, []));
    assert.throws(() => aggregate(p, [r, r]));
    for (const key of ['planSHA256', 'commit', 'runId', 'attempt']) {
        const bad = structuredClone(r);
        bad[key] = 'foreign';
        assert.throws(() => aggregate(p, [bad]));
    }
});
test('aggregation recomputes raw event proofs and exact executable argv', () => {
    const p = plan(), r = report(p), forged = structuredClone(r);
    forged.proof.passed = 9;
    assert.throws(() => aggregate(p, [forged]));
    const bad = structuredClone(r);
    bad.argv.splice(2, 0, '--test-name-pattern=one');
    assert.throws(() => aggregate(p, [bad]));
    const missing = structuredClone(r);
    missing.events.shift();
    assert.throws(() => aggregate(p, [missing]));
});
test('recursive discovery includes nested booklet tests and rejects symlinked discovery surfaces', () => {
    const dir = fs.mkdtempSync(path.join(root, 'output', 'ci-discovery-'));
    try {
        fs.mkdirSync(path.join(dir, 'nested'));
        fs.writeFileSync(path.join(dir, 'a.test.ts'), '');
        fs.writeFileSync(path.join(dir, 'nested', 'b.test.ts'), '');
        assert.equal(discoverTests(dir).length, 2);
        fs.symlinkSync(path.join(dir, 'a.test.ts'), path.join(dir, 'copy.test.ts'));
        assert.throws(() => discoverTests(dir));
    }
    finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
test('actual reporter distinguishes a real executed assertion from an empty name selector', () => {
    const dir = fs.mkdtempSync(path.join(root, 'output', 'ci-protocol-'));
    try {
        const sample = path.join(dir, 'sample.test.mjs');
        fs.writeFileSync(sample, "import test from 'node:test';test('selected callback',()=>{});test('other callback',()=>{});\n");
        const env = { ...process.env };
        delete env.NODE_TEST_CONTEXT;
        for (const [pattern, expected] of [['^selected callback$', 1], ['^nothing$', 0]] as const) {
            const output = path.join(dir, String(expected) + '.jsonl');
            const child = spawnSync(process.execPath, ['--test', '--test-reporter=' + path.join(root, 'scripts/ci/reporter.mjs'), '--test-reporter-destination=' + output, '--test-name-pattern=' + pattern, sample], { encoding: 'utf8', env });
            assert.equal(child.status, 0);
            const p = plan(), relative = path.relative(root, sample).split(path.sep).join('/');
            p.partSpecs.common = { files: [relative], expectedCount: 1, expectedByFile: { [relative]: 1 }, expectedNames: { [relative]: ['selected callback'] }, filters: [] };
            if (expected)
                assert.equal(validateEvents(p, 'common', readEvents(output), 0).passed, 1);
            else
                assert.throws(() => validateEvents(p, 'common', readEvents(output), 0));
        }
    }
    finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
test('contradictory raw failure and skipped/todo passes are rejected even if the final summary claims success', () => {
    const p = plan();
    for (const kind of ['test:fail', 'skip', 'todo', 'cancelled']) {
        const es = events();
        if (kind === 'test:fail')
            es.splice(1, 0, { type: kind, data: { name: 'hidden failed test' } });
        else
            es[0].data[kind] = true;
        assert.throws(() => validateEvents(p, 'common', es, 0));
    }
});
test('a previous successful Pages run is bound to repository, current run and exact ancestor commit', () => {
    const context = { commit: 'a'.repeat(40), runId: '100', repository: 'owner/repo' }, proof: any = { version: 1, ...context, currentRunId: '100', before: context.commit, status: 'verified_previous_success', run: { id: 99, head_sha: context.commit, head_branch: 'main', path: '.github/workflows/pages.yml', status: 'completed', conclusion: 'success' } };
    assert.equal(successfulBaseEvidence(proof, context), true);
    for (const delta of [{ repository: 'foreign/repo' }, { currentRunId: '101' }, { before: 'b'.repeat(40) }, { status: 'unverified_full_required' }, { run: { ...proof.run, conclusion: 'failure' } }, { run: { ...proof.run, status: 'in_progress' } }, { run: { ...proof.run, path: '.github/workflows/foreign.yml' } }])
        assert.equal(successfulBaseEvidence({ ...proof, ...delta }, context), false);
});
test('actual base evidence collection chooses the latest matching workflow run and refuses failed or unavailable provenance', async () => {
    const dir = fs.mkdtempSync(path.join(root, 'output', 'ci-base-evidence-'));
    try {
        const eventPath = path.join(dir, 'event.json'), before = 'b'.repeat(40);
        fs.writeFileSync(eventPath, JSON.stringify({ ref: 'refs/heads/main', before }));
        const env: any = { GITHUB_EVENT_PATH: eventPath, GITHUB_EVENT_NAME: 'push', GITHUB_REPOSITORY: 'owner/repo', GITHUB_RUN_ID: '10', GITHUB_TOKEN: 'synthetic-readonly-test-token' };
        const row = { id: 8, head_sha: before, head_branch: 'main', path: '.github/workflows/pages.yml', status: 'completed', conclusion: 'success' };
        const request: any = async (url: string, options: any) => { assert(url.includes('head_sha=' + before)); assert.equal(options.headers.Authorization, 'Bearer synthetic-readonly-test-token'); return { ok: true, json: async () => ({ workflow_runs: [row] }) }; };
        assert.equal((await collectBaseEvidence({ env, fetcher: request })).status, 'verified_previous_success');
        const failed: any = async () => ({ ok: true, json: async () => ({ workflow_runs: [row, { ...row, id: 9, conclusion: 'failure' }] }) });
        assert.equal((await collectBaseEvidence({ env, fetcher: failed })).status, 'unverified_full_required');
        const unavailable: any = async () => ({ ok: false, status: 403 });
        assert.equal((await collectBaseEvidence({ env, fetcher: unavailable })).status, 'unverified_full_required');
    }
    finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

test('feature-only manifests cannot publish, shadow public test counts or change booklet ownership while retaining private case identities',()=>{
 const file='tests/booklets/2024-a/answer-semantics.test.ts',entries:any={[file]:{count:1,scopes:['2024-a'],names:['public-reviewed-case']}},privateManifest:any={version:2,files:{},bookletWorkOverrides:{[file]:{names:['private-reviewed-case']}}};
 const merged=mergeFeatureManifest(entries,privateManifest);assert.equal(merged[file].count,1);assert.deepEqual(merged[file].scopes,['2024-a']);assert.deepEqual(merged[file].names,['private-reviewed-case']);assert.deepEqual(entries[file].names,['public-reviewed-case']);
 assert.throws(()=>mergeFeatureManifest(entries,privateManifest,true));assert.throws(()=>mergeFeatureManifest(entries,{version:2,files:entries}));
 for(const key of ['count','scopes','sourceIds','arbitrary'])assert.throws(()=>mergeFeatureManifest(entries,{version:2,files:{},bookletWorkOverrides:{[file]:{[key]:2}}}));
});

test('booklet entrypoints bind each named callback to its exact helper declaration site', () => {
    const scope = '2017-autumn-pm', entry = `tests/booklets/${scope}/bookmarks.test.ts`;
    const names = [scope + ': annual and generated entries bookmark the same source for every included question', `bookmark paths ${scope}: every registered series retains repeats, answers and resumed history`];
    const declarations = callbackDeclarations(entry, names)!;
    assert.equal(declarations[names[0]], 'tests/helpers/booklet-bookmark-paths.ts');
    assert.equal(declarations[names[1]], 'tests/helpers/booklet-bookmark-endless-paths.ts');
    assert.throws(() => callbackDeclarations(entry, []));
    assert.throws(() => callbackDeclarations(entry, ['another scope: unrelated callback']));
    assert.throws(() => callbackDeclarations(entry, [names[0], names[0]]));
    assert.equal(callbackDeclarations(file, [name]), null);
});

test('raw helper locations require an unambiguous planned entry and retain their original declaration identity', () => {
    const p = plan(), helper = 'tests/helpers/probe.ts';
    p.partSpecs.common.expectedDeclarations = { [file]: { [name]: helper } };
    const es = events(helper);
    const saved = structuredClone(es), proof = validateEvents(p, 'common', es, 0);
    assert.equal(proof.cases[0].file, file);
    assert.equal(proof.cases[0].declarationFile, helper);
    assert.deepEqual(es, saved, 'native events cannot be rewritten into wrapper evidence');
    assert.throws(() => validateEvents(p, 'common', events('tests/helpers/other.ts'), 0));
    assert.throws(() => validateEvents(p, 'common', events(helper, 'unplanned callback'), 0));
    assert.throws(() => validateEvents(p, 'common', events(file), 0), 'a declaration mismatch cannot masquerade as a wrapper callback');
    p.partSpecs.common.files.push('tests/two.test.ts');
    p.partSpecs.common.expectedDeclarations['tests/two.test.ts'] = { [name]: helper };
    assert.throws(() => validateEvents(p, 'common', es, 0), 'ambiguous origin/name must not be assigned to either entry');
});

test('actual Node imported callbacks are verified by both entry file and unchanged helper locations', () => {
    const dir = fs.mkdtempSync(path.join(root, 'output', 'ci-imported-callback-'));
    try {
        const helper = path.join(dir, 'helper.mjs');
        fs.writeFileSync(helper, "import test from 'node:test';import assert from 'node:assert/strict';export function register(name){test(name,()=>assert.equal(2+2,4));}\n");
        const units = ['alpha', 'beta'].map(unit => {
            const entry = path.join(dir, unit + '.test.mjs');
            fs.writeFileSync(entry, `import {register} from './helper.mjs';register('${unit} callback');\n`);
            return { file: path.relative(root, entry).split(path.sep).join('/'), name: unit + ' callback', entry };
        });
        const witness = path.join(dir, 'events.jsonl'), env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
        const child = spawnSync(process.execPath, ['--test', '--test-reporter=' + path.join(root, 'scripts/ci/reporter.mjs'), '--test-reporter-destination=' + witness, ...units.map(unit => unit.entry)], { env, encoding: 'utf8' });
        assert.equal(child.status, 0, child.stderr);
        const es = readEvents(witness), p = plan(), declaration = path.relative(root, helper).split(path.sep).join('/');
        p.partSpecs.common = { files: units.map(unit => unit.file), expectedCount: 2, expectedByFile: Object.fromEntries(units.map(unit => [unit.file, 1])), expectedNames: Object.fromEntries(units.map(unit => [unit.file, [unit.name]])), expectedDeclarations: Object.fromEntries(units.map(unit => [unit.file, { [unit.name]: declaration }])), filters: [] };
        const proof = validateEvents(p, 'common', es, child.status);
        assert.deepEqual(proof.cases.map(c => c.file).sort(), units.map(unit => unit.file).sort());
        assert(proof.cases.every(c => c.declarationFile === declaration));
        const native = es.filter(e => e.type === 'test:pass' && e.data.details?.type === 'test');
        assert(native.every(e => e.data.file === helper));
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
