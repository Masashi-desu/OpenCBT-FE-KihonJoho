import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2011-autumn-pm-09-13-support';

export const autumn2011PmJavaReferenceTitle = 'Java APIの参照（独自編集）';
export const addressEntries = [
  ['情報', '太郎', 102, 4567, '東京都千代田区'],
  ['情報', '花子', 102, 4567, '東京都千代田区'],
  ['技術', '太郎', 225, 1234, '横浜市青葉区'],
  ['試験', '一朗', 980, 9876, '仙台市青葉区'],
] as const;
export const addressCases = [
  { name: '太郎', postal3: -1, postal4: -1, address: '青葉区' },
  { name: '花子', postal3: 102, postal4: -1, address: '千代田区' },
  { name: '太郎', postal3: 980, postal4: 9876, address: '仙台市' },
  { name: '一朗', postal3: -1, postal4: 9876, address: '青葉区' },
];
const printable = ([family, name, first, last, address]: typeof addressEntries[number]) =>
  family + ' ' + name + ': 〒' + String(first).padStart(3, '0') + '-' + String(last).padStart(4, '0') + ' ' + address;
const output = languageFigure(11, 'test-output', '図1 テストプログラムの実行結果', index => {
  const { name, postal3, postal4, address } = addressCases[index];
  const names = addressEntries.filter(entry => entry[1] === name);
  const addresses = addressEntries.filter(entry => (postal3 < 0 || postal3 === entry[2]) && (postal4 < 0 || postal4 === entry[3]) && entry[4].includes(address));
  const result = (selected: readonly (typeof addressEntries[number])[]) => '[' + selected.map(printable).join(', ') + ']';
  return { kind: 'output', text: result([...new Set([...addresses, ...names])]) + '\n' + result(names.filter(entry => addresses.includes(entry))) };
});
export const q11Figures = [output];
const nameStart = `public class Name implements Searchable<Name.Criteria> {
    private final String familyName, givenName;

    public static class Criteria implements ［a］ {
        private final String familyName, givenName;`;
const nameEnd = `
        public Criteria(String familyName, String givenName) {
            this.familyName = familyName;
            this.givenName = givenName;
        }

        private boolean areMetBy(Name name) {
            return (familyName == null
                    || name.familyName.equals(familyName))
                && (givenName == null
                    || name.givenName.equals(givenName));
        }
    }

    public Name(String familyName, String givenName) {
        this.familyName = familyName;
        this.givenName = givenName;
    }

    public String getFamilyName() { return familyName; }

    public String getGivenName() { return givenName; }

    public boolean meets(Criteria criteria) {
        return criteria.areMetBy(this);
    }

    public String toString() {
        return familyName + " " + givenName;
    }
}`;
const addressStart = `public class Address implements Searchable<Address.Criteria> {
    private final int postalCode3, postalCode4;
    private final String addr;

    public static class Criteria implements SearchCriteria {
        private final int postalCode3, postalCode4;
        private final String addr;

        public Criteria(int postalCode3, int postalCode4,
                        String addr) {
            this.postalCode3 = postalCode3;
            this.postalCode4 = postalCode4;
            this.addr = addr;
        }

        private boolean areMetBy(Address address) {
            return (postalCode3 < 0
                    || postalCode3 == address.postalCode3)
                && (postalCode4 < 0
                    || postalCode4 == address.postalCode4)`;
const addressEnd = `                && (addr == null
                    || address.addr.contains(addr));
        }
    }

    public Address(int postalCode3, int postalCode4, String addr) {
        this.postalCode3 = postalCode3;
        this.postalCode4 = postalCode4;
        this.addr = addr;
    }

    public boolean meets(Criteria criteria) {
        return criteria.areMetBy(this);
    }

    public String toString() {
        return String.format("〒%03d-%04d %s",
                             postalCode3, postalCode4, addr);
    }
}`;
const bookStart = `import java.util.HashSet;
import java.util.Set;

public class AddressBook {
    private Set<Entry> book = new HashSet<Entry>();

    public void add(Name name, Address addr) {
        book.add(new Entry(name, addr));
    }

    public void remove(Entry entry) { book.remove(entry); }

    public Set<Entry> meetsAnyOf(SearchCriteria... criteria) {
        Set<Entry> result = new HashSet<Entry>();
        for (SearchCriteria sc : criteria) {
            for (Entry entry : book) {
                if (entry.meets(sc))
                    ［b］;
            }
        }
        return result;
    }

    public Set<Entry> meetsAllOf(SearchCriteria... criteria) {
        Set<Entry> result = new HashSet<Entry>(book);
        for (Entry entry : book) {
            for (SearchCriteria sc : criteria) {
                if (!entry.meets(sc)) {`;
