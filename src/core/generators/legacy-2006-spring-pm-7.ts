import { code, p, table } from './definition';
import { bank, draftQuestion, type Page } from './legacy-2006-spring-pm-06-09-support';

const lotSizes = [200, 185, 216, 240];
const distances = ['0', '1', '2'];
const instructions = [
  'COMPUTE M-HAJIME = BANGO - 1',
  'COMPUTE M-HAJIME = W-BANGO + 1',
  'COMPUTE M-OWARI = BANGO - 1',
  'COMPUTE M-OWARI = W-BANGO + 1',
  'MOVE SPACE TO DISPLAY-SW',
  'MOVE SPACE TO MEISAI',
  'MOVE W-BANGO TO M-HAJIME',
  'MOVE W-BANGO TO M-OWARI',
  'MOVE "ON" TO DISPLAY-SW',
];

function program(limit: number): string {
  return [
    'DATA DIVISION.',
    'FILE SECTION.',
    'FD  SHIYO-F.',
    '01  SHIYO-R.',
    '    03  BANGO     PIC 9(3).',
    '    03            PIC X(100).',
    'WORKING-STORAGE SECTION.',
    '01  END-SW        PIC X(3).',
    '01  DISPLAY-SW    PIC X(2).',
    '01  MIDASHI       PIC X(10) VALUE "AKI KUKAKU".',
    '01  MEISAI.',
    '    03  M-HAJIME  PIC ZZZ.',
    '    03  M-HYPHEN  PIC X(3).',
    '    03  M-OWARI   PIC ZZZ.',
    '01  W-SA          PIC 9(3).',
    '01  W-BANGO       PIC 9(3).',
    'PROCEDURE DIVISION.',
    'SHORI.',
    '    OPEN INPUT SHIYO-F.',
    '    INITIALIZE W-BANGO END-SW DISPLAY-SW.',
    '    DISPLAY MIDASHI.',
    '    PERFORM UNTIL END-SW = "END"',
    '       READ SHIYO-F AT END MOVE "END" TO END-SW',
    '       NOT AT END',
    '          COMPUTE W-SA = BANGO - W-BANGO',
    '          IF W-SA > ［a］ THEN',
    '             MOVE SPACE TO MEISAI',
    '             ［b］',
    '             IF W-SA > ［c］ THEN',
    '                MOVE " - " TO M-HYPHEN',
    '                ［d］',
    '             END-IF',
    '             DISPLAY MEISAI',
    '             ［e］',
    '          END-IF',
    '          MOVE BANGO TO W-BANGO',
    '       END-READ',
    '    END-PERFORM.',
    '    IF W-BANGO NOT = ' + limit + ' THEN',
    '       MOVE SPACE TO MEISAI',
    '       ［b］',
    '       IF W-BANGO < ' + (limit - 1) + ' THEN',
    '          MOVE " - " TO M-HYPHEN',
    '          MOVE ' + limit + ' TO M-OWARI',
    '       END-IF',
    '       DISPLAY MEISAI',
    '    ELSE IF DISPLAY-SW = SPACE THEN',
    '       DISPLAY "AKI : 0"',
    '    END-IF.',
    '    CLOSE SHIYO-F.',
    '    STOP RUN.',
  ].join('\n');
}

export const q7 = draftQuestion(7, 'COBOL：駐輪場の空き区画を連続範囲にまとめる',
  '駐輪場の総区画数と終端判定の上限', 'a=イ b=イ c=ウ d=ウ e=ケ',
  '使用中の区画だけを昇順・重複なしで読む前提、レコード図、単発と連続の出力例、常時見出し、満車時の表示、5空欄と2解答群を保持。区画番号の上限を三桁のまま動かし、区画番号の定義とファイル末尾の単発・連続判定や最終区画を同期する。同じ解法なら空欄の構文は固定で、上限変更により同じ最終使用番号のときに空きなし、末尾の単発、末尾の連続のどの出力になるかが変わる。',
  index => {
    const limit = lotSizes[index];
    const pages: Page[] = [
      {page: 29, blocks: [
        p('問7　次の COBOL プログラムの説明及びプログラムを読んで，設問に答えよ。'),
        p('〔プログラムの説明〕'),
        p('駐輪場の使用状況を調べ，空き区画の番号を表示するプログラムである。駐輪場の各区画には自転車を1台駐輪することができ，それぞれの区画には区画番号が付けられている。区画は' + limit + '台分あり，区画番号は1〜' + limit + 'の連番となっている。'),
        p('（1）使用状況ファイルのレコード様式は，次のとおりである。'),
        table('使用状況ファイルのレコード様式', ['区画番号', 'その他の情報'], [['3けた', '100けた']]),
        p('①　区画番号の昇順に記録されている。'),
        p('②　使用状況ファイルには，現在使用されている区画のレコードだけが記録されていて，同じ区画のレコードが重複して記録されることはない。'),
        p('（2）空き区画の情報を次のように表示する。'),
        code('AKI KUKAKU\nZZZ\nZZZ - ZZZ\nZZZ - ZZZ\nZZZ\n      ：', 'text'),
        p('①　空き区画が連続していないときは，空き区画番号を表示する。'),
        p('②　空き区画が連続する場合は，次の形式で表示する。'),
        p('連続の始めの区画番号 - 連続の終わりの区画番号'),
        p('③　見出しは常に表示する。'),
        p('④　空き区画が一つもない場合は，次のメッセージを表示する。'),
        code('AKI : 0', 'text'),
      ]},
      {page: 30, blocks: [p('〔プログラム〕'), code(program(limit), 'cobol')]},
      {page: 31, blocks: [p('設問　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')],
        banks: [bank('ac', distances, 'イウ', undefined, undefined, 'a，c に関する解答群'),
          bank('bde', instructions, 'イウケ', 'cobol', undefined, 'b，d，e に関する解答群')]},
    ];
    return { pages, explanation: 'COBOL（Common Business-Oriented Language）は事務処理向けのプログラミング言語。直前の使用番号 W-BANGO と今回の使用番号 BANGO の差 W-SA が1を超える場合に空きがある。先頭は W-BANGO + 1 で，差が2を超えるときは連続区画の末尾 BANGO − 1 も表示する。一度でも明細を出せば DISPLAY-SW に ON を設定する。ファイル末尾では最後の使用番号より後ろを区画' + limit + 'まで処理し，残りが一つだけなら終端を重ねて表示しない。空きが一つもないときだけ AKI : 0 を表示する。' };
  }, 'fixed');
