import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2005-spring-am-54-80';
import { spring2005Am5480Source as source } from '../../../src/core/generators/legacy-2005-spring-am-54-80-source';

const numbers = Array.from({ length: 27 }, (_, index) => index + 54).filter(number => ![64, 68, 72].includes(number));
const inputs = [0, 1, 2, 3];
const names = 'アイウエ';
const def = (number: number) => definitions.find(definition => definition.source === '2005h17h-fe-am-' + number)!;
const body = (number: number, condition: number) => def(number).build([condition]);
const texts = (blocks: Block[]) => blocks.flatMap(block => block.type === 'paragraph' || block.type === 'code' ? [block.text] : []).join('\n');

function one(body: GeneratedBody, matches: boolean[], context: string) {
  assert.deepEqual(matches.flatMap((match, index) => match ? [index] : []), [body.correctIndex], context);
}

function patternIndex(text: string, rules: readonly RegExp[]) {
  const found = rules.flatMap((rule, index) => rule.test(text) ? [index] : []);
  assert.equal(found.length, 1, text);
  return found[0];
}

function matching(number: number, statements: readonly RegExp[], alternatives: readonly RegExp[]) {
  for (const condition of inputs) {
    const question = body(number, condition);
    const prompt = texts(question.prompt);
    const expected = patternIndex(prompt, statements);
    const roles = question.choices.map(choice => patternIndex(texts(choice), alternatives));
    assert.equal(new Set(roles).size, 4);
    one(question, roles.map(role => role === expected), '問' + number + ' ' + prompt);
  }
}

test('公式解答表と原題の問54〜80の収録境界、原文、選択肢順、4条件', () => {
  const official = 'イイウアイウウ' + 'イアイイアイイエアアアイウエアウイウエウ';
  assert.equal(official.length, 27);
  assert.deepEqual(definitions.map(definition => Number(definition.source.split('-').at(-1))), numbers);
  for (const n of numbers) {
    const definition = def(n);
    assert.equal(definition.sourceAnswer, official[n - 54]);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(({ minimum, maximum }) => [minimum, maximum]), [[0, 3]]);
    const variants = inputs.map(index => definition.build([index]));
    assert.equal(variants[0].prompt[0].type, 'paragraph');
    assert.equal(texts([variants[0].prompt[0]]), source[n].prompt);
    assert.deepEqual(variants[0].choices.map(texts), source[n].choices);
    assert.equal(names[variants[0].correctIndex!], official[n - 54]);
    assert.equal(new Set(variants.map(question => JSON.stringify(question.prompt))).size, 4, definition.source);
    for (const variant of variants) {
      assert.equal(variant.choices.length, 4);
      assert.equal(new Set(variant.choices.map(texts)).size, 4);
      assert(variant.explanation.length > 30);
    }
    for (const invalid of [[], [0, 2], [0.2], [-1], [4], [NaN], Array(1)]) {
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
});

test('問54〜56のADSLの装置、LANのアクセス制御、OSIの各層の役割を全肢照合', () => {
  matching(54, [/モデム/, /スプリッタ/, /DSLAM/, /FEC/],
    [/構内配線とルータ|信号と宅内のデータ/, /高周波.*低周波/, /電話局内/, /発生した誤りの訂正/]);
  matching(55, [/トークンバス/, /CSMA\/CD/, /トークンリング/, /時分割多元接続/],
    [/論理(?:的な順位|上の順序)/, /衝突.*ランダム/, /環状.*特殊/, /タイムスロット/]);
  matching(56, [/応用層/, /データリンク層/, /物理層/, /ネットワーク層/],
    [/^ゲートウェイ$/, /^ブリッジ$/, /^リピータ$/, /^ルータ$/]);
});

test('問57で標準の経路表はあて先IPを使い、MACと発信元を照合しない', () => {
  for (const [i, premise] of [/経路決定/, /支店.*本社/, /デフォルト経路/, /より具体的な経路/].entries()) {
    const question = body(57, i);
    assert.match(texts(question.prompt), premise);
    const parsed = question.choices.map(choice => /^((?:あて先|発信元))(IP|MAC)アドレス$/u.exec(texts(choice))?.slice(1));
    assert.deepEqual(new Set(parsed.map(item => item?.join(' '))).size, 4);
    one(question, parsed.map(item => item?.[0] === 'あて先' && item[1] === 'IP'), 'RFC 1812 §5.2.4');
  }
});

test('問58・59、61・63のデータ定義、操作、カーソル及び担当者の全肢を定義と照合', () => {
  matching(58, [/ビュー/, /スキーマ/, /データ操作/, /整合性制約/],
    [/仮想的な表/, /データ定義の集合/, /データベース操作の総称/, /各種制約条件|満たすべき条件/]);
  matching(59, [/導出関係/, /スキーマ/, /ドメイン/, /データ操作/],
    [/関係演算で|関係演算を使用/, /現実世界/, /値の集合/, /挿入.*更新/]);
  matching(61, [/閉じるSQL文/, /導出表を定義/, /次の1行/, /カーソルを開き/],
    [/^CLOSE$/, /^DECLARE CURSOR$/, /^FETCH$/, /^OPEN$/]);
  matching(63, [/発注部門/, /データベース管理者/, /開発プロジェクトの責任者/, /アプリケーションを開発する担当者/],
    [/受入検査/, /運用の監視.*障害からの回復/, /開発要員.*資源の最適配置/, /ヒアリング.*外部スキーマ/]);
});

test('問60の4種類の試験条件で、提示した全SQLをSQLiteで実行して一方だけを抽出', () => {
  for (const index of inputs) {
    const question = body(60, index);
    const prompt = texts(question.prompt);
    assert.match(prompt, /1教科.*以上.*残りの1教科.*未満/su);
    assert.equal(prompt.split('\n').filter(line => /^[AB]　.*以上$/u.test(line)).length, 2);
    const relation = /“(得点|成績|評価|結果)”/u.exec(prompt)![1];
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE ' + relation + ' (生徒氏名 TEXT, A INTEGER, B INTEGER)');
      const insert = db.prepare('INSERT INTO ' + relation + ' VALUES (?,?,?)');
      for (let a = 0; a <= 1; a++) for (let b = 0; b <= 1; b++) insert.run('' + a + b, a, b);
      const truth = question.choices.map(choice => {
        assert(choice.length === 1 && choice[0].type === 'code' && choice[0].language === 'sql');
        assert.match(choice[0].text, /\n {4}WHERE/u);
        const rows = db.prepare(choice[0].text).all().map(row => row.生徒氏名).sort();
        return rows.join(',') === '01,10';
      });
      one(question, truth, prompt);
    } finally { db.close(); }
  }
});

