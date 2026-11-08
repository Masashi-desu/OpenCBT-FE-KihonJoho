import { p, table, type GeneratedBody } from './definition';

export const spring2015PmJavaTitle = '問11 Java APIの参考資料（編集資料）';
export const spring2015PmJavaSourceUrls = [
  'https://docs.oracle.com/javase/8/docs/api/java/lang/String.html',
  'https://docs.oracle.com/javase/8/docs/api/java/util/Map.html',
  'https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html',
  'https://docs.oracle.com/javase/8/docs/api/java/util/Set.html',
  'https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html',
] as const;
export function spring2015PmJavaReference(): NonNullable<GeneratedBody['contexts']>[number] {
  return { title:spring2015PmJavaTitle, blocks:[
    p('この資料では，問11で使うJava SE 8の操作を整理する。Stringの添字は0から始まる。長さやchar配列はUTF-16のコード単位で数える。設問では，変換前の各文字が一つのcharに収まる。'),
    table('文字列の操作',['操作','この問題で使う性質'],[
      ['String.format(String format, Object... args)','引数を指定の書式に従って文字列化する。%02Xと%04Xは大文字の16進表記で，幅が2または4になるまで左を0で埋める。幅は最小値である。'],
      ['int indexOf(int ch)','最初に見つかった位置を返す。見つからないときは−1。'],
      ['int length()','文字列のUTF-16コード単位の個数を返す。'],
      ['char[] toCharArray()','元の並びを持つ新しいchar配列を作る。'],
      ['String toLowerCase()','既定のロケールに従って小文字化した結果を返す。設問の英小文字はa〜zを前提とする。'],
      ['String.valueOf(char c)','そのchar一個を持つ文字列を作る。'],
    ]),
    p('Map<K,V>はキーから値を引ける構造で，同じキーには一つの値が対応する。このプログラムはnew HashMap<>()で空のMapを用意する。Set<E>の要素は拡張forで反復できる。HashMapのキー順を文字列の順番としては使えない。'),
    table('変換表の操作',['操作','この問題で使う性質'],[
      ['void clear()','マップを空にする。'],
      ['V get(Object key)','キーを探し，対応する値を返す。未登録ならnull。'],
      ['Set<K> keySet()','登録済みキーの集合を参照する。'],
      ['V put(K key, V value)','キーに値を登録する。すでにキーがあれば値を更新し，前の値を返す。新しいキーなら戻り値はnull。'],
      ['V remove(Object key)','キーの登録を消し，登録されていた値を返す。未登録ならnull。'],
    ]),
  ] };
}
