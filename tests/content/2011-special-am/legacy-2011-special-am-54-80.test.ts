import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2011SpecialAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2011-special-am-54-80';
import { legacy2011SpecialAm5480Figures as figures } from '../../../src/core/generators/legacy-2011-special-am-54-80-figures';
import { legacy2011SpecialAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2011SpecialAm5480Figures';
import { knowledgeOracle } from '../../fixtures/legacy-2011-special-am-54-80-knowledge-oracle';
import review from '../../fixtures/legacy-2011-special-am-54-80-review.json';

const numeric = (value: string) => Number(value.replaceAll(',', ''));
const officialKeys = 'エウエウアアイウアイアアイエウエイウウイイウエアイアエ';
const allChoices = 'アイウエ';
const escapeHTML = (value: string) => value.replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[character]!);

function paragraphs(blocks: readonly Block[]) {
  return blocks.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
}
function figureAlt(blocks: readonly Block[]) {
  const block = blocks.find(block => block.type === 'diagram');
  assert.ok(block && block.type === 'diagram');
  return block.alt;
}
function readTable(body: GeneratedBody) {
  const [header, ...rows] = figureAlt(body.prompt).split('\n').map(line => line.split('｜'));
  return { header, rows };
}
function numberRows(body: GeneratedBody) {
  return readTable(body).rows.map(([label, ...row]) => [label, row.map(numeric)] as const);
}
function resolved(choices: readonly boolean[], correctIndex: number | undefined) {
  assert.equal(choices.length, 4);
  assert.equal(choices.filter(Boolean).length, 1, JSON.stringify(choices));
  assert.equal(choices.indexOf(true), correctIndex);
}
function readTariff(alt: string) {
  assert.match(alt, /縦軸は利用料金，横軸は使用量/);
  const points = Array.from(alt.matchAll(/（(\d+)，(\d+)）/g), match => [Number(match[1]), Number(match[2])]);
  assert.ok(points.length >= 2);
  const rises = points.slice(1).map((point, i) => point[1] - points[i][1]);
  const runs = points.slice(1).map((point, i) => point[0] - points[i][0]);
  assert.ok(runs.every(run => run > 0));
  const crosses = rises.slice(1).map((rise, i) => rise * runs[i] - rises[i] * runs[i + 1]);
  if (rises.every(rise => rise < 0)) return 'falling total';
  assert.equal(points[0][1], 0);
  if (rises.at(-1) === 0) return 'ceiling';
  if (crosses.every(cross => cross === 0)) return 'proportional';
  assert.ok(rises.every(rise => rise > 0));
  if (crosses.every(cross => cross < 0)) return 'decreasing increment';
  assert.ok(crosses.every(cross => cross > 0));
  return 'increasing increment';
}
function organizationType(alt: string) {
  const adjacency = alt.split('。').filter(Boolean).map(line => {
    const parts = /^(.+?)から(.+?)へ指揮線$/.exec(line);
    assert.ok(parts);
    return [parts[1], parts[2].split('，')] as const;
  });
  const commands = new Map(adjacency);
  const leaderChildren = commands.get('経営者');
  assert.ok(leaderChildren);
  if (leaderChildren.every(child => !commands.has(child))) {
    assert.deepEqual(leaderChildren, ['生産', '販売', '研究開発', '経理', '人事']);
    return '職能別組織';
  }
  const directs = leaderChildren.map(name => commands.get(name)!);
  assert.ok(directs.every(children => children.length));
  if (leaderChildren.some(name => name.endsWith('部門長')) && leaderChildren.some(name => name.endsWith('責任者'))) {
    assert.deepEqual(directs[0], directs[1]);
    return 'マトリックス組織';
  }
  if (leaderChildren.every(name => name.endsWith('事業'))) {
    assert.deepEqual(directs[0], directs[1]);
    assert.deepEqual(directs[0], ['生産', '販売', '経理']);
    return '事業部制組織';
  }
  assert.ok(leaderChildren.every(name => name.endsWith('責任者')));
  assert.ok(directs.every(group => group.every(name => name.endsWith('担当'))));
  return 'プロジェクト組織';
}

