import { code, figure, p, strings, table } from './definition';
import { legacy2013SpringAm27To53Source as source } from './legacy-2013-spring-am-27-53-source';
import { finite2013SpringAm as finite } from './legacy-2013-spring-am-27-53-shared';
import { legacy2013SpringAm2753Knowledge } from './legacy-2013-spring-am-27-53-knowledge';
import { spring2013Am2753Profiles, spring2013FtthAlt } from './legacy-2013-spring-am-27-53-figures';

const algebraQueries = [
  {
    prompt: source[27].prompt, sql: source[27].material!,
    operations: '選択と射影', explanation: 'WHERE A4 = \'a\'で条件を満たす行に絞る操作が選択、SELECT A1, A2, A3で列を取り出す操作が射影である。',
  },
  {
    prompt: '列A1〜A5から成るR表と，列B1，B2から成るS表に対する次のSQL文は，関係代数のどの演算に対応するか。',
    sql: 'SELECT R.A1, R.A2, S.B2\n    FROM R INNER JOIN S ON R.A4 = S.B1',
    operations: '結合と射影', explanation: 'R.A4とS.B1が等しい行同士を対応付けるINNER JOINが結合、その結果から三つの列を取り出すSELECTが射影である。',
  },
  {
    prompt: 'いずれも列A1〜A5から成るR表とS表に対する次のSQL文は，関係代数のどの演算に対応するか。',
    sql: 'SELECT A1, A2, A3 FROM R\nUNION\nSELECT A1, A2, A3 FROM S',
    operations: '和と射影', explanation: 'SELECTは各表から指定列だけを取り出す射影である。UNIONは両結果の少なくとも一方に現れる行を重複なくまとめる和である。',
  },
];
const relationalAlgebra = finite(27, 'SQLと関係代数', 'SQLで行う表の操作', algebraQueries.length,
  'SQL文から関係代数の演算の組合せを選ぶ。文の字下げと四つの演算組を保持し、行の絞込み、列の取出し、表同士の結合・和を組み替える。SQLの行の重複と関係代数の集合の違いを説明で区別する。', i => {
    const { prompt, sql, operations, explanation } = algebraQueries[i];
    return {
      prompt: [p(prompt), code(sql, 'sql')],
      choices: strings([...source[27].choices]),
      correctIndex: source[27].choices.indexOf(operations),
      explanation: 'SQL（Structured Query Language、データベース問い合わせ言語）の各句の役割を対応付ける。' +
        explanation + '関係代数は集合として扱うため、同じ列値をもつ行の重複を残し得るSQLとはその点が異なる。',
    };
  });

