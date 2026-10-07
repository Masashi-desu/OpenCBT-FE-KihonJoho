# JSONサンプルと不正例

## サンプルの性質

本システムの形式を説明する最小データであり、本体の問題集や動作するCBTではない。全問題・セットは `distribution=docs_only`、カタログは `scope=docs_fixture`。セッションと結果は架空の利用者状態である。全コード表示は `docs/public/data` の正本ファイルを読み取り、内容を手書きで複製しない。

改変の有無は全問題に明記し、セッションのissuedContentにも出題時の値を記録する。フィールドがないデータを「改変なし」と解釈しない。

公式例だけは実在する2025年度FE科目A公開問題の問16である。問題冊子p.9と解答冊子p.1を画像で照合し、正解エを `choice-basket` へ対応付けた。組版の字間と改行だけを正規化した。独自解説と改変例を公式作成と表示しない。[R05と調査限界](/references)を参照する。

## 公式公開問題の再録

[元JSON](/data/questions/reprint.json)。本文・選択肢のsourceと、正答のsourceは別冊子を参照する。解説は独自記述である。

<<< @/public/data/questions/reprint.json

## 公式問題に基づく改変

[元JSON](/data/questions/adapted.json)。特定の原問の問いへ依存するため、文言を変えても `original` に分類しない。選択肢の表示順を変えた結果、原問のエがこの例ではイになるが、正答IDは `choice-basket` のまま対応する。

<<< @/public/data/questions/adapted.json

## 独自問題

[元JSON](/data/questions/original.json)。二進数の一般的な計算を独立に構成した説明用問題。実在するIPA年度・問番号を付けない。正答は10であり、表示文字列を用いた式と読み上げ文を示す。

<<< @/public/data/questions/original.json

## 科目B相当の長文・表・疑似言語

[元JSON](/data/questions/subject-b.json)。実在するFE問題の再録ではない。共通本文、設問の対応、箇条書き、矩形表、静的独自図、表示専用の疑似言語を含む。正答は3+5+2=10と紙上で追跡した。コードを実行する機能を作っていない。

<<< @/public/data/questions/subject-b.json

[アセット定義](/data/assets/array-cells.json)、[独自図](/data/assets/array-cells.png)も同じ正本から参照できる。

## 管理された図と生成の記録

[基準問題](/data/questions/diagram-base.json)は一般的な配列の総和を独立に作成したもので、origin.isModified=false、modificationBasis=noneである。HTML/CSS/JSの図描画へ渡すarrayのJSONを含む。サイトでは描画器を動かさず、入力構造を表示する。

<<< @/public/data/questions/diagram-base.json

[フローチャート](/data/diagrams/flowchart.json)と[グラフ](/data/diagrams/graph.json)も独自の宣言的構造例である。これらは共有diagram型の単体検証用で、配布カタログの問題として収録しない。

<<< @/public/data/diagrams/flowchart.json

<<< @/public/data/diagrams/graph.json

[生成テンプレート](/data/templates/array-sum.json)は基準値[3,5,2]、バインド前の基準questionの参照とoriginalContentSha256、許可域を定義する。[生成枠のセット](/data/sets/b-generated.json)はこの基準問題一枠をテンプレートへ関連付ける。

<<< @/public/data/templates/array-sum.json

[出題内容の固定例](/data/instances/array-sum.json)は手入力したパラメータ[4,7,1]、表・図・本文・正答12・途中値4／11／12・独自解説を整合させた例である。値の生成・バインドを行った経路を示すbindingPerformed=true、isModified=true、比較基準はbase_question、派生元は基準問題を指す。parameterSelection=explicitなのでseedを省略する。実際の生成器や乱数選択を実行して作った例ではない。

<<< @/public/data/instances/array-sum.json

[生成問題の終了セッション](/data/sessions/generated-study.json)はgeneratedInstanceIdと出題時のissuedContentを持つ。改変フラグ、出自、内容hashは保存済みinstance.questionと一致する。[結果](/data/results/generated-study.json)も同じinstanceを参照する架空の学習結果である。

<<< @/public/data/sessions/generated-study.json

<<< @/public/data/results/generated-study.json

[元データを使用したセッション](/data/sessions/original-data-study.json)は、同じセットの同じ基準問題をbindingMode=original_dataで使う例である。bindingPerformed=false、isModified=falseを保存し、generatedInstanceIdを持たない。正答は保持した元データの10である。こちらも架空の学習状態で、実行したCBTの記録ではない。

