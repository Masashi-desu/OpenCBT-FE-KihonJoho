import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2008AutumnAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2008-autumn-am-01-26';
import { legacy2008AutumnAm0126Figures as figures } from '../../../src/core/generators/legacy-2008-autumn-am-01-26-figures';
import { legacy2008AutumnAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2008AutumnAm0126Figures';
import { knowledgeFacts } from '../../fixtures/legacy-2008-autumn-am-01-26-facts';

const official = 'エアウウウアエウアウウイウウウエエイエエイアエエアア';
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
    assert.equal(definition.source, '2008h20a-fe-am-' + (position + 1));
    assert.equal(definition.sourceAnswer, official[position]);
    assert.equal('アイウエ'[original.correctIndex!], official[position]);
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.version, '3.7.0');
    assert.deepEqual(definition.fields.map(({ minimum, maximum }) => [minimum, maximum]), [[0, 3]]);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    assert.equal(new Set(bodies.map(body => body.correctIndex)).size === 1, definition.answerVariation === 'fixed');
    for (const [i, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([i]));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert.deepEqual(body.prompt.map(block => block.type), original.prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(choice => choice.map(block => block.type)), original.choices.map(choice => choice.map(block => block.type)));
      assert(body.explanation.length > 35, definition.source + " 条件" + i);
      seen += body.choices.length;
    }
    for (const invalid of [[-1], [4], [0.5], [NaN], [], [0, 0], Array<number>(1)]) {
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
  assert.equal(seen, 416);
});

test('問1の流れ図を候補別に実行し、位取りで入力値に戻ることを検算する', () => {
  for (const body of cases(1)) {
    const prompt = paragraphs(body);
    const [bound, width, radix] = prompt.match(/0＜j＜(\d+)）を(\d+)けたの(\d+)進数/)!.slice(1).map(Number);
    const reverse = prompt.includes('上位けたから');
    const diagram = diagramIn(body, '-base-conversion');
    assert(diagram.alt.includes(reverse ? width + '，−1，1' : '1，1，' + width));
    assert.match(diagram.alt, /初期値，増分，終値/);
    const divide = (value: number, operator: string) => operator === 'mod' ? value % radix : (value - value % radix) / radix;
    unique(body, block => {
      const option = tableOf(block);
      assert.deepEqual(option.columns, ['a', 'b']);
      const steps = option.rows[0].map(cell => cell.match(/^j (div|mod) (\d+) → (j|[A-Z]+\(k\))$/)!.slice(1));
      assert(steps.every(([, base]) => Number(base) === radix));
      return Array.from({ length: bound - 1 }, (_, i) => i + 1).every(input => {
        let current = input;
        const digits: number[] = [];
        for (let pass = 0; pass < width; pass++) {
          for (const [operator, , destination] of steps) {
            const output = divide(current, operator);
            if (destination === 'j') current = output;
            else digits[reverse ? width - pass - 1 : pass] = output;
          }
        }
        return digits.length === width && digits.every(digit => digit >= 0 && digit < radix) &&
          digits.reduce((value, digit, i) => value + digit * radix ** (reverse ? width - i - 1 : i), 0) === input;
      });
    });
  }
});

function terminates(denominator: number, radix: number) {
  let remainder = 1, seen = new Set<number>();
  while (remainder !== 0 && !seen.has(remainder)) {
    seen.add(remainder);
    remainder = remainder * radix % denominator;
  }
  return remainder === 0;
}
test('問2は基数変換の割算で余りの反復を検出し、全称と反例を照合する', () => {
  for (const body of cases(2)) {
    unique(body, block => {
      const [from, to] = [...blockText(block).matchAll(/(\d+)進数/g)].map(item => Number(item[1]));
      const all = [from, from * from, from ** 3].every(denominator => terminates(denominator, to));
      return blockText(block).includes('必ず') === all;
    });
  }
});

