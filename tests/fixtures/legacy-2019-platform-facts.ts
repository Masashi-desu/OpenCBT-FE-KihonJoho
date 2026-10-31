/** Manual source transcription and concept classifications. No generator imports.
 * Required input predicates are fixed independently of the production builds. */
export const legacy2019PlatformChoices:Record<string,string[]>={
s4:["個々の行動に対しての善しあしを得点として与えることによって、得点が最も多く得られるような方策を学習する。","コンピュータ利用者の挙動データを蓄積し、挙動データの出現頻度に従って次の挙動を推論する。","正解のデータを提示したり、データが誤りであることを指摘したりすることによって、未知のデータに対して正誤を得ることを助ける。","正解のデータを提示せずに、統計的性質や、ある種の条件によって入力パターンを判定したり、クラスタリングしたりする。"],
s8:["リエントラント","リカーシブ","リユーザブル","リロケータブル"],
s12:["高温の印字ヘッドのピンを感熱紙に押し付けることによって印刷を行う。","コンピュータグラフィックスを建物、家具など凹凸のある立体物に投影する。","熱溶解積層方式などによって、立体物を造形する。","立体物の形状を感知して、3Dデータとして出力する。"],
s22:["AND回路","NAND回路","OR回路","XOR回路"],
s35:["RFIDを用いるIoT（Internet of Things）技術の一つであり、物流ネットワークを最適化するためのソフトウェアアーキテクチャ","様々なコンテンツをインターネット経由で効率よく配信するために開発された、ネットワーク上のサーバの最適配置手法","データ転送と経路制御の機能を論理的に分離し、データ転送に特化したネットワーク機器とソフトウェアによる経路制御の組合せで実現するネットワーク技術","データフロー図やアクティビティ図などを活用し、業務プロセスの問題点を発見して改善を行うための、業務分析と可視化ソフトウェアの技術"],
s36:["Webサイトなどにおいて、コンピュータではなく人間がアクセスしていることを確認する。","公開鍵暗号と共通鍵暗号を組み合わせて、メッセージを効率よく暗号化する。","通信回線を流れるパケットをキャプチャして、パケットの内容の表示や解析、集計を行う。","電子政府推奨暗号の安全性を評価し、暗号技術の適切な実装法、運用法を調査、検討する。"],
s79:["印刷、撮影、複写などの方法によって著作物を複製する権利","公衆からの要求に応じて自動的にサーバから情報を送信する権利","著作物の複製物を公衆に貸し出す権利","自らの意思に反して著作物を変更、切除されない権利"],
a18:["Aの実行中にBに起動がかかると、Aを実行可能状態にしてBを実行する。","Aの実行中にBに起動がかかると、Aを待ち状態にしてBを実行する。","Bの実行中にAに起動がかかると、Bを実行可能状態にしてAを実行する。","Bの実行中にAに起動がかかると、Bを待ち状態にしてAを実行する。"],
a19:["最初のバックアップの後、ファイル更新を示す情報があるファイルだけをバックアップし、ファイル更新を示す情報は変更しないでそのまま残しておく。","最初のバックアップの後、ファイル更新を示す情報にかかわらず、全てのファイルをバックアップし、ファイル更新を示す情報はリセットする。","直前に行ったバックアップの後、ファイル更新を示す情報があるファイルだけをバックアップし、ファイル更新を示す情報はリセットする。","直前に行ったバックアップの後、ファイル更新を示す情報にかかわらず、全てのファイルをバックアップし、ファイル更新を示す情報は変更しないでそのまま残しておく。"],
};
/** Four source propositions keep these roles. A description can imply other
 * capabilities (e.g. reentrant also reusable); its named property is classified. */
export const legacy2019PlatformRoles:Record<string,string[]>={s4:["reward-policy","unspecified-frequency-prediction","teacher-data","unlabelled-clustering"],s8:["reentry","recursion","serial-reuse","relocation"],s12:["thermal-paper","projection","manufacturing","shape-reading"],s22:["and","nand","or","xor"],s35:["rfid-logistics","content-placement","control-forwarding","business-process-visualization"],s36:["human-test","hybrid-encryption","packet-analysis","crypto-evaluation"],s79:["reproduction","automatic-public-transmission","lending","integrity-moral-right"],a18:["A-ready-switch-B","A-blocked-switch-B","B-ready-switch-A","B-blocked-switch-A"],a19:["selected-keep-flags","all-clear-flags","selected-clear-flags","all-keep-flags"]};
export const legacy2019PlatformTargets:Record<string,string[]>={s4:["teacher-data","reward-policy","unlabelled-clustering"],s8:["reentry","recursion","serial-reuse","relocation"],s12:["manufacturing","thermal-paper","projection","shape-reading"],s35:["control-forwarding","content-placement","business-process-visualization"],s36:["human-test","hybrid-encryption","packet-analysis","crypto-evaluation"],s79:["integrity-moral-right","reproduction","automatic-public-transmission","lending"]};
export const legacy2019PlatformPrompts:Record<string,string[]>={
s4:["教師あり学習","強化学習","教師なし学習"].map(t=>`機械学習における${t}の説明として、最も適切なものはどれか。`),
s8:["複数のプロセスから同時に呼び出されたときに、互いに干渉することなく並行して動作することができるプログラムの性質を表すものはどれか。","実行中に自分自身を呼び出して処理を進めることができるプログラムの性質を表すものはどれか。","一度実行した後、再び読み込まなくても繰り返して実行することができるプログラムの性質を表すものはどれか。","主記憶上に配置する位置を変えても実行することができるプログラムの性質を表すものはどれか。"],
s12:["3Dプリンタ","感熱式プリンタ","プロジェクションマッピング","3Dスキャナ"].map(t=>`${t}の機能の説明として、適切なものはどれか。`),
s22:["二つの入力A、Bがともに1のときだけ、出力Xが0になる","二つの入力A、Bがともに1のときだけ、出力Xが1になる","二つの入力A、Bがともに0のときだけ、出力Xが0になる","二つの入力A、Bの値が異なるときだけ、出力Xが1になる"].map(t=>`二つの入力と一つの出力をもつ論理回路で、${t}回路はどれか。`),
s35:["OpenFlowを使ったSDN（Software-Defined Networking）の説明として、適切なものはどれか。","CDN（Content Delivery Network）を構築する際のサーバ配置の考え方に対応する説明はどれか。","BPM（Business Process Management）を支援するソフトウェア技術に対応する説明はどれか。"],
s36:["CAPTCHA","ハイブリッド暗号","パケットキャプチャ","CRYPTREC"].map(t=>`${t}の目的はどれか。`),
s79:["著作者人格権に該当するもの","複製権の説明","自動公衆送信に関する権利の説明","貸与権の説明"].map(t=>`${t}はどれか。`),
a18:["Aの方がBよりも","Bの方がAよりも"].map(t=>`優先度に基づくプリエンプティブなスケジューリングを行うリアルタイムOSで、二つのタスクA、Bをスケジュールする。${t}優先度が高い場合にリアルタイムOSが行う動作のうち、適切なものはどれか。`),
a19:["増分","差分"].map(t=>`バックアップ方式の説明のうち、${t}バックアップはどれか。ここで、最初のバックアップでは、全てのファイルのバックアップを取得し、OSが管理しているファイル更新を示す情報はリセットされるものとする。`),
};
