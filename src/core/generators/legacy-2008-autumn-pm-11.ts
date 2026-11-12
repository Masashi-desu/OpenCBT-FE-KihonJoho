import { code, p, table } from './definition';
import { bank, createLanguageDefinition, languageFigure, page } from './legacy-2008-autumn-pm-10-13-support';

const cases = [
  { first: 'T', second: 'F', opening: '(', closing: ')', and: '&', or: '|', max: 7 },
  { first: 'F', second: 'T', opening: '[', closing: ']', and: '&', or: '|', max: 6 },
  { first: 'T', second: 'F', opening: '<', closing: '>', and: '*', or: '+', max: 5 },
  { first: 'F', second: 'T', opening: '(', closing: ')', and: '*', or: '+', max: 7 },
];
const literalList = (tokens: string[]) => tokens.map(token => '"' + token + '"').join(' OR ');

const exampleOutput = languageFigure(11, 'evaluation-output', '図1 結果の例', index => {
  const { first, second, opening, closing, and } = cases[index];
  const text = '評価結果： 論理式\n' + first + ':          ' + first + '\n' + second + ':          ' + second + '\nE:          ' + opening + '\nE:          ' + and
    + '\n⋮           ⋮\nF:          T' + and + 'T' + and + 'F\n⋮           ⋮\nF:          T' + and + 'T' + and + opening + 'F' + closing + '\n⋮           ⋮';
  const adjusted = cases[index].max < 7 ? text.replace('T' + and + 'T' + and + opening + 'F' + closing, opening + 'F' + and + 'T' + closing) : text;
  return { kind: 'output', text: adjusted, alt: adjusted };
});
const mapping = languageFigure(11, 'numeric-enumeration', '図2 作業領域NUM-TBLに生成された数字列と対応する論理式文字列', index => {
  const { first, second, opening, closing, and, or } = cases[index];
  const letters = [first, second, opening, and, or, closing];
  const rows = ['11111', '11112', '13666', '14111', '66666'].map(value => [...value]);
  const mapped = rows.map(row => row.map(digit => letters[Number(digit) - 1]));
  const headed = (source: string[][]) => [...source.slice(0, 2), ['', '', '⋮', '', ''], ...source.slice(2, 4), ['', '', '⋮', '', ''], source[4]];
  return {
    kind: 'tables', tables: [
      { label: '変換前の数字列（5文字のとき）', rows: headed(rows) },
      { label: '変換後の論理式文字列（5文字のとき）', rows: headed(mapped) },
    ],
    alt: rows.map((row, position) => row.join('') + '→' + mapped[position].join('')).join('。') + '。',
  };
});

function initialProgram(alphabet: string, max: number) {
  return ` 1  DATA DIVISION.
 2  FILE SECTION.
 3  FD EXP-F.
 4  01 EXP-REC               PIC X(08).
 5  FD PRINT-F.
 6  01 P-REC                 PIC X(13).
 7  WORKING-STORAGE SECTION.
 8  01 CONSTANT-CHARS.
 9     05 CONS-VALUE         PIC X(06) VALUE "${alphabet}".
10     05 FILLER             REDEFINES CONS-VALUE.
11        10 CONS-TBL        PIC X OCCURS 6.
12  01 NUM-BUF.
13     05 NUM-TBL            PIC 9 OCCURS 10.
14  01 EXIT-SW               PIC 9.
15  01 EXP-L                 PIC 99.
16  01 RESULT-SW             PIC X.
17  01 WK-I                  PIC 99.
18  01 WK-TEMP               PIC 99.
19  PROCEDURE DIVISION.
20  MAIN-CTL.
21     OPEN OUTPUT EXP-F.
22     PERFORM GENERATE-EXP VARYING EXP-L FROM 1 BY 1
23                            UNTIL EXP-L > ${max}.
24     CLOSE EXP-F.`;
}
function enumeration(first: string) {
  return `25  *
26     OPEN INPUT EXP-F.
27     OPEN OUTPUT PRINT-F.
28     PERFORM EVAL-EXP-PRINT.
29     CLOSE EXP-F PRINT-F.
30  *
31     STOP RUN.
32  GENERATE-EXP.
33     MOVE SPACE   TO EXP-REC.
34  *  作業領域初期化
35     MOVE ALL "${first}" TO EXP-REC(1:EXP-L).
36     PERFORM VARYING WK-I FROM 1 BY 1 UNTIL WK-I > EXP-L
37         ［a］
38     END-PERFORM.
39     MOVE EXP-L TO WK-I.
40  *  数字列の生成と論理式への変換
41     PERFORM ［b］
42         WRITE EXP-REC
43         MOVE EXP-L TO WK-I
44         MOVE 0     TO EXIT-SW
45         PERFORM UNTIL WK-I < 1 OR EXIT-SW = 1
46             ［c］
47  *          けた上がりのチェック
48             IF NUM-TBL(WK-I) > 6 THEN
49                 MOVE 1 TO NUM-TBL(WK-I)
50                 MOVE CONS-TBL(1) TO EXP-REC(WK-I:1)
51                 SUBTRACT 1 FROM WK-I
52             ELSE
53                 MOVE NUM-TBL(WK-I) TO WK-TEMP
54                 MOVE CONS-TBL(WK-TEMP) TO EXP-REC(WK-I:1)
55                 MOVE 1 TO EXIT-SW
56             END-IF
57         END-PERFORM
58     END-PERFORM.
59  *
60  EVAL-EXP-PRINT.
61     MOVE 0 TO EXIT-SW.
62     PERFORM UNTIL EXIT-SW = 1
63         READ EXP-F AT END MOVE 1 TO EXIT-SW
64                   NOT AT END
65                       CALL "EVAL-EXP" USING EXP-REC RESULT-SW
66                       STRING RESULT-SW ":   " EXP-REC
67                           DELIMITED BY SIZE INTO P-REC
68                       WRITE P-REC AFTER 1
69         END-READ
70     END-PERFORM.`;
}

