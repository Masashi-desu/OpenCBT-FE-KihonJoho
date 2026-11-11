import { code, list, p, strings, table } from './definition';
import { drawing, encryptionCases, projectCases } from './legacy-2009-autumn-am-27-53-figures';
import { finite, original } from './legacy-2009-autumn-am-27-53-shared';

const formatted = (value: number) => value.toLocaleString('en-US');

const audioCases = [
  { samples: 11000, bits: 8, megabytes: 512 },
  { samples: 12000, bits: 8, megabytes: 576 },
  { samples: 8000, bits: 16, megabytes: 480 },
  { samples: 16000, bits: 8, megabytes: 720 },
];
const audio = finite(30, '標本化周波数・量子化幅・容量の組合せ', audioCases.length,
  '元の十進容量と整数分の切捨てを維持する。誤答は容量の桁を一つ下げる，ビットをバイトに換算しない，1バイトを10ビットとする誤りに対応し，元の小さい値からの並びを固定する。', index => {
    const { samples, bits, megabytes } = audioCases[index];
    const bytes = megabytes * 10 ** 6;
    const bytesPerMinute = samples * bits / 8 * 60;
    const duration = bytes / bytesPerMinute;
    const values = [duration / 10, duration / 8, duration, duration * 5 / 4].map(Math.floor);
    return {
      prompt: [p('音声のサンプリングを1秒間に' + formatted(samples) + '回行い，サンプリングした値をそれぞれ' + bits +
        'ビットのデータとして記録する。このとき，' + megabytes + '×10⁶バイトの容量をもつフラッシュメモリに，記録できる音声は最大何分か。')],
      choices: strings(values.map(String)),
      correctIndex: 2,
      explanation: '1分のデータ量は ' + formatted(samples) + '×' + bits + '÷8×60＝' + formatted(bytesPerMinute) +
        'バイト。容量 ' + formatted(bytes) + 'バイトをこの値で割り，結果の小数部分を切り捨てると' + values[2] + '分となる。',
    };
  }, true);

const sqlCases = [
  { relation: '注文明細', group: '注文日', amount: '数量', operation: 'AVG', limit: 1000 },
  { relation: '入庫明細', group: '入庫日', amount: '個数', operation: 'MAX', limit: 500 },
  { relation: '点検記録', group: '点検日', amount: '作業時間', operation: 'MIN', limit: 480 },
  { relation: '検品記録', group: '検品日', amount: '不良数', operation: 'SUM', limit: 120 },
];
const sql = finite(33, '集約対象・グループ列・集約演算', sqlCases.length,
  'SQLとして構文が正しいものを選ぶ。非集約列をグループ化していない形，同じ問合せ段での集約の入れ子，WHERE句の集約という原資料の誤り方とコードの字下げを維持する。', index => {
    const { relation, group, amount, operation, limit } = sqlCases[index];
    const aggregate = operation + '(' + amount + ')';
    const from = '\n    FROM ' + relation;
    const by = '\n    GROUP BY ' + group;
    const nested = operation === 'SUM' ? 'AVG(' + aggregate + ')' : operation + '(SUM(' + amount + '))';
    const choices = [
      'SELECT ' + group + ', ' + aggregate + from,
      'SELECT ' + group + ', ' + aggregate + from + by,
      'SELECT ' + group + ', ' + nested + from + by,
      'SELECT ' + group + from + '\n    WHERE SUM(' + amount + ') > ' + limit + by,
    ];
    return {
      prompt: [p(index === 0 ? original(33).prompt :
        relation + '（' + group + '，' + amount + '）を対象とするSQLの構文として，正しいものはどれか。')],
      choices: choices.map(statement => [code(statement, 'sql')]),
      correctIndex: 1,
      explanation: '集約値と一緒に出力する ' + group + ' をGROUP BYに指定する。同じ問合せ段で集約を入れ子にしたり，グループ化前のWHEREで集約値を比較したりすることはできない。',
    };
  }, true);

