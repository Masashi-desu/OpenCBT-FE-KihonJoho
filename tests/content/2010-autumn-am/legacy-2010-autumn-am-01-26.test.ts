import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2010AutumnAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2010-autumn-am-01-26';
import { legacy2010AutumnAm0126Figures as figures } from '../../../src/core/generators/legacy-2010-autumn-am-01-26-figures';
import { legacy2010AutumnAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2010AutumnAm0126Figures';
import originals from '../../../src/core/generators/legacy-2010-autumn-am-01-26-source.json';
import { facts } from '../../fixtures/legacy-2010-autumn-am-01-26-facts';

const official = 'イアエアウウイアエウイアアアエイイエエイアアイウエエ';
const cases = (q: number) => [0, 1, 2, 3].map(i => definitions[q - 1].build([i]));
const stem = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const first = <T extends Block['type']>(blocks: Block[], type: T) => {
  const block = blocks.find(item => item.type === type);
  assert(block);
  return block as Extract<Block, { type: T }>;
};
const options = (body: GeneratedBody) => body.choices.map(([block]) => {
  if (block.type === 'diagram' || block.type === 'formula') return block.alt;
  if (block.type === 'table') return block.rows[0].join('／');
  assert(block.type === 'paragraph');
  return block.text;
});
const check = (body: GeneratedBody, truth: boolean[]) =>
  assert.deepEqual(truth.flatMap((value, i) => value ? [i] : []), [body.correctIndex]);
function draw(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const figure = figures.find(figure => figure.profile === profile), view = renderers.find(view => view.profile === profile);
  assert(figure && view);
  figure.validate(values);
  assert.equal(figure.alt(values), block.alt);
  const markup = renderToStaticMarkup(createElement(view.component, { values, caption: block.caption }));
  assert.match(markup, /tabindex="0"/);
  assert.match(markup, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
  assert.match(markup, /<desc\b[^>]*>[\s\S]+<\/desc>/);
  assert(markup.includes('var(--diagram-ink)') && markup.includes('var(--image-scale, 1)'));
  return markup;
}

test('問1〜26の公式キー、104条件、416択の原前提・構成・再現性を照合する', () => {
  assert.equal(definitions.length, 26);
  assert.equal(originals.map(row => row.sourceKey).join(''), official);
  for (const [i, definition] of definitions.entries()) {
    const row = originals[i], bodies = cases(row.number);
    assert.equal(row.number, i + 1);
    assert.equal(definition.source, '2010h22a-fe-am-' + row.number);
    assert.equal(definition.sourceAnswer, official[i]);
    assert.equal(definition.version, '3.7.0');
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    assert.equal('アイウエ'[bodies[0].correctIndex!], official[i]);
    assert(stem(bodies[0]).startsWith(row.prompt), definition.source);
    if (![15, 24].includes(row.number)) assert.deepEqual(options(bodies[0]), row.choices, definition.source);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4, definition.source);
    assert.equal(new Set(bodies.map(body => options(body)[body.correctIndex!])).size, row.number === 25 ? 2 : 4, definition.source);
    for (const [index, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.deepEqual(body.prompt.map(block => block.type), bodies[0].prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(choice => choice.map(block => block.type)), bodies[0].choices.map(choice => choice.map(block => block.type)));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(options(body)).size, 4);
      assert(body.explanation.length > 25);
    }
    for (const invalid of [[], [0, 0], [-1], [4], [0.5], Array(1), [Number.NaN]])
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
  }
});

test('問1の分数候補をけた重みと分数の交差積で独立照合する', () => {
  for (const body of cases(1)) {
    const match = stem(body).match(/16進小数([0-9A-F]{2})\.([0-9A-F]{2})/);
    assert(match);
    const digits = [...match[1] + match[2]].map(digit => '0123456789ABCDEF'.indexOf(digit));
    const exact = digits[0] * 4096 + digits[1] * 256 + digits[2] * 16 + digits[3];
    check(body, body.choices.map(choice => {
      const fraction = first(choice, 'formula');
      const parts = /^\\frac\{(\d+)\}\{(\d+)\}$/.exec(fraction.text);
      assert(parts && fraction.alt === parts[1] + '/' + parts[2]);
      return +parts[1] * 256 === exact * +parts[2];
    }));
  }
});

test('問3は二日分の各100通りを列挙して確率の四択を検算する', () => {
  for (const body of cases(3)) {
    const tab = first(body.prompt, 'table');
    const text = stem(body).match(/(晴れ|曇り|雨)の2日後が(晴れ|曇り|雨)/);
    assert(text);
    const labels = tab.rows.map(row => row[0]);
    const expanded = tab.rows.map(row => row.slice(1).flatMap((count, i) => Array(Number(count)).fill(i) as number[]));
    assert(expanded.every(row => row.length === 100));
    const to = labels.indexOf(text[2]), from = labels.indexOf(text[1]);
    const trials = expanded[from].flatMap(firstDay => expanded[firstDay]);
    assert.equal(trials.length, 10_000);
    const hit = trials.filter(day => day === to).length;
    check(body, options(body).map(option => +option * 100 === hit));
  }
});

test('問5は到着順に許されるpush/popの全探索から得た列を照合する', () => {
  for (const body of cases(5)) {
    const order = stem(body).match(/[ABCD](?:, [ABCD]){3}/)?.[0].split(', ');
    assert(order);
    const valid = new Set<string>();
    function explore(consumed: number, stack: string[], output: string[]) {
      if (output.length === order!.length) valid.add(output.join(', '));
      if (consumed < order!.length) explore(consumed + 1, [...stack, order![consumed]], output);
      if (stack.length) explore(consumed, stack.slice(0, -1), [...output, stack.at(-1)!]);
    }
    explore(0, [], []);
    assert.equal(valid.size, 14);
    check(body, options(body).map(choice => valid.has(choice)));
  }
});

test('問6は表から木を構築して深さ優先探索で葉を数える', () => {
  for (const body of cases(6)) {
    const tab = first(body.prompt, 'table');
    const nodes = tab.columns.slice(1).map(Number), parents = tab.rows[0].slice(1).map(Number);
    const children = new Map<number, number[]>(nodes.map(node => [node, []]));
    const root = parents.indexOf(0) + 1;
    assert(root > 0);
    for (const [i, parent] of parents.entries()) if (parent) children.get(parent)!.push(nodes[i]);
    const seen = new Set<number>();
    function visit(node: number): number {
      assert(!seen.has(node));
      seen.add(node);
      const next = children.get(node)!;
      return next.length ? next.reduce((sum, child) => sum + visit(child), 0) : 1;
    }
    const count = visit(root);
    assert.equal(seen.size, nodes.length);
    check(body, options(body).map(choice => +choice === count));
  }
});

test('問7は5けたの整数から桁を取り出して配列位置を求める', () => {
  for (const body of cases(7)) {
    let value = Number(stem(body).match(/(\d{5})は次の配列/)?.[1]);
    let remainder = 0;
    assert(value >= 10000);
    for (let i = 0; i < 5; i++) {
      const prefix = Math.floor(value / 10);
      remainder += value - 10 * prefix;
      value = prefix;
    }
    while (remainder >= 13) remainder -= 13;
    assert.deepEqual(first(body.prompt, 'table').rows.map(row => row[0]), ['0', '1', '2', '⋮', '11', '12']);
    check(body, options(body).map(choice => +choice === remainder));
  }
});

test('問9は候補のMIPS×平均時間が1秒になるものを照合する', () => {
  for (const body of cases(9)) {
    const ns = Number(stem(body).match(/実行時間が(\d+)ナノ秒/)?.[1]);
    assert(ns > 0);
    check(body, options(body).map(choice => +choice * 1_000_000 * ns === 1_000_000_000));
  }
});

test('問14はシーク・回転待ち・転送を整数マイクロ秒で独立に照合する', () => {
  for (const body of cases(14)) {
    const [rpm, seek, rate] = first(body.prompt, 'table').rows.map(([, value]) => Number(value.match(/[\d,]+/)?.[0].replaceAll(',', '')));
    const bytes = Number(stem(body).match(/([\d,]+)バイトのデータ/)?.[1].replaceAll(',', ''));
    const full = 60_000_000 / rpm;
    const interval = [0, full];
    const average = interval.reduce((sum, time) => sum + time, 0) / interval.length;
    const exactUs = seek * 1000 + average + bytes / rate;
    check(body, options(body).map(choice => Math.round(+choice * 1000) === exactUs));
  }
});

test('問15は表示されるPC、管理側、ネットワークの全4構成を判定する', () => {
  const conditions = [
    [/^NAS/, 'lan', 'storage'], [/各PCがファイルシステム.*SAN/, 'dedicated', 'pc'],
    [/ストレージ側でファイルシステム.*別の専用/, 'dedicated', 'storage'],
    [/LANに接続し，各PC側で/, 'lan', 'pc'],
  ] as const;
  for (const body of cases(15)) {
    const condition = conditions.find(([pattern]) => pattern.test(stem(body)));
    assert(condition);
    check(body, body.choices.map(([block]) => {
      const drawing = draw(block);
      assert.equal([...drawing.matchAll(/data-storage-pc="true"/g)].length, 3);
      const location = /data-storage-network="([^"]+)" data-filesystem-side="([^"]+)"/.exec(drawing);
      assert(location);
      assert.equal([...drawing.matchAll(/data-filesystem="true"/g)].length, location[2] === 'pc' ? 3 : 1);
      return location[1] === condition[1] && location[2] === condition[2];
    }));
  }
});

test('問17は図から稼働・停止の区間記号を読み，平均・割合を全択で照合する', () => {
  const formulaValue = (formula: string, t: number, s: number) => {
    const values: Record<string, number> = { T: t, S: s };
    const [numerator, denominator] = formula.split('/');
    return (numerator === 'T＋S' ? t + s : values[numerator]) / (denominator ? t + s : 1);
  };
  for (const body of cases(17)) {
    const drawing = draw(first(body.prompt, 'diagram'));
    const symbols = /data-uptime-symbol="([ts])" data-downtime-symbol="([ts])"/.exec(drawing);
    assert(symbols && symbols[1] !== symbols[2]);
    const run = [6, 18, 12], repair = [4, 2, 3];
    const total = run.reduce((a, b) => a + b), down = repair.reduce((a, b) => a + b);
    const indicators: Record<string, number> = { 信頼性: total / 3, 保守性: down / 3, 可用性: total / (total + down) };
    const values = symbols[1] === 't' ? [total / 3, down / 3] : [down / 3, total / 3];
    check(body, body.choices.map(choice => {
      const option = first(choice, 'table');
      assert(option.columns.every(column => stem(body).includes(column)));
      return option.columns.every((column, i) => formulaValue(option.rows[0][i], values[0], values[1]) === indicators[column]);
    }));
  }
});

test('問19は4装置の稼働・停止16状態を列挙し最も近い候補を照合する', () => {
  for (const body of cases(19)) {
    const m = /AとCが([\d.]+)，BとDが([\d.]+)/.exec(stem(body));
    assert(m);
    const frequencies = [+m[1], +m[2], +m[1], +m[2]].map(rate => Math.round(10 * rate));
    const groups = [...draw(first(body.prompt, 'diagram')).matchAll(/data-parallel="([A-D]) ([A-D])"/g)].map(row => row.slice(1));
    assert.deepEqual(groups, [['A', 'C'], ['B', 'D']]);
    let count = 0;
    for (let mask = 0; mask < 16; mask++) {
      const up = frequencies.map((_, i) => !!(mask & (1 << i)));
      if (groups.every(group => group.some(letter => up['ABCD'.indexOf(letter)]))) {
        count += frequencies.reduce((product, rate, i) => product * (up[i] ? rate : 10 - rate), 1);
      }
    }
    const errors = options(body).map(value => Math.abs(Math.round(+value * 10000) - count));
    check(body, errors.map(error => error === Math.min(...errors)));
  }
});

test('問20は図の両タスクを1ミリ秒ずつ進め，排他Rと全時間を照合する', () => {
  for (const body of cases(20)) {
    const drawing = draw(first(body.prompt, 'diagram'));
    const durations = drawing.split('data-task=').slice(1).map(row =>
      [...row.matchAll(/data-duration="(\d+)"/g)].map(match => +match[1]));
    assert.deepEqual(durations.map(row => row.length), [3, 3]);
    const stage = [0, 0], remaining = durations.map(row => row[0]);
    let elapsed = 0;
    let activeR = -1;
    const queuedR: number[] = [];
    while (stage.some(n => n < 3) && elapsed < 1_000) {
      if (activeR < 0 && queuedR.length) activeR = queuedR.shift()!;
      const currentR = activeR;
      stage.forEach((current, job) => {
        if (current === 3 || current === 1 && currentR !== job) return;
        remaining[job]--;
        if (remaining[job] === 0) {
          stage[job]++;
          remaining[job] = durations[job][stage[job]] ?? 0;
          if (current === 0) queuedR.push(job);
          if (current === 1) activeR = -1;
        }
      });
      elapsed++;
    }
    assert(stage.every(n => n === 3));
    check(body, options(body).map(choice => +choice === elapsed));
  }
});

const truthTable: Readonly<Record<string, readonly number[]>> = {
  AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], NAND: [1, 1, 1, 0], NOR: [1, 0, 0, 0],
  XOR: [0, 1, 1, 0], 論理一致: [1, 0, 0, 1],
};
function evaluate(source: string, inputs: Record<string, number>): number {
  const solve = (text: string): number => {
    for (const op of ['+', '·']) {
      let depth = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '(') depth++;
        if (text[i] === ')') depth--;
        if (text[i] === op && depth === 0) {
          const a = solve(text.slice(0, i)), b = solve(text.slice(i + 1));
          return op === '+' ? a | b : a & b;
        }
      }
    }
    if (text.startsWith('!')) return 1 - solve(text.slice(1));
    if (text.startsWith('(') && text.endsWith(')')) return solve(text.slice(1, -1));
    assert(text in inputs);
    return inputs[text];
  };
  return solve(source);
}

