import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2008SpringAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2008-spring-am-01-26';
import { legacy2008SpringAm0126Figures as figures } from '../../../src/core/generators/legacy-2008-spring-am-01-26-figures';
import { legacy2008SpringAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2008SpringAm0126Figures';
import { knowledgeFacts } from '../../fixtures/legacy-2008-spring-am-01-26-facts';

const official = 'イエイアウアイウイイアイエウエアウアウウアエイイエエ';
const cases = (number: number) => [0, 1, 2, 3].map(index => definitions[number - 1].build([index]));
const paragraphs = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const blockText = (block: Block) => {
  if (block.type === 'formula' || block.type === 'diagram') return block.alt;
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
const tableOf = (block: Block) => { assert(block.type === 'table'); return block; };
const figureOf = (block: Block) => { assert(block.type === 'diagram' && block.scene.kind === 'source_figure'); return block; };
const shape = (blocks: readonly Block[]) => blocks.map(block =>
  block.type === 'diagram' && block.scene.kind === 'source_figure' ? [block.type, block.scene.profile]
    : block.type === 'code' ? [block.type, block.language] : [block.type]);
function structure(body: GeneratedBody) {
  return { prompt: shape(body.prompt), choices: body.choices.map(shape),
    contexts: (body.contexts ?? []).map(({ presentation, blocks }) => [presentation, shape(blocks)]) };
}
function unique(body: GeneratedBody, accepts: (option: Block, index: number) => boolean) {
  assert.deepEqual(body.choices.flatMap(([block], index) => accepts(block, index) ? [index] : []), [body.correctIndex], paragraphs(body));
}
function ascending(values: number[]) { assert.deepEqual(values, [...new Set(values)].sort((a, b) => a - b)); }

test('公式26キー、104条件・416候補と基準本文・図・選択肢の構成を照合する', () => {
  assert.equal(definitions.length, 26);
  let seen = 0;
  for (const [position, definition] of definitions.entries()) {
    const bodies = cases(position + 1), original = bodies[0];
    assert.equal(definition.source, '2008h20h-fe-am-' + (position + 1));
    assert.equal(definition.sourceAnswer, official[position]);
    assert.equal('アイウエ'[original.correctIndex!], official[position]);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(({ minimum, maximum }) => [minimum, maximum]), [[0, 3]]);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4, definition.source);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.choices[body.correctIndex!]))).size, 4, definition.source);
    for (const [index, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert.deepEqual(structure(body), structure(original), definition.source + ' 条件' + index);
      assert(body.explanation.length > 35);
      seen += body.choices.length;
    }
    for (const input of [[-1], [4], [NaN], [0.5], [], [0, 0], Array<number>(1)])
      assert.throws(() => definition.build(input), { code: 'PARAMETER_CONSTRAINT' });
  }
  assert.equal(seen, 416);
});

test('問1は各候補で全入力を実行し、取り出したけたと位取りから元の値を復元する', () => {
  for (const body of cases(1)) {
    const prompt = paragraphs(body);
    const [width, radix, repetitions] = prompt.match(/(\d+)ビットの2進数 n を(\d+)進数.*(\d+)回繰り返す/)!.slice(1).map(Number);
    assert.match(prompt, /下位のけたから順にスタック.*16進数xxxxを表す/);
    unique(body, option => {
      const table = tableOf(option);
      assert.deepEqual(table.columns, ['a', 'b']);
      const [maskText, shiftText] = table.rows[0];
      const mask = Number.parseInt(maskText.match(/n AND ([\dA-F]+)₁₆/)![1], 16);
      const [direction, distanceText] = shiftText.match(/([左右])に(\d+)ビット/)!.slice(1);
      const shift = 2 ** Number(distanceText), limit = 2 ** width;
      for (let input = 0; input < limit; input++) {
        let n = input, reconstructed = 0;
        for (let i = 0; i < repetitions; i++) {
          const selected = n & mask;
          if (selected >= radix) return false;
          reconstructed += selected * radix ** i;
          n = direction === '右' ? Math.floor(n / shift) : n * shift % limit;
        }
        if (reconstructed !== input) return false;
      }
      return true;
    });
  }
});

test('問2は16進小数の各位の重みを整数にし、交差積で元の分数と比較する', () => {
  for (const body of cases(2)) {
    const [n, d] = paragraphs(body).match(/分数 (\d+)\/(\d+)/)!.slice(1).map(Number);
    const rank = (value: string) => {
      const [, first, second] = value.match(/^0\.([\dA-F])([\dA-F])$/)!;
      return 16 * parseInt(first, 16) + parseInt(second, 16);
    };
    ascending(body.choices.map(([block]) => rank(blockText(block))));
    unique(body, option => rank(blockText(option)) * d === n * 256);
  }
});

