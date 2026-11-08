import { p, table, type GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
export const spring2014PmJavaReferenceTitle = '問11 Java APIの参考資料（編集資料）';
export const spring2014PmJavaSourceUrls = [
  'https://docs.oracle.com/javase/8/docs/api/java/util/Map.html',
  'https://docs.oracle.com/javase/8/docs/api/java/util/TreeMap.html',
  'https://docs.oracle.com/javase/8/docs/api/java/util/Set.html',
  'https://docs.oracle.com/javase/8/docs/api/java/util/TimeZone.html',
];
export function spring2014PmJavaReference(): Reference {
  return {title:spring2014PmJavaReferenceTitle,blocks:[
    p('java.util.Map<K,V>はキー型K、値型Vの対応を管理する。キー一つにつき値を一つ保持する。Set<E>は要素型Eの重複しない集合を表す。'),
    table('この問題で使用するJava SE 8の操作',['操作','動作'],[
      ['V Map.get(Object key)','キーを指定して現在対応する値を取り出す。登録のないキーの結果はnull。'],
      ['Set<K> Map.keySet()','登録されているキーを集合として参照する。TreeMapのキーを順にたどると昇順になる。'],
      ['V Map.put(K key, V value)','値をキーに割り当てる。既存の割当ては置き換え、以前の値を返す。以前に値を割り当てていなければnullを返す。'],
      ['TreeMap<K,V>()','空のマップを作る。このコンストラクタではキー自身の比較方法による自然順序を使う。'],
      ['static TimeZone TimeZone.getDefault()','Java実行環境の既定のタイムゾーンを取得する。通常、実行環境のあるシステムの設定から定まる。'],
      ['int TimeZone.getOffset(long date)','1970年1月1日00:00 UTCを0とするミリ秒数dateで時点を指定する。その時点のUTCからの時差をミリ秒単位で返す。日本標準時ではgetOffset(0L)が32400000になる。'],
    ]),
  ]};
}

export const spring2014PmCaslCodesTitle = '問12 使用する文字のコード（編集資料）';
export const spring2014PmCaslCodesSourceUrl = 'https://www.rfc-editor.org/rfc/rfc20.html';
export function spring2014PmCaslCodesReference(): Reference {
  return {title:spring2014PmCaslCodesTitle,blocks:[
    p('この問題で参照する文字のコードを16進数で示す。空白は#0020、ピリオドは#002E、数字の0～9は#0030～#0039で連続する。演算子の*、+、-はそれぞれ#002A、#002B、#002Dである。'),
    p('図中の△は文字列に含まれる空白の表示記号である。英字及び例の#などの記号は数字の範囲に含まれない。'),
  ]};
}
