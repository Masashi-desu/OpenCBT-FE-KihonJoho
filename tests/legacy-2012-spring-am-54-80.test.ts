import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../src/core/generators/definition';
import type { Block } from '../src/core/types';
import { legacy2012SpringAm54To80Definitions as definitions } from '../src/core/generators/legacy-2012-spring-am-54-80';
import { legacy2012SpringAm5480Figures as figures } from '../src/core/generators/legacy-2012-spring-am-54-80-figures';
import { spring2012Am5480Source as source } from '../src/core/generators/legacy-2012-spring-am-54-80-source';
import { legacy2012SpringAm5480FigureRenderers as renderers } from '../src/ui/Legacy2012SpringAm5480Figures';
import { spring2012Am5480KnowledgeOracle as knowledge } from './fixtures/legacy-2012-spring-am-54-80-knowledge-oracle';
import review from './fixtures/legacy-2012-spring-am-54-80-review.json';

function text(blocks: Block[]) {
  return blocks.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
}

function unique(body: GeneratedBody, truth: boolean[]) {
  assert.equal(truth.filter(Boolean).length, 1);
  assert.deepEqual(truth, body.choices.map((_, i) => i === body.correctIndex));
}

function diagram(body: GeneratedBody) {
  const block = body.prompt.find(candidate => candidate.type === 'diagram');
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(candidate => candidate.profile === profile);
  const renderer = renderers.find(candidate => candidate.profile === profile);
  assert(definition && renderer);
  definition.validate(values);
  assert.equal(definition.alt(values), block.alt);
  assert.throws(() => definition.validate([...values, 0]), /図表の入力が範囲外/);
  assert.throws(() => definition.alt([-1]), /図表の入力が範囲外/);
  const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
  assert(markup.includes(`data-figure-profile="${profile}"`));
  assert(markup.includes(`aria-description="${block.alt}"`));
  assert.match(markup, /class="diagram-scroll" tabindex="0"/);
  return { markup, alt: block.alt };
}

function cases(number: number) {
  const definition = definitions.find(candidate => candidate.source === `2012h24h-fe-am-${number}`);
  assert(definition);
  return Array.from({ length: definition.fields[0].maximum + 1 }, (_, i) => definition.build([i]));
}

test('2012春午前54〜80の27系列は原冊子の問番号・公式解答と108入力を保持する', () => {
  const numbers = Array.from({ length: 27 }, (_, i) => 54 + i);
  const answerKey = 'ウアエイイアエイエエエウイアエイイエアエエイイイエイエ';
  const pages = [25, 25, 26, 26, 27, 27, 27, 28, 28, 28, 29, 29, 29, 30, 30, 30, 31, 31, 31, 32, 32, 33, 34, 35, 36, 36, 36];
  assert.deepEqual(definitions.map(definition => Number(definition.source.split('-').at(-1))), numbers);
  assert.deepEqual(review.records.map(record => record.number), numbers);
  assert.deepEqual(review.rightsHolds, []);
  assert.equal(review.sources['question.pdf'].sha256, '40dbcf86d8c2b789e1f68833beb072eedd3dea64853571fca815eac274e28768');
  assert.equal(review.sources['answer.pdf'].sha256, 'bc64ecf9d269d636139ff96c89434907459a8702a2b499cb1cca557149adcc66');
  assert.deepEqual(renderers.map(renderer => renderer.profile), figures.map(figure => figure.profile));
  definitions.forEach((definition, i) => {
    const number = numbers[i];
    const record = review.records[i];
    const original = source[number as keyof typeof source];
    const outputs = cases(number);
    assert.equal(record.scope, definition.source);
    assert.equal(record.physicalPage, pages[i]);
    assert.equal(original.page, pages[i]);
    assert.equal(record.answer, answerKey[i]);
    assert.equal(definition.sourceAnswer, answerKey[i]);
    assert.deepEqual(definition.reference, [0]);
    assert.equal(outputs.length, 4);
    assert.equal('アイウエ'[outputs[0].correctIndex!], answerKey[i]);
    assert.equal(text(outputs[0].prompt), original.prompt);
    assert.deepEqual(outputs[0].choices.map(text), original.choices);
    for (const invalid of [[], [4], [-1], [1.5], [0, 0], [NaN]]) assert.throws(() => definition.build(invalid), /入力が範囲外/);
    const checkedStems = new Set<string>();
    outputs.forEach((body, index) => {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(text)).size, 4);
      assert(body.explanation.length > 20);
      const hash = createHash('sha256').update(JSON.stringify([body.prompt, body.choices, body.explanation])).digest('hex');
      assert.equal(hash, record.checks.reviewedContentSha256[index]);
      checkedStems.add(JSON.stringify(body.prompt.map(block => block.type === 'diagram' ? block.scene : block)));
    });
    assert.equal(checkedStems.size, 4, '本文又は図表に四つの入力条件が表示される');
  });
});

