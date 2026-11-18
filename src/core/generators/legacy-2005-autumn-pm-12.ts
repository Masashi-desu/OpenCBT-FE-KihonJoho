import { code, p, table } from './definition';
import { autumnLanguageQuestion, bank, page } from './legacy-2005-autumn-pm-10-13-support';

const cases = [
  { distances: [0, 5, 8, 14], baseKm: 4, fare: 120, stepKm: 2, addition: 30, example: 7, hours: 24 },
  { distances: [0, 4, 9, 15], baseKm: 3, fare: 130, stepKm: 3, addition: 40, example: 8, hours: 12 },
  { distances: [0, 6, 10, 17], baseKm: 5, fare: 150, stepKm: 2, addition: 20, example: 10, hours: 36 },
  { distances: [0, 3, 11, 19], baseKm: 6, fare: 160, stepKm: 4, addition: 50, example: 13, hours: 48 },
] as const;

const gateProgram = `public class Gate {
    private final String name;
    private final int distance;

    public Gate(String name, int distance) {
        this.name = name;
        this.distance = distance;
    }

    public void enter(Ticket ticket) {
        if (ticket.isValid() && ticket.getOrigin() == null) {
            [a];
            open();
        } else {
            close();
        }
    }

    public void exit(Ticket ticket) {
        Gate origin = ticket.getOrigin();
        if (origin != null) {
            int d = Math.abs(origin.distance - distance);
            int fare = Line.getFare(d);
            if ([b]) {
                ticket.adjustValue(fare);
                ticket.setOrigin(null);
                open();
                return;
            }
        }
        close();
    }

    private void open() { System.out.println(name + ": open"); }
    private void close() {
        System.out.println(name + ": closed");
    }
}`;
const ticketStart = `public abstract class Ticket {
    private Gate origin;
    private int value;

    public Ticket(int value) {
        this.value = value;
    }`;
const ticketEnd = `    public int getValue() { return value; }

    public void deduct(int amount) { value -= amount; }

    public void setOrigin(Gate gate) { origin = gate; }

    public Gate getOrigin() { return origin; }

    public abstract void adjustValue(int amount);

    public abstract boolean isValid();
}`;
const oneWayProgram = `public class OneWayTicket extends Ticket {
    private boolean valid = true;

    public OneWayTicket(int value) {
        [c];
    }

    public void setOrigin(Gate gate) {
        super.setOrigin(gate);
        if (gate == null)
            valid = false;
    }

    public void adjustValue(int amount) { }

    public boolean isValid() { return valid; }
}`;
const prepaidProgram = `public class PrepaidCard extends Ticket {
    public PrepaidCard(int value) {
        [c];
    }

    public void adjustValue(int amount) { deduct(amount); }

    public boolean isValid() {
        return getValue() > 0;
    }
}`;
const startOptions = [
  'ticket.setOrigin(Line.A)', 'ticket.setOrigin(Line.D)', 'ticket.setOrigin(null)',
  'ticket.setOrigin(this)', 'ticket.setOrigin(ticket)',
];
const fareOptions = ['<', '<=', '==', '>', '>='].map(op => 'ticket.getValue() ' + op + ' fare');
const constructorOptions = ['super()', 'super(this)', 'super(value)', 'super(); this.value = value', 'this(value)'];

