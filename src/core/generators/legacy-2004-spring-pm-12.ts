import { code, p } from './definition';
import { springLanguageFigure, springLanguageQuestion, bank, page } from './legacy-2004-spring-pm-10-13-support';

type Sample = { offset: number; text: string; matrix: Array<string | null> };
const originalSample: Sample = { offset: 0, text: 'H16', matrix: ['2', '0', null, '04'] };
const conditions: Sample[] = [
  { offset: 0, text: 'Q7', matrix: [null, '', '81', '', '2'] },
  { offset: 1, text: 'xK2', matrix: ['p1', null, 'x', '', 'g57'] },
  { offset: 2, text: 'ab82', matrix: ['', null, 'ab59', 'ab3'] },
  { offset: 3, text: 'xy0ML9', matrix: ['abc42', null, 'ab', '', 'def8'] },
];
const sourceKey = 'カエアエエカ';
const suppliers = bank(0, 'ab', [
  'getCharIterator((char[][]) data)', 'getCharIterator((String) data)', 'new Char2DArrayCharIterator()',
  'new Char2DArrayCharIterator(data)', 'new StringCharIterator()', 'new StringCharIterator(data)',
], 'カエ', 'java');
const stringHasNext = bank(0, 'c', [
  'index < data.length()', 'index <= data.length()', 'index >= data.length()',
  'index++ < data.length()', 'index++ <= data.length()', 'index++ >= data.length()',
], 'ア', 'java');
const stringNext = bank(0, 'd', [
  'data.charAt(++index)', 'data.charAt(--index)', 'data.charAt(index + 1)',
  'data.charAt(index++)', 'data.charAt(index--)', 'data.charAt(index)',
], 'エ', 'java');
const matrixNext = bank(0, 'f', [
  'data[index1++][index2++]', 'data[index1++][index2]', 'data[index1][++index2]',
  'data[index1][--index2]', 'data[index1][index2 + 1]', 'data[index1][index2++]',
], 'カ', 'java');
const wrap = (value: string) => [...value].map(ch => "'" + ch + "'");
function renderOutput({ offset, text, matrix }: Sample) {
  return [text.slice(offset), matrix.map(row => row?.slice(offset) ?? '').join('')]
    .map(segment => wrap(segment).join(' '));
}
export const iteratorOutput = springLanguageFigure(12, 'iterator-output', '図　CharIteratorTest.mainの実行結果', index => {
  const lines = renderOutput(conditions[index]);
  return { lines, alt: lines.map((line, row) => (row + 1) + '行目　' + line).join('。') + '。' };
});
const makeRow = (value: string | null) => value === null ? 'null' : '{' + wrap(value).join(', ') + '}';