for (const [number, records] of Object.entries(knowledge)) {
  test(`2012春午前問${number}の四条件と全候補の意味が独立査読表に一致する`, () => {
    const outputs = cases(Number(number));
    assert.equal(records.length, outputs.length);
    outputs.forEach((body, i) => {
      const [target, roles] = records[i].split('|');
      assert.equal(new Set(roles.split(',')).size, 4);
      unique(body, roles.split(',').map(role => role === target));
      if (Number(number) === 71) assert.match(text(body.prompt), /\n① .*\n② .*\n③ /);
    });
  });
}

test('2012春午前問66の四工程を図の説明から独立に対応づける', () => {
  const stages = [
    [/目的や業務内容などを示し，調達先に情報提供を依頼/, 'RFI'],
    [/調達条件などを示し，提案書の提出を依頼/, 'RFP'],
    [/提案書，能力などに基づいて，調達先を決定/, '供給者の選定'],
    [/役割や責任分担などを，文書で相互に確認/, '契約の締結'],
  ] as const;
  for (const body of cases(66)) {
    const target = text(body.prompt).match(/([a-d])に入る/)?.[1];
    assert(target);
    const { markup } = diagram(body);
    const entries = [...markup.matchAll(/data-procurement-step="([a-d])"[^>]*>[\s\S]+?<\/li>/g)];
    assert.deepEqual(entries.map(entry => entry[1]), ['a', 'b', 'c', 'd']);
    assert.equal((markup.match(/↓/g) ?? []).length, 3);
    const orderedNames = entries.map(([entry], i) => {
      const [requirement, stage] = stages[i];
      assert.match(entry, requirement);
      return stage;
    });
    unique(body, body.choices.map(choice => text(choice) === orderedNames['abcd'.indexOf(target)]));
  }
});

function tableEntries(markup: string) {
  const rows = [...markup.matchAll(/<tr(?:\s[^>]*)?>([\s\S]+?)<\/tr>/g)];
  return rows.map(([, row]) => [...row.matchAll(/<t[dh](?:\s[^>]*)?>([^<]*)<\/t[dh]>/g)].map(([, item]) => item));
}

test('2012春午前問72のa〜dは表示された生産の特徴に対応する', () => {
  for (const body of cases(72)) {
    const target = text(body.prompt).match(/表の([a-d])に/)?.[1];
    assert(target);
    const { markup } = diagram(body);
    const table = tableEntries(markup);
    assert.deepEqual(table, [
      ['生産方式', 'a', 'b', 'c', 'd'],
      ['生産量', '少', '中', '多', '多'],
      ['主な生産形態', '受注生産', '受注・見込生産', '見込生産', '受注・見込生産'],
      ['生産品種', '多', '中', '少', '少'],
      ['段取り頻度', '多', '中', '少', '極少'],
      ['処理（例）', '組立て', '組立て', '組立て', '化学的'],
    ]);
    const column = table[0].indexOf(target);
    const [, volume, order, variety, setup, process] = table.map(row => row[column]);
    const classifications: Readonly<Record<string, boolean>> = {
      個別生産: volume === '少' && order === '受注生産' && variety === '多' && setup === '多',
      プロセス生産: volume === '多' && setup === '極少' && process === '化学的',
      連続生産: volume === '多' && variety === '少' && order === '見込生産' && process === '組立て',
      ロット生産: volume === '中' && variety === '中' && setup === '中',
    };
    unique(body, body.choices.map(choice => classifications[text(choice)]));
  }
});

function matches(line: string, pattern: RegExp) {
  const match = line.match(pattern);
  assert(match, line);
  return match.slice(1);
}

