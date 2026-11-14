import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2007AutumnAm27To53Definitions as series } from '../../../src/core/generators/legacy-2007-autumn-am-27-53';
import source from '../../../src/core/generators/legacy-2007-autumn-am-27-53-source.json';
import { legacy2007AutumnAm2753Figures as figures } from '../../../src/core/generators/legacy-2007-autumn-am-27-53-figures';
import { legacy2007AutumnAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2007AutumnAm2753Figures';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { knowledgeFacts } from '../../fixtures/legacy-2007-autumn-am-27-53-review';

const selection = 'アイウエ';
const expectedKeys = [
  'ウ','ア','ウ','ア','ウ','ウ','イ','イ','エ','イ','エ','イ','イ','ウ','ア','ア','エ','エ','エ','エ','ア','ウ','ウ','エ','ア','イ','ウ',
];
const included = Array.from({ length: 27 }, (_, offset) => 27 + offset).filter(number => number !== 49);
const indices = [0, 1, 2, 3];
const numberOf = (id: string) => Number(id.split('-').at(-1));
const question = (number: number) => series.find(({ source }) => numberOf(source) === number)!;
const rendered = (body: GeneratedBody) => body.choices.map(blocks => {
  assert.equal(blocks.length, 1);
  const [block] = blocks;
  assert(block.type === 'paragraph');
  return block.text;
});
const statement = (body: GeneratedBody) => {
  const [block] = body.prompt;
  assert(block.type === 'paragraph');
  return block.text;
};
const answerOf = (body: GeneratedBody) => rendered(body)[body.correctIndex!];
function diagram(body: GeneratedBody) {
  const block = body.prompt.find(block => block.type === 'diagram');
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  return { block, scene: block.scene };
}

test('公式解答p1の26収録問と保留1問、問題冊子の本文及び選択肢を基準と照合する', () => {
  assert.deepEqual(series.map(item => numberOf(item.source)), included);
  assert.deepEqual(Object.keys(source).map(Number), included);
  assert.equal(expectedKeys[49 - 27], 'ウ');
  assert.equal(question(49), undefined);
  for (const number of included) {
    const { source: id, sourceAnswer, build, reference } = question(number);
    const original = source[String(number) as keyof typeof source];
    assert.equal(id, '2007h19a-fe-am-' + number);
    const baseline = build(reference);
    assert.equal(selection[baseline.correctIndex!], expectedKeys[number - 27]);
    assert.equal(sourceAnswer, expectedKeys[number - 27]);
    const suffix = ' 各コンピュータの稼働・停止は互いに独立とする。';
    assert.equal(statement(baseline), original.prompt + (number === 34 ? suffix : ''));
    assert.deepEqual(rendered(baseline), original.choices);
  }
});

test('4条件は問題構成を維持しつつ解答に関わる本文又は図と正答が変わる', () => {
  for (const { build, source, fields, reference } of series) {
    assert.deepEqual(reference, [0]);
    assert.deepEqual(fields.map(({ minimum, maximum }) => [minimum, maximum]), [[0, 3]]);
    for (const bad of [[], [-1], [4], [0, 1], [NaN], [0.5], Array<number>(1), Object.assign([0], { additional: true })])
      assert.throws(() => build(bad), { code: 'PARAMETER_CONSTRAINT' });
    const prompts = new Set(), signatures = new Set();
    const shape = build([0]).prompt.map(block => block.type);
    for (const index of indices) {
      const body = build([index]);
      assert.deepEqual(body, build([index]));
      assert.deepEqual(body.prompt.map(block => block.type), shape, source);
      assert.equal(rendered(body).length, 4);
      assert.equal(new Set(rendered(body)).size, 4);
      assert(body.explanation.length > 20);
      assert(rendered(body).includes(answerOf(body)));
      prompts.add(JSON.stringify(body.prompt.map(block => block.type === 'diagram' ? block.scene : block)));
      signatures.add(answerOf(body));
    }
    assert.equal(prompts.size, 4, source);
    assert.equal(signatures.size, 4, source);
  }
});

test('知識19系列の各候補の意味と真偽を独立査読と照合し、一つだけ正答となる', () => {
  const calculation = [28, 30, 33, 34, 35, 47, 48];
  assert.deepEqual(Object.keys(knowledgeFacts).map(Number), included.filter(number => !calculation.includes(number)));
  for (const [number, fact] of Object.entries(knowledgeFacts)) {
    assert(fact.rationale.length > 30);
    for (const index of indices) {
      const body = question(Number(number)).build([index]);
      const options = rendered(body);
      assert.match(statement(body), fact.query[index], number + ':' + index);
      const conditions = fact.choices[index];
      const winner = selection.indexOf(fact.trueChoice[index]);
      assert.equal(conditions.length, 4);
      for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
        assert.match(options[optionIndex], conditions[optionIndex], number + ':' + index + ':' + optionIndex);
        assert.equal(conditions[winner].test(options[optionIndex]), winner === optionIndex, number + ':' + index + ':' + optionIndex);
      }
      assert.equal(body.correctIndex, winner, number + ':' + index);
    }
  }
});