function symbolic(tex: string, n: number) {
  const reduced = tex.replace('2^{n-1}', String(2 ** (n - 1))).replace('2^n', String(2 ** n));
  const group = reduced.match(/^-\((\d+)-(\d+)\)$/);
  if (group) return -(Number(group[1]) - Number(group[2]));
  const binary = reduced.match(/^(\d+)([+-])(\d+)$/);
  if (binary) return Number(binary[1]) + (binary[2] === '+' ? 1 : -1) * Number(binary[3]);
  assert.match(reduced, /^-?\d+$/);
  return Number(reduced);
}
test('問3は符号桁と各下位桁の重みを加えて全ての数式を照合する', () => {
  for (const body of cases(3)) {
    const pattern = paragraphs(body).match(/「([01…]+)」/)![1];
    const expected = (n: number) => {
      const [a, b] = pattern.split('…');
      const bits = a + a.at(-1)!.repeat(n - a.length - b.length) + b;
      const width = bits.length;
      return -(2 ** (width - 1)) + [...bits.slice(1)].reduce((sum, bit, i) => sum + Number(bit) * 2 ** (width - 2 - i), 0);
    };
    unique(body, option => {
      assert(option.type === 'formula');
      return [6, 7, 10, 14].every(n => symbolic(option.text, n) === expected(n));
    });
  }
});

test('問4は実際に左シフトと加算を順に適用し、倍率を検算する', () => {
  for (const body of cases(4)) {
    const prompt = paragraphs(body), factor = Number(prompt.match(/(\d+)倍にする操作/)![1]);
    assert.match(prompt, /けたあふれは，起こらない/);
    unique(body, option => {
      const value = blockText(option);
      const shifts = [...value.matchAll(/(\d+)ビット左にシフト/g)].map(match => BigInt(match[1]));
      assert.equal(shifts.length, 2);
      return [1n, 3n, 17n, 129n].every(x => {
        const first = x << shifts[0];
        const result = value.includes('更に') ? (first + x) << shifts[1] : first + (x << shifts[1]);
        return result === BigInt(factor) * x;
      });
    });
  }
});

function exactTerm(mantissa: string, exponent: number) {
  const [, fraction = ''] = mantissa.split('.');
  return { numerator: BigInt('0b' + mantissa.replace('.', '')), scale: exponent - fraction.length };
}
test('問5は二進有理数の厳密な和差を作り、必要な有効ビット数を検算する', () => {
  for (const body of cases(5)) {
    const precision = Number(paragraphs(body).match(/仮数部が(\d+)ビット/)![1]);
    for (const available of [precision, precision + 1]) {
      unique(body, option => {
        const [, a, first, operation, b, second] = blockText(option)
          .match(/^\(([01.]+)\)₂×2の([−\d]+)乗 ([＋−]) \(([01.]+)\)₂×2の([−\d]+)乗$/)!;
        const left = exactTerm(a, Number(first.replace('−', '-'))), right = exactTerm(b, Number(second.replace('−', '-')));
        const scale = Math.min(left.scale, right.scale);
        const x = left.numerator << BigInt(left.scale - scale), y = right.numerator << BigInt(right.scale - scale);
        const result = operation === '＋' ? x + y : x - y;
        const normalized = (result < 0n ? -result : result).toString(2).replace(/0+$/, '');
        return normalized.length > available;
      });
    }
  }
});

