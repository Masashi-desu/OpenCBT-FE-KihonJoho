import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2014AutumnAm27To53Definitions as definitions } from '../src/core/generators/legacy-2014-autumn-am-27-53';
import { legacy2014AutumnAm27To53Source as original } from '../src/core/generators/legacy-2014-autumn-am-27-53-source';
import { legacy2014AutumnAm27To53Figures as figures } from '../src/core/generators/legacy-2014-autumn-am-27-53-figures';
import { legacy2014AutumnAm27To53Renderers as renderers } from '../src/ui/Legacy2014AutumnAm2753Figures';

const keys = 'アイウエ';
const ipaAnswerKeys = 'エウアアアウアエウイウエウウアイウエアウアイエエアウウ';
const questionText = (body: GeneratedBody) => body.prompt.flatMap(b => b.type === 'paragraph' ? [b.text] : []).join('\n');
const choices = (body: GeneratedBody) => body.choices.map(([block]) => {
  assert(block.type === 'paragraph');
  return block.text;
});
function forQuestion(number: number, verify: (body: GeneratedBody, input: number) => void) {
  const def = definitions.find(d => d.source === '2014h26a-fe-am-' + number);
  assert(def);
  for (let input = def.fields[0].minimum; input <= def.fields[0].maximum; input++) verify(def.build([input]), input);
}
function correctWhen(body: GeneratedBody, predicate: (value: string) => boolean) {
  const matching = choices(body).flatMap((value, i) => predicate(value) ? [i] : []);
  assert.deepEqual(matching, [body.correctIndex], questionText(body));
}
function classify<T>(text: string, predicates: readonly (readonly [RegExp, T])[]): T {
  const results = predicates.filter(([pattern]) => pattern.test(text));
  assert.equal(results.length, 1, text);
  return results[0][1];
}

// Independently reviewed descriptions and name-to-operation pairings. No generated
// scenario rows or answer indexes are imported into these checks.
function verifyPairings(
  number: number, promptCategories: readonly (readonly [RegExp, string])[],
  optionCategories: readonly (readonly [RegExp, string])[],
) {
  forQuestion(number, body => {
    const stem = questionText(body);
    const target = classify(stem, promptCategories);
    const labels = choices(body).map(option => classify(option, optionCategories));
    assert.equal(new Set(labels).size, 4, stem);
    correctWhen(body, option => classify(option, optionCategories) === target);
  });
}

