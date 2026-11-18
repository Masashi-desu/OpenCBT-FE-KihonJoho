import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2004-spring-pm-06-09-support';
import { categoryCounts, recordLayout } from './legacy-2004-spring-pm-06-09-figures';

const outer = [
  'W-SBANGO = HIGH-VALUE',
  'W-SBANGO = HIGH-VALUE AND W-E-SBANGO = HIGH-VALUE\nAND W-J-SBANGO = HIGH-VALUE',
  'W-SBANGO = HIGH-VALUE OR W-E-SBANGO = HIGH-VALUE\nAND W-J-SBANGO = HIGH-VALUE',
  'W-SBANGO = HIGH-VALUE OR W-E-SBANGO = HIGH-VALUE\nOR W-J-SBANGO = HIGH-VALUE',
];
const english = [
  'CONTINUE',
  'DISPLAY "ERROR EIGO  ", W-E-SBANGO',
  'DISPLAY "ERROR EIGO  ", W-E-SBANGO\nPERFORM READ-EIGOF',
  'DISPLAY "ERROR EIGO  ", W-E-SBANGO\nPERFORM READ-JOHOF',
  'PERFORM E-RTN',
  'PERFORM E-RTN\nPERFORM READ-EIGOF',
  'PERFORM E-RTN\nPERFORM READ-EIGOF\nPERFORM READ-JOHOF',
  'PERFORM E-RTN\nPERFORM READ-JOHOF',
  'PERFORM READ-EIGOF',
  'PERFORM READ-EIGOF\nPERFORM READ-JOHOF',
];
const information = [
  'W-J-SBANGO = E-SBANGO',
  'W-J-SBANGO = J-SBANGO',
  'W-J-SBANGO = W-SBANGO',
  'W-J-SBANGO NOT = W-SBANGO',
];
const fileStart = (length: number) => `DATA DIVISION.
FILE SECTION.
FD  O-SHIKAKUF.
01  O-R                    PIC X(${length}).
FD  N-SHIKAKUF.
01  N-R                    PIC X(${length}).
FD  EIGOF.
01  E-R.
    03  E-SBANGO           PIC X(6).
    03  E-TEN              PIC 9(3).`;
const procedure = (count: number) => `FD  JOHOF.
01  J-R.
    03  J-SBANGO           PIC X(6).
    03  J-KUBUN            PIC X(2).
WORKING-STORAGE SECTION.
01  W-R.
    03  W-SBANGO           PIC X(6).
    03  W-EIGO             PIC 9(3).
    03  W-JOHO.
        05  W-KUBUN-A      PIC X(2) OCCURS ${count} INDEXED BY N.
01  W-E-SBANGO             PIC X(6).
01  W-J-SBANGO             PIC X(6).
PROCEDURE DIVISION.
HAJIME.
    OPEN INPUT O-SHIKAKUF EIGOF JOHOF OUTPUT N-SHIKAKUF.
    PERFORM READ-O-SHIKAKUF.
    PERFORM READ-EIGOF.
    PERFORM READ-JOHOF.
    PERFORM UNTIL [a]
        EVALUATE TRUE
            WHEN W-SBANGO = W-E-SBANGO AND NOT = HIGH-VALUE
                [b]
            WHEN W-SBANGO < W-E-SBANGO
                [c]
            WHEN W-SBANGO > W-E-SBANGO
                [d]
        END-EVALUATE
        EVALUATE TRUE
            WHEN W-SBANGO = W-J-SBANGO AND NOT = HIGH-VALUE
                PERFORM J-RTN
            WHEN W-SBANGO < W-J-SBANGO
                CONTINUE
            WHEN W-SBANGO > W-J-SBANGO
                DISPLAY "ERROR JOHO  ", W-J-SBANGO
                PERFORM READ-JOHOF
        END-EVALUATE
        IF W-SBANGO < W-E-SBANGO AND W-J-SBANGO
            WRITE N-R FROM W-R
            PERFORM READ-O-SHIKAKUF
        END-IF
    END-PERFORM.
    CLOSE O-SHIKAKUF EIGOF JOHOF N-SHIKAKUF.
    STOP RUN.
E-RTN.
    MOVE E-TEN TO W-EIGO.
J-RTN.
    PERFORM UNTIL [e]
        PERFORM VARYING N FROM 1 BY 1
            UNTIL N > ${count} OR J-KUBUN = W-KUBUN-A(N)
                OR W-KUBUN-A(N) = SPACE
            CONTINUE
        END-PERFORM`;
const read = (count: number) => `        IF N < ${count+1} AND W-KUBUN-A(N) = SPACE
            MOVE J-KUBUN TO W-KUBUN-A(N)
        ELSE
            DISPLAY "ERROR KUBUN  ", J-R
        END-IF
        PERFORM READ-JOHOF
    END-PERFORM.
READ-O-SHIKAKUF.
    READ O-SHIKAKUF
        AT END MOVE HIGH-VALUE TO W-SBANGO
        NOT AT END MOVE O-R TO W-R
    END-READ.
READ-EIGOF.
    READ EIGOF
        AT END MOVE HIGH-VALUE TO W-E-SBANGO
        NOT AT END MOVE E-SBANGO TO W-E-SBANGO
    END-READ.
READ-JOHOF.
    READ JOHOF
        AT END MOVE HIGH-VALUE TO W-J-SBANGO
        NOT AT END MOVE J-SBANGO TO W-J-SBANGO
    END-READ.`;