test('問3は符号桁を負の位取りとして読むことで8ビットの絶対値を検算する', () => {
  for (const body of cases(3)) {
    const input = paragraphs(body).match(/負数 ([01]{8})/)![1];
    const signed = -128 + Number.parseInt(input.slice(1), 2);
    const values = body.choices.map(([block]) => Number.parseInt(blockText(block), 2));
    ascending(values);
    assert.equal(values[3] - values[0], 3);
    unique(body, block => Number.parseInt(blockText(block), 2) === Math.abs(signed));
  }
});

function arithmetic(expression: string, variables: Record<string, number>, recurrence?: (n: number) => number) {
  const normalized = expression.replaceAll('−', '-').replaceAll('＋', '+').replaceAll('×', '*').replace(/\s/g, '');
  const tokens = normalized.match(/\d+|[bcFn()+*/-]/g) ?? [];
  assert.equal(tokens.join(''), normalized);
  let offset = 0;
  function literal(): number {
    const token = tokens[offset++];
    if (token === '-') return -literal();
    if (token === '(' || token === 'F') {
      if (token === 'F') assert.equal(tokens[offset++], '(');
      const value = sum();
      assert.equal(tokens[offset++], ')');
      if (token === '(') return value;
      assert(recurrence);
      return recurrence(value);
    }
    if (/^\d+$/.test(token)) return Number(token);
    assert(Object.hasOwn(variables, token));
    return variables[token];
  }
  function product() {
    let result = literal();
    while (tokens[offset] === '*' || tokens[offset] === '/') {
      const operator = tokens[offset++];
      const next = literal();
      result = operator === '*' ? result * next : result / next;
    }
    return result;
  }
  function sum() {
    let result = product();
    while (tokens[offset] === '+' || tokens[offset] === '-') {
      const operator = tokens[offset++];
      const next = product();
      result = operator === '+' ? result + next : result - next;
    }
    return result;
  }
  const result = sum();
  assert.equal(offset, tokens.length);
  return result;
}

test('問5は負の非整数も含む有理数の床関数で全式を評価する', () => {
  for (const body of cases(5)) {
    const prompt = paragraphs(body);
    assert.match(prompt, /a を超えない最大の整数値.*int\(8.9\) = 8，int\(−8.5\) = −9.*0＜c＜1/);
    const expression = prompt.match(/a = ([^ ]+) が成り立つ/)![1];
    const inputs = [-5, 0, 6].flatMap(b => [0.125, 0.375, 0.875].map(c => ({ b, c })));
    unique(body, block => inputs.every(values => {
      const a = arithmetic(expression, values);
      let next = -15;
      while (next + 1 <= a) next++;
      return arithmetic(blockText(block), values) === a - next;
    }));
  }
});

test('問6は文字列を列挙し、空白が末尾のみに並ぶ条件を数える', () => {
  for (const body of cases(6)) {
    const prompt = paragraphs(body);
    const [last, length] = prompt.match(/0～(\d+)の数字.*長さ(\d+)/)!.slice(1).map(Number);
    assert.match(prompt, /先頭1文字.*空白文字は使えない.*空白文字の後に数字を並べることは許されない.*繰返し使用を許す/);
    const alphabet = [...Array.from({ length: last + 1 }, (_, i) => String(i)), ' '];
    let words = [''];
    for (let i = 0; i < length; i++) words = words.flatMap(prefix => alphabet.map(symbol => prefix + symbol));
    const count = words.filter(word => /^[0-9]+ *$/.test(word)).length;
    const options = body.choices.map(([block]) => Number(blockText(block)));
    ascending(options);
    assert.deepEqual(options, [count, count + 1, words.filter(word => word[0] !== ' ').length, words.length]);
    unique(body, block => Number(blockText(block)) === count);
  }
});

test('問7は経由済みの状態をもつ格子DPで経路を検算する', () => {
  for (const body of cases(7)) {
    const alt = diagramIn(body, '-grid').alt;
    const [width, height, column, row] = [...alt.matchAll(/(\d+)区間/g)].map(item => Number(item[1]));
    const dp = Array.from({ length: width + 1 }, () => Array.from({ length: height + 1 }, () => [0, 0]));
    dp[0][0][0] = 1;
    for (let x = 0; x <= width; x++) {
      for (let y = 0; y <= height; y++) {
        for (const [nextX, nextY] of [[x + 1, y], [x, y + 1]]) {
          if (nextX > width || nextY > height) continue;
          const reached = nextX === column && nextY === row;
          dp[nextX][nextY][reached ? 1 : 0] += dp[x][y][0];
          dp[nextX][nextY][1] += dp[x][y][1];
        }
      }
    }
    ascending(body.choices.map(([block]) => Number(blockText(block))));
    unique(body, block => Number(blockText(block)) === dp[width][height][1]);
    assert(body.explanation.includes('＝' + dp[width][height][1]));
  }
});