test('2012春午前問75は四式の実行可能領域・目的関数を原料の消費と照合する', () => {
  const inputs = [
    [4, 9, 8, 6, 2, 3, 40, 54],
    [5, 8, 7, 4, 3, 4, 42, 56],
    [3, 7, 9, 5, 2, 5, 45, 56],
    [6, 7, 8, 5, 4, 3, 48, 60],
  ];
  cases(75).forEach((body, i) => {
    const stem = text(body.prompt);
    assert.match(stem, /製品A，Bの生産量をそれぞれxトン，yトン/);
    const [pA, qA, pB, qB, profitA, profitB, pMax, qMax] = [...stem.matchAll(/(\d+)(?=トン|万円)/g)]
      .map(match => Number(match[1])).filter((_, index) => ![0, 5].includes(index));
    assert.deepEqual([pA, qA, pB, qB, profitA, profitB, pMax, qMax], inputs[i]);
    const lattice: [number, number, boolean][] = [];
    for (let x = -1; x <= 22; x++) for (let y = -1; y <= 22; y++) {
      const materials = [pA * x + pB * y, qA * x + qB * y];
      lattice.push([x, y, x >= 0 && y >= 0 && materials[0] <= pMax && materials[1] <= qMax]);
    }
    const options = body.choices.map(choice => text(choice).split('\n'));
    assert.deepEqual(options.map(option => option[1].includes('≧')), [true, false, true, false]);
    const truth = options.map(([heading, rowP, rowQ, range, objective]) => {
      assert.equal(heading, '条件');
      assert.equal(range, 'x≧0，y≧0');
      assert.deepEqual(matches(objective, /^目的関数　(\d+)x\+(\d+)y → 最大化$/).map(Number), [profitA, profitB]);
      const checks = [rowP, rowQ].map(row => {
        const [cx, cy, symbol, bound] = matches(row, /^(\d)x\+(\d)y(≦|≧)(\d{2})$/);
        return (x: number, y: number) => {
          const total = Number(cx) * x + Number(cy) * y;
          return symbol === '≦' ? total <= Number(bound) : total >= Number(bound);
        };
      });
      return lattice.every(([x, y, feasible]) => (x >= 0 && y >= 0 && checks.every(check => check(x, y))) === feasible);
    });
    unique(body, truth);
  });
});