test('問62は復旧の起点と操作の向きを区別する', () => {
  const original = body(62, 0);
  const alternatives = original.choices.map(texts);
  assert.match(alternatives[0], /ウォーム.*チェックポイント.*更新情報/u);
  assert.match(alternatives[1], /正常終了.*反映.*ロールバック/u);
  assert.match(alternatives[2], /コールド.*チェックポイント.*ログ/u);
  assert.match(alternatives[3], /終了していない.*戻す.*ロールフォワード/u);
  one(original, [true, false, false, false], '現用ファイルからの回復とログundo・redoを別に判定');
  for (const condition of [1, 2, 3]) {
    const question = body(62, condition);
    const restoreMethods = [/ウォームスタート/, /ロールバック/, /コールドスタート/, /ロールフォワード/];
    const target = patternIndex(texts(question.prompt), restoreMethods);
    const recovered = question.choices.map(choice => patternIndex(texts(choice), [
      /現行のデータベース.*チェックポイント/, /完了しなかった.*変更前情報/, /バックアップを復元/, /確定済み.*変更後情報/,
    ]));
    assert.equal(new Set(recovered).size, 4);
    one(question, recovered.map(method => method === target), 'ロールバックは取消し、フォワードは再適用、コールドはバックアップ');
  }
});

test('問65〜66の署名主体、認証局、検出用と復元用ファイルを全肢照合', () => {
  for (const condition of inputs) {
    const question = body(65, condition);
    assert.match(texts(question.prompt), /独立した第三者機関|独立した認証局/u);
    const cases = [/公開かぎに対する電子証明書/, /ディジタル署名/, /パスワード/, /秘密かぎに対する電子証明書/];
    const roles = question.choices.map(choice => patternIndex(texts(choice), cases));
    assert.equal(new Set(roles).size, 4);
    one(question, roles.map(role => role === 0), '認証局は主体と公開鍵を結び付ける。');
  }
  matching(66, [/修復用データ/, /ウイルス定義ファイル/, /検体ファイル/, /復元用のバックアップ/],
    [/修復するため|元に戻す処理/, /シグネチャコード/, /動作を監視|挙動を分析/, /復旧のため|破壊前のデータを復元/]);
});

const permissionOrder = ['読取り', '更新', '作成'];
const permissions = (text: string) => permissionOrder.filter(name => text.includes(name));

