import {field,figure,p,programs,strings,variableNotes,type GenerationDefinition} from './definition';
import {legacy2017AutumnPm10Model as model,legacy2017AutumnPm10Profiles as profiles,legacy2017AutumnPm10Figure as inspect,legacy2017AutumnPm10Banks as banks} from './legacy-2017-autumn-pm10-model';
export const legacy2017AutumnPm10Program1=`DATA DIVISION.
FILE SECTION.
FD ACCT-FILE.
01 ACCT-REC.
   02 ACCT-NO     PIC X(8).
   02 ACCT-IN     PIC 9(12).
   02 ACCT-OUT    PIC 9(12).
   02 ACCT-FEE    PIC 9(6).
LINKAGE SECTION.
01 PRM.
   02 PRM-NO      PIC X(8).
   02 PRM-IN      PIC 9(12).
PROCEDURE DIVISION USING PRM.
MAIN-PROC.
    OPEN EXTEND ACCT-FILE.
    INITIALIZE ACCT-REC.
    MOVE PRM-NO TO ACCT-NO.
    MOVE PRM-IN TO ACCT-IN.
    WRITE ACCT-REC.
    CLOSE ACCT-FILE.
    EXIT PROGRAM.`;
export function legacy2017AutumnPm10Program2(day:number){return `DATA DIVISION.
FILE SECTION.
FD ACCT-FILE.
01 ACCT-REC.
   02 ACCT-NO      PIC X(8).
   02 ACCT-IN.
      03 ACCT-I-DATE PIC 9(8).
      03 ACCT-I-TIME.
         04 ACCT-I-HH PIC 9(2).
         04 ACCT-I-MM PIC 9(2).
   02 ACCT-OUT.
      03 ACCT-O-DATE PIC 9(8).
      03 ACCT-O-TIME.
         04 ACCT-O-HH PIC 9(2).
         04 ACCT-O-MM PIC 9(2).
   02 ACCT-FEE     PIC 9(6).
WORKING-STORAGE SECTION.
77 W-HRS          PIC 9(4).
LINKAGE SECTION.
01 PRM1.
   02 PRM-NO       PIC X(8).
   02 PRM-OUT      PIC 9(12).
01 PRM2.
   02 PRM-FEE      PIC 9(6).
PROCEDURE DIVISION USING PRM1, PRM2.
MAIN-PROC.
    OPEN I-O ACCT-FILE.
    MOVE PRM-NO TO ACCT-NO.
    READ ACCT-FILE.
    MOVE PRM-OUT TO ACCT-OUT.
    PERFORM COMP-PROC.
    [a].
    REWRITE ACCT-REC.
    CLOSE ACCT-FILE.
    EXIT PROGRAM.
COMP-PROC.
    COMPUTE W-HRS =
        (FUNCTION INTEGER-OF-DATE(ACCT-O-DATE) * 24 + ACCT-O-HH) [b]
        (FUNCTION INTEGER-OF-DATE(ACCT-I-DATE) * 24 + ACCT-I-HH).
    IF ACCT-I-MM < ACCT-O-MM
        [c]
    END-IF.
    COMPUTE ACCT-FEE = W-HRS * ${day}.`;}