const groupingCases = [
  { table: '中間テスト', key1: 'クラス名', key2: '教科名', individual: '学生番号', label: '名前', value: '点数', average: '平均点', key2First: false },
  { table: '中間テスト', key1: 'クラス名', key2: '教科名', individual: '学生番号', label: '名前', value: '点数', average: '平均点', key2First: true },
  { table: '受注', key1: '支店名', key2: '製品名', individual: '受注番号', label: '担当者名', value: '受注額', average: '平均額', key2First: true },
] as const;
const grouping = finite(28, '集約と表示順を指定するSQL', '集計表・集約列・ソートの優先順', groupingCases.length,
  'SQL中のaに補うGROUP BY・ORDER BYの四択。集計の粒度を保ち、本文の表示順を入れ替える。誤答は別の第2整列キー、個別行での集約、平均自体による集約に対応する。', i => {
    const { table: name, key1, key2, individual, label, value, average, key2First } = groupingCases[i];
    const group = key1 + ', ' + key2;
    const sort = key2First ? key2 + ', ' + key1 : group;
    const sql = 'SELECT ' + group + ', AVG(' + value + ') AS ' + average + '\n    FROM ' + name + '\n    ［a］';
    const prompt = i === 0 ? source[28].prompt : '“' + name + '”表から' + key1 + 'ごと，' + key2 + 'ごとの' + average +
      'を求め，' + sort.replace(', ', '，') + 'の順でそれぞれ昇順に表示するSQL文中のaに入れるべき字句はどれか。';
    const choices = i === 0 ? [...source[28].choices] : [
      'GROUP BY ' + group + ' ORDER BY ' + key2 + ', AVG(' + value + ')',
      'GROUP BY ' + group + ' ORDER BY ' + sort,
      'GROUP BY ' + group + ', ' + individual + ' ORDER BY ' + sort + ', ' + average,
      'GROUP BY ' + key1 + ', ' + average + ' ORDER BY ' + sort,
    ];
    return {
      prompt: [p(prompt), p(name + '（' + [key1, key2, individual, label, value].join('，') + '）'), p('〔SQL文〕'), code(sql, 'sql')],
      choices: choices.map(choice => [code(choice, 'sql')]),
      correctIndex: 1,
      explanation: 'SQL（Structured Query Language）のGROUP BY ' + group + 'で各組にまとめ、AVG（Average、平均）で' +
        value + 'の平均を求める。ORDER BY ' + sort + 'は先に' + (key2First ? key2 : key1) + '、次に' +
        (key2First ? key1 : key2) + 'の昇順にする。学生番号などの個別識別列も集約キーに含めると、本来一つのグループを分割してしまう。',
    };
  });

const matchCases = [
  { word: 'UNIX', position: 'を含む', pattern: (word: string) => '%' + word + '%', rule: '前後に任意の文字列があってもよいので両側に%' },
  { word: 'Linux', position: 'で始まる', pattern: (word: string) => word + '%', rule: '先頭を固定して後ろに任意の文字列を許すので末尾に%' },
  { word: '入門', position: 'で終わる', pattern: (word: string) => '%' + word, rule: '末尾を固定して前に任意の文字列を許すので先頭に%' },
  { word: '情報', position: 'と完全に一致する', pattern: (word: string) => word, rule: '語全体の一致なのでワイルドカードなし' },
] as const;
const like = finite(29, 'SQLのLIKEパターン', '書名の検索語と照合位置', matchCases.length,
  'LIKEの空欄へ入れる文字列を選ぶ。書名列の所在を残し、部分一致・前方一致・後方一致・完全一致で検索位置を変える。四択は同じ検索語に対する%の有無と位置。', i => {
    const { word, position, pattern, rule } = matchCases[i];
    const prompt = i === 0 ? source[29].prompt :
      '“BOOKS”表から書名が“' + word + '”' + position +
      '行を全て探すために次のSQL文を用いる。aに指定する文字列として，適切なものはどれか。ここで，書名は“BOOKS”表の“書名”列に格納されている。';
    const choices = ['%' + word, '%' + word + '%', word, word + '%'];
    return {
      prompt: [p(prompt), code(source[29].material!, 'sql')],
      choices: strings(choices),
      correctIndex: choices.indexOf(pattern(word)),
      explanation: 'SQL（Structured Query Language）のLIKEで%は0文字以上の任意の文字列を表す。今回は' + rule + 'とする。',
    };
  });

