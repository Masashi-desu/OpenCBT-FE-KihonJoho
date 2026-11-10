import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2011SpecialAm01To26Definitions as definitions } from '../src/core/generators/legacy-2011-special-am-01-26';
import { legacy2011SpecialAm0126Figures as figures } from '../src/core/generators/legacy-2011-special-am-01-26-figures';
import { legacy2011SpecialAm0126FigureRenderers as renderers } from '../src/ui/Legacy2011SpecialAm0126Figures';
import originals from '../src/core/generators/legacy-2011-special-am-01-26-source.json';
import { facts } from './fixtures/legacy-2011-special-am-01-26-facts';

const official = 'アエイウエイアアエイエエウエウアアウアアアイエエアウ';
const cases = (number: number) => Array.from({ length: 4 }, (_, index) => definitions[number - 1].build([index]));
const stem = (body: GeneratedBody) => body.prompt.flatMap(block => 'text' in block ? [block.text] : []).join('\n');
const options = (body: GeneratedBody) => body.choices.map(([block]) => {
  if (block.type === 'diagram') return block.alt;
  if (block.type === 'table') return block.rows[0].join('／');
  assert(block.type === 'paragraph' || block.type === 'formula');
  return block.text;
});
const check = (body: GeneratedBody, truth: boolean[]) => {
  assert.equal(truth.length, 4);
  assert.deepEqual(truth.flatMap((value, i) => value ? [i] : []), [body.correctIndex]);
};
const first = <T extends Block['type']>(blocks: Block[], type: T) => {
  const block = blocks.find(value => value.type === type);
  assert(block);
  return block as Extract<Block, { type: T }>;
};
function svg(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(candidate => candidate.profile === profile);
  const view = renderers.find(candidate => candidate.profile === profile);
  assert(definition && view);
  definition.validate(values);
  assert.equal(definition.alt(values), block.alt);
  return renderToStaticMarkup(createElement(view.component, { values, caption: block.caption }));
}

test('公式解答・原前提・全80問中の問1〜26・104条件の四択と再現性を検査する', () => {
  assert.equal(definitions.length, 26);
  assert.equal(originals.map(row => row.sourceKey).join(''), official);
  for (const [i, definition] of definitions.entries()) {
    const row = originals[i];
    assert.equal(row.number, i + 1);
    assert.equal(definition.source, '2011h23tokubetsu-fe-am-' + row.number);
    assert.equal(definition.sourceAnswer, official[i]);
    assert.equal(definition.version, '3.7.0');
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    assert.equal(definition.answerVariation, [14, 22].includes(row.number) ? 'fixed' : undefined);
    const bodies = cases(i + 1);
    assert.equal('アイウエ'[bodies[0].correctIndex!], official[i], definition.source);
    if (![1, 5, 24].includes(row.number)) assert.deepEqual(options(bodies[0]), row.choices);
    if (row.number > 1) assert(stem(bodies[0]).startsWith(row.prompt), definition.source);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    assert.equal(new Set(bodies.map(body => options(body)[body.correctIndex!])).size, definition.answerVariation ? 1 : 4, definition.source);
    for (const [index, body] of bodies.entries()) {
      assert.deepEqual(definition.build([index]), body);
      assert.deepEqual(body.prompt.map(block => block.type), bodies[0].prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(choice => choice.map(block => block.type)),
        bodies[0].choices.map(choice => choice.map(block => block.type)));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(options(body)).size, 4);
      assert(body.explanation.length > 30);
    }
    for (const invalid of [[], [0, 0], [-1], [4], [0.5], Array(1), [Number.NaN]]) {
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
});

function evaluate(latex: string, flags: Readonly<Record<string, boolean>>): boolean {
  const text = latex.replaceAll('\\overline{', '!(').replaceAll('}', ')').replaceAll('\\cdot', '&').replaceAll(' ', '');
  function subexpression(value: string): boolean {
    for (const operator of ['+', '&']) {
      let nesting = 0;
      for (const [index, ch] of [...value].entries()) {
        if (ch === '(') nesting++;
        else if (ch === ')') nesting--;
        else if (ch === operator && !nesting) {
          const left = subexpression(value.slice(0, index)), right = subexpression(value.slice(index + 1));
          return operator === '+' ? left || right : left && right;
        }
      }
    }
    if (value.startsWith('!(') && value.endsWith(')')) return !subexpression(value.slice(2, -1));
    if (value.startsWith('(') && value.endsWith(')')) return subexpression(value.slice(1, -1));
    assert(value in flags);
    return flags[value];
  }
  return subexpression(text);
}

test('問1の外側と内側の否定線を含む全論理式を8入力の真理値表で検査する', () => {
  const read = (block: Block) => {
    const drawing = svg(block);
    const expression = /data-logic-expression="([^"]+)"/.exec(drawing)?.[1];
    assert(expression);
    const expectedLines = expression.match(/\\overline/g)?.length ?? 0;
    assert.equal([...drawing.matchAll(/data-overline-depth=/g)].length, expectedLines);
    return expression;
  };
  assert.equal(read(first(cases(1)[0].prompt, 'diagram')), '\\overline{(\\overline{A}+B)\\cdot (A+\\overline{C})}');
  for (const body of cases(1)) {
    const rows = Array.from({ length: 8 }, (_, n) => ({ A: !!(n & 4), B: !!(n & 2), C: !!(n & 1) }));
    const truth = rows.map(flags => evaluate(read(first(body.prompt, 'diagram')), flags));
    check(body, body.choices.map(([choice]) => rows.every((flags, i) => evaluate(read(choice), flags) === truth[i])));
  }
});

