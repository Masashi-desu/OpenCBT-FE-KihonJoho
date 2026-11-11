import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readBookletFigure } from '../../../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2014SpringAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2014-spring-am-27-53';
import { legacy2014SpringAm27To53Source as original } from '../../../src/core/generators/legacy-2014-spring-am-27-53-source';
import { legacy2014SpringAm27To53Figures as figures } from '../../../src/core/generators/legacy-2014-spring-am-27-53-figures';
import { legacy2014SpringAm27To53Renderers as renderers } from '../../../src/ui/Legacy2014SpringAm2753Figures';

const keys = 'アイウエ';
const officialKeys = 'ウエイウエエウエアアウエアエアウエウエイアイイイウエエ';
const text = (body: GeneratedBody) => body.prompt.flatMap(b => b.type === 'paragraph' ? [b.text] : []).join('\n');
function choices(body: GeneratedBody) {
  return body.choices.map(([b]) => { assert(b.type === 'paragraph' || b.type === 'code'); return b.text; });
}
function each(number: number, check: (body: GeneratedBody, input: number) => void) {
  const def = definitions.find(def => def.source === '2014h26h-fe-am-' + number);
  assert(def, String(number));
  for (let i = def.fields[0].minimum; i <= def.fields[0].maximum; i++) check(def.build([i]), i);
}
function correct(body: GeneratedBody, check: (option: string, index: number) => boolean) {
  const options = choices(body);
  assert.equal(new Set(options).size, 4);
  assert.deepEqual(options.flatMap((v, i) => check(v, i) ? [i] : []), [body.correctIndex], text(body));
}
type Matching<T> = readonly (readonly [RegExp, T])[];
function category<T>(value: string, candidates: Matching<T>) {
  const match = candidates.filter(([rule]) => rule.test(value));
  assert.equal(match.length, 1, value);
  return match[0][1];
}
function matchQuestion(number: number, prompts: Matching<string>, options: Matching<string>) {
  each(number, body => {
    const expected = category(text(body), prompts);
    assert.equal(new Set(choices(body).map(v => category(v, options))).size, 4);
    correct(body, v => category(v, options) === expected);
  });
}
function markup(body: GeneratedBody) {
  const block = body.prompt.find(b => b.type === 'diagram');
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  const { scene } = block;
  const figure = figures.find(item => item.profile === scene.profile);
  const renderer = renderers.find(item => item.profile === scene.profile);
  assert(figure && renderer);
  assert.equal(readBookletFigure(figure, scene.values), block.alt);
  return renderToStaticMarkup(createElement(renderer.component, { values: scene.values, caption: block.caption }));
}

