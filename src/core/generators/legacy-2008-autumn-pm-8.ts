import {code,p} from './definition';
import {bank,createDefinition} from './legacy-2008-autumn-pm-06-09-support';
import {drawing} from './legacy-2008-autumn-pm-06-09-figures';
import {bookMethod,bookOptions,bookTester} from './legacy-2008-autumn-pm-8-model';
import {autumn2008PmPageAssetId,autumn2008PmReference} from './legacy-2008-autumn-pm-materials';

export const javaReferencePages=[60,61,62] as const;
export const bookProgram=`import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;

public class PhoneBook {
   Map<String, Set<String>> book =
                               new HashMap<String, Set<String>>();

   public void add(String name, String phoneNumber) {
      if (name == null || phoneNumber == null) {
         throw new NullPointerException();
      }
      // 数字と“#”だけからなる1文字以上の文字列でなければ例外を投げる。
      if (!phoneNumber.matches("^[0-9#]+$")) {
         throw new IllegalArgumentException();
      }
      Set<String> numbers = book.get(name);
      if (numbers == null) {
         numbers = new HashSet<String>();
      }
      numbers.［a］;
      book.［b］;
   }

   public Set<String> get(String name) {
      // 指定した名前に対応付けられたすべての電話番号の集合を返す。
      Set<String> numbers = book.get(name);
      Set<String> set = new HashSet<String>();
      if (numbers != null) {
         set.addAll(numbers);
      }
      return set;
   }

   public void remove(String name) {
      book.remove(name);
   }

   public void remove(String name, String phoneNumber) {
      Set<String> numbers = book.get(name);
      if (numbers != null) {
         numbers.［c］;
         // 対応付けられた電話番号がなくなれば，電話帳から名前を削除する。
         if (numbers.isEmpty()) {
            book.remove(name);
         }
      }
   }
}`;
export const q8=createDefinition(8,'Java：電話帳の登録・削除・前方一致検索','登録例と前方一致で検査する値・返却集合',
  'aイ bウ cク／設問2イ',
  '名前に複数番号を対応させるMap/Set、null・番号形式・削除の前提、継続行、全4欄を維持。設問2は名前又は番号のどちらで照合し、名前又は番号のどちらを集合に入れるかを変える。',
  index=>{
    const explanations=[
      'keySet() の要素は名前。前方一致する key 自体を ret に入れるので，該当する名前の集合が返る。',
      '名前ごとに book.get(key) から番号を列挙する。各番号 num で前方一致を調べ，該当する num を ret に入れる。',
      '名前ごとに番号を列挙し，番号の前方一致を調べる。条件を満たした番号をもつ名前 key を ret に入れる。',
      '名前 key の前方一致を調べ，該当した名前に対応する番号の集合を addAll で ret に加える。',
    ];
    return {
      pages:[
        {number:31,blocks:[
          p('問8　次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'),
          p('〔プログラムの説明〕'),
          p('クラス PhoneBook は電話帳を表すクラスである。一つの名前に複数の電話番号を対応付けることができる。'),
          p('PhoneBook のメソッドは，次のとおりである。ここで，引数 name は名前，phoneNumber は電話番号を表す。'),
          code('void add(String name, String phoneNumber)','java'),
          p('電話帳に名前と電話番号を登録する。このメソッドを複数回呼ぶことによって，一つの名前に複数の電話番号を対応付けることができる。引数のいずれか又は両方が null のときは，NullPointerException を投げる。また，電話番号は，数字と“#”だけからなる1文字以上の文字列とし，誤りがある場合には IllegalArgumentException を投げる。'),
          code('Set<String> get(String name)','java'),
          p('引数に指定した名前に対応付けられたすべての電話番号の集合を返す。'),
          code('void remove(String name)','java'),
          p('引数に指定した名前とそれに対応付けられているすべての電話番号を削除する。'),
          code('void remove(String name, String phoneNumber)','java'),
          p('引数に指定した名前に対応付けられている指定した電話番号を削除する。'),
          p('クラス PhoneBookTester はテスト用のプログラムである。実行結果を図1に示す。'),
          drawing('8-result',index),
        ]},
        {number:32,blocks:[p('〔プログラム1〕'),code(bookProgram,'java')]},
        {number:33,blocks:[p('〔プログラム2〕'),code(bookTester(index),'java'),
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')],banks:[
          bank('abc',['add(name)','add(phoneNumber)','put(name, numbers)','put(name, phoneNumber)',
            'put(numbers, name)','put(phoneNumber, name)','remove(name)','remove(phoneNumber)'],'イウク','java',1),
        ]},
        {number:34,blocks:[
          p('設問2　クラス PhoneBook に図2のメソッドを追加し，機能を拡張した。このメソッドに関する記述として正しい答えを，解答群の中から選べ。'),
          drawing('8-method',index),
        ],banks:[bank('2',bookOptions,'イアウエ'[index])]},
      ],
      contexts:[autumn2008PmReference('Javaプログラムで使用するAPIの説明',javaReferencePages)],
      explanation:[
        'a：numbers は一人分の電話番号の集合なので，phoneNumber を add する。',
        'b：book は名前から電話番号の集合への対応なので，name をキー，numbers を値として登録する。',
        'c：指定された番号だけを numbers.remove(phoneNumber) で削除する。集合が空になった場合には，その名前も book から削除する。',
        '設問2：'+explanations[index],
      ].join('\n'),
    };
  },javaReferencePages.map(autumn2008PmPageAssetId));
