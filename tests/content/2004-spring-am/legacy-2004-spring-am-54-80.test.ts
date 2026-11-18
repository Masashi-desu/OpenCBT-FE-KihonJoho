import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import type { Block } from '../../../src/core/types';
import { legacy2004SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2004-spring-am-54-80';

const keys: Record<number, string> = {
  54: 'エ', 56: 'ア', 57: 'ア', 58: 'エ', 59: 'イ', 60: 'イ', 61: 'エ', 62: 'エ', 63: 'ア',
  64: 'エ', 65: 'イ', 66: 'ア', 67: 'イ', 68: 'イ', 69: 'エ', 70: 'ウ', 71: 'エ', 72: 'エ', 74: 'ア',
  75: 'エ', 76: 'イ', 77: 'ウ', 78: 'エ', 79: 'イ', 80: 'ア',
};
const input = [0, 1, 2, 3];
const cases = (n: number) => input.map(i => definitions.find(entry => entry.source === '2004h16h-fe-am-' + n)!.build([i]));
const text = (block: Block) => {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
const projection = (block: Block) => block.type === 'diagram' ? block.alt : text(block);
const numeric = (str: string) => Number(str.replaceAll(',', ''));
const options = (caseBody: ReturnType<typeof cases>[number]) => caseBody.choices.map(choice => projection(choice[0]));
function truthAssertions(truth: readonly boolean[], answer: number | undefined, message: string) {
  assert.deepEqual(truth, Array.from({ length: 4 }, (_, index) => index === answer), message);
}

test('掲載する25問の公式キーと四つの実質的な生成条件を確認する', () => {
  assert.deepEqual(definitions.map(entry => Number(entry.source.split('-').at(-1))), Object.keys(keys).map(Number));
  for (const entry of definitions) {
    const number = Number(entry.source.split('-').at(-1));
    const generated = cases(number);
    assert.equal(entry.sourceAnswer, keys[number]);
    assert.equal('アイウエ'[generated[0].correctIndex!], keys[number]);
    assert.deepEqual(entry.reference, [0]);
    for (const variant of generated) {
      assert.equal(variant.choices.length, 4);
      assert.equal(new Set(options(variant)).size, 4);
      assert(variant.explanation.length >= 55);
    }
    const documents = generated.map(each => [...each.prompt, ...each.choices.flat().filter(block => block.type === 'diagram')].map(projection).join('\n'));
    assert.equal(new Set(documents).size, 4, String(number));
    assert.equal(new Set(generated.map(each => each.correctIndex)).size === 1, entry.answerVariation === 'fixed');
    for (const invalid of [[], [1, 1], [NaN], [Infinity], [0.7], [-1], [4], new Array(1)])
      assert.throws(() => entry.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
  }
});

test('問54は図を読み、開始から終了までの全経路を独立に列挙する', () => {
  const paths = ['ABCDI', 'ABGDI', 'ABHI', 'AECDI', 'AEGDI', 'AEHI', 'AFDI'];
  const expected = [31, 32, 35, 34];
  cases(54).forEach((body, index) => {
    const edges = [...projection(body.prompt[1]).matchAll(/([A-I])は(開始|結合点\d)から(結合点\d|終了)へ(\d+)日/g)]
      .map(([, name, from, to, days]) => ({ name, from, to, days: Number(days) }));
    assert.equal(edges.length, 9);
    const traverse = (from: string): { route: string; days: number }[] => from === '終了' ? [{ route: '', days: 0 }] :
      edges.filter(edge => edge.from === from).flatMap(edge => traverse(edge.to).map(rest =>
        ({ route: edge.name + rest.route, days: edge.days + rest.days })));
    const found = traverse('開始');
    assert.deepEqual(found.map(route => route.route).sort(), paths);
    const finish = found.reduce((t, route) => Math.max(t, route.days), 0);
    assert.equal(finish, expected[index]);
    truthAssertions(options(body).map(value => Number(value) === finish), body.correctIndex, '問54');
  });
});

test('問58の規則を加算だけで展開して四つの文字を区別する', () => {
  cases(58).forEach((body, index) => {
    const labeled = /4けたの数値データ“(\d{4})”/.exec(text(body.prompt[0]));
    assert(labeled);
    const [a, b, c, d] = [...labeled[1]].map(Number);
    let score = a + a + a + a + b + b + b + c + c + d;
    while (score >= 11) score -= 11;
    const expected = '0123456789X'[score];
    assert.equal(expected, ['7', '1', '3', 'X'][index]);
    assert.match(body.prompt.map(projection).join(' '), /係数4，3，2，1.*11で割って余り.*余りが10のときは，X/);
    assert.match(body.explanation, new RegExp('検査文字は' + expected));
    truthAssertions(options(body).map(value => value === expected), body.correctIndex, '問58');
  });
});

test('問64の各選択秒数で実際に送れるビット量を計算し、最も近い値を確認する', () => {
  cases(64).forEach((body, index) => {
    const pattern = /(\d+)kビット／秒の回線を用いて(?:(\d+(?:\.\d)?)×)?10⁶バイト.*効率は(\d+)%/;
    const found = pattern.exec(text(body.prompt[0]));
    assert(found);
    const line = Number(found[1]), bytes = (Number(found[2]) || 1) * 1000000, efficiency = Number(found[3]);
    const scored = options(body).map(value => Math.abs(Number(value) * line * 10 * efficiency - bytes * 8));
    const answer = scored.indexOf(Math.min(...scored));
    assert.equal(Number(options(body)[answer]), [157, 125, 167, 160][index]);
    assert.equal(answer, body.correctIndex);
    assert.equal(new Set(scored).size, 4);
    truthAssertions(scored.map(score => score === scored[answer]), body.correctIndex, '問64');
  });
});

test('問68の4演算を独立にSQLで実行し列と行の役割を照合する', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE sales(sku INT,total INT); CREATE TABLE products(sku INT,name TEXT); CREATE TABLE west(sku INT,total INT);' +
      'INSERT INTO sales VALUES(1,15000),(2,7000),(3,10000); INSERT INTO products VALUES(1,\'A\'),(3,\'C\');' +
      'INSERT INTO west VALUES(1,15000),(4,8000);');
    const operations = [
      'SELECT total, name FROM sales JOIN products USING(sku)', 'SELECT sku FROM sales',
      'SELECT * FROM sales WHERE total >= 10000', 'SELECT * FROM sales UNION SELECT * FROM west',
    ];
    const expected = [
      [{ total: 15000, name: 'A' }, { total: 10000, name: 'C' }],
      [{ sku: 1 }, { sku: 2 }, { sku: 3 }],
      [{ sku: 1, total: 15000 }, { sku: 3, total: 10000 }],
      [{ sku: 1, total: 15000 }, { sku: 2, total: 7000 }, { sku: 3, total: 10000 }, { sku: 4, total: 8000 }],
    ];
    const role = [1, 0, 2, 3];
    const prompts = [/特定の列だけ/, /商品番号の一致する行どうし/, /売上金額が1万円以上である行だけ/, /同一の行は1行だけ/];
    cases(68).forEach((body, index) => {
      assert.match(text(body.prompt[0]), prompts[index]);
      assert.deepEqual(options(body), ['結合（join）', '射影（projection）', '選択（selection）', '和（union）']);
      const matches = operations.map(sql => JSON.stringify(db.prepare(sql).all()) === JSON.stringify(expected[role[index]]));
      truthAssertions(matches, body.correctIndex, '問68');
    });
  } finally { db.close(); }
});

