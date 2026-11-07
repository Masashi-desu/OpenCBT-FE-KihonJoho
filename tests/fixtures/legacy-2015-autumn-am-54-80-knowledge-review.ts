/** Independently reviewed stem and claim anchors. The truth is an independent
 * judgement about each claim under the displayed condition. */
type CaseReview = readonly [
  stem: string,
  claims: readonly [string, string, string, string],
  truths: readonly [boolean, boolean, boolean, boolean],
  explanation: string,
];

const onlyFirst = [true, false, false, false] as const;
const onlySecond = [false, true, false, false] as const;
const onlyThird = [false, false, true, false] as const;
const onlyFourth = [false, false, false, true] as const;

const risk = ['回避', '軽減', '受容', '転嫁'] as const;
const safety = ['必要な機能を維持', '待機しているシステムに切り替えて', '安全に停止', '誤った操作'] as const;
const repository = ['変更結果を責任者が承認', 'アクセスコントロールの設定', '導入コストが適正', '開発部門が選定'] as const;
const sheet = ['作成者と利用者が同一', 'バックアップ', '文書化され検証', '利用者が定められて'] as const;
const architecture = ['データ間の関連や構造', 'システムの機能や構成', '技術的構成要素', '業務プロセスや情報の流れ'] as const;
const techniques = ['営業の効率と品質', 'コアビジネス以外の業務を外部', 'ビジネスプロセスをデザインし直す', 'サービスを組み合わせる'] as const;
const data = ['データウェアハウス', 'データディクショナリ', 'データフローダイアグラム', 'データマイニング'] as const;
const market = ['マーケットチャレンジャ', 'マーケットニッチャ', 'マーケットフォロワ', 'マーケットリーダ'] as const;
const strategy = ['機会・脅威と事業の強み・弱み', '他社の動き，自社の動き', 'マーケティングツールの最適な組合せ', '市場の成長性と占有率'] as const;
const lifecycle = ['商品ラインもチャネルも拡大', '新品種の追加やコストダウン', '撤退する企業', '新規需要開拓'] as const;
const officers = ['財務戦略の立案と遂行', '研究開発方針の立案と実施', '法令遵守の体制の構築と運用', 'ITサービス活用の促進'] as const;

