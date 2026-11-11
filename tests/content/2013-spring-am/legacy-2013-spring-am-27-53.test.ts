import assert from 'node:assert/strict';
import { isIPv4 } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2013SpringAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2013-spring-am-27-53';
import { legacy2013SpringAm27To53Source as source } from '../../../src/core/generators/legacy-2013-spring-am-27-53-source';
import { legacy2013SpringAm2753Figures as figures } from '../../../src/core/generators/legacy-2013-spring-am-27-53-figures';
import { legacy2013SpringAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2013SpringAm2753Figures';
import { spring2013KnowledgeFacts as facts } from '../../fixtures/legacy-2013-spring-am-27-53-facts';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Block } from '../../../src/core/types';

const numbers = Array.from({ length: 27 }, (_, i) => i + 27);
const official = 'ウイイアイウアイウイアイウアウアエエイエイアイイアアア';
const pages = [14, 15, 15, 16, 16, 16, 17, 17, 18, 18, 19, 20, 20, 20, 21, 21, 22, 22, 22, 22, 23, 23, 23, 24, 25, 25, 25];
const definition = (number: number) => definitions.find(item => item.source === '2013h25h-fe-am-' + number)!;
const variants = (number: number) => Array.from({ length: definition(number).fields[0].maximum + 1 }, (_, i) => definition(number).build([i]));
type Table = Extract<Block, { type: 'table' }>;
type Diagram = Extract<Block, { type: 'diagram' }>;

function blockText(block: Block) {
  assert.ok('text' in block);
  return block.text;
}
function asTable(block: Block): Table {
  assert.equal(block.type, 'table');
  return block as Table;
}
const paragraphs = (body: GeneratedBody) => body.prompt.filter(block => block.type === 'paragraph').map(blockText).join('\n');
const options = (body: GeneratedBody) => body.choices.map(choice => blockText(choice[0]));
function assertAnswer(body: GeneratedBody, possible: readonly boolean[]) {
  assert.equal(possible.length, 4);
  const matches = possible.flatMap((match, index) => match ? [index] : []);
  assert.equal(matches.length, 1, JSON.stringify(possible));
  assert.equal(body.correctIndex, matches[0]);
}
const sqlBlock = (body: GeneratedBody) => {
  const sql = body.prompt.find(block => block.type === 'code');
  assert.ok(sql?.type === 'code');
  assert.equal(sql.language, 'sql');
  return sql.text;
};

