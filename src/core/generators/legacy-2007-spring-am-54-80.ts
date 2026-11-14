import { DataError } from '../errors';
import { code, field, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { spring2007Am5480Source as source } from './legacy-2007-spring-am-54-80-source';
import { spring2007Am5480Knowledge as knowledge } from './legacy-2007-spring-am-54-80-knowledge';
import { routeNode, spring2007Am5480Figure as draw, spring2007AmRoutes, spring2007AmSchemas } from './legacy-2007-spring-am-54-80-figures';

const num = (value: number) => value.toLocaleString('en-US');
const kana = 'アイウエ';
function unique(valid: boolean[]) {
  const index = valid.indexOf(true);
  if (index < 0 || index !== valid.lastIndexOf(true)) throw new DataError('ANSWER_REF', '2007年度春期旧午前の正答を一意に確定できません');
  return index;
}
const errors = [[600_000, 2400], [480_000, 1600], [720_000, 3600], [960_000, 4800]];
function lineError(index: number): GeneratedBody {
  const [denominator, rate] = errors[index];
  const seconds = denominator / rate;
  const choices = index === 0 ? [...source[55].choices] : [seconds, rate, denominator / 30, denominator].map(num);
  return { prompt: [p(source[55].prompt.replace('600,000', num(denominator)).replace('2,400', num(rate)))],
    choices: strings(choices), correctIndex: unique(choices.map(option => num(seconds) === option)),
    explanation: '平均で' + num(denominator) + 'ビットを送るごとに1ビットの誤りが生じる。毎秒' + num(rate) +
      'ビットを送るので，' + num(denominator) + '÷' + num(rate) + '＝' + seconds + '秒となる。' };
}

const records = [
  { prefix: 'S', names: ['A','A','B','C','C'], suppliers: ['XX0001','YY0002','YY0002','ZZ0003','XX0001'], prices: [18000,20000,35000,40000,38000], nameForDuplicate: 'C' },
  { prefix: 'P', names: ['青','赤','赤','赤','青'], suppliers: ['AA0001','CC0003','BB0002','AA0001','CC0003'], prices: [21000,17000,19000,45000,36000], nameForDuplicate: '赤' },
  { prefix: 'V', names: ['手帳','封筒','用紙','手帳','用紙'], suppliers: ['BB0002','AA0001','CC0003','CC0003','AA0001'], prices: [11000,24000,17000,35000,31000], nameForDuplicate: '用紙' },
  { prefix: 'T', names: ['黒','黒','白','白','赤'], suppliers: ['AA0001','BB0002','BB0002','CC0003','AA0001'], prices: [24000,28000,33000,37000,41000], nameForDuplicate: '黒' },
];
function modify(index: number): GeneratedBody {
  const { prefix, names, suppliers, prices, nameForDuplicate } = records[index];
  const id = (n: number) => "'" + prefix + '00' + n + "'";
  const change = (attribute: string, value: string, key: string, filter: string) =>
    'UPDATE 商品 SET ' + attribute + ' = ' + value + ' WHERE ' + key + ' = ' + filter;
  const invalidExisting = change('商品番号', id(1), '商品番号', id(2));
  const invalidSame = change('商品番号', id(6), '商品名', "'" + nameForDuplicate + "'");
  const invalidNull = change('商品番号', 'NULL', '商品番号', id(2));
  const valid = change('商品名', "'D'", '商品番号', id(3));
  const options = [invalidExisting, invalidSame, invalidNull, valid];
  const order = [[0,1,2,3],[3,1,2,0],[0,3,2,1],[0,1,3,2]][index];
  return { prompt: [p(source[61].prompt), code('CREATE TABLE 商品\n  (商品番号 CHAR(4),商品名 CHAR(20),仕入先番号 CHAR(6),単価 INT,\n   PRIMARY KEY(商品番号))', 'sql'),
    table('商品', ['商品番号','商品名','仕入先番号','単価'], names.map((name, i) =>
      [prefix + '00' + (i + 1), name, suppliers[i], num(prices[i])]))],
    choices: order.map(i => [code(options[i], 'sql')]), correctIndex: order.indexOf(3),
    explanation: '既存の商品番号を設定すると重複し，複数の行に同じ新番号を設定しても一意性に違反する。主キーにはNULLを設定できない。商品番号' + prefix +
      '003の行の商品名だけを変更する文なら，主キーを保ったまま更新できる。' };
}

function orderTables(index: number): GeneratedBody {
  const { story, dependency: [first, next, last] } = spring2007AmSchemas(index);
  const choices = [
    [last, first, next], [first, next, last], [next, last, first], [next, first, last],
  ];
  const order = [[0,1,2,3],[1,0,2,3],[0,2,1,3],[0,3,2,1]][index];
  const common = '新規にデータを入力する場合は，参照される表のデータが先に存在している必要がある。各表へのデータの入力順序として，適切なものはどれか。ここで，各表の下線部の項目は，主キー又は外部キーである。';
  return { prompt: [p(index === 0 ? source[63].prompt : story + common), draw(63, index, '三つの表の項目と下線')],
    choices: strings(order.map(i => choices[i].join('→'))), correctIndex: order.indexOf(1),
    explanation: next + 'は' + first + 'の番号を参照し，' + last + 'は' + next + 'を複合キーで参照する。したがって，参照される' +
      first + '，' + next + '，' + last + 'の順で登録する。' };
}

function authenticate(index: number): GeneratedBody {
  const direction = [['Y','X'],['X','Y'],['Y','X'],['X','Y']][index];
  const [requester, responder] = direction;
  const a = '（1）' + requester + 'は，任意の情報を含む文字列（チャレンジ）を' + responder + 'へ送信する。';
  const b = '（2）' + responder + 'は，あらかじめX，Y間で定めた規則に基づき，受け取った文字列から新たな文字列（レスポンス）を生成し，' + requester + 'へ返送する。';
  const c = '（3）' + requester + 'は，返送されてきた文字列（レスポンス）が正しいことを確認する。';
  const detail = ['', 'チャレンジにはその回専用の乱数を含め，各回で異なるものを用いる。',
    'レスポンスは，参加者だけが知る共有鍵を使ってチャレンジから生成し，その検査に用いる。チャレンジの受信側では検査を行わない。',
    '検査する側は，期待したレスポンスと一致した場合だけ成功とする。応答した側では検査を行わない。'][index];
  return { prompt: [p(source[65].prompt + detail), p('〔手順〕\n' + [a,b,c].join('\n'))],
    choices: strings([...source[65].choices]), correctIndex: requester === 'Y' ? 2 : 0,
    explanation: 'チャレンジを送った' + requester + 'が，返されたレスポンスを検査し，規則に沿って生成できた' + responder +
      'を認証する。逆方向は，対になる別の検証を行った場合に成立する。' };
}

const machines = [
  { annual: 1_000_000, rate: 5, loss: 10, years: 5, offers: [[3.5,80],[1.5,160]] },
  { annual: 800_000, rate: 6, loss: 20, years: 5, offers: [[4,130],[3,260]] },
  { annual: 600_000, rate: 5, loss: 15, years: 5, offers: [[3,70],[2,115]] },
  { annual: 800_000, rate: 6, loss: 25, years: 5, offers: [[4,200],[3,300]] },
];
function costs(index: number): GeneratedBody {
  const { annual, rate, loss, years, offers } = machines[index];
  const changes = offers.map(([after, price]) => Math.round((rate - after) * annual * loss * years / 100) - price * 10_000);
  const [a, b] = changes;
  return { prompt: [p(source[72].prompt.replace('1,000,000', num(annual)).replace('不良率は5％', '不良率は' + rate + '％')
    .replace('損失額は10円', '損失額は' + loss + '円').replace('5年間', years + '年間')),
    table('機器の導入条件', ['機器','導入後の期待不良率','導入金額'], offers.map(([after, price], i) => ['機器' + 'AB'[i], after + '％', price + '万円']))],
    choices: strings([...source[72].choices]), correctIndex: unique([a > 0 && b < 0, a < 0 && b > 0, a > 0 && b > 0, a === 0 && b === 0]),
    explanation: '各機器について，不良率の低下で減る損失を年生産量と使用年数から求め，導入費用を差し引く。導入しないときからの削減額は，Aが' +
      num(a) + '円，Bが' + num(b) + '円になる。負の値は費用の増加である。' };
}

const tradeRows = [
  [[1,1500,1400],[2,900,1000],[3,800,1000],[4,700,500],[5,500,200]],
  [[2,1100,1000],[3,900,1100],[4,800,600],[5,750,650],[6,600,700]],
  [[3,1500,1300],[2,1300,1200],[5,900,1100],[4,700,620],[6,600,700]],
  [[1,1500,1300],[3,900,1000],[4,800,900],[5,600,500],[6,400,250]],
];
function lostSales(index: number): GeneratedBody {
  const rows = tradeRows[index];
  const loss = rows.map(([profit, demand, available]) => profit * Math.max(demand - available, 0));
  const total = loss.reduce((sum, item) => sum + item, 0);
  const ordered = loss.filter(Boolean).sort((a, b) => a - b);
  const options = index === 0 ? [...source[73].choices] :
    [ordered[1], ordered[2], ordered[0] + ordered[2], total].sort((a, b) => a - b).map(num);
  return { prompt: [p(source[73].prompt), table('商品別の利益・需要数・仕入数', ['商品','商品1個当たり利益（千円）','需要数（個）','仕入数（個）'],
    rows.map((row, i) => ['ABCDE'[i], ...row.map(num)]))],
    choices: strings(options), correctIndex: unique(options.map(option => option === num(total))),
    explanation: '失った利益は，需要数が仕入数を上回る商品で，その差に1個当たりの利益を掛けた額である。A〜Eの順で' +
      loss.map(num).join('，') + '千円となり，合計は' + num(total) + '千円である。' };
}

const stocks = [
  { sizes: [40,100], annual: 400, unit: 5, order: 2, storage: 1, discount: 10 },
  { sizes: [60,120], annual: 600, unit: 4, order: 3, storage: 3, discount: 10 },
  { sizes: [50,150], annual: 750, unit: 4, order: 2, storage: 1, discount: 20 },
  { sizes: [60,100], annual: 300, unit: 3, order: 2, storage: 5, discount: 10 },
];
function inventory(index: number): GeneratedBody {
  const { sizes: [low, high], annual, unit, order, storage, discount } = stocks[index];
  const purchase = (quantity: number) => annual * unit - (quantity >= high ? annual * unit * discount / 100 : 0);
  const charges = (quantity: number) => annual / quantity * order;
  const storing = (quantity: number) => quantity / 2 * storage;
  const total = (quantity: number) => purchase(quantity) + charges(quantity) + storing(quantity);
  const difference = total(low) - total(high);
  const withoutCharges = purchase(low) + storing(low) - purchase(high) - storing(high);
  const [first, second] = index === 0 ? [182, 152] : [Math.abs(difference), Math.abs(withoutCharges)].sort((a,b) => b-a);
  const choices = [first,second].map(value => value + '万円安い').concat([second,first].map(value => value + '万円高い'));
  return { prompt: [p(source[77].prompt.replace('40個', low + '個').replace('100個', high + '個')),
    table('年間費用の条件', ['項目','条件'], [['年間発注量', num(annual) + '個'], ['1個当たりの仕入額', unit + '万円'],
      ['1回当たりの発注費', order + '万円'], ['1個当たりの年間保管費用', storage + '万円'],
      ['大口発注割引（1回の発注量' + high + '個以上）','仕入額の' + discount + '％']])],
    choices: strings(choices), correctIndex: unique(choices.map(choice => choice === Math.abs(difference) + '万円' + (difference < 0 ? '安い' : '高い'))),
    explanation: '年間発注回数は年間量÷1回の数量，平均在庫は1回の数量÷2となる。仕入額は' + high + '個の場合だけ割引する。' +
      '年間合計は' + low + '個の場合が' + num(total(low)) + '万円，' + high + '個の場合が' + num(total(high)) +
      '万円で，前者が' + Math.abs(difference) + '万円' + (difference < 0 ? '安い。' : '高い。') };
}

function route(index: number): GeneratedBody {
  const arcs = spring2007AmRoutes(index);
  const distances = Array<number>(10).fill(Infinity);
  const paths = [[0], ...Array.from({ length: 9 }, () => [] as number[])];
  distances[0] = 0;
  for (const { from, to, cost } of arcs) if (distances[from] + cost < distances[to]) {
    distances[to] = distances[from] + cost;
    paths[to] = [...paths[from], to];
  }
  const minimum = distances[9];
  const choices = index === 0 ? [...source[78].choices] : [
    [0], [19,20,22,23], [17,18,21,23], [17,18,21,22],
  ][index].map(String);
  return { prompt: [p(source[78].prompt), draw(78, index, '出発地から目的地までの経路と区間運賃')],
    choices: strings(choices), correctIndex: unique(choices.map(choice => Number(choice) === minimum)),
    explanation: '各中継地に到達する最安額は，各到着元までの最安額にその区間運賃を足したものの最小値である。最安経路は' +
      paths[9].map(routeNode).join('→') + 'で，総運賃は' + minimum + 'である。' };
}

const structured: Readonly<Record<number, { notes: string; build(index: number): GeneratedBody }>> = {
  55: { notes: '分母とビット毎秒を変更し，秒の整数を選ぶ。値は昇順。', build: lineError },
  61: { notes: '同じ5行・4列・SQLの構成。値と主キー重複を発生させる商品名を可変にする。', build: modify },
  63: { notes: '3表の下線付きキーと参照順を維持し，複合キーで中間の親を識別する対象を変える。', build: orderTables },
  65: { notes: '3手順と認証の方向を選ぶ4択。送付方向とチャレンジ・検証の条件を明示し，単方向認証と相互認証を混同しない。', build: authenticate },
  72: { notes: '年生産量・単位損失・使用期間と2機器の導入表を保持。差の符号を独立に判定する。', build: costs },
  73: { notes: '5商品の表・千円の整数選択肢・区別される不足を保持し，需給と単利を変更する。', build: lostSales },
  77: { notes: '在庫が等速で減る発注法と条件表を保持し，数量・費用・割引を連動させる。', build: inventory },
  78: { notes: '同じ10地点・20有向区間を維持し，運賃を差し替える。独立全経路探索で選択肢を判定する。', build: route },
};

export const legacy2007SpringAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const model = structured[Number(number)], reviewed = knowledge[Number(number)];
  return {
    source: '2007h19h-fe-am-' + number, title: original.title, sourceAnswer: original.key,
    version: '3.7.0', fields: [field('問いの対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (model?.notes ?? '原問の判定形式・正答と四択を維持し，対象と条件を変える。'),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2007年度春期旧午前の入力が範囲外です');
      if (model) return model.build(index);
      const selected = index === 0 ? { ...original, correctIndex: kana.indexOf(original.key), explanation: reviewed.explanation } :
        reviewed.variants[index - 1];
      return { prompt: [p(selected.prompt)], choices: strings([...selected.choices]), correctIndex: selected.correctIndex, explanation: selected.explanation };
    },
  };
});