export const knowledgeReview: Partial<Record<number, readonly CaseReview[]>> = {
  // An insurance contract changes who carries the impact, unlike the other three responses.
  54: [
    ['損害賠償保険に加入', risk, onlyFourth, '契約で定めた損害の金銭的負担'],
    ['脅威が存在しない方式', risk, onlyFirst, '危険を伴う作業自体をなくす'],
    ['作業ミスの発生確率を下げる', risk, onlySecond, '発生確率を下げる'],
    ['予防策や契約を追加せず', risk, onlyThird, '自組織で負担'],
  ],
  // Retained functions, switching, safe stop and preventing bad operation are distinct criteria.
  56: [
    ['フェールセーフ', safety, onlyThird, '安全な状態へ移行'],
    ['フェールソフト', safety, onlyFirst, '必要な機能を残して'],
    ['フェールオーバー', safety, onlySecond, '待機系へ切り替える'],
    ['フールプルーフ', safety, onlyFourth, '誤操作による異常を防ぐ'],
  ],
  // Receipt is verified at transfer, the originating department authorises corrections,
  // original documents remain traceable, and reconciliation is independent of input.
  57: [
    ['業務部門が起票した入力原票', ['処理結果リストを業務部門に送付', '入力担当者だけの判断', '処理期日直前に一括', '入力後直ちに廃棄'], onlyFirst, '原票ごとの内容と処理結果を突き合わせ'],
    ['原票を受け渡すとき', ['受領した原票の件数を記録しない', '送付記録を書き換える', '受領時に送付記録と実際の原票の件数を照合', '件数が分かる記録を廃棄'], onlyThird, '不足や重複を入力前に'],
    ['明らかな記入誤り', ['誤りがあるまま処理', '起票した業務部門に訂正を依頼', '処理期日が過ぎてから', '元の記載を追跡できない'], onlySecond, '訂正記録と確認済みの内容'],
    ['後日の照会や処理結果の検証', ['検証に使う原票を直ちに廃棄', '入力担当者の判断で原票を上書き', '保管期間が終わる直前に延期', '取扱者を限定した場所に原票を所定期間保管'], onlyFourth, '漏えい対策と後日の検証を両立'],
  ],
  // Report to the requester; evidence can be supplied by others but evaluation
  // and audit conclusions remain the independent auditor's responsibility.
  58: [
    ['システム監査の実施体制', ['監査結果を監査依頼者に報告', '利用部門のメンバ', '他の専門家の責任において', '情報システム部門のメンバ'], onlyFirst, '監査対象から独立性'],
    ['外部専門家の支援を受ける', ['専門家の判断を開発部門が承認', '被監査部門のメンバだけ', '専門家の成果を評価した上で，自ら監査判断', '責任を全て外部専門家へ移す'], onlyThird, '専門家の成果を評価'],
    ['運用部門が提供する手順書や記録', ['運用部門が開示を許可した指摘だけ', '運用業務から独立した監査チームが証拠を評価', '運用担当者の判定をそのまま採用', '証拠の評価を省略'], onlySecond, '運用から独立'],
    ['設計内容を聞く必要がある', ['設計説明をそのまま監査結果', '利用部門の担当者だけに評価を任せる', '外部専門家への説明をもって', '開発の担当者から独立した監査人が証拠を評価'], onlyFourth, '自分の開発を監査させない'],
  ],
  // Approval, access, expenditure and procurement responsibility evidence differ.
  59: [
    ['ソースコードの機密性', repository, onlySecond, '権限をもたない者が内容を閲覧できない'],
    ['ソースコードの変更管理', repository, onlyFirst, '変更結果の承認'],
    ['導入の経済性', repository, onlyThird, '導入コストが妥当'],
    ['選定手続における開発部門の関与', repository, onlyFourth, '実際にどの部門が選定したか'],
  ],
  60: [
    ['処理ロジックの正確性', sheet, onlyThird, '仕様どおりの計算'],
    ['喪失後の復元に備えた複製', sheet, onlySecond, '喪失したデータを復元'],
    ['利用できる担当者の管理', sheet, onlyFourth, '誰に利用を認めているか'],
    ['作成と利用の職務分離', ['作成者と利用者が分離', 'バックアップ', '文書化され検証', '利用者が定められて'], onlyFirst, '自分で作った処理だけを自分で使うことを防げる'],
  ],
  61: [
    ['アプリケーションアーキテクチャ', architecture, onlySecond, '業務プロセスを支援するシステム'],
    ['データアーキテクチャ', architecture, onlyFirst, 'データの意味，構造，関係'],
    ['テクノロジアーキテクチャ', architecture, onlyThird, '構築・運用するための技術構成'],
    ['ビジネスアーキテクチャ', architecture, onlyFourth, '業務の流れや業務間でやり取りする情報'],
  ],
  // The required future operating model determines organisation, scope and authority.
  62: [
    ['業務プロセスを抜本的に再設計', ['将来的に必要となる最上位の業務機能', 'ビジネスモデルの将来像にはこだわらず', '定型業務を対象', '現行の組織や業務手続に基づいて'], onlyFirst, '将来の事業目標から'],
    ['申請から決裁まで', ['必要な決裁権限と部門間の連携', '将来像は定めず', '判断や決裁は対象とせず', '既存の承認経路を所与'], onlyFirst, '全体の目標'],
    ['オンラインの購入後サポートを一体化', ['受付から解決までの担当と情報連携', '共通の目標を定めない', '返品の判断は対象外', '現在の店舗とオンラインの所管区分を固定'], onlyFirst, '受付・引継ぎ・解決を全体で設計'],
    ['全社で優先度を管理', ['優先度の判断と拠点間の応援', '目標を設定せず', '非定型業務は扱わず', '既存の拠点の処理順序を維持'], onlyFirst, '全社で重要障害を優先'],
  ],
  63: [
    ['SOA', techniques, onlyFourth, '独立したサービスとして組み合わせる'],
    ['SFA', techniques, onlyFirst, '営業活動にITを活用'],
    ['アウトソーシング', techniques, onlySecond, '中核業務に経営資源を集中'],
    ['BPR', techniques, onlyThird, 'コスト，品質，サービスなどを大きく改善'],
  ],
  64: [
    ['有用な情報や関係を見つけ出す', data, onlyFourth, 'データから関係や傾向を見いだす'],
    ['横断分析に使う', data, onlyFirst, '履歴を統合して分析'],
    ['意味，型，桁数などの定義', data, onlySecond, '意味，型や桁数'],
    ['どこに保存・出力されるか', data, onlyThird, 'データストア'],
  ],
  67: [
    ['特定の製品・サービスに経営資源を集中', market, onlySecond, '限定した顧客や製品への特化'],
    ['首位企業の顧客を獲得', market, onlyFirst, 'リーダに挑戦'],
    ['正面からの競争を避けて', market, onlyThird, '模倣や適応'],
    ['市場で最大のシェア', market, onlyFourth, '幅広い|広い顧客層'],
  ],
  68: [
    ['SWOT分析', strategy, onlyFirst, 'Strengths'],
    ['競合他社との対応関係', strategy, onlySecond, '競合他社・自社の動き'],
    ['マーケティングミックス', strategy, onlyThird, '製品，価格，流通，販売促進'],
    ['プロダクトポートフォリオマネジメント', strategy, onlyFourth, '市場の成長性と市場占有率'],
  ],
  69: [
    ['成長期', lifecycle, onlyFirst, '商品ラインや販路を広げる'],
    ['成熟期', lifecycle, onlySecond, 'コスト削減'],
    ['衰退期', lifecycle, onlyThird, '需要が減少し'],
    ['導入期', lifecycle, onlyFourth, '新規需要を開拓'],
  ],
  // Varied small-lot, order-dependent and demand-dependent work benefits from flexible grouping.
  71: [
    ['セル生産方式の利点', ['大量生産が必要', '長期間変わらない', '多種類かつフレキシブル', '専門化による分業'], onlyThird, '多品種で柔軟な運用'],
    ['日ごとに品種の構成が変わる', ['単一品種を大ロット', '単一仕様を変更せず', '異なる構成で小ロット', '固定した担当で反復'], onlyThird, '品種構成が変わる小ロット品'],
    ['選ばれた仕様で組立てに必要な作業が異なる', ['同じ部品だけを連続して大量', '仕様が変わらず', '複数の組立作業を組み合わせる', '一人一工程の分業'], onlyThird, '注文ごとに組立ての内容が異なる'],
    ['品種ごとの生産量が週ごとに変動', ['大量の同一品を専用設備', '必要数量が長期間一定', '多能工がチーム内で複数工程を調整', '工程間で担当を替えられない'], onlyThird, '多能工が複数工程'],
  ],
  72: [
    ['ICタグ（RFID）の特徴', ['GPSを利用し', '磁気読取り装置に挿入', '外部記憶装置を使用', '梱包の外から読む'], onlyFourth, '電波を妨げない梱包'],
    ['磁気ストライプ式の会員カード', ['衛星からの信号', '磁気ストライプに記録された情報', '外部記憶装置から大容量', '読取り機からの電波で'], onlySecond, '磁気の変化'],
    ['端末にGPSを搭載', ['複数の衛星から受け取る信号', '磁気読取り機に端末を挿入', '位置の計算が不要', '衛星信号を受信せず'], onlyFirst, '衛星信号を使って受信機の位置'],
    ['紙箱と設置条件は読取り用の電波を妨げない', ['GPSの衛星信号', '磁気読取り機に差し込む', 'タグごとに外部記憶装置', '読取り機からの電波にタグが応答'], onlyFourth, '電波が届く条件'],
  ],
  // Unlike publishing or buying, these cases require exchange among participating users.
  73: [
    ['ソーシャルメディアをビジネス', ['雑誌に商品記事を頻繁に掲載', '意見を共有する場をインターネット上に', '経営戦略をビジネス専門誌に掲載', '専門誌をネット通販で入手'], onlySecond, '他の利用者と共有'],
    ['新商品の試用者から', ['一般誌に試用キャンペーン', '互いに意見交換できる場', '業界誌に寄稿', '専門書をネット通販で注文'], onlySecond, '互いに意見を交換'],
    ['海外市場で販売する製品', ['海外の一般誌に製品の紹介記事', '他の利用者が返信できる場', '海外展開方針を専門誌に載せ', '市場資料を通販サイトから購入'], onlySecond, '利用者間の交流'],
    ['よくある問合せを見直し', ['雑誌にサポート窓口の案内', '質問と解決方法を投稿し合う', 'サポート方針をビジネス専門誌', '定期購読をネットで申し込む'], onlySecond, '利用者同士が質問や解決方法を共有'],
  ],
  // The question asks for the inappropriate purpose. Metering and data/control
  // communication are supported; power storage or supply is not.
  74: [
    ['高機能型の電力メータ', ['自動検針によって', '停電時に補助電源', '電力需要制御によって', '電力消費量の可視化'], onlySecond, '負荷へ電力を供給する機能は補助電源'],
    ['山間部の需要家を遠隔検針', ['遠隔で測定値を受信', 'メータから配電線へ電力を送り出して', '需要側の制御機器に渡して', '時間帯別の使用量'], onlySecond, '配電線へ電力を送り出す設備ではない'],
    ['建物の管理システムと連携', ['検針値を管理システムへ自動送信', '使わなかった電気をメータ内に蓄え', '連携する空調制御へ測定値を渡す', '使用電力の時間帯別の推移'], onlySecond, '電気の蓄積は蓄電装置'],
    ['工場で時間帯別の電力需要を抑える', ['測定した使用量を中央で受信', 'メータを電源として生産設備を稼働', '設備で運転時刻を調整', '消費量の推移を表示'], onlySecond, '別の電源設備が必要'],
  ],
  75: [
    ['CIO', officers, onlyFourth, '最高情報責任者'],
    ['CFO', officers, onlyFirst, '最高財務責任者'],
    ['研究開発を統括するCTO', officers, onlySecond, '最高技術責任者'],
    ['CCO（Chief Compliance Officer）', officers, onlyThird, '最高コンプライアンス責任者'],
  ],
  76: [
    ['キャッシュフローを改善', ['受取手形の期日を長く', '売掛金を回収するまでの期間を短く', '買掛金を支払うまでの期間を短く', '支払手形の期日を短く'], onlySecond, '現金が早く入る'],
    ['翌月の資金繰り', ['受取手形を翌々月末の期日から翌月末', '翌月回収する予定の売掛金を翌々月', '翌々月に支払う買掛金を翌月', '翌々月が期日の支払手形を翌月'], onlyFirst, '入金の時点だけが早く'],
    ['今月のキャッシュフロー', ['受取手形を，来月が期日', '今月回収予定の売掛金を，来月', '今月支払う買掛金を，来月', '支払手形を，今月が期日'], onlyThird, '今月の出金を抑えられる'],
    ['今四半期のキャッシュフロー', ['受取手形の期日を，翌四半期', '今四半期中の売掛金回収を，翌四半期', '翌四半期に支払う買掛金を，今四半期中', '今四半期中に決済する支払手形の期日を，翌四半期'], onlyFourth, '今四半期の出金を抑えられる'],
  ],
  79: [
    ['サイバーセキュリティ基本法の説明', ['確保に必要な注意を払うよう努める', '教育研究機関についての言及はない', '民間事業者が努力すべき事項についての規定はない', '地方公共団体を“重要社会基盤事業者”'], onlyFirst, '第9条'],
    ['地方公共団体の責務', ['施策を策定しない', '国との適切な役割分担を踏まえ，自主的な施策を策定し，実施', '全て教育研究機関が策定', '位置付けられることだけを根拠'], onlySecond, '第5条'],
    ['教育研究機関の責務', ['個別の規定はない', '地方公共団体だけが人材育成', '人材育成，研究及び成果の普及に努める', '全て重要社会基盤事業者'], onlyThird, '第8条'],
    ['重要社会基盤事業者の責務', ['別の規定がない', '地域の自主的な施策を策定', '研究成果の普及だけに限定', 'サービスの安定的な提供のため自主的に確保に努め'], onlyFourth, '第6条'],
  ],
  80: [
    ['独占禁止法の目的', ['公正かつ自由な競争を促進', '国際的な平和及び安全の維持を阻害する取引', '製造物の欠陥によって損害', '特許権者に発明を実施する権利'], onlyFirst, '独占禁止法第1条'],
    ['外国為替及び外国貿易法の目的', ['国内市場での公正かつ自由な競争', '必要最小限の対外取引の管理', '製造業者等の賠償責任', '発明の保護及び利用'], onlySecond, '外為法第1条'],
    ['製造物責任法の目的', ['不当な取引制限を禁止', '対外取引の必要最小限の管理', '製造業者等の責任を定め，被害者の保護', '発明の保護と利用'], onlyThird, '製造物責任法第1条'],
    ['特許法の目的', ['私的独占などを排除', '国際社会の平和と安全の維持', '製造業者等の損害賠償責任', '発明の保護及び利用を図ることによって発明を奨励'], onlyFourth, '特許法第1条'],
  ],
};

