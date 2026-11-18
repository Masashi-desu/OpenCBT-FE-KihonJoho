import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2006Pm06To09Specs as specs } from '../../../scripts/legacy-2006-spring-pm-06-09-specs';
import { legacy2006SpringPm0609Figures as figures } from '../../../src/core/generators/legacy-2006-spring-pm-06-09-figures';
import { legacy2006SpringPm0609FigureRenderers as renderers } from '../../../src/ui/Legacy2006SpringPm0609Figures';
import {
  coordinateDifferences, countBinaryAdditions, deviceStatus, emptySpaces, fillBlanks, idealSegments, inwardSides,
  observedSpaces, occupiedPatterns, readCurveCalls, readDevices, readNumbered, runOblong,
} from '../../fixtures/legacy-2006-spring-pm-06-09-oracle';

const cases = [0, 1, 2, 3];
const originalKeys = {6: 'アイア', 7: 'イイウウケ', 8: 'ウイエオ', 9: 'エケエウ'};
const body = (number: number, condition: number): GeneratedBody => {
  const spec = specs.find(spec => spec.number === number)!;
  return condition === -1 ? spec.original : spec.definition.build([condition]);
};
const text = (block: Block): string => {
  assert('text' in block);
  return block.text;
};
const codeBlocks = (output: GeneratedBody) => output.prompt.filter(block => block.type === 'code').map(text);
const readParts = ({answerParts, partAnswers, choices}: GeneratedBody) => {
  assert(answerParts && partAnswers);
  return answerParts.map(part => {
    const options = part.choiceIds!.map(id => text(choices[Number(id.split('-').at(-1)) - 1][0]));
    const answer = partAnswers.find(answer => answer.kind === 'choice' && answer.partId === part.id);
    assert(answer?.kind === 'choice' && answer.choiceId);
    return { options, answerIndex: part.choiceIds!.indexOf(answer.choiceId) };
  });
};
const find = (results: boolean[]) => results.flatMap((ok, i) => ok ? [i] : []);
const key = (output: GeneratedBody) => readParts(output).map(part => 'アイウエオカキクケ'[part.answerIndex]).join('');
const run = (command: string, args: string[], cwd: string): string => {
  const child = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024 });
  assert.equal(child.status, 0, String(child.error ?? child.stderr));
  return child.stdout;
};

test('原問6〜9の14頁・16欄・公式正答・選択順・全16条件と付属資料を照合する', () => {
  const pages = [[25, 26, 27, 28], [29, 30, 31], [32, 33, 34, 35], [36, 37, 38]];
  const counts = [[5, 5, 5], [3, 9, 3, 9, 9], [6, 6, 5, 5], [9, 9, 4, 5]];
  assert.deepEqual(specs.map(spec => spec.number), [6, 7, 8, 9]);
  for (const [index, spec] of specs.entries()) {
    const number = spec.number as keyof typeof originalKeys;
    assert.deepEqual(spec.pages, pages[index]);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), pages[index]);
    assert.equal(key(spec.original), originalKeys[number]);
    assert.equal(key(body(number, 0)), originalKeys[number]);
    assert.equal(new Set(cases.map(condition => JSON.stringify(body(number, condition).prompt))).size, 4);
    for (const condition of [-1, ...cases]) {
      const parts = readParts(body(number, condition));
      assert.deepEqual(parts.map(part => part.options.length), counts[index]);
      assert(parts.every(part => part.options.length === new Set(part.options).size));
      if (number === 7 || number === 8) {
        assert.equal(spec.definition.answerVariation, 'fixed');
        assert.equal(key(body(number, condition)), originalKeys[number]);
      }
    }
    for (const input of [[], [4], [-1], [2.2], [3, 0]]) assert.throws(() => spec.definition.build(input));
  }
  assert.match(specs[0].originalPageAlt[25], /この中から1問を選択.*2問以上選択/);
  assert.match(specs[0].originalPageAlt[27], /void main\(\)/);
  assert.match(specs[0].originalPageAlt[27], / 3  #define PI 3\.141593\n\n 4  void DrawLine/);
  assert.match(specs[2].originalPageAlt[33], /public boolean contains\(Object obj\)/);
  for (const condition of [-1, ...cases]) {
    const contexts = body(9, condition).contexts;
    assert.equal(contexts?.length, 1);
    assert.equal(contexts[0].title, 'CASL IIの仕様');
    assert.deepEqual(contexts[0].blocks.map(block => {
      assert.equal(block.type, 'image');
      return block.assetId.match(/page-(\d{3}.*)$/)?.[1];
    }), ['057', '058', '059-casl-excerpt', '060', '061', '062']);
  }
});

