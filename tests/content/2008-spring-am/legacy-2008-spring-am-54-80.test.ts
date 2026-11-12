import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2008SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2008-spring-am-54-80';
import { legacy2008SpringAm5480Figures as figures } from '../../../src/core/generators/legacy-2008-spring-am-54-80-figures';
import { legacy2008SpringAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2008SpringAm5480Figures';

const official = 'アエエアアイアエイアウアエイアエアアエウアエアアイアア';
const cases = [0, 1, 2, 3];
type Four = readonly [RegExp, RegExp, RegExp, RegExp];
type Fact = { context: RegExp; options: Four; correct: RegExp };
const fact = (context: RegExp, options: Four, correct: RegExp): Fact => ({ context, options, correct });
const fixed = (contexts: Four, options: Four, correct: Four) => contexts.map((context, i) => fact(context, options, correct[i]));

// Facts were reviewed from subject matter, with all distractors matched separately from correctness.
const knowledge: Readonly<Record<number, Fact[]>> = {
  54: fixed([/IPアドレスをPCの起動時.*自動設定/, /名前に対応するIPアドレス/, /制御接続とデータ接続/, /2点を結ぶ.*カプセル化/],
    [/^DHCP$/, /^DNS$/, /^FTP$/, /^PPP$/], [/^DHCP$/, /^DNS$/, /^FTP$/, /^PPP$/]),
  55: fixed([/低速回線用の動画像/, /デジタル写真.*静止画像/, /Video CDの動画像/, /デジタルテレビ放送やDVD-Video/],
    [/^JPEG$/, /^MPEG-1$/, /^MPEG-2$/, /^MPEG-4$/], [/^MPEG-4$/, /^JPEG$/, /^MPEG-1$/, /^MPEG-2$/]),
  60: [
    fact(/データベースの回復処理/, [/ウォームスタート.*チェックポイント.*ログを使用/, /正常終了.*ロールバック/, /コールドスタート.*チェックポイントでのログ/, /終了していない.*ロールフォワード/], /ウォームスタート.*チェックポイント.*ログを使用/),
    fact(/確定した注文.*反映されていなかった/, [/確定済み.*すべて取り消し/, /更新後のログ.*確定済みの注文を反映/, /障害が起こった後に.*新たに作る/, /ログを用いず未確定.*反映/], /更新後のログ.*確定済みの注文を反映/),
    fact(/媒体が破損.*バックアップと.*更新ログ/, [/媒体を交換せず/, /データの実体がなくても/, /バックアップを復元し.*確定した更新/, /未確定取引の変更だけ/], /バックアップを復元し.*確定した更新/),
    fact(/確定する前に中断.*媒体は正常/, [/処理済みとしてそのまま/, /中断した取引を確定/, /すべてのデータを過去のバックアップ/, /更新前のログを使って取り消す/], /更新前のログを使って取り消す/),
  ],
  61: fixed([/利用頻度の高い命令群をあらかじめサーバ/, /全参加者が確定可能/, /複数の取引の確定ログを.*まとめ/, /一つのサーバプロセス.*並行/],
    [/^2相コミットメント/, /^グループコミットメント/, /マルチスレッド/, /^ストアドプロシージャ/],
    [/^ストアドプロシージャ/, /^2相コミットメント/, /^グループコミットメント/, /マルチスレッド/]),
  62: fixed([/アクセス効率を低下させない/, /表定義とデータの構造を作り直す/, /分析できる形式でファイルに出力/, /復元時点に対応する複製を別の保存先/],
    [/^再構成$/, /^再編成$/, /^データベースダンプ$/, /^バックアップ$/], [/^再編成$/, /^再構成$/, /^データベースダンプ$/, /^バックアップ$/]),
  63: fixed([/ハッシュ値.*比較.*保護/, /第三者.*本文を読み取れない/, /差出人が第三者によって偽られていない/, /配達済み.*配送状態通知/],
    [/^改ざんの有無の検出$/, /^盗聴の防止$/, /^なりすましの防止$/, /^メールの送達の確認$/],
    [/^改ざんの有無の検出$/, /^盗聴の防止$/, /^なりすましの防止$/, /^メールの送達の確認$/]),
  65: fixed([/通信経路上で盗聴/, /許可していないクライアントから/, /運用権限のないサーバ利用者/, /既定のポート番号だけ/],
    [/プログラム間の通信を暗号化/, /クライアントのIPアドレスを.*制限/, /起動・停止.*パスワード/, /ポート番号を.*初期値から変更/],
    [/プログラム間の通信を暗号化/, /クライアントのIPアドレスを.*制限/, /起動・停止.*パスワード/, /ポート番号を.*初期値から変更/]),
  68: [
    fact(/リスク分析に関する/, [/損失額と発生確率.*優先順位/, /完了しないうちに.*繰り返し.*避ける/, /過去の類似プロジェクト.*参照.*避ける/, /実損失額を知ることが目的/], /損失額と発生確率.*優先順位/),
    fact(/外部サービスの提供が突然終了/, [/終わるまで分析の前提は変更しない/, /新しい事実を分析に反映.*優先順位を再評価/, /今回の評価には含めない/, /同額の追加予算/], /新しい事実を分析に反映.*優先順位を再評価/),
    fact(/旧事業の障害データ/, [/将来と無関係/, /条件の差を確認せず/, /条件を確認し，差や不確実さを考慮/, /過去の損失の最大額だけ/], /条件を確認し，差や不確実さを考慮/),
    fact(/複数の対策.*効果と費用/, [/最も高価/, /発生する確率は.*除く/, /残る影響は考慮しない/, /発生確率と影響，残るリスク，実施費用を比較/], /発生確率と影響，残るリスク，実施費用を比較/),
  ],
  72: fixed([/一定時点.*資産，負債及び純資産/, /株主資本.*期首残高から期末残高/, /現金及び現金同等物.*営業活動/, /収益と費用.*営業利益/],
    [/^株主資本等変動計算書$/, /^キャッシュフロー計算書$/, /^損益計算書$/, /^貸借対照表$/],
    [/^貸借対照表$/, /^株主資本等変動計算書$/, /^キャッシュフロー計算書$/, /^損益計算書$/]),
  74: fixed([/ワークサンプリング法/, /既定時間標準法/, /直接時間研究法/, /質問紙法/],
    [/観測.*観測点数の比率/, /基本動作.*時間標準テーブル/, /ストップウォッチ.*反復測定/, /アンケート調査票.*集計/],
    [/観測.*観測点数の比率/, /基本動作.*時間標準テーブル/, /ストップウォッチ.*反復測定/, /アンケート調査票.*集計/]),
  79: fixed([/特に取決めのない場合.*派遣先企業の指示/, /派遣元企業へ譲渡.*譲渡を完了/, /発意や職務と無関係.*独力/, /職務上.*別段の取決めはなく.*公表していない/],
    [/^派遣先企業$/, /^派遣先企業の直接指揮命令者$/, /^派遣元企業$/, /^派遣労働者$/],
    [/^派遣先企業$/, /^派遣元企業$/, /^派遣労働者$/, /^派遣先企業$/]),
  80: fixed([/ボリュームライセンス/, /サイトライセンス/, /クリックオン/, /シュリンクラップ/],
    [/大量購入者.*許諾数.*あらかじめ/, /使用場所を限定/, /画面に表示される契約内容に同意/, /パッケージの包装を解いたとき/],
    [/大量購入者.*許諾数.*あらかじめ/, /使用場所を限定/, /画面に表示される契約内容に同意/, /パッケージの包装を解いたとき/]),
};

const number = (text: string) => Number(text.replaceAll(',', ''));
function content(blocks: Block[]) {
  return blocks.map(block => {
    if (block.type === 'paragraph' || block.type === 'code') return block.text;
    if (block.type === 'diagram') return block.alt;
    if (block.type === 'table') return [block.columns, ...block.rows].map(row => row.join('｜')).join('。');
    throw new Error('未検査のブロック: ' + block.type);
  }).join('\n');
}
function diagram(block: Block) {
  assert.equal(block.type, 'diagram');
  return block.alt;
}
function tableBlock(block: Block) {
  assert.equal(block.type, 'table');
  return block;
}
type Dependency = { left: string[]; right: string };
function closure(initial: string[], dependencies: Dependency[]) {
  const derived = new Set(initial);
  for (let previousSize = -1; previousSize !== derived.size;) {
    previousSize = derived.size;
    for (const { left, right } of dependencies)
      if (left.every(column => derived.has(column))) derived.add(right);
  }
  return derived;
}
function subsets(columns: string[]) {
  return columns.reduce<string[][]>((all, value) => [...all, ...all.map(group => [...group, value])], [[]]);
}
function normalization(body: GeneratedBody, options: string[]) {
  const dependencies = [...diagram(body.prompt[1]).matchAll(/［([a-h，]+)］→［([a-h])］/g)]
    .map(([, left, right]) => ({ left: left.split('，'), right }));
  assert.equal(dependencies.length, 7);
  assert.equal(closure(['a'], dependencies).size, 8);
  return options.map(option => {
    const relations = [...option.matchAll(/表[123] \{([a-h, ]+)\}/g)].map(([, columns]) => columns.split(', '));
    assert.equal(relations.length, 3);
    const projections = relations.map(columns => subsets(columns).flatMap(left =>
      columns.filter(right => !left.includes(right) && closure(left, dependencies).has(right)).map(right => ({ left, right }))));
    const hasKey = relations.some(columns => columns.includes('a'));
    const preserves = dependencies.every(({ left, right }) => closure(left, projections.flat()).has(right));
    const normalized = relations.every((columns, i) => {
      const superkey = (left: string[]) => columns.every(column => closure(left, projections[i]).has(column));
      const candidateKeys = subsets(columns).filter(left => superkey(left) && left.every(
        omit => !superkey(left.filter(column => column !== omit))));
      return projections[i].every(({ left, right }) =>
        superkey(left) || candidateKeys.some(key => key.includes(right)));
    });
    return new Set(relations.flat()).size === 8 && hasKey && preserves && normalized;
  });
}

function clinic(body: GeneratedBody, prompt: string, options: string[]) {
  const schema = diagram(body.prompt[1]);
  assert.match(schema, /診療科コード（主キーの項目）.*医師番号（主キーの項目）.*診療科コード（外部キーの項目）.*患者番号（主キーの項目）/);
  assert.match(prompt, /実線は主キーを，破線は外部キー/);
  const fields = ['診察日時'];
  if (!/医師を指名する前/.test(prompt)) fields.push('医師番号');
  if (!/患者を(予約に結び付ける前|まだ登録しない)/.test(prompt)) fields.push('患者番号');
  if (/所属診療科とは異なる|患者が選んだ診療科/.test(prompt)) fields.push('診療科コード');
  return options.map(option => {
    const declared = option.replace(/。$/, '').split('｜');
    assert.ok(declared.every(field => field === '診察日時（主キーの項目）' || /（主キーと外部キーの項目）$/.test(field)));
    return declared.map(field => field.split('（')[0]).sort().join('|') === fields.slice().sort().join('|');
  });
}

function sql(body: GeneratedBody, prompt: string, options: string[]) {
  const wanted = /職務が(.+?)である社員が(\d+)人未満/.exec(prompt);
  assert.ok(wanted);
  assert.match(prompt, /各列にはナル値は含まれない/);
  assert.match(content(body.prompt), /社員（社員番号，社員名，部署コード，職務）/);
  const [, role, limitText] = wanted;
  const limit = Number(limitText);
  const counts = [
    ['zero', 0, limit + 1], ['mixed', limit - 1, 2], ['edge', limit, 1], ['over', limit + 1, 0], ['low', 1, 0],
  ] as const;
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE 社員 (社員番号 INTEGER PRIMARY KEY, 社員名 TEXT NOT NULL, 部署コード TEXT NOT NULL, 職務 TEXT NOT NULL)');
    const insert = db.prepare('INSERT INTO 社員 VALUES (?, ?, ?, ?)');
    let id = 0;
    for (const [dept, actual, others] of counts) {
      for (let n = 0; n < actual + others; n++) insert.run(++id, '社員' + id, dept, n < actual ? role : '別の担当');
    }
    const expected = counts.filter(([, actual]) => actual < limit).map(([dept]) => dept).sort().join('|');
    const results = options.map(option => db.prepare(option).all().map(row => row.部署コード).sort().join('|'));
    assert.equal(new Set(results).size, 4);
    return results.map(actual => actual === expected);
  } finally {
    db.close();
  }
}

