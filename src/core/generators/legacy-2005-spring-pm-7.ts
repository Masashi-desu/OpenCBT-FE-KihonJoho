import { code, p, table } from './definition';
import { draw, surveyConditions } from './legacy-2005-spring-pm-06-09-figures';
import { bank, draftQuestion, type Page } from './legacy-2005-spring-pm-06-09-support';

const paging = ['1', '2', '3', '4'];
const statements = [
  'COMPUTE GOKEI = GOKEI + B(X Y)',
  'COMPUTE GOKEI = NINZUU(Z) + B(X Y)',
  'COMPUTE NINZUU(Z) = GOKEI + B(X Y)',
  'MOVE B(X Y) TO GOKEI',
  'MOVE X TO Z',
  'MOVE Y TO Z',
  'MOVE Z TO Y',
  'SET X TO Z',
  'SET Y TO Z',
  'SET Z TO Y',
];
const pairs = [
  ['E-KYOMI', 'E-NENREI'], ['E-KYOMI', 'E-SHOKUGYO'], ['E-NENREI', 'E-KYOMI'],
  ['E-NENREI', 'E-SHOKUGYO'], ['E-SHOKUGYO', 'E-KYOMI'], ['E-SHOKUGYO', 'E-NENREI'],
];
const changes = pairs.map(([major, minor]) => 'COMPUTE B(' + major + ' ' + minor + ') = B(' + major + ' ' + minor + ') + 1');

function program(count: number): string {
  return [
    'DATA DIVISION.',
    'FILE SECTION.',
    'FD ENQUETE-F.',
    '01 ENQUETE-R.',
    '    03 E-NENREI     PIC 9(1).',
    '    03 E-SHOKUGYO   PIC 9(1).',
    '    03 E-KYOMI      PIC 9(1).',
    '    03              PIC X(97).',
    'FD PRINT-F.',
    '01 PRINT-R PIC X(100).',
    'WORKING-STORAGE SECTION.',
    '01 HYO.',
    '    03 A            OCCURS ' + count + ' INDEXED BY X.',
    '        05 B        OCCURS ' + count + ' INDEXED BY Y PIC 9(6).',
    '01 END-SW           PIC X(3) VALUE SPACE.',
    '01 KUHAKU           PIC X(100) VALUE SPACE.',
    '01 MEISAI.',
    '    03              PIC X(10) VALUE SPACE.',
    '    03              OCCURS ' + (count + 1) + ' INDEXED BY Z.',
    '        05          PIC X(4) VALUE SPACE.',
    '        05 NINZUU   PIC ZZZ,ZZ9.',
    '01 GOKEI            PIC 9(6) VALUE ZERO.',
    'PROCEDURE DIVISION.',
    'HAJIME.',
    '    OPEN INPUT ENQUETE-F OUTPUT PRINT-F.',
    '    INITIALIZE HYO.',
    '    PERFORM UNTIL END-SW = "END"',
    '        READ ENQUETE-F',
    '            AT END MOVE "END" TO END-SW',
    '            NOT AT END',
    '                COMPUTE B(E-NENREI E-SHOKUGYO)         ← α',
    '                      = B(E-NENREI E-SHOKUGYO) + 1',
    '        END-READ',
    '    END-PERFORM.',
    '    WRITE PRINT-R FROM KUHAKU AFTER PAGE.',
    '    WRITE PRINT-R FROM KUHAKU AFTER ［a］.',
    '    PERFORM VARYING X FROM 1 BY 1 UNTIL X > ' + count,
    '        PERFORM VARYING Y FROM 1 BY 1 UNTIL Y > ' + count,
    '            ［b］',
    '            MOVE B(X Y) TO NINZUU(Z)',
    '            ［c］',
    '        END-PERFORM',
  ].join('\n');
}

function continuation(count: number): string {
  return [
    '        MOVE GOKEI TO NINZUU(' + (count + 1) + ')',
    '        WRITE PRINT-R FROM MEISAI AFTER 2',
    '        MOVE ZERO TO GOKEI',
    '    END-PERFORM.',
    '    CLOSE ENQUETE-F PRINT-F.',
    '    STOP RUN.',
  ].join('\n');
}

