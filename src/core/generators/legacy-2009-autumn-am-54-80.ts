import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';
import { field, figure, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import {
  contractCases, contractFigure, factoryCases, factoryFigure, integerText,
  products, requirementsCases, requirementsFigure, scatterCases, scatterFigure, type Company,
} from './legacy-2009-autumn-am-54-80-figures';
import { autumn2009Am5480Knowledge as knowledge } from './legacy-2009-autumn-am-54-80-knowledge';
import { autumn2009Am5480Source as source } from './legacy-2009-autumn-am-54-80-source';

function draw(definition: BookletFigureDefinition, index: number, caption: string) {
  return figure(definition.profile, [index], caption, definition.alt([index]));
}

function uniqueMatch(matches: readonly boolean[]) {
  const answer = matches.indexOf(true);
  if (answer < 0 || answer !== matches.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2009年度秋期旧午前の正答を一意に確定できません');
  return answer;
}

const demandCases = [
  { highPrice: 3000, lowPrice: 1000, demandAtLowPrice: 60000, targetPrice: 1500, options: [30000, 35000, 40000, 45000] },
  { highPrice: 3200, lowPrice: 1200, demandAtLowPrice: 50000, targetPrice: 2200, options: [25000, 30000, 35000, 40000] },
  { highPrice: 3600, lowPrice: 1200, demandAtLowPrice: 60000, targetPrice: 2000, options: [30000, 35000, 40000, 45000] },
  { highPrice: 3600, lowPrice: 1600, demandAtLowPrice: 50000, targetPrice: 2200, options: [30000, 35000, 40000, 45000] },
];
function demand(index: number): GeneratedBody {
  const { highPrice, lowPrice, demandAtLowPrice, targetPrice, options } = demandCases[index];
  const totalDifference = highPrice - lowPrice;
  const priceReduction = highPrice - targetPrice;
  const targetDemand = demandAtLowPrice * priceReduction / totalDifference;
  return {
    prompt: [p(source[69].prompt),
      p('（1）設定価格を' + integerText(highPrice) + '円にすると，需要は0になる。'),
      p('（2）設定価格を' + integerText(lowPrice) + '円にすると，需要は' + integerText(demandAtLowPrice) + '個になる。'),
      p('（3）設定価格を' + integerText(targetPrice) + '円にすると，需要は［a］個になる。')],
    choices: strings(options.map(integerText)), correctIndex: uniqueMatch(options.map(option => option === targetDemand)),
    explanation: '価格と需要の関係は一次式なので，需要が0になる価格からの値下がり幅に需要が比例する。'
      + integerText(totalDifference) + '円の値下がりで' + integerText(demandAtLowPrice) + '個なので，'
      + integerText(priceReduction) + '円の値下がりでは' + integerText(demandAtLowPrice) + '×'
      + integerText(priceReduction) + '÷' + integerText(totalDifference) + '＝' + integerText(targetDemand) + '個になる。',
  };
}

function capacity(index: number): GeneratedBody {
  const { hours, profits, minutes, caps, options } = factoryCases[index];
  const order = [0, 1, 2].sort((a, b) => profits[b] * minutes[a] - profits[a] * minutes[b]);
  const count = [0, 0, 0];
  let remaining = hours * 60;
  for (const product of order) {
    count[product] = Math.min(caps[product], remaining / minutes[product]);
    if (!Number.isInteger(count[product]))
      throw new DataError('PARAMETER_CONSTRAINT', '組立て時間の制約内で整数の最適製造数を確定できません');
    remaining -= count[product] * minutes[product];
  }
  const profit = count.reduce((sum, quantity, product) => sum + quantity * profits[product], 0);
  return {
    prompt: [p(source[72].prompt.replace('月間200時間', '月間' + hours + '時間')),
      draw(factoryFigure, index, '製品別の利益・組立て時間・月間需要量')],
    choices: strings(options.map(integerText)), correctIndex: uniqueMatch(options.map(option => option === profit)),
    explanation: '組立て時間を制約とするので，1分当たりの利益が高い製品から時間を配分する。'
      + order.map(product => products[product] + 'は1分当たり' + profits[product] / minutes[product] + '円').join('，') + '。'
      + '月間' + integerText(hours * 60) + '分のうち，'
      + order.map(product => products[product] + 'に' + integerText(count[product] * minutes[product]) + '分（'
        + integerText(count[product]) + '個）').join('，') + 'を配分できる。'
      + '需要上限を守りながら，1分当たりの利益が高い順の割当てを端数なしで実現できるので，最大利益は'
      + integerText(profit) + '円になる。',
  };
}

function materialRequirements(index: number): GeneratedBody {
  const { shipment, usage, stock, options } = requirementsCases[index];
  const [aPerA, bPerA, bPerPartA] = usage;
  const [stockA, stockPartA, stockB] = stock;
  const productionA = Math.max(shipment - stockA, 0);
  const productionPartA = Math.max(aPerA * productionA - stockPartA, 0);
  const directB = bPerA * productionA;
  const indirectB = bPerPartA * productionPartA;
  const netB = Math.max(directB + indirectB - stockB, 0);
  return {
    prompt: [p(source[73].prompt.replace('300個出荷', shipment + '個出荷')),
      draw(requirementsFigure, index, '構成表と在庫表')],
    choices: strings(options.map(integerText)), correctIndex: uniqueMatch(options.map(option => option === netB)),
    explanation: '製品Aは在庫を引いて' + integerText(productionA) + '個を製造する。'
      + 'その製造には部品aが' + integerText(productionA * aPerA) + '個必要で，aの在庫を引くと新たに'
      + integerText(productionPartA) + '個を作る。製品Aに直接使うbは' + integerText(directB)
      + '個，部品aの製造に使うbは' + integerText(indirectB) + '個。bの在庫'
      + integerText(stockB) + '個を差し引いた正味所要量は' + integerText(netB) + '個である。',
  };
}

function correlation(index: number): GeneratedBody {
  const points = scatterCases[index];
  const totals = points.reduce(([sumX, sumY, sumXY], [x, y]) => [sumX + x, sumY + y, sumXY + x * y], [0, 0, 0]);
  const numerator = points.length * totals[2] - totals[0] * totals[1];
  const positive = numerator > 0;
  return {
    prompt: [p(source[76].prompt), draw(scatterFigure, index, '製造上の要因xと品質特性yの散布図')],
    choices: strings([...source[76].choices]),
    correctIndex: uniqueMatch([false, false, positive, numerator < 0]),
    explanation: 'xが大きくなるにつれて，yは' + (positive ? '大きく' : '小さく')
      + 'なる傾向があるので，相関係数は' + (positive ? '正' : '負') + 'である。'
      + 'この散布図だけで二次回帰が必要とはいえず，xからyを推定する回帰とyからxを推定する回帰も一般に異なる。',
  };
}

type Action = { company: Company; worker: Company | '全員'; duty: '業務指示' | '就業条件' };
const contractActions: readonly (readonly Action[])[] = [
  [{ company: 'A', worker: 'B', duty: '業務指示' }, { company: 'A', worker: '全員', duty: '業務指示' },
    { company: 'B', worker: 'C', duty: '業務指示' }, { company: 'B', worker: 'C', duty: '就業条件' }],
  [{ company: 'A', worker: 'B', duty: '業務指示' }, { company: 'A', worker: '全員', duty: '業務指示' },
    { company: 'B', worker: 'C', duty: '業務指示' }, { company: 'A', worker: 'B', duty: '就業条件' }],
  [{ company: 'A', worker: 'B', duty: '業務指示' }, { company: 'C', worker: 'C', duty: '業務指示' },
    { company: 'B', worker: 'C', duty: '業務指示' }, { company: 'B', worker: 'C', duty: '就業条件' }],
  [{ company: 'A', worker: 'B', duty: '業務指示' }, { company: 'A', worker: '全員', duty: '業務指示' },
    { company: 'B', worker: 'C', duty: '業務指示' }, { company: 'A', worker: 'C', duty: '業務指示' }],
];
const contractPremises = [
  '',
  'A社に派遣されるのはB社の派遣対象の要員だけである。B社とC社は別に結んだ請負契約に基づいて作業し，C社の要員は派遣されない。',
  'A社がB社に開発を請け負わせ，B社がその一部をC社に請け負わせる。各社は自社の要員を雇用している。',
  'A社は開発の一部をB社に請け負わせ，自社が担当する作業ではC社から派遣された要員を受け入れる。',
];
function actionText({ company, worker, duty }: Action) {
  const lead = company + '社の担当者が';
  if (worker === '全員') return lead + 'プロジェクトチーム全員に直接作業指示を行う。';
  const subject = worker + '社の要員';
  return duty === '就業条件' ? lead + subject + 'の雇用契約上の就業条件を一方的に変更する。'
    : lead + (company === worker ? '自社（' + worker + '社）の要員' : subject) + 'に直接作業指示を行う。';
}
function contract(index: number): GeneratedBody {
  const { links } = contractCases[index];
  const choices = index === 0 ? [...source[80].choices] : contractActions[index].map(actionText);
  const matches = contractActions[index].map(({ company, worker, duty }) => {
    const directs = (employer: Company) => company === employer || links.some(link =>
      link.kind === '派遣契約' && link.employer === employer && link.client === company);
    if (duty === '就業条件') return company === worker;
    return worker === '全員' ? (['A', 'B', 'C'] as const).every(directs) : directs(worker);
  });
  const correctIndex = uniqueMatch(matches);
  return {
    prompt: [p(source[80].prompt + contractPremises[index]),
      draw(contractFigure, index, 'A社・B社・C社の契約関係')],
    choices: strings(choices), correctIndex,
    explanation: '請負では請負事業者が自社の要員に指示し，発注者が要員へ直接指示することはできない。'
      + '派遣では契約の範囲内で派遣先が業務を指示する。雇用契約上の就業条件を派遣先の判断だけで変えることはできない。'
      + 'この契約関係で該当するのは「' + choices[correctIndex] + '」である。',
  };
}

const models: Readonly<Record<number, { notes: string; build(index: number): GeneratedBody }>> = {
  69: { notes: '一次関係と無需要価格，三つの価格条件，単位と空欄を保持する。価格と既知需要を変え，5,000個刻みの整数選択肢を昇順に並べる。', build: demand },
  72: { notes: '3製品の利益・所要時間・需要上限と月間時間を提示する。1分当たりの利益順の割当てが端数なく成立する範囲に制約し，円の四択は昇順に保つ。', build: capacity },
  73: { notes: '構成表・在庫表を保持し，出荷数，構成数，在庫数を変える。各階層で在庫を先に引き，bの直接需要と間接需要を合わせる。', build: materialRequirements },
  76: { notes: '同じ軸と散布図を維持して製造上の要因と品質特性の観測値を変える。傾向の向きと回帰について四つの選択肢で問う。', build: correlation },
  80: { notes: '3社の契約関係と業務指示・就業条件を問う形式を保つ。契約形態と派遣先を変え，別契約の要員の所属と指揮命令の範囲を明示する。', build: contract },
};

export const legacy2009AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([rawNumber, original]) => {
  const number = Number(rawNumber);
  const model = models[number];
  const reviewed = knowledge[number];
  return {
    source: '2009h21a-fe-am-' + number,
    title: original.title, sourceAnswer: original.key, version: '3.7.0',
    fields: [field('問いの対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (model?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2009年度秋期旧午前の入力が範囲外です');
      if (model) return model.build(index);
      const selected = index === 0
        ? { prompt: original.prompt, answer: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation, choices: original.choices }
        : reviewed.variants[index - 1];
      return { prompt: [p(selected.prompt)], choices: strings([...(selected.choices ?? original.choices)]),
        correctIndex: selected.answer, explanation: selected.explanation };
    },
  };
});
