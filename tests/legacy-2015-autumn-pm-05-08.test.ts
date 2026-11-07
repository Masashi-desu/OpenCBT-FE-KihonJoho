import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import { DataError } from '../src/core/errors';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2015AutumnPm5Definition as q5, autumn2015Pm5Decisions as decision } from '../src/core/generators/legacy-2015-autumn-pm-5';
import { legacy2015AutumnPm6Definition as q6 } from '../src/core/generators/legacy-2015-autumn-pm-6';
import { legacy2015AutumnPm7Definition as q7, autumn2015Pm7Ring as ring, autumn2015Pm7Pareto as pareto } from '../src/core/generators/legacy-2015-autumn-pm-7';
import { legacy2015AutumnPm8Definition as q8, autumn2015Pm8Search as search } from '../src/core/generators/legacy-2015-autumn-pm-8';
import { legacy2015AutumnPm0508Figures as figures } from '../src/core/generators/legacy-2015-autumn-pm-05-08-figures';
import { legacy2015AutumnPm0508FigureRenderers as renderers } from '../src/ui/Legacy2015AutumnPm0508Figures';
import { autumn2015Pm05To08Specs as specs } from '../scripts/legacy-2015-autumn-pm-05-08-specs';

const symbols = 'アイウエオカキクケコ';
const definitions = [q5, q6, q7, q8];
const sum = (numbers: readonly number[]) => numbers.reduce((total, number) => total + number, 0);
const integer = (text: string) => Number(text.replaceAll(',', '').replaceAll('−', '-'));
const flatText = (blocks: readonly Block[]) => blocks.map(block =>
  block.type === 'paragraph' || block.type === 'code' || block.type === 'heading' ? block.text
    : block.type === 'table' ? block.rows.flat().join('／') : block.type === 'diagram' ? block.alt : '').join('\n');

function part(body: GeneratedBody, id: string) {
  const field = body.answerParts!.find(candidate => candidate.id === 'part-' + id);
  assert(field);
  return field;
}
function choices(body: GeneratedBody, id: string) {
  return part(body, id).choiceIds.map(choice => body.choices[Number(choice.slice(13)) - 1]);
}
const bank = (body: GeneratedBody, id: string) => choices(body, id).map(flatText);
function selected(body: GeneratedBody, id: string) {
  const field = part(body, id);
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === field.id);
  assert(answer?.kind === 'choice');
  return field.choiceIds.indexOf(answer.choiceId);
}
function unique(body: GeneratedBody, id: string, predicate: (value: string, index: number) => boolean) {
  const values = bank(body, id);
  assert.equal(new Set(values).size, values.length, id + ' duplicate choices');
  assert.deepEqual(values.flatMap((value, i) => predicate(value, i) ? [i] : []), [selected(body, id)], id + ' correct choice');
}
function table(body: GeneratedBody, prefix: string) {
  const block = body.prompt.find(block => block.type === 'table' && block.caption.startsWith(prefix));
  assert(block?.type === 'table');
  return block;
}
function findDiagram(blocks: readonly Block[], suffix: string) {
  const block = blocks.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix));
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  return { ...block, scene: block.scene };
}
function render(block: ReturnType<typeof findDiagram>) {
  const renderer = renderers.find(renderer => renderer.profile === block.scene.profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component, { values: block.scene.values, caption: block.caption }));
}

