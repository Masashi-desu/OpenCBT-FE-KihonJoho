import { code, p } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2011-special-pm-09-13-support';

export const sequenceCases = [
  { size: 10, calls: [5000, 10000, 50000, 100000], arrayTime: [5, 18, 370, 1455], listTime: [4, 8, 960, 4085], inclusive: false },
  { size: 8, calls: [4000, 8000, 40000, 80000], arrayTime: [5, 17, 342, 1320], listTime: [3, 9, 756, 3280], inclusive: true },
  { size: 12, calls: [6000, 12000, 60000, 120000], arrayTime: [6, 20, 440, 1750], listTime: [4, 10, 1160, 4930], inclusive: false },
  { size: 16, calls: [8000, 16000, 80000, 160000], arrayTime: [8, 25, 590, 2310], listTime: [6, 14, 1560, 6580], inclusive: true },
] as const;
const interfaceCode = `public interface AppendableCharSequence {
    public char charAt(int index);
    public int length();
    public AppendableCharSequence append(char c);
    public String toString();
}`;
const stringTail = `    public String toString() {
        return new String(data, 0, length);
    }
}`;
const bucketTail = `            bucket = bucket.next;
        }
        return new String(data);
    }

    private Bucket getBucket(int index) {
        int n = index / EXT_SIZE;
        Bucket b = bucketList;
        for (int i = 0; i < n; i++) {
            b = b.next;
        }
        return b;
    }

    private static class Bucket {
        private Bucket next;
        private char[] data = new char[EXT_SIZE];
    }
}`;
const appendForLast = `public AppendableCharSequence append(char c) {
    int offset = length % EXT_SIZE;
    if (offset == 0 && length != 0) {
        last.next = new Bucket();
        last = ［g］;
    }
    last.data[offset] = c;
    length++;
    return this;
}`;
const constructorForLast = `public ListAppendableCharSequence() {
    bucketList = new Bucket();
    last = ［f］;
}`;

export function sequencePrograms(index: number) {
  const { size, calls, inclusive } = sequenceCases[index];
  const array = `public class ArrayAppendableCharSequence
                    implements AppendableCharSequence {
    private static final int EXT_SIZE = ${size};
    private int length;
    private char[] data;

    public ArrayAppendableCharSequence() {
        data = new char[EXT_SIZE];
    }

    public char charAt(int index) {
        if (index < 0 || index >= length)
            throw new IndexOutOfBoundsException();
        return data[index];
    }

    public int length() {
        return length;
    }

    public AppendableCharSequence append(char c) {
        if (data.length == length) {
            char[] temp = new char[length + EXT_SIZE];
            for (int i = 0; i ${inclusive ? '<=' : '<'} ［a］; i++) {
                temp[i] = data[i];
            }
            data = temp;
        }
        data[length++] = c;
        return this;
    }`;
  const list = `public class ListAppendableCharSequence
                    implements AppendableCharSequence {
    private static final int EXT_SIZE = ${size};
    private Bucket bucketList;
    private int length;

    public ListAppendableCharSequence() {
        bucketList = new Bucket();
    }

    public char charAt(int index) {
        if (index < 0 || index >= length)
            throw new IndexOutOfBoundsException();
        Bucket bucket = getBucket(index);
        return bucket.data[［b］];
    }

    public int length() {
        return length;
    }

    public AppendableCharSequence append(char c) {
        int offset = length % EXT_SIZE;
        Bucket bucket = getBucket(［c］);
        if (offset == 0 && length != 0) {
            bucket.next = new Bucket();
            bucket = bucket.next;
        }
        bucket.data[offset] = c;
        length++;
        return this;
    }

    public String toString() {
        char[] data = new char[length];
        Bucket bucket = bucketList;
        int size;
        for (int len = length; len > 0; len -= size) {
            size = (len >= EXT_SIZE) ? EXT_SIZE : len;
            for (int i = 0, j = ［d］; i < size; i++, j++) {
                data[j] = bucket.data[i];
            }`;
  const benchmark = `public class Test {
    static final int[] TIMES = {
        ${calls.join(', ')}
    };

    public static void main(String[] args) {
        for (int n : TIMES) {
            measureTime(n, new ArrayAppendableCharSequence());
            measureTime(n, new ListAppendableCharSequence());
        }
    }

    static void measureTime(int n, ［e］ a) {
        long start = System.currentTimeMillis();
        for (int i = 0; i < n; i++) {
            a.append((char) (i % 26 + 'a'));
        }
        long end = System.currentTimeMillis();
        System.out.printf("%s: %d [times] %d [ms]%n",
                         a.getClass().getName(),
                         n, end - start);
    }
}`;
  return { interfaceCode, array, stringTail, list, bucketTail, benchmark, constructorForLast, appendForLast };
}

