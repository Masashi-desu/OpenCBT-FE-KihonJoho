# 全問題の生成対応

<!-- scripts/generation-reference.ts が生成する。手編集しない。 -->

## 対象と対応条件

本システムでは、収録した公式公開問題103問すべてに、原問題とは別の改変済み基準問題と登録生成器を一対一で用意する。科目A80問、科目B23問をランダムミックスの候補にする。2025年度科目B問6は第三者のJIS文言の利用条件が未確認であり、原問題・生成版とも対象外とする。非公開問題を含めた全FE問題という意味ではない。

年度別オリジナルは公式本文・図・数値・正答を維持した原資料画像を表示する。生成版ではその学習対象と媒体の形式を基に、文章を文章、表を表、図を作図、疑似言語を空欄付きコードとして構造化する。知識問題では用語・対応関係・問う方向・正誤の条件、計算問題では数値・条件、アルゴリズムでは引数・添字・処理条件、長文では規則・状況を変数とする。本文・図・選択肢・正答・独自解説は同じ入力から確定する。選択肢の並べ替えだけで生成対応とは扱わない。

生成用基準問題も改変問題であり、原文そのものの再録ではない。元の学習対象を維持しつつ、生成可能にする文言や条件の明示、問う対象の切替を含む。知識問題には数値が存在しないため、数値変更を一律に追加しない。原問題で与えられた数式や変換例の図は生成時も維持し、解答を導く補助表を追加しない。公式再録の不変参照と改変内容を保存し、原資料にない条件は改変として表示する。

カタログのgenerationCoverage=completeでは、含まれる各公式問題から派生する有効なテンプレートが一つあり、対応する科目のミックス枠へ一つ登録されることを検査する。不足・重複はGENERATION_COVERAGEで配布検証を拒否する。これで内容の真実性や利用条件の法的適合を保証するものではない。省略又はpartialの旧カタログはこの全問対応宣言を持たない。

## 問題別の対応一覧

表は配布カタログ・基準問題・登録契約から生成する。入力は整数の順序付き列で、各欄は「名称：下限〜上限（基準値）」を表す。追加の入力間制約は生成器で検査し、不成立なら再抽選の上限内で選び直す。生成器のID・版・入力域をJSONだけで追加しても実行できない。原資料のリンクは該当PDFページを示す。