test('問8は無順序の組を全列挙し、確率を整数の交差積で検算する', () => {
  for (const body of cases(8)) {
    const [total, winners] = [...paragraphs(body).matchAll(/(\d+)本/g)].slice(0, 2).map(item => Number(item[1]));
    let draws = 0, both = 0;
    for (let first = 0; first < total; first++) {
      for (let second = first + 1; second < total; second++) {
        draws++;
        if (first < winners && second < winners) both++;
      }
    }
    const fractions = body.choices.map(([block]) => blockText(block).split('/').map(Number));
    ascending(fractions.map(([numerator, denominator]) => numerator / denominator));
    unique(body, block => {
      const [numerator, denominator] = blockText(block).split('/').map(Number);
      return numerator * draws === denominator * both;
    });
  }
});

function evaluateEqualities(statement: string, values: Record<string, number>) {
  const relations = statement.match(/\(|\)|[ABC][＝≠][ABC]|かつ|又は/g) ?? [];
  let offset = 0;
  function literal(): boolean {
    const token = relations[offset++];
    if (token === '(') {
      const result = disjunction();
      assert.equal(relations[offset++], ')');
      return result;
    }
    const [left, relation, right] = token;
    return (values[left] === values[right]) === (relation === '＝');
  }
  function conjunction() {
    const terms = [literal()];
    while (relations[offset] === 'かつ') {
      offset++;
      terms.push(literal());
    }
    return terms.every(Boolean);
  }
  function disjunction() {
    const terms = [conjunction()];
    while (relations[offset] === '又は') {
      offset++;
      terms.push(conjunction());
    }
    return terms.some(Boolean);
  }
  const result = disjunction();
  assert.equal(offset, relations.length);
  return result;
}

test('問9は3値の全27割当てでeqの必要十分条件を照合する', () => {
  const values = [0, 1, 2].flatMap(A => [0, 1, 2].flatMap(B => [0, 1, 2].map(C => ({ A, B, C }))));
  for (const body of cases(9)) {
    const prompt = paragraphs(body);
    const call = prompt.match(/eq\(eq\(([ABC]), ([ABC])\), eq\(([ABC]), ([ABC])\)\)/)!;
    const expected = Number(prompt.match(/([01])が返ってくる/)![1]);
    const [a, b, c, d] = call.slice(1) as Array<'A' | 'B' | 'C'>;
    const eq = (x: number, y: number) => x === y ? 1 : 0;
    unique(body, block => values.every(v =>
      evaluateEqualities(blockText(block), v) === (eq(eq(v[a], v[b]), eq(v[c], v[d])) === expected)));
  }
});

test('問10は4式を独立の集合演算で評価し、真理値表の全8行を照合する', () => {
  const truthSets: Record<string, Set<string>> = {
    '(x・y)＋z': new Set(['001', '011', '101', '110', '111']),
    '(x＋y)・z': new Set(['011', '101', '111']),
    'x・(y＋z)': new Set(['101', '110', '111']),
    'x＋(y・z)': new Set(['011', '100', '101', '110', '111']),
  };
  for (const body of cases(10)) {
    const table = tableOf(body.prompt[1]);
    assert.deepEqual(table.columns, ['x', 'y', 'z', '演算結果']);
    const keys = table.rows.map(([x, y, z]) => x + y + z);
    assert.deepEqual(keys, Array.from({ length: 8 }, (_, i) => i.toString(2).padStart(3, '0')));
    unique(body, block => {
      const expected = truthSets[blockText(block)];
      assert(expected);
      return table.rows.every(([x, y, z, result]) => Number(result) === Number(expected.has(x + y + z)));
    });
  }
});