test('問27〜53：27系列、冊子p.14〜25、基準四択と公式解答及び全候補の有効性', () => {
  assert.deepEqual(definitions.map(item => Number(item.source.split('-').at(-1))), numbers);
  for (const [index, number] of numbers.entries()) {
    const def = definition(number);
    const base = def.build([0]);
    assert.deepEqual(def.reference, [0]);
    assert.equal(def.sourceAnswer, official[index]);
    assert.equal('アイウエ'[base.correctIndex!], official[index]);
    assert.equal(blockText(base.prompt[0]), source[number].prompt);
    if (number === 35)
      assert.deepEqual(base.choices.map(choice => asTable(choice[0]).rows[0].join('，')), source[number].choices);
    else assert.deepEqual(options(base), source[number].choices);
    assert.equal(source[number].page, pages[index]);
    const outputs = variants(number);
    assert.ok(outputs.length >= 3, String(number));
    assert.equal(new Set(outputs.map(body => JSON.stringify(body.prompt))).size, outputs.length, String(number));
    assert.ok(new Set(outputs.map(body => JSON.stringify(body.choices[body.correctIndex!]))).size > 1, String(number));
    for (const [input, body] of outputs.entries()) {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert.ok(body.explanation.length > 40);
      assert.deepEqual(body, def.build([input]));
    }
    for (const invalid of [[-1], [0.5], [Number.NaN], [outputs.length], [], [0, 0]])
      assert.throws(() => def.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
  }
});

for (const [number, fact] of Object.entries(facts)) {
  test('問' + number + '：独立資料と各条件の四択の意味を照合', () => {
    const outputs = variants(Number(number));
    assert.equal(outputs.length, fact.cases.length);
    const used = new Set<number>();
    for (const body of outputs) {
      const stem = paragraphs(body);
      const contexts = fact.cases.flatMap((item, index) => item.condition.test(stem) ? [index] : []);
      assert.equal(contexts.length, 1, stem);
      const [index] = contexts;
      const { matches, rejected, conclusion } = fact.cases[index];
      used.add(index);
      const choices = options(body);
      assertAnswer(body, choices.map(choice => matches.test(choice)));
      const roles = [matches, ...rejected];
      for (const choice of choices) assert.equal(roles.filter(role => role.test(choice)).length, 1, choice);
      for (const role of roles) assert.equal(choices.filter(choice => role.test(choice)).length, 1, String(role));
      assert.match(body.explanation, conclusion);
    }
    assert.equal(used.size, fact.cases.length);
    assert.match(fact.basis, /https:\/\//);
  });
}

test('問27：SQLの実行結果と独立した関係代数の四候補を照合', () => {
  const rows = [
    ['x', 'A', 10, 'a', 1], ['y', 'B', 20, 'b', 2], ['z', 'A', 30, 'a', 3], ['w', 'C', 40, 'c', 4],
  ] as const;
  const unionRows = [['x', 'A', 10, 'a', 1], ['u', 'X', 90, 'c', 1]] as const;
  const joinRows = [['a', 81], ['b', 82], ['b', 83], ['d', 84]] as const;
  const canonical = (items: readonly (readonly unknown[])[]) => [...new Set(items.map(row => JSON.stringify(row)))].sort();
  const meanings = {
    '結合と射影': rows.flatMap(row => joinRows.filter(join => join[0] === row[3]).map(join => [row[0], row[1], join[1]])),
    '差と選択': rows.filter(row => !unionRows.some(other => JSON.stringify(row) === JSON.stringify(other)) && row[3] === 'a'),
    '選択と射影': rows.filter(row => row[3] === 'a').map(row => row.slice(0, 3)),
    '和と射影': [...rows, ...unionRows].map(row => row.slice(0, 3)),
  };
  const [selection, joined, union] = variants(27);
  assert.match(paragraphs(selection), /列A1〜A5から成るR表/);
  assert.match(paragraphs(joined), /列B1，B2から成るS表/);
  assert.match(paragraphs(union), /いずれも列A1〜A5/);
  assert.equal(sqlBlock(selection), "SELECT A1, A2, A3 FROM R\n    WHERE A4 = 'a'");
  const expectedExplanations = [/WHERE A4.*選択[\s\S]+SELECT A1.*射影/, /INNER JOINが結合.*SELECTが射影/, /SELECTは.*射影[\s\S]+UNIONは.*和/];
  for (const [index, body] of [selection, joined, union].entries()) {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE R (A1 TEXT, A2 TEXT, A3 INTEGER, A4 TEXT, A5 INTEGER)');
      for (const row of rows) db.prepare('INSERT INTO R VALUES (?, ?, ?, ?, ?)').run(...row);
      if (index === 1) {
        db.exec('CREATE TABLE S (B1 TEXT, B2 INTEGER)');
        for (const row of joinRows) db.prepare('INSERT INTO S VALUES (?, ?)').run(...row);
      } else {
        db.exec('CREATE TABLE S AS SELECT * FROM R WHERE 1 = 0');
        for (const row of unionRows) db.prepare('INSERT INTO S VALUES (?, ?, ?, ?, ?)').run(...row);
      }
      const actual = canonical(db.prepare(sqlBlock(body)).all().map(row => Object.values(row)));
      assertAnswer(body, options(body).map(option => {
        assert.ok(Object.hasOwn(meanings, option), option);
        return JSON.stringify(actual) === JSON.stringify(canonical(meanings[option as keyof typeof meanings]));
      }));
      assert.match(body.explanation, expectedExplanations[index]);
    } finally {
      db.close();
    }
  }
});

test('問28：実SQLと独立した集計・昇順ソートで空欄の全四択を照合', () => {
  const data = [['A', 'J', 1, 'a', 60], ['A', 'J', 2, 'b', 80], ['A', 'Z', 3, 'c', 10],
    ['B', 'J', 4, 'd', 50], ['B', 'Z', 5, 'e', 20], ['B', 'Z', 6, 'f', 40]] as const;
  const average = (samples: readonly number[]) => samples.reduce((sum, score) => sum + score, 0) / samples.length;
  for (const body of variants(28)) {
    const stem = paragraphs(body);
    const schema = stem.split('\n')[1];
    const match = /^(.+)（(.+)）$/.exec(schema);
    assert.ok(match);
    const [, relation, columnList] = match;
    const [first, second, rowId, name, measure] = columnList.split('，');
    const reverseOrder = stem.includes(second + '，' + first + 'の順');
    const [major, minor] = reverseOrder ? [1, 0] : [0, 1];
    const expected = [...new Set(data.map(row => row.slice(0, 2).join(',')))].map(pair => {
      const [left, right] = pair.split(',');
      return [left, right, average(data.filter(row => row[0] === left && row[1] === right).map(row => row[4]))];
    }).sort((a, b) => String(a[major]).localeCompare(String(b[major])) || String(a[minor]).localeCompare(String(b[minor])));
    const sql = sqlBlock(body);
    assert.match(sql, /\n    FROM .+\n    ［a］$/);
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE ' + relation + ' (' + first + ' TEXT, ' + second + ' TEXT, ' + rowId + ' INTEGER, ' + name + ' TEXT, ' + measure + ' INTEGER)');
      for (const row of data) db.prepare('INSERT INTO ' + relation + ' VALUES (?, ?, ?, ?, ?)').run(...row);
      assertAnswer(body, options(body).map(option => {
        let result;
        try {
          result = db.prepare(sql.replace('［a］', option)).all().map(row => Object.values(row));
        } catch (error) {
          assert.match(String(error), /aggregate functions are not allowed in the GROUP BY clause/);
          return false;
        }
        return JSON.stringify(result) === JSON.stringify(expected);
      }));
      assert.ok(body.explanation.includes('GROUP BY ' + first + ', ' + second));
      assert.ok(body.explanation.includes('ORDER BY ' + (reverseOrder ? second + ', ' + first : first + ', ' + second)));
    } finally {
      db.close();
    }
  }
});

