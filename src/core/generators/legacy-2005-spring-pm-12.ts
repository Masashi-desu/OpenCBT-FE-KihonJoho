import { code, p, table } from './definition';
import { bank, page, springLanguageQuestion } from './legacy-2005-spring-pm-10-13-support';

const eventProgram = `public class CalculatorEvent {
    public static final int DIGIT = 1;
    public static final int OPERATOR = 2;
    public static final int CLEAR = 3;

    private int type, value;

    public CalculatorEvent(int type) {
        [a];
    }
    public CalculatorEvent(int type, int value) {
        if (type < DIGIT || type > CLEAR)
            throw new IllegalArgumentException();
        this.type = type; this.value = value;
    }
    public int getType() { return type; }
    public int getValue() { return value; }
}`;
const outputProgram = `public interface CalculatorOutput {
    public void display(int value);
    public void display(String value);
}`;
const calculatorStart = `public class Calculator {
    private int accumulator = 0, register = 0;
    private int operator = 0;
    private CalculatorOutput output;

    public Calculator(CalculatorOutput output) {
        this.output = output;
    }

    public void eventDispatched(CalculatorEvent event) {
        switch (event.getType()) {
        case CalculatorEvent.DIGIT:
            if (operator == '=') {
                register = 0; operator = 0;
            }
            register = register * 10 + event.getValue();
            output.display(register);
            break;
        case CalculatorEvent.OPERATOR:
            try {
                register = calculate();
                output.display(register);
                accumulator = register;
                operator = event.getValue();
            } catch (ArithmeticException e) {
                output.display("Error");
                accumulator = 0; operator = 0;
            }
            if (operator != '=')
                register = 0;
            break;
        case CalculatorEvent.CLEAR:
            register = 0;
            accumulator = 0;
            operator = 0;
            output.display(register);
            break;
        }
    }`;
const calculatorEnd = `    private int calculate() {
        switch (operator) {
        case '+':
            return accumulator + register;
        case '-':
            return accumulator - register;
        case '*':
            return accumulator * register;
        case '/':
            return accumulator / register;
        }
        return register;
    }
}`;
const testProgram = `public class CalculatorTest {
    public static void main(String[] args) {
        Calculator calc = new Calculator(
            [b] {
                public void display(int value) {
                    System.out.println(value);
                }
                public void display(String value) {
                    System.out.println(value);
                }
            });
        String keys = args[0];
        for (int i = 0; i < keys.length(); i++) {
            char c = keys.charAt(i);
            CalculatorEvent event = null;
            if (c >= '0' && c <= '9') {
                event = new CalculatorEvent(
                            [c]);
            } else if (c == '=' || c == '+' || c == '-'
                       || c == '*' || c == '/') {
                event = new CalculatorEvent(
                            CalculatorEvent.OPERATOR, c);
            } else if (c == 'C') {
                event = new CalculatorEvent(
                            CalculatorEvent.CLEAR);
            }
            if (event != null)
                calc.eventDispatched(event);
        }
    }
}`;

const cases = [
  { example: '2+7=', numbers: [3, 4, 5], repeated: '3*4***=', afterEqual: '3*4=+5', divided: '3+4/0=', extra: 53 },
  { example: '3+6=', numbers: [4, 5, 6], repeated: '4+5++=', afterEqual: '4*5=+6=', divided: '4*5/0=', extra: 64 },
  { example: '9-4=', numbers: [5, 6, 7], repeated: '5*6+--=', afterEqual: '5*6=7', divided: '5/0=C5', extra: 75 },
  { example: '3*3=', numbers: [4, 6, 8], repeated: '4*6--4=', afterEqual: '4*6=+8=', divided: '4+6/0=8', extra: 20 },
] as const;

function runKeys(keys: string) {
  const output: string[] = [];
  let number = 0, saved = 0, pending = '';
  for (const key of keys) {
    if (key === 'C') {
      number = saved = 0;
      pending = '';
      output.push('0');
    } else if (/^\d$/.test(key)) {
      if (pending === '=') {
        number = 0;
        pending = '';
      }
      number = (10 * number + Number(key)) | 0;
      output.push(String(number));
    } else if (pending === '/' && number === 0) {
      number = saved = 0;
      pending = '';
      output.push('Error');
    } else {
      switch (pending) {
        case '+': number = (saved + number) | 0; break;
        case '-': number = (saved - number) | 0; break;
        case '*': number = Math.imul(saved, number); break;
        case '/': number = (saved / number) | 0; break;
      }
      output.push(String(number));
      saved = number;
      pending = key;
      if (key !== '=') number = 0;
    }
  }
  return output;
}

const keySymbols: Readonly<Record<string, string>> = { '+': '＋', '-': '−', '*': '×', '/': '÷', '=': '＝' };

const constructorOptions = [
  'CalculatorEvent(type, 0)', 'new CalculatorEvent(type, 0)',
  'return new CalculatorEvent(type, 0)', 'super(type, 0)', 'this(type, 0)',
];
const outputOptions = [
  'implements CalculatorOutput()', 'interface CalculatorOutput()', 'new CalculatorOutput()',
  'new Temp() implements CalculatorOutput', 'public class Temp implements CalculatorOutput',
];
const digitOptions = [
  "c - '0', CalculatorEvent.DIGIT", 'c, CalculatorEvent.DIGIT', 'CalculatorEvent.DIGIT',
  'CalculatorEvent.DIGIT, c', "CalculatorEvent.DIGIT, c - '0'",
];