test('2014春午前問27〜53の公式基準、4図、76有限条件を確認する', () => {
  assert.deepEqual(definitions.map(d => d.source), Array.from({ length: 27 }, (_, i) => '2014h26h-fe-am-' + (27 + i)));
  assert.equal(definitions.map(d => d.sourceAnswer).join(''), officialKeys);
  assert.deepEqual(figures.map(f => f.profile), renderers.map(r => r.profile));
  let count = 0;
  for (const [i, definition] of definitions.entries()) {
    const n = i + 27, baseline = definition.build(definition.reference);
    assert.equal(keys[baseline.correctIndex!], officialKeys[i]);
    assert.deepEqual(choices(baseline), original[n].choices);
    assert.equal(text(baseline).replace(' ▭ ', '［空の長方形］'), original[n].prompt);
    const seenPrompts = new Set<string>(), seenAnswers = new Set<number>();
    assert.equal(definition.fields[0].minimum, 0);
    assert(definition.fields[0].maximum > 0);
    each(n, (body, input) => {
      count++;
      assert.deepEqual(body, definition.build([input]));
      assert.equal(body.choices.length, 4);
      assert.equal(body.contexts, undefined);
      assert(typeof body.correctIndex === 'number' && body.correctIndex >= 0 && body.correctIndex < 4);
      assert(body.explanation.length > 38);
      const visible = JSON.stringify(body.prompt);
      assert(!seenPrompts.has(visible), definition.source);
      seenPrompts.add(visible);
      seenAnswers.add(body.correctIndex);
      if (body.prompt.some(b => b.type === 'diagram')) assert.match(markup(body), /<svg/);
    });
    assert.equal(definition.answerVariation === 'fixed', seenAnswers.size === 1);
    for (const invalid of [[], [-1], [definition.fields[0].maximum + 1], [0.5], [NaN], [Infinity], [0, 0]])
      assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(count, 76);
});

test('問28は主キーの下線を保ち、空表と重複商品を含む全128状態のSQL結果で検算する', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE 商品 (商品番号 INTEGER PRIMARY KEY NOT NULL, 商品名 TEXT, 単価 INTEGER);' +
      'CREATE TABLE 在庫 (倉庫番号 INTEGER NOT NULL, 商品番号 INTEGER NOT NULL, 在庫数 INTEGER, PRIMARY KEY (倉庫番号, 商品番号));');
    assert.throws(() => db.prepare('INSERT INTO 在庫 (倉庫番号, 商品番号) VALUES (1, NULL)').run(), /NOT NULL/);
    const addProduct = db.prepare('INSERT INTO 商品 (商品番号) VALUES (?)');
    const addStock = db.prepare('INSERT INTO 在庫 (倉庫番号, 商品番号) VALUES (?, ?)');
    each(28, (body, input) => {
      assert.match(text(body), /下線部は主キー/);
      const svg = markup(body);
      assert.match(svg, /data-sql-table="商品"/);
      assert.match(svg, /data-sql-table="在庫"/);
      const keys = [...svg.matchAll(/text-decoration="underline" data-primary-key="([^"]+)"/g)].map(match => match[1]);
      assert.deepEqual(keys, ['商品番号', '倉庫番号', '商品番号']);
      const expression = body.prompt.find(b => b.type === 'code');
      assert(expression?.type === 'code' && expression.language === 'sql');
      if (!input) assert.equal(expression.text, 'SELECT 商品番号 FROM 商品\nWHERE 商品番号 NOT IN (SELECT 商品番号 FROM 在庫)');
      const reference = db.prepare(expression.text);
      const candidates = choices(body).map(option => db.prepare(option));
      const equivalent = candidates.map(() => true);
      const allResults = (statement: ReturnType<DatabaseSync['prepare']>) => statement.all().map(row => Number(row['商品番号'])).sort((a, b) => a - b);
      const stockRows = [[1, 1], [2, 1], [2, 2], [2, 4]];
      for (let p = 0; p < 8; p++) for (let s = 0; s < 16; s++) {
        db.exec('DELETE FROM 在庫; DELETE FROM 商品;');
        [1, 2, 3].forEach((product, i) => { if (p & 1 << i) addProduct.run(product); });
        stockRows.forEach(([warehouse, product], i) => { if (s & 1 << i) addStock.run(warehouse, product); });
        const expected = JSON.stringify(allResults(reference));
        candidates.forEach((query, i) => { if (JSON.stringify(allResults(query)) !== expected) equivalent[i] = false; });
      }
      assert.deepEqual(equivalent.flatMap((same, i) => same ? [i] : []), [body.correctIndex]);
    });
  } finally {
    db.close();
  }
});