const lockCases = [
  { assets: ['X', 'X', 'Y', 'Y'], held: ['共有', '専有', 'なし'], wants: ['共有', '専有', '共有', '専有'] },
  { assets: ['Y', 'X', 'Y', 'Z'], held: ['共有', '専有', 'なし'], wants: ['共有', '専有', '専有', '共有'] },
  { assets: ['Z', 'Y', 'X', 'Z'], held: ['なし', '共有', '専有'], wants: ['共有', '専有', '専有', '専有'] },
] as const;
const lockNames = ['X', 'Y', 'Z'] as const;
const locks = finite(30, 'データベースの共有・専有ロック', '資源別の保持ロックと要求', lockCases.length,
  'ロック獲得が可能という四つの記述から適切なものを選ぶ。変種では現在の保持状態と要求先を本文と四択に明示。共有同士・専有競合・未保持の境界を区別する。', i => {
    const { assets, held, wants } = lockCases[i];
    const prompt = i === 0 ? source[30].prompt :
      'データベースの排他制御で，トランザクションAは資源' + lockNames.map((asset, n) =>
        asset + 'には' + (held[n] === 'なし' ? 'ロックを獲得していない' : held[n] + 'ロックを獲得している')).join('，資源') +
      '。ほかにロックを獲得しているトランザクションはない。別のトランザクションによるロック獲得の可能性のうち，適切なものはどれか。';
    const choices = i === 0 ? [...source[30].choices] :
      assets.map((asset, n) => '別のトランザクションが資源' + asset + 'に' + wants[n] + 'ロックを獲得することは可能である。');
    const correctIndex = assets.findIndex((asset, n) => {
      const current = held[lockNames.indexOf(asset)];
      return current === 'なし' || current === '共有' && wants[n] === '共有';
    });
    return {
      prompt: [p(prompt)], choices: strings(choices), correctIndex,
      explanation: '共有ロック同士なら同じ資源で共存できる。専有ロックは同じ資源への他のロックと共存できない。' +
        (i === 0 ? 'したがって，共有ロックを既に獲得した資源に別のトランザクションも共有ロックを獲得できる場合だけが該当する。' :
          '他のトランザクションがロックを持たない資源なら共有・専有のどちらも獲得できる。該当するのは資源' +
          assets[correctIndex] + 'への' + wants[correctIndex] + 'ロック要求である。'),
    };
  });

const addressCases = [
  { prefix: '', candidates: [...source[31].choices] },
  { prefix: '10', candidates: ['10.64.256.1', '10.64.255.1', '10.64.32.9', '10.64.32.0'] },
  { prefix: '172.16', candidates: ['172.16.5.1', '172.16.255.1', '172.16.28.1', '172.16.257.1'] },
  { prefix: '192.168', candidates: ['192.168.12.2', '192.168.0.7', '192.168.12.259', '192.168.255.1'] },
];
const addressNotation = finite(31, 'IPv4のドット区切り十進表記', '対象ネットワークの先頭部分とアドレス候補', addressCases.length,
  'IPv4アドレス表記の誤りを一つ選ぶ否定の問い。先頭部分を共有する候補から、8ビットの範囲を超える位置を変える。ユニキャスト割当ての可否と表記上の可否は区別する。', i => {
    const { prefix, candidates } = addressCases[i];
    const prompt = prefix ? 'ドット区切り十進表記で，先頭が' + prefix + 'であるIPv4アドレスを記載する。IPv4アドレス表記として，正しくないものはどれか。' : source[31].prompt;
    const correctIndex = candidates.findIndex(address => address.split('.').some(octet => Number(octet) > 255));
    const invalid = candidates[correctIndex].split('.').find(octet => Number(octet) > 255);
    return {
      prompt: [p(prompt)], choices: strings(candidates), correctIndex,
      explanation: 'IPv4（Internet Protocol version 4）では，32ビットを8ビットずつ四つに分けて書く。各部分の十進数の範囲は0〜255である。' +
        candidates[correctIndex] + 'の' + invalid + 'は範囲外である。これは表記の判定であり，機器に割当て可能かどうかの判定とは別である。',
    };
  });

