# 全問題の生成対応

<!-- scripts/generation-reference.ts が生成する。手編集しない。 -->

## 対象と対応条件

本システムでは、収録した公式公開問題・大問912件すべてに、原問題とは別の改変済み基準問題と登録生成器を一対一で用意する。科目A140問、科目B49問、旧午前619問、旧午後104大問をそれぞれの問題集に対応したランダムミックスの候補にする。2025年度科目B問6は第三者のJIS文言の利用条件が未確認であり、原問題・生成版とも対象外とする。非公開問題を含めた全FE問題という意味ではない。

年度別オリジナルは公式本文・図・数値・正答を維持した原資料画像を表示する。生成版ではその学習対象と媒体の形式を基に、文章を文章、表を表、図を作図、疑似言語を空欄付きコードとして構造化する。問いの方向・正誤条件・解答対象・選択肢の役割と数は固定する。知識問題では用語・対象・状況、計算問題では数値・条件、アルゴリズムでは引数・添字・処理条件、長文では規則・状況を変数とする。本文・図・選択肢・正答・独自解説は同じ入力から確定する。選択肢の並べ替えだけで生成対応とは扱わない。

生成用基準問題も改変問題であり、原文そのものの再録ではない。元の学習対象を維持しつつ、生成可能にする文言や条件の明示、問う対象の切替を含む。知識問題には数値が存在しないため、数値変更を一律に追加しない。原問題で与えられた数式や変換例の図は生成時も維持し、解答を導く補助表を追加しない。公式再録の不変参照と改変内容を保存し、原資料にない条件は改変として表示する。

カタログのgenerationCoverage=completeでは、含まれる各公式問題から派生する有効なテンプレートが一つあり、対応する科目のミックス枠へ一つ登録されることを検査する。不足・重複はGENERATION_COVERAGEで配布検証を拒否する。これで内容の真実性や利用条件の法的適合を保証するものではない。省略又はpartialの旧カタログはこの全問対応宣言を持たない。

## 問題別の対応一覧

表は配布カタログ・基準問題・登録契約から生成する。入力は整数の順序付き列で、各欄は「名称：下限〜上限（基準値）」を表す。追加の入力間制約は生成器で検査し、不成立なら再抽選の上限内で選び直す。生成器のID・版・入力域をJSONだけで追加しても実行できない。原資料のリンクは該当PDFページを示す。

### 2026年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=4) | generator-source-2026-a-1@3.4.0 | 遷移確率表の関係。入力軸の向き：0〜1（0）、記号の配置：0〜23（0） | 文章・表／4択 |
| [科目A問2 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=4) | generator-source-2026-a-2@3.2.0 | 整列アルゴリズム。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問3 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=5) | generator-source-2026-a-3@3.2.0 | 計算装置の特徴。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問4 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=5) | generator-source-2026-a-4@3.2.0 | クラウドのサービスモデル。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問5 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=6) | generator-source-2026-a-5@3.2.0 | 主記憶と仮想記憶の管理。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問6 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=6) | generator-source-2026-a-6@3.2.0 | 論理回路とタイミングチャート。四つのゲートの反転マスク：0〜15（15）、入力信号の位相：0〜6（0） | 文章・図／4択 |
| [科目A問7 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=7) | generator-source-2026-a-7@3.2.0 | SQLの主キー制約。違反する命令の種類：0〜3（0）、商品コードの枝番：0〜9（0） | 文章・コード・表／4択 |
| [科目A問8 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=7) | generator-source-2026-a-8@3.4.0 | 無線通信の仕組み。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問9 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-9@3.7.0 | 認証要素の組合せ。異なる認証要素の組：0〜9（0） | 文章／4択 |
| [科目A問10 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-10@3.2.0 | セキュリティの専門組織。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問11 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-11@3.5.0 | 開発上の問題への対策。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問12 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=9) | generator-source-2026-a-12@3.5.0 | 進捗の可視化。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問13 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=9) | generator-source-2026-a-13@3.2.0 | 期間短縮と人材支援。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問14 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=10) | generator-service-gain@2.2.0 | サービス可用性の改善。年間提供時間（時間）：500〜10000（5000）、移行前停止（時間）：10〜200（100）、移行後停止（分）：1〜600（30） | 文章・箇条書き／4択 |
| [科目A問15 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=10) | generator-source-2026-a-15@3.4.0 | システム監査の役割分担。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問16 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=11) | generator-source-2026-a-16@3.2.0 | 小売業のIT活用。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問17 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=11) | generator-retention@2.5.0 | 会員のリテンション率。A前月会員：100〜5000（1000）、A新規会員：0〜2000（500）、A継続会員：1〜5000（300）、B前月会員：100〜5000（1000）、B新規会員：0〜2000（200）、B継続会員：1〜5000（600）、C前月会員：100〜5000（1500）、C新規会員：0〜2000（500）、C継続会員：1〜5000（600）、D前月会員：100〜5000（1500）、D新規会員：0〜2000（1000）、D継続会員：1〜5000（800） | 文章・表／4択 |
| [科目A問18 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=12) | generator-source-2026-a-18@3.7.0 | 学習を伴うAIの事例。固定処理の事例：0〜4（0） | 文章／4択 |
| [科目A問19 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=12) | generator-source-2026-a-19@3.2.0 | 会議とコミュニケーション。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問20 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=13) | generator-source-2026-a-20@3.2.0 | 著作権と著作者人格権。利用する行為と契約条件：0〜3（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=4) | generator-source-2026-b-1@3.6.0 | 配列の右への回転。右へ移動する要素数：1〜4（1）、配列の要素数：6〜12（9） | 文章・コード／4択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=5) | generator-complement@2.3.0 | 8ビットの2の補数。8ビットの入力x：1〜255（42）、ビット幅：4〜8（8） | 文章・コード／6択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=6) | generator-recurrence@2.3.0 | 漸化式を追跡する。引数n：3〜14（5）、2項前の係数：2〜4（2） | 文章・コード／8択 |
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=8) | generator-source-2026-b-4@3.4.0 | 配列による単方向リスト。次ポインタの基準差：0〜3（0）、格納値の倍率：1〜5（1） | 文章・図・コード・表／4択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=10) | generator-source-2026-b-5@3.6.0 | One-Hot表現への変換。走査添字の基準差：0〜3（0）、色の並び：0〜3（0） | 文章・図・コード・表／4択 |
| [科目B問6 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=12) | generator-security-log@2.5.0 | ログ管理ルールと運用の照合。運用担当者数：0〜4（1）、一般利用者のログアクセス：0〜1（1）、日時が日本標準時：0〜1（0）、過去ログの上書き：0〜1（1） | 文章・見出し・箇条書き・表／10択 |

### 2025年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=2) | generator-source-2025-a-1@3.5.0 | 学習済みモデルの利用。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問2 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=2) | generator-source-2025-a-2@3.2.0 | 数値計算の誤差。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=3) | generator-source-2025-a-3@3.2.0 | 2分探索木の大小関係。ラベルの巡回配置：0〜6（0）、左右の配置：0〜1（0） | 文章・図／4択 |
| [科目A問4 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=3) | generator-source-2025-a-4@3.3.0 | 毎年の保守改善と稼働率。初年度MTBF：1000〜8000（4000）、初年度MTTR：500〜2000（1000）、毎年の改善時間：20〜150（100）、経過年数：1〜6（6） | 文章／4択 |
| [科目A問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=4) | generator-source-2025-a-5@3.2.0 | 開発を支援するツール。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問6 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=5) | generator-source-2025-a-6@3.2.0 | SQLの条件の等価性。集合条件：0〜3（0）、仕入先の組：0〜2（0） | 文章・表・コード／4択 |
| [科目A問7 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=5) | generator-source-2025-a-7@3.3.0 | 回線利用率。動画のGバイト数：1〜5（1）、回線速度Mビット毎秒：40〜400（40）、経過分：3〜15（5）、制御情報の百分率：0〜25（20） | 文章／4択 |
| [科目A問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-8@3.7.0 | Web通信の機能。問う対象・判定する条件：0〜4（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問9 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-9@3.2.0 | 暗号と鍵のリスク。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問10 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-10@3.2.0 | セキュリティの技術と製品。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-11@3.2.0 | E-Rモデルの構成要素。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-12@3.2.0 | オブジェクト指向の機能。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問13 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-13@3.4.0 | スクラムの役割。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=8) | generator-source-2025-a-14@3.3.0 | ダミーを含むプロジェクトの所要日数。作業Aの日数：1〜20（3）、作業Bの日数：1〜20（6）、作業Cの日数：1〜20（8）、作業Dの日数：1〜20（6）、作業Eの日数：1〜20（5）、作業Fの日数：1〜20（14）、作業Gの日数：1〜20（11）、作業Hの日数：1〜20（15）、作業Iの日数：1〜20（5） | 文章・図／4択 |
| [科目A問15 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=8) | generator-source-2025-a-15@3.7.0 | サーバ室の物理的安全対策。問う対象・判定する条件：0〜4（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問16 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-16@3.4.0 | マーケティングの分析手法。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問17 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-17@3.4.0 | 生成AIサービスのデータ設定。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問18 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-18@3.2.0 | 販売方針と必要な施策。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問19 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=10) | generator-cafe-profit@2.2.0 | 喫茶店の利益と必要客数。1人の売上（円）：100〜1500（500）、1人の変動費（円）：50〜800（100）、固定費（円）：50000〜500000（300000）、目標利益（円）：0〜300000（100000）、営業日数：10〜30（20）、客席数：5〜40（10） | 文章・表／4択 |
| [科目A問20 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=10) | generator-source-2025-a-20@3.2.0 | 環境指標と流通情報。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=4) | generator-count-multiples@2.3.0 | 区間内の倍数を数える。下限n：1〜100（1）、上限m：11〜250（12）、除数：2〜12（4） | 文章・コード・表／6択 |
| [科目B問2 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=6) | generator-coin-change@2.5.0 | 硬貨の組合せの総数。金額n（円）：11〜200（12）、残額変数のオフセット：0〜20（0） | 文章・コード／6択 |
| [科目B問3 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=8) | generator-source-2025-b-3@3.4.0 | スタックの添字と位置管理。位置変数の基準差：0〜3（0）、スタックの容量：4〜8（4）、最初の値：1〜9（4）、二つ目の値：1〜9（3） | 文章・図・コード・表／4択 |
| [科目B問4 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=10) | generator-source-2025-b-4@3.8.0 | 文字列検索の比較回数。検索対象の並び：0〜5（0）、検索キー：0〜5（0） | 文章・コード／10択 |
| [科目B問5 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=12) | generator-source-2025-b-5@3.8.0 | 分割表の理論度数。接種あり・罹患なし：20〜100（82）、接種あり・罹患あり：1〜20（6）、接種なし・罹患なし：20〜100（58）、接種なし・罹患あり：1〜20（8） | 文章・表・コード／7択 |

### 2024年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=2) | generator-logic-table@2.1.0 | 真理値表と論理演算。演算種別：1〜7（7）、誤答候補の回転：0〜6（0） | 文章・表／4択 |
| [科目A問2 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=2) | generator-hash-collision@2.1.0 | ハッシュ表の衝突。表の大きさ：5〜13（10）、第1キーのASCII：97〜109（100）、第2キーのASCII：98〜122（120） | 文章／4択 |
| [科目A問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=3) | generator-source-2024-a-3@3.3.0 | CPU間の処理時間とヒット率。ヒット率の百分率：70〜96（90）、アクセス時間差の倍率：1〜5（2）、CPU Yのキャッシュ時間：5〜30（20）、CPU Xの主記憶時間：100〜600（400） | 文章・図・表／4択 |
| [科目A問4 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=3) | generator-availability@2.2.0 | MTBF・MTTRと稼働率。MTBF（時間）：100〜6000（3000）、MTTR（時間）：100〜2000（1000）、MTBFの改善率（％）：0〜40（20）、MTTRの改善率（％）：1〜40（10） | 文章／4択 |
| [科目A問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=4) | generator-source-2024-a-5@3.5.0 | Webサービスの組合せ。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問6 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=4) | generator-source-2024-a-6@3.2.0 | 画像の表現手法。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問7 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=4) | generator-source-2024-a-7@3.2.0 | DBMSのACID特性。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問8 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=5) | generator-source-2024-a-8@3.7.0 | LANの接続装置。問う対象・判定する条件：0〜4（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問9 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=5) | generator-source-2024-a-9@3.2.0 | セキュリティの検査手法。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問10 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=5) | generator-source-2024-a-10@3.5.0 | Webの入力に対する対策。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問11 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=6) | generator-source-2024-a-11@3.2.0 | テスト用の代替モジュール。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問12 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=6) | generator-source-2024-a-12@3.2.0 | スプリントのイベント。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問13 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=6) | generator-critical-path@2.2.0 | アローダイアグラムの最短完了日数。作業Aの日数：1〜60（30）、作業Bの日数：1〜60（5）、作業Cの日数：1〜60（30）、作業Dの日数：1〜60（20）、作業Eの日数：1〜60（40）、作業Fの日数：1〜60（25）、作業Gの日数：1〜60（30）、作業Hの日数：1〜60（30） | 文章・図／4択 |
| [科目A問14 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=7) | generator-source-2024-a-14@3.2.0 | 開発と運用の連携。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問15 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=7) | generator-source-2024-a-15@3.2.0 | データの前処理。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問16 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=8) | generator-source-2024-a-16@3.2.0 | 経営資源と方針。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問17 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=8) | generator-source-2024-a-17@3.2.0 | 市場の競争と分類。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問18 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=8) | generator-source-2024-a-18@3.2.0 | 業務領域とICT。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問19 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=9) | generator-source-2024-a-19@3.4.0 | 散布図の相関。相関の種類：0〜2（0）、点の散らばり：0〜2（0） | 文章・図／4択 |
| [科目A問20 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=9) | generator-source-2024-a-20@3.2.0 | 産業財産権の分類。誤答群に混ぜる権利：0〜7（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=4) | generator-source-2024-b-1@3.4.0 | 最大又は最小を返す条件。返す値の種類：0〜1（0）、最初に比較する変数：0〜2（0） | 文章・コード／6択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=5) | generator-source-2024-b-2@3.4.0 | 文字列の基数変換。基数：2〜8（2）、走査する向き：0〜1（0）、説明例の整数：1〜255（18） | 文章・コード／4択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=6) | generator-source-2024-b-3@3.4.0 | 辺リストと隣接行列。頂点番号の基準差：0〜3（0）、グラフの接続例：0〜2（0） | 文章・図・コード／6択 |
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=8) | generator-source-2024-b-4@3.8.0 | 併合処理の末尾コピー回数。二つの配列の配置：0〜5（0）、値の加算値：0〜20（0） | 文章・コード／4択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=10) | generator-source-2024-b-5@3.7.0 | 購買データの関連度の空欄。求める指標：0〜3（0）、注文の例：0〜2（0） | 文章・表・数式・コード／6択 |
| [科目B問6 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=14) | generator-source-2024-b-6@3.4.0 | テレワークの接続変更と対策。対策が必要な問題：0〜3（0）、端末の台数：100〜500（450） | 文章・箇条書き／5択 |

### 2023年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=2) | generator-hex-fraction@2.4.0 | 小数の基数変換。変換元の基数：2〜16（16）、変換先の基数：2〜16（10）、小数の値（8分の幾つ）：1〜7（6）、整数部分（10進数）：0〜255（0） | 文章／4択 |
| [科目A問2 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=2) | generator-source-2023-a-2@3.8.0 | 双方向リストへの挿入。挿入する位置：0〜3（0）、アドレスの倍率：1〜5（1） | 文章・表／4択 |
| [科目A問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=3) | generator-source-2023-a-3@3.2.0 | メモリの高速化。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問4 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=3) | generator-source-2023-a-4@3.2.0 | 計算処理を置く場所。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=4) | generator-source-2023-a-5@3.2.0 | CGの描画処理。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問6 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=4) | generator-source-2023-a-6@3.4.0 | 推移的関数従属。関数従属の連鎖：0〜3（0） | 文章・箇条書き／4択 |
| [科目A問7 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-7@3.2.0 | トランザクションの特性。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問8 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-8@3.2.0 | IPv4の運用機能。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問9 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-9@3.2.0 | マルウェアの侵入と被害。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問10 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=6) | generator-source-2023-a-10@3.8.0 | WAFの設置場所。TLS復号を行う位置：0〜1（1）、ファイアウォールとSSLアクセラレータの接続順：0〜1（0） | 文章・図／4択 |
| [科目A問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=7) | generator-source-2023-a-11@3.4.0 | 流れ図の実行経路。初期値比の候補：0〜3（3） | 文章・図／4択 |
| [科目A問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=7) | generator-source-2023-a-12@3.2.0 | スクラムのイベント。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問13 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=8) | generator-source-2023-a-13@3.8.0 | 作業短縮の最少追加費用。クリティカルな枝：0〜2（0）、上側で安価な作業：0〜1（1）、共通作業の日数増分：0〜5（0） | 文章・図・表／4択 |
| [科目A問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=8) | generator-source-2023-a-14@3.7.0 | テレワーク監査の確認目的。問う対象・判定する条件：0〜4（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問15 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=9) | generator-source-2023-a-15@3.2.0 | クラウドの配置形態。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問16 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=9) | generator-source-2023-a-16@3.2.0 | 人材マネジメント。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問17 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=10) | generator-source-2023-a-17@3.2.0 | 企業活動とIT。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問18 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=10) | generator-source-2023-a-18@3.2.0 | 新製品の採用時期。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問19 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=11) | generator-source-2023-a-19@3.2.0 | 経営の最高責任者。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問20 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=11) | generator-source-2023-a-20@3.2.0 | ソフトウェアの契約形態。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=4) | generator-source-2023-b-1@3.7.0 | 素数列挙の空欄。上限から引く値：0〜4（0）、説明例のmaxNum：10〜50（20） | 文章・コード・表／4択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=5) | generator-source-2023-b-2@3.4.0 | 手続の呼出し順。proc2の処理順：0〜3（0）、proc1の処理順：0〜1（0） | 文章・コード／8択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=6) | generator-source-2023-b-3@3.7.0 | クイックソートの初回出力。配列の並び：0〜119（25）、各値への加算値：0〜20（0） | 文章・コード／4択 |
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=8) | generator-source-2023-b-4@3.4.0 | 二つのハッシュ関数への格納。表の要素数：5〜9（5）、第2ハッシュの加算値：1〜4（3）、第1入力：1〜99（3）、第2入力：1〜99（18）、第3入力：1〜99（11） | 文章・コード／5択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=10) | generator-source-2023-b-5@3.7.0 | コサイン類似度の空欄。分子の走査添字の基準差：0〜3（0）、分子の走査順：0〜1（0） | 文章・数式・コード・表／9択 |
| [科目B問6 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=12) | generator-source-2023-b-6@3.4.0 | 業務委託とスキャン情報のリスク。残る情報セキュリティリスク：0〜3（0）、業務の担当人数：2〜5（2） | 文章・箇条書き／4択 |

### 2022年4月公表 サンプル問題

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目B問1 p.2](https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000oett-att/fe_kamoku_b_sample.pdf#page=2) | generator-source-sample-2022-apr-b-1@3.2.0 | 入場料の条件分岐。最初の年齢上限：0〜7（3）、次の上限までの年齢差：4〜8（6）、最小料金の百円単位：1〜3（1）、料金差の百円単位：1〜3（2） | 文章・コード／7択 |
| [科目B問2 p.3](https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000oett-att/fe_kamoku_b_sample.pdf#page=3) | generator-source-sample-2022-apr-b-2@3.2.0 | 配列の逆順化。配列添字の開始位置：0〜1（1）、要素数：5〜7（5）、配列値の差：0〜2（0） | 文章・コード・表／4択 |
| [科目B問3 p.4](https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000oett-att/fe_kamoku_b_sample.pdf#page=4) | generator-source-sample-2022-apr-b-3@3.2.0 | 単方向リストの末尾追加。終端の表現：0〜1（0）、既存ノードを指す誤答：0〜1（0） | 文章・図・コード・表／6択 |
| [科目B問4 p.6](https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000oett-att/fe_kamoku_b_sample.pdf#page=6) | generator-source-sample-2022-apr-b-4@3.2.0 | 疎行列の座標リスト。行の循環移動：0〜4（0）、列の循環移動：0〜4（0）、非零値の置換：0〜2（0） | 文章・コード・表／4択 |
| [科目B問5 p.7](https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000oett-att/fe_kamoku_b_sample.pdf#page=7) | generator-source-sample-2022-apr-b-5@3.2.0 | 後続文字の出現割合。英単語群の例：0〜3（0）、頻度APIの仕様：0〜1（0） | 文章・図・表・コード／4択 |
| [科目B問6 p.9](https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000oett-att/fe_kamoku_b_sample.pdf#page=9) | generator-source-sample-2022-apr-b-6@3.2.0 | クラウドと委託先の責任分担。サービスと委託の範囲：0〜2（0）、指摘事項の順序：0〜5（0） | 文章・表／10択 |

### 2022年12月公表 サンプル問題

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.4](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=4) | generator-source-sample-2022-dec-a-1@3.2.0 | 2の補数。ビット数：4〜8（8） | 文章／4択 |
| [科目A問2 p.4](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=4) | generator-source-sample-2022-dec-a-2@3.2.0 | 2進数変換の流れ図。出力桁数：5〜8（8） | 文章・図・表／4択 |
| [科目A問3 p.5](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=5) | generator-source-sample-2022-dec-a-3@3.2.0 | 命題の真理値。Qの極性：0〜1（0）、Rの極性：0〜1（0） | 文章・表／4択 |
| [科目A問4 p.5](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=5) | generator-source-sample-2022-dec-a-4@3.2.0 | オートマトン。入力記号列：0〜5（0） | 文章・図／4択 |
| [科目A問5 p.6](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=6) | generator-source-sample-2022-dec-a-5@3.2.0 | 2分探索木。節の順序条件：0〜3（0）、値の加算：0〜3（0） | 文章・図／4択 |
| [科目A問6 p.7](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=7) | generator-source-sample-2022-dec-a-6@3.2.0 | 配列の回転。変換：0〜3（3）、元の模様：0〜2（0） | 文章・図／4択 |
| [科目A問7 p.8](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=8) | generator-source-sample-2022-dec-a-7@3.2.0 | ハッシュ値。数字列：0〜5（0） | 文章・図／4択 |
| [科目A問8 p.8](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=8) | generator-source-sample-2022-dec-a-8@3.2.0 | 再帰関数。引数n：3〜8（5） | 文章・コード／4択 |
| [科目A問9 p.9](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=9) | generator-source-sample-2022-dec-a-9@3.7.0 | コーディング規則。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問10 p.9](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=9) | generator-source-sample-2022-dec-a-10@3.3.0 | 割込みの発生原因。問う割込みの区分と発生原因：0〜5（0） | 文章／4択 |
| [科目A問11 p.9](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=9) | generator-source-sample-2022-dec-a-11@3.8.0 | ECCの冗長ビット。指数n：4〜9（7） | 文章／4択 |
| [科目A問12 p.10](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=10) | generator-source-sample-2022-dec-a-12@3.2.0 | 実効アクセス時間の順序。アクセス時間の条件：0〜3（0） | 文章・表／4択 |
| [科目A問13 p.10](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=10) | generator-source-sample-2022-dec-a-13@3.8.0 | 縮退運転の停止台数。物理マシン台数：16〜24（20）、通常使用率の十％：5〜7（7） | 文章／4択 |
| [科目A問14 p.11](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=11) | generator-source-sample-2022-dec-a-14@3.2.0 | 並列機器の稼働率。クライアント台数：2〜4（3）、プリンタ台数：2〜3（2） | 文章・図・表／4択 |
| [科目A問15 p.12](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=12) | generator-source-sample-2022-dec-a-15@3.2.0 | バッファサイズ。連続送信時間のT倍：1〜3（1） | 文章・図／4択 |
| [科目A問16 p.12](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=12) | generator-source-sample-2022-dec-a-16@3.3.0 | インタプリタと関連する処理系。問う処理系：0〜3（0） | 文章／4択 |
| [科目A問17 p.13](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=13) | generator-source-sample-2022-dec-a-17@3.2.0 | 空き領域最大の媒体選択。割当て要求：0〜3（0）、要求の倍率：1〜2（1） | 文章／4択 |
| [科目A問18 p.13](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=13) | generator-source-sample-2022-dec-a-18@3.7.0 | 絶対パス名。着目する条件・記述：0〜4（0） | 文章／4択 |
| [科目A問19 p.13](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=13) | generator-source-sample-2022-dec-a-19@3.3.0 | 半導体メモリの特徴。問うメモリの種類：0〜3（0） | 文章／4択 |
| [科目A問20 p.14](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=14) | generator-source-sample-2022-dec-a-20@3.2.0 | 入力チェック。検査する条件：0〜3（3） | 文章・表／4択 |
| [科目A問21 p.14](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=14) | generator-source-sample-2022-dec-a-21@3.7.0 | ビュー。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問22 p.14](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=14) | generator-source-sample-2022-dec-a-22@3.2.0 | UMLの多重度。多重度の条件：0〜3（0） | 文章・図／4択 |
| [科目A問23 p.15](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=15) | generator-source-sample-2022-dec-a-23@3.7.0 | データレイク。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問24 p.15](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=15) | generator-source-sample-2022-dec-a-24@3.2.0 | 関係演算。抽出の方向：0〜1（0）、数量の加算：0〜2（0） | 文章・表／4択 |
| [科目A問25 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-a-25@3.2.0 | IoTの通信技術。問う条件：0〜3（0） | 文章／4択 |
| [科目A問26 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-a-26@3.2.0 | 伝送時間。データ量の3MB単位：2〜6（4）、速度の1.5Mbps単位：1〜2（1） | 文章／4択 |
| [科目A問27 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-a-27@3.2.0 | 通信の規格。問う条件：0〜3（1） | 文章／4択 |
| [科目A問28 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-a-28@3.2.0 | ネットワークプロトコル。問う条件：0〜3（3） | 文章／4択 |
| [科目A問29 p.17](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=17) | generator-source-sample-2022-dec-a-29@3.2.0 | 戻りのTCPポート番号。PCポート番号の差：0〜5（0）、HTTPポート：0〜2（0） | 文章・表／4択 |
| [科目A問30 p.17](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=17) | generator-source-sample-2022-dec-a-30@3.2.0 | 攻撃の分類。問う条件：0〜3（0） | 文章／4択 |
| [科目A問31 p.18](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=18) | generator-source-sample-2022-dec-a-31@3.2.0 | サーバの役割。問う対象：0〜3（3） | 文章／4択 |
| [科目A問32 p.18](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=18) | generator-source-sample-2022-dec-a-32@3.7.0 | メッセージ認証符号。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問33 p.18](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=18) | generator-source-sample-2022-dec-a-33@3.7.0 | UPS。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問34 p.19](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=19) | generator-source-sample-2022-dec-a-34@3.7.0 | ファジング。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問35 p.19](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=19) | generator-source-sample-2022-dec-a-35@3.3.0 | マルウェアの動的解析と静的解析。問う解析手法と観測項目：0〜5（0） | 文章／4択 |
| [科目A問36 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-a-36@3.2.0 | 攻撃への対策。問う対象：0〜3（0） | 文章／4択 |
| [科目A問37 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-a-37@3.2.0 | 電子メールの認証と保護。問う条件：0〜3（3） | 文章／4択 |
| [科目A問38 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-a-38@3.2.0 | オブジェクト指向の用語。問う条件：0〜3（1） | 文章／4択 |
| [科目A問39 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-a-39@3.7.0 | モジュール結合度。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問40 p.21](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=21) | generator-source-sample-2022-dec-a-40@3.2.0 | テスト手法。問う条件：0〜3（1） | 文章／4択 |
| [科目A問41 p.21](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=21) | generator-source-sample-2022-dec-a-41@3.7.0 | スクラムのスプリント。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問42 p.21](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=21) | generator-source-sample-2022-dec-a-42@3.7.0 | プロジェクトの特性。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問43 p.22](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=22) | generator-source-sample-2022-dec-a-43@3.2.0 | 見積方法。問う対象：0〜3（2） | 文章／4択 |
| [科目A問44 p.22](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=22) | generator-source-sample-2022-dec-a-44@3.8.0 | 最少所要日数。Aの日数：1〜3（2）、Eの日数：1〜3（2） | 文章・図／4択 |
| [科目A問45 p.23](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=23) | generator-source-sample-2022-dec-a-45@3.2.0 | サービス改善。問う対象：0〜3（1） | 文章／4択 |
| [科目A問46 p.23](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=23) | generator-source-sample-2022-dec-a-46@3.2.0 | 回復処理。問う条件：0〜3（3） | 文章／4択 |
| [科目A問47 p.23](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=23) | generator-source-sample-2022-dec-a-47@3.7.0 | 監査の独立性。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問48 p.24](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=24) | generator-source-sample-2022-dec-a-48@3.2.0 | 情報セキュリティ監査。監査で確認する特性：0〜2（0） | 文章／4択 |
| [科目A問49 p.24](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=24) | generator-source-sample-2022-dec-a-49@3.2.0 | テレワーク。問う対象：0〜3（0） | 文章／4択 |
| [科目A問50 p.25](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=25) | generator-source-sample-2022-dec-a-50@3.8.0 | ROIによる比較。利益構成：0〜3（0）、金額倍率：1〜2（1） | 文章・表／4択 |
| [科目A問51 p.25](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=25) | generator-source-sample-2022-dec-a-51@3.2.0 | 環境への取組。問う条件：0〜3（3） | 文章／4択 |
| [科目A問52 p.26](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=26) | generator-source-sample-2022-dec-a-52@3.2.0 | 経営の概念。問う対象：0〜3（0） | 文章／4択 |
| [科目A問53 p.26](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=26) | generator-source-sample-2022-dec-a-53@3.7.0 | リーンスタートアップ。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問54 p.27](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=27) | generator-source-sample-2022-dec-a-54@3.2.0 | IoTの応用。問う対象：0〜3（3） | 文章／4択 |
| [科目A問55 p.27](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=27) | generator-source-sample-2022-dec-a-55@3.2.0 | 電子商取引。問う対象：0〜3（1） | 文章／4択 |
| [科目A問56 p.28](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=28) | generator-source-sample-2022-dec-a-56@3.7.0 | CGMの例。消費者が発信する内容：0〜3（0） | 文章／4択 |
| [科目A問57 p.28](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=28) | generator-source-sample-2022-dec-a-57@3.8.0 | 原料制約と最大利益。原料量の倍率：1〜3（1）、原料Aの追加6単位：0〜2（0） | 文章・表／4択 |
| [科目A問58 p.28](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=28) | generator-source-sample-2022-dec-a-58@3.8.0 | 固定資産売却損。購入額の2万円単位：10〜20（15）、売却額の0.5万円単位：2〜4（2） | 文章／4択 |
| [科目A問59 p.29](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=29) | generator-source-sample-2022-dec-a-59@3.2.0 | 目標利益と売上高。基準売上高の100百万円単位：1〜2（1）、目標利益の6百万円単位：1〜6（3） | 文章／4択 |
| [科目A問60 p.29](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=29) | generator-source-sample-2022-dec-a-60@3.2.0 | 労働者派遣の関係。太線の関係：0〜2（0） | 文章・図／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=4) | generator-source-sample-2022-dec-b-1@3.8.0 | 代入と出力順。初期値の最小値：1〜4（1）、初期値の並び：0〜5（0） | 文章・コード／6択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=5) | generator-source-sample-2022-dec-b-2@3.8.0 | 複数の倍数条件の分岐順。二つの除数の組：0〜3（0） | 文章・コード・表／5択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=6) | generator-source-sample-2022-dec-b-3@3.2.0 | 配列の累積和。入力配列の循環移動：0〜5（0）、各要素への加算：0〜2（0） | 文章・コード／7択 |
| [科目B問4 p.7](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=7) | generator-source-sample-2022-dec-b-4@3.2.0 | 減算による最大公約数。先に減算する変数：0〜1（0） | 文章・コード・表／4択 |
| [科目B問5 p.8](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=8) | generator-source-sample-2022-dec-b-5@3.2.0 | べき乗関数の合成。根とべきの次数：2〜4（2） | 文章・コード／7択 |
| [科目B問6 p.9](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=9) | generator-source-sample-2022-dec-b-6@3.2.0 | 固定幅ビット列の反転。ビット幅：4〜8（8）、表示例の差：0〜3（0） | 文章・コード／4択 |
| [科目B問7 p.10](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=10) | generator-source-sample-2022-dec-b-7@3.2.0 | 階乗の再帰。最小入力と再帰の基底：0〜1（0）、自己再帰の誤った係数：0〜1（0） | 文章・コード／6択 |
| [科目B問8 p.12](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=12) | generator-source-sample-2022-dec-b-8@3.2.0 | 優先度付きキューの取り出し。数値が表す優先度の向き：0〜1（0）、同じ優先度の取り出し順：0〜1（0） | 文章・図・コード／4択 |
| [科目B問9 p.14](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=14) | generator-source-sample-2022-dec-b-9@3.2.0 | 2分木の中間順走査。左の子だけをもつ親：4〜7（7） | 文章・図・コード／4択 |
| [科目B問10 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-b-10@3.2.0 | 単方向リストの削除。リスト位置の開始番号：0〜1（1） | 文章・表・コード／6択 |
| [科目B問11 p.18](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=18) | generator-source-sample-2022-dec-b-11@3.2.0 | バケットの未定義要素。配列要素数：5〜7（6）、要素番号の開始：0〜1（1） | 文章・コード／4択 |
| [科目B問12 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-b-12@3.2.0 | 同じ位置の文字の一致率。配列添字の開始：0〜1（1）、比較例の単語群：0〜2（0） | 文章・表・コード／4択 |
| [科目B問13 p.22](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=22) | generator-source-sample-2022-dec-b-13@3.2.0 | 二分探索の無限ループ。配列添字の開始：0〜1（1）、low側の境界更新：0〜1（0） | 文章・コード／4択 |
| [科目B問14 p.23](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=23) | generator-source-sample-2022-dec-b-14@3.2.0 | 順位に対応する要素の選択。先頭値の十分の一単位：1〜3（1）、差の十分の一単位：1〜2（1） | 文章・コード／8択 |
| [科目B問15 p.24](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=24) | generator-source-sample-2022-dec-b-15@3.8.0 | 三目並べのミニマックス評価。勝敗の評価値の5点単位：1〜3（2）、AとBを付ける根の子：0〜2（0） | 文章・箇条書き・図・表／4択 |
| [科目B問16 p.26](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=26) | generator-source-sample-2022-dec-b-16@3.2.0 | UTF-8の基数による分割。符号のバイト数：2〜4（3）、文字例：0〜1（0） | 文章・コード／9択 |
| [科目B問17 p.28](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=28) | generator-source-sample-2022-dec-b-17@3.2.0 | PaaSの脆弱性対処の責任分担。サービスと委託の範囲：0〜2（0）、指摘事項の順序：0〜5（0） | 文章・表／10択 |
| [科目B問18 p.30](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=30) | generator-source-sample-2022-dec-b-18@3.8.0 | 業務用端末の利用変更によるリスク。客先常駐者に許可する端末：0〜1（0）、客先常駐の開発部員の割合（割）：5〜9（9） | 文章・箇条書き／10択 |
| [科目B問19 p.32](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=32) | generator-source-sample-2022-dec-b-19@3.2.0 | 業務分担と最小権限。二つの空欄にする行：0〜2（0） | 文章・表／5択 |
| [科目B問20 p.34](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=34) | generator-source-sample-2022-dec-b-20@3.2.0 | FW運用の職務分離。機能と接続経路の制限方式：0〜1（0）、運用担当者数：4〜8（6） | 文章・箇条書き・表／7択 |

### 2019年度 秋期・午後

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午後問1 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=5) | generator-source-2019r01a-fe-pm-1@3.2.0 | 旧制度・午後：テレワークの導入。誤ったルール7の送信元網：0〜2（0） | 文章・図・表／23択・4解答欄 |
| [旧午後問2 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=10) | generator-source-2019r01a-fe-pm-2@3.2.0 | 旧制度・午後：スレッド並列実行と高速化率。threadCount：2〜4（2）、parallelFractionCase：0〜4（4）、limitCase：0〜4（2）、halfRangeCase：0〜2（1）、indirectAddressCase：0〜4（0） | 画像・文章・コード・図／22択・5解答欄 |
| [旧午後問3 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=15) | generator-source-2019r01a-fe-pm-3@3.2.0 | 旧制度・午後：書籍と貸出情報の関係データベース。fiscalStartYear：2017〜2019（2018）、minimumLoans：3〜5（4）、acquisitionScenario：0〜2（0） | 文章・図・コード／22択・5解答欄 |
| [旧午後問4 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=20) | generator-source-2019r01a-fe-pm-4@3.2.0 | NATとNAT64によるアドレス及びポート番号の変換。networkProfile：0〜15（0）、portProfile：0〜5（0） | 図・文章・表／19択・5解答欄 |
| [旧午後問5 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=24) | generator-source-2019r01a-fe-pm-5@3.2.0 | 旧制度・午後：ストレス判定処理の流れ図と最少テスト。testRowsCase：0〜36（0）、numericCase：0〜2（0） | 文章・表・図／18択・6解答欄 |
| [旧午後問6 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=28) | generator-source-2019r01a-fe-pm-6@3.2.0 | 旧制度・午後：結合テストの進捗と品質管理。countScaleCase：0〜3（0）、actualBugCase：0〜4（0）、progressCauseCase：0〜2（0）、designCauseScopeCase：0〜1（0） | 文章・表・図・コード／23択・6解答欄 |
| [旧午後問7 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=33) | generator-source-2019r01a-fe-pm-7@3.2.0 | 旧制度・午後：製品別の収益分析。amountScaleCase：0〜3（0）、safetyTargetCase：0〜4（0）、discountCase：0〜4（0） | 文章・表・コード／21択・5解答欄 |
| [旧午後問8 p.38](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=38) | generator-source-2019r01a-fe-pm-8@3.2.0 | 旧制度・午後：Bitap法による文字列検索。検索文字列の配置：0〜3（0）、照合前半の条件：0〜2（0） | 画像・文章・図・表／31択・9解答欄 |
| [旧午後問9 p.45](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=45) | generator-source-2019r01a-fe-pm-9@3.2.0 | 旧制度・午後：C言語のファイルダンプ。excerptOffset：0〜31（0）、lastByteCase：0〜2（0）、emptyFileFrom：0〜1（0） | 文章・表・コード／23択・6解答欄 |
| [旧午後問10 p.50](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=50) | generator-source-2019r01a-fe-pm-10@3.2.0 | 旧制度・午後：COBOLの販売集計。discountStageCase：0〜3（0）、salesDistributionCase：0〜9（0） | 文章・表・コード／27択・6解答欄 |
| [旧午後問11 p.57](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=57) | generator-source-2019r01a-fe-pm-11@3.2.0 | 旧制度・午後：Javaの非同期通知とスレッド同期。shutdownRegistryCase：0〜1（0）、notificationBatchCase：0〜3（0）、userDeviceMappingCase：0〜2（0） | 文章・コード・表／30択・6解答欄 |
| [旧午後問12 p.64](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=64) | generator-source-2019r01a-fe-pm-12@3.2.0 | 旧制度・午後：CASL IIのパック10進数加算。numericExampleCase：0〜15（0）、sameSignCase：0〜1（0） | 文章・図・コード・表／44択・8解答欄 |
| [旧午後問13 p.70](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf#page=70) | generator-source-2019r01a-fe-pm-13@3.2.0 | 旧制度・午後：表計算のメロン仕分と価格算出。shipmentDataCase：0〜7（0）、unitPriceCase：0〜4（0） | 画像・文章・表・図／40択・6解答欄 |

### 2019年度 秋期・午前

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午前問1 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=3) | generator-source-2019r01a-fe-am-1@3.2.0 | 2進数変換の流れ図。出力桁数：5〜8（8） | 文章・図・表／4択 |
| [旧午前問2 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=3) | generator-source-2019r01a-fe-am-2@3.2.0 | 全ビットの反転。nibbles：1〜3（2） | 文章・図／4択 |
| [旧午前問3 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=4) | generator-source-2019r01a-fe-am-3@3.2.0 | 隣接行列と無向グラフ。実接続の条件：0〜2（0） | 文章・図／4択 |
| [旧午前問4 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=5) | generator-source-2019r01a-fe-am-4@3.2.0 | 有理関数の比の極限。constantInF：1〜3（1）、coefficientInG：1〜3（1） | 文章・図／4択 |
| [旧午前問5 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=5) | generator-source-2019r01a-fe-am-5@3.2.0 | 平均と標準偏差から正規分布を選ぶ。平均の条件：0〜2（0）、標準偏差の条件：0〜2（0） | 文章・図／4択 |
| [旧午前問6 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=6) | generator-source-2019r01a-fe-am-6@3.2.0 | 一様乱数の差の確率。randomLimitIndex：0〜2（1）、difference：0〜2（0） | 文章・図・コード／4択 |
| [旧午前問7 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=6) | generator-source-2019r01a-fe-am-7@3.2.0 | BNFで定義した変数名。再帰生成の方向：0〜1（0） | 文章・図／4択 |
| [旧午前問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=6) | generator-source-2019r01a-fe-am-8@3.8.0 | 所望の出力列に必要な最少スタック数。outputOrder：0〜7（0） | 文章・図／4択 |
| [旧午前問9 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=7) | generator-source-2019r01a-fe-am-9@3.2.0 | 配列の回転。変換：0〜3（3）、元の模様：0〜2（0） | 文章・図／4択 |
| [旧午前問10 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=8) | generator-source-2019r01a-fe-am-10@3.2.0 | ハッシュ値。数字列：0〜5（0） | 文章・図／4択 |
| [旧午前問11 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=8) | generator-source-2019r01a-fe-am-11@3.2.0 | 再帰関数。引数n：3〜8（5） | 文章・図・コード／4択 |
| [旧午前問12 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=8) | generator-source-2019r01a-fe-am-12@3.2.0 | クロック周波数と命令実行数。clockGHz：1〜3（1）、cpiIndex：0〜2（1） | 文章・図／4択 |
| [旧午前問13 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=9) | generator-source-2019r01a-fe-am-13@3.2.0 | 多重割込みとメイン処理時間。割込みAの処理時間：0〜2（0）、割込みBの処理時間：0〜2（1） | 文章・図・表／4択 |
| [旧午前問14 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=9) | generator-source-2019r01a-fe-am-14@3.2.0 | 機器の接続方法。接続方法の対象：0〜2（0） | 文章・図／4択 |
| [旧午前問15 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=10) | generator-source-2019r01a-fe-am-15@3.8.0 | RAIDのデータ配置と冗長化。データ配置の方式：0〜3（0） | 文章・図／4択 |
| [旧午前問16 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=10) | generator-source-2019r01a-fe-am-16@3.2.0 | 並列と直列構成の稼働率差。availabilityTenths：6〜9（9） | 文章・図／4択 |
| [旧午前問17 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=10) | generator-source-2019r01a-fe-am-17@3.2.0 | バッファサイズ。連続送信時間のT倍：1〜3（1） | 文章・図／4択 |
| [旧午前問18 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=11) | generator-source-2019r01a-fe-am-18@3.2.0 | 優先度によるプリエンプション。機能・条件：0〜1（0） | 文章・図／4択 |
| [旧午前問19 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=11) | generator-source-2019r01a-fe-am-19@3.2.0 | 更新情報を用いるバックアップ。機能・条件：0〜1（0） | 文章・図／4択 |
| [旧午前問20 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=12) | generator-source-2019r01a-fe-am-20@3.3.0 | 半導体メモリの特徴。問うメモリの種類：0〜3（0） | 文章・図／4択 |
| [旧午前問21 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=12) | generator-source-2019r01a-fe-am-21@3.2.0 | 立上りエッジとシフトレジスタ。シリアルデータ列：0〜3（0） | 文章・図／4択 |
| [旧午前問22 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=13) | generator-source-2019r01a-fe-am-22@3.2.0 | 論理回路の結線と真理値表。回路の結線：0〜3（0） | 文章・図／4択 |
| [旧午前問23 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=13) | generator-source-2019r01a-fe-am-23@3.2.0 | 商品コードの体系。コードに求める性質：0〜3（0） | 文章・図／4択 |
| [旧午前問24 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=14) | generator-source-2019r01a-fe-am-24@3.2.0 | 動画と静止画の圧縮技術。圧縮技術の対象：0〜1（0） | 文章・図／4択 |
| [旧午前問25 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=14) | generator-source-2019r01a-fe-am-25@3.2.0 | UMLの多重度。多重度の条件：0〜3（0） | 文章・図／4択 |
| [旧午前問26 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=15) | generator-source-2019r01a-fe-am-26@3.2.0 | GROUP BYとHAVINGによる平均の条件。集約する単位：0〜1（0）、平均点の下限：0〜2（0） | 文章・図・コード／4択 |
| [旧午前問27 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=16) | generator-source-2019r01a-fe-am-27@3.2.0 | 関係モデルの演算。関係への操作：0〜3（0） | 文章・図／4択 |
| [旧午前問28 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=16) | generator-source-2019r01a-fe-am-28@3.2.0 | トランザクションの状態遷移。不可能な直接遷移：0〜3（0） | 文章・図・表／4択 |
| [旧午前問29 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=17) | generator-source-2019r01a-fe-am-29@3.7.0 | 2相ロックとデッドロック。対象条件：0〜16（0） | 文章・図・表／4択 |
| [旧午前問30 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=17) | generator-source-2019r01a-fe-am-30@3.2.0 | 制御情報を含む回線利用率。fileMegabytes：1〜3（1）、lineRateIndex：0〜1（0）、periodIndex：0〜1（0） | 文章・図／4択 |
| [旧午前問31 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=18) | generator-source-2019r01a-fe-am-31@3.2.0 | CSMAの送信動作。対象条件：0〜1（0） | 文章・図／4択 |
| [旧午前問32 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=18) | generator-source-2019r01a-fe-am-32@3.7.0 | ネットワーク機器の層と機能。対象条件：0〜2（0） | 文章・図／4択 |
| [旧午前問33 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=19) | generator-source-2019r01a-fe-am-33@3.2.0 | 宅内接続で必要な通信機能。対象条件：0〜3（0） | 文章・図／4択 |
| [旧午前問34 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=19) | generator-source-2019r01a-fe-am-34@3.2.0 | HTTPプロキシの宛先ポート。対象のTCP接続：0〜1（0） | 文章・図／4択 |
| [旧午前問35 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=20) | generator-source-2019r01a-fe-am-35@3.2.0 | DNSキャッシュと誘導される利用者。対象条件：0〜1（0） | 文章・図／4択 |
| [旧午前問36 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=20) | generator-source-2019r01a-fe-am-36@3.3.0 | マルウェアの動的解析と静的解析。問う解析手法と観測項目：0〜5（0） | 文章・図／4択 |
| [旧午前問37 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=20) | generator-source-2019r01a-fe-am-37@3.2.0 | 通信セキュリティ規格の役割。対象条件：0〜3（0） | 文章・図／4択 |
| [旧午前問38 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=21) | generator-source-2019r01a-fe-am-38@3.2.0 | RSA署名の検証鍵と使用方法。対象条件：0〜1（0） | 文章・図／4択 |
| [旧午前問39 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=21) | generator-source-2019r01a-fe-am-39@3.2.0 | 情報セキュリティの仕組み。対象条件：0〜3（0） | 文章・図／4択 |
| [旧午前問40 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=22) | generator-source-2019r01a-fe-am-40@3.7.0 | 確認済みハッシュ値と完全性。対象条件：0〜4（0） | 文章・図／4択 |
| [旧午前問41 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=22) | generator-source-2019r01a-fe-am-41@3.2.0 | 攻撃操作と名称。対象条件：0〜3（0） | 文章・図／4択 |
| [旧午前問42 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=23) | generator-source-2019r01a-fe-am-42@3.7.0 | FWの三つの区画とサーバ配置。対象条件：0〜4（0） | 文章・図／4択 |
| [旧午前問43 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=23) | generator-source-2019r01a-fe-am-43@3.7.0 | SIEMと他の機構。対象条件：0〜4（0） | 文章・図／4択 |
| [旧午前問44 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=24) | generator-source-2019r01a-fe-am-44@3.2.0 | 電子メールの認証と保護。問う条件：0〜3（3） | 文章・図／4択 |
| [旧午前問45 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=24) | generator-source-2019r01a-fe-am-45@3.2.0 | DFDの記号の意味。対象の図形：0〜2（0） | 文章・図／4択 |
| [旧午前問46 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=24) | generator-source-2019r01a-fe-am-46@3.7.0 | モジュール結合度。着目する条件・記述：0〜3（0） | 文章・図／4択 |
| [旧午前問47 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=25) | generator-source-2019r01a-fe-am-47@3.2.0 | エラー埋込法の一般関係式。対象条件：0〜3（0） | 文章・図・数式／4択 |
| [旧午前問48 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=25) | generator-source-2019r01a-fe-am-48@3.7.0 | スタブとドライバの役割。対象条件：0〜4（0） | 文章・図／4択 |
| [旧午前問49 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=25) | generator-source-2019r01a-fe-am-49@3.7.0 | 命令網羅と判定条件網羅。対象条件：0〜2（0） | 文章・図／4択 |
| [旧午前問50 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=26) | generator-source-2019r01a-fe-am-50@3.7.0 | XPのプラクティス。対象条件：0〜4（0） | 文章・図／4択 |
| [旧午前問51 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=26) | generator-source-2019r01a-fe-am-51@3.2.0 | アクティビティの依存関係。sourceCondition：0〜3（0） | 文章・図／4択 |
| [旧午前問52 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=26) | generator-source-2019r01a-fe-am-52@3.8.0 | クリティカルパス。作業日数の条件：0〜11（0） | 文章・図／4択 |
| [旧午前問53 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=27) | generator-source-2019r01a-fe-am-53@3.2.0 | 見積方法。問う対象：0〜3（2） | 文章・図／4択 |
| [旧午前問54 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=27) | generator-source-2019r01a-fe-am-54@3.2.0 | 増員による一対一打合せの増加。members：8〜12（10）、addedMembers：2〜4（2） | 文章・図・箇条書き／4択 |
| [旧午前問56 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=28) | generator-source-2019r01a-fe-am-56@3.7.0 | システム移行計画。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問58 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=29) | generator-source-2019r01a-fe-am-58@3.7.0 | システムテストの監査。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問59 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=30) | generator-source-2019r01a-fe-am-59@3.7.0 | 監査人の独立性。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問60 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=30) | generator-source-2019r01a-fe-am-60@3.7.0 | アクセス制御の監査。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問61 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=30) | generator-source-2019r01a-fe-am-61@3.2.0 | 情報化計画の手法。sourceCondition：0〜1（0） | 文章・図／4択 |
| [旧午前問62 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=31) | generator-source-2019r01a-fe-am-62@3.7.0 | RPAの活用。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問63 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=31) | generator-source-2019r01a-fe-am-63@3.7.0 | ビッグデータの取扱い。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問64 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=32) | generator-source-2019r01a-fe-am-64@3.2.0 | プライバシー保護の仕組み。sourceCondition：0〜1（0） | 文章・図／4択 |
| [旧午前問65 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=32) | generator-source-2019r01a-fe-am-65@3.7.0 | 非機能要件の定義で行う作業。開発条件と業務機能の状況：0〜4（0） | 文章・図／4択 |
| [旧午前問66 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=32) | generator-source-2019r01a-fe-am-66@3.2.0 | リレーションシップマーケティング。sourceCondition：0〜1（0） | 文章・図／4択 |
| [旧午前問67 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=33) | generator-source-2019r01a-fe-am-67@3.2.0 | バランススコアカード。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問68 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=33) | generator-source-2019r01a-fe-am-68@3.2.0 | プロダクトイノベーション。sourceCondition：0〜1（0） | 文章・図／4択 |
| [旧午前問69 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=33) | generator-source-2019r01a-fe-am-69@3.2.0 | 情報社会の格差と利用しやすさ。sourceCondition：0〜1（0） | 文章・図／4択 |
| [旧午前問70 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=34) | generator-source-2019r01a-fe-am-70@3.7.0 | かんばん方式。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問71 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=34) | generator-source-2019r01a-fe-am-71@3.2.0 | 仮想通貨のマイニング。sourceCondition：0〜1（0） | 文章・図／4択 |
| [旧午前問72 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=34) | generator-source-2019r01a-fe-am-72@3.2.0 | インターネットを利用した仕組み。sourceCondition：0〜3（0） | 文章・図／4択 |
| [旧午前問73 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=35) | generator-source-2019r01a-fe-am-73@3.7.0 | 生産現場の機械学習。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問74 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=35) | generator-source-2019r01a-fe-am-74@3.7.0 | 事業継続計画の運用。sourceCondition：0〜2（0） | 文章・図／4択 |
| [旧午前問75 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=35) | generator-source-2019r01a-fe-am-75@3.2.0 | CIOの役割。sourceCondition：0〜1（0） | 文章・図／4択 |
| [旧午前問76 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=36) | generator-source-2019r01a-fe-am-76@3.8.0 | 原料制約と最大利益。原料量の倍率：1〜3（1）、原料Aの追加6単位：0〜2（0） | 文章・図・表／4択 |
| [旧午前問77 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=36) | generator-source-2019r01a-fe-am-77@3.2.0 | 投資効果の指標。sourceCondition：0〜3（0） | 文章・図／4択 |
| [旧午前問78 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=36) | generator-source-2019r01a-fe-am-78@3.2.0 | 目標利益と売上高。基準売上高の100百万円単位：1〜2（1）、目標利益の6百万円単位：1〜6（3） | 文章・図／4択 |
| [旧午前問79 p.37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=37) | generator-source-2019r01a-fe-am-79@3.2.0 | ソフトウェアの使用許諾方式。sourceCondition：0〜1（0） | 文章・図／4択 |
| [旧午前問80 p.37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_am_qs.pdf#page=37) | generator-source-2019r01a-fe-am-80@3.2.0 | 製造物責任法の対象。sourceCondition：0〜1（0） | 文章・図／4択 |

### 2019年度 春期・午後

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午後問1 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=5) | generator-source-2019h31h-fe-pm-1@3.2.0 | 旧制度・午後：クラウドサービスの利用者認証。認証基盤の誤概念：0〜1（0）、可用性の誤概念：0〜1（0）、別の認証要素：0〜1（0）、検証鍵との混同：0〜1（0）、送信される項目：0〜1（0）、機密性の誤概念：0〜1（0） | 文章・図／18択・5解答欄 |
| [旧午後問2 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=9) | generator-source-2019h31h-fe-pm-2@3.2.0 | 旧制度・午後：ページング方式の仮想記憶。physicalPageLayout：0〜3（0）、referenceOrder：0〜11（0）、initialFrameCount：2〜3（3） | 文章・図・表／22択・5解答欄 |
| [旧午後問3 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=13) | generator-source-2019h31h-fe-pm-3@3.2.0 | 旧制度・午後：定期健康診断の関係データベース。decade：0〜2（0）、selectedSex：0〜1（0）、yearOrder：0〜1（0）、gradeOrder：0〜1（0）、heightTranslation：-1〜1（0） | 文章・コード・表・図／26択・6解答欄 |
| [旧午後問4 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=18) | generator-source-2019h31h-fe-pm-4@3.2.0 | 旧制度・午後：eラーニングの負荷分散と処理待ち時間。networkAddresses：0〜3（0）、serviceTimeScenario：0〜2（0） | 文章・図・数式／22択・5解答欄 |
| [旧午後問5 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=23) | generator-source-2019h31h-fe-pm-5@3.2.0 | 旧制度・午後：農産物の検査管理システム。申込DBへ混入する他DB情報：0〜1（0）、誤った先頭の申込者API：0〜1（0） | 文章・図／24択・5解答欄 |
| [旧午後問6 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=30) | generator-source-2019h31h-fe-pm-6@3.2.0 | 旧制度・午後：社内システムの仕様変更の扱い。プログラム開発の生産性：0〜3（0）、結合試験の生産性：0〜3（0） | 文章・箇条書き・図・表／35択・8解答欄 |
| [旧午後問7 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=35) | generator-source-2019h31h-fe-pm-7@3.2.0 | 旧制度・午後：製造業における情報システムの統合。製造関係：0〜8（0）、取扱高条件：0〜2（0） | 文章・図・表／24択・7解答欄 |
| [旧午後問8 p.39](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=39) | generator-source-2019h31h-fe-pm-8@3.2.0 | 旧制度・午後：ハフマン符号による文字列圧縮。設問1の文字出現回数の組：0〜3（0） | 画像・文章・表・箇条書き・図／24択・6解答欄 |
| [旧午後問9 p.47](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=47) | generator-source-2019h31h-fe-pm-9@3.2.0 | 旧制度・午後：C言語による文字出現回数の印字。印字例の出現回数条件：0〜16（0） | 図・文章／24択・7解答欄 |
| [旧午後問10 p.52](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=52) | generator-source-2019h31h-fe-pm-10@3.2.0 | 旧制度・午後：COBOLによるテスト順位と平均。順位の評価方針：0〜1（0） | 文章・図・コード／22択・6解答欄 |
| [旧午後問11 p.58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=58) | generator-source-2019h31h-fe-pm-11@3.2.0 | 旧制度・午後：Javaによる迷路上の駒の操作。開始地点の北側の枝の長さ：0〜2（2）、途中の北側の枝の長さ：0〜3（3） | 画像・文章・図／22択・6解答欄 |
| [旧午後問12 p.64](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=64) | generator-source-2019h31h-fe-pm-12@3.2.0 | 旧制度・午後：ビット列操作と副プログラムの再構成。開始語内のビットインデックス条件：0〜3（2）、最終語内のビット数条件：0〜3（1） | 画像・文章・図／27択・6解答欄 |
| [旧午後問13 p.69](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_pm_qs.pdf#page=69) | generator-source-2019h31h-fe-pm-13@3.2.0 | 旧制度・午後：会員販売データの表計算と集計マクロ。販売明細と商品選択の条件：1〜16（1） | 画像・文章・図／33択・6解答欄 |

### 2019年度 春期・午前

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午前問1 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=3) | generator-source-2019h31h-fe-am-1@3.2.0 | 二進小数への変換。numerator：7〜9（7）、denominatorExponent：4〜6（5） | 文章／4択 |
| [旧午前問2 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=3) | generator-source-2019h31h-fe-am-2@3.2.0 | ビットマスクによる抽出。keptBits：5〜7（7）、wrongMaskBits：2〜4（4） | 文章／4択 |
| [旧午前問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=3) | generator-source-2019h31h-fe-am-3@3.2.0 | 命題の真理値。Qの極性：0〜1（0）、Rの極性：0〜1（0） | 文章・表／4択 |
| [旧午前問4 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=4) | generator-source-2019h31h-fe-am-4@3.2.0 | 機械学習の学習方法。機能・条件：0〜2（0） | 文章／4択 |
| [旧午前問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=4) | generator-source-2019h31h-fe-am-5@3.2.0 | 九つの節を持つ二分探索木。treeCondition：0〜3（0）、valueOffset：0〜3（0） | 文章・図／4択 |
| [旧午前問6 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=5) | generator-source-2019h31h-fe-am-6@3.2.0 | 再帰呼出しと三つのスタック。first：1〜3（1）、step：1〜3（1） | 文章・コード／4択 |
| [旧午前問7 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=6) | generator-source-2019h31h-fe-am-7@3.2.0 | 引算版ユークリッド法の比較回数。inputCase：0〜5（0） | 文章・図／4択 |
| [旧午前問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=6) | generator-source-2019h31h-fe-am-8@3.2.0 | プログラムの性質。機能・条件：0〜3（0） | 文章／4択 |
| [旧午前問9 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=6) | generator-source-2019h31h-fe-am-9@3.3.0 | 割込みの発生原因。問う割込みの区分と発生原因：0〜5（0） | 文章／4択 |
| [旧午前問10 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=7) | generator-source-2019h31h-fe-am-10@3.2.0 | 実効アクセス時間の順序。アクセス時間の条件：0〜3（0） | 文章・表／4択 |
| [旧午前問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=7) | generator-source-2019h31h-fe-am-11@3.2.0 | ポイントとディスプレイのドット数。dpiUnits：4〜7（4）、pointUnits：1〜2（1） | 文章／4択 |
| [旧午前問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=7) | generator-source-2019h31h-fe-am-12@3.2.0 | 入出力機器の機能。機能・条件：0〜3（0） | 文章／4択 |
| [旧午前問13 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=8) | generator-source-2019h31h-fe-am-13@3.7.0 | デュアルシステムの冗長構成。conceptCondition：0〜3（0） | 文章／4択 |
| [旧午前問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=8) | generator-source-2019h31h-fe-am-14@3.2.0 | 並列機器の稼働率。クライアント台数：2〜4（3）、プリンタ台数：2〜3（2） | 文章・図・表／4択 |
| [旧午前問15 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=9) | generator-source-2019h31h-fe-am-15@3.2.0 | データベースの性能低下の調査。conceptCondition：0〜3（2） | 文章・図／4択 |
| [旧午前問16 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=9) | generator-source-2019h31h-fe-am-16@3.2.0 | タスクの実行管理。conceptCondition：0〜2（0） | 文章／4択 |
| [旧午前問17 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=10) | generator-source-2019h31h-fe-am-17@3.2.0 | システム用ソフトウェアの役割。conceptCondition：0〜2（0） | 文章／4択 |
| [旧午前問18 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=10) | generator-source-2019h31h-fe-am-18@3.7.0 | 検索のためのハッシュ法。conceptCondition：0〜3（0） | 文章／4択 |
| [旧午前問19 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=10) | generator-source-2019h31h-fe-am-19@3.3.0 | インタプリタと関連する処理系。問う処理系：0〜3（0） | 文章／4択 |
| [旧午前問20 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=11) | generator-source-2019h31h-fe-am-20@3.7.0 | OSIによるオープンソースの定義。conceptCondition：0〜3（0） | 文章／4択 |
| [旧午前問21 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=11) | generator-source-2019h31h-fe-am-21@3.2.0 | 半導体メモリの記憶方式。conceptCondition：0〜3（0） | 文章／4択 |
| [旧午前問22 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=11) | generator-source-2019h31h-fe-am-22@3.2.0 | 二入力論理回路。機能・条件：0〜3（0） | 文章・図／4択 |
| [旧午前問23 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=12) | generator-source-2019h31h-fe-am-23@3.7.0 | 直流給電の利点。誤条件：0〜3（0） | 文章／4択 |
| [旧午前問24 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=12) | generator-source-2019h31h-fe-am-24@3.2.0 | GUI部品の用途。conceptCondition：0〜3（0） | 文章／4択 |
| [旧午前問25 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=12) | generator-source-2019h31h-fe-am-25@3.2.0 | 音声を記録できる時間。capacityUnits：1〜4（4）、sampleRateIndex：0〜2（1） | 文章／4択 |
| [旧午前問26 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=13) | generator-source-2019h31h-fe-am-26@3.7.0 | 関係モデルの属性。conceptCondition：0〜3（0） | 文章／4択 |
| [旧午前問27 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=13) | generator-source-2019h31h-fe-am-27@3.2.0 | SQLの集約と並べ替え。集約の条件：0〜3（0）、並べ替えの条件：0〜3（0） | 文章・コード／4択 |
| [旧午前問28 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=14) | generator-source-2019h31h-fe-am-28@3.2.0 | 関係演算。抽出の方向：0〜1（0）、数量の加算：0〜2（0） | 文章・表／4択 |
| [旧午前問29 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=14) | generator-source-2019h31h-fe-am-29@3.2.0 | SQLの結合と表を限定した条件。学部の所在地条件：0〜3（2）、学生の住所条件：0〜15（5） | 文章・表・コード／4択 |
| [旧午前問30 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=15) | generator-source-2019h31h-fe-am-30@3.2.0 | データストアのデータモデル。conceptCondition：0〜3（0） | 文章／4択 |
| [旧午前問31 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=15) | generator-source-2019h31h-fe-am-31@3.2.0 | OSI層と接続機器の機能。層と中継機能：0〜3（0） | 文章／4択 |
| [旧午前問32 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=15) | generator-source-2019h31h-fe-am-32@3.2.0 | IPv4のホスト用アドレス数。prefixLength：22〜27（23） | 文章／4択 |
| [旧午前問33 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=15) | generator-source-2019h31h-fe-am-33@3.2.0 | ネットワークプロトコル。問う条件：0〜3（3） | 文章／4択 |
| [旧午前問34 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=16) | generator-source-2019h31h-fe-am-34@3.2.0 | 戻りのTCPポート番号。PCポート番号の差：0〜5（0）、HTTPポート：0〜2（0） | 文章・表／4択 |
| [旧午前問35 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=16) | generator-source-2019h31h-fe-am-35@3.2.0 | ネットワークと業務可視化の技術。機能・条件：0〜2（0） | 文章／4択 |
| [旧午前問36 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=17) | generator-source-2019h31h-fe-am-36@3.2.0 | 認証・暗号・通信解析の目的。機能・条件：0〜3（0） | 文章／4択 |
| [旧午前問37 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=17) | generator-source-2019h31h-fe-am-37@3.2.0 | パスワードへの攻撃手法。securityCondition：0〜2（0） | 文章／4択 |
| [旧午前問38 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=18) | generator-source-2019h31h-fe-am-38@3.7.0 | メッセージ認証符号。着目する条件・記述：0〜3（0） | 文章／4択 |
| [旧午前問39 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=18) | generator-source-2019h31h-fe-am-39@3.7.0 | 楕円曲線暗号の特徴。securityCondition：0〜3（0） | 文章／4択 |
| [旧午前問40 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=18) | generator-source-2019h31h-fe-am-40@3.7.0 | リスクファイナンシング。securityCondition：0〜3（0） | 文章／4択 |
| [旧午前問42 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=19) | generator-source-2019h31h-fe-am-42@3.7.0 | 不正のトライアングル。securityCondition：0〜3（0） | 文章／4択 |
| [旧午前問43 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=19) | generator-source-2019h31h-fe-am-43@3.2.0 | 通信の暗号化プロトコル。securityCondition：0〜3（0） | 文章／4択 |
| [旧午前問44 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=20) | generator-source-2019h31h-fe-am-44@3.2.0 | セキュリティの機器とネットワーク。securityCondition：0〜3（0） | 文章／4択 |
| [旧午前問45 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=20) | generator-source-2019h31h-fe-am-45@3.2.0 | セキュリティ手法の効果。securityCondition：0〜2（0） | 文章／4択 |
| [旧午前問46 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=20) | generator-source-2019h31h-fe-am-46@3.2.0 | UMLの振る舞いの表現。securityCondition：0〜3（0） | 文章／4択 |
| [旧午前問47 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=21) | generator-source-2019h31h-fe-am-47@3.7.0 | ブラックボックステスト。securityCondition：0〜3（0） | 文章／4択 |
| [旧午前問48 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=21) | generator-source-2019h31h-fe-am-48@3.2.0 | ソフトウェアテストの支援ツール。securityCondition：0〜3（0） | 文章／4択 |
| [旧午前問49 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=22) | generator-source-2019h31h-fe-am-49@3.2.0 | 初年度修正費用の期待値。sizeThousands：1〜3（2）、defectsHundredths：2〜5（4）、discoveryTenths：1〜3（2）、majorTenths：2〜4（2）、costHundreds：1〜3（2） | 文章・箇条書き／4択 |
| [旧午前問50 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=22) | generator-source-2019h31h-fe-am-50@3.2.0 | Webの技術とサービス。managementCondition：0〜3（0） | 文章／4択 |
| [旧午前問52 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=23) | generator-source-2019h31h-fe-am-52@3.2.0 | PDMの依存関係。managementCondition：0〜3（0） | 文章／4択 |
| [旧午前問53 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=24) | generator-source-2019h31h-fe-am-53@3.8.0 | 最少所要日数。Aの日数：1〜3（2）、Eの日数：1〜3（2） | 文章・図／4択 |
| [旧午前問54 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=24) | generator-source-2019h31h-fe-am-54@3.2.0 | 開発に必要な最少要員。programScale：1〜3（1）、daysIndex：0〜2（1）、otherWorkMultiplier：7〜9（8） | 文章・表／4択 |
| [旧午前問55 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=25) | generator-source-2019h31h-fe-am-55@3.2.0 | サービス改善。問う対象：0〜3（1） | 文章／4択 |
| [旧午前問56 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=25) | generator-source-2019h31h-fe-am-56@3.2.0 | システムのテストの目的。managementCondition：0〜3（0） | 文章／4択 |
| [旧午前問57 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=25) | generator-source-2019h31h-fe-am-57@3.2.0 | 回復処理。問う条件：0〜3（3） | 文章／4択 |
| [旧午前問58 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=26) | generator-source-2019h31h-fe-am-58@3.7.0 | 監査のインタビューと証拠。managementCondition：0〜3（0） | 文章／4択 |
| [旧午前問59 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=26) | generator-source-2019h31h-fe-am-59@3.7.0 | 監査の独立性。着目する条件・記述：0〜3（0） | 文章／4択 |
| [旧午前問60 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=27) | generator-source-2019h31h-fe-am-60@3.7.0 | バックアップ管理の監査。managementCondition：0〜4（0） | 文章／4択 |
| [旧午前問61 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=27) | generator-source-2019h31h-fe-am-61@3.2.0 | EAの四つの観点。managementCondition：0〜3（0） | 文章／4択 |
| [旧午前問62 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=27) | generator-source-2019h31h-fe-am-62@3.7.0 | オンデマンド型のサービス。managementCondition：0〜3（0） | 文章／4択 |
| [旧午前問63 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=28) | generator-source-2019h31h-fe-am-63@3.7.0 | BIによる経営のためのデータ分析。managementCondition：0〜3（0） | 文章／4択 |
| [旧午前問64 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=28) | generator-source-2019h31h-fe-am-64@3.2.0 | ビッグデータの分析結果の反映先と時機。managementCondition：0〜3（3） | 文章・図／4択 |
| [旧午前問65 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=29) | generator-source-2019h31h-fe-am-65@3.8.0 | ROIによる比較。利益構成：0〜3（0）、金額倍率：1〜2（1） | 文章・表／4択 |
| [旧午前問66 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=30) | generator-source-2019h31h-fe-am-66@3.7.0 | 非機能要件の条件。strategyCondition：0〜3（0） | 文章／4択 |
| [旧午前問68 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=30) | generator-source-2019h31h-fe-am-68@3.2.0 | 競争上の地位と戦略。strategyCondition：0〜3（0） | 文章／4択 |
| [旧午前問69 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=31) | generator-source-2019h31h-fe-am-69@3.2.0 | Web改善の効果指標。strategyCondition：0〜3（0） | 文章／4択 |
| [旧午前問70 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=31) | generator-source-2019h31h-fe-am-70@3.2.0 | 革新と標準化・製造委託。strategyCondition：0〜3（0） | 文章／4択 |
| [旧午前問71 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=31) | generator-source-2019h31h-fe-am-71@3.2.0 | IoTの応用。問う対象：0〜3（3） | 文章／4択 |
| [旧午前問72 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=32) | generator-source-2019h31h-fe-am-72@3.7.0 | CGMの例。消費者が発信する内容：0〜3（0） | 文章／4択 |
| [旧午前問73 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=32) | generator-source-2019h31h-fe-am-73@3.2.0 | ITによる社会・経済の仕組み。strategyCondition：0〜3（0） | 文章／4択 |
| [旧午前問74 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=33) | generator-source-2019h31h-fe-am-74@3.2.0 | デジタル利用と情報技術の区別。strategyCondition：0〜3（0） | 文章／4択 |
| [旧午前問75 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=33) | generator-source-2019h31h-fe-am-75@3.2.0 | 企業の社会的責任の施策。strategyCondition：0〜3（0） | 文章／4択 |
| [旧午前問76 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=33) | generator-source-2019h31h-fe-am-76@3.2.0 | 企業の組織と経営資源獲得。strategyCondition：0〜3（0） | 文章／4択 |
| [旧午前問77 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=34) | generator-source-2019h31h-fe-am-77@3.7.0 | 特性要因図の因果関係。誤条件：0〜3（0） | 文章・図／4択 |
| [旧午前問78 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=34) | generator-source-2019h31h-fe-am-78@3.2.0 | 需要不足による機会損失。profitA：1〜3（1）、shortageA：1〜3（1）、shortageD：1〜3（2）、shortageE：2〜4（3） | 文章・表／4択 |
| [旧午前問79 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=35) | generator-source-2019h31h-fe-am-79@3.2.0 | 著作物に関する権利。機能・条件：0〜3（0） | 文章／4択 |
| [旧午前問80 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000ddiw-att/2019h31h_fe_am_qs.pdf#page=35) | generator-source-2019h31h-fe-am-80@3.2.0 | 技術標準に関わる組織。strategyCondition：0〜3（0） | 文章／4択 |

### 2018年度 秋期・午後

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午後問1 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=6) | generator-source-2018h30a-fe-pm-1@3.2.0 | 情報セキュリティ事故と対策。availabilityDistractorProfile：0〜3（0） | 図・見出し・文章・箇条書き／20択・5解答欄 |
| [旧午後問2 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=10) | generator-source-2018h30a-fe-pm-2@3.2.0 | プロセスのスケジューリング。プロセスXの三つのCPU処理時間の組：0〜3（0）、複数プロセスのCPU処理時間の組：0〜3（0） | 文章・図・箇条書き・表／19択・4解答欄 |
| [旧午後問3 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=15) | generator-source-2018h30a-fe-pm-3@3.2.0 | コンサートチケット販売サイトの関係データベースの設計及び運用。対象コンサート・席種・価格の組：0〜3（0）、支払期限前の通知日数：0〜2（0）、ポイント境界額の組：0〜1（0） | 文章・図・表・コード／18択・4解答欄 |
| [旧午後問4 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=20) | generator-source-2018h30a-fe-pm-4@3.2.0 | ネットワークの障害分析と対策。追加設定で方向を誤るサービス：0〜2（0）、追加開発セグメントとネットワークアドレスの組：0〜3（0） | 文章・図／15択・5解答欄 |
| [旧午後問5 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=24) | generator-source-2018h30a-fe-pm-5@3.2.0 | 購買管理システムの更新可否チェック。既存依頼03・04の登録と削除の組：0〜1（0）、決定表の変更・削除列の空欄位置の組：0〜3（0） | 文章・図・表／21択・5解答欄 |
| [旧午後問6 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=30) | generator-source-2018h30a-fe-pm-6@3.2.0 | プロジェクトのスケジュール作成。図1 AとBの1日・2日の配置：0〜1（0）、図1 Kを3日又は4日とする条件：0〜1（0）、回付サービス利用準備を40日又は30日とする条件：0〜1（0） | 文章・図／36択・7解答欄 |
| [旧午後問7 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=34) | generator-source-2018h30a-fe-pm-7@3.2.0 | 広告制作業務の現状把握と改善。通番6の完了段階（担当決定又は不備返却）：0〜1（0）、通番6の媒体（Webのみ，紙のみ，両方）：0〜2（0） | 文章・図・表／16択・5解答欄 |
| [旧午後問8 p.39](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=39) | generator-source-2018h30a-fe-pm-8@3.2.0 | 旧制度・午後：整数式の解析と優先順位。演算子の優先度の組：0〜3（0）、整数式の例：0〜3（0）、実行順を比較する四つの式の組：0〜3（0）、符号付き整数の例：0〜1（0） | 画像・文章・図・表／24択・7解答欄 |
| [旧午後問9 p.45](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=45) | generator-source-2018h30a-fe-pm-9@3.2.0 | 鉄道模型における列車の運行シミュレーション（C）。反復回数（1〜6回）：0〜5（3）、列車3の到達可能な行先：0〜2（0） | 文章・図・コード／29択・6解答欄 |
| [旧午後問10 p.52](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=52) | generator-source-2018h30a-fe-pm-10@3.2.0 | 社内資格の保有状況の管理（COBOL）。事業年度の開始月の組：0〜3（0）、反映対象の上期又は下期：0〜1（0） | 文章・図・コード／24択・6解答欄 |
| [旧午後問11 p.57](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=57) | generator-source-2018h30a-fe-pm-11@3.2.0 | 書式を表すひな形への置換表の適用による文書の作成（Java）。ひな形の境界と置換列の条件：0〜7（0） | 画像・文章・図・コード／23択・6解答欄 |
| [旧午後問12 p.63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=63) | generator-source-2018h30a-fe-pm-12@3.2.0 | 日数の計算（アセンブラ）。基準年（原問題1970年）：0〜7（0） | 画像・文章・図・コード／33択・6解答欄 |
| [旧午後問13 p.67](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_pm_qs.pdf#page=67) | generator-source-2018h30a-fe-pm-13@3.2.0 | 待ち時間の状況などの分析（表計算）。待ち時間を分析する利用状況の例：0〜1080（0） | 画像・文章・図／41択・7解答欄 |

### 2018年度 秋期・午前

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午前問1 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=3) | generator-source-2018h30a-fe-am-1@3.2.0 | 16進小数の分数化。16進小数の第1桁：1〜2（2）、16進小数の第2桁：0〜4（4） | 図・文章／4択 |
| [旧午前問2 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=3) | generator-source-2018h30a-fe-am-2@3.7.0 | 最も右の1を残すビット演算。第1誤答の論理演算：0〜2（0）、第2誤答の論理演算：0〜1（0） | 図・文章／4択 |
| [旧午前問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=3) | generator-source-2018h30a-fe-am-3@3.7.0 | 機械学習とデータからのパターン獲得。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問4 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=4) | generator-source-2018h30a-fe-am-4@3.2.0 | ハフマン符号の欠落符号語。空欄の符号長：0〜1（0）、符号木の左右方向：0〜3（0）、長い二符号の出現率の差：0〜4（2） | 図・文章・表／4択 |
| [旧午前問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=4) | generator-source-2018h30a-fe-am-5@3.2.0 | 待ち行列の操作追跡。9番目の操作：0〜1（0）、最初のデータ：1〜3（1）、データ間隔：1〜2（1） | 図・文章／4択 |
| [旧午前問6 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=5) | generator-source-2018h30a-fe-am-6@3.2.0 | 整列アルゴリズム。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 図・文章／4択 |
| [旧午前問7 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=5) | generator-source-2018h30a-fe-am-7@3.7.0 | コーディング規則。着目する条件・記述：0〜3（0） | 図・文章／4択 |
| [旧午前問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=6) | generator-source-2018h30a-fe-am-8@3.7.0 | Javaの型・継承・自動メモリ管理。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問9 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=6) | generator-source-2018h30a-fe-am-9@3.2.0 | 命令出現率によるMIPS。命令構成：0〜1（0）、動作クロックの倍率：1〜3（2） | 図・文章・表／4択 |
| [旧午前問10 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=6) | generator-source-2018h30a-fe-am-10@3.7.0 | 割込み後に再開する命令位置の保存。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=7) | generator-source-2018h30a-fe-am-11@3.8.0 | データバス幅と冗長ビット。指数n：4〜9（7） | 図・文章／4択 |
| [旧午前問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=7) | generator-source-2018h30a-fe-am-12@3.2.0 | インタフェース規格の特徴。問うインタフェース：0〜3（3） | 図・文章／4択 |
| [旧午前問13 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=8) | generator-source-2018h30a-fe-am-13@3.7.0 | WebサーバとAPサーバの物理的な分離。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問14 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=9) | generator-source-2018h30a-fe-am-14@3.7.0 | キャパシティプランニングの作業順序。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問15 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=9) | generator-source-2018h30a-fe-am-15@3.2.0 | 直結と2区間の迂回回線の稼働率。各回線の稼働率：0〜3（3） | 図・文章／4択 |
| [旧午前問16 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=10) | generator-source-2018h30a-fe-am-16@3.8.0 | 全タスク終了までのCPU遊休時間。3タスクの処理時間の組：0〜7（0） | 図・文章・表／4択 |
| [旧午前問17 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=10) | generator-source-2018h30a-fe-am-17@3.7.0 | 低速入出力とスプーリング。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問18 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=11) | generator-source-2018h30a-fe-am-18@3.7.0 | ラウンドロビンのCPU時間割当て。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問19 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=11) | generator-source-2018h30a-fe-am-19@3.7.0 | コンパイラの最初の解析段階。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問20 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=11) | generator-source-2018h30a-fe-am-20@3.7.0 | リンカと他のプログラム処理の役割。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問21 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=12) | generator-source-2018h30a-fe-am-21@3.2.0 | 半導体メモリの説明。問う対象・条件：0〜3（3） | 図・文章／4択 |
| [旧午前問22 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=12) | generator-source-2018h30a-fe-am-22@3.2.0 | 2入力NAND素子による4入力回路。4入力回路の論理機能：0〜3（0） | 図・文章／4択 |
| [旧午前問23 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=12) | generator-source-2018h30a-fe-am-23@3.7.0 | 二次電池と使い切り電池の区別。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問24 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=13) | generator-source-2018h30a-fe-am-24@3.7.0 | 音声による列車予約のインタフェース。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問25 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=13) | generator-source-2018h30a-fe-am-25@3.2.0 | 画像の表現手法。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 図・文章／4択 |
| [旧午前問26 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=14) | generator-source-2018h30a-fe-am-26@3.8.0 | 所属履歴を表すUMLの最小多重度。全部門に所属者を必要とする条件：0〜1（1）、全社員に所属を必要とする条件：0〜1（1） | 図・文章・表／4択 |
| [旧午前問27 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=15) | generator-source-2018h30a-fe-am-27@3.7.0 | 命名規約で防げる事象と値域の不一致。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問28 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=15) | generator-source-2018h30a-fe-am-28@3.2.0 | 自然結合後の選択と射影。情報学部に所属する2行の集合：0〜14（6） | 図・文章・表／4択 |
| [旧午前問29 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=16) | generator-source-2018h30a-fe-am-29@3.7.0 | ロック粒度と競合待ちの比較。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問30 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=16) | generator-source-2018h30a-fe-am-30@3.2.0 | データベースの回復・確定・退避操作。問う操作・機能の対象：0〜3（3） | 図・文章／4択 |
| [旧午前問31 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=16) | generator-source-2018h30a-fe-am-31@3.2.0 | 伝送時間。データ量の3MB単位：2〜6（4）、速度の1.5Mbps単位：1〜2（1） | 図・文章／4択 |
| [旧午前問32 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=17) | generator-source-2018h30a-fe-am-32@3.7.0 | LANの接続装置。問う対象・判定する条件：0〜4（0）、選択肢の配置：0〜2（0） | 図・文章／4択 |
| [旧午前問33 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=17) | generator-source-2018h30a-fe-am-33@3.2.0 | TCP/IPの名前解決・割当て・呼出し・変換。問う操作・機能の対象：0〜3（3） | 図・文章／4択 |
| [旧午前問34 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=17) | generator-source-2018h30a-fe-am-34@3.2.0 | 文書・メール形式と転送プロトコルの区別。問う操作・機能の対象：0〜3（2） | 図・文章／4択 |
| [旧午前問35 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=18) | generator-source-2018h30a-fe-am-35@3.7.0 | 携帯電話網の通信規格と媒体・端末・音声の機能。媒体アクセスの誤答機構：0〜2（0）、管理範囲の誤答機構：0〜1（0）、音声・セッションの誤答機構：0〜1（0） | 図・文章・箇条書き／4択 |
| [旧午前問36 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=18) | generator-source-2018h30a-fe-am-36@3.7.0 | 署名による改変検知と他の保証の区別。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問37 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=18) | generator-source-2018h30a-fe-am-37@3.2.0 | AESの全鍵探索の最大試行回数。AESの鍵長の種類：0〜2（2） | 図・文章／4択 |
| [旧午前問38 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=19) | generator-source-2018h30a-fe-am-38@3.7.0 | 共通鍵暗号における共有・鍵数・対応関係。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問40 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=20) | generator-source-2018h30a-fe-am-40@3.2.0 | セキュリティ関係資料の作成主体と目的。問う操作・機能の対象：0〜3（0） | 図・文章／4択 |
| [旧午前問41 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=20) | generator-source-2018h30a-fe-am-41@3.7.0 | C&Cと配信・アクセス認証・OTPの役割。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問42 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=21) | generator-source-2018h30a-fe-am-42@3.7.0 | 侵入検知と資産管理・脆弱性検査・評価。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問43 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=21) | generator-source-2018h30a-fe-am-43@3.7.0 | セキュアブートと起動前の署名検証。第1誤答の実条件：0〜2（0）、第2誤答の実条件：0〜1（0）、第3誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問44 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=22) | generator-source-2018h30a-fe-am-44@3.7.0 | 公衆無線LANの対策と効果。条件1：0〜2（0）、条件2：0〜1（0）、条件3：0〜1（0） | 図・文章・表／4択 |
| [旧午前問45 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=23) | generator-source-2018h30a-fe-am-45@3.7.0 | 第三者中継を示すメールログ。条件1：0〜2（0）、条件2：0〜1（0） | 図・文章・表／4択 |
| [旧午前問46 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=23) | generator-source-2018h30a-fe-am-46@3.7.0 | UML 2.0のシーケンス図とコミュニケーション図のどちらにも表現されるものはどれか。対象又は誤答の実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問47 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=24) | generator-source-2018h30a-fe-am-47@3.7.0 | オブジェクト指向におけるクラスとインスタンスとの関係のうち、適切なものはどれか。対象又は誤答の実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問48 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=24) | generator-source-2018h30a-fe-am-48@3.7.0 | モジュール間の情報の受渡しがパラメタだけで行われる、結合度が最も弱いモジュール結合はどれか。対象又は誤答の実条件：0〜4（0） | 図・文章／4択 |
| [旧午前問49 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=24) | generator-source-2018h30a-fe-am-49@3.2.0 | オブジェクト指向における“委譲”に関する説明として、適切なものはどれか。対象又は誤答の実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問50 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=25) | generator-source-2018h30a-fe-am-50@3.7.0 | XP（Extreme Programming）のプラクティスの説明のうち、適切なものはどれか。対象又は誤答の実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問51 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=25) | generator-source-2018h30a-fe-am-51@3.7.0 | ソフトウェア開発プロジェクトにおいて、WBS（Work Breakdown Structure）を使用する目的として、適切なものはどれか。対象又は誤答の実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問52 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=25) | generator-source-2018h30a-fe-am-52@3.8.0 | 8作業と2ダミーの日程計画。8作業の日数の組：0〜7（0） | 図・文章／4択 |
| [旧午前問53 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=26) | generator-source-2018h30a-fe-am-53@3.2.0 | 一人の計画作業量と残作業割合。コーディング完了率25・50・75%：0〜2（0） | 図・文章・表／4択 |
| [旧午前問54 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=26) | generator-source-2018h30a-fe-am-54@3.2.0 | FP・導入教育・管理を含む総工数。機能規模の100FP単位：3〜8（5）、導入教育の10人月単位：1〜2（1）、管理率の10%単位：1〜2（1） | 図・文章／4択 |
| [旧午前問55 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=27) | generator-source-2018h30a-fe-am-55@3.5.0 | キャパシティ管理の傾向分析。native-DES-v2-profile：0〜1（0） | 図・文章／4択 |
| [旧午前問56 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=27) | generator-source-2018h30a-fe-am-56@3.2.0 | コールドスタートと回復方式。条件1：0〜2（0） | 図・文章／4択 |
| [旧午前問57 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=27) | generator-source-2018h30a-fe-am-57@3.2.0 | SLA可用性から停止上限。営業日数の10日単位：2〜3（3）、不稼働率の0.5%単位：1〜2（1） | 図・文章・箇条書き／4択 |
| [旧午前問58 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=28) | generator-source-2018h30a-fe-am-58@3.7.0 | ISMS内部監査とリスク受容基準。USB媒体管理：0〜2（0）、事故報告：0〜1（0）、マルウェア対応：0〜1（0）、リスク評価・受容：0〜1（0） | 図・文章／4択 |
| [旧午前問59 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=28) | generator-source-2018h30a-fe-am-59@3.7.0 | 外部保管媒体の引渡し監査。条件1：0〜4（0） | 図・文章／4択 |
| [旧午前問60 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=28) | generator-source-2018h30a-fe-am-60@3.7.0 | 上場企業の内部統制最終責任。条件1：0〜2（0）、条件2：0〜1（0） | 図・文章／4択 |
| [旧午前問61 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=29) | generator-source-2018h30a-fe-am-61@3.7.0 | IT投資の事前評価。条件1：0〜2（0）、条件2：0〜1（0）、条件3：0〜1（0） | 図・文章／4択 |
| [旧午前問62 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=29) | generator-source-2018h30a-fe-am-62@3.7.0 | BPO。条件profile：0〜2（0） | 図・文章／4択 |
| [旧午前問63 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=30) | generator-source-2018h30a-fe-am-63@3.7.0 | SOA。条件profile：0〜2（0） | 図・文章／4択 |
| [旧午前問64 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=30) | generator-source-2018h30a-fe-am-64@3.7.0 | システム化計画。条件profile：0〜2（0） | 図・文章／4択 |
| [旧午前問66 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=31) | generator-source-2018h30a-fe-am-66@3.2.0 | 調達手順の空欄。条件profile：0〜3（0） | 図・文章／4択 |
| [旧午前問67 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=32) | generator-source-2018h30a-fe-am-67@3.7.0 | 製品ライフサイクルの成長期。条件profile：0〜2（0） | 図・文章／4択 |
| [旧午前問68 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=32) | generator-source-2018h30a-fe-am-68@3.8.0 | 一次需要曲線の内挿。需要0となる価格の500円単位：4〜8（6）、既知需要の価格の500円単位：1〜3（2）、問う価格の500円単位：2〜5（3）、既知需要の10000個単位：4〜8（6） | 図・文章・箇条書き／4択 |
| [旧午前問69 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=33) | generator-source-2018h30a-fe-am-69@3.2.0 | 商品体系変更の顧客数予測。条件profile：0〜3（0） | 図・文章／4択 |
| [旧午前問70 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=33) | generator-source-2018h30a-fe-am-70@3.2.0 | 技術進化の曲線。条件profile：0〜1（0） | 図・文章／4択 |
| [旧午前問71 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=34) | generator-source-2018h30a-fe-am-71@3.7.0 | IoTの構成要素。条件profile：0〜2（0） | 図・文章／4択 |
| [旧午前問72 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=34) | generator-source-2018h30a-fe-am-72@3.7.0 | RFIDの特徴。条件profile：0〜2（0） | 図・文章／4択 |
| [旧午前問73 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=34) | generator-source-2018h30a-fe-am-73@3.7.0 | O to O。条件profile：0〜2（0） | 図・文章／4択 |
| [旧午前問74 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=35) | generator-source-2018h30a-fe-am-74@3.2.0 | 経営の最高責任者。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 図・文章／4択 |
| [旧午前問75 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=35) | generator-source-2018h30a-fe-am-75@3.8.0 | 廃棄費用を含む仕入期待利益。1個当たり利益の100円単位：6〜14（10）、1個当たり廃棄損失の100円単位：1〜18（3） | 図・文章・表／4択 |
| [旧午前問76 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=36) | generator-source-2018h30a-fe-am-76@3.2.0 | 問題分析の図法。問う対象・条件：0〜3（2） | 図・文章／4択 |
| [旧午前問77 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=36) | generator-source-2018h30a-fe-am-77@3.2.0 | 先入先出法による売上原価。受払個数の倍率：1〜3（1）、単価の5円単位の加算：0〜2（0） | 図・文章・表／4択 |
| [旧午前問78 p.37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=37) | generator-source-2018h30a-fe-am-78@3.2.0 | コンピュータウイルス作成の処罰法。条件profile：0〜1（0） | 図・文章／4択 |
| [旧午前問79 p.37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=37) | generator-source-2018h30a-fe-am-79@3.7.0 | 旧個人情報保護ガイドライン。条件profile：0〜2（0） | 図・文章／4択 |
| [旧午前問80 p.37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf#page=37) | generator-source-2018h30a-fe-am-80@3.7.0 | 請負と労働者派遣。条件profile：0〜2（0） | 図・文章／4択 |

### 2018年度 春期・午後

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午後問1 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=6) | generator-source-2018h30h-fe-pm-1@3.2.0 | 旧制度・午後：パスワードのハッシュ保存。衝突を誤認する条件：0〜3（0） | 文章・図／21択・5解答欄 |
| [旧午後問2 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=11) | generator-source-2018h30h-fe-pm-2@3.2.0 | 旧制度・午後：論理回路としきい値演算。目標演算と既知ゲートの組：0〜3（0）、重みとしきい値の組：0〜5（0） | 文章・図／15択・5解答欄 |
| [旧午後問3 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=14) | generator-source-2018h30h-fe-pm-3@3.2.0 | 旧制度・午後：子供会名簿の関係データベース。案内対象学年の条件：0〜1（0）、参加対象イベント：0〜1（0） | 文章・図・コード／16択・4解答欄 |
| [旧午後問4 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=18) | generator-source-2018h30h-fe-pm-4@3.2.0 | 旧制度・午後：クラウドの能力・アクセスと可用性。フロントの通信処理量条件：0〜3（0）、毎時投稿枚数条件：0〜3（0） | 文章・図・表／17択・5解答欄 |
| [旧午後問5 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=23) | generator-source-2018h30h-fe-pm-5@3.6.0 | 旧制度・午後：健康管理の情報参照と未受診者抽出。定期健康診断コースの判定条件：0〜1（0） | 文章・表・図／25択・5解答欄 |
| [旧午後問6 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=29) | generator-source-2018h30h-fe-pm-6@3.6.0 | 旧制度・午後：EVMによるプロジェクト管理。規模と工数の倍率：1〜2（1）、外部設計の進捗と費用の組：0〜7（0）、結合テスト後の傾向：0〜3（0） | 文章・図・表／28択・6解答欄 |
| [旧午後問7 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=35) | generator-source-2018h30h-fe-pm-7@3.6.0 | 旧制度・午後：収益と損益分岐点。variableCostRatioCase：0〜1（0）、profitMarginCase：0〜2（1）、quantityAndMoneyScale：1〜3（1）、highestSlopeCurve：0〜3（1） | 文章・図／34択・8解答欄 |
| [旧午後問8 p.38](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=38) | generator-source-2018h30h-fe-pm-8@3.6.0 | 旧制度・午後：ヒープによる昇順整列。内部の左右の子の配置：0〜1（0）、四つの葉の配置：0〜23（12） | 画像・文章・図・表／24択・5解答欄 |
| [旧午後問9 p.44](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=44) | generator-source-2018h30h-fe-pm-9@3.2.0 | 旧制度・午後：Cの簡易集計と実行時の問題。グラフ幅の選択番号：0〜2（0）、金額単位の選択番号：0〜2（0） | 文章・図・見出し・コード・表／15択・6解答欄 |
| [旧午後問10 p.50](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=50) | generator-source-2018h30h-fe-pm-10@3.2.0 | 注文と入金の情報の突合せ。classificationOption：0〜5（0）、overdueOption：0〜2（1） | 画像・文章・見出し・図・表・コード／22択・6解答欄 |
| [旧午後問11 p.56](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=56) | generator-source-2018h30h-fe-pm-11@3.2.0 | 旧制度・午後：Javaの表現式ライブラリ。左定数の選択番号：0〜3（1）、右定数の選択番号：0〜4（0）、等価判定定数の選択番号：0〜1（1） | 文章・図／31択・7解答欄 |
| [旧午後問12 p.63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=63) | generator-source-2018h30h-fe-pm-12@3.2.0 | 旧制度・午後：アセンブラによる数字列の変換と乗算。処理状態フラグの表現：0〜1（0）、数字列と空白の例：0〜5（0） | 画像・図・文章・コード／34択・6解答欄 |
| [旧午後問13 p.68](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf#page=68) | generator-source-2018h30h-fe-pm-13@3.2.0 | 旧制度・午後：表計算による会議室予約。会議室予約の条件と表示例：0〜3（0） | 画像・文章・図／42択・6解答欄 |

### 2018年度 春期・午前

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午前問1 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=3) | generator-source-2018h30h-fe-am-1@3.2.0 | 2の補数の下位ビットと剰余。最下位ビット数：2〜3（2）、奇数剰余の番号：0〜3（1） | 図・文章／4択 |
| [旧午前問2 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=3) | generator-source-2018h30h-fe-am-2@3.2.0 | 格子上で指定点を通る最短経路。格子と経由点の組：0〜7（0） | 図・文章／4択 |
| [旧午前問3 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=4) | generator-source-2018h30h-fe-am-3@3.7.0 | ディープラーニングとルールによる推論。ルール推論の条件：0〜2（0）、近似探索の条件：0〜1（0）、医療判断の条件：0〜1（0） | 図・文章／4択 |
| [旧午前問4 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=4) | generator-source-2018h30h-fe-am-4@3.2.0 | オートマトン。入力記号列：0〜5（0） | 図・文章／4択 |
| [旧午前問5 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=5) | generator-source-2018h30h-fe-am-5@3.2.0 | 空のスタックに対するPUSHとPOP。スタック操作の並び：0〜7（0） | 図・文章／4択 |
| [旧午前問6 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=5) | generator-source-2018h30h-fe-am-6@3.2.0 | 二つの配列で表すリストへの挿入。配列リストの接続：0〜3（0）、挿入直前の要素の順位：1〜4（3） | 図・文章／4択 |
| [旧午前問7 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=6) | generator-source-2018h30h-fe-am-7@3.7.0 | ハッシュ法の機能と衝突。選択肢アの条件：0〜2（0）、選択肢イの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=6) | generator-source-2018h30h-fe-am-8@3.2.0 | XML文書の各部分が記述する情報。問う部分・設計・構成：0〜3（3） | 図・文章／4択 |
| [旧午前問9 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=6) | generator-source-2018h30h-fe-am-9@3.2.0 | フェッチした命令の格納先。演算結果と状態の比較：0〜1（0）、データと変換情報の比較：0〜1（0）、命令位置とスタック位置の比較：0〜1（0） | 図・文章／4択 |
| [旧午前問10 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=7) | generator-source-2018h30h-fe-am-10@3.7.0 | 命令の実行に起因する内部割込み。命令実行の例外条件：0〜4（0） | 図・文章／4択 |
| [旧午前問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=7) | generator-source-2018h30h-fe-am-11@3.7.0 | キャッシュのミス・容量・書込み・局所性。キャッシュの各記述の条件：0〜4（0） | 図・文章／4択 |
| [旧午前問12 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=8) | generator-source-2018h30h-fe-am-12@3.2.0 | SDカードの容量規格と周辺機能。SD系のカード仕様の対象：0〜2（0） | 図・文章／4択 |
| [旧午前問13 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=8) | generator-source-2018h30h-fe-am-13@3.2.0 | 継続稼働・履歴・復旧・操作設計。問う部分・設計・構成：0〜3（0） | 図・文章／4択 |
| [旧午前問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=8) | generator-source-2018h30h-fe-am-14@3.2.0 | 待機系と処理・利用構成の識別。問う部分・設計・構成：0〜3（1） | 図・文章／4択 |
| [旧午前問15 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=9) | generator-source-2018h30h-fe-am-15@3.2.0 | システムの拡張とサーバ仮想化。対象となる方式・機能：0〜2（0） | 図・文章／4択 |
| [旧午前問16 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=10) | generator-source-2018h30h-fe-am-16@3.2.0 | 優先度とI/Oから求めるタスクのスケジュール。CPUとI/Oの処理時間の組：0〜7（0） | 図・文章・表／4択 |
| [旧午前問17 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=11) | generator-source-2018h30h-fe-am-17@3.7.0 | 絶対パス名。着目する条件・記述：0〜4（0） | 図・文章／4択 |
| [旧午前問18 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=11) | generator-source-2018h30h-fe-am-18@3.2.0 | 開発支援機能の主な目的。問う対象・条件：0〜3（0） | 図・文章／4択 |
| [旧午前問19 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=11) | generator-source-2018h30h-fe-am-19@3.2.0 | OSSの役割。問う対象・条件：0〜3（1） | 図・文章／4択 |
| [旧午前問20 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=11) | generator-source-2018h30h-fe-am-20@3.2.0 | 分散データ処理のOSS。問う対象・条件：0〜3（0） | 図・文章／4択 |
| [旧午前問21 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=12) | generator-source-2018h30h-fe-am-21@3.2.0 | 制御系の構成要素の役割。対象となる方式・機能：0〜3（2） | 図・文章／4択 |
| [旧午前問22 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=12) | generator-source-2018h30h-fe-am-22@3.2.0 | メモリの消去・保持・用途の違い。対象となる方式・機能：0〜3（3） | 図・文章／4択 |
| [旧午前問23 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=13) | generator-source-2018h30h-fe-am-23@3.2.0 | 真理値表に一致する3入力多数決回路。第2回路の合成ゲート：0〜1（0）、第3回路の中間ゲート：0〜1（0）、第4回路の合成構成：0〜1（0） | 図・文章／4択 |
| [旧午前問24 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=14) | generator-source-2018h30h-fe-am-24@3.2.0 | 入力チェック。検査する条件：0〜3（3） | 図・文章・表／4択 |
| [旧午前問25 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=14) | generator-source-2018h30h-fe-am-25@3.7.0 | 動画の圧縮符号化と配信制御。選択肢アの条件：0〜2（0）、選択肢イの条件：0〜1（0）、選択肢ウの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問26 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=14) | generator-source-2018h30h-fe-am-26@3.7.0 | 拡張現実と仮想体験の違い。選択肢アの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問27 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=15) | generator-source-2018h30h-fe-am-27@3.2.0 | DBMSが提供する保護・整合・排他機能。対象となる方式・機能：0〜3（1） | 図・文章／4択 |
| [旧午前問28 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=15) | generator-source-2018h30h-fe-am-28@3.7.0 | 埋込みSQLのカーソルと位置付け更新。名前空間と索引の比較：0〜2（0）、表と更新時処理の比較：0〜1（0）、仮想表と採番の比較：0〜1（0） | 図・文章・コード／4択 |
| [旧午前問29 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=15) | generator-source-2018h30h-fe-am-29@3.2.0 | 更新記録の保存と取消・再実行。更新履歴の利用条件：0〜2（0） | 図・文章／4択 |
| [旧午前問30 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=16) | generator-source-2018h30h-fe-am-30@3.2.0 | 行ロックと表ロックの競合・管理量。競合の比較方向：0〜1（0）、メモリの比較方向：0〜1（0） | 図・文章・表／4択 |
| [旧午前問31 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=16) | generator-source-2018h30h-fe-am-31@3.2.0 | 回線効率とバイトからビットへの換算。5Mバイト単位のデータ量：1〜4（2）、公称回線速度の組：0〜2（0）、回線伝送効率の組：0〜1（1） | 図・文章／4択 |
| [旧午前問32 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=17) | generator-source-2018h30h-fe-am-32@3.8.0 | サブネット内でPCに割り振れないIPv4アドレス。ホスト部のビット数：4〜6（4）、サブネットの番号：1〜2（1）、割り振れないアドレスの種類：0〜1（1） | 図・文章／4択 |
| [旧午前問33 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=17) | generator-source-2018h30h-fe-am-33@3.2.0 | ネットワーク調査のコマンド。調べたいネットワークの情報：0〜3（0） | 図・文章／4択 |
| [旧午前問34 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=17) | generator-source-2018h30h-fe-am-34@3.7.0 | 盲写宛先のヘッダと配送用情報。日時と送信者の比較：0〜2（0）、経路と識別子の比較：0〜1（0）、送信ソフトと件名の比較：0〜1（0） | 図・文章／4択 |
| [旧午前問35 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=17) | generator-source-2018h30h-fe-am-35@3.2.0 | Webと電子メールの仕組み。説明する機能の対象：0〜3（0） | 図・文章／4択 |
| [旧午前問36 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=18) | generator-source-2018h30h-fe-am-36@3.7.0 | 閲覧を契機とする感染と他の攻撃。選択肢アの条件：0〜2（0）、選択肢イの条件：0〜1（0）、選択肢ウの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問37 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=18) | generator-source-2018h30h-fe-am-37@3.7.0 | ポートスキャンと侵入の段階。選択肢アの条件：0〜2（0）、選択肢イの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問38 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=19) | generator-source-2018h30h-fe-am-38@3.7.0 | 暗号化に使った公開鍵と対応する秘密鍵。選択肢アの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問40 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=19) | generator-source-2018h30h-fe-am-40@3.7.0 | SPFの送信元ホスト検証。選択肢アの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問41 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=20) | generator-source-2018h30h-fe-am-41@3.2.0 | 攻撃への対策。問う対象：0〜3（0） | 図・文章／4択 |
| [旧午前問42 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=20) | generator-source-2018h30h-fe-am-42@3.7.0 | 企画・設計段階からのセキュリティ。選択肢アの条件：0〜2（0）、選択肢イの条件：0〜1（0）、選択肢ウの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問43 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=21) | generator-source-2018h30h-fe-am-43@3.2.0 | アプリケーションの必要機能と最小のアクセス権限。アプリケーションが必要とする操作：0〜3（0） | 図・文章／4択 |
| [旧午前問44 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=22) | generator-source-2018h30h-fe-am-44@3.2.0 | 静的フィルタの双方向TCPポート。標準サービスと比較対象の組：0〜3（0） | 図・文章・表／4択 |
| [旧午前問45 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=22) | generator-source-2018h30h-fe-am-45@3.7.0 | 生体認証の二つの誤り。照合しきい値で考慮する条件：0〜3（0） | 図・文章／4択 |
| [旧午前問46 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=23) | generator-source-2018h30h-fe-am-46@3.2.0 | オブジェクト指向の属性と振る舞い。説明するオブジェクト指向の性質：0〜3（0） | 図・文章／4択 |
| [旧午前問48 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=23) | generator-source-2018h30h-fe-am-48@3.2.0 | テストデータを選ぶ基準。テスト方法：0〜1（0） | 図・文章／4択 |
| [旧午前問49 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=24) | generator-source-2018h30h-fe-am-49@3.2.0 | 判定条件網羅から複数条件網羅への追加。比較しきい値から4を引いた値：0〜2（2）、Bの比較値：0〜2（0）、論理演算：0〜1（0） | 図・文章・箇条書き／4択 |
| [旧午前問50 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=24) | generator-source-2018h30h-fe-am-50@3.2.0 | XPの実践方法。実践方法の説明：0〜3（0） | 図・文章／4択 |
| [旧午前問51 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=25) | generator-source-2018h30h-fe-am-51@3.8.0 | 複数経路を持つ日程の2日短縮。6作業の日程条件：0〜8（0） | 図・文章／4択 |
| [旧午前問52 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=25) | generator-source-2018h30h-fe-am-52@3.2.0 | 工程工数による進捗加重平均。完成プログラムの五分率：1〜4（2）、プログラミング工数の百分率を5で割った値：4〜6（5） | 図・文章・表／4択 |
| [旧午前問53 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=25) | generator-source-2018h30h-fe-am-53@3.2.0 | 工数の三乗根による開発期間。三乗根の平方根：2〜4（4）、期間係数の2倍：4〜6（5） | 図・文章／4択 |
| [旧午前問54 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=26) | generator-source-2018h30h-fe-am-54@3.2.0 | ファンクションポイントの補正。外部入力の個数：1〜3（1）、外部出力の個数：2〜4（2）、内部論理ファイルの個数：1〜2（1）、補正係数の4倍：2〜3（3） | 図・文章・表／4択 |
| [旧午前問55 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=26) | generator-source-2018h30h-fe-am-55@3.7.0 | 問題管理の事前予防。選択肢イの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問56 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=27) | generator-source-2018h30h-fe-am-56@3.7.0 | 利用者の近くに置くサービスデスク。実施条件：0〜3（0） | 図・文章／4択 |
| [旧午前問57 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=27) | generator-source-2018h30h-fe-am-57@3.7.0 | ディスクデータのバックアップ。選択肢アの条件：0〜2（0）、選択肢イの条件：0〜1（0）、選択肢ウの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問58 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=28) | generator-source-2018h30h-fe-am-58@3.7.0 | 監査証拠に基づく改善指摘。選択肢アの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問59 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=28) | generator-source-2018h30h-fe-am-59@3.7.0 | システム監査人の独立性。実施条件：0〜3（0） | 図・文章／4択 |
| [旧午前問60 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=28) | generator-source-2018h30h-fe-am-60@3.2.0 | 情報セキュリティ監査。監査で確認する特性：0〜2（0） | 図・文章／4択 |
| [旧午前問61 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=29) | generator-source-2018h30h-fe-am-61@3.7.0 | パターン認識と機械学習による応対支援。実施条件：0〜3（0） | 図・文章／4択 |
| [旧午前問63 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=30) | generator-source-2018h30h-fe-am-63@3.2.0 | ビッグデータ活用の四つの発展段階。対象段階から1を引いた値：0〜3（3） | 図・文章／4択 |
| [旧午前問64 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=30) | generator-source-2018h30h-fe-am-64@3.2.0 | UMLで表す構造と振舞い。表したい内容：0〜3（0） | 図・文章／4択 |
| [旧午前問65 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=31) | generator-source-2018h30h-fe-am-65@3.2.0 | 環境への取組。問う条件：0〜3（3） | 図・文章／4択 |
| [旧午前問66 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=31) | generator-source-2018h30h-fe-am-66@3.7.0 | ニッチ戦略と市場の特定化。選択肢アの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問67 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=31) | generator-source-2018h30h-fe-am-67@3.2.0 | 規模の経済と範囲の経済。スケールメリットの有無：0〜1（0）、シナジー効果の有無：0〜1（1）、基本費用の100万円単位の加算：0〜2（0） | 図・文章・表／4択 |
| [旧午前問68 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=32) | generator-source-2018h30h-fe-am-68@3.2.0 | 製品ライフサイクルの特徴。問う対象・条件：0〜3（1） | 図・文章／4択 |
| [旧午前問69 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=32) | generator-source-2018h30h-fe-am-69@3.2.0 | 価格決定方式の説明。問う対象・条件：0〜3（2） | 図・文章／4択 |
| [旧午前問70 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=32) | generator-source-2018h30h-fe-am-70@3.2.0 | 知識・組織・競争力を活用する経営。問う対象・条件：0〜3（0） | 図・文章／4択 |
| [旧午前問71 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=33) | generator-source-2018h30h-fe-am-71@3.7.0 | IoTの実用例に当たらないもの。選択肢イの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問72 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=33) | generator-source-2018h30h-fe-am-72@3.7.0 | 顧客ID付きPOSデータで確認できる情報。選択肢アの条件：0〜2（0）、選択肢イの条件：0〜1（0）、選択肢ウの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問73 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=33) | generator-source-2018h30h-fe-am-73@3.7.0 | セル生産方式の利点が生きる条件。選択肢アの条件：0〜2（0）、選択肢イの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問74 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=34) | generator-source-2018h30h-fe-am-74@3.2.0 | 電子商取引。問う対象：0〜3（1） | 図・文章／4択 |
| [旧午前問75 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=34) | generator-source-2018h30h-fe-am-75@3.2.0 | 市場調査・分析手法の説明。問う対象・条件：0〜3（2） | 図・文章／4択 |
| [旧午前問76 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=34) | generator-source-2018h30h-fe-am-76@3.7.0 | 抜取検査の合格確率を表す曲線。選択肢イの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問77 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=35) | generator-source-2018h30h-fe-am-77@3.7.0 | 貸借対照表の純資産。選択肢アの条件：0〜2（0）、選択肢ウの条件：0〜1（0）、選択肢エの条件：0〜1（0） | 図・文章／4択 |
| [旧午前問78 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=35) | generator-source-2018h30h-fe-am-78@3.2.0 | 先入先出法の月末在庫評価。全数量の倍率：1〜3（1）、全単価の10円単位の加算：0〜2（0） | 図・文章・表／4択 |
| [旧午前問79 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=35) | generator-source-2018h30h-fe-am-79@3.2.0 | 委託したプログラムの著作権の原始的帰属。委託元が担当する補助的作業：0〜3（0） | 図・文章／4択 |
| [旧午前問80 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_am_qs.pdf#page=36) | generator-source-2018h30h-fe-am-80@3.2.0 | 労働者派遣の三者間の関係。太線で示す関係：0〜2（2） | 図・文章／4択 |

### 2017年度 秋期・午後

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午後問1 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=6) | generator-source-2017h29a-fe-pm-1@3.2.0 | 旧制度・午後：SSHによる通信。誤答が表す通信上の誤解：0〜2（0） | 文章・図／18択・5解答欄 |
| [旧午後問2 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=9) | generator-source-2017h29a-fe-pm-2@3.2.0 | 旧制度・午後：プロセスの排他制御。共有値・セマフォの状態表現・二資源確保順：0〜3（0） | 文章・図／17択・4解答欄 |
| [旧午後問3 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=13) | generator-source-2017h29a-fe-pm-3@3.2.0 | 旧制度・午後：会員販売データ管理。対象年・購入回数と購入金額の条件：0〜2（0） | 文章・図・コード・表／18択・4解答欄 |
| [旧午後問4 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=18) | generator-source-2017h29a-fe-pm-4@3.2.0 | 旧制度・午後：コールセンタの構成とオペレータ数。到着件数・通話/記録時間とM/M/s条件：0〜3（0） | 文章・図・表／20択・4解答欄 |
| [旧午後問5 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=23) | generator-source-2017h29a-fe-pm-5@3.2.0 | 旧制度・午後：買上げ・入金の月次消込み処理。同役割の誤答候補の組合せ：0〜3（0） | 文章・画像・図／27択・6解答欄 |
| [旧午後問6 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=28) | generator-source-2017h29a-fe-pm-6@3.2.0 | 旧制度・午後：運用サービスの予算策定と提示価格。同じ費目/年度に対応する経済規模：0〜3（0） | 図・文章／36択・7解答欄 |
| [旧午後問7 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=33) | generator-source-2017h29a-fe-pm-7@3.2.0 | 旧制度・午後：購買管理システムの業務改善効果。同役割の時間当たり人件費：0〜3（0） | 図・文章・表／21択・6解答欄 |
| [旧午後問8 p.38](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=38) | generator-source-2017h29a-fe-pm-8@3.2.0 | 旧制度・午後：検査文字の生成と文字列・表の検証。原と同じ役割の5文字×4行入力：0〜3（0） | 画像・図・文章・表／28択・6解答欄 |
| [旧午後問9 p.46](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=46) | generator-source-2017h29a-fe-pm-9@3.2.0 | 旧制度・午後：Cによる回文の探索と表示。設問3の入力文字列条件：0〜3（0） | 文章・図・コード／37択・7解答欄 |
| [旧午後問10 p.53](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=53) | generator-source-2017h29a-fe-pm-10@3.2.0 | 旧制度・午後：COBOLによる駐車料金の算出。昼間/夜間の同桁課金単価：0〜5（0） | 文章・図・コード／25択・7解答欄 |
| [旧午後問11 p.58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=58) | generator-source-2017h29a-fe-pm-11@3.2.0 | 旧制度・午後：Javaによる表の行の並べ替え。五つの行の数値条件：0〜7（0） | 画像・文章・図・コード／30択・7解答欄 |
| [旧午後問12 p.64](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=64) | generator-source-2017h29a-fe-pm-12@3.2.0 | 旧制度・午後：アセンブラによる部分ビット列の検索と置換。2語のビット列と同長の検索/置換列：0〜7（0） | 文章・画像・図・コード／33択・6解答欄 |
| [旧午後問13 p.68](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf#page=68) | generator-source-2017h29a-fe-pm-13@3.2.0 | 旧制度・午後：表計算によるアクセスログ分析。四週間のログ条件・集計・同役割の誤式：0〜3（0） | 文章・画像・図・コード／35択・6解答欄 |

### 2017年度 秋期・午前

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午前問1 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=3) | generator-source-2017h29a-fe-am-1@3.2.0 | 2進レジスタのシフトと乗算。求める倍率：0〜3（0） | 図・文章／4択 |
| [旧午前問2 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=3) | generator-source-2017h29a-fe-am-2@3.2.0 | 誤り検査の送受信機構。検査情報を作る単位と判定：0〜2（0） | 図・文章／4択 |
| [旧午前問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=3) | generator-source-2017h29a-fe-am-3@3.7.0 | 出力比較によるフィードバック制御。説明の実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問4 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=4) | generator-source-2017h29a-fe-am-4@3.2.0 | 反射型センサと左右モータの制御。黒色比率に対する出力特性：0〜1（0） | 図・文章／4択 |
| [旧午前問5 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=5) | generator-source-2017h29a-fe-am-5@3.2.0 | 一つのスタックで可能な出力列。データの到着順：0〜3（0） | 図・文章／4択 |
| [旧午前問6 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=5) | generator-source-2017h29a-fe-am-6@3.7.0 | 関数の再帰呼出し。説明の実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問7 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=5) | generator-source-2017h29a-fe-am-7@3.7.0 | 多相性とメソッドのオーバライド。説明の実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=6) | generator-source-2017h29a-fe-am-8@3.7.0 | Perlの実行と処理系。Web用途とデバッグの実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問9 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=6) | generator-source-2017h29a-fe-am-9@3.2.0 | 平均命令時間からMIPS。平均命令時間の種類：0〜3（0） | 図・文章／4択 |
| [旧午前問10 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=6) | generator-source-2017h29a-fe-am-10@3.7.0 | 外部割込みの発生原因。通知源と命令実行の条件：0〜3（0） | 図・文章／4択 |
| [旧午前問11 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=6) | generator-source-2017h29a-fe-am-11@3.2.0 | USBプラグ側コネクタの断面。出題対象：0〜1（0） | 図・文章／4択 |
| [旧午前問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=7) | generator-source-2017h29a-fe-am-12@3.7.0 | RAID5の記録方式。説明・条件：0〜3（0） | 図・文章／4択 |
| [旧午前問13 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=7) | generator-source-2017h29a-fe-am-13@3.7.0 | デュアルシステム。説明・条件：0〜3（0） | 図・文章／4択 |
| [旧午前問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=8) | generator-source-2017h29a-fe-am-14@3.7.0 | 社内業務システムのクラウド移行。説明・条件：0〜3（0） | 図・文章／4択 |
| [旧午前問15 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=8) | generator-source-2017h29a-fe-am-15@3.2.0 | 二つの装置を直列接続した稼働率。1台の稼働率の10%単位：7〜9（9）、時間の倍率：5〜10（5） | 図・文章／4択 |
| [旧午前問16 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=8) | generator-source-2017h29a-fe-am-16@3.7.0 | メモリリーク。説明・条件：0〜3（0） | 図・文章／4択 |
| [旧午前問17 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=9) | generator-source-2017h29a-fe-am-17@3.7.0 | ポーリング制御。説明・条件：0〜3（0） | 図・文章／4択 |
| [旧午前問18 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=9) | generator-source-2017h29a-fe-am-18@3.2.0 | 優先度プリエンプティブスケジューリング。説明・条件：0〜1（0） | 図・文章／4択 |
| [旧午前問19 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=10) | generator-source-2017h29a-fe-am-19@3.2.0 | セグメントの動的再配置時間。説明・条件：0〜2（0） | 図・文章／4択 |
| [旧午前問20 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=10) | generator-source-2017h29a-fe-am-20@3.7.0 | ページフォールトの増加要因。説明・条件：0〜2（0） | 図・文章／4択 |
| [旧午前問21 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=10) | generator-source-2017h29a-fe-am-21@3.2.0 | 電荷とフリップフロップの記憶。対象・実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問22 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=11) | generator-source-2017h29a-fe-am-22@3.7.0 | アクチュエータの機能。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問23 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=11) | generator-source-2017h29a-fe-am-23@3.2.0 | ゲート回路に等価な論理式。対象・実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問24 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=12) | generator-source-2017h29a-fe-am-24@3.2.0 | 重み付き和によるチェックディジット。第1桁：2〜8（7）、第2桁：1〜7（3）、第3桁：1〜9（9）、第4桁：2〜9（4） | 図・文章・箇条書き／4択 |
| [旧午前問25 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=12) | generator-source-2017h29a-fe-am-25@3.2.0 | 隠線・隠面と陰影・クリッピング。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問26 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=12) | generator-source-2017h29a-fe-am-26@3.7.0 | ストアドプロシージャと通信負荷。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問27 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=13) | generator-source-2017h29a-fe-am-27@3.2.0 | SQLの制約指定。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問28 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=13) | generator-source-2017h29a-fe-am-28@3.2.0 | UMLデータモデルの汎化と多重度。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問29 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=13) | generator-source-2017h29a-fe-am-29@3.7.0 | トランザクションの性質。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問30 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=14) | generator-source-2017h29a-fe-am-30@3.7.0 | トランザクションのUNDO。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問31 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=14) | generator-source-2017h29a-fe-am-31@3.2.0 | 同時ダウンロードと再生。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問32 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=14) | generator-source-2017h29a-fe-am-32@3.7.0 | MACアドレスによるL2転送。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問33 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=15) | generator-source-2017h29a-fe-am-33@3.7.0 | IPv4のNAT。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問34 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=15) | generator-source-2017h29a-fe-am-34@3.2.0 | トランスポートの配送性質。対象・実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問35 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=15) | generator-source-2017h29a-fe-am-35@3.8.0 | IPv4アドレスのネットワークアドレス。ホスト部のビット数：3〜6（4）、サブネットの番号：1〜2（1）、ホスト部の値：3〜5（3） | 図・文章／4択 |
| [旧午前問36 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=16) | generator-source-2017h29a-fe-am-36@3.7.0 | ボットネットのC&C。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問37 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=16) | generator-source-2017h29a-fe-am-37@3.7.0 | DNSキャッシュポイズニング。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問38 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=16) | generator-source-2017h29a-fe-am-38@3.7.0 | 素因数分解と公開鍵暗号。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問39 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=17) | generator-source-2017h29a-fe-am-39@3.7.0 | SQLインジェクション。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問40 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=17) | generator-source-2017h29a-fe-am-40@3.7.0 | ディジタル署名と署名鍵。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問41 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=18) | generator-source-2017h29a-fe-am-41@3.7.0 | ワームの自己増殖。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問42 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=18) | generator-source-2017h29a-fe-am-42@3.7.0 | CSIRTの役割。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問43 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=18) | generator-source-2017h29a-fe-am-43@3.7.0 | リスクアセスメント。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問44 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=19) | generator-source-2017h29a-fe-am-44@3.7.0 | 通信路の盗聴対策。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問45 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=19) | generator-source-2017h29a-fe-am-45@3.2.0 | テストの目的と手法。対象・実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問46 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=20) | generator-source-2017h29a-fe-am-46@3.2.0 | UML2.0の図の目的。対象・実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問47 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=20) | generator-source-2017h29a-fe-am-47@3.2.0 | オブジェクト指向の関係の例。関係の対象：0〜1（0） | 図・文章／4択 |
| [旧午前問48 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=20) | generator-source-2017h29a-fe-am-48@3.7.0 | モジュール結合度。着目する条件・記述：0〜3（0） | 図・文章／4択 |
| [旧午前問49 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=20) | generator-source-2017h29a-fe-am-49@3.7.0 | ブラックボックステストと内部構造。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問50 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=21) | generator-source-2017h29a-fe-am-50@3.2.0 | ソフトウェアの解析と再構成。対象・実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問51 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=21) | generator-source-2017h29a-fe-am-51@3.2.0 | 開発規模の見積り手法。対象・実条件：0〜1（0） | 図・文章／4択 |
| [旧午前問52 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=22) | generator-source-2017h29a-fe-am-52@3.2.0 | 画面の作成・レビュー・管理の総工数。小単純と中普通の画面数調整の10画面単位：-1〜1（0）、管理工数率の20%単位：1〜3（1） | 図・文章・箇条書き・表／4択 |
| [旧午前問53 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=22) | generator-source-2017h29a-fe-am-53@3.8.0 | プロジェクト活動のクリティカルパス。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問54 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=23) | generator-source-2017h29a-fe-am-54@3.2.0 | 品質分析の図の使い分け。対象・実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問56 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=23) | generator-source-2017h29a-fe-am-56@3.7.0 | バックアップと復旧の条件。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問57 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=24) | generator-source-2017h29a-fe-am-57@3.7.0 | 雷サージと電源設備の対策。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問58 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=24) | generator-source-2017h29a-fe-am-58@3.7.0 | 運用記録と日次計画の監査。記録確認の不備：0〜2（0）、記録保管の不備：0〜1（0）、例外記録の不備：0〜1（0）、計画自己承認：0〜1（1） | 図・文章／4択 |
| [旧午前問59 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=24) | generator-source-2017h29a-fe-am-59@3.7.0 | ヒアリングと監査証拠。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問60 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=25) | generator-source-2017h29a-fe-am-60@3.7.0 | 監査調書の目的と管理。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問61 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=25) | generator-source-2017h29a-fe-am-61@3.2.0 | 営業活動の時間配分。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問62 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=26) | generator-source-2017h29a-fe-am-62@3.2.0 | 業務とIT基盤の手法。対象・実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問63 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=26) | generator-source-2017h29a-fe-am-63@3.7.0 | ビッグデータの分析活用。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問64 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=26) | generator-source-2017h29a-fe-am-64@3.7.0 | グリーン調達と環境表示。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問65 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=27) | generator-source-2017h29a-fe-am-65@3.2.0 | BI・BPR・BPM・EAIの説明。出題対象：0〜3（0） | 図・文章／4択 |
| [旧午前問66 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=27) | generator-source-2017h29a-fe-am-66@3.2.0 | 試作の開発方法別コスト比較。購入費の400万円刻みの種類：0〜2（1）、委託費の300万円刻みの種類：0〜2（1）、作成工賃の20万円刻みの種類：0〜2（1）、改造・評価工賃の20万円刻みの種類：0〜2（1） | 図・文章／4択 |
| [旧午前問67 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=28) | generator-source-2017h29a-fe-am-67@3.2.0 | SWOTの内外と有利不利。対象・実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問68 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=28) | generator-source-2017h29a-fe-am-68@3.2.0 | 競争上の地位と戦略。対象・実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問69 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=28) | generator-source-2017h29a-fe-am-69@3.2.0 | 管理対象と業務連鎖。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問70 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=29) | generator-source-2017h29a-fe-am-70@3.7.0 | コア技術と互換性。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問71 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=29) | generator-source-2017h29a-fe-am-71@3.2.0 | IoTの基本要素。対象・実条件：0〜3（0） | 図・文章・表／4択 |
| [旧午前問72 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=29) | generator-source-2017h29a-fe-am-72@3.7.0 | 資材所要量計画。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問73 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=30) | generator-source-2017h29a-fe-am-73@3.7.0 | HEMSと個別機器。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問74 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=30) | generator-source-2017h29a-fe-am-74@3.7.0 | 深層学習の車載活用。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問75 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=31) | generator-source-2017h29a-fe-am-75@3.7.0 | CIOの主な責務。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問76 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=31) | generator-source-2017h29a-fe-am-76@3.7.0 | OJTの実施条件。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問77 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=31) | generator-source-2017h29a-fe-am-77@3.2.0 | 財務諸表の対象。対象・実条件：0〜3（0） | 図・文章／4択 |
| [旧午前問78 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=32) | generator-source-2017h29a-fe-am-78@3.2.0 | 先入先出法の期末在庫評価。在庫・仕入個数の倍率：1〜3（1）、全単価への千円加算：0〜2（0） | 図・文章・表／4択 |
| [旧午前問79 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=32) | generator-source-2017h29a-fe-am-79@3.7.0 | 契約と雇用・指揮命令。対象・実条件：0〜2（0） | 図・文章／4択 |
| [旧午前問80 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_am_qs.pdf#page=33) | generator-source-2017h29a-fe-am-80@3.2.0 | 消費者取引と法制度。対象・実条件：0〜1（0） | 図・文章／4択 |

### 2017年度 春期・午後

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午後問1 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=5) | generator-source-2017h29h-fe-pm-1@3.2.0 | 旧制度・午後：ファイルの安全な受渡し。参加人数・期間・機密度の条件：0〜3（0） | 文章・箇条書き・表／19択・5解答欄 |
| [旧午後問2 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=9) | generator-source-2017h29h-fe-pm-2@3.2.0 | 旧制度・午後：温度モニタ。図2の表示条件：0〜2（0） | 図・文章・表／24択・5解答欄 |
| [旧午後問3 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=13) | generator-source-2017h29h-fe-pm-3@3.2.0 | 旧制度・午後：住民問合せデータベースの制約。登録状態の運用条件：0〜3（0） | 文章・図・表・コード／21択・5解答欄 |
| [旧午後問4 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=17) | generator-source-2017h29h-fe-pm-4@3.2.0 | 旧制度・午後：無線LANにおけるデータの送信。W1の平均待機時間の条件：0〜3（0） | 文章・箇条書き・図・表／19択・4解答欄 |
| [旧午後問5 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=21) | generator-source-2017h29h-fe-pm-5@3.2.0 | 購買システムの注文書出力とテスト。ページ容量と購買グループ件数の組合せ：0〜3（0） | 文章・箇条書き・図／18択・5解答欄 |
| [旧午後問6 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=27) | generator-source-2017h29h-fe-pm-6@3.2.0 | プロジェクトの要員計画。外部設計工数の組合せ：0〜3（0）、追加要件後の二期プログラム月別人数の組合せ：0〜3（0） | 図・文章／20択・6解答欄 |
| [旧午後問7 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=31) | generator-source-2017h29h-fe-pm-7@3.2.0 | 在庫補充方法の変更。商品Q・Rの商品群条件：0〜2（0）、百箱単位の数量倍率：0〜1（0） | 図・文章／34択・8解答欄 |
| [旧午後問8 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=35) | generator-source-2017h29h-fe-pm-8@3.2.0 | 旧制度・午後：最短経路の探索。辺の距離の条件：0〜7（0） | 文章・図・表・コード／34択・7解答欄 |
| [旧午後問9 p.41](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=41) | generator-source-2017h29h-fe-pm-9@3.2.0 | 旧制度・午後：Cによるマークシート答案の採点。ビット配置と順不同解答の条件：0〜7（0） | 文章・図・表・コード／25択・7解答欄 |
| [旧午後問10 p.47](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=47) | generator-source-2017h29h-fe-pm-10@3.2.0 | 旧制度・午後：COBOLによる月別・四半期別売上集計。事業年度の開始月（4・5・6月）：0〜2（0） | 文章・図・コード／25択・7解答欄 |
| [旧午後問11 p.52](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=52) | generator-source-2017h29h-fe-pm-11@3.2.0 | 旧制度・午後：Javaによる段階料金と割引プラン。料金表・電力量の条件：0〜2（0） | 文章・図・コード／35択・7解答欄 |
| [旧午後問12 p.58](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=58) | generator-source-2017h29h-fe-pm-12@3.2.0 | 旧制度・午後：CASL IIの多倍長加算と乗算。加算する4語の数値条件：0〜7（0） | 文章・画像・図・コード／22択・6解答欄 |
| [旧午後問13 p.63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_qs.pdf#page=63) | generator-source-2017h29h-fe-pm-13@3.2.0 | 旧制度・午後：表計算による送料検索と梱包計画。商品重量・箱重量・発送数量・発送先の条件：0〜7（0） | 文章・画像・図・コード／26択・6解答欄 |

### 2017年度 春期・午前

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午前問1 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=3) | generator-source-2017h29h-fe-am-1@3.7.0 | 集合の等式の恒等性。等式1の演算条件：0〜2（0）、等式2の演算条件：0〜1（0）、等式3の演算条件：0〜1（0）、等式4の演算条件：0〜1（1） | 文章／4択 |
| [旧午前問2 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=3) | generator-source-2017h29h-fe-am-2@3.2.0 | 浮動小数点表示の操作。操作の種類：0〜3（0） | 文章／4択 |
| [旧午前問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=3) | generator-source-2017h29h-fe-am-3@3.2.0 | NANDだけによる論理式。表したい論理式：0〜3（1） | 文章／4択 |
| [旧午前問4 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=4) | generator-source-2017h29h-fe-am-4@3.7.0 | 配列を用いたリストの特徴。誤答のリスト操作条件：0〜3（0） | 文章／4択 |
| [旧午前問5 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=5) | generator-source-2017h29h-fe-am-5@3.2.0 | シフトと加算による二進数乗算。乗数と被乗数のビット幅：0〜2（2）、走査方向と初期配置：0〜1（0） | 文章・図・表／4択 |
| [旧午前問6 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=6) | generator-source-2017h29h-fe-am-6@3.2.0 | 剰余による再帰関数。共通因数：10〜35（31） | 文章・コード／4択 |
| [旧午前問7 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=6) | generator-source-2017h29h-fe-am-7@3.7.0 | 二分探索に適した配置。誤答の配置機構：0〜3（0） | 文章／4択 |
| [旧午前問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=6) | generator-source-2017h29h-fe-am-8@3.2.0 | 命令出現率によるMIPS。命令構成：0〜1（0）、動作クロックの倍率：1〜3（2） | 文章・表／4択 |
| [旧午前問9 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=7) | generator-source-2017h29h-fe-am-9@3.7.0 | ライトバックの目的。誤答の同期・管理条件：0〜3（0） | 文章／4択 |
| [旧午前問10 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=7) | generator-source-2017h29h-fe-am-10@3.2.0 | インタフェース規格の特徴。問うインタフェース：0〜3（3） | 文章／4択 |
| [旧午前問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=7) | generator-source-2017h29h-fe-am-11@3.2.0 | RAID1の必要ディスク台数。格納データのTバイト数：3〜12（4）、1台のTバイト数：1〜3（1） | 文章／4択 |
| [旧午前問12 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=8) | generator-source-2017h29h-fe-am-12@3.7.0 | スケールアウトの適性。分散可能な処理の条件：0〜4（1） | 文章／4択 |
| [旧午前問13 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=8) | generator-source-2017h29h-fe-am-13@3.2.0 | 性能評価方法の説明。性能評価の方式：0〜3（1） | 文章／4択 |
| [旧午前問14 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=9) | generator-source-2017h29h-fe-am-14@3.2.0 | 4装置の直列・並列と稼働率。4装置の接続条件：0〜2（0） | 文章・図／4択 |
| [旧午前問15 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=9) | generator-source-2017h29h-fe-am-15@3.2.0 | 記憶・配置方式の説明。記憶・配置の方式：0〜3（0） | 文章／4択 |
| [旧午前問16 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=10) | generator-source-2017h29h-fe-am-16@3.2.0 | ジョブ実行と逐次印刷の完了時間。実行と印刷時間の配分：0〜2（0）、時間の5秒単位：1〜3（2） | 文章・箇条書き・表／4択 |
| [旧午前問17 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=10) | generator-source-2017h29h-fe-am-17@3.2.0 | バッファサイズ。連続送信時間のT倍：1〜3（1） | 文章・図／4択 |
| [旧午前問18 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=11) | generator-source-2017h29h-fe-am-18@3.2.0 | 相対・絶対ディレクトリの移動。移動後の絶対ディレクトリ：0〜3（0） | 文章・箇条書き・図／4択 |
| [旧午前問19 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=12) | generator-source-2017h29h-fe-am-19@3.2.0 | FIFOとLRUのページ置換回数。ページ参照列の条件：0〜3（1） | 文章・図／4択 |
| [旧午前問20 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=12) | generator-source-2017h29h-fe-am-20@3.2.0 | D/A変換器の最下位ビットの電圧。分解能のビット数：7〜10（8）、基準電圧の0.5V単位：1〜6（5） | 文章／4択 |
| [旧午前問21 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=12) | generator-source-2017h29h-fe-am-21@3.2.0 | 監視する物理量とセンサ。感知する物理量：0〜3（2） | 文章／4択 |
| [旧午前問22 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=13) | generator-source-2017h29h-fe-am-22@3.2.0 | 半加算器の素子の組合せ。誤答の素子組1：0〜1（0）、誤答の素子組2：0〜1（0）、誤答の素子組3：0〜1（0） | 文章・図・表／4択 |
| [旧午前問23 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=13) | generator-source-2017h29h-fe-am-23@3.8.0 | 顧客コードの必要桁数。現在顧客数の1000人単位：4〜12（8）、年間増加率の10%単位：1〜2（2）、予測年数：2〜3（3） | 文章／4択 |
| [旧午前問24 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=13) | generator-source-2017h29h-fe-am-24@3.2.0 | PCMのディジタル化処理。ディジタル化の処理：0〜2（0） | 文章／4択 |
| [旧午前問25 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=14) | generator-source-2017h29h-fe-am-25@3.2.0 | 関数従属性と三つのテーブル。関数従属の接続構造：0〜2（0） | 文章・図／4択 |
| [旧午前問26 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=15) | generator-source-2017h29h-fe-am-26@3.2.0 | UMLデータモデルと会計取引の記録。空欄で記録する勘定：0〜1（0） | 文章・図・表／4択 |
| [旧午前問27 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=16) | generator-source-2017h29h-fe-am-27@3.7.0 | ソートマージ結合の機構。誤答の結合機構：0〜3（0） | 文章／4択 |
| [旧午前問28 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=16) | generator-source-2017h29h-fe-am-28@3.2.0 | 分散トランザクションの処理。処理の条件：0〜3（0） | 文章／4択 |
| [旧午前問29 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=16) | generator-source-2017h29h-fe-am-29@3.2.0 | データから知識を発見するプロセス。分析の対象条件：0〜2（0） | 文章／4択 |
| [旧午前問30 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=17) | generator-source-2017h29h-fe-am-30@3.2.0 | 伝票データ転送の回線利用率。毎時件数の10000件単位：8〜12（10）、1回にまとめる件数：2〜4（2）、回線速度のMビット毎秒：1〜2（1） | 文章／4択 |
| [旧午前問31 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=17) | generator-source-2017h29h-fe-am-31@3.2.0 | OSI層と接続機器の機能。層と中継機能：0〜3（0） | 文章／4択 |
| [旧午前問32 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=17) | generator-source-2017h29h-fe-am-32@3.2.0 | 宅内LANの装置Aに必要な機能。装置Aに求める通信機能：0〜3（0） | 文章・図／4択 |
| [旧午前問33 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=18) | generator-source-2017h29h-fe-am-33@3.7.0 | IPルータが経路決定に用いる情報。誤答のヘッダ情報1：0〜2（0）、誤答のヘッダ情報2：0〜1（0）、誤答のヘッダ情報3：0〜1（0） | 文章／4択 |
| [旧午前問34 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=18) | generator-source-2017h29h-fe-am-34@3.8.0 | IPv4アドレスのクラス。第1オクテットの条件：0〜7（2） | 文章／4択 |
| [旧午前問35 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=18) | generator-source-2017h29h-fe-am-35@3.2.0 | OpenFlowによるSDNの説明。機能・条件：0〜2（0） | 文章／4択 |
| [旧午前問36 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=19) | generator-source-2017h29h-fe-am-36@3.2.0 | DNSキャッシュの偽情報の影響範囲。標的Webサーバの所属：0〜1（0）、偽情報を記憶したDNSの所属：0〜1（1） | 文章／4択 |
| [旧午前問37 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=19) | generator-source-2017h29h-fe-am-37@3.2.0 | Web攻撃の説明。問う攻撃：0〜3（1） | 文章／4択 |
| [旧午前問38 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=20) | generator-source-2017h29h-fe-am-38@3.2.0 | 共通鍵暗号の鍵探索方法。鍵探索の方式：0〜3（0） | 文章／4択 |
| [旧午前問39 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=20) | generator-source-2017h29h-fe-am-39@3.7.0 | 旧版ガイドラインのサプライチェーン対策。対象1の事業上の関係：0〜2（0）、対象2の事業上の関係：0〜1（0）、対象3の事業上の関係：0〜1（1）、対象4の事業上の関係：0〜1（0） | 文章／4択 |
| [旧午前問40 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=20) | generator-source-2017h29h-fe-am-40@3.2.0 | 暗号アルゴリズムの分類。問うアルゴリズムの種類：0〜3（0） | 文章／4択 |
| [旧午前問41 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=21) | generator-source-2017h29h-fe-am-41@3.7.0 | タイムスタンプサービスの説明。誤答の時刻又は認証機能0：0〜2（0）、誤答の時刻又は認証機能1：0〜1（0）、誤答の時刻又は認証機能3：0〜1（0） | 文章／4択 |
| [旧午前問42 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=22) | generator-source-2017h29h-fe-am-42@3.2.0 | 往復通信のパケットフィルタリング。通信ポートとPC割当て条件：0〜2（0） | 文章・表／4択 |
| [旧午前問43 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=23) | generator-source-2017h29h-fe-am-43@3.7.0 | DMZと内部セグメントへのサーバ配置。サーバの配置条件：0〜3（0） | 文章／4択 |
| [旧午前問44 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=23) | generator-source-2017h29h-fe-am-44@3.2.0 | 電子メールの認証と保護。問う条件：0〜3（3） | 文章／4択 |
| [旧午前問45 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=23) | generator-source-2017h29h-fe-am-45@3.2.0 | Webサーバ検査で使う手段の利用目的。検査手段：0〜1（0） | 文章／4択 |
| [旧午前問46 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=24) | generator-source-2017h29h-fe-am-46@3.7.0 | 外部設計完了時に顧客が承認する成果物。外部設計の成果物：0〜3（0） | 文章／4択 |
| [旧午前問47 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=24) | generator-source-2017h29h-fe-am-47@3.7.0 | インスペクションの運営条件。誤答のレビュー運営条件：0〜3（0） | 文章／4択 |
| [旧午前問48 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=24) | generator-source-2017h29h-fe-am-48@3.7.0 | オブジェクト指向の基本概念の組合せ。誤答の概念群1：0〜2（0）、誤答の概念群2：0〜1（0）、誤答の概念群3：0〜1（0） | 文章／4択 |
| [旧午前問49 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=25) | generator-source-2017h29h-fe-am-49@3.8.0 | 流れ図の網羅基準と最少テストケース数。網羅基準：0〜1（0） | 文章・図／4択 |
| [旧午前問50 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=25) | generator-source-2017h29h-fe-am-50@3.2.0 | ソフトウェア開発の活動。問う開発活動：0〜3（1） | 文章／4択 |
| [旧午前問51 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=26) | generator-source-2017h29h-fe-am-51@3.2.0 | アローダイアグラムの最短完了日数。査読済み所要日数の条件：0〜3（0） | 文章・図／4択 |
| [旧午前問52 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=26) | generator-source-2017h29h-fe-am-52@3.2.0 | 見積方法。問う対象：0〜3（2） | 文章／4択 |
| [旧午前問53 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=27) | generator-source-2017h29h-fe-am-53@3.7.0 | テスト消化件数と累積バグ件数の安定傾向。曲線の形状条件：0〜3（0） | 文章・図／4択 |
| [旧午前問54 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=27) | generator-source-2017h29h-fe-am-54@3.2.0 | 進捗管理などに用いる図法。問う図法：0〜3（2） | 文章／4択 |
| [旧午前問56 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=28) | generator-source-2017h29h-fe-am-56@3.7.0 | 開発と運用の連携。情報共有の時期：0〜2（0）、運用テストへの開発支援：0〜1（0）、運用要件への参加：0〜1（1）、運用テストと引渡しの共同確認：0〜1（0） | 文章／4択 |
| [旧午前問57 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=29) | generator-source-2017h29h-fe-am-57@3.2.0 | ITサービスマネジメントの活動。問う管理活動：0〜3（3） | 文章／4択 |
| [旧午前問58 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=29) | generator-source-2017h29h-fe-am-58@3.7.0 | 監査報告書原案の意見交換。取組1の実条件：0〜2（0）、取組2の実条件：0〜1（0）、取組3の実条件：0〜1（1）、取組4の実条件：0〜1（0） | 文章／4択 |
| [旧午前問59 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=29) | generator-source-2017h29h-fe-am-59@3.2.0 | ドキュメントに対するコントロール。文書リスクの条件：0〜3（0） | 文章／4択 |
| [旧午前問60 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=30) | generator-source-2017h29h-fe-am-60@3.7.0 | システム監査の実施体制。取組1の実条件：0〜2（1）、取組2の実条件：0〜1（0）、取組3の実条件：0〜1（0）、取組4の実条件：0〜1（0） | 文章／4択 |
| [旧午前問61 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=30) | generator-source-2017h29h-fe-am-61@3.2.0 | 経営と情報システムの分析手法。手法を使う条件：0〜3（0） | 文章／4択 |
| [旧午前問62 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=30) | generator-source-2017h29h-fe-am-62@3.2.0 | アウトソーシングのリスク対策。委託リスクの条件：0〜3（0） | 文章／4択 |
| [旧午前問63 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=31) | generator-source-2017h29h-fe-am-63@3.7.0 | ホスティングサービスの特徴。運用と提供形態の実条件：0〜3（0） | 文章／4択 |
| [旧午前問64 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=31) | generator-source-2017h29h-fe-am-64@3.7.0 | BYODの所有区分と管理条件。所有者と業務用途の実条件：0〜3（0） | 文章／4択 |
| [旧午前問65 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=31) | generator-source-2017h29h-fe-am-65@3.7.0 | 非機能要件の定義で行う作業。開発条件と業務機能の状況：0〜4（0） | 文章／4択 |
| [旧午前問67 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=32) | generator-source-2017h29h-fe-am-67@3.2.0 | 経営の概念。問う対象：0〜3（0） | 文章／4択 |
| [旧午前問68 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=32) | generator-source-2017h29h-fe-am-68@3.2.0 | 競争上のポジションと基本戦略。競争上のポジション：0〜3（2） | 文章／4択 |
| [旧午前問69 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=33) | generator-source-2017h29h-fe-am-69@3.2.0 | アンゾフの成長マトリクス。市場と製品の組合せ：0〜3（0） | 文章／4択 |
| [旧午前問70 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=33) | generator-source-2017h29h-fe-am-70@3.7.0 | 学習と成長の目標と評価指標。目標と指標1の実条件：0〜2（0）、目標と指標2の実条件：0〜1（0）、目標と指標3の実条件：0〜1（1）、目標と指標4の実条件：0〜1（0） | 文章／4択 |
| [旧午前問71 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=33) | generator-source-2017h29h-fe-am-71@3.2.0 | MRPの作業手順と入力情報。補助入力を使う計算段階：0〜2（1） | 文章・図／4択 |
| [旧午前問72 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=34) | generator-source-2017h29h-fe-am-72@3.7.0 | かんばん方式の調達条件。誤答の調達と生産の実条件：0〜3（0） | 文章／4択 |
| [旧午前問73 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=34) | generator-source-2017h29h-fe-am-73@3.2.0 | インターネットの情報配信・取引の機構。メディア・取引の対象：0〜3（0） | 文章／4択 |
| [旧午前問74 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=35) | generator-source-2017h29h-fe-am-74@3.2.0 | アフィリエイトの業務順序と参加者。問う業務順序：0〜3（0） | 文章・図／4択 |
| [旧午前問75 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=35) | generator-source-2017h29h-fe-am-75@3.7.0 | 会議のファシリテータの役割。役割・担当の実条件：0〜3（0） | 文章／4択 |
| [旧午前問76 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=36) | generator-source-2017h29h-fe-am-76@3.2.0 | 問題分析の図法と親和性。問う対象・条件：0〜3（1） | 文章／4択 |
| [旧午前問77 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=36) | generator-source-2017h29h-fe-am-77@3.7.0 | 営業活動によるキャッシュフロー。資金取引の実条件：0〜3（0） | 文章／4択 |
| [旧午前問78 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=36) | generator-source-2017h29h-fe-am-78@3.2.0 | 定額法による当期減価償却費。取得価額の1000千円単位：8〜12（10）、前期末累計の取得価額に対する10%単位：2〜4（3）、耐用年数の10年単位：1〜2（2） | 文章／4択 |
| [旧午前問79 p.37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=37) | generator-source-2017h29h-fe-am-79@3.7.0 | プログラムの著作権の保護範囲。保護条件の実記述：0〜3（0） | 文章／4択 |
| [旧午前問80 p.37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_am_qs.pdf#page=37) | generator-source-2017h29h-fe-am-80@3.2.0 | 営業秘密の三つの要件。本文から省かれた要件：0〜2（0） | 文章／4択 |

### 2016年度 秋期・午後

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午後問1 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=6) | generator-source-2016h28a-fe-pm-1@3.2.0 | 販売支援システムの情報セキュリティ。通信ポートと情報セキュリティ対策の条件：0〜3（0） | 文章・画像・箇条書き・図・表／14択・5解答欄 |
| [旧午後問2 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=10) | generator-source-2016h28a-fe-pm-2@3.2.0 | コンパイラの字句解析と構文解析。括弧を含む式の構造：0〜3（0） | 文章・図／17択・5解答欄 |
| [旧午後問3 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=14) | generator-source-2016h28a-fe-pm-3@3.2.0 | 従業員の通勤情報を管理する関係データベース。通勤手当の算定条件・交通費・講習会の日付：0〜3（0） | 文章・図・コード／20択・7解答欄 |
| [旧午後問4 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=18) | generator-source-2016h28a-fe-pm-4@3.2.0 | Web画面の表示に要するデータ転送時間。転送モデルの往復時間・速度・データ個数とサイズ：0〜3（0） | 文章・図・数式／16択・4解答欄 |
| [旧午後問5 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=21) | generator-source-2016h28a-fe-pm-5@3.3.0 | レンタル業務のクラス図・シーケンス図と多相性。貸出明細の集約条件と料金の組：0〜3（0） | 文章・図・表／25択・5解答欄 |
| [旧午後問6 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=27) | generator-source-2016h28a-fe-pm-6@3.3.0 | 単体テストの密度・バグ摘出率と品質評価。品質集計のテスト件数条件：0〜3（0） | 文章・図・表／23択・6解答欄 |
| [旧午後問7 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=31) | generator-source-2016h28a-fe-pm-7@3.3.0 | 業務提携の財務指標とFCFの現在価値。財務三表の金額規模：0〜3（0） | 文章・図／26択・7解答欄 |
| [旧午後問8 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=35) | generator-source-2016h28a-fe-pm-8@3.3.0 | 制御文字による数値編集と疑似言語の状態遷移。編集する下位二桁の組：0〜3（0） | 画像・文章・図／20択・6解答欄 |
| [旧午後問9 p.41](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=41) | generator-source-2016h28a-fe-pm-9@3.6.0 | 旧制度・午後：Cによる開発作業順序の決定。条件の選択番号：0〜22（0） | 画像・文章・見出し・表・コード・図／26択・6解答欄 |
| [旧午後問10 p.47](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=47) | generator-source-2016h28a-fe-pm-10@3.6.0 | 旧制度・午後：COBOLの健康診断マスタ更新。条件の選択番号：0〜8（0） | 文章・見出し・図・コード／26択・7解答欄 |
| [旧午後問11 p.53](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=53) | generator-source-2016h28a-fe-pm-11@3.6.0 | 旧制度・午後：Javaの列挙型と電卓。条件の選択番号：0〜8（0） | 画像・文章・見出し・図・コード／33択・7解答欄 |
| [旧午後問12 p.59](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=59) | generator-source-2016h28a-fe-pm-12@3.6.0 | 旧制度・午後：CASL IIのリスト挿入・削除。条件の選択番号：0〜7（0） | 画像・文章・見出し・図・表・コード／26択・5解答欄 |
| [旧午後問13 p.63](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf#page=63) | generator-source-2016h28a-fe-pm-13@3.6.0 | 旧制度・午後：表計算による作業工程と最短経路。条件の選択番号：0〜8（0） | 画像・文章・見出し・図／32択・6解答欄 |

### 2016年度 秋期・午前

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午前問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=4) | generator-source-2016h28a-fe-am-1@3.2.0 | ビット列の保持。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問2 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=4) | generator-source-2016h28a-fe-am-2@3.2.0 | 不良品の条件付き確率。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問3 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=5) | generator-source-2016h28a-fe-am-3@3.7.0 | 自動販売機の状態遷移。caseIndex：0〜8（0） | 文章・表・図／4択 |
| [旧午前問4 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=5) | generator-source-2016h28a-fe-am-4@3.2.0 | ビットパターンの個数。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問5 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=6) | generator-source-2016h28a-fe-am-5@3.2.0 | アナログからディジタルへの変換順序。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問6 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=6) | generator-source-2016h28a-fe-am-6@3.2.0 | 2分探索木の判定。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問7 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=6) | generator-source-2016h28a-fe-am-7@3.2.0 | 最大公約数の再帰。caseIndex：0〜7（0） | 文章・表・図・数式／4択 |
| [旧午前問8 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=7) | generator-source-2016h28a-fe-am-8@3.2.0 | Webプログラムの実行環境。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問9 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=7) | generator-source-2016h28a-fe-am-9@3.2.0 | 主記憶のアドレス指定。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問10 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=7) | generator-source-2016h28a-fe-am-10@3.2.0 | CPUの命令実行方式。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問11 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=8) | generator-source-2016h28a-fe-am-11@3.8.0 | 必要なアドレス線。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問12 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=8) | generator-source-2016h28a-fe-am-12@3.2.0 | ディスクと主記憶の方式。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問13 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=9) | generator-source-2016h28a-fe-am-13@3.7.0 | 3層Webシステム。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問14 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=9) | generator-source-2016h28a-fe-am-14@3.7.0 | ホットスタンバイと負荷分散。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問15 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=10) | generator-source-2016h28a-fe-am-15@3.2.0 | 並列構成の稼働率。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問16 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=10) | generator-source-2016h28a-fe-am-16@3.2.0 | ジョブと印刷の待ち。caseIndex：0〜7（0） | 文章・表・図・箇条書き／4択 |
| [旧午前問17 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=11) | generator-source-2016h28a-fe-am-17@3.2.0 | 仮想記憶と性能低下。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問18 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=11) | generator-source-2016h28a-fe-am-18@3.2.0 | プロセスの切替え。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問19 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=12) | generator-source-2016h28a-fe-am-19@3.7.0 | LRUの判断基準。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問20 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=12) | generator-source-2016h28a-fe-am-20@3.2.0 | 線形探索法によるハッシュ衝突。caseIndex：0〜7（0） | 文章・表・図・箇条書き／4択 |
| [旧午前問21 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=13) | generator-source-2016h28a-fe-am-21@3.2.0 | アノードコモン7セグメントLED。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問22 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=13) | generator-source-2016h28a-fe-am-22@3.2.0 | メモリセルと保持方式。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問23 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=14) | generator-source-2016h28a-fe-am-23@3.2.0 | 3入力多数決回路。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問24 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=14) | generator-source-2016h28a-fe-am-24@3.2.0 | 入力データのチェック。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問25 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=15) | generator-source-2016h28a-fe-am-25@3.2.0 | 音声の記録可能時間。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問26 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=15) | generator-source-2016h28a-fe-am-26@3.7.0 | E-Rモデル。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問27 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=15) | generator-source-2016h28a-fe-am-27@3.2.0 | 6行の表の関数従属。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問28 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=16) | generator-source-2016h28a-fe-am-28@3.2.0 | 関係代数とSQL。caseIndex：0〜3（0） | 文章・表・図・コード／4択 |
| [旧午前問29 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=16) | generator-source-2016h28a-fe-am-29@3.8.0 | SQL結合後の行数。caseIndex：0〜7（0） | 文章・表・図・コード／4択 |
| [旧午前問30 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=17) | generator-source-2016h28a-fe-am-30@3.2.0 | ログによる復旧。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問31 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=17) | generator-source-2016h28a-fe-am-31@3.2.0 | 階層モデルと接続装置。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問32 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=18) | generator-source-2016h28a-fe-am-32@3.2.0 | TCP/IPプロトコル。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問33 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=18) | generator-source-2016h28a-fe-am-33@3.8.0 | 同一サブネットのIPv4。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問34 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=19) | generator-source-2016h28a-fe-am-34@3.2.0 | NTPの時計のずれ。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問35 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=20) | generator-source-2016h28a-fe-am-35@3.2.0 | 衛星通信の伝送遅延。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問36 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=20) | generator-source-2016h28a-fe-am-36@3.2.0 | 自動入力の排除。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問37 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=20) | generator-source-2016h28a-fe-am-37@3.7.0 | 情報の完全性。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問38 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=21) | generator-source-2016h28a-fe-am-38@3.7.0 | メッセージダイジェストの目的。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問39 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=21) | generator-source-2016h28a-fe-am-39@3.7.0 | PKIの認証局。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問40 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=21) | generator-source-2016h28a-fe-am-40@3.7.0 | ICカードとPINの運用。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問41 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=22) | generator-source-2016h28a-fe-am-41@3.2.0 | rootkit。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問42 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=22) | generator-source-2016h28a-fe-am-42@3.2.0 | WAF。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問43 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=22) | generator-source-2016h28a-fe-am-43@3.2.0 | ビヘイビア法。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問44 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=23) | generator-source-2016h28a-fe-am-44@3.2.0 | パスワードリスト攻撃。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問45 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=23) | generator-source-2016h28a-fe-am-45@3.2.0 | マルウェアの通信ポート。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問46 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=23) | generator-source-2016h28a-fe-am-46@3.2.0 | フールプルーフ。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問47 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=24) | generator-source-2016h28a-fe-am-47@3.2.0 | カプセル化。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問48 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=24) | generator-source-2016h28a-fe-am-48@3.8.0 | 同値分割と境界値。caseIndex：0〜9（0） | 文章・表・図・箇条書き／4択 |
| [旧午前問49 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=24) | generator-source-2016h28a-fe-am-49@3.2.0 | トップダウン結合テスト。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問50 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=25) | generator-source-2016h28a-fe-am-50@3.2.0 | リバースエンジニアリング。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問51 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=25) | generator-source-2016h28a-fe-am-51@3.2.0 | プロジェクトのプロセスグループ。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問52 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=25) | generator-source-2016h28a-fe-am-52@3.2.0 | クラッシング。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問53 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=25) | generator-source-2016h28a-fe-am-53@3.2.0 | ファンクションポイント。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問54 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=26) | generator-source-2016h28a-fe-am-54@3.2.0 | ピーク時要員。caseIndex：0〜11（0） | 文章・表・図／4択 |
| [旧午前問58 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=27) | generator-source-2016h28a-fe-am-58@3.2.0 | 安全性の監査。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問59 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=28) | generator-source-2016h28a-fe-am-59@3.2.0 | 可用性の監査。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問60 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=28) | generator-source-2016h28a-fe-am-60@3.2.0 | BCPの監査。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問61 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=28) | generator-source-2016h28a-fe-am-61@3.2.0 | EA。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問62 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=29) | generator-source-2016h28a-fe-am-62@3.2.0 | 投資回収期間。caseIndex：0〜11（0） | 文章・表・図／4択 |
| [旧午前問63 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=29) | generator-source-2016h28a-fe-am-63@3.2.0 | BPM。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問64 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=30) | generator-source-2016h28a-fe-am-64@3.8.0 | 重み付け総合評価。caseIndex：0〜10（0） | 文章・表・図／4択 |
| [旧午前問65 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=30) | generator-source-2016h28a-fe-am-65@3.2.0 | CSR調達。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問66 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=30) | generator-source-2016h28a-fe-am-66@3.2.0 | 公平なベンダ選定。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問67 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=31) | generator-source-2016h28a-fe-am-67@3.2.0 | コストプラス法。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問68 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=31) | generator-source-2016h28a-fe-am-68@3.2.0 | 4Pと4C。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問69 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=32) | generator-source-2016h28a-fe-am-69@3.2.0 | CRMの目的。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問70 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=32) | generator-source-2016h28a-fe-am-70@3.2.0 | 技術のSカーブ。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問71 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=32) | generator-source-2016h28a-fe-am-71@3.2.0 | 制約下の最大利益。caseIndex：0〜11（0） | 文章・表・図／4択 |
| [旧午前問72 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=33) | generator-source-2016h28a-fe-am-72@3.8.0 | 部品展開と発注量。caseIndex：0〜11（0） | 文章・表・図／4択 |
| [旧午前問73 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=33) | generator-source-2016h28a-fe-am-73@3.2.0 | CGM。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問74 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=33) | generator-source-2016h28a-fe-am-74@3.2.0 | EDIの情報表現規約。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問75 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=34) | generator-source-2016h28a-fe-am-75@3.2.0 | CIO。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問76 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=34) | generator-source-2016h28a-fe-am-76@3.2.0 | マトリックス組織。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問77 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=35) | generator-source-2016h28a-fe-am-77@3.2.0 | OC曲線と合格判定個数。caseIndex：0〜9（0） | 文章・表・図／4択 |
| [旧午前問78 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=36) | generator-source-2016h28a-fe-am-78@3.2.0 | 定量発注在庫モデル。caseIndex：0〜9（0） | 文章・表・図／4択 |
| [旧午前問79 p.36](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=36) | generator-source-2016h28a-fe-am-79@3.2.0 | 法人著作。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問80 p.37](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_am_qs.pdf#page=37) | generator-source-2016h28a-fe-am-80@3.2.0 | 電子計算機損壊等業務妨害。caseIndex：0〜3（0） | 文章・表・図／4択 |

### 2016年度 春期・午後

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午後問1 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=6) | generator-source-2016h28h-fe-pm-1@3.2.0 | Webサーバに対する不正侵入とその対策。漏えい確認範囲・パスワードの長さ：0〜3（0） | 文章・図・表／24択・5解答欄 |
| [旧午後問2 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=10) | generator-source-2016h28h-fe-pm-2@3.2.0 | リスト構造で管理されているセルとガーベジコレクタ。LIVEからのポインタ・セル当たりの処理時間：0〜3（0） | 文章・図／13択・5解答欄 |
| [旧午後問3 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=14) | generator-source-2016h28h-fe-pm-3@3.2.0 | 遊園地の入園者情報を管理する関係データベース。精算額の下限・入園年の抽出条件：0〜3（0） | 文章・図・コード／17択・5解答欄 |
| [旧午後問4 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=18) | generator-source-2016h28h-fe-pm-4@3.2.0 | イーサネットを介した通信。ARP要求の送信元と接続先セグメント：0〜3（0） | 文章・図／21択・5解答欄 |
| [旧午後問5 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=21) | generator-source-2016h28h-fe-pm-5@3.3.0 | 店舗検索システムの処理方式と通信。店舗照合項目と特売情報の再取得条件：0〜5（0） | 文章・図・表／21択・7解答欄 |
| [旧午後問6 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=26) | generator-source-2016h28h-fe-pm-6@3.3.0 | パッケージ導入の加重評価とリスク対策費。各提案の適合数・見積額・リスク条件の組：0〜4（0） | 文章・表／18択・5解答欄 |
| [旧午後問7 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=30) | generator-source-2016h28h-fe-pm-7@3.3.0 | 購買履歴のリピート率と広告投資効果。商品別購入履歴と広告施策の見積条件の組：0〜5（0） | 画像・文章・図・表／21択・7解答欄 |
| [旧午後問8 p.35](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=35) | generator-source-2016h28h-fe-pm-8@3.3.0 | 長さ付きメモの配列編集と領域回収。メモの文字列と削除・変更・移動の引数の組：0〜4（0） | 画像・文章・図・コード／24択・7解答欄 |
| [旧午後問9 p.41](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=41) | generator-source-2016h28h-fe-pm-9@3.6.0 | 旧制度・午後：Cによるフラクタル図形の描画。描画条件の番号：0〜7（0） | 文章・見出し・図・コード／19択・6解答欄 |
| [旧午後問10 p.46](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=46) | generator-source-2016h28h-fe-pm-10@3.6.0 | 旧制度・午後：COBOLによる宿泊予約の管理。施設とキャンセル条件の番号：0〜11（0） | 文章・見出し・表・コード・図／22択・6解答欄 |
| [旧午後問11 p.51](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=51) | generator-source-2016h28h-fe-pm-11@3.6.0 | 旧制度・午後：JavaによるToDo管理。期限と重要度の条件番号：0〜7（0） | 文章・見出し・表・コード／26択・7解答欄 |
| [旧午後問12 p.57](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=57) | generator-source-2016h28h-fe-pm-12@3.6.0 | 旧制度・午後：CASL IIによる競走のチーム別順位。走査と出力例の条件番号：0〜7（0） | 画像・文章・見出し・表・コード／28択・6解答欄 |
| [旧午後問13 p.61](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_pm_qs.pdf#page=61) | generator-source-2016h28h-fe-pm-13@3.6.0 | 旧制度・午後：表計算による販売分析。売上データと判定閾値の条件番号：0〜7（0） | 画像・文章・見出し・表・コード／28択・7解答欄 |

### 2016年度 春期・午前

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [旧午前問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=4) | generator-source-2016h28h-fe-am-1@3.8.0 | 左シフトと加算。caseIndex：0〜9（0） | 文章・表・図／4択 |
| [旧午前問2 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=4) | generator-source-2016h28h-fe-am-2@3.2.0 | 状態遷移と受理。caseIndex：0〜131（0） | 文章・表・図／4択 |
| [旧午前問3 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=4) | generator-source-2016h28h-fe-am-3@3.2.0 | 正規表現の集合。caseIndex：0〜59（0） | 文章・表・図・箇条書き／4択 |
| [旧午前問4 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=5) | generator-source-2016h28h-fe-am-4@3.2.0 | PCMの標本化間隔。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問5 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=5) | generator-source-2016h28h-fe-am-5@3.8.0 | 2分探索木の値。入力1：0〜150（0） | 文章・表・図／4択 |
| [旧午前問6 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=5) | generator-source-2016h28h-fe-am-6@3.2.0 | 2次元配列の入れ子参照。caseIndex：0〜26（0） | 文章・表・図／4択 |
| [旧午前問7 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=6) | generator-source-2016h28h-fe-am-7@3.7.0 | 階乗の再帰定義。入力1：0〜4（0） | 文章・表・図／4択 |
| [旧午前問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=6) | generator-source-2016h28h-fe-am-8@3.2.0 | 減算による商と余り。caseIndex：0〜11（0） | 文章・表・図／4択 |
| [旧午前問9 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=7) | generator-source-2016h28h-fe-am-9@3.7.0 | クロック周波数と性能。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問10 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=7) | generator-source-2016h28h-fe-am-10@3.2.0 | 5段パイプラインの実行順。caseIndex：0〜3（0） | 文章・表・図・箇条書き／4択 |
| [旧午前問11 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=8) | generator-source-2016h28h-fe-am-11@3.7.0 | キャッシュの効果。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問12 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=8) | generator-source-2016h28h-fe-am-12@3.2.0 | 画像の必要記憶容量。caseIndex：0〜27（0） | 文章・表・図／4択 |
| [旧午前問13 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=8) | generator-source-2016h28h-fe-am-13@3.2.0 | 性能の評価尺度。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問14 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=9) | generator-source-2016h28h-fe-am-14@3.2.0 | LAN構成の稼働率。caseIndex：0〜5（0） | 文章・表・図／4択 |
| [旧午前問15 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=9) | generator-source-2016h28h-fe-am-15@3.2.0 | MTBFとMTTR。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問16 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=10) | generator-source-2016h28h-fe-am-16@3.2.0 | 優先度スケジューリング。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問17 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=10) | generator-source-2016h28h-fe-am-17@3.2.0 | 入出力バッファ。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問18 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=10) | generator-source-2016h28h-fe-am-18@3.2.0 | UNIXのコマンド接続。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問19 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=11) | generator-source-2016h28h-fe-am-19@3.7.0 | コンパイラの最適化。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問20 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=11) | generator-source-2016h28h-fe-am-20@3.2.0 | リンカの機能。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問21 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=11) | generator-source-2016h28h-fe-am-21@3.7.0 | 静的テストツール。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問22 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=12) | generator-source-2016h28h-fe-am-22@3.2.0 | RFIDの利用。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問23 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=12) | generator-source-2016h28h-fe-am-23@3.2.0 | 論理回路の等価性。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問24 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=12) | generator-source-2016h28h-fe-am-24@3.2.0 | Web文書の視覚表現。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問25 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=13) | generator-source-2016h28h-fe-am-25@3.2.0 | クリッピング。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問26 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=13) | generator-source-2016h28h-fe-am-26@3.7.0 | 関係モデルの対応。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問27 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=13) | generator-source-2016h28h-fe-am-27@3.2.0 | 関係代数演算。caseIndex：0〜5（0） | 文章・表・図／4択 |
| [旧午前問28 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=14) | generator-source-2016h28h-fe-am-28@3.2.0 | トランザクションの特性。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問29 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=14) | generator-source-2016h28h-fe-am-29@3.7.0 | 外部キーの目的。caseIndex：0〜4（0） | 文章・表・図／4択 |
| [旧午前問30 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=14) | generator-source-2016h28h-fe-am-30@3.2.0 | DBの同時更新制御。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問31 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=15) | generator-source-2016h28h-fe-am-31@3.2.0 | 伝送効率と時間。caseIndex：0〜7（0） | 文章・表・図／4択 |
| [旧午前問32 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=15) | generator-source-2016h28h-fe-am-32@3.2.0 | ネットワーク中継装置。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問33 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=15) | generator-source-2016h28h-fe-am-33@3.2.0 | NAPTとネットワークサービス。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問34 p.15](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=15) | generator-source-2016h28h-fe-am-34@3.8.0 | IPv4のブロードキャストアドレス。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問35 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=16) | generator-source-2016h28h-fe-am-35@3.2.0 | HTTP応答パケットのポート番号。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問36 p.16](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=16) | generator-source-2016h28h-fe-am-36@3.2.0 | 検索結果を悪用する攻撃。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問37 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=17) | generator-source-2016h28h-fe-am-37@3.2.0 | SQLインジェクションと攻撃の説明。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問38 p.17](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=17) | generator-source-2016h28h-fe-am-38@3.2.0 | スパイウェアとプログラムの目的。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問39 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=18) | generator-source-2016h28h-fe-am-39@3.7.0 | 認証局の役割。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問40 p.18](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=18) | generator-source-2016h28h-fe-am-40@3.7.0 | パスワード再登録の送信先と内容。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問41 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=19) | generator-source-2016h28h-fe-am-41@3.7.0 | SaaS利用企業のセキュリティ管理。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問42 p.19](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=19) | generator-source-2016h28h-fe-am-42@3.7.0 | BYODの説明とリスク。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問43 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=20) | generator-source-2016h28h-fe-am-43@3.2.0 | WAFと通信基盤の機能。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問44 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=20) | generator-source-2016h28h-fe-am-44@3.7.0 | フォレンジックスでのハッシュ値の目的。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問45 p.20](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=20) | generator-source-2016h28h-fe-am-45@3.7.0 | 磁気ディスク廃棄時の情報漏えい対策。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問47 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=21) | generator-source-2016h28h-fe-am-47@3.7.0 | モジュール結合度の比較。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問48 p.21](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=21) | generator-source-2016h28h-fe-am-48@3.2.0 | 状態遷移テストとテスト技法。candidate：0〜1（0） | 文章・表・図／4択 |
| [旧午前問49 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=22) | generator-source-2016h28h-fe-am-49@3.8.0 | 二つの分岐の命令網羅。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問50 p.22](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=22) | generator-source-2016h28h-fe-am-50@3.7.0 | 構成管理に起因しない問題。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問51 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=23) | generator-source-2016h28h-fe-am-51@3.2.0 | WBSとプロジェクト管理技法の目的。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問52 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=23) | generator-source-2016h28h-fe-am-52@3.2.0 | プロジェクトのマネジメントプロセス。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問53 p.23](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=23) | generator-source-2016h28h-fe-am-53@3.7.0 | クラッシングで優先する作業。candidate：0〜2（0） | 文章・表・図／4択 |
| [旧午前問54 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=24) | generator-source-2016h28h-fe-am-54@3.2.0 | 全員の顔合わせ会の延べ時間。candidate：0〜3（0） | 文章・表・図／4択 |
| [旧午前問55 p.24](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=24) | generator-source-2016h28h-fe-am-55@3.7.0 | ミッションクリティカルシステム。candidate：0〜4（0） | 文章・表・図／4択 |
| [旧午前問57 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=25) | generator-source-2016h28h-fe-am-57@3.2.0 | 容量・能力の監視。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問58 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=25) | generator-source-2016h28h-fe-am-58@3.2.0 | 雷サージ対策。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問59 p.25](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=25) | generator-source-2016h28h-fe-am-59@3.2.0 | アクセス制御の監査。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問61 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=26) | generator-source-2016h28h-fe-am-61@3.2.0 | パッチ適用リスクの監査。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問62 p.26](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=26) | generator-source-2016h28h-fe-am-62@3.2.0 | EAの分類体系。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問64 p.27](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=27) | generator-source-2016h28h-fe-am-64@3.2.0 | UMLの活用。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問65 p.28](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=28) | generator-source-2016h28h-fe-am-65@3.2.0 | IoT。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問67 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=29) | generator-source-2016h28h-fe-am-67@3.2.0 | SWOT分析。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問68 p.29](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=29) | generator-source-2016h28h-fe-am-68@3.2.0 | ベンチマーキング。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問69 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=30) | generator-source-2016h28h-fe-am-69@3.2.0 | ポートフォリオマネジメント。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問70 p.30](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=30) | generator-source-2016h28h-fe-am-70@3.2.0 | EMS。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問71 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=31) | generator-source-2016h28h-fe-am-71@3.2.0 | ディジタルディバイド。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問72 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=31) | generator-source-2016h28h-fe-am-72@3.2.0 | MRPの処理手順。caseIndex：0〜3（0） | 文章・表・図・箇条書き／4択 |
| [旧午前問73 p.31](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=31) | generator-source-2016h28h-fe-am-73@3.2.0 | 逆オークション。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問74 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=32) | generator-source-2016h28h-fe-am-74@3.2.0 | ロングテール。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問75 p.32](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=32) | generator-source-2016h28h-fe-am-75@3.2.0 | コーポレートガバナンス。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問76 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=33) | generator-source-2016h28h-fe-am-76@3.2.0 | プロジェクト組織。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問77 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=33) | generator-source-2016h28h-fe-am-77@3.2.0 | パレート図。caseIndex：0〜11（0） | 文章・表・図／4択 |
| [旧午前問78 p.33](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=33) | generator-source-2016h28h-fe-am-78@3.2.0 | 貸借対照表。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問79 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=34) | generator-source-2016h28h-fe-am-79@3.2.0 | 著作権の保護対象。caseIndex：0〜3（0） | 文章・表・図／4択 |
| [旧午前問80 p.34](https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gn5o-att/2016h28h_fe_am_qs.pdf#page=34) | generator-source-2016h28h-fe-am-80@3.2.0 | 外部業者との開発契約。caseIndex：0〜3（0） | 文章・表・図／4択 |

## 登録図の入力契約

renderer-source-figures@1.0.0はsource_figureのprofileとvaluesだけを受け取る。登録済みの形状を固定React/SVGコードで描き、値の個数と位置ごとの整数域を検査する。既存図の入力域はsrc/core/source-figure-domains.json、管理図はsrc/core/managed-legacy-figures.ts、src/core/legacy-afternoon-figures.ts及びsrc/core/legacy-morning-figure-domains.jsonの固定契約を結合して生成する。旧午前・旧午後の位置別上下限は外接域であり、許可する入力は査読済みの登録tuple又はprofile別モデルの制約に限る。描画器の登録だけで問題集の素材条件・配布を承認したとは扱わない。未登録形状・不足・過剰・域外はFIGURE_PROFILEで拒否する。原図の凡例・円・線種・配列の網掛けを保持し、内部IDや接続説明表を通常画面へ追加しない。読み上げ用説明はSVGのtitle／desc又は明示したアクセシブル名に保持する。

| profile | valuesの位置別の下限〜上限（0始まり） | 入力の意味・描画との対応 |
| --- | --- | --- |
| legacy-2016-autumn-pm-1-network | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-1-network」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-1-rules | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-1-rules」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-1-cia-table | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-1-cia-table」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-1-prose | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-1-prose」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-2-prose | 0：0〜2 | 問題集が所有する有限入力3組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-2-prose」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-3-prose | 0：0〜7 | 問題集が所有する有限入力8組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-3-prose」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-4-prose | 0：0〜2 | 問題集が所有する有限入力3組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-4-prose」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-2-lexical-rules | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-2-lexical-rules」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-2-expression-rules | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-2-expression-rules」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-2-factor-rule | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-2-factor-rule」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-3-query-e | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-3-query-e」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-3-query-f | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-3-query-f」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-3-query-g | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-3-query-g」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-2-dfa | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-2-dfa」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-2-example-tree | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-2-example-tree」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-2-syntax-tree | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-2-syntax-tree」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-3-before-tables | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-3-before-tables」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-3-after-tables | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-3-after-tables」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-3-training-table | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-3-training-table」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-4-transfer-table | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-4-transfer-table」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-4-transfer-inequality | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-4-transfer-inequality」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-5-assets | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-5-assets」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-5-classes | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-5-classes」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-5-sequence | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-5-sequence」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-quality-graph | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-quality-graph」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-forecast | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-forecast」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-program | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-program」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-detail-program | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-detail-program」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-5-source-fragment-19 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-5-source-fragment-19」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-5-source-fragment-35 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-5-source-fragment-35」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-5-source-fragment-36 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-5-source-fragment-36」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-5-source-fragment-37 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-5-source-fragment-37」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-5-source-fragment-38 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-5-source-fragment-38」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-4 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-4」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-7 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-7」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-11 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-11」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-13 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-13」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-14 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-14」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-15 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-15」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-18 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-18」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-22 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-22」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-23 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-23」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-6-source-fragment-24 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-6-source-fragment-24」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-3 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-3」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-4 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-4」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-5 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-5」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-6 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-6」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-11 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-11」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-12 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-12」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-13 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-13」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-14 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-14」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-24 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-24」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-7-source-fragment-25 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-7-source-fragment-25」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-source-fragment-5 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-source-fragment-5」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-source-fragment-16 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-source-fragment-16」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-source-fragment-18 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-source-fragment-18」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-source-fragment-19 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-source-fragment-19」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-source-fragment-20 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-source-fragment-20」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-source-fragment-22 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-source-fragment-22」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-8-source-fragment-23 | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-8-source-fragment-23」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-9-program1 | 0：0〜22 | 問題集が所有する有限入力23組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-9-program1」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-9-job-data | 0：0〜22 | 問題集が所有する有限入力23組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-9-job-data」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-9-schedule-order | 0：0〜22 | 問題集が所有する有限入力23組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-9-schedule-order」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-9-third-output-line | 0：0〜22 | 問題集が所有する有限入力23組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-9-third-output-line」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-9-lateness-formula | 0：0〜22 | 問題集が所有する有限入力23組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-9-lateness-formula」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-10-master-record-layout | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-10-master-record-layout」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-10-result-record-layout | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-10-result-record-layout」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-10-program | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-10-program」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-10-change-table | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-10-change-table」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-10-confirmation-output | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-10-confirmation-output」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-11-digit-enum-program | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-11-digit-enum-program」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-11-operation-enum-program | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-11-operation-enum-program」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-11-test-map-program | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-11-test-map-program」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-11-example-output | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-11-example-output」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-11-argument-results | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-11-argument-results」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-12-generic-list-structure | 0：0〜7 | 問題集が所有する有限入力8組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-12-generic-list-structure」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-12-three-element-list | 0：0〜7 | 問題集が所有する有限入力8組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-12-three-element-list」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-12-lproc-program | 0：0〜7 | 問題集が所有する有限入力8組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-12-lproc-program」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-13-transition-sheet | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-13-transition-sheet」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-13-route-examples-sheet | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-13-route-examples-sheet」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-13-extended-route-sheet | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-13-extended-route-sheet」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-13-display-minimum-path-macro | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-13-display-minimum-path-macro」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-autumn-pm-13-worksheet-formulas | 0：0〜8 | 問題集が所有する有限入力9組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-autumn-pm-13-worksheet-formulas」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-1-network | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-1-network」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-2-cell | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-2-cell」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-2-memory | 0：0〜0 | 問題集が所有する有限入力1組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-2-memory」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-2-live | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-2-live」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-2-marked | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-2-marked」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-2-sweep | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-2-sweep」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-2-efficiency | 0：0〜3、1：0〜3 | 問題集が所有する有限入力16組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-2-efficiency」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-3-tables | 0：0〜3、1：0〜2 | 問題集が所有する有限入力12組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-3-tables」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-4-network | 0：0〜3 | 問題集が所有する有限入力4組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-4-network」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-5-store-record | 0：0〜5 | 問題集が所有する有限入力6組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-5-store-record」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-5-favorite-record | 0：0〜5 | 問題集が所有する有限入力6組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-5-favorite-record」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-5-web-sequence | 0：0〜5 | 問題集が所有する有限入力6組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-5-web-sequence」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-5-app-sequence | 0：0〜5 | 問題集が所有する有限入力6組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-5-app-sequence」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-7-purchases | 0：0〜5 | 問題集が所有する有限入力6組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-7-purchases」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-7-repeat-purchases | 0：0〜5 | 問題集が所有する有限入力6組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-7-repeat-purchases」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-7-bubble-chart | 0：0〜5 | 問題集が所有する有限入力6組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-7-bubble-chart」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-8-memo-screen | 0：0〜4 | 問題集が所有する有限入力5組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-8-memo-screen」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-8-memo-length-example | 0：0〜4 | 問題集が所有する有限入力5組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-8-memo-length-example」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-8-memo-state-0 | 0：0〜4 | 問題集が所有する有限入力5組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-8-memo-state-0」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-8-memo-state-1 | 0：0〜4 | 問題集が所有する有限入力5組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-8-memo-state-1」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-8-memo-state-2 | 0：0〜4 | 問題集が所有する有限入力5組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-8-memo-state-2」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-8-memo-state-3 | 0：0〜4 | 問題集が所有する有限入力5組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-8-memo-state-3」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-8-memo-state-4 | 0：0〜4 | 問題集が所有する有限入力5組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-8-memo-state-4」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-9-depth-examples | 0：0〜7 | 問題集が所有する有限入力8組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-9-depth-examples」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-9-replacement-rule | 0：0〜7 | 問題集が所有する有限入力8組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-9-replacement-rule」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-9-substitution-choice | 0：0〜7 | 問題集が所有する有限入力8組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-9-substitution-choice」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-9-new-pattern-result | 0：0〜7 | 問題集が所有する有限入力8組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-9-new-pattern-result」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| legacy-2016-spring-pm-10-change-table | 0：0〜11 | 問題集が所有する有限入力12組。位置ごとの値と描画条件の全対応は後掲の「legacy-2016-spring-pm-10-change-table」を参照。未登録の値・相関条件を満たさない組は拒否する。 |
| waf-network | 0：0〜1、1：0〜1 | 0：TLS終端（0=インターネット側の機器、1=Webサーバ側の機器）、1：FWとSSLアクセラレータの接続順。a〜dと末尾のDBアクセスは固定 |
| euclid-flow | 0：0〜3 | 0：設問の初期値比の候補（2:1、1:2、3:2、2:3）。流れ図自体の手順は固定 |
| crash-network | 0：1〜40、1：1〜40、2：1〜40、3：1〜40、4：1〜40、5：1〜40、6：1〜40 | 0〜6：作業A〜Gの標準日数。図の枝はB→E、C、D→Fで固定 |
| cache-layout | 0：1〜1000000、1：1〜1000000 | 0：CPU内キャッシュの容量kバイト、1：主記憶の容量Mバイト。時間は本文に保持 |
| scatter | 0：0〜2、1：0〜2 | 0：相関の向き（0=負、1=正、2=共分散0）、1：対称配置の散らばりの段階。28点を生成 |
| bst | 0：0〜6、1：0〜1 | 0：a〜gの循環移動量、1：左右反転（0=元配置、1=鏡像）。節点のつながりは固定 |
| project-network | 0：1〜20、1：1〜20、2：1〜20、3：1〜20、4：1〜20、5：1〜20、6：1〜20、7：1〜20、8：1〜20 | 0〜8：作業A〜Iの日数。2本のダミー接続は固定し日数を表示しない |
| logic-circuit | 0：0〜15 | 0：出力反転のビットマスク。bit0〜3を第1〜4ゲートの小円に対応。AND形の4ゲートと接続は固定 |
| waveform | 0：0〜1、1：0〜1、2：0〜1、3：0〜1、4：0〜1、5：0〜1、6：0〜1、7：0〜1、8：0〜1、9：0〜1、10：0〜1、11：0〜1、12：0〜1、13：0〜1、14：0〜1、15：0〜1、16：0〜1、17：0〜1、18：0〜1、19：0〜1、20：0〜1 | 0〜6：A、7〜13：B、14〜20：Yの同じ7時間区間の0／1。図から値を再計算しない |
| undirected-graph | 0：0〜3、1：0〜2 | 0：頂点番号の基準差、1：登録した3辺集合の選択。5頂点の番号と接続を描く |
| adjacency-matrix | 0：0〜3、1：0〜2 | 0：対応頂点番号の基準差、1：無向グラフと同じ3辺集合の選択。5行5列の対称行列 |
| stack | 0：0〜3、1：4〜8、2：1〜9、3：1〜9 | 0：stackPosに保存する位置の基準差、1：配列容量、2・3：先頭2要素の値。3番目以降は網掛け |
| linked-arrays | 0：0〜3、1：1〜5 | 0：保存ポインタ値の基準差、1：元dataList値10・30・20・40の倍率。未定義セルを網掛け |
| ordered-array | 0：1〜5 | 0：整列配列の値10・20・30・40の倍率。添字は1〜4 |
| onehot | 0：0〜3 | 0：登録4色列の選択。0=Red,Green,Blue,Red、1=Blue,Red,Blue,Green、2=Green,Green,Red,Blue、3=Blue,Green,Red,Green。初出順のOne-Hotと戻り値を描く |
| list-element-class | 0：0〜1 | 0：終端表現（0=未定義、1=endNode）。クラスのnext初期値を本文の終端条件と連動 |
| bigram-example | 0：0〜3 | 0：査読した4語群の例（0〜3）。対象文字の位置・後続文字・語末を区別して表示 |
| priority-queue-class | 0：0〜1、1：0〜1 | 0：優先度の向き（0=小さい数が先、1=大きい数が先）、1：同値時（0=先入れ、1=後入れ） |
| sample-tree-14 | 0：4〜7 | 0：左の子だけをもつ親の節番号（4〜7）。14節の木と配列を連動 |
| sample-minimax | 0：1〜3、1：0〜2 | 0：勝敗の評価値の5点単位（1〜3）、1：A/Bを付ける根の二枝（0〜2）。全11盤面と葉の勝敗を保持 |
| dec-a-binary-flow | 0：5〜8 | 0：2進数の出力桁数（5〜8）。1始まりの変換ループと空欄a/b。 |
| dec-a-automaton | 0：0〜0 | 0：固定の3状態6遷移。初期矢印と入力/出力ラベルを保持。 |
| dec-a-bst | 0：0〜3、1：0〜3、2：0〜3 | 0：値の順序条件、1：4択の木番号、2：全節値への加算（各0〜3）。原辺と左右を保持。 |
| dec-a-array | 0：0〜3、1：0〜2 | 0：180度/左90度/左右反転/右90度（0〜3）、1：星印の模様（0〜2）。二重ループとA/Bの8×8表。 |
| dec-a-hash | 0：13〜13 | 0：配列要素数13。位置0〜12の空欄配列。 |
| dec-a-availability | 0：2〜4、1：2〜3 | 0：クライアント数2〜4、1：プリンタ数2〜3。サーバと各機器をLANで接続。 |
| dec-a-buffer | 0：0〜0 | 0：固定接続。送信タスク→S→サイズLのバッファ→R→受信タスク。 |
| dec-a-multiplicity | 0：0〜3 | 0：部署側/従業員側の多重度の4条件。関連名・読取方向を維持。 |
| dec-a-network | 0：1〜3、1：1〜3 | 0：A、1：Eの日数（各1〜3）。A〜Jの10作業、円と上下ラベルの凡例。 |
| dec-a-dispatch | 0：0〜2 | 0：太線（0=派遣先/労働者、1=派遣元/労働者、2=企業間）。三者の双方向矢印。 |
| legacy-2016-spring-dfa | 0：0〜1 | 0：左から中央へ移る入力ビット0又は1。反対のビットで左の自己ループ及び中央から右へ遷移し、右は0・1で自己ループする。 |
| legacy-2016-spring-bst | 0：0〜150 | 0：査読した151種類の10節の木の位置。左右関係と空欄a・bを同じ木へ結び付ける。 |
| legacy-2016-spring-factorial | 0：0〜0 | 0：固定の再帰定義。n&gt;0の式は空欄a、n=0の値は1。 |
| legacy-2016-spring-division | 0：0〜3、1：1〜3 | 0：qの初期値0〜3、1：qの増分1〜3。rの減算と戻り先は固定し、選択肢のq・rの式を同じ条件へ同期する。 |
| legacy-2016-spring-am-common-gates | 0：0〜0 | 0：固定の共通表記p3。9種類の論理図記号・説明と反転の注記を保持する。 |
| legacy-2016-spring-am-14-lan | 0：2〜4、1：2〜3 | 0：クライアント台数2〜4、1：プリンタ台数2〜3。登録した組合せだけをLANの枝へ描く。 |
| legacy-2016-spring-am-23-logic | 0：0〜3、1：0〜3、2：0〜3、3：0〜3 | 0〜3：第1〜第4ゲートの種類（0=AND、1=NAND、2=OR、3=NOR）。査読した接続・種類の完全な組だけを許す。 |
| legacy-2016-spring-am-23-gate | 0：0〜3 | 0：選択肢のゲート（0=OR、1=AND、2=XOR、3=NOR）。A・Bを入力、Yを出力とする。 |
| legacy-2016-spring-am-49 | 0：0〜7、1：0〜5、2：1〜5、3：2〜8、4：1〜4、5：2〜9 | 0・1：aとbの比較値、2・3：xへの二つの代入値、4・5：yへの二つの代入値。登録した4組の全6値だけを許し、命令網羅の分岐構成を保持する。 |
| legacy-2016-spring-am-ppm | 0：0〜0 | 0：固定の2行2列。市場シェアと市場成長率の軸・強弱・高低を原の位置に保つ。 |
| legacy-2016-spring-am-pareto | 0：0〜3、1：0〜11 | 0：棒と折れ線の4構成、1：査読した12組の棒の値の位置。原図同様に数値目盛を加えず、各棒と折れ線を同じ条件へ結び付ける。 |
| legacy-2016-autumn-am-3-fsm | 0：0〜1、1：0〜1、2：0〜1、3：0〜2、4：0〜2、5：0〜2、6：0〜1、7：0〜1、8：0〜1、9：0〜1 | 0〜2：S0→S1、S1→S2、曲線の遷移に付く出力。3・4：曲線の始点・終点の状態番号。5：終了状態の番号。6〜8：S0・S1・S2の自己ループの出力。9：入力記号a・bの入替え。原の入力／出力ラベル、開始矢印、終了状態の二重円を同じtupleへ結び付ける。 |
| legacy-2016-autumn-am-6-bst | 0：15〜35、1：12〜30、2：19〜45、3：10〜25、4：14〜30、5：0〜40、6：0〜50 | 0〜6：根から段ごとに左、右へ並べた7位置の節の値。位置iの左・右の子は2i+1・2i+2で、0は節なし。許可する木全体だけを受け付け、枝と左右の位置を保持する。 |
| legacy-2016-autumn-am-9-address | 0：0〜3、1：20〜25、2：0〜25 | 0：方式0=間接、1=指標、2=相対、3=直接。1：命令のアドレス部。2：間接方式の参照先アドレス又は指標レジスタ／プログラムカウンタの内容（直接方式では固定0）。方式に応じた参照矢印又は加算器を描く。 |
| legacy-2016-autumn-am-11-bus | 0：8〜32 | 0：データバスの本数8・16・32。アドレスバスの本数nは未知のまま、An−1からA0までの省略表記とD0〜D（本数−1）を保持する。 |
| legacy-2016-autumn-am-18-switch | 0：0〜0 | 0：固定0。プロセスA・OS・プロセスBの状態と割込みからの切替え順を描き、OSの処理a・b・cは空欄のまま保持する。 |
| legacy-2016-autumn-am-21-circuit | 0：0〜0 | 0：固定0。共通アノード、Vcc、独立した抵抗を介するP0〜P7とa〜g・Dtの接続、消灯／点灯の凡例を保持する。 |
| legacy-2016-autumn-am-21-led | 0：6〜255 | 0：8ビットの点灯マスク。bit0〜6はa〜g、bit7はDtに対応し、1を塗りつぶして点灯、0を白抜きで消灯とする。出力ポートのビット値とは別の描画用点灯状態である。 |
| legacy-2016-autumn-am-23-gates | 0：0〜5、1：0〜5、2：0〜5、3：0〜1、4：0〜4 | 0〜2：A・B、B・C、A・Cを入力とする各ゲート。3：第1・第2ゲートの出力を結ぶゲート。4：その出力と第3ゲートの出力を結ぶ最終ゲート。種類は0=AND、1=OR、2=XOR、3=NAND、4=NOR、5=XNORで、完全な登録tupleだけを許す。 |
| legacy-2016-autumn-am-31-stack | 0：1〜5 | 0：装置Aが扱う下位層の数1・2・3・5。ノードの5層と二つのLANセグメントを固定し、装置Aの最上位層まで上がって戻る破線のデータ経路を同期する。 |
| legacy-2016-autumn-am-34-ntp | 0：100〜200、1：200〜1000、2：400〜1200、3：900〜1500 | 0：PCの問合せ送信、1：サーバの問合せ受信、2：サーバの応答送信、3：PCの応答受信の各時刻のマイクロ秒部分。aa:bb:cc.の後に6桁で表示し、問合せ・応答の矢印と本文の時刻を同じ条件へ結び付ける。 |
| legacy-2016-autumn-am-marketing | 0：0〜0、1：0〜0 | 0・1：固定0。4Pと4Cの左右の枠、四つの小枠、同じ高さを結ぶ4本の矢印とa〜dを保持する。問うa〜dの位置は本文で指定し、図に正答語を埋めない。 |
| legacy-2016-autumn-am-bom | 0：0〜11、1：10〜20、2：1〜3、3：1〜2、4：1〜2、5：5〜10 | 0：査読した12条件の番号。1：製品Aの生産数、2：A直下のB数、3：A直下のC数、4：B直下のC数、5：Cの在庫数。D・Eを含む部品木の構造を保持し、本文の生産数・在庫と同じtupleを使う。 |
| legacy-2016-autumn-am-oc | 0：0〜3、1：0〜9、2：0〜2、3：1〜3、4：2〜4 | 0：図の役割0=非交差・cラベル逆順、1=非交差・cラベル昇順、2=交差・cラベル昇順、3=交差・cラベル逆順。1：査読した10条件の番号。2〜4：本文に示す三つの合格判定個数c。図の座標を原資料のN・nの測定値とせず、軸・曲線とラベルの対応を保持する。 |
| legacy-2016-autumn-am-inventory | 0：0〜9、1：100〜200、2：20〜50、3：60〜140、4：46〜120 | 0：査読した10条件の番号。1：模式図の最大在庫量の描画値、2：安全在庫S、3：発注点K、4：予測在庫X。原条件0は記号だけを表示し、生成条件1〜9は本文のS・Xと図のKへ数値を示す。最大在庫量の描画値を解答に必要な隠れた数値条件とせず、定量発注の同じ傾き、発注／納品、発注量E、調達期間、①と矢印を保持する。 |
| legacy-2016-autumn-am-common-symbols | 0：0〜0 | 0：固定0。共通表記p3の9種類の論理回路記号、反転出力の注記と6種類の回路記号を、図記号と説明の2列表として保持する。 |
| legacy-2017-pm2-temperature-monitor | 0：0〜2、1：0〜4 | 0：LED条件0〜2、1：原資料の単位0〜4（選択注意・構成図・LED・I/O動作表・割込み流れ）。登録した組合せだけを描く。 |
| legacy-2017-pm4-wireless-timing | 0：0〜0 | 0：固定の通信時系列図。W1/W2の位置と送受信・ACKの矢印、手順の注記を保持。 |
| legacy-2017-pm5-relations | 0：0〜0 | 0：固定の購買システム関係図。発注登録と注文書出力、担当範囲と矢印を保持。 |
| legacy-2017-pm5-operation | 0：0〜0 | 0：固定の購買システム操作の流れ。業務担当と順序を保持。 |
| legacy-2017-pm5-screen | 0：0〜0 | 0：固定の一覧画面。原の欄・配置・ページ指定を保持。 |
| legacy-2017-pm5-order | 0：4〜6 | 0：1ページの出力件数（4〜6）。原の用紙と出力項目を同じ位置へバインド。 |
| legacy-2017-pm5-flow | 0：0〜0 | 0：固定の出力準備処理の流れ図。原の同じ空欄・分岐を保持。 |
| legacy-2017-pm5-testdata | 0：0〜1 | 0：グループ件数の2条件。原の段付き表とテストデータ項目を保持。 |
| legacy-2017-pm6-unit | 0：0〜32、1：0〜3、2：0〜3 | 0：原33単位のうち登録した14単位の位置、1：外部設計工数の4条件、2：表3の独立与件4条件。表・網掛け・分数・全解答群を同じ条件で表示。 |
| legacy-2017-pm7-inventory | 0：0〜6、1：0〜5、2：0〜2、3：0〜1 | 0：決定表/単一択/在庫表/本文枠/全解答群のkind0〜6、1：単位内の項目、2：商品群の3条件、3：数量の2条件。登録済み結合tupleだけを許す。 |
| legacy-2017-pm8-graph | 0：0〜7 | 0：7地点9双方向辺の距離8条件。図・距離行列・追跡値を同期。 |
| legacy-2017-pm8-program | 0：0〜0 | 0：固定48行の空欄付き疑似言語と制御枠。プログラムを実行せず表示する。 |
| legacy-2017-pm8-common-notation | 0：0〜0 | 0：共通疑似言語の原p3、宣言・注釈・処理の固定資料。問題本文とは素材条件を分ける。 |
| legacy-2017-pm8-common-operators | 0：0〜0 | 0：共通疑似言語の原p4、演算子と優先順位の固定資料。問題本文とは素材条件を分ける。 |
| legacy-2017-pm9-mark-sheet | 0：0〜7 | 0：C言語の採点プログラムの8入力条件。原マークシートの欄と選択状態を表示。 |
| legacy-2017-pm9-bit-layout | 0：0〜7 | 0：16bitの入力と配置の8条件。原のビット位置と前提を保持。 |
| legacy-2017-pm9-abc-bank | 0：0〜7 | 0：採点条件の8入力。a〜c共通8択を原の2列で常時表示。 |
| legacy-2017-pm9-d-bank | 0：0〜7 | 0：採点条件の8入力。dの原4択を原の2列で常時表示。 |
| legacy-2017-pm9-e-bank | 0：0〜7 | 0：採点条件の8入力。eの原3択の文章を常時表示。 |
| legacy-2017-pm9-unordered-example | 0：0〜7 | 0：順不同回答を採点する処理例の8条件。原解答形式と採点の題材を区別する。 |
| legacy-2017-pm9-marking-trace | 0：0〜7 | 0：採点処理追跡の8条件。無効・過剰マークの条件を同期。 |
| legacy-2017-pm9-result-options | 0：0〜7 | 0：採点結果の8条件。原の縦3セル配列・全6択を保持。 |
| legacy-2017-pm9-g-bank | 0：0〜7 | 0：採点条件の8入力。gの原4択を原の2列で常時表示。 |
| legacy-2017-pm10-slip-record | 0：0〜2 | 0：四半期開始月の3条件。原伝票レコードの欄と順を保持。 |
| legacy-2017-pm10-master-record | 0：0〜2 | 0：四半期開始月の3条件。原マスタレコードの欄と順を保持。 |
| legacy-2017-pm10-program | 0：0〜2 | 0：四半期開始月の3条件。原54行のCOBOLと行番号・空欄を表示。実行しない。 |
| legacy-2017-pm10-choice-group | 0：0〜2、1：0〜5 | 0：四半期開始月の3条件、1：6解答群の位置。原の記号・列構成を保持。 |
| legacy-2017-pm10-output | 0：0〜2 | 0：四半期開始月の3条件。4四半期と月境界、原出力項目を同期。 |
| legacy-2017-pm10-changes | 0：0〜2 | 0：四半期開始月の3条件。原のプログラム変更箇所を保持。 |
| legacy-2017-pm11-tariffs | 0：0〜2 | 0：料金・使用量の3条件。原料金表の区分と項目を同期。 |
| legacy-2017-pm11-output | 0：0〜2 | 0：料金・使用量の3条件。原出力例を同じ計算条件で表示。 |
| legacy-2017-pm11-program | 0：0〜2、1：0〜5 | 0：料金・使用量の3条件、1：6個のJavaプログラムの位置。原の行・空欄を保持し、実行せず表示。 |
| legacy-2017-pm11-choice-group | 0：0〜2、1：0〜5 | 0：料金・使用量の3条件、1：6解答群の位置。原の列・記号を常時表示。 |
| legacy-2017-pm11-discounts | 0：0〜2 | 0：料金・使用量の3条件。原割引表の区分と項目を保持。 |
| legacy-2017-pm12-storage64 | 0：0〜7 | 0：加算する数値の8条件。原の64bit整数の4語の格納方法は固定。 |
| legacy-2017-pm12-program-add64 | 0：0〜7 | 0：数値の8入力。原ADD64の24行・番号・a2個/b/c各1個の矩形空欄を保持。 |
| legacy-2017-pm12-ab-bank | 0：0〜7 | 0：数値の8入力。a/b共通5択を原の3列、末尾2択として常時表示。 |
| legacy-2017-pm12-c-bank | 0：0〜7 | 0：数値の8入力。cの原3択を3列で常時表示。 |
| legacy-2017-pm12-values | 0：0〜7 | 0：加算する4語の数値8条件。上位/下位語と桁上がり有無を原の欄へバインド。 |
| legacy-2017-pm12-d-bank | 0：0〜7 | 0：数値の8入力。dの原6択を3列で表示し、数値条件と同期。 |
| legacy-2017-pm12-storage32 | 0：0〜7 | 0：加算する数値の8条件。原の32bit整数の2語の格納方法は固定。 |
| legacy-2017-pm12-program-mul32 | 0：0〜7 | 0：数値の8入力。原MUL32の41非空行・e/f矩形空欄・右側注記とまとめ括弧を保持。 |
| legacy-2017-pm12-ef-bank | 0：0〜7 | 0：数値の8入力。e/f共通8択を3列、末尾2択として常時表示。 |
| legacy-2017-pm13-rate-sheet | 0：0〜7 | 0：重量・箱・数量・発送先の8条件。原料金表の区分・セル位置を保持。 |
| legacy-2017-pm13-product-sheet | 0：0〜7 | 0：重量・箱・数量・発送先の8条件。原商品表の同じセルへ値を対応。 |
| legacy-2017-pm13-weight-sheet | 0：0〜7 | 0：重量・箱・数量・発送先の8条件。原重量区分の表を同じ条件で表示。 |
| legacy-2017-pm13-calculation-sheet | 0：0〜7 | 0：重量・箱・数量・発送先の8条件。原計算例のセルと参照関係を同期。 |
| legacy-2017-pm13-a-equation | 0：0〜7 | 0：数値の8条件。原の式全文とaの矩形空欄を元の式位置へ表示。可視見出しは追加しない。 |
| legacy-2017-pm13-a-bank | 0：0〜7 | 0：数値の8条件。aの原6択を単列で常時表示。 |
| legacy-2017-pm13-b-equation | 0：0〜7 | 0：数値の8条件。原の式全文とbの矩形空欄を元の式位置へ表示。可視見出しは追加しない。 |
| legacy-2017-pm13-cd-equation | 0：0〜7 | 0：数値の8条件。原の式全文とc/dの矩形空欄を元の式位置へ表示。可視見出しは追加しない。 |
| legacy-2017-pm13-b-bank | 0：0〜7 | 0：数値の8条件。bの原4択を単列で常時表示。 |
| legacy-2017-pm13-c-bank | 0：0〜7 | 0：数値の8条件。cの原4択を単列で常時表示。 |
| legacy-2017-pm13-d-bank | 0：0〜7 | 0：数値の8条件。dの原4択を単列で常時表示。 |
| legacy-2017-pm13-packing-sheet | 0：0〜7 | 0：重量・箱・数量・発送先の8条件。原梱包指示例を同じ条件で表示。 |
| legacy-2017-pm13-macro | 0：0〜7 | 0：重量・箱・数量・発送先の8条件。原31行・7ループ・1条件分岐・e/f空欄を持つマクロを実行せず表示。 |
| legacy-2017-pm13-e-bank | 0：0〜7 | 0：数値の8条件。eの原4択を単列で常時表示。 |
| legacy-2017-pm13-f-bank | 0：0〜7 | 0：数値の8条件。fの原4択を単列で常時表示。 |
| legacy-2017-autumn-pm1-session | 0：0〜2 | 0：SSH利用の登録済み3条件の識別子。基準図：図1 SSHセッションの流れ。時間は右向きに進む。SSHセッション開始から終了までの全期間をSSHセッションとし，安全な通信経路の確立，利用者認証，ログインセッションの3区間をこの順に置く。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm2-updates | 0：0〜3 | 0：排他制御の登録済み4条件の識別子。基準図：図1　二つのプロセスが共有データに対して更新処理を行う例。コンピュータX内で左のp1と右のp2が共有メモリのデータyを使う。各更新処理は①共有データの読込み，②読み込んだ値の更新，③共有データへの更新結果の書出しの順。共有データyから両プロセスへの読込み矢印と，各プロセスからyへの書出し矢印を区別する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm2-semaphore | 0：0〜3 | 0：排他制御の登録済み4条件の識別子。基準図：図2　セマフォ変数Sを利用した更新処理。共有メモリにセマフォ変数Sと共有データyを置く。左のp3も右のp4もP操作，更新処理，V操作の順。P操作/V操作からSへの破線矢印はSへの操作を表し，更新処理とyの間の実線両矢印はyへのアクセスを表す。更新処理1と更新処理2は図1と同じ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm3-database | 0：0〜2 | 0：会員販売データの登録済み3条件の識別子。基準図：会員表，販売表，販売明細表，商品表の4表。会員番号，伝票番号，販売明細表の伝票番号と商品番号，商品表の商品番号をそれぞれ主キーとして下線で示す。各表の列とデータ格納例を表示する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm3-sale-detail | 0：0〜2 | 0：会員販売データの登録済み3条件の識別子。基準図：販売明細表の伝票番号と商品番号が主キー。個数に加え，販売時単価を持つ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm3-inbound | 0：0〜2 | 0：会員販売データの登録済み3条件の識別子。基準図：入荷表は入荷番号と商品番号の複合主キーを下線で示し，ほかに入荷日と入荷数を持つ。ビュー入荷集計表は主キーの商品番号を下線で示し，入荷総数を持つ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm3-views | 0：0〜2 | 0：会員販売データの登録済み3条件の識別子。基準図：ビュー販売集計表とビュー在庫表はどちらも主キーの商品番号を下線で示す。ほかの列は販売総数と在庫数。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm4-network | 0：0〜3 | 0：呼量・通話・オペレータの登録済み4条件の識別子。基準図：コールセンタ内の顧客情報，コール，着信分配情報の3サーバからなるVoIPサーバ群，レイヤ3スイッチ，電話端末とPCからなる複数のオペレータ席，音声ゲートウェイの接続構成。音声ゲートウェイは公衆電話網を経由して複数の顧客電話機へ接続する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm4-sequence | 0：0〜3 | 0：呼量・通話・オペレータの登録済み4条件の識別子。基準図：顧客電話機，a1，a2，a3，電話端末の5オブジェクトを左から並べる。接続要求，接続先端末問合せ，接続先状況確認と端末決定，接続先端末通知，電話端末への接続要求，逆方向の接続応答の順を示す。実線の要求と破線の応答を区別する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm4-metrics | 0：0〜3 | 0：呼量・通話・オペレータの登録済み4条件の識別子。基準図：見出し行を持たない2列3行の原表。ピーク時の着信件数（件／時），平均通話時間（分／件），平均結果記録時間（分／件）とそれぞれの値を表示する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-selection | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：選択した問題は，選択欄の（選）をマークしてください。マークがない場合は，採点されません。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-er | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：図1　関係データベースのE-R図。7表：消込（a，消込充当額，消込日），入金（主キー入金番号，得意先ID，入金額，入金日，充当額），商品（主キー商品コード，商品名，単価），月間買上げ（主キー月間買上げ番号，得意先ID，買上げ年月，月間買上げ額，消込額），得意先（主キー得意先ID，得意先名，住所，電話番号），買上げ（主キー買上げ伝票番号，買上げ日，得意先ID，月間買上げ番号），買上げ明細（複合主キー買上げ伝票番号と明細番号，商品コード，数量，買上げ金額）。矢印は1対多を示す。得意先→入金/月間買上げ/買上げ，入金→消込，月間買上げ→消込/買上げ，商品→買上げ明細，買上げ→買上げ明細。属性名の実線の下線は主キーを示す。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-table1 | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：表1　各表の説明。得意先：得意先の情報。商品：E社が取り扱う商品の情報。買上げ：1伝票単位の買上げ情報。買上げ明細：1伝票を構成する商品単位の買上げ情報。月間買上げ：得意先の月間買上げ額と，月間買上げ額に対して充当された金額（消込額）に関する情報。入金：得意先からの入金額と，その入金を月間買上げに充当した金額（充当額）に関する情報。消込：ある入金からある月間買上げに対して，充当した金額（消込充当額）の情報。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-table2 | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：表2　主な表の属性の説明。月間買上げ：月間買上げ額：ある得意先の，ある年月1か月分の買上げ金額。月間買上げ：消込額：月間買上げ額のうち，既に充当された金額。入金：入金額：ある得意先から入金された金額。入金：充当額：入金額のうち，月間買上げに既に充当した金額。消込：消込充当額：ある入金からある月間買上げに対して，消込み処理で充当した金額。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-instruction1 | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：設問1　図1中の空欄に入れる属性の組みとして適切な答えを，解答群の中から選べ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-bank-a | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：aに関する解答群。ア 消込番号，月間買上げ番号。イ 消込番号，入金番号。ウ 得意先ID，消込番号。エ 得意先ID，月間買上げ番号。オ 得意先ID，入金番号。カ 入金番号，月間買上げ番号。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-instruction2 | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：設問2　図2は，消込み処理の流れ図である。次の記述及び図2中の空欄に入れる適切な答えを，解答群の中から選べ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-description | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：図2中のαの部分では，入金表から［b］の条件を満たすレコードを，得意先IDの昇順，入金日の昇順に整列して取得する。消込み①の繰返し処理では，取得したレコードを順に処理する。βの部分では，消込み①の繰返しで処理中のレコードの得意先IDと同じ得意先IDをもつ月間買上げ表のレコードのうち，［c］の条件を満たすレコードを，［d］に整列して取得する。消込み②の繰返し処理では，取得したレコードを順に処理する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-flow | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：図2　消込み処理の流れ図。開始。・入金表から，［b］の条件を満たすレコードを整列して取得する。・αで取得したレコードのうち先頭のものを[入金]とする。消込み① [入金]がない。・月間買上げ表から，[入金].得意先IDと同じ得意先IDをもち，［c］の条件を満たすレコードを整列して取得する。・βで取得したレコードのうち先頭のものを[月間買上げ]とする。・変数1 ← ［e］。消込み② [月間買上げ]がない。・変数2 ← ［f］。変数1 ＞ 変数2。・[月間買上げ].消込額 ← [月間買上げ].月間買上げ額 ・[月間買上げ]で月間買上げ表を更新する ・[入金].充当額 ← [入金].充当額＋変数2 ・[入金]で入金表を更新する ・消込表に，変数2の値を消込充当額として，消込みに使用した入金と月間買上げの情報をもつレコードを登録する ・変数1 ← 変数1−変数2。・[月間買上げ].消込額 ← [月間買上げ].消込額＋変数1 ・[月間買上げ]で月間買上げ表を更新する ・[入金].充当額 ← [入金].入金額 ・[入金]で入金表を更新する ・消込表に，変数1の値を消込充当額として，消込みに使用した入金と月間買上げの情報をもつレコードを登録する。・βで取得したレコードのうち次のものを[月間買上げ]とする。消込み②。・αで取得したレコードのうち次のものを[入金]とする。消込み①。終了。αは入金選択，βは月間買上げ選択を指す。[X]はX表の処理中のレコード，[X].Yはその属性を表す。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-bank-b | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：bに関する解答群。ア 入金額＝充当額。イ 入金額＞充当額。ウ 入金額＜充当額。エ 充当額＝0。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-bank-c | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：cに関する解答群。ア 月間買上げ額＞0。イ 月間買上げ額＞消込額。ウ 消込額＝0。エ 消込額＞0。オ 消込額＝月間買上げ額。カ 消込額＞月間買上げ額。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-bank-d | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：dに関する解答群。ア 買上げ年月の降順。イ 買上げ年月の昇順。ウ 消込額の降順。エ 月間買上げ額の昇順。オ 得意先IDの昇順。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm5-bank-ef | 0：0〜3 | 0：買上げ・入金・月次集計の登録済み4条件の識別子。基準図：e，fに関する解答群。ア [月間買上げ].月間買上げ額＋[月間買上げ].消込額。イ [月間買上げ].月間買上げ額−[月間買上げ].消込額。ウ [月間買上げ].消込額−[月間買上げ].月間買上げ額。エ [入金].入金額＋[入金].充当額。オ [入金].入金額−[入金].充当額。カ [入金].充当額−[入金].入金額。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-selection | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：選択した問題は，選択欄の（選）をマークしてください。マークがない場合は，採点されません。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-table1 | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：表1　B社サービスに関する2015〜2017年度の3年度分の予算と実績。単位 千円。人件費：3,000，3,500，2,800，3,000，4,000，4,400。サーバ費：1,200，1,250，1,250，1,400，1,400，1,250。PC費：500，500，500，500，640，640。ネットワーク費：200，220，250，240，250，250。その他経費：1,000，1,200，1,000，1,100，1,000，1,000。合計：5,900，6,670，5,800，6,240，7,290，7,540。各年度の予算，実績の順。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-bank-trend | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：解答群。ア 人件費の実績は，3年度とも，各年度の実績の合計の過半を占めている。。イ サーバ費の実績は，2年度連続で上がっている。。ウ PC費の実績は，2016年度の前年度に対する増分よりも，2017年度の前年度に対する増分の方が小さい。。エ ネットワーク費の予算は2年度連続で下がっているが，ネットワーク費の実績は2年度連続で上がっている。。オ その他経費は，各費目中で，予算も実績も2015年度は2番目に大きい費目であったが，2017年度は3番目に大きい費目となっている。。カ 各費目の実績の合計は，3年度とも，各費目の予算の合計を上回っている。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-instruction2 | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：設問2　B社サービスに関する2018年度の予算について次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-table2 | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：表2　B社サービスに関する2018年度の予算。単位 千円。人件費とPC費は網掛けで非表示。サーバ費1,300，ネットワーク費は空欄a，その他経費1,100，合計6,300。注記 網掛けの部分は表示していない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-comparison | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：2018年度の各費目の予算が予算の合計に占める割合を，2017年度の各費目の実績が実績の合計に占める割合と比較すると，［b］。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-bank-a | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：aに関する解答群。ア 220。イ 230。ウ 240。エ 250。オ 260。カ 270。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-bank-b | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：bに関する解答群。ア サーバ費の割合とその他経費の割合が上がって，それら以外の費目の割合が下がっている。イ サーバ費の割合とその他経費の割合が下がって，それら以外の費目の割合が上がっている。ウ 人件費の割合が上がって，それ以外の費目の割合が下がっている。エ 人件費の割合が下がって，それ以外の費目の割合が上がっている。オ 人件費の割合とサーバ費の割合が上がって，それら以外の費目の割合が下がっている。カ 人件費の割合とサーバ費の割合が下がって，それら以外の費目の割合が上がっている。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-instruction3 | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：設問3　2018年度の提示価格に関する次の記述中の［ ］に入れる適切な答えを，解答群の中から選べ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-pricing | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：営業部では，運用サービス部が作成した予算を基に，利益率が10%となるようにB社サービスの提示価格を算出した。2018年度の提示価格は，［c］千円となった。ここで，利益率は，提示価格から予算を引いた額を提示価格で割った値であり，100を乗じて%表示する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-reduction | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：運用サービス部と営業部で検討した結果，サービスレベルの変更についてB社と合意できれば，その他経費を10%，人件費を5%削減できることが分かった。この場合，2018年度の予算の合計は［d］削減となり，要求価格と同額を提示価格とすると，利益率は［e］。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-automation | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：また，作業の一部を自動化することによって，人件費を先の5%と合わせて15%削減できることが分かった。ただし，この場合には，サーバ費については5%上がる見込みである。運用サービス部では，先のその他経費の10%削減と合わせてB社サービスの2018年度の予算を再度作成した。このとき，提示価格を要求価格と同額にすると，利益率は［f］%になる。ここで，%表示する値は，利益率に100を乗じて小数第2位で四捨五入したものである。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-bank-c | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：cに関する解答群。ア 5,670。イ 6,300。ウ 6,930。エ 7,000。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-bank-d | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：dに関する解答群。ア 10%未満の。イ 10%の。ウ 10%よりも大きな。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-bank-e | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：eに関する解答群。ア 上がる。イ 変わらない。ウ 下がるがゼロ以下にはならない。エ 下がってゼロになる。オ 下がってマイナスになる。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm6-bank-f | 0：0〜3 | 0：工数・予算・提示価格の登録済み4条件の識別子。基準図：fに関する解答群。ア 5.5。イ 6.1。ウ 7.1。エ 7.9。オ 8.0。カ 8.9。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-selection | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：選択した問題は，選択欄の（選）をマークしてください。マークがない場合は，採点されません。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-instruction1 | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：設問1　システム要件を実現（以下，システム化という）するための開発費と年間効果の試算に関する次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。ここで，c1とc2に入れる答えは，cに関する解答群の中から組合せとして正しいものを選ぶものとする。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-table1 | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：表1　年間効果を試算するための条件。試算条件/現状値/将来値。注文に対して提出される注文請書枚数（枚／日）：200：200。注文請書の誤りの発生枚数（枚／日）：18：3。注文請書と注文書との目視での照合及び再照合の作業に要する時間（分／枚）：5：0。誤りが見つかった注文請書の再提出の依頼作業に要する時間（分／枚）：10：5。作業に要する人件費（円／時間）：1400：1400。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-estimation | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：(3) 表1の将来値を設定するに当たり，注文請書と注文書との目視での照合及び再照合の作業に要する時間は，システム化によって［a］と想定した。また，仕入先がWebを介して注文書の確認と注文請書の送信を行うことによって，注文請書の誤りの発生枚数は［b］と想定した。1年当たりの稼働日数を240日とすると，現状で注文請書の確認，再提出依頼及び再照合の作業に要する年間費用は［c1］千円であり，システム化された場合は［c2］千円となって，この差額が年間効果となる。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-table2 | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：表2　システム要件に対する年間効果の試算と分類の結果。単位 千円。SYS901：システム要件は網掛けで非表示，開発費5800，年間効果4800，必須要件。SYS902：システム要件は網掛けで非表示，開発費6200，年間効果7320，必須要件。SYS903：システム要件は網掛けで非表示，開発費1200，年間効果670，要望要件。SYS904：仕入先からの注文請書を購買管理システムで処理できるようにする，開発費12400，年間効果網掛けで非表示，必須要件。SYS905：システム要件は網掛けで非表示，開発費2750，年間効果1640，要望要件。SYS906：システム要件は網掛けで非表示，開発費4300，年間効果520，要望要件。SYS907：システム要件は網掛けで非表示，開発費1630，年間効果1280，要望要件。SYS908：システム要件は網掛けで非表示，開発費1800，年間効果2160，要望要件。注記 網掛けの部分は表示していない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-bank-ab | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：a，bに関する解答群。ア 増加する。イ 減少するがゼロにならない。ウ 不要になる。エ 変わらない。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-bank-c | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：cに関する解答群。ア 6,608，84。イ 6,608，6,524。ウ 7,028，6,524。エ 7,112，84。オ 7,112，7,028。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-instruction2 | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：設問2　開発費と年間効果の評価に関する次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-scatter | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：図1　要望要件に分類したシステム要件の年間効果と効果率。横軸は年間効果（千円）0〜3000，500刻みで0〜2500の数値を表示。縦軸は効果率0.00〜1.40，0.20刻み。5点のうちSYS906とSYS908の名称だけ表示，他3点の名称は網掛けで非表示。注記 網掛けの部分は表示していない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-case905 | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：① SYS905を採用したとき，開発費の予算を考えると［d］。この場合，開発費の総額は28,950千円となり，年間効果は22,948千円となる。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-case907 | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：② 一方，SYS907を採用したとき，開発費の予算を考えると［e］。この場合，開発費の総額は29,030千円となり，年間効果は23,258千円となる。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-decision | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：(1)，(2)の評価の結果，開発費が予算に収まり，年間効果を最大にするには，要望要件はSYS908に加えて［f］を採用すればよい。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-bank-d | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：dに関する解答群。ア SYS903もSYS907も採用できる。イ SYS903もSYS907も採用できない。ウ SYS903は採用できるが，SYS907は採用できない。エ SYS907は採用できるが，SYS903は採用できない。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-bank-e | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：eに関する解答群。ア SYS903もSYS905も採用できる。イ SYS903もSYS905も採用できない。ウ SYS903は採用できるが，SYS905は採用できない。エ SYS905は採用できるが，SYS903は採用できない。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm7-bank-f | 0：0〜3 | 0：業務量・単価・改善効果の登録済み4条件の識別子。基準図：fに関する解答群。ア SYS903とSYS905。イ SYS903とSYS907。ウ SYS905。エ SYS907。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-required | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：次の問8は必須問題です。必ず解答してください。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-characters | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：表1　文字，及び文字に割り当てた数値。␣=0，.=1，,=2，?=3，a=4，b=5，c=6，d=7，e=8，f=9，g=10，h=11，i=12，j=13，k=14，l=15，m=16，n=17，o=18，p=19，q=20，r=21，s=22，t=23，u=24，v=25，w=26，x=27，y=28，z=29。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-arguments-calc | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：表2　関数calcCheckCharacterの引数及び返却値の仕様。input[]：文字型：入力：文字列が格納されている1次元配列。len：整数型：入力：文字列の文字列長（1以上）。返却値：文字型：出力：生成した検査文字を返す。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-arguments-validate | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：表3　関数validateCheckCharacterの引数及び返却値の仕様。input[]：文字型：入力：検査文字付文字列が格納されている1次元配列。len：整数型：入力：検査文字付文字列の文字列長（2以上）。返却値：論理型：出力：検査文字付文字列に誤りがないと判定した場合はtrue，誤りがあると判定した場合はfalseを返す。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-instruction1 | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：設問1　プログラム中の［ ］に入れる正しい答えを，解答群の中から選べ。ここで，a1とa2に入れる答えは，aに関する解答群の中から組合せとして正しいものを選ぶものとする。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-program | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：〔プログラム〕。○文字型関数： calcCheckCharacter(文字型： input[], 整数型： len) ○整数型： N, sum, i, value, check&#95;value ○論理型： is&#95;even ・N ← 30 ・sum ← 0 ・is&#95;even ← false i: len, i ＞ 0, −1 ・value ← getValue(input[i]) is&#95;even ＝ ［a1］ ・sum ← sum ＋ value ・sum ← sum ＋ (value × 2) ÷ N ＋ (value × 2) % N  ・is&#95;even ← not is&#95;even  ・check&#95;value ← ［b］ ・return getChar(check&#95;value)  ○論理型関数： validateCheckCharacter(文字型： input[], 整数型： len) ○整数型： N, sum, i, value ○論理型： is&#95;odd, ret&#95;value ・N ← 30 ・sum ← 0 ・is&#95;odd ← true ・ret&#95;value ← true i: len, i ＞ 0, −1 ・value ← getValue(input[i]) is&#95;odd ＝ ［a2］ ・sum ← sum ＋ value ・sum ← sum ＋ (value × 2) ÷ N ＋ (value × 2) % N  ・is&#95;odd ← not is&#95;odd  ［c］ ・ret&#95;value ← false  ・return ret&#95;value。両関数に回数指定繰返し■，条件▲/▼とelse枝。検証末尾に条件cの▲/▼。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-bank-a | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：aに関する解答群。ア false，false。イ false，true。ウ true，false。エ true，true。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-bank-b | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：bに関する解答群。ア N − sum % N。イ sum % N。ウ (N − sum % N) % N。エ (sum − N) % N。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-bank-c | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：cに関する解答群。ア sum ÷ N ＝ 0。イ sum ÷ N ≠ 0。ウ sum % N ＝ 0。エ sum % N ≠ 0。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-instruction2 | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：設問2　次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-cases | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：本プログラムでは，検査文字付文字列の誤りが1文字であれば，誤りを検出できる。しかし，複数の文字に誤りがある場合には，誤りがないと判定されることがある。例えば，関数validateCheckCharacterで表4に示す検査文字付文字列を検証した場合，誤りがないと判定されるケースは［d］。ここで，文字列ipa␣␣に対し生成される検査文字はfである。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-cases-table | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：表4　検査文字付文字列。1 ipb␣␣f。2 api␣␣f。3 pia␣␣f。4 ␣␣apif。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-bank-d | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：dに関する解答群。ア 1と2と3と4である。イ 2である。ウ 2と3である。エ 2と3と4である。オ 2と4である。カ ない。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-instruction3 | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：設問3　次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-grid-initial | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：図1　作成中の検査文字付表。5行6列。1〜4行1〜5列の境界は太線。1行 i，p，a，␣，␣，未記入。2行 t，e，s，t，s，未記入。3行 m，a，k，e，␣，未記入。4行 i，t，.，␣，␣，未記入。5行 未記入，未記入，未記入，未記入，未記入，未記入。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-create | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：例えば，文字列長が5である4個の文字列ipa␣␣，tests，make␣，it.␣␣を，図1の太枠内のように，各文字列の先頭の位置を最左列に揃え，各文字列を上の行から順に格納して，表を作成する。この表の太枠内の各行各列をそれぞれ文字列とみなして検査文字を生成し，最右列と最下行に格納する。この手順で作成した検査文字付表を図2に示す。作成した検査文字付表の5行5列目（網掛け部分）の検査文字は［e］である。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-grid-complete | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：図2　完成した検査文字付表。5行6列。1〜4行1〜5列の境界は太線。1行 i，p，a，␣，␣，f。2行 t，e，s，t，s，i。3行 m，a，k，e，␣，n。4行 i，t，.，␣，␣，h。5行 r，a，v，b，網掛けで非表示，未記入。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-bank-e | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：eに関する解答群。ア j。イ k。ウ l。エ m。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-instruction4 | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：設問4　次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-replacement | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：図2の1行目の検査文字付文字列を取り除いた，図3の検査文字付表について考える。表4のケース1〜4の検査文字付文字列を順に，図3の1行目に格納して検証した場合，検査文字付表に誤りがないと判定されるケースは［f］。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-grid-removed | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：図3　1行目を取り除いた検査文字付表。5行6列。1〜4行1〜5列の境界は太線。1行 未記入，未記入，未記入，未記入，未記入，未記入。2行 t，e，s，t，s，i。3行 m，a，k，e，␣，n。4行 i，t，.，␣，␣，h。5行 r，a，v，b，網掛けで非表示，未記入。注記 5行5列目（網掛け部分）には，設問3の正しい答えが入っているものとする。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm8-bank-f | 0：0〜3 | 0：検査文字・誤り検出の登録済み4条件の識別子。基準図：fに関する解答群。ア 1と2と3と4である。イ 2である。ウ 2と3である。エ 2と3と4である。オ 2と4である。カ ない。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm9-examples | 0：0〜3 | 0：回文入力・反復回数の登録済み4条件の識別子。基準図：表1 本問のプログラムが表示する回文の例。原の位置に空欄a〜e、全55行と変更表6項目を保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm9-program | 0：0〜3 | 0：回文入力・反復回数の登録済み4条件の識別子。基準図：プログラム。原の位置に空欄a〜e、全55行と変更表6項目を保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm9-bank | 0：0〜3、1：0〜6 | 0：回文入力・反復回数の登録済み4条件の識別子。1：a〜gの群位置0〜6。基準図：aに関する解答群。ア i。イ ith - &amp;text[0]。ウ ith - &amp;text[0] + 1。エ hit - ith。オ hit - ith + 1。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm9-changes | 0：0〜3 | 0：回文入力・反復回数の登録済み4条件の識別子。基準図：表2 プログラムの変更内容。原の位置に空欄a〜e、全55行と変更表6項目を保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm9-input | 0：0〜3 | 0：回文入力・反復回数の登録済み4条件の識別子。基準図：空白を␣で示す入力：No!␣Madam,␣I'm␣Adam␣Graham.␣This␣is␣my␣gym.。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm10-record | 0：0〜5、1：0〜2 | 0：日時・駐車時間・清算料金の登録済み6条件の識別子。1：レコード位置0〜2。基準図：図1 精算ファイルのレコード様式。原の欄名・桁数、21行と43行のプログラム、空欄a/b/cを保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm10-program1 | 0：0〜5 | 0：日時・駐車時間・清算料金の登録済み6条件の識別子。基準図：プログラム1。原の欄名・桁数、21行と43行のプログラム、空欄a/b/cを保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm10-program2 | 0：0〜5 | 0：日時・駐車時間・清算料金の登録済み6条件の識別子。基準図：プログラム2。原の欄名・桁数、21行と43行のプログラム、空欄a/b/cを保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm10-bank | 0：0〜5、1：0〜5 | 0：日時・駐車時間・清算料金の登録済み6条件の識別子。1：解答群位置0〜5。基準図：解答群。ア 順呼出し（ACCESS MODE IS SEQUENTIAL）。イ 動的呼出し（ACCESS MODE IS DYNAMIC）。ウ 乱呼出し（ACCESS MODE IS RANDOM）。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm10-changes | 0：0〜5 | 0：日時・駐車時間・清算料金の登録済み6条件の識別子。基準図：表1 プログラム2の変更内容。課金単価は0〜5時/20〜23時100円、6〜19時300円。72桁の24要素表、空欄d/e/fと標識領域の注記を保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm11-example | 0：0〜7 | 0：文字列・比較・整列方向の登録済み8条件の識別子。基準図：図1 並べ替えの例。原5行から[0,4,3,2,1]の順へ5本の矢印。果物名辞書順、同名は第2列数値降順。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm11-output | 0：0〜7 | 0：文字列・比較・整列方向の登録済み8条件の識別子。基準図：図2 実行結果。apple 3 1,000／apple 2 300／banana 2 2,000／banana 1 300／cherry 1 1,000。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm11-program1 | 0：0〜7 | 0：文字列・比較・整列方向の登録済み8条件の識別子。基準図：プログラム1。a/cは2枠ずつ、b/d/eは1枠ずつ。プログラム2の指定2行にαの矢印を保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm11-program2 | 0：0〜7 | 0：文字列・比較・整列方向の登録済み8条件の識別子。基準図：プログラム2。a/cは2枠ずつ、b/d/eは1枠ずつ。プログラム2の指定2行にαの矢印を保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm11-bank | 0：0〜7、1：0〜6 | 0：文字列・比較・整列方向の登録済み8条件の識別子。1：解答群位置0〜6。基準図：aに関する解答群。ア Character, Comparator&lt;String&gt;。イ Character, String。ウ String, Comparator&lt;String&gt;。エ String, String。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm11-replacement | 0：0〜7、1：0〜1 | 0：文字列・比較・整列方向の登録済み8条件の識別子。1：設問2/3の位置0〜1。基準図：設問2の置換内容。a/cは2枠ずつ、b/d/eは1枠ずつ。プログラム2の指定2行にαの矢印を保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm12-search | 0：0〜7 | 0：数値ビット列・検索位置・置換の登録済み8条件の識別子。基準図：先頭0から末尾31のα、位置pからnビットの部分とβとの照合を示す概念図。pは未指定の記号。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm12-program1 | 0：0〜7 | 0：数値ビット列・検索位置・置換の登録済み8条件の識別子。基準図：プログラム1。原28行/43行と全注記、空欄a/b/c/d、数値の即値・アドレス・ビット操作だけを保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm12-question | 0：0〜7、1：0〜2 | 0：数値ビット列・検索位置・置換の登録済み8条件の識別子。1：指示位置0〜2。基準図：設問1の問い。原28行/43行と全注記、空欄a/b/c/d、数値の即値・アドレス・ビット操作だけを保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm12-bank | 0：0〜7、1：0〜5 | 0：数値ビット列・検索位置・置換の登録済み8条件の識別子。1：解答群位置0〜5。基準図：aに関する解答群。ア AND GR7,GR2。イ OR GR7,GR2。ウ SLL GR7,0,GR2。エ SRL GR7,0,GR2。オ XOR GR7,GR2。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm12-replacement | 0：0〜7 | 0：数値ビット列・検索位置・置換の登録済み8条件の識別子。基準図：設問2の置換命令。原28行/43行と全注記、空欄a/b/c/d、数値の即値・アドレス・ビット操作だけを保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm12-program2 | 0：0〜7 | 0：数値ビット列・検索位置・置換の登録済み8条件の識別子。基準図：プログラム2。原28行/43行と全注記、空欄a/b/c/d、数値の即値・アドレス・ビット操作だけを保持。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm12-input | 0：0〜7 | 0：数値ビット列・検索位置・置換の登録済み8条件の識別子。基準図：α=#FFF3,#7FFF、β=(11011)₂、n=5、γ=(11110)₂。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-log | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：ログはA時刻，B IPアドレス，C URL，D時間帯，E曜日コード，F集計キーの6列。先頭2行，省略，下端2行と最初の空行を表示。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-weekdays | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：曜日表のB〜H列に木・金・土・日・月・火・水，曜日コードは0〜6を対応させる。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-formula-a | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：セルD2に入力する式の空欄aを長方形で示す。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-bank-a | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：aの原数を保つ解答群。式やマクロ記法は表示するだけで実行しない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-aggregate | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：集計表は月〜日の7行と0〜23時の24列のうち原と同じ列だけ表示し，中間列を省略記号で示す。右端に曜日ごとの計，最下行に時間帯ごとの計。下部に最多/最少となる時間帯と曜日を表示する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-formula-b | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：条件付個数関数の検索条件に空欄bがある。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-formula-c | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：セルD17に入力する式の空欄cを長方形で示す。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-bank-b | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：bの原数を保つ解答群。式やマクロ記法は表示するだけで実行しない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-bank-c | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：cの原数を保つ解答群。式やマクロ記法は表示するだけで実行しない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-urls | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：アクセス先集計はURLとアクセス回数の2列。URLは最初に現れた順に表示し，先頭4行と省略行を示す。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-macro | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：宣言3行，log&#95;lineの初期化，外側と内側の前判定繰返し，双岐選択と3個の長方形空欄d/e/fを保持する。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-bank-d | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：dの原数を保つ解答群。式やマクロ記法は表示するだけで実行しない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-bank-e | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：eの原数を保つ解答群。式やマクロ記法は表示するだけで実行しない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2017-autumn-pm13-bank-f | 0：0〜3 | 0：対象期間・アクセスログの登録済み4条件の識別子。基準図：fの原数を保つ解答群。式やマクロ記法は表示するだけで実行しない。。本文・表・コードの位置と同じ条件を対応付ける。コードは表示のみで実行しない。 |
| legacy-2018-spring-pm1-figure-0 | 0：0〜3 | 0：b群の誤述語条件0〜3。順に衝突高頻度・文字順無視・二回連結無視・末尾一字無視という誤認を選ぶ。この図自体の保存・照合手順、パスワードと省略ハッシュ値、上下の配置と矢印は原図のまま固定する。省略値の全文を推定しない。 |
| legacy-2018-spring-pm1-bank | 0：0〜3、1：0〜4 | 0：b群の誤述語条件0〜3。順に衝突高頻度・文字順無視・二回連結無視・末尾一字無視という誤認を選ぶ。1：解答群の位置0=a（5択）、1=b、2=c、3=d、4=e（各4択）。b群の先頭誤答だけを同じ問いの役割で変更し、正答・全群の数と順は固定する。 |
| legacy-2018-spring-pm1-figure-1 | 0：0〜3 | 0：b群の誤述語条件0〜3。順に衝突高頻度・文字順無視・二回連結無視・末尾一字無視という誤認を選ぶ。この図自体のソルト生成・ソルトを左に連結・別欄保存・保存ソルトを読み出して照合する手順と省略値は原図のまま固定する。 |
| legacy-2018-spring-pm2-table-0 | 0：0〜3、1：0〜5 | 0：目標演算・既知ゲート条件0〜3。順にXOR/NAND/最終AND、XOR/OR/最終AND、XNOR/NOR/最終OR、XNOR/AND/最終OR。1：重み・しきい値の6条件0〜5。Wx/Wy/例のTは順に0.5/0.5/0.3、0.4/0.6/0.3、0.6/0.3/0.2、0.3/0.7/0.2、0.4/0.6/0.4、0.5/0.5/0.5。表1のAND・OR・NAND・NORと入力00/01/10/11の真理値は固定し、選択条件に応じて書き換えない。 |
| legacy-2018-spring-pm2-table-1 | 0：0〜3、1：0〜5 | 0：目標演算・既知ゲート条件0〜3。順にXOR/NAND/最終AND、XOR/OR/最終AND、XNOR/NOR/最終OR、XNOR/AND/最終OR。1：重み・しきい値の6条件0〜5。Wx/Wy/例のTは順に0.5/0.5/0.3、0.4/0.6/0.3、0.6/0.3/0.2、0.3/0.7/0.2、0.4/0.6/0.4、0.5/0.5/0.5。表2は位置0の目標XOR/XNORに題名と出力4行を対応させる。位置1は共通条件として受け取るが本表の出力を変えない。 |
| legacy-2018-spring-pm2-figure-0 | 0：0〜3 | 0：目標演算・既知ゲート条件0〜3。順にXOR/NAND/最終AND、XOR/OR/最終AND、XNOR/NOR/最終OR、XNOR/AND/最終OR。原の二入力が両ゲートへ分岐する配線、黒丸の接続・橋形の非接続、空欄aの位置と問いを固定する。 |
| legacy-2018-spring-pm2-bank | 0：0〜3、1：0〜5、2：0〜2 | 0：目標演算・既知ゲート条件0〜3。順にXOR/NAND/最終AND、XOR/OR/最終AND、XNOR/NOR/最終OR、XNOR/AND/最終OR。1：重み・しきい値の6条件0〜5。Wx/Wy/例のTは順に0.5/0.5/0.3、0.4/0.6/0.3、0.6/0.3/0.2、0.3/0.7/0.2、0.4/0.6/0.4、0.5/0.5/0.5。2：群位置0=a（4択）、1=b/c共有（5択）、2=d/e共有（6択）。位置0に合う回路候補と位置1に合う6組の符号付きWx/Wy/Tを本文と同期し、共有群のID・順序を保つ。 |
| legacy-2018-spring-pm2-figure-1 | 0：0〜0 | 0：固定値0。半加算器の入力X/Y、和の下位桁Z、桁上がりC、空欄b/c及び分岐・非接続交差を原どおり示す。減算器など別の問いへ変更しない。 |
| legacy-2018-spring-pm2-table-2 | 0：0〜3、1：0〜5 | 0：目標演算・既知ゲート条件0〜3。順にXOR/NAND/最終AND、XOR/OR/最終AND、XNOR/NOR/最終OR、XNOR/AND/最終OR。1：重み・しきい値の6条件0〜5。Wx/Wy/例のTは順に0.5/0.5/0.3、0.4/0.6/0.3、0.6/0.3/0.2、0.3/0.7/0.2、0.4/0.6/0.4、0.5/0.5/0.5。表3は位置1のWx×X＋Wy×Y、T及び≧で判定する出力4行を同期する。小数1桁・等号成立時1を保持し、位置0による算術変更はしない。 |
| legacy-2018-spring-pm3-figure-0 | 0：0〜1、1：0〜1 | 0：対象学年0=6年生、1=4年生。1：対象イベント0=18001、1=18002。保護者・児童・活動・イベントの4表の列、主キー下線、原のデータ格納例・縦三点の省略を固定表示する。対象学年・イベント条件を受け取るが、格納例を別のデータへ置き換えない。原表の列構成と関係を保つ。 |
| legacy-2018-spring-pm3-bank | 0：0〜1、1：0〜1、2：0〜3 | 0：対象学年0=6年生、1=4年生。1：対象イベント0=18001、1=18002。2：解答群位置0=設問1、1=a、2=b、3=c（各4択）。同じ対象学年・イベント条件をSQL候補に反映し、結合・集計・副問合せという各誤答の役割を保つ。 |
| legacy-2018-spring-pm3-figure-1 | 0：0〜2、1：0〜1、2：0〜1 | 0：SQL図の位置0=設問2のa、1=設問3のb、2=設問4のc。1：対象学年0=6年生、1=4年生。2：対象イベント0=18001、1=18002。この骨格SQL自体は条件によらず固定し、空欄・節・元の行順を保つ。対象学年とイベントの条件は該当する本文と解答群側へ反映する。図見出しは読み上げ用に保持する。 |
| legacy-2018-spring-pm4-figure-0 | 0：0〜0 | 0：固定値0。クライアント、インターネット、負荷分散装置、フロント・バック・キュー・DB・ストレージ・レプリケーション各サーバの原構成とアクセス方向を保つ。処理量の生成条件によって矢印や機器を増減しない。 |
| legacy-2018-spring-pm4-bank | 0：0〜3、1：0〜3、2：0〜3 | 0：フロントの通信処理量条件0〜3（1要求当たり0.07/0.02/0.04/0.09秒）。1：毎時投稿枚数条件0〜3（4000/2400/3200/4800枚）。2：群位置0=a、1=b、2=c（各4択）、3=設問2（5択から順不同2欄）。本文の台数計算と同期し、仮想マシンの処理前提・二欄の順不同を保つ。 |
| legacy-2018-health-system-relation | 0：0〜0 | 0：固定値0。健診情報システムの機器・利用者・通信の関係と原矢印を保持する。生成問題の他の入力をこの固定図の入力位置へ混ぜず、本文側で変わる表や条件と区別する。 |
| legacy-2018-health-record-layout | 0：0〜0 | 0：固定値0。健診記録の列と3列の複合主キー下線を保持する。生成問題の他の入力をこの固定図の入力位置へ混ぜず、本文側で変わる表や条件と区別する。 |
| legacy-2018-health-master-layouts | 0：0〜0 | 0：固定値0。4種類のマスタの列・主キー・対応を保持する。生成問題の他の入力をこの固定図の入力位置へ混ぜず、本文側で変わる表や条件と区別する。 |
| legacy-2018-health-missing-flow | 0：0〜0 | 0：固定値0。未受診者抽出処理の条件・分岐・原空欄を保持する。生成問題の他の入力をこの固定図の入力位置へ混ぜず、本文側で変わる表や条件と区別する。 |
| legacy-2018-evm-timeline | 0：0〜0 | 0：固定値0。0/1/2/4/6/10/12か月の工程とNの2〜12か月の範囲を保持する。生成問題の他の入力をこの固定図の入力位置へ混ぜず、本文側で変わる表や条件と区別する。 |
| legacy-2018-evm-plan-table | 0：1〜2 | 0：工数・規模の倍率1又は2。原の工程別の同じ位置へ基準値又はその2倍を反映する。表の時点、aを含むS1位置、網掛け、二段見出しと空欄の構造は固定する。 |
| legacy-2018-evm-status | 0：0〜3、1：1〜2 | 0：進捗・費用推移0=両方悪化、1=両方改善、2=進捗改善/費用悪化、3=進捗悪化/費用改善。1：工数・規模倍率1又は2。PV/EV/ACの線種・マーカー、αのCVとβのSVの対応を保持し、選択した推移を示す。原図にない精密な時点値の復元とは扱わない。 |
| legacy-2018-profit-table | 0：0〜1、1：0〜2、2：1〜3 | 0：原価等の比率条件0=75%、1=80%。1：利益率条件0=4%、1=8%、2=12%。2：金額・数量の倍率1〜3。75%と12%の組合せは不可。元の売上高・変動費・固定費・利益の位置と網掛け4セルを保ち、本文・候補・解説を同じ条件で更新する。正答は整数、c群の一部の誤答候補は千円単位へ四捨五入して表示する。原問題が丸め方式を指定しているとは扱わない。 |
| legacy-2018-cost-curves | 0：0〜3 | 0：最も傾きの大きい費用曲線を0〜3で選ぶ（表示①〜④）。4線種と原の切片の順1/3/2/4、軸の意味を保持する。数値のない原図へ数値目盛を足さない。 |
| legacy-2018-heap-tree | 0：0〜1、1：0〜23 | 0：内部の子の並び0=[30,45]、1=[45,30]。1：葉[5,10,15,20]の辞書式24順列0〜23。根60、7要素と完全二分木・0始まり添字は固定する。木の各節の値と6本の親子矢印を同じ配列条件で表示する。共通条件は対応する同じ問題の図表・本文のみに反映し、固定した処理の問いを置き換えない。 |
| legacy-2018-heap-array | 0：0〜1、1：0〜23 | 0：内部の子の並び0=[30,45]、1=[45,30]。1：葉[5,10,15,20]の辞書式24順列0〜23。根60、7要素と完全二分木・0始まり添字は固定する。添字0〜6の配列を木と一致させる。共通条件は対応する同じ問題の図表・本文のみに反映し、固定した処理の問いを置き換えない。 |
| legacy-2018-heap-program-one | 0：0〜1、1：0〜23 | 0：内部の子の並び0=[30,45]、1=[45,30]。1：葉[5,10,15,20]の辞書式24順列0〜23。根60、7要素と完全二分木・0始まり添字は固定する。このプログラムの原コード・空欄・注記は固定する。hnum&gt;0、整数除算、同値時の右の子の扱いと整数型下線を保持する。共通条件は対応する同じ問題の図表・本文のみに反映し、固定した処理の問いを置き換えない。 |
| legacy-2018-heap-regions | 0：0〜1、1：0〜23 | 0：内部の子の並び0=[30,45]、1=[45,30]。1：葉[5,10,15,20]の辞書式24順列0〜23。根60、7要素と完全二分木・0始まり添字は固定する。この領域図の構造・2省略区間・4破線境界と両矢印2本4端は固定する。共通条件は対応する同じ問題の図表・本文のみに反映し、固定した処理の問いを置き換えない。 |
| legacy-2018-heap-program-two | 0：0〜1、1：0〜23 | 0：内部の子の並び0=[30,45]、1=[45,30]。1：葉[5,10,15,20]の辞書式24順列0〜23。根60、7要素と完全二分木・0始まり添字は固定する。このプログラムの原コード・空欄・括弧・注記は固定する。4手続の処理順と整数型下線を保つ。共通条件は対応する同じ問題の図表・本文のみに反映し、固定した処理の問いを置き換えない。 |
| legacy-2018-spring-pm9-records | 0：1〜3 | 0：図の組1又は3。1は原図1/2の商品キーの入力・出力、3は原図3/4の時刻キーの入力・出力。2は不正入力として拒否する。原の8レコード、区切り、出力9文字欄・先頭空白、組内それぞれの図見出しを保つ。 |
| legacy-2018-spring-pm9-program | 0：0〜2、1：0〜2、2：0〜1 | 0：幅条件0/1/2→w=25/30/35。1：金額条件0/1/2→u=10000000/20000000/30000000。2：プログラム位置0=outList、1=outListG。同じ幅を定数とグラフ終端のw+1へ反映する。原のコード・空欄・行順・文字幅を保ち、表示コードをブラウザで実行しない。 |
| legacy-2018-spring-pm9-instruction | 0：0〜2、1：0〜2、2：0〜1 | 0：幅条件0/1/2→w=25/30/35。1：金額条件0/1/2→u=10000000/20000000/30000000。2：設問指示0=設問1、1=設問2。原の匿名矩形・指示文をその位置で表示する。幅と金額は該当する本文及び図表に同期する。 |
| legacy-2018-spring-pm9-bank | 0：0〜2、1：0〜2、2：0〜2 | 0：幅条件0/1/2→w=25/30/35。1：金額条件0/1/2→u=10000000/20000000/30000000。2：群位置0=a（4択）、1=b/c共有（5択）、2=d/e/f共有（6択）。最大値・値の式を同じ条件で示し、共有群と32ビット計算の誤りの役割を保つ。 |
| legacy-2018-spring-pm9-bar-print | 0：25〜35 | 0：棒グラフ最大幅w。許可値は25/30/35のみで間の整数は不可。比率の整数切捨て、9文字の項目欄と先頭空白、原の印字手順及び注記を保持する。 |
| legacy-2018-spring-pm9-error-table | 0：0〜2、1：0〜2、2：0〜0 | 0：幅条件0/1/2→w=25/30/35。1：金額条件0/1/2→u=10000000/20000000/30000000。2：固定値0。表1のd/e/fを含む3障害行と処理位置を保持する。整数オーバーフロー・ゼロ除算・領域外アクセスを解く問いを、修正済みの処理へ置換しない。 |
| legacy-2018-spring-pm10-record-layout | 0：1〜3 | 0：原レコード位置1=注文、2=入金、3=出荷待ち。原の項目順と桁数を固定し、個別データから別のレイアウトを生成しない。 |
| legacy-2018-spring-pm10-print-format | 0：1〜1 | 0：固定値1。原の注文結果リストの見出し・項目・位置・桁数を保持する。 |
| legacy-2018-spring-pm10-program | 0：0〜5、1：0〜2、2：0〜0 | 0：手動入金とする種別の組0〜5（順に[1,2]/[1,3]/[1,4]/[2,3]/[2,4]/[3,4]、残り2種別は自動入金）。1：期限条件0/1/2→5/7/9日。2：固定値0。89行のCOBOL処理と空欄・PIC 9(3)の型を保持し（原に明示のない999日入力上限を追加せず）、、種別判定と期限を本文と同期する。公式正誤表は別の固定資料で参照できる。 |
| legacy-2018-spring-pm10-instruction | 0：0〜5、1：0〜2、2：0〜1 | 0：手動入金とする種別の組0〜5（順に[1,2]/[1,3]/[1,4]/[2,3]/[2,4]/[3,4]、残り2種別は自動入金）。1：期限条件0/1/2→5/7/9日。2：設問指示0=設問1、1=設問2。原の匿名矩形と指示文を保持する。 |
| legacy-2018-spring-pm10-bank | 0：0〜5、1：0〜2、2：0〜4 | 0：手動入金とする種別の組0〜5（順に[1,2]/[1,3]/[1,4]/[2,3]/[2,4]/[3,4]、残り2種別は自動入金）。1：期限条件0/1/2→5/7/9日。2：群位置0=a（4択）、1=b/c共有（6択）、2=d（4択）、3=e（4択）、4=f（4択）。表2→注1（CURRENT-DATE実行日）→e/f群の原の順序と候補の役割・共有関係を保持する。 |
| legacy-2018-spring-pm10-change-table | 0：1〜1 | 0：固定値1。表2の修正条件と位置・原注記を保持する。実行日を説明する注1を後続の解答群より前に置く。 |
| legacy-2018-spring-pm11-program | 0：0〜3、1：0〜4、2：0〜1、3：0〜5 | 0：左の整数pの条件0〜3→1〜4。1：右の整数qの条件0〜4→5〜9。2：等値判定定数の条件0=6、1=9。3：原Javaプログラム位置0〜5。クラス・メソッド・式・空欄・行順を保持し、p/q/判定定数を同じ問題の出力例と同期する。コードは画面表示のみで実行しない。 |
| legacy-2018-spring-pm11-instruction | 0：0〜3、1：0〜4、2：0〜1、3：0〜6 | 0：左の整数pの条件0〜3→1〜4。1：右の整数qの条件0〜4→5〜9。2：等値判定定数の条件0=6、1=9。3：指示・本文の位置0=設問1指示、1=設問2指示、2=設問2本文、3=設問3指示、4=設問3本文、5=設問4指示、6=設問4本文。匿名・記号付き空欄と原の問いを保持する。 |
| legacy-2018-spring-pm11-output | 0：0〜3、1：0〜4、2：0〜1、3：0〜1 | 0：左の整数pの条件0〜3→1〜4。1：右の整数qの条件0〜4→5〜9。2：等値判定定数の条件0=6、1=9。3：図の位置0=図1の完全な出力文字列、1=図2のmain内αの置換文。図1は加算結果だけでなく式の文字列(p + q)の順と書式を保持する。該当しない判定定数は表示を変えない。 |
| legacy-2018-spring-pm11-bank | 0：0〜3、1：0〜4、2：0〜1、3：0〜5 | 0：左の整数pの条件0〜3→1〜4。1：右の整数qの条件0〜4→5〜9。2：等値判定定数の条件0=6、1=9。3：群位置0=a（4択）、1=b（6択）、2=c/d共有（7択）、3=設問2（4択）、4=設問3（6択）、5=設問4（4択）。toString/evaluateの役割、式の完全な出力と判定を同じ条件で比較し、群の順・数・共有を保つ。 |
| legacy-2018-spring-pm12-figure | 0：0〜1、1：0〜5、2：0〜2 | 0：状態フラグ条件0=待機−1/処理中0、1=待機0/処理中−1。1：入力例条件0〜5。DTOB例は順に567/123/209/804/910/999、GETWD数字列は順に[1234,56789,9876]/[2345,45678,8765]/[3456,34567,7654]/[4567,23456,6543]/[5678,12345,5432]/[6789,54321,4321]。先頭/第1間隔/第2間隔/末尾の空白数は順に[2,1,3,1]/[0,2,1,0]/[1,1,2,2]/[3,3,1,1]/[0,1,3,3]/[1,2,2,0]。同じ登録例に同期する。2：図位置0=数字列の格納、1=空白を△で示すGETWD文字列、2=管理数字列と終端−1の表。例の桁数を原の入力域の上限としない。 |
| legacy-2018-spring-pm12-program | 0：0〜1、1：0〜5、2：0〜2 | 0：状態フラグ条件0=待機−1/処理中0、1=待機0/処理中−1。1：入力例条件0〜5。DTOB例は順に567/123/209/804/910/999、GETWD数字列は順に[1234,56789,9876]/[2345,45678,8765]/[3456,34567,7654]/[4567,23456,6543]/[5678,12345,5432]/[6789,54321,4321]。先頭/第1間隔/第2間隔/末尾の空白数は順に[2,1,3,1]/[0,2,1,0]/[1,1,2,2]/[3,3,1,1]/[0,1,3,3]/[1,2,2,0]。同じ登録例に同期する。2：プログラム位置0=DTOB、1=GETWD、2=MULT2。0〜65534で先頭0を任意に持つ数字列という原の入力域、MULT2の二語とオーバーフローなし、レジスタ保存復元・ラベル・コメント・空欄を保持する。1〜5桁という制約は加えない。 |
| legacy-2018-spring-pm12-instruction | 0：0〜1、1：0〜5、2：0〜2 | 0：状態フラグ条件0=待機−1/処理中0、1=待機0/処理中−1。1：入力例条件0〜5。DTOB例は順に567/123/209/804/910/999、GETWD数字列は順に[1234,56789,9876]/[2345,45678,8765]/[3456,34567,7654]/[4567,23456,6543]/[5678,12345,5432]/[6789,54321,4321]。先頭/第1間隔/第2間隔/末尾の空白数は順に[2,1,3,1]/[0,2,1,0]/[1,1,2,2]/[3,3,1,1]/[0,1,3,3]/[1,2,2,0]。同じ登録例に同期する。2：設問位置0=設問1、1=設問2、2=設問3。匿名矩形と原の指示文・前提を保持する。 |
| legacy-2018-spring-pm12-bank | 0：0〜1、1：0〜5、2：0〜5 | 0：状態フラグ条件0=待機−1/処理中0、1=待機0/処理中−1。1：入力例条件0〜5。DTOB例は順に567/123/209/804/910/999、GETWD数字列は順に[1234,56789,9876]/[2345,45678,8765]/[3456,34567,7654]/[4567,23456,6543]/[5678,12345,5432]/[6789,54321,4321]。先頭/第1間隔/第2間隔/末尾の空白数は順に[2,1,3,1]/[0,2,1,0]/[1,1,2,2]/[3,3,1,1]/[0,1,3,3]/[1,2,2,0]。同じ登録例に同期する。2：群位置0=a（5択）、1=b（6択）、2=c（6択）、3=d（6択）、4=e（6択）、5=f（5択）。候補一覧は固定し、フラグに応じてcの正答JNZ FIN2/JZE FIN2を判定する。、全候補の演算・参照先と役割を保つ。 |
| legacy-2018-spring-pm12-unicode-reference | 0：0〜0、1：0〜0、2：0〜0 | 0：固定値0。1：固定値0。2：固定値0。3位置とも常に[0,0,0]であり、生成のフラグ・入力例・図選択条件から値をコピーしない。Unicode 17.0.0のSPACE=0020、FULL STOP=002E、DIGIT ZERO〜NINE=0030〜0039という12事実だけを示す独立編集の参考表。IPA公式のJIS表とは区別し、Unicode License v3全文通知・別素材の由来と編集表示へ到達できる構成を保つ。保留中のJIS画像・文字表の再描画は含めない。 |
| legacy-2018-spring-pm13-selection-sheet | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。会議室選定シートの原の表示セルと疎な省略位置を保つ。15室、19行目とA22の配置を維持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-occupancy | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。原の収容率の式・表示位置と丸めの前提を保つ。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-reservation-sheet | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。予約シートの列・疎な表示行・省略を保持し、裏の全520件を本文へ全件展開しない。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-copy-formula | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。コピーする式の原の相対参照・絶対参照とコピー方向を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-recommend-formula | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。推薦式の原の探索範囲・最初の同率候補を選ぶ方向を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-bank-a | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。a群8択の参照式と原の役割・順を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-bank-b | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。b群8択の式と原の役割・順を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-bank-c | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。c群6択の式と原の役割・順を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-macro | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。原の15構造行・後判定・利用時間9時〜21時・9998行上限・中断なし・数値型の下線を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-bank-d | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。d群8択の式と原の役割・順を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-bank-e | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。e群6択の式と原の役割・順を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-spring-pm13-bank-f | 0：0〜3 | 0：会議室予約の条件0〜3。0は原の省略された表示例、1〜3は15室・520予約の別条件。利用日・時間・人数・設備・室の定員を対応する表示位置へ反映し、利用可否・収容率・推薦先を同じ条件で更新する。f群6択の式と原の役割・順を保持する。汎用式・マクロの正答は条件を変えても固定し、数値が変わるシートと固定処理を区別する。 |
| legacy-2018-security-mandatory-notice | 0：0〜0 | 0：固定単位0。原の問1必須の囲み注意を表示する。問題の誤答対策条件とは別の値である。 |
| legacy-2018-security-attack-evidence | 0：0〜1 | 0：文章単位0=事故の原因と流出範囲（下線部(ア)〜(ウ)を含む）、1=表1の空欄を問う設問2。原の文章と下線の役割を保持し、未記載の事故情報を補わない。 |
| legacy-2018-security-measure-table | 0：0〜0 | 0：固定単位0。表1の目的/対策、既記載のプレースホルダ実装、a/b/c空欄との対応を保持する。 |
| legacy-2018-autumn-pm1-bank | 0：0〜3、1：0〜4 | 0：同じ役割の誤答対策を変える4条件。1：原の群位置0=設問1、1=a、2=b、3=c、4=設問3。各4択を原順で常時表示する。 |
| legacy-2018-autumn-pm2-rr | 0：0〜3、1：0〜3、2：0〜0 | 0：Xの三つのCPU処理時間(30,50,10)/(50,30,10)/(10,30,50)/(30,10,50)のindex0〜3。1：A/Cの処理1時間の組（30/20、30/10、10/20、10/10）。2：固定0。図1のキューと登録/実行/待ちの固定構造。生成・時間切れ・I/O完了の矢印は登録へ合流する。 |
| legacy-2018-autumn-pm2-flow | 0：0〜3、1：0〜3、2：0〜0 | 0：Xの三つのCPU処理時間(30,50,10)/(50,30,10)/(10,30,50)/(30,10,50)のindex0〜3。1：A/Cの処理1時間の組（30/20、30/10、10/20、10/10）。2：固定0。図2のCPU処理3回とI/O待ち2回の原の処理順を表示する。 |
| legacy-2018-autumn-pm2-times | 0：0〜3、1：0〜3、2：0〜1 | 0：Xの三つのCPU処理時間(30,50,10)/(50,30,10)/(10,30,50)/(30,10,50)のindex0〜3。1：A/Cの処理1時間の組（30/20、30/10、10/20、10/10）。2：表位置0=Xの処理/待ち時間、1=A/B/Cの生成時刻と処理/待ち時間。原の列へミリ秒値を同期する。 |
| legacy-2018-autumn-pm2-state | 0：0〜3、1：0〜3、2：0〜0 | 0：Xの三つのCPU処理時間(30,50,10)/(50,30,10)/(10,30,50)/(30,10,50)のindex0〜3。1：A/Cの処理1時間の組（30/20、30/10、10/20、10/10）。2：固定0。図3の実行可能/実行/待ち、①〜④の遷移と凡例を保持する。 |
| legacy-2018-autumn-pm2-bank | 0：0〜3、1：0〜3、2：0〜2 | 0：Xの三つのCPU処理時間(30,50,10)/(50,30,10)/(10,30,50)/(30,10,50)のindex0〜3。1：A/Cの処理1時間の組（30/20、30/10、10/20、10/10）。2：群0=設問1の遷移回数6択、1=aの優先度推移4択、2=b/c共通の時刻9択。共有IDと全候補を保持する。 |
| legacy-2018-autumn-pm2-priority | 0：0〜3、1：0〜3、2：0〜0 | 0：Xの三つのCPU処理時間(30,50,10)/(50,30,10)/(10,30,50)/(30,10,50)のindex0〜3。1：A/Cの処理1時間の組（30/20、30/10、10/20、10/10）。2：固定0。図4の優先度別キューと登録/取出し/待ちの固定接続を保持する。 |
| legacy-2018-autumn-pm3-schema | 0：0〜3、1：0〜2、2：0〜1、3：0〜1 | 0：コンサートID・席種・価格4組。1：期限通知の残り日数3/2/5の3条件。2：ポイントの下/上境界10000/20000又は5000/10000。3：表群0=当初の5表、1=ポイント追加後の3表。原の項目、主キーと参照関係を保持する。 |
| legacy-2018-autumn-pm3-bank | 0：0〜3、1：0〜2、2：0〜1、3：0〜3 | 0：コンサートID・席種・価格4組。1：期限通知の残り日数3/2/5の3条件。2：ポイントの下/上境界10000/20000又は5000/10000。3：群0=制約、1=設問2 a、2=設問3 b、3=ポイントUPDATE。原4/6/4/4択と誤構文を保ち、値と境界を同期する。 |
| legacy-2018-autumn-pm3-sql | 0：0〜3、1：0〜2、2：0〜1、3：0〜1 | 0：コンサートID・席種・価格4組。1：期限通知の残り日数3/2/5の3条件。2：ポイントの下/上境界10000/20000又は5000/10000。3：SQL位置0=販売できない席の選択、1=期限通知対象の選択。a/b空欄と原の構文を保ち、対象値と日数を同期する。 |
| legacy-2018-autumn-pm4-network | 0：0〜2、1：0〜3、2：0〜0 | 0：追加設定で要求方向を反転するサービス0=ファイル445、1=SSH22、2=リモートデスクトップ3389。1：追加セグメント11〜14と10.1又は10.2の/24アドレスの4組。2：固定0。図1のインターネット/DMZ/事務/開発の配線。既存の末尾番号を追加条件へ同期する。 |
| legacy-2018-autumn-pm4-filter | 0：0〜2、1：0〜3、2：0〜0 | 0：追加設定で要求方向を反転するサービス0=ファイル445、1=SSH22、2=リモートデスクトップ3389。1：追加セグメント11〜14と10.1又は10.2の/24アドレスの4組。2：固定0。表1の送信元・宛先・ポート・可否。指定した一つのサービスだけ方向を反転する。 |
| legacy-2018-autumn-pm4-addresses | 0：0〜2、1：0〜3、2：0〜0 | 0：追加設定で要求方向を反転するサービス0=ファイル445、1=SSH22、2=リモートデスクトップ3389。1：追加セグメント11〜14と10.1又は10.2の/24アドレスの4組。2：固定0。表2の事務10.0.0.0/16と追加開発セグメントのアドレスを同期する。 |
| legacy-2018-autumn-pm4-configurations | 0：0〜2、1：0〜3、2：0〜0 | 0：追加設定で要求方向を反転するサービス0=ファイル445、1=SSH22、2=リモートデスクトップ3389。1：追加セグメント11〜14と10.1又は10.2の/24アドレスの4組。2：固定0。図2の構成案1/2の全配線と機器の役割を保ち、追加番号を同期する。 |
| legacy-2018-autumn-pm4-bank | 0：0〜2、1：0〜3、2：0〜2 | 0：追加設定で要求方向を反転するサービス0=ファイル445、1=SSH22、2=リモートデスクトップ3389。1：追加セグメント11〜14と10.1又は10.2の/24アドレスの4組。2：群0=a/b共通6択、1=cの3択、2=d/e共通6択。二組の順不同欄を別のbankとして保持する。 |
| legacy-2018-autumn-pm5-position | 0：0〜1、1：0〜3、2：0〜0 | 0：依頼ID10000003/10000004の依頼種別。0=削除/登録、1=登録/削除。1：決定表内b/cの同じ役割の空欄列を選ぶ4条件。2：固定0。図1の二つの担当領域、五つのファイル記号、参照経路と原の矢印を保持する。 |
| legacy-2018-autumn-pm5-files | 0：0〜1、1：0〜3、2：0〜0 | 0：依頼ID10000003/10000004の依頼種別。0=削除/登録、1=登録/削除。1：決定表内b/cの同じ役割の空欄列を選ぶ4条件。2：固定0。表1の依頼/購買レコードの項目と下線主キーを固定する。 |
| legacy-2018-autumn-pm5-items | 0：0〜1、1：0〜3、2：0〜0 | 0：依頼ID10000003/10000004の依頼種別。0=削除/登録、1=登録/削除。1：決定表内b/cの同じ役割の空欄列を選ぶ4条件。2：固定0。表2の項目の説明を保持し、原にない注番号を加えない。 |
| legacy-2018-autumn-pm5-flow | 0：0〜1、1：0〜3、2：0〜0 | 0：依頼ID10000003/10000004の依頼種別。0=削除/登録、1=登録/削除。1：決定表内b/cの同じ役割の空欄列を選ぶ4条件。2：固定0。図2の読込み/終端/照合/a1・a2空欄/出力副処理/破線枠/反復の原構造を保持する。 |
| legacy-2018-autumn-pm5-bank | 0：0〜1、1：0〜3、2：0〜3 | 0：依頼ID10000003/10000004の依頼種別。0=削除/登録、1=登録/削除。1：決定表内b/cの同じ役割の空欄列を選ぶ4条件。2：群0=a、1=b/c共通、2=d、3=e。原6/6/5/4択の表構成と共有IDを保持する。 |
| legacy-2018-autumn-pm5-decision | 0：0〜1、1：0〜3、2：0〜0 | 0：依頼ID10000003/10000004の依頼種別。0=削除/登録、1=登録/削除。1：決定表内b/cの同じ役割の空欄列を選ぶ4条件。2：固定0。表3のY/―/Xと15条件列を保ち、選んだb/c列全体を空欄にする。空欄の中身は表示しない。 |
| legacy-2018-autumn-pm5-records | 0：0〜1、1：0〜3、2：0〜1 | 0：依頼ID10000003/10000004の依頼種別。0=削除/登録、1=登録/削除。1：決定表内b/cの同じ役割の空欄列を選ぶ4条件。2：テストデータ0=購買ファイル4件、1=依頼ファイル6件。原のID/状態を保ち、03/04の依頼種別だけを同期する。 |
| legacy-2018-autumn-pm6-example | 0：0〜1、1：0〜1、2：0〜1、3：0〜0 | 0：図1のA/B所要1日/2日の配置。1：同図Kの3日/4日。2：図2のH（回付サービス利用準備）の40日/30日。3：固定0。図1の8結合点・11実作業・2ダミーと作業名/日数・実線/破線を保持する。 |
| legacy-2018-autumn-pm6-bank | 0：0〜1、1：0〜1、2：0〜1、3：0〜5 | 0：図1のA/B所要1日/2日の配置。1：同図Kの3日/4日。2：図2のH（回付サービス利用準備）の40日/30日。3：群0=a、1=b、2=c、3=d、4=e/f共通、5=g。原6/5/6/5/8/6択と二つのダミー位置の順不同欄を保持する。 |
| legacy-2018-autumn-pm6-tasks | 0：0〜1、1：0〜1、2：0〜1、3：0〜0 | 0：図1のA/B所要1日/2日の配置。1：同図Kの3日/4日。2：図2のH（回付サービス利用準備）の40日/30日。3：固定0。表1のA〜Nの本文/注と日数を保持し、Hを同期する。Eのパラメタ設定とIのパラメタ定義を別工程として保つ。 |
| legacy-2018-autumn-pm6-project | 0：0〜1、1：0〜1、2：0〜1、3：0〜0 | 0：図1のA/B所要1日/2日の配置。1：同図Kの3日/4日。2：図2のH（回付サービス利用準備）の40日/30日。3：固定0。図2の13結合点・14実作業を表示し、原の欠落ダミー2本を解答前に補完しない。Hの日数を同期する。 |
| legacy-2018-autumn-pm7-organization | 0：0〜1、1：0〜2、2：0〜0 | 0：通番6の完了段階0=管理作業1④担当決定、1=同③不備返却。1：同レコードの媒体0=Webのみ、1=紙のみ、2=両方。2：固定0。図1の部門、管理/審査/作成グループ、紙/Webチームの原の体制を固定する。 |
| legacy-2018-autumn-pm7-log | 0：0〜1、1：0〜2、2：0〜1 | 0：通番6の完了段階0=管理作業1④担当決定、1=同③不備返却。1：同レコードの媒体0=Webのみ、1=紙のみ、2=両方。2：位置0=図2帳簿様式、1=図3の原6レコード。通番6の媒体を同期し、末尾5欄は解答空欄に保つ。網掛け/未記入/―を区別し、原注記はcaptionより前に置く。 |
| legacy-2018-autumn-pm7-bank | 0：0〜1、1：0〜2、2：0〜2 | 0：通番6の完了段階0=管理作業1④担当決定、1=同③不備返却。1：同レコードの媒体0=Webのみ、1=紙のみ、2=両方。2：群0=設問1の記入4択、1=設問2で二つ選ぶ作業4択、2=a/b共通8択。媒体のない担当欄を―に同期し、全択と回答欄の役割を保つ。 |
| legacy-2018-autumn-pm7-transfers | 0：0〜1、1：0〜2、2：0〜0 | 0：通番6の完了段階0=管理作業1④担当決定、1=同③不備返却。1：同レコードの媒体0=Webのみ、1=紙のみ、2=両方。2：固定0。表1の通番4（紙のみ）の作業/受渡し9件と非表示セルは固定し、通番6の条件で置換しない。 |
| legacy-2018-autumn-pm8-expression-main | 0：0〜3、1：0〜3、2：0〜3、3：0〜1 | 0：加減算/乗除算優先度(1,2)/(1,3)/(2,3)/(2,4)。1：図1/2の15文字構造の入れ子整数式4組。2：設問3の四つの式の数値4組。3：符号付き6文字式2組。共通4入力の当該条件を原の主プログラムとa/b空欄へ反映し、原見出しと制御線を保持する。 |
| legacy-2018-autumn-pm8-expression-parsed | 0：0〜3、1：0〜3、2：0〜3、3：0〜1 | 0：加減算/乗除算優先度(1,2)/(1,3)/(2,3)/(2,4)。1：図1/2の15文字構造の入れ子整数式4組。2：設問3の四つの式の数値4組。3：符号付き6文字式2組。図1の解析直後のExpression/Value/Operator/Priority/OpCntを同じ例から算出し、省略位置を保持する。 |
| legacy-2018-autumn-pm8-expression-parse | 0：0〜3、1：0〜3、2：0〜3、3：0〜1 | 0：加減算/乗除算優先度(1,2)/(1,3)/(2,3)/(2,4)。1：図1/2の15文字構造の入れ子整数式4組。2：設問3の四つの式の数値4組。3：符号付き6文字式2組。共通4入力の当該条件を解析処理へ反映する。c1/c2/c3の組、d空欄、原見出し・制御線・参照位置を保持する。 |
| legacy-2018-autumn-pm8-expression-first-step | 0：0〜3、1：0〜3、2：0〜3、3：0〜1 | 0：加減算/乗除算優先度(1,2)/(1,3)/(2,3)/(2,4)。1：図1/2の15文字構造の入れ子整数式4組。2：設問3の四つの式の数値4組。3：符号付き6文字式2組。図2の最外側反復1回直後の配列とOpCntを同じ例から算出する。 |
| legacy-2018-autumn-pm8-expression-calculate | 0：0〜3、1：0〜3、2：0〜3、3：0〜1 | 0：加減算/乗除算優先度(1,2)/(1,3)/(2,3)/(2,4)。1：図1/2の15文字構造の入れ子整数式4組。2：設問3の四つの式の数値4組。3：符号付き6文字式2組。共通4入力の当該条件を計算処理へ反映する。e空欄、原見出し、走査/詰め直しの制御線を保持する。 |
| legacy-2018-autumn-pm8-bank | 0：0〜3、1：0〜3、2：0〜3、3：0〜1、4：0〜5 | 0：加減算/乗除算優先度(1,2)/(1,3)/(2,3)/(2,4)。1：図1/2の15文字構造の入れ子整数式4組。2：設問3の四つの式の数値4組。3：符号付き6文字式2組。4：群0=a、1=b、2=c1/c2/c3の組、3=d、4=e、5=f/g共通。各4択を原順で表示し、共有IDと独立回答欄を保つ。 |
| legacy-2018-autumn-pm8-expression-signed | 0：0〜3、1：0〜3、2：0〜3、3：0〜1 | 0：加減算/乗除算優先度(1,2)/(1,3)/(2,3)/(2,4)。1：図1/2の15文字構造の入れ子整数式4組。2：設問3の四つの式の数値4組。3：符号付き6文字式2組。図3の符号付き式の解析状態。f/g空欄と未表示の網掛けを保ち、答や未知のセルを埋めない。原注記/caption順を保持する。 |
| legacy-2018-autumn-pm9-route | 0：0〜5、1：0〜2、2：0〜1 | 0：start反復回数1〜6のindex0〜5（原はindex3で4回）。1：列車3の行先5/6/8のindex0〜2。2：位置0=図1の路線/初期列車、1=表1の初期格納内容。行先を同期し、start実行後のe/fの答を追加しない。 |
| legacy-2018-autumn-pm9-program | 0：0〜5、1：0〜2、2：0〜2 | 0：start反復回数1〜6のindex0〜5（原はindex3で4回）。1：列車3の行先5/6/8のindex0〜2。2：プログラムindex0/1/2=原1/2/3。全宣言・構造体・関数・空欄と順序を保ち、startの反復上限を同期する。表示中に実行しない。 |
| legacy-2018-autumn-pm9-bank | 0：0〜5、1：0〜2、2：0〜5 | 0：start反復回数1〜6のindex0〜5（原はindex3で4回）。1：列車3の行先5/6/8のindex0〜2。2：a〜fの群index0〜5。原7/4/3/6/4/5択の条件式・制御文・引数・位置・信号の役割と順を保持する。 |
| legacy-2018-autumn-pm10-record | 0：0〜3、1：0〜1、2：0〜1 | 0：事業年度開始月4/1/7/10月のindex0〜3。1：反映対象0=当該事業年度の上期、1=前事業年度の下期。実行月と半期の文言を同期する。2：位置0=図1保有資格ファイル、1=図2合格ファイル。原のレコード項目、4資格と桁数を固定する。 |
| legacy-2018-autumn-pm10-program | 0：0〜3、1：0〜1、2：0〜0 | 0：事業年度開始月4/1/7/10月のindex0〜3。1：反映対象0=当該事業年度の上期、1=前事業年度の下期。実行月と半期の文言を同期する。2：固定0。原のCOBOL全宣言・行番号・空欄、SORT/RETURN/EOFと従業員境界の書戻しを表示する。表示中に実行しない。 |
| legacy-2018-autumn-pm10-bank | 0：0〜3、1：0〜1、2：0〜5 | 0：事業年度開始月4/1/7/10月のindex0〜3。1：反映対象0=当該事業年度の上期、1=前事業年度の下期。実行月と半期の文言を同期する。2：a〜fの群index0〜5。原の各4択を保持し、設問3の半期と「までに」を同期する。 |
| legacy-2018-autumn-pm10-changes | 0：0〜3、1：0〜1、2：0〜1 | 0：事業年度開始月4/1/7/10月のindex0〜3。1：反映対象0=当該事業年度の上期、1=前事業年度の下期。実行月と半期の文言を同期する。2：変更表index0/1=原の表1/表2。挿入する行位置と追加命令・空欄の対応を固定する。 |
| legacy-2018-autumn-pm11-example | 0：0〜7、1：0〜0 | 0：ひな形のキー境界/隣接キー/空フラグメント/置換行数を同じ役割で変える8条件。1：固定0。図1のひな形・置換表・適用矢印・出力文書を同じ入力から作る。任意callerを公式実行例として追加しない。 |
| legacy-2018-autumn-pm11-program | 0：0〜7、1：0〜5 | 0：ひな形のキー境界/隣接キー/空フラグメント/置換行数を同じ役割で変える8条件。1：プログラムindex0〜5=原1〜6。全宣言・空欄・α挿入位置を保持する。固定API3頁/正誤表は別contextのまま、表示中にJavaを実行しない。 |
| legacy-2018-autumn-pm11-bank | 0：0〜7、1：0〜4 | 0：ひな形のキー境界/隣接キー/空フラグメント/置換行数を同じ役割で変える8条件。1：群0=a、1=b/c共通、2=d、3=e、4=f。原4/6/4/4/5択とb/c共有IDを保持する。 |
| legacy-2018-autumn-pm12-program | 0：0〜7、1：0〜1 | 0：基準年1970/1972/1980/1999/2000/2099/2100/2399のindex0〜7。4/100/400年判定、符号なし16bit・OF・レジスタ復元の原契約を保つ。1：プログラムindex0=DAYOFFST、1=LEAPYEAR。全行番号・ラベル・注記・空欄を保ち、基準年を対応箇所へ同期する。CASLを画面で実行せず、JIS文字符号の条件を追加しない。 |
| legacy-2018-autumn-pm12-bank | 0：0〜7、1：0〜5 | 0：基準年1970/1972/1980/1999/2000/2099/2100/2399のindex0〜7。4/100/400年判定、符号なし16bit・OF・レジスタ復元の原契約を保つ。1：a〜fの群index0〜5。原6/6/5/6/5/5択の数値/命令を保持し、JIS表に依存する選択肢へ置換しない。 |
| legacy-2018-autumn-pm13-visits | 0：0〜1080、1：0〜0 | 0：例条件0=原の部分表示例、1〜1080=独立した完全データから作る有限例。可変例は開始時刻5組・受付間隔3組・サービス時間3組・件数4組・種別順6組を結ぶ。原の非表示データを復元せず、時間帯平均が整数分となる域を使う。1：固定0。図1の先頭3件/最終件/省略行とA〜Jの座標、網掛け/空値を保持する。 |
| legacy-2018-autumn-pm13-bank | 0：0〜1080、1：0〜6 | 0：例条件0=原の部分表示例、1〜1080=独立した完全データから作る有限例。可変例は開始時刻5組・受付間隔3組・サービス時間3組・件数4組・種別順6組を結ぶ。原の非表示データを復元せず、時間帯平均が整数分となる域を使う。1：a〜gの群index0〜6。原6/5/6/6/6/6/6択を保ち、aへ架空の正答を追加しない。official no&#95;correct&#95;answerの採点区分はmetadataで別に保つ。 |
| legacy-2018-autumn-pm13-analysis | 0：0〜1080、1：0〜0 | 0：例条件0=原の部分表示例、1〜1080=独立した完全データから作る有限例。可変例は開始時刻5組・受付間隔3組・サービス時間3組・件数4組・種別順6組を結ぶ。原の非表示データを復元せず、時間帯平均が整数分となる域を使う。1：固定0。図2の9時間帯、A/B/C別集計、上位5件を同じ例から算出する。D4へ原にないfloorを加えず、cの原切捨てを保つ。 |
| legacy-2018-autumn-pm13-macro | 0：0〜1080、1：0〜0 | 0：例条件0=原の部分表示例、1〜1080=独立した完全データから作る有限例。可変例は開始時刻5組・受付間隔3組・サービス時間3組・件数4組・種別順6組を結ぶ。原の非表示データを復元せず、時間帯平均が整数分となる域を使う。1：固定0。28行のqueue&#95;simulationを原見出しの後へ表示し、e/f/g空欄と6組の連続制御線/else横罫線を保つ。画面で実行しない。 |
| legacy-2019-spring-pm1-network | 0：0〜0 | 0：固定単位0。A社の外枠、社内LANとインターネットの境界、FW・認証・プロキシ・業務サーバ・PCを原の接続で表示する。省略の二組の点も保持する。 |
| legacy-2019-auth-sequence | 0：0〜0 | 0：固定単位0。B社クラウドサービス、Webブラウザ、IdP、A社認証サーバの四つの縦線と①〜⑩の送信・返信を表示する。問題条件の6つの二値はこの固定の通信手順を変えない。 |
| legacy-2019-spring-pm1-bank | 0：0〜1、1：0〜1、2：0〜1、3：0〜1、4：0〜1、5：0〜1、6：0〜2 | 0：PKI/認証局、1：サービス妨害/通信経路の障害、2：生体情報/ICカード、3：秘密鍵/共通鍵、4：利用者ID/認証有効期限、5：漏えい/盗聴を選ぶ各0/1の誤答役割。6：群0=a〜c共通9択、1=dの4択、2=eの5択。通信条件・正しい概念・5解答欄は固定し、同じ役割の選択肢を変更する。 |
| legacy-2019-spring-pm2-mapping | 0：0〜3 | 0：物理ページ1〜8へA〜Hを配置する査読済み4組のindex0〜3。ページテーブルのa1〜a4、存在ビット1、m/nと網掛けによる省略を保持し、選択肢の対応を同期する。 |
| legacy-2019-spring-pm2-bank | 0：0〜3、1：0〜11、2：2〜3、3：0〜3 | 0：物理ページ配置4組のindex。1：原13参照列の回転0/1/2/3/4/6/7/8/9/10/11/12を選ぶindex0〜11。2：比較前の物理ページ数2又は3（比較後は一つ多い）。3：群0=a、1=b、2=c、3=d/e共通。FIFO/LRUの回数と同じ入力から5/4/4/9択を表示する。 |
| legacy-2019-spring-pm3-bank | 0：0〜2、1：0〜1、2：0〜1、3：0〜1、4：-1〜1、5：0〜4 | 0：年度範囲2010〜2019/2020〜2029/2030〜2039のindex0〜2。1：対象性別0=男子、1=女子。2：年度の昇順/降順0/1。3：学年の昇順/降順0/1。4：身長統計・階級境界を−5/0/+5cm平行移動する−1/0/1。5：群0=a、1=b、2=c、3=d/e共通、4=f。SQLのLIKE/CASE/ORDER BY/制約/COUNTの役割と6/5/4/5/6択を保つ。 |
| legacy-2019-load-balance-network | 0：0〜3 | 0：公開側・内部側・教室側IPアドレスの4組のindex0〜3。DNS、負荷分散装置、アプリケーションサーバ2台、コンテンツサーバ、プロキシとPCの接続・役割は固定し、本文・解答群の対応するアドレスへ同期する。 |
| legacy-2019-spring-pm4-bank | 0：0〜3、1：0〜2、2：0〜4 | 0：公開側・内部側・教室側IPアドレスの4組のindex0〜3。1：平均処理時間0.40/0.20/0.10秒と到着率2.30/4.60/9.20件/秒を同期させる3条件。2：群0=a、1=b、2=c、3=設問2、4=設問3。原6/4/4/4/4択の役割、M/M/1の平均待ち時間と元の丸め桁を保つ。 |
| legacy-2019-spring-pm5-architecture | 0：0〜0 | 0：固定単位0。申込/検査管理の各サーバ、DB・WebAPI・ツールの配置と接続を原の図1として表示する。二つの誤答条件ではこの固定媒体を変えない。 |
| legacy-2019-spring-pm5-entities | 0：0〜0 | 0：固定単位0。原図2の全情報・項目、IDと下線の主キー、申込と検査の関係を表示する。二つの誤答条件ではこの固定媒体を変えない。 |
| legacy-2019-spring-pm5-api-table | 0：0〜0 | 0：固定単位0。原の7つの情報取得用WebAPIの引数・戻り値・処理、失敗時・ページ指定等の全注記を固定の表1として表示する。二つの誤答条件ではこの固定媒体を変えない。 |
| legacy-2019-spring-pm5-bank | 0：0〜1、1：0〜1、2：0〜3 | 0：申込DBへ混入させる誤った別DB情報の2条件。1：先頭の申込者取得で選ぶ誤ったAPIの2条件。2：群0=a、1=b/c共通、2=d、3=e。正しいDB/データ連携・ページングの前提を保持し、原6/6/7/5択を表示する。 |
| legacy-2019-spring-pm5-product-report | 0：0〜0 | 0：固定単位0。原図3の提供者情報、農産物検査結果の一覧と項目を固定例として表示する。二つの誤答条件ではこの固定媒体を変えない。 |
| legacy-2019-spring-pm5-results-list | 0：0〜0 | 0：固定単位0。原図4の検査結果リスト、1画面最大10行、ページを送るボタンと検査済/未検査の表示役割を保持する。二つの誤答条件ではこの固定媒体を変えない。 |
| legacy-2019-spring-pm6-bank | 0：0〜3、1：0〜3、2：0〜6 | 0：プログラム開発の生産性4/5/8/10 kステップ/人月を選ぶindex0〜3。1：結合試験の生産性8/5/10/20を選ぶindex0〜3。2：群0=a、1=b、2=c、3=d、4=e、5=f/g共通、6=h。元の400kステップ/追加10%・週数・最多4人を固定し、工数・必要人数・実現性と全4/4/7/4/4/8/4択を同期する。 |
| legacy-2019-change-timeline | 0：0〜0 | 0：固定単位0。設計1〜2、プログラム開発3〜6、結合試験7〜8、総合試験9〜10か月目のスケジュール。生産性を変えても元の工程期間は固定する。 |
| legacy-2019-spring-pm7-turnover | 0：0〜8、1：0〜2 | 0：6工場と4事業部の製造関係の9組のindex0〜8。1：取扱高を元値の1/0.8/1.2倍にする3条件。H〜Mの各工場/P〜S事業部の空欄でない全数値・合計と非製造の横線を、同じ製造関係から表示する。単位億円は独立表示する。 |
| legacy-2019-spring-pm7-bank | 0：0〜8、1：0〜2、2：0〜5 | 0：6工場と4事業部の製造関係9組のindex0〜8。1：取扱高を元値の1/0.8/1.2倍にするindex0〜2。2：群0=a、1=b、2=c/d共通、3=e、4=f、5=g。実際の製造・発注先/統合先の関係と費用を同期し、原3/5/4/4/4/4択とc/d順不同の二つの欄を保持する。 |
| legacy-2019-spring-pm8-alpha-tree | 0：0〜0 | 0：固定単位0。原の文字列αに対応するハフマン木の全節・重み・左右枝・記号を表示する。設問1の四つの出現回数条件とは独立に原の参照媒体を保持する。 |
| legacy-2019-spring-pm8-alpha-path | 0：0〜0 | 0：固定単位0。αの文字Bについて、葉から親をたどり根の側から逆順に得るビット表現の作成例を表示する。設問1の四つの出現回数条件とは独立に原の参照媒体を保持する。 |
| legacy-2019-spring-pm8-ratio | 0：0〜0 | 0：固定単位0。原の圧縮率の計算式、分子・分母と100を掛ける構成を表示する。設問1の四つの出現回数条件とは独立に原の参照媒体を保持する。 |
| legacy-2019-spring-pm8-bank | 0：0〜3、1：0〜4 | 0：設問1で与える文字出現回数の4組のindex0〜3。1：群0=a、1=b、2=c/d共通、3=e、4=f。出現回数は本文の同じ位置へ反映し、空欄と原4/4/7/5/4択の役割を保持する。 |
| legacy-2019-spring-pm8-alpha-arrays | 0：0〜0 | 0：固定単位0。図1の木を表すfreq/left/right/parentの全配列、添字・値−1と●→注記を表示する。設問1の四つの出現回数条件とは独立に原の参照媒体を保持する。 |
| legacy-2019-spring-pm8-program1 | 0：0〜0 | 0：固定単位0。プログラム1の全25行・c/d空欄・連続する制御罫線・コメントを表示する。設問1の四つの出現回数条件とは独立に原の参照媒体を保持する。 |
| legacy-2019-spring-pm8-program2 | 0：0〜0 | 0：固定単位0。プログラム2の全8行・e/f空欄・連続する制御罫線を表示する。設問1の四つの出現回数条件とは独立に原の参照媒体を保持する。 |
| legacy-2019-spring-pm9-reference-notice | 0：0〜0 | 0：固定単位0。原本文の付属仕様1.3への参照と独立95文字参考との関係、原JIS表・規格文言を収録しない編集注を解答前に表示する。 |
| legacy-2019-spring-pm9-example | 0：0〜16、1：0〜1 | 0：印字例の条件0=原の部分表示（未表示のfrequencyは推定しない）、1〜16=256 byteの全出現回数が既知の4分布×倍率1〜4。1：例0=文字コード順、1=出現回数降順・同数時コード順。全256byteを4列へ配置し、省略位置と20〜7Eだけの文字併記を保つ。Cのbyte値をUnicode符号化へ置換しない。 |
| legacy-2019-spring-pm9-program | 0：0〜16、1：0〜2 | 0：印字例の条件0=原の部分表示（未表示のfrequencyは推定しない）、1〜16=256 byteの全出現回数が既知の4分布×倍率1〜4。1：位置0=最初のmain全プログラム、1=追加する変数宣言、2=出現回数順へ整列する追加処理。原の匿名空欄・①〜⑧・a/b/cを保持し、本文にある同じsample.cを対象とする。 |
| legacy-2019-spring-pm9-bank | 0：0〜16、1：0〜5 | 0：印字例の条件0=原の部分表示（未表示のfrequencyは推定しない）、1〜16=256 byteの全出現回数が既知の4分布×倍率1〜4。1：群0=a、1=b/c共通、2=d、3=e、4=f、5=g。原3/6/4/4/3/4択、byteの列走査・整列範囲・追加位置の役割を保持する。 |
| legacy-2019-spring-pm9-changes | 0：0〜16、1：0〜0 | 0：印字例の条件0=原の部分表示（未表示のfrequencyは推定しない）、1〜16=256 byteの全出現回数が既知の4分布×倍率1〜4。1：固定単位0。表1の三つの処置（f直後へix=0、行⑦へix=i、行⑧をgに置換え）を原の処置/変更内容の2列で示す。 |
| legacy-2019-spring-pm9-character-reference | 0：0〜0 | 0：固定単位0。20〜7Eの95個のbyteと表示文字を、JIS0201/CP932公開mappingとUnicodeData17から独立編集した参考。5C=円記号・7E=チルダを明示し、規範的JIS表や原JIS文言とは扱わない。別Source/RightとUnicode License V3の帰属を保持する。 |
| legacy-2019-ranking-record-layout | 0：0〜0 | 0：固定単位0。結果ファイルの塾生番号6桁→校舎番号2桁→国語/数学/英語/理科/社会各3桁（計23桁）の順にレコード配置を表示する。順位の評価方向ではレコード構造を変えない。 |
| legacy-2019-ranking-print-layout | 0：0〜1 | 0：順位の評価方針0=得点降順、1=失点昇順。順位リストの見出しと評価値の呼称を同期し、全体順位・塾生番号・校舎番号・校舎内順位の欄を保つ。 |
| legacy-2019-ranking-print-example | 0：0〜1 | 0：順位の評価方針0=得点降順、1=失点昇順。例の評価値と順位を本文・プログラムと同期し、同点の順位と印字行の役割を維持する。 |
| legacy-2019-spring-pm10-bank | 0：0〜1、1：0〜4 | 0：順位の評価方針0=得点降順、1=失点昇順。1：群0=a、1=b、2=c/d共通、3=e、4=f。原4/4/6/4/4択と共用ID、比較方向に依存する式の対応を保持する。 |
| legacy-2019-ranking-average-display | 0：0〜0 | 0：固定単位0。5校舎と全体の平均を示す表示様式を保持する。順位の評価方向とは独立の固定図である。 |
| legacy-2019-spring-pm10-change-table | 0：0〜0 | 0：固定単位0。表1の処置と変更内容、a〜fの空欄と挿入・削除位置を表示する。原のVALUE ZEROと引用符内の2空白も保持する。 |
| legacy-2019-spring-pm11-maze | 0：0〜2、1：0〜3、2：0〜0 | 0：開始地点の北側の枝の長さ0〜2、1：途中の北側の枝の長さ0〜3。7×7の外周壁、S/G、座標x東・y南と主経路は保持する。2：固定単位0。二つの枝を迷路図の同じ座標へ反映する。 |
| legacy-2019-spring-pm11-program | 0：0〜2、1：0〜3、2：0〜5 | 0：開始地点の北側の枝の長さ0〜2、1：途中の北側の枝の長さ0〜3。7×7の外周壁、S/G、座標x東・y南と主経路は保持する。2：プログラム位置0=Maze、1=Piece、2=Direction、3=Location、4=PlayMaze、5=挿入する履歴短縮処理。迷路の全文字列は位置4へ同じ条件から反映し、空欄a〜fを保持する。 |
| legacy-2019-spring-pm11-bank | 0：0〜2、1：0〜3、2：0〜4 | 0：開始地点の北側の枝の長さ0〜2、1：途中の北側の枝の長さ0〜3。7×7の外周壁、S/G、座標x東・y南と主経路は保持する。2：群0=a/b共通8択、1=cの4択、2=dの4択、3=eの3択、4=fの3択。演算・座標・列挙順・削除添字の役割を保持する。 |
| legacy-2019-spring-pm11-history | 0：0〜2、1：0〜3、2：0〜0 | 0：開始地点の北側の枝の長さ0〜2、1：途中の北側の枝の長さ0〜3。7×7の外周壁、S/G、座標x東・y南と主経路は保持する。2：固定単位0。左手法で実際に歩いた履歴から反対方向の連続二歩を除いた方角列を表示する。未短縮の全履歴と混同しない。 |
| legacy-2019-spring-pm12-region | 0：0〜3、1：0〜3、2：0〜0 | 0：最初の語内インデックスを8+2×値（8/10/12/14）にする条件0〜3。1：最後の語で対象となるビット数を2+2×値（2/4/6/8）にする条件0〜3。開始相対語2、最後の相対語4で、位置=32+最初のインデックス、長さ=32−最初のインデックス+最後のビット数へ同期する。2：固定単位0。6語×16ビットの枠、対象の網掛け、最初/最後の相対アドレス・ビットインデックスと境界線を同じ入力で描く。原例44/24は[2,1,0]である。 |
| legacy-2019-spring-pm12-program | 0：0〜3、1：0〜3、2：0〜2 | 0：最初の語内インデックスを8+2×値（8/10/12/14）にする条件0〜3。1：最後の語で対象となるビット数を2+2×値（2/4/6/8）にする条件0〜3。開始相対語2、最後の相対語4で、位置=32+最初のインデックス、長さ=32−最初のインデックス+最後のビット数へ同期する。2：位置0=元BITSON、1=SETOP、2=BITSONのwrapper。原42/9/7行と空欄を保持し、有限の描画例から元プログラムの全unsigned域の正常性を主張しない。 |
| legacy-2019-spring-pm12-bank | 0：0〜3、1：0〜3、2：0〜4 | 0：最初の語内インデックスを8+2×値（8/10/12/14）にする条件0〜3。1：最後の語で対象となるビット数を2+2×値（2/4/6/8）にする条件0〜3。開始相対語2、最後の相対語4で、位置=32+最初のインデックス、長さ=32−最初のインデックス+最後のビット数へ同期する。2：群0=a、1=b/d共通、2=c、3=e、4=f。原6/6/6/3/6択を表示し、語内シフト・残数・終了分岐・CALLの役割を保つ。 |
| legacy-2019-spring-pm13-sales | 0：1〜16、1：0〜0 | 0：完全な販売明細と商品選択の条件1〜16。3333販売行・531登録会員を保ち、商品コード、単価・数量・合計、同額時の最終日の関係を同じ実データから計算する。生成例では531会員全員の指定商品購入が実データに含まれる。原の部分観測0は年度別原資料用であり、この生成域に含めない。1：固定単位0。図1の販売データの表示行・件数・最終行・7桁通番を反映する。非表示の原3333行は推定しない。 |
| legacy-2019-spring-pm13-members | 0：1〜16、1：0〜0 | 0：完全な販売明細と商品選択の条件1〜16。3333販売行・531登録会員を保ち、商品コード、単価・数量・合計、同額時の最終日の関係を同じ実データから計算する。生成例では531会員全員の指定商品購入が実データに含まれる。原の部分観測0は年度別原資料用であり、この生成域に含めない。1：固定単位0。図2の会員管理の購入金額・来店回数・最終日・分類・クーポンを明細から計算し、表示例と531件の範囲を同期する。 |
| legacy-2019-spring-pm13-ranks | 0：1〜16、1：0〜0 | 0：完全な販売明細と商品選択の条件1〜16。3333販売行・531登録会員を保ち、商品コード、単価・数量・合計、同額時の最終日の関係を同じ実データから計算する。生成例では531会員全員の指定商品購入が実データに含まれる。原の部分観測0は年度別原資料用であり、この生成域に含めない。1：固定単位0。表1のランク1/2/3と販売額合計・販売回数の境界を固定して表示し、マクロが使う比較条件の役割を保持する。 |
| legacy-2019-spring-pm13-classification | 0：1〜16、1：0〜0 | 0：完全な販売明細と商品選択の条件1〜16。3333販売行・531登録会員を保ち、商品コード、単価・数量・合計、同額時の最終日の関係を同じ実データから計算する。生成例では531会員全員の指定商品購入が実データに含まれる。原の部分観測0は年度別原資料用であり、この生成域に含めない。1：固定単位0。図3の分類表を表示する。金額境界とクーポンの役割を固定し、他のワークシートの式・分類との参照関係を保つ。 |
| legacy-2019-spring-pm13-bank | 0：1〜16、1：0〜5 | 0：完全な販売明細と商品選択の条件1〜16。3333販売行・531登録会員を保ち、商品コード、単価・数量・合計、同額時の最終日の関係を同じ実データから計算する。生成例では531会員全員の指定商品購入が実データに含まれる。原の部分観測0は年度別原資料用であり、この生成域に含めない。1：群0=a、1=b、2=c、3=d、4=e、5=f。全33択の参照範囲・端数・順位/同額時日付・入替処理の役割を維持する。 |
| legacy-2019-spring-pm13-product | 0：1〜16、1：0〜0 | 0：完全な販売明細と商品選択の条件1〜16。3333販売行・531登録会員を保ち、商品コード、単価・数量・合計、同額時の最終日の関係を同じ実データから計算する。生成例では531会員全員の指定商品購入が実データに含まれる。原の部分観測0は年度別原資料用であり、この生成域に含めない。1：固定単位0。図4の商品別管理へ商品コード・購入会員別金額・最終日と金額降順/同額時日付順を反映する。生成例の購入会員531・最終行533と、原資料の223・225を区別する。 |
| legacy-2019-spring-pm13-macro | 0：1〜16、1：0〜0 | 0：完全な販売明細と商品選択の条件1〜16。3333販売行・531登録会員を保ち、商品コード、単価・数量・合計、同額時の最終日の関係を同じ実データから計算する。生成例では531会員全員の指定商品購入が実データに含まれる。原の部分観測0は年度別原資料用であり、この生成域に含めない。1：固定単位0。manageMembersの全33行、制御の入れ子・空欄d/e/fに対応する処理を保持する。各会員の最終日は明細から実代入される生成例で検算し、原一般仕様の未代入値の扱いを補造しない。 |
| legacy-2019-autumn-pm1-telework-network-before | 0：0〜0 | 0：固定単位0。原のA社内LAN、FW、サーバ、PCとインターネットの接続を保持する。誤ったルールの送信元条件はこの導入前図を変えない。 |
| legacy-2019-autumn-pm1-telework-network-after | 0：0〜0 | 0：固定単位0。原のVPN・VDI導入後の接続と機器アドレスを保持する。ルールの送信元条件は本文の表へ反映し、このネットワーク図へ正答の経路を加えない。 |
| legacy-2019-autumn-pm2-parallel-split | 0：1〜4、1：0〜2 | 0：原プログラム番号。1：配列の分割範囲の条件。元の繰返しと二つのスレッドの開始・終了・処理式を同期し、実線のプログラム枠、破線の繰返し枠、二つの分割矢印を保持する。 |
| legacy-2019-autumn-pm2-parallel-ip | 0：0〜4 | 0：間接参照配列の5条件。添字1〜10と先頭5要素を表示し、後半5要素は空欄eとして保持する。 |
| legacy-2019-autumn-pm2-parallel-ip-option | 0：0〜4、1：0〜3 | 0：選択肢用の配列条件。1：4候補の位置。解答群の五つのセルを同じ候補順で表示し、配列の説明を解答前に補足しない。 |
| legacy-2019-autumn-pm3-library-schema | 0：0〜1 | 0：原の構成図1又は複数冊対応の構成図2。表名、列順、主キーの実線下線と外部キーの破線下線を保持する。年度・貸出回数の生成条件は図のキー構造を変えない。 |
| legacy-2019-autumn-pm4-nat-selection | 0：0〜0 | 0：固定単位0。静的NAT・動的NATについて、三つの利用場面を組み合わせる原の解答群を表示する。 |
| legacy-2019-autumn-pm4-nat-rewrite-table | 0：0〜0 | 0：固定単位0。書換え対象・書換え前・書換え後の見出し、送信時／返信時、対応するIPアドレスとポート番号の行を保持する。 |
| legacy-2019-autumn-pm4-nat-instruction | 0：0〜0 | 0：固定単位0。設問2の空欄と解答群を選ぶ指示を表示する。 |
| legacy-2019-autumn-pm4-nat-dns64-statement | 0：0〜0 | 0：固定単位0。DNS64の問で与えられる名前解決とアドレス合成の前提・注記を保持する。 |
| legacy-2019-autumn-pm4-nat64-packets | 0：0〜15、1：0〜5 | 0：16通りのネットワークアドレス条件。1：6通りのポート条件。四つのパケットの送信方向と16欄、IPv6のプレフィクスと12バイトの注記、空欄b/c/dを保持する。 |
| legacy-2019-autumn-pm5-stress-range | 0：0〜36、1：0〜2 | 0：37通りのテストデータ配置。1：数値例の3条件。判定領域の固定閾値・目盛り・網掛けを保つ独立作図であり、テストデータの条件は本文の表へ反映する。原の質問票文面と原図の画像は用いない。 |
| legacy-2019-autumn-pm5-stress-flow | 0：0〜36、1：0〜2 | 0：37通りのテストデータ配置。1：数値例の3条件。判定手順の接続、空欄a〜d、Yes/Noと代入を保持する。正答条件の埋込みや経路の強調は加えない。 |
| legacy-2019-autumn-pm6-test-progress | 0：0〜3、1：0〜4、2：0〜2、3：0〜1 | 0：規模・件数の倍率条件0〜3。1：実績バグ数の条件0〜4。2：進捗遅延原因0〜2。3：設計誤りの範囲0/1。進捗の軸、計画と実績、担当単位と凡例を保持し、本文の表・条件へ同期する。 |
| legacy-2019-autumn-pm8-bitap-text-array | 0：0〜3、1：0〜2 | 0：検索文字列の4配置。1：照合前半の3条件。文字列、パターン、配列・マスクと添字を同じ条件へ同期する。 |
| legacy-2019-autumn-pm8-bitap-program1 | 0：0〜0 | 0：固定単位0。原BitapMatchのプログラム1を、16ビット・添字・ループ条件・空欄の位置を保って表示する。 |
| legacy-2019-autumn-pm8-bitap-program2 | 0：0〜0 | 0：固定単位0。原BitapMatchのプログラム2を、初期化・比較・マスク・空欄の位置を保って表示する。 |
| legacy-2019-autumn-pm8-bitap-program3 | 0：0〜0 | 0：固定単位0。原BitapMatchのプログラム3を、定義・ループと空欄の位置を保って表示する。 |
| legacy-2019-autumn-pm12-packed-word | 0：0〜15、1：0〜1 | 0：数値例0〜15。1：図示する入力の符号条件（0は正、1は負）。16ビットのパック10進数で、3桁の数字と符号のニブル配置を本文の値へ同期する。 |
| legacy-2019-autumn-pm12-packed-add | 0：0〜15、1：0〜1 | 0：数値例0〜15。1：同符号入力の符号条件（0は共に正、1は共に負）。二つの16ビット入力と和の数字・符号ニブルを本文の同符号加算例へ同期する。原fの正解なしと生成版の独立した解答群修正は、本文・解答群の区分として保持する。 |
| legacy-2019-autumn-pm13-melon-packing | 0：0〜7、1：0〜4 | 0：出荷データ8条件。1：単価5条件。原のPackingマクロと空欄d/e/f、相対参照、5kg又は4個の条件、最後の未達箱を除く処理を保持する。原の非表示データの復元とは扱わない。 |
| legacy-2017-accounting-model | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-accounting-model」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-affiliate-workflow | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-affiliate-workflow」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-autumn-am-common-gates | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-autumn-am-common-gates」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-coverage-two-decisions | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-coverage-two-decisions」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-cumulative-bug-curve | 0：0〜2、1：0〜3 | 固定の有限組合せ12件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-cumulative-bug-curve」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-database-transport | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-database-transport」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-development-cost-table | 0：0〜2、1：0〜2、2：0〜2、3：0〜2 | 固定の有限組合せ78件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-development-cost-table」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-directory-tree | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-directory-tree」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-employment-contracts | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-employment-contracts」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-four-device-availability | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-four-device-availability」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-ftth-home-network | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-ftth-home-network」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-functional-dependencies | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-functional-dependencies」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-half-adder | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-half-adder」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-line-following-car | 0：0〜1 | 固定の有限組合せ2件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-line-following-car」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-logic-six-gates | 0：0〜1、1：0〜4 | 固定の有限組合せ10件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-logic-six-gates」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-memory-compaction | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-memory-compaction」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-mrp-flow | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-mrp-flow」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-multiplication-flow | 0：0〜2、1：0〜1 | 固定の有限組合せ6件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-multiplication-flow」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-page-replacement-choices | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-page-replacement-choices」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-project-critical-path | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-project-critical-path」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-sales-time-analysis | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-sales-time-analysis」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-uml-departments | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-uml-departments」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-usb-plug-cross-sections | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2017-usb-plug-cross-sections」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-array-list | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-array-list」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-autumn-am-common-gates | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-autumn-am-common-gates」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-autumn-customer-migration-table | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-autumn-customer-migration-table」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-autumn-membership-history | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-autumn-membership-history」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-autumn-nand-circuit | 0：0〜3、1：0〜3 | 固定の有限組合せ16件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-autumn-nand-circuit」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-autumn-network | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-autumn-network」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-autumn-procurement-flow | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-autumn-procurement-flow」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-autumn-project-network | 0：5〜15、1：5〜20、2：5〜20、3：10〜20、4：5〜20、5：5〜15、6：20〜40、7：5〜30 | 固定の有限組合せ8件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-autumn-project-network」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-coverage-flow | 0：4〜6、1：0〜2、2：0〜1 | 固定の有限組合せ18件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-coverage-flow」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-dispatch-relations | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-dispatch-relations」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-instruction-fetch | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-instruction-fetch」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-majority-circuit | 0：0〜2、1：0〜2、2：1〜3 | 固定の有限組合せ7件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-majority-circuit」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-majority-truth-table | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-majority-truth-table」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-priority-chart | 0：0〜2、1：0〜2、2：0〜3、3：0〜3、4：0〜3、5：0〜3、6：2〜3、7：0〜2、8：0〜2、9：0〜2、10：0〜2、11：0〜1、12：0〜2、13：0〜1、14：1〜2、15：0〜2、16：0〜2、17：0〜2、18：0〜3、19：0〜3、20：0〜3 | 固定の有限組合せ29件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-priority-chart」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-shorten-network | 0：4〜8、1：2〜4、2：2〜4、3：2〜2、4：2〜6、5：1〜2 | 固定の有限組合せ9件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-shorten-network」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-shortest-grid | 0：4〜5、1：3〜5、2：1〜2、3：1〜3 | 固定の有限組合せ8件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-shortest-grid」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-spring-am-common-gates | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-spring-am-common-gates」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2018-stack-state | 0：1〜6、1：4〜7、2：1〜6 | 固定の有限組合せ12件。各values全体と描画条件の一対一対応は後掲の「legacy-2018-stack-state」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-adjacency-graph | 0：0〜2、1：0〜3 | 固定の有限組合せ12件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-adjacency-graph」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-adjacency-matrix | 0：0〜2 | 固定の有限組合せ3件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-adjacency-matrix」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-autumn-am-common-gates | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-autumn-am-common-gates」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-bnf-rules | 0：0〜1 | 固定の有限組合せ2件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-bnf-rules」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-bst | 0：0〜3、1：0〜3、2：0〜3 | 固定の有限組合せ64件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-bst」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-composed-logic | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-composed-logic」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-critical-network | 0：0〜11 | 固定の有限組合せ12件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-critical-network」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-data-feedback | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-data-feedback」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-database-diagnosis | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-database-diagnosis」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-density-plot | 0：0〜2、1：0〜2、2：0〜3 | 固定の有限組合せ36件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-density-plot」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-dfd-symbols | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-dfd-symbols」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-gcd-flow | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-gcd-flow」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-home-network | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-home-network」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-interrupt-timing | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-interrupt-timing」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-score-relation | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-score-relation」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-serial-wave | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-serial-wave」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-spring-cause-effect | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-spring-cause-effect」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-truth-table | 0：0〜3 | 固定の有限組合せ4件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-truth-table」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-two-input-box | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-two-input-box」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2019-two-phase-locking | 0：0〜0 | 固定の有限組合せ1件。各values全体と描画条件の一対一対応は後掲の「legacy-2019-two-phase-locking」を参照。位置ごとの範囲内でも未登録の組合せは拒否する。 |
| legacy-2017-pm3-waste-database | 0：0〜0 | 図の入力[0]は固定の4表・14見出し・14データセル・5主キー下線を表す。問題の4条件と4正答署名は別の問題パラメータで切り替える。 |

旧午後の管理図は src/core/legacy-afternoon-figures.ts が登録された問題定義の有限入力から作る厳密なtuple辞書で検査する。上の上下限は外接域であり、個々の整数が範囲内でも未登録の組合せは拒否する。素材の出典と権利は基準問題の同じ本文・図・付属資料の単位から継承する。固定の問題本文画像は生成へ流用せず、登録された公式付属資料（正誤表・共通記法・API・言語仕様）だけを個別の素材条件・厳密なIDと位置で保持する。

## 旧午前図の有限入力と描画条件

各組合せは管理済み描画の同一性・入力契約であり、独立した内容検算や素材の許諾判断の代用ではない。valuesは要素ごとの直積から作らず、ここに記録する完全な列だけを受け付ける。描画条件は同じ入力に結び付けて査読・固定した読み上げ用説明を示す。問題の解説や正答を先に表示するための資料ではない。

### legacy-2017-accounting-model

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 勘定と会計取引が関連し、関連の移動は金額を持ち借方と貸方へ分かれる。勘定側の多重度は2..&#42;、会計取引側は&#42;。一つの会計取引に関する借方金額の合計と貸方金額の合計は一致する。 |

</details>

### legacy-2017-affiliate-workflow

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | Webサイト運営者の枠に商品広告、オンラインモールECサイト（広告主）の枠に商品の販売ページがあり、別にWebサイト閲覧者（商品の買い手）の枠がある。①はWebサイト運営者からオンラインモールECサイトへ向かう。②はWebサイト閲覧者から商品広告へ向かう。③は商品広告から商品の販売ページへ向かい、リンク先へ移動すると記されている。④はWebサイト閲覧者から商品の販売ページへ向かう。⑤はオンラインモールECサイトからWebサイト運営者へ向かう。 |

</details>

### legacy-2017-autumn-am-common-gates

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 問題文中で共通に使用される表記ルール。各問題文中に注記がない限り，次の表記ルールが適用されているものとする。表は図記号と説明の2列、次の9行。論理積は左が平面、右が半円の形に入力2本と出力1本。否定論理積はその出力部に○。論理和は入力側がくぼみ、出力側が尖った曲線形に入力2本と出力1本。否定論理和はその出力部に○。排他的論理和は論理和形の入力側にもう1本の曲線。論理一致は排他的論理和形の出力部に○。バッファは右向きの三角形に入力1本と出力1本。論理否定器はその出力部に○。スリーステートバッファは三角形にデータ入力、制御入力、出力。1行目、論理積素子（AND）。2行目、否定論理積素子（NAND）。3行目、論理和素子（OR）。4行目、否定論理和素子（NOR）。5行目、排他的論理和素子（XOR）。6行目、論理一致素子。7行目、バッファ。8行目、論理否定器（NOT）。9行目、スリーステートバッファ。注記　入力部又は出力部に示されている○印は，論理状態の反転又は否定を表す。 |

</details>

### legacy-2017-coverage-two-decisions

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 上からX&gt;1を判定し、真なら(X÷2)をXへ代入、偽なら代入を迂回して合流する。次にA=2 or B=0を判定し、真なら(X+1)をXへ代入、偽なら代入を迂回して下で合流する。両方の判定は全ての実行で到達する。 |

</details>

### legacy-2017-cumulative-bug-curve

<details><summary>許可する12組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化につれて発見の増え方が加速する右上がりの曲線。 |
| `[0,1]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化につれて累積件数が減少する右下がりの曲線。 |
| `[0,2]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化に比例して累積件数が増え続ける直線。 |
| `[0,3]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。当初増えた後、追加のバグ発見が少なくなり、累積件数が頭打ちへ近づくS字状の曲線。 |
| `[1,0]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化につれて発見の増え方が加速する右上がりの曲線。 |
| `[1,1]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化につれて累積件数が減少する右下がりの曲線。 |
| `[1,2]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化に比例して累積件数が増え続ける直線。 |
| `[1,3]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。当初増えた後、追加のバグ発見が少なくなり、累積件数が頭打ちへ近づくS字状の曲線。 |
| `[2,0]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化につれて発見の増え方が加速する右上がりの曲線。 |
| `[2,1]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化につれて累積件数が減少する右下がりの曲線。 |
| `[2,2]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。テスト消化に比例して累積件数が増え続ける直線。 |
| `[2,3]` | 縦軸は累積バグ件数、横軸はテスト項目消化件数。当初増えた後、追加のバグ発見が少なくなり、累積件数が頭打ちへ近づくS字状の曲線。 |

</details>

### legacy-2017-database-transport

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | クライアントとサーバの二つの外枠。クライアントの中は上にアプリケーション、下にデータベース接続プログラム、サーバの中は上にデータベース、下にデータベース接続プログラム。それぞれ上下の内枠を線で接続し、下のプログラムから共有の横線へ接続する。横線の両端は塗りつぶした四角。横線中央から、下にある「攻撃者による盗聴」の枠へ下向き破線矢印が伸びる。 |

</details>

### legacy-2017-development-cost-table

<details><summary>許可する78組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,0,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,0,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,0,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,0,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,0,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,0,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,0,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,1,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,1,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,1,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,1,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,1,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,1,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,1,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,1,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,2,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,2,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,2,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,2,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,2,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,2,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,2,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[0,2,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、1600、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,0,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,0,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,0,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,1,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,0,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[1,2,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2000、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,0,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,0,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3200、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,0,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,1,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3500、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,0,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,0,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,0,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,1,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,1,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,1,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,2,0]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,2,1]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |
| `[2,2,2,2]` | 原資料の形式に基づく改変表。開発方法、購入費（万円）、委託費（万円）、月当たりの人数（人）の作成工程・改造工程・評価工程の順。ア、サンプルを購入して社内で改造、2400、0、0、4、1。イ、社外に一括委託、0、3800、0、0、0。ウ、社内資産を改造、0、0、0、10、3。エ、社内で新規作成、0、0、10、0、2 |

</details>

### legacy-2017-directory-tree

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | ルートから3階層。各ディレクトリにはAとBの子ディレクトリがあり、同名でも親が異なると別のディレクトリである。 |

</details>

### legacy-2017-employment-contracts

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 企業Aと企業Bを横に置き，下に労働者Cを置く。企業Aと企業Bの間は両端に矢印がある線で結ばれ，「“契約”」と記す。企業Aと労働者Cの間も両端に矢印がある線で結ばれ，「雇用関係」と記す。企業Bと労働者Cの間は両端に矢印がある線で結ばれ，関係名は記されていない。 |

</details>

### legacy-2017-four-device-availability

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 2台の並列組を二つ直列に接続した、Rの4装置。 |
| `[1]` | 2台の直列枝を二つ並列に接続した、Rの4装置。 |
| `[2]` | Rの4装置を並列に接続した構成。 |

</details>

### legacy-2017-ftth-home-network

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 利用者宅内の複数PCがハブ、装置A、ONUの順で接続し、ONUから宅外へFTTHの光ファイバケーブルが延びる。 |

</details>

### legacy-2017-functional-dependencies

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | aからb、aからc、aからd、aからe、bからf、bからg、bからh、eからi、eからjへの矢印で関数従属を表す。 |
| `[1]` | aからb、aからc、aからd、aからe、bからf、bからg、bからh、fからi、fからjへの矢印で関数従属を表す。 |
| `[2]` | aからb、aからc、aからe、bからd、bからf、bからg、bからh、eからi、eからjへの矢印で関数従属を表す。 |

</details>

### legacy-2017-half-adder

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 二つの入力xとyが素子AとBの両方へ接続し、Aからz（和の1桁目）、Bからc（桁上げ）を出力する。黒丸は分岐接続点。 |

</details>

### legacy-2017-line-following-car

<details><summary>許可する2組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 黒色の円の全体図と、その右側を上向きに走る車の拡大図。車の前方にセンサLが左、センサRが右にあり、中央の前輪、制御部、左右の後輪とそれぞれのモータL・Rが示される。二つのセンサの間から車体の下へ黒色の帯が続き、進行方向の矢印は上向き。黒色に掛かる比率が大きいほど出力値は小さい。解答群の表は、センサL出力値＞センサR出力値のときと、センサL出力値＜センサR出力値のときについて、モータL・モータRの回転速度を示す。アは上げる・下げる・上げる・下げる。イは上げる・下げる・下げる・上げる。ウは下げる・上げる・上げる・下げる。エは下げる・上げる・下げる・上げる。出力値が一致するときには両モータを初期値に戻す。 |
| `[1]` | 黒色の円の全体図と、その右側を上向きに走る車の拡大図。車の前方にセンサLが左、センサRが右にあり、中央の前輪、制御部、左右の後輪とそれぞれのモータL・Rが示される。二つのセンサの間から車体の下へ黒色の帯が続き、進行方向の矢印は上向き。黒色に掛かる比率が大きいほど出力値は大きい。解答群の表は、センサL出力値＞センサR出力値のときと、センサL出力値＜センサR出力値のときについて、モータL・モータRの回転速度を示す。アは上げる・下げる・上げる・下げる。イは上げる・下げる・下げる・上げる。ウは下げる・上げる・上げる・下げる。エは下げる・上げる・下げる・上げる。出力値が一致するときには両モータを初期値に戻す。 |

</details>

### legacy-2017-logic-six-gates

<details><summary>許可する10組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0]` | ディジタル回路。入力Aは上側ANDと上側NOTへ、入力Bは下側ANDと下側NOTへ分岐する。二つのNOTの出力は中央ORの二入力に接続し、中央ORの出力は上下のANDの残る入力へ分岐する。上下のANDの出力を最後のORへ接続し、その出力がXになる。黒丸はA、B、中央ORの出力の三つの分岐点。 |
| `[0,1]` | X＝A・B＋（A・B全体の否定）。＋は論理和、・は論理積。 |
| `[0,2]` | X＝A・B＋（Aの否定）・（Bの否定）。＋は論理和、・は論理積。 |
| `[0,3]` | X＝A・（Bの否定）＋（Aの否定）・B。＋は論理和、・は論理積。 |
| `[0,4]` | X＝（Aの否定＋B）・（A＋Bの否定）。＋は論理和、・は論理積。 |
| `[1,0]` | ディジタル回路。入力Aは上側ANDと上側NOTへ、入力Bは下側ANDと下側NOTへ分岐する。二つのNOTの出力は中央ORの二入力に接続し、中央ORの出力は上下のANDの残る入力へ分岐する。上下のANDの出力を最後の出力に否定の小円を付けたORへ接続し、その出力がXになる。黒丸はA、B、中央ORの出力の三つの分岐点。 |
| `[1,1]` | X＝A・B＋（A・B全体の否定）。＋は論理和、・は論理積。 |
| `[1,2]` | X＝A・B＋（Aの否定）・（Bの否定）。＋は論理和、・は論理積。 |
| `[1,3]` | X＝A・（Bの否定）＋（Aの否定）・B。＋は論理和、・は論理積。 |
| `[1,4]` | X＝（A＋B）・（Aの否定＋Bの否定）。＋は論理和、・は論理積。 |

</details>

### legacy-2017-memory-compaction

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | メモリマップ。左からセグメント1が500kバイト、セグメント2が100kバイト、セグメント3が800kバイト、空き領域が800kバイト。四つの区画はこの順に隣接している。 |
| `[1]` | メモリマップ。左からセグメント1が400kバイト、セグメント2が200kバイト、セグメント3が600kバイト、空き領域が800kバイト。四つの区画はこの順に隣接している。 |
| `[2]` | メモリマップ。左からセグメント1が600kバイト、セグメント2が100kバイト、セグメント3が400kバイト、空き領域が800kバイト。四つの区画はこの順に隣接している。 |

</details>

### legacy-2017-mrp-flow

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 大日程計画、総所要量計算、正味所要量計算（不足分の計算）、発注量計算、手配計画、手配指示の順に五つの矢印でつながる。aから総所要量計算へ補助入力の矢印が入る。 |
| `[1]` | 大日程計画、総所要量計算、正味所要量計算（不足分の計算）、発注量計算、手配計画、手配指示の順に五つの矢印でつながる。aから正味所要量計算へ補助入力の矢印が入る。 |
| `[2]` | 大日程計画、総所要量計算、正味所要量計算（不足分の計算）、発注量計算、手配計画、手配指示の順に五つの矢印でつながる。aから発注量計算へ補助入力の矢印が入る。 |

</details>

### legacy-2017-multiplication-flow

<details><summary>許可する6組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0]` | 開始、XとYとZとiの初期化、aと1の比較、等しければZにXを加算、bの桁送り、iの加算、iと8の比較を行い、繰返し後にZを出力する流れ図。 |
| `[0,1]` | 開始、XとYとZとiの初期化、aと1の比較、等しければZにXを加算、bの桁送り、iの加算、iと8の比較を行い、繰返し後にZを出力する流れ図。 |
| `[1,0]` | 開始、XとYとZとiの初期化、aと1の比較、等しければZにXを加算、bの桁送り、iの加算、iと12の比較を行い、繰返し後にZを出力する流れ図。 |
| `[1,1]` | 開始、XとYとZとiの初期化、aと1の比較、等しければZにXを加算、bの桁送り、iの加算、iと12の比較を行い、繰返し後にZを出力する流れ図。 |
| `[2,0]` | 開始、XとYとZとiの初期化、aと1の比較、等しければZにXを加算、bの桁送り、iの加算、iと16の比較を行い、繰返し後にZを出力する流れ図。 |
| `[2,1]` | 開始、XとYとZとiの初期化、aと1の比較、等しければZにXを加算、bの桁送り、iの加算、iと16の比較を行い、繰返し後にZを出力する流れ図。 |

</details>

### legacy-2017-page-replacement-choices

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 解答群はア：FIFO3回/LRU2回、イ：FIFO3回/LRU6回、ウ：FIFO4回/LRU3回、エ：FIFO5回/LRU4回。 |

</details>

### legacy-2017-project-critical-path

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 9個の丸とAからLの12本の作業矢印。凡例では矢印の上が作業名、下が所要日数。左端の結合点から中央段左の結合点へ、作業A、2日。中央段左の結合点から上段左の結合点へ、作業B、3日。中央段左の結合点から中央段の左から二つ目の結合点へ、作業C、3日。中央段の左から二つ目の結合点から上段左の結合点へ、作業D、1日。上段左の結合点から中央段の左から三つ目の結合点へ、作業E、1日。中央段の左から二つ目の結合点から中央段の左から三つ目の結合点へ、作業F、3日。中央段の左から二つ目の結合点から下段の結合点へ、作業G、4日。中央段の左から三つ目の結合点から上段右の結合点へ、作業H、3日。中央段の左から三つ目の結合点から中央段の左から四つ目の結合点へ、作業I、2日。下段の結合点から中央段の左から四つ目の結合点へ、作業J、2日。上段右の結合点から右端の結合点へ、作業K、2日。中央段の左から四つ目の結合点から右端の結合点へ、作業L、3日。 |
| `[1]` | 9個の丸とAからLの12本の作業矢印。凡例では矢印の上が作業名、下が所要日数。左端の結合点から中央段左の結合点へ、作業A、2日。中央段左の結合点から上段左の結合点へ、作業B、3日。中央段左の結合点から中央段の左から二つ目の結合点へ、作業C、3日。中央段の左から二つ目の結合点から上段左の結合点へ、作業D、2日。上段左の結合点から中央段の左から三つ目の結合点へ、作業E、2日。中央段の左から二つ目の結合点から中央段の左から三つ目の結合点へ、作業F、3日。中央段の左から二つ目の結合点から下段の結合点へ、作業G、4日。中央段の左から三つ目の結合点から上段右の結合点へ、作業H、4日。中央段の左から三つ目の結合点から中央段の左から四つ目の結合点へ、作業I、2日。下段の結合点から中央段の左から四つ目の結合点へ、作業J、2日。上段右の結合点から右端の結合点へ、作業K、2日。中央段の左から四つ目の結合点から右端の結合点へ、作業L、3日。 |
| `[2]` | 9個の丸とAからLの12本の作業矢印。凡例では矢印の上が作業名、下が所要日数。左端の結合点から中央段左の結合点へ、作業A、2日。中央段左の結合点から上段左の結合点へ、作業B、2日。中央段左の結合点から中央段の左から二つ目の結合点へ、作業C、3日。中央段の左から二つ目の結合点から上段左の結合点へ、作業D、1日。上段左の結合点から中央段の左から三つ目の結合点へ、作業E、1日。中央段の左から二つ目の結合点から中央段の左から三つ目の結合点へ、作業F、4日。中央段の左から二つ目の結合点から下段の結合点へ、作業G、4日。中央段の左から三つ目の結合点から上段右の結合点へ、作業H、3日。中央段の左から三つ目の結合点から中央段の左から四つ目の結合点へ、作業I、3日。下段の結合点から中央段の左から四つ目の結合点へ、作業J、2日。上段右の結合点から右端の結合点へ、作業K、2日。中央段の左から四つ目の結合点から右端の結合点へ、作業L、3日。 |

</details>

### legacy-2017-sales-time-analysis

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 1日の業務活動の時間分析表。総業務時間8.0時間の内訳は顧客訪問時間5.0時間と社内業務時間3.0時間。社内業務時間の内訳は訪問準備時間1.5時間とその他業務時間1.5時間。別枠の1日の顧客訪問件数は5件。 |
| `[1]` | 1日の業務活動の時間分析表。総業務時間8.0時間の内訳は顧客訪問時間4.0時間と社内業務時間4.0時間。社内業務時間の内訳は訪問準備時間1.2時間とその他業務時間2.8時間。別枠の1日の顧客訪問件数は4件。 |
| `[2]` | 1日の業務活動の時間分析表。総業務時間8.0時間の内訳は顧客訪問時間4.0時間と社内業務時間4.0時間。社内業務時間の内訳は訪問準備時間1.6時間とその他業務時間2.4時間。別枠の1日の顧客訪問件数は4件。 |

</details>

### legacy-2017-uml-departments

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | データモデル。上に部門と社員、下に事業部の三クラス。事業部から部門へ中空三角が向く汎化。部門と社員の関連「所属する」は黒三角が左を向き、部門端1、社員端1..&#42;。部門と事業部の関連「管理する」は黒三角が上を向き、部門端1..&#42;、事業部端0..1。黒三角は関連名の読み順。 |
| `[1]` | データモデル。上に部門と社員、下に事業部の三クラス。事業部から部門へ中空三角が向く汎化。部門と社員の関連「所属する」は黒三角が左を向き、部門端1、社員端1..&#42;。部門と事業部の関連「管理する」は黒三角が上を向き、部門端1..&#42;、事業部端1。黒三角は関連名の読み順。 |
| `[2]` | データモデル。上に部門と社員、下に事業部の三クラス。事業部から部門へ中空三角が向く汎化。部門と社員の関連「所属する」は黒三角が左を向き、部門端1、社員端0..&#42;。部門と事業部の関連「管理する」は黒三角が上を向き、部門端1..&#42;、事業部端0..1。黒三角は関連名の読み順。 |

</details>

### legacy-2017-usb-plug-cross-sections

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 長方形の外郭の中に、下寄りの水平片と横一列の四つの接点がある。 |
| `[1]` | 横長で両端が丸い外郭の中に、横長の開口と上下二列それぞれ十二個の接点がある。上下の配置は対称である。 |
| `[2]` | 上部が横長で、左右の下部に段差のある外郭の中に、横一列の五つの接点がある。 |
| `[3]` | 左右の下隅が斜めになった外郭の中に、下向きに並ぶ五つの細長い部分がある。上辺に二つの突出部と三つの小さな突起がある。 |

</details>

### legacy-2018-array-list

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | boxとnextの二行の配列。どちらも添字0〜9。boxは0が空白、1〜9がA〜I。nextの0〜9の値は1、5、0、7、空白、3、空白、2、空白、空白。挿入前の状態。 |
| `[1]` | boxとnextの二行の配列。どちらも添字0〜9。boxは0が空白、1〜9がA〜I。nextの0〜9の値は1、3、7、5、空白、2、空白、0、空白、空白。挿入前の状態。 |
| `[2]` | boxとnextの二行の配列。どちらも添字0〜9。boxは0が空白、1〜9がA〜I。nextの0〜9の値は1、7、5、0、空白、3、空白、2、空白、空白。挿入前の状態。 |
| `[3]` | boxとnextの二行の配列。どちらも添字0〜9。boxは0が空白、1〜9がA〜I。nextの0〜9の値は1、2、7、5、空白、0、空白、3、空白、空白。挿入前の状態。 |

</details>

### legacy-2018-autumn-am-common-gates

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 問題文中で共通に使用される表記ルール。各問題文中に注記がない限り，次の表記ルールが適用されているものとする。表は図記号と説明の2列、次の9行。論理積は左が平面、右が半円の形に入力2本と出力1本。否定論理積はその出力部に○。論理和は入力側がくぼみ、出力側が尖った曲線形に入力2本と出力1本。否定論理和はその出力部に○。排他的論理和は論理和形の入力側にもう1本の曲線。論理一致は排他的論理和形の出力部に○。バッファは右向きの三角形に入力1本と出力1本。論理否定器はその出力部に○。スリーステートバッファは三角形にデータ入力、制御入力、出力。1行目、論理積素子（AND）。2行目、否定論理積素子（NAND）。3行目、論理和素子（OR）。4行目、否定論理和素子（NOR）。5行目、排他的論理和素子（XOR）。6行目、論理一致素子。7行目、バッファ。8行目、論理否定器（NOT）。9行目、スリーステートバッファ。注記　入力部又は出力部に示されている○印は，論理状態の反転又は否定を表す。 |

</details>

### legacy-2018-autumn-customer-migration-table

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左上角は開いており、見出しは人数、P、Q、R、S。Aは10,000人、乗換割合は0.5、0.3、0.1、0.1。Bは20,000人、乗換割合は0.1、0.6、0.1、0.1。Cは80,000人、乗換割合は0.1、0.1、0.3、0.3。既存顧客数は15,000、23,000、27,000、27,000。新規顧客数は5,000、7,000、13,000、23,000。末尾2行の見出しは左2列を結合。 |
| `[1]` | 左上角は開いており、見出しは人数、P、Q、R、S。Aは10,000人、乗換割合は0.5、0.3、0.1、0.1。Bは20,000人、乗換割合は0.1、0.6、0.1、0.1。Cは80,000人、乗換割合は0.1、0.1、0.3、0.3。既存顧客数は15,000、23,000、27,000、27,000。新規顧客数は5,000、7,000、13,000、27,000。末尾2行の見出しは左2列を結合。 |
| `[2]` | 左上角は開いており、見出しは人数、P、Q、R、S。Aは10,000人、乗換割合は0.5、0.3、0.1、0.1。Bは20,000人、乗換割合は0.1、0.6、0.1、0.2。Cは80,000人、乗換割合は0.1、0.1、0.3、0.3。既存顧客数は15,000、23,000、27,000、29,000。新規顧客数は5,000、7,000、13,000、30,000。末尾2行の見出しは左2列を結合。 |
| `[3]` | 左上角は開いており、見出しは人数、P、Q、R、S。Aは30,000人、乗換割合は0.5、0.3、0.1、0.1。Bは20,000人、乗換割合は0.1、0.6、0.1、0.1。Cは10,000人、乗換割合は0.1、0.1、0.3、0.3。既存顧客数は18,000、22,000、8,000、8,000。新規顧客数は12,000、7,000、13,000、23,000。末尾2行の見出しは左2列を結合。 |

</details>

### legacy-2018-autumn-membership-history

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左から部門、所属履歴、社員の三つのクラスを関連で結ぶ。部門は部門コード・部門名、所属履歴は開始日・終了日、社員は社員コード・氏名という属性を持ち、各属性欄末尾に省略記号がある。部門側と社員側の端はそれぞれ1、所属履歴側の二端は左が空欄a、右が空欄bである。 |

</details>

### legacy-2018-autumn-nand-circuit

<details><summary>許可する16組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0]` | 入力は上からA、B、C、D、右端が出力Y。全3個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとB。g2の二つの入力はCとD。g3の二つの入力はg1とg2。g3の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[0,1]` | 入力は上からA、B、C、D、右端が出力Y。全5個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとB。g2の二つの入力はCとD。g3の二つの入力はg1とg1。g4の二つの入力はg2とg2。g5の二つの入力はg3とg4。g5の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[0,2]` | 入力は上からA、B、C、D、右端が出力Y。全8個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとA。g2の二つの入力はBとB。g3の二つの入力はCとC。g4の二つの入力はDとD。g5の二つの入力はg1とg2。g6の二つの入力はg3とg4。g7の二つの入力はg5とg6。g8の二つの入力はg7とg7。g8の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[0,3]` | 入力は上からA、B、C、D、右端が出力Y。全10個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとA。g2の二つの入力はBとB。g3の二つの入力はCとC。g4の二つの入力はDとD。g5の二つの入力はg1とg2。g6の二つの入力はg3とg4。g7の二つの入力はg5とg5。g8の二つの入力はg6とg6。g9の二つの入力はg7とg8。g10の二つの入力はg9とg9。g10の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[1,0]` | 入力は上からA、B、C、D、右端が出力Y。全3個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとB。g2の二つの入力はCとD。g3の二つの入力はg1とg2。g3の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[1,1]` | 入力は上からA、B、C、D、右端が出力Y。全6個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとB。g2の二つの入力はCとD。g3の二つの入力はg1とg1。g4の二つの入力はg2とg2。g5の二つの入力はg3とg4。g6の二つの入力はg5とg5。g6の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[1,2]` | 入力は上からA、B、C、D、右端が出力Y。全8個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとA。g2の二つの入力はBとB。g3の二つの入力はCとC。g4の二つの入力はDとD。g5の二つの入力はg1とg2。g6の二つの入力はg3とg4。g7の二つの入力はg5とg6。g8の二つの入力はg7とg7。g8の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[1,3]` | 入力は上からA、B、C、D、右端が出力Y。全10個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとA。g2の二つの入力はBとB。g3の二つの入力はCとC。g4の二つの入力はDとD。g5の二つの入力はg1とg2。g6の二つの入力はg3とg4。g7の二つの入力はg5とg5。g8の二つの入力はg6とg6。g9の二つの入力はg7とg8。g10の二つの入力はg9とg9。g10の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[2,0]` | 入力は上からA、B、C、D、右端が出力Y。全3個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとB。g2の二つの入力はCとD。g3の二つの入力はg1とg2。g3の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[2,1]` | 入力は上からA、B、C、D、右端が出力Y。全5個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとB。g2の二つの入力はCとD。g3の二つの入力はg1とg1。g4の二つの入力はg2とg2。g5の二つの入力はg3とg4。g5の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[2,2]` | 入力は上からA、B、C、D、右端が出力Y。全8個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとA。g2の二つの入力はBとB。g3の二つの入力はCとC。g4の二つの入力はDとD。g5の二つの入力はg1とg2。g6の二つの入力はg3とg4。g7の二つの入力はg5とg6。g8の二つの入力はg7とg7。g8の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[2,3]` | 入力は上からA、B、C、D、右端が出力Y。全9個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとA。g2の二つの入力はBとB。g3の二つの入力はCとC。g4の二つの入力はDとD。g5の二つの入力はg1とg2。g6の二つの入力はg3とg4。g7の二つの入力はg5とg5。g8の二つの入力はg6とg6。g9の二つの入力はg7とg8。g9の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[3,0]` | 入力は上からA、B、C、D、右端が出力Y。全3個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとB。g2の二つの入力はCとD。g3の二つの入力はg1とg2。g3の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[3,1]` | 入力は上からA、B、C、D、右端が出力Y。全5個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとB。g2の二つの入力はCとD。g3の二つの入力はg1とg1。g4の二つの入力はg2とg2。g5の二つの入力はg3とg4。g5の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[3,2]` | 入力は上からA、B、C、D、右端が出力Y。全8個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとA。g2の二つの入力はBとB。g3の二つの入力はCとC。g4の二つの入力はDとD。g5の二つの入力はg1とg2。g6の二つの入力はg3とg4。g7の二つの入力はg5とg6。g8の二つの入力はg7とg7。g8の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |
| `[3,3]` | 入力は上からA、B、C、D、右端が出力Y。全10個は2入力NAND素子で、小さな丸は出力の反転を示す。g1の二つの入力はAとA。g2の二つの入力はBとB。g3の二つの入力はCとC。g4の二つの入力はDとD。g5の二つの入力はg1とg2。g6の二つの入力はg3とg4。g7の二つの入力はg5とg5。g8の二つの入力はg6とg6。g9の二つの入力はg7とg8。g10の二つの入力はg9とg9。g10の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。 |

</details>

### legacy-2018-autumn-network

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 福岡は左下、東京は右下、大阪は上。東京と福岡を結ぶ直結回線は実線で、大阪を経由する迂回回線は東京と大阪、大阪と福岡を結ぶ二つの破線である。 |

</details>

### legacy-2018-autumn-procurement-flow

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | aの箱：発注元はベンダにシステム化の目的や業務内容などを示し，情報提供を依頼する。。bの箱：発注元はベンダに調達対象システム，調達条件などを示し，提案書の提出を依頼する。。cの箱：発注元はベンダの提案書，能力などに基づいて，調達先を決定する。。dの箱：発注元と調達先の役割や責任分担などを，文書で相互に確認する。。aからb、bからc、cからdへ下向きの矢印。 |
| `[1]` | aの箱：発注元は新システムで扱う業務と導入目的を示し，各ベンダが提供できる技術や製品などの情報を求める。。bの箱：発注元は必要な機能，納期及び調達条件を示し，実現方法と費用を記載した提案書を各ベンダに求める。。cの箱：発注元は提出された提案書とベンダの遂行能力を比較評価し，調達先を決定する。。dの箱：発注元と調達先は，提供する業務の範囲，役割及び責任分担を文書で合意する。。aからb、bからc、cからdへ下向きの矢印。 |
| `[2]` | aの箱：発注元は新システムで扱う業務と導入目的を示し，各ベンダが提供できる技術や製品などの情報を求める。。bの箱：発注元は必要な機能，納期及び調達条件を示し，実現方法と費用を記載した提案書を各ベンダに求める。。cの箱：発注元は提出された提案書とベンダの遂行能力を比較評価し，調達先を決定する。。dの箱：発注元と調達先は，提供する業務の範囲，役割及び責任分担を文書で合意する。。aからb、bからc、cからdへ下向きの矢印。 |
| `[3]` | aの箱：発注元は新システムで扱う業務と導入目的を示し，各ベンダが提供できる技術や製品などの情報を求める。。bの箱：発注元は必要な機能，納期及び調達条件を示し，実現方法と費用を記載した提案書を各ベンダに求める。。cの箱：発注元は提出された提案書とベンダの遂行能力を比較評価し，調達先を決定する。。dの箱：発注元と調達先は，提供する業務の範囲，役割及び責任分担を文書で合意する。。aからb、bからc、cからdへ下向きの矢印。 |

</details>

### legacy-2018-autumn-project-network

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[10,20,10,15,10,10,30,20]` | 空白の円7個と矢印の作業日程図。開始からA10日でA後、開始からB20日で下段G前へ進む。A後からC10日で上段E前、D15日で中央D後へ進む。中央D後から上段E前へ破線のダミー、A後から下段G前へ破線のダミーがある。上段からE10日、中央からF10日、下段からG30日で合流し、H20日で終了する。実線の矢印の上に作業名、下に所要日数。凡例は空白円間の実線矢印と上下の作業名・所要日数、破線矢印はダミー作業を示す。 |
| `[10,5,10,15,10,5,40,30]` | 空白の円7個と矢印の作業日程図。開始からA10日でA後、開始からB5日で下段G前へ進む。A後からC10日で上段E前、D15日で中央D後へ進む。中央D後から上段E前へ破線のダミー、A後から下段G前へ破線のダミーがある。上段からE10日、中央からF5日、下段からG40日で合流し、H30日で終了する。実線の矢印の上に作業名、下に所要日数。凡例は空白円間の実線矢印と上下の作業名・所要日数、破線矢印はダミー作業を示す。 |
| `[10,5,10,15,15,5,40,15]` | 空白の円7個と矢印の作業日程図。開始からA10日でA後、開始からB5日で下段G前へ進む。A後からC10日で上段E前、D15日で中央D後へ進む。中央D後から上段E前へ破線のダミー、A後から下段G前へ破線のダミーがある。上段からE15日、中央からF5日、下段からG40日で合流し、H15日で終了する。実線の矢印の上に作業名、下に所要日数。凡例は空白円間の実線矢印と上下の作業名・所要日数、破線矢印はダミー作業を示す。 |
| `[10,5,10,15,20,15,25,10]` | 空白の円7個と矢印の作業日程図。開始からA10日でA後、開始からB5日で下段G前へ進む。A後からC10日で上段E前、D15日で中央D後へ進む。中央D後から上段E前へ破線のダミー、A後から下段G前へ破線のダミーがある。上段からE20日、中央からF15日、下段からG25日で合流し、H10日で終了する。実線の矢印の上に作業名、下に所要日数。凡例は空白円間の実線矢印と上下の作業名・所要日数、破線矢印はダミー作業を示す。 |
| `[10,5,20,10,15,10,20,5]` | 空白の円7個と矢印の作業日程図。開始からA10日でA後、開始からB5日で下段G前へ進む。A後からC20日で上段E前、D10日で中央D後へ進む。中央D後から上段E前へ破線のダミー、A後から下段G前へ破線のダミーがある。上段からE15日、中央からF10日、下段からG20日で合流し、H5日で終了する。実線の矢印の上に作業名、下に所要日数。凡例は空白円間の実線矢印と上下の作業名・所要日数、破線矢印はダミー作業を示す。 |
| `[10,5,20,10,20,10,25,10]` | 空白の円7個と矢印の作業日程図。開始からA10日でA後、開始からB5日で下段G前へ進む。A後からC20日で上段E前、D10日で中央D後へ進む。中央D後から上段E前へ破線のダミー、A後から下段G前へ破線のダミーがある。上段からE20日、中央からF10日、下段からG25日で合流し、H10日で終了する。実線の矢印の上に作業名、下に所要日数。凡例は空白円間の実線矢印と上下の作業名・所要日数、破線矢印はダミー作業を示す。 |
| `[15,5,10,20,15,10,20,25]` | 空白の円7個と矢印の作業日程図。開始からA15日でA後、開始からB5日で下段G前へ進む。A後からC10日で上段E前、D20日で中央D後へ進む。中央D後から上段E前へ破線のダミー、A後から下段G前へ破線のダミーがある。上段からE15日、中央からF10日、下段からG20日で合流し、H25日で終了する。実線の矢印の上に作業名、下に所要日数。凡例は空白円間の実線矢印と上下の作業名・所要日数、破線矢印はダミー作業を示す。 |
| `[5,15,5,10,5,5,20,10]` | 空白の円7個と矢印の作業日程図。開始からA5日でA後、開始からB15日で下段G前へ進む。A後からC5日で上段E前、D10日で中央D後へ進む。中央D後から上段E前へ破線のダミー、A後から下段G前へ破線のダミーがある。上段からE5日、中央からF5日、下段からG20日で合流し、H10日で終了する。実線の矢印の上に作業名、下に所要日数。凡例は空白円間の実線矢印と上下の作業名・所要日数、破線矢印はダミー作業を示す。 |

</details>

### legacy-2018-coverage-flow

<details><summary>許可する18組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[4,0,0]` | 上から処理1、判定A&gt;4 or B=0。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[4,0,1]` | 上から処理1、判定A&gt;4 and B=0。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[4,1,0]` | 上から処理1、判定A&gt;4 or B=1。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[4,1,1]` | 上から処理1、判定A&gt;4 and B=1。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[4,2,0]` | 上から処理1、判定A&gt;4 or B=2。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[4,2,1]` | 上から処理1、判定A&gt;4 and B=2。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[5,0,0]` | 上から処理1、判定A&gt;5 or B=0。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[5,0,1]` | 上から処理1、判定A&gt;5 and B=0。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[5,1,0]` | 上から処理1、判定A&gt;5 or B=1。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[5,1,1]` | 上から処理1、判定A&gt;5 and B=1。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[5,2,0]` | 上から処理1、判定A&gt;5 or B=2。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[5,2,1]` | 上から処理1、判定A&gt;5 and B=2。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[6,0,0]` | 上から処理1、判定A&gt;6 or B=0。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[6,0,1]` | 上から処理1、判定A&gt;6 and B=0。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[6,1,0]` | 上から処理1、判定A&gt;6 or B=1。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[6,1,1]` | 上から処理1、判定A&gt;6 and B=1。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[6,2,0]` | 上から処理1、判定A&gt;6 or B=2。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |
| `[6,2,1]` | 上から処理1、判定A&gt;6 and B=2。Yesは処理2を通り、Noは右側を通って処理2を飛ばす。両経路は下で合流して次へ進む。 |

</details>

### legacy-2018-dispatch-relations

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 三者の関係図。左上に派遣元企業、左下に労働者、右に派遣先企業を置き、三つの組合せを両矢印で結ぶ。太線は派遣元企業と労働者の間。その他の二辺は細線。 |
| `[1]` | 三者の関係図。左上に派遣元企業、左下に労働者、右に派遣先企業を置き、三つの組合せを両矢印で結ぶ。太線は派遣元企業と派遣先企業の間。その他の二辺は細線。 |
| `[2]` | 三者の関係図。左上に派遣元企業、左下に労働者、右に派遣先企業を置き、三つの組合せを両矢印で結ぶ。太線は派遣先企業と労働者の間。その他の二辺は細線。 |

</details>

### legacy-2018-instruction-fetch

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左に主記憶、右にプロセッサの囲み。主記憶から囲みの中のaへ、aから命令デコーダへ、右向きの矢印でつなぐ。 |

</details>

### legacy-2018-majority-circuit

<details><summary>許可する7組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,1,1]` | 入力A/B/Cの三線。最初の三つのANDゲートは上からAとB、BとC、AとCを受け取る。上二つの出力をORゲートへ入れ、その出力と下のゲートの出力を最後のORゲートへ入れてYを出す。入力線の枝分れは黒丸、接続しない交差は橋形で区別する。 |
| `[1,0,3]` | 入力A/B/Cの三線。最初の三つのORゲートは上からAとB、BとC、AとCを受け取る。上二つの出力をANDゲートへ入れ、その出力と下のゲートの出力を最後のNANDゲートへ入れてYを出す。入力線の枝分れは黒丸、接続しない交差は橋形で区別する。 |
| `[1,2,3]` | 入力A/B/Cの三線。最初の三つのORゲートは上からAとB、BとC、AとCを受け取る。上二つの出力をXORゲートへ入れ、その出力と下のゲートの出力を最後のNANDゲートへ入れてYを出す。入力線の枝分れは黒丸、接続しない交差は橋形で区別する。 |
| `[2,0,3]` | 入力A/B/Cの三線。最初の三つのXORゲートは上からAとB、BとC、AとCを受け取る。上二つの出力をANDゲートへ入れ、その出力と下のゲートの出力を最後のNANDゲートへ入れてYを出す。入力線の枝分れは黒丸、接続しない交差は橋形で区別する。 |
| `[2,1,1]` | 入力A/B/Cの三線。最初の三つのXORゲートは上からAとB、BとC、AとCを受け取る。上二つの出力をORゲートへ入れ、その出力と下のゲートの出力を最後のORゲートへ入れてYを出す。入力線の枝分れは黒丸、接続しない交差は橋形で区別する。 |
| `[2,1,2]` | 入力A/B/Cの三線。最初の三つのXORゲートは上からAとB、BとC、AとCを受け取る。上二つの出力をORゲートへ入れ、その出力と下のゲートの出力を最後のXORゲートへ入れてYを出す。入力線の枝分れは黒丸、接続しない交差は橋形で区別する。 |
| `[2,1,3]` | 入力A/B/Cの三線。最初の三つのXORゲートは上からAとB、BとC、AとCを受け取る。上二つの出力をORゲートへ入れ、その出力と下のゲートの出力を最後のNANDゲートへ入れてYを出す。入力線の枝分れは黒丸、接続しない交差は橋形で区別する。 |

</details>

### legacy-2018-majority-truth-table

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 真理値表。上段の入力はA/B/C、出力はY。入力000/001/010/011/100/101/110/111に対し、Yは0/0/0/1/0/1/1/1。 |

</details>

### legacy-2018-priority-chart

<details><summary>許可する29組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0,0,1,0,2,2,1,1,1,1,1,0,0,2,2,2,0,2,2,2]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、CPU、CPU、I/O、CPU、待ち、待ち。タスクB：I/O、I/O、I/O、I/O、I/O、CPU、CPU。タスクC：待ち、待ち、待ち、CPU、待ち、待ち、待ち。待ちは実行可能でCPU割当待ち。 |
| `[0,0,0,1,1,2,2,1,1,1,1,1,0,0,2,2,2,0,0,1,1]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、CPU、CPU、I/O、I/O、待ち、待ち。タスクB：I/O、I/O、I/O、I/O、I/O、CPU、CPU。タスクC：待ち、待ち、待ち、CPU、CPU、I/O、I/O。待ちは実行可能でCPU割当待ち。 |
| `[0,0,1,0,0,3,3,1,1,1,1,1,0,0,2,2,0,2,2,2,2]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、CPU、I/O、CPU、CPU、完了、完了。タスクB：I/O、I/O、I/O、I/O、I/O、CPU、CPU。タスクC：待ち、待ち、CPU、待ち、待ち、待ち、待ち。待ちは実行可能でCPU割当待ち。 |
| `[0,0,1,1,0,0,3,1,1,1,1,1,2,0,2,2,0,0,1,1,2]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、CPU、I/O、I/O、CPU、CPU、完了。タスクB：I/O、I/O、I/O、I/O、I/O、待ち、CPU。タスクC：待ち、待ち、CPU、CPU、I/O、I/O、待ち。待ちは実行可能でCPU割当待ち。 |
| `[0,0,3,3,3,3,3,0,1,1,1,1,1,0,1,0,0,0,3,3,3]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、CPU、完了、完了、完了、完了、完了。タスクB：CPU、I/O、I/O、I/O、I/O、I/O、CPU。タスクC：I/O、CPU、CPU、CPU、完了、完了、完了。待ちは実行可能でCPU割当待ち。 |
| `[0,0,3,3,3,3,3,1,1,1,1,1,0,0,1,0,0,0,3,3,3]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、CPU、完了、完了、完了、完了、完了。タスクB：I/O、I/O、I/O、I/O、I/O、CPU、CPU。タスクC：I/O、CPU、CPU、CPU、完了、完了、完了。待ちは実行可能でCPU割当待ち。 |
| `[0,0,3,3,3,3,3,2,2,0,0,0,1,1,2,2,2,2,2,0,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、CPU、完了、完了、完了、完了、完了。タスクB：待ち、待ち、CPU、CPU、CPU、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、CPU、CPU。待ちは実行可能でCPU割当待ち。 |
| `[0,0,3,3,3,3,3,2,2,0,0,1,1,1,2,2,2,2,0,0,1]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、CPU、完了、完了、完了、完了、完了。タスクB：待ち、待ち、CPU、CPU、I/O、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、CPU、CPU、I/O。待ちは実行可能でCPU割当待ち。 |
| `[0,1,1,0,0,3,3,1,1,1,1,1,0,0,2,0,0,1,1,2,2]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：CPU、I/O、I/O、CPU、CPU、完了、完了。タスクB：I/O、I/O、I/O、I/O、I/O、CPU、CPU。タスクC：待ち、CPU、CPU、I/O、I/O、待ち、待ち。待ちは実行可能でCPU割当待ち。 |
| `[1,0,0,3,3,3,3,0,1,1,1,1,1,0,1,0,0,0,3,3,3]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、CPU、CPU、完了、完了、完了、完了。タスクB：CPU、I/O、I/O、I/O、I/O、I/O、CPU。タスクC：I/O、CPU、CPU、CPU、完了、完了、完了。待ちは実行可能でCPU割当待ち。 |
| `[1,0,0,3,3,3,3,0,2,2,0,0,0,1,2,2,2,2,2,2,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、CPU、CPU、完了、完了、完了、完了。タスクB：CPU、待ち、待ち、CPU、CPU、CPU、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、待ち、CPU。待ちは実行可能でCPU割当待ち。 |
| `[1,0,0,3,3,3,3,0,2,2,0,0,1,1,2,2,2,2,2,0,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、CPU、CPU、完了、完了、完了、完了。タスクB：CPU、待ち、待ち、CPU、CPU、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、CPU、CPU。待ちは実行可能でCPU割当待ち。 |
| `[1,0,0,3,3,3,3,0,2,2,0,1,1,1,2,2,2,2,0,0,1]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、CPU、CPU、完了、完了、完了、完了。タスクB：CPU、待ち、待ち、CPU、I/O、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、CPU、CPU、I/O。待ちは実行可能でCPU割当待ち。 |
| `[1,0,0,3,3,3,3,1,1,1,1,1,0,0,1,0,0,0,3,3,3]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、CPU、CPU、完了、完了、完了、完了。タスクB：I/O、I/O、I/O、I/O、I/O、CPU、CPU。タスクC：I/O、CPU、CPU、CPU、完了、完了、完了。待ちは実行可能でCPU割当待ち。 |
| `[1,1,0,0,3,3,3,0,0,2,2,0,0,1,2,2,2,2,2,2,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、I/O、CPU、CPU、完了、完了、完了。タスクB：CPU、CPU、待ち、待ち、CPU、CPU、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、待ち、CPU。待ちは実行可能でCPU割当待ち。 |
| `[1,1,0,0,3,3,3,0,0,2,2,0,1,1,2,2,2,2,2,0,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、I/O、CPU、CPU、完了、完了、完了。タスクB：CPU、CPU、待ち、待ち、CPU、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、CPU、CPU。待ちは実行可能でCPU割当待ち。 |
| `[1,1,0,0,3,3,3,0,1,1,1,1,1,0,1,0,0,0,3,3,3]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、I/O、CPU、CPU、完了、完了、完了。タスクB：CPU、I/O、I/O、I/O、I/O、I/O、CPU。タスクC：I/O、CPU、CPU、CPU、完了、完了、完了。待ちは実行可能でCPU割当待ち。 |
| `[1,1,0,0,3,3,3,1,1,1,1,1,0,0,1,0,0,0,3,3,3]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、I/O、CPU、CPU、完了、完了、完了。タスクB：I/O、I/O、I/O、I/O、I/O、CPU、CPU。タスクC：I/O、CPU、CPU、CPU、完了、完了、完了。待ちは実行可能でCPU割当待ち。 |
| `[1,1,2,0,0,3,3,0,0,0,1,1,1,1,2,2,2,2,2,0,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、I/O、待ち、CPU、CPU、完了、完了。タスクB：CPU、CPU、CPU、I/O、I/O、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、CPU、CPU。待ちは実行可能でCPU割当待ち。 |
| `[1,1,2,2,0,0,3,0,0,0,0,1,1,1,2,2,2,2,2,2,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、I/O、待ち、待ち、CPU、CPU、完了。タスクB：CPU、CPU、CPU、CPU、I/O、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、待ち、CPU。待ちは実行可能でCPU割当待ち。 |
| `[1,2,2,0,0,3,3,0,0,0,1,1,1,1,2,2,2,2,2,0,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、待ち、待ち、CPU、CPU、完了、完了。タスクB：CPU、CPU、CPU、I/O、I/O、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、CPU、CPU。待ちは実行可能でCPU割当待ち。 |
| `[1,2,2,2,0,0,3,0,0,0,0,1,1,1,2,2,2,2,2,2,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、待ち、待ち、待ち、CPU、CPU、完了。タスクB：CPU、CPU、CPU、CPU、I/O、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、待ち、CPU。待ちは実行可能でCPU割当待ち。 |
| `[1,2,2,2,0,0,3,0,0,1,1,1,1,1,2,0,0,1,1,0,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：I/O、待ち、待ち、待ち、CPU、CPU、完了。タスクB：CPU、CPU、I/O、I/O、I/O、I/O、I/O。タスクC：待ち、CPU、CPU、I/O、I/O、CPU、CPU。待ちは実行可能でCPU割当待ち。 |
| `[2,0,0,0,1,0,2,0,1,1,1,1,1,0,2,2,2,2,0,2,2]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：待ち、CPU、CPU、CPU、I/O、CPU、待ち。タスクB：CPU、I/O、I/O、I/O、I/O、I/O、CPU。タスクC：待ち、待ち、待ち、待ち、CPU、待ち、待ち。待ちは実行可能でCPU割当待ち。 |
| `[2,0,0,0,1,1,2,0,1,1,1,1,1,0,2,2,2,2,0,0,1]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：待ち、CPU、CPU、CPU、I/O、I/O、待ち。タスクB：CPU、I/O、I/O、I/O、I/O、I/O、CPU。タスクC：待ち、待ち、待ち、待ち、CPU、CPU、I/O。待ちは実行可能でCPU割当待ち。 |
| `[2,0,0,1,0,0,3,0,1,1,1,1,1,0,2,2,2,0,2,2,2]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：待ち、CPU、CPU、I/O、CPU、CPU、完了。タスクB：CPU、I/O、I/O、I/O、I/O、I/O、CPU。タスクC：待ち、待ち、待ち、CPU、待ち、待ち、待ち。待ちは実行可能でCPU割当待ち。 |
| `[2,0,0,1,1,0,2,0,1,1,1,1,1,0,2,2,2,0,0,1,1]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：待ち、CPU、CPU、I/O、I/O、CPU、待ち。タスクB：CPU、I/O、I/O、I/O、I/O、I/O、CPU。タスクC：待ち、待ち、待ち、CPU、CPU、I/O、I/O。待ちは実行可能でCPU割当待ち。 |
| `[2,2,0,0,3,3,3,0,0,1,1,1,1,1,2,2,2,2,0,0,1]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：待ち、待ち、CPU、CPU、完了、完了、完了。タスクB：CPU、CPU、I/O、I/O、I/O、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、CPU、CPU、I/O。待ちは実行可能でCPU割当待ち。 |
| `[2,2,2,0,0,3,3,0,0,0,1,1,1,1,2,2,2,2,2,0,0]` | 3ミリ秒から10ミリ秒までの各1ミリ秒区間の状態。タスクA：待ち、待ち、待ち、CPU、CPU、完了、完了。タスクB：CPU、CPU、CPU、I/O、I/O、I/O、I/O。タスクC：待ち、待ち、待ち、待ち、待ち、CPU、CPU。待ちは実行可能でCPU割当待ち。 |

</details>

### legacy-2018-shorten-network

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[4,3,3,2,5,2]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=4日、B=3日、C=3日、D=2日、E=5日、F=2日。同じ表記の凡例を付ける。 |
| `[5,2,4,2,4,1]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=5日、B=2日、C=4日、D=2日、E=4日、F=1日。同じ表記の凡例を付ける。 |
| `[5,3,3,2,6,2]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=5日、B=3日、C=3日、D=2日、E=6日、F=2日。同じ表記の凡例を付ける。 |
| `[6,2,2,2,2,1]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=6日、B=2日、C=2日、D=2日、E=2日、F=1日。同じ表記の凡例を付ける。 |
| `[6,3,3,2,6,2]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=6日、B=3日、C=3日、D=2日、E=6日、F=2日。同じ表記の凡例を付ける。 |
| `[6,3,4,2,4,1]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=6日、B=3日、C=4日、D=2日、E=4日、F=1日。同じ表記の凡例を付ける。 |
| `[7,2,3,2,3,1]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=7日、B=2日、C=3日、D=2日、E=3日、F=1日。同じ表記の凡例を付ける。 |
| `[7,4,4,2,4,1]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=7日、B=4日、C=4日、D=2日、E=4日、F=1日。同じ表記の凡例を付ける。 |
| `[8,3,3,2,3,1]` | 作業のアローダイアグラム。開始からA又はBへ分岐。Bの後はC又はE、AとCの後にD、Eの後にFを行う。DとFが終了点へ合流する。作業名は矢印の上、所要日数は下。A=8日、B=3日、C=3日、D=2日、E=3日、F=1日。同じ表記の凡例を付ける。 |

</details>

### legacy-2018-shortest-grid

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[4,3,1,1]` | 横4区画、縦3区画の格子。Pは左下、Qは右上、RはPから右へ1区画、上へ1区画の交点。すべての隣接する交点を縦横の線で結ぶ。 |
| `[4,3,1,2]` | 横4区画、縦3区画の格子。Pは左下、Qは右上、RはPから右へ1区画、上へ2区画の交点。すべての隣接する交点を縦横の線で結ぶ。 |
| `[4,4,1,1]` | 横4区画、縦4区画の格子。Pは左下、Qは右上、RはPから右へ1区画、上へ1区画の交点。すべての隣接する交点を縦横の線で結ぶ。 |
| `[4,4,2,3]` | 横4区画、縦4区画の格子。Pは左下、Qは右上、RはPから右へ2区画、上へ3区画の交点。すべての隣接する交点を縦横の線で結ぶ。 |
| `[4,5,1,1]` | 横4区画、縦5区画の格子。Pは左下、Qは右上、RはPから右へ1区画、上へ1区画の交点。すべての隣接する交点を縦横の線で結ぶ。 |
| `[5,3,2,2]` | 横5区画、縦3区画の格子。Pは左下、Qは右上、RはPから右へ2区画、上へ2区画の交点。すべての隣接する交点を縦横の線で結ぶ。 |
| `[5,4,1,2]` | 横5区画、縦4区画の格子。Pは左下、Qは右上、RはPから右へ1区画、上へ2区画の交点。すべての隣接する交点を縦横の線で結ぶ。 |
| `[5,4,2,2]` | 横5区画、縦4区画の格子。Pは左下、Qは右上、RはPから右へ2区画、上へ2区画の交点。すべての隣接する交点を縦横の線で結ぶ。 |

</details>

### legacy-2018-spring-am-common-gates

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 問題文中で共通に使用される表記ルール。各問題文中に注記がない限り，次の表記ルールが適用されているものとする。表は図記号と説明の2列、次の9行。論理積は左が平面、右が半円の形に入力2本と出力1本。否定論理積はその出力部に○。論理和は入力側がくぼみ、出力側が尖った曲線形に入力2本と出力1本。否定論理和はその出力部に○。排他的論理和は論理和形の入力側にもう1本の曲線。論理一致は排他的論理和形の出力部に○。バッファは右向きの三角形に入力1本と出力1本。論理否定器はその出力部に○。スリーステートバッファは三角形にデータ入力、制御入力、出力。1行目、論理積素子（AND）。2行目、否定論理積素子（NAND）。3行目、論理和素子（OR）。4行目、否定論理和素子（NOR）。5行目、排他的論理和素子（XOR）。6行目、論理一致素子。7行目、バッファ。8行目、論理否定器（NOT）。9行目、スリーステートバッファ。注記　入力部又は出力部に示されている○印は，論理状態の反転又は否定を表す。 |

</details>

### legacy-2018-stack-state

<details><summary>許可する12組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[1,5,3]` | 上端が開いた縦のスタック。上から3、5、1、底から1、5、3。 |
| `[1,6,4]` | 上端が開いた縦のスタック。上から4、6、1、底から1、6、4。 |
| `[1,7,3]` | 上端が開いた縦のスタック。上から3、7、1、底から1、7、3。 |
| `[1,7,4]` | 上端が開いた縦のスタック。上から4、7、1、底から1、7、4。 |
| `[1,7,6]` | 上端が開いた縦のスタック。上から6、7、1、底から1、7、6。 |
| `[3,4,6]` | 上端が開いた縦のスタック。上から6、4、3、底から3、4、6。 |
| `[3,5,1]` | 上端が開いた縦のスタック。上から1、5、3、底から3、5、1。 |
| `[3,7,1]` | 上端が開いた縦のスタック。上から1、7、3、底から3、7、1。 |
| `[4,6,1]` | 上端が開いた縦のスタック。上から1、6、4、底から4、6、1。 |
| `[4,7,1]` | 上端が開いた縦のスタック。上から1、7、4、底から4、7、1。 |
| `[6,4,3]` | 上端が開いた縦のスタック。上から3、4、6、底から6、4、3。 |
| `[6,7,1]` | 上端が開いた縦のスタック。上から1、7、6、底から6、7、1。 |

</details>

### legacy-2019-adjacency-graph

<details><summary>許可する12組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとd、cとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[0,1]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[0,2]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、cとd、cとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[0,3]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、cとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[1,0]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとd、cとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[1,1]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、cとd、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[1,2]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[1,3]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、cとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[2,0]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとd、bとe、cとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[2,1]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、bとe、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[2,2]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、cとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |
| `[2,3]` | 横にa,b,c,d,e,fの丸。結ぶ線はaとb、bとc、bとd、bとe、cとd、cとe、dとe、eとf。離れた丸の間は弧で結び、途中の丸とは接続しない。 |

</details>

### legacy-2019-adjacency-matrix

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 隣接行列。行と列はともにa,b,c,d,e,fの順。角括弧内の6行は、0,1,0,0,0,0；1,0,1,1,0,0；0,1,0,1,1,0；0,1,1,0,0,0；0,0,1,0,0,1；0,0,0,0,1,0。 |
| `[1]` | 隣接行列。行と列はともにa,b,c,d,e,fの順。角括弧内の6行は、0,1,0,0,0,0；1,0,1,1,0,0；0,1,0,0,1,0；0,1,0,0,1,0；0,0,1,1,0,1；0,0,0,0,1,0。 |
| `[2]` | 隣接行列。行と列はともにa,b,c,d,e,fの順。角括弧内の6行は、0,1,0,0,0,0；1,0,1,1,0,0；0,1,0,1,1,0；0,1,1,0,1,0；0,0,1,1,0,1；0,0,0,0,1,0。 |

</details>

### legacy-2019-autumn-am-common-gates

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 問題文中で共通に使用される表記ルール。各問題文中に注記がない限り，次の表記ルールが適用されているものとする。 〔論理回路〕。図記号，説明の2列の表。1行目：論理積素子（AND）。2行目：否定論理積素子（NAND）。3行目：論理和素子（OR）。4行目：否定論理和素子（NOR）。5行目：排他的論理和素子（XOR）。6行目：論理一致素子。7行目：バッファ。8行目：論理否定素子（NOT）。9行目：スリーステートバッファ。論理積は入力側が平面，出力側が半円の図形。否定論理積はその出力に○。論理和は入力側がくぼみ，出力側が尖った曲線形。否定論理和はその出力に○。排他的論理和は論理和形の入力側に追加の曲線。論理一致は排他的論理和形の出力に○。ここまで各入力2本，出力1本。バッファは右向き三角形，論理否定素子は同じ三角形の出力に○，各入力1本，出力1本。スリーステートバッファは右向き三角形に左から入力，上から制御入力，右に出力。最終行の図記号は二つの長方形の例。上は入力部に○，下は出力部に○。素子や回路の入力部又は出力部に示される○印は，論理状態の反転又は否定を表す。 |

</details>

### legacy-2019-bnf-rules

<details><summary>許可する2組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | BNFの4定義。&lt;数字&gt; ::= 0&#124;1&#124;2&#124;3&#124;4&#124;5&#124;6&#124;7&#124;8&#124;9；&lt;英字&gt; ::= A&#124;B&#124;C&#124;D&#124;E&#124;F；&lt;英数字&gt; ::= &lt;英字&gt;&#124;&lt;数字&gt;&#124;&#95;；&lt;変数名&gt; ::= &lt;英字&gt;&#124;&lt;変数名&gt;&lt;英数字&gt;。 |
| `[1]` | BNFの4定義。&lt;数字&gt; ::= 0&#124;1&#124;2&#124;3&#124;4&#124;5&#124;6&#124;7&#124;8&#124;9；&lt;英字&gt; ::= A&#124;B&#124;C&#124;D&#124;E&#124;F；&lt;英数字&gt; ::= &lt;英字&gt;&#124;&lt;数字&gt;&#124;&#95;；&lt;変数名&gt; ::= &lt;英字&gt;&#124;&lt;英数字&gt;&lt;変数名&gt;。 |

</details>

### legacy-2019-bst

<details><summary>許可する64組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0,0]` | 根の値は1。値1の左の子は2、右の子は3。値2の左の子は4、右の子は5。値3の左の子は6、右の子は7。値6の左の子は8、右の子は9。 |
| `[0,0,1]` | 根の値は2。値2の左の子は3、右の子は4。値3の左の子は5、右の子は6。値4の左の子は7、右の子は8。値7の左の子は9、右の子は10。 |
| `[0,0,2]` | 根の値は3。値3の左の子は4、右の子は5。値4の左の子は6、右の子は7。値5の左の子は8、右の子は9。値8の左の子は10、右の子は11。 |
| `[0,0,3]` | 根の値は4。値4の左の子は5、右の子は6。値5の左の子は7、右の子は8。値6の左の子は9、右の子は10。値9の左の子は11、右の子は12。 |
| `[0,1,0]` | 根の値は4。値4の左の子は2、右の子は8。値2の左の子は1、右の子は3。値8の左の子は6、右の子は9。値6の左の子は5、右の子は7。 |
| `[0,1,1]` | 根の値は5。値5の左の子は3、右の子は9。値3の左の子は2、右の子は4。値9の左の子は7、右の子は10。値7の左の子は6、右の子は8。 |
| `[0,1,2]` | 根の値は6。値6の左の子は4、右の子は10。値4の左の子は3、右の子は5。値10の左の子は8、右の子は11。値8の左の子は7、右の子は9。 |
| `[0,1,3]` | 根の値は7。値7の左の子は5、右の子は11。値5の左の子は4、右の子は6。値11の左の子は9、右の子は12。値9の左の子は8、右の子は10。 |
| `[0,2,0]` | 根の値は7。値7の左の子は6、右の子は8。値6の左の子は4、右の子は5。値8の左の子は3、右の子は9。値3の左の子は1、右の子は2。 |
| `[0,2,1]` | 根の値は8。値8の左の子は7、右の子は9。値7の左の子は5、右の子は6。値9の左の子は4、右の子は10。値4の左の子は2、右の子は3。 |
| `[0,2,2]` | 根の値は9。値9の左の子は8、右の子は10。値8の左の子は6、右の子は7。値10の左の子は5、右の子は11。値5の左の子は3、右の子は4。 |
| `[0,2,3]` | 根の値は10。値10の左の子は9、右の子は11。値9の左の子は7、右の子は8。値11の左の子は6、右の子は12。値6の左の子は4、右の子は5。 |
| `[0,3,0]` | 根の値は9。値9の左の子は7、右の子は8。値7の左の子は1、右の子は2。値8の左の子は5、右の子は6。値5の左の子は3、右の子は4。 |
| `[0,3,1]` | 根の値は10。値10の左の子は8、右の子は9。値8の左の子は2、右の子は3。値9の左の子は6、右の子は7。値6の左の子は4、右の子は5。 |
| `[0,3,2]` | 根の値は11。値11の左の子は9、右の子は10。値9の左の子は3、右の子は4。値10の左の子は7、右の子は8。値7の左の子は5、右の子は6。 |
| `[0,3,3]` | 根の値は12。値12の左の子は10、右の子は11。値10の左の子は4、右の子は5。値11の左の子は8、右の子は9。値8の左の子は6、右の子は7。 |
| `[1,0,0]` | 根の値は6。値6の左の子は4、右の子は8。値4の左の子は2、右の子は5。値8の左の子は7、右の子は9。値2の左の子は1、右の子は3。 |
| `[1,0,1]` | 根の値は7。値7の左の子は5、右の子は9。値5の左の子は3、右の子は6。値9の左の子は8、右の子は10。値3の左の子は2、右の子は4。 |
| `[1,0,2]` | 根の値は8。値8の左の子は6、右の子は10。値6の左の子は4、右の子は7。値10の左の子は9、右の子は11。値4の左の子は3、右の子は5。 |
| `[1,0,3]` | 根の値は9。値9の左の子は7、右の子は11。値7の左の子は5、右の子は8。値11の左の子は10、右の子は12。値5の左の子は4、右の子は6。 |
| `[1,1,0]` | 根の値は4。値4の左の子は3、右の子は8。値3の左の子は1、右の子は2。値8の左の子は6、右の子は9。値6の左の子は5、右の子は7。 |
| `[1,1,1]` | 根の値は5。値5の左の子は4、右の子は9。値4の左の子は2、右の子は3。値9の左の子は7、右の子は10。値7の左の子は6、右の子は8。 |
| `[1,1,2]` | 根の値は6。値6の左の子は5、右の子は10。値5の左の子は3、右の子は4。値10の左の子は8、右の子は11。値8の左の子は7、右の子は9。 |
| `[1,1,3]` | 根の値は7。値7の左の子は6、右の子は11。値6の左の子は4、右の子は5。値11の左の子は9、右の子は12。値9の左の子は8、右の子は10。 |
| `[1,2,0]` | 根の値は7。値7の左の子は6、右の子は8。値6の左の子は4、右の子は5。値8の左の子は3、右の子は9。値3の左の子は1、右の子は2。 |
| `[1,2,1]` | 根の値は8。値8の左の子は7、右の子は9。値7の左の子は5、右の子は6。値9の左の子は4、右の子は10。値4の左の子は2、右の子は3。 |
| `[1,2,2]` | 根の値は9。値9の左の子は8、右の子は10。値8の左の子は6、右の子は7。値10の左の子は5、右の子は11。値5の左の子は3、右の子は4。 |
| `[1,2,3]` | 根の値は10。値10の左の子は9、右の子は11。値9の左の子は7、右の子は8。値11の左の子は6、右の子は12。値6の左の子は4、右の子は5。 |
| `[1,3,0]` | 根の値は9。値9の左の子は7、右の子は8。値7の左の子は1、右の子は2。値8の左の子は5、右の子は6。値5の左の子は3、右の子は4。 |
| `[1,3,1]` | 根の値は10。値10の左の子は8、右の子は9。値8の左の子は2、右の子は3。値9の左の子は6、右の子は7。値6の左の子は4、右の子は5。 |
| `[1,3,2]` | 根の値は11。値11の左の子は9、右の子は10。値9の左の子は3、右の子は4。値10の左の子は7、右の子は8。値7の左の子は5、右の子は6。 |
| `[1,3,3]` | 根の値は12。値12の左の子は10、右の子は11。値10の左の子は4、右の子は5。値11の左の子は8、右の子は9。値8の左の子は6、右の子は7。 |
| `[2,0,0]` | 根の値は1。値1の左の子は2、右の子は3。値2の左の子は4、右の子は5。値3の左の子は6、右の子は7。値6の左の子は8、右の子は9。 |
| `[2,0,1]` | 根の値は2。値2の左の子は3、右の子は4。値3の左の子は5、右の子は6。値4の左の子は7、右の子は8。値7の左の子は9、右の子は10。 |
| `[2,0,2]` | 根の値は3。値3の左の子は4、右の子は5。値4の左の子は6、右の子は7。値5の左の子は8、右の子は9。値8の左の子は10、右の子は11。 |
| `[2,0,3]` | 根の値は4。値4の左の子は5、右の子は6。値5の左の子は7、右の子は8。値6の左の子は9、右の子は10。値9の左の子は11、右の子は12。 |
| `[2,1,0]` | 根の値は4。値4の左の子は3、右の子は8。値3の左の子は1、右の子は2。値8の左の子は6、右の子は9。値6の左の子は5、右の子は7。 |
| `[2,1,1]` | 根の値は5。値5の左の子は4、右の子は9。値4の左の子は2、右の子は3。値9の左の子は7、右の子は10。値7の左の子は6、右の子は8。 |
| `[2,1,2]` | 根の値は6。値6の左の子は5、右の子は10。値5の左の子は3、右の子は4。値10の左の子は8、右の子は11。値8の左の子は7、右の子は9。 |
| `[2,1,3]` | 根の値は7。値7の左の子は6、右の子は11。値6の左の子は4、右の子は5。値11の左の子は9、右の子は12。値9の左の子は8、右の子は10。 |
| `[2,2,0]` | 根の値は6。値6の左の子は2、右の子は8。値2の左の子は1、右の子は4。値8の左の子は7、右の子は9。値4の左の子は3、右の子は5。 |
| `[2,2,1]` | 根の値は7。値7の左の子は3、右の子は9。値3の左の子は2、右の子は5。値9の左の子は8、右の子は10。値5の左の子は4、右の子は6。 |
| `[2,2,2]` | 根の値は8。値8の左の子は4、右の子は10。値4の左の子は3、右の子は6。値10の左の子は9、右の子は11。値6の左の子は5、右の子は7。 |
| `[2,2,3]` | 根の値は9。値9の左の子は5、右の子は11。値5の左の子は4、右の子は7。値11の左の子は10、右の子は12。値7の左の子は6、右の子は8。 |
| `[2,3,0]` | 根の値は9。値9の左の子は7、右の子は8。値7の左の子は1、右の子は2。値8の左の子は5、右の子は6。値5の左の子は3、右の子は4。 |
| `[2,3,1]` | 根の値は10。値10の左の子は8、右の子は9。値8の左の子は2、右の子は3。値9の左の子は6、右の子は7。値6の左の子は4、右の子は5。 |
| `[2,3,2]` | 根の値は11。値11の左の子は9、右の子は10。値9の左の子は3、右の子は4。値10の左の子は7、右の子は8。値7の左の子は5、右の子は6。 |
| `[2,3,3]` | 根の値は12。値12の左の子は10、右の子は11。値10の左の子は4、右の子は5。値11の左の子は8、右の子は9。値8の左の子は6、右の子は7。 |
| `[3,0,0]` | 根の値は1。値1の左の子は2、右の子は3。値2の左の子は4、右の子は5。値3の左の子は6、右の子は7。値6の左の子は8、右の子は9。 |
| `[3,0,1]` | 根の値は2。値2の左の子は3、右の子は4。値3の左の子は5、右の子は6。値4の左の子は7、右の子は8。値7の左の子は9、右の子は10。 |
| `[3,0,2]` | 根の値は3。値3の左の子は4、右の子は5。値4の左の子は6、右の子は7。値5の左の子は8、右の子は9。値8の左の子は10、右の子は11。 |
| `[3,0,3]` | 根の値は4。値4の左の子は5、右の子は6。値5の左の子は7、右の子は8。値6の左の子は9、右の子は10。値9の左の子は11、右の子は12。 |
| `[3,1,0]` | 根の値は4。値4の左の子は3、右の子は8。値3の左の子は1、右の子は2。値8の左の子は6、右の子は9。値6の左の子は5、右の子は7。 |
| `[3,1,1]` | 根の値は5。値5の左の子は4、右の子は9。値4の左の子は2、右の子は3。値9の左の子は7、右の子は10。値7の左の子は6、右の子は8。 |
| `[3,1,2]` | 根の値は6。値6の左の子は5、右の子は10。値5の左の子は3、右の子は4。値10の左の子は8、右の子は11。値8の左の子は7、右の子は9。 |
| `[3,1,3]` | 根の値は7。値7の左の子は6、右の子は11。値6の左の子は4、右の子は5。値11の左の子は9、右の子は12。値9の左の子は8、右の子は10。 |
| `[3,2,0]` | 根の値は7。値7の左の子は6、右の子は8。値6の左の子は4、右の子は5。値8の左の子は3、右の子は9。値3の左の子は1、右の子は2。 |
| `[3,2,1]` | 根の値は8。値8の左の子は7、右の子は9。値7の左の子は5、右の子は6。値9の左の子は4、右の子は10。値4の左の子は2、右の子は3。 |
| `[3,2,2]` | 根の値は9。値9の左の子は8、右の子は10。値8の左の子は6、右の子は7。値10の左の子は5、右の子は11。値5の左の子は3、右の子は4。 |
| `[3,2,3]` | 根の値は10。値10の左の子は9、右の子は11。値9の左の子は7、右の子は8。値11の左の子は6、右の子は12。値6の左の子は4、右の子は5。 |
| `[3,3,0]` | 根の値は4。値4の左の子は2、右の子は6。値2の左の子は1、右の子は3。値6の左の子は5、右の子は8。値8の左の子は7、右の子は9。 |
| `[3,3,1]` | 根の値は5。値5の左の子は3、右の子は7。値3の左の子は2、右の子は4。値7の左の子は6、右の子は9。値9の左の子は8、右の子は10。 |
| `[3,3,2]` | 根の値は6。値6の左の子は4、右の子は8。値4の左の子は3、右の子は5。値8の左の子は7、右の子は10。値10の左の子は9、右の子は11。 |
| `[3,3,3]` | 根の値は7。値7の左の子は5、右の子は9。値5の左の子は4、右の子は6。値9の左の子は8、右の子は11。値11の左の子は10、右の子は12。 |

</details>

### legacy-2019-composed-logic

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 入力A、Bから二つのNOT、二つのAND、一つのORを接続して出力Xを得る。黒丸は分岐の接続点で、黒丸のない交差だけでは接続しない。上側のNOTは入力Aの値を入力する。下側のNOTは入力Bの値を入力する。上側のANDは上側のNOTと入力Bの出力を入力する。下側のANDは入力Aと下側のNOTの出力を入力する。右側のORは上側のANDと下側のANDの出力を入力する。右側のORの出力がXである。 |
| `[1]` | 入力A、Bから二つのNOT、二つのAND、一つのORを接続して出力Xを得る。黒丸は分岐の接続点で、黒丸のない交差だけでは接続しない。左側のNOTは入力Aの値を入力する。右側のNOTは左側のNOTの出力を入力する。上側のANDは右側のNOTと入力Bの出力を入力する。下側のANDは入力Aと入力Bの値を入力する。右側のORは上側のANDと下側のANDの出力を入力する。右側のORの出力がXである。 |
| `[2]` | 入力A、Bから二つのNOT、二つのAND、一つのORを接続して出力Xを得る。黒丸は分岐の接続点で、黒丸のない交差だけでは接続しない。上側のNOTは入力Aの値を入力する。下側のNOTは入力Bの値を入力する。上側のANDは上側のNOTと下側のNOTの出力を入力する。下側のANDは上側のNOTと下側のNOTの出力を入力する。右側のORは上側のANDと下側のANDの出力を入力する。右側のORの出力がXである。 |
| `[3]` | 入力A、Bから二つのNOT、二つのAND、一つのORを接続して出力Xを得る。黒丸は分岐の接続点で、黒丸のない交差だけでは接続しない。上側のANDは入力Aと入力Bの値を入力する。下側のANDは入力Aと入力Bの値を入力する。上側のNOTは上側のANDの出力を入力する。下側のNOTは下側のANDの出力を入力する。右側のORは上側のNOTと下側のNOTの出力を入力する。右側のORの出力がXである。 |

</details>

### legacy-2019-critical-network

<details><summary>許可する12組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 5日、上左から下左へC 3日、上左から上右へD 3日、下左から下右へE 4日、下右から右端へF 5日、上右から右端へG 4日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[1]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 3日、上左から上右へD 3日、下左から下右へE 2日、下右から右端へF 5日、上右から右端へG 3日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[10]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 1日、上左から上右へD 3日、下左から下右へE 2日、下右から右端へF 5日、上右から右端へG 6日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[11]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 1日、上左から上右へD 3日、下左から下右へE 4日、下右から右端へF 3日、上右から右端へG 4日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[2]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 3日、上左から上右へD 3日、下左から下右へE 2日、下右から右端へF 5日、上右から右端へG 4日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[3]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 3日、上左から上右へD 3日、下左から下右へE 2日、下右から右端へF 7日、上右から右端へG 3日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[4]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 1日、上左から上右へD 6日、下左から下右へE 2日、下右から右端へF 3日、上右から右端へG 3日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[5]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 1日、上左から上右へD 6日、下左から下右へE 2日、下右から右端へF 3日、上右から右端へG 4日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[6]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 1日、上左から上右へD 6日、下左から下右へE 2日、下右から右端へF 3日、上右から右端へG 6日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[7]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 1日、上左から上右へD 3日、下左から下右へE 2日、下右から右端へF 5日、上右から右端へG 3日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[8]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 1日、上左から上右へD 3日、下左から下右へE 2日、下右から右端へF 5日、上右から右端へG 4日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |
| `[9]` | 空の丸6個。左端から上左へA 1日、左端から下左へB 3日、上左から下左へC 1日、上左から上右へD 3日、下左から下右へE 2日、下右から右端へF 3日、上右から右端へG 6日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。 |

</details>

### legacy-2019-data-feedback

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 行は顧客全体と顧客個々、列は一定期間ごとと即時。aは全体/期間ごと、bは全体/即時、cは個々/期間ごと、dは個々/即時。問うセルaを太枠で示す。 |
| `[1]` | 行は顧客全体と顧客個々、列は一定期間ごとと即時。aは全体/期間ごと、bは全体/即時、cは個々/期間ごと、dは個々/即時。問うセルbを太枠で示す。 |
| `[2]` | 行は顧客全体と顧客個々、列は一定期間ごとと即時。aは全体/期間ごと、bは全体/即時、cは個々/期間ごと、dは個々/即時。問うセルcを太枠で示す。 |
| `[3]` | 行は顧客全体と顧客個々、列は一定期間ごとと即時。aは全体/期間ごと、bは全体/即時、cは個々/期間ごと、dは個々/即時。問うセルdを太枠で示す。 |

</details>

### legacy-2019-database-diagnosis

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | aは他システムの共存による負荷増加とクライアント数増加による通信量増加、bは非定型検索の長時間SQL、cはフラグメンテーションによるディスクI/O増加、dはデータベースバッファ不足。 |
| `[1]` | aは他システムの共存による負荷増加とクライアント数増加による通信量増加、bは非定型検索の長時間SQL、cはフラグメンテーションによるディスクI/O増加、dはデータベースバッファ不足。 |
| `[2]` | aは他システムの共存による負荷増加とクライアント数増加による通信量増加、bは非定型検索の長時間SQL、cはフラグメンテーションによるディスクI/O増加、dはデータベースバッファ不足。 |
| `[3]` | aは他システムの共存による負荷増加とクライアント数増加による通信量増加、bは非定型検索の長時間SQL、cはフラグメンテーションによるディスクI/O増加、dはデータベースバッファ不足。 |

</details>

### legacy-2019-density-plot

<details><summary>許可する36組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0,0]` | 横軸60を中心に左右対称の一つの山。60と70に破線垂線、二つの垂線間の幅は10。 |
| `[0,0,1]` | 横軸60を中心に左右対称の細い一つの山。55,60,65に破線垂線、両外側の垂線間の幅は10。 |
| `[0,0,2]` | 横軸10の小さい山と60付近の大きい山の二つの山。10と60に破線垂線。 |
| `[0,0,3]` | 横軸60に頂点のある一つの山。左側の裾が右側より長い。50と60に破線垂線、垂線間の幅は10。 |
| `[0,1,0]` | 横軸60を中心に左右対称の一つの山。60と72に破線垂線、二つの垂線間の幅は12。 |
| `[0,1,1]` | 横軸60を中心に左右対称の細い一つの山。54,60,66に破線垂線、両外側の垂線間の幅は12。 |
| `[0,1,2]` | 横軸10の小さい山と60付近の大きい山の二つの山。10と60に破線垂線。 |
| `[0,1,3]` | 横軸60に頂点のある一つの山。左側の裾が右側より長い。48と60に破線垂線、垂線間の幅は12。 |
| `[0,2,0]` | 横軸60を中心に左右対称の一つの山。60と74に破線垂線、二つの垂線間の幅は14。 |
| `[0,2,1]` | 横軸60を中心に左右対称の細い一つの山。53,60,67に破線垂線、両外側の垂線間の幅は14。 |
| `[0,2,2]` | 横軸10の小さい山と60付近の大きい山の二つの山。10と60に破線垂線。 |
| `[0,2,3]` | 横軸60に頂点のある一つの山。左側の裾が右側より長い。46と60に破線垂線、垂線間の幅は14。 |
| `[1,0,0]` | 横軸70を中心に左右対称の一つの山。70と80に破線垂線、二つの垂線間の幅は10。 |
| `[1,0,1]` | 横軸70を中心に左右対称の細い一つの山。65,70,75に破線垂線、両外側の垂線間の幅は10。 |
| `[1,0,2]` | 横軸20の小さい山と70付近の大きい山の二つの山。20と70に破線垂線。 |
| `[1,0,3]` | 横軸70に頂点のある一つの山。左側の裾が右側より長い。60と70に破線垂線、垂線間の幅は10。 |
| `[1,1,0]` | 横軸70を中心に左右対称の一つの山。70と82に破線垂線、二つの垂線間の幅は12。 |
| `[1,1,1]` | 横軸70を中心に左右対称の細い一つの山。64,70,76に破線垂線、両外側の垂線間の幅は12。 |
| `[1,1,2]` | 横軸20の小さい山と70付近の大きい山の二つの山。20と70に破線垂線。 |
| `[1,1,3]` | 横軸70に頂点のある一つの山。左側の裾が右側より長い。58と70に破線垂線、垂線間の幅は12。 |
| `[1,2,0]` | 横軸70を中心に左右対称の一つの山。70と84に破線垂線、二つの垂線間の幅は14。 |
| `[1,2,1]` | 横軸70を中心に左右対称の細い一つの山。63,70,77に破線垂線、両外側の垂線間の幅は14。 |
| `[1,2,2]` | 横軸20の小さい山と70付近の大きい山の二つの山。20と70に破線垂線。 |
| `[1,2,3]` | 横軸70に頂点のある一つの山。左側の裾が右側より長い。56と70に破線垂線、垂線間の幅は14。 |
| `[2,0,0]` | 横軸80を中心に左右対称の一つの山。80と90に破線垂線、二つの垂線間の幅は10。 |
| `[2,0,1]` | 横軸80を中心に左右対称の細い一つの山。75,80,85に破線垂線、両外側の垂線間の幅は10。 |
| `[2,0,2]` | 横軸30の小さい山と80付近の大きい山の二つの山。30と80に破線垂線。 |
| `[2,0,3]` | 横軸80に頂点のある一つの山。左側の裾が右側より長い。70と80に破線垂線、垂線間の幅は10。 |
| `[2,1,0]` | 横軸80を中心に左右対称の一つの山。80と92に破線垂線、二つの垂線間の幅は12。 |
| `[2,1,1]` | 横軸80を中心に左右対称の細い一つの山。74,80,86に破線垂線、両外側の垂線間の幅は12。 |
| `[2,1,2]` | 横軸30の小さい山と80付近の大きい山の二つの山。30と80に破線垂線。 |
| `[2,1,3]` | 横軸80に頂点のある一つの山。左側の裾が右側より長い。68と80に破線垂線、垂線間の幅は12。 |
| `[2,2,0]` | 横軸80を中心に左右対称の一つの山。80と94に破線垂線、二つの垂線間の幅は14。 |
| `[2,2,1]` | 横軸80を中心に左右対称の細い一つの山。73,80,87に破線垂線、両外側の垂線間の幅は14。 |
| `[2,2,2]` | 横軸30の小さい山と80付近の大きい山の二つの山。30と80に破線垂線。 |
| `[2,2,3]` | 横軸80に頂点のある一つの山。左側の裾が右側より長い。66と80に破線垂線、垂線間の幅は14。 |

</details>

### legacy-2019-dfd-symbols

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左の長方形から上左の丸へ右向き矢印。上左の丸から中央の二本の横平行線へ右下向き矢印。平行線から下の丸へ右下向き矢印。下の丸から上右の丸へ右上向き矢印。上右の丸から右の長方形へ右向き矢印。丸3個、長方形2個、二本平行線1組、矢印5本。 |

</details>

### legacy-2019-gcd-flow

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 開始しLをA、SをBにする。LとSを比較し、L&gt;SならL−SをLに代入、L&lt;SならS−LをSに代入して比較へ戻る。等しければA、B、Lを出力して終了する。 |

</details>

### legacy-2019-home-network

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 利用者宅内の枠内に、上と下のPC、その間の縦の省略記号、ハブ、装置A、ONUがある。上のPCと下のPCがそれぞれハブへ線でつながり、ハブから装置A、装置AからONUへ線が続く。ONUから宅内枠の外のインターネットへ線が続き、この線に光ファイバケーブルと記す。接続線に矢印の先端はない。 |

</details>

### legacy-2019-interrupt-timing

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 時間は0から5ミリ秒。Aは1、2.5、3.5ミリ秒に発生し、Bは0、5ミリ秒に発生する。下向き矢印は発生時刻を示す。 |

</details>

### legacy-2019-score-relation

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 得点（学生番号、科目、点数）。学生番号と科目に実線の下線があり、二つの列を組み合わせた主キーを表す。 |

</details>

### legacy-2019-serial-wave

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | クロックの立上りで左から1、1、0、0、0、1、1、0、1を取り込む。ストローブは9回目のクロック立上り後、10回目の前に立ち上がる。10回目のクロックも図にあり、その立上りではストローブはまだ高く、データは1である。 |
| `[1]` | クロックの立上りで左から1、0、1、1、0、1、0、0、1を取り込む。ストローブは9回目のクロック立上り後、10回目の前に立ち上がる。10回目のクロックも図にあり、その立上りではストローブはまだ高く、データは1である。 |
| `[2]` | クロックの立上りで左から1、0、0、1、0、1、1、1、0を取り込む。ストローブは9回目のクロック立上り後、10回目の前に立ち上がる。10回目のクロックも図にあり、その立上りではストローブはまだ高く、データは1である。 |
| `[3]` | クロックの立上りで左から1、1、1、0、0、0、1、0、1を取り込む。ストローブは9回目のクロック立上り後、10回目の前に立ち上がる。10回目のクロックも図にあり、その立上りではストローブはまだ高く、データは1である。 |

</details>

### legacy-2019-spring-cause-effect

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 右端の枠aへ向かう水平の主幹に、下左の枠bからの斜めの矢印が接続する。 |

</details>

### legacy-2019-truth-table

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 入力A/Bが00、01、10、11の順のとき、出力Xは0、0、0、1。 |
| `[1]` | 入力A/Bが00、01、10、11の順のとき、出力Xは0、1、1、0。 |
| `[2]` | 入力A/Bが00、01、10、11の順のとき、出力Xは1、0、0、0。 |
| `[3]` | 入力A/Bが00、01、10、11の順のとき、出力Xは1、1、1、0。 |

</details>

### legacy-2019-two-input-box

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 長方形の論理回路に左から入力Aと入力Bが入り、右へ出力Xが出る。内部の回路は示されていない。 |

</details>

### legacy-2019-two-phase-locking

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 時間は下向き矢印で表す。左のトランザクションAは上からread W、update X、update Y、update Zの4箱を3本の下向き矢印でつなぐ。右のBは上から①、②、③、④の4箱を3本の下向き矢印でつなぐ。Bの①はAのread Wとupdate Xの間、②はupdate Xとupdate Yの間、③はupdate Yとupdate Zの間、④はupdate Zの下にある。位置はアプリケーションプログラムでの命令発行時点を示す。 |

</details>

## 問題集別の図の有限入力と描画条件

名前は問題集・原問番号ごとに登録する。各表は許可するvalues全体と実描画の読み上げ説明を列挙する。これは原問題の図形式と入力の対応を検査する資料であり、正答の独立検算・素材条件・通常アプリの検証は別に行う。

### legacy-2016-autumn-pm-1-network

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | A社のネットワーク構成。タブレットはインターネットにつながり，インターネットとA社のFWが接続する。FWはDMZのバスとLANのバスを接続する。DMZにはRPサーバとサーバ群Xがある。LANにはPCとサーバ群Yがある。各機器の接続点は黒い四角で示す。FWはファイアウォール。サーバ群XとYの内容は未指定。 |

</details>

### legacy-2016-autumn-pm-1-rules

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表2 FWにおけるフィルタリングの設定。条件は送信元，宛先，宛先ポート番号。項番1は任意，RPサーバ，443，許可。項番2は任意，DBサーバ，1552，許可。項番3は任意，任意，任意，拒否。注記 項番が小さいものから順に突き合わせ，最初に一致したものが適用される。 |
| `[1]` | 表2 FWにおけるフィルタリングの設定。条件は送信元，宛先，宛先ポート番号。項番1は任意，RPサーバ，443，許可。項番2は任意，DBサーバ，1543，許可。項番3は任意，任意，任意，拒否。注記 項番が小さいものから順に突き合わせ，最初に一致したものが適用される。 |
| `[2]` | 表2 FWにおけるフィルタリングの設定。条件は送信元，宛先，宛先ポート番号。項番1は任意，RPサーバ，443，許可。項番2は任意，DBサーバ，1564，許可。項番3は任意，任意，任意，拒否。注記 項番が小さいものから順に突き合わせ，最初に一致したものが適用される。 |
| `[3]` | 表2 FWにおけるフィルタリングの設定。条件は送信元，宛先，宛先ポート番号。項番1は任意，RPサーバ，443，許可。項番2は任意，DBサーバ，1575，許可。項番3は任意，任意，任意，拒否。注記 項番が小さいものから順に突き合わせ，最初に一致したものが適用される。 |

</details>

### legacy-2016-autumn-pm-1-cia-table

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表3 情報セキュリティの3要素との関連。3要素／対応。機密性／空欄a，完全性／空欄b，可用性／空欄c。 |

</details>

### legacy-2016-autumn-pm-1-prose

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問3 A社では，システムを構築する際に，情報セキュリティの3要素である機密性，完全性及び可用性を確保するための対応を整理して，情報セキュリティ担当者の確認を受けることになっている。そこで，次の(i)〜(vi)に示す販売支援システムに関する対応と情報セキュリティの3要素との関連を表3にまとめた。表3中の空欄に入れる適切な答えを，解答群の中から選べ。 |

</details>

### legacy-2016-autumn-pm-2-prose

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問1 字句解析の処理について，次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。 |
| `[1]` | 設問2 構文解析の処理について，次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。 |
| `[2]` | 例2で示す式を解析したとき，出力される構文木は［e］となる。 |

</details>

### legacy-2016-autumn-pm-3-prose

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問1 変更後の表を用いて通勤手当に関するデータを集計する。次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。 |
| `[1]` | 従業員ごとの通勤手当を求めるには，［a］グループ化して，集合関数［b］を用いればよい。また，交通機関ごとの利用者数を求めるには，［c］グループ化して，集合関数［d］を用いればよい。 |
| `[2]` | 設問2 通勤にバスを利用している従業員の従業員番号と交通機関名を表示する。ここで，交通機関コードは3文字の固定長文字列であり，バスの交通機関コードだけが文字“B”で始まる。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。 |
| `[3]` | 設問3 従業員の通勤圏内に新しい路線が開通することになった。その影響を確認するために，通勤経路が変わる可能性がある従業員の従業員番号を抽出することにした。同じ従業員番号は一つだけ表示する。新しい路線が影響する交通機関名は“情報都市線”と“駒込バス”であり，いずれも同名の交通機関名は他にないものとする。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。 |
| `[4]` | 通勤に自家用車を利用している従業員のうち，2016年4月20日に開催された交通安全講習会を受講していない従業員の従業員番号を表示する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。 |
| `[5]` | 通勤に自家用車を利用している従業員のうち，2016年4月21日に開催された交通安全講習会を受講していない従業員の従業員番号を表示する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。 |
| `[6]` | 通勤に自家用車を利用している従業員のうち，2016年4月22日に開催された交通安全講習会を受講していない従業員の従業員番号を表示する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。 |
| `[7]` | 通勤に自家用車を利用している従業員のうち，2016年4月23日に開催された交通安全講習会を受講していない従業員の従業員番号を表示する。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。 |

</details>

### legacy-2016-autumn-pm-4-prose

<details><summary>許可する3組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 固定データの全てがブラウザにキャッシュされているとき，それぞれのデータごとにデータの再転送の要否確認をサーバに要求したところ，全て再転送が不要であるとの応答を受け取った。最初の要求をしてから最後の要求に対する応答を受け取るまでに掛かる時間は［a］秒である。 |
| `[1]` | 固定データのいずれもがブラウザにキャッシュされていないとき，これらの固定データの総転送時間は［b］秒である。このとき，一覧表示画面1ページを構成するデータの転送時間がD社の基準を満たす商品情報の最大数nは，次式を解くことによって求めることができる。ここで，変動データもブラウザにキャッシュされていないものとする。 |
| `[2]` | 設問 本文中の空欄に入る正しい答えを，解答群の中から選べ。 |

</details>

### legacy-2016-autumn-pm-2-lexical-rules

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 符号なし浮動小数点定数 → 小数点定数［指数部］｜数字列 指数部 小数点定数 → ［数字列］. 数字列｜数字列 . 指数部 → e［符号］数字列 数字列 → 数字｜数字列 数字 符号 → +｜− 数字 → 0｜1｜2｜3｜4｜5｜6｜7｜8｜9 |

</details>

### legacy-2016-autumn-pm-2-expression-rules

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 式 → 項｜［c］ 項 → 因子｜項 op1 因子 因子 → 名前 名前 → v｜w｜x｜y｜z |

</details>

### legacy-2016-autumn-pm-2-factor-rule

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 因子 → 名前｜(［d］) |

</details>

### legacy-2016-autumn-pm-3-query-e

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | SELECT 通勤費表.従業員番号, 交通機関表.交通機関名   FROM 通勤費表, 交通機関表  WHERE 通勤費表.交通機関コード = 交通機関表.交通機関コード AND        ［e］ |

</details>

### legacy-2016-autumn-pm-3-query-f

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | SELECT 通勤費表.従業員番号   FROM 通勤費表  WHERE ［f］ |

</details>

### legacy-2016-autumn-pm-3-query-g

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | SELECT 通勤費表.従業員番号   FROM 通勤費表  WHERE 通勤費表.交通機関コード = 'C01' AND        ［g］ |

</details>

### legacy-2016-autumn-pm-2-dfa

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図1 符号なし浮動小数点定数の状態遷移図。初期状態0。最終状態3と6は二重円。0から1へ数字，0から2へ空欄a，2から3へ数字，1から1へ数字，1から3へピリオド，1から4へ空欄b，3から3へ数字，3から4へe，4から5へ符号，4から6へ数字，5から6へ数字，6から6へ数字。文字列は左から右へ1文字ずつ読み，読み終わりで最終状態なら受理する。 |

</details>

### legacy-2016-autumn-pm-2-example-tree

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図2 式の構文木と演算順序の例。根opの左の子はop，右の子はx。左のopの左の子はv，右の子はw。深さ優先で左からたどり，帰り掛けで左部分木のop（vとw）を評価し，その結果とxに対して根のopを評価する矢印経路を示す。 |

</details>

### legacy-2016-autumn-pm-2-syntax-tree

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 構文木。op2（左：v，右：op1（左：w，右：op1（左：op2（左：x，右：y），右：z））） |
| `[1]` | 構文木。op1（左：op2（左：v，右：w），右：op1（左：op2（左：x，右：y），右：z）） |
| `[2]` | 構文木。op2（左：v，右：op1（左：op1（左：w，右：op2（左：x，右：y）），右：z）） |
| `[3]` | 構文木。op1（左：op2（左：v，右：op1（左：w，右：op2（左：x，右：y））），右：z） |

</details>

### legacy-2016-autumn-pm-3-before-tables

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図1 変更前の表構成とデータ格納例。従業員表の列は従業員番号（主キー），氏名，住所，…，通勤手当。例の1行は00980125，情報太郎，東京都文京区○○○，…，10650。以下の行は縦の省略記号。 |
| `[1]` | 図1 変更前の表構成とデータ格納例。従業員表の列は従業員番号（主キー），氏名，住所，…，通勤手当。例の1行は00980125，情報太郎，東京都文京区○○○，…，12000。以下の行は縦の省略記号。 |
| `[2]` | 図1 変更前の表構成とデータ格納例。従業員表の列は従業員番号（主キー），氏名，住所，…，通勤手当。例の1行は00980125，情報太郎，東京都文京区○○○，…，6000。以下の行は縦の省略記号。 |
| `[3]` | 図1 変更前の表構成とデータ格納例。従業員表の列は従業員番号（主キー），氏名，住所，…，通勤手当。例の1行は00980125，情報太郎，東京都文京区○○○，…，12000。以下の行は縦の省略記号。 |

</details>

### legacy-2016-autumn-pm-3-after-tables

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図2 変更後の表構成とデータ格納例。従業員表：従業員番号（主キー），氏名，住所，…。00980125，情報太郎，東京都文京区○○○，…，以降省略。通勤費表：従業員番号と交通機関コードが組合せ主キー，交通費。00980125，B02，4800。00980125，S01，5850。以降省略。交通機関表：交通機関コード（主キー），交通機関名。B01，○○バス。B02，△△バス。省略行。C01，自家用車。省略行。 |
| `[1]` | 図2 変更後の表構成とデータ格納例。従業員表：従業員番号（主キー），氏名，住所，…。00980125，情報太郎，東京都文京区○○○，…，以降省略。通勤費表：従業員番号と交通機関コードが組合せ主キー，交通費。00980125，B02，6000。00980125，S01，12000。以降省略。交通機関表：交通機関コード（主キー），交通機関名。B01，○○バス。B02，△△バス。省略行。C01，自家用車。省略行。 |
| `[2]` | 図2 変更後の表構成とデータ格納例。従業員表：従業員番号（主キー），氏名，住所，…。00980125，情報太郎，東京都文京区○○○，…，以降省略。通勤費表：従業員番号と交通機関コードが組合せ主キー，交通費。00980125，B02，4000。00980125，S01，8000。以降省略。交通機関表：交通機関コード（主キー），交通機関名。B01，○○バス。B02，△△バス。省略行。C01，自家用車。省略行。 |
| `[3]` | 図2 変更後の表構成とデータ格納例。従業員表：従業員番号（主キー），氏名，住所，…。00980125，情報太郎，東京都文京区○○○，…，以降省略。通勤費表：従業員番号と交通機関コードが組合せ主キー，交通費。00980125，B02，3000。00980125，S01，9000。以降省略。交通機関表：交通機関コード（主キー），交通機関名。B01，○○バス。B02，△△バス。省略行。C01，自家用車。省略行。 |

</details>

### legacy-2016-autumn-pm-3-training-table

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図3 講習会受講表とデータ格納例。列は従業員番号，受講日で，二つの列が組合せ主キー。例は00980125，20160420。以降の行は省略。 |
| `[1]` | 図3 講習会受講表とデータ格納例。列は従業員番号，受講日で，二つの列が組合せ主キー。例は00980125，20160421。以降の行は省略。 |
| `[2]` | 図3 講習会受講表とデータ格納例。列は従業員番号，受講日で，二つの列が組合せ主キー。例は00980125，20160422。以降の行は省略。 |
| `[3]` | 図3 講習会受講表とデータ格納例。列は従業員番号，受講日で，二つの列が組合せ主キー。例は00980125，20160423。以降の行は省略。 |

</details>

### legacy-2016-autumn-pm-4-transfer-table

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表1 要求に対する結果の受信が完了するまでに掛かる時間。キャッシュされていない：要求はデータの転送，結果は当該データvバイトの受信，時間3×t＋v÷e秒。キャッシュされている：要求はデータの再転送の要否確認。再転送が不要な場合は再転送不要との応答を受信し，時間t秒。再転送が必要な場合は当該データvバイトを受信し，時間3×t＋v÷e秒。 |

</details>

### legacy-2016-autumn-pm-4-transfer-inequality

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | ［b］＋3×t＋［c］＋(3×t＋［d］)×n≦5 |

</details>

### legacy-2016-autumn-pm-5-assets

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図1。商品名は全てオブジェクト指向設計。商品コード1、著者試験太郎の2冊を資産管理番号1と2で識別し、商品コード2、著者情報花子の1冊を資産管理番号3で識別する。商品コードと資産管理番号の値にはそれぞれ下線。 |
| `[1]` | 図1。商品名は全てオブジェクト指向設計。商品コード1、著者試験太郎の2冊を資産管理番号1と2で識別し、商品コード2、著者情報花子の1冊を資産管理番号3で識別する。商品コードと資産管理番号の値にはそれぞれ下線。 |
| `[2]` | 図1。商品名は全てオブジェクト指向設計。商品コード1、著者試験太郎の2冊を資産管理番号1と2で識別し、商品コード2、著者情報花子の1冊を資産管理番号3で識別する。商品コードと資産管理番号の値にはそれぞれ下線。 |
| `[3]` | 図1。商品名は全てオブジェクト指向設計。商品コード1、著者試験太郎の2冊を資産管理番号1と2で識別し、商品コード2、著者情報花子の1冊を資産管理番号3で識別する。商品コードと資産管理番号の値にはそれぞれ下線。 |

</details>

### legacy-2016-autumn-pm-5-classes

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図3 レンタル業務システムのクラス図。会員情報：会員ID、氏名、住所、生年月日、電話番号、最終来店年月日、累計支払額、貸出中延滞数、登録年月日。貸出：伝票番号、貸出年月日、空欄a、返却予定年月日。会員情報側1、貸出側0..&#42;。貸出と貸出明細は貸出側に黒いひし形、貸出側1、貸出明細側1..10。貸出明細：貸出明細番号、貸出料金、返却年月日、延滞料金。貸出明細とレンタル商品：明細側空欄b1、商品側空欄b2。レンタル商品：資産管理番号、貸出可否状態。商品情報側1、レンタル商品側1..&#42;。商品情報：商品コード、商品名。貸出料金：貸出期間、単価、1日分の延滞料金。貸出料金側1..3、商品情報側0..&#42;。CD（編曲者、再生時間）、DVD（監督、主演、再生時間）、書籍（著者名、ページ数、ISBN）が商品情報へ白い三角形で汎化する。凡例のクラスAをクラスCが特殊化し、クラスC側黒ひし形・多重度1でクラスD側1..&#42;と集約する。クラスBとクラスDは通常の関連。 |
| `[1]` | 図3 レンタル業務システムのクラス図。会員情報：会員ID、氏名、住所、生年月日、電話番号、最終来店年月日、累計支払額、貸出中延滞数、登録年月日。貸出：伝票番号、貸出年月日、空欄a、返却予定年月日。会員情報側1、貸出側0..&#42;。貸出と貸出明細は貸出側に黒いひし形、貸出側1、貸出明細側1..10。貸出明細：貸出明細番号、貸出料金、返却年月日、延滞料金。貸出明細とレンタル商品：明細側空欄b1、商品側空欄b2。レンタル商品：資産管理番号、貸出可否状態。商品情報側1、レンタル商品側1..&#42;。商品情報：商品コード、商品名。貸出料金：貸出期間、単価、1日分の延滞料金。貸出料金側1..3、商品情報側0..&#42;。CD（編曲者、再生時間）、DVD（監督、主演、再生時間）、書籍（著者名、ページ数、ISBN）が商品情報へ白い三角形で汎化する。凡例のクラスAをクラスCが特殊化し、クラスC側黒ひし形・多重度1でクラスD側1..&#42;と集約する。クラスBとクラスDは通常の関連。 |
| `[2]` | 図3 レンタル業務システムのクラス図。会員情報：会員ID、氏名、住所、生年月日、電話番号、最終来店年月日、累計支払額、貸出中延滞数、登録年月日。貸出：伝票番号、貸出年月日、空欄a、返却予定年月日。会員情報側1、貸出側0..&#42;。貸出と貸出明細は貸出側に黒いひし形、貸出側1、貸出明細側1..10。貸出明細：貸出明細番号、貸出料金、返却年月日、延滞料金。貸出明細とレンタル商品：明細側空欄b1、商品側空欄b2。レンタル商品：資産管理番号、貸出可否状態。商品情報側1、レンタル商品側1..&#42;。商品情報：商品コード、商品名。貸出料金：貸出期間、単価、1日分の延滞料金。貸出料金側1..3、商品情報側0..&#42;。CD（編曲者、再生時間）、DVD（監督、主演、再生時間）、書籍（著者名、ページ数、ISBN）が商品情報へ白い三角形で汎化する。凡例のクラスAをクラスCが特殊化し、クラスC側黒ひし形・多重度1でクラスD側1..&#42;と集約する。クラスBとクラスDは通常の関連。 |
| `[3]` | 図3 レンタル業務システムのクラス図。会員情報：会員ID、氏名、住所、生年月日、電話番号、最終来店年月日、累計支払額、貸出中延滞数、登録年月日。貸出：伝票番号、貸出年月日、空欄a、返却予定年月日。会員情報側1、貸出側0..&#42;。貸出と貸出明細は貸出側に黒いひし形、貸出側1、貸出明細側1..10。貸出明細：貸出明細番号、貸出料金、返却年月日、延滞料金。貸出明細とレンタル商品：明細側空欄b1、商品側空欄b2。レンタル商品：資産管理番号、貸出可否状態。商品情報側1、レンタル商品側1..&#42;。商品情報：商品コード、商品名。貸出料金：貸出期間、単価、1日分の延滞料金。貸出料金側1..3、商品情報側0..&#42;。CD（編曲者、再生時間）、DVD（監督、主演、再生時間）、書籍（著者名、ページ数、ISBN）が商品情報へ白い三角形で汎化する。凡例のクラスAをクラスCが特殊化し、クラスC側黒ひし形・多重度1でクラスD側1..&#42;と集約する。クラスBとクラスDは通常の関連。 |

</details>

### legacy-2016-autumn-pm-5-sequence

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図4 入力操作のシーケンス図。担当者、画面、:貸出処理、:貸出、:貸出明細、:レンタル商品、:商品情報、:貸出料金の8ライフライン。担当者から画面へ入力操作、画面から貸出処理へ貸出情報を取得する（資産管理番号、貸出期間、本日日付）。貸出処理は自己に返却予定年月日を計算する（空欄c）とレンタル商品を取得する（資産管理番号）。レンタル商品へ商品情報を取得する、商品情報から破線で商品情報が返る。商品情報へ商品概要を取得する、αはそのメッセージを指す。破線で商品概要が返る。商品情報へ貸出料金を取得する（空欄d）、商品情報から貸出料金へのメッセージと返却は省略と表示。貸出処理へ破線で貸出料金、画面への破線返却は省略。画面は自己へ画面を表示する、担当者へ返る。図中の省略はメッセージの記述の省略である。 |
| `[1]` | 図4 入力操作のシーケンス図。担当者、画面、:貸出処理、:貸出、:貸出明細、:レンタル商品、:商品情報、:貸出料金の8ライフライン。担当者から画面へ入力操作、画面から貸出処理へ貸出情報を取得する（資産管理番号、貸出期間、本日日付）。貸出処理は自己に返却予定年月日を計算する（空欄c）とレンタル商品を取得する（資産管理番号）。レンタル商品へ商品情報を取得する、商品情報から破線で商品情報が返る。商品情報へ商品概要を取得する、αはそのメッセージを指す。破線で商品概要が返る。商品情報へ貸出料金を取得する（空欄d）、商品情報から貸出料金へのメッセージと返却は省略と表示。貸出処理へ破線で貸出料金、画面への破線返却は省略。画面は自己へ画面を表示する、担当者へ返る。図中の省略はメッセージの記述の省略である。 |
| `[2]` | 図4 入力操作のシーケンス図。担当者、画面、:貸出処理、:貸出、:貸出明細、:レンタル商品、:商品情報、:貸出料金の8ライフライン。担当者から画面へ入力操作、画面から貸出処理へ貸出情報を取得する（資産管理番号、貸出期間、本日日付）。貸出処理は自己に返却予定年月日を計算する（空欄c）とレンタル商品を取得する（資産管理番号）。レンタル商品へ商品情報を取得する、商品情報から破線で商品情報が返る。商品情報へ商品概要を取得する、αはそのメッセージを指す。破線で商品概要が返る。商品情報へ貸出料金を取得する（空欄d）、商品情報から貸出料金へのメッセージと返却は省略と表示。貸出処理へ破線で貸出料金、画面への破線返却は省略。画面は自己へ画面を表示する、担当者へ返る。図中の省略はメッセージの記述の省略である。 |
| `[3]` | 図4 入力操作のシーケンス図。担当者、画面、:貸出処理、:貸出、:貸出明細、:レンタル商品、:商品情報、:貸出料金の8ライフライン。担当者から画面へ入力操作、画面から貸出処理へ貸出情報を取得する（資産管理番号、貸出期間、本日日付）。貸出処理は自己に返却予定年月日を計算する（空欄c）とレンタル商品を取得する（資産管理番号）。レンタル商品へ商品情報を取得する、商品情報から破線で商品情報が返る。商品情報へ商品概要を取得する、αはそのメッセージを指す。破線で商品概要が返る。商品情報へ貸出料金を取得する（空欄d）、商品情報から貸出料金へのメッセージと返却は省略と表示。貸出処理へ破線で貸出料金、画面への破線返却は省略。画面は自己へ画面を表示する、担当者へ返る。図中の省略はメッセージの記述の省略である。 |

</details>

### legacy-2016-autumn-pm-6-quality-graph

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 品質評価のグラフ。横軸はテスト密度（件/kステップ）、目盛80と100。縦軸はバグ摘出率（件/kステップ）、目盛4、5、6。基準はテスト密度80以上、バグ摘出率4以上6以下。領域Ⅰはバグ摘出率6を超える全域、Ⅱは摘出率6以下で密度80未満、Ⅲは摘出率4以上6以下で密度80以上、Ⅳは摘出率4未満で密度80以上。境界値は本文の以上・以下に従う。 |
| `[1]` | 品質評価のグラフ。横軸はテスト密度（件/kステップ）、目盛80と100。縦軸はバグ摘出率（件/kステップ）、目盛4、5、6。基準はテスト密度80以上、バグ摘出率4以上6以下。領域Ⅰはバグ摘出率6を超える全域、Ⅱは摘出率6以下で密度80未満、Ⅲは摘出率4以上6以下で密度80以上、Ⅳは摘出率4未満で密度80以上。境界値は本文の以上・以下に従う。 |
| `[2]` | 品質評価のグラフ。横軸はテスト密度（件/kステップ）、目盛80と100。縦軸はバグ摘出率（件/kステップ）、目盛4、5、6。基準はテスト密度80以上、バグ摘出率4以上6以下。領域Ⅰはバグ摘出率6を超える全域、Ⅱは摘出率6以下で密度80未満、Ⅲは摘出率4以上6以下で密度80以上、Ⅳは摘出率4未満で密度80以上。境界値は本文の以上・以下に従う。 |
| `[3]` | 品質評価のグラフ。横軸はテスト密度（件/kステップ）、目盛80と100。縦軸はバグ摘出率（件/kステップ）、目盛4、5、6。基準はテスト密度80以上、バグ摘出率4以上6以下。領域Ⅰはバグ摘出率6を超える全域、Ⅱは摘出率6以下で密度80未満、Ⅲは摘出率4以上6以下で密度80以上、Ⅳは摘出率4未満で密度80以上。境界値は本文の以上・以下に従う。 |

</details>

### legacy-2016-autumn-pm-7-forecast

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表4。年度2017、2018、2019、2020、2021、2022、2023、…。FCFの2017、2019、2020は網掛けで非表示、2018は空欄d、2021は13.12、2022は13.51、2023は13.91、以降は…。単位億円。非表示の数字を解答前に補わない。 |
| `[1]` | 表4。年度2017、2018、2019、2020、2021、2022、2023、…。FCFの2017、2019、2020は網掛けで非表示、2018は空欄d、2021は26.23、2022は27.02、2023は27.83、以降は…。単位億円。非表示の数字を解答前に補わない。 |
| `[2]` | 表4。年度2017、2018、2019、2020、2021、2022、2023、…。FCFの2017、2019、2020は網掛けで非表示、2018は空欄d、2021は39.35、2022は40.53、2023は41.74、以降は…。単位億円。非表示の数字を解答前に補わない。 |
| `[3]` | 表4。年度2017、2018、2019、2020、2021、2022、2023、…。FCFの2017、2019、2020は網掛けで非表示、2018は空欄d、2021は52.46、2022は54.04、2023は55.66、以降は…。単位億円。非表示の数字を解答前に補わない。 |

</details>

### legacy-2016-autumn-pm-8-program

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | Editの宣言、文字型fill、論理型signif、整数型p/v。fillをPattern[0]、signifをoff、vを0で初期化。pを0からLength(Pattern[])未満まで1ずつ増やす反復。Pattern[p]が白抜き又は黒塗り制御文字なら、破線内で表2のケース1〜7を判定しPattern[p]/signifを更新し、vを1増やす。それ以外ではsignifがoffのときだけPattern[p]にfillを代入する。Length()は引数文字列の長さ。反復と両分岐の開始・終端を元の制御線で示す。 |
| `[1]` | Editの宣言、文字型fill、論理型signif、整数型p/v。fillをPattern[0]、signifをoff、vを0で初期化。pを0からLength(Pattern[])未満まで1ずつ増やす反復。Pattern[p]が白抜き又は黒塗り制御文字なら、破線内で表2のケース1〜7を判定しPattern[p]/signifを更新し、vを1増やす。それ以外ではsignifがoffのときだけPattern[p]にfillを代入する。Length()は引数文字列の長さ。反復と両分岐の開始・終端を元の制御線で示す。 |
| `[2]` | Editの宣言、文字型fill、論理型signif、整数型p/v。fillをPattern[0]、signifをoff、vを0で初期化。pを0からLength(Pattern[])未満まで1ずつ増やす反復。Pattern[p]が白抜き又は黒塗り制御文字なら、破線内で表2のケース1〜7を判定しPattern[p]/signifを更新し、vを1増やす。それ以外ではsignifがoffのときだけPattern[p]にfillを代入する。Length()は引数文字列の長さ。反復と両分岐の開始・終端を元の制御線で示す。 |
| `[3]` | Editの宣言、文字型fill、論理型signif、整数型p/v。fillをPattern[0]、signifをoff、vを0で初期化。pを0からLength(Pattern[])未満まで1ずつ増やす反復。Pattern[p]が白抜き又は黒塗り制御文字なら、破線内で表2のケース1〜7を判定しPattern[p]/signifを更新し、vを1増やす。それ以外ではsignifがoffのときだけPattern[p]にfillを代入する。Length()は引数文字列の長さ。反復と両分岐の開始・終端を元の制御線で示す。 |

</details>

### legacy-2016-autumn-pm-8-detail-program

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 詳細化した疑似言語。signifがoffなら、Pattern[p]が白抜き制御文字かつValue[v]が0のとき何もしない。それ以外はValue[v+1]が＋でなければsignifをonにし、その後のd条件が真ならPattern[p]にfill、偽ならValue[v]を代入。signifが初めからonの枝では、e条件が真ならsignifをoffにし、条件外で必ずPattern[p]にValue[v]を代入する。元の単岐・双岐の境界、非実行コメント、二つの空欄を保持する。 |
| `[1]` | 詳細化した疑似言語。signifがoffなら、Pattern[p]が白抜き制御文字かつValue[v]が0のとき何もしない。それ以外はValue[v+1]が＋でなければsignifをonにし、その後のd条件が真ならPattern[p]にfill、偽ならValue[v]を代入。signifが初めからonの枝では、e条件が真ならsignifをoffにし、条件外で必ずPattern[p]にValue[v]を代入する。元の単岐・双岐の境界、非実行コメント、二つの空欄を保持する。 |
| `[2]` | 詳細化した疑似言語。signifがoffなら、Pattern[p]が白抜き制御文字かつValue[v]が0のとき何もしない。それ以外はValue[v+1]が＋でなければsignifをonにし、その後のd条件が真ならPattern[p]にfill、偽ならValue[v]を代入。signifが初めからonの枝では、e条件が真ならsignifをoffにし、条件外で必ずPattern[p]にValue[v]を代入する。元の単岐・双岐の境界、非実行コメント、二つの空欄を保持する。 |
| `[3]` | 詳細化した疑似言語。signifがoffなら、Pattern[p]が白抜き制御文字かつValue[v]が0のとき何もしない。それ以外はValue[v+1]が＋でなければsignifをonにし、その後のd条件が真ならPattern[p]にfill、偽ならValue[v]を代入。signifが初めからonの枝では、e条件が真ならsignifをoffにし、条件外で必ずPattern[p]にValue[v]を代入する。元の単岐・双岐の境界、非実行コメント、二つの空欄を保持する。 |

</details>

### legacy-2016-autumn-pm-5-source-fragment-19

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 図2 4件の入力操作を行った後の画面の表示例。列：商品コード、貸出期間、商品名、商品概要、返却予定年月日、貸出料金。C529157、1日、音楽CD01、編曲者A，63分、2016-10-17、130円。D700557、2日、映画DVD01、監督B，主演C，122分、2016-10-18、200円。B905668、2日、UML基礎編、著者X，100ページ，ISBN-xxxx、2016-10-18、100円。B905669、1週間、データベース応用編、著者Y，240ページ，ISBN-yyyy、2016-10-23、150円 |
| `[1]` | 図2 4件の入力操作を行った後の画面の表示例。列：商品コード、貸出期間、商品名、商品概要、返却予定年月日、貸出料金。C529157、1日、音楽CD01、編曲者A，63分、2016-10-17、130円。C529157、1日、音楽CD01、編曲者A，63分、2016-10-17、130円。B905668、2日、UML基礎編、著者X，100ページ，ISBN-xxxx、2016-10-18、100円。B905669、1週間、データベース応用編、著者Y，240ページ，ISBN-yyyy、2016-10-23、150円 |
| `[2]` | 図2 4件の入力操作を行った後の画面の表示例。列：商品コード、貸出期間、商品名、商品概要、返却予定年月日、貸出料金。C529157、1日、音楽CD01、編曲者A，63分、2016-10-17、260円。D700557、2日、映画DVD01、監督B，主演C，122分、2016-10-18、400円。B905668、2日、UML基礎編、著者X，100ページ，ISBN-xxxx、2016-10-18、200円。B905669、1週間、データベース応用編、著者Y，240ページ，ISBN-yyyy、2016-10-23、300円 |
| `[3]` | 図2 4件の入力操作を行った後の画面の表示例。列：商品コード、貸出期間、商品名、商品概要、返却予定年月日、貸出料金。C529157、1日、音楽CD01、編曲者A，63分、2016-10-17、260円。C529157、1日、音楽CD01、編曲者A，63分、2016-10-17、260円。B905668、2日、UML基礎編、著者X，100ページ，ISBN-xxxx、2016-10-18、200円。B905669、1週間、データベース応用編、著者Y，240ページ，ISBN-yyyy、2016-10-23、300円 |

</details>

### legacy-2016-autumn-pm-5-source-fragment-35

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問1 図3中の［空欄］に入れる正しい答えを，解答群の中から選べ。ここで，b1とb2に入れる答えは，bに関する解答群の中から組合せとして正しいものを選ぶものとする。 |
| `[1]` | 設問1 図3中の［空欄］に入れる正しい答えを，解答群の中から選べ。ここで，b1とb2に入れる答えは，bに関する解答群の中から組合せとして正しいものを選ぶものとする。 |
| `[2]` | 設問1 図3中の［空欄］に入れる正しい答えを，解答群の中から選べ。ここで，b1とb2に入れる答えは，bに関する解答群の中から組合せとして正しいものを選ぶものとする。 |
| `[3]` | 設問1 図3中の［空欄］に入れる正しい答えを，解答群の中から選べ。ここで，b1とb2に入れる答えは，bに関する解答群の中から組合せとして正しいものを選ぶものとする。 |

</details>

### legacy-2016-autumn-pm-5-source-fragment-36

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問2 図4中の［空欄］に入れる正しい答えを，解答群の中から選べ。 |
| `[1]` | 設問2 図4中の［空欄］に入れる正しい答えを，解答群の中から選べ。 |
| `[2]` | 設問2 図4中の［空欄］に入れる正しい答えを，解答群の中から選べ。 |
| `[3]` | 設問2 図4中の［空欄］に入れる正しい答えを，解答群の中から選べ。 |

</details>

### legacy-2016-autumn-pm-5-source-fragment-37

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問3 次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。ここで，e1とe2に入れる答えは，eに関する解答群の中から組合せとして適切なものを選ぶものとする。 |
| `[1]` | 設問3 次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。ここで，e1とe2に入れる答えは，eに関する解答群の中から組合せとして適切なものを選ぶものとする。 |
| `[2]` | 設問3 次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。ここで，e1とe2に入れる答えは，eに関する解答群の中から組合せとして適切なものを選ぶものとする。 |
| `[3]` | 設問3 次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。ここで，e1とe2に入れる答えは，eに関する解答群の中から組合せとして適切なものを選ぶものとする。 |

</details>

### legacy-2016-autumn-pm-5-source-fragment-38

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | CDクラス，DVDクラス，書籍クラスは商品情報を特化して実現しているので，商品情報クラスを［e1］している。図4中のαの部分は，貸出処理クラスから商品情報クラスに対する商品概要を取得する要求のメッセージである。商品概要とは，CDなら編曲者と再生時間，DVDなら監督，主演及び再生時間，書籍なら著者名，ページ数及びISBNから生成する当該商品の商品概要を表現する文字列である。商品概要を取得するためのメッセージを受けた商品情報インスタンスは，クラスに応じて異なる処理が実行される。一方，貸出処理クラスはクラスや処理の違いを意識せず，全てを商品情報として取り扱うことができる。この性質を［e2］という。 |
| `[1]` | CDクラス，DVDクラス，書籍クラスは商品情報を特化して実現しているので，商品情報クラスを［e1］している。図4中のαの部分は，貸出処理クラスから商品情報クラスに対する商品概要を取得する要求のメッセージである。商品概要とは，CDなら編曲者と再生時間，DVDなら監督，主演及び再生時間，書籍なら著者名，ページ数及びISBNから生成する当該商品の商品概要を表現する文字列である。商品概要を取得するためのメッセージを受けた商品情報インスタンスは，クラスに応じて異なる処理が実行される。一方，貸出処理クラスはクラスや処理の違いを意識せず，全てを商品情報として取り扱うことができる。この性質を［e2］という。 |
| `[2]` | CDクラス，DVDクラス，書籍クラスは商品情報を特化して実現しているので，商品情報クラスを［e1］している。図4中のαの部分は，貸出処理クラスから商品情報クラスに対する商品概要を取得する要求のメッセージである。商品概要とは，CDなら編曲者と再生時間，DVDなら監督，主演及び再生時間，書籍なら著者名，ページ数及びISBNから生成する当該商品の商品概要を表現する文字列である。商品概要を取得するためのメッセージを受けた商品情報インスタンスは，クラスに応じて異なる処理が実行される。一方，貸出処理クラスはクラスや処理の違いを意識せず，全てを商品情報として取り扱うことができる。この性質を［e2］という。 |
| `[3]` | CDクラス，DVDクラス，書籍クラスは商品情報を特化して実現しているので，商品情報クラスを［e1］している。図4中のαの部分は，貸出処理クラスから商品情報クラスに対する商品概要を取得する要求のメッセージである。商品概要とは，CDなら編曲者と再生時間，DVDなら監督，主演及び再生時間，書籍なら著者名，ページ数及びISBNから生成する当該商品の商品概要を表現する文字列である。商品概要を取得するためのメッセージを受けた商品情報インスタンスは，クラスに応じて異なる処理が実行される。一方，貸出処理クラスはクラスや処理の違いを意識せず，全てを商品情報として取り扱うことができる。この性質を［e2］という。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-4

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問1 C社の品質管理基準に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。ここで，a1〜a3に入れる答えは，aに関する解答群の中から組合せとして適切なものを選ぶものとする。 |
| `[1]` | 設問1 C社の品質管理基準に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。ここで，a1〜a3に入れる答えは，aに関する解答群の中から組合せとして適切なものを選ぶものとする。 |
| `[2]` | 設問1 C社の品質管理基準に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。ここで，a1〜a3に入れる答えは，aに関する解答群の中から組合せとして適切なものを選ぶものとする。 |
| `[3]` | 設問1 C社の品質管理基準に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。ここで，a1〜a3に入れる答えは，aに関する解答群の中から組合せとして適切なものを選ぶものとする。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-7

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表1 単体テストの完了の指標の算出方法と標準値。列：指標、算出方法、標準値。テスト密度、テストケース数（件）÷当該プログラムの開発規模（kステップ）、100。バグ摘出率、プログラムのバグ数（件）÷当該プログラムの開発規模（kステップ）、5 |
| `[1]` | 表1 単体テストの完了の指標の算出方法と標準値。列：指標、算出方法、標準値。テスト密度、テストケース数（件）÷当該プログラムの開発規模（kステップ）、100。バグ摘出率、プログラムのバグ数（件）÷当該プログラムの開発規模（kステップ）、5 |
| `[2]` | 表1 単体テストの完了の指標の算出方法と標準値。列：指標、算出方法、標準値。テスト密度、テストケース数（件）÷当該プログラムの開発規模（kステップ）、100。バグ摘出率、プログラムのバグ数（件）÷当該プログラムの開発規模（kステップ）、5 |
| `[3]` | 表1 単体テストの完了の指標の算出方法と標準値。列：指標、算出方法、標準値。テスト密度、テストケース数（件）÷当該プログラムの開発規模（kステップ）、100。バグ摘出率、プログラムのバグ数（件）÷当該プログラムの開発規模（kステップ）、5 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-11

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | Ⅰ：バグ摘出率が基準範囲の上限を超えているので，［a1］である。 |
| `[1]` | Ⅰ：バグ摘出率が基準範囲の上限を超えているので，［a1］である。 |
| `[2]` | Ⅰ：バグ摘出率が基準範囲の上限を超えているので，［a1］である。 |
| `[3]` | Ⅰ：バグ摘出率が基準範囲の上限を超えているので，［a1］である。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-13

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | Ⅲ：テスト密度，バグ摘出率とも基準を満たしているので，［a2］である。 |
| `[1]` | Ⅲ：テスト密度，バグ摘出率とも基準を満たしているので，［a2］である。 |
| `[2]` | Ⅲ：テスト密度，バグ摘出率とも基準を満たしているので，［a2］である。 |
| `[3]` | Ⅲ：テスト密度，バグ摘出率とも基準を満たしているので，［a2］である。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-14

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | Ⅳ：テスト密度は基準を満たしているが，バグ摘出率が基準範囲の下限に満たないので，［a3］。 |
| `[1]` | Ⅳ：テスト密度は基準を満たしているが，バグ摘出率が基準範囲の下限に満たないので，［a3］。 |
| `[2]` | Ⅳ：テスト密度は基準を満たしているが，バグ摘出率が基準範囲の下限に満たないので，［a3］。 |
| `[3]` | Ⅳ：テスト密度は基準を満たしているが，バグ摘出率が基準範囲の下限に満たないので，［a3］。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-15

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問2 販売システムの単体テストの結果と改善策の実施に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[1]` | 設問2 販売システムの単体テストの結果と改善策の実施に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[2]` | 設問2 販売システムの単体テストの結果と改善策の実施に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[3]` | 設問2 販売システムの単体テストの結果と改善策の実施に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-18

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表2 サブシステムXの単体テストの結果。列：プログラム、開発規模（kステップ）、テストケース数（件）、テスト密度（件/kステップ）、バグ数（件）、バグ摘出率（件/kステップ）、評価。プログラム1、10、980、［b］、70、網掛け（非表示）、バグ摘出率が基準範囲の上限を超えた。。プログラム2、2、215、網掛け（非表示）、9、網掛け（非表示）、網掛け（非表示）。プログラム3、6、750、網掛け（非表示）、20、網掛け（非表示）、網掛け（非表示）。プログラム4、8、600、網掛け（非表示）、30、網掛け（非表示）、［c］。 |
| `[1]` | 表2 サブシステムXの単体テストの結果。列：プログラム、開発規模（kステップ）、テストケース数（件）、テスト密度（件/kステップ）、バグ数（件）、バグ摘出率（件/kステップ）、評価。プログラム1、10、960、［b］、70、網掛け（非表示）、バグ摘出率が基準範囲の上限を超えた。。プログラム2、2、215、網掛け（非表示）、9、網掛け（非表示）、網掛け（非表示）。プログラム3、6、750、網掛け（非表示）、20、網掛け（非表示）、網掛け（非表示）。プログラム4、8、600、網掛け（非表示）、30、網掛け（非表示）、［c］。 |
| `[2]` | 表2 サブシステムXの単体テストの結果。列：プログラム、開発規模（kステップ）、テストケース数（件）、テスト密度（件/kステップ）、バグ数（件）、バグ摘出率（件/kステップ）、評価。プログラム1、10、1000、［b］、70、網掛け（非表示）、バグ摘出率が基準範囲の上限を超えた。。プログラム2、2、215、網掛け（非表示）、9、網掛け（非表示）、網掛け（非表示）。プログラム3、6、750、網掛け（非表示）、20、網掛け（非表示）、網掛け（非表示）。プログラム4、8、600、網掛け（非表示）、30、網掛け（非表示）、［c］。 |
| `[3]` | 表2 サブシステムXの単体テストの結果。列：プログラム、開発規模（kステップ）、テストケース数（件）、テスト密度（件/kステップ）、バグ数（件）、バグ摘出率（件/kステップ）、評価。プログラム1、10、1040、［b］、70、網掛け（非表示）、バグ摘出率が基準範囲の上限を超えた。。プログラム2、2、215、網掛け（非表示）、9、網掛け（非表示）、網掛け（非表示）。プログラム3、6、750、網掛け（非表示）、20、網掛け（非表示）、網掛け（非表示）。プログラム4、8、600、網掛け（非表示）、30、網掛け（非表示）、［c］。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-22

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | プログラム1は，バグ摘出率が基準範囲の上限を超えているので，バグの原因分析を行った。主な原因は，詳細設計書に曖昧な記述があり，プログラムで実現すべき機能に誤りが発生していたことであった。そこで，詳細設計書の曖昧な記述を修正後，［d］。さらに，修正したプログラムについて，必要なテストケースを追加した上で，再度単体テストを実施し，バグ摘出率が基準を満たしていることを確認した。また，同一の観点で，他のプログラムに関しても点検を実施し，同様の問題が含まれていないことを確認した。 |
| `[1]` | プログラム1は，バグ摘出率が基準範囲の上限を超えているので，バグの原因分析を行った。主な原因は，詳細設計書に曖昧な記述があり，プログラムで実現すべき機能に誤りが発生していたことであった。そこで，詳細設計書の曖昧な記述を修正後，［d］。さらに，修正したプログラムについて，必要なテストケースを追加した上で，再度単体テストを実施し，バグ摘出率が基準を満たしていることを確認した。また，同一の観点で，他のプログラムに関しても点検を実施し，同様の問題が含まれていないことを確認した。 |
| `[2]` | プログラム1は，バグ摘出率が基準範囲の上限を超えているので，バグの原因分析を行った。主な原因は，詳細設計書に曖昧な記述があり，プログラムで実現すべき機能に誤りが発生していたことであった。そこで，詳細設計書の曖昧な記述を修正後，［d］。さらに，修正したプログラムについて，必要なテストケースを追加した上で，再度単体テストを実施し，バグ摘出率が基準を満たしていることを確認した。また，同一の観点で，他のプログラムに関しても点検を実施し，同様の問題が含まれていないことを確認した。 |
| `[3]` | プログラム1は，バグ摘出率が基準範囲の上限を超えているので，バグの原因分析を行った。主な原因は，詳細設計書に曖昧な記述があり，プログラムで実現すべき機能に誤りが発生していたことであった。そこで，詳細設計書の曖昧な記述を修正後，［d］。さらに，修正したプログラムについて，必要なテストケースを追加した上で，再度単体テストを実施し，バグ摘出率が基準を満たしていることを確認した。また，同一の観点で，他のプログラムに関しても点検を実施し，同様の問題が含まれていないことを確認した。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-23

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | プログラム3については，［e］ことを確認し，テストケースの内容自体に問題がないことから，現在のバグ摘出で十分な品質が確保されていると判断したので，改善策は不要とした。 |
| `[1]` | プログラム3については，［e］ことを確認し，テストケースの内容自体に問題がないことから，現在のバグ摘出で十分な品質が確保されていると判断したので，改善策は不要とした。 |
| `[2]` | プログラム3については，［e］ことを確認し，テストケースの内容自体に問題がないことから，現在のバグ摘出で十分な品質が確保されていると判断したので，改善策は不要とした。 |
| `[3]` | プログラム3については，［e］ことを確認し，テストケースの内容自体に問題がないことから，現在のバグ摘出で十分な品質が確保されていると判断したので，改善策は不要とした。 |

</details>

### legacy-2016-autumn-pm-6-source-fragment-24

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | プログラム4については，［c］ことから，テストケースが不足していることが懸念されるので，テストケースの網羅性を点検した上で，［f］，その結果から品質を再評価することにした。 |
| `[1]` | プログラム4については，［c］ことから，テストケースが不足していることが懸念されるので，テストケースの網羅性を点検した上で，［f］，その結果から品質を再評価することにした。 |
| `[2]` | プログラム4については，［c］ことから，テストケースが不足していることが懸念されるので，テストケースの網羅性を点検した上で，［f］，その結果から品質を再評価することにした。 |
| `[3]` | プログラム4については，［c］ことから，テストケースが不足していることが懸念されるので，テストケースの網羅性を点検した上で，［f］，その結果から品質を再評価することにした。 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-3

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表1 T社の2016年度の損益計算書の予測（単位：億円）。列：項目、予測額。売上高、120。売上総利益、40。営業利益、7。経常利益、9。税引き前純利益、10。税引き後純利益、7 |
| `[1]` | 表1 T社の2016年度の損益計算書の予測（単位：億円）。列：項目、予測額。売上高、240。売上総利益、80。営業利益、14。経常利益、18。税引き前純利益、20。税引き後純利益、14 |
| `[2]` | 表1 T社の2016年度の損益計算書の予測（単位：億円）。列：項目、予測額。売上高、360。売上総利益、120。営業利益、21。経常利益、27。税引き前純利益、30。税引き後純利益、21 |
| `[3]` | 表1 T社の2016年度の損益計算書の予測（単位：億円）。列：項目、予測額。売上高、480。売上総利益、160。営業利益、28。経常利益、36。税引き前純利益、40。税引き後純利益、28 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-4

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表2 T社の2016年度の貸借対照表の予測（単位：億円）。列：項目、予測額。流動資産、50。固定資産、100。流動負債、40。固定負債、30。純資産、80 |
| `[1]` | 表2 T社の2016年度の貸借対照表の予測（単位：億円）。列：項目、予測額。流動資産、100。固定資産、200。流動負債、80。固定負債、60。純資産、160 |
| `[2]` | 表2 T社の2016年度の貸借対照表の予測（単位：億円）。列：項目、予測額。流動資産、150。固定資産、300。流動負債、120。固定負債、90。純資産、240 |
| `[3]` | 表2 T社の2016年度の貸借対照表の予測（単位：億円）。列：項目、予測額。流動資産、200。固定資産、400。流動負債、160。固定負債、120。純資産、320 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-5

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表3 T社の2016年度のCF計算書の予測（単位：億円）。列：項目、予測額。営業活動によるCF、15。投資活動によるCF、-5。財務活動によるCF、-3 |
| `[1]` | 表3 T社の2016年度のCF計算書の予測（単位：億円）。列：項目、予測額。営業活動によるCF、30。投資活動によるCF、-10。財務活動によるCF、-6 |
| `[2]` | 表3 T社の2016年度のCF計算書の予測（単位：億円）。列：項目、予測額。営業活動によるCF、45。投資活動によるCF、-15。財務活動によるCF、-9 |
| `[3]` | 表3 T社の2016年度のCF計算書の予測（単位：億円）。列：項目、予測額。営業活動によるCF、60。投資活動によるCF、-20。財務活動によるCF、-12 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-6

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問1 表1〜3に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[1]` | 設問1 表1〜3に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[2]` | 設問1 表1〜3に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[3]` | 設問1 表1〜3に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-11

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表1〜3から，T社は出資条件の［a］を満たしている。この結果から，B社では，T社への出資の検討を進めることにした。 |
| `[1]` | 表1〜3から，T社は出資条件の［a］を満たしている。この結果から，B社では，T社への出資の検討を進めることにした。 |
| `[2]` | 表1〜3から，T社は出資条件の［a］を満たしている。この結果から，B社では，T社への出資の検討を進めることにした。 |
| `[3]` | 表1〜3から，T社は出資条件の［a］を満たしている。この結果から，B社では，T社への出資の検討を進めることにした。 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-12

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | また，B社は，T社の営業活動によるCFが正で，投資活動によるCFと財務活動によるCFが負であることから，T社は［b］を進めている企業と考えた。 |
| `[1]` | また，B社は，T社の営業活動によるCFが正で，投資活動によるCFと財務活動によるCFが負であることから，T社は［b］を進めている企業と考えた。 |
| `[2]` | また，B社は，T社の営業活動によるCFが正で，投資活動によるCFと財務活動によるCFが負であることから，T社は［b］を進めている企業と考えた。 |
| `[3]` | また，B社は，T社の営業活動によるCFが正で，投資活動によるCFと財務活動によるCFが負であることから，T社は［b］を進めている企業と考えた。 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-13

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | B社では，物流業務での提携に加えて，T社の情報システムの一部を廃止してB社の情報システムを利用することを検討している。これによってT社のシステム運用保守費を削減し，T社の販売費及び一般管理費（以下，販管費という）を圧縮できると想定しており，T社の売上高や総資産が変わらなければ［c］上げられると考えている。 |
| `[1]` | B社では，物流業務での提携に加えて，T社の情報システムの一部を廃止してB社の情報システムを利用することを検討している。これによってT社のシステム運用保守費を削減し，T社の販売費及び一般管理費（以下，販管費という）を圧縮できると想定しており，T社の売上高や総資産が変わらなければ［c］上げられると考えている。 |
| `[2]` | B社では，物流業務での提携に加えて，T社の情報システムの一部を廃止してB社の情報システムを利用することを検討している。これによってT社のシステム運用保守費を削減し，T社の販売費及び一般管理費（以下，販管費という）を圧縮できると想定しており，T社の売上高や総資産が変わらなければ［c］上げられると考えている。 |
| `[3]` | B社では，物流業務での提携に加えて，T社の情報システムの一部を廃止してB社の情報システムを利用することを検討している。これによってT社のシステム運用保守費を削減し，T社の販売費及び一般管理費（以下，販管費という）を圧縮できると想定しており，T社の売上高や総資産が変わらなければ［c］上げられると考えている。 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-14

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問2 T社の企業価値の算出に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[1]` | 設問2 T社の企業価値の算出に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[2]` | 設問2 T社の企業価値の算出に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |
| `[3]` | 設問2 T社の企業価値の算出に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-24

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 2017年度のFCFの2016年度末時点の現在価値は，［e］である。ここで，各年度のFCFは各年度末に発生すると考える。 |
| `[1]` | 2017年度のFCFの2016年度末時点の現在価値は，［e］である。ここで，各年度のFCFは各年度末に発生すると考える。 |
| `[2]` | 2017年度のFCFの2016年度末時点の現在価値は，［e］である。ここで，各年度のFCFは各年度末に発生すると考える。 |
| `[3]` | 2017年度のFCFの2016年度末時点の現在価値は，［e］である。ここで，各年度のFCFは各年度末に発生すると考える。 |

</details>

### legacy-2016-autumn-pm-7-source-fragment-25

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | T社の企業価値は，B社と業務提携することによって大きくなると予想される。誤って，割引率を考慮せずに各年度のFCFをそのまま合計して，B社で定義している企業価値よりも［f］計算してしまわないように，B社では定期的に担当者教育をしている。 |
| `[1]` | T社の企業価値は，B社と業務提携することによって大きくなると予想される。誤って，割引率を考慮せずに各年度のFCFをそのまま合計して，B社で定義している企業価値よりも［f］計算してしまわないように，B社では定期的に担当者教育をしている。 |
| `[2]` | T社の企業価値は，B社と業務提携することによって大きくなると予想される。誤って，割引率を考慮せずに各年度のFCFをそのまま合計して，B社で定義している企業価値よりも［f］計算してしまわないように，B社では定期的に担当者教育をしている。 |
| `[3]` | T社の企業価値は，B社と業務提携することによって大きくなると予想される。誤って，割引率を考慮せずに各年度のFCFをそのまま合計して，B社で定義している企業価値よりも［f］計算してしまわないように，B社では定期的に担当者教育をしている。 |

</details>

### legacy-2016-autumn-pm-8-source-fragment-5

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表1 関数Editを用いた編集例。列：数値、例1：␣□□,□□□、例2：&#42;□□,□□□、例3：␣□□□.□□。123、␣␣␣␣123、&#42;&#42;&#42;&#42;123、␣␣␣1.23。1234、␣␣1,234、&#42;&#42;1,234、␣␣12.34。12345、␣12,345、&#42;12,345、␣123.45 |
| `[1]` | 表1 関数Editを用いた編集例。列：数値、例1：␣□□,□□□、例2：&#42;□□,□□□、例3：␣□□□.□□。123、␣␣␣␣123、&#42;&#42;&#42;&#42;123、␣␣␣1.23。1234、␣␣1,234、&#42;&#42;1,234、␣␣12.34。12345、␣12,345、&#42;12,345、␣123.45 |
| `[2]` | 表1 関数Editを用いた編集例。列：数値、例1：␣□□,□□□、例2：&#42;□□,□□□、例3：␣□□□.□□。123、␣␣␣␣123、&#42;&#42;&#42;&#42;123、␣␣␣1.23。1234、␣␣1,234、&#42;&#42;1,234、␣␣12.34。12345、␣12,345、&#42;12,345、␣123.45 |
| `[3]` | 表1 関数Editを用いた編集例。列：数値、例1：␣□□,□□□、例2：&#42;□□,□□□、例3：␣□□□.□□。123、␣␣␣␣123、&#42;&#42;&#42;&#42;123、␣␣␣1.23。1234、␣␣1,234、&#42;&#42;1,234、␣␣12.34。12345、␣12,345、&#42;12,345、␣123.45 |

</details>

### legacy-2016-autumn-pm-8-source-fragment-16

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表2 現在の変数・配列要素の内容に応じた更新処理。列：ケース、Pattern[p]、signif（現在）、Value[v]、Value[v＋1]、Pattern[p]（更新）、signif（更新）。1、□、off、0、網掛け（判定しない）、fill文字、off。2、■、off、0、＋以外、fill文字、on。3、■、off、0、＋、fill文字、off。4、□又は■、off、1〜9、＋以外、Value[v]、on。5、□又は■、off、1〜9、＋、Value[v]、off。6、□又は■、on、0〜9、＋以外、Value[v]、on。7、□又は■、on、0〜9、＋、Value[v]、off。8、□と■以外、off、網掛け（判定しない）、網掛け（判定しない）、fill文字、off。9、□と■以外、on、網掛け（判定しない）、網掛け（判定しない）、そのまま残す、on |
| `[1]` | 表2 現在の変数・配列要素の内容に応じた更新処理。列：ケース、Pattern[p]、signif（現在）、Value[v]、Value[v＋1]、Pattern[p]（更新）、signif（更新）。1、□、off、0、網掛け（判定しない）、fill文字、off。2、■、off、0、＋以外、fill文字、on。3、■、off、0、＋、fill文字、off。4、□又は■、off、1〜9、＋以外、Value[v]、on。5、□又は■、off、1〜9、＋、Value[v]、off。6、□又は■、on、0〜9、＋以外、Value[v]、on。7、□又は■、on、0〜9、＋、Value[v]、off。8、□と■以外、off、網掛け（判定しない）、網掛け（判定しない）、fill文字、off。9、□と■以外、on、網掛け（判定しない）、網掛け（判定しない）、そのまま残す、on |
| `[2]` | 表2 現在の変数・配列要素の内容に応じた更新処理。列：ケース、Pattern[p]、signif（現在）、Value[v]、Value[v＋1]、Pattern[p]（更新）、signif（更新）。1、□、off、0、網掛け（判定しない）、fill文字、off。2、■、off、0、＋以外、fill文字、on。3、■、off、0、＋、fill文字、off。4、□又は■、off、1〜9、＋以外、Value[v]、on。5、□又は■、off、1〜9、＋、Value[v]、off。6、□又は■、on、0〜9、＋以外、Value[v]、on。7、□又は■、on、0〜9、＋、Value[v]、off。8、□と■以外、off、網掛け（判定しない）、網掛け（判定しない）、fill文字、off。9、□と■以外、on、網掛け（判定しない）、網掛け（判定しない）、そのまま残す、on |
| `[3]` | 表2 現在の変数・配列要素の内容に応じた更新処理。列：ケース、Pattern[p]、signif（現在）、Value[v]、Value[v＋1]、Pattern[p]（更新）、signif（更新）。1、□、off、0、網掛け（判定しない）、fill文字、off。2、■、off、0、＋以外、fill文字、on。3、■、off、0、＋、fill文字、off。4、□又は■、off、1〜9、＋以外、Value[v]、on。5、□又は■、off、1〜9、＋、Value[v]、off。6、□又は■、on、0〜9、＋以外、Value[v]、on。7、□又は■、on、0〜9、＋、Value[v]、off。8、□と■以外、off、網掛け（判定しない）、網掛け（判定しない）、fill文字、off。9、□と■以外、on、網掛け（判定しない）、網掛け（判定しない）、そのまま残す、on |

</details>

### legacy-2016-autumn-pm-8-source-fragment-18

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問1 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。引数Pattern[]及びValue[]に幾つかのデータを与えて，関数Editを実行した結果を，表3に示す。 |
| `[1]` | 設問1 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。引数Pattern[]及びValue[]に幾つかのデータを与えて，関数Editを実行した結果を，表3に示す。 |
| `[2]` | 設問1 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。引数Pattern[]及びValue[]に幾つかのデータを与えて，関数Editを実行した結果を，表3に示す。 |
| `[3]` | 設問1 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。引数Pattern[]及びValue[]に幾つかのデータを与えて，関数Editを実行した結果を，表3に示す。 |

</details>

### legacy-2016-autumn-pm-8-source-fragment-19

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 表3 関数Editの実行結果。列：実行前のPattern[]、実行前のValue[]、実行後のPattern[]。“␣□□,□□□”、“01234+”、“␣␣1,234”。“&#42;□□,□□□#”、“00000+”、［a］。“&#42;□□□.□□#”、“00012-”、［b］。“&#42;□□■.□□#”、“00012+”、［c］ |
| `[1]` | 表3 関数Editの実行結果。列：実行前のPattern[]、実行前のValue[]、実行後のPattern[]。“␣□□,□□□”、“01234+”、“␣␣1,234”。“&#42;□□,□□□#”、“00000+”、［a］。“&#42;□□□.□□#”、“00034-”、［b］。“&#42;□□■.□□#”、“00034+”、［c］ |
| `[2]` | 表3 関数Editの実行結果。列：実行前のPattern[]、実行前のValue[]、実行後のPattern[]。“␣□□,□□□”、“01234+”、“␣␣1,234”。“&#42;□□,□□□#”、“00000+”、［a］。“&#42;□□□.□□#”、“00056-”、［b］。“&#42;□□■.□□#”、“00056+”、［c］ |
| `[3]` | 表3 関数Editの実行結果。列：実行前のPattern[]、実行前のValue[]、実行後のPattern[]。“␣□□,□□□”、“01234+”、“␣␣1,234”。“&#42;□□,□□□#”、“00000+”、［a］。“&#42;□□□.□□#”、“00078-”、［b］。“&#42;□□■.□□#”、“00078+”、［c］ |

</details>

### legacy-2016-autumn-pm-8-source-fragment-20

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問2 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。プログラム中の破線で囲んだ部分の処理（表2のケース1〜7の処理）を，詳細なプログラムとして記述すると，次のようになる。 |
| `[1]` | 設問2 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。プログラム中の破線で囲んだ部分の処理（表2のケース1〜7の処理）を，詳細なプログラムとして記述すると，次のようになる。 |
| `[2]` | 設問2 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。プログラム中の破線で囲んだ部分の処理（表2のケース1〜7の処理）を，詳細なプログラムとして記述すると，次のようになる。 |
| `[3]` | 設問2 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。プログラム中の破線で囲んだ部分の処理（表2のケース1〜7の処理）を，詳細なプログラムとして記述すると，次のようになる。 |

</details>

### legacy-2016-autumn-pm-8-source-fragment-22

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 設問3 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。 |
| `[1]` | 設問3 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。 |
| `[2]` | 設問3 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。 |
| `[3]` | 設問3 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。 |

</details>

### legacy-2016-autumn-pm-8-source-fragment-23

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 関数Editでは，例えば，fill文字を“␣”とする編集パターンを指定することによって，数値が正なら“␣␣1,234␣”，負なら“␣␣1,234－”と編集することができる。表2のケース1〜7のうち，数値が正なら数値の後に続く文字をfill文字で置き換えるために用意されたケースは［f］である。 |
| `[1]` | 関数Editでは，例えば，fill文字を“␣”とする編集パターンを指定することによって，数値が正なら“␣␣1,234␣”，負なら“␣␣1,234－”と編集することができる。表2のケース1〜7のうち，数値が正なら数値の後に続く文字をfill文字で置き換えるために用意されたケースは［f］である。 |
| `[2]` | 関数Editでは，例えば，fill文字を“␣”とする編集パターンを指定することによって，数値が正なら“␣␣1,234␣”，負なら“␣␣1,234－”と編集することができる。表2のケース1〜7のうち，数値が正なら数値の後に続く文字をfill文字で置き換えるために用意されたケースは［f］である。 |
| `[3]` | 関数Editでは，例えば，fill文字を“␣”とする編集パターンを指定することによって，数値が正なら“␣␣1,234␣”，負なら“␣␣1,234－”と編集することができる。表2のケース1〜7のうち，数値が正なら数値の後に続く文字をfill文字で置き換えるために用意されたケースは［f］である。 |

</details>

### legacy-2016-autumn-pm-9-program1

<details><summary>許可する23組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[1]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[2]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[3]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[4]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[5]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[6]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[7]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[8]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[9]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[10]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[11]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[12]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[13]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[14]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[15]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[16]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[17]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[18]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[19]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[20]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[21]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |
| `[22]` | typedef struct {     char pr&#95;code[9];    /&#42; 開発コード &#42;/     int job&#95;term;      /&#42; 開発作業日数 &#42;/     int target&#95;term;   /&#42; 目標作業期間 &#42;/ } JOB; void job&#95;scheduling(int, JOB[], int[]); void job&#95;scheduling(int num&#95;s, JOB job[num&#95;s], int job&#95;sch[num&#95;s]) {     int ft, ft&#95;a, ft&#95;b, wt&#95;a, wt&#95;b, job&#95;no, i, j;     for (i = 0; i &lt; num&#95;s; i++) {         job&#95;sch[i] = i;     }     ft = 0;     i = 0;     while (i &lt; num&#95;s - 1) {         ft&#95;a = ft;         ft&#95;b = ft;         wt&#95;a = 0;         wt&#95;b = 0;         for (j = 0; j &lt; 2; j++) { /&#42; 遅延日数の合計wt&#95;a，wt&#95;bを求める &#42;/             ft&#95;a += job[job&#95;sch[i + j]].job&#95;term;             if (ft&#95;a &gt; job[job&#95;sch[i + j]].target&#95;term) {                 wt&#95;a += ft&#95;a - job[job&#95;sch[i + j]].target&#95;term;             }             ft&#95;b += job[job&#95;sch[[a]]].job&#95;term;             if (ft&#95;b &gt; job[job&#95;sch[[a]]].target&#95;term) {                 wt&#95;b += ft&#95;b - job[job&#95;sch[[a]]].target&#95;term;             }         }         if (wt&#95;a &gt; wt&#95;b) {             job&#95;no = job&#95;sch[i];             job&#95;sch[i] = job&#95;sch[[b]];             job&#95;sch[[b]] = job&#95;no;             if (i &gt; 0) {                 ft -= job[job&#95;sch[[c]]].job&#95;term;             }         } else {             ft [d] job[job&#95;sch[i++]].job&#95;term;         }     } } |

</details>

### legacy-2016-autumn-pm-9-job-data

<details><summary>許可する23組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜25｜27 job[1]｜"GGL08001"｜27｜29 job[2]｜"MSO16101"｜21｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[1]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜24｜29 job[2]｜"MSO16101"｜18｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[2]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜24｜29 job[2]｜"MSO16101"｜21｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[3]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜24｜29 job[2]｜"MSO16101"｜24｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[4]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜27｜29 job[2]｜"MSO16101"｜18｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[5]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜27｜29 job[2]｜"MSO16101"｜21｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[6]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜27｜29 job[2]｜"MSO16101"｜24｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[7]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜30｜29 job[2]｜"MSO16101"｜18｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[8]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜30｜29 job[2]｜"MSO16101"｜21｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[9]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜20｜27 job[1]｜"GGL08001"｜30｜29 job[2]｜"MSO16101"｜24｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[10]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜25｜27 job[1]｜"GGL08001"｜24｜29 job[2]｜"MSO16101"｜18｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[11]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜25｜27 job[1]｜"GGL08001"｜24｜29 job[2]｜"MSO16101"｜21｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[12]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜25｜27 job[1]｜"GGL08001"｜24｜29 job[2]｜"MSO16101"｜24｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[13]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜25｜27 job[1]｜"GGL08001"｜27｜29 job[2]｜"MSO16101"｜18｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[14]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜25｜27 job[1]｜"GGL08001"｜27｜29 job[2]｜"MSO16101"｜24｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[15]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜25｜27 job[1]｜"GGL08001"｜30｜29 job[2]｜"MSO16101"｜18｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[16]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜25｜27 job[1]｜"GGL08001"｜30｜29 job[2]｜"MSO16101"｜21｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[17]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜30｜27 job[1]｜"GGL08001"｜24｜29 job[2]｜"MSO16101"｜18｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[18]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜30｜27 job[1]｜"GGL08001"｜24｜29 job[2]｜"MSO16101"｜21｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[19]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜30｜27 job[1]｜"GGL08001"｜27｜29 job[2]｜"MSO16101"｜18｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[20]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜30｜27 job[1]｜"GGL08001"｜27｜29 job[2]｜"MSO16101"｜24｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[21]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜30｜27 job[1]｜"GGL08001"｜30｜29 job[2]｜"MSO16101"｜21｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |
| `[22]` | ｜pr&#95;code｜job&#95;term｜target&#95;term job[0]｜"APL12339"｜30｜27 job[1]｜"GGL08001"｜30｜29 job[2]｜"MSO16101"｜24｜30 job[3]｜"CAN03022"｜28｜77 job[4]｜"ORA14031"｜12｜93 |

</details>

### legacy-2016-autumn-pm-9-schedule-order

<details><summary>許可する23組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[1]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜3 job&#95;sch[4]｜4 |
| `[2]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜3 job&#95;sch[4]｜4 |
| `[3]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜1 job&#95;sch[2]｜2 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[4]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜3 job&#95;sch[4]｜4 |
| `[5]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[6]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[7]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[8]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[9]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[10]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[11]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[12]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜1 job&#95;sch[2]｜2 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[13]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[14]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[15]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[16]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜1 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[17]` | ｜ job&#95;sch[0]｜1 job&#95;sch[1]｜2 job&#95;sch[2]｜0 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[18]` | ｜ job&#95;sch[0]｜1 job&#95;sch[1]｜2 job&#95;sch[2]｜0 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[19]` | ｜ job&#95;sch[0]｜1 job&#95;sch[1]｜2 job&#95;sch[2]｜0 job&#95;sch[3]｜4 job&#95;sch[4]｜3 |
| `[20]` | ｜ job&#95;sch[0]｜1 job&#95;sch[1]｜2 job&#95;sch[2]｜3 job&#95;sch[3]｜4 job&#95;sch[4]｜0 |
| `[21]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜3 job&#95;sch[3]｜4 job&#95;sch[4]｜1 |
| `[22]` | ｜ job&#95;sch[0]｜0 job&#95;sch[1]｜2 job&#95;sch[2]｜3 job&#95;sch[3]｜4 job&#95;sch[4]｜1 |

</details>

### legacy-2016-autumn-pm-9-third-output-line

<details><summary>許可する23組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[1]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[2]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[3]` | 3 MSO16101 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[4]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[5]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[6]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[7]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[8]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[9]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[10]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[11]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[12]` | 3 MSO16101 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[13]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[14]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[15]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[16]` | 3 GGL08001 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[17]` | 3 APL12339 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[18]` | 3 APL12339 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[19]` | 3 APL12339 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[20]` | 3 CAN03022 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[21]` | 3 CAN03022 [e] [f] 注記 枠線は，実際には出力されない。 |
| `[22]` | 3 CAN03022 [e] [f] 注記 枠線は，実際には出力されない。 |

</details>

### legacy-2016-autumn-pm-9-lateness-formula

<details><summary>許可する23組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[1]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[2]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[3]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[4]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[5]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[6]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[7]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[8]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[9]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[10]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[11]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[12]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[13]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[14]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[15]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[16]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[17]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[18]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[19]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[20]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[21]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |
| `[22]` | wt＝ft + job&#95;term - target&#95;term（ft + job&#95;term &gt; target&#95;term），0（ft + job&#95;term ≦ target&#95;term） |

</details>

### legacy-2016-autumn-pm-10-master-record-layout

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（10回分繰返し） |
| `[1]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（6回分繰返し） |
| `[2]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（6回分繰返し） |
| `[3]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（6回分繰返し） |
| `[4]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（8回分繰返し） |
| `[5]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（8回分繰返し） |
| `[6]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（8回分繰返し） |
| `[7]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（10回分繰返し） |
| `[8]` | ：従業員番号（6桁）｜受診日（8桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） 受診日から胸部X線までが結果履歴（10回分繰返し） |

</details>

### legacy-2016-autumn-pm-10-result-record-layout

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |
| `[1]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |
| `[2]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |
| `[3]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |
| `[4]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |
| `[5]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |
| `[6]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |
| `[7]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |
| `[8]` | 様式1：受診日（8桁）｜未使用域（13桁） 様式2：従業員番号（6桁）｜身長（4桁）｜体重（4桁）｜最高血圧（3桁）｜最低血圧（3桁）｜胸部X線（1桁） |

</details>

### legacy-2016-autumn-pm-10-program

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 10. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |
| `[1]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 6. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |
| `[2]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 6. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |
| `[3]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 6. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |
| `[4]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 8. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |
| `[5]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 8. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |
| `[6]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 8. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |
| `[7]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 10. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |
| `[8]` |  1 DATA DIVISION.  2 FILE SECTION.  3 SD SORT-FILE.  4 01 SORT-REC.  5    02 SORT-NO           PIC 9(6).  6    02 SORT-ELM          PIC X(15).  7 FD MST-FILE.  8 01 MST-REC.  9    02 MST-NO            PIC 9(6). 10    02 MST-HISTORY       OCCURS 10. 11       03 MST-DATE       PIC 9(8). 12       03 MST-ELM. 13          04 MST-HEIGHT  PIC 9(3)V9(1). 14          04 MST-WEIGHT  PIC 9(3)V9(1). 15          04 MST-HIGHPRES PIC 9(3). 16          04 MST-LOWPRES  PIC 9(3). 17          04 MST-XRAY    PIC 9(1). 18 FD RSLT-FILE. 19 01 FIRST-REC. 20    02 RSLT-DATE         PIC 9(8). 21    02                  PIC X(13). 22 01 RSLT-REC             PIC X(21). 23 WORKING-STORAGE SECTION. 24 77 CNT                  PIC 9(2). 25 77 NEW-DATE             PIC 9(8). 26 77 RSLT-FLAG            PIC X(1) VALUE SPACE. 27    88 RSLT-EOF           VALUE "E". 28 77 SORT-FLAG            PIC X(1) VALUE SPACE. 29    88 SORT-EOF           VALUE "E". 30 PROCEDURE DIVISION. 31 MAIN-PROC. 32     OPEN I-O MST-FILE INPUT RSLT-FILE. 33     READ RSLT-FILE. 34     [a]. 35     SORT SORT-FILE ASCENDING KEY SORT-NO 36         INPUT PROCEDURE IS REL-PROC 37         OUTPUT PROCEDURE IS RET-PROC. 38     CLOSE MST-FILE RSLT-FILE. 39     STOP RUN. 40 REL-PROC. 41     PERFORM UNTIL RSLT-EOF 42         READ RSLT-FILE AT END SET RSLT-EOF TO TRUE 43             NOT AT END [b] 44         END-READ 45     END-PERFORM. 46 RET-PROC. 47     PERFORM UNTIL SORT-EOF 48         RETURN SORT-FILE AT END SET SORT-EOF TO TRUE 49             NOT AT END PERFORM MATCHING-PROC 50         END-RETURN 51     END-PERFORM. 52 MATCHING-PROC. 53     READ MST-FILE. 54     PERFORM TEST BEFORE UNTIL [c] 55         READ MST-FILE END-READ 56     END-PERFORM. 57     PERFORM TEST BEFORE VARYING CNT [d] UNTIL CNT = 0 58         MOVE MST-HISTORY(CNT) TO MST-HISTORY(CNT + 1) 59     END-PERFORM. 60     MOVE NEW-DATE TO MST-DATE(1). 61     MOVE SORT-ELM TO MST-ELM(1). 62     REWRITE MST-REC. |

</details>

### legacy-2016-autumn-pm-10-change-table

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |
| `[1]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |
| `[2]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |
| `[3]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |
| `[4]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |
| `[5]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |
| `[6]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |
| `[7]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |
| `[8]` | 処置｜変更内容 行番号29と30の間に追加｜77 MST-FLAG             PIC X(1) VALUE SPACE.    88 MST-EOF           VALUE "E". 01 DISP-WK              PIC X(30). [e]に追加｜PERFORM UNTIL MST-EOF     READ MST-FILE AT END SET MST-EOF TO TRUE         NOT AT END DISPLAY MST-NO ": NO-DATA"     END-READ END-PERFORM. 行番号54と55の間に追加｜DISPLAY MST-NO ": NO-DATA" 行番号61と62の間に追加｜[f]. MOVE SPACE TO DISP-WK. IF MST-DATE(2) NOT = ZERO AND     ([g]) THEN     MOVE " WEIGHT" TO DISP-WK(CNT:)     ADD 7 TO CNT END-IF. IF MST-HIGHPRES(1) &gt;= 140 OR     MST-HIGHPRES(1) &lt;= 90 THEN     MOVE " BLOOD-PRESSURE" TO DISP-WK(CNT:)     ADD 15 TO CNT END-IF. IF MST-XRAY(1) = 1 THEN     MOVE " XRAY" TO DISP-WK(CNT:) END-IF. DISPLAY MST-NO ":" DISP-WK. |

</details>

### legacy-2016-autumn-pm-10-confirmation-output

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |
| `[1]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |
| `[2]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |
| `[3]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |
| `[4]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |
| `[5]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |
| `[6]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |
| `[7]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |
| `[8]` | 920186: NO-DATA 920189: 920221: WEIGHT BLOOD-PRESSURE XRAY 930015: WEIGHT 930016: 940047: NO-DATA     ⋮ |

</details>

### legacy-2016-autumn-pm-11-digit-enum-program

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |
| `[1]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |
| `[2]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |
| `[3]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |
| `[4]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |
| `[5]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |
| `[6]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |
| `[7]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |
| `[8]` | import java.util.Stack; enum DigitKey [a] Key {     DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,     DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;     public void operateOn(Stack&lt;Integer&gt; stack) {         stack.push([b] &#42; 10 + [c]);     } } |

</details>

### legacy-2016-autumn-pm-11-operation-enum-program

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |
| `[1]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |
| `[2]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |
| `[3]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |
| `[4]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |
| `[5]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |
| `[6]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |
| `[7]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |
| `[8]` | import java.util.Stack; enum OperationKey [a] Key {     ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;     public void operateOn(Stack&lt;Integer&gt; stack) {         if (this == EQUAL &#124;&#124; this == CLEAR) {             return;         }         int val2 = stack.pop();         int val1 = stack.pop();         stack.push(calculate(val1, val2));     }     private int calculate(int val1, int val2) {         switch ([d]) {         case ADD:             return val1 + val2;         case SUBTRACT:             return val1 - val2;         case MULTIPLY:             return val1 &#42; val2;         case DIVIDE:             return val1 / val2;         default:             throw new AssertionError(toString());         }     } } |

</details>

### legacy-2016-autumn-pm-11-test-map-program

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |
| `[1]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |
| `[2]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |
| `[3]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |
| `[4]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |
| `[5]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |
| `[6]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |
| `[7]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |
| `[8]` | import java.util.HashMap; import java.util.Map; public class CalculatorTest {     public static void main(String[] args) {         Map&lt;Character, [e]&gt; map = new HashMap&lt;Character, [e]&gt;();         // 文字と列挙OperationKeyの定数の対応をmapに格納する。         for (OperationKey key : OperationKey.values()) {             map.put("+-&#42;/=C".charAt(key.ordinal()), key);         }         // 数字と列挙DigitKeyの定数の対応をmapに格納する。         for (DigitKey key : DigitKey.values()) {             map.put("0123456789".charAt(key.ordinal()), key);         }         Calculator calc = new Calculator();         String chars = args[0];         // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。         for (int i = 0; i &lt; chars.length(); i++) {             calc.onKeyPressed(map.get(chars.charAt(i)));         }     } } |

</details>

### legacy-2016-autumn-pm-11-example-output

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |
| `[1]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |
| `[2]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |
| `[3]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |
| `[4]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |
| `[5]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |
| `[6]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |
| `[7]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |
| `[8]` | DIGIT2 2 MULTIPLY 2 DIGIT3 3 EQUAL 6 |

</details>

### legacy-2016-autumn-pm-11-argument-results

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C2=｜[f] 8/2/=｜[g] |
| `[1]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C2=｜[f] 16/2/2=｜[g] |
| `[2]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C2=｜[f] 32/2/2=｜[g] |
| `[3]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C4=｜[f] 8/2/=｜[g] |
| `[4]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C4=｜[f] 16/2/2=｜[g] |
| `[5]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C4=｜[f] 32/2/2=｜[g] |
| `[6]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C8=｜[f] 8/2/=｜[g] |
| `[7]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C8=｜[f] 16/2/2=｜[g] |
| `[8]` | 文字列（引数）｜出力（最後の行） 2&#42;6/3=｜4 -2=｜-2 2&#42;4==｜8 2&#42;4C8=｜[f] 32/2/2=｜[g] |

</details>

### legacy-2016-autumn-pm-12-generic-list-structure

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。 |
| `[1]` | ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。 |
| `[2]` | ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。 |
| `[3]` | ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。 |
| `[4]` | ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。 |
| `[5]` | ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。 |
| `[6]` | ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。 |
| `[7]` | ROOTの1語が要素1の先頭を指す。各要素は次の要素へのポインタと値の連続した2語。要素1→要素2→…→要素N。最後のポインタは0。アドレス0以外に格納。 |

</details>

### legacy-2016-autumn-pm-12-three-element-list

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=3。 |
| `[1]` | ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=2。 |
| `[2]` | ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=2。 |
| `[3]` | ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=2。 |
| `[4]` | ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=2。 |
| `[5]` | ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=3。 |
| `[6]` | ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=3。 |
| `[7]` | ROOT→要素1→要素2→要素3→0。各要素の第1語は次へのポインタ，第2語は値。n=3。 |

</details>

### legacy-2016-autumn-pm-12-lproc-program

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` |  1 LPROC START  2       RPUSH  3       LD    GR4,GR2       ; GR4←n  4 LP    LD    GR2,0,GR1     ; 次の要素をたどる  5       JZE   FIN          ; n&gt;Nか？  6       SUBA  GR4,=1  7       JZE   NEXT         ; 要素nに達したか？  8       [a]  9       JUMP  LP 10 NEXT  LD    GR3,LTBL,GR3 11       JUMP  0,GR3         ; 指定された処理にジャンプ 12 LINS  LD    GR4,GR2 13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス 14       [b] 15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定 16       ST    GR0,1,GR2 17       JUMP  FIN 18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス 19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定 20       CALL  EFREE         ; 削除された要素nの領域を解放 21 FIN   RPOP 22       RET 23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル 24       DC    LDEL 25       END |
| `[1]` |  1 LPROC START  2       RPUSH  3       LD    GR4,GR2       ; GR4←n  4 LP    LD    GR2,0,GR1     ; 次の要素をたどる  5       JZE   FIN          ; n&gt;Nか？  6       SUBA  GR4,=1  7       JZE   NEXT         ; 要素nに達したか？  8       [a]  9       JUMP  LP 10 NEXT  LD    GR3,LTBL,GR3 11       JUMP  0,GR3         ; 指定された処理にジャンプ 12 LINS  LD    GR4,GR2 13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス 14       [b] 15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定 16       ST    GR0,1,GR2 17       JUMP  FIN 18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス 19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定 20       CALL  EFREE         ; 削除された要素nの領域を解放 21 FIN   RPOP 22       RET 23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル 24       DC    LDEL 25       END |
| `[2]` |  1 LPROC START  2       RPUSH  3       LD    GR4,GR2       ; GR4←n  4 LP    LD    GR2,0,GR1     ; 次の要素をたどる  5       JZE   FIN          ; n&gt;Nか？  6       SUBA  GR4,=1  7       JZE   NEXT         ; 要素nに達したか？  8       [a]  9       JUMP  LP 10 NEXT  LD    GR3,LTBL,GR3 11       JUMP  0,GR3         ; 指定された処理にジャンプ 12 LINS  LD    GR4,GR2 13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス 14       [b] 15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定 16       ST    GR0,1,GR2 17       JUMP  FIN 18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス 19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定 20       CALL  EFREE         ; 削除された要素nの領域を解放 21 FIN   RPOP 22       RET 23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル 24       DC    LDEL 25       END |
| `[3]` |  1 LPROC START  2       RPUSH  3       LD    GR4,GR2       ; GR4←n  4 LP    LD    GR2,0,GR1     ; 次の要素をたどる  5       JZE   FIN          ; n&gt;Nか？  6       SUBA  GR4,=1  7       JZE   NEXT         ; 要素nに達したか？  8       [a]  9       JUMP  LP 10 NEXT  LD    GR3,LTBL,GR3 11       JUMP  0,GR3         ; 指定された処理にジャンプ 12 LINS  LD    GR4,GR2 13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス 14       [b] 15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定 16       ST    GR0,1,GR2 17       JUMP  FIN 18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス 19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定 20       CALL  EFREE         ; 削除された要素nの領域を解放 21 FIN   RPOP 22       RET 23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル 24       DC    LDEL 25       END |
| `[4]` |  1 LPROC START  2       RPUSH  3       LD    GR4,GR2       ; GR4←n  4 LP    LD    GR2,0,GR1     ; 次の要素をたどる  5       JZE   FIN          ; n&gt;Nか？  6       SUBA  GR4,=1  7       JZE   NEXT         ; 要素nに達したか？  8       [a]  9       JUMP  LP 10 NEXT  LD    GR3,LTBL,GR3 11       JUMP  0,GR3         ; 指定された処理にジャンプ 12 LINS  LD    GR4,GR2 13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス 14       [b] 15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定 16       ST    GR0,1,GR2 17       JUMP  FIN 18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス 19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定 20       CALL  EFREE         ; 削除された要素nの領域を解放 21 FIN   RPOP 22       RET 23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル 24       DC    LDEL 25       END |
| `[5]` |  1 LPROC START  2       RPUSH  3       LD    GR4,GR2       ; GR4←n  4 LP    LD    GR2,0,GR1     ; 次の要素をたどる  5       JZE   FIN          ; n&gt;Nか？  6       SUBA  GR4,=1  7       JZE   NEXT         ; 要素nに達したか？  8       [a]  9       JUMP  LP 10 NEXT  LD    GR3,LTBL,GR3 11       JUMP  0,GR3         ; 指定された処理にジャンプ 12 LINS  LD    GR4,GR2 13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス 14       [b] 15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定 16       ST    GR0,1,GR2 17       JUMP  FIN 18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス 19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定 20       CALL  EFREE         ; 削除された要素nの領域を解放 21 FIN   RPOP 22       RET 23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル 24       DC    LDEL 25       END |
| `[6]` |  1 LPROC START  2       RPUSH  3       LD    GR4,GR2       ; GR4←n  4 LP    LD    GR2,0,GR1     ; 次の要素をたどる  5       JZE   FIN          ; n&gt;Nか？  6       SUBA  GR4,=1  7       JZE   NEXT         ; 要素nに達したか？  8       [a]  9       JUMP  LP 10 NEXT  LD    GR3,LTBL,GR3 11       JUMP  0,GR3         ; 指定された処理にジャンプ 12 LINS  LD    GR4,GR2 13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス 14       [b] 15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定 16       ST    GR0,1,GR2 17       JUMP  FIN 18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス 19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定 20       CALL  EFREE         ; 削除された要素nの領域を解放 21 FIN   RPOP 22       RET 23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル 24       DC    LDEL 25       END |
| `[7]` |  1 LPROC START  2       RPUSH  3       LD    GR4,GR2       ; GR4←n  4 LP    LD    GR2,0,GR1     ; 次の要素をたどる  5       JZE   FIN          ; n&gt;Nか？  6       SUBA  GR4,=1  7       JZE   NEXT         ; 要素nに達したか？  8       [a]  9       JUMP  LP 10 NEXT  LD    GR3,LTBL,GR3 11       JUMP  0,GR3         ; 指定された処理にジャンプ 12 LINS  LD    GR4,GR2 13       CALL  EGET          ; GR2←挿入される要素の先頭アドレス 14       [b] 15       ST    GR4,0,GR2     ; 挿入される要素の1語目を設定 16       ST    GR0,1,GR2 17       JUMP  FIN 18 LDEL  [c]                ; GR4←要素n+1の先頭アドレス 19       ST    GR4,0,GR1     ; 要素n−1の1語目を再設定 20       CALL  EFREE         ; 削除された要素nの領域を解放 21 FIN   RPOP 22       RET 23 LTBL  DC    LINS          ; 処理の分岐先アドレステーブル 24       DC    LDEL 25       END |

</details>

### legacy-2016-autumn-pm-13-transition-sheet

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` |  ｜A｜B｜C｜D｜E｜…｜U｜V 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜19｜20 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜5｜0｜0｜…｜0｜0 5｜｜3｜8｜4｜0｜…｜0｜0 6｜｜4｜0｜10｜8｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 21｜｜19｜0｜0｜0｜…｜0｜0 22｜｜20｜0｜0｜0｜…｜4｜0 |
| `[1]` |  ｜A｜B｜C｜D｜E｜…｜S｜T 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜17｜18 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜5｜0｜0｜…｜0｜0 5｜｜3｜8｜4｜0｜…｜0｜0 6｜｜4｜0｜10｜8｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 19｜｜17｜0｜0｜0｜…｜0｜0 20｜｜18｜0｜0｜0｜…｜4｜0 |
| `[2]` |  ｜A｜B｜C｜D｜E｜…｜S｜T 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜17｜18 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜10｜0｜0｜…｜0｜0 5｜｜3｜16｜8｜0｜…｜0｜0 6｜｜4｜0｜20｜16｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 19｜｜17｜0｜0｜0｜…｜0｜0 20｜｜18｜0｜0｜0｜…｜8｜0 |
| `[3]` |  ｜A｜B｜C｜D｜E｜…｜S｜T 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜17｜18 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜15｜0｜0｜…｜0｜0 5｜｜3｜24｜12｜0｜…｜0｜0 6｜｜4｜0｜30｜24｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 19｜｜17｜0｜0｜0｜…｜0｜0 20｜｜18｜0｜0｜0｜…｜12｜0 |
| `[4]` |  ｜A｜B｜C｜D｜E｜…｜U｜V 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜19｜20 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜10｜0｜0｜…｜0｜0 5｜｜3｜16｜8｜0｜…｜0｜0 6｜｜4｜0｜20｜16｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 21｜｜19｜0｜0｜0｜…｜0｜0 22｜｜20｜0｜0｜0｜…｜8｜0 |
| `[5]` |  ｜A｜B｜C｜D｜E｜…｜U｜V 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜19｜20 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜15｜0｜0｜…｜0｜0 5｜｜3｜24｜12｜0｜…｜0｜0 6｜｜4｜0｜30｜24｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 21｜｜19｜0｜0｜0｜…｜0｜0 22｜｜20｜0｜0｜0｜…｜12｜0 |
| `[6]` |  ｜A｜B｜C｜D｜E｜…｜W｜X 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜21｜22 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜5｜0｜0｜…｜0｜0 5｜｜3｜8｜4｜0｜…｜0｜0 6｜｜4｜0｜10｜8｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 23｜｜21｜0｜0｜0｜…｜0｜0 24｜｜22｜0｜0｜0｜…｜4｜0 |
| `[7]` |  ｜A｜B｜C｜D｜E｜…｜W｜X 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜21｜22 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜10｜0｜0｜…｜0｜0 5｜｜3｜16｜8｜0｜…｜0｜0 6｜｜4｜0｜20｜16｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 23｜｜21｜0｜0｜0｜…｜0｜0 24｜｜22｜0｜0｜0｜…｜8｜0 |
| `[8]` |  ｜A｜B｜C｜D｜E｜…｜W｜X 1｜｜｜作業開始時の状態ID｜｜｜｜｜ 2｜作業終了時の 状態ID｜｜1｜2｜3｜…｜21｜22 3｜｜1｜0｜0｜0｜…｜0｜0 4｜｜2｜15｜0｜0｜…｜0｜0 5｜｜3｜24｜12｜0｜…｜0｜0 6｜｜4｜0｜30｜24｜…｜0｜0 ⋮｜｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 23｜｜21｜0｜0｜0｜…｜0｜0 24｜｜22｜0｜0｜0｜…｜12｜0 |

</details>

### legacy-2016-autumn-pm-13-route-examples-sheet

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜8｜8 5｜6｜8｜16 ⋮｜⋮｜⋮｜⋮ 8｜11｜5｜35 9｜｜0｜35 ⋮｜⋮｜⋮｜⋮ 22｜｜0｜35 23｜｜計｜35  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜8｜8 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜15｜×｜× 9｜17｜×｜× ⋮｜⋮｜⋮｜⋮ 22｜｜0｜× 23｜｜計｜× |
| `[1]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜8｜8 5｜6｜8｜16 ⋮｜⋮｜⋮｜⋮ 8｜11｜5｜35 9｜｜0｜35 ⋮｜⋮｜⋮｜⋮ 20｜｜0｜35 21｜｜計｜35  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜8｜8 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜13｜×｜× 9｜15｜×｜× ⋮｜⋮｜⋮｜⋮ 20｜｜0｜× 21｜｜計｜× |
| `[2]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜16｜16 5｜6｜16｜32 ⋮｜⋮｜⋮｜⋮ 8｜11｜10｜70 9｜｜0｜70 ⋮｜⋮｜⋮｜⋮ 20｜｜0｜70 21｜｜計｜70  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜16｜16 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜13｜×｜× 9｜15｜×｜× ⋮｜⋮｜⋮｜⋮ 20｜｜0｜× 21｜｜計｜× |
| `[3]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜24｜24 5｜6｜24｜48 ⋮｜⋮｜⋮｜⋮ 8｜11｜15｜105 9｜｜0｜105 ⋮｜⋮｜⋮｜⋮ 20｜｜0｜105 21｜｜計｜105  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜24｜24 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜13｜×｜× 9｜15｜×｜× ⋮｜⋮｜⋮｜⋮ 20｜｜0｜× 21｜｜計｜× |
| `[4]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜16｜16 5｜6｜16｜32 ⋮｜⋮｜⋮｜⋮ 8｜11｜10｜70 9｜｜0｜70 ⋮｜⋮｜⋮｜⋮ 22｜｜0｜70 23｜｜計｜70  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜16｜16 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜15｜×｜× 9｜17｜×｜× ⋮｜⋮｜⋮｜⋮ 22｜｜0｜× 23｜｜計｜× |
| `[5]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜24｜24 5｜6｜24｜48 ⋮｜⋮｜⋮｜⋮ 8｜11｜15｜105 9｜｜0｜105 ⋮｜⋮｜⋮｜⋮ 22｜｜0｜105 23｜｜計｜105  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜24｜24 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜15｜×｜× 9｜17｜×｜× ⋮｜⋮｜⋮｜⋮ 22｜｜0｜× 23｜｜計｜× |
| `[6]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜8｜8 5｜6｜8｜16 ⋮｜⋮｜⋮｜⋮ 8｜11｜5｜35 9｜｜0｜35 ⋮｜⋮｜⋮｜⋮ 24｜｜0｜35 25｜｜計｜35  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜8｜8 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜17｜×｜× 9｜19｜×｜× ⋮｜⋮｜⋮｜⋮ 24｜｜0｜× 25｜｜計｜× |
| `[7]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜16｜16 5｜6｜16｜32 ⋮｜⋮｜⋮｜⋮ 8｜11｜10｜70 9｜｜0｜70 ⋮｜⋮｜⋮｜⋮ 24｜｜0｜70 25｜｜計｜70  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜16｜16 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜17｜×｜× 9｜19｜×｜× ⋮｜⋮｜⋮｜⋮ 24｜｜0｜× 25｜｜計｜× |
| `[8]` | 状態遷移列が存在する場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜24｜24 5｜6｜24｜48 ⋮｜⋮｜⋮｜⋮ 8｜11｜15｜105 9｜｜0｜105 ⋮｜⋮｜⋮｜⋮ 24｜｜0｜105 25｜｜計｜105  状態遷移列が存在しない場合の例 ｜A｜B｜C 1｜状態遷移列 の状態ID｜｜ 2｜｜日数｜総日数 3｜3｜0｜0 4｜4｜24｜24 5｜7｜×｜× ⋮｜⋮｜⋮｜⋮ 8｜17｜×｜× 9｜19｜×｜× ⋮｜⋮｜⋮｜⋮ 24｜｜0｜× 25｜｜計｜× |

</details>

### legacy-2016-autumn-pm-13-extended-route-sheet

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜8｜8｜｜｜｜｜2｜9999｜ 5｜6｜8｜16｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜5｜35｜｜｜｜｜7｜19｜6 10｜13｜12｜47｜｜｜｜｜8｜21｜6 11｜｜0｜47｜｜｜｜｜9｜28｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜47｜｜｜｜｜13｜47｜11 16｜｜0｜47｜｜｜｜｜14｜51｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 22｜｜0｜47｜｜｜｜｜20｜80｜19 23｜｜計｜47｜｜｜｜｜｜｜ |
| `[1]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜8｜8｜｜｜｜｜2｜9999｜ 5｜6｜8｜16｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜5｜35｜｜｜｜｜7｜19｜6 10｜13｜12｜47｜｜｜｜｜8｜21｜6 11｜｜0｜47｜｜｜｜｜9｜28｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜47｜｜｜｜｜13｜47｜11 16｜｜0｜47｜｜｜｜｜14｜51｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 20｜｜0｜47｜｜｜｜｜18｜80｜17 21｜｜計｜47｜｜｜｜｜｜｜ |
| `[2]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜16｜16｜｜｜｜｜2｜9999｜ 5｜6｜16｜32｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜10｜70｜｜｜｜｜7｜38｜6 10｜13｜24｜94｜｜｜｜｜8｜42｜6 11｜｜0｜94｜｜｜｜｜9｜56｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜94｜｜｜｜｜13｜94｜11 16｜｜0｜94｜｜｜｜｜14｜102｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 20｜｜0｜94｜｜｜｜｜18｜160｜17 21｜｜計｜94｜｜｜｜｜｜｜ |
| `[3]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜24｜24｜｜｜｜｜2｜9999｜ 5｜6｜24｜48｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜15｜105｜｜｜｜｜7｜57｜6 10｜13｜36｜141｜｜｜｜｜8｜63｜6 11｜｜0｜141｜｜｜｜｜9｜84｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜141｜｜｜｜｜13｜141｜11 16｜｜0｜141｜｜｜｜｜14｜153｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 20｜｜0｜141｜｜｜｜｜18｜240｜17 21｜｜計｜141｜｜｜｜｜｜｜ |
| `[4]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜16｜16｜｜｜｜｜2｜9999｜ 5｜6｜16｜32｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜10｜70｜｜｜｜｜7｜38｜6 10｜13｜24｜94｜｜｜｜｜8｜42｜6 11｜｜0｜94｜｜｜｜｜9｜56｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜94｜｜｜｜｜13｜94｜11 16｜｜0｜94｜｜｜｜｜14｜102｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 22｜｜0｜94｜｜｜｜｜20｜160｜19 23｜｜計｜94｜｜｜｜｜｜｜ |
| `[5]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜24｜24｜｜｜｜｜2｜9999｜ 5｜6｜24｜48｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜15｜105｜｜｜｜｜7｜57｜6 10｜13｜36｜141｜｜｜｜｜8｜63｜6 11｜｜0｜141｜｜｜｜｜9｜84｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜141｜｜｜｜｜13｜141｜11 16｜｜0｜141｜｜｜｜｜14｜153｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 22｜｜0｜141｜｜｜｜｜20｜240｜19 23｜｜計｜141｜｜｜｜｜｜｜ |
| `[6]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜8｜8｜｜｜｜｜2｜9999｜ 5｜6｜8｜16｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜5｜35｜｜｜｜｜7｜19｜6 10｜13｜12｜47｜｜｜｜｜8｜21｜6 11｜｜0｜47｜｜｜｜｜9｜28｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜47｜｜｜｜｜13｜47｜11 16｜｜0｜47｜｜｜｜｜14｜51｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 24｜｜0｜47｜｜｜｜｜22｜80｜21 25｜｜計｜47｜｜｜｜｜｜｜ |
| `[7]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜16｜16｜｜｜｜｜2｜9999｜ 5｜6｜16｜32｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜10｜70｜｜｜｜｜7｜38｜6 10｜13｜24｜94｜｜｜｜｜8｜42｜6 11｜｜0｜94｜｜｜｜｜9｜56｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜94｜｜｜｜｜13｜94｜11 16｜｜0｜94｜｜｜｜｜14｜102｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 24｜｜0｜94｜｜｜｜｜22｜160｜21 25｜｜計｜94｜｜｜｜｜｜｜ |
| `[8]` |  ｜A｜B｜C｜D｜E｜F｜G｜H｜I｜J 1｜状態遷移列 の状態ID｜｜｜｜｜｜｜｜｜ 2｜｜日数｜総日数｜｜開始状態ID｜3｜｜状態ID｜最小日数｜前状態ID 3｜3｜0｜0｜｜終了状態ID｜13｜｜1｜9999｜ 4｜4｜24｜24｜｜｜｜｜2｜9999｜ 5｜6｜24｜48｜｜｜｜｜3｜0｜0 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 9｜11｜15｜105｜｜｜｜｜7｜57｜6 10｜13｜36｜141｜｜｜｜｜8｜63｜6 11｜｜0｜141｜｜｜｜｜9｜84｜8 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 15｜｜0｜141｜｜｜｜｜13｜141｜11 16｜｜0｜141｜｜｜｜｜14｜153｜13 ⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮｜⋮ 24｜｜0｜141｜｜｜｜｜22｜240｜21 25｜｜計｜141｜｜｜｜｜｜｜ |

</details>

### legacy-2016-autumn-pm-13-display-minimum-path-macro

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 20,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |
| `[1]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 18,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |
| `[2]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 18,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |
| `[3]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 18,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |
| `[4]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 20,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |
| `[5]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 20,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |
| `[6]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 22,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |
| `[7]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 22,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |
| `[8]` | ○マクロ：DisplayMinimumPath ○数値型：I，NumWork，Current ■ I:1,I ≦ 22,1   ・相対(A2,I,0) ← null ■ ▲ 相対(I2,F3,0) &lt; 9999    /&#42; 状態遷移列が存在する &#42;/   ・NumWork ← 0   ・Current ← F3   /&#42; 作業工程の作業数NumWorkを算出する &#42;/   ■ [d]     ・Current ← [e]     ・NumWork ← NumWork + 1   ■   /&#42; 状態遷移列を格納する &#42;/   ・Current ← F3   ■ [f]     ・相対(A3,I,0) ← Current     ・Current ← [e]   ■ ▼ |

</details>

### legacy-2016-autumn-pm-13-worksheet-formulas

<details><summary>許可する9組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B22に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C22に複写する。     IF([b],'×',[c]) (4) 次の式をセルC23に入力する。     C22 |
| `[1]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B20に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C20に複写する。     IF([b],'×',[c]) (4) 次の式をセルC21に入力する。     C20 |
| `[2]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B20に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C20に複写する。     IF([b],'×',[c]) (4) 次の式をセルC21に入力する。     C20 |
| `[3]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B20に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C20に複写する。     IF([b],'×',[c]) (4) 次の式をセルC21に入力する。     C20 |
| `[4]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B22に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C22に複写する。     IF([b],'×',[c]) (4) 次の式をセルC23に入力する。     C22 |
| `[5]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B22に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C22に複写する。     IF([b],'×',[c]) (4) 次の式をセルC23に入力する。     C22 |
| `[6]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B24に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C24に複写する。     IF([b],'×',[c]) (4) 次の式をセルC25に入力する。     C24 |
| `[7]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B24に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C24に複写する。     IF([b],'×',[c]) (4) 次の式をセルC25に入力する。     C24 |
| `[8]` | (1) セルB3及びセルC3に0を入力する。 (2) 次の式をセルB4に入力し，セルB5〜B24に複写する。     IF(A4 = null,0,IF([a] &gt; 0,[a],'×')) (3) 次の式をセルC4に入力し，セルC5〜C24に複写する。     IF([b],'×',[c]) (4) 次の式をセルC25に入力する。     C24 |

</details>

### legacy-2016-spring-pm-1-network

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 利用者枠の利用者端末はインターネットを介してA社枠のFW（ファイアウォール）につながる。FWはDMZ（破線枠）内のWebサーバとLAN（破線枠）に接続する。LAN内のDBサーバ（データベース）には，会員情報（氏名，メールアドレス，訪れた飲食店情報，ログイン情報（IDとパスワード）など）と公開情報（飲食店情報，評価情報）がある。 |

</details>

### legacy-2016-spring-pm-2-cell

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左からマークビット1欄、ポインタ2欄（それぞれから下向きの矢印）、固定長データ領域1欄。 |

</details>

### legacy-2016-spring-pm-2-memory

<details><summary>許可する1組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | マークビット0と斜線で示すNULLポインタ2欄をもつセルが連続する。途中を波線で省略。 |

</details>

### legacy-2016-spring-pm-2-live

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | (a) LIVEから左上とセルA（ポインタX）に接続。左上：実線、マークビット0、ポインタは左が左下、右がNULL。左下：実線、マークビット0、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット0、ポインタは左がNULL、右がNULL。セルA：実線、マークビット0、ポインタは左がセルC、右がセルB。セルC：実線、マークビット0、ポインタは左がNULL、右がセルCの先。セルB：実線、マークビット0、ポインタは左がNULL、右がNULL。セルCの先：実線、マークビット0、ポインタは左がNULL、右がNULL。 (b) LIVEから左上とセルC（ポインタX）に接続。左上：実線、マークビット0、ポインタは左が左下、右がNULL。左下：実線、マークビット0、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット0、ポインタは左がNULL、右がNULL。セルA：破線、マークビット0、ポインタは左がセルC、右がセルB。セルC：実線、マークビット0、ポインタは左がNULL、右がセルCの先。セルB：破線、マークビット0、ポインタは左がNULL、右がNULL。セルCの先：実線、マークビット0、ポインタは左がNULL、右がNULL。 |
| `[1]` | (a) LIVEから左上とセルA（ポインタX）に接続。左上：実線、マークビット0、ポインタは左が左下、右がNULL。左下：実線、マークビット0、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット0、ポインタは左がNULL、右がNULL。セルA：実線、マークビット0、ポインタは左がセルC、右がセルB。セルC：実線、マークビット0、ポインタは左がNULL、右がセルCの先。セルB：実線、マークビット0、ポインタは左がNULL、右がNULL。セルCの先：実線、マークビット0、ポインタは左がNULL、右がNULL。 (b) LIVEから左上とセルB（ポインタX）に接続。左上：実線、マークビット0、ポインタは左が左下、右がNULL。左下：実線、マークビット0、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット0、ポインタは左がNULL、右がNULL。セルA：破線、マークビット0、ポインタは左がセルC、右がセルB。セルC：破線、マークビット0、ポインタは左がNULL、右がセルCの先。セルB：実線、マークビット0、ポインタは左がNULL、右がNULL。セルCの先：破線、マークビット0、ポインタは左がNULL、右がNULL。 |
| `[2]` | (a) LIVEから左上とセルA（ポインタX）に接続。左上：実線、マークビット0、ポインタは左が左下、右がNULL。左下：実線、マークビット0、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット0、ポインタは左がNULL、右がNULL。セルA：実線、マークビット0、ポインタは左がセルC、右がセルB。セルC：実線、マークビット0、ポインタは左がNULL、右がセルD。セルB：実線、マークビット0、ポインタは左がNULL、右がNULL。セルD：実線、マークビット0、ポインタは左がNULL、右がNULL。 (b) LIVEから左上とセルD（ポインタX）に接続。左上：実線、マークビット0、ポインタは左が左下、右がNULL。左下：実線、マークビット0、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット0、ポインタは左がNULL、右がNULL。セルA：破線、マークビット0、ポインタは左がセルC、右がセルB。セルC：破線、マークビット0、ポインタは左がNULL、右がセルD。セルB：破線、マークビット0、ポインタは左がNULL、右がNULL。セルD：実線、マークビット0、ポインタは左がNULL、右がNULL。 |
| `[3]` | (a) LIVEから左上とセルA（ポインタX）に接続。左上：実線、マークビット0、ポインタは左が左下、右がNULL。左下：実線、マークビット0、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット0、ポインタは左がNULL、右がNULL。セルA：実線、マークビット0、ポインタは左がセルC、右がセルB。セルC：実線、マークビット0、ポインタは左がセルB、右がセルCの先。セルB：実線、マークビット0、ポインタは左がNULL、右がNULL。セルCの先：実線、マークビット0、ポインタは左がNULL、右がNULL。 (b) LIVEから左上とセルC（ポインタX）に接続。左上：実線、マークビット0、ポインタは左が左下、右がNULL。左下：実線、マークビット0、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット0、ポインタは左がNULL、右がNULL。セルA：破線、マークビット0、ポインタは左がセルC、右がセルB。セルC：実線、マークビット0、ポインタは左がセルB、右がセルCの先。セルB：実線、マークビット0、ポインタは左がNULL、右がNULL。セルCの先：実線、マークビット0、ポインタは左がNULL、右がNULL。 |

</details>

### legacy-2016-spring-pm-2-marked

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | LIVEから左上とセルC（ポインタX）に接続。左上：実線、マークビット1、ポインタは左が左下、右がNULL。左下：実線、マークビット1、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット1、ポインタは左がNULL、右がNULL。セルA：破線、マークビット0、ポインタは左がセルC、右がセルB。セルC：実線、マークビット1、ポインタは左がNULL、右がセルCの先。セルB：破線、マークビット0、ポインタは左がNULL、右がNULL。セルCの先：実線、マークビット1、ポインタは左がNULL、右がNULL。図中の1はマーキングされたことを示す。 |
| `[1]` | LIVEから左上とセルB（ポインタX）に接続。左上：実線、マークビット1、ポインタは左が左下、右がNULL。左下：実線、マークビット1、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット1、ポインタは左がNULL、右がNULL。セルA：破線、マークビット0、ポインタは左がセルC、右がセルB。セルC：破線、マークビット0、ポインタは左がNULL、右がセルCの先。セルB：実線、マークビット1、ポインタは左がNULL、右がNULL。セルCの先：破線、マークビット0、ポインタは左がNULL、右がNULL。図中の1はマーキングされたことを示す。 |
| `[2]` | LIVEから左上とセルD（ポインタX）に接続。左上：実線、マークビット1、ポインタは左が左下、右がNULL。左下：実線、マークビット1、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット1、ポインタは左がNULL、右がNULL。セルA：破線、マークビット0、ポインタは左がセルC、右がセルB。セルC：破線、マークビット0、ポインタは左がNULL、右がセルD。セルB：破線、マークビット0、ポインタは左がNULL、右がNULL。セルD：実線、マークビット1、ポインタは左がNULL、右がNULL。図中の1はマーキングされたことを示す。 |
| `[3]` | LIVEから左上とセルC（ポインタX）に接続。左上：実線、マークビット1、ポインタは左が左下、右がNULL。左下：実線、マークビット1、ポインタは左がNULL、右が左下の先。左下の先：実線、マークビット1、ポインタは左がNULL、右がNULL。セルA：破線、マークビット0、ポインタは左がセルC、右がセルB。セルC：実線、マークビット1、ポインタは左がセルB、右がセルCの先。セルB：実線、マークビット1、ポインタは左がNULL、右がNULL。セルCの先：実線、マークビット1、ポインタは左がNULL、右がNULL。図中の1はマーキングされたことを示す。 |

</details>

### legacy-2016-spring-pm-2-sweep

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | メモリ領域のセルのマークビットは順に1、0、1、0、1、1、省略後は1、1。0のセルの輪郭は破線、1のセルは実線。 |
| `[1]` | メモリ領域のセルのマークビットは順に1、0、1、1、1、0、省略後は0、1。0のセルの輪郭は破線、1のセルは実線。 |
| `[2]` | メモリ領域のセルのマークビットは順に1、0、1、0、1、0、省略後は1、1。0のセルの輪郭は破線、1のセルは実線。 |
| `[3]` | メモリ領域のセルのマークビットは順に1、0、1、1、1、1、省略後は1、1。0のセルの輪郭は破線、1のセルは実線。 |

</details>

### legacy-2016-spring-pm-2-efficiency

<details><summary>許可する16組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0]` | 横軸はL/M（0〜1）、縦軸はGCの効率。0から増加して傾きが緩やかになる。 |
| `[0,1]` | 横軸はL/M（0〜1）、縦軸はGCの効率。途中まで水平で、その後は直線で減少し、1で0になる。 |
| `[0,2]` | 横軸はL/M（0〜1）、縦軸はGCの効率。初めから減少し、傾きの絶対値が次第に小さくなり、1で0になる。 |
| `[0,3]` | 横軸はL/M（0〜1）、縦軸はGCの効率。途中まで減少して0に達した後、1に向けて増加する。 |
| `[1,0]` | 横軸はL/M（0〜1）、縦軸はGCの効率。0から増加して傾きが緩やかになる。 |
| `[1,1]` | 横軸はL/M（0〜1）、縦軸はGCの効率。途中まで水平で、その後は直線で減少し、1で0になる。 |
| `[1,2]` | 横軸はL/M（0〜1）、縦軸はGCの効率。初めから減少し、傾きの絶対値が次第に小さくなり、1で0になる。 |
| `[1,3]` | 横軸はL/M（0〜1）、縦軸はGCの効率。途中まで減少して0に達した後、1に向けて増加する。 |
| `[2,0]` | 横軸はL/M（0〜1）、縦軸はGCの効率。0から増加して傾きが緩やかになる。 |
| `[2,1]` | 横軸はL/M（0〜1）、縦軸はGCの効率。途中まで水平で、その後は直線で減少し、1で0になる。 |
| `[2,2]` | 横軸はL/M（0〜1）、縦軸はGCの効率。初めから減少し、傾きの絶対値が次第に小さくなり、1で0になる。 |
| `[2,3]` | 横軸はL/M（0〜1）、縦軸はGCの効率。途中まで減少して0に達した後、1に向けて増加する。 |
| `[3,0]` | 横軸はL/M（0〜1）、縦軸はGCの効率。0から増加して傾きが緩やかになる。 |
| `[3,1]` | 横軸はL/M（0〜1）、縦軸はGCの効率。途中まで水平で、その後は直線で減少し、1で0になる。 |
| `[3,2]` | 横軸はL/M（0〜1）、縦軸はGCの効率。初めから減少し、傾きの絶対値が次第に小さくなり、1で0になる。 |
| `[3,3]` | 横軸はL/M（0〜1）、縦軸はGCの効率。途中まで減少して0に達した後、1に向けて増加する。 |

</details>

### legacy-2016-spring-pm-3-tables

<details><summary>許可する12組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0,0]` | 入園者表。列は入園者番号、券種、入園日、入園時刻。主キーは入園者番号。00025987、02、20150115、084517。以下省略。 券種表。列は券種、券種名、料金。主キーは券種。01、入園券、500。02、小学生パスポート、2000。以下省略。 |
| `[0,1]` | 入園者表。列は入園者番号、券種、入園日、入園時刻、退園時刻。主キーは入園者番号。00025987、02、20150115、084517、150851。以下省略。 券種表。列は券種、券種名、料金。主キーは券種。01、入園券、500。02、小学生パスポート、2000。以下省略。 利用表。列は入園者番号、利用時刻、アトラクション番号。主キーは入園者番号、利用時刻。00025987、091806、04。00025987、102611、05。00025992、102757、05。以下省略。 アトラクション表。列はアトラクション番号、アトラクション名、料金。主キーはアトラクション番号。01、ジェットコースター、500。以下省略。 |
| `[0,2]` | 会員表。列は会員番号、氏名、住所、生年月日、入会日。主キーは会員番号。000108、情報太郎、東京都文京区○○○、19920901、20160114。以下省略。 入園者表。列は入園者番号、会員番号、券種、入園日、入園時刻、退園時刻。主キーは入園者番号。00028707、000108、04、20160218、100555、182021。以下省略。 |
| `[1,0]` | 入園者表。列は入園者番号、券種、入園日、入園時刻。主キーは入園者番号。00025987、02、20140115、084517。以下省略。 券種表。列は券種、券種名、料金。主キーは券種。01、入園券、600。02、小学生パスポート、2300。以下省略。 |
| `[1,1]` | 入園者表。列は入園者番号、券種、入園日、入園時刻、退園時刻。主キーは入園者番号。00025987、02、20140115、084517、160851。以下省略。 券種表。列は券種、券種名、料金。主キーは券種。01、入園券、600。02、小学生パスポート、2300。以下省略。 利用表。列は入園者番号、利用時刻、アトラクション番号。主キーは入園者番号、利用時刻。00025987、091806、04。00025987、102611、05。00025992、102757、05。以下省略。 アトラクション表。列はアトラクション番号、アトラクション名、料金。主キーはアトラクション番号。01、ジェットコースター、600。以下省略。 |
| `[1,2]` | 会員表。列は会員番号、氏名、住所、生年月日、入会日。主キーは会員番号。000108、情報太郎、東京都文京区○○○、19920901、20150114。以下省略。 入園者表。列は入園者番号、会員番号、券種、入園日、入園時刻、退園時刻。主キーは入園者番号。00028707、000108、04、20150218、100555、182021。以下省略。 |
| `[2,0]` | 入園者表。列は入園者番号、券種、入園日、入園時刻。主キーは入園者番号。00025987、02、20130115、084517。以下省略。 券種表。列は券種、券種名、料金。主キーは券種。01、入園券、400。02、小学生パスポート、2200。以下省略。 |
| `[2,1]` | 入園者表。列は入園者番号、券種、入園日、入園時刻、退園時刻。主キーは入園者番号。00025987、02、20130115、084517、140851。以下省略。 券種表。列は券種、券種名、料金。主キーは券種。01、入園券、400。02、小学生パスポート、2200。以下省略。 利用表。列は入園者番号、利用時刻、アトラクション番号。主キーは入園者番号、利用時刻。00025987、091806、04。00025987、102611、05。00025992、102757、05。以下省略。 アトラクション表。列はアトラクション番号、アトラクション名、料金。主キーはアトラクション番号。01、ジェットコースター、450。以下省略。 |
| `[2,2]` | 会員表。列は会員番号、氏名、住所、生年月日、入会日。主キーは会員番号。000108、情報太郎、東京都文京区○○○、19920901、20140114。以下省略。 入園者表。列は入園者番号、会員番号、券種、入園日、入園時刻、退園時刻。主キーは入園者番号。00028707、000108、04、20140218、100555、182021。以下省略。 |
| `[3,0]` | 入園者表。列は入園者番号、券種、入園日、入園時刻。主キーは入園者番号。00025987、02、20120115、084517。以下省略。 券種表。列は券種、券種名、料金。主キーは券種。01、入園券、700。02、小学生パスポート、2500。以下省略。 |
| `[3,1]` | 入園者表。列は入園者番号、券種、入園日、入園時刻、退園時刻。主キーは入園者番号。00025987、02、20120115、084517、170851。以下省略。 券種表。列は券種、券種名、料金。主キーは券種。01、入園券、700。02、小学生パスポート、2500。以下省略。 利用表。列は入園者番号、利用時刻、アトラクション番号。主キーは入園者番号、利用時刻。00025987、091806、04。00025987、102611、05。00025992、102757、05。以下省略。 アトラクション表。列はアトラクション番号、アトラクション名、料金。主キーはアトラクション番号。01、ジェットコースター、750。以下省略。 |
| `[3,2]` | 会員表。列は会員番号、氏名、住所、生年月日、入会日。主キーは会員番号。000108、情報太郎、東京都文京区○○○、19920901、20130114。以下省略。 入園者表。列は入園者番号、会員番号、券種、入園日、入園時刻、退園時刻。主キーは入園者番号。00028707、000108、04、20130218、100555、182021。以下省略。 |

</details>

### legacy-2016-spring-pm-4-network

<details><summary>許可する4組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 基幹ネットワークにはルータGとルータHが接続する。192.168.1.0/24では，ブリッジCでつないだ2本のリンクのうち片方にホストE，他方にホストDとルータGが接続する。172.16.1.0/24にはルータHとホストFが接続する。 |
| `[1]` | 基幹ネットワークにはルータGとルータHが接続する。192.168.1.0/24では，ブリッジCでつないだ2本のリンクのうち片方にホストE，他方にホストDとルータGが接続する。172.16.1.0/24にはルータHとホストFが接続する。 |
| `[2]` | 基幹ネットワークにはルータGとルータHが接続する。172.16.1.0/24では，ブリッジCでつないだ2本のリンクのうち片方にホストE，他方にホストDとルータHが接続する。192.168.1.0/24にはルータGとホストFが接続する。 |
| `[3]` | 基幹ネットワークにはルータGとルータHが接続する。172.16.1.0/24では，ブリッジCでつないだ2本のリンクのうち片方にホストE，他方にホストDとルータHが接続する。192.168.1.0/24にはルータGとホストFが接続する。 |

</details>

### legacy-2016-spring-pm-5-store-record

<details><summary>許可する6組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左から店舗番号、店舗名、市区町村名、住所、電話番号、特売情報の順に並ぶ。 |
| `[1]` | 左から店舗番号、店舗名、市区町村名、住所、電話番号、特売情報の順に並ぶ。 |
| `[2]` | 左から店舗番号、店舗名、市区町村名、住所、電話番号、特売情報の順に並ぶ。 |
| `[3]` | 左から店舗番号、店舗名、市区町村名、住所、電話番号、特売情報の順に並ぶ。 |
| `[4]` | 左から店舗番号、店舗名、市区町村名、住所、電話番号、特売情報の順に並ぶ。 |
| `[5]` | 左から店舗番号、店舗名、市区町村名、住所、電話番号、特売情報の順に並ぶ。 |

</details>

### legacy-2016-spring-pm-5-favorite-record

<details><summary>許可する6組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左から店舗番号、お気に入り数の順に並ぶ。 |
| `[1]` | 左から店舗名、お気に入り数の順に並ぶ。 |
| `[2]` | 左から店舗名、市区町村名、お気に入り数の順に並ぶ。 |
| `[3]` | 左から店舗番号、お気に入り数の順に並ぶ。 |
| `[4]` | 左から店舗名、お気に入り数の順に並ぶ。 |
| `[5]` | 左から店舗名、市区町村名、お気に入り数の順に並ぶ。 |

</details>

### legacy-2016-spring-pm-5-web-sequence

<details><summary>許可する6組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザからWebサーバに要求、Webサーバの応答を受け利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザがWebサーバに要求し、Webサーバがファイルサーバに要求、応答を受け画面生成し、ブラウザを経由して利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからWebサーバへ要求、Webサーバからファイルサーバにお気に入り数に1加えることを要求、応答を受け画面生成し、ブラウザ経由で利用者へ応答。 |
| `[1]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザからWebサーバに要求、Webサーバの応答を受け利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザがWebサーバに要求し、Webサーバがファイルサーバに要求、応答を受け画面生成し、ブラウザを経由して利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからWebサーバへ要求、Webサーバからファイルサーバにお気に入り数に1加えることを要求、応答を受け画面生成し、ブラウザ経由で利用者へ応答。 |
| `[2]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザからWebサーバに要求、Webサーバの応答を受け利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザがWebサーバに要求し、Webサーバがファイルサーバに要求、応答を受け画面生成し、ブラウザを経由して利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからWebサーバへ要求、Webサーバからファイルサーバにお気に入り数に1加えることを要求、応答を受け画面生成し、ブラウザ経由で利用者へ応答。 |
| `[3]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザからWebサーバに要求、Webサーバの応答を受け利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザがWebサーバに要求し、Webサーバがファイルサーバに要求、応答を受け画面生成し、ブラウザを経由して利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからWebサーバへ要求、Webサーバからファイルサーバにお気に入り数に1加えることを要求し，最新の特売情報も要求、応答を受け画面生成し、ブラウザ経由で利用者へ応答。 |
| `[4]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザからWebサーバに要求、Webサーバの応答を受け利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザがWebサーバに要求し、Webサーバがファイルサーバに要求、応答を受け画面生成し、ブラウザを経由して利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからWebサーバへ要求、Webサーバからファイルサーバにお気に入り数に1加えることを要求し，最新の特売情報も要求、応答を受け画面生成し、ブラウザ経由で利用者へ応答。 |
| `[5]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザからWebサーバに要求、Webサーバの応答を受け利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザがWebサーバに要求し、Webサーバがファイルサーバに要求、応答を受け画面生成し、ブラウザを経由して利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからWebサーバへ要求、Webサーバからファイルサーバにお気に入り数に1加えることを要求し，最新の特売情報も要求、応答を受け画面生成し、ブラウザ経由で利用者へ応答。 |

</details>

### legacy-2016-spring-pm-5-app-sequence

<details><summary>許可する6組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザとWebサーバが要求・応答、次にブラウザとファイルサーバが要求・応答、利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザが画面を生成し、利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからファイルサーバへお気に入り数に1加えることを要求、ブラウザが応答を受け画面を生成し、利用者へ応答。 |
| `[1]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザとWebサーバが要求・応答、次にブラウザとファイルサーバが要求・応答、利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザが画面を生成し、利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからファイルサーバへお気に入り数に1加えることを要求、ブラウザが応答を受け画面を生成し、利用者へ応答。 |
| `[2]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザとWebサーバが要求・応答、次にブラウザとファイルサーバが要求・応答、利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザが画面を生成し、利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからファイルサーバへお気に入り数に1加えることを要求、ブラウザが応答を受け画面を生成し、利用者へ応答。 |
| `[3]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザとWebサーバが要求・応答、次にブラウザとファイルサーバが要求・応答、利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザが画面を生成し、利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからファイルサーバへお気に入り数に1加えることを要求し，最新の特売情報も要求、ブラウザが応答を受け画面を生成し、利用者へ応答。 |
| `[4]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザとWebサーバが要求・応答、次にブラウザとファイルサーバが要求・応答、利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザが画面を生成し、利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからファイルサーバへお気に入り数に1加えることを要求し，最新の特売情報も要求、ブラウザが応答を受け画面を生成し、利用者へ応答。 |
| `[5]` | 左から利用者・ブラウザ・Webサーバ・ファイルサーバ。処理A：利用者がURLを指定、ブラウザとWebサーバが要求・応答、次にブラウザとファイルサーバが要求・応答、利用者へ応答。処理B：利用者が市区町村名を入力し検索実行ボタンを押す。ブラウザが画面を生成し、利用者へ応答。処理C：利用者がお気に入りボタンを押す。ブラウザからファイルサーバへお気に入り数に1加えることを要求し，最新の特売情報も要求、ブラウザが応答を受け画面を生成し、利用者へ応答。 |

</details>

### legacy-2016-spring-pm-7-purchases

<details><summary>許可する6組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。 |
| `[1]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。 |
| `[2]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。 |
| `[3]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。 |
| `[4]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。 |
| `[5]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。 |

</details>

### legacy-2016-spring-pm-7-repeat-purchases

<details><summary>許可する6組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。2回目以降の延べ購入回数10回を網掛けで示す。 |
| `[1]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。2回目以降の延べ購入回数10回を網掛けで示す。 |
| `[2]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。2回目以降の延べ購入回数10回を網掛けで示す。 |
| `[3]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。2回目以降の延べ購入回数10回を網掛けで示す。 |
| `[4]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。2回目以降の延べ購入回数10回を網掛けで示す。 |
| `[5]` | 購入回数は1回目から5回目までの縦軸で，横方向に6人を並べる。左から5，5，3，1，1，1回の購入を丸印で表す。購入人数は6人，延べ購入回数は16回。2回目以降の延べ購入回数10回を網掛けで示す。 |

</details>

### legacy-2016-spring-pm-7-bubble-chart

<details><summary>許可する6組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 横軸は購入人数（人）0〜6,000，縦軸はリピート率（%）0〜100。バブルの大きさは売上金額。左からおよその座標（人，%）は［b］（1,312，62.1）、（1,321，23.6）、（1,689，37.7）、（3,100，22.8）、（4,732，80.4）、［a］（4,782，8.3）。 |
| `[1]` | 横軸は購入人数（人）0〜6,000，縦軸はリピート率（%）0〜100。バブルの大きさは売上金額。左からおよその座標（人，%）は［b］（1,312，62.1）、（1,321，23.6）、（1,689，37.7）、（3,100，22.8）、（4,732，80.4）、［a］（4,782，8.3）。 |
| `[2]` | 横軸は購入人数（人）0〜6,000，縦軸はリピート率（%）0〜100。バブルの大きさは売上金額。左からおよその座標（人，%）は［b］（1,312，62.1）、（1,321，23.6）、（1,689，37.7）、（3,100，22.8）、（4,732，80.4）、［a］（4,782，8.3）。 |
| `[3]` | 横軸は購入人数（人）0〜6,000，縦軸はリピート率（%）0〜100。バブルの大きさは売上金額。左からおよその座標（人，%）は［b］（1,312，62.1）、（1,321，23.6）、（1,689，37.7）、（3,100，22.8）、（4,732，80.4）、［a］（4,782，8.3）。 |
| `[4]` | 横軸は購入人数（人）0〜6,000，縦軸はリピート率（%）0〜100。バブルの大きさは売上金額。左からおよその座標（人，%）は［b］（1,312，62.1）、（1,321，23.6）、（1,689，37.7）、（3,100，22.8）、（4,732，80.4）、［a］（4,782，8.3）。 |
| `[5]` | 横軸は購入人数（人）0〜6,000，縦軸はリピート率（%）0〜100。バブルの大きさは売上金額。左からおよその座標（人，%）は［b］（1,312，62.1）、（1,321，23.6）、（1,689，37.7）、（3,100，22.8）、（4,732，80.4）、［a］（4,782，8.3）。 |

</details>

### legacy-2016-spring-pm-8-memo-screen

<details><summary>許可する5組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 簡易メモ帳の画面。表示順はAoki、Imai、Uno、Endo。下部に追加，削除，変更，移動のボタン。 |
| `[1]` | 簡易メモ帳の画面。表示順はKato、Inoue、Ito、Sato。下部に追加，削除，変更，移動のボタン。 |
| `[2]` | 簡易メモ帳の画面。表示順はHara、Ueda、Mori、Ito。下部に追加，削除，変更，移動のボタン。 |
| `[3]` | 簡易メモ帳の画面。表示順はArai、Ono、Kuro、Endo。下部に追加，削除，変更，移動のボタン。 |
| `[4]` | 簡易メモ帳の画面。表示順はA、Noda、Riku、Jin。下部に追加，削除，変更，移動のボタン。 |

</details>

### legacy-2016-spring-pm-8-memo-length-example

<details><summary>許可する5組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 左から下線付きの6，H，e，l，l，o，!をそれぞれ1バイトに格納する。 |
| `[1]` | 左から下線付きの6，H，e，l，l，o，!をそれぞれ1バイトに格納する。 |
| `[2]` | 左から下線付きの6，H，e，l，l，o，!をそれぞれ1バイトに格納する。 |
| `[3]` | 左から下線付きの6，H，e，l，l，o，!をそれぞれ1バイトに格納する。 |
| `[4]` | 左から下線付きの6，H，e，l，l，o，!をそれぞれ1バイトに格納する。 |

</details>

### legacy-2016-spring-pm-8-memo-state-0

<details><summary>許可する5組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | MemoMax：5，DataMax：25。MemoCnt：0，DataLen：0。Memo[]の要素0〜4：空き、空き、空き、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き。 |
| `[1]` | MemoMax：5，DataMax：25。MemoCnt：0，DataLen：0。Memo[]の要素0〜4：空き、空き、空き、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き。 |
| `[2]` | MemoMax：5，DataMax：25。MemoCnt：0，DataLen：0。Memo[]の要素0〜4：空き、空き、空き、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き。 |
| `[3]` | MemoMax：5，DataMax：25。MemoCnt：0，DataLen：0。Memo[]の要素0〜4：空き、空き、空き、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き。 |
| `[4]` | MemoMax：5，DataMax：25。MemoCnt：0，DataLen：0。Memo[]の要素0〜4：空き、空き、空き、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き、空き。 |

</details>

### legacy-2016-spring-pm-8-memo-state-1

<details><summary>許可する5組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | MemoMax：5，DataMax：25。MemoCnt：4，DataLen：19。Memo[]の要素0〜4：0、5、10、14、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）、A、o、k、i、4（下線付き文字列長）、I、m、a、i、3（下線付き文字列長）、U、n、o、4（下線付き文字列長）、E、n、d、o、空き、空き、空き、空き、空き、空き。 |
| `[1]` | MemoMax：5，DataMax：25。MemoCnt：4，DataLen：20。Memo[]の要素0〜4：0、5、11、15、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）、K、a、t、o、5（下線付き文字列長）、I、n、o、u、e、3（下線付き文字列長）、I、t、o、4（下線付き文字列長）、S、a、t、o、空き、空き、空き、空き、空き。 |
| `[2]` | MemoMax：5，DataMax：25。MemoCnt：4，DataLen：19。Memo[]の要素0〜4：0、5、10、15、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）、H、a、r、a、4（下線付き文字列長）、U、e、d、a、4（下線付き文字列長）、M、o、r、i、3（下線付き文字列長）、I、t、o、空き、空き、空き、空き、空き、空き。 |
| `[3]` | MemoMax：5，DataMax：25。MemoCnt：4，DataLen：19。Memo[]の要素0〜4：0、5、9、14、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）、A、r、a、i、3（下線付き文字列長）、O、n、o、4（下線付き文字列長）、K、u、r、o、4（下線付き文字列長）、E、n、d、o、空き、空き、空き、空き、空き、空き。 |
| `[4]` | MemoMax：5，DataMax：25。MemoCnt：4，DataLen：16。Memo[]の要素0〜4：0、2、7、12、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：1（下線付き文字列長）、A、4（下線付き文字列長）、N、o、d、a、4（下線付き文字列長）、R、i、k、u、3（下線付き文字列長）、J、i、n、空き、空き、空き、空き、空き、空き、空き、空き、空き。 |

</details>

### legacy-2016-spring-pm-8-memo-state-2

<details><summary>許可する5組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：19。Memo[]の要素0〜4：5、10、14、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）（斜線、参照なし）、A（斜線、参照なし）、o（斜線、参照なし）、k（斜線、参照なし）、i（斜線、参照なし）、4（下線付き文字列長）、I、m、a、i、3（下線付き文字列長）、U、n、o、4（下線付き文字列長）、E、n、d、o、空き、空き、空き、空き、空き、空き。 |
| `[1]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：20。Memo[]の要素0〜4：5、11、15、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）（斜線、参照なし）、K（斜線、参照なし）、a（斜線、参照なし）、t（斜線、参照なし）、o（斜線、参照なし）、5（下線付き文字列長）、I、n、o、u、e、3（下線付き文字列長）、I、t、o、4（下線付き文字列長）、S、a、t、o、空き、空き、空き、空き、空き。 |
| `[2]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：19。Memo[]の要素0〜4：0、10、15、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）、H、a、r、a、4（下線付き文字列長）（斜線、参照なし）、U（斜線、参照なし）、e（斜線、参照なし）、d（斜線、参照なし）、a（斜線、参照なし）、4（下線付き文字列長）、M、o、r、i、3（下線付き文字列長）、I、t、o、空き、空き、空き、空き、空き、空き。 |
| `[3]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：19。Memo[]の要素0〜4：0、5、14、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）、A、r、a、i、3（下線付き文字列長）、O、n、o、4（下線付き文字列長）（斜線、参照なし）、K（斜線、参照なし）、u（斜線、参照なし）、r（斜線、参照なし）、o（斜線、参照なし）、4（下線付き文字列長）、E、n、d、o、空き、空き、空き、空き、空き、空き。 |
| `[4]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：16。Memo[]の要素0〜4：2、7、12、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：1（下線付き文字列長）（斜線、参照なし）、A（斜線、参照なし）、4（下線付き文字列長）、N、o、d、a、4（下線付き文字列長）、R、i、k、u、3（下線付き文字列長）、J、i、n、空き、空き、空き、空き、空き、空き、空き、空き、空き。 |

</details>

### legacy-2016-spring-pm-8-memo-state-3

<details><summary>許可する5組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：23。Memo[]の要素0〜4：5、10、19、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）（斜線、参照なし）、A（斜線、参照なし）、o（斜線、参照なし）、k（斜線、参照なし）、i（斜線、参照なし）、4（下線付き文字列長）、I、m、a、i、3（下線付き文字列長）、U、n、o、4（下線付き文字列長）（斜線、参照なし）、E（斜線、参照なし）、n（斜線、参照なし）、d（斜線、参照なし）、o（斜線、参照なし）、3（下線付き文字列長）、A、b、e、空き、空き。 |
| `[1]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：24。Memo[]の要素0〜4：5、11、20、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）（斜線、参照なし）、K（斜線、参照なし）、a（斜線、参照なし）、t（斜線、参照なし）、o（斜線、参照なし）、5（下線付き文字列長）、I、n、o、u、e、3（下線付き文字列長）、I、t、o、4（下線付き文字列長）（斜線、参照なし）、S（斜線、参照なし）、a（斜線、参照なし）、t（斜線、参照なし）、o（斜線、参照なし）、3（下線付き文字列長）、O、t、a、空き。 |
| `[2]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：25。Memo[]の要素0〜4：0、19、15、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）、H、a、r、a、4（下線付き文字列長）（斜線、参照なし）、U（斜線、参照なし）、e（斜線、参照なし）、d（斜線、参照なし）、a（斜線、参照なし）、4（下線付き文字列長）（斜線、参照なし）、M（斜線、参照なし）、o（斜線、参照なし）、r（斜線、参照なし）、i（斜線、参照なし）、3（下線付き文字列長）、I、t、o、5（下線付き文字列長）、M、i、u、r、a。 |
| `[3]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：22。Memo[]の要素0〜4：19、5、14、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）（斜線、参照なし）、A（斜線、参照なし）、r（斜線、参照なし）、a（斜線、参照なし）、i（斜線、参照なし）、3（下線付き文字列長）、O、n、o、4（下線付き文字列長）（斜線、参照なし）、K（斜線、参照なし）、u（斜線、参照なし）、r（斜線、参照なし）、o（斜線、参照なし）、4（下線付き文字列長）、E、n、d、o、2（下線付き文字列長）、E、i、空き、空き、空き。 |
| `[4]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：17。Memo[]の要素0〜4：2、16、12、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：1（下線付き文字列長）（斜線、参照なし）、A（斜線、参照なし）、4（下線付き文字列長）、N、o、d、a、4（下線付き文字列長）（斜線、参照なし）、R（斜線、参照なし）、i（斜線、参照なし）、k（斜線、参照なし）、u（斜線、参照なし）、3（下線付き文字列長）、J、i、n、0（下線付き文字列長）、空き、空き、空き、空き、空き、空き、空き、空き。 |

</details>

### legacy-2016-spring-pm-8-memo-state-4

<details><summary>許可する5組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：23。Memo[]の要素0〜4：19、5、10、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）（斜線、参照なし）、A（斜線、参照なし）、o（斜線、参照なし）、k（斜線、参照なし）、i（斜線、参照なし）、4（下線付き文字列長）、I、m、a、i、3（下線付き文字列長）、U、n、o、4（下線付き文字列長）（斜線、参照なし）、E（斜線、参照なし）、n（斜線、参照なし）、d（斜線、参照なし）、o（斜線、参照なし）、3（下線付き文字列長）、A、b、e、空き、空き。 |
| `[1]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：24。Memo[]の要素0〜4：20、5、11、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）（斜線、参照なし）、K（斜線、参照なし）、a（斜線、参照なし）、t（斜線、参照なし）、o（斜線、参照なし）、5（下線付き文字列長）、I、n、o、u、e、3（下線付き文字列長）、I、t、o、4（下線付き文字列長）（斜線、参照なし）、S（斜線、参照なし）、a（斜線、参照なし）、t（斜線、参照なし）、o（斜線、参照なし）、3（下線付き文字列長）、O、t、a、空き。 |
| `[2]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：25。Memo[]の要素0〜4：19、15、0、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）、H、a、r、a、4（下線付き文字列長）（斜線、参照なし）、U（斜線、参照なし）、e（斜線、参照なし）、d（斜線、参照なし）、a（斜線、参照なし）、4（下線付き文字列長）（斜線、参照なし）、M（斜線、参照なし）、o（斜線、参照なし）、r（斜線、参照なし）、i（斜線、参照なし）、3（下線付き文字列長）、I、t、o、5（下線付き文字列長）、M、i、u、r、a。 |
| `[3]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：22。Memo[]の要素0〜4：19、14、5、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：4（下線付き文字列長）（斜線、参照なし）、A（斜線、参照なし）、r（斜線、参照なし）、a（斜線、参照なし）、i（斜線、参照なし）、3（下線付き文字列長）、O、n、o、4（下線付き文字列長）（斜線、参照なし）、K（斜線、参照なし）、u（斜線、参照なし）、r（斜線、参照なし）、o（斜線、参照なし）、4（下線付き文字列長）、E、n、d、o、2（下線付き文字列長）、E、i、空き、空き、空き。 |
| `[4]` | MemoMax：5，DataMax：25。MemoCnt：3，DataLen：17。Memo[]の要素0〜4：16、2、12、空き、空き。各値の矢印はData[]の同じ要素番号に向かう。Data[]の要素0〜24：1（下線付き文字列長）（斜線、参照なし）、A（斜線、参照なし）、4（下線付き文字列長）、N、o、d、a、4（下線付き文字列長）（斜線、参照なし）、R（斜線、参照なし）、i（斜線、参照なし）、k（斜線、参照なし）、u（斜線、参照なし）、3（下線付き文字列長）、J、i、n、0（下線付き文字列長）、空き、空き、空き、空き、空き、空き、空き、空き。 |

</details>

### legacy-2016-spring-pm-9-depth-examples

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | □は空白文字。深さ0：&#42;。深さ1：&#42;&#42;／&#42;□。深さ2：&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□。深さ3：&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□ |
| `[1]` | □は空白文字。深さ0：&#42;。深さ1：&#42;&#42;／&#42;□。深さ2：&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□。深さ3：&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□ |
| `[2]` | □は空白文字。深さ0：&#42;。深さ1：&#42;&#42;／&#42;□。深さ2：&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□。深さ3：&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□ |
| `[3]` | □は空白文字。深さ0：&#42;。深さ1：&#42;&#42;／&#42;□。深さ2：&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□。深さ3：&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□ |
| `[4]` | □は空白文字。深さ0：&#42;。深さ1：&#42;&#42;／&#42;□。深さ2：&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□。深さ3：&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□ |
| `[5]` | □は空白文字。深さ0：&#42;。深さ1：&#42;&#42;／&#42;□。深さ2：&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□。深さ3：&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□ |
| `[6]` | □は空白文字。深さ0：&#42;。深さ1：&#42;&#42;／&#42;□。深さ2：&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□。深さ3：&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□ |
| `[7]` | □は空白文字。深さ0：&#42;。深さ1：&#42;&#42;／&#42;□。深さ2：&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□。深さ3：&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□ |

</details>

### legacy-2016-spring-pm-9-replacement-rule

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 生成パターン例は上段&#42;&#42;、下段&#42;□。深さd−1の&#42;はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。 |
| `[1]` | 生成パターン例は上段&#42;&#42;、下段&#42;□。深さd−1の&#42;はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。 |
| `[2]` | 生成パターン例は上段&#42;&#42;、下段&#42;□。深さd−1の&#42;はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。 |
| `[3]` | 生成パターン例は上段&#42;&#42;、下段&#42;□。深さd−1の&#42;はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。 |
| `[4]` | 生成パターン例は上段&#42;&#42;、下段&#42;□。深さd−1の&#42;はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。 |
| `[5]` | 生成パターン例は上段&#42;&#42;、下段&#42;□。深さd−1の&#42;はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。 |
| `[6]` | 生成パターン例は上段&#42;&#42;、下段&#42;□。深さd−1の&#42;はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。 |
| `[7]` | 生成パターン例は上段&#42;&#42;、下段&#42;□。深さd−1の&#42;はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。 |

</details>

### legacy-2016-spring-pm-9-substitution-choice

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | □は空白文字。深さ2は&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□、斜線は上から3行目、左から2列目の1マス。深さ3は&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□。①は上から3行目・左から2列目を左上とする1行1列。②は上から5行目・左から1列目を左上とする2行2列。③は上から5行目・左から3列目を左上とする2行2列。④は上から7行目・左から2列目を左上とする1行1列。 |
| `[1]` | □は空白文字。深さ2は&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□、斜線は上から3行目、左から2列目の1マス。深さ3は&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□。①は上から3行目・左から2列目を左上とする1行1列。②は上から5行目・左から1列目を左上とする2行2列。③は上から5行目・左から3列目を左上とする2行2列。④は上から7行目・左から2列目を左上とする1行1列。 |
| `[2]` | □は空白文字。深さ2は&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□、斜線は上から3行目、左から2列目の1マス。深さ3は&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□。①は上から3行目・左から2列目を左上とする1行1列。②は上から5行目・左から1列目を左上とする2行2列。③は上から5行目・左から3列目を左上とする2行2列。④は上から7行目・左から2列目を左上とする1行1列。 |
| `[3]` | □は空白文字。深さ2は&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□、斜線は上から3行目、左から2列目の1マス。深さ3は&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□。①は上から3行目・左から2列目を左上とする1行1列。②は上から5行目・左から1列目を左上とする2行2列。③は上から5行目・左から3列目を左上とする2行2列。④は上から7行目・左から2列目を左上とする1行1列。 |
| `[4]` | □は空白文字。深さ2は&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□、斜線は上から3行目、左から1列目の1マス。深さ3は&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□。①は上から3行目・左から2列目を左上とする1行1列。②は上から5行目・左から1列目を左上とする2行2列。③は上から5行目・左から3列目を左上とする2行2列。④は上から7行目・左から2列目を左上とする1行1列。 |
| `[5]` | □は空白文字。深さ2は&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□、斜線は上から3行目、左から1列目の1マス。深さ3は&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□。①は上から3行目・左から2列目を左上とする1行1列。②は上から5行目・左から1列目を左上とする2行2列。③は上から5行目・左から3列目を左上とする2行2列。④は上から7行目・左から2列目を左上とする1行1列。 |
| `[6]` | □は空白文字。深さ2は&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□、斜線は上から3行目、左から1列目の1マス。深さ3は&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□。①は上から3行目・左から2列目を左上とする1行1列。②は上から5行目・左から1列目を左上とする2行2列。③は上から5行目・左から3列目を左上とする2行2列。④は上から7行目・左から2列目を左上とする1行1列。 |
| `[7]` | □は空白文字。深さ2は&#42;&#42;&#42;&#42;／&#42;□&#42;□／&#42;&#42;□□／&#42;□□□、斜線は上から3行目、左から1列目の1マス。深さ3は&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;□&#42;□&#42;□／&#42;&#42;□□&#42;&#42;□□／&#42;□□□&#42;□□□／&#42;&#42;&#42;&#42;□□□□／&#42;□&#42;□□□□□／&#42;&#42;□□□□□□／&#42;□□□□□□□。①は上から3行目・左から2列目を左上とする1行1列。②は上から5行目・左から1列目を左上とする2行2列。③は上から5行目・左から3列目を左上とする2行2列。④は上から7行目・左から2列目を左上とする1行1列。 |

</details>

### legacy-2016-spring-pm-9-new-pattern-result

<details><summary>許可する8組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 深さ3、8行27列。□は空白文字。&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42; |
| `[1]` | 深さ3、8行27列。□は空白文字。□□□□□□□□□□□□□&#42;□□□□□□□□□□□□□／□□□□□□□□□□□□&#42;□&#42;□□□□□□□□□□□□／□□□□□□□□□□&#42;□□□□□&#42;□□□□□□□□□□／□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□／□□□□&#42;□□□□□□□□□□□□□□□□□&#42;□□□□／□□□&#42;□&#42;□□□□□□□□□□□□□□□&#42;□&#42;□□□／□&#42;□□□□□&#42;□□□□□□□□□□□&#42;□□□□□&#42;□／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42; |
| `[2]` | 深さ3、27行27列。□は空白文字。□□□□□□□□□□□□□&#42;□□□□□□□□□□□□□／□□□□□□□□□□□□&#42;&#42;&#42;□□□□□□□□□□□□／□□□□□□□□□□□□&#42;□&#42;□□□□□□□□□□□□／□□□□□□□□□□&#42;□□&#42;□□&#42;□□□□□□□□□□／□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□／□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□／□□□□□□□□□□&#42;□□□□□&#42;□□□□□□□□□□／□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□／□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□／□□□□&#42;□□□□□□□□&#42;□□□□□□□□&#42;□□□□／□□□&#42;&#42;&#42;□□□□□□&#42;&#42;&#42;□□□□□□&#42;&#42;&#42;□□□／□□□&#42;□&#42;□□□□□□&#42;□&#42;□□□□□□&#42;□&#42;□□□／□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;／□&#42;□□□□□&#42;□□&#42;□□□□□&#42;□□&#42;□□□□□&#42;□／&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／□□□□&#42;□□□□□□□□□□□□□□□□□&#42;□□□□／□□□&#42;&#42;&#42;□□□□□□□□□□□□□□□&#42;&#42;&#42;□□□／□□□&#42;□&#42;□□□□□□□□□□□□□□□&#42;□&#42;□□□／□&#42;□□&#42;□□&#42;□□□□□□□□□□□&#42;□□&#42;□□&#42;□／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／□&#42;□□□□□&#42;□□□□□□□□□□□&#42;□□□□□&#42;□／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42; |
| `[3]` | 深さ3、27行27列。□は空白文字。&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42; |
| `[4]` | 深さ3、8行27列。□は空白文字。&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42; |
| `[5]` | 深さ3、8行27列。□は空白文字。□□□□□□□□□□□□□&#42;□□□□□□□□□□□□□／□□□□□□□□□□□□&#42;□&#42;□□□□□□□□□□□□／□□□□□□□□□□&#42;□□□□□&#42;□□□□□□□□□□／□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□／□□□□&#42;□□□□□□□□□□□□□□□□□&#42;□□□□／□□□&#42;□&#42;□□□□□□□□□□□□□□□&#42;□&#42;□□□／□&#42;□□□□□&#42;□□□□□□□□□□□&#42;□□□□□&#42;□／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42; |
| `[6]` | 深さ3、27行27列。□は空白文字。□□□□□□□□□□□□□&#42;□□□□□□□□□□□□□／□□□□□□□□□□□□&#42;&#42;&#42;□□□□□□□□□□□□／□□□□□□□□□□□□&#42;□&#42;□□□□□□□□□□□□／□□□□□□□□□□&#42;□□&#42;□□&#42;□□□□□□□□□□／□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□／□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□／□□□□□□□□□□&#42;□□□□□&#42;□□□□□□□□□□／□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□／□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□／□□□□&#42;□□□□□□□□&#42;□□□□□□□□&#42;□□□□／□□□&#42;&#42;&#42;□□□□□□&#42;&#42;&#42;□□□□□□&#42;&#42;&#42;□□□／□□□&#42;□&#42;□□□□□□&#42;□&#42;□□□□□□&#42;□&#42;□□□／□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□□&#42;□／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;／□&#42;□□□□□&#42;□□&#42;□□□□□&#42;□□&#42;□□□□□&#42;□／&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／□□□□&#42;□□□□□□□□□□□□□□□□□&#42;□□□□／□□□&#42;&#42;&#42;□□□□□□□□□□□□□□□&#42;&#42;&#42;□□□／□□□&#42;□&#42;□□□□□□□□□□□□□□□&#42;□&#42;□□□／□&#42;□□&#42;□□&#42;□□□□□□□□□□□&#42;□□&#42;□□&#42;□／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／□&#42;□□□□□&#42;□□□□□□□□□□□&#42;□□□□□&#42;□／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42; |
| `[7]` | 深さ3、27行27列。□は空白文字。&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;□&#42;&#42;□&#42;&#42;□&#42;□□□□□□□□□&#42;□&#42;&#42;□&#42;&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;&#42;&#42;□□□&#42;&#42;&#42;□□□□□□□□□&#42;&#42;&#42;□□□&#42;&#42;&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42;／&#42;□&#42;□□□&#42;□&#42;□□□□□□□□□&#42;□&#42;□□□&#42;□&#42; |

</details>

### legacy-2016-spring-pm-10-change-table

<details><summary>許可する12組と描画条件</summary>

| values（順序付き） | 対応する描画条件 |
| --- | --- |
| `[0]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 7 THEN         SUBTRACT 7 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 7         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[1]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 7 THEN         SUBTRACT 7 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 7         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[2]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 7 THEN         SUBTRACT 7 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 7         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[3]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 5 THEN         SUBTRACT 5 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 5         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[4]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 5 THEN         SUBTRACT 5 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 5         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[5]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 5 THEN         SUBTRACT 5 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 5         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[6]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 6 THEN         SUBTRACT 6 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 6         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[7]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 6 THEN         SUBTRACT 6 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 6         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[8]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 6 THEN         SUBTRACT 6 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 6         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[9]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 8 THEN         SUBTRACT 8 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 8         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[10]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 8 THEN         SUBTRACT 8 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 8         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |
| `[11]` | 処置｜変更内容 行番号10と11の間に追加｜01 MONTH-TABLE.    02 MONTH-VAL  PIC X(24) VALUE "312831303130313130313031".    02 MONTH-ELM  REDEFINES MONTH-VAL  OCCURS 12 PIC 9(2). 77 URU-SUPPLY  PIC 9(1). 77 QUOTIENT    PIC 9(3).  行番号18と19の間に追加｜   02 PRM-CANCEL.       03 CAN-YYYY  PIC 9(4).       03 CAN-MM    PIC 9(2).       03 CAN-DD    PIC 9(2).  ［d］に追加｜IF PRM-RSLT = ZERO THEN     PERFORM SET-CANCEL ELSE     MOVE ZERO TO PRM-CANCEL END-IF.  行番号52の後ろに追加｜SET-CANCEL.     MOVE PRM-DATE TO PRM-CANCEL.     IF CAN-DD &gt; 8 THEN         SUBTRACT 8 FROM CAN-DD     ELSE         IF CAN-MM = 1 THEN             SUBTRACT 1 FROM CAN-YYYY             MOVE 12 TO CAN-MM             COMPUTE CAN-DD = 31 + CAN-DD - 8         ELSE             SUBTRACT 1 FROM CAN-MM             [e]             IF CAN-MM = 2 THEN                 DIVIDE CAN-YYYY BY 4                        GIVING QUOTIENT REMAINDER URU-SUPPLY                 IF [f] THEN                     ADD 1 TO CAN-DD                 END-IF             END-IF         END-IF     END-IF. |

</details>

## 再生成と検証

一覧の更新はnpm run doc:generation、鮮度確認はnpm run doc:validateで行う。生成器の変更時には正答・誤答の独立検算と原資料の形式照合を行い、改訂とモジュール版を更新する。保存済みセッションの内容を新しい生成器で作り直さない。詳しい[生成仕様](/diagram-generation)、[出典表示](/attribution)、[検証記録](/verification)を参照する。
