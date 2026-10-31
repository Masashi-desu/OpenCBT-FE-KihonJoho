import {legacy2017StrategyReview as source} from "./legacy-2017-strategy-review";
const original=(n:number)=>source.find(r=>r.number===n)!.choices;
/** Independent, manually reviewed whole option strings with actual mechanisms.
 * Do not import or regenerate this table from the producer. */
export const hostingReviewed=[
 {texts:original(63),mechanisms:["all-user-operations","provider-server-rights","deny-dedicated","user-hardware-in-provider-site"]},
 {texts:["利用者が作成した全てのアプリケーションの設定変更まで、契約内容にかかわらずサービス事業者が代行する。",original(63)[1],"複数の利用者が同じサーバを共有する方式だけに限られ、専用サーバを利用する方式は選択できない。","利用者が社内に設置し所有するサーバに、サービス事業者の担当者が訪問して保守だけを行う。"],mechanisms:["contract-independent-application-service","provider-server-rights","deny-dedicated","on-site-maintenance"]},
 {texts:["利用者の拠点に置かれた利用者所有のサーバに対して、サービス事業者は稼働監視と障害連絡の業務を提供する。",original(63)[1],"一つの利用者へサーバ一台を割り当てる提供形態は認めず、全ての利用者へ同じ環境だけを提供する。","利用者が社内に所有するサーバをインターネットへ接続するための通信回線を提供する。"],mechanisms:["remote-monitoring-of-user-hardware","provider-server-rights","deny-dedicated","network-access-for-user-hardware"]},
] as const;
export const byodReviewed=[
 {texts:original(64),conditions:[["organisation","work","loan","unspecified"],["organisation","private","unspecified","private-use"],["individual","private","individual","private-environment"],["individual","work","individual","personal-device"]]},
 {texts:["会社が所有し管理する情報機器の候補から従業員が業務で使う一台を選び、会社から貸与を受けること","会社が所有し管理する情報機器を、業務と会社が許可した私的な用途の両方に使用すること",original(64)[2],original(64)[3]],conditions:[["organisation","work","employee-approved-choice","organisation-managed"],["organisation","work-and-private","organisation","private-enabled"],["individual","private","individual","private-environment"],["individual","work","individual","personal-device"]]},
 {texts:["会社が機種を指定して購入し所有する情報機器を従業員に貸与し、業務用アプリの設定や更新を会社が管理すること","会社が所有し管理する情報機器を、私的な利用を認めず業務のためだけに使用させること",original(64)[2],original(64)[3]],conditions:[["organisation","work","company-specified","company-app-management"],["organisation","work","organisation","private-prohibited"],["individual","private","individual","private-environment"],["individual","work","individual","personal-device"]]},
] as const;
export const positionReviewed=[
 {name:"チャレンジャ",mechanism:"attack-leader-for-share"},
 {name:"フォロワ",mechanism:"imitate-and-follow-market"},
 {name:"ニッチャ",mechanism:"specialize-in-narrow-segment"},
 {name:"リーダ",mechanism:"whole-market-largest-share"},
] as const;
export const ansoffReviewed=[
 {market:"既存",product:"既存",strategy:"市場浸透"},
 {market:"既存",product:"新規",strategy:"製品開発"},
 {market:"新規",product:"既存",strategy:"市場開発"},
 {market:"新規",product:"新規",strategy:"多角化"},
] as const;
type ScoreFact={text:string;goal:{kind:"capability"|"organisation"|"customer"|"process";domain:string};measure:{kind:"learning"|"business";domain:string}};
export const scorecardReviewed:ScoreFact[][]=[
 [{text:original(70)[0],goal:{kind:"organisation",domain:"growth"},measure:{kind:"business",domain:"order-backlog"}},{text:"新規事業を担う従業員の企画能力の育成が目標であるので、企画能力に関する研修の受講時間を指標とする。",goal:{kind:"capability",domain:"planning"},measure:{kind:"learning",domain:"planning"}}],
 [{text:original(70)[1],goal:{kind:"customer",domain:"relationship"},measure:{kind:"business",domain:"complaints"}},{text:"顧客対応を担う従業員の対話能力の向上が目標であるので、対話能力に関する社内認定の取得者数を指標とする。",goal:{kind:"capability",domain:"dialogue"},measure:{kind:"learning",domain:"dialogue"}}],
 [{text:"製品開発の期間短縮が目標であるので、製品の開発期間の日数を指標とする。",goal:{kind:"process",domain:"development"},measure:{kind:"business",domain:"development-days"}},{text:original(70)[2],goal:{kind:"capability",domain:"development"},measure:{kind:"learning",domain:"development"}}],
 [{text:original(70)[3],goal:{kind:"process",domain:"delivery"},measure:{kind:"business",domain:"manufacturing-days"}},{text:"生産計画を担う従業員の計画技能の向上が目標であるので、計画技能の習得を確認する社内試験の合格者数を指標とする。",goal:{kind:"capability",domain:"production-planning"},measure:{kind:"learning",domain:"production-planning"}}],
];
export const mrpReviewed=[
 {target:"総所要量計算",stage:1,input:"部品構成表（最終製品における各部品の構成と所要量）"},
 {target:"正味所要量計算",stage:2,input:"在庫状況（在庫量、注文残、仕掛量）"},
 {target:"発注量計算",stage:3,input:"発注方針（ロット編成方法、発注方式、安全在庫量）"},
] as const;
export const kanbanReviewed=[
 {texts:original(72),mechanisms:["standardize-parts","affiliated-supplier","downstream-pulls-needed-parts","competitive-supplier-bids"]},
 {texts:["段取り替えの回数を減らすために、後工程で使われる量とは無関係に、同じ部品を一度に大量生産して後工程へ送る。","購入単価を下げるために、当面の生産で使う量より多くても、一年分の予測数量をまとめて仕入先へ発注する。",original(72)[2],"納入価格を比較するために、複数の業者から見積書を集め、最も低い価格を示した業者へ発注する。"],mechanisms:["push-batch-independent-of-use","annual-forecast-bulk-buy","downstream-pulls-needed-parts","price-comparison"]},
 {texts:["各設備の稼働率を最大にするために、後工程からの引取りがなくても、前工程は常に能力いっぱいまで部品を生産する。","複数の工場で使う部品を一括購入するために、本社が各工場の年間需要予測を合算し、仕入先へまとめて発注する。",original(72)[2],"特定の仕入先への依存を減らすために、同じ部品の購入量を複数の仕入先へ一定の比率で配分する。"],mechanisms:["produce-capacity-without-withdrawal","aggregate-annual-forecast","downstream-pulls-needed-parts","allocate-multiple-suppliers"]},
] as const;
export const legacy2017StrategyPrimaryFacts={checkedOn:"2026-10-19",sources:[
 {url:"https://csrc.nist.gov/pubs/sp/1800/22/final",publishedOn:"2023-09",read:"公式概要本文",fact:"BYODは個人所有の機器で業務を行うことという所有と用途の機能事実だけを補助確認。会社所有管理/個人所有と業務用途という原の区別を補助し、借用の私物を一律に除外する条件を作らず、セキュリティ設計や本文/図を転載しない。"},
 {url:"https://csrc.nist.gov/glossary/term/byod",read:"公式用語展開",fact:"Bring Your Own Deviceという正式展開を確認。各文書の文脈を確認するという同サイトの注意を維持。"},
 {url:"https://www.lean.org/lexicon-terms/kanban/",read:"定義/Production Kanban/Withdrawal Kanbanの本文",fact:"後工程の引取りと前工程への生産補充信号の向きという機能事実を確認。カード見本・例・図表・本文は再配布しない。"},
 {url:"https://www.chusho.meti.go.jp/pamflet/hakusyo/2023/chusho/b2_1_1.html",publishedOn:"2023",read:"成長に向けた既存事業拡大と新規事業創出の取組の本文",fact:"製品と市場の既存/新規の二軸という事実のみを確認。第三者書籍を出典とする図を取り込まず、原IPA問題の名称と形式を維持する。"},
 {url:"https://www.library.hbs.edu/working-knowledge/partnering-and-the-balanced-scorecard",publishedOn:"2003-01-27",read:"四視点と従業員skills/capabilitiesに関する本文",fact:"学習と成長が従業員の技能/能力に関わるという事実のみ。原IPAの目標と指標及び独自条件を個別に照合し、他者の論文本文/戦略図を転用しない。"},
 {url:"https://www.ascm.org/globalassets/ascm_website_assets/docs/ecm/ecm-cpim8.pdf",read:"公式練習資料のweb抽出内MRP Gridの項目",fact:"gross/net requirements、on-hand、scheduled receipts、lot sizeとlead timeが区別される機能事実の補助確認。APICSの問題本文/表/解答は取り込まない。原2017の全4括弧項目と接続が正本。"},
],limits:"補助一次資料は用語・機能の事実確認に限る。2017原の本文・全択・図・基準正答は当年度IPA原画像と解答例から固定し、後年の補助資料を原試験当時の仕様又は素材許諾の代用にしない。"};
