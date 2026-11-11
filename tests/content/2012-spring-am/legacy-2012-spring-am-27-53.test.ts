import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2012SpringAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2012-spring-am-27-53';
import { legacy2012SpringAm2753Figures as figures } from '../../../src/core/generators/legacy-2012-spring-am-27-53-figures';
import source from '../../../src/core/generators/legacy-2012-spring-am-27-53-source.json';
import { legacy2012SpringAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2012SpringAm2753Figures';
import { knowledgeFacts } from '../../fixtures/legacy-2012-spring-am-27-53-facts';

const numbers = Array.from({ length: 27 }, (_, i) => i + 27);
const paperKeys = 'ウイアウウエエエウウウウイイウエアイウアウイアウウウウ';
const definition = (number: number) => definitions.find(row => row.source === '2012h24h-fe-am-' + number)!;
const cases = (number: number) => Array.from({ length: definition(number).fields[0].maximum + 1 }, (_, i) => definition(number).build([i]));

function block<T extends Block['type']>(value: Block, kind: T) {
  assert.equal(value.type, kind);
  return value as Extract<Block, { type: T }>;
}

const prompt = (body: GeneratedBody) => block(body.prompt[0], 'paragraph').text;
const options = (body: GeneratedBody) => body.choices.map(choice => block(choice[0], 'paragraph').text);
const resultRows = (body: GeneratedBody) => body.choices.map(choice => {
  const result = block(choice[0], 'table');
  assert.deepEqual(result.columns, ['製品名', '数量']);
  assert.equal(result.captionPresentation, 'accessible');
  return result.rows;
});
const number = (text: string) => Number(text.replaceAll(',', ''));
const checkAnswer = (body: GeneratedBody, decisions: readonly boolean[]) => {
  assert.equal(decisions.length, 4);
  assert.deepEqual(decisions.flatMap((match, index) => match ? [index] : []), [body.correctIndex], prompt(body));
};

test('問27〜53の定義・公式解答・基準本文と全選択肢・入力域', () => {
  assert.deepEqual(definitions.map(row => Number(row.source.split('-').at(-1))), numbers);
  assert.equal(paperKeys.length, 27);
  for (const [i, n] of numbers.entries()) {
    const def = definition(n);
    const original = source[String(n) as keyof typeof source];
    const baseline = def.build([0]);
    assert.equal(def.sourceAnswer, paperKeys[i]);
    assert.equal('アイウエ'[baseline.correctIndex!], paperKeys[i]);
    assert.equal(original.key, paperKeys[i]);
    assert.equal(prompt(baseline), original.prompt);
    assert.deepEqual(n === 30 ? resultRows(baseline).map(rows => rows.map(row => row.join('｜')).join('\n')) : options(baseline), original.choices);
    assert.deepEqual(def.reference, [0]);
    assert.equal(def.fields[0].minimum, 0);
    const outputs = cases(n);
    assert.ok(outputs.length >= 3);
    assert.equal(new Set(outputs.map(body => JSON.stringify(body.prompt))).size, outputs.length, String(n));
    const correctContents = new Set(outputs.map(body => JSON.stringify(body.choices[body.correctIndex!])));
    if (def.answerVariation === 'fixed') assert.equal(correctContents.size, 1);
    else assert.ok(correctContents.size > 1, String(n));
    for (const [input, body] of outputs.entries()) {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert.ok(body.explanation.length >= 55, '解説 ' + n);
      assert.deepEqual(body, def.build([input]));
    }
    for (const invalid of [[-1], [0.5], [NaN], [outputs.length], [], [0, 0]])
      assert.throws(() => def.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
  }
});

for (const [id, facts] of Object.entries(knowledgeFacts)) {
  test('問' + id + 'の問い・選択肢の意味・結論を独立資料と照合', () => {
    const outputs = cases(Number(id)), visited = new Set<RegExp>();
    assert.equal(outputs.length, facts.cases.length);
    assert.match(facts.basis, /https:\/\//);
    for (const body of outputs) {
      const matching = facts.cases.filter(([criterion]) => criterion.test(prompt(body)));
      assert.equal(matching.length, 1, prompt(body));
      const [[condition, expected, conclusion]] = matching;
      visited.add(condition);
      const roles = Object.entries(facts.options);
      const actual = options(body).map(choice => {
        const matches = roles.filter(([, criterion]) => criterion.test(choice)).map(([role]) => role);
        assert.equal(matches.length, 1, choice);
        return matches[0];
      });
      assert.equal(new Set(actual).size, 4, String(id));
      checkAnswer(body, actual.map(role => role === expected));
      assert.match(body.explanation, conclusion);
    }
    assert.equal(visited.size, facts.cases.length);
  });
}

test('問30の等値結合・重複・集計・NULLを実際のSQLで比較', () => {
  const originalOrders = [
    ['2011-04-10', 'P2', '120'], ['2011-04-15', 'P1', '100'], ['2011-04-22', 'P4', '50'],
    ['2011-04-30', 'P8', '80'], ['2011-05-06', 'P1', '100'], ['2011-05-08', 'P3', '70'],
  ];
  const originalProducts = [
    ['P1', 'PC'], ['P2', 'テレビ'], ['P3', '掃除機'], ['P4', '冷蔵庫'], ['P5', 'エアコン'], ['P6', '電話機'], ['P7', '時計'],
  ];
  const multiset = (rows: readonly string[][]) => rows.map(row => JSON.stringify(row)).sort();
  for (const [index, body] of cases(30).entries()) {
    const [, sqlBlock, orderBlock, productBlock] = body.prompt;
    const sql = block(sqlBlock, 'code');
    const order = block(orderBlock, 'table');
    const product = block(productBlock, 'table');
    assert.equal(sql.language, 'sql');
    assert.equal(sql.text, 'SELECT 製品名, 数量 FROM 注文, 製品\n    WHERE 注文.製品コード = 製品.製品コード');
    assert.deepEqual(order.columns, ['日付', '製品コード', '数量']);
    assert.deepEqual(product.columns, ['製品コード', '製品名']);
    if (index === 0) {
      assert.deepEqual(order.rows, originalOrders);
      assert.deepEqual(product.rows, originalProducts);
    }
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 注文 (日付 TEXT, 製品コード TEXT, 数量 INTEGER); CREATE TABLE 製品 (製品コード TEXT PRIMARY KEY, 製品名 TEXT);');
      const orderInsert = db.prepare('INSERT INTO 注文 VALUES (?, ?, ?)');
      const productInsert = db.prepare('INSERT INTO 製品 VALUES (?, ?)');
      for (const [date, key, quantity] of order.rows) orderInsert.run(date, key, Number(quantity));
      for (const [key, name] of product.rows) productInsert.run(key, name);
      const queries = [
        'SELECT DISTINCT 製品名, 数量 FROM 注文 JOIN 製品 USING(製品コード)',
        'SELECT 製品名, SUM(数量) AS 数量 FROM 注文 JOIN 製品 USING(製品コード) GROUP BY 製品名',
        sql.text,
        'SELECT 製品名, 数量 FROM 注文 LEFT JOIN 製品 USING(製品コード)',
      ];
      const rows = (query: string) => db.prepare(query).all().map(record => [String(record.製品名 ?? 'NULL'), String(record.数量)]);
      const actual = resultRows(body);
      const expected = rows(sql.text);
      assert.equal(expected.length, 5);
      assert.equal(new Set(multiset(expected)).size, 4);
      assert.deepEqual(actual.map(multiset), queries.map(query => multiset(rows(query))));
      checkAnswer(body, actual.map(candidate => JSON.stringify(multiset(candidate)) === JSON.stringify(multiset(expected))));
      assert.match(body.explanation, /ORDER BYがないので表の行の表示順そのものは保証されない/);
      assert.ok(body.explanation.includes(order.rows.find(row => !product.rows.some(item => item[0] === row[1]))![1]));
    } finally {
      db.close();
    }
  }
});

test('問31の列射影と全候補を表の見出しと実行結果から照合', () => {
  for (const [index, body] of cases(31).entries()) {
    const [, diagram, label, statement] = body.prompt;
    const relation = block(diagram, 'diagram');
    const columns = relation.alt.match(/列見出しは(.+)。/)![1].split('，');
    const sql = block(statement, 'code');
    assert.equal(block(label, 'paragraph').text, '〔SQL文〕');
    assert.equal(columns.length, 5);
    if (index === 0) {
      assert.deepEqual(columns, ['A1', 'A2', 'A3', 'A4', 'A5']);
      assert.equal(sql.text, 'SELECT A1, A3, A5 FROM R');
    }
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE R (' + columns.join(', ') + '); INSERT INTO R VALUES (11,22,33,44,55),(11,22,33,44,55);');
      const results = db.prepare(sql.text).all();
      assert.equal(results.length, 2);
      const selected = Object.keys(results[0]);
      assert.ok(selected.length >= 2 && selected.length < columns.length);
      assert.ok(selected.every(name => columns.includes(name)));
      assert.deepEqual(Object.values(results[0]), selected.map(name => (columns.indexOf(name) + 1) * 11));
      const operations = { 結合: 'combine', 差: 'exclude', 射影: 'select-columns', 直積: 'pair-all' };
      checkAnswer(body, options(body).map(choice => operations[choice as keyof typeof operations] === 'select-columns'));
      assert.ok(body.explanation.includes(selected.join('，')));
      assert.match(body.explanation, /DISTINCTを指定しないので重複行を保持/);
    } finally {
      db.close();
    }
  }
});

test('問34の転送時間と全誤答を逆算した転送量で比較', () => {
  for (const body of cases(34)) {
    const [, sizeText, rateText, efficiencyText] = prompt(body).match(/(\d+)Mバイトのデータを([\d,]+)ビット／秒.*何秒.*(\d\d)％.*1Mバイト＝10⁶バイト/) ?? [];
    assert.ok(efficiencyText);
    const size = number(sizeText) * 1_000_000;
    const rate = number(rateText);
    const percent = number(efficiencyText);
    const durations = options(body).map(number);
    const transfer = (seconds: number) => seconds * rate * percent / 100 / 8;
    assert.ok(durations.every((value, i) => Number.isInteger(value) && (!i || value > durations[i - 1])));
    checkAnswer(body, durations.map(duration => transfer(duration) === size));
    const [omitBit, inverseEfficiency, omitEfficiency, correct] = durations;
    assert.equal(transfer(omitBit) * 8, size);
    assert.equal(inverseEfficiency * rate / 8 * 100 / percent, size);
    assert.equal(omitEfficiency * rate / 8, size);
    assert.match(body.explanation, new RegExp(options(body)[3] + '秒'));
    assert.equal(transfer(correct), size);
  }
});

test('問43の三つの構成で単一の稼働サーバを失った場合と全選択肢の評価', () => {
  const states = [
    [/サーバ2（待機）.*サーバ2からサーバ1を死活監視.*切り替わってサービス提供を継続/, /待機側へ切り替えて/],
    [/サーバ2（稼働）.*相互監視.*残りのサーバが応答/, /残る稼働サーバが要求に応えて/],
    [/サーバ2（停止）.*運用者が手動.*サーバ2を起動してサービス提供を再開/, /運用者が停止待機中/],
  ];
  const outcomes = { 可用性の向上: 'service', 完全性の向上: 'accuracy', 機密性の向上: 'secrecy', 責任追跡性の向上: 'audit' };
  for (const [index, body] of cases(43).entries()) {
    const figure = block(body.prompt[1], 'diagram');
    const [condition, explanation] = states[index];
    assert.match(figure.alt, /元の構成はインターネットとデータにつながる稼働サーバ1台.*同じデータにつながる/);
    assert.match(figure.alt, condition);
    assert.match(body.explanation, explanation);
    assert.match(body.explanation, /サービスを継続・再開できるので，可用性が向上/);
    checkAnswer(body, options(body).map(choice => outcomes[choice as keyof typeof outcomes] === 'service'));
  }
});

test('問52の全5経路に関する独立計算と公式の図の条件', () => {
  const signatures = [/開始から上段左へ作業A（(\d+)日）/, /開始から下段左へ作業B（(\d+)日）/,
    /上段左から下段左へ作業C（(\d+)日）/, /上段左から上段右へ作業D（(\d+)日）/,
    /下段左から下段右へ作業E（(\d+)日）/, /下段右から終了へ作業F（(\d+)日）/,
    /上段右から終了へ作業G（(\d+)日）/];
  const achieved = new Set<number>();
  for (const [index, body] of cases(52).entries()) {
    const figure = block(body.prompt[1], 'diagram');
    assert.match(figure.alt, /下段右から上段右への破線は所要日数0日のダミー作業/);
    const days = signatures.map(expression => Number(figure.alt.match(expression)?.[1]));
    assert.ok(days.every(duration => Number.isInteger(duration) && duration > 0));
    if (index === 0) assert.deepEqual(days, [1, 5, 3, 3, 4, 5, 4]);
    const [a, b, c, d, e, f, g] = days;
    const pathTimes: Record<string, number> = {
      'A → C → E → F': a + c + e + f,
      'A → C → E → G': a + c + e + g,
      'A → D → G': a + d + g,
      'B → E → F': b + e + f,
      'B → E → G': b + e + g,
    };
    const longest = Math.max(...Object.values(pathTimes));
    assert.equal(Object.values(pathTimes).filter(time => time === longest).length, 1);
    checkAnswer(body, options(body).map(path => pathTimes[path] === longest));
    assert.match(body.explanation, new RegExp('工期は' + longest + '日'));
    for (const [path, time] of Object.entries(pathTimes)) assert.ok(body.explanation.includes(path + 'が' + time + '日'));
    achieved.add(body.correctIndex!);
  }
  assert.equal(achieved.size, 4);
});

test('問53の工数を予定工数から完了工数を引く方法で独立検算', () => {
  for (const [index, body] of cases(53).entries()) {
    const { columns, rows } = block(body.prompt[1], 'table');
    assert.deepEqual(columns, ['設計書', '作成枚数（枚）', '1枚当たりの所要工数（人時）', '現在までの作成済み枚数（枚）']);
    assert.deepEqual(rows.map(row => row[0]), ['基本設計書', '概要設計書', '詳細設計書']);
    if (index === 0) assert.deepEqual(rows, [['基本設計書', '80', '5', '80'], ['概要設計書', '300', '2', '200'], ['詳細設計書', '500', '2', '50']]);
    let total = 0, done = 0, pages = 0, maximum = 0;
    for (const [label, planned, hours, completed] of rows) {
      const allWork = Number(planned) * Number(hours), doneWork = Number(completed) * Number(hours);
      assert.ok(Number(completed) <= Number(planned));
      total += allWork;
      done += doneWork;
      pages += Number(planned) - Number(completed);
      maximum = Math.max(maximum, allWork - doneWork);
      assert.ok(body.explanation.includes(label + 'は' + (Number(planned) - Number(completed)) + '枚×' + hours + '人時＝' + (allWork - doneWork) + '人時'));
    }
    const displayed = options(body).map(number);
    assert.deepEqual(displayed, [pages, maximum, total - done, total]);
    assert.ok(displayed.every((value, i) => Number.isInteger(value) && (!i || value > displayed[i - 1])));
    checkAnswer(body, displayed.map(value => value === total - done));
  }
});

test('問31・43・52の図の全ケースで有効域・代替文・SVG・凡例を照合', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const [index, question] of [31, 43, 52].entries()) {
    const figure = figures[index];
    const renderer = renderers[index];
    const bodies = cases(question);
    assert.deepEqual(figure.domain, [[0, bodies.length - 1]]);
    for (const [variant, body] of bodies.entries()) {
      const displayed = block(body.prompt[1], 'diagram');
      figure.validate([variant]);
      assert.equal(displayed.alt, figure.alt([variant]));
      const html = renderToStaticMarkup(createElement(renderer.component, { values: [variant], caption: displayed.caption }));
      assert.match(html, /<svg.*role="img"/);
      assert.match(html, /tabindex="0"/i);
      assert.match(html, /currentColor/);
      assert.ok(html.includes(displayed.alt));
      if (question === 31) assert.equal([...html.matchAll(/<rect /g)].length, 5);
      if (question === 43) assert.match(html, /元の構成.*二重化された構成.*サーバ1.*サーバ2/);
      if (question === 52) {
        assert.equal([...html.matchAll(/stroke-dasharray="5 3"/g)].length, 2);
        assert.match(html, /凡例.*作業名.*所要日数.*ダミー作業/);
      }
    }
    for (const values of [[-1], [0.5], [bodies.length], [], [0, 0]]) assert.throws(() => figure.validate(values), { code: 'FIGURE_PROFILE' });
  }
});
