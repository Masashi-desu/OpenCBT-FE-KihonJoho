import { p, list, table } from './definition';
import { springLanguageQuestion, bank, numbered, page } from './legacy-2004-spring-pm-10-13-support';

const conditions = [
  { daytime: 8, management: 100 },
  { daytime: 6, management: 80 },
  { daytime: 7, management: 96 },
  { daytime: 9, management: 125 },
];
const replacements = bank(0, 'abc', ['36', '40，41', '44', '48', '51', '58', '77'].map(line => '行番号 ' + line), 'キエウ');
const insertions = bank(0, 'def', [36, 41, 44, 48, 49, 56, 64, 66, 77, 80].map(line =>
  '行番号 ' + line + ' と ' + (line + 1) + ' の間'), 'カイア');

export const q11 = springLanguageQuestion(11, '作業日報から作業時間と超過時間を月集計する', '平日の基準時間と業務コードの最大種類数の組',
  'abcdef', 'キエウカイア', '作業時間の月集計、日別の超過時間、業務コードの探索範囲を変更する。原題の置換・挿入位置を問う形式と行番号の並びを保つ。',
  index => {
    const { daytime, management } = conditions[index];
    return { pages: [
      page(47, [
        p('次のCOBOLプログラムの説明及びプログラムを読んで、設問に答えよ。'),
        p('〔プログラムの説明〕社員別業務別の1か月分の作業日報ファイルから、社員別業務別の作業時間月計ファイルと社員別の超過時間月計ファイルを作成する。'),
        table('作業日報ファイル（NIPPO-FILE）のレコード様式', ['社員コード', '作業日', '作業日種別', '業務コード', '作業時間'],
          [['6けた', '2けた', '1けた', '3けた', '2けた']]),
        list([
          '作業日種別は0が平日出勤日、1が休日出勤日。',
          '作業時間は1時間単位とする。',
          '平日出勤日1日の作業時間の合計は' + daytime + '時間以上である。',
          '平日出勤日1日の作業時間のうち' + daytime + '時間を超えた分と、休日出勤日の作業時間を超過時間とする。',
          '各作業日の作業時間の合計は24時間以内である。',
          '同一社員コードのレコードに出現する業務コードは' + management + '種類以下である。',
          '同日に複数の業務を担当した場合には業務ごとのレコードがある。',
          '同じ業務を複数日にわたって行った場合は、作業日ごとのレコードがある。',
          '作業日報ファイルは社員コード・作業日の昇順に整列された順ファイルである。',
          'ファイルの内容はすべて正しいとする。',
        ], true),
        table('作業時間月計ファイル（SAGYO-FILE）のレコード様式', ['社員コード', '業務コード', '作業時間'],
          [['6けた', '3けた', '3けた']]),
        p('社員ごとに業務別の作業時間を集計した順ファイルである。'),
      ]),
      page(48, [
        table('超過時間月計ファイル（CHOKA-FILE）のレコード様式', ['社員コード', '超過時間'],
          [['6けた', '3けた']]),
        p('社員ごとに各作業日の超過時間を求め、1か月分を集計した順ファイルである。超過時間が0の場合でも書き出す。'),
        p('処理の手順は次のとおりである。'),
        list([
          '社員ごとに1日分の作業時間を求める。',
          '社員ごとに業務別の作業時間を集計する。',
          '平日出勤日には' + daytime + '時間を超えた分、休日出勤日にはすべての作業時間を超過時間として合計する。',
          '社員別業務別の作業時間を作業時間月計ファイルへ書き出す。',
          '社員ごとの超過時間の合計を超過時間月計ファイルに書き出す。',
        ], true),
        p('プログラムを完成するには文の挿入と条件式の置換が必要である。'),
        p('〔プログラム〕（行番号）'),
        numbered('cobol', 1, `DATA              DIVISION.
FILE              SECTION.
FD  NIPPO-FILE.
01  NIPPO-REC.
    03  N-SHAIN-CODE       PIC  X(06).
    03  N-SAGYO-BI         PIC  9(02).
    03  N-SHUBETSU         PIC  9(01).
    03  N-GYOMU-CODE       PIC  X(03).
    03  N-SAGYO-JIKAN      PIC  9(02).
FD  SAGYO-FILE.
01  SAGYO-REC.
    03  S-SHAIN-CODE       PIC  X(06).
    03  S-GYOMU-CODE       PIC  X(03).
    03  S-SAGYO-JIKAN      PIC  9(03).
FD  CHOKA-FILE.
01  CHOKA-REC.
    03  C-SHAIN-CODE       PIC  X(06).`),
      ]),
      page(49, [
        numbered('cobol', 18, `    03  C-CHOKA-JIKAN      PIC  9(03).
WORKING-STORAGE   SECTION.
01  EOF                    PIC  X(01).
01  SHAIN-CODE             PIC  X(06).
01  SAGYO-BI               PIC  9(02).
01  SHUBETSU               PIC  9(01).
01  SAGYO-JIKAN-KEI        PIC  9(03).
01  GYOMU-SU               PIC  9(03).
01  GYOMU.
    03  FILLER    OCCURS ${management} INDEXED BY N.
        05  GYOMU-CODE     PIC  X(03).
        05  SAGYO-JIKAN    PIC  9(03).
PROCEDURE         DIVISION.
MAIN-RTN.
    OPEN INPUT NIPPO-FILE
         OUTPUT CHOKA-FILE SAGYO-FILE.
    MOVE SPACE TO EOF.
    PERFORM READ-RTN.
    PERFORM UNTIL EOF = "E"
        INITIALIZE CHOKA-REC
        INITIALIZE GYOMU
        MOVE N-SHAIN-CODE TO SHAIN-CODE
        PERFORM UNTIL EOF = "E" OR
                      N-SHAIN-CODE NOT = SHAIN-CODE
            MOVE N-SAGYO-BI TO SAGYO-BI
            MOVE N-SHUBETSU TO SHUBETSU
            PERFORM UNTIL N-SAGYO-BI NOT = SAGYO-BI
                COMPUTE SAGYO-JIKAN-KEI =
                        SAGYO-JIKAN-KEI + N-SAGYO-JIKAN
                PERFORM VARYING N FROM 1 BY 1
                        UNTIL GYOMU-CODE(N) = N-GYOMU-CODE
                    CONTINUE
                END-PERFORM
                IF N > GYOMU-SU THEN
                    MOVE N-GYOMU-CODE TO GYOMU-CODE(N)
                    SET GYOMU-SU TO N
                END-IF
                COMPUTE SAGYO-JIKAN(N) =
                        SAGYO-JIKAN(N) + N-SAGYO-JIKAN
            END-PERFORM
            IF SHUBETSU = 0 THEN
                COMPUTE C-CHOKA-JIKAN =
                        C-CHOKA-JIKAN + SAGYO-JIKAN-KEI - ${daytime}
            ELSE
                COMPUTE C-CHOKA-JIKAN =
                        C-CHOKA-JIKAN + SAGYO-JIKAN-KEI
            END-IF
        END-PERFORM
        PERFORM WRITE-RTN
    END-PERFORM.
    CLOSE NIPPO-FILE CHOKA-FILE SAGYO-FILE.
    STOP RUN.`),
      ]),
      page(50, [
        numbered('cobol', 70, `READ-RTN.
    READ NIPPO-FILE AT END
        MOVE "E" TO EOF
    END-READ.
WRITE-RTN.
    MOVE SHAIN-CODE TO C-SHAIN-CODE S-SHAIN-CODE.
    PERFORM VARYING N FROM 1 BY 1
            UNTIL N = GYOMU-SU
        MOVE GYOMU-CODE(N) TO S-GYOMU-CODE
        MOVE SAGYO-JIKAN(N) TO S-SAGYO-JIKAN
        WRITE SAGYO-REC
    END-PERFORM.
    WRITE CHOKA-REC.`),
        p('設問　表1の各条件式で置き換える行番号と、表2の各文を挿入する位置を選べ。挿入した場合もプログラムの行番号は付け直さない。'),
        table('表1　置き換える条件式', ['置換位置', '条件式'], [
          ['[a]', 'N > GYOMU-SU'],
          ['[b]', 'N > GYOMU-SU OR GYOMU-CODE(N) = N-GYOMU-CODE'],
          ['[c]', 'EOF = "E" OR N-SHAIN-CODE NOT = SHAIN-CODE OR N-SAGYO-BI NOT = SAGYO-BI'],
        ]),
        table('表2　挿入する文', ['挿入位置', '文'], [
          ['[d]', 'PERFORM READ-RTN'],
          ['[e]', 'MOVE ZERO TO SAGYO-JIKAN-KEI'],
          ['[f]', 'MOVE ZERO TO GYOMU-SU'],
        ]),
      ]),
      page(51, [], [replacements, insertions]),
    ], explanation:
      'aは書出しループの77行。N＝GYOMU-SUの最後の行も出力するので、次のN＞GYOMU-SUで止める。' +
      'bは業務コードを探す48行。登録済みの中に一致があればその位置を使い、なければ末尾の次を使って新規登録する。' +
      '1人につき' + management + '種類以下なので、満杯の表へ新規追加する入力はない。' +
      'cは作業日単位の44行。同じ日付でも社員コードが変われば終了し、EOFでも終了する。' +
      'dは1件を加算した後の56行と57行の間。取得済みのレコードに対し、作業日時間と業務別時間の加算を1回ずつ行う。' +
      'eは新しい作業日を扱う41行と42行の間で日合計を初期化する。例えば平日に' + (daytime + 2) +
      '時間、別の休日に3時間なら超過は2＋3＝5時間である。' +
      'fは新しい社員の処理を始める36行と37行の間で登録済み業務数を初期化する。社員別の月最大744時間は出力欄の3桁に入る。',
    };
  }, { answerVariation: 'fixed' });