test('問29：書名の位置条件を実LIKEと独立文字列判定で全四択照合', () => {
  for (const body of variants(29)) {
    const stem = paragraphs(body);
    const quoted = /書名[にが]“([^”]+)”(を含む|で始まる|で終わる|と完全に一致する)/.exec(stem);
    assert.ok(quoted);
    const [, term, position] = quoted;
    const matcher = {
      'を含む': (text: string) => text.includes(term),
      'で始まる': (text: string) => text.startsWith(term),
      'で終わる': (text: string) => text.endsWith(term),
      'と完全に一致する': (text: string) => text === term,
    }[position]!;
    const titles = [term, '実践' + term, term + 'ガイド', '現場の' + term + '入門編', '一般技術'];
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE BOOKS (書名 TEXT)');
      for (const title of titles) db.prepare('INSERT INTO BOOKS VALUES (?)').run(title);
      const expected = titles.filter(matcher);
      const sql = sqlBlock(body);
      assert.match(stem, /“書名”列に格納/);
      assert.equal(sql, "SELECT * FROM BOOKS WHERE 書名 LIKE '［a］'");
      assertAnswer(body, options(body).map(option => {
        const actual = db.prepare(sql.replace("'［a］'", '?')).all(option).map(row => row.書名);
        return JSON.stringify(actual) === JSON.stringify(expected);
      }));
      assert.match(body.explanation, /0文字以上/);
      assert.match(body.explanation, {
        'を含む': /両側に%/, 'で始まる': /末尾に%/, 'で終わる': /先頭に%/, 'と完全に一致する': /ワイルドカードなし/,
      }[position]!);
    } finally {
      db.close();
    }
  }
});

test('問30：保持と要求の組を独立した容量モデルで判定', () => {
  const cost = { 共有: 1, 専有: 2, なし: 0 };
  for (const [index, body] of variants(30).entries()) {
    const stem = paragraphs(body);
    const claims = [...stem.matchAll(/資源([XYZ])には(共有|専有)ロックを獲得している|資源([XYZ])にはロックを獲得していない/g)];
    const held = new Map(claims.map(([, asset, lock, free]) => [asset ?? free, (lock ?? 'なし') as keyof typeof cost]));
    if (index) assert.equal(held.size, 3);
    assertAnswer(body, options(body).map(option => {
      const original = /(共有|専有)ロックを獲得している資源.*(共有|専有)ロックを獲得することは可能/.exec(option);
      const variant = /資源([XYZ])に(共有|専有)ロックを獲得することは可能/.exec(option);
      assert.ok(index ? variant : original);
      const [present, requested] = original ? [original[1], original[2]] : [held.get(variant![1]), variant![2]];
      return cost[present as keyof typeof cost] + cost[requested as keyof typeof cost] <= 2;
    }));
    assert.match(body.explanation, /共有ロック同士なら同じ資源で共存/);
  }
});

