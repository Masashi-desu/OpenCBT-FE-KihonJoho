import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import type { Block } from '../../../src/core/types';
import { legacy2004AutumnAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2004-autumn-am-54-80';

const conditions = [0, 1, 2, 3];
const keyed = 'ウアイアウウアエエイウエアエエエイウエアエエエウウアエ';
const cases = (n: number) => conditions.map(index => definitions[n - 54].build([index]));
const text = (block: Block) => {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
const visible = (block: Block) => {
  if (block.type === 'table') return [block.caption, ...block.columns, ...block.rows.flat()].join('｜');
  if (block.type === 'diagram') return block.alt;
  return text(block);
};
const rows = (block: Block) => {
  assert(block.type === 'table');
  return block.rows;
};
const number = (s: string) => Number(s.replaceAll(',', ''));
const options = (c: ReturnType<typeof cases>[number]) => c.choices.map(blocks => text(blocks[0]));
const numbers = (c: ReturnType<typeof cases>[number]) => options(c).map(number);
function checkTruth(truth: readonly boolean[], answer: number | undefined, message: string) {
  assert.deepEqual(truth, Array.from({ length: 4 }, (_, position) => answer === position), message);
}
function matchNumbers(txt: string, regex: RegExp) {
  const match = txt.match(regex);
  assert(match, txt);
  return match.slice(1).map(number);
}

test('54〜80の公式キー、各4入力の実質変化、選択肢の一意性と前提を検証する', () => {
  assert.equal(keyed.length, 27);
  assert.deepEqual(definitions.map(d => d.source), Array.from({ length: 27 }, (_, i) => '2004h16a-fe-am-' + (54 + i)));
  definitions.forEach((definition, i) => {
    assert.equal(definition.sourceAnswer, keyed[i], definition.source);
    assert.deepEqual(definition.reference, [0]);
    const bodies = cases(i + 54);
    assert.equal('アイウエ'[bodies[0].correctIndex!], keyed[i], definition.source);
    assert.equal(new Set(bodies.map(body => body.prompt.map(visible).join('\n'))).size, 4, definition.source);
    const chosen = new Set(bodies.map(body => body.correctIndex));
    assert.equal(chosen.size === 1, definition.answerVariation === 'fixed', definition.source);
    for (const body of bodies) {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(blocks => blocks.map(visible).join('\n'))).size, 4);
      assert(body.explanation.length > 30);
    }
    for (const bad of [undefined, [], [4], [-1], [0, 0], [NaN], [2.5], [Infinity], new Array(1)])
      assert.throws(() => definition.build(bad as number[]), { code: 'PARAMETER_CONSTRAINT' });
  });
});

test('問54の全経路を列挙して作業Dの短縮前後の完了日数を比較する', () => {
  const fixedEdges = [[1, 2], [2, 4], [2, 3], [3, 4], [4, 5], [3, 6], [5, 7], [6, 7], [5, 6]];
  const expected = [[31, 28], [29, 28], [33, 31], [32, 28]];
  cases(54).forEach((body, index) => {
    const [shorter] = matchNumbers(text(body.prompt[0]), /作業日数を(\d+)日間/);
    const alt = visible(body.prompt[1]);
    const edges = [...alt.matchAll(/(\d)から(\d)は(?:作業([A-H])|ダミー作業)（(?:点線，)?(\d+)日）/g)]
      .map(([, from, to, label, days]) => ({ from: Number(from), to: Number(to), label, duration: Number(days) }));
    assert.deepEqual(edges.map(({ from, to }) => [from, to]), fixedEdges);
    assert.deepEqual(edges.map(edge => edge.label), [...'ABCDEFGH', undefined]);
    assert.equal(edges.at(-1)?.duration, 0);
    const walk = (node: number, shorten: boolean): number[] => node === 7 ? [0] : edges.filter(edge => edge.from === node)
      .flatMap(edge => walk(edge.to, shorten).map(time => time + (shorten && edge.label === 'D' ? shorter : edge.duration)));
    const before = walk(1, false), after = walk(1, true);
    assert.equal(before.length, 5);
    assert.deepEqual([Math.max(...before), Math.max(...after)], expected[index]);
    const daysSaved = Math.max(...before) - Math.max(...after);
    assert.deepEqual(numbers(body), [1, 2, 3, 4]);
    checkTruth(numbers(body).map(value => value === daysSaved), body.correctIndex, 'アローダイアグラム');
  });
});