/** Primary evidence used for the historically scoped answers.
 * The two laws from 2015 change Article 13 and Supplementary Article 3, respectively.
 * The antitrust Article 1 purpose is confirmed in the annual report from the period. */
export const historicalReview = {
  asOf: '2015-10-18',
  cyber: {
    articleByCase: [9, 5, 8, 6],
    enacted: 'https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/housei/18720141112104.htm',
    amendments: [
      'https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/housei/18920150911066.htm',
      'https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/housei/18920150930076.htm',
    ],
  },
  purposes: [
    { act: '独占禁止法', article: 1, evidence: 'https://www.jftc.go.jp/info/nenpou/h26/div02/div_02_05.html', articleText: 'https://www.jftc.go.jp/dk/guideline/lawdk.html', amendment: 'https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/housei/18520131213100.htm' },
    { act: '外国為替及び外国貿易法', article: 1, evidence: 'https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/housei/15920040216001.htm', context: 'https://www.meti.go.jp/policy/anpo/law09.html' },
    { act: '製造物責任法', article: 1, evidence: 'https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/houritsu/12919940701085.htm', revision: 'https://laws.e-gov.go.jp/api/2/law_data/406AC0000000085_19950701_000000000000000' },
    { act: '特許法', article: 1, evidence: 'https://www.shugiin.go.jp/internet/itdb_housei.nsf/html/houritsu/03119590413121.htm', additionalArticle: 68 },
  ],
};