test('問31：IPv4アドレス構文をNodeのパーサで全四択検査', () => {
  for (const body of variants(31)) {
    const stem = paragraphs(body);
    const prefix = /先頭が([0-9.]+)である/.exec(stem)?.[1];
    const candidates = options(body);
    if (prefix) assert.ok(candidates.every(candidate => candidate.startsWith(prefix + '.')));
    assert.match(stem, /正しくない/);
    assertAnswer(body, candidates.map(candidate => !isIPv4(candidate)));
    assert.ok(body.explanation.includes(candidates.find(candidate => !isIPv4(candidate))!));
    assert.match(body.explanation, /0〜255/);
  }
});

test('問32：一伝票に換算した負荷と桁・誤答モデルを独立検算', () => {
  for (const body of variants(32)) {
    const stem = paragraphs(body).replaceAll(',', '');
    const values = /(\d+)バイト／件.*?(\d+)件ずつ.*?(\d+)バイトのヘッダ.*?1時間に平均(\d+)件.*?速度を(\d+)Mビット/.exec(stem);
    assert.ok(values);
    const [size, batch, header, itemsPerHour, rate] = values.slice(1).map(Number);
    const itemsPerSecond = itemsPerHour / 60 / 60;
    const byteCapacityPerSecond = 125000 * rate;
    const ratio = (size + header / batch) * itemsPerSecond / byteCapacityPerSecond * 100;
    const choices = options(body);
    assert.equal(choices[0], (ratio / 8).toFixed(1));
    assert.equal(choices[1], String(Math.round(size * itemsPerSecond / byteCapacityPerSecond * 100)));
    assert.equal(choices[3], String(Math.round((size + header) * itemsPerSecond / byteCapacityPerSecond * 100)));
    assertAnswer(body, choices.map(choice => Math.abs(Number(choice) - ratio) < 0.5));
    assert.deepEqual(choices.map(Number), choices.map(Number).sort((a, b) => a - b));
    assert.ok(body.explanation.includes('およそ' + Math.round(ratio) + '％'));
    assert.ok(body.explanation.includes(String(size * batch + header).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'バイト'));
  }
});

test('問34：FTTH図の登録と利用者宅内・光ファイバの接続、読み上げを照合', () => {
  assert.deepEqual(figures.map(item => item.profile), ['legacy-2013-spring-am-34-ftth']);
  assert.deepEqual(renderers.map(item => item.profile), figures.map(item => item.profile));
  for (const body of variants(34)) {
    const diagram = body.prompt[1] as Diagram;
    assert.equal(diagram.type, 'diagram');
    assert.equal(diagram.scene.kind, 'source_figure');
    if (diagram.scene.kind !== 'source_figure') throw new Error('FTTH図の形式が異なる');
    assert.equal(diagram.scene.profile, figures[0].profile);
    assert.deepEqual(diagram.scene.values, [0]);
    assert.deepEqual(figures[0].domain, [[0, 0]]);
    assert.equal(figures[0].alt(diagram.scene.values), diagram.alt);
    const markup = renderToStaticMarkup(createElement(renderers[0].component, { values: [0], caption: diagram.caption }));
    assert.match(markup, /利用者宅内[\s\S]+PC[\s\S]+PC[\s\S]+ハブ[\s\S]+装置A[\s\S]+ONU[\s\S]+光ファイバケーブル（FTTH）/);
    assert.match(markup, /<path d="M95 55L128 74M95 118L128 100M190 87H218M286 87H316M381 87H622"/);
    assert.match(markup, /<desc[^>]*>.*各PCはハブにつながる。ハブから装置A、装置AからONUにつながり/);
    assert.match(markup, /tabindex="0".*<svg[\s\S]+aria-describedby=/);
  }
});

test('問35：各識別対象で必要となるアドレス・ポート、表の各列と全候補を照合', () => {
  const columns = ['宛先MACアドレス', '送信元MACアドレス', '宛先IPアドレス', '送信元IPアドレス', '宛先TCPポート番号', '送信元TCPポート番号'];
  for (const body of variants(35)) {
    const stem = paragraphs(body);
    assert.match(stem, /必要な情報は“○”で表し，不要な情報は“×”で表す/);
    const layer = /TCPのコネクション/.test(stem) ? 'transport' : /IP層で/.test(stem) ? 'network' : 'link';
    if (layer === 'link') assert.match(stem, /同じイーサネット区間[\s\S]+データリンク層/);
    const active = {
      transport: /IPアドレス|TCPポート番号/, network: /IPアドレス/, link: /MACアドレス/,
    }[layer];
    assertAnswer(body, body.choices.map(choice => {
      const view = asTable(choice[0]);
      assert.deepEqual(view.columns, columns);
      assert.equal(view.captionPresentation, 'accessible');
      assert.equal(view.rows.length, 1);
      assert.equal(view.rows[0].length, columns.length);
      assert.ok(view.rows[0].every(mark => mark === '○' || mark === '×'));
      const indicated = view.rows[0].flatMap((mark, index) => mark === '○' ? [columns[index]] : []);
      return JSON.stringify(indicated) === JSON.stringify(columns.filter(field => active.test(field)));
    }));
    assert.match(body.explanation, {
      transport: /IPアドレスとTCPポート番号の四つ組/,
      network: /二つのIPアドレス/, link: /二つのMACアドレス/,
    }[layer]);
  }
});