test('問27・29〜35は関係演算、ACID、OSI、プロトコルとIPv4の全候補を照合する', () => {
  matchQuestion(27, [[/射影（projection）/, 'columns'], [/選択（selection）/, 'rows'], [/結合（join）/, 'join']],
    [[/照会結果を合わせて/, 'union'], [/合致した行を取り出す/, 'rows'], [/特定の列だけ/, 'columns'], [/合致した組同士/, 'join']]);
  matchQuestion(29, [[/全く処理しなかった/, 'atomic'], [/復旧後に確定済み/, 'durable'], [/確定前の更新内容が他方から見えず/, 'isolated']],
    [[/^一貫性/, 'consistent'], [/^原子性/, 'atomic'], [/^耐久性/, 'durable'], [/^独立性/, 'isolated']]);
  each(30, body => {
    const targets = [...text(body).matchAll(/(物理層|データリンク層|ネットワーク層)で中継する装置/g)].map(match => match[1]);
    assert.equal(targets.length, 3);
    assert.equal(new Set(targets).size, 3);
    const device: Record<string, string> = { リピータ: '物理層', ブリッジ: 'データリンク層', ルータ: 'ネットワーク層' };
    correct(body, v => v.split('，').every((name, i) => device[name] === targets[i]));
  });
  matchQuestion(31, [[/DNSが果たす/, 'lookup'], [/DHCPが果たす/, 'allocate'], [/NATが果たす/, 'translate']],
    [[/使用されていないIPアドレスを割り当てる/, 'allocate'], [/プログラム名の指定だけ/, 'rpc'], [/グローバルIPアドレスに変換/, 'translate'],
      [/ホスト名などとIPアドレス/, 'lookup']]);
  each(32, body => {
    const stem = text(body);
    const v4 = /^IPv4/.test(stem), local = /リンクローカルユニキャスト/.test(stem);
    correct(body, value => {
      const bits = value.match(/アドレス長は(\d+)ビット/);
      if (bits) return Number(bits[1]) === (v4 ? 32 : 128);
      if (/全てグローバル/.test(value)) return false;
      if (/同一リンク内/.test(value)) return local;
      if (/1対1/.test(value)) return 2n ** 32n === 2n ** 128n;
      assert.match(value, /16進数表記を4文字/);
      return !v4 && value.includes('コロン');
    });
  });
  matchQuestion(33, [[/ヘッダフィールドの拡張/, 'mime'], [/構造をタグで記述/, 'markup'], [/メールサーバへ電子メールを配送/, 'smtp']],
    [[/^HTML$/, 'markup'], [/^MHS$/, 'mhs'], [/^MIME$/, 'mime'], [/^SMTP$/, 'smtp']]);
  matchQuestion(34, [[/ICMPのエコー要求/, 'reachable'], [/自分に設定されたIPv4アドレス/, 'config'], [/キャッシュしているIPアドレス/, 'cache']],
    [[/^arp$/, 'cache'], [/^echo$/, 'echo'], [/^ipconfig$/, 'config'], [/^ping$/, 'reachable']]);
  each(35, body => {
    const match = text(body).match(/192\.168\.30\.(\d+)\/(\d+)/);
    assert(match);
    const low = Number(match[1]), prefix = Number(match[2]);
    const lastOctetMask = (255 << (32 - prefix)) & 255;
    assert.equal(low & lastOctetMask, low);
    const within = Array.from({ length: 256 }, (_, i) => i).filter(n => (n & lastOctetMask) === low);
    const usable = within.slice(1, -1).length;
    const displayed = choices(body).map(Number);
    assert.deepEqual(displayed, [...displayed].sort((a, b) => a - b));
    const wider = Array.from({ length: 256 }, (_, i) => i).filter(n => (n & ((lastOctetMask << 1) & 255)) === (low & ((lastOctetMask << 1) & 255)));
    assert.deepEqual(new Set(displayed), new Set([usable, within.length, prefix, wider.length - 2]));
    correct(body, value => Number(value) === usable);
  });
});