const bookEnd = `                    ［c］;
                    break;
                }
            }
        }
        return result;
    }

    public static class Entry implements
                              Searchable<SearchCriteria> {
        private final Name name;
        private final Address addr;

        public Entry(Name name, Address addr) {
            this.name = name;
            this.addr = addr;
        }

        public Name getName() { return name; }

        public Address getAddress() { return addr; }

        public boolean meets(［d］ criteria) {
            if (criteria instanceof Name.Criteria)
                return name.meets((Name.Criteria) criteria);
            if (criteria instanceof ［e］)
                return addr.meets((［e］) criteria);
            return false;
        }

        public String toString() { return name + ": " + addr; }
    }
}`;
const criterion = 'public interface SearchCriteria {\n}';
const searchable = 'public interface Searchable<T extends SearchCriteria> {\n    public boolean meets(T criteria);\n}';
const testStart = 'public class Test {\n    public static void main(String[] args) {';
const testBody = (index: number) => {
  const { name, postal3, postal4, address } = addressCases[index];
  return `        AddressBook addrbook = new AddressBook();
${addressEntries.map(([family, given, first, last, place]) =>
    `        addrbook.add(new Name("${family}", "${given}"),
                     new Address(${first}, ${last}, "${place}"));`).join('\n')}

        System.out.println(addrbook.meetsAnyOf(
                new Name.Criteria(null, "${name}"),
                new Address.Criteria(${postal3}, ${postal4}, "${address}")));
        System.out.println(addrbook.meetsAllOf(
                new Name.Criteria(null, "${name}"),
                new Address.Criteria(${postal3}, ${postal4}, "${address}")));
    }
}`;
};
const types = ['Address.Criteria', 'Criteria', 'Entry.Criteria', 'Name.Criteria', 'SearchCriteria'];
const collect = ['book.add(entry)', 'book.add(sc)', 'book.remove(entry)', 'book.remove(sc)', 'result.add(entry)', 'result.add(sc)', 'result.remove(entry)', 'result.remove(sc)'];
const allEntries = ['All', 'Any'].flatMap(operator => ['new Name.Criteria("", "")', 'new Name.Criteria(null, null)', 'null'].map(value => 'addrbook.meets' + operator + 'Of(' + value + ')'));

