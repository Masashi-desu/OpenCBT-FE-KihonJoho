import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { spring2012Pm01To04Specs as specs } from '../../../scripts/legacy-2012-spring-pm-01-04-specs';
import { compoundAnswerSignature, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import { legacy2012SpringPm0104Figures as figures, profiles } from '../../../src/core/generators/legacy-2012-spring-pm-01-04-figures';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Block, Question } from '../../../src/core/types';
import { legacy2012SpringPm0104FigureRenderers as renderers } from '../../../src/ui/Legacy2012SpringPm0104Figures';
import review from '../../fixtures/legacy-2012-spring-pm-01-04-review.json';

const marks = 'アイウエオカキクケコ';
const variants = [0, 1, 2, 3];
const bodies = (number: number) => variants.map(value => specs[number - 1].definition.build([value]));
const text = (body: GeneratedBody) => body.prompt.flatMap(block => 'text' in block ? [block.text] : []).join('\n');

type Diagram = Extract<Block, { type: 'diagram' }>;
type Figure = Diagram & { scene: Extract<Diagram['scene'], { kind: 'source_figure' }> };
function diagram(block: Block, profile?: string): block is Figure {
  return block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    (profile === undefined || block.scene.profile === profile);
}
function render(block: Figure) {
  const renderer = renderers.find(item => item.profile === block.scene.profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values: block.scene.values }));
}

function choices(body: GeneratedBody, part: number) {
  return body.answerParts![part].choiceIds.map(id => {
    const item = body.choices[Number(id.slice('choice-value-'.length)) - 1];
    assert.equal(item.length, 1);
    return item[0];
  });
}
function words(body: GeneratedBody, part: number) {
  return choices(body, part).map(block => {
    assert(block.type === 'paragraph' || block.type === 'code');
    return block.text;
  });
}
function choiceIndex(body: GeneratedBody, part: number) {
  const field = body.answerParts![part], answer = body.partAnswers!.find(item => item.kind === 'choice' && item.partId === field.id);
  assert(answer?.kind === 'choice');
  return field.choiceIds.indexOf(answer.choiceId);
}
function compare<T>(body: GeneratedBody, part: number, options: readonly T[], predicate: (option: T, index: number) => boolean) {
  assert.equal(new Set(options).size, options.length);
  assert.deepEqual(options.flatMap((item, i) => predicate(item, i) ? [i] : []), [choiceIndex(body, part)]);
}
const verify = (body: GeneratedBody, part: number, predicate: (text: string, index: number) => boolean) =>
  compare(body, part, words(body, part), predicate);

function question(body: GeneratedBody) {
  return { choices: body.choices.map((blocks, index) => ({ id: 'choice-value-' + (index + 1), content: { blocks } })),
    answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers } } as Question;
}

test('問1〜4の公式解答・全20欄・原資料頁・16条件を照合し、正誤と未回答を採点する', () => {
  const official = ['オウイイエ', 'カキイイウ', 'イエエアウ', 'コキウエカ'];
  assert.equal(specs.length, 4);
  assert.deepEqual(review.coverage.eligible, [1, 2, 3, 4]);
  assert.equal(review.coverage.officialFields, 20);
  for (const [index, spec] of specs.entries()) {
    const source = review.questions[index], definition = spec.definition;
    assert.equal(spec.number, index + 1);
    assert.equal(definition.source, '2012h24h-fe-pm-' + (index + 1));
    assert.deepEqual(spec.pages, source.pages);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), source.pages);
    assert(Object.values(spec.originalPageAlt).every(alt => alt.length > 100));
    const shape = (body: GeneratedBody) => body.prompt.map(block => diagram(block) ? block.scene.profile : block.type);
    assert.equal(new Set(bodies(spec.number).map(text)).size, 4);
    for (const [value, body] of bodies(spec.number).entries()) {
      assert.deepEqual(body, definition.build([value]));
      assert.deepEqual(shape(body), shape(spec.original));
      assert.deepEqual(body.answerParts!.map(part => part.label), source.labels);
      assert.deepEqual(body.answerParts!.map(part => part.choiceIds.length), source.counts);
      assert.equal(body.partAnswers!.length, 5);
      assert(body.partAnswers!.every(answer => answer.kind === 'choice'));
      const q = question(body);
      validateAnswerDefinition(q);
      const selectedPartChoices = Object.fromEntries(body.answerParts!.map((part, n) => [part.id, part.choiceIds[choiceIndex(body, n)]]));
      const correct = gradeAnswer(q, { selectedPartChoices });
      assert(correct.parts?.every(result => result.outcome === 'correct'));
      assert(gradeAnswer(q, { selectedPartChoices: {} }).parts?.every(result => result.outcome === 'unanswered'));
      const first = body.answerParts![0], changed = { ...selectedPartChoices, [first.id]: first.choiceIds[(choiceIndex(body, 0) + 1) % first.choiceIds.length] };
      const incorrect = gradeAnswer(q, { selectedPartChoices: changed });
      assert.equal(incorrect.parts?.filter(result => result.outcome === 'incorrect').length, 1);
      assert(body.explanation.length > 100);
      if (value === 0) {
        assert.deepEqual(body, spec.original);
        const key = body.answerParts!.map((_, n) => marks[choiceIndex(body, n)]).join('');
        assert.equal(key, official[index]);
        assert.equal(key, source.marks.join(''));
      }
    }
    for (const invalid of [[], [4], [-1], [0.5], Array(1), [0, 0], [Number.NaN]]) assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  }
  assert.match(specs[0].originalPageAlt[5], /^次の問1から問7まで.*はじめの5問について採点/);
});