const lineCases = [
  { bytes: 2000, batch: 2, header: 400, items: 100_000, rate: 1 },
  { bytes: 2500, batch: 2, header: 500, items: 144_000, rate: 2 },
  { bytes: 1800, batch: 3, header: 450, items: 108_000, rate: 1 },
] as const;
const decimal = new Intl.NumberFormat('en-US');
const lineUse = finite(32, '伝票のまとめ送信と回線利用率', '伝票長・集約件数・ヘッダ長・時間当たり発生数・回線速度', lineCases.length,
  '1時間のバイト数を8倍し，秒数と十進Mビット毎秒で割る。数値選択肢は昇順を維持し，8倍漏れ，ヘッダ漏れ，まとめ送信のヘッダと伝票ごとのヘッダの混同を使う。小数1桁の小さい候補と整数の近似値3個を原問に合わせる。', i => {
    const { bytes, batch, header, items, rate } = lineCases[i];
    const frames = items / batch;
    const frameBytes = bytes * batch + header;
    const capacity = rate * 1_000_000 * 3600;
    const bitRatio = (totalBytes: number) => totalBytes * 8 / capacity * 100;
    const ratio = bitRatio(frames * frameBytes);
    const options = i === 0 ? [...source[32].choices] : [
      (ratio / 8).toFixed(1), String(Math.round(bitRatio(items * bytes))),
      String(Math.round(ratio)), String(Math.round(bitRatio(items * (bytes + header)))),
    ];
    const prompt = i === 0 ? source[32].prompt :
      '本社と工場との間を専用線で接続してデータを伝送するシステムがある。このシステムでは' +
      decimal.format(bytes) + 'バイト／件の伝票データを' + batch + '件ずつまとめ，それに' + decimal.format(header) +
      'バイトのヘッダ情報を付加して送っている。伝票データは，1時間に平均' + decimal.format(items) +
      '件発生している。回線速度を' + rate + 'Mビット／秒としたとき，回線利用率はおよそ何％か。';
    return {
      prompt: [p(prompt)], choices: strings(options), correctIndex: 2,
      explanation: '1回は' + decimal.format(frameBytes) + 'バイト、毎時' + decimal.format(frames) +
        '回を送る。毎時の伝送量は' + decimal.format(frameBytes * frames * 8) + 'ビットで、回線の毎時の容量は' +
        decimal.format(capacity) + 'ビットである。伝送量を容量で割るとおよそ' + options[2] + '％となる。',
    };
  });

const ftthOptions = [
  {
    stem: source[34].prompt,
    answer: 1,
    explanation: '複数の端末の内部IPv4アドレスとポートを、外部で使う一つのIPv4アドレスと区別可能なポートに変換し、応答を元の端末へ戻す。NAPT（Network Address Port Translation、ネットワークアドレスとポートの変換）がこれを実現する。',
  },
  {
    stem: 'LANに接続されている複数のPCを，FTTHを使ってインターネットに接続する。家庭内の各PCが起動するとき，手入力なしで利用できるIPアドレスや既定のゲートウェイを知らせるのに必要となる装置Aの機能はどれか。',
    answer: 0,
    explanation: 'DHCP（Dynamic Host Configuration Protocol、動的ホスト設定プロトコル）のサーバ機能で、端末にアドレスや既定ゲートウェイなどを配布する。アドレスを使った通信の変換や通過可否の制御とは役割が異なる。',
  },
  {
    stem: 'LANに接続されている複数のPCを，FTTHを使ってインターネットに接続する。回線事業者はイーサネット区間の先に接続先を用意し，装置Aは契約時の利用者IDとパスワードを使ってその接続先とPPPセッションを確立する。これに必要となる装置Aの機能はどれか。',
    answer: 2,
    explanation: 'PPPoE（Point-to-Point Protocol over Ethernet）は、イーサネット上でPPP（Point-to-Point Protocol、2点間接続用プロトコル）を利用できるようにする方式である。PPPのセッションを確立するために使う。',
  },
  {
    stem: 'LANに接続されている複数のPCを，FTTHを使ってインターネットに接続する。装置Aでは，外部へ向かう通信のうち指定した宛先IPアドレスとポート番号に該当する通信だけを拒否したい。必要となる装置Aの機能はどれか。',
    answer: 3,
    explanation: 'パケットフィルタリングは、送信元・宛先アドレスやポート番号などを規則と照合して通過を制御する。端末の設定配布、外部アドレスへの変換、セッション確立とは目的が異なる。',
  },
];
const ftth = finite(34, 'FTTH接続装置の機能', '装置Aが果たす通信上の目的', ftthOptions.length,
  'PCからハブ、装置A、ONU、FTTHへ至る図を保持し、装置Aに必要な機能を選ぶ。一つのアドレスの共有、宅内設定配布、回線接続セッション、宛先による通過制御を本文で区別する。', i => {
    const { stem, answer, explanation } = ftthOptions[i];
    return {
      prompt: [p(stem), figure(spring2013Am2753Profiles.ftth, [0], 'FTTH接続の構成', spring2013FtthAlt())],
      choices: strings([...source[34].choices]), correctIndex: answer,
      explanation: explanation + 'LANはLocal Area Network、PCはPersonal Computer、FTTHはFiber to the Home（光回線を利用者宅まで引き込む方式）、WANはWide Area Network、IPはInternet Protocol、ONUはOptical Network Unit（光回線終端装置）の略である。',
    };
  });