export const q12 = springLanguageQuestion(12, 'Java電卓のキーイベントと演算状態', '電卓を操作するキーの列', 'abcdef', 'オウオアエコ',
  '整数の四則演算、二引数コンストラクタ、匿名クラス、数字文字からの変換、連続演算子、イコール後の操作とゼロ除算の観点を維持する。演算キー列を四通りとし、最後の出力、全候補と解説を更新する。', (index, original) => {
    const { example, repeated, afterEqual, divided, numbers, extra } = cases[index];
    const [x, y, z] = numbers;
    const sequences = [repeated, afterEqual, divided];
    const lastValues = sequences.map(sequence => runKeys(sequence).at(-1)!);
    const options = [0, x, y, z, x + y, x * y, x * y + z, extra].sort((a, b) => a - b).map(String);
    options.push('/ by zero', 'Error');
    const keys = lastValues.map(value => 'アイウエオカキクケコ'[options.indexOf(value)]).join('');
    const precedence = x + '+' + y + '*' + z + '=';
    return {
      pages: [
        page(50, [
          p('問12　次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\n整数値の加減乗除の演算をする電卓プログラムである。入出力部分はテスト用のプログラムによって用意され，電卓本体部分のプログラムのテストができるようになっている。'),
          p('（1）クラスCalculatorEventは電卓のキーが押されたときに発生するイベントである。イベントにはタイプがありフィールドtypeの値で表される。タイプはDIGIT，OPERATOR，CLEARのいずれかであり，それぞれ電卓の数字キー（0〜9），演算キー（＋など）及びイコールキー（＝），クリアキー（C）を表す。タイプがDIGITのときは数字キーに対応する数値を，OPERATORのときは演算の種類を表す文字又は‘=’をフィールドvalueに保持する。タイプがCLEARのときは，valueは使用しない。'),
          p('（2）インタフェースCalculatorOutputは，電卓上に数値やエラーを表示するメソッドdisplayを宣言する。'),
          p('（3）クラスCalculatorは電卓本体である。メソッドeventDispatchedはイベントを受け取り，イベントのタイプに応じて演算処理などを行う。なお，二つの数値に対する加減乗除の演算結果はJavaのint型の演算結果に一致するものとする。'),
          p('（4）クラスCalculatorTestはCalculatorをテストするプログラムである。CalculatorOutputを匿名クラスとして実装する。この実装では，メソッドdisplayは指定された数値又は文字列をSystem.outに出力する。メソッドmainは，引数args[0]で与えられた文字列からCalculatorEventを生成して，CalculatorのメソッドeventDispatchedを呼び出す。文字と電卓のキーの対応は，次の表のとおりである。'),
        ]),
        page(51, [
          table('文字と電卓のキー', ['文字', '電卓キー'], [
            ["'0'〜'9'", '数字キー（0〜9）'], ["'+'", '加算キー（＋）'], ["'-'", '減算キー（−）'],
            ["'*'", '乗算キー（×）'], ["'/'", '除算キー（÷）'], ["'='", 'イコールキー（＝）'], ["'C'", 'クリアキー（C）'],
          ]),
          p('例えば，文字列“' + example + '”は，電卓キー' + [...example].map(key =>
            keySymbols[key] ?? key).join('，') +
            'が順に押されたことを表し，この文字列が引数args[0]としてメソッドmainに渡されたとき，プログラムは次のとおり出力する。'),
          code(runKeys(example).join('\n'), 'text'),
          p('〔プログラム1〕'), code(eventProgram, 'java'),
        ]),
        page(52, [
          p('〔プログラム2〕'), code(outputProgram, 'java'),
          p('〔プログラム3〕'), code(calculatorStart + (original ? '' : '\n\n' + calculatorEnd), 'java'),
        ]),
        page(53, [
          ...(original ? [code(calculatorEnd, 'java')] : []),
          p('〔プログラム4〕'), code(testProgram, 'java'),
        ]),
        page(54, [p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', constructorOptions, 'オ', 'java'),
          bank(1, 'b', outputOptions, 'ウ', 'java'),
          bank(1, 'c', digitOptions, 'オ', 'java'),
        ]),
        page(55, [
          p('設問2　次の表は文字列を引数としてメソッドmainを実行したときに，最後に出力された結果を表している。表中の空欄に入れる正しい答えを，解答群の中から選べ。ただし，プログラム中の空欄にはすべて正しい答えが入っているものとする。'),
          table('文字列と最後の出力', ['文字列', '出力'], [[precedence, runKeys(precedence).at(-1)!],
            ...sequences.map((sequence, i) => [sequence, '[' + 'def'[i] + ']'])]),
        ], [{ ...bank(2, 'def', options, keys), ownLabel: '解答群' }]),
      ],
      explanation: 'this(type, 0)は同じクラスの二引数コンストラクタを呼ぶ。new CalculatorOutput()の後のブロックで匿名クラスの二つのdisplayを実装し，c - \'0\'で数字文字を数値へ変える。演算は次の演算キーを読んだ時点で直前の演算を実行するので，' +
        precedence + 'の結果は' + runKeys(precedence).at(-1) + 'になる。イコール以外の演算キーでは入力値を0に戻すので，数字を挟まず演算キーを続けて押すと0を使う。イコールの後は演算を続けるか数字から始め直せる。0で割るとErrorを表示して状態を初期化する。末尾の出力は' +
        sequences.map((sequence, i) => sequence + ' が ' + lastValues[i]).join('，') + '。' +
        (runKeys(divided).includes('Error') && lastValues[2] !== 'Error' ? '最後の入力列ではErrorの後も入力を処理する。' : ''),
    };
  });
