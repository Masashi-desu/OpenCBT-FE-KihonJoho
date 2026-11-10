type Facts = {
  basis: string;
  options: Record<string, RegExp>;
  cases: readonly (readonly [condition: RegExp, expected: string, explanation: RegExp])[];
};

// Conditions, classifications, and conclusions are reviewed separately from the generators.
export const facts: Record<number,Facts> = {
  27:{
    basis:'https://www.w3.org/TR/css/',
    options:{ publish:/^CMS$/, style:/^CSS$/, feed:/^RSS$/, collaborative:/^Wiki$/ },
    cases:[[/文字の大きさ.*行間/, 'style', /段階的スタイルシート/],
      [/承認及び公開日時を管理/, 'publish', /記事を公開するまでの承認や公開日時/],
      [/購読用ソフトウェアで更新/, 'feed', /見出しやリンクをまとめて配信/],
      [/知識を共同編集/, 'collaborative', /ブラウザを使ってページを追加・編集/]],
  },
  30:{
    basis:'https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-22-fast-prefiltered-lines',
    options:{ edge:/^アンチエイリアシング$/, texture:/^テクスチャマッピング$/, morph:/^モーフィング$/, ray:/^レイトレーシング$/ },
    cases:[[/傾いた直線を滑らか/, 'edge', /ぎざぎざを目立たなく/], [/表面に木目/, 'texture', /画像上の位置を対応/],
      [/中間形状の画像/, 'morph', /対応点などを使って中間形状/], [/反射や屈折も含めて/, 'ray', /光線と物体の交点/]],
  },
  31:{
    basis:'https://doi.org/10.1145/362384.362685',
    options:{ hierarchy:/子レコードをポインタ/, markup:/タグを用いて/, object:/データと手続を一体化/, relation:/2次元の表/ },
    cases:[[/関係データベースの説明/, 'relation', /属性を列，レコードを行/], [/階層型データベースの親子/, 'hierarchy', /親と子の木構造/],
      [/XMLで文書を記述/, 'markup', /タグで要素を区切り/], [/オブジェクト指向データベースが扱う/, 'object', /データを操作する手続を一体/]],
  },
  34:{
    basis:'https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS',
    options:{ twoPhase:/2相ロック/, wait:/専有ロックと専有ロックが競合/, exclusive:/アクセスできないよう/, cycle:/互いに相手のロック/ },
    cases:[[/デッドロックの説明/, 'cycle', /待ちの循環/], [/一方向のロック待ち/, 'wait', /後から要求した処理は待つ/],
      [/遮断する排他制御/, 'exclusive', /同じ資源へ同時にアクセスすることを抑える/]],
  },
  36:{
    basis:'https://www.postgresql.org/docs/current/continuous-archiving.html',
    options:{ index:/^インデックスデータ$/, checkpoint:/^チェックポイントデータ$/, dictionary:/^ディクショナリデータ$/, log:/^ログデータ$/ },
    cases:[[/別の媒体に保存/, 'log', /バックアップ後に実行した更新を再現/],
      [/表の全行を順に読まず/, 'index', /検索キーと行の位置/], [/列の型及び制約/, 'dictionary', /定義情報を管理/]],
  },
  38:{
    basis:'https://www.rfc-editor.org/rfc/rfc1122.html#section-1.1.3',
    options:{ app:/^アプリケーション層$/, net:/^インターネット層$/, transport:/^トランスポート層$/, link:/^リンク層$/ },
    cases:[[/，TCPが属する/, 'transport', /信頼性のあるデータ転送/], [/IPv4が属する/, 'net', /ネットワークを越えてパケット/],
      [/HTTPが属する/, 'app', /Webの要求と応答/], [/イーサネットのフレームを扱う/, 'link', /フレーム転送はリンク層/]],
  },
  39:{
    basis:'https://www.rfc-editor.org/rfc/rfc2045.html',
    options:{ still:/^JPEG$/, attachment:/^MIME$/, video:/^MPEG$/, mail:/^SMTP$/ },
    cases:[[/電子メールに画像データなどを添付/, 'attachment', /電子メールで画像などを扱う/],
      [/静止画像を圧縮/, 'still', /静止画像の符号化/], [/動画と音声を符号化/, 'video', /動画像や音声の符号化/],
      [/メールサーバ間で転送する/, 'mail', /電子メールの転送を定める/]],
  },
  40:{
    basis:'https://www.rfc-editor.org/rfc/rfc792.html',
    options:{ bootstrap:/^BOOTP$/, lease:/^DHCP$/, management:/^MIB$/, reach:/^ping$/ },
    cases:[[/ネットワークの疎通確認/, 'reach', /エコー要求と応答/], [/一定期間貸し出し/, 'lease', /アドレスを一定の期間貸し出し/],
      [/管理対象の項目として/, 'management', /管理対象を定義/], [/起動ファイル名を返す/, 'bootstrap', /起動用ファイル名を得る/]],
  },
  41:{
    basis:'https://www.rfc-editor.org/rfc/rfc2104.html',
    options:{ integrity:/改ざんされていない/, algorithm:/暗号化方式/, summary:/概要/, privacy:/秘匿性/ },
    cases:[[/ダイジェストの利用目的/, 'integrity', /受信側で検証.*改ざんされていない/],
      [/受信者だけが持つ秘密鍵で復号/, 'privacy', /送信中のメッセージの秘匿性/],
      [/ヘッダのアルゴリズム識別子/, 'algorithm', /適用すべき暗号化方式/]],
  },
  42:{
    basis:'https://pages.nist.gov/800-63-4/sp800-63b.html',
    options:{ identity:/^パスワードに対応する利用者ID|^利用者名をソルト|^利用者IDをハッシュ/, compressed:/圧縮して/,
      cleartext:/^パスワードをそのまま登録(?:しておき|し，)|^変更後のパスワードをそのまま保存/,
      verifier:/^パスワードをハッシュ値に変換して登録|^利用者ごとのソルトとパスワードからハッシュ値|^変更後のパスワードから新たに照合用のハッシュ値/ },
    cases:[[/パスワードファイルへの不正アクセス/, 'verifier', /ハッシュ値だけを保存/],
      [/利用者ごとに異なるソルト/, 'verifier', /照合には同じソルト/],
      [/変更前や変更後の平文を保持しない/, 'verifier', /登録している値を置き換える/]],
  },
  43:{
    basis:'https://csrc.nist.gov/pubs/sp/800/83/r1/final',
    options:{ file:/感染前のファイルと感染後/, signature:/シグネチャコード/, behavior:/異常現象を監視/, digest:/チェックサムと照合/ },
    cases:[[/パターンマッチング方式/, 'signature', /特徴的なシグネチャ/],
      [/実行時の通常とは異なる動き/, 'behavior', /実行中にどのように振る舞う/],
      [/正常時に求めた短い検査値/, 'digest', /保存したチェックサムと現在の検査値/]],
  },
  44:{
    basis:'https://www.rfc-editor.org/rfc/rfc7208.html',
    options:{ outbound:/^OP25B/, sender:/^SPF/, address:/誤送信対策/, relay:/不正中継対策/ },
    cases:[[/宛先アドレスの確認/, 'address', /宛先を確認すると誤送信/], [/許可された送信サーバ/, 'sender', /方針と接続元を照合/],
      [/25番ポートの直接通信/, 'outbound', /一般の利用回線からの直接のメール送出を制限/],
      [/認証されていない外部の利用者/, 'relay', /第三者のメール転送に使われない/]],
  },
  47:{
    basis:'https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/',
    options:{ top:/^トップダウンテスト$/, black:/^ブラックボックステスト$/, bottom:/^ボトムアップテスト$/, white:/^ホワイトボックステスト$/ },
    cases:[[/内部構造を考慮することなく/, 'black', /仕様で期待する機能を入力と出力/], [/内部の分岐や処理経路/, 'white', /内部の命令や分岐を基準/],
      [/下位の呼出先をスタブ/, 'top', /上位のモジュールから結合/], [/上位の呼出側をドライバ/, 'bottom', /下位から結合/]],
  },
  48:{
    basis:'https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/',
    options:{ operation:/^運用テスト$/, integration:/^結合テスト$/, system:/^システムテスト$/, regression:/^リグレッションテスト$/ },
    cases:[[/影響を受けないはずの箇所/, 'regression', /従来の機能に副作用/], [/モジュールをつないで/, 'integration', /インタフェースや相互作用/],
      [/性能要件を全体として/, 'system', /システム全体が機能や性能/], [/運用担当者が監視/, 'operation', /監視や障害対応の手順/]],
  },
  49:{
    basis:'https://www.w3.org/TR/soap12-part1/',
    options:{ interface:/インタフェースを記述/, registry:/サービスの情報を登録/, message:/XML形式のメッセージ/, reliable:/配信保証や重複防止/ },
    cases:[[/SOAPの役割/, 'message', /XML.*形式のメッセージを受け渡す/], [/WSDLの役割/, 'interface', /メッセージなどのインタフェースを記述/],
      [/UDDIの役割/, 'registry', /Webサービスを登録し，利用者が見つける/], [/WS-ReliableMessagingの役割/, 'reliable', /到達や重複の制御/]],
  },
  50:{
    basis:'https://doi.org/10.1109/2.59',
    options:{ waterfall:/^ウォータフォールモデル$/, spiral:/^スパイラルモデル$/, prototype:/^プロトタイピングモデル$/, data:/^リレーショナルモデル$/ },
    cases:[[/開発プロセスを繰り返し/, 'spiral', /各反復でリスクを評価/],
      [/次の工程へ順に/, 'waterfall', /工程ごとの成果物を確定/], [/試作品を作り/, 'prototype', /試作品を利用者に確認/]],
  },
  53:{
    basis:'https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/',
    options:{ cases:/消化件数/, fixture:/データの作成量/, launches:/起動回数/, changes:/修正量/ },
    cases:[[/進捗管理に使用する指標/, 'cases', /消化件数を予定の件数と比べる/],
      [/実行前に作成する入力用/, 'fixture', /入力用データを何件準備/], [/起動を繰り返す試行/, 'launches', /試行の実施量はプログラムの起動回数/]],
  },
};