function lock(body: GeneratedBody, options: string[]) {
  const table = tableBlock(body.prompt[1]);
  assert.deepEqual(table.columns, ['ジョブ＼資源', 'A', 'B', 'C']);
  const holds = new Map(table.rows.map(([job, ...resources]) => [job, resources]));
  return options.map(option => {
    const order = /^ジョブ([123])の後にジョブ([123])を起動したとき，ジョブ\2の資源待ちはない。$/.exec(option);
    assert.ok(order);
    const incompatibilities = new Set(['SX', 'XS', 'XX']);
    const occupied = holds.get(order[1])!;
    return !holds.get(order[2])!.some((requested, i) => incompatibilities.has(occupied[i] + requested));
  });
}

function biometric(prompt: string, options: string[]) {
  assert.ok(options.every(option => /FRR.*FAR/.test(option)));
  if (/変化させるとき/.test(prompt)) {
    assert.match(prompt, /FRR（本人拒否率）.*FAR（他人受入率）/);
    // A lower reject rate means a less strict score threshold; it admits more scores from either population.
    assert.match(options[0], /独立/);
    assert.match(options[1], /FRRを減少.*FARは減少/);
    assert.match(options[3], /FRRを増大.*FARは増大/);
    return options.map(option => /FRRを減少させると，FARは増大/.test(option));
  }
  const expected = /判定は変わらなかった/.test(prompt) ? ['変わらず', '減少'] :
    /以前は通過していた/.test(prompt) ? ['増大', '減少'] : ['減少', '増大'];
  return options.map(option => {
    const changes = [...option.matchAll(/増大|減少|変わらず|変わらない/g)].map(([value]) => value);
    if (/ともに|も増大|も減少/.test(option) && changes.length === 1) changes.push(changes[0]);
    assert.equal(changes.length, 2);
    return changes.join() === expected.join();
  });
}

