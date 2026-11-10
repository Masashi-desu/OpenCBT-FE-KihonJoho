import { code, figure, p, strings, table } from './definition';
import { finite2012AutumnAm2753 as finite, grouped, original } from './legacy-2012-autumn-am-27-53-shared';
import {
  autumn2012Am2753Profiles as profiles, autumn2012Cryptogram, autumn2012CryptogramAlt,
  autumn2012ProjectAlt, autumn2012ProjectCases, autumn2012ProjectDurations, autumn2012ProjectEdges,
} from './legacy-2012-autumn-am-27-53-figures';

const namingRules = [
  ['(1) データ項目名の末尾には必ず“名”，“コード”，“数”，“金額”，“年月日”などの区分語を付与し，区分語ごとに定めたデータ型にする。',
   '(2) データ項目名と意味を登録した辞書を作成し，異音同義語や同音異義語が発生しないようにする。'],
  ['(1) データ項目名の末尾には必ず“名”，“コード”，“数”，“金額”，“年月日”などの区分語を付与し，金額の許容範囲を全表で統一する。',
   '(2) データ項目名と意味を登録した辞書を作成し，異音同義語や同音異義語が発生しないようにする。'],
  ['(1) データ項目名の末尾には必ず“名”，“コード”，“数”，“金額”，“年月日”などの区分語を付与し，区分語ごとに定めたデータ型にする。',
   '(2) データ項目名と許容範囲を登録した辞書を作成し，同一項目の金額の許容範囲は全表で統一する。'],
  ['(1) データ項目名とデータ型を辞書へ登録し，同一項目のデータ型と金額の許容範囲は全表で統一する。',
   '(2) データ項目名と意味を登録した辞書を作成し，異音同義語や同音異義語が発生しないようにする。'],
] as const;
const namingConclusions = [
  '型や名前が統一されても，金額の取り得る値の範囲が表ごとに異なることは防げない。区分語が示すデータ型と，その型の中で許される値の範囲は別の制約である。',
  '金額の範囲と名称は規定されるが，区分語ごとのデータ型は規定されない。“受信年月日”に日付型と文字列型が混在し得る。',
  '同じ意味に対して別の名前を使うことは禁止されていない。“賞与金額”と“ボーナス金額”のような異音同義語を防ぐには，名前と意味を結び付ける規則が必要になる。',
  'データ型や意味が辞書で管理されても，名前だけから項目種別を判別できるとは限らない。末尾の区分語が必須でないので，“取引先”という名前だけではコードか名称か区別できない。',
] as const;

export const namingConvention = finite(28, '型・値域・辞書・区分語を規定する二つの規約', namingRules.length,
  '命名規約の二項と「回避できない」の否定方向を維持する。型・値域・同義語・区分語のうち一つだけを規約から外し，同じ四つの問題を査読する。', index => {
    return { prompt: [p(original(28).prompt), p('〔命名規約〕\n' + namingRules[index].join('\n'))],
      choices: strings(original(28).choices), correctIndex: [1, 0, 2, 3][index], explanation: namingConclusions[index] };
  });

type Product = [id: string, name: string, model: string, sell: number, cost: number];
type PriceUpdate = [row: number, column: '売値' | '仕入値', price: number];
const products = (t: [number, number], s: [number, number], r: [number, number]): Product[] => [
  ['S001', 'T', 'T2003', ...t], ['S003', 'S', 'S2003', ...s], ['S005', 'R', 'R2003', ...r],
];
const priceUpdates = (a: number, b: number, c: number, d: number): PriceUpdate[] => [
  [0, '売値', a], [1, '仕入値', b], [2, '売値', c], [2, '仕入値', d],
];
const views = [
  { threshold: 40000, rows: products([150000, 100000], [200000, 170000], [140000, 80000]), updates: priceUpdates(130000, 150000, 130000, 90000) },
  { threshold: 50000, rows: products([150000, 100000], [200000, 170000], [140000, 80000]), updates: priceUpdates(160000, 140000, 125000, 85000) },
  { threshold: 50000, rows: products([160000, 100000], [200000, 150000], [145000, 80000]), updates: priceUpdates(151000, 170000, 140000, 95000) },
  { threshold: 60000, rows: products([180000, 100000], [220000, 180000], [150000, 80000]), updates: priceUpdates(165000, 150000, 145000, 95000) },
];

