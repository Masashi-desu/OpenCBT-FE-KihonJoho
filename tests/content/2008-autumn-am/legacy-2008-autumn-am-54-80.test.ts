import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2008AutumnAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2008-autumn-am-54-80';
import { legacy2008AutumnAm5480Figures as figures } from '../../../src/core/generators/legacy-2008-autumn-am-54-80-figures';
import { legacy2008AutumnAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2008AutumnAm5480Figures';

const official = 'ウエアイウアアイウウウエイエエウウウエウウイイウエウエ';
const cases = [0, 1, 2, 3];
type Four = readonly [RegExp, RegExp, RegExp, RegExp];
type Fact = { question: RegExp; options: Four; trueDescription: RegExp };
const fact = (question: RegExp, options: Four, trueDescription: RegExp): Fact => ({ question, options, trueDescription });
const fixed = (questions: Four, options: Four, truth: Four) => questions.map((question, index) => fact(question, options, truth[index]));

// Review the four descriptions independently of the generator's stored indices.
const facts: Readonly<Record<number, Fact[]>> = {
  54: fixed([/物理層/, /ハードウェアで高速化/, /データリンク層.*総称/, /ネットワーク層.*経路情報/],
    [/^スイッチングハブ/, /^ブリッジ$/, /^リピータ$/, /^ルータ$/], [/^リピータ$/, /^スイッチングハブ/, /^ブリッジ$/, /^ルータ$/]),
  55: fixed([/機器や障害時の情報収集/, /ネットニュース/, /時計を時刻サーバ/, /電子メール.*宛先側/],
    [/^NNTP$/, /^NTP$/, /^SMTP$/, /^SNMP$/], [/^SNMP$/, /^NNTP$/, /^NTP$/, /^SMTP$/]),
  56: fixed([/概念設計.*実体間の関連/, /親を一つ.*木構造/, /行と列.*射影/, /複数の異なる親/],
    [/^E-Rモデル$/, /^階層モデル$/, /^関係モデル$/, /^ネットワークモデル$/], [/^E-Rモデル$/, /^階層モデル$/, /^関係モデル$/, /^ネットワークモデル$/]),
  61: [
    fact(/排他|障害復旧/, [/システム障害.*スナップショット/, /媒体障害.*ロールフォワード/, /デッドロック.*排他制御を解除/, /更新後情報.*ロールバック/], /バックアップ時点.*更新後情報.*ロールフォワード/),
    fact(/媒体は正常.*DBMSが停止/, [/未確定の更新を取り消し.*確定した更新を反映/, /障害直前のスナップショットを新たに/, /未確定の更新をそのまま確定/, /確定済みの更新も全て取り消し/], /ログ.*未確定の更新を取り消し.*確定した更新を反映/),
    fact(/処理プログラムだけが更新途中/, [/更新後情報を再適用/, /すべての表を削除/, /ログの更新前情報を使って取り消す/, /ロックを外すだけ/], /ログの更新前情報を使って取り消す/),
    fact(/互いのロック解放を待って/, [/両方のロックを強制的に解除/, /バックアップで全データを上書き/, /双方の未確定更新を成功扱い/, /一方を中止して未確定の更新を取り消し/], /一方を中止して未確定の更新を取り消し/),
  ],
  62: fixed([/データベース管理者/, /プログラマの職務/, /受入担当者/, /プロジェクトマネージャ/],
    [/外部スキーマからアプリケーション/, /発注者の要求仕様.*受入検査/, /設計，保守，運用の監視，障害からの回復/, /開発要員，資源の最適配置/],
    [/設計，保守，運用の監視，障害からの回復/, /外部スキーマからアプリケーション/, /発注者の要求仕様.*受入検査/, /開発要員，資源の最適配置/]),
  63: fixed([/改ざん，なりすまし，否認/, /既知の不正プログラムを実行前/, /迷惑メールを別の場所へ/, /必要な宛先ポートへの通信だけ/],
    [/^ウイルスチェック$/, /^ジャンクメールフィルタ$/, /^ディジタル署名$/, /^ファイアウォール$/],
    [/^ディジタル署名$/, /^ウイルスチェック$/, /^ジャンクメールフィルタ$/, /^ファイアウォール$/]),
  64: fixed([/不正な機能をプログラムの一部に組み込んだ/, /処理能力を使い切らせて/, /一般的な単語や漏えいパスワードの一覧/, /領域の先まで上書き/],
    [/^DoS攻撃$/, /^辞書攻撃$/, /^トロイの木馬$/, /^バッファオーバフロー攻撃$/],
    [/^トロイの木馬$/, /^DoS攻撃$/, /^辞書攻撃$/, /^バッファオーバフロー攻撃$/]),
  65: [
    fact(/ICカードの適切な運用/, [/全利用者に共通/, /表面に刻印/, /設定した後で.*失効/, /PINを同封せず，別経路/], /PINを同封せず，別経路/),
    fact(/紛失連絡を受けた/, [/直ちに失効させ.*再発行/, /旧カードを有効/, /PINを同僚へ/, /同じ識別情報.*どちらも有効/], /直ちに失効させ.*再発行/),
    fact(/新入社員へ/, [/同じ初期PIN/, /本人だけが受け取れる別の経路/, /製造番号から算出/, /一つの封筒/], /本人だけが受け取れる別の経路/),
    fact(/担当者ごとの利用者認証/, [/一枚のカード.*共用/, /同じ値.*一覧/, /利用者ごとに.*貸し借りしない/, /端末に差したまま/], /利用者ごとに.*貸し借りしない/),
  ],
  68: fixed([/^CORBA/, /^JavaBeans/, /^OLAP/, /^グループウェア/],
    [/Java.*部品化/, /オンライン分析型/, /グループでの作業を支援/, /分散システム.*オブジェクト同士/],
    [/分散システム.*オブジェクト同士/, /Java.*部品化/, /オンライン分析型/, /グループでの作業を支援/]),
  69: [
    fact(/CSVに関する/, [/計算式や書式.*タブ/, /空白文字，コロン，セミコロン/, /コンマで区切り.*改行.*引用符/, /Javaアプレット.*タグ/], /コンマで区切り.*改行.*引用符/),
    fact(/TSVに関する/, [/タブで区切り.*レコード/, /コンマで区切り.*引用符/, /セルの計算式や書式/, /タグで段落やリンク/], /タブで区切り.*レコード/),
    fact(/ワークブック形式に関する/, [/コンマと改行/, /値だけでなく.*計算式.*表示書式/, /タブで区切った文字だけ/, /段落やリンクをタグ/], /値だけでなく.*計算式.*表示書式/),
    fact(/HTMLに関する/, [/コンマで区切るレコード/, /タブを値の区切り/, /セル計算.*ワークブック/, /タグで要素の構造.*外部画像の参照/], /タグで要素の構造.*外部画像の参照/),
  ],
  70: fixed([/^ERP/, /^SFA/, /^リテールサポート/, /^電子商取引/],
    [/営業活動にITを活用/, /小売店の経営活動を支援/, /企業全体の経営資源/, /商取引.*電子的なネットワーク/],
    [/企業全体の経営資源/, /営業活動にITを活用/, /小売店の経営活動を支援/, /商取引.*電子的なネットワーク/]),
  71: [
    fact(/^財務指標に関する/, [/固定負債に対する固定資産/, /固定資産に対する自己資本/, /総資本に対する利益.*大きいほど収益性/, /流動負債に対する流動資産.*小さいほど/], /総資本に対する利益.*大きいほど収益性/),
    fact(/^固定資産が.*自己資本/, [/固定資産を自己資本で割った固定比率/, /自己資本を総資本で割れば/, /利益を総資本で割った比率/, /流動資産を流動負債で割った比率/], /固定資産を自己資本で割った固定比率.*小さいほど/),
    fact(/^総資本のうち返済を要しない資本/, [/固定資産を自己資本で割った/, /自己資本を総資本で割った自己資本比率/, /利益を総資本で割った比率/, /流動資産と流動負債の比較/], /自己資本を総資本で割った自己資本比率.*依存度が低い/),
    fact(/^短期間に支払うべき負債/, [/固定資産を自己資本で割った/, /自己資本を総資本で割った/, /総資本利益率で/, /流動資産を流動負債で割る流動比率/], /流動資産を流動負債で割る流動比率.*大きいほど/),
  ],
  74: fixed([/^PDPC/, /^親和図法/, /^アローダイアグラム法/, /^系統図法/],
    [/言語データ.*意味の近さ.*統合/, /各作業.*全体日程.*最短日程/, /不測の事態.*最終結果/, /目的と手段の連鎖/],
    [/不測の事態.*最終結果/, /言語データ.*意味の近さ.*統合/, /各作業.*全体日程.*最短日程/, /目的と手段の連鎖/]),
  75: fixed([/ステップ数.*ステップ当たりのエラー数/, /対策の候補.*実施可能な手段/, /人，手順，環境などの原因/, /件数の多い種類から.*全件数/],
    [/^系統図$/, /^散布図$/, /^特性要因図$/, /^パレート図$/], [/^散布図$/, /^系統図$/, /^特性要因図$/, /^パレート図$/]),
  78: fixed([/B to C/, /調達・生産・運用.*ライフサイクル/, /取引先企業と注文・請求.*交換/, /複数の企業.*一つの企業のように/],
    [/^CALS$/, /^Web-EDI$/, /^バーチャルカンパニー$/, /^バーチャルモール$/],
    [/^バーチャルモール$/, /^CALS$/, /^Web-EDI$/, /^バーチャルカンパニー$/]),
  79: [
    fact(/同一特許出願が競合/, [/抽選/, /出願実績/, /最も先に出願/, /最も先に発明/], /最も先に出願/),
    fact(/6月1日に発明.*6月10日に出願.*6月2日に発明.*6月8日に出願/, [/6月8日に出願した乙/, /先に発明した甲/, /出願実績が多い/, /抽選/], /6月8日に出願した乙/),
    fact(/同じ日に特許出願.*協議により乙/, [/先に発明した/, /協議で定められた乙/, /早い時刻/, /出願実績/], /協議で定められた乙/),
    fact(/同じ日に出願し，協議が成立しなかった/, [/先に発明/, /抽選/, /早い時刻/, /甲も乙も特許を受けることができない/], /甲も乙も特許を受けることができない/),
  ],
  80: [
    fact(/B社に派遣することになった/, [/B社に雇用されることを禁止/, /Q氏を指名/, /最長1年間/, /B社の定められた指揮命令者/], /B社の定められた指揮命令者/),
    fact(/紹介予定派遣ではない通常.*出題当時/, [/雇用関係はA社.*B社が指揮命令/, /雇用関係はB社へ自動的に/, /必ず労働者本人を指名/, /正当な理由の有無を問わず禁止/], /雇用関係はA社.*B社が指揮命令/),
    fact(/派遣先だったB社への就職.*正当な理由がない/, [/自由にその就職を制限/, /正当な理由がないため.*契約を結べない/, /さかのぼってB社に変わる/, /1年以上続けなければ/], /正当な理由がないため.*契約を結べない/),
    fact(/職業紹介を予定した紹介予定派遣.*出題当時/, [/指揮命令を受けない/, /面接を行うことは一律にできない/, /派遣先が派遣前の面接を行うことができる/, /開始と同時に.*必ず成立/], /派遣先が派遣前の面接を行うことができる/),
  ],
};

function paragraphs(blocks: Block[]) {
  return blocks.map(block => {
    assert.equal(block.type, 'paragraph');
    return block.text;
  }).join('\n');
}
const number = (text: string) => Number(text.replaceAll(',', ''));
function numericOptions(choices: string[], gap: number) {
  const options = choices.map(number);
  assert.ok(options.every(Number.isSafeInteger));
  options.slice(1).forEach((value, index) => assert.ok(value - options[index] >= gap));
  return options;
}
function diagramAlt(block: Block) {
  assert.equal(block.type, 'diagram');
  return block.alt;
}
function tables(body: GeneratedBody) { return body.prompt.filter(block => block.type === 'table'); }

function lockReference(prompt: string, choices: string[], index: number) {
  if (index === 0) {
    return choices.map(choice => {
      const modes = [...choice.matchAll(/(共有|占有)ロック/g)].map(match => match[1]);
      assert.equal(modes.length, 2);
      return modes.every(mode => mode === '共有');
    });
  }
  const occupied = index === 1 ? { A: '占有' } : { A: '共有', B: '占有' };
  assert.match(prompt, index === 1 ? /Aには.*占有ロックがあり，Bはロックされていない/ : /共有ロック.*占有ロック/);
  return choices.map(choice => {
    const match = /^([ABC])(?:と([ABC])の両方)?の(共有|占有)ロック$/.exec(choice);
    assert.ok(match);
    return [match[1], match[2]].filter(Boolean).every(resource => {
      const lock = occupied[resource as keyof typeof occupied];
      return !lock || lock === '共有' && match[3] === '共有';
    });
  });
}

type Dependency = { from: string[]; to: string };
function closure(seed: string[], dependencies: Dependency[]) {
  const known = new Set(seed);
  for (let size = -1; size !== known.size;) {
    size = known.size;
    for (const { from, to } of dependencies) if (from.every(column => known.has(column))) known.add(to);
  }
  return known;
}
function subsets(columns: string[]) {
  return Array.from({ length: 2 ** columns.length }, (_, mask) => columns.filter((_, index) => mask & 1 << index));
}

function normalizationReference(body: GeneratedBody, prompt: string, index: number) {
  const address = index === 3 ? '配送先住所' : '住所';
  const dependencies: Dependency[] = [
    ...['日付', '顧客コード', ...(index === 3 ? [address] : [])].map(to => ({ from: ['伝票番号'], to })),
    ...['顧客名', ...(index === 3 ? [] : [address])].map(to => ({ from: ['顧客コード'], to })),
    { from: index === 2 ? ['伝票番号', '商品コード'] : ['商品コード'], to: '単価' },
    { from: index === 1 ? ['伝票番号', '商品コード'] : ['商品コード'], to: '単位' },
    { from: ['伝票番号', '商品コード'], to: '数量' },
  ];
  const stem = diagramAlt(body.prompt[1]);
  assert.match(stem, /伝票番号（主キーの項目）.*#1｜#2｜#3｜…｜#n.*繰返し.*商品コード｜単位｜数量｜単価/);
  assert.match(prompt, [/単位と単価は商品コードごと/, /単位と数量は伝票番号と商品コード/, /数量と単価は伝票番号と商品コード/, /伝票番号から日付，顧客コード，配送先住所/][index]);
  return body.choices.map(choice => {
    const rows = diagramAlt(choice[0]).split('。').filter(Boolean).map(row => {
      const parts = row.split('：')[1].split('｜');
      return { columns: parts.map(part => part.replace('（主キーの項目）', '')),
        key: parts.filter(part => part.endsWith('（主キーの項目）')).map(part => part.replace('（主キーの項目）', '')) };
    });
    const projected = rows.flatMap(({ columns }) => subsets(columns).flatMap(from =>
      [...closure(from, dependencies)].filter(to => columns.includes(to) && !from.includes(to)).map(to => ({ from, to }))));
    const preserves = dependencies.every(({ from, to }) => closure(from, projected).has(to));
    // A decomposition of the flattened invoice is lossless here when it
    // preserves its dependencies and retains a key for the flattened relation.
    const coversKey = rows.some(({ columns }) => columns.includes('伝票番号') && columns.includes('商品コード'));
    const inThirdNormalForm = rows.every(({ columns, key }) => {
      const superkey = (from: string[]) => columns.every(column => closure(from, dependencies).has(column));
      const allKeys = subsets(columns).filter(subset => superkey(subset) && !subset.some(
        removed => superkey(subset.filter(column => column !== removed))));
      const declaredKeyValid = allKeys.some(candidate => candidate.length === key.length && key.every(column => candidate.includes(column)));
      return declaredKeyValid && projected.filter(({ from, to }) => from.every(column => columns.includes(column)) && columns.includes(to))
        .every(({ from, to }) => superkey(from) || allKeys.some(candidate => candidate.includes(to)));
    });
    return coversKey && preserves && inThirdNormalForm;
  });
}

function aggregateReference(body: GeneratedBody, choices: string[]) {
  const schemas = diagramAlt(body.prompt[1]).split('。').filter(Boolean).map(row => row.split('：')[1].split('｜'));
  assert.equal(schemas.length, 3);
  assert.ok(schemas.every(row => row.length === 4));
  const [customers, daily, purchases] = schemas;
  const has = (columns: string[], required: string[]) => required.every(column => columns.includes(column));
  const links = has(customers, ['顧客']) && has(purchases, ['顧客']);
  const can = [
    has(daily, ['日付', '商品', '販売数量']),
    links && has(customers, ['性別']) && has(purchases, ['商品', '販売数量']),
    has(purchases, ['顧客', '販売代理店', ...(choices[2].includes('日別') ? ['日付'] : [])]),
    links && has(customers, ['生年月日']) && has(purchases, ['販売代理店']),
  ];
  assert.match(choices[0], /商品ごと.*販売数量.*日別/);
  assert.match(choices[1], /性別.*売れ筋/);
  assert.match(choices[2], /販売代理店ごと.*購入者/);
  assert.match(choices[3], /販売代理店ごと.*年齢分布/);
  return can.map(possible => !possible);
}

function sqlReference(body: GeneratedBody, choices: string[]) {
  const [departments, workers, wanted] = tables(body);
  const sql = body.prompt.find(block => block.type === 'code');
  assert.ok(sql);
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE BUSHO(BU_CODE TEXT PRIMARY KEY, BU_NAME TEXT, BU_CHO TEXT);' +
      'CREATE TABLE SHAIN(S_CODE TEXT PRIMARY KEY, S_NAME TEXT, S_NENREI INTEGER, S_SHOZOKU TEXT);');
    for (const row of departments.rows) db.prepare('INSERT INTO BUSHO VALUES(?,?,?)').run(...row);
    for (const row of workers.rows) db.prepare('INSERT INTO SHAIN VALUES(?,?,?,?)').run(...row);
    const expected = wanted.rows.map(row => row.join('|')).sort().join('\n');
    return choices.map(condition => {
      const statement = sql.text.replace('［a］', condition);
      const actual = db.prepare(statement).all().map(row => Object.values(row).join('|')).sort().join('\n');
      return actual === expected;
    });
  } finally {
    db.close();
  }
}