function threat(body: GeneratedBody) {
  const reviewed = [
    [/誤操作/, /地震|火災/, /伝送中/, /改ざん/],
    [/削除前.*バックアップ/, /離れた地域.*復旧/, /通信の暗号化/, /ディジタル署名/],
  ];
  return body.choices.map(([block], i) => {
    const candidate = tableBlock(block);
    assert.deepEqual(candidate.columns, ['脅威', 'セキュリティ対策']);
    assert.equal(candidate.rows.length, 1);
    assert.equal(candidate.rows[0].length, 2);
    const [risk, control] = candidate.rows[0];
    assert.match(risk, reviewed[0][i]);
    assert.match(control, [
      /ディスク|バックアップ|同期レプリケーション/, /二重化|複製|復旧用データ/,
      /CRC|ハッシュ値|暗号化/, /ディジタル署名|圧縮|ポート番号|無署名/,
    ][i]);
    return reviewed[1][i].test(control);
  });
}

function sales(body: GeneratedBody, prompt: string, options: string[]) {
  const description = diagram(body.prompt[1]);
  assert.match(description, /取引実績金額で右ほど多い.*年間購買推定金額で上ほど多い/);
  const regions = new Map([...description.matchAll(/([A-D])は(左上|右上|左下|右下)/g)].map(([, area, xy]) => [area, xy]));
  assert.equal(regions.size, 4);
  const required = /ともに大きい/.test(prompt) ? '右上' : /実績も推定購買規模も小さい/.test(prompt) ? '左下' :
    /推定購買規模が小さい/.test(prompt) ? '右下' : '左上';
  if (required === '左上') {
    [/大口顧客.*営業を強化/, /固定客.*最小限/, /固定客.*営業を強化/, /一層の取引増加/]
      .forEach((meaning, i) => assert.match(options[i], meaning));
  }
  return options.map(option => regions.get(/領域([A-D])/.exec(option)![1]) === required);
}

