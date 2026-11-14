import { code, p } from './definition';
import { autumn2007PmJavaReference } from './legacy-2007-autumn-pm-materials';
import { bank, draftQuestion } from './legacy-2007-autumn-pm-06-09-support';
import { drawing } from './legacy-2007-autumn-pm-06-09-figures';
import { queueCases } from './legacy-2007-autumn-pm-06-09-model';

const pollOptions = [
  '待ち行列の先頭要素の取得及び削除をする。ただし，待ち行列に要素がないときはnullを返す。',
  '待ち行列の先頭要素の取得及び削除をする。ただし，待ち行列に要素がないときは例外を投げる。',
  '待ち行列の先頭要素を取得する。要素の削除はしない。ただし，待ち行列に要素がないときはnullを返す。',
  '待ち行列の先頭要素を取得する。要素の削除はしない。ただし，待ち行列に要素がないときは例外を投げる。',
];

function queueListing(index: number) {
  const { inclusive, zeroCursor } = queueCases[index];
  const comparison = inclusive ? 'がweightを超える' : 'がweight以上になる';
  const searchComment = zeroCursor
    ? '        // 重みを加える位置を添字で示し，末尾から先頭へ走査する。\n        // 先頭要素の添字は0。累計' + comparison + 'か，それより前に達するまで。'
    : '        // 末尾の要素からの重みの合計' + comparison + 'か，先頭に達するまで\n        // 前方に向かって走査する。待ち行列の先頭位置は0';
  return `import java.util.LinkedList;

public class WeightedQueue<E> {
    private final LinkedList<QueueElement> queue =
        new LinkedList<QueueElement>();

    // 要素を待ち行列に挿入する。（element:要素，weight:重み）
    public void offer(E element, long weight) {
        if (element == null) {
            throw new NullPointerException();
        }

        int pos;
        long sum = 0;
${searchComment}
        for (${zeroCursor ? 'pos = queue.size() - 1; pos >= 0' : 'pos = queue.size(); pos > 0'}; pos--) {
            sum += queue.get(［a］).weight;
            if (sum ［b］ weight) {
                break;
            }
        }
        queue.add(${zeroCursor ? 'pos + 1' : 'pos'}, ［c］);
    }

    public E poll() {
        QueueElement e = queue.poll();
        if (e == null) {
            return null;
        } else {
            return e.element;
        }
    }`;
}
const inner = `    // 要素と重みの組
    private class QueueElement {
        private final E element;
        private final long weight;

        private QueueElement(E element, long weight) {
            this.element = element;
            this.weight = weight;
        }
    }
}`;
function tester(index: number) {
  return `public class WeightedQueueTester {
    public static void main(String[] args) {
        WeightedQueue<String> wq = new WeightedQueue<String>();
        String[] s = {"a", "b", "c", "d"};
        long[] w = {${queueCases[index].weights.join(', ')}};
        for (int i = 0; i < s.length; i++) {
            wq.offer(s[i], w[i]);
        }
        String data;
        while ((data = wq.poll()) != null) {
            System.out.println(data);
        }
    }
}`;
}

export const q8 = draftQuestion(8, 'Java：要素の重みから待ち行列の挿入位置を求める',
  '挿入する重みと合計の等号・走査の添字・例の四つの重み', '設問1 aイ bエ cイ／設問2 ア',
  '要素に正の重み，null禁止，Long.MAX_VALUE上限，末尾からの重み累計と挿入，先頭取り出しを維持。重みと等号条件及び走査カーソルの起点を変え，図，添字，停止条件，コード，説明を連動させる。Java APIは版の整合を確認した独自の動作説明を参照し，元の付属資料画像を使用しない。',
  (index, original) => {
    const { inclusive, zeroCursor } = queueCases[index];
    const comparisonOptions = [inclusive ? '>' : '!=', '<=', '==', '>='];
    return {
      pages: [
        { page: 29, blocks: [
          p('問8　次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p(original ? '（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）' : '（Javaプログラムで使用するAPIの説明は，参照資料を参照してください。）'),
          p('〔プログラムの説明〕'),
          p('クラスWeightedQueueは，次の規則に従う待ち行列を実現するプログラムである。'),
          p('(1) 待ち行列に入る要素には，重みが付けられる。重みは正の整数とする。ただし，この待ち行列にnullを挿入することはできない。'),
          p('(2) 要素の挿入位置は，末尾の要素からの重みの合計が，挿入する要素の重み' + (inclusive ? '以下' : '未満') +
            'で，最も先頭寄りとする。ただし，重みの合計がLong.MAX_VALUEを超えたときの動作は保証しない。要素を挿入する例を図1に示す。'),
          drawing('8-insert', index),
          p('(3) 要素を取り出すときは，その時点で先頭にある要素が取り出される。'),
          p('〔待ち行列の使用例〕'),
          p('この待ち行列に，優先度の高いタスク（重みの値が大きい要素）を挿入すると，このタスクは先に挿入されていた幾つかの優先度の低いタスクよりも，先に取り出されるようになる。この性質を利用して，この待ち行列を，優先度に応じたタスクのスケジューリングに使うことができる。'),
        ] },
        { page: 30, blocks: [
          p('テスト用クラスWeightedQueueTesterの実行結果を図2に示す。'),
          drawing('8-output', index),
          p('〔プログラム1〕'),
          code(queueListing(index), 'java'),
        ] },
        { page: 31, blocks: [
          code(inner, 'java'), p('〔プログラム2〕'), code(tester(index), 'java'),
          p('設問1　プログラム1中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], banks: [
          bank('a', ['pos', 'pos - 1', 'pos + 1', 'sum', 'sum - 1', 'sum + 1'], zeroCursor ? 'ア' : 'イ', 'java', 1),
          bank('b', comparisonOptions, inclusive ? 'ア' : 'エ', 'java', 1),
          bank('c', ['new QueueElement(element, sum)', 'new QueueElement(element, weight)',
            'QueueElement(element, sum)', 'QueueElement(element, weight)'], 'イ', 'java', 1),
        ] },
        { page: 32, blocks: [p('設問2　クラスWeightedQueueのメソッドpollに関する記述として正しいものを，解答群の中から選べ。')],
          banks: [bank('s', pollOptions, 'ア', undefined, 2, '解答群')] },
      ],
      contexts: [autumn2007PmJavaReference(8)],
      explanation: [
        'a：対象の添字は' + (zeroCursor ? 'posそのもの。初期値は最後の要素の添字size()−1。' : 'pos−1。posは挿入位置であり，その左隣の要素へgetでアクセスする。'),
        'b：追い越せるのは合計が重み' + (inclusive ? '以下なので，超えたときに停止する。' : '未満なので，合計が重み以上になったときに停止する。') +
          (zeroCursor ? ' 最後に調べた要素の直後のpos＋1へ挿入する。' : ' 停止時に保っている位置posへ挿入する。'),
        'c：新たなQueueElementに保持するのは要素と要素自身の重みweightである。走査のための合計sumを保持すると後続の挿入位置の判定が変わる。',
        '設問2：LinkedListのpollが行う先頭の取得・削除をそのまま利用する。リストが空であればnullを返す。',
      ].join('\n'),
    };
  });
