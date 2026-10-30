# 全問題の生成対応

<!-- scripts/generation-reference.ts が生成する。手編集しない。 -->

## 対象と対応条件

本システムでは、収録した公式公開問題・大問267件すべてに、原問題とは別の改変済み基準問題と登録生成器を一対一で用意する。科目A140問、科目B49問、旧午後78大問をそれぞれの問題集に対応したランダムミックスの候補にする。2025年度科目B問6は第三者のJIS文言の利用条件が未確認であり、原問題・生成版とも対象外とする。非公開問題を含めた全FE問題という意味ではない。

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
| [科目A問9 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-9@3.4.0 | 認証要素の組合せ。異なる認証要素の組：0〜8（0） | 文章／4択 |
| [科目A問10 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-10@3.2.0 | セキュリティの専門組織。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問11 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-11@3.5.0 | 開発上の問題への対策。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問12 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=9) | generator-source-2026-a-12@3.5.0 | 進捗の可視化。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問13 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=9) | generator-source-2026-a-13@3.2.0 | 期間短縮と人材支援。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問14 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=10) | generator-service-gain@2.2.0 | サービス可用性の改善。年間提供時間（時間）：500〜10000（5000）、移行前停止（時間）：10〜200（100）、移行後停止（分）：1〜600（30） | 文章・箇条書き／4択 |
| [科目A問15 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=10) | generator-source-2026-a-15@3.4.0 | システム監査の役割分担。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問16 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=11) | generator-source-2026-a-16@3.2.0 | 小売業のIT活用。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問17 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=11) | generator-retention@2.2.0 | 会員のリテンション率。A前月会員：100〜5000（1000）、A新規会員：0〜2000（500）、A継続会員：1〜5000（300）、B前月会員：100〜5000（1000）、B新規会員：0〜2000（200）、B継続会員：1〜5000（600）、C前月会員：100〜5000（1500）、C新規会員：0〜2000（500）、C継続会員：1〜5000（600）、D前月会員：100〜5000（1500）、D新規会員：0〜2000（1000）、D継続会員：1〜5000（800） | 文章・表／4択 |
| [科目A問18 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=12) | generator-source-2026-a-18@3.4.0 | 学習を伴うAIの事例。固定処理の事例：0〜3（0） | 文章／4択 |
| [科目A問19 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=12) | generator-source-2026-a-19@3.2.0 | 会議とコミュニケーション。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問20 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=13) | generator-source-2026-a-20@3.2.0 | 著作権と著作者人格権。利用する行為と契約条件：0〜3（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=4) | generator-source-2026-b-1@3.6.0 | 配列の右への回転。右へ移動する要素数：1〜4（1）、配列の要素数：6〜12（9） | 文章・コード／4択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=5) | generator-complement@2.3.0 | 8ビットの2の補数。8ビットの入力x：1〜255（42）、ビット幅：4〜8（8） | 文章・コード／6択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=6) | generator-recurrence@2.3.0 | 漸化式を追跡する。引数n：3〜14（5）、2項前の係数：2〜4（2） | 文章・コード／8択 |
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=8) | generator-source-2026-b-4@3.4.0 | 配列による単方向リスト。次ポインタの基準差：0〜3（0）、格納値の倍率：1〜5（1） | 文章・図・コード・表／4択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=10) | generator-source-2026-b-5@3.6.0 | One-Hot表現への変換。走査添字の基準差：0〜3（0）、色の並び：0〜3（0） | 文章・図・コード・表／4択 |
| [科目B問6 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=12) | generator-security-log@2.3.0 | ログ管理ルールと運用の照合。運用担当者数：0〜4（1）、一般利用者のログアクセス：0〜1（1）、日時が日本標準時：0〜1（0）、過去ログの上書き：0〜1（1） | 文章・見出し・箇条書き・表／10択 |

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
| [科目A問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-8@3.2.0 | Web通信の機能。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問9 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-9@3.2.0 | 暗号と鍵のリスク。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問10 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-10@3.2.0 | セキュリティの技術と製品。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-11@3.2.0 | E-Rモデルの構成要素。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-12@3.2.0 | オブジェクト指向の機能。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問13 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-13@3.4.0 | スクラムの役割。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=8) | generator-source-2025-a-14@3.3.0 | ダミーを含むプロジェクトの所要日数。作業Aの日数：1〜20（3）、作業Bの日数：1〜20（6）、作業Cの日数：1〜20（8）、作業Dの日数：1〜20（6）、作業Eの日数：1〜20（5）、作業Fの日数：1〜20（14）、作業Gの日数：1〜20（11）、作業Hの日数：1〜20（15）、作業Iの日数：1〜20（5） | 文章・図／4択 |
| [科目A問15 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=8) | generator-source-2025-a-15@3.2.0 | サーバ室の物理的安全対策。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問16 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-16@3.4.0 | マーケティングの分析手法。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問17 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-17@3.4.0 | 生成AIサービスのデータ設定。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問18 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-18@3.2.0 | 販売方針と必要な施策。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問19 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=10) | generator-cafe-profit@2.2.0 | 喫茶店の利益と必要客数。1人の売上（円）：100〜1500（500）、1人の変動費（円）：50〜800（100）、固定費（円）：50000〜500000（300000）、目標利益（円）：0〜300000（100000）、営業日数：10〜30（20）、客席数：5〜40（10） | 文章・表／4択 |
| [科目A問20 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=10) | generator-source-2025-a-20@3.2.0 | 環境指標と流通情報。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=4) | generator-count-multiples@2.3.0 | 区間内の倍数を数える。下限n：1〜100（1）、上限m：11〜250（12）、除数：2〜12（4） | 文章・コード・表／6択 |
| [科目B問2 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=6) | generator-coin-change@2.3.0 | 硬貨の組合せの総数。金額n（円）：11〜200（12）、残額変数のオフセット：0〜20（0） | 文章・コード／6択 |
| [科目B問3 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=8) | generator-source-2025-b-3@3.4.0 | スタックの添字と位置管理。位置変数の基準差：0〜3（0）、スタックの容量：4〜8（4）、最初の値：1〜9（4）、二つ目の値：1〜9（3） | 文章・図・コード・表／4択 |
| [科目B問4 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=10) | generator-source-2025-b-4@3.6.0 | 文字列検索の比較回数。検索対象の並び：0〜5（0）、検索キー：0〜5（0） | 文章・コード／10択 |
| [科目B問5 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=12) | generator-source-2025-b-5@3.6.0 | 分割表の理論度数。接種あり・罹患なし：20〜100（82）、接種あり・罹患あり：1〜20（6）、接種なし・罹患なし：20〜100（58）、接種なし・罹患あり：1〜20（8） | 文章・表・コード／7択 |

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
| [科目A問8 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=5) | generator-source-2024-a-8@3.2.0 | LANの接続装置。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
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
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=8) | generator-source-2024-b-4@3.4.0 | 併合処理の末尾コピー回数。二つの配列の配置：0〜5（0）、値の加算値：0〜20（0） | 文章・コード／4択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=10) | generator-source-2024-b-5@3.6.0 | 購買データの関連度の空欄。求める指標：0〜3（0）、注文の例：0〜2（0） | 文章・表・数式・コード／6択 |
| [科目B問6 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=14) | generator-source-2024-b-6@3.4.0 | テレワークの接続変更と対策。対策が必要な問題：0〜3（0）、端末の台数：100〜500（450） | 文章・箇条書き／5択 |

