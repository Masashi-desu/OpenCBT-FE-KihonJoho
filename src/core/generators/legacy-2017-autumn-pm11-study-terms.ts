import type{StudyTerm}from'../study-acronyms';
export const legacy2017AutumnPm11StudyTerms:StudyTerm[]=[
 {term:'API',expansion:'Application Programming Interface',meaning:'プログラムから利用する機能の名前、引数、返値などを定めるインタフェース。この問題では別の参照資料にある6型9操作の仕様を使い、資料自体の技術機能を生成条件で変更しない。'},
 {term:'Comparator',meaning:'二つの要素の大小関係を比較するJavaのインタフェース。compareは小さい・等しい・大きいに応じて負・0・正を返す。比較値の符号を反転すると、その条件の昇順と降順が入れ替わる。'},
 {term:'MapとHashMap',meaning:'Mapはキーと値の対応を保持するインタフェース、HashMapはハッシュを利用する実装。この問題のキーは順序指定子のString、値はComparator<String>で、putで登録しgetで取り出す。'},
 {term:'ジェネリクスと配列',meaning:'ジェネリクスは扱う型を型引数で指定する仕組み。この問題のMapにはキーと値の二つの型引数が必要。行自体はString[]なので、列はgetではなく配列添字で取り出す。'},
 {term:'安定整列と比較条件の優先順',meaning:'先に指定した条件で大小が決まれば、その結果を返す。同値の場合だけ次の条件を調べ、全条件で同値なら元の順を保つ。安定性はArrays.sortの対象となるオブジェクト配列の条件でもある。'},
 {term:'辞書順と数値順',meaning:'文字列の辞書順では各文字を比較するため、カンマ付きの金額が数値の大小とは異なる順になることがある。数値順ではカンマを取り除いてIntegerへ変換してから比較する。'},
].map(t=>({...t,sources:['2017h29a-fe-pm-11']}));
