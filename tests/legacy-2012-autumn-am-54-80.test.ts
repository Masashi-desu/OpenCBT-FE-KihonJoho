import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../src/core/generators/definition';
import type { Block } from '../src/core/types';
import { legacy2012AutumnAm54To80Definitions as definitions } from '../src/core/generators/legacy-2012-autumn-am-54-80';
import { legacy2012AutumnAm5480Figures as figures } from '../src/core/generators/legacy-2012-autumn-am-54-80-figures';
import { autumn2012Am5480Source as source } from '../src/core/generators/legacy-2012-autumn-am-54-80-source';
import { legacy2012AutumnAm5480FigureRenderers as renderers } from '../src/ui/Legacy2012AutumnAm5480Figures';
import { autumn2012Am5480Oracle as knowledge } from './fixtures/legacy-2012-autumn-am-54-80-knowledge-oracle';
import review from './fixtures/legacy-2012-autumn-am-54-80-review.json';

function definition(number: number) {
  const result = definitions.find(item => item.source === `2012h24a-fe-am-${number}`);
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

function choices(body: GeneratedBody) {
  return body.choices.map(([block]) => {
    assert(block.type === 'paragraph');
    return block.text;
  });
}

function unique(body: GeneratedBody, truth: boolean[]) {
  assert.equal(truth.filter(Boolean).length, 1);
  assert.deepEqual(truth, body.choices.map((_, i) => i === body.correctIndex));
}

function figure(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(item => item.profile === profile);
  const renderer = renderers.find(item => item.profile === profile);
  assert(definition && renderer);
  definition.validate(values);
  assert.equal(definition.alt(values), block.alt);
  assert.throws(() => definition.validate([...values, 0]), /図表の入力が範囲外/);
  assert.throws(() => definition.alt([-1, ...values.slice(1)]), /図表の入力が範囲外/);
  const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
  assert(markup.includes(`data-figure-profile="${profile}"`));
  assert.match(markup, /class="diagram-scroll" tabindex="0"/);
  if (markup.includes('<table ')) {
    assert(markup.includes(`role="group" aria-label="${block.caption}"`));
    assert(markup.includes(`aria-description="${block.alt}"`));
  }
  return { alt: block.alt, markup };
}

function tableRows(markup: string) {
  return [...markup.matchAll(/<tbody>([\s\S]+?)<\/tbody>/g)].map(([, body]) =>
    [...body.matchAll(/<tr>([\s\S]+?)<\/tr>/g)].map(([, row]) =>
      [...row.matchAll(/<t[dh][^>]*>([^<]*)<\/t[dh]>/g)].map(([, cell]) => cell)));
}

function number(text: string) {
  assert.match(text, /^\d[\d,]*$/);
  return Number(text.replaceAll(',', ''));
}

test('2012秋午前54〜80の掲載24問が原紙面・公式解答・全可変入力に対応する', () => {
  const held = [56, 61, 66];
  assert.deepEqual(review.rightsHolds.map(row => row.number), held);
  const numbers = Array.from({ length: 27 }, (_, i) => i + 54).filter(n => !held.includes(n));
  assert.deepEqual(review.records.map(row => row.number), numbers);
  assert.deepEqual(definitions.map(item => Number(item.source.split('-').at(-1))), numbers);
  for (const row of review.records) {
    const item = definition(row.number);
    const original = source[String(row.number) as keyof typeof source];
    const bodies = cases(row.number);
    const baseline = bodies[0];
    assert.equal(original.page, row.page);
    const hash = createHash('sha256').update(JSON.stringify([original.prompt, original.choices])).digest('hex');
    assert.equal(hash, row.statementHash, `原問${row.number}`);
    assert.deepEqual(item.reference, [0]);
    assert.equal(item.fields[0].minimum, 0);
    assert.equal(item.sourceAnswer, row.officialAnswer);
    assert.equal('アイウエ'[baseline.correctIndex!], row.officialAnswer);
    assert.equal(row.choiceShuffleAllowed, ![64, 76, 77].includes(row.number));
    assert(item.notes.includes(`原冊子p.${row.page}`));
    assert.equal(bodies.length, row.inputs);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, row.inputs, `本文 問${row.number}`);
    assert(bodies.every(body => body.explanation.length > 30 && body.choices.length === 4 &&
      new Set(body.choices.map(choice => JSON.stringify(choice))).size === 4));
    assert(new Set(bodies.map(body => JSON.stringify(body.choices[body.correctIndex!]))).size >= 2, `可変正答 問${row.number}`);
    if (row.number === 64) {
      assert.equal(stem(baseline), original.prompt.replace('内部収益率（IRR）は0とする。', '各年の利益は割引しない。'));
      assert.match(baseline.explanation, /IRR.*正味現在価値.*を0にする率/);
    } else {
      assert.equal(stem(baseline), original.prompt);
    }
    if (row.number !== 77) assert.deepEqual(choices(baseline), original.choices);
    for (const invalid of [[], [0, 0], [-1], [row.inputs], [0.5], [NaN]]) {
      assert.throws(() => item.build(invalid), /入力が範囲外/);
    }
  }
  assert.equal(review.records.reduce((sum, row) => sum + row.inputs, 0), 83);
});

