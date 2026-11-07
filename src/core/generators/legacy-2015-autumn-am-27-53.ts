import { code, field, figure, p, strings, table, type GeneratedBody, type GenerationDefinition, variableNotes } from './definition';
import { decemberANumericalDefinitions } from './sample-2022-dec-a-numerical';
import { legacy2015AutumnAm2753Knowledge } from './legacy-2015-autumn-am-27-53-knowledge';
import { arrowAlt, arrowDays, arrowDummies, arrowEdges, branchAlt, branchConditions, legacy2015AutumnAm2753Profiles, normalizationCosts, relationAlt } from './legacy-2015-autumn-am-27-53-figures';

function finite(number: number, title: string, sourceAnswer: string, name: string, size: number,
  build: (candidate: number) => GeneratedBody, notes: string, fixed = false): GenerationDefinition {
  return {
    source: `2015h27a-fe-am-${number}`,
    title,
    fields: [field(name, 0, size - 1)],
    reference: [0],
    sourceAnswer,
    version: '3.2.0',
    ...(fixed ? { answerVariation: 'fixed' as const } : {}),
    notes: `${variableNotes} ${notes}`,
    build(values) {
      const [candidate] = values;
      if (values.length !== 1 || !Number.isSafeInteger(candidate) || candidate < 0 || candidate >= size) throw Error('PARAMETER_CONSTRAINT');
      return build(candidate);
    },
  };
}

const normalization = finite(27, '関数従属性と第3正規形の注文明細', 'エ', '価格・費用を決める属性', normalizationCosts.length, candidate => {
  const { value, determinant } = normalizationCosts[candidate];
  const dependsOn = determinant.length === 2 ? '{注文番号，商品番号}' : determinant[0];
  const placement = determinant.length === 2 ? '注文番号と商品番号の組で決まるので注文明細に残す。' :
    `${determinant[0]}だけで決まるので「${determinant[0] === '商品番号' ? '商品' : '注文'}」に分ける。`;
  const relation = (option: number) => ({
    ...figure(legacy2015AutumnAm2753Profiles.relation, [candidate, option], option ? '注文明細の関係式' : '注文記録の関係式', relationAlt(candidate, option)),
    captionPresentation: 'accessible' as const,
  });
  return {
    prompt: [
      p('関係「注文記録」の属性間に①〜⑥の関数従属性があり，それに基づいて第3正規形まで正規化を行って，「商品」，「顧客」，「注文」，「注文明細」の各関係に分解した。関係「注文明細」として，適切なものはどれか。ここで，{X，Y}は，属性XとYの組みを表し，X→Yは，XがYを関数的に決定することを表す。また，実線の下線は主キーを表す。'),
      relation(0),
      p('〔関数従属性〕'),
      p('① 注文番号 → 注文日　　② 注文番号 → 顧客番号'),
      p('③ 顧客番号 → 顧客名　　④ {注文番号，商品番号} → 数量'),
      p(`⑤ ${dependsOn} → ${value}　　⑥ 商品番号 → 商品名`),
    ],
    choices: [1, 2, 3, 4].map(option => [relation(option)]),
    correctIndex: 3,
    explanation: `数量は注文番号と商品番号の両方で決まる。商品番号を含まないア・イでは明細を区別できず、ウは注文番号から決まる顧客番号までキーに含む。${value}は${placement} 顧客名は顧客番号で決まるので顧客に分ける。`,
  };
}, '選択肢の複合キーの役割を維持するため正答位置は固定。価格・費用の決定項を変えると、明細に残る属性が実際に変わる。実線下線を描画し、読み上げでは主キー属性を列挙する。', true);

