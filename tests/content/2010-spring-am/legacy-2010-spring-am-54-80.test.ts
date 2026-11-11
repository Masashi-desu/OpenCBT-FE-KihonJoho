import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2010SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2010-spring-am-54-80';
import { legacy2010SpringAm5480Figures as figures } from '../../../src/core/generators/legacy-2010-spring-am-54-80-figures';
import { legacy2010SpringAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2010SpringAm5480Figures';
import { reviewedKnowledge } from '../../fixtures/legacy-2010-spring-am-54-80-knowledge-oracle';

const officialAnswers = 'ウウイイイアエウエイイアアアウイエアイエアウウウウウエ';
const held = new Set([62, 80]);
const caseRange = [0, 1, 2, 3];
const numberOf = (id: string) => Number(id.split('-').at(-1));
const digits = (s: string) => Number(s.replaceAll(',', ''));
const flatten = (blocks: Block[]): string => blocks.map(block => {
  if (block.type === 'paragraph') return block.text;
  if (block.type === 'diagram') return block.alt;
  if (block.type === 'table') return [...block.columns, ...block.rows.flat()].join('｜');
  throw new Error('Unexpected block: ' + block.type);
}).join(' ');
const alt = (body: GeneratedBody) => {
  const block = body.prompt.find(block => block.type === 'diagram');
  assert.ok(block?.type === 'diagram');
  return block.alt;
};

function idOracle(body: GeneratedBody) {
  const prompt = flatten(body.prompt);
  assert.match(prompt, /XXNNN.*A〜Z.*0〜9/);
  assert.match(prompt, /欠番として管理し，再利用は行わない/);
  const row = body.prompt.find(block => block.type === 'table');
  assert.ok(row?.type === 'table');
  assert.deepEqual(row.columns, ['年度', '2006', '2007', '2008', '2009']);
  const [a, b, c, d] = row.rows[0].slice(1).map(digits);
  const space = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].flatMap(first => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(second => first + second)).length * 1000;
  const observed = [b-a, c-b, d-c];
  assert.ok(d < space);
  return body.choices.map(blocks => {
    const year = Number(flatten(blocks).slice(0, 4));
    return [Math.min(...observed), Math.max(...observed)].every(growth => {
      let issued = d;
      let current = 2009;
      while (issued < space) {
        issued += growth;
        current++;
      }
      return year === current;
    });
  });
}
function slaOracle(body: GeneratedBody) {
  const prompt = flatten(body.prompt);
  const days = Number(prompt.match(/営業日は(\d+)日/)?.[1]);
  const start = Number(prompt.match(/営業日の午前(\d+)時から/)?.[1]);
  const end = Number(prompt.match(/翌日午前(\d+)時まで/)?.[1]);
  const minimum = Number(prompt.match(/可用性(\d+\.\d)％以上/)?.[1]) * 10;
  let minutesPerDay = 0;
  for (let minute = 0; minute < 1440; minute++)
    if (minute >= start * 60 || minute < end * 60) minutesPerDay++;
  const total = minutesPerDay * days;
  const options = body.choices.map(blocks => Number(flatten(blocks)));
  assert.deepEqual(options, [1, 2, 3, 4]);
  const feasible = (hours: number) => (total - 60 * hours) * 1000 >= minimum * total;
  return options.map(value => feasible(value) && !feasible(value + 1));
}
function evaluationOracle(body: GeneratedBody) {
  const rows = Array.from(alt(body).matchAll(/(省力化|期間短縮|資源削減)：重み(\d)、点数 (\d)、(\d)、(\d)、(\d)/g));
  assert.equal(rows.length, 3);
  assert.equal(rows.reduce((sum, row) => sum + Number(row[2]), 0), 10);
  const votes = [0, 0, 0, 0];
  for (const row of rows)
    for (let i = 0; i < Number(row[2]); i++)
      votes.forEach((score, j) => { votes[j] = score + Number(row[j + 3]); });
  return body.choices.map(blocks => {
    const label = flatten(blocks);
    assert.match(label, /^案[1-4]$/);
    const plan = Number(label.at(-1)) - 1;
    return votes.every((score, other) => plan === other || votes[plan] > score);
  });
}
function procurementOracle(body: GeneratedBody) {
  assert.match(alt(body), /提案評価方法の決定 → a → b → c → d/);
  const target = flatten(body.prompt).match(/([a-d])に入る/)?.[1];
  const dependencies = new Map([['提案依頼書（RFP）の発行', ''], ['提案評価', '提案依頼書（RFP）の発行'],
    ['調達先の選定', '提案評価'], ['調達の実施', '調達先の選定']]);
  return body.choices.map(blocks => {
    let step = flatten(blocks);
    assert.ok(dependencies.has(step));
    let depth = 0;
    while (dependencies.get(step)) { step = dependencies.get(step)!; depth++; }
    return 'abcd'[depth] === target;
  });
}
function portfolioOracle(body: GeneratedBody) {
  const description = alt(body);
  const placement = description.match(/左上 (.+?)、右上 (.+?)、左下 (.+?)、右下 (.+?)。/);
  assert.ok(placement);
  const [topLeft, topRight, bottomLeft, bottomRight] = placement.slice(1);
  assert.equal(new Set(placement.slice(1)).size, 4);
  const topHigh = description.includes('縦軸aは上から高、低');
  const leftHigh = description.includes('横軸bは左から高、低');
  const highPairs = [topHigh ? [topLeft, topRight] : [bottomLeft, bottomRight], leftHigh ? [topLeft, bottomLeft] : [topRight, bottomRight]];
  return body.choices.map(blocks => {
    const choice = blocks[0];
    assert.ok(choice.type === 'table');
    assert.deepEqual(choice.columns, ['a', 'b']);
    return choice.rows[0].every((axis, i) =>
      highPairs[i].includes('花形') && (axis === '市場成長率' && highPairs[i].includes('問題児')
        || axis === '市場占有率' && highPairs[i].includes('金のなる木')));
  });
}
function customersOracle(body: GeneratedBody, index: number) {
  const description = alt(body);
  const entries = Array.from(description.matchAll(/[ABC]：([\d,]+)人、(0\.\d)、(0\.\d)、(0\.\d)、(0\.\d)/g));
  assert.equal(entries.length, 3);
  const counts = entries.map(row => digits(row[1]));
  assert.match(flatten(body.prompt), /毎月[\d,]+人，[\d,]+人，[\d,]+人/);
  if (index > 0) assert.match(flatten(body.prompt), /高々1種類/);
  const old = entries.map((row, i) => row.slice(2).map(rate => counts[i] * Number(rate.at(-1)) / 10));
  const sums = old[0].map((_, col) => old[0][col] + old[1][col] + old[2][col]);
  const oldTotals = description.match(/既存顧客人数：(.+?)。/)?.[1].split('、').map(digits);
  assert.deepEqual(oldTotals, sums);
  const newTotals = description.match(/新規顧客人数：(.+?)。/)?.[1].split('、').map(digits);
  assert.ok(newTotals);
  const [a, b, c, d] = body.choices.map(flatten);
  assert.match(b, /商品Bの購入者は，商品P，Q，R，Sのどれか/);
  assert.match(c, /商品Pの購入見込者の5割は，商品Aの購入者/);
  assert.match(d, /商品Sの新規顧客人数.*商品Cの購入者.*より少ない/);
  return [
    old[0][1] === digits(a.match(/([\d,]+)人が商品Q/)?.[1] ?? ''),
    old[1].reduce((sum, count) => sum + count, 0) === counts[1],
    old[0][0] / (sums[0] + newTotals[0]) === 0.5,
    old[2][3] > newTotals[3],
  ];
}
function regressionOracle(body: GeneratedBody, index: number) {
  const prompt = flatten(body.prompt);
  const coefficient = Number(prompt.match(/相関係数は，(0\.\d)/)?.[1]);
  const slope = Number(prompt.match(/傾きは，(\d\.\d)/)?.[1]);
  const intercept = Number(prompt.match(/切片の値は，(-?\d+)/)?.[1]);
  assert.ok(coefficient > 0 && coefficient <= 1 && slope > 0);
  assert.match(prompt, /昨年度.*x軸.*今年度.*y軸/);
  if (index > 0) assert.match(prompt, /切片を含む最小二乗法/);
  const prediction = (previous: number) => previous * slope + intercept;
  const predictedDifferences = [0, 25, 50, 75, 100].map(previous => prediction(previous) - previous);
  const [a, b, c, d] = body.choices.map(flatten);
  assert.match(a, /0点.*(?:8|10)点/);
  assert.match(b, /平均点/);
  assert.match(c, /得点し(?:やすい|にくい)/);
  assert.match(d, /質/);
  const aClaim = index === 1 ? prediction(0) === 8 : Math.abs(prediction(10)) < 0.000001;
  const bMultiplier = [1.1, 1, 0.9, 1.2][index];
  const bClaim = [15, 35].every(mean => Math.abs(prediction(mean) - bMultiplier * mean) < 0.000001);
  const cClaim = c.includes('得点しにくい') ? Math.max(...predictedDifferences) < 0 : Math.min(...predictedDifferences) > 0;
  return [aClaim, bClaim, cClaim, d.includes('分からない')];
}
function profitOracle(body: GeneratedBody, index: number) {
  const prompt = flatten(body.prompt);
  assert.match(prompt, /損益分岐点の特性/);
  const [a, b, c, d] = body.choices.map(flatten);
  assert.match(a, /変動費率/);
  assert.match(b, /比/);
  assert.match(c, /売上高/);
  assert.match(d, /固定費|変動費率/);
  const point = (fixed: number, rate: number) => {
    const sale = Array.from({ length: 201 }, (_, i) => i).find(i => i * 100 === fixed * 100 + rate * i);
    assert.notEqual(sale, undefined);
    return sale!;
  };
  if (index === 0) {
    return [point(60, 25) > point(60, 40), point(60, 25) * 40 === point(60, 40) * 25,
      point(60, 25) * 100 === 6000 + 25 * point(60, 25), point(40, 50) > point(60, 50)];
  }
  if (index === 1) {
    assert.match(prompt, /60万円.*40％から25％/);
    const before = point(60, 40), after = point(60, 25);
    return [before === 100 && after === 80 && after < before, after * 40 === before * 25,
      after * 100 < 6000 + 25 * after, point(30, 25) > after];
  }
  if (index === 2) {
    assert.match(prompt, /50％.*40万円から60万円/);
    return [point(60, 40) > point(60, 50), point(40, 50) * 60 === point(60, 50) * 40,
      point(60, 50) === 60, point(40, 50) > point(60, 50)];
  }
  assert.match(prompt, /40％.*90万円から60万円/);
  const before = point(90, 40), after = point(60, 40);
  return [point(60, 25) > after, point(60, 25) * 40 === after * 25, after * 100 === after * 40,
    before === 150 && after === 100 && after < before];
}

