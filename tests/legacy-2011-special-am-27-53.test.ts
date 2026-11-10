import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2011SpecialAm27To53Definitions as definitions } from '../src/core/generators/legacy-2011-special-am-27-53';
import { legacy2011SpecialAm2753Figures as figures } from '../src/core/generators/legacy-2011-special-am-27-53-figures';
import source from '../src/core/generators/legacy-2011-special-am-27-53-source.json';
import { legacy2011SpecialAm2753FigureRenderers as renderers } from '../src/ui/Legacy2011SpecialAm2753Figures';
import { facts } from './fixtures/legacy-2011-special-am-27-53-facts';

const paperKeys = 'エイアエアウエアイエイウアイエエウウイアアエウイアウア';
const numbers = Array.from({ length: 27 }, (_, i) => i + 27);
const def = (number: number) => definitions[number - 27];
const cases = (number: number) => Array.from({ length: def(number).fields[0].maximum + 1 }, (_, i) => def(number).build([i]));
const text = (block: Block) => {
  assert.ok(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
const prompt = (body: GeneratedBody) => text(body.prompt[0]);
const choices = (body: GeneratedBody) => body.choices.map(blocks => {
  assert.equal(blocks.length, 1);
  return text(blocks[0]);
});
const number = (formatted: string) => Number(formatted.replaceAll(',', ''));

function compare(body: GeneratedBody, truth: readonly boolean[]) {
  assert.equal(truth.length, 4);
  assert.deepEqual(truth.flatMap((valid, index) => valid ? [index] : []), [body.correctIndex], prompt(body));
}

test('全27系列の公式正答・選択肢・入力境界・再現性・Block Schema', () => {
  const folder = 'docs/public/schemas';
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  for (const file of readdirSync(folder).filter(file => file.endsWith('.schema.json')))
    ajv.addSchema(JSON.parse(readFileSync(folder + '/' + file, 'utf8')));
  const validate = ajv.getSchema('https://opencbt-fe-kihonjoho.example/schemas/3.0.0/common.schema.json#/$defs/block');
  assert(validate);
  assert.deepEqual(definitions.map(row => Number(row.source.split('-').at(-1))), numbers);
  assert.equal(paperKeys.length, numbers.length);
  for (const [i, n] of numbers.entries()) {
    const d = def(n), original = source[String(n) as keyof typeof source];
    assert.equal(d.source, '2011h23tokubetsu-fe-am-' + n);
    assert.equal(d.sourceAnswer, paperKeys[i]);
    assert.equal(original.key, paperKeys[i]);
    assert.deepEqual(d.reference, [0]);
    const all = cases(n), base = all[0];
    assert.equal('アイウエ'[base.correctIndex!], paperKeys[i]);
    assert.equal(prompt(base), original.prompt);
    if (n !== 44) assert.deepEqual(choices(base), original.choices);
    assert.equal(new Set(all.map(body => JSON.stringify(body.prompt))).size, all.length, String(n));
    const answers = all.map(body => JSON.stringify(body.choices[body.correctIndex!]));
    assert.equal(new Set(answers).size > 1, d.answerVariation !== 'fixed', String(n));
    for (const [j, body] of all.entries()) {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(blocks => JSON.stringify(blocks))).size, 4);
      assert.ok(body.explanation.length >= 35, n + ' / ' + j + ': ' + body.explanation);
      assert.deepEqual(body, d.build([j]));
      for (const block of [...body.prompt, ...body.choices.flat()])
        assert(validate(block), n + ' ' + JSON.stringify(validate.errors));
    }
    for (const invalid of [[], [0, 0], [-1], [all.length], [0.5], [NaN]])
      assert.throws(() => d.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
  }
});

const analytical = [27, 29, 30, 31, 44, 51];
assert.deepEqual([...Object.keys(facts).map(Number), ...analytical].sort((a, b) => a - b), numbers);
for (const [n, record] of Object.entries(facts)) {
  test('問' + n + 'の全入力・全4選択肢の意味と正誤を独立査読資料に照合', () => {
    const all = cases(Number(n));
    const visited = new Set<RegExp>();
    assert.ok(record.basis.length > 0 && record.basis.every(url => url.startsWith('https://')));
    assert.equal(all.length, record.cases.length);
    for (const body of all) {
      const matching = record.cases.filter(([condition]) => condition.test(prompt(body)));
      assert.equal(matching.length, 1, prompt(body));
      const [[condition, claims, correctClaim]] = matching;
      visited.add(condition);
      const used = new Set<number>();
      compare(body, choices(body).map(choice => {
        const roles = claims.flatMap((claim, index) => claim.test(choice) ? [index] : []);
        assert.equal(roles.length, 1, choice);
        assert.ok(!used.has(roles[0]), choice);
        used.add(roles[0]);
        return roles[0] === correctClaim;
      }));
    }
    assert.equal(visited.size, record.cases.length);
    if (n === '43') assert.match(all[0].explanation, /2011年の公式正答.*IREX VI.*個別の病変/);
  });
}

test('問27の集計可否を合計が一致する異なる取引明細で検証', () => {
  const raw = [
    [[12, 18], [18, 12]],
    [[18, 12], [12, 18]],
  ];
  for (const body of cases(27)) {
    const files = body.prompt[1];
    assert.equal(files.type, 'table');
    assert.deepEqual(files.columns, ['ファイル', '項目', '備考']);
    assert.equal(files.rows.length, 4);
    const owner = files.rows.slice(0, 2).map(([, fields, note]) => fields.includes('担当者コード') && note.endsWith('1人'));
    assert.equal(owner.filter(Boolean).length, 1);
    assert.match(files.rows[3][1], /顧客コード，商品コード，受注額/);
    const reports = raw.map(matrix => {
      const cells = matrix.flatMap((row, c) => row.map((amount, p) => ({ c, p, r: owner[0] ? c : p, amount })));
      return choices(body).map(option => {
        const dimensions = { 顧客: 'c', 商品: 'p', 担当者: 'r' } as const;
        const m = /^(顧客|商品|担当者)別の(顧客|商品|担当者)別受注実績$/.exec(option);
        assert(m);
        const a = dimensions[m[1] as keyof typeof dimensions], b = dimensions[m[2] as keyof typeof dimensions];
        const amounts = [0, 0, 0, 0];
        for (const cell of cells) amounts[cell[a] * 2 + cell[b]] += cell.amount;
        return amounts.join(',');
      });
    });
    compare(body, reports[0].map((amounts, i) => amounts === reports[1][i]));
  }
});

test('問29の各多重度を最大3組織・3社員の全グラフで独立判定', () => {
  const paperCases = [
    [1, 1, 1, 3], [0, 1, 0, 3], [1, 3, 0, 3], [1, 1, 0, 1],
  ];
  const graphs = [];
  for (let organizations = 1; organizations <= 3; organizations++) {
    for (let employees = 1; employees <= 3; employees++) {
      for (let mask = 0; mask < 2 ** (organizations * employees); mask++) {
        const organizationCounts = Array<number>(employees).fill(0);
        const employeeCounts = Array<number>(organizations).fill(0);
        for (let e = 0; e < employees; e++) for (let o = 0; o < organizations; o++) {
          if (mask & (1 << (e * organizations + o))) {
            organizationCounts[e]++;
            employeeCounts[o]++;
          }
        }
        graphs.push({ organizationCounts, employeeCounts });
      }
    }
  }
  for (const [i, body] of cases(29).entries()) {
    const [minOrg, maxOrg, minEmp, maxEmp] = paperCases[i];
    const possible = graphs.filter(({ organizationCounts, employeeCounts }) =>
      organizationCounts.every(count => count >= minOrg && count <= maxOrg) &&
      employeeCounts.every(count => count >= minEmp && count <= maxEmp));
    assert.ok(possible.length);
    compare(body, [
      possible.every(g => g.employeeCounts.every(n => n > 0)),
      possible.some(g => g.organizationCounts.includes(0)),
      possible.some(g => g.organizationCounts.some(n => n > 1)),
      possible.every(g => g.employeeCounts.every(n => n < 2)),
    ]);
    const diagram = body.prompt[1];
    assert.equal(diagram.type, 'diagram');
    assert.equal(diagram.alt, '「組織」と「社員」を実線で結ぶUML関連。組織側の多重度は' +
      ['1', '0..1', '1..*', '1'][i] + '、社員側の多重度は' + ['1..*', '0..*', '0..*', '0..1'][i] + '。');
  }
});

test('問30の全SQLをSQLiteで実行し千円・上下限とOR/ANDの差を照合', () => {
  const official = [[29600, 31900, 36600, 41500], [43500, 45300, 30400, 46400], [49600, 39400, 42300, 51100]];
  for (const [index, body] of cases(30).entries()) {
    const limit = /平均が([\d,]+)万円以上で，どの期でも([\d,]+)万円以上/.exec(prompt(body));
    assert(limit);
    assert.match(prompt(body), /単位は千円/);
    const avg = number(limit[1]) * 10, min = number(limit[2]) * 10;
    const data = body.prompt[1];
    assert.equal(data.type, 'table');
    assert.deepEqual(data.columns, ['番号', '名前', '第1期', '第2期', '第3期', '第4期']);
    assert.deepEqual(data.rows.at(-1), ['⋮', '⋮', '⋮', '⋮', '⋮', '⋮']);
    const displayed = data.rows.slice(0, -1).map(row => row.slice(2).map(number));
    if (index === 0) assert.deepEqual(displayed, official);
    const inputs = [min - 1, min, min + 1, avg - 1, avg, avg + 1, 4 * avg - 3 * min];
    const rows = [...displayed];
    for (const a of inputs) for (const b of inputs) for (const c of inputs) for (const d of inputs)
      rows.push([a, b, c, d]);
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 販売実績 (名前 TEXT, 第1期 INTEGER, 第2期 INTEGER, 第3期 INTEGER, 第4期 INTEGER)');
      const insert = db.prepare('INSERT INTO 販売実績 VALUES (?,?,?,?,?)');
      db.exec('BEGIN');
      rows.forEach((row, i) => insert.run(String(i), ...row));
      db.exec('COMMIT');
      const expected = rows.flatMap((row, i) =>
        row.every(value => value >= min) && row.reduce((a, b) => a + b) / row.length >= avg ? [String(i)] : []).sort();
      const sql = choices(body);
      assert.deepEqual(sql.map(statement => statement.split('\n').length), [4, 4, 5, 4]);
      assert.ok(sql.every(statement => statement.split('\n').slice(2).every(line => line.startsWith('          第'))));
      const results = sql.map(statement => db.prepare(statement).all().map(row => String(row.名前)).sort());
      compare(body, results.map(result => result.length === expected.length && result.every((id, i) => id === expected[i])));
    } finally {
      db.close();
    }
  }
});