test('2015秋午後問5〜8の原資料・公式正答・全選択肢・有限入力・図の意味と描画の対応を保持する', () => {
  const counts = [[8, 8, 8, 8, 6, 7], [4, 4, 4, 4, 3], [5, 4, 5, 4, 5, 5], [6, 6, 10, 10, 10, 3]];
  const keys = ['ウアオキイオ', 'ウイイイア', 'ウイオイウオ', 'エカアオキイ'];
  const figureIds = new Set();
  for (const [i, def] of definitions.entries()) {
    const { original, originalPageAlt, pages } = specs[i];
    assert.deepEqual(Object.keys(originalPageAlt).map(Number), pages);
    assert(Object.values(originalPageAlt).every(text => text.length > 100 && text.length <= 2000));
    assert.equal(original.answerParts!.map(p => symbols[selected(original, p.id.slice(5))]).join(''), keys[i]);
    const seen = new Set();
    const max = def.fields[0].maximum;
    for (let value = 0; value <= max; value++) {
      const body = def.build([value]);
      assert.deepEqual(body.answerParts!.map(p => p.choiceIds.length), counts[i]);
      assert.deepEqual(def.build([value]), body);
      const prompt = flatText(body.prompt);
      assert(!seen.has(prompt));
      seen.add(prompt);
      assert.deepEqual(body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])),
        def.fixedReferenceAssetIds);
      for (const block of [...body.prompt, ...body.choices.flat()]) {
        if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
        const { profile, values } = block.scene;
        const spec = figures.find(entry => entry.profile === profile);
        assert(spec);
        assert.equal(readBookletFigure(spec, values), block.alt);
        assert.match(render({ ...block, scene: block.scene }), /<p|<svg|<table|question-blank/);
        assert.throws(() => readBookletFigure(spec, [...values, 0]), error => error instanceof DataError && error.code === 'FIGURE_PROFILE');
        figureIds.add(profile);
      }
    }
    for (const bad of [[], [-1], [max + 1], [.5], [NaN], [Infinity], [0, 0]])
      assert.throws(() => def.build(bad), error => error instanceof DataError && error.code === 'PARAMETER_CONSTRAINT');
  }
  assert.deepEqual(specs.flatMap(spec => spec.pages), Array.from({ length: 19 }, (_, i) => i + 21));
  assert.deepEqual(q8.fixedReferenceAssetIds, ['asset-ipa-2015h27a-fe-pm-p003', 'asset-ipa-2015h27a-fe-pm-p004']);
  assert.deepEqual(figureIds, new Set(renderers.map(renderer => renderer.profile)));
});

const bools = [false, true];
const states = bools.flatMap(required => bools.flatMap(date => bools.flatMap(valid =>
  bools.flatMap(separate => bools.map(billing => ({ required, date, valid, separate, billing }))))));

function expectedActions(form: typeof states[number], dateRequired: boolean) {
  if (!form.required) return '10000';
  const defaulted = Number(!form.date);
  if (form.date ? !form.valid : form.separate && dateRequired) return '0' + defaulted + '100';
  if (form.separate && !form.billing) return '0' + defaulted + '100';
  return '0' + defaulted + '0' + Number(!form.separate) + '1';
}

