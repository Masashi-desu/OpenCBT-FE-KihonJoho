import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import commonSchema from '../docs/public/schemas/common.schema.json';
import diagramSchema from '../docs/public/schemas/diagram.schema.json';
import formulaSchema from '../docs/public/schemas/formula.schema.json';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2011AutumnAm54To80Definitions as definitions } from '../src/core/generators/legacy-2011-autumn-am-54-80';
import { legacy2011AutumnAm5480Figures as figures } from '../src/core/generators/legacy-2011-autumn-am-54-80-figures';
import { autumn2011Am5480Source as source } from '../src/core/generators/legacy-2011-autumn-am-54-80-source';
import { legacy2011AutumnAm5480FigureRenderers as renderers } from '../src/ui/Legacy2011AutumnAm5480Figures';
import { autumn2011Am5480KnowledgeOracle as oracle } from './fixtures/legacy-2011-autumn-am-54-80-knowledge-oracle';
import review from './fixtures/legacy-2011-autumn-am-54-80-review.json';

function text(blocks: Block[]) {
  return blocks.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
}
function unique(body: GeneratedBody, truth: boolean[]) {
  assert.equal(truth.filter(Boolean).length, 1);
  assert.deepEqual(truth, body.choices.map((_, i) => i === body.correctIndex));
}
function cases(number: number) {
  const definition = definitions.find(candidate => candidate.source === `2011h23a-fe-am-${number}`);
  assert(definition);
  return [0, 1, 2, 3].map(index => definition.build([index]));
}
function figureTable(body: GeneratedBody) {
  const block = body.prompt.find(item => item.type === 'diagram');
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(item => item.profile === profile);
  const renderer = renderers.find(item => item.profile === profile);
  assert(definition && renderer);
  assert.equal(definition.alt(values), block.alt);
  assert.throws(() => definition.validate([-1]), /図表の入力が範囲外/);
  assert.throws(() => definition.validate([...values, 0]), /図表の入力が範囲外/);
  const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
  assert(markup.includes('data-figure-profile="' + profile + '"'));
  assert(markup.includes('role="group" aria-label="' + block.caption + '"'));
  assert(markup.includes('aria-description="' + block.alt + '"'));
  assert.match(markup, /class="diagram-scroll" tabindex="0"/);
  const rows = [...markup.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(([, content]) =>
    [...content.matchAll(/<t[dh]\b[^>]*>([^<]*)<\/t[dh]>/g)].map(([, item]) => item));
  return { rows, markup };
}
function n(value: string) {
  assert.match(value, /^\d[\d,]*$/);
  return Number(value.replaceAll(',', ''));
}
function amounts(body: GeneratedBody) {
  const values = body.choices.map(choice => n(text(choice)));
  assert(values.slice(1).every((value, i) => value > values[i]));
  return values;
}

test('2011秋午前54〜80の原紙・公式解答と掲載25系列の100条件が対応する', () => {
  const held = [56, 67];
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.addSchema([commonSchema, diagramSchema, formulaSchema]);
  const checkBlock = ajv.getSchema(commonSchema.$id + '#/$defs/block');
  assert(checkBlock);
  for (const number of held) assert(!Object.hasOwn(source, number));
  const officialKeys = ['ア','ウ','イ','イ','エ','イ','イ','エ','イ','ウ','イ','ア','イ','イ','ウ','ウ','エ','ア','エ','ウ','イ','ア','ウ','イ','エ','エ','イ'];
  const pages = [23,23,24,24,25,25,25,26,26,26,27,27,27,27,28,28,29,29,30,30,31,31,31,32,32,32,33];
  const numbers = Array.from({ length: 27 }, (_, i) => i + 54).filter(number => !held.includes(number));
  assert.deepEqual(review.rightsHolds.map(item => item.number), held);
  assert.equal(review.sources['question.pdf'].sha256, 'e1efc842d6bd0d6e9457da56a4df0080da068da2c5bc2f770bdd3c18505a2cec');
  assert.equal(review.sources['answer.pdf'].sha256, '1002803d6d26eca086711c0fb1dd9b04439016649d8d5de0d021a080750198ad');
  assert.deepEqual(definitions.map(definition => Number(definition.source.split('-').at(-1))), numbers);
  assert.deepEqual(review.records.map(record => record.number), numbers);
  assert.deepEqual(renderers.map(item => item.profile), figures.map(item => item.profile));
  definitions.forEach((definition, i) => {
    const number = numbers[i], official = officialKeys[number - 54];
    const original = source[number as keyof typeof source], record = review.records[i];
    assert.equal(original.page, pages[number - 54]);
    assert.equal(record.physicalPage, original.page);
    assert.equal(record.scope, definition.source);
    assert.equal(record.answer, official);
    assert.equal(definition.sourceAnswer, official);
    assert.equal(definition.version, '3.7.0');
    assert.deepEqual(definition.reference, [0]);
    for (const invalid of [[], [-1], [1.5], [4], [0, 0], [NaN]]) assert.throws(() => definition.build(invalid), /入力が範囲外/);
    const output = cases(number);
    assert.equal('アイウエ'[output[0].correctIndex!], official);
    assert.deepEqual(output[0].choices.map(text), original.choices);
    assert(text(output[0].prompt).startsWith(original.prompt));
    assert.equal(new Set(output.map(body => JSON.stringify(body.prompt))).size, 4);
    output.forEach((body, index) => {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(text)).size, 4);
      assert(body.explanation.length > 20);
      for (const block of [...body.prompt, ...body.choices.flat()])
        assert(checkBlock(block), JSON.stringify(checkBlock.errors));
      const digest = createHash('sha256').update(JSON.stringify([body.prompt, body.choices, body.explanation])).digest('hex');
      assert.equal(digest, record.checks.reviewedContentSha256[index]);
    });
  });
});

