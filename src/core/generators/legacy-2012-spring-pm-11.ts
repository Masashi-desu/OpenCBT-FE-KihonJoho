import { code, p, table } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2012-spring-pm-09-13-support';

const students = ['FE0001', 'FE0002', 'FE0003', 'FE0004', 'FE0005'];
const tests = [
  { subject: '数学', scores: [70, 90, 85, 95, 90], updated: 85, restore: 90, nullKey: true },
  { subject: '物理', scores: [62, 83, 95, 98, 83], updated: 95, restore: 91, nullKey: false },
  { subject: '化学', scores: [66, 75, 72, 94, 75], updated: 72, restore: 80, nullKey: true },
  { subject: '英語', scores: [69, 88, 91, 96, 88], updated: 91, restore: 86, nullKey: false },
] as const;
const tester = (index: number) => {
  const { subject, scores, updated, restore, nullKey } = tests[index];
  return `public class ScoreManagerTester {
    public static void main(String[] args) {
        ScoreManager sm = new ScoreManager("${subject}");
        try {
${students.map((student, i) => `            sm.put("${student}", ${scores[i]});`).join('\n')}
            sm.put("FE0001", ${updated});
            sm.remove("FE0004");
            sm.put(${nullKey ? `null, ${restore}` : '"FE0004", null'});
            sm.put("FE0004", ${restore});
        } catch (NullPointerException e) {}
        sm.print();
        System.out.println(sm.get("FE0004"));
    }
}`;
};
const output = languageFigure(11, 'score-output', '図1 メソッドmainの実行結果', index => {
  const { subject, scores, updated } = tests[index];
  const sorted = [1, 2, 4, 0].map(i => ({ student: students[i], score: i === 0 ? updated : scores[i] }))
    .sort((left, right) => right.score - left.score);
  return { kind: 'output', text: [subject + 'の成績', ...sorted.map(({ student, score }) => ' ' + student + ' : ' + score + '点'), 'null'].join('\n') };
});
export const q11Figures = [output];

export const spring2012PmJavaReferenceTitle = 'Java APIの参照（独自編集）';
const javaReference = [{
  title: spring2012PmJavaReferenceTitle, presentation: 'text' as const,
  blocks: [
    p('原冊子p.71〜75で扱うAPIのうち，問題で使う操作を整理した。Java標準APIの説明文・表は転載していない。'),
    table('Javaの型とコードを読むための要点', ['型', 'この問題で使う性質'], [
      ['Map<K,V> / HashMap<K,V>', 'キー1個に値1個を対応させる。getは値を調べ，putは対応を登録し，removeは指定したキーを外して以前の値を返す。sizeは登録数，keySetはキーの集合を返す。'],
      ['TreeMap<K,V>', 'キーを比較して順序を付ける。コンストラクタにComparatorを渡した場合はその比較方法を用いる。渡さない場合はキーの自然順序を用いる。'],
      ['List<E> / ArrayList<E>', '並び順のあるデータを保持する。addは末尾へ追加し，removeは指定した値を取り除く。isEmptyで要素の有無を調べ，iteratorで先頭からたどれる。'],
      ['Set<E> / TreeSet<E>', '同じと判定される要素は重ねて保持しない。TreeSetは，要素の自然順序又は指定された比較方法の順にたどれる。'],
      ['Iterable<E> / Iterator<E>', '拡張for文はIterableのiteratorを使う。hasNextは次の要素があるかを調べ，nextは次の要素を返して進む。'],
      ['Comparator<T>', 'compareは二つの値を比較し，前が小さいとき負，同等なら0，大きいとき正を返す。'],
    ]),
  ],
}];

const manager = `import java.util.Comparator;

public class ScoreManager extends ValueSortedMap<［a］> {
    private final String subject;

    public ScoreManager(String subject) {
        super(new Comparator<Integer>() {
            public int compare(Integer a, Integer b) {
                return b.compareTo(a);
            }
        });
        this.subject = subject;
    }

    public void print() {
        System.out.println(subject + "の成績");
        for (String name : this) {
            System.out.printf(" %s : %d点%n", name, get(name));
        }
    }
}`;
const imports = `import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.TreeMap;`;
const sortedMap = `public class ValueSortedMap<K, V> implements Iterable<K> {
    Map<K, V> map = new HashMap<K, V>();
    Map<V, List<K>> reverseMap;

    public ValueSortedMap() {
        reverseMap = new TreeMap<V, List<K>>();
    }

    public ValueSortedMap(Comparator<? super V> c) {
        reverseMap = new TreeMap<V, List<K>>(c);
    }

    public V put(K key, V value) {
        if (［b］) {
            throw new NullPointerException();
        }
        V old = remove(key);
        map.put(key, value);
        List<K> keys = reverseMap.get(value);
        if (［c］) {
            keys = new ArrayList<K>();
            reverseMap.put(value, keys);
        }
        keys.add(key);
        return old;
    }

    public V get(K key) {
        return map.get(key);
    }

    public V remove(K key) {
        V value = ［d］(key);
        if (value != null) {
            List<K> keys = reverseMap.get(value);
            keys.remove(key);
            if (keys.isEmpty()) {
                ［e］(value);
            }
        }
        return value;
    }

    public int size() {
        return map.size();
    }

    public Iterator<K> iterator() {
        return new Iterator<K>() {
            Iterator<V> vi = reverseMap.keySet().iterator();`;
