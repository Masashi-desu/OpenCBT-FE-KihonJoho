import { code, p, table } from './definition';
import { bank, draftQuestion } from './legacy-2007-spring-pm-06-09-support';
import { drawing } from './legacy-2007-spring-pm-06-09-figures';
import { voteCases, voteOptions, type Votes } from './legacy-2007-spring-pm-06-09-model';

function declarations(max: number) {
  return `DATA DIVISION.
FILE SECTION.
FD  KAIHYO-F.
01  KAIHYO-R.
    05  K-CHIKU-CD           PIC X(6).
    05  K-KOHOSHA-MEI        PIC X(20).
    05  K-TOKUHYO-SU         PIC 9(9).
WORKING-STORAGE SECTION.
01  SHUKEI-TABLE.
    05  S-MAX                PIC 9(3).
    05  S-TBL     OCCURS 0 TO ${max} DEPENDING ON S-MAX
                  INDEXED BY S-IDX.
        10  S-KOHOSHA-MEI    PIC X(20).
        10  S-TOKUHYO-SU     PIC 9(9).`;
}
function procedure(ascending: boolean) {
  return `01  W-TBL                    PIC X(29).
01  P-TOKUHYO-SU             PIC ZZZ,ZZZ,ZZ9.
01  W-EOF                    PIC 9.
01  W-I                      PIC 9(5).
01  W-J                      PIC 9(5).
01  W-K                      PIC 9(5).
PROCEDURE DIVISION.
MAIN-CTL.
    OPEN INPUT KAIHYO-F.
    MOVE 0 TO W-EOF.
    MOVE 0 TO S-MAX.
    PERFORM UNTIL W-EOF = 1
       READ KAIHYO-F
            AT END     MOVE 1 TO W-EOF
            NOT AT END PERFORM SHUKEI-PROC
       END-READ
    END-PERFORM.
    PERFORM SHUKEI-DISP.
    CLOSE KAIHYO-F.
    STOP RUN.
*
SHUKEI-PROC.
    SET S-IDX TO 1.
    SEARCH S-TBL VARYING S-IDX
       AT END
            ADD 1 TO S-MAX
            MOVE K-KOHOSHA-MEI TO S-KOHOSHA-MEI(S-MAX)
            ［a］
       WHEN S-KOHOSHA-MEI(S-IDX) = K-KOHOSHA-MEI
            ［b］
    END-SEARCH.
*
SHUKEI-DISP.
    PERFORM VARYING W-I FROM 1 BY 1 UNTIL W-I > S-MAX
       COMPUTE W-K = W-I + 1
       PERFORM VARYING W-J FROM W-K BY 1 UNTIL W-J > S-MAX
          IF S-TOKUHYO-SU(W-I) ${ascending ? '>' : '<'} S-TOKUHYO-SU(W-J)
             MOVE S-TBL(W-I) TO W-TBL
             ［c］
             MOVE W-TBL TO S-TBL(W-J)
          END-IF
       END-PERFORM
       MOVE S-TOKUHYO-SU(W-I) TO P-TOKUHYO-SU
       DISPLAY S-KOHOSHA-MEI(W-I) "   " P-TOKUHYO-SU
    END-PERFORM.`;
}
const commandOptions = [
  'ADD K-TOKUHYO-SU TO S-TOKUHYO-SU(S-IDX)', 'ADD K-TOKUHYO-SU TO S-TOKUHYO-SU(S-MAX)',
  'MOVE K-TOKUHYO-SU TO S-TOKUHYO-SU(S-MAX)', 'MOVE S-TBL(W-I) TO S-TBL(W-J)', 'MOVE S-TBL(W-J) TO S-TBL(W-I)',
];
const optionListing = (rows: Votes) => ['地区コード  候補者名  得票数',
  ...rows.map(([district,candidate,votes]) => district.padEnd(10) + candidate.padEnd(9) + votes)].join('\n');

export const q7 = draftQuestion(7,'COBOL：候補者の得票を集計し、テストデータを選ぶ',
  '得票数・候補上限・表示順序', '設問1 aウ bア cオ／設問2 オ',
  '得票の初出登録・既存への加算・交換と，命令網羅に必要な3処理すべてを通るデータを選ぶ構造を維持。昇降順・最大候補者数・票数を変える。候補表の地区コード・名前・票数の3列の元様式を保持する。',
  index => {
    const { max, ascending } = voteCases[index];
    const { rows,correctIndex } = voteOptions(index);
    return {
      pages:[
        { page:26, blocks:[
          p('問7　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('選挙速報を画面に表示するプログラムである。あるテレビ局では，地方自治体の首長選挙において，地区ごとの開票情報を収集し，候補者ごとの得票数を集計して表示するプログラムを開発した。'),
          p('(1) 地区ごとの開票情報を記録した開票ファイルのレコード様式は，次のとおりである。'),drawing('7-record',index),
          p('(2) 選挙速報の表示様式は，次のとおりである。'),drawing('7-output',index),
          p('① 選挙速報は，得票数の' + (ascending?'昇順':'降順') + 'に表示する。'),
          p('② 見出しは，あらかじめ表示されている。'),
          p('(3) 候補者数は最大' + max + '人，得票数は最大9けたとし，データに誤りはないものとする。'),
          p('〔プログラム〕'),code(declarations(max),'cobol'),
        ] },
        { page:27, blocks:[code(procedure(ascending),'cobol')] },
        { page:28, banksAfter:[1,2], blocks:[
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　このプログラムの動作を検証するための命令網羅テストにおいて，開票ファイルとして適切なデータの並びを，解答群の中から選べ。'),
        ], banks:[
          bank('abc',commandOptions,'ウアオ','cobol',1,'解答群'),
          { ...bank('s',rows.map(optionListing),'アイウエオ'[correctIndex],undefined,2,'解答群'),
            renderedOptions: rows.map(input=>[table('開票ファイル',['地区コード','候補者名','得票数'],input.map(row=>row.map(String)))]) },
        ] },
      ],
      explanation:[
        'a：候補者名が表になければ末尾に新規行を作り，その票数を代入する。',
        'b：候補者名が一致した行S-IDXの既存得票数へ今回の票を加算する。',
        'c：交換では元のW-Iを作業領域に退避し，W-Jの行をW-Iに移してから退避した行をW-Jへ移す。',
        '設問2：命令網羅には新規登録・既存加算・交換の3処理をすべて実行する必要がある。該当ファイルの候補者は' +
          [...new Set(rows[correctIndex].map(record=>record[1]))].join('，') + 'の順に登録され，同じ候補者の集計後に' +
          (ascending?'小さい票数を前へ':'大きい票数を前へ') + '交換する。',
      ].join('\n'),
    };
  });
