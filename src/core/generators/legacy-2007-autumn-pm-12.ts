import { code, p, table } from './definition';
import { autumn2007PmJavaReference } from './legacy-2007-autumn-pm-materials';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2007-autumn-pm-10-13-support';

const examples = [
  { prefix: 't', words: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'], space: 1 },
  { prefix: 'c', words: ['mint', 'cocoa', 'copper', 'sand', 'plum', 'black', 'oat', 'canyon', 'pine', 'olive'], space: 2 },
  { prefix: 'st', words: ['star', 'moon', 'stem', 'reed', 'cloud', 'wind', 'stone', 'sun', 'rain', 'snow'], space: 1 },
  { prefix: 'b', words: ['banana', 'fern', 'birch', 'reed', 'ash', 'cedar', 'yew', 'bamboo', 'elm', 'oak'], space: 3 },
];

const extractorFirst = `import java.util.Iterator;
import java.util.NoSuchElementException;

public class Extraction<E> implements Iterable<E> {
    private final Iterable<E> target;
    private final Evaluator<E> evaluator;

    public Extraction(Iterable<E> target, Evaluator<E> evaluator) {
        this.target = target;
        this.evaluator = evaluator;
    }

    public Iterator<E> iterator() {
        return new ExtractionIterator();
    }

    // 抽出結果を取得するための反復子
    private class ExtractionIterator implements Iterator<E> {
        private final Iterator<E> iterator;
        private boolean found = false;
        private E element;

        private ExtractionIterator() {
            iterator = target.iterator();
        }

        // メソッド next でまだ取得されていない，抽出すべき要素があれば，
        // true を返す。
        public boolean hasNext() {
            // iterator.hasNext() が true ならば，抽出すべき要素が
            // まだあるかもしれない。
            while (!found ［a］ iterator.hasNext()) {
                // 抽出元の要素の並びから要素を一つ得る。
                element = iterator.next();`;

const extractorSecond = `                // 要素が抽出条件に合うか否かを検査する。
                // 条件に合えば found は true になる。
                found = evaluator.evaluate(element);
            }
            return ［b］;
        }

        // 抽出された要素を一つずつ返す。
        // 返すべき要素がないときは，例外を投げる。
        public E next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            // メソッド hasNext の次回の呼出しに備える。
            found = ［c］;
            return ［d］;
        }

        // この操作は提供しない。
        public void remove() {
            throw new UnsupportedOperationException();
        }
    }
}`;

const evaluator = `public interface Evaluator<E> {
    public boolean evaluate(E e);
}`;
const starts = `public class StringStartsEvaluator
                     implements Evaluator<String> {
    private final String prefix;

    public StringStartsEvaluator(String prefix) {
        if (prefix == null) {
            throw new NullPointerException();
        }
        this.prefix = prefix;
    }

    public boolean evaluate(String s) {
        return s != null && s.startsWith(prefix);
    }
}`;
const anEvaluator = (space: number) => `public class AnEvaluator implements Evaluator<String> {
    public boolean evaluate(String s) {
        if (s != null) {
            final int len = s.length();
            for (int i = 0; i < len - ${space}; i++) {
                for (int j = i + ${space}; j < len; j++) {
                    if (s.charAt(i) == s.charAt(j)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}`;
const tester = (prefix: string, words: string[]) => `import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

public class ExtractionTester {
    public static void main(String[] args) {
        List<String> target =
            Arrays.asList(${words.slice(0, 5).map(word => '"' + word + '"').join(', ')},
                         ${words.slice(5).map(word => '"' + word + '"').join(', ')});
        Extraction<String> e = new Extraction<String>
                             (target, new StringStartsEvaluator("${prefix}"));
        for (String s : e) {
            System.out.println(s);
        }
    }
}`;
const labels = 'アイウエオカキク';

export const q12Output = languageFigure(12, 'output', '図 実行結果', index => {
  const { words, prefix } = examples[index];
  const text = words.filter(word => word.startsWith(prefix)).join('\n');
  return { kind: 'output', text, alt: text };
});

export const q12 = createLanguageDefinition(12, 'Java：反復子による条件付き抽出', '抽出対象・接頭辞・比較する文字の間隔', 'abcdxy',
  '設問1 aイ bイ cア dイ・設問2 ウ・キ（順不同、2個を一欄で採点）',
  'p45〜49。Iterableと抽出器、抽出結果をキャッシュする反復子を保持。対象文字列と接頭辞、重複判定の最小間隔を変え、選択肢8個のうち2個の組を一欄として採点。p53〜55のAPIは一次仕様からの独立編集参照。',
  (index, original) => {
    const { words, prefix, space } = examples[index];
    const matchingPrefix = words.filter(word => word.startsWith(prefix));
    const candidates = words.slice(0, 8);
    const qualified = candidates.flatMap((word, i) => [...word].some((char, at) => word.indexOf(char, at + space) >= 0) ? [i] : []);
    if (qualified.length !== 2) throw Error('ANSWER_CHOICES');
    return {
      pages: [
        page(45, [
          p('問12 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p(original ? '（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）' : '（Javaプログラムで使用するAPIの説明は，参考資料を参照してください。）'),
          p('〔プログラムの説明〕\n複数の文字列の並びから条件に合う文字列を抽出するプログラムである。例えば，文字列の並びから特定の文字列で始まるものを抽出することができる。表に文字列の並びから条件に合う文字列を抽出する例を示す。'),
          table('表 文字列の並びから条件に合う文字列を抽出する例', ['文字列の並び', '条件', '抽出結果'], [
            [words.map(word => '"' + word + '"').join(', '), '"' + prefix + '"で始まる文字列', matchingPrefix.map(word => '"' + word + '"').join(', ')],
          ]),
          p('（1）プログラムは次のクラス及びインタフェースから構成される。\n① クラス Extraction<E>\n条件に当てはまる型Eの要素を抽出する。コンストラクタの引数には，抽出元の要素の並びと抽出する条件を指定する。要素の並びは，java.util.LinkedListなどのjava.lang.Iterableを実装したクラスのインスタンスとして与える。メソッドiteratorは，抽出結果を取得するための反復子を返す。\n② インタフェース Evaluator<E>\n型Eの要素の抽出条件を定義するインタフェースである。メソッドevaluateは，引数で指定された要素が抽出条件を満たしていればtrueを，満たしていなければfalseを返す。'),
          p('（2）（1）のクラス及びインタフェースをテストするために次のクラスを用意した。\n① クラス StringStartsEvaluator\n指定された文字列で始まる文字列を抽出する条件を実装する。コンストラクタの引数には，抽出される文字列の先頭文字列を指定する。メソッドevaluateは，引数で指定された文字列が，コンストラクタで指定された文字列で始まるならばtrueを，それ以外はfalseを返す。'),
        ]),
        page(46, [
          p('② クラス ExtractionTester\nクラスStringStartsEvaluatorを利用して，文字列の並びから"' + prefix + '"で始まる文字列を抽出し，表示する。ExtractionTesterの実行結果を図に示す。'),
          q12Output.block(index),
          p('〔プログラム1〕'), code(extractorFirst, 'java'),
        ]),
        page(47, [
          code(extractorSecond, 'java'), p('〔プログラム2〕'), code(evaluator, 'java'),
          p('〔プログラム3〕'), code(starts, 'java'),
        ]),
        page(48, [
          p('〔プログラム4〕'), code(tester(prefix, words), 'java'),
          p('設問1 プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'a', ['!=', '&&', '==', '||'], 'イ', 'java'),
          bank(1, 'b', ['!found', 'found', 'element != null', 'element == null'], 'イ', 'java'),
          bank(1, 'c', ['false', 'hasNext()', 'iterator.hasNext()', 'true'], 'ア', 'java'),
          bank(1, 'd', ['E', 'element', 'iterator.next()', 'next()'], 'イ', 'java'),
        ]),
        page(49, [
          p('設問2 次のプログラム5に示す条件クラスを新たに作成した。この条件クラスで抽出される文字列として正しい答えを，解答群の中から二つ選べ。'),
          p('〔プログラム5〕'), code(anEvaluator(space), 'java'),
        ], [{ ...bank(2, 'xy', candidates.map(word => '"' + word + '"'), qualified.map(i => labels[i]).join(''), 'java'), label: '解答群' }]),
      ],
      contexts: [autumn2007PmJavaReference(12)],
      unordered: 'xy', checklist: true,
      explanation: 'a：未取得の候補が見つかっておらず，元の反復子に要素が残るときだけ読み進めるので&&。b：条件を満たす要素を保持しているかをfoundで返す。' +
        'cとd：保持していた要素を返す際，次は別の要素を探索できるようfoundをfalseに戻す。設問2では，iとjを比較する位置が少なくとも' +
        space + '離れている場合に，文字が一致するとtrueを返す。該当する選択肢は' + qualified.map(i => '"' + candidates[i] + '"').join('と') + 'である。',
    };
  });
