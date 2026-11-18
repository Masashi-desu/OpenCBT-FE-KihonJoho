import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import type { Block } from '../../../src/core/types';
import { legacy2004AutumnAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2004-autumn-am-27-53';
import { legacy2004AutumnAm2753Figures as figures } from '../../../src/core/generators/legacy-2004-autumn-am-27-53-figures';
import { legacy2004AutumnAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2004AutumnAm2753Figures';
import { reviewedKnowledge } from '../../fixtures/legacy-2004-autumn-am-27-53-review';

const indexes = [0, 1, 2, 3];
const admitted = [27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 46, 47, 48, 49, 50, 51, 52, 53];
const key = 'イエウエウアエエアエウウエイウエアアアイウイエエ';
const all = (number: number) => indexes.map(index => definitions.find(definition => definition.source.endsWith('-' + number))!.build([index]));
const paragraph = (block: Block) => { assert(block.type === 'paragraph'); return block.text; };
const int = (text: string) => Number(text.replaceAll(',', ''));

function markup(diagram: Extract<Block, { type: 'diagram' }>) {
  assert(diagram.scene.kind === 'source_figure');
  const { profile, values } = diagram.scene;
  const renderer = renderers.find(row => row.profile === profile)!;
  return renderToStaticMarkup(createElement(renderer.component, { caption: diagram.caption, values }));
}

test('公式4択の24問と、各4条件における本文・図・解説の値を検査する', () => {
  assert.deepEqual(definitions.map(row => Number(row.source.split('-').at(-1))), admitted);
  assert.equal(definitions.map(row => row.sourceAnswer).join(''), key);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const definition of definitions) {
    const cases = indexes.map(index => definition.build([index]));
    assert.equal('アイウエ'[cases[0].correctIndex!], definition.sourceAnswer);
    const actual = cases.map(row => JSON.stringify(row.prompt.map(block => block.type === 'diagram' ? markup(block) : block)));
    assert.equal(new Set(actual).size, 4, definition.source);
    assert.equal(new Set(cases.map(row => row.explanation)).size, 4, definition.source);
    for (const body of cases) {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(option => JSON.stringify(option))).size, 4);
      for (const diagram of body.prompt.filter(block => block.type === 'diagram')) {
        assert(diagram.scene.kind === 'source_figure');
        const svg = markup(diagram);
        assert(svg.includes('role="img"') && svg.includes('aria-labelledby=') && svg.includes('aria-describedby='));
        assert(svg.includes('>' + diagram.caption + '</title>') && svg.includes('>' + diagram.alt + '</desc>'));
      }
    }
    for (const invalid of [[], [-1], [0.5], [4], [0, 1]]) assert.throws(() => definition.build(invalid));
  }
});

const includesClaim = (text: string, claim: string) => claim.startsWith('^') ? text.startsWith(claim.slice(1)) : text.includes(claim);
for (const [number, evidence] of Object.entries(reviewedKnowledge)) {
  test('問' + number + 'の4条件を固定査読資料で照合する', () => {
    for (const [i, row] of all(Number(number)).entries()) {
      const [stem, claims, accepted, explanation] = evidence[i];
      assert(paragraph(row.prompt[0]).includes(stem), stem);
      const roles = row.choices.map(choice => {
        const text = paragraph(choice[0]);
        const matched = claims.filter(claim => includesClaim(text, claim));
        assert.equal(matched.length, 1, text);
        return matched[0];
      });
      assert.deepEqual(new Set(roles), new Set(claims));
      assert.deepEqual(roles.flatMap((claim, index) => claim === accepted ? [index] : []), [row.correctIndex]);
      assert(row.explanation.includes(explanation), row.explanation);
    }
  });
}