export const updateView = finite(29, '商品表の売値と仕入値・SQLの収益下限・更新値', views.length,
  '3行5列とCREATE VIEW，売値−仕入値の境界を含む条件式，一件更新による減少判定を保持する。元と同程度の5〜6桁整数で各候補を比較する。', index => {
    const { threshold, rows, updates } = views[index];
    const count = (items: Product[]) => items.filter(([, , , sell, cost]) => sell - cost >= threshold).length;
    const before = count(rows);
    const after = updates.map(([row, column, price]) => count(rows.map((item, position) => {
      if (position !== row) return item;
      const updated: Product = [...item];
      updated[column === '売値' ? 3 : 4] = price;
      return updated;
    })));
    const correctIndex = after.findIndex(value => value < before);
    const [row, column, price] = updates[correctIndex];
    const [, , , sell, cost] = rows[row];
    const afterDifference = column === '売値' ? price - cost : sell - price;
    return {
      prompt: [p(original(29).prompt),
        table('商品', ['商品コード', '品名', '型式', '売値', '仕入値'],
          rows.map(([id, name, model, sellPrice, costPrice]) => [id, name, model, grouped(sellPrice), grouped(costPrice)])),
        p('〔ビュー定義〕'), code('CREATE VIEW 収益商品\n    AS SELECT * FROM 商品\n      WHERE 売値 - 仕入値 >= ' + threshold, 'sql')],
      choices: strings(updates.map(([item, key, value]) => '商品コードが' + rows[item][0] + 'の' + key + 'を' + grouped(value) + 'に更新する。')),
      correctIndex,
      explanation: 'ビューは売値−仕入値が' + grouped(threshold) + '以上の行を選び，同値も含む。' + rows[row][0] +
        'の差額は' + grouped(sell - cost) + 'から' + grouped(afterDifference) + 'になり，下限を下回る。更新前は' +
        before + '行，ア〜エをそれぞれ実行した直後は順に' + after.join('，') + '行である。SQLはStructured Query Languageの略。',
    };
  });

type KeyOperation = { target: '注文' | '顧客'; action: '追加' | '削除'; values: [string, string] };
const customers = [['C005', '福島'], ['D010', '千葉'], ['K001', '長野'], ['L035', '宮崎']];
const orderCases = [
  { orderKeys: ['C005', 'K001', 'C005', 'D010'], remove: 3, addFirst: 'D010', addSecond: 'F020' },
  { orderKeys: ['C005', 'K001', 'C005', 'L035'], remove: 3, addFirst: 'D010', addSecond: 'K001' },
  { orderKeys: ['D010', 'K001', 'D010', 'C005'], remove: 3, addFirst: 'H020', addSecond: 'L035' },
  { orderKeys: ['D010', 'K001', 'C005', 'L035'], remove: 0, addFirst: 'K001', addSecond: 'D010' },
];
const orderColumns = ['伝票番号', '顧客番号'];
const customerColumns = ['顧客番号', '顧客名'];