export function legacy2017AutumnPm10Changes(values:number[]){const m=model(values);return[
 ['行番号18と19の間に追加',`77 W-CNT          PIC 9(4).
77 W-IDX          PIC 9(2).
01 W-ACCT-VAL     PIC X(72) VALUE
    "${m.packed.slice(0,36)}
-   "${m.packed.slice(36)}".
01 W-ACCT-TBL REDEFINES W-ACCT-VAL.
   02 W-ACCT      PIC 9(3) OCCURS 24.`],
 ['行番号43を変更',`[d].
PERFORM TEST BEFORE VARYING W-CNT FROM 1 BY 1
    UNTIL [e]
    ADD W-ACCT(W-IDX) TO ACCT-FEE
    ADD 1 TO W-IDX
    IF [f] THEN
        MOVE 1 TO W-IDX
    END-IF
END-PERFORM.`],
] as const;}
export const legacy2017AutumnPm10Definition:GenerationDefinition={source:'2017h29a-fe-pm-10',title:'旧制度・午後：COBOLによる駐車料金の算出',version:'3.2.0',fields:[field('昼間/夜間の同桁課金単価',0,5)],reference:[0],sourceAnswer:'設問1=ア／設問2 a=イ、b=ウ、c=ア／設問3 d=ア、e=イ、f=カ',answerVariation:'fixed',
 notes:variableNotes+' 秋原53〜57全5頁、プログラム1全21行/2全43行、レコード図3個、7独立欄25固有択31参照、全前提/課金例/表1変更2項目を保持。e/fは同じ6択を同順で独立参照し、重複禁止にしない。変えるのは3桁の昼間/夜間単価の6組、24要素72桁文字列/課金例/解説を同期する。1時間単位・1分以上経過で課金・入庫分基準・20〜翌5:59・日跨ぎ・1601年起点・6桁上限・TEST BEFOREを固定。原/基準/生成choiceShuffleAllowed=false。全択は独立した状態モデルと反例で確認し、日付計算はGregorian通日と課金境界イベント列の参照解法へ照合。通常App/schema/registry未登録。',
 build(values){const m=model(values),draw=(i:number,group?:number)=>{const vs=group===undefined?values:[m.v,group],f=inspect(profiles[i],vs);return figure(profiles[i],vs,f.caption,f.alt);};const counts=[3,4,4,4,4,6,6],offsets=[0,3,7,11,15,19,19],answers=[0,1,2,0,0,1,5];return{
 prompt:[p('選択した問題は、選択欄の（選）をマークしてください。マークがない場合は、採点されません。'),p('問10 次のCOBOLプログラムの説明及びプログラムを読んで、設問1〜3に答えよ。'),p('プログラムの説明'),
 p('ある駐車場では、自動精算システムを導入している。利用者は、入庫時に利用番号と入庫時刻が記録された駐車券を受け取り、出庫時に駐車券を精算機に投入して駐車料金を支払う。連続した複数日にまたがる駐車も可能である。プログラム1は入庫時に入庫時刻を精算ファイルに記録するサブプログラムであり、プログラム2は出庫時に駐車料金を計算して出庫時刻とともに精算ファイルに記録し、駐車料金の値を呼出し元に返すサブプログラムである。'),
 p('(1) 精算ファイルは、図1に示すレコード様式の索引ファイルであり、プログラムの実行時に既に存在する。主キーは利用番号である。ファイルの排他制御は適切に行われるものとする。'),draw(0,0),
 p('① 利用番号には、入庫時に発券される駐車券ごとに1ずつ増える8桁の数字が格納される。'),p('② 入庫時刻及び出庫時刻には、西暦の年、月、日と、24時間表記の時（0〜23）、分（0〜59）が、それぞれ4桁、2桁、2桁、2桁、2桁で格納される。'),
 p('(2) プログラム1のパラメタの様式は、図2のとおりである。呼出し元プログラムから利用番号と入庫時刻を受け取る。'),draw(0,1),p('(3) プログラム2のパラメタの様式は、図3のとおりである。呼出し元プログラムから利用番号と出庫時刻を受け取り、駐車料金の値を返す。'),draw(0,2),
 p(`(4) 駐車料金は、入庫時刻を基準に駐車時間を1時間単位に区切って算出する。この単位を課金単位と呼び、1課金単位当たり${m.day}円を課金する。各課金単位の開始時刻の“分”は、入庫時刻と同じ“分”である。各課金単位の開始時刻から1分以上が経過すると課金対象になる。例えば、10時30分に入庫して、11時30分に出庫した場合、課金単位は1で、駐車料金は${m.day}円である。10時30分に入庫して、11時31分に出庫した場合、2時間目の課金単位の開始時刻である11時30分から1分が経過しているので、課金単位は2となり、駐車料金は${m.day*2}円になる。駐車料金が999,999円を超えることはない。`),
 p('(5) プログラム2の中で使用している組込み関数INTEGER-OF-DATEは、引数に指定された日付を西暦1601年1月1日からの通算の日数に変換して返す。'),draw(1),draw(2),
 p('設問1 プログラム1における精算ファイルの呼出し法として正しい答えを、解答群の中から選べ。ここで、括弧内は、呼出し法に対応する環境部のファイル管理記述項におけるACCESS MODE句の書き方である。'),draw(4,0),
 p('設問2 プログラム2中の［　］に入れる正しい答えを、解答群の中から選べ。'),draw(4,1),draw(4,2),draw(4,3),
 p(`設問3 夜間時間帯の料金割引を実施するために、プログラム2を変更する。夜間時間帯は20時00分から翌朝5時59分までとし、各課金単位の開始時刻が夜間時間帯に含まれるときは、1課金単位当たりの課金を${m.night}円とする。表1中の［　］に入れる正しい答えを、解答群の中から選べ。`),draw(3),p('注記 変更内容の各行とも、空白でない最終文字の直後で改行している。行番号18と19の間に追加する変更内容の1桁目は標識領域である。'),draw(4,4),draw(4,5)],
 choices:[...strings([...banks[0]]),...banks.slice(1).flatMap(b=>programs([...b]))],answerParts:counts.map((n,i)=>({id:`part-${i===0?'first':'abcdef'[i-1]}`,label:i===0?'設問1':`設問${i<4?2:3} ${'abcdef'[i-1]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),partAnswers:answers.map((n,i)=>({kind:'choice' as const,partId:`part-${i===0?'first':'abcdef'[i-1]}`,choiceId:`choice-value-${offsets[i]+n+1}`})),
 explanation:`設問1：OPEN EXTENDで末尾へ順に追加するのでSEQUENTIAL。キー指定のREADを行うプログラム2の呼出し法と混同しない。a：計算済みのACCT-FEEを呼出し元PRM-FEEへMOVEする。逆向きでは計算値を失い、ADDは既存値を混ぜ、利用番号のMOVEでは料金を返せない。b：出庫の通算時間から入庫の通算時間を引くので−。積・和・商では経過時間にならない。c：入庫分より出庫分が大きいときは次の課金単位を開始して1分以上経過しているので1を加える。同じ分なら加えず、出庫分が小さければ時間差そのまま。d：表の添字は1から24で、0時は1なので入庫時の時＋1。e：TEST BEFOREでW-CNT=1からW-HRS個を処理するため、終了はW-CNT>W-HRS。等号で終えると最後を処理せず、W-HRS=0でも不適切になる。f：24番目は23時。加算後に25となった時点で1へ戻すのでW-IDX>24。24で戻すと23時を処理できない。72桁の表は24要素各3桁で、0〜5時と20〜23時が${m.night}円、6〜19時が${m.day}円。入庫時刻の分を保って1時間ずつ進む。例の10:30→11:30は1単位${m.day}円、→11:31は2単位${m.day*2}円。原のINITIALIZEで料金は0となり、プログラム2は当該入庫レコードを読み込んで課金・返却・REWRITEする。`,
 };},
};
