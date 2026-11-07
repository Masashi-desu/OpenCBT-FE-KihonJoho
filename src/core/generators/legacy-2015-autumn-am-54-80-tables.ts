import { list, p, strings, table, type GeneratedBody } from './definition';
import { legacy2015AutumnAm5480Source as source } from './legacy-2015-autumn-am-54-80-source';

const roiBaseline = [
  [15, 30, 45, 30, 15],
  [105, 75, 45, 15, 0],
  [60, 75, 90, 75, 60],
  [105, 105, 105, 105, 105],
];
const roiAlternatives = [
  [120, 90, 60, 30, 0],
  [70, 90, 100, 90, 70],
  [115, 115, 115, 115, 115],
];

function roi(index: number): GeneratedBody {
  const { prompt, choices } = source[65];
  // The later IPA item uses an explicit no-discount assumption. Keep the
  // 2015 wording only in the literal reference case.
  const stem = index === 0 ? prompt : prompt.replace('内部収益率（IRR）は0とする。', '割引率は考慮しなくてよいものとする。');
  const investments = [100, 200, 300, 400];
  const profits = roiBaseline.map((row, i) => index > 0 && i === index ? roiAlternatives[index - 1] : row);
  const totals = profits.map(row => row.reduce((total, value) => total + value, 0));
  const rates = totals.map((total, i) => total / investments[i]);
  const correctIndex = rates.indexOf(Math.max(...rates));
  return {
    prompt: [
      p(stem),
      ...profits.map((row, i) => ({
        type: 'table' as const,
        caption: choices[i],
        captionPresentation: 'accessible' as const,
        sourceLabels: [{ position: 'start' as const, text: choices[i] }],
        columns: ['年目', '0', '1', '2', '3', '4', '5'],
        rows: [
          ['利益', '', ...row.map(String)],
          ['投資額', String(investments[i]), '', '', '', '', ''],
        ],
      })),
    ],
    choices: strings([...choices]),
    correctIndex,
    explanation: `ROI（Return On Investment，投資利益率）は，この表では5年間の利益合計を投資額で割って比較する。利益合計はa〜dの順に${totals.join('，')}，投資額は${investments.join('，')}なので，最も高いのは${choices[correctIndex]}である。`
      + (index === 0
        ? '原文はIRR（Internal Rate of Return，内部収益率）を0とする。IRRは投資と将来キャッシュフローの正味現在価値を0にする割引率であり，このROIの比較にその値を代入する必要はない。'
        : 'この改変問題では割引率を考慮しない前提を明示している。IRR（Internal Rate of Return，内部収益率）は将来キャッシュフローの正味現在価値を0にする割引率であり，割引を考慮しないこととは区別する。'),
  };
}

const tenders = [
  { budget: 1000, bids: [[700, 50], [800, 65], [900, 80], [1100, 100]] },
  { budget: 1000, bids: [[650, 64], [800, 65], [950, 90], [1050, 100]] },
  { budget: 800, bids: [[560, 50], [640, 75], [720, 80], [880, 100]] },
  { budget: 1000, bids: [[700, 50], [1050, 90], [850, 75], [1000, 100]] },
];
const numberWithGrouping = (value: number) => value.toLocaleString('en-US');

function tender(index: number): GeneratedBody {
  const { prompt, choices } = source[66];
  const { budget, bids } = tenders[index];
  const scores = bids.map(([price, technical]) => price > budget ? null : (budget - price) * 100 / budget + technical);
  const correctIndex = scores.indexOf(Math.max(...scores.map(score => score ?? -1)));
  return {
    prompt: [
      p(prompt),
      p('〔条件〕'),
      list([
        '価格点（100点満点）及び技術点（100点満点）を合算した総合評価点が最も高い入札者を落札者とする。',
        `予定価格を${numberWithGrouping(budget)}万円とする。予定価格を超える入札は評価対象とならない。`,
        '価格点は次の計算式で算出する。',
      ], true),
      { type: 'formula', text: '［1 −（入札価格／予定価格）］×100', alt: '1から入札価格を予定価格で割った値を引き，100を掛ける。', format: 'unicode' },
      table('〔A〜D社の入札価格及び技術点〕', ['', '入札価格（万円）', '技術点'],
        bids.map(([price, technical], i) => [choices[i], numberWithGrouping(price), String(technical)])),
    ],
    choices: strings([...choices]),
    correctIndex,
    explanation: `予定価格${numberWithGrouping(budget)}万円を超える入札を除く。同額の入札は評価対象である。価格点と技術点を足した総合評価点は，${scores.map((score, i) => `${choices[i]}が${score === null ? '評価対象外' : score + '点'}`).join('，')}。評価対象のうち最も高い${choices[correctIndex]}が落札者となる。`,
  };
}

const investmentPurpose = [
  { label: 'a', category: '業務効率化投資', kpis: '納期の遵守率，月次決算の所要日数', index: 0, explanation: '納期遵守と決算所要日数はいずれも業務の速さや確実性に関わる。' },
  { label: 'b', category: '情報活用投資', kpis: '提案事例の登録件数，顧客への提案件数', index: 2, explanation: '事例の登録と活用は，組織内で提案の知識を見える形にして共有することに関わる。' },
  { label: 'c', category: '戦略的投資', kpis: '新規事業のROI，新製品の市場シェア', index: 3, explanation: '新規事業の投資利益率と新製品の市場シェアは，新たな事業の成果と競争上の位置に関わる。' },
  { label: 'd', category: 'IT基盤投資', kpis: 'システムの障害件数，検索の応答時間', index: 1, explanation: '障害件数と検索応答時間は，基盤の維持管理や処理性能の指標である。' },
];
const kpiCases = [2, 0, 1, 3];

