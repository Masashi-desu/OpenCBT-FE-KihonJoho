import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005AutumnAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2005-autumn-am-54-80';
import { autumn2005Am5480Source as source } from '../../../src/core/generators/legacy-2005-autumn-am-54-80-source';
import { legacy2005AutumnAm5480Figures as figures } from '../../../src/core/generators/legacy-2005-autumn-am-54-80-figures';
import { legacy2005AutumnAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2005AutumnAm5480Figures';

const inputs = [0, 1, 2, 3];
const body = (n: number, i: number) => definitions.find(d => d.source === `2005h17a-fe-am-${n}`)!.build([i]);
const paragraphs = (blocks: Block[]) => blocks.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const numeric = (s: string) => Number(s.replaceAll(',', ''));
const answers = 'アイウエ';

function assertOne(truth: boolean[], output: GeneratedBody, motive: string) {
  assert.deepEqual(truth.flatMap((value, i) => value ? [i] : []), [output.correctIndex], motive);
}

function selectPrompt(prompt: string, rules: readonly RegExp[]) {
  const hits = rules.flatMap((pattern, i) => pattern.test(prompt) ? [i] : []);
  assert.equal(hits.length, 1, prompt);
  return hits[0];
}

function expectMatching(number: number, prompts: readonly RegExp[], options: readonly RegExp[]) {
  for (const index of inputs) {
    const output = body(number, index), prompt = paragraphs(output.prompt);
    const roles = output.choices.map(choice => selectPrompt(paragraphs(choice), options));
    assert.equal(new Set(roles).size, 4, `問${number}: ${prompt}`);
    assertOne(roles.map(role => role === selectPrompt(prompt, prompts)), output, `問${number}: ${prompt}`);
  }
}

test('問54〜80の公式80問表の該当欄、原文と解答順、四つの異なる出題条件を保持する', () => {
  // The answer-grid columns start at 41 and 61, so take rows 54–60 and 61–80 separately.
  const independentlyTranscribed = 'アアエウイエイ' + 'エイアイウウアアエエイウアウウイエイエア';
  assert.equal(independentlyTranscribed.length, 27);
  assert.equal(definitions.length, 27);
  for (const [i, definition] of definitions.entries()) {
    const number = 54 + i;
    assert.equal(definition.source, `2005h17a-fe-am-${number}`);
    assert.equal(definition.sourceAnswer, independentlyTranscribed[i]);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    const built = inputs.map(index => definition.build([index]));
    assert.equal(answers[built[0].correctIndex!], definition.sourceAnswer, definition.source);
    assert.equal(paragraphs(built[0].prompt).split('\n')[0], source[number].prompt, definition.source);
    if (number !== 62) assert.deepEqual(built[0].choices.map(paragraphs), source[number].choices, definition.source);
    const visible = built.map(({ prompt }) => JSON.stringify(prompt.map(block => {
      if (block.type === 'diagram') return [block.type, block.alt];
      return block;
    })));
    assert.equal(new Set(visible).size, 4, definition.source);
    for (const output of built) {
      assert.equal(output.choices.length, 4);
      assert.equal(new Set(output.choices.map(blocks => JSON.stringify(blocks))).size, 4);
      assert(output.explanation.trim().length >= 30 && output.correctIndex! >= 0 && output.correctIndex! <= 3);
    }
    for (const invalid of [[], [0, 2], [-1], [4], [1.5], [NaN]]) {
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
});

test('問54〜56のアクセス制御、外部プログラムの呼出し、Webへのネットワーク機能の全肢を照合する', () => {
  expectMatching(54, [/CSMA\/CD/, /CSMA\/CA/, /トークンパッシング/, /時分割多元接続/],
    [/衝突が生じたとき.*中断.*後に再送/, /(?:時分割多重化されるので|同時に送信を始める可能性)/, /トークンを獲得/, /タイムスロットに合わせて/]);
  for (const index of inputs) {
    const output = body(55, index), prompt = paragraphs(output.prompt);
    const expected = /要求ID/.test(prompt) ? 'FastCGI' : /Javaサーブレット/.test(prompt) ? 'AJP/1.3'
      : /Pythonの呼出し/.test(prompt) ? 'WSGI' : 'CGI';
    const alternatives = output.choices.map(paragraphs);
    const expectedBank = index ? ['CGI', 'FastCGI', 'AJP/1.3', 'WSGI'] : ['CGI', 'HTML', 'MIME', 'URL'];
    assert.deepEqual(new Set(alternatives), new Set(expectedBank));
    assertOne(alternatives.map(option => option === expected), output, prompt);
  }
  expectMatching(56, [/DNSサーバ/, /DHCPサーバ/, /NAT機能/, /プロキシサーバ/],
    [/ホスト名に対応するIPアドレス/, /IPアドレスを動的に割り当てる/, /プライベートIPアドレス.*相互変換/, /代わりに外部サーバに接続/]);
});

test('問57は実際に描画した各経路と宛先を照合し，LAN内のMACアドレスとIPの経路選択を区別する', () => {
  const expected = [['a', 'b', 'c'], ['a', 'c', 'b'], ['b', 'a', 'c'], ['c', 'b', 'a']];
  for (const index of inputs) {
    const output = body(57, index), [start, target, other] = expected[index];
    const description = paragraphs(output.prompt);
    assert(description.includes(`端末${start}から端末${target}あて`));
    const drawing = output.prompt.find(block => block.type === 'diagram');
    assert(drawing?.type === 'diagram' && drawing.scene.kind === 'source_figure');
    assert(drawing.alt.includes(`ルータ${start}から専用線が2本延び`));
    for (const label of [start, target, other]) assert(drawing.alt.includes(`ルータ${label}`));
    const choices = output.choices.map(paragraphs);
    assert.equal(choices.filter(option => option.includes(`ルータ${target}だけ`)).length, 3);
    assert(choices.some(option => option.includes(`ルータ${other}`) && option.includes('両方')));
    assertOne(choices.map(option => option.includes('IPアドレスに基づいて') && !option.includes('MACアドレス') &&
      option.includes(`ルータ${target}だけ`)), output, description);
  }
});

test('問58〜60のデータモデル，データベースの構造，関係演算を異なる用語と混同しない', () => {
  expectMatching(58, [/実体と実体間/, /木構造/, /属性とタプル/, /複数の親/], [/^E-Rモデル$/, /^階層モデル$/, /^関係モデル$/, /^ネットワークモデル$/]);
  expectMatching(59, [/階層型/, /XMLデータベース/, /オブジェクト指向/, /関係データベース/],
    [/親レコードと子レコードをポインタ/, /タグを用いて/, /データと手続を一体化/, /2次元の表/]);
  expectMatching(60, [/関係演算の選択/, /関係演算の射影/, /関係演算の積集合/, /関係演算の結合/],
    [/条件を満足するタプルを選/, /指定された属性だけ/, /共通に存在するタプル/, /タプル同士を結合/]);
});

test('問61のSQLビューを実際に作成し，各更新を単独に行った場合の行数を全条件で調べる', () => {
  for (const index of inputs) {
    const output = body(61, index), view = output.prompt.find(block => block.type === 'code');
    const data = output.prompt.find(block => block.type === 'table');
    assert(view?.type === 'code' && view.language === 'sql' && data?.type === 'table');
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 商品 (商品コード TEXT, 品名 TEXT, 型式 TEXT PRIMARY KEY, 売値 INTEGER, 仕入値 INTEGER);');
      const insert = db.prepare('INSERT INTO 商品 VALUES(?,?,?,?,?)');
      for (const [id, name, model, price, cost] of data.rows) insert.run(id, name, model, numeric(price), numeric(cost));
      db.exec(view.text);
      const count = () => Number(db.prepare('SELECT count(*) AS rowCount FROM 収益商品').get()!.rowCount);
      const before = count();
      assert.equal(before, 2);
      const after = output.choices.map(choice => {
        const match = /^型式が([RST]2003)の(売値|仕入値)を([0-9,]+)に更新する。$/.exec(paragraphs(choice));
        assert(match);
        db.exec('SAVEPOINT candidate');
        db.prepare(`UPDATE 商品 SET ${match[2]} = ? WHERE 型式 = ?`).run(numeric(match[3]), match[1]);
        const rows = count();
        db.exec('ROLLBACK TO candidate; RELEASE candidate;');
        return rows;
      });
      assertOne(after.map(n => n < before), output, `問61 条件${index}`);
    } finally { db.close(); }
  }
});

test('問62の表示SQLをSQLiteで全条件実行し，四つの結果表を行順と分けて比較する', () => {
  for (const index of inputs) {
    const output = body(62, index), tables = output.prompt.filter(block => block.type === 'table');
    const select = output.prompt.find(block => block.type === 'code');
    assert.equal(tables.length, 2);
    assert(select?.type === 'code' && select.language === 'sql');
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 学生 (氏名 TEXT, 所属 TEXT, 住所 TEXT); CREATE TABLE 学部 (学部名 TEXT, 住所 TEXT);');
      for (const row of tables[0].rows) db.prepare('INSERT INTO 学生 VALUES(?,?,?)').run(...row);
      for (const row of tables[1].rows) db.prepare('INSERT INTO 学部 VALUES(?,?)').run(...row);
      const rows = db.prepare(select.text).all().map(row => row.氏名).sort();
      const matches = output.choices.map(choice => {
        assert.equal(choice.length, 1);
        const table = choice[0];
        assert(table.type === 'table');
        assert.deepEqual(table.columns, ['氏名']);
        const declared = table.rows.map(row => row[0]).sort();
        return declared.length === rows.length && declared.every((element, i) => element === rows[i]);
      });
      assertOne(matches, output, `問62 条件${index}`);
    } finally { db.close(); }
  }
});

test('問63〜64の確定・排他・復旧及びメール保護に関する個々の動作と効果を確認する', () => {
  expectMatching(63, [/すべてのサイトが更新可能/, /他の処理が更新中/, /確定していない更新を取り消して/, /確定済み更新をログの順に適用/],
    [/^2相コミット$/, /^排他制御$/, /^ロールバック$/, /^ロールフォワード$/]);
  expectMatching(64, [/かぎを保護された/, /^電子メールを暗号化する/, /送信記録を.*独立した保管先へ/, /大量の接続要求/],
    [/かぎを紛失しても復元|かぎの紛失を防止/, /電子メールの内容の漏えい/, /送信記録.*改ざん/, /大量要求から|妨害攻撃を防止/]);
});

test('問65〜67のすべての判断場面で隔離，アカウント管理，監視記録の保護を検証する', () => {
  const criteria = {
    65: [
      [/再現/, /そのままの状態|完了まで待つ/, /ネットワークから切り離す/, /電源を切る/],
      [/再現/, /完了まで待つ/, /無線接続を管理装置で停止/, /電源を切る/],
      [/再現/, /完了まで待つ/, /仮想ネットワークアダプタを切り離す/, /電源を切る/],
      [/再現/, /完了まで待つ/, /USBメモリを隔離.*接続しない/, /電源を切る/],
    ],
    66: [
      [/IDとパスワードを再利用/, /一覧表を作成/, /自分のパスワードをいつでも自由に変更/, /申請書が届く前/],
      [/別の利用者.*引き継ぐ/, /読める形で一覧/, /正式な申請.*本人専用ID/, /承認される前/],
      [/別の利用者.*引き継ぐ/, /読める形で一覧/, /本人を確認.*有効期限付き/, /承認される前/],
      [/別の利用者.*引き継ぐ/, /読める形で一覧/, /旧所属のアクセス権を失効/, /承認される前/],
    ],
    67: [
      [/盗聴などに悪用されない/, /保管場所と使用方法を周知/, /パケットを破棄/, /LANケーブルを一時的に切断/],
      [/装置へのアクセスと採取ファイルの扱いを制限/, /誰でも採取内容/, /測定中に廃棄/, /必ずLANケーブルの切断/],
      [/許可された担当者だけ.*保管期間/, /誰でも採取内容/, /測定中に廃棄/, /必ずLANケーブルの切断/],
      [/記録の条件を対象機器と通信方向に絞り/, /誰でも採取内容/, /測定中に廃棄/, /必ずLANケーブルの切断/],
    ],
  };
  for (const number of [65, 66, 67] as const) {
    for (const index of inputs) {
      const output = body(number, index);
      const kinds = output.choices.map(choice => selectPrompt(paragraphs(choice), criteria[number][index]));
      assert.deepEqual([...kinds].sort(), [0, 1, 2, 3]);
      assertOne(kinds.map(kind => kind === (number === 67 ? 0 : 2)), output, `問${number} 条件${index}`);
    }
  }
});

test('問68〜70の役割別要求、品質管理と歴史的な規格区分を全肢比較する', () => {
  // METI guideline sections 4(1), 5(1)/(3) and 6(2) fix which actor must act.
  for (const index of inputs) {
    const output = body(68, index), prompt = paragraphs(output.prompt);
    const requested = /使用状況を把握/.test(prompt) ? /管理台帳を整備/ : /法人等が実施/.test(prompt) ? /責任者を任命/ :
      /ユーザが実施/.test(prompt) ? /事前に管理責任者へ承諾/ : /使用条件を.*周知徹底/;
    const options = output.choices.map(paragraphs);
    const classified = index ? [/責任者を任命/, /事前に管理責任者へ承諾/, /管理台帳を整備/, /把握を省略.*一括/] :
      [/使用条件を.*周知徹底/, /インストールを一括/, /責任者を任命/, /インストール.*禁止/];
    assert.equal(new Set(options.map(option => selectPrompt(option, classified))).size, 4);
    assertOne(options.map(option => requested.test(option)), output, prompt);
  }
  for (const index of inputs) {
    const output = body(69, index), options = output.choices.map(paragraphs);
    const correct = [/不都合があった場合.*正規の手続/, /活動に応じて測定できる品質目標/, /原因を調べ.*手続で見直す/, /対策後も改善の効果を確かめる/][index];
    const unsafe = /内容が異なっても.*統一|現実に守られない.*継続|手順を見直すことなく|まったく同じ目標値|原因を調べず|確かめる必要はない|正式な手続を経ず/;
    for (const option of options) assert.notEqual(unsafe.test(option), correct.test(option), option);
    assertOne(options.map(option => correct.test(option)), output, `問69 条件${index}`);
  }
  expectMatching(70, [/^“IEEE\/EIA 12207\.0/, /^“ISO 9001/, /^“ISO\/IEC 12207:/, /^“共通フレーム98/],
    [/^IEEE(?:版|\/EIAによる)/, /品質マネジメントシステム/, /ISO(?: 12207として|\/IECの国際規格)/, /日本国内のユーザ/]);
});

test('問71〜76の経営，財務，原価，分析・QCの判断を原題の四肢形式で検査する', () => {
  expectMatching(71, [/用いられるBPR/, /用いられるベンチマーキング/, /用いられる全社的品質管理/, /用いられるコアコンピタンス/],
    [/業務のプロセスを再設計/, /最強の競合相手又は先進企業と比較/, /あらゆる部門が一体/, /優越した自社独自/]);
  for (const index of inputs) {
    const output = body(72, index);
    const choices = output.choices.map(paragraphs);
    const ratios = [/^固定比率は.*自己資本に対する固定資産/, /^自己資本比率は.*総資本に対する自己資本/,
      /^総資本利益率は.*総資本に対する利益/, /^流動比率は.*流動負債に対する流動資産/];
    assertOne(choices.map((choice, i) => ratios[i].test(choice) && (i !== 3 || !/小さいほど安全性が高い/.test(choice))),
      output, `問72 条件${index}`);
  }
  expectMatching(73, [/のうち，総平均法/, /のうち，先入先出法/, /のうち，移動平均法/, /のうち，個別法/],
    [/期初在庫の評価額と購入した材料の総額/, /最も新しく購入|先に仕入れた材料/, /そのときの在庫金額と購入価額/,
      /前年度の期初在庫|個々の材料を購入時から識別/]);
  expectMatching(74, [/^メッシュ分析/, /^パネル調査/, /^ABC分析/, /^クロス集計/],
    [/地域を格子状/, /同じパネル.*反復調査/, /高い商品から順番に並べ.*累計比率/, /複数の調査データを要因ごとに区分/]);
  expectMatching(75, [/^特性要因図/, /^ガントチャート/, /^レーダチャート/, /^パレート図/],
    [/魚の骨/, /期間の予定と実績を棒状/, /放射状の各軸/, /棒グラフと折れ線グラフ/]);
  expectMatching(76, [/^QCにおけるアローダイアグラム/, /^QCにおける管理図/, /^QCにおけるパレート図/, /^QCにおける特性要因図/],
    [/前後関係を整理して矢印/, /中央線と上下一対の限界線/, /原因別に分類.*累積値/, /魚の骨/]);
});

test('問77はSVGの点から相関を計算し，符号と回帰式の違い及び全選択肢を照合する', () => {
  for (const index of inputs) {
    const output = body(77, index);
    const drawing = output.prompt.find(block => block.type === 'diagram');
    assert(drawing?.type === 'diagram' && drawing.scene.kind === 'source_figure');
    const renderer = renderers.find(item => item.profile.endsWith('-77-scatter'))!;
    const html = renderToStaticMarkup(createElement(renderer.component, { values: drawing.scene.values, caption: drawing.caption }));
    const pairs = [...html.matchAll(/data-x="(\d+)" data-y="(\d+)"/g)].map(match => [Number(match[1]), Number(match[2])]);
    assert(pairs.length >= 20);
    let productDifference = 0, xDifference = 0, yDifference = 0;
    for (const [i, [x, y]] of pairs.entries()) for (const [otherX, otherY] of pairs.slice(i + 1)) {
      productDifference += (x - otherX) * (y - otherY);
      xDifference += (x - otherX) ** 2;
      yDifference += (y - otherY) ** 2;
    }
    const r = productDifference / Math.sqrt(xDifference * yDifference);
    assert(0.3 < Math.abs(r) && Math.abs(r) < 1, `問77 条件${index}`);
    assert.notEqual(productDifference / xDifference, productDifference / yDifference, '二つの向きの回帰勾配を区別');
    const choices = output.choices.map(paragraphs);
    const truth = choices.map(choice => /相関係数は正/.test(choice) ? r > 0 : /相関係数は負/.test(choice) ? r < 0 : false);
    assert.equal(choices.filter(choice => /二次回帰係数の計算が必要|回帰式と同じ/.test(choice)).length, 2);
    assertOne(truth, output, `問77 条件${index}`);
  }
});

test('問78の需要・在庫条件に対応する発注方式を全選択肢で照合する', () => {
  for (const index of inputs) {
    const output = body(78, index), prompt = paragraphs(output.prompt);
    const options = output.choices.map(paragraphs);
    const applicable = /毎週月曜/.test(prompt) ? /決められた日に.*発注量/ : /毎回50個/.test(prompt) ? /発注点に達したら決めておいた個数/ :
      /二つの棚/.test(prompt) ? /一方の棚が空になったことを合図に.*発注/ : /多くの商品を同時に発注/;
    assert(options.some(option => /単価が高く，調達期間が長い/.test(option)));
    assertOne(options.map(option => applicable.test(option)), output, prompt);
  }
});

test('問79は全ての整数生産計画を独立に列挙して，比率順の計算及び全数値候補と照合する', () => {
  for (const index of inputs) {
    const output = body(79, index);
    const hours = /月間(\d+)時間/.exec(paragraphs(output.prompt));
    const amount = output.prompt.find(block => block.type === 'table');
    assert(hours && amount?.type === 'table');
    const [p, t, limits] = amount.rows.map(row => row.slice(1).map(numeric));
    const capacity = Number(hours[1]) * 60;
    let best = 0;
    for (let x = 0; x <= limits[0] && x * t[0] <= capacity; x++) {
      for (let y = 0; y <= limits[1] && x * t[0] + y * t[1] <= capacity; y++) {
        const z = Math.min(limits[2], Math.floor((capacity - x * t[0] - y * t[1]) / t[2]));
        const value = x * p[0] + y * p[1] + z * p[2];
        if (value > best) best = value;
      }
    }
    const choices = output.choices.map(blocks => numeric(paragraphs(blocks)));
    assert.deepEqual(choices, [...choices].sort((a, b) => a - b));
    assertOne(choices.map(value => value === best), output, `問79 条件${index}`);
    assert(output.explanation.includes(best.toLocaleString('en-US')));
    assert(choices[0] / best > 0.65 && (choices[3] - choices[2]) / best > 0.025);
  }
});

test('問80は法定の四分類を保ち，本文の候補集合と実際の各組合せを全件検査する', () => {
  const definition = definitions.find(candidate => candidate.source === '2005h17a-fe-am-80');
  assert.equal(definition?.answerVariation, 'fixed');
  const industrialRights = new Set(['特許権', '実用新案権', '意匠権', '商標権']);
  const expectedNonIndustrial = ['著作権', '著作隣接権', '育成者権', '回路配置利用権'];
  for (const index of inputs) {
    const output = body(80, index), groups = output.choices.map(choice => paragraphs(choice).split('，'));
    const visible = new Set(groups.flat());
    assert.deepEqual(visible, new Set([...industrialRights, expectedNonIndustrial[index]]));
    const prompt = paragraphs(output.prompt);
    if (index > 0) for (const right of visible) assert(prompt.includes(right));
    assert(groups.every(group => group.length === 4 && new Set(group).size === 4));
    assertOne(groups.map(group => group.every(right => industrialRights.has(right))), output, `問80 条件${index}`);
  }
});

test('二つの独自図は可変条件に対応し，意味のあるtitleとdescをSVGに備える', () => {
  assert.deepEqual(renderers.map(item => item.profile).sort(), figures.map(item => item.profile).sort());
  for (const index of inputs) for (const [n, name] of [[57, '57-network'], [77, '77-scatter']] as const) {
    const item = body(n, index).prompt.find(block => block.type === 'diagram');
    assert(item?.type === 'diagram' && item.scene.kind === 'source_figure');
    const renderer = renderers.find(row => row.profile.endsWith(name))!;
    const markup = renderToStaticMarkup(createElement(renderer.component, { values: item.scene.values, caption: item.caption }));
    assert.match(markup, /<title[^>]*>/);
    assert.match(markup, /<desc[^>]*>/);
    assert(markup.includes(item.alt) && markup.includes(item.caption) && markup.includes('aria-describedby'));
  }
});