test('問6は接線の方法、微分条件、初期値の個数、収束の4候補を検算する', () => {
  const bodies = cases(6);
  const facts: readonly [RegExp, boolean][] = [[/接線を利用/, true], [/解の付近で微分不可能/, false],
    [/異なる初期値を二つ/, false], [/どのような初期値.*必ず/, false]];
  unique(bodies[0], option => {
    const matched = facts.filter(([pattern]) => pattern.test(blockText(option)));
    assert.equal(matched.length, 1);
    return matched[0][1];
  });
  for (const body of bodies.slice(1)) {
    const [c, start] = paragraphs(body).match(/f\(x\)＝x²−(\d+)，初期値をx＝(\d+)/)!.slice(1).map(Number);
    const f = (x: number) => x * x - c;
    const slope = (f(start + 1) - f(start - 1)) / 2;
    const intersects = slope !== 0;
    const estimate = intersects ? start - f(start) / slope : NaN;
    const statements: readonly [RegExp, boolean][] = [
      [/接線はx軸と一点で交わる/, intersects], [/傾きが0なので.*更新式を使えない/, !intersects],
      [/異なる初期値が?を?二つ|異なる初期値を二つ/, false], [/必ず解の近似値が得られる/, false],
      [/接線の傾きは0/, slope === 0], [/次の値は3より大きくなる/, estimate > start],
      [/初期値一つと.*次の近似値を計算できる/, intersects], [/接線はx軸に平行/, slope === 0],
      [/関数値が0なので.*導関数は必ず0/, f(start) === 0 && slope === 0], [/初期値と同じ値になる/, estimate === start],
    ];
    unique(body, option => {
      const matched = statements.filter(([pattern]) => pattern.test(blockText(option)));
      assert.equal(matched.length, 1, blockText(option));
      return matched[0][1];
    });
  }
});

test('問7は各長さの文字列を展開し、空列を除いた総数と全候補の役割を確認する', () => {
  for (const body of cases(7)) {
    const [size, max] = paragraphs(body).match(/(\d+)個の文字.*長さ1以上(\d+)以下/)!.slice(1).map(Number);
    const symbols = 'ABC'.slice(0, size).split('');
    let level = [''];
    const words = [];
    for (let depth = 1; depth <= max; depth++) {
      level = level.flatMap(prefix => symbols.map(symbol => prefix + symbol));
      words.push(...level);
    }
    assert.equal(words.length, new Set(words).size);
    const values = body.choices.map(([option]) => Number(blockText(option)));
    ascending(values);
    assert.deepEqual(values, [level.length, words.length, words.length + 1, level.length * symbols.length]);
    unique(body, option => Number(blockText(option)) === words.length);
  }
});

function renderBlock(block: Block) {
  const diagram = figureOf(block);
  assert(diagram.scene.kind === 'source_figure');
  const { profile, values } = diagram.scene;
  const renderer = renderers.find(item => item.profile === profile)!;
  return renderToStaticMarkup(createElement(renderer.component, { values, caption: diagram.caption }));
}

test('問8は実描画の座標から相関係数と回帰直線の傾きを独立検算する', () => {
  for (const body of cases(8)) {
    const wanted = Number(paragraphs(body).match(/標本相関係数が([−\d.]+)のもの/)![1].replace('−', '-'));
    unique(body, option => {
      const html = renderBlock(option);
      const points = [...html.matchAll(/data-sample="true" cx="([^"]+)" cy="([^"]+)"/g)].map(([, x, y]) => [Number(x), -Number(y)]);
      assert.equal(points.length, 6);
      assert(points.every(([x, y]) => x > 38 && x < 227 && -y > 19 && -y < 139));
      const n = points.length;
      const sx = points.reduce((sum, [x]) => sum + x, 0), sy = points.reduce((sum, [, y]) => sum + y, 0);
      const sxy = points.reduce((sum, [x, y]) => sum + x * y, 0), sxx = points.reduce((sum, [x]) => sum + x * x, 0);
      const syy = points.reduce((sum, [, y]) => sum + y * y, 0);
      const covariance = n * sxy - sx * sy, variance = n * sxx - sx * sx;
      const slope = covariance / variance, intercept = (sy - slope * sx) / n;
      const line = html.match(/data-regression="least-squares" x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/)!;
      const [x1, y1, x2, y2] = line.slice(1).map(Number);
      for (const [x, y] of [[x1, y1], [x2, y2]]) assert(Math.abs(slope * x + intercept + y) < 1e-9);
      const correlation = covariance / Math.sqrt(variance * (n * syy - sy * sy));
      return Math.abs(correlation - wanted) < 1e-9;
    });
  }
});

test('問9は論理式の各項を解釈し、真理値表8行と否定上線を照合する', () => {
  for (const body of cases(9)) {
    const table = tableOf(body.prompt[1]);
    assert.deepEqual(table.columns, ['x', 'y', 'z', 'f(x, y, z)']);
    assert.deepEqual(table.rows.map(row => row.slice(0, 3).join('')), ['TTT', 'TTF', 'TFT', 'TFF', 'FTT', 'FTF', 'FFT', 'FFF']);
    unique(body, option => {
      const expression = blockText(option), negations = [...expression.matchAll(/否定([xyz])/g)].map(item => item[1]);
      const diagram = renderBlock(option);
      assert.deepEqual([...diagram.matchAll(/data-negation="([xyz])"/g)].map(item => item[1]), negations);
      return table.rows.every(([x, y, z, expected]) => {
        const values: Record<string, boolean> = { x: x === 'T', y: y === 'T', z: z === 'T' };
        const terms = expression.split('∨').map(part => part.replace(/[（）]/g, '').split('∧').map(token => token.trim()));
        const found = terms.some(term => term.every(token => values[token.at(-1)!] !== token.startsWith('否定')));
        return found === (expected === 'T');
      });
    });
  }
});

