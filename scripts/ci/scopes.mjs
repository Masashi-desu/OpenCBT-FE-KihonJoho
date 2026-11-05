import ts from 'typescript';
import { scopeFamily, scopeForQuestion, validScope } from './booklet-scope.mjs';
export const RECORD_KINDS = ['questions', 'templates', 'sets', 'exams', 'sources', 'rights', 'assets'];
const stable = value => JSON.stringify(value);
const strings = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
const add = (target, values) => { const before = target.size; for (const v of values)
    target.add(v); return target.size !== before; };

// A display module can be owned by a family only behind a reviewed host gate.
// Changes to the host or to the module's import boundary use the normal plan.
export const SCOPED_DISPLAYS = {
    'src/ui/SubjectBProgram.tsx': {
        family: 'b',
        host: 'src/ui/Content.tsx',
        imports: ['src/ui/ContentText.tsx'],
        specifiers: ['./ContentText'],
    },
};
function inertInitializer(node) {
    if (!node) return false;
    if (ts.isStringLiteral(node) || ts.isRegularExpressionLiteral(node) || ts.isNumericLiteral(node) ||
        ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return true;
    if (ts.isArrayLiteralExpression(node)) return node.elements.every(inertInitializer);
    if (ts.isObjectLiteralExpression(node)) return node.properties.every(p =>
        ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && inertInitializer(p.initializer));
    return false;
}
export function inertDisplaySource(file, bytes) {
    const owner = SCOPED_DISPLAYS[file];
    if (!owner || !bytes) return false;
    const source = ts.createSourceFile(file, bytes.toString(), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    return !source.parseDiagnostics.length && source.statements.every(s =>
        ts.isImportDeclaration(s) && s.importClause && ts.isStringLiteral(s.moduleSpecifier) && owner.specifiers.includes(s.moduleSpecifier.text) ||
        ts.isFunctionDeclaration(s) || ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s) ||
        ts.isVariableStatement(s) && Boolean(s.declarationList.flags & ts.NodeFlags.Const) &&
        s.declarationList.declarations.every(d => ts.isIdentifier(d.name) && inertInitializer(d.initializer)));
}
export function scopedDisplayImports(file, imports) {
    const owner = SCOPED_DISPLAYS[file];
    return owner && stable(imports[file]) === stable(owner.imports) &&
        stable(Object.keys(imports).filter(consumer => imports[consumer].includes(file))) === stable([owner.host]);
}
/** Infer only a narrowing that is justified by an explicit year/term/section.
 * Year-wide legacy modules intentionally select both terms and both sections. */
export function scopesForOwnedPath(file, available) {
    const wrapper = /^tests\/booklets\/([^/]+)\/random-bindings\.test\.ts$/.exec(file);
    if (wrapper)
        return validScope(wrapper[1]) ? [wrapper[1]] : [];
    const nativeUI = /Legacy(20\d{2})(Spring|Autumn)(Am|Pm|Afternoon)/.exec(file);
    const year = /(?:legacy-|stage[123]-|stage-|spring-|autumn-)(20\d{2})(?:[-.]|$)/.exec(file)?.[1] ?? nativeUI?.[1];
    if (year) {
        const term = /autumn|Autumn/.test(file) ? 'autumn' : /spring|Spring/.test(file) ? 'spring' : file.includes('special') ? 'special' : null;
        const section = /(?:^|-)am(?:[-.]|$)|-morning|-fundamentals/.test(file) || nativeUI?.[3] === 'Am' ? 'am' : /(?:^|-)pm\d*(?:[-.]|$)|-afternoon/.test(file) || nativeUI ? 'pm' : null;
        return available.filter(scope => scope.startsWith(year + '-') && (!term || scope.includes('-' + term + '-')) && (!section || scope.endsWith('-' + section)));
    }
    if (/april/.test(file))
        return available.filter(s => s === '2022-april-b');
    if (/december/.test(file))
        return available.filter(s => s.startsWith('2022-december-') && (!/-a(?:[-.]|$)/.test(file) || s.endsWith('-a')));
    return [];
}
/** Catalogue pack order/packing does not define test ownership. Actual logical
 * records do. Shared rights, sources and assets inherit every consuming scope. */
export function distributionOwnership(catalog, records) {
    const entries = new Map(), owners = new Map(), questionScopes = new Map();
    for (const kind of RECORD_KINDS)
        for (const record of records[kind] ?? []) {
            if (!record || typeof record.id !== 'string' || entries.has(record.id))
                throw Error('CI_SCOPE duplicate/invalid distribution ID');
            entries.set(record.id, { kind, record });
            owners.set(record.id, new Set());
        }
    for (const q of records.questions ?? []) {
        const scope = scopeForQuestion(q);
        if (!scope)
            throw Error('CI_SCOPE unknown question ownership: ' + q.id);
        owners.get(q.id).add(scope);
        questionScopes.set(q.id, scope);
    }
    for (const t of records.templates ?? []) {
        const scope = questionScopes.get(t.baseQuestionRef?.questionId);
        if (!scope)
            throw Error('CI_SCOPE missing template base ownership: ' + t.id);
        owners.get(t.id).add(scope);
    }
    // Sets and exams are consumers, so derive their own scopes from questions
    // before propagating consumer ownership into shared material metadata.
    for (const s of records.sets ?? [])
        for (const ref of s.questionRefs ?? []) {
            const scope = questionScopes.get(ref.questionId);
            if (!scope)
                throw Error('CI_SCOPE missing set question: ' + s.id);
            owners.get(s.id).add(scope);
        }
    for (const e of records.exams ?? []) {
        for (const s of records.sets ?? []) {
            if (e.id === s.id.replace(/^set-/, 'exam-') + '-' + e.mode || e.id === s.id.replace(/^set-annual-/, 'exam-') + '-' + e.mode)
                add(owners.get(e.id), owners.get(s.id));
        }
    }
    const refs = new Map([...entries].map(([id, { record }]) => [id, [...new Set(strings(record))].filter(v => v !== id && entries.has(v))]));
    let changed = true;
    while (changed) {
        changed = false;
        for (const [id, dependencies] of refs)
            for (const dep of dependencies)
                if (['assets', 'rights', 'sources'].includes(entries.get(dep).kind))
                    changed = add(owners.get(dep), owners.get(id)) || changed;
    }
    const assets = new Map();
    for (const asset of records.assets ?? []) {
        const file = 'public/data/' + asset.path;
        if (!assets.has(file))
            assets.set(file, new Set());
        add(assets.get(file), owners.get(asset.id));
    }
    return { entries, owners, assets, scopes: [...new Set(questionScopes.values())].sort(), catalog };
}
export function compareDistribution(before, after) {
    const scopes = new Set(), changedRecords = [], unknown = [];
    const catalogFields = value => Object.fromEntries(Object.entries(value).filter(([k]) => !['revision', 'files'].includes(k)));
    if (stable(catalogFields(before.catalog)) !== stable(catalogFields(after.catalog)))
        unknown.push('public/data/catalog.json: non-pack metadata changed');
    for (const id of new Set([...before.entries.keys(), ...after.entries.keys()])) {
        const a = before.entries.get(id), b = after.entries.get(id);
        if (stable(a) === stable(b))
            continue;
        const appendScopes = a?.kind === 'sets' && b?.kind === 'sets' ? appendedSetScopes(a.record, b.record, after) : null;
        const owned = new Set(appendScopes ?? [...(before.owners.get(id) ?? []), ...(after.owners.get(id) ?? [])]);
        if (!owned.size || a && b && a.kind !== b.kind)
            unknown.push('unowned distribution record: ' + id);
        else
            add(scopes, owned);
        changedRecords.push({ id, kind: b?.kind ?? a?.kind, scopes: [...owned].sort(), change: a ? b ? 'modified' : 'deleted' : 'added' });
    }
    return { scopes: [...scopes].sort(), changedRecords, unknown };
}
/** A logical pool append retains every previous reference/binding and other
 * field. Global pool-contract tests still execute; only new families require
 * repeated exhaustive generation work. Any edit/reorder/removal widens again. */
export function appendedSetScopes(before, after, ownership) {
    const fields = r => Object.fromEntries(Object.entries(r).filter(([k]) => !['revision', 'questionRefs', 'generationBindings'].includes(k)));
    if (stable(fields(before)) !== stable(fields(after)) || after.revision !== before.revision + 1)
        return null;
    const a = before.questionRefs, b = after.questionRefs;
    if (!Array.isArray(a) || !Array.isArray(b) || b.length <= a.length || stable(b.slice(0, a.length)) !== stable(a) || new Set(b.map(stable)).size !== b.length)
        return null;
    const added = b.slice(a.length), addedIDs = new Set(added.map(ref => ref.questionId));
    const oldBindings = before.generationBindings, bindings = after.generationBindings;
    if (oldBindings !== undefined || bindings !== undefined) {
        if (!Array.isArray(oldBindings) || !Array.isArray(bindings) || bindings.length - oldBindings.length !== added.length || stable(bindings.slice(0, oldBindings.length)) !== stable(oldBindings))
            return null;
        if (bindings.slice(oldBindings.length).some(binding => !addedIDs.has(binding.questionRef?.questionId)))
            return null;
    }
    const scopes = new Set();
    for (const ref of added) {
        const owned = ownership.owners.get(ref.questionId);
        if (!owned?.size)
            return null;
        add(scopes, owned);
    }
    return [...scopes].sort();
}
export const EXTENSION_DECLARATIONS = {
    'src/core/generators/afternoon-booklet-extensions.ts': { type: 'AfternoonBookletExtension', contract: './afternoon-booklet-extension-contract', variable: 'bookletExtensions', property: 'definitions', module: /^(legacy-(20\d{2})-(spring|autumn|special)-afternoon)$/ },
    'src/core/booklet-figure-extensions.ts': { type: 'BookletFigureExtension', contract: './booklet-figure-extension-contract', variable: 'bookletFigureExtensions', property: 'figures', module: /^(generators\/legacy-(20\d{2})-(spring|autumn|special)-pm-figures)$/ },
    'src/ui/booklet-figure-renderers.ts': { type: 'BookletFigureRendererExtension', contract: './booklet-figure-renderer-contract', variable: 'bookletFigureRenderers', property: 'renderers', module: /^(Legacy(20\d{2})(Spring|Autumn|Special)PmFigures)$/ },
};
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function parseBookletExtensions(text, file = 'src/core/generators/afternoon-booklet-extensions.ts') {
    const config = EXTENSION_DECLARATIONS[file];
    if (!config || typeof text !== 'string')
        return null;
    text = text.replace(/\/\/[^\r\n]*/g, '');
    const type = new RegExp(`import\\s+type\\s*\\{\\s*${config.type}\\s*\\}\\s*from\\s*['"]${escapeRegex(config.contract)}['"]\\s*;`, 'g');
    if ([...text.matchAll(type)].length !== 1)
        return null;
    let rest = text.replace(type, '');
    const imports = new Map();
    const statement = /import\s*\{\s*([A-Za-z_$][\w$]*)\s*\}\s*from\s*['"]\.\/([^'"]+)['"]\s*;/g;
    for (const m of rest.matchAll(statement)) {
        const owned = config.module.exec(m[2]);
        if (!owned || imports.has(m[1]))
            return null;
        imports.set(m[1], { module: m[2], scope: `${owned[2]}-${owned[3].toLowerCase()}-pm` });
    }
    rest = rest.replace(statement, '');
    const declaration = new RegExp(`^\\s*export\\s+const\\s+${config.variable}\\s*:\\s*readonly\\s+${config.type}\\[\\]\\s*=\\s*\\[([\\s\\S]*)\\]\\s*;\\s*$`).exec(rest);
    if (!declaration)
        return null;
    const entries = [], body = declaration[1], row = new RegExp(`\\{\\s*scope\\s*:\\s*['"]([^'"]+)['"]\\s*,\\s*${config.property}\\s*:\\s*([A-Za-z_$][\\w$]*)\\s*\\}`, 'g');
    for (const m of body.matchAll(row)) {
        const imported = imports.get(m[2]);
        if (!imported || imported.scope !== m[1] || entries.some(e => e.scope === m[1]))
            return null;
        entries.push({ scope: m[1], symbol: m[2], module: imported.module });
    }
    if (body.replace(row, '').replaceAll(',', '').trim() || imports.size !== entries.length)
        return null;
    if (entries.length && !/^\s*\{[\s\S]*\}\s*,?\s*$/.test(body))
        return null;
    return entries;
}
export function appendOnlyExtensionScopes(beforeText, afterText, file) {
    const before = parseBookletExtensions(beforeText, file), after = parseBookletExtensions(afterText, file);
    if (!before || !after || after.length <= before.length || stable(after.slice(0, before.length)) !== stable(before))
        return null;
    return after.slice(before.length).map(e => e.scope);
}
export function sourceInventoryAppendScopes(beforeText, afterText) {
    let before, after;
    try {
        before = JSON.parse(beforeText);
        after = JSON.parse(afterText);
    }
    catch {
        return null;
    }
    const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && stable(Object.keys(value).sort()) === stable([...keys].sort());
    const valid = value => {
        if (!exact(value, ['version', 'collections']) || value.version !== 1 || !Array.isArray(value.collections))
            return false;
        const seen = new Set();
        for (const row of value.collections) {
            if (!exact(row, ['collectionId', 'excluded']) || !Array.isArray(row.excluded))
                return false;
            const m = /^(20\d{2})(?:h(\d{2})|r(\d{2}))([hat])-fe-(am|pm)$/.exec(row.collectionId);
            if (!m || Number(m[1]) < 2004 || Number(m[1]) > 2019 || Number(m[1]) !== Number(m[2] ?? m[3]) + (m[2] ? 1988 : 2018) || seen.has(row.collectionId) || m[4] === 't' && m[1] !== '2011')
                return false;
            seen.add(row.collectionId);
            const numbers = new Set(), maximum = m[5] === 'am' ? 80 : 13;
            for (const held of row.excluded) {
                if (!exact(held, ['number', 'reason', 'sourceId', 'checkedOn']) || !Number.isSafeInteger(held.number) || held.number < 1 || held.number > maximum || numbers.has(held.number) || [...numbers].some(n => n >= held.number) || typeof held.reason !== 'string' || held.reason.trim().length < 10 || held.sourceId !== `source-ipa-${row.collectionId}-qs` || typeof held.checkedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(held.checkedOn) || !Number.isFinite(Date.parse(held.checkedOn + 'T00:00:00Z')) || new Date(held.checkedOn + 'T00:00:00Z').toISOString().slice(0, 10) !== held.checkedOn)
                    return false;
                numbers.add(held.number);
            }
        }
        return true;
    };
    if (!valid(before) || !valid(after) || after.collections.length <= before.collections.length || stable(after.collections.slice(0, before.collections.length)) !== stable(before.collections))
        return null;
    return after.collections.slice(before.collections.length).map(row => { const m = /^(20\d{2})(?:h\d{2}|r\d{2})([hat])-fe-(am|pm)$/.exec(row.collectionId); return `${m[1]}-${{ h: 'spring', a: 'autumn', t: 'special' }[m[2]]}-${m[3]}`; });
}
/** Follow direct imports between owned modules. Generic runtime consumers are
 * full-scope unless they are an explicit, separately tested registry boundary. */
export function expandOwnedDependencies(changed, imports, available, carriers = []) {
    const selected = new Set(), unknown = [], visited = new Set(), queue = [...changed];
    const boundaries = new Set(carriers);
    while (queue.length) {
        const dependency = queue.shift();
        if (visited.has(dependency))
            continue;
        visited.add(dependency);
        for (const [consumer, dependencies] of Object.entries(imports)) {
            if (!dependencies.includes(dependency) || boundaries.has(consumer))
                continue;
            const owned = scopesForOwnedPath(consumer, available);
            if (!owned.length)
                unknown.push(`unowned runtime consumer ${consumer} imports ${dependency}`);
            else {
                add(selected, owned);
                queue.push(consumer);
            }
        }
    }
    return { scopes: [...selected].sort(), unknown: [...new Set(unknown)].sort() };
}
export function classifyScopedChanges({ changed, beforeOwnership, afterOwnership, testEntries, extensionScopes = {}, scopedDisplays = [], forceFull = false }) {
    const selected = new Set(), reasons = [], unknown = [];
    if (forceFull)
        reasons.push('explicit full verification or untrusted comparison base');
    const available = [...new Set([...beforeOwnership.scopes, ...afterOwnership.scopes])].sort();
    const data = compareDistribution(beforeOwnership, afterOwnership);
    add(selected, data.scopes);
    unknown.push(...data.unknown);
    const listedPacks = new Set([beforeOwnership, afterOwnership].flatMap(x => Object.values(x.catalog.files).flatMap(files => files.map(f => 'public/data/' + f.path))));
    for (const file of changed) {
        if (file === 'public/data/catalog.json' || listedPacks.has(file))
            continue;
        const assetOwners = new Set([...(beforeOwnership.assets.get(file) ?? []), ...(afterOwnership.assets.get(file) ?? [])]);
        if (assetOwners.size) {
            add(selected, assetOwners);
            continue;
        }
        // Documentation never authorizes executable or dependency changes.
        if (/^(?:README\.md|AGENTS\.md|NOTICE\.md)$|^docs\/.*\.md$|^\.agents\/skills\/.*\.md$/.test(file))
            continue;
        if ((Object.hasOwn(EXTENSION_DECLARATIONS, file) || file === 'scripts/source-inventory-extensions.json') && extensionScopes[file]?.length && extensionScopes[file].every(s => afterOwnership.scopes.includes(s))) {
            add(selected, extensionScopes[file]);
            continue;
        }
        if (testEntries[file]) {
            add(selected, testEntries[file].scopes);
            continue;
        }
        if (scopedDisplays.includes(file) && Object.hasOwn(SCOPED_DISPLAYS, file)) {
            const scopes = available.filter(scope => scopeFamily(scope) === SCOPED_DISPLAYS[file].family);
            if (scopes.length) {
                add(selected, scopes);
                continue;
            }
        }
        const owned = scopesForOwnedPath(file, available);
        if (owned.length && /^(?:src\/core\/generators\/legacy-|src\/core\/(?:spring|autumn)-|src\/ui\/(?:Legacy|legacy-)|scripts\/(?:import-legacy-|legacy-|source-evidence\/legacy-)|tests\/fixtures\/)/.test(file)) {
            add(selected, owned);
            continue;
        }
        // Changing the selector, its evidence, dependencies, Schema or a common
        // implementation cannot downgrade itself into a narrow verification.
        unknown.push(file);
    }
    if (unknown.length)
        reasons.push('shared, unknown or unowned changes require all tests');
    const profile = forceFull || unknown.length ? 'full' : selected.size ? 'booklets' : 'common';
    return { profile, scopes: profile === 'full' ? afterOwnership.scopes : [...selected].sort(), changed, unknown: [...new Set(unknown)].sort(), reasons, changedRecords: data.changedRecords };
}