test('問24は表示されたゲートと否定線を全入力の真理値表で照合する', () => {
  for (const [i, body] of cases(24).entries()) {
    const circuit = draw(first(body.prompt, 'diagram'));
    const gates = [...circuit.matchAll(/data-gate="([^"]+)"/g)].map(row => row[1]);
    assert.deepEqual(gates.slice(0, 2), ['NOT', 'NOT']);
    assert.deepEqual(gates.slice(3, 5), ['AND', 'AND']);
    assert.equal(gates.length, 6);
    const signatures = body.choices.map(([choice]) => {
      const image = draw(choice), formula = /data-expression="([^"]+)"/.exec(image)?.[1];
      assert(formula);
      assert.equal([...image.matchAll(/data-overline="true"/g)].length, [...formula.matchAll(/!/g)].length);
      return Array.from({ length: 4 }, (_, row) => evaluate(formula, { A: row >> 1, B: row % 2 })).join('');
    });
    if (!i) assert.deepEqual(signatures, ['1111', '1001', '0110', '1001']);
    const expected = Array.from({ length: 4 }, (_, row) => {
      const a = row >> 1, b = row % 2;
      const m = truthTable[gates[2]][2 * (1 - a) + (1 - b)];
      const upper = truthTable[gates[3]][2 * a + m], lower = truthTable[gates[4]][2 * m + b];
      return truthTable[gates[5]][2 * upper + lower];
    }).join('');
    check(body, signatures.map(signature => signature === expected));
  }
});