test('問55は表示の係数を用いた補正前の値を加算し4分の3を取る', () => {
  const expected = [18, 27, 36, 45];
  cases(55).forEach((body, index) => {
    const table = rows(body.prompt[1]);
    assert.deepEqual(table.map(row => row[0]), ['外部入力', '外部出力', '内部論理ファイル', '外部インタフェースファイル', '外部照会']);
    let subtotal = 0;
    for (const [, count, weight] of table)
      for (let item = 0; item < Number(count); item++) subtotal += Number(weight);
    assert.match(text(body.prompt[0]), /補正係数は0\.75/);
    assert.equal((subtotal / 4) * 3, expected[index]);
    checkTruth(numbers(body).map(value => 4 * value === 3 * subtotal), body.correctIndex, '加重ファンクションポイント');
  });
});

test('問56の追加要員を投入し、追加1人未満では期限に届かないことを実績の人月で検算する', () => {
  const expected = [10, 5, 12, 20];
  cases(56).forEach((body, index) => {
    const prompt = text(body.prompt[0]);
    const [total, months, original, observed, completed, deadline, starting, sameStarting, sameObserved] = matchNumbers(prompt,
      /(\d+)人月.*1月から(\d+)月までは各月(\d+)名.*?(\d+)月末時点で(\d+)人月.*?(\d+)月末まで.*?(\d+)月以降あと.*?(\d+)月以降の.*?(\d+)月まで/);
    assert.deepEqual([observed, starting, sameStarting, sameObserved], [months, months + 1, months + 1, months]);
    const target = (total - completed) * months * original;
    const output = (added: number) => completed * (original + added) * (deadline - observed);
    assert.equal(numbers(body)[body.correctIndex!], expected[index]);
    checkTruth(numbers(body).map(added => output(added) >= target && output(added - 1) < target), body.correctIndex, '追加人数');
  });
});

test('問63の候補をフレームとして復号し7ビット値と偶数パリティを照合する', () => {
  const assigned = [['T', '1010100'], ['R', '1010010'], ['M', '1001101'], ['N', '1001110']];
  cases(63).forEach((body, index) => {
    const prompt = text(body.prompt[0]);
    const match = prompt.match(/文字([A-Z])（JIS 7単位符号 ([01]{7})）/);
    assert(match);
    assert.deepEqual(match.slice(1), assigned[index]);
    assert.match(prompt, /スタートビット（0），文字の低位ビットから高位ビット，パリティビット，ストップビット（1）/);
    const expectedCharacter = assigned[index][0].codePointAt(0);
    checkTruth(options(body).map(choice => {
      assert.match(choice, /^[01]{10}$/);
      const frame = Array.from(choice, Number);
      const received = frame.slice(1, 8).reduce((sum, bit, i) => sum + bit * 2 ** i, 0);
      return frame[0] === 0 && frame[9] === 1 && received === expectedCharacter && frame.slice(1, 9).reduce((sum, bit) => sum + bit, 0) % 2 === 0;
    }), body.correctIndex, '調歩同期のフレーム');
  });
});

test('問64は1時間あたりの回線容量を整数で比べ、適合候補のうち最低速度を確認する', () => {
  cases(64).forEach((body, index) => {
    const prompt = text(body.prompt[0]);
    const [bytes, count, efficiency] = matchNumbers(prompt, /制御用符号を含む長さ(\d+)バイト.*?1時間当たり([\d,]+)件.*?伝送効率が(\d+)%/);
    const need = BigInt(bytes * count * 8 * 100);
    const choices = numbers(body);
    const possible = choices.filter(choice => BigInt(choice * 3600 * efficiency) >= need);
    const least = Math.min(...possible);
    assert.equal(least, [9600, 2400, 4800, 14400][index]);
    if (index === 0) {
      assert.equal(bytes * 8 * count / 3600, 3200);
      assert(BigInt(5333 * 3600 * efficiency) < need);
      assert(BigInt(5334 * 3600 * efficiency) >= need);
    }
    checkTruth(choices.map(choice => choice === least), body.correctIndex, '提示された回線速度');
  });
});