function incidentReference(body: GeneratedBody, choices: string[]) {
  const [actions] = tables(body);
  const phases = [/切り離/, /ログを解析/, /再構築/, /接続後.*監視/];
  const requiredOrder = phases.map(phase => {
    const matches = actions.rows.filter(([, text]) => phase.test(text));
    assert.equal(matches.length, 1);
    return matches[0][0];
  }).join('→');
  assert.ok(choices.every(choice => new Set(choice.split('→')).size === 4));
  return choices.map(choice => choice === requiredOrder);
}

function fifoReference(body: GeneratedBody, choices: string[], index: number) {
  const data = diagramAlt(body.prompt[1]).split('。').filter(Boolean).slice(1).map(row => row.split('｜'));
  assert.equal(data.length, 6);
  const items: { price: number; issued: boolean }[] = [];
  for (const [, type, quantity, price] of data) {
    if (type === '払出し') {
      assert.match(price, /斜線で該当なし/);
      const issued = items.filter(item => !item.issued).slice(0, parseInt(quantity));
      assert.equal(issued.length, parseInt(quantity));
      issued.forEach(item => { item.issued = true; });
    } else {
      for (let unit = 0; unit < parseInt(quantity); unit++) items.push({ price: parseInt(price), issued: false });
    }
  }
  const remaining = items.filter(item => !item.issued);
  assert.equal(remaining.length, 30);
  const value = remaining.reduce((sum, item) => sum + item.price, 0);
  const options = numericOptions(choices, 100);
  if (index !== 0) {
    const lifo: number[] = [];
    for (const [, type, quantity, price] of data) {
      if (type === '払出し') lifo.splice(-parseInt(quantity));
      else for (let unit = 0; unit < parseInt(quantity); unit++) lifo.push(parseInt(price));
    }
    assert.deepEqual(new Set(options), new Set([
      value,
      lifo.reduce((sum, price) => sum + price, 0),
      parseInt(data[0][3]) * remaining.length,
      parseInt(data[4][3]) * remaining.length,
    ]));
  }
  return options.map(option => option === value);
}

