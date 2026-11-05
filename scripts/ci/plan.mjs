import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { RECORD_KINDS, distributionOwnership, classifyScopedChanges, appendOnlyExtensionScopes, EXTENSION_DECLARATIONS, expandOwnedDependencies, sourceInventoryAppendScopes, SCOPED_DISPLAYS, inertDisplaySource, scopedDisplayImports } from './scopes.mjs';
import { validScope } from './booklet-scope.mjs';
import { successfulBaseEvidence } from './base-evidence.mjs';
import { runtimeDependencyGraph } from './runtime-dependencies.mjs';
import { callbackDeclarations } from './callback-locations.mjs';
import { classifyDetailChanges, validDetailTest } from './detail-changes.mjs';
import { classifyFeatureChanges, validFeatureTest, STORAGE_RUNTIME } from './feature-changes.mjs';
export const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export const blob = bytes => crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
export const canonical = value => JSON.stringify(value);
export function requireCI(condition, message) { if (!condition)
    throw Error('CI_VERIFICATION: ' + message); }
export function safePath(p) { requireCI(typeof p === 'string' && !path.isAbsolute(p) && !p.includes('\\') && p.split('/').every(x => x && x !== '.' && x !== '..'), 'relative input path'); return p; }
function git(...args) { return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }); }
function readAt(commit, name) { try {
    return commit ? execFileSync('git', ['show', commit + ':' + safePath(name)], { maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }) : fs.readFileSync(name);
}
catch {
    return null;
} }
function runtimeImports(inputs, commit) {
    const sources = Object.fromEntries(Object.keys(inputs).filter(p => /^src\/.*\.(?:ts|tsx|mjs)$/.test(p)).map(file => [file, readAt(commit, file)?.toString() ?? '']));
    const pkg = JSON.parse(readAt(commit, 'package.json').toString());
    return runtimeDependencyGraph(sources, inputs, Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }));
}
export function discoverTests(root = 'tests') {
    const out = [];
    function visit(dir) { for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        requireCI(!item.isSymbolicLink(), 'no test symlinks');
        const name = path.posix.join(dir, item.name);
        if (item.isDirectory())
            visit(name);
        else if (item.isFile() && name.endsWith('.test.ts'))
            out.push(name);
    } }
    visit(root);
    return out.sort();
}
/** @param {{commit:string,event?:any,eventName?:string,localBase?:string,isAncestor:(a:string,b:string)=>boolean}} options */
export function trustedBase({ commit, event, eventName, localBase = undefined, isAncestor }) {
    if (eventName === 'push') {
        const before = event?.before;
        if (event?.ref === 'refs/heads/main' && event.after === commit && /^[a-f0-9]{40}$/.test(before ?? '') && !/^0+$/.test(before) && before !== commit && isAncestor(before, commit))
            return { commit: before, trusted: true, reason: 'push event before is a complete ancestor of the checked-out after' };
        return { commit: null, trusted: false, reason: 'missing, initial, foreign or non-ancestor push comparison' };
    }
    if (!eventName && localBase && /^[a-f0-9]{40}$/.test(localBase) && isAncestor(localBase, commit))
        return { commit: localBase, trusted: true, reason: 'explicit local ancestor; not a GitHub publication authority' };
    return { commit: null, trusted: false, reason: eventName === 'workflow_dispatch' ? 'manual workflow requests all tests' : 'no trusted push comparison' };
}
function ownershipAt(commit) {
    const catalogBytes = readAt(commit, 'public/data/catalog.json');
    requireCI(catalogBytes, 'distribution catalogue at comparison boundary');
    const catalog = JSON.parse(catalogBytes.toString('utf8')), records = {};
    requireCI(canonical(Object.keys(catalog.files).sort()) === canonical([...RECORD_KINDS].sort()), 'all distribution record kinds');
    for (const kind of RECORD_KINDS) {
        records[kind] = [];
        for (const file of catalog.files[kind]) {
            safePath(file.path);
            requireCI(file.path.startsWith(kind + '/'), 'record pack kind');
            const bytes = readAt(commit, 'public/data/' + file.path);
            requireCI(bytes && sha(bytes) === file.sha256, 'actual catalogue pack hash ' + file.path);
            const parsed = JSON.parse(bytes.toString('utf8'));
            const rows = Array.isArray(parsed) ? parsed : [parsed];
            requireCI(rows.length === (file.recordCount ?? 1), 'actual pack record count');
            records[kind].push(...rows);
        }
    }
    return distributionOwnership(catalog, records);
}
function loadManifest(file) { const result = JSON.parse(fs.readFileSync(file, 'utf8')); requireCI(result.version === 2 && result.files && typeof result.files === 'object' && !Array.isArray(result.files), 'test manifest v2'); return result.files; }
export function mergeFeatureManifest(publicEntries, privateManifest, githubActions = false) {
    requireCI(!githubActions, 'private preparation test manifest must never be published');
    requireCI(privateManifest.version === 2 && privateManifest.files, 'feature-only test manifest v2');
    const entries = { ...publicEntries };
    for (const [file, entry] of Object.entries(privateManifest.files)) {
        requireCI(!entries[file], 'public/private test inventories are disjoint');
        entries[file] = entry;
    }
    for (const [file, override] of Object.entries(privateManifest.bookletWorkOverrides ?? {})) {
        requireCI(/^tests\/booklets\/[^/]+\/[a-z-]+\.test\.ts$/.test(file) && entries[file] && override && !Array.isArray(override) && Object.keys(override).length > 0 && Object.keys(override).every(key => ['coverage', 'diagnostics', 'names'].includes(key)), 'explicit feature-only work/name metadata override without count or ownership changes');
        entries[file] = { ...entries[file], ...override };
    }
    return entries;
}
export function validateTestManifest(files, entries) {
    requireCI(canonical(Object.keys(entries).sort()) === canonical(files), 'exact recursive test inventory: no missing, stale or extra manifest entries');
    for (const [file, e] of Object.entries(entries)) {
        safePath(file);
        requireCI(Number.isSafeInteger(e.count) && e.count > 0 && Array.isArray(e.scopes) && e.scopes.every(validScope) && new Set(e.scopes).size === e.scopes.length, 'nonempty test count and explicit scope ownership ' + file);
        if (e.detail !== undefined)
            requireCI(validDetailTest(e), 'explicit detail packages and restricted support-file ownership ' + file);
        if (e.features !== undefined || e.runtime !== undefined)
            requireCI(validFeatureTest(e), 'explicit feature and browser-runtime ownership ' + file);
        if (e.diagnostics)
            requireCI(Array.isArray(e.diagnostics) && e.diagnostics.every(d => typeof d === 'string' && d.length) && new Set(e.diagnostics).size === e.diagnostics.length, 'explicit unique work diagnostics ' + file);
        if (e.names)
            requireCI(Array.isArray(e.names) && e.names.length === e.count && new Set(e.names).size === e.names.length && e.names.every(n => typeof n === 'string' && n.length), 'explicit unique case names ' + file);
    }
}
/** @param {{profile?: string, detailDirectories?: string[]}} [options] */
export function makeParts(files, entries, selectedScopes, full = false, options = {}) {
    const { profile, detailDirectories = [] } = options;
    const details = !full && profile === 'details';
    const features = !full && profile === 'features';
    const selectedDetail = f => validDetailTest(entries[f]) && (!entries[f].detail.packages.length || entries[f].detail.packages.some(p => detailDirectories.includes(p)));
    const selectedFeature = f => validFeatureTest(entries[f]) && entries[f].features.some(id => options.features.includes(id));
    const wanted = full ? files : features ? files.filter(f => selectedFeature(f) || detailDirectories.length && selectedDetail(f)) : details ? files.filter(selectedDetail) : files.filter(f => entries[f].scopes.some(s => selectedScopes.includes(s)) || !entries[f].scopes.length && (!entries[f].features || entries[f].features.includes('verification'))), parts = {};
    for (const file of wanted) {
        const wrapper = /^tests\/booklets\/([^/]+)\/[^/]+\.test\.ts$/.exec(file), part = entries[file].runtime === 'chromium' ? 'browser-storage' : features ? entries[file].features?.includes('storage') ? 'feature-storage' : validDetailTest(entries[file]) && entries[file].detail.packages.length ? 'details' : 'common' : details ? entries[file].detail.packages.length ? 'details' : 'common' : wrapper ? 'booklet-' + wrapper[1] : entries[file].scopes.length ? 'related' : 'common';
        (parts[part] ??= []).push(file);
    }
    requireCI(parts.common?.length > 0, 'nonempty shared contract tests');
    if (details)
        requireCI(detailDirectories.length > 0 && detailDirectories.every(p => wanted.some(f => entries[f].detail.packages.includes(p))), 'content tests for every changed detail package');
    if (features) {
        requireCI(options.features?.length && options.features.every(id => wanted.some(f => entries[f].features?.includes(id))), 'tests for every selected feature');
        if (options.features.includes('storage')) requireCI(parts['browser-storage']?.length, 'native IndexedDB coverage cannot be omitted');
        requireCI(detailDirectories.every(p => wanted.some(f => entries[f].detail?.packages.includes(p))), 'content tests for mixed feature/detail changes');
    }
    return Object.fromEntries(Object.entries(parts).sort(([a], [b]) => a.localeCompare(b)).map(([part, names]) => [part, { files: names.sort(), expectedByFile: Object.fromEntries(names.map(f => [f, entries[f].count])), expectedNames: Object.fromEntries(names.filter(f => entries[f].names).map(f => [f, entries[f].names])), expectedDeclarations: Object.fromEntries(names.map(f => [f, callbackDeclarations(f, entries[f].names)]).filter(([, declarations]) => declarations)), expectedCount: names.reduce((n, f) => n + entries[f].count, 0), requiredDiagnostics: names.flatMap(f => entries[f].diagnostics ?? []), coverage: Object.fromEntries(names.filter(f => entries[f].coverage).map(f => [f, entries[f].coverage])), filters: [] }]));
}
function manifestDeltaAllowed(beforeBytes, afterBytes, beforeFiles, afterFiles, changed, scopes) {
    if (!beforeBytes || !afterBytes)
        return false;
    const a = JSON.parse(beforeBytes.toString()).files, b = JSON.parse(afterBytes.toString()).files;
    for (const file of new Set([...Object.keys(a), ...Object.keys(b)])) {
        if (canonical(a[file]) === canonical(b[file]))
            continue;
        if (!b[file] || !changed.includes(file) || !b[file].scopes?.length || b[file].scopes.some(s => !scopes.includes(s)))
            return false;
        if (a[file] && canonical(a[file].scopes) !== canonical(b[file].scopes))
            return false;
    }
    return true;
}
export function createPlan({ forceFull = false, baseCommit, bookletScope = null, combineParts = false } = {}) {
    const commit = git('rev-parse', 'HEAD').trim();
    if (process.env.GITHUB_SHA)
        requireCI(commit === process.env.GITHUB_SHA, 'workflow checkout commit');
    let event = null;
    if (process.env.GITHUB_EVENT_PATH)
        event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const base = trustedBase({ commit, event, eventName: process.env.GITHUB_EVENT_NAME, localBase: baseCommit, isAncestor: (a, b) => { try {
            git('merge-base', '--is-ancestor', a, b);
            return true;
        }
        catch {
            return false;
        } } });
    if (process.env.GITHUB_EVENT_NAME === 'push' && base.trusted) {
        const proofPath = 'output/ci/base-evidence.json';
        let proof = null;
        try {
            proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
        }
        catch { }
        if (successfulBaseEvidence(proof, { commit: base.commit, runId: process.env.GITHUB_RUN_ID, repository: process.env.GITHUB_REPOSITORY })) {
            base.successfulWorkflow = proof.run;
            base.evidenceSHA256 = sha(canonical(proof));
        }
        else {
            base.commit = null;
            base.trusted = false;
            base.reason = 'previous main commit has no verified successful latest Pages workflow; full verification required';
        }
    }
    const current = {}, modes = {};
    for (const name of new Set(git('ls-files', '-c', '-o', '--exclude-standard', '-z').split('\0').filter(Boolean))) {
        safePath(name);
        const stat = fs.lstatSync(name, { throwIfNoEntry: false });
        if (!stat)
            continue;
        requireCI(stat.isFile() && !stat.isSymbolicLink(), 'regular input ' + name);
        current[name] = blob(fs.readFileSync(name));
        modes[name] = stat.mode & 0o111 ? '100755' : '100644';
    }
    const actual = Object.fromEntries(Object.entries(current).map(([p, h]) => [p, modes[p] + ':' + h])), baseline = {};
    if (base.trusted)
        for (const row of git('ls-tree', '-rz', '--full-tree', base.commit).split('\0').filter(Boolean)) {
            const [header, name] = row.split('\t'), [mode, type, hash] = header.split(' ');
            safePath(name);
            requireCI(type === 'blob' && ['100644', '100755'].includes(mode), 'regular comparison input');
            baseline[name] = mode + ':' + hash;
        }
    const changed = [...new Set([...Object.keys(baseline), ...Object.keys(actual)])].filter(p => baseline[p] !== actual[p]).sort();
    const files = discoverTests(), manifestPath = 'scripts/ci/public-test-manifest.json', privatePath = 'scripts/ci/private-test-manifest.json', workspaceKind = fs.existsSync(privatePath) ? 'feature-private' : 'public';
    let entries = loadManifest(manifestPath);
    if (workspaceKind === 'feature-private') {
        entries = mergeFeatureManifest(entries, JSON.parse(fs.readFileSync(privatePath, 'utf8')), Boolean(process.env.GITHUB_ACTIONS));
    }
    validateTestManifest(files, entries);
    requireCI(files.every(f => current[f]), 'all discovered tests are versioned inputs');
    const after = ownershipAt(null), before = base.trusted ? ownershipAt(base.commit) : after;
    const extensionScopes = Object.fromEntries(Object.keys(EXTENSION_DECLARATIONS).filter(p => changed.includes(p)).map(p => [p, appendOnlyExtensionScopes(readAt(base.commit, p)?.toString(), readAt(null, p)?.toString(), p)]));
    if (changed.includes('scripts/source-inventory-extensions.json'))
        extensionScopes['scripts/source-inventory-extensions.json'] = sourceInventoryAppendScopes(readAt(base.commit, 'scripts/source-inventory-extensions.json')?.toString(), readAt(null, 'scripts/source-inventory-extensions.json')?.toString());
    const manifests = changed.filter(p => p === manifestPath || p === privatePath), initialChanged = changed.filter(p => !manifests.includes(p));
    const scopedDisplays = base.trusted && !forceFull ? Object.entries(SCOPED_DISPLAYS)
        .filter(([file, owner]) => changed.includes(file) && !changed.includes(owner.host) &&
            inertDisplaySource(file, readAt(base.commit, file)) && inertDisplaySource(file, readAt(null, file)))
        .map(([file]) => file) : [];
    let selected = classifyScopedChanges({ changed: initialChanged, beforeOwnership: before, afterOwnership: after, testEntries: entries, extensionScopes, scopedDisplays, forceFull: forceFull || !base.trusted });
    if (base.trusted && !forceFull && workspaceKind === 'public') {
        const detail = classifyDetailChanges({ changed, beforeOwnership: before, afterOwnership: after,
            beforeTestEntries: JSON.parse(readAt(base.commit, manifestPath).toString()).files, testEntries: entries,
            readBefore: file => readAt(base.commit, file), readAfter: file => readAt(null, file) });
        if (detail) selected = detail;
        const feature = classifyFeatureChanges({ changed, beforeOwnership: before, afterOwnership: after,
            beforeTestEntries: JSON.parse(readAt(base.commit, manifestPath).toString()).files, testEntries: entries,
            readBefore: file => readAt(base.commit, file), readAfter: file => readAt(null, file) });
        if (feature) selected = feature;
    }
    for (const file of manifests)
        if (!['details', 'features'].includes(selected.profile) && !manifestDeltaAllowed(readAt(base.commit, file), readAt(null, file), baseline, actual, changed, selected.scopes)) {
            selected.profile = 'full';
            selected.scopes = after.scopes;
            selected.unknown.push(file);
            selected.reasons.push('test manifest ownership/count changes require complete verification');
        }
    if (selected.profile !== 'full') {
        const carriers = ['src/core/generators/effective-public.ts', 'src/core/generators/legacy-afternoon-definitions.ts', 'src/core/generators/legacy-morning-managed.ts', ...Object.keys(EXTENSION_DECLARATIONS)];
        const sourceChanges = changed.filter(p => !Object.hasOwn(EXTENSION_DECLARATIONS, p) && !(selected.profile === 'features' && [...STORAGE_RUNTIME, 'package.json', 'package-lock.json'].includes(p)));
        const oldImports = base.trusted ? runtimeImports(baseline, base.commit) : { graph: {}, unresolved: [] }, newImports = runtimeImports(actual, null), oldGraph = oldImports.graph, newGraph = newImports.graph, graph = {};
        for (const file of new Set([...Object.keys(oldGraph), ...Object.keys(newGraph)]))
            graph[file] = [...new Set([...(oldGraph[file] ?? []), ...(newGraph[file] ?? [])])];
        const displayUnknown = [];
        for (const file of scopedDisplays) {
            const { host } = SCOPED_DISPLAYS[file];
            if (scopedDisplayImports(file, oldGraph) && scopedDisplayImports(file, newGraph))
                graph[host] = graph[host].filter(dependency => dependency !== file);
            else
                displayUnknown.push('unproven display module boundary: ' + file);
        }
        const affected = expandOwnedDependencies(sourceChanges, graph, after.scopes, carriers);
        if (selected.profile === 'features')
            for (const [consumer, dependencies] of Object.entries(graph))
                if (dependencies.some(p => STORAGE_RUNTIME.includes(p)) && ![...STORAGE_RUNTIME, 'src/ui/App.tsx'].includes(consumer))
                    affected.unknown.push('unproven storage consumer boundary: ' + consumer);
        affected.unknown.push(...oldImports.unresolved, ...newImports.unresolved, ...displayUnknown);
        affected.virtualArtifacts = {before: oldImports.virtualDependencies ?? [], after: newImports.virtualDependencies ?? []};
        selected.scopes = [...new Set([...selected.scopes, ...affected.scopes])].sort();
        selected.reverseDependencies = affected;
        if (affected.unknown.length || ['details', 'features'].includes(selected.profile) && affected.scopes.length) {
            selected.profile = 'full';
            selected.scopes = after.scopes;
            selected.unknown.push(...affected.unknown);
            selected.reasons.push('unowned reverse runtime dependency or detail support consumed by application code');
        }
    }
    selected.changed = changed;
    if (bookletScope !== null) {
        requireCI(!process.env.GITHUB_ACTIONS && validScope(bookletScope) && after.scopes.includes(bookletScope), 'manual booklet scope exists and is local only');
        selected = { ...selected, profile: 'booklets', scopes: [bookletScope], reasons: ['explicit local subset; not a release verification plan'] };
    }
    let partSpecs = makeParts(files, entries, selected.scopes, selected.profile === 'full', selected);
    const selectedFiles = Object.values(partSpecs).flatMap(s => s.files).sort();
    if (combineParts) {
        const specs = Object.values(partSpecs);
        partSpecs = { local: { files: selectedFiles, expectedByFile: Object.assign({}, ...specs.map(s => s.expectedByFile)), expectedNames: Object.assign({}, ...specs.map(s => s.expectedNames)), expectedDeclarations: Object.assign({}, ...specs.map(s => s.expectedDeclarations)), expectedCount: specs.reduce((n, s) => n + s.expectedCount, 0), requiredDiagnostics: specs.flatMap(s => s.requiredDiagnostics ?? []), coverage: Object.assign({}, ...specs.map(s => s.coverage)), filters: [] } };
    }
    return { version: 2, commit, runId: process.env.GITHUB_RUN_ID ?? 'local', attempt: process.env.GITHUB_RUN_ATTEMPT ?? '1', workspaceKind, forceFullRequested: forceFull, bookletScope, combineParts, ...selected, baselineCommit: base.commit, baseSelection: base, inputsSHA256: sha(canonical(Object.entries(actual).sort(([a], [b]) => a.localeCompare(b)))), testFilesSHA256: sha(canonical(files.map(p => [p, sha(fs.readFileSync(p))]))), manifestSHA256: sha(canonical(entries)), parts: Object.keys(partSpecs), partSpecs, files, selectedFiles, expectedCount: Object.values(partSpecs).reduce((n, s) => n + s.expectedCount, 0), fullTestCount: Object.values(entries).reduce((n, e) => n + e.count, 0) };
}
export function partSpec(plan, part) { requireCI(plan.version === 2 && plan.parts.includes(part) && plan.partSpecs[part], 'unknown or unnecessary test part ' + part); return plan.partSpecs[part]; }
export function testArguments(root, spec, witness) { return ['--import', 'tsx', '--test', '--test-reporter=' + path.resolve(root, 'scripts/ci/reporter.mjs'), '--test-reporter-destination=' + witness, '--test-reporter=spec', '--test-reporter-destination=stdout', ...spec.filters, ...spec.files]; }
export function assertSamePlan(plan) { const actual = createPlan({ forceFull: plan.forceFullRequested, baseCommit: plan.baselineCommit, bookletScope: plan.bookletScope, combineParts: plan.combineParts }); requireCI(canonical(actual) === canonical(plan), 'fresh checkout/plan/input equality'); return actual; }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const output = process.argv[2], baseArg = process.argv.find(a => a.startsWith('--base='));
    requireCI(output && !output.startsWith('--'), 'plan output path');
    const plan = createPlan({ forceFull: process.argv.includes('--full'), baseCommit: baseArg?.slice(7) });
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(plan, null, 2) + '\n');
    if (process.env.GITHUB_OUTPUT)
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `matrix=${JSON.stringify({ part: plan.parts })}\nprofile=${plan.profile}\n`);
    console.log(`${plan.profile}: ${(plan.features ?? plan.scopes).join(', ') || 'shared contracts'}; ${plan.selectedFiles.length}/${plan.files.length} files, ${plan.expectedCount}/${plan.fullTestCount} cases; ${plan.unknown.length} shared or unknown changes`);
}
