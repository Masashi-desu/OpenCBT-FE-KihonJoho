import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs'; import path from 'node:path'; import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { legacy2019AutumnNotifierDefinitions as defs } from '../src/core/generators/legacy-2019-autumn-pm11';

const output = fs.mkdtempSync(path.join(tmpdir(), 'legacy-2019-autumn-java-'));
const names = ['NotificationListener', 'MobileDevice', 'Notifier', 'Tester'];
const key = { a: 'INSTANCE', b: 'user, devices', c: 'device, messageList', d: 'throws', e: 'name' };
const mapProbe = fs.readFileSync(new URL('./fixtures/legacy-2019-autumn/PeerProbe.java', import.meta.url), 'utf8');
const outputProbe = fs.readFileSync(new URL('./fixtures/legacy-2019-autumn/OutputProbe.java', import.meta.url), 'utf8');
const execute = (command: string, args: string[], cwd: string, timeout = 15000) => {
  const r = spawnSync(command, args, { cwd, encoding: 'utf8', timeout, maxBuffer: 4 * 1024 * 1024 });
  assert(!r.error, r.error?.message); return r;
};
function programs(values: number[], override: Partial<typeof key> = {}) {
  const body = defs[0].build(values), fixed = { ...key, ...override };
  return body.prompt.filter(b => b.type === 'code' && b.language === 'java').slice(0, 4).map(b => {
    assert(b.type === 'code'); return b.text.replace(/\[([a-e])\]/g, (_, slot: keyof typeof key) => fixed[slot]);
  });
}

test('Q11 all24 actual displayed programs compile Java8 and satisfy independent Map plus real Tester worker/output probes', () => {
  const files: string[] = [], cases: { values: number[]; pkg: string }[] = [];
  for (let retain = 0; retain < 2; retain++) for (let batch = 0; batch < 4; batch++) for (let mapping = 0; mapping < 3; mapping++) {
    const values = [retain, batch, mapping], pkg = `case_${retain}_${batch}_${mapping}`, dir = path.join(output, pkg); fs.mkdirSync(dir);
    const source = [...programs(values), mapProbe, outputProbe], classes = [...names, 'PeerProbe', 'OutputProbe'];
    source.forEach((text, i) => { const file = path.join(dir, classes[i] + '.java'); fs.writeFileSync(file, `package ${pkg};\n` + text); files.push(file); });
    cases.push({ values, pkg });
  }
  const compile = execute('javac', ['-proc:none', '--release', '8', '-encoding', 'UTF-8', '-d', output, ...files], output, 30000); assert.equal(compile.status, 0, compile.stderr);
  for (const c of cases) {
    const map = execute('java', ['-cp', output, c.pkg + '.PeerProbe', ...c.values.map(String)], output); assert.equal(map.status, 0, map.stderr); assert.equal(JSON.parse(map.stdout).status, 'pass');
    const observed = execute('java', ['-cp', output, c.pkg + '.OutputProbe', ...c.values.map(String)], output); assert.equal(observed.status, 0, observed.stderr); assert(observed.stdout.includes('PROBE_PASS'));
    if (c.values[1] === 3) {
      const sample = execute('java', ['-cp', output, c.pkg + '.Tester'], output); assert.equal(sample.status, 0, sample.stderr);
      const notifications = sample.stdout.trim().split(/\r?\n/).filter(line => !line.startsWith('Terminating '));
      const devices = c.values[2] === 0 ? ['phone', 'tablet'] : c.values[2] === 1 ? ['phone'] : ['tablet'];
      for (const line of notifications) assert(devices.some(device => line.startsWith(device + ': [')), line);
      assert.equal(sample.stdout.trim().split(/\r?\n/).filter(line => line.startsWith('Terminating ')).length, 2);
    }
  }
  assert.equal(cases.length, 24);
});

function compileCase(id: string, source: string[]) {
  const dir = path.join(output, id); fs.mkdirSync(dir); fs.mkdirSync(path.join(dir, 'classes'));
  [...source, mapProbe, outputProbe].forEach((text, i) => fs.writeFileSync(path.join(dir, [...names, 'PeerProbe', 'OutputProbe'][i] + '.java'), text));
  const result = execute('javac', ['-proc:none', '--release', '8', '-encoding', 'UTF-8', '-d', 'classes', ...names.map(n => n + '.java'), 'PeerProbe.java', 'OutputProbe.java'], dir, 30000);
  return { dir, result };
}

test('Q11 every25 wrong source choice has a compiler or independent actual-runtime counterexample', () => {
  const b = defs[0].build([0, 0, 0]), correctIndices = [1, 4, 1, 4, 2]; let count = 0;
  for (let part = 0; part < 5; part++) for (let choice = 0; choice < 6; choice++) {
    if (choice === correctIndices[part]) continue;
    const id = b.answerParts![part].choiceIds[choice], block = b.choices[Number(id.split('-').at(-1)) - 1][0]; assert(block.type === 'paragraph');
    const c = compileCase(`wrong_${part}_${choice}`, programs([0, 0, 0], { ['abcde'[part]]: block.text }));
    if (c.result.status === 0) {
      if (part === 4) {
        const run = execute('java', ['-cp', 'classes', 'Tester'], c.dir); assert.equal(run.status, 0, run.stderr);
        const lines = run.stdout.split(/\r?\n/).filter(line => line.includes(': [')); assert(lines.length > 0); assert(lines.some(line => !line.startsWith('phone: [') && !line.startsWith('tablet: [')));
      } else {
        const run = execute('java', ['-cp', 'classes', 'PeerProbe', '0', '0', '0'], c.dir); assert.notEqual(run.status, 0, `wrong option ${part}/${choice} passed`);
      }
    }
    count++;
  }
  assert.equal(count, 25);
});

test('Q11 colon-without-space mutation is rejected by independent real output expectation', () => {
  const code = programs([0, 0, 0]); assert(code[3].includes('System.out.println(name + ": " + messageList)'));
  code[3] = code[3].replace('name + ": " + messageList', 'name + ":" + messageList');
  const c = compileCase('wrong_separator', code); assert.equal(c.result.status, 0, c.result.stderr);
  const run = execute('java', ['-cp', 'classes', 'OutputProbe', '0', '0', '0'], c.dir); assert.notEqual(run.status, 0); assert(run.stderr.includes('notification format mismatch'));
});
