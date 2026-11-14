import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2007AutumnAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2007-autumn-am-54-80';

type Four<T> = readonly [T, T, T, T];
type Knowledge = { prompts: Four<RegExp>; banks: Four<RegExp> | Four<Four<RegExp>>; valid: Four<RegExp> };
// Independently reviewed signatures classify every option and distinguish its role from the applicable prompt.
const knowledge: Readonly<Record<number, Knowledge>> = {
  54: { prompts: [/サブネットマスク/, /NAPT.*アドレスとポート/, /クラス方式.*上位のビット/, /IPv4のブロードキャストアドレス/],
    banks: [/一つのIPアドレスを複数の端末で共用/, /クラスA〜D.*識別/, /すべてのノードに対して.*同一の情報/, /ホストアドレス部.*より小さいネットワーク/],
    valid: [/より小さいネットワーク/, /複数の端末で共用/, /先頭のビット列からクラス/, /すべてのノードに対して/] },
  55: { prompts: [/メールサーバ間.*転送/, /既読状態やフォルダを同期/, /添付ファイル.*転送時の符号化/, /受信用.*RETR/],
    banks: [/^IMAP$/, /^MIME$/, /^POP3$/, /^SMTP$/], valid: [/^SMTP$/, /^IMAP$/, /^MIME$/, /^POP3$/] },
  57: { prompts: [/ブロードキャストによる/, /マルチキャストによる/, /送信元以外の全ノード.*ユニキャスト/, /一部のノード.*ユニキャスト/],
    banks: [/^すべてのノード.*順番に/, /^選択された複数.*一度の送信/, /^選択された複数.*順番に/, /^同一セグメント内のすべて.*一度の送信/],
    valid: [/同一セグメント内のすべて.*一度/, /選択された複数.*一度/, /^すべてのノード.*順番/, /選択された複数.*順番/] },
  58: { prompts: [/スイッチングハブ.*レイヤ2/, /DHCPサーバの機能/, /リピータハブの機能/, /MTU.*分割禁止フラグが設定されていないIPv4/],
    banks: [/IPアドレスの動的な割当て/, /あて先MACアドレスが存在するLANポートだけ/, /すべての(ポート|LANポートに転送)/, /ネットワーク層で分割/],
    valid: [/あて先MACアドレスが存在するLANポートだけ/, /IPアドレスの動的な割当て/, /信号を再生して，受信ポート以外/, /ネットワーク層で分割/] },
  60: { prompts: [/E-R図/, /関係データベースの論理設計/, /CRUDマトリックス/, /状態遷移図/],
    banks: [
      [/関係データベースへの実装/, /業務上の各プロセス.*データの関係/, /実体及び実体間の関連/, /生成から消滅/],
      [/関係表.*主キー・外部キー/, /発生順に並べる/, /物理ページ番号/, /取り得る状態を順に/],
      [/関係データベースへの実装/, /作成・参照・更新・削除のどの操作/, /実体及び実体間の関連/, /所要日数/],
      [/関係データベースへの実装/, /作成・参照・更新・削除を対応/, /実体及び実体間の関連/, /事象による状態間の移り変わり/],
    ], valid: [/実体及び実体間の関連/, /関係表.*主キー・外部キー/, /作成・参照・更新・削除のどの操作/, /事象による状態間の移り変わり/] },
  62: { prompts: [/媒体に故障.*バックアップファイルとログ/, /古い確定取引.*長期保管/, /トランザクションが正常.*変更を確定/, /全ログを読み直さず.*状態を記録/],
    banks: [/^アーカイブ$/, /^コミット$/, /^チェックポイントダンプ$/, /^ロールフォワード$/],
    valid: [/^ロールフォワード$/, /^アーカイブ$/, /^コミット$/, /^チェックポイントダンプ$/] },
  63: { prompts: [/^関係データベース/, /^階層型データベース/, /^ネットワーク型データベース/, /レコード検索を補助する索引/],
    banks: [/属性値とその値をもつレコード格納位置/, /表中の列の値/, /ポインタ.*木構造の表現に制限/, /リンク.*網構造も表現/],
    valid: [/表中の列の値/, /木構造の表現に制限/, /網構造も表現/, /属性値とその値をもつレコード格納位置/] },
  64: { prompts: [/^公開鍵暗号方式/, /^AESに関する/, /専用の共通鍵.*鍵の配布/, /受信者だけに読める.*受信者の鍵の扱い/],
    banks: [
      [/^AES.*公開鍵暗号方式/, /^RSA.*素因数分解/, /利用者の数が増えると鍵の配送/, /受信者の復号鍵を公開/],
      [/同じ秘密鍵を使う共通鍵暗号/, /素因数分解.*公開鍵と秘密鍵/, /ChaCha20と同じストリーム/, /秘密鍵は通常公開/],
      [/新たな鍵は不要/, /利用者ごとに公開/, /組ごとに専用鍵/, /全利用者で同一の鍵/],
      [/復号.*鍵だけを一般公開/, /受信者の秘密鍵を送信者に渡して/, /両方の鍵を送信者に渡し/, /受信者の公開鍵で暗号化.*秘密鍵で復号/],
    ], valid: [/^RSA.*素因数分解/, /同じ秘密鍵を使う共通鍵暗号/, /組ごとに専用鍵/, /受信者の公開鍵で暗号化.*秘密鍵で復号/] },
  65: { prompts: [/A氏の公開鍵.*署名を確認.*秘密鍵はA氏だけ/, /B商店の真正な公開鍵で注文の内容を暗号化.*B商店だけ/, /注文識別子を含む到着通知.*真正な通知/, /承認機関の許可.*有効な販売許可書.*真正な公開鍵/],
    banks: [/内容は，第三者に漏れない/, /発信された注文は，B商店に届く/, /届いたものは，A氏からの注文/, /商品を売ることの許可/],
    valid: [/A氏からの注文である/, /第三者に漏れない/, /B商店に届く/, /商品を売ることの許可/] },
  66: { prompts: [/パターンマッチング方式/, /完全な複製.*ファイルそのものの差分/, /不審な動作を監視/, /正常時.*要約値だけ.*現在の要約値/],
    banks: [/感染前のファイルと感染後のファイルを比較/, /既知ウイルスのシグネチャコード/, /異常現象を監視/, /チェックサムと照合/],
    valid: [/既知ウイルスのシグネチャコード/, /感染前のファイルと感染後のファイルを比較/, /異常現象を監視/, /チェックサムと照合/] },
  67: { prompts: [/SSL\/TLS/, /クライアントに近いサーバ.*キャッシュ/, /URL，応答状態をアクセスログ/, /専用のSMTP受信ゲートウェイ/],
    banks: [/通信の処理時間を短縮/, /通信を暗号化/, /通信の証跡を確保/, /メールソフトから.*SMTP/],
    valid: [/通信を暗号化/, /通信の処理時間を短縮/, /通信の証跡を確保/, /SMTPで送信した内容をWebサービスに受け付け/] },
  68: { prompts: [/緊急事態を装う.*人間から/, /アプリケーションを装い.*不正処理/, /ハッシュ値.*辞書の単語/, /第三者の端末を不正に制御.*標的へ攻撃/],
    banks: [/^ソーシャルエンジニアリング$/, /^トロイの木馬$/, /^パスワードクラック$/, /^踏み台攻撃$/],
    valid: [/^ソーシャルエンジニアリング$/, /^トロイの木馬$/, /^パスワードクラック$/, /^踏み台攻撃$/] },
  69: { prompts: [/PDCAモデル.*PLAN/, /PDCAモデル.*DO/, /PDCAモデル.*CHECK/, /PDCAモデル.*ACT/],
    banks: [/^運用状況の管理$/, /^改善策の実施$/, /^実施状況に対するレビュー$/, /^情報資産のリスクアセスメント$/],
    valid: [/資産のリスクアセスメント/, /運用状況の管理/, /実施状況に対するレビュー/, /改善策の実施/] },
  70: { prompts: [/^QRコードの特徴/, /^多くの英数字.*通常のQRコード/, /文字として解釈しないデータ.*通常のQRコード/, /一部が汚れる.*通常のQRコード/],
    banks: [
      [/3個の検出用シンボル.*回転角度と読取り方向/, /最大で英数字なら128文字/, /バイナリ形式を除いた/, /プログラム言語であり/],
      [/配置の向き.*格納文字数が減る/, /レベルにより，128文字を超える/, /128文字で固定/, /プログラムとしてコードを実行/],
      [/検出用シンボルは文字データのときだけ/, /英数字モードしかない/, /バイトモードで8ビット単位/, /常に実行可能な命令/],
      [/シンボルだけで欠落箇所の情報を常に復元/, /誤り訂正を強くしても.*データ量は増やせる/, /一つでもセルを誤読.*絶対に復元できない/, /訂正できる範囲内の誤読や欠損を復元/],
    ], valid: [/3個の検出用シンボル.*回転角度と読取り方向/, /レベルにより，128文字を超える/, /バイトモードで8ビット単位/, /訂正できる範囲内の誤読や欠損を復元/] },
  71: { prompts: [/^SCM/, /^CRM/, /リテールサポート/, /^ERP/],
    banks: [/顧客チャネルで情報を共有/, /小売店の経営活動を支援/, /企業全体の経営資源.*統合的に管理/, /生産，在庫，購買，販売，物流.*企業間で情報を共有/],
    valid: [/企業間で情報を共有/, /顧客チャネルで情報を共有/, /小売店の経営活動を支援/, /企業全体の経営資源.*統合的に管理/] },
  74: { prompts: [/^ABC分析/, /^マーケットバスケット分析/, /時系列として扱う需要予測/, /定性的な市場調査/],
    banks: [/購入商品の組合せ/, /販売金額や粗利益額/, /きめ細かな販売見込数量/, /オピニオンリーダにアンケート調査/],
    valid: [/販売金額や粗利益額/, /購入商品の組合せ/, /きめ細かな販売見込数量/, /オピニオンリーダにアンケート調査/] },
  75: { prompts: [/^パレート図/, /^特性要因図/, /^管理図/, /^ヒストグラム/],
    banks: [/魚の骨.*原因/, /時系列.*管理限界線/, /各区間に属するデータの個数/, /出現頻度の大きさの順.*累積和/],
    valid: [/出現頻度の大きさの順.*累積和/, /魚の骨.*原因/, /時系列.*管理限界線/, /各区間に属するデータの個数/] },
  79: { prompts: [/EDI.*情報表現規約/, /EDI.*取引基本規約/, /EDI.*業務運用規約/, /EDI.*情報伝達規約/],
    banks: [/^企業間の取引の契約内容$/, /^システムの運用時間$/, /^伝送制御手順$/, /^メッセージの形式$/],
    valid: [/^メッセージの形式$/, /^企業間の取引の契約内容$/, /^システムの運用時間$/, /^伝送制御手順$/] },
  80: { prompts: [/派遣契約関係が存在/, /労働契約（雇用関係）/, /指揮命令に従って.*事業主として答える/, /苦情処理等.*選任された担当者/],
    banks: [/^派遣先事業主と派遣労働者$/, /^派遣先責任者と派遣労働者$/, /^派遣元事業主と派遣先事業主$/, /^派遣元事業主と派遣労働者$/],
    valid: [/^派遣元事業主と派遣先事業主$/, /^派遣元事業主と派遣労働者$/, /^派遣先事業主と派遣労働者$/, /^派遣先責任者と派遣労働者$/] },
};

