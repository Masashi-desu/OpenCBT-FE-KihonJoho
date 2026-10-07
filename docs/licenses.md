# ライセンスの適用範囲

## 部品ごとの扱い

本システムでは、コードとコンテンツを一つのOSSライセンスで包まない。`rights.licenseId` は当該rights.scopeへだけ適用する。複数の権利を持つ改変問では、原部分の条件と追加部分の条件を全て維持する。

| 対象 | 本プロジェクトの方針 |
| --- | --- |
| 本体独自コード・独自文書・Schema・検証コード | MIT。ルートLICENSEとpublic/notices/PROJECT-LICENSE.txtに範囲と全文を保持 |
| 管理された図描画器・生成器 | 本体独自コードとしてMIT。図のscene・テンプレート記述・生成された原表現はそれぞれのコンテンツ条件 |
| 数式描画KaTeX 0.19.0 | MIT。CDN取得でもKaTeXの著作権表示・MIT全文を保持し、独自文章や問題へこの許諾を拡張しない |
| ロゴ生成用Archivo Black 1.006 | OFL-1.1。フォントと可変文字の派生資産の通知を保持。[ロゴ生成と出典](/brand-icons)を参照 |
| OpenGraph用Noto Sans JP Bold 2.004 | OFL-1.1。著作権表示・原文通知・固定版フォントのhashを保持。[共有資産と出典](/sharing-assets)を参照 |
| docs/scripts・docs/.vitepressの独自コード | MIT。下記の許諾文はこの独自コードだけへ適用 |
| 独立作成の問題・独自解説・独自図データ・改変追加記述 | CC0-1.0の再利用方針。公式・第三者の原表現を除く |
| 公式の問題文・選択肢・正答 | LicenseRef-IPA-Public-Questions。IPAの公表問題利用条件と各確認記録に従う。CC0・MITへ変更しない |
| 第三者の文章・図表・画像・許諾素材 | 対応する個別条件。必要な条件と表示を確認できなければ収録しない |
| VitePress等の依存コード | 各パッケージのライセンス。独自コンテンツの条件と混ぜない |

独自文章とサンプルはAIで作成した。CC0方針は再利用可能にするための意思表示であり、生成物の著作物性や権利帰属を一律に保証する判断ではない。投稿や第三者素材を将来追加するときは、その作成者・権利主体・条件を別に確認する。

## メニューから開くライセンス一覧

本システムでは最初のメニューS01に「テスト開始／学習開始」と別の「ライセンス」ボタンを置く。利用者が選択したとき[ライセンス一覧S11](/screens#license-screen)へ遷移する。全文を開始画面へ常時展開したり、ライセンス閲覧を同意確認の操作としたりしない。

一覧は「本体独自コード」「利用ライブラリ」「問題・解説・素材」の順で表示する。各項目の必須情報は名称、採用版又は不変コンテンツID、権利者・原著作権表示、ライセンス名、適用範囲、ライセンス原文又は個別条件の本文、公式参照先とする。本文はプレーンテキストとしてエスケープし、ライセンス名・リンクだけで原文を代替しない。日本語の要約を付ける場合も原文を保持する。

ライブラリ一覧は本体リリースの依存一覧と通知テキストから作り、CDNから取得するライブラリも含める。今回はKaTeX 0.19.0の原文を[通知ファイル](/notices/katex-0.19.0-LICENSE.txt)に収録し、下記も同じ元ファイルから表示する。これは文書用の参照資料であり、現在の文書サイトでKaTeXを実行しているという意味ではない。本体ではpublic/noticesの原文通知をS11へ読み込む。LucideのISC及びFeather由来部分のMITを同じ通知に保持する。通知ファイルにMIT全文と著作権表示を残し、同梱・改変する場合も元コード内の通知を除去しない。

問題・素材の一覧は配布カタログのrightsごとに適用範囲・権利者・条件本文・出典をまとめる。同じMITという名前でも権利者や対象を省略して統合しない。question.prompt等のrightsRefsとasset／diagramのattributionからS09の個別情報へ追跡できるようにする。S11は全体の案内であり、問題・画像・図に必要な出典、改変表示、個別条件を出題・結果・復習から移動させない。

## KaTeXとCDNの条件

KaTeX 0.19.0のLICENSEはMITであり、著作権表示と許諾文をコピー等に保持する条件を確認した。採用する版のJavaScript・CSS・付属フォントの配布物を対象に通知を維持する。確認したnpm配布物にはpackage/LICENSEがあり、別の通知ファイルは見つからなかった。将来、版や追加フォントを変える場合は配布物を再点検し、固有の通知があれば追加する。[確認範囲R16](/references#数式ライブラリとcdn)を参照する。CDN利用を通知不要と解釈せず、本プロジェクトのCC0へ置換しない。

<<< @/public/notices/katex-0.19.0-LICENSE.txt

jsDelivrのサービス規約はKaTeXのMITとは別に扱う。確認時点では規約に従う個人・商用利用を無料としている。CDNの取得だけで本プロジェクト全体の適法性や無停止を保証するものではない。ライセンス一覧にはjsDelivrの[利用規約](https://www.jsdelivr.com/terms/terms-of-use)と[プライバシーポリシー](https://www.jsdelivr.com/terms/privacy-policy)への外部リンクも載せ、KaTeXの著作権許諾文と混ぜない。

## 公式問題の条件の配置

LicenseRef-IPA-Public-QuestionsはSPDX標準ライセンスの名称ではなく、このプロジェクトが条件を特定するローカル識別子である。[IPA FAQ](https://www.ipa.go.jp/shiken/faq.html)と[公開問題の案内](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/index.html)を根拠資料とし、scope・用途評価・出典・改変・第三者確認・解釈上の限界をrightsへ記録する。

READMEへの記載だけで必要な表示を完了した扱いにせず、[問題・素材単位の表示](/attribution)を実施する。公式問題への独自解説に「公式解説」と表示しない。商標・ロゴ・画面資産、他社解説はこの条件の範囲へ取り込まない。

## MIT — 文書用独自コードのみ

Copyright (c) 2026 OpenCBT-FE-KihonJoho contributors

```text
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

この許諾文のSoftwareは上記の文書用独自コードである。取り込んだ試験問題や第三者素材までを関連文書の語で包括的に再許諾しない。

## CC0 — 独自コンテンツ部分のみ

適用範囲に列挙した独自部分について、権利を有する範囲で[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)に基づき再利用できる方針とする。元の公式・第三者コンテンツの条件、商標その他の権利はこの意思表示で消滅しない。素材ごとのrightsを先に確認する。


## 追加・更新時の配布ゲート

問題の転記・改変、独自解説・図表、ライブラリ・CDN資産の追加時も、リポジトリのfe-question-generationスキルに従う。別年度・別素材へ確認を流用せず、原条件を残したまま追加部分の条件を記録する。

public/notices/index.jsonは通知の名称、版、適用範囲、原資料URL、確認日、原文ファイル、hash、配布経路を保持し、S11へ範囲と全文を表示する。採用パッケージの原文との一致をdata:validateで、実際にビルドされた推移的依存をbuildでも検査する。新しい依存の通知がない場合は配布を止める。CDN版は配布物・フォント・追加通知を手動で再点検する。ビルドツールだけの依存を本体配布コードと混同せず、文書サイトを外部配布する場合はその成果物も別に点検する。[今回の査読](/review)を参照する。
