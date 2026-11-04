import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { distributionOwnership, classifyScopedChanges } from '../scripts/ci/scopes.mjs';
import { classifyDetailChanges, validDetailTest } from '../scripts/ci/detail-changes.mjs';
import { makeParts, validateTestManifest } from '../scripts/ci/plan.mjs';
import { sortedJson } from '../src/core/hash';
import { readDistributionBundle } from '../scripts/distribution-files';

const directory = 'explanations/lesson-one/', otherDirectory = 'explanations/lesson-two/';
const sha = (v: string | Buffer) => crypto.createHash('sha256').update(v).digest('hex');
const hash = (v: unknown) => sha(JSON.stringify(sortedJson(v)));
const root = process.cwd(), kinds = ['questions', 'templates', 'sets', 'exams', 'sources', 'rights', 'assets'];
const sharedTest = 'tests/detail-host.test.ts', packageTest = 'tests/lesson-detail.test.ts', contentTest = 'tests/content.test.ts', saveTest = 'tests/storage.test.ts';
const detailEntry = { count: 1, scopes: ['2024-a'], detail: { packages: [directory], supportFiles: ['scripts/update-lesson-one-manifest.mjs'] } };
const priorEntries = { [sharedTest]: { count: 1, scopes: [], detail: { packages: [], supportFiles: [] } }, [contentTest]: { count: 1, scopes: ['2024-a'] }, [saveTest]: { count: 1, scopes: [] } };
const entries = { ...priorEntries, [packageTest]: detailEntry };
function question(id: string, year: number, derivedFrom: any[] = []): any {
  return { id, revision: 1, subject: 'A', origin: { sourceRefs: [{ sourceId: 'source-' + id, locator: { year, subject: '科目A', questionNumber: '1' } }], derivedFrom, changes: [] },
    prompt: { blocks: [{ type: 'paragraph', text: 'unchanged question' }] }, choices: [{ id: 'one' }, { id: 'two' }], correctAnswer: { choiceId: 'one' }, explanation: { blocks: [{ text: 'unchanged explanation' }] }, review: { checkedOn: '2026-11-03', notes: 'reviewed', checks: { answer: 'pass' } } };
}
function fixture() {
  const original = question('original', 2024), base = question('base', 2024, [{ questionId: 'original', revision: 1 }]), other = question('other', 2025);
  const template = { id: 'template-one', revision: 1, baseQuestionRef: { questionId: base.id, revision: 1 }, generatorRef: { id: 'generator-source-one', version: '1.0.0' }, parameterDomain: { minimum: 1, maximum: 8 }, referenceParameters: { values: [8] }, originalContentSha256: hash(base) };
  const records: any = Object.fromEntries(kinds.map(k => [k, []]));
  records.questions = [original, base, other]; records.templates = [template];
  records.exams = [{ id: 'exam-mix-a-practice', mode: 'practice', timeLimitSeconds: 5400 }];
  records.sources = [{ id: 'source-original', terms: 'retained source conditions' }];
  records.sets = [{ id: 'set-mix-a', revision: 1, subject: 'A', questionRefs: [{ questionId: 'base', revision: 1 }, { questionId: 'other', revision: 1 }], generationBindings: [{ questionRef: { questionId: 'base', revision: 1 }, templateRef: { id: template.id, revision: 1 } }] }];
  const catalog = { revision: 1, generationCoverage: 'complete', files: Object.fromEntries(kinds.map(k => [k, []])) };
  const before = { catalog, records }, after = structuredClone(before);
  for (const q of after.records.questions.slice(0, 2)) {
    q.revision++; q.detailedExplanationRef = { directory, revision: 1 };
    q.origin.changes.push({ kind: 'layout', affectsAnswer: false, summary: 'Add optional detail' }); q.review.checkedOn = '2026-11-04'; q.review.notes += ' detail reviewed';
  }
  after.records.questions[1].origin.derivedFrom[0].revision = 2;
  Object.assign(after.records.templates[0], { revision: 2, baseQuestionRef: { questionId: 'base', revision: 2 }, originalContentSha256: hash(after.records.questions[1]) });
  const set = after.records.sets[0]; set.revision++; set.questionRefs[0].revision++; set.generationBindings[0].questionRef.revision++; set.generationBindings[0].templateRef.revision++;
  const files: any = {
    ['public/' + directory + 'manifest.json']: JSON.stringify({ apiVersion: 1, files: [{ path: 'index.html' }, { path: 'engine.js' }] }),
    ['public/' + directory + 'index.html']: '<main>lesson</main>', ['public/' + directory + 'engine.js']: 'window.lesson=1;',
    [packageTest]: "import test from 'node:test';test('lesson',()=>{});", 'scripts/update-lesson-one-manifest.mjs': '// package-only support',
  };
  return { before, after, files };
}
const ownership = (v: any) => distributionOwnership(v.catalog, v.records);
function classify(f = fixture(), extra: any = {}) {
  return classifyDetailChanges({ changed: Object.keys(f.files), beforeOwnership: ownership(f.before), afterOwnership: ownership(f.after), beforeTestEntries: priorEntries, testEntries: entries, readBefore: () => null, readAfter: (file: string) => f.files[file] ? Buffer.from(f.files[file]) : null, ...extra });
}

