# 全フィールド辞書

このページは `docs/public/schemas/*.schema.json` から自動生成する。**意味**は何を表し何に使うか、**欠落時の扱い**は省略した場合の解釈と拒否条件を説明する。文字数・型・列挙値等は別の列へ記載する。元Schemaの `description` と `$comment` がそれぞれの正本であり、このページを直接編集しない。表は横にスクロールでき、狭い画面でも読みたい列へ移動して確認できる。

## 共通の欠落規則

未知フィールドと `null` は全オブジェクトで拒否する。必須の欠落は拒否し、既定値や参照先の情報で補完しない。空配列・空文字・0・falseは省略と区別する。任意項目でも適用条件を満たす場合は必須となり、条件は各行の欠落欄、元Schemaの条件付き制約及び[参照整合性規則](/data-model)に従う。formula.formatの省略をunicodeと解釈する規則だけを明示的な初期値の例外とする。

子フィールドの必須性は親オブジェクト又は該当する種類のブロックが存在する場合に適用する。配列要素を掲載した行は要素の意味であり、配列全体の必須性・空配列の可否は親の行に従う。$ref型の子フィールドは共有型又は参照Schemaの節で定義し、参照元の意味に指定したレコード種類へ解決する。

固定問題の改変有無は作成時に定義し、出題時は元データ使用又は値の生成・バインドという経路から表示を確定する。バインドした内容は値が基準と同じでも改変あり、元データ使用では既存の改変表示を維持する。テキスト・図・履歴・hashの差から判定せず、経路・必須性・参照・保存内容の整合を検証する。[改変情報の定義](/diagram-generation)を参照する。

<div class="schema-field-dictionary">

## 画像アセット（asset）