test('問5は全決定表条件と全候補、在庫の等号、会員区分と金額境界を逐次処理で照合する', () => {
  const domain = Array.from({ length: 8 }, (_, i) => i);
  const eMarks = ['000', '001', '011', '100', '101', '110'];
  for (let input = 0; input <= q5.fields[0].maximum; input++) {
    const body = q5.build([input]), text = flatText(body.prompt);
    const floor = text.match(/希望納期が(処理日(?:の\d+日後)?)以前/);
    assert(floor);
    const dateRequired = text.includes('希望納期の入力の有無は(2)で日付を設定する前の状態で判定する。');
    assert.equal(dateRequired, input >= 2);
    const initial = floor[1];
    assert.deepEqual(bank(body, 'a'), [
      '希望納期＞' + initial, '希望納期≦' + initial, '希望納期が入力されている', '希望納期が未入力である',
      '請求先区分が“指定する”である', '請求先区分が“届け先と同じ”である', '請求先情報が入力されている', '請求先情報が未入力である',
    ]);
    const table3 = decision([input], 'q5-t3');
    assert.deepEqual(table3.rowSpans, [{ section: 'actions', row: 2, column: 4, rowSpan: 3, fieldId: 'e' }]);
    assert.match(render(findDiagram(body.prompt, 'decision-3')), /rowSpan="3".*?空欄 e/);
    assert.deepEqual(bank(body, 'e'), eMarks.map(option =>
      '上から' + [...option].map(mark => mark === '1' ? '実行' : '実行しない').join('、') + '。'));
    const stateRows = states.map(form => ({
      form, expected: expectedActions(form, dateRequired),
      pool: [form.valid, !form.valid, form.date, !form.date, form.separate, !form.separate, form.billing, !form.billing],
    }));
    const solutions = [];
    for (const a of domain) for (const b of domain) for (const c of domain) for (const d of domain) {
      for (const [e, option] of eMarks.entries()) {
        const works = stateRows.every(({ form, expected, pool }) => {
          const truths = [form.required, pool[a], pool[b], pool[c], pool[d]];
          const columns = Array.from({ length: 8 }, (_, i) => i).filter(column => table3.conditions.every((row, i) =>
            row.marks[column] === (truths[i] ? 'Y' : 'N') || row.marks[column] === '—' || row.marks[column] === '―'));
          if (columns.length !== 1) return false;
          return table3.actions.map((row, i) => {
            const mark = row.marks[columns[0]];
            return typeof mark === 'object' ? option[i - 2] : Number(mark === 'X');
          }).join('') === expected;
        });
        if (works) solutions.push([a, b, c, d, e]);
      }
    }
    assert.deepEqual(solutions, [[...'abcde'].map(field => selected(body, field))]);
    const table4 = decision([input], 'q5-t4');
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++)
      for (let p = 1; p <= 3; p++) for (let q = 1; q <= 3; q++) {
        const shortage = a < p || b < q;
        const column = table4.conditions[0].marks.indexOf(shortage ? 'Y' : 'N');
        assert.deepEqual(table4.actions.map(row => row.marks[column] === 'X'),
          [Math.min(a - p, b - q) < 0, Math.min(a - p, b - q) >= 0]);
      }
    const discounts = table(body, '表5'), table6 = decision([input], 'q5-t6');
    const bounds = discounts.columns[2].match(/(\d+)万円以上(\d+)万円未満/);
    assert(bounds);
    const [low, high] = bounds.slice(1).map(s => Number(s) * 10000);
    const rates = table6.actions.slice(0, 3).map(row => Number(row.label.match(/\d+/)?.[0]));
    assert(table6.actions.every(row => row.marks.every(mark => mark === null)));
    const available = new Set();
    for (const paid of bools) for (const amount of [0, low - 1, low, low + 1, high - 1, high, high + 1]) {
      const band = amount < low ? 0 : amount < high ? 1 : 2;
      const rank = band + Number(paid);
      const terms = discounts.rows[Number(paid)][band + 1];
      assert.equal(Number(terms.match(/\d+/)?.[0] ?? 0), rank === 0 ? 0 : rates[rank - 1]);
      assert.equal(terms.includes('送料無料'), rank >= 2);
      const values = [!paid, amount < low, amount >= low && amount < high, amount >= high];
      const columns = Array.from({ length: 16 }, (_, i) => i).filter(column => table6.conditions.every((row, i) =>
        row.marks[column] === (values[i] ? 'Y' : 'N')));
      assert.equal(columns.length, 1);
      available.add(columns[0]);
    }
    assert.equal(available.size, 6);
    unique(body, 's2', choice => Number(choice) === 16 - available.size);
  }
});