function checker({ opening, closing, and, or }: typeof cases[number]) {
  return `CHECK-SYNTAX.
    MOVE 0 TO CHECK-ERROR.
    MOVE 0 TO NEST-LEVEL.
    PERFORM VARYING WK-R FROM 1 BY 1
               UNTIL WK-R > EXP-L OR CHECK-ERROR NOT = 0
*       先頭文字チェック
        IF WK-R = 1 THEN
            IF EXP-REC(WK-R:1) = ${literalList([and, or, closing])} THEN
                MOVE 1 TO CHECK-ERROR
            END-IF
        ELSE
            COMPUTE WK-L = WK-R - 1
*           記述順序のチェック
            IF EXP-REC(WK-L:1) = ${literalList([opening, and, or])} THEN
                IF EXP-REC(WK-R:1) = ${literalList([and, or, closing])} THEN
                    MOVE 1 TO CHECK-ERROR
                END-IF
            ELSE
                IF EXP-REC(WK-R:1) = ［d］ THEN
                    MOVE 1 TO CHECK-ERROR
                END-IF
            END-IF
        END-IF
        EVALUATE EXP-REC(WK-R:1)
            WHEN "${opening}" ［e］
            WHEN "${closing}" SUBTRACT 1 FROM NEST-LEVEL
                IF NEST-LEVEL < 0 THEN
                    MOVE 1 TO CHECK-ERROR
                END-IF
        END-EVALUATE
    END-PERFORM.
*   最右端のチェック
    IF CHECK-ERROR = 0 AND (EXP-REC(EXP-L:1) = "${and}" OR
                                                "${or}" OR "${opening}") THEN
        MOVE 1 TO CHECK-ERROR
    END-IF.
*   括弧の対応チェック
    IF CHECK-ERROR = 0 AND NEST-LEVEL NOT = 0 THEN
        MOVE 1 TO CHECK-ERROR
    END-IF.`;
}

const modifications = languageFigure(11, 'syntax-check-modifications', '表2 プログラムの変更内容', index => {
  const rows = [
    ['行番号18と19の間に追加', '01 CHECK-ERROR       PIC 9.\n01 NEST-LEVEL        PIC S99.\n01 WK-R              PIC 99.\n01 WK-L              PIC 99.'],
    ['行番号42を変更', '    PERFORM CHECK-SYNTAX\n    IF CHECK-ERROR = 0 THEN\n        WRITE EXP-REC\n    END-IF'],
    ['行番号70の次に追加', checker(cases[index])],
  ];
  return {
    kind: 'tables', tables: [{ headings: ['処置', '変更内容'], rows, codeColumns: [1] }],
    alt: rows.map(([position, source]) => position + '\n' + source).join('\n\n'),
  };
});
export const q11Figures = [exampleOutput, mapping, modifications];