test('問75は取引日ごとに1個ずつ先頭から消費して在庫の個数・金額を検算する', () => {
  cases(75).forEach((body, index) => {
    const figure = projection(body.prompt[1]);
    assert(figure.startsWith('日付｜商品Aの取引内容｜個数（個）｜単価（円）'));
    const events = [...figure.matchAll(/4\/(\d+)｜(繰越在庫|購入|払出し)｜(\d+)｜(\d+|斜線（記載なし）)/g)];
    assert.deepEqual(events.map(event => Number(event[1])), [1, 4, 5, 7, 10, 30]);
    const unitCosts: number[] = [];
    for (const [, , kind, amount, price] of events) {
      if (kind === '払出し') {
        assert.equal(price, '斜線（記載なし）');
        assert(Number(amount) <= unitCosts.length);
        for (let i = 0; i < Number(amount); i++) unitCosts.shift();
      } else for (let i = 0; i < Number(amount); i++) unitCosts.push(Number(price));
    }
    assert.equal(unitCosts.length, 30);
    const amount = unitCosts.reduce((a, b) => a + b);
    assert.equal(amount, [3900, 4320, 3750, 4180][index]);
    const values = options(body).map(numeric);
    assert.deepEqual(values, [...values].sort((a, b) => a - b));
    truthAssertions(values.map(value => value === amount), body.correctIndex, '問75');
  });
});

