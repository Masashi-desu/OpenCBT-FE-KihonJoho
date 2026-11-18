import { code, p } from './definition';
import { bank, page, springLanguageFigure, springLanguageQuestion } from './legacy-2006-spring-pm-10-13-support';

const examples = [
  { width: 4, input: [3, 8, 3, 1, 2, 4, 7, 8, 3, 7] },
  { width: 5, input: [6, 1, 3, 4, 7, 2, 4, 6, 5, 3, 3, 2] },
  { width: 6, input: [5, 3, 5, 7, 2, 4, 1, 2, 1, 4, 5, 7, 7, 1] },
  { width: 5, input: [6, 4, 6, 1, 2, 7, 2, 3, 4, 6, 3, 6, 5, 3] },
];

function relativeIndices(width: number): number[][] {
  return Array.from({ length: width }, (_, column) => {
    const offsets = [];
    if (column < width - 1) offsets.push(1);
    if (column > 0) offsets.push(width - 1);
    offsets.push(width);
    if (column < width - 1) offsets.push(width + 1);
    return offsets;
  });
}

export function solitaireCardLabel(rank: number) {
  return ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' } as Record<number, string>)[rank] ?? String(rank);
}

export const solitaireFigure = springLanguageFigure(12, 'pair-removal', 'カードを取り除いて詰める操作の例', index => {
  const { width, input } = examples[index];
  const offsets = relativeIndices(width);
  const boards = [];
  let current = [...input];
  for (;;) {
    const pairs = current.flatMap((rank, from) => offsets[from % width].flatMap(offset => {
      const other = from + offset;
      return current[other] === rank ? [[from, other] as const] : [];
    }));
    const chosen = pairs[0];
    boards.push({ values: current, chosen, alternatives: pairs.slice(1) });
    if (!chosen) break;
    current = current.filter((_, i) => !chosen.includes(i));
  }
  const alt = boards.map(({ values, chosen, alternatives }, step) => {
    const rows = [];
    for (let i = 0; i < values.length; i += width) rows.push(values.slice(i, i + width).map(solitaireCardLabel).join(' '));
    const places = ([from, to]: readonly [number, number]) => [from, to].map(i =>
      (Math.floor(i / width) + 1) + '段目左から' + (i % width + 1) + '番目').join('と');
    return '図の状態' + (step + 1) + '。' + rows.join('／') + '。' +
      (chosen ? '黒いペアは' + places(chosen) + '。' : '') +
      (alternatives.length ? 'ほかの候補は' + alternatives.map(places).join('、') + '。' : '');
  }).join('\n');
  return { width, boards, alt };
});

const cardProgram = `import java.util.Random;

public class Card {
    public static final int SPADES = 0;
    public static final int HEARTS = 1;
    public static final int DIAMONDS = 2;
    public static final int CLUBS = 3;

    private static final Random rand = new Random();
    private static final Card[] cards = new Card[13 * 4];
    private final int suit;
    private final int rank;

    [a]
        for (int i = SPADES; i <= CLUBS; i++) {
            for (int j = 1; j <= 13; j++) {
                cards[[b]] = new Card(i, j);
            }
        }
    }

    private Card(int suit, int rank) {
        this.suit = suit;
        this.rank = rank;
    }
    public int getSuit() { return suit; }
    public int getRank() { return rank; }

    public static Card[] newDeck() {
        Card[] deck = new Card[cards.length];
        System.arraycopy(cards, 0, deck, 0, cards.length);
        for (int i = cards.length - 1; i > 0; i--) {
            int index = rand.nextInt(i + 1);
            Card tmp = deck[i];
            deck[i] = deck[index];
            deck[index] = tmp;
        }
        return deck;
    }
}`;

function gameProgram(width: number) {
  return `public class Game {
    // 現在注目しているカードからの相対インデックス
    private static final int[][] indexDiff = {
${relativeIndices(width).map(row => '        { ' + row.join(', ') + ' }').join(',\n')}
    };

    private static void checkAndRemove(List list) {
        // listの最初からその隣り合うカードを調べる。
        // currentIndexは現在注目しているカードのインデックス値
        for (int currentIndex = 0; currentIndex < list.size();
             currentIndex++) {
            // currentRankは現在注目しているカードの位
            int currentRank =
                ((Card) list.get(currentIndex)).getRank();
            // 現在注目しているカードと隣り合うカードへの
            // インデックスを求める。
            int[] diffList = indexDiff[currentIndex % ${width}];
            for (int i = 0; i < diffList.length; i++) {
                // adjacentIndexは隣り合うカードへのインデックス値
                int adjacentIndex = [c];
                if ([d]
                    && ((Card) list.get(adjacentIndex)).getRank()
                        == currentRank) {
                    list.remove(adjacentIndex);
                    list.remove([e]);
                    checkAndRemove(list);
                    return;
                }
            }
        }
    }

    public static void main(String[] args) {
        Card[] deck = Card.newDeck();
        List list = new ArrayList();
        for (int i = 0; i < deck.length; i++) {
            list.add(deck[i]);
            checkAndRemove(list);
        }
        if (list.size() == 0) {
            System.out.println("上がり!");
        } else {
            System.out.println("残り" + list.size() + "枚");
        }
    }
}`;
}

