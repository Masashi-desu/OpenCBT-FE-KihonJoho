import { DataError } from '../errors';
import { code, field, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { row, spring2005Am5480Knowledge as knowledge } from './legacy-2005-spring-am-54-80-knowledge';
import { spring2005Am5480Source as source } from './legacy-2005-spring-am-54-80-source';

const one = (truth: readonly boolean[]) => {
  const index = truth.indexOf(true);
  if (index === -1 || truth.lastIndexOf(true) !== index) throw new DataError('ANSWER_REF', '2005年度春期旧午前の正答を一意に確定できません');
  return index;
};
const format = (n: number) => n.toLocaleString('en-US');

const scoreConditions = [
  { subjects: ['国語', '数学'], boundary: '平均点', values: ['国語の点数が国語の平均点以上', '数学の点数が数学の平均点以上'] },
  { subjects: ['物理', '英語'], boundary: '80点', values: ['物理の点数が80点以上', '英語の点数が80点以上'] },
  { subjects: ['理科', '情報'], boundary: '各教科の目標点', values: ['理科の点数が理科の目標点以上', '情報の点数が情報の目標点以上'] },
  { subjects: ['社会', '数学'], boundary: '各教科の合格点', values: ['社会の点数が社会の合格点以上', '数学の点数が数学の合格点以上'] },
] as const;

function exclusiveCondition(index: number): GeneratedBody {
  const { subjects, boundary, values } = scoreConditions[index];
  const tableName = ['得点', '成績', '評価', '結果'][index];
  const original = source[60];
  const prompt = !index ? original.prompt : original.prompt.replace('国語と数学', subjects.join('と')).replaceAll('平均点', boundary).replaceAll('“得点”', '“' + tableName + '”');
  const choices = original.choices.map(choice => [code(choice.replace('FROM 得点', 'FROM ' + tableName), 'sql')]);
  return {
    prompt: [p(prompt), p('〔条件文〕'), p('A　' + values[0]), p('B　' + values[1])],
    choices, correctIndex: 2,
    explanation: 'AとBのどちらか一方だけが真になるのは，' + subjects.join('と') + 'のうちちょうど1教科が' + boundary + '以上のときである。ORで少なくとも一方を満たす行に絞り，NOT (A AND B)で両方を満たす行を除く。A又はBを結ぶ同じ条件を直後に否定する式はいずれも行を得られない。',
  };
}

type AccessPlan = { mask: number; allows: number; options: readonly (readonly [number, number])[] };
const accessPlans: readonly AccessPlan[] = [
  { mask: 3, allows: 3, options: [[2, 5], [4, 4], [5, 2], [6, 3]] },
  { mask: 5, allows: 5, options: [[1, 3], [2, 2], [5, 1], [6, 5]] },
  { mask: 6, allows: 6, options: [[1, 1], [3, 2], [4, 5], [6, 3]] },
  { mask: 5, allows: 3, options: [[1, 1], [2, 4], [4, 5], [6, 1]] },
];
const accessNames = ['読取り', '更新', '作成'];
const accessLabel = (mask: number) => accessNames.filter((_, i) => mask & (1 << i)).join('と');
const rules = [[1, 2, 4], [1, 4, 2], [2, 1, 4], [2, 4, 1], [4, 1, 2], [4, 2, 1]];
const applied = (flags: number[], mask: number) =>
  flags.reduce((result, flag, index) => result | (flag & mask ? 1 << index : 0), 0);

function directory(index: number): GeneratedBody {
  const original = source[67];
  const { mask, allows, options } = accessPlans[index];
  const admissible = rules.filter(flags => applied(flags, mask) === allows);
  const answer = one(options.map(([value, allowed]) => admissible.every(flags => applied(flags, value) === allowed)));
  const known = 7 ^ allows;
  return {
    ...row(original.prompt, !index ? original.choices : options.map(([value, allowed]) =>
      value + 'を設定すると，' + accessLabel(allowed) + (allowed === 1 || allowed === 2 || allowed === 4 ? 'だけ' : '') + 'ができる。'), answer,
    '0ですべて不許可，7ですべて許可される。' + mask + 'で許可されないのは' + accessLabel(known) + '。' +
      (7 ^ mask) + 'はその権限に対応する1ビットだけが立つ。ほかの二つの権限のどちらが高いビットであるかは，これらの試行から区別できない。'),
    prompt: [p(original.prompt), p('〔試行結果〕'),
      p('①　0を設定したら，一切のアクセスができなくなってしまった。'),
      p('②　' + mask + 'を設定したら，' + accessLabel(allows) + 'はできたが，' + accessLabel(known) + 'ができなかった。'),
      p('③　7を設定したら，すべてのアクセスができるようになった。')],
  };
}

const schedules = [
  [[7, 3], [5, 6], [4, 2]],
  [[7, 2], [6, 7], [3, 6]],
  [[5, 8], [8, 2], [6, 8]],
  [[4, 2], [8, 7], [7, 6]],
] as const;
const products = ['A', 'B', 'C'];
const orders = [[0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 1, 0]];

function schedule(index: number): GeneratedBody {
  const times = schedules[index];
  const finishes = orders.map(order => {
    let first = 0;
    let second = 0;
    for (const item of order) {
      first += times[item][0];
      second = Math.max(first, second) + times[item][1];
    }
    return second;
  });
  const least = Math.min(...finishes);
  const answer = one(finishes.map(finish => finish === least));
  return {
    prompt: [p(source[77].prompt), table('各製品の加工時間', ['製品＼機械', 'M1', 'M2'],
      times.map((pair, item) => [products[item], ...pair.map(String)]))],
    choices: strings([...source[77].choices]), correctIndex: answer,
    explanation: 'M1は製品を順次加工する。M2では，対象製品がM1を終えた時間と直前の製品がM2を終えた時間のうち，遅い方から加工を始める。' +
      source[77].choices.map((order, i) => order + 'は' + finishes[i]).join('，') + 'となるので，最短は' + source[77].choices[answer] + 'の' + least + 'である。',
  };
}

const sweets = [
  { capacity: [360, 240], k: [6, 3], l: [2, 4], profit: [600, 400] },
  { capacity: [340, 220], k: [5, 3], l: [2, 4], profit: [550, 400] },
  { capacity: [345, 250], k: [6, 3], l: [2, 4], profit: [650, 420] },
  { capacity: [415, 260], k: [7, 4], l: [3, 5], profit: [700, 500] },
];

function maximize(index: number): GeneratedBody {
  const { capacity: [capK, capL], k: [km, kn], l: [lm, ln], profit: [pm, pn] } = sweets[index];
  const det = km * ln - kn * lm;
  const quantityM = (capK * ln - capL * kn) / det;
  const quantityN = (capL * km - capK * lm) / det;
  const profit = quantityM * pm + quantityN * pn;
  const onlyM = Math.min(Math.floor(capK / km), Math.floor(capL / lm)) * pm;
  const onlyN = Math.min(Math.floor(capK / kn), Math.floor(capL / ln)) * pn;
  const ignoringL = Math.floor(capK / kn) * pn;
  const choices = [onlyN, onlyM, profit, ignoringL].sort((a, b) => a - b);
  const answer = one(choices.map(value => value === profit));
  return {
    prompt: [p(source[78].prompt.replace('360個', capK + '個').replace('240個', capL + '個')),
      table('箱詰めの組合せと1商品当たりの販売利益', ['商品', 'K（個）', 'L（個）', '販売利益（円）'],
        [['商品M', String(km), String(lm), String(pm)], ['商品N', String(kn), String(ln), String(pn)]])],
    choices: strings(choices.map(format)), correctIndex: answer,
    explanation: 'Mをx個，Nをy個とすると，各材料の制約は' + km + 'x＋' + kn + 'y≦' + capK + 'と' + lm + 'x＋' + ln + 'y≦' + capL + 'になる。' +
      '一方だけを作ると利益はMで' + format(onlyM) + '円，Nで' + format(onlyN) + '円。' +
      '両制約を等号として解くとx＝' + quantityM + '，y＝' + quantityN + 'となる。' +
      '実数の範囲でもこの交点の利益が端点より高く，交点では商品数を整数にできるため，最大利益は' + format(profit) + '円である。',
  };
}

const computed: Record<number, (index: number) => GeneratedBody> = {
  60: exclusiveCondition, 67: directory, 77: schedule, 78: maximize,
};
const conditions: Readonly<Record<number, string>> = {
  54: 'ADSLの装置・機能の対象を変える。', 55: 'ノードの送信方式を変え，トークンバスと物理的なリングを区別する。',
  56: '接続機器が扱うOSIの層と役割を変える。', 57: '用途と経路表の状態を変える。経路の参照に使う宛先情報は共通。',
  58: '説明対象のDB概念を変える。', 59: '説明対象の関係DB用語を変える。',
  60: '教科，得点のしきい値及び格納表を変える。一方だけの条件は保持する。',
  61: 'カーソルの操作を定義・開始・取出し・終了で変える。',
  62: '回復の処理又は開始方式の対象を変え，復旧の起点と適用するログの内容を明確にする。',
  63: 'DBを用いたシステムに関わる担当者の役割を変える。',
  65: '認証局が証明書を発行する取引の用途と証明対象を変える。',
  66: 'ウイルス対策で使うファイルの対象と役割を変える。',
  67: '試行に用いる八進数と権限の判定結果を変え，原題と同じ形式の試行と昇順の選択肢を提示する。',
  69: '対策中の前提変更，過去の実績，残余リスクの比較へ状況を変える。',
  70: '購入者の受入基準又は手続が具体化される取得段階を変える。',
  71: '説明対象の経営概念を変える。', 73: '説明対象の原価計算方式を変える。',
  74: '説明対象の品質管理の図法を変える。', 75: '説明対象のQC図表を変える。',
  76: '利用場面を変えて，前後制約，待ち時間，時系列，線形計画の適合性を判断する。',
  77: '2台×3製品の桁数と加工前提を固定し，加工時間を変える。', 78: '材料の個数，能力，商品ごとの販売利益を変える。',
  79: '説明対象の経営・取引概念を変える。', 80: '出題時の複製・私的使用・公衆送信の条件を保持し，複製方法，使用範囲と公開状況を変える。',
};
const fixed = new Set([57, 60, 65, 70, 78]);

export const legacy2005SpringAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([key, original]) => {
  const number = Number(key);
  const build = computed[number] ?? knowledge[number];
  return {
    source: '2005h17h-fe-am-' + number, title: original.title, sourceAnswer: original.key,
    version: '3.7.0', fields: [field('対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' ' + conditions[number],
    ...(fixed.has(number) ? { answerVariation: 'fixed' as const } : {}),
    build(values) {
      const descriptor = Array.isArray(values) ? Object.getOwnPropertyDescriptor(values, '0') : undefined;
      const index = descriptor?.value;
      if (!descriptor || !('value' in descriptor) || values.length !== 1 || Reflect.ownKeys(values).length !== 2 ||
          !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2005年度春期旧午前の入力が範囲外です');
      return build(index);
    },
  };
});
