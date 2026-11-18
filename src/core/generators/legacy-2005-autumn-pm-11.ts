import { code, p, table } from './definition';
import { autumnLanguageFigure, autumnLanguageQuestion, bank, changeTableFigure, numbered, page } from './legacy-2005-autumn-pm-10-13-support';

const cases = [
  { years: 1, position: 6 }, { years: 2, position: 5 },
  { years: 3, position: 4 }, { years: 4, position: 3 },
] as const;

const flagOptions = [
  ['フラグ1に “1” を転記', 'フラグ1に空白を転記', 'フラグ2に “1” を転記', 'フラグ2に空白を転記'],
  ['フラグ1に “1” を転記', 'フラグ2に “1” を転記', 'フラグ1に空白を転記', 'フラグ2に空白を転記'],
  ['フラグ1に空白を転記', 'フラグ2に空白を転記', 'フラグ1に “1” を転記', 'フラグ2に “1” を転記'],
  ['フラグ1に空白を転記', 'フラグ1に “1” を転記', 'フラグ2に空白を転記', 'フラグ2に “1” を転記'],
];
const yearOptions = [
  '01  W-YEAR1                  PIC X(6).\n01  W-YEAR2 REDEFINES W-YEAR1 PIC 9(6).',
  '01  W-YEAR1                  PIC 9(6).\n01  W-YEAR2 REDEFINES W-YEAR1 PIC X(6).',
  '01  W-YEAR1                  PIC X(6).\n01  W-YEAR2                  PIC 9(6).',
];

const initialProgram = `DATA DIVISION.
FILE SECTION.
FD  MEMBER-F.
01  MEMBER-R.
    03  M-ID        PIC X(6).
    03  M-DATA.
        05  M-NAME  PIC X(20).
        05  M-CLASS PIC X(1).
        05  M-DATE  PIC X(8).
        05          PIC X(205).
WORKING-STORAGE SECTION.
[b]`;

const mainProgram = `LINKAGE SECTION.
01  L-ID          PIC X(6).
01  L-YEAR        PIC 9(6).
01  L-SCREEN.
    03  S-F1      PIC X(1).
    03  S-F2      PIC X(1).
    03  S-DATA    PIC X(234).
PROCEDURE DIVISION USING L-ID, L-YEAR, L-SCREEN.
MAIN-RTN.
    OPEN INPUT MEMBER-F.
    MOVE SPACE TO L-SCREEN.
    MOVE L-ID TO M-ID.
    READ MEMBER-F INVALID
        MOVE "1" TO S-F1
    NOT INVALID
        MOVE M-DATA TO S-DATA
        PERFORM CHECK-RTN
    END-READ.
    CLOSE MEMBER-F.
    EXIT PROGRAM.
CHECK-RTN.
    MOVE M-DATE TO W-YEAR1.
    IF L-YEAR - W-YEAR2 < [c] THEN
        IF M-CLASS = "1" OR "2" THEN
            MOVE "1" TO S-F2
        END-IF
    END-IF.`;

const correctionProgram = (position: number) => `CORR-RTN.
    MOVE 1 TO Y.
    PERFORM VARYING X FROM 0 BY 1 UNTIL [d]
        IF X NOT = L-NUM(${position}) THEN
            [e]
            READ MEMBER-F INVALID
                CONTINUE
            NOT INVALID
                MOVE M-ID TO S-ID([f])
                MOVE M-NAME TO S-NAME([f])
                COMPUTE Y = Y + 1
            END-READ
        END-IF
    END-PERFORM.`;

export const memberDecisionFigure = autumnLanguageFigure(11, 'flag-decision-table', 'フラグ設定の決定表', index => {
  const conditions = [
    ['会員ファイルが検索できた', 'Y', 'Y', 'Y', 'N'],
    ['入会' + cases[index].years + '年未満である', 'Y', 'Y', 'N', '－'],
    ['区分が学生会員である', 'Y', 'N', '－', '－'],
  ];
  const actions = [
    ['X', 'X', 'X', '－'], ['－', '－', '－', 'X'],
    ['X', '－', 'X', 'X'], ['－', 'X', '－', '－'],
  ];
  return { conditions, actions, alt: ['条件部', ...conditions.map(row => row.join('｜')),
    '動作部 [a]（上から4行）', ...actions.map(row => row.join('｜'))].join('\n') };
});

export const memberCorrectionFigure = changeTableFigure(11, index => [
  ['行番号5を置換', '    03  M-ID.\n        05  M-NUM      PIC 9 OCCURS 6.'],
  ['行番号13と14の\n間に追加', '01  X                 PIC 9(2).\n01  Y                 PIC 9(2).'],
  ['行番号15を置換', '01  L-ID.\n    03  L-NUM         PIC 9 OCCURS 6.'],
  ['行番号20を置換', '    03  S-DATA.\n        05  S-CORR OCCURS 9.\n            07  S-ID   PIC X(6).\n            07  S-NAME PIC X(20).'],
  ['行番号27と28の\n間に追加', '    PERFORM CORR-RTN'],
  ['行番号40の後に\n追加', correctionProgram(cases[index].position)],
]);