function kpi(index: number): GeneratedBody {
  const { prompt, choices } = source[70];
  const target = investmentPurpose[kpiCases[index]];
  return {
    prompt: [
      p(prompt.replace('投資目的のc', `投資目的の${target.label}`)),
      {
        type: 'table',
        caption: '投資目的・投資分類・KPI',
        captionPresentation: 'accessible',
        columns: ['投資目的', '投資分類', 'KPI'],
        rows: investmentPurpose.map(row => [row.label, row.category, row.kpis]),
      },
    ],
    choices: strings([...choices]),
    correctIndex: target.index,
    explanation: `KPI（Key Performance Indicator，重要業績評価指標）は目標の達成度を測る指標である。${target.label}は${target.category}に当たり，${target.explanation}したがって目的は「${choices[target.index]}」である。ROIはReturn On Investment（投資利益率）を指す。`,
  };
}

const depreciationCases = [[30, 3], [34, 3], [18, 2], [26, 3]];

function depreciation(index: number): GeneratedBody {
  const { prompt } = source[77];
  const [cost, years] = depreciationCases[index];
  const sale = 1;
  const annual = cost / 4;
  const book = cost - years * annual;
  const loss = book - sale;
  const choices = [book - 1.5, loss, book - 0.5, book].map(value => value.toFixed(1));
  return {
    prompt: [p(prompt.replace('30万円', `${cost}万円`).replace('3年後', `${years}年後`))],
    choices: strings(choices),
    correctIndex: choices.indexOf(loss.toFixed(1)),
    explanation: `定額法では，毎年の償却額は取得価額${cost}万円に償却率0.250を掛けた${annual}万円である。${years}年後の帳簿価額は${cost}−${annual}×${years}＝${book}万円。売却額${sale}万円を差し引くと，売却損は${loss.toFixed(1)}万円になる。帳簿価額だけでは売却額を反映しない。`,
  };
}

const inventories = [
  { quantities: [10, 1, 2, 3, 4], prices: [10, 11, 12, 13, 14], ending: 12 },
  { quantities: [9, 1, 2, 3, 5], prices: [10, 11, 12, 13, 14], ending: 10 },
  { quantities: [10, 1, 3, 2, 4], prices: [8, 10, 12, 14, 16], ending: 10 },
  { quantities: [8, 2, 3, 3, 4], prices: [10, 12, 13, 15, 17], ending: 10 },
];

function inventory(index: number): GeneratedBody {
  const { prompt } = source[78];
  const { quantities, prices, ending } = inventories[index];
  const totalQuantity = quantities.reduce((sum, quantity) => sum + quantity, 0);
  const cost = quantities.reduce((sum, quantity, i) => sum + quantity * prices[i], 0);
  const endingLots = quantities.map((quantity, i) => {
    const laterQuantity = quantities.slice(i + 1).reduce((sum, value) => sum + value, 0);
    return Math.min(quantity, Math.max(0, ending - laterQuantity));
  });
  const fifo = endingLots.reduce((sum, quantity, i) => sum + quantity * prices[i], 0);
  const choices = [ending * prices[1], ending * cost / totalQuantity, fifo, ending * prices[4]];
  const calculation = endingLots.map((quantity, i) => quantity ? `${quantity}×${prices[i]}` : '').filter(Boolean).join('＋');
  return {
    prompt: [
      p(prompt),
      {
        type: 'table',
        caption: '期首在庫・仕入・期末在庫',
        captionPresentation: 'accessible',
        columns: ['摘要', '数量（個）', '単価（千円）'],
        rows: [
          ...['期首在庫', '仕入 4月', '仕入 6月', '仕入 7月', '仕入 9月'].map((label, i) => [label, String(quantities[i]), String(prices[i])]),
          ['期末在庫', String(ending), ''],
        ],
      },
    ],
    choices: strings(choices.map(String)),
    correctIndex: choices.indexOf(fifo),
    explanation: `先入先出法では受入れが古い品から払い出すので，期末の${ending}個は新しい受入分から数える。残るロットの数量と単価を掛けると，${calculation}＝${fifo}千円である。期首と仕入全体の平均単価を使う方法や，一つの仕入単価を全個数に当てはめる方法とは異なる。`,
  };
}

export const legacy2015AutumnAm5480Tables: Partial<Record<number, { build: (index: number) => GeneratedBody; notes: string }>> = {
  65: { build: roi, notes: '原資料p.29と基準入力0ではIRR＝0の原注記をそのまま保つ。生成入力1〜3は2019年度春期旧午前問65と同じく，割引率を考慮しない前提を明示する改変。IRRの定義は国土交通省CRE戦略実践ガイドライン2010改訂版p.86を参照する。年目0〜5，4表，空欄と数値0，a〜dの順を保ち，利益構成を変える。利益合計と正の投資額を丸めずに比較する。' },
  66: { build: tender, notes: '上限を超える入札の除外，各100点満点，元の式，表とA〜D社の順を保つ。同額境界も含め，整数で比較できて最大が一意な4条件。' },
  70: { build: kpi, notes: '四分類のKPI表とア〜エはa〜dのいずれかという注記を保ち，対象行を本文で変える。a〜dと選択肢の照合順は固定。' },
  77: { build: depreciation, notes: '2015年4月，定額法，耐用年数4年，0.250，残存0を保ち，取得額と経過年を変更。売価1万円と原の0.5万円刻みを保持し，簿価と売却差額の混同を検査する。' },
  78: { build: inventory, notes: '原の期首・仕入4回・期末の表と個・千円を維持し，数量・単価・期末在庫を変える。仕入結合セルは該当する各月の行ラベルで明示。正答と総平均・単一仕入単価の誤答が整数で，原の最小間隔6千円以上となる4条件。' },
};
