import { figure, p, strings, type GeneratedBody } from './definition';
import { autumn2012Am5480Profiles as profiles, legacy2012AutumnAm5480Figures as figures } from './legacy-2012-autumn-am-54-80-figures';
import { backupIntervals, demandCases, investments, profitSeries, quantities, scatterCases, scatterPoints, sellingProbabilities } from './legacy-2012-autumn-am-54-80-models';
import { autumn2012Am5480Source as source } from './legacy-2012-autumn-am-54-80-source';

function diagram(profile: string, values: number[], caption: string) {
  const definition = figures.find(item => item.profile === profile)!;
  return figure(profile, values, caption, definition.alt(values));
}

function backup(index: number): GeneratedBody {
  const { interval, inverse } = backupIntervals[index];
  const stem = source[54].prompt.replace('今までの2倍', `今までの${interval}`);
  const choices = [
    `ジャーナル情報によって復旧するときの処理時間が平均して約${interval}になる。`,
    `フルバックアップ1回当たりの磁気テープ使用量が約${interval}になる。`,
    `フルバックアップ1回当たりの磁気テープ使用量が約${inverse}になる。`,
    `フルバックアップ取得の平均実行時間が約${interval}になる。`,
  ];
  return { prompt: [p(stem)], choices: strings(choices), correctIndex: 0,
    explanation: `変更が一定の頻度なら、復旧時に再実行するジャーナルは、前回取得から障害までの平均経過時間にほぼ比例する。取得間隔を${interval}にすると、その処理時間は平均で約${interval}になる。1回のフルバックアップはデータベース全体をコピーするので、変更が少ないという前提では1回分の媒体量や取得時間は間隔の倍率には比例しない。` };
}

function compareInvestments(index: number): GeneratedBody {
  const totals = profitSeries[index].map(profits => profits.reduce<number>((sum, value) => sum + value, 0));
  const ratios = totals.map((total, i) => total / investments[i]);
  const correctIndex = ratios.indexOf(Math.max(...ratios));
  const stem = 'IT投資案件において，5年間の投資効果をROI（Return On Investment）で評価した場合，四つの案件a〜dのうち，最も効果が高いものはどれか。ここで，各年の利益は割引しない。';
  const detail = totals.map((total, i) => `${'abcd'[i]}：${total}÷${investments[i]}`).join('、');
  return {
    prompt: [p(stem), diagram(profiles.investment, [index], '投資案件の利益と投資額')],
    choices: strings([...source[64].choices]), correctIndex,
    explanation: `ROI（Return On Investment、投資利益率）は投資額に対する利益の比で比較する。この設問では各年を割引せず、5年分の利益の単純合計を年0の投資額で割る。${detail}のうち最大は案件${'abcd'[correctIndex]}である。原冊子の「内部収益率（IRR）は0」は割引を行わない前提として比較した。IRR（Internal Rate of Return、内部収益率）は正味現在価値（NPV、Net Present Value）を0にする率であり、ここで比較するROIとは異なる。`,
  };
}

function expectedProfit(index: number): GeneratedBody {
  const { margin, waste } = demandCases[index];
  const expected = sellingProbabilities(index).map((row, i) => row.reduce<number>((sum, probability, sold) =>
    sum + (probability ?? 0) * (margin * quantities[sold] - waste * (quantities[i] - quantities[sold])), 0) / 100);
  const correctIndex = expected.indexOf(Math.max(...expected));
  const stem = `商品の1日当たりの販売確率が表のとおりであるとき，1個当たりの利益を${margin.toLocaleString('ja-JP')}円とすると，利益の期待値が最大になる仕入個数は何個か。ここで，売れ残った場合，1個当たり${waste}円の廃棄ロスが出るものとする。`;
  return {
    prompt: [p(stem), diagram(profiles.sales, [index], '仕入個数別の販売確率')], choices: strings([...source[76].choices]), correctIndex,
    explanation: `各販売個数で，販売分の利益（1個${margin}円）から売れ残りの廃棄ロス（1個${waste}円）を引き，その値に確率を掛けて足す。期待値は${expected.map((value, i) => quantities[i] + '個：' + value.toLocaleString('ja-JP') + '円').join('、')}。最大になる仕入個数は${quantities[correctIndex]}個である。`,
  };
}

function correlation(index: number): GeneratedBody {
  const { axes, relationship } = scatterCases[index];
  const direction = relationship === '正' ? 1 : -1;
  // Both oblique clusters have clear monotone trends; the other groups
  // are curved or disperse without a comparable monotone trend.
  const scores = [...source[77].choices].map((_, panel) => {
    const points = scatterPoints(index, panel);
    const meanX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
    const meanY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
    const products = points.map(([x, y]) => [(x - meanX) ** 2, (y - meanY) ** 2, (x - meanX) * (y - meanY)]);
    const [xx, yy, xy] = products.reduce((sums, row) => sums.map((sum, i) => sum + row[i]), [0, 0, 0]);
    return direction * xy / Math.sqrt(xx * yy);
  });
  const correctIndex = scores.indexOf(Math.max(...scores));
  const context = axes ? `横軸を${axes[0]}，縦軸を${axes[1]}とした` : '';
  const horizontal = axes?.[0] ?? '横の値';
  const vertical = axes?.[1] ?? '縦の値';
  return {
    prompt: [p(`${context}散布図のうち，“${relationship}の相関”を示すものはどれか。`)],
    choices: [...source[77].choices].map((_, panel) => [diagram(profiles.scatter, [index, panel], '散布図')]), correctIndex,
    explanation: `${relationship}の相関は，${horizontal}が大きい点ほど${vertical}が${direction === 1 ? '大きく' : '小さく'}なる傾向である。「${'アイウエ'[correctIndex]}」の点群がその向きに斜めに並んでいる。逆向きの傾きや，曲線状・まとまらない点群は，この向きに一貫して変わる点群と区別する。`,
  };
}

export const autumn2012Am5480Calculations = {
  54: { name: 'フルバックアップの取得間隔の倍率', count: backupIntervals.length,
    notes: '定頻度で少数の追加・変更・削除、磁気テープ、1回分のフル取得と復旧の違いを維持。間隔を2倍・3倍・半分・3分の1にし、平均ジャーナル適用時間の比と媒体量・取得時間の誤答を同じ倍率で更新する。正答の役割は平均適用時間に固定し、正答の内容は倍率で変わる。', build: backup },
  64: { name: '4案件の5年間の利益配列', count: profitSeries.length,
    notes: '案件a〜d、年0の投資額、各5年間の利益、空欄、選択肢の参照順を維持。元のIRR=0の注記を、生成時には年ごとに割引しない前提と明示。原問の最大と次点は3.75ポイント差、生成入力は少なくとも10ポイント差を保ち、4つの投資額で単純な比を比較できる値域にする。', build: compareInvestments },
  76: { name: '仕入4〜7個の需要分布・利益・廃棄ロス', count: demandCases.length,
    notes: '行と列を原問の4〜7個に固定。仕入上限を超える需要の確率を売切れ列へ合算して原資料と同じ三角表を作る。原問と同程度の円単位と整数％で計算し、正答4〜7すべてを成立させる。', build: expectedProfit },
  77: { name: '相関の向きと4つの散布図の点配置', count: scatterCases.length,
    notes: '選択肢は4枚とも座標散布図。原図の概数から2つの斜めの群、曲線群、散在群と目盛を維持。本文で相関の正負と測定対象を変え、図では軸名を同期して点群の上下反転と平行移動を行う。点に相関の判定結果は付けない。', build: correlation },
} as const;
