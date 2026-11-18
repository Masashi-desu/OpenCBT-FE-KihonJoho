import { code, p, table } from './definition';
import { bank, draftQuestion, numbered, type Page } from './legacy-2006-spring-pm-06-09-support';
import { drawing, type Point } from './legacy-2006-spring-pm-06-09-figures';
import { spring2006PmReference } from './legacy-2006-spring-pm-materials';

type Coordinates = readonly [Point, Point];

const coordinates: Coordinates[] = [
  [[3, 6], [-5, 17]],
  [[-6, 14], [3, 6]],
  [[8, -9], [1, 6]],
  [[11, 12], [2, -19]],
];
const branches = ['JMI', 'JOV', 'JUMP'].flatMap(branch =>
  ['ADD', 'LOOP', 'SHIFT'].map(label => branch + '   ' + label));
const cOptions = ['ADDA   GR0,GR2', 'ADDA   GR2,GR0', 'SUBA   GR0,GR2', 'SUBA   GR2,GR0'];
const counts = ['1', '2', '3', '4', '5'];

function program(): string {
  return numbered([
    'OBLONG  START',
    '        RPUSH',
    '        LD     GR2,0,GR1   ;⎫',
    '        SUBA   GR2,2,GR1   ;⎪',
    '        CALL   ABS         ;⎬ GR3←|x1−x2|',
    '        LD     GR3,GR2     ;⎭',
    '        LD     GR2,1,GR1   ;⎫',
    '        SUBA   GR2,3,GR1   ;⎬ GR2←|y1−y2|',
    '        CALL   ABS         ;⎭',
    '        LD     GR0,=0      ; 面積の初期化',
    'LOOP    SRL    GR2,1',
    '        ［a］',
    '        JZE    FIN1',
    '        ［b］',
    'ADD     ADDA   GR0,GR3',
    'SHIFT   SLA    GR3,1',
    '        JUMP   LOOP',
    'FIN1    RPOP',
    '        RET',
    ';',
    'ABS     LD     GR0,GR2',
    '        JMI    MINUS',
    '        JUMP   FIN2',
    'MINUS   LD     GR2,=0',
    '        ［c］',
    'FIN2    RET',
    '        END',
  ]);
}

const coordinateText = ([x, y]: Point) => '(' + x.toString().replace('-', '−') + ', ' + y.toString().replace('-', '−') + ')';

export const q9 = draftQuestion(9, 'CASL II：シフトと加算による長方形の面積',
  '対角頂点の整数座標、絶対値と高さの1ビット数', '設問1 a=エ b=ケ c=エ／設問2 ウ',
  '軸平行の長方形と対角、GR1相対の4語、座標差非ゼロ、あふれなし、GR1〜GR7の保存、絶対値副プログラム、9択・4択・昇順5択の形式を保持。座標を小さな符号付き整数で変え，幅・高さの符号組合せを変える。高さは8, 11, 15, 31のいずれか。選択肢の昇順1〜5と命令の候補を保持し，設問2の正答を高さの立っているビット数から求める。第1、2設問とも文字処理がないため，CASL II付属資料はJISの文字コード表を除いた命令・仕様のみを参照する。',
  (index) => {
    const [a, b] = coordinates[index];
    const width = Math.abs(a[0] - b[0]);
    const height = Math.abs(a[1] - b[1]);
    const bits = height.toString(2);
    const additions = [...bits].filter(bit => bit === '1').length;
    const pages: Page[] = [
      {page: 36, blocks: [
        p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラムの説明〕'),
        p('（1）副プログラム OBLONG は，各座標値が整数である2点 A (x1, y1)，B (x2, y2) を対角の頂点とし，各辺が x 軸又は y 軸に平行な長方形の面積を求めるプログラムである。'),
        drawing('9-oblong', index),
        p('①　次のパラメタの先頭アドレスが GR1 に格納されて，主プログラムから渡される。'),
        table('GR1 で参照する4語のパラメタ', ['番地', '値'], [['(GR1) +0', 'x1'], ['+1', 'y1'], ['+2', 'x2'], ['+3', 'y2']]),
        p('②　x1 ≠ x2，y1 ≠ y2 とする。'),
        p('③　求めた面積は GR0 に格納して，主プログラムに返す。'),
        p('④　副プログラム OBLONG から戻るとき，汎用レジスタ GR1〜GR7 の内容は元に戻す。'),
        p('（2）副プログラム ABS は，OBLONG から渡された GR2 の内容をその絶対値に置き換えるプログラムである。副プログラム ABS の実行によって，汎用レジスタ GR1，GR3〜GR7 の内容は変わらない。'),
        p('（3）プログラム中の演算で，あふれは起きないものとする。'),
      ]},
      {page: 37, blocks: [
        p('〔プログラム〕'), p('（行番号）'), code(program(), 'casl2'),
        p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      ], banks: [
        bank('ab', branches, 'エケ', 'casl2', 1, 'a，b に関する解答群'),
        bank('c', cOptions, 'エ', 'casl2', 1),
      ]},
      {page: 38, blocks: [
        p('設問2　2点 A と B に次の座標を与えたとき，行番号15の ADDA 命令は何回実行されるか。正しい答えを，解答群の中から選べ。'),
        p('A の座標：' + coordinateText(a)),
        p('B の座標：' + coordinateText(b)),
      ], banks: [bank('s', counts, 'アイウエオ'[additions - 1], undefined, 2, '解答群')]},
    ];
    return {
      pages,
      contexts: [spring2006PmReference('CASL IIの仕様', [57, 58, 59, 60, 61, 62])],
      explanation: 'CASL II の SRL（Shift Right Logical，論理右シフト）は，最後に押し出したビットを OF（Overflow Flag）へ入れる。OF が1なら JOV（Jump on Overflow）で ADD へ分岐し，GR3 の重みを GR0 に加える。OF が0でシフト後の値が0なら JZE（Jump on Zero）で終了する。残りがあれば加算を飛ばして SHIFT に進み，SLA（Shift Left Arithmetic，算術左シフト）で次の桁の重みを作る。ABS は負の値のとき 0 − 元の GR0 を SUBA（Subtract Arithmetic）で求める。この座標の幅は' + width + '，高さは' + height + '（2進の' + bits + '）で，面積は' + (width * height) + 'となる。高さの2進表現で1が' + additions + '個あるので行15の ADDA（Add Arithmetic）は' + additions + '回実行される。',
    };
  });
