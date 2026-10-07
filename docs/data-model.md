# データモデルと参照整合性

## DATA-01 — 分離と関連

本システムではUTF-8のJSONを交換・保存の基本とし、JSON Schema Draft 2020-12で構造を定義する。任意HTMLやMarkdownを問題本文として実行しない。[本文形式](/content-format)を使用する。

| レコード | 責務 | 主な参照先 |
| --- | --- | --- |
| `source` | 資料の発行主体・日付・公開確認・URL・調査範囲 | URLは表示用。取得処理を起動しない |
| `rights` | 権利者・根拠・用途別判断・表示条件・第三者確認 | `evidence[].sourceId` → source、`thirdParty.rightsRefs` → rights |
| `asset` | ローカル画像と代替文・出典・権利・hash | `attribution.sourceRefs` → source、`rightsRefs` → rights |
| `question` | 1設問の本文・選択肢・正答・解説と改訂 | source、rights、asset、actor、派生元question |
| `diagram` | question内の図ブロック。配列・ノード・辺・代替文・素材条件 | 版付きrendererRef、source、rights。実行コードは保持しない |
| `template` | 基準問題、入力域、基準パラメータ、バインド前の元データ保持と出題経路、生成契約 | baseQuestionRef、版付きgeneratorRef、source、rights |
| `instance` | 一体で確定した生成済みquestionとパラメータ・版・内容hash | 所有session、templateRef、baseQuestionRef |
| `set` | 科目別の問題群と開始可能な設定 | questionRefs、examConfigRefs、generationBindings → template |
| `exam` | FE科目・モード・時間・問数・順序・不足時の動作 | 配布上独立した設定。特定問題の状態は持たない |
| `catalog` | 許可されたファイル・hash・作成主体・版 | source／rights／asset／question／set／exam／templateのファイル |
| `session` | 出題順・解答・見直し・状態と出題時の改変情報 | catalogの固定snapshot、set、exam、question、所有instance |
| `result` | 終了時点の学習指標と各問の結果 | session ID・保存版、当時のquestion改訂・instance ID |

配布レコードの参照は同じカタログ内、instanceの参照は所有セッションの保存集合内で解決する。IDを見つけるために外部ネットワークを検索しない。問題のファイル内にユーザーの解答を格納せず、セッションの `entries` に分離する。

## ID・版・省略の規則

交換レコードの `schemaVersion` は `3.0.0`。diagram・formulaはquestionに含まれる共有ブロック型で、単体の説明用例にも同じ型を使う。問題・セット・試験設定・テンプレートは `id + revision` を不変キーにする。改訂は1以上の整数で、新版を出しても旧版の同じキーの内容を上書きしない。出典・権利・アセット・instanceは不変IDとし、条件・内容変更時に新IDを発行する。カタログはID・改訂・各ファイルhashで固定する。旧版からの扱いは[生成仕様の版管理](/diagram-generation)に従う。

全オブジェクトは未知フィールドを拒否し、全フィールドで `null` を使わない。任意の情報は存在しないとき省略する。formula.formatの省略だけは後方互換のためunicodeと解釈する明示的な例外とする。空配列は「要素なし」を意味する。必須情報が欠けたとき推測やデフォルトで補わず拒否する。型・列挙・上限・必須・参照は[全フィールド辞書](/schema-reference)を正本Schemaから生成する。

source・rights・asset・actorのIDは種類ごとにカタログ内で一意にする。選択肢IDとcontext IDは問題の永続ID内の名前空間に属し、別問題に同じ選択肢IDがあっても衝突しない。解答参照は常にquestionRefと組にする。

質問とセットは複数の改訂を保存できるが、1セッションには同じ永続問題IDを2回出さない。ラベル「ア〜コ」は表示時の順序から生成し、正答と利用者の解答は選択肢IDで保存する。元の選択肢順は `choices[]`、実際の順序は `session.entries[].choiceOrder` に保存する。

## DATA-02 — 元資料と学習分類

元資料の識別情報は `sourceRef.locator` に置く。`exam`、西暦 `year`、原表記の `period`、`subject`、`timeSlot`、`questionNumber`、PDFの1始まり `page`、`section` を使用する。記載のない期を「春期」等で補わない。

本アプリの科目は `question.subject=A/B`、学習分野は `learning.area`、検索タグは `learning.tags` に置く。例えば旧制度の午前問題をAの学習へ分類しても、元資料の `timeSlot=午前` を残す。これは構造の説明であり、今回、架空の旧問番号を実在するIPA問題として登録していない。

出典URL・正式名・発行主体・確認日はsourceへ集約する。問題の位置は各sourceRefに持たせ、同じ資料を参照する部品でも正答冊子と問題冊子を取り違えない。解説の `origin=original` は問題文が `official` であることと両立する。

## 問題内の関係

`contexts[]` は長文等の本文に問題内IDを付ける。`contextRefs[]` は当該設問が使用する本文IDで、存在するcontextと一致させる。初期版では1問題=1解答の単一選択で、複数解答欄を暗黙追加しない。

複数の設問が同じ長文を使う場合は、各question改訂に共通本文を明示的に収め、それぞれに元出典と問・枝番を記録する。共通本文だけを後から差し替えて過去の別設問が変化する構成にしない。複数設問・部分点・複数選択の解答形式は初期版対象外とする。

`assetRefs` は全context・prompt・choices・explanationのimageブロックが使用したIDの集合と一致させる。不要なアセットを勝手に読み込まない。本文の正本はJSONにあり、ページ掲載時はファイルのスニペットを参照する。