for (const [question, oracle] of Object.entries(knowledge)) {
  test(`2012秋午前 問${question}の全条件・全選択肢を独立した判断資料と照合する`, () => {
    const bodies = cases(Number(question));
    assert.equal(bodies.length, oracle.prompts.length);
    for (const body of bodies) {
      const matchedPrompts = oracle.prompts.filter(([pattern]) => pattern.test(stem(body)));
      assert.equal(matchedPrompts.length, 1, stem(body));
      const [, expectedRole, rationale] = matchedPrompts[0];
      unique(body, choices(body).map(choice => {
        const matched = oracle.choices.filter(([, pattern]) => pattern.test(choice));
        assert.equal(matched.length, 1, choice);
        return matched[0][0] === expectedRole;
      }));
      assert.match(body.explanation, rationale);
    }
  });
}

test('2012秋午前54のジャーナル処理量を故障位相の全列挙から独立検算する', () => {
  const ratios: Record<string, readonly [number, number]> = { '2倍': [1, 2], '3倍': [1, 3], '半分': [2, 1], '3分の1': [3, 1] };
  // Enumerate a uniformly placed failure in each interval using symmetric midpoints.
  const meanPending = (units: number) => Array.from({ length: units * 20 }, (_, phase) => 2 * phase + 1)
    .reduce((sum, pending) => sum + pending, 0) / (units * 20);
  for (const body of cases(54)) {
    assert.match(stem(body), /少ないながらも一定の頻度.*フルバックアップを磁気テープに取得/);
    const [, ratio] = /今までの(2倍|3倍|半分|3分の1)/.exec(stem(body)) ?? [];
    assert(ratio);
    const [before, after] = ratios[ratio];
    const optionPattern = /^(.+?)が(?:平均して)?約(2倍|3倍|半分|3分の1)になる。$/;
    unique(body, choices(body).map(choice => {
      const [, role, multiplier] = optionPattern.exec(choice) ?? [];
      assert(role && multiplier);
      const [denominator, numerator] = ratios[multiplier];
      if (role.includes('ジャーナル情報')) return numerator * meanPending(before) === denominator * meanPending(after);
      assert.match(role, /フルバックアップ(1回当たりの磁気テープ使用量|取得の平均実行時間)/);
      return numerator === denominator;
    }));
    assert(body.explanation.includes(`その処理時間は平均で約${ratio}`));
  }
});

test('2012秋午前64のROIを四つの表示表から分数の交差積で独立検算する', () => {
  const sourceProfits = [[15,30,45,30,15], [105,75,45,15,0], [60,75,90,75,60], [105,105,105,105,105]];
  for (const [index, body] of cases(64).entries()) {
    assert.deepEqual(choices(body), ['a', 'b', 'c', 'd']);
    const { alt, markup } = figure(body.prompt[1]);
    const records = [...alt.matchAll(/案件([a-d])の年0投資額は(\d+)，年1〜5の利益は([\d，]+)。/g)];
    const rows = tableRows(markup);
    assert.equal(records.length, 4);
    assert.equal(rows.length, 4);
    const fractions = records.map(([, name, investment, profitText], position) => {
      const profits = profitText.split('，').map(number);
      const denom = number(investment);
      assert.equal(name, 'abcd'[position]);
      assert.equal(denom, 100 * (position + 1));
      assert.equal(profits.length, 5);
      if (index === 0) assert.deepEqual(profits, sourceProfits[position]);
      assert(markup.includes(`aria-label="案件${name}" data-investment-case="${name}"`));
      assert.deepEqual(rows[position], [['利益', '', ...profits.map(String)], ['投資額', investment, '', '', '', '', '']]);
      const sum = profits.reduce((a, b) => a + b, 0);
      assert(body.explanation.includes(`${name}：${sum}÷${denom}`));
      return [sum, denom];
    });
    unique(body, fractions.map(([sum, denominator], position) => fractions.every(([otherSum, otherDenominator], other) =>
      other === position || 100 * (sum * otherDenominator - otherSum * denominator) >=
        (index === 0 ? 3.75 : 10) * denominator * otherDenominator)));
    assert.equal(body.correctIndex, index);
  }
});

