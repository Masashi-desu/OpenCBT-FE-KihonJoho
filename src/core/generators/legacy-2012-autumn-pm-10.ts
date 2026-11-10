import { code, p, table } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2012-autumn-pm-09-13-support';
import { languageFigure } from './legacy-2012-autumn-pm-09-13-figures';
import { clubCases } from './legacy-2012-autumn-pm-10-data';

function firstProgram(base: readonly number[]) {
  return [
    ' 1 DATA DIVISION.',
    ' 2 FILE SECTION.',
    ' 3 FD WORK-F.',
    ' 4 01 W-REC.',
    ' 5    02 W-NO             PIC X(6).',
    ' 6    02 W-MIN            PIC 9(6).',
    ' 7 FD MEM-F.',
    ' 8 01 M-REC.',
    ' 9    02 M-NO             PIC X(6).',
    '10    02 M-CODE           PIC 9(1).',
    '11    02 M-PERSON.',
    '12       03 M-NAME        PIC X(10).',
    '13       03 M-ADDR        PIC X(20).',
    '14       03 M-TEL         PIC 9(11).',
    '15    02 M-DATE           PIC 9(8).',
    '16 FD TIME-F.',
    '17 01 T-REC.',
    '18    02 T-NO             PIC 9(6).',
    '19    02 T-DATE           PIC 9(8).',
    '20    02 T-STIME          PIC 9(4).',
    '21    02 T-ETIME          PIC 9(4).',
    '22    02 T-MIN            PIC 9(4).',
    '23 FD BILL-F.',
    '24 01 B-REC.',
    '25    02 B-NO             PIC 9(6).',
    '26    02 B-CHG            PIC 9(6).',
    '27 WORKING-STORAGE SECTION.',
    '28 77 TIME-FLAG        PIC X(1) VALUE SPACE.',
    '29    88 TIME-EOF         VALUE "E".',
    '30 77 MEM-FLAG         PIC X(1) VALUE SPACE.',
    '31    88 MEM-EOF          VALUE "E".',
    '32 77 EXT-H            PIC 9(4).',
    '33 01 PRICE-VALUE.',
    '34    02               PIC X(16) VALUE "' + base.join('') + '".',
    '35    02               PIC X(12) VALUE [a].',
    '36 01 PRICE-TABLE      REDEFINES PRICE-VALUE.',
    '37    02 BASE-PRICE       OCCURS 4 PIC 9(4).',
    '38    02 EXT-PRICE        OCCURS 4 PIC 9(3).',
    '39 PROCEDURE DIVISION.',
    '40 MAIN-PROC.',
    '41     OPEN INPUT  MEM-F TIME-F',
    '42          I-O    WORK-F',
    '43          OUTPUT BILL-F.',
    '44     PERFORM MKTIME-PROC.',
    '45     PERFORM [b].',
    '46     CLOSE MEM-F TIME-F WORK-F BILL-F.',
    '47     STOP RUN.',
  ].join('\n');
}
function secondProgram(minutes: number) {
  return [
    '48 MKTIME-PROC.',
    '49     PERFORM UNTIL TIME-EOF',
    '50        READ TIME-F AT END     SET TIME-EOF TO TRUE',
    '51                    NOT AT END PERFORM MKWORK-PROC',
    '52        END-READ',
    '53     END-PERFORM.',
    '54 MKWORK-PROC.',
    '55     MOVE T-NO TO W-NO.',
    '56     READ WORK-F',
    '57        INVALID KEY     MOVE T-NO TO W-NO',
    '58                        [c]',
    '59                        WRITE W-REC END-WRITE',
    '60        NOT INVALID KEY ADD T-MIN TO W-MIN',
    '61                        REWRITE W-REC END-REWRITE',
    '62     END-READ.',
    '63 MKBILL-PROC.',
    '64     PERFORM UNTIL MEM-EOF',
    '65        READ MEM-F',
    '66           AT END     SET MEM-EOF TO TRUE',
    '67           NOT AT END PERFORM WRBILL-PROC',
    '68        END-READ',
    '69     END-PERFORM.',
    '70 WRBILL-PROC.',
    '71     MOVE M-NO TO W-NO B-NO.',
    '72     MOVE BASE-PRICE(M-CODE) TO B-CHG.',
    '73     READ WORK-F',
    '74        INVALID KEY CONTINUE',
    '75        NOT INVALID KEY',
    '76           IF W-MIN > ' + minutes + ' THEN',
    '77              COMPUTE EXT-H = (W-MIN - ' + minutes + ' + 59) / 60',
    '78              [d]',
    '79           END-IF',
    '80     END-READ.',
    '81     WRITE B-REC.',
  ].join('\n');
}