<<< @/public/data/sessions/original-data-study.json

<<< @/public/data/results/original-data-study.json

## 出典・権利レコード

| ファイル | 役割 |
| --- | --- |
| [ipa-faq.json](/data/sources/ipa-faq.json) | 条件の資料 |
| [ipa-public.json](/data/sources/ipa-public.json) | 公開問題の利用案内 |
| [ipa-2025-a.json](/data/sources/ipa-2025-a.json) | 問題冊子の確認・hash |
| [ipa-2025-answer.json](/data/sources/ipa-2025-answer.json) | 解答冊子の確認・hash |
| [ipa-public.json（rights）](/data/rights/ipa-public.json) | 公式原部分の条件と今回の用途判断 |
| [original.json（rights）](/data/rights/original.json) | 独自記述部分の条件 |

用途判断に含まれる解釈と限界を `assessmentNotes` に明記する。`allowed` をGitHub等への個別許諾取得と読み替えない。

<<< @/public/data/rights/ipa-public.json

<<< @/public/data/rights/original.json

## カタログ・セット・設定

[カタログJSON](/data/catalog.json)は全正本ファイルへの参照とhashを持つ。解答セッションを含めず、snapshot参照の循環を避ける。

<<< @/public/data/catalog.json

科目A学習セットは公式問16と独自二進数問題の2問である。改変問を同じセッションへ入れると同一派生系列が重複するため、[改変用の別セット](/data/sets/adapted.json)に分ける。[科目Bセット](/data/sets/b-study.json)は独自1問。

<<< @/public/data/sets/a-study.json

[科目A学習設定](/data/exams/a-study.json)、[改変用1問設定](/data/exams/a-study-single.json)、[科目B学習設定](/data/exams/b-study.json)をセットへ関連付ける。[A形式練習設定](/data/exams/a-practice.json)と[B形式練習設定](/data/exams/b-practice.json)は制度に沿う設定の説明用で、問題が不足するためこのカタログで開始可能な設定としてセットへ付けない。

## 解答セッションと学習結果

[終了した科目A学習](/data/sessions/completed-study.json)は公式問に正解し、独自問は未解答である。2問中1問、学習正答率50.0%。公式成績ではない。

<<< @/public/data/sessions/completed-study.json

[科目Bの一時停止例](/data/sessions/paused-study.json)はstudyで正答を表示した架空状態を示す。[結果JSON](/data/results/study.json)は終了したA学習の保存版と当時の問題改訂を参照する。

<<< @/public/data/sessions/paused-study.json

<<< @/public/data/results/study.json

## 数式の説明用例

次は独自の仕様説明用の数式で、実在するIPA問題や年度・問番号を割り当てない。補助型formulaの単体例なのでschemaVersion・問題IDは持たず、出題カタログには含めない。実際の問題へ入れるときはcontent.attributionとquestionの版・出典・条件の管理下へ置く。文書サイトではJSONの読み取り専用表示だけを行い、KaTeXを実行しない。既存の独自問題はformat省略のUnicode例として維持する。

[稼働率の分数](/data/formulas/availability.json)、[行列](/data/formulas/matrix.json)。

<<< @/public/data/formulas/availability.json

<<< @/public/data/formulas/matrix.json

## 不正例

元の有効データを複製し、次のJSONに記録した差分を適用した候補を検証する。巨大な不正ファイルのコピーを作らず、検証対象・変更パス・値・期待コードを正本にする。これらは配布カタログへ含めない。

[不正例の定義](/data/invalid/cases.json)。`npm run doc:validate` は全51例について「検証に失敗した」だけでなく期待した検証コードで拒否されたことを確認する。改変フラグの欠落・型違い、元データhash欠落・不一致、出題方式・バインド実施記録の不一致、比較対象の参照欠落、バインド後の改変表示不一致、出題時の不一致、図のコード混入・参照切れ、入力域逸脱、生成元・所有者・内容hash・結果参照の不一致も含む。数式は未知format、alt欠落、リンク・マクロ命令、区切り、括弧・環境不一致、環境の入れ子、行列上限逸脱を拒否する。

<<< @/public/data/invalid/cases.json

不正例の手順は検証用に限定し、利用者が実行するデータ編集機能を本体に追加しない。