test('問6は実際の表示時間と生産性から全択、工程の終了と手戻りを再計算する', () => {
  for (let input = 0; input <= q6.fields[0].maximum; input++) {
    const body = q6.build([input]), prose = flatText(body.prompt);
    const scale = Number(prose.match(/見積もった開発規模は，(\d+)kステップ/)?.[1]);
    const productivity = table(body, '表1').rows[0].slice(1).map(Number);
    const schedule = findDiagram(body.prompt, 'schedule').alt;
    const rows = [...schedule.matchAll(/([A-E]|全体)：(約)?(\d+)%、(\d+|空白)、(\d+|空白)、(\d+|空白)、(\d+|空白)/g)];
    assert.equal(rows.length, 6);
    const slots = rows.map(row => row.slice(4).map(s => s === '空白' ? 0 : Number(s)));
    const remaining = slots.slice(0, 5).map(sum);
    const spent = 8 * 5 * 8;
    const designByPerson = remaining.map(hours => hours + spent);
    const initialHours = scale / productivity[0];
    const reestimatedScale = sum(designByPerson) * productivity[0];
    const programming = reestimatedScale / productivity[1], testing = reestimatedScale / productivity[2];
    const aggregate = sum(remaining);
    for (let week = 0; week < 4; week++) assert.equal(slots[5][week], sum(slots.slice(0, 5).map(row => row[week])));
    for (const [i, row] of rows.entries()) {
      const worked = i === 5 ? 5 * spent : spent, hours = i === 5 ? sum(designByPerson) : designByPerson[i];
      assert.deepEqual([Boolean(row[2]), Number(row[3])], [(100 * worked) % hours !== 0, Math.round(100 * worked / hours)]);
    }
    const group = designByPerson.flatMap((value, i) => value > initialHours / 5 ? ['ABCDE'[i]] : []).join('');
    const names = new Map([['B及びDの2人', 'BD'], ['B，D及びEの3人', 'BDE'], ['C以外の4人', 'ABDE'], ['Dのただ1人', 'D']]);
    unique(body, 'a', value => integer(value) === initialHours);
    unique(body, 'b', value => integer(value) === reestimatedScale);
    unique(body, 'c', value => integer(value) === sum(designByPerson) + programming + testing);
    unique(body, 'd', value => names.get(value) === group);
    // Derive finish independently by filling five workers' available intervals.
    const plan1Finish = (programming + sum(remaining)) / 5;
    assert(remaining.every(start => start < plan1Finish));
    assert.equal(sum(remaining.map(start => plan1Finish - start)), programming);
    const uniformStart = aggregate / 5, uniformFinish = uniformStart + programming / 5;
    const change = Math.min(...remaining) + 1;
    const truth = [plan1Finish < uniformFinish, remaining.some(start => start < change && change < plan1Finish), change < uniformStart];
    const criteria = [
      '設計変更が発生しなかった場合，プログラミング工程の終了日は第1案の方が第2案よりも早くなる。',
      '設計変更が発生した場合，第1案では，設計工程のコスト増及びスケジュール遅延だけでなく，その影響で，既に着手していたプログラミングの手戻りなどが発生して，プログラミング工程のコスト増が発生する可能性がある。',
      '設計変更が発生した場合，第2案では，設計工程のコスト増及びスケジュール遅延は発生するが，その影響で，プログラミング工程のコスト増は発生しない。',
    ];
    assert.deepEqual(bank(body, 's3'), criteria);
    unique(body, 's3', (_, i) => !truth[i]);
    if (input === 0) assert.deepEqual([initialHours, reestimatedScale, programming, sum(designByPerson), plan1Finish], [2000, 104, 1040, 2080, 304]);
  }
});

const labels = [...'PQRST'];
const angleBoundaries = (values: number[]) => values.slice(0, -1).map((_, i) => 360 * sum(values.slice(0, i + 1)) / sum(values));
const nearly = (a: number, b: number, tolerance = 0.000001) => Math.abs(a - b) < tolerance;

