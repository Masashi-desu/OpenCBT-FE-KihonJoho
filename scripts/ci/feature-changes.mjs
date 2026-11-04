import ts from 'typescript';
import { classifyDetailChanges } from './detail-changes.mjs';

export const FEATURE_IDS = ['storage', 'verification'];
export const STORAGE_RUNTIME = ['src/core/storage.ts', 'src/core/storage-schema.ts', 'src/core/storage-snapshot.ts', 'src/core/bookmark-storage.ts'];
const storageSupport = ['scripts/storage-browser-harness.ts', 'scripts/verify-storage-browser.mjs'];
const verificationFiles = [
    'scripts/ci/aggregate.mjs', 'scripts/ci/base-evidence.mjs', 'scripts/ci/booklet-manifest.mjs', 'scripts/ci/booklet-scope.mjs',
    'scripts/ci/callback-locations.mjs', 'scripts/ci/check-changed.mjs', 'scripts/ci/detail-changes.mjs', 'scripts/ci/feature-changes.mjs',
    'scripts/ci/plan.mjs', 'scripts/ci/policy.json', 'scripts/ci/reporter.mjs', 'scripts/ci/results.mjs', 'scripts/ci/run-part.mjs',
    'scripts/ci/runtime-dependencies.mjs', 'scripts/ci/scopes.mjs', 'scripts/ci/test.mjs', '.github/workflows/pages.yml',
];
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const omit = (v, keys) => Object.fromEntries(Object.entries(v).filter(([k]) => !keys.includes(k)));
const json = bytes => bytes ? JSON.parse(bytes.toString()) : null;
const check = ok => { if (!ok) throw Error('not a closed feature change'); };
const doc = file => /^(?:README\.md|AGENTS\.md|NOTICE\.md)$|^docs\/.*\.md$|^\.agents\/skills\/.*\.md$/.test(file);

export function validFeatureTest(entry) {
    return entry?.features !== undefined && Array.isArray(entry.features) && entry.features.length > 0 &&
        entry.features.every(f => FEATURE_IDS.includes(f)) && new Set(entry.features).size === entry.features.length &&
        (entry.runtime === undefined || entry.runtime === 'chromium' && entry.features.includes('storage'));
}
function packagesUnchangedExceptBrowser(beforeBytes, afterBytes, lock = false) {
    const a = json(beforeBytes), b = json(afterBytes); check(a && b);
    if (!lock) {
        check(equal(omit(a, ['devDependencies']), omit(b, ['devDependencies'])));
        check(equal(omit(a.devDependencies, ['playwright']), omit(b.devDependencies, ['playwright'])));
        check(/^\d+\.\d+\.\d+$/.test(b.devDependencies.playwright));
        return;
    }
    check(equal(omit(a, ['packages']), omit(b, ['packages'])));
    for (const file of new Set([...Object.keys(a.packages), ...Object.keys(b.packages)])) {
        if (equal(a.packages[file], b.packages[file])) continue;
        if (file === '') {
            check(equal(omit(a.packages[file], ['devDependencies']), omit(b.packages[file], ['devDependencies'])));
            check(equal(omit(a.packages[file].devDependencies, ['playwright']), omit(b.packages[file].devDependencies, ['playwright'])));
        } else {
            check(/^node_modules\/playwright(?:-core)?(?:\/node_modules\/fsevents)?$/.test(file));
            check(b.packages[file]?.dev === true);
        }
    }
}
function publicNames(bytes, file) {
    if (!bytes) return [];
    const parsed = ts.createSourceFile(file, bytes.toString(), ts.ScriptTarget.Latest, true);
    check(parsed.parseDiagnostics.length === 0);
    return parsed.statements.filter(s => s.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)).flatMap(s => {
        if (ts.isFunctionDeclaration(s)) return JSON.stringify({ name: s.name?.text, parameters: s.parameters.map(p => p.getText(parsed).replace(/\s+/g, '')),
            returns: s.type?.getText(parsed).replace(/\s+/g, '') ?? '', generics: s.typeParameters?.map(p => p.getText(parsed)) ?? [],
            async: s.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false });
        if (ts.isVariableStatement(s)) return s.declarationList.declarations.map(d => d.name.getText(parsed));
        return s.getText(parsed);
    }).sort();
}

/** Functional ownership supplements booklet ownership. Every other runtime and
 * every distribution field must be unchanged, or independently pass the existing
 * closed detail-reference proof. Unknown/mixed semantic changes fall back. */