test('問6の基底条件、深さの候補、図形の全呼出し群の向きを独立に判定する', () => {
  const visualInward = [['bottom', 'left', 'right', 'top'], ['left'], ['bottom', 'left'], ['bottom', 'left', 'right', 'top']];
  const baseCondition = (candidate: string, depth: number) => {
    const match = candidate.match(/^dim (<=|==|!=) (0|1)$/)!;
    assert(match);
    const operand = Number(match[2]);
    if (match[1] === '<=') return depth <= operand;
    if (match[1] === '==') return depth === operand;
    return depth !== operand;
  };
  const argument = (candidate: string, depth: number) => {
    switch (candidate) {
      case 'dim--': case 'dim': case 'dim++': return depth;
      case 'dim - 1': return depth - 1;
      case 'dim + 1': return depth + 1;
      default: assert.fail(candidate);
    }
  };
  for (const condition of cases) {
    const output = body(6, condition);
    const [base, next, paths] = readParts(output);
    assert.deepEqual(find(base.options.map(option => [0, 1, 2, 3].every(d => baseCondition(option, d) === (d === 0)))), [base.answerIndex]);
    assert.deepEqual(find(next.options.map(option => [1, 2, 3].every(d => argument(option, d) === d - 1))), [next.answerIndex]);
    const width = Number(codeBlocks(output).at(-1)?.match(/KochCurve\( 0, (\d+), \1, \1, 1 \);/)?.[1]);
    assert(Number.isSafeInteger(width) && width >= 160 && width < 250);
    const orientationMatches = paths.options.map(option => JSON.stringify(inwardSides(readCurveCalls(option), width)) === JSON.stringify(visualInward[condition]));
    assert.deepEqual(find(orientationMatches), [paths.answerIndex]);
    const renderer = renderers.find(item => item.profile.endsWith('-6-koch-target'))!;
    const svg = renderToStaticMarkup(createElement(renderer.component, { values: [condition], caption: '図2' }));
    const curves = [...svg.matchAll(/<polyline points="([^"]+)"/g)].map(match => match[1].split(' ')
      .map(point => point.split(',').map(Number)));
    const displayInward = curves.flatMap(curve => {
      assert.equal(curve.length, 17);
      const [x, y] = curve[0], [lastX, lastY] = curve[16], [tipX, tipY] = curve[8];
      const center = [200, 158];
      const side = x === lastX ? (x < center[0] ? 'left' : 'right') : (y < center[1] ? 'top' : 'bottom');
      const movesTowardCenter = x === lastX ? (tipX - x) * (center[0] - x) > 0 : (tipY - y) * (center[1] - y) > 0;
      return movesTowardCenter ? [side] : [];
    }).sort();
    assert.deepEqual(displayInward, visualInward[condition]);
  }
});

test('問6の原版と4条件をC17で実行し、独立幾何の線分・方向と座標精度に照合する', () => {
  const work = mkdtempSync(join(tmpdir(), 's3-044-c-'));
  try {
    for (const condition of [-1, ...cases]) {
      const output = body(6, condition), code = codeBlocks(output).at(-1)!;
      const parts = readParts(output);
      const choice = (i: number) => parts[i].options[parts[i].answerIndex];
      const width = Number(code.match(/KochCurve\( 0, (\d+), \1, \1, 1 \);/)?.[1]);
      const source = fillBlanks(readNumbered(code), { a: choice(0), b: choice(1) })
        .replace(/(?:void main\(\)|int main\(void\))/, 'static void sourceMain(void)');
      writeFileSync(join(work, 'curve.c'), source + '\n' + [
        'void DrawLine(int x1,int y1,int x2,int y2) { printf("%d %d %d %d\\n",x1,y1,x2,y2); }',
        'int main(void) {',
        '  sourceMain();',
        '  puts("--");',
        choice(2),
        '  puts("--");',
        '  KochCurve(0, 0, ' + width + ', 0, 0);',
        '  return 0;',
        '}',
      ].join('\n'));
      run('cc', ['-std=c17', '-pedantic-errors', 'curve.c', '-lm', '-o', 'curve'], work);
      const observed = run(join(work, 'curve'), [], work).trim().split('\n--\n')
        .map(group => group.split('\n').map(line => line.split(' ').map(Number)));
      const expected = [
        idealSegments([[0, width], [width, width]], 1),
        readCurveCalls(choice(2)).flatMap(side => idealSegments(side, 2)),
        idealSegments([[0, 0], [width, 0]], 0),
      ].map(group => group.map(segment => segment.flat()));
      assert.deepEqual(observed.map(group => group.length), [4, 64, 1]);
      for (const [i, group] of observed.entries()) {
        for (const [j, segment] of group.entries()) {
          segment.forEach((coord, k) => {
            assert(Number.isInteger(coord) && Math.abs(coord - expected[i][j][k]) < (i === 1 ? 4 : i === 0 ? 2 : 1),
              JSON.stringify({ condition, group: i, line: j, coord, expected: expected[i][j][k] }));
          });
        }
      }
    }
  } finally { rmSync(work, { recursive: true, force: true }); }
});