test('2012秋午前76の確率表と利益を需要累積・追加1個の限界利益で独立検算する', () => {
  for (const [index, body] of cases(76).entries()) {
    assert.deepEqual(choices(body), ['4', '5', '6', '7']);
    const { alt, markup } = figure(body.prompt[1]);
    assert(markup.includes('aria-label="仕入個数別の販売確率" data-sales-probabilities="true"'));
    const records = [...alt.matchAll(/仕入(\d)個の行：([^。]+)。/g)];
    const rows = tableRows(markup)[0];
    assert.equal(records.length, 4);
    assert.equal(rows.length, 4);
    const probabilities = records.map(([, stock, cells], i) => {
      const labels = cells.split('，');
      assert.deepEqual(rows[i], [...(i === 0 ? ['仕入個数'] : []), stock, ...labels]);
      assert.equal(Number(stock), i + 4);
      return labels.map(cell => cell === '―' ? null : number(cell.replace('％', '')));
    });
    if (index === 0) assert.deepEqual(probabilities, [[100,null,null,null], [30,70,null,null], [30,30,40,null], [30,30,30,10]]);
    const demand = probabilities[3];
    assert.equal(demand.reduce<number>((sum, value) => sum + (value ?? 0), 0), 100);
    for (const [cap, sales] of probabilities.entries()) {
      const censored = [0, 0, 0, 0];
      demand.forEach((probability, i) => { censored[Math.min(i, cap)] += probability ?? 0; });
      assert.deepEqual(sales, censored.map((value, i) => i <= cap ? value : null));
    }
    const [, profitText, wasteText] = /利益を([\d,]+)円.*1個当たり(\d+)円の廃棄/.exec(stem(body)) ?? [];
    assert(profitText && wasteText);
    const profit = number(profitText), waste = number(wasteText);
    const expected = [4 * profit];
    let below = demand[0]!;
    for (const chance of demand.slice(1)) {
      expected.push(expected.at(-1)! + ((profit + waste) * (100 - below) - 100 * waste) / 100);
      below += chance!;
    }
    expected.forEach((value, i) => assert(body.explanation.includes(`${i + 4}個：${value.toLocaleString('ja-JP')}円`)));
    unique(body, expected.map(value => value === Math.max(...expected)));
    assert.equal(body.correctIndex, [2, 0, 1, 3][index]);
  }
});

function ordinalDirection(points: number[][]) {
  let agree = 0, disagree = 0;
  for (let a = 0; a < points.length; a++) {
    for (let b = 0; b < a; b++) {
      const [x1, y1] = points[a], [x2, y2] = points[b];
      const pair = (x1 - x2) * (y1 - y2);
      if (pair > 0) agree++;
      if (pair < 0) disagree++;
    }
  }
  return (agree - disagree) / (agree + disagree);
}

test('2012秋午前77の散布図を点対の順位とSVG・代替説明から独立検算する', () => {
  const conditions = [null,
    ['来客数の前年差（十人）', '売上高の前年差（万円）'],
    ['気温の平年差（0.1℃）', '暖房電力使用量の平年差（kWh）'],
    ['注文数の前月差（件）', '梱包数の前月差（箱）']];
  for (const [index, body] of cases(77).entries()) {
    const [, polarity] = /“(正|負)の相関”/.exec(stem(body)) ?? [];
    assert(polarity);
    const axes = conditions[index];
    if (axes) assert(stem(body).includes(`横軸を${axes[0]}，縦軸を${axes[1]}とした`));
    const trends = body.choices.map(([block], panel) => {
      const { alt, markup } = figure(block);
      assert.match(alt, /主目盛は−20，−10，0，10，20/);
      assert(!alt.includes('相関'));
      assert(markup.includes(`data-scatter-option="${panel}"`));
      assert.match(markup, /role="img" aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
      assert.match(markup, /<title[^>]*>散布図<\/title>/);
      assert(markup.includes(`>${alt}</desc>`));
      if (axes) {
        assert(alt.startsWith(`横軸は${axes[0]}，縦軸は${axes[1]}。`));
        assert(markup.includes(`data-scatter-axis="x">${axes[0]}</text>`));
        assert(markup.includes(`data-scatter-axis="y">${axes[1]}</text>`));
      } else assert(!markup.includes('data-scatter-axis'));
      const points = [...alt.matchAll(/\((-?\d+),(-?\d+)\)/g)].map(([, x, y]) => [Number(x), Number(y)]);
      const circlePoints = [...markup.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="3\.2" data-point="(-?\d+),(-?\d+)"/g)];
      assert.equal(points.length, 26);
      assert.deepEqual(circlePoints.map(([, cx, cy, x, y]) => {
        assert(Math.abs(Number(cx) - 177 - 5.15 * Number(x)) < 1e-9);
        assert(Math.abs(141 - Number(cy) - 5.15 * Number(y)) < 1e-9);
        return [Number(x), Number(y)];
      }), points);
      if (index === 0) assert.deepEqual(points, review.scatterReference[panel]);
      return ordinalDirection(points) * (polarity === '正' ? 1 : -1);
    });
    // A coefficient over 0.6 means over 80% of comparable pairs
    // move together in the requested direction.
    unique(body, trends.map(trend => trend > 0.6));
    assert(trends.filter(trend => trend <= 0.6).every(trend => trend < 0.15));
    assert.equal(body.correctIndex, [1, 3, 3, 1][index]);
    assert(body.explanation.includes(`「${'アイウエ'[body.correctIndex!]}」の点群`));
  }
});
