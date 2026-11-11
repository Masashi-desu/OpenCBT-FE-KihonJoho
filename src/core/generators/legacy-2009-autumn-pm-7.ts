import { p, table } from './definition';
import { bankAt, common, indexOfCase, pairedAnswers, readPrompt, type Page } from './legacy-2009-autumn-pm-05-08-shared';

const cases = [
  { business:'日用品メーカ', firm:'T社', sales:4000, material:2000, cost:3000, indirect:800, dev:[50,30,8], operating:[2,2,0.4], increase:3, saving:2, labour:5 },
  { business:'文具メーカ', firm:'N社', sales:5000, material:2500, cost:3500, indirect:1200, dev:[60,75,10], operating:[3,5,1], increase:4, saving:2, labour:6 },
  { business:'家庭用品メーカ', firm:'K社', sales:6000, material:3000, cost:4500, indirect:1100, dev:[70,180,15], operating:[4,6,1], increase:4, saving:2, labour:7 },
  { business:'事務機器メーカ', firm:'P社', sales:4500, material:2000, cost:3000, indirect:1000, dev:[40,105,9], operating:[3,2,0.7], increase:4, saving:2, labour:6 },
] as const;

const format = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 3 });
const periods = ['1年未満','1年以上2年未満','2年以上3年未満','3年以上'];

function results(index: number) {
  const c = cases[index];
  const gross = c.sales - c.cost;
  const annualSavings = c.material * c.saving / 100;
  const afterOperating = annualSavings - c.operating[1];
  const payback = c.dev[1] / afterOperating;
  const charges = c.dev.map((value, i) => value / 5 + c.operating[i]);
  const netIncrease = gross * c.increase / 100 - charges[0];
  const labourSavings = c.labour - charges[2];
  const bonus = annualSavings * c.increase / 100;
  return { c, gross, annualSavings, afterOperating, payback, charges, netIncrease, labourSavings, bonus };
}

export function effectBanks(index: number) {
  const { c, gross, charges, netIncrease, labourSavings } = results(index);
  const extraSales = c.sales * c.increase / 100;
  const combination = (name: string, value: number) => name+'を'+format(value)+'百万円削減でき，営業利益効果は'+format(value)+'百万円';
  return [
    ['効果が開発費と運用費の合計を上回る','効果が開発費と運用費の合計を下回る','効果と運用費の合計が開発費を上回る','効果と運用費の合計が開発費を下回る'],
    periods,
    [netIncrease, gross*c.increase/100, extraSales-charges[0], extraSales].map(format),
    ['売上原価','売上総利益','売上高','営業利益','販管費'],
    [combination('売上原価',labourSavings),combination('売上原価',c.labour),combination('販管費',labourSavings),combination('販管費',c.labour)],
    ['売上高売上原価率の上昇','売上高売上原価率の低下','売上高の増加','売上高の減少'],
    ['と等しい','を上回る','を下回る'],
  ];
}

