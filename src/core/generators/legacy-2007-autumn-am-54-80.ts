import { DataError } from '../errors';
import { code, field, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { autumn2007Am5480Knowledge as knowledge } from './legacy-2007-autumn-am-54-80-knowledge';
import { autumn2007Am5480Source as source } from './legacy-2007-autumn-am-54-80-source';

const kana = 'アイウエ';
const commas = (value: number) => value.toLocaleString('en-US');
function unique(options: boolean[]) {
  const correct = options.indexOf(true);
  if (correct < 0 || correct !== options.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2007年度秋期旧午前の正答を一意に確定できません');
  return correct;
}

const rates = [[8, 64_000], [12, 60_000], [10, 80_000], [16, 64_000]];
const rounded = (value: number) => String(Math.round(value * 10) / 10);
function pcm(index: number): GeneratedBody {
  const [bits, perSecond] = rates[index];
  const bitUsec = 1_000_000 / perSecond;
  const sampleUsec = bits * bitUsec;
  const options = index === 0 ? [...source[56].choices] : [
    rounded(bitUsec), rounded(3 * bitUsec), String(sampleUsec), rounded(sampleUsec * 1.024),
  ];
  const prompt = source[56].prompt.replace('8ビット', bits + 'ビット').replace('64,000', commas(perSecond));
  return {
    prompt: [p(prompt)], choices: strings(options), correctIndex: unique(options.map(option => Number(option) === sampleUsec)),
    explanation: '1標本は' + bits + 'ビットなので，1秒当たりの標本数は' + commas(perSecond) + '÷' + bits + '＝' +
      commas(perSecond / bits) + 'である。1秒は1,000,000マイクロ秒なので，1標本当たりは' + sampleUsec + 'マイクロ秒となる。',
  };
}

const mountains = [
  ['富士山', '本州'], ['樽前山', '北海道'], ['槍ヶ岳', '本州'], ['八ヶ岳', '本州'], ['石鎚山', '四国'],
  ['阿蘇山', '九州'], ['那須岳', '本州'], ['久住山', '九州'], ['大雪山', '北海道'],
];
const relationCases = [
  { region: '本州', removeNames: false, swapped: false },
  { region: '北海道', removeNames: true, swapped: true },
  { region: '九州', removeNames: true, swapped: false },
  { region: '四国', removeNames: false, swapped: true },
];
function relations(index: number): GeneratedBody {
  const { region, removeNames, swapped } = relationCases[index];
  const headings = ['山岳名称', '地域'];
  const column = removeNames ? 1 : 0;
  const selected = mountains.filter(([, location]) => location === region);
  const projected = Array.from(new Set(mountains.map(row => row[column]))).map(value => [value]);
  const outputs = [{ headers: headings, rows: selected }, { headers: [headings[column]], rows: projected }];
  if (swapped) outputs.reverse();
  const operations = swapped ? ['射影', '選択'] : ['選択', '射影'];
  const choices = [...source[59].choices];
  return {
    prompt: [p(source[59].prompt), table('表a', headings, mountains),
      table('表b', outputs[0].headers, outputs[0].rows), table('表c', outputs[1].headers, outputs[1].rows)],
    choices: choices.map(option => {
      const [, b, c] = /^表b：(.+)　表c：(.+)$/.exec(option)!;
      return [table('操作の組合せ', ['表b', '表c'], [[b, c]])];
    }),
    correctIndex: unique(choices.map(option => option === '表b：' + operations[0] + '　表c：' + operations[1])),
    explanation: '地域が' + region + 'の行だけを残すのは選択で，列の構成は変わらない。山岳名称と地域のうち' +
      headings[column] + 'だけを残すのは射影で，同じ結果行は一つにまとめる。これらを表b，表cそれぞれに当てはめる。',
  };
}

const shops = [
  { limit: 40_000, values: [[150_000, 100_000], [200_000, 170_000], [140_000, 80_000]], revised: [130_000, 150_000, 130_000, 90_000] },
  { limit: 50_000, values: [[170_000, 100_000], [180_000, 120_000], [150_000, 90_000]], revised: [165_000, 140_000, 145_000, 100_000] },
  { limit: 45_000, values: [[160_000, 105_000], [140_000, 120_000], [166_000, 110_000]], revised: [155_000, 85_000, 145_000, 108_000] },
  { limit: 60_000, values: [[160_000, 100_000], [230_000, 185_000], [170_000, 100_000]], revised: [172_000, 161_000, 166_000, 120_000] },
];
function sqlView(index: number): GeneratedBody {
  const { limit, values, revised } = shops[index];
  const ids = ['S001', 'S003', 'S005'];
  const products = ['T', 'S', 'R'];
  const updates = [[0, 0], [1, 1], [2, 0], [2, 1]];
  const deltas = updates.map(([row, column], i) => {
    const previous = values[row][0] - values[row][1];
    const next = column === 0 ? revised[i] - values[row][1] : values[row][0] - revised[i];
    return Number(next >= limit) - Number(previous >= limit);
  });
  const correctIndex = unique(deltas.map(change => change < 0));
  const [row, column] = updates[correctIndex];
  const nextMargin = column === 0 ? revised[correctIndex] - values[row][1] : values[row][0] - revised[correctIndex];
  return {
    prompt: [p(source[61].prompt), table('商品', ['商品コード', '品名', '型式', '売値', '仕入値'], values.map(([price, cost], i) =>
      [ids[i], products[i], products[i] + '2003', commas(price), commas(cost)])), p('〔ビュー定義〕'),
      code('CREATE VIEW 収益商品\n     AS SELECT * FROM 商品\n        WHERE 売値 - 仕入値 >= ' + limit, 'sql')],
    choices: strings(updates.map(([row, column], i) => '商品コードが' + ids[row] + 'の行の' +
      (column === 0 ? '売値' : '仕入値') + 'を' + commas(revised[i]) + 'に更新する。')),
    correctIndex,
    explanation: '更新前に売値から仕入値を引いた金額が' + commas(limit) + '以上の行が，更新後に基準を下回る場合に行数が減る。' +
      ids[row] + 'の差は' + commas(values[row][0] - values[row][1]) + 'から' + commas(nextMargin) + 'になり，その行がビューから外れる。',
  };
}

const incomeLabels = ['売上総損益', '営業損益', '経常損益', '税引前当期純損益'];
const incomeSelections = [1, 0, 2, 3];
function income(index: number): GeneratedBody {
  const correctIndex = incomeSelections[index];
  const progress = [
    '売上高から売上原価を差し引くと売上総損益が分かる。',
    '売上総損益から販売費及び一般管理費を引くと営業損益が分かる。',
    '営業損益に営業外収益から営業外費用を差し引いた営業外損益を加えると経常損益が分かる。',
    '経常損益に特別利益から特別損失を差し引いた特別損益を加えると税引前当期純損益が分かる。',
  ];
  return {
    prompt: [p(incomeLabels[correctIndex] + 'の計算式はどれか。')],
    choices: strings([...source[72].choices]), correctIndex, explanation: progress.slice(0, correctIndex + 1).join(''),
  };
}

const profitCases = [
  { sale: 14, quantity: 500, plans: [[1500, 9], [2500, 7]] },
  { sale: 15, quantity: 450, plans: [[1800, 9], [2850, 7]] },
  { sale: 12, quantity: 500, plans: [[1450, 9], [2300, 7]] },
  { sale: 16, quantity: 600, plans: [[2000, 10], [3200, 8]] },
];
function profit(index: number): GeneratedBody {
  const { sale, quantity, plans } = profitCases[index];
  const [a, b] = plans.map(([fixed, unit]) => (sale - unit) * quantity - fixed);
  const correctIndex = unique([a <= 0 && b <= 0, a === b, a > b, b > a]);
  const choices = [...source[73].choices];
  return {
    prompt: [p(source[73].prompt.replace('14万円', sale + '万円').replace('500個', quantity + '個')),
      table('案別の固定費と変動費', ['案', '月当たり固定費', '変動費単価'], plans.map(([fixed, unit], i) =>
        ['AB'[i], commas(fixed) + '万円', unit + '万円／個']))],
    choices: strings(choices), correctIndex,
    explanation: '販売単価から変動費単価を差し引き，月間数量を掛けてから月の固定費を引く。A案の利益は' +
      commas(a) + '万円，B案は' + commas(b) + '万円になる。' + choices[correctIndex],
  };
}

const regressions = [[0.8, 1.1, 10], [0.7, 1.2, 8], [0.9, 0.9, -5], [0.75, 1, -12]];
function trend(index: number): GeneratedBody {
  const [correlation, slope, intercept] = regressions[index];
  const type = slope >= 1 && intercept > 0 ? '得点しやすい' : '得点しにくい';
  const choices = index === 0 ? [...source[76].choices] : [
    '回帰直線のy切片の値から，今年度の問題の得点が0点の人でも，昨年度の問題では' + Math.abs(intercept) + '点程度とれることが分かる。',
    '回帰直線の傾きから，今年度の問題の平均点は，昨年度の問題の平均点の' + slope + '倍であることが分かる。',
    '回帰直線の傾きとy切片の値から，今年度の問題は昨年度の問題に比べて' + type + '傾向にあることが分かる。',
    source[76].choices[3],
  ];
  return {
    prompt: [p(source[76].prompt), p('〔結果〕\n相関係数は，' + correlation + 'であった。\n回帰直線の傾きは，' + slope +
      'であった。\n回帰直線のy切片の値は，' + intercept + 'であった。')],
    choices: strings(choices), correctIndex: 2,
    explanation: '得点は0以上である。回帰直線の推定値は昨年度の得点×' + slope + (intercept < 0 ? '−' : '＋') + Math.abs(intercept) +
      'なので，今年度の方が' + type + '傾向を示す。切片はx＝0のときのyの推定値であり，相関や回帰の係数だけでは問題の質は評価できない。',
  };
}

const scores = [
  [[2, 5, 7], [4, 3, 8], [5, 6, 6]],
  [[3, 6, 8], [5, 4, 9], [6, 7, 7]],
  [[5, 8, 9], [4, 5, 7], [7, 6, 8]],
  [[8, 4, 7], [5, 8, 9], [10, 7, 6]],
];
function assignment(index: number): GeneratedBody {
  const grid = scores[index];
  const combinations = [...'ABC'].flatMap((_, first) =>
    [...'ABC'].flatMap((_, second) => second === first ? [] : [[first, second, 3 - first - second]]));
  const totals = combinations.map(order => order.reduce((sum, column, row) => sum + grid[row][column], 0));
  const maximum = Math.max(...totals);
  const winners = combinations.filter((_, i) => totals[i] === maximum);
  const selections = [...new Set(totals)].sort((a, b) => b - a);
  const reuse = grid[0].map((_, column) => Math.max(...grid.map(row => row[column]))).reduce((a, b) => a + b, 0);
  const choices = index === 0 ? [...source[77].choices] : [reuse, ...selections.slice(0, 3)].sort((a, b) => a - b).map(String);
  return {
    prompt: [p(source[77].prompt.replace('2百万円である', grid[0][0] + '百万円である')),
      table('単位 百万円', ['顧客＼営業担当者', 'A', 'B', 'C'], grid.map((row, i) => ['xyz'[i], ...row.map(String)]))],
    choices: strings(choices), correctIndex: unique(choices.map(option => Number(option) === maximum)),
    explanation: '顧客x，y，zのそれぞれに異なる営業担当者を割り当てて売上高を合計する。最大の場合の担当者は順に' +
      winners[0].map(person => 'ABC'[person]).join('，') + 'で，売上高は' + maximum + '百万円となる。',
  };
}

const replenishmentCases = [
  { historical: false, currentStock: true, safety: 'forecast', percent: 10, answer: 0 },
  { historical: false, currentStock: false, safety: 'forecast', percent: 20, answer: 1 },
  { historical: false, currentStock: true, safety: 'current', percent: 15, answer: 2 },
  { historical: true, currentStock: true, safety: 'current', percent: 5, answer: 3 },
];
function replenishment(index: number): GeneratedBody {
  const { historical, currentStock, safety, percent, answer } = replenishmentCases[index];
  const ratio = percent / 100;
  const currentAverage = '(C[n−1]＋C[n])／2';
  const lastAverage = '(C[n−2]＋C[n−1])／2';
  const stock = currentStock ? '現在の在庫量' : '先週末の在庫量';
  const forecast = historical ? '先々週の販売量と先週の販売量' : '先週の販売量と今週の販売量';
  const base = safety === 'forecast' ? '翌週の販売予測量' : '今週の販売量';
  const choices = [currentAverage + '×' + (1 + ratio) + '−B[n]',
    currentAverage + '×' + (1 + ratio) + '−B[n−1]', currentAverage + '＋C[n]×' + ratio + '−B[n]',
    lastAverage + '＋C[n]×' + ratio + '−B[n]'];
  return {
    prompt: [p(source[78].prompt),
      p('〔在庫補充量の算定方式〕\n（1）週末ごとに在庫補充量を算出し，発注を行う。在庫は翌週の月曜日に補充される。\n' +
        '（2）在庫補充量は，翌週の販売予測量から' + stock + 'を引き，安全在庫量を加えて算出する。\n' +
        '（3）翌週の販売予測量は，' + forecast + 'の平均値とする。\n' +
        '（4）安全在庫量は，' + base + 'の' + percent + '％とする。')],
    choices: strings(choices), correctIndex: answer,
    explanation: '翌週の予測は' + forecast + 'の平均で，安全在庫は' + base + 'に' + percent +
      '％を掛ける。予測に安全在庫を足し，' + stock + 'を差し引くと，' + choices[answer] + 'になる。',
  };
}

const structured: Readonly<Record<number, { notes: string; build(index: number): GeneratedBody }>> = {
  56: { notes: 'ビット数と転送速度を連動させ，圧縮なしの標本間隔を整数マイクロ秒で求める。選択肢は昇順。', build: pcm },
  59: { notes: '三つの関係表と対応の選択表を保持。選ぶ行，射影する列，二つの出力位置を変え，行と列の効果を識別する。', build: relations },
  61: { notes: '同じ商品表，三商品，三種の差の比較，SQLビュー，四更新を保つ。更新前後の売値・仕入値と境界を変える。', build: sqlView },
  72: { notes: '原選択肢の利益計算の段階・式・順序を維持し，求める損益の段階を変える。', build: income },
  73: { notes: '二つの製造案を月当たり・万円・個で比べる。単価，月数量，固定費と変動費を変える。損失と大小の条件が重ならないよう，少なくとも一方に利益が出る範囲とする。', build: profit },
  76: { notes: '二年度の得点，相関，傾き，切片を保ち，y=xより上または下になる傾向を確認する。平均点の倍率や質の決め付けは含めない。', build: trend },
  77: { notes: '3顧客・3人，一人一顧客，表と百万円を保持する。増減する組合せの候補値と担当制約を無視した誤答を昇順で示す。', build: assignment },
  78: { notes: '週末発注，月曜補充，nの下限，予測と安全在庫の算定式を維持。差し引く時点，平均の週，安全在庫の率と基礎を変える。', build: replenishment },
};

export const legacy2007AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const model = structured[Number(number)];
  const reviewed = knowledge[Number(number)];
  return {
    source: '2007h19a-fe-am-' + number, title: original.title, sourceAnswer: original.key,
    version: '3.7.0', fields: [field('問いの対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (model?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2007年度秋期旧午前の入力が範囲外です');
      if (model) return model.build(index);
      const selected = index === 0
        ? { ...original, correctIndex: kana.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return { prompt: [p(selected.prompt)], choices: strings([...selected.choices]),
        correctIndex: selected.correctIndex, explanation: selected.explanation };
    },
  };
});