test('公式解答、原の本文と四択、全有限入力の変更点を検査する', () => {
  assert.deepEqual(definitions.map(d => d.source), Array.from({ length: 27 }, (_, i) => '2014h26a-fe-am-' + (27 + i)));
  assert.equal(definitions.map(d => d.sourceAnswer).join(''), ipaAnswerKeys);
  let count = 0;
  for (const [i, def] of definitions.entries()) {
    const source = original[i + 27], baseline = def.build(def.reference);
    assert.equal(keys[baseline.correctIndex!], ipaAnswerKeys[i]);
    assert.deepEqual(choices(baseline), source.choices, def.source);
    assert.equal(questionText(baseline), [source.prompt, ...source.extra].join('\n'), def.source);
    assert.equal(def.fields[0].minimum, 0);
    assert(def.fields[0].maximum >= 1);
    const seenPrompts = new Set<string>();
    const seenCorrectPositions = new Set<number>();
    forQuestion(i + 27, (body, input) => {
      count++;
      assert.deepEqual(body, def.build([input]), def.source);
      assert.equal(choices(body).length, 4, def.source);
      assert.equal(new Set(choices(body)).size, 4, def.source);
      assert(typeof body.correctIndex === 'number' && body.correctIndex >= 0 && body.correctIndex < 4, def.source);
      assert(body.explanation.length > 32, def.source);
      assert(!seenPrompts.has(JSON.stringify(body.prompt)), def.source);
      seenPrompts.add(JSON.stringify(body.prompt));
      seenCorrectPositions.add(body.correctIndex);
    });
    assert.equal(def.answerVariation === 'fixed', seenCorrectPositions.size === 1, def.source);
    for (const invalid of [[], [-1], [def.fields[0].maximum + 1], [NaN], [Infinity], [0.5], [0, 0]])
      assert.throws(() => def.build(invalid), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(count, 80);
});

test('問27〜30はインデックスの検索性、正規形、保守操作、ロックの全選択肢を照合する', () => {
  forQuestion(27, body => {
    const stem = questionText(body);
    assert.match(stem, /＜＞内/);
    assert.match(stem, /売上（伝票番号，売上年月日，商品名，利用者ID，店舗番号，売上金額）/);
    assert.deepEqual(choices(body).map(v => v.match(/＜(.+)＞$/)?.[1]), ['売上金額', '売上年月日', '商品名', '利用者ID']);
    const amounts = stem.match(/下限は([0-9,]+)円，上限は([0-9,]+)円/);
    const dates = stem.match(/開始日は(\d+月\d+日)，終了日は(\d+月\d+日)/);
    if (amounts || dates) {
      assert(amounts && dates);
      assert.match(stem, /両端を含む.*等値条件に書き換えて/);
      const parseAmount = (v: string) => Number(v.replaceAll(',', ''));
      const amountIsSingle = parseAmount(amounts[1]) === parseAmount(amounts[2]);
      const dateIsSingle = dates[1] === dates[2];
      assert.notEqual(amountIsSingle, dateIsSingle);
      assert.doesNotMatch(stem, /ちょうど|1日だけ/);
      correctWhen(body, value => classify(value, [
        [/下限から上限まで/, amountIsSingle], [/開始日から終了日まで/, dateIsSingle],
        [/で始まる/, false], [/以上.*以下/, false],
      ]));
    } else {
      correctWhen(body, value => classify(value, [
        [/で始まる/, false], [/以上|以下|が今月/, false], [/が‘1001’の/, true],
      ]));
    }
  });
  forQuestion(28, body => {
    const stem = questionText(body);
    assert.match(stem, /第3正規形まで正規化/);
    // Updating only one order row demonstrates the dependency violation.
    const data = [{ id: 1, determinedBy: 'a', dependent: 'x' }, { id: 2, determinedBy: 'a', dependent: 'y' }];
    const violatesDependency = data.some(a => data.some(b => a.determinedBy === b.determinedBy && a.dependent !== b.dependent));
    assert(violatesDependency);
    const decomposed = new Map([['a', 'y']]);
    assert.equal(new Set(data.map(row => decomposed.get(row.determinedBy))).size, 1);
    correctWhen(body, value => classify(value, [
      [/格納効率/, 'physical'], [/整合性制約を排除/, 'constraints'], [/更新時異状/, 'update'], [/ロック待ち/, 'concurrency'],
    ]) === 'update');
  });
  verifyPairings(29, [[/アクセス効率を低下させない/, 'layout'], [/開始前の状態へ戻す/, 'rollback']],
    [[/^再編成$/, 'layout'], [/^データベースダンプ$/, 'export'], [/^バックアップ$/, 'recovery-copy'], [/^ロールバック$/, 'rollback']]);
  forQuestion(30, body => {
    assert.match(questionText(body), /同時実行制御/);
    correctWhen(body, value => {
      const match = value.match(/(共有|専有)ロック獲得済の(資源|商品行|ファイル)に対して，別のトランザクションからの新たな(共有|専有)ロック/);
      assert(match, value);
      // A write conflicts with an existing reader or writer. Readers can share.
      return ![match[1], match[3]].includes('専有');
    });
  });
});

test('問31は最小待ち時間を受信と再生の境界で独立に求める', () => {
  forQuestion(31, body => {
    const values = questionText(body).match(/が(\d+)kビット／秒の音声データ([\d.]+)Mバイト.*が(\d+)kビット／秒/);
    assert(values);
    const play = Number(values[1]) * 1000, transfer = Number(values[3]) * 1000, size = Number(values[2]) * 8_000_000;
    const continuousAt = (start: number) => {
      const first = start, last = start + size / play, downloadEnd = size / transfer;
      const times = [first, last, downloadEnd].filter(t => t >= first && t <= last);
      return times.every(t => Math.min(size, t * transfer) - (t - first) * play >= 0);
    };
    let firstValid = 0;
    while (!continuousAt(firstValid)) firstValid++;
    assert(continuousAt(firstValid) && !continuousAt(firstValid - 1));
    const displayed = choices(body).map(Number);
    assert(displayed.every(Number.isSafeInteger));
    assert.deepEqual(displayed, [firstValid, size / play, size / transfer, size / play + size / transfer]);
    assert.deepEqual(displayed, [...displayed].sort((a, b) => a - b));
    correctWhen(body, v => Number(v) === firstValid);
  });
});

test('問32〜36はOSI層、プロトコルの働き、IPv4ホスト部、攻撃の機序を独立に分類する', () => {
  verifyPairings(32, [[/物理層/, 'l1'], [/ネットワーク層/, 'l3']],
    [[/スイッチングハブ/, 'l2-many'], [/^ブリッジ$/, 'l2-bridge'], [/^リピータ$/, 'l1'], [/^ルータ$/, 'l3']]);
  verifyPairings(33, [[/データ転送用と制御用/, 'file'], [/受信メールボックス/, 'mail-receive'], [/機器に問い合わせ/, 'manage']],
    [[/^FTP$/, 'file'], [/^POP3$/, 'mail-receive'], [/^SMTP$/, 'mail-send'], [/^SNMP$/, 'manage']]);
  forQuestion(34, body => {
    const stem = questionText(body);
    assert.match(stem, /割り振ってはいけない/);
    const addresses = stem.match(/(?:\d{1,3}\.){3}\d{1,3}/g);
    assert.equal(addresses?.length, 2);
    const integer = (ip: string) => ip.split('.').reduce((v, octet) => v * 256n + BigInt(octet), 0n);
    const network = integer(addresses![0]), mask = integer(addresses![1]);
    const hostMask = 0xffffffffn ^ mask;
    const displayed = choices(body).map(integer);
    assert(displayed.every((v, i) => i === 0 || displayed[i - 1] < v));
    assert(displayed.every(v => (v & mask) === network));
    correctWhen(body, v => {
      const host = integer(v) & hostMask;
      return host === 0n || host === hostMask;
    });
  });
  verifyPairings(35, [[/時刻を合わせ/, 'clock'], [/MACアドレスを求める/, 'resolve'], [/到達できないことを送信元に通知/, 'error']],
    [[/^ARP$/, 'resolve'], [/^ICMP$/, 'error'], [/^NTP$/, 'clock'], [/^RIP$/, 'route']]);
  verifyPairings(36, [[/^ソーシャルエンジニアリングに/, 'person'], [/^総当たり攻撃に/, 'bruteforce'], [/^バッファオーバフロー攻撃に/, 'overflow']],
    [[/バックドア/, 'door'], [/利用者に問い合わせ/, 'person'], [/総当たり攻撃ツール|パスワード候補を順に作り/, 'bruteforce'], [/バッファオーバフロー|格納領域を越えて/, 'overflow']]);
  forQuestion(36, (body, input) => {
    assert.match(questionText(body), /^(ソーシャルエンジニアリング|総当たり攻撃|バッファオーバフロー攻撃)に分類される手口はどれか。$/);
    if (input > 0) assert(choices(body).every(v => !/総当たり攻撃|バッファオーバフロー/.test(v)));
  });
});

test('問37〜43は鍵の保証、障害の範囲、優先順位、FW通信条件と各対策の作用を独立に照合する', () => {
  forQuestion(37, body => {
    const stem = questionText(body);
    assert.match(stem, /A氏|B商店/);
    const signs = /A氏だけが使用できる/.test(stem);
    assert.match(stem, signs ? /自分の秘密鍵を用いてディジタル署名/ : /B商店の公開鍵を用いて注文を暗号化/);
    correctWhen(body, v => classify(v, [
      [/第三者に漏れない/, 'privacy'], [/B商店に届く/, 'delivery'], [/A氏からの注文であること/, 'origin'], [/売ることが許可/, 'permission'],
    ]) === (signs ? 'origin' : 'privacy'));
  });
  verifyPairings(38, [[/情報漏えい/, 'privacy'], [/ハードディスク1台が故障/, 'same-site-redundancy'], [/保存拠点が災害/, 'remote']],
    [[/チェックサム/, 'integrity'], [/ミラーリング/, 'same-site-redundancy'], [/遠隔地/, 'remote'], [/暗号化/, 'privacy']]);
  forQuestion(39, body => {
    const stem = questionText(body);
    assert.match(stem, /リスクアセスメントに関する記述/);
    correctWhen(body, v => classify(v, [
      [/対応が完了する前/, 'delay'], [/過去のリスクアセスメント/, 'exclude'], [/発生確率の予測/, 'prioritize'], [/顕在化してから/, 'react-only'],
    ]) === 'prioritize');
  });
  forQuestion(40, body => {
    const stem = questionText(body);
    assert.match(stem, /1台のファイアウォール/);
    assert.match(stem, /外部セグメントとDMZ間及びDMZと内部ネットワーク間の通信は特定のプロトコルだけを許可/);
    assert.match(stem, /外部セグメントと内部ネットワーク間の通信は許可しない/);
    const isPublic = stem.includes('インターネットに公開');
    if (!isPublic) assert.match(stem, /内部ネットワークの利用者だけ.*ファイアウォールを経由せず/);
    const nodes = ['外部セグメント', 'DMZ', '内部ネットワーク'];
    const pairs = choices(body).map(v => {
      const locations = [...v.matchAll(/外部セグメント|DMZ|内部ネットワーク/g)].map(match => nodes.indexOf(match[0]));
      const [web, db = web] = locations;
      return [web, db] as const;
    });
    assert.deepEqual(pairs, [[1, 1], [2, 2], [1, 2], [0, 1]]);
    // An isolated internal-only placement may use no inter-segment links. For
    // a public deployment, retain only reachable Web and adjacent DB links, then
    // favor deeper DB isolation and a filtered edge for the Web service.
    const score = ([web, db]: readonly [number, number]) => isPublic
      ? web <= 1 && Math.abs(web - db) <= 1 ? db * 2 + web : -1
      : web === 2 && db === 2 ? 1 : -1;
    const best = Math.max(...pairs.map(score));
    correctWhen(body, v => score(pairs[choices(body).indexOf(v)]) === best);
  });
  verifyPairings(41, [[/WAF（/, 'web'], [/アンチウイルスソフト/, 'remove'], [/更新プログラム管理ツール/, 'patch']],
    [[/攻撃を遮断/, 'web'], [/自動駆除/, 'remove'], [/結合テスト時/, 'test'], [/パッチを適用/, 'patch']]);
  forQuestion(41, body => assert.doesNotMatch(questionText(body), /隔離|除去|自動駆除|修正プログラムを配布/));
  verifyPairings(42, [[/パターンマッチング方式/, 'signature'], [/挙動監視方式/, 'runtime'], [/チェックサム方式/, 'checksum']],
    [[/感染前のファイルと感染後のファイル/, 'original'], [/シグネチャと比較/, 'signature'], [/異常現象を監視|実行時に発生した異常/, 'runtime'], [/チェックサムと照合|ファイルから計算した検査値/, 'checksum']]);
  forQuestion(42, (body, input) => {
    assert.match(questionText(body), /^ウイルス対策ソフトの(パターンマッチング|挙動監視|チェックサム)方式を説明したものはどれか。$/);
    if (input > 0) assert(choices(body).every(v => !/挙動監視|チェックサム/.test(v)));
  });
  forQuestion(43, (body, input) => {
    const stem = questionText(body);
    assert.doesNotMatch(stem, /80番|443番|IPアドレス|パケットフィルタリング|暗号化/);
    const feature = classify(stem, [[/HTTPS（HTTP over SSL\/TLS）/, 'tls'], [/TCPヘッダの情報だけ/, 'tcp'], [/IPv4ヘッダの情報だけ/, 'ipv4']]);
    if (input > 0) assert.match(stem, /この機能を用いて実現できるもの/);
    if (feature === 'tcp') assert.match(stem, /既定のポート番号を使うHTTPとHTTPSだけ/);
    correctWhen(body, value => {
      if (/SQLインジェクション/.test(value)) return false;
      if (/通信を暗号化/.test(value)) return feature === 'tls';
      if (/ネットワーク層でのパケットフィルタリング/.test(value)) return feature === 'ipv4';
      const ports = value.match(/TCPポート(\d+)番と(\d+)番以外/);
      assert(ports, value);
      // http and https are assigned 80/tcp and 443/tcp. The boundary may
      // inspect these destination ports only when it can read the TCP header.
      return feature === 'tcp' && Number(ports[1]) === 80 && Number(ports[2]) === 443;
    });
  });
});

test('問44〜51、53の説明と対象の対応を全四択で照合する', () => {
  verifyPairings(44, [[/^ディレクトリトラバーサル/, 'path'], [/^SQLインジェクション/, 'sql'], [/^クロスサイトスクリプティング/, 'script'], [/^セッションハイジャック/, 'session']],
    [[/SQL文を実行/, 'sql'], [/ブラウザで悪意のあるスクリプト/, 'script'], [/セッションIDを不正に取得/, 'session'], [/意図していないファイル/, 'path']]);
  verifyPairings(45, [[/ポートスキャナ/, 'scan'], [/ログアナライザ/, 'logs'], [/アカウント管理の運用監査/, 'audit']],
    [[/サービスを列挙/, 'scan'], [/ポリシとの相違/, 'audit'], [/アクセス履歴を解析/, 'logs'], [/コンテンツを直接確認/, 'content']]);
  forQuestion(45, body => assert.doesNotMatch(questionText(body), /要求先|接続元|聞取り|アクセス履歴を解析|ポリシとの相違/));
  verifyPairings(46, [[/決定表を説明/, 'decision'], [/E-R図を説明/, 'er'], [/データフロー図（DFD）を説明/, 'dfd']],
    [[/エンティティを長方形/, 'er'], [/データストア間でのデータの流れ/, 'dfd'], [/条件の組合せ/, 'decision'], [/制御の流れ/, 'flow']]);
  verifyPairings(47, [[/多相性/, 'override'], [/情報隠蔽/, 'encapsulate']],
    [[/^オーバライド$/, 'override'], [/^カプセル化$/, 'encapsulate'], [/^多重継承$/, 'multiple'], [/^メッセージパッシング$/, 'messages']]);
  forQuestion(47, body => assert.doesNotMatch(questionText(body), /シグネチャ|再定義|公開した操作を通して/));
  forQuestion(48, body => {
    const stem = questionText(body);
    assert.match(stem, /ブラックボックステスト/);
    const result = (input: number) => input * 2;
    const redundant = (input: number) => { const discarded = result(input); assert.equal(discarded, result(input)); return result(input); };
    for (const n of [-3, 0, 7]) assert.equal(result(n), redundant(n));
    correctWhen(body, v => classify(v, [
      [/網羅率/, 'coverage'], [/冗長なコード/, 'observable'], [/内部構造に着目/, 'white-box'], [/モジュールの数/, 'paths'],
    ]) === 'observable');
  });
  verifyPairings(49, [[/影響を受けないはず/, 'regression'], [/モジュールを接続/, 'integration'], [/運用手順書に沿って/, 'operation']],
    [[/^運用テスト$/, 'operation'], [/^結合テスト$/, 'integration'], [/^システムテスト$/, 'system'], [/^リグレッションテスト$/, 'regression']]);
  verifyPairings(50, [[/^プログラムからUML/, 'reverse'], [/クラス図を基に/, 'forward'], [/保守しやすい構造をもつシステムへ作り直す/, 'reengineer']],
    [[/^バックトラッキング$/, 'backtracking'], [/^フォワードエンジニアリング$/, 'forward'], [/^リエンジニアリング$/, 'reengineer'], [/^リバースエンジニアリング$/, 'reverse']]);
  verifyPairings(51, [[/WBSで定義/, 'wbs'], [/スコープ記述書で定義/, 'scope'], [/マネジメント計画書で定義/, 'plan']],
    [[/階層的に要素分解/, 'wbs'], [/監視・コントロール/, 'plan'], [/除外事項及び制約条件/, 'scope'], [/完了するために必要な作業/, 'activity']]);
  forQuestion(51, body => assert.doesNotMatch(questionText(body), /進め方を統合|監視・コントロール|除外事項/));
  verifyPairings(53, [[/ファンクションポイント法/, 'function'], [/類推法/, 'analogy'], [/ボトムアップ見積り/, 'bottom-up']],
    [[/開発規模が分かっている/, 'parametric'], [/類似のシステム/, 'analogy'], [/複雑さとアプリケーションの特性/, 'function'], [/単位作業項目まで分解/, 'bottom-up']]);
});

test('問52は図の全14辺から選択肢外も含め全経路を独立に列挙し、最長を照合する', () => {
  const originalEdges = ['A:0:1:5', 'B:1:2:15', 'C:1:3:10', 'D:1:4:4', 'E:3:2:8', 'F:4:5:15',
    'G:2:6:12', 'H:2:7:7', 'I:3:8:24', 'J:5:9:13', 'K:7:8:10', 'L:6:8:7', 'M:9:10:5', 'N:8:10:3'];
  forQuestion(52, (body, input) => {
    const block = body.prompt.find(item => item.type === 'diagram');
    assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
    const { scene } = block;
    const figure = figures.find(item => item.profile === scene.profile);
    const renderer = renderers.find(item => item.profile === scene.profile);
    assert(figure && renderer);
    assert.deepEqual(scene.values, [input]);
    assert.equal(readBookletFigure(figure, scene.values), block.alt);
    const html = renderToStaticMarkup(createElement(renderer.component, { values: scene.values, caption: block.caption }));
    assert.equal([...html.matchAll(/data-event="/g)].length, 11);
    assert.match(html, /凡例/);
    assert.match(html, /所要日数/);
    const edges = [...html.matchAll(/data-activity="([A-N])" data-from="(\d+)" data-to="(\d+)" data-days="(\d+)"/g)]
      .map(([, name, from, to, days]) => ({ name, from: Number(from), to: Number(to), days: Number(days) }));
    assert.equal(edges.length, 14);
    if (input === 0) assert.deepEqual(edges.map(e => [e.name, e.from, e.to, e.days].join(':')), originalEdges);
    assert.deepEqual(edges.map(e => [e.name, e.from, e.to].join(':')), originalEdges.map(e => e.split(':').slice(0, 3).join(':')));
    for (const e of edges) {
      assert(block.alt.includes(`節点${e.from}から節点${e.to}へ作業${e.name}（${e.days}日）`));
      assert(html.includes(`>${e.name}</text>`));
    }

    // Enumerate every route from the rendered arrows. The implementation uses
    // memoized longest remaining time instead of listing the completed routes.
    const pathQueue = [{ node: 0, route: [] as string[], days: 0 }];
    const paths = [];
    while (pathQueue.length) {
      const at = pathQueue.shift()!;
      if (at.node === 10) paths.push(at);
      else {
        for (const edge of edges.filter(e => e.from === at.node))
          pathQueue.push({ node: edge.to, route: [...at.route, edge.name], days: at.days + edge.days });
      }
    }
    const byRoute = new Map(paths.map(path => [path.route.join('→'), path.days]));
    assert.equal(byRoute.size, 6);
    assert(byRoute.has('A→C→E→H→K→N'));
    assert(byRoute.has('A→D→F→J→M'));
    const duration = Math.max(...byRoute.values());
    assert.equal([...byRoute.values()].filter(days => days === duration).length, 1);
    assert.equal(duration, [45, 48, 50, 49][input]);
    assert(choices(body).every(value => byRoute.has(value)));
    correctWhen(body, value => byRoute.get(value) === duration);

    // Independent forward relaxation across the source graph also yields the
    // total, including a vertical arrow whose destination number is smaller.
    const earliest = new Map<number, number>([[0, 0]]);
    for (let pass = 0; pass < 10; pass++) {
      for (const edge of edges) {
        const start = earliest.get(edge.from);
        if (start !== undefined)
          earliest.set(edge.to, Math.max(earliest.get(edge.to) ?? -Infinity, start + edge.days));
      }
    }
    assert.equal(earliest.get(10), duration);
  });
});