test('問2の真値を分母にした相対誤差を全順列候補で比較する', () => {
  for (const body of cases(2)) {
    const errors = new Map(first(body.prompt, 'table').rows.map(([letter, exact, near]) => [letter, Math.abs(1 - +near / +exact)]));
    check(body, options(body).map(option => {
      const values = option.split('，').map(key => errors.get(key)!);
      return values[0] < values[1] && values[1] < values[2];
    }));
  }
});

test('問3の100文字の符号を実際に連結して平均の候補を検査する', () => {
  for (const body of cases(3)) {
    const rows = first(body.prompt, 'table').rows;
    for (const [i, [, encoding]] of rows.entries()) assert(rows.every(([, other], j) => i === j || !other.startsWith(encoding)));
    const line = rows.flatMap(([letter, bits, probability]) => Array.from({ length: +probability }, () => ({ letter, bits })));
    assert.equal(line.length, 100);
    const encoded = line.map(item => item.bits).join('');
    check(body, options(body).map(option => +option * line.length === encoded.length));
  }
});

test('問4の表示した状態遷移表で全ての文字列を左から検査する', () => {
  for (const body of cases(4)) {
    const grid = first(body.prompt, 'table');
    assert.deepEqual(grid.columns.slice(1), ['空白', '数字', '符号', '小数点', 'その他']);
    const patterns = [/^△$/, /^[0-9]$/, /^[+−]$/, /^[.]$/, /^.$/];
    check(body, options(body).map(text => [...text].reduce((state, symbol) => state === 'e' ? 'e' :
      grid.rows.find(row => row[0] === state)![1 + patterns.findIndex(pattern => pattern.test(symbol))], 'a') === 'e'));
  }
});

test('問5の根・左部分列・右部分列を再帰分割し，全選択肢の描画と比較する', () => {
  const paths = (values: number[], path = ''): [number, string][] => {
    if (values.length === 0) return [];
    const [pivot, ...rest] = values;
    return [[pivot, path], ...paths(rest.filter(n => n < pivot), path + 'L'), ...paths(rest.filter(n => n > pivot), path + 'R')];
  };
  for (const body of cases(5)) {
    const values = stem(body).match(/\d+(?:，\d+){6}/)?.[0].split('，').map(Number);
    assert(values);
    const actual = new Map(paths(values));
    check(body, body.choices.map(([diagram]) => {
      const markup = svg(diagram);
      const edges = [...markup.matchAll(/data-tree-value="(\d+)"(?: data-tree-left="(\d+)")?(?: data-tree-right="(\d+)")?/g)];
      assert.equal(edges.length, 7);
      assert.deepEqual(edges.map(edge => +edge[1]).sort((a, b) => a - b), [...values].sort((a, b) => a - b));
      return actual.get(+edges[0][1]) === '' && edges.every(([, node, left, right]) =>
        (!left || actual.get(+left) === actual.get(+node) + 'L') && (!right || actual.get(+right) === actual.get(+node) + 'R'));
    }));
  }
});

