# 起動・編集・検証方法

## 初回セットアップ

リポジトリ直下でNode.js 22.x又は24.xとnpmを使う。Node24.xを標準環境とする。

```sh
node --version
npm --version
npm ci
npm run doc
```

起動ログに表示されたURLを開く。既定は `http://127.0.0.1:5173/`、待受けはループバックだけ。停止はCtrl+C。ポートが使用中なら次の空きポートへ自動的に切り替え、実際のURLを表示する。既存プロセスを終了させない。ポート指定は `npm run doc -- --port 5174` とする。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm ci` | lockfile通りに本体・文書・検証の依存を導入 |
| `npm run doc` | 文書の開発サーバ。CBT本体は起動しない |
| `npm run doc:validate` | サンプルSchema・参照・不正例・辞書の鮮度・文書リンク・範囲を検証 |
| `npm run doc:reference` | Schemaからフィールド辞書を再生成 |
| `npm run doc:generation` | 配布データと登録契約から全問対応一覧を再生成 |
| `npm run doc:build` | 検証後、docs/.vitepress/distへ静的サイトを生成 |
| `npm run doc:preview` | ビルド結果を127.0.0.1:4173で確認 |

本体はmainへのpushでGitHub Pagesへ自動配信する。[配信手順](/implementation#github-pages)に従う。文書サイトはローカルで仕様を読める構成を維持する。ローカルビルドだけでは外部へ公開しない。

## 本体の起動と検証

問題の取り込み・データ・生成器・作図・ミックス、権利・ライセンス表示、依存ライブラリ又は生成方式のUI説明を変更するときは、リポジトリ直下のAGENTS.mdから `.agents/skills/fe-question-generation/SKILL.md` を読み、対象範囲の用意可能な問題をすべて揃える規約を適用する。全件対応は生成カタログの検証で維持し、メニューへ対応件数やバインド方式の説明欄を追加しない。問題単位の出典・改変表示は引き続き維持する。

npm run devで本体を127.0.0.1:5175に起動する。使用中なら別ポートになるためログを見る。npm run docは文書のまま維持する。

| コマンド | 内容 |
| --- | --- |
| npm run test | 出題・生成・期限・不正データのテスト |
| npm run data:validate | 配布カタログ・全JSON・画像・出典／権利の参照検証 |
| npm run build | 配布検証・TypeScript確認・distの生成 |
| npm run preview | distを127.0.0.1:4175で確認 |
| npm run icons:generate | ロゴ・ファビコンを再生成。[資格コード等の指定方法](/brand-icons) |
| npm run fonts:prepare | 生成用の固定版フォントをCDNから取得・hash検査してキャッシュ。通常は資産生成時に自動実行 |
| npm run assets:generate | OpenGraph・共有メタ情報・manifest・アイコンをまとめて再生成。[設定と出力](/sharing-assets) |
| npm run assets:check | 描画コード・設定と配布資産の一致を読取り専用で確認 |
| npm run check | 本体テスト・本体ビルド・文書ビルド |

Schemaの正本はdocs/public/schemas。npm run dev・test・data:validateの前処理で固定検証関数をsrc/generatedへ生成する。生成物を手編集しない。本体データはpublic/data、ライセンス原文はpublic/noticesを編集し、カタログのファイルhashと検証を更新する。リリースの具体的な収録数・除外・検証限界は[実装範囲](/implementation)へ記録する。

登録生成器を変更した場合は、原資料を確認してsrc/core/generation.ts及びsrc/core/generatorsの契約と計算を更新する。次の開発用コマンドで、既存の公式問題データから基準問題・テンプレート・セットとカタログhashを再構築する。外部資料の取得・画像変換・外部公開は行わない。配布済みの版を変更する際は基準問題のrevisionと生成器versionも更新し、保存済みの出題内容を再生成しない。

```sh
node node_modules/tsx/dist/cli.mjs scripts/prepare-generation-data.ts
npm run doc:generation
npm run check
```

このスクリプトは現在の初期配布データを作る開発用の手順であり、利用者が実行する開始処理には組み込まない。追加90系列の未公開初期データの再構築には--refresh-additionalを付ける。全問対応一覧は手編集せずdoc:generationで更新する。指定系列だけの更新には--refresh-sources=年度-科目-問番号を使う。更新対象のquestion／template・set／exam・catalogの改訂を上げ、コードの変更に対応したgenerator versionと取り下げ通知も確認する。引数なしでは既存定義を上書きしない。新しい入力域や計算規則は独立した正答計算・誤答の一意性テストと描画確認を追加して検証する。

問題・生成器・入力域・選択肢・正答・解説の追加又は変更では、[生成内容と正答の必須テスト](/acceptance#生成内容と正答の必須テスト)を同じ変更で用意する。計算・アルゴリズムは独立した参照解法、知識選択は査読・固定した対応資料を使い、全選択肢の成立条件と正答IDを検証する。新しい系列も自動テストへ登録し、未登録又はskipのまま完了しない。生成器の出力を期待値へコピーしてテストを通す更新を行わない。

## 閲覧環境

文書サイトはVitePress **1.6.4**を使用する。編集時の参照先は[公式v1ガイド](https://vuejs.github.io/vitepress/v1/guide/getting-started)と[コードファイルの掲載方法](https://vuejs.github.io/vitepress/v1/guide/markdown)。設定ファイルは次の表に示す。依存関係のバージョンはルートのpackage.jsonとpackage-lock.jsonで管理する。

## 編集する場所と正本

| 内容 | 場所 | 編集後に行うこと |
| --- | --- | --- |
| 仕様本文 | docs/*.md | 関連仕様・フィールド・画面の対応を確認 |
| 全仕様一覧 | docs/.vitepress/navigation.mjs | 新しいmdページをサイドバーへ必ず追加 |
| Schema | docs/public/schemas/*.schema.json | doc:reference、doc:validate |
| サンプル | docs/public/data/ | 対応するSchemaとsource・rightsを確認、カタログhashを更新 |
| ナビ・表示 | docs/.vitepress/config.mjs・theme/ | doc:buildと隔離したブラウザで確認 |
| 検証 | docs/scripts/ | 有効サンプル成功と全不正例の期待コードを維持 |

サイトの `/data/...` は `docs/public/data/...`、`/schemas/...` は `docs/public/schemas/...` の正本を配信する。Markdownの `<<< @/public/...` で正本の内容を取り込む。生成済みのschema-reference.mdを手書き修正せず、元Schemaを変更する。フィールドの意味はdescriptionに、欠落時の扱いは$commentに分けて記載する。意味にはその値が表す対象、用途、他のフィールドとの役割の違いを説明し、型・文字数・列挙値等はSchemaの制約キーワードに記載する。辞書生成は各フィールドと配列要素に両方の説明があることを確認する。

元JSON・Schemaの更新後はビルドし直して掲載との一致を確認する。起動中のコード表示が古い場合は文書サーバを再起動する。

サンプルの内容を変更した場合、まず該当JSONファイルのバイト列SHA-256を計算してcatalog.filesを更新し、最後にcatalog.jsonのhashを各session.snapshotへ更新する。順序や整形が変わってもhashが変化する。参照の変更を正答・内容の確認で代替しない。

出題内容を変更した場合は、questionをsorted-json-v1で正規化した内容hashをsession.entries[].issuedContentへ反映し、生成例ならinstance.contentSha256にも反映する。instanceはカタログへ入れず、所有sessionとの対応を検証する。[内容hashの定義](/diagram-generation)に従う。

## 検証の範囲

現在のdoc:validateは説明用レコードだけを読み、問題収集・変換・生成・出題・採点・ユーザー保存を行わない。結果の値が記録済み内訳と算術的に整合するかだけを検査する。ブラウザを必要としない静的・HTTP確認を先に行う。

表示検証が必要な場合は、ユーザーが指定した対象を優先し、指定がなければ独立したヘッドレス文脈を使う。通常のブラウザのタブ・cookie・Spaceを変更しない。現在の環境固有のブラウザツールは本リポジトリのnpm依存に追加せず、今回の手順・結果を[検証記録](/verification)へ残す。
