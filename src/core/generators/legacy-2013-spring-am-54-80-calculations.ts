import { figure, p, strings, type GeneratedBody } from './definition';
import { legacy2013SpringAm5480Figures, spring2013Am5480Profiles as profiles } from './legacy-2013-spring-am-54-80-figures';
import {
  existingByNewProduct, numberJa, spring2013AmContractCases, spring2013AmProfitInputs, spring2013AmTransitions, transitionCustomers,
} from './legacy-2013-spring-am-54-80-models';
import { spring2013Am5480Source as source } from './legacy-2013-spring-am-54-80-source';

function diagram(profile: string, index: number, caption: string) {
  const alt = legacy2013SpringAm5480Figures.find(item => item.profile === profile)!.alt([index]);
  return figure(profile, [index], caption, alt);
}

function customers(index: number): GeneratedBody {
  const data = spring2013AmTransitions[index];
  const buyAQ = transitionCustomers(data, 0, 1);
  const buyAP = transitionCustomers(data, 0, 0);
  const buyCS = transitionCustomers(data, 2, 3);
  const bTotal = data.rates[1].reduce((sum, share) => sum + share, 0);
  const allP = existingByNewProduct(data, 0) + data.incoming[0] * 1000;
  const newS = data.incoming[3] * 1000;
  const claimedAQ = data.claimedAQ * 1000;
  const choices = source[69].choices.map((choice, i) => i === 0 ? choice.replace('1,000', numberJa(claimedAQ)) : choice);
  const [a, b, c] = data.existing.map(count => numberJa(count * 1000));
  const purchaseLimit = bTotal === 10 ? 'ここで，商品体系変更後に各顧客が購入する新商品は多くても1種類とする。' : '';
  const prompt = index === 0 ? source[69].prompt :
    `${data.company}社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月${a}人，${b}人，${c}人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，現在の顧客が新商品を購入する割合と新規の顧客数を試算した。${purchaseLimit}この試算について，適切な記述はどれか。`;
  const correctIndex = [buyAQ === claimedAQ, bTotal === 10, buyAP * 2 === allP, newS < buyCS].indexOf(true);
  return {
    prompt: [p(prompt), diagram(profiles.transition, index, '既存顧客の移行割合と新規顧客数')],
    choices: strings(choices),
    correctIndex,
    explanation: `商品Aから新商品Qへの移行人数は${a}×${(data.rates[0][1] / 10).toFixed(1)}＝${numberJa(buyAQ)}人である。商品Bからの移行割合の合計は${(bTotal / 10).toFixed(1)}。新商品Pの購入見込者${numberJa(allP)}人のうち，商品Aの購入者は${numberJa(buyAP)}人である。新商品Sの新規顧客は${numberJa(newS)}人で，商品Cから新商品Sへの移行人数は${c}×${(data.rates[2][3] / 10).toFixed(1)}＝${numberJa(buyCS)}人である。これらを比較すると「${choices[correctIndex].replace(/。$/, '')}」が成立する。`,
  };
}

function profit(index: number): GeneratedBody {
  const { material, equipment, gainA, gainB, fourthModel } = spring2013AmProfitInputs[index];
  const unitsOnlyA = Math.floor(Math.min(material / 2, equipment / 3));
  const unitsOnlyB = Math.floor(Math.min(material / 4, equipment / 2));
  const x = (2 * equipment - material) / 4;
  const y = (material - 2 * x) / 4;
  const both = x * gainA + y * gainB;
  // For every reviewed case the continuous optimum is this integral intersection.
  const distractors = [unitsOnlyA * gainA, unitsOnlyB * gainB,
    fourthModel === 'incomplete' ? both - gainA : Math.floor(equipment / 2) * gainB];
  const values = [...distractors, both].sort((a, b) => a - b);
  const prompt = source[76].prompt.replace('製品Aが5万円，製品Bが4万円', `製品Aが${gainA}万円，製品Bが${gainB}万円`);
  return {
    prompt: [p(prompt), diagram(profiles.profit, index, '原料と設備の制約条件')],
    choices: strings(values.map(String)),
    correctIndex: values.indexOf(both),
    explanation: `製品Aをx，製品Bをy単位作ると，2x＋4y≦${material}，3x＋2y≦${equipment}である。両方の制約を使い切る交点は（${x}，${y}）で，利益は${gainA}×${x}＋${gainB}×${y}＝${both}万円。片方の製品だけを作る場合は連続量まで許してもAが最大${gainA}×${equipment}÷3万円以下，Bが最大${gainB}×${material}÷4万円以下で，どちらも交点より小さい。交点は整数なので，整数単位に限っても最大利益は同じである。`,
  };
}