test('問29: 画像の各行をビット数で集計し、転送速度と近似値の全候補を検算する', () => {
  for (const body of all(29)) {
    const [, speed, width, height, bitDepth] = /([\d,]+) Mバイト／秒.*?([\d,]+)×([\d,]+)画素.*1画素は(\d+)ビット/
      .exec(paragraph(body.prompt[0]))!;
    const bits = Array.from({ length: int(height) }, () => int(width) * Number(bitDepth)).reduce((sum, row) => sum + row, 0);
    const wireBits = Number(speed) * 8000000;
    const options = body.choices.map(choice => Number(paragraph(choice[0])));
    assert.deepEqual(options, [...options].sort((a,b) => a-b));
    assert.deepEqual(options.flatMap((option, i) => Math.abs(option * bits - wireBits) <= bits / 20 ? [i] : []), [body.correctIndex]);
    const plausibleMiscalculations = [wireBits / (bits * 8), Number(speed) / 3, wireBits / bits, wireBits * 3 / bits];
    assert(options.every((option, i) => Math.abs(option - plausibleMiscalculations[i]) <= 0.05001));
    assert(body.explanation.includes('＝約' + options[body.correctIndex!] + '枚／秒'));
  }
});

test('問38: 台数×日数の台日を延べ使用時間へ直し、各候補で許容故障数と最小値を検算する', () => {
  for (const row of all(38)) {
    const [, hosts, days, maximum, daily] = /([\d,]+)台のパソコン.*?(\d+)日間で(\d+)台以下.*?1日(\d+)時間/
      .exec(paragraph(row.prompt[0]))!;
    const fleet = Array(Number(days)).fill(int(hosts) * Number(daily)).reduce((sum, day) => sum + day, 0);
    const options = row.choices.map(option => int(paragraph(option[0])));
    const eligible = options.filter(hours => fleet / hours <= Number(maximum));
    assert.equal(Math.min(...eligible), options[row.correctIndex!]);
    const minimum = options[row.correctIndex!];
    assert.equal(fleet, minimum * Number(maximum));
    assert(fleet / (minimum - 1) > Number(maximum));
    assert.deepEqual(options, [int(hosts) * Number(daily), int(hosts) * Number(days), minimum, fleet]);
    assert(row.explanation.includes(minimum.toLocaleString('en-US') + '時間以上'));
  }
});

test('問44: 整数の各行数で方式別時間を比較し、短くなる最初の行と全候補を照合する', () => {
  for (const row of all(44)) {
    const params = [...paragraph(row.prompt[1]).matchAll(/(\d*\.\d+)秒/g)];
    assert.equal(params.length, 4);
    const [interpreter, run, build, extra] = params.map(match => Number(match[1].replace(/^0\./, '').padEnd(3, '0')));
    const shorter = (lines: number) => (run + build) * lines + extra * 100 < interpreter * lines;
    const first = Array.from({ length: 1000 }, (_, i) => i + 1).find(shorter)!;
    const values = row.choices.map(choice => int(paragraph(choice[0])));
    assert.deepEqual(values.flatMap((value, index) => shorter(value) && !shorter(value - 1) ? [index] : []), [row.correctIndex]);
    assert.equal(values[row.correctIndex!], first);
    assert.equal(new Set(values).size, 4);
    assert(values.slice(1).every((value, i) => value - values[i] >= 15));
    assert.match(row.explanation, new RegExp(first + '行'));
  }
});

function readSpreadsheet(listing: string) {
  const lines = listing.split('\n');
  const input = lines.shift()!.split('：')[1];
  assert(input.endsWith(' Cᵣ'));
  const matrix = input.slice(0, -3).split(' Cᵣ ').map(row => row.split(',').map(Number));
  assert.deepEqual(matrix.map(row => row.length), [3, 3, 3]);
  const cells = new Map<string, number>();
  let row = 1;
  for (const line of matrix) {
    let column = 'A'.charCodeAt(0);
    for (const value of line) cells.set(String.fromCharCode(column++) + row, value);
    row++;
  }
  const formulas = new Map(lines.map(line => {
    const [, address, first, second] = /^セル(D[123])の計算式：([A-D][123])\+([A-D][123])$/.exec(line)!;
    return [address, [first, second]];
  }));
  assert.deepEqual([...formulas.keys()], ['D1', 'D2', 'D3']);
  const apply = (change?: [string, number]) => {
    const result = new Map(cells);
    if (change) result.set(...change);
    for (const address of ['D1', 'D2', 'D3']) {
      const [first, second] = formulas.get(address)!;
      const a = result.get(first), b = result.get(second);
      assert(a !== undefined && b !== undefined);
      result.set(address, a + b);
    }
    return ['D1', 'D2', 'D3'].map(address => result.get(address)!);
  };
  return { apply, cells, formulas };
}

