import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2005Pm10To13Specs as specs } from '../../../scripts/legacy-2005-spring-pm-10-13-specs';
import { legacy2005SpringPm1013Figures as figures } from '../../../src/core/generators/legacy-2005-spring-pm-10-13-figures';
import { legacy2005SpringPm1013FigureRenderers as renderers } from '../../../src/ui/Legacy2005SpringPm1013Figures';
import { makeConversionMachine, referenceNumber } from '../../fixtures/legacy-2005-spring-pm-casl-reference';

const kana = 'アイウエオカキクケコ';
const keys = (body: GeneratedBody) => body.partAnswers!.map(answer => {
  assert(answer.kind === 'choice');
  const part = body.answerParts!.find(candidate => candidate.id === answer.partId)!;
  return kana[part.choiceIds.indexOf(answer.choiceId)];
}).join('');
const choices = (body: GeneratedBody, name: string) => {
  const part = body.answerParts!.find(candidate => candidate.id === 'part-' + name)!;
  return part.choiceIds.map(id => {
    const value = body.choices[Number(id.split('-').at(-1)) - 1][0];
    assert(value.type === 'paragraph' || value.type === 'code');
    return value.text;
  });
};
const selected = (body: GeneratedBody, name: string) =>
  choices(body, name)[kana.indexOf(keys(body)[body.answerParts!.findIndex(row => row.id === 'part-' + name)])];
const programText = (body: GeneratedBody, language: string) =>
  body.prompt.flatMap(block => block.type === 'code' && block.language === language ? [block.text] : []);
const cases = (number: number) => {
  const spec = specs.find(spec => spec.number === number)!;
  return [spec.original, ...[0, 1, 2, 3].map(index => spec.definition.build([index]))];
};
function expectUnique(body: GeneratedBody, blank: string, good: (option: string) => boolean) {
  assert.deepEqual(choices(body, blank).filter(good), [selected(body, blank)], blank);
}

test('問12〜13の原題ページ、原解答群13欄、各4条件の本文と解答群を照合する', () => {
  const source = [[50, 51, 52, 53, 54, 55], [56, 57, 58, 59, 60]];
  const counts = [[5, 5, 5, 10, 10, 10], [6, 8, 7, 5, 7, 5, 5]];
  const originalKeys = ['オウオアエコ', 'オイカエエエウ'];
  assert.deepEqual(specs.map(spec => spec.number), [12, 13]);
  specs.forEach((spec, i) => {
    assert.deepEqual(spec.pages, source[i]);
    assert.equal(keys(spec.original), originalKeys[i]);
    assert.equal(spec.definition.sourceAnswer, originalKeys[i]);
    const bodies = cases(spec.number);
    assert.equal(new Set(bodies.slice(1).map(body => JSON.stringify(body.prompt))).size, 4);
    assert.equal(new Set(bodies.slice(1).map(body => body.explanation)).size, 4);
    for (const body of bodies)
      assert.deepEqual(body.answerParts!.map(part => new Set(choices(body, part.id.slice(5))).size), counts[i]);
    for (const values of [[], [-1], [0, 1], [0.5], [4]]) assert.throws(() => spec.definition.build(values));
  });
});

test('問13: JIS表を除外した参照資料と、図のtitle・descおよび4条件の数字列を表示する', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const body of cases(13)) {
    const [appendix, characterNotes] = body.contexts!;
    assert.deepEqual(appendix.blocks.map(block => block.type === 'image' ? block.assetId : ''), [61, 62, 63, 64, 65, 66].map(
      page => 'asset-ipa-2005h17h-fe-pm-page-0' + page + (page === 63 ? '-casl-excerpt' : '')));
    assert.equal(characterNotes.title, 'この設問で使う文字の比較と変換');
    assert.equal(characterNotes.presentation, 'text');
    assert(characterNotes.blocks.every(item => item.type === 'paragraph'));
    const escape = (value: string) => value.replaceAll("'", '&#x27;');
    const drawings = body.prompt.filter(block => block.type === 'diagram');
    assert.equal(drawings.length, 2);
    for (const drawing of drawings) {
      assert(drawing.scene.kind === 'source_figure');
      const { profile, values } = drawing.scene;
      const renderer = renderers.find(renderer => renderer.profile === profile)!;
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: drawing.caption, values }));
      assert(markup.includes('role="img"') && markup.includes('aria-labelledby=') && markup.includes('aria-describedby='));
      assert(markup.includes('>' + drawing.caption + '</title>'));
      assert(markup.includes('>' + escape(drawing.alt) + '</desc>'));
    }
  }
});