function contract(index: number): GeneratedBody {
  const { buyer, seller, item, arrangement, acceptAt } = spring2013AmContractCases[index];
  const conditions = {
    ordinary: '',
    'firm-quote': ` この取引は2013年当時，電子通知を使わずに隔地者間で行う。${seller}社の見積書は，提示した条件をそのまま受け入れるなら取引を確定する旨を明示している。${buyer}社は注文書に同じ条件を記載する。`,
    delivery: ` この取引は2013年当時に行う。両社の取引基本契約では，注文請書は受付の連絡に限り，個別の承諾通知は不要とする。${seller}社は注文書で指定された場所に，注文内容どおりの品物を引き渡す。`,
  };
  const explanation = {
    ordinary: 'この取引では見積書は条件の提示であり、注文書が申込み、注文請書が承諾の通知である。したがって②に対応する。2013年当時の民法第526条第1項では、隔地者間で電子承諾通知の特例が適用されないとき、承諾通知を発した時に成立した。③は履行、④は受取りの記録である。',
    'firm-quote': `本件では${seller}社が同条件なら取引を確定する意思を見積書で示しており、見積書が申込みに当たる。${buyer}社がその条件を受け入れる注文書を発する①が承諾である。2013年当時の民法第526条第1項により、この書面による隔地者間取引では承諾通知の発信時に成立する。`,
    delivery: '①が申込みで、②は受付の連絡にすぎない。承諾の通知を要しない取り決めでは、2013年当時の民法第526条第2項により、承諾の意思表示と認める事実が生じた時に成立する。本件では取り決めどおりに品物を納める③が該当し、④の受領書の発行まで待たない。',
  };
  const stem = index === 0 ? source[80].prompt :
    `${buyer}社が${item}を購入するとき，購入先の${seller}社と図の手順で取引を行っている。この取引手順の中で，売買契約が成立するのはどの時点か。ここで，取引の内容は見積書以降の取引手順を通じて変わらないものとする。` + conditions[arrangement];
  return {
    prompt: [p(stem), diagram(profiles.contract, index, '備品などの購入手順')],
    choices: strings(source[80].choices),
    correctIndex: acceptAt,
    explanation: explanation[arrangement],
  };
}

export const spring2013Am5480Calculations = {
  69: {
    name: '移行率と既存・新規顧客の条件',
    count: spring2013AmTransitions.length,
    notes: '移行割合は小数第1位，人数は100人単位。Bの移行割合の行合計が1となる派生条件では，変更後の顧客の購入を1種類以下に限り，行合計の解釈を明確にする。商品別の既存人数と新規人数を同じ入力から表示し，単一セルの積，行合計，列の割合，新旧顧客の大小比較の四役割を保つ。',
    build: customers,
  },
  76: {
    name: '日別の原料・設備制約と単位利益',
    count: spring2013AmProfitInputs.length,
    notes: '原料kg，設備時間，万円の単位と整数の最大利益を保持。制約交点が非負の整数で，連続量と整数の最適値が一致する条件を採用。単品生産，設備制約のみ，未完の混合案を誤答にし，数値の昇順を固定する。',
    build: profit,
  },
  80: {
    name: '当時の取引手順で承諾となる行為',
    count: spring2013AmContractCases.length,
    notes: '原問の見積り後に条件が変わらない前提と，図の方向・手順①〜④の順序を保持。2013年当時の隔地者間の書面による承諾通知は発信時，通知を要しない取決めでは承諾と認める事実の発生時。生成ではその判断に必要な取引条件を明示する。',
    build: contract,
  },
} as const;