test('問10は各バイトをビットに分解し、元の7ビットと全体の偶奇を照合する', () => {
  for (const body of cases(10)) {
    const prompt = paragraphs(body);
    const odd = prompt.includes('奇数パリティ');
    const input = prompt.match(/文字コード([\dA-F，]+)にパリティ/)![1].split('，').map(value => parseInt(value, 16));
    unique(body, option => blockText(option).split('，').map(text => parseInt(text, 16)).every((byte, i) => {
      const bits = Array.from({ length: 8 }, (_, bit) => Math.floor(byte / 2 ** bit) % 2);
      const low = bits.slice(0, 7).reduce((sum, digit, position) => sum + digit * 2 ** position, 0);
      return low === input[i] && (bits.reduce((a, b) => a + b, 0) % 2 === 1) === odd;
    }));
  }
});

test('問11はBNFの外側を取り除いて、全候補が基底列まで還元できるか照合する', () => {
  for (const body of cases(11)) {
    const [, base, left, right] = blockText(body.prompt[1]).match(/^<S> ::= ([01]{2}) \| ([01])<S>([01])$/)!;
    unique(body, option => {
      let value = blockText(option);
      assert.match(value, /^[01]{6}$/);
      while (value.length > base.length) {
        if (!(value.startsWith(left) && value.endsWith(right))) return false;
        value = value.slice(1, -1);
      }
      return value === base;
    });
  }
});

test('問12は左右の子をもつ木を構成し、存在・不存在の各キーで探索する', () => {
  for (const body of cases(12)) {
    const prompt = paragraphs(body);
    assert.match(prompt, /左右に子が存在.*存在するとは限らない/);
    const count = Number(prompt.match(/総数が(\d+)/)![1]);
    type Node = { key: number; left?: Node; right?: Node };
    function tree(low: number, high: number): Node | undefined {
      if (low > high) return;
      const mid = Math.floor((low + high) / 2);
      return { key: mid * 2, left: tree(low, mid - 1), right: tree(mid + 1, high) };
    }
    const root = tree(1, count);
    let maximum = 0;
    for (let target = 0; target <= count * 2 + 1; target++) {
      let node = root, comparisons = 0;
      while (node) {
        comparisons++;
        if (target === node.key) break;
        node = target < node.key ? node.left : node.right;
      }
      maximum = Math.max(maximum, comparisons);
    }
    ascending(body.choices.map(([option]) => Number(blockText(option))));
    unique(body, option => Number(blockText(option)) === maximum);
  }
});

test('問13は記述する整列手順の不変条件と四つの方法名を照合する', () => {
  const algorithms: readonly [RegExp, string][] = [
    [/一定間隔|一定の間隔/, 'シェルソート'], [/隣り合う/, 'バブルソート'],
    [/基準値/, 'クイックソート'], [/順序木/, 'ヒープソート'],
  ];
  for (const [i, body] of cases(13).entries()) {
    const prompt = paragraphs(body);
    if (i === 1) assert.match(prompt, /昇順/);
    if (i === 2) assert.match(prompt, /降順/);
    if (i === 3) assert.match(prompt, /同じキーを持つ/);
    unique(body, option => {
      const [name, instruction] = blockText(option).split('では，');
      const matches = algorithms.filter(([steps]) => steps.test(instruction));
      assert.equal(matches.length, 1, instruction);
      if (name === 'バブルソート' && prompt.includes('降順') && name === matches[0][1])
        assert.match(instruction, /左側のキーが右側より小さいときに交換/);
      if (name === 'クイックソート' && prompt.includes('同じキー') && name === matches[0][1])
        assert.match(instruction, /基準値と等しいキー/);
      return matches[0][1] === name;
    });
  }
});

