import { code, field, figure, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { legacy2014SpringAm27To53Source as source } from './legacy-2014-spring-am-27-53-source';
import { am2753FigureAlt, am2753Profiles, spring2014PathActivities } from './legacy-2014-spring-am-27-53-figures';

const keys = 'アイウエ';
type Scenario = { prompt: string; correct: number; explanation: string; choices?: string[] };
function finite(number: number, title: string, fieldName: string, count: number, notes: string,
  build: (input: number) => GeneratedBody, fixed = false): GenerationDefinition {
  return {
    source: '2014h26h-fe-am-' + number, title, fields: [field(fieldName, 0, count - 1)], reference: [0],
    sourceAnswer: source[number].key, version: '3.7.0', notes: variableNotes + ' ' + notes,
    ...(fixed ? { answerVariation: 'fixed' as const } : {}),
    build(values) {
      const [input] = values;
      if (values.length !== 1 || !Number.isSafeInteger(input) || input < 0 || input >= count) throw Error('PARAMETER_CONSTRAINT');
      return build(input);
    },
  };
}

function knowledge(number: number, title: string, fieldName: string, notes: string, explanation: string, alternates: Scenario[]) {
  const base = source[number], correct = keys.indexOf(base.key);
  const cases: Scenario[] = [{ prompt: base.prompt, correct, explanation }, ...alternates];
  return finite(number, title, fieldName, cases.length, notes, input => {
    const item = cases[input];
    return { prompt: [p(item.prompt)], choices: strings(item.choices ?? base.choices), correctIndex: item.correct, explanation: item.explanation };
  }, alternates.every(item => item.correct === correct));
}
const scenario = (prompt: string, correct: number, explanation: string): Scenario => ({ prompt, correct, explanation });
const sourceFigure = (kind: keyof typeof am2753Profiles, input: number, caption: string) => ({
  ...figure(am2753Profiles[kind], [input], caption, am2753FigureAlt[kind]([input])),
  captionPresentation: 'accessible' as const,
});

const relations = knowledge(27, '関係データベースの集合演算', '説明する関係演算',
  '原の演算名から説明を選ぶ方向と4役割を保持し，問う演算名を変える。演算の定義は本文へ加えない。',
  '射影は表から必要な列を取り出す。行を条件で絞るのは選択，複数の表の行を対応する値で組み合わせるのは結合，複数の結果を合わせるのは和である。', [
    scenario(source[27].prompt.replace('射影（projection）', '選択（selection）'), 1,
      '選択は条件に合う行だけを取り出す。取り出す列を絞る射影，表の行同士を対応付ける結合，結果を合わせる和とは異なる。'),
    scenario(source[27].prompt.replace('射影（projection）', '結合（join）'), 3,
      '結合は表をまたいで条件に合う行同士を組にし，双方の情報を一つの行にまとめる。選択・射影はそれぞれ行・列の抽出，和は結果を合わせる演算である。'),
  ]);

const queryCases = [
  { operator: 'NOT IN', warehouse: 0 },
  { operator: 'IN', warehouse: 0 },
  { operator: 'NOT IN', warehouse: 2 },
] as const;
const sql = finite(28, 'IN・NOT INと相関EXISTS', '検索する商品と倉庫の条件', queryCases.length,
  '原の二つのスキーマと主キーの下線、SQL選択4つを保持。IN/NOT INと倉庫制約を変更。複合主キーの各列はNULL不可。', input => {
    const { operator, warehouse } = queryCases[input];
    const fromStock = warehouse ? ' WHERE 倉庫番号 = ' + warehouse : '';
    const statement = 'SELECT 商品番号 FROM 商品\nWHERE 商品番号 ' + operator + ' (SELECT 商品番号 FROM 在庫' + fromStock + ')';
    const options = source[28].choices.map((choice, i) => {
      if (!warehouse) return choice;
      return i < 2 ? choice.replace('WHERE ', 'WHERE 倉庫番号 = ' + warehouse + ' AND ')
        : choice.replace('在庫.商品番号)', '在庫.商品番号\n                AND 在庫.倉庫番号 = ' + warehouse + ')');
    });
    const negate = operator === 'NOT IN';
    return {
      prompt: [p(source[28].prompt + (warehouse ? ' 在庫を照合するときは倉庫番号' + warehouse + 'にある在庫を対象とする。' : '')),
        code(statement, 'sql'), sourceFigure('schema', 0, '商品表と在庫表のスキーマ')],
      choices: options.map(option => [code(option, 'sql')]), correctIndex: negate ? 3 : 2,
      explanation: '在庫表の商品番号は複合主キーの一部でNULLにならない。商品表の各行について，同じ商品番号' +
        (warehouse ? 'かつ倉庫番号' + warehouse : '') + 'の在庫行' + (negate ? 'がない場合をNOT EXISTSで選ぶ。' : 'がある場合をEXISTSで選ぶ。') +
        '相関条件は商品表の行ごとに評価される。在庫表を外側にした非相関副問合せでは商品ごとの存在確認にならず，複数倉庫にある商品を重複して返す場合もある。',
    };
  });

const transactions = knowledge(29, 'トランザクションのACID特性', '要求するデータベースの保証',
  '保証する動作から性質名を選ぶ原形式。更新途中の失敗、コミット後の障害、並行処理中の可視性を区別。',
  '原子性は一連の更新を不可分に扱い，全て確定するか全て取り消す。一貫性は制約の維持，耐久性は確定内容の保持，独立性は並行処理の相互影響を制御する性質である。', [
    scenario('トランザクションが正常に完了して更新を確定した。その直後に電源障害が発生しても，復旧後に確定済みの更新が失われないことを保証する特性はどれか。', 2,
      '耐久性はコミット済みの更新が障害後も保持されることを保証する。原子性はコミット前に処理が失敗したときの全取消しに関係する。'),
    scenario('データベースで別のトランザクションが同時に実行されても，確定前の更新内容が他方から見えず，処理が互いに干渉しないことを保証する特性はどれか。', 3,
      '独立性は同時実行されるトランザクション同士の影響を制御する。制約維持，一括確定，確定後の復旧はそれぞれ別の性質である。'),
  ]);

const layers = knowledge(30, 'OSI基本参照モデルと中継装置', '指定する層の順序',
  '物理・データリンク・ネットワークの三つの層と四つの順列を保持し，本文の要求順序を変更。',
  'リピータは物理層の信号，ブリッジはデータリンク層のフレーム，ルータはネットワーク層のパケットを中継する。指定順ではリピータ，ブリッジ，ルータ。', [
    scenario(source[30].prompt.replace('物理層で中継する装置，データリンク層で中継する装置，ネットワーク層で中継する装置',
      'データリンク層で中継する装置，ネットワーク層で中継する装置，物理層で中継する装置'), 1,
      '層の指定はデータリンク，ネットワーク，物理の順。MACアドレスで中継するブリッジ，経路表で中継するルータ，信号を再生するリピータが対応する。'),
    scenario(source[30].prompt.replace('物理層で中継する装置，データリンク層で中継する装置，ネットワーク層で中継する装置',
      '物理層で中継する装置，ネットワーク層で中継する装置，データリンク層で中継する装置'), 3,
      '物理層がリピータ，ネットワーク層がルータ，データリンク層がブリッジ。名称の順序を指定された層と一つずつ照合する。'),
  ]);

const protocols = knowledge(31, 'TCP/IPの機能と役割', '役割を問う機能',
  '原四択の機能と方向を保持し，DNS・DHCP・NATの名称を指定する。',
  'DNSは名前とIPアドレスなどの情報を対応付ける。IPアドレスを割り当てるのはDHCP，通信相手から見えるIPアドレスの変換はNAT，離れたプログラムの処理呼出しは遠隔手続呼出しである。', [
    scenario(source[31].prompt.replace('DNS', 'DHCP'), 0,
      'DHCPは利用可能なアドレスを割り当て，サブネットマスクなどの設定情報も配布できる。名前とアドレスの対応付けやアドレス変換は別の機能である。'),
    scenario(source[31].prompt.replace('DNS', 'NAT'), 2,
      'NATはIPパケットのアドレスを変換する。社内のプライベートアドレスから外部へ通信する際の変換が代表例で，DNSの名前解決やDHCPのアドレス配布とは異なる。'),
  ]);

const addressFamilies = knowledge(32, 'IPv4・IPv6のアドレスの特徴', 'アドレス体系と到達範囲',
  '長さ・範囲・対応・表記の役割を保持する。異なるアドレス体系やリンクローカルを本文で指定。',
  'IPv6は128ビットで，16進4桁の組をコロンで区切る表記を使える。リンクローカルなどがあり，全てグローバルではない。32ビットのIPv4とは全アドレスを1対1対応できない。', [
    { ...scenario('IPv4アドレスの特徴として，適切なものはどれか。', 0,
      'IPv4アドレスは32ビットで，通常は8ビットずつ10進数で表し，ピリオドで区切る。プライベートアドレスもあり，IPv6の全アドレスとは1対1対応しない。'),
      choices: [source[32].choices[0].replace('96', '32'), ...source[32].choices.slice(1)] },
    { ...scenario('IPv6のリンクローカルユニキャストアドレスの特徴として，適切なものはどれか。', 1,
      'リンクローカルユニキャストアドレスの通信範囲は同一リンクに限られる。IPv6なので128ビットで，標準的な16進表記はコロンで区切る。'),
      choices: [source[32].choices[0], 'ルータを越えて転送されず，同一リンク内で用いる。', source[32].choices[2],
        source[32].choices[3].replace('コロン“:”', 'ハイフン“-”')] },
  ]);

const mail = knowledge(33, '電子メールと関連技術の役割', '必要な文書・配送の処理',
  '実現する機能から規約や技術の名称を選ぶ。原四択の順序を保持。',
  'MIMEはインターネットメールで本文の型や符号化を示し，音声や画像を扱えるようにする。HTMLは文書構造のマークアップ，MHSはメッセージ処理システム，SMTPはメール配送である。', [
    scenario('電子メールの本文などに用いる文書で，見出しやリンクといった構造をタグで記述するために用いるものはどれか。', 0,
      'HTMLは文書の構造をタグで記述する。メールの送信・配送や，添付するデータ形式の識別を行う規約ではない。'),
    scenario('インターネットにおいて，送信側のメールサーバから宛先側のメールサーバへ電子メールを配送する通信規約はどれか。', 3,
      'SMTPは送信とメールサーバ間の配送を行う。MIMEは転送されるメッセージの形式，HTMLは本文などの文書表現を扱う。'),
  ]);

const commands = knowledge(34, 'IPネットワークを確認するコマンド', '端末で確認する情報',
  '原四択とコマンド名を選ぶ形式を保持。疎通、ローカル構成、ARPキャッシュの確認を区別。',
  'pingはICMPのエコー要求を送り応答などを調べる。arpはIPとMACの対応，ipconfigはWindowsのIP設定，echoは文字列表示などに用いる。', [
    scenario('Windows端末で，自分に設定されたIPv4アドレス，サブネットマスク及びデフォルトゲートウェイを確認するコマンドはどれか。', 2,
      'ipconfigはWindowsのネットワークアダプタの設定を表示する。pingは相手との疎通，arpはキャッシュの対応を確認する。'),
    scenario('WindowsのIPv4ネットワークで，端末がキャッシュしているIPアドレスとMACアドレスの対応を確認するコマンドはどれか。', 0,
      'arpはARPキャッシュを表示できる。IP設定全体を表示するipconfig，疎通を確認するping，文字列のechoとは用途が違う。'),
  ]);

const hostInputs = [[32, 28], [64, 27], [96, 29]] as const;
const hostCount = finite(35, 'IPv4サブネットに接続可能なホスト数', 'IPv4のネットワークと接頭辞長', hostInputs.length,
  'IPv4 CIDRの整数の四択。ネットワーク・ブロードキャストを除く。誤答は全アドレス数、接頭辞長、一段広いサブネットのホスト数で昇順を保持。', input => {
    const [network, prefix] = hostInputs[input], blockSize = 2 ** (32 - prefix), host = blockSize - 2;
    const options = [host, blockSize, prefix, blockSize * 2 - 2].sort((a, b) => a - b);
    return {
      prompt: [p(source[35].prompt.replace('32/28', network + '/' + prefix))], choices: strings(options.map(String)),
      correctIndex: options.indexOf(host),
      explanation: '32ビットのうち接頭辞が' + prefix + 'ビットなので，ホスト部は' + (32 - prefix) + 'ビット。全部で' + blockSize +
        '個のうち，先頭のネットワークアドレスと末尾のブロードキャストアドレスを除き，最大' + host + '台を割り当てられる。',
    };
  });

const mac = knowledge(36, 'メッセージの保護機能の目的', '用いる暗号技術',
  'メッセージ保護手段と利用目的四択を維持し，メッセージ認証符号と共通鍵暗号を区別する。',
  'メッセージ認証符号は鍵とメッセージから得た値を送受信で照合し，改ざんを検出する。内容を第三者から読めなくする暗号化や，概要を作る要約とは異なる。', [
    scenario('共通鍵暗号を用いてメッセージ本文を暗号化する利用目的はどれか。', 3,
      '共通鍵暗号では鍵を持つ相手が本文を復号できるので，メッセージの秘匿性を確保できる。改ざん検出にはMACなどの認証機能が必要で，暗号化だけでは保証しない。'),
  ]);

const pki = knowledge(37, 'PKIでの認証局と利用者の役割', '実行主体と暗号処理',
  '処理主体から役割を選ぶ原四択。証明書を運用する認証局と署名を検証する受信側を比較。',
  '認証局は公開鍵と主体を結び付けた証明書を発行し，失効した証明書の一覧も公開する。利用者のデータの暗号化や改ざん検証を，認証局が個々の通信のたびに行うわけではない。', [
    scenario('PKI（公開鍵基盤）を使ったディジタル署名の仕組みで，署名付きデータを受け取った利用者が果たす役割はどれか。', 3,
      '受信者は送信者の公開鍵で署名を検証し，送信後にデータが改ざんされていないことを確かめる。失効一覧の発行は認証局側である。'),
    scenario('PKI（公開鍵基盤）を使う暗号化通信で，送信者が受信者の証明書に含まれる情報を用いて，送信前に行う処理はどれか。', 1,
      '送信者は証明書に対応する受信者の公開鍵を使ってデータを暗号化できる。証明書の失効情報は認証局が発行し，改ざん確認は受信側の処理である。'),
  ]);

const ic = knowledge(38, 'ICカードとPINの安全な運用', '配送又は紛失の運用場面',
  'ICカードとPINの配布・識別・失効に関する4役割を維持し，紛失申告後の扱いを本文で変更。',
  'ICカードとPINを別々の経路で届けると，カードを途中で取得されてもPINまで同時に知られにくい。共通PINや券面から推測できるPINは避け，紛失カードは再発行を待たず失効させる。', [
    { ...scenario('ICカードとPINを用いた利用者認証で，利用者からICカードを紛失したとの申告を受けた。本人確認の後に行う運用として，適切なものはどれか。', 2,
      'カードを拾った第三者に試行されないよう，先に紛失カードを失効させる。その後に新しいカードと独立したPINを用意する。PINの共通化や同封，券面情報からの生成は別々に守る条件を弱める。'),
      choices: [...source[38].choices.slice(0, 2), '紛失したICカードを失効させた後で，新たなICカードを発行し，PINを再設定する。',
        'ICカードを再発行して配送する場合には，PINを同じ封筒に同封する。'] },
  ]);

const security = knowledge(39, '情報セキュリティの三要素と攻撃', '脅かされる性質とデータの位置',
  '攻撃例4つを維持。通信中の機密性と保存時の機密性を限定し，同時に二択が成り立たないようにする。',
  '完全性は，情報が権限のない者に書き換えられない性質。Webページの改ざんが直接脅かす。コピーと盗聴は機密性，サービスへの過負荷は可用性を損なう。', [
    scenario('情報セキュリティにおける“可用性”を脅かす攻撃はどれか。', 2,
      'DoS攻撃による過負荷で正当な利用者がサービスを利用できなくなる。これは可用性の低下である。'),
    scenario('情報セキュリティにおいて，伝送経路上での“機密性”を脅かす攻撃はどれか。', 3,
      '通信の盗聴は伝送中のデータを無断で読む攻撃である。保管データのコピーも機密性を脅かすが，通信経路上ではない。'),
  ]);

const technology = knowledge(40, '業務端末・情報資産の管理方式', '管理する対象と運用方式',
  '実現する機能から名称を選ぶ原四択。貸与端末の管理、私物端末の業務使用、文書の管理を区別。',
  'MDM（Mobile Device Management）は端末設定や業務アプリを管理する。BYODは私物端末の業務利用，ECMは組織のコンテンツ管理，LTEは移動体通信方式である。', [
    scenario('会社が，承認を受けた従業員自身のスマートフォンを，会社から端末を貸与する代わりに業務で利用できるようにする運用はどれか。', 0,
      'BYOD（Bring Your Own Device）は組織の仕事に利用者自身の端末を持ち込む運用である。端末管理機能を表すMDMとは役割が違う。'),
    scenario('会社が，部門ごとに作成した電子文書を全社で共有し，版管理，閲覧権限，保存期限を一元管理するために導入する仕組みはどれか。', 1,
      'ECM（Enterprise Contents Management）は組織全体の文書などを管理する。私物端末の運用，移動通信方式，端末管理はいずれも電子文書自体を管理する仕組みではない。'),
  ]);

const attacks = knowledge(41, '不正行為の分類', '被害を起こす仕組み',
  '行為の記述から分類名を選ぶ四択。人の判断、偽装プログラム、第三者経由の攻撃の違いを条件にする。',
  '緊急事態を装って人の判断を誤らせ，機密情報を取得するのはソーシャルエンジニアリングである。候補を試して認証を突破したり，プログラムを偽装したりする手口とは機序が異なる。', [
    scenario('有用なアプリケーションを装ったプログラムを利用者に実行させ，利用者が知らない間にプログラム自身が別の有害な処理を行う手口は，どれに分類されるか。', 1,
      'トロイの木馬は有用に見せかけたプログラムの内部で有害な処理を実行する。この事例で分類する対象はプログラムの挙動である。'),
    scenario('攻撃者が無関係な第三者の機器を支配し，その機器から本来の攻撃対象へ通信を行い，攻撃元が第三者の機器に見えるようにする不正行為は，どれに分類されるか。', 3,
      '踏み台攻撃は第三者の機器を攻撃の中継点として悪用する。パスワード候補を試したり，人に秘密を明かさせたりする手口とは異なる。'),
  ]);

const password = knowledge(42, 'パスワード検証値と照合対象', '登録時と認証時の変換条件',
  '原の登録対象と照合対象の4組を保つ。類題ではランダムな利用者別ソルトとパスワード用KDFを使用する。',
  '登録されたパスワードと入力されたパスワードに同じ変換を適用して照合する。利用者IDは検証値を取り出す索引であって，秘密の代わりにはならない。実装ではランダムなソルトを伴うパスワード専用KDFを使う。', [
    { ...scenario('パスワードを用いて利用者を認証する。利用者ごとにランダムなソルトを記録し，登録時も認証時も記録した同じソルトでパスワード用の鍵導出関数（KDF）を使う。認証方法として，適切なものはどれか。', 2,
      '利用者IDからソルトと検証値を取得し，入力されたパスワードとそのソルトでKDFを再実行する。登録した検証値と，再計算した検証値が一致するかで認証する。KDF（Key Derivation Function）は鍵導出関数で，ここではパスワードの検証値を計算するために用いる。利用者IDを入力値にすると秘密の検証にならない。'),
      choices: [
        '利用者IDをKDFで変換した値を保存し，認証時は入力されたパスワードを同じKDFで変換して比較する。',
        '利用者IDをKDFで変換した値を保存し，認証時は入力された利用者IDを同じKDFで変換して比較する。',
        'パスワードをKDFで変換した値を保存し，認証時は入力されたパスワードを同じKDFで変換して比較する。',
        'パスワードをKDFで変換した値を保存し，認証時は入力された利用者IDを同じKDFで変換して比較する。',
      ] },
  ]);

const endpoints = knowledge(43, '端末やネットワークで用いる機能', '組み込む機能の用途',
  '行為やシステム要件から機能名を選ぶ。侵入のための入口と薄型端末の入力・表示用プログラムを区別。',
  'バックドアは正規の利用手順を迂回して侵入できるように組み込まれた仕組み。シンクライアントエージェントは端末側の機能，ストリクトルーティングは経路指定，ディジタルフォレンジックスは証拠の保全・分析である。', [
    scenario('業務アプリケーションをサーバで実行し，従業員の端末では操作入力を送信してサーバの画面を表示する。この構成の端末側に組み込むものはどれか。', 0,
      'シンクライアントエージェントはサーバで動くアプリケーションとの画面・入力のやりとりを担う。攻撃者の侵入口，経路指定，証拠分析とは目的が異なる。'),
  ]);

const ports = knowledge(44, 'マルウェア通信と宛先ポート', '宛先ポートと通常の許可理由',
  '宛先TCPポートを本文で変更。通信の利用目的からファイアウォールの通過可能性を考える四択。',
  'TCP 80はHTTPの既定ポートであり，通常のWebサイト閲覧を行うため通過を許可される場合がある。HTTPSの既定TCPは443，DNSの標準ポートは53。ポート番号だけでは通信の安全性を判定できない。', [
    { ...scenario(source[44].prompt.replace('80が', '443が'), 1,
      'HTTPSの既定TCPポートは443で，通常のWeb閲覧用に許可される場合がある。HTTPの既定はTCP 80，DNSの既定は53である。通信先や振る舞いの検査も必要であり，443という番号は安全性を示さない。'),
      choices: [source[44].choices[0], 'WebサイトをHTTPSで閲覧する際の既定ポートなので，通信がファイアウォールで許可されている可能性が高い。',
        'Webサイトを暗号化のないHTTPで閲覧する際の既定ポートなので，通信がファイアウォールで許可されている可能性が高い。', source[44].choices[3]] },
  ]);

const protection = knowledge(45, 'セキュリティ対策の導入時に考慮する事項', '導入するシステム',
  '導入する技術名から考慮事項を選ぶ方向と四役割を保つ。答えの方式は本文で説明しない。',
  '生体認証では判定基準を厳しくすると他人の許可を減らす一方，本人拒否が増え得る。利用する場所と影響に応じて両方の誤判定率を調整する。', [
    scenario('業務端末にマルウェア対策ソフトウェアを導入するときに考慮すべき点として，最も適切なものはどれか。', 1,
      '既知のパターンを更新して検出する方法に加え，未知のマルウェアにも対応するためにヒューリスティックスなどを組み合わせる。'),
    scenario('公開鍵基盤による電子署名を導入し，取引先が署名者と公開鍵の対応を確かめられるようにするときに考慮すべき点として，最も適切なものはどれか。', 2,
      '第三者の認証局が発行するディジタル証明書で主体と公開鍵の対応を確認する。入力値の無害化，マルウェア検知，生体認証の閾値とは別の対策である。'),
  ]);

const uml = finite(46, 'UML図の長方形に置く名称', '三つの箱の関連と汎化の接続先', 3,
  '原の空の長方形3個、実線の関連・白抜き三角で示す汎化、四つの名称を保持。関連の接続先と汎化の方向を変える。長方形が一貫してクラスを示すため正答位置は固定。', input => ({
    prompt: [p(source[46].prompt.replace('［空の長方形］', ' ▭ ')), sourceFigure('uml', input, 'UMLの空欄図')],
    choices: strings(source[46].choices), correctIndex: 1,
    explanation: '白抜き三角で示す汎化関係はクラス同士を結ぶ。各長方形はクラスを表し，名前をその中に記述する。' +
      '関連名は関連線に添え，ユースケース名はユースケースを表すだ円の中に置く。' +
      (input === 1 ? 'この図では右上のクラスは下のクラスと関連する。' : input === 2 ? '白抜き三角が向く下側が上位クラスとなる。' : '白抜き三角が向く左上が上位クラスとなる。'),
  }), true);

const encapsulation = knowledge(47, 'オブジェクト指向の設計概念', '実現する設計上の目的',
  '設計上の目的・動作から概念の名称を選ぶ。内部の隠蔽、共通の型、部品への分割を区別。',
  'カプセル化はデータと操作をひとまとまりにして，外部に公開する操作を定める。外部から内部構造を直接参照しなければ，内部実装を変更しても利用方法に影響しない。', [
    scenario('オブジェクト指向に基づく開発で，個々の商品は別のオブジェクトとして扱い，商品番号や単価という共通の属性と操作を一つの型として定義する。この概念を表す用語はどれか。', 1,
      '共通の属性と操作を型として定義し，各オブジェクトをそのインスタンスとして扱うのはクラス化である。内部を隠すこととは別の観点である。'),
    scenario('オブジェクト指向に基づく開発で，在庫管理と請求処理を互いに交換できる独立したソフトウェア部品へ分け，部品間の依存を限定する。この概念を表す用語はどれか。', 3,
      'ソフトウェアを独立性の高い部分へ分けるのはモジュール化である。一つのオブジェクトの内部を外部から隠すカプセル化とは，着目する単位が違う。'),
  ]);

const modeling = knowledge(48, '要求分析で用いる図の記法', '説明を問う分析・設計図',
  '図の名称から説明を選ぶ。状態遷移図、機能分解図、データフロー図を本文で指定し，図の定義を本文に加えない。',
  '状態遷移図はイベントをきっかけとする状態の移り変わりと，それに伴う動作を表す。データフロー，機能分解，プログラム全体の階層は別の記法で表す。', [
    scenario(source[48].prompt.replace('状態遷移図', '機能分解図'), 2,
      '機能分解図は対象システムの機能を上位から下位へ段階的に分ける。状態を変えるイベントや処理間のデータを記録する図ではない。'),
    scenario(source[48].prompt.replace('状態遷移図', 'データフロー図（DFD）'), 3,
      'データフロー図は外部との入出力，処理，データストアを結ぶデータの流れを表す。状態の変化やプログラム構造ではなく，情報の移動に注目する。'),
  ]);

const testing = knowledge(49, 'テストケース設計の基準', 'テストで満たす基準',
  'テスト技法の名称から設計方法を選ぶ形式を維持。外部仕様と分岐網羅の対象を変え，分岐網羅と単なる命令網羅を区別。',
  'ブラックボックステストは外部仕様に基づき，入力に対する出力・動作を検証する。ソースや内部構造に基づくケース選定は，ホワイトボックステストに当たる。', [
    { ...scenario('分岐網羅を基準とするホワイトボックステストにおけるテストケースの設計方法として，適切なものはどれか。', 3,
      '分岐網羅では条件判定の真・偽の各分岐を少なくとも1回通る。各命令の実行だけを確認しても，実行する命令を持たない分岐が未通過の場合がある。'),
      choices: [source[49].choices[0], source[49].choices[1],
        'プログラムの内部構造を参照し，全ての実行可能な命令が少なくとも1回実行されることだけを基準に，テストケースを設計する。',
        source[49].choices[3]] },
  ]);

const development = knowledge(50, 'ソフトウェア開発の活動', '説明を問う開発活動',
  '手法名から原四択の活動説明を選ぶ。本文は手法名だけで指定。',
  'リファクタリングは外部から見える動作を維持しながら，プログラムの内部構造を改善する。ペア作業，テスト先行，早期の試作とは目的が異なる。', [
    scenario(source[50].prompt.replace('リファクタリング', 'ペアプログラミング'), 0,
      'ペアプログラミングでは二人が一つのプログラムの実装に協力し，設計やコードを相互に確認する。'),
    scenario(source[50].prompt.replace('リファクタリング', 'テスト駆動開発'), 2,
      'テスト駆動開発では要求に対応するテストを先に用意し，そのテストを通るように実装して改善する。'),
  ]);

const pdca = knowledge(51, 'PDCAサイクルの英語表記', 'PDCAの段階と頭文字',
  '原のPDCA全体の説明と英単語四択を維持。対象の文字に合わせ全択の頭文字を揃える。',
  'PDCAはPlan（計画），Do（実行），Check（評価），Act（改善）のサイクル。第3段階はCheckである。', [
    { ...scenario(source[51].prompt.replace('3番目の文字“C”', '1番目の文字“P”'), 1,
      '第1段階のPlanでは目標と実施方法を計画する。その後Doで実行し，Checkで確認し，Actで改善する。'),
      choices: ['Produce', 'Plan', 'Prepare', 'Perform'] },
    { ...scenario(source[51].prompt.replace('3番目の文字“C”', '4番目の文字“A”'), 0,
      '第4段階のActで評価結果を受けて改善する。分析や評価だけで終わらず，対策を次のPlanへ反映する。'),
      choices: ['Act', 'Adapt', 'Analyze', 'Assess'] },
  ]);

const breakdown = finite(52, '作業を階層へ分解する図', '分解するプロジェクトと作業', 3,
  '原の作業木、枝・右端と子孫の省略記号、名称四択を保持。実際に分解する別プロジェクトを入れる。作業階層を表すため正答位置は固定。', input => ({
    prompt: [p(source[52].prompt), sourceFigure('work', input, 'プロジェクトの作業階層')],
    choices: strings(source[52].choices), correctIndex: 3,
    explanation: 'WBS（Work Breakdown Structure）は対象の作業を上位から下位へ分解し，管理可能な作業単位にまとめる。' +
      'CPMはクリティカルパス法，PERTは作業の所要時間を見積もって工程を管理する方法，EVMは出来高による進捗・費用の管理手法である。' +
      (input === 1 ? 'この例では拠点の移転作業を準備と機器移設などに分けている。' : input === 2 ? 'この例では研修の準備・運営を作業単位に分けている。' : 'この例ではシステム開発の作業を企画と要件定義などに分けている。'),
  }), true);

const criticalPath = finite(53, 'プロジェクト活動のクリティカルパス', '作業の所要日数', 4,
  '原の9節点、12作業の接続、凡例・4経路の選択肢を保持。所要日数を変え、選択肢外を含む全経路で最長が一意になる。', input => {
    const edges = spring2014PathActivities(input);
    const remaining = new Map<number, number>([[8, 0]]);
    function longest(at: number): number {
      const known = remaining.get(at);
      if (known !== undefined) return known;
      const max = Math.max(...edges.filter(edge => edge.from === at).map(edge => edge.days + longest(edge.to)));
      remaining.set(at, max);
      return max;
    }
    const times = source[53].choices.map(option => option.split('→').reduce((days, label) => days + edges.find(e => e.label === label)!.days, 0));
    const duration = longest(0), correctIndex = times.indexOf(duration);
    if (correctIndex < 0) throw Error('PARAMETER_CONSTRAINT');
    return {
      prompt: [p(source[53].prompt), sourceFigure('path', input, 'プロジェクト活動のアローダイアグラム')],
      choices: strings(source[53].choices), correctIndex,
      explanation: '始点から終点までの経路に沿って作業日数を足す。アは' + times[0] + '日，イは' + times[1] +
        '日，ウは' + times[2] + '日，エは' + times[3] + '日。選択肢外も含めた最長は' + duration + '日で，' +
        source[53].choices[correctIndex] + 'がクリティカルパスとなる。',
    };
  });

export const legacy2014SpringAm27To53Definitions: GenerationDefinition[] = [
  relations, sql, transactions, layers, protocols, addressFamilies, mail, commands, hostCount, mac, pki, ic, security,
  technology, attacks, password, endpoints, ports, protection, uml, encapsulation, modeling, testing, development, pdca, breakdown, criticalPath,
];