function abcReference(body: GeneratedBody, prompt: string, choices: string[]) {
  const [data] = tables(body);
  assert.deepEqual(data.columns, ['製品', ...'PQRSTUVWX', '合計']);
  const counts = data.rows[0].slice(1, -1).map(number);
  const total = counts.reduce((sum, count) => sum + count, 0);
  assert.equal(total, number(data.rows[0].at(-1)!));
  const percentage = Number(/(\d+)％以上/.exec(prompt)?.[1]);
  const ranked = counts.slice().sort((a, b) => b - a);
  return numericOptions(choices, 1).map(count => {
    const selected = ranked.slice(0, count).reduce((sum, quantity) => sum + quantity, 0);
    return 100 * selected >= total * percentage && 100 * (selected - ranked[count - 1]) < total * percentage;
  });
}

function tourReference(body: GeneratedBody, choices: string[], index: number) {
  const [data] = tables(body);
  assert.deepEqual(data.columns, ['From＼To', 'A社', 'B社', 'C社', 'D社']);
  const times = data.rows.map(row => row.slice(1).map(number));
  const durations: number[] = [];
  for (const b of [1, 2, 3]) {
    for (const c of [1, 2, 3].filter(company => company !== b)) {
      const d = 6 - b - c;
      durations.push(times[0][b] + times[b][c] + times[c][d] + times[d][0]);
    }
  }
  const sorted = [...new Set(durations)].sort((a, b) => a - b);
  assert.equal(sorted.length, 3);
  const options = numericOptions(choices, 5);
  assert.deepEqual(options.slice(1), sorted);
  if (index > 0) assert.ok(options[0] < sorted[0]);
  return options.map(option => durations.every(duration => duration >= option) && durations.includes(option));
}