export const q11 = autumnLanguageQuestion(11, '会員ファイル検索とIDの修正候補', '会員サービス期間とIDの修正位置', 'abcdef', 'エアオエウウ',
  '決定表と二つのCOBOL手続、日付の桁と会員条件、IDの検索条件、解答欄数と選択肢の役割を保持する。会員サービスの年数と修正対象の1桁を組にして変え、年数×100と会員IDの桁を同じ入力から表示する。', (index, original) => {
    const { years, position } = cases[index];
    const months = 12 * years, boundary = 100 * years;
    const typo = original ? '最後の1文字' : position === 6 ? '最後の1文字' : '左から' + position + '番目の1文字';
    const duration = years === 1 ? '翌年' : years + '年後';
    const idMove = 'MOVE L-ID TO M-ID\n';
    const digitMove = 'MOVE X TO M-NUM(' + position + ')';
    const correctionOptions = [
      idMove.trimEnd(), idMove + 'MOVE X TO M-ID(' + position + ':)',
      idMove + digitMove, idMove + 'MOVE X TO M-NUM(X)', digitMove, 'MOVE X TO M-NUM(X)',
    ];
    return {
      pages: [
        page(46, [
          p('問11　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\n渡された会員IDを基に，会員ファイルから会員情報を検索し，画面データとして返却する呼ばれるプログラム（以下，副プログラムという）である。'),
          p('（1）呼ぶプログラム（以下，主プログラムという）は，会員IDを読み取り，検索結果を画面に表示する。主プログラムが副プログラムへ渡す情報は，次のとおりである。現在の年月は，YYYYMMの形式である。'),
          table('主プログラムから副プログラムへ渡す情報', ['会員ID', '現在の年月'], [['6けた', '6けた']]),
          p('（2）副プログラムでは，主プログラムから受け取った会員IDで会員ファイルを検索し，見つかった会員情報を画面データに格納して主プログラムに返す。画面データに格納する情報は，見つかった会員のレコード項目のうち会員ID以外のすべての項目である。このとき，新規入会サービスの対象者であるかどうかを調べ，フラグをセットする。新規入会サービスの対象者は，特別会員及び一般会員のうち，会員期間が，入会月を基準に月単位で数えて，' + months + 'か月以内の会員である。例えば，10月入会の場合は，' + duration + 'の9月までがサービス対象期間となる。'),
          p('（3）会員ファイルのレコード様式は，次のとおりである。'),
          table('会員ファイルのレコード様式', ['会員ID', '氏名', '区分', '入会年月日', 'その他の会員情報'],
            [['6けた', '20けた', '1けた', '8けた', '205けた']]),
          p('① 会員IDをキーとした索引ファイルであり，会員IDは数字0〜9の組合せからなる。\n② 区分には会員区分が記録されている。会員区分には，特別会員，一般会員，学生会員があり，次のとおりコード化されている。\n1：特別会員　2：一般会員　3：学生会員\n③ 入会年月日には，その会員の入会した年月日がYYYYMMDDの形式で記録されている。'),
        ]),
        page(47, [
          p('（4）画面データ（L-SCREEN）のデータ様式は，次のとおりである。'),
          table('画面データのデータ様式', ['フラグ1', 'フラグ2', '会員情報'], [['1けた', '1けた', '234けた']]),
          p('フラグ1及びフラグ2は，次の決定表に従って値が決まる。'),
          memberDecisionFigure.block(index),
          p('注　条件部での “Y” は条件が真，“N” は条件が偽，“－” は真偽に関係ないことを表す。動作部での “X” は条件がすべて満たされたとき，その行で指定した動作の実行を表し，“－” は動作を実行しないことを表す。'),
          p('〔プログラム〕\n（行番号）'),
          numbered('cobol', 1, initialProgram + '\n'),
        ]),
        page(48, [
          numbered('cobol', 14, mainProgram),
          p('設問1　決定表及びプログラム中の空欄に入れる正しい答えを，解答群の中から選べ。ここで，決定表のフラグ1，フラグ2は，プログラムのS-F1，S-F2に対応している。'),
        ], [{ ...bank(1, 'a', flagOptions.map(rows => rows.join('\n')), 'エ'),
          format: value => [table('動作の順序', ['動作'], value.split('\n').map(text => [text]))] }]),
        page(49, [
          p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('このシステムでは，会員IDの' + typo + 'だけの入力ミスが非常に多いことが経験上分かっている。そこで，主プログラムから渡された会員IDと一致する会員情報が見つからなかったとき，会員IDの' + typo + 'だけが異なるすべての会員の会員IDと氏名を修正候補として主プログラムに戻すように，次のとおり変更した。'),
        ], [bank(1, 'b', yearOptions, 'ア', 'cobol'),
          bank(1, 'c', [0, 1, months, boundary - 1, boundary, boundary + 1].map(String), 'オ')], 0),
        page(50, [memberCorrectionFigure.block(index)], [
          bank(2, 'd', ['X = 6', 'X > 6', 'X = 9', 'X > 9', 'X > 10'], 'エ', 'cobol'),
          bank(2, 'e', correctionOptions, 'ウ', 'cobol'),
          bank(2, 'f', ['X', 'X + 1', 'Y', 'Y + 1'], 'ウ', 'cobol'),
        ]),
      ],
      explanation: '検索成功時はフラグ1が空白のままで，対象期間内の特別会員又は一般会員だけフラグ2が1になる。検索失敗ではフラグ1だけが1になる。入会日の先頭6文字をW-YEAR1に移し，同じ記憶域をREDEFINESで数値のW-YEAR2として参照する。YYYYMM同士の差が' + boundary + '未満なら，入会月から' + months + 'か月以内である。修正候補は0〜9を順に試す。毎回L-IDをM-IDへコピーしてから第' + position + '桁にXを入れると，変更する桁が一つに限られる。候補が見つかった回だけYを進めるので，候補は1番目から欠番なく最大9件格納される。',
    };
  });