test('問68の表示SQL4肢を境界例と公式表で実行し名前と平均条件を照合する', () => {
  cases(68).forEach((body, index) => {
    const [meanMan, minMan] = matchNumbers(text(body.prompt[0]), /平均が([\d,]+)万円以上で，どの期でも([\d,]+)万円以上/);
    assert.match(text(body.prompt[0]), /金額の単位は千円/);
    const mean = meanMan * 10, min = minMan * 10;
    const displayed = rows(body.prompt[1]).filter(row => row[0] !== '⋮');
    assert.equal(displayed.length, 3);
    if (index === 0) assert.deepEqual(displayed, [['123', '山田　一郎', '29,600', '31,900', '36,600', '41,500'],
      ['594', '鈴木　太郎', '43,500', '45,300', '30,400', '46,400'], ['612', '佐藤　花子', '49,600', '39,400', '42,300', '51,100']]);
    const actual = displayed.map(([, name, ...periods]) => ({ name, amounts: periods.map(number) }));
    const fixtures = [...actual, { name: '全て下限', amounts: [min, min, min, min] },
      { name: '合計のみ達成', amounts: [min - 1, mean + 30000, mean, mean] },
      { name: '一部のみ達成', amounts: [0, min, 0, 0] },
      { name: '平均丁度', amounts: [min, mean, mean, 2 * mean - min] },
      { name: '平均の合計が1千円不足', amounts: [min, mean, mean, 2 * mean - min - 1] },
      { name: '各期閾値と差1', amounts: [min - 1, mean, mean, 2 * mean - min + 1] }];
    const expected = fixtures.filter(row => Math.min(...row.amounts) >= min &&
      row.amounts.reduce((sum, amount) => sum + amount, 0) >= mean * row.amounts.length).map(row => row.name).sort();
    assert(expected.includes('平均丁度'));
    assert(!expected.includes('全て下限'));
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 販売実績 (名前 TEXT, 第1期 INTEGER, 第2期 INTEGER, 第3期 INTEGER, 第4期 INTEGER)');
      const insert = db.prepare('INSERT INTO 販売実績 VALUES (?, ?, ?, ?, ?)');
      for (const row of fixtures) insert.run(row.name, ...row.amounts);
      const truth = body.choices.map(choice => {
        assert(choice[0].type === 'code' && choice[0].language === 'sql');
        const result = db.prepare(choice[0].text).all().map(row => String(row.名前)).sort();
        return JSON.stringify(result) === JSON.stringify(expected);
      });
      checkTruth(truth, body.correctIndex, '平均と各期を満たす条件');
      if (index === 0) assert.deepEqual(expected.filter(name => actual.some(row => row.name === name)), ['佐藤　花子', '鈴木　太郎']);
    } finally { db.close(); }
  });
});

