// Independently reviewed semantic facts, keyed by displayed meaning, not generated answer index.
type Matchers = Readonly<Record<string, RegExp>>;
type SemanticRule = { asks: Matchers; choices: Matchers; basis: string };
export const autumn2013KnowledgeFacts: Readonly<Record<number, SemanticRule>> = {
  27: {
    asks: { interpolation: /モーフィングの説明/, capture: /モーションキャプチャ/, fill: /フラッドフィル/ },
    choices: { interpolation: /AからBへ.*中間/, capture: /身体の動き.*収集/, layering: /視点から遠い順に重ね/, fill: /閉領域を同一色で彩色/ },
    basis: '中間画像の補間は形状変化。撮影した運動の再生は実測データを利用。奥行きを作る合成と領域内の塗りつぶしは別の処理。',
  },
  28: {
    asks: { procedure: /命令群をあらかじめサーバ上のDBMS/, twophase: /参加者が準備できたこと/, group: /確定ログをまとめて永続記憶/ },
    choices: { twophase: /^2相コミットメント$/, group: /^グループコミットメント$/, threads: /^サーバプロセスのマルチスレッド化$/, procedure: /^ストアドプロシージャ$/ },
    basis: 'DBMSへ処理を預けると複数の命令をまとめて呼び出せる。分散原子確定の準備と、ログflushの共用、実行単位の並行化は機構が異なる。',
  },
  29: {
    asks: { relation: /^関係データベース/, tree: /^階層型データベース/, object: /^オブジェクト指向データベース/, xml: /^XMLデータベース/ },
    choices: { tree: /親レコードと子レコード.*ポインタ/, xml: /タグを用いて/, object: /データと手続を一体化/, relation: /2次元の表/ },
    basis: '関係は属性と組の集合、階層は木、XMLは要素と属性、オブジェクトは状態と動作を保持。',
  },
  30: {
    asks: { required: /主キー(?:制約|を定義)/, referenced: /外部キーを定義.*列にNULLを許し/ },
    choices: { required: /^キー値が空でないこと$/, single: /列が一つ/, first: /表の先頭/, referenced: /別の表の候補キーとキー値が一致/, forbid: /NULLのレコードを禁止/ },
    basis: '主キーは非NULLと一意性を要求し列順に依存しない。複合主キーも可能。NULLを許す外部キーで値があるときは対応先が必要。',
  },
  34: {
    asks: { repeater: /物理層/, bridge: /データリンク層/, router: /ネットワーク層/ },
    choices: { gateway: /^ゲートウェイ$/, bridge: /^ブリッジ$/, repeater: /^リピータ$/, router: /^ルータ$/ },
    basis: '物理信号の中継はリピータ、フレーム単位の中継はブリッジ、IPパケットの経路転送はルータ。上位プロトコル変換と区別する。',
  },
  35: {
    asks: { arp: /IPアドレスからMACアドレスを取得/, dhcp: /サブネットマスク.*動的に割り当て/, icmp: /宛先へ配送できなかったことを通知/, rarp: /自身のMACアドレス.*自分のIPアドレス/ },
    choices: { arp: /^ARP$/, dhcp: /^DHCP$/, icmp: /^ICMP$/, rarp: /^RARP$/ },
    basis: 'RFC 826、2131、792、903で、解決の向き、アドレス設定配布、エラー通知、旧方式の逆解決を区別。',
  },
  36: {
    asks: { mime: /静止画，動画，音声/, pop: /メールボックス.*メッセージを取得/, ftp: /ファイルサーバ.*ファイルを送受信/ },
    choices: { ftp: /^FTP$/, mime: /^MIME$/, pop: /^POP$/, telnet: /^TELNET$/ },
    basis: 'RFC 2045、1939、959、854で、内容形式、メール取得、ファイル転送、対話型端末の機能を区別。',
  },
  39: {
    asks: { share: /リスク共有/, reduce: /活動と原因を維持.*リスク低減/, avoid: /リスク回避/ },
    choices: { reduce: /損失の発生率を低下/, share: /保険.*他者.*リスクを分散/, remove: /リスクの原因を除去/, avoid: /活動を中止/, organize: /単位に分解するか集約/ },
    basis: 'NIST SP 800-39 §3.3。共有・移転は負担分担、低減は発生又は影響の緩和、回避はリスクが生じる活動の中止。',
  },
  40: {
    asks: { personalWork: /BYOD/, companyBoth: /COPE/, companyWorkOnly: /COBO/ },
    choices: { companyWork: /貸与された情報端末を，客先/, companyPrivate: /貸与された情報端末を，自宅/, personalPrivate: /私的に保有.*休憩時間/, personalWork: /私的に保有する情報端末を業務に利用/, companyBoth: /企業が端末を貸与.*私的利用も認める/, companyWorkOnly: /貸与された情報端末を業務専用/ },
    basis: 'NIST SP 1800-21のモバイル配備区分。所有者と、業務・私的利用の許可を別々に評価する。',
  },
  41: {
    asks: { waf: /SQLインジェクション.*遮断/, vpn: /社内ネットワークへ暗号化した遠隔接続/, balance: /要求を個別のサーバへ振り分け/ },
    choices: { vpn: /^SSL-VPN機能$/, waf: /^WAF$/, cluster: /^クラスタ構成$/, balance: /^ロードバランシング機能$/ },
    basis: '攻撃の検査はアプリケーション層、暗号化トンネルは接続保護、負荷分散は要求の行先制御、クラスタは構成。',
  },
  42: {
    asks: { patch: /マルウェア対策のうち/, oldScan: /以前から保存しているファイル中に潜む/, quarantine: /受信メールの添付ファイル.*開く前に検出/ },
    choices: { afterOnly: /最新化した日時以降に作成したファイルだけ/, patch: /脆弱性を突いて感染しないように.*修正パッチ/, unusedPort: /使用しないTCPポート宛て/, dynamic: /動的グローバルIPアドレス/, oldScan: /最新化より前から保存しているファイルを含めてスキャン/, quarantine: /添付ファイルを開く前に.*隔離/ },
    basis: '定義更新時刻は保存済みファイルの感染時刻ではない。脆弱性を修正し、ファイル検査は別に行う。ポート制限・動的公開IPで添付を検査しない。',
  },
  43: {
    asks: { salami: /サラミ法/, sniff: /パケットスニッフィング/, scavenge: /スカベンジング/ },
    choices: { credentials: /パスワードやIDを盗み出してデータを盗用/, phishing: /偽のログイン画面に誘導/, sniff: /送受信されているデータを不正に傍受/, salami: /多数の資産から少しずつ詐取/, scavenge: /プログラム実行後.*残っている情報/ },
    basis: '資産を微少量ずつ取る、流れているデータを観測する、処理後の残留情報から回収する、認証情報を窃取するという対象・時点の違い。',
  },
  47: {
    asks: { data: /データ中心分析・設計技法/, functions: /機能を起点とした構造化設計技法/, objects: /オブジェクト指向の分析・設計技法/ },
    choices: { functions: /機能の詳細化.*プログラムを分割/, objects: /データ構造や手続を局所的に変更/, data: /対象業務領域のモデル化.*情報資源のデータ構造/, physical: /最も効率よくアクセス/ },
    basis: '処理機能の階層分解、業務データの概念モデル化、状態と手続のカプセル化、物理アクセス最適化を分ける。',
  },
  48: {
    asks: { method: /振る舞いを記述したもの/, instance: /生成される個々のオブジェクト/, attribute: /状態を表すデータの項目/, type: /振る舞いをまとめた型の定義/ },
    choices: { instance: /^インスタンス$/, type: /^クラス$/, attribute: /^属性$/, method: /^メソッド$/ },
    basis: 'クラスは型、インスタンスはその値又は実体、属性は状態の項目、メソッドは動作。',
  },
  49: {
    asks: { assertion: /成立する変数間の関係.*論理式を埋め込んで/, coverage: /分岐の割合を集計/, snapshot: /変数や記憶領域の内容.*まとめて出力/, tracing: /通過した順に記録/ },
    choices: { assertion: /^アサーションチェック$/, tracing: /^コード追跡$/, snapshot: /^スナップショットダンプ$/, coverage: /^テストカバレッジ分析$/ },
    basis: '命題の真偽、イベント列、状態断面、対象集合に対する被覆率はそれぞれ独立した観測結果。',
  },
  50: {
    asks: { stub: /トップダウン方式/, driver: /ボトムアップ方式/, emulator: /対象機器の命令実行や入出力.*代替/, debugger: /指定箇所で実行を停止.*変数値/ },
    choices: { emulator: /^エミュレータ$/, stub: /^スタブ$/, debugger: /^デバッガ$/, driver: /^ドライバ$/ },
    basis: '呼ばれる下位の代役と呼ぶ上位の代役、対象機械の挙動再現、ブレークポイント観測を区別。',
  },
  51: {
    asks: { uniqueFinite: /^プロジェクトの特性/, standardOngoing: /運用自体を対象/, standardFinite: /一回分の処理だけを対象/ },
    choices: { uniqueOngoing: /^独自性はあるが，有期性がない。$/, standardFinite: /^独自性はないが，有期性がある。$/, uniqueFinite: /^独自性も有期性もある。$/, standardOngoing: /^独自性も有期性もない。$/ },
    basis: 'PMIのプロジェクト定義で独自性と終了の存在を照合。定型業務では業務全体の継続性と単一回の有限性を分けて読む。',
  },
  52: {
    asks: { wbs: /WBS（Work Breakdown Structure）/, critical: /CPM（Critical Path Method）/, timeline: /ガントチャート/ },
    choices: { cost: /トレードオフ.*総費用の最適化/, critical: /順序関係.*クリティカルパス/, timeline: /日程を横棒.*進捗/, wbs: /階層に分解.*管理可能/ },
    basis: 'PMIのWBS解説で階層的なスコープ分解を照合。依存経路、時間軸表示、期間と費用のトレードオフを区別する。',
  },
};