export const q12 = springLanguageQuestion(12, '文字列と2次元文字配列から文字を取り出す', '文字列・各行の読み始めと空行又はnullの位置の組',
  'abcdef', sourceKey,
  '文字列と各配列の読み始め、文字列長、内側配列の長さとnullの位置を変え、実データに応じて境界と出力を確認できるようにする。',
  (index, original) => {
    const { offset, text, matrix } = original ? originalSample : conditions[index];
    const rowReset = bank(0, 'e', [
      'index1 = 0', 'index1 = data.length', 'index1 = index2',
      'index2 = ' + offset, 'index2 = data.length', 'index2 = index1',
    ], 'エ', 'java');
    const printed = renderOutput({ offset, text, matrix }).join('\n');
    const orderNote = original ? '' :
      '文字列と各文字配列の先頭' + offset + '要素は読み飛ばす。長さが' + offset +
      '以下のデータには返す文字がない。各行では添字' + offset + 'から調べる。内側の配列がnullの場合は飛ばす。';
    return { pages: [
      page(52, [
        p('次のJavaプログラムの説明及びプログラムを読んで、設問に答えよ。'),
        p('〔プログラムの説明〕インタフェースCharIteratorは、データ構造に依存せずに、そのインスタンスからcharを順に取り出す操作を定義する。'),
        code('public char next()', 'java'),
        p('次の文字があれば返し、なければjava.util.NoSuchElementExceptionを投げる。取得対象がn文字である場合、n回目の呼出しまで順に文字を返し、n＋1回目以降の呼出しでは例外を投げる。NoSuchElementExceptionはjava.lang.RuntimeExceptionのサブクラスである。'),
        code('public boolean hasNext()', 'java'),
        p('次の文字があればtrueを、なければfalseを返す。'),
        p('CharIteratorFactoryは、引数の型に一致したCharIteratorを返すクラスメソッドを定義する。'),
        code('public static CharIterator getCharIterator(String data)', 'java'),
        p('引数のStringから文字を順に取り出すCharIteratorを返す。nullを指定した場合はNullPointerExceptionを投げる。'),
        code('public static CharIterator getCharIterator(char[][] data)', 'java'),
        p('引数で指定したcharの配列の配列から文字を順に取り出すCharIteratorを返す。引数がnullの場合はNullPointerExceptionを投げる。文字は外側・内側の添字が小さい順、すなわちm[i][j]のiが小さい順、同一のiの中ではjが小さい順に取り出す。' + orderNote),
      ]),
      page(53, [
        p('CharIteratorTestは、CharIteratorFactoryのクラスメソッドをテストするプログラムである。mainを実行すると次の結果が得られる。'),
        ...original ? [code(printed, 'text'), p('図　CharIteratorTest.mainの実行結果')] : [iteratorOutput.block(index)],
        p('〔プログラム1〕'), code(`public interface CharIterator {
    public boolean hasNext();
    public char next();
}`, 'java'),
        p('〔プログラム2〕'), code(`import java.util.NoSuchElementException;

public class CharIteratorFactory {
    public static CharIterator getCharIterator(String data) {
        if (data == null)
            throw new NullPointerException();
        // Stringデータから文字を順番に返すCharIteratorのインスタンス
        // を生成して返す。
        return [a];
    }

    public static CharIterator getCharIterator(char[][] data) {
        if (data == null)
            throw new NullPointerException();
        // ２次元の文字配列から文字を順番に返すCharIteratorのインスタンス
        // を生成して返す。
        return [b];
    }
}

class StringCharIterator implements CharIterator {
    private String data;
    private int index = ${offset};`, 'java'),
      ]),
      page(54, [code(`    StringCharIterator(String data) {
        this.data = data;
    }
    // dataに次の文字があるかどうかをチェックする。
    public boolean hasNext() {
        return [c];
    }

    public char next() {
        // 次の文字がないときは、NoSuchElementExceptionを投げる。
        if (index >= data.length())
            throw new NoSuchElementException();
        // dataの次の文字を返し、インデックス値を更新する。
        return [d];
    }
}

class Char2DArrayCharIterator implements CharIterator {
    private char[][] data;
    private int index1 = 0, index2 = ${offset};

    Char2DArrayCharIterator(char[][] data) {
        this.data = data;
    }
    public boolean hasNext() {
        // data[index1][index2]の要素があればtrueを返し、なければ次
        // に定義されている要素を探す。次の要素がなければfalseを返す。
        for (; index1 < data.length; index1++) {
            if (data[index1] != null
                    && index2 < data[index1].length) {
                return true;
            }
            [e];
        }
        return false;
    }
    public char next() {
        // メソッドhasNextを呼び出して次の要素があるかどうかを調べ、
        // あればその要素を返し、インデックス値を更新する。なければ、
        // NoSuchElementExceptionを投げる。
        if (hasNext()) {
            return [f];
        }
        throw new NoSuchElementException();
    }
}`, 'java')]),
      page(55, [
        p('〔プログラム3〕'),
        code(`public class CharIteratorTest {
    public static void main(String[] args) {
        CharIterator itr =
            CharIteratorFactory.getCharIterator("${text}");
        printIterator(itr);

        itr = CharIteratorFactory.getCharIterator(
                new char[][] {${matrix.map(makeRow).join(',\n                              ')}});
        printIterator(itr);
    }
    private static void printIterator(CharIterator itr) {
        while (itr.hasNext()) {
            System.out.print("'" + itr.next() + "' ");
        }
        System.out.println();
    }
}`, 'java'),
        p('設問　プログラム中の各空欄に入れる正しい答えを、解答群の中から選べ。'),
      ], [suppliers, stringHasNext]),
      page(56, [], [stringNext, rowReset, matrixNext]),
    ],
    explanation:
      'aはStringを受け取るStringCharIterator、bはchar[][]を受け取るChar2DArrayCharIteratorのコンストラクタに同じdataを渡す。' +
      'cは文字列の添字がlengthより小さいときだけtrueを返し、位置を更新しない。dは現位置のcharを返してからindexを1進める。' +
      '空の行・nullの行・読み終わった行を飛ばすとき、eで列添字を' + offset +
      'に設定してからforで行添字を進める。fは現在の行・列にあるcharを返してから列添字だけを1進める。' +
      '読み始めの添字は' + offset + 'で、この入力では文字列から「' + text.slice(offset) +
      '」、2次元配列から「' + matrix.map(row => row?.slice(offset) ?? '').join('') + '」を返す。' +
      'hasNextを続けて呼び出しても次の文字は失われず、すべて取り出した後のnextはNoSuchElementExceptionを投げる。',
    };
  }, { answerVariation: 'fixed' });
