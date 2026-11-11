import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2009SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2009-spring-am-54-80';
import { legacy2009SpringAm5480Figures } from '../../../src/core/generators/legacy-2009-spring-am-54-80-figures';
import { legacy2009SpringAm5480FigureRenderers } from '../../../src/ui/Legacy2009SpringAm5480Figures';

const official = 'イウアエアウイウエアイエアエウウアウアエエイイイエアエ';
const cases = [0, 1, 2, 3];
const held = new Set([66, 68]);
type Four = readonly [RegExp, RegExp, RegExp, RegExp];
type Fact = { readonly question: RegExp; readonly options: Four; readonly trueDescription: RegExp };
function reviewed(question: RegExp, options: Four, trueDescription: RegExp): Fact {
  return { question, options, trueDescription };
}
function fixed(questions: Four, options: Four, truth: Four): Fact[] {
  return questions.map((question, index) => reviewed(question, options, truth[index]));
}

// Independent choices describe a mechanism or category in the paper and each new scenario.
// Check every option against one reviewed meaning before determining the single suitable meaning.
const facts: Readonly<Record<number, Fact[]>> = {
  54: fixed([/メーカ別の市場構成比/, /直近12か月の合計/, /上昇と下落/, /四つの指標のバランス/],
    [/^Zグラフ$/, /^帯グラフ$/, /^折れ線グラフ$/, /^レーダチャート$/], [/^帯/, /^Z/, /^折れ線/, /^レーダ/]),
  55: [
    reviewed(/一斉移行方式/, [/新旧システム間を接続/, /並行させて運用/, /トラブルの影響が大きい/, /運用コスト/], /トラブルの影響が大きい/),
    reviewed(/同じ受注処理を新旧両方/, [/処理結果を比較してから/, /同時に動く期間がない/, /本番データによる処理結果を比較できない/, /拠点を一つずつ/], /処理結果を比較してから/),
    reviewed(/営業所ごとに切り替え/, [/同じ日時に.*一斉/, /先行営業所で判明した問題に対処/, /必ず同じ処理を新旧両方/, /使う営業所はない/], /先行営業所で判明した問題に対処/),
    reviewed(/受注と在庫の機能を別の日/, [/必ず二重に登録/, /切り替えた機能を稼働させない/, /受注結果を在庫へ渡す必要はない/, /併存中の接続方法/], /併存中の接続方法/),
  ],
  56: [
    reviewed(/信頼性を比較する目的/, [/トラブルが解決されて安定/, /運用を開始した時$/, /リリースの可否/, /老朽化によるトラブル/], /トラブルが解決されて安定/),
    reviewed(/二つの受注システムの平常運用/, [/受入試験期間/, /通常業務量で安定/, /設定漏れによる停止/, /装置の劣化/], /通常業務量で安定/),
    reviewed(/ファイルサーバ.*定常運用/, [/アクセスがない期間/, /交換期限を過ぎた/, /故障率が安定/, /設置した当日/], /故障率が安定/),
    reviewed(/二つの予約システム.*同じ業務負荷/, [/リリースの可否/, /接続トラブルを調査/, /記憶装置の故障が増え/, /通常負荷で稼働が安定/], /通常負荷で稼働が安定/),
  ],
  57: [
    reviewed(/OSのバージョンアップの案内/, [/相性をチェックしバージョンアップ/, /すぐにバージョンアップ/, /トラブルはないと判断し/, /データベースシステムの稼働を確認した後/], /稼働を確認した後.*業務アプリケーションの稼働を確認/),
    reviewed(/データベースの稼働は確認済み.*在庫アプリケーションは未確認/, [/組み合わせた環境.*業務処理を確認/, /確認せずに更新/, /旧OSで動くことだけ/, /更新は常に不可/], /組み合わせた環境.*業務処理を確認/),
    reviewed(/新OS上のデータベースで障害.*画面しか確認できていない/, [/画面が表示されたので/, /登録から参照まで確認できるまで.*更新を見送る/, /原因を確認せずに/, /障害は無視/], /登録から参照まで確認できるまで.*更新を見送る/),
    reviewed(/本番と同等の検証環境.*登録・照会が正常/, [/サポート終了後まで更新を禁止/, /データベースの確認結果は考慮しない/, /双方の確認結果.*切戻し手順/, /提供元が異なるだけ/], /双方の確認結果.*切戻し手順/),
  ],
  58: [
    reviewed(/^システム監査人の役割/, [/独立かつ専門的/, /リリースを承認/, /利用者に監査調書/, /テスト担当者に指示/], /独立かつ専門的.*保証又は助言/),
    reviewed(/販売システムのアクセス権管理/, [/承認者自身/, /付与・取消しの証跡を独立に調べ/, /設定を修正/, /利用者全員に監査調書/], /付与・取消しの証跡を独立に調べ/),
    reviewed(/バックアップからの復旧/, [/装置を購入/, /共有を承認/, /復旧試験の記録.*独立に評価/, /改修者として変更を承認/], /復旧試験の記録.*独立に評価/),
    reviewed(/委託先へのデータ提供/, [/契約を締結/, /担当者に代わり/, /監査対象から除外/, /委託部門から独立/], /委託部門から独立.*有効性を評価/),
  ],
  59: fixed([/“システム管理基準”/, /“コンピュータウイルス対策基準”/, /“コンピュータ不正アクセス対策基準”/, /“ソフトウェア管理ガイドライン”/],
    [/ウイルス.*発見，駆除/, /不正アクセス.*再発防止/, /情報戦略.*リスクを低減/, /違法複製を防止/],
    [/情報戦略.*リスクを低減/, /ウイルス.*発見，駆除/, /不正アクセス.*再発防止/, /違法複製を防止/]),
  60: [
    reviewed(/データ入力の誤りや不正の発見統制/, [/操作ミスを起こしにくい/, /出力リストと入力伝票/, /担当者を限定/, /マニュアル.*教育/], /出力リストと入力伝票.*照合/),
    reviewed(/受注入力.*発見統制/, [/登録後の受注を原注文書/, /商品コードの一覧/, /入力権限を付与/, /業務開始前/], /登録後の受注を原注文書/),
    reviewed(/経費精算.*発見統制/, [/負の金額を保存できない/, /登録権限を精算担当者/, /登録済みの明細.*重複を報告/, /担当者を教育/], /登録済みの明細.*重複を報告/),
    reviewed(/在庫移動.*発見統制/, [/倉庫コードを選択肢/, /作業前.*手順/, /利用者IDを登録担当/, /登録済みの移動記録.*移動票/], /登録済みの移動記録.*移動票/),
  ],
  61: fixed([/エンタープライズアーキテクチャ（EA）/, /統一モデリング言語/, /E-Rモデル/, /データフローダイアグラム/],
    [/クラス図などのモデル図/, /エンティティ，リレーションシップ/, /政策・業務体系.*適用処理体系.*技術体系/, /データフロー，プロセス，ファイル/],
    [/政策・業務体系.*適用処理体系.*技術体系/, /クラス図などのモデル図/, /エンティティ，リレーションシップ/, /データフロー，プロセス，ファイル/]),
  62: fixed([/全体計画立案時.*業務モデル/, /中核の処理ごと.*入力.*出力の仕様/, /停止するアプリケーション.*参照先/, /注文書・請求書.*利用箇所/],
    [/基幹系の機能.*データ項目/, /既存の情報システムとデータベース/, /組織の機能と帳票/, /ビジネスプロセスとデータクラス/],
    [/ビジネスプロセスとデータクラス/, /基幹系の機能.*データ項目/, /既存の情報システムとデータベース/, /組織の機能と帳票/]),
  65: [
    reviewed(/共通フレーム2007.*システム化計画を立案/, [/自社の社員で開発/, /同じシステム/, /運用マニュアル及び障害対策/, /有効性及び投資効果/], /有効性及び投資効果/),
    reviewed(/手入力による受注の誤り/, [/訂正件数の削減見込み.*導入・運用費用/, /他社の画面/, /効果と費用の確認を省略/, /効果の見込みを評価せず/], /訂正件数の削減見込み.*導入・運用費用/),
    reviewed(/問い合わせ処理時間を短縮/, [/処理時間と改善見込みを調べる必要はない/, /処理時間の現状と短縮目標.*費用に見合う効果/, /業務を調査せず/, /投資評価をせず/], /処理時間の現状と短縮目標.*費用に見合う効果/),
    reviewed(/紙の在庫報告を電子化/, [/画面の項目を全て最終決定/, /投資効果の評価を省略/, /到着時間や転記工数の改善.*導入と運用.*費用/, /運用条件や効果の確認は省略/], /到着時間や転記工数の改善.*導入と運用.*費用/),
  ],
  67: [
    reviewed(/一括請負契約/, [/コスト見積りに対して一定比率/, /達成度に応じたインセンティブ/, /実施された労務/, /決められた価格で作成された成果物/], /決められた価格で作成された成果物/),
    reviewed(/コスト償還型の固定フィー契約/, [/見積額を基に確定した報酬/, /実際の費用にかかわらず/, /目標性能の達成度/, /実作業時間.*時間単価/], /対象費用を精算し.*見積額を基に確定した報酬/),
    reviewed(/コスト償還型のインセンティブ付き契約/, [/固定報酬を実績にかかわらず/, /目標性能の達成度/, /時間数に.*単価/, /実際の費用とは無関係/], /対象費用を精算し.*目標性能の達成度/),
    reviewed(/タイム・アンド・マテリアル契約.*労務分/, [/確定した固定フィー/, /目標達成度によって決まる/, /作業時間.*時間単価/, /実際の作業時間とは無関係/], /作業時間を確認し.*時間単価/),
  ],
  69: fixed([/ニッチ戦略/, /マーケットチャレンジャ/, /マーケットリーダ/, /マーケットフォロワ/],
    [/トップシェア奪取/, /総市場規模を拡大/, /参入しにくい特定の市場/, /迅速に模倣/], [/特定の市場/, /トップシェア奪取/, /総市場規模/, /迅速に模倣/]),
  70: fixed([/成長期/, /成熟期/, /衰退期/, /導入期/],
    [/売上も伸びるが.*投資/, /市場の細分化.*コストダウン/, /需要が減って.*撤退/, /需要は部分的.*新規需要開拓/],
    [/売上も伸びるが.*投資/, /市場の細分化/, /需要が減って/, /需要は部分的/]),
  71: [
    reviewed(/^TLO.*承認又は認定/, [/共同研究を受け入れる窓口/, /補助金を支給/, /大学の研究成果を特許化/, /民間企業が保有する休眠特許/], /大学の研究成果を特許化/),
    reviewed(/大学で新しい測定技術/, [/大学の研究成果の特許化.*実施許諾/, /研究費を一律/, /委託研究を受け付けるだけ/, /民間企業同士の休眠特許/], /大学の研究成果の特許化.*実施許諾/),
    reviewed(/既に特許を取得した加工技術/, [/研究助成の採択だけ/, /大学の特許.*ライセンス交渉/, /既に取得された特許には関与しない/, /企業から大学に技術を移す/], /大学の特許.*ライセンス交渉/),
    reviewed(/大学のセンサ技術/, [/公的研究費の申請/, /大学の研究成果を取り扱わない/, /申込みを受けるだけ/, /大学の研究成果の権利関係.*技術移転/], /大学の研究成果の権利関係.*技術移転/),
  ],
  72: fixed([/ディジタルディバイド/, /電子民主主義/, /ユニバーサルサービス/, /ワンストップサービス/],
    [/利用する能力や機会.*格差/, /住民が直接.*政策に参画/, /地域の格差なく.*妥当な料金/, /すべてのサービスを1か所/],
    [/利用する能力や機会.*格差/, /住民が直接.*政策に参画/, /地域の格差なく.*妥当な料金/, /すべてのサービスを1か所/]),
  73: [
    reviewed(/デビットカード/, [/後払い方式/, /カード内で残高管理/, /前払い方式/, /預金口座から即時/], /預金口座から即時/),
    reviewed(/一括払いを指定したクレジットカード/, [/購入した後.*所定の支払日/, /カード内で残高を管理/, /サーバで残高を管理/, /預金口座から即時/], /購入した後.*所定の支払日/),
    reviewed(/通信回線が途絶.*IC型のプリペイドカード/, [/後日まとめて/, /カード内残高から/, /サーバ上の残高から/, /預金口座から即時/], /カード内残高から/),
    reviewed(/未使用額を新しいカード.*サーバ管理型のプリペイドカード/, [/後日まとめて/, /端末がカードの残高を/, /発行者のサーバ上の残高/, /預金口座から.*即時/], /発行者のサーバ上の残高/),
  ],
  74: [
    reviewed(/組込みシステムの用途として，適切でない/, [/FA機器又は医療機器/, /音響・映像機器/, /ATM端末/, /座席予約.*ホスト/], /座席予約.*ホスト/),
    reviewed(/交通機関.*適切でない/, [/データセンターで集計/, /自動改札機/, /車載装置/, /券売機の端末/], /データセンターで集計/),
    reviewed(/医療機関.*適切でない/, [/輸液機器内/, /診療予約を集中管理/, /生体情報モニター/, /照射タイミング/], /診療予約を集中管理/),
    reviewed(/工場の設備.*適切でない/, [/加工機の刃物/, /カメラ内の装置/, /全社向けに統合管理/, /搬送設備の制御装置/], /全社向けに統合管理/),
  ],
  75: fixed([/M&A/, /職能別組織/, /社内ベンチャ/, /事業部制組織/],
    [/機能別に分業.*専門化/, /技術やノウハウを獲得/, /自律感.*既存事業からの影響/, /独立採算制.*利益責任/],
    [/技術やノウハウを獲得/, /機能別に分業.*専門化/, /自律感.*既存事業からの影響/, /独立採算制.*利益責任/]),
  78: [
    reviewed(/^著作権法.*保護の対象とならない/, [/フリーソフトウェア/, /操作マニュアル/, /^データベース$/, /プログラム言語や規約/], /プログラム言語や規約/),
    reviewed(/プログラムの開発.*保護の対象とならない/, [/言語の文法そのもの/, /創作性のあるソースコード/, /独自の文章と挿絵/, /検索体系に創作性/], /言語の文法そのもの/),
    reviewed(/制作物と設計上の取り決め.*保護の対象とならない/, [/独自に執筆/, /記号を組み合わせる際の規約そのもの/, /無償公開したプログラムの創作性/, /情報の選択に創作性/], /規約そのもの/),
    reviewed(/作るために使うものと制作したもの.*保護の対象とならない/, [/創作性のある画像処理プログラム/, /独自に表現した.*教材/, /解法そのもの/, /体系的な構成に創作性/], /解法そのもの/),
  ],
  79: fixed([/^特許権/, /^商標権/, /^意匠権/, /^著作権/],
    [/産業上利用.*新規の発明/, /他人の商品と識別.*標識/, /形・色・模様・配置/, /文芸，学術，美術又は音楽/],
    [/新規の発明/, /他人の商品と識別.*標識/, /形・色・模様・配置/, /文芸，学術，美術又は音楽/]),
  80: [
    reviewed(/^“コンピュータ不正アクセス対策基準”に適合/, [/すべてのネットワークを相互接続/, /個人間で共有/, /すべての権限.*常に使用/, /方針を文書化し，定期的に研修/], /方針を文書化し，定期的に研修/),
    reviewed(/複数の部署のLAN.*対策基準.*に適合/, [/接続だけを認め.*アクセスを制御/, /一つの利用者IDを共有/, /無条件で接続/, /全権限.*日常業務/], /接続だけを認め.*アクセスを制御/),
    reviewed(/交代勤務で端末を共用.*対策基準.*に適合/, [/同じ利用者ID/, /IDは個人ごと.*操作した人を識別/, /管理者権限を常時/, /研修|教育は行わず/], /IDは個人ごと.*操作した人を識別/),
    reviewed(/保守担当者が日常業務と管理作業.*対策基準.*に適合/, [/保守担当者全員で共用/, /日常業務でも全権限/, /一般権限.*必要な管理作業でだけ/, /どの部署からも自由/], /一般権限.*必要な管理作業でだけ/),
  ],
};