const addressCases = ['', '08-12-34-56-78-9A', '14-53-80-09-27-F1', '20-48-6C-31-A7-05'];
const mac = finite(36, '48ビットMACアドレスの実例', addressCases.length,
  '原問の先頭・後続24ビットの表と識別子の役割を保持する。変形ではOUIを用いる割当方式の具体的な6オクテットを与え，両方の意味と値の対応も検査する。割当方式を固定したため正答条件は同じ組合せ。', index => {
    const address = addressCases[index];
    const columns = ['先頭24ビット', '後続24ビット'];
    const parts = [address.slice(0, 8), address.slice(9)];
    const cells = original(36).choices.map(option => option.split('｜').map((value, column) =>
      index === 0 ? value : value + '（' + parts[column] + '）'));
    return {
      prompt: [p(index === 0 ? original(36).prompt :
        'ネットワーク機器の48ビットMACアドレスについて，24ビットの割当を用いるグローバル管理方式を考える。' +
        'この方式のアドレスの例 ' + address + ' の構成として，適切な組合せはどれか。')],
      choices: cells.map(row => [table('MACアドレスの構成', columns, [row])]),
      correctIndex: 3,
      explanation: '原問の割当方式では先頭24ビットがOUI（ベンダID），後続24ビットが割当先の組織が一意に付ける番号である。' +
        (index === 0 ? '' : 'この例では先頭が ' + parts[0] + '，後続が ' + parts[1] + ' になる。') + 'IPアドレスはMACアドレスの一部ではない。',
    };
  }, true);

const subnetCases = [
  { first: '10.1.2', last: 146, prefix: 28, wrongPrefix: 26 },
  { first: '172.16.3', last: 77, prefix: 27, wrongPrefix: 24 },
  { first: '192.168.4', last: 222, prefix: 29, wrongPrefix: 27 },
  { first: '10.3.5', last: 201, prefix: 26, wrongPrefix: 25 },
];
const subnet = finite(39, 'IPv4アドレスと連続サブネットマスク', subnetCases.length,
  'アドレス部とプレフィックス長の二つの誤りを組み合わせた四択を維持する。変形では他のマスク幅での境界を誤りに使い，原入力と同様に第4オクテットだけで計算できる。', index => {
    const { first, last, prefix, wrongPrefix } = subnetCases[index];
    const maskByte = 256 - 2 ** (32 - prefix);
    const correctByte = last & maskByte;
    const wrongByte = index === 0 ? 132 : last & (256 - 2 ** (32 - wrongPrefix));
    const choices = [wrongByte, correctByte].flatMap(octet =>
      [wrongPrefix, prefix].map(length => first + '.' + octet + '/' + length));
    return {
      prompt: [p('IPアドレス' + first + '.' + last + '，サブネットマスク255.255.255.' + maskByte + 'のホストが属するサブネットワークはどれか。')],
      choices: strings(choices),
      correctIndex: 3,
      explanation: '255.255.255.' + maskByte + 'の1のビットは' + prefix + '個。マスクのビットとの論理積を求めると，第4オクテットは' +
        last + ' AND ' + maskByte + '＝' + correctByte + 'なので，ネットワークは' + choices[3] + 'となる。',
    };
  }, true);

const encryption = finite(42, '公開鍵で送る向きと通信内容', encryptionCases.length,
  '秘密伝送の図・方向・鍵Kの問いを保持する。A→BとB→Aで復号鍵の所有者が変わるので，選ぶ公開鍵も変わる。暗号文は処理の流れを示す記号例。', index => {
    const { sender, receiver } = encryptionCases[index];
    return {
      prompt: [p('公開鍵暗号方式を用いて，図のように' + sender + 'さんから' + receiver +
        'さんへ，他人に秘密にしておきたい文章を送るとき，暗号化に用いる鍵Kとして，適切なものはどれか。'), drawing('42-encryption', index)],
      choices: strings(original(42).choices),
      correctIndex: receiver === 'A' ? 0 : 2,
      explanation: '受信者の' + receiver + 'さんだけが復号できるように，' + receiver +
        'さんの公開鍵で暗号化する。図のように対となる' + receiver + 'さんの秘密鍵で復号できる。',
    };
  });

