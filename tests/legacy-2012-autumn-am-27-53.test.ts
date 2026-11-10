import assert from 'node:assert/strict';
import { isIPv4 } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2012AutumnAm27To53Definitions as definitions } from '../src/core/generators/legacy-2012-autumn-am-27-53';
import { legacy2012AutumnAm2753Figures as figures } from '../src/core/generators/legacy-2012-autumn-am-27-53-figures';
import source from '../src/core/generators/legacy-2012-autumn-am-27-53-source.json';
import { legacy2012AutumnAm2753FigureRenderers as renderers } from '../src/ui/Legacy2012AutumnAm2753Figures';
import { knowledgeFacts } from './fixtures/legacy-2012-autumn-am-27-53-facts';

const numbers = Array.from({ length: 27 }, (_, i) => i + 27);
const paperKeys = 'イイアエウウエエイイイウイアイイアウエイエイエアイエエ';
const definition = (number: number) => definitions.find(row => row.source === '2012h24a-fe-am-' + number)!;
const cases = (number: number) => Array.from({ length: definition(number).fields[0].maximum + 1 }, (_, i) => definition(number).build([i]));

function paragraph(block: Block) {
  assert.equal(block.type, 'paragraph');
  return block.text;
}
function asTable(block: Block) {
  assert.equal(block.type, 'table');
  return block;
}
const prompt = (body: GeneratedBody) => body.prompt.filter(block => block.type === 'paragraph').map(paragraph).join('\n');
const options = (body: GeneratedBody) => body.choices.map(choice => paragraph(choice[0]));
const number = (text: string) => Number(text.replaceAll(',', ''));
const checkAnswer = (body: GeneratedBody, decisions: readonly boolean[]) => {
  assert.equal(decisions.length, 4);
  assert.deepEqual(decisions.flatMap((match, index) => match ? [index] : []), [body.correctIndex], prompt(body));
};

function optionWithRecord(choice: Block[]) {
  const [prefix, row, suffix] = choice;
  return paragraph(prefix) + '［' + asTable(row).rows[0].join('，') + '］' + paragraph(suffix);
}

