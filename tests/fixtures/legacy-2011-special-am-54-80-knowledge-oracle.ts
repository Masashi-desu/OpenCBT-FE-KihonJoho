type ChoiceClaim = readonly [fragment: string, claim: string];
type Review = {
  promptFragment: string;
  acceptedClaim: string;
  choices: readonly ChoiceClaim[];
};
const check = (promptFragment: string, acceptedClaim: string, choices: readonly ChoiceClaim[]): Review =>
  ({ promptFragment, acceptedClaim, choices });

const qc: readonly ChoiceClaim[] = [['管理図', 'time limits'], ['散布図', 'paired values'], ['特性要因図', 'cause hierarchy'], ['パレート図', 'cumulative share']];
const service: readonly ChoiceClaim[] = [['顧客満足度', 'agreed service'], ['空き容量', 'capacity'], ['変更を行った場合の影響度', 'change evaluation'], ['既知のエラー', 'restore incident']];
const businessPurposes: readonly ChoiceClaim[] = [['業務プロセスの継続的な改善', 'process'], ['経営資源の有効活用', 'resources'], ['顧客情報の管理', 'customers'], ['情報資源の分析', 'analytics']];
const activities: readonly ChoiceClaim[] = [['運用テスト', 'operate'], ['システム化計画の立案', 'plan'], ['システム要件定義', 'develop'], ['利害関係者要件の定義', 'stakeholders']];
const rf: readonly ChoiceClaim[] = [['情報の提供を依頼', 'information'], ['提案書の提出を依頼', 'proposal'], ['取り決めた内容の変更', 'modify'], ['契約の締結', 'award']];
const analyses: readonly ChoiceClaim[] = [['財務諸表を基に', 'financial'], ['強みと弱み，機会と脅威', 'SWOT'], ['市場での位置付け', 'position'], ['価格設定', 'price comparison']];
const retailers: readonly ChoiceClaim[] = [['卸売業者が主導', 'wholesaler'], ['小売業者が主宰', 'cooperative'], ['商業集積地域内', 'geographical'], ['商標や標識の使用権', 'franchise']];
const government: readonly ChoiceClaim[] = [['自治体内で', 'internal'], ['電子調達，電子入札', 'business'], ['自治体間で', 'government'], ['電子申請', 'resident']];
const communications: readonly ChoiceClaim[] = [['電子メールサービスの国際規格', 'mail'], ['付加価値を加えた通信サービス', 'value added'], ['標準的な規約に基づいて交換', 'business exchange'], ['入力することによって，本部又は仕入先', 'ordering']];
const sales: readonly ChoiceClaim[] = [['購入商品の組合せ', 'basket'], ['販売金額や粗利益額', 'priority'], ['品切れを起こさない', 'time series'], ['アンケート調査', 'survey']];
const accounts: readonly ChoiceClaim[] = [
  ['売上高－売上原価', 'gross'],
  ['売上高－売上原価－販売費及び一般管理費', 'operating'],
  ['売上高－売上原価－販売費及び一般管理費＋営業外損益', 'ordinary'],
  ['売上高－売上原価－販売費及び一般管理費＋営業外損益＋特別損益', 'before tax'],
];
const property: readonly ChoiceClaim[] = [['高度なもの', 'patent'], ['思想又は感情を創作的に表現', 'copyright'], ['形状，構造又は組合せに係る考案', 'utility'], ['視覚を通じて美感', 'design']];