test('問77の四つの図から管理値の内側にのみ偏る分布を読み、観測上の推測として評価する', () => {
  cases(77).forEach((body, index) => {
    const prompt = text(body.prompt[0]);
    assert.match(prompt, /ほぼ正規分布.*推測できた.*SLは管理下限，SUは管理上限/);
    const examined = [0, 2].includes(index) ? 'upper' : 'lower';
    assert.match(prompt, examined === 'upper' ? /が高いことを嫌/ : /が低いことを嫌/);
    const plausible = options(body).map(alt => {
      const found = /([\d]+)区間目の直後に管理下限SL，([\d]+)区間目の直後に管理上限SU。左からの棒の相対高さは([\d，]+)/.exec(alt);
      assert(found);
      const lower = Number(found[1]), upper = Number(found[2]), heights = found[3].split('，').map(Number);
      const outside = heights.some((height, i) => height > 0 && (i < lower || i >= upper));
      const values = heights.flatMap((height, i) => Array<number>(height).fill(i + 0.5));
      const median = values[Math.floor(values.length / 2)];
      const within = (median - lower) / (upper - lower);
      return !outside && (examined === 'upper' ? within > 0.6 : within < 0.4);
    });
    assert.equal(body.correctIndex, [2, 0, 1, 3][index]);
    assert.match(body.explanation, /原因は図だけでは確定せず/);
    truthAssertions(plausible, body.correctIndex, '問77');
  });
});

