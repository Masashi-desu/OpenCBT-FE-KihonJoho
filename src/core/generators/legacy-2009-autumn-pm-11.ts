import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-autumn-pm-09-13-support';

type Calling = readonly [basic: number, included: number, rate: number];
type Discount = readonly [basic: number, allowance: number, rate: number];
type TestData = readonly [minutes: number, packets: number];
type PlanCase = {
  calling: readonly [Calling, Calling]; measured: number; s1: Discount;
  s2: readonly [...Discount, limit: number]; usage: readonly [TestData, TestData, TestData, TestData];
};
const cases: readonly PlanCase[] = [
  { calling: [[2000, 1000, 40], [3000, 2000, 30]], measured: 20, s1: [1000, 10000, 8],
    s2: [1000, 10000, 10, 50000], usage: [[30, 1000], [30, 10000], [300, 1000], [300, 10000]] },
  { calling: [[1800, 840, 35], [2800, 1680, 28]], measured: 24, s1: [960, 8800, 9],
    s2: [1100, 10000, 11, 50000], usage: [[24, 799], [25, 4000], [260, 800], [260, 8801]] },
  { calling: [[2500, 1200, 40], [3200, 1800, 30]], measured: 25, s1: [1050, 12000, 7],
    s2: [1050, 12000, 10, 62000], usage: [[30, 1001], [31, 4200], [310, 11999], [310, 12001]] },
  { calling: [[1900, 900, 45], [3100, 1920, 32]], measured: 18, s1: [900, 9000, 6],
    s2: [1000, 9000, 8, 59000], usage: [[0, 0], [21, 5000], [249, 999], [249, 9001]] },
];
const yen = (value: number) => value.toLocaleString('en-US');
const maxCharge = ([fee, included, rate, limit]: PlanCase['s2']) => fee + (limit - included) / 100 * rate;
function recommend(state: PlanCase, [minutes, packets]: TestData) {
  const [fee, included, discountRate] = state.s1;
  const packetFees = [Math.ceil(packets / 100) * state.measured,
    fee + Math.ceil(Math.max(packets - included, 0) / 100) * discountRate];
  let name = '', charge = Number.MAX_SAFE_INTEGER;
  for (const [i, [base, free, rate]] of state.calling.entries()) {
    for (const [j, packetFee] of packetFees.entries()) {
      const candidate = base + Math.max(0, rate * minutes - free) + packetFee;
      if (candidate <= charge) {
        name = (i === 0 ? 'A' : 'B') + (j === 0 ? '' : ' S1');
        charge = candidate;
      }
    }
  }
  return { name, charge };
}
const plans = languageFigure(11, 'phone-plans', '表1 料金プラン（単位 円）', index => ({
  kind: 'tables', note: '注(1) この料金分までの通話に対する料金は基本料金に含まれている。',
  tables: [{ headers: ['プラン名', '基本料金', '無料通話分(1)', '1分当たりの\n通話料金', '100パケット当たりの\nパケット料金'],
    rows: cases[index].calling.map(([base, free, rate], i) => [i === 0 ? 'A' : 'B', yen(base), yen(free), yen(rate), yen(cases[index].measured)]) }],
}));
const discount = languageFigure(11, 'packet-discount', '表2 パケット料金の割引サービス', index => {
  const [fee, allowance, rate] = cases[index].s1;
  return { kind: 'tables', tables: [{ headers: ['サービス名', '内容'], rows: [['S1',
    `サービス料金${yen(fee)}円を支払うと，${yen(allowance)}パケットまでは無料，\n${yen(allowance)}パケットを超えた分は，100パケット当たり${rate}円とする。`]] }] };
});
const usage = languageFigure(11, 'usage-test', '表3 テスト用の利用状況', index => ({
  kind: 'tables', tables: [{ headers: ['通話時間（分）', 'パケット数'], rows: cases[index].usage.map(row => row.map(yen)) }],
}));
const result = languageFigure(11, 'recommendation-output', '図 プログラムの実行結果', index => ({
  kind: 'output', text: cases[index].usage.map(row => {
    const { name, charge } = recommend(cases[index], row);
    return 'minutes: ' + String(row[0]).padStart(4) + ', packets: ' + String(row[1]).padStart(6)
      + ' => ' + name.padEnd(6) + ' (' + String(charge).padStart(5) + ')';
  }).join('\n'),
}));
const capped = languageFigure(11, 'capped-discount', '表4 新しく追加するパケット料金の割引サービス', index => {
  const values = cases[index].s2;
  const [fee, allowance, rate, limit] = values;
  const max = yen(maxCharge(values));
  return { kind: 'tables', tables: [{ headers: ['サービス名', '内容'], rows: [['S2',
    `サービス料金${yen(fee)}円を支払うと，${yen(allowance)}パケットまでは無料，\n${yen(allowance)}パケットを超えて${yen(limit)}パケットまでは，100パケット当たり${rate}円，\n${yen(limit)}パケット（合計${max}円）を超えた場合は，一律${max}円とする。`]] }] };
});
export const q11Figures = [plans, discount, usage, result, capped];

