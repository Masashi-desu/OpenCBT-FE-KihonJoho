import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { validFeatureTest, classifyFeatureChanges } from '../../scripts/ci/feature-changes.mjs';
import { DEV_SCHEMA_PLUGIN } from '../../scripts/ci/startup-changes.mjs';
import { ERROR_DETAIL, MENU_CARD, MENU_SELECTION, SEARCH_MATERIALS, uiConsumerBoundary } from '../../scripts/ci/ui-changes.mjs';
import { RECORD_KINDS, distributionOwnership } from '../../scripts/ci/scopes.mjs';
import { makeParts, validateTestManifest, sha } from '../../scripts/ci/plan.mjs';
import { aggregate } from '../../scripts/ci/results.mjs';

const root = process.cwd(), verify = 'tests/verify.test.ts', storage = 'tests/storage.test.ts', native = 'tests/native.test.ts', content = 'tests/content.test.ts';
const entries: any = {
  [verify]: { count: 1, scopes: [], features: ['verification'] },
  [storage]: { count: 1, scopes: [], features: ['storage'] },
  [native]: { count: 1, scopes: [], features: ['storage'], runtime: 'chromium' },
  [content]: { count: 1, scopes: ['2024-a'] },
};
const dev = 'tests/dev-schema.test.ts', browserError = 'tests/browser-error.test.ts';
const browserMenu = 'tests/browser-menu.test.ts', browserSearch = 'tests/browser-search.test.ts';
const startupEntries = {
  [dev]: { count: 1, scopes: [], features: ['dev-schema'] },
  [browserError]: { count: 1, scopes: [], features: ['error-ui'], runtime: 'chromium' },
  [browserMenu]: { count: 1, scopes: [], features: ['menu-ui'], runtime: 'chromium' },
  [browserSearch]: { count: 1, scopes: [], features: ['search-ui'], runtime: 'chromium' },
};
const plugin = "import { compileSchemas } from './compile-schemas.mjs'; export function devSchemaValidators() { let config; return { name: 'dev-schema-validators', apply: 'serve', configureServer() { compileSchemas(config.root); } }; }";
const detail = "import { useState } from 'react'; export function ErrorDetails() { return <details>コピーしました</details>; }";
function distribution() {
  const records: any = Object.fromEntries(RECORD_KINDS.map(k => [k, []]));
  records.questions = [{ id: 'question-probe', revision: 1, subject: 'A', origin: { sourceRefs: [{ locator: { year: 2024, subject: '科目A', questionNumber: '1' } }], derivedFrom: [], changes: [] }, prompt: { text: 'unchanged' }, correctAnswer: { choiceId: 'one' } }];
  records.templates = [{ id: 'template-probe', baseQuestionRef: { questionId: 'question-probe', revision: 1 }, parameterDomain: { minimum: 0, maximum: 1 } }];
  return { catalog: { revision: 1, files: Object.fromEntries(RECORD_KINDS.map(k => [k, []])) as Record<string, any[]> }, records };
}
const body = 'export async function history(): Promise<unknown[]> { return []; }';
function fixture() {
  const before = distribution(), after = structuredClone(before), files: Record<string, string> = { 'src/core/storage.ts': body + '\n// implementation change' };
  return { before, after, files };
}
const own = (d: ReturnType<typeof distribution>) => distributionOwnership(d.catalog, d.records);
function classify(f = fixture(), options: any = {}) {
  return classifyFeatureChanges({ changed: Object.keys(f.files), beforeOwnership: own(f.before), afterOwnership: own(f.after),
    beforeTestEntries: entries, testEntries: entries, readBefore: (file: string) => file === 'src/core/storage.ts' ? Buffer.from(body) : null,
    readAfter: (file: string) => f.files[file] === undefined ? null : Buffer.from(f.files[file]), ...options });
}