const javaBanks = [
  bank(0, 'a', ['private Card() {', 'private static void init() {', 'private void init() {', 'static {', 'synchronized {', '{'], 'エ', 'java'),
  bank(0, 'b', ['i * 13 + j', 'i * 13 + j - 1', 'i * 4 + j - 1', 'j * 13 + i', 'j * 13 + i - 1', 'j * 4 + i - 1'], 'イ', 'java'),
  bank(0, 'c', ['currentIndex * diffList[i]', 'currentIndex + diffList[i]', 'currentIndex - diffList[i]',
    'i * diffList[currentIndex]', 'i + diffList[currentIndex]', 'i - diffList[currentIndex]'], 'イ', 'java'),
  bank(0, 'd', ['adjacentIndex != list.size()', 'adjacentIndex < list.size()', 'adjacentIndex <= list.size()',
    'adjacentIndex == list.size()', 'adjacentIndex > list.size()', 'adjacentIndex >= list.size()'], 'イ', 'java'),
  bank(0, 'e', ['0', 'adjacentIndex', 'adjacentIndex - 1', 'currentIndex', 'currentIndex - 1', 'list.size() - 1'], 'エ', 'java'),
];

export const q12 = springLanguageQuestion(12, 'トランプの隣接カードと配列', '盤面の横幅と隣接ペア', 'abcde', 'エイイイエ',
  '52枚・4スート・13ランクの不変インスタンス、ランダムな山、置く順序とペアの優先順位を維持する。横幅を4〜6枚、実際のカード列を4条件で変え、隣接表と4段階の図を同じ幅で描く。APIの挙動をOracle Java SE 8仕様で照合し、同文書の文言・図は使用しない。空欄が問う処理は同じため答えの式は固定する。', (index, original) => {
    const { width } = examples[index];
    const rules = original
      ? 'ペアが複数できた場合（図の8と3の各2枚）は，最も長く場にあるカードを含むペア（8）を取り除く。最も長く場にあるカードを含むペアが複数ある場合は，そのカードと組むカードのうち最も長く場にあるカードとのペア（3）を取り除く。'
      : 'ペアが複数できた場合は，最も長く場にあるカードを含むペアを取り除く。最も長く場にあるカードが複数の相手と組める場合は，そのうち最も長く場にいる相手とのペアを取り除く。';
    return {
      pages: [
        page(48, [
          p('問12　次のJavaプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕\nトランプを用いた一人遊びのゲームを実行するプログラムである。ゲームのルールは，次のとおりである。'),
          p('（1）トランプはスペード，ハート，ダイヤ及びクラブの4種類のスートがあり，各スートはA（エース），2〜10，J（ジャック），Q（クイーン）及びK（キング）の1〜13の位（ランク）を表す13枚のカードからなる。合計52枚を使用し，スートは区別しない。'),
          p('（2）52枚のカードを，1枚ずつ表を向けて横に並べる。' + width + '枚並べたらその下の列に移り，再び左端から並べる。カードを並べるところを場と呼び，横の並びを列と呼ぶ。'),
          p('（3）1枚並べるごとに，縦，横，斜めに隣り合うカードが同じ位かを調べ，同じ位のペアができたらそれを取り除いて空いたスペースを詰める。列の最後と次の列の最初とは隣り合わない。' + rules),
          p('（4）（3）の操作を隣り合うカードの位が全部異なるまで繰り返す。'),
          solitaireFigure.block(index),
        ]),
        page(49, [
          p('（5）（2）〜（4）の操作を手持ちのカードがなくなるまで繰り返す。\n（6）手持ちのカードがなくなったとき，すべてのカードが場から取り除かれていれば上がりである。'),
          p('Cardはカードを表す。クラスの初期化でA〜KのCardインスタンスを全4スート分生成して配列cardsに格納する。Cardのインスタンスは不変で，同じスートと位の1枚に対応するインスタンスは常に同一である。例えば，ハートのエースのインスタンスは一つである。クラスメソッドnewDeckはcardsをランダムな順に並べた配列をトランプの一山として返す。'),
          p('Gameはゲームを実行する。Listのインスタンスlistが場を表し，山を表すdeckから1枚ずつ追加して，その都度checkAndRemoveを呼び，同じ位で隣り合うペアを取り除く。'),
          p('java.util.RandomのnextInt(int n)は，0からn−1までの整数乱数を返す。java.util.Listは0から始まる位置で要素を扱う。add(Object obj)は末尾へ追加し，get(int index)は指定位置の要素を得る。remove(int index)は指定位置を削除し，後続要素を前へ詰める。size()は要素数を返す。java.util.ArrayListは配列を用いたListの実装である。'),
        ]),
        page(50, [p('〔プログラム1〕'), code(cardProgram, 'java'),
          p('〔プログラム2〕'), code('import java.util.ArrayList;\nimport java.util.List;', 'java')]),
        page(51, [code(gameProgram(width), 'java')]),
        page(52, [p('設問　プログラム中の［a］〜［e］に入れる正しい答えを，解答群の中から選べ。')], javaBanks),
      ],
      explanation: 'カードはクラス初期化のstaticブロックで一度だけ作る。スートiとランクjはi×13＋j−1で0〜51へ重複なく入る。横幅' + width + '枚の相対位置表を使い，現在位置にその相対値を足す。候補の添字が要素数より小さい場合にだけランクを読む。相対値はすべて正なので，ペアのうち後ろを先に削除すれば手前のcurrentIndexは動かない。先頭から順に調べ直すので，古い組を優先して詰める操作を続けられる。',
    };
  }, { answerVariation: 'fixed' });
