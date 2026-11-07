import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { spring2016Pm01To04Specs } from '../scripts/legacy-2016-spring-pm-01-04-specs';
import { readBookletFigure, validateBookletFigureExtensions } from '../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../src/core/generators/definition';
import {
  legacy2016SpringPm0104Figures, spring2016Pm0104Profiles as f,
} from '../src/core/generators/legacy-2016-spring-pm-figures-01-04';
import { legacy2016SpringPm0104FigureRenderers } from '../src/ui/Legacy2016SpringPm0104Figures';
import { validateBookletFigureRenderers } from '../src/ui/booklet-figure-renderer-contract';
import review from './fixtures/legacy-2016-spring-pm-01-04-review.json';
import {
  answerChoices, bodyText, uniqueChoice, verifyDatabase, verifyEthernet, verifyGcCounts, verifyIncident,
} from './fixtures/legacy-2016-spring-pm-01-04-oracle';

function render(profile: string, values: number[], caption = '検証用の図') {
  const component = legacy2016SpringPm0104FigureRenderers.find(renderer => renderer.profile === profile)?.component;
  assert(component);
  return renderToStaticMarkup(createElement(component, { values, caption }));
}

function assertGraph(body: GeneratedBody, input: number) {
  const marker = body.prompt.map(bodyText).join('\n').match(/マーキングでセル1個を処理する時間を(\d+)とする/);
  const markingTime = marker ? Number(marker[1]) : 1;
  assert.equal(markingTime, input + 1);
  const graphs = answerChoices(body, 'd').blocks;
  const correct = graphs.map(blocks => {
    assert.equal(blocks.length, 1);
    const [block] = blocks;
    assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
    assert.equal(block.scene.values[0], input);
    const drawing = render(block.scene.profile, block.scene.values, block.caption);
    const line = /<polyline points="([^"]+)"/.exec(drawing);
    assert(line);
    const points = line[1].split(' ').map(point => point.split(',').map(Number));
    assert.equal(points.length, 51);
    assert(points.every(([x, y], n) => Math.abs(x - (46 + 187 * n / 50)) < 0.011 && y >= 49 && y <= 145));
    const sequentialEfficiency = points.map((_, live) => {
      let time = 0, recovered = 0;
      for (let cell = 0; cell < 50; cell++) {
        time++;
        if (cell < live) time += markingTime;
        else recovered++;
      }
      return recovered / time;
    });
    return points.every(([, y], n) => Math.abs((145 - y) / 96 - sequentialEfficiency[n]) < 0.00006);
  });
  uniqueChoice(body, 'd', correct);
}

test('2016春午後問1〜4の原頁・選択肢の共有・解答例・全前提を維持する', () => {
  const marks = 'アイウエオカキクケコ';
  for (const [index, spec] of spring2016Pm01To04Specs.entries()) {
    const expected = review.questions[index];
    assert.equal(spec.definition.source, '2016h28h-fe-pm-' + expected.number);
    assert.deepEqual(spec.pages, expected.pages);
    assert.equal(spec.original.choices.length, expected.uniqueChoices);
    assert.deepEqual(spec.original.answerParts?.map(part => part.choiceIds.length), expected.choiceCounts);
    const selected = spec.original.answerParts?.map(part => marks[answerChoices(spec.original, part.id.slice(5)).correct]).join('');
    assert.equal(selected, expected.answerMarks);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), expected.pages);
    assert(expected.pages.every(page => spec.originalPageAlt[page].length > 100));
    const source = Object.values(spec.originalPageAlt).join('\n');
    const original = spec.definition.build([0]);
    for (const premise of expected.visiblePremises) {
      assert(source.includes(premise), '原資料: ' + premise);
      for (let input = 0; input < 4; input++) {
        const body = spec.definition.build([input]);
        assert(body.prompt.map(bodyText).join('\n').includes(premise), '出題: ' + premise);
        assert.deepEqual(body.answerParts?.map(part => part.choiceIds), original.answerParts?.map(part => part.choiceIds));
      }
    }
    const variants = Array.from({ length: 4 }, (_, input) => JSON.stringify(spec.definition.build([input]).prompt));
    assert.equal(new Set(variants).size, 4);
  }
});

test('問1の全候補を事故対応の要件・漏えい範囲・文字列の個数から検算する', () => {
  const spec = spring2016Pm01To04Specs[0];
  for (let input = 0; input < 4; input++) verifyIncident(spec.definition.build([input]), input);
});