const fields = ['宛先MACアドレス', '送信元MACアドレス', '宛先IPアドレス', '送信元IPアドレス', '宛先TCPポート番号', '送信元TCPポート番号'];
const idCases = [
  { question: source[35].prompt, key: [false, false, true, true, true, true], detail: 'TCPのコネクションは両端のIPアドレスとTCPポート番号の四つ組で区別する。同じ端末間でも複数の接続があり得る。' },
  { question: 'TCP/IPのネットワークにおいて，IP層で，転送するIPパケットの送信元と最終宛先の両方を識別するために必要な情報の組合せはどれか。', key: [false, false, true, true, false, false], detail: 'IP層で送信元と最終宛先を表すのは、ヘッダにある二つのIPアドレスである。TCPポート番号は上位層の情報、MACアドレスはリンク内の情報である。' },
  { question: 'TCP/IPのネットワークにおいて，同じイーサネット区間を流れるフレームから，この区間の送信元と宛先をデータリンク層で識別するために必要な情報の組合せはどれか。', key: [true, true, false, false, false, false], detail: 'データリンク層でフレームの送信元と宛先を示すのは、その区間で使われる二つのMACアドレスである。IPやTCPの情報はこの識別に使わない。' },
] as const;
const endpointInformation = finite(35, '通信の識別情報', '識別する通信単位と層', idCases.length,
  '表の6列、宛先／送信元の順、○×凡例、四つの情報組合せを維持。何を識別するかをTCPコネクション・IP層の送信元と宛先・イーサネット区間の送信元と宛先で変更。', i => {
    const { question, key, detail } = idCases[i];
    const masks = source[35].choices.map(row => row.split('，'));
    if (i === 2) masks[3] = ['○', '○', '×', '×', '×', '×'];
    const correctIndex = masks.findIndex(row => row.every((mark, j) => (mark === '○') === key[j]));
    const prompt = i === 0 ? question : question + 'ここで，必要な情報は“○”で表し，不要な情報は“×”で表す。';
    return {
      prompt: [p(prompt)],
      choices: masks.map(row => [{ ...table('識別情報の組合せ', fields, [row]), captionPresentation: 'accessible' as const }]),
      correctIndex,
      explanation: detail + 'TCPはTransmission Control Protocol（伝送制御プロトコル）、IPはInternet Protocol、MACはMedia Access Control（媒体アクセス制御）の略である。',
    };
  });