test('detail revisions remove repeated prior answer bodies while preserving every other provenance and content field', () => {
  const f = fixture(), beforeBase = f.before.records.questions[1], afterBase = f.after.records.questions[1];
  beforeBase.origin.changes.push({ kind: 'wording', affectsAnswer: true, summary: 'initial answer', answerDetails: 'unchanged explanation' });
  afterBase.origin.changes.unshift({ kind: 'wording', affectsAnswer: true, summary: 'initial answer' });
  f.before.records.templates[0].originalContentSha256 = hash(beforeBase);
  f.after.records.templates[0].originalContentSha256 = hash(afterBase);
  assert(classify(f), 'only repeated answerDetails can be removed');
  afterBase.origin.changes[0].summary = 'changed provenance'; assert.equal(classify(f), null);
  afterBase.origin.changes[0].summary = 'initial answer'; afterBase.origin.changes[0].answerDetails = 'unchanged explanation';
  f.after.records.templates[0].originalContentSha256 = hash(afterBase); assert.equal(classify(f), null, 'an advanced edition cannot retain the old embedded body');
  delete afterBase.origin.changes[0].answerDetails; afterBase.explanation.blocks[0].text = 'changed explanation';
  f.after.records.templates[0].originalContentSha256 = hash(afterBase); assert.equal(classify(f), null, 'current explanation changes still require broader verification');
});