const stockCases = [
  { quantities: [3, 2, 1, 2], date: '2015-10-11' },
  { quantities: [7, 1, 1, 2], date: '2015-10-11' },
  { quantities: [3, 2, 5, 4], date: '2015-10-11' },
  { quantities: [5, 4, 1, 1], date: '2015-10-10' },
] as const;
const aggregate = finite(28, '出庫記録のSQL集約値', 'イ', '出庫数量と比較する日', stockCases.length, candidate => {
  const { quantities, date } = stockCases[candidate];
  const [a, b, c, d] = quantities;
  const sql = [
    "SELECT AVG(数量) FROM 出庫記録 WHERE 商品番号 = 'NP200'",
    'SELECT COUNT(*) FROM 出庫記録',
    'SELECT MAX(数量) FROM 出庫記録',
    `SELECT SUM(数量) FROM 出庫記録 WHERE 日付 = '${date}'`,
  ];
  const results = [(a + c) / 2, quantities.length, Math.max(...quantities), date.endsWith('10') ? a + b : c + d];
  const maximum = Math.max(...results);
  return {
    prompt: [
      p('「出庫記録」表に対するSQL文のうち，最も大きな値が得られるものはどれか。'),
      table('出庫記録', ['商品番号', '日付', '数量'], [
        ['NP200', '2015-10-10', String(a)], ['FP233', '2015-10-10', String(b)],
        ['NP200', '2015-10-11', String(c)], ['FP233', '2015-10-11', String(d)],
      ]),
    ],
    choices: sql.map(statement => [code(statement, 'sql')]),
    correctIndex: results.indexOf(maximum),
    explanation: `アはNP200の平均で${results[0]}、イは全行数で${results[1]}、ウは全行の数量の最大で${results[2]}、エは${date}の合計で${results[3]}。この四つで最大は${maximum}である。`,
  };
}, '入力は二商品×二日。最大値の一意性をSQLiteで全検算し、原問の誤答二択同値は維持。平均は整数で計算できる。');

const canonicalTransfer = decemberANumericalDefinitions.find(def => def.source === 'sample-2022-dec-a-26');
if (!canonicalTransfer) throw Error('SOURCE_2022_DEC_A_26_REQUIRED');
const transferInputs = [[4, 1], [2, 1], [6, 1], [6, 2]] as const;
const transfer = finite(30, '伝送効率込みのデータ転送時間', 'エ', '容量と伝送速度', transferInputs.length, candidate => {
  const body = canonicalTransfer.build([...transferInputs[candidate]]);
  if (candidate === 0) {
    body.prompt[0] = p('1.5 Mビット／秒の伝送路を用いて12 Mバイトのデータを転送するのに必要な伝送時間は何秒か。ここで，伝送路の伝送効率を50%とする。');
  }
  return body;
}, '本文の容量・速度を可変にし、同型の2022年12月科目A問26の演算を共有する。換算係数や効率を一部又は全部省くと常に短い時間になるため、元の2倍刻み・昇順・正答位置を維持する。', true);

const ipCases = [
  { network: '192.168.0.0', prefix: 24, low: '192.168.0.0', high: '192.168.0.255', loop: '192.168.0.1', correct: 1 },
  { network: '172.16.24.0', prefix: 25, low: '172.16.24.128', high: '172.16.24.127', loop: '172.16.24.1', correct: 2 },
  { network: '10.0.1.64', prefix: 26, low: '10.0.1.65', high: '10.0.1.126', loop: '127.0.0.1', correct: 3 },
] as const;
const ipv4 = finite(34, 'IPv4アドレスの種類と範囲', 'イ', 'サブネットの境界とループバック候補', ipCases.length, candidate => {
  const entry = ipCases[candidate];
  const addr = `${entry.network}/${entry.prefix}`;
  const net = candidate ? entry.low : entry.network;
  const broadcast = candidate ? entry.high : entry.network;
  const range = candidate === 1 ? '172.16.0.0〜172.31.255.255' : '10.0.0.0〜10.255.255.255';
  const prompt = candidate === 0
    ? 'IPv4アドレスに関する記述のうち，適切なものはどれか。'
    : `私用ネットワーク${addr}の設定と，同じ端末内での通信を確認する。IPv4アドレスに関する記述のうち，適切なものはどれか。`;
  const optionA = candidate === 0
    ? '192.168.0.0〜192.168.255.255は，クラスCアドレスなのでJPNICへの届出が必要である。'
    : `${range}を組織内の私用アドレスとして使うには，JPNICへの届出が必要である。`;
  const bottom = Number(entry.network.split('.').at(-1));
  const top = entry.network.split('.').slice(0, 3).join('.') + '.' + (bottom + 2 ** (32 - entry.prefix) - 1);
  return {
    prompt: [p(prompt)],
    choices: strings([
      optionA, `${addr}のネットワークアドレスは，${net}である。`,
      `${addr}のブロードキャストアドレスは，${broadcast}である。`,
      `${entry.loop}は，プログラムなどで自分自身と通信する場合に利用されるループバックアドレスである。`,
    ]),
    correctIndex: entry.correct,
    explanation: `私用アドレスは組織内利用のための範囲で、使用の届出は要らない。${addr}ではホスト部が全て0の${entry.network}がネットワークアドレス、全て1の${top}がブロードキャストアドレスである。ループバックは127.0.0.0/8の範囲である。`,
  };
}, '私用範囲、ネットワーク、ブロードキャスト、ループバックの4役を固定。/24・/25・/26の与件を使い、/31等の例外は扱わない。');