test('問28の印刷は一分刻みの参照解で初期状態、各台の累計、全選択肢の順を検算する', () => {
  const printed = [
    [15, 12, 11], [11, 12, 7], [8, 12, 10], [8, 9, 13],
  ];
  for (const index of indices) {
    const body = question(28).build([index]), input = statement(body);
    assert.match(input, /Aから順に空いている.*Cの次は再びA.*初期状態ではプリンタはすべて空いている/);
    const backlog = input.match(/出力待ちの順に，([\d，]+)（分）/)![1].split('，').map(Number);
    assert.equal(backlog.length, 6);
    const onDevice = Array<number>(3).fill(0), timePrinted = Array<number>(3).fill(0);
    for (let minute = 0; backlog.length > 0 || onDevice.some(Boolean); minute++) {
      assert(minute < 100);
      const empty = onDevice.flatMap((left, i) => left === 0 ? [i] : []);
      if (minute > 0 && backlog.length) assert(empty.length <= 1);
      for (const i of empty) if (backlog.length) onDevice[i] = backlog.shift()!;
      onDevice.forEach((left, i) => {
        if (left > 0) { timePrinted[i]++; onDevice[i]--; }
      });
    }
    assert.deepEqual(timePrinted, printed[index]);
    const valid = rendered(body).filter(option => {
      const amounts = option.split('，').map(label => timePrinted['ABC'.indexOf(label)]);
      return amounts[0] > amounts[1] && amounts[1] > amounts[2];
    });
    assert.deepEqual(valid, [answerOf(body)]);
    for (const [i, amount] of timePrinted.entries()) assert(body.explanation.includes('ABC'[i] + 'が' + amount + '分'));
  }
});

test('問30の木と5規則を保持し、POSIX経路の独立解で全移動列を確認する', async () => {
  const { posix } = await import('node:path');
  const targetList = ['/B/A/B', '/B/B/B', '/B', '/B/B'];
  for (const index of indices) {
    const body = question(30).build([index]);
    const rule = body.prompt.find(block => block.type === 'list');
    assert(rule?.type === 'list');
    assert.deepEqual(rule.items.map((item, i) => [/.+経路上.+/, /カレント.*“\.”/, /1階層上.*“\.\.”/,
      /始まり.*ルートディレクトリ/, /カレントディレクトリ配下.*“\.¥”/][i].test(item)), [true, true, true, true, true]);
    const goal = statement(body).match(/“([^”]+)”がカレント/)![1].replaceAll('¥', '/');
    assert.equal(goal, targetList[index]);
    const ends = rendered(body).map(option => option.split(' → ').reduce((cursor, command) => {
      const end = posix.resolve(cursor, command.replaceAll('¥', '/'));
      assert.match(end, /^(?:\/[AB]){0,3}$/);
      return end;
    }, '/A/A/B'));
    assert.deepEqual(ends, targetList);
    assert.deepEqual(ends.flatMap((end, i) => end === goal ? [i] : []), [body.correctIndex]);
    assert.match(diagram(body).block.alt, /ルート.*第3階層/);
  }
});

test('問33の尺度変更を全条件の正のMTBF・MTTRについて交差積で判定する', () => {
  for (const index of indices) {
    const body = question(33).build([index]);
    const [newBF, newTR] = index === 0 ? [3, 3] : [...statement(body).matchAll(/(\d\.\d)倍/g)].map(item => Number(item[1]) * 2);
    const options = rendered(body);
    const truth = options.map(option => [1, 2, 9, 14].every(x => [1, 3, 10, 11].every(y => {
      const original = x / (x + y), modified = newBF * x / (newBF * x + newTR * y);
      const sign = Math.sign(newBF * x * y - newTR * x * y);
      if (/同じ値|維持される/.test(option)) return sign === 0;
      if (/大きい値/.test(option)) return sign > 0;
      if (/小さい値/.test(option)) return sign < 0;
      if (/1\.5倍/.test(option)) return modified === original * 1.5;
      if (/2\/3倍/.test(option)) return modified === original * 2 / 3;
      assert.match(option, /平均故障間隔の倍率を掛けた値/);
      return modified === original * newBF / 2;
    })));
    assert.deepEqual(truth.flatMap((valid, i) => valid ? [i] : []), [body.correctIndex]);
    assert.match(body.explanation, /x／\(x＋y\)/);
  }
});

