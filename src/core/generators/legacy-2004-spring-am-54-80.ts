import { DataError } from '../errors';
import { field, figure, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { activityFigure, histogram, histogramFigure, inventoryFigure, trades, workPlan } from './legacy-2004-spring-am-54-80-figures';
import { body, knowledge } from './legacy-2004-spring-am-54-80-knowledge';
import { spring2004Am5480Source as source } from './legacy-2004-spring-am-54-80-source';

function only(truth: readonly boolean[]) {
  const first = truth.indexOf(true);
  if (first === -1 || first !== truth.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2004年度春期旧午前の正答を一意に確定できません');
  return first;
}
const fmt = (value: number) => value.toLocaleString('en-US');

function calendar(index: number): GeneratedBody {
  const edges = workPlan(index);
  const earliest = Array<number>(6).fill(0);
  for (let from = 0; from <= 4; from++) {
    for (const edge of edges.filter(edge => edge.from === from))
      earliest[edge.to] = Math.max(earliest[edge.to], earliest[from] + edge.days);
  }
  const candidates = ['AECDI', 'AFDI', 'ABHI', 'ABGDI'].map(path =>
    [...path].reduce((sum, name) => sum + edges.find(edge => edge.name === name)!.days, 0)).sort((a, b) => a - b);
  return {
    prompt: [p(source[54].prompt), figure(activityFigure.profile, [index], '作業工程と日数', activityFigure.alt([index]))],
    choices: strings(candidates.map(String)), correctIndex: only(candidates.map(days => days === earliest[5])),
    explanation: '結合点はその点に向かう作業がすべて終わってから次へ進む。開始を0日として各結合点に到達できる最も早い日を順に求めると' +
      earliest.slice(1).map(value => value + '日').join('，') + '。経路ごとに必要な日数が異なるため，終了までに最低' + earliest[5] + '日かかる。',
  };
}

const checkData = ['2131', '3116', '7431', '5230'];
function checkCharacter(index: number): GeneratedBody {
  const data = checkData[index];
  const totals = [...data].map((digit, i) => Number(digit) * (4 - i));
  const sum = totals.reduce((a, b) => a + b, 0);
  const remainder = sum % 11;
  const expected = remainder === 10 ? 'X' : String(remainder);
  const choices = index === 3 ? ['1', '3', '5', 'X'] : [...source[58].choices];
  return {
    prompt: [p(source[58].prompt.replace('2131', data)),
      p('〔規則〕'),
      p('（1）与えられたデータの各けたに，先頭から係数4，3，2，1を割り当てる。'),
      p('（2）各けたの数値と割り当てた係数との積の和を求める。'),
      p('（3）（2）で求めた値を11で割って余りを求める。'),
      p('（4）（3）で求めた余りの数字を検査文字とする。余りが10のときは，Xを検査文字とする。')],
    choices: strings(choices), correctIndex: only(choices.map(choice => choice === expected)),
    explanation: '先頭から係数4，3，2，1を掛けた値は' + totals.join('，') + '，合計は' + sum + 'である。' +
      '11で割ると商' + Math.floor(sum / 11) + '，余り' + remainder + 'となり，検査文字は' + expected + 'となる。',
  };
}

const lineCases = [
  { line: 64, amount: 1000000, measure: '10⁶', efficiency: 80 },
  { line: 80, amount: 1000000, measure: '10⁶', efficiency: 80 },
  { line: 128, amount: 2000000, measure: '2×10⁶', efficiency: 75 },
  { line: 100, amount: 1200000, measure: '1.2×10⁶', efficiency: 60 },
] as const;
function fileTransmission(index: number): GeneratedBody {
  const { line, amount, measure, efficiency } = lineCases[index];
  const nominal = (8 * amount) / (1000 * line);
  const effective = line * 1000 * efficiency / 100;
  const elapsed = 8 * amount / effective;
  const candidates = [(Math.ceil(elapsed) / 8).toFixed(1), String(Number((nominal * efficiency / 100).toFixed(1))), String(nominal), String(Math.ceil(elapsed))];
  const distances = candidates.map(value => Math.abs(Number(value) - elapsed));
  return body(
    source[64].prompt.replace('64k', line + 'k').replace('10⁶', measure).replace('80%', efficiency + '%'),
    candidates, only(distances.map(value => value === Math.min(...distances))),
    'ファイルは' + fmt(amount) + 'バイト，ビットに換算すると' + fmt(8 * amount) + 'ビットである。この回線が1秒に実際に送れるのは' +
    fmt(line * 1000) + '×' + efficiency + '÷100＝' + fmt(effective) + 'ビット。したがって約' +
    (Number.isInteger(elapsed) ? fmt(elapsed) : elapsed.toFixed(2)) + '秒かかり，選択肢では' + candidates[3] + '秒が最も近い。');
}

function inventory(index: number): GeneratedBody {
  const rows = trades(index);
  const deposits = rows.flatMap(({ price, qty }) => price === null ? [] : [{ price, qty }]);
  const remaining = rows.reduce((sum, row) => sum + (row.price === null ? -row.qty : row.qty), 0);
  function valuation(lots: typeof deposits) {
    let needed = remaining;
    let value = 0;
    for (const { price, qty } of lots) {
      const taken = Math.min(needed, qty);
      value += taken * price;
      needed -= taken;
    }
    return value;
  }
  const fifo = valuation([...deposits].reverse());
  const candidates = [deposits.at(-1)!.price * remaining, valuation(deposits),
    remaining * deposits.reduce((sum, lot) => sum + lot.price, 0) / deposits.length, fifo].sort((a, b) => a - b).map(fmt);
  return {
    prompt: [p(source[75].prompt), figure(inventoryFigure.profile, [index], '商品Aの取引内容', inventoryFigure.alt([index]))],
    choices: strings(candidates), correctIndex: only(candidates.map(value => value === fmt(fifo))),
    explanation: '先入先出法では古い在庫から順に払い出す。4月末に残るのは新しい方から' + remaining + '個である。' +
      '月末より前の各払出しがその時点の在庫を超えないので，新しい仕入れから必要数を逆に数えられる。残る' + remaining +
      '個の仕入単価を個数分だけ足すと' + fmt(fifo) + '円になる。',
  };
}

const targets = [
  { side: 'upper', window: '上限', data: '1,000', purpose: 'この工程の高い値を避けたような形' },
  { side: 'lower', window: '下限', data: '1,000', purpose: 'バグ摘出率が低いことを嫌ってデータを意図的に操作し' },
  { side: 'upper', window: '上限', data: '2,000', purpose: 'バグ摘出率が高いことを嫌い，管理上限を超えた報告値を管理値内に収めたことが推測できた' },
  { side: 'lower', window: '下限', data: '500', purpose: 'バグ摘出率が低いことを嫌い，管理下限を下回る報告値を管理値内に収めたことが推測できた' },
] as const;
function distribution(index: number): GeneratedBody {
  const { side, window, data, purpose } = targets[index];
  const choices = ['ア', 'イ', 'ウ', 'エ'];
  const truth = choices.map((_, slot) => {
    const [lower, upper, heights] = histogram(index, slot);
    if (heights.slice(0, lower).some(Boolean) || heights.slice(upper).some(Boolean)) return false;
    const center = heights.slice(lower + 4, upper - 4);
    const closeToLimit = side === 'upper' ? heights.slice(upper - 4, upper) : heights.slice(lower, lower + 4);
    const opposite = side === 'upper' ? heights.slice(lower, lower + 4) : heights.slice(upper - 4, upper);
    return center.length > 0 && closeToLimit.reduce((a, b) => a + b, 0) > 3 * opposite.reduce((a, b) => a + b, 0) &&
      Math.max(...closeToLimit) > Math.max(...center);
  });
  const choice = only(truth);
  const prompt = index === 0 ? source[77].prompt :
    'ある単体テスト工程では，' + data + 'ステップ当たりのバグ摘出率はほぼ正規分布になることが分かっている。' +
    'チーム別のバグ摘出率をヒストグラムで表したところ，' + (index === 1 ? purpose + '管理値内に収めてしまったチームがあることが推測できた' : purpose) +
    '。これに該当するヒストグラムはどれか。ここで，SLは管理下限，SUは管理上限を表す。';
  return {
    prompt: [p(prompt)],
    choices: choices.map((label, slot) => [figure(histogramFigure.profile, [index, slot], 'ヒストグラム ' + label, histogramFigure.alt([index, slot]))]),
    correctIndex: choice,
    explanation: '管理' + window + 'のすぐ内側に値が偏り，反対側は度数が少なく，境界を超える値が見られないのは' +
      choices[choice] + 'である。ほぼ正規分布と分かっている場合に，この形は管理値の外側が内側に寄せられた可能性を示す。意図的操作という原因は図だけでは確定せず，元の記録や集計手順の検証が必要になる。',
  };
}

const computed: Record<number, (index: number) => GeneratedBody> = { 54: calendar, 58: checkCharacter, 64: fileTransmission, 75: inventory, 77: distribution };
const changes: Record<number, string> = {
  54: '矢印の接続を保持し，各作業日数を変えてクリティカルパスを再計算する。',
  56: 'ウォータフォールの運用テストで見つかる複数工程の誤りを，依存する成果物の異なる事例で比較する。',
  57: '順番にコピーする対象データと更新作業を変え，時点の一貫性を判断する。',
  58: '4けたの入力だけを可変にし，係数の順，11での剰余とXへの変換規則を維持する。',
  59: '主記憶の使用量，磁気ディスクの配置，圧縮保存，障害の検査で対象を区別する。',
  60: '人手との照合が必要なデータと機械検査に用いる条件を変える。',
  61: '遠隔の仮想端末，ファイル，Webの資源及びメールの中継で利用するプロトコルを変える。',
  62: '問うOSI基本参照モデルの層番号とその機能を変える。',
  63: '受信時の誤りの検査方式を，剰余，垂直・水平パリティ，検査ビットの組合せで変える。',
  64: '回線速度，ファイル容量，実効伝送率を変え，元の換算と時間単位で比較する。',
  65: '媒体の利用法を衝突検出・回避とバス・リングの送信権で変える。',
  66: 'OSIモデルの役割を変え，装置が扱う層と変換・中継を区別する。',
  67: '説明対象を関係モデル，転置索引，階層モデル，ネットワークモデルで変える。',
  68: '関係代数の取り出し方を列・行・表の結合・同構造の行の和で変える。',
  69: 'デッドロック，ロック保持，一方の待機，アクセス排他を区別する。',
  70: '定義・機密性・回復・整合性の四用途へDBMSの機能を切り替える。',
  71: '電子文書と，何を誰が署名するかを変える。符号化・検証を含む署名の目的を保つ。',
  72: '共用プログラムが行う更新・上書き・削除と，権限を分ける業務を変える。',
  74: '説明する経営手法を供給網，知識，人材，顧客で変える。',
  75: '取引日時の順，斜線，原形式の個数と単価を保ちつつ，入出庫数量と単価を変える。',
  76: '基準時間の見積り方を，瞬間観測・直接測定・基本動作・経験に分けて変える。',
  77: 'ヒストグラム4肢を個別に再描画し，体裁を保持して元となる頻度分布と疑う上下のしきい値を変える。原因は推測として扱う。',
  78: '分析や計画を用いる対象の問題を，制約・潜在因子・応答予測・実験要因で変える。',
  79: '取引の四種類の取決めは維持し，運用・情報表現・取引成立の場面を変える。',
  80: '自己利用の改変，バックアップ，侵害を認識した時点，アルゴリズムの保護範囲を出題時法令で判断する。',
};
const fixed = new Set([54, 56, 57, 60, 64, 72, 75]);

export const legacy2004SpringAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([id, original]) => {
  const number = Number(id);
  return {
    source: '2004h16h-fe-am-' + number, title: original.title, sourceAnswer: original.key,
    version: '3.7.0', fields: [field('対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' ' + changes[number],
    ...(fixed.has(number) ? { answerVariation: 'fixed' as const } : {}),
    build(values) {
      const descriptor = Array.isArray(values) ? Object.getOwnPropertyDescriptor(values, '0') : undefined;
      const index = descriptor?.value;
      if (!descriptor || !('value' in descriptor) || values.length !== 1 || Reflect.ownKeys(values).length !== 2 ||
          !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2004年度春期旧午前の入力が範囲外です');
      return computed[number]?.(index) ?? knowledge(number, index);
    },
  };
});