function productionReference(body: GeneratedBody, prompt: string, choices: string[], index: number) {
  const [data] = tables(body);
  const minutes = Number(/(\d+)時間/.exec(prompt)?.[1]) * 60;
  assert.match(prompt, /工程の順番に制約はなく/);
  const rows = data.rows.map(row => row.slice(1).map(value => parseInt(value.replaceAll(',', ''))));
  const [[mP, mQ, mProfit], [nP, nQ, nProfit]] = rows;
  let best = 0;
  let winners: number[][] = [];
  for (let m = 0; m * mP <= minutes && m * mQ <= minutes; m++) {
    for (let n = 0; m * mP + n * nP <= minutes && m * mQ + n * nQ <= minutes; n++) {
      const result = m * mProfit + n * nProfit;
      if (result > best) { best = result; winners = []; }
      if (result === best) winners.push([m, n]);
    }
  }
  assert.equal(winners.length, 1);
  assert.ok(winners[0].every(quantity => quantity > 0));
  assert.equal(best % 10000, 0);
  if (index === 0) assert.deepEqual(winners, [[300, 200]]);
  const options = numericOptions(choices, 5);
  if (index !== 0) {
    const onlyM = Math.min(Math.floor(minutes / mP), Math.floor(minutes / mQ));
    const onlyN = Math.min(Math.floor(minutes / nP), Math.floor(minutes / nQ));
    const overestimated = onlyM * mProfit + Math.floor((minutes - onlyM * mQ) / nQ) * nProfit;
    assert.ok(onlyM * mP + Math.floor((minutes - onlyM * mQ) / nQ) * nP > minutes);
    assert.deepEqual(new Set(options.map(option => option * 10000)),
      new Set([best, onlyM * mProfit, onlyN * nProfit, overestimated]));
  }
  return options.map(option => option * 10000 === best);
}

