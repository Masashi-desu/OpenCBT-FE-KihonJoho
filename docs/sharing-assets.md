# OpenGraphと関連資産の管理

共有画像は1200×630pxの白背景に、左のアイコンと右の3行「OpenCBT FE」「基本情報技術者試験」「模擬試験」を配置する。文字とアイコンをまとめた外形を画像の中央へ揃える。

## 正本と描画

正本は`scripts/brand/site.json`の文字・寸法・配色・公開URLと、`scripts/generate-site-assets.mjs`の構成コードである。アイコンは既存の`geometry.json`とロゴ生成器を共有する。文字は固定版フォントからパス化し、自己完結したSVGをresvg-jsでPNGへ描画する。フォントは生成時にjsDelivrのCDNから取得し、SHA-256を照合してローカルへキャッシュする。画像生成サービス、実行時AI、端末のフォント、ブラウザ撮影は使わない。

```sh
npm run assets:generate
npm run assets:check
```

`assets:generate`は12資産と`index.html`の生成マーカー内を更新する。`assets:check`は配布資産・メタ情報を書き換えず、正本からの再描画結果と照合する。欠落・古い生成物は失敗させる。どちらも未取得の生成用フォントがあればCDNから準備する。`dev`と`build`の前に再生成し、`test`の前に鮮度を検査する。変更後は再生成した資産もGitの管理対象に含める。

## フォントのCDN取得とキャッシュ

`scripts/brand-fonts.mjs`が、出典記録にある固定コミットのCDN URLからTTF／OTFを並列取得する。フォントの実体はリポジトリへ同梱せず、Git対象外の`.cache/brand-fonts/`に保存する。取得時・読取り時にSHA-256を検査し、キャッシュが正常なら通信しない。破損したキャッシュは次の準備時に再取得する。ライセンス原文と出典・版・hashの記録はGitで管理する。

```sh
npm run fonts:prepare
```

通常は生成コマンドが自動で準備するため、上のコマンドは事前取得やキャッシュ修復用である。初回だけ約4.75MBの取得があり、所要時間は回線・CDNの状態に依存する。正常なキャッシュがあればオフラインでも再生成できる。1取得のタイムアウトは30秒。初回取得やhash検査が失敗した場合は生成を停止し、既存の配布資産を変更しない。

キャッシュの置き場所は`OPENCBT_FONT_CACHE`で変更できる。プログラムから同期の描画関数を直接呼ぶ場合は、先に`prepareBrandFonts()`を待つか`npm run fonts:prepare`を実行する。標準以外のフォントは従来どおり`scripts/brand/`内のファイル名で指定でき、CDN自動取得の対象にはしない。

ブラウザは生成済みのSVG・PNGを読むため、この取得方式はページ表示やOG画像の表示に追加のフォント通信を発生させない。

## 設定する内容

| 設定 | 内容 |
| --- | --- |
| `siteUrl` | 共有用の公開ルートURL。サブディレクトリと末尾`/`を含める。 |
| `name`・`title`・`description`・`imageAlt`・`locale` | 共有名、ページタイトル、説明、画像の代替説明、言語。 |
| `certification` | アイコンの可変コード。既定はFE。 |
| `colors`・`faviconRadius` | 背景・文字色、ファビコン背景の角丸。 |
| `card.lines` | 3行の文字、フォントファイル、文字サイズ。 |
| `card.width`・`height` | 出力寸法。既定は1200×630。 |
| `card.iconSize`・`gap`・`lineGap`・`safeInset` | アイコン寸法、文字との間隔、行間、安全余白。 |

文字の実際の輪郭を測って配置する。設定が安全余白を超える場合は文字を切り落とさず、生成をエラーにする。別資格用に変更するときは、文字3行、画像の代替説明、名称・説明・資格コードも合わせて変更する。

別設定の試作は通常の配布物と分けて出力できる。

```sh
npm run assets:generate -- --config path/to/site.json --out-dir output/share-preview
npm run assets:generate -- --site-url https://example.com/opencbt/
```

