import type{Block}from'../types';
import{p,table}from'./definition';
// Independently phrased behavioral facts; no Oracle/IPA API appendix prose or layout.
export function autumnJavaReference():Block[]{return[
 p('独立編集したJava参照資料。問11の原API付録に代えて、識別子と動作を独自の文章・例で示している。この資料置換は年度別問題側にも適用する改変であり、公式API付録の再録ではない。対象はJava 8で使用できるjava.utilの型である。'),
 p('Map<K,V>はキーKから値Vへの対応を扱う。等しいキーを同時に別々の登録として保持することはできない。HashMap<K,V>はその実装の一つで、new HashMap<>()で空の対応を作る。nullもキー・値として扱える。HashMap自体は複数スレッドの操作を同期しない。共有する対応を変更する場合は、使用側が必要な排他を行う。キーの走査順には依存しない。'),
 table('対応を扱う操作（独立した説明・例）',['操作','変更と返り値','独立例'],[
  ['containsKey(k)','kの登録があるかをbooleanで返す。','空のmならm.containsKey("x")はfalse。'],
  ['get(k)','kに対応する値を返す。未登録ならnull。nullを値として登録した場合もnullなので、登録の有無はcontainsKeyで区別する。','m.put("x",7)後のm.get("x")は7。'],
  ['put(k,v)','kの値をvにする。同じキーの古い値を返し、新規登録のときはnull。古い値がnullの場合もnull。','m.put("x",7)の後、m.put("x",9)は7を返し、現在値は9。'],
  ['remove(k)','kの登録を削除し、削除前の値を返す。未登録又は古い値がnullのときはnull。','現在値が9ならm.remove("x")は9を返し、その後getはnull。'],
  ['keySet()','キーを読み書きするビューを返す。独立したコピーではなく、元の対応の変更が見える。返された集合からの削除は元の対応も削除する。集合へのaddはできない。','s=m.keySet()の後にm.put("y",2)を行うとsにも"y"が現れる。'],
  ['clear()','全ての登録を削除する。返り値はない。','実行後はkeySet()も空となる。'],
 ]),
 p('List<E>は位置の順序をもつ要素列であり、Collection<E>を継承する。ArrayList<E>はその実装の一つである。new ArrayList<>()は要素のない列を作る。add(e)は末尾へeを追加してtrueを返す。nullや同じ値を複数入れることができる。clear()は列の要素を全て取り除く。Mapの値として列を登録していても、列のclearだけではMapのキーは消えない。'),
 table('要素列を扱う操作（独立した説明・例）',['操作','変更と返り値','独立例'],[
  ['add(e)','末尾へ要素eを一つ追加する。','空のxsへadd("A"), add("B")の順で追加すると列はA,Bとなる。'],
  ['toString()','両端を[と]で囲み、要素の文字列表現を順に並べる。要素間にはカンマの直後に半角空白を一つ置く。','上のxs.toString()は"[A, B]"。空なら"[]"。'],
 ]),
 p('補足：new ArrayList<>(collection)は渡した要素列の現在の順序を別のリストへ写す。元の列への要素追加・削除はコピーへ伝わらない。ただし要素そのものを複製する深いコピーではない。このコンストラクタは原API付録には列挙されておらず、必要な改変条件でのみ用いる補足である。'),
 ];}
