import { DataError } from '../errors';
import {
  code, field, figure, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition,
} from './definition';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import {
  customerDataFigure, fifoFigure, fifoTransactions, firewallFigure, firewallServices, invoiceChoiceFigures,
  invoiceInputFigure,
} from './legacy-2008-autumn-am-54-80-figures';
import { autumn2008Am5480Knowledge as knowledge } from './legacy-2008-autumn-am-54-80-knowledge';
import { autumn2008Am5480Source as source } from './legacy-2008-autumn-am-54-80-source';

const numberText = (number: number) => number.toLocaleString('en-US');
function uniqueAnswer(options: readonly string[], answer: string) {
  const position = options.indexOf(answer);
  if (position < 0 || position !== options.lastIndexOf(answer))
    throw new DataError('ANSWER_REF', '2008年度秋期旧午前の正答を一意に確定できません');
  return position;
}
function visual(definition: BookletFigureDefinition, index: number, caption: string) {
  return figure(definition.profile, [index], caption, definition.alt([index]));
}

function normalization(index: number): GeneratedBody {
  const condition = [
    '',
    '伝票番号から日付と顧客コードが，顧客コードから顧客名と住所が決まる。単価は商品コードごとに決まり，単位と数量は伝票番号と商品コードの組合せごとに決まる。',
    '伝票番号から日付と顧客コードが，顧客コードから顧客名と住所が決まる。単位は商品コードごとに決まり，数量と単価は伝票番号と商品コードの組合せごとに決まる。',
    '伝票番号から日付，顧客コード，配送先住所が決まる。顧客名は顧客コードごとに，単位と単価は商品コードごとに，数量は伝票番号と商品コードの組合せごとに決まる。',
  ][index];
  const prompt = index === 0 ? source[57].prompt :
    '次のような繰返し構造をもったデータを，第3正規形に正規化したものはどれか。ここで，下線部分は主キーを表す。また，' + condition;
  const update = [
    '単位と単価は商品コードだけで決まるので商品表に置き，数量は伝票番号と商品コードの組合せで決まるので明細表に置く。',
    '商品コードだけで決まる単価を商品表に置く。単位と数量は伝票ごとの明細で決まるので明細表に置く。',
    '商品コードだけで決まる単位を商品表に置く。単価と数量は伝票ごとの明細で決まるので明細表に置く。',
    '伝票ごとに異なる配送先住所は伝票表に置く。商品コードだけで決まる単位と単価は商品表に置き，数量は明細表に置く。',
  ][index];
  return {
    prompt: [p(prompt), visual(invoiceInputFigure, index, '繰返しのある伝票データ')],
    choices: invoiceChoiceFigures.map((definition, position) => [visual(definition, index, '選択肢' + 'アイウエ'[position] + 'の関係')]),
    correctIndex: [1, 0, 2, 3][index],
    explanation: '伝票の日付は伝票番号だけで決まるので，伝票表に置く。顧客名' +
      (index === 3 ? '' : 'と住所') + 'は顧客コードをキーとする顧客表へ分け，伝票表での推移的な従属を除く。' + update,
  };
}

function aggregate(index: number): GeneratedBody {
  const choices = [...source[58].choices!];
  if (index !== 0) choices[2] = '販売代理店ごとの購入者の総数（同じ購入者は1人と数える）';
  const explanation = [
    '日別販売データには日付があるが，購入データに日付がない。販売数量が同じでも購入者の人数は異なり得るので，日別の購入者数を復元できない。商品別の日別数量と，顧客データを結合した性別・年齢別集計は可能である。',
    '売場別販売データにも購入データにも日付がない。したがって，商品の販売数量を日別に比較できない。購入データには顧客と代理店があるので人数を数えられ，顧客表を結合すれば性別や生年月日を使える。',
    '顧客データに性別がないので，購入データを結合しても性別ごとの売れ筋商品は求められない。日別販売数量・代理店ごとの購入者の人数・生年月日から求める年齢分布は集計できる。',
    '顧客データに生年月日や年齢がないので，代理店ごとの購入者の年齢分布は求められない。商品別の日別数量，性別ごとの売れ筋，代理店ごとの購入者の人数は集計できる。',
  ][index];
  return { prompt: [p(source[58].prompt), visual(customerDataFigure, index, '三つの表の項目')],
    choices: strings(choices), correctIndex: [2, 0, 1, 3][index], explanation };
}