export const foreignKey = finite(31, '注文の参照先・削除する顧客・追加する注文', orderCases.length,
  '注文表と顧客表，外部キーの方向，元の列順に従う行の削除・追加を保つ。伝票番号は4桁で，判定に必要な参照先を表内の値で確定する。', index => {
    const { orderKeys, remove, addFirst, addSecond } = orderCases[index];
    const customer = customers[remove];
    const operations: KeyOperation[] = [
      { target: '顧客', action: '削除', values: [customer[0], customer[1]] },
      { target: '注文', action: '追加', values: ['0005', addFirst] },
      { target: '注文', action: '追加', values: ['0006', addSecond] },
      { target: '注文', action: '削除', values: ['0002', orderKeys[1]] },
    ];
    const customerIds = new Set(customers.map(([id]) => id));
    const invalid = operations.map(({ target, action, values }) => target === '顧客'
      ? orderKeys.includes(values[0]) : action === '追加' && !customerIds.has(values[1]));
    const correctIndex = invalid.indexOf(true);
    const selected = operations[correctIndex];
    const explanation = selected.target === '顧客'
      ? '注文に顧客番号' + selected.values[0] + 'を参照する行が残るので，参照先の顧客を削除すると外部キーの整合性を失う。'
      : '顧客表に' + selected.values[1] + 'がないため，その顧客番号を持つ注文は参照先を持てない。';
    return {
      prompt: [p(original(31).prompt),
        table('注文', orderColumns, orderKeys.map((id, i) => ['000' + (i + 1), id])),
        table('顧客', customerColumns, customers)],
      choices: operations.map(({ target, action, values }) => [
        p('“' + target + '”表' + (action === '削除' ? 'の行' : 'に行')),
        table('操作する行', target === '顧客' ? customerColumns : orderColumns, [values]),
        p('を' + action + 'する。'),
      ]),
      correctIndex, explanation: explanation + '注文の行だけを削除しても参照先の顧客は残る。顧客行の削除と注文行の追加は，操作後に参照先が残るかで区別する。',
    };
  });

const lineCases = [
  { rate: 64000, bytes: 1000, interval: 2, overhead: 20 },
  { rate: 80000, bytes: 2000, interval: 2, overhead: 10 },
  { rate: 48000, bytes: 1500, interval: 2, overhead: 20 },
  { rate: 80000, bytes: 1600, interval: 2, overhead: 25 },
];

export const lineUse = finite(32, '回線速度・ファイルのバイト数・制御情報率', lineCases.length,
  '元のビット／秒・バイト・秒・％を保ち，正答は小数第1位以内で厳密に求められる組だけを使う。誤答はバイトのまま，制御情報抜き，秒数を掛ける誤り。原問の小数1桁と数値昇順を保持。', index => {
    const { rate, bytes, interval, overhead } = lineCases[index];
    const bits = bytes * 8;
    const total = bits * (100 + overhead) / 100;
    const capacity = rate * interval;
    const correct = total * 100 / capacity;
    // 選択肢の0.1％刻み。負値はなく，ちょうど中間なら大きい側へ表示する。
    const percent = (numerator: number, denominator: number) =>
      (Math.floor((2 * numerator * 1000 + denominator) / (2 * denominator)) / 10).toFixed(1);
    return {
      prompt: [p(index === 0 ? original(32).prompt : '通信速度' + grouped(rate) +
        'ビット／秒の専用線で接続された端末間で，平均' + grouped(bytes) + 'バイトのファイルを，' + interval +
        '秒ごとに転送するときの回線利用率は何％か。ここで，ファイル転送に伴い，転送量の' + overhead + '％の制御情報が付加されるものとする。')],
      choices: strings([percent(total / 8, capacity), percent(bits, capacity), percent(total, capacity), percent(total * interval, rate)]),
      correctIndex: 2,
      explanation: grouped(bytes) + 'バイトを' + grouped(bits) + 'ビットに換算し，制御情報' + overhead +
        '％を加えると' + grouped(total) + 'ビットになる。' + interval + '秒間に送れる' + grouped(capacity) +
        'ビットに対する割合は' + grouped(total) + '÷' + grouped(capacity) + '×100＝' + correct.toFixed(1) +
        '％。秒当たりの回線速度と1回分の転送量を比べるには，時間の単位をそろえる。',
    };
  });

const networks = [
  { lastMask: 240, prefix: '192.168.1.', addresses: [14, 17, 29, 33, 49] },
  { lastMask: 224, prefix: '192.168.4.', addresses: [2, 22, 33, 65, 97] },
  { lastMask: 248, prefix: '192.168.8.', addresses: [6, 9, 17, 21, 25] },
  { lastMask: 192, prefix: '192.168.12.', addresses: [62, 65, 129, 193, 225] },
];