test('問25は実図の信号反転を読み，全切替え・同位置の点灯条件を照合する', () => {
  for (const [i, body] of cases(25).entries()) {
    const drawing = draw(first(body.prompt, 'diagram'));
    const inverted = [...drawing.matchAll(/data-lamp-input="[AB]" data-inverted="(true|false)"/g)].map(row => row[1] === 'true');
    assert.equal(inverted.length, 2);
    const equal = stem(body).match(/両方が同じ位置のとき照明を(点灯|消灯)/)?.[1];
    assert.equal(Boolean(equal), i > 0);
    check(body, options(body).map(choice => {
      const table = truthTable[choice];
      const actual = [0, 1, 2, 3].map(row => {
        const a = (row >> 1) ^ Number(inverted[0]), b = (row % 2) ^ Number(inverted[1]);
        return table[2 * a + b];
      });
      const switches = actual.every((result, row) => result !== actual[row ^ 1] && result !== actual[row ^ 2]);
      return switches && (equal === undefined || actual[0] === Number(equal === '点灯'));
    }));
  }
});

for (const [number, fact] of Object.entries(facts)) {
  test('問' + number + 'は査読済みの条件で知識四択をすべて判定する', () => {
    assert(fact.distinction.length > 15);
    for (const body of cases(+number)) {
      const types = fact.stems.flatMap((pattern, i) => pattern.test(stem(body)) ? [i] : []);
      assert.equal(types.length, 1);
      check(body, options(body).map(choice => fact.choices[types[0]].test(choice)));
    }
  });
}

test('全7プロフィール・37描画を実コンポーネントで検査する', () => {
  const states = new Set<string>();
  for (const row of originals) {
    for (const body of cases(row.number)) {
      for (const block of [...body.prompt, ...body.choices.flat()]) {
        if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
        assert.match(draw(block), /data-source-figure="legacy-2010-autumn-am-/);
        states.add(block.scene.profile + ':' + block.scene.values.join(','));
      }
    }
  }
  assert.equal(figures.length, 7);
  assert.equal(states.size, 37);
});
