/** Display model only. Independent Java execution belongs to development tests. */
export const legacy2018SpringPm11Profiles = ['legacy-2018-spring-pm11-program','legacy-2018-spring-pm11-output','legacy-2018-spring-pm11-bank','legacy-2018-spring-pm11-instruction'] as const;
const names = ['zero','one','two','three','four','five','six','seven','eight','nine'];
export function legacy2018SpringPm11Model(values: readonly number[]) {
  if(values.length!==3||values.some((n,i)=>!Number.isSafeInteger(n)||n<0||n>[3,4,1][i]))throw Error('PARAMETER_CONSTRAINT');
  const [pi,qi,ki]=values,p=pi+1,q=qi+5,k=[6,9][ki],pn=names[p],qn=names[q];
  return {p,q,k,pn,qn,sum:p+q,first:`(${p} + ${q}) = ${p+q}`,third:`((${p} + ${q}) - (${p} - ${q}))`};
}
export function legacy2018SpringPm11Banks(values: readonly number[]) {const m=legacy2018SpringPm11Model(values);return [
 ['com.example.expr','com.example.test','static com.example.expr','static com.example.test'],
 [`${m.p}, ${m.q}`,`${m.q}, ${m.p}`,m.qn,`${m.qn}, ${m.pn}`,m.pn,`${m.pn}, ${m.qn}`],
 ['add','add.evaluate()',m.qn,`${m.qn}.evaluate()`,m.pn,`${m.pn} + ${m.qn}`,`${m.pn}.evaluate()`],
 ['下位クラスを実装するクラスだけで使える','上位クラスの実装が下位クラスで改変されない','通常のアプリケーションがどのパッケージからでも呼び出せる','パッケージcom.example.expr内の下位クラスだけで使える'],
 [m.third,`((${m.sum}) - (${m.p-m.q}))`,`(${m.p} + ${m.q} - ${m.p} - ${m.q})`,`(${m.p} + ${m.q}) - (${m.p} - ${m.q})`,'0',String(2*m.q)],
 [`new Constant(${m.k}) == new Constant(${m.k})`,`new Constant(${m.k}).equals(new Constant(${m.k}))`,`new Constant(${m.k}).evaluate() == new Constant(${m.k}).evaluate()`,`new Constant(${m.k}).evaluate().equals(new Constant(${m.k}).evaluate())`]
 ];}