test('問34は3機器の8状態を総当たりし、原問の相関反例と選択肢の実現可能範囲も確認する', () => {
  for (const [index, up] of [8, 7, 9, 6].entries()) {
    const body = question(34).build([index]);
    const stem = statement(body);
    assert.match(stem, new RegExp('すべて0\\.' + up + '.*互いに独立'));
    const alternative = [
      (a: boolean, b: boolean, c: boolean) => a && b && c,
      (a: boolean, b: boolean, c: boolean) => (a || b) && c,
      (a: boolean, b: boolean, c: boolean) => (a && b) || c,
      (a: boolean, b: boolean, c: boolean) => a || b || c,
    ];
    const states = [true, false].flatMap(a => [true, false].flatMap(b => [true, false].map(c => [a, b, c] as const)));
    const values = alternative.map(logic => states.reduce((sum, state) => logic(...state) ?
      sum + state.reduce((mass, works) => mass * (works ? up : 10 - up), 1) : sum, 0) / 1000);
    assert.deepEqual(rendered(body).map(Number), values);
    assert.equal(values.filter(value => value === values[1]).length, 1);
    assert.equal(answerOf(body), values[1].toFixed(3));
    if (index === 0) {
      // All three devices can fail together with probability .2.
      const correlated = 0.8;
      assert.notEqual(correlated, values[1]);
      // A and C each up .8, so P(A ∩ C) ≥ .6; the system never works when C is down.
      assert.deepEqual(values.filter(value => value >= 0.6 && value <= 0.8), [0.768]);
      assert.match(body.explanation, /独立条件が明示されていない.*0\.8以下.*0\.6以上.*0\.768だけ/);
    }
  }
});

test('問35の復旧時間順を設備条件又は指定時間から比較し全順位を検算する', () => {
  for (const index of indices) {
    const body = question(35).build([index]);
    const stem = statement(body);
    const times: Record<string, number> = { 'ホットサイト': 1, 'ウォームサイト': 2, 'コールドサイト': 3 };
    if (index === 1) assert.match(stem, /時間が長い順/);
    if (index > 1) {
      assert.match(stem, /時間は[3各]サイトで等しい/);
      for (const label of Object.keys(times)) {
        const shown = stem.match(new RegExp(label + '(?:に|は)(?:[^，。]*?)([0-9]+)時間'))!;
        times[label] = Number(shown[1]);
      }
      assert.deepEqual(Object.values(times), index === 2 ? [2, 1, 5] : [18, 4, 7]);
    }
    const result = rendered(body).filter(option => {
      const [first, second, third] = option.split('，').map(site => times[site]);
      return index === 1 ? first > second && second > third : first < second && second < third;
    });
    assert.deepEqual(result, [answerOf(body)]);
  }
});

test('問47の三つの曲線を独立測定し、右端の未消化・検出・未解決の状態から選択肢を判定する', () => {
  const trendSignature = [[0, 0, 0], [0, -1, -1], [1, 0, 1], [1, -1, 0]];
  const options = [
    [/テストが進んでいない/, /消化実績が上がって/, /バグが多発/, /未解決バグがなくなった/],
    [/テストは止まって/, /新しいバグの検出はなくなり/, /バグが多発し/, /未解決バグが増えて/],
    [/新しいバグも検出されていない/, /未消化項目が減少/, /未消化テスト項目が減らず/, /未解決バグは0/],
    [/新しいテストは進んでいない/, /バグの検出は止まって/, /未解決バグも増えて/, /未解決バグは残っていない/],
  ];
  for (const index of indices) {
    const body = question(47).build([index]);
    const { block, scene } = diagram(body);
    const renderer = renderers.find(({ profile }) => profile === scene.profile)!;
    const svg = renderToStaticMarkup(createElement(renderer.component, { values: scene.values, caption: block.caption }));
    const geometricCurves = [...svg.matchAll(/<polyline data-series="([^"]+)" points="([^"]+)"/g)]
      .map(([, label, points]) => [label, points.split(' ').map(vertex => Number(vertex.split(',')[1]))] as const);
    assert.deepEqual(geometricCurves.map(([label]) => label), ['検出バグ数', '未消化テスト項目数', '未解決バグ数']);
    const slope = geometricCurves.map(([, points]) => Math.sign(points.at(-3)! - points.at(-1)!));
    assert.deepEqual(slope, trendSignature[index]);
    const solved = geometricCurves[2][1].at(-1) === 274;
    assert.equal(solved, index === 1 || index === 3);
    const matches = rendered(body).flatMap((choice, i) => options[index][i].test(choice) && i === trendSignature.findIndex(
      (signature, j) => signature.every((item, at) => item === slope[at]) && solved === (j === 1 || j === 3)) ? [i] : []);
    assert.deepEqual(matches, [body.correctIndex]);
  }
});

