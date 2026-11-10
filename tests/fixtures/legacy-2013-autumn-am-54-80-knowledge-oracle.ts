/** Reviewed semantic witnesses for the knowledge choices.  This file neither
 * imports nor derives expectations from the installed question definitions. */
type Option = readonly [role: string, evidence: RegExp];
type Case = {
  stem: RegExp;
  askedRole: string;
  options: readonly Option[];
  explanation: RegExp;
};

function choose(stem: RegExp, askedRole: string, options: readonly Option[], explanation: RegExp): Case {
  return { stem, askedRole, options, explanation };
}

const estimate = [
  ['code-length', /ステップ数.*積算/],
  ['task-effort', /WBS.*各作業の工数/],
  ['functional-size', /外部入出力.*論理ファイル.*照会.*個数/],
  ['analogy', /過去の類似例.*実績と差異/],
] as const;

const evaluation = [
  ['after', /効果目標の達成状況.*改善策/],
  ['during', /実施計画と実績.*変更が必要/],
  ['prepare-method', /実現時期.*データ収集方法.*事前に計画/],
  ['before', /投資目的.*効果目標.*実施可否/],
] as const;

const optimization = [
  ['business-model', /全体業務.*情報の関連.*あるべき姿/],
  ['size-plan', /開発規模.*期間.*開発工数.*開発費用/],
  ['system-design', /ハードウェア.*ソフトウェア.*ネットワーク.*構成要素/],
  ['operating-document', /利用者マニュアル.*運用マニュアル.*業務手順/],
] as const;

const business = [
  ['internal-integration', /^ERP$/],
  ['delivered-app', /^SaaS$/],
  ['supply-chain', /^SCM$/],
  ['reporting-language', /^XBRL$/],
] as const;

const requirements = [
  ['manual-process', /手作業となる業務機能/],
  ['nonfunctional', /品質要件.*技術要件.*運用要件/],
  ['legacy-gap', /現行システムで不足している機能/],
  ['package-fit', /導入するパッケージの適合性/],
] as const;

const environment = [
  ['social-responsibility', /^CSR$/],
  ['certification', /^エコマーク認定$/],
  ['impact-analysis', /^環境アセスメント$/],
  ['purchase', /^グリーン購入$/],
] as const;

const analysis = [
  ['financial', /財務諸表.*収益性.*安全性/],
  ['swot', /強みと弱み.*機会と脅威/],
  ['position', /製品・サービスの市場での位置付け/],
  ['competitive-pricing', /価格設定.*市場での競争力/],
] as const;

const enterprise = [
  ['core', /競合他社にはまねのできない卓越した能力/],
  ['compliance', /法令や各種規制.*社会的規範.*遵守/],
  ['domain', /市場・技術・商品.*事業の展開領域/],
  ['architecture', /業務とシステムの全体最適化/],
] as const;

const cycle = [
  ['growth', /価値を理解し始める.*売上も伸びる.*投資/],
  ['maturity', /需要が大きく.*差別化.*市場の細分化.*競争.*コストダウン/],
  ['decline', /需要が減って.*撤退.*代替市場/],
  ['introduction', /需要は部分的.*新規需要開拓.*特定ターゲット/],
] as const;

const digital = [
  ['divide', /利用する能力や機会の違い.*経済的又は社会的な格差/],
  ['citizen-participation', /住民が直接.*政策に参画/],
  ['universal-service', /地域の格差なく.*平等に利用/],
  ['single-window', /全てのサービスを1か所で提供/],
] as const;

const communication = [
  ['message-standard', /OSI基本参照モデル.*電子メール.*メッセージの生成.*転送.*処理/],
  ['augmented-network', /データを蓄積.*フォーマットを変換.*付加価値/],
  ['trade-interchange', /商取引.*標準的な規約に基づいて交換/],
  ['ordering', /発注情報.*端末.*仕入先.*発注を行う/],
] as const;

const reading = [
  ['satellite-position', /GPSを利用.*位置情報/],
  ['magnetic-read', /専用の磁気読取り装置に挿入/],
  ['external-storage', /情報の記憶には外部記憶装置/],
  ['radio-read', /汚れに強く.*梱包の外から読む/],
] as const;

const company = [
  ['accountability', /株主やその他の利害関係者.*経営活動の内容・実績.*説明責任/],
  ['environmental-accounting', /環境保全に掛けた費用とその効果を定量化.*財務情報/],
  ['compliance', /ルール.*マニュアル.*チェックシステム.*法令.*遵守/],
  ['investor-relations', /投資家やアナリスト.*投資判断.*適時にかつ継続/],
] as const;

