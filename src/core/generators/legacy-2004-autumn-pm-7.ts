import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2004-autumn-pm-06-09-support';
import { draw, training } from './legacy-2004-autumn-pm-06-09-figures';

const label = 'ｹﾝｼｭｳﾊﾞﾝｺﾞｳ ﾓｳｼｺﾐｼｬｽｳ';
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const page27 = (types: string, sessions: number) => `DATA DIVISION.
FILE SECTION.
FD  MOSHIKOMI-FILE.
01  MOSHIKOMI-REC.
    02             PIC  X(05).
    02  KENSHU-M.
        03 KEN-N-M PIC  X(01).
        03 KEN-K-M PIC  9(02).
    02             PIC  X(42).
FD  SHUKEI-PRINT.
01  SHUKEI-REC.
    02  KENSHU-S.
        03 KEN-N-S PIC  X(01).
        03 KEN-K-S PIC  9(02).
    02             PIC  X(15).
    02  SU-S       PIC  ZZ9.
WORKING-STORAGE SECTION.
01  FILE-END       PIC  X(01) VALUE "N".
01  LOOP1          PIC  9(01).
01  LOOP2          PIC  9(02).
01  KEN-NO         PIC  9(01).
01  KEN-W1.
    02  KEN-W2     PIC  X(0${types.length}) VALUE "${types}".
    02  REDEFINES KEN-W2.
        03 KEN-W3  PIC  X(01) OCCURS ${types.length} INDEXED BY KEN.
01  SU-WK1                    VALUE ZERO.
    02  OCCURS ${types.length}.
        03 SU-WK   PIC  9(03) OCCURS ${sessions}.
01  MIDASHI        PIC  X(21) VALUE "${label}".
PROCEDURE DIVISION.
MAIN-RTN.
    OPEN INPUT MOSHIKOMI-FILE OUTPUT SHUKEI-PRINT.
    PERFORM KASAN-RTN UNTIL FILE-END = "Y".
    PERFORM PRINT-RTN.
    CLOSE MOSHIKOMI-FILE SHUKEI-PRINT.
    STOP RUN.
KASAN-RTN.
    READ MOSHIKOMI-FILE
        AT END
            MOVE "Y" TO FILE-END
        NOT AT END
            [a]
            SEARCH [b]
                WHEN KEN-N-M = KEN-W3 (KEN)
                    SET KEN-NO TO KEN
            END-SEARCH
            ADD 1 TO SU-WK (KEN-NO KEN-K-M)
    END-READ.`;
const page28 = (typeCount: number, sessions: number) => `PRINT-RTN.
    WRITE SHUKEI-REC FROM MIDASHI AFTER PAGE.
    PERFORM VARYING LOOP1 FROM 1 BY 1 UNTIL LOOP1 > ${typeCount}
        PERFORM VARYING LOOP2 FROM 1 BY 1 UNTIL LOOP2 > ${sessions}
            MOVE SPACE TO SHUKEI-REC
            IF [c] NOT = 0 THEN
                MOVE KEN-W3 (LOOP1) TO KEN-N-S
                MOVE LOOP2 TO KEN-K-S
                MOVE [c] TO SU-S
                WRITE SHUKEI-REC AFTER 1
            END-IF
        END-PERFORM
    END-PERFORM.`;

export const q7 = draftQuestion(7, '研修別の申込者数を集計するCOBOLプログラム', '内容区分の集合と開催区分の上限', 'オオオ',
  '研修番号の区分表・実行時の探索範囲と二次元集計表の寸法を一体に変える。原作同様に検索を先頭から始め，二つの添字で集計と非ゼロ明細の印字を行う。空欄の役割・選択肢と印字様式を保つ。', (index) => {
    const { types, sessions } = training[index];
    const contiguous = alphabet.includes(types);
    const allowed = contiguous ? types[0] + '～' + types.at(-1) : [...types].join('，');
    return {
      pages: [
        { page: 26, blocks: [
          p('問7　次のCOBOLプログラムの説明及びプログラムを読んで，設問に答えよ。'),
          p('〔プログラムの説明〕'),
          p('研修申込状況を登録した申込ファイルから，研修番号別に申込者の人数を集計して印字する。'),
          p('（1）申込ファイルのレコード様式は，次のとおりである。'),
          draw('7-record-layout', index),
          p('①　研修を申し込むと申込者1人について一つの申込番号が発行され，1件のレコードが申込ファイルに登録される。'),
          p('②　同一人が，同じ研修に二度以上申し込むことはない。'),
          p('③　研修番号は，内容区分と開催区分から構成されている。'),
          p('④　内容区分は，' + allowed + 'のいずれか1文字である。開催区分は，01～' + sessions + 'のいずれかである。'),
          p('⑤　申込ファイルの内容には，間違いがないものとする。'),
          p('（2）集計表の印字様式は，次のとおりである。'),
          code(label + '\nXXX                ZZ9\nXXX                ZZ9\nXXX                ZZ9\n ⋮                   ⋮\nXXX                ZZ9', 'text'),
          p('①　各研修とも申込者数は，1,000未満とする。'),
          p('②　見出しは，最初に1回だけ印字する。'),
          p('③　申込者数が0の研修は，印字しない。'),
        ] },
        { page: 27, blocks: [p('〔プログラム〕'), code(page27(types, sessions), 'cobol')] },
        { page: 28, blocks: [code(page28(types.length, sessions), 'cobol'),
          p('設問　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')], banks: [
          bank('a', ['MOVE 1 TO KEN', 'MOVE 1 TO KEN-NO', 'MOVE KEN TO KEN-NO', 'MOVE KEN-NO TO KEN',
            'SET KEN TO 1', 'SET KEN TO KEN-N-S', 'SET KEN TO KEN-NO', 'SET KEN-NO TO 1', 'SET KEN-NO TO KEN'], 'オ', 'cobol'),
          bank('b', ['KEN', 'KEN-NO', 'KEN-W1', 'KEN-W2', 'KEN-W3', 'SU-WK'], 'オ', 'cobol'),
          bank('c', ['SU-WK (KEN-K-M KEN-NO)', 'SU-WK (KEN-K-S KEN-NO)', 'SU-WK (KEN-NO KEN-K-M)',
            'SU-WK (KEN-NO KEN-K-S)', 'SU-WK (LOOP1 LOOP2)', 'SU-WK (LOOP2 LOOP1)'], 'オ', 'cobol'),
        ] },
      ],
      explanation: '内容区分' + [...types].join('，') + 'はKEN-W3に並ぶ。各レコードを読むごとにSET KEN TO 1で探索開始位置を先頭に戻し，SEARCH KEN-W3で一致する位置を得る。KEN-NOには一致した出現番号が入るので，その番号と01～' + sessions + 'の開催区分で集計表に1を加える。印字では入力レコードの値や出力レコードの未設定項目を添字に使えない。現在走査中のLOOP1とLOOP2で勘定を調べ，0でないときだけ研修番号と人数を出す。',
    };
  }, 'fixed');
