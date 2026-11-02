import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, table, type GeneratedBody } from './definition';
import { autumn2016Pm0508Index, autumn2016Pm0508NativeBody, autumn2016Pm0508Body, autumn2016Pm0508Figure, paragraphChoices } from './legacy-2016-autumn-pm-05-08-shared';

export const autumn2016Pm7ABank = ['(1)と(2)の二つだけ', '(1)と(3)の二つだけ', '(2)と(3)の二つだけ', '(1)〜(3)の全て'];
export const autumn2016Pm7BBank = ['本業で得た利益に加えて，銀行からの借入れを増やして投資', '本業で得た利益に加えて，手持ちの資産を現金化して債務返済や株主還元', '本業で得た利益を投資に回すとともに，債務返済や株主還元'];
export const autumn2016Pm7CBank = ['FCFだけは', '売上高営業利益率と総資産経常利益率だけは', '売上高営業利益率，総資産経常利益率及びFCFの全てを'];
export const autumn2016Pm7BaseMoneyChoices = [9.09, 9.84, 10, 10.03, 10.5, 10.82, 11, 11.03, 11.55, 12.1];
export function autumn2016Pm7Model(values: number[]) {
  const index = autumn2016Pm0508Index(values), scale = index + 1, fcf = 10 * scale;
  const flows = [fcf * 1.1];
  for (let i = 1; i < 7; i++) flows.push(flows.at(-1)! * (i <= 3 ? 1.05 : 1.03));
  return { index, scale, fcf, flows, moneyChoices: autumn2016Pm7BaseMoneyChoices.map(value => (value * scale).toFixed(2)) };
}
export const autumn2016Pm7ForecastAlt = (values: number[]) => {
  const m = autumn2016Pm7Model(values);
  return `表4。年度2017、2018、2019、2020、2021、2022、2023、…。FCFの2017、2019、2020は網掛けで非表示、2018は空欄d、2021は${m.flows[4].toFixed(2)}、2022は${m.flows[5].toFixed(2)}、2023は${m.flows[6].toFixed(2)}、以降は…。単位億円。非表示の数字を解答前に補わない。`;
};
export function autumn2016Pm7RawBody(values: number[]): GeneratedBody {
  const m = autumn2016Pm7Model(values), k = m.scale;
  const g = [
    'B社がT社の企業価値を算出するときに使っている割引率を0.12に上げる。',
    'T社の2016年度の銀行からの借入れの予測額を減らす。',
    'T社の2016年度の設備投資の予測額を増やす。',
    'T社の2016年度の販管費の予測額を減らす。',
  ];
  return autumn2016Pm0508Body([
    p('問7 業務提携と出資の検討に関する次の記述を読んで，設問1〜3に答えよ。'),
    p('消費財メーカのB社は，同業のT社との物流業務での提携を考えており，そのためにT社への出資を検討している。B社では，T社への出資額を算定するための準備として，T社の財務状況を調査して，企業価値を算出することになった。表1〜3は，B社が入手したT社の2016年度の損益計算書，貸借対照表及びキャッシュフロー（以下，CFという）計算書の予測である。'),
    table('表1 T社の2016年度の損益計算書の予測（単位：億円）', ['項目', '予測額'], [
      ['売上高', String(120 * k)], ['売上総利益', String(40 * k)], ['営業利益', String(7 * k)],
      ['経常利益', String(9 * k)], ['税引き前純利益', String(10 * k)], ['税引き後純利益', String(7 * k)],
    ]),
    table('表2 T社の2016年度の貸借対照表の予測（単位：億円）', ['項目', '予測額'], [['流動資産', String(50 * k)], ['固定資産', String(100 * k)], ['流動負債', String(40 * k)], ['固定負債', String(30 * k)], ['純資産', String(80 * k)]]),
    table('表3 T社の2016年度のCF計算書の予測（単位：億円）', ['項目', '予測額'], [['営業活動によるCF', String(15 * k)], ['投資活動によるCF', String(-5 * k)], ['財務活動によるCF', String(-3 * k)]]),
    p('設問1 表1〜3に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。'),
    p('B社では，出資する相手企業が次の条件（以下，出資条件という）のうち二つ以上満たすことを，出資の検討を進めるための要件としている。'),
    p('(1) 売上高営業利益率が5%以上である。'), p('(2) 総資産経常利益率が5%以上である。'),
    p('(3) 営業活動によるCFと投資活動によるCFの和（以下，FCFという）が負でない。'),
    p('表1〜3から，T社は出資条件の［a］を満たしている。この結果から，B社では，T社への出資の検討を進めることにした。'),
    p('また，B社は，T社の営業活動によるCFが正で，投資活動によるCFと財務活動によるCFが負であることから，T社は［b］を進めている企業と考えた。'),
    p('B社では，物流業務での提携に加えて，T社の情報システムの一部を廃止してB社の情報システムを利用することを検討している。これによってT社のシステム運用保守費を削減し，T社の販売費及び一般管理費（以下，販管費という）を圧縮できると想定しており，T社の売上高や総資産が変わらなければ［c］上げられると考えている。'),
    p('設問2 T社の企業価値の算出に関する次の記述中の［空欄］に入れる適切な答えを，解答群の中から選べ。'),
    p('B社では，各年度のFCFの現在価値を合計することで企業価値を算出している。そこで，B社は，T社の企業価値を算出する準備として，T社の今後のFCFを次のように予測した。ここで，T社との業務提携と出資は2017年度の初日に行われるものとする。'),
    p('(1) B社との業務提携によって，初年度（2017年度）に10%増加する。'),
    p('(2) 2018年度から2020年度まで年率5%で増加する。'), p('(3) 2021年度から2023年度まで年率3%で増加する。'), p('(4) 2024年度からは一定である。'),
    p('表4は，これらに基づくT社の各年度のFCFの予測である。'),
    autumn2016Pm0508Figure(7, 'forecast', [m.index], '表4 T社の各年度のFCFの予測（単位：億円）', autumn2016Pm7ForecastAlt(values)),
    p('注記 網掛けの部分は表示していない。'),
    p('B社では，企業価値の算出に，割引率を使った現在価値の考え方を用いている。この考え方によると，割引率をrとして1年複利で計算し，n年後のFCFをCで表すとき，その現在価値は，C/(1＋r)ⁿと表される。B社は，T社の企業価値を算出するために，各年度のFCFについて割引率を0.1として現在価値を計算した。'),
    p('2017年度のFCFの2016年度末時点の現在価値は，［e］である。ここで，各年度のFCFは各年度末に発生すると考える。'),
    p('T社の企業価値は，B社と業務提携することによって大きくなると予想される。誤って，割引率を考慮せずに各年度のFCFをそのまま合計して，B社で定義している企業価値よりも［f］計算してしまわないように，B社では定期的に担当者教育をしている。'),
    p('設問3 B社では，様々な条件を変更してT社の企業価値（各年度のFCFの現在価値の合計）がどのように変化するかを検証した。条件を変更する前に比べてT社の企業価値が大きくなるものを，解答群の中から選べ。'),
  ], [
    { id: 'a', choices: paragraphChoices(autumn2016Pm7ABank) }, { id: 'b', choices: paragraphChoices(autumn2016Pm7BBank) }, { id: 'c', choices: paragraphChoices(autumn2016Pm7CBank) },
    { id: 'de', choices: paragraphChoices(m.moneyChoices) }, { id: 'f', choices: paragraphChoices(['大きく', '小さく']) }, { id: 'g', choices: paragraphChoices(g) },
  ], [
    { id: 'a', bank: 'a', correct: 3 }, { id: 'b', bank: 'b', correct: 2 }, { id: 'c', bank: 'c', correct: 2 },
    { id: 'd', bank: 'de', correct: 8 }, { id: 'e', bank: 'de', correct: 2 }, { id: 'f', bank: 'f', correct: 0 }, { id: 'g', label: '設問3', bank: 'g', correct: 3 },
  ], `売上高営業利益率は${7 * k}/${120 * k}で5%以上，総資産は${150 * k}億円なので総資産経常利益率は${9 * k}/${150 * k}＝6%。FCFは${15 * k}＋(${ -5 * k})＝${m.fcf}億円で負でないから三条件全てを満たす。営業CFは資金獲得，投資CF負は投資，財務CF負は債務返済・株主還元を示す。販管費の削減は営業利益と経常利益，営業CFを増やし，売上高・総資産が不変なら両利益率とFCFが上がる。dは${m.fcf}×1.10×1.05＝${m.moneyChoices[8]}億円，eは初年度末の${(m.fcf * 1.1).toFixed(2)}÷1.1＝${m.moneyChoices[2]}億円。二年分を割り引いたり初年度増加を二回適用する選択肢とは異なる。将来の正のCFは割引前の名目額より現在価値が小さい。割引率上昇は価値を下げ，借入れの変化は定義したFCFに直接入らず，設備投資増加は投資CFを減らす。販管費削減はFCFと企業価値を増やす。`);
}
export const autumn2016Pm7Body = (values: number[]): GeneratedBody => autumn2016Pm0508NativeBody(7, values, autumn2016Pm7RawBody(values));
export const legacy2016AutumnPm7Definition: AfternoonBookletDefinition = {
  source: '2016h28a-fe-pm-7', title: '業務提携の財務指標とFCFの現在価値', version: '3.3.0', reference: [0], fields: [field('財務三表の金額規模', 0, 3)],
  sourceAnswer: 'エ／ウ／ウ／ケ／ウ／ア／エ',
  notes: '原4頁、7解答欄、d/e共有10択を保持。金額1〜4倍の4条件、単位億円/既存2小数表示を維持。比率/FCF定義/3成長区間/年末発生/2016末基準/割引率0.1/2024以降一定/表4非表示を解答前に保持。独立分数と逐年割引で全択・成長境界・誤差と会計CFを検算する。',
  publicNotes: '原の財務指標・将来CF・現在価値の設問構成と共有解答群を保ち，三表と対応する金額を同じ倍率で変更した問題です。', build: autumn2016Pm7Body,
};