test('feature ownership accepts only declared features and requires an unambiguous browser owner', () => {
  assert(validFeatureTest(entries[native])); assert(validFeatureTest(startupEntries[browserError]));
  validateTestManifest(Object.keys(entries).sort(), entries);
  for (const entry of [{ features: [] }, { features: ['other'] }, { features: ['storage', 'storage'] }, { features: ['verification'], runtime: 'chromium' }, { features: ['storage', 'error-ui'], runtime: 'chromium' }, { features: ['storage'], runtime: 'other' }]) {
    assert(!validFeatureTest(entry)); assert.throws(() => validateTestManifest(['tests/probe.test.ts'], { 'tests/probe.test.ts': { count: 1, scopes: [], ...entry } }));
  }
});

test('closed storage changes select storage and verification while retaining unchanged distribution identities', () => {
  const f = fixture(), before = JSON.stringify(f), selected = classify(f)!;
  assert.equal(selected.profile, 'features'); assert.deepEqual(selected.features, ['storage', 'verification']);
  assert.deepEqual(selected.scopes, []); assert.deepEqual(selected.detailDirectories, []); assert.equal(JSON.stringify(f), before);
});

test('question content, generation/scoring/schema contracts, public storage signatures and unknown files defeat the feature proof', () => {
  for (const file of ['src/core/session.ts', 'src/core/generation.ts', 'src/core/answers.ts', 'src/core/types.ts', 'src/ui/App.tsx', 'docs/public/schemas/question.schema.json', 'scripts/unknown.mjs']) {
    const f = fixture(); f.files[file] = 'export const changed = true'; assert.equal(classify(f), null, file);
  }
  for (const change of [(f: any) => { f.after.records.questions[0].prompt.text = 'different'; }, (f: any) => { f.after.records.questions[0].correctAnswer.choiceId = 'two'; }, (f: any) => { f.after.records.templates[0].parameterDomain.maximum = 2; }]) {
    const f = fixture(); change(f); assert.equal(classify(f), null);
  }
  const signature = fixture(); signature.files['src/core/storage.ts'] = body.replace('history()', 'history(id: string)'); assert.equal(classify(signature), null);
});

test('feature metadata cannot delete, reassign, shrink or demote existing native coverage', () => {
  for (const change of [(e: any) => { delete e[native]; }, (e: any) => { e[native].runtime = undefined; }, (e: any) => { e[storage].features = ['verification']; }, (e: any) => { e[storage].count = 0; }, (e: any) => { e[storage].scopes = ['2024-a']; }]) {
    const next = structuredClone(entries); change(next); assert.equal(classify(fixture(), { testEntries: next }), null);
  }
});

test('functional plans require native IndexedDB tests and explicit full plans retain all original content cases', () => {
  const selected = classify()!, files = Object.keys(entries), parts = makeParts(files, entries, [], false, selected);
  assert.deepEqual(Object.keys(parts), ['browser-storage', 'common', 'feature-storage']);
  assert.deepEqual(parts['browser-storage'].files, [native]); assert(!Object.values(parts).some(p => p.files.includes(content)));
  assert.throws(() => makeParts(files.filter(f => f !== native), entries, [], false, selected));
  assert.equal(Object.values(makeParts(files, entries, [], true, selected)).reduce((n, p) => n + p.expectedCount, 0), 4);
  assert(!Object.values(makeParts(files, entries, ['2024-a'])).some(p => p.files.includes(native)), 'booklet content changes do not acquire unrelated browser work');
});

test('verification-only changes run verification tests and preserve full-inventory validation', () => {
  const f = fixture(); f.files = { 'scripts/ci/scopes.mjs': '// implementation change' };
  const selected = classify(f)!; assert.deepEqual(selected.features, ['verification']);
  assert.deepEqual(Object.values(makeParts(Object.keys(entries), entries, [], false, selected)).flatMap(p => p.files), [verify]);
});