### 2023年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=2) | generator-hex-fraction@2.0.0 | 16進小数の変換。16進小数の値：1〜255（12）、16進小数の桁数：1〜2（1） | 文章／4択 |
| [科目A問2 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=2) | generator-source-2023-a-2@3.0.0 | 双方向リストへの挿入。挿入する位置：0〜3（0）、アドレスの倍率：1〜5（1） | 文章・表／4択 |
| [科目A問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=3) | generator-source-2023-a-3@3.0.0 | メモリの高速化。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問4 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=3) | generator-source-2023-a-4@3.0.0 | 計算処理を置く場所。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=4) | generator-source-2023-a-5@3.0.0 | CGの描画処理。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問6 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=4) | generator-source-2023-a-6@3.0.0 | 推移的関数従属。関数従属の連鎖：0〜3（0） | 文章・箇条書き／4択 |
| [科目A問7 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-7@3.0.0 | トランザクションの特性。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問8 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-8@3.0.0 | IPv4の運用機能。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問9 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=5) | generator-source-2023-a-9@3.0.0 | マルウェアの侵入と被害。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問10 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=6) | generator-source-2023-a-10@3.0.1 | WAFの設置場所。TLS復号を行う位置：0〜1（1）、位置記号の配置：0〜3（0） | 文章・図／4択 |
| [科目A問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=7) | generator-source-2023-a-11@3.0.0 | 流れ図の実行経路。初期値比の候補：0〜3（3） | 文章・図／4択 |
| [科目A問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=7) | generator-source-2023-a-12@3.0.0 | スクラムのイベント。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問13 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=8) | generator-source-2023-a-13@3.0.0 | 作業短縮の最少追加費用。クリティカルな枝：0〜2（0）、上側で安価な作業：0〜1（1）、共通作業の日数増分：0〜5（0） | 文章・図・表／4択 |
| [科目A問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=8) | generator-source-2023-a-14@3.0.0 | テレワーク監査の確認目的。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問15 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=9) | generator-source-2023-a-15@3.0.0 | クラウドの配置形態。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問16 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=9) | generator-source-2023-a-16@3.0.0 | 人材マネジメント。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問17 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=10) | generator-source-2023-a-17@3.0.0 | 企業活動とIT。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問18 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=10) | generator-source-2023-a-18@3.0.0 | 新製品の採用時期。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問19 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=11) | generator-source-2023-a-19@3.0.0 | 経営の最高責任者。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問20 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_a_qs.pdf#page=11) | generator-source-2023-a-20@3.0.0 | ソフトウェアの契約形態。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=4) | generator-source-2023-b-1@3.0.0 | 素数列挙の空欄。上限から引く値：0〜4（0）、説明例のmaxNum：10〜50（20） | 文章・コード・表／4択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=5) | generator-source-2023-b-2@3.0.0 | 手続の呼出し順。proc2の処理順：0〜3（0）、proc1の処理順：0〜1（0） | 文章・コード／8択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=6) | generator-source-2023-b-3@3.0.0 | クイックソートの初回出力。配列の並び：0〜119（25）、各値への加算値：0〜20（0） | 文章・コード／4択 |
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=8) | generator-source-2023-b-4@3.0.0 | 二つのハッシュ関数への格納。表の要素数：5〜9（5）、第2ハッシュの加算値：1〜4（3）、第1入力：1〜99（3）、第2入力：1〜99（18）、第3入力：1〜99（11） | 文章・コード／5択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=10) | generator-source-2023-b-5@3.0.0 | コサイン類似度の空欄。走査添字の基準差：0〜3（0）、分母の保持方式：0〜1（0） | 文章・数式・コード・表／9択 |
| [科目B問6 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_fe_kamoku_b_qs.pdf#page=12) | generator-source-2023-b-6@3.0.1 | 業務委託とスキャン情報のリスク。残る情報セキュリティリスク：0〜3（0）、業務の担当人数：2〜5（2） | 文章・箇条書き／4択 |

### 2024年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=2) | generator-logic-table@2.0.0 | 真理値表と論理演算。演算種別：1〜7（7）、誤答候補の回転：0〜6（0） | 文章・表／4択 |
| [科目A問2 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=2) | generator-hash-collision@2.0.0 | ハッシュ表の衝突。表の大きさ：5〜13（10）、第1キーのASCII：97〜109（100）、第2キーのASCII：98〜122（120） | 文章／4択 |
| [科目A問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=3) | generator-source-2024-a-3@3.0.0 | CPU間の処理時間とヒット率。ヒット率の百分率：70〜96（90）、アクセス時間差の倍率：1〜5（2）、CPU Yのキャッシュ時間：5〜30（20）、CPU Xの主記憶時間：100〜600（400） | 文章・図・表／4択 |
| [科目A問4 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=3) | generator-availability@2.0.0 | MTBF・MTTRと稼働率。MTBF（時間）：100〜6000（3000）、MTTR（時間）：100〜2000（1000）、MTBFの改善率（％）：0〜40（20）、MTTRの改善率（％）：1〜40（10） | 文章／4択 |
| [科目A問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=4) | generator-source-2024-a-5@3.0.0 | Webサービスの組合せ。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問6 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=4) | generator-source-2024-a-6@3.0.0 | 画像の表現手法。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問7 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=4) | generator-source-2024-a-7@3.0.0 | DBMSのACID特性。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問8 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=5) | generator-source-2024-a-8@3.0.0 | LANの接続装置。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問9 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=5) | generator-source-2024-a-9@3.0.0 | セキュリティの検査手法。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問10 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=5) | generator-source-2024-a-10@3.0.0 | Webの入力に対する対策。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問11 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=6) | generator-source-2024-a-11@3.0.0 | テスト用の代替モジュール。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問12 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=6) | generator-source-2024-a-12@3.0.0 | スプリントのイベント。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問13 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=6) | generator-critical-path@2.0.0 | アローダイアグラムの最短完了日数。作業Aの日数：1〜60（30）、作業Bの日数：1〜60（5）、作業Cの日数：1〜60（30）、作業Dの日数：1〜60（20）、作業Eの日数：1〜60（40）、作業Fの日数：1〜60（25）、作業Gの日数：1〜60（30）、作業Hの日数：1〜60（30） | 文章・図／4択 |
| [科目A問14 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=7) | generator-source-2024-a-14@3.0.0 | 開発と運用の連携。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問15 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=7) | generator-source-2024-a-15@3.0.0 | データの前処理。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問16 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=8) | generator-source-2024-a-16@3.0.0 | 経営資源と方針。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問17 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=8) | generator-source-2024-a-17@3.0.0 | 市場の競争と分類。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問18 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=8) | generator-source-2024-a-18@3.0.0 | 業務領域とICT。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問19 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=9) | generator-source-2024-a-19@3.0.0 | 散布図の相関。相関の種類：0〜2（0）、点の散らばり：0〜2（0） | 文章・図／4択 |
| [科目A問20 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=9) | generator-source-2024-a-20@3.0.0 | 産業財産権の分類。保護対象の分類：0〜3（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=4) | generator-source-2024-b-1@3.0.0 | 最大又は最小を返す条件。返す値の種類：0〜1（0）、最初に比較する変数：0〜2（0） | 文章・コード／6択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=5) | generator-source-2024-b-2@3.0.1 | 文字列の基数変換。基数：2〜8（2）、走査する向き：0〜1（0）、説明例の整数：1〜255（18） | 文章・コード／4択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=6) | generator-source-2024-b-3@3.0.0 | 辺リストと隣接行列。頂点番号の基準差：0〜3（0）、グラフの接続例：0〜2（0） | 文章・図・コード／6択 |
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=8) | generator-source-2024-b-4@3.0.0 | 併合処理の末尾コピー回数。二つの配列の配置：0〜5（0）、値の加算値：0〜20（0） | 文章・コード／4択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=10) | generator-source-2024-b-5@3.0.0 | 購買データの関連度の空欄。求める指標：0〜3（0）、注文の例：0〜2（0） | 文章・表・数式・コード／6択 |
| [科目B問6 p.14](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_b_qs.pdf#page=14) | generator-source-2024-b-6@3.0.0 | テレワークの接続変更と対策。対策が必要な問題：0〜3（0）、端末の台数：100〜500（450） | 文章・箇条書き／5択 |

### 2025年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=2) | generator-source-2025-a-1@3.0.0 | 学習済みモデルの利用。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問2 p.2](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=2) | generator-source-2025-a-2@3.0.0 | 数値計算の誤差。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問3 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=3) | generator-source-2025-a-3@3.0.0 | 2分探索木の大小関係。ラベルの巡回配置：0〜6（0）、左右の配置：0〜1（0） | 文章・図／4択 |
| [科目A問4 p.3](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=3) | generator-source-2025-a-4@3.0.0 | 毎年の保守改善と稼働率。初年度MTBF：1000〜8000（4000）、初年度MTTR：500〜2000（1000）、毎年の改善時間：20〜150（100）、経過年数：1〜6（6） | 文章／4択 |
| [科目A問5 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=4) | generator-source-2025-a-5@3.0.0 | 開発を支援するツール。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問6 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=5) | generator-source-2025-a-6@3.0.0 | SQLの条件の等価性。集合条件：0〜3（0）、仕入先の組：0〜2（0） | 文章・表・コード／4択 |
| [科目A問7 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=5) | generator-source-2025-a-7@3.0.0 | 回線利用率。動画のGバイト数：1〜5（1）、回線速度Mビット毎秒：40〜400（40）、経過分：3〜15（5）、制御情報の百分率：0〜25（20） | 文章／4択 |
| [科目A問8 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-8@3.0.0 | Web通信の機能。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問9 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-9@3.0.0 | 暗号と鍵のリスク。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問10 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=6) | generator-source-2025-a-10@3.0.0 | セキュリティの技術と製品。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問11 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-11@3.0.0 | E-Rモデルの構成要素。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問12 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-12@3.0.0 | オブジェクト指向の機能。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問13 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=7) | generator-source-2025-a-13@3.0.0 | スクラムの役割。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問14 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=8) | generator-source-2025-a-14@3.0.0 | ダミーを含むプロジェクトの所要日数。作業Aの日数：1〜20（3）、作業Bの日数：1〜20（6）、作業Cの日数：1〜20（8）、作業Dの日数：1〜20（6）、作業Eの日数：1〜20（5）、作業Fの日数：1〜20（14）、作業Gの日数：1〜20（11）、作業Hの日数：1〜20（15）、作業Iの日数：1〜20（5） | 文章・図／4択 |
| [科目A問15 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=8) | generator-source-2025-a-15@3.0.0 | サーバ室の物理的安全対策。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問16 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-16@3.0.0 | マーケティングの分析手法。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問17 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-17@3.0.0 | 生成AIサービスのデータ設定。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問18 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=9) | generator-source-2025-a-18@3.0.0 | 販売方針と必要な施策。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問19 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=10) | generator-cafe-profit@2.0.0 | 喫茶店の利益と必要客数。1人の売上（円）：100〜1500（500）、1人の変動費（円）：50〜800（100）、固定費（円）：50000〜500000（300000）、目標利益（円）：0〜300000（100000）、営業日数：10〜30（20）、客席数：5〜40（10） | 文章・表／4択 |
| [科目A問20 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_a_qs.pdf#page=10) | generator-source-2025-a-20@3.0.0 | 環境指標と流通情報。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=4) | generator-count-multiples@2.0.0 | 区間内の倍数を数える。下限n：1〜100（1）、上限m：11〜250（12）、除数：2〜12（4） | 文章・コード・表／6択 |
| [科目B問2 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=6) | generator-coin-change@2.0.0 | 硬貨の組合せの総数。金額n（円）：11〜200（12）、残額変数のオフセット：0〜20（0） | 文章・コード／6択 |
| [科目B問3 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=8) | generator-source-2025-b-3@3.0.0 | スタックの添字と位置管理。位置変数の基準差：0〜3（0）、スタックの容量：4〜8（4）、最初の値：1〜9（4）、二つ目の値：1〜9（3） | 文章・図・コード・表／4択 |
| [科目B問4 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=10) | generator-source-2025-b-4@3.0.0 | 文字列検索の比較回数。検索対象の並び：0〜5（0）、検索キー：0〜5（0） | 文章・コード／10択 |
| [科目B問5 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_fe_kamoku_b_qs.pdf#page=12) | generator-source-2025-b-5@3.0.0 | 分割表の理論度数。接種あり・罹患なし：20〜100（82）、接種あり・罹患あり：1〜20（6）、接種なし・罹患なし：20〜100（58）、接種なし・罹患あり：1〜20（8） | 文章・表・コード／7択 |

### 2026年度

| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |
| --- | --- | --- | --- |
| [科目A問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=4) | generator-source-2026-a-1@3.0.0 | 遷移確率表の関係。入力軸の向き：0〜1（0）、記号の配置：0〜23（0） | 文章・表／4択 |
| [科目A問2 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=4) | generator-source-2026-a-2@3.0.0 | 整列アルゴリズム。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問3 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=5) | generator-source-2026-a-3@3.0.0 | 計算装置の特徴。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問4 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=5) | generator-source-2026-a-4@3.0.0 | クラウドのサービスモデル。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問5 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=6) | generator-source-2026-a-5@3.0.0 | 主記憶と仮想記憶の管理。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問6 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=6) | generator-source-2026-a-6@3.0.0 | 論理回路とタイミングチャート。四つのゲートの反転マスク：0〜15（15）、入力信号の位相：0〜6（0） | 文章・図／4択 |
| [科目A問7 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=7) | generator-source-2026-a-7@3.0.0 | SQLの主キー制約。違反する命令の種類：0〜3（0）、商品コードの枝番：0〜9（0） | 文章・コード・表／4択 |
| [科目A問8 p.7](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=7) | generator-source-2026-a-8@3.0.0 | 無線通信の仕組み。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問9 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-9@3.0.0 | 認証要素の組合せ。異なる認証要素の組：0〜8（0） | 文章／4択 |
| [科目A問10 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-10@3.0.0 | セキュリティの専門組織。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問11 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=8) | generator-source-2026-a-11@3.0.0 | 開発上の問題への対策。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問12 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=9) | generator-source-2026-a-12@3.0.0 | 進捗の可視化。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問13 p.9](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=9) | generator-source-2026-a-13@3.0.0 | 期間短縮と人材支援。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問14 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=10) | generator-service-gain@2.0.0 | サービス可用性の改善。年間提供時間（時間）：500〜10000（5000）、移行前停止（時間）：10〜200（100）、移行後停止（分）：1〜600（30） | 文章・箇条書き／4択 |
| [科目A問15 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=10) | generator-source-2026-a-15@3.0.0 | システム監査の役割分担。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問16 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=11) | generator-source-2026-a-16@3.0.0 | 小売業のIT活用。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問17 p.11](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=11) | generator-retention@2.0.0 | 会員のリテンション率。A前月会員：100〜5000（1000）、A新規会員：0〜2000（500）、A継続会員：1〜5000（300）、B前月会員：100〜5000（1000）、B新規会員：0〜2000（200）、B継続会員：1〜5000（600）、C前月会員：100〜5000（1500）、C新規会員：0〜2000（500）、C継続会員：1〜5000（600）、D前月会員：100〜5000（1500）、D新規会員：0〜2000（1000）、D継続会員：1〜5000（800） | 文章・表／4択 |
| [科目A問18 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=12) | generator-source-2026-a-18@3.0.0 | 学習を伴うAIの事例。固定処理の事例：0〜3（0） | 文章／4択 |
| [科目A問19 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=12) | generator-source-2026-a-19@3.0.0 | 会議とコミュニケーション。問う対象：0〜3（0）、設問の方向と判定条件：0〜2（0） | 文章／4択 |
| [科目A問20 p.13](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_a_qs.pdf#page=13) | generator-source-2026-a-20@3.0.0 | 著作権と著作者人格権。問う権利と条件：0〜3（0） | 文章／4択 |
| [科目B問1 p.4](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=4) | generator-source-2026-b-1@3.0.1 | 配列の右への回転。右へ移動する要素数：1〜4（1）、配列の要素数：6〜12（9） | 文章・コード／4択 |
| [科目B問2 p.5](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=5) | generator-complement@2.0.0 | 8ビットの2の補数。8ビットの入力x：1〜255（42）、ビット幅：4〜8（8） | 文章・コード／6択 |
| [科目B問3 p.6](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=6) | generator-recurrence@2.0.0 | 漸化式を追跡する。引数n：3〜14（5）、2項前の係数：2〜4（2） | 文章・コード／8択 |
| [科目B問4 p.8](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=8) | generator-source-2026-b-4@3.0.0 | 配列による単方向リスト。次ポインタの基準差：0〜3（0）、格納値の倍率：1〜5（1） | 文章・図・コード・表／4択 |
| [科目B問5 p.10](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=10) | generator-source-2026-b-5@3.0.0 | One-Hot表現への変換。走査添字の基準差：0〜3（0）、色の並び：0〜3（0） | 文章・図・コード・表／4択 |
| [科目B問6 p.12](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf#page=12) | generator-security-log@2.0.0 | ログ管理ルールと運用の照合。運用担当者数：0〜4（1）、一般利用者のログアクセス：0〜1（1）、日時が日本標準時：0〜1（0）、過去ログの上書き：0〜1（1） | 文章・見出し・箇条書き・表／10択 |

## 登録図の入力契約

renderer-source-figures@1.0.0はsource_figureのprofileとvaluesだけを受け取る。登録済みの15形状を固定React/SVGコードで描き、値の個数と位置ごとの整数域を検査する。表の入力域はsrc/core/source-figure-domains.jsonの正本から生成する。未登録形状・不足・過剰・域外はFIGURE_PROFILEで拒否する。原図の凡例・円・線種・配列の網掛けを保持し、内部IDや接続説明表を通常画面へ追加しない。読み上げ用説明はSVGのtitle／descに保持する。

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

## 再生成と検証

一覧の更新はnpm run doc:generation、鮮度確認はnpm run doc:validateで行う。生成器の変更時には正答・誤答の独立検算と原資料の形式照合を行い、改訂とモジュール版を更新する。保存済みセッションの内容を新しい生成器で作り直さない。詳しい[生成仕様](/diagram-generation)、[出典表示](/attribution)、[検証記録](/verification)を参照する。