test('2012春午前問76の経常利益を表示明細から独立に集約する', () => {
  const reference = [
    [1585, 951, 160, 80, 120, 5, 15],
    [1725, 1035, 185, 95, 125, 8, 20],
    [1640, 984, 190, 70, 115, 12, 25],
    [1835, 1101, 215, 90, 145, 10, 28],
  ];
  cases(76).forEach((body, i) => {
    const { markup } = diagram(body);
    assert.match(markup, /単位　百万円/);
    const lines = [...markup.matchAll(/data-account="([ⅠⅡⅢⅣⅤⅥⅦ])"[\s\S]*?<td[^>]*>([\d,]+)<\/td>/g)];
    assert.deepEqual(lines.map(([, section]) => section), [...'ⅠⅡⅢⅣⅤⅥⅦ']);
    const values = lines.map(([, , amount]) => Number(amount.replaceAll(',', '')));
    assert.deepEqual(values, reference[i]);
    assert.deepEqual([...markup.matchAll(/data-hidden-subtotal="([^"]+)"/g)].map(match => match[1]), [...'ⅡⅢⅤⅦ']);
    assert.equal((markup.match(/aria-label="数値は明示していない"/g) ?? []).length, 4);
    const revenue = [0, 3, 5].map(n => values[n]);
    const expenses = [1, 2, 4, 6].map(n => values[n]);
    const net = (n: number, m: number) => revenue.slice(0, n).reduce((a, b) => a + b) -
      expenses.slice(0, m).reduce((a, b) => a + b);
    const expected = [net(3, 4), net(2, 3), net(1, 2), net(1, 1)];
    const numbers = body.choices.map(choice => Number(text(choice)));
    assert.deepEqual(numbers, expected);
    assert(numbers.slice(1).every((value, index) => value - numbers[index] >= 10));
    unique(body, numbers.map(value => value === net(2, 3)));
  });
});

function plottedLine(markup: string, kind: 'revenue' | 'cost') {
  const d = markup.match(new RegExp(`data-${kind}-line="" d="([^"]+)"`))?.[1];
  assert(d);
  const [x1, y1, x2, y2] = [...d.matchAll(/[\d.]+/g)].map(match => Number(match[0]));
  return { x1, y1, rise: (y1 - y2) / (x2 - x1) };
}

test('2012春午前問77はグラフの線から四つの記述の真偽を独立に判定する', () => {
  const reference = [[100, 70, 30], [120, 72, 36], [150, 45, 90], [140, 56, 98]];
  cases(77).forEach((body, i) => {
    const { markup } = diagram(body);
    const panels = [...markup.matchAll(/<svg[^>]*data-break-even-company="([AB])社"[^>]*>[\s\S]+?<\/svg>/g)];
    assert.deepEqual(panels.map(([, name]) => name), ['A', 'B']);
    const labelIds = new Set<string>();
    const models = panels.map(([svg, company], column) => {
      const threshold = Number(svg.match(/data-threshold="(\d+)"/)?.[1]);
      const fixed = Number(svg.match(/data-fixed-cost="(\d+)"/)?.[1]);
      assert.equal(threshold, reference[i][0]);
      assert.equal(fixed, reference[i][column + 1]);
      const [titleId] = matches(svg, /aria-labelledby="([^"]+)"/);
      const [descriptionId] = matches(svg, /aria-describedby="([^"]+)"/);
      labelIds.add(titleId);
      labelIds.add(descriptionId);
      assert(svg.includes(`<title id="${titleId}">${company}社の損益分岐点</title>`));
      const [renderedDescriptionId, description] = matches(svg, /<desc id="([^"]+)">([^<]+)<\/desc>/);
      assert.equal(renderedDescriptionId, descriptionId);
      assert.match(description, /横軸は売上高，縦軸は収益・費用/);
      assert(description.includes(`${company}社の収益線は原点を通り，費用線の縦軸切片は固定費${fixed}`));
      assert(description.includes(`売上高${threshold}，収益・費用${threshold}で交わる`));
      assert(svg.includes(`>${fixed}</text>`));
      assert.equal((svg.match(new RegExp(`>${threshold}</text>`, 'g')) ?? []).length, 2);
      const [verticalLabel] = matches(svg, /(<text x="\d+" y="37">収<tspan[^>]*>益[\s\S]+?<\/text>)/);
      const verticalLabelPositions = [...verticalLabel.matchAll(/ x="(\d+)"/g)].map(([, x]) => Number(x));
      assert.equal(verticalLabelPositions.length, 5);
      assert.equal(new Set(verticalLabelPositions).size, 1);
      const [tickLabelX] = matches(svg, new RegExp(`<text x="(\\d+)" y="\\d+" text-anchor="end">${threshold}</text>`));
      const [fontSize] = matches(svg, /<g fill="currentColor" font-size="(\d+)">/);
      // Leave room for one full-width axis glyph and a right-aligned three-digit tick.
      assert(Number(tickLabelX) - verticalLabelPositions[0] > Number(fontSize) * 2.8);
      const revenue = plottedLine(svg, 'revenue');
      const cost = plottedLine(svg, 'cost');
      assert.equal(revenue.x1, cost.x1);
      const yUnitsPerPixel = fixed / (revenue.y1 - cost.y1);
      const xPixelsAtThreshold = threshold / (yUnitsPerPixel * revenue.rise);
      const plottedCostAtThreshold = fixed + yUnitsPerPixel * xPixelsAtThreshold * cost.rise;
      assert(Math.abs(plottedCostAtThreshold - threshold) < 1e-8);
      return { company, threshold, fixed, marginal: 1 - cost.rise / revenue.rise };
    });
    assert.equal(labelIds.size, 4);
    const [a, b] = models;
    const claims = body.choices.map(text);
    const below = claims[0].includes('下回る');
    assert.equal(below, i === 1 || i === 3);
    const sale = a.threshold * (below ? 0.5 : 1.5);
    const profits = Object.fromEntries(models.map(model => [model.company, model.marginal * sale - model.fixed]));
    const [, cheaper, stronger] = [null,
      ...matches(claims[0], /固定費の少ない([AB])社の方が([AB])社よりも/)];
    const [flatter, other] = matches(claims[1], /([AB])社は([AB])社より変動費率が小さい/);
    const chosen = (name: string) => models.find(model => model.company === name)!;
    const targetProfit = 25;
    const requiredSale = (model: typeof a) => (targetProfit + model.fixed) / model.marginal;
    unique(body, [
      chosen(cheaper).fixed < chosen(stronger).fixed && profits[cheaper] > profits[stronger],
      chosen(flatter).marginal > chosen(other).marginal && profits[flatter] > profits[other],
      a.threshold === b.threshold && Math.abs(requiredSale(a) - requiredSale(b)) < 1e-8,
      a.threshold === b.threshold && a.fixed === b.fixed && Math.abs(profits.A - profits.B) < 1e-8,
    ]);
  });
});
