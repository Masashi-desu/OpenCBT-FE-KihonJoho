import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody, GenerationDefinition } from '../../../src/core/generators/definition';
import { legacy2015AutumnAm0126Definitions as definitions } from '../../../src/core/generators/legacy-2015-autumn-am-01-26';
import { legacy2015AutumnAm0126Figures } from '../../../src/core/generators/legacy-2015-autumn-am-01-26-figures';
import { legacy2015AutumnAm0126FigureRenderers } from '../../../src/ui/Legacy2015AutumnAm0126Figures';
import { Legacy2018TechnicalFigure } from '../../../src/ui/Legacy2018TechnicalFigures';
import review from '../../fixtures/legacy-2015-autumn-am-01-26-reviewed.json';

const numbers = Array.from({ length: 26 }, (_, i) => i + 1);
const counts = [7, 8, 5, 4, 4, 12, 4, 6, 4, 4, 4, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const labels = 'アイウエ';
const normalize = (text: string) => text.normalize('NFKC').replace(/\s/g, '')
  .replace(/[，,、]/g, '、').replace(/·/g, '・').replace(/\u301c/g, '〜');
const stems = (body: GeneratedBody) => body.prompt.flatMap(block => 'text' in block ? [block.text] : []);
const choices = (body: GeneratedBody) => body.choices.map(([block, ...extra]) => {
  assert.equal(extra.length, 0);
  assert(block.type === 'paragraph');
  return block.text;
});
function original(number: number) {
  return review.rows[number - 1];
}
function domain(definition: GenerationDefinition) {
  let cases: number[][] = [[]];
  for (const { minimum, maximum } of definition.fields)
    cases = cases.flatMap(values => Array.from({ length: maximum - minimum + 1 }, (_, i) => [...values, minimum + i]));
  return cases;
}
function assertUnique(body: GeneratedBody, truth: boolean[]) {
  assert.equal(truth.length, 4);
  assert.deepEqual(truth.flatMap((matches, i) => matches ? [i] : []), [body.correctIndex]);
}
function assertNumeric(body: GeneratedBody, all: number[], correct: number, format = (n: number) => String(n)) {
  const expected = [...all].sort((a, b) => a - b).map(format);
  assert.equal(new Set(expected).size, 4);
  assert.deepEqual(choices(body), expected);
  assertUnique(body, expected.map(value => value === format(correct)));
}
function diagram(body: GeneratedBody) {
  const blocks = body.prompt.filter(block => block.type === 'diagram');
  assert.equal(blocks.length, 1);
  const block = blocks[0];
  assert.equal(block.scene.kind, 'source_figure');
  assert(block.scene.kind === 'source_figure');
  return { block, ...block.scene };
}
function rendered(body: GeneratedBody) {
  const { block, profile, values } = diagram(body);
  if (profile === 'legacy-2018-shortest-grid')
    return renderToStaticMarkup(createElement(Legacy2018TechnicalFigure, { profile, values, caption: block.caption }));
  const semantic = legacy2015AutumnAm0126Figures.find(figure => figure.profile === profile);
  const renderer = legacy2015AutumnAm0126FigureRenderers.find(entry => entry.profile === profile);
  assert(semantic && renderer);
  semantic.validate(values);
  assert.equal(semantic.alt(values), block.alt);
  return renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
}

test('2015秋午前問1〜26の原問・頁・全択・公式キーと生成基準が対応する', () => {
  assert.deepEqual(review.rows.map(row => row.number), numbers);
  assert.deepEqual(definitions.map(row => row.source), numbers.map(n => `2015h27a-fe-am-${n}`));
  for (const definition of definitions) {
    const n = Number(definition.source.split('-').at(-1));
    const row = original(n), body = definition.build(definition.reference);
    assert.equal(definition.sourceAnswer, row.officialKey);
    assert.equal(labels[body.correctIndex!], row.officialKey);
    assert.deepEqual(choices(body).map(normalize), row.choices.map(normalize));
    const stem = stems(body)[0].replace('、故障は独立で', '');
    assert.equal(normalize(stem), normalize(row.stem));
    assert(row.fullAlt.startsWith(`問${n}。`));
    assert.deepEqual(row.fullAlt.split('\n').slice(-4).map(line => line[0]), [...labels]);
    assert(!/正答|正解|解答例/.test(row.fullAlt));
    assert(body.explanation.length > 30);
  }
});

const gridCases = [
  [5, 4, 2, 2], [4, 3, 1, 1], [4, 3, 1, 2], [4, 4, 1, 1],
  [4, 4, 2, 3], [4, 5, 1, 1], [5, 4, 1, 2], [5, 3, 2, 2],
];
const cacheCases = [
  ['減少', '低下', '減少', '低下'],
  ['増加', '上昇', '減少', '低下'],
  ['減少', '上昇', '増加', '低下'],
  ['減少', '上昇', '減少', '上昇'],
];
const sectorCases = [[500, 8, 2000, 9000], [500, 8, 2500, 5500], [400, 8, 1400, 4300], [500, 6, 1200, 6600], [400, 6, 1600, 5300]];
const memoryLayouts = [[500, 100, 800, 800], [400, 200, 600, 800], [600, 100, 400, 800], [400, 200, 560, 800]];
const gridPatterns = [
  ['01111110', '01000000', '01000000', '01111000', '01000000', '01000000', '01000000', '01000000'],
  ['01000000', '01000000', '01000000', '01000000', '01000000', '01000000', '01000000', '01111110'],
  ['01111100', '01000100', '01000100', '01111100', '01000000', '01000000', '01000000', '01000000'],
];

const numberResolvers: Partial<Record<number, (body: GeneratedBody, values: number[]) => void>> = {
  1(body, [n, power]) {
    const divis = 2 ** power;
    assert.match(stems(body)[0], new RegExp(`${n}÷${divis}`));
    const roles = [[n + 4, divis * 2], [n + 6, divis * 2], [n, divis], [2 * n, divis]];
    const actual = choices(body).map((text, i) => {
      assert.match(text, /^0\.[01]{4,7}$/);
      const bits = text.split('.')[1];
      const weight = [...bits].reduce((sum, bit, index) => sum + Number(bit) / 2 ** (index + 1), 0);
      assert.equal(weight, roles[i][0] / roles[i][1]);
      return weight === n / divis;
    });
    assertUnique(body, actual);
    if (n !== 7 || power !== 5) assert.equal(new Set(choices(body).map(value => value.length)).size, 1);
  },
  2(body, [index]) {
    const [width, height, rCol, rRow] = gridCases[index];
    assert.deepEqual(diagram(body).values, [width, height, rCol, rRow]);
    assert.match(stems(body)[0], /点Pから点Rを通って、点Qに至る最短経路/);
    function paths(cols: number, rows: number) {
      const ways = Array.from({ length: rows + 1 }, () => Array<number>(cols + 1).fill(0));
      ways[0][0] = 1;
      for (let y = 0; y <= rows; y++)
        for (let x = 0; x <= cols; x++) {
          if (x < cols) ways[y][x + 1] += ways[y][x];
          if (y < rows) ways[y + 1][x] += ways[y][x];
        }
      return ways[rows][cols];
    }
    const left = paths(rCol, rRow), right = paths(width - rCol, height - rRow);
    const product = left * right;
    assertNumeric(body, [left + right, rCol * rRow * (width - rCol) * (height - rRow), 2 ** (width - rCol + height - rRow), product], product);
    assert(body.explanation.includes(`${product}通り`));
  },
  3(body, [index]) {
    const delta = [0, 1, -1, 2, -2][index], a = 11, first = 25, fixed = 37;
    const f = (x: number): number => x === a ? first : [first + delta, fixed + delta].includes(x) ? fixed : 0;
    const input = `y${delta > 0 ? '＋' + delta : delta < 0 ? '−' + -delta : ''}`;
    assert.deepEqual(stems(body)[1].split('\n'), ['① x←a', '② y←f(x)', '③ yの値を表示する。', `④ x←${input}`, '⑤ ②に戻る。']);
    assert(stems(body)[0].includes('実数型') && stems(body)[0].includes('値に変化がなくなった'));
    assert.deepEqual(choices(body), ['f(a)=y', `f(${input})=0`, `f(${input})=a`, `f(${input})=y`]);
    const output = f(f(a) + delta);
    assert.equal(output, fixed);
    assertUnique(body, [f(a) === output, f(output + delta) === 0, f(output + delta) === a, f(output + delta) === output]);
    assert(body.explanation.includes(`f(${input})=y`));
  },
  6(body, [operation, pattern]) {
    const { values } = diagram(body);
    assert.deepEqual(values, [operation, pattern]);
    assert(stems(body)[0].includes('図1のaに入れるべき操作'));
    assert.match(stems(body)[1], /初期値，増分，終値/);
    const svg = rendered(body);
    for (const label of ['図1 流れ図', '図2 配列Aの状態', '図3 実行後の配列Bの状態', 'ループ1', 'ループ2', 'i：0，1，7', 'j：0，1，7'])
      assert(svg.includes(label), label);
    const displayed = [new Set<string>(), new Set<string>()];
    for (const star of svg.matchAll(/<text[^>]*?x="(\d+)" y="(\d+)"[^>]*>＊<\/text>/g)) {
      const x = Number(star[1]), y = Number(star[2]);
      const panel = Number(x >= 710);
      displayed[panel].add(`${(y - 206) / 30},${(x - 395 - panel * 330) / 30}`);
    }
    const initial = new Set(gridPatterns[pattern].flatMap((row, i) =>
      [...row].flatMap((digit, j) => digit === '1' ? [`${i},${j}`] : [])));
    assert.deepEqual(displayed[0], initial);
    const originalOrder = [
      (i: number, j: number) => [7 - i, 7 - j], (i: number, j: number) => [7 - j, i],
      (i: number, j: number) => [i, 7 - j], (i: number, j: number) => [j, 7 - i],
    ];
    assert.deepEqual(choices(body), original(6).choices);
    assertUnique(body, originalOrder.map(convert => {
      const alternative = new Set([...initial].map(cell => {
        const [i, j] = cell.split(',').map(Number);
        return convert(i, j).join(',');
      }));
      return alternative.size === displayed[1].size && [...alternative].every(cell => displayed[1].has(cell));
    }));
    const targetTexts = ['180度回転', '左90度回転', '左右反転', '右90度回転'];
    assert(body.explanation.includes(targetTexts[operation]));
  },
  8(body, [n]) {
    assert(stems(body)[0].includes(`f(${n})`));
    assert.equal(normalize(stems(body)[1]), normalize('f(n): if n≦1 then return 1 else return n + f(n−1)'));
    let total = 1;
    for (let i = n; i > 1; i--) total += i;
    assertNumeric(body, [n + 1, n + n - 1, total, n ** 2], total);
    assert(body.explanation.includes(`＝${total}`));
  },
  9(body, [index]) {
    const rate = [50, 20, 10, 100][index];
    assert.equal(stems(body)[0], `${rate}MIPSのプロセッサの平均命令実行時間は幾らか。`);
    const options = choices(body).map(text => {
      const unit = /^(\d+)(ナノ秒|マイクロ秒)$/.exec(text);
      assert(unit);
      return Number(unit[1]) * (unit[2] === 'マイクロ秒' ? 1000 : 1);
    });
    const nanos = 1_000_000_000 / (rate * 1_000_000);
    assert.deepEqual(options, [nanos, rate, nanos * 100, rate * 100].sort((a, b) => a - b));
    assertUnique(body, options.map(value => value * rate === 1000));
    assert(body.explanation.includes(`${nanos}ナノ秒`));
  },
  10(body, [index]) {
    const direction = cacheCases[index];
    assert.deepEqual(choices(body), ['キャッシュメモリへのアクセス時間の', 'ヒット率の', 'ミスペナルティの', 'ミス率の'].map((s, i) => s + direction[i]));
    assert.equal(body.prompt.length, 1);
    assert.equal(body.prompt[0].type, 'paragraph');
    if (index) assert.match(stems(body)[0], /ここで、ヒット率とミス率はともに0より大きい。.*正の追加時間.*示された変化だけ/);
    const changes = direction.map(word => /増加|上昇/.test(word) ? 1 : -1);
    const before = 70 * 10 + 30 * 50;
    const after = changes.map((change, i) => {
      const hitTime = 10 + (i === 0 ? change : 0), missExtra = 40 + (i === 2 ? change : 0);
      const hits = 70 + (i === 1 ? change : i === 3 ? -change : 0);
      return hits * hitTime + (100 - hits) * (hitTime + missExtra);
    });
    assertUnique(body, after.map(time => time > before));
    assert(body.explanation.includes(choices(body)[body.correctIndex!]));
  },
  12(body, [index]) {
    const [sector, block, a, b] = sectorCases[index];
    const text = stems(body)[0].replace(/,/g, '');
    assert(text.includes(`${sector}バイトのセクタ${block}個を1ブロック`));
    assert(text.includes(`${a}バイト及び${b}バイト`));
    assert.match(text, /管理情報が占めるセクタは考慮しない/);
    const count = (size: number, sectors: number) => {
      let remaining = size, used = 0;
      while (remaining > 0) {
        remaining -= sector * sectors;
        used += sectors;
      }
      return used;
    };
    const whole = count(a, block) + count(b, block);
    assertNumeric(body, [count(a, 1) + count(b, 1), count(a, 1) + count(b, block), count(a, block) + count(b, 1), whole], whole);
    assert(body.explanation.includes(`${whole}セクタ`));
  },
  15(body, [tenths]) {
    assert.match(stems(body)[0], new RegExp(`稼働率はいずれも0\\.${tenths}とし、故障は独立で`));
    const states = [false, true].flatMap(a => [false, true].map(b => ({
      onlyOne: a !== b, someStopped: !(a && b),
      weight: (a ? tenths : 10 - tenths) * (b ? tenths : 10 - tenths),
    })));
    const sum = (key: 'onlyOne' | 'someStopped') => states.reduce((total, state) => total + (state[key] ? state.weight : 0), 0);
    const exclusive = sum('onlyOne');
    const unit = (n: number) => (n / 100).toFixed(2);
    assertNumeric(body, [exclusive / 2, (10 - tenths) * 10, exclusive, sum('someStopped')], exclusive, unit);
    assert(body.explanation.includes(unit(exclusive)));
  },
  18(body, [index]) {
    const [first, freed, moving, last] = memoryLayouts[index], start = first + freed, limit = start + moving + last;
    assert.deepEqual(diagram(body).values, [index]);
    assert.match(stems(body)[0], /4バイト単位.*それぞれ30ナノ秒.*1kバイトは1,000バイト.*オーバヘッドは考慮しない/);
    const svg = rendered(body);
    const sizes = [...svg.matchAll(/data-size-kb="(\d+)"/g)].map(match => Number(match[1]));
    assert.deepEqual(sizes, memoryLayouts[index]);
    const makesOneHole = (at1: number, at3: number) => {
      const occupied = [[at1, at1 + first], [at3, at3 + moving]].sort((a, b) => a[0] - b[0]);
      return occupied[0][1] <= occupied[1][0] &&
        [occupied[0][0], occupied[1][0] - occupied[0][1], limit - occupied[1][1]].filter(gap => gap > 0).length === 1;
    };
    assert(makesOneHole(0, first));
    for (let start1 = 0; start1 <= limit - first; start1++) assert(!makesOneHole(start1, start));
    const transfer = (size: number, directions: number) => size * 250 * directions * 30 / 1_000_000;
    const expected = transfer(moving, 2);
    assertNumeric(body, [transfer(freed, 2), transfer(moving, 1), transfer(first, 2), expected], expected, n => n.toFixed(1));
    assert(body.explanation.includes(expected.toFixed(1)));
  },
};

function parseExpression(text: string, env: Record<string, number>, productOp: string, plusOp: string,
  combine: (op: string, left: number, right: number) => number) {
  const tokens = text.replace(/\s/g, '').match(/[A-Z]\d*|[()+*/・−¬]/g) ?? [];
  assert.equal(tokens.join(''), text.replace(/\s/g, ''));
  let cursor = 0;
  function atom(): number {
    const token = tokens[cursor++];
    if (token === '(') {
      const value = addition();
      assert.equal(tokens[cursor++], ')');
      return value;
    }
    if (token === '¬') return Number(!atom());
    assert(Object.hasOwn(env, token), token);
    return env[token];
  }
  function product() {
    let result = atom();
    while (productOp.includes(tokens[cursor] ?? '?')) {
      const op = tokens[cursor++];
      result = combine(op, result, atom());
    }
    return result;
  }
  function addition() {
    let result = product();
    while (plusOp.includes(tokens[cursor] ?? '?')) {
      const op = tokens[cursor++];
      result = combine(op, result, product());
    }
    return result;
  }
  const value = addition();
  assert.equal(cursor, tokens.length);
  return value;
}
const apply = (op: string, a: number, b: number) => {
  if (op === '*') return a * b;
  if (op === '/') return a / b;
  if (op === '+') return a + b;
  assert.equal(op, '−');
  return a - b;
};
numberResolvers[19] = (body, [index]) => {
  const operation = [['*', '/', '+'], ['+', '*', '−'], ['−', '/', '*'], ['/', '+', '−']][index];
  const [intro, tuple, premise, steps] = stems(body);
  assert.equal(intro, 'コンパイラで構文解析した結果の表現方法の一つに四つ組形式がある。');
  assert.match(tuple, /演算子, 被演算子1, 被演算子2, 結果/);
  assert.match(premise, /T1、T2、T3は一時変数/);
  assert.deepEqual(steps.split('\n'), [
    `(${operation[0]}, B, C, T1)`, `(${operation[1]}, T1, D, T2)`, `(${operation[2]}, A, T2, T3)`,
  ]);
  const truth = choices(body).map(() => true);
  const observations = choices(body).map(() => [] as number[]);
  for (const [A, B, C, D] of [[3, 20, 5, 2], [7, 8, 2, 3], [11, 15, 3, 4], [2, 12, 4, 7]]) {
    const T1 = apply(operation[0], B, C), T2 = apply(operation[1], T1, D);
    const expected = apply(operation[2], A, T2);
    choices(body).forEach((text, i) => {
      const observed = parseExpression(text, { A, B, C, D, T1, T2 }, '*/', '+−', apply);
      assert(Number.isFinite(observed));
      observations[i].push(observed);
      truth[i] = truth[i] && Math.abs(observed - expected) < 1e-10;
    });
  }
  assert.equal(new Set(observations.map(row => row.join(','))).size, 4);
  assertUnique(body, truth);
  assert(body.explanation.includes(choices(body)[body.correctIndex!]));
};
numberResolvers[23] = (body, [index]) => {
  const svg = rendered(body);
  const gates = [...svg.matchAll(/data-gate="(\w+)"/g)].map(match => match[1]);
  assert.deepEqual(gates, [['NAND', 'NAND', 'NAND'], ['NOR', 'NOR', 'NAND'], ['NAND', 'NAND', 'NOR'], ['NAND', 'AND', 'NAND']][index]);
  assert.equal((svg.match(/data-inversion="true"/g) ?? []).length, gates.filter(g => g !== 'AND').length);
  assert.deepEqual([...svg.matchAll(/data-wire="([^"]+)"/g)].map(match => match[1]),
    ['A-top', 'B-top', 'C-bottom', 'D-bottom', 'top-output', 'bottom-output', 'output-X']);
  assert.match(stems(body)[0], /「・」は論理積、「\+」は論理和/);
  if (index === 3) assert(stems(body)[0].includes('「¬」'));
  const gate = (name: string, a: number, b: number) => name === 'AND' ? a & b : name === 'NAND' ? 1 - (a & b) : 1 - (a | b);
  const truth = choices(body).map(() => true);
  const bitStrings = choices(body).map(() => '');
  for (let bits = 0; bits < 16; bits++) {
    const [A, B, C, D] = [3, 2, 1, 0].map(shift => (bits >> shift) & 1);
    const expected = gate(gates[2], gate(gates[0], A, B), gate(gates[1], C, D));
    choices(body).forEach((text, i) => {
      const result = parseExpression(text, { A, B, C, D }, '・', '+', (op, a, b) => op === '・' ? a & b : a | b);
      truth[i] = truth[i] && result === expected;
      bitStrings[i] += String(result);
    });
  }
  assert.equal(new Set(bitStrings).size, 4);
  assertUnique(body, truth);
  assert(normalize(body.explanation).includes(normalize(choices(body)[body.correctIndex!])));
};

type KnowledgeRow = readonly [stem: RegExp, correct: number, optionClaims?: readonly RegExp[]];
const fixedChoices: Partial<Record<number, readonly KnowledgeRow[]>> = {
  7: [[/クイックソート/, 0], [/単純選択法/, 1], [/単純挿入法/, 2], [/バブルソート/, 3]],
  11: [[/デバイスドライバ/, 0], [/タスクスケジューラ/, 1], [/ウィンドウマネージャ/, 2], [/シェルの役割/, 3]],
  16: [[/高速の補助記憶装置を介して/, 0], [/実行状態ごと補助記憶へ一時的に退避/, 1], [/論理レコードを一つの物理ブロック/, 2], [/固定長の領域に区切り/, 3]],
  17: [[/最後に使われてからの経過時間が最も長い/, 3], [/読み込まれた時刻が最も古い/, 0], [/参照された回数を記録し、その回数が最も少ない/, 1], [/読み込まれた時刻が最も新しい/, 2]],
  20: [[/統合開発環境.*支援ツール類/, 0], [/空の山括弧<>.*一行ずつ/, 1], [/HTML.*開始・終了タグの外側/, 2], [/eachメソッド.*doとend.*ブロック/, 3]],
  22: [[/機械式接点.*数ミリ秒.*複数回のON、OFF/, 2], [/一定時間間隔で電圧の値を取り出す/, 0], [/1台の入出力装置を割り当て直しながら共同/, 1], [/速度の違いを吸収.*一時領域にデータを蓄える/, 3]],
  24: [[/トップページからそのページまでの経路情報/, 3], [/サイト全体.*階層別に一覧/, 0], [/現在の表示位置.*つまみを動かして/, 1], [/主要な移動先へのリンク.*操作領域/, 2]],
  25: [[/スキーマを決める/, 2], [/アクセス権を設定し、権限を持つ利用者だけ/, 0], [/バックアップと更新ログ.*正常な状態へ戻す/, 1], [/既に定義された参照制約に違反する行の追加を拒否/, 3]],
  26: [[/異なったキー値でも同一の算出結果/, 2], [/葉を順にたどって指定範囲/, 0], [/語を含む文書の識別子の一覧/, 1], [/レコードの位置をビット列で表し.*ビット演算/, 3]],
};
// Fixed reviewed claims. For each variant the ordering is source-role ordering,
// and the index is derived from the facts in the stem and claims, not the builder.
const varyingChoices: Partial<Record<number, readonly KnowledgeRow[]>> = {
  4: [
    [/ディジタル化した後に演算処理/, 1],
    [/温度に応じて部品の値が変わる回路で電圧の加算/, 1,
      [/連続電圧を無限の精度で保持できる。$/, /正しく判定される範囲では、加算結果.*部品精度や温度変化に左右されにくい。$/, /有限桁で表せない値.*丸め誤差が生じることはない。$/, /瞬間に、A\/D変換と加算の結果が得られる。$/]],
    [/測定値を保存し、後から複数の差を計算/, 1,
      [/雑音も必ず取り除ける。$/, /読み出せる符号を保存.*同じ差の計算を繰り返せる。$/, /同じ有限桁数で厳密に求められる。$/, /待ち時間が発生することはない。$/]],
    [/信号線から外来雑音.*電圧を伝送して積算/, 1,
      [/どの値にも異なる有限ビット列が割り当てられる。$/, /値を正しく識別.*微小なずれがそのまま積算されにくい。$/, /全ての結果を正確に保持できる。$/, /処理に遅延は生じない。$/]],
  ],
  5: [
    [/ポインタを用いた線形リストの特徴/, 3],
    [/削除する要素とその直前の要素が分かっている/, 3,
      [/先頭要素の子.*木の枝を切る操作/, /添字による中間要素の参照.*2分探索に適して/, /後続を求めるためにハッシュ値が必要/, /直前要素のポインタを削除対象の後続へ変更.*要素数によらず一定/]],
    [/末尾要素へのポインタを保持し、末尾に要素を追加/, 3,
      [/末尾要素までの深さは常に1/, /中間要素から2分探索して挿入位置/, /末尾要素へのポインタから次を調べるにはハッシュ/, /新要素への参照と末尾ポインタを更新.*要素数によらず一定/]],
    [/前半の末尾になる要素を指すポインタが既知で、後半は空でない/, 3,
      [/先頭要素の直接の子.*全ての親参照の更新/, /添字で直接アクセス.*必ず2分探索/, /前半の末尾のハッシュ値を計算/, /末尾の次を後半の先頭.*次へのポインタを空.*要素数によらず一定/]],
  ],
  13: [
    [/2層クライアントサーバシステムと比較した3層/, 2],
    [/端末の業務ロジックを変更するたびに各端末を更新する2層構成/, 0,
      [/接続仕様を変えない業務処理の変更をサーバ側で実施できる。$/, /端末で全業務処理を実行する必要.*端末ごとの配布が増える。$/, /業務処理層を端末に置かなければならない。$/, /SQLの実行を端末に移すため.*通信が不要になる。$/]],
    [/業務処理とDB処理をそれぞれサーバ側へ分離/, 1,
      [/業務処理サーバを追加できなくなる。$/, /負荷を別々に把握し、増強対象を層ごとに選べる。$/, /表示端末でDB処理を実行.*増強は考慮しなくてよい。$/, /全てのSQLをクライアントに移せば.*必ずゼロになる。$/]],
    [/DBへのアクセスも中間層へ集める/, 3,
      [/端末の業務処理ミドルウェアが直接DBを操作する必要がある。$/, /全ての業務処理を行うため、中間層は不要である。$/, /DBに直接接続するための機能を必ず持たなければならない。$/, /業務処理層へ要求を送り、DBへのSQLは業務処理層側から発行できる。$/]],
  ],
  14: [
    [/MTBFとMTTRに関する記述として/, 3],
    [/エラーログ導入.*故障原因の特定時間だけ.*短くなった/, 0,
      [/平均修復時間であるMTTRは短くなる。$/, /遠隔保守と同じ扱い.*MTBFは必ず短くなる。$/, /原因特定が速くなってもMTTRは変わらない。$/, /予防保守.*故障を未然に防ぐ効果.*MTBFは長くなる。$/]],
    [/遠隔保守.*移動待ちだけがなくなり、故障の発生間隔は変わらなかった/, 1,
      [/ログ解析の時間が増えてMTTRが長くなる。$/, /現地到着までの待ち時間がなくなるため、MTTRは短くなる。$/, /遠隔保守によってMTBFが必ず長くなる。$/, /故障を未然に防ぐ変更なので、MTBFだけが長くなる。$/]],
    [/故障発生間隔も故障後の修復時間も従来と同じ/, 2,
      [/命令トレースの機能を変えていなくても、MTTRは長くなる。$/, /装置の交換を遠隔保守と見なすので、MTBFは短くなる。$/, /故障間隔も修復時間も変わらないため、MTBFもMTTRも変わらない。$/, /必ず予防保守の効果を生み、MTBFは長くなる。$/]],
  ],
  21: [
    [/^DRAMの特徴/, 3],
    [/フラッシュメモリの特徴/, 0, [/不揮発性.*消去はブロック単位/, /フリップフロップ.*通電中はリフレッシュなし/, /製造工程で固定.*書き換えられない/, /トランジスタとコンデンサで記憶/]],
    [/^SRAMの特徴/, 1, [/不揮発性.*消去はブロック単位/, /フリップフロップ.*通電中はリフレッシュなし/, /製造工程で固定.*書き換えられない/, /トランジスタとコンデンサで記憶/]],
    [/マスクROMの特徴/, 2, [/不揮発性.*消去はブロック単位/, /フリップフロップ.*通電中はリフレッシュなし/, /製造工程で固定.*書き換えられない/, /トランジスタとコンデンサで記憶/]],
  ],
};

for (const n of numbers) {
  test(`2015秋午前問${n}の全候補の本文・選択肢・正答を独立照合する`, () => {
    const definition = definitions[n - 1], valid = [], meaningful = new Set<string>(), correctAnswers = new Set<string>();
    const fixed = fixedChoices[n], changing = varyingChoices[n], oracle = numberResolvers[n];
    assert(Number(!!oracle) + Number(!!fixed) + Number(!!changing) === 1);
    for (const input of domain(definition)) {
      if (n === 1 && input[1] === 4 && input[0] >= 8) {
        assert.throws(() => definition.build(input), /PARAMETER_CONSTRAINT/);
        continue;
      }
      const body = definition.build(input);
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(choices(body)).size, 4);
      assert.deepEqual(body, definition.build(input), 'same input reproduces the same body');
      assert(body.explanation.length > 30);
      if (oracle) oracle(body, input);
      else {
        const [stem, target, claims] = (fixed ?? changing!)[input[0]];
        assert.match(stems(body)[0], stem);
        const alternatives = choices(body);
        if (claims) claims.forEach((claim, i) => assert.match(alternatives[i], claim));
        else assert.deepEqual(alternatives, original(n).choices);
        assertUnique(body, alternatives.map((_, i) => i === target));
      }
      valid.push(input);
      meaningful.add(JSON.stringify(body.prompt));
      correctAnswers.add(choices(body)[body.correctIndex!]);
    }
    assert.equal(valid.length, counts[n - 1]);
    assert.equal(meaningful.size, valid.length);
    assert(correctAnswers.size >= 2 || definition.answerVariation === 'fixed');
    assert.throws(() => definition.build([]), /PARAMETER_CONSTRAINT/);
    assert.throws(() => definition.build(definition.fields.map(field => field.maximum + 1)), /PARAMETER_CONSTRAINT/);
    assert.throws(() => definition.build(definition.fields.map(field => field.minimum + 0.5)), /PARAMETER_CONSTRAINT/);
  });
}