test('問70は表示の表と下線が示す外部キー関係をSQLiteの挿入順序で全肢検算する', () => {
  const fixture = [
    { order: ['建物', '部屋', '資産'], id: ['建物番号', '部屋番号', 'パソコン番号'] },
    { order: ['地区', '校舎', '教室'], id: ['地区番号', '校舎番号', '教室番号'] },
    { order: ['利用者', '申請', '貸出'], id: ['利用者番号', '申請番号', '貸出番号'] },
    { order: ['部門', '製品', '販売'], id: ['部門番号', '製品番号', '販売番号'] },
  ];
  cases(70).forEach((body, index) => {
    const { order, id } = fixture[index];
    const alt = visible(body.prompt[1]);
    const seen = Object.fromEntries(alt.split('。').filter(Boolean).map(entry => entry.split('表：')));
    for (let slot = 0; slot < 3; slot++) {
      assert(seen[order[slot]]);
      for (const key of id.slice(0, slot + 1)) assert(seen[order[slot]].includes(key + '（下線）'));
    }
    assert.match(text(body.prompt[0]), /参照される表のデータが先に存在.*下線部の項目は，主キー又は外部キー/);
    const truth = options(body).map(choice => {
      const sequence = [...choice.matchAll(/“([^”]+)”表/g)].map(([, name]) => name);
      assert.deepEqual([...sequence].sort(), [...order].sort());
      const db = new DatabaseSync(':memory:');
      try {
        db.exec('PRAGMA foreign_keys = ON');
        db.exec('CREATE TABLE ' + order[0] + '(' + id[0] + ' INTEGER PRIMARY KEY);' +
          'CREATE TABLE ' + order[1] + '(' + id[0] + ' INTEGER REFERENCES ' + order[0] + ', ' + id[1] + ' INTEGER, PRIMARY KEY (' + id[0] + ', ' + id[1] + '));' +
          'CREATE TABLE ' + order[2] + '(' + id[2] + ' INTEGER PRIMARY KEY, ' + id[0] + ' INTEGER, ' + id[1] + ' INTEGER, FOREIGN KEY (' + id[0] + ', ' + id[1] + ') REFERENCES ' + order[1] + ')');
        for (const label of sequence) db.exec('INSERT INTO ' + label + ' VALUES (' + Array<string>(order.indexOf(label) + 1).fill('1').join(',') + ')');
        return true;
      } catch (error) {
        assert.match(String(error), /FOREIGN KEY constraint failed/);
        return false;
      } finally { db.close(); }
    });
    checkTruth(truth, body.correctIndex, '各表の参照制約');
  });
});

test('問71は受信側だけが秘密かぎを使い、送信者が受信側の公開かぎで暗号化する', () => {
  const expected = [
    { labels: ['商店', '顧客'], receive: 0, premise: /顧客から[^。]*注文を受ける/ },
    { labels: ['工場', '検査会社'], receive: 1, premise: /工場が，検査会社へ[^。]*検査依頼を伝える/ },
    { labels: ['診療所', '分析機関'], receive: 0, premise: /分析機関から[^。]*検査結果を受け取る/ },
    { labels: ['倉庫', '小売店'], receive: 1, premise: /倉庫が，小売店へ[^。]*出荷明細を伝える/ },
  ];
  cases(71).forEach((body, index) => {
    const { labels, receive, premise } = expected[index];
    const prompt = text(body.prompt[0]);
    assert.match(prompt, premise);
    assert.match(prompt, /公開かぎ暗号方式.*第三者に分からない/);
    const truth = body.choices.map(choice => {
      const pair = choice[0];
      assert(pair.type === 'table');
      assert.deepEqual(pair.columns, labels);
      assert.equal(pair.rows.length, 1);
      return pair.rows[0][receive] === '秘密かぎ' && pair.rows[0][1 - receive] === '公開かぎ';
    });
    checkTruth(truth, body.correctIndex, '受信側の鍵ペア');
    assert.match(body.explanation, new RegExp(labels[receive] + 'の公開かぎ'));
  });
});

test('問75の全候補で月間損益を積み上げる', () => {
  cases(75).forEach((body, index) => {
    const [man] = matchNumbers(text(body.prompt[0]), /月(\d+)万円の利益/);
    const values = rows(body.prompt[1]).map(([, amount]) => Number(amount.replaceAll(',', '').match(/^\d+/)?.[0]));
    const [sales, variable, fixed, days, seats] = values;
    const options = numbers(body);
    assert.deepEqual([...options].sort((a, b) => a - b), options);
    const outcomes = options.map(rate => Math.round(rate * seats * days * sales - rate * seats * days * variable - fixed));
    assert.equal(options[body.correctIndex!], [5, 6, 4, 7][index]);
    checkTruth(outcomes.map(value => value === man * 10000), body.correctIndex, '目標利益ちょうどの客数');
    assert(outcomes.filter((_, i) => i !== body.correctIndex).every(value => value < man * 10000));
  });
});

