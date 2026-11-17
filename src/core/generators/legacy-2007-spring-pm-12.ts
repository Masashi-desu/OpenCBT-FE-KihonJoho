import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2007-spring-pm-10-13-support';

type Cell = readonly [number, number];
const moves: readonly (Cell | null)[] = [[0,0],[1,1],[2,2],[2,0],[0,2],[1,2],[2,1],null,[0,1],[1,0]];
const cases = [
  { symbols: ['o','x'], transform: ([x,y]: Cell) => [x,y] as Cell },
  { symbols: ['+','*'], transform: ([x,y]: Cell) => [2-x,y] as Cell },
  { symbols: ['A','B'], transform: ([x,y]: Cell) => [y,x] as Cell },
  { symbols: ['#','@'], transform: ([x,y]: Cell) => [y,2-x] as Cell },
];
const setup = (index: number) => ({ symbols: cases[index].symbols, steps: moves.map(move => move && cases[index].transform(move)) });
const boardRows = (steps: (Cell | null)[], letters: string[], lastPosition: number) => {
  const board = Array.from({ length: 3 }, () => Array<string>(3).fill(' '));
  let previous: Cell = [0,0];
  for (const [i, move] of steps.slice(0, lastPosition + 1).entries()) {
    if (move) {
      const [x,y] = move;
      board[y][x] = letters[i % 2];
      previous = move;
    } else board[previous[1]][previous[0]] = ' ';
  }
  return board;
};
export const q12Board = languageFigure(12, 'winning-board', '図1 先手が勝ちの例', index => {
  const { symbols, steps } = setup(index);
  const rows = boardRows(steps, symbols, 8), columns = ['左','中央','右'];
  return { kind: 'table', columns, rows, codeColumn: -1, hideHeadings: true, alt: rows.map(row => row.map(cell => cell.trim() || '空欄').join('｜')).join('\n') };
});
export const q12Output = languageFigure(12, 'output', '図2 実行結果の一部', index => {
  const { symbols, steps } = setup(index);
  const rows = (step: number) => boardRows(steps, symbols, step).map(row => row.join(' ')).join('\n');
  const text = [
    'Turn : CROSS : IN_PROGRESS', rows(5), 'Turn : CIRCLE : IN_PROGRESS', rows(6), 'undo', rows(7),
    'Turn : CIRCLE : CIRCLE_WON', rows(8), 'Game is over.',
  ].join('\n');
  return { kind: 'output', text, alt: text };
});
const mark = (symbols: string[]) => `public enum Mark {
    // 記号の種類を表す列挙。各列挙定数では定数 symbol を定義する。
    // 定数 symbol の値は各コンストラクタで与えられた値('${symbols[0]}'など)である。
    CIRCLE('${symbols[0]}'), CROSS('${symbols[1]}'), BLANK(' ');
    public final char symbol;
    Mark(char symbol) {
        this.symbol = symbol;
    }
}`;
const board1 = `public class TicTacToeBoard {
    // ゲームの進行状況を表す列挙
    public enum Progress {CIRCLE_WON, CROSS_WON, DRAWN, IN_PROGRESS}
    private Mark[][] board = new Mark[3][3]; // 盤
    private Mark turn = Mark.CIRCLE;
    private Progress progress = Progress.IN_PROGRESS;
    private int count = 0;        // 盤に書かれた記号の個数
    private int lastx, lasty;     // 最後に記号が書かれた位置を保持する。

    public TicTacToeBoard() {     // 盤を初期化する。
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 3; j++)
                board[i][j] = ［a］;
    }

    public synchronized Progress put(int x, int y, Mark mark) {
        if (［b］)
            throw new IllegalStateException();
        if (board[x][y] != Mark.BLANK || mark != turn)
            throw new IllegalArgumentException();
        board[x][y] = mark;
        lastx = x;
        lasty = y;
        count++;
        // 勝ちか否かを検査する。
        boolean game =
            // たてと横の列を検査する。
            check(x, 0, 0, 1, mark) || check(0, y, 1, 0, mark) ||
            // 斜めの列を検査する。
            check(0, 0, 1, 1, mark) || check(0, 2, ［c］, mark);
        if (game)
            if (turn == Mark.CIRCLE)
                progress = Progress.CIRCLE_WON;
            else progress = Progress.CROSS_WON;
        else if (count == 9) progress = Progress.DRAWN;
        // 次に書かれる記号の種類を決定する。
        if (turn == Mark.CIRCLE) turn = Mark.CROSS;
        else turn = Mark.CIRCLE;
        return progress;
    }`;