export const q10 = createLanguageDefinition(10, '会員制施設の月次請求と利用記録の整列集計', '月額・時間単価と基本料金内の時間', 'abcdefg', 'ウイカウエアウ',
  '四つの会員区分、請求前に利用分を集計する索引版と整列版、利用なしの請求、分から時間への切上げを保持する。基本時間・月額・時間単価を連動させ、固定長の料金表とコード内閾値を更新する。', index => {
    const { hours, base, extra } = clubCases[index];
    const minutes = 60 * hours;
    const money = (n: number) => n.toLocaleString('ja-JP') + '円';
    const [regular, gold, silver, student] = extra;
    const rateBank = [[student, silver, gold, regular], [gold, silver, regular, regular], extra, [regular, regular, silver, student]]
      .map(row => '"' + row.join('') + '"');
    return {
      pages: [
        page(50, [
          p('問10　次の COBOL プログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\nある会員制スポーツクラブにおける利用料金の計算プログラムである。\nこのスポーツクラブは，会員が都合の良い時間に施設を利用できるようになっており，会員の利用実績を利用記録ファイルに格納する。利用料金は，1か月に' + hours + '時間まで利用できる基本料金と，' + hours + '時間を超過した時間に応じて課金する超過料金の合計であり，1か月分をまとめて，翌月，会員に請求する。施設の利用実績がなかった会員にも，基本料金は請求する。'),
          p('（1）会員ファイルは，図1に示すレコード様式の索引ファイルであり，会員番号を主レコードキーとする。呼出し法は順呼出しとする。'),
          languageFigure(10, 'member-record', index, '図1 会員ファイルのレコード様式'),
          p('① 会員番号は，会員ごとに割り当てられる一意の番号であり，000001から始まる6桁の数字である。\n② 会員種別には，表1に示す会員種別が格納される。利用料金は，会員種別によって決まる。'),
          table('表1 料金表', ['名称', '会員種別', '基本料金（月額）', '超過料金（時間当たり）', '条件'],
            ['一般会員', 'ゴールド会員', 'シルバー会員', '学生会員'].map((name, i) =>
              [name, String(i + 1), money(base[i]), money(extra[i]), ['なし', '5年以上継続', '60歳以上', '学生'][i]])),
          p('③ 入会日には，入会した年，月，日が，それぞれ4桁，2桁，2桁で格納される。'),
        ]),
        page(51, [
          p('（2）利用記録ファイルは，図2に示すレコード様式の順ファイルであり，1か月分の会員の利用実績を格納する。1レコードには，1人の会員の1回の利用に関する情報が格納される。'),
          languageFigure(10, 'usage-record', index, '図2 利用記録ファイルのレコード様式'),
          p('① 利用日には，施設を利用した年，月，日が，それぞれ4桁，2桁，2桁で格納される。\n② 開始時刻及び終了時刻には，時，分がそれぞれ2桁の24時間表記で格納される。施設の営業時間は8時から23時までである。\n③ 利用時間には，施設の利用時間が分単位で格納される。'),
          p('（3）請求ファイルは，図3に示すレコード様式の順ファイルであり，会員ごとの月次請求金額を格納する。超過料金は1か月の利用時間の合計（分）を時間単位に切り上げて課金する。'),
          languageFigure(10, 'billing-record', index, '図3 請求ファイルのレコード様式'),
          p('（4）作業用ファイルは，図4に示すレコード様式の索引ファイルであり，会員番号を主レコードキーとする。利用記録ファイルから会員ごとの利用時間の合計を分単位で求めるために使用する。呼出し法は乱呼出しとする。'),
          languageFigure(10, 'working-record', index, '図4 作業用ファイルのレコード様式'),
        ]),
        page(52, [p('〔プログラム〕（行番号）'), code(firstProgram(base), 'cobol')]),
        page(53, [code(secondProgram(minutes), 'cobol'),
          p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')], [
          bank(1, 'a', rateBank, 'ウ', 'cobol'),
          bank(1, 'b', ['MAIN-PROC', 'MKBILL-PROC', 'MKTIME-PROC', 'MKWORK-PROC', 'WRBILL-PROC'], 'イ', 'cobol'),
        ]),
        page(54, [
          p('設問2　テストデータを用いて動作確認をしたところ，利用記録ファイルのレコード数の増加に伴って，処理時間が想定を大きく超えることが判明した。調査の結果，作業用ファイルの入出力に多くの時間を費やしていた。そこで，整列機能を使用して処理時間の短縮を図ることにし，表2の変更を行うことにした。表2のプログラムでは，図4に示すレコード様式の整列併合用ファイルを作業用ファイルとして使用する。表2のプログラム中の［　］に入れる正しい答えを，解答群の中から選べ。ここで，表2の［d］には，設問1の正しい答えが入っているものとする。'),
          languageFigure(10, 'program-changes-first', index, '表2 プログラムの変更'),
        ], [bank(1, 'cd', [
          'ADD EXT-PRICE(M-CODE) TO B-CHG', 'ADD T-MIN TO W-MIN',
          'COMPUTE B-CHG = B-CHG + EXT-PRICE(M-CODE) * EXT-H', 'COMPUTE W-MIN = (T-MIN + 59) / 60 + 1',
          'MOVE EXT-PRICE(M-CODE) TO B-CHG', 'MOVE T-MIN TO W-MIN',
        ], 'カウ', 'cobol')], [-1]),
        page(55, [languageFigure(10, 'program-changes-second', index, '表2 プログラムの変更（続き）')]),
        page(56, [], [
          bank(2, 'ef', ['ADD W-MIN TO TMP-MIN', 'MOVE ZERO TO TMP-MIN', 'PERFORM WRBILL-PROC', 'RELEASE W-REC', 'WRITE W-REC'], 'エア', 'cobol'),
          bank(2, 'g', ['(M-NO = TMP-NO OR TMP-MIN > ' + minutes + ') AND NOT MEM-EOF',
            'M-NO = TMP-NO', 'M-NO = TMP-NO AND TMP-MIN > ' + minutes, 'M-NO = TMP-NO OR TMP-MIN > ' + minutes, 'TMP-MIN > ' + minutes], 'ウ', 'cobol'),
        ]),
      ],
      explanation: 'COBOL（Common Business Oriented Language）は事務処理向けの言語で、ここでは索引ファイルと整列処理を使い分ける。時間単価は会員種別1〜4の順に ' + extra.join('，') + ' 円。利用記録の初回は，索引検索が失敗した作業域に利用分を MOVE で設定する。集計後に MKBILL-PROC で全会員へ基本料金を請求し，' + minutes + '分を超えた分は59を足して60で割った整数部分を超過時間とし，時間単価との積を加える。整列版は RELEASE で各利用記録を整列へ渡し，RETURN で同じ会員番号が続く間は W-MIN を TMP-MIN に加える。会員番号が一致し，かつ集計分が' + minutes + '分を超えた場合だけ超過料金を加える。',
    };
  });
