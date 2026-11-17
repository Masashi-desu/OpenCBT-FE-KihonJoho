import { code, p } from './definition';
import { spring2007PmJavaReference } from './legacy-2007-spring-pm-materials';
import { bank, draftQuestion } from './legacy-2007-spring-pm-06-09-support';
import { drawing } from './legacy-2007-spring-pm-06-09-figures';
import { monthCases } from './legacy-2007-spring-pm-06-09-model';

const nameProgram=`import java.util.Comparator;
import java.util.Locale;

public class NameComparator implements Comparator<String> {
   public int compare(String s1, String s2) {
      String ls1 = s1.toLowerCase(Locale.ENGLISH);
      String ls2 = s2.toLowerCase(Locale.ENGLISH);
      return ls1.compareTo(ls2);
   }
}`;
function valueProgram(index: number) {
  const start = monthCases[index].start;
  const offset = start ? 'i - 1' : 'i';
  const rank = start ? 'i' : 'i + 1';
  return `import java.util.Comparator;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class ValueComparator implements ［a］ {
   private static final String[] monthNames = {
      "january", "february", "march", "april",
      "may", "june", "july", "august",
      "september", "october", "november", "december"
   };
   private static final Map<String, Integer> map
                              = new HashMap<String, Integer>();
   static {
      // 月名とその値（例: may → 5）が対応するようにmapを初期化する。
      for (int i = ${start}; ［b］; i++) {
         // 月名と月の値を対応付ける。
         map.put(monthNames[${offset}], ${rank});
         // 月名の最初の3文字と月の値を対応付ける。
         map.put(monthNames[${offset}].substring(0, 3), ${rank});
      }
   }

   public int compare(String s1, String s2) {
      String ls1 = s1.toLowerCase(Locale.ENGLISH);
      String ls2 = s2.toLowerCase(Locale.ENGLISH);
      return ［c］;
   }
}`;
}
function mainProgram(index: number) {
  return `import java.util.Arrays;

public class MonthNameSorter {
    public static void main(String[] args) {
        final String[] names1 = {
            ${monthCases[index].input.map(value=>JSON.stringify(value)).join(', ')}
        };
        System.out.println(Arrays.toString(names1));

        String[] names2 = names1.clone();
        Arrays.sort(names2, new NameComparator());
        System.out.println(Arrays.toString(names2));

        String[] names3 = names1.clone();
        Arrays.sort(names3, ［d］);
        System.out.println(Arrays.toString(names3));
    }
}`;
}
export const q8 = draftQuestion(8,'Java：月名を辞書順と月番号順で並べる',
  '月の入力列・月番号の昇降順・対応表のループ起点','aエ bア cイ dウ',
  'Comparatorを使う二つの並べ替え、英語の月名と3文字省略形の大小文字を区別しない変換、同順の場合の安定性を維持。例の月名、月番号の昇降順、初期化の添字起点を変更する。Javaの原付属を同梱せず事実の独立記述を用いる。',
  (index,original) => {
    const {start,descending}=monthCases[index];
    const direction = descending ? '月の番号が大きいものから小さいものの順' : '月の番号が小さいものから大きいものの順';
    return {
      pages:[
        {page:29,blocks:[
          p('問8　次のJavaプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p(original?'（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）':'（Javaプログラムで使用するAPIの説明は，参照資料を参照してください。）'),
          p('〔プログラムの説明〕'),
          p('英語の月名（January，…，December）を2種類の順序に並べ替えるプログラムである。月名は，文書の索引などを作成する場合は辞書順に並べ替える必要があるが，日付の一部として並べ替えるときは月の順番に並んだ方が都合がよい。並べ替えは，次のクラスメソッドを呼び出して行う。'),
          code('java.util.Arrays.sort(Object[], java.util.Comparator)','java'),
          p('このメソッドは，引数で与えられたComparatorのインスタンスのメソッドcompareを呼び出して配列中の要素を比較し，並べ替える。ここでは，インタフェースComparatorを実装する次の二つのクラスを定義する。'),
          p('(1) クラスNameComparatorは，引数で与えられた文字列を小文字の文字列に変換し，クラスStringのメソッドcompareToを呼び出して比較した結果を返すメソッドを実装している。'),
          p('(2) クラスValueComparatorは，引数で与えられた文字列（月名）を月の値（例えば，Aprilは4）に変換し，月の値で比較した結果を返すメソッドを実装している。' +
            (index===0?'': ' 月番号で並べ替えるときは，'+direction+'にする。') + '引数の文字列は，大文字と小文字を区別しない。月名は，Jan，Febなど，3文字の省略形を指定してもよい。'),
          p('ただし，二つのクラスともメソッドcompareに与えられる月名は正しいものとする。'),
          p('クラスMonthNameSorterは，上記の二つのComparatorを実装したクラスを用いて，月名を並べ替える。メソッドmainを実行した結果を，次に示す。'),
          drawing('8-output',index),
        ]},
        {page:30,blocks:[p('〔プログラム1〕'),code(nameProgram,'java'),p('〔プログラム2〕'),code(valueProgram(index),'java')]},
        {page:31,blocks:[p('〔プログラム3〕'),code(mainProgram(index),'java'),p('設問　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')],
          banks:[
            bank('a',['Comparator<int>','Comparator<Integer>','Comparator<Object>','Comparator<String>'],'エ','java'),
            bank('b',['i < monthNames.length','i <= monthNames.length','i > monthNames.length','i >= monthNames.length'],start?'イ':'ア','java'),
            bank('c',['map.get(ls1) + map.get(ls2)','map.get(ls1) - map.get(ls2)','map.get(ls1) / map.get(ls2)','map.get(ls2) - map.get(ls1)'],descending?'エ':'イ','java'),
            bank('d',['new Comparator()','new Comparator<String>()','new ValueComparator()','new ValueComparator<String>()'],'ウ','java'),
          ]},
      ],
      contexts:[spring2007PmJavaReference(8)],
      explanation:[
        'a：比較する対象は文字列なのでComparator<String>を実装する。',
        'b：'+(start?'月の値1から12がループの変数iで，添字はi−1になるので i <= monthNames.length である。':'添字は0から11なので i < monthNames.length である。'),
        'c：'+(descending?'大きい月を先にするため第2引数の値から第1引数の値を引く。':'小さい月を先にするため第1引数の値から第2引数の値を引く。')+' 同じ月に対応する値の差は0になる。',
        'd：月の値で比較する具体的な実装ValueComparatorのインスタンスを渡す。Arrays.sortは同じ比較結果の要素の元の順序を保つ。',
      ].join('\n'),
    };
  });