const firewallFields = ['送信元アドレス', '宛先アドレス', 'プロトコル', '送信元ポート番号', '宛先ポート番号'];
const firewallRules = [
  ['10.1.2.3', '*', '*', '*', '*', '通過禁止'],
  ['*', '10.2.3.*', 'TCP', '*', '25', '通過許可'],
  ['*', '10.1.*', 'TCP', '*', '25', '通過許可'],
  ['*', '*', '*', '*', '*', '通過禁止'],
];
const packets = [
  ['10.1.2.3', '10.2.3.4', 'TCP', '2100', '25'],
  ['10.1.2.4', '10.2.3.4', 'TCP', '2100', '25'],
  ['10.1.2.4', '10.1.8.9', 'TCP', '2100', '25'],
  ['10.1.2.4', '10.1.8.9', 'UDP', '2100', '25'],
  ['10.1.2.4', '10.2.3.4', 'TCP', '2100', '26'],
];
const firewall = finite(42, 'ファイアウォールの先勝ち規則', '評価するパケット', packets.length,
  '番号順で最初に適用したルールのみ、ワイルドカードの注記、ルール表とパケット表、番号1〜4に対応する選択肢順を保持。送信元、宛先、プロトコル又は宛先ポートを変え、先勝ちと最後の拒否を区別。', i => {
    const packet = packets[i];
    const ruleIndex = firewallRules.findIndex(rule => packet.every((value, j) => rule[j].endsWith('*')
      ? value.startsWith(rule[j].slice(0, -1)) : rule[j] === value));
    return {
      prompt: [p(source[42].prompt), table('ルール一覧', ['番号', ...firewallFields, '動作'],
        firewallRules.map((row, n) => [String(n + 1), ...row])), p('注記　*は任意のパターンを表す。'),
      table('パケットA', firewallFields, [packet])],
      choices: strings([...source[42].choices]), correctIndex: ruleIndex,
      explanation: '送信元' + packet[0] + '、宛先' + packet[1] + '、' + packet[2] + '、送信元ポート' + packet[3] +
        '、宛先ポート' + packet[4] + 'の各値をルールと照合する。' +
        (ruleIndex > 0 ? '番号1〜' + ruleIndex + 'では少なくとも一つの欄が合わない。' : '') +
        '最初に全欄が合うのは番号' + (ruleIndex + 1) + 'なので' + firewallRules[ruleIndex][5] +
        'となり、後のルールは調べない。TCPはTransmission Control Protocol、UDPはUser Datagram Protocolである。',
    };
  });

const fpTypes = ['外部入力', '外部出力', '内部論理ファイル', '外部インタフェースファイル', '外部照会'];
const fpWeights = [4, 5, 10, 7, 4];
const fpCases = [
  { counts: [1, 2, 1, 0, 0], factor: 0.75 },
  { counts: [2, 2, 1, 0, 2], factor: 0.75 },
  { counts: [2, 3, 1, 1, 0], factor: 0.8 },
] as const;
const functionPoints = finite(53, 'ファンクションポイントの補正計算', '機能種別の個数と補正係数', fpCases.length,
  '5機能の表と補正係数の前提を保持。整数になる個数・重み・補正係数の組のみ用い，原問どおり数値は昇順。未補正，減少分を加える逆方向補正，係数で割る逆演算を誤答に用いる。', i => {
    const { counts, factor } = fpCases[i];
    const contributions = counts.map((count, n) => count * fpWeights[n]);
    const total = contributions.reduce((a, b) => a + b, 0);
    const answers = [total * factor, total, total + total * (1 - factor), total / factor];
    const prompt = i === 0 ? source[53].prompt : source[53].prompt.replace('0.75', String(factor));
    return {
      prompt: [p(prompt), { ...table('機能と特性', ['ユーザファンクションタイプ', '個数', '重み付け係数'],
        fpTypes.map((name, n) => [name, String(counts[n]), String(fpWeights[n])])), captionPresentation: 'accessible' as const }],
      choices: strings(answers.map(String)), correctIndex: 0,
      explanation: '機能ごとに個数×重み付け係数を求めて足すと' + contributions.join('＋') +
        '＝' + total + 'になる。これに複雑さの補正係数を掛けるので、' + total + '×' + factor + '＝' +
        answers[0] + 'ファンクションポイントとなる。',
    };
  });

export const legacy2013SpringAm27To53Definitions = [
  relationalAlgebra, grouping, like, locks, addressNotation, lineUse, ftth, endpointInformation, firewall, functionPoints,
  ...legacy2013SpringAm2753Knowledge,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
