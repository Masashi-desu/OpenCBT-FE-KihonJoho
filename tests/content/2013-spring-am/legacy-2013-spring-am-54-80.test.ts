import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2013SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2013-spring-am-54-80';
import { legacy2013SpringAm5480Figures as figures } from '../../../src/core/generators/legacy-2013-spring-am-54-80-figures';
import { legacy2013SpringAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2013SpringAm5480Figures';
import { spring2013Am5480KnowledgeOracle as knowledge } from '../../fixtures/legacy-2013-spring-am-54-80-knowledge-oracle';
import review from '../../fixtures/legacy-2013-spring-am-54-80-review.json';

function definition(number: number) {
  const result = definitions.find(candidate => candidate.source === '2013h25h-fe-am-' + number);
  assert(result);
  return result;
}

function cases(number: number) {
  const item = definition(number);
  return Array.from({ length: item.fields[0].maximum + 1 }, (_, index) => item.build([index]));
}

function stem(body: GeneratedBody) {
  return body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
}

function options(body: GeneratedBody) {
  return body.choices.map(([block]) => {
    assert.equal(block.type, 'paragraph');
    return block.text;
  });
}

function unique(body: GeneratedBody, correct: boolean[]) {
  assert.equal(correct.filter(Boolean).length, 1);
  assert.deepEqual(correct, body.choices.map((_, index) => index === body.correctIndex));
}

function readFigure(body: GeneratedBody) {
  const block = body.prompt[1];
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const renderer = renderers.find(candidate => candidate.profile === profile);
  const definition = figures.find(candidate => candidate.profile === profile);
  assert(renderer && definition);
  assert.equal(definition.alt(values), block.alt);
  const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
  assert(markup.includes('data-figure-profile="' + profile + '"'));
  assert.match(markup, /class="diagram-scroll" tabindex="0"/);
  if (markup.includes('<table ')) {
    assert(markup.includes('role="group"'));
    assert(markup.includes('aria-label="' + block.caption + '"'));
    assert(markup.includes('aria-description="' + block.alt + '"'));
  }
  return { alt: block.alt, markup };
}

function tableRows(markup: string) {
  const [, rows] = /<tbody>([\s\S]+)<\/tbody>/.exec(markup) ?? [];
  assert(rows);
  return [...rows.matchAll(/<tr>([\s\S]+?)<\/tr>/g)].map(([, row]) =>
    [...row.matchAll(/<t[dh][^>]*>([^<]*)<\/t[dh]>/g)].map(([, cell]) => cell));
}

function number(value: string) {
  assert.match(value, /^\d[\d,]*(?:\.\d+)?$/);
  return Number(value.replaceAll(',', ''));
}

test('2013春 午前問54〜80のうち掲載する25問を原紙面・公式解答・全可変条件と照合する', () => {
  const holds = [55, 62];
  const originals = Array.from({ length: 27 }, (_, i) => 54 + i).filter(n => !holds.includes(n));
  assert.deepEqual(review.rightsHolds.map(row => row.number), holds);
  assert.deepEqual(review.records.map(row => row.number), originals);
  assert.deepEqual(definitions.map(item => Number(item.source.split('-').at(-1))), originals);
  for (const row of review.records) {
    const item = definition(row.number), bodies = cases(row.number);
    const original = item.build([0]);
    assert.deepEqual(item.reference, [0]);
    assert.equal(item.sourceAnswer, row.officialAnswer);
    assert.equal('アイウエ'[original.correctIndex!], row.officialAnswer);
    const statementHash = createHash('sha256').update(JSON.stringify([stem(original), options(original)])).digest('hex');
    assert.equal(statementHash, row.statementHash, 'original Q' + row.number);
    assert.equal(bodies.length, row.inputs);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, row.inputs, 'prompt Q' + row.number);
    assert(bodies.every(body => body.explanation.length > 20 && body.choices.length === 4 && new Set(options(body)).size === 4));
    const answers = new Set(bodies.map(body => options(body)[body.correctIndex!]));
    assert(answers.size >= 2, 'answer variation Q' + row.number);
    assert(item.notes.includes('原冊子p.' + row.page));
    if (row.figureAlt) assert.equal(readFigure(original).alt, row.figureAlt);
    for (const bad of [[], [-1], [row.inputs], [0, 1], [0.1], [NaN], Array(1)]) {
      assert.throws(() => item.build(bad), { code: 'PARAMETER_CONSTRAINT' });
    }
    bodies.forEach((body, index) => assert.deepEqual(item.build([index]), body));
  }
});

