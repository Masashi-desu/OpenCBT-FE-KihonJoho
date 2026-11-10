import { figure, list, p, strings, type GeneratedBody } from './definition';
import { legacy2011AutumnAm5480Figures as figures, thousands } from './legacy-2011-autumn-am-54-80-figures';
import { assemblyCases, assemblyMinutes, depreciationCases, earningsCases, existingBuyers, salesCases, slaCases, stockCases } from './legacy-2011-autumn-am-54-80-models';
import { autumn2011Am5480Source as source } from './legacy-2011-autumn-am-54-80-source';

function diagram(profileIndex: number, index: number, caption: string) {
  const definition = figures[profileIndex];
  return figure(definition.profile, [index], caption, definition.alt([index]));
}
const numericOptions = (choices: number[]) => strings(choices.map(thousands));
function sla(i: number): GeneratedBody {
  const { start, end, days, availablePermille } = slaCases[i];
  const hours = (end - start) * days;
  const max = hours * (1000 - availablePermille) / 1000;
  const rate = availablePermille / 10;
  return {
    prompt: [p(source[57].prompt.replace('30日', days + '日')), p('〔SLAの条件〕'), list([
      `サービス時間帯は営業日の午前${start}時から午後${end - 12}時まで。`,
      `可用性${rate}％以上とすること。`,
    ])],
    choices: strings([...source[57].choices]), correctIndex: Math.floor(max) - 1,
    explanation: `1日${end - start}時間、${days}営業日のサービス提供時間は${hours}時間。停止できる割合は${(1000 - availablePermille) / 10}％なので、停止時間の上限は${max}時間である。整数の選択肢の中で、この上限を超えない最大の値は${Math.floor(max)}時間。`,
  };
}
function customers(i: number): GeneratedBody {
  const { current, rates, newcomers, claim } = salesCases[i];
  const existing = existingBuyers(i);
  const aq = current[0] * rates[0][1] / 10, ap = current[0] * rates[0][0] / 10;
  const cs = current[2] * rates[2][3] / 10;
  const bRate = rates[1].reduce<number>((sum, value) => sum + value, 0);
  const pTotal = existing[0] + newcomers[0];
  const truth = [aq === claim, bRate === 10, ap * 2 === pTotal, newcomers[3] < cs];
  const correctIndex = truth.indexOf(true);
  return {
    prompt: [...source[70].prompt.replace('10,000人，20,000人，80,000人', current.map(value => thousands(value) + '人').join('，')).split('\n').map(p),
      diagram(0, i, '既存顧客の新商品への移行割合と顧客人数')],
    choices: strings([source[70].choices[0].replace('1,000人', thousands(claim) + '人'), ...source[70].choices.slice(1)]),
    correctIndex,
    explanation: `Aの購入者のうちQへ移るのは${thousands(current[0])}×${rates[0][1] / 10}＝${thousands(aq)}人。Bの移行割合の合計は${bRate / 10}で、1に満たない。Pの購入見込者は既存と新規を合わせて${thousands(pTotal)}人、そのうちAから移るのは${thousands(ap)}人。CからSへ移る${thousands(cs)}人とSの新規${thousands(newcomers[3])}人を比較する。` +
      ['AからQへ移る人数が記述と一致する。', 'Bの購入者は全員が移行する。', 'Aから移る人数はPの購入見込者の半分に当たる。', 'Sの新規顧客人数の方が少ない。'][correctIndex],
  };
}
function assembly(i: number): GeneratedBody {
  const { hours, profit, cap } = assemblyCases[i];
  const byMinute = profit.map((value, product) => value / assemblyMinutes[product]);
  const optimum = [0, 1, 2].sort((a, b) => byMinute[b] - byMinute[a]);
  function assemble(order: number[]) {
    let remaining = hours * 60, total = 0;
    const quantities = [0, 0, 0];
    for (const product of order) {
      const count = Math.min(cap[product], Math.floor(remaining / assemblyMinutes[product]));
      quantities[product] = count;
      total += count * profit[product];
      remaining -= count * assemblyMinutes[product];
    }
    return { total, remaining, quantities };
  }
  const best = assemble(optimum);
  const options = [[2, 1, 0], [0, 2, 1], [1, 0, 2], [0, 1, 2]].map(order => assemble(order).total).sort((a, b) => a - b);
  return {
    prompt: [p(source[72].prompt.replace('200時間', hours + '時間')), diagram(1, i, '製品ごとの利益、組立て所要時間及び需要量上限')],
    choices: numericOptions(options), correctIndex: options.indexOf(best.total),
    explanation: `月間${hours}時間は${thousands(hours * 60)}分。1分当たりの利益はXが${byMinute[0]}円、Yが${byMinute[1]}円、Zが${byMinute[2]}円である。1分当たりの利益が高い製品から需要上限まで割り当てると、${best.quantities.map((value, product) => 'XYZ'[product] + '：' + thousands(value) + '個').join('、')}となり、余りは${best.remaining}分。端数なく使い切るので、他の製品へ時間を振り替えても利益は上がらない。合計${thousands(best.total)}円。`,
  };
}
function stock(i: number): GeneratedBody {
  const { carried, sales, inventory, target } = stockCases[i];
  const planned = sales.map((value, day) => value + inventory[day] - (day === 0 ? carried : inventory[day - 1]));
  const options = [...planned].sort((a, b) => a - b);
  const previous = target === 0 ? carried : inventory[target - 1];
  return {
    prompt: [p(source[73].prompt.replace('cは', 'abcd'[target] + 'は').replace('400個', carried + '個')), p('〔算出式〕'),
      p('生産計画 ＝ 販売計画 ＋ 在庫計画 − 繰越在庫'), diagram(2, i, '4日間の生産・販売・在庫計画')],
    choices: numericOptions(options), correctIndex: options.indexOf(planned[target]),
    explanation: `4月${target + 1}日の繰越在庫は${target === 0 ? '3月31日の実在庫' : '前日の在庫計画'}${previous}個。生産計画は販売計画${thousands(sales[target])}個に当日の在庫計画${inventory[target]}個を加え、繰越在庫${previous}個を引いた${thousands(planned[target])}個になる。他の日に同じ式を当てはめると${planned.map((n, day) => 'abcd'[day] + '＝' + thousands(n)).join('、')}。`,
  };
}
function depreciate(i: number): GeneratedBody {
  const { tenThousands, life, ratePermille, elapsed } = depreciationCases[i];
  const cost = tenThousands * 10000, annual = cost * ratePermille / 1000;
  const options = [4, 3, 2, 1].map(years => cost - annual * years);
  const stem = source[76].prompt.replace('100万円', tenThousands + '万円').replace('平成23年', '平成' + (21 + elapsed) + '年')
    .replace('耐用年数は6年', '耐用年数は' + life + '年').replace('0.167', (ratePermille / 1000).toFixed(3));
  return {
    prompt: [p(stem)], choices: numericOptions(options), correctIndex: options.indexOf(cost - annual * elapsed),
    explanation: `指定の定額法の償却率を取得価額に掛けると、1年分の減価償却費は${thousands(cost)}×${(ratePermille / 1000).toFixed(3)}＝${thousands(annual)}円。事業年度初日に購入し、指定の3月31日までに${elapsed}事業年度が終了している。したがって帳簿価額は取得価額から${elapsed}年分の償却額を引いた${thousands(cost - annual * elapsed)}円。`,
  };
}
function earnings(i: number): GeneratedBody {
  const { sales, variable, fixed, goal } = earningsCases[i];
  const contributionNumerator = sales - variable;
  const required = (goal + fixed) * sales / contributionNumerator;
  const currentProfit = sales - variable - fixed;
  const options = i === 0 ? source[77].choices.map(Number) : [
    sales + goal - currentProfit, required, sales + goal * sales / contributionNumerator,
    (goal + fixed * 2) * sales / contributionNumerator,
  ];
  return {
    prompt: [p(`売上高が${sales}百万円のとき，変動費が${variable}百万円，固定費が${fixed}百万円掛かる。変動費率，固定費は変わらないものとして，目標利益${goal}百万円を達成するのに必要な売上高は何百万円か。`)],
    choices: numericOptions(options), correctIndex: options.indexOf(required),
    explanation: `変動費率は${variable}÷${sales}＝${variable / sales}。売上高のうち${contributionNumerator / sales}が固定費と利益に充てられる。固定費${fixed}百万円と目標利益${goal}百万円の合計${fixed + goal}百万円をこの割合で割ると、必要な売上高は${required}百万円である。`,
  };
}
export const autumn2011Am5480Calculations = {
  57: { name: '営業時刻・可用性の条件', notes: '午前から午後までの営業時間、30日、99％台の可用性と1〜4時間の尺度順を保持。停止上限は1.5〜4.5時間。最大の整数選択肢として条件を評価する。', build: sla },
  70: { name: '旧商品3種から新商品4種への移行割合と新規人数', notes: '3×4の一桁小数の移行割合と千人単位の人数、既存・新規の人数行を保持。各行の割合合計が1以下で、Bは1未満。人数・全員・5割・大小の四つの検討対象を維持。', build: customers },
  72: { name: '工場の月間時間・1個利益・需要上限', notes: '分・時間・円・個の単位と並行不可を保持。1分当たりの利益が異なり、最適順では月間時間が端数なく埋まる。異なる製品優先順の四つの合計を同じ尺度で比較し、選択肢は原問と同じく最小15万円以上の間隔を取る。', build: assembly },
  73: { name: '初日実在庫・日別販売と在庫計画・問う日', notes: '4月1〜4日、繰越在庫の定義とa〜dの空欄位置を保持。4日間の生産計画値は重複せず、選択肢の最小間隔は原問の50個以上。', build: stock },
  76: { name: '取得価額・償却率・終了した事業年度数', notes: '平成21年4月1日に取得・残存価額0円の前提と、三桁小数の指定償却率を維持。1年〜4年分の各控除を尺度順に比較し、端数処理は追加しない。', build: depreciate },
  77: { name: '売上高・変動費・固定費・目標利益', notes: '百万円の整数値と一定の変動費率・固定費を維持。変動費率は0.5、0.6、0.75で、正答・可変選択肢は整数。可変の誤答は限界利益率の無視、目標利益の追加利益への取り違え、固定費の重複計上。', build: earnings },
} as const;
