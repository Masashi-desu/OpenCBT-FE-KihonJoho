import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2008-spring-pm-06-09-support';
import { kettleCases, kettleEmpty, kettleHasWater } from './legacy-2008-spring-pm-06-09-model';
import { drawing } from './legacy-2008-spring-pm-06-09-figures';

const stateProgram = `public abstract class State {
    public static final State IDLE = new Idle();
    public static final State HEATING = new Heating();

    public void heat(ElectricPot pot) throws Exception {
        if (［a］)
            ［b］;
        pot.changeState(HEATING);
    }

    public void boiled(ElectricPot pot) {
        pot.changeState(IDLE);
    }

    private static class Idle ［c］ {
        public String toString() { return "Idle"; }
    }

    private static class Heating ［c］ {
        public String toString() { return "Heating"; }
    }
}`;

export function kettleProgram(index: number): [string, string, string] {
  const { min, first, second } = kettleCases[index];
  const comparison = index === 0 ? '== 0' : '< ' + min;
  return [stateProgram, `public class ElectricPot {
    private State currentState = State.IDLE;
    private int content;

    public ElectricPot(int content) { this.content = content; }
    public void setContent(int content) {
        this.content = content;
    }

    public boolean isEmpty() { return (content ${comparison}); }
    public void changeState(State newState) {
        System.out.println(currentState + " -> " + newState);
        currentState = newState;
    }

    public void heat() throws Exception {
        ［d］.heat(this);
    }

    public void boiled() {
        ［d］.boiled(this);
    }`, `    public static void main(String[] args) {
        try {
            ElectricPot pot = new ElectricPot(${first});
            pot.heat();
            pot.boiled();
            pot.setContent(${second});
            pot.heat();
            pot.boiled();
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}`];
}

export const q8 = draftQuestion(8, 'Java：電気ポットの状態遷移と例外処理',
  '加熱を許す最少水量・呼出し時の水量・警告', 'aウ bエ cウ dア',
  '休止と加熱中の2状態・沸騰ボタンと沸点の遷移・水量不足時の例外・Stateの継承・現在状態への委譲を維持。最少水量と境界付近の入力を変え，状態遷移図・コード・出力を同時に変更する。', index => {
    const { message } = kettleCases[index];
    const [state, pot, main] = kettleProgram(index);
    return {
      pages: [
        { page: 29, blocks: [
          p('問8　次のJavaプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕'),
          p('電気ポットの状態遷移を模したプログラムである。この電気ポットは，電源に接続すると休止状態になり，沸騰ボタンが押されると加熱を開始する。沸点に到達すると加熱を終了し，休止状態に戻る。ただし，' +
            (index === 0 ? '電気ポットに水がない場合' : kettleEmpty(index) + 'の場合') +
            'は，沸騰ボタンが押されても加熱を開始せず，警告を表示する。電気ポットの状態遷移図を図1に示す。'),
          drawing('8-state', index),
          p('(1) 抽象クラス State は，電気ポットの状態を定義する。'),
          p('(2) クラス Idle 及びクラス Heating は，それぞれ，休止状態と加熱中状態を示す State のサブクラスである。'),
          p('(3) クラス ElectricPot は電気ポットを表す。フィールド currentState は，電気ポットの状態を示す。フィールド content は，水量を示す。メソッド heat は，沸騰ボタンが押されたときに呼ばれ，電気ポットに' +
            (index === 0 ? '水があれば' : kettleHasWater(index) + 'なら') +
            '加熱を開始する（電気ポットの状態を加熱中に遷移）。' +
            (index === 0 ? '水がない場合' : kettleEmpty(index) + 'の場合') +
            'は例外を投げる。メソッド boiled は，水が沸点に到達したときに呼ばれ，加熱を終了する（電気ポットの状態を休止に遷移）。メソッド isEmpty は，' +
            (index === 0 ? '水がない場合' : kettleEmpty(index) + 'の場合') +
            ' true，それ以外の場合 false を返す。メソッド main はテスト用のメインプログラムである。実行結果を図2に示す。'),
          drawing('8-result', index),
        ] },
        { page: 30, blocks: [p('〔プログラム1〕'), code(state, 'java'), p('〔プログラム2〕'), code(pot, 'java')] },
        { page: 31, blocks: [code(main, 'java'), p('設問　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], banks: [
          bank('a', ['isEmpty()', '!isEmpty()', 'pot.isEmpty()', '!pot.isEmpty()', 'pot == null', 'pot != null'], 'ウ', 'java'),
          bank('b', ['return "' + message + '"', 'System.out.println("' + message + '")',
            'throw "' + message + '"', 'throw new Exception("' + message + '")'], 'エ', 'java'),
          bank('c', ['extends Exception', 'extends Object', 'extends State', 'implements Exception',
            'implements Object', 'implements State'], 'ウ', 'java'),
          bank('d', ['currentState', 'State', 'super', 'this'], 'ア', 'java'),
        ] },
      ],
      explanation: [
        'a：引数 pot が指す電気ポット自身の水量を pot.isEmpty() で検査する。',
        'b：' + (index === 0 ? '水がないときは' : kettleEmpty(index) + 'のときは') + '警告「' + message + '」を持つ Exception を投げる。その呼出しでは changeState まで進まず，main の catch で警告を表示する。',
        'c：Idle と Heating は State のサブクラスなので extends State を使う。State はクラスである。',
        'd：フィールド currentState に現在の状態オブジェクトが入るので，そこへポット自身を渡して呼び出す。',
      ].join('\n'),
    };
  });