function requireText(block: Block) {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
}
function requireTable(block: Block) {
  assert.equal(block.type, 'table');
  return block;
}
function optionText(block: Block) {
  return block.type === 'table' ? block.rows.flat().join('｜') : requireText(block);
}
const number = (value: string) => Number(value.replaceAll(',', ''));
type Judge = (body: GeneratedBody, options: string[]) => boolean[];

const pcm: Judge = (body, choices) => {
  const [, bits, transfer] = /して(\d+)ビット.*転送速度は([\d,]+)ビット／秒.*何マイクロ秒/.exec(requireText(body.prompt[0]))!;
  assert.match(requireText(body.prompt[0]), /圧縮処理しない/);
  const second = 1_000_000 * number(bits);
  const matches = choices.map(delay => Math.round(number(delay) * number(transfer)) === second);
  assert.deepEqual([...choices].map(number).sort((a, b) => a - b), choices.map(number));
  assert(choices.some(value => Math.abs(number(value) - second / number(transfer) * 1.024) <= 0.05));
  assert(choices.filter(value => number(value) < second / number(transfer) / 2).length === 2);
  return matches;
};
const relational: Judge = (body, choices) => {
  const a = requireTable(body.prompt[1]), b = requireTable(body.prompt[2]), c = requireTable(body.prompt[3]);
  assert.deepEqual([a.caption, b.caption, c.caption], ['表a', '表b', '表c']);
  assert.equal(a.rows.length, 9);
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE a(山岳名称 TEXT, 地域 TEXT)');
    const add = db.prepare('INSERT INTO a VALUES (?,?)');
    for (const row of a.rows) add.run(...row);
    const identify = (view: typeof a) => {
      const actual = view.rows.map(row => row.join('|'));
      const sql = view.columns.length === a.columns.length ? 'SELECT * FROM a WHERE 地域 = ? ORDER BY rowid'
        : 'SELECT DISTINCT "' + view.columns[0] + '" FROM a ORDER BY rowid';
      const query = db.prepare(sql);
      const expected = query.all(...(view.columns.length === a.columns.length ? [view.rows[0][1]] : []))
        .map(row => Object.values(row).join('|'));
      assert.deepEqual(actual, expected);
      return view.columns.length === a.columns.length ? '選択' : '射影';
    };
    const expected = [identify(b), identify(c)].join('｜');
    assert.deepEqual(choices, ['射影｜結合', '射影｜選択', '選択｜結合', '選択｜射影']);
    return choices.map(option => option === expected);
  } finally {
    db.close();
  }
};
const sqlView: Judge = (body, choices) => {
  const db = new DatabaseSync(':memory:');
  try {
    const table = requireTable(body.prompt[1]);
    db.exec('CREATE TABLE 商品(商品コード TEXT, 品名 TEXT, 型式 TEXT, 売値 INTEGER, 仕入値 INTEGER)');
    const insert = db.prepare('INSERT INTO 商品 VALUES (?,?,?,?,?)');
    for (const [id, name, model, sale, purchase] of table.rows)
      insert.run(id, name, model, number(sale), number(purchase));
    db.exec(requireText(body.prompt[3]));
    const view = db.prepare('SELECT 商品コード FROM 収益商品');
    const count = view.all().length;
    return choices.map(option => {
      const [, id, field, amount] = /^商品コードが(S00[135])の行の(売値|仕入値)を([\d,]+)に更新する。$/.exec(option)!;
      db.exec('SAVEPOINT change');
      db.prepare('UPDATE 商品 SET ' + field + ' = ? WHERE 商品コード = ?').run(number(amount), id);
      const after = view.all().length;
      db.exec('ROLLBACK TO change');
      db.exec('RELEASE change');
      return count > after;
    });
  } finally {
    db.close();
  }
};
const income: Judge = (body, choices) => {
  const balances: Record<string, number> = {
    売上高: 100, 売上原価: 30, 販売費及び一般管理費: 20, 営業外損益: -6, 特別損益: 3,
  };
  const expected: Record<string, number> = { 売上総損益: 70, 営業損益: 50, 経常損益: 44, 税引前当期純損益: 47 };
  const [, requested] = /^(.+)の計算式はどれか。$/.exec(requireText(body.prompt[0]))!;
  assert(requested in expected);
  assert.deepEqual(choices.map(choice => choice.split(/ [−＋] /).length), [2, 3, 4, 5]);
  return choices.map(choice => {
    const [first, ...rest] = choice.split(/ ([−＋]) /);
    let total = balances[first];
    for (let i = 0; i < rest.length; i += 2) total += (rest[i] === '−' ? -1 : 1) * balances[rest[i + 1]];
    return total === expected[requested];
  });
};
const profit: Judge = (body, choices) => {
  const [, price, units] = /販売価格が(\d+)万円.*月当たりの販売数量が(\d+)個/.exec(requireText(body.prompt[0]))!;
  const sales = number(price) * number(units);
  const table = requireTable(body.prompt[1]);
  const costs = table.rows.map(([, fixed, unit]) => number(fixed.split('万円')[0]) + number(unit.split('万円')[0]) * number(units));
  assert.deepEqual(table.rows.map(row => row[0]), ['A', 'B']);
  const outcome = [[/ともに利益が出ない/, costs.every(cost => cost >= sales)], [/利益は等しい/, costs[0] === costs[1]],
    [/A案の方が利益が多い/, costs[0] < costs[1]], [/B案の方が利益が多い/, costs[1] < costs[0]]] as const;
  return choices.map(choice => {
    const matched = outcome.filter(([pattern]) => pattern.test(choice));
    assert.equal(matched.length, 1);
    return matched[0][1];
  });
};
const trend: Judge = (body, choices) => {
  assert.match(requireText(body.prompt[0]), /昨年度の問題の得点をx軸に，今年度の問題の得点をy軸/);
  const [, correlation, slope, intercept] = /相関係数は，([.\d]+)であった。\n回帰直線の傾きは，([.\d]+)であった。\n回帰直線のy切片の値は，(-?\d+)/.exec(requireText(body.prompt[1]))!;
  assert(number(correlation) > 0 && number(correlation) < 1);
  const predicted = Array.from({ length: 101 }, (_, score) => number(slope) * score + number(intercept) - score);
  assert(predicted.every(delta => delta > 0) || predicted.every(delta => delta < 0));
  assert.match(choices[0], /今年度の問題の得点が0点.*昨年度/);
  assert.match(choices[1], /平均点.*昨年度.*倍/);
  assert.match(choices[3], /相関係数.*質が高い/);
  return choices.map(choice =>
    predicted.every(delta => delta > 0) ? /今年度.*得点しやすい傾向/.test(choice) : /今年度.*得点しにくい傾向/.test(choice));
};
const assignment: Judge = (body, choices) => {
  const table = requireTable(body.prompt[1]);
  assert.deepEqual(table.rows.map(row => row[0]), ['x', 'y', 'z']);
  assert.match(requireText(body.prompt[0]), /顧客を1人しか担当できない/);
  const [, example] = /営業担当者Aの顧客xに対する売上高は(\d+)百万円/.exec(requireText(body.prompt[0]))!;
  assert.equal(example, table.rows[0][1]);
  const totals: number[] = [];
  function offer(customer: number, people: number[], total: number) {
    if (!people.length) {
      totals.push(total);
      return;
    }
    for (const person of people)
      offer(customer + 1, people.filter(other => other !== person), total + number(table.rows[customer][person]));
  }
  offer(0, [1, 2, 3], 0);
  const maximum = Math.max(...totals);
  assert.equal(totals.length, 6);
  assert.equal(totals.filter(t => t === maximum).length, 1);
  assert.deepEqual([...choices].map(number).sort((a, b) => a - b), choices.map(number));
  return choices.map(choice => number(choice) === maximum);
};
const replenish: Judge = (body, choices) => {
  assert.match(requireText(body.prompt[0]), /nは3以上/);
  const rules = requireText(body.prompt[1]);
  assert.match(rules, /週末ごとに.*発注.*翌週の月曜日に補充/);
  const historical = /先々週の販売量と先週の販売量/.test(rules);
  const earlierStock = /先週末の在庫量を引き/.test(rules);
  const [, base, percent] = /安全在庫量は，(翌週の販売予測量|今週の販売量)の(\d+)％/.exec(rules)!;
  const groups = [[28, 88, 48, 7, 23], [50, 80, 20, 31, 13], [100, 60, 140, 16, 53]];
  return choices.map(choice => groups.every(([older, previous, current, previousStock, currentStock]) => {
    const sales: Record<string, number> = { 'n−2': older, 'n−1': previous, n: current };
    const stocks: Record<string, number> = { 'n−1': previousStock, n: currentStock };
    const [, first, second, factor, fraction, recent] =
      /^\(C\[(n−[12])\]＋C\[(n(?:−1)?)\]\)／2(?:×([\d.]+)|＋C\[n\]×([\d.]+))−B\[(n(?:−1)?)\]$/.exec(choice)!;
    const average = (sales[first] + sales[second]) / 2;
    const evaluated = factor ? average * number(factor) - stocks[recent] : average + current * number(fraction) - stocks[recent];
    const forecast = (previous + (historical ? older : current)) / 2;
    const correct = forecast + (base === '今週の販売量' ? current : forecast) * number(percent) / 100 -
      (earlierStock ? previousStock : currentStock);
    return Math.abs(evaluated - correct) < 1e-7;
  }));
};
const structured: Record<number, Judge> = { 56: pcm, 59: relational, 61: sqlView, 72: income, 73: profit, 76: trend, 77: assignment, 78: replenish };