test('問2の全候補をマーク・走査の参照手順と実際のグラフ描画で検算する', () => {
  const expectedReachable = [[0, 1, 2, 4, 6], [0, 1, 2, 5], [0, 1, 2, 6], [0, 1, 2, 4, 5, 6]];
  for (let input = 0; input < 4; input++) {
    const body = spring2016Pm01To04Specs[1].definition.build([input]);
    verifyGcCounts(body);
    assertGraph(body, input);
    const markup = render(f.q2Marked, [input]);
    const links = [...markup.matchAll(/data-cell-link="(\d)-(\d)"/g)]
      .map(([, from, to]) => [Number(from), Number(to)]);
    assert.deepEqual(links, [[0, 1], [1, 2], [3, 4], [3, 5], ...(input === 3 ? [[4, 5]] : []), [4, 6]]);
    const root = Number(/data-root-target="(\d)"/.exec(markup)?.[1]);
    assert.equal(root, [4, 5, 6, 4][input]);
    const reachable = new Set([0, root]);
    for (let pass = 0; pass < 7; pass++)
      for (const [from, to] of links) if (reachable.has(from)) reachable.add(to);
    assert.deepEqual([...reachable].sort(), expectedReachable[input]);
    const bits = [...markup.matchAll(/data-cell="(\d)"><g data-mark-bit="([01])" data-garbage="(true|false)"/g)];
    assert.equal(bits.length, 7);
    for (const [, cell, bit, garbage] of bits) {
      assert.equal(Number(bit), Number(reachable.has(Number(cell))));
      assert.equal(garbage, String(!reachable.has(Number(cell))));
    }
    const sweep = render(f.q2Sweep, [input]);
    const expectedMemory = [0, 3, 1, 5, 2, 4, 6].map(cell => Number(reachable.has(cell))).concat(1);
    assert.deepEqual([...sweep.matchAll(/data-mark-bit="([01])"/g)].map(([, bit]) => Number(bit)), expectedMemory);
  }
});

test('問3の全SQL候補をSQLiteで実行し、額・日時の境界と複数利用を独立集計で照合する', () => {
  const spec = spring2016Pm01To04Specs[2];
  for (let input = 0; input < 4; input++) {
    const db = new DatabaseSync(':memory:');
    try { verifyDatabase(spec.definition.build([input]), input, db); }
    finally { db.close(); }
  }
});

test('問4の全候補をフレームの構造と実際の図の接続・ARP先から検算する', () => {
  for (let input = 0; input < 4; input++)
    verifyEthernet(spring2016Pm01To04Specs[3].definition.build([input]), render(f.q4Network, [input]), input);
});

test('9図の意味・描画の一対一対応と全有限入力、SQL主キー・各図のラベルを確認する', () => {
  const figures = [{ scope: '2016-spring-pm', figures: legacy2016SpringPm0104Figures }];
  const renderers = [{ scope: '2016-spring-pm', renderers: legacy2016SpringPm0104FigureRenderers }];
  assert.equal(validateBookletFigureExtensions(figures).length, 9);
  assert.equal(validateBookletFigureRenderers(renderers, figures).length, 9);
  let inputs = 0;
  for (const figure of legacy2016SpringPm0104Figures) {
    const visit = (values: number[]) => {
      if (values.length < figure.domain.length) {
        const [min, max] = figure.domain[values.length];
        for (let value = min; value <= max; value++) visit([...values, value]);
        return;
      }
      const alt = readBookletFigure(figure, values), markup = render(figure.profile, values);
      assert(alt.length > 12);
      assert(markup.includes('<figcaption>') && markup.includes('diagram-scroll'));
      assert(!markup.includes('<img'));
      if (figure.profile === f.q3Tables) {
        assert.equal((markup.match(/data-primary-key/g) ?? []).length, [2, 5, 2][values[1]]);
        assert.equal((markup.match(/<table/g) ?? []).length, [2, 4, 2][values[1]]);
        if (values[1] === 1) {
          assert.match(markup, /<u data-primary-key="true">入園者番号<\/u>/);
          assert.match(markup, /<u data-primary-key="true">利用時刻<\/u>/);
        }
      } else assert(markup.includes('<svg') && markup.includes('<desc'));
      inputs++;
    };
    visit([]);
  }
  assert.equal(inputs, 47);
});

test('有限入力は疎配列、getter、記号追加、範囲外の値を拒否する', () => {
  let getterReads = 0;
  const getter: number[] = [];
  Object.defineProperty(getter, 0, { get() { getterReads++; return 0; } });
  const symbol = Object.assign([0], { [Symbol('unknown')]: 0 });
  const badInputs = [[], [0, 1], [-1], [4], [0.5], [Infinity], [NaN], Array(1), getter, symbol];
  for (const spec of spring2016Pm01To04Specs)
    for (const input of badInputs) assert.throws(() => spec.definition.build(input), /PARAMETER_CONSTRAINT/);
  assert.equal(getterReads, 0);
});
