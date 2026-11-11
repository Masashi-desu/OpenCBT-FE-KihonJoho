import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2010PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2010-spring-pm-09-13';
import { legacy2010SpringPm0913Figures as figures } from '../../../src/core/generators/legacy-2010-spring-pm-09-13-figures';
import { legacy2010SpringPm0913FigureRenderers as renderers } from '../../../src/ui/Legacy2010SpringPm0913Figures';
import { compileCasl, expectedFloat, runCasl } from '../../fixtures/legacy-2010-spring-pm-casl-oracle';
import { evaluate, sheetFromAlt } from '../../fixtures/legacy-2010-spring-pm-sheet-oracle';

const official = ['エイイエカアウ', 'イアイオウエイ', 'オウイウイウア', 'ウエカイアカ', 'オクアウカアク'];
const ranges = [[48, 54], [55, 60], [61, 66], [67, 70], [71, 79]];
const uniqueOptions = [40, 25, 29, 36, 40];
const optionReferences = [40, 41, 33, 36, 58];
const letters = 'アイウエオカキクケコ';
const inputCases = [0, 1, 2, 3];

const text = (block: Block) => {
  if (block.type === 'paragraph' || block.type === 'code') return block.text;
  if (block.type === 'diagram') return block.alt;
  return '';
};
const prompt = (body: GeneratedBody) => body.prompt.map(text).join('\n');
function options(body: GeneratedBody, field: string) {
  const part = body.answerParts!.find(part => part.id === 'part-' + field);
  assert.ok(part?.choiceIds);
  const choices = part.choiceIds.map(id => body.choices[Number(id.split('-').at(-1)) - 1].map(text).join('\n'));
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === part.id);
  assert.ok(answer?.kind === 'choice');
  return { choices, answer: part.choiceIds.indexOf(answer.choiceId) };
}
function selects(body: GeneratedBody, field: string, check: (candidate: string) => boolean) {
  const { choices, answer } = options(body, field);
  const evaluated = choices.map(choice => { try { return check(choice); } catch { return false; } });
  assert.deepEqual(evaluated.flatMap((truth, i) => truth ? [i] : []), [answer], `field ${field}\n${choices.join('\n')}`);
}
function panel(body: GeneratedBody, suffix: string) {
  const figure = body.prompt.find(block => block.type === 'diagram' && block.id.endsWith('-' + suffix));
  assert.ok(figure?.type === 'diagram', suffix);
  return figure.alt;
}

for (const [i, { definition, original, originalPageAlt }] of drafts.entries()) {
  test(`問${i + 9}は公式全頁と解答欄・選択肢を保持し，各入力を再現する`, () => {
    const [first, last] = ranges[i];
    const pages = originalPageAlt();
    assert.deepEqual(Object.keys(pages).map(Number), Array.from({ length: last - first + 1 }, (_, n) => first + n));
    assert.ok(Object.values(pages).every(alt => [...alt].length > 100 && [...alt].length <= 2000));
    const reference = original();
    assert.equal(reference.answerParts!.map(part => letters[options(reference, part.id.slice(5)).answer]).join(''), official[i]);
    assert.deepEqual(reference.answerParts!.map(part => part.id.slice(5)), [...['abcdefg', 'ab2cdef', 'abcdefg', 'abcde2', 'abcdefg'][i]]);
    for (const bad of [[], [0, 1], [-1], [4], [0.5], [NaN], [Infinity]]) assert.throws(() => definition.build(bad));
    const variations = inputCases.map(index => definition.build([index]));
    assert.equal(new Set(variations.map(prompt)).size, inputCases.length);
    for (const [index, body] of variations.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.equal(body.choices.length, uniqueOptions[i]);
      assert.equal(body.answerParts!.flatMap(part => part.choiceIds!).length, optionReferences[i]);
      assert.equal(body.answerParts!.length, official[i].length);
      assert.ok(body.explanation.length > 140);
    }
  });
}

const expression = (text: string, names: string[], values: unknown[]) => Function(...names, 'return (' + text + ');')(...values);
const compare = (op: string, a: number, b: number) => {
  switch (op) {
    case '<': return a < b;
    case '<=': return a <= b;
    case '=': return a === b;
    case '>': return a > b;
    case '>=': return a >= b;
  }
  throw Error(op);
};