for (const [number, rows] of Object.entries(oracle)) {
  test(`2011秋午前問${number}は四条件の対象と全候補の意味が独立査読表に一致する`, () => {
    const outputs = cases(Number(number));
    assert.equal(outputs.length, rows.length);
    outputs.forEach((body, i) => {
      const [target, parts] = rows[i].split('|');
      const roles = parts.split(',');
      assert.equal(new Set(roles).size, 4);
      unique(body, roles.map(role => role === target));
    });
  });
}

test('問57は表示した営業時間と可用性から、許容範囲内の最大整数を選ぶ', () => {
  const original = [8, 10, 995, 30];
  cases(57).forEach((body, i) => {
    const conditions = body.prompt.find(block => block.type === 'list');
    assert(conditions?.type === 'list');
    const hours = conditions.items[0].match(/午前(\d+)時から午後(\d+)時/);
    const availability = conditions.items[1].match(/可用性(\d+(?:\.\d+)?)％以上/);
    const days = text(body.prompt).match(/営業日は(\d+)日/);
    assert(hours && availability && days);
    const start = Number(hours[1]), end = Number(hours[2]), threshold = Number(availability[1]) * 10, daysInMonth = Number(days[1]);
    if (i === 0) assert.deepEqual([start, end, threshold, daysInMonth], original);
    const period = (12 + end - start) * daysInMonth;
    const options = amounts(body);
    const possible = options.filter(hours => (period - hours) * 1000 >= threshold * period);
    const max = Math.max(...possible);
    unique(body, options.map(hours => hours === max));
    assert(body.explanation.includes(max + '時間'));
  });
});

test('問70は表示した移行率と顧客人数から全四記述を検算する', () => {
  cases(70).forEach((body, i) => {
    const { rows, markup } = figureTable(body);
    assert.deepEqual(rows[0], ['', '人数', 'P', 'Q', 'R', 'S']);
    assert.equal((markup.match(/colSpan="2"/g) ?? []).length, 2);
    const migration = rows.slice(1, 4);
    assert.deepEqual(migration.map(row => row[0]), ['A', 'B', 'C']);
    const populations = migration.map(row => n(row[1]));
    const rates = migration.map(row => row.slice(2).map(s => {
      assert.match(s, /^0\.\d$/);
      return Number(s[2]);
    }));
    const moves = populations.map((count, from) => rates[from].map(rate => count * rate / 10));
    assert(rates.every(row => row.reduce((sum, rate) => sum + rate, 0) <= 10));
    assert.deepEqual(rows[4].slice(1).map(n), [0, 1, 2, 3].map(to => moves.reduce((sum, row) => sum + row[to], 0)));
    const newcomers = rows[5].slice(1).map(n);
    if (i === 0) {
      assert.deepEqual(populations, [10000, 20000, 80000]);
      assert.deepEqual(rates, [[5, 3, 1, 1], [1, 6, 1, 1], [1, 1, 3, 3]]);
      assert.deepEqual(newcomers, [5000, 7000, 13000, 23000]);
    }
    const claims = body.choices.map(text);
    const qClaim = claims[0].match(/うち，([\d,]+)人が商品Q/);
    assert(qClaim);
    const share = claims[2].match(/見込者の(\d)割/);
    assert(share);
    const expectedTotal = moves[0][0] + moves[1][0] + moves[2][0] + newcomers[0];
    unique(body, [moves[0][1] === n(qClaim[1]), moves[1].reduce((a, b) => a + b, 0) === populations[1],
      moves[0][0] * 10 === expectedTotal * Number(share[1]), newcomers[3] < moves[2][3]]);
  });
});