test('問48のA〜Hとダミーに従い独立した5経路を合計し、短縮範囲を照合する', () => {
  const paths = ['ABEG', 'ABEH', 'ACDEG', 'ACDEH', 'ACFH'];
  const dayTables = [[5,3,5,10,5,12,3,6], [4,5,6,9,4,12,4,5], [6,4,5,12,3,13,4,4], [4,3,6,8,5,9,4,7]];
  const change = [6,5,7,4];
  const schedules = [[31,28],[28,27],[30,28],[30,26]];
  for (const index of indices) {
    const body = question(48).build([index]);
    const { block } = diagram(body);
    const row = Array.from('ABCDEFGH', name => Number(block.alt.match(new RegExp(name + '（([0-9]+)日）'))![1]));
    assert.deepEqual(row, dayTables[index]);
    assert.match(block.alt, /Eの後の結節点からFの後の結節点へ，破線のダミー作業/);
    const shorter = Number(statement(body).match(/所要日数を(\d+)日間/)![1]);
    assert.equal(shorter, change[index]);
    const longest = (durations: number[]) => Math.max(...paths.map(path => [...path].reduce(
      (days, code) => days + durations['ABCDEFGH'.indexOf(code)], 0)));
    const old = longest(row), next = longest(row.map((day, i) => i === 3 ? shorter : day));
    assert.deepEqual([old, next], schedules[index]);
    assert.deepEqual(rendered(body), ['1', '2', '3', '4']);
    assert.equal(answerOf(body), String(old - next));
    assert.match(body.explanation, new RegExp(old + '日.*' + next + '日。差の' + (old - next) + '日'));
  }
});

test('問49は同じ完了数と工数配分でウ及びエとなる構成があり、配布対象から除く', () => {
  const whole = 6000, finishedCount = 1200, unfinishedCount = 1800;
  const progress = (finishedHours: number, unfinishedHours: number) => {
    assert.equal(finishedHours * finishedCount + unfinishedHours * unfinishedCount, whole);
    return 8 + 16 + 20 + 25 * finishedHours * finishedCount / whole;
  };
  assert.equal(progress(2, 2), 54);
  assert.equal(progress(3, 4 / 3), 59);
  assert.equal(question(49), undefined);
});

test('4種の登録図はaltと表示が一致し、全10図状態の構造を保持する', () => {
  assert.deepEqual(figures.map(({ profile }) => profile), renderers.map(({ profile }) => profile));
  let drawn = 0;
  for (const [number, states] of [[30, 1], [34, 1], [47, 4], [48, 4]]) for (let index = 0; index < states; index++) {
    const { block, scene } = diagram(question(number).build([index]));
    const figure = figures.find(({ profile }) => profile === scene.profile)!;
    const renderer = renderers.find(({ profile }) => profile === scene.profile)!;
    assert.match(scene.profile, new RegExp('^legacy-2007-autumn-am-' + number + '-'));
    assert.equal(figure.alt(scene.values), block.alt);
    assert.doesNotThrow(() => figure.validate(scene.values));
    assert.throws(() => figure.validate([4]), { code: 'FIGURE_PROFILE' });
    const svg = renderToStaticMarkup(createElement(renderer.component, { values: scene.values, caption: block.caption }));
    assert.match(svg, /class="diagram-scroll" tabindex="0"/);
    assert.match(svg, /role="img"/);
    assert(svg.includes(block.caption));
    assert(svg.includes(block.alt));
    if (number === 30) {
      assert.equal([...svg.matchAll(/<text /g)].length, 15);
      assert.equal([...svg.matchAll(/<line /g)].length, 14);
    }
    if (number === 34) assert.equal([...svg.matchAll(/<rect /g)].length, 3);
    if (number === 47) assert.equal([...svg.matchAll(/<polyline /g)].length, 3);
    if (number === 48) {
      assert.equal([...svg.matchAll(/<line /g)].length, 9);
      assert.match(svg, /data-activity="ダミー"[^>]+stroke-dasharray="4 4"/);
    }
    drawn++;
  }
  assert.equal(drawn, 10);
});
