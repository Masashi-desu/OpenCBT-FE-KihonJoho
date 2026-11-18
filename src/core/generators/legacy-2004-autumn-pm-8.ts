import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2004-autumn-pm-06-09-support';

const conditions = [
  { capacity: 50, args: ['起', '承', '転', '結'] },
  { capacity: 8, args: ['青', '赤', '青', '白', '緑', '黄', '紫', '黒'] },
  { capacity: 16, args: ['春', '夏', '秋', '冬', '春'] },
  { capacity: 32, args: ['北', '南'] },
] as const;
const format = (items: readonly string[]) => items.map((item, i) => i + ': ' + item).join(' ');
const programs1And2 = (capacity: number) => [
`public abstract class Store {
    Object[] data = new Object[${capacity}];
    int index = 0;

    public void put(Object value) {
        if ([a])
            throw new DataStoreException("overflow");
        data[index++] = value;
    }
    public abstract Object get();
    public int size() {
        return [b];
    }
}`,
`public class FifoStore extends Store {
    public Object get() {
        if (index == 0)
            throw new DataStoreException("not exist");
        Object value = data[0];
        for ([c])
            data[i] = data[i + 1];
        data[--index] = null;
        return value;
    }
}`,
];
const programs3To5 = [
`public class LifoStore extends Store {
    public Object get() {
        if (index == 0)
            throw new DataStoreException("not exist");
        Object value = data[--index];
        data[index] = null;
        return value;
    }
}`,
`public class StoreTest {
    public static void main(String[] args) {
        FifoStore fifo = new FifoStore();
        LifoStore lifo = new LifoStore();
        for (int i = 0; i < args.length; i++) {
            fifo.put(args[i]);
            lifo.put(args[i]);
        }
        printData(fifo);
        printData(lifo);
    }
    private static void printData([d] store) {
        int size = store.size();
        for (int i = 0; i < size; i++)
            System.out.print(i + ": " + store.get() + " ");
        System.out.println();
    }
}`,
`public class DataStoreException extends RuntimeException {
    public DataStoreException(String message) {
        super(message);
    }
}`,
];
const program = (text: string, section: number) => [p('〔プログラム' + section + '〕'), code(text, 'java')];

export const q8 = draftQuestion(8, 'Javaのオブジェクト格納順と取出し', '配列の上限とストアへの入力例', 'エエイエ',
  '格納上限とコマンド引数の個数・値を変え、満杯、取出し順及び残数を本文・配列・実行例で同期する。FIFOとLIFOの共通メソッド、配列の境界と継承関係、四つの空欄の形を保つ。', index => {
    const { capacity, args } = conditions[index];
    return {
      pages: [
        { page: 29, blocks: [
          p('問8　次のJavaプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕'),
          p('任意のオブジェクトを格納し，取り出すプログラムである。格納されたオブジェクトを取り出す方法として，先入れ先出し法（First-In-First-Out）及び後入れ先出し法（Last-In-First-Out）がある。'),
          p('（1）抽象クラスStoreに，メソッドput，get，sizeを定義する。'),
          code('public void put(Object value)', 'java'),
          p('引数で指定したvalueをStoreのインスタンスに先着順に格納する。格納できるオブジェクトの個数の上限は' + capacity + 'である。それを超えて格納しようとしたときはDataStoreExceptionを投げる。'),
          code('public abstract Object get()', 'java'),
          p('格納されているオブジェクトを一つ取り出して返す。どのオブジェクトを取り出すかは，このメソッドを実装するサブクラスによって決まる。オブジェクトがないときはDataStoreExceptionを投げる。'),
          code('public int size()', 'java'),
          p('格納されているオブジェクトの個数を返す。オブジェクトが格納されていないときは0を返す。'),
          p('（2）クラスFifoStoreは，抽象クラスStoreのサブクラスで，メソッドgetは格納されているオブジェクトのうち最初に格納されたものを取り出して返す。すなわち，先入れ先出しとなる。'),
          p('（3）クラスLifoStoreは，抽象クラスStoreのサブクラスで，メソッドgetは格納されているオブジェクトのうち最後に格納されたものを取り出して返す。すなわち，後入れ先出しとなる。'),
          p('（4）クラスStoreTestは二つのサブクラスをテストするプログラムである。プログラム起動時に指定された引数をFifoStore及びLifoStoreに格納し，取り出す操作をする。実行例を図に示す。ただし，図中の%はシステムのコマンドプロンプトを表し，コマンドの引数はStringの配列としてメソッドmainに渡されるものとする。'),
        ] },
        { page: 30, blocks: [
          code('% java StoreTest ' + args.join(' ') + '\n' + format(args) + '\n' + format([...args].reverse()), 'text'),
          p('図　クラスStoreTestの実行例'),
          ...programs1And2(capacity).flatMap((contents, i) => program(contents, i + 1)),
        ] },
        { page: 31, blocks: programs3To5.flatMap((contents, i) => program(contents, i + 3)) },
        { page: 32, blocks: [p('設問　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')], banks: [
          bank('a', ['index < data.length', 'index <= data.length', 'index > data.length', 'index >= data.length', 'index + 1 >= data.length'], 'エ', 'java'),
          bank('b', ['data.length', 'data.length - 1', 'data.length - index', 'index', 'index + 1'], 'エ', 'java'),
          bank('c', ['int i = 0; i < index; i++', 'int i = 0; i < index - 1; i++', 'int i = 0; i < index - 2; i++',
            'int i = 1; i < index; i++', 'int i = 1; i < index - 1; i++'], 'イ', 'java'),
          bank('d', ['FifoStore', 'LifoStore', 'Object', 'Store', 'StoreTest'], 'エ', 'java'),
        ] },
      ],
      explanation: '配列の長さは' + capacity + 'で，indexは現在の個数と次に格納する添字を兼ねる。indexがdata.length以上なら次の格納先がない。sizeはindexを返す。FIFOでは先頭を取り出して添字0からindex−2までを右隣の要素で詰め，空いた旧末尾をnullにする。時点indexが満杯のとき，添字indexの参照は配列外になる。LIFOは末尾を直接取り出す。printDataでは両クラスが継承したStoreのsizeとgetを利用する。実行例の' + args.length + '件はFIFOでは入力順，LIFOでは末尾から順になる。',
    };
  }, 'fixed');
