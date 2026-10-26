import type {StudyTerm} from '../study-acronyms';
export const legacy2018SpringPm11StudyTerms:StudyTerm[]=[
 {term:'API',expansion:'Application Programming Interface',meaning:'他のプログラムから機能を利用するために公開する名前、引数、返値などの取り決め。この問ではcom.example.exprのライブラリを別パッケージcom.example.testから利用する。'},
 {term:'インタフェースと実装',meaning:'Javaのインタフェースは型が備える操作を定める。Expressionはevaluateを要求し、ConstantやAdditionなどの実装クラスはその処理を提供する。式の文字列表現と数値評価は別の操作である。'},
 {term:'抽象クラス',meaning:'共通の状態や処理をまとめつつ、下位クラスに実装を残せるクラス。BinaryOperatorExpressionは左右の式と文字列化を共通化し、演算子の表示や数値評価を具体的な演算のクラスで実装する。'},
 {term:'protected',meaning:'Javaのアクセス制御の一つ。同一パッケージ内から利用でき、別パッケージでも下位クラスの実装から所定の条件で利用できる。この問は別パッケージの下位クラス実装を可能にする文脈であり、一般に下位クラス専用と断定しない。'},
 {term:'toStringとevaluate',meaning:'この問のtoStringは左右の式と演算子を文字列にし、evaluateは式を計算したint値を返す。和が同じでも左右を交換すると式の文字列は変わり、入れ子のtoStringを計算済みの数値へ置き換えることはできない。'},
 {term:'参照同一性と値の等価',meaning:'参照型の==は同じオブジェクトを指すかを比較する。equalsはクラスで上書きして値の等価を定められる。この問のConstantはequalsを上書きしていないので、同じ値をもつ別インスタンスでもObjectの同一性による判定ではfalseになる。'},
 {term:'プリミティブ型int',meaning:'intはJavaのプリミティブな整数型で、オブジェクトではない。evaluateが返すint同士は==で値を比較できるが、そのint値を受信先としてequalsメソッドを呼び出すことはできない。'},
 {term:'文字列結合と評価順',meaning:'Javaの+は、一方が文字列なら文字列結合になる。この問のprintlnでは+が左から結び付くため、空欄cの位置でExpression同士を+で加える場合と、空欄dの位置で既にできた文字列へExpressionを順に連結する場合を区別する。'}
].map(t=>({...t,sources:['2018h30h-fe-pm-11']}));