const staff = [
  ['1001', '山本 一平', '23', 'S01'], ['1002', '中谷 宏', '25', 'S01'],
  ['1003', '鈴木 隆夫', '23', 'S02'], ['1004', '佐藤 俊二', '26', 'S01'],
  ['1005', '山崎 ひとみ', '23', 'S02'], ['1006', '田中 五郎', '25', 'S02'],
  ['1107', '山本 明', '32', 'S01'], ['1110', '田中 和夫', '30', 'S02'],
];
const departments = [['S01', 'システム1部', '1107'], ['S02', 'システム2部', '1110']];
function sql(index: number): GeneratedBody {
  const age = 23 + index;
  const maximum = age + 2;
  const manager = index === 2 ? '1110' : '1107';
  const workers = staff.map(([id, name, years, department]) => [
    id, name, String(Number(years) + index + (index === 3 && id === '1003' ? 1 : 0)), department,
  ]);
  const rows = workers.flatMap(([id, name, years, code]) => {
    if (index === 1 ? Number(years) < age || Number(years) > maximum : Number(years) !== age) return [];
    return departments.filter(([dept, , lead]) => (index === 3 || dept === code) && (index !== 2 || lead === manager))
      .map(([, deptName]) => [id, name, deptName]);
  });
  const conditions = [
    'BU_CODE = S_SHOZOKU AND S_NENREI = ' + age,
    'BU_CODE = S_SHOZOKU AND S_NENREI BETWEEN ' + age + ' AND ' + maximum,
    "BU_CODE = S_SHOZOKU AND BU_CHO = '" + manager + "' AND S_NENREI = " + age,
    'S_NENREI = ' + age,
  ];
  const why = [
    '所属コードと部コードを一致させると各社員が所属する部に結合される。年齢を' + age + '歳に限定するとA表の3人が残る。',
    'A表には年齢が' + age + '歳と' + maximum + '歳の社員が含まれる。所属コードと部コードを結合し，BETWEENで両端を含む年齢範囲を選ぶ。',
    '所属コードと部コードを結合し，部長コードが' + manager + 'の部のうち' + age + '歳の社員を抽出するとA表と一致する。',
    'A表では同じ社員番号が二つの部名で現れる。部と社員の結合条件がなく，年齢を' + age + '歳に絞った社員と全ての部を直積にした結果である。',
  ][index];
  return {
    prompt: [p(source[59].prompt), code('SELECT S_CODE, S_NAME, BU_NAME\n   FROM BUSHO, SHAIN\n   WHERE ［a］', 'sql'),
      table('BUSHO', ['BU_CODE', 'BU_NAME', 'BU_CHO'], departments),
      table('SHAIN', ['S_CODE', 'S_NAME', 'S_NENREI', 'S_SHOZOKU'], workers),
      table('A表', ['S_CODE', 'S_NAME', 'BU_NAME'], rows)],
    choices: strings(conditions), correctIndex: index, explanation: why,
  };
}

function firewall(index: number): GeneratedBody {
  const { service, protocol, explanation } = firewallServices[index];
  const choices = source[66].choices!;
  return {
    prompt: [p(source[66].prompt.replace('Webページの閲覧だけを社外に提供する', service)),
      visual(firewallFigure, index, 'ファイアウォールで分離されたネットワーク')],
    choices: strings([...choices]), correctIndex: uniqueAnswer(choices, protocol), explanation,
  };
}

const incidentActions = [
  'サーバ，IDS（Intrusion Detection System），ファイアウォールの各ログを解析し，不正アクセス手法，影響範囲，侵入経路を特定する。',
  'システムを再構築し，最新のパッチやセキュリティ設定情報を適用する。',
  'サーバをネットワークから切り離す。',
  'ネットワークに接続後，しばらく監視する。',
];
function incident(index: number): GeneratedBody {
  const introductions = [
    source[67].prompt,
    'ファイルサーバが外部から侵入され，共有ファイルの暗号化が進んでいる。その後の対応の順序のうち，適切なものはどれか。',
    '外部の者が盗んだ管理者の認証情報で公開サーバに侵入し，設定を改ざんした。その後の対応の順序のうち，適切なものはどれか。',
    '公開DNSサーバが外部から侵入され，外部向けの名前解決結果が改ざんされた。その後の対応の順序のうち，適切なものはどれか。',
  ];
  const sequences = [
    [0, 1, 2, 3], [2, 0, 3, 1], [0, 2, 1, 3], [1, 2, 3, 0],
  ][index];
  const actions = incidentActions.slice();
  if (index === 1) actions[2] = 'ファイルサーバをネットワークから切り離し，暗号化の被害が広がらないようにする。';
  if (index === 2) actions[1] = 'システムを再構築し，盗まれた認証情報を失効させて新しい認証情報を設定する。';
  if (index === 3) actions[1] = 'DNSサーバを再構築し，正しいゾーンデータを復元して侵入対策を施す。';
  const marks = '①②③④';
  const orders = [
    [0, 1, 2, 3], [0, 2, 1, 3], [1, 2, 0, 3], [2, 0, 1, 3],
  ];
  const choices = orders.map(order => order.map(action => marks[sequences.indexOf(action)]).join('→'));
  if (index !== 0) [choices[index - 1], choices[3]] = [choices[3], choices[index - 1]];
  const answer = [2, 0, 1, 3].map(action => marks[sequences.indexOf(action)]).join('→');
  return { prompt: [p(introductions[index]), table('インシデント発生後に行う作業', ['番号', '対応'], sequences.map((action, row) => [marks[row], actions[action]]))],
    choices: strings(choices), correctIndex: uniqueAnswer(choices, answer),
    explanation: answer + 'の順に行う。サーバを切り離して被害拡大を防ぎ，ログなどで原因と影響範囲を調べる。調査結果を基に再構築と対策を行った後，再接続して監視する。' };
}