test('startup-only features select their own regressions and reject shared compiler, app or CSS changes', () => {
  const tests = { ...entries, ...startupEntries };
  const css = 'body { margin: 0; }\n.error-details pre { white-space: pre; }\n';
  const styles = 'src/ui/style.css';
  const sources: Record<string, string> = { [DEV_SCHEMA_PLUGIN]: plugin, [ERROR_DETAIL]: detail, [styles]: css };
  const select = (files: Record<string, string>, testEntries = tests) => classify({ ...fixture(), files }, {
    beforeTestEntries: tests, testEntries,
    readBefore: (file: string) => sources[file] === undefined ? null : Buffer.from(sources[file]),
  });
  const devOnly = select({ [DEV_SCHEMA_PLUGIN]: plugin.replace('compileSchemas(config.root);', 'compileSchemas(config.root, undefined);') })!;
  assert.deepEqual(devOnly.features, ['dev-schema', 'verification']);
  assert.deepEqual(Object.values(makeParts(Object.keys(tests), tests, [], false, devOnly)).flatMap(p => p.files), [dev, verify].sort());
  const uiOnly = select({ [ERROR_DETAIL]: detail.replace('コピーしました', 'コピー完了'), [styles]: css.replace('white-space: pre', 'white-space: pre-wrap') })!;
  assert.deepEqual(uiOnly.features, ['error-ui', 'verification']);
  const parts = makeParts(Object.keys(tests), tests, [], false, uiOnly);
  assert.deepEqual(parts['browser-error-ui'].files, [browserError]);
  assert.deepEqual(parts.common.files, [verify]);
  assert.throws(() => makeParts(Object.keys(tests).filter(f => f !== browserError), tests, [], false, uiOnly));
  const unsafeChanges: Record<string, string>[] = [
    { [DEV_SCHEMA_PLUGIN]: plugin.replace("apply: 'serve'", "apply: 'build'") },
    { [DEV_SCHEMA_PLUGIN]: plugin.replace('let config;', 'compileSchemas(); let config;') },
    { [ERROR_DETAIL]: detail + '\nimport "../core/storage";' },
    { [styles]: css.replace('margin: 0', 'margin: 8px') },
    { [styles]: css.replace('.error-details pre', '.error-details pre, .main') },
    { [styles]: css.replace('.error-details pre', '.error-details ~ .main') },
    { 'scripts/compile-schemas.mjs': 'changed' },
    { 'src/ui/App.tsx': 'changed' },
    { 'docs/public/schemas/catalog.schema.json': 'changed' },
  ];
  for (const changed of unsafeChanges) assert.equal(select(changed), null, Object.keys(changed).join(', '));
  assert.equal(select({ [ERROR_DETAIL]: detail.replace('コピーしました', 'コピー完了') },
    { ...tests, [browserError]: { count: 1, scopes: [], features: ['error-ui'] } } as typeof tests), null);
  assert.equal(classify(fixture(), {
    beforeTestEntries: { ...tests, [content]: { count: 1, scopes: ['2024-a'] } },
    testEntries: { ...tests, [content]: { count: 1, scopes: ['2024-a'], features: ['dev-schema'] } },
  }), null);
});