test('問77は10通りの同確率分布で各案の期待利益を独立集計する', () => {
  const winner = ['C', 'A', 'B', 'D'];
  cases(77).forEach((body, index) => {
    const matrix = rows(body.prompt[1]);
    assert.equal(matrix.length, 5);
    const observations = matrix[0].slice(1).flatMap((value, scenario) => Array<number>(Math.round(Number(value) * 10)).fill(scenario));
    assert.equal(observations.length, 10);
    const totals = Object.fromEntries(matrix.slice(1).map(([option, ...data]) =>
      [option, observations.map(observation => Number(data[observation])).reduce((sum, datum) => sum + datum)]));
    if (index === 0) assert.deepEqual(totals, { A: 104, B: 98, C: 113, D: 94 });
    assert.equal(options(body)[body.correctIndex!], winner[index]);
    checkTruth(options(body).map(option => Object.values(totals).every(value => totals[option] >= value)), body.correctIndex, '期待利益最大');
  });
});

test('問78の資源制約と目的を全候補の適用対象と照合し、数量と利益も独立探索する', () => {
  const optimal = new Set<number>();
  cases(78).forEach((body) => {
    const [time, material] = matchNumbers(text(body.prompt[0]), /最大(\d+)時間.*?月間(\d+)kg/);
    const inputs = rows(body.prompt[1]);
    assert.deepEqual(inputs.map(row => row[0]), ['製造時間（時間）', '原料所要量（kg）', '利益額（千円）']);
    const [hours, mass, profit] = inputs.map(row => row.slice(1).map(Number));
    let maximum = 0;
    for (let a = 0; a * hours[0] <= time && a * mass[0] <= material; a++) {
      for (let b = 0; a * hours[0] + b * hours[1] <= time && a * mass[0] + b * mass[1] <= material; b++) {
        const c = Math.floor(Math.min((time - a * hours[0] - b * hours[1]) / hours[2], (material - a * mass[0] - b * mass[1]) / mass[2]));
        maximum = Math.max(maximum, a * profit[0] + b * profit[1] + c * profit[2]);
      }
    }
    optimal.add(maximum);
    assert(maximum > 0);
    assert.match(text(body.prompt[0]), /単位量当たりの製造時間と原料所要量及び利益額.*どれだけ作ると最も高い利益/);
    assert.deepEqual(options(body), ['移動平均法', '最小二乗法', '線形計画法', '定量発注法']);
    const methods: Record<string, string> = { 移動平均法: '時系列', 最小二乗法: '曲線近似', 線形計画法: '一次不等式で表す資源量制約の目的関数を最大化', 定量発注法: '在庫管理' };
    checkTruth(options(body).map(option => methods[option].includes('目的関数を最大化')), body.correctIndex, '数理手法の適用対象');
  });
  assert.equal(optimal.size, 4);
});

type Review = {
  number: number;
  names: readonly string[];
  premises: readonly RegExp[];
  originalRoles?: readonly RegExp[];
  rolePatterns: readonly RegExp[];
};

