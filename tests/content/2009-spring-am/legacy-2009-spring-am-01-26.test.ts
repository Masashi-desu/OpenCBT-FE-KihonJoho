import assert from 'node:assert/strict';
import { win32 } from 'node:path';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2009SpringAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2009-spring-am-01-26';
import { legacy2009SpringAm0126Figures as figures } from '../../../src/core/generators/legacy-2009-spring-am-01-26-figures';
import { legacy2009SpringAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2009SpringAm0126Figures';
import { knowledgeFacts } from '../../fixtures/legacy-2009-spring-am-01-26-facts';

const official = 'ウアアエウエアウエエウアウアアエアアイイウアエイアウ';
const cases = (number: number) => [0, 1, 2, 3].map(index => definitions[number - 1].build([index]));
const paragraphs = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const blockText = (block: Block) => {
  if (block.type === 'formula' || block.type === 'diagram') return block.alt;
  assert(block.type === 'paragraph');
  return block.text;
};
const tableOf = (block: Block) => { assert(block.type === 'table'); return block; };
const diagramOf = (block: Block) => { assert(block.type === 'diagram' && block.scene.kind === 'source_figure'); return block; };
const diagramIn = (body: GeneratedBody, suffix: string) => diagramOf(body.prompt.find(block =>
  block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix))!);

function unique(body: GeneratedBody, accepts: (option: Block, index: number) => boolean) {
  assert.deepEqual(body.choices.flatMap(([block], index) => accepts(block, index) ? [index] : []), [body.correctIndex], paragraphs(body));
}
function ascending(values: number[]) { assert.deepEqual(values, [...values].sort((a, b) => a - b)); }