export const q7 = draftQuestion(7,'COBOLで社員別の三ファイルを突き合わせる','資格領域の区分数と固定長レコードの幅','イカアウエ',
  '社員番号順で三つの順ファイルを突き合わせる。資格領域の区分数とレコード長を変更し、図、表定義、探索境界、空欄、重複の判定を連動させる。三ファイルの終端、英語点数0〜999、同一社員の複数資格、既存資格と社員不明のエラーを保持する。', index=>{
  const count=categoryCounts[index];
  const length=9+count*2;
  return {
    pages: [
      {page:30,blocks:[
        p('問7　次のCOBOLプログラムの説明及びプログラムを読んで，設問に答えよ。'),
        p('〔プログラムの説明〕'),
        p('ある会社では，社員が英語と情報処理技術についてどのような能力を保有しているかを，資格技能ファイルで管理している。年に一度，英語テストの最新の点数及び過去1年間に取得した情報処理技術の資格情報を資格技能ファイルに反映させる更新処理を行う。更新処理では，まず，英語テストの最新の点数を英語点数ファイルに記録し，資格情報を情報処理技術認定ファイルに記録する。その上で，旧資格技能ファイルに英語点数ファイルと情報処理技術認定ファイルとを突き合わせ，新資格技能ファイルを作成する。'),
        p('（1）新旧の資格技能ファイル N-SHIKAKUF，O-SHIKAKUF のレコード様式は，次のとおりである。'),
        recordLayout(index,0,'新旧資格技能ファイルのレコード様式'),
        p('① 全社員のレコードが存在し，社員番号の昇順に整列された順ファイルである。'),
        p('② 英語テストは入社時に全員受験しており，英語の点数は必ず記録されている。情報処理技術資格情報は，資格を取得している場合に記録され，取得していない場合は空白が記録されている。'),
        p('③ 英語点数ファイルにデータがあれば，英語の点数を更新する。点数は0〜999点の範囲である。'),
        p('④ 情報処理技術資格は，全部で'+count+'区分あり，合格した区分を2けたのコードで区分領域1〜'+count+'の先頭から記録する。区分が記録されていない区分領域は空白である。'),
        p('⑤ 情報処理技術認定ファイルにデータがあれば，新資格技能ファイルの最初の空白の区分領域に追加する。'),
      ]},
      {page:31,blocks:[
        p('（2）英語点数ファイル EIGOF のレコード様式は，次のとおりである。'),
        recordLayout(index,1,'英語点数ファイルのレコード様式'),
        p('① 社員番号の昇順に整列された順ファイルである。'),
        p('② 受験した社員のレコードだけが存在する。また，1年間に複数回受験していても，過去のデータを無条件で置き換えているので，最後に受験したときの点数を記録したレコードだけが存在する。'),
        p('③ 旧資格技能ファイルに存在しない社員番号のレコードがあったときは，エラーメッセージを出力する。'),
        p('（3）情報処理技術認定ファイル JOHOF のレコード様式は，次のとおりである。'),
        recordLayout(index,2,'情報処理技術認定ファイルのレコード様式'),
        p('① 社員番号の昇順に整列された順ファイルである。'),
        p('② 1年間に新たに資格を取得した社員のレコードだけが存在する。また，1人につき複数レコードが存在することがあるが，区分は異なる。'),
        p('③ 旧資格技能ファイルに存在しない社員番号のレコードがあったときは，エラーメッセージを出力する。'),
        p('④ 旧資格技能ファイルに，同一区分が記録済みであったときは，エラーメッセージを出力する。'),
        p('〔プログラム〕'),code(fileStart(length),'cobol'),
      ]},
      {page:32,blocks:[code(procedure(count),'cobol')]},
      {page:33,blocks:[code(read(count),'cobol'),p('設問　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')],
        banks:[bank('a',outer,'イ','cobol')]},
      {page:34,blocks:[],banks:[
        bank('bcd',english,'カアウ','cobol',undefined,'b〜dに関する解答群'),bank('e',information,'エ','cobol'),
      ]},
    ],
    explanation:'最初の読み込みで各ファイルの現在の社員番号を得る。終端のファイルにはどの社員番号より大きいHIGH-VALUEを置くので，全て終端になるまで突き合わせる。英語点数の社員番号が一致するときは点数を更新して英語点数ファイルを進める。次の社員の点数は保留し，既に通過した又は存在しない社員番号にはエラーを出して英語点数ファイルを進める。情報処理技術認定ファイルは同じ社員の間だけ読み進め，'+count+'区分の先頭から既存の区分又は空白を探し，空白にだけ追加する。両更新ファイルの社員番号が後続になったら，その社員のレコードを出力する。',
  };
},'fixed');