// Each option is classified by the operation it performs or the proposition
// it asserts. Original distractors can describe a different job or assert
// a false restriction, and are classified separately when that distinction matters.
const knowledgeReview: readonly Review[] = [
  { number: 57, names: ['復旧時点を確保'], premises: [/データベースの障害/, /直前の営業日/, /最後の棚卸し/, /前日の受付終了/],
    originalRoles: [/全体.*新しい媒体.*毎日.*差分.*別の媒体/, /ラベルを付けない/, /更新した人に，その都度/, /直前.*上書き/],
    rolePatterns: [/全体.*新しい媒体.*変更分.*別媒体/, /ラベルを付けない/, /担当者に任せ.*全体バックアップの計画は設けない/, /一つに絞り.*直前.*上へ書き込む/] },
  { number: 58, names: ['再編成', '採番', '履歴', '列追加'],
    premises: [/定期的に再編成/, /空き番号.*新規入会者/, /古い操作記録.*必要な記録/, /区分を格納する項目がない/],
    originalRoles: [/削除したキーを再利用/, /複数になった更新レコードを一つ/, /不連続な空き領域を整理/, /データベースの定義を変更/],
    rolePatterns: [/キーの条件.*使っていない番号/, /必要な履歴.*記録の重複/, /分散した空領域を配置し直し/, /論理的な表の定義.*新しい属性/] },
  { number: 59, names: ['一斉', '段階', '試行', '並行'],
    premises: [/一斉移行/, /段階移行/, /パイロット移行/, /並行移行/],
    originalRoles: [/稼働後に段階的に周知/, /システム規模が小さい.*影響範囲を限定/, /二重負担を避け/, /処理結果と従来システムの処理結果を比較/],
    rolePatterns: [/拠点や機能の単位.*順次導入/, /限定した拠点で先行.*試験運用/, /二重負担を避け/, /処理結果と従来システムの処理結果を比較/] },
  { number: 60, names: ['棚卸し', '遠隔', '配信', '寿命管理'],
    premises: [/インストールされていないことを確認/, /操作画面を.*引き取って操作/, /一括してインストール/, /導入日・保守期限・廃棄日/],
    rolePatterns: [/^インベントリ収集$/, /^遠隔操作$/, /^ソフトウェア配信$/, /^ライフサイクル管理$/] },
  { number: 61, names: ['マスク', 'ポートで共用', 'アドレスクラス', '全域送信'],
    premises: [/サブネットマスクの説明/, /NAPTの説明/, /クラス識別の説明/, /ブロードキャストの説明/],
    originalRoles: [/ゲートウェイが一つのIPアドレス.*共用/, /クラスA～D.*4ビット/, /すべてのノード.*同一の情報/, /ホストアドレス部.*小さいネットワーク/],
    rolePatterns: [/アドレスをポート番号で区別して共用/, /先頭ビット.*従来のクラス/, /すべてのホストを宛先/, /ホストアドレス部.*小さいネットワーク/] },
  { number: 62, names: ['送信', 'メールボックス同期', '構造', '取り出し'],
    premises: [/送信.*サーバ間.*転送/, /フォルダや既読状態.*同期/, /メディア型.*符号化する方法/, /メールドロップ.*取り出す/],
    rolePatterns: [/^IMAP$/, /^MIME$/, /^POP3$/, /^SMTP$/] },
  { number: 65, names: ['DNS', 'DHCP', 'プロキシ', 'リモートアクセス'],
    premises: [/DNSサーバの役割/, /DHCPサーバの役割/, /フォワードプロキシサーバの役割/, /リモートアクセスサーバの役割/],
    rolePatterns: [/IPアドレスを動的に.*割り当て/, /Webページ.*キャッシュ.*応答/, /イントラネット.*ダイヤルアップ接続/, /ドメイン名をIPアドレスに対応/] },
  { number: 66, names: ['ネットワーク層', '物理層', '2ポート', '多ポート'],
    premises: [/ルータの機能/, /リピータの機能/, /2ポートのブリッジ/, /3ポート以上に接続したレイヤ2スイッチ/],
    originalRoles: [/ネットワーク層での中継/, /物理層で増幅/, /データリンク層でネットワーク同士を接続/, /MACアドレスを参照.*フレーム/],
    rolePatterns: [/ネットワーク層での中継/, /物理層で信号の整形や再生/, /データリンク層.*接続口は二つに限られる/, /三つ以上の接続口.*宛先MACアドレス.*送出ポート/] },
  { number: 67, names: ['正規化', '索引', '物理配置', '冗長化'],
    premises: [/データの正規化/, /表構造を保ったまま.*索引を作る/, /別の物理領域に分けて読取りページ数/, /結合.*整合性を別途維持.*名を複製/],
    originalRoles: [/関係データベース特有.*格納効率/, /レコードをできるだけ短く分割/, /冗長性をなくす.*アクセス効率/, /論理的なデータ構造.*矛盾や重複を排除/],
    rolePatterns: [/格納場所の対応|索引から探す|索引を設け/, /物理ページに収まる|物理的な格納を分け|物理ページだけを詰め直す/, /冗長なデータを追加|集計済みの結果を別の場所にも|冗長にして結合処理/, /関数従属|従属性を調べて表を分解/] },
  { number: 69, names: ['排他', '再編成', '正規化', '参照制約'],
    premises: [/同時に更新.*論理的な矛盾/, /空領域をまとめて格納状態/, /設計時.*冗長性や更新時の異常/, /存在する売上の番号だけを参照/],
    rolePatterns: [/^再編成$/, /^正規化$/, /^整合性制約$/, /^排他制御$/] },
  { number: 72, names: ['TCPポート', '宛先ポート', '送信元', 'プロトコル'],
    premises: [/パケットフィルタリング機能/, /HTTPS用のTCPポート/, /指定された外部の保守端末/, /規則に登録したIPプロトコル/],
    originalRoles: [/改ざんがある場合は修正/, /改ざんがあるかどうかをチェック/, /固定値のTCPポート番号.*変更/, /特定のTCPポート番号.*通過を許可/],
    rolePatterns: [/改ざんがある場合は修正/, /改ざんがあるかどうかをチェック/, /固定値のTCPポート番号.*変更/, /宛先TCPポート番号|送信元IPアドレス|IPヘッダのプロトコル番号/] },
  { number: 73, names: ['ASCIIの構成', 'EUC-JPの符号', 'Unicode符号位置', 'シフトJISの符号'],
    premises: [/文字符号の説明/, /EUC-JPの説明/, /Unicodeの説明/, /シフトJISの説明/],
    originalRoles: [/ASCII符号.*漢字に関する規定はない/, /EUCは.*16ビット以上.*漢字に関する規定はない/, /Unicodeは文字の1バイト目で漢字かどうか/, /シフトJIS符号.*UNIXにおける多言語対応.*ISO/],
    rolePatterns: [/ASCIIは上位1ビットを常に1.*漢字も1バイト/, /EUC-JP.*ASCIIと共通.*複数バイト/, /Unicode.*符号位置.*UTF-8やUTF-16/, /シフトJIS.*1バイト.*2バイト.*漢字は2バイト/] },
  { number: 74, names: ['業務再設計', '同時切替', '法令手順', '会計先行'],
    premises: [/ERPパッケージ.*留意点/, /混在すると番号が食い違う.*連携は設けない/, /法令で求められる.*標準機能.*扱えない.*だけでは対処できない/, /会計システムのサポートが先に終了.*連携する準備も整っている/],
    originalRoles: [/すべての業務システムを同時/, /現行業務プロセス.*カスタマイズ/, /最初に会計システム/, /会社全体の業務プロセスを再設計/],
    rolePatterns: [/関連するシステムを同時に切り替え/, /必要箇所に絞って.*カスタマイズ/, /会計を先に切り替え/, /会社全体の業務手順を設計し直す/] },
  { number: 76, names: ['要因探索', '作業順序', '工程管理', '改善順位'],
    premises: [/特性要因図に関する/, /アローダイアグラムに関する/, /管理図に関する/, /パレート図に関する/],
    rolePatterns: [/前後関係.*矢印.*日程計画/, /上下一対の限界線.*工程の異常/, /大きい順に並べて累計/, /魚の骨.*要因|魚の骨.*本質的な原因/] },
  { number: 79, names: ['アクセスできる', '移動', '在宅', '連続利用'],
    premises: [/情報バリアフリーに該当/, /移動体通信の利用環境/, /テレワークの利用環境/, /ユビキタスコンピューティング/],
    rolePatterns: [/限られた手段でしか入力できない場合でも/, /移動しながら通信端末/, /通勤時.*ロスのない勤務形態/, /シームレスにコンピュータを利用/] },
];