test('問6の再帰式を最大の共通約数の直接探索で検算する', () => {
  for (const body of cases(6)) {
    const args = stem(body).match(/f\((\d+), (\d+)\)/);
    assert(args);
    assert.equal(first(body.prompt, 'code').text, 'f(x, y): if y = 0 then return x else return f(y, x mod y)');
    const [, x, y] = args.map(Number);
    const expected = Array.from({ length: y }, (_, n) => n + 1).filter(n => x % n === 0 && y % n === 0).at(-1);
    check(body, options(body).map(value => +value === expected));
  }
});

test('問7は各修正を図に適用して実行し，1から上限までの総和と照合する', () => {
  for (const body of cases(7)) {
    const max = Number(stem(body).match(/1から(\d+)まで/)?.[1]);
    const sum = Array.from({ length: max }, (_, n) => n + 1).reduce((a, b) => a + b);
    const diagram = first(body.prompt, 'diagram');
    const rendered = svg(diagram);
    assert(rendered.includes('≦') && rendered.includes('＞'));
    const description = /① (\d+) → x，1 → i。② i：(\d+).*③ (.+)，④ (.+)を実行/.exec(diagram.alt);
    assert(description);
    check(body, options(body).map((choice, option) => {
      const fix = choice.match(/“(.+)”/)?.[1];
      assert(fix);
      let x = option === 0 ? +fix.split(' ')[0] : +description[1], i = 1;
      const limit = option === 1 ? +fix.split('：')[1] : +description[2];
      const actions = [option === 2 ? fix : description[3], option === 3 ? fix : description[4]];
      for (let guard = 0; guard < 2 * max; guard++) {
        if (i > limit) return x === sum;
        for (const action of actions) {
          const [a, , b, , to] = action.split(' ');
          const registers = { x, i, 1: 1 };
          const result = registers[a as 'x' | 'i'] + registers[b as 'x' | 'i' | '1'];
          if (to === 'x') x = result;
          else i = result;
        }
      }
      return false;
    }));
  }
});

test('問10は命令と表示したレジスタ・主記憶からロードを独立に解釈する', () => {
  for (const body of cases(10)) {
    const instruction = /^LOAD GR, (\d+), (\d+)$/.exec(first(body.prompt, 'code').text);
    assert(instruction);
    const diagram = first(body.prompt, 'diagram'), rendered = svg(diagram);
    const register = /ベースレジスタ(\d+)の値は(\d+)/.exec(diagram.alt);
    assert(register);
    assert.equal(instruction[1], register[1]);
    const cell = Number(instruction[2]) + Number(register[2]);
    const result = new RegExp('data-memory-address="' + cell + '" data-memory-value="(\\d+)"').exec(rendered);
    assert(result);
    check(body, options(body).map(value => value === result[1]));
  }
});

test('問11は各候補のヒット数で100回の平均アクセス時間を再現する', () => {
  for (const [index, body] of cases(11).entries()) {
    const [memory, cache, effective] = [...stem(body).matchAll(/(\d+)ナノ秒/g)].map(row => +row[1]);
    if (index) assert.match(stem(body), /ミス時のアクセス時間は主記憶のアクセス時間/);
    check(body, options(body).map(option => {
      const hits = Math.round(+option * 100);
      const visits = Array.from({ length: 100 }, (_, i) => i < hits ? cache : memory);
      return visits.reduce((a, b) => a + b) === 100 * effective;
    }));
  }
});

test('問16は二装置の稼働・停止の積事象を整数比で検算する', () => {
  for (const body of cases(16)) {
    const [[, au, ad], [, bu, bd]] = first(body.prompt, 'table').rows;
    const at = +au + +ad, bt = +bu + +bd;
    const independentStates = [+au * +bu, +au * +bd, +ad * +bu, +ad * +bd];
    assert.equal(independentStates.reduce((a, b) => a + b), at * bt);
    check(body, options(body).map(option => Math.round(+option * 100) * at * bt === independentStates[0] * 100));
  }
});