test('問7の全6,561候補を使用区画の補集合と比較し、終端の0・1・複数件を含めて一意に選別する', () => {
  for (const condition of cases) {
    const output = body(7, condition), code = codeBlocks(output).find(source => source.startsWith('DATA DIVISION.'))!;
    const parts = readParts(output);
    const limit = Number(code.match(/IF W-BANGO NOT = (\d+) THEN/)?.[1]);
    assert(Number.isSafeInteger(limit));
    assert.match(output.prompt.map(block => 'text' in block ? block.text : '').join('\n'),
      new RegExp('区画は' + limit + '台分.*1〜' + limit + 'の連番'));
    assert.match(code, new RegExp('IF W-BANGO < ' + (limit - 1) + ' THEN[\\s\\S]*MOVE ' + limit + ' TO M-OWARI'));
    assert.match(code, /INITIALIZE W-BANGO END-SW DISPLAY-SW[\s\S]*READ SHIYO-F AT END MOVE "END" TO END-SW/);
    assert.match(code, /NOT AT END\n\s+COMPUTE W-SA = BANGO - W-BANGO\n\s+IF W-SA > ［a］ THEN\n\s+MOVE SPACE TO MEISAI\n\s+［b］\n\s+IF W-SA > ［c］ THEN\n\s+MOVE " - " TO M-HYPHEN\n\s+［d］[\s\S]*DISPLAY MEISAI\n\s+［e］/);
    const patterns = occupiedPatterns(limit).map(taken => ({ taken, expected: emptySpaces(taken, limit).join('\n') }));
    const passing = parts.reduce<string[][]>((choices, part) => choices.flatMap(list => part.options.map(option => [...list, option])), [[]])
      .filter(candidate => patterns.every(({taken, expected}) => observedSpaces(taken, limit, candidate).join('\n') === expected));
    assert.deepEqual(passing, [parts.map(part => part.options[part.answerIndex])]);
  }
});

test('問8の全候補を包含関係・Javaの型と構築規則・未適用集合から判定する', () => {
  for (const condition of cases) {
    const output = body(8, condition);
    const [membership, inheritance, construction, missing] = readParts(output);
    const allContainsCases = [
      { applied: [], patch: 'P1' },
      { applied: ['P2'], patch: 'P1' },
      { applied: ['P1'], patch: 'P1' },
      { applied: ['P1', 'P2', 'P2'], patch: 'P2' },
    ];
    assert.deepEqual(find(membership.options.map(option => allContainsCases.every(({applied, patch}) => {
      const present = applied.some(id => id === patch);
      const read = [
        applied.length === 0, applied.length > 0, present, !present, false, true,
      ];
      return read[membership.options.indexOf(option)] === present;
    }))), [membership.answerIndex]);
    // PC is a class and the element type of PC[]. Only its named subclass
    // clause satisfies assignability, and PC declares only PC(String).
    const subclassAccepts = ['extends PC'];
    const constructorsAcceptedByPC = ['super(id)'];
    assert.deepEqual(find(inheritance.options.map(option => subclassAccepts.includes(option))), [inheritance.answerIndex]);
    assert.deepEqual(find(construction.options.map(option => constructorsAcceptedByPC.includes(option))), [construction.answerIndex]);
    const checker = codeBlocks(output).find(program => program.includes('public class PCChecker {'))!;
    const {devices, required} = readDevices(checker);
    const observedMissing = (candidate: number, installed: Set<string>) => required.reduce<string[]>((found, patch) => {
      const choices = [true, found.length === 0, true, installed.has(patch), !installed.has(patch)];
      if (choices[candidate]) found.push(patch);
      return found;
    }, []);
    assert.deepEqual(find(missing.options.map((_, candidate) => devices.every(device =>
      JSON.stringify(observedMissing(candidate, device.patches)) === JSON.stringify(required.filter(patch => !device.patches.has(patch)))))),
    [missing.answerIndex]);
  }
});