test('問7は売上・営業利益・図の全択と決定木の確率・期待値を表示値から再計算する', () => {
  for (let input = 0; input <= q7.fields[0].maximum; input++) {
    const body = q7.build([input]);
    const base = table(body, '表1').rows.slice(0, 5);
    const rules = table(body, '表2').rows;
    assert.deepEqual(base.map(row => row[0]), labels);
    const sales = base.map(row => integer(row[1]) * 10), profit = base.map(row => Math.round(integer(row[2]) * 10));
    const getNumber = (text: string) => Number(text.match(/\d+(?:\.\d+)?/)?.[0]);
    const nextSales = sales.map((sale, i) => sale + (getNumber(rules[i][1]) || 0) * sale / 100);
    const p = rules.map(row => getNumber(row[2]));
    const nextProfit = [
      profit[0] + profit[0] * p[0] / 100, nextSales[1] * profit[1] / sales[1], profit[2] + profit[2] * p[2] / 100,
      nextSales[3] * p[3] / 100, profit[4] + 10 * p[4],
    ];
    assert(nextProfit.every(number => Number.isInteger(number) && number > 0));
    const increase = nextSales.map((sale, i) => sale - sales[i]);
    const margins = nextProfit.map((number, i) => number / nextSales[i]);
    assert.deepEqual(bank(body, 'a'), labels);
    assert.deepEqual(bank(body, 'c'), labels);
    unique(body, 'a', (_, i) => increase[i] === Math.max(...increase));
    unique(body, 'c', (_, i) => margins[i] === Math.max(...margins));
    assert.match(flatText(body.prompt), new RegExp((sum(nextSales) - sum(sales)) / 10 + '億円を期待'));
    assert.match(render(findDiagram(body.prompt, 'sales-summary')), /原資料で非表示の部分/);
    assert.equal((render(findDiagram(body.prompt, 'sales-summary')).match(/omitted-cell/g) ?? []).length, 10);

    const inner = angleBoundaries(sales), outer = angleBoundaries(nextSales);
    const ringInputs = choices(body, 'b').map(blocks => findDiagram(blocks, 'ring-choice'));
    for (const block of ringInputs) {
      const actual = ring(block.scene.values);
      assert(actual.inner.every((value, i) => nearly(value, inner[i], input === 0 ? 1 : undefined)));
      assert.deepEqual([...render(block).matchAll(/data-ring-angle="([^"]+)"/g)].map(match => Number(match[1])),
        [...actual.outer, 360, ...actual.inner, 360]);
      assert.match(render(block), /<pattern[^>]+line.*?<pattern[^>]+dot/);
    }
    unique(body, 'b', (_, i) =>
      ring(ringInputs[i].scene.values).outer.every((value, j) => nearly(value, outer[j], input === 0 ? 2 : undefined)));

    const sorted = labels.map((label, i) => ({ label, amount: nextProfit[i] })).sort((a, b) => b.amount - a.amount);
    const bars = sorted.map(item => item.amount / sum(nextProfit) * 100);
    const cumulative = [0, ...bars.map((_, i) => sum(bars.slice(0, i + 1)))];
    const paretoInputs = choices(body, 'd').map(blocks => findDiagram(blocks, 'pareto-choice'));
    for (const block of paretoInputs) {
      const actual = pareto(block.scene.values);
      assert(actual.scaled.every((value, i) => nearly(value, bars[i])));
      const points = render(block).match(/<polyline points="([^"]+)"/)?.[1].split(' ');
      assert(points?.length === 6);
      assert(points.every((point, i) => nearly((150 - Number(point.split(',')[1])) / 1.22, actual.cumulative[i])));
    }
    unique(body, 'd', (_, i) => {
      const candidate = pareto(paretoInputs[i].scene.values);
      return candidate.labels.join('') === sorted.map(item => item.label).join('') &&
        candidate.cumulative.every((value, j) => nearly(value, cumulative[j]));
    });

    const tree = findDiagram(body.prompt, 'decision-tree');
    const chances = [...tree.alt.matchAll(/：(\d+)%、/g)].map(match => Number(match[1]));
    assert.equal(chances.length, 8);
    assert.equal(sum(chances.slice(0, 3)), 100);
    assert.equal(sum(chances.slice(3, 5)), 100);
    assert.equal(sum(chances.slice(5, 7)), 100);
    assert.equal(chances[7], 100);
    const effects = [100, 80, 50, 40, 0], firstStage = [0, 0, 1, 1, 2];
    const leaves = effects.map((effect, i) => ({ effect, weight: chances[firstStage[i]] * chances[i + 3] }));
    const totalWeight = sum(leaves.map(leaf => leaf.weight));
    assert.equal(totalWeight, 10000);
    const full = leaves.find(leaf => leaf.effect === 100)!.weight;
    const noMoreThan = (effect: number) => sum(leaves.filter(leaf => leaf.effect <= effect).map(leaf => leaf.weight));
    const eChecks = [full * 2 > totalWeight, full * 10 >= totalWeight * 7, full < totalWeight - full,
      full < noMoreThan(40), full >= noMoreThan(50) * 2];
    assert.deepEqual(bank(body, 'e'), [
      '50%を上回る', '70%以上である', '期待どおりの効果が実現できない確率よりも低い',
      '期待の40%以下の効果しか実現しない確率よりも低い', '期待の50%以下の効果しか実現しない確率の2倍以上である',
    ]);
    unique(body, 'e', (_, i) => eChecks[i]);
    const expected = leaves.reduce((total, leaf) => total + BigInt(leaf.weight) *
      (100n * BigInt(sum(sales)) + BigInt(leaf.effect) * BigInt(sum(nextSales) - sum(sales))), 0n);
    const denominator = BigInt(totalWeight) * 1000n;
    const rounded = Number((expected * 2n + denominator) / (denominator * 2n));
    unique(body, 'f', value => integer(value) === rounded);
    if (input === 0) {
      assert.equal(Number(expected) / Number(denominator), 412.032);
      assert.deepEqual(pareto([0, 1]).labels, [...'PQSTR']);
      assert.equal(full, 4900);
    }
  }
});

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function skipOracle(pattern: string, reversed = false) {
  const prefix = pattern.slice(0, -1);
  return Object.fromEntries([...alphabet].map(char => {
    const index = reversed ? prefix.indexOf(char) : prefix.lastIndexOf(char);
    return [char, index < 0 ? pattern.length : pattern.length - 1 - index];
  }));
}