test('問2・6・18・23の28描画に原図の軸・図題・区画・配線があり、代替説明を表示に関連付ける', () => {
  let total = 0;
  for (const n of [2, 6, 18, 23]) for (const values of domain(definitions[n - 1])) {
    const body = definitions[n - 1].build(values), svg = rendered(body);
    assert.match(svg, /role="img"/);
    assert.match(svg, /aria-labelledby="[^"]+"/);
    assert.match(svg, /aria-describedby="[^"]+"/);
    assert.match(svg, /<desc id="[^"]+">[^<]+<\/desc>/);
    assert(!/NaN|Infinity/.test(svg));
    assert(!/(?:fill|stroke)="#[0-9a-f]+"/i.test(svg));
    if (n === 2) {
      const [w, h, rx, ry] = gridCases[values[0]];
      assert.equal((svg.match(/data-grid-line="vertical"/g) ?? []).length, w + 1);
      assert.equal((svg.match(/data-grid-line="horizontal"/g) ?? []).length, h + 1);
      assert(svg.includes(`data-point="R"><circle cx="${110 + rx * 100}" cy="${350 - ry * 60}"`));
    }
    total++;
  }
  assert.equal(total, 28);
  for (const figure of legacy2015AutumnAm0126Figures) {
    assert.throws(() => figure.validate([]), /FIGURE_DOMAIN/);
    assert.throws(() => figure.validate(figure.domain.map(pair => pair[1] + 1)), /FIGURE_DOMAIN/);
  }
});
