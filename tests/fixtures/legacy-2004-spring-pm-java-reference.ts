import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type JavaInput = { listing: string[]; expected: string[]; offset: number; key: Record<string, string>; options: Record<string, string[]> };

const char = (character: string) => '(char) ' + character.charCodeAt(0);
const javaRow = (text: string | null) => text === null ? 'null' : 'new char[]{' + text.split('').map(char).join(',') + '}';
const javaString = (text: string) => 'new String(' + javaRow(text) + ')';
const expectedCodes = (text: string) => 'new int[]{' + text.split('').map(value => value.charCodeAt(0)).join(',') + '}';

function harness(offset: number, displayed: string[]) {
  const textProbes = ['', 'A', 'JKL', 'H15語Z', '前😀後', 'A\0Z', 'A\ud800\udc00Z'];
  const arrayProbes: Array<Array<string | null>> = [
    [], [null], ['', null, ''], ['ABC', null, '', 'abcdef', 'P', '1234', null],
    ['😀é', null, 'ABCD', 'YあΩZ'], ['00000000', '11111111', 'ZZZZZZ'],
  ];
  const strings = textProbes.map(text => 'check(CharIteratorFactory.getCharIterator(' + javaString(text) + '),' +
    expectedCodes(text.slice(offset)) + ');');
  const arrays = arrayProbes.map(array => 'check(CharIteratorFactory.getCharIterator(new char[][]{' + array.map(javaRow).join(',') +
    '}),' + expectedCodes(array.map(text => text?.slice(offset) ?? '').join('')) + ');');
  return `import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.NoSuchElementException;

public class Check {
    static void exhausted(CharIterator it) {
        for (int i = 0; i < 2; i++) {
            if (it.hasNext()) throw new AssertionError("unexpected remaining value");
            try {
                it.next();
                throw new AssertionError("missing exhaustion exception");
            } catch (NoSuchElementException correct) {}
        }
    }

    static void check(CharIterator it, int[] expected) {
        for (int i = 0; i < expected.length; i++) {
            if (i % 2 == 0 && (!it.hasNext() || !it.hasNext()))
                throw new AssertionError("repeated probing");
            if (it.next() != expected[i]) throw new AssertionError("wrong sequence");
        }
        exhausted(it);
    }

    static void rejectNull(boolean array) {
        try {
            if (array) CharIteratorFactory.getCharIterator((char[][]) null);
            else CharIteratorFactory.getCharIterator((String) null);
            throw new AssertionError("null accepted");
        } catch (NullPointerException correct) {}
    }

    public static void run() {
        rejectNull(false);
        rejectNull(true);
        ${strings.concat(arrays).join('\n        ')}
        ByteArrayOutputStream saved = new ByteArrayOutputStream();
        PrintStream previous = System.out;
        try {
            System.setOut(new PrintStream(saved));
            CharIteratorTest.main(new String[]{});
        } finally {
            System.setOut(previous);
        }
        String[] lines = saved.toString().split("\\r?\\n");
        if (lines.length != 2 || !lines[0].trim().equals(${JSON.stringify(displayed[0])}) ||
                !lines[1].trim().equals(${JSON.stringify(displayed[1])}))
            throw new AssertionError("displayed example");
    }
}`;
}

export function verifyJavaMatrix(input: JavaInput[]) {
  const directory = mkdtempSync(join(tmpdir(), 'fe-2004s-iterator-'));
  const recursive = { a: 'getCharIterator((String) data)', b: 'getCharIterator((char[][]) data)' };
  const types = ['a', 'b'] as const;
  const files: string[] = [];
  const invalidFiles: string[] = [];
  const preferred: boolean[] = [];
  const externalArgs = ['--release', '8', '-Xlint:-options', '-J-Duser.language=en', '-J-Duser.country=US'];
  try {
    function save(packageName: string, example: JavaInput, answers: Record<string, string>) {
      const [intf, factory, methods, demo] = example.listing;
      const fill = (code: string) => code.replace(/\[([a-f])\]/g, (_, name: string) => answers[name]);
      const completedFactory = fill(factory + '\n' + methods);
      const safeBody = answers.e === example.key.e ? completedFactory : completedFactory.replace(
        'for (; index1 < data.length; index1++) {',
        'int probe = 0;\n        for (; index1 < data.length; index1++) {\n' +
        '            if (++probe > data.length + 2) throw new IllegalStateException("index did not progress");');
      const dir = join(directory, packageName);
      mkdirSync(dir);
      return Object.entries({
        CharIterator: intf, CharIteratorFactory: safeBody, CharIteratorTest: demo,
        Check: harness(example.offset, example.expected),
      }).map(([label, java]) => {
        const file = join(dir, label + '.java');
        writeFileSync(file, 'package ' + packageName + ';\n' + java);
        return file;
      });
    }
    let negatives = 0;
    for (const name of types) {
      for (const choice of input[0].options[name]) {
        if (choice === input[0].key[name] || choice === recursive[name]) continue;
        invalidFiles.push(...save('unfit' + negatives++, input[0], { ...input[0].key, [name]: choice }));
      }
    }
    const compileInvalid = spawnSync('javac', [...externalArgs, '-Xmaxerrs', '100', ...invalidFiles], { encoding: 'utf8', timeout: 40000 });
    assert.equal(compileInvalid.status, 1, compileInvalid.stderr);
    assert.match(compileInvalid.stderr, /incompatible types|cannot be applied/);
    for (let i = 0; i < negatives; i++)
      assert.match(compileInvalid.stderr, new RegExp('unfit' + i + '[/\\\\]CharIteratorFactory\\.java'));
    for (const example of input) {
      for (const name of types) {
        assert.deepEqual(example.options[name], input[0].options[name]);
        assert(example.options[name].includes(recursive[name]));
        files.push(...save('fit' + preferred.length, example, { ...example.key, [name]: recursive[name] }));
        preferred.push(false);
      }
      for (const name of ['c', 'd', 'e', 'f']) {
        for (const choice of example.options[name]) {
          files.push(...save('fit' + preferred.length, example, { ...example.key, [name]: choice }));
          preferred.push(choice === example.key[name]);
        }
      }
    }
    const launcher = join(directory, 'Launcher.java');
    writeFileSync(launcher, `public class Launcher {
    public static void main(String[] args) throws Exception {
        for (int i = 0; i < ${preferred.length}; i++) {
            try {
                Class.forName("fit" + i + ".Check").getMethod("run").invoke(null);
                System.out.println("OK");
            } catch (java.lang.reflect.InvocationTargetException expected) {
                System.out.println("REJECT");
            }
        }
    }
}`);
    const compiled = spawnSync('javac', [...externalArgs, '-d', directory, launcher, ...files], { encoding: 'utf8', timeout: 50000 });
    assert.equal(compiled.status, 0, compiled.stderr);
    const run = spawnSync('java', ['-classpath', directory, 'Launcher'], { encoding: 'utf8', timeout: 18000 });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(run.stdout.trim().split('\n'), preferred.map(pass => pass ? 'OK' : 'REJECT'));
    return { typeCandidates: negatives, runtimeCandidates: preferred.length };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