test('独立に査読した適用条件と対照役割で知識問題15問の全肢を照合する', () => {
  const applicability: Readonly<Record<number, readonly number[]>> = {
    57: [0, 0, 0, 0], 58: [2, 0, 1, 3], 59: [2, 0, 1, 3], 60: [0, 1, 2, 3],
    61: [3, 0, 1, 2], 62: [3, 0, 1, 2], 65: [3, 0, 1, 2], 66: [0, 1, 2, 3],
    67: [3, 0, 1, 2], 69: [3, 0, 1, 2], 72: [3, 3, 3, 3], 73: [0, 1, 2, 3],
    74: [3, 0, 1, 2], 76: [3, 0, 1, 2], 79: [0, 1, 2, 3],
  };
  for (const { number, names, premises, originalRoles, rolePatterns } of knowledgeReview) {
    cases(number).forEach((body, index) => {
      assert.match(text(body.prompt[0]), premises[index], '問' + number);
      const patterns = index === 0 ? originalRoles ?? rolePatterns : rolePatterns;
      const roles = options(body).map(option => {
        const matches = patterns.map(pattern => pattern.test(option));
        assert.equal(matches.filter(Boolean).length, 1, option);
        return matches.indexOf(true);
      });
      assert.deepEqual(roles, [0, 1, 2, 3], '原紙の選択肢の役割・並びを保持');
      checkTruth(roles.map(role => role === applicability[number][index]), body.correctIndex, '問' + number + ' ' + names[index]);
    });
  }
});

