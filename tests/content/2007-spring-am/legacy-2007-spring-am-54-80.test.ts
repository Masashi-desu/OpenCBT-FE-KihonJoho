import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2007SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2007-spring-am-54-80';
import { legacy2007SpringAm5480Figures as figures } from '../../../src/core/generators/legacy-2007-spring-am-54-80-figures';
import { legacy2007SpringAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2007SpringAm5480Figures';

const text = (block: Block) => {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
const table = (block: Block) => {
  assert.equal(block.type, 'table');
  return block;
};
const alt = (block: Block) => {
  assert.equal(block.type, 'diagram');
  return block.alt;
};
const num = (value: string) => Number(value.replaceAll(',', ''));
type Judge = (body: GeneratedBody, choices: string[]) => boolean[];
type Four<T> = readonly [T, T, T, T];
type Facts = { situations: Four<RegExp>; options: Four<RegExp> | Four<Four<RegExp>>; acceptable: Four<RegExp> };
// Review the conditions and the meaning of every option independently of the generation definitions.
const facts: Record<number, Facts> = {
  54: { situations: [/メッセージヘッダの拡張.*音声，画像/, /リンク.*マークアップ/, /X\.400.*処理システム/, /MAIL FROM.*RCPT TO/],
    options: [/^HTML$/, /^MHS$/, /^MIME$/, /^SMTP$/], acceptable: [/^MIME$/, /^HTML$/, /^MHS$/, /^SMTP$/] },
  56: {
    situations: [/ATM交換方式/, /従来型のルータ/, /可変長のEthernetフレーム/, /ATMセルのヘッダ.*HEC/],
    options: [
      [/経路の設定.*フィルタリング/, /セルと呼ばれる固定長/, /ヘッダ情報について誤り制御を行わない/, /可変長のパケット/],
      [/経路の設定.*フィルタリング/, /セルと呼ばれる固定長/, /ヘッダ情報について誤り制御を行わない/, /可変長のパケット/],
      [/宛先を調べず/, /セルと呼ばれる固定長/, /宛先は必ずIPアドレス/, /長さの異なるフレーム/],
      [/受信側で経路を設定/, /音声や画像を圧縮/, /ヘッダのビット誤りの検出や訂正/, /可変長のペイロード長を指定/],
    ], acceptable: [/セルと呼ばれる固定長/, /経路の設定.*フィルタリング/, /長さの異なるフレーム/, /ヘッダのビット誤りの検出や訂正/],
  },
  57: { situations: [/^ルータの機能/, /上位層.*ゲートウェイ/, /^ネットワーク管理システム/, /データリンク層.*ブリッジ/],
    options: [/第4〜7層.*異なるLAN/, /機器数の把握.*集中管理/, /第2層.*MACアドレス/, /第3層.*パケットを中継/],
    acceptable: [/第3層.*パケットを中継/, /第4〜7層.*異なるLAN/, /機器数の把握.*集中管理/, /第2層.*MACアドレス/] },
  58: { situations: [/スキーマの説明/, /ビューの説明/, /データ操作言語/, /整合性制約/],
    options: [/仮想的な表/, /データ定義の集合/, /挿入，更新，削除，検索/, /一貫性.*制約条件/],
    acceptable: [/データ定義の集合/, /仮想的な表/, /挿入，更新，削除，検索/, /一貫性.*制約条件/] },
  59: { situations: [/特定の列だけ/, /顧客番号で対応付け/, /全ての列.*単価.*行だけ/, /重複を除いて合わせる/],
    options: [/^結合（join）$/, /^射影（projection）$/, /^選択（selection）$/, /^和（union）$/],
    acceptable: [/^射影/, /^結合/, /^選択/, /^和/] },
  60: {
    situations: [/^更新不可能なビュー/, /通常のUPDATE.*トリガで処理を置き換えない/, /通常のUPDATE.*ルールやトリガがなく/, /通常のUPDATE.*ルールやトリガがなく/],
    options: [
      [/定義にGROUP BY/, /定義にWHERE句/, /ビューに対するビュー/, /元の表の主キーを含まない/],
      [/実表をWHEREで絞って/, /DISTINCTで重複を除く/, /更新可能なビューの通常の列/, /主キーを除いて通常の列/],
      [/実表をWHEREで絞って/, /更新可能なビューの通常の列/, /UNIONで合わせる/, /主キーを除いて通常の列/],
      [/実表をWHEREで絞って/, /更新可能なビューの通常の列/, /主キーを除いて通常の列/, /集約関数SUMだけ/],
    ], acceptable: [/GROUP BY/, /DISTINCT/, /UNION/, /集約関数SUM/],
  },
  62: { situations: [/更新前や更新後.*更新記録/, /テキスト等に出力.*移行/, /直近の区切り.*ログ位置/, /別の記憶先.*全体の複製/],
    options: [/^ジャーナルファイル$/, /^ダンプファイル$/, /^チェックポイントファイル$/, /^バックアップファイル$/],
    acceptable: [/^ジャーナル/, /^ダンプ/, /^チェックポイント/, /^バックアップ/] },
  64: {
    situations: [/秘匿して送受信.*公開鍵暗号/, /共通鍵を使って/, /送信者が暗号化に使う鍵/, /受信者が復号に使う鍵/],
    options: [
      [/暗号化鍵と復号鍵は公開/, /暗号化鍵は公開してもよいが.*秘密/, /暗号化鍵は秘密.*復号鍵は公開/, /復号鍵は秘密.*暗号化鍵は公開/],
      [/同じ秘密鍵を当事者で保持/, /鍵は公開し.*秘密/, /復号用の鍵だけを公開/, /復号鍵は秘密.*暗号化鍵は公開/],
      [/暗号化鍵と復号鍵は公開/, /受信者の真正な公開鍵.*暗号化/, /暗号化鍵は秘密.*復号鍵は公開/, /送信者自身の公開鍵/],
      [/暗号化鍵と復号鍵は公開/, /受信者の公開鍵で復号/, /受信者のみが秘密鍵.*復号/, /送信者自身の秘密鍵/],
    ], acceptable: [/復号鍵は秘密.*暗号化鍵は公開/, /同じ秘密鍵を当事者で保持/, /受信者の真正な公開鍵.*暗号化/, /受信者のみが秘密鍵.*復号/],
  },
  66: { situations: [/メッセージ認証符号.*メッセージダイジェスト/, /暗号化方式識別子/, /短い説明文を別に作る/, /暗号文に変換/],
    options: [/改ざんされていない/, /暗号化方式を確認/, /概要を確認/, /秘匿性を確保/],
    acceptable: [/改ざんされていない/, /暗号化方式を確認/, /概要を確認/, /秘匿性を確保/] },
  67: { situations: [/^Webビーコン/, /ファイルを破壊.*マルウェア/, /Webアプリケーションの不具合/, /掲示板.*ブラウザ.*XSS/],
    options: [/PC上で画像ファイルを消去/, /アプリケーションプログラムに潜在する誤り/, /スクリプト.*被害/, /アクセス動向.*埋め込まれた画像/],
    acceptable: [/アクセス動向.*埋め込まれた画像/, /PC上で画像ファイルを消去/, /アプリケーションプログラムに潜在する誤り/, /閲覧者のブラウザで動作/] },
  68: {
    situations: [/^ネットワークシステムのセキュリティ対策/, /ダイヤルアップ通信でコールバック/, /DTEとDCEの間.*透過的/, /無線LANで経路上の盗聴を抑える/],
    options: [
      [/加入者番号.*コールバック/, /DTE.*一部に変更が必要/, /閉域接続.*特定の利用者グループ/, /ケーブルを介在させない/],
      [/登録済みの番号.*かけ直す/, /番号を表示したまま/, /一般公開の無線/, /非暗号化で保存/],
      [/接続番号を表示するだけ/, /データの形式を変えず.*暗号化/, /暗号化装置なし/, /ケーブルがないため盗聴できない/],
      [/ケーブルがないので対策は不要/, /SSIDを設定するだけ/, /あらゆる攻撃ができない/, /認証と適切な無線区間の暗号化/],
    ], acceptable: [/閉域接続.*特定の利用者グループ/, /登録済みの番号.*かけ直す/, /データの形式を変えず.*暗号化/, /認証と適切な無線区間の暗号化/],
  },
  69: { situations: [/^UCS-2（Unicode）/, /Shift_JIS/, /EUC-JP.*JIS X 0208/, /ISO-8859-1/],
    options: [/JISから派生/, /主にUNIX/, /1バイト(の符号)?で(表現|表され)/, /すべての文字を2バイト/],
    acceptable: [/すべての文字を2バイト/, /JISから派生/, /主にUNIX/, /定義されている文字は1バイト/] },
  70: {
    situations: [/^静止画像データの圧縮/, /PNGで画像を可逆/, /同じ縦横の画素数/, /JPEG画像で.*圧縮の設定を変更/],
    options: [
      [/非可逆符号化方式よりも小さく/, /圧縮率は伸張後の画像品質に影響しない/, /画像サイズが元の画像よりも小さく/, /圧縮率を変化させることはできない/],
      [/画像の内容や圧縮設定により変わる/, /展開した画像の色値が変化/, /幅と高さが必ず半分/, /いつも非可逆圧縮より小さい/],
      [/非可逆符号化方式よりも小さく/, /元の画素値に必ず完全に戻る/, /画素数は保たれても.*画質が低下/, /圧縮率を変化させることはできない/],
      [/非可逆符号化方式よりも小さく/, /元の画像と常に一致/, /必ず縮小した画像/, /画質を下げてファイルサイズを小さく/],
    ], acceptable: [/圧縮率は伸張後の画像品質に影響しない/, /画像の内容や圧縮設定により変わる/, /画素数は保たれても.*画質が低下/, /画質を下げてファイルサイズを小さく/],
  },
  71: { situations: [/ステークホルダを重視/, /不祥事を防止するコンプライアンス/, /模倣しにくい独自の経営資源/, /経営者への監督/],
    options: [/不祥事の発生を抑制/, /差別化の源泉/, /経営者の権力行使をけん制/, /利害関係者の満足度/],
    acceptable: [/利害関係者の満足度/, /不祥事の発生を抑制/, /差別化の源泉/, /経営者の権力行使をけん制/] },
  74: { situations: [/未知の状況を先読み/, /前後関係と所要時間/, /手段を段階的に分解/, /原因が複数.*互いに影響/],
    options: [/^PDPC法$/, /^アローダイアグラム法$/, /^系統図法$/, /^連関図法$/],
    acceptable: [/^PDPC法$/, /^アローダイアグラム法$/, /^系統図法$/, /^連関図法$/] },
  75: { situations: [/^パレート図/, /^散布図/, /^ガントチャート/, /^レーダーチャート/],
    options: [/2変数.*打点.*相関関係/, /出現頻度.*棒グラフ.*累積和/, /実施期間を棒状/, /複数項目の基準値に対する比率/],
    acceptable: [/出現頻度.*棒グラフ.*累積和/, /2変数.*打点.*相関関係/, /実施期間を棒状/, /複数項目の基準値に対する比率/] },
  76: { situations: [/乱数.*近似/, /似た特徴.*まとまり/, /最近の観測値により大きな重み/, /専門家に匿名で複数回/],
    options: [/^クラスタ分析法$/, /^指数平滑法$/, /^デルファイ法$/, /^モンテカルロ法$/],
    acceptable: [/^モンテカルロ法$/, /^クラスタ分析法$/, /^指数平滑法$/, /^デルファイ法$/] },
  79: { situations: [/ICタグ（RFID）/, /衛星の信号を受信する測位装置/, /大容量データ管理設備/, /接触型ICカード/],
    options: [/GPSを利用/, /外部記憶装置を使用/, /読取り装置に挿入/, /梱包の外からも記録された情報を読む/],
    acceptable: [/梱包の外からも記録された情報を読む/, /GPSを利用/, /外部記憶装置を使用/, /読取り装置に挿入/] },
  80: {
    situations: [/コンピュータプログラムなどの著作物/, /開発費用の負担と著作権/, /体系的な構成に創作性があるデータベース/, /解法と，実際に作成したプログラム/],
    options: [
      [/開発費用を負担した割合に従って/, /データベース.*認められていない/, /ノウハウを保護/, /言語や規約.*保護の対象外/],
      [/割合だけで著作権の帰属が決まるわけではなく/, /全額を払った者が必ず著作者/, /著作物にならない/, /常に均等に/],
      [/データベースの構成は保護されない/, /体系的構成について.*保護される/, /数字や事実.*全て著作物/, /登録をしなければ/],
      [/解法を著作権で独占/, /どの実装も著作物にはなれない/, /創作性のある実装.*解法自体には及ばない/, /いつもプログラム著作物/],
    ], acceptable: [/言語や規約.*保護の対象外/, /割合だけで著作権の帰属が決まるわけではなく/, /体系的構成について.*保護される/, /創作性のある実装.*解法自体には及ばない/],
  },
};

const lineError: Judge = (body, choices) => {
  const [, denominator, rate] = /誤り率が1\/([\d,]+).*?([\d,]+)ビット／秒/.exec(text(body.prompt[0]))!;
  assert.equal(num(denominator) % num(rate), 0);
  return choices.map(option => num(option) * num(rate) === num(denominator));
};
const update: Judge = (body, choices) => {
  const rows = table(body.prompt[2]).rows;
  assert.equal(rows.length, 5);
  return choices.map(query => {
    const db = new DatabaseSync(':memory:');
    try {
      // SQLite does not infer NOT NULL for every textual PRIMARY KEY declaration.
      // Add that standard constraint to the execution model while checking the source declaration separately.
      assert.match(text(body.prompt[1]), /CHAR\(4\).*\n\s*PRIMARY KEY\(商品番号\)/);
      db.exec(text(body.prompt[1]).replace('商品番号 CHAR(4)', '商品番号 CHAR(4) NOT NULL'));
      const add = db.prepare('INSERT INTO 商品 VALUES (?, ?, ?, ?)');
      for (const [id, name, supplier, price] of rows) add.run(id, name, supplier, num(price));
      try { return db.prepare(query).run().changes === 1; }
      catch (error) {
        assert.match(String(error), /constraint failed/i);
        assert.equal(db.prepare('SELECT * FROM 商品').all().length, 5);
        return false;
      }
    } finally { db.close(); }
  });
};
const schema: Judge = (body, choices) => {
  const rows = alt(body.prompt[1]).split('\n').map(line => line.split('：'));
  assert.equal(rows.length, 3);
  const columns = new Map(rows.map(([name, list]) => [name, list.split('、').filter(column => column.endsWith('（下線）'))
    .map(column => column.replace('（下線）', ''))]));
  const parents = [...columns].map(([child, fields]) => [child, [...columns].filter(([parent, references]) =>
    parent !== child && references.length < fields.length && references.every(key => fields.includes(key))).map(([name]) => name)] as const);
  return choices.map(option => {
    const order = option.split('→');
    return parents.every(([child, sources]) => sources.every(parent => order.indexOf(parent) < order.indexOf(child)));
  });
};
const challenge: Judge = (body, choices) => {
  const [request, response, verify] = text(body.prompt[1]).split('\n').slice(1);
  const [, sender, recipient] = /（1）([XY])は，.*チャレンジ）を([XY])へ送信/.exec(request)!;
  assert.match(response, new RegExp('（2）' + recipient + 'は，.*レスポンス）を生成し，' + sender + 'へ返送'));
  assert.match(verify, new RegExp('（3）' + sender + 'は，.*正しいことを確認'));
  return choices.map(option => option === sender + 'が' + recipient + 'を認証する。');
};
const factory: Judge = (body, choices) => {
  const [, year, current, lost, duration] =
    /毎年([\d,]+)個.*不良率は([\d.]+)％.*損失額は(\d+)円.*(\d+)年間使用/.exec(text(body.prompt[0]))!;
  const base = num(year) * num(lost) * num(duration) * num(current) / 100;
  const changes = table(body.prompt[1]).rows.map(([, bad, cost]) =>
    num(cost.replace('万円', '')) * 10000 + num(year) * num(lost) * num(duration) * num(bad.replace('％', '')) / 100 - base);
  const [a, b] = changes;
  const comparison = [[/Aはコスト削減.*Bではコスト増加/, a < 0 && b > 0], [/Bはコスト削減.*Aではコスト増加/, b < 0 && a > 0],
    [/どちら.*コスト削減/, a < 0 && b < 0], [/どちら.*導入前と変わらない/, a === 0 && b === 0]] as const;
  return choices.map(option => {
    const matches = comparison.filter(([phrase]) => phrase.test(option));
    assert.equal(matches.length, 1);
    return matches[0][1];
  });
};
const opportunities: Judge = (body, choices) => {
  const rows = table(body.prompt[1]).rows;
  assert.equal(rows.length, 5);
  const profit = rows.reduce((sum, [, price, demand, supplied]) => sum + num(price) * num(demand), 0);
  const actual = rows.reduce((sum, [, price, demand, supplied]) => sum + num(price) * Math.min(num(demand), num(supplied)), 0);
  return choices.map(option => num(option) === profit - actual);
};
const stock: Judge = (body, choices) => {
  const [, small, large] = /発注量を(\d+)個とする場合を，1回の発注量を(\d+)個/.exec(text(body.prompt[0]))!;
  assert.match(text(body.prompt[0]), /一定の割合で減少.*在庫がなくなると同時に入荷/);
  const source = table(body.prompt[1]).rows;
  const [units, fee, order, storage, discount] = source.map(([, value]) => num(/([\d,]+)[個万％]/.exec(value)![1]));
  const minimum = num(/(\d+)個以上/.exec(source[4][0])![1]);
  const receipt = (amount: number) => {
    const cycle = units / amount;
    const sum = Array.from({ length: cycle }, () => amount * fee * (amount >= minimum ? (100 - discount) / 100 : 1) + order)
      .reduce((a, b) => a + b, 0);
    return sum + (0 + amount) / 2 * storage;
  };
  const delta = receipt(num(small)) - receipt(num(large));
  return choices.map(option => {
    const [, amount, relation] = /^([\d,]+)万円(安い|高い)$/.exec(option)!;
    return num(amount) * (relation === '安い' ? -1 : 1) === delta;
  });
};
const shortestPath: Judge = (body, choices) => {
  const paths = alt(body.prompt[1]).split('。').map(text => /^(.+)→(.+)：(\d+)$/.exec(text)!.slice(1));
  assert.equal(paths.length, 20);
  function all(from: string, total: number): number[] {
    if (from === '目的地') return [total];
    return paths.filter(([start]) => start === from).flatMap(([, end, fee]) => all(end, total + num(fee)));
  }
  const amounts = all('出発地', 0);
  assert.equal(amounts.length, 18);
  assert.equal(amounts.filter(value => value === Math.min(...amounts)).length, 1);
  assert.deepEqual(choices.map(num), choices.map(num).sort((a, b) => a - b));
  return choices.map(option => amounts.includes(num(option)) && amounts.every(amount => num(option) <= amount));
};
const judges: Record<number, Judge> = {
  55: lineError, 61: update, 63: schema, 65: challenge, 72: factory, 73: opportunities, 77: stock, 78: shortestPath,
};
const official = 'ウアイエイイアエアイエウアエウエイエイエアイエエイエエ';
assert.equal(definitions.length, official.length);
for (const [i, question] of definitions.entries()) {
  const number = i + 54;
  test('2007年度春期旧午前 問' + number + 'の原形式・全条件・全候補を独立に検証する', () => {
    assert.equal(question.source, '2007h19h-fe-am-' + number);
    assert.equal(question.sourceAnswer, official[i]);
    assert.deepEqual(question.reference, [0]);
    const reference = question.build([0]);
    assert.equal(reference.correctIndex, 'アイウエ'.indexOf(official[i]));
    const prompts = new Set<string>();
    for (const index of [0, 1, 2, 3]) {
      const body = question.build([index]);
      const choices = body.choices.map(option => {
        assert.equal(option.length, 1);
        assert.equal(option[0].type, number === 61 ? 'code' : 'paragraph');
        return text(option[0]);
      });
      assert.equal(new Set(choices).size, 4);
      assert.deepEqual(body.prompt.map(block => block.type), reference.prompt.map(block => block.type));
      assert(body.explanation.length > 25);
      prompts.add(JSON.stringify(body.prompt));
      const independently = judges[number];
      let matches: boolean[];
      if (independently) matches = independently(body, choices);
      else {
        const record = facts[number];
        assert.match(text(body.prompt[0]), record.situations[index]);
        const bank = record.options[0] instanceof RegExp ? record.options as Four<RegExp> : (record.options as Four<Four<RegExp>>)[index];
        choices.forEach((choice, option) => assert.match(choice, bank[option]));
        matches = choices.map(option => record.acceptable[index].test(option));
      }
      assert.deepEqual(matches.flatMap((match, j) => match ? [j] : []), [body.correctIndex], '条件 ' + index);
    }
    assert.equal(prompts.size, 4);
    for (const bad of [[], [0, 1], [NaN], [-1], [4], [0.5], Array<number>(1)])
      assert.throws(() => question.build(bad), /範囲外/);
  });
}
test('問63と問78の生成図をすべて描画でき、下線・矢印・代替文を保持する', () => {
  for (const [i, definition] of figures.entries()) for (const index of [0,1,2,3]) {
    const caption = '査読用の題名';
    const markup = renderToStaticMarkup(createElement(renderers[i].component, { caption, values: [index] }));
    assert(markup.includes(definition.profile));
    assert.equal((markup.match(/<u>/g) ?? []).length, i === 0 ? 6 : 0);
    assert.equal((markup.match(/marker-end=/g) ?? []).length, i === 1 ? 20 : 0);
    if (i === 1) assert(markup.includes('<desc '));
  }
});