function trace(text: string, pattern: string, reversed = false) {
  const shifts = skipOracle(pattern, reversed);
  const ends: number[] = [], matches: number[] = [];
  for (let start = 0; start + pattern.length <= text.length; ) {
    const window = text.slice(start, start + pattern.length);
    const suffixes = Array.from({ length: pattern.length }, (_, i) => i + 1);
    const match = Math.max(0, ...suffixes.filter(size => window.endsWith(pattern.slice(-size))));
    ends.push(start + pattern.length);
    matches.push(match);
    if (window === pattern) return { found: start + 1, ends, matches };
    start += shifts[window.at(-1)!];
  }
  return { found: -1, ends, matches };
}

function binaryStrings(max: number) {
  return Array.from({ length: max }, (_, i) => Array.from({ length: 2 ** (i + 1) }, (_, n) =>
    n.toString(2).padStart(i + 1, '0').replaceAll('0', 'A').replaceAll('1', 'B'))).flat();
}

test('問8は全可変入力の照合窓・移動量・全択を独立した文字列検索で照合する', () => {
  let reverseMisses = 0;
  for (const text of binaryStrings(8)) for (const pattern of binaryStrings(5)) {
    const naive = text.indexOf(pattern), oracle = trace(text, pattern), actual = search(text, pattern);
    assert.equal(oracle.found, naive < 0 ? -1 : naive + 1);
    assert.deepEqual([actual.found, actual.ends, actual.matches], [oracle.found, oracle.ends, oracle.matches]);
    const reverse = trace(text, pattern, true);
    if (naive >= 0 && reverse.found < 0) reverseMisses++;
    if (reverse.found >= 1) assert.equal(text.slice(reverse.found - 1, reverse.found - 1 + pattern.length), pattern);
  }
  assert(reverseMisses > 0);
  for (const [text, pattern] of [['Z', 'Z'], ['AZ', 'Z'], ['Z', 'AZ'], ['ZZZ', 'ZZ'], ['AAA', 'Z'], ['YZAZ', 'AZ']])
    assert.equal(search(text, pattern).found, trace(text, pattern).found);
  const sample = trace('ACBBMACABABC', 'ACAB');
  assert.deepEqual(sample, { found: 6, ends: [4, 8, 9], matches: [1, 0, 4] });
  assert.deepEqual(trace('ACBBMACABABC', 'ACAB', true), { found: -1, ends: [4, 8, 11], matches: [1, 0, 2] });

  for (let input = 0; input <= q8.fields[0].maximum; input++) {
    const body = q8.build([input]), prose = flatText(body.prompt);
    const matched = prose.match(/Text\[\]に“([A-Z]+)”，TextLenに(\d+)，Pat\[\]に“([A-Z]+)”，PatLenに(\d+)/);
    assert(matched);
    const [, text, len, pattern, patLen] = matched;
    assert.deepEqual([text.length, pattern.length], [Number(len), Number(patLen)]);
    const diagram = findDiagram(body.prompt, 'f4');
    assert.deepEqual([...diagram.alt.matchAll(/\d+=([A-Z])/g)].map(match => match[1]), [...text, ...pattern]);
    assert.match(render(diagram), /Text\[\].*Pat\[\]/);
    const actual = search(text, pattern), expected = trace(text, pattern);
    assert.deepEqual(actual.ends, expected.ends);
    assert.deepEqual(actual.matches, expected.matches);
    const counts = [expected.ends.length, sum(expected.matches), expected.found];
    for (const [i, id] of [...'cde'].entries()) unique(body, id, value => integer(value) === counts[i]);
    if (input === 0) assert.deepEqual(counts, [3, 7, 9]);

    const ab = bank(body, 'a');
    assert.deepEqual(ab, ['0', '1', 'I−PatLen', 'PatLen', 'PatLen−1', 'PatLen−I']);
    const validPairs = [];
    for (const [a, aValue] of ab.entries()) for (const [b, bValue] of bank(body, 'b').entries()) {
      const valid = ['A', 'AB', 'ACAB', 'ZAZA', 'ABAAB', 'ABCDE'].every(word => {
        const evaluate = (expression: string, index: number) => {
          const expressions = new Map([['0', 0], ['1', 1], ['I−PatLen', index - word.length], ['PatLen', word.length],
            ['PatLen−1', word.length - 1], ['PatLen−I', word.length - index]]);
          return expressions.get(expression);
        };
        const skips = [...alphabet].map((_, i) => evaluate(aValue, i + 1));
        [...word.slice(0, -1)].forEach((letter, i) => { skips[alphabet.indexOf(letter)] = evaluate(bValue, i + 1); });
        const oracle = Object.values(skipOracle(word));
        return skips.every((skip, i) => skip === oracle[i]);
      });
      if (valid) validPairs.push([a, b]);
    }
    assert.deepEqual(validPairs, [[selected(body, 'a'), selected(body, 'b')]]);
    assert.deepEqual(bank(body, 'f'), [
      '対象文字列中に，検索文字列が含まれていないのに，1以上の値を返す場合がある',
      '対象文字列中に，検索文字列が含まれているのに，−1を返す場合がある',
      '正しい値を返す',
    ]);
    unique(body, 'f', (_, i) => i === 1 && reverseMisses > 0);
    const program = render(findDiagram(body.prompt, 'program'));
    for (const expected of ['空欄 a', '空欄 b', 'γ', 'α', 'β', '■', '▲', '▼', 'PLast＋Skip[Index(Text[PLast])]'])
      assert(program.includes(expected), expected);
  }
});