test('detail references, exact base hashes and a shared pool revision select only the affected package', () => {
  const f = fixture(), snapshot = JSON.stringify(f), result = classify(f)!;
  assert.equal(JSON.stringify(f), snapshot, 'classification must not change problem or saved-reference data');
  assert.equal(result.profile, 'details'); assert.deepEqual(result.scopes, []); assert.deepEqual(result.detailDirectories, [directory]);
  assert.deepEqual(result.detailQuestionIds, ['base', 'original']); assert.equal(result.changedRecords.length, 4);
  const parts = makeParts(Object.keys(entries), entries, [], false, result);
  assert.deepEqual(parts.common.files, [sharedTest]); assert.deepEqual(parts.details.files, [packageTest]);
  assert(!Object.values(parts).flatMap(p => p.files).includes(contentTest)); assert(!Object.values(parts).flatMap(p => p.files).includes(saveTest));
});
test('question text, every answer field, ordinary explanation and premises cannot be hidden by adding a detail reference', () => {
  const changes = [(q: any) => q.prompt.blocks[0].text += 'changed', (q: any) => q.correctAnswer.choiceId = 'two', (q: any) => q.choices.reverse(), (q: any) => q.explanation.blocks[0].text += 'changed', (q: any) => q.contextRefs = ['new-premise'], (q: any) => q.review.checks.answer = 'fail'];
  for (const change of changes) { const f = fixture(); change(f.after.records.questions[0]); assert.equal(classify(f), null); }
});
test('generator versions, domains, reference inputs and incorrect hashes require ordinary content verification', () => {
  for (const change of [(t: any) => t.generatorRef.version = '2.0.0', (t: any) => t.parameterDomain.maximum++, (t: any) => t.referenceParameters.values[0]--, (t: any) => t.originalContentSha256 = '0'.repeat(64)]) {
    const f = fixture(); change(f.after.records.templates[0]); assert.equal(classify(f), null);
  }
});
test('pool membership, order, exam rules, source terms and catalog semantics are never metadata-only', () => {
  const changes = [(f: any) => f.after.records.sets[0].questionRefs.reverse(), (f: any) => f.after.records.sets[0].generationBindings = [], (f: any) => f.after.records.exams[0].timeLimitSeconds++, (f: any) => f.after.records.sources[0].terms = 'changed terms', (f: any) => f.after.records.exams.push({ id: 'new-exam' }), (f: any) => f.after.catalog.generationCoverage = 'partial', (f: any) => f.after.records.questions.shift()];
  for (const change of changes) { const f = fixture(); change(f); assert.equal(classify(f), null); }
});
test('a dedicated package update without question changes selects that package while undeclared resources and shared hosts cannot narrow', () => {
  const f = fixture(); f.before = structuredClone(f.after);
  assert.equal(classify(f)?.profile, 'details');
  for (const file of ['public/' + directory + 'undeclared.js', 'public/explanations/host.html', 'src/core/detailed-explanation.ts', 'src/core/session.ts', 'src/core/storage.ts', 'src/core/answers.ts', 'src/core/generation.ts', 'package.json', 'scripts/ci/plan.mjs']) {
    assert.equal(classify(f, { changed: [...Object.keys(f.files), file] }), null, file);
  }
  const unused = fixture(); unused.files['public/' + otherDirectory + 'manifest.json'] = unused.files['public/' + directory + 'manifest.json']; assert.equal(classify(unused), null);
});
test('new detail tests can be registered but deleting, reassigning or changing unrelated test expectations cannot narrow', () => {
  assert.equal(classify()?.profile, 'details');
  for (const next of [{ ...entries, [contentTest]: { ...entries[contentTest], count: 9 } }, { ...entries, [sharedTest]: { count: 1, scopes: [] } }, { ...entries, [packageTest]: { ...detailEntry, detail: { packages: [otherDirectory], supportFiles: [] } } }])
    assert.equal(classify(fixture(), { testEntries: next }), null);
  const missing: any = { ...entries }; delete missing[saveTest]; assert.equal(classify(fixture(), { testEntries: missing }), null);
});
test('detail test declarations and literal navigation reject arbitrary support paths, hooks and missing package tests', () => {
  assert(validDetailTest(detailEntry));
  for (const support of ['src/core/generation.ts', 'scripts/ci/plan.mjs', '../outside', 'scripts/prepare-generation-data.ts']) assert(!validDetailTest({ detail: { packages: [directory], supportFiles: [support] } }));
  assert.throws(() => validateTestManifest([packageTest], { [packageTest]: { ...detailEntry, detail: { packages: [directory, directory], supportFiles: [] } } }));
  const f = fixture(), nav = 'docs/.vitepress/navigation.mjs'; f.files[nav] = "export const sidebar = [{text:'Lesson',items:[{text:'Binary',link:'/binary-explanation'}]}];";
  const before = (file: string) => file === nav ? Buffer.from('export const sidebar = [];') : null;
  assert(classify(f, { readBefore: before }));
  f.files[nav] += 'runHook();'; assert.equal(classify(f, { readBefore: before }), null);
  assert.throws(() => makeParts([sharedTest], entries, [], false, { profile: 'details', detailDirectories: [directory] }));
});
test('full and ordinary booklet selection retain every relevant content and storage test regardless of detail labels', () => {
  const files = Object.keys(entries), all = makeParts(files, entries, [], true, { profile: 'details', detailDirectories: [directory] });
  assert.deepEqual(Object.values(all).flatMap(p => p.files).sort(), files.sort());
  const scoped = makeParts(files, entries, ['2024-a']);
  assert(Object.values(scoped).flatMap(p => p.files).includes(contentTest)); assert(Object.values(scoped).flatMap(p => p.files).includes(saveTest));
  const f = fixture(); f.after.records.questions[0].prompt.blocks[0].text += 'changed';
  const ordinary = classifyScopedChanges({ changed: [], beforeOwnership: ownership(f.before), afterOwnership: ownership(f.after), testEntries: entries });
  assert.equal(ordinary.profile, 'booklets'); assert(ordinary.scopes.includes('2024-a'));
});