test('問80は当時の職務著作、表現、権利譲渡と表示・複製の四原則で全肢の文意を照合する', () => {
  const reviewedAssertions = [
    ['発注しただけで著作者となる', 'アイディアだけを用いた独立作成は侵害', '人格権を譲渡できる', '表示なしでも無断複製は侵害'],
    ['職務著作の要件を満たせば会社が著作者', '考え方だけの利用でも侵害', '全部譲渡で人格権も譲渡', '表示がなければ複製権を侵害しない'],
    ['受注者の納品で発注者が著作者', 'アイディアだけの利用は侵害しない', '著作権自体を譲渡できない', '表示不要の要件を否定'],
    ['代金の全額支払いで著作者', '解法だけの利用でも侵害', '著作権は譲渡可・人格権は不可', '表示なしなら無断複製可'],
  ] as const;
  const legallySupported: ReadonlySet<string> = new Set([
    '職務著作の要件を満たせば会社が著作者', 'アイディアだけの利用は侵害しない',
    '著作権は譲渡可・人格権は不可', '表示なしでも無断複製は侵害',
  ]);
  const textProof = [
    [/N社が請け負って開発した。特段の契約条件がなければ.*著作者はM社/, /アイディアだけを利用して.*著作権の侵害になる。$/, /著作権及び著作者人格権は.*譲渡することができる。$/, /著作権表示が明記されていない場合でも.*無断で複製して配布.*侵害になる。$/],
    [/発意し，その従業員が職務上作成.*別段の定めがなければ.*著作者となる。$/, /処理手順の考え方だけ.*独立に作成.*侵害する。$/, /全部譲渡.*人格権も譲渡できる。$/, /保護期間内.*無断で複製して配布.*表示がなければ複製権を侵害しない。$/],
    [/発注者の社員が制作に関与せず.*納品しただけで発注者が著作者/, /アイディアだけを利用して表現が異なる.*利用したことだけでは著作権侵害にならない。$/, /著作権は.*譲渡できない。$/, /権利制限もない.*表示がなければ無断で複製し配布できる。$/],
    [/作成に関与しなかった顧客.*費用を全額支払った時点で著作者/, /アルゴリズムだけ.*表現を独自に作成.*著作権侵害になる。$/, /著作権の全部又は一部は譲渡できるが，著作者人格権は譲渡できない。$/, /権利の制限規定が当てはまらない保護期間内.*表示がなければ無断で複製・配布できる。$/],
  ];
  cases(80).forEach((body, index) => {
    assert.match(text(body.prompt[0]), /著作権法に関する記述のうち，適切なもの/);
    const truth = options(body).map((option, slot) => {
      assert.match(option, textProof[index][slot]);
      return legallySupported.has(reviewedAssertions[index][slot]);
    });
    checkTruth(truth, body.correctIndex, '著作権法の各肢');
    assert.match(body.explanation, /第17条第2項.*第21条/);
    assert.match(body.explanation, /保護期間内で権利制限に当たらなければ/);
  });
});