function profit(body: GeneratedBody, prompt: string, options: string[]) {
  const [sales, fixed, variable, prev] = tableBlock(body.prompt[1]).rows.filter(([, value]) => value).map(([, value]) => number(value));
  const price = Number(/販売単価が(\d+)千円/.exec(prompt)?.[1]);
  assert.match(prompt, /2倍以上にするには少なくとも/);
  assert.equal(sales - fixed - variable, prev);
  const quantity = sales / price;
  const unitCost = variable / quantity;
  assert.ok(Number.isInteger(unitCost));
  return options.map(number).map((value, i, all) => {
    if (i > 0) assert.ok(value - all[i - 1] >= 100);
    const earned = (units: number) => units * price - fixed - units * unitCost;
    return earned(value) >= 2 * prev && earned(value - 1) < 2 * prev;
  });
}

function route(body: GeneratedBody, options: string[]) {
  const edges = [...diagram(body.prompt[1]).matchAll(/(\d)→(\d)：(?:作業([A-G])，(\d+)日|ダミー作業（0日）)/g)]
    .map(([, from, to, , days]) => ({ from: Number(from), to: Number(to), days: Number(days ?? 0) }));
  assert.equal(edges.length, 9);
  assert.equal(edges.filter(({ days }) => days === 0).length, 2);
  const search = (from: number): number[] => from === 7 ? [0] :
    edges.filter(edge => edge.from === from).flatMap(edge => search(edge.to).map(days => days + edge.days));
  const durations = search(1);
  assert.equal(durations.length, 5);
  return options.map(number).map(days => durations.includes(days) && durations.every(length => days >= length));
}