const board2 = `    private boolean check(int x, int y, int dx, int dy, Mark mark) {
        return (board[x][y] == mark &&
                board[x + dx][y + dy] == mark &&
                board[x + 2 * dx][y + 2 * dy] == mark);
    }

    public Mark get(int x, int y) {
        return board[x][y];
    }

    public synchronized void undo() {
        if (progress == Progress.IN_PROGRESS &&
             board[lastx][lasty] != Mark.BLANK) {
            turn = board[lastx][lasty];
            board[lastx][lasty] = Mark.BLANK;
            count--;
        } else {
            throw new IllegalStateException();
        }
    }
}`;
const renderMoves = (steps: (Cell | null)[]) => steps.map(cell => cell ? '{' + cell.join(', ') + '}' : 'null');
const tester = (steps: (Cell | null)[]) => `public class TicTester {
    public static void main(String[] args) {
        // 記号を書く位置(x, y)を定義した配列。nullのときはundoを呼ぶ。
        int[][] p = {${renderMoves(steps).slice(0,6).join(', ')},
                     ${renderMoves(steps).slice(6).join(', ')}};
        TicTacToeBoard board = new TicTacToeBoard();
        Mark marks[] = {Mark.CIRCLE, Mark.CROSS};
        for (int i = 0; i < p.length; i++) {
            try {
                if (p[i] == null) {
                    System.out.println("undo");
                    board.undo();
                } else {
                    Mark turn = marks[［d］];
                    System.out.println("Turn : " + turn + " : " +
                        board.put(p[i][0], p[i][1], turn));
                }
                for (int y = 0; y < 3; y++) {
                    for (int x = 0; x < 3; x++)
                        System.out.print(board.get(x, y).symbol + " ");
                    System.out.println();
                }
            } catch (IllegalStateException ise) {
                System.out.println("Game is over.");
            }
        }
    }
}`;
const undoOptions = ['2手目以降で続けて2回呼ぶと，二つ消せる。', '2手目以降で続けて2回呼ぶと，呼ばなかった状態に戻る。',
  '2手目以降で続けて2回呼んでも，消せるのは一つだけである。', 'ゲーム中で先手後手とも，それぞれ1回しか消せない。', '消すことができなければ例外を投げる。'];