type Criterion = readonly [number, readonly RegExp[], readonly RegExp[], readonly number[]];
const byQuestion: readonly Criterion[] = [
  [56, [/運用テスト/, /受注システム.*桁数/, /在庫システム.*順序/, /請求システム.*端数処理/],
    [/外部設計及び内部設計の誤り.*(?:マニュアル|手順書).*誤り.*コスト(?:は|が)高い/, /コーディングの誤り.*要求定義の誤りに比べて修復コストは高い/,
      /テストケースの誤り.*内部設計の誤りに比べて修復コストは高い/, /要求定義の誤り.*コーディングの誤りに比べて修復コストは低い/], [0, 0, 0, 0]],
  [57, [/バックアップ方法/, /夜間の注文登録/, /棚卸し後の一括計上/, /日次の予約枠更新/],
    [/重ならないようにスケジュール/, /同一記憶媒体内に別のファイル名/, /復旧時間を短く.*差分バックアップ/, /ランダムアクセスが可能な媒体/], [0, 0, 0, 0]],
  [59, [/主記憶の効率的な使用/, /磁気ディスクで分散したファイル/, /古い文書をまとめて保存領域/, /ファイルシステムに生じた論理上の異常/],
    [/デフラグメンテーション/, /主記憶.*ウィンドウを閉じ/, /アーカイブ.*書庫|書庫.*アーカイブ/, /スキャンディスク/], [1, 0, 2, 3]],
  [60, [/インテグリティを保証/, /銀行の振込一覧/, /診療予約のデータ/, /施設の安全点検票/],
    [/セキュリティ対策とは区別/, /人手によるチェック|職員が.*確認|担当者が.*照合|監督者が.*照合/,
      /システムの運用マニュアル.*必要はない/, /データを暗号化する必要/], [1, 1, 1, 1]],
  [61, [/リモートログイン.*仮想端末/, /ファイルの一覧.*制御とデータの接続/, /Webブラウザ.*資源.*サーバが応答/, /メール送信側.*サーバ同士でもメールを中継/],
    [/^FTP$/, /^HTTP$/, /^SMTP$/, /^TELNET$/], [3, 0, 1, 2]],
  [62, [/第3層.*経路選択/, /第5層.*対話の開始と終了/, /第2層.*隣接ノード.*フレーム/, /第4層.*端点間/],
    [/^セッション層$/, /^データリンク層$/, /^トランスポート層$/, /^ネットワーク層$/], [3, 0, 1, 2]],
  [63, [/生成多項式.*割り切れる/, /ビットの1の個数.*文字ごと/, /同じ桁にあるビット.*対応する桁/, /複数の検査ビット.*1ビット誤りの個所/],
    [/^CRC方式$/, /^垂直パリティチェック方式$/, /^水平パリティチェック方式$/, /^ハミング符号方式$/], [0, 1, 2, 3]],
  [65, [/フレーム衝突を検出/, /ランダムな待ち時間.*衝突しにくく/, /バス.*論理的な順番に送信権/, /リング上でトークンを循環/],
    [/^CSMA\/CA$/, /^CSMA\/CD$/, /^トークンパッシングバス$/, /^トークンパッシングリング$/], [1, 0, 2, 3]],
  [66, [/トランスポート層以上.*プロトコル変換/, /データリンク層.*MACアドレス.*フレームを中継/, /物理層.*波形/, /ネットワーク層.*宛先IPアドレス.*パケット/],
    [/^ゲートウェイ$/, /^ブリッジ$/, /^リピータ$/, /^ルータ$/], [0, 1, 2, 3]],
  [67, [/関係データベース/, /転置索引/, /階層型データベース/, /ネットワーク型データベース/],
    [/属性値.*レコード格納位置.*索引として/, /表として表現.*表中の列の値/, /ポインタ.*木構造の表現に制限/, /リンク.*木構造や網構造/], [1, 0, 2, 3]],
  [69, [/デッドロック/, /二相ロック.*保持する状態/, /占有ロック.*片方向のロック待ち/, /トランザクション間.*アクセスの排他/],
    [/2相ロック.*第2相目でロックを解除するまで/, /占有ロックと占有ロック.*片方.*待ち状態/, /アクセス中の資源.*アクセスできないよう/,
      /互いに相手のロック.*実行できなくなる/], [3, 0, 1, 2]],
  [70, [/スキーマを決める/, /利用者のアクセスを制限/, /バックアップと更新記録から/, /売上明細は実在する売上に属する/],
    [/^機密保護機能$/, /^障害回復機能$/, /^定義機能$/, /^保全機能$/], [2, 0, 1, 3]],
  [71, [/電子メールの送信者.*ディジタル署名/, /受信者自身が.*確認書をディジタル署名/, /検査機関が報告にディジタル署名/, /受信者が受領書を返し.*ディジタル署名/],
    [/^受信者の公開かぎと受信者の秘密かぎ$/, /^受信者の公開かぎと送信者の秘密かぎ$/,
      /^送信者の公開かぎと受信者の秘密かぎ$/, /^送信者の公開かぎと送信者の秘密かぎ$/], [3, 0, 3, 0]],
  [72, [/不正な実行によるデータの改ざんや破壊/, /閲覧.*在庫台帳を上書き/, /割り当てられた範囲以外.*削除/, /一般社員だけでは.*取引ファイルを変更/],
    [/^システムアクセスログの採取$/, /^ソースプログラムと実行プログラムの比較$/, /^ソースプログラムの保管場所の分散$/, /^ファイルへのアクセス権限の設定$/], [3, 3, 3, 3]],
  [74, [/SCMの説明/, /ナレッジマネジメント/, /人材管理/, /CRMの説明/],
    [/購買，生産，在庫，販売及び物流.*納期短縮/, /経験，ノウハウ.*知的資産/, /社員のスキル.*人員配置/, /顧客情報を一元化.*顧客との関係/], [0, 1, 2, 3]],
  [76, [/ワークサンプリング法/, /ストップウォッチ法/, /PTS法/, /経験見積り法/],
    [/作業時間をストップウォッチで測定/, /瞬間観測.*観察記録の回数の割合/, /基本動作にまで分解.*基本動作の標準時間/, /班長などが経験的判断/], [1, 0, 2, 3]],
  [78, [/1次式で表現.*資源.*最大の効果/, /直接には観測できない少数の特性/, /説明変数.*歩留りを予測/, /水準の組合せ.*条件が製品の強度に与える効果/],
    [/^因子分析法$/, /^回帰分析法$/, /^実験計画法$/, /^線形計画法$/], [3, 0, 1, 2]],
  [79, [/これらに関する記述/, /停止予定，保守時の連絡.*受付時間/, /けた数や商品識別コード/, /効力を生じる時点.*取引当事者の権利/],
    [/^業務運用規約とは，(?:TCP\/IP，JCA手順.*通信方法|システムの運用時間.*障害時)/,
      /^情報伝達規約とは，通信回線を介した接続方法/,
      /^情報表現規約とは，(?:システムの運用時間.*障害対策|交換するデータの項目と形式)/,
      /^取引基本規約とは，(?:データフォーマット|取引の成立時点.*権利)/], [1, 0, 2, 3]],
];

