// Fact cues were recorded independently of the generated answer indices.
// Each option is identified by a visible substring and classified against the condition.
type OptionFact = readonly [evidence: string, meaning: string];
type ReviewCondition = readonly [stemEvidence: string, meaning: string];
type KnowledgeReview = {
  conditions: readonly ReviewCondition[];
  options: readonly OptionFact[] | readonly (readonly OptionFact[])[];
};

export const knowledgeReview: Record<number, KnowledgeReview> = {
  27: {
    conditions: [
      ['慣れていない利用者', 'both'], ['キーボードだけ', 'keyboard'],
      ['ポインタだけ', 'pointer'], ['熟練者はポインタを動かさず', 'both'],
    ],
    options: [
      [['マウスで選択', 'pointer'], ['ダブルクリック', 'pointer'], ['マウスとキーボードの両方', 'both'], ['1か所に集めて', 'layout']],
      [['フォーカスを移動してキー', 'keyboard'], ['マウスオーバー', 'pointer'], ['残りの項目はポインタ', 'mixed-required'], ['ダブルクリック', 'pointer']],
      [['Enterキーだけ', 'keyboard'], ['どちらもクリック', 'pointer'], ['ショートカットだけ', 'keyboard'], ['キー入力があるまで', 'mixed-required']],
      [['ダブルクリックだけ', 'pointer'], ['ショートカットキーだけ', 'keyboard'], ['保存メニューとショートカットキーの双方', 'both'], ['案内だけ', 'incomplete']],
    ],
  },
  28: {
    conditions: [['パレート図', 'parts-of-total'], ['積み上げ棒グラフ', 'time-series'], ['散布図', 'correlation'], ['特性要因図', 'cause-hypotheses']],
    options: [['時系列', 'time-series'], ['との相関', 'correlation'], ['全体に占める割合', 'parts-of-total'], ['原因との関連', 'cause-hypotheses']],
  },
  29: {
    conditions: [['低速', 'low-rate-video'], ['最初に策定', 'storage'], ['インターレース', 'broadcast'], ['動画像オブジェクト', 'low-rate-video']],
    options: [['MPEG-1', 'storage'], ['MPEG-2', 'broadcast'], ['MPEG-4', 'low-rate-video'], ['MPEG-7', 'description']],
  },
  31: {
    conditions: [['ギザギザ', 'sampling-boundary'], ['はみ出した', 'crop'], ['光源', 'lighting'], ['別の形へ', 'transform']],
    options: [['アンチエイリアシング', 'sampling-boundary'], ['クリッピング', 'crop'], ['シェーディング', 'lighting'], ['モーフィング', 'transform']],
  },
  32: {
    conditions: [['主キー', 'valid'], ['注文番号と明細番号', 'valid'], ['製品番号を主キー', 'valid'], ['整数型の受付番号', 'valid']],
    options: [
      [['検索はできない', 'false'], ['算術演算の対象としては使えない', 'false'], ['同じ行が複数存在することはない', 'valid'], ['構成することはできない', 'false']],
      [['明細番号が異なれば', 'valid'], ['注文番号だけで', 'false'], ['同じ明細番号も重複', 'false'], ['必ず注文番号も', 'false']],
      [['外すと，表の行は検索できない', 'false'], ['主キー以外の列だけでも', 'valid'], ['同じ製品番号の行を複数', 'false'], ['製品番号が未設定でも', 'false']],
      [['NULLのまま', 'false'], ['同じ受付番号でも', 'false'], ['受付日だけを条件に行を検索することはできない', 'false'], ['算術式の対象にできる', 'valid']],
    ],
  },
  34: {
    conditions: [['バックアップファイル', 'committed-log'], ['ログファイルを確保', 'snapshot'], ['前夜のバックアップ', 'committed-log'], ['誤更新の直前', 'snapshot']],
    options: [
      [['トランザクションファイル', 'transactions'], ['マスタファイル', 'master'], ['ロールバックファイル', 'undo'], ['ログファイル', 'committed-log']],
      [['バックアップファイル', 'snapshot'], ['マスタファイル', 'master'], ['ロールバックファイル', 'undo'], ['ログファイル', 'committed-log']],
      [['トランザクションファイル', 'transactions'], ['マスタファイル', 'master'], ['ロールバックファイル', 'undo'], ['ログファイル', 'committed-log']],
      [['トランザクションファイル', 'transactions'], ['バックアップファイル', 'snapshot'], ['ロールバックファイル', 'undo'], ['ログファイル', 'committed-log']],
    ],
  },
  35: {
    conditions: [['分散データベース', 'distribution-hidden'], ['位置透過性', 'location-hidden'], ['複製透過性', 'replicas-hidden'], ['分割透過性', 'fragments-hidden']],
    options: [
      [['一つのサーバ上で稼働しているかのように', 'distribution-hidden'], ['知っている必要', 'location-shown'], ['共有してアクセス', 'single-database'], ['介してアクセス', 'mediated']],
      [['サーバが変わるたびに', 'location-shown'], ['同じ論理名', 'location-hidden'], ['複製を全て指定', 'replicas-shown'], ['各断片を指定して結合', 'fragments-shown']],
      [['複製先を全て列挙', 'replicas-shown'], ['各断片を表として指定', 'fragments-shown'], ['複製を選ばず', 'replicas-hidden'], ['サーバ名付きで', 'location-shown']],
      [['各断片の表名を列挙', 'fragments-shown'], ['物理的な配置先を問合せごと', 'location-shown'], ['利用者が使用するものを指定', 'replicas-shown'], ['分割前と同じ論理表', 'fragments-hidden']],
    ],
  },
  37: {
    conditions: [['ルータ', 'ip-forward'], ['ブリッジ', 'frame-forward'], ['ゲートウェイ', 'protocol-translate'], ['リピータ', 'signal-repeat']],
    options: [['データリンク層で', 'frame-forward'], ['ネットワーク層で', 'ip-forward'], ['ネットワーク層よりも上位', 'protocol-translate'], ['物理層で', 'signal-repeat']],
  },
  38: {
    conditions: [['ヘッダフィールドの拡張', 'message-parts'], ['サーバ間でメッセージを転送', 'mail-transfer'], ['見出しや段落', 'body-markup'], ['テキスト部分と添付画像部分を境界', 'message-parts']],
    options: [['HTML', 'body-markup'], ['MHS', 'message-handling-system'], ['MIME', 'message-parts'], ['SMTP', 'mail-transfer']],
  },
  40: {
    conditions: [['利用者を認証', 'access-auth'], ['対応するIPアドレス', 'name-lookup'], ['侵入とみられる通信', 'intrusion-detection'], ['64ビット単位', 'block-encryption']],
    options: [['DES', 'block-encryption'], ['DNS', 'name-lookup'], ['IDS', 'intrusion-detection'], ['RADIUS', 'access-auth']],
  },
  41: {
    conditions: [['ネットワーク層', 'ip-protection'], ['遠隔のシェル', 'remote-terminal'], ['TLSの前身', 'web-over-transport'], ['1対1の回線', 'point-to-point']],
    options: [['IPsec', 'ip-protection'], ['PPP', 'point-to-point'], ['SSH', 'remote-terminal'], ['SSL', 'web-over-transport']],
  },
  45: {
    conditions: [['動的な振る舞い', 'interaction'], ['インスタンスとリンク', 'snapshot'], ['属性・操作とクラス間', 'types-and-associations'], ['名前空間', 'grouping']],
    options: [['オブジェクト図', 'snapshot'], ['クラス図', 'types-and-associations'], ['シーケンス図', 'interaction'], ['パッケージ図', 'grouping']],
  },
  46: {
    conditions: [['カプセル化', 'hide-implementation'], ['ユーザ定義型の追加', 'new-type'], ['継承', 'inherit-members'], ['多相性', 'dispatch']],
    options: [['内部データ構造やメソッドの実装', 'hide-implementation'], ['ユーザ定義型を追加', 'new-type'], ['親クラスの属性', 'inherit-members'], ['同一メッセージを送っても', 'dispatch']],
  },
  47: {
    conditions: [['方式設計', 'architecture'], ['顧客との仕様合意', 'agreement'], ['ソフトウェア詳細設計', 'detailed-design'], ['聞き取った要求の分析', 'analysis']],
    options: [['顧客に意見を求めて仕様を決定', 'agreement'], ['どのように実現させるか', 'architecture'], ['1行ごとの処理', 'detailed-design'], ['段階的に詳細化して分析', 'analysis']],
  },
  48: {
    conditions: [['システム適格性確認テスト', 'business-scenarios'], ['結合テスト', 'component-boundaries'], ['分岐網羅', 'branch-outcomes'], ['命令網羅だけ', 'statement-execution']],
    options: [['実際に業務で使うデータ', 'business-scenarios'], ['ユニット間のインタフェース', 'component-boundaries'], ['全分岐を1回以上', 'branch-outcomes'], ['全命令が1回以上', 'statement-execution']],
  },
  50: {
    conditions: [['構成管理に起因しない', 'outside-configuration'], ['同じ条件で試験', 'outside-configuration'], ['並行運用', 'outside-configuration'], ['新規配布', 'outside-configuration']],
    options: [
      [['手続に従わず', 'approval'], ['単体テストレベル', 'outside-configuration'], ['それぞれが一致していない', 'revision-pairing'], ['派生プログラムに反映されない', 'propagation']],
      [['境界値をテストケースから漏らし', 'outside-configuration'], ['別の版の設計書', 'revision-pairing'], ['承認を受けていない設定値', 'approval'], ['派生版へ反映したか記録', 'propagation']],
      [['設定ファイルを特定できなかった', 'revision-pairing'], ['変更履歴を残さず', 'revision-history'], ['計算式を実装で取り違えて', 'outside-configuration'], ['別系列への反映を追跡', 'propagation']],
      [['ソース版の記録がない', 'revision-pairing'], ['承認前の仕様書', 'approval'], ['設定の組を追跡できない', 'revision-history'], ['同時アクセス数の想定が少なく', 'outside-configuration']],
    ],
  },
  53: {
    conditions: [['入力，出力など', 'functional-size'], ['ソースコードの行数', 'size-effort-regression'], ['標準化されたタスク', 'task-effort'], ['レイリー曲線', 'staffing-curve']],
    options: [['COCOMO', 'size-effort-regression'], ['標準タスク法', 'task-effort'], ['ファンクションポイント法', 'functional-size'], ['プットナム', 'staffing-curve']],
  },
};