function verifyModeled(number: number, input: number, body: GeneratedBody) {
  const prompt = paragraphs(body.prompt);
  const choices = body.choices.map(paragraphs);
  switch (number) {
    case 57: {
      const subjects = [
        ['逓減課金方式', 'decreasing increment'],
        ['逓増課金方式', 'increasing increment'],
        ['上限額を設定した従量課金方式', 'ceiling'],
        ['一定の単価による従量課金方式', 'proportional'],
      ];
      const subject = subjects.find(([term]) => prompt.includes(term));
      assert.ok(subject);
      const classifications = body.choices.map(choice => readTariff(figureAlt(choice)));
      if (input === 0) assert.deepEqual(classifications, ['falling total', 'ceiling', 'decreasing increment', 'increasing increment']);
      assert.equal(new Set(classifications).size, 4);
      resolved(classifications.map(kind => kind === subject[1]), body.correctIndex);
      return;
    }
    case 65: {
      const alt = figureAlt(body.prompt);
      const target = /，([a-d])に該当/.exec(prompt)![1];
      assert.match(alt, /下が低，上が高.*左が小，右が大/);
      const cells = [...alt.matchAll(/([a-d])：成長率([高低])，占有率([大小])/g)];
      assert.deepEqual(cells.map(match => match[1]), ['a', 'b', 'c', 'd']);
      assert.deepEqual(cells.map(match => match.slice(2).join('')), ['高小', '高大', '低小', '低大']);
      const match = cells.find(cell => cell[1] === target)!;
      const meanings = [
        [/大きな資金の流入.*資金の投下も必要/, '高大'],
        [/資金の主たる供給源.*投下すべきではない/, '低大'],
        [/資金の流入が小さい.*将来の資金供給源/, '高小'],
        [/資金投下の必要性は低く.*撤退/, '低小'],
      ] as const;
      choices.forEach((choice, i) => assert.match(choice, meanings[i][0]));
      resolved(meanings.map(([, kind]) => kind === match.slice(2).join('')), body.correctIndex);
      return;
    }
    case 67: {
      const terms = [...figureAlt(body.prompt).matchAll(/設定価格を([\d,]+)円にすると，需要は([\d,]+|［a］)個/g)];
      assert.equal(terms.length, 3);
      const [[, x0, y0], [, x1, y1], [, target, blank]] = terms;
      assert.equal(blank, '［a］');
      const slope = (numeric(y1) - numeric(y0)) / (numeric(x1) - numeric(x0));
      const intercept = numeric(y0) - slope * numeric(x0);
      const answer = slope * numeric(target) + intercept;
      const actual = choices.map(numeric);
      assert.ok(actual.every((option, i) => !i || option - actual[i - 1] === 5000));
      if (input === 0) {
        assert.deepEqual([numeric(x0), numeric(y0), numeric(x1), numeric(y1), numeric(target)], [3000, 0, 1000, 60000, 1500]);
        assert.deepEqual(actual, [30000, 35000, 40000, 45000]);
      }
      resolved(actual.map(value => value === answer), body.correctIndex);
      return;
    }
    case 71: {
      const units = numeric(/1か月で([\d,]+)個/.exec(prompt)![1]);
      const rows = numberRows(body);
      assert.deepEqual(choices, ['A', 'B', 'C', 'D']);
      assert.deepEqual(rows.map(([label]) => label), choices);
      if (input === 0) {
        assert.equal(units, 1000);
        assert.deepEqual(rows.map(([, values]) => values), [[0.4, 3, 150], [0.3, 2, 160], [0.7, 4, 170], [1.2, 7, 180]]);
      }
      const lacksCapacity = rows.map(([, [hoursPerUnit, count, hoursPerMachine]]) =>
        Math.floor(hoursPerMachine / hoursPerUnit) * count < units);
      resolved(lacksCapacity, body.correctIndex);
      return;
    }
    case 73: {
      const kind = organizationType(figureAlt(body.prompt));
      assert.deepEqual(choices, ['事業部制組織', '職能別組織', 'プロジェクト組織', 'マトリックス組織']);
      resolved(choices.map(choice => choice === kind), body.correctIndex);
      return;
    }
    case 75: {
      const rates = /良品である確率が(0\.\d)，不良品である確率が(0\.\d)/.exec(prompt)!;
      const defective = Math.round(Number(rates[2]) * 10);
      assert.equal(Math.round(Number(rates[1]) * 10) + defective, 10);
      const rows = numberRows(body);
      assert.deepEqual(choices, ['A', 'B', 'C', 'D']);
      assert.deepEqual(rows.map(([label]) => label), choices);
      if (input === 0) {
        assert.equal(defective, 1);
        assert.deepEqual(rows.map(([, values]) => values), [[0, 1500], [40, 1000], [80, 500], [120, 200]]);
      }
      // Simulate a batch of ten parts with the stated proportions.
      const batchCosts = rows.map(([, [good, bad]]) => {
        let total = 0;
        for (let part = 0; part < 10; part++) total += part < defective ? bad : good;
        return total;
      });
      const minimum = [...batchCosts].sort((a, b) => a - b)[0];
      resolved(batchCosts.map(total => total === minimum), body.correctIndex);
      assert.ok(body.explanation.includes(String(minimum / 10)));
      return;
    }
    case 76: {
      const { header, rows } = readTable(body);
      assert.deepEqual(header, ['日付', '摘要', '受払個数・受入', '受払個数・払出', '単価（円）']);
      assert.deepEqual(rows.map(row => row[0]), ['1', '4', '5', '7', '10', '30']);
      assert.deepEqual(rows.map(row => row[1]), ['前月繰越', '仕入', '売上', '仕入', '仕入', '売上']);
      let fifo: number[] = [], lifo: number[] = [];
      const allReceipts: number[] = [];
      for (const [, , received, issued, price] of rows) {
        if (received) {
          assert.equal(issued, '');
          const costs = Array<number>(numeric(received)).fill(numeric(price));
          fifo.push(...costs);
          lifo.push(...costs);
          allReceipts.push(...costs);
        } else {
          assert.equal(price, '／');
          assert.ok(numeric(issued) <= fifo.length);
          fifo = fifo.slice(numeric(issued));
          lifo = lifo.slice(0, -numeric(issued));
        }
      }
      const sum = (items: number[]) => items.reduce((total, value) => total + value, 0);
      const expected = sum(fifo);
      const actual = choices.map(numeric);
      assert.ok(actual.every((value, i) => Number.isInteger(value) && (!i || value - actual[i - 1] >= 40)));
      if (input === 0) {
        assert.deepEqual(fifo, [...Array<number>(20).fill(130), ...Array<number>(10).fill(110)]);
        assert.deepEqual(actual, [3300, 3600, 3660, 3700]);
      } else {
        const endingCount = fifo.length;
        assert.deepEqual(actual, [expected, sum(lifo), sum(allReceipts) / allReceipts.length * endingCount,
          allReceipts.at(-1)! * endingCount].sort((a, b) => a - b));
      }
      resolved(actual.map(choice => choice === expected), body.correctIndex);
      return;
    }
    default: assert.fail(`独立検算の未登録: 問${number}`);
  }
}