export function sequenceBanks(index: number) {
  return {
    a: ['data.length + length', 'data.length + temp.length', 'length', sequenceCases[index].inclusive ? 'length - 1' : 'length + EXT_SIZE', 'temp.length'],
    b: ['index', 'index % EXT_SIZE', 'index / EXT_SIZE', 'length', 'length % EXT_SIZE', 'length / EXT_SIZE'],
    c: ['length', 'length + 1', 'length - 1', 'offset', 'offset + 1', 'offset - 1'],
    d: ['len', 'len % EXT_SIZE', 'len - length', 'length', 'length % EXT_SIZE', 'length - len'],
    e: ['AppendableCharSequence', 'ArrayAppendableCharSequence', 'ListAppendableCharSequence', 'ListAppendableCharSequence.Bucket', 'Object', 'String'],
    fg: ['bucketList', 'bucketList.next', 'last', 'last.next', 'new Bucket()', 'null'],
  };
}

export const sequenceTiming = languageFigure(11, 'append-time', '表1　各クラスのメソッドappendの実行時間', index => {
  const { calls, arrayTime, listTime } = sequenceCases[index];
  const display = (value: number) => value.toLocaleString('ja-JP');
  return { kind: 'tables', tables: [{ headers: ['クラス名＼呼出し回数', ...calls.map(value => display(value) + '回')],
    rows: [['ArrayAppendableCharSequence', ...arrayTime.map(display)], ['ListAppendableCharSequence', ...listTime.map(display)]] }], note: '単位　ミリ秒' };
});