公開URLは`--site-url`、環境変数`SITE_URL`、設定ファイルの順で採用する。別の出力先ではアプリの`index.html`を書き換えない。`SITE_URL=https://example.com/opencbt/ npm run build`でも変更できる。既定の[GitHub Pages公開URL](https://masashi-desu.github.io/OpenCBT-FE-KihonJoho/)は2026-10-07に配信成功とHTTP 200を確認した。HTML・OpenGraph画像・manifest・アイコンはローカルのビルド成果物とSHA-256が一致する。[公開検証記録](/verification#github-pagesの自動配信2026-10-07)を参照する。SNS上での共有カード表示は未確認である。

## 生成物とメタ情報

| 生成物 | 用途 |
| --- | --- |
| `public/open-graph.png` | OpenGraphとXの共有画像。 |
| `public/open-graph.svg` | フォント参照・外部画像のないベクタ版。 |
| `public/site.webmanifest` | アプリ名・説明・言語・開始URL・192/512pxアイコンをまとめたWeb App Manifest。 |
| ロゴ・ファビコン・Apple用・192/512pxアイコン9資産 | [ロゴ生成器](/brand-icons)を呼び、同じ資格コードと配色で生成。 |
| `index.html`の生成ブロック | canonical、OpenGraph、Xカード、favicon、Appleアイコン、manifest、theme-color、description、title。 |

共有画像URLとcanonicalは公開ルートから作った絶対URLを使う。ファビコン・manifest・開始URLは相対参照とし、GitHub Pagesのサブディレクトリでも有効にする。画像・アイコンのURLには内容hashを付け、更新した画像を識別する。ハッシュ経路の問題ごとにメタ情報を切り替えず、静的HTMLでアプリ全体を紹介する。

生成ブロックは`<!-- generated:site-assets:start -->`と`<!-- generated:site-assets:end -->`の間である。CSPやアプリの起動スクリプトなど、この外側の記述は保持する。共有情報を変更する際は生成済みメタタグを手編集せず、設定の正本を変更する。Manifestにはservice workerやオフラインキャッシュは追加していない。

## フォントと出典

- 英字：Archivo Black 1.006、OFL-1.1。Google Fontsの固定コミットをjsDelivr経由で取得し、`geometry.json`内の出典・CDN URL・SHA-256で管理する。原文通知は保持する。
- 日本語：Noto Sans JP Bold 2.004、© 2014–2021 Adobe、OFL-1.1。[公式配布元](https://github.com/notofonts/noto-cjk)、固定コミット`f8d157532fbfaeda587e826d4cd5b21a49186f7c`の日本語版OTFをjsDelivr経由で取得する。`NotoSansJP-source.json`に出典・CDN URL・version・SHA-256を記録する。
- 原文通知：`scripts/brand/NotoSansJP-LICENSE.txt`、アプリで表示する`public/notices/NotoSansJP-2.004-OFL.txt`。公開通知にはフォント内の著作権表示も保持する。
- メタ情報：[Open Graph protocol](https://ogp.me/)の必須項目と画像の構造化プロパティを反映する。Xカードには`summary_large_image`と同じ画像を指定する。

フォントと描画ライブラリは開発用であり、アプリのJavaScriptへ含めず、閲覧時の外部フォント取得も追加しない。確認日は2026-10-07。

## 検証

実際のSVG描画ピクセルから黒領域の外形を測り、1200×630の中央から1px以内、各方向64px以上の安全余白、アイコン左・文字右、指定の3行を確認する。その他にPNGの実寸、絶対画像URL、サブディレクトリのmanifest参照、メタ情報のエスケープ、CSP・起動スクリプトの保持、欠落・古い生成物の読取り専用検査を自動テストする。フォント取得では通信失敗・hash不一致を拒否し、正常なキャッシュのオフライン再利用・破損キャッシュの修復・取得失敗時の書き込み抑止を検査する。
