import { DataError } from '../errors';
import { code, field, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { autumn2005Am5480Drawing as draw, autumn2005AmRoute, autumn2005AmScatter } from './legacy-2005-autumn-am-54-80-figures';
import { autumn2005Am5480Knowledge as knowledge } from './legacy-2005-autumn-am-54-80-knowledge';
import { autumn2005Am5480Source as source } from './legacy-2005-autumn-am-54-80-source';

const formatNumber = (value: number) => value.toLocaleString('en-US');
function onlyIndex(truth: readonly boolean[]) {
  const answer = truth.indexOf(true);
  if (answer < 0 || answer !== truth.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2005年度秋期旧午前の正答を一意に確定できません');
  return answer;
}

function routePacket(index: number): GeneratedBody {
  const { start, branches, destination } = autumn2005AmRoute(index);
  const route = `ルータ${destination}だけに中継する。`;
  const choices = [
    `すべてのパケットを，ルータ${branches[0]}とルータ${branches[1]}の両方に中継する。`,
    'パケットのあて先端末のIPアドレスとMACアドレスに基づいて，' + route,
    'パケットのあて先端末のIPアドレスに基づいて，' + route,
    'パケットのあて先端末のMACアドレスに基づいて，' + route,
  ];
  return {
    prompt: [p(`図のように，3台のIPルータが専用線で接続されている。端末${start}から端末${destination}あてのTCP/IPのパケットに対するルータ${start}の動作として，適切なものはどれか。`),
      draw('57-network', index, '専用線で接続されたIPルータと端末')],
    choices: strings(choices), correctIndex: 2,
    explanation: `ルータ${start}はIPヘッダの宛先アドレスから，ルータ${destination}へ延びる経路を選ぶ。あて先端末のMACアドレスはその端末が接続されたLAN内で用いるので，他のネットワークからの経路選択には使わない。`,
  };
}

const productCases = [
  { minimum: 40000, price: [150000, 200000, 140000], cost: [100000, 170000, 80000], updates: [130000, 90000, 150000, 130000] },
  { minimum: 35000, price: [139000, 112000, 100000], cost: [100000, 80000, 62000], updates: [96000, 64000, 76000, 137000] },
  { minimum: 45000, price: [167000, 132000, 144000], cost: [110000, 91000, 94000], updates: [143000, 100000, 85000, 160000] },
  { minimum: 38000, price: [123000, 132000, 139000], cost: [80000, 96000, 96000], updates: [138000, 100000, 93000, 115000] },
];

function viewRows(index: number): GeneratedBody {
  const { minimum, price, cost, updates } = productCases[index];
  const models = ['T2003', 'S2003', 'R2003'];
  const rendering = models.map((model, i) => [
    ['S001', 'S003', 'S005'][i], 'パソコン' + model[0], model, formatNumber(price[i]), formatNumber(cost[i]),
  ]);
  const attributes = [
    { product: 2, column: '売値' }, { product: 2, column: '仕入値' },
    { product: 1, column: '仕入値' }, { product: 0, column: '売値' },
  ];
  const margins = price.map((n, i) => n - cost[i]);
  const choices = attributes.map(({ product, column }, i) => `型式が${models[product]}の${column}を${formatNumber(updates[i])}に更新する。`);
  const after = attributes.map(({ product, column }, i) => column === '売値' ? updates[i] - cost[product] : price[product] - updates[i]);
  const answer = onlyIndex(attributes.map(({product}, i) => margins[product] >= minimum && after[i] < minimum));
  const model = models[attributes[answer].product];
  return {
    prompt: [p(source[61].prompt), table('商品', ['商品コード', '品名', '型式', '売値', '仕入値'], rendering),
      p('〔ビュー定義〕'), code(`CREATE VIEW 収益商品\n  AS SELECT * FROM 商品\n  WHERE 売値 - 仕入値 >= ${minimum}`, 'sql')],
    choices: strings(choices), correctIndex: answer,
    explanation: `売値から仕入値を引いた額が${formatNumber(minimum)}円以上の商品だけがビューに現れる。` +
      `${model}は更新前に${formatNumber(margins[attributes[answer].product])}円，更新後に${formatNumber(after[answer])}円となるので対象から外れる。ほかの更新では，すでに表示されている行は減らない。`,
  };
}

const joinCases = [
  { target: '新宿', addresses: ['新宿', '新宿', '渋谷', '渋谷'], homes: ['新宿', '渋谷', '渋谷', '新宿'], names: ['合田知子', '青木俊介', '川内聡', '坂口祐子'] },
  { target: '千代田', addresses: ['千代田', '杉並', '杉並', '杉並'], homes: ['杉並', '千代田', '杉並', '千代田'], names: ['星野葵', '岡田諒', '松本優', '青山翠'] },
  { target: '台東', addresses: ['台東', '世田谷', '世田谷', '台東'], homes: ['世田谷', '台東', '台東', '世田谷'], names: ['東野蓮', '三浦結', '浅田晶', '西山美月'] },
  { target: '品川', addresses: ['品川', '品川', '目黒', '品川'], homes: ['品川', '目黒', '品川', '目黒'], names: ['岸本夏希', '森山輝', '竹中凛', '中田澪'] },
];

function joinStudents(index: number): GeneratedBody {
  const { target, addresses, homes, names } = joinCases[index];
  const departments = ['理', '工', '人文', '経済'];
  const choices = [[0], [0, 1], [0, 3], [0, 1, 3]];
  const eligible = names.filter((_, i) => addresses[i] === target);
  const answer = onlyIndex(choices.map(indices => indices.length === eligible.length && indices.every((n, i) => names[n] === eligible[i])));
  return {
    prompt: [p(source[62].prompt), code(`SELECT 氏名 FROM 学生,学部\n  WHERE 所属 = 学部名 AND 学部.住所 = '${target}'`, 'sql'),
      table('学生', ['氏名', '所属', '住所'], names.map((name, i) => [name, departments[i], homes[i]])),
      table('学部', ['学部名', '住所'], departments.map((department, i) => [department, addresses[i]]))],
    choices: choices.map(indices => [table('検索結果', ['氏名'], indices.map(n => [names[n]]))]), correctIndex: answer,
    explanation: `学生の所属に一致する学部を結合し，学部の住所が${target}の行だけを取り出す。学生本人の住所は絞込み条件でない。` +
      '該当する学生は' + eligible.join('と') + 'である。',
  };
}

function scatterStudy(index: number): GeneratedBody {
  const points = autumn2005AmScatter(index), count = points.length;
  const xs = points.reduce((sum, [x]) => sum + x, 0), ys = points.reduce((sum, [,y]) => sum + y, 0);
  const score = points.reduce((sum, [x,y]) => sum + (count*x - xs)*(count*y - ys), 0);
  const sign = score > 0 ? '正' : '負';
  return {
    prompt: [p(source[77].prompt), draw('77-scatter', index, '製造上の要因xと品質特性yの散布図')],
    choices: strings([...source[77].choices]), correctIndex: onlyIndex([false, false, score > 0, score < 0]),
    explanation: `xが増加する側でyが${score > 0 ? '増加' : '減少'}する傾向にある。二つの平均からの差の積を合計した符号も${sign}なので，相関係数は${sign}である。` +
      'この傾向を読むのに二次回帰は不要で，xからyを推定する式と逆向きの式は一般に一致しない。',
  };
}

const productPlans = [
  { hours: 200, profit: [1800, 2500, 3000], minutes: [6, 10, 15], demand: [1000, 900, 500] },
  { hours: 180, profit: [1500, 2300, 2400], minutes: [5, 10, 12], demand: [1000, 700, 500] },
  { hours: 190, profit: [1900, 1550, 1300], minutes: [10, 5, 8], demand: [1050, 600, 1100] },
  { hours: 225, profit: [1500, 1900, 2800], minutes: [5, 10, 8], demand: [900, 900, 1000] },
];
const wrongOrders = [
  [[2, 1, 0], [0, 2, 1], [1, 0, 2]], [[2, 1, 0], [0, 2, 1], [1, 0, 2]],
  [[2, 0, 1], [0, 2, 1], [0, 1, 2]], [[0, 1, 2], [1, 2, 0], [2, 1, 0]],
];

function planProfit(index: number): GeneratedBody {
  const { hours, profit, minutes, demand } = productPlans[index];
  const names = ['製品X', '製品Y', '製品Z'];
  const fill = (order: number[]) => {
    let remaining = hours * 60;
    const quantities = [0, 0, 0];
    for (const product of order) {
      quantities[product] = Math.min(demand[product], Math.floor(remaining / minutes[product]));
      remaining -= quantities[product] * minutes[product];
    }
    return { quantities, remaining, value: quantities.reduce((sum, count, i) => sum + count * profit[i], 0) };
  };
  const byRate = [0, 1, 2].sort((a, b) => profit[b] * minutes[a] - profit[a] * minutes[b]);
  const best = fill(byRate);
  if (best.remaining !== 0) throw new DataError('PARAMETER_CONSTRAINT', '生産時間を整数個の製品に割り当てられません');
  const options = [...wrongOrders[index].map(order => fill(order).value), best.value].sort((a, b) => a - b);
  return {
    prompt: [p(source[79].prompt.replace('200時間', hours + '時間')), table('製造条件', ['項目', ...names], [
      ['1個当たりの利益（円）', ...profit.map(formatNumber)], ['1個当たりの組立て所要時間（分）', ...minutes.map(String)],
      ['月間需要量上限（個）', ...demand.map(formatNumber)],
    ])],
    choices: strings(options.map(formatNumber)), correctIndex: onlyIndex(options.map(value => value === best.value)),
    explanation: '利益を組立て時間で割った値の高い順は' + byRate.map(i => names[i]).join('，') + 'である。' +
      '比率の高い製品から需要上限まで時間を使うと，製品数を実数として許した場合の上限が得られる。' +
      'この条件ではその割当てを整数個で実現でき，' + names.map((name, i) => name + 'を' + formatNumber(best.quantities[i]) + '個').join('，') +
      '作って時間を使い切る。最大利益は' + formatNumber(best.value) + '円である。',
  };
}

const special: Readonly<Record<number, (index: number) => GeneratedBody>> = {
  57: routePacket, 61: viewRows, 62: joinStudents, 77: scatterStudy, 79: planProfit,
};
const notes: Readonly<Record<number, string>> = {
  57: '接続先のルータと送受信端末を変える。経路を判断するアドレスの種類が問いの核なので選択肢の役割を固定する。',
  61: '価格，費用と閾値を可変にする。更新を別々に実行し，閾値と等しい行も含めてSQLで全肢照合。',
  62: '所在地と学生の住所を異なる位置で可変にする。SQLを実行して各結果表を行順に依存せず照合する。',
  65: '物理LAN，無線接続，仮想網，USBメモリで実際の隔離対象を変える。安全な初動を同じ位置に保持する。',
  66: '本人による変更，新規発行，再設定，異動時の失効で適切な管理措置を変える。',
  67: 'リアルタイム観察，監視ポート，ファイル移送，限定採取の情報管理を変える。',
  68: '経済産業省公表の役割別要求事項を参照し，組織，責任者，利用者の立場又は責任者の目標を変える。',
  69: 'ISO 9001及びJISの名称と原題の運用上の判断を保持し，正誤の場面を変える。規格本文は配布しない。',
  77: '数値を使う散布図の点群を変え，読取りの形式・変数の意味・二つの回帰式の選択肢の役割を維持する。',
  79: '実現可能性と需要上限を保つ。利益，時間，需要量を可変にして数字の桁数と昇順を維持する。',
  80: '日本の四つの産業財産権は一定。元と同じ四権利の組合せを問うため，解答と混同し得る候補集合を本文で変える。',
};

export const legacy2005AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([key, question]) => {
  const number = Number(key);
  const build = special[number] ?? knowledge[number];
  return {
    source: `2005h17a-fe-am-${number}`, title: question.title, sourceAnswer: question.key,
    version: '3.7.0', fields: [field('対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' ' + (notes[number] ?? '原問に関連する対象又は判断条件を可変にする。'),
    ...([57, 65, 66, 67, 79, 80].includes(number) ? { answerVariation: 'fixed' as const } : {}),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2005年度秋期旧午前の入力が範囲外です');
      return build(index);
    },
  };
});
