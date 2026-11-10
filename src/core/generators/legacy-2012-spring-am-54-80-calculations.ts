import { figure, p, strings, type GeneratedBody } from './definition';
import { legacy2012SpringAm5480Figures as figures } from './legacy-2012-spring-am-54-80-figures';
import { breakEvenCases, incomeCases, linearCases, procurementTargets, productionTargets } from './legacy-2012-spring-am-54-80-models';
import { spring2012Am5480Source as source } from './legacy-2012-spring-am-54-80-source';

function diagram(profileIndex: number, index: number, caption: string) {
  const definition = figures[profileIndex];
  return figure(definition.profile, [index], caption, definition.alt([index]));
}

function procure(index: number): GeneratedBody {
  const target = procurementTargets[index];
  const stepNames = ['RFI（Request for Information、情報提供依頼）', 'RFP（Request for Proposal、提案依頼）', '供給者の選定', '契約の締結'];
  return {
    prompt: [p(source[66].prompt.replace('bに入る', target + 'に入る')), diagram(0, 0, '情報システムの調達手順')],
    choices: strings([...source[66].choices]),
    correctIndex: 'abcd'.indexOf(target),
    explanation: target + 'に対応するのは' + stepNames['abcd'.indexOf(target)] + 'である。最初にaで情報提供を依頼し、bで調達条件を示して提案を求める。cで提案などを基に供給者を選び、dで役割と責任を文書にして契約を締結する。',
  };
}

function production(index: number): GeneratedBody {
  const target = productionTargets[index];
  const type = ['個別生産', 'ロット生産', '連続生産', 'プロセス生産'][index];
  return {
    prompt: [p(source[72].prompt.replace('表のaに', '表の' + target + 'に')), diagram(1, 0, '生産方式ごとの特徴')],
    choices: strings([...source[72].choices]),
    correctIndex: source[72].choices.findIndex(choice => choice === type),
    explanation: target + 'は' + type + 'である。この表では、aは受注ごとの少量多品種、bは品種ごとのまとまりで組み立てる中量生産、cは少品種を連続して組み立てる大量生産、dは化学的な処理を例とする大量生産に対応する。実際の現場では、生産量や受注・見込の区分だけで方式を一律に分類しない。',
  };
}

function linear(index: number): GeneratedBody {
  const { productA: [ap, aq], productB: [bp, bq], stocks: [pStock, qStock], profits: [aProfit, bProfit] } = linearCases[index];
  const original = source[75];
  const stem = index === 0 ? original.prompt :
    `ある工場で製品A，Bを生産している。製品Aを1トン生産するのに，原料P，Qをそれぞれ${ap}トン，${aq}トン必要とし，製品Bについてもそれぞれ${bp}トン，${bq}トン必要とする。また，製品A，Bの1トン当たりの利益は，それぞれ${aProfit}万円，${bProfit}万円である。原料Pが${pStock}トン，Qが${qStock}トンしかないとき，製品A，Bの合計の利益が最大となる生産量を求めるための線形計画問題として，定式化したものはどれか。ここで，製品A，Bの生産量をそれぞれxトン，yトンとする。`;
  const options = [
    [ap, bp, aq, bq, '≧'], [ap, bp, aq, bq, '≦'],
    [ap, aq, bp, bq, '≧'], [ap, aq, bp, bq, '≦'],
  ] as const;
  return {
    prompt: [p(stem)],
    choices: options.map(([px, py, qx, qy, operator]) => [
      p('条件'),
      p(`${px}x+${py}y${operator}${pStock}`), p(`${qx}x+${qy}y${operator}${qStock}`),
      p('x≧0，y≧0'), p(`目的関数　${aProfit}x+${bProfit}y → 最大化`),
    ]),
    correctIndex: 1,
    explanation: `原料Pの使用量はAに使う${ap}xとBに使う${bp}yの合計で，${pStock}トン以下。Qは${aq}xと${bq}yの合計で，${qStock}トン以下である。生産量xとyを非負とし，利益${aProfit}x+${bProfit}y（万円）を最大にする。係数の配置が原料別でも，使用量を在庫以上とする式は条件が逆である。また，製品別の係数を各行に並べる式では，原料別の合計を計算できない。`,
  };
}