test('問67の許可割当てを試行結果から再構成し、可能な割当に対して全4肢を照合', () => {
  for (const index of inputs) {
    const question = body(67, index);
    const prompt = texts(question.prompt);
    assert.match(prompt, /1ビット.*8進数表現0～7/u);
    assert.match(prompt, /0を設定したら.*一切のアクセスができなく/u);
    assert.match(prompt, /7を設定したら.*すべてのアクセスができ/u);
    const [, rawMask, on, off] = /②　([0-7])を設定したら，(.+?)はできたが，(.+?)ができなかった。/u.exec(prompt)!;
    const expectedNames = permissions(on);
    assert.equal(expectedNames.length, 2);
    assert.equal(permissions(off).length, 1);
    const maps: Record<string, number>[] = [];
    for (const x of [1, 2, 4]) for (const y of [1, 2, 4]) {
      if (x === y) continue;
      const z = 7 - x - y;
      const flags = { 読取り: x, 更新: y, 作成: z };
      if (permissionOrder.filter(name => (flags[name as keyof typeof flags] & Number(rawMask)) !== 0).join() === expectedNames.join())
        maps.push(flags);
    }
    assert.equal(maps.length, 2);
    const choiceMasks: number[] = [];
    const truth = question.choices.map(choice => {
      const [, raw, allowed] = /^([0-7])を設定すると，(.+)ができる。$/u.exec(texts(choice))!;
      choiceMasks.push(Number(raw));
      return maps.every(flags => permissionOrder.filter(name => (flags[name] & Number(raw)) !== 0).join() === permissions(allowed).join());
    });
    assert.deepEqual(choiceMasks.slice().sort((a, b) => a - b), choiceMasks);
    one(question, truth, prompt);
  }
});

test('問69、70の意思決定条件、取得者の責務と運用・是正・監査を全肢照合', () => {
  const verdicts = [
    [/損失額と発生確率を予測/, /繰り返し.*避けるべき/, /蓄積されたデータを参照することは避ける/, /損失額に応じて対策の費用/],
    [/最大損失が同じなら.*同じ/, /前提が変わった時点で.*調べ直し/, /蓄積されたデータを参照することは避ける/, /損失額に応じて対策の費用/],
    [/最大損失が同じなら.*同じ/, /繰り返し.*避けるべき/, /記録を参照し.*差を確認/, /損失額に応じて対策の費用/],
    [/最大損失が同じなら.*同じ/, /繰り返し.*避けるべき/, /蓄積されたデータを参照することは避ける/, /対策後に残るリスクと対策費用/],
  ];
  for (const index of inputs) {
    const r = body(69, index);
    r.choices.forEach((choice, role) => assert.match(texts(choice), verdicts[index][role]));
    one(r, r.choices.map((_, role) => role === index), '条件ごとの比較、再分析、履歴、残余リスク');
    const purchaser = body(70, index);
    assert.match(texts(purchaser.prompt), /JIS X 0160.*購入者/su);
    const roles = purchaser.choices.map(choice => patternIndex(texts(choice), [/受入/, /システムの運用/, /製品不具合の是正/, /内部品質監査/]));
    one(purchaser, roles.map(role => role === 0), '取得側の受入基準・手続');
  }
});

test('問71、73〜75、79の経営・原価・品質手法を対応する定義で全肢照合', () => {
  matching(71, [/CRM/, /リテールサポート/, /ERP/, /SCM/],
    [/顧客チャネル/, /小売店の経営活動を支援/, /企業全体の経営資源/, /サプライチェーン全体/]);
  matching(73, [/直接原価/, /原価企画/, /標準原価/, /活動基準/],
    [/変動費と固定費/, /目標販売価格/, /実際原価との差異/, /活動単位に集計/]);
  matching(74, [/PDPC/, /連関図/, /親和図/, /系統図/],
    [/望ましい結果に至る/, /因果関係/, /グループ化/, /手段・方策を順次展開/]);
  matching(75, [/特性要因図/, /管理図/, /ヒストグラム/, /パレート図/],
    [/魚の骨/, /管理限界線/, /各区間に属する/, /累積値/]);
  matching(79, [/SFA/, /ERP/, /リテールサポート/, /EC（/],
    [/営業活動にIT/, /経営資源全体/, /小売店の経営活動を支援/, /電子的なネットワーク/]);
});