type Job = { task: number; duration: number; io: boolean; next: number };
function ticks(tasks: number[][], serial: boolean) {
  const queues: Job[][] = Array.from({ length: serial ? 2 : 3 }, () => []);
  const running: (Job | undefined)[] = queues.map(() => undefined);
  const rows: string[][] = [[], []];
  function queue(task: number, next: number) {
    if (next >= tasks[task].length) return;
    const io = next % 2 === 1;
    queues[io ? serial ? 1 : task + 1 : 0].push({ task, duration: tasks[task][next], io, next });
  }
  queue(0, 0);
  queue(1, 0);
  for (let elapsed = 0; elapsed < 200; elapsed++) {
    if (queues.every(q => !q.length) && running.every(job => !job)) {
      return { elapsed, busy: rows.flat().filter(slot => slot === 'CPU').length, rows };
    }
    const labels = ['待ち', '待ち'];
    const finished: Job[] = [];
    for (let device = 0; device < queues.length; device++) {
      const job = running[device] ?? queues[device].shift();
      running[device] = job;
      if (!job) continue;
      labels[job.task] = job.io ? 'I/O' : 'CPU';
      if (--job.duration === 0) {
        finished.push(job);
        running[device] = undefined;
      }
    }
    for (const [i, label] of labels.entries()) rows[i].push(label);
    for (const job of finished.sort((a, b) => a.task - b.task)) queue(job.task, job.next + 1);
  }
  throw Error('タスクが200目盛以内に終わらなかった');
}

