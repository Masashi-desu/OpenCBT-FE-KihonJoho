import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2009-spring-pm-09-13-support';
import { spring2009PmPageAssetId, spring2009PmReference } from './legacy-2009-spring-pm-materials';

const cases = [
  { prefix: 'プログラム', suffix: '説明', insert: 'の', initial: 2, removed: 2, size: 128, deleteLeft: false, advance: true },
  { prefix: 'スクリプト', suffix: '構文', insert: 'の', initial: 3, removed: 1, size: 64, deleteLeft: true, advance: true },
  { prefix: 'レポート', suffix: '確認', insert: 'を', initial: 5, removed: 1, size: 32, deleteLeft: false, advance: false },
  { prefix: 'マニュアル', suffix: '目次', insert: 'の', initial: 1, removed: 3, size: 256, deleteLeft: true, advance: false },
];

function gapStates(index: number) {
  const { prefix, suffix, insert, initial, removed } = cases[index];
  const start = prefix + suffix;
  const added = prefix + insert + suffix;
  const state = (label: string, text: string, split: number, gap: number) => ({
    label, before: text.slice(0, split), after: text.slice(split), gap,
  });
  const shown = Math.max(prefix.length, initial + 1);
  return {
    overview: [state('① 表示イメージ', start, start.length, 0), state('② ギャップバッファ（配列buffer）', start, initial, 5)],
    insert: [state('①', start, initial, 5), state('②', start, prefix.length, 5), state('③', added, prefix.length + 1, 4)],
    delete: [state('①', added, prefix.length + 1, 4), state('②', added, removed + 1, 4),
      state('③', added.slice(0, removed) + added.slice(removed + 1), removed, 5)],
    cursor: [state('オフセット値', start.slice(0, shown) + '…', initial, 0)],
  };
}

const gapOverview = languageFigure(11, 'gap-buffer', '図1 テキストの表示イメージとギャップバッファ', index => ({
  kind: 'gap', mode: 'overview', rows: gapStates(index).overview, mark: cases[index].initial,
}));
const gapInsert = languageFigure(11, 'gap-insertion', '図2 挿入する手順', index => ({
  kind: 'gap', mode: 'insert', rows: gapStates(index).insert,
}));
const gapDelete = languageFigure(11, 'gap-deletion', '図3 削除する手順', index => ({
  kind: 'gap', mode: 'delete', rows: gapStates(index).delete,
}));
const gapCursor = languageFigure(11, 'gap-cursor', '図4 カーソルの位置', index => ({
  kind: 'gap', mode: 'cursor', rows: gapStates(index).cursor, mark: cases[index].initial,
}));
export const q11Figures = [gapOverview, gapInsert, gapDelete, gapCursor];

export function editorPrograms(index: number) {
  const { size, deleteLeft } = cases[index];
  const buffer = `class GapBuffer {
    private static final int INITIAL_GAP_SIZE = ${size};
    private char[] buffer;
    private int gapOffset = 0;
    private int gapSize = INITIAL_GAP_SIZE;

    GapBuffer(String initialText) {
        buffer = new char[initialText.length() + gapSize];
        System.arraycopy(initialText.toCharArray(), 0,
                         buffer, gapSize, initialText.length());
    }

    void insert(int offset, char ch) {
        confirmGap(offset);
        buffer[gapOffset++] = ch;
        ［a］;
    }

    void delete(int offset) {
        if (length() == 0)
            return;
        confirmGap(offset + 1);
        gapOffset--;
        gapSize++;
    }

    char charAt(int offset) {
        if (offset >= gapOffset)
            offset += ［b］;
        return buffer[offset];
    }

    int length() { return ［c］; }

    private void confirmGap(int newGapOffset) {
        if (gapSize == 0) {
            char[] temp = new char[buffer.length + INITIAL_GAP_SIZE];
            System.arraycopy(buffer, 0, temp, 0, buffer.length);
            gapOffset = buffer.length;
            gapSize = INITIAL_GAP_SIZE;
            buffer = temp;
        }
        if (newGapOffset < gapOffset) {
            System.arraycopy(buffer, newGapOffset, buffer,
                             newGapOffset + gapSize, gapOffset - newGapOffset);
        } else {
            System.arraycopy(buffer, gapOffset + gapSize,
                             buffer, gapOffset, newGapOffset - gapOffset);
        }`;
  const tail = `        gapOffset = newGapOffset;
    }
}`;
  const editor = `class Editor {
    private ［d］ buf;
    private int cursor = 0;

    private Editor(String text) {
        buf = new GapBuffer(text);
    }

    private void run() {
        Display.output(buf, cursor);
        char ch;
        while ((ch = CharReader.get()) != CharReader.EOF) {
            switch (ch) {
            case CharReader.MOVE_FORWARD:
                moveCursor(1);
                break;
            case CharReader.MOVE_BACKWARD:
                moveCursor(-1);
                break;
            case CharReader.DELETE:
                if (${deleteLeft ? 'cursor > 0' : 'cursor < buf.length()'}) {
                    buf.delete(［e］);
                }
                break;
            default:
                buf.insert(［f］, ch);
                break;
            }
            Display.output(buf, cursor);
        }
    }

    private void moveCursor(int n) {
        int newCursor = cursor + n;
        if (newCursor >= 0 && newCursor <= buf.length()) {
            cursor = newCursor;
        }
    }

    public static void main(String[] args) {
        Editor editor = new Editor(args[0]);
        editor.run();
    }
}`;
  return { buffer, tail, editor };
}