const official = 'エエウエイエウアエイイウイイアエアエイイイエウウアエウ';
const blueprint: Record<number, Block['type'][]> = {
  59: ['paragraph', 'table', 'table', 'table'], 61: ['paragraph', 'table', 'paragraph', 'code'],
  73: ['paragraph', 'table'], 76: ['paragraph', 'paragraph'], 77: ['paragraph', 'table'], 78: ['paragraph', 'paragraph'],
};
assert.equal(definitions.length, official.length);
for (const [offset, definition] of definitions.entries()) {
  const q = 54 + offset;
  test('2007年度秋期旧午前 問' + q + 'の原形式・全条件・全選択肢を独立に判定する', () => {
    assert.equal(definition.source, '2007h19a-fe-am-' + q);
    assert.equal(definition.sourceAnswer, official[offset]);
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.build([0]).correctIndex, 'アイウエ'.indexOf(official[offset]));
    const prompts = new Set<string>();
    for (let index = 0; index <= 3; index++) {
      const body = definition.build([index]);
      assert.deepEqual(body.prompt.map(block => block.type), blueprint[q] ?? ['paragraph']);
      assert.equal(body.choices.length, 4);
      assert(body.choices.every(blocks => blocks.length === 1 && blocks[0].type === (q === 59 ? 'table' : 'paragraph')));
      const choices = body.choices.map(([block]) => optionText(block));
      assert.equal(new Set(choices).size, 4);
      assert(body.explanation.length > 20);
      prompts.add(JSON.stringify(body.prompt));
      const model = structured[q];
      let matches: boolean[];
      if (model) matches = model(body, choices);
      else {
        const record = knowledge[q];
        assert.match(requireText(body.prompt[0]), record.prompts[index]);
        const bank = record.banks[0] instanceof RegExp ? record.banks as Four<RegExp> : (record.banks as Four<Four<RegExp>>)[index];
        for (const [i, text] of choices.entries()) assert.match(text, bank[i]);
        matches = choices.map(option => record.valid[index].test(option));
      }
      assert.deepEqual(matches.flatMap((correct, i) => correct ? [i] : []), [body.correctIndex], '条件 ' + index);
    }
    assert.equal(prompts.size, 4);
    for (const argument of [[], [0, 1], [-1], [4], [0.5], [NaN], Array<number>(1)])
      assert.throws(() => definition.build(argument), /範囲外/);
  });
}