function quality(prompt: string, options: string[], body: GeneratedBody) {
  const counts = new Map([...prompt.matchAll(/要因([P-T])が(\d+)件/g)].map(([, label, count]) => [label, Number(count)]));
  return options.map((option, i) => {
    const block = body.choices[i][0];
    assert.equal(block.type, 'diagram');
    assert.equal(block.scene.kind, 'source_figure');
    const { profile, values } = block.scene;
    const renderer = renderers.find(entry => entry.profile === profile)!;
    const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
    const bars = [...html.matchAll(/<rect[^>]+height="([0-9.]+)"/g)].map(match => Number(match[1]));
    const vertices = /<polyline points="([^"]+)"/.exec(html)![1].split(' ').map(pair => Number(pair.split(',')[1]));
    assert.equal(bars.length, 5);
    assert.ok(bars.every(height => height > 0));
    const nonincreasing = bars.slice(1).every((value, position) => value <= bars[position]);
    const increasing = vertices.slice(1).every((value, position) => value < vertices[position]);
    if (counts.size === 0) return nonincreasing && increasing;
    const labels = [...option.matchAll(/(?:順：|，)([P-T])(?=，|。)/g)].map(([, label]) => label);
    const amounts = labels.map(label => counts.get(label)!);
    const total = amounts.reduce((sum, n) => sum + n, 0);
    assert.equal(new Set(labels).size, 5);
    assert.ok(bars.every((height, j) => Math.abs(height - 100 * amounts[j] / total) < 1e-8));
    return nonincreasing && increasing && vertices.length === 6 && vertices.every((y, j) =>
      Math.abs((vertices[0] - y) * total - 100 * amounts.slice(0, j).reduce((sum, n) => sum + n, 0)) < 1e-8);
  });
}

function stock(body: GeneratedBody, options: string[]) {
  const rows = tableBlock(body.prompt[1]).rows;
  assert.deepEqual(rows.map(([asset]) => asset), options);
  const worstByStock = new Map(rows.map(([asset, ...values]) => [asset, values.map(number).sort((a, b) => a - b)[0]]));
  return options.map(asset => [...worstByStock].every(([other, worst]) => asset === other || worstByStock.get(asset)! > worst));
}

function machines(body: GeneratedBody, options: string[]) {
  const products = new Map(tableBlock(body.prompt[1]).rows.map(([item, m1, m2]) => [item, [number(m1), number(m2)]]));
  const elapsed = (order: string[]) => {
    const completedOnM1: string[] = [];
    let inM1 = 0, inM2 = 0, first = 0, second = 0, time = 0;
    while (second < 3) {
      if (first < 3 && inM1 === 0) inM1 = products.get(order[first])![0];
      if (inM2 === 0 && completedOnM1.length > 0) inM2 = products.get(completedOnM1.shift()!)![1];
      if (inM1 > 0 && --inM1 === 0) completedOnM1.push(order[first++]);
      if (inM2 > 0 && --inM2 === 0) second++;
      time++;
      assert.ok(time < 100);
    }
    return time;
  };
  const allTimes = [...'ABC'].flatMap(first => [...'ABC'].filter(next => next !== first)
    .map(next => elapsed([first, next, [...'ABC'].find(last => last !== first && last !== next)!])));
  assert.equal(allTimes.filter(time => time === Math.min(...allTimes)).length, 1);
  return options.map(option => elapsed(option.split('→')) === Math.min(...allTimes));
}

