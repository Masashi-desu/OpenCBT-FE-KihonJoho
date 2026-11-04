import crypto from 'node:crypto';
import ts from 'typescript';

const directoryPattern = /^explanations\/[a-z][a-z0-9-]{2,79}\/$/;
const supportPattern = /^(?:scripts\/(?:prepare-[a-z0-9-]+-explanation\.ts|update-[a-z0-9-]+-manifest\.mjs|verify-[a-z0-9-]+-browser\.(?:ts|mjs))|tests\/helpers\/detail-[a-z0-9-]+\.(?:ts|mjs))$/;
const sorted = v => Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, value]) => [k, sorted(value)])) : v;
const equal = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
const hash = v => crypto.createHash('sha256').update(JSON.stringify(sorted(v))).digest('hex');
const omit = (v, keys) => Object.fromEntries(Object.entries(v).filter(([key]) => !keys.includes(key)));
const json = bytes => bytes ? JSON.parse(bytes.toString()) : null;
const requireDetail = (ok, message) => { if (!ok) throw Error(message); };

export function validDetailTest(entry) {
    const d = entry?.detail;
    return !!d && equal(Object.keys(d).sort(), ['packages', 'supportFiles']) && Array.isArray(d.packages) &&
        d.packages.every(p => directoryPattern.test(p)) && new Set(d.packages).size === d.packages.length &&
        Array.isArray(d.supportFiles) && d.supportFiles.every(p => supportPattern.test(p)) &&
        new Set(d.supportFiles).size === d.supportFiles.length && (d.packages.length > 0 || d.supportFiles.length === 0);
}
function detailRef(ref) {
    if (ref === undefined) return true;
    return ref && directoryPattern.test(ref.directory) && Number.isSafeInteger(ref.revision) && ref.revision > 0 &&
        Object.keys(ref).every(k => ['directory', 'revision', 'initialParameters'].includes(k)) &&
        (ref.initialParameters === undefined || ref.initialParameters && !Array.isArray(ref.initialParameters) &&
            Object.keys(ref.initialParameters).length <= 32 && Object.values(ref.initialParameters).every(v => typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number' && Number.isFinite(v)));
}
function reference(ref, revisions, idKey) {
    const revision = revisions.get(ref[idKey]);
    if (!revision) return ref;
    requireDetail(ref.revision === revision.after, 'updated reference must use the exact current revision');
    return { ...ref, revision: revision.before };
}
function metadataQuestion(before, after, revisions) {
    requireDetail(after.revision === before.revision + 1, 'question revision must advance once');
    requireDetail(detailRef(before.detailedExplanationRef) && detailRef(after.detailedExplanationRef), 'valid optional detail reference');
    requireDetail(after.origin.changes.length >= before.origin.changes.length && equal(after.origin.changes.slice(0, before.origin.changes.length), before.origin.changes), 'retained provenance');
    for (const change of after.origin.changes.slice(before.origin.changes.length))
        requireDetail(change.kind === 'layout' && change.affectsAnswer === false && Object.keys(change).every(k => ['at', 'actorId', 'kind', 'summary', 'details', 'affectsAnswer'].includes(k)), 'reference-only provenance');
    const normalized = structuredClone(after);
    normalized.revision = before.revision;
    delete normalized.detailedExplanationRef;
    normalized.origin.changes = before.origin.changes;
    normalized.origin.derivedFrom = after.origin.derivedFrom.map(ref => reference(ref, revisions, 'questionId'));
    requireDetail(typeof after.review.notes === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(after.review.checkedOn), 'review metadata');
    normalized.review.notes = before.review.notes;
    normalized.review.checkedOn = before.review.checkedOn;
    requireDetail(equal(normalized, omit(before, ['detailedExplanationRef'])), 'question content, answers and generation inputs must be unchanged');
}

// Navigation changes accompanying a new lesson must remain literal data. No
// imports, calls, computed keys or executable hooks enter this narrow profile.
function literalNavigation(bytes) {
    if (!bytes) return false;
    const file = ts.createSourceFile('navigation.mjs', bytes.toString(), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    if (file.parseDiagnostics.length || file.statements.length !== 1) return false;
    const statement = file.statements[0];
    if (!ts.isVariableStatement(statement) || statement.modifiers?.length !== 1 || statement.modifiers[0].kind !== ts.SyntaxKind.ExportKeyword ||
        !(statement.declarationList.flags & ts.NodeFlags.Const) || statement.declarationList.declarations.length !== 1) return false;
    const declaration = statement.declarationList.declarations[0];
    const literal = node => ts.isStringLiteral(node) || ts.isArrayLiteralExpression(node) && node.elements.every(literal) ||
        ts.isObjectLiteralExpression(node) && node.properties.every(p => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && literal(p.initializer));
    return ts.isIdentifier(declaration.name) && declaration.name.text === 'sidebar' && declaration.initializer && literal(declaration.initializer);
}

function preservationFixture(before, after, beforeOwnership, afterOwnership, questionRevisions, templateRevisions) {
    requireDetail(before && after && before.rows.length === after.rows.length, 'preservation inventory retained');
    const expected = structuredClone(before);
    const changedSources = new Set();
    for (const row of expected.rows) {
        const revision = templateRevisions.get(row.template.id);
        if (!revision) continue;
        const oldTemplate = beforeOwnership.entries.get(row.template.id).record, nextTemplate = afterOwnership.entries.get(row.template.id).record;
        requireDetail(row.template.contentSha256 === hash(oldTemplate), 'prior template witness');
        row.template.revision = nextTemplate.revision; row.template.contentSha256 = hash(nextTemplate);
        const oldBase = beforeOwnership.entries.get(row.base.id).record, nextBase = afterOwnership.entries.get(row.base.id).record;
        requireDetail(row.base.contentSha256 === hash(oldBase), 'prior base witness');
        row.base.revision = nextBase.revision; row.base.contentSha256 = hash(nextBase);
        for (const original of row.originals) if (questionRevisions.has(original.ref.questionId)) {
            const old = beforeOwnership.entries.get(original.ref.questionId).record, next = afterOwnership.entries.get(original.ref.questionId).record;
            requireDetail(original.contentSha256 === hash(old), 'prior original witness');
            original.ref.revision = next.revision; original.contentSha256 = hash(next);
        }
        changedSources.add(nextTemplate.generatorRef.id.replace(/^generator-source-/, ''));
    }
    const audit = after.source.appliedMainCandidateUpdates, previous = before.source.appliedMainCandidateUpdates;
    requireDetail(audit.length >= previous.length && equal(audit.slice(0, previous.length), previous), 'retained preservation audit');
    for (const entry of audit.slice(previous.length)) requireDetail(Array.isArray(entry.rows) && entry.rows.length && entry.rows.every(s => changedSources.has(s)) && equal(entry.roots, []), 'audit cannot replace generator witnesses');
    expected.source.appliedMainCandidateUpdates = audit;
    requireDetail(equal(expected, after), 'only corresponding record hashes/revisions change; all generator and other witnesses retained');
}

/** A closed change proof, not a filename-only exemption. Failure deliberately
 * returns to the existing booklet/full selector and its dependency expansion. */
export function classifyDetailChanges({ changed, beforeOwnership: before, afterOwnership: after, beforeTestEntries, testEntries, readBefore, readAfter }) {
    try {
        const directories = new Set(), questionRevisions = new Map(), templateRevisions = new Map(), changedQuestions = [];
        const catalogFields = c => omit(c, ['revision', 'files']);
        requireDetail(equal(catalogFields(before.catalog), catalogFields(after.catalog)), 'catalog semantics retained');
        requireDetail(equal([...before.entries.keys()].sort(), [...after.entries.keys()].sort()), 'no distribution additions or removals');
        const differences = [...before.entries].filter(([id, entry]) => !equal(entry, after.entries.get(id)));
        for (const [id, entry] of differences) {
            const next = after.entries.get(id);
            requireDetail(entry.kind === next.kind && ['questions', 'templates', 'sets'].includes(entry.kind), 'no material, exam, source or rights changes');
            if (entry.kind === 'questions') questionRevisions.set(id, { before: entry.record.revision, after: next.record.revision });
            if (entry.kind === 'templates') templateRevisions.set(id, { before: entry.record.revision, after: next.record.revision });
        }
        for (const [id, entry] of differences.filter(([, entry]) => entry.kind === 'questions')) {
            const old = entry.record, next = after.entries.get(id).record;
            metadataQuestion(old, next, questionRevisions);
            const linked = !equal(old.origin.derivedFrom, next.origin.derivedFrom);
            requireDetail(!equal(old.detailedExplanationRef, next.detailedExplanationRef) || linked, 'revision changes must follow detail references');
            for (const q of [old, next]) if (q.detailedExplanationRef) directories.add(q.detailedExplanationRef.directory);
            changedQuestions.push(id);
        }
        for (const [id, entry] of differences.filter(([, entry]) => entry.kind === 'templates')) {
            const old = entry.record, next = after.entries.get(id).record, normalized = structuredClone(next);
            requireDetail(next.revision === old.revision + 1 && questionRevisions.has(next.baseQuestionRef.questionId), 'template follows changed base');
            requireDetail(old.originalContentSha256 === hash(before.entries.get(old.baseQuestionRef.questionId).record) && next.originalContentSha256 === hash(after.entries.get(next.baseQuestionRef.questionId).record), 'exact base hashes');
            normalized.revision = old.revision; normalized.baseQuestionRef = reference(next.baseQuestionRef, questionRevisions, 'questionId'); normalized.originalContentSha256 = old.originalContentSha256;
            requireDetail(equal(normalized, old), 'generator, domain and reference parameters unchanged');
        }
        for (const [id, entry] of differences.filter(([, entry]) => entry.kind === 'sets')) {
            const old = entry.record, next = after.entries.get(id).record, normalized = structuredClone(next);
            requireDetail(next.revision === old.revision + 1, 'set revision follows references');
            normalized.revision = old.revision;
            normalized.questionRefs = next.questionRefs.map(ref => reference(ref, questionRevisions, 'questionId'));
            normalized.generationBindings = next.generationBindings.map(binding => ({ ...binding, questionRef: reference(binding.questionRef, questionRevisions, 'questionId'), templateRef: reference(binding.templateRef, templateRevisions, 'id') }));
            requireDetail(equal(normalized, old) && !equal(omit(next, ['revision']), omit(old, ['revision'])), 'set members, order, rules and bindings unchanged');
        }
        const registered = new Set([...before.entries.values(), ...after.entries.values()].flatMap(e => e.kind === 'questions' && e.record.detailedExplanationRef ? [e.record.detailedExplanationRef.directory] : []));
        const detailEntries = Object.entries(testEntries).filter(([, e]) => validDetailTest(e));
        const packs = new Set([before, after].flatMap(o => Object.values(o.catalog.files).flatMap(files => files.map(f => 'public/data/' + f.path))));
        const packageFiles = directory => {
            const files = new Set(['public/' + directory + 'manifest.json']);
            for (const read of [readBefore, readAfter]) {
                const manifest = json(read('public/' + directory + 'manifest.json'));
                if (!manifest) continue;
                requireDetail(manifest.apiVersion === 1 && Array.isArray(manifest.files), 'registered package manifest');
                for (const file of manifest.files) {
                    requireDetail(/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+$/.test(file.path) && !file.path.split('/').some(p => p === '.' || p === '..'), 'package-relative file');
                    files.add('public/' + directory + file.path);
                }
            }
            return files;
        };
        for (const file of changed) {
            if (file === 'public/data/catalog.json' || packs.has(file) || file === 'scripts/ci/public-test-manifest.json') continue;
            if (/^(?:README\.md|AGENTS\.md|NOTICE\.md)$|^docs\/.*\.md$|^\.agents\/skills\/.*\.md$/.test(file)) continue;
            if (file === 'docs/.vitepress/navigation.mjs') { requireDetail(literalNavigation(readBefore(file)) && literalNavigation(readAfter(file)), 'navigation remains literal data'); continue; }
            if (file === 'tests/fixtures/generator-composition-existing.json') {
                preservationFixture(json(readBefore(file)), json(readAfter(file)), before, after, questionRevisions, templateRevisions); continue;
            }
            const packagePath = /^public\/(explanations\/[a-z][a-z0-9-]{2,79}\/)/.exec(file);
            if (packagePath) {
                const directory = packagePath[1];
                requireDetail(registered.has(directory) && packageFiles(directory).has(file), 'only declared, referenced package resources');
                directories.add(directory); continue;
            }
            const matching = detailEntries.filter(([test, e]) => test === file || e.detail.supportFiles.includes(file));
            requireDetail(matching.length > 0 && readAfter(file), 'only registered detail tests and support files');
            matching.forEach(([, e]) => e.detail.packages.forEach(p => directories.add(p)));
        }
        requireDetail(directories.size > 0, 'at least one affected detail package');
        for (const directory of directories) requireDetail(registered.has(directory) && detailEntries.some(([, e]) => e.detail.packages.includes(directory)), 'every affected package has registered content tests');
        // A detail change cannot reassign, delete or silently alter unrelated
        // test ownership. New tests must be explicit detail tests in this diff.
        for (const file of new Set([...Object.keys(beforeTestEntries), ...Object.keys(testEntries)])) {
            const old = beforeTestEntries[file], next = testEntries[file];
            if (equal(old, next)) continue;
            requireDetail(next && validDetailTest(next) && changed.includes(file) && (!old || equal(old.detail, next.detail) && equal(old.scopes, next.scopes)), 'retained test ownership');
            requireDetail(next.detail.packages.length === 0 || next.detail.packages.some(p => directories.has(p)), 'only affected detail test metadata');
        }
        return { profile: 'details', scopes: [], changed, unknown: [], reasons: ['proved detail resources/reference metadata only; question/generator/session behavior retained'], changedRecords: differences.map(([id, e]) => ({ id, kind: e.kind, change: 'modified', scopes: [...after.owners.get(id)] })), detailDirectories: [...directories].sort(), detailQuestionIds: changedQuestions.sort() };
    } catch { return null; }
}