test('問14は元のキーとの距離が97の倍数となるキーを全探索する', () => {
  for (const body of cases(14)) {
    const [key, max] = paragraphs(body).match(/キー(\d+)とハッシュ値が一致するものは，キー1〜(\d+)/)!.slice(1).map(Number);
    const count = Array.from({ length: max }, (_, i) => i + 1).filter(value => Number.isInteger((key - value) / 97)).length;
    ascending(body.choices.map(([option]) => Number(blockText(option))));
    unique(body, option => Number(blockText(option)) === count);
  }
});

test('問15はユークリッドの除算商の合計から流れ図の比較回数を独立検算する', () => {
  for (const body of cases(15)) {
    const [a, b] = paragraphs(body).match(/A が(\d+)，B が(\d+)/)!.slice(1).map(Number);
    let high = a, low = b, total = 0, iterations = 0;
    while (low > 0) {
      const q = Math.floor(high / low);
      total += q;
      iterations++;
      [high, low] = [low, high - low * q];
    }
    assert.match(figureOf(body.prompt[1]).alt, /L＞Sなら L−S.*L＜Sなら S−L.*L＝Sなら A，B，L を出力/);
    const values = body.choices.map(([option]) => Number(blockText(option)));
    ascending(values);
    assert.deepEqual(values, [iterations, total - 2, total - 1, total]);
    unique(body, option => Number(blockText(option)) === total);
    assert(body.explanation.includes('両方が' + high));
  }
});

test('問19は100命令を実行したクロック数で割り、全候補を比較する', () => {
  for (const body of cases(19)) {
    const hertz = Number(paragraphs(body).match(/周波数が([\d.]+) GHz/)![1]) * 1e9;
    const table = tableOf(body.prompt[1]);
    assert.deepEqual(table.columns, ['命令種別', '実行時間（クロック）', '出現頻度（%）']);
    const history = table.rows.flatMap(([, clocks, count]) => Array<number>(Number(count)).fill(Number(clocks)));
    assert.equal(history.length, 100);
    const duration = history.reduce((seconds, clocks) => seconds + clocks / hertz, 0);
    const rate = history.length / duration / 1e6;
    ascending(body.choices.map(([option]) => Number(blockText(option))));
    unique(body, option => {
      const choice = Number(blockText(option));
      return rate + 1e-8 >= choice - 0.5 && rate + 1e-8 < choice + 0.5;
    });
  }
});

test('問25は一定の画素行列を両方の解像度で割り、面積を直接求める', () => {
  for (const body of cases(25)) {
    const [input, output] = [...paragraphs(body).matchAll(/解像度(\d+) dpi/g)].map(item => Number(item[1]));
    const first = (1800 / input) * (3600 / input), second = (1800 / output) * (3600 / output);
    const fractions = body.choices.map(([option]) => {
      const [n, d = '1'] = blockText(option).split('/');
      return [Number(n), Number(d)];
    });
    ascending(fractions.map(([n, d]) => n / d));
    unique(body, (_, index) => second * fractions[index][1] === first * fractions[index][0]);
  }
});

for (const [number, reviewed] of Object.entries(knowledgeFacts)) {
  test('問' + number + 'の4条件で全選択肢を独立に査読した対応表と照合する', () => {
    for (const body of cases(Number(number))) {
      const prompt = paragraphs(body), matching = reviewed.filter(([condition]) => condition.test(prompt));
      assert.equal(matching.length, 1, prompt);
      const [, options] = matching[0];
      unique(body, block => {
        const matches = options.filter(([pattern]) => pattern.test(blockText(block)));
        assert.equal(matches.length, 1, blockText(block));
        return matches[0][1];
      });
    }
  });
}

test('図3種9状態の描画、代替説明と入力域を確認する', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  let count = 0;
  for (const figure of figures) {
    const renderer = renderers.find(item => item.profile === figure.profile)!;
    const [[start, end]] = figure.domain;
    assert.equal(start, 0);
    assert.throws(() => figure.validate([end + 1]), { code: 'FIGURE_PROFILE' });
    for (let index = start; index <= end; index++) {
      const values = [index], alt = figure.alt(values);
      const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: '検証図' }));
      assert(html.includes('data-source-figure="' + figure.profile + '"'));
      assert.match(html, /role="img".*aria-labelledby="[^"]+".*aria-describedby="[^"]+"/);
      assert(html.includes('<desc') && html.includes(alt));
      if (figure.profile.endsWith('-gcd-flow')) assert.match(html, /開始.*A → L.*B → S.*L：S.*L − S → L.*S − L → S.*終了/);
      count++;
    }
  }
  assert.equal(count, 9);
});