function inventory(index: number): GeneratedBody {
  const stock: { quantity: number; price: number }[] = [];
  for (const { quantity, price } of fifoTransactions(index)) {
    if (price !== undefined) {
      stock.push({ quantity, price });
      continue;
    }
    let outstanding = quantity;
    while (outstanding > 0) {
      const lot = stock[0];
      const issued = Math.min(outstanding, lot.quantity);
      lot.quantity -= issued;
      outstanding -= issued;
      if (lot.quantity === 0) stock.shift();
    }
  }
  const value = stock.reduce((sum, { quantity, price }) => sum + quantity * price, 0);
  const options = [
    [3300, 3400, 3600, 3900],
    [2700, 3000, 3100, 3600],
    [3200, 3300, 3900, 4200],
    [3300, 3900, 4000, 4200],
  ][index].map(numberText);
  return {
    prompt: [p(source[72].prompt), visual(fifoFigure, index, '商品Aの月間受払記録')],
    choices: strings(options), correctIndex: uniqueAnswer(options, numberText(value)),
    explanation: '払出しのたびに古いロットから減らす。月末に残るのは' +
      stock.map(({ quantity, price }) => quantity + '個（単価' + price + '円）').join('と') +
      'なので，' + stock.map(({ quantity, price }) => quantity + '×' + price).join('＋') + '＝' + numberText(value) + '円である。',
  };
}

const productCounts = [
  [182, 136, 120, 98, 91, 83, 70, 60, 35],
  [185, 140, 130, 102, 92, 79, 69, 57, 31],
  [180, 145, 125, 110, 95, 85, 66, 58, 36],
  [190, 150, 120, 100, 95, 80, 75, 65, 40],
];
function abc(index: number): GeneratedBody {
  const threshold = [70, 50, 60, 78][index];
  const counts = productCounts[index];
  const total = counts.reduce((sum, count) => sum + count, 0);
  let selected = 0;
  let cumulative = 0;
  for (const count of counts) {
    cumulative += count;
    selected++;
    if (100 * cumulative >= total * threshold) break;
  }
  const choices = source[73].choices!;
  return {
    prompt: [p(source[73].prompt.replace('70％', threshold + '％')),
      table('製品別の不良品の個数', ['製品', ...'PQRSTUVWX', '合計'], [['個数', ...counts.map(String), String(total)]])],
    choices: strings([...choices]), correctIndex: uniqueAnswer(choices, String(selected)),
    explanation: '不良品の個数の多い順に足す。上位' + (selected - 1) + '種類で' + (cumulative - counts[selected - 1]) +
      '個，上位' + selected + '種類で' + cumulative + '個である。全' + total + '個の' + threshold + '％以上になる最少の種類数は' + selected + 'である。',
  };
}

function tour(index: number): GeneratedBody {
  const [ab, ac, ad, bc, bd, cd] = [
    [20, 35, 40, 50, 25, 30], [25, 45, 15, 20, 55, 30],
    [15, 30, 25, 45, 20, 40], [25, 20, 45, 20, 30, 35],
  ][index];
  const costs = [ab + bc + cd + ad, ab + bd + cd + ac, ac + bc + bd + ad];
  const shortest = Math.min(...costs);
  const choices = index === 0 ? [...source[76].choices!] :
    [shortest - Math.min(ab, ac, ad), ...costs].sort((a, b) => a - b).map(String);
  const companies = ['A社', 'B社', 'C社', 'D社'];
  return {
    prompt: [p(source[76].prompt), table('各社間の所要時間（単位 分）', ['From＼To', ...companies], [
      [companies[0], '－', String(ab), String(ac), String(ad)],
      [companies[1], String(ab), '－', String(bc), String(bd)],
      [companies[2], String(ac), String(bc), '－', String(cd)],
      [companies[3], String(ad), String(bd), String(cd), '－'],
    ])],
    choices: strings(choices), correctIndex: uniqueAnswer(choices, String(shortest)),
    explanation: '逆回りの所要時間は同じなので，三通りを比較する。A→B→C→D→Aは' + costs[0] +
      '分，A→B→D→C→Aは' + costs[1] + '分，A→C→B→D→Aは' + costs[2] + '分。最短は' + shortest + '分である。',
  };
}