test('問36〜45の暗号・攻撃・対策の全候補を原と同じ方向で照合する', () => {
  matchQuestion(36, [[/メッセージ認証符号/, 'integrity'], [/共通鍵暗号/, 'privacy']],
    [[/改ざんされていない/, 'integrity'], [/暗号化方式を確認/, 'method'], [/概要を確認/, 'abstract'], [/秘匿性を確保/, 'privacy']]);
  matchQuestion(37, [[/認証局が果たす/, 'crl'], [/署名付きデータを受け取った/, 'verify'], [/受信者の証明書に含まれる情報を用いて/, 'encrypt']],
    [[/共通鍵を生成/, 'symmetric'], [/公開鍵を利用しデータの暗号化/, 'encrypt'], [/失効したディジタル証明書の一覧/, 'crl'],
      [/改ざんされていないことを検証/, 'verify']]);
  each(38, body => {
    const lost = text(body).includes('紛失したとの申告');
    correct(body, value => {
      if (/共通のPIN|表面に刻印/.test(value)) return false;
      if (value.includes('失効')) return value.indexOf('失効') < value.indexOf('新たなICカードを発行');
      assert.match(value, /配送/);
      return !lost && /同封せず.*別経路/.test(value);
    });
  });
  matchQuestion(39, [[/“完全性”/, 'change'], [/“可用性”/, 'availability'], [/伝送経路上での“機密性”/, 'in-flight']],
    [[/Webページの改ざん/, 'change'], [/保管されているデータの不正コピー/, 'at-rest'], [/過負荷状態/, 'availability'], [/通信内容の盗聴/, 'in-flight']]);
  matchQuestion(40, [[/貸与するスマートフォン/, 'management'], [/従業員自身のスマートフォン/, 'own-device'], [/電子文書を全社で共有/, 'documents']],
    [[/^BYOD/, 'own-device'], [/^ECM/, 'documents'], [/^LTE/, 'radio'], [/^MDM/, 'management']]);
  matchQuestion(41, [[/組織内部の人間から/, 'person'], [/プログラム自身が別の有害な処理/, 'disguised'], [/第三者の機器から|その機器から本来の攻撃対象/, 'relay']],
    [[/^ソーシャルエンジニアリング$/, 'person'], [/^トロイの木馬$/, 'disguised'], [/^パスワードクラック$/, 'guess'], [/^踏み台攻撃$/, 'relay']]);
  each(42, (body, input) => {
    if (input) assert.match(text(body), /利用者ごとにランダムなソルト.*登録時も認証時も記録した同じソルト/);
    const all = new Set<string>();
    correct(body, value => {
      const registered = input ? value.match(/^(利用者ID|パスワード)をKDF/)?.[1]
        : value.startsWith('パスワードに対応する利用者ID') ? '利用者ID' : 'パスワード';
      const entered = value.match(/入力された(利用者ID|パスワード)/)?.[1];
      assert(registered && entered);
      all.add(registered + '/' + entered);
      return registered === entered && entered === 'パスワード';
    });
    assert.equal(all.size, 4);
  });
  matchQuestion(43, [[/侵入するために攻撃者/, 'entry'], [/サーバの画面を表示/, 'thin-client']],
    [[/^シンクライアントエージェント$/, 'thin-client'], [/^ストリクトルーティング$/, 'routing'],
      [/^ディジタルフォレンジックス$/, 'evidence'], [/^バックドア$/, 'entry']]);
  each(44, body => {
    const port = Number(text(body).match(/TCPポート番号(\d+)/)?.[1]);
    correct(body, value => {
      if (/DNSのゾーン転送|ドメイン名の名前解決/.test(value)) return port === 53 && /許可/.test(value);
      const implied = value.includes('HTTPS') ? 443 : 80;
      return implied === port && value.includes('ファイアウォールで許可');
    });
    assert.match(body.explanation, /ポート番号だけ|番号は安全性を示さない/);
  });
  matchQuestion(45, [[/生体認証システム/, 'biometrics'], [/マルウェア対策ソフトウェア/, 'malware'], [/公開鍵基盤による電子署名/, 'pki']],
    [[/データを無害化/, 'sanitize'], [/パターンファイルの頻繁な更新/, 'malware'],
      [/本人のディジタル証明書/, 'pki'], [/本人を誤って拒否する確率/, 'biometrics']]);
});