for (const [position, definition] of definitions.entries()) {
  const number = 54 + position;
  for (let input = 0; input < 4; input++) {
    test(`2011年度特別午前 問${number} 入力${input}の四択と正答を独立に検証`, () => {
      assert.equal(definition.source, `2011h23tokubetsu-fe-am-${number}`);
      assert.deepEqual(definition.reference, [0]);
      assert.equal(definition.sourceAnswer, officialKeys[position]);
      const body = definition.build([input]);
      assert.equal(body.choices.length, 4);
      assert.ok(body.explanation.length > 15);
      const record = review.records[position];
      assert.equal(record.number, number);
      assert.equal(record.cases[input].answer, allChoices[body.correctIndex!]);
      assert.equal(createHash('sha256').update(JSON.stringify(body)).digest('hex'), record.cases[input].digest);
      resolved(record.cases[input].choiceTruth, body.correctIndex);
      assert.equal(new Set(body.choices.map(blocks => JSON.stringify(blocks))).size, 4);
      if (input === 0) assert.equal(allChoices[body.correctIndex!], officialKeys[position]);
      const knowledge = knowledgeOracle[number]?.[input];
      if (knowledge) {
        assert.ok(paragraphs(body.prompt).includes(knowledge.promptFragment));
        const choices = body.choices.map(paragraphs);
        knowledge.choices.forEach(([fragment], i) => assert.ok(choices[i].includes(fragment), choices[i]));
        resolved(knowledge.choices.map(([, claim]) => claim === knowledge.acceptedClaim), body.correctIndex);
      } else verifyModeled(number, input, body);
      if (input) assert.notDeepEqual(body.prompt, definition.build([0]).prompt);
    });
  }
}