export function legacy2018SpringPm11Programs(values: readonly number[]) {const m=legacy2018SpringPm11Model(values);return [
`package com.example.expr;

public interface Expression {
    public int evaluate();
}`,
`package com.example.expr;

public class Constant implements Expression {
    private final int value;

    public Constant(int value) {
        this.value = value;
    }

    public int evaluate() {
        return value;
    }

    public String toString() {
        return String.valueOf(value);
    }
}`,
`package com.example.expr;

public class Addition implements Expression {
    private final Expression left, right;

    public Addition(Expression left, Expression right) {
        if (left == null || right == null) {
            throw new NullPointerException();
        }
        this.left = left;
        this.right = right;
    }

    public int evaluate() {
        return left.evaluate() + right.evaluate();
    }

    public String toString() {
        return String.format("(%s + %s)", left, right);
    }
}`,
`package com.example.test;

import [a].Addition;
import [a].Constant;
import [a].Expression;

public class Test {
    public static void main(String[] args) {
        Expression ${m.pn} = new Constant(${m.p});
        Expression ${m.qn} = new Constant(${m.q});
        Expression add = new Addition([b]);
        System.out.println([c] + " = " + [d]);
        /* α */
    }
}`,
`package com.example.expr;

public abstract class BinaryOperatorExpression implements Expression {
    private final Expression left, right;

    protected BinaryOperatorExpression(Expression left, Expression right) {
        if (left == null || right == null) {
            throw new NullPointerException();
        }
        this.left = left;
        this.right = right;
    }

    protected Expression getLeft() {
        return left;
    }

    protected Expression getRight() {
        return right;
    }

    protected abstract String getOperator();

    public String toString() {
        return String.format("(%s %s %s)", getLeft(), getOperator(), getRight());
    }
}`,
`package com.example.test;

import [a].BinaryOperatorExpression;
import [a].Expression;

public class Subtraction extends BinaryOperatorExpression {
    public Subtraction(Expression left, Expression right) {
        super(left, right);
    }

    public int evaluate() {
        return getLeft().evaluate() - getRight().evaluate();
    }

    public String getOperator() {
        return "-";
    }
}`];}
export function legacy2018SpringPm11Instructions(values:readonly number[]) {const m=legacy2018SpringPm11Model(values);return [
 '設問1 A君は、クラスConstant及びAdditionをAPIとして呼び出すテストをするために、クラスTestをパッケージcom.example.testに作成して実行したところ、図1の出力結果を得た。プログラム4中の［　］に入れる正しい答えを、解答群の中から選べ。',
 '設問2 次の記述中の［　］に入れる正しい答えを、解答群の中から選べ。',
 'このクラスをBさんに見てもらったところ、“ライブラリで用意されたAPIを呼び出すアプリケーションで二項演算式を表すクラスの実装に使えるようにすることが目的なので、［　］ようにするために、コンストラクタとメソッドgetLeft、getRight及びgetOperatorはpublicではなくprotectedにすべきである”という指摘を受け、その修正をしてプログラム5を作成した。',
 '設問3 次の記述中の［　］に入れる正しい答えを、解答群の中から選べ。ここで、プログラム6中の［a］には、設問1の正しい答えが入っているものとする。',
 'プログラム6をテストするために、プログラム4のメソッドmainの/* α */の行を図2に示す行に置き換えて実行したところ、図1に示した出力結果に加え、出力結果“［　］”を得た。',
 '設問4 次の記述中の［　］に入れる正しい答えを、解答群の中から選べ。',
 'Bさんから、更に次の指摘を受けた。“オブジェクトの等価についての考慮も必要である。例えば、［　］を評価すると、二つのインスタンスが表す値が等しいのでtrueになるべきだが、今のクラスConstantの実装ではfalseになる。”'
 ];}
export function legacy2018SpringPm11Figure(profile:string,values:readonly number[]) {const axis=values.slice(0,3),m=legacy2018SpringPm11Model(axis),group=values[3];
 if(!legacy2018SpringPm11Profiles.includes(profile as typeof legacy2018SpringPm11Profiles[number]))throw Error('UNKNOWN_LEGACY_2018_SPRING_PM11_PROFILE');
 const count=profile.endsWith('-program')?6:profile.endsWith('-output')?2:profile.endsWith('-instruction')?7:6;
 if(values.length!==4||!Number.isSafeInteger(group)||group<0||group>=count)throw Error('PARAMETER_CONSTRAINT');
 if(profile.endsWith('-program'))return {kind:'program' as const,text:legacy2018SpringPm11Programs(axis)[group],caption:`プログラム${group+1}`,alt:`プログラム${group+1}。${legacy2018SpringPm11Programs(axis)[group]}`};
 if(profile.endsWith('-output')){const text=group===0?m.first:`System.out.println(new Subtraction(add, new Subtraction(${m.pn}, ${m.qn})));`,caption=group===0?'図1 メソッドmainの出力結果':'図2 メソッドmainの/* α */の行を置き換える行';return {kind:'output' as const,text,caption,alt:`${caption}。${text}`};}
 if(profile.endsWith('-instruction'))return {kind:'instruction' as const,text:legacy2018SpringPm11Instructions(axis)[group],caption:['設問1の指示文','設問2の指示文','設問2の本文','設問3の指示文','設問3の本文','設問4の指示文','設問4の本文'][group],alt:legacy2018SpringPm11Instructions(axis)[group]};
 const captions=['aに関する解答群','bに関する解答群','c、dに関する解答群','設問2の解答群','設問3の解答群','設問4の解答群'],bank=legacy2018SpringPm11Banks(axis)[group];return {kind:'bank' as const,text:bank.map((s,i)=>`${'アイウエオカキ'[i]} ${s}`).join('\n'),caption:captions[group],alt:`${captions[group]}。${bank.map((s,i)=>`${'アイウエオカキ'[i]} ${s}`).join('。')}`};
}
