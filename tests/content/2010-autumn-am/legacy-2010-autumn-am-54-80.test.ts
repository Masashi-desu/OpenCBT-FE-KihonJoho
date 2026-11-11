import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2010AutumnAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2010-autumn-am-54-80';
import { legacy2010AutumnAm5480Figures as figures } from '../../../src/core/generators/legacy-2010-autumn-am-54-80-figures';
import { legacy2010AutumnAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2010AutumnAm5480Figures';
import { knowledgeOracle } from '../../fixtures/legacy-2010-autumn-am-54-80-knowledge-oracle';

const letters = 'アイウエ';
const official = 'エエエイイエアエエウイウイイアイアエエエイアウイアイウ';
const referencePages = [24,24,25,25,26,26,26,27,27,27,28,28,28,28,29,29,30,30,31,31,31,32,32,33,33,34,34];
const paragraph = (blocks: readonly Block[]) => blocks.map(block => {
  assert.equal(block.type, 'paragraph');
  return block.text;
}).join('\n');

function description(blocks: readonly Block[]) {
  const figure = blocks.find(block => block.type === 'diagram');
  assert.ok(figure?.type === 'diagram');
  return figure.alt;
}

function uniqueAnswer(matches: readonly boolean[], answer: number | undefined) {
  assert.equal(matches.length, 4);
  assert.deepEqual(matches.flatMap((match, i) => match ? [i] : []), [answer]);
}

function journalAnswer(body: GeneratedBody) {
  const prompt = paragraph(body.prompt);
  const replay = prompt.includes('ロールフォワード');
  const toSavepoint = /保存点の後の未確定/.test(prompt);
  // One record was written twice around a savepoint. Independently read snapshots
  // before any write, at the savepoint, and after the second write.
  const history = ['initial', 'first-write', 'second-write'];
  const startingSnapshot = replay ? history[0] : history[2];
  const expected = history[replay ? 2 : toSavepoint ? 1 : 0];
  const signatures = body.choices.map(paragraph).map(choice => {
    const after = choice.includes('更新後ジャーナル');
    assert.match(choice, /更新[前後]ジャーナル/);
    const target = choice.includes('障害直前') ? 2 : choice.includes('保存点の状態') ? 1 : 0;
    assert.match(choice, /障害直前|保存点の状態|開始直前/);
    let actual = startingSnapshot;
    if (after && target > 0) {
      for (const version of history.slice(1, target + 1)) actual = version;
    }
    if (!after && target < 2) {
      for (const version of history.slice(target, 2).reverse()) actual = version;
    }
    const applicable = after === replay && target === (replay ? 2 : toSavepoint ? 1 : 0);
    return { applicable: applicable && actual === expected, key: [after, target].join(':') };
  });
  assert.equal(new Set(signatures.map(signature => signature.key)).size, 4);
  uniqueAnswer(signatures.map(signature => signature.applicable), body.correctIndex);
}

function abcAnswer(body: GeneratedBody, index: number) {
  assert.match(paragraph(body.prompt), /ABC分析.*縦軸は(?:累積)?売上高，横軸は商品アイテム/);
  const curves = body.choices.map(option => {
    const alt = description(option);
    assert.match(alt, /縦軸は売上高，横軸は商品アイテム/);
    const heights = alt.split('：')[1].slice(0, -1).split('，').map(Number);
    assert.equal(heights.length, 9);
    const contributions = heights.slice(1).map((height, i) => height - heights[i]);
    const ranked = [...contributions].sort((a, b) => b - a);
    let rolling = 0;
    const expected = ranked.map(sale => (rolling += sale));
    const signs = contributions.map(Math.sign);
    return { heights, passes: heights[0] === 0 && ranked.at(-1)! > 0 && expected.every((height, i) => heights[i + 1] === height), signs };
  });
  assert.equal(new Set(curves.map(({ signs }) => signs.join(','))).size, 4);
  if (!index) assert.deepEqual(curves.map(curve => [curve.signs[0], curve.signs.at(-1)]), [[1, 1], [-1, 1], [1, -1], [-1, 1]]);
  uniqueAnswer(curves.map(curve => curve.passes), body.correctIndex);
}

function rankDirection(alt: string) {
  assert.match(alt, /両軸とも−20，−10，0，10，20/);
  const pairs = [...alt.matchAll(/（(-?\d+)，(-?\d+)）/g)].map(([, x, y]) => [Number(x), Number(y)]);
  assert.ok(pairs.length >= 24);
  const directions = pairs.flatMap(([x, y], i) => pairs.slice(i + 1).map(([u, v]) => Math.sign((x - u) * (y - v)))).filter(Boolean);
  const strength = directions.reduce((total, sign) => total + sign, 0) / directions.length;
  return Math.abs(strength) < 0.5 ? 0 : Math.sign(strength);
}

function scatterAnswer(body: GeneratedBody, index: number) {
  const prompt = paragraph(body.prompt);
  assert.match(prompt, /散布図.*相関|相関.*散布図/);
  const direction = prompt.includes('正の相関') ? 1 : -1;
  const directions = body.choices.map(choice => rankDirection(description(choice)));
  if (!index) assert.deepEqual(directions, [0, -1, 0, 1]);
  assert.deepEqual([...directions].sort(), [-1, 0, 0, 1]);
  uniqueAnswer(directions.map(value => value === direction), body.correctIndex);
}

function propertyAnswer(body: GeneratedBody) {
  assert.match(paragraph(body.prompt), /日本.*産業財産権.*四つ/);
  const administeredByPatentOffice = ['特許権', '実用新案権', '意匠権', '商標権'];
  const allRights = body.choices.map(paragraph).map(choice => choice.split('，'));
  assert.ok(allRights.every(option => new Set(option).size === 4 && option.every(right => /^(意匠|実用新案|商標|特許|著作|育成者)権$/.test(right))));
  uniqueAnswer(allRights.map(option => administeredByPatentOffice.every(right => option.includes(right))), body.correctIndex);
}

function dispatchAnswer(body: GeneratedBody) {
  const prompt = body.prompt.filter(block => block.type === 'paragraph');
  assert.match(paragraph(prompt), /労働者派遣法に基づく.*太線部分/);
  const actors = /，(派遣元企業|派遣先企業|労働者)と(派遣元企業|派遣先企業|労働者)を結ぶ矢印が太線/.exec(description(body.prompt));
  assert.ok(actors);
  const pair = new Set(actors.slice(1));
  assert.equal(pair.size, 2);
  const choices = body.choices.map(paragraph);
  assert.deepEqual([...choices].sort(), ['労働者派遣契約関係', '指揮命令関係', '請負契約関係', '雇用関係'].sort());
  const label = pair.has('労働者') ? (pair.has('派遣先企業') ? '指揮命令関係' : '雇用関係') : '労働者派遣契約関係';
  uniqueAnswer(choices.map(choice => choice === label), body.correctIndex);
}

const modeled: Record<number, (body: GeneratedBody, index: number) => void> = {
  56: journalAnswer, 75: abcAnswer, 77: scatterAnswer, 78: propertyAnswer, 80: dispatchAnswer,
};
test('原番号と公式キー、領域境界及び版付き生成定義を検査', () => {
  assert.equal(definitions.length, 27);
  assert.equal(official.length, 27);
  assert.equal(Object.keys(knowledgeOracle).length + Object.keys(modeled).length, 27);
  assert.deepEqual(definitions.map(d => d.source), Array.from({ length: 27 }, (_, i) => '2010h22a-fe-am-' + (54 + i)));
  assert.equal(definitions.map(d => d.sourceAnswer).join(''), official);
});

for (const [offset, definition] of definitions.entries()) {
  const number = offset + 54;
  test(`問${number}の公式基準・全入力・全選択肢を独立に検査`, () => {
    assert.deepEqual(definition.reference, [0]);
    assert.ok(definition.notes.includes(`p.${referencePages[offset]}`));
    for (const values of [[], [-1], [4], [0.5], [NaN], [Infinity], [0, 1]]) assert.throws(() => definition.build(values));
    const bodies = [0, 1, 2, 3].map(i => definition.build([i]));
    assert.equal(bodies[0].correctIndex, letters.indexOf(official[offset]));
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    for (const [index, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert.ok(body.explanation.length >= 35);
      if (modeled[number]) modeled[number](body, index);
      else {
        const [context, options, correct] = knowledgeOracle[number][index];
        assert.match(paragraph(body.prompt), context);
        const actual = body.choices.map(paragraph);
        actual.forEach((choice, position) => assert.match(choice, options[position]));
        uniqueAnswer(actual.map(choice => options[correct].test(choice)), body.correctIndex);
      }
    }
  });
}

test('図9種×4状態をSSRし、アクセシブルな名称・説明・描画要素が対応', () => {
  assert.equal(figures.length, 9);
  assert.deepEqual(figures.map(figure => figure.profile).sort(), renderers.map(renderer => renderer.profile).sort());
  for (const figure of figures) {
    const renderer = renderers.find(item => item.profile === figure.profile);
    assert.ok(renderer);
    for (const bad of [[], [-1], [4], [0.5], [0, 1]]) assert.throws(() => figure.alt(bad));
    for (let index = 0; index < 4; index++) {
      const html = renderToStaticMarkup(createElement(renderer.component, { caption: '図の名称', values: [index] }));
      const title = /<title id="([^"]+)">図の名称<\/title>/.exec(html);
      const desc = /<desc id="([^"]+)">([^<]+)<\/desc>/.exec(html);
      assert.ok(title && desc);
      assert.ok(html.includes(`aria-labelledby="${title[1]}"`));
      assert.ok(html.includes(`aria-describedby="${desc[1]}"`));
      assert.equal(desc[2], figure.alt([index]));
      assert.ok(html.includes(`data-figure-profile="${figure.profile}"`));
      if (figure.profile.includes('-77-')) assert.equal((html.match(/<circle /g) ?? []).length, [...desc[2].matchAll(/（-?\d+，-?\d+）/g)].length);
      if (figure.profile.includes('-80-')) {
        assert.equal((html.match(/<line /g) ?? []).length, 3);
        assert.equal((html.match(/stroke-width="3.6"/g) ?? []).length, 1);
      }
    }
  }
});