export const q12 = createLanguageDefinition(12, 'Java：三目並べの盤と直前の手の取消し', '三目並べの着手順・盤への反映', 'abcdxy',
  '設問1 aア bウ cウ dイ・設問2 ウ・オ（2個を1欄で採点）',
  'p43〜47。三目並べの配列・例外・列挙型・一手の取消しを維持し，盤上の着手位置と表示記号を可変にする。設問2の二選択はチェックリストで一欄として採点。巻末Java APIのMap等は呼び出さず，設問内の列挙型の説明を保持。',
  index => {
    const { symbols, steps } = setup(index);
    return {
      pages: [
        page(43, [
          p('次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\n三目並べを行うプログラムである。盤は3×3の升目をもち，2人のプレーヤは交互に自分の記号（' +
            symbols.join('又は') + '）を書く。たて，横，斜めでの三つの升の並びを列と呼び，先にどれかの列の三つの升すべてに自分の記号を書いた方を勝ちとする。また，盤のすべての升に記号が書かれていて，どちらの勝ちでもないときは引き分けとする。先手は' +
            symbols[0] + '，後手は' + symbols[1] + 'を使う。先手（' + symbols[0] + '）が勝ちの例を図1に示す。'),
          q12Board.block(index),
          p('列挙型Markは記号を表し，先手はMark.CIRCLE，後手はMark.CROSSを使うことにする。また，升に何も書かれていない状態をMark.BLANKで表す。クラスTicTacToeBoardは盤を表し，（1）〜（4）のメソッドをもつ。'),
          code('（1）Progress put(int x, int y, Mark mark)', 'text'),
          p('盤の位置(x, y)にmarkで表される記号を書く。盤の状態を列挙型Progressで返す。戻り値と盤の状態の対応は次のとおりである。\nProgress.CIRCLE_WON — 先手の勝ち\nProgress.CROSS_WON — 後手の勝ち\nProgress.DRAWN — 引き分け\nProgress.IN_PROGRESS — 進行中'),
          p('指定位置が盤の範囲外のときはArrayIndexOutOfBoundsExceptionを投げる。既に勝敗が決まっているとき（引き分けを含む）はIllegalStateExceptionを投げ，次のいずれかに該当するときはIllegalArgumentExceptionを投げる。\n① 指定位置に既に記号が書かれている。\n② 指定された記号が書けるプレーヤの番ではない。'),
        ]),
        page(44, [
          code('（2）boolean check(int x, int y, int dx, int dy, Mark mark)', 'text'),
          p('盤のある一つの列の三つの升すべてに，指定された記号が書かれているか否かを検査する。位置(x, y)，(x + dx, y + dy)，(x + 2 * dx, y + 2 * dy)の三つの升に書かれている記号が，markと等しければtrueを返す。'),
          code('（3）Mark get(int x, int y)', 'text'), p('盤の位置(x, y)に書かれている記号を返す。'),
          code('（4）void undo()', 'text'), p('直前に書いた記号を消す。ただし，勝敗が決まった後は消すことができない。'),
          p('クラスTicTesterはテスト用のプログラムである。実行結果の一部を図2に示す。'),
          q12Output.block(index),
          p('〔参考：列挙（enum）について〕\nプログラム中のMarkとProgressはそれぞれ列挙型であり，列挙型Markは三つの列挙定数CIRCLE，CROSS，BLANKを，列挙型Progressは四つの列挙定数CIRCLE_WON，CROSS_WON，DRAWN，IN_PROGRESSをもつ。列挙型はクラスの一種であり，列挙定数は列挙型のインスタンスである。'),
        ]),
        page(45, [p('〔プログラム1〕'), code(mark(symbols), 'java'), p('〔プログラム2〕'), code(board1, 'java')]),
        page(46, [code(board2, 'java'), p('〔プログラム3〕'), code(tester(steps), 'java')]),
        page(47, [
          p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2 クラスTicTacToeBoardのメソッドundoに関する記述として正しい答えを，解答群の中から二つ選べ。'),
        ], [
          bank(1, 'a', ['Mark.BLANK', 'Mark.CIRCLE', 'Mark.CROSS', 'null'], 'ア', 'java'),
          bank(1, 'b', ['count < 0', 'count >= 9', 'progress != Progress.IN_PROGRESS', 'progress == Progress.IN_PROGRESS'], 'ウ', 'java'),
          bank(1, 'c', ['-1, -1', '-1, 1', '1, -1', '1, 1'], 'ウ', 'java'),
          bank(1, 'd', ['i', 'i % 2', 'i & 2', 'i / 2'], 'イ', 'java'),
          { ...bank(2, 'xy', undoOptions, 'ウオ'), label: '解答群' },
        ], [0,0,0,0,1]),
      ],
      unordered: 'xy', checklist: true,
      explanation: 'aは空きを表すMark.BLANK。bは進行中でなければ例外。cは左下から右上へ進むのでdx＝1，dy＝−1。dは配列の二つの記号をiの偶奇から選ぶ。' +
        'undoは最後の位置だけを空ける。位置の履歴はないので続けて呼ぶと，最後の位置はすでに空白で例外となる。新しい手が入ればまた取り消せるが，勝敗や引き分けが決まった後は例外となる。今回，先手の' +
        symbols[0] + 'が先に一列を完成する。',
    };
  }, { answerVariation: 'fixed' });