const numeric = (value: string) => Number(value.replaceAll(',', ''));
function numericChoices(choices: readonly string[], minimumGap: number) {
  const numbers = choices.map(numeric);
  assert.ok(numbers.every(Number.isSafeInteger));
  for (let index = 1; index < numbers.length; index++) assert.ok(numbers[index] - numbers[index - 1] >= minimumGap);
  return numbers;
}
function scoringReference(rows: string[][], choices: string[], index: number) {
  const levels = new Map([
    ['予定どおりの効果があった', 3], ['ほぼ予定どおりの効果があった', 2],
    ['部分的には改善された', 1], ['従来と変わらない', 0],
  ]);
  assert.deepEqual(rows.map(row => row[0]), ['省力化効果', '期間の短縮', '情報の統合化']);
  const individualRatings = rows.flatMap(([, weight, judgement]) => {
    const level = levels.get(judgement);
    assert.notEqual(level, undefined);
    return Array<number>(Number(weight)).fill(level!);
  });
  const baseScores = [36, 48, 32, 52];
  assert.equal(individualRatings.length, 25);
  const lostPoints = individualRatings.reduce((sum, rating) => sum + (3 - rating), 0);
  const percentage = 100 - lostPoints * 4 / 3;
  assert.equal(percentage, baseScores[index]);
  const options = numericChoices(choices, 6);
  if (index > 0) {
    const earned = individualRatings.length * 3 - lostPoints;
    const unweighted = Math.round(rows.reduce((sum, row) => sum + levels.get(row[2])!, 0) * 100 / 9);
    const misread = Math.round(percentage + (index === 1 ? 1 : -1) * Number(rows[2][1]) * 4 / 3);
    assert.deepEqual(new Set(options), new Set([percentage, earned, unweighted, misread]));
  }
  return options.map(choice => choice === percentage);
}
function abcReference(rows: string[][], choices: string[], index: number) {
  const products = rows.slice(0, -1).map(row => row.map(numeric));
  assert.deepEqual(products.map(product => product[0]), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (const [, count, price, sales] of products) assert.equal(sales / count, price);
  const inventory = products.reduce((total, product) => total + product[1], 0);
  const turnover = products.reduce((total, product) => total + product[3], 0);
  assert.deepEqual(rows.at(-1), ['合計', String(inventory), '', turnover.toLocaleString('en-US')]);
  if (index === 0) assert.deepEqual(products.map(product => product[3]), [220, 2400, 40, 130, 600, 25, 20, 300, 40, 50]);
  // Match each proposed pair against every omitted item. Both members must be larger
  // than every omitted item, and the cutoff must be between one and two items.
  assert.deepEqual(choices, ['1と2', '2と5', '2と6', '4と8']);
  return choices.map(choice => {
    const pair = new Set(choice.split('と').map(Number));
    const selected = products.filter(product => pair.has(product[0])).map(product => product[3]);
    const outside = products.filter(product => !pair.has(product[0])).map(product => product[3]);
    const lower = Math.min(...selected);
    const higher = Math.max(...selected);
    return lower > Math.max(...outside) && higher / turnover < 0.75 && (lower + higher) / turnover >= 0.75;
  });
}
function fifoReference(rows: string[][], choices: string[], index: number) {
  assert.deepEqual(rows.map(row => row.slice(0, 2)), [['4月1日', '前月繰越'], ['4月5日', '購入'], ['4月10日', '払出']]);
  const inventory: number[] = [];
  for (const row of rows.slice(0, 2)) {
    const [count, price, total] = row.slice(2).map(numeric);
    assert.equal(total / count, price);
    inventory.push(...Array<number>(count).fill(price));
  }
  assert.deepEqual(rows[2].slice(3), ['', '']);
  const issued = numeric(rows[2][2]);
  const withdrawn = inventory.slice(0, issued);
  assert.equal(withdrawn.length, issued);
  assert.equal(new Set(withdrawn).size, 2);
  const expenditure = withdrawn.reduce((sum, unit) => sum + unit, 0);
  assert.equal(expenditure / issued, [110, 130, 126, 140][index]);
  const options = numericChoices(choices, 3);
  const arithmeticMean = (inventory[0] + inventory.at(-1)!) / 2;
  const inventoryMean = inventory.reduce((sum, unit) => sum + unit, 0) / inventory.length;
  assert.deepEqual(new Set(options), new Set([expenditure / issued, inventory[0], arithmeticMean, inventoryMean]));
  return options.map(choice => choice * issued === expenditure);
}

test('公式の問番号に対応する25件だけが生成対象になる', () => {
  assert.equal(official.length, 27);
  assert.deepEqual(definitions.map(definition => Number(definition.source.split('-').at(-1))),
    Array.from({ length: 27 }, (_, offset) => offset + 54).filter(number => !held.has(number)));
});

for (const definition of definitions) {
  const number = Number(definition.source.split('-').at(-1));
  test(`2009年度春期旧午前・問${number}の公式正答・全入力・全選択肢`, () => {
    assert.equal(definition.sourceAnswer, official[number - 54]);
    assert.deepEqual(definition.reference, [0]);
    for (const values of [[], [0, 1], [-1], [4], [0.5], [Number.NaN]]) assert.throws(() => definition.build(values));
    const semanticInputs = new Set<string>();
    const answers = new Set<number>();
    for (const index of cases) {
      const body = definition.build([index]);
      const prompt = body.prompt[0];
      assert.equal(prompt.type, 'paragraph');
      const choices = body.choices.map(blocks => {
        assert.equal(blocks.length, 1);
        assert.equal(blocks[0].type, 'paragraph');
        return blocks[0].text;
      });
      assert.equal(new Set(choices).size, 4);
      assert.ok(body.explanation.length >= 40);
      semanticInputs.add(JSON.stringify(body.prompt));
      let truth: boolean[];
      if (number === 63) {
        assert.deepEqual(body.prompt.map(block => block.type), ['paragraph', 'diagram']);
        const figure = body.prompt[1];
        assert.equal(figure.type, 'diagram');
        assert.equal(figure.alt, 'ステップ1：改善目的の確認 → ステップ2：A → ステップ3：B → ステップ4：C → ステップ5：D → ステップ6：実施と効果の確認');
        const [, letter] = /([A-D])に該当/.exec(prompt.text) ?? [];
        assert.ok(letter);
        const operationalOrder = ['問題の把握', '改善目標の設定', '改善案の策定', '改善案の評価'];
        assert.deepEqual(new Set(choices), new Set(operationalOrder));
        truth = choices.map(choice => choice === operationalOrder[letter.charCodeAt(0) - 65]);
      } else if (number === 64 || number === 76 || number === 77) {
        assert.deepEqual(body.prompt.map(block => block.type), number === 64 ? ['paragraph', 'table', 'paragraph'] : ['paragraph', 'table']);
        const table = body.prompt[1];
        assert.equal(table.type, 'table');
        if (number === 64) {
          assert.deepEqual(table.columns, ['評価項目', '重み', '判定内容']);
          const scale = body.prompt[2];
          assert.equal(scale.type, 'paragraph');
          assert.match(scale.text, /3：予定どおり.*2：ほぼ予定どおり.*1：部分改善.*0：変わらず/);
          truth = scoringReference(table.rows, choices, index);
        } else if (number === 76) {
          assert.deepEqual(table.columns, ['商品番号', '年間販売数', '単価', '年間売上高']);
          assert.match(prompt.text, index === 0 ? /^取扱商品をABC分析/ : /降順に累計し，初めて全体の75％以上/);
          truth = abcReference(table.rows, choices, index);
        } else {
          assert.deepEqual(table.columns, ['取引日', '取引内容', '数量（個）', '単価（円）', '金額（円）']);
          assert.match(prompt.text, /先入先出法.*4月10日/);
          truth = fifoReference(table.rows, choices, index);
        }
      } else {
        assert.equal(body.prompt.length, 1);
        const fact = facts[number]?.[index];
        assert.ok(fact, '全ての知識問題には独立した査読事実がある');
        assert.match(prompt.text, fact.question);
        for (const description of fact.options) assert.equal(choices.filter(choice => description.test(choice)).length, 1);
        for (const choice of choices) assert.equal(fact.options.filter(description => description.test(choice)).length, 1);
        truth = choices.map(choice => fact.trueDescription.test(choice));
      }
      assert.equal(truth.filter(Boolean).length, 1, '査読・検算で正答の一意性が成立する');
      assert.equal(body.correctIndex, truth.indexOf(true));
      if (index === 0) assert.equal('アイウエ'[body.correctIndex], official[number - 54]);
      answers.add(body.correctIndex);
    }
    assert.equal(semanticInputs.size, 4, '四つの入力で本文又は図表が変化する');
    assert.ok(answers.size > 1, '本文又は図表の違いで正答も変化する');
  });
}

test('問63の六つの箱・五つの矢印・読み上げ内容が全入力で一致する', () => {
  const [figure] = legacy2009SpringAm5480Figures;
  const [renderer] = legacy2009SpringAm5480FigureRenderers;
  assert.equal(renderer.profile, figure.profile);
  assert.deepEqual(figure.domain, [[0, 3]]);
  for (const input of cases) {
    figure.validate([input]);
    const markup = renderToStaticMarkup(createElement(renderer.component, { caption: '業務改善の六つのステップ', values: [input] }));
    assert.match(markup, /role="img".*aria-labelledby=.*aria-describedby/);
    assert.equal((markup.match(/<rect /g) ?? []).length, 6);
    assert.equal((markup.match(/<path /g) ?? []).length, 5);
    assert.match(markup, />改善目的の確認<.*>A<.*>B<.*>C<.*>D<.*>実施と効果の確認</);
    assert.ok(markup.includes(figure.alt([input])));
  }
});
