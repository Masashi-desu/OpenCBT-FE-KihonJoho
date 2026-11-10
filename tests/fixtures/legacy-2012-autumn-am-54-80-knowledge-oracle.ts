type Concept = readonly [role: string, claim: RegExp];
type Prompt = readonly [topic: RegExp, correctRole: string, rationale: RegExp];
type KnowledgeOracle = { readonly choices: readonly Concept[]; readonly prompts: readonly Prompt[] };

// Human-reviewed classifications. The test identifies the role of each
// displayed choice, and then evaluates all four roles against the stem.
export const autumn2012Am5480Oracle: Readonly<Record<number, KnowledgeOracle>> = {
  55: {
    choices: [
      ['interface', /新旧システム間を接続/], ['parallel-switch', /並行させて運用し，ある時点で/],
      ['cutover-impact', /移行時のトラブルの影響が大きい/], ['parallel-cost', /稼働させるための運用コスト/],
    ],
    prompts: [
      [/一斉移行方式/, 'cutover-impact', /まとめて移る.*全体に及びやすい/],
      [/段階移行方式.*切替済み.*データ授受/, 'interface', /移行済み.*新システム.*未移行.*旧システム.*接続/],
      [/並行移行方式.*切替手順/, 'parallel-switch', /新旧システムで運用する期間.*切り替える/],
      [/並行移行方式.*運用コスト/, 'parallel-cost', /双方に保守・監視.*二重運用費/],
    ],
  },
  57: {
    choices: [
      ['approval', /変更結果を責任者が承認|コード変更の内容を責任者が確認/],
      ['access', /アクセスコントロールの設定|閲覧を許可された担当者/],
      ['cost', /導入コストが適正/], ['owner', /開発部門が選定/],
    ],
    prompts: [
      [/機密性のチェックポイント/, 'access', /許可されていない者に読まれない.*閲覧権限/],
      [/完全性のチェックポイント/, 'approval', /責任者によって承認.*意図しない変更/],
      [/経済性のチェックポイント/, 'cost', /導入コストが適正/],
    ],
  },
  58: {
    choices: [
      ['age', /運用開始時期の順|運用を開始した日が最も古い|運用開始の時期が最も早い/],
      ['audit-cost', /監査実施体制|人員が最も少ない|費用が最も少ない/],
      ['sample', /無作為に抽出|無作為に一つ|抽選で一つ/],
      ['combined', /可能性とその影響の大きな/], ['likelihood', /可能性が最も大きい/],
      ['impact', /事業への影響が最も大きい/],
    ],
    prompts: [
      [/^リスクアセスメントに基づく/, 'combined', /可能性と発生時の影響を組み合わせ/],
      [/発生した場合の影響は同程度/, 'likelihood', /影響が同程度なら.*可能性が最も大きい/],
      [/発生する可能性は同程度/, 'impact', /発生可能性が同程度なら.*影響が最も大きい/],
    ],
  },
  59: {
    choices: [
      ['useful', /経営効率の改善に役立って/], ['managed', /記録媒体に秘密を意味する表示/],
      ['unpublished', /刊行物に掲載されていない/], ['public-order', /公序良俗に反していない/],
    ],
    prompts: [
      [/秘密管理性のチェックポイント/, 'managed', /秘密と認識できる措置.*記録媒体上の秘密表示/],
      [/有用性のチェックポイント/, 'useful', /事業活動に役立つ/],
      [/非公知性のチェックポイント/, 'unpublished', /一般に知られていない/],
    ],
  },
  60: {
    choices: [
      ['continuity', /サーバ.*二重化/], ['function', /複数件まとめて検索/],
      ['rights', /特権アカウント.*だけ|閲覧が許可された担当者だけ/],
      ['input', /データ入力チェック|入力値が定められた範囲/],
    ],
    prompts: [
      [/可用性に該当/, 'continuity', /片方が故障しても利用を続け/],
      [/完全性の項目/, 'input', /誤データ.*登録する前に検出/],
      [/機密性に該当/, 'rights', /閲覧できる担当者を許可済みの者に限る/],
    ],
  },
  62: {
    choices: [
      ['erp', /財務，人事.*情報を一元管理/], ['bpm', /分析，設計，実行，改善.*継続的/],
      ['crm', /顧客データベース.*顧客に関する業務プロセス/], ['scm', /部品の供給から製品の販売.*在庫の削減/],
    ],
    prompts: [
      [/^BPMの説明/, 'bpm', /Business Process Management.*継続的に改善/],
      [/^ERPの説明/, 'erp', /Enterprise Resource Planning.*経営資源の全体最適/],
      [/^CRMの説明/, 'crm', /Customer Relationship Management.*顧客との接点/],
      [/^SCMの説明/, 'scm', /Supply Chain Management.*供給連鎖全体/],
    ],
  },
  63: {
    choices: [
      ['saas', /インターネット経由.*アプリケーションソフトウェアの機能/], ['erp', /基幹業務を統合的に管理/],
      ['bpr', /ビジネスプロセスを抜本的に見直し/], ['sla', /サービスの品質の内容について合意した文書/],
    ],
    prompts: [
      [/^SaaSを説明/, 'saas', /Software as a Service.*ネットワーク越し/],
      [/^ERPパッケージ/, 'erp', /Enterprise Resource Planning.*共通データで統合管理/],
      [/^BPRを説明/, 'bpr', /Business Process Reengineering.*根本から見直す/],
      [/^SLAを説明/, 'sla', /Service Level Agreement.*合意したサービス品質/],
    ],
  },
  65: {
    choices: [
      ['maintenance', /情報機器の保守費用/], ['planning', /戦略立案のコンサルティング費用/],
      ['implementation', /パッケージの導入費用/], ['requirements', /要件定義を行うシステムエンジニアの費用/],
    ],
    prompts: [
      [/ランニングコストに該当/, 'maintenance', /稼働後に運用・維持/],
      [/企画段階に該当/, 'planning', /導入する前の方向付け/],
      [/実現する要求を明確にする工程/, 'requirements', /機能や性能、制約を明確にする/],
    ],
  },
  67: {
    choices: [
      ['strength', /機能面における強み|コスト競争力|自社工場の製造原価が低い/],
      ['opportunity', /取引先業界.*需要が拡大/], ['threat', /新規参入による脅威|新しい競合企業が参入/],
      ['weakness', /品質における弱み|自社製品の故障率が高い/],
    ],
    prompts: [
      [/外部要因はどれか/, 'threat', /新規参入は外部の競争環境/],
      [/外部要因のうち，機会/, 'opportunity', /需要拡大.*有利な外部環境/],
      [/内部要因のうち，弱み/, 'weakness', /品質上の弱み.*不利な内部要因/],
    ],
  },
  68: {
    choices: [
      ['step', /利益最大，リスク最小|利益の見込みと損失の可能性/],
      ['discount', /値引きを前提|商談後に得たい取引額/],
      ['competition', /市場で競争可能|競合商品に対抗できる/],
      ['cost', /製造原価，営業費|製造と販売に掛かる費用/],
    ],
    prompts: [
      [/^コストプラス法/, 'cost', /コストを基に、確保したい利益を加え/],
      [/^競争志向型/, 'competition', /競合品の相場.*基準/],
      [/^取引での値引きを見込んで/, 'discount', /得たい取引額を先に決め.*上乗せ/],
    ],
  },
  69: {
    choices: [
      ['growth', /商品ラインもチャネルも拡大.*売上も伸びる/],
      ['maturity', /市場の細分化.*競争も激化/], ['decline', /需要が減ってきて，撤退/],
      ['introduction', /需要は部分的で，新規需要開拓/],
    ],
    prompts: [
      [/成長期の特徴/, 'growth', /需要の伸び.*品揃えや販路への投資/],
      [/成熟期の特徴/, 'maturity', /普及が進んだ市場で競争が激しく/],
      [/衰退期の特徴/, 'decline', /需要が減少し、市場から撤退/],
      [/導入期の特徴/, 'introduction', /広く知られておらず、初期需要が限られる/],
    ],
  },
  70: {
    choices: [
      ['relationship', /顧客ロイヤルティ.*顧客生涯価値/], ['stock', /在庫不足による販売機会損失/],
      ['materials', /資材の発注量と発注時期/], ['sale', /販売時点での商品ごとの販売情報/],
    ],
    prompts: [
      [/^CRMの目的/, 'relationship', /Customer Relationship Management.*顧客との長期的な関係/],
      [/^MRPの目的/, 'materials', /Material Requirements Planning.*いつどれだけ手配/],
      [/^POSシステムの目的/, 'sale', /Point of Sale.*商品別の販売時点情報/],
    ],
  },
  71: {
    choices: [
      ['share', /知識を共有化.*問題解決力/], ['flat', /組織の階層をできるだけ少なく/],
      ['benchmark', /業績を上げている企業との比較分析/], ['competence', /まねのできない.*強みを核/],
    ],
    prompts: [
      [/^ナレッジマネジメント/, 'share', /知識や経験を共有・再利用/],
      [/^組織をフラット化/, 'flat', /階層を減らし.*経路を短く/],
      [/^ベンチマーキング/, 'benchmark', /優れた実践や業績.*比較/],
      [/^コアコンピタンス/, 'competence', /模倣困難な組織の能力/],
    ],
  },
  72: {
    choices: [
      ['people', /情報の入手が困難な人々/], ['environment', /誰もが情報通信を利活用できるように整備された環境/],
      ['accessibility', /利用しやすくなっているかの度合い/], ['divide', /社会的又は経済的格差/],
    ],
    prompts: [
      [/^ディジタルディバイド/, 'divide', /条件の差から生じる社会的・経済的格差/],
      [/^情報アクセシビリティ/, 'accessibility', /どの程度利用できるかという性質/],
      [/^情報バリアフリー/, 'environment', /利用上の障壁をなくし.*使える環境/],
    ],
  },
  73: {
    choices: [
      ['volume', /大量生産が必要|一日に数万個|大量に供給/], ['constant', /仕様が長期間変わらない|長期間変更しない設計|製品ごとの仕様差がなく/],
      ['flexible', /多種類かつフレキシブル|注文ごとに組立手順やオプションが異なり|出荷先ごとに部品構成と検査項目が異なり/],
      ['division', /専門化による分業|各工程だけを繰り返す|一つの作業だけに専従/],
    ],
    prompts: [
      [/^セル生産方式の利点/, 'flexible', /品種の切替や生産量の変動/],
      [/品種と組立量が週ごとに変わる/, 'flexible', /段取りを品種に合わせて変えやすい/],
      [/取付けと検査を同じ担当組/, 'flexible', /検査手順が製品ごとに変わる.*調整しやすい/],
    ],
  },
  74: {
    choices: [['affiliate', /^アフィリエイト$/], ['optin', /^オプトイン$/], ['drop', /^ドロップシッピング$/], ['tail', /^ロングテール$/]],
    prompts: [
      [/あまり売れない商品の売上合計/, 'tail', /多数を合計すると無視できない売上/],
      [/紹介リンクを経由した注文/, 'affiliate', /成果に基づいて報酬/],
      [/広告メールの配信を始める前/, 'optin', /始める前に同意/],
      [/供給者から購入者に直接発送/, 'drop', /発送を担う供給者が購入者へ直接送る/],
    ],
  },
  75: {
    choices: [
      ['employability', /他社でも通用する技術・能力/], ['sharing', /労働を分かち合う/],
      ['discretionary', /実際の労働時間に関係なく.*労働時間とみなす/], ['pay', /職務と能力，業績を基準に報酬/],
    ],
    prompts: [
      [/^裁量労働制の説明/, 'discretionary', /専門業務型は労使協定、企画業務型は労使委員会/],
      [/^ワークシェアリング/, 'sharing', /仕事を分け、雇用機会の維持・創出/],
      [/^成果主義に基づく賃金制度/, 'pay', /達成した業績を報酬決定に反映/],
    ],
  },
  78: {
    choices: [
      ['pdpc', /事態の進展.*対応策を検討/], ['affinity', /相互の関連によってグループ化/],
      ['relations', /事象間の因果関係/], ['tree', /手段・方策を順次展開/],
    ],
    prompts: [
      [/^親和図法/, 'affinity', /内容の近さでグループ化/],
      [/^PDPC法/, 'pdpc', /Process Decision Program Chart.*問題を想定して対応策/],
      [/^連関図法/, 'relations', /どの事象がどの事象に影響/],
      [/^系統図法/, 'tree', /手段を階層的に細分化/],
    ],
  },
  79: {
    choices: [
      ['idea', /アルゴリズム/], ['expression', /コンパイラのプログラム|実装したプログラム/],
      ['language', /プログラム言語/], ['protocol', /プロトコル|送信規約|データ交換の規約/],
    ],
    prompts: [
      [/^著作権法で保護されるもの/, 'expression', /具体的な表現.*第3項/],
      [/^通信システムを開発したとき.*創作性/, 'expression', /創作性のある通信ソフトのプログラムの具体的な表現/],
      [/^画像変換ソフトを開発したとき.*創作性/, 'expression', /具体的な創作的表現/],
    ],
  },
  80: {
    choices: [
      ['employer', /休暇の変更を指示|年次有給休暇.*(?:取り消す|独自に変更)/],
      ['ignore', /対応はA社だけ|申し出を受け付けなかった|A社に連絡せず放置/],
      ['instruction', /仕事に関する指示を.*直接受ける|契約に定めた端末初期設定の作業手順/],
      ['outside', /派遣取決め以外|派遣契約の範囲外|契約外の配送業務/],
      ['cooperate', /苦情の内容をA社に伝え.*A社と協力/],
    ],
    prompts: [
      [/^派遣元会社A社と派遣先会社B社/, 'instruction', /A社が雇用し、派遣先B社が契約範囲の業務を指揮命令/],
      [/^2012年.*作業環境について.*苦情を申し出た/, 'cooperate', /A社へ内容を通知し、連携して処理/],
      [/^2012年.*端末の初期設定業務.*業務内容は変更していない/, 'instruction', /契約の範囲にある端末の初期設定の手順を直接指示/],
    ],
  },
};