export const q11 = createLanguageDefinition(11, 'COBOL：論理式の全列挙と構文の検査', '列挙順・上限桁・演算子と括弧', 'abcde',
  '設問1 aウ bカ cア／設問2 dイ eエ',
  '6進の桁上がりを用いる全列挙、先頭・隣接・末尾・括弧対応の検査、70行と変更表、5欄を保持。真偽文字の並び・最大長・演算子・括弧を変え、桁上がり時に生成される文字や構文の受理集合を変える。',
  index => {
    const input = cases[index];
    const { first, second, opening, closing, and, or, max } = input;
    const tokens = [first, second, opening, and, or, closing];
    const operand = 'T，F又は' + opening;
    const operator = and + '，' + or + '又は' + closing;
    const nextOptions = [
      'ADD 1 TO NUM-TBL(WK-I)', 'ADD 1 TO WK-I', 'MOVE 1 TO NUM-TBL(WK-I)', 'SUBTRACT 1 FROM WK-I',
      'UNTIL EXIT-SW = 1', 'UNTIL WK-I < 1', 'UNTIL WK-I > EXP-L',
    ];
    const checkOptions = [literalList([and, or, closing]), literalList(['T', 'F', opening]),
      literalList(['T', 'F', closing]), 'ADD 1 TO NEST-LEVEL', 'SUBTRACT 1 FROM NEST-LEVEL'];
    return {
      pages: [
        page(44, [
          p('問11 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('論理式評価プログラムEVAL-EXPの動作検証のため，論理式を構成するすべてのパターンの文字列を生成するプログラムGEN-EXPである。'),
          p('（1）GEN-EXPは，1文字から' + max + '文字までの論理式文字列を自動生成してEVAL-EXPを呼び出し，図1のような結果を印字する。検証はこの結果リストを使って目視で行う。見出しは印刷済とする。'),
          exampleOutput.block(index),
          p('（2）論理式評価プログラムの呼出しは，次のように行う。'),
          code('CALL "EVAL-EXP" USING パラメタ1 パラメタ2', 'cobol'),
          p('ここで，パラメタ1は8けたで，空白で終了する1文字から' + max + '文字の論理式を指定する。パラメタ2は評価結果であり，真のときはT，偽のときはF，構文エラーがあるときはEが返る。パラメタ1はEVAL-EXPの実行によって変更されることはない。'),
          p('（3）EVAL-EXPで扱う論理式は，次の仕様とする。'),
          p('① 論理式は，論理項目T，F，二つの論理式を論理演算子' + and + '，' + or + 'でつないだもの，及び論理式を括弧' + opening + '，' + closing + 'でくくったもので構成される。ここで，Tは真値，Fは偽値，' + and + 'は論理積，' + or + 'は論理和を表す。'),
          p('② 論理式の評価の順序は，括弧でくくられた内側が先に評価され，括弧でくくられていないか又は括弧が同じ順位の場合は' + and + 'が' + or + 'よりも優先順位が高い。同じ優先順位が並ぶ場合は左から右に評価される。'),
        ]),
        page(45, [
          p('（4）論理式の自動生成は，数字1〜6からなる長さ1〜' + max + 'の数字列を，作業領域NUM-TBLに生成し，数字1〜6に6種類の文字' + tokens.join('，') + 'を対応させて変換する（図2）。'),
          mapping.block(index),
          p('〔プログラムGEN-EXP〕（行番号）'), code(initialProgram(tokens.join(''), max), 'cobol'),
        ]),
        page(46, [code(enumeration(first), 'cobol')]),
        page(47, [
          p('設問1 プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2 GEN-EXPでは，論理式を構成するすべてのパターンの文字列を生成しているので，評価結果のほとんどが構文エラーであった。そこで，EVAL-EXPでの論理式評価が効率よく実行できるよう，GEN-EXPで論理式生成後に論理式の構文チェックを行い，構文エラーでないものだけを検査対象とするように変更することとなった。論理式の構文チェックは次の①，②に従う。'),
          p('① 論理式で許される文字T，F，' + [opening, and, or, closing].join('，') + 'の記述の順序の可否は表1のとおりとする。'),
          table('表1 記述の順序', ['左側＼右側', operand, operator], [
            ['T，F又は' + closing, '－', '○'], [and + '，' + or + '又は' + opening, '○', '－'],
          ]),
          p('注 ○：許される，－：許されない'),
          p('② 論理式の先頭文字には' + [and, or, closing].join('，') + 'は許されず，論理式の末尾文字には' +
            [and, or, opening].join('，') + 'は許されない。また，左右の括弧は対になっていなければならない。'),
          p('このためにプログラムを次のとおりに変更する。表2中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ], [{ ...bank(1, 'abc', nextOptions, 'ウカア', 'cobol'), label: '解答群' }], [0]),
        page(48, [modifications.block(index)]),
        page(49, [], [{ ...bank(2, 'de', checkOptions, 'イエ', 'cobol'), label: '解答群' }]),
      ],
      explanation: 'a：各けたを1で初期化し，最初の文字列を' + first.repeat(5) + '（5文字のとき）にする。b：最上位の桁上がりでWK-Iが1未満になれば，その長さの列挙を終える。c：現在のけたに1を足し，6を超えれば1に戻して上のけたへ進める。d：左がT，F又は閉じ括弧なら，右にT，F又は開き括弧は置けない。e：開き括弧を読んだら深さを1増やし，閉じ括弧を読むたびに1減らす。途中で負になったり最後に0へ戻らなかったりする文字列は構文エラーである。',
    };
  });