export const autumn2013AmKnowledgeOracle: Readonly<Record<number, readonly Case[]>> = {
  55: [
    choose(/ファンクションポイント法の説明/, 'functional-size', estimate, /利用者から見た機能/),
    choose(/^LOC法の説明/, 'code-length', estimate, /Lines of Code.*ステップ数/),
    choose(/^ボトムアップ見積りの説明/, 'task-effort', estimate, /作業を細分化.*集計/),
    choose(/^類推法による開発規模見積りの説明/, 'analogy', estimate, /類似案件の実績.*相違を調整/),
  ],
  56: [
    choose(/^SLAを策定する際の方針/, 'joint-feasibility', [
      ['all-metrics', /全ての項目.*サービスレベル/], ['joint-feasibility', /顧客及びサービス提供者のニーズ.*費用/],
      ['all-penalties', /全ての項目.*ペナルティ/], ['unchangeable', /将来にわたって変更が不要/],
    ], /Service Level Agreement.*必要性.*実現可能性.*費用/),
    choose(/夜間にオンライン受注.*費用には上限/, 'joint-priority', [
      ['max-for-all', /一律で最も高い水準/], ['all-penalties', /全ての項目.*補償だけ/],
      ['joint-priority', /受注停止の影響.*費用と提供能力.*時間帯別/], ['ignore-critical', /受注処理の時間帯は評価対象から外す/],
    ], /業務影響の大きい時間帯.*能力と費用/),
    choose(/繁忙期が変わり.*次期のSLA/, 'revise-service-level', [
      ['unchangeable', /前提が変わっても変更しない/], ['unilateral', /提供者が費用だけ/],
      ['penalty-only', /測定条件は変えず.*補償だけ/], ['revise-service-level', /業務影響と実績.*双方で見直す/],
    ], /新たな繁忙期.*双方で検討/),
  ],
  57: [
    choose(/^データのバックアップ方法/, 'avoid-collision', [
      ['avoid-collision', /重なるとレスポンス.*重ならないように/], ['same-medium', /同一記憶媒体内/],
      ['infer-faster', /復旧時間を短く.*差分バックアップ/], ['random-access-retention', /長期保存.*ランダムアクセス/],
    ], /重なる時間を避ける.*同じ媒体の故障/),
    choose(/記憶装置の故障時.*同じ装置上にコピー/, 'independent-medium', [
      ['later-time', /同じ装置へコピーする時刻/], ['independent-medium', /独立した媒体.*復元を確認/],
      ['rename', /同じ装置内.*ファイル名だけ/], ['random-access', /同じ装置.*ランダムアクセス/],
    ], /故障を共にしない媒体.*戻せる/),
    choose(/完全バックアップ.*差分バックアップ.*2時間以内/, 'measure-restoration', [
      ['success-log', /成功ログだけ/], ['rename', /同一媒体上でファイル名を変え/],
      ['measure-restoration', /完全バックアップと必要な差分を試験環境で復元.*所要時間/], ['skip-recovery', /ランダムアクセス.*復元手順の確認を省く/],
    ], /完全バックアップと直近の差分を実際に復元/),
  ],
  59: [
    choose(/^アクセス制御を監査する/, 'independent-evidence', [
      ['keep-register', /管理表の作成と保管/], ['independent-evidence', /管理状況の確認/],
      ['set-policy', /管理方針の制定/], ['operate', /運用管理の実施/],
    ], /独立した立場から評価/),
    choose(/退職者のアカウントが廃止/, 'independent-evidence', [
      ['independent-evidence', /退職日と廃止記録を照合/], ['keep-register', /台帳を自ら作成.*保管/],
      ['set-policy', /廃止方針を自ら制定/], ['operate', /アカウントを自ら停止/],
    ], /退職の記録とアカウント廃止の記録を照合/),
    choose(/特権IDのアクセスを監査/, 'independent-evidence', [
      ['keep-register', /管理表を自ら更新/], ['set-policy', /承認基準を制定/],
      ['operate', /自ら権限を付与/], ['independent-evidence', /使用ログと承認記録を照合/],
    ], /使用ログと承認記録を照合.*評価/),
  ],
  60: [
    choose(/^システム監査で実施するヒアリング/, 'corroborate', [
      ['manager-only', /管理者の中から.*対象者/], ['corroborate', /裏付けるための文書や記録を入手/],
      ['direct-work', /その場で.*改善を指示/], ['single-auditor', /1人のシステム監査人が行う/],
    ], /実施記録や原資料.*裏付ける/),
    choose(/管理者と作業担当者の説明が食い違った/, 'corroborate', [
      ['rank-only', /管理者の説明だけ/], ['worker-only', /作業担当者の説明だけ/],
      ['corroborate', /処理記録を入手して両者の説明/], ['direct-work', /その場で業務手順の変更を指示/],
    ], /食い違い.*業務の記録で裏付ける/),
    choose(/管理手順を決めた者と実際に夜間対応した者が異なる/, 'include-relevant-roles', [
      ['include-relevant-roles', /手順を決めた者と実際の対応者の双方/], ['manager-only', /管理者だけに対象を限定/],
      ['direct-work', /新しい障害対応をその場で指示/], ['discard-evidence', /記録を調べる必要はない/],
    ], /役割に応じて対象者.*障害記録も併用/),
  ],
  61: [
    choose(/事前評価について説明/, 'before', evaluation, /意思決定より前.*効果目標/),
    choose(/中間評価について説明/, 'during', evaluation, /実施途中.*計画と実績の差異/),
    choose(/事後評価について説明/, 'after', evaluation, /完了後.*実際に得られた効果/),
  ],
  63: [
    choose(/全体最適化計画策定.*業務モデル/, 'business-model', optimization, /全体業務と情報の関係/),
    choose(/システム化計画.*概算見積り/, 'fund-plan', [
      optimization[0], ['fund-plan', /想定した期間・工数・費用.*人員と予算を確保/], optimization[2], optimization[3],
    ], /期間・工数・費用.*人員・予算・日程/),
    choose(/システム方式設計/, 'system-design', optimization, /機器・ソフトウェア・ネットワーク/),
    choose(/切替えに伴う教育.*稼働後に担当者が行う業務/, 'operating-document', optimization, /実際の業務手順を確認し文書化/),
  ],
  64: [
    choose(/インターネット.*サービスプロバイダ.*アプリケーション.*オンライン/, 'delivered-app', business, /Software as a Service.*ネットワーク経由/),
    choose(/会計，販売，在庫，人事.*共通のデータ.*経営資源/, 'internal-integration', business, /Enterprise Resource Planning.*基幹業務/),
    choose(/原材料の調達先から小売まで.*需要・在庫・納期/, 'supply-chain', business, /Supply Chain Management.*調達から販売/),
    choose(/財務報告.*タグ.*機械処理/, 'reporting-language', business, /eXtensible Business Reporting Language/),
  ],
  65: [
    choose(/^非機能要件定義を説明/, 'nonfunctional', requirements, /応答時間.*利用可能時間.*運用方法/),
    choose(/^フィット＆ギャップ分析を説明/, 'package-fit', requirements, /導入候補が業務要件を満たすか/),
    choose(/^業務プロセス設計を説明/, 'manual-process', [
      ['manual-process', /業務の手順.*人が行う工程.*システムが受け持つ工程/], ...requirements.slice(1),
    ], /業務の流れと実施主体/),
  ],
  66: [
    choose(/国や地方公共団体.*環境への配慮.*製品・サービスを選ぶ/, 'purchase', environment, /製品・サービスを選んで調達/),
    choose(/第三者が審査.*環境ラベルの表示/, 'certification', environment, /製品やサービスの環境配慮を基準に従い審査/),
    choose(/道路建設を行う前.*大気，騒音，生態系.*調査・予測/, 'impact-analysis', environment, /事業の実施前に環境への影響.*予測・評価/),
    choose(/人権や取引先・地域社会への影響.*責任を持つ/, 'social-responsibility', environment, /Corporate Social Responsibility/),
  ],
  67: [
    choose(/^SWOT分析を説明/, 'swot', analysis, /Strengths.*Weaknesses.*Opportunities.*Threats/),
    choose(/^財務諸表分析を説明/, 'financial', analysis, /貸借対照表・損益計算書.*安全性や収益性/),
    choose(/^製品の市場ポジショニングの分析を説明/, 'position', analysis, /市場でどのように位置付け/),
    choose(/^競合価格ベンチマーキングを説明/, 'competitive-pricing', analysis, /競合価格.*自社製品の価格設定/),
  ],
  68: [
    choose(/^コアコンピタンスの説明/, 'core', enterprise, /まねできない.*中核的な能力/),
    choose(/^コンプライアンス経営の説明/, 'compliance', enterprise, /法令、規則、社会的な規範を守って/),
    choose(/^事業ドメインの説明/, 'domain', enterprise, /市場.*商品・技術.*事業を展開/),
    choose(/^エンタープライズアーキテクチャの説明/, 'architecture', enterprise, /Enterprise Architecture.*全体として設計・最適化/),
  ],
  70: [
    choose(/成熟期の特徴/, 'maturity', cycle, /市場細分化・製品差別化・コスト低減/),
    choose(/成長期の特徴/, 'growth', cycle, /販売が伸び.*流通経路.*投資/),
    choose(/衰退期の特徴/, 'decline', cycle, /需要が減り.*撤退/),
    choose(/導入期の特徴/, 'introduction', cycle, /市場がまだ狭く.*新しい需要/),
  ],
  71: [
    choose(/^ディジタルディバイドを説明/, 'divide', digital, /機会や能力の差.*経済的・社会的な格差/),
    choose(/^電子民主主義を説明/, 'citizen-participation', digital, /住民が政策に直接参加/),
    choose(/^ユニバーサルサービスを説明/, 'universal-service', digital, /地域によらず利用可能/),
    choose(/^ワンストップサービスを説明/, 'single-window', digital, /複数のサービスを一か所で/),
  ],
  72: [
    choose(/^EDIを説明/, 'trade-interchange', communication, /Electronic Data Interchange.*規約でコンピュータ間交換/),
    choose(/^VANを説明/, 'augmented-network', communication, /Value Added Network.*データ蓄積や形式変換/),
    choose(/^EOSを説明/, 'ordering', communication, /Electronic Ordering System.*端末から発注情報/),
    choose(/^X\.400のメッセージ処理システムを説明/, 'message-standard', communication, /メッセージを作成・転送・処理する国際標準/),
  ],
  73: [
    choose(/^ICタグ（RFID）の特徴/, 'radio-read', reading, /Radio Frequency Identification.*包装を開けず/),
    choose(/^GPS端末の特徴/, 'satellite-position', [
      ['satellite-position', /複数の衛星から受けた信号.*受信地点の位置/], ...reading.slice(1),
    ], /Global Positioning System.*衛星から受信した信号/),
    choose(/^磁気ストライプカードの特徴/, 'magnetic-read', [
      reading[0], ['magnetic-read', /カード上に記録した情報.*磁気ヘッド/], ...reading.slice(2),
    ], /磁気ストライプに記録.*磁気ヘッド/),
  ],
  74: [
    choose(/^経営層のアカウンタビリティを説明/, 'accountability', company, /利害関係者へ説明する責任/),
    choose(/^企業の環境会計を説明/, 'environmental-accounting', company, /環境保全への費用や効果を把握・定量化/),
    choose(/^コンプライアンス経営を説明/, 'compliance', company, /法令や企業倫理に従って.*ルール・点検体制/),
    choose(/^IRを説明/, 'investor-relations', company, /Investor Relations.*投資判断に必要な情報/),
  ],
  80: [
    choose(/^個人情報に関する記述のうち，個人情報保護法/, 'identified-address', [
      ['identified-address', /特定の個人を識別できるメールアドレス.*は，個人情報である/],
      ['deny-identified-review', /業績評価.*識別できる情報.*個人情報ではない/],
      ['deny-published-person', /既に公表.*個人の氏名.*個人情報ではない/],
      ['claim-company-info', /法人の本店住所.*代表電話番号.*個人情報である/],
    ], /識別可能な生存個人.*メールアドレスは該当/),
    choose(/平成25年当時.*共用アドレスと社員の業績評価/, 'identified-review', [
      ['claim-shared-address', /特定の個人に対応せず.*容易に照合することもできない.*個人情報である/],
      ['identified-review', /本人を識別できる社員の業績評価は，個人情報である/],
      ['deny-published-person', /新聞で公表.*個人情報ではない/],
      ['claim-company-info', /法人の支店住所と代表電話番号.*必ず個人情報/],
    ], /業績評価も、個人を識別できるなら/),
    choose(/平成25年当時.*広報資料と業務記録/, 'identified-published-person', [
      ['claim-company-info', /法人だけを表す本店所在地と資本金.*個人情報である/],
      ['deny-identified-review', /氏名付きの人事評価.*個人情報ではない/],
      ['identified-published-person', /公表済み.*生存する特定の本人を識別できる場合は個人情報である/],
      ['claim-unlinkable-aggregate', /個人を識別できず.*照合することもできない.*地域別の合計値は，個人情報である/],
    ], /公表されていても特定の生存個人を識別できる情報/),
  ],
};