test('問46: CSVの行・列、セル参照、付録の再計算順、変更時の伝播と全候補を照合する', () => {
  for (const [index, row] of all(46).entries()) {
    const [stem, listing, sheet] = row.prompt;
    assert(paragraph(stem).includes('左端のセルから順に格納') && paragraph(stem).includes('直ちにほかのセルの再計算'));
    assert(listing.type === 'code' && sheet.type === 'diagram');
    const context = row.contexts?.[0];
    assert.equal(context?.title, '表計算ソフトの機能・用語');
    const rules = context!.blocks.map(paragraph).join('\n');
    assert.match(rules, /B2はB列2行目/);
    assert.match(rules, /カンマで一列右.*Cᵣが現れると次の行のA列/);
    assert.match(rules, /上から下へ一度ずつ.*D1、D2、D3の順/);
    const { apply, cells, formulas } = readSpreadsheet(listing.text);
    const [first, second, total] = apply();
    if (index === 0) {
      assert.deepEqual([...cells.values()], [2,2,4,1,3,4,2,1,1]);
      assert.deepEqual([first, second, total], [3,3,6]);
    }
    const options = row.choices.map(option => int(paragraph(option[0])));
    assert.deepEqual(options, [6, 7, 8, 9]);
    assert.deepEqual(options.flatMap((option, at) => option === total ? [at] : []), [row.correctIndex]);
    assert(row.explanation.includes('＝' + total + 'を表示'));
    assert(markup(sheet).includes('data-target="D3"'));
    for (const [address, value] of cells) {
      const firstCount = formulas.get('D1')!.filter(ref => ref === address).length;
      const secondCount = formulas.get('D2')!.filter(ref => ref === address).length;
      assert.deepEqual(apply([address, value + 7]), [first + 7 * firstCount, second + 7 * secondCount, total + 7 * (firstCount + secondCount)]);
    }
  }
});

test('問49: 図の四つの多重度から、教師・クラス・教室の全肢の成立を照合する', () => {
  for (const [variant, body] of all(49).entries()) {
    const graph = body.prompt[1];
    assert(graph.type === 'diagram');
    const svg = markup(graph);
    const a = svg.split('data-model="a"')[1].split('data-model="b"')[0];
    const b = svg.split('data-model="b"')[1];
    const relations = (figure: string) => [...figure.matchAll(/data-link="([01])" data-left="([1*])" data-right="([1*])"/g)]
      .map(([, , left, right]) => [left, right]);
    assert.deepEqual(relations(a), [['1','1'], ['1','1']]);
    const [[teacherForClass, classForTeacher], [classForRoom, roomForClass]] = relations(b);
    const [p, q, r, s] = body.choices.map(option => paragraph(option[0]));
    assert.match(q, /複数のクラスを担当/);
    assert.match(r, /クラスに複数の教室/);
    assert.match(s, /クラスを複数の教師/);
    const byTeacherAndRoom = classForTeacher === '1' || classForRoom === '1';
    const byTeacher = classForTeacher === '1';
    const first = variant === 0 ? byTeacherAndRoom : p.includes('特定できない') ? !byTeacher : byTeacher;
    const truth = [first, classForTeacher === '*', roomForClass === '*', teacherForClass === '*'];
    assert.deepEqual(truth.flatMap((answer, position) => answer ? [position] : []), [body.correctIndex]);
    assert(graph.alt.includes('教師 ' + teacherForClass + '―' + classForTeacher + ' クラス'));
  }
});