function income(index: number): GeneratedBody {
  const [sales, cost, expenses, otherIn, otherOut, extraordinaryIn, extraordinaryOut] = incomeCases[index];
  const gross = sales - cost;
  const operating = gross - expenses;
  const ordinary = operating + otherIn - otherOut;
  const preTax = ordinary + extraordinaryIn - extraordinaryOut;
  return {
    prompt: [p(source[76].prompt), diagram(2, index, '損益計算書')],
    choices: strings([preTax, ordinary, operating, gross].map(String)),
    correctIndex: 1,
    explanation: `単位は百万円。売上総利益は${sales}−${cost}＝${gross}，営業利益は${gross}−${expenses}＝${operating}。営業外収益を加え，営業外費用を引くと経常利益${operating}＋${otherIn}−${otherOut}＝${ordinary}になる。特別利益と特別損失まで含めた${preTax}は税引前当期純利益である。`,
  };
}

function breakEven(index: number): GeneratedBody {
  const { threshold, fixed, side } = breakEvenCases[index];
  const lowerFixed = fixed[0] < fixed[1] ? 'A' : 'B';
  const lowerRate = lowerFixed === 'A' ? 'B' : 'A';
  const below = side === 'below';
  const direction = below ? '下回る' : '超えた';
  const outcome = below ? '損失が小さい' : '利益が大きい';
  const choices = index === 0 ? [...source[77].choices] : [
    `A社，B社ともに損益分岐点を${direction}等しい売上高のとき，固定費の少ない${lowerFixed}社の方が${lowerRate}社よりも${outcome}。`,
    `${lowerRate}社は${lowerFixed}社より変動費率が小さいので，損益分岐点を${direction}等しい売上高のとき，${lowerFixed}社に比べて${outcome}。`,
    '両社の損益分岐点は等しいので，等しい正の利益を生み出すために必要な売上高は両社とも等しい。',
    source[77].choices[3],
  ];
  const stem = index === 0 ? source[77].prompt :
    `図は二つの会社の損益分岐点を示したものである。両社の売上高が損益分岐点を${direction}場合を含む，A社とB社の損益分析に関する記述のうち，適切なものはどれか。`;
  return {
    prompt: [p(stem), diagram(3, index, 'A社とB社の損益分岐点')],
    choices: strings(choices),
    correctIndex: below ? 0 : 1,
    explanation: `売上高が0のときの費用が固定費で、A社は${fixed[0]}、B社は${fixed[1]}である。損益分岐点での費用は両社とも${threshold}なので、費用線の傾き（変動費率）は固定費が大きい${lowerRate}社の方が小さい。利益の傾きは1から変動費率を引いた値で、${lowerRate}社の方が大きい。等しい売上高が損益分岐点を上回れば${lowerRate}社の方が利益が大きく、下回れば${lowerFixed}社の方が損失が小さい。分岐点が同じでも、それを超えて同じ利益を得る売上高は等しくない。`,
  };
}

export const spring2012Am5480Calculations = {
  66: { name: '調達手順で問う位置', count: procurementTargets.length,
    notes: '四つの工程名・矢印の順序と説明文を固定し、説明から同定する対象をb、a、c、dへ切り替える。図のラベルと回答群を独立に対応づける。', build: procure },
  72: { name: '特徴を照合する生産方式の列', count: productionTargets.length,
    notes: '原表の列と五つの分類軸を固定し、照合する列をa〜dで変える。例としての特徴に基づく分類を保つ。', build: production },
  75: { name: '原料構成・在庫量・単位当たり利益', count: linearCases.length,
    notes: '各製品と原料を二種類に固定。係数は一桁で非対角成分が互いに異なり、上限は二桁、利益は一桁。候補四つの不等号・係数転置の役割と順序を維持するため正答の位置はイだが、制約式と目的関数は毎回変わる。', build: linear },
  76: { name: '損益計算書の百万円単位の明細', count: incomeCases.length,
    notes: '原紙の7明細と四つの数値枠を保持。4桁の売上高、3〜4桁の売上原価、2〜3桁の控除や収入、1〜2桁の特別損益。候補は税引前利益、経常利益、営業利益、売上総利益の順に異なる三桁整数で、最も近い値の差は原問の10百万円以上。', build: income },
  77: { name: '固定費・共通の損益分岐点・売上高の位置', count: breakEvenCases.length,
    notes: '会社別に原点を通る収益線、固定費を切片とする費用線、軸への案内線を保持。損益分岐点は二社で等しく、固定費だけは異なる。分岐点を超えるか下回るかを本文と選択肢へ反映し、固定費と変動費率の違いをグラフから読む。', build: breakEven },
} as const;