test('問11は空欄へ0〜6を試し、7で割った余りの合同条件を検算する', () => {
  for (const body of cases(11)) {
    const prompt = paragraphs(body);
    assert.match(prompt, /N₃×3＋N₂×2＋N₁×1\) mod 7.*a mod b は，a を b で割った余り/);
    const input = prompt.match(/数列 \(([0-6□], [0-6□], [0-6□], [0-6])\)/)![1].split(', ');
    const checksum = Number(input.pop());
    const valid = Array.from({ length: 7 }, (_, candidate) => candidate).filter(candidate => {
      const [first, second, third] = input.map(digit => digit === '□' ? candidate : Number(digit));
      const total = first + first + first + second + second + third;
      return Number.isInteger((total - checksum) / 7);
    });
    assert.equal(valid.length, 1);
    ascending(body.choices.map(([block]) => Number(blockText(block))));
    unique(body, block => Number(blockText(block)) === valid[0]);
  }
});

test('問12は追加点の祖先だけに注目し、経路の順序統計量からAの位置を検算する', () => {
  for (const body of cases(12)) {
    const inserted = Number(paragraphs(body).match(/要素(\d+)を追加/)![1]);
    const alt = diagramIn(body, '-heap').alt;
    const root = Number(alt.match(/根(\d+)/)![1]);
    const parent = Number(alt.match(/左右の子は(\d+)と/)![1]);
    const slot = Number(alt.match(/と(\d+)で，\d+が位置A/)![1]);
    assert.match(alt, /位置Aの左の子が追加位置＊/);
    const path = [root, parent, slot, inserted].sort((a, b) => a - b);
    ascending(body.choices.map(([block]) => Number(blockText(block))));
    unique(body, block => Number(blockText(block)) === path[2]);
    assert(body.explanation.includes('Aの位置にある値は ' + path[2]));
  }
});

test('問13は全要素を実際に二分探索して最大比較回数を調べる', () => {
  for (const body of cases(13)) {
    const prompt = paragraphs(body);
    const length = Number(prompt.match(/([\d,]+)個の相異なる/)![1].replaceAll(',', ''));
    assert.match(prompt, /昇順.*該当するキーが必ず表中にある/);
    const keys = Array.from({ length }, (_, i) => i * 3 + 1);
    const count = (target: number) => {
      let low = 0, high = keys.length - 1;
      let steps = 0;
      while (low <= high) {
        const middle = low + Math.floor((high - low) / 2);
        steps++;
        if (keys[middle] === target) return steps;
        if (keys[middle] < target) low = middle + 1;
        else high = middle - 1;
      }
      assert.fail('探索対象は表中にある');
    };
    const longest = Math.max(...keys.map(count));
    ascending(body.choices.map(([block]) => Number(blockText(block))));
    unique(body, block => Number(blockText(block)) === longest);
  }
});

const factorial = (limit: number) => Array.from({ length: limit }, (_, i) => i + 1).reduce((value, i) => value * i, 1);
test('問14は反復積を参照とし、停止しない再帰候補も除外する', () => {
  for (const body of cases(14)) {
    const prompt = paragraphs(body);
    const offset = Number(prompt.match(/\(n＋(\d+)\) の階乗/)?.[1] ?? 0);
    const boundary = Number(prompt.match(/n＞(\d+)のとき/)![1]);
    const initial = Number(prompt.match(/のとき，F\(n\)＝(\d+)/)![1]);
    unique(body, block => Array.from({ length: 7 }, (_, n) => n).every(n => {
      function candidate(value: number): number {
        if (value <= boundary) return initial;
        return arithmetic(blockText(block), { n: value }, next => next >= value || next < 0 ? NaN : candidate(next));
      }
      return candidate(n) === factorial(n + offset);
    }));
  }
});