const signatureObjects = [
  { name: 'メッセージ', mode: '', choice: 'メッセージ' },
  { name: '配布ファイル', mode: '配布元の署名検証鍵を事前に確認した上で，', choice: '配布ファイル' },
  { name: '配布物一覧', mode: '個々の配布物ではなく一覧の内容を保護するために，', choice: '配布物一覧' },
] as const;
const signature = finite(36, '署名検証で確認できること', 'ア', '署名対象と配布条件', signatureObjects.length, candidate => {
  const { name, mode, choice } = signatureObjects[candidate];
  const originalPrompt = '手順に示す処理を実施することによって，メッセージの改ざんの検知の他に，受信者Bができることはどれか。';
  const prompt = candidate === 0 ? originalPrompt : `${mode}${originalPrompt.replace('メッセージ', name)}`;
  return {
    prompt: [
      p(prompt), p('〔手順〕'), p('送信者Aの処理'),
      p(`（1）${name}から，ハッシュ関数を使ってダイジェストを生成する。`),
      p(`（2）秘密に保持している自分の署名生成鍵を用いて，（1）で生成したダイジェストから${name}の署名を生成する。`),
      p(`（3）${name}と，（2）で生成した署名を受信者Bに送信する。`),
      p('受信者Bの処理'),
      p(`（4）受信した${name}から，ハッシュ関数を使ってダイジェストを生成する。`),
      p('（5）（4）で生成したダイジェスト及び送信者Aの署名検証鍵を用いて，受信した署名を検証する。'),
    ],
    choices: strings([
      `${choice}が送信者Aからのものであることの確認`,
      `${choice}の改ざん部位の特定`, `${choice}の盗聴の検知`, `${choice}の漏えいの防止`,
    ]),
    correctIndex: 0,
    explanation: `A本人に対応すると確認した検証鍵で署名を検証すれば、${choice}がAの署名生成鍵で署名されたことを確認できる。ハッシュだけでは改ざん箇所は特定できず、署名は本文を暗号化しないので盗聴検知や漏えい防止にもならない。` +
      (candidate === 2 ? '署名対象は一覧であり、一覧に載る個々の配布物の内容は別に検証する。' : ''),
  };
}, '署名の5手順と「改ざんの検知の他」を維持。メッセージ・配布ファイル・配布物一覧では署名が保証する範囲が異なる。署名そのものの送信者確認という正答の役割は変えない。', true);

const rules = [
  ['1', '10.1.2.3', '*', '*', '*', '*', '通過禁止'],
  ['2', '*', '10.2.3.*', 'TCP', '*', '25', '通過許可'],
  ['3', '*', '10.1.*', 'TCP', '*', '25', '通過許可'],
  ['4', '*', '*', '*', '*', '*', '通過禁止'],
] as const;
const packets = [
  ['10.1.2.3', '10.2.3.4', 'TCP', '2100', '25'],
  ['10.1.2.8', '10.2.3.4', 'TCP', '2100', '25'],
  ['10.1.2.8', '10.1.3.4', 'TCP', '2100', '25'],
  ['10.1.2.8', '10.2.3.4', 'UDP', '2100', '25'],
] as const;
const packetFields = ['送信元アドレス', '宛先アドレス', 'プロトコル', '送信元ポート番号', '宛先ポート番号'];
function matchesPacket(condition: string, value: string): boolean {
  return condition === '*' || condition === value || (condition.endsWith('.*') && value.startsWith(condition.slice(0, -1)));
}
const filtering = finite(44, 'パケットフィルタリングの最初の一致', 'ア', '送信元・宛先・プロトコルの組', packets.length, candidate => {
  const packet = packets[candidate];
  const index = rules.findIndex(rule => packet.every((value, column) => matchesPacket(rule[column + 1], value)));
  const options = rules.map(([number, , , , , , action]) => `番号${number}によって，通過を${action === '通過許可' ? '許可' : '禁止'}する。`);
  const previous = ['送信元10.1.2.3が番号1に一致する。', '番号1は送信元が違い、宛先とTCPの宛先ポートが番号2に一致する。', '番号1は送信元、番号2は宛先が違い、宛先とTCPの宛先ポートが番号3に一致する。', '番号1は送信元が違い、番号2と3はいずれもTCPのみを対象とするので、UDPのこのパケットには一致しない。'];
  return {
    prompt: [
      p('パケットフィルタリング型ファイアウォールがルール一覧に基づいてパケットを制御する場合，パケットAに適用されるルールとそのときの動作はどれか。ここで，ファイアウォールでは，ルール一覧に示す番号の1から順にルールを適用し，一つのルールが適合したときには残りのルールは適用しない。'),
      table('ルール一覧', ['番号', ...packetFields, '動作'], rules.map(rule => [...rule])),
      p('注記　*は任意のものに適合するパターンを表す。'),
      table('パケットA', packetFields, [[...packet]]),
    ],
    choices: strings(options), correctIndex: index,
    explanation: previous[index] + `上から最初に一致する番号${index + 1}の動作は${rules[index][6]}。以降の規則は照合しない。`,
  };
}, '7列の規則表と5列のパケット表、ワイルドカード、最初の一致、番号順4択を保持。入力の送信元・宛先・プロトコルを変えて四つの規則を個別に発火させる。');