for (const [key, group] of Object.entries(knowledge)) {
  test('2013春 午前問' + key + 'の全択を査読済み概念表で判定する', () => {
    const bodies = cases(Number(key));
    assert.equal(bodies.length, group.queries.length);
    const usedQueries = new Set();
    for (const body of bodies) {
      const targets = group.queries.filter(([pattern]) => pattern.test(stem(body)));
      assert.equal(targets.length, 1, stem(body));
      const [target, expectedConcept, reasoning] = targets[0];
      assert(!usedQueries.has(target));
      usedQueries.add(target);
      const correct = options(body).map(choice => {
        const matching = group.concepts.filter(([, description]) => description.test(choice));
        assert.equal(matching.length, 1, choice);
        return matching[0][0] === expectedConcept;
      });
      unique(body, correct);
      assert.match(body.explanation, reasoning);
    }
  });
}

test('2013春 午前問69は描画した人数・移行率から全択を独立検算する', () => {
  const keys: number[] = [];
  for (const body of cases(69)) {
    const { markup } = readFigure(body);
    assert.match(markup, />人数<.*>P<.*>Q<.*>R<.*>S</);
    const rows = tableRows(markup);
    assert.deepEqual(rows.map(row => row[0]), ['A', 'B', 'C', '既存顧客数', '新規顧客数']);
    const populations = rows.slice(0, 3).map(([, count, ...rates]) => {
      assert(rates.every(rate => /^(?:0\.\d|1\.0)$/.test(rate)));
      assert(rates.reduce((total, rate) => total + Math.round(number(rate) * 10), 0) <= 10);
      return number(count);
    });
    assert(stem(body).includes('毎月' + rows.slice(0, 3).map(row => row[1] + '人').join('，')));
    assert.match(stem(body), /来年から商品体系を変更.*新商品P，Q，R，S/);
    // Model transfer as equal groups of one tenth of the original customers.
    const customersByNewProduct = rows.slice(0, 3).map((row, index) =>
      row.slice(2).map(rate => Array(Math.round(number(rate) * 10)).fill(populations[index] / 10)
        .reduce((sum: number, count: number) => sum + count, 0)));
    const columnTotals = rows[3].slice(1).map((shown, column) => {
      const sum = customersByNewProduct.map(row => row[column]).reduce((a, b) => a + b);
      assert.equal(number(shown), sum);
      return sum;
    });
    const [a, b, c, d] = options(body);
    const claim = /商品Aの購入者のうち，([\d,]+)人が新商品Q/.exec(a);
    assert(claim);
    assert.match(b, /商品Bの購入者は，新商品P，Q，R，Sのどれかを購入/);
    assert.match(c, /新商品Pの購入見込者の5割は，商品Aの購入者/);
    assert.match(d, /新商品Sの新規顧客数は，商品C.*新商品Sを購入する人数より少ない/);
    const correct = [
      number(claim[1]) === customersByNewProduct[0][1],
      customersByNewProduct[1].reduce((sum, count) => sum + count, 0) === populations[1],
      customersByNewProduct[0][0] === (columnTotals[0] + number(rows[4][1])) / 2,
      number(rows[4][4]) < customersByNewProduct[2][3],
    ];
    assert.equal(/各顧客が購入する新商品は多くても1種類/.test(stem(body)), correct[1]);
    unique(body, correct);
    assert(body.explanation.includes(rows[4][4] + '人'));
    assert(body.explanation.includes('「' + options(body)[correct.indexOf(true)].replace(/。$/, '') + '」が成立する。'));
    keys.push(correct.indexOf(true));
  }
  assert.deepEqual(keys, [3, 0, 1, 2]);
});