const modelOracles: Record<number, (body: GeneratedBody, index: number) => boolean[]> = {
  55: idOracle, 56: slaOracle, 63: evaluationOracle, 67: procurementOracle, 68: portfolioOracle,
  70: customersOracle, 76: regressionOracle, 77: profitOracle,
};
const knowledge: Record<number, readonly (readonly string[])[]> = reviewedKnowledge;

test('2010春午前54〜80の公式範囲と二件の素材保留を維持する', () => {
  assert.deepEqual(definitions.map(def => numberOf(def.source)),
    Array.from({ length: 27 }, (_, i) => i + 54).filter(number => !held.has(number)));
  assert.equal(definitions.filter(def => def.answerVariation === 'fixed').map(def => numberOf(def.source)).join(','), '57');
  assert.equal(officialAnswers.length, 27);
});

for (const def of definitions) {
  const number = numberOf(def.source);
  test('2010春午前 問' + number + '：公式正答と4条件全選択肢を独立検算', () => {
    assert.equal(def.sourceAnswer, officialAnswers[number - 54]);
    assert.equal(def.build([0]).correctIndex, 'アイウエ'.indexOf(officialAnswers[number - 54]));
    const promptSignatures = new Set();
    for (const index of caseRange) {
      const body = def.build([index]);
      const prompt = flatten(body.prompt);
      promptSignatures.add(prompt);
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(flatten)).size, 4);
      assert.ok(body.explanation.length > 30);
      const independentlyTrue = modelOracles[number] ? modelOracles[number](body, index) : (() => {
        const [discriminator, ...rules] = knowledge[number][index];
        assert.match(prompt, new RegExp(discriminator));
        return body.choices.map((choice, i) => {
          assert.match(flatten(choice), new RegExp(rules[i].slice(1)));
          return rules[i].startsWith('+');
        });
      })();
      assert.equal(independentlyTrue.filter(Boolean).length, 1, 'ambiguous candidate ' + index);
      assert.equal(body.correctIndex, independentlyTrue.indexOf(true), 'incorrect candidate ' + index);
    }
    assert.equal(promptSignatures.size, 4);
    for (const invalid of [[], [-1], [4], [1.5], [0, 0]]) assert.throws(() => def.build(invalid));
  });
}

test('図表登録は一対一で全16状態に見出し・代替説明がある', () => {
  assert.deepEqual(renderers.map(renderer => renderer.profile), figures.map(figure => figure.profile));
  for (const [i, renderer] of renderers.entries()) {
    const definition = figures[i];
    for (const index of caseRange) {
      const values = [index];
      definition.validate(values);
      const description = definition.alt(values);
      const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: '図のタイトル' }));
      assert.match(html, /(?:diagram|table)-scroll/);
      assert.match(html, /図のタイトル/);
      assert.ok(html.includes(description.replaceAll('>', '&gt;')));
      const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1];
      if (html.includes('<svg')) {
        assert.ok(describedBy && html.includes(`id="${describedBy}"`));
        assert.match(html, /role="img"/);
        const labelledBy = html.match(/aria-labelledby="([^"]+)"/)?.[1];
        assert.ok(labelledBy && html.includes(`<title id="${labelledBy}"`));
        assert.ok(html.includes(`<desc id="${describedBy}"`));
      } else {
        assert.match(html, /role="group"/);
        assert.ok(html.includes(`aria-description="${description}"`));
        assert.match(html, /<thead>/);
        assert.match(html, /scope="row"/);
      }
    }
  }
});