function referenceKeys(input: string) {
  // The in-progress entry is a decimal string; arithmetic is modelled as BigInt and narrowed to int.
  const out: string[] = [];
  let entry = '', saved = 0n, pending = '';
  const i32 = (value: bigint) => BigInt.asIntN(32, value);
  for (const key of input) {
    if (key === 'C') {
      [entry, saved, pending] = ['', 0n, ''];
      out.push('0');
    } else if (/^[0-9]$/.test(key)) {
      if (pending === '=') [entry, pending] = ['', ''];
      entry += key;
      out.push(String(i32(BigInt(entry))));
    } else if ('+-*/='.includes(key)) {
      const value = i32(BigInt(entry || '0'));
      if (pending === '/' && value === 0n) {
        out.push('Error');
        [entry, saved, pending] = ['', 0n, ''];
        continue;
      }
      const evaluated: bigint = pending === '+' ? saved + value : pending === '-' ? saved - value :
        pending === '*' ? saved * value : pending === '/' ? saved / value : value;
      saved = i32(evaluated);
      out.push(String(saved));
      [entry, pending] = [key === '=' ? String(saved) : '', key];
    }
  }
  return out;
}

function calcFiles(body: GeneratedBody) {
  const [event, output, first, ...tail] = programText(body, 'java');
  return { CalculatorEvent: event, CalculatorOutput: output,
    Calculator: [first, ...tail.slice(0, -1)].join('\n\n'), CalculatorTest: tail.at(-1)! };
}