for (const index of inputCases) {
  test(`問9 C：行幅と辞書の境界で全択を検算（${index}）`, () => {
    const body = drafts[0].definition.build([index]);
    const wording = prompt(body);
    const columns = Number(wording.match(/#define COLUMNS (\d+)/)?.[1]);
    assert.ok(columns > 20);
    assert.match(wording, new RegExp(`改行文字を含まない.*${columns}文字`));
    assert.match(wording, /ファイル名に誤りはない/);
    const program = body.prompt.filter(block => block.type === 'code').slice(0, 2).map(text).join('\n');
    const programLines = Array.from(program.matchAll(/^\s*(\d+) /gm), match => Number(match[1]));
    assert.deepEqual(programLines, Array.from({ length: 50 }, (_, n) => n + 1));
    assert.equal([...program.matchAll(/［a］/g)].length, 2);
    assert.equal([...program.matchAll(/［c］/g)].length, 2);
    const alt = panel(body, 'line-buffer');
    const cells = alt.split('\n').find(line => line.startsWith('linebuf｜'))!.split('｜').slice(1);
    const nextIndex = cells.length - 1;
    assert.equal(cells[nextIndex], '');
    assert.match(alt, new RegExp(`gapp＝${cells.lastIndexOf('△')}、cpos＝${nextIndex}`));
    const keyword = panel(body, 'keyword-definition').match(/\\D(\d+)\\([^\\]+)\\/) ?? [];
    assert.ok(keyword[1] && keyword[2]);
    assert.ok(panel(body, 'keyword-reference').includes(`\\R${keyword[1]}\\`));
    const integer = Number(keyword[1]);
    selects(body, 'a', option => [0, columns - 1, columns].every(pos =>
      [-1, 0, columns - 1].every(gap => expression(option, ['cpos', 'gapp', 'COLUMNS'], [pos, gap, columns]) === (pos === columns))));
    selects(body, 'b', option => [0, 7, columns - 1].every(pos => [-1, 0, pos - 1].every(gap =>
      Function('gapp', 'cpos', 'COLUMNS', option + ';return gapp;')(gap, pos, columns) === pos)));
    selects(body, 'c', option => [0, 4, columns - 1].every(pos => {
      const linebuf = Array(columns + 1).fill(0);
      const actual = Function('linebuf', 'cpos', 'gapp', option + '= 73;return cpos;')(linebuf, pos, pos - 1);
      return actual === pos + 1 && linebuf[pos] === 73 && linebuf.filter(value => value !== 0).length === 1;
    }));
    selects(body, 'd', option => [2, columns - 2, columns - 1].every(source => {
      const initial = 'A'.repeat(source) + 'WORD'.repeat(columns).slice(0, columns - source);
      const next = Function('i', 'cpos', 'COLUMNS', option + ';return i;')(source, 1, columns);
      return initial[source] + initial.slice(next) === initial.slice(source);
    }));
    selects(body, 'e', option => [integer, 0, 7, 14, 32].every(id => {
      const decimalExpression = option.replaceAll("'0'", '48');
      return [...String(id)].reduce((value, digit) => expression(decimalExpression, ['i', 'ch2'], [value, digit.charCodeAt(0)]), 0) === id;
    }));
    selects(body, 'f', option => ['D', 'R'].every(type => [0, integer, 3].every(id =>
      expression(option, ['ch1', 'i'], [type, id]) === (type === 'D'))));
    selects(body, 'g', option => [1, keyword[2].length, 8].every(length => [0, columns - length - 1, columns - length, columns - length + 1, columns].every(pos =>
      [-1, Math.max(-1, pos - 2)].every(gap =>
        expression(option, ['cpos', 'gapp', 'j', 'COLUMNS'], [pos, gap, length, columns]) === (columns - pos < length)))));
  });

  test(`問10 COBOL：資格・定員・時点の境界と在室表を全択検算（${index}）`, () => {
    const body = drafts[1].definition.build([index]);
    const wording = prompt(body);
    const capacity = Number(wording.match(/在室できる人員は(\d+)名/)?.[1]);
    const levels = ['一般社員', '係長', '課長', '部長'];
    const restricted = wording.match(/③ ([^の]+)の資格には/)?.[1].split('、');
    assert.ok(restricted?.length);
    assert.match(wording, new RegExp('OCCURS ' + capacity));
    assert.match(wording, /従業員番号0の従業員はいない/);
    assert.match(wording, /同一人物の入室・退室のレコードは必ず対/);
    selects(body, 'a', option => levels.every((level, i) => [0, 1, 9].every(qual => {
      if (restricted.includes(level) && qual === 9) return true;
      const expressionText = option.replaceAll('EMP-CLASS', 'level').replaceAll('EMP-QUAL = 0', 'qual === 0')
        .replaceAll(' AND ', ' && ').replaceAll(' OR ', ' || ');
      return expression(expressionText, ['level', 'qual'], [i + 1, qual]) === (restricted.includes(level) && qual === 0);
    })));
    selects(body, 'b', option => [0, 1, capacity - 1].every(old => {
      const [delta, unchanged] = option === 'ADD 1 TO CNT' ? [old + 1, true]
        : option === 'MOVE ZERO TO CNT' ? [0, true] : [old, false];
      return unchanged && delta === old + 1;
    }));
    const missing = Number(wording.match(/INVALID KEY\n\s*MOVE (\d) TO PRM-RTN/)?.[1]);
    selects(body, '2', option => Number(option) === missing);
    const includeAtTime = wording.includes('指定した日時又はそれより前に入室');
    const events = [
      { time: 1, employee: 21, entry: true }, { time: 2, employee: 37, entry: true },
      { time: 4, employee: 21, entry: false }, { time: 4, employee: 12, entry: true },
      { time: 6, employee: 37, entry: false }, { time: 7, employee: 12, entry: false },
    ];
    selects(body, 'c', option => {
      const operator = /LOG-TIME (.+) PRM-TIME/.exec(option)![1];
      return [0, 1, 2, 3, 4, 5, 6, 7, 8].every(cut => {
        const expected = [[21, 1, 4], [37, 2, 6], [12, 4, 7]]
          .filter(([, entry, exit]) => includeAtTime ? entry <= cut && cut < exit : entry < cut && cut <= exit)
          .map(([employee]) => employee).sort();
        const state = new Set<number>();
        let reported: number[] = [];
        for (const event of events) {
          if (compare(operator, event.time, cut)) { reported = [...state]; break; }
          if (event.entry) state.add(event.employee); else state.delete(event.employee);
        }
        return JSON.stringify(reported.sort()) === JSON.stringify(expected);
      });
    });
    const conditions = (option: string, counter: number, row: number, recorded: number) => {
      switch (option) {
        case 'EMP-NO(CNT) = ZERO': return row === 0;
        case 'LOG-EMP = EMP-NO(CNT)': return recorded === row;
        case 'LOG-EMP NOT = EMP-NO(CNT)': return recorded !== row;
        case 'LOG-EMP = ZERO': return recorded === 0;
        case 'LOG-EMP NOT = ZERO': return recorded !== 0;
        case 'SRCH-END': return false;
      }
      const [, op, limit] = /^CNT ([<>]) (\d+)$/.exec(option)!;
      return compare(op, counter, Number(limit));
    };
    const samples = [[37, 0, 12], [0, 37, 0], [12, 77, 37], [...Array(capacity - 1).fill(77), 37], [...Array(capacity - 1).fill(77), 0]];
    selects(body, 'd', option => samples.filter(row => row.includes(0)).every(table =>
      table.findIndex((row, i) => conditions(option, i + 1, row, 37)) === table.indexOf(0)));
    selects(body, 'e', option => samples.filter(row => row.includes(37)).every(table =>
      table.findIndex((row, i) => conditions(option, i + 1, row, 37)) === table.indexOf(37)));
    selects(body, 'f', option => {
      const records = Array.from({ length: capacity }, (_, i) => (i % 3 ? i + 1 : 0));
      let counter = 1;
      const displayed = [];
      while (!conditions(option, counter, records[counter - 1], 37)) {
        if (counter > capacity) return false;
        if (records[counter - 1] !== 0) displayed.push(records[counter - 1]);
        counter++;
      }
      return counter === capacity + 1 && JSON.stringify(displayed) === JSON.stringify(records.filter(Boolean));
    });
  });

  test(`問11 Java：方角、再帰、石の数、手番を全択検算（${index}）`, () => {
    const body = drafts[2].definition.build([index]);
    const wording = prompt(body);
    const size = /new Piece\[(\d+)\]\[(\d+)\]/.exec(wording);
    assert.ok(size);
    const [, rows, columns] = size.map(Number);
    assert.match(wording, new RegExp(`${rows}行${columns}列`));
    assert.match(wording, /reverse\(Piece piece, int row, int col,\n\s+Direction dir\)/);
    assert.match(wording, /ncol >= 0 && ncol < grid\[nrow\].length/);
    const missing = /([A-Z]+)\(［a］\)/.exec(wording)![1];
    selects(body, 'a', option => {
      const [dr, dc] = option.split(',').map(Number);
      return dr === Number(missing.includes('S')) - Number(missing.includes('N'))
        && dc === Number(missing.includes('E')) - Number(missing.includes('W'));
    });
    const figureRows = (suffix: string) => panel(body, suffix).split('\n').filter(line => /^\d+｜/.test(line))
      .map(line => line.split('｜').slice(1));
    const initial = figureRows('board-initial');
    assert.equal(initial.length, rows);
    assert.ok(initial.every(line => line.length === columns));
    assert.equal(initial.flat().filter(cell => cell === '●').length, 2);
    assert.equal(initial.flat().filter(cell => cell === '○').length, 2);
    const moves = figureRows('board-move');
    assert.equal(moves.length, 12);
    const counts = [0, 1, 2].map(step => moves.slice(step * 4, step * 4 + 4).flat().filter(cell => cell === '●').length);
    assert.deepEqual(counts, [2, 3, 4]);
    selects(body, 'b', option => [[2, 3, 1, 4], [4, 2, 3, 1], [2, 3, 2, 2], [2, 3, 3, 3]]
      .every(([row, col, nrow, ncol]) => {
        const grid = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => 10 * r + c));
        return expression(option, ['grid', 'row', 'col', 'nrow', 'ncol', 'count'], [grid, row, col, nrow, ncol, 1]) === 10 * nrow + ncol;
      }));
    selects(body, 'c', option => [[1, 3], [1, 1, 1], [2, 4]].every(flipped => {
      const total = Function('flipped', 'let count=0; for (const n of flipped) count ' + option + ' n; return count;')(flipped);
      return total === flipped.reduce((a, b) => a + b, 0);
    }));
    selects(body, 'd', option => [1, 2, 4].every(n => {
      const [gain, after] = Function('n', 'const gain = (' + option + '); return [gain,n];')(n);
      return gain === n + 1 && after === n;
    }));
    selects(body, 'e', option => {
      const players = Function('player','opponent','board','Piece',
        'const p = ' + option + '; opponent=player; player=p; return [player,opponent];')('B', 'W', {}, { BLACK: 1, WHITE: 2 });
      return players[0] === 'W' && players[1] === 'B';
    });
    const oracle = (ray: string) => {
      const endpoint = ray.search(/[^W]/);
      return endpoint < 0 || ray[endpoint] === '.' ? -1 : endpoint;
    };
    const interpretations = (option: string, ray: string) => option.includes('存在しない') ? ray[0] === '.' || ray.length === 0
      : option.includes('Piece以外') ? ray[0] === '?'
      : option.includes('同色') ? ray[0] === 'B' : ray[0] === 'W';
    for (const [field, result] of [['f', 0], ['g', -1]] as const) selects(body, field, option =>
      ['B', '', '.', 'WB', 'WWB'].every(ray => interpretations(option, ray) === (oracle(ray) === result)));
    assert.equal(oracle('WW.'), -1);
    assert.match(body.explanation, /挟めなければ−1が元の呼出しにも伝わる/);
  });

  test(`問12 CASL II：全命令候補をレジスタ・メモリ・FRモデルで検算（${index}）`, () => {
    const body = drafts[3].definition.build([index]);
    const wording = prompt(body);
    const code = body.prompt.filter(block => block.type === 'code').map(text).join('\n');
    assert.deepEqual([...code.matchAll(/^\s*(\d+) /gm)].map(match => Number(match[1])), Array.from({ length: 65 }, (_, n) => n + 1));
    const maxExponent = Number(wording.match(/指数部が(\d+)を超える/)?.[1]);
    assert.ok(maxExponent >= 63);
    assert.equal(Number.parseInt(/AND\s+GR4,=#([A-F0-9]+)/.exec(code)![1], 16), maxExponent);
    const bits = Math.log2(maxExponent + 1);
    assert.match(wording, /指数部Eは1以上/);
    const example = panel(body, 'normalisation');
    const raw = Array.from(example.matchAll(/E＝([01]+)\s+M＝([01]+)/g), match => match.slice(1).map(bits => Number.parseInt(bits, 2)));
    assert.equal(raw.length, 2);
    const [before, after] = raw;
    assert.equal(before[1] * 2 ** before[0], after[1] * 2 ** after[0]);
    assert.equal(after[1], 32768);
    const allValues = ([0, 1] as const).flatMap(sign => [5, 19, 20, 21, 28, maxExponent - 1].flatMap(exponent =>
      [0x8000, 0x9000, 0xA000, 0xFFFF].map(mantissa => [sign, exponent, mantissa] as const)));
    allValues.push([0, 0, 0]);
    const baseline = { a: 'LD GR4,GR5', b: 'JPL ADDMXY', c: 'JUMP SCHECK', d: 'SLL GR5,1', e: 'ADDL GR4,=1' };
    const pairs = allValues.flatMap(x => allValues.map(y => [x, y] as const));
    for (const field of ['a', 'b', 'c', 'd', 'e', '2']) selects(body, field, option => {
      const subtraction = field === '2';
      const compiled = compileCasl(code, subtraction ? baseline : { ...baseline, [field]: option }, subtraction ? option : undefined);
      return pairs.every(([x, y]) => {
        const expected = expectedFloat(x, y, subtraction);
        if (expected[1] < 0 || expected[1] > maxExponent) return true;
        return JSON.stringify(runCasl(compiled, x, y, bits)) === JSON.stringify(expected);
      });
    });
    if (index === 0) {
      const x = [0, 1, 0xA000] as const, y = [0, 0, 0x8000] as const;
      assert.deepEqual(expectedFloat(x, y, false), [0, 1, 0xE000]);
      assert.deepEqual(runCasl(compileCasl(code, baseline), x, y, bits), [0, 0, 0xC000]);
      const original = drafts[3].original();
      assert.doesNotMatch(prompt(original), /指数部Eは1以上/);
      assert.match(original.explanation, /#E000.*#C000/);
      assert.doesNotMatch(wording, /文字の符号表|JIS X 0201/);
    }
  });

  test(`問13 表計算：全選択式の照合、複写、割引境界を独立検算（${index}）`, () => {
    const body = drafts[4].definition.build([index]);
    const menu = sheetFromAlt(panel(body, 'menu-sheet'));
    const receipt = sheetFromAlt(panel(body, 'receipt-sheet'));
    const discount = sheetFromAlt(panel(body, 'discount-sheet'));
    const sheets = { メニュー: menu, 伝票: receipt, 割引: discount };
    assert.deepEqual([menu.length, receipt.length, discount.length], [7, 28, 15]);
    const rows = receipt.slice(1, 27);
    for (const [field, category, nameCol, typeCol, priceCol] of [['a', '飲料', 0, 1, 1], ['b', '料理', 6, 7, 7]] as const) {
      const order = rows.map((row, offset) => ({ row, offset })).filter(({ row }) => row[0] === category);
      selects(body, field, candidate => order.every(({ row, offset }) => {
        const item = menu.slice(3).find(item => item[nameCol] === row[1]);
        const column = menu[2].slice(typeCol).indexOf(row[2]);
        assert.ok(item && column >= 0);
        const expected = item[priceCol + column];
        assert.equal(row[3], expected);
        return evaluate(candidate, sheets, '伝票', 0, offset) === expected;
      }));
    }
    const total = (accepts: (row: typeof rows[number]) => boolean) =>
      rows.filter(accepts).reduce((sum, row) => sum + Number(row[4]), 0);
    const sets = total(row => row[2] === 'セット割引');
    const drink = total(row => row[0] === '飲料' && row[2] !== 'セット割引');
    const dish = total(row => row[0] === '料理');
    const actualSets = Math.min(drink, dish);
    assert.deepEqual(discount.slice(0, 4).map(row => row[1]), [sets, drink, dish, actualSets]);
    selects(body, 'c', option => evaluate(option, sheets, '割引') === sets);
    selects(body, 'd', option => evaluate(option, sheets, '割引') === drink);
    selects(body, 'e', option => discount.slice(8, 12).every((row, offset) =>
      evaluate(option, sheets, '割引', 0, offset) === total(item => item[1] === row[0] && item[2] !== 'セット割引')));
    selects(body, 'f', option => [0, 1, 3, 4, 7, 10].every(remaining => [0, 1, 4, 7, 10].every(available => {
      const altered = discount.map(row => [...row]);
      altered[8][5] = remaining; altered[8][2] = available;
      return evaluate(option, { ...sheets, 割引: altered }, '割引') === (available < remaining ? available : remaining);
    })));
    const originalSetCost = rows.filter(row => row[2] === 'セット割引').reduce((sum, row) => sum + Number(row[3]) * Number(row[4]), 0);
    const oldSum = rows.reduce((sum, row) => sum + Number(row[3]) * Number(row[4]), 0);
    const discountUnits = rows.filter(row => row[2] === 'セット割引').flatMap(row =>
      Array.from({ length: total(item => item[1] === row[1] && item[2] !== 'セット割引') }, () => Number(row[3])));
    const optimalSetCost = discountUnits.sort((a, b) => a - b).slice(0, actualSets).reduce((sum, cost) => sum + cost, 0);
    assert.equal(receipt[27][5], oldSum);
    assert.equal(discount[12][4], originalSetCost);
    assert.equal(discount[12][7], optimalSetCost);
    const totalOptimal = oldSum - originalSetCost + optimalSetCost;
    assert.equal(discount[13][1], totalOptimal);
    const conditions = /飲料を(\d+)個以上かつ料理を(\d+)個以上，又は料理と飲料を合わせて(\d+)個以上.*?から(\d+)％/.exec(prompt(body));
    assert.ok(conditions);
    const [, minDrink, minDish, minTotal, percent] = conditions.map(Number);
    const expected = (d: number, m: number) => d + m >= minTotal || (d >= minDrink && m >= minDish) ? totalOptimal * (100 - percent) / 100 : totalOptimal;
    assert.equal(discount[14][1], Math.floor(expected(drink, dish)));
    selects(body, 'g', option => [0, minDrink - 1, minDrink, minDrink + 1, minTotal].every(d =>
      [0, minDish - 1, minDish, minDish + 1, minTotal - d].every(m => {
        const altered = discount.map(row => [...row]);
        altered[1][1] = d; altered[2][1] = m;
        const evaluated = evaluate(option, { ...sheets, 割引: altered }, '割引');
        return Math.abs(Number(evaluated) - expected(d, m)) < 0.0001;
      })));
  });
}

test('言語別図表は全72状態を描画し、代替説明と各ワークシートの列見出しを保持する', () => {
  assert.equal(figures.length, 18);
  assert.deepEqual(renderers.map(renderer => renderer.profile), figures.map(figure => figure.profile));
  let displayed = 0;
  for (const [i, renderer] of renderers.entries()) for (const index of inputCases) {
    const values = [index];
    const caption = '図表名';
    const html = renderToStaticMarkup(createElement(renderer.component, { values, caption }));
    const alt = figures[i].alt(values);
    assert.ok(alt.trim());
    assert.match(html, /role="group" aria-label="図表名" aria-description="/);
    assert.match(html, /class="table-scroll" tabindex="0"/);
    assert.ok(html.includes('<table'));
    const rightmost = renderer.profile.endsWith('menu-sheet') ? 'J' : renderer.profile.endsWith('receipt-sheet') ? 'F'
      : renderer.profile.endsWith('discount-sheet') ? 'H' : undefined;
    if (rightmost) assert.ok(html.includes('>' + rightmost + '</th>'));
    displayed++;
  }
  assert.equal(displayed, 72);
});
