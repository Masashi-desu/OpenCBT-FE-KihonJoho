# 任意の詳細解説UI

## 目的と責務

通常解説 `question.explanation` を必須の構造化contentとして保持し、必要な場合だけ「詳細解説を見る」から別画面へ遷移する。問題・選択肢・関連概念を網羅的に説明する専用UIをHTML/CSS/JSで用意できる。初期表示はパラメータで指定でき、その後のタブ・選択肢・処理段階等の切替は専用UIが担当する。

共通基盤は参照解決、資源の検査、画面遷移、保存済み条件の受け渡し、隔離実行、通常解説への復帰を担当する。個々の解説内容、タブ名、パラメータの意味、切替規則を解釈しない。詳細解説は採点・練習の開始・再開の必須資源ではない。

public/explanations/host.htmlとビルド時に出力するruntime.jsは内容を持たない共通ホストである。2026年度科目A問2には[ソート解説・動作シミュレーター](/sort-explanation)、2024年度科目A問13には[アローダイアグラム解説](/arrow-explanation)を、それぞれ問題専用ディレクトリに配置する。

## 問題側の任意参照と配置

参照先はアプリ配布ルートを基準とした `explanations/<問題専用名>/` とする。専用名は小文字英字で始まる3〜80文字の英数字・ハイフンで、Schemaに従う。問題ごとに専用ディレクトリを用意し、同じ原問題の年度別問題・生成用基準問題は同じディレクトリを参照できる。

```text
public/explanations/<問題専用名>/
  manifest.json
  index.html
  style.css
  main.js
  assets/
```

問題JSONへHTML/CSS/JSそのものを入れない。任意のdetailedExplanationRefにdirectory、revision、必要ならinitialParametersを保存する。次は形式の説明であり、配布問題へ登録する例ではない。

```json
{
  "detailedExplanationRef": {
    "directory": "explanations/question-example/",
    "revision": 1,
    "initialParameters": {
      "contentId": "comparison",
      "choiceId": "choice-example"
    }
  }
}
```

initialParametersは最大32項目の文字列・有限数値・真偽値である。値の意味は専用UIが定める。choiceIdは永続選択肢IDとし、並べ替えで変わる「ア・イ」を識別子にしない。省略時は空の指定を渡し、専用UIが既定の内容を決める。

参照・初期値は問題の内容hashに含まれる。参照追加時は問題改訂・関連する基準hash・テンプレート参照を更新する。旧保存問題へ参照を補完せず、正常な旧本文・通常解説・正答・結果を保持する。任意項目の追加は3.0.0 Schemaで旧データを引き続き受理し、未対応の旧アプリへの前方互換を保証しない。

## 専用manifestと資源

manifest.jsonの正本は [detailed-explanation.schema.json](/schemas/detailed-explanation.schema.json)。apiVersion=1、revision、title、attribution、filesを記録する。filesはindex.htmlを含み、相対パス・mediaType・配布バイト列のSHA-256を保持する。revisionは問題側と完全一致させ、別版へ自動追従しない。

定義や計算量を照合した資料は、任意の`references`へ表示名`title`と`sourceRefs`を記録する。資料IDは`bundle.sources`に登録した公開・確認済みの資料へ解決する。ソート解説では「参考資料（定義・計算量の確認）」という専用欄を表示し、詳細解説の作成主体・権利表示と、元問題の出典・ライセンスフッターから分ける。`references`を持たない旧manifestも受理し、その場合は参考資料欄を表示しない。転載・改変した素材の出典や権利条件は引き続き`attribution`へ記録し、参考資料欄で代替しない。

HTML・CSS・JavaScript、静止PNG/JPEG/WebP、WOFF2を扱う。最大64ファイル、各2MiB、合計8MiB、manifestは64KiBとし、8秒で取得を打ち切る。外部URL、上位パス、未宣言ファイル、種別やhashの不一致を受け付けない。SVGが必要なら管理済みHTML内のインライン要素として作成する。

共通基盤がリンクしたCSSとclassic JSを読み、隔離画面へ渡す際に展開する。画像・フォントもmanifest内の資源だけをデータURLへ解決する。CSSのurl()はCSSファイルからの相対位置で解決する。CSSの@import、画像のsrcset、外部ライブラリ・外部モジュール取得は扱わない。依存は同梱JS/CSSへまとめ、ライブラリの通知を既存のライセンス管理へ登録する。動的画像にはOpenCBTDetail.assetsのパス別データURLを使える。