test('全27系列の境界値と未定義入力を検査する', () => {
  assert.equal(definitions.length, 27);
  assert.equal(officialKeys.length, definitions.length);
  for (const definition of definitions) {
    if (definition.source.endsWith('-58')) {
      assert.equal(definition.answerVariation, 'fixed');
      const answers = [0, 1, 2, 3].map(i => definition.build([i])).map(body => paragraphs(body.choices[body.correctIndex!]));
      assert.deepEqual(answers, Array(4).fill('企画，開発，運用，保守'));
    }
    assert.equal(definition.fields.length, 1);
    assert.deepEqual([definition.fields[0].minimum, definition.fields[0].maximum], [0, 3]);
    for (const input of [[], [4], [-1], [1.5], [NaN], [0, 1]])
      assert.throws(() => definition.build(input), /入力が範囲外/);
  }
});

function assertNamedSvg(html: string, caption: string, description: string) {
  const svg = /<svg\b([^>]*)>/.exec(html);
  assert.ok(svg);
  assert.match(svg[1], /role="img"/);
  const name = /aria-labelledby="([^"]+)"/.exec(svg[1]);
  const detail = /aria-describedby="([^"]+)"/.exec(svg[1]);
  assert.ok(name && detail);
  assert.notEqual(name[1], detail[1]);
  assert.ok(html.includes(`<title id="${name[1]}">${escapeHTML(caption)}</title>`));
  assert.ok(html.includes(`<desc id="${detail[1]}">${escapeHTML(description)}</desc>`));
}

test('10プロファイルの4入力が名前と説明を持つネイティブ図表として表示される', () => {
  assert.equal(figures.length, 10);
  assert.deepEqual(renderers.map(renderer => renderer.profile), figures.map(figure => figure.profile));
  for (const figure of figures) {
    const renderer = renderers.find(item => item.profile === figure.profile)!;
    assert.throws(() => figure.alt([4]), /入力が範囲外/);
    for (let i = 0; i < 4; i++) {
      const html = renderToStaticMarkup(createElement(renderer.component, { values: [i], caption: '図表照合' }));
      assert.ok(html.includes(`data-figure-profile="${figure.profile}"`));
      assert.ok(html.includes('図表照合'));
      if (figure.profile.includes('-tariff-')) {
        assertNamedSvg(html, '図表照合', figure.alt([i]));
        assert.match(html, /<polyline points=/);
        assert.match(html, /利用料金/);
        assert.match(html, /使用量/);
        assert.ok(!html.includes('tabindex'));
      } else if (figure.profile.endsWith('-growth-share')) {
        assertNamedSvg(html, '図表照合', figure.alt([i]));
        for (const label of ['市場成長率', '市場占有率', 'a', 'b', 'c', 'd'])
          assert.ok(html.includes(`>${label}</text>`));
      } else if (figure.profile.endsWith('-demand-conditions')) {
        assert.match(html, /role="group" aria-label="図表照合"/);
        assert.ok(html.includes(`aria-description="${escapeHTML(figure.alt([i]))}"`));
        assert.match(html, /<ol role="list"/);
        assert.equal((html.match(/<li>/g) ?? []).length, 3);
        assert.match(html, /（1）設定価格/);
        assert.match(html, /（3）設定価格.*<span style="[^"]*border:[^"]+">a<\/span>個になる/);
      } else if (figure.profile.endsWith('-organization')) {
        assertNamedSvg(html, '図表照合', figure.alt([i]));
        assert.match(html, /<rect /);
        assert.ok(html.includes('>経営者</text>'));
        if (i === 3) assert.match(html, /開発部門長.*刷新責任者/);
      } else {
        assert.match(html, /<table /);
        assert.match(html, /scope="col"/);
        if (figure.profile.endsWith('-inventory-movements')) {
          assert.match(html, /scope="colgroup" colSpan="2"[^>]*>受払個数/);
          assert.equal((html.match(/aria-label="対象外"/g) ?? []).length, 2);
        }
      }
    }
  }
  const samePlot = renderers[0].component;
  const combined = renderToStaticMarkup(createElement('div', null,
    createElement(samePlot, { values: [0], caption: '料金図1' }),
    createElement(samePlot, { values: [0], caption: '料金図2' })));
  const ids = [...combined.matchAll(/<(?:title|desc) id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 4);
  assert.equal(new Set(ids).size, 4);
});