test('問15は実際の表示表のY/N列を検索し、二つの賞金を合計する', () => {
  for (const body of cases(15)) {
    const table = tableOf(body.prompt[1]);
    const [amount, duration] = table.rows;
    assert.equal(amount[0], '改善額10万円未満');
    assert.equal(duration[0], '期間短縮1週間未満');
    const proposals = [...paragraphs(body).matchAll(/改善提案\d：改善額(\d+)万円，期間短縮(\d+)(日|週間)/g)];
    assert.equal(proposals.length, 2);
    const awards = proposals.map(([, sum, time, unit]) => {
      const key = [Number(sum) < 10, Number(time) * (unit === '週間' ? 7 : 1) < 7].map(isTrue => isTrue ? 'Y' : 'N');
      const match = amount.findIndex((letter, i) => letter === key[0] && duration[i] === key[1]);
      assert(match > 0);
      const awarded = table.rows.slice(2).filter(row => row[match] === 'X');
      assert.equal(awarded.length, 1);
      return Number(awarded[0][0].match(/([\d,]+)円/)![1].replaceAll(',', ''));
    });
    const sum = awards[0] + awards[1];
    ascending(body.choices.map(([block]) => Number(blockText(block).replaceAll(',', ''))));
    unique(body, block => Number(blockText(block).replaceAll(',', '')) === sum);
    assert(body.explanation.includes(sum.toLocaleString('en-US')));
  }
});

test('問17は全ビット組合せで4回路の出力を独立に評価する', () => {
  for (const body of cases(17)) {
    const prompt = paragraphs(body);
    const bitCount = Number(prompt.match(/^(4|6)ビット/)![1]);
    const wantsEven = prompt.includes('0個又は偶数個のとき出力が1');
    assert.match(diagramIn(body, '-gate-legend').alt, /入力部又は出力部.*論理状態の反転又は否定/);
    const values = Array.from({ length: 2 ** bitCount }, (_, i) => i.toString(2).padStart(bitCount, '0').split('').map(Number));
    unique(body, block => {
      const candidate = diagramOf(block);
      assert(candidate.scene.kind === 'source_figure');
      assert(candidate.alt.includes('入力' + bitCount + '本'));
      const gate = candidate.alt.match(/上下2組の出力を(AND|OR|XOR)に入力/)![1];
      const inverted = candidate.alt.includes('NOTで反転');
      return values.every(bits => {
        const ones = bits.filter(Boolean).length;
        const firstHalf = bits.slice(0, bitCount / 2).filter(Boolean).length % 2;
        const secondHalf = bits.slice(bitCount / 2).filter(Boolean).length % 2;
        const combined = firstHalf + secondHalf;
        const signal = gate === 'AND' ? combined === 2 : gate === 'OR' ? combined >= 1 : combined === 1;
        return (inverted ? !signal : signal) === ((ones % 2 === 0) === wantsEven);
      });
    });
  }
});

test('問19は100アクセスの合計で検算し、ミス時の二つの時間モデルでも同じ候補が最短になる', () => {
  for (const body of cases(19)) {
    const prompt = paragraphs(body);
    const timings = body.choices.map(([block]) => {
      const table = tableOf(block);
      assert.deepEqual(table.columns, ['キャッシュメモリのアクセス時間（ナノ秒）', 'キャッシュメモリのヒット率（%）',
        '主記憶のアクセス時間（ナノ秒）']);
      const [fast, rate, slow] = table.rows[0].map(Number);
      if (prompt.startsWith('各組合せのキャッシュメモリのアクセス時間')) assert.equal(fast, Number(prompt.match(/は(\d+)ナノ秒/)![1]));
      if (prompt.startsWith('各組合せの主記憶のアクセス時間')) assert.equal(slow, Number(prompt.match(/は(\d+)ナノ秒/)![1]));
      if (prompt.startsWith('各組合せのキャッシュメモリのヒット率')) assert.equal(rate, Number(prompt.match(/は(\d+)%/)![1]));
      const events = Array.from({ length: 100 }, (_, i) => i < rate ? 'hit' : 'miss');
      return {
        base: events.reduce((sum, event) => sum + (event === 'hit' ? fast : slow), 0),
        sequential: events.reduce((sum, event) => sum + fast + (event === 'hit' ? 0 : slow), 0),
      };
    });
    for (const model of ['base', 'sequential'] as const) {
      const best = Math.min(...timings.map(values => values[model]));
      unique(body, (_, index) => timings[index][model] === best);
    }
  }
});

