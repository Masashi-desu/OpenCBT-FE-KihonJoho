# 出典・改変・権利情報の表示

## ATTR-01 — 常時見える表示

本システムではS03の解答領域で問番号見出しの上に、出自と出典の帯を置く。公式再録・改変・独自の区分を折りたたみ詳細の中だけへ隠さない。出典が長い場合も折り返し、リンク名に「原資料」を使う。

| 条件 | 常時表示する文言 | データ |
| --- | --- | --- |
| 公式再録 | 「公式公開問題」 | `question.origin.kind=official_reprint`。対象sourceのpublisherがIPAであることを収録時確認 |
| 公式に基づく改変 | 「公式問題を基にした問題」 | `origin.kind=official_adaptation` |
| 独自 | 「独自問題」 | `origin.kind=original` |
| 改変あり／なし | 「改変あり」又は「改変なし」。出自区分と並べて常時表示 | `session.entries[].issuedContent.isModified`。bindingPerformed=trueならtrue、falseなら使用した元questionのorigin.isModifiedを保持。値・テキスト・図の差から判定しない |
| 出題経路 | 「元データ使用」又は「値を生成してバインド」 | issuedContent.bindingPerformedのfalse／true。trueではgeneratedInstanceIdが必須。既存の出自・改変表示も維持 |
| 出典 | 「出典：年度・期・試験区分・原科目／時間区分・問番号」 | `origin.sourceRefs[].locator`。無い期や時間区分を作らない |
| 原資料 | 「原資料（発行主体のページ／PDF）」 | sourceRef.sourceId→`source.title`・`publisher`・`url`、PDFはlocator.pageをリンク表示にも併記 |
| 改変概要 | 「改変：…」と意味のある全変更のsummary | `origin.changes[]`でkindがtranscription／layout以外のsummary。詳細はS09 |
| 組版調整 | 「改行・字間等を表示用に調整」 | changesにlayout／transcriptionがある場合。内容改変と混同しない |
| 出典詳細 | 「出典・改変の詳細」 | S09を開き、locator・source・rights・changes.summaryを表示。生成時の詳細は正答確認後 |

サンプル公式問の表示例は「出典：2025年度 基本情報技術者試験 科目A 問16」。原資料は実際のPDFへリンクする。改変サンプルでも原出典を保持し、画面上の現在問番号を元資料の問番号へ上書きしない。

## 部品・素材別の表示

| 表示箇所 | 表示内容 | JSONとの対応 |
| --- | --- | --- |
| 共通本文／問題文の下 | 当該部品の独立した出典があれば追記。問題帯と同じ出典は文字列を重複しなくても詳細へ列挙する | `contexts[].content.attribution`／`prompt.attribution` |
| 選択肢領域の下 | 問題文と異なるsource・rightsがあれば対応する選択肢の表示ラベルと共に示す | `choices[].content.attribution`。ラベルはsessionのchoiceOrderから生成 |
| 正答欄 | 「正答の根拠：資料名・位置」又は「本プロジェクトによる検証」 | `correctAnswer.attribution.origin/sourceRefs/rightsRefs/creatorIds` |
| 解説見出し | originalなら「本プロジェクトの独自解説（公式解説ではありません）」 | `explanation.attribution.origin`。creatorIdsはcatalog.actorsへ解決 |
| 解説の下 | 解説固有の出典・追加条件 | `explanation.attribution.sourceRefs/rightsRefs` |
| 画像の直下 | caption、素材出典、権利者、必要なattributionText、改変情報 | image.assetId→`asset.attribution`→source・rights、`image.caption`。`asset.alt`は代替文 |
| 表の直後 | content単位の出典・権利表示。表だけ第三者条件の場合は独立したcontentへ分ける | 表を保持するcontent.attributionのrightsRefs。asset扱いの表画像はassetの条件 |
| 描画した図の直下 | 原図にあるcaption、素材の出典・条件、図に関する改変。代替説明は読み上げ用とし画面へ追加しない | `diagram.caption/alt/scene/attribution`。描画コードの条件を素材へ適用しない |
| S09詳細 | 元データ使用又はバインド実施、保持した基準問題と原本への参照、権利主体、利用根拠、適用範囲、licenseId、第三者確認、改変詳細、確認日 | session.entries[].issuedContent.bindingPerformed、template.baseQuestionRef（元データへのリンク）、origin.sourceRefs／derivedFrom、rights.holders/basis/evidence/scope/licenseId/thirdParty/checkedOn、source.checkedOn、changes |

`rights.attributionText` が空でなければ、条件の対象である部品の直下へ本文として表示する。第三者の表示条件をリンク先・README・ツールチップだけへ移さない。同じ範囲に適用する複数rightsの表示を全て維持する。必要な権利情報の参照がない場合、その問題を通常表示しない。

## 原問と変更の詳細

S09は、`origin.derivedFrom[].questionId/revision` からカタログ内の派生元を解決し、そのorigin.sourceRefsから原資料を示す。原資料へのURLと内部の派生元IDを別に表示する。元問題を再配布できない場合にも、確認できる原資料の出典・位置は維持するが、条件不明の派生問を配布可能にしない。

変更一覧はchangesのat・actorId・kind・summary・affectsAnswerを時刻順で表示する。生成問題のdetailsは生成値を含み得るため、正答確認後又は終了後に表示する。固定問題の正答を含まないdetailsは出題中も表示できる。作者・編集者はcontributorsから引く。追加部分のlicenseを表示しても、原部分の条件を上書きしない。

生成枠ではquestionをinstance.questionから解決し、S09に比較基準、基準問題ID・revision、template ID・revision、generator ID・version、実際のパラメータ、seededの場合のシードを正答確認後又は終了後に示す。生成中の基準問題の展開も同じ条件とし、出題中は確認後に表示する旨を案内する。元からある出典・改変履歴を省略しない。summaryは出題前に表示できる変更概要に限定する。detailsには生成入力の変更内容を保持して表示時点を制限し、正答を含む変更詳細はchanges[].answerDetailsへ分離する。answerDetailsはpractice終了後又はstudyで正答を確認した後だけ表示する。

## ATTR-02 — 結果・復習・外部リンク

S04・S06の問題別一覧でも改変あり／なし・出自・生成枠の区別・詳細リンクを維持し、S06には短い出典も示す。S07ではS03と同じ常時帯と素材別の条件を表示し、当時の選択肢順と当時の出典・rights・instanceを使う。全文表示で必要な表示を結果だけで省略しない。

外部リンクはHTTPSの原URLを通常のリンクで開き、別タブにはnoopener／noreferrerを付ける。資料をiframeへ埋め込まず、IPAページのURLが利用者に分かる形を保つ。[IPAサイト利用案内R11](/references)を参照する。

取り下げによって表示を禁止した本文・画像はS07でも出さない。初期実装は[保守](/maintenance)に従い対象snapshotを含むセッション・結果全体を削除する。出典表示が残っているだけで、撤回された素材を再表示できると扱わない。