function reviewedTruth(question: number, body: GeneratedBody, index: number) {
  const prompt = paragraphs(body.prompt.filter(block => block.type === 'paragraph'));
  if (question === 57) return normalizationReference(body, prompt, index);
  const choices = body.choices.map(paragraphs);
  if (question === 58) return aggregateReference(body, choices);
  if (question === 59) return sqlReference(body, choices);
  if (question === 60) return lockReference(prompt, choices, index);
  if (question === 66) {
    const mappings = [
      { text: /Webページの閲覧/, server: /Webサーバ/, protocol: 'HTTP' },
      { text: /制御接続.*データ接続/, server: /ファイル転送サーバ/, protocol: 'FTP' },
      { text: /社外のメールサーバから電子メール/, server: /メールサーバ/, protocol: 'SMTP' },
      { text: /社外保守委託先.*MIBの管理情報/, server: /管理対象機器/, protocol: 'SNMP' },
    ];
    const service = mappings.find(({ text }) => text.test(prompt));
    assert.ok(service);
    assert.match(prompt, /インターネットからDMZ.*禁止できない/);
    assert.match(diagramAlt(body.prompt[1]), service.server);
    assert.deepEqual(choices, ['FTP', 'HTTP', 'SMTP', 'SNMP']);
    return choices.map(choice => choice === service.protocol);
  }
  if (question === 67) return incidentReference(body, choices);
  if (question === 72) return fifoReference(body, choices, index);
  if (question === 73) return abcReference(body, prompt, choices);
  if (question === 76) return tourReference(body, choices, index);
  if (question === 77) return productionReference(body, prompt, choices, index);
  const reviewed = facts[question]?.[index];
  assert.ok(reviewed, 'missing independent review ' + question);
  assert.match(prompt, reviewed.question);
  assert.equal(choices.length, reviewed.options.length);
  choices.forEach((choice, position) => assert.match(choice, reviewed.options[position]));
  return choices.map(choice => reviewed.trueDescription.test(choice));
}