export function effectPages(index: number): readonly Page[] {
  const { c, gross, charges, annualSavings } = results(index);
  const unit = (amount: number) => format(amount)+'百万円';
  return [[29, [
    p('問7　情報システムの効果見積りに関する次の記述を読んで，設問1，2に答えよ。'),
    p(c.business+'である'+c.firm+'の売上高は年間'+unit(c.sales)+'，製品の製造に要する資材の調達費（以下，資材調達費という）は年間'+
      unit(c.material)+'である。'+c.firm+'の企画課では，開発を予定している営業支援システム，資材調達システム，契約管理システムの効果を見積もることになった。各システムの概要を，表1に示す。'),
    table('表1　各システムの概要',['システム名','営業支援システム','資材調達システム','契約管理システム'],[
      ['システム概要','市場，顧客，自社商品などの情報を営業員に提供する。','製品製造に必要となる資材最適量を自動計算する。','契約書を一元管理し，その検索や維持更新を効率的に行う。'],
      ['主管部署','営業課','資材課','法務課'],
      ['開発費（百万円）',...c.dev.map(format)],['年間運用費（百万円）',...c.operating.map(format)],
      ['効果見積り','販売量増加によって，年間の売上高を'+c.increase+'％増加','年間の資材調達費を'+c.saving+'％削減','法務の年間労務費を'+unit(c.labour)+'削減'],
    ]),
    p('設問1　資材調達システムの投資回収期間に関する次の記述中の［a］，［b］に入れる正しい答えを，解答群の中から選べ。'),
    p('企画課では，資材調達システムについて，開発と運用のための投資を回収できるまでの期間（以下，投資回収期間という）を，年間の売上高が今後も一定であるとして計算した。資材調達システムの投資回収期間は，見積もった［a］までの期間を計算することで求められる。資材調達システムの投資回収期間は，［b］である。'),
    bankAt(0,'aに関する解答群'),
  ]],[30, [
    bankAt(1,'bに関する解答群'),
    p('設問2　各システムの期待効果に関する次の記述中の［c］～［g］に入れる正しい答えを，解答群の中から選べ。'),
    p('企画課では，各システムの効果見積りを，営業利益における期待効果（以下，営業利益効果という）として計算することにした。各システムの開発費は5年で定額償却する。また，減価償却費とシステムの運用費は，販売費及び一般管理費（以下，販管費という）に計上する。'),
    p(c.firm+'の年間損益計算の抜粋を，表2に示す。'),
    table('表2　'+c.firm+'の年間損益計算（抜粋）',['項目','金額（百万円）','補足'],[
      ['売上高',format(c.sales),''],['売上原価',format(c.cost),'製品の製造にかかる資材調達費，その他の関連費用'],
      ['売上総利益',format(gross),'売上高－売上原価'],
      ['販管費',format(c.indirect),'資材の調達や製品の製造にかかった以外の費用'],
      ['営業利益',format(gross-c.indirect),'売上総利益－販管費'],
    ]),
    p('〔営業支援システムを開発した場合〕'),
    p('営業支援システムの効果は売上の増加であるが，売上高が増えると，それに伴って資材調達などにかかる売上原価も増える。さらに，営業支援システムの利用に伴って，減価償却費や運用費が発生する。営業支援システムの開発によって，売上高売上原価率（売上原価÷売上高）は変わらず，販管費は減価償却費'+
      unit(c.dev[0]/5)+'と運用費'+unit(c.operating[0])+'を合わせて'+unit(charges[0])+'増えるので，営業利益効果は，［c］百万円となる。'),
  ]],[31, [
    p('〔資材調達システムを開発した場合〕'),
    p('資材調達システムの効果見積りは資材調達費の'+c.saving+'％削減なので，［d］を'+unit(annualSavings)+'削減できる。資材調達システムの利用によって，販管費は減価償却費'+
      unit(c.dev[1]/5)+'と運用費'+unit(c.operating[1])+'を合わせて'+unit(charges[1])+'増えるので，営業利益効果は'+unit(annualSavings-charges[1])+'となる。'),
    p('〔契約管理システムを開発した場合〕'),
    p('契約管理システムの利用によって，間接部門である法務課の労務費を'+unit(c.labour)+'削減できる。一方，減価償却費'+
      unit(c.dev[2]/5)+'と運用費'+unit(c.operating[2])+'を合わせて'+unit(charges[2])+'が発生する。したがって，［e］となる。'),
    p('〔営業支援システムと資材調達システムを開発し，同時に利用した場合〕'),
    p('資材調達システムの利用によって［f］が期待できる。営業支援システムを開発した場合の営業利益効果は，売上高売上原価率が変わらないという前提で計算したが，［f］によって［c］百万円［g］営業利益効果となる。したがって，営業支援システムと資材調達システムを開発し同時に利用することで得られる営業利益効果は，それぞれの営業利益効果の合計［g］。'),
    bankAt(2,'cに関する解答群'), bankAt(3,'dに関する解答群'), bankAt(4,'eに関する解答群'),
  ]],[32, [bankAt(5,'問7 設問2 各システムの期待効果（続き）。fに関する解答群'), bankAt(6,'gに関する解答群')]]];
}

export const effectDefinition = common(7,'情報システムの投資回収と営業利益効果','費用・売上高・原価と期待する削減額',
  '公式p29–32。開発・運用の累計、損益計算、5年定額償却、資材費と販管費の区分、売上と原価率の相乗効果を同じ欄と表に保持する。',
  '3システムの比較表を保ち，開発費・運用費・売上高・原価と効果の数値を変更しました。', values => {
    const index = indexOfCase(values);
    const { c, gross, afterOperating, payback, charges, annualSavings, netIncrease, labourSavings, bonus } = results(index);
    const duration = Math.min(3, Math.floor(payback));
    return {
      prompt: readPrompt(effectPages(index)), ...pairedAnswers(effectBanks(index),[0,1,2,3,4,5,6],[0,duration,0,0,2,1,1]),
      explanation: [
        'a，b：毎年の資材費削減'+format(annualSavings)+'百万円から運用費を差し引くと'+format(afterOperating)+
          '百万円。開発費'+format(c.dev[1])+'百万円をその累積が上回るまでの期間は約'+format(payback)+'年なので，'+periods[duration]+'である。',
        'c：売上原価率が変わらないと売上総利益'+format(gross)+'百万円も'+c.increase+'％増加する。そこから償却と運用の'+
          format(charges[0])+'百万円を差し引くので，営業利益は'+format(netIncrease)+'百万円増える。',
        'd：製造資材の調達費は売上原価に含まれる。',
        'e：法務課は間接部門なので労務費の減少は販管費の減少となる。新しい償却・運用を差し引いた純額は'+format(labourSavings)+'百万円である。',
        'f，g：資材費が下がれば売上高に対する原価の比率が下がる。売上増加分に対応する資材にも削減が及ぶので，相乗分は'+
          format(bonus)+'百万円となり，併用の営業利益効果は単独の効果の合計を上回る。',
      ].join('\n'),
    };
  });