const accessCases = [
  { database: '利用者データベース', subject: '利用者情報', operation: '検索し，検索結果を表示する', requirements: ['参照'] },
  { database: '予約データベース', subject: '予約情報', operation: '検索して対象のレコードを表示し，そのレコードの内容を変更する', requirements: ['参照','更新'] },
  { database: '受付データベース', subject: '受付情報', operation: '既存レコードを検索・表示せず，新しいレコードを登録するだけの', requirements: ['更新'] },
  { database: '在庫データベース', subject: '在庫情報', operation: '新しいテーブルを作成し，廃止したテーブルを削除する保守用の', requirements: ['管理者'] },
] as const;
const access = finite(43, 'アプリケーションに必要な操作', accessCases.length,
  '指定の権限範囲を常に表示し，アプリケーションが行う処理に必要十分な権限を選ぶ。', index => {
    const { database, subject, operation, requirements } = accessCases[index];
    const privileges = [
      '参照権限：' + database + 'のレコードの参照が可能',
      '更新権限：' + database + 'へのレコードの登録，変更，削除が可能',
      '管理者権限：' + database + 'のテーブルの参照，登録，変更，削除が可能',
    ];
    const choices = original(43).choices;
    const label = requirements.map(name => name + '権限').join('と');
    const process = operation.endsWith('の') ? operation : operation + 'ための';
    return {
      prompt: [
        p(index === 0 ? original(43).prompt : subject + 'を管理するデータベース（' + database + '）がある。' + process +
          'アプリケーションに与えるデータベースのアクセス権限として，セキュリティ管理上適切なものはどれか。ここで，権限の範囲は次のとおりとする。'),
        p('〔権限の範囲〕'), list(privileges),
      ],
      choices: strings(choices),
      correctIndex: choices.indexOf(label),
      explanation: '処理に必要なのは' + label + 'である。最小権限の考え方に従い，処理で使わない権限は与えない。',
    };
  });

const firewallCases = [
  { client: 'PC', server: 'Webサーバ', port: 80, clientPorts: '1024以上' },
  { client: 'PC', server: 'HTTPSサーバ', port: 443, clientPorts: '49152〜65535' },
  { client: '監視端末', server: '監視サーバ', port: 8080, clientPorts: '32768〜60999' },
  { client: '端末', server: '認証サーバ', port: 8443, clientPorts: '55000〜55999' },
];
const firewall = finite(44, '接続先のサービスと開始側ポート範囲', firewallCases.length,
  '元の四つの発信・応答表を保ち，接続先，サービス番号，発信側ポート範囲を条件から埋める。同じ双方向の要件を毎回判定するため正答の表の役割は一定。', index => {
    const { client, server, port, clientPorts } = firewallCases[index];
    const serverPort = String(port);
    const clientToServer = [client, server, clientPorts, serverPort];
    const serverToClient = [server, client, serverPort, clientPorts];
    const clientToServerWrongPorts = [client, server, serverPort, clientPorts];
    const serverToClientWrongPorts = [server, client, clientPorts, serverPort];
    const options = [
      [clientToServerWrongPorts, serverToClientWrongPorts],
      [clientToServer, serverToClient],
      [serverToClient, clientToServerWrongPorts],
      [serverToClientWrongPorts, clientToServerWrongPorts],
    ];
    return {
      prompt: [p(index === 0 ? original(44).prompt :
        '社内ネットワークとインターネットの接続点にパケットフィルタリング型ファイアウォールを設置する。社内の' + client +
        'からインターネット上の' + server + '（ポート番号' + port + '）にアクセスし，その応答を受け取る。発信時の' + client +
        'のポート番号は' + clientPorts + 'とする。フィルタリングで許可するルールの適切な組合せはどれか。')],
      choices: options.map(([out, back]) => [table('フィルタリングで許可するルール',
        ['方向','送信元','あて先','送信元ポート番号','あて先ポート番号'], [['発信', ...out], ['応答', ...back]])]),
      correctIndex: 1,
      explanation: '発信時は' + client + 'の開始側ポート（' + clientPorts + '）から' + server + 'の' + port +
        '番へ送る。応答は送信元・あて先とポート番号の対応が逆になる。発信側と応答側の両方が一致する表を選ぶ。',
    };
  }, true);