const java = (source: string) => code(source, 'java');
const operators = ['--cursor', '++cursor', 'cursor', 'cursor--', 'cursor++'];
const javaMaterials = [58];
export const q11 = createLanguageDefinition(11, 'Java：ギャップバッファによるテキスト編集', 'ギャップの移動・削除方向・挿入後のカーソル動作', 'abcdef',
  'aア bウ cウ dエ eウ fオ',
  '物理的なギャップと仮想的な文字位置、挿入と削除の移動図、コード及び空欄6個を維持。初期ギャップの容量、左右の移動、カーソル前後の削除、挿入後の位置を変える。a〜dのギャップ維持と型付けは共通。',
  index => {
    const { prefix, suffix, insert, initial, removed, deleteLeft, advance } = cases[index];
    const { buffer, tail, editor } = editorPrograms(index);
    const all = prefix + suffix;
    const added = prefix + insert + suffix;
    const move = all.slice(Math.min(initial, prefix.length), Math.max(initial, prefix.length));
    const split = added.slice(0, removed + 1);
    const remaining = added.slice(removed + 1);
    return {
      contexts: [spring2009PmReference('Javaプログラムで使用するAPIの説明', javaMaterials)],
      pages: [
        page(44, [
          p('問11 次のJavaプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'),
          p('〔プログラムの説明〕'), p('ギャップバッファを利用した簡易テキストエディタである。'),
          p('ギャップバッファとは，編集対象となる文字列の編集箇所に空き領域を作り，そこに文字を挿入する機構をもつバッファのことである。一般に，テキストの編集時には，文字の挿入，削除などの変更は局所的に集中することが多く，編集箇所にあらかじめ空き領域を作っておくと効率よく変更を行うことができるという利点がある。ギャップバッファ内の空き領域をギャップといい，ギャップバッファ内の文字列をテキストという。ここで，ギャップは，ギャップバッファ内に一つしか存在しない。ただし，文字の挿入によって，ギャップがない状態になる場合がある。'),
          p('テキストの表示イメージとギャップバッファを図1に示す（網掛けの部分がギャップである）。'), gapOverview.block(index),
          p('クラスGapBufferはギャップバッファの機能を実現する。このクラスの使用者は，テキストを仮想的に連続する文字列として扱うことができ，ギャップの位置やサイズを意識せずに文字の挿入や削除の処理を行う。このとき，図1①のように各文字はオフセット値（offset）で指定し，テキストの最初の文字はオフセット値0，テキストの最後の文字はオフセット値“テキストの文字数－1”で指定する。'),
          p('図1②は，配列buffer内におけるテキストの物理的な表現の例である。フィールドgapOffsetとgapSizeは，それぞれギャップの先頭位置とギャップのサイズを表す。'),
          p('図1②の状態から“' + prefix + '”と“' + suffix + '”の間に“' + insert + '”を挿入する手順を図2に示す。'),
        ]),
        page(45, [
          gapInsert.block(index),
          p((initial < prefix.length ? 'まず，“' + all.slice(0, initial) + '”の直後に“' + move + '”を移動することで，' :
            'まず，“' + move + '”をギャップの右側に移動することで，')
            + 'ギャップを“' + prefix + '”と“' + suffix + '”の間に移動する（図2②）。ギャップの先頭に“' + insert
            + '”を格納する（図2③）。この操作によって，ギャップのサイズは1文字分小さくなり，ギャップの先頭位置は1文字分後ろへずれる。'),
          p('次に，図2③の状態から“' + prefix + insert + '”の“' + added[removed] + '”を削除する手順を図3に示す。'),
          gapDelete.block(index),
          p('まず，“' + added.slice(removed + 1, prefix.length + 1) + '”を“' + suffix + '”の直前に移動することで，ギャップを“'
            + split + '”と“' + remaining + '”の間に移動する（図3②）。ギャップの先頭位置を1文字分前にずらし，ギャップのサイズを1文字分増やす（図3③）。'),
          p('クラスGapBufferは，次のコンストラクタ及びメソッドをもつ。'),
          p('（1）コンストラクタは引数initialTextで指定された文字列をテキストの初期値としてギャップバッファを生成する。ギャップは，テキストの前に作られる。'),
          p('（2）メソッドinsertは，メソッドconfirmGapを呼んで引数offsetの位置にギャップを移動した上で，引数offsetで指定された位置に，引数chで指定された文字を挿入する。'),
          p('（3）メソッドdeleteは，引数offsetで指定された位置にある文字を削除する。テキストがない場合は，何もしない。'),
        ]),
        page(46, [
          p('（4）メソッドcharAtは，引数offsetで指定された位置の文字を返す。'),
          p('（5）メソッドlengthは，テキストの文字数を返す。'),
          p('（6）メソッドconfirmGapは，配列bufferにおいて引数newGapOffsetで与えられた位置に1文字以上のギャップがあるようにする。必要であればギャップを指定された位置に移動し，ギャップがない場合は，新たにギャップを作る。'),
          p('なお，このクラスの各メソッドが呼び出されるとき，引数は正しいものとする。'),
          p('クラスEditorは，GapBufferを利用して，簡易テキストエディタを実現する。メソッドmainに与えられた最初の引数をテキストの初期値とする。カーソルは，文字の間にあり，カーソルの位置はオフセット値で表し，フィールドcursorに保持される。例えば，図4のようにカーソルが“' + all.slice(0, initial) + '”と“' + all.slice(initial, index === 0 ? prefix.length : undefined) + '”の間にあるとき，cursorの値は' + initial + 'である。カーソルがテキストの末尾にあるとき，cursorの値はテキストの文字数と同じであり，テキストがないとき，cursorの値は0である。'),
          gapCursor.block(index, '図4 カーソルの位置（cursorの値は' + initial + '）'),
          p('文字の入力は，外部で与えられるクラスCharReaderで行う。メソッドgetは，ターミナルから1文字ずつ読み込む。CharReaderには，次の制御文字が定義されている。制御文字以外の文字が入力されたときは，カーソルの位置に文字を挿入し，'
            + (advance ? 'カーソルを1文字分進める。' : 'カーソルをその位置に保ち，挿入した文字の直前を指すようにする。')),
          p('① CharReader.MOVE_FORWARD　カーソルを1文字分進める。カーソルがテキストの末尾にあるときは，無視する。'),
          p('② CharReader.MOVE_BACKWARD　カーソルを1文字分戻す。カーソルがテキストの先頭にあるときは，無視する。'),
          p('③ CharReader.DELETE　' + (deleteLeft
            ? 'カーソルの直前の1文字を削除し，カーソルを1文字分戻す。カーソルがテキストの先頭にあるときは，無視する。'
            : 'カーソルの直後の1文字を削除する。カーソルがテキストの末尾にあるときは，無視する。')),
          p('④ CharReader.EOF　エディタを終了する。'),
          p('ギャップバッファの内容の表示は，外部で与えられるクラスDisplayで行う。メソッドoutputは，GapBufferのメソッドcharAtを呼び出してギャップバッファのテキストを取得する。'),
        ]),
        page(47, [p('〔プログラム1〕'), java(buffer)]),
        page(48, [java(tail), p('〔プログラム2〕'), java(editor)]),
        page(49, [p('設問 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')], [
          bank(0, 'a', ['gapSize--', 'gapSize++', 'gapSize - 1', 'gapSize + 1'], 'ア', 'java'),
          bank(0, 'b', ['buffer.length', 'gapOffset', 'gapSize', 'length()'], 'ウ', 'java'),
          bank(0, 'c', ['buffer.length', 'buffer.length - gapOffset', 'buffer.length - gapSize', 'buffer.length - INITIAL_GAP_SIZE'], 'ウ', 'java'),
          bank(0, 'd', ['CharReader', 'Display', 'Editor', 'GapBuffer', 'Object', 'StringBuffer'], 'エ', 'java'),
          bank(0, 'ef', operators, (deleteLeft ? 'ア' : 'ウ') + (advance ? 'オ' : 'ウ'), 'java'),
        ]),
      ],
      explanation: 'a：挿入でギャップ先頭を使った分だけ空きの数を1減らす。b：ギャップ以降の仮想オフセットにギャップのサイズを足すと物理添字になる。'
        + 'c：配列全体の長さからギャップを引くとテキストの文字数になる。d：テキストを保持しinsertやdeleteを提供する型はGapBufferである。'
        + 'e：' + (deleteLeft ? 'カーソルを先に1戻し，その位置の文字を消すので--cursor。' : '直後を削除するときは現在のオフセットを渡し，カーソルはその位置に保つ。')
        + 'f：' + (advance ? '現在位置を渡してからカーソルを進めるので後置インクリメントを使う。' : '現在位置に挿入してカーソルを動かさないのでcursorをそのまま渡す。'),
    };
  }, { fixedReferenceAssetIds: javaMaterials.map(spring2009PmPageAssetId) });