test('a distributed lesson reference diff narrows without replacing any other preservation or generator witnesses', () => {
  // Reconstruct a reference-only previous state from CURRENT records. No old
  // question bodies or historical repository commit are test fixtures.
  const b = readDistributionBundle(), before: any = { catalog: structuredClone(b.catalog), records: Object.fromEntries(kinds.map(k => [k, structuredClone((b as any)[k])])) }, after = structuredClone(before);
  const q = before.records.questions.find((q: any) => q.id === 'question-ipa-2024-a-3');
  const base = before.records.questions.find((q: any) => q.id === 'question-template-source-2024-a-3');
  const template = before.records.templates.find((t: any) => t.baseQuestionRef.questionId === base.id);
  // Create a new detail-only revision on top of whatever current revisions are.
  const nextQ = after.records.questions.find((v: any) => v.id === q.id), nextBase = after.records.questions.find((v: any) => v.id === base.id), nextTemplate = after.records.templates.find((v: any) => v.id === template.id);
  for (const v of [nextQ, nextBase]) { v.revision++; v.detailedExplanationRef.revision++; }
  nextBase.origin.derivedFrom.find((r: any) => r.questionId === q.id).revision++;
  nextTemplate.revision++; nextTemplate.baseQuestionRef.revision++; nextTemplate.originalContentSha256 = hash(nextBase);
  for (const set of after.records.sets) {
    let changed = false;
    for (const ref of set.questionRefs) if ([q.id, base.id].includes(ref.questionId)) { ref.revision++; changed = true; }
    for (const binding of set.generationBindings) if (binding.templateRef.id === template.id) { binding.templateRef.revision++; binding.questionRef.revision++; changed = true; }
    if (changed) set.revision++;
  }
  const manifest = JSON.parse(fs.readFileSync('scripts/ci/public-test-manifest.json', 'utf8')).files;
  const original = JSON.parse(fs.readFileSync('tests/fixtures/generator-composition-existing.json', 'utf8')), updated = structuredClone(original), row = updated.rows.find((r: any) => r.template.id === template.id);
  row.template.revision++; row.template.contentSha256 = hash(nextTemplate); row.base.revision++; row.base.contentSha256 = hash(nextBase); row.originals.find((v: any) => v.ref.questionId === q.id).ref.revision++; row.originals.find((v: any) => v.ref.questionId === q.id).contentSha256 = hash(nextQ);
  const file = 'tests/fixtures/generator-composition-existing.json';
  const classifyCurrent = () => classifyDetailChanges({ changed: [file], beforeOwnership: ownership(before), afterOwnership: ownership(after), beforeTestEntries: manifest, testEntries: manifest, readBefore: () => Buffer.from(JSON.stringify(original)), readAfter: () => Buffer.from(JSON.stringify(updated)) });
  assert.deepEqual(classifyCurrent()?.detailDirectories, [q.detailedExplanationRef.directory]);
  updated.roots[0].metadataSha256 = '0'.repeat(64); assert.equal(classifyCurrent(), null);
});

