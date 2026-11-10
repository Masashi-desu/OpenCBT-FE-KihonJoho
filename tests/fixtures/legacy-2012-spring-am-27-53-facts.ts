type Facts = {
  basis: string;
  options: Record<string, RegExp>;
  cases: readonly (readonly [condition: RegExp, expected: string, explanation: RegExp])[];
};

// Classify the displayed statements by subject matter and compare them with separately reviewed criteria.
export const knowledgeFacts: Record<number, Facts> = {
  27: {
    basis: 'https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html',
    options: { morph: /滑らかに変化/, render: /描画できるように2次元化/, face: /多面体を構成/, texture: /表面に貼り付ける/ },
    cases: [[/ポリゴンの説明/, 'face', /平面の多角形/], [/モーフィングによって/, 'morph', /中間形状/],
      [/レンダリングされた出力画像/, 'render', /画面に表示する2次元画像/], [/使うテクスチャ画像/, 'texture', /表面へ柄や模様/]],
  },
  28: {
    basis: 'https://doi.org/10.1145/320434.320440',
    options: { physical: /表として実装することを前提/, entity: /エンティティ及びエンティティ間|エンティティ間の多重度/,
      lifecycle: /生成から消滅/, process: /業務上の手順/ },
    cases: [[/E-R図/, 'entity', /実体と実体間の関連/], [/データライフサイクルモデル/, 'lifecycle', /生成し，利用・保持して廃棄/],
      [/業務プロセス図の作業同士/, 'process', /どの順番で進める/]],
  },
  29: {
    basis: 'https://www.postgresql.org/docs/current/sql-createview.html',
    options: { definition: /名前を付けた導出表|なら，導出元には利用できない|基底表を複製/,
      nesting: /ビューに対して、?，?ビューを定義|新しいビューを定義できる|導出元として再利用できない/,
      timing: /定義してから|定義を行ってから/, multiple: /一つだけ定義|一つしか定義|複数のビューを定義/ },
    cases: [[/におけるビューに関する/, 'definition', /名前付きの導出表/],
      [/既存のビューを基に/, 'nesting', /定義済みのビューを別のビュー/],
      [/部門別に見せ分ける/, 'multiple', /同じ既存の基底表を複数/]],
  },
  32: {
    basis: 'https://www.postgresql.org/docs/current/wal-configuration.html',
    options: { checkpoint: /更新データを定期的/, copy: /常に同一データ/, backup: /ディスク単位で複写/, log: /更新前後の値/ },
    cases: [[/ログファイルの説明/, 'log', /更新の取消しや再適用/], [/チェックポイントで行う/, 'checkpoint', /処理すべき範囲を減らす/],
      [/同期複製の説明/, 'copy', /同じ更新を反映/], [/バックアップの説明/, 'backup', /複写を保存/]],
  },
  33: {
    basis: 'https://www.postgresql.org/docs/current/explicit-locking.html',
    options: { speed: /アクセス頻度/, size: /データの範囲は極力|より別々の行|ロックの範囲を広く/,
      deadlock: /デッドロックを防止|デッドロックを必ず防止|互いに待つ/, concurrent: /同時に更新|同時に変更/ },
    cases: [[/の排他制御に関する/, 'concurrent', /更新の消失/], [/表単位のロックと行単位/, 'size', /別行の更新も止まる/],
      [/デッドロックに関する/, 'deadlock', /資源を待つ循環/]],
  },
  35: {
    basis: 'https://www.itu.int/rec/T-REC-X.200-199407-I/en',
    options: { gateway: /^ゲートウェイは，.*プロトコル.*変換/, bridge: /^ブリッジは，(?:IP|MAC)アドレス.*フレーム.*中継/, repeater: /^リピータは，.*信号を増幅.*伝送距離を延長/, router: /^ルータは，(?:MACアドレス.*フレーム|IPアドレス.*パケット).*中継/ },
    cases: [[/に関する記述のうち，適切/, 'repeater', /物理層の信号/], [/ブリッジの中継機能/, 'bridge', /データリンク層のMAC/],
      [/ルータの中継機能/, 'router', /宛先IP/]],
  },
  36: {
    basis: 'https://www.rfc-editor.org/rfc/rfc2045.html',
    options: { document: /^HTML$/, handling: /^MHS$/, media: /^MIME$/, transfer: /^SMTP$/ },
    cases: [[/ヘッダフィールドの拡張/, 'media', /種類や符号化/], [/ハイパーリンクなどをマークアップ/, 'document', /文書の構造/],
      [/X\.400シリーズで規定/, 'handling', /メッセージ処理システム/], [/メールサーバ間で宛先/, 'transfer', /メールの転送手順/]],
  },
  37: {
    basis: 'https://www.rfc-editor.org/rfc/rfc3022.html',
    options: { config: /^DHCP$/, lookup: /^DNS$/, translation: /^NAPT$/, authentication: /^RADIUS$/ },
    cases: [[/一つのグローバルIPアドレス/, 'translation', /アドレスとポート番号を変換/], [/設定を自動的に配布/, 'config', /アドレスなどを配布/],
      [/ドメイン名から対応する/, 'lookup', /ドメイン名をIP/], [/認証を認証サーバに依頼/, 'authentication', /認証・認可/]],
  },
  38: {
    basis: 'https://www.rfc-editor.org/rfc/rfc1939.html',
    options: { link: /PPPのリンク/, relay: /メールサーバ間/, fetch: /取り出す|取得したメッセージ/, folder: /利用者が電子メールを送る|^サーバ上のメールフォルダを/ },
    cases: [[/であるPOP3/, 'fetch', /受信メールを取り出す/], [/SMTPのサーバ間リレー/, 'relay', /次のメールサーバへ送る/],
      [/IMAPのフォルダ操作/, 'folder', /メールフォルダの操作/]],
  },
  39: {
    basis: 'https://www.w3.org/TR/CSS/',
    options: { external: /^CGI$/, style: /^CSS$/, language: /^PHP$/, inclusion: /^SSI$/ },
    cases: [[/表示クライアント側/, 'style', /要素の表示を指定/], [/外部プログラムを起動/, 'external', /外部プログラムの間/],
      [/別のファイルの内容を応答に挿入/, 'inclusion', /ファイル内容などを取り込む/]],
  },
  40: {
    basis: 'https://csrc.nist.gov/pubs/fips/180-4/upd1/final',
    options: { delivery: /送達の確認/, integrity: /改ざんの有無/, confidential: /盗聴の防止/, identity: /なりすましの防止/ },
    cases: [[/そのハッシュ値と.*比較/, 'integrity', /改ざんを検出/], [/受信者の公開鍵で電子メール本文を暗号化/, 'confidential', /本文の内容を秘匿/],
      [/受領通知を送信者に返す/, 'delivery', /サーバへ届いたことを確認/]],
  },
  41: {
    basis: 'https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final',
    options: { same: /同じ秘密鍵/, openBoth: /暗号化鍵と復号鍵(?:は|を)公開/, openEncrypt: /暗号化鍵は公開/,
      encryptAndAlgorithm: /暗号化鍵と暗号化アルゴリズムは公開/, openDecrypt: /^(?:復号鍵と暗号化アルゴリズムは公開|復号鍵を公開し|受信者の復号鍵は公開)/,
      hybridCorrect: /受信者の公開鍵と両アルゴリズム/, hybridWrong: /文書用の共通鍵は公開/ },
    cases: [[/場合の公開鍵暗号方式/, 'encryptAndAlgorithm', /受信者だけが持つ秘密鍵/], [/場合の共通鍵暗号方式/, 'same', /同じ秘密の鍵/],
      [/ハイブリッド方式/, 'hybridCorrect', /共通鍵を受信者の公開鍵で保護/]],
  },
  42: {
    basis: 'https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final',
    options: { test: /有効性を検証/, training: /関係者を集めて教育/, maintenance: /内容を見直す/, impact: /最大停止時間/ },
    cases: [[/ビジネスインパクト分析/, 'impact', /停止による影響/], [/の検証段階/, 'test', /機能するかをテスト/],
      [/関係者が手順を学ぶ/, 'training', /代替手順と復旧手順について教育/], [/の保守段階/, 'maintenance', /環境の変化を計画へ反映/]],
  },
  44: {
    basis: 'https://www.rfc-editor.org/rfc/rfc826.html',
    options: { apps: /インストールされているソフトウェア/, hardware: /MACアドレスを確認/, os: /パッチ適用状況/, antimalware: /定義ファイルを確認/ },
    cases: [[/ARPの仕組み/, 'hardware', /同一リンク上でIPアドレスに対応するMAC/], [/導入済みアプリケーションの一覧だけ/, 'apps', /許可済みの一覧と照合/],
      [/適用した更新プログラムの一覧だけ/, 'os', /既知の最新版と照合/]],
  },
  45: {
    basis: 'https://www.ipa.go.jp/security/vuln/websecurity/about.html',
    options: { query: /想定外のSQL文を実行/, script: /ブラウザで悪意のあるスクリプト/, path: /意図していないパス/, session: /セッションIDを不正に取得/ },
    cases: [[/ディレクトリトラバーサル攻撃/, 'path', /公開範囲外のファイル/], [/SQLインジェクション攻撃/, 'query', /入力を命令の一部/],
      [/クロスサイトスクリプティング攻撃/, 'script', /利用者のブラウザで実行/], [/セッションハイジャック攻撃/, 'session', /同じログイン状態/]],
  },
  46: {
    basis: 'https://docs.oracle.com/javase/tutorial/java/concepts/',
    options: { message: /メッセージを送/, encapsulation: /内部のデータを直接変更|内部のデータや実装を隠し/,
      inheritance: /下位クラスは上位クラス/, dictionary: /データ辞書に登録/ },
    cases: [[/プログラミングの特徴/, 'message', /メッセージを送り，協調/], [/カプセル化の特徴/, 'encapsulation', /内部実装やデータを外部から隠し/],
      [/クラスの継承の特徴/, 'inheritance', /上位クラスの機能や性質を受け継ぐ/]],
  },
  47: {
    basis: 'https://glossary.istqb.org/',
    options: { emulator: /^エミュレータ$/, simulator: /^シミュレータ$/, callee: /^スタブ$/, caller: /^ドライバ$/ },
    cases: [[/上位のモジュールから行う/, 'callee', /呼ばれる未実装の下位処理/], [/下位のモジュールから行う/, 'caller', /上位モジュールに代わって下位を呼び出す/],
      [/双方から同時に結合/, 'callee', /呼出先に代わって応答/]],
  },
  48: {
    basis: 'https://www.istqb.org/certifications/certified-tester-foundation-level',
    options: { flow: /制御の流れと変数間|変数が定義されてから/, black: /意図した機能を実現|外部仕様に示された機能/,
      statement: /全ての命令.*最低1回/, structure: /内部構造や論理|各判定で真と偽/ },
    cases: [[/ブラックボックステストに関する/, 'black', /外部から観察できる機能/], [/命令網羅を完了条件/, 'statement', /全命令が最低1回/],
      [/データフローテストに関する/, 'flow', /値が設定された箇所.*値が利用される箇所/]],
  },
  49: {
    basis: 'https://www.masswerk.at/algol60/report.htm',
    options: { copy: /^値呼出し$/, result: /^結果呼出し$/, reference: /^参照呼出し$/, name: /^名前呼出し$/ },
    cases: [[/値が変更されないことが保証/, 'copy', /値を仮引数にコピー/], [/最終結果がサブルーチンの終了時にだけ/, 'result', /終了時に結果を書き戻す/],
      [/同じ格納場所を参照し/, 'reference', /変数の格納場所を仮引数から参照/], [/その式を評価し直す/, 'name', /仮引数の利用時/]],
  },
  50: {
    basis: 'https://doi.org/10.1109/52.43044',
    options: { forward: /ソースコードを自動生成/, refactor: /振る舞いを変えずに/, reverse: /仕様や構造を明らかに/, reengineer: /全体を新しく構築/ },
    cases: [[/リバースエンジニアリングの説明/, 'reverse', /実装を解析して仕様や構造/], [/フォワードエンジニアリング/, 'forward', /設計情報からCASE/],
      [/リファクタリングの説明/, 'refactor', /振る舞いを保ちながら内部構造/], [/リエンジニアリングのうち/, 'reengineer', /既存実装を分析・理解した結果/]],
  },
  51: {
    basis: 'https://www.computer.org/education/bodies-of-knowledge/software-engineering',
    options: { schedule: /開発作業の進捗状況/, review: /レビューの実施結果/, configuration: /プログラムのバージョン/, organization: /プロジェクト組織の編成/ },
    cases: [[/構成管理の対象/, 'configuration', /版と変更履歴/], [/進捗管理で/, 'schedule', /計画どおりに進んでいる/],
      [/品質管理で/, 'review', /成果物の欠陥や指摘事項/], [/役割と責任の分担/, 'organization', /役割の責任を誰に割り当てる/]],
  },
};