export const subnet = finite(36, 'IPv4サブネットマスクとアドレス候補', networks.length,
  '同一ネットワークを問うIPv4の対を4組，原と同じ隣接する候補順で提示する。ホスト部4〜6ビット又は3ビットの小規模な刻みで，ネットワーク・ブロードキャストアドレスはホスト候補にしない。', index => {
    const { lastMask, prefix, addresses } = networks[index];
    const ids = addresses.map(address => address & lastMask);
    const pairs = addresses.slice(0, -1).map((address, i) => prefix + address + ' と ' + prefix + addresses[i + 1]);
    return {
      prompt: [p(index === 0 ? original(36).prompt : '2台のPCにIPv4アドレスを割り振りたい。サブネットマスクが255.255.255.' +
        lastMask + 'のとき，両PCのIPv4アドレスが同一ネットワークに所属する組合せはどれか。')],
      choices: strings(pairs), correctIndex: ids.findIndex((id, i) => id === ids[i + 1]),
      explanation: 'IPv4（Internet Protocol version 4）ではアドレスとサブネットマスクのビットごとの論理積を取る。先頭3オクテットは共通で，第4オクテットは' +
        (256 - lastMask) + '個ずつの区間に分かれる。左から順にアドレスのネットワーク部は' + ids.join('，') +
        'となる。対の両方が同じネットワーク番号になる組を選ぶ。PCはPersonal Computerの略。',
    };
  });

export const publicKey = finite(38, '送信者・受信者と秘密に送る平文', 4,
  '送信元での鍵Kによる暗号化，ネットワーク，受信側の秘密鍵による復号と四つの鍵候補を保つ。受信者の変更を本文・図・鍵候補・解説に反映。', index => {
    const { sender, recipient } = autumn2012Cryptogram([index]);
    return {
      prompt: [p(index === 0 ? original(38).prompt : '公開鍵暗号方式を用いて，図のように' + sender + 'さんから' + recipient +
        'さんへ，他人に秘密にしておきたい文章を送るとき，暗号化に用いる鍵Kとして，適切なものはどれか。'),
      figure(profiles.cryptogram, [index], '公開鍵暗号方式による送信', autumn2012CryptogramAlt([index]))],
      choices: strings([sender + 'さんの公開鍵', sender + 'さんの秘密鍵', recipient + 'さんの公開鍵', '共通の秘密鍵']),
      correctIndex: 2,
      explanation: '秘密に送りたい相手である' + recipient + 'さんの公開鍵で暗号化する。対応する秘密鍵は' + recipient +
        'さんが保有し，それを使って復号する。' + sender + 'さん自身の鍵を使うと受信者だけが復号できるという条件を満たせない。',
    };
  });

const permissions = ['読取り', '書込み', '実行'];
const rightNames = (rights: readonly number[]) => rights.map(right => permissions[right]).join('と');
const permissionCases = [
  { missingBit: 4, missingRight: 2, options: [[2, [0, 2]], [4, [2]], [5, [1]], [6, [0, 1]]] },
  { missingBit: 2, missingRight: 0, options: [[1, [0, 2]], [2, [0]], [3, [1]], [6, [1, 2]]] },
  { missingBit: 1, missingRight: 1, options: [[1, [1]], [2, [0, 1]], [5, [0]], [6, [1, 2]]] },
  { missingBit: 4, missingRight: 1, options: [[1, [1]], [2, [0, 2]], [4, [1]], [6, [0, 2]]] },
] as const;

export const bitPermissions = finite(42, '三つの権限を持つOSの中間試行の値と結果', permissionCases.length,
  '0・一部許可・7の3試行と，昇順の8進数候補を保つ。未確定な二つの許可ビットの対応を決め打ちしない。試行で唯一確定する権限に合う記述を正答とする。', index => {
    const { missingBit, missingRight, options } = permissionCases[index];
    const active = permissions.filter((_, i) => i !== missingRight).join('と');
    const missing = permissions[missingRight];
    return {
      prompt: [p(original(42).prompt),
        p('〔試行結果〕\n① 0を設定したら，読取り，書込み，実行ができなくなってしまった。\n② ' +
          (7 - missingBit) + 'を設定したら，' + active + 'はできたが，' + missing +
          'ができなかった。\n③ 7を設定したら，読取り，書込み，実行ができるようになった。')],
      choices: strings(options.map(([value, rights]) => value + 'を設定すると，' + rightNames(rights) +
        (rights.length === 1 ? 'だけ' : '') + 'ができる。')),
      correctIndex: options.findIndex(([value, rights]) => value === missingBit && rights.length === 1 && rights[0] === missingRight),
      explanation: (7 - missingBit) + 'は' + (7 - missingBit).toString(2).padStart(3, '0') + '，7は111なので，' +
        missingBit + 'に対応するビットだけを立てると' + missing + 'だけが許可される。他の二つのビットの個別対応はこの試行だけでは区別できない。OSはOperating Systemの略。',
    };
  });