const coverageCases = [
  [[1], [1, 2], [0, 3], [1, 2, 3]],
  [[1], [1, 2], [0, 2], [0, 2, 3]],
  [[0], [0, 2], [1, 3], [0, 1, 3]],
] as const;
function branchResult(candidate: number, input: number): boolean {
  const a = (input & 2) !== 0, b = (input & 1) !== 0;
  if (candidate === 0) return a || b;
  if (candidate === 1) return a && b;
  return !a || b;
}
const branch = finite(47, '判定条件網羅とテストケース表', 'ウ', '流れ図の複合条件', coverageCases.length, candidate => {
  const cases = coverageCases[candidate];
  const results = cases.map(rows => rows.map(input => branchResult(candidate, input)));
  return {
    prompt: [
      p('プログラム中の図の部分を判定条件網羅（分岐網羅）でテストするときのテストケースとして，適切なものはどれか。'),
      figure(legacy2015AutumnAm2753Profiles.branch, [candidate], '流れ図', branchAlt(candidate)),
    ],
    choices: cases.map(rows => [table('テストケース', ['A', 'B'], rows.map(input => [(input & 2) !== 0 ? '真' : '偽', (input & 1) !== 0 ? '真' : '偽']))]),
    correctIndex: results.findIndex(row => row.includes(true) && row.includes(false)),
    explanation: `判定条件網羅では，式全体の真と偽を両方通る必要がある。${branchConditions[candidate]}の各択の判定結果は，${results.map((row, index) => `${'アイウエ'[index]}は${row.map(value => value ? '真' : '偽').join('・')}`).join('、')}。式を構成するAとBをそれぞれ真・偽にしただけでは十分でない。`,
  };
}, '1判定・真の命令・偽の迂回・合流、1/2/2/3行のA/B表4択を保持。判定式と必要な真偽入力を連動する。');

const criticalPath = finite(51, 'ダミー作業を含むアローダイアグラム', 'イ', '作業の日数', arrowDays.length, candidate => {
  const earliest = Array<number>(8).fill(0);
  const edges = [
    ...arrowEdges.map(([from, to], index) => ({ from, to, days: arrowDays[candidate][index] })),
    ...arrowDummies.map(([from, to]) => ({ from, to, days: 0 })),
  ];
  for (let node = 2; node <= 7; node++) {
    earliest[node] = Math.max(...edges.filter(edge => edge.to === node).map(edge => earliest[edge.from] + edge.days));
  }
  const options = [115, 120, 125, 130];
  return {
    prompt: [
      p('図のアローダイアグラムで表されるプロジェクトは，完了までに最短で何日を要するか。'),
      figure(legacy2015AutumnAm2753Profiles.network, [candidate], 'アローダイアグラム', arrowAlt(candidate)),
    ],
    choices: strings(options.map(String)), correctIndex: options.indexOf(earliest[7]),
    explanation: `結合点では，先行作業がすべて終わる最も遅い到着時刻を採る。ダミーは所要0日でも先行関係を伝える。節点1から7の最早時刻は順に${earliest.slice(1).join('，')}日で，完了までは${earliest[7]}日を要する。`,
  };
}, '原図の節点番号1〜7、実線8本、破線2本、凡例、115/120/125/130の日数順を保持。ボトルネックになる枝の長さを変える。');