test('問8の原版と生成4条件をJavaで実行し、画面の実行例・独立状態モデル・両方不足する場合を照合する', () => {
  const work = mkdtempSync(join(tmpdir(), 's3-044-java-'));
  const files: string[] = [];
  const casesToRun = [-1, ...cases].map((condition, i) => ({ condition, name: 'case' + i, both: false }));
  casesToRun.push({ condition: 0, name: 'both', both: true });
  try {
    const expected = casesToRun.map(({condition, name, both}) => {
      const output = body(8, condition);
      const parts = readParts(output);
      const slots = Object.fromEntries(parts.map((part, i) => ['abcd'[i], part.options[part.answerIndex]]));
      const code = codeBlocks(output);
      const classes = code.filter(source => /public (?:abstract )?class /.test(source));
      assert.equal(classes.length, 4);
      mkdirSync(join(work, name));
      let expected: string | undefined;
      for (let source of classes) {
        const className = source.match(/public (?:abstract )?class (\w+)/)?.[1];
        if (className === 'PCChecker') {
          if (both) source = source.replace(/^.*pc\[1\]\.installPatch.*\n/gm, '');
          expected = deviceStatus(source);
          if (both) assert.match(expected, /pc002: requires \[sp1-A01, sp1-A02, sp1-A03\]\n requires encryption tool/);
          else assert.equal(expected, code[0]);
        }
        const path = join(name, className + '.java');
        writeFileSync(join(work, path), 'package ' + name + ';\n' + fillBlanks(source, slots));
        files.push(path);
      }
      assert(expected);
      return { name, expected };
    });
    run('javac', ['--release', '8', '-d', work, ...files], work);
    for (const { name, expected: samples } of expected)
      assert.equal(run('java', ['-classpath', work, name + '.PCChecker'], work).trimEnd(), samples);
  } finally { rmSync(work, { recursive: true, force: true }); }
});

test('問9の全324命令組合せと順序固定の回数候補を独立CASL機械・面積・二進位の計算で検証する', () => {
  for (const condition of [-1, ...cases]) {
    const output = body(9, condition);
    const parts = readParts(output);
    const code = readNumbered(codeBlocks(output)[0]);
    const points = output.prompt.filter(block => block.type === 'paragraph' && /^[AB] の座標：/.test(block.text))
      .flatMap(block => [...text(block).matchAll(/[−-]?\d+/g)].map(match => Number(match[0].replace('−', '-'))));
    assert.equal(points.length, 4);
    const expectedInputs = [points, [0, 9, 1, 8], [3, -1, -5, 8], [-2, -7, 4, -3], [40, -9, 0, 22]];
    const expected = (values: number[]) => {
      const [width, height] = coordinateDifferences(values);
      return { result: width * height, additions: countBinaryAdditions(height), preserved: true, overflow: false };
    };
    const valid = parts.slice(0, 3).reduce<string[][]>((choices, part) =>
      choices.flatMap(list => part.options.map(option => [...list, option])), [[]]).filter(([a, b, c]) =>
      expectedInputs.every(values => {
        const result = runOblong(fillBlanks(code, { a, b, c }), values);
        const reference = expected(values);
        return result?.result === reference.result && result.additions === reference.additions &&
          result.preserved === reference.preserved && result.overflow === reference.overflow;
      }));
    assert.deepEqual(valid, [parts.slice(0, 3).map(part => part.options[part.answerIndex])]);
    assert.deepEqual(parts[3].options, ['1', '2', '3', '4', '5']);
    assert.equal(parts[3].options[parts[3].answerIndex], String(expected(points).additions));
    assert.match(output.explanation, new RegExp('回実行される'));
  }
});

test('作図3種類は実際のSVGと読上げ用のタイトル・説明を持ち、原形式の向きと軸を表示する', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const [index, renderer] of renderers.entries()) {
    for (const condition of cases) {
      const figure = figures[index];
      figure.validate([condition]);
      const svg = renderToStaticMarkup(createElement(renderer.component, { values: [condition], caption: '図' }));
      assert.match(svg, /<svg [^>]*role="img"[^>]*aria-labelledby="[^"]+"[^>]*aria-describedby="[^"]+"/);
      assert(svg.includes(figure.alt([condition])));
      assert.match(svg, /<desc id="[^"]+">/);
      if (index === 0) assert.deepEqual([...svg.matchAll(/points="([^"]+)"/g)].map(match => match[1].split(' ').length), [2, 5, 17]);
      if (index === 1) assert.match(svg, />\(0, 0\)<.*>\(\d+, 0\)<.*>\(0, \d+\)<.*>\(\d+, \d+\)</);
      if (index === 2) assert.match(svg, /<rect.*>A \(x1, y1\)<.*>B \(x2, y2\)</);
    }
  }
});