base要素やiframe／object／embedの入れ子は受け付けない。専用HTMLのhttp-equiv指定は取り除き、共通ホストのCSP・遷移制限を使用する。

配布時は存在するパッケージのSchema・版・hash・サイズ・出典・素材条件・未宣言ファイルを検査する。ディレクトリ自体の欠落は任意資源なしとして許可する。未参照の専用ディレクトリやsymlinkを配布しない。catalog.filesやassetRefsへ詳細解説ファイルを混入させない。

## 画面遷移と戻る操作

[検索画面](/search)では、検査済みのパッケージをタイトル・対応問題の学習用語から検索できる。任意のmanifest.searchにsummary・keywords・textを置くと、動的に表示される解説文も検索対象にできる。Schemaの上限とmanifestの64KiB上限を守る。検索のためにパッケージのHTML・JSを実行しない。検索からの閲覧は公開問題のコピーを渡し、生成・採点・保存を行わない。練習からの以下の経路はそのまま維持する。

学習で正答を表示した現在の問題、または終了後の復習から開ける。正答表示前・時間付き練習の解答中には導線を出さない。参照先の取得・検査が成功した場合にだけ通常解説の下に「詳細解説を見る」を表示する。

経路は `#/detail/<sessionId>/<entryIndex>/<exam又はreview>`。任意のquery `initial` はJSON形式の初期表示指定であり、保存されたinitialParametersへ重ねて専用UIに渡す。共通基盤は内容切替を実行しない。問題本文・正答・生成値をURLへ詰め込まない。

遷移はブラウザ履歴へ追加する。「通常解説へ戻る」とブラウザの戻るで、同じ問題・選択肢順・解答・本文／解答領域のスクロール位置・資料の表示設定へ戻す。元画面は隠して保持する。直接URLや再読み込みでは保存sessionを検証して指定問題を表示する。無効な問題・解説へのアクセスでは詳細画面を開かない。

遷移で回答・revealed・採点を変更しない。経過時間は既存の時計の規則を継続する。詳細画面では元問題の出典・権利・改変情報を常時展開し、折り畳み操作を表示しない。詳細解説自身のattributionは別に表示する。

## 保存済み条件と初期表示の受け渡し

ホストは専用JSの実行前に `window.OpenCBTDetail` を用意する。DOMは配置済みなのでDOMContentLoadedを待つ必要はない。

| API／データ | 契約 |
| --- | --- |
| OpenCBTDetail.context.apiVersion | 接続仕様1 |
| context.question | 練習では保存済みquestion全体、検索では収録公開問題のコピー。本文・選択肢・正答・通常解説を含む |
| context.choiceOrder | 表示順の `{id, label}`。labelはその出題の「ア・イ」等 |
| context.selectedChoiceId | 保存した解答ID。未解答はnull |
| context.initialParameters | 保存指定と遷移時の指定を合わせた初期内容パラメータ |
| context.generation | 生成問題ではtemplateRef、baseQuestionRef、generatorRef、parameters。年度別元データはnull |
| context.theme | 初期のlight又はdark |
| OpenCBTDetail.assets | manifestで宣言した資源のパス別データURL |
| OpenCBTDetail.ready() | 初期描画の完了を通知する。8秒以内に呼ぶ |
| OpenCBTDetail.onThemeChange(listener) | light／dark変更の通知。戻り値の関数で購読解除 |

contextとassetsはコピーして深く凍結する。生成値は保存したinstance.parametersをそのまま渡す。基準値・最新版の生成器・シードから再生成せず、問題文を解析して値を取り出す契約にしない。parameters.valuesの位置はgeneratorRef・templateRefの入力契約に従う。

初期指定の解釈、他の選択肢・概念への切替、操作による一時的なシミュレーションは専用UIが行う。保存条件を上書きせず、操作用状態をUI内に別途作る。共通基盤はタブやステップの状態を永続保存せず、再度開くと初期指定から開始する。

## 隔離と実行

