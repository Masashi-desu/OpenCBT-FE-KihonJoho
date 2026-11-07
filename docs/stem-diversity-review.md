# 本文固定229系列の個別査読

2026年11月7日に、前回の未査読リストにある229系列を原問番号ごとに確認した。218系列は原形式のまま本文の対象・条件を切り替える生成器3.7.0へ改訂し、11系列は下表の検討案と理由で本文を固定する。同一AIによる一次資料の照合と独立実装の検算であり、外部の独立査読は受けていない。

原問の本文・前提・図表・注意書き・公式解答は各問題のoriginとsourceRefsに記録されたIPA公式の問題冊子・解答例で照合した。今回、13問題集の問題・解答PDF計26ファイルを再取得し、既存SourceのSHA-256との一致を確認した。原資料の公表日がPDFに明記されない場合は既存の年度・期・資料名で識別する。原画像と素材別の権利表示を維持し、改変部分と独自解説を分ける。

各改修は、既存の有効入力を現行系列の入力として保持し、最初のフィールドに一つの新しい条件を加える。追加条件では残るフィールドを基準値に固定し、無効な組合せを拒否する。旧生成器版を互換用に残さず、問題改訂・テンプレート・ミックス参照・hashを更新する。

## 問ごとの判定

| 原問 | 結果 | 検討した本文の可変案 | 判定根拠 |
| --- | --- | --- | --- |
| [2016h28a-fe-am-13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=9)（p.9、公式正答ウ） | 改修 | 業務ロジックを更新する位置 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=9)（p.9、公式正答エ） | 改修 | 待機系と稼働中の負荷分散 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=11)（p.11、公式正答ウ） | 固定 | 起点プロセス又は割込み要因を変える案 | 図のa～cは実行中プロセスの保存、次の実行対象の選択、選択した状態の復元という固定の依存順を問う。プロセス名の交換では意味が変わらず、a～cを別の処理へ変えると保存・復元の役割と図の接続を変える。既存の誤答の組合せを使い、問いを保持する。 |
| [2016h28a-fe-am-19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=12)（p.12、公式正答ア） | 改修 | LRUとFIFO | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=14)（p.14、公式正答ア） | 固定 | 多数決の閾値又は正負論理を変える案 | 3入力多数決は二つ以上の1で1となる固定関数である。閾値を1又は3に変えると多数決回路からOR又はANDへ学習対象が変わる。正負論理を同時反転しても多数決の真理値表は同じで本文の実質的な変化にならない。既存の全8状態と4回路の実ゲートを検証する。 |
| [2016h28a-fe-am-26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=15)（p.15、公式正答イ） | 改修 | 実体の関係とデータの流れ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=5)（p.5、公式正答ア） | 改修 | 三枚での販売から二枚での販売へ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=20)（p.20、公式正答ア） | 改修 | 完全性と可用性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-38](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=21)（p.21、公式正答ア） | 改修 | 改ざん検知と機密性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-39](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=21)（p.21、公式正答ウ） | 改修 | 証明書の発行と失効 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-40](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=21)（p.21、公式正答エ） | 改修 | カードの配送から紛失後の処理へ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28a-fe-am-5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=6)（p.6、公式正答ア） | 固定 | 音声と画像を切り替える案及び復号過程を問う案 | 三工程だけでアナログをディジタルへ変換する依存順は標本化、量子化、符号化で共通する。媒体名を替えても判定条件が変わらず、逆変換は原問の変換方向を変える。工程順序の4択を維持する。 |
| [2016h28a-fe-am-6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=6)（p.6、公式正答イ） | 固定 | 大小関係を逆に定義する案及び探索するキーを与える案 | 原問は各木が通常の2分探索木の全子孫の大小関係を満たすかを問う。逆順の独自定義は原問の順序関係を変更し、キーの探索結果は木を判定する解答対象を変える。木の節の値と違反する部分木は既存入力で実質的に可変である。 |
| [2016h28h-fe-am-10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=7)（p.7、公式正答ウ） | 固定 | 命令種別又はステージ名を変える案 | 指定された5段の命令フェッチ、デコード、実行、メモリアクセス、書込みの依存順は共通する。単に命令名を替えてもステージの順は変わらず、段の融合や専用の実行方式は指定の5段構成と工程の意味を変える。順序の4択を保持する。 |
| [2016h28h-fe-am-11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=8)（p.8、公式正答イ） | 改修 | 空間的局所性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=11)（p.11、公式正答ウ） | 改修 | 最適化と別機種向け翻訳 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=11)（p.11、公式正答ア） | 改修 | 静的解析と動的な網羅度測定 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=13)（p.13、公式正答ア） | 改修 | タプルとSQLの重複行 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=14)（p.14、公式正答ア） | 改修 | 外部キーと主キー | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-39](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=18)（p.18、公式正答イ） | 改修 | 証明書の発行と失効 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-40](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=18)（p.18、公式正答イ） | 改修 | 再登録URLの有効性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-41](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=19)（p.19、公式正答ウ） | 改修 | SaaSの利用者アカウント管理 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-42](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=19)（p.19、公式正答エ） | 改修 | 退職する従業員のBYOD | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-44](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=20)（p.20、公式正答ウ） | 改修 | 圧縮して保存する証拠データ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-45](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=20)（p.20、公式正答ウ） | 改修 | 読書きできない磁気ディスクの廃棄 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-47](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=21)（p.21、公式正答ウ） | 改修 | 必要な項目と共有・制御依存 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-50](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=22)（p.22、公式正答イ） | 改修 | 構成管理以外の性能設計 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-53](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=23)（p.23、公式正答イ） | 改修 | 二本のクリティカルパス | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-55](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=24)（p.24、公式正答ウ） | 改修 | 業務停止の重大性と試験導入 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=6)（p.6、公式正答ウ） | 改修 | 偶数の二重階乗と再帰式 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2016h28h-fe-am-77](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=33)（p.33、公式正答ア） | 固定 | 製品種類、累積割合の基準、重点要因数を変える案 | 原問は要因別の降順の棒と累積割合の線というパレート図の形式を選ぶ。製品名の置換は実質的条件差でなく、閾値から要因数を求める問いは図の種類を選ぶ解答対象を変える。各候補の棒・折れ線の実データを変える既存入力を保持する。 |
| [2016h28h-fe-am-9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=7)（p.7、公式正答ア） | 改修 | CPU以外が処理時間の制約 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=6)（p.6、公式正答ア） | 改修 | 命令で明示するソフトウェア割込み | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=7)（p.7、公式正答ウ） | 改修 | 分散パリティとミラーリング | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=7)（p.7、公式正答ア） | 改修 | 同時照合とホットスタンバイ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=8)（p.8、公式正答ア） | 改修 | IaaSで保持する運用責任 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=8)（p.8、公式正答ア） | 改修 | 未解放とスラッシング | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=9)（p.9、公式正答ア） | 改修 | 装置監視と排他制御 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=10)（p.10、公式正答ア） | 改修 | 主記憶への割当枠数 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=11)（p.11、公式正答ウ） | 改修 | 運動出力と物理量の検出 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=12)（p.12、公式正答エ） | 改修 | 複数拠点での更新確定 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=13)（p.13、公式正答ア） | 改修 | トランザクション特性とデータ独立性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=3)（p.3、公式正答ウ） | 改修 | 外乱を観測するフィードフォワード制御 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=14)（p.14、公式正答エ） | 改修 | UNDOとREDO | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=14)（p.14、公式正答イ） | 改修 | L2転送とDHCP | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=15)（p.15、公式正答エ） | 改修 | アドレス変換とパケットフィルタ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=16)（p.16、公式正答ア） | 改修 | 指令基盤と侵害された端末 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=16)（p.16、公式正答イ） | 改修 | キャッシュ汚染とゾーン転送 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-38](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=16)（p.16、公式正答エ） | 改修 | 暗号化方式と鍵共有方式 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-39](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=17)（p.17、公式正答ア） | 改修 | SQLインジェクションとXSS | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-40](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=17)（p.17、公式正答ウ） | 改修 | 署名生成鍵と署名検証鍵 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-41](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=18)（p.18、公式正答エ） | 改修 | 自己増殖と身代金要求 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-42](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=18)（p.18、公式正答ウ） | 改修 | CSIRTと技術標準化組織 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-43](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=18)（p.18、公式正答イ） | 改修 | リスクアセスメント後の意思決定と実施 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-44](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=19)（p.19、公式正答エ） | 改修 | 盗聴対策と許可した端末からの接続 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-48](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=20)（p.20、公式正答イ） | 改修 | 必要な項目と共有・制御依存 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-49](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=20)（p.20、公式正答イ） | 改修 | 同値分割と境界値 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-56](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=23)（p.23、公式正答ア） | 改修 | 復旧目標に合わせたバックアップ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-57](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=24)（p.24、公式正答ア） | 改修 | 雷サージと長時間の電源途絶 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=24)（p.24、公式正答エ） | 改修 | 例外処理の記録と事後確認 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-59](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=24)（p.24、公式正答イ） | 改修 | 回答が食い違う場合のヒアリング | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=5)（p.5、公式正答イ） | 改修 | 再帰とイベント駆動 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-60](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=25)（p.25、公式正答ア） | 改修 | 監査調書と監査報告書 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=26)（p.26、公式正答エ） | 改修 | 多様な時系列を使う故障予兆分析 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-64](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=26)（p.26、公式正答エ） | 改修 | 調達判断と第三者認証 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=5)（p.5、公式正答イ） | 改修 | オーバライドとオーバロード | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-70](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=29)（p.29、公式正答イ） | 改修 | 競争優位と相互接続 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-72](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=29)（p.29、公式正答エ） | 改修 | MRPと受注生産 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-73](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=30)（p.30、公式正答エ） | 改修 | 家庭とビルのエネルギー管理 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-74](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=30)（p.30、公式正答イ） | 改修 | 車両の走行音を使う学習 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-75](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=31)（p.31、公式正答ア） | 改修 | 経営の情報戦略とサービス運用 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-76](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=31)（p.31、公式正答イ） | 改修 | 実務内の指導と職場外の研修 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-79](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=32)（p.32、公式正答イ） | 改修 | 派遣契約における雇用と指揮命令 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29a-fe-am-8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=6)（p.6、公式正答エ） | 改修 | Webサーバを使わないWindowsでの実行 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-1](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=3)（p.3、公式正答エ） | 改修 | 集合の包含関係を与える恒等式 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=8)（p.8、公式正答イ） | 改修 | 並列化が困難なCPU処理 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=16)（p.16、公式正答エ） | 改修 | ソートマージとハッシュ結合 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=18)（p.18、公式正答ア） | 改修 | IP経路選択とMAC転送 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-39](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=20)（p.20、公式正答ウ） | 改修 | 委託先の業務上の関係 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=4)（p.4、公式正答ア） | 改修 | 配列と単方向連結リストの先頭挿入 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-41](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=21)（p.21、公式正答ウ） | 改修 | 存在証明と時刻同期 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-43](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=23)（p.23、公式正答ウ） | 改修 | DMZと内部の通信を禁止した構成 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-46](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=24)（p.24、公式正答ア） | 改修 | 外部設計とプログラム内部設計 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-47](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=24)（p.24、公式正答ウ） | 改修 | 正式な検査と作成者主導の説明 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-48](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=24)（p.24、公式正答エ） | 改修 | オブジェクト間の関係 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-53](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=27)（p.27、公式正答エ） | 改修 | 安定傾向と増加の加速 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-56](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=28)（p.28、公式正答ウ） | 改修 | 要件抽出後の移行リハーサル | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=29)（p.29、公式正答ウ） | 改修 | 原案への反論と追加証拠 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-60](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=30)（p.30、公式正答ア） | 改修 | 他の専門家の支援と監査判断 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=31)（p.31、公式正答イ） | 改修 | 事業者のサーバと利用者の持込み | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-64](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=31)（p.31、公式正答エ） | 改修 | 私有端末上の業務領域の管理 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-65](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=31)（p.31、公式正答イ） | 改修 | 開発言語を変更するときの技術要件 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=6)（p.6、公式正答ウ） | 改修 | 二分探索とハッシュ探索 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-70](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=33)（p.33、公式正答ウ） | 改修 | 学習と成長から顧客の視点へ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-72](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=34)（p.34、公式正答ウ） | 改修 | プル方式と計画からの所要量 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-75](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=35)（p.35、公式正答ウ） | 改修 | 対立がある会議での進行 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-77](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=36)（p.36、公式正答イ） | 改修 | 営業活動と投資活動 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-79](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=37)（p.37、公式正答エ） | 改修 | アルゴリズムと創作的な表現 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2017h29h-fe-am-9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=7)（p.7、公式正答エ） | 改修 | 書込みの同時反映 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=6)（p.6、公式正答ウ） | 改修 | 次命令の位置とフェッチ済み命令 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=8)（p.8、公式正答エ） | 改修 | 物理分離と個別の増強 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=9)（p.9、公式正答イ） | 改修 | 要件確定後に性能試験を行うキャパシティ計画 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=10)（p.10、公式正答ウ） | 改修 | スプーリングとタスク切替え | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=11)（p.11、公式正答ア） | 改修 | 時間片と固定優先度 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=11)（p.11、公式正答エ） | 改修 | 字句解析後の最初の段階 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-2](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=3)（p.3、公式正答ウ） | 改修 | 差と排他的論理和から差のビット反転へ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=11)（p.11、公式正答ウ） | 改修 | リンカとローダ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=12)（p.12、公式正答エ） | 改修 | 一次電池と二次電池 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=13)（p.13、公式正答イ） | 改修 | 音声だけから音声と画面のタッチへ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=15)（p.15、公式正答イ） | 改修 | 辞書に値域も登録する場合 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=16)（p.16、公式正答ア） | 改修 | 別の行の更新と同じ行の更新 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=3)（p.3、公式正答ア） | 改修 | 学習モデルと明示的な推論規則 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=17)（p.17、公式正答ウ） | 改修 | 接続の目的とデータリンク層 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=18)（p.18、公式正答ア） | 改修 | パケット網による音声の伝送 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=18)（p.18、公式正答ア） | 改修 | 署名による完全性と暗号化による秘匿 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-38](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=19)（p.19、公式正答ウ） | 改修 | 共通鍵と公開鍵の対応 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-41](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=20)（p.20、公式正答エ） | 改修 | 指令サーバと配信の分散 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-42](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=21)（p.21、公式正答ウ） | 改修 | 検知と能動的な弱点の検査 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-43](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=21)（p.21、公式正答ウ） | 改修 | 起動の信頼と媒体の機密性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-44](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=22)（p.22、公式正答エ） | 改修 | 同じ公衆無線LANの利用者同士の分離 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-45](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=23)（p.23、公式正答ウ） | 改修 | 接続元と新たな自社ドメイン | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-46](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=23)（p.23、公式正答エ） | 改修 | UML相互作用図での順序表現 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-47](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=24)（p.24、公式正答イ） | 改修 | 二つのインスタンスの状態 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-48](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=24)（p.24、公式正答ウ） | 改修 | データの受渡しと分岐を選ぶ制御値 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-50](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=25)（p.25、公式正答イ） | 改修 | 継続的結合とテストファースト | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-51](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=25)（p.25、公式正答エ） | 改修 | 作業分解と日程表示 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=28)（p.28、公式正答エ） | 改修 | 定めた媒体利用手順の遵守 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-59](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=28)（p.28、公式正答エ） | 改修 | 未暗号化媒体の運搬と追跡 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-60](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=28)（p.28、公式正答エ） | 改修 | 整備運用と独立した監視 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-61](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=29)（p.29、公式正答エ） | 改修 | 投資前の意思決定と完了後の評価 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-62](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=29)（p.29、公式正答ウ） | 改修 | 業務プロセスの委託とアプリの利用 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=30)（p.30、公式正答イ） | 改修 | サービス指向と全体最適化 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-64](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=30)（p.30、公式正答イ） | 改修 | 計画の立案と変更の保守 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-67](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=32)（p.32、公式正答ア） | 改修 | 成長期と衰退期 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=5)（p.5、公式正答エ） | 改修 | 配列を走査するループの安全性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-71](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=34)（p.34、公式正答イ） | 改修 | 既存のアナログ機器の接続 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-72](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=34)（p.34、公式正答エ） | 改修 | 無線タグと光学式コード | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-73](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=34)（p.34、公式正答エ） | 改修 | O2Oとフリーミアム | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-79](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=37)（p.37、公式正答エ） | 改修 | 対応表のある仮名と集計情報 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=6)（p.6、公式正答エ） | 改修 | クラスの多重継承とインタフェース | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30a-fe-am-80](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=37)（p.37、公式正答ア） | 改修 | 発注者の直接の作業指示 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=7)（p.7、公式正答イ） | 改修 | 内部例外と外部通知 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=7)（p.7、公式正答ウ） | 改修 | キャッシュを超えるデータの一回走査 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=11)（p.11、公式正答エ） | 改修 | ルート起点とカレント起点 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=13)（p.13、公式正答ア） | 固定 | 3入力の閾値又は多数側の出力を変える案 | 指定の3入力多数決の関数は固定であり、閾値を変えるとAND又はOR、出力を反転すると少数決へ変わる。多数決の関数名、全8行の表、4回路を保つ。既存の3誤答の実ゲートを可変にし、全状態で正答一意性を検査する。 |
| [2018h30h-fe-am-25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=14)（p.14、公式正答エ） | 改修 | 動画の圧縮と配信の制御 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=14)（p.14、公式正答イ） | 改修 | 拡張現実と仮想現実 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=15)（p.15、公式正答ア） | 改修 | カーソル名と更新対象の表名 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=4)（p.4、公式正答ウ） | 改修 | 学習モデルと明示的な推論規則 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=17)（p.17、公式正答ア） | 改修 | 盲写宛先と中継の経路記録 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=18)（p.18、公式正答エ） | 改修 | 閲覧時の感染とDB命令の解釈 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=18)（p.18、公式正答ウ） | 改修 | サービス探索と特権昇格 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-38](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=19)（p.19、公式正答イ） | 改修 | 暗号化に使う受信者の鍵の変更 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-40](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=19)（p.19、公式正答イ） | 改修 | IPによる認可とドメイン署名 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-42](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=20)（p.20、公式正答エ） | 改修 | 設計への組込みと運用後の診断 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-45](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=22)（p.22、公式正答イ） | 改修 | 他人の受入れを減らすしきい値 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-55](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=26)（p.26、公式正答ア） | 改修 | 予防的分析と発生後の原因調査 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-56](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=27)（p.27、公式正答イ） | 改修 | ローカルと集中型の窓口 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-57](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=27)（p.27、公式正答エ） | 改修 | 同時更新中のバックアップ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=28)（p.28、公式正答イ） | 改修 | 監査証拠が足りない場合 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-59](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=28)（p.28、公式正答ア） | 改修 | 監査対象との経済的利害 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-61](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=29)（p.29、公式正答イ） | 改修 | 音声の学習による応対改善 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-66](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=31)（p.31、公式正答イ） | 改修 | 市場の特定化と事業工程の統合 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=6)（p.6、公式正答ウ） | 改修 | ハッシュ値が衝突した場合 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-71](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=33)（p.33、公式正答ア） | 改修 | 農業での接続と情報活用 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-72](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=33)（p.33、公式正答エ） | 改修 | 顧客IDがないPOS記録 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-73](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=33)（p.33、公式正答ウ） | 改修 | 多品種変動生産と大量反復生産 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-76](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=34)（p.34、公式正答ア） | 改修 | ロット合格率と経時故障率 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-77](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=35)（p.35、公式正答イ） | 改修 | 純資産と負債 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2018h30h-fe-am-9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=6)（p.6、公式正答エ） | 固定 | 空欄をプログラムカウンタ又はデータレジスタへ切り替える案 | 主記憶からフェッチした命令が空欄を経てデコーダへ進む図なので空欄は命令レジスタに限られる。他レジスタを答えにするにはアドレスと命令の矢印の役割又は命令デコーダとの接続先を変える。フェッチ済み命令の格納先という原問の役割を優先し、既存の比較対象の変化を保つ。 |
| [2019h31h-fe-am-13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=8)（p.8、公式正答エ） | 改修 | 同時照合とホットスタンバイ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=10)（p.10、公式正答エ） | 改修 | ハッシュ値が衝突した場合 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=11)（p.11、公式正答エ） | 改修 | 商用利用と利用分野の制限 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=12)（p.12、公式正答ア） | 改修 | 蓄電池出力の変換段数 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=13)（p.13、公式正答イ） | 改修 | 属性の識別と定義域の共有 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-38](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=18)（p.18、公式正答ア） | 改修 | 改ざん検知と機密性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-39](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=18)（p.18、公式正答ア） | 改修 | 楕円曲線とRSAの数学的基盤 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-40](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=18)（p.18、公式正答ア） | 改修 | 資金的備えとリスク回避 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-42](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=19)（p.19、公式正答ア） | 改修 | 不正を可能にする環境と心理的圧力 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-47](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=21)（p.21、公式正答イ） | 改修 | 同値分割と境界値 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=26)（p.26、公式正答ア） | 改修 | 回答が食い違う場合のヒアリング | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-59](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=26)（p.26、公式正答エ） | 改修 | 組織上の独立性と専門能力の維持 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-60](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=27)（p.27、公式正答エ） | 改修 | 広域災害とバックアップ保管 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-62](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=27)（p.27、公式正答エ） | 改修 | 要求時の配信と定期配信 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=28)（p.28、公式正答イ） | 改修 | 販売と返品のデータの分析 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-66](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=30)（p.30、公式正答エ） | 改修 | 非機能要件の可用性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-72](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=32)（p.32、公式正答エ） | 改修 | 消費者発信と投資家向け情報発信 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019h31h-fe-am-77](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=34)（p.34、公式正答ア） | 改修 | 原因に対する結果の向き | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=17)（p.17、公式正答ウ） | 改修 | Wの読取りにも専有ロックを要求する2相ロック | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=18)（p.18、公式正答イ） | 改修 | 宛先によらないハブの中継 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-40](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=22)（p.22、公式正答ウ） | 改修 | ハッシュ値を信頼するための前提 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-42](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=23)（p.23、公式正答ウ） | 改修 | DMZと内部の通信を禁止した構成 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-43](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=23)（p.23、公式正答イ） | 改修 | ログ分析とネットワーク集中制御 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-46](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=24)（p.24、公式正答イ） | 改修 | 必要な項目と共有・制御依存 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-48](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=25)（p.25、公式正答エ） | 改修 | 未完成の下位モジュールの代替 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-49](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=25)（p.25、公式正答イ） | 改修 | 両分岐が実行文をもつ一つの判断 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-50](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=26)（p.26、公式正答ウ） | 改修 | XPのテストファースト | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-56](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=28)（p.28、公式正答ア） | 改修 | 切替え後に受け付けたデータ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=29)（p.29、公式正答ア） | 改修 | システムテストの再現性と証跡 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-59](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=30)（p.30、公式正答エ） | 改修 | 自己が設計した運用の監査 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-60](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=30)（p.30、公式正答イ） | 改修 | 異動時のアクセス権の確認 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-62](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=31)（p.31、公式正答ア） | 改修 | システム間の定型照合 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=31)（p.31、公式正答イ） | 改修 | 店舗での購買とWeb上の行動の分析 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-65](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=32)（p.32、公式正答イ） | 改修 | 開発言語を変更するときの技術要件 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-70](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=34)（p.34、公式正答ウ） | 改修 | プル方式と計画からの所要量 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-73](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=35)（p.35、公式正答ウ） | 改修 | 外観検査の教師データ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-74](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=35)（p.35、公式正答エ） | 改修 | 復旧する業務の優先順位 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2019r01a-fe-am-80](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=37)（p.37、公式正答ア） | 固定 | 組込み機器、単体プログラム、データの用途を切り替える案 | 日本の製造物責任法上の製造又は加工された動産を、ソフトウェアやデータの瑕疵がある例から選ぶ条件は固定である。利用者や用途を替えてもこの対象範囲は変わらず、役務の責任や著作権を問うと法的な判定条件を変更する。組込み機器と無体物の具体例の区別を既存入力で変える。 |
| [2023-a-14](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=8)（p.8、公式正答ウ） | 改修 | テレワーク端末の登録と認証 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2024-a-20](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=9)（p.9、公式正答ア） | 固定 | 著作者人格権又は知的財産権全体へ対象を替える案 | 日本で産業財産権と総称される四権の組を問う。著作者人格権は三権の組で数と選択肢の役割を変え、知的財産権全体はこの四権の同じ列挙では尽くせない。権利名の四つ組と固定の総称を維持する。 |
| [2024-a-8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=5)（p.5、公式正答ウ） | 改修 | 接続の目的とデータリンク層 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2025-a-15](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=8)（p.8、公式正答ウ） | 改修 | 無人時間帯の入室検知 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2025-a-8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6)（p.6、公式正答エ） | 改修 | 相互TLSのクライアント認証 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2026-a-18](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=12)（p.12、公式正答ア） | 改修 | 設備異常の検知で学習結果を使うか | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [2026-a-9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8)（p.8、公式正答ウ） | 改修 | 知識と所持の組合せ | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-18](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=13)（p.13、公式正答エ） | 改修 | ルート起点とカレント起点 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-21](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=14)（p.14、公式正答ア） | 改修 | ビューを使った公開列の制限 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-23](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=15)（p.15、公式正答ア） | 改修 | 格納後のデータの検索と解釈 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-32](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=18)（p.18、公式正答ア） | 改修 | 改ざん検知と機密性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-33](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=18)（p.18、公式正答ウ） | 改修 | 復電までの時間と安全な終了 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-34](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=19)（p.19、公式正答ウ） | 改修 | ファジングとポートスキャン | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-39](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20)（p.20、公式正答イ） | 改修 | 必要な項目と共有・制御依存 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-41](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=21)（p.21、公式正答ウ） | 改修 | スプリント中に判明した追加作業 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-42](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=21)（p.21、公式正答エ） | 改修 | 成果物への影響と変更コストの時期 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-47](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=23)（p.23、公式正答エ） | 改修 | 組織上の独立性と専門能力の維持 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-5](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=6)（p.6、公式正答イ） | 固定 | 降順の比較規則又は探索キーを追加する案 | 通常の2分探索木の成立を4個の図から判定する原問を保持する。降順に定義し直すと固定の大小関係、キーの探索は選ぶ対象が変わる。既存入力で値と順序違反の位置が変わり、図を再度判断する実質的な違いは既にある。 |
| [sample-2022-dec-a-53](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=26)（p.26、公式正答エ） | 改修 | 試作結果が事業仮説に反した場合 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-56](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=28)（p.28、公式正答エ） | 改修 | 消費者発信と投資家向け情報発信 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |
| [sample-2022-dec-a-9](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=9)（p.9、公式正答エ） | 改修 | 配列を走査するループの安全性 | 原問の問いの方向・判定条件・4択の役割と本文の媒体構成を保ち、対象又は判断に使う前提を切り替える。 |