const harness = `public class CalculatorHarness {
  public static void main(String[] inputs) {
    for (String input: inputs) {
      System.out.println(">>> " + input);
      CalculatorTest.main(new String[]{input});
    }
  }
}`;
function compiledCalculator(body: GeneratedBody, testInputs: string[], mutation: Record<string, string> = {}) {
  const folder = mkdtempSync(join(tmpdir(), 'opencbt-2005-spring-java-'));
  try {
    const files = { ...calcFiles(body), CalculatorHarness: harness };
    for (const [name, text] of Object.entries(files)) {
      const filled = text.replace(/\[([abc])\]/g, (_, blank: string) => mutation[blank] ?? selected(body, blank));
      writeFileSync(join(folder, name + '.java'), filled);
    }
    const build = spawnSync('javac', ['--release', '8', ...Object.keys(files).map(name => name + '.java')], { cwd: folder, encoding: 'utf8', timeout: 20000 });
    assert.ifError(build.error);
    if (build.status !== 0) return { valid: false, output: [], diagnostics: build.stderr };
    const result = spawnSync('java', ['-cp', folder, 'CalculatorHarness', ...testInputs], { cwd: folder, encoding: 'utf8', timeout: 20000 });
    assert.ifError(result.error);
    return { valid: result.status === 0, output: result.stdout.trimEnd().split('\n'), diagnostics: result.stderr };
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
const expectedOutput = (inputs: string[]) => inputs.flatMap(input => ['>>> ' + input, ...referenceKeys(input)]);

test('問12: Java 8互換で原題・4条件のプログラムを実行し、全出力と全数値候補を照合する', () => {
  for (const body of cases(12)) {
    const data = body.prompt.find(block => block.type === 'table' && block.caption === '文字列と最後の出力');
    assert(data?.type === 'table');
    const testInputs = data.rows.map(([sequence]) => sequence);
    const example = body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n').match(/文字列“([^”]+)”は，電卓キー/)![1];
    const extra = ['C', '0', '2=3', '2=*4=', '5-8=', '8/3=', '1/0=7', '3+2c?q=', '2147483647+1=', '2147483648/1=', '4294967296+1=', '213*513='];
    const inputs = [example, ...testInputs, ...extra];
    const results = compiledCalculator(body, inputs);
    assert(results.valid, results.diagnostics);
    assert.deepEqual(results.output, expectedOutput(inputs));
    assert.deepEqual(programText(body, 'text'), [referenceKeys(example).join('\n')]);
    assert.equal(data.rows[0][1], referenceKeys(data.rows[0][0]).at(-1));
    for (const [i, blank] of [...'def'].entries()) {
      const expected = referenceKeys(testInputs[i + 1]).at(-1);
      expectUnique(body, blank, choice => choice === expected);
      assert(body.explanation.includes(testInputs[i + 1] + ' が ' + expected));
    }
    const numeric = choices(body, 'd').slice(0, 8).map(Number);
    assert.deepEqual(numeric, [...numeric].sort((a, b) => a - b));
  }
});

test('問12: コンストラクタ、匿名クラス、数字イベントの全候補をコンパイル・実行して棄却する', () => {
  const body = specs[0].original, inputs = ['C5+4=', '09876C123=', '0+7=', '6/0=C2'];
  const expected = expectedOutput(inputs);
  for (const blank of 'abc') {
    expectUnique(body, blank, option => {
      const trial = compiledCalculator(body, inputs, { [blank]: option });
      return trial.valid && trial.output.length === expected.length && expected.every((line, i) => trial.output[i] === line);
    });
  }
});

function machine(body: GeneratedBody, override: Record<string, string> = {}, optimize = false) {
  const [scanner, converter] = programText(body, 'casl2');
  const commands = Object.fromEntries([... 'abc'].map(blank => [blank, override[blank] ?? selected(body, blank)]));
  return makeConversionMachine(scanner, converter, commands, optimize);
}

test('問13: 実際のCASL II掲載命令を実行し、範囲境界・空白・負符号・復元を独立した十進変換と照合する', () => {
  const inputs = [
    null, '', ' ', '- ', '+ 3', '54-0', 'A0', ' - 0 0 ', ' - 1 9 ', ' 8 1 9 2 ', '-1',
    '-32767', '-32768', '32767', '32768', '81920', '65535', '65536', '99999',
    ...Array.from({ length: 25 }, (_, i) => String(32754 + i)),
    ...Array.from({ length: 25 }, (_, i) => String(-32754 - i)),
    '0'.repeat(255) + '7', '-0' + ' '.repeat(254), ' '.repeat(256) + '8', '0'.repeat(256) + '8',
  ];
  const direct = ['0', '1', '7890', '9876', '-100', '-32767', '32767', '32768', '-32768', '65536', '99999'];
  for (const caseBody of cases(13)) {
    const convert = machine(caseBody);
    for (const digitZero of [48, 100, 214]) {
      for (const input of inputs) {
        const actual = convert(input, 'read', digitZero);
        assert.equal(actual.value, referenceNumber(input), String(input));
        assert(actual.registersRestored);
      }
      for (const input of direct) {
        const actual = convert(input, 'convert', digitZero);
        assert.equal(actual.value, referenceNumber(input), input);
        assert(actual.registersRestored);
      }
    }
  }
});

test('問13: a〜cの全命令候補を実行し、表示された変換契約に一致する各一肢を求める', () => {
  const body = specs[1].original;
  const inputs = ['0', '1', '2', '4 5', '-1', '-32767', '32767', '32768', '-32768', '42', '  - 98 ', '9-3', 'A4', ' - '];
  for (const blank of 'abc') {
    expectUnique(body, blank, option => {
      const run = machine(body, { [blank]: option });
      try {
        return inputs.every(input => {
          const actual = run(input);
          return actual.value === referenceNumber(input) && actual.registersRestored;
        });
      } catch (error) {
        // 誤分岐で有効な入力でも停止しない候補を失敗として扱う。
        if (error instanceof Error && error.message === '停止しない命令列') return false;
        throw error;
      }
    });
  }
});

test('問13: d〜gのトレースをエラー行、GR5、通常シフトと多ビットシフトの全候補へ照合する', () => {
  for (const body of cases(13)) {
    const reading = body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
    const input = reading.match(/文字列“([^”]+)”（△は間隔文字）/)![1].replaceAll('△', ' ');
    const compact = input.replaceAll(' ', '');
    const sign = compact.startsWith('-');
    const digits = sign ? compact.slice(1) : compact;
    const validStart = /^\d*/.exec(digits)![0];
    const error = digits[validStart.length];
    const expected = { line: error === undefined ? 37 : error === '-' ? 28 : 26,
      pointer: validStart.length + Number(sign) + 1 };
    const run = machine(body), alternate = machine(body, {}, true);
    const scanner = run(input);
    assert.deepEqual(scanner.scannerError, expected);
    assert.equal(scanner.value, -32768);
    expectUnique(body, 'd', option => Number(option) === expected.line);
    expectUnique(body, 'e', option => Number(option) === expected.pointer);
    assert(body.explanation.includes('行' + expected.line + 'でエラー') &&
      body.explanation.includes('GR5は' + expected.pointer));
    const drawn = body.prompt.find(block => block.type === 'diagram' && block.caption === 'NREADから渡された数字列');
    assert(drawn?.type === 'diagram' && drawn.scene.kind === 'source_figure');
    const digitsFromDiagram = [...drawn.alt.matchAll(/'(\d)'/g)].map(match => match[1]).join('');
    assert(drawn.alt.includes('文字数' + digitsFromDiagram.length));
    const [, decimal, hex] = reading.match(/GR0の値は10進表記で(\d+)（16進表記で([\dA-F]+)）/) !;
    assert.equal(digitsFromDiagram.slice(0, -1), decimal);
    assert.equal(parseInt(hex, 16), Number(decimal));
    const ordinary = run(digitsFromDiagram, 'convert');
    const batched = alternate(digitsFromDiagram, 'convert');
    const narrowed = Number(BigInt.asUintN(16, BigInt(digitsFromDiagram)));
    assert.equal(ordinary.value, referenceNumber(digitsFromDiagram));
    assert.equal(ordinary.converterError, 21);
    assert.equal(batched.value, narrowed);
    assert.equal(batched.converterError, undefined);
    assert(ordinary.registersRestored && batched.registersRestored);
    expectUnique(body, 'f', option => parseInt(option, 16) === 32768);
    expectUnique(body, 'g', option => parseInt(option, 16) === narrowed);
  }
});