test('問42：原資料と同じ番号順、注記、二表を使用し独立したパターン判定で全四択を確認', () => {
  const columns = ['送信元アドレス', '宛先アドレス', 'プロトコル', '送信元ポート番号', '宛先ポート番号'];
  const expectedRules = [
    ['1', '10.1.2.3', '*', '*', '*', '*', '通過禁止'],
    ['2', '*', '10.2.3.*', 'TCP', '*', '25', '通過許可'],
    ['3', '*', '10.1.*', 'TCP', '*', '25', '通過許可'],
    ['4', '*', '*', '*', '*', '*', '通過禁止'],
  ];
  const firstHits = new Set<string>();
  for (const body of variants(42)) {
    const stem = paragraphs(body);
    assert.match(stem, /1から順にルールの適用判断[\s\S]+残りのルールは適用しない[\s\S]+\*は任意のパターン/);
    const rules = asTable(body.prompt[1]);
    const packet = asTable(body.prompt[3]);
    assert.deepEqual(rules.columns, ['番号', ...columns, '動作']);
    assert.deepEqual(rules.rows, expectedRules);
    assert.deepEqual(packet.columns, columns);
    assert.equal(packet.rows.length, 1);
    const hits = rules.rows.filter(rule => rule.slice(1, -1).every((pattern, column) => {
      const escaped = pattern.replaceAll('.', '\\.').replaceAll('*', '.*');
      return new RegExp('^' + escaped + '$').test(packet.rows[0][column]);
    }));
    assert.ok(hits.length > 0);
    const [first] = hits;
    firstHits.add(first[0]);
    assert.deepEqual(options(body).map(choice => /^番号(\d)/.exec(choice)?.[1]), ['1', '2', '3', '4']);
    assertAnswer(body, options(body).map(choice =>
      choice.startsWith('番号' + first[0] + 'によって') && choice.includes(first[6].slice(-2) + 'する')));
    assert.match(body.explanation, new RegExp('最初に全欄が合うのは番号' + first[0] + 'なので' + first[6]));
  }
  assert.equal(firstHits.size, 4);
});

test('問53：五機能の原表と補正係数、整数比で全四択を独立検算', () => {
  const functions = ['外部入力', '外部出力', '内部論理ファイル', '外部インタフェースファイル', '外部照会'];
  for (const [index, body] of variants(53).entries()) {
    const coefficient = /補正係数は0\.(\d+)とする/.exec(paragraphs(body));
    assert.ok(coefficient);
    const numerator = BigInt(coefficient[1]);
    const denominator = 10n ** BigInt(coefficient[1].length);
    const items = asTable(body.prompt[1]);
    assert.deepEqual(items.columns, ['ユーザファンクションタイプ', '個数', '重み付け係数']);
    assert.deepEqual(items.rows.map(row => row[0]), functions);
    assert.deepEqual(items.rows.map(row => row[2]), ['4', '5', '10', '7', '4']);
    if (!index) assert.deepEqual(items.rows.map(row => row[1]), ['1', '2', '1', '0', '0']);
    const units = items.rows.flatMap(([, count, weight]) => Array(Number(count)).fill(BigInt(weight)) as bigint[]);
    const unadjusted = units.reduce((sum, unit) => sum + unit, 0n);
    assert.equal(unadjusted * numerator % denominator, 0n);
    assert.equal(unadjusted * denominator % numerator, 0n);
    const choices = options(body).map(value => BigInt(value));
    assert.deepEqual(choices, [
      unadjusted * numerator / denominator,
      unadjusted,
      unadjusted * (2n * denominator - numerator) / denominator,
      unadjusted * denominator / numerator,
    ]);
    assertAnswer(body, choices.map(choice => choice * denominator === unadjusted * numerator));
    assert.ok(body.explanation.includes('＝' + choices[0] + 'ファンクションポイント'));
  }
});