## 内容検証

知識選択の追加条件はtests/fixtures/reviewed-stem-meanings.tsで、全4選択肢の主張を手動で分類した真偽と照合する。計算・アルゴリズム・論理・図表の条件は別方式の参照計算も行う。既存入力は従来の独立検証を継続し、新条件を原問用の期待値に自動付替えしない。未査読候補は残さず、固定の例外を問単位の検討案・理由・版で限定する。

暗号・認証・メール・OSS・個人情報・契約・権利・規格を扱う追加例は、それぞれ原問の意味資料と一次資料の定義に照らす。共通フレーム問65は既に許諾確認した技術要件の範囲（開発言語と技術標準）に限定し、性能要件へ素材の範囲を広げない。2019春問42は金融庁由来の元の文を含む入力0の素材別表示を保ち、新条件の自作文を原資料の引用と混同しない。

詳細解説のある2019秋問29は、追加入力16でWの読取りにも専有ロックを要求する。保存条件から全4択・ロック種別・説明を復元し、既存入力の共有ロックと併せて検証する。

## 追加条件の一次資料

SMTPの中継経路の記録は節4.4に照らし、Receivedが追加される点を確認した。TLSのクライアント証明書は節4.4.2以降の認証手順を参照した。本文は規格の文章を転載せずに作成している。[RFC 5321](https://www.rfc-editor.org/rfc/rfc5321)、[RFC 8446](https://www.rfc-editor.org/rfc/rfc8446)

OSSの商用利用は定義の第6項、スプリント中の作業範囲の再交渉は2020年版の規定に照らした。[Open Source Definition](https://opensource.org/osd)、[Scrum Guide](https://scrumguides.org/scrum-guide.html)

## 検証結果

全体の `npm run check` は437ファイル・2,763件すべてに成功した。追加条件の全選択肢、元の有効入力、前提の表示、出題・採点・保存復元、配布データ、本体と文書のビルドを確認した。[検証記録](/verification#_2026-11-07-—-本文固定229系列を全件査読)