test('問18は図の長さを読取り，独立した1目盛ずつのシミュレータでI/Oの重なりと直列処理を検査する', () => {
  for (const [index, body] of cases(18).entries()) {
    const markup = svg(first(body.prompt, 'diagram'));
    const phases = [...markup.split('data-timeline-task=').slice(1)].map(text =>
      [...text.matchAll(/data-phase="([^"]+)" data-start="(\d+)" data-end="(\d+)"/g)].map(([, kind, a, b]) => ({ kind, a: +a, b: +b })));
    const jobs = phases.map(row => row.filter(phase => phase.kind !== '待ち').map(({ a, b }) => b - a));
    assert(jobs.every(row => row.length === 5));
    if (!index) assert.deepEqual(jobs, [[2, 8, 3, 4, 3], [2, 4, 2, 4, 3]]);
    const parallel = ticks(jobs, false), serial = ticks(jobs, true);
    for (const [task, row] of phases.entries()) {
      for (const phase of row) assert(parallel.rows[task].slice(phase.a, phase.b).every(label => label === phase.kind));
    }
    if (!index) assert.deepEqual([serial.elapsed, serial.busy], [25, 15]);
    check(body, options(body).map(value => +value === Math.round(100 * serial.busy / serial.elapsed)));
  }
});

test('問19は双方のCPU使用量を各TPSで計算し，次の整数が上限を超えることを検査する', () => {
  for (const body of cases(19)) {
    const text = stem(body), web = Number(text.match(/CPU時間を([\d.]+)ミリ秒/)?.[1]);
    const blocks = Number(text.match(/(\d+)データブロックにアクセスする/)?.[1]);
    const db = Number(text.match(/CPU時間は，([\d.]+)ミリ秒/)?.[1]) * blocks;
    const limits = /Webサーバが(\d+)％，データベースサーバが(\d+)％/.exec(text);
    assert(limits);
    const possible = (n: number) => n * Math.round(web * 1000) <= +limits[1] * 10_000 &&
      n * Math.round(db * 1000) <= +limits[2] * 10_000;
    check(body, options(body).map(value => {
      const n = +value.replaceAll(',', '');
      return possible(n) && !possible(n + 1);
    }));
  }
});

test('問23は両方式の全時間を整数で比較し，提示された行数と直前の行数を検査する', () => {
  for (const [index, body] of cases(23).entries()) {
    const text = stem(body);
    assert.match(text, /実行時間はプログラムの行数に比例/);
    assert.match(text, /ダウンロード時間.*無視/);
    const [interpret, execute, compile, overhead] = [...text.matchAll(/([\d.]+)秒(?:掛か|のオーバヘッド)/g)]
      .map(row => BigInt(Math.round(+row[1] * 1_000_000)));
    const faster = (n: bigint) => (execute + compile) * n + 100n * overhead < interpret * n;
    if (!index) assert.deepEqual([faster(154n), faster(155n)], [false, true]);
    check(body, options(body).map(value => faster(BigInt(value)) && !faster(BigInt(value) - 1n)));
  }
});

const gateBits: Readonly<Record<string, string>> = {
  AND: '0001', OR: '0111', XOR: '0110', NAND: '1110', NOR: '1000', XNOR: '1001',
  論理積: '0001', 論理和: '0111', 排他的論理和: '0110', 否定論理積: '1110', 否定論理和: '1000', 論理一致: '1001',
};
const gate = (kind: string, x: number, y: number) => +gateBits[kind][x * 2 + y];

test('問24は図中の全ゲートと反転を読み，16入力でパリティ条件と照合する', () => {
  for (const body of cases(24)) {
    const even = stem(body).includes('偶数個のとき出力が1');
    const changedBit = Number(stem(body).match(/第([13])ビットだけを反転/)?.[1]);
    check(body, body.choices.map(([diagram]) => {
      const drawing = svg(diagram), [a, b, c, last] = [...drawing.matchAll(/data-gate="([^"]+)"/g)].map(row => row[1]);
      assert([a, b, c].every(name => name in gateBits));
      assert(last === undefined || last === 'NOT');
      return Array.from({ length: 16 }, (_, n) => {
        const [w, x, y, z] = n.toString(2).padStart(4, '0').split('').map(Number);
        const count = [w, x, y, z].reduce((total, bit, i) => total + (i + 1 === changedBit ? 1 - bit : bit), 0);
        const expected = even ? '10101'[count] : '01010'[count];
        const output = gate(c, gate(a, w, x), gate(b, y, z));
        return (last ? 1 - output : output) === +expected;
      }).every(Boolean);
    }));
  }
});

test('問25は二つの論理素子の出力を全4入力の整数加算と比較する', () => {
  for (const body of cases(25)) {
    const diagram = first(body.prompt, 'diagram');
    const drawing = svg(diagram);
    const swapped = drawing.includes('data-adder-output-a="c"');
    assert(drawing.includes('data-adder-output-b="' + (swapped ? 'z' : 'c') + '"'));
    assert.equal(swapped, diagram.alt.includes('Aの出力はc'));
    const text = stem(body), invertSum = text.includes('和の1けた目を反転'), invertCarry = text.includes('けた上げを反転');
    check(body, options(body).map(option => {
      const [a, b] = option.split('／');
      return [0, 1, 2, 3].every(n => {
        const x = n >> 1, y = n & 1;
        const sum = (x + y) % 2, carry = Math.floor((x + y) / 2);
        const expected = [invertSum ? 1 - sum : sum, invertCarry ? 1 - carry : carry];
        return gate(a, x, y) === expected[swapped ? 1 : 0] && gate(b, x, y) === expected[swapped ? 0 : 1];
      });
    }));
  }
});

for (const [number, rule] of Object.entries(facts)) {
  test('問' + number + 'の知識4択を査読済みの区別で判定する', () => {
    assert(rule.distinction.length > 15);
    for (const body of cases(+number)) {
      const types = rule.stems.flatMap((pattern, i) => pattern.test(stem(body)) ? [i] : []);
      assert.equal(types.length, 1);
      check(body, options(body).map(option => rule.choices[types[0]].test(option)));
    }
  });
}

test('実コンポーネントが全7プロフィール・68描画を参照図・共通色・アクセシブル名つきで描く', () => {
  const seen = new Set<string>();
  for (const row of originals) {
    for (const body of cases(row.number)) {
      for (const block of [...body.prompt, ...body.choices.flat()]) {
        if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
        seen.add(block.scene.profile + ':' + block.scene.values.join(','));
        const markup = svg(block);
        assert.match(markup, /data-source-figure="legacy-2011-special-am-/);
        assert.match(markup, /tabindex="0"/);
        assert.match(markup, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
        assert.match(markup, /<desc\b[^>]*>.+?<\/desc>/s);
        assert(markup.includes('var(--diagram-ink)') && markup.includes('var(--image-scale, 1)'));
      }
    }
  }
  assert.equal(figures.length, 7);
  assert.equal(seen.size, 68);
});