export const q12 = autumnLanguageQuestion(12, '自動改札機と期限付き乗車券', '路線の距離・運賃と乗車券の有効時間', 'abcdef', 'エオウエオコ',
  '4駅と運賃の切上げ、乗車券の継承、入出場の異なる判定、設問と解答群を保持する。駅の距離、初乗り範囲と金額、加算単位と金額、券の有効時間を組にして変える。生成版は期限ちょうどの入場を含むことを明示する。', (index, original) => {
    const { distances, baseKm, fare, stepKm, addition, example, hours } = cases[index];
    const exampleFare = fare + Math.ceil((example - baseKm) / stepKm) * addition;
    const maxFare = fare + Math.ceil((distances[3] - baseKm) / stepKm) * addition;
    const lineProgram = `public final class Line {
${['A', 'B', 'C', 'D'].map((station, i) => '    public static final Gate ' + station + ' = new Gate("' + station + '", ' + distances[i] + ');').join('\n')}

    public static int getFare(int distance) {
        return ${fare} + (Math.max(distance - ${baseKm - stepKm + 1}, 0) / ${stepKm}) * ${addition};
    }
}`;
    const passOptions = [
      'valueが路線の最高運賃（全運賃の最大値）以上のときだけtrueを返す。それ以外はfalseを返す。',
      'valueが路線の初乗り運賃以上のときだけtrueを返す。それ以外はfalseを返す。',
      'valueの初期値に，理論的に' + hours + '時間かかっても使い切れない金額を設定する。',
      'valueの初期値に，路線の最高運賃（全運賃の最大値）を設定し，発券時刻を記録する。',
      'スーパクラスで定義されたとおり',
      '常に0を返す。',
      '常に路線の初乗り運賃の値を返す。',
      '何もしない（メソッド本体が文を含まない）。',
      'メソッドdeductを，amountを引数として呼び出す。',
      '呼び出されたときの時刻がインスタンスに格納されている発券時刻から' + hours + '時間以内のときだけtrueを返す。それ以外はfalseを返す。',
    ];
    return {
      pages: [
        page(51, [
          p('問12　次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\nAを起点，Dを終点とする四つの駅A，B，C，Dからなる路線の各駅に設置された自動改札機の処理を模したプログラムである。この路線では片道切符（以下，切符という）とプリペイドカード（以下，カードという）の2種類の乗車券が使用できる。'),
          p('路線の運賃は駅間の距離で決められる。距離が' + baseKm + ' kmまでは' + fare + '円（この運賃を初乗り運賃という）で，それを超えると' + stepKm + ' kmごとに' + addition + '円加算される。' + stepKm + ' km未満は' + stepKm + ' kmに切り上げる。例えば，距離が' + example + ' kmの場合，運賃は' + exampleFare + '円である。'),
          p('切符には，乗車駅で自動改札機を通って入場するとき，乗車駅の情報が記録される。降車駅で自動改札機を通って出場するとき，運賃が計算され，金額が不足しているときはゲートが閉じられ出場できない。一度使用した切符は無効となる。この路線では切符を発券した駅にかかわらず，どの駅の自動改札機からでも入場できる。例えば，A駅で発券された切符でB駅の自動改札機から入場できる。'),
          p('カードには，乗車駅で自動改札機を通って入場するとき，乗車駅の情報が記録される。このとき，カードの残高が0円の場合は，ゲートが閉じられ，入場できない。降車駅で自動改札機を通って出場するとき，精算処理が行われる。すなわち，運賃が計算され，カードの残高から引かれる。このとき，カードの残高が運賃に満たない場合は，ゲートが閉じられ，出場できない。'),
          p('クラスLineは路線を表す。メソッドgetFareは与えられた距離から運賃を計算して返す。'),
          p('クラスGateは，自動改札機を表す。クラスLineのフィールドA，B，C，DはGateのインスタンスであり，それぞれA，B，C，Dの各駅に設置された自動改札機を表す。コンストラクタ及び各メソッドは，次の処理を行う。'),
          p('（1）コンストラクタは，Gateのインスタンスを生成する。最初の引数に駅名，2番目の引数に路線の起点であるA駅からの距離を指定する。\n（2）メソッドenterは，自動改札機を通って入場するときの処理を行う。乗車券が適正でない場合はゲートを閉じる。入場処理が正常に行われた場合は乗車券に乗車駅の情報を記録する。\n（3）メソッドexitは，自動改札機を通って出場するときの処理を行う。乗車券の金' + (original ? '' : '額（残高）が不足するなど，適正でない場合はゲートを閉じる。')),
        ]),
        page(52, [
          p((original ? '額（残高）が不足するなど，適正でない場合はゲートを閉じる。\n' : '') + '（4）メソッドopen及びcloseは，それぞれゲートの開閉を表すメッセージを出力する。'),
          p('抽象クラスTicketは，この路線の乗車券を表し，このクラスを継承して切符やカードを定義する。コンストラクタ及び各メソッドは，次の処理を行う。'),
          p('（1）コンストラクタは，購入時の金額を初期値として乗車券に保持する。\n（2）メソッドgetValueは，呼び出された時点での乗車券の金額（残高）を返す。\n（3）メソッドadjustValueは，必要であれば精算処理を行う。\n（4）メソッドdeductは，引数で指定された金額を乗車券の金額（残高）から差し引いて金額（残高）を更新する。\n（5）メソッドsetOriginは，指定されたGateを乗車駅として記録する。nullが指定されたときは，乗車駅の記録を消去する。\n（6）メソッドgetOriginは，記録されている乗車駅を返す。記録されていないときはnullを返す。'),
          p('クラスOneWayTicketは切符を表し，クラスPrepaidCardはカードを表す。それぞれの乗車券の処理で，抽象メソッドを実装し，必要に応じてTicketのメソッドをオーバライドする。'),
          p('〔プログラム1〕'), code(lineProgram, 'java'),
        ]),
        page(53, [p('〔プログラム2〕'), code(gateProgram, 'java'),
          p('〔プログラム3〕'), code(ticketStart + (original ? '' : '\n\n' + ticketEnd), 'java')]),
        page(54, [...(original ? [code(ticketEnd, 'java')] : []), p('〔プログラム4〕'), code(oneWayProgram, 'java'),
          p('〔プログラム5〕'), code(prepaidProgram, 'java')]),
        page(55, [p('設問1　プログラム中の［a］〜［c］に入れる正しい答えを，解答群の中から選べ。')]),
        page(55, [], [
          bank(1, 'a', startOptions, 'エ', 'java'),
          bank(1, 'b', fareOptions, 'オ', 'java'),
          bank(1, 'c', constructorOptions, 'ウ', 'java'),
        ]),
        page(55, [
          p('設問2　この路線で，新しいタイプの乗車券を発売することになった。この乗車券は発券した時刻から' + hours + '時間以内は全駅で乗り降り自由な乗車券である。発券から' + hours + '時間' + (original ? '経過すると' : 'を超えると') + '出場はできるが入場はできなくなる。これに伴い，抽象クラスTicketを継承して新しいクラスを定義し，クラスGateには修正を加えずにこの乗車券をサポートしたい。このクラスのコンストラクタ及びメソッドの処理を次の表にまとめた。表中の空欄に入れる正しい答えを，解答群の中から選べ。ここで，解答群中のvalueは，クラスTicketのフィールドvalueであり，コンストラクタで初期値を設定し，値はメソッドgetValueで得るものとする。'),
        ]),
        page(56, [
          table('新しい乗車券の処理', ['コンストラクタ及びメソッド', '処理'], [
            ['コンストラクタ', '[d]'], ['メソッドgetValue', '[e]'],
            ['メソッドsetOrigin', 'スーパクラスで定義されたとおり'],
            ['メソッドgetOrigin', 'スーパクラスで定義されたとおり'],
            ['メソッドadjustValue', '何もしない（メソッド本体が文を含まない）。'],
            ['メソッドisValid', '[f]'],
          ]),
        ], [{ ...bank(2, 'def', passOptions, 'エオコ'), ownLabel: '解答群' }]),
      ],
      explanation: '入場ではthisを渡して通過した改札機を記録する。出場では金額が運賃以上なら精算して乗車駅を消去する。切符とカードのコンストラクタはsuper(value)でTicketの初期値を設定する。期限付き乗車券は発券時刻と最高運賃' + maxFare + '円を保持し，getValueは継承した実装を使う。adjustValueは金額を減らさない。発券から' + hours + '時間以内には期限ちょうどを含め，isValidで入場可否だけを判定する。出場はisValidを参照しないので，期限後でも入場記録があれば出場できる。',
    };
  });
