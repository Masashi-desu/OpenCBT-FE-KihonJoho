# ロゴとファビコンの生成

OpenCBT共通の「開いたフレーム」と右下の資格コードを組み合わせます。選定したラフの枠とFEをVTracerでパス化し、`scripts/brand/geometry.json`に保持しています。元画像の1254×1254の座標と余白を維持し、白黒抽出のしきい値は150です。微細な影とテクスチャは除去しています。

## 再生成

配布用は[共有資産の管理](/sharing-assets)の`npm run assets:generate`で共有メタ情報と一緒に生成する。以下の`icons:generate`はアイコン単体の試作・調整に使う。既定の配布物の正本は`scripts/brand/site.json`である。

通常の`npm ci`で生成ツールも揃います。Python、システムフォント、ブラウザは再生成に不要です。可変文字用の既定フォントは必要時にCDNから固定版を取得し、hashを検査してGit対象外の`.cache/brand-fonts/`へキャッシュします。[取得方法とオフライン再利用](/sharing-assets#フォントのcdn取得とキャッシュ)を参照してください。

```sh
npm run icons:generate
npm run icons:generate -- --label AP --out-dir output/brand-ap
npm run icons:generate -- --label IT --out-dir output/brand-it
npm run icons:generate -- --label SC --color '#244b85' --out-dir output/brand-sc
```

既定のFEを`public/`へ生成します。元のFEはトレースした輪郭を使い、その他の文字はキャッシュしたフォントからパスを作ります。共通枠は変えません。SVGにフォント参照、画像埋め込み、外部取得はありません。アイコン単体の既定FE・共通枠のみの生成はフォント取得を必要としません。

## 可変部分

| 引数 | 内容 |
| --- | --- |
| `--label` | 資格コード。既定はFE。空文字`--label ''`なら共通枠のみ。 |
| `--color` | 枠と文字の色。`#RGB`又は`#RRGGBB`。 |
| `--background` | ファビコン・PNGの背景。既定は`#ffffff`。`transparent`も可。 |
| `--background-radius` | ファビコン背景の角丸R。辺に対する割合を0〜0.5で指定。既定は0.18。 |
| `--font` | 文字のパス化に使うTTF/OTF。FEにも別フォントを適用可能。 |
| `--label-box` | 文字を収める矩形の`x,y,width,height`。1254×1254の座標系。 |
| `--out-dir` | 出力先。既定はリポジトリ直下の`public/`。 |

文字は矩形に収まるよう縦横比を維持して拡縮し、右下に揃えます。長い名称は小さくなるので短い資格コードを使います。既定フォントのArchivo Blackはラテン文字中心です。日本語などを使う場合は対応する利用可能なフォントを`--font`で指定します。未収録文字はエラーにし、既存の出力を書き換えません。同期の描画関数を直接使うときは、必要なフォントを`prepareBrandFonts()`又は`npm run fonts:prepare`で先に準備します。

```sh
npm run icons:generate -- --label AP --label-box 620,700,480,300 --out-dir output/brand-ap
npm run icons:generate -- --help
```

## 出力と表示

| ファイル | 用途 |
| --- | --- |
| `brand-icon.svg` | 背景なしベクタ。サイドバーはCSSマスクでライト／ダークの文字色に追従。 |
| `favicon.svg` | ベクタ版ファビコン。既定は白背景、Rは辺の18％、四隅の外側は透明。 |
| `favicon.ico` | 16・32・48pxのPNGを格納した互換用ファビコン。 |
| `favicon-16.png`・`favicon-32.png`・`favicon-48.png` | 各サイズのファビコン。 |
| `apple-touch-icon.png` | 180px。iOS用。 |
| `app-icon-192.png`・`app-icon-512.png` | 正方形のアプリアイコン。 |

すべて同じベクタから各サイズへ直接描画します。16pxでは文字の判読性が限られ、共通フレームが主な識別要素になります。アプリの名称・資格コードのテキストや試験データは、この資産生成と別に管理します。

## 検証記録

2026-10-07、生成したSVGを1254×1254へ描画し、元画像と位置・スケールを変えずに重ね合わせました。しきい値150での黒領域のIoUは98.60%、画像全体の差分は0.28%です。外形の上下左右は元画像から1px以内で一致しています。黒一色への整理と輪郭の平滑化を含むため、元のアンチエイリアスや影との完全一致は意図していません。FE・AP・ITの16・32・48px出力と、アプリ内ブラウザのライト／ダーク表示も確認しています。

## 出典と利用条件

- ベクタの枠と元のFE：選定した画像生成ラフを基にしたOpenCBT独自資産。原画像のSHA-256、抽出条件、文字枠は`geometry.json`に記録。
- 可変文字：[Archivo Black](https://github.com/Omnibus-Type/ArchivoBlack)、Omnibus-Type、バージョン1.006、OFL-1.1。Google Fontsのコミット`94a7d81318e438525a5285e07ab72c050fdfeb44`から取得。`scripts/brand/OFL.txt`とアプリのライセンス表記に全文を保持。フォントのハッシュも`geometry.json`に記録。
- 文字のパス化：[opentype.js](https://github.com/opentypejs/opentype.js) 2.0.0（MIT）。
- PNG描画：[resvg-js](https://github.com/thx/resvg-js) 2.6.2（MPL-2.0）。

opentype.jsとresvg-jsは開発時の資産生成にだけ使い、アプリのJavaScriptには含めません。原文LICENSEは各npm配布物に含まれています。確認日は2026-10-07です。別フォントを指定した場合は、そのフォントの利用条件と必要な通知に従います。