test('audited search and menu presentation select only the relevant browser parts and reject shared changes', () => {
  const tests = { ...entries, ...startupEntries };
  const styles = 'src/ui/style.css';
  const css = 'body { margin: 0; }\n.selection-option:not(.selected) span { display: block; }\n.search-question > p { margin: 5px; }\n';
  const card = 'export function MenuOptionCard() { return <button/>; }';
  const select = (files: Record<string, string>) => classify({ ...fixture(), files }, {
    beforeTestEntries: tests, testEntries: tests,
    readBefore: (file: string) => file === styles ? Buffer.from(css) : file === MENU_CARD ? Buffer.from(card) : null,
  });
  const search = select({ [styles]: css.replace('margin: 5px', 'margin: 6px') })!;
  assert.deepEqual(search.features, ['search-ui', 'verification']);
  assert.deepEqual(Object.keys(makeParts(Object.keys(tests), tests, [], false, search)), ['browser-search-ui', 'common']);
  const menu = select({ [MENU_CARD]: card.replace('<button/>', '<button type="button"/>'),
    [styles]: css.replace('display: block', 'display: inline-block') })!;
  assert.deepEqual(menu.features, ['menu-ui', 'verification']);
  assert.deepEqual(Object.keys(makeParts(Object.keys(tests), tests, [], false, menu)), ['browser-menu-ui', 'common']);
  const mixed = select({ [styles]: css.replace('display: block', 'display: grid').replace('margin: 5px', 'margin: 6px') })!;
  assert.deepEqual(mixed.features, ['menu-ui', 'search-ui', 'verification']);
  assert.deepEqual(Object.keys(makeParts(Object.keys(tests), tests, [], false, mixed)), ['browser-menu-ui', 'browser-search-ui', 'common']);
  for (const after of [css.replace('margin: 0', 'margin: 8px'),
    css.replace('.search-question > p', '.search-question + p'),
    css.replace('.selection-option:not(.selected) span', '.selection-option span, body')])
    assert.equal(select({ [styles]: after }), null);
  assert.equal(select({ [MENU_CARD]: card + 'import "../core/session";' }), null);
  assert.equal(select({ [MENU_CARD]: card.replace('MenuOptionCard()', 'MenuOptionCard(props: unknown)') }), null);

  const host = 'src/ui/SearchPage.tsx';
  const before = { [host]: [] };
  const after = { [host]: [SEARCH_MATERIALS], [SEARCH_MATERIALS]: ['src/core/types.ts', 'src/ui/Content.tsx', 'src/ui/MaterialViewer.tsx'] };
  assert.equal(uiConsumerBoundary(SEARCH_MATERIALS, before, after), host);
  assert.equal(uiConsumerBoundary(SEARCH_MATERIALS, before, { ...after, 'src/ui/App.tsx': [SEARCH_MATERIALS] }), false);
  assert.equal(uiConsumerBoundary(SEARCH_MATERIALS, before, { ...after, [SEARCH_MATERIALS]: ['src/core/answers.ts'] }), false);
});