for (const [number, premises, roles, expected] of byQuestion) {
  test('問' + number + 'は独立に査読した出題条件と全選択肢の役割に一致する', () => {
    cases(number).forEach((body, index) => {
      assert.match(text(body.prompt[0]), premises[index]);
      const measured = options(body).map(option => {
        const matches = roles.map(role => role.test(option));
        assert.equal(matches.filter(Boolean).length, 1, option);
        return matches.indexOf(true);
      });
      assert.deepEqual(measured, [0, 1, 2, 3]);
      truthAssertions(measured.map(role => role === expected[index]), body.correctIndex, '問' + number);
    });
  });
}

test('問80は出題時の改変、バックアップ、使用権原の取得時点、アルゴリズムの四つを分ける', () => {
  const rules = [
    [/自社のパソコンでより効果的に利用.*改変を加えることができる。$/, /バックアップが目的であっても.*著作権法違反となる。$/,
      /取得したときに侵害の事実を知らなくても，使用時点で知っていれば，著作権法違反/, /そのアルゴリズムも含め.*保護される。$/],
    [/別会社に配布するためでも.*無断で配布できる。$/, /複製物の所有者.*必要な範囲で，バックアップ複製を作ることができる。$/,
      /後にその事実を知って業務上使用.*取得した時点の認識とは関係なく/, /処理の解法も.*同じように保護される。$/],
    [/必要範囲と関係なく著作者の意に反する改変/, /バックアップも，契約で明示されなければ複製できない。$/,
      /侵害を知りながら使用の権原を取得し，業務でコンピュータ上で使用/, /アルゴリズムそのものも.*保護対象に含まれる。$/],
    [/自社環境で動かすために必要な場合でも改変できない。$/, /障害対策に必要な複製を作ると常に著作権違反/,
      /侵害の事実を知らず取得.*そのことだけで業務での使用が当然に/, /アルゴリズムそのものはその保護に含まれない。$/],
  ];
  const legalOutcomes = [
    [true, false, false, false], [false, true, false, false], [false, false, true, false], [false, false, false, true],
  ];
  cases(80).forEach((body, index) => {
    for (const [slot, option] of options(body).entries()) assert.match(option, rules[index][slot]);
    assert.match(body.explanation, /第20条第2項第3号.*第47条の2.*第113条第2項.*第10条第3項/);
    truthAssertions(legalOutcomes[index], body.correctIndex, '問80');
  });
});
