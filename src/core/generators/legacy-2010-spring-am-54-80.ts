import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';
import { field, figure, p, pairs, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import {
  customerCases, customerTransitionFigure, evaluationCases, integerText, portfolioCases, portfolioFigure, procurementFigure,
  procurementLetters, projectedCustomers, retainedCustomers, weightedEvaluationFigure,
} from './legacy-2010-spring-am-54-80-figures';
import { spring2010Am5480Knowledge as knowledge } from './legacy-2010-spring-am-54-80-knowledge';
import { spring2010Am5480Source as source } from './legacy-2010-spring-am-54-80-source';

function draw(definition: BookletFigureDefinition, index: number, caption: string) {
  return figure(definition.profile, [index], caption, definition.alt([index]));
}
function uniqueMatch(matches: readonly boolean[]) {
  const answer = matches.indexOf(true);
  if (answer < 0 || answer !== matches.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2010年度春期旧午前の正答を一意に確定できません');
  return answer;
}

const idCounts = [
  [317000, 383000, 447000, 512000], [441000, 503000, 563000, 624000],
  [391000, 453000, 513000, 574000], [281000, 343000, 403000, 464000],
];
export const idFormat = '〔IDの形式〕XXNNN（例：AZ059など）。Xには英大文字（A〜Z），Nには数字（0〜9）を設定する。';
const years = ['2006', '2007', '2008', '2009'];
function idExhaustion(index: number): GeneratedBody {
  const counts = idCounts[index];
  const capacity = 26 ** 2 * 10 ** 3;
  const annualIncrease = (counts[3] - counts[0]) / 3;
  const correctYear = 2009 + Math.ceil((capacity - counts[3]) / annualIncrease);
  return {
    prompt: [p(source[55].prompt), p(idFormat),
      table('各年度末における発行済ID数の推移', ['年度', ...years], [['発行済ID数（累積）', ...counts.map(integerText)]])],
    choices: strings([...source[55].choices]),
    correctIndex: uniqueMatch(source[55].choices.map(choice => Number(choice.slice(0, 4)) === correctYear)),
    explanation: `IDの上限は26²×10³＝${integerText(capacity)}件。2006年度末から2009年度末の増加は${integerText(counts[3] - counts[0])}件で，1年当たり約${integerText(Math.round(annualIncrease))}件。2009年度末の残りは${integerText(capacity - counts[3])}件なので，${correctYear}年度中に使い切る。既に発行したIDは脱会後も使えない。`,
  };
}

const slaCases = [
  { start: 6, end: 1, days: 30, availability: 995 },
  { start: 7, end: 1, days: 20, availability: 995 },
  { start: 5, end: 1, days: 28, availability: 994 },
  { start: 5, end: 2, days: 30, availability: 993 },
];
function sla(index: number): GeneratedBody {
  const { start, end, days, availability } = slaCases[index];
  const dailyHours = 24 - start + end;
  const totalHours = dailyHours * days;
  const maxHours = totalHours * (1000 - availability) / 1000;
  const correctIndex = uniqueMatch(source[56].choices.map(choice => Number(choice) <= maxHours && Number(choice) + 1 > maxHours));
  return {
    prompt: [p(source[56].prompt.replace('30日', `${days}日`)), p('〔SLAの条件〕'),
      p(`サービス時間帯は営業日の午前${start}時から翌日午前${end}時まで。`),
      p(`可用性${(availability / 10).toFixed(1)}％以上とすること。`)],
    choices: strings([...source[56].choices]), correctIndex,
    explanation: `1日当たり${dailyHours}時間のサービスを${days}日提供するので，月の対象時間は${totalHours}時間。SLA（Service Level Agreement）で許容される停止時間は対象時間の${((1000 - availability) / 10).toFixed(1)}％に当たる${maxHours}時間。選択肢のうちこの時間を超えない最大の整数は${source[56].choices[correctIndex]}時間である。`,
  };
}

function evaluate(index: number): GeneratedBody {
  const { weights, scores } = evaluationCases[index];
  const totals = source[63].choices.map((_, plan) => weights.reduce((sum, weight, row) => sum + weight * scores[row][plan], 0));
  return {
    prompt: [p(source[63].prompt), draw(weightedEvaluationFigure, index, '改善案の重み付け総合評価表')],
    choices: strings([...source[63].choices]),
    correctIndex: uniqueMatch(totals.map(total => total === Math.max(...totals))),
    explanation: `各案について評価項目ごとの点数に重みを掛けて足す。案1から案4まで順に${totals.join('，')}点となるため，合計点が最大の${source[63].choices[totals.indexOf(Math.max(...totals))]}を優先する。`,
  };
}

function procurement(index: number): GeneratedBody {
  const target = [2, 0, 1, 3][index];
  const processOrder = ['提案依頼書（RFP）の発行', '提案評価', '調達先の選定', '調達の実施'];
  return {
    prompt: [p(source[67].prompt.replace('cに入る', procurementLetters[target] + 'に入る')),
      draw(procurementFigure, index, '提案評価方法の決定から続く調達プロセス')],
    choices: strings([...source[67].choices]),
    correctIndex: uniqueMatch(source[67].choices.map(choice => choice === processOrder[target])),
    explanation: `評価方法の決定後，提案依頼書を発行し，受け取った提案を評価する。その評価で調達先を選定し，調達を実施する。この順にa，b，c，dが対応するので，${procurementLetters[target]}は${processOrder[target]}である。`,
  };
}

function portfolio(index: number): GeneratedBody {
  const { shareOnVertical } = portfolioCases[index];
  const axes = shareOnVertical ? '市場占有率｜市場成長率' : '市場成長率｜市場占有率';
  return {
    prompt: [p(source[68].prompt), draw(portfolioFigure, index, '縦軸aと横軸bを持つPPMマトリックス')],
    choices: pairs(source[68].choices.map(choice => choice.split('｜'))),
    correctIndex: uniqueMatch(source[68].choices.map(choice => choice === axes)),
    explanation: `花形と問題児の市場成長率は高く，金のなる木と負け犬では低い。花形と金のなる木の市場占有率は高く，問題児と負け犬では低い。図では縦軸aが${axes.split('｜')[0]}，横軸bが${axes.split('｜')[1]}である。売上高利益率はここで使う軸ではない。`,
  };
}

function customers(index: number): GeneratedBody {
  const { population, rates, newCustomers, claim } = customerCases[index];
  const matches = [
    projectedCustomers(index, 1, 0) === claim,
    rates[1].reduce((total, rate) => total + rate, 0) === 10,
    projectedCustomers(index, 0, 0) * 2 === retainedCustomers(index, 0) + newCustomers[0],
    newCustomers[3] < projectedCustomers(index, 3, 2),
  ];
  const originalPopulation = '10,000人，20,000人，80,000人';
  const populationText = population.map(count => integerText(count) + '人').join('，');
  const prompt = source[70].prompt.replace(originalPopulation, populationText);
  const premise = 'ここで，既存顧客が購入する新商品は1人につき高々1種類として試算した。';
  const question = 'この試算について，適切な記述はどれか。';
  const fullPrompt = index === 0 ? prompt : prompt.replace(question, premise + question);
  return {
    prompt: [p(fullPrompt), draw(customerTransitionFigure, index, '現在の商品から新商品への購入者の試算')],
    choices: strings([source[70].choices[0].replace('1,000', integerText(claim)), ...source[70].choices.slice(1)]),
    correctIndex: uniqueMatch(matches),
    explanation: `Aの購入者からQへの人数は${integerText(projectedCustomers(index, 1, 0))}人。Bの購入者の割合の合計は${rates[1].reduce((sum, rate) => sum + rate, 0) * 10}％。`
      + `Pの購入見込者は新規を含め${integerText(retainedCustomers(index, 0) + newCustomers[0])}人で，そのうちAの購入者は${integerText(projectedCustomers(index, 0, 0))}人。`
      + `Sの新規顧客は${integerText(newCustomers[3])}人，CからSに移る顧客は${integerText(projectedCustomers(index, 3, 2))}人である。`,
  };
}

const originalManufacturingSteps = [
  '① 今後の一定期間に生産が予定されている製品の種類と数量及び部品構成表を基にして，その構成部品についての必要量を計算する。',
  '② 引当可能な在庫量から各構成部品の正味発注量を計算する。',
  '③ 製造／調達リードタイムを考慮して構成部品の発注時期を決定する。',
];
export { originalManufacturingSteps };

const regressionCases = [
  { r: '0.8', slope: '1.1', intercept: 10, choices: source[76].choices, answer: 2, explanation: '正の傾きだけでなく直線とy＝xの差を調べる。差は0.1x＋10なので昨年度の得点が0以上なら正であり，同じ社員の今年度の得点は高い傾向がある。切片は昨年度0点の場合の今年度の予測値，平均値は切片の影響を受ける。相関係数は直線的な関連の強さを表し，問題の質を測る値ではない。' },
  { r: '0.7', slope: '1.0', intercept: 8, answer: 0, choices: [
    '回帰直線のy切片の値から，昨年度の得点が0点の人の今年度の得点は8点と予測される。',
    '回帰直線の傾きから，両年度の平均点は等しい。',
    '回帰直線の傾きとy切片から，今年度の方が得点しにくい傾向がある。',
    '回帰直線の傾きと相関係数から，今年度の問題は質が高い。',
  ], explanation: '昨年度の得点x＝0を式に代入すると予測値y＝8を得る。平均値にも8点の差があり，y＝xより上の直線は今年度の予測が常に8点高い。回帰と相関では出題の質は評価できない。' },
  { r: '0.9', slope: '0.9', intercept: 0, answer: 1, choices: [
    '回帰直線から，今年度の得点が0点なら昨年度の得点は10点程度とれる。',
    '今年度の問題の平均点は，昨年度の問題の平均点の0.9倍である。',
    '回帰直線の傾きとy切片から，今年度の方が得点しやすい傾向がある。',
    '相関係数の値から，今年度の問題は質が高い。',
  ], explanation: '切片を含めて最小二乗法で求めた直線は，両得点の標本平均の点を通る。切片が0なので今年度平均は昨年度平均の0.9倍。昨年度が正の得点なら予測値は低く，y＝0なら直線上のxも0。相関の強さは問題の質を測らない。' },
  { r: '0.6', slope: '1.2', intercept: -10, answer: 3, choices: [
    'y切片の値から，今年度が0点なら昨年度は10点である。',
    '今年度の平均点は昨年度の平均点の1.2倍である。',
    '傾きが1を超えるので，昨年度の全得点域で今年度の方が得点しやすい傾向がある。',
    '相関係数と回帰式だけから，今年度の問題の質が高いかどうかは分からない。',
  ], explanation: 'y切片−10はx＝0の予測値であり，xとyを逆に読むことはできない。平均の点も直線上にあり，切片の差が残る。x＝50を境にy＝xより上と下に分かれる。回帰直線や相関係数は得点の関連を示す量であり，問題の質を決める資料はない。' },
];
export function regressionResult(index: number) {
  const { r, slope, intercept } = regressionCases[index];
  return [`相関係数は，${r}であった。`, `回帰直線の傾きは，${slope}であった。`,
    `回帰直線のy切片の値は，${intercept}であった。`];
}
function regression(index: number): GeneratedBody {
  const state = regressionCases[index];
  const prompt = index === 0 ? source[76].prompt : source[76].prompt
    .replace('相関係数と回帰直線を求めた。', '相関係数と，切片を含む最小二乗法による回帰直線を求めた。得点範囲は0〜100点とする。');
  return { prompt: [p(prompt), p('〔結果〕'), ...regressionResult(index).map(p)], choices: strings([...state.choices]), correctIndex: state.answer, explanation: state.explanation };
}

const profitCases = [
  { prompt: source[77].prompt, choices: source[77].choices, answer: 2, detail: '売上高をS，固定費をF，売上高に対する変動費率をv（0≦v＜1）とすると，損益分岐点ではS＝F＋vS，よってS＝F÷（1−v）。固定費が同じなら変動費率が下がるほど損益分岐点は下がり，両者は正比例しない。変動費率が同じなら固定費と損益分岐点は正比例する。' },
  { prompt: '固定費が60万円の製品で，売上高に対する変動費率が40％から25％になった。損益分岐点の特性を説明したものはどれか。', choices: [
    '固定費を一定にしたまま変動費率を下げると，損益分岐点は100万円から80万円に下がる。',
    '変動費率の比をそのまま損益分岐点売上高の比として使える。',
    '変更後の損益分岐点では，売上高は変動費と固定費の合計より小さい。',
    '変更後の変動費率を保ったまま固定費を下げると，損益分岐点は高くなる。',
  ], answer: 0, detail: '60÷（1−0.40）＝100万円，60÷（1−0.25）＝80万円。比は0.8と0.625で異なり，損益分岐点では費用と売上高が等しい。変動費率が同じなら固定費を下げれば損益分岐点も下がる。' },
  { prompt: '売上高に対する変動費率を50％に保ち，固定費が40万円から60万円に増加した。損益分岐点の特性を説明したものはどれか。', choices: [
    '変更後の固定費を保ったまま変動費率を下げると，損益分岐点は高くなる。',
    '変動費率が変わらないとき，損益分岐点での売上高は固定費に正比例する。',
    '変更後の損益分岐点での売上高は，固定費だけに等しい。',
    '同じ変動費率において，変更前の損益分岐点の方が変更後より高い。',
  ], answer: 1, detail: '変動費率50％では売上高の半分で固定費を賄うため，損益分岐点での売上高は固定費の2倍。固定費40万円と60万円のとき80万円と120万円になる。変動費率を下げる場合も分母は増えるので損益分岐点は下がる。' },
  { prompt: '売上高に対する変動費率を40％に保ち，固定費を90万円から60万円に減らした。損益分岐点の特性を説明したものはどれか。', choices: [
    '変更後の固定費を保ったまま変動費率が低くなると，損益分岐点は高くなる。',
    '固定費を60万円に保てば，変動費率と損益分岐点の売上高は正比例する。',
    '変更後の損益分岐点での売上高は，変動費だけに等しい。',
    '同じ変動費率で固定費が小さくなると，損益分岐点は150万円から100万円へ下がる。',
  ], answer: 3, detail: '売上高の60％が固定費を賄う。90÷0.60＝150万円，60÷0.60＝100万円。変動費率との関係は正比例せず，100万円は変動費40万円と固定費60万円の和である。' },
];
function profit(index: number): GeneratedBody {
  const state = profitCases[index];
  return { prompt: [p(state.prompt)], choices: strings([...state.choices]), correctIndex: state.answer, explanation: state.detail };
}

const models: Record<number, { notes: string; build(index: number): GeneratedBody }> = {
  55: { notes: 'ID形式，非再利用，累積数，昇順の年度選択肢を保つ。増加幅の上下限で判定が変わらない4つの累積値列を用意する。', build: idExhaustion },
  56: { notes: '夜をまたぐ時間帯・営業日・可用性を同時に指定する。元と同じ整数時間4択から条件を満たす最大値を選ぶ。', build: sla },
  63: { notes: '重みと評価点の3行×4案を保つ。重みは一桁で和を10にし，総合点が一意に最大の案を選ぶ。案の並びは固定する。', build: evaluate },
  67: { notes: '左から右への五段階の流れを維持し，本文で問う箱a〜dを切り替える。図の中に正解語を表示しない。', build: procurement },
  68: { notes: 'PPMの四象限・二軸の高低・対の選択肢を保つ。軸の交換と高低の向きを変え，象限配置を一致させる。', build: portfolio },
  70: { notes: '3旧商品・4新商品・0.1刻みの割合・二つの合計行を保つ。人数，割合，見込人数，主張を変える。全員移行の成立に必要な排他条件は生成時に明示する。', build: customers },
  76: { notes: 'xは昨年，yは今年。相関係数・一次回帰式と，切片の向き，平均，傾向，問題の質の4つの観点を保つ。', build: regression },
  77: { notes: '固定費と売上高に対する変動費率の変動を本文に置き，費用の等式・比例関係・増減を比較する。', build: profit },
};

export const legacy2010SpringAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const model = models[Number(number)];
  const reviewed = knowledge[Number(number)];
  return {
    source: '2010h22h-fe-am-' + number,
    title: original.title, sourceAnswer: original.key, version: '3.7.0',
    fields: [field('問いの対象・判断条件', 0, 3)], reference: [0],
    ...(number === '57' ? { answerVariation: 'fixed' as const } : {}),
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (model?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2010年度春期旧午前の入力が範囲外です');
      if (model) return model.build(index);
      const selected = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      const paragraphs = number === '73' && index === 0
        ? [selected.prompt, ...originalManufacturingSteps]
        : selected.prompt.split('\n');
      return { prompt: paragraphs.map(p), choices: strings([...selected.choices]),
        correctIndex: selected.correctIndex, explanation: selected.explanation };
    },
  };
});