test('問31の各更新前後のビュー行数をSQLiteの実ビューで照合', () => {
  const referenceCounts = [
    [2, [1, 3, 2, 2]], [3, [3, 2, 3, 3]], [2, [2, 3, 1, 2]], [3, [3, 3, 3, 2]],
  ] as const;
  for (const [index, body] of cases(31).entries()) {
    const data = body.prompt[1], view = body.prompt[3];
    assert.equal(data.type, 'table');
    assert.equal(view.type, 'code');
    assert.match(view.text, /^CREATE VIEW 収益商品\n {5}AS SELECT \* FROM 商品\n {7}WHERE 売値 - 仕入値 >= \d+$/);
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 商品 (商品コード TEXT, 品名 TEXT, 型式 TEXT, 売値 INTEGER, 仕入値 INTEGER)');
      const insert = db.prepare('INSERT INTO 商品 VALUES (?,?,?,?,?)');
      for (const [id, name, model, sale, cost] of data.rows) insert.run(id, name, model, number(sale), number(cost));
      db.exec(view.text);
      const count = () => Number(db.prepare('SELECT COUNT(*) AS 行数 FROM 収益商品').get()?.行数);
      const before = count();
      const after = choices(body).map(choice => {
        const match = /^商品コードが(S\d+)の(売値|仕入値)を([\d,]+)に更新する。$/.exec(choice);
        assert(match);
        db.exec('BEGIN');
        assert.equal(db.prepare('UPDATE 商品 SET ' + match[2] + '=? WHERE 商品コード=?').run(number(match[3]), match[1]).changes, 1);
        const changed = count();
        db.exec('ROLLBACK');
        return changed;
      });
      assert.deepEqual([before, after], referenceCounts[index]);
      compare(body, after.map(count => count < before));
    } finally {
      db.close();
    }
  }
});