test('問76のPERT、待ち行列、時系列、線形計画の適用と不適用を照合', () => {
  for (const condition of inputs) {
    const question = body(76, condition);
    const expected = [/先行関係.*工程期限.*PERT/, /窓口.*待つ人数.*待ち行列/, /製品の売上を予測.*時系列/, /線形制約.*利益.*シンプレックス/];
    const rejected = [/信頼性分析.*PERT/, /財務分析.*待ち行列/, /時間記録がなくても.*時系列/, /品質管理.*シンプレックス/];
    const roles = question.choices.map((choice, index) => {
      const stated = texts(choice);
      assert(expected[index].test(stated) !== rejected[index].test(stated), stated);
      return expected[index].test(stated);
    });
    one(question, roles, '手法の適用条件');
  }
});

test('問77の製品順を全36組の機械別順序で検算し、原表の対角見出しと全肢を保持', () => {
  const permutations = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'];
  for (const index of inputs) {
    const question = body(77, index);
    const picture = question.prompt.find(block => block.type === 'table')!;
    assert(picture.type === 'table');
    assert.deepEqual(picture.columns, ['製品＼機械', 'M1', 'M2']);
    assert.match(texts(question.prompt), /M1→M2の順.*準備時間は無視/su);
    const values = new Map(picture.rows.map(([product, first, second]) => [product, [Number(first), Number(second)]]));
    const endTime = (before: string, after: string) => {
      const released = new Map<string, number>();
      let release = 0;
      for (const product of before) { release += values.get(product)![0]; released.set(product, release); }
      let time = 0;
      const todo = [...after];
      let active = 0;
      while (active || todo.length > 0) {
        const next = todo[0];
        if (!active && next && released.get(next)! <= time)
          active = values.get(todo.shift()!)![1];
        time++;
        if (active) active--;
      }
      return time;
    };
    const completion = permutations.flatMap(first => permutations.map(second => [first, second, endTime(first, second)] as const));
    const minimum = Math.min(...completion.map(([, , end]) => end));
    const optimal = completion.filter(([, , end]) => end === minimum);
    assert.equal(optimal.length, 1);
    assert.equal(optimal[0][0], optimal[0][1]);
    one(question, question.choices.map(choice => texts(choice).replaceAll('→', '') === optimal[0][0]), '最短となる順序');
  }
});

test('問78の利益を実際に表示した製造上限で整数全探索し、全選択肢を照合', () => {
  const none = /Kの1日の最大製造能力は([0-9]+)個であり，Lの1日の最大製造能力は([0-9]+)個/u;
  for (const index of inputs) {
    const question = body(78, index);
    const [, ownK, ownL] = none.exec(texts(question.prompt))!;
    const table = question.prompt.find(block => block.type === 'table')!;
    assert(table.type === 'table');
    const [m, n] = table.rows.map(row => row.slice(1).map(Number));
    const profits: number[] = [];
    for (let x = 0; x <= Number(ownK) / m[0]; x++)
      for (let y = 0; y <= Number(ownL) / n[1]; y++)
        if (x * m[0] + y * n[0] <= Number(ownK) && x * m[1] + y * n[1] <= Number(ownL))
          profits.push(x * m[2] + y * n[2]);
    const maximum = Math.max(...profits);
    assert.equal(profits.filter(profit => profit === maximum).length, 1);
    const amounts = question.choices.map(choice => Number(texts(choice).replaceAll(',', '')));
    assert.deepEqual(amounts, amounts.slice().sort((a, b) => a - b));
    one(question, amounts.map(amount => amount === maximum), '材料KとLの両方の制約下で最大');
  }
});

test('問80は2005年4月の適用条文に照らし複製、公衆送信、本人の家庭内使用を全肢照合', () => {
  for (const index of inputs) {
    const question = body(80, index);
    const options = question.choices.map(texts);
    assert.match(options[0], /複製.*(?:適用されない|外れる|必要がない)/u);
    assert.match(options[1], /複製に(?:は)?(?:当たらない|該当しない|当たり得ない)/u);
    const privateCopy = /(?:自宅|家庭の中).*私的使用に(?:なる|当たる)/u.test(options[2]);
    const publication = /誰でも閲覧できるようにすると.*送信可能化に当たる。$/u.test(options[3]);
    assert.notEqual(privateCopy, publication);
    if (!privateCopy) assert.match(options[2], /家庭の外の不特定.*私的使用/u);
    if (!publication) assert.match(options[3], /参照されていなければ|閲覧されていなければ|アクセス記録がなければ/u);
    one(question, [false, false, privateCopy, publication], '平成16年法律92号改正までの21条・23条・30条');
  }
});