const java = (source: string) => code(source, 'java');
const phone = `public class CellPhonePlan {
   private CallingPlan callingPlan;
   private PacketPlan packetPlan;

   CellPhonePlan(CallingPlan callingPlan, PacketPlan packetPlan) {
      this.callingPlan = callingPlan;
      this.packetPlan = packetPlan;
   }
   public int calculateCharge(int minutes, int packtes) {
      return callingPlan.calculateCharge(minutes)
         + packetPlan.calculateCharge(packtes);
   }
   public String getName() {
      return callingPlan.getName() + " " + packetPlan.getName();
   }
}`;
const calling = `public class CallingPlan {
   private String name;
   private int basicCharge;
   private int included;
   private int callingRate;
   CallingPlan(String name, int basicCharge,
               int included, int callingRate) {
      this.name = name;
      this.basicCharge = basicCharge;
      this.included = included;
      this.callingRate = callingRate;
   }
   public String getName() { return name; }
   public int calculateCharge(int minutes) {
      int callingCharge = ［a］;
      if (［b］)
         callingCharge = 0;
      return basicCharge + callingCharge;
   }
}`;
const packet = `public interface PacketPlan {
   String getName();
   int calculateCharge(int packets);
}`;
const measured = `public class Measured ［c］ {
   private int packetRate;

   Measured(int packetRate) {
      this.packetRate = packetRate;
   }
   public String getName() { return ""; }
   public int calculateCharge(int packets) {
      return packetRate * ((packets + 99) / 100);
   }
}`;
const tiered = `public class Tiered ［c］ {
   private String name;
   private int basicCharge;
   private int allowance;
   private int packetRate;

   Tiered(String name, int basicCharge,
          int allowance, int packetRate) {
      this.name = name;
      this.basicCharge = basicCharge;
      this.allowance = allowance;
      this.packetRate = packetRate;
   }
   public String getName() { return name; }
   public int calculateCharge(int packets) {
      int charge = basicCharge;
      if (packets > allowance)
         charge += packetRate * ((［d］) / 100);
      return charge;
   }
}`;
function plannerStart(state: PlanCase) {
  return `public class CellPhonePlanner {
   static final CallingPlan[] callingPlans = {
      new CallingPlan("A", ${state.calling[0].join(', ')}),
      new CallingPlan("B", ${state.calling[1].join(', ')}) };
   static final PacketPlan[] packetPlans = {
      new Measured(${state.measured}),
      new Tiered("S1", ${state.s1.join(', ')}) };
   static final CellPhonePlan[] cellPhonePlans = {
      new CellPhonePlan(callingPlans[0], packetPlans[0]),
      new CellPhonePlan(callingPlans[0], packetPlans[1]),
      new CellPhonePlan(callingPlans[1], packetPlans[0]),
      new CellPhonePlan(callingPlans[1], packetPlans[1]) };

   static CellPhonePlan getRecommendedPlan(int minutes,
                                          int packets) {
      int minCharge = ［e］;
      CellPhonePlan recommended = null;
      for (CellPhonePlan cellPhonePlan : cellPhonePlans) {
         int charge = ［f］;
         if (charge <= minCharge) {
            recommended = cellPhonePlan;
            minCharge = charge;
         }
      }`;
}
function plannerEnd(state: PlanCase) {
  const pairs = state.usage.map(row => '{' + row.join(', ') + '}');
  return `      return recommended;
   }

   public static void main(String[] args) {
      int[][] testData = {${pairs[0]}, ${pairs[1]},
                          ${pairs[2]}, ${pairs[3]} };

      for (int[] data : testData) {
         int minutes = data[0];
         int packets = data[1];
         CellPhonePlan recommended =
                                getRecommendedPlan(minutes, packets);
         System.out.printf("minutes: %4d, packets: %6d => %-6s (%5d)%n",
                           minutes, packets, recommended.getName(),
                           recommended.calculateCharge(minutes,
                                                       packets));
      }
   }
}`;
}
const tieredBounded = `public class TieredBounded ［g］ {
   private int maxCharge;

   TieredBounded(String name, int basicCharge, int allowance,
                 int packetRate, int maxCharge) {
      super(name, basicCharge, allowance, packetRate);
      this.maxCharge = maxCharge;
   }
   public int calculateCharge(int packets) {
      int charge = ［h］;
      if (charge > ［i］)
         charge = maxCharge;
      return charge;
   }
}`;