test('問44の4表の双方向TCPポートを実際のパケット方向と照合', () => {
  for (const [index, body] of cases(44).entries()) {
    const found = /インターネット上の(\S+)（ポート番号(\d+)）にアクセス/.exec(prompt(body));
    assert(found);
    const server = found[1], service = Number(found[2]);
    const min = Number(/ポート番号(\d+)以上を使って/.exec(prompt(body))?.[1] ?? 1024);
    const matches = (rule: string[], packet: [string, string, number, number]) => {
      const portMatches = (rule: string, port: number) =>
        rule.endsWith('以上') ? port >= Number(rule.slice(0, -2)) : port === Number(rule);
      return rule[0] === packet[0] && rule[1] === packet[1] &&
        portMatches(rule[2], packet[2]) && portMatches(rule[3], packet[3]);
    };
    const output = body.choices.map(blocks => {
      assert.equal(blocks.length, 1);
      const block = blocks[0];
      assert.equal(block.type, 'table');
      assert.deepEqual(block.columns, ['送信元', 'あて先', '送信元ポート番号', 'あて先ポート番号']);
      assert.deepEqual(block.rows.map(row => row.slice(0, 2)), [['PC', server], [server, 'PC']]);
      if (index === 0) {
        const formatted = block.rows.map(row => row[0] + '→' + row[1] + '：' + row[2] + '→' + row[3] + '。').join('');
        assert.equal(formatted, source[44].choices[body.choices.indexOf(blocks)]);
      }
      return [min, min + 1, 65535].every(client =>
        block.rows.some(rule => matches(rule, ['PC', server, client, service])) &&
        block.rows.some(rule => matches(rule, [server, 'PC', service, client]))) &&
        !block.rows.some(rule => matches(rule, ['PC', server, min - 1, service]));
    });
    compare(body, output);
  }
});

