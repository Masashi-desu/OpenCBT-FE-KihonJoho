// Independent comparison targets. This file has no imports from generation code.
type ReviewCase = {
  prompt: RegExp;
  answers?: readonly RegExp[];
  truths: readonly boolean[];
  conclusion: RegExp;
};
type Review = { evidence: readonly string[]; cases: readonly ReviewCase[] };

export const legacy2015AutumnAm52PublishedExample = {
  url: 'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000003ojp-att/2011h23a_fe_am_qs.pdf',
  page: 22,
  number: 52,
  // 2011秋の原画像と2015秋の原画像で一致する試験例。規格表とは別。
  rows: [['外部入力', 1, 4], ['外部出力', 2, 5], ['内部論理ファイル', 1, 10], ['外部インタフェースファイル', 0, 7], ['外部照会', 0, 4]],
  coefficient: 0.75,
  choices: [18, 24, 30, 32],
};

const lockModes = [/どちらも獲得できる。$/, /^共有ロックだけを獲得できる。$/, /どちらも獲得できない。$/, /^専有ロックだけを獲得できる。$/];
const canonicalMitigations = [
  /^SQLの構造と入力値を分離し、プレースホルダへ値をバインドする。$/,
  /^HTMLへ出力する値を、その出力先の文脈に合わせて適切にエスケープする。$/,
  /^パスを正規化し、アクセス対象が許可されたディレクトリの内側にあることを検証する。$/,
  /^コピー先の容量と入力長を検証し、確保したメモリの境界を越えて書き込まない。$/,
];