const fpWeights = [4, 5, 10, 7, 4];
const fpNames = ['外部入力', '外部出力', '内部論理ファイル', '外部インタフェースファイル', '外部照会'];
const fpCases = [
  { counts: [1, 2, 1, 0, 0], factor: 75, options: [18, 24, 30, 32] },
  { counts: [2, 0, 2, 0, 2], factor: 75, options: [21, 27, 36, 48] },
  { counts: [2, 1, 0, 1, 0], factor: 80, options: [12, 16, 20, 25] },
  { counts: [2, 0, 2, 0, 1], factor: 75, options: [18, 21, 24, 32] },
] as const;
const functionPoints = finite(52, '5機能のファンクションポイント補正', 'ア', '機能の個数と補正係数', fpCases.length, candidate => {
  const { counts, factor, options } = fpCases[candidate];
  const raw = counts.reduce<number>((sum, value, i) => sum + value * fpWeights[i], 0);
  const answer = raw * factor / 100;
  return {
    prompt: [
      p(`表の機能と特性をもったプログラムのファンクションポイント値は幾らか。ここで，複雑さの補正係数は${factor / 100}とする。`),
      {
        type: 'table', caption: '機能種別ごとの個数と重み', captionPresentation: 'accessible',
        columns: ['ユーザファンクションタイプ', '個数', '重み付け係数'],
        rows: fpNames.map((name, index) => [name, String(counts[index]), String(fpWeights[index])]),
      },
    ],
    choices: strings(options.map(String)), correctIndex: options.findIndex(option => option === answer),
    explanation: `各機能の個数×重みの和は${counts.map((count, i) => `${count}×${fpWeights[i]}`).join('＋')}＝${raw}。ここに補正係数${factor / 100}を掛けるので${answer}となる。0個の行も表にあるが，その寄与は0である。`,
  };
}, 'IPA2015秋問52とIPA2011秋問52の5行・値・択を照合。例題の数値と名称を自作表にし、規格本文・図・重みマトリクスは使用しない。非ゼロは3行以内、数値択は昇順を維持。');

const staffCases = [
  { staff: 10, speed: 500, days: 30, elapsed: 10, done: 30_000, options: [2, 7, 10, 20] },
  { staff: 8, speed: 500, days: 30, elapsed: 10, done: 24_000, options: [2, 3, 8, 16] },
  { staff: 12, speed: 500, days: 25, elapsed: 10, done: 48_000, options: [2, 5, 13, 17] },
  { staff: 10, speed: 500, days: 30, elapsed: 10, done: 40_000, options: [1, 3, 4, 14] },
] as const;
const staffing = finite(53, '実績から見直す最少追加要員', 'ウ', '計画人数・期間・実績', staffCases.length, candidate => {
  const { staff, speed, days, elapsed, done, options } = staffCases[candidate];
  const remaining = staff * speed * days - done;
  const remainingDays = days - elapsed;
  const actual = done / (staff * elapsed);
  const need = Math.ceil(remaining / (actual * remainingDays)) - staff;
  return {
    prompt: [p(`${staff}人が${speed / 1000}kステップ／人日の生産性で作業するとき，${days}日間を要するプログラミング作業がある。${elapsed}日目が終了した時点で作業が終了したステップ数は，${staff}人の合計で${done / 1000}kステップであった。予定の${days}日間でプログラミングを完了するためには，少なくとも何名の要員を追加すればよいか。ここで，追加する要員の生産性は，現在の要員と同じとする。`)],
    choices: strings(options.map(String)), correctIndex: options.findIndex(option => option === need),
    explanation: `予定の総量は${staff * speed * days / 1000}kステップ，残りは${remaining / 1000}kステップ。実績の生産性は${done / 1000}÷(${staff}×${elapsed})＝${actual / 1000}kステップ／人日。残り${remainingDays}日では一人が${actual * remainingDays / 1000}kステップを担当できる。必要な全人数を切り上げて${staff + need}人，ここから現在の${staff}人を引くと追加は${need}人。`,
  };
}, '計画と実績を両方提示し，現在要員と追加要員の生産性が同じ前提を保持。全人数と追加人数を区別し，端数がある場合は最少の整数に切り上げる。');

const definitions = [
  ...legacy2015AutumnAm2753Knowledge, normalization, aggregate, transfer, ipv4, signature, filtering, branch, criticalPath, functionPoints, staffing,
];
export function legacy2015AutumnAm2753Definitions(): GenerationDefinition[] {
  return [...definitions].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
}