test('問27〜53：公式27問の基準・全選択肢・許可する全入力を照合', () => {
  assert.deepEqual(definitions.map(row => Number(row.source.split('-').at(-1))), numbers);
  assert.equal(paperKeys.length, 27);
  for (const [i, n] of numbers.entries()) {
    const def = definition(n);
    const original = source[String(n) as keyof typeof source];
    const base = def.build([0]);
    assert.equal(def.sourceAnswer, paperKeys[i]);
    assert.equal('アイウエ'[base.correctIndex!], paperKeys[i]);
    assert.equal(paragraph(base.prompt[0]), original.prompt);
    if (n === 31) assert.deepEqual(base.choices.map(optionWithRecord), original.choices);
    else if (n === 33) assert.deepEqual(base.choices.map(choice => asTable(choice[0]).rows[0].join('｜')), original.choices);
    else assert.deepEqual(options(base), original.choices);
    const outputs = cases(n);
    assert.deepEqual(def.reference, [0]);
    assert.equal(def.fields[0].minimum, 0);
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
  test('問' + id + '：独立資料で定めた各問いと全選択肢の役割・結論を照合', () => {
    const outputs = cases(Number(id)), visited = new Set<RegExp>();
    assert.equal(outputs.length, facts.cases.length);
    assert.match(facts.basis, /https:\/\//);
    for (const body of outputs) {
      const matching = facts.cases.filter(row => row.condition.test(prompt(body)));
      assert.equal(matching.length, 1, prompt(body));
      const [{ condition, expected, conclusion }] = matching;
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

test('問28：規約に明示された型・値域・異音同義語・区分語から防止できない全候補を照合', () => {
  const outcomes = [/日付型と文字列型が混在/, /取り得る値の範囲がテーブルによって異なる/,
    /同じ意味で/, /取引先コード.*取引先名.*判別できない/];
  const conditions = [/区分語ごとに定めたデータ型|データ型.*全表で統一/,
    /金額の許容範囲.*全表で統一/, /異音同義語や同音異義語が発生しない/, /末尾には必ず.*区分語を付与/];
  for (const body of cases(28)) {
    const text = prompt(body);
    assert.match(text, /回避できない問題/);
    assert.match(text, /〔命名規約〕\n\(1\)[\s\S]*\n\(2\)/);
    checkAnswer(body, options(body).map(choice => {
      const indexes = outcomes.flatMap((pattern, index) => pattern.test(choice) ? [index] : []);
      assert.equal(indexes.length, 1, choice);
      return !conditions[indexes[0]].test(text);
    }));
    const conclusions = [/日付型と文字列型が混在/, /値の範囲が表ごとに異なる/, /異音同義語を防ぐ/, /項目種別を判別できるとは限らない/];
    assert.match(body.explanation, conclusions[body.correctIndex!]);
  }
});

test('問29：実SQLiteで元のSQLビューと全四更新を個別に照合', () => {
  for (const body of cases(29)) {
    const rows = asTable(body.prompt[1]);
    assert.deepEqual(rows.columns, ['商品コード', '品名', '型式', '売値', '仕入値']);
    assert.equal(rows.rows.length, 3);
    const definition = body.prompt[3];
    assert.equal(definition.type, 'code');
    assert.equal(definition.language, 'sql');
    assert.match(definition.text, /WHERE 売値 - 仕入値 >= \d+$/);
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 商品 (商品コード TEXT PRIMARY KEY, 品名 TEXT, 型式 TEXT, 売値 INTEGER, 仕入値 INTEGER)');
      for (const [id, label, model, sale, cost] of rows.rows)
        db.prepare('INSERT INTO 商品 VALUES (?, ?, ?, ?, ?)').run(id, label, model, number(sale), number(cost));
      db.exec(definition.text);
      const count = () => Number(db.prepare('SELECT count(*) AS n FROM 収益商品').get()!.n);
      const before = count();
      const after = options(body).map(choice => {
        const parsed = /^商品コードが(S\d+)の(売値|仕入値)を([\d,]+)に更新する。$/.exec(choice);
        assert.ok(parsed);
        const [, id, field, value] = parsed;
        db.exec('SAVEPOINT one_update');
        assert.equal(db.prepare('UPDATE 商品 SET ' + field + ' = ? WHERE 商品コード = ?').run(number(value), id).changes, 1);
        const result = count();
        db.exec('ROLLBACK TO one_update; RELEASE one_update');
        return result;
      });
      checkAnswer(body, after.map(result => result < before));
      assert.match(body.explanation, new RegExp('更新前は' + before + '行.*' + after.join('，') + '行'));
    } finally { db.close(); }
  }
});

test('問31：参照方向・二つの表・元の列順を使い，実SQLiteで全候補の制約違反を照合', () => {
  for (const body of cases(31)) {
    assert.match(prompt(body), /“顧客”表の主キー“顧客番号”を参照する外部キー/);
    assert.match(prompt(body), /それぞれの表の列の並びと同順/);
    const orders = asTable(body.prompt[1]), customers = asTable(body.prompt[2]);
    assert.deepEqual(orders.columns, ['伝票番号', '顧客番号']);
    assert.deepEqual(customers.columns, ['顧客番号', '顧客名']);
    assert.deepEqual([orders.rows.length, customers.rows.length], [4, 4]);
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('PRAGMA foreign_keys = ON; CREATE TABLE 顧客 (顧客番号 TEXT PRIMARY KEY, 顧客名 TEXT);' +
        'CREATE TABLE 注文 (伝票番号 TEXT PRIMARY KEY, 顧客番号 TEXT REFERENCES 顧客(顧客番号))');
      for (const row of customers.rows) db.prepare('INSERT INTO 顧客 VALUES (?, ?)').run(...row);
      for (const row of orders.rows) db.prepare('INSERT INTO 注文 VALUES (?, ?)').run(...row);
      checkAnswer(body, body.choices.map(choice => {
        const [prefix, table, suffix] = choice;
        const target = /^“(注文|顧客)”表(の行|に行)$/.exec(paragraph(prefix));
        assert.ok(target);
        const row = asTable(table);
        assert.deepEqual(row.columns, target[1] === '注文' ? orders.columns : customers.columns);
        const statement = paragraph(suffix);
        const action = /^を(追加|削除)する。$/.exec(statement);
        assert.ok(action);
        const sql = action[1] === '追加' ? 'INSERT INTO ' + target[1] + ' VALUES (?, ?)'
          : 'DELETE FROM ' + target[1] + ' WHERE ' + row.columns[0] + ' = ? AND ' + row.columns[1] + ' = ?';
        db.exec('SAVEPOINT one_operation');
        try {
          assert.equal(db.prepare(sql).run(...row.rows[0]).changes, 1);
          return false;
        } catch (error) {
          assert.match(String(error), /FOREIGN KEY constraint failed/);
          return true;
        } finally {
          db.exec('ROLLBACK TO one_operation; RELEASE one_operation');
        }
      }));
      assert.match(body.explanation, /参照先/);
    } finally { db.close(); }
  }
});

test('問32：送信能力と使用ビットから回線利用率を独立に求め，三つの誤算も照合', () => {
  for (const body of cases(32)) {
    const values = /通信速度([\d,]+)ビット／秒.*平均([\d,]+)バイト.*(\d+)秒ごとに転送.*転送量の(\d+)％/.exec(prompt(body));
    assert.ok(values);
    const [rate, bytes, seconds, percent] = values.slice(1).map(number);
    // 転送に実際にかかる時間をまず求め，送信間隔で割る。
    const fileTime = bytes / (rate / 8);
    const used = 100 * (fileTime + fileTime * percent / 100) / seconds;
    assert.ok(Math.abs(used * 10 - Math.round(used * 10)) < 1e-9);
    const round = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;
    const candidates = options(body);
    assert.ok(candidates.every(choice => /^\d{1,2}\.\d$/.test(choice)));
    assert.deepEqual(candidates.map(Number), [round(used / 8), round(100 * fileTime / seconds), used, round(used * seconds ** 2)]);
    checkAnswer(body, candidates.map(choice => Number(choice) === used));
    assert.ok(body.explanation.includes('×100＝' + used.toFixed(1) + '％'));
  }
});

test('問33：IEEEの識別子の先頭・後続ビット数と四つの役割の組合せを照合', () => {
  const standard = [
    { ask: /MACアドレスの構成/, bits: [24, 24], first: /^OUI（ベンダID）$/, second: /^固有製造番号$/,
      incorrectFirst: /^エリアID$/, incorrectSecond: /^IPアドレス$/, answer: /先頭24ビットを組織のOUI/ },
    { ask: /EUI-64の構成/, bits: [24, 40], first: /^OUI（組織識別子）$/, second: /^その組織が割り当てる拡張番号$/,
      incorrectFirst: /^エリアID$/, incorrectSecond: /^IPアドレス$/, answer: /24ビット.*40ビット.*64ビット/ },
    { ask: /IABを割り当てられた組織/, bits: [36, 12], first: /^IABで割り当てられた識別子$/, second: /^割当先の組織が付ける番号$/,
      incorrectFirst: /^IPネットワーク番号$/, incorrectSecond: /^IPアドレスの一部$/, answer: /36ビット.*12ビット.*48ビット/ },
  ];
  for (const body of cases(33)) {
    const matches = standard.filter(row => row.ask.test(prompt(body)));
    assert.equal(matches.length, 1);
    const [fact] = matches;
    checkAnswer(body, body.choices.map(choice => {
      const pair = asTable(choice[0]);
      assert.deepEqual(pair.columns, ['先頭' + fact.bits[0] + 'ビット', '後続' + fact.bits[1] + 'ビット']);
      assert.equal(pair.rows.length, 1);
      const [[first, second]] = pair.rows;
      assert.notEqual(fact.first.test(first), fact.incorrectFirst.test(first));
      assert.notEqual(fact.second.test(second), fact.incorrectSecond.test(second));
      return fact.first.test(first) && fact.second.test(second);
    }));
    assert.match(body.explanation, fact.answer);
  }
});

test('問36：マスクの区間境界と有効ホストの条件を全IPv4対で独立検算', () => {
  for (const body of cases(36)) {
    const match = /サブネットマスクが255\.255\.255\.(\d+)/.exec(prompt(body));
    assert.ok(match);
    const step = 256 - Number(match[1]);
    assert.ok([8, 16, 32, 64].includes(step));
    const entries = options(body).map(choice => {
      const pair = choice.split(' と ');
      assert.equal(pair.length, 2);
      assert.ok(pair.every(address => isIPv4(address)));
      return pair.map(address => address.split('.').map(Number));
    });
    const prefix = entries[0][0].slice(0, 3);
    for (const pair of entries) for (const address of pair) {
      assert.deepEqual(address.slice(0, 3), prefix);
      assert.ok(address[3] % step >= 1 && address[3] % step < step - 1);
    }
    checkAnswer(body, entries.map(([a, b]) => Math.floor(a[3] / step) === Math.floor(b[3] / step)));
    assert.match(body.explanation, new RegExp(step + '個ずつの区間'));
  }
});

test('問38：各受信者の復号鍵に対応する暗号化鍵と四つの鍵の持ち主を照合', () => {
  for (const body of cases(38)) {
    const people = /([A-C])さんから([A-C])さんへ/.exec(prompt(body));
    assert.ok(people);
    const [, sender, recipient] = people;
    assert.notEqual(sender, recipient);
    const panel = body.prompt[1];
    assert.equal(panel.type, 'diagram');
    assert.match(panel.alt, new RegExp('左の' + sender + 'さん.*鍵Kによって暗号化'));
    assert.match(panel.alt, new RegExp('右の' + recipient + 'さん.*' + recipient + 'さんの秘密鍵によって復号'));
    const bank = [sender + 'さんの公開鍵', sender + 'さんの秘密鍵', recipient + 'さんの公開鍵', '共通の秘密鍵'];
    assert.deepEqual(options(body), bank);
    checkAnswer(body, options(body).map(option => option === recipient + 'さんの公開鍵'));
    assert.match(body.explanation, new RegExp(recipient + 'さんの公開鍵で暗号化'));
  }
});

test('問39：時間的な動作と身体形態を各方式から判定', () => {
  const activity = /署名.*(速度|筆圧)|打鍵間隔|歩くときの関節|歩行から足|入力中にキーを押す/;
  const structure = /血管の分岐|虹彩のしわ|どう孔から|隆線|顔画像|顔の静止画像/;
  for (const body of cases(39)) {
    const physical = /身体的特徴を用いているもの|静止画像から得た身体的特徴/.test(prompt(body));
    checkAnswer(body, options(body).map(choice => {
      const dynamic = activity.test(choice), bodily = structure.test(choice);
      assert.notEqual(dynamic, bodily, choice);
      return physical ? bodily : dynamic;
    }));
    assert.match(body.explanation, physical ? /身体の形態|身体形態/ : /行動の特徴|行動的特徴/);
  }
});

test('問42：三つの試行結果から可能なビット割当てを列挙し，四択すべてを判定', () => {
  const permissions = ['読取り', '書込み', '実行'];
  const bitMaps = [[1, 2, 4], [1, 4, 2], [2, 1, 4], [2, 4, 1], [4, 1, 2], [4, 2, 1]];
  const bits = (n: number) => n.toString(2).padStart(3, '0').split('').map(Number).reverse();
  for (const body of cases(42)) {
    const content = prompt(body);
    assert.match(content, /8進数表現0〜7/);
    assert.match(content, /① 0を設定したら，読取り，書込み，実行ができなくなった|① 0を設定したら，読取り，書込み，実行ができなくなってしまった/);
    assert.match(content, /③ 7を設定したら，読取り，書込み，実行ができるようになった/);
    const trial = /② (\d)を設定したら，(.+)はできたが，(.+)ができなかった。/.exec(content);
    assert.ok(trial);
    const allow = (n: number, map: number[]) => permissions.filter((_, i) => bits(n)[Math.log2(map[i])] === 1);
    const valid = bitMaps.filter(map => allow(Number(trial[1]), map).join('と') === trial[2]);
    assert.equal(valid.length, 2);
    checkAnswer(body, options(body).map(choice => {
      const match = /^(\d)を設定すると，(.+?)(?:だけ)?ができる。$/.exec(choice);
      assert.ok(match);
      const truths = valid.map(map => allow(Number(match[1]), map).join('と') === match[2]);
      assert.ok(truths.every(value => value === truths[0]), choice);
      return truths[0];
    }));
    assert.match(body.explanation, new RegExp(trial[3] + 'だけが許可'));
  }
});

test('問52：アローの6作業から独立に列挙した3経路で全四候補の短縮日数を検算', () => {
  for (const body of cases(52)) {
    assert.match(prompt(body), /作業A〜Eの幾つかを1日ずつ短縮/);
    assert.match(prompt(body), /全体を2日短縮/);
    const panel = body.prompt[1];
    assert.equal(panel.type, 'diagram');
    const edges = [...panel.alt.matchAll(/作業([A-F])（(\d+)日）/g)];
    assert.equal(edges.length, 6);
    const days = Object.fromEntries(edges.map(([, label, duration]) => [label, Number(duration)]));
    assert.deepEqual(Object.keys(days), ['A', 'B', 'C', 'D', 'E', 'F']);
    const totals = (shortened: string[]) => ['AD', 'BCD', 'BEF'].map(path =>
      [...path].map(edge => days[edge] - Number(shortened.includes(edge))).reduce((sum, day) => sum + day));
    const initial = Math.max(...totals([]));
    const reductions = options(body).map(choice => initial - Math.max(...totals(choice.split(', '))));
    checkAnswer(body, reductions.map(days => days === 2));
    assert.match(body.explanation, new RegExp('元の期間は' + initial + '日.*順に' + reductions.join('，') + '日'));
  }
});

test('問53：開発・導入教育・管理の人月を整数比で独立検算し，誤答の加算漏れも照合', () => {
  for (const body of cases(53)) {
    const values = /(\d+)ファンクションポイント.*教育の工数が(\d+)人月.*合わせた工数の(\d+)％.*1人月当たり(\d+)FP/.exec(prompt(body));
    assert.ok(values);
    const [points, extra, percent, perMonth] = values.slice(1).map(Number);
    assert.equal(points % perMonth, 0);
    const count = points / perMonth, withExtras = count + extra;
    // 1.10倍・1.20倍を掛ける形で管理を含む全工数を算出。
    const complete = withExtras * (100 + percent) / 100;
    assert.ok(Number.isInteger(complete));
    const numbers = options(body).map(Number);
    assert.deepEqual(numbers, [count + extra * percent / 100, withExtras, count * (100 + percent) / 100 + extra, complete]);
    checkAnswer(body, numbers.map(candidate => candidate === complete));
    assert.match(body.explanation, new RegExp('＋' + (complete - withExtras) + '＝' + complete + '人月'));
  }
});

test('問38・52：許可する8図のSVG・説明・矢印・条件を静的に照合', () => {
  assert.deepEqual(figures.map(entry => entry.profile), renderers.map(entry => entry.profile));
  for (const [index, n] of [38, 52].entries()) {
    for (const body of cases(n)) {
      const panel = body.prompt[1];
      assert.equal(panel.type, 'diagram');
      assert.equal(panel.scene.kind, 'source_figure');
      const { profile, values } = panel.scene;
      const figure = figures[index];
      const renderer = renderers[index];
      assert.equal(profile, figure.profile);
      assert.equal(figure.alt(values), panel.alt);
      assert.throws(() => figure.validate([-1]), { code: 'FIGURE_PROFILE' });
      assert.throws(() => figure.validate([4]), { code: 'FIGURE_PROFILE' });
      const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: panel.caption }));
      assert.match(html, /class="diagram-scroll" tabindex="0"/);
      assert.match(html, /role="img" aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
      assert.ok(html.includes(panel.alt));
      assert.match(html, /orient="auto"/);
      assert.equal((html.match(/marker-end=/g) ?? []).length, n === 38 ? 6 : 7);
      if (n === 38) {
        const receiver = /右の([A-C])さん/.exec(panel.alt)![1];
        assert.match(html, new RegExp(receiver + 'さんの秘密鍵</text>'));
        assert.match(html, /ネットワーク<\/text>/);
      } else {
        for (const [, label, duration] of panel.alt.matchAll(/作業([A-F])（(\d+)日）/g))
          assert.match(html, new RegExp('>' + label + '</text><text[^>]+>' + duration + '</text>'));
        assert.match(html, /凡例<\/text>/);
      }
    }
  }
});