test('問46〜52の図と手法の全候補を原形式のまま検証する', () => {
  each(46, (body, input) => {
    assert.match(text(body), /UMLにおける図の ▭ の中/);
    const svg = markup(body);
    assert.deepEqual([...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="105" height="44" data-uml-box="(\d+)"/g)]
      .map(([, x, y, box]) => [+box, +x, +y]), [[0, 53, 17], [1, 225, 17], [2, 53, 127]]);
    assert.match(svg, input === 1 ? /data-uml-association="2-1"/ : /data-uml-association="0-1"/);
    assert.match(svg, input === 2 ? /data-uml-superclass="2"/ : /data-uml-superclass="0"/);
    assert.match(svg, /marker-end="url\(#[^)]+triangle\)"/);
    correct(body, v => category(v, [[/^関連名$/, 'line'], [/^クラス名$/, 'rectangle'], [/^集約名$/, 'diamond'], [/^ユースケース名$/, 'ellipse']]) === 'rectangle');
  });
  matchQuestion(47, [[/内部構造を知らなくても/, 'hide'], [/共通の属性と操作を一つの型/, 'class'], [/独立したソフトウェア部品へ分け/, 'module']],
    [[/^カプセル化$/, 'hide'], [/^クラス化$/, 'class'], [/^構造化$/, 'structured'], [/^モジュール化$/, 'module']]);
  matchQuestion(48, [[/状態遷移図/, 'state'], [/機能分解図/, 'function'], [/データフロー図/, 'flow']],
    [[/プログラムの全体構造/, 'program'], [/状態を変化させるきっかけ/, 'state'], [/システムの機能を概要から詳細/, 'function'],
      [/処理間のデータの流れ/, 'flow']]);
  each(49, body => {
    const target = text(body).includes('分岐網羅') ? 'branch' : 'specification';
    correct(body, v => category(v, [[/ソースリストを参照/, 'listing'], [/機能仕様やインタフェース/, 'specification'],
      [/処理手順や内部構造|命令が少なくとも/, 'structure'], [/真と偽をそれぞれ/, 'branch']]) === target);
  });
  matchQuestion(50, [[/リファクタリング/, 'refactor'], [/ペアプログラミング/, 'pair'], [/テスト駆動開発/, 'tdd']],
    [[/2人のプログラマ/, 'pair'], [/外部仕様を変更することなく/, 'refactor'], [/テストケースを先に設定/, 'tdd'],
      [/試作品を早期に作成/, 'prototype']]);
  each(51, body => {
    const stage = text(body).match(/(\d)番目の文字“([A-Z])”/);
    assert(stage);
    const sequence = ['Plan', 'Do', 'Check', 'Act'];
    const name = sequence[Number(stage[1]) - 1];
    assert.equal(name[0], stage[2]);
    assert(choices(body).every(value => value.startsWith(stage[2])));
    correct(body, value => value === name);
  });
  each(52, (body, input) => {
    const svg = markup(body);
    assert.equal([...svg.matchAll(/data-wbs-node=/g)].length, 5);
    assert.match(svg, /data-wbs-continuation=/);
    assert(svg.includes('…'));
    if (!input) for (const label of ['システム開発', '企画プロセス', '要件定義プロセス', 'プロセス開始', 'の準備', '利害関係者', '要件の定義'])
      assert(svg.includes(label), label);
    correct(body, v => category(v, [[/^CPM$/, 'critical-time'], [/^EVM$/, 'earned'], [/^PERT$/, 'time-estimate'], [/^WBS$/, 'tree']]) === 'tree');
  });
});

test('問53は描画した9節点・12作業から選択肢外を含む全7経路を独立に検算する', () => {
  const officialEdges = ['A:0:1:2', 'B:1:2:3', 'C:1:3:3', 'D:3:2:1', 'E:2:4:1', 'F:3:4:3',
    'G:3:5:4', 'H:4:6:3', 'I:4:7:2', 'J:5:7:2', 'K:6:8:2', 'L:7:8:3'];
  each(53, (body, input) => {
    const html = markup(body);
    assert.equal([...html.matchAll(/data-event="/g)].length, 9);
    assert.match(html, /凡例.*作業名.*所要日数/);
    const edges = [...html.matchAll(/data-activity="([A-L])" data-from="(\d+)" data-to="(\d+)" data-days="(\d+)"/g)]
      .map(([, activity, from, to, days]) => ({ activity, from: +from, to: +to, days: +days }));
    assert.deepEqual(edges.map(e => [e.activity, e.from, e.to].join(':')), officialEdges.map(v => v.split(':').slice(0, 3).join(':')));
    if (!input) assert.deepEqual(edges.map(e => [e.activity, e.from, e.to, e.days].join(':')), officialEdges);
    const routes = new Map<string, number>(), pending = [{ at: 0, path: [] as string[], duration: 0 }];
    while (pending.length) {
      const { at, path, duration } = pending.shift()!;
      if (at === 8) routes.set(path.join('→'), duration);
      else for (const { activity, to, days } of edges.filter(e => e.from === at))
        pending.push({ at: to, path: [...path, activity], duration: duration + days });
    }
    assert.equal(routes.size, 7);
    for (const path of ['A→B→E→H→K', 'A→C→D→E→I→L', 'A→C→F→H→K']) assert(routes.has(path));
    const max = Math.max(...routes.values());
    assert.equal(max, [14, 16, 17, 16][input]);
    assert.equal([...routes.values()].filter(v => v === max).length, 1);
    assert(choices(body).every(v => routes.has(v)));
    correct(body, value => routes.get(value) === max);
    const earliest = new Map<number, number>([[0, 0]]);
    for (let pass = 0; pass < 8; pass++) for (const { from, to, days } of edges) {
      const arrival = earliest.get(from);
      if (arrival !== undefined) earliest.set(to, Math.max(arrival + days, earliest.get(to) ?? -Infinity));
    }
    assert.equal(earliest.get(8), max);
  });
});
