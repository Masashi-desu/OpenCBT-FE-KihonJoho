import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2008PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2008-spring-pm-10-13';
import { legacy2008SpringPm1013Figures as figures } from '../../../src/core/generators/legacy-2008-spring-pm-10-13-figures';
import { legacy2008SpringPm1013FigureRenderers as renderers } from '../../../src/ui/Legacy2008SpringPm1013Figures';
import { independentSummary, runCasl } from '../../fixtures/legacy-2008-spring-pm-13-oracle';

const official: Record<number, string> = { 10: 'アアウウエエ', 12: 'ウイアアエイアウ', 13: 'ウウイアエア' };
const expectedCounts: Record<number, number[]> = {
  10: [4, 5, 4, 6, 4, 4], 12: [4, 5, 5, 5, 4, 4, 4, 4], 13: [6, 6, 6, 4, 6, 6],
};
const options = (body: GeneratedBody) => Object.fromEntries(body.answerParts!.map(part => {
  const contents = part.choiceIds.map(choice => {
    const block = body.choices[Number(choice.split('-').at(-1)) - 1][0];
    assert(block.type === 'paragraph' || block.type === 'code');
    return block.text;
  });
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === part.id);
  assert(answer?.kind === 'choice');
  return [part.id.slice(5), { contents, correct: part.choiceIds.indexOf(answer.choiceId) }];
}));
function programs(body: GeneratedBody, language: string) {
  return body.prompt.flatMap(block => block.type === 'code' && block.language === language ? [block.text] : []);
}
function panel(body: GeneratedBody, suffix: string) {
  for (const block of body.prompt) if (block.type === 'diagram' && block.scene.kind === 'source_figure') {
    if (!block.scene.profile.endsWith(suffix)) continue;
    const { profile, values } = block.scene;
    return figures.find(definition => definition.profile === profile)!.panel(values);
  }
  throw Error('Missing ' + suffix);
}
function withTemp(prefix: string, callback: (dir: string) => void) {
  const folder = mkdtempSync(join(tmpdir(), prefix));
  try { callback(folder); } finally { rmSync(folder, { recursive: true, force: true }); }
}
const run = (command: string, args: string[], cwd: string, timeout = 2000) =>
  spawnSync(command, args, { cwd, encoding: 'utf8', timeout, maxBuffer: 1024 * 1024 });
const exact = (values: readonly string[], test: (s: string) => boolean) => values.flatMap((option, i) => test(option) ? [i] : []);
function checkCandidates(
  body: GeneratedBody,
  passes: (chosen: Record<string, string>) => boolean,
) {
  const banks = options(body);
  const solution = Object.fromEntries(Object.entries(banks).map(([field, bank]) => [field, bank.contents[bank.correct]]));
  assert(passes(solution), '全欄の出題条件を実行できる');
  for (const [field, bank] of Object.entries(banks)) {
    assert.deepEqual(exact(bank.contents, value => value === solution[field] || passes({ ...solution, [field]: value })),
      [bank.correct], '解答欄 ' + field);
  }
}

function independentFraction(input: string, base: number) {
  const [whole, decimal = ''] = input.split('.');
  const [finite, repeat = ''] = decimal.replace('}', '').split('{');
  const asNumber = (digits: string) => [...digits].reverse().reduce((sum, digit, place) =>
    sum + BigInt(digit) * BigInt(base) ** BigInt(place), 0n);
  const integerDenominator = BigInt(base) ** BigInt(finite.length);
  const repeatedDenominator = repeat ? BigInt(base) ** BigInt(repeat.length) - 1n : 1n;
  const denominator = integerDenominator * repeatedDenominator;
  const numerator = asNumber(whole) * denominator + asNumber(finite) * repeatedDenominator + asNumber(repeat);
  const recurse = (x: bigint, y: bigint): bigint => y === 0n ? x : recurse(y, x % y);
  const multiplier = recurse(numerator, denominator);
  return '= ' + (numerator / multiplier) + '/' + (denominator / multiplier);
}