export function classifyFeatureChanges(args) {
    try {
        const { changed, beforeOwnership, afterOwnership, beforeTestEntries, testEntries, readBefore, readAfter } = args;
        const features = new Set(), residual = [], featureTests = new Set();
        for (const file of new Set([...Object.keys(beforeTestEntries), ...Object.keys(testEntries)])) {
            const old = beforeTestEntries[file], next = testEntries[file];
            if (old?.features !== undefined) check(validFeatureTest(old));
            if (next?.features !== undefined) { check(validFeatureTest(next)); featureTests.add(file); }
            if (equal(old, next)) continue;
            if (!next?.features) continue; // Existing detail proof validates these.
            check(changed.includes(file) || equal(omit(old ?? {}, ['features', 'runtime']), omit(next, ['features', 'runtime'])));
            if (old) {
                check(equal(old.scopes, next.scopes) && equal(old.detail, next.detail));
                check(next.count >= old.count);
                check((old.features ?? []).every(f => next.features.includes(f)));
                check(old.runtime === undefined || old.runtime === next.runtime);
            }
            next.features.forEach(f => features.add(f));
        }
        for (const file of changed) {
            if (doc(file) || file === 'scripts/ci/public-test-manifest.json') continue;
            if (STORAGE_RUNTIME.includes(file)) {
                check(readAfter(file));
                if (file !== 'src/core/storage-schema.ts') check(equal(publicNames(readBefore(file), file), publicNames(readAfter(file), file)));
                features.add('storage'); continue;
            }
            if (storageSupport.includes(file)) { check(readAfter(file)); features.add('storage'); continue; }
            if (verificationFiles.includes(file)) { check(readAfter(file)); features.add('verification'); continue; }
            if (file === 'package.json' || file === 'package-lock.json') {
                packagesUnchangedExceptBrowser(readBefore(file), readAfter(file), file.endsWith('lock.json'));
                features.add('verification'); features.add('storage'); continue;
            }
            if (featureTests.has(file)) { testEntries[file].features.forEach(f => features.add(f)); continue; }
            // Existing browser fixtures use the app's current DB version. Only
            // this exact read-version removal can accompany a storage upgrade.
            if (/^scripts\/verify-[a-z-]+-browser\.(ts|mjs)$/.test(file)) {
                const before = readBefore(file), after = readAfter(file);
                if (before && after && before.toString().replace(/indexedDB\.open\(('opencbt-fe-kihonjoho-v2'),\s*[34]\)/g, 'indexedDB.open($1)') === after.toString()) {
                    features.add('storage'); continue;
                }
            }
            residual.push(file);
        }
        check(features.size > 0);
        // Existing runtime/storage entry points cannot disappear or be silently
        // reclassified; every feature has explicit tests and browser ownership.
        for (const file of Object.keys(beforeTestEntries)) if (beforeTestEntries[file].features) check(testEntries[file]);
        for (const feature of features) check([...featureTests].some(f => testEntries[f].features.includes(feature)));
        if (features.has('storage')) check([...featureTests].some(f => testEntries[f].features.includes('storage') && testEntries[f].runtime === 'chromium'));
        features.add('verification');
        check([...featureTests].some(f => testEntries[f].features.includes('verification')));
        const featureless = entries => Object.fromEntries(Object.entries(entries).filter(([file]) => !featureTests.has(file)));
        const dataEqual = equal(beforeOwnership.catalog, afterOwnership.catalog) && equal([...beforeOwnership.entries], [...afterOwnership.entries]);
        let detail = null;
        if (residual.length || !dataEqual) {
            detail = classifyDetailChanges({ ...args, changed: [...residual, 'scripts/ci/public-test-manifest.json'],
                beforeTestEntries: featureless(beforeTestEntries), testEntries: featureless(testEntries) });
            check(detail);
        } else {
            for (const file of new Set([...Object.keys(beforeTestEntries), ...Object.keys(testEntries)]))
                if (!featureTests.has(file)) check(equal(beforeTestEntries[file], testEntries[file]));
        }
        return { profile: 'features', features: [...features].sort(), scopes: [], changed, unknown: [],
            detailDirectories: detail?.detailDirectories ?? [], changedRecords: detail?.changedRecords ?? [],
            reasons: ['closed functional ownership; unchanged content/generation/scoring contracts; native storage and verification tests required'] };
    } catch { return null; }
}
