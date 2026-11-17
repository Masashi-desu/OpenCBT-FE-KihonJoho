import { code, p } from './definition';
import { bank, createLanguageDefinition, languageFigure, page, standaloneBank } from './legacy-2007-spring-pm-10-13-support';

const cases = [
  { school: '小学校', graduate: 6, parent: '中村健', telephone: '03-1234-5678', younger: '中村二郎', older: '中村一郎' },
  { school: '5学年制の学校', graduate: 5, parent: '高橋明', telephone: '03-4321-9876', younger: '高橋美紀', older: '高橋花' },
  { school: '4学年制の学校', graduate: 4, parent: '佐藤陽子', telephone: '03-5312-4678', younger: '佐藤透', older: '佐藤修' },
  { school: '7学年制の学校', graduate: 7, parent: '田中誠', telephone: '03-6284-1735', younger: '田中和', older: '田中円' },
];
const field = (text: string, columns: number, grouped = false) => ({ text, columns, grouped });
const idFields = [field('保護者氏名\n20けた',20),field('電話番号\n13けた',13)];
const pupilFields = [field('学年\n1けた',1,true),field('児童氏名\n20けた',20,true)];
const recordAlt = '保護者氏名20けた・電話番号13けたに続き，在校児童の学年1けた・児童氏名20けたを5回繰り返す。';
export const q11Older = languageFigure(11,'existing-format','昨年度・本年度の保護者名簿のレコード様式',() => ({
  kind: 'formats', fields: [...idFields, ...pupilFields, ...pupilFields, field('…',6,true)], repeat: '在校児童を5回繰返し', alt: recordAlt,
}));
export const q11Example = languageFigure(11,'example-record','在校児童が2人のレコードの格納例',index => {
  const { graduate, parent, telephone, younger, older } = cases[index];
  const grades = [graduate - 3, graduate - 1];
  return { kind: 'formats', fields: [field(parent,20),field(telephone,13),field(String(grades[0]),1),field(younger,20),
    field(String(grades[1]),1),field(older,20),field('空白',8)], alt: [parent,telephone,grades[0],younger,grades[1],older,'空白'].join('｜') };
});
export const q11Entrants = languageFigure(11,'entrant-format','新入学児童の保護者名簿のレコード様式',() => ({
  kind:'formats', fields: [...idFields,field('児童氏名\n20けた',20,true),field('児童氏名\n20けた',20,true),field('…',6,true)],
  repeat:'児童氏名を5回繰返し',alt:'保護者氏名20けた・電話番号13けたに続き，児童氏名20けたを5回繰り返す。',
}));
const displaySections = [53,82,90,92];
const displaySource = 'DISPLAY "REMOVED DATA = " OLD-ID';
const displayCode = displaySections.map((line, i) => (i < 2 ? 'ELSE\n    ' : '    ') + displaySource + (line === 92 ? '.' : ''));
const displayLines = displaySections.map(line => '行番号' + line + 'と行番号' + (line+1) + 'の間に追加');
export const q11ChoiceFigures = displayLines.map((line, i) => languageFigure(11,'change-' + (i+1),'プログラムの変更内容',
  () => ({kind:'table',columns:['処置','プログラムの変更内容'],rows:[[line,displayCode[i]]],codeColumn:1,alt:line + '\n' + displayCode[i]})));
const numberedCode = (start: number, content: string) => code(content.split('\n').map((line,i) =>
  (start + i).toString().padStart(2,' ') + '  ' + line).join('\n'),'cobol');
