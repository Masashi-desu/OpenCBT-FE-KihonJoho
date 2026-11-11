import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page, type LanguageTable } from './legacy-2010-spring-pm-09-13-support';

const cases = [
  { rows: 8, columns: 8, blank: 'S' },
  { rows: 6, columns: 6, blank: 'N' },
  { rows: 4, columns: 6, blank: 'NE' },
  { rows: 8, columns: 6, blank: 'E' },
];
const directionEntries = [
  ['N', '-1, 0'], ['NE', '-1, 1'], ['E', '0, 1'], ['SE', '1, 1'],
  ['S', '1, 0'], ['SW', '1, -1'], ['W', '0, -1'], ['NW', '-1, -1'],
];
const alphabet = 'abcdefgh';
const coordinate = (row: number, column: number) => alphabet[column] + (row + 1);
const black = '●';
const white = '○';
const empty = '—';

function state(index: number) {
  const { rows, columns } = cases[index];
  const top = rows / 2 - 1;
  const left = columns / 2 - 1;
  const initial = Array.from({ length: rows }, () => Array<string>(columns).fill(empty));
  initial[top][left] = initial[top + 1][left + 1] = white;
  initial[top][left + 1] = initial[top + 1][left] = black;
  return { initial, top, left };
}
function boardTable(board: string[][], row: number, height: number, column: number, width: number, caption?: string): LanguageTable {
  return { caption, headers: ['行', ...alphabet.slice(column, column + width)],
    rows: board.slice(row, row + height).map((line, i) => [String(i + row + 1), ...line.slice(column, column + width)]) };
}
const boardInitial = languageFigure(11, 'board-initial', '図1 盤の初期状態', index => {
  const { rows, columns } = cases[index];
  return { kind: 'tables', tables: [boardTable(state(index).initial, 0, rows, 0, columns)], note: '○は白，●は黒，—は空いている升。' };
});
const boardMove = languageFigure(11, 'board-move', '図2 盤に石を置く例', index => {
  const { initial, top, left } = state(index);
  const placed = initial.map(row => [...row]);
  placed[top + 1][left + 2] = black;
  const flipped = placed.map(row => [...row]);
  flipped[top + 1][left + 1] = black;
  return { kind: 'tables', tables: [
    boardTable(initial, top - 1, 4, left, 3, '（ア）初期状態の中央部分'),
    boardTable(placed, top - 1, 4, left, 3, '（イ）黒を置いて白を挟んだ状態'),
    boardTable(flipped, top - 1, 4, left, 3, '（ウ）白を反転させた状態'),
  ], note: '○は白，●は黒，—は空いている升。' };
});
const returnValues = languageFigure(11, 'reverse-return', 'reverseの戻り値と意味', () => {
  const description = '引数row，colで与えられた升から引数dirで与えられた方向';
  return { kind: 'tables', tables: [{ headers: ['戻り値', '意味'], rows: [
    ['正の値', description + 'で反転した石の個数'],
    ['0', description + 'に［f］'],
    ['-1', description + 'に［g］'],
  ] }] };
});
export const q11Figures = [boardInitial, boardMove, returnValues];

const offsetOptions = ['-1, 0', '-1, 1', '0, 0', '0, 1', '1, 0'];
const java = (source: string) => code(source, 'java');
const player = `class Player {
    final Piece piece;
    int count = 2;
    Player(Piece piece) { this.piece = piece; }
    public String toString() { return piece + ": " + count; }
}`;