diagramは画像ファイルではないためassetRefsへ入れず、diagram.attributionに素材条件を保持する。isModified／modificationBasis／changesの対応、template・instance・出題時のissuedContentの関係は[図描画・問題生成・改変記録](/diagram-generation)を正本とする。

## Schema以外で検証すること

| 規則 | 拒否対象・参照 |
| --- | --- |
| ID一意性 | 同じ種類で不変キー重複、選択肢・context・actorのID重複 |
| 出典・条件 | 全source／rights参照を解決。公式部品にsourceが必要。用途未確認と第三者未解決は配布不可 |
| 正答ID | `correctAnswer.choiceId` が当該問題のchoicesに存在しなければ拒否 |
| 派生 | 元問題のID・改訂を解決し、自己参照・循環を拒否。原資料の参照URL・箇所を解決できることを確認する |
| 表・図 | 表の列数一致、assetRefs一致、ファイル存在・hash・MIME署名・寸法を確認 |
| セット | 科目一致、全問参照を解決、配布対象セットへdocs_only／excludedを混入させない |
| セッション | 基準問題はセット内。lineage_uniqueは同一ID・派生系列を重複させず、instance_uniqueは全枠生成・同テンプレートの同じ入力を重複させない。選択肢順に過不足なく解答IDが存在 |
| モード・時刻 | 時間制限・一時停止・終端時刻・保存期限・状態を照合 |
| 結果 | 当時のsession保存版と問題順を参照し、記録済み件数・割合の算術整合を確認 |
| カタログ | manifestのhashとファイルの一致、保存snapshotの版・hash一致 |
| 数式 | latexの許可命令、禁止文字、括弧・環境の対応・上限を静的に検証。実際のKaTeX構文解析・組版は本体準備時に別途行う |
| 図 | rendererの登録、図・ノード・辺IDの一意性、添字順、辺の端点、フローチャートの構造 |
| 生成 | 入力域、基準問題・テンプレート・モジュール版・所有sessionの対応、出典と権利の継承、保存したquestionの内容hash |
| 出題経路・改変表示 | 元データhash、bindingModeとbindingPerformed・instance有無の対応、バインド済みのtrue、元データの既存表示維持、issuedContentの内容一致。テキスト・図・値の差から判定しない |

詳細な検証コード名と不正例は[受入条件](/acceptance)を参照する。画像の完全なデコードや内容の正答・法的確認は機械的参照検証の成功と別工程である。今回の検証スクリプトはCBTの採点を実装せず、記録済み結果の整合だけを検査する。

## 配布と保存のカタログ

`catalog.files` は種類別の `{path, sha256}` 配列である。hashは元JSONファイルのバイト列に対するSHA-256で、空白の変更も検出する。各ファイルを確定してからカタログを作成し、そのカタログ自身のhashをsessionへ記録する。sessionとresultはカタログに含めず、hashの循環を作らない。

ここで検出するのは確定済みファイルとの不一致であり、公式問題に「改変あり」と表示すべきかの判定ではない。原問との差を確認する情報とhashの用途は[内容hashの意図](/diagram-generation#内容hash・版・現在の検証範囲)で区別する。withdrawalsは[保存済み資源への停止通知](/maintenance)であり、撤回した本文の公開履歴ではない。

セッション開始では、参照するレコード・画像をIndexedDBのsnapshotへ保存し、hashの一致を確認してからrunningへ遷移する。取得済みの旧カタログを失った場合に最新版の同じIDで代替して採点しない。[保守](/maintenance)を参照する。

## 交換仕様3.0.0の範囲

3.0.0ではtemplate.originalContentSha256とbindingBasis、session.bindingMode、issuedContent.bindingPerformed、instance.bindingPerformedを必須として定義する。バインド前の元データを不変questionとsnapshotで保持し、元データ使用又は値の生成・バインドの経路から出題時の改変表示を確定する。必須項目を追加したためメジャー版を上げ、初期の本体読込みは3.0.0だけに対応する。2.1.0以前は元Schemaの登録又は明示的な移行を別途定義・検証し、実施経緯を推定で補わない。制限付きLaTeXの形式は維持する。

今回の文書用例は配布済み本体・実利用者データではないため、交換レコードを3.0.0、catalog.revision=4で固定し、ファイルhash・元データ内容hash・instance内容hash・出題時内容hashを更新する。同じ基準問題を元データで使う例と生成値で使う例を分けて示す。公式問題の収録は増やさず、実利用者の過去セッションを移行した事実として扱わない。

## 全問対応宣言と図プロファイル

catalog.generationCoverageは任意でcomplete又はpartialを持つ。completeは配布に含まれる公式再録の全問に、直接派生した基準問題の有効なテンプレートと科目別ミックス枠が一つずつ対応するという宣言である。省略時は旧データとして部分対応を許可する。completeでも非公開問題・除外資源の対応、法的適合、正答の真実性を保証しない。

diagram.scene.kind=source_figureではprofileと整数valuesを持ち、登録renderer-source-figures@1.0.0の位置別契約に解決する。ノードID・任意座標・コードをこの型に混ぜない。登録域はsrc/core/source-figure-domains.jsonを正本とし、本体・文書検証・対応一覧で同じファイルを使う。汎用sceneのノード・辺参照とは別の検査である。

setのquestionRefs・generationBindingsは候補の集合であり、現在A80・B23の全系列を持つ。generationBindingsの最大500は候補数の上限で、exam.questionCountの科目別60／20上限や各開始設定の件数を引き上げない。