function wordFromFigure(block: Figure) {
  const svg = render(block);
  const rows = [...svg.matchAll(/data-float-bit="(\d+)" data-bit-value="([01])"/g)];
  assert.deepEqual(rows.map(match => Number(match[1])), [31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 0]);
  const shown = rows.map(row => row[2]);
  const word = shown.slice(0, -1).join('') + '0'.repeat(16) + shown.at(-1);
  assert.match(block.alt, /符号部 [01]，指数部 [01]{8}，仮数部 [01]{23}/);
  assert.equal([...block.alt.matchAll(/[01]+/g)].slice(-3).map(match => match[0]).join(''), word);
  return word;
}

function binary32(word: string) {
  const binary = new DataView(new ArrayBuffer(4));
  binary.setUint32(0, Number.parseInt(word, 2));
  return binary.getFloat32(0);
}
function readPower(text: string) {
  assert.match(text, /^[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+$/);
  return Number([...text].map(symbol => symbol === '⁻' ? '-' : '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(symbol)).join(''));
}
function binaryFraction(text: string) {
  assert.match(text, /^[01]\.[01]+$/);
  const [integer, fraction] = text.split('.');
  return Number(integer) + [...fraction].reduce((sum, digit, index) => sum + Number(digit) * 0.5 ** (index + 1), 0);
}
const increasing = (items: number[]) => items.every((value, i) => i === 0 || items[i - 1] < value);

test('問1のビット配置・減算と乗算をDataViewと2進の位取りで全択検算する', () => {
  for (const [index, body] of bodies(1).entries()) {
    const [format, example, query, aBits, bBits] = body.prompt.filter((block): block is Figure =>
      diagram(block, profiles.float) && block.scene.values[1] <= 4);
    assert(format && example && query && aBits && bBits);
    assert.match(text(body), /1≦\|α\|＜2[\s\S]+−126≦β≦127[\s\S]+127を加えた値[\s\S]+整数部分1を省略[\s\S]+仮数部ともに0/);
    assert.match(render(format), /指数部[\s\S]+仮数部[\s\S]+ビット番号/);
    assert.equal(binary32(wordFromFigure(example)), 0.75);
    const encoded = wordFromFigure(query);
    const [wordA, wordB] = [aBits, bBits].map(wordFromFigure);
    const [a, b] = [wordA, wordB].map(binary32);
    if (index === 0) {
      assert.equal(encoded, '00000010101100000000000000000000');
      assert.deepEqual([a, b], [40, 24]);
      assert.deepEqual(words(body, 0), ['3×2⁻¹²⁵', '3×2⁻¹²²', '3×2⁵', '3×2¹³²', '11×2⁻¹²⁵', '11×2⁻¹²²', '11×2⁵', '11×2¹³²']);
    }
    verify(body, 0, choice => {
      const [mantissa, power] = choice.split('×2');
      return Number(mantissa) * 2 ** readPower(power) === binary32(encoded);
    });
    const given = /Aが\(([01.]+)\)₂×2([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+).*Bを\(［a］\)₂×2([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/.exec(text(body));
    assert(given);
    const aExponent = readPower(given[2]);
    assert.equal(aExponent, readPower(given[3]));
    assert.equal(binaryFraction(given[1]) * 2 ** aExponent, a);
    assert(increasing(words(body, 1).map(binaryFraction)));
    verify(body, 1, choice => binaryFraction(choice) * 2 ** aExponent === b);
    const diff = /＝\(([01.]+)\)₂×2\^［b］/.exec(text(body));
    assert(diff);
    assert(increasing(words(body, 2).map(Number)));
    verify(body, 2, choice => binaryFraction(diff[1]) * 2 ** Number(choice) === a - b);
    const differenceWords = choices(body, 3).map(block => {
      assert(diagram(block, profiles.float));
      return wordFromFigure(block);
    });
    if (!index) assert.deepEqual(differenceWords.map(binary32), [0, 16, 24, 32, 48, 64, 96]);
    compare(body, 3, differenceWords, candidate => binary32(candidate) === a - b);
    const product = /乗算A×Bの結果は\(［d］\)₂×2([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/.exec(text(body));
    assert(product);
    assert(increasing(words(body, 4).map(binaryFraction)));
    verify(body, 4, choice => binaryFraction(choice) * 2 ** readPower(product[1]) === a * b);
    assert(body.explanation.includes(words(body, 4)[choiceIndex(body, 4)]));
  }
});

// 入力と中間値は整数。絶対値のビット長で桁数を決め、BigIntで最近接偶数丸めを実行する。
function binary32Integer(value: bigint) {
  const sign = value < 0n ? -1n : 1n, absolute = sign * value;
  const shift = Math.max(0, absolute.toString(2).length - 24);
  const unit = 2n ** BigInt(shift), whole = absolute / unit, remainder = absolute % unit;
  const increment = remainder * 2n > unit || (remainder * 2n === unit && whole % 2n === 1n);
  return (whole + (increment ? 1n : 0n)) * unit * sign;
}

test('問2の各最適化段階と二進24桁の独立丸めを、表・疑似言語・固定の5欄で照合する', () => {
  const cases = bodies(2), reviewRow = review.questions[1];
  assert.equal(reviewRow.answerVariation, 'fixed');
  assert.equal(specs[1].definition.answerVariation, reviewRow.answerVariation);
  assert.equal(reviewRow.answerSignatureCount, 1);
  assert.equal(new Set(cases.map(body => compoundAnswerSignature(question(body)))).size, reviewRow.answerSignatureCount);
  const branches = new Set<boolean>(), inlinedResults = new Set<number>();
  const unoptimizedResults = new Set<string>(), optimizedResults = new Set<string>();
  const facts = [
    ['関数のインライン展開', /関数を呼び出す箇所.*呼び出される関数.*展開/],
    ['共通部分式の削除', /同じ式が複数の箇所.*式の値を作業用変数に格納/],
    ['定数の畳込み', /定数同士の計算式.*計算結果で置き換え/],
    ['定数伝播', /変数を定数で置き換え/],
    ['無用命令の削除', /実行結果に影響しない文を削除/],
    ['ループ内不変式の移動', /値の変化しない式.*ループの外に移動/],
    ['ループのアンローリング', /繰返しの処理を展開/],
  ] as const;
  for (const [index, body] of cases.entries()) {
    const stem = text(body), taxonomy = body.prompt.find(block => block.type === 'table');
    assert(taxonomy?.type === 'table');
    assert.equal(taxonomy.rows.length, facts.length);
    taxonomy.rows.forEach(([term, meaning], i) => {
      assert.equal(term, facts[i][0]);
      assert.match(meaning, facts[i][1]);
    });
    const [stages, inline] = body.prompt.filter((block): block is Figure => diagram(block));
    const transformed = render(stages), step1 = transformed.split('data-optimizer-stage="1"')[1].split('</tr>')[0],
      step2 = transformed.split('data-optimizer-stage="2"')[1].split('</tr>')[0],
      step3 = transformed.split('data-optimizer-stage="3"')[1].split('</tr>')[0];
    assert.match(stem, /■ i: 0, i ≦ 1, 1\n│  • x\[i\] ← y\[i\] \+ m \+ n\n│  • v\[i\] ← w\[i\] \+ m \+ n\n■/);
    assert.match(step1, /■ i: 0, i ≦ 1, 1\n│  • t ← m \+ n/);
    assert.match(step2, /• t ← m \+ n\n■ i: 0, i ≦ 1, 1/);
    assert.match(step3, /x\[0\] ← y\[0\] \+ t\n• v\[0\] ← w\[0\] \+ t\n• x\[1\] ← y\[1\] \+ t\n• v\[1\] ← w\[1\] \+ t\n• i ← 2/);
    for (const part of [0, 1, 3]) assert.deepEqual(words(body, part), facts.map(row => row[0]));
    verify(body, 0, option => option === 'ループ内不変式の移動');
    verify(body, 1, option => option === 'ループのアンローリング');
    assert.deepEqual(words(body, 2), facts.slice(1).map(row => row[0]));
    const fn = render(inline);
    const call = /実引数(\d+)の値.*条件式p≧(\d+).*func\((\d+)\)を値(\d+)に置き換える/.exec(stem);
    const additions = /w ← p \+ (\d+)\s+\/\* p \+ \1の結果を返す \*\/[\s\S]+w ← p \+ (\d+)\s+\/\* p \+ \2の結果を返す/.exec(fn);
    assert(call && additions);
    const [, actualArg, threshold, repeatedArg, expected] = call.map(Number), yes = Number(additions[1]), no = Number(additions[2]);
    assert.equal(actualArg, repeatedArg);
    assert(fn.includes('▲ ' + actualArg + ' ≧ ' + threshold) && fn.includes('▲ ' + (actualArg >= threshold)));
    assert(fn.includes('#w ← ' + (actualArg + yes)) && fn.includes('#w ← ' + (actualArg + no)));
    const takesTrueBranch = actualArg >= threshold;
    assert.equal(expected, actualArg + (takesTrueBranch ? yes : no));
    branches.add(takesTrueBranch);
    inlinedResults.add(expected);
    assert(fn.includes('r ← ' + expected));
    verify(body, 2, option => option === '定数の畳込み');

    const raw = /y\[0\]＝([−\d]+)\.0，y\[1\]＝([−\d]+)\.0，m＝([−\d]+)\.0，n＝([−\d]+)\.0/.exec(stem);
    assert(raw);
    const [y0, y1, m, n] = raw.slice(1).map(value => BigInt(value.replace('−', '-'))).map(binary32Integer);
    const old = [y0, y1].map(y => binary32Integer(binary32Integer(y + m) + n));
    const folded = binary32Integer(m + n), revised = [y0, y1].map(y => binary32Integer(y + folded));
    const asLine = (values: bigint[]) => 'x[0]＝' + String(values[0]).replace('-', '−') + '.0，x[1]＝' + String(values[1]).replace('-', '−') + '.0';
    assert(stem.includes('左から順に演算する') && stem.includes('単精度（仮数部は23ビット）') && stem.includes('#wはコンパイラが'));
    assert(stem.includes('最適化をしないとき：　' + asLine(old)) && stem.includes('最適化をしたとき：　　' + asLine(revised)));
    unoptimizedResults.add(asLine(old));
    optimizedResults.add(asLine(revised));
    if (!index) assert.deepEqual(old, [4000004n, 2000004n]);
    assert.equal(folded, m);
    assert.deepEqual(old.map((value, i) => value - revised[i]), [n, n]);
    assert([y0, y1].every(y => binary32Integer(y + m) === y + m));
    verify(body, 3, option => option === '共通部分式の削除');
    assert.deepEqual(words(body, 4), ['桁あふれ', '桁落ち', '情報落ち', '丸め誤差']);
    verify(body, 4, option => option === '情報落ち' && folded === m && n !== 0n);
  }
  assert.deepEqual(branches, new Set([true, false]));
  assert.deepEqual([...inlinedResults].sort((a, b) => a - b), [15, 22, 24]);
  for (const results of [unoptimizedResults, optimizedResults]) assert.equal(results.size, cases.length);
  assert.equal(new Set(cases.map(body => body.explanation)).size, cases.length);
});

type Settlement = [id: string, staff: string, day: string, amount: number];
type Dish = [id: string, name: string, price: number, calories: number];
type Detail = [settlement: string, dish: string, plates: number];

test('問3の実表示の表・主キー・SQL全32候補を独立集計とSQLiteで照合する', () => {
  for (const [index, body] of bodies(3).entries()) {
    const stem = text(body), [simple, detailed] = body.prompt.filter((block): block is Figure => diagram(block, profiles.canteen));
    const shown = render(detailed);
    assert.match(stem, /1回の精算に対して一つの精算コード.*下線付きの項目は主キー/);
    assert.deepEqual([...shown.matchAll(/data-primary-key="true">([^<]+)</g)].map(match => match[1]),
      ['精算コード', '精算コード', '料理コード', '料理コード']);
    const old = simple.alt.split('\n'), [payHeading, pay, detailHeading, line1, line2, dishHeading, dish1, dish2] =
      detailed.alt.split('\n').filter(line => line.includes('｜'));
    assert.deepEqual(old.slice(0, 2), ['精算表', '社員番号｜日付｜精算額']);
    assert.equal(payHeading, '精算コード（下線）｜社員番号｜日付｜精算額');
    assert.equal(detailHeading, '精算コード（下線）｜料理コード（下線）｜皿数');
    assert.equal(dishHeading, '料理コード（下線）｜料理名｜単価');
    const [id, staff, day, amount] = pay.split('｜'), plates = [line1, line2].map(line => line.split('｜'));
    assert.equal(old[2], [staff, day, amount].join('｜'));
    if (!index) assert.deepEqual([id, staff, day, amount], ['03100186', '050221', '20120310', '380']);
    const [[code1, name1, price1], [code2, name2, price2]] = [dish1, dish2].map(line => line.split('｜'));
    assert([id, staff, day, code1, code2, name1, name2].every(value => shown.includes(value)));
    assert.deepEqual(plates.map(row => row[0]), [id, id]);
    assert.deepEqual(plates.map(row => row[1]), [code1, code2]);
    assert.equal(Number(amount), Number(plates[0][2]) * Number(price1) + Number(plates[1][2]) * Number(price2));

    const requirement = new Map([['要望1', ['社員番号', '日付', '料理コード']], ['要望2', ['日付', '精算額']],
      ['要望3', ['料理名']], ['要望4', ['日付', '料理コード', '皿数']]]);
    assert.match(stem, /要望1：.*明細[\s\S]+要望2：.*売上合計額[\s\S]+要望3：.*料理の一覧[\s\S]+要望4：.*販売皿数/);
    const originalColumns = old[1].split('｜');
    verify(body, 0, value => requirement.get(value)!.every(column => originalColumns.includes(column)));

    const offeredTables: Readonly<Record<string, readonly string[]>> = {
      精算表: ['精算コード', '社員番号', '日付'],
      明細表: ['精算コード', '料理コード', '皿数'],
      料理表: ['料理コード', '料理1皿のカロリー'],
    };
    const fieldsFrom = (value: string) => value.split('と').flatMap(table => offeredTables[table]);
    assert.match(stem, /ある社員の，[^，]+における1回の精算当たりの平均カロリー.*料理表にカロリーの列/);
    verify(body, 2, value => ['社員番号', '日付', '皿数', '料理1皿のカロリー'].every(column => fieldsFrom(value).includes(column)));
    verify(body, 3, value => ['社員番号', '日付', '精算コード'].every(column => fieldsFrom(value).includes(column)) && !value.includes('と'));

    const sql = body.prompt.find(block => block.type === 'code' && block.text.includes('購入皿数') && block.text.endsWith('［空欄］'));
    assert(sql?.type === 'code');
    const target = /料理名が“([^”]+)”/.exec(stem)?.[1];
    assert.equal(target, name2);
    const database = new DatabaseSync(':memory:');
    try {
      database.exec('CREATE TABLE 精算表(精算コード TEXT PRIMARY KEY, 社員番号 TEXT, 日付 TEXT, 精算額 INTEGER);' +
        'CREATE TABLE 料理表(料理コード TEXT PRIMARY KEY, 料理名 TEXT, 単価 INTEGER, カロリー INTEGER);' +
        'CREATE TABLE 明細表(精算コード TEXT, 料理コード TEXT, 皿数 INTEGER, PRIMARY KEY(精算コード, 料理コード));');
      const settlements: Settlement[] = [[id, staff, day, Number(amount)], ['test01', staff, day, 700],
        ['test02', 'E202', day, 800], ['test03', 'E303', day, 500], ['test04', 'E404', day, 400]];
      const dishes: Dish[] = [[code1, name1, Number(price1), 130], [code2, name2, Number(price2), 630],
        ['extra', '検算用の料理', 200, 780], ['unsold', '未販売の料理', 290, 900]];
      const details: Detail[] = plates.map(([settlement, dish, number]) => [settlement, dish, Number(number)]);
      details.push(['test01', code2, 2], ['test01', code1, 4], ['test02', code2, 5],
        ['test03', code1, 2], ['test03', 'extra', 3], ['test04', 'extra', 1]);
      const insertPay = database.prepare('INSERT INTO 精算表 VALUES (?,?,?,?)');
      const insertDish = database.prepare('INSERT INTO 料理表 VALUES (?,?,?,?)');
      const insertDetail = database.prepare('INSERT INTO 明細表 VALUES (?,?,?)');
      settlements.forEach(row => insertPay.run(...row));
      dishes.forEach(row => insertDish.run(...row));
      details.forEach(row => insertDetail.run(...row));

      const people = new Map<string, number>();
      for (const [payId, dish, plates] of details) {
        if (dish !== code2) continue;
        const employee = settlements.find(([id]) => id === payId)![1];
        people.set(employee, (people.get(employee) ?? 0) + plates);
      }
      const expectedPeople = [...people].sort();
      verify(body, 1, candidate => {
        const result = database.prepare(sql.text.replace('［空欄］', candidate)).all();
        return JSON.stringify(result.map(row => [row.社員番号, row.購入皿数]).sort()) === JSON.stringify(expectedPeople);
      });
      const minimum = Number(/カロリーが(\d+)以上の料理を対象/.exec(stem)?.[1] ?? 0);
      assert.match(stem, /販売皿数の多い順に，料理名，カロリー及び販売皿数/);
      const ranking = dishes.flatMap(([dish, name, , calories]) => {
        const matching = details.filter(([, code]) => code === dish);
        return matching.length && calories >= minimum ?
          [[name, calories, matching.reduce((sum, row) => sum + row[2], 0)] as const] : [];
      }).sort((a, b) => b[2] - a[2]);
      assert(ranking.length >= 2 && ranking[0][2] !== ranking[1][2]);
      verify(body, 4, candidate => {
        assert.match(candidate, /ORDER BY 販売皿数 DESC$/);
        if (minimum) assert(candidate.includes('料理表.カロリー >= ' + minimum));
        const result = database.prepare(candidate).all();
        return JSON.stringify(result.map(row => [row.料理名, row.カロリー, row.販売皿数])) === JSON.stringify(ranking);
      });
    } finally {
      database.close();
    }
  }
});

test('問4は次の送信可能時刻までを追跡し、1000パケット・容量の境界・各解答群を検算する', () => {
  for (const [index, body] of bodies(4).entries()) {
    const stem = text(body), sizes = /データを(\d+)kバイト単位.*パケット一つの大きさは([\d.]+)kバイト/.exec(stem);
    const durations = /送信に掛かる時間は(\d+)ミリ秒，ACK受信に掛かる時間は([\d.]+)ミリ秒，ACKの受信を完了してから次のパケットが送信可能になるまでに掛かる時間は([\d.]+)ミリ秒/.exec(stem);
    const waits = [...stem.matchAll(/その時間が(\d+)ミリ秒であった/g)].map(match => Number(match[1]));
    assert(sizes && durations && waits.length === 2 && waits[0] === waits[1]);
    assert(stem.includes('1Mバイトは1,000kバイト') && stem.includes('パケットやACKは確実に相手に届く') &&
      stem.includes('並行して行うことができる') && stem.includes('次のパケットが送信可能となるまで'));
    const packetCount = 1000 / Number(sizes[1]), packetSize = Number(sizes[2]), [send, ack, gap] = durations.slice(1).map(Number);
    assert.equal(packetCount, 1000);
    const tickPerMs = 2;
    const simulate = (capacity: number) => {
      let tick = 0, emitted = 0, acknowledged = 0, nextSendAllowed = 0;
      const ackReady: number[] = [];
      while (emitted < packetCount + 1) {
        if (ackReady[acknowledged] === tick) acknowledged++;
        if (tick >= nextSendAllowed && emitted - acknowledged < capacity) {
          // この送信の完了イベント、続いてACKの受信開始、完了・準備完了を登録する。
          const finish = tick + send * tickPerMs;
          const ackBegins = finish + waits[0] * tickPerMs;
          ackReady.push(ackBegins + (ack + gap) * tickPerMs);
          nextSendAllowed = finish + gap * tickPerMs;
          if (++emitted === packetCount + 1) return tick / tickPerMs / 1000;
        }
        tick++;
        assert(tick < 300000, '送信できる状態が失われた');
      }
      throw Error('未到達');
    };
    const best = simulate(packetCount), possible = Array.from({ length: 16 }, (_, i) => simulate(i + 1));
    const minimum = possible.findIndex(time => time === best) + 1;
    assert(minimum > 2 && possible[minimum - 2] > best && possible.slice(minimum - 1).every(time => time === best));
    for (const [part, answer] of [[0, possible[0]], [1, possible[1]], [3, best], [4, minimum * packetSize]]) {
      assert(increasing(words(body, part).map(Number)));
      verify(body, part, value => Math.abs(Number(value) - answer) < 1e-9);
    }
    const conditions = new Map<string, (outstanding: number, window: number) => boolean>([
      ['n以下の', (outstanding, window) => outstanding <= window], ['n以上の', (outstanding, window) => outstanding >= window],
      ['n未満の', (outstanding, window) => outstanding < window], ['nより大きい', (outstanding, window) => outstanding > window],
    ]);
    verify(body, 2, value => [1, 2, minimum].every(window =>
      Array.from({ length: window + 2 }, (_, outstanding) => outstanding).every(outstanding =>
        conditions.get(value)!(outstanding, window) === (window - outstanding >= 1))));
    if (!index) {
      assert.deepEqual([possible[0], possible[1], best, minimum], [111, 55.5, 10.5, 11]);
      assert.deepEqual(words(body, 0), ['8.3', '8.8', '10', '10.5', '46.3', '50', '55.5', '92.5', '100', '111']);
      assert.deepEqual(words(body, 4), ['9', '10', '10.8', '11', '12', '13.2', '14.4']);
    }
    const [narrow, wide] = body.prompt.filter((block): block is Figure => diagram(block, profiles.transfer)).map(render);
    assert.deepEqual([...narrow.matchAll(/data-duration="([\d.]+)"/g)].map(match => Number(match[1])), [send, ack, gap]);
    assert.deepEqual([...wide.matchAll(/data-duration="([\d.]+)"/g)].map(match => Number(match[1])), [gap]);
    assert.deepEqual([narrow, wide].map(svg => [...svg.matchAll(/data-transfer-packet=/g)].length), [3, 6]);
    assert.deepEqual([narrow, wide].map(svg => [...svg.matchAll(/data-transfer-ack=/g)].length), [2, 4]);
    const x = (kind: string, side: string) => Number(new RegExp('data-' + kind + '-side="' + side + '" x="(\\d+)"').exec(wide)?.[1]);
    assert(x('packet', 'A') < x('ack', 'A') && x('ack', 'B') < x('packet', 'B'));
    assert([narrow, wide].every(svg => svg.includes('パケットの送受信') && svg.includes('ACKの送受信')));
  }
});

test('すべての図profile・69入力を描画し、代替説明・表示ルートと無効入力を照合する', () => {
  assert.deepEqual(figures.map(item => item.profile), renderers.map(item => item.profile));
  let count = 0;
  for (const figure of figures) {
    const input = figure.domain.reduce<number[][]>((prior, [min, max]) =>
      prior.flatMap(prefix => Array.from({ length: max - min + 1 }, (_, i) => [...prefix, min + i])), [[]]);
    for (const values of input) {
      figure.validate(values);
      assert(figure.alt(values).length > 10);
      const renderer = renderers.find(item => item.profile === figure.profile)!;
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: '検算図', values }));
      assert(markup.includes(figure.profile) && markup.includes('tabindex="0"'));
      assert(markup.includes('aria-description=') || /aria-labelledby="[^"]+" aria-describedby="[^"]+"/.test(markup));
      count++;
    }
    const minimum = figure.domain.map(([min]) => min);
    assert.throws(() => figure.validate([]), /FIGURE_PROFILE/);
    assert.throws(() => figure.validate([-1, ...minimum.slice(1)]), /FIGURE_PROFILE/);
    const invalid = [...minimum];
    Object.defineProperty(invalid, '0', { get() { throw Error('アクセサを実行した'); } });
    assert.throws(() => figure.validate(invalid), /FIGURE_PROFILE/);
  }
  assert.equal(count, 69);
});