test('問51の公式経路を独立に全列挙しダミー向き・短縮量・昇順を照合', () => {
  const schedules = [[9, 3, 4, 2], [10, 4, 4, 2], [11, 5, 3, 3], [12, 4, 5, 3]];
  const initialPaths = ['A C F H I', 'A B D G', 'A B E H I'];
  const updatedPaths = ['A C F H I', 'A B D G', 'A B E1 E3 H I', 'A B E2 dummy E3 H I'];
  for (const [i, body] of cases(51).entries()) {
    const [E, E1, E2, E3] = schedules[i];
    const durations: Record<string, number> = { A: 5, B: 8, C: 7, D: 7, F: 5, G: 7, H: 4, I: 2, E, E1, E2, E3, dummy: 0 };
    assert.equal(E, E1 + E2 + E3);
    const longest = (paths: string[]) => Math.max(...paths.map(path => path.split(' ').reduce((days, activity) => days + durations[activity], 0)));
    const before = longest(initialPaths), after = longest(updatedPaths);
    if (i === 0) assert.deepEqual([before, after], [28, 27]);
    assert.deepEqual(choices(body), ['1', '2', '3', '4']);
    compare(body, choices(body).map(value => Number(value) === before - after));
    const first = body.prompt[1], second = body.prompt[2];
    assert.equal(first.type, 'diagram');
    assert.equal(second.type, 'diagram');
    assert.match(second.alt, /E2終了点からE1終了点へダミー作業/);
    for (const [figure, paths] of [[first, initialPaths], [second, updatedPaths]] as const) {
      const labels = new Set(paths.flatMap(path => path.split(' ')).filter(label => label !== 'dummy'));
      for (const label of labels) assert.ok(figure.alt.includes(label + 'は' + durations[label] + '日'));
    }
    assert.match(body.explanation, new RegExp(before + '日から' + after + '日'));
  }
});

test('全図の意味・レンダラー対応と12状態のSSRラベル・ダミー線を検査', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  for (const [i, figure] of figures.entries()) {
    assert.deepEqual(figure.domain, [[0, 3]]);
    assert.throws(() => figure.validate([-1]), { code: 'FIGURE_PROFILE' });
    assert.throws(() => figure.validate([4]), { code: 'FIGURE_PROFILE' });
    for (let value = 0; value < 4; value++) {
      const markup = renderToStaticMarkup(createElement(renderers[i].component, { values: [value], caption: '図の検証' }));
      assert.match(markup, /<svg[^>]*role="img"/);
      assert.ok(markup.includes(figure.alt([value])));
      if (i === 0) assert.match(markup, />組織<.*>社員</);
      if (i === 1) assert.match(markup, />凡例<.*>作業名<.*>所要日数<.*ダミー作業</);
      if (i === 2) assert.match(markup, /data-task="ダミー作業"[^>]*stroke-dasharray="3 4"/);
    }
  }
});