test('問1〜26の公式正答、104条件、416候補、媒体と境界を確認する', () => {
  assert.equal(definitions.length, 26);
  let seen = 0;
  for (const [position, definition] of definitions.entries()) {
    const bodies = cases(position + 1), original = bodies[0];
    assert.equal(definition.source, '2009h21h-fe-am-' + (position + 1));
    assert.equal(definition.sourceAnswer, official[position]);
    assert.equal('アイウエ'[original.correctIndex!], official[position]);
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.version, '3.7.0');
    assert.deepEqual(definition.fields.map(({ minimum, maximum }) => [minimum, maximum]), [[0, 3]]);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    const correctContents = new Set(bodies.map(body => JSON.stringify(body.choices[body.correctIndex!])));
    assert.equal(correctContents.size === 1, definition.answerVariation === 'fixed');
    for (const [i, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([i]));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert.deepEqual(body.prompt.map(block => block.type), original.prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(choice => choice.map(block => block.type)), original.choices.map(choice => choice.map(block => block.type)));
      assert(body.explanation.length > 35);
      seen += body.choices.length;
    }
    for (const invalid of [[-1], [4], [0.5], [NaN], [], [0, 0], Array<number>(1)]) {
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
  assert.equal(seen, 416);
});

test('問1はビット列へ0を付けた値を元の整数へ加え、全候補を比較する', () => {
  for (const body of cases(1)) {
    const prompt = paragraphs(body);
    const count = Number(prompt.match(/(\d+)ビット左にシフト/)![1]);
    assert.match(prompt, /正の整数x.*xを加える.*オーバフロー.*発生しない/);
    unique(body, option => [1, 7, 23, 128].every(x => {
      const shifted = parseInt(x.toString(2) + '0'.repeat(count), 2);
      return x * Number(blockText(option)) === shifted + x;
    }));
    ascending(body.choices.map(([block]) => Number(blockText(block))));
  }
});

test('問2は桁ごとの重みを別々に加え、桁抽出と切捨てを照合する', () => {
  for (const body of cases(2)) {
    const prompt = paragraphs(body);
    assert.match(prompt, /0000〜4999.*11進数とみなし，10進数に変換した後，下4けた.*0\.5.*小数点以下は切捨て/);
    const key = prompt.match(/キー値が(\d+)/)![1];
    const converted = [...key].reverse().reduce((sum, digit, position) => sum + Number(digit) * 11 ** position, 0);
    const tail = Number(String(converted).slice(-4));
    const expected = (tail - tail % 2) / 2;
    unique(body, option => {
      const shown = blockText(option);
      assert.match(shown, /^[0-4]\d{3}$/);
      return Number(shown) === expected;
    });
    ascending(body.choices.map(([block]) => Number(blockText(block))));
    assert(body.explanation.includes(String(expected).padStart(4, '0')));
  }
});

type Inputs = Record<string, boolean>;
function evaluate(text: string, inputs: Inputs) {
  const tokens = text.match(/NOT|[ABC()+＋・]/g) ?? [];
  let index = 0;
  function literal(): boolean {
    const first = tokens[index++];
    if (first === '(') {
      const result = disjunction();
      assert.equal(tokens[index++], ')');
      return result;
    }
    if (first === 'NOT') return !literal();
    assert(Object.hasOwn(inputs, first));
    return inputs[first];
  }
  function conjunction() {
    let result = literal();
    while (tokens[index] === '・') {
      index++;
      const next = literal();
      result = result && next;
    }
    return result;
  }
  function disjunction() {
    let result = conjunction();
    while (tokens[index] === '＋') {
      index++;
      const next = conjunction();
      result = result || next;
    }
    return result;
  }
  const result = disjunction();
  assert.equal(index, tokens.length);
  return result;
}
const booleans = [false, true];
const inputs = booleans.flatMap(A => booleans.flatMap(B => booleans.map(C => ({ A, B, C }))));
const truth = (text: string) => inputs.map(values => Number(evaluate(text, values))).join('');

test('問3は全8入力を構文解析して各論理式の等価性を検算する', () => {
  for (const body of cases(3)) {
    const target = blockText(body.prompt[1]);
    assert.match(target, /^NOT\(/);
    assert.equal(new Set(body.choices.map(([block]) => truth(blockText(block)))).size, 4);
    unique(body, option => truth(blockText(option)) === truth(target));
    assert.match(body.explanation, /論理積と論理和を入れ替えて入力の極性を反転/);
  }
});

test('問7は昇順・降順の配列を実際に二分し、比較回数と4式を照合する', () => {
  for (const body of cases(7)) {
    const prompt = paragraphs(body);
    const length = Number(prompt.match(/n＝([\d,]+)/)?.[1].replaceAll(',', '') ?? 4096);
    const descending = prompt.startsWith('降順');
    const data = Array.from({ length }, (_, index) => descending ? length - index : index + 1);
    const comparisons = (target: number) => {
      let low = 0, high = data.length - 1, count = 0;
      while (low <= high) {
        const midpoint = Math.floor((low + high) / 2);
        count++;
        if (data[midpoint] === target) break;
        if ((target > data[midpoint]) !== descending) low = midpoint + 1;
        else high = midpoint - 1;
      }
      return count;
    };
    const worst = Math.max(...[1, length, length + 1, 0, Math.floor(length / 3)].map(comparisons));
    const formulas: Record<string, number> = {
      'log₂ n': Math.log(length) / Math.log(2), '(log₂ n＋1)／2': (Math.log(length) / Math.log(2) + 1) / 2,
      n: length, 'n²': length * length,
    };
    unique(body, option => Math.abs(formulas[blockText(option)] - worst) <= 1 + 1e-9);
    assert.match(body.explanation, /2ᵏ.*log₂ n/);
  }
});

test('問8は停止条件と再帰の形を保持し、等差数列の公式で検算する', () => {
  for (const body of cases(8)) {
    const n = Number(paragraphs(body).match(/f\((\d+)\)の値/)![1]);
    assert.match(paragraphs(body), /自然数n/);
    const code = body.prompt[1];
    assert(code.type === 'code');
    assert.equal(code.text, 'f(n)：if n≦1 then return 1 else return n＋f(n−1)');
    unique(body, option => Number(blockText(option)) === n * (n + 1) / 2);
    ascending(body.choices.map(([block]) => Number(blockText(block))));
    assert(body.explanation.includes('＝' + n * (n + 1) / 2));
  }
});

test('問9は各MIPSの命令数から必要時間を逆算して検算する', () => {
  for (const body of cases(9)) {
    const time = Number(paragraphs(body).match(/平均命令実行時間が(\d+)ナノ秒/)![1]);
    unique(body, option => Number(blockText(option)) * 1_000_000 * time === 1_000_000_000);
    ascending(body.choices.map(([block]) => Number(blockText(block))));
    assert.match(body.explanation, /10億.*100万/);
  }
});

test('問16は三回線の状態を全列挙し、条件を満たす最小値と選択肢を検算する', () => {
  for (const body of cases(16)) {
    const prompt = paragraphs(body);
    const [, direct, side, target] = prompt.match(/東京〜大阪の稼働率は(0\.\d+)，東京〜名古屋の稼働率は(0\.\d+).*?(0\.\d+)以上/)!.map(Number);
    assert.match(prompt, /新設回線の稼働は既存の回線から独立/);
    const success = (backup: number) => inputs.reduce((sum, { A, B, C }) => {
      if (!A && !(B && C)) return sum;
      return sum + (A ? direct : 1 - direct) * (B ? side : 1 - side) * (C ? backup : 1 - backup);
    }, 0);
    const options = body.choices.map(([block]) => Number(blockText(block)));
    ascending(options);
    unique(body, option => {
      const candidate = Number(blockText(option));
      return success(candidate) >= target - 1e-10 && success(candidate - 0.001) < target - 1e-10;
    });
    assert(body.explanation.includes(options[body.correctIndex!].toFixed(3)));
  }
});

test('問18は全分数を適用し、時間の合計が半分になる一つを選ぶ', () => {
  for (const body of cases(18)) {
    const prompt = paragraphs(body);
    const [, cpu, io, overhead] = prompt.match(/CPU実行時間が(\d+)ミリ秒，入出力時間が(\d+)ミリ秒.*?オーバヘッドが(\d+)ミリ秒/)!.map(Number);
    assert.match(prompt, /半分に改善.*CPU実行時間とその他のオーバヘッドは変わらない/);
    const denominator = (block: Block) => Number(blockText(block).match(/^1／(\d+)$/)![1]);
    assert.deepEqual(body.choices.map(([block]) => denominator(block)), [6, 4, 3, 2]);
    unique(body, option => {
      const d = denominator(option);
      return 2 * (d * (cpu + overhead) + io) === d * (cpu + io + overhead);
    });
  }
});

test('問21はパス解決で全候補と原問の五規則を検算する', () => {
  for (const body of cases(21)) {
    const prompt = paragraphs(body);
    const [, current, relative] = prompt.match(/絶対パス名(\S+?)をもつディレクトリ.*?相対パス名(\S+?)をもつファイル/)!
      .map(value => value.replaceAll('¥', '\\'));
    assert.equal([...prompt.matchAll(/（[1-5]）/g)].length, 5);
    const absolute = win32.resolve('C:' + current, relative).slice(2).replaceAll('\\', '¥');
    unique(body, option => blockText(option) === absolute);
    assert(body.explanation.includes(absolute));
  }
});

test('問22は図の接続位置から各候補のコンパイラ・リンカ・ローダの入出力を検算する', () => {
  for (const body of cases(22)) {
    const alt = diagramIn(body, 'translation').alt;
    const [, object, executable, library] = alt.match(/コンパイラ→([abc])→リンカ→([abc])→ローダ。([abc])も上からリンカに入力/)!
    assert.equal(new Set([object, executable, library]).size, 3);
    unique(body, option => {
      const { columns, rows } = tableOf(option);
      assert.deepEqual(columns, ['a', 'b', 'c']);
      const assigned = Object.fromEntries(columns.map((key, i) => [key, rows[0][i]]));
      return assigned[object] === '目的プログラム' && assigned[library] === 'ライブラリモジュール' &&
        assigned[executable] === 'ロードモジュール';
    });
    assert.match(body.explanation, /目的プログラム.*結合してロードモジュール.*ローダ/);
  }
});

test('問24の原回路と全候補を全入力で比較し、同じ回路を一つに確定する', () => {
  for (const body of cases(24)) {
    const target = diagramIn(body, 'gate-target').alt.split('X＝')[1];
    const alternatives = body.choices.map(([option]) => diagramOf(option).alt.match(/X＝([^。]+)/)![1]);
    assert.equal(new Set(alternatives.map(truth)).size, 4);
    unique(body, (_, index) => truth(alternatives[index]) === truth(target));
    assert.match(diagramIn(body, 'gate-legend').alt, /AND.*OR.*NOT/);
  }
});

test('問25はAとBの接続・反転を読み取り、全ゲートの組を二進加算で検算する', () => {
  const gates: Partial<Record<string, (x: boolean, y: boolean) => boolean>> = {
    排他的論理和: (x, y) => x !== y, 論理積: (x, y) => x && y, 否定論理積: (x, y) => !(x && y),
    否定論理和: (x, y) => !(x || y), 論理和: (x, y) => x || y, 論理一致: (x, y) => x === y,
  };
  for (const body of cases(25)) {
    const alt = diagramIn(body, 'half-adder').alt;
    const [, invertA, targetA, invertB, targetB] = alt.match(/Aの出力(を反転した信号)?は([zc])，Bの出力(を反転した信号)?は([zc])/)!
    assert.notEqual(targetA, targetB);
    unique(body, option => {
      const { columns, rows } = tableOf(option);
      assert.deepEqual(columns, ['A', 'B']);
      const [a, b] = rows[0].map(name => gates[name]);
      assert(a && b);
      return booleans.every(x => booleans.every(y => {
        const output = { [targetA]: Number(a(x, y) !== Boolean(invertA)), [targetB]: Number(b(x, y) !== Boolean(invertB)) };
        return output.z + 2 * output.c === Number(x) + Number(y);
      }));
    });
    assert.match(body.explanation, /異なるときだけ1.*ともに1のときだけ1/);
  }
});

for (const [number, facts] of Object.entries(knowledgeFacts)) {
  test('問' + number + 'の対象と全候補の真偽を査読済みの対応表で確認する', () => {
    for (const body of cases(Number(number))) {
      const prompt = paragraphs(body);
      const matched = facts.filter(([target]) => target.test(prompt));
      assert.equal(matched.length, 1);
      const classified = body.choices.map(([option]) => facts.filter(([, choice]) => choice.test(blockText(option))));
      assert(classified.every(matches => matches.length === 1), JSON.stringify(body.choices));
      assert.equal(new Set(classified.flat()).size, 4);
      unique(body, option => matched[0][1].test(blockText(option)));
    }
  });
}

test('管理図6種類37状態を表示し、図と読み上げ、見出し、論理素子を照合する', () => {
  assert.equal(figures.length, 6);
  assert.deepEqual(renderers.map(renderer => renderer.profile), figures.map(figure => figure.profile));
  const seen = new Set<string>();
  for (const body of [3, 22, 24, 25].flatMap(cases)) {
    for (const block of [...body.prompt, ...body.choices.flat()]) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene;
      const definition = figures.find(item => item.profile === profile);
      const renderer = renderers.find(item => item.profile === profile);
      assert(definition && renderer);
      assert.equal(definition.alt(values), block.alt);
      definition.validate(values);
      assert.throws(() => definition.validate([definition.domain[0][1] + 1]), { code: 'FIGURE_PROFILE' });
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
      assert(markup.includes('data-source-figure="' + profile + '"'));
      assert.match(markup, /role="img".*aria-labelledby=.*aria-describedby=/);
      assert.match(markup, /class="diagram-scroll" tabindex="0"/);
      assert(markup.includes('var(--diagram-ink)'));
      assert(!markup.includes('<figcaption'));
      if (profile.endsWith('logic-expression')) {
        assert(markup.includes('data-logic-expression='));
        assert.equal([...markup.matchAll(/data-overline-depth=/g)].length, (block.alt.match(/NOT/g) ?? []).length);
      }
      if (profile.endsWith('gate-target')) {
        assert.equal([...markup.matchAll(/data-gate="AND"/g)].length, 1);
        assert.equal([...markup.matchAll(/data-gate="OR"/g)].length, 1);
        assert.equal([...markup.matchAll(/data-gate="NOT"/g)].length, [1, 2, 0, 1][values[0]]);
      }
      if (profile.endsWith('half-adder')) assert.equal([...markup.matchAll(/data-gate="NOT"/g)].length, values[0] >= 2 ? 1 : 0);
      seen.add(profile + ':' + values.join(','));
    }
  }
  assert.equal(seen.size, 37);
});
