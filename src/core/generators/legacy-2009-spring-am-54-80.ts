import { DataError } from '../errors';
import { field, figure, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { improvementFlow } from './legacy-2009-spring-am-54-80-figures';
import { spring2009Am5480Knowledge as knowledge } from './legacy-2009-spring-am-54-80-knowledge';
import { spring2009Am5480Source as source } from './legacy-2009-spring-am-54-80-source';

const numberText = (number: number) => number.toLocaleString('en-US');
function uniqueAnswer(options: readonly string[], result: string) {
  const index = options.indexOf(result);
  if (index < 0 || index !== options.lastIndexOf(result))
    throw new DataError('ANSWER_REF', '2009年度春期旧午前の正答を一意に確定できません');
  return index;
}

function improvement(index: number): GeneratedBody {
  const letters = ['C', 'A', 'B', 'D'];
  const sequence = ['問題の把握', '改善目標の設定', '改善案の策定', '改善案の評価'];
  const letter = letters[index];
  const answer = sequence['ABCD'.indexOf(letter)];
  const options = source[63].choices;
  return {
    prompt: [p(source[63].prompt.replace('Cに該当', letter + 'に該当')),
      figure(improvementFlow.profile, [index], '業務改善の六つのステップ', improvementFlow.alt([index]))],
    choices: strings([...options]),
    correctIndex: uniqueAnswer(options, answer),
    explanation: '目的を確認した後，問題の把握，改善目標の設定，改善案の策定，改善案の評価の順に進め，選んだ案を実施して効果を確かめる。したがって' + letter + 'は' + answer + 'である。',
  };
}

const scoreCases = [
  { weights: [5, 8, 12], scores: [3, 0, 1], options: [27, 36, 43, 52] },
  { weights: [4, 9, 12], scores: [3, 0, 2], options: [36, 48, 56, 64] },
  { weights: [4, 9, 12], scores: [3, 0, 1], options: [16, 24, 32, 44] },
  { weights: [3, 8, 14], scores: [3, 2, 1], options: [33, 39, 52, 67] },
];
const scale = '4段階評価点　3：予定どおり　2：ほぼ予定どおり　1：部分改善　0：変わらず';
const judgements = ['従来と変わらない', '部分的には改善された', 'ほぼ予定どおりの効果があった', '予定どおりの効果があった'];
function scoring(index: number): GeneratedBody {
  const { weights, scores, options } = scoreCases[index];
  const items = ['省力化効果', '期間の短縮', '情報の統合化'];
  const points = weights.map((weight, row) => weight * scores[row]);
  const received = points.reduce((sum, point) => sum + point, 0);
  const maximum = weights.reduce((sum, weight) => sum + 3 * weight, 0);
  const percentage = received * 100 / maximum;
  const choices = options.map(String);
  return {
    prompt: [p(source[64].prompt), table('評価項目別の判定', ['評価項目', '重み', '判定内容'],
      items.map((item, row) => [item, String(weights[row]), judgements[scores[row]]])), p(scale)],
    choices: strings(choices),
    correctIndex: uniqueAnswer(choices, String(percentage)),
    explanation: `評価点に重みを掛け，${weights.map((weight, row) => weight + '×' + scores[row]).join('＋')}＝${received}点を得る。全項目が評価点3なら${maximum}点なので，目標達成度は${received}÷${maximum}×100＝${percentage}％である。`,
  };
}

const abcCases = [
  [[110, 2], [60, 40], [10, 4], [130, 1], [50, 12], [1, 25], [10, 2], [150, 2], [20, 2], [50, 1]],
  [[120, 10], [50, 40], [12, 4], [120, 1], [40, 8], [2, 25], [10, 2], [120, 2], [24, 2], [50, 1]],
  [[110, 2], [60, 30], [10, 4], [130, 1], [40, 5], [40, 35], [10, 2], [150, 2], [20, 2], [50, 1]],
  [[110, 2], [60, 8], [10, 4], [140, 14], [50, 5], [1, 25], [10, 2], [160, 10], [20, 2], [50, 1]],
];
function abc(index: number): GeneratedBody {
  const sales = abcCases[index].map(([quantity, price], row) => ({ id: row + 1, quantity, price, value: quantity * price }));
  const totals = sales.reduce(({ quantity, value }, sale) => ({ quantity: quantity + sale.quantity, value: value + sale.value }), { quantity: 0, value: 0 });
  const ranked = sales.slice().sort((a, b) => b.value - a.value);
  const selected: typeof sales = [];
  let subtotal = 0;
  for (const sale of ranked) {
    selected.push(sale);
    subtotal += sale.value;
    if (subtotal * 4 >= totals.value * 3) break;
  }
  const pair = selected.map(sale => sale.id).sort((a, b) => a - b).join('と');
  const choices = source[76].choices;
  const prompt = source[76].prompt + (index === 0 ? '' : ' ここで，年間売上高の降順に累計し，初めて全体の75％以上となる商品までをAグループとする。');
  return {
    prompt: [p(prompt), table('商品別の年間販売数と年間売上高', ['商品番号', '年間販売数', '単価', '年間売上高'], [
      ...sales.map(sale => [String(sale.id), numberText(sale.quantity), numberText(sale.price), numberText(sale.value)]),
      ['合計', numberText(totals.quantity), '', numberText(totals.value)],
    ])],
    choices: strings([...choices]),
    correctIndex: uniqueAnswer(choices, pair),
    explanation: `年間売上高を大きい順に並べると，上位は${selected.map(sale => '商品' + sale.id + '（' + numberText(sale.value) + '）').join('，')}である。合わせて${numberText(subtotal)}で，全体の${(subtotal * 100 / totals.value).toFixed(1)}％を占める。${index === 0 ? '選択肢の中で売上の大部分を占める上位の商品を組み合わせているのは' : '初めて75％以上に達するまでに含まれるのは'}${pair}である。`,
  };
}

const fifoCases = [
  { opening: 2000, purchase: 3000, issued: 3000, oldPrice: 100, newPrice: 130, options: [100, 110, 115, 118] },
  { opening: 3000, purchase: 2000, issued: 4000, oldPrice: 120, newPrice: 160, options: [120, 130, 136, 140] },
  { opening: 2000, purchase: 4000, issued: 5000, oldPrice: 90, newPrice: 150, options: [90, 120, 126, 130] },
  { opening: 2000, purchase: 3000, issued: 3000, oldPrice: 150, newPrice: 120, options: [132, 135, 140, 150] },
];
function fifo(index: number): GeneratedBody {
  const { opening, purchase, issued, oldPrice, newPrice, options } = fifoCases[index];
  const oldCount = Math.min(issued, opening);
  const newCount = issued - oldCount;
  const total = oldCount * oldPrice + newCount * newPrice;
  const unitPrice = total / issued;
  const choices = options.map(String);
  return {
    prompt: [p(source[77].prompt), table('部品の受払記録', ['取引日', '取引内容', '数量（個）', '単価（円）', '金額（円）'], [
      ['4月1日', '前月繰越', numberText(opening), String(oldPrice), numberText(opening * oldPrice)],
      ['4月5日', '購入', numberText(purchase), String(newPrice), numberText(purchase * newPrice)],
      ['4月10日', '払出', numberText(issued), '', ''],
    ])],
    choices: strings(choices),
    correctIndex: uniqueAnswer(choices, String(unitPrice)),
    explanation: `先入先出法では，先に入った繰越分から${numberText(oldCount)}個，次の購入分から${numberText(newCount)}個を払い出す。払出金額は${numberText(oldCount)}×${oldPrice}＋${numberText(newCount)}×${newPrice}＝${numberText(total)}円で，${numberText(issued)}個で割ると1個当たり${unitPrice}円になる。`,
  };
}

const models: Record<number, { notes: string; build(index: number): GeneratedBody }> = {
  63: { notes: '6段階の縦の流れと選択肢を維持し，問う箱A〜Dを切り替える。', build: improvement },
  64: { notes: '3行の評価表と4段階尺度を保持。和25の整数重みと0〜3の評価点を変え，百分率は整数。誤答は配点未正規化，重みなし，判定の1段階違い。', build: scoring },
  76: { notes: '10商品と合計欄を維持し，単価と販売数を変更する。生成版は売上高の上位から累計75％以上に達するまでと明示する。商品番号の組合せと順序は固定。', build: abc },
  77: { notes: '繰越・購入・払出の3行と単位・日付を保持。2ロットを払い出す数量と整数単価を変える。誤答は繰越単価のみ，ロット単価の単純平均，在庫全体の加重平均。', build: fifo },
};

export const legacy2009SpringAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const model = models[Number(number)];
  const reviewed = knowledge[Number(number)];
  return {
    source: '2009h21h-fe-am-' + number, title: original.title, sourceAnswer: original.key, version: '3.7.0',
    fields: [field('問いの対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (model?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2009年度春期旧午前の入力が範囲外です');
      if (model) return model.build(index);
      const selected = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return { prompt: [p(selected.prompt)], choices: strings([...selected.choices]),
        correctIndex: selected.correctIndex, explanation: selected.explanation };
    },
  };
});