function checkC(body: GeneratedBody, directory: string) {
  const prompt = body.prompt.find(block => block.type === 'table');
  assert(prompt?.type === 'table');
  const c = programs(body, 'c').find(source => source.startsWith('#include'))!;
  assert.match(c, /^void tofraction\(char \*str\)\{\n    long numerator/m);
  const base = Number(/long power(\d+)\(int\);/.exec(c)?.[1]);
  const examples = prompt.rows.map(([input, answer]) => {
    assert.equal(answer, independentFraction(input, base));
    return input;
  });
  const figure = panel(body, 'fraction-digits');
  assert(figure.kind === 'fraction');
  const periodic = examples.at(-1)!;
  const [, prefix, repeat] = /\.(\d+)\{(\d+)\}/.exec(periodic)!;
  assert.equal(figure.digits, 'X＝0.' + prefix + repeat.repeat(2) + '…');
  assert.deepEqual([figure.n, figure.k], [prefix.length, repeat.length]);
  const inputs = [...examples, '1', '10', '1.0', '0.01', '0.{1}', '0.0{1}', '1.1{20}', '10.001{21}', '101010101', '0.00000001'];
  const expected = inputs.map(input => independentFraction(input, base)).join('\n') + '\n';
  const nonPie = process.platform === 'linux' ? ['-fno-pie', '-no-pie'] : [];
  const runProgram = (chosen: Record<string, string>) => {
    const source = c.replace(/［([a-f])］/g, (_, symbol: string) => chosen[symbol]);
    const entrypoint = `
      #include <string.h>
      long power${base}(int n) {long x=1; while(n-- > 0) x*=${base}; return x;}
      long gcd(long a, long b) { while(b) { const long next = a%b; a=b; b=next; } return a; }
      int main(int argc, char **argv) {
        for(int i=1; i<argc; ++i) {
          char str[16]={0};
          strcpy(str, argv[i]);
          tofraction(str);
        }
        return 0;
      }`;
    writeFileSync(join(directory, 'sample.c'), source + entrypoint);
    const compiled = run('cc', ['-std=c11', '-O0', '-Werror', '-fsanitize=address,undefined', '-fno-sanitize-recover=all', ...nonPie, 'sample.c', '-o', 'sample'], directory, 12000);
    if (compiled.status !== 0) {
      assert(!compiled.error, compiled.error?.message);
      return false;
    }
    const execution = run('./sample', inputs, directory);
    return execution.status === 0 && execution.stdout === expected;
  };
  checkCandidates(body, runProgram);
}

function checkJava(body: GeneratedBody, directory: string) {
  const blocks = programs(body, 'java');
  assert.equal(blocks.length, 8);
  assert.match(blocks[3], /\n {27}\+ value \+ /);
  const properties = [...blocks[1].matchAll(/writer\.write\("([a-z]+)", "([a-z0-9]+)"\);/g)].map(match => [match[1], match[2]]);
  const entry = /<([a-z]+) key/.exec(blocks[3])![1];
  const wrap = /println\("<([a-z]+)>"\)/.exec(blocks[3])![1];
  const pairs = [...blocks[6].matchAll(/\{"([a-z0-9]+)", "([a-z0-9]+)"\}/g)].map(match => [match[1], match[2]]);
  const reverse = body.prompt.some(block => block.type === 'paragraph' && block.text.includes('値，キーの順'));
  const ordered = reverse ? pairs.map(([value, key]) => [key, value]) : pairs;
  const expected1 = properties.map(([key, value]) => key + '=' + value).join('\n');
  const tags = ordered.map(([key, value]) => `<${entry} key="${key}">${value}</${entry}>`);
  const expected2 = [ordered.map(pair => pair.join('=')).join('\n'), '---------------', `<${wrap}>`, ...tags, `</${wrap}>`].join('\n');
  const expectedVisuals = [['test1-output', expected1], ['entry-format', `<${entry} key="キー">値</${entry}>`], ['test2-output', expected2]];
  for (const [suffix, expected] of expectedVisuals) {
    const value = panel(body, suffix);
    assert(value.kind === 'output');
    assert.equal(value.text, expected);
  }
  const instruction = body.prompt.find(block => block.type === 'paragraph' && block.text.startsWith('設問2'));
  assert(instruction?.type === 'paragraph');
  const sampleComment = /与えられた文字列が“([^”]+)”/.exec(instruction.text)![1];
  for (const [suffix, expected] of [['properties-comment', '# ' + sampleComment], ['tag-comment', '<!-- ' + sampleComment + ' -->']]) {
    const value = panel(body, suffix);
    assert(value.kind === 'output');
    assert.equal(value.text, expected);
  }
  const insertions = panel(body, 'code-insertion');
  assert(insertions.kind === 'tables');
  const targets = ['KeyValueWriter', 'ToTags', 'KeyValueWriterAdapter', 'ToProperties'];
  const sampleCases = [sampleComment, '', 'a-b', '  leading and trailing  '];
  const checkClassOutput = sampleCases.flatMap(value => ['# ' + value, '<!-- ' + value + ' -->']).join('\n') + '\n';
  const sampleLiterals = sampleCases.map(value => JSON.stringify(value)).join(', ');
  const originalDir = join(directory, 'original');
  mkdirSync(originalDir, { recursive: true });
  writeFileSync(join(originalDir, 'ToProperties.java'), blocks[0]);
  writeFileSync(join(originalDir, 'Test1.java'), blocks[1]);
  const originalCompiled = run('javac', ['--release', '8', 'ToProperties.java', 'Test1.java'], originalDir, 12000);
  assert.equal(originalCompiled.status, 0, originalCompiled.stderr);
  assert.equal(run('java', ['Test1'], originalDir).stdout, expected1 + '\n');
  const verifyRoles = (answers: Record<string, string>) => {
    const fragments: Record<string, string> = Object.fromEntries(targets.map((name, index) => [name,
      [blocks[2], blocks[3], blocks[4], blocks[5]][index]
        .replace(/［([ab])］/g, (_, symbol: string) => answers[symbol])]));
    const test2 = (blocks[6] + '\n' + blocks[7]).replace(/［([cd])］/g, (_, symbol: string) => answers[symbol]);
    const stem = join(directory, 'classes');
    rmSync(stem, { recursive: true, force: true });
    mkdirSync(stem);
    const sourcePaths = Object.entries(fragments).map(([name, text]) => {
      const methods = insertions.tables[0].rows.flatMap(([id, code]) =>
        Number(answers[id[1]].at(-1)) === targets.indexOf(name) + 1 ? [code] : []);
      const path = name + '.java';
      const body = text.slice(0, text.lastIndexOf('}'));
      writeFileSync(join(stem, path), body + methods.join('\n') + '\n}');
      return path;
    });
    writeFileSync(join(stem, 'Test2.java'), test2);
    writeFileSync(join(stem, 'Comments.java'), `public class Comments {
      public static void main(String[] args) {
        for(String sample: new String[]{${sampleLiterals}}) {
          for(KeyValueWriter writer: new KeyValueWriter[]{new ToProperties(), new ToTags(), new KeyValueWriterAdapter()}) {
            writer.writeComment(sample);
          }
        }
      }
    }`);
    const compiled = run('javac', ['--release', '8', ...sourcePaths, 'Test2.java', 'Comments.java'], stem, 12000);
    assert(!compiled.error, compiled.error?.message);
    if (compiled.status !== 0) return false;
    const trial = run('java', ['Test2'], stem), comments = run('java', ['Comments'], stem);
    return trial.status === 0 && comments.status === 0 && trial.stdout === expected2 + '\n' && comments.stdout === checkClassOutput;
  };
  checkCandidates(body, verifyRoles);
}

function checkCasl(body: GeneratedBody) {
  const sources = programs(body, 'casl2');
  assert.equal(sources.length, 4);
  const base = Number(/LD    GR1,=(\d+)\s+; 除数/.exec(sources[3])![1]);
  const constraint = body.prompt.find(block => block.type === 'paragraph' && block.text.startsWith('① 0≦'));
  assert(constraint?.type === 'paragraph');
  const max = Number(/0≦入力レコードの数値≦(\d+)/.exec(constraint.text)![1]);
  const input = panel(body, 'input-file'), output = panel(body, 'sample-output');
  assert(input.kind === 'records' && output.kind === 'records');
  assert.deepEqual(output.outputs, independentSummary(input.inputs, base));
  const label = (value: number) => value.toString(base);
  const samples = [
    input.inputs, ['0'], ['1'], [label(max)], ['00', '000', '01'], ['1', '2'],
    [label(base - 1), label(base), label(Math.min(max, base * base))],
    ['0', label(max), label(max - 1), label(base - 1)],
    Array.from({ length: 100 }, (_, i) => label(i % (max + 1))),
  ];
  checkCandidates(body, chosen => {
    try {
      return samples.every(records => {
        const result = runCasl(sources, chosen, records);
        return result.join('\n') === independentSummary(records, base).join('\n');
      });
    } catch (error) {
      assert(error instanceof assert.AssertionError, String(error));
      return false;
    }
  });
  const chosen = Object.fromEntries(Object.entries(options(body)).map(([id, bank]) => [id, bank.contents[bank.correct]]));
  for (let value = 0; value <= max; value++) {
    for (const input of [[label(value)], ['0', label(value)], [label(max), label(value)]])
      assert.deepEqual(runCasl(sources, chosen, input), independentSummary(input, base));
  }
}

test('問10・12・13は原問番号、全解答欄、選択肢順、頁ごとの読み上げと媒体構成を保持する', () => {
  for (const { number, definition, original, originalPageAlt } of drafts) {
    const source = original(), reference = definition.build([0]);
    const groups = Object.values(options(source));
    assert.equal(groups.map(bank => 'アイウエオカ'[bank.correct]).join(''), official[number]);
    assert.deepEqual(groups.map(bank => bank.contents.length), expectedCounts[number]);
    assert.equal(definition.reference[0], 0);
    const alt = Object.values(originalPageAlt());
    assert(alt.every(text => [...text].length > 100 && [...text].length <= 2000));
    for (const index of [0, 1, 2, 3]) {
      const body = definition.build([index]);
      assert.deepEqual(body.prompt.map(block => block.type), reference.prompt.map(block => block.type));
      assert.deepEqual(Object.values(options(body)).map(bank => bank.contents.length), expectedCounts[number]);
      assert.deepEqual(body.answerParts, reference.answerParts);
      assert(body.explanation.length > 150);
    }
    assert(new Set([0, 1, 2, 3].map(index => JSON.stringify(definition.build([index]).prompt))).size === 4);
    for (const values of [[], [4], [-1], [0.5], [0, 1], Array<number>(1)])
      assert.throws(() => definition.build(values), /範囲外/);
  }
});

test('問10の全条件・全候補をC11と独立有理数計算で照合する', () => {
  const definition = drafts[0].definition;
  withTemp('fe-2008-spring-pm-10-', directory => {
    for (let index = 0; index <= 3; index++) checkC(definition.build([index]), directory);
  });
});

test('問12の全条件・全候補をJDKと独立した出力仕様で照合する', () => {
  const definition = drafts[1].definition;
  withTemp('fe-2008-spring-pm-12-', directory => {
    for (let index = 0; index <= 3; index++) checkJava(definition.build([index]), directory);
  });
});

test('問13は4副プログラムの全欄・全候補を独立命令実行で検算し、全入力値の境界を検証する', () => {
  const definition = drafts[2].definition;
  for (let index = 0; index <= 3; index++) checkCasl(definition.build([index]));
});

test('問10・12・13の図表全36状態で視覚構造と代替説明が同じ入力を表示する', () => {
  for (const figure of figures) {
    const renderer = renderers.find(row => row.profile === figure.profile);
    assert(renderer);
    for (let index = 0; index <= 3; index++) {
      const markup = renderToStaticMarkup(createElement(renderer.component, { values: [index], caption: '検査用の題名' }));
      assert.match(markup, /tabindex="0"/);
      assert(markup.includes(figure.profile));
      assert.match(markup, /<svg[^>]*role="img"|<table/);
      assert(markup.includes(renderToStaticMarkup(createElement('span', {}, figure.alt([index]))).slice(6, -7)));
    }
  }
});