export const legacy2015AutumnAm2753Reviews: Record<number, Review> = {
  29: {
    evidence: ['https://www.postgresql.org/docs/15/explicit-locking.html#LOCKING-ROWS'],
    cases: [
      { prompt: /ロックの両立性/, truths: [false, true, false, false], conclusion: /共有だけが可能/ },
      { prompt: /資源Xの専有ロック.*T₂が資源X/, answers: lockModes, truths: [false, false, true, false], conclusion: /解放するまで獲得できない/ },
      { prompt: /資源Xと資源Yは互いに独立.*T₂が資源Y/, answers: lockModes, truths: [true, false, false, false], conclusion: /Yに共有ロックも専有ロックも/ },
    ],
  },
  31: {
    evidence: ['https://www.itu.int/rec/T-REC-X.200-199407-I'],
    cases: [
      { prompt: /第3層.*経路選択機能や中継機能/, truths: [false, false, false, true], conclusion: /ネットワーク層の役割/ },
      { prompt: /第2層.*隣接する装置間.*フレーム/, truths: [false, true, false, false], conclusion: /データリンク層である/ },
      { prompt: /第4層.*通信の両端.*データ伝送/, truths: [false, false, true, false], conclusion: /トランスポート層である/ },
      { prompt: /第5層.*対話の開始，管理及び終了/, truths: [true, false, false, false], conclusion: /セッション層である/ },
    ],
  },
  32: {
    evidence: ['https://www.rfc-editor.org/info/rfc2131/', 'https://www.rfc-editor.org/info/rfc1034/', 'https://www.rfc-editor.org/info/rfc959/', 'https://www.rfc-editor.org/info/rfc1661/'],
    cases: [
      { prompt: /IPアドレスをPCの起動時などに自動設定/, truths: [true, false, false, false], conclusion: /アドレス設定を配るのはDHCP/ },
      { prompt: /ホスト名に対応するIPアドレスを問い合わせ/, truths: [false, true, false, false], conclusion: /問い合わせるのはDNS/ },
      { prompt: /サーバへ接続し，ファイルの取得や送信/, truths: [false, false, true, false], conclusion: /ファイルの送受信のため.*FTP/ },
      { prompt: /二点間の回線.*ネットワーク層.*カプセル化/, truths: [false, false, false, true], conclusion: /上位のパケットを運ぶのはPPP/ },
    ],
  },
  33: {
    evidence: ['https://www.rfc-editor.org/info/rfc791/', 'https://www.rfc-editor.org/info/rfc1112/', 'https://www.rfc-editor.org/info/rfc4291/', 'https://www.rfc-editor.org/info/rfc4862/', 'https://www.rfc-editor.org/info/rfc1918/'],
    cases: [
      { prompt: /IPv4にはなく，IPv6で追加・変更/, truths: [true, false, false, false], conclusion: /IPv4のアドレスは32ビット、IPv6は128ビット/ },
      {
        prompt: /リンク上の全ノード.*IPv4にはなく，IPv6で追加・変更/,
        answers: [/^同じネットワークに属する宛先をプレフィックスで識別する。$/, /^リンク全体宛てのブロードキャストアドレスを設けず，その用途を全ノード・マルチキャストアドレスで担う。$/, /^アドレスのホスト部を全て1にした値をブロードキャスト宛先として使う。$/, /^ノード自身との通信用にループバックアドレスを用いる。$/],
        truths: [false, true, false, false], conclusion: /FF02::1を使う/,
      },
      {
        prompt: /ルータを利用できるネットワークでのアドレス自動設定.*IPv4にはなく/,
        answers: [/^DHCPのサーバからアドレスを割り当ててもらう。$/, /^私用のアドレス範囲を使って組織内のホストを識別する。$/, /^ルータから通知されたプレフィックスを使い，端末が状態を保持する割当サーバなしでアドレスを組み立てる。$/, /^アドレスのプレフィックスに従い，ローカルリンク上の宛先を区別する。$/],
        truths: [false, false, true, false], conclusion: /ルータ広告で得たプレフィックス/,
      },
    ],
  },
  35: {
    evidence: ['https://www.rfc-editor.org/info/rfc9293/'],
    cases: [
      { prompt: /TCPコネクションを識別/, truths: [false, true, false, false], conclusion: /計四つの値/ },
      { prompt: /一台のPCから，同じIPアドレス，同じ待受けポート.*二つ同時/, truths: [false, true, false, false], conclusion: /PC側のポートの違い/ },
      { prompt: /異なるIPアドレス.*二台のPC.*同じ送信元ポート番号/, truths: [false, true, false, false], conclusion: /送信元の違いで区別/ },
    ],
  },
  37: {
    evidence: ['https://csrc.nist.gov/glossary/term/brute_force_attack', 'https://csrc.nist.gov/glossary/term/side_channel_attack', 'https://doi.org/10.1007/3-540-48285-7_33', 'https://doi.org/10.1007/3-540-38424-3_1'],
    cases: [
      { prompt: /ブルートフォース攻撃/, truths: [true, false, false, false], conclusion: /鍵候補を全て順に試す/ },
      { prompt: /線形解読法/, truths: [false, true, false, false], conclusion: /線形近似における偏り/ },
      { prompt: /装置の動作に伴う漏えい.*サイドチャネル攻撃/, truths: [false, false, true, false], conclusion: /電磁波.*数式以外/ },
      { prompt: /差分解読法/, truths: [false, false, false, true], conclusion: /入力の平文に与えた差分/ },
    ],
  },
  38: {
    evidence: ['https://csrc.nist.gov/glossary/term/public_key', 'https://www.rfc-editor.org/info/rfc8017/'],
    cases: [
      { prompt: /^Xさんは，Yさんに.*公開鍵暗号方式.*暗号化/, truths: [false, false, true, false], conclusion: /Yさんの公開鍵.*Yさんの秘密鍵/ },
      { prompt: /Yさんは結果をXさんに電子メールで返信/, truths: [true, false, false, false], conclusion: /Xさんの公開鍵.*Xさんが自分の秘密鍵/ },
      { prompt: /転送サーバでは本文を復号せず，Yさんだけ/, truths: [false, false, true, false], conclusion: /最終受信者のYさん.*Yさんの公開鍵/ },
    ],
  },
  39: {
    evidence: ['https://www.ipa.go.jp/security/j-csip/ug65p9000000nkvm-att/000024536.pdf'],
    cases: [
      { prompt: /標的型攻撃メール.*ソーシャルエンジニアリング/, truths: [false, true, false, false], conclusion: /受信者の業務に合いそうな件名や本文/ },
      {
        prompt: /月末に仕入先の請求を処理する担当者/,
        answers: [/^宛先の仕事に関係なく，同じ広告文を配信する。$/, /^担当者が確認している仕入先を名乗り，今月の請求書を差し替えたと伝えて添付を開かせる。$/, /^誰にでも同じ未納料金があると通知し，無差別に送信する。$/, /^偽の会員サイトへの案内を，業務に関係なく無差別に送信する。$/],
        truths: [false, true, false, false], conclusion: /仕入先と月末の確認作業に合わせた/,
      },
      {
        prompt: /社内システムの説明会を準備している担当者/,
        answers: [/^登録先にかかわらず，一律の広告と同じ見出しを付ける。$/, /^実際の説明会の日付と部署名を使い，会場変更と称して担当者に偽の確認ページを開かせる。$/, /^商品の返金を装ったメールを無差別に送る。$/, /^誰にでも同じ理由で会員情報の更新を迫るメールを無差別に送る。$/],
        truths: [false, true, false, false], conclusion: /実際の予定と担当部署/,
      },
    ],
  },
  41: {
    evidence: ['https://www.cisco.com/assets/sol/sb/Switches_Emulators_v2_3_5_xx/help/350_550/tesla_350_550_olh/span_overview.html'],
    cases: [
      { prompt: /ネットワーク障害.*ミラーポート.*LANアナライザ/, truths: [false, true, false, false], conclusion: /パケットの複製を観測器に送る/ },
      {
        prompt: /暗号化されていない業務通信.*ファイルとして保存/,
        answers: [/^アナライザで複製パケットを廃棄するたびに，元のパケットも通信経路から失われる。$/, /^記録したファイルから業務通信の内容が読めるため，アクセス権や保存期間を管理する。$/, /^測定結果の確認のため，全ての業務利用者に記録ファイルを公開する必要がある。$/, /^ミラーポートを使うたびに業務側のLANケーブルを一時的に取り外す必要がある。$/],
        truths: [false, true, false, false], conclusion: /解析権限と保存期間を絞る/,
      },
      {
        prompt: /暗号化された通信.*宛先アドレスと到着時刻/,
        answers: [/^暗号化されているので，宛先アドレスを含めパケットの情報は一切表示できない。$/, /^本文が暗号化されていても宛先や通信時刻は分かるため，アナライザや記録へのアクセスを管理する。$/, /^暗号文なので，アナライザの操作方法を全利用者に周知する必要がある。$/, /^到着時刻を測るには，必ず業務側のケーブルを抜いてアナライザを挿入する。$/],
        truths: [false, true, false, false], conclusion: /宛先や観測時刻まで常に隠れるわけではない/,
      },
    ],
  },
  42: {
    evidence: ['https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html', 'https://owasp.org/www-community/attacks/Path_Traversal', 'https://cwe.mitre.org/data/definitions/120.html'],
    cases: [
      { prompt: /SQLインジェクション攻撃を防ぐ/, truths: [true, false, false, false], conclusion: /SQLの命令と入力値を分け/ },
      { prompt: /クロスサイトスクリプティングによる被害を防ぐ/, answers: canonicalMitigations, truths: [false, true, false, false], conclusion: /出力先の文脈/ },
      { prompt: /ディレクトリトラバーサルによる被害を防ぐ/, answers: canonicalMitigations, truths: [false, false, true, false], conclusion: /許可されたディレクトリの内側/ },
      { prompt: /バッファオーバーフローによる被害を防ぐ/, answers: canonicalMitigations, truths: [false, false, false, true], conclusion: /メモリの境界/ },
    ],
  },
  43: {
    evidence: ['https://csrc.nist.gov/pubs/fips/180-4/upd1/final'],
    cases: [
      { prompt: /SHA-256.*既知のワーム検体ファイル.*ハッシュ値のデータベース/, truths: [true, false, false, false], conclusion: /同じバイト列/ },
      {
        prompt: /実行ファイルの内容全体.*一つの既知ワーム検体/,
        answers: [/^検体ファイルを別の名前で保存した，同じ内容のファイル$/, /^検体の先頭部分だけを複製し，後半を変更したファイル$/, /^検体とサイズだけが同じ別の実行ファイル$/, /^登録検体の命令の一部を置き換えた未登録の亜種$/],
        truths: [true, false, false, false], conclusion: /ファイル名ではなく全体のバイト列/,
      },
      {
        prompt: /展開済みのファイル全体.*検査時もアーカイブを展開/,
        answers: [/^再圧縮されていても，展開すると登録検体と同一になるファイル$/, /^展開すると登録検体と一部分のコードだけが同じになるファイル$/, /^展開後にサイズだけが登録検体と同じになるファイル$/, /^展開後の実行動作が似ている未登録の亜種$/],
        truths: [true, false, false, false], conclusion: /展開後のバイト列が同じなら登録値に一致/,
      },
    ],
  },
  45: {
    evidence: ['https://csrc.nist.gov/glossary/term/authenticator'],
    cases: [
      { prompt: /2要素認証に該当/, truths: [false, true, false, false], conclusion: /虹彩は身体の特徴、パスワードは本人が知る情報/ },
      {
        prompt: /身体的特徴を登録せず.*2要素認証/,
        answers: [/^本人が保有するICカードと，本人だけが知るパスワードで認証する。$/, /^別々に発行した二枚のICカードだけで認証する。$/, /^数字と記号を混ぜた一つのパスワードで認証する。$/, /^パスワードと，あらかじめ本人が登録した秘密の質問への回答で認証する。$/],
        truths: [true, false, false, false], conclusion: /ICカードの所持とパスワードの知識/,
      },
      {
        prompt: /認証用の物品を利用者に配布せず.*2要素認証/,
        answers: [/^指紋と顔の画像で認証する。$/, /^大小の英字を混ぜた一つのパスワードで認証する。$/, /^顔認証と本人だけが知る暗証番号で認証する。$/, /^別々に登録した暗証番号を二つ入力させる。$/],
        truths: [false, false, true, false], conclusion: /顔の特徴は生体、暗証番号は知識/,
      },
    ],
  },
  46: {
    evidence: ['https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf'],
    cases: [
      { prompt: /インスペクションにおけるモデレータ/, truths: [false, false, false, true], conclusion: /モデレータが会議全体を取り仕切る/ },
      { prompt: /司会と分けて配置した記録係/, truths: [true, false, false, false], conclusion: /記録係が指摘事項を残し/ },
      { prompt: /作成者とは別に配置した説明担当/, truths: [false, false, true, false], conclusion: /成果物の内容をレビュー参加者が追えるよう説明/ },
    ],
  },
  48: {
    evidence: ['https://glossary.istqb.org/en_US/term/driver', 'https://glossary.istqb.org/en_US/term/stub'],
    cases: [
      { prompt: /^ボトムアップテストの特徴/, truths: [false, false, false, true], conclusion: /下位を先に実行するためにドライバ/ },
      {
        prompt: /上位モジュールを先に用意.*トップダウン.*呼出し先の下位モジュールは未完成/,
        answers: [/^開発の初期には常に並行作業ができない。$/, /^スタブが必要である。$/, /^テスト済みの下位モジュールが必要である。$/, /^ドライバが必要である。$/],
        truths: [false, true, false, false], conclusion: /未完成の呼出し先をスタブで代用/,
      },
      { prompt: /ボトムアップ.*最下位の処理を結合済みの中位.*上位モジュールは未完成/, truths: [false, false, false, true], conclusion: /中位モジュールを呼ぶドライバ/ },
    ],
  },
  49: {
    evidence: ['https://doi.org/10.1109/52.43044', 'https://refactoring.com/'],
    cases: [
      { prompt: /ソースコードやオブジェクトコードを解析.*仕様と設計の情報/, truths: [false, false, true, false], conclusion: /実装から設計や仕様へ遡る/ },
      { prompt: /アジャイル開発のプラクティス.*外部から観察できる振る舞いを保ち.*小さな変更を重ねる/, truths: [false, false, false, true], conclusion: /外部動作を維持した小さなコード改善/ },
      { prompt: /対象業務の変更.*別の基盤にシステムを再構築/, truths: [true, false, false, false], conclusion: /仕様変更と再構築までを含める/ },
    ],
  },
};