test('Pages uses the pinned Playwright image only for browser parts and checks it before testing', () => {
  const workflow = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
  const { devDependencies } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const browserImage = workflow.match(/image: \$\{\{ startsWith\(matrix\.part, 'browser-'\) && 'mcr\.microsoft\.com\/playwright:v([^']+)-noble@sha256:[a-f0-9]{64}' \|\| '' \}\}/);
  assert.equal(browserImage?.[1], devDependencies.playwright);
  assert.match(workflow, /options: --ipc=host/);

  const check = workflow.indexOf('- name: Check isolated browser');
  const run = workflow.indexOf('- name: Run planned tests');
  assert(check > workflow.indexOf('- run: npm ci'));
  assert(check < run && run < workflow.indexOf('node scripts/ci/run-part.mjs'));
  const browserCheck = workflow.slice(check, run);
  assert.match(browserCheck, /git config --global --add safe\.directory "\$GITHUB_WORKSPACE"/);
  assert.match(browserCheck, /test "\$\(git rev-parse HEAD\)" = "\$GITHUB_SHA"/);
  assert.match(browserCheck, /if: startsWith\(matrix\.part, 'browser-'\)/);
  assert.match(browserCheck, /accessSync\(require\("playwright"\)\.chromium\.executablePath\(\), constants\.X_OK\)/);
  assert.doesNotMatch(workflow, /playwright install|apt-get/);
  assert.match(workflow, /needs: \[build, aggregate\]/);
});

test('menu transition changes select menu and verification tests without reducing booklet coverage', () => {
  const menuTest = 'tests/practice/menu-selection.test.ts', mixTest = 'tests/practice/mix-profile.test.ts';
  const legacyTest = 'tests/content/2017-spring-pm/legacy-afternoon-selection.test.ts';
  const previous = {
    ...entries, ...startupEntries,
    [menuTest]: { count: 12, scopes: [] },
    [mixTest]: { count: 12, scopes: [] },
    [legacyTest]: { count: 4, scopes: ['2017-spring-pm'] },
  };
  const tests = { ...previous, ...Object.fromEntries([menuTest, mixTest, legacyTest].map(file =>
    [file, { ...previous[file], features: ['menu-ui'] }])) };
  const source = [
    "import type { Selection } from './types';",
    "export function menuSourceGroups() { return []; }",
    "export function patchMenuSelection(old: Selection, value: Partial<Selection>): Selection { return old; }",
  ].join('\n');
  const changed = source.replace('return old;', 'return { ...old, ...value };');
  const select = (files: Record<string, string>, testEntries = tests) => classify({ ...fixture(), files }, {
    beforeTestEntries: previous, testEntries,
    readBefore: (file: string) => file === MENU_SELECTION ? Buffer.from(source) : null,
  });
  const menu = select({ [MENU_SELECTION]: changed, [menuTest]: '// test change' })!;
  assert.equal(menu.profile, 'features');
  assert.deepEqual(menu.features, ['menu-ui', 'verification']);
  const parts = makeParts(Object.keys(tests), tests, [], false, menu);
  assert.deepEqual(Object.keys(parts), ['browser-menu-ui', 'common']);
  assert.deepEqual(parts['browser-menu-ui'].files, [browserMenu]);
  assert.deepEqual(parts.common.files, [legacyTest, menuTest, mixTest, verify].sort());

  const beforeBooklet = makeParts(Object.keys(previous), previous, ['2017-spring-pm']);
  assert.deepEqual(makeParts(Object.keys(tests), tests, ['2017-spring-pm']), beforeBooklet);
  assert.equal(select({ [MENU_SELECTION]: changed }, {
    ...tests, [content]: { ...previous[content], features: ['menu-ui'] },
  }), null);
  for (const unsafe of [
    changed.replace('return [];', 'return [1];'),
    changed.replace('value: Partial<Selection>', 'value: Selection'),
    changed + "\nimport './storage';",
  ]) assert.equal(select({ [MENU_SELECTION]: unsafe }), null);
  assert.equal(select({ [MENU_SELECTION]: changed, 'src/core/selection.ts': 'changed' }), null);

  const host = 'src/ui/App.tsx';
  const graph = { [host]: [MENU_SELECTION], [MENU_SELECTION]: ['src/core/errors.ts', 'src/core/source-collections.ts', 'src/core/types.ts'] };
  assert.equal(uiConsumerBoundary(MENU_SELECTION, graph, graph), host);
  assert.equal(uiConsumerBoundary(MENU_SELECTION, graph, { ...graph, 'src/ui/other.ts': [MENU_SELECTION] }), false);
  assert.equal(uiConsumerBoundary(MENU_SELECTION, graph, {
    ...graph, [MENU_SELECTION]: [...graph[MENU_SELECTION], 'src/core/selection.ts'],
  }), false);
});

test('only an exact pinned development browser dependency may accompany feature changes; production and unrelated lock changes widen', () => {
  const f = fixture(), pkg = { type: 'module', dependencies: { typescript: '5.9.3' }, devDependencies: {} }, lock = { lockfileVersion: 3, packages: { '': pkg } };
  const next: any = structuredClone(pkg); next.devDependencies.playwright = '1.64.1';
  const nextLock: any = structuredClone(lock); nextLock.packages[''] = next; nextLock.packages['node_modules/playwright'] = { version: '1.64.1', dev: true };
  const prior = (file: string) => Buffer.from(file === 'package.json' ? JSON.stringify(pkg) : file === 'package-lock.json' ? JSON.stringify(lock) : body);
  f.files['package.json'] = JSON.stringify(next); f.files['package-lock.json'] = JSON.stringify(nextLock);
  assert(classify(f, { readBefore: prior }));
  next.dependencies.typescript = 'other'; f.files['package.json'] = JSON.stringify(next); assert.equal(classify(f, { readBefore: prior }), null);
  next.dependencies.typescript = pkg.dependencies.typescript; next.devDependencies.playwright = '^1.64.1'; f.files['package.json'] = JSON.stringify(next); assert.equal(classify(f, { readBefore: prior }), null);
  next.devDependencies.playwright = '1.64.1'; f.files['package.json'] = JSON.stringify(next); nextLock.packages['node_modules/playwright'].dev = false;
  f.files['package-lock.json'] = JSON.stringify(nextLock); assert.equal(classify(f, { readBefore: prior }), null);
});

test('real Git plans execute each functional part, aggregate exact witnesses and widen for unknown consumers or content changes', () => {
  const dir = fs.mkdtempSync(path.join(root, 'output', 'ci-feature-git-')), f = fixture();
    const legacyQuestion = (id: string, timeSlot: string, subject: string) => ({
      id, subject, origin: { sourceRefs: [{ locator: { year: 2016, period: '秋期', timeSlot, questionNumber: '1' } }] },
    });
    f.after.records.questions.push(
      legacyQuestion('old-am', '午前', 'A'),
      legacyQuestion('old-pm', '午後', 'B'),
      { id: 'current-b', subject: 'B', origin: { sourceRefs: [{ locator: { year: 2024, subject: '科目B', questionNumber: '1' } }] } },
    );
    const scopeEntries = Object.fromEntries(['2016-autumn-am', '2016-autumn-pm', '2024-b'].map(scope =>
      [`tests/booklets/${scope}/content-contract.test.ts`, { count: 1, scopes: [scope], names: [`${scope}: contract`] }]));
    const localEntries = { ...entries, ...startupEntries, ...scopeEntries };
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GITHUB_') && !['NODE_TEST_CONTEXT', 'NODE_OPTIONS'].includes(k)));
  const write = (file: string, value: string) => { fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); fs.writeFileSync(path.join(dir, file), value); };
  const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const emit = () => { for (const k of RECORD_KINDS) { const bytes = JSON.stringify(f.after.records[k]); write('public/data/' + k + '/pack.json', bytes); f.after.catalog.files[k] = [{ path: k + '/pack.json', sha256: sha(bytes), recordCount: f.after.records[k].length }]; } write('public/data/catalog.json', JSON.stringify(f.after.catalog)); };
  try {
    write('.gitignore', '/node_modules\n/output/\n'); write('package.json', '{"type":"module","dependencies":{"typescript":"5.9.3"}}');
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
    for (const file of fs.readdirSync('scripts/ci').filter(f => f.endsWith('.mjs'))) write('scripts/ci/' + file, fs.readFileSync('scripts/ci/' + file, 'utf8'));
    write('src/core/storage.ts', body); write('src/ui/App.tsx', "import {history} from '../core/storage';export const boot=history;");
    for (const file of Object.keys(localEntries)) write(file, "import test from 'node:test';test('synthetic planning assertion for " + file + "',()=>{});");
    write('scripts/ci/public-test-manifest.json', JSON.stringify({ version: 2, files: localEntries })); emit();
    git('init', '-q'); git('config', 'user.name', 'CI fixture'); git('config', 'user.email', 'ci-fixture@example.invalid'); git('add', '.'); git('commit', '-qm', 'synthetic verified baseline');
    let baseCommit = git('rev-parse', 'HEAD'); write('src/core/storage.ts', f.files['src/core/storage.ts']);
    const plan = (options: any = { baseCommit }) => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', `import {createPlan} from './scripts/ci/plan.mjs';console.log(JSON.stringify(createPlan(${JSON.stringify(options)})));`], { cwd: dir, env, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
    const selected = plan(); assert.equal(selected.profile, 'features'); assert.equal(selected.expectedCount, 3); assert(!selected.selectedFiles.includes(content));
    write('output/plan.json', JSON.stringify(selected));
    for (const part of selected.parts) execFileSync(process.execPath, ['scripts/ci/run-part.mjs', 'output/plan.json', part, 'output/results/' + part], { cwd: dir, env, encoding: 'utf8' });
    const result = execFileSync(process.execPath, ['scripts/ci/aggregate.mjs', 'output/plan.json', 'output/results'], { cwd: dir, env, encoding: 'utf8' }); assert.equal(JSON.parse(result).status, 'pass');
    const reports = selected.parts.map((part: string) => JSON.parse(fs.readFileSync(path.join(dir, 'output/results', part, 'result.json'), 'utf8')));
    assert.throws(() => aggregate(selected, reports.filter((r: any) => r.part !== 'browser-storage')), 'native results are mandatory at aggregation');
    assert.equal(plan({ baseCommit, forceFull: true }).profile, 'full'); assert.equal(plan({}).profile, 'full');
    f.after.records.questions[0].correctAnswer.choiceId = 'two'; emit(); assert.equal(plan().profile, 'full');
    f.after.records.questions[0].correctAnswer.choiceId = 'one'; emit(); write('src/core/storage.ts', body);
    write('src/core/generators/legacy-2024.ts', "import '../storage';export const probe=1;");
    git('add', '.'); git('commit', '-qm', 'synthetic additional storage consumer'); baseCommit = git('rev-parse', 'HEAD');
    write('src/core/storage.ts', body + '\n// implementation change'); const unsafe = plan(); assert.equal(unsafe.profile, 'full'); assert(unsafe.selectedFiles.includes(content));

    const display = 'src/ui/SubjectBProgram.tsx', host = 'src/ui/Content.tsx';
    const renderer = "import { Blank } from './ContentText'; export function Program() { return <Blank />; }";
    write('src/core/storage.ts', body);
    write('src/ui/ContentText.tsx', 'export function Blank() { return <span />; }');
    write(host, "import { Program } from './SubjectBProgram'; export function Content({currentB}) { return currentB ? <Program /> : null; }");
    write(display, renderer);
    git('add', '.'); git('commit', '-qm', 'synthetic verified display boundary'); baseCommit = git('rev-parse', 'HEAD');
    write(display, renderer.replace('<Blank />', '<Blank label="a" />'));
    const onlyB = plan();
    assert.deepEqual(onlyB.scopes, ['2024-b']);
    assert.deepEqual(onlyB.parts, ['booklet-2024-b', 'common']);
    assert(!onlyB.selectedFiles.includes(content));
    const morningFile = 'src/core/generators/legacy-2016-autumn-am-probe.ts';
    write(morningFile, "import '../../ui/SubjectBProgram'; export const probe = 1;");
    assert.equal(plan().profile, 'full', 'an additional consumer breaks the display proof');
    write(display, renderer);
    write(morningFile, 'export const probe = 1;');
    const onlyMorning = plan();
    assert.deepEqual(onlyMorning.scopes, ['2016-autumn-am']);
    assert.deepEqual(onlyMorning.parts, ['booklet-2016-autumn-am', 'common']);
    assert(!onlyMorning.selectedFiles.includes(content));

    const errorStyle = 'src/ui/style.css', errorUI = 'export function ErrorDetails() { return <details/>; }';
    write(ERROR_DETAIL, errorUI);
    write('src/main.tsx', "import './ui/style.css';");
    write(errorStyle, '.error-details { display: block; }');
    write('src/ui/App.tsx', "import {ErrorDetails} from './ErrorDetails'; export function App() { return <ErrorDetails/>; }");
    write(DEV_SCHEMA_PLUGIN, plugin);
    git('add', '.'); git('commit', '-qm', 'synthetic verified startup boundaries'); baseCommit = git('rev-parse', 'HEAD');
    write(errorStyle, '.error-details { display: grid; }');
    write(ERROR_DETAIL, errorUI.replace('<details/>', '<details open/>'));
    const onlyError = plan();
    assert.equal(onlyError.profile, 'features', JSON.stringify(onlyError.unknown));
    assert.deepEqual(onlyError.features, ['error-ui', 'verification']);
    assert.deepEqual(onlyError.parts, ['browser-error-ui', 'common']);
    assert.deepEqual(onlyError.selectedFiles, [browserError, verify].sort());
    write(morningFile, "import '../../ui/ErrorDetails'; export const probe=1;");
    assert.equal(plan().profile, 'full', 'another application consumer breaks the error UI proof');
    write(morningFile, 'export const probe = 1;');
    write(ERROR_DETAIL, errorUI);
    write(errorStyle, '.error-details { display: block; }');
    write(DEV_SCHEMA_PLUGIN, plugin + '\n// Vite dev only');
    const onlyDev = plan();
    assert.deepEqual(onlyDev.features, ['dev-schema', 'verification']);
    assert.deepEqual(onlyDev.selectedFiles, [dev, verify].sort());
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