const data = `DATA DIVISION.
FILE SECTION.
FD  OLD-FILE.
01  OLD-REC             PIC X(138).
FD  NEW-FILE.
01  NEW-REC             PIC X(138).
FD  ENT-FILE.
01  ENT-REC             PIC X(133).
WORKING-STORAGE SECTION.
01 W-OLD-REC.
   02 OLD-ID            VALUE SPACE.
      88 OLD-EOF        VALUE HIGH-VALUE.
      03 OLD-PARENT        PIC X(20).
      03 OLD-TEL           PIC X(13).
   02 OLD-PUPIL            OCCURS 5 TIMES.
      03 OLD-NUM           PIC 9(1).
      03 OLD-NAME          PIC X(20).
01 W-NEW-REC.
   02 NEW-ID.
      03 NEW-PARENT        PIC X(20).
      03 NEW-TEL           PIC X(13).
   02 NEW-PUPIL            OCCURS 5 TIMES.
      03 NEW-NUM           PIC 9(1).
      03 NEW-NAME          PIC X(20).
01 W-ENT-REC.
   02 ENT-ID            VALUE SPACE.
      88 ENT-EOF        VALUE HIGH-VALUE.
      03 ENT-PARENT        PIC X(20).
      03 ENT-TEL           PIC X(13).
   02 ENT-NAME             OCCURS 5 TIMES PIC X(20).
01 OLD-CNT                 PIC 9(1).
01 NEW-CNT                 PIC 9(1).
01 ENT-CNT                 PIC 9(1).
01 READ-FLAG               PIC X(1) VALUE "B".
   88 READ-BOTH            VALUE "B".
   88 READ-OLD-FILE        VALUE "O".
   88 READ-ENT-FILE        VALUE "E".`;
const main = `PROCEDURE DIVISION.
MAIN-PROC.
    OPEN INPUT OLD-FILE ENT-FILE OUTPUT NEW-FILE.
    PERFORM UNTIL OLD-EOF AND ENT-EOF
       IF READ-OLD-FILE OR READ-BOTH THEN
          READ OLD-FILE INTO W-OLD-REC
                         AT END SET OLD-EOF TO TRUE
          END-READ
       END-IF
       IF READ-ENT-FILE OR READ-BOTH THEN
          READ ENT-FILE INTO W-ENT-REC
                         AT END SET ENT-EOF TO TRUE
          END-READ
       END-IF
       IF ［a］ THEN
          PERFORM CREATE-PROC
       END-IF
    END-PERFORM.
    CLOSE OLD-FILE ENT-FILE NEW-FILE.
    STOP RUN.
CREATE-PROC.
    MOVE SPACE TO W-NEW-REC.
    EVALUATE TRUE
    WHEN OLD-ID < ENT-ID
       PERFORM NUM-UP-PROC
       ［b］
       SET READ-OLD-FILE TO TRUE
    WHEN OLD-ID = ENT-ID
       PERFORM NUM-UP-PROC
       MOVE OLD-ID TO NEW-ID
       PERFORM ENT-ADD-PROC
       MOVE 1 TO OLD-CNT
       PERFORM VARYING NEW-CNT FROM ENT-CNT BY 1
                UNTIL NEW-CNT > 5
          ［c］
          ADD 1 TO OLD-CNT
       END-PERFORM
       SET READ-BOTH TO TRUE
    WHEN OLD-ID > ENT-ID
       MOVE ENT-ID TO NEW-ID
       PERFORM ENT-ADD-PROC
       SET READ-ENT-FILE TO TRUE
    END-EVALUATE.
    IF NEW-PUPIL(1) NOT = SPACE THEN
       WRITE NEW-REC FROM W-NEW-REC
    END-IF.`;
const subroutines = (graduate: number) => `NUM-UP-PROC.
    PERFORM VARYING OLD-CNT FROM 1 BY 1
              UNTIL OLD-CNT > 5 OR OLD-PUPIL(OLD-CNT) = SPACE
       IF OLD-NUM(OLD-CNT) < ${graduate} THEN
          ［d］
       ELSE
          MOVE SPACE TO OLD-PUPIL(OLD-CNT)
       END-IF
    END-PERFORM.
ENT-ADD-PROC.
    PERFORM VARYING ENT-CNT FROM 1 BY 1
              UNTIL ENT-CNT > 5 OR ENT-NAME(ENT-CNT) = SPACE
       MOVE 1 TO NEW-NUM(ENT-CNT)
       MOVE ENT-NAME(ENT-CNT) TO NEW-NAME(ENT-CNT)
    END-PERFORM.`;
const choicesA = ['NOT (OLD-EOF AND ENT-EOF)','NOT (OLD-EOF OR ENT-EOF)','OLD-EOF AND ENT-EOF','OLD-EOF OR ENT-EOF'];
const choicesBCD = ['ADD 1 TO OLD-NUM(OLD-CNT)','MOVE OLD-ID TO NEW-ID','MOVE OLD-PUPIL(ENT-CNT) TO NEW-PUPIL(NEW-CNT)',
  'MOVE OLD-PUPIL(OLD-CNT) TO NEW-PUPIL(NEW-CNT)','MOVE W-OLD-REC TO W-NEW-REC','PERFORM ENT-ADD-PROC'];