export const q11 = createLanguageDefinition(11, 'Javaで文字列を追加する配列と連結リスト', 'sequenceCapacity', 'abcdefg', 'ウイウカアアエ',
  'APIのメソッド名は識別子と機能上の事実だけを扱う。二種類の実装、配列の拡張、末尾参照の改善とコードの改行・字下げを維持し、拡張幅、呼出し回数・時間の例、複写条件の上限比較を変更する。',
  index => {
    const program = sequencePrograms(index);
    const options = sequenceBanks(index);
    const inclusive = sequenceCases[index].inclusive;
    return {
      pages: [
        page(51, [heading('問11　次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'), heading('〔プログラムの説明〕'),
          p('クラス ArrayAppendableCharSequence 及び ListAppendableCharSequence は，追加可能な0個以上の文字からなる文字列（文字の並び）を表現するインタフェース AppendableCharSequence を異なるデータ構造で実装したプログラムである。'),
          p('インタフェース AppendableCharSequence は，パッケージ java.lang のインタフェース CharSequence 及び Appendable で定義されている次のメソッドからなる。'),
          p('（1） メソッド charAt は，引数 index で指定された位置の文字を返す。文字の位置はインデックス値で表され，文字列の長さが1以上のとき，最初の文字の位置は0，最後の文字の位置は文字列の長さ－1で表される。引数で指定されたインデックス値が負又は文字列の長さ以上の場合は，IndexOutOfBoundsException を投げる。'),
          p('（2） メソッド length は，文字列の長さを返す。\n（3） メソッド append は，引数で指定された文字を文字列の末尾に追加する。戻り値として，この AppendableCharSequence のインスタンス自身を返す。\n（4） メソッド toString は，このインスタンスの文字列を String オブジェクトで返す。'),
          p('クラス ArrayAppendableCharSequence は，char型の配列を用いてインタフェース AppendableCharSequence を実装したものである。メソッド append は，配列の空いている最初の要素に文字を格納する。配列に空き要素がないときは，要素の個数が現在の配列よりも EXT_SIZE の値だけ大きな配列を生成し，既存の文字データを移し，空いている最初の要素に文字を格納する。'),
          p('クラス ListAppendableCharSequence は，連結リスト構造を用いてインタフェース AppendableCharSequence を実装したものである。入れ子クラス ListAppendableCharSequence.Bucket（以下，Bucket という）は，連結リストの要素である。Bucket のインスタンス1個につき，要素の個数が EXT_SIZE であるchar型の配列を用意し，そこに文字データを保持する。Bucket の配列に空き要素がなくなり，次の文字を追加できないときは，新規に Bucket のインスタンスを生成し，連結リストに追加する。'),
          p('クラス Test は，上記二つのクラスそれぞれの実装が異なるメソッド append の実')]),
        page(52, [p('行時間を測定するプログラムである。メソッド measureTime は，引数nで指定された回数だけ，引数aで指定されたインスタンスのメソッド append を呼び出し，実行時間をミリ秒単位で測定する。'),
          heading('〔プログラム1〕'), code(program.interfaceCode, 'java'), heading('〔プログラム2〕'), code(program.array, 'java')], undefined, undefined, true),
        page(53, [code(program.stringTail, 'java'), heading('〔プログラム3〕'), code(program.list, 'java')]),
        page(54, [code(program.bucketTail, 'java'), heading('〔プログラム4〕'), code(program.benchmark, 'java')]),
        page(55, [p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')],
          [bank(1, 'a', options.a, inclusive ? 'エ' : 'ウ', 'java'), bank(1, 'b', options.b, 'イ', 'java'),
            bank(1, 'c', options.c, 'ウ', 'java'), bank(1, 'd', options.d, 'カ', 'java'), bank(1, 'e', options.e, 'ア', 'java')]),
        page(56, [p(index === 0 ? '設問2　クラス Test を用いて各クラスのメソッド append の実行時間（ミリ秒）を測定したところ，表1の結果になった。'
          : '設問2　クラス Test を用いて各クラスのメソッド append の実行時間（ミリ秒）を測定したときの例として，表1の結果を考える。'),
          sequenceTiming.block(index),
          p('文字の追加回数が多くなるにつれて ListAppendableCharSequence の方が遅くなるのは，連結リストをたどる回数が増えるためであると推測される。そこで，ListAppendableCharSequence.append の性能を改善するために，次の修正を行った。空欄に入れる正しい答えを，解答群の中から選べ。\nなお，ほかの変更はないものとする。'),
          p('（1） 連結リストの最後の要素を常に参照するためのフィールド last を追加する。'), code('private Bucket last;', 'java'),
          p('（2） コンストラクタでフィールド last を初期化する。'), code(program.constructorForLast, 'java'),
          p('（3） メソッド append でフィールド last を利用する。'), code(program.appendForLast, 'java')],
          [{ ...bank(2, 'fg', options.fg, 'アエ', 'java'), label: '解答群' }]),
      ],
      explanation: `配列の拡張では既存の添字0～length - 1を複写するので，aは${inclusive ? 'length - 1' : 'length'}。リスト内の位置は商でバケットを求め，余りがその配列内の添字（b）。cは既存末尾文字length - 1であり，空のときはJavaの整数除算が0方向に丸められるので最初のバケットを得る。dは全長から未複写の長さを引いた位置。eは両実装に共通してappendが使えるインタフェースである。fは最初に作ったbucketList，gは追加直後のlast.nextを指す。`,
    };
  });
