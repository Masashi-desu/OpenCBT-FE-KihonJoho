/** IPA平成28年度秋期FE午後問11。Javaのコードは表示専用。 */
import{field,p,code,variableNotes,type GeneratedBody}from'./definition';
import type{AfternoonBookletDefinition}from'./afternoon-booklet-extension-contract';
import{selectCase,sourceDiagram,panelAlt,heading,fixedReferences,answerBody,pageAlt,choiceBankText,type Panel,type SourcePage}from'./legacy-2016-autumn-pm-09-13-support';
export const q11Banks={a:['extends','implements','imports','inherits','requires','throws'],bc:['ordinal()','stack.peek()','stack.pop()','stack.push(0)','stack.push(ordinal())','values()'],d:['DigitKey','Key','stack.pop()','this','val1','val2'],e:['Calculator','Character','DigitKey','Integer','Key','OperationKey'],fg:['0','2','4','8','16','32','64','ArithmeticException','Error']};
export const q11Programs=[`import java.util.Stack;
public interface Key {
    public void operateOn(Stack<Integer> stack);
}`,`import java.util.Stack;
enum DigitKey [a] Key {
    DIGIT0, DIGIT1, DIGIT2, DIGIT3, DIGIT4,
    DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9;
    public void operateOn(Stack<Integer> stack) {
        stack.push([b] * 10 + [c]);
    }
}`,`import java.util.Stack;
enum OperationKey [a] Key {
    ADD, SUBTRACT, MULTIPLY, DIVIDE, EQUAL, CLEAR;
    public void operateOn(Stack<Integer> stack) {
        if (this == EQUAL || this == CLEAR) {
            return;
        }
        int val2 = stack.pop();
        int val1 = stack.pop();
        stack.push(calculate(val1, val2));
    }
    private int calculate(int val1, int val2) {
        switch ([d]) {
        case ADD:
            return val1 + val2;
        case SUBTRACT:
            return val1 - val2;
        case MULTIPLY:
            return val1 * val2;
        case DIVIDE:
            return val1 / val2;
        default:
            throw new AssertionError(toString());
        }
    }
}`,`import java.util.Stack;
public class Calculator {
    private final Stack<Integer> stack = new Stack<Integer>();
    private Key pendingKey;
    public Calculator() {
        stack.push(0);
    }
    public void onKeyPressed(Key key) {
        System.out.println(key);
        if (key instanceof DigitKey) {
            if (pendingKey == OperationKey.EQUAL) {
                reset();
            }
            key.operateOn(stack);
            System.out.println(stack.peek());
        } else if (key == OperationKey.CLEAR) {
            reset();
            System.out.println(stack.peek());
        } else {
            try {
                if (pendingKey != null) {
                    pendingKey.operateOn(stack);
                }
                System.out.println(stack.peek());
                pendingKey = key;
                if (key != OperationKey.EQUAL) {
                    stack.push(0);
                }
            } catch (ArithmeticException e) {
                System.out.println("Error");
                reset();
            }
        }
    }
    private void reset() {
        stack.clear();
        stack.push(0);
        pendingKey = null;
    }
}`,`import java.util.HashMap;
import java.util.Map;
public class CalculatorTest {
    public static void main(String[] args) {
        Map<Character, [e]> map = new HashMap<Character, [e]>();
        // 文字と列挙OperationKeyの定数の対応をmapに格納する。
        for (OperationKey key : OperationKey.values()) {
            map.put("+-*/=C".charAt(key.ordinal()), key);
        }
        // 数字と列挙DigitKeyの定数の対応をmapに格納する。
        for (DigitKey key : DigitKey.values()) {
            map.put("0123456789".charAt(key.ordinal()), key);
        }
        Calculator calc = new Calculator();
        String chars = args[0];
        // charsの各文字をキーの定数に変換し，メソッドonKeyPressedを呼び出す。
        for (int i = 0; i < chars.length(); i++) {
            calc.onKeyPressed(map.get(chars.charAt(i)));
        }
    }
}`];
/** Source stack machine; native Java and a separate accumulator oracle test it. */
export function q11Run(argument:string):string[]{let stack=[0],pending:string|null=null;const out:string[]=[];const reset=()=>{stack=[0];pending=null;};const names:Record<string,string>={'+':'ADD','-':'SUBTRACT','*':'MULTIPLY','/':'DIVIDE','=':'EQUAL',C:'CLEAR'};for(const key of argument){out.push(/^[0-9]$/.test(key)?'DIGIT'+key:names[key]);if(/^[0-9]$/.test(key)){if(pending==='=')reset();stack.push(((stack.pop()!)*10+Number(key))|0);out.push(String(stack.at(-1)));}else if(key==='C'){reset();out.push(String(stack.at(-1)));}else{if(pending&&pending!=='='&&pending!=='C'){const b=stack.pop()!,a=stack.pop()!;if(pending==='/'&&b===0){out.push('Error');reset();continue;}stack.push((pending==='+'?a+b:pending==='-'?a-b:pending==='*'?Math.imul(a,b):Math.trunc(a/b))|0);}out.push(String(stack.at(-1)));pending=key;if(key!=='=')stack.push(0);}}return out;}
const candidates=[2,4,8].flatMap(z=>['8/2/=','16/2/2=','32/2/2='].map(g=>({f:`2*4C${z}=`,g})));
export function q11Input(values:readonly number[]){const input=candidates[selectCase(values,9)];return{...input,fResult:q11Run(input.f).at(-1)!,gResult:q11Run(input.g).at(-1)!};}
export const q11Profiles=['digit-enum-program','operation-enum-program','test-map-program','example-output','argument-results'];
export function q11Panel(suffix:string,values:number[]):Panel{const input=q11Input(values);if(suffix==='example-output')return{kind:'code',language:'text',text:'DIGIT2\n2\nMULTIPLY\n2\nDIGIT3\n3\nEQUAL\n6',framed:true};if(suffix==='argument-results')return{kind:'table',columns:['文字列（引数）','出力（最後の行）'],rows:[['2*6/3=','4'],['-2=','-2'],['2*4==','8'],[input.f,'[f]'],[input.g,'[g]']]};const i=q11Profiles.indexOf(suffix);if(i<0)throw Error('FIGURE_PROFILE');return{kind:'code',language:'java',text:q11Programs[[1,2,4][i]]};}
const refs=fixedReferences([69,70]);
function pages(index:number):SourcePage[]{const x=q11Input([index]);const fig=(s:string,c:string)=>sourceDiagram(11,s,index,c,panelAlt(q11Panel(s,[index])));return[
{page:53,blocks:[p('問11 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'),heading('〔プログラムの説明〕'),p('整数値の加減乗除の演算をする電卓のプログラムである。この電卓は，数字キー，加減乗除の各演算キー，イコールキー及びクリアキーをもつ。プログラムは，キーが押されたとき，それぞれのキーに対応する処理を実行する。数値などの表示は，System.out.printlnを呼び出して行う。'),p('(1) インタフェースKeyは，電卓のキーが押されたときの処理を実行するメソッドを定義する。メソッドoperateOnは，引数で与えられたクラスjava.util.Stackのインスタンス（以下，スタックという）に対して，キーに対応する処理を実行する。'),p('(2) 列挙DigitKeyは，数字キーを表す定数DIGIT0〜DIGIT9を定義する。メソッドoperateOnは，キーを10進数の入力として処理する。引数で与えられたスタックの先頭に格納されている値は0（初期値）又は入力中の数値であり，その値を更新する。'),p('(3) 列挙OperationKeyは，加減乗除の各演算キー，イコールキー及びクリアキーを表す定数ADD，SUBTRACT，MULTIPLY，DIVIDE，EQUAL及びCLEARを定義する。メソッドoperateOnは，加減乗除の各演算キーに対応する演算を，スタックの内容に対して実行する。'),p('(4) クラスCalculatorは，電卓本体を表す。フィールドstackは，電卓内部の数値の状態を表すスタックを保持する。フィールドpendingKeyは，演算に必要な数値の入力が終わるまで演算キーを保持する。また，イコールキーが押されたときは，イコールキーを保持する。例えば，キーの定数DIGIT2，ADD，DIGIT4が順に処理されたとき，スタックに格納されている値は先頭から4，2であり，pendingKeyの値はADDである。次にキーの定数EQUALが処理されたとき，演算キーADDの加算処理が実行され，スタックに格納されている値は6となり，pendingKeyの値はEQUALとなる。ここで，二つの数値に対する加減乗除の演算結果は，Javaのint型の演算結果に一致するものとする。')]},
{page:54,blocks:[p('メソッドonKeyPressedは，電卓のキーが押されたときに呼び出される。押されたキーは，引数で与えられる。押されたキー及び電卓の内部状態に基づいて，処理を実行する。'),p('(5) クラスCalculatorTestは，クラスCalculatorをテストするプログラムである。メソッドmainは，まず，文字と電卓の各キーとの対応を作成し，クラスCalculatorのインスタンスを生成する。次に，引数で与えられた文字列の各文字をキーの定数に変換し，そのキーの定数を引数としてクラスCalculatorのインスタンスのメソッドonKeyPressedを呼び出す。例えば，メソッドmainの引数として文字列"2*3="が与えられたとき，それぞれの文字を，キーの定数DIGIT2，MULTIPLY，DIGIT3，EQUALに変換し，逐次それぞれのキーの定数を引数としてメソッドonKeyPressedを呼び出す。メソッドmainを実行したときの出力を図1に示す。'),fig('example-output','図1 メソッドmainを実行したときの出力'),heading('〔プログラム1〕'),code(q11Programs[0],'java'),heading('〔プログラム2〕'),fig('digit-enum-program','プログラム2')]},
{page:55,blocks:[heading('〔プログラム3〕'),fig('operation-enum-program','プログラム3'),heading('〔プログラム4〕'),code(q11Programs[3],'java')]},
{page:56,blocks:[]},
{page:57,blocks:[heading('〔プログラム5〕'),fig('test-map-program','プログラム5'),p('設問1 プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。')],banks:[choiceBankText('a',q11Banks.a),choiceBankText('b，c',q11Banks.bc),choiceBankText('d',q11Banks.d)]},
{page:58,blocks:[p('設問2 表1は，文字列を引数としてメソッドmainを実行したときの出力の最後の行（図1の場合は6）を表している。表中の［空欄］に入れる正しい答えを，解答群の中から選べ。ここで，プログラム中の［空欄］には，全て正しい答えが入っているものとする。'),fig('argument-results','表1 文字列（引数）と出力（最後の行）')],banks:[choiceBankText('e',q11Banks.e),choiceBankText('f，g',q11Banks.fg)]}
];}
export function q11OriginalPageAlt(){const alt=pageAlt(pages(0));const program2=q11Programs[1],p2split=program2.indexOf('    public void');alt[54]=alt[54].replace(program2,program2.slice(0,p2split));alt[55]=program2.slice(p2split)+'\n\n'+alt[55];const program4=q11Programs[3],p4split=program4.indexOf('    private Key');alt[55]=alt[55].replace(program4,program4.slice(0,p4split));alt[56]=program4.slice(p4split);return alt;}
export function q11Build(values:number[]):GeneratedBody{const i=selectCase(values,9),x=q11Input(values);return answerBody(pages(i).flatMap(pg=>pg.blocks),[{names:['a'],labels:['設問1 a'],options:q11Banks.a,keys:[1]},{names:['b','c'],labels:['設問1 b','設問1 c'],options:q11Banks.bc,keys:[2,0]},{names:['d'],labels:['設問1 d'],options:q11Banks.d,keys:[3]},{names:['e'],labels:['設問1 e'],options:q11Banks.e,keys:[4]},{names:['f','g'],labels:['設問2 f','設問2 g'],options:q11Banks.fg,keys:[q11Banks.fg.indexOf(x.fResult),q11Banks.fg.indexOf(x.gResult)]}],`a：列挙型がインタフェースKeyを実装する宣言はimplements。extendsなどはこの宣言形式に使えない。b：現在入力中の値をstack.pop()で取り出して置換し，c：DIGIT0〜DIGIT9の宣言順を表すordinal()を加える。peek()では古い値がスタックに残る。Stack.push(E)は積んだ要素Eを返すので，push(0)やpush(ordinal())も式に利用できるが，余分な値を積んでしまい，桁の更新や後続の演算で使うスタックの状態が正しくならない。d：現在押された演算キーthisで分岐する。e：両列挙型が実装する共通のKey型を使えば，両種類を同じMapへ格納できる。\n${x.f}の最後は${x.fResult}。Cはresetでスタックを0にしpendingKeyもnullにする。${x.g}の最後は${x.gResult}。演算キーを押すと次の入力用0を積むので，数値を入力せずに次の演算を確定した場合は0が右辺になる。ゼロ除算はArithmeticExceptionとしてcatchされ，例外名ではなくErrorを表示してresetする。繰り返した=はEQUALのoperateOnが何もせず，結果を保つ。`,refs.contexts);}
export const legacy2016AutumnPm11Definition:AfternoonBookletDefinition={source:'2016h28a-fe-pm-11',title:'旧制度・午後：Javaの列挙型と電卓',fields:[field('条件の選択番号',0,8)],reference:[0],sourceAnswer:'設問1 a=イ，b=ウ，c=ア，d=エ，e=オ／設問2 f=イ，g=ケ',version:'3.6.0',publicNotes:'原問題の5プログラムと全解答欄を維持し，設問2のキー入力文字列を変更します。Javaの整数演算と例外処理に従います。',notes:variableNotes+' 全6頁，7欄，33固有択／48参照。9有限候補。reference0原入力。実Java8互換コンパイルと独立accumulator/32bit oracleで全候補を検算。',fixedReferenceAssetIds:refs.assets,build:q11Build};