const iterator = `            Iterator<K> ki = new ArrayList<K>().iterator();

            public boolean hasNext() {
                return vi.hasNext() || ki.hasNext();
            }

            public K next() {
                if (hasNext()) {
                    if (!ki.hasNext()) {
                        ki = reverseMap.get(vi.next()).iterator();
                    }
                    return ki.next();
                }
                throw new NoSuchElementException();
            }

            public void remove() {
                throw new UnsupportedOperationException();
            }
        };
    }
}`;

export const q11 = createLanguageDefinition(11, '得点順で出力する成績管理プログラム', '科目・得点・同点の更新・例外を発生させる入力',
  'abcde2', '設問1 a=エ，b=エ，c=ウ，d=エ，e=キ／設問2 ウ',
  '原冊子p.54〜58。得点の降順，同得点内の登録順から自然順序への変更，nullの例外，キーと値の双方向管理を保つ。得点と科目・例外の発生元を変え，置換・削除・例外後の出力を検算。空欄の正答が固定なのは，データが変わっても型・入替え・集合選択の役割が同じため。p.71〜75のAPI表現・表は配布せず，必要な操作を独立記述。', index => ({
    pages: [
      page(54, [
        p('問11 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p(index === 0 ? '（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）' : '（Javaプログラムで使用するAPIの要点は，問11の参考資料を参照してください。）'),
        heading('〔プログラムの説明〕'), p('試験の成績を管理するプログラムである。'),
        p('（1）クラス ScoreManager は，後述するクラス ValueSortedMap を継承したクラスで，試験の成績を管理する。点数の高い順に学籍番号（英数字で構成される固定長の文字列）と点数を出力するメソッド print をもつ。'),
        p('（2）クラス ValueSortedMap は，キーと値の対応付けを値の昇順，又はコンストラクタで指定したコンパレータに従った順に保持する。キーと値の対応付けをキーの昇順，又はコンパレータに従った順に保持するクラス TreeMap を利用している。主なメソッドは次のとおりである。'),
        code('public V put(K key, V value)', 'java'),
        p('keyにvalueを対応付けて登録する。key又はvalueがnullのときは例外NullPointerExceptionを投げる。keyが既に他の値と対応付けられていれば，その値をvalueで置き換え，置き換えられる前の値を返す。keyに値が対応付けられていなければ，nullを返す。'),
        code('public V get(K key)', 'java'), p('keyに対応付けられた値を返す。keyと値の対応付けがなければ，nullを返す。'),
        code('public V remove(K key)', 'java'), p('keyと値の対応付けを削除し，対応付けられていた値を返す。keyと値の対応付けがなければ，nullを返す。'),
        code('public Iterator<K> iterator()', 'java'),
        p('対応付けられた値の昇順，又はコンストラクタで指定したコンパレータに従った順に，キーを返すための反復子を返す。'),
        p('フィールド map は，キーと値の対応付けを保持する。'),
        p('フィールド reverseMap は，値にキーを対応付けて保持する。異なるキーに同じ値が対応付けられることがあるので，値に対応付けられるのはキーのリストである。'),
      ]),
      page(55, [
        p('（3）クラス ScoreManagerTester は，成績管理プログラムのテストプログラムである。メソッド main の実行結果を，図1に示す。'),
        output.block(index), heading('〔プログラム1〕'), code(manager, 'java'), heading('〔プログラム2〕'), code(imports, 'java'),
      ]),
      page(56, [code(sortedMap, 'java')]),
      page(57, [code(iterator, 'java'), heading('〔プログラム3〕'), code(tester(index), 'java')]),
      page(58, [
        p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        p('設問2 点数が同じ場合には，学籍番号の文字列としての自然順序付けに従って出力するように変更する。クラス ValueSortedMap で使用しているクラスやインタフェースの変更だけで実現する場合，変更内容として適切なものを，解答群の中から選べ。'),
      ], [
        bank(1, 'a', ['Integer', 'Integer, String', 'String', 'String, Integer'], 'エ', 'java'),
        bank(1, 'b', ['key != null && value != null', 'key != null || value != null', 'key == null && value == null', 'key == null || value == null'], 'エ', 'java'),
        bank(1, 'c', ['!keys.isEmpty()', 'keys != null', 'keys == null', 'keys.isEmpty()'], 'ウ', 'java'),
        bank(1, 'de', ['Map.get', 'map.get', 'Map.remove', 'map.remove', 'remove', 'reverseMap.get', 'reverseMap.remove'], 'エキ', 'java'),
        bank(2, '2', ['ArrayListをTreeSetに変更する。', 'ListとArrayListをSetに変更する。', 'ListをSetに変更し，ArrayListをTreeSetに変更する。', 'ListをTreeSetに変更し，ArrayListをSetに変更する。', 'ListをTreeSetに変更する。'], 'ウ'),
      ], [0, 0, 0, 0, 1]),
    ],
    contexts: javaReference,
    explanation: `学籍番号はString，点数はIntegerなので型引数の順はString, Integer。key又はvalueの少なくとも一方がnullなら例外にする。逆引き表に対象の点数がなければgetはnullなので，その場合だけリストを作る。削除ではmap.removeで正引き表から消して以前の点数を得る。その点数のキーがなくなればreverseMap.removeで逆引き表からも消す。例外が発生するとtry内の次のputは実行されず，削除したFE0004の値はnullのままである。同点の自然順序には，変数をSet，実体をTreeSetとする。`,
  }), { answerVariation: 'fixed' });