export const q11 = createLanguageDefinition(11, 'Java：リバーシの盤面と再帰による石の反転', '盤の行数・列数と空欄にする方角', 'abcdefg',
  '設問1 aオ bウ cイ dウ eイ／設問2 fウ gア', '4つのプログラムと再帰の形、盤図3状態、二設問と7欄を保持する。盤面の形、空欄の方角、初期配置と着手例を連動させる。標準APIは識別子と動作のみ。外部ゲーム規則・Java API原資料の転載はない。', index => {
    const { rows, columns, blank } = cases[index];
    const { top, left } = state(index);
    const offsets = directionEntries.map(([direction, offset]) => direction + '(' + (direction === blank ? '［a］' : offset) + ')');
    const blankKey = 'アイウエオ'[offsetOptions.indexOf(directionEntries.find(([direction]) => direction === blank)![1])];
    const place = coordinate(top + 1, left + 2);
    const flip = coordinate(top + 1, left + 1);
    return {
      pages: [
        page(61, [
          p('問11 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕リバーシゲームで2人のプレーヤの対戦を支援するプログラムである。'),
          p(`リバーシは，${rows}行${columns}列の升からなる盤に，2人のプレーヤが片面が白，もう一方が黒の石を置いていき，盤上の石の個数を競うゲームである。各プレーヤは自分の色をもち，盤の初期状態では図1のとおり中央に白黒2個ずつを配置する。升の位置は列をアルファベット，行を数字で表し，列・行の順で指定する。最も左上の升はa1，最も右下の升は${coordinate(rows - 1, columns - 1)}である。`),
          boardInitial.block(index), boardMove.block(index),
          p(`空いている升に石を置いて，縦，横，斜めのどれかの方向に隣接する相手の石を自分の色の石で挟まなければならない。挟んだ相手の石をすべて反転させ，自分の色の石とする。図2の（ア）は中央部分，（イ）は黒を${place}に置いて${flip}の白を挟んだ状態，（ウ）は白を黒に反転した状態である。`),
          p('相手の石を挟めないプレーヤは手番をパスする。片方の色の石が盤からなくなったとき，全升が埋まったとき，又は空いているどの升にも石が置けなくなったときにゲームが終了し，自分の色の石が多いプレーヤが勝つ。'),
          p('列挙Pieceは石の面を表す。BLACKは黒，WHITEは白。クラスPlayerはプレーヤを表し，pieceは石の色，countは盤上での石の個数である。'),
        ]),
        page(62, [
          p('クラスBoardは盤を表し，対戦を支援する次の（1）〜（7）の機能を実現する。'),
          p('（1）配列gridは盤の升を表す。grid[row][col]のrowは行，colは列である。例えば升d2はgrid[1][3]である。'),
          p('（2）列挙Directionは，gridで縦，横，斜め8方向の隣接する升へのrow及びcolのオフセットを表す定数である。'),
          p('（3）コンストラクタはインスタンスを生成し，盤を初期状態にする。'),
          p('（4）canPlaceは，引数playerで与えられたプレーヤが石を置ける升があればtrue，なければfalseを返す。'),
          p('（5）reverseは，row，colで与えられた升にpieceで与えられた色の石を置いた場合，dirの方向に隣接する升の石を反転できれば反転する。隣接する升を起点に自身を再帰的に呼び出し，連続する相手の石の先にpieceと同色の石があるかを調べる。同色の石があれば相手の石を反転して復帰し，全再帰呼出しから復帰すると挟んだ石の個数を返す。反転できなければ0又は負の値を返す。'),
          p('（6）placeはpositionで指定された升にplayerの石を置けるかを判定する。置ける場合は升に石を置き，reverseを呼び出して挟んだ石を反転し，反転した石の個数を返す。升に既に石があるか，相手の石を1個も反転できない場合は0又は負の値を返し，指定された升には石を置かない。'),
          p('（7）displayは盤の状態を表示する。'),
          p('Reversiはゲームを実行する。playerは石を置く番のプレーヤ，opponentは対戦相手である。黒が常に先手。playerが石を置いた後に両プレーヤの石の個数を更新し，終了を判断する。終了時は盤の最後の状態を表示して終了し，続行時はplayerとopponentが交代する。promptはplayerの色を表示し，升を“列行”で入力するように促し，入力された位置を文字列で返す。'),
        ]),
        page(63, [
          p('〔プログラム1〕'), java('enum Piece { BLACK, WHITE }'),
          p('〔プログラム2〕'), java(player),
          p('〔プログラム3〕'),
          java(`class Board {
    private final Piece[][] grid = new Piece[${rows}][${columns}];

    private static enum Direction {
        ${offsets.slice(0, 4).join(', ')},
        ${offsets.slice(4).join(', ')};
        final int drow, dcol;
        private Direction(int drow, int dcol) {
            this.drow = drow; this.dcol = dcol;
        }
    }

    Board() {
        grid[${top}][${left}] = Piece.WHITE; grid[${top}][${left + 1}] = Piece.BLACK;
        grid[${top + 1}][${left}] = Piece.BLACK; grid[${top + 1}][${left + 1}] = Piece.WHITE;
    }

    boolean canPlace(Player player) { /* 実装は省略 */ }

    private int reverse(Piece piece, int row, int col,
                        Direction dir) {
        int nrow = row + dir.drow;
        int ncol = col + dir.dcol;
        Piece next = null;
        if ((nrow >= 0 && nrow < grid.length) &&
            (ncol >= 0 && ncol < grid[nrow].length)) {
            next = grid[nrow][ncol];
        }
        if (next == null)
            return -1;
        if (next == piece)
            return 0;
        int count = reverse(piece, nrow, ncol, dir);
        if (count >= 0) {
            ［b］ = piece;
            count++;`),
        ]),
        page(64, [
          java(`        }
        return count;
    }

    int place(Player player, String position) {
        int count = 0;
        try {
            int col = position.charAt(0) - 'a';
            int row = position.charAt(1) - '1';
            if (grid[row][col] != null)
                return -1;
            for (Direction dir: Direction.values()) {
                int n = reverse(player.piece, row, col, dir);
                if (n > 0)
                    count ［c］ n;
            }
            if (count > 0)
                grid[row][col] = player.piece;
        } catch (IndexOutOfBoundsException e) { }
        return count;
    }

    void display() { /* 実装は省略 */ }
}`),
          p('〔プログラム4〕'),
          java(`public class Reversi {
    public static void main(String[] args) {
        Board board = new Board();
        Player player   = new Player(Piece.BLACK),
               opponent = new Player(Piece.WHITE);
        while (true) {
            if (board.canPlace(player)) {
                board.display();
                int n;
                while ((n = board.place(player, prompt(player))) <= 0)
                    System.out.println("wrong position");
                player.count += ［d］;
                opponent.count -= n;
                System.out.println(player + ", " + opponent);
                if (player.count + opponent.count == ${rows} * ${columns}
                    || opponent.count == 0) {
                    board.display();
                    break;
                }
            } else if (!board.canPlace(opponent)) {
                board.display();
                break;
            }
            Player p = ［e］;`),
        ]),
        page(65, [
          java(`            opponent = player;
            player = p;
        }
    }

    private static String prompt(Player player) { /* 実装は省略 */ }
}`),
          p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [
          bank(1, 'a', offsetOptions, blankKey, 'java'),
          bank(1, 'b', ['grid[count][0]', 'grid[nrow][col]', 'grid[nrow][ncol]', 'grid[row][col]', 'grid[row][ncol]'], 'ウ', 'java'),
          bank(1, 'c', ['*=', '+=', '-=', '/=', '='], 'イ', 'java'),
          bank(1, 'd', ['++n', 'n', 'n + 1', 'n - 1', 'n++'], 'ウ', 'java'),
          bank(1, 'e', ['board', 'opponent', 'Piece.BLACK', 'Piece.WHITE', 'player'], 'イ', 'java'),
        ]),
        page(66, [
          p('設問2 次の表は，プログラム3のメソッドreverseの仕様をまとめたものである。表中の空欄に入れる正しい答えを，解答群の中から選べ。ここで，bには正しい答えが入っているものとする。'),
          returnValues.block(index),
        ], [
          { ...bank(2, 'fg', ['隣接する升が存在しない，又は隣接する升に石がない場合',
            '隣接する升にPiece以外のクラスのインスタンスが存在する場合',
            '隣接する升の石が引数pieceで与えられた石と同色の場合',
            '隣接する升の石が引数pieceで与えられた石と異なる色の場合'], 'ウア'), label: '解答群' },
        ]),
      ],
      explanation: `a：${blank}の隣接位置は行・列の順に（${directionEntries.find(([direction]) => direction === blank)![1]}）。b：挟めた場合，今回見た隣接升grid[nrow][ncol]の相手の石を反転する。c：正の値を8方向分加算する。d：手番のプレーヤが増やすのは反転したn個と置いた1個。相手はn個だけ失うので，nを変更する式は使えない。e：交代前のopponentを退避し，入れ替える。f・g：再帰の各段階では，同色の石に行き着けば0，盤外又は空升に行き着けば−1。相手色の石から再帰すると，挟める場合だけ復帰途中に反転し，挟めなければ−1が元の呼出しにも伝わる。`,
    };
  });