export const q11 = createLanguageDefinition(11, 'Javaの住所録の検索条件と集合', 'addressQueryCase', 'abcde23', 'アオキオアイオ',
  '共通インタフェース・和集合・積集合・2個選ぶ設問を保持し，テストの名前と住所・郵便番号の検索条件と実行結果を変える。空欄は型・演算子の役割で決まり，条件を変えても固定する。',
  index => ({
    pages: [
      page(49, [heading('問11　次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'), heading('〔プログラムの説明〕'),
        p('名前及び住所からなる住所録のエントリの追加，削除及び検索を行う住所録管理プログラムであり，次のクラスからなる。\n（1）クラス Name は，姓及び名をそれぞれ文字列で保持する。\n（2）クラス Address は，郵便番号及び住所を保持する。郵便番号は，上位3桁と下位4桁をそれぞれ int 型の整数で保持する。住所は，文字列で保持する。\n（3）クラス AddressBook は，住所録である。入れ子クラス AddressBook.Entry は，住所録のエントリであり，Name と Address のインスタンスを保持する。クラス AddressBook は，エントリを追加及び削除するメソッドをもつ。'),
        p('クラス Name，Address，及び AddressBook.Entry のインスタンスは，検索可能である。検索処理を支援するために，次のインタフェースを定義する。\n（1）インタフェース SearchCriteria は，検索条件を示すデータ型であり，メソッドをもたない。\n（2）インタフェース Searchable は，これを実装するクラスが検索条件を与えて検索可能であることを示す。検索するときは，メソッド meets を呼び出す。'),
        p('クラス Name 及び Address は，それぞれ入れ子クラス Criteria を定義し，その Criteria を検索条件とするインタフェース Searchable を実装する。\n（1）入れ子クラス Name.Criteria は，引数 familyName 及び givenName でそれぞれ姓及び名を検索条件として指定する。検索条件に含めないときは，null を指定する。\n（2）クラス Name は，インタフェース Searchable を実装する。メソッド meets は，引数で与えられた criteria で実装されたメソッドを呼び出し，このクラスのインスタンスが検索条件に合致するかどうか調べる。\n（3）入れ子クラス Address.Criteria は，引数 postalCode3，postalCode4 及び addr でそれぞれ郵便番号の上位3桁，下位4桁及び住所を検索条件として指')]),
      page(50, [p('定する。検索条件に含めないときは，postalCode3 及び postalCode4 は負の値，addr は null を指定する。住所については，部分文字列が一致する場合も合致しているとみなす。例えば，“京都”は“東京都”の部分文字列なので，合致するとみなす。\n（4）クラス Address は，インタフェース Searchable を実装する。メソッド meets は，引数で与えられた criteria で実装されたメソッドを呼び出し，このクラスのインスタンスが検索条件に合致するかどうか調べる。'),
        p('クラス AddressBook のメソッド meetsAnyOf は，引数で与えられたインタフェース SearchCriteria のどれかに合致するエントリの集合を返す。メソッド meetsAllOf は，引数で与えられた SearchCriteria の全てに合致するエントリの集合を返す。'),
        p('入れ子クラス AddressBook.Entry は，インタフェース Searchable を実装する。メソッド meets は，引数で与えられた SearchCriteria の具体的な型によって name 又は addr のメソッド meets を呼び出し，この AddressBook.Entry のインスタンスが引数で指定された検索条件に合致するかどうか調べる。'),
        p('なお，クラス Name，Address，AddressBook.Entry は，インタフェース Set で使用できるように，クラス Object のメソッド equals 及び hashCode を上書きしているものとする。また，各コンストラクタ及びメソッドの引数は正しいものとする。'),
        p('クラス Test は，この住所録プログラムのテストプログラムである。メソッド main を実行すると，次の結果が得られた。'), output.block(index),
        heading('〔プログラム1〕'), code(nameStart, 'java')], undefined, undefined, true),
      page(51, [code(nameEnd, 'java'), heading('〔プログラム2〕'), code(addressStart, 'java')]),
      page(52, [code(addressEnd, 'java'), heading('〔プログラム3〕'), code(bookStart, 'java')]),
      page(53, [code(bookEnd, 'java'), heading('〔プログラム4〕'), code(criterion, 'java'),
        heading('〔プログラム5〕'), code(searchable, 'java'), heading('〔プログラム6〕'), code(testStart, 'java')]),
      page(54, [code(testBody(index), 'java')]),
      page(55, [p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        p('設問2　クラス Test において，住所録 addrbook に登録されている全エントリを取得する方法として正しい答えを，解答群の中から二つ選べ。ここで，プログラム中の空欄には，正しい答えが入っているものとする。')], [
        bank(1, 'a', ['SearchCriteria', 'SearchCriteria<Name>', 'SearchCriteria<String>', 'Searchable', 'Searchable<Name>', 'Searchable<String>'], 'ア', 'java'),
        bank(1, 'bc', collect, 'オキ', 'java'), bank(1, 'de', types, 'オア', 'java'),
        { ...bank(2, '23', allEntries, 'イオ', 'java'), checklist: true },
      ], [0, 0, 0, 1]),
    ],
    contexts: [{
      title: autumn2011PmJavaReferenceTitle, presentation: 'text_figure', blocks: [
        p('Set<E> は，同じ要素を重ねて保持しない集合を表す。add(E) で要素を加え，remove(Object) で指定した要素を除く。'),
        p('HashSet<E>() で空集合を作る。HashSet<E>(Collection<? extends E>) で別のコレクションの要素を入れた新しい集合を作る。反復時の要素の順番は規定されない。'),
        p('String.equals(Object) は文字列の内容の一致を調べる。String.contains(CharSequence) は指定した文字列の並びを内部に含むかどうかを調べる。String.format の %03d と %04d は，指定した最小幅まで整数の左側を0で埋める。'),
      ],
    }],
    explanation: 'Name.Criteria は検索条件を示す SearchCriteria を実装する。meetsAnyOf は空集合 result に一致した entry を加える。meetsAllOf は全件の複製から条件を満たさない entry を除く。Entry.meets の引数の型はインタフェースどおり SearchCriteria とし，住所検索は Address.Criteria に絞って呼び分ける。姓と名の両方が null の Name.Criteria は全件に合致するので，これを1件の条件として渡すイ・オの両方が全件を返す。空文字列は実際の姓・名と一致せず，null だけを渡すと可変長引数の配列自体が null となって繰返しで例外になる。',
  }), { answerVariation: 'fixed' });
