import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { validFeatureTest, classifyFeatureChanges } from '../scripts/ci/feature-changes.mjs';
import { RECORD_KINDS, distributionOwnership } from '../scripts/ci/scopes.mjs';
import { makeParts, validateTestManifest, sha } from '../scripts/ci/plan.mjs';
import { aggregate } from '../scripts/ci/results.mjs';

const root = process.cwd(), verify = 'tests/verify.test.ts', storage = 'tests/storage.test.ts', native = 'tests/native.test.ts', content = 'tests/content.test.ts';
const entries: any = {
  [verify]: { count: 1, scopes: [], features: ['verification'] },
  [storage]: { count: 1, scopes: [], features: ['storage'] },
  [native]: { count: 1, scopes: [], features: ['storage'], runtime: 'chromium' },
  [content]: { count: 1, scopes: ['2024-a'] },
};
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

test('feature ownership accepts only declared features and requires browser tests to belong to storage', () => {
  assert(validFeatureTest(entries[native])); validateTestManifest(Object.keys(entries).sort(), entries);
  for (const entry of [{ features: [] }, { features: ['other'] }, { features: ['storage', 'storage'] }, { features: ['verification'], runtime: 'chromium' }, { features: ['storage'], runtime: 'other' }]) {
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

test('Pages installs the pinned Chromium runtime for the mandatory native-storage part before executing its witnessed tests', () => {
  const workflow = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
  const install = workflow.indexOf('npx playwright install --with-deps chromium');
  assert(install > workflow.indexOf('- run: npm ci'));
  assert.match(workflow.slice(install - 110, install), /if: matrix\.part == 'browser-storage'/);
  assert(install < workflow.indexOf('node scripts/ci/run-part.mjs'));
  assert.match(workflow, /needs: \[build, aggregate\]/);
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
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GITHUB_') && !['NODE_TEST_CONTEXT', 'NODE_OPTIONS'].includes(k)));
  const write = (file: string, value: string) => { fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); fs.writeFileSync(path.join(dir, file), value); };
  const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const emit = () => { for (const k of RECORD_KINDS) { const bytes = JSON.stringify(f.after.records[k]); write('public/data/' + k + '/pack.json', bytes); f.after.catalog.files[k] = [{ path: k + '/pack.json', sha256: sha(bytes), recordCount: f.after.records[k].length }]; } write('public/data/catalog.json', JSON.stringify(f.after.catalog)); };
  try {
    write('.gitignore', '/node_modules\n/output/\n'); write('package.json', '{"type":"module","dependencies":{"typescript":"5.9.3"}}');
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
    for (const file of fs.readdirSync('scripts/ci').filter(f => f.endsWith('.mjs'))) write('scripts/ci/' + file, fs.readFileSync('scripts/ci/' + file, 'utf8'));
    write('src/core/storage.ts', body); write('src/ui/App.tsx', "import {history} from '../core/storage';export const boot=history;");
    for (const file of Object.keys(entries)) write(file, "import test from 'node:test';test('synthetic planning assertion for " + file + "',()=>{});");
    write('scripts/ci/public-test-manifest.json', JSON.stringify({ version: 2, files: entries })); emit();
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
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
