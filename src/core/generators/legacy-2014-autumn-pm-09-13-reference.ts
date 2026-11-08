import { p, table, type GeneratedBody } from './definition';

type Reference = NonNullable<GeneratedBody['contexts']>[number];
export const autumn2014PmJavaTitle = '問11 Java APIの参考資料（編集資料）';
export const autumn2014PmJavaSourceUrl = 'https://docs.oracle.com/javase/8/docs/api/java/util/Date.html';

export function autumn2014PmJavaReference(): Reference {
  return {
    title: autumn2014PmJavaTitle,
    blocks: [
      p('java.util.Dateは一つの時点を表す。基準時刻は1970年1月1日00:00:00 UTCで，基準から前後したミリ秒数をlongで扱う。'),
      table('この問題で使う操作',['操作','Java SE 8での動作'],[
        ['Date(long milliseconds)','指定時点を表すDateを作る。負の値は基準より前を指す。'],
        ['int compareTo(Date other)','呼出し元が比較先より早いと負，同時なら0，遅いと正を返す。比較先がnullならNullPointerExceptionを投げる。'],
        ['long getTime()','保持している時点を基準からのミリ秒数で返す。'],
        ['void setTime(long milliseconds)','このインスタンスが保持する時点を指定値へ変える。戻り値はない。'],
        ['Object clone()','同じ時点を保持する別のインスタンスを作って返す。メソッドが宣言する戻り値の型はObject。'],
      ]),
    ],
  };
}

export const autumn2014PmCaslCharacterCodesTitle = '問12 数字と空白の文字コード（編集資料）';
export const autumn2014PmCaslCharacterCodesSourceUrl = 'https://www.rfc-editor.org/rfc/rfc20.html';
export function autumn2014PmCaslCharacterCodesReference(): Reference {
  return {
    title: autumn2014PmCaslCharacterCodesTitle,
    blocks: [p('このプログラムの入出力で使う数字「0」から「9」の文字コードは，16進数の#30から#39まで順に並ぶ。空白の文字コードは#20である。')],
  };
}
