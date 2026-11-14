import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scopeFamily, scopeForQuestion } from '../../scripts/ci/booklet-scope.mjs';
import { distributionOwnership, compareDistribution, classifyScopedChanges, scopesForOwnedPath, parseBookletExtensions, appendOnlyExtensionScopes, EXTENSION_DECLARATIONS, expandOwnedDependencies, sourceInventoryAppendScopes, inertDisplaySource, scopedDisplayImports, AFTERNOON_SELECTION_COUNTS_FILE, afternoonSelectionCountAppendScopes, ANSWER_CHOICE_MATRIX_HOST, answerChoiceMatrixAppendScopes } from '../../scripts/ci/scopes.mjs';
import { runtimeDependencyGraph } from '../../scripts/ci/runtime-dependencies.mjs';
import { makeParts } from '../../scripts/ci/plan.mjs';
const scopes = ['2016-autumn-am', '2016-autumn-pm', '2016-spring-am', '2016-spring-pm', '2017-spring-pm', '2024-a'];
function question(id: string, year = 2016, period = '秋期', timeSlot = '午後'): any { return { id, subject: timeSlot === '午後' ? 'B' : 'A', origin: { sourceRefs: [{ sourceId: 'source-' + id, locator: { year, period, timeSlot, questionNumber: '1' } }] }, prompt: { blocks: [{ assetId: 'asset-shared' }], rightsRefs: ['rights-shared'] } }; }
function fixture(): any { const catalog = { revision: 1, files: { questions: [], templates: [], sets: [], exams: [], sources: [], rights: [], assets: [] }, generationCoverage: 'complete' }, records = { questions: [question('one'), question('two', 2017, '春期')], templates: [], sets: [], exams: [], sources: [], rights: [{ id: 'rights-shared' }], assets: [{ id: 'asset-shared', path: 'assets/shared.png' }] }; return { catalog, records }; }
function own(value = fixture()) { return distributionOwnership(value.catalog, value.records); }
function classify(changed: string[], a = own(), b = a, extras: any = {}) { return classifyScopedChanges({ changed, beforeOwnership: a, afterOwnership: b, testEntries: {}, ...extras }); }
test('source ownership distinguishes current A/B, each historical term and AM/PM, and both 2022 sample publications', () => {
    assert.equal(scopeForQuestion(question('x')), '2016-autumn-pm');
    assert.equal(scopeForQuestion(question('x', 2011, '特別', '午前')), '2011-special-am');
    const current: any = { subject: 'A', origin: { sourceRefs: [{ locator: { year: 2024, subject: '科目A', questionNumber: '1' } }] } };
    assert.equal(scopeForQuestion(current), '2024-a');
    const sample: any = { subject: 'B', origin: { sourceRefs: [{ locator: { period: '2022年4月公表 サンプル問題', subject: '科目B', questionNumber: '1' } }] } };
    assert.equal(scopeForQuestion(sample), '2022-april-b');
    sample.origin.sourceRefs[0].locator.period = '2022年12月公表 サンプル問題';
    assert.equal(scopeForQuestion(sample), '2022-december-b');
});
test('unknown, conflicting and cross-section source ownership is refused', () => {
    assert.equal(scopeForQuestion({ subject: 'A', origin: { sourceRefs: [] } }), null);
    const q = question('x');
    q.subject = 'A';
    assert.equal(scopeForQuestion(q), null);
    q.subject = 'B';
    q.origin.sourceRefs.push({ locator: { year: 2017, period: '春期', timeSlot: '午後', questionNumber: '1' } });
    assert.equal(scopeForQuestion(q), null);
    const legacy = question('mixed-label');
    legacy.origin.sourceRefs[0].locator.subject = '科目B';
    assert.equal(scopeForQuestion(legacy), null);
    assert.equal(scopeFamily('2019-b'), null);
    assert.equal(scopeFamily('2024-spring-pm'), null);
});
test('AM, PM, A and B own independent test jobs; the guarded display only selects current B', () => {
    const b = fixture();
    b.records.questions.push(
        question('old-morning', 2016, '春期', '午前'),
        { ...question('current-a'), subject: 'A', origin: { sourceRefs: [{ locator: { year: 2024, subject: '科目A', questionNumber: '1' } }] } },
        { ...question('current-b'), subject: 'B', origin: { sourceRefs: [{ locator: { year: 2024, subject: '科目B', questionNumber: '1' } }] } },
        { ...question('sample-b'), subject: 'B', origin: { sourceRefs: [{ locator: { period: '2022年12月公表 サンプル問題', subject: '科目B', questionNumber: '1' } }] } },
    );
    const owned = own(b);
    assert.deepEqual([...new Set(owned.scopes.map(scopeFamily))].sort(), ['a', 'am', 'b', 'pm']);
    const common = 'tests/contract.test.ts';
    const entries = {
        [common]: { count: 1, scopes: [] },
        ...Object.fromEntries(owned.scopes.map(s => [`tests/booklets/${s}/content-contract.test.ts`, { count: 1, scopes: [s], names: [`${s}: contract`] }])),
    };
    for (const scope of owned.scopes) {
        const changed = structuredClone(b);
        const index = b.records.questions.findIndex((q: any) => scopeForQuestion(q) === scope);
        changed.records.questions[index].prompt.extra = 'new';
        const selected = classify([], owned, own(changed));
        assert.deepEqual(selected.scopes, [scope]);
        assert.deepEqual(Object.keys(makeParts(Object.keys(entries), entries, selected.scopes)), [`booklet-${scope}`, 'common']);
    }
    const file = 'src/ui/SubjectBProgram.tsx';
    assert.equal(classify([file], owned).profile, 'full');
    const selected = classify([file], owned, owned, { scopedDisplays: [file] });
    assert.deepEqual(selected.scopes, ['2022-december-b', '2024-b']);
    assert.deepEqual(Object.keys(makeParts(Object.keys(entries), entries, selected.scopes)), ['booklet-2022-december-b', 'booklet-2024-b', 'common']);
    assert.equal(classify([file, 'src/ui/Content.tsx'], owned, owned, { scopedDisplays: [file] }).profile, 'full');

    const manifest = JSON.parse(readFileSync('scripts/ci/public-test-manifest.json', 'utf8')).files;
    const cases = [
        ['2017-spring-am', 'tests/content/shared/stage1-am-meaning.test.ts'],
        ['2017-spring-pm', 'tests/content/2017-spring-pm/legacy-afternoon-code.test.ts'],
        ['2024-a', 'tests/details/cache-simulator.test.ts'],
        ['2022-april-b', 'tests/content/2022-april-b/pre-2023-sample-semantics.test.ts'],
    ];
    for (const [scope] of cases) {
        const parts = makeParts(Object.keys(manifest), manifest, [scope]);
        const files = Object.values(parts).flatMap(part => part.files);
        for (const [owner, ownedTest] of cases)
            assert.equal(files.includes(ownedTest), owner === scope, `${scope}: ${ownedTest}`);
        assert(files.includes('tests/practice/mix-profile.test.ts'));
    }
});
test('scoped display rejects import-time work and unreviewed dependency edges', () => {
    const file = 'src/ui/SubjectBProgram.tsx', host = 'src/ui/Content.tsx', dep = 'src/ui/ContentText.tsx';
    const source = "import {ContentBlank} from './ContentText'; const rules = { key: /x/g }; export function display() { return <ContentBlank />; }";
    assert(inertDisplaySource(file, Buffer.from(source)));
    for (const unsafe of ["window.dispatchEvent(event);", "const cache = getSharedCache();", "import 'react';"])
        assert(!inertDisplaySource(file, Buffer.from(source + unsafe)), unsafe);
    assert(scopedDisplayImports(file, { [file]: [dep], [host]: [file] }));
    assert(!scopedDisplayImports(file, { [file]: [dep], [host]: [file], 'src/ui/Other.tsx': [file] }));
    assert(!scopedDisplayImports(file, { [file]: [dep, 'src/core/session.ts'], [host]: [file] }));
});
test('logical pack comparison scopes one changed question without treating repacking as content changes', () => {
    const a = fixture(), b = structuredClone(a);
    b.records.questions[0].prompt.extra = 'changed';
    b.catalog.revision++;
    const result = compareDistribution(own(a), own(b));
    assert.deepEqual(result.scopes, ['2016-autumn-pm']);
    assert.equal(result.changedRecords.length, 1);
    const c = structuredClone(a);
    c.catalog.revision++;
    c.catalog.files.questions = [{ path: 'questions/another-pack.json' }] as any;
    assert.deepEqual(compareDistribution(own(a), own(c)).changedRecords, []);
});
test('shared image and rights changes select every consuming booklet', () => {
    const a = fixture(), b = structuredClone(a);
    b.records.assets[0].hash = 'changed';
    b.records.rights[0].notice = 'changed';
    const r = compareDistribution(own(a), own(b));
    assert.deepEqual(r.scopes, ['2016-autumn-pm', '2017-spring-pm']);
    assert.equal(classify(['public/data/assets/shared.png'], own(a)).profile, 'booklets');
});
test('unknown distribution records and catalogue semantic metadata cannot authorize narrowed tests', () => {
    const a = fixture(), b = structuredClone(a);
    b.records.sources.push({ id: 'unowned' } as never);
    assert.equal(classify([], own(a), own(b)).profile, 'full');
    const c = fixture();
    c.catalog.generationCoverage = 'partial';
    assert.equal(classify([], own(a), own(c)).profile, 'full');
});
test('legacy source modules narrow by section and term, and year-wide modules conservatively expand both', () => {
    assert.deepEqual(scopesForOwnedPath('src/core/generators/legacy-2016-autumn-afternoon.ts', scopes), ['2016-autumn-pm']);
    assert.deepEqual(scopesForOwnedPath('src/ui/Legacy2016AutumnPmFigures.tsx', scopes), ['2016-autumn-pm']);
    const specialScopes = ['2011-autumn-am', '2011-special-am', '2011-special-pm'];
    assert.deepEqual(scopesForOwnedPath('src/ui/Legacy2011SpecialAm0126Figures.tsx', specialScopes), ['2011-special-am']);
    assert.deepEqual(scopesForOwnedPath('src/ui/Legacy2011SpecialPmFigures.tsx', specialScopes), ['2011-special-pm']);
    assert.deepEqual(scopesForOwnedPath('src/core/generators/legacy-2016.ts', scopes), scopes.slice(0, 4));
});
test('common processing, Schema, dependencies, executable documentation and unlisted content require full tests', () => {
    for (const file of ['src/core/session.ts', 'src/core/generation.ts', 'package-lock.json', 'docs/public/schema/question.json', 'docs/scripts/validate.mjs', 'public/data/unlisted.json', 'scripts/ci/plan.mjs', 'src/unrecognized.ts'])
        assert.equal(classify([file]).profile, 'full', file);
    assert.equal(classify(['docs/verification.md']).profile, 'common');
    assert.equal(classify([], own(), own(), { forceFull: true }).profile, 'full');
});
test('strict registration declarations permit append-only owned definitions and reject hooks, overwrite, mismatches and unknown imports', () => {
    const file = 'src/core/generators/afternoon-booklet-extensions.ts', head = "import type { AfternoonBookletExtension } from './afternoon-booklet-extension-contract';\n", empty = head + 'export const bookletExtensions: readonly AfternoonBookletExtension[] = [];\n', one = head + "import { defs } from './legacy-2016-autumn-afternoon';\nexport const bookletExtensions: readonly AfternoonBookletExtension[] = [{scope:'2016-autumn-pm',definitions:defs}];\n";
    assert.deepEqual(parseBookletExtensions(empty), []);
    assert.deepEqual(appendOnlyExtensionScopes(empty, one, file), ['2016-autumn-pm']);
    for (const bad of [one + 'runHook();', one.replace('definitions:defs', 'definitions:()=>defs'), one.replace('2016-autumn-pm', '2016-spring-pm'), one.replace("'./legacy-2016-autumn-afternoon'", "'./shared'"), one.replace('definitions:defs', 'definitions:defs,extra:1')])
        assert.equal(parseBookletExtensions(bad, file), null, bad);
    assert.equal(appendOnlyExtensionScopes(one, empty, file), null);
    assert.equal(appendOnlyExtensionScopes(one, one, file), null);
});
test('append-only afternoon selection-count fixtures narrow to newly distributed booklets', () => {
    const file = AFTERNOON_SELECTION_COUNTS_FILE;
    const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
    const before = source.replace(/^const preMandatorySecurity = new Set\([^\r\n]+\);$/m,
        'const preMandatorySecurity = new Set(["2011-special-pm"]);');
    const after = before.replace('"2011-special-pm"', '"2011-special-pm", "2010-spring-pm"');
    const added = afternoonSelectionCountAppendScopes(before, after);
    assert.deepEqual(added, ['2010-spring-pm']);
    for (const invalid of [
        after.replace('2010-spring-pm', '2010-spring-am'),
        after.replace('2010-spring-pm', '2011-special-pm'),
        after.replace('afternoonPaperSelection(scope).count', '106'),
        after.replace('collection.id.replace', 'collection.title.replace'),
        after.replace('"2011-special-pm", "2010-spring-pm"', '"2010-spring-pm", "2011-special-pm"'),
        after + 'use(preMandatorySecurity);',
        after + 'unrelatedTestChange();',
        before,
    ]) assert.equal(afternoonSelectionCountAppendScopes(before, invalid), null, invalid);
    assert.equal(afternoonSelectionCountAppendScopes(after, before), null);
    const distribution = fixture();
    distribution.records.questions.push(question('new', 2010, '春期'));
    const scopeProof = { extensionScopes: { [file]: added } };
    const narrowed = classify([file], own(), own(distribution), scopeProof);
    assert.deepEqual([narrowed.profile, narrowed.scopes], ['booklets', ['2010-spring-pm']]);
    assert.equal(classify([file], own(), own(), scopeProof).profile, 'full');
    assert.equal(classify([file], own(distribution), own(distribution), scopeProof).profile, 'full');
});
test('append-only admission of a two-language-section paper narrows only the new booklet', () => {
    const file = AFTERNOON_SELECTION_COUNTS_FILE;
    const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
    const before = source.replace(/^const twoLanguageSectionPapers = new Set\([^\r\n]+\);$/m,
        'const twoLanguageSectionPapers = new Set(["2008-autumn-pm"]);');
    const after = before.replace('["2008-autumn-pm"]', '["2008-autumn-pm", "2008-spring-pm"]');
    const added = afternoonSelectionCountAppendScopes(before, after);
    assert.deepEqual(added, ['2008-spring-pm']);
    for (const invalid of [
        after.replace('2008-spring-pm', '2008-spring-am'),
        after.replace('2008-spring-pm', '2009-autumn-pm'),
        after.replace('["2008-autumn-pm", "2008-spring-pm"]', '["2008-spring-pm", "2008-autumn-pm"]'),
        after.replace('twoLanguageSectionPapers.has(scope)', 'twoLanguageSectionPapers.size > 0'),
        after.replace('number >= 6 && number <= 9', 'number >= 5 && number <= 9'),
        after + 'use(twoLanguageSectionPapers);',
    ]) assert.equal(afternoonSelectionCountAppendScopes(before, invalid), null, invalid);
    assert.equal(afternoonSelectionCountAppendScopes(after, before), null);
    const distribution = fixture();
    distribution.records.questions.push(question('new', 2008, '春期'));
    const scopeProof = { extensionScopes: { [file]: added } };
    const narrowed = classify([file], own(), own(distribution), scopeProof);
    assert.deepEqual([narrowed.profile, narrowed.scopes], ['booklets', ['2008-spring-pm']]);
    assert.equal(classify([file], own(distribution), own(distribution), scopeProof).profile, 'full');
});
test('an append-only choice matrix gate belongs to its newly added booklet', () => {
    const file = ANSWER_CHOICE_MATRIX_HOST;
    const before = [
        "  if (q.origin.kind!=='official_reprint' && q.origin.sourceRefs.some(r=>",
        "    (r.sourceId==='source-ipa-2016h28h-fe-am-qs' && r.locator.questionNumber==='35') ||",
        "    (r.sourceId==='source-ipa-2016h28a-fe-am-qs' && r.locator.year===2016 && r.locator.period==='秋期' &&",
        "      r.locator.timeSlot==='午前' && r.locator.questionNumber==='18')))",
        "    return <Legacy2018AmChoiceMatrix question={q}/>;",
    ].join('\n');
    const boundary = "r.locator.questionNumber==='18')";
    const clause = " ||\n    (r.sourceId==='source-ipa-2009h21a-fe-am-qs' && r.locator.year===2009 && r.locator.period==='秋期' &&\n" +
        "      r.locator.timeSlot==='午前' && ['25', '36'].includes(r.locator.questionNumber ?? ''))";
    const after = before.replace(boundary, boundary + clause);
    const selected = answerChoiceMatrixAppendScopes(before, after);
    assert.deepEqual(selected, ['2009-autumn-am']);
    for (const invalid of [
        before, after + 'runHook();', after.replace("kind!=='official_reprint'", "kind==='official_reprint'"),
        after.replace('2009h21a', '2009h22a'), after.replace('year===2009', 'year===2010'),
        after.replace("period==='秋期' &&\n      r.locator.timeSlot==='午前' && ['25'", "period==='春期' &&\n      r.locator.timeSlot==='午前' && ['25'"),
        after.replace("['25', '36']", "['36', '25']"), after.replace("['25', '36']", "['25', '25']"),
        after.replace(boundary + clause, boundary + clause + clause),
    ]) assert.equal(answerChoiceMatrixAppendScopes(before, invalid), null, invalid);
    const distribution = fixture();
    distribution.records.questions.push(question('new', 2009, '秋期', '午前'));
    const scopeProof = { extensionScopes: { [file]: selected } };
    const narrowed = classify([file], own(), own(distribution), scopeProof);
    assert.deepEqual([narrowed.profile, narrowed.scopes], ['booklets', ['2009-autumn-am']]);
    assert.equal(classify([file], own(), own(), scopeProof).profile, 'full');
    assert.equal(classify([file], own(distribution), own(distribution), scopeProof).profile, 'full');
});
test('core and UI figure extension declarations use the same guarded append-only scope grammar', () => {
    for (const [file, c] of Object.entries(EXTENSION_DECLARATIONS).filter(([p]) => p.includes('booklet-figure-'))) {
        const declaration = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
        const entries = parseBookletExtensions(declaration, file);
        assert(entries);
        assert(entries.some(entry => entry.scope === '2015-autumn-am'));
        assert(entries.some(entry => entry.scope === '2016-autumn-pm'));

        const morningModule = file.startsWith('src/ui/') ? 'Legacy2015AutumnAmFigures' : 'generators/legacy-2015-autumn-am-figures';
        const afternoonModule = file.startsWith('src/ui/') ? 'Legacy2015AutumnPmFigures' : 'generators/legacy-2015-autumn-pm-figures';
        const before = [
            `import type { ${c.type} } from '${c.contract}';`,
            `import { morningFigures } from './${morningModule}';`,
            `export const ${c.variable}: readonly ${c.type}[] = [`,
            `  { scope: '2015-autumn-am', ${c.property}: morningFigures },`,
            '];',
        ].join('\n');
        const after = `import { nextFigures } from './${afternoonModule}';\n` + before.replace(/\];$/, `  { scope: '2015-autumn-pm', ${c.property}: nextFigures },\n];`);
        assert.deepEqual(appendOnlyExtensionScopes(before, after, file), ['2015-autumn-pm']);
        assert.equal(parseBookletExtensions(after.replace("'2015-autumn-pm'", "'2015-spring-pm'"), file), null);
        assert.equal(parseBookletExtensions(before.replace("'2015-autumn-am'", "'2015-autumn-pm'"), file), null);
        assert.equal(parseBookletExtensions(after.replace(`${c.property}: nextFigures }`, `${c.property}: nextFigures, hook: run }`), file), null);
    }
});
test('morning booklet declarations can append only a matching owned morning module', () => {
    const file = 'src/core/generators/stage3-morning-booklet-extensions.ts';
    const actual = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
    assert(parseBookletExtensions(actual, file)?.some(row => row.scope === '2015-spring-am'));
    const before = [
        "import type { MorningBookletExtension } from './stage3-morning-booklet-extension-contract';",
        "import { reviewed } from './legacy-2015-spring-am';",
        "export const morningBookletExtensions: readonly MorningBookletExtension[] = [{scope:'2015-spring-am',booklet:reviewed},];",
    ].join('\n');
    const after = `import { older } from './legacy-2014-autumn-am';\n` + before.trimEnd().replace(/\];$/, "  { scope: '2014-autumn-am', booklet: older },\n];");
    assert.deepEqual(appendOnlyExtensionScopes(before, after, file), ['2014-autumn-am']);
    for (const bad of [after.replace("2014-autumn-am', booklet", "2014-spring-am', booklet"),
        after.replace('./legacy-2014-autumn-am', './legacy-2014-autumn-pm'),
        after.replace('booklet: older', 'booklet: make(older)'),
        after.replace('booklet: older', 'booklet: older, effect: run')]) {
        assert.equal(parseBookletExtensions(bad, file), null);
    }
    assert.equal(appendOnlyExtensionScopes(after, before, file), null);
});
test('a deletion retains the old owner and multiple changed booklets are selected together', () => {
    const a = fixture(), b = structuredClone(a);
    b.records.questions.splice(0, 1);
    b.records.questions[0].prompt.extra = 'changed';
    assert.deepEqual(compareDistribution(own(a), own(b)).scopes, ['2016-autumn-pm', '2017-spring-pm']);
});
test('strict pool append scopes only new references while preserving every old value, binding, order and revision', () => {
    const a = fixture();
    a.records.sets = [{ id: 'set-shared', revision: 1, subject: 'B', questionRefs: [{ questionId: 'one', revision: 1 }] }] as any;
    const b = structuredClone(a);
    b.records.sets[0].revision = 2;
    b.records.sets[0].questionRefs.push({ questionId: 'two', revision: 1 });
    const result = compareDistribution(own(a), own(b));
    assert.deepEqual(result.scopes, ['2017-spring-pm']);
    const wrong = structuredClone(b);
    wrong.records.sets[0].questionRefs.reverse();
    assert.deepEqual(compareDistribution(own(a), own(wrong)).scopes, ['2016-autumn-pm', '2017-spring-pm']);
    const changed = structuredClone(b);
    changed.records.sets[0].subject = 'A';
    assert.deepEqual(compareDistribution(own(a), own(changed)).scopes, ['2016-autumn-pm', '2017-spring-pm']);
});
test('owned reverse imports widen all consuming booklets and unknown common consumers force full verification', () => {
    const target = 'src/core/generators/legacy-2016-autumn-afternoon.ts', consumer = 'src/core/generators/legacy-2017-spring-pm8.ts';
    assert.deepEqual(expandOwnedDependencies([target], { [consumer]: [target] }, scopes).scopes, ['2017-spring-pm']);
    assert.equal(expandOwnedDependencies([target], { 'src/core/session.ts': [target] }, scopes).unknown.length, 1);
    assert.equal(expandOwnedDependencies([target], { 'src/core/generators/afternoon-booklet-extensions.ts': [target] }, scopes, ['src/core/generators/afternoon-booklet-extensions.ts']).unknown.length, 0);
});
test('AST dependency discovery retains multiline, minified, side-effect, reexport, type, literal dynamic and raw CSS imports', () => {
    const inputs = Object.fromEntries(['src/a.ts', 'src/one.ts', 'src/two.ts', 'src/three.ts', 'src/four.ts', 'src/five.ts', 'src/six.ts', 'src/style.css'].map(p => [p, true]));
    const source = `import {\n one\n} from './one';import{two}from'./two';import './three';export{four}from'./four';export * from './five';const x=import('./six');type V=typeof import('./one');import css from './style.css?raw';import React from 'react';`;
    const result = runtimeDependencyGraph({ 'src/a.ts': source }, inputs, ['react']);
    assert.deepEqual(result.unresolved, []);
    assert.deepEqual(result.graph['src/a.ts'], Object.keys(inputs).filter(p => p !== 'src/a.ts').sort());
});
test('unresolved aliases, computed dynamic imports, require arguments and malformed source force an unknown dependency result', () => {
    for (const source of ["import x from '@/shared';", 'const x=import(name);', 'const x=require(name);', "import x from './missing';", 'import { bad from "react";'])
        assert(runtimeDependencyGraph({ 'src/a.ts': source }, { 'src/a.ts': true }, ['react']).unresolved.length > 0, source);
});
test('source obligations accept only closed append-only collection declarations with retained held source numbers', () => {
    const empty = JSON.stringify({ version: 1, collections: [] }), row = { collectionId: '2016h28a-fe-pm', excluded: [{ number: 12, reason: 'Third-party material conditions pending', sourceId: 'source-ipa-2016h28a-fe-pm-qs', checkedOn: '2026-11-02' }] }, after = JSON.stringify({ version: 1, collections: [row] });
    assert.deepEqual(sourceInventoryAppendScopes(empty, after), ['2016-autumn-pm']);
    const special = { collectionId: '2011h23tokubetsu-fe-am', excluded: [] };
    const specialOnly = JSON.stringify({ version: 1, collections: [special] });
    assert.deepEqual(sourceInventoryAppendScopes(empty, specialOnly), ['2011-special-am']);
    assert.deepEqual(sourceInventoryAppendScopes(specialOnly, JSON.stringify({ version: 1, collections: [special, row] })), ['2016-autumn-pm']);
    assert.equal(sourceInventoryAppendScopes(empty, JSON.stringify({ version: 1, collections: [{ ...special, collectionId: '2012h24tokubetsu-fe-am' }] })), null);
    assert.equal(sourceInventoryAppendScopes(specialOnly, JSON.stringify({ version: 1, collections: [special, { ...special, collectionId: '2011h23t-fe-am' }] })), null);
    for (const bad of [{ ...row, collectionId: '2016h27a-fe-pm' }, { ...row, extra: 'hook' }, { ...row, excluded: [{ ...row.excluded[0], number: 14 }] }, { ...row, excluded: [{ ...row.excluded[0], sourceId: 'source-foreign' }] }, { ...row, excluded: [row.excluded[0], row.excluded[0]] }])
        assert.equal(sourceInventoryAppendScopes(empty, JSON.stringify({ version: 1, collections: [bad] })), null);
    assert.equal(sourceInventoryAppendScopes(after, empty), null);
    assert.equal(sourceInventoryAppendScopes(after, JSON.stringify({ version: 1, collections: [{ ...row, excluded: [] }] })), null);
});

test('only the known generated validator resolves virtually through its tracked compiler, Schema, Unicode and dependency inputs',()=>{
 const file='src/core/validation.ts',source="import * as validators from '../generated/validators.js';",inputs=Object.fromEntries([file,'scripts/compile-schemas.mjs','src/core/unicode.js','package.json','package-lock.json','docs/public/schemas/question.schema.json'].map(p=>[p,true]));
 const result=runtimeDependencyGraph({[file]:source},inputs);assert.deepEqual(result.unresolved,[]);assert.deepEqual(result.graph[file],['src/generated/validators.js']);assert(result.graph['src/generated/validators.js'].includes('scripts/compile-schemas.mjs'));assert.equal(result.virtualDependencies.length,1);
 const absent={...inputs};delete absent['scripts/compile-schemas.mjs'];assert.equal(runtimeDependencyGraph({[file]:source},absent).unresolved.length,1);
 assert.equal(runtimeDependencyGraph({[file]:source.replace('validators.js','unreviewed.js')},inputs).unresolved.length,1);
});