export const q11 = createLanguageDefinition(11, 'COBOLによる保護者名簿の更新','学校と卒業学年', 'abcd2','アオエアイ',
  '昨年度の保護者名簿と新入学児童の保護者名簿を照合する原形式を保持し，学校と卒業学年・図の在校児童例を連動して変更します。', index => {
    const { school, graduate } = cases[index], a = bank(1,'a',choicesA,'ア','cobol'), bcd = {
      ...bank(1,'bcd',choicesBCD,'オエア','cobol'), label: 'b〜d に関する解答群',
    };
    const change = { ...standaloneBank(2, displayLines.map((line,i) => line + '\n' + displayCode[i]),'イ'),
      figures: q11ChoiceFigures.map(figure => figure.block(index)) };
    return { pages: [
      page(38,[
        p('次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
        p('〔プログラムの説明〕'),
        p('ある' + school + 'における保護者名簿の作成プログラムである。昨年度の保護者名簿及び新入学児童（新1年生）の保護者名簿を入力し，本年度の保護者名簿を作成する。'),
        p('(1) 昨年度の保護者名簿及び本年度の保護者名簿は，次のレコード様式の順ファイルである。'),
        q11Older.block(index),
        p('① レコードは，先頭から33けたのデータ（保護者氏名及び電話番号）の昇順に整列されている。'),
        p('② 在校児童欄には，保護者が保護する在校児童の学年と氏名が格納されている。'),
        p('③ 在校児童が複数いる場合，学年で昇順に整列されている。'),
        p('④ 在校児童が4人以下の場合，左詰めで格納され，残りの領域には空白が詰められている。'),
        p('例：' + (graduate - 3) + '年生と' + (graduate - 1) + '年生に在校児童をもつ保護者の場合，次のように格納される。'),
        q11Example.block(index),
        p('(2) 新入学児童の保護者名簿は，次のレコード様式の順ファイルである。'),
        q11Entrants.block(index),
        p('① レコードは，先頭から33けたのデータ（保護者氏名及び電話番号）の昇順に整列されている。'),
        p('② 児童氏名には，保護者が保護する新入学児童の氏名が格納されている。'),
        p('③ 新入学児童が4人以下の場合，左詰めで格納され，残りの領域には空白が詰められている。'),
        p('(3) 1人の保護者が保護する児童は5人を超えないものとする。'),
      ]),
      page(39,[
        p('(4) 在校児童の学年は無条件に1学年繰り上げ，' + graduate + '学年を修了した児童は卒業する。'),
        p('(5) 転入や転出は考慮しない。'),
        p('(6) 保護している在校児童がすべて卒業し，かつ保護する新入学児童がいない場合，その保護者のレコードを削除する。'),
        p('(7) 新入学児童の保護者が未登録だった場合，その保護者のレコードを新規に登録する。'),
        p('〔プログラム〕'), p('（行番号）'), numberedCode(1,data),
      ]),
      page(40,[numberedCode(38,main)]),
      page(41,[numberedCode(84,subroutines(graduate)),p('設問1 プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')],[a,bcd],[1,1]),
      page(42,[p('設問2 保護者名簿から削除される保護者，つまり，昨年度の保護者名簿には登録されていたが，本年度の保護者名簿には登録されない保護者の氏名と電話番号を画面に表示するようにプログラムを改造したい。正しい答えを，解答群の中から選べ。')],[change],[0]),
    ], explanation:
      '両方の入力を読み終えたときに限り照合処理を止めるので，a は NOT (OLD-EOF AND ENT-EOF)。' +
      '昨年度だけにあるなら，在校児童を進級又は卒業させたレコード全体を b で新年度へ転記する。' +
      '両方にあるなら，新入学児童を先に入れ，c で残りの欄に OLD-CNT 位置の児童を転記する。d は' + graduate +
      '年生未満の学年を1増加させる。設問2では，新年度の先頭児童欄が空白で WRITE しない場合に限り氏名と電話番号を表示する。' +
      '53行の後の ELSE は両入力が終端の場合，90行の後は卒業児童ごと，92行の後は進級処理を呼び出した保護者すべてが表示対象になる。',
    };
  });