### 2023年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=2) | generator-hex-fraction@2.4.0 | 小数の基数変換。変換元の基数：2〜16（16）、変換先の基数：2〜16（10）、小数の値（8分の幾つ）：1〜7（6）、整数部分（10進数）：0〜255（0） | 文章／4択 |
| [科目A問2 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=2) | generator-source-2023-a-2@3.4.0 | 双方向リストへの挿入。挿入する位置：0〜3（0）、アドレスの倍率：1〜5（1） | 文章・表／4択 |
| [科目A問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=3) | generator-source-2023-a-3@3.2.0 | メモリの高速化。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問4 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=3) | generator-source-2023-a-4@3.2.0 | 計算処理を置く場所。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=4) | generator-source-2023-a-5@3.2.0 | CGの描画処理。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問6 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=4) | generator-source-2023-a-6@3.4.0 | 推移的関数従属。関数従属の連鎖：0〜3（0） | 文章・箇条書き／4択 |
| [科目A問7 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-7@3.2.0 | トランザクションの特性。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問8 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-8@3.2.0 | IPv4の運用機能。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問9 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-9@3.2.0 | マルウェアの侵入と被害。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問10 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=6) | generator-source-2023-a-10@3.4.0 | WAFの設置場所。TLS復号を行う位置：0〜1（1）、位置記号の配置：0〜3（0） | 文章・図／4択 |
| [科目A問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=7) | generator-source-2023-a-11@3.4.0 | 流れ図の実行経路。初期値比の候補：0〜3（3） | 文章・図／4択 |
| [科目A問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=7) | generator-source-2023-a-12@3.2.0 | スクラムのイベント。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問13 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=8) | generator-source-2023-a-13@3.4.0 | 作業短縮の最少追加費用。クリティカルな枝：0〜2（0）、上側で安価な作業：0〜1（1）、共通作業の日数増分：0〜5（0） | 文章・図・表／4択 |
| [科目A問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=8) | generator-source-2023-a-14@3.2.0 | テレワーク監査の確認目的。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問15 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=9) | generator-source-2023-a-15@3.2.0 | クラウドの配置形態。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問16 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=9) | generator-source-2023-a-16@3.2.0 | 人材マネジメント。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問17 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=10) | generator-source-2023-a-17@3.2.0 | 企業活動とIT。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問18 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=10) | generator-source-2023-a-18@3.2.0 | 新製品の採用時期。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問19 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=11) | generator-source-2023-a-19@3.2.0 | 経営の最高責任者。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目A問20 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=11) | generator-source-2023-a-20@3.2.0 | ソフトウェアの契約形態。問う対象・判定する条件：0〜3（0）、選択肢の配置：0〜2（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=4) | generator-source-2023-b-1@3.4.0 | 素数列挙の空欄。上限から引く値：0〜4（0）、説明例のmaxNum：10〜50（20） | 文章・コード・表／4択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=5) | generator-source-2023-b-2@3.4.0 | 手続の呼出し順。proc2の処理順：0〜3（0）、proc1の処理順：0〜1（0） | 文章・コード／8択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=6) | generator-source-2023-b-3@3.4.0 | クイックソートの初回出力。配列の並び：0〜119（25）、各値への加算値：0〜20（0） | 文章・コード／4択 |
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=8) | generator-source-2023-b-4@3.4.0 | 二つのハッシュ関数への格納。表の要素数：5〜9（5）、第2ハッシュの加算値：1〜4（3）、第1入力：1〜99（3）、第2入力：1〜99（18）、第3入力：1〜99（11） | 文章・コード／5択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=10) | generator-source-2023-b-5@3.6.0 | コサイン類似度の空欄。走査添字の基準差：0〜3（0）、分母の保持方式：0〜1（0） | 文章・数式・コード・表／9択 |
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
| [科目A問9 p.9](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=9) | generator-source-sample-2022-dec-a-9@3.2.0 | コーディング規則。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問10 p.9](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=9) | generator-source-sample-2022-dec-a-10@3.2.0 | 外部割込み。外部の発生原因：0〜2（0） | 文章／4択 |
| [科目A問11 p.9](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=9) | generator-source-sample-2022-dec-a-11@3.2.0 | ECCの冗長ビット。指数n：4〜9（7） | 文章／4択 |
| [科目A問12 p.10](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=10) | generator-source-sample-2022-dec-a-12@3.2.0 | 実効アクセス時間の順序。アクセス時間の条件：0〜3（0） | 文章・表／4択 |
| [科目A問13 p.10](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=10) | generator-source-sample-2022-dec-a-13@3.2.0 | 縮退運転の停止台数。物理マシン台数：16〜24（20）、通常使用率の十％：5〜7（7） | 文章／4択 |
| [科目A問14 p.11](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=11) | generator-source-sample-2022-dec-a-14@3.2.0 | 並列機器の稼働率。クライアント台数：2〜4（3）、プリンタ台数：2〜3（2） | 文章・図・表／4択 |
| [科目A問15 p.12](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=12) | generator-source-sample-2022-dec-a-15@3.2.0 | バッファサイズ。連続送信時間のT倍：1〜3（1） | 文章・図／4択 |
| [科目A問16 p.12](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=12) | generator-source-sample-2022-dec-a-16@3.2.0 | インタプリタ。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問17 p.13](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=13) | generator-source-sample-2022-dec-a-17@3.2.0 | 空き領域最大の媒体選択。割当て要求：0〜3（0）、要求の倍率：1〜2（1） | 文章／4択 |
| [科目A問18 p.13](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=13) | generator-source-sample-2022-dec-a-18@3.2.0 | 絶対パス名。着目する条件・記述：0〜3（0） | 文章／4択 |
| [科目A問19 p.13](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=13) | generator-source-sample-2022-dec-a-19@3.2.0 | DRAM。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問20 p.14](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=14) | generator-source-sample-2022-dec-a-20@3.2.0 | 入力チェック。検査する条件：0〜3（3） | 文章・表／4択 |
| [科目A問21 p.14](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=14) | generator-source-sample-2022-dec-a-21@3.2.0 | ビュー。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問22 p.14](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=14) | generator-source-sample-2022-dec-a-22@3.2.0 | UMLの多重度。多重度の条件：0〜3（0） | 文章・図／4択 |
| [科目A問23 p.15](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=15) | generator-source-sample-2022-dec-a-23@3.2.0 | データレイク。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問24 p.15](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=15) | generator-source-sample-2022-dec-a-24@3.2.0 | 関係演算。抽出の方向：0〜1（0）、数量の加算：0〜2（0） | 文章・表／4択 |
| [科目A問25 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-a-25@3.2.0 | IoTの通信技術。問う条件：0〜3（0） | 文章／4択 |
| [科目A問26 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-a-26@3.2.0 | 伝送時間。データ量の3MB単位：2〜6（4）、速度の1.5Mbps単位：1〜2（1） | 文章／4択 |
| [科目A問27 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-a-27@3.2.0 | 通信の規格。問う条件：0〜3（1） | 文章／4択 |
| [科目A問28 p.16](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=16) | generator-source-sample-2022-dec-a-28@3.2.0 | ネットワークプロトコル。問う条件：0〜3（3） | 文章／4択 |
| [科目A問29 p.17](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=17) | generator-source-sample-2022-dec-a-29@3.2.0 | 戻りのTCPポート番号。PCポート番号の差：0〜5（0）、HTTPポート：0〜2（0） | 文章・表／4択 |
| [科目A問30 p.17](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=17) | generator-source-sample-2022-dec-a-30@3.2.0 | 攻撃の分類。問う条件：0〜3（0） | 文章／4択 |
| [科目A問31 p.18](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=18) | generator-source-sample-2022-dec-a-31@3.2.0 | サーバの役割。問う対象：0〜3（3） | 文章／4択 |
| [科目A問32 p.18](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=18) | generator-source-sample-2022-dec-a-32@3.2.0 | メッセージ認証符号。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問33 p.18](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=18) | generator-source-sample-2022-dec-a-33@3.2.0 | UPS。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問34 p.19](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=19) | generator-source-sample-2022-dec-a-34@3.2.0 | ファジング。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問35 p.19](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=19) | generator-source-sample-2022-dec-a-35@3.2.0 | マルウェアの動的解析。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問36 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-a-36@3.2.0 | 攻撃への対策。問う対象：0〜3（0） | 文章／4択 |
| [科目A問37 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-a-37@3.2.0 | 電子メールの認証と保護。問う条件：0〜3（3） | 文章／4択 |
| [科目A問38 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-a-38@3.2.0 | オブジェクト指向の用語。問う条件：0〜3（1） | 文章／4択 |
| [科目A問39 p.20](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=20) | generator-source-sample-2022-dec-a-39@3.2.0 | モジュール結合度。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問40 p.21](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=21) | generator-source-sample-2022-dec-a-40@3.2.0 | テスト手法。問う条件：0〜3（1） | 文章／4択 |
| [科目A問41 p.21](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=21) | generator-source-sample-2022-dec-a-41@3.2.0 | スクラムのスプリント。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問42 p.21](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=21) | generator-source-sample-2022-dec-a-42@3.2.0 | プロジェクトの特性。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問43 p.22](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=22) | generator-source-sample-2022-dec-a-43@3.2.0 | 見積方法。問う対象：0〜3（2） | 文章／4択 |
| [科目A問44 p.22](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=22) | generator-source-sample-2022-dec-a-44@3.2.0 | 最少所要日数。Aの日数：1〜3（2）、Eの日数：1〜3（2） | 文章・図／4択 |
| [科目A問45 p.23](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=23) | generator-source-sample-2022-dec-a-45@3.2.0 | サービス改善。問う対象：0〜3（1） | 文章／4択 |
| [科目A問46 p.23](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=23) | generator-source-sample-2022-dec-a-46@3.2.0 | 回復処理。問う条件：0〜3（3） | 文章／4択 |
| [科目A問47 p.23](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=23) | generator-source-sample-2022-dec-a-47@3.2.0 | 監査の独立性。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問48 p.24](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=24) | generator-source-sample-2022-dec-a-48@3.2.0 | 情報セキュリティ監査。監査で確認する特性：0〜2（0） | 文章／4択 |
| [科目A問49 p.24](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=24) | generator-source-sample-2022-dec-a-49@3.2.0 | テレワーク。問う対象：0〜3（0） | 文章／4択 |
| [科目A問50 p.25](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=25) | generator-source-sample-2022-dec-a-50@3.2.0 | ROIによる比較。利益構成：0〜3（0）、金額倍率：1〜2（1） | 文章・表／4択 |
| [科目A問51 p.25](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=25) | generator-source-sample-2022-dec-a-51@3.2.0 | 環境への取組。問う条件：0〜3（3） | 文章／4択 |
| [科目A問52 p.26](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=26) | generator-source-sample-2022-dec-a-52@3.2.0 | 経営の概念。問う対象：0〜3（0） | 文章／4択 |
| [科目A問53 p.26](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=26) | generator-source-sample-2022-dec-a-53@3.2.0 | リーンスタートアップ。着目する条件・記述：0〜2（0） | 文章／4択 |
| [科目A問54 p.27](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=27) | generator-source-sample-2022-dec-a-54@3.2.0 | IoTの応用。問う対象：0〜3（3） | 文章／4択 |
| [科目A問55 p.27](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=27) | generator-source-sample-2022-dec-a-55@3.2.0 | 電子商取引。問う対象：0〜3（1） | 文章／4択 |
| [科目A問56 p.28](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=28) | generator-source-sample-2022-dec-a-56@3.2.0 | CGMの例。消費者が発信する内容：0〜2（0） | 文章／4択 |
| [科目A問57 p.28](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=28) | generator-source-sample-2022-dec-a-57@3.2.0 | 原料制約と最大利益。原料量の倍率：1〜3（1）、原料Aの追加6単位：0〜2（0） | 文章・表／4択 |
| [科目A問58 p.28](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=28) | generator-source-sample-2022-dec-a-58@3.2.0 | 固定資産売却損。購入額の2万円単位：10〜20（15）、売却額の0.5万円単位：2〜4（2） | 文章／4択 |
| [科目A問59 p.29](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=29) | generator-source-sample-2022-dec-a-59@3.2.0 | 目標利益と売上高。基準売上高の100百万円単位：1〜2（1）、目標利益の6百万円単位：1〜6（3） | 文章／4択 |
| [科目A問60 p.29](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_a_set_sample_qs.pdf#page=29) | generator-source-sample-2022-dec-a-60@3.2.0 | 労働者派遣の関係。太線の関係：0〜2（0） | 文章・図／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=4) | generator-source-sample-2022-dec-b-1@3.2.0 | 代入と出力順。初期値の最小値：1〜4（1）、初期値の並び：0〜5（0） | 文章・コード／6択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=5) | generator-source-sample-2022-dec-b-2@3.2.0 | 複数の倍数条件の分岐順。二つの除数の組：0〜3（0） | 文章・コード・表／5択 |
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
| [科目B問15 p.24](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=24) | generator-source-sample-2022-dec-b-15@3.2.0 | 三目並べのミニマックス評価。勝敗の評価値の5点単位：1〜3（2）、AとBを付ける根の子：0〜2（0） | 文章・箇条書き・図・表／4択 |
| [科目B問16 p.26](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=26) | generator-source-sample-2022-dec-b-16@3.2.0 | UTF-8の基数による分割。符号のバイト数：2〜4（3）、文字例：0〜1（0） | 文章・コード／9択 |
| [科目B問17 p.28](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=28) | generator-source-sample-2022-dec-b-17@3.2.0 | PaaSの脆弱性対処の責任分担。サービスと委託の範囲：0〜2（0）、指摘事項の順序：0〜5（0） | 文章・表／10択 |
| [科目B問18 p.30](https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/fe_kamoku_b_set_sample_qs.pdf#page=30) | generator-source-sample-2022-dec-b-18@3.2.0 | 業務用端末の利用変更によるリスク。客先常駐者に許可する端末：0〜1（0）、リスク項目の循環移動：0〜4（0） | 文章・箇条書き／10択 |
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

## 登録図の入力契約

renderer-source-figures@1.0.0はsource_figureのprofileとvaluesだけを受け取る。登録済みの形状を固定React/SVGコードで描き、値の個数と位置ごとの整数域を検査する。既存図の入力域はsrc/core/source-figure-domains.json、管理図はsrc/core/managed-legacy-figures.ts及びsrc/core/legacy-afternoon-figures.tsの有限契約を結合して生成する。旧午後の位置別上下限は外接域であり、許可する入力は後掲の査読済み有限組合せに限る。描画器の登録だけで問題集の素材条件・配布を承認したとは扱わない。未登録形状・不足・過剰・域外はFIGURE_PROFILEで拒否する。原図の凡例・円・線種・配列の網掛けを保持し、内部IDや接続説明表を通常画面へ追加しない。読み上げ用説明はSVGのtitle／descに保持する。

| profile | valuesの位置別の下限〜上限（0始まり） | 入力の意味・描画との対応 |
| --- | --- | --- |
| waf-network | 0：0〜1、1：0〜3 | 0：TLS終端（0=FW、1=SSLアクセラレータ）、1：a〜dの循環移動量。末尾はDBアクセス |
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
| legacy-2017-pm3-waste-database | 0：0〜0 | 図の入力[0]は固定の4表・14見出し・14データセル・5主キー下線を表す。問題の4条件と4正答署名は別の問題パラメータで切り替える。 |

旧午後の管理図は src/core/legacy-afternoon-figures.ts が登録された問題定義の有限入力から作る厳密なtuple辞書で検査する。上の上下限は外接域であり、個々の整数が範囲内でも未登録の組合せは拒否する。素材の出典と権利は基準問題の同じ本文・図・付属資料の単位から継承する。固定の問題本文画像は生成へ流用せず、登録された公式付属資料（正誤表・共通記法・API・言語仕様）だけを個別の素材条件・厳密なIDと位置で保持する。

## 再生成と検証

一覧の更新はnpm run doc:generation、鮮度確認はnpm run doc:validateで行う。生成器の変更時には正答・誤答の独立検算と原資料の形式照合を行い、改訂とモジュール版を更新する。保存済みセッションの内容を新しい生成器で作り直さない。詳しい[生成仕様](/diagram-generation)、[出典表示](/attribution)、[検証記録](/verification)を参照する。