for (const definition of definitions) {
  const question = Number(definition.source.split('-').at(-1));
  test('2008年秋期旧午前問' + question + 'の全候補を独立に判定', () => {
    const variants = cases.map(index => definition.build([index]));
    const base = variants[0];
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.sourceAnswer, official[question - 54]);
    assert.equal('アイウエ'[base.correctIndex!], official[question - 54]);
    assert.throws(() => definition.build([]));
    assert.throws(() => definition.build([-1]));
    assert.throws(() => definition.build([4]));
    assert.throws(() => definition.build([1.5]));
    const surfaces = new Set<string>();
    const correctResponses = new Set<string>();
    variants.forEach((body, index) => {
      assert.deepEqual(body.prompt.map(block => block.type), base.prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(choice => choice.map(block => block.type)),
        base.choices.map(choice => choice.map(block => block.type)));
      assert.equal(body.choices.length, 4);
      assert.ok(body.explanation.length > 40);
      const truth = reviewedTruth(question, body, index);
      assert.deepEqual(truth, body.choices.map((_, position) => position === body.correctIndex));
      assert.equal(truth.filter(Boolean).length, 1);
      surfaces.add(JSON.stringify(body.prompt));
      correctResponses.add(body.choices[body.correctIndex!].map(block => block.type === 'diagram' ? block.alt : paragraphs([block])).join());
    });
    assert.equal(surfaces.size, 4);
    assert.ok(correctResponses.size >= 2);
  });
}

