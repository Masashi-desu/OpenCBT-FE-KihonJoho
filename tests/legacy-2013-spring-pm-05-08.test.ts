import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { spring2013Pm05To08Specs as specs } from '../scripts/legacy-2013-spring-pm-05-08-specs';
import { legacy2013SpringPm0508Figures as figures } from '../src/core/generators/legacy-2013-spring-pm-05-08-figures';
import { legacy2013SpringPm0508FigureRenderers as renderers } from '../src/ui/Legacy2013SpringPm0508Figures';
import { spring2013Pm8Evaluate } from '../src/core/generators/legacy-2013-spring-pm-05-08-model';
import review from './fixtures/legacy-2013-spring-pm-05-08-review.json';

const marks = 'アイウエオカキク';
const generated = (major: number) => {
  const spec = specs.find(spec => spec.number === major);
  assert(spec);
  return Array.from({ length: spec.definition.fields[0].maximum + 1 }, (_, i) => spec.definition.build([i]));
};
const stems = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
function parts(body: GeneratedBody, index: number) {
  const answer = body.partAnswers![index];
  const first = answer.kind === 'unordered' ? answer.partIds[0] : answer.partId;
  const part = body.answerParts!.find(part => part.id === first);
  assert(part);
  const keys = answer.kind === 'unordered' ? answer.choiceIds : answer.kind === 'choice' ? [answer.choiceId] : [];
  assert(keys.length);
  return {
    choices: part.choiceIds.map(id => body.choices[Number(id.split('-').at(-1)) - 1][0]),
    keys: keys.map(id => part.choiceIds.indexOf(id)).sort((a, b) => a - b),
  };
}
function exact(body: GeneratedBody, index: number, trueOptions: readonly boolean[], count = 1) {
  assert.equal(trueOptions.length, parts(body, index).choices.length);
  const indices = trueOptions.flatMap((valid, i) => valid ? [i] : []);
  assert.equal(indices.length, count, '欄' + (index + 1));
  assert.deepEqual(parts(body, index).keys, indices);
}
function text(block: Block) {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
}
function table(body: GeneratedBody, prefix: string) {
  const found = body.prompt.find(block => block.type === 'table' && block.caption.startsWith(prefix));
  assert(found?.type === 'table', prefix);
  return found;
}
function drawing(body: GeneratedBody, suffix: string) {
  const found = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix));
  assert(found?.type === 'diagram' && found.scene.kind === 'source_figure');
  return { caption: found.caption, alt: found.alt, scene: found.scene };
}
function markup(panel: ReturnType<typeof drawing>) {
  const renderer = renderers.find(renderer => renderer.profile === panel.scene.profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component, { caption: panel.caption, values: panel.scene.values }));
}
const number = (text: string) => Number(text.replaceAll(',', '').replace(/円$/, ''));

