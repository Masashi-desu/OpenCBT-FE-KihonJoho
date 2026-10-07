# JSON Schema

## 正本と参照方法

Schemaの正本は `docs/public/schemas/` の14ファイルである。交換仕様は3.0.0、JSON Schema Draft 2020-12を使用し、Ajvの2020実装・format検証で検証する。`$id` の `opencbt-fe-kihonjoho.example` はスキーマ識別用の予約ドメインで、公開されたサーバではない。検証時は全Schemaをローカル登録し、ネットワークから取得しない。

全フィールドの意味・必須／任意・列挙・制約・参照は[自動生成フィールド辞書](/schema-reference)へ掲載する。各JSONは以下のリンクで閲覧・保存できる。下のコード表示も元ファイルを直接参照し、二重に手書きしない。

| Schema | 対象 |
| --- | --- |
| [common.schema.json](/schemas/common.schema.json) | ID、sourceRef、actor、部品の帰属、本文ブロック |
| [formula.schema.json](/schemas/formula.schema.json) | 制限付きLaTeX又はUnicodeの数式ブロック・許可命令 |
| [diagram.schema.json](/schemas/diagram.schema.json) | 管理された描画器へ渡す図ブロック、配列・ノード・辺 |
| [template.schema.json](/schemas/template.schema.json) | 生成契約、基準問題、入力域、出典・条件 |
| [instance.schema.json](/schemas/instance.schema.json) | 保存した生成済み出題内容、パラメータ・版・所有者・内容hash |
| [source.schema.json](/schemas/source.schema.json) | 出典資料と確認範囲 |
| [rights.schema.json](/schemas/rights.schema.json) | 利用根拠・用途・第三者素材 |
| [asset.schema.json](/schemas/asset.schema.json) | 画像ファイル・hash・代替文 |
| [question.schema.json](/schemas/question.schema.json) | 問題・改訂・出自・正答・解説 |
| [set.schema.json](/schemas/set.schema.json) | 問題セット |
| [exam.schema.json](/schemas/exam.schema.json) | FE設定 |
| [catalog.schema.json](/schemas/catalog.schema.json) | 許可リスト・hash・取り下げ通知 |
| [session.schema.json](/schemas/session.schema.json) | 解答セッション |
| [result.schema.json](/schemas/result.schema.json) | 学習結果 |

## 問題Schema

`question` の内容は共有content型を参照し、出自に応じて出典・派生元・作成経緯を必須にする。origin.isModifiedとmodificationBasisは全問題で必須。正答IDが本当にchoicesに存在すること、出典・アセットの参照解決、元データの保持と出題経路・改変表示・保存内容の対応等は[別の整合性検証](/acceptance)で確認する。

changesのsummary／detailsは出題時に表示できる変更説明、任意のanswerDetailsは正答を含む変更詳細とし、[表示条件](/attribution)を分ける。

<<< @/public/schemas/question.schema.json

## FE設定Schema

科目とモードで問題数・制限時間・Bの分野内訳を拘束する。時間制限なしstudyでは `timeLimitSeconds` を省略する。設定が正しくても、セットの問題数・派生系列・分野を満たさなければ開始しない。

<<< @/public/schemas/exam.schema.json

## セッションSchema

省略は未解答・未開始・非該当の状態を表す。`null` を混ぜない。モードや参照先によって決まる条件は[セッション仕様](/sessions)と別の検証規則に従う。

<<< @/public/schemas/session.schema.json

## 図・生成のSchema

型・列挙・上限は[全フィールド辞書](/schema-reference)、生成契約と出題時の対応は[図描画・問題生成](/diagram-generation)に従う。初期契約のparametersは整数配列valuesだけを許可し、任意コード・式・未知パラメータを拒否する。

<<< @/public/schemas/diagram.schema.json

<<< @/public/schemas/template.schema.json

<<< @/public/schemas/instance.schema.json

## 数式Schema

formatは任意で、省略時だけunicodeとする。latexの許可命令・括弧・環境・行列上限は別の入力検証で確認する。Schema成功だけでKaTeXの組版成功や式の意味を保証しない。[本文仕様](/content-format)に従う。

<<< @/public/schemas/formula.schema.json