function production(index: number): GeneratedBody {
  const [hours, profitM, profitN] = [[200, 2500, 3000], [180, 3000, 3500], [210, 3000, 3500], [240, 2500, 3000]][index];
  const minutes = hours * 60;
  const corners = [[minutes / 30, 0], [0, minutes / 30], [minutes / 40, minutes / 60]];
  const totals = corners.map(([m, n]) => (m * profitM + n * profitN) / 10_000);
  const profit = Math.max(...totals);
  const unusedQ = minutes - 20 * corners[0][0];
  const ignoresFullP = totals[0] + (unusedQ / 30 * profitN) / 10_000;
  const choices = index === 0 ? [...source[77].choices!] :
    [totals[0], totals[1], profit, ignoresFullP].sort((a, b) => a - b).map(String);
  return {
    prompt: [p(source[77].prompt.replace('200時間', hours + '時間')),
      table('製品1単位に必要な時間と販売利益', ['製品', '機械P', '機械Q', '単位当たり販売利益'],
        [['製品M', '30分', '20分', numberText(profitM) + '円'], ['製品N', '15分', '30分', numberText(profitN) + '円']])],
    choices: strings(choices), correctIndex: uniqueAnswer(choices, String(profit)),
    explanation: '製品M，Nの生産数をm，nとすると，機械Pは30m＋15n≦' + numberText(minutes) +
      '，機械Qは20m＋30n≦' + numberText(minutes) + 'となる。両方を使い切るとm＝' + corners[2][0] +
      '，n＝' + corners[2][1] + '。この組合せは' + profit + '万円で，Mだけの' + totals[0] + '万円，Nだけの' + totals[1] + '万円を上回る。',
  };
}

const structured: Record<number, { notes: string; build(index: number): GeneratedBody }> = {
  57: { notes: '繰返し図と下線のキーを持つ四つの関係図を保持。商品の価格・単位又は伝票の配送先住所の従属先を変え，部分関数従属・推移的従属・正規形を見分ける。', build: normalization },
  58: { notes: '三つの4列のスキーマと集計の可否を保ち，日付・性別・生年月日の有無と購入者数の集計期間を変える。', build: aggregate },
  59: { notes: 'SELECT文と3表，等号・範囲・部長による制約・結合欠落の四つの役割を保持。年齢，部長，A表に示す結果を変更し，SQLiteで全選択肢を照合する。', build: sql },
  66: { notes: 'インターネット・DMZ・企業内LANの位置関係と否定形を保持。公開先の機器，必要な業務とプロトコルを変える。', build: firewall },
  67: { notes: '侵入発見後の4作業と順序の誤りを比較する。同じ4段階のまま侵害対象と作業の割当てを変える。', build: incident },
  72: { notes: '6行の取引と整数の円額を保持。ロット別数量・単価を変え，払出し2回で複数ロットにまたがるようにする。生成版の誤答は後入先出、繰越単価のみ、最終購入単価のみ。', build: inventory },
  73: { notes: '9製品と合計欄，固定順の3〜6種類を保持。整数個数・しきい値を変え，累積個数で整数比較する。', build: abc },
  76: { notes: '4×4の対称な所要時間と分単位，固定昇順の選択肢を保持。3経路の合計と帰路を省いた過小額を比較する。', build: tour },
  77: { notes: '2製品×2機械の工程と順序自由の前提を保持。整数の稼働時間と利益を変え，制約境界の交点は整数かつ利益は万円単位で割り切れる。', build: production },
};

export const legacy2008AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const model = structured[Number(number)];
  const reviewed = knowledge[Number(number)];
  return {
    source: '2008h20a-fe-am-' + number, title: original.title, sourceAnswer: original.key,
    version: '3.7.0', fields: [field('問いの対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (model?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2008年度秋期旧午前の入力が範囲外です');
      if (model) return model.build(index);
      const selected = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return { prompt: [p(selected.prompt)], choices: strings([...selected.choices!]),
        correctIndex: selected.correctIndex, explanation: selected.explanation };
    },
  };
});