function independentlySolve(q: number, body: GeneratedBody, index: number) {
  const prompt = content(body.prompt.slice(0, 1));
  const options = body.choices.map(content);
  if (q === 56) return normalization(body, options);
  if (q === 57) return clinic(body, prompt, options);
  if (q === 58) return sql(body, prompt, options);
  if (q === 59) return lock(body, options);
  if (q === 64) return biometric(prompt, options);
  if (q === 66) return threat(body);
  if (q === 71) return sales(body, prompt, options);
  if (q === 73) return profit(body, prompt, options);
  if (q === 75) return route(body, options);
  if (q === 76) return quality(prompt, options, body);
  if (q === 77) return stock(body, options);
  if (q === 78) return machines(body, options);
  const record = knowledge[q]?.[index];
  assert.ok(record, '査読の欠落 問' + q);
  assert.match(prompt, record.context);
  options.forEach((option, position) => assert.match(option, record.options[position]));
  return options.map(option => record.correct.test(option));
}

for (const definition of definitions) {
  const q = Number(definition.source.split('-').at(-1));
  test('2008年春期旧午前問' + q + 'の各条件・全候補を独立に判定', () => {
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.sourceAnswer, official[q - 54]);
    for (const bad of [[], [-1], [4], [1.5], [0, 1]]) assert.throws(() => definition.build(bad));
    const bodies = cases.map(index => definition.build([index]));
    assert.equal('アイウエ'[bodies[0].correctIndex!], official[q - 54]);
    const prompts = new Set<string>(), answers = new Set<string>();
    bodies.forEach((body, index) => {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(content)).size, 4);
      assert.ok(body.explanation.length >= 40);
      assert.deepEqual(body.prompt.map(block => block.type), bodies[0].prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(choice => choice.map(block => block.type)), bodies[0].choices.map(choice => choice.map(block => block.type)));
      const truth = independentlySolve(q, body, index);
      assert.equal(truth.filter(Boolean).length, 1);
      assert.deepEqual(truth, body.choices.map((_, position) => position === body.correctIndex));
      prompts.add(content(body.prompt));
      answers.add(content(body.choices[body.correctIndex!]));
    });
    assert.equal(prompts.size, 4);
    assert.ok(answers.size > 1);
  });
}

test('2008年春期旧午前問54〜80の配布対象・全13図と描画の一対一対応', () => {
  assert.deepEqual(definitions.map(definition => Number(definition.source.split('-').at(-1))),
    Array.from({ length: 27 }, (_, i) => 54 + i).filter(n => ![67, 69, 70].includes(n)));
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  assert.equal(new Set(figures.map(figure => figure.profile)).size, 13);
  for (const figure of figures) {
    const renderer = renderers.find(candidate => candidate.profile === figure.profile)!;
    for (const index of cases) {
      figure.validate([index]);
      const html = renderToStaticMarkup(createElement(renderer.component, { values: [index], caption: '表示検証' }));
      assert.match(html, /tabindex="0".*左右にスクロール/);
      assert.ok(html.includes('data-figure-profile="' + figure.profile + '"'));
      if (figure.profile.includes('-57-')) {
        assert.ok(html.includes('aria-description="' + figure.alt([index]) + '"'));
        assert.ok(html.includes('<u>') && html.includes('</u>'));
        if (/-relation-/.test(figure.profile)) assert.match(html, /border-bottom:1px dashed currentColor/);
      } else {
        assert.match(html, /role="img".*<title/);
        assert.ok(html.includes(figure.alt([index]) + '</desc>'));
      }
    }
    assert.throws(() => figure.validate([4]));
  }
});