test('real Git plans and witnessed execution separate detail updates and restore content/storage verification for mixed changes', () => {
  const dir = fs.mkdtempSync(path.join(root, 'output', 'ci-detail-git-'));
  const write = (file: string, value: string) => { fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); fs.writeFileSync(path.join(dir, file), value); };
  const f = fixture(), env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GITHUB_') && !['NODE_TEST_CONTEXT', 'NODE_OPTIONS'].includes(key)));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  function distribution(snapshot: any) {
    for (const kind of kinds) { const bytes = JSON.stringify(snapshot.records[kind]); write('public/data/' + kind + '/pack.json', bytes); snapshot.catalog.files[kind] = [{ path: kind + '/pack.json', sha256: sha(bytes), recordCount: snapshot.records[kind].length }]; }
    write('public/data/catalog.json', JSON.stringify(snapshot.catalog));
  }
  try {
    write('.gitignore', '/node_modules\n/output/\n'); write('package.json', '{"type":"module","dependencies":{"typescript":"5.9.3"}}');
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
    for (const file of fs.readdirSync('scripts/ci').filter(f => f.endsWith('.mjs'))) write('scripts/ci/' + file, fs.readFileSync('scripts/ci/' + file, 'utf8'));
    write('src/core/session.ts', 'export const unchanged = 1;');
    for (const file of Object.keys(priorEntries)) write(file, "import test from 'node:test';test('probe assertion in " + file + "',()=>{});");
    write('scripts/ci/public-test-manifest.json', JSON.stringify({ version: 2, files: priorEntries })); distribution(f.before);
    git('init', '-q'); git('config', 'user.name', 'CI fixture'); git('config', 'user.email', 'ci-fixture@example.invalid'); git('add', '.'); git('commit', '-qm', 'synthetic verified baseline'); const baseCommit = git('rev-parse', 'HEAD');
    for (const [file, value] of Object.entries(f.files)) write(file, value as string);
    write('scripts/ci/public-test-manifest.json', JSON.stringify({ version: 2, files: entries })); distribution(f.after);
    const plan = (options: any = { baseCommit, combineParts: true }) => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', `import {createPlan} from './scripts/ci/plan.mjs';console.log(JSON.stringify(createPlan(${JSON.stringify(options)})));`], { cwd: dir, env, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
    const detail = plan({ baseCommit }); assert.equal(detail.profile, 'details'); assert.deepEqual(detail.selectedFiles.sort(), [sharedTest, packageTest].sort()); assert.equal(detail.expectedCount, 2);
    assert.deepEqual(detail.parts, ['common', 'details']);
    write('output/plan.json', JSON.stringify(detail));
    for (const part of detail.parts) {
      execFileSync(process.execPath, ['scripts/ci/run-part.mjs', 'output/plan.json', part, 'output/result/' + part], { cwd: dir, env, encoding: 'utf8' });
      const result = JSON.parse(fs.readFileSync(path.join(dir, 'output/result/' + part + '/result.json'), 'utf8')); assert.equal(result.proof.passed, 1);
    }
    const aggregate = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', "import fs from 'node:fs';import {aggregate} from './scripts/ci/results.mjs';const p=JSON.parse(fs.readFileSync('output/plan.json'));console.log(JSON.stringify(aggregate(p,p.parts.map(part=>JSON.parse(fs.readFileSync('output/result/'+part+'/result.json'))))));"], { cwd: dir, env, encoding: 'utf8' }));
    assert.equal(aggregate.status, 'pass');
    for (const file of ['src/core/session.ts', 'src/core/generation.ts', 'src/core/storage.ts', 'src/core/answers.ts', 'scripts/ci/scopes.mjs']) {
      const exists = fs.existsSync(path.join(dir, file)), prior = exists ? fs.readFileSync(path.join(dir, file), 'utf8') : null;
      write(file, (prior ?? '') + '\n// real executable change\n'); const mixed = plan(); assert.equal(mixed.profile, 'full', file); assert(mixed.selectedFiles.includes(contentTest)); assert(mixed.selectedFiles.includes(saveTest));
      if (prior === null) fs.unlinkSync(path.join(dir, file)); else write(file, prior);
    }
    assert.equal(plan({ forceFull: true, baseCommit }).profile, 'full'); assert.equal(plan({}).profile, 'full');
    // Once the detail version is the baseline, a question content edit remains
    // an ordinary booklet change with its generation and storage tests.
    git('add', '.'); git('commit', '-qm', 'synthetic detail update'); const nextBase = git('rev-parse', 'HEAD');
    f.after.records.questions[0].correctAnswer.choiceId = 'two'; distribution(f.after);
    const content = plan({ baseCommit: nextBase }); assert.equal(content.profile, 'booklets'); assert(content.selectedFiles.includes(contentTest)); assert(content.selectedFiles.includes(saveTest));
    // A seemingly dedicated helper may already be used by an unchanged
    // generator. Its reverse dependency must defeat the detail-only proof.
    f.after.records.questions[0].correctAnswer.choiceId = 'one'; distribution(f.after);
    write('src/core/generators/legacy-2024.ts', "import '../../../scripts/update-lesson-one-manifest.mjs';\n");
    git('add', '.'); git('commit', '-qm', 'synthetic generator dependency'); const dependencyBase = git('rev-parse', 'HEAD');
    write('scripts/update-lesson-one-manifest.mjs', '// changed support also consumed by a generator');
    const dependency = plan({ baseCommit: dependencyBase }); assert.equal(dependency.profile, 'full');
    assert(dependency.reverseDependencies.scopes.includes('2024-a')); assert(dependency.selectedFiles.includes(contentTest)); assert(dependency.selectedFiles.includes(saveTest));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