export const q11 = createLanguageDefinition(11, 'Java：携帯電話の料金プランの選択',
  '通話料金、割引・上限、テスト用の利用状況', 'abcdefghi', '設問1 aイ bア cエ dエ eウ fエ／設問2 gイ hカ iオ',
  'クラス7個の宣言・継続行と同一空欄の再出現、料金プラン2個・S1・S2の前提、9欄を保持する。料金と境界を連動し、Javaの継承・実装と算式を保つため記号は固定する。',
  (index, original) => {
    const state = cases[index];
    return {
      pages: [
        page(49, [
          p('問11 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('携帯電話の利用状況に対して，最も安価な料金プラン（割引サービスを含む）を提示するプログラムである。1か月の料金は，基本料金，通話料金及びパケット料金からなる。パケット料金にはオプションの割引サービスがある。'),
          p('表1に料金プラン，表2にパケット料金の割引サービス，表3にテスト用の利用状況を示す。'),
          p('なお，パケット料金を計算するとき，パケット数は100パケット単位に切り上げる。'
            + (original ? '' : '料金計算の途中でintの範囲を超えないものとする。')),
          plans.block(index), discount.block(index), usage.block(index),
          p('（1）クラスCellPhonePlanは，料金プランを表す。メソッドcalculateChargeは，引数で渡された利用状況に対する料金を返す。'),
        ]),
        page(50, [
          p('（2）クラスCallingPlanは，通話料金を計算するクラスである。メソッドcalculateChargeは，引数で渡された通話時間（分単位に切上げ）に対する料金を返す。'),
          p('（3）インタフェースPacketPlanは，パケット料金を計算するためのインタフェースである。メソッドcalculateChargeは，引数で渡されたパケット数に対する料金を返す。'),
          p('（4）クラスMeasuredは，従量制のパケット料金（割引サービスなしの場合）を表す。'),
          p('（5）クラスTieredは，パケット料金の割引サービスS1を表す。'),
          p('（6）クラスCellPhonePlannerは，利用状況に対して，最も安価な料金プラン（割引サービスを含む）を提示する。メソッドgetRecommendedPlanは，与えられた利用状況に対して，最も安価な料金プラン（割引サービスを含む）を返す。メソッドmainは，テスト用のメインプログラムである。'),
          p('プログラムの実行結果を図に示す。'), result.block(index), p('〔プログラム1〕'), java(phone),
        ]),
        page(51, [p('〔プログラム2〕'), java(calling), p('〔プログラム3〕'), java(packet), p('〔プログラム4〕'), java(measured)]),
        page(52, [p('〔プログラム5〕'), java(tiered), p('〔プログラム6〕'), java(plannerStart(state))]),
        page(53, [java(plannerEnd(state)), p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', ['callingRate * minutes', 'callingRate * minutes - included', 'included', 'included - callingRate * minutes'], 'イ', 'java'),
          bank(1, 'b', ['callingCharge < 0', 'callingCharge < included', 'callingCharge > 0', 'callingCharge > included'], 'ア', 'java'),
          bank(1, 'c', ['extends CellPhonePlan', 'extends PacketPlan', 'implements CellPhonePlan', 'implements PacketPlan'], 'エ', 'java'),
          bank(1, 'd', ['allowance + 99', 'packets + 99', 'packets + allowance + 99', 'packets - allowance + 99'], 'エ', 'java'),
        ]),
        page(54, [
          p('設問2 パケット通信を大量に行う人を対象として，S1の内容を変更したパケット料金割引サービスS2を追加することにした。表4にサービスの内容，プログラム7にS2を表すクラスを示す。プログラム7中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          capped.block(index), p('〔プログラム7〕'), java(tieredBounded),
        ], [
          bank(1, 'ef', ['0', 'Integer.MIN_VALUE', 'Integer.MAX_VALUE',
            'cellPhonePlan.calculateCharge(minutes, packets)', 'recommended.calculateCharge(minutes, packets)'], 'ウエ', 'java'),
        ], [-1]),
        page(55, [], [
          bank(2, 'g', ['extends PacketPlan', 'extends Tiered', 'implements PacketPlan', 'implements Tiered'], 'イ', 'java'),
          bank(2, 'hi', ['0', 'allowance', 'basicCharge', 'basicCharge + maxCharge', 'maxCharge',
            'super.calculateCharge(packets)', 'this.calculateCharge(packets)'], 'カオ', 'java'),
        ]),
      ],
      explanation: 'a：通話時間と1分単価を掛けた通話料から，基本料金に含まれる無料通話分の金額を引く。b：差が負なら0円にする。'
        + 'c：MeasuredとTieredはともにPacketPlanを実装する。d：無料パケット数を引いた超過分に99を加え，100で整数除算して切り上げる。'
        + 'e：最小値の探索は最大のint値から始める。f：ループ中の各プランで通話とパケットの料金を計算する。同額の場合は後から比較した候補が残る。'
        + 'g：S2はTieredの料金計算を再利用するのでクラスを継承する。h：親クラスの計算で上限なしの料金を求める。i：'
        + yen(maxCharge(state.s2)) + '円を超えた場合だけその上限額にする。',
    };
  }, { answerVariation: 'fixed' });