共通ホストをsandbox=allow-scriptsのiframeとして開き、allow-same-originは付けない。開発側で管理・査読したパッケージだけを実行する。通常の問題ブロック・疑似言語・データに書かれた式の実行は認めない。

初期化データは一度だけ送る。API版、接続時のランダムtoken、event.source、隔離origin=nullを照合して通知を受け取る。ホストは親windowからの初期化だけを受け付ける。隔離originへの送信はtargetOrigin=*が必要なため、自己遷移・再読み込みではデータを再送せず通常解説へ戻す。

専用ホストのCSPで外部資源、fetch等の接続、子frame、object、フォーム送信を制限する。本体DOM・IndexedDB・採点への直接アクセスを与えず、解答更新や保存の通信APIも設けない。任意コードを完全に安全にする保証ではなく、専用コードの査読・依存条件の確認を併用する。

フォーム送信は禁止されるため、入力適用などはbuttonのclickと入力欄のEnterを専用JSで処理する。submitイベントを操作の入口にしない。解説のCSSは本体のHTML準備中に非実行の符号化データとして保持し、隔離ホスト内でだけstyle要素へ復元する。本体のCSPを緩めず、コメントやJS文字列にあるstyleタグ風の文字列を書き換えない。

本体と同じスクロール実装・CSSを適用し、標準バー・gutterを隠して半透明バーを前面へ重ねる。バー用の幅を確保せず、レイアウトを変えない。専用UIもキーボード、読み上げ、狭い画面、テーマに対応する。

共通の色は[src/ui/tokens.cssに定義したCSS変数](/screens#共通色の定義と利用)を使う。ホストは初期化時に正本のCSSを渡し、パッケージのCSSより後に適用する。テーマ変更はcontext.themeとonThemeChangeに従い、専用UIがdata-themeを更新する。HTMLを単独で表示する用途では、正本から生成したtheme.cssを同梱する。共通色の別定義や固定色のフォールバックを追加しない。

## 利用できない参照先

参照なし、旧snapshotに項目なし、404、取得失敗、サイズ超過、未対応API、改訂不一致、hash不一致、不正な資源・素材参照は、詳細解説が存在しない場合と同じ導線にする。通常解説だけを表示し、開始・再開・復習・採点を止めない。

遷移後の初期化失敗、readyの8秒超過、専用JSのエラー・未処理Promise拒否、自己遷移では通常解説へ戻り、その表示中の詳細解説ボタンを除く。S10やsession.invalidatedへ送らず、結果・回答を保持する。問題を開き直すと取得を再試行できる。

表示資源の読み込みエラーやホストCSPによる拒否も同じ復帰処理を使う。失敗通知が重なっても戻る処理は一度だけ実行する。問題JSON自体のSchema違反は既存の不正データ規則に従い、ここではSchema適合した参照先の利用可否を扱う。

旧版パッケージの長期保持やIndexedDBへの保存は必須としない。残っている一致版だけを使い、なくなった場合は通常解説へ戻る。通常解説と保存済み問題の保持は引き続き必須である。

## 検証と今後の追加

参照・Schema・経路・パラメータ・hash・サイズ・送信元・保存値のコピー・通常解説の保持をtests/detailed-explanation.test.tsで検査する。ブラウザでは配布へ含めない接続確認用fixtureを使い、初期表示、切替、戻る／進む、再読み込み、テーマ、狭い画面、隔離、失敗時の復帰を確認する。

実際の詳細解説追加には[作問品質](/question-authoring)、[内容と正答の必須テスト](/acceptance#生成内容と正答の必須テスト)、[素材条件](/attribution)を適用する。全選択肢の真偽・説明と生成入力に対する結論を独立解又は査読済み資料で検証する。基盤の成功を未作成の解説内容の正しさの確認と扱わない。

接続確認fixtureは `npx tsx scripts/verify-detail-browser.ts <起動済み本体URL>` でoutput/playwright/detailに生成する。隔離したPlaywright CLIの同一セッションでseed.js、verify.js、failures.jsをrun-codeのfilename指定で順に実行する。seedは専用ブラウザのIndexedDBにだけ問題と結果を保存し、ネットワーク応答を模擬する。大きなfixtureをCLIが表示するため、出力は検証ログへ保存する。ユーザーの通常ブラウザで実行しない。