const shortenOptions = [['A', 'C', 'E'], ['A', 'D'], ['B', 'C', 'E'], ['B', 'D']];
export const shorten = finite(52, '作業A〜Fの所要日数', autumn2012ProjectCases.length,
  '5節点・6作業・凡例・作業A〜Eの各1日と全体2日の短縮条件・4組の順番を保つ。数日単位の整数で前後の最長経路を比較し，全体を2日短縮できる候補は一つ。', index => {
    const durations = autumn2012ProjectDurations([index]);
    const finish = (reduced: readonly string[]) => {
      const earliest = [0, 0, 0, 0, 0];
      for (const node of [0, 1, 2, 3]) {
        for (const [edge, { label, from, to }] of autumn2012ProjectEdges.entries()) {
          if (from !== node) continue;
          const end = earliest[from] + durations[edge] - (reduced.includes(label) ? 1 : 0);
          earliest[to] = Math.max(earliest[to], end);
        }
      }
      return earliest[4];
    };
    const baseline = finish([]);
    const reductions = shortenOptions.map(reduced => baseline - finish(reduced));
    return {
      prompt: [p(original(52).prompt), figure(profiles.project, [index], '作業のアローダイアグラム', autumn2012ProjectAlt([index]))],
      choices: strings(shortenOptions.map(letters => letters.join(', '))), correctIndex: reductions.indexOf(2),
      explanation: '開始から終了までの最長経路の所要日数が，全体期間になる。元の期間は' + baseline +
        '日。各候補の作業を1日ずつ短縮して再計算すると，ア〜エによる短縮日数は順に' + reductions.join('，') +
        '日となる。元の最長経路だけを短縮しても，別の経路が全体期間を決めることがある。',
    };
  });

const efforts = [
  { points: 500, productivity: 10, installation: 10, management: 10 },
  { points: 600, productivity: 10, installation: 20, management: 10 },
  { points: 720, productivity: 12, installation: 10, management: 20 },
  { points: 640, productivity: 16, installation: 20, management: 10 },
];

export const functionPointEffort = finite(53, 'ファンクションポイント・生産性・導入教育・管理率', efforts.length,
  '元と同じ3桁の規模・2桁の生産性で割り切れる組を使用し，人月・管理率の単位と，導入・教育の加算と管理率の基礎を保つ。誤答は導入教育を計上しない，管理を計上しない，管理を開発だけに掛ける。', index => {
    const { points, productivity, installation, management } = efforts[index];
    const development = points / productivity;
    const subtotal = development + installation;
    const overhead = subtotal * management / 100;
    const total = subtotal + overhead;
    return {
      prompt: [p(index === 0 ? original(53).prompt : 'ある新規システムの開発規模を見積もったところ，' + points +
        'ファンクションポイント（FP）であった。このシステムを構築するプロジェクトには，開発工数のほかにシステムの導入や開発者教育の工数が' +
        installation + '人月必要である。また，プロジェクト管理に，開発と導入・教育を合わせた工数の' + management +
        '％を要する。このプロジェクトに要する全工数は何人月か。ここで，開発の生産性は1人月当たり' + productivity + 'FPとする。')],
      choices: strings([development + installation * management / 100, subtotal, subtotal + development * management / 100, total].map(String)),
      correctIndex: 3,
      explanation: 'FPはFunction Pointの略で，ここでは開発規模を表す。開発は' + points + '÷' + productivity + '＝' +
        development + '人月。導入・教育を加えると' + subtotal + '人月になり，この' + management + '％である' +
        overhead + '人月が管理工数になる。全工数は' + subtotal + '＋' + overhead + '＝' + total + '人月。',
    };
  });