[元Schema](/schemas/asset.schema.json)。ローカル画像と代替説明・出典・条件を一つの不変素材として管理する。画像の実体はpathに示す別ファイルとし、問題の本文と条件を分離する。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 画像ファイルとその出典・条件をまとめた素材を識別する。image.assetIdとquestion.assetRefsの参照先となり、画像又は条件を変える場合は別IDを発行する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `path` | この素材の画像を配布物内から読み込むための相対位置。外部画像への通信や任意ファイルへのアクセスを要求するものではない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^assets/[a-z0-9-]+\\.(png&#124;jpg&#124;webp)$" |
| `mediaType` | 画像として許可する形式を示し、拡張子とファイルの署名との照合に使用する。宣言だけで安全な画像と判断しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["image/png","image/jpeg","image/webp"] |
| `sha256` | 取得した画像がカタログに固定した素材と同じバイト列かを確認する照合値。出典の正当性や公式素材からの改変有無を示す値ではない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `width` | 画像の元の横方向の画素数。サイズ制限の検証と表示領域の準備に使い、画面上の固定表示幅を指定するものではない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=4096 |
| `height` | 画像の元の縦方向の画素数。元ファイルの寸法と照合し、表示前に縦横比を確定するために使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=4096 |
| `byteLength` | 元画像ファイルの容量。取得したバイト数との一致と読込み上限を確認し、過大な素材を表示準備へ進めないために使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=2097152 |
| `alt` | 画像が見えなくても問題に必要な情報を理解できる代替説明。imageブロックから参照し、問題の解答を意図せず明かさない内容にする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=2000 |
| `attribution` | 画像そのものの作成主体・出典・条件。問題文や描画コードの条件を代用せず、図の直下と復習画面の素材表示に使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/attribution | additionalProperties=false |

## カタログと配布境界（catalog）

[元Schema](/schemas/catalog.schema.json)。読込みを許可する交換ファイルと公開主体・停止通知の集合。カタログの固定内容から参照を解決し、未確認のファイルを自動発見して配布へ加えない。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 一つの許可ファイル集合を識別する永続ID。session.snapshotから改訂・hashと共に参照し、保存済みの出題定義を特定する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `revision` | 配布するファイルと停止通知を固定したカタログ改訂。構成変更時に増やし、過去snapshotの同じ改訂を上書きしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |
| `scope` | カタログを説明用のdocs_fixture又は本体配布用distributionとして使う区分。文書例を本体の問題集へ混入させない入口条件にする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["docs_fixture","distribution"] |
| `actors` | 資料発行・作成・編集・確認に関わる公開主体の台帳。部品や履歴のactor IDから表示名と主体種別を解決する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=100 / uniqueItems=true |
| `actors[]` | 「actors」に記録する一つの要素。資料発行・作成・編集・確認に関わる公開主体の台帳。部品や履歴のactor IDから表示名と主体種別を解決する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object / common.schema.json#/$defs/actor | additionalProperties=false |
| `files` | 本システムが読込みを許可する交換ファイルの集合。種類別に相対パスとhashを固定し、列挙されていないファイルを探索して補わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `files.sources` | このカタログが読込みを許可する出典資料レコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 / uniqueItems=true |
| `files.sources[]` | 「files.sources」に記録する一つの要素。このカタログが読込みを許可する出典資料レコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `files.sources[].path` | 許可する出典資料JSONの配布物内の相対位置。種類のディレクトリに限定し、ネットワークURLやディレクトリ外の探索へ使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^(sources&#124;rights&#124;assets&#124;questions&#124;sets&#124;exams&#124;templates)/[a-z0-9-]+\\.json$" |
| `files.sources[].sha256` | 指定した出典資料ファイルのバイト列を固定する照合値。空白変更も不一致として検出し、原資料からの改変有無や権利判断には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `files.rights` | このカタログが読込みを許可する利用条件レコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 / uniqueItems=true |
| `files.rights[]` | 「files.rights」に記録する一つの要素。このカタログが読込みを許可する利用条件レコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `files.rights[].path` | 許可する利用条件JSONの配布物内の相対位置。種類のディレクトリに限定し、ネットワークURLやディレクトリ外の探索へ使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^(sources&#124;rights&#124;assets&#124;questions&#124;sets&#124;exams&#124;templates)/[a-z0-9-]+\\.json$" |
| `files.rights[].sha256` | 指定した利用条件ファイルのバイト列を固定する照合値。空白変更も不一致として検出し、原資料からの改変有無や権利判断には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `files.assets` | このカタログが読込みを許可する画像素材のメタデータレコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 / uniqueItems=true |
| `files.assets[]` | 「files.assets」に記録する一つの要素。このカタログが読込みを許可する画像素材のメタデータレコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `files.assets[].path` | 許可する画像素材のメタデータJSONの配布物内の相対位置。種類のディレクトリに限定し、ネットワークURLやディレクトリ外の探索へ使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^(sources&#124;rights&#124;assets&#124;questions&#124;sets&#124;exams&#124;templates)/[a-z0-9-]+\\.json$" |
| `files.assets[].sha256` | 指定した画像素材のメタデータファイルのバイト列を固定する照合値。空白変更も不一致として検出し、原資料からの改変有無や権利判断には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `files.questions` | このカタログが読込みを許可する問題レコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 / uniqueItems=true |
| `files.questions[]` | 「files.questions」に記録する一つの要素。このカタログが読込みを許可する問題レコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `files.questions[].path` | 許可する問題JSONの配布物内の相対位置。種類のディレクトリに限定し、ネットワークURLやディレクトリ外の探索へ使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^(sources&#124;rights&#124;assets&#124;questions&#124;sets&#124;exams&#124;templates)/[a-z0-9-]+\\.json$" |
| `files.questions[].sha256` | 指定した問題ファイルのバイト列を固定する照合値。空白変更も不一致として検出し、原資料からの改変有無や権利判断には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `files.sets` | このカタログが読込みを許可する問題セットレコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 / uniqueItems=true |
| `files.sets[]` | 「files.sets」に記録する一つの要素。このカタログが読込みを許可する問題セットレコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `files.sets[].path` | 許可する問題セットJSONの配布物内の相対位置。種類のディレクトリに限定し、ネットワークURLやディレクトリ外の探索へ使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^(sources&#124;rights&#124;assets&#124;questions&#124;sets&#124;exams&#124;templates)/[a-z0-9-]+\\.json$" |
| `files.sets[].sha256` | 指定した問題セットファイルのバイト列を固定する照合値。空白変更も不一致として検出し、原資料からの改変有無や権利判断には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `files.exams` | このカタログが読込みを許可する試験設定レコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 / uniqueItems=true |
| `files.exams[]` | 「files.exams」に記録する一つの要素。このカタログが読込みを許可する試験設定レコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `files.exams[].path` | 許可する試験設定JSONの配布物内の相対位置。種類のディレクトリに限定し、ネットワークURLやディレクトリ外の探索へ使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^(sources&#124;rights&#124;assets&#124;questions&#124;sets&#124;exams&#124;templates)/[a-z0-9-]+\\.json$" |
| `files.exams[].sha256` | 指定した試験設定ファイルのバイト列を固定する照合値。空白変更も不一致として検出し、原資料からの改変有無や権利判断には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `files.templates` | このカタログが読込みを許可する生成テンプレートレコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 / uniqueItems=true |
| `files.templates[]` | 「files.templates」に記録する一つの要素。このカタログが読込みを許可する生成テンプレートレコードのファイル一覧。列挙したファイルだけを同じカタログ内の参照解決に使用する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `files.templates[].path` | 許可する生成テンプレートJSONの配布物内の相対位置。種類のディレクトリに限定し、ネットワークURLやディレクトリ外の探索へ使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^(sources&#124;rights&#124;assets&#124;questions&#124;sets&#124;exams&#124;templates)/[a-z0-9-]+\\.json$" |
| `files.templates[].sha256` | 指定した生成テンプレートファイルのバイト列を固定する照合値。空白変更も不一致として検出し、原資料からの改変有無や権利判断には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `withdrawals` | 保存済み問題の使用停止を伝える通知。本文や撤回素材の公開履歴ではなく、対象の識別情報と公開可能な説明だけを保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 |
| `withdrawals[]` | 「withdrawals」に記録する一つの要素。保存済み問題の使用停止を伝える通知。本文や撤回素材の公開履歴ではなく、対象の識別情報と公開可能な説明だけを保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `withdrawals[].questionRef` | 新規使用と保存内容の再表示を止める対象問題の不変参照。現行カタログから除いた問題も識別し、対象本文を再録する必要はない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `withdrawals[].category` | 停止理由を正答訂正、権利者要請、条件変更、資料利用不能として区別する。画面操作ではなく保守工程が判断した資源の通知に使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["answer_correction","rights_request","conditions_changed","source_unavailable"] |
| `withdrawals[].reason` | 利用者に公開できる停止理由の説明。対象本文・第三者素材・非公開の連絡を含めず、資源の公開可否をSchemaが判定する値でもない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=1000 |
| `withdrawals[].recordedOn` | 停止通知を記録した日付。クライアントの保存内容と保守の対応を追跡し、非公開のやり取りの全文履歴は残さない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date" |
| `withdrawals[].replacement` | 条件を満たして利用できる差替え問題の不変参照。利用者に次の学習対象を案内するために使い、過去の解答や結果を自動置換しない。 | 任意 | 差替えがない場合は省略する。最新版の同じIDを自動的に代用しない。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `generationCoverage` | 配布対象の公式問題を全て、検証済みの生成テンプレートへ一対一で関連付ける契約。completeの場合は件数を信頼せず、各原問題・基準問題・テンプレート・セットの対応を検査する。除外した素材や非公開問題まで含める意味ではない。 | 任意 | 任意：省略時はpartialとして扱い、旧保存カタログとの互換を維持する。nullを拒否する。 | string | enum=["complete","partial"] |

## 共有型と本文構造（common）

[元Schema](/schemas/common.schema.json)。各レコードで同じ意味を持つ参照・主体・本文構造の共有定義。参照元のフィールドがどのレコードを対象とするかは各フィールドの意味で指定する。

### id

**意味：** 各レコード又は問題内要素を継続して識別するための共通型。表示名・順序・URLとは区別し、具体的な名前空間と参照先は使用フィールドの意味に従う。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** string。pattern="^[a-z][a-z0-9-]{2,79}$"。

### schemaVersion

**意味：** このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** string。const="3.0.0"。

### questionRef

**意味：** 問題の永続IDと内容を固定した改訂の組。表示・正答・条件が同じ不変定義へ到達するために使い、最新版への暗黙追従を行わない。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `questionRef.questionId` | 参照する問題の永続ID。revisionと組にして不変の問題定義を特定し、画面の問順や原資料の問番号とは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `questionRef.revision` | 参照先問題の内容・出典・条件を固定した改訂。最新版へ自動追従せず、当時の問題を説明できるようにする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |

### entityRef

**意味：** セット・試験設定・テンプレートを不変IDと改訂で参照する組。参照元で指定したレコード種類の中だけで解決する。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `entityRef.id` | 参照元フィールドが指定する種類のセット・設定・テンプレートの永続ID。異なる種類の同名IDへ自動的に探索範囲を広げない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `entityRef.revision` | 参照先のセット・設定・テンプレートを固定した改訂。idと組にして契約や候補を特定し、最新版を暗黙に選ばない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |

### locator

**意味：** 原資料のどの箇所を照合すればよいかを表す位置情報。旧制度の表記を維持し、本アプリの学習分類から補わない。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `locator.exam` | 原資料に記載された試験区分。FE・SG等の資料の適用対象を保持し、本アプリの科目選択から推定して書き換えない。 | 任意 | 原資料に記載がなく確認できなければ省略する。本アプリの設定から補わない。 | string | minLength=1 / maxLength=100 |
| `locator.year` | 原資料が対象とする西暦年度。公開日・閲覧日とは区別し、どの年度の問題かを原本リンクと合わせて特定する。 | 任意 | 原資料の対象年度を確認できなければ省略する。公開日の年で代用しない。 | integer | minimum=1900 / maximum=2200 |
| `locator.period` | 原資料の春期・秋期・上期・下期等の期の表記。制度や年度に依存する識別情報として保持する。 | 任意 | 記載のない通年資料等では省略し、春期等を推定で加えない。 | string | minLength=1 / maxLength=100 |
| `locator.subject` | 原資料に記載された科目名。問題の本アプリ内分類subjectとは分け、旧制度の資料の表記を保存する。 | 任意 | 原資料に科目表記がなければ省略する。本アプリのA／Bを逆輸入しない。 | string | minLength=1 / maxLength=100 |
| `locator.timeSlot` | 原資料の午前・午後等の時間区分。旧問題を現在の学習へ分類しても原表記を残し、出典の誤記を防ぐ。 | 任意 | 原資料に時間区分がなければ省略し、科目A／Bを代用しない。 | string | minLength=1 / maxLength=100 |
| `locator.questionNumber` | 原資料の問番号と必要な枝番。元の設問・解答箇所へ到達するために使い、本アプリ内の出題順とは分ける。 | 任意 | 問題番号を持たない案内・方針資料等では省略する。架空の問番号を付けない。 | string | minLength=1 / maxLength=100 |
| `locator.page` | 原資料PDFの先頭から数えたページ位置。冊子の印刷ページ表記と異なる場合はsectionにも記録し、原本を照合できるようにする。 | 任意 | 固定ページのないWebページ等では省略する。0や閲覧画面の位置で代用しない。 | integer | minimum=1 / maximum=10000 |
| `locator.section` | 原本で照合する節・見出し又は設問の位置の説明。資料URLだけで特定できない参照箇所を識別し、必要なら印刷ページ表記も含める。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=500 |

### sourceRef

**意味：** 資料台帳への参照と、その原資料内で使用した箇所の組。原本リンクと問題・素材・条件ごとの照合に使う。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `sourceRef.sourceId` | 出典又は条件の根拠となるsourceのID。資料名・発行主体・公開URL・確認日を解決し、locatorと組にして原本を追跡する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `sourceRef.locator` | この参照が指す原資料内の位置。資料全体の確認記録sectionsとは分け、問題や部品ごとに参照した箇所を保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `sourceRef.locator.exam` | 原資料に記載された試験区分。FE・SG等の資料の適用対象を保持し、本アプリの科目選択から推定して書き換えない。 | 任意 | 原資料に記載がなく確認できなければ省略する。本アプリの設定から補わない。 | string | minLength=1 / maxLength=100 |
| `sourceRef.locator.year` | 原資料が対象とする西暦年度。公開日・閲覧日とは区別し、どの年度の問題かを原本リンクと合わせて特定する。 | 任意 | 原資料の対象年度を確認できなければ省略する。公開日の年で代用しない。 | integer | minimum=1900 / maximum=2200 |
| `sourceRef.locator.period` | 原資料の春期・秋期・上期・下期等の期の表記。制度や年度に依存する識別情報として保持する。 | 任意 | 記載のない通年資料等では省略し、春期等を推定で加えない。 | string | minLength=1 / maxLength=100 |
| `sourceRef.locator.subject` | 原資料に記載された科目名。問題の本アプリ内分類subjectとは分け、旧制度の資料の表記を保存する。 | 任意 | 原資料に科目表記がなければ省略する。本アプリのA／Bを逆輸入しない。 | string | minLength=1 / maxLength=100 |
| `sourceRef.locator.timeSlot` | 原資料の午前・午後等の時間区分。旧問題を現在の学習へ分類しても原表記を残し、出典の誤記を防ぐ。 | 任意 | 原資料に時間区分がなければ省略し、科目A／Bを代用しない。 | string | minLength=1 / maxLength=100 |
| `sourceRef.locator.questionNumber` | 原資料の問番号と必要な枝番。元の設問・解答箇所へ到達するために使い、本アプリ内の出題順とは分ける。 | 任意 | 問題番号を持たない案内・方針資料等では省略する。架空の問番号を付けない。 | string | minLength=1 / maxLength=100 |
| `sourceRef.locator.page` | 原資料PDFの先頭から数えたページ位置。冊子の印刷ページ表記と異なる場合はsectionにも記録し、原本を照合できるようにする。 | 任意 | 固定ページのないWebページ等では省略する。0や閲覧画面の位置で代用しない。 | integer | minimum=1 / maximum=10000 |
| `sourceRef.locator.section` | 原本で照合する節・見出し又は設問の位置の説明。資料URLだけで特定できない参照箇所を識別し、必要なら印刷ページ表記も含める。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=500 |

### attribution

**意味：** 本文・選択肢・正答・解説・素材ごとに出自、根拠資料、利用条件、作成主体を保持する。問題全体の出自から各部品の由来を推定しない。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `attribution.origin` | この部品が公式由来、公式に依存する改変、独自作成のどれか。問題全体のorigin.kindとは独立し、独自解説を公式作成と誤認させない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["official","adapted","original"] |
| `attribution.sourceRefs` | この部品が依存する資料と位置。出典表示と原本リンクに使い、独立に作った部品は空配列を保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=50 / uniqueItems=true |
| `attribution.sourceRefs[]` | 「attribution.sourceRefs」に記録する一つの要素。この部品が依存する資料と位置。出典表示と原本リンクに使い、独立に作った部品は空配列を保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object / common.schema.json#/$defs/sourceRef | additionalProperties=false |
| `attribution.rightsRefs` | この部品に適用する全てのrightsのID。追加表示と用途別条件を解決し、出典があることだけで利用可と扱わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=200 / uniqueItems=true |
| `attribution.rightsRefs[]` | 「attribution.rightsRefs」に記録する一つの要素。この部品に適用する全てのrightsのID。追加表示と用途別条件を解決し、出典があることだけで利用可と扱わない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `attribution.creatorIds` | この部品を作成したcatalog.actorsのID。公式の主体と独自解説・改変部分の主体を分けて表示し、未特定なら空配列を保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=200 / uniqueItems=true |
| `attribution.creatorIds[]` | 「attribution.creatorIds」に記録する一つの要素。この部品を作成したcatalog.actorsのID。公式の主体と独自解説・改変部分の主体を分けて表示し、未特定なら空配列を保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |

### block

**意味：** 許可した表示要素のいずれか一つを表す構造。文章・見出し・一覧・表・画像・数式・コード・図を明示的に選び、未知要素を実行しない。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** oneOf（種類別）。子構造・種類別定義に従う。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `block{paragraph}.type` | この部品を段落として表示する判別子。許可した固定の描画規則を選び、任意のタグ名やコードを指定させない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="paragraph" |
| `block{paragraph}.text` | 段落に表示する文章。改行を維持したテキストとして表示し、含まれるHTMLやMarkdownの記号を実行・解釈しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=20000 |
| `block{heading}.type` | この部品を問題内の小見出しとして表示する判別子。問題全体の画面タイトルとは別の見出し構造にする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="heading" |
| `block{heading}.level` | 問題本文の中で見出しの階層を示す。長文の構造と読み上げを保ち、見た目の文字サイズだけの指定として使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=2 / maximum=4 |
| `block{heading}.text` | 問題内の見出しとして示す文章。固定の見出し要素へテキストとして挿入し、任意HTMLを表示規則にしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `block{list}.type` | この部品を一覧の項目として表示する判別子。段落とは別に項目のまとまりを保ち、初期版では一階層で扱う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="list" |
| `block{list}.ordered` | 項目の順序を番号付きで示す必要があるか。trueは番号付き、falseは箇条書きにし、いずれもitemsの記録順を保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `block{list}.items` | 箇条書き又は番号付き一覧の各項目。各要素をテキストとして表示し、入れ子のHTMLやリスト構造を持ち込まない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=50 |
| `block{list}.items[]` | 「block{list}.items」に記録する一つの要素。箇条書き又は番号付き一覧の各項目。各要素をテキストとして表示し、入れ子のHTMLやリスト構造を持ち込まない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string | minLength=1 / maxLength=20000 |
| `block{table}.type` | この部品を列見出しのある矩形表として表示する判別子。結合セル等の未知の表構造を暗黙に追加しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="table" |
| `block{table}.caption` | 表全体の内容を識別する表題。読み上げと本文中の対応に使い、権利表示の文面とは分ける。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=300 |
| `block{table}.columns` | 表の各列の見出しを表示順で保持する。rowsのセル数と一致させ、ヘッダーと各値の対応を保つ。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=12 |
| `block{table}.columns[]` | 列の見出し。原資料で左上が空欄の場合は空文字を明示し、行の見出しが並ぶ列として扱う。入力軸と出力軸は入力＼出力などの文字で宣言し、固定描画規則で斜線付き見出しへ対応させる。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string | minLength=0 / maxLength=200 |
| `block{table}.rows` | 表の行を表示順で保持する。各行はcolumnsと同じ列数のセルを持ち、任意HTMLや結合セルを入れない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=100 |
| `block{table}.rows[]` | 表の一行を構成するセルの並び。列見出しと同じ順序・列数を保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | array | minItems=1 / maxItems=12 |
| `block{table}.rows[][]` | この行の一つのセルに表示する内容。対応する列見出しと同じ位置に保持し、空文字は空欄として表示する。列を省略して位置を詰めない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string | minLength=0 / maxLength=2000 |
| `block{image}.type` | 許可した画像素材を表示する判別子。データから外部画像URLを直接読み込むブロックは作らない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="image" |
| `block{image}.assetId` | 表示するassetのID。ファイル・代替文・素材条件を同じ素材レコードから解決し、question.assetRefsにも列挙する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `block{image}.caption` | この使用箇所で画像を説明する文章。asset.altの代替文と素材条件の表示を置き換えず、図の文脈を補う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=500 |
| `block{formula}` | 数式の表示内容と日本語等の代替説明。Unicode又は許可範囲のLaTeXを表示する構造で、計算や任意HTMLの実行を行うデータではない。 | 種類別 | 種類別：このブロック種類を選んだ場合は参照Schemaの必須項目を満たす。別種類の代用や推定変換はしない。 | object / formula.schema.json | additionalProperties=false |
| `block{code}.type` | コード又は疑似言語を表示専用として扱う判別子。実行・コンパイル・式評価の機能へ接続しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="code" |
| `block{code}.language` | 表示しているコードの言語区分。疑似言語・通常テキスト・SQLの表示を識別し、実行方法や外部モジュールを指定しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["pseudocode","text","sql"] |
| `block{code}.text` | 空白・改行・インデントを含めて表示するコード本文。解答に必要な構造を保ち、ブラウザで実行しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=20000 |
| `block{diagram}` | 管理された描画器へ渡す表示専用の図構造。図素材の出典・条件を保持し、任意コード、解答操作、経路実行をデータに含めない。 | 種類別 | 種類別：このブロック種類を選んだ場合は参照Schemaの必須項目を満たす。別種類の代用や推定変換はしない。 | object / diagram.schema.json | additionalProperties=false |

### content

**意味：** 表示順を持つブロック群と、その部品の出典・条件の組。問題文、選択肢、長文、解説それぞれへ別に設定できる。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `content.attribution` | この表示部品全体の作成主体・出典・条件。本文、選択肢、解説に別々に設定し、内部の画像・図の追加条件も維持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/attribution | additionalProperties=false |
| `content.blocks` | この部品を構成する文章・表・数式・図等の表示順。許可したブロックへ解決し、順序を変えて内容の対応を壊さない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=100 |
| `content.blocks[]` | 「content.blocks」に記録する一つの要素。この部品を構成する文章・表・数式・図等の表示順。許可したブロックへ解決し、順序を変えて内容の対応を壊さない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | oneOf（種類別） / common.schema.json#/$defs/block | 子構造・種類別定義に従う |

### actor

**意味：** 公開できる主体名と実際の主体種別の台帳項目。担当と素材の作成者をIDから解決し、連絡先等の個人情報は格納しない。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `actor.id` | 作成・編集・確認又は公式発行主体を識別するcatalog.actors内のID。名前が同じ主体の自動統合や連絡先の推定を行わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `actor.name` | 利用者へ公開して表示する主体の名称又は仮名。担当履歴と部品の作成者表示に使い、個人の連絡先を付加しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `actor.kind` | 組織、個人、AIアシスタントのどれを記録したか。AIによる照合を人の確認と説明しないために主体の性質を保つ。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["organization","person","assistant"] |

### moduleRef

**意味：** 開発側が登録した描画器又は生成器の不変ID・版の組。読込み先URLや実行コードを含めず、固定レジストリだけへ解決する。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `moduleRef.id` | 開発側の固定レジストリに登録した描画器又は生成器の識別子。参照元によって役割を限定し、任意のURLや実行コードとして使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `moduleRef.version` | その登録モジュールの挙動を固定した版。完全一致で解決し、過去instanceの生成や図を最新版の挙動へ置換しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[1-9][0-9]*\\.[0-9]+\\.[0-9]+$" |

### parameters

**意味：** 初期の生成契約で本文・図・選択肢・正答・解説が共通に使う入力。許可域はtemplateで絞り、回答状態とは分離する。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** object。additionalProperties=false。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `parameters.values` | 本文・表・図・正答・解説を整合させるために共通で使う配列入力。テンプレートの許可域を別途検証し、ユーザーの解答から値を変更しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=50 |
| `parameters.values[]` | 「parameters.values」に記録する一つの要素。本文・表・図・正答・解説を整合させるために共通で使う配列入力。テンプレートの許可域を別途検証し、ユーザーの解答から値を変更しない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | integer | minimum=-1000000 / maximum=1000000 |

## 管理された図データ（diagram）

[元Schema](/schemas/diagram.schema.json)。管理された描画器へ渡す表示専用の図構造。図素材の出典・条件を保持し、任意コード、解答操作、経路実行をデータに含めない。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `type` | この部品を管理された描画器による図として扱う判別子。問題データにHTML・CSS・JSを持ち込むことを許可する値ではない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="diagram" |
| `id` | 問題内のこの図ブロックを識別するID。複数の図の対応や由来を維持し、図のノード・辺のIDとは別の範囲で一意にする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `rendererRef` | 開発側で管理する図描画器のID・版。sceneを表示専用として描画する固定契約へ解決し、正答計算やネットワークへ接続しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/moduleRef | additionalProperties=false |
| `caption` | 図の内容を識別する図題。原問題に図題があれば図に対応して表示する。図題のないアローダイアグラムではSVGの読み上げ用タイトルとして使い、画面へ新たな見出しを追加しない。素材の権利表示とは別に扱う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=300 |
| `alt` | 図が見えなくても設問に必要な構造を理解できる代替説明。読み上げ用のaria-label又はSVGのdescとして保持し、通常の出題画面には説明文や補助表として追加しない。正答や解法は含めない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=2000 |
| `attribution` | 図の構造・ラベル等の素材そのものの出自と条件。描画コードのライセンスとは分け、図の直下と復習画面に表示する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/attribution | additionalProperties=false |
| `scene` | 配列、フローチャート、グラフ又は登録した原形式図プロファイルの構造。許可した値だけで構成し、コード・スタイル・イベントを含めない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | oneOf（種類別） | 子構造・種類別定義に従う |
| `scene{array}.kind` | 配列の添字と値をセルで示す図の種類。図を実行する命令や利用者の解答欄を表すものではない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="array" |
| `scene{array}.cells` | 表示順に並んだ配列セル。各添字と値を図と読み上げ用説明へ共通で表示し、添字が連続することを確認する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=50 |
| `scene{array}.cells[]` | 「scene{array}.cells」に記録する一つの要素。表示順に並んだ配列セル。各添字と値を図と読み上げ用説明へ共通で表示し、添字が連続することを確認する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `scene{array}.cells[].id` | この配列図内のセルを識別するID。値や添字が同じでも内容対応を維持し、図内で重複しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{array}.cells[].index` | セルに表示する1始まりの配列添字。cellsの順序と一致させ、プログラミング上の表示と読み上げ用説明の対応を保つ。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=50 |
| `scene{array}.cells[].value` | セルに表示する入力値。生成問題では共通parametersと一致させ、図だけに異なる値を抽選しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=-1000000 / maximum=1000000 |
| `scene{flowchart}.kind` | フローチャートのノードと辺を表示する種類。接続の意味を固定の描画規則へ対応させ、経路をブラウザで実行しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="flowchart" |
| `scene{flowchart}.nodes` | フローチャート内の処理又は頂点を表す要素。id・ラベル・位置・役割を図と読み上げ用説明に共通で使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=50 |
| `scene{flowchart}.nodes[]` | 「scene{flowchart}.nodes」に記録する一つの要素。フローチャート内の処理又は頂点を表す要素。id・ラベル・位置・役割を図と読み上げ用説明に共通で使う。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `scene{flowchart}.nodes[].id` | この図内でノードを識別するID。辺のfrom／toの参照先として使い、表示ラベルが同じでも別要素を区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{flowchart}.nodes[].label` | ノードが表す処理又は頂点の表示文。固定描画要素へテキストとして挿入し、読み上げ用説明にも同じ文を用いる。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `scene{flowchart}.nodes[].x` | 固定論理面におけるノード中心の横位置。接続線と配置を決めるために使い、任意CSS文字列や画面の絶対座標にはしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=1000 |
| `scene{flowchart}.nodes[].y` | 固定論理面におけるノード中心の縦位置。xと組にして配置を決め、文字拡大時には同じ構造の図内をスクロールできるようにする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=1000 |
| `scene{flowchart}.nodes[].role` | ノードの図上の役割。フローチャートでは開始・処理・分岐・終了の固定形状を選び、グラフでは頂点として示す。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["start","end","process","decision"] |
| `scene{flowchart}.edges` | フローチャートのノード間の接続。接続先と向き・ラベルを図と読み上げ用説明で一致させ、存在しない端点を拒否する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=100 |
| `scene{flowchart}.edges[]` | 「scene{flowchart}.edges」に記録する一つの要素。フローチャートのノード間の接続。接続先と向き・ラベルを図と読み上げ用説明で一致させ、存在しない端点を拒否する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `scene{flowchart}.edges[].id` | この図内の接続を識別するID。端点とラベルの対応を保ち、同じ辺IDを複数の接続へ割り当てない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{flowchart}.edges[].from` | 接続の起点となる同じscene内のノードID。toと組にして描画と読み上げ用説明の接続を定義する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{flowchart}.edges[].to` | 接続の終点となる同じscene内のノードID。起点とは別の存在するノードへ解決し、参照切れを表示前に拒否する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{flowchart}.edges[].label` | この接続の条件又は関係を示す文字。分岐の説明と読み上げ用説明に使い、ラベル不要の場合も空文字で明示する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=0 / maxLength=100 |
| `scene{flowchart}.edges[].directed` | 接続に向きがあるか。フローチャートでは有向を固定し、グラフでは宣言に応じて矢印と読み上げ用説明の方向表示を切り替える。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `scene{graph}.kind` | グラフのノードと辺を表示する種類。接続の意味を固定の描画規則へ対応させ、経路をブラウザで実行しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="graph" |
| `scene{graph}.nodes` | グラフ内の処理又は頂点を表す要素。id・ラベル・位置・役割を図と読み上げ用説明に共通で使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=50 |
| `scene{graph}.nodes[]` | 「scene{graph}.nodes」に記録する一つの要素。グラフ内の処理又は頂点を表す要素。id・ラベル・位置・役割を図と読み上げ用説明に共通で使う。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `scene{graph}.nodes[].id` | この図内でノードを識別するID。辺のfrom／toの参照先として使い、表示ラベルが同じでも別要素を区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{graph}.nodes[].label` | 一般のグラフでは頂点を識別する表示名。専用アローダイアグラムでは内部の節点名として保持し、無記名の円の中には表示しない。読み上げ用説明では図上の位置を用い、内部IDを利用者へ示さない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `scene{graph}.nodes[].x` | 固定論理面におけるノード中心の横位置。接続線と配置を決めるために使い、任意CSS文字列や画面の絶対座標にはしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=1000 |
| `scene{graph}.nodes[].y` | 固定論理面におけるノード中心の縦位置。xと組にして配置を決め、文字拡大時には同じ構造の図内をスクロールできるようにする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=1000 |
| `scene{graph}.nodes[].role` | ノードの図上の役割。フローチャートでは開始・処理・分岐・終了の固定形状を選び、グラフでは頂点として示す。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="vertex" |
| `scene{graph}.edges` | グラフのノード間の接続。接続先と向き・ラベルを図と読み上げ用説明で一致させ、存在しない端点を拒否する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=100 |
| `scene{graph}.edges[]` | 「scene{graph}.edges」に記録する一つの要素。グラフのノード間の接続。接続先と向き・ラベルを図と読み上げ用説明で一致させ、存在しない端点を拒否する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `scene{graph}.edges[].id` | この図内の接続を識別するID。端点とラベルの対応を保ち、同じ辺IDを複数の接続へ割り当てない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{graph}.edges[].from` | 接続の起点となる同じscene内のノードID。toと組にして描画と読み上げ用説明の接続を定義する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{graph}.edges[].to` | 接続の終点となる同じscene内のノードID。起点とは別の存在するノードへ解決し、参照切れを表示前に拒否する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `scene{graph}.edges[].label` | この接続の条件又は関係を示す文字。分岐の説明と読み上げ用説明に使い、ラベル不要の場合も空文字で明示する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=0 / maxLength=100 |
| `scene{graph}.edges[].directed` | 接続に向きがあるか。フローチャートでは有向を固定し、グラフでは宣言に応じて矢印と読み上げ用説明の方向表示を切り替える。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `scene{source_figure}.kind` | 公開原問題の図形式を保つ登録プロファイル。任意SVG・HTML・CSS・JSを格納しない。 | 必須 | 必須：省略を拒否する。 | string | const="source_figure" |
| `scene{source_figure}.profile` | 開発側の固定描画規則の識別子。値の意味・範囲・個数を登録契約で検査する。 | 必須 | 必須：未登録・null・省略を拒否する。 | string | enum=["waf-network","euclid-flow","crash-network","cache-layout","scatter","bst","project-network","logic-circuit","waveform","undirected-graph","adjacency-matrix","stack","linked-arrays","ordered-array","onehot"] |
| `scene{source_figure}.values` | 登録順に図の値と構造を確定する入力列。図単独で再抽選しない。 | 必須 | 必須：個数・範囲を検査する。 | array | minItems=1 / maxItems=50 |
| `scene{source_figure}.values[]` | 登録プロファイルの入力値。実行する命令として解釈しない。 | 配列要素 | 要素：nullや穴を拒否する。 | integer | minimum=-1000000 / maximum=1000000 |

## FE試験設定（exam）

[元Schema](/schemas/exam.schema.json)。科目とモードごとの出題数・時間・順序・不足時動作を固定する。問題の内容やユーザー解答とは独立した不変改訂として参照する。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 科目・モード・出題数・時間等をまとめた試験設定の永続ID。setとsessionからrevisionと組にして参照し、問題データのIDとは分ける。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `revision` | この試験設定の不変改訂。制限時間や順序等を変える場合に増やし、過去セッションを最新設定で説明し直さない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |
| `subject` | この設定で扱う本アプリのFE科目。セットの科目と一致させ、科目Aと科目Bを一つのセッションへ混在させない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["A","B"] |
| `title` | モード選択と開始前説明に表示する設定名。公式の試験実施名と誤認させず、本アプリの練習又は学習用設定と分かる名前にする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `mode` | 制限時間付きで正答を終了後に示すpracticeか、時間制限なく正答表示・一時停止を扱うstudyかを選ぶ。FE本番の追加機能とは説明しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["practice","study"] |
| `questionCount` | 一つのセッションへ固定する出題枠数。年度別では同数の独立系列を必要とする。生成ミックスでは登録テンプレートから同系列の別入力を含めて全枠を生成するため、基準問題の候補数と同じとは限らない。必要な枠数・分野を確保できなければ開始しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=60 |
| `timeLimitSeconds` | practice開始から終了までの制限時間。準備時間を含めず、startedAtと組み合わせて再読込みでも延長しない期限を決める。 | 条件付き | 条件付き：practiceでは必須で欠落を拒否する。studyでは省略し、時間制限を設けない。 | integer | minimum=1 / maximum=7200 |
| `questionOrder` | セットに記録した順序で選ぶか、開始時に順序を抽選するか。確定した出題順をsession.entriesへ保存し、再開時に再抽選しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["set","shuffle"] |
| `choiceOrder` | 元のchoices順を使うか、開始時に順序を抽選するか。choiceShuffleAllowedを尊重し、実際の順序はchoiceOrder配列へ固定する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["fixed","shuffle"] |
| `duplicatePolicy` | 年度別のlineage_uniqueは同じ問題・派生系列を重複させない。生成ミックスのinstance_uniqueは同じ系列の別入力を許可するが、同一テンプレートの同じ入力と表示内容は同じセッションへ重複させない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["lineage_unique","instance_unique"] |
| `shortagePolicy` | 必要な問題数又は分野内訳を満たせない場合の処理。初期版では開始を拒否し、不足したまま短縮して形式練習を始めない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="block" |
| `quotas` | 科目Bのpracticeで必要な分野別枠数。出題候補と確定したセッションの両方でalgorithm／securityの内訳を確認する。 | 条件付き | 条件付き：Bのfull_examでは必須で欠落を拒否する。他の設定では省略し、ミックスの公開部分の内訳は選択時の分野構成で検証する。 | object | additionalProperties=false |
| `quotas.algorithm` | Bの形式練習で必要なアルゴリズム・プログラミング分野の枠数。生成枠も一つの基準問題として数える。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=60 |
| `quotas.security` | Bの形式練習で必要な情報セキュリティ分野の枠数。algorithmとの合計が出題数に対応することを確認する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=60 |
| `practiceScope` | 時間付き練習の問題数・時間の範囲。full_examは本番の問数・時間を使う生成ミックス、public_subsetは年度公開部分又は短い生成練習を扱う。learning_setは旧版・交換用の任意学習セットで、現行メニューに別の独自セットを追加する指定ではない。本番の非公開問題や公式採点を再現しない。 | 任意 | practiceで省略時は既存仕様との互換としてfull_exam。studyでは省略し、時間制限を設けない。 | string | enum=["full_exam","public_subset","learning_set"] |

### 条件付き制約

以下は元Schemaの構造上の条件である。参照先による科目・モード・生成枠の条件は[データモデル](/data-model)と[受入条件](/acceptance)にも従う。改変の意味を判定する規則ではない。

```json
[
  {
    "if": {
      "properties": {
        "mode": {
          "const": "practice"
        }
      },
      "required": [
        "mode"
      ],
      "type": "object"
    },
    "then": {
      "required": [
        "timeLimitSeconds"
      ],
      "type": "object"
    },
    "else": {
      "not": {
        "anyOf": [
          {
            "required": [
              "timeLimitSeconds"
            ],
            "type": "object"
          },
          {
            "required": [
              "quotas"
            ],
            "type": "object"
          },
          {
            "required": [
              "practiceScope"
            ],
            "type": "object"
          }
        ]
      }
    }
  },
  {
    "if": {
      "properties": {
        "mode": {
          "const": "practice"
        },
        "subject": {
          "const": "A"
        },
        "practiceScope": {
          "const": "full_exam"
        }
      },
      "required": [
        "mode",
        "subject"
      ],
      "type": "object"
    },
    "then": {
      "properties": {
        "questionCount": {
          "const": 60
        },
        "timeLimitSeconds": {
          "const": 5400
        }
      },
      "not": {
        "required": [
          "quotas"
        ],
        "type": "object"
      },
      "type": "object"
    }
  },
  {
    "if": {
      "properties": {
        "mode": {
          "const": "practice"
        },
        "subject": {
          "const": "B"
        },
        "practiceScope": {
          "const": "full_exam"
        }
      },
      "required": [
        "mode",
        "subject"
      ],
      "type": "object"
    },
    "then": {
      "required": [
        "quotas"
      ],
      "properties": {
        "questionCount": {
          "const": 20
        },
        "timeLimitSeconds": {
          "const": 6000
        },
        "quotas": {
          "properties": {
            "algorithm": {
              "const": 16
            },
            "security": {
              "const": 4
            }
          },
          "type": "object"
        }
      },
      "type": "object"
    }
  },
  {
    "if": {
      "type": "object",
      "properties": {
        "mode": {
          "const": "study"
        },
        "subject": {
          "const": "B"
        }
      },
      "required": [
        "mode",
        "subject"
      ]
    },
    "then": {
      "type": "object",
      "properties": {
        "questionCount": {
          "type": "integer",
          "maximum": 20
        }
      }
    }
  }
]
```

## 数式ブロック（formula）

[元Schema](/schemas/formula.schema.json)。数式の表示内容と日本語等の代替説明。Unicode又は許可範囲のLaTeXを表示する構造で、計算や任意HTMLの実行を行うデータではない。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `type` | この部品を数式として描画することを示す判別子。文章内の記号を自動探索して数式に変えず、独立した数式ブロックとして扱う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="formula" |
| `format` | textをUnicodeの表示テキストか、制限付きLaTeXかとして読むための指定。許可命令とCDN準備の必要性を切り替える。 | 任意 | 任意：省略は明示的な互換規則としてunicodeと解釈する。latexと推定せず、他のフィールドへこの初期値規則を広げない。 | string | enum=["unicode","latex"] |
| `text` | 利用者に示す数式の表現。formatに対応する表示専用入力として扱い、計算・疑似言語実行・任意HTMLの生成命令として使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=1000 |
| `alt` | 数式の意味を日本語等で読める代替説明。視覚表示と併記し、数式を解釈できない場合も内容へ到達できるようにする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=1000 |

### allowedLatexCommand

**意味：** 数式データの静的検証で許可するLaTeX命令名の集合。問題JSONに自由な命令やマクロを追加させず、描画側の許可範囲もこれに一致させる。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** string。enum=["frac","dfrac","sqrt","log","ln","sin","cos","tan","sum","prod","lim","min","max","times","cdot","div","pm","le","leq","ge","geq","ne","neq","approx","equiv","in","notin","subset","subseteq","supset","supseteq","cup","cap","land","lor","neg","lfloor","rfloor","lceil","rceil","left","right","infty","alpha","beta","gamma","delta","theta","lambda","mu","sigma","pi","omega","mathrm","mathit","mathbf","mathbb","text","operatorname","quad","qquad","begin","end","\\",",",";",":","!","{","}","&#124;"," "]。

### allowedLatexEnvironment

**意味：** 数式データで使用する行列・場合分け・整列の環境名の集合。入れ子等の追加制約は数式検証に従い、任意環境を解釈しない。

**欠落時の扱い：** 共有型の定義自体はデータのフィールドではない。参照元フィールドの必須性・欠落時の扱いを適用する。

**型・制約：** string。enum=["matrix","pmatrix","bmatrix","cases","aligned"]。

### 条件付き制約

以下は元Schemaの構造上の条件である。参照先による科目・モード・生成枠の条件は[データモデル](/data-model)と[受入条件](/acceptance)にも従う。改変の意味を判定する規則ではない。

```json
[
  {
    "if": {
      "properties": {
        "format": {
          "const": "latex"
        }
      },
      "required": [
        "format"
      ]
    },
    "then": {
      "properties": {
        "text": {
          "pattern": "^[\\x20-\\x7e\\t\\r\\n]+$",
          "type": "string"
        }
      }
    }
  }
]
```

## 生成済み出題内容（instance）

[元Schema](/schemas/instance.schema.json)。一つのセッション枠のために確定した生成済み内容。入力と契約の版、完全なquestionを保存し、再開・復習で再抽選や再生成をしない。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 一度確定した生成済み内容を識別するID。所有セッションの生成枠と結果から参照し、生成し直して同じIDの内容を置き換えない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `sessionId` | このinstanceを所有するsessionのID。削除・保存期限・再開を同じ単位で扱い、他のセッションへ所有内容を流用しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `entryIndex` | 所有セッションのどの出題枠に結び付くかを示すentriesの位置。generatedInstanceIdと相互に対応させ、問題IDの代用にはしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=59 |
| `createdAt` | 生成済み内容を確定した時刻。所有セッションの準備中に保存したことを確認し、タイマー開始後に内容を入れ替えないために使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date-time" / pattern="Z$" |
| `templateRef` | この出題内容を作る契約を定義したテンプレートのID・改訂。入力域・作成時の改変宣言と由来を再確認するために固定する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/entityRef | additionalProperties=false |
| `baseQuestionRef` | 生成の基となった不変問題のID・改訂。テンプレートの基準問題と一致させ、instance.questionの派生元からも追跡できるようにする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `generatorRef` | 生成時に使用する登録モジュールのID・版。テンプレートに指定した契約へ一致させ、更新された生成器で過去結果を再生成しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/moduleRef | additionalProperties=false |
| `parameterSelection` | 入力を保存シードから選んだseededか、説明用に明示したexplicitか。explicitは文書用カタログだけで許可し、乱数実行結果と表示しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["seeded","explicit"] |
| `seed` | 入力選択の再現に使う固定シード。パラメータ・本文・正答を保存した後の再開では再抽選せず、生成経緯の説明に使う。 | 条件付き | 条件付き：seededでは必須で欠落を拒否する。explicitでは省略し、実行していない抽選のシードを付けない。 | string | pattern="^[a-f0-9]{32}$" |
| `parameters` | 実際に本文・表・図・選択肢・正答・解説へ使用した入力。テンプレートの域と照合し、部品ごとの抽選で不一致を作らない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/parameters | additionalProperties=false |
| `question` | 実際に出題する完全な問題定義。生成結果の本文・出典・作成時の改変宣言を固定し、回答変更・再開・復習ではこの内容を読む。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / question.schema.json | additionalProperties=false |
| `contentSha256` | 保存したquestion全体をsorted-json-v1で固定する照合値。出題時記録との内容の一致を確認し、原本から改変されたかを判定しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `bindingPerformed` | この保存内容を値の生成・バインドによって確定したことの記録。元データをそのまま使う枠にはinstanceを作らず、元questionの不変参照を使う。 | 必須 | 必須：欠落を拒否する。既定値や推定値で補完しない。 | boolean | const=true |

### 条件付き制約

以下は元Schemaの構造上の条件である。参照先による科目・モード・生成枠の条件は[データモデル](/data-model)と[受入条件](/acceptance)にも従う。改変の意味を判定する規則ではない。

```json
[
  {
    "if": {
      "type": "object",
      "properties": {
        "parameterSelection": {
          "const": "seeded"
        }
      },
      "required": [
        "parameterSelection"
      ],
      "description": "条件"
    },
    "then": {
      "type": "object",
      "required": [
        "seed"
      ]
    },
    "else": {
      "not": {
        "type": "object",
        "required": [
          "seed"
        ]
      }
    }
  }
]
```

## 問題と改訂（question）

[元Schema](/schemas/question.schema.json)。一設問の表示内容、正答、解説、出自と条件を一つの改訂に固定する。ユーザーの解答状態は含めず、sessionが不変参照で結び付く。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 同じ問題を改訂をまたいで識別する永続ID。表示順・元資料の問番号と分け、別問題へ再利用せず、revisionと組にして参照する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `revision` | この問題の内容・出典・条件・正答を一つに固定する改訂。変更時に番号を増やし、過去結果が参照する同じID・改訂の内容を上書きしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |
| `lifecycle` | この問題改訂を新規出題に使用できるかを示す状態。activeでも配布条件の確認が別途必要で、withdrawnの本文を履歴目的で再公開しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["active","withdrawn"] |
| `subject` | 本アプリでA又はBのどちらの学習・出題へ使用するか。原資料の科目表記はsourceRef.locatorへ別に保存し、旧制度の表記を書き換えない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["A","B"] |
| `learning` | 本アプリ内の検索・出題内訳・復習で使用する学習分類。原資料の年度・科目・時間区分から独立して管理する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `learning.area` | 問題の学習分野。Aの分野選択とBのalgorithm／securityの出題内訳に使い、公式資料の元科目名を置き換えるものではない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["technology","management","strategy","algorithm","security"] |
| `learning.tags` | 学習テーマを検索・絞込みする補助語の一覧。公式年度・問番号等の出典識別情報を代用せず、不要なら空配列を保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=30 / uniqueItems=true |
| `learning.tags[]` | 「learning.tags」に記録する一つの要素。学習テーマを検索・絞込みする補助語の一覧。公式年度・問番号等の出典識別情報を代用せず、不要なら空配列を保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string | pattern="^[a-z][a-z0-9-]{1,49}$" |
| `origin` | 問題全体の出自、原資料、派生元、変更履歴と作成時の改変宣言。本文・解説・図等の部品単位のattributionとは役割を分ける。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `origin.kind` | 作成者が原資料との関係を確認して定義する出自区分。公式再録、公式に依存する改変・類題、独自作成を区別し、isModifiedから自動計算しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["official_reprint","official_adaptation","original"] |
| `origin.sourceRefs` | 問題全体が依存する原資料と位置。source.urlへ原本リンクを生成し、公式区分では公式公開問題を確認できる参照を保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=50 / uniqueItems=true |
| `origin.sourceRefs[]` | 「origin.sourceRefs」に記録する一つの要素。問題全体が依存する原資料と位置。source.urlへ原本リンクを生成し、公式区分では公式公開問題を確認できる参照を保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object / common.schema.json#/$defs/sourceRef | additionalProperties=false |
| `origin.derivedFrom` | 本プロジェクト内で派生元となった問題の不変ID・改訂。比較対象と系列を追跡し、循環や同系列の重複出題を防ぐ。独立作成では空配列を保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=20 / uniqueItems=true |
| `origin.derivedFrom[]` | 「origin.derivedFrom」に記録する一つの要素。本プロジェクト内で派生元となった問題の不変ID・改訂。比較対象と系列を追跡し、循環や同系列の重複出題を防ぐ。独立作成では空配列を保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `origin.changes` | 作成者・編集者が記録する変更の経緯。本文以外の図や表、選択肢等も対象にし、種別や件数から改変有無を算出しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=100 |
| `origin.changes[]` | 「origin.changes」に記録する一つの要素。作成者・編集者が記録する変更の経緯。本文以外の図や表、選択肢等も対象にし、種別や件数から改変有無を算出しない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `origin.changes[].at` | 当該変更を記録した時刻。履歴の順序と編集経緯を説明するために使い、セッションで出題した時刻とは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date-time" / pattern="Z$" |
| `origin.changes[].actorId` | 当該変更を行った主体のcatalog.actors ID。自動生成の履歴でも定義した編集主体を保持し、人による編集と偽らない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `origin.changes[].kind` | 作成者が変更を説明するために選んだ種類。転記・レイアウトと本文等の変更を区別する補助情報で、isModifiedの推定規則には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["transcription","layout","wording","numbers","choices","answer","diagram"] |
| `origin.changes[].summary` | 出題時にも見せられる短い変更概要。出典帯とS09で用い、正答を明かす具体値・判断はanswerDetailsへ分離する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=500 |
| `origin.changes[].details` | 原資料とどう異なるかを追跡する、正答を明かさない変更説明。文章・図・表等の変更対象を記録し、S09の詳細表示に使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=2000 |
| `origin.changes[].affectsAnswer` | 変更が正答に影響すると作成者が確認したかの記録。正答再検証の手掛かりとし、履歴の種類やbooleanだけから正答を計算しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `origin.changes[].answerDetails` | 変更による正答・解説への影響のうち、回答前に見せない説明。practice終了後又はstudyの正答表示後だけS09で表示する。 | 任意 | 正答を明かす追加説明がなければ省略する。省略から正答への影響がないとは推定せず、affectsAnswerと正答確認記録を使う。 | string | minLength=1 / maxLength=2000 |
| `origin.independentCreationNotes` | 特定の公式問題の表現に依存せず作成した経緯。一般的知識の参考と特定問題からの派生を区別し、originalの由来を説明する。 | 条件付き | 条件付き：originalでは必須として欠落を拒否する。他の出自では非該当なら省略し、独立作成と推定しない。 | string | minLength=1 / maxLength=2000 |
| `origin.isModified` | 固定問題では作成時に原本との照合から定義する改変表示。生成済みquestionでは出題時に値の生成・バインドを行った経路に基づきtrueを記録する。テキスト・図・値の差やhash比較からは判定しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `origin.modificationBasis` | 改変表示の比較対象。固定問題では作成時に定義し、値を生成・バインドしたquestionではtemplate.bindingBasisを転記する。原資料又は保持した基準問題へ参照から到達できるようにする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["none","official_source","base_question"] |
| `contributors` | この改訂の作成・編集・内容確認に関与した主体と役割。本文や独自解説の作成者を公式主体と誤認させない表示と確認経緯に使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=20 / uniqueItems=true |
| `contributors[]` | 「contributors」に記録する一つの要素。この改訂の作成・編集・内容確認に関与した主体と役割。本文や独自解説の作成者を公式主体と誤認させない表示と確認経緯に使う。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `contributors[].actorId` | 担当主体のcatalog.actors ID。表示名と主体種別を解決し、AIによる確認を人の二重確認として記録しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `contributors[].role` | 当該主体がこの改訂で担当した作成・編集・確認等の役割。権利者や資料発行主体を自動的に担当者へ加えない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["author","editor","verifier"] |
| `contexts` | 長文等の参照本文を、問題改訂内へ固定して保持する。設問との関係をcontextRefsで示し、後から共通本文だけを差し替えない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=20 |
| `contexts[]` | 「contexts」に記録する一つの要素。長文等の参照本文を、問題改訂内へ固定して保持する。設問との関係をcontextRefsで示し、後から共通本文だけを差し替えない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `contexts[].id` | この問題内の参照本文を識別するID。contextRefsの参照先となり、別問題で同じIDを使用しても共有レコードとは扱わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `contexts[].title` | 参照本文の見出し。長文と設問を対応させて提示するために使い、公式資料名や出典帯とは別に表示する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `contexts[].presentation` | 元資料の参照本文が通常の文章か、枠と図番号を持つ文章図かを保持する表示区分。text_figureは安全な文章・箇条書きをfigureとして囲み、titleを図の説明として表示する。任意HTMLや作図コードを格納する値ではなく、通常の文章を新しい図へ変換するためには使用しない。 | 任意 | 任意：省略時はtextとして通常の参照本文を表示する。nullは拒否する。text_figureは原資料の文章図を確認した場合だけ記録する。 | string | enum=["text","text_figure"] |
| `contexts[].content` | その参照本文の文章・表・図等と部品の出典・条件。question本体と同じ改訂に固定し、設問がどの本文を読むかを保つ。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/content | additionalProperties=false |
| `contextRefs` | この設問が使用するcontextsのID一覧。全て存在する本文へ解決し、参照本文がない問題は空配列とする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=200 / uniqueItems=true |
| `contextRefs[]` | 「contextRefs」に記録する一つの要素。この設問が使用するcontextsのID一覧。全て存在する本文へ解決し、参照本文がない問題は空配列とする。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `prompt` | 利用者に回答を求める設問本文と、その出典・条件。必要な長文はcontextRefsで関連付け、選択肢や解説とは別の部品として表示する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/content | additionalProperties=false |
| `choices` | 選択肢の内容と永続IDの一覧。ここでの順序を原順序とし、画面の表示ラベルやシャッフル後の位置から正答を特定しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=2 / maxItems=10 |
| `choices[]` | 「choices」に記録する一つの要素。選択肢の内容と永続IDの一覧。ここでの順序を原順序とし、画面の表示ラベルやシャッフル後の位置から正答を特定しない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `choices[].id` | この問題内で選択肢の内容を識別するID。correctAnswerとユーザー解答の参照先で、ア・イ等の表示ラベルや数値そのものとは分ける。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `choices[].content` | 一つの選択肢に表示する文章・数式・図等と部品の出典・条件。選択肢の順序を変えてもIDに結び付いた内容を維持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/content | additionalProperties=false |
| `correctAnswer` | この改訂の単一選択の正答と正答情報の出典・条件。解答セッションから分離し、公式解答と独自検証を区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `correctAnswer.choiceId` | 正答となるchoicesのID。表示順・ア等のラベルを変えても同じ選択肢を指し、存在しないIDは参照検証で拒否する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `correctAnswer.attribution` | 正答情報の作成主体・出典・条件。公式解答冊子又は独自の検証記録へ対応させ、設問の出典だけで正答の根拠を代用しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/attribution | additionalProperties=false |
| `explanation` | 復習で提示する解説とその出典・条件。独自に作成した解説はoriginalを明示し、公式問題に付けても公式解説と表示しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/content | additionalProperties=false |
| `assetRefs` | 問題の各表示部品に含むimageが参照する素材IDの集合。過不足を検証して必要な画像だけを準備し、構造化diagramはここへ入れない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=200 / uniqueItems=true |
| `assetRefs[]` | 「assetRefs」に記録する一つの要素。問題の各表示部品に含むimageが参照する素材IDの集合。過不足を検証して必要な画像だけを準備し、構造化diagramはここへ入れない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `choiceShuffleAllowed` | 選択肢順を変えても問題の意味を保てると作成時に確認したか。順序依存の問題ではfalseとし、出題設定がshuffleでも無断で並べ替えない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `distribution` | この問題改訂を文書例だけに使うか、除外するか、配布に組み入れるかを示す工程上の区分。includedには内容・条件の確認を別途要求する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["docs_only","excluded","included"] |
| `review` | 公開確認、条件確認、原文照合、正答・解説検証を行った記録。値を設定するだけで確認済みとなるものではなく、notesと資料を根拠にする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `review.checkedOn` | この確認記録を作成した日付。資料の公開日や問題改訂日とは分け、取り込み工程の確認時点を追跡する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date" |
| `review.reviewerIds` | 確認を実施したcatalog.actorsのID一覧。主体の種別を維持し、同じ主体による照合を担当分離した確認と呼ばない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=200 / uniqueItems=true |
| `review.reviewerIds[]` | 「review.reviewerIds」に記録する一つの要素。確認を実施したcatalog.actorsのID一覧。主体の種別を維持し、同じ主体による照合を担当分離した確認と呼ばない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `review.checks` | 各取り込み工程の確認結果。pass／fail／not_applicableを工程ごとに記録し、配布可否の入口条件に使うが正しさや適法性を保証しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `review.checks.publication` | 対象の公式問題が公式に公開されていることを確認した結果。公開問題と非公開問題を区別し、独自問題で非該当となる場合も明示する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["pass","fail","not_applicable"] |
| `review.checks.terms` | 必要な用途と全素材の利用条件を確認した結果。出典の存在とは分け、未解決の条件がある問題を配布へ進めないために使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["pass","fail","not_applicable"] |
| `review.checks.thirdParty` | 文章・図表等の第三者素材と別条件を確認した結果。発行主体の条件だけで利用可とすることを防ぎ、確認範囲をnotesへ記録する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["pass","fail","not_applicable"] |
| `review.checks.transcription` | 文章だけでなく表・図・選択肢等を原資料と照合した結果。異なる表現形式でも原本リンクから確認し、isModifiedの機械判定として使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["pass","fail","not_applicable"] |
| `review.checks.answer` | 正答情報を公式解答又は独立した計算・根拠と照合した結果。存在するchoiceIdを指すという構造検証よりも広い内容確認を記録する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["pass","fail","not_applicable"] |
| `review.checks.explanation` | 独自解説の論理と正答との対応を確認した結果。第三者教材を流用していないことや解説の出自もnotesとattributionに記録する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["pass","fail","not_applicable"] |
| `review.notes` | 各工程で実際に確認した内容・方法・主体・限界を説明する。機械検証と原資料の照合、手計算等を区別し、実施していない確認を記載しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=3000 |

### 条件付き制約

以下は元Schemaの構造上の条件である。参照先による科目・モード・生成枠の条件は[データモデル](/data-model)と[受入条件](/acceptance)にも従う。改変の意味を判定する規則ではない。

```json
[
  {
    "if": {
      "properties": {
        "subject": {
          "const": "A"
        }
      },
      "required": [
        "subject"
      ],
      "type": "object"
    },
    "then": {
      "properties": {
        "choices": {
          "minItems": 4,
          "maxItems": 4,
          "type": "array"
        }
      },
      "type": "object"
    }
  },
  {
    "if": {
      "properties": {
        "origin": {
          "properties": {
            "kind": {
              "enum": [
                "official_reprint",
                "official_adaptation"
              ]
            }
          },
          "required": [
            "kind"
          ],
          "type": "object"
        }
      },
      "required": [
        "origin"
      ],
      "type": "object"
    },
    "then": {
      "properties": {
        "origin": {
          "properties": {
            "sourceRefs": {
              "minItems": 1,
              "type": "array"
            }
          },
          "type": "object"
        }
      },
      "type": "object"
    }
  },
  {
    "if": {
      "properties": {
        "origin": {
          "properties": {
            "kind": {
              "const": "official_adaptation"
            }
          },
          "required": [
            "kind"
          ],
          "type": "object"
        }
      },
      "required": [
        "origin"
      ],
      "type": "object"
    },
    "then": {
      "properties": {
        "origin": {
          "properties": {
            "derivedFrom": {
              "minItems": 1,
              "type": "array"
            },
            "changes": {
              "minItems": 1,
              "type": "array"
            }
          },
          "type": "object"
        }
      },
      "type": "object"
    }
  },
  {
    "if": {
      "properties": {
        "origin": {
          "properties": {
            "kind": {
              "const": "original"
            }
          },
          "required": [
            "kind"
          ],
          "type": "object"
        }
      },
      "required": [
        "origin"
      ],
      "type": "object"
    },
    "then": {
      "properties": {
        "origin": {
          "required": [
            "independentCreationNotes"
          ],
          "properties": {},
          "type": "object"
        }
      },
      "type": "object"
    }
  }
]
```

## 学習結果（result）

[元Schema](/schemas/result.schema.json)。終了時点のセッション保存版に対応した学習指標と各問の記録。公式IRT得点や合格判定とは区別し、訂正・撤回後の扱いも説明できるようにする。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 終了時の学習結果を識別するID。元sessionの保存版に結び付け、別のセッションの結果として再利用しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `sessionId` | この結果を生成したsessionのID。問題順・実解答・見直し・正答表示履歴と当時の出題内容を参照するために使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `sessionRevision` | 結果を確定したsessionの保存版。後の状態変更や撤回処理で内容が変わった場合に、同じ結果として無断で再解釈しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |
| `generatedAt` | 終了時の結果を確定した時刻。セッション終了時刻とは別に処理時点を記録し、後のレビューや再生成の時刻と混同しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date-time" / pattern="Z$" |
| `calculationVersion` | 記録した学習指標の計算規則を識別する版。将来計算方法が変わっても、過去の表示値がどの規則によるか説明できるようにする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="learning-accuracy-v1" |
| `total` | この結果の対象となった出題枠数。正解・不正解・未解答の合計とentries件数に一致させ、公式成績の配点を表す値としない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=60 |
| `correct` | 記録したoutcomeがcorrectである枠数。学習正答率の分子に使い、本番のIRT得点や合格判定と表示しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=60 |
| `incorrect` | 選択済みでoutcomeがincorrectである枠数。未解答と分けて復習対象を示し、内訳の合計をtotalと照合する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=60 |
| `unanswered` | 選択をしないまま終了した枠数。学習正答率の分母に含め、未解答を無かった問題として除外しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=60 |
| `revealedCount` | studyで正答・解説を表示したことがある枠数。セッションのrevealed履歴を維持し、正答表示後の学習結果を説明する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=60 |
| `learningAccuracyPercent` | 全枠を等しい重みとしてcorrect÷total×100を小数1桁へ丸めた学習正答率。公式得点、合否、能力推定として表示しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | number | minimum=0 / maximum=100 / multipleOf=0.1 |
| `entries` | 出題順に対応する各問の結果と当時の参照。session.entriesと同じ順序を保ち、復習対象と生成内容の対応を維持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=60 |
| `entries[]` | 「entries」に記録する一つの要素。出題順に対応する各問の結果と当時の参照。session.entriesと同じ順序を保ち、復習対象と生成内容の対応を維持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `entries[].questionRef` | 結果対象の固定問題又は生成基準問題の不変参照。セッションと同じ組にして保存し、最新改訂へ置き換えない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `entries[].outcome` | この枠を正解、不正解、未解答のどれとして記録したか。件数の集計と復習表示に使い、参照検証自体は採点処理を実行しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["correct","incorrect","unanswered"] |
| `entries[].generatedInstanceId` | 生成枠の結果が対象としたinstanceのID。sessionの同じ枠と一致させ、実際に出題した正答・図・解説を復習する。 | 条件付き | 条件付き：対応するsession枠でbindingPerformed=trueなら必須。元データ又は固定問題を使った枠では省略する。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `validity` | この結果を有効、訂正の説明が必要、又は無効として表示する区分。撤回・訂正時に当時の計算を黙って置き換えないために使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["valid","invalidated"] |
| `notice` | 訂正・無効等について利用者に示す説明。撤回された本文や非公開情報を再録せず、結果をどう扱うかを伝える。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=1000 |

## 利用条件と権利情報（rights）

[元Schema](/schemas/rights.schema.json)。特定の部品と用途に適用する利用条件の確認記録。出典資料の存在と利用可否を分け、第三者素材と媒体ごとの条件を独立して評価する。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 一つの利用条件と評価範囲を識別する。部品のrightsRefsから参照し、条件を変更した場合は別IDとして旧条件と混同しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `holders` | この条件が対象とする権利主体又は出自主体。利用条件の表示を生成し、作成者や発行主体と権利者が同じとは限らないことを記録する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=20 |
| `holders[]` | 「holders」に記録する一つの要素。この条件が対象とする権利主体又は出自主体。利用条件の表示を生成し、作成者や発行主体と権利者が同じとは限らないことを記録する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string | minLength=1 / maxLength=200 |
| `basis` | 利用の根拠を公式の利用方針、個別許諾、自作のいずれとして確認したかを示す。公開URLがあること自体を許諾として扱わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["official_policy","permission","own_work"] |
| `evidence` | 利用条件又は許諾を確認した資料とその箇所。公式方針・許諾では参照を保持し、自作では空配列を使用できる。条件の再確認に使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=20 |
| `evidence[]` | 「evidence」に記録する一つの要素。利用条件又は許諾を確認した資料とその箇所。公式方針・許諾では参照を保持し、自作では空配列を使用できる。条件の再確認に使う。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object / common.schema.json#/$defs/sourceRef | additionalProperties=false |
| `scope` | 条件の対象となる本文・選択肢・解説・図等の部品と、認められる利用の範囲。条件を別の素材やリポジトリ全体へ自動拡張しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=2000 |
| `uses` | 本プロジェクトで予定する行為ごとの利用可否の確認記録。同梱、ブラウザ表示、改変を独立に扱い、allowedだけを法的保証とみなさない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `uses.repositoryRedistribution` | Gitリポジトリや配布物に素材を含めて再配布できると判断したか。ブラウザで見られることとは別に根拠を確認する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["allowed","disallowed","unconfirmed"] |
| `uses.browserDisplay` | 本アプリが素材を利用者のブラウザに表示できると判断したか。リポジトリ同梱の許可から自動的に値を流用しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["allowed","disallowed","unconfirmed"] |
| `uses.adaptation` | 素材の変更や派生問題の作成を認める条件を確認したか。改変する部品に適用し、isModifiedの自動判定には使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["allowed","disallowed","unconfirmed"] |
| `attributionText` | この条件が要求する追加の権利表示を、そのまま画面と配布物へ維持するための文面。通常の資料名・URLから生成する出典表示に追加する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=0 / maxLength=2000 |
| `modificationNoticeRequired` | この利用条件が改変時の表示を要求するかを記録する。素材が改変されているかの宣言とは別であり、必要な表示を省かないために使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `licenseId` | この素材に適用するライセンス又は個別条件を識別する名称。コードのOSSライセンスを第三者素材に広げず、条件一覧の対応に使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `thirdParty` | 資料に含まれる第三者の文章・図表等を確認した記録。資料の発行主体の方針だけで第三者素材まで利用可能とみなさないために分離する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `thirdParty.status` | 第三者素材を未発見、別条件まで確認済み、未解決のどれとして記録したか。未発見は不存在の保証ではなく、未解決は配布対象に組み入れない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["none_identified","present_cleared","unresolved"] |
| `thirdParty.notes` | 第三者素材について調べた部品・箇所と確認内容。どの素材へどの条件を適用するかを人が再確認できるように残す。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=2000 |
| `thirdParty.rightsRefs` | 確認した第三者素材へ適用する別のrightsレコード。全ての参照先条件を満たし、確認済み素材ありの場合は一件以上保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=200 / uniqueItems=true |
| `thirdParty.rightsRefs[]` | 「thirdParty.rightsRefs」に記録する一つの要素。確認した第三者素材へ適用する別のrightsレコード。全ての参照先条件を満たし、確認済み素材ありの場合は一件以上保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `checkedOn` | 利用条件を実際に確認した日付。条件変更への対応と再確認の基準に使い、条件の公開日や問題の作成日とは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date" |
| `assessmentNotes` | 用途別評価の理由と限界。明示された許諾と本プロジェクトの解釈を区別し、evidenceとscopeから判断過程を追跡できるように記録する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=4000 |

### 条件付き制約

以下は元Schemaの構造上の条件である。参照先による科目・モード・生成枠の条件は[データモデル](/data-model)と[受入条件](/acceptance)にも従う。改変の意味を判定する規則ではない。

```json
[
  {
    "if": {
      "properties": {
        "basis": {
          "enum": [
            "official_policy",
            "permission"
          ]
        }
      },
      "required": [
        "basis"
      ],
      "type": "object"
    },
    "then": {
      "properties": {
        "evidence": {
          "minItems": 1,
          "type": "array"
        }
      },
      "type": "object"
    }
  },
  {
    "if": {
      "properties": {
        "thirdParty": {
          "properties": {
            "status": {
              "const": "present_cleared"
            }
          },
          "required": [
            "status"
          ],
          "type": "object"
        }
      },
      "required": [
        "thirdParty"
      ],
      "type": "object"
    },
    "then": {
      "properties": {
        "thirdParty": {
          "properties": {
            "rightsRefs": {
              "minItems": 1,
              "type": "array"
            }
          },
          "type": "object"
        }
      },
      "type": "object"
    }
  }
]
```

## 解答セッション（session）

[元Schema](/schemas/session.schema.json)。一回の練習・学習の出題順とユーザー状態。問題定義と分離して保存し、当時のカタログ・生成内容・改変宣言を再開と復習で維持する。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 一回の利用者の学習・形式練習を識別するID。結果・生成済み内容の所有先で、問題定義とは別に解答と状態を保存する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `setRef` | 開始時に選んだ問題セットの不変ID・改訂。出題枠が候補に含まれることを確認し、最新版の候補へ再開時に置き換えない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/entityRef | additionalProperties=false |
| `examConfigRef` | 開始時に選んだ科目・モード・問数・時間等の設定。セットが許可する不変改訂を参照し、セッション中に設定を変更しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/entityRef | additionalProperties=false |
| `snapshot` | 開始準備で固定した資料・問題・条件等のカタログの識別情報。保存した旧内容を参照できるようにし、生成instanceとは別に保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `snapshot.catalogId` | 固定したcatalogのID。catalogRevisionとcatalogSha256を合わせて、どの許可ファイル集合を使ったかを識別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `snapshot.catalogRevision` | 開始準備で選んだカタログの改訂。再開・復習で当時の定義を説明し、最新版への自動置換を防ぐ。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |
| `snapshot.catalogSha256` | 開始時のカタログファイルの照合値。ID・改訂が同じでも別のバイト列を読み込まないために確認する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `status` | 開始前、解答中、一時停止、完了、時間切れ、放棄、無効の現在状態。操作と遷移を制御し、pausedはstudyだけで扱う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["ready","running","paused","completed","expired","abandoned","invalidated"] |
| `createdAt` | 開始準備のためセッションを作成した時刻。生成instanceの所有時刻を確認し、制限時間の起点startedAtとは分ける。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date-time" / pattern="Z$" |
| `updatedAt` | ユーザー状態を最後に保存した時刻。競合・時刻順の確認と180日保持の起点に使い、問題自体の改訂時刻とは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date-time" / pattern="Z$" |
| `startedAt` | 準備完了後に解答を開始した時刻。practiceの期限と経過時間の基準にし、再読込みで起点を更新しない。 | 条件付き | 条件付き：readyでは省略する。開始後の全状態では必須として欠落を拒否する。 | string | format="date-time" / pattern="Z$" |
| `deadlineAt` | practiceで解答を受け付ける最終時刻。startedAtと制限時間から固定し、確認ダイアログ・再読込み・バックグラウンドで延長しない。 | 条件付き | 条件付き：開始後のpracticeでは必須で欠落を拒否する。readyとstudyでは省略し、架空の期限を補わない。 | string | format="date-time" / pattern="Z$" |
| `pausedAt` | studyを明示的に一時停止した時刻。停止期間を稼働時間へ含めず、再開時の状態確認に使う。 | 条件付き | 条件付き：pausedでは必須で欠落を拒否する。それ以外の状態では省略する。 | string | format="date-time" / pattern="Z$" |
| `endedAt` | 終端状態へ遷移して解答受付を止めた時刻。時間切れではdeadlineAtに一致させ、以後の解答変更を結果へ反映しない。 | 条件付き | 条件付き：completed／expired／abandoned／invalidatedでは必須。それ以外では省略する。 | string | format="date-time" / pattern="Z$" |
| `activeElapsedSeconds` | studyの停止期間を除いた稼働時間、又はpracticeの開始からの経過時間。表示と保存に使い、practiceの期限をこの値だけで延長しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=31536000 |
| `currentIndex` | 現在表示しているentries内の位置。問題間移動・再開時の表示先を保存し、元資料の問番号や問題の永続IDとは分ける。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=0 / maximum=59 |
| `entries` | 開始時に固定した問題順と各問のユーザー状態。回答・見直し・正答表示履歴を問題定義から分離し、再開時に出題順を抽選し直さない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=60 |
| `entries[]` | 「entries」に記録する一つの要素。開始時に固定した問題順と各問のユーザー状態。回答・見直し・正答表示履歴を問題定義から分離し、再開時に出題順を抽選し直さない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `entries[].questionRef` | この枠の固定問題又は生成の基準問題の不変参照。生成枠の実際の内容はgeneratedInstanceIdからinstance.questionへ解決する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `entries[].choiceOrder` | 実際に表示した選択肢IDの順序。画面のア等のラベルはこの順序から生成し、元のchoicesと過不足なく対応させる。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=2 / maxItems=200 / uniqueItems=true |
| `entries[].choiceOrder[]` | 「entries[].choiceOrder」に記録する一つの要素。実際に表示した選択肢IDの順序。画面のア等のラベルはこの順序から生成し、元のchoicesと過不足なく対応させる。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `entries[].selectedChoiceId` | 利用者が現在選んだ選択肢のID。choiceOrderと同じ問題のchoicesへ解決し、表示ラベルや配列位置で保存しない。 | 任意 | 省略は未解答を意味する。選択解除ではフィールドを削除し、最初の選択肢やnullで補わない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `entries[].reviewFlag` | 後で見直すという利用者の印。未解答・解答済みとは独立して保存し、falseも明示して一覧の状態表示へ使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `entries[].revealed` | studyで一度でも正答・解説を表示した履歴。戻って解答を変えても消さず、practiceの解答中には表示しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `entries[].generatedInstanceId` | 値を生成・バインドして確定したinstanceのID。同じセッション・枠の内容を指し、元データを使う出題では生成instanceを参照しない。 | 条件付き | 条件付き：生成枠でbindingMode=generated_valuesなら必須。元データを使った枠と固定問題では省略する。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `entries[].issuedContent` | 実際の出題経路、出自、改変表示と内容照合値の記録。元データを使ったか値を生成してバインドしたかを保存し、過去の表示を再判定しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `entries[].issuedContent.isModified` | 出題処理から確定した改変表示。bindingPerformed=trueならtrueとし、falseなら使用した元データのorigin.isModifiedを維持する。既存の公式改変を元データ使用だけで改変なしにしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `entries[].issuedContent.originKind` | 表示対象questionの出自区分を出題時に保存した値。公式再録・公式改変・独自問題の表示を過去結果でも保つ。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["official_reprint","official_adaptation","original"] |
| `entries[].issuedContent.contentSha256` | 実際に出題したquestion全体の照合値。保存内容が変わった場合は停止し、改変あり／なしの宣言値へ自動変換しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `entries[].issuedContent.bindingPerformed` | この出題枠で値の生成・バインドを行ったかの処理記録。実施した枠はtrue、元データ又は固定問題を使った枠はfalseとし、数値の一致や文字差分から推定しない。 | 必須 | 必須：欠落を拒否する。既定値や推定値で補完しない。 | boolean | 子構造・種類別定義に従う |
| `storage` | セッション、snapshot、生成instance、結果を利用者のブラウザ内で保持する保存方式。初期版ではサーバに解答を送る保存を追加しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="indexeddb" |
| `expiresAt` | 最終保存から180日で削除対象となる期限。セッションだけでなく所有instanceと依存snapshotの整理にも使用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date-time" / pattern="Z$" |
| `revision` | 利用者状態を保存するたびに進む保存版。競合更新とresult.sessionRevisionの照合に使い、問題・セットの不変改訂とは意味を分ける。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |
| `invalidationReason` | 継続できない理由を示す区分。データ不正・撤回・時計変更・snapshot欠落・保存障害を区別し、S10と結果の説明に使う。 | 条件付き | 条件付き：invalidatedでは必須で欠落を拒否する。他の状態では省略する。 | string | enum=["data_error","withdrawn","clock_change","missing_snapshot","storage_error"] |
| `bindingMode` | 生成枠でバインド前の元データを使うか、値を生成してバインドするかの開始時選択。セッション内で固定し、再開・復習時に別の方式へ切り替えない。固定問題だけならoriginal_dataを選ぶ。 | 必須 | 必須：欠落を拒否する。既定値や推定値で補完しない。 | string | enum=["original_data","generated_values"] |

### 条件付き制約

以下は元Schemaの構造上の条件である。参照先による科目・モード・生成枠の条件は[データモデル](/data-model)と[受入条件](/acceptance)にも従う。改変の意味を判定する規則ではない。

```json
[
  {
    "if": {
      "properties": {
        "status": {
          "const": "ready"
        }
      },
      "required": [
        "status"
      ],
      "type": "object"
    },
    "then": {
      "not": {
        "anyOf": [
          {
            "required": [
              "startedAt"
            ],
            "type": "object"
          },
          {
            "required": [
              "endedAt"
            ],
            "type": "object"
          },
          {
            "required": [
              "deadlineAt"
            ],
            "type": "object"
          }
        ]
      }
    },
    "else": {
      "required": [
        "startedAt"
      ],
      "type": "object"
    }
  },
  {
    "if": {
      "properties": {
        "status": {
          "const": "paused"
        }
      },
      "required": [
        "status"
      ],
      "type": "object"
    },
    "then": {
      "required": [
        "pausedAt"
      ],
      "type": "object"
    },
    "else": {
      "not": {
        "required": [
          "pausedAt"
        ],
        "type": "object"
      }
    }
  },
  {
    "if": {
      "properties": {
        "status": {
          "enum": [
            "completed",
            "expired",
            "abandoned",
            "invalidated"
          ]
        }
      },
      "required": [
        "status"
      ],
      "type": "object"
    },
    "then": {
      "required": [
        "endedAt"
      ],
      "type": "object"
    },
    "else": {
      "not": {
        "required": [
          "endedAt"
        ],
        "type": "object"
      }
    }
  },
  {
    "if": {
      "properties": {
        "status": {
          "const": "invalidated"
        }
      },
      "required": [
        "status"
      ],
      "type": "object"
    },
    "then": {
      "required": [
        "invalidationReason"
      ],
      "type": "object"
    },
    "else": {
      "not": {
        "required": [
          "invalidationReason"
        ],
        "type": "object"
      }
    }
  }
]
```

## 問題セット（set）

[元Schema](/schemas/set.schema.json)。同じ科目の問題候補と選択可能な試験設定の組。年度別は必要な独立系列数を確保する。生成ミックスは登録された基準問題・テンプレートから指定の枠を生成し、異なる入力を用意できないときは開始を止める。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 一つの学習用問題群を識別する永続ID。session.setRefはrevisionと組にして参照し、同じ名称の別セットと混同しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `revision` | 候補問題と関連試験設定を固定する改訂。問題の追加・差替え・設定の変更時に増やし、過去の出題候補を上書きしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |
| `title` | S01の問題セット選択に表示する名前。内容・学習目的を説明し、公式に提供された試験セットと誤認させない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `subject` | このセットの問題に共通する本アプリ内の科目。参照するquestionとexamの科目に一致させ、混在したセットを開始しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["A","B"] |
| `questionRefs` | 問題と基準問題の不変参照を持つ候補一覧。年度別では原順序を保つ。候補自体に重複参照を置かず、生成ミックスの枠数・同系列の別入力はexam.duplicatePolicyとsession.entriesで決める。候補数と生成出題数は同一とは限らない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=500 / uniqueItems=true |
| `questionRefs[]` | 「questionRefs」に記録する一つの出題候補の不変参照。年度別では原順序を保持し、一つの問題を一枠へ選ぶ。生成ミックスでは基準問題を一度だけ候補に登録し、異なる入力を複数のセッション枠へ割り当てられる。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `examConfigRefs` | このセットで開始できる試験設定のID・改訂。問数や分野内訳を満たす設定だけを関連付け、不足するpracticeを選択可能にしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=20 / uniqueItems=true |
| `examConfigRefs[]` | 「examConfigRefs」に記録する一つの要素。このセットで開始できる試験設定のID・改訂。問数や分野内訳を満たす設定だけを関連付け、不足するpracticeを選択可能にしない。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object / common.schema.json#/$defs/entityRef | additionalProperties=false |
| `distribution` | セットを文書例・除外・配布対象のどれにするか。配布対象は参照する問題とテンプレートも全て配布可能であることを必要とする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["docs_only","included","excluded"] |
| `generationBindings` | このセットの出題候補に対する基準問題と生成テンプレートの対応。候補数は一回の出題数と分離し、実際に出題する枠は試験設定で選ぶ。全問対応では各対象の原問題を候補へ含める。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=0 / maxItems=500 |
| `generationBindings[]` | 「generationBindings」に記録する一つの要素。セット内のどの候補問題をテンプレート生成の枠として扱うか。固定問題だけのセットでは空配列を保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | object | additionalProperties=false |
| `generationBindings[].questionRef` | 生成枠を代表する基準問題の不変参照。questionRefsに一度だけ含まれ、対応テンプレートのbaseQuestionRefと一致する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `generationBindings[].templateRef` | その枠で使うテンプレートの不変ID・改訂。生成規則、入力域、作成時の改変宣言を解決し、最新改訂へ自動追従しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/entityRef | additionalProperties=false |

## 出典資料（source）

[元Schema](/schemas/source.schema.json)。原資料の識別、実際の確認事項、その適用範囲と限界。資料に出典を付ける情報と利用条件の評価を別レコードに分離する。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 一つの資料と確認記録を識別する。sourceRef.sourceIdから資料名・URL・確認範囲を解決し、問題の出典と利用条件の根拠資料の両方に使える。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `title` | 原資料を利用者が識別できる正式な資料名。問題の出典帯と原資料リンクの表示に使い、本アプリ独自の問題名とは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=500 |
| `publisher` | 資料を発行した組織又は主体。問題を編集した本プロジェクトの主体とは区別して出典表示に使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `url` | 原資料又はその公開案内へ到達するリンク。sourceRef.locatorと組み合わせて原本を照合するために使い、読込み時の自動取得命令として使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="uri" / pattern="^https://" / maxLength=2000 |
| `publishedOn` | 発行主体が資料の公開日として明記した日付。調査者が閲覧したcheckedOnや、問題の対象年度とは区別する。 | 任意 | 記載を確認できなければ省略し、dateNoteにその事実を記録する。確認日や対象年度で補わない。 | string | format="date" |
| `updatedOn` | 発行主体が資料の更新日として明記した日付。公開後の条件や内容の変更を追跡する手掛かりとし、調査者の編集日とは区別する。 | 任意 | 更新日の記載を確認できなければ省略し、dateNoteに記載の有無を記録する。 | string | format="date" |
| `dateNote` | 公開日・更新日の確認範囲を説明する。掲載ページと添付PDFで日付が異なる場合や、日付の記載がない場合の根拠を残す。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=500 |
| `checkedOn` | 本プロジェクトがこの資料を実際に確認した日付。条件の再確認時期を追跡するために使い、発行主体の更新日として表示しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | format="date" |
| `type` | 資料をどの根拠として参照できるかを示す区分。公式問題、公式解答、公式サンプル、利用方針、操作案内、法令、独自記録を区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["official_problem","official_answer","official_sample","policy","ui_guidance","law","independent_note"] |
| `scope` | 資料が対象とする試験区分・年度・制度・サービス。汎用CBT案内を現行FE本番の保証へ読み替えないために適用範囲を記録する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=1000 |
| `availability` | その資料の公開主体と公開状況を確認した結果。公式公開、独自作成、未確認を区別し、公開確認と再配布の許可を同一視しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["officially_published","self_authored","unverified"] |
| `sections` | 実際に参照した節・見出し・ページの一覧。原資料のどこからfactsを得たかを追跡し、後の再確認でも同じ箇所を探せるようにする。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=50 |
| `sections[]` | 「sections」に記録する一つの要素。実際に参照した節・見出し・ページの一覧。原資料のどこからfactsを得たかを追跡し、後の再確認でも同じ箇所を探せるようにする。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string | minLength=1 / maxLength=500 |
| `facts` | この資料から直接確認できた事項の記録。本プロジェクトの設計判断や確認できない推測を混ぜず、scopeの範囲で記載する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=50 |
| `facts[]` | 「facts」に記録する一つの要素。この資料から直接確認できた事項の記録。本プロジェクトの設計判断や確認できない推測を混ぜず、scopeの範囲で記載する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string | minLength=1 / maxLength=2000 |
| `supports` | 確認事項を根拠にした仕様ID又は文書ページの一覧。資料から要件への対応を追跡し、資料が更新された場合の影響調査に使う。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=50 |
| `supports[]` | 「supports」に記録する一つの要素。確認事項を根拠にした仕様ID又は文書ページの一覧。資料から要件への対応を追跡し、資料が更新された場合の影響調査に使う。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string | minLength=1 / maxLength=200 |
| `limits` | この資料だけでは確認できない対象・権利・挙動を説明する。参照していない年度や非公開の本番情報まで確認済みと扱うことを防ぐ。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=2000 |
| `sha256` | 確認時に取得した資料のバイト列を識別する照合値。後から同じ資料を照合するための記録で、資料が適法に公開されたことを保証しない。 | 任意 | HTML等で固定バイト列を保存していない場合は省略する。値がない資料はバイト列の一致を保証せず、URL・箇所・確認日から再確認する。 | string | pattern="^[a-f0-9]{64}$" |

## 生成テンプレート（template）

[元Schema](/schemas/template.schema.json)。バインド前の問題定義を不変参照と内容hashで保持する生成契約。元データの使用又は値の生成・バインドを開始時に選び、元データを上書きしない。

| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | このデータをどの交換仕様で解釈・検証するかを識別する版。未対応版の項目を推測で補完せず、レコードのrevisionとは区別する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | const="3.0.0" |
| `id` | 一つの生成契約を識別する永続ID。setの生成枠とinstanceがrevisionと組にして参照し、生成器モジュールのIDとは分ける。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `revision` | 基準問題、入力域、改変宣言等を固定するテンプレート改訂。契約を変えた場合に増やし、保存済みinstanceの由来を変更しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=100000 |
| `title` | 問題セットや生成内容の詳細で示すテンプレート名。独自の生成契約と分かる名前を使い、公式に提供された生成問題と表示しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | minLength=1 / maxLength=200 |
| `baseQuestionRef` | 学習目標・部品の出典・条件・基準値を定義した不変の基準問題。生成結果の由来と原本比較を追跡する参照先となる。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/questionRef | additionalProperties=false |
| `generatorRef` | 本文・図・選択肢・正答・解説を一体で作る、開発側で登録した生成モジュールのID・版。任意コードや取得URLを指定するものではない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/moduleRef | additionalProperties=false |
| `parameterDomain` | 登録生成器が使用する入力域。valuesは全体の要素数と外側の限界、fieldsは位置別の意味と限界を定義する。未登録の範囲へ推測で拡張しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `parameterDomain.values` | 入力列全体の要素数と数値の外側の限界。fieldsがある場合は位置別の許可域をさらに適用する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object | additionalProperties=false |
| `parameterDomain.values.length` | 一つの生成へ渡す入力列の要素数。fieldsの要素数と一致させ、本文・図・計算の対応を固定する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=1 / maximum=50 |
| `parameterDomain.values.minimum` | 各入力値の許可下限。シード選択と域検証で共通に使い、問題の正答の下限を直接指定する値ではない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=-1000000 / maximum=1000000 |
| `parameterDomain.values.maximum` | 入力列全体の外側の数値上限。位置別のfieldsの上限を超えた抽選は認めない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | integer | minimum=-1000000 / maximum=1000000 |
| `parameterDomain.fields` | 問題内の異なる単位・範囲を持つ要素をvaluesの順で定義する。要素数はvalues.lengthと同じとし、入力間の条件は登録生成器で別途検査する。 | 任意 | 任意：省略時は全位置にvaluesの共通下限・上限を適用する。新しいFE生成器では必須、既存array-sum契約では省略する。 | array | minItems=1 / maxItems=50 |
| `parameterDomain.fields[]` | valuesの一つの位置に対応する名前と許可域。 | 配列要素 | 要素：nullや穴は拒否する。 | object | additionalProperties=false |
| `parameterDomain.fields[].name` | この位置の値が表す問題内の要素名と必要な単位。valuesの同じ添字へ対応し、表示・計算で別の値と取り違えないために使う。 | 必須 | 必須：欠落を拒否する。 | string | minLength=1 / maxLength=100 |
| `parameterDomain.fields[].minimum` | この位置の入力値の許可下限。全体のvalues.minimum以上であり、登録した生成器の契約と一致させる。 | 必須 | 必須：欠落を拒否する。 | integer | minimum=-1000000 / maximum=1000000 |
| `parameterDomain.fields[].maximum` | この位置の入力値の許可上限。minimum以上かつ全体の上限以下であり、抽選と検証の両方で用いる。 | 必須 | 必須：欠落を拒否する。 | integer | minimum=-1000000 / maximum=1000000 |
| `referenceParameters` | 基準問題に記載した入力値。テンプレート作成時の契約照合に使い、生成値との差からisModifiedを判定するためには使わない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/parameters | additionalProperties=false |
| `attribution` | テンプレートの作成主体、依存する資料、適用条件。基準問題に含む権利条件を維持し、コード側のライセンスと混同しない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | object / common.schema.json#/$defs/attribution | additionalProperties=false |
| `editorIds` | 生成内容の変更履歴へ記録する編集主体のcatalog.actors ID。生成器の出力を人が毎回編集したと説明せず、定義した主体を保持する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | array | minItems=1 / maxItems=20 |
| `editorIds[]` | 「editorIds」に記録する一つの要素。生成内容の変更履歴へ記録する編集主体のcatalog.actors ID。生成器の出力を人が毎回編集したと説明せず、定義した主体を保持する。 | 配列要素 | 要素：この位置に要素を置く場合は型と子の必須条件を満たす。nullや未定義の穴を置かない。配列全体の空・省略の扱いは親フィールドに従う。 | string / common.schema.json#/$defs/id | pattern="^[a-z][a-z0-9-]{2,79}$" |
| `lifecycle` | 新規生成へこの改訂を使えるか。撤回されたテンプレートで新たに生成せず、既存instanceも保守規則から影響を確認する。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["active","withdrawn"] |
| `distribution` | 文書用の契約と本体配布へ含める契約を区別する。配布対象の基準問題・条件確認が揃わないテンプレートはincludedにしない。 | 必須 | 必須：欠落を拒否する。参照値や既定値で補完しない。 | string | enum=["docs_only","excluded","included"] |
| `originalContentSha256` | baseQuestionRefが指すバインド前の完全な問題定義を固定する照合値。元データをカタログsnapshotへ保持して原文・図・正答・条件を復元するために使い、内容差分から改変有無を判定しない。 | 必須 | 必須：欠落を拒否する。既定値や推定値で補完しない。 | string | pattern="^[a-f0-9]{64}$" |
| `bindingBasis` | 値を生成してバインドした場合の比較対象。公式資料又は保持した基準問題を指定し、生成済みquestionのmodificationBasisへ転記する。元データを使う場合はそのoriginを維持する。 | 必須 | 必須：欠落を拒否する。既定値や推定値で補完しない。 | string | enum=["official_source","base_question"] |

</div>