const list = (items: readonly string[]) => items.map((item, index) => (index + 1) + '：' + item).join('，');
export const q7 = draftQuestion(7, 'COBOL：来場者アンケートの項目別集計',
  'コードの区分数と印刷用紙の行位置', 'a=ウ b=コ c=ア 設問2=オ',
  'レコード全100桁と3項目の1桁コードを保持。年代・職業・来場目的の区分数を同時に変え，配列の区分数と人数明細・合計欄の配列長を同期。先頭明細の行を変え，改ページ後の空白送りの正答を可変にする。移動，改ページ，2行送り，6桁以内の条件と出力用紙の印字済み文字を保持。',
  index => {
    const { ages, jobs, purposes, firstRow } = surveyConditions[index];
    const count = ages.length;
    const a = 'アイウエ'[firstRow - 4];
    const pages: Page[] = [
      { page: 27, blocks: [
        p('問7　次の COBOL プログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラムの説明〕'),
        p('あるイベントの来場者アンケートを集計し，年代別職業別参加人数表を出力するプログラムである。'),
        p('（1）アンケートファイルのレコード様式は，次のとおりである。'),
        table('アンケートファイルのレコード様式', ['年齢', '職業', '興味', 'その他の答え'], [['1けた', '1けた', '1けた', '97けた']]),
        p('①　年齢は，年代別にコード化されており，次のいずれかが記録されている。'),
        p(list(ages.map(age => age.description))),
        p('②　職業は，' + jobs.slice(0, Math.min(jobs.length - 1, 3)).join('，') +
          'などに分類してコード化されており，次のいずれかが記録されている。'),
        p(list(jobs)),
        p('③　興味は，来場の主目的が，' + purposes.slice(0, Math.min(purposes.length - 1, 3)).join('，') +
          'などのどれであるかをコード化したものであり，次のいずれかが記録されている。'),
        p(list(purposes)),
        p('（2）来場者アンケートを集計して，次の年代別職業別参加人数表を出力する。'),
        draw('7-age-form', index),
        p('①　各参加人数は，来場者アンケートを集計した結果で，総参加人数は最大6けたである。'),
      ] },
      { page: 28, blocks: [
        p('②　年代別，職業別に参加人数を印字し，さらに年代別の合計を印字する。'),
        p('③　参加人数及び合計人数以外の文字は，あらかじめ印字されている。'),
        p('（3）アンケートファイルのレコードの各項目にエラーはない。'),
        p('〔プログラム〕'),
        code(program(count), 'cobol'),
      ] },
      { page: 29, blocks: [
        code(continuation(count), 'cobol'),
        p('設問1　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      ], banks: [bank('a', paging, a, undefined, 1), bank('bc', statements, 'コア', 'cobol', 1, 'b，cに関する解答群')] },
      { page: 30, blocks: [
        p('設問2　出力用紙に次の用紙を使い，職業別目的別参加人数表を出力するとき，プログラム中のαをどの文と置換すればよいか，正しい答えを，解答群の中から選べ。'),
        draw('7-purpose-form', index),
      ], banks: [bank('s', changes, 'オ', 'cobol', 2, '解答群')] },
    ];
    return {
      pages,
      explanation: 'COBOL の WRITE AFTER PAGE で改ページし，白紙部分を第1行で出力する。最初の明細を第' + firstRow +
        '行に印字するには，明細の2行送りの前に a で' + (firstRow - 3) +
        '行送る。b の SET Z TO Y は職業の出現番号と明細欄の出現番号をそろえる。c はその職業の人数を GOKEI に加え，' +
        '行末で合計欄へ転記してから0に戻す。職業別目的別表では行を職業，列を興味で選ぶので，αの添字を E-SHOKUGYO と E-KYOMI の順に置き換える。',
    };
  });