function maxBoundedProfit(maxMinutes: number, rates: number[], times: number[], caps: number[]) {
  const best = new Int32Array(maxMinutes + 1);
  for (const [product, limit] of caps.entries()) {
    let remaining = limit;
    for (let group = 1; remaining > 0; group *= 2) {
      const quantity = Math.min(remaining, group);
      const time = quantity * times[product], profit = quantity * rates[product];
      for (let minutes = maxMinutes; minutes >= time; minutes--) best[minutes] = Math.max(best[minutes], best[minutes - time] + profit);
      remaining -= quantity;
    }
  }
  return best[maxMinutes];
}
test('問72の最大利益を表示した時間と需要上限から有界ナップサックで検算する', () => {
  cases(72).forEach((body, i) => {
    const { rows } = figureTable(body);
    assert.deepEqual(rows.map(row => row[0]), ['', '1個当たりの利益（円）', '1個当たりの組立て所要時間（分）', '月間需要量上限（個）']);
    const [profits, durations, caps] = rows.slice(1).map(row => row.slice(1).map(n));
    const hours = text(body.prompt).match(/月間(\d+)時間まで/);
    assert(hours);
    const minutes = Number(hours[1]) * 60;
    if (i === 0) assert.deepEqual([profits, durations, caps, minutes], [[1800, 2500, 3000], [6, 10, 15], [1000, 900, 500], 12000]);
    const expected = maxBoundedProfit(minutes, profits, durations, caps);
    const distractors = [[2, 1, 0], [0, 2, 1], [1, 0, 2], [0, 1, 2]].map(order => {
      const picked = [0, 0, 0];
      let used = 0;
      for (const product of order) while (picked[product] < caps[product] && used + durations[product] <= minutes) {
        picked[product]++;
        used += durations[product];
      }
      return picked.reduce((profit, count, product) => profit + count * profits[product], 0);
    }).sort((a, b) => a - b);
    const options = amounts(body);
    assert.deepEqual(options, distractors);
    assert(options.slice(1).every((value, index) => value - options[index] >= 150000));
    unique(body, options.map(value => value === expected));
  });
});

test('問73の日別の入出庫と残数を照合して生産計画を求める', () => {
  cases(73).forEach((body, i) => {
    const { rows, markup } = figureTable(body);
    assert.match(markup, /単位　個/);
    assert.deepEqual(rows[0], ['', '生産計画', '販売計画', '在庫計画']);
    assert.deepEqual(rows.slice(1).map(row => row.slice(0, 2)), ['a', 'b', 'c', 'd'].map((id, index) => [`4月${index + 1}日`, id]));
    const question = text(body.prompt);
    const opening = question.match(/実在庫(\d+)個/), target = question.match(/([a-d])は幾つ/);
    assert(opening && target);
    let carried = Number(opening[1]);
    const ledger = new Map<string, number>();
    for (const [, id, demand, targetStock] of rows.slice(1)) {
      const candidates = amounts(body);
      const possible = candidates.find(built => carried + built - n(demand) === n(targetStock));
      assert(possible !== undefined);
      ledger.set(id, possible);
      carried += possible - n(demand);
    }
    if (i === 0) assert.deepEqual([...ledger.values()], [4900, 4450, 4850, 4550]);
    assert.deepEqual([...ledger.values()].sort((a, b) => a - b), amounts(body));
    unique(body, amounts(body).map(value => value === ledger.get(target[1])));
  });
});

test('問76は年度ごとに指定額を償却し、全候補と帳簿価額を検算する', () => {
  cases(76).forEach((body, i) => {
    const stem = text(body.prompt);
    const years = [...stem.matchAll(/平成(\d+)年/g)].map(match => Number(match[1]));
    const amount = stem.match(/(\d+)万円/), rate = stem.match(/償却率は0\.(\d{3})/);
    assert(amount && rate);
    assert.match(stem, /4月1日.*3月31日.*残存価額は0円/);
    const elapsed = years[1] - years[0];
    let balance = Number(amount[1]) * 10000;
    const annual = Number(amount[1]) * 10 * Number(rate[1]);
    const schedule = Array.from({ length: 4 }, () => balance -= annual);
    if (i === 0) assert.deepEqual([years, annual], [[21, 23], 167000]);
    assert.deepEqual(amounts(body), [...schedule].reverse());
    unique(body, amounts(body).map(value => value === schedule[elapsed - 1]));
  });
});

test('問77は選択肢の売上高から利益を逆算して目標との一致を調べる', () => {
  cases(77).forEach((body, i) => {
    const input = [...text(body.prompt).matchAll(/(\d+)百万円/g)].map(match => Number(match[1]));
    const [sales, variable, fixed, goal] = input;
    if (i === 0) assert.deepEqual(input, [100, 60, 30, 18]);
    const options = amounts(body);
    assert(options.slice(1).every((value, index) => value - options[index] >= 12));
    const profitsScaled = options.map(candidate => candidate * sales - candidate * variable - fixed * sales);
    unique(body, profitsScaled.map(value => value === goal * sales));
    assert(body.explanation.includes(options[body.correctIndex!] + '百万円'));
  });
});
