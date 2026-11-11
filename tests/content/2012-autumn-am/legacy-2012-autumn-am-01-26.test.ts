import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2012AutumnAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2012-autumn-am-01-26';
import { legacy2012AutumnAm0126Figures as figures } from '../../../src/core/generators/legacy-2012-autumn-am-01-26-figures';
import { legacy2012AutumnAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2012AutumnAm0126Figures';
import originals from '../../../src/core/generators/legacy-2012-autumn-am-01-26-source.json';
import { knowledgeFacts } from '../../fixtures/legacy-2012-autumn-am-01-26-facts';

const marks = 'アイウエ';
const official = 'ウイアイイイイイウエウエウアエエウウエエアイエイエア';
const variants = (n: number) => {
  const definition = definitions[n - 1], domain = definition.fields[0];
  return Array.from({ length: domain.maximum + 1 }, (_, value) => definition.build([value]));
};
const prompt = (body: GeneratedBody) => body.prompt.filter(block => block.type === 'paragraph').map(block => block.text).join('\n');
const options = (body: GeneratedBody) => body.choices.map(([block]) => {
  if (block.type === 'paragraph' || block.type === 'formula') return block.text;
  if (block.type === 'diagram') return block.alt;
  assert(block.type === 'table' && block.rows.length === 1);
  return block.rows[0].join('／');
});
const testChoices = (body: GeneratedBody, predicate: (choice: string, index: number) => boolean) =>
  assert.deepEqual(options(body).flatMap((choice, i) => predicate(choice, i) ? [i] : []), [body.correctIndex]);
const ascending = (body: GeneratedBody) => assert(options(body).map(Number).every((n, i, values) => !i || values[i - 1] < n));

function renderDiagram(block: GeneratedBody['prompt'][number] | undefined) {
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(figure => figure.profile === profile);
  const renderer = renderers.find(entry => entry.profile === profile);
  assert(definition && renderer);
  definition.validate(values);
  assert.equal(definition.alt(values), block.alt);
  const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
  assert(markup.includes('data-source-figure="' + profile + '"'));
  assert.match(markup, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
  assert(markup.includes('<desc') && markup.includes('var(--diagram-ink)') && markup.includes('var(--image-scale, 1)'));
  return { profile, definition, markup };
}

const diagram = (body: GeneratedBody) => renderDiagram(body.prompt.find(block => block.type === 'diagram'));

test('2012年秋期午前問1〜26の公式キーと104条件を照合し、選択肢と入力境界を確認する', () => {
  assert.equal(definitions.length, 26);
  assert.equal(originals.length, 26);
  assert.equal(originals.map(row => row.sourceKey).join(''), official);
  for (const [index, definition] of definitions.entries()) {
    const number = index + 1, row = originals[index], cases = variants(number);
    assert.equal(definition.source, '2012h24a-fe-am-' + number);
    assert.equal(row.number, number);
    assert.equal(definition.sourceAnswer, official[index]);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    const reference = cases[0];
    assert.equal(marks[reference.correctIndex!], official[index]);
    if (number !== 22) {
      assert(prompt(reference).startsWith(row.prompt), definition.source);
      assert.deepEqual(options(reference), row.choices, definition.source);
    }
    const displayedStems = cases.map(body => JSON.stringify(body.prompt.map(block =>
      block.type === 'diagram' ? diagram(body).markup.replace(/<desc[^>]*>.*?<\/desc>/s, '') : block)));
    assert.equal(new Set(displayedStems).size, 4, definition.source);
    for (const [value, body] of cases.entries()) {
      assert.deepEqual(definition.build([value]), body);
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(options(body)).size, 4, definition.source);
      assert(body.correctIndex !== undefined && body.correctIndex >= 0 && body.correctIndex < 4);
      assert(body.explanation.length > 28);
    }
    const results = new Set(cases.map(body => JSON.stringify(body.choices[body.correctIndex!])));
    assert(definition.answerVariation === 'fixed' ? results.size === 1 : results.size > 1, definition.source);
    for (const invalid of [[], [0, 0], [-1], [4], [0.5], Array(1), [Number.NaN]])
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    const accessor = [0];
    Object.defineProperty(accessor, '0', { get() { throw Error('不正なgetterを実行した'); } });
    assert.throws(() => definition.build(accessor), { code: 'PARAMETER_CONSTRAINT' });
  }
});

test('問1〜4の2進表現、互除法、探索の増加量、固定長符号の全選択肢を検算する', () => {
  const unsigned = (word: string) => [...word].reduce((value, bit) => 2 * value + Number(bit), 0);
  const signed = (word: string) => unsigned(word) - (word[0] === '1' ? 256 : 0);
  for (const body of variants(1)) {
    const parsed = /2進数([01]{8}).*?([01]{8})から/.exec(prompt(body));
    assert(parsed);
    const [a, b] = parsed.slice(1);
    assert.match(prompt(body), /右に2ビット算術シフト.*負の数は2の補数表現/);
    const shifted = a[0].repeat(2) + a.slice(0, 6);
    const complement = [...shifted].map(bit => bit === '0' ? '1' : '0').join('');
    const answer = unsigned(b) - signed(shifted);
    const candidates = options(body);
    assert(candidates.every(word => /^[01]{8}$/.test(word)));
    assert.deepEqual(candidates.map(unsigned), [
      (unsigned(b) + signed(shifted) + 256) % 256, (unsigned(b) + unsigned(complement)) % 256,
      answer, (unsigned(b) - unsigned('00' + a.slice(0, 6)) + 256) % 256,
    ]);
    testChoices(body, word => unsigned(word) === answer);
    assert(body.explanation.includes(shifted) && body.explanation.includes(candidates[body.correctIndex!]));
  }
  for (const body of variants(2)) {
    const parsed = /x₀＝(\d+)，x₁＝(\d+)/.exec(prompt(body));
    assert(parsed);
    const code = body.prompt.find(block => block.type === 'code');
    assert(code?.type === 'code');
    assert.match(code.text, /2 → i\n（2）xᵢ₋₂をxᵢ₋₁で割った剰余 → xᵢ\n（3）xᵢ＝0ならばxᵢ₋₁を最大公約数として終了/);
    let dividend = Number(parsed[1]), divisor = Number(parsed[2]), iterations = 0;
    while (divisor !== 0) {
      while (dividend >= divisor) dividend -= divisor;
      [dividend, divisor] = [divisor, dividend];
      iterations++;
    }
    ascending(body);
    testChoices(body, candidate => Number(candidate) === iterations);
    assert(body.explanation.includes(iterations + '回') && body.explanation.includes(dividend + 'が最大公約数'));
  }
  for (const body of variants(3)) {
    assert.match(prompt(body), /データの数をnとし.*確率は無視できるほど小さい.*cn²/);
    const first = body.choices[0][0];
    assert(first.type === 'table' && first.columns.length === 3);
    const count = (length: number) => {
      let steps = 1;
      for (let limit = length; limit > 1; limit = Math.ceil(limit / 2)) steps++;
      return steps;
    };
    const constantBinary = /2分探索(?:と線形探索のどちらも|では)最初に一致/.test(prompt(body));
    const constantLinear = /線形探索では先頭で一致|どちらも最初に一致/.test(prompt(body));
    assert.equal(count(256) - count(16), 4);
    const orders = [constantBinary ? '1' : 'log₂n', constantLinear ? '1' : 'n', '1'];
    for (const [option] of body.choices) {
      assert(option.type === 'table');
      assert.deepEqual(option.columns, first.columns);
    }
    testChoices(body, candidate => candidate === orders.join('／'));
    assert(body.explanation.includes(orders.join('，')));
  }
  for (const body of variants(4)) {
    const text = prompt(body), symbols = new Set<string>();
    for (const [, from, to] of text.matchAll(/([A-Za-z0-9])～([A-Za-z0-9])/g)) {
      for (let value = from.charCodeAt(0); value <= to.charCodeAt(0); value++) symbols.add(String.fromCharCode(value));
    }
    for (const item of (/記号（([^）]+)）/.exec(text)?.[1] ?? '').split('、').filter(Boolean)) symbols.add(item);
    assert.match(text, /同一のビット数で一意にコード化.*少なくとも/);
    ascending(body);
    testChoices(body, candidate => 2 ** Number(candidate) >= symbols.size && 2 ** (Number(candidate) - 1) < symbols.size);
    assert(body.explanation.includes(symbols.size + '種類'));
  }
});

function minimumQueueMoves(initial: string, target: string) {
  // pop_enq has cost 0, deq_push has cost 1. Enumerate both operations.
  const start = initial + '|';
  const queue: [state: string, cost: number][] = [[start, 0]];
  const seen = new Map([[start, 0]]);
  while (queue.length) {
    const [state, cost] = queue.shift()!;
    if (seen.get(state) !== cost) continue;
    const [q, stack] = state.split('|');
    if (q === target && !stack) return cost;
    const moves: [string, number][] = [];
    if (stack) moves.push([q + stack[0] + '|' + stack.slice(1), 0]);
    if (q) moves.push([q.slice(1) + '|' + q[0] + stack, 1]);
    for (const [next, extra] of moves) {
      if ((seen.get(next) ?? Infinity) <= cost + extra) continue;
      const item: [string, number] = [next, cost + extra];
      seen.set(...item);
      if (extra) queue.push(item); else queue.unshift(item);
    }
  }
  throw Error('逆順の状態へ到達できない');
}

test('問5〜7は状態探索・全区間・再帰式の各候補を独立に検査する', () => {
  for (const body of variants(5)) {
    const text = prompt(body), match = /データ([A-F，]+)がこの順.*データを([A-F，]+)の順に/.exec(text);
    assert(match);
    const [initial, target] = match.slice(1).map(value => value.replaceAll('，', ''));
    assert.equal([...initial].reverse().join(''), target);
    assert.match(text, /空のスタック.*deq_pushの実行回数は最少.*スタックから取り出したデータをキューに入れる/);
    const minimum = minimumQueueMoves(initial, target);
    ascending(body);
    testChoices(body, candidate => Number(candidate) === minimum);
    assert(body.explanation.includes('最少は' + minimum + '回'));
  }
  for (const body of variants(6)) {
    const text = prompt(body), rendered = diagram(body).markup;
    const descending = text.includes('降順'), exclusive = text.includes('上端yを含まない');
    assert.match(text, /A\(1\)，A\(2\)，…，A\(n\).*m＝0.*小数点以下を切り捨てる/);
    assert(rendered.includes(exclusive ? 'n＋1 → y' : 'n → y'));
    assert(rendered.includes(exclusive ? '>m → y<' : '>m−1 → y<'));
    assert(rendered.includes('>m＋1 → x<') && rendered.includes('>0 → m<') && rendered.includes('>a<'));
    const sample = Array.from({ length: 14 }, (_, i) => Array.from({ length: i + 1 }, (_, j) => 3 * j + 2))
      .map(values => descending ? values.reverse() : values);
    const midpoint = [
      (x: number, y: number) => x + y, (x: number, y: number) => Math.trunc((x + y) / 2),
      (x: number, y: number) => Math.trunc((x - y) / 2), (x: number, y: number) => Math.trunc((y - x) / 2),
    ];
    assert.deepEqual(options(body), ['(x＋y) → m', '(x＋y)／2 → m', '(x−y)／2 → m', '(y−x)／2 → m']);
    testChoices(body, (_, choice) => sample.every(data => [...data, 0, 3, 100].every(target => {
      let x = 1, y = data.length + Number(exclusive);
      const expected = data.indexOf(target) + 1;
      for (let step = 0; step <= data.length; step++) {
        if (exclusive ? x >= y : x > y) return expected === 0;
        const m = midpoint[choice](x, y);
        if (m < x || (exclusive ? m >= y : m > y)) return false;
        if (data[m - 1] === target) return m === expected;
        if (descending ? data[m - 1] < target : data[m - 1] > target) y = m - Number(!exclusive);
        else x = m + 1;
      }
      return false;
    })));
  }
  for (const body of variants(7)) {
    const code = body.prompt.find(block => block.type === 'code');
    assert(code?.type === 'code');
    const match = /^F\(n\) ＝ (\d+) +（n＝(\d+)）\n +n×F\(n−1\) +（n＞\2）$/.exec(code.text);
    assert(match);
    const base = Number(match[2]), product = (count: number) => Array.from({ length: count }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
    assert.equal(Number(match[1]), product(base));
    const evaluate = (expression: string, n: number) => expression === 'n!' ? product(n) : expression === 'n²' ? n ** 2
      : expression === 'n' ? n : n - Number(expression.replace('n−', ''));
    testChoices(body, candidate => [base, base + 1, base + 3, base + 6].every(n => {
      const factors = Array.from({ length: n }, (_, i) => i + 1).filter(factor => factor > base);
      assert.equal(factors.reduce((a, b) => a * b, Number(match[1])), product(n));
      return evaluate(candidate, n) === factors.length;
    }));
  }
});

test('問9・10・12は依存順・時間の重み付け・ドット換算で全選択肢を判定する', () => {
  const methods = [/開始番地の決定/, /ベクタ表の項目から開始番地/, /共通の割込み入口/, /専用レジスタの番号/];
  for (const [i, body] of variants(9).entries()) {
    const steps = body.prompt.find(block => block.type === 'list');
    assert(steps?.type === 'list' && steps.items.length === 4);
    [/レジスタ.*退避/, /特権モードへの移行/, methods[i], /処理ルーチンの実行/]
      .forEach((match, step) => assert.match(steps.items[step], match));
    testChoices(body, candidate => {
      const order = [...candidate.matchAll(/[①②③④]/g)].map(match => match[0]);
      assert.equal(new Set(order).size, 4);
      return [['②','①'], ['①','③'], ['③','④']].every(([before, after]) => order.indexOf(before) < order.indexOf(after));
    });
    assert.match(body.explanation, /② → ① → ③ → ④/);
  }
  for (const body of variants(10)) {
    const [main, cache, elapsed] = [...prompt(body).matchAll(/(\d+)ナノ秒/g)].map(match => Number(match[1]));
    assert(main > elapsed && elapsed > cache);
    ascending(body);
    testChoices(body, candidate => {
      const hitCount = Math.round(Number(candidate) * 100);
      assert(hitCount >= 0 && hitCount <= 100);
      return (100 - hitCount) * main + hitCount * cache === elapsed * 100;
    });
    assert(body.explanation.endsWith('＝' + options(body)[body.correctIndex!] + 'である。'));
  }
  for (const body of variants(12)) {
    const read = /(\d+)dpi.*?(\d+)ポイントの文字.*正方フォントの縦.*1ポイントは1／72インチ/.exec(prompt(body));
    assert(read);
    const dpi = Number(read[1]), points = Number(read[2]);
    ascending(body);
    testChoices(body, option => Number.isInteger(Number(option)) && Number(option) * 72 === dpi * points);
    assert(body.explanation.includes(options(body)[body.correctIndex!] + 'ドット'));
  }
});

// Read the displayed, restricted reliability expressions without executing them as code.
function evaluateProbability(text: string, p: number) {
  const power: Readonly<Record<string, number>> = { '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7 };
  let pos = 0;
  function expression(): number {
    let value = term();
    while (text[pos] === '−') {
      pos++;
      value -= term();
    }
    return value;
  }
  function term() {
    let value = atom();
    while (pos < text.length && /[P1({]/.test(text[pos])) value *= atom();
    return value;
  }
  function atom(): number {
    const symbol = text[pos++];
    let value: number;
    if (symbol === 'P') value = p;
    else if (symbol === '1') value = 1;
    else {
      assert(symbol === '(' || symbol === '{');
      value = expression();
      assert.equal(text[pos++], symbol === '(' ? ')' : '}');
    }
    if (power[text[pos]]) value **= power[text[pos++]];
    return value;
  }
  const value = expression();
  assert.equal(pos, text.length, text);
  return value;
}

test('問15の図を読み、全装置の稼働・停止を全列挙して4式を照合する', () => {
  const expected = [[1,2,2],[1,2,3],[2,2,2],[2,2,3]];
  for (const [i, body] of variants(15).entries()) {
    const rendered = diagram(body).markup;
    const counts = ['common', 'upper', 'lower'].map(group =>
      [...rendered.matchAll(new RegExp('data-reliability-group="' + group + '"', 'g'))].length);
    assert.deepEqual(counts, expected[i]);
    assert.match(prompt(body), /並列の部分は，どちらか一方が稼働していればよい/);
    const [common, top, bottom] = counts, n = common + top + bottom;
    const probabilities = [0, .25, .5, .75, 1].map(p => {
      let sum = 0;
      for (let mask = 0; mask < 2 ** n; mask++) {
        const state = Array.from({ length: n }, (_, bit) => Math.floor(mask / 2 ** bit) % 2 === 1);
        const good = (a: number, b: number) => state.slice(a, b).every(Boolean);
        if (good(0, common) && (good(common, common + top) || good(common + top, n))) {
          const running = state.filter(Boolean).length;
          sum += p ** running * (1 - p) ** (n - running);
        }
      }
      return { p, sum };
    });
    testChoices(body, candidate => probabilities.every(({ p, sum }) => Math.abs(sum - evaluateProbability(candidate, p)) < 1e-10));
    assert(body.explanation.endsWith(options(body)[body.correctIndex!] + 'である。'));
  }
});

test('問19は参照順の逆走査でLRU、問22はSVGの結線で論理式を検算する', () => {
  for (const body of variants(19)) {
    const text = prompt(body), read = /ページ枠が(\d+).*ページ([\d，]+)の順にアクセス/.exec(text);
    assert(read && text.includes('初期状態では主記憶にどのページも存在しない'));
    const capacity = Number(read[1]), accesses = read[2].split('，').map(Number), prior = [...accesses];
    assert.equal(prior.pop(), 6);
    // The LRU stack consists of the most recent distinct references.
    const resident = [...new Set(prior.reverse())].slice(0, capacity);
    assert(!resident.includes(6) && resident.length === capacity);
    ascending(body);
    testChoices(body, candidate => Number(candidate) === resident.at(-1));
    assert(body.explanation.includes('ページ' + resident.at(-1) + 'の最終参照'));
  }
  const textbook = [
    'XとYの論理積', 'XとYの論理和', 'XとYの論理積全体の否定', 'XとYの論理和全体の否定',
  ];
  const nets = [
    [[0,0],[1,1],[2,3]], [[0,1],[2,2]], [[0,1],[2,2],[3,3]], [[0,0],[1,1],[2,3],[4,4]],
  ];
  const functions = [
    (x: boolean, y: boolean) => x && y, (x: boolean, y: boolean) => x || y,
    (x: boolean, y: boolean) => !(x && y), (x: boolean, y: boolean) => !(x || y),
  ];
  for (const [i, body] of variants(22).entries()) {
    assert.match(prompt(body), /NAND素子.*組合せ回路の出力Z/);
    assert.match(prompt(body), /“・”は論理積，“＋”は論理和，“Xの上線”はXの否定/);
    const rendered = diagram(body).markup;
    const inputs = [...rendered.matchAll(/data-nand-gate="(\d+)" data-nand-inputs="(\d+),(\d+)"/g)].map(([, gate, a, b], j) => {
      assert.equal(Number(gate), j + 1);
      assert(Number(a) <= j + 1 && Number(b) <= j + 1);
      return [Number(a), Number(b)];
    });
    assert.deepEqual(inputs, nets[i]);
    assert.equal([...rendered.matchAll(/data-nand-inversion="true"/g)].length, inputs.length);
    assert.deepEqual(options(body), textbook);
    for (const [choice, [block]] of body.choices.entries()) {
      const { profile, markup } = renderDiagram(block);
      assert.equal(profile, 'legacy-2012-autumn-am-22-logic-choice');
      assert(markup.includes('data-logic-choice-expression="' + choice + '"'));
      assert.deepEqual([...markup.matchAll(/<text[^>]*x="(\d+)" y="(\d+)"[^>]*>([^<]+)<\/text>/g)]
        .map(([, x, y, label]) => [Number(x), Number(y), label]),
        [[31,36,'X'], [65,36,choice % 2 ? '＋' : '・'], [99,36,'Y']]);
      const line = /data-logic-choice-overline="true" x1="(\d+)" y1="(\d+)" x2="(\d+)" y2="(\d+)"/.exec(markup);
      assert.equal(Boolean(line), choice >= 2);
      if (line) {
        const [start, y1, end, y2] = line.slice(1).map(Number);
        assert(start <= 31 - 8 && end >= 99 + 8 && y1 === y2 && 36 - y1 >= 20);
      }
    }
    testChoices(body, (_, index) => [false, true].every(x => [false, true].every(y => {
      const state = [x, y];
      for (const [a, b] of inputs) state.push(!state[a] || !state[b]);
      return state.at(-1) === functions[index](x, y);
    })));
  }
});

test('問25は過去の合計を固定した反例で集計の可否と表の注記を照合する', () => {
  const oldOrdersA = [[9, 1], [1, 9]], oldOrdersB = [[1, 9], [9, 1]];
  const margins = (rows: number[][]) => [rows.map(row => row[0] + row[1]), [rows[0][0] + rows[1][0], rows[0][1] + rows[1][1]]];
  assert.deepEqual(margins(oldOrdersA), margins(oldOrdersB));
  for (const [i, body] of variants(25).entries()) {
    const table = body.prompt.find(block => block.type === 'table');
    assert(table?.type === 'table');
    assert.deepEqual(table.columns, ['ファイル', '項目', '備考']);
    assert.deepEqual(table.rows.map(row => row[0]), ['顧客マスタ', '商品マスタ', '担当者マスタ', '当月受注']);
    const [customer, product, officer, current] = table.rows;
    const assigned = customer[1].includes('担当者コード') ? '顧客' : '商品';
    assert.equal(assigned, i % 2 ? '商品' : '顧客');
    assert.equal(customer[1].includes('担当者コード'), !product[1].includes('担当者コード'));
    assert.equal((assigned === '顧客' ? customer : product)[2], '各' + assigned + 'の担当者は1人');
    assert.equal(officer[1], '担当者コード，氏名');
    assert.deepEqual(current.slice(1), ['顧客コード，商品コード，受注額', '当月の合計受注額']);
    const months = Number(/直前の(\d)か月分/.exec(prompt(body))?.[1]);
    assert.equal(months, i < 2 ? 3 : 2);
    assert.equal((customer[1].match(/受注額/g) ?? []).length, months);
    assert.equal((product[1].match(/受注額/g) ?? []).length, months);
    assert.deepEqual(options(body), [
      '顧客別の商品別受注実績', '商品別の顧客別受注実績', '商品別の担当者別受注実績', '担当者別の顧客別受注実績',
    ]);
    const historical = (records: number[][], option: number) => {
      if (option < 2) return records;
      const ownAxis = (assigned === '商品' && option === 2) || (assigned === '顧客' && option === 3);
      // Distinct assignments demonstrate that the opposite axis still depends on the joint values.
      return ownAxis ? margins(records)[assigned === '商品' ? 1 : 0] : records;
    };
    testChoices(body, (_, option) => JSON.stringify(historical(oldOrdersA, option)) === JSON.stringify(historical(oldOrdersB, option)));
    assert(body.explanation.includes('過去' + months + 'か月') && body.explanation.includes(assigned + 'マスタの担当者コード'));
  }
});

test('12知識系列の全48条件・192選択肢を独立査読した概念と照合する', () => {
  assert.equal(Object.keys(knowledgeFacts).length, 12);
  for (const [number, facts] of Object.entries(knowledgeFacts)) {
    const cases = variants(Number(number));
    assert.equal(cases.length, facts.length);
    for (const [index, body] of cases.entries()) {
      const fact = facts[index], optionsText = options(body);
      assert.match(prompt(body), fact.prompt, '問' + number + '条件' + index);
      assert.equal(fact.candidates.length, 4);
      assert.equal(new Set(fact.candidates.map(([meaning]) => meaning)).size, 4);
      optionsText.forEach((option, i) => assert.match(option, fact.candidates[i][1], '問' + number + '条件' + index + marks[i]));
      testChoices(body, (_, i) => fact.candidates[i][0] === fact.target);
    }
  }
});

test('作図4種の16状態で、全図に表示と読み上げを登録し、不正入力を拒否する', () => {
  assert.equal(figures.length, 4);
  assert.equal(renderers.length, 4);
  assert.deepEqual(figures.map(item => item.profile).sort(), renderers.map(item => item.profile).sort());
  for (const number of [6, 15, 22]) {
    for (const body of variants(number)) {
      const blocks = [...body.prompt, ...body.choices.flat()].filter(block => block.type === 'diagram');
      for (const block of blocks) {
        const { profile, markup, definition } = renderDiagram(block);
        assert(markup.includes('diagram-scroll') && markup.includes('tabindex="0"'));
        assert(markup.includes('var(--diagram-surface)') || number === 6 || profile.endsWith('-logic-choice'));
        for (const values of [[], [-1], [4], [0.5], [0, 1]]) {
          assert.throws(() => definition.validate(values), { code: 'FIGURE_PROFILE' });
        }
      }
    }
  }
});