test('問21は回転周波数とバイト毎秒から平均アクセス時間を求め、原問と同じ誤差の役割も検算する', () => {
  for (const body of cases(21)) {
    const prompt = paragraphs(body);
    const [rpm, seek, capacity, block] = [...prompt.matchAll(/([\d,]+)(?:回転\/分|ミリ秒|バイト)/g)]
      .map(item => Number(item[1].replaceAll(',', '')));
    const rotationsPerSecond = rpm / 60;
    const halfRotMs = 500 / rotationsPerSecond;
    const transferMs = 1000 * block / (rotationsPerSecond * capacity);
    const expected = (seek + halfRotMs + transferMs).toFixed(1);
    const choices = body.choices.map(([choice]) => blockText(choice));
    assert(choices.every(choice => /^\d+\.\d$/.test(choice)));
    ascending(choices.map(Number));
    assert.deepEqual(choices, [
      (seek + halfRotMs + transferMs / 2).toFixed(1), expected,
      (seek + 2 * halfRotMs + transferMs / 2).toFixed(1), (seek + 2 * halfRotMs + transferMs).toFixed(1),
    ]);
    unique(body, option => blockText(option) === expected);
  }
});

for (const [number, reviewed] of Object.entries(knowledgeFacts)) {
  test('問' + number + 'は4条件に対する全候補の真偽を独立に査読した対応表と照合する', () => {
    for (const body of cases(Number(number))) {
      const prompt = paragraphs(body);
      const matching = reviewed.filter(([condition]) => condition.test(prompt));
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

test('5種類の図の全21状態をSSRし、代替テキスト、図形数、例外境界を検査する', () => {
  assert.equal(figures.length, 5);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  let rendered = 0;
  for (const figure of figures) {
    const renderer = renderers.find(item => item.profile === figure.profile);
    assert(renderer);
    const [[start, end]] = figure.domain;
    assert.equal(start, 0);
    assert.throws(() => figure.validate([end + 1]), { code: 'FIGURE_PROFILE' });
    for (let value = start; value <= end; value++) {
      const values = [value];
      figure.validate(values);
      const caption = '検証図';
      const alt = figure.alt(values);
      const html = renderToStaticMarkup(createElement(renderer.component, { values, caption }));
      assert(html.includes('data-source-figure="' + figure.profile + '"'));
      assert.match(html, /role="img".*aria-labelledby="[^"]+".*aria-describedby="[^"]+"/);
      assert(html.includes('<desc') && html.includes(alt));
      if (figure.profile.endsWith('-base-conversion')) assert.match(html, /ループ端の繰返し指定.*初期値，増分，終値/);
      if (figure.profile.endsWith('-grid')) {
        const [width, height] = [...alt.matchAll(/(\d+)区間/g)].map(item => Number(item[1]));
        assert.equal([...html.matchAll(/data-grid-column=/g)].length, width + 1);
        assert.equal([...html.matchAll(/data-grid-row=/g)].length, height + 1);
        assert.equal([...html.matchAll(/data-grid-point=/g)].length, 3);
      }
      if (figure.profile.endsWith('-heap')) {
        assert.equal([...html.matchAll(/data-heap-edge=/g)].length, 9);
        assert.equal([...html.matchAll(/data-heap-node=/g)].length, 9);
        assert.match(html, /stroke-dasharray="3 3"/);
      }
      if (figure.profile.endsWith('-gate-legend')) assert.match(html, /入力部又は出力部に示されている○印/);
      if (figure.profile.endsWith('-parity-circuit')) {
        const gate = alt.match(/上下2組の出力を(AND|OR|XOR)/)![1];
        const gates = [...html.matchAll(/data-gate="([A-Z]+)"/g)].map(item => item[1]);
        assert.deepEqual(gates, [...Array(alt.includes('入力4本') ? 2 : 4).fill('XOR'), gate, ...(alt.includes('NOTで反転') ? ['NOT'] : [])]);
      }
      rendered++;
    }
  }
  assert.equal(rendered, 21);
});