test('2008年秋期旧午前問54〜80の問題番号・図と描画の一対一対応', () => {
  assert.deepEqual(definitions.map(item => Number(item.source.split('-').at(-1))), Array.from({ length: 27 }, (_, index) => 54 + index));
  assert.deepEqual(figures.map(item => item.profile), renderers.map(item => item.profile));
  assert.equal(new Set(figures.map(item => item.profile)).size, 8);
  for (const definition of figures) {
    const component = renderers.find(renderer => renderer.profile === definition.profile)!.component;
    assert.deepEqual(definition.domain, [[0, 3]]);
    assert.throws(() => definition.validate([4]));
    for (const index of cases) {
      definition.validate([index]);
      const html = renderToStaticMarkup(createElement(component, { values: [index], caption: '描画検証' }));
      assert.ok(html.includes('data-figure-profile="' + definition.profile + '"'));
      assert.match(html, /tabindex="0".*左右にスクロール/);
      if (/(?:57|58|72)-/.test(definition.profile))
        assert.ok(html.includes('aria-description="' + definition.alt([index]) + '"'));
      if (definition.profile.includes('57')) assert.match(html, /<u>伝票番号<\/u>.*主キー/);
      if (definition.profile.includes('58')) assert.equal((html.match(/scope="col"/g) ?? []).length, 12);
      if (definition.profile.includes('66')) assert.match(html, /<desc[^>]+>.*DNSサーバ.*企業内ネットワーク.*<\/desc>/);
      if (definition.profile.includes('72')) assert.equal((html.match(/斜線（該当なし）/g) ?? []).length, 2);
    }
  }
});