const waterfallCases = [
  { subject: '', order: 'afbecd', tasks: original(49).detail!.split('\n').slice(1).map(line => line.slice(2)) },
  { subject: '商品の受付システム', order: 'cfaebd', tasks: [
    '受付に必要な機能をプログラムに分け，データ受渡しの流れを決める。','各プログラムの具体的な処理手順を設計し，コードにする。',
    '現状の受付作業を調査し，新しいシステムへの要求を定義する。','作成したシステムをテストする。',
    '分割した各プログラムの内部構造を設計する。','要求仕様から受付システムに必要な機能を定義する。',
  ]},
  { subject: '設備の点検システム', order: 'ebdfac', tasks: [
    '処理の詳細な手順を定め，プログラムを実装する。','要求仕様に基づいて，点検システムの機能を定義する。',
    '実装したシステムをテストする。','定義した機能をプログラムに分割し，処理の流れを明確にする。',
    '現場の点検業務を調査・分析して，システムに求める事項を定義する。','分割済みの各プログラム内の構造を設計する。',
  ]},
  { subject: '資料の貸出システム', order: 'dfceba', tasks: [
    '完成したプログラムを用いてテストする。','処理の詳細手順を設計し，コーディングする。',
    '定義した機能をプログラムに分割し，処理の流れを明確にする。','今の貸出業務を調査し，対象システムの要求を定義する。',
    '各プログラムの内部構造を設計する。','決まった要求仕様からシステムとして必要な機能を定義する。',
  ]},
];
const waterfall = finite(49, '開発する対象と作業ラベルの対応', waterfallCases.length,
  '作業a〜fと順序列の形式を維持する。対象システムと個別の作業内容・作業記号の対応を変える。原選択肢の工程逆転をそれぞれ適用するため，正答の役割は同じ。', index => {
    const { subject, order, tasks } = waterfallCases[index];
    const sequences = [[0,2,1,4,3,5],[0,1,2,3,4,5],[0,1,2,3,5,4],[0,1,3,2,4,5]]
      .map(sequence => sequence.map(stage => order[stage]).join(', '));
    return {
      prompt: [
        p(index === 0 ? original(49).prompt : subject + 'をウォータフォールモデルで開発する。システム開発工程の作業内容a〜fを，実施する順序で並べたものはどれか。'),
        p('〔作業内容〕'), list(tasks.map((task, i) => 'abcdef'[i] + '　' + task)),
      ],
      choices: strings(sequences),
      correctIndex: 1,
      explanation: '要求の定義→システム機能の定義→プログラムへの分割→各プログラムの構造設計→詳細手順の設計と実装→テストの順である。対応する作業記号は ' + sequences[1] + ' となる。',
    };
  }, true);

const project = finite(51, '作業A〜Iの日数の組合せ', projectCases.length,
  '作業A〜Iとダミー作業2本の接続を固定し，複数の経路が最長になる日数を設定する。短い経路の和も候補にして，紙面と同じ昇順を保つ。日数の値は図に置く。', index => {
    const [a, b, c, d, e, f, g, h, i] = projectCases[index];
    const join = a + Math.max(b, e);
    const endBeforeD = Math.max(a + f, join + c, join + g);
    const endBeforeI = Math.max(endBeforeD + d, join + h);
    const duration = endBeforeI + i;
    const values = [a + e + c + d + i, a + b + c + d + i, a + b + h + i, duration].sort((left, right) => left - right);
    return {
      prompt: [p(original(51).prompt), drawing('51-project', index)],
      choices: strings(values.map(String)),
      correctIndex: values.indexOf(duration),
      explanation: 'ダミー作業の日数は0だが，合流先では全ての先行作業を待つ。BとEの後の合流は開始から' + join +
        '日，Dの開始は' + endBeforeD + '日。DとHの後でIを開始できるのは' + endBeforeI + '日なので，Iの' + i + '日を足して' + duration + '日となる。',
    };
  }, true);

const effortCases = [
  { budget: 150, spent: 60, tenths: 3 },
  { budget: 180, spent: 80, tenths: 4 },
  { budget: 140, spent: 90, tenths: 5 },
  { budget: 200, spent: 75, tenths: 3 },
];
const effort = finite(52, '見積工数・投入工数・出来高の組合せ', effortCases.length,
  '整数の人月で解ける入力だけを使う。予算残額，見積り上の未完部分工数，現生産性での残工数を誤答にして原資料の選択肢間隔と昇順を維持する。', index => {
    const { budget, spent, tenths } = effortCases[index];
    const forecast = spent * 10 / tenths;
    const excess = forecast - budget;
    const values = [excess, budget - spent, budget * (10 - tenths) / 10, forecast - spent].sort((left, right) => left - right);
    return {
      prompt: [p('あるシステムを開発するための工数を見積もったところ' + budget + '人月であった。現在までの投入工数は' + spent +
        '人月で，出来高は全体の' + tenths + '割であり，進捗に遅れが生じている。今後も同じ生産性が続くと想定したとき，このシステムの開発を完了させるためには何人月の工数が超過するか。')],
      choices: strings(values.map(String)),
      correctIndex: values.indexOf(excess),
      explanation: spent + '人月で全体の' + tenths + '割を終えているため，全体の予測工数は ' + spent + '×10÷' + tenths +
        '＝' + forecast + '人月。見積りの' + budget + '人月との差は' + excess + '人月である。',
    };
  }, true);

export const calculationDefinitions = [audio, sql, mac, subnet, encryption, access, firewall, waterfall, project, effort];