test('2013春 午前問76は表示した二制約で整数最適値と連続の最適値を検算する', () => {
  for (const body of cases(76)) {
    const { markup } = readFigure(body);
    const [material, equipment] = tableRows(markup);
    assert.equal(material[0], '原料（kg／製品）');
    assert.equal(equipment[0], '設備（時間／製品）');
    const coefficients = [material.slice(1, 3).map(number), equipment.slice(1, 3).map(number)];
    assert.deepEqual(coefficients, [[2, 4], [3, 2]]);
    const massLimit = /1日当たり合計(\d+) kgまで使用可能/.exec(material[3]);
    const hoursLimit = /1日当たり延べ(\d+)時間まで使用可能/.exec(equipment[3]);
    const profits = /製品Aが(\d+)万円，製品Bが(\d+)万円/.exec(stem(body));
    assert(massLimit && hoursLimit && profits);
    const [mass, hours, gainA, gainB] = [massLimit[1], hoursLimit[1], profits[1], profits[2]].map(number);
    assert.match(stem(body), /1日の最大利益は何万円か/);
    const candidates: { a: number; b: number; gain: number }[] = [];
    for (let a = 0; a <= mass; a++) {
      for (let b = 0; b <= mass; b++) {
        if (2 * a + 4 * b <= mass && 3 * a + 2 * b <= hours) candidates.push({ a, b, gain: gainA * a + gainB * b });
      }
    }
    const maximum = Math.max(...candidates.map(({ gain }) => gain));
    const optimal = candidates.filter(({ gain }) => gain === maximum);
    assert.equal(optimal.length, 1);
    // A nonnegative weighted sum of both constraints gives an upper bound
    // on the continuous objective. The integer optimum attains this bound.
    const materialWeightTimesEight = 3 * gainB - 2 * gainA;
    const equipmentWeightTimesEight = 4 * gainA - 2 * gainB;
    assert(materialWeightTimesEight > 0 && equipmentWeightTimesEight > 0);
    assert.equal(materialWeightTimesEight * mass + equipmentWeightTimesEight * hours, 8 * maximum);
    const choices = options(body).map(number);
    assert.deepEqual(choices, [...new Set(choices)].sort((a, b) => a - b));
    unique(body, choices.map(choice => choice === maximum));
    assert(body.explanation.includes('＝' + maximum + '万円'));
    assert(body.explanation.includes('（' + optimal[0].a + '，' + optimal[0].b + '）'));
  }
});

test('2013春 午前問80は図の四つの時点と2013年の契約成立条件を照合する', () => {
  const actions = ['見積り依頼', '見積書', '注文書', '注文請書', '納品／納品書', '受領書', '請求書', '支払'];
  for (const body of cases(80)) {
    const { markup, alt } = readFigure(body);
    const steps = [...markup.matchAll(/data-step="([^"]+)"(?: data-stage="([^"]+)")? data-from="([A-Z])"><line x1="(\d+)" y1="(\d+)" x2="\d+" y2="(\d+)"/g)];
    assert.deepEqual(steps.map(step => step[1]), actions);
    assert(steps.every((step, i) => i === 0 || number(step[4]) > number(steps[i - 1][4])));
    const [actors, buyer, seller] = /^([A-Z])社が.+を購入するとき，購入先の([A-Z])社/.exec(stem(body)) ?? [];
    assert(actors);
    assert.match(stem(body), /取引の内容は見積書以降の取引手順を通じて変わらない/);
    assert(alt.startsWith('上段は' + buyer + '社（購入元），下段は' + seller + '社（購入先），時間は右向き。'));
    const sends = [buyer, seller, buyer, seller, seller, buyer, seller, buyer];
    steps.forEach((step, i) => {
      assert.equal(step[3], sends[i]);
      assert.equal(number(step[5]) < number(step[6]), sends[i] === buyer);
    });
    const labels = ['①', '②', '③', '④'];
    const stages = steps.filter(step => step[2]);
    assert.deepEqual(stages.map(step => step[2]), labels);
    assert.deepEqual(options(body), labels);
    const firmQuote = /見積書は，提示した条件をそのまま受け入れるなら取引を確定する旨/.test(stem(body));
    const noNotice = /注文請書は受付の連絡に限り，個別の承諾通知は不要/.test(stem(body));
    const acceptedBy = firmQuote ? '注文書' : noNotice ? '納品／納品書' : '注文請書';
    unique(body, options(body).map(option => stages.some(step => step[2] === option && step[1] === acceptedBy)));
    if (noNotice) assert.match(body.explanation, /526条第2項.*意思表示と認める事実/);
    else assert.match(body.explanation, /526条第1項.*発信時|526条第1項.*発した時/);
    assert(!body.explanation.includes('到達時'));
  }
});
