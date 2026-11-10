type KnowledgeCase = { condition: RegExp; expected: string; conclusion: RegExp };
type KnowledgeFact = {
  basis: string;
  options: Readonly<Record<string, RegExp>>;
  cases: readonly KnowledgeCase[];
};

export const knowledgeFacts: Readonly<Record<number, KnowledgeFact>> = {
  27: {
    basis: 'https://www.postgresql.org/docs/current/indexes-intro.html | https://www.postgresql.org/docs/current/ddl-constraints.html | https://www.postgresql.org/docs/current/ddl-partitioning.html',
    options: { foreign: /別の表の主キー|参照先の主キー/, index: /検索速度の向上|探索構造から対象行/,
      storage: /ディスク容量が節約|別々の格納単位/, unique: /重複する値がない|同一値が複数行/ },
    cases: [
      { condition: /インデックスを設定/, expected: 'index', conclusion: /行の格納位置を効率/ },
      { condition: /外部キー制約を設定/, expected: 'foreign', conclusion: /対応するキーが参照先に存在/ },
      { condition: /一意性制約を設定/, expected: 'unique', conclusion: /同一値が複数行に登録されることを防ぐ/ },
      { condition: /範囲パーティションを設定/, expected: 'storage', conclusion: /列値の範囲によって行を複数の格納単位/ },
    ],
  },
  30: {
    basis: 'https://www.postgresql.org/docs/current/tutorial-transactions.html | https://www.postgresql.org/docs/current/transaction-iso.html',
    options: { server: /起動から停止/, checkpoint: /^チェックポイントから次のチェックポイント/, backup: /バックアップ取得から媒体障害/,
      transaction: /トランザクションの開始からコミット又はロールバック/ },
    cases: [
      { condition: /原子性（atomicity）/, expected: 'transaction', conclusion: /全ての更新を確定するか，全てを取り消す/ },
      { condition: /独立性（isolation）/, expected: 'transaction', conclusion: /並行するトランザクション間で処理の干渉を抑える/ },
      { condition: /耐久性（durability）/, expected: 'transaction', conclusion: /確定したトランザクションの結果を障害後にも保持/ },
      { condition: /一貫性（consistency）/, expected: 'transaction', conclusion: /トランザクションの前後で整合性制約/ },
    ],
  },
  34: {
    basis: 'https://www.itu.int/rec/T-REC-X.200-199407-I/en',
    options: { session: /^セション層$/, link: /^データリンク層$/, transport: /^トランスポート層$/, network: /^ネットワーク層$/ },
    cases: [
      { condition: /中継と経路制御/, expected: 'network', conclusion: /経路制御はネットワーク層/ },
      { condition: /同一リンク上でのフレームの転送/, expected: 'link', conclusion: /データリンク層は同一リンク上/ },
      { condition: /上位層に対してエンドシステム間のデータ転送/, expected: 'transport', conclusion: /トランスポート層はエンド間転送/ },
      { condition: /応用間の対話を管理し，同期点/, expected: 'session', conclusion: /セション層が対話を管理/ },
    ],
  },
  35: {
    basis: 'https://www.itu.int/rec/T-REC-X.200-199407-I/en | https://www.rfc-editor.org/rfc/rfc2131.html | https://www.rfc-editor.org/rfc/rfc791.html',
    options: { lease: /動的な割当て|動的に割り当て/, switch: /宛先MACアドレスが存在|学習済みの宛先MACアドレス/,
      repeat: /全てのLANポート|入力ポートを除く/, fragment: /ネットワーク層で分割|MTUに収める/ },
    cases: [
      { condition: /スイッチングハブ（レイヤ2スイッチ）/, expected: 'switch', conclusion: /宛先MACアドレスを基にポートを選ぶ/ },
      { condition: /DHCPサーバの機能/, expected: 'lease', conclusion: /アドレスなどを動的に貸し出す/ },
      { condition: /リピータハブの機能/, expected: 'repeat', conclusion: /物理層で入力信号を再生/ },
      { condition: /IPv4ルータが行う/, expected: 'fragment', conclusion: /分割禁止が指定されていない.*MTU.*分割/ },
    ],
  },
  37: {
    basis: 'https://www.rfc-editor.org/rfc/rfc5452.html | https://www.rfc-editor.org/rfc/rfc5358.html | https://www.rfc-editor.org/rfc/rfc5936.html',
    options: { recon: /バージョン情報を入手/, poison: /誤ったドメイン情報を注入/,
      denial: /サービスを妨害.*踏み台|送信元を攻撃対象のアドレスに偽装/, transfer: /ゾーン情報をまとめて転送/ },
    cases: [
      { condition: /DNSキャッシュポイズニング/, expected: 'poison', conclusion: /キャッシュに誤った名前とアドレスの対応/ },
      { condition: /製品情報を手掛かりとして脆弱性を調べる偵察/, expected: 'recon', conclusion: /該当版の既知の弱点/ },
      { condition: /DNSリフレクション攻撃/, expected: 'denial', conclusion: /送信元のアドレスを攻撃対象に偽装/ },
      { condition: /ゾーン転送を悪用/, expected: 'transfer', conclusion: /ゾーンのレコードをまとめて別のサーバへ/ },
    ],
  },
  40: {
    basis: 'https://www.ipa.go.jp/security/vuln/websecurity/about.html | https://csrc.nist.gov/glossary/term/worm',
    options: { sql: /データベースに悪意のある問合せ/, csrf: /別のWebサイトで.*意図しない操作/,
      worm: /自己伝染を繰り返し/, xss: /訪問者のブラウザで実行/ },
    cases: [
      { condition: /^SQLインジェクションの説明/, expected: 'sql', conclusion: /入力をデータベース命令として解釈/ },
      { condition: /クロスサイトリクエストフォージェリ/, expected: 'csrf', conclusion: /認証状態を利用して別サイトで意図しない処理/ },
      { condition: /データベースサーバを宿主として自己伝染/, expected: 'worm', conclusion: /自分を複製して感染を広げる/ },
      { condition: /クロスサイトスクリプティング/, expected: 'xss', conclusion: /利用者のブラウザで対象サイトの内容として実行/ },
    ],
  },
  41: {
    basis: 'https://csrc.nist.gov/pubs/fips/180-4/upd1/final | https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final',
    options: { date: /ファイルの更新日(?:時)?を/, hash: /基準ハッシュ値|ファイルのハッシュ値を保管/,
      memory: /メモリ使用率を定期的に/, protocol: /通信を監視|通信を観測/ },
    cases: [
      { condition: /コンテンツの改ざん/, expected: 'hash', conclusion: /更新日時を偽装された場合も内容の変更を検知/ },
      { condition: /更新日時だけが変更/, expected: 'date', conclusion: /更新日時を直接比較/ },
      { condition: /メモリ使用率が時間の経過とともに/, expected: 'memory', conclusion: /複数の時点で採取，|複数の時点で採取し/ },
      { condition: /許可していない通信プロトコル/, expected: 'protocol', conclusion: /使われたプロトコルと許可したものを比較/ },
    ],
  },
  43: {
    basis: 'https://csrc.nist.gov/pubs/sp/800/83/r1/final | https://csrc.nist.gov/pubs/fips/180-4/upd1/final',
    options: { code: /逆アセンブル/, pattern: /パターンマッチング|固有のバイト列/,
      hash: /ファイルのハッシュ値/, behavior: /不正な動作|実行時のファイル操作/ },
    cases: [
      { condition: /調査手法に関する記述のうち，適切なもの/, expected: 'code', conclusion: /機械語を人が分析できる命令の表現/ },
      { condition: /既知の識別用バイト列を見付ける/, expected: 'pattern', conclusion: /特定のバイト列との照合/ },
      { condition: /ファイル全体から効率よく照合/, expected: 'hash', conclusion: /既知検体のハッシュ値を比較/ },
      { condition: /ファイル書換えの実際の挙動/, expected: 'behavior', conclusion: /実行に伴ってどのファイルが書き換わるかを観測/ },
    ],
  },
  44: {
    basis: 'https://csrc.nist.gov/pubs/sp/800/115/final | https://www.istqb.org/certifications/certified-tester-foundation-level',
    options: { walk: /^ウォークスルー$/, inspection: /^ソフトウェアインスペクション$/,
      penetration: /^ペネトレーションテスト$/, regression: /^リグレッションテスト$/ },
    cases: [
      { condition: /実際に攻撃して侵入/, expected: 'penetration', conclusion: /許可された範囲で実際に攻撃を試み/ },
      { condition: /作成者が内容や処理の流れを順に説明/, expected: 'walk', conclusion: /作成者が主導/ },
      { condition: /進行役や記録役を定め/, expected: 'inspection', conclusion: /役割と手順を明確にして/ },
      { condition: /従来は正常だった機能.*再検査/, expected: 'regression', conclusion: /変更前に成立していた機能への副作用/ },
    ],
  },
  45: {
    basis: 'https://www.ipa.go.jp/shiken/syllabus/gaiyou.html | https://csrc.nist.gov/glossary/term/fault_tolerance',
    options: { safe: /安全に停止/, soft: /利用できる機能を制限/, tolerant: /二重化などの冗長/, proof: /利用者が誤った操作/ },
    cases: [
      { condition: /フールプルーフに該当/, expected: 'proof', conclusion: /人が誤って操作しても危険・異常につながらない/ },
      { condition: /フェールセーフに該当/, expected: 'safe', conclusion: /故障時に安全側へ移行/ },
      { condition: /フェールソフトに該当/, expected: 'soft', conclusion: /縮退状態で運転を続ける/ },
      { condition: /フォールトトレランスに該当/, expected: 'tolerant', conclusion: /全体として必要な機能を維持/ },
    ],
  },
  46: {
    basis: 'https://www.omg.org/spec/UML/2.4.1/About-UML',
    options: { activity: /^アクティビティ図$/, object: /^オブジェクト図$/, component: /^コンポーネント図$/, use: /^ユースケース図$/ },
    cases: [
      { condition: /インスタンス間の関係/, expected: 'object', conclusion: /インスタンスとリンク/ },
      { condition: /分岐や並行実行/, expected: 'activity', conclusion: /処理間の制御の流れ/ },
      { condition: /構成要素.*提供・要求するインタフェース/, expected: 'component', conclusion: /インタフェース，依存関係/ },
      { condition: /外にいるアクター.*達成する目的/, expected: 'use', conclusion: /アクターとユースケースの関係/ },
    ],
  },
  47: {
    basis: 'https://www.omg.org/spec/UML/2.4.1/About-UML | https://docs.oracle.com/javase/tutorial/java/concepts/',
    options: { class: /複数のオブジェクトを抽象化/, inherit: /基底クラスの性質を派生クラス/,
      general: /クラス間に共通する性質を抽出/, capsule: /実装をオブジェクトの内部に隠蔽/ },
    cases: [
      { condition: /カプセル化を説明/, expected: 'capsule', conclusion: /データと操作を一つにまとめ，内部の実装を隠す/ },
      { condition: /クラス化（分類）を説明/, expected: 'class', conclusion: /オブジェクトを共通の性質で抽象化/ },
      { condition: /継承を説明/, expected: 'inherit', conclusion: /属性や振る舞いを派生クラスが受け継ぐ/ },
      { condition: /既存クラスを対象とする汎化/, expected: 'general', conclusion: /複数のクラスに共通する性質を抽出/ },
    ],
  },
  48: {
    basis: 'https://www.istqb.org/certifications/certified-tester-foundation-level',
    options: { coverage: /テストデータの作成基準として|行き先を実行できるように/, black: /冗長なコード.*検出できない/,
      observe: /内部構造.*必要な.*実行された/, explosion: /増えると.*急増する/ },
    cases: [
      { condition: /ブラックボックステストに関する記述/, expected: 'black', conclusion: /出力へ影響しない冗長コードの存在を直接検出できない/ },
      { condition: /分岐網羅を目標.*テストデータの作成基準/, expected: 'coverage', conclusion: /条件分岐の各行き先を通る入力/ },
      { condition: /内部経路がテストの実行時に通ったか/, expected: 'observe', conclusion: /経路の通過を実行時に計測/ },
      { condition: /全実行経路を網羅.*必要なテストデータの件数/, expected: 'explosion', conclusion: /分岐が一つ増えるごとに経路の組合せ/ },
    ],
  },
  49: {
    basis: 'https://www.istqb.org/certifications/certified-tester-foundation-level | https://www.ipa.go.jp/shiken/syllabus/gaiyou.html',
    options: { unit: /個々のソフトウェアユニット/, algorithm: /アルゴリズムの妥当性/,
      interface: /ユニット間のインタフェース/, use: /利用者に提供するという視点/ },
    cases: [
      { condition: /運用テストにおける検査内容/, expected: 'use', conclusion: /システムが業務上の要求を満たす/ },
      { condition: /切り離して行う単体テスト/, expected: 'unit', conclusion: /個々のユニットの入出力がその仕様/ },
      { condition: /接続して行う結合テスト/, expected: 'interface', conclusion: /ユニット間の引数・データ形式・呼出し順/ },
    ],
  },
  50: {
    basis: 'https://www.ipa.go.jp/shiken/syllabus/gaiyou.html',
    options: { screen: /^画面レイアウト$/, plan: /^システム開発計画$/, physical: /^物理データベース仕様$/, flow: /^プログラム流れ図$/ },
    cases: [
      { condition: /外部設計を完了/, expected: 'screen', conclusion: /利用者に見える入出力や操作/ },
      { condition: /着手の判断を行う計画工程/, expected: 'plan', conclusion: /体制，範囲，日程などをまとめる/ },
      { condition: /実際の記憶領域へ配置する方式/, expected: 'physical', conclusion: /記憶領域への配置，索引の構成，格納方法/ },
      { condition: /順序や分岐を決める詳細設計/, expected: 'flow', conclusion: /実装前に処理の順序や分岐の関係/ },
    ],
  },
  51: {
    basis: 'https://www.pmi.org/learning/library/work-breakdown-structure-practice-standard-4591',
    options: { cost: /工数を算定してコスト/, wbs: /作業を階層に細分化/,
      schedule: /順序付けして，スケジュール/, activity: /成果物を生成するアクティビティを定義/ },
    cases: [
      { condition: /WBS作成のプロセス/, expected: 'wbs', conclusion: /管理できる単位まで階層的に細分化/ },
      { condition: /コストを見積もるプロセス/, expected: 'cost', conclusion: /工数や調達などから費用を見積もる/ },
      { condition: /先行関係を用いてスケジュールを作成/, expected: 'schedule', conclusion: /作業の順序や制約を踏まえて日程/ },
      { condition: /アクティビティを定義するプロセス/, expected: 'activity', conclusion: /実際に実施する活動を具体化/ },
    ],
  },
};