/** Pin the reviewed claim wording so retaining an anchor while reversing a clause also fails.
 * Truth values and their semantic evidence are maintained in knowledgeReview. */
export const reviewedWordingPins: Partial<Record<number, readonly string[]>> = {
  54: ['be09f8c1cda9e625fc53aae2ddcd1e5a9fe2e480b6eae20897257cfc8e2c862b', '05141ae9fc65a3eb715aa4c11cfff7f3da5b25fe4bc0c6806436b56c77157946', 'b19ba2c2d6cc7fc80e11865783711f06c46dbdf6fdf2a865e3a1e23890d09204', '636ba2a2269616df7eb63687c3855704fdc35d6abd9282ca992a59416c4ec430'],
  56: ['79627f2e1ffc7f4d353868320e55c048f1e88015bb6c56b5d1be167ba65242af', 'b5a765a4f8c7eaedc58c8c911c6f2567b5c7b0e94db976b5118c8ce260fc9732', 'ffa7cfc7ce2b823a1bc2dd734b054ed7dff13f63fee756de551bcf4e40278292', '15cdf92077c9a6c860e91af23624f609d6da3b89c69b4ef5bf2fc2c5884cb14f'],
  57: ['128b680e8ebcdd2087ca2620ed4d8a51ac3b284a4f17dab32b20a4b68cb7aef8', '6f1b0ec3fe593a7c527995e9071bbb362fe409d3b1a6868c0a8ce906e3a0df37', '187959b91c947ce95b8f5cc739e15d9a80c8b14e5d3bc878bd23641eda82727a', '31977a9ac141a94c96fa5335e694bb0b68ea78c4f42d85a00c85247eb7e28fe1'],
  58: ['154ffd29193718bf366a8d113ff3a7137f08535038216db812d0f43b443da99b', '9a2eb741e57fbd21fd29a608dd149d339c00b3c08bb8c2281d3e873c99362553', '8d15779e92ffa944cff477ba6b8b176313647419fc5b62497f11677f556f56fc', 'ee8e2b0a4e67cc8bddba1a94ab70459720433a20e574a4f1d837ac96b88d0298'],
  59: ['fe21d5c22a7939930721804e917091915c78499df06c0186672824841a00de55', '3e0fca0190d08cb5e7f25d075c70eb329b9f7809350532d84d55f22810a92d0b', '898fbfc1c7cd8fdde94e84195ff7bae90143dd4cc547cf3d9d06330f323ba31c', 'f6cf5c5cadb2d6d48f114e98240decc6c41165ee21e2ae3beda8640cdd8199c8'],
  60: ['ef0b8b0929aebcc1fb2c69162dbc5ed16b80474162e679b98d1f9cd65acdfce9', '61dccf03aefe1dc15fe7263b7ac4e5609cba151d22f622b424da02b270b49cf3', '2c37b84f0fabc80cfe9516803add18312167b931e27b34544ed3bd3a71ae5eb4', '8c96b5adb8fc34a52d6eef8c40422d26c78a986801cb71666beb2ac27aa0d7cb'],
  61: ['caee21e320ce2a4080711a8d880ba944273395ca1d3451b2af63fc6898efaa1e', 'a67a1cba419f9d08d01db6ca3f0b397a5f5eb927c449e33fa552f8fb61eaedd0', '8b9a65bc55b06c63dcd4d9ff167852130d5026df2da351ef7f50c5fb309ec549', 'c8b5a8db616e423f20908af07dae9cfa153f9196b10d44d6c921c680aef45f24'],
  62: ['4638ecc36437c47eadceec84a178da2b7e2f7077e9b485a955c19f250480fe4b', '32d46811b45392359a08f9df1d8a1b0ded7300fab966ca6ff221f36f30fda89a', '0213ac9025774fa6f18942b1629cf1594a328eac6db7edd09722c75d53d67266', '2c85bf205be0501ba5f5a007548aa935b04da5630294b376ae2f3d826e08539c'],
  63: ['9731b44a9c71167244a41d5929bfe6f7845db1ff8a2db76d1126e69b49751604', '8884179128bb85070c36f320497aeb440f032074eae1971f4714bce648ae84e6', 'cd62e9477a5c224bbe0bf01a3f2ac643c710c55a93c6773832dae78f433f9957', '504b38a37699cc58cdbb373c084bab04f844772a186900a8605f8e6ada58d11d'],
  64: ['e6d57653bb1a55f3b0bd6956a699f7a593e4ff816d4dd797410fe7b2c6f52ca6', '615c781d4520bcb50a2bbdc29f55bcc1557b13fd8a1479487f99b106a2115d5f', 'a67cf583a6c770104773fae9839c69e849aa9b6c5614015e763a688791be1751', '6fad258ad2ff8c4616f55da80d35c93aa4245b20f1dd402bb9ec4d63e8c9edee'],
  67: ['98eaf68fd76f9a0abf0129bb98f107d2ef583394b3f680af5c17f3e8dee4e6b1', '3124add3bfb9159374f41e485a295544de66eaf612a1fbd6d507e9113d27bbec', '5289eecf564c6d9353465047698c3525d4b87890498768ef63ba58b9a7516fbc', 'e0c2b470be98aab6a8253767d04484cc89dcfc5cdd6b4187ac85d49305927c0f'],
  68: ['29fd64f4acf93b5e6c62edd700fb04239123211bb53cc84510756484eccb2dcd', 'af87eac5503c9d7f7657eec72d2ad83f055e1118224c0adf093536ea231875c9', '8c7cbb3b205d1fd239f32f43f021cb3f1d482421be9738b17d84aa54ad9d871c', 'fb2bfbb53683480f64a04476662c5d6dd7d2d423884b8d3bd2f89ff4321da5b5'],
  69: ['e3be437168c52a9a6b643353729b9ea0b064ab5e76a64d60bae9d65fe025e14b', '9733dcb3b205641344aff845c5b4f31661f38af0dc9b63bac1ec3d09743c5f63', '5745234d672135215946b84f94e73b2e540375518e51ee373832c36ee699ea98', 'feb99b212a777075fdbccde6a3bdf04c1ea42780e609202f4899e60951547258'],
  71: ['daf0f482651aa8cc212a20a8c1e3801d27aa1d5ae3cb1bc732ed0d5c8aa1c731', '2716c1d1bbf8f6a82970be6cb8a79e565ab529da26f2212801c5f571ea0bc041', '3740c405b6c87c43937d13d81d7a8d934f0473d70c976284fd5c12579baee877', 'aa6b9ebc8c68949a2b1424c15d3d249c14c0405427c4c75c369f27d3ad2e5b6f'],
  72: ['50953212be07679f1401f0eaf0b38c477dc9e1e5a4543bf24bf2f8fae692ea57', '723797bc5aa44f60acc574a77127dba1ab8e098209818aadb11b33bfd256dfb4', '19fbeb97b24f71a00a0a0ade086c17aa8a56af84e0ead103fa993a28abb85571', '75e46d285f18b6605329da81d3cdce1671e1aac1fd765729e4534ecbfded47e8'],
  73: ['9d62e4c317cdaafa17b3a2227d1529fc395088390269b742b1fd7f202fa920f9', '216b4f79b6a32f028efebe3b86a987cac029dd7d8532beac09ce0ba00ee86441', 'bdfe1b5855fc3e9978f217d8893d4550c695b98f01cdf2e3c5fcea31b7e302be', '84fe0b02fa97e808ec16a9fc08205cf3c1bf7b0d50ed96b94b22264a45843f92'],
  74: ['901fb0528366511000b52999f68372fa6ec35d948f45031cacb16dac86c29a9c', '7477e3b12affba6088a0ae18de00a3d8d116c9f39439ed156a62c97759e493eb', '8dcadb23292a3f8dd3ab7b362696ce2addc167fe76a0cea3f734eb8f950ae1ec', '352f4a5cd321998521ae54f74c5d623744a1bb9d1e13878dc5d1d2f8c4750d30'],
  75: ['18dc16e194862708b16de6aecde23c910e9076b6af8679374fd3087c8ecb3f4a', '20f8336aef724dde55655124e8e107a8271e81810f0d436e6a806c2af73165cb', '06b8865f17a4893646a689c5db755267b043edf446919019d566eba35a34578b', '3a4a3e553478160198b5b22aeed7e1d4e806a9e318154aeb6a84a82277258a40'],
  76: ['976c448720f1d1914ab8a63c812bfa626dd226361aab9756d0460437ec8aeba1', 'fed452d6ccda9970cc1d1a43fcab185f53a721251d9df3ffcb94fe4d8cc723f7', '2d3a1190a7268a06f6c1ca359ba4f59759fb395704c2676549b00f3803174571', '7dddf1c6b8c2d59b60c77f09288d3a6b116911dd621dde7b89472ec43c5ccedf'],
  79: ['ab473febe355cd2ce9bd9c2f0a2b7476cb1c0d785e67def5e8bda3d17c0046ec', '8527c69c7ba86a41cb7ed8bb74cf8a56f4692966de30866fb4b0abbefea3573e', '4e210731447a3b0cba762c1b81b88a5350e8ef61d4e5311bdd09e83f558f2641', 'c6a4bb6295f637c075557dd962c71460bec4b568c6a9ad5ff940544f1bb0ff32'],
  80: ['e129254d58387ddc46c3d37382c3a95d8edf84b75f0b4ae8171a8d2bda0163b1', 'bac560c1ba9b4c7fde3ef881d0210fd014748f9ffeba2f6899e3dac237b2a964', 'c00716477af8f7979b823c0fe8045c0119fb292239ebb081a04f08e33f556b10', '3014051857671a644af2e1ad7f5c4897338adc032e101afc1f15b2c3f7ed2752'],
};

/** Independent historical source for the distinction between IRR and the
 * undiscounted ROI comparison used by the official later variant. */
export const roiReview = {
  irrDefinition: { url: 'https://www.mlit.go.jp/common/001205703.pdf', printedPage: 86, physicalPage: 96 },
  laterQuestion: { url: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf', physicalPage: 29, number: 65 },
  referenceCondition: '内部収益率（IRR）は0とする。',
  adaptationCondition: '割引率は考慮しなくてよいものとする。',
};