// Choices are classified from the reviewed rule or from the scope of the stated example.
// Identifying fragments also bind the classification to the actual displayed option.
export const knowledgeOracle: Readonly<Record<number, readonly Review[]>> = {
  54: [
    check('少数の原因で占められている', 'cumulative share', qc),
    check('管理限界を越えた日', 'time limits', qc),
    check('湿度の高い日に寸法', 'paired values', qc),
    check('更に具体的な原因に分けられた', 'cause hierarchy', qc),
  ],
  55: [
    check('バックアップに関する記述', 'stable image', [['復旧時間を最短にするために，差分', 'needs base'], ['ランダムアクセスを可能にするために，磁気テープ', 'sequential medium'], ['業務処理が重ならない', 'stable image'], ['同一記憶媒体内', 'shared failure']]),
    check('差分の合成を省いて', 'single snapshot', [['必要な時点の完全バックアップ', 'single snapshot'], ['最後の差分だけ', 'needs base'], ['最初の増分だけ', 'needs all increments'], ['名前だけを記録', 'no contents']]),
    check('先頭から順にたどらず', 'indexed addressable storage', [['目的の位置を移動なし', 'tape moves'], ['位置を特定できる形', 'indexed addressable storage'], ['情報を削除', 'no index'], ['ファイル名だけ', 'no contents']]),
    check('一つ物理的に故障', 'independent copies', [['同じ媒体の別のフォルダ', 'shared failure'], ['同じ媒体の別のパーティション', 'shared failure'], ['実施時刻だけ', 'no contents'], ['業務データとは異なる媒体', 'independent copies']]),
  ],
  56: [
    check('インシデント管理', 'restore incident', service),
    check('サービスレベル管理', 'agreed service', service),
    check('キャパシティ管理', 'capacity', service),
    check('変更管理', 'change evaluation', service),
  ],
  58: [
    check('にいうシステムライフサイクル', 'lifecycle', [['企画，開発，運用，保守', 'lifecycle'], ['計画，実行，点検，改善', 'PDCA'], ['構築，運用，評価，監査', 'mixed oversight'], ['設計，開発，製造，試験', 'production']]),
    check('調達を含む', 'lifecycle', [['調達，設計，移行，監査', 'subtasks'], ['企画，開発，運用，保守', 'lifecycle'], ['企画，調達，運用，監査', 'wrong hierarchy'], ['計画，実行，点検，改善', 'PDCA']]),
    check('稼働後の定期処理', 'lifecycle', [['計画，設計，製造，試験', 'production'], ['設計，試験，運用，監査', 'mixed oversight'], ['企画，開発，運用，保守', 'lifecycle'], ['開発，試験，運用，評価', 'wrong hierarchy']]),
    check('旧システムの廃棄まで', 'lifecycle', [['企画，設計，移行，廃棄', 'wrong hierarchy'], ['構築，運用，評価，廃棄', 'mixed oversight'], ['開発，移行，保守，廃棄', 'subtasks'], ['企画，開発，運用，保守', 'lifecycle']]),
  ],
  59: [
    check('監査の実施体制に関する', 'report sponsor', [['監査結果を監査依頼者に報告', 'report sponsor'], ['利用部門のメンバによる監査チーム', 'self audit'], ['ほかの専門家の責任', 'delegated opinion'], ['情報システム部門員による監査チーム', 'self audit']]),
    check('自ら設定した権限', 'independent judgment', [['運用部門に監査結果の判定', 'self audit'], ['利害関係のない監査人', 'independent judgment'], ['支援者に監査意見の最終判断', 'delegated opinion'], ['監査人が権限の変更を指示', 'management instruction']]),
    check('専門家から支援', 'evaluate evidence', [['専門家が評価の範囲と結論を単独', 'delegated opinion'], ['設計した担当者だけ', 'self audit'], ['専門家の調査結果を評価して結論', 'evaluate evidence'], ['専門家が監査結果に基づくシステムの変更', 'management instruction']]),
    check('監査が終了した', 'report sponsor', [['開発チームに，監査意見の最終判断', 'self audit'], ['専門家だけに結果を知らせ', 'misdirected report'], ['手順の変更を命令', 'management instruction'], ['改善の指示は監査依頼者に委ねる', 'report sponsor']]),
  ],
  60: [
    check('ヒアリングに関する記述', 'corroborate', [['管理者の中から', 'restricts source'], ['裏付けるための文書や記録', 'corroborate'], ['その場で被監査部門に改善を指示', 'operates control'], ['1人のシステム監査人', 'restricts auditor']]),
    check('定期見直しを毎月', 'corroborate', [['承認記録や権限一覧の更新履歴', 'corroborate'], ['部門長も同じ回答', 'unverified'], ['その場で権限の削除', 'operates control'], ['監査人を必ず一人', 'restricts auditor']]),
    check('夜間の例外処理', 'corroborate', [['管理者の説明だけ', 'restricts source'], ['当直の担当者に実際の処理を聞き，操作記録などと照合', 'corroborate'], ['監査人がその場で決め', 'operates control'], ['必ず不正確になる', 'restricts auditor']]),
    check('手順書と異なる操作', 'corroborate', [['その場で新しい手順', 'operates control'], ['最初の発言だけ', 'unverified'], ['実際の操作記録を確認', 'corroborate'], ['管理者の発言だけ', 'restricts source']]),
  ],
  61: [
    check('ビジネスアーキテクチャ，テクノロジアーキテクチャ，アプリケーションアーキテクチャ', 'data', [['システムアーキテクチャ', 'unlisted'], ['ソフトウェアアーキテクチャ', 'unlisted'], ['データアーキテクチャ', 'data'], ['バスアーキテクチャ', 'unlisted']]),
    check('データアーキテクチャ，テクノロジアーキテクチャ，アプリケーションアーキテクチャ', 'business', [['ビジネスアーキテクチャ', 'business'], ['ソフトウェアアーキテクチャ', 'unlisted'], ['システムアーキテクチャ', 'unlisted'], ['バスアーキテクチャ', 'unlisted']]),
    check('ビジネスアーキテクチャ，データアーキテクチャ，アプリケーションアーキテクチャ', 'technology', [['バスアーキテクチャ', 'unlisted'], ['テクノロジアーキテクチャ', 'technology'], ['ソフトウェアアーキテクチャ', 'unlisted'], ['システムアーキテクチャ', 'unlisted']]),
    check('ビジネスアーキテクチャ，テクノロジアーキテクチャ，データアーキテクチャ', 'application', [['システムアーキテクチャ', 'unlisted'], ['バスアーキテクチャ', 'unlisted'], ['ソフトウェアアーキテクチャ', 'unlisted'], ['アプリケーションアーキテクチャ', 'application']]),
  ],
  62: [
    check('BPMの目的', 'process', businessPurposes),
    check('ERPの目的', 'resources', businessPurposes),
    check('CRMの目的', 'customers', businessPurposes),
    check('BIの目的', 'analytics', businessPurposes),
  ],
  63: [
    check('企画プロセス', 'plan', activities),
    check('運用プロセス', 'operate', activities),
    check('要件定義プロセス', 'stakeholders', activities),
    check('開発プロセス', 'develop', activities),
  ],
  64: [
    check('RFIの説明', 'information', rf),
    check('RFPの説明', 'proposal', rf),
    check('RFQ', 'quote', [['利用できる技術の情報', 'information'], ['構成や導入方法を含む提案書', 'proposal'], ['価格や納期の見積り', 'quote'], ['締結済みの契約', 'modify']]),
    check('契約変更依頼の説明', 'modify', [['製品や市場の情報', 'information'], ['実現方法の提案', 'proposal'], ['新規調達の見積り', 'quote'], ['締結済みの契約', 'modify']]),
  ],
  66: [
    check('SWOT分析を説明', 'SWOT', analyses),
    check('財務諸表分析を説明', 'financial', analyses),
    check('ポジショニング分析を説明', 'position', [['負債と自己資本', 'financial'], ['強み・弱みと機会・脅威', 'SWOT'], ['評価軸で自社製品と競合製品を配置', 'position'], ['利益がゼロになる販売量', 'break-even']]),
    check('販売価格の競合比較を説明', 'price comparison', [['自己資本比率', 'financial'], ['事業環境の機会・脅威', 'SWOT'], ['複数の顧客集団', 'segmentation'], ['競合製品の実売価格', 'price comparison']]),
  ],
  68: [
    check('コンタクト管理', 'contact', [['営業担当者からの問合せ', 'help desk'], ['営業組織全体で行う', 'team coordination'], ['顧客訪問日，営業結果などの履歴', 'contact'], ['営業テクニックを洗い出して共有化', 'knowledge']]),
    check('案件管理', 'deal', [['商談ごとに受注までの段階', 'deal'], ['製品仕様の質問', 'help desk'], ['連絡の履歴', 'contact'], ['交渉のコツを社内で共有', 'knowledge']]),
    check('売上実績管理', 'outcomes', [['顧客との訪問日時や連絡履歴', 'contact'], ['営業担当者別の売上を集計', 'outcomes'], ['受注前の商談に確度', 'deal'], ['事例集にまとめる', 'knowledge']]),
    check('営業ノウハウ共有', 'knowledge', [['顧客訪問の日時', 'contact'], ['売上の達成率', 'outcomes'], ['見込案件ごとに契約予定時期', 'deal'], ['効果があった提案の組み立て方', 'knowledge']]),
  ],
  69: [
    check('フランチャイズチェーン', 'franchise', retailers),
    check('ボランタリーチェーン', 'wholesaler', retailers),
    check('コーペラティブチェーン', 'cooperative', retailers),
    check('計画的な商業集積への出店', 'geographical', retailers),
  ],
  70: [
    check('G to B', 'business', government),
    check('自治体の内部だけ', 'internal', government),
    check('G to G', 'government', government),
    check('G to C', 'resident', government),
  ],
  72: [
    check('EDIを説明', 'business exchange', communications),
    check('X.400のメッセージ通信', 'mail', communications),
    check('VAN（Value Added Network）', 'value added', communications),
    check('EOS（Electronic Ordering System）', 'ordering', communications),
  ],
  74: [
    check('ABC分析', 'priority', sales),
    check('マーケットバスケット分析', 'basket', sales),
    check('販売数量の時系列', 'time series', [['レシートごとの商品を照合', 'basket'], ['売上構成比を大きい順', 'priority'], ['日ごとの販売数量の変化', 'time series'], ['消費者に質問票', 'survey']]),
    check('質問票による市場調査', 'survey', [['同じレシートで同時に', 'basket'], ['販売金額の累積比率', 'priority'], ['週ごとの販売数量', 'time series'], ['地域の購買層に記入を依頼', 'survey']]),
  ],
  77: [
    check('売上総利益の計算式', 'gross', accounts),
    check('営業利益の計算式', 'operating', accounts),
    check('経常利益の計算式', 'ordinary', accounts),
    check('税引前当期純利益の計算式', 'before tax', accounts),
  ],
  78: [
    check('著作権法に照らして適法', 'official disclosure', [['撮影者に無断で', 'no permission'], ['経済白書の記載内容を説明の材料として，出所を明示', 'official disclosure'], ['新聞の写真をスキャナ', 'no permission'], ['雑誌の記事をコピーして配布', 'beyond personal use']]),
    check('権利者の許諾の範囲', 'allowed publicity', [['両方の製品の広告に使う許諾', 'allowed publicity'], ['自社内での閲覧に限定', 'wrong recipients'], ['ある展示会に限定', 'wrong place'], ['校正用の一時的な複製だけ', 'wrong use']]),
    check('引用として適法', 'incorporated for critique', [['有料記事を丸ごと', 'reproduction only'], ['装飾のためだけ', 'wrong purpose'], ['検討に必要な数行を明瞭に区別', 'incorporated for critique'], ['雑誌の一号分を複製', 'exceeds necessary extent']]),
    check('国の機関の周知目的資料', 'official publication', [['新聞社の社説', 'not government work'], ['転載を禁じる表示', 'expressly prohibited'], ['第三者の写真', 'third-party content'], ['転載禁止の表示がない報告書の当該機関作成部分', 'official publication']]),
  ],
  79: [
    check('特許法による', 'patent', property),
    check('著作権法による', 'copyright', property),
    check('実用新案法による', 'utility', property),
    check('意匠法による', 'design', property),
  ],
  80: [
    check('不正アクセス行為に該当', 'crossed access control', [['情報の公表前', 'insider trading'], ['画面表示をでたらめ', 'malware impact'], ['報道写真を新聞社に無断', 'copyright'], ['パスワードを許可なく利用して，アクセス制御機能', 'crossed access control']]),
    check('閲覧を制限する社内サイト', 'crossed access control', [['同僚の識別符号を承諾なし', 'crossed access control'], ['許された範囲の資料', 'own access'], ['ログインなしで一般公開', 'public'], ['サイトにも接続しない', 'no access']]),
    check('外部との通信を受け付け', 'crossed access control', [['承諾された方法と範囲', 'authorized'], ['アクセス制御を免れ，制限された機能を利用できる状態', 'crossed access control'], ['公開された操作手順', 'public'], ['認証画面を閉じる', 'no access']]),
    check('利用を利用者ごとに制限', 'crossed access control', [['公開した予約の感想', 'public'], ['利用を許された予約一覧', 'own access'], ['識別符号を許可なく使い，通信回線を通じて', 'crossed access control'], ['サービスには何も入力しない', 'no access']]),
  ],
};
