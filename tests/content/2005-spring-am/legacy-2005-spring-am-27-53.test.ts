import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import { legacy2005SpringAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2005-spring-am-27-53';
import { legacy2005SpringAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2005SpringAm2753Figures';
import { reviewedKnowledge } from '../../fixtures/legacy-2005-spring-am-27-53-review';

const indexes = [0, 1, 2, 3];
const key = 'エウウアエイエイウエイエイエエアエウイエウアエウ';
const admitted = [27, 28, 29, 30, 31, 32, 33, 35, 36, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53];
const all = (number: number) => indexes.map(index => definitions.find(definition => definition.source.endsWith('-' + number))!.build([index]));
const paragraph = (block: Block) => { assert(block.type === 'paragraph'); return block.text; };

function rendered(block: Extract<Block, { type: 'diagram' }>) {
  assert(block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const component = renderers.find(renderer => renderer.profile === profile)!.component;
  return renderToStaticMarkup(createElement(component, { caption: block.caption, values }));
}

test('公式キーの24問・4択を保持し、4条件の本文・表・図と解説に差がある', () => {
  assert.deepEqual(definitions.map(row => Number(row.source.split('-').at(-1))), admitted);
  assert.equal(definitions.map(row => row.sourceAnswer).join(''), key);
  for (const definition of definitions) {
    const cases = indexes.map(index => definition.build([index]));
    assert.equal('アイウエ'[cases[0].correctIndex!], definition.sourceAnswer);
    const display = cases.map(row => JSON.stringify(row.prompt.map(block => {
      if (block.type === 'diagram') {
        assert(block.scene.kind === 'source_figure');
        return rendered(block);
      }
      return block;
    })));
    assert.equal(new Set(display).size, 4, definition.source);
    assert.equal(new Set(cases.map(row => row.explanation)).size, 4, definition.source);
    for (const row of cases) {
      assert.equal(row.choices.length, 4);
      assert.equal(new Set(row.choices.map(choice => JSON.stringify(choice))).size, 4);
    }
    for (const invalid of [[], [-1], [0.5], [4], [0, 1]]) assert.throws(() => definition.build(invalid));
  }
});

for (const [number, cases] of Object.entries(reviewedKnowledge)) {
  test('問' + number + 'の4条件を固定査読資料で照合する', () => {
    for (const [i, row] of all(Number(number)).entries()) {
      const evidence = cases[i];
      assert(paragraph(row.prompt[0]).includes(evidence.stem), evidence.stem);
      const choices = row.choices.map(choice => paragraph(choice[0]));
      const roles = choices.map(text => {
        const matched = evidence.claims.filter(claim => text.includes(claim));
        assert.deepEqual(matched.length, 1, text);
        return matched[0];
      });
      assert.deepEqual(new Set(roles), new Set(evidence.claims));
      const valid = roles.flatMap((role, at) => role === evidence.valid ? [at] : []);
      assert.deepEqual(valid, [row.correctIndex]);
      assert(row.explanation.includes(evidence.explanation), row.explanation);
    }
  });
}

test('問30: 4組の検索結果をレコード集合で構成し、候補をすべて逆順の適用結果と照合する', () => {
  for (const row of all(30)) {
    const stem = paragraph(row.prompt[0]);
    const [, first, retained, second] = /検索結果は([\d,]+)件.*その(\d+)％.*検索した結果が([\d,]+)件/.exec(stem)!;
    const [a, percent, b] = [first, retained, second].map(text => Number(text.replaceAll(',', '')));
    const passesA = new Set(Array.from({ length: a }, (_, i) => i));
    const shared = a / 100 * percent;
    const result = new Set(Array.from({ length: b }, (_, i) => a - shared + i));
    const count = [...result].filter(id => passesA.has(id)).length;
    const options = row.choices.map(choice => Number(paragraph(choice[0])));
    assert.deepEqual(options, [15, 30, 35, 60]);
    assert.deepEqual(options.flatMap((percent, index) => percent * result.size === count * 100 ? [index] : []), [row.correctIndex]);
    assert(row.explanation.includes(count.toLocaleString('en-US') + '件'));
  }
});

test('問35: 最終オクテットを全列挙し、サブネットの先頭・末尾を除外して全候補を検算する', () => {
  for (const row of all(35)) {
    const mask = Number(/255\.255\.255\.(\d+)/.exec(paragraph(row.prompt[0]))![1]);
    const network = 0xa7 & mask;
    const sameNetwork = Array.from({ length: 256 }, (_, ip) => ip).filter(ip => (ip & mask) === network);
    const usable = sameNetwork.slice(1, -1).length;
    const options = row.choices.map(choice => Number(paragraph(choice[0])));
    assert.deepEqual(options, Array.from({ length: 4 }, (_, index) => sameNetwork.length - 3 + index));
    assert.deepEqual(options.flatMap((option, index) => option === usable ? [index] : []), [row.correctIndex]);
    assert(row.explanation.endsWith(usable + '個。'));
  }
});

type Fraction = readonly [bigint, bigint];
function evalCellFormula(formula: string, cells: ReadonlyMap<string, Fraction>): Fraction {
  const tokens = formula.match(/[A-Z]\d+|\d+|[()+*/]/g)!;
  assert.equal(tokens.join(''), formula);
  function factor(): Fraction {
    const token = tokens.shift()!;
    if (token === '(') {
      const value = addition();
      assert.equal(tokens.shift(), ')');
      return value;
    }
    return cells.get(token) ?? [BigInt(token), 1n];
  }
  function product(): Fraction {
    let [n, d] = factor();
    while (tokens[0] === '*' || tokens[0] === '/') {
      const op = tokens.shift();
      const [a, b] = factor();
      n *= op === '*' ? a : b;
      d *= op === '*' ? b : a;
    }
    return [n, d];
  }
  function addition(): Fraction {
    let [n, d] = product();
    while (tokens[0] === '+') {
      tokens.shift();
      const [a, b] = product();
      n = n * b + a * d;
      d *= b;
    }
    return [n, d];
  }
  const value = addition();
  assert.equal(tokens.length, 0);
  return value;
}

test('問39: 付録の複写・優先順位・セル番地に従って、全式を全作業行へ代入する', () => {
  for (const row of all(39)) {
    const [statement, sheet] = row.prompt;
    assert(sheet.type === 'table');
    const context = row.contexts?.[0];
    assert.equal(context?.title, '表計算ソフトの機能・用語');
    const rules = context!.blocks.map(paragraph).join('\n');
    assert.match(rules, /C4は列Cの4行目/);
    assert.match(rules, /括弧内を先に計算し.*乗算・除算を加算より先に/);
    assert.match(rules, /列はそのままで行番号が1増える.*D5.*A5/);
    assert.deepEqual(sheet.columns, ['', 'A', 'B', 'C', 'D', 'E']);
    const [, weighted, multiple] = /“([^”]+)”には(\d+)/.exec(paragraph(statement))!;
    const column = sheet.rows[0].indexOf(weighted);
    assert(column >= 2 && column <= 4);
    const expected = sheet.rows.slice(1, 4).map((items, i) => {
      assert.equal(items[0], String(i + 2));
      assert.equal(items.at(-1), '');
      const minutes = items.slice(2, 5).map(value => BigInt(value.replace('.', '')));
      const samples = minutes.flatMap((value, slot) => Array(slot === column - 2 ? Number(multiple) : 1).fill(value));
      return {
        readonly: new Map(minutes.map((value, slot) => ['BCD'[slot] + items[0], [value, 10n] as Fraction])),
        average: [samples.reduce((sum, next) => sum + next, 0n), BigInt(10 * samples.length)] as Fraction,
      };
    });
    const formulas = row.choices.map(option => paragraph(option[0]));
    const copied = (formula: string, n: number) => formula.replace(/([A-Z])(\d+)/g, (_, col: string, at: string) => col + (Number(at) + n));
    for (const [i, { readonly: cells, average: [n, d] }] of expected.entries()) {
      const actual = formulas.flatMap((formula, index) => {
        const [a, b] = evalCellFormula(copied(formula, i), cells);
        return a * d === b * n ? [index] : [];
      });
      assert.deepEqual(actual, [row.correctIndex]);
    }
    assert(row.explanation.includes(copied(formulas[row.correctIndex!], 1)));
  }
});

test('問41: 実SVGの矢印から一対多・多対多を読み、4つの記述の成立を検算する', () => {
  for (const [i, row] of all(41).entries()) {
    const graph = row.prompt[1];
    assert(graph.type === 'diagram');
    const markup = rendered(graph);
    const lines = [...markup.matchAll(/<path[^>]*data-from="([^"]+)" data-to="([^"]+)" data-cardinality="([^"]+)"[^>]*>/g)];
    assert.equal(lines.length, i === 3 ? 9 : 8);
    assert(lines.every(([path, , , type]) => path.includes('marker-end=') && path.includes('marker-start=') === (type === 'many-many')));
    const oneParent = (parent: string, child: string) =>
      lines.some(([, start, end, type]) => start === parent && end === child && type === 'one-many');
    const [a, b, c, d] = row.choices.map(choice => paragraph(choice[0]));
    assert.match(a, /同一の商品は一つの仕入先/);
    assert.match(c, /一つの発注で複数種類の商品/);
    assert.match(d, /一つの発注で複数の仕入先/);
    const oneLineIndicated = b.includes('必ず一つの発注明細') && oneParent('発注明細', '納品明細');
    const exactOneToOne = b.includes('1対1') && oneParent('発注明細', '納品明細') && oneParent('納品明細', '発注明細');
    const truth = [oneParent('仕入先', '商品'), oneLineIndicated || exactOneToOne,
      oneParent('発注明細', '発注') && oneParent('商品', '発注明細'), oneParent('仕入先', '発注')];
    assert.deepEqual(truth.flatMap((valid, position) => valid ? [position] : []), [row.correctIndex]);
    assert(markup.includes('<title') && markup.includes('<desc') && markup.includes('aria-describedby=') && markup.includes('n≧0') && markup.includes('m≧0'));
  }
});

test('問45: 描画された三系列の終盤区間から4候補と横ばい・未解決の数を照合する', () => {
  for (const row of all(45)) {
    const graph = row.prompt[1];
    assert(graph.type === 'diagram');
    const markup = rendered(graph);
    const series = Object.fromEntries([...markup.matchAll(/data-series="([^"]+)" data-counts="([0-9,]+)"/g)]
      .map(([, name, values]) => [name, values.split(',').map(Number)]));
    assert.deepEqual(Object.keys(series), ['detected', 'untested', 'unresolved']);
    const differences = (line: number[]) => line.slice(-2).map((point, i) => point - line[line.length - 3 + i]);
    const [detected, untested, unresolved] = [series.detected, series.untested, series.unresolved].map(differences);
    const finalOpen = series.unresolved.at(-1)!;
    const finalTests = series.untested.at(-1)!;
    const noChange = (line: number[]) => line.every(value => value === 0);
    const [a,b,c,d] = row.choices.map(choice => paragraph(choice[0]));
    assert.match(a, /テストが進んでいない/);
    assert.match(b, /テスト項目の消化.*バグ/);
    assert.match(c, /バグが多発し/);
    assert.match(d, /未解決バグがなくなった/);
    const truth = [
      [detected, untested, unresolved].every(noChange) && finalOpen > 0 && finalTests > 0,
      noChange(detected) && untested.every(delta => delta < 0),
      detected.every(delta => delta > 0) && noChange(untested),
      detected.every((delta, i) => delta > 0 && delta === -untested[i]) && finalOpen === 0,
    ];
    assert.deepEqual(truth.flatMap((valid, position) => valid ? [position] : []), [row.correctIndex]);
    assert(markup.includes('<title') && markup.includes('<desc') && markup.includes('aria-describedby='));
  }
});

test('問53: 送信グループを1時間分列挙し、4候補の単位とヘッダ追加回数を照合する', () => {
  for (const row of all(53)) {
    const tokens = /([\d,]+)バイト／件.*?(\d+)件ごとに.*?(\d+)バイトのヘッダ.*?1時間に平均([\d,]+)件.*?([\d,]+)ビット／秒/.exec(paragraph(row.prompt[0]))!;
    const [ticket, bundle, header, count, speed] = tokens.slice(1).map(text => Number(text.replaceAll(',', '')));
    const groups = { actual: 0, noHeader: 0, headerPerTicket: 0 };
    for (let after = bundle; after <= count; after += bundle) {
      groups.actual += header;
      for (let j = 0; j < bundle; j++) {
        groups.actual += ticket;
        groups.noHeader += ticket;
        groups.headerPerTicket += header + ticket;
      }
    }
    assert.equal(count % bundle, 0);
    const capacity = speed * 3600;
    const options = row.choices.map(option => Number(paragraph(option[0])));
    const bytesAsBits = groups.actual * 100;
    assert.deepEqual(options.map(value => value * capacity), [
      bytesAsBits, groups.noHeader * 800, groups.actual * 800, groups.headerPerTicket * 800,
    ]);
    assert.deepEqual(options.flatMap((value, index) => value * capacity === groups.actual * 800 ? [index] : []), [row.correctIndex]);
    assert(row.explanation.includes(groups.actual.toLocaleString('en-US') + 'バイト'));
  }
});