test('2013春午後問5〜8の原資料21頁・公式26欄・28選択枠・全生成入力を照合', () => {
  assert.equal(specs.flatMap(spec => spec.pages).length, 21);
  assert.equal(specs.reduce((n, spec) => n + spec.original.partAnswers!.length, 0), 26);
  assert.equal(specs.reduce((n, spec) => n + spec.original.answerParts!.length, 0), 28);
  assert.deepEqual(review.held, []);
  for (const [i, spec] of specs.entries()) {
    const record = review.questions[i], bodies = generated(spec.number);
    assert.equal(spec.number, record.number);
    assert.deepEqual(spec.pages, record.pages);
    assert.equal(spec.definition.sourceAnswer, record.keys.join('／'));
    assert.deepEqual(spec.original.partAnswers!.map((_, i) => parts(spec.original, i).keys.map(n => marks[n]).join('')), record.keys);
    assert.equal(bodies.length, record.inputCount);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, record.inputCount);
    for (const page of spec.pages) {
      const alt = spec.originalPageAlt[page];
      assert(alt.length > 100 && !/[§#]/.test(alt));
    }
    for (const body of bodies) {
      assert.deepEqual(body.answerParts!.map(part => part.choiceIds.length), record.bankSizes);
      assert.equal(body.partAnswers!.length, record.keys.length);
      assert(body.explanation.length > 150);
      for (const [j, part] of body.answerParts!.entries()) {
        assert.equal(new Set(part.choiceIds.map(id => JSON.stringify(body.choices[Number(id.split('-').at(-1)) - 1]))).size, part.choiceIds.length);
        for (const [k, other] of body.answerParts!.entries()) {
          if (record.banks[j] === record.banks[k]) assert.deepEqual(other.choiceIds, part.choiceIds);
          else assert(!other.choiceIds.some(id => part.choiceIds.includes(id)));
        }
      }
      assert.deepEqual(body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])) ?? [],
        spec.definition.fixedReferenceAssetIds ?? []);
    }
    for (const invalid of [[], [-1], [bodies.length], [0.1], [1, 0], Array(1)]) {
      assert.throws(() => spec.definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
});

test('2013春午後問5の日次・月次、3か月の判定と全択を表示帳票から再計算', () => {
  const allPay = new Set<number>();
  for (const body of generated(5)) {
    const process = table(body, '表1');
    assert.match(process.rows[0][2], /異動年月日が［a］/);
    assert.match(process.rows[1][2], /［b］の昇順/);
    assert.match(process.rows[3][2], /［c］が［d］/);
    assert.match(stems(body), /前日発生分.*前日の契約マスタ/);
    assert.match(stems(body), /終了していない保険契約の終了年月日は空白/);
    assert.match(stems(body), /終了した保険契約のレコードは削除しない/);
    ['前日', '証券番号', '終了年月日', '空白'].forEach((label, i) =>
      exact(body, i, parts(body, i).choices.map(block => text(block) === label)));
    const merge = drawing(body, '-merge-flow');
    assert.match(merge.alt, /T1≠EOF：Noなら［e］/);
    assert.match(merge.alt, /旧契約マスタ≠EOF：Noなら［g］/);
    assert.match(merge.alt, /大きければ［e］、等しければ［f］、小さければ［g］/);
    const branch = [
      /旧契約マスタのレコードをそのまま新契約マスタに出力/,
      /旧契約マスタのレコードの情報をT1のレコードの情報で更新し，そのレコードを新契約マスタに出力/,
      /T1のレコードの情報から新たにレコードを作成して新契約マスタに出力/,
    ];
    branch.forEach((rule, i) => exact(body, i + 4, parts(body, i + 4).choices.map(block => rule.test(text(block)))));
    const master = table(body, '表2'), changes = table(body, '表3');
    assert.deepEqual(master.columns, ['証券番号', '契約年月日', '終了年月日', '月払保険料', '保障額', '社員ID', '満了年月日']);
    assert.deepEqual(changes.columns, ['異動年月日', '証券番号', '異動事由', '月払保険料', '保障額', '社員ID', '満了年月日']);
    assert(master.rows.slice(1).every((row, i) => row[0] > master.rows[i][0] && row[1] >= master.rows[i][1]));
    const updated = new Map(master.rows.map(row => [row[0], [...row]]));
    for (const [date, key, action, premium, insured, employee, maturity] of changes.rows) {
      assert.equal(date, '2013/04/30');
      const prior = updated.get(key);
      if (action === '新契約') {
        assert.equal(prior, undefined);
        updated.set(key, [key, date, '', premium, insured, employee, maturity]);
      } else {
        assert(prior);
        if (action === '終了') {
          prior[2] = date;
          assert.equal(number(premium), 0);
        } else {
          assert(action === '増額' || action === '減額');
          assert.equal(Math.sign(number(premium) - number(prior[3])), action === '増額' ? 1 : -1);
          prior[4] = insured;
        }
        prior[3] = premium;
      }
    }
    const pay = ['A00001', 'B00001'].map(employee => {
      const held = [...updated.values()].filter(row => row[5] === employee);
      const active = held.filter(row => row[2] === '');
      let base = 0;
      for (let n = 5; n <= active.length; n += 5) base += 10000;
      for (let n = 50000; n <= active.reduce((sum, row) => sum + number(row[3]), 0); n += 50000) base += 5000;
      return [2, 3, 4].every(month => held.some(row => Number(row[1].slice(5, 7)) === month))
        ? (base === 0 ? 5000 : base + base / 5) : base;
    });
    exact(body, 7, parts(body, 7).choices.map(option => {
      assert(option.type === 'table');
      assert.deepEqual(option.columns, ['社員 A00001', '社員 B00001']);
      return option.rows[0].every((value, i) => number(value) === pay[i]);
    }));
    allPay.add(parts(body, 7).keys[0]);
  }
  assert.equal(allPay.size, 6);
});

test('2013春午後問6は許容範囲、全週の傾向、厳密に超える最小整数を独立検算', () => {
  for (const body of generated(6)) {
    const teams = table(body, '表3').rows.map(([team, size, hours, defects]) => ({
      team, time: Number(hours) / Number(size), count: Number(defects) / Number(size),
    }));
    const yes: string[] = [], no: string[] = [];
    for (const { team, time, count } of teams) {
      const timeOk = time >= 3 && time <= 3.6, countOk = count >= 3.6 && count <= 4.4;
      if (timeOk && countOk) yes.push(team);
      if (!timeOk && !countOk) no.push(team);
    }
    [yes, no].forEach((expected, i) => exact(body, i, parts(body, i).choices.map(block => text(block) === expected.join('と'))));
    const weeks = table(body, '表4').rows.map(row => row.slice(1).map(Number));
    const [sizes, counts] = weeks;
    assert.equal(sizes.slice(0, 4).reduce((a, b) => a + b, 0), sizes[4]);
    assert.equal(counts.slice(0, 4).reduce((a, b) => a + b, 0), counts[4]);
    const totalRate = counts[4] / sizes[4];
    exact(body, 2, [totalRate >= 2.4 && totalRate <= 3.6, totalRate < 2.4, totalRate > 3.6]);
    const rates = counts.slice(0, 4).map((n, i) => n / sizes[i]);
    const above = rates.some(rate => rate > 3.6), below = rates.some(rate => rate < 2.4);
    exact(body, 3, [rates.slice(1).every((rate, i) => rate > rates[i]), rates.slice(1).every((rate, i) => rate < rates[i]),
      above && below, !above && below, above && !below]);
    const target = rates.reduce((sum, rate, i) => {
      if (rate >= 2.4 && rate <= 3.6) return sum;
      const threshold = (rate < 2.4 ? 5.4 : 6.6) * sizes[i];
      const smallest = Array.from({ length: 50 }, (_, n) => n).find(n => n > threshold + 1e-9);
      assert(smallest !== undefined && smallest >= counts[i]);
      return sum + smallest - counts[i];
    }, 0);
    exact(body, 4, parts(body, 4).choices.map(block => Number(text(block)) === target));
  }
});

test('2013春午後問7の8記述・為替要因・年ごとの数量と売上を図表から独立検算', () => {
  const triples = new Set<string>();
  for (const body of generated(7)) {
    assert.match(stems(body), /解答群の中から三つ選べ/);
    const group = body.partAnswers![0];
    assert(group.kind === 'unordered');
    assert.deepEqual(group.partIds, ['part-s1-choice-1', 'part-s1-choice-2', 'part-s1-choice-3']);
    assert.equal(body.answerParts![0].label, '設問1');
    const graph = drawing(body, '-market-chart');
    const chart = graph.alt.split('\n');
    assert.match(chart[0], /0～200、20刻み/);
    const years = chart[1].split('｜').slice(1).map(Number);
    assert.deepEqual(years, [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011]);
    const points = chart.slice(2).map((line, i) => {
      assert(line.startsWith('ABCDE'[i] + '国'));
      return line.split('｜').slice(1).map(Number);
    });
    assert.equal(points.length, 5);
    assert(points.every(row => row.length === 10 && row.every(value => value > 0 && value <= 200)));
    const byYear = years.map((_, i) => points.map(row => row[i]));
    const add = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
    const hasIncrease = (values: readonly number[]) => values.every((value, i) => i === 0 || values[i - 1] < value);
    const rank = (values: readonly number[]) => values.map(value => values.filter(other => other > value).length).join('');
    const changed = years.filter((_, i) => i > 0 && rank(byYear[i]) !== rank(byYear[i - 1]));
    const ratios = points.map(row => row[9] / row[0]);
    const growth = points.map(row => row[9] - row[0]);
    const sums = points.map(add);
    exact(body, 0, [
      hasIncrease(byYear.map(add)), changed.join() === '2005,2009',
      sums.indexOf(Math.max(...sums)) === 0 && ratios.indexOf(Math.max(...ratios)) === 0,
      sums.indexOf(Math.min(...sums)) === 1 && ratios.indexOf(Math.max(...ratios)) === 1,
      growth[2] < 0 && growth.filter(value => value < 0).length === 1,
      hasIncrease(points[3].slice(6)) && ratios.indexOf(Math.min(...ratios)) === 3,
      growth.indexOf(Math.max(...growth)) === 4, points.filter(hasIncrease).length === 2,
    ], 3);
    triples.add(parts(body, 0).keys.join());
    const sales = table(body, '表1').rows.map(row => row.slice(1).map(Number));
    assert.deepEqual(sales[0], points[2].slice(-2));
    const [qty, usd] = sales;
    assert(qty[1] < qty[0] && usd[1] > usd[0] && usd[1] / qty[1] > usd[0] / qty[0]);
    // Review each proposed cause against the direction of change in USD per box.
    const priceMechanisms = new Map<string, number>([['商品の種類の減少', 0], ['商品の種類の増加', 0],
      ['商品の値上げ', 1], ['商品の値下げ', -1]]);
    const incomeMechanisms = new Map<string, number>([['高価格帯商品へ購入がシフト', 1], ['低価格帯商品へ購入がシフト', -1],
      ['商品の購入頻度が減少', 0], ['商品の購入頻度が増加', 0], ['商品の購入量が減少', 0], ['商品の購入量が増加', 0]]);
    const conversion = new Map<string, number>([['日本円に対する現地通貨高', 0], ['日本円に対する現地通貨安', 0],
      ['日本円に対する米ドル高', 0], ['日本円に対する米ドル安', 0], ['米ドルに対する現地通貨高', 1], ['米ドルに対する現地通貨安', -1]]);
    [priceMechanisms, incomeMechanisms, conversion].forEach((mechanism, i) => exact(body, i + 1, parts(body, i + 1).choices.map(option => {
      const effect = mechanism.get(text(option));
      assert(effect !== undefined);
      return effect > 0;
    })));
    const prediction = table(body, '表2');
    assert.deepEqual(prediction.columns, ['項目', '2011年', '2015年', '2020年']);
    const [gdp, population, price] = prediction.rows.map(row => row.slice(1).map(Number));
    const demand = price.map((_, i) => 16 * gdp[i] + 35 * population[i] - 872);
    const revenue = price.map((value, i) => value * demand[i]);
    for (const [index, metric] of [demand, revenue].entries()) {
      const first = Math.sign(metric[1] - metric[0]), second = Math.sign(metric[2] - metric[1]);
      assert(first !== 0 && second !== 0);
      exact(body, index + 4, [first < 0 && second < 0, first > 0 && second > 0, first < 0 && second > 0, first > 0 && second < 0]);
    }
  }
  assert.equal(triples.size, 4);
});

type DisplayPurchase = { ptr: number; code: number; name: string; price: number; count: number; amount: number };
const clean = (value: string) => value.replace(/（網掛け）/g, '');
function readPurchase(panel: ReturnType<typeof drawing>) {
  const lines = panel.alt.split('\n').map(clean);
  assert.equal(lines[2], 'ptr｜品番｜品名｜単価｜数量｜金額');
  const rows: DisplayPurchase[] = lines.slice(3, -1).map(line => {
    const [, ptr, code, name, price, count, amount] = line.split('｜');
    return { ptr: Number(ptr), code: Number(code), name, price: Number(price), count: Number(count), amount: Number(amount) };
  });
  assert.equal(rows.length, Number(lines[1].split('｜')[1]));
  return { head: Number(lines[0].split('｜')[1]), rows };
}
function readSpecial(panel: ReturnType<typeof drawing>) {
  const lines = panel.alt.split('\n').map(clean);
  const length = Number(lines[1].split('｜')[1]), target = lines.slice(3, 3 + length).map(line => line.split('｜').slice(1).map(Number));
  const [, code, name, price, count] = lines.at(-1)!.replace('（数量に網掛け）', '').split('｜');
  return { designated: Number(lines[0].split('｜')[1]), codes: target.map(row => row[0]), counts: target.map(row => row[1]),
    code: Number(code), name, price: Number(price), count: Number(count) };
}
function activeCodes(rows: readonly DisplayPurchase[], head: number): number[] | null {
  const codes: number[] = [], visited = new Set<number>();
  let i = head;
  while (i !== 0) {
    if (!rows[i - 1] || visited.has(i)) return null;
    visited.add(i);
    codes.push(rows[i - 1].code);
    i = rows[i - 1].ptr;
  }
  return codes;
}
type Pointers = { head: number; k: number; previous: number; length: number; rows: readonly DisplayPurchase[] };
function pointerOption(option: string, { k, previous, length, rows }: Pointers): number | undefined {
  switch (option) {
    case 'K': return k;
    case 'Kp': return previous;
    case '購入[K].ptr': return rows[k - 1]?.ptr;
    case '購入[Kp].ptr': return rows[previous - 1]?.ptr;
    case '購入[購入行数].ptr': return rows[length - 1]?.ptr;
    case '購入行数': return length;
    default: throw Error('unreviewed ' + option);
  }
}
function searchCandidate(rows: readonly DisplayPurchase[], head: number, codes: readonly number[], a: string, b: string) {
  let k = head, t = 0;
  const values = codes.map(() => 0);
  const advance = (option: string) => {
    switch (option) {
      case 'K ← K ＋ 1': k++; break;
      case 'K ← ptr起点': k = head; break;
      case 'K ← 購入[K].ptr': k = rows[k - 1]?.ptr ?? -1; break;
      case 'T ← 1': t = 0; break;
      case 'T ← T ＋ 1': t++; break;
      default: throw Error('unreviewed ' + option);
    }
  };
  for (let iterations = 0; k && t < codes.length; iterations++) {
    if (!rows[k - 1] || iterations > rows.length + codes.length) return null;
    const row = rows[k - 1], code = codes[t];
    if (row.code === code) values[t] = row.count;
    if (row.code <= code) advance(a);
    if (row.code >= code) advance(b);
  }
  return values;
}
function insertCandidate(rows: readonly DisplayPurchase[], head: number, special: DisplayPurchase, c: string, d: string) {
  const order = rows.map((row, i) => ({ index: i + 1, code: row.code })).sort((a, b) => a.code - b.code);
  const firstGreater = order.findIndex(entry => entry.code > special.code);
  const k = order[firstGreater]?.index ?? 0, previous = order[firstGreater === -1 ? order.length - 1 : firstGreater - 1]?.index ?? 0;
  const length = rows.length + 1, newRows = rows.map(row => ({ ...row }));
  const state = { head, k, previous, length, rows: newRows };
  const link = pointerOption(c, state);
  if (link === undefined) return null;
  if (previous) newRows[previous - 1].ptr = link;
  else head = link;
  const next = pointerOption(d, state);
  if (next === undefined) return null;
  newRows.push({ ...special, ptr: next });
  return { head, rows: newRows };
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

test('2013春午後問8の検索・追加・更新・削除を別解と全択で検算', () => {
  const bodies = generated(8);
  const examples = bodies.map(body => {
    const before = readPurchase(drawing(body, '-purchases-before'));
    const after = readPurchase(drawing(body, '-purchases-after'));
    const special = readSpecial(drawing(body, '-special-before'));
    const found = readSpecial(drawing(body, '-special-after'));
    const purchased = new Map(before.rows.map(row => [row.code, row.count]));
    const quantities = special.codes.map(code => purchased.get(code) ?? 0);
    const count = Math.floor(quantities.reduce((sum, qty) => sum + qty, 0) / special.designated);
    const newRecord = { ptr: 0, code: special.code, name: special.name, price: special.price, count, amount: special.price * count };
    assert.deepEqual(special.counts, [0, 0, 0]);
    assert.equal(special.count, 0);
    assert.deepEqual(found.counts, quantities);
    assert.equal(found.count, count);
    assert(before.rows.every(row => row.amount === row.count * row.price));
    const wanted = [...purchased.keys(), ...(count ? [special.code] : [])].sort((a, b) => a - b);
    assert.deepEqual(activeCodes(after.rows, after.head), wanted);
    assert.equal(after.rows.length, before.rows.length + Number(count > 0));
    if (count) {
      const last = after.rows.at(-1)!;
      assert.equal(last.code, special.code);
      assert.equal(last.amount, newRecord.amount);
      assert.equal(last.count, count);
    } else {
      assert.deepEqual(after, before);
    }
    return { before, after, special, quantities, newRecord };
  });
  const baseline = bodies[0];
  const searchChoices = parts(baseline, 0).choices.map(text);
  const successfulSearch = searchChoices.flatMap((a, i) => searchChoices.map((b, j) => ({ a, b, i, j }))).filter(({ a, b }) =>
    examples.every(({ before, special, quantities }) => same(searchCandidate(before.rows, before.head, special.codes, a, b), quantities))
    && same(searchCandidate([], 0, [222, 223], a, b), [0, 0]));
  assert.equal(successfulSearch.length, 1);
  const insertChoices = parts(baseline, 2).choices.map(text);
  const successfulInsert = insertChoices.flatMap((c, i) => insertChoices.map((d, j) => ({ c, d, i, j }))).filter(({ c, d }) =>
    examples.filter(({ newRecord }) => newRecord.count > 0).every(({ before, after, newRecord }) =>
      same(insertCandidate(before.rows, before.head, newRecord, c, d), after)));
  assert.equal(successfulInsert.length, 1);
  const deletionCases = examples.filter(({ newRecord }) => newRecord.count > 0).map(({ before, after, newRecord, special }) => ({
    original: activeCodes(before.rows, before.head)!, after, newRecord, special,
  }));
  assert.equal(deletionCases.length, 3);
  // An eligible product can be scanned after insertion. This distinguishes
  // the successor of the promotion from the pointer of the last physical row.
  const middle = deletionCases[0];
  const later = { ptr: 0, code: 399, name: '後で読込んだ商品', price: 120, count: 1, amount: 120 };
  const extended = middle.after.rows.map(row => ({ ...row }));
  extended.find(row => row.ptr === 0)!.ptr = extended.length + 1;
  extended.push(later);
  deletionCases.push({ ...middle, original: [...middle.original, later.code], after: { ...middle.after, rows: extended } });
  const deletions = parts(baseline, 6).choices.map(text).map(option => deletionCases.every(({ original, after, newRecord }) => {
    const rows = after.rows.map(row => ({ ...row }));
    const k = rows.findIndex(row => row.code === newRecord.code) + 1, previous = rows.findIndex(row => row.ptr === k) + 1;
    let head = after.head;
    const link = pointerOption(option, { k, previous, head, length: rows.length, rows });
    if (link === undefined) return false;
    if (previous) rows[previous - 1].ptr = link;
    else head = link;
    return same(activeCodes(rows, head), original) && rows.length === after.rows.length && rows[k - 1].code === newRecord.code;
  }));
  for (const { after, special, original } of deletionCases) {
    const promo = { ...special, targets: special.codes };
    const sameQuantity = spring2013Pm8Evaluate(after.rows, after.head, promo);
    assert.equal(sameQuantity.count, after.rows.find(row => row.code === promo.code)!.count);
    assert.deepEqual(sameQuantity.rows, after.rows);
    const more = after.rows.map(row => row.code === 222 ? { ...row, count: row.count + promo.designated } : row);
    const updated = spring2013Pm8Evaluate(more, after.head, promo);
    assert.equal(updated.count, sameQuantity.count + 1);
    assert.equal(updated.rows.length, after.rows.length);
    assert.equal(updated.rows.find(row => row.code === promo.code)?.count, updated.count);
    assert.equal(updated.count * promo.price, (sameQuantity.count + 1) * promo.price);
    assert.deepEqual(updated.rows.map(row => row.ptr), after.rows.map(row => row.ptr));
    const canceled = after.rows.map(row => promo.targets.includes(row.code) ? { ...row, count: 0 } : row);
    const removed = spring2013Pm8Evaluate(canceled, after.head, promo);
    assert.equal(removed.count, 0);
    assert(removed.rows.some(row => row.code === promo.code));
    assert.deepEqual(activeCodes(removed.rows.map(row => ({ ...row, amount: row.count * row.price })), removed.head), original);
  }
  for (const body of bodies) {
    exact(body, 0, searchChoices.map((_, i) => i === successfulSearch[0].i));
    exact(body, 1, searchChoices.map((_, i) => i === successfulSearch[0].j));
    exact(body, 2, insertChoices.map((_, i) => i === successfulInsert[0].i));
    exact(body, 3, insertChoices.map((_, i) => i === successfulInsert[0].j));
    const action = table(body, '表1').rows;
    exact(body, 4, parts(body, 4).choices.map(block => text(block) === action[0][2]));
    exact(body, 5, parts(body, 5).choices.map(block => text(block) === action[0][1]));
    exact(body, 6, deletions);
    assert.match(stems(body), /初期値0を格納してプログラムを呼び出す/);
    assert.match(stems(body), /数量が同じになる場合でも処理を行う/);
    assert.match(stems(body), /配列の要素はそのまま残し/);
  }
});

test('2013春午後問5〜8の15図の表示、キー下線、分岐、点線枠・空欄・網掛けを検査', () => {
  assert.equal(figures.length, 15);
  assert.deepEqual(figures.map(figure => figure.profile).sort(), renderers.map(renderer => renderer.profile).sort());
  for (const spec of specs) for (const body of generated(spec.number)) {
    for (const block of body.prompt) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const definition = figures.find(figure => figure.profile === (block.scene.kind === 'source_figure' ? block.scene.profile : ''));
      assert(definition);
      definition.validate(block.scene.values);
      assert.equal(definition.alt(block.scene.values), block.alt);
      assert.throws(() => definition.validate([999]));
      const html = markup({ scene: block.scene, alt: block.alt, caption: block.caption });
      assert.match(html, /class="diagram-scroll" tabindex="0"/);
      assert.match(html, /aria-description=|aria-describedby=/);
      assert(!html.includes('undefined') && !html.includes('NaN'));
    }
  }
  const q5 = specs[0].original;
  assert.equal([...markup(drawing(q5, '-change-layout')).matchAll(/data-key-field=/g)].length, 2);
  assert.match(markup(drawing(q5, '-merge-flow')), /data-flow-node="g"/);
  const chart = markup(drawing(specs[2].original, '-market-chart'));
  assert.equal([...chart.matchAll(/data-market-series=/g)].length, 5);
  assert.equal([...chart.matchAll(/<polyline /g)].length, 5);
  const q8 = specs[3].original;
  assert.match(markup(drawing(q8, '-declarations')), /\n +整数型： 単価/);
  const program = markup(drawing(q8, '-8-program'));
  assert.equal([...program.matchAll(/data-source-blank=/g)].length, 7);
  assert.equal([...program.matchAll(/data-source-dashed=/g)].length, 1);
  assert.equal([...program.matchAll(/data-control-symbol="■"/g)].length, 6);
  assert.equal([...markup(drawing(q8, '-update-program')).matchAll(/data-source-blank="g"/g)].length, 2);
  assert.equal([...markup(drawing(q8, '-purchases-after')).matchAll(/data-changed="true"/g)].length, 8);
  assert.equal([...markup(drawing(q8, '-special-after')).matchAll(/data-changed="true"/g)].length, 3);
});
