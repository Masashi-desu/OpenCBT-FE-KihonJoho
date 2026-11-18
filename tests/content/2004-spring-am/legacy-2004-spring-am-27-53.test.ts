import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2004SpringAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2004-spring-am-27-53';
import { original } from '../../../src/core/generators/legacy-2004-spring-am-27-53-shared';
import { legacy2004SpringAm2753Figures as figures } from '../../../src/core/generators/legacy-2004-spring-am-27-53-figures';
import { legacy2004SpringAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2004SpringAm2753Figures';
import { reviewedKnowledge } from '../../fixtures/legacy-2004-spring-am-27-53-review';

const cases = [0, 1, 2, 3];
const letter = 'アイウエ';
const held = [39, 46, 49, 53];
const sourceAnswers = 'エエエエウエウエアイウイイウウアアアエアイエウアウウア';
const definition = (number: number) => definitions.find(entry => entry.source === '2004h16h-fe-am-' + number)!;
const read = (body: GeneratedBody) => body.choices.map(blocks => {
  assert(blocks.length === 1 && blocks[0].type === 'paragraph');
  return blocks[0].text;
});
const stem = (body: GeneratedBody) => {
  const [first] = body.prompt;
  assert(first.type === 'paragraph');
  return first.text;
};

test('原題番号、公式正答、四肢、4条件と無効な入力域を確認する', () => {
  const target = Array.from({ length: 27 }, (_, i) => i + 27).filter(number => !held.includes(number));
  assert.deepEqual(definitions.map(entry => Number(entry.source.split('-').at(-1))), target);
  for (const number of target) {
    const spec = definition(number), all = cases.map(index => spec.build([index]));
    assert.equal(spec.sourceAnswer, sourceAnswers[number - 27], String(number));
    assert.equal(letter[all[0].correctIndex!], spec.sourceAnswer, String(number));
    assert.equal(stem(all[0]), original(number).prompt);
    assert.deepEqual(read(all[0]), original(number).choices);
    assert.equal(new Set(all.map(body => JSON.stringify(body.prompt))).size, 4, String(number));
    assert.equal(new Set(all.map(body => body.explanation)).size, 4, String(number));
    for (const body of all) {
      assert.equal(read(body).length, 4);
      assert.equal(new Set(read(body)).size, 4);
      assert([0, 1, 2, 3].includes(body.correctIndex!));
    }
    for (const input of [[], [-1], [4], [1, 2], [0.5]]) assert.throws(() => spec.build(input));
  }
});

for (const [number, evidence] of Object.entries(reviewedKnowledge)) {
  test('問' + number + 'の四条件で確認済みの四肢と正答を保つ', () => {
    const spec = definition(Number(number));
    for (const [index, [promptFact, claims, correctPosition, reason]] of evidence.entries()) {
      const body = spec.build([index]), choices = read(body);
      assert.match(stem(body), new RegExp(promptFact));
      for (const [position, claim] of claims.entries())
        assert.match(choices[position], new RegExp(claim), number + '-' + index + '-' + position);
      const sufficient = choices.filter((_choice, position) => position === correctPosition);
      assert.deepEqual(sufficient, [choices[body.correctIndex!]]);
      assert(body.explanation.includes(reason), reason);
    }
  });
}

test('問34の円記号の経路を、親参照を持つ別実装で一段ずつたどる', () => {
  const children: Record<string, string[]> = {
    '¥': ['A', 'B'], '¥A': ['A', 'B'], '¥B': ['A', 'B'], '¥A¥A': ['A'], '¥A¥B': ['A', 'B'],
  };
  const expected = ['¥B¥A', '¥A', '¥A¥A', '¥A¥B¥A'];
  for (const index of cases) {
    const body = definition(34).build([index]);
    const text = stem(body);
    assert(text.includes('“¥”で区切って指定') && text.includes('“.”で表す') && text.includes('“..”で表す'));
    const moves = /カレントディレクトリを ([¥AB. →]+) の順/.exec(text)![1].split(' → ');
    assert(moves[0].startsWith('¥'));
    assert.equal(moves.length, 4);
    let current = '¥B';
    for (const move of moves) {
      const absolute = move.startsWith('¥');
      if (absolute) current = '¥';
      for (const component of (absolute ? move.slice(1) : move).split('¥')) {
        if (component === '..') {
          current = current.substring(0, current.lastIndexOf('¥')) || '¥';
        } else if (component !== '.') {
          assert(children[current]?.includes(component));
          current += (current === '¥' ? '' : '¥') + component;
        }
      }
    }
    const options = read(body);
    assert.equal(current, expected[index]);
    assert.deepEqual(options.filter(choice => choice === current), [options[body.correctIndex!]]);
    assert(body.explanation.includes('最終位置は ' + current));
  }
});

test('問37の月別遊休時間を時間単位の運転記録に展開し、四つの率を照合する', () => {
  const expected = [56, 45, 68, 76];
  for (const index of cases) {
    const body = definition(37).build([index]), table = body.prompt[1];
    assert(table.type === 'table');
    assert.deepEqual(table.columns, ['月', '使用率（％）', '遊休時間の合計（時間）']);
    let used = 0, elapsed = 0;
    for (const [month, use, idle] of table.rows.map(row => row.map(Number))) {
      assert(month >= 1 && month <= 12 && use % 10 === 0 && use < 100 && idle > 0);
      let remains = idle, hour = 0;
      while (remains > 0) {
        if (hour++ % 10 < use / 10) used++;
        else remains--;
        elapsed++;
      }
      assert.equal(hour % 10, 0);
    }
    const choices = read(body).map(Number), rate = 100 * used / elapsed;
    assert.equal(rate, expected[index]);
    assert.deepEqual(choices.filter(choice => choice === rate), [choices[body.correctIndex!]]);
    assert.deepEqual(choices, [...choices].sort((a, b) => a - b));
    assert(body.explanation.includes(used + '÷' + elapsed + '×100＝' + rate));
  }
});

test('問38の全四候補に実件数を掛け、処理量が増えても時間が延びない境界を検算する', () => {
  const expected = [60, 75, 40, 90];
  for (const index of cases) {
    const body = definition(38).build([index]), text = stem(body);
    const [, steps, access] = /(\d+)万ステップと磁気ディスクへの入出力(\d+)回/.exec(text)!;
    const micros = /1ステップ当たり(?:平均)?(\d+)マイクロ秒/.exec(text)![1];
    const latency = /入出力は1回(?:当たり)?(\d+)ミリ秒/.exec(text)![1];
    const diskRatio = /入出力時間[がは]現在の(\d+)％/.exec(text)![1];
    const growth = /件数は現在の(\d+)％/.exec(text)![1];
    const cpuPerJob = BigInt(steps) * 10000n * BigInt(micros);
    const diskPerJob = BigInt(access) * BigInt(latency) * 1000n;
    const before = 100n * (cpuPerJob + diskPerJob);
    const after = (candidate: number) =>
      (cpuPerJob * BigInt(candidate) + diskPerJob * BigInt(diskRatio)) * BigInt(growth) / 100n;
    const options = read(body).map(Number);
    const maximal = expected[index];
    assert.equal(after(maximal), before);
    assert(after(maximal - 1) < before && after(maximal + 1) > before);
    assert.deepEqual(options.filter(option => after(option) === before), [options[body.correctIndex!]]);
    assert.deepEqual(options, [...options].sort((a, b) => a - b));
    assert(body.explanation.includes('＝' + maximal + '％'));
  }
});

test('問41の四つの参照候補をすべての常駐経路と照合する', () => {
  const correct = ['F→A', 'B→C', 'D→E', 'G→A'];
  const expected = [
    ['B→C', 'C→D', 'F→A', 'G→F'], ['B→C', 'E→D', 'F→E', 'G→F'],
    ['E→B', 'D→E', 'F→D', 'G→F'], ['D→C', 'C→E', 'F→C', 'G→A'],
  ];
  for (const index of cases) {
    const body = definition(41).build([index]), options = read(body);
    const [main, first, second, low, other] = ['ABCDE', 'ACEBD', 'AEBCD', 'ADCBE'][index];
    const ways = [main, main + first, main + second, main + first + low, main + first + other];
    const samples = ways.flatMap(loaded => [loaded, loaded + 'F', loaded + 'G']);
    assert.deepEqual(options, expected[index]);
    const valid = options.filter(option => {
      const [from, to] = option.split('→');
      return !samples.some(state => state.includes(from) && !state.includes(to));
    });
    assert.deepEqual(valid, [correct[index]]);
    assert.deepEqual(valid, [options[body.correctIndex!]]);
    assert(body.explanation.includes(correct[index]));
  }
});

test('問50の図に記法の要素を描き、四択で一つに定まる', () => {
  const renderer = renderers.find(entry => entry.profile.endsWith('-diagram-notation'))!;
  const expected = ['DFD', '状態遷移図', '流れ図', 'ペトリネット'];
  const renderedEvidence = [
    { arity: 0, required: ['顧客マスタ', '商品マスタ', '受注伝票', '出荷済報告書'] },
    { arity: 3, required: ['待機', '計測中', '一時停止', '再開'] },
    { arity: 2, required: ['数量を読む', '合計へ加算', 'はい', 'いいえ'] },
    { arity: 0, required: ['部品A', '部品B', '完成', 'r="4"'] },
  ];
  for (const index of cases) {
    const body = definition(50).build([index]), options = read(body);
    assert.deepEqual(options, expected);
    const markup = renderToStaticMarkup(createElement(renderer.component, { caption: '表記法の図', values: [index] }));
    const { arity, required } = renderedEvidence[index];
    assert.equal([...markup.matchAll(/rx="18"/g)].length, arity);
    assert(required.every(keyword => markup.includes(keyword)));
    const explanations = options.filter(option => body.explanation.includes(option + 'の表記') || body.explanation.includes(option + 'である'));
    assert.deepEqual(explanations, [expected[index]]);
    assert.deepEqual(explanations, [options[body.correctIndex!]]);
  }
});

test('すべてのSVG図に条件別のtitle・descとキーボードで使用可能なスクロール要素を設ける', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const number of [34, 41, 50]) for (const index of cases) {
    const body = definition(number).build([index]), figure = body.prompt[1];
    assert(figure.type === 'diagram' && figure.scene.kind === 'source_figure');
    const { profile, values } = figure.scene;
    const renderer = renderers.find(entry => entry.profile === profile)!;
    assert.equal(figures.find(entry => entry.profile === profile)!.alt(values), figure.alt);
    const markup = renderToStaticMarkup(createElement(renderer.component, { caption: figure.caption, values }));
    assert(markup.includes('role="img"') && markup.includes('aria-labelledby=') && markup.includes('aria-describedby='));
    assert(markup.includes('>' + figure.caption + '</title>') && markup.includes('>' + figure.alt + '</desc>'));
    assert(markup.includes('tabindex="0"') || markup.includes('tabIndex="0"'));
  }
});
