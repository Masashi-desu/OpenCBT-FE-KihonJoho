import { p } from './definition';
import { bank, createLanguageDefinition, languageFigure, numbered, page, standaloneBank } from './legacy-2006-autumn-pm-10-13-support';

const conditions=[
  {shipment:100,stock:75,partStocks:[30,60],s1:[2,2,1],s2:[1,3]},
  {shipment:90,stock:70,partStocks:[55,35],s1:[1,3,2],s2:[2,2]},
  {shipment:80,stock:65,partStocks:[50,40],s1:[3,1,2],s2:[1,4]},
  {shipment:110,stock:80,partStocks:[80,45],s1:[2,1,3],s2:[2,2]},
];
function bill(i:number) {
  const {s1,s2}=conditions[i];
  return [
    ['製品S1',[['部品B1',s1[0]],['部品B2',s1[1]],['部品B3',s1[2]]]],
    ['製品S2',[['部品B1',s2[0]],['部品B3',s2[1]]]],
  ] as const;
}
export const q11Bill=languageFigure(11,'components','図　部品展開表の例',i=>{
  const lists=bill(i);
  return {kind:'components',lists,alt:lists.map(([name,children])=>name+'：'+children.map(([id,n])=>id+'（'+n+'）').join('、')).join('。')+'。'};
});
export const q11Table=languageFigure(11,'component-records','表　図に対応する部品展開レコードの例',i=>{
  const rows=bill(i).flatMap(([name,children])=>children.map(([id,n])=>[name.slice(2),id.slice(2),String(n)]));
  return {kind:'table',columns:['製品コード','部品コード','所要個数'],rows,codeColumn:-1,hideHeadings:true,
    alt:'各行は製品コード・部品コード・所要個数。'+rows.map(row=>row.join('｜')).join('、')+'。'};
});
const formats=[
  [['出荷番号',5],['製品コード',8],['出荷数',10]],
  [['資材コード（製品コード又は部品コード）',8],['在庫数',10],['割当て済み数',10]],
  [['製品コード',8],['部品コード',8],['所要個数',5]],
  [['出荷番号',5],['部品コード',8],['発注数',10]],
] as const;
const formatNames=['製品出荷指示ファイル','在庫ファイル','部品展開ファイル','部品注文ファイル'];
export const q11Formats=formats.map((format,j)=>languageFigure(11,'record-format-'+(j+1),formatNames[j]+'のレコード様式',()=>({
  kind:'format',fields:format.map(([text,width])=>({text,width})),...(j===2?{grouping:'部品展開キー'}:{}),
  alt:formatNames[j]+'：'+format.map(([text,width])=>text+' '+width+'けた').join('｜')+(j===2?'。製品コードと部品コードの組が部品展開キー。':'。'),
})));
const changes=[
  ['行番号12と13の間に挿入','05  Z-YOYUU-SU     PIC 9(10).'],
  ['行番号66を置換','COMPUTE W-YUKO-ZSU = ［d］.'],
];
export const q11Change=languageFigure(11,'adjustment','在庫ファイルとプログラムの変更',()=>({
  kind:'table',columns:['処置','変更内容'],rows:changes,codeColumn:1,
  alt:'処置｜変更内容\n'+changes.map(row=>row.join('｜')).join('\n'),
}));

const first=`DATA DIVISION.
FILE SECTION.
FD  SHUKKA-F.
01  SHUKKA-R.
    05  S-SHUKKA-NO   PIC 9(5).
    05  S-SEIHIN-CD   PIC X(8).
    05  S-SHUKKA-SU   PIC 9(10).
FD  ZAIKO-F.
01  ZAIKO-R.
    05  Z-SHIZAI-CD   PIC X(8).
    05  Z-ZAIKO-SU    PIC 9(10).
    05  Z-WARIATE-SU  PIC 9(10).`;
const second=`FD  BUHIN-F.
01  BUHIN-R.
    05  B-BUHIN-KEY.
      10  B-SEIHIN-CD  PIC X(8).
      10  B-BUHIN-CD   PIC X(8).
    05  B-SHOYO-KOSU   PIC 9(5).
FD  CHUMON-F.
01  CHUMON-R.
    05  C-SHUKKA-NO    PIC 9(5).
    05  C-BUHIN-CD     PIC X(8).
    05  C-CHUMON-SU    PIC 9(10).
WORKING-STORAGE SECTION.
01  W-YUKO-ZSU        PIC S9(10).
01  W-HITSUYO-SU      PIC 9(10).
01  W-SEIHIN-SU       PIC 9(10).
01  W-SHUKKA-EOF      PIC 9.
PROCEDURE DIVISION.
MAIN-CTL.
    OPEN INPUT SHUKKA-F BUHIN-F,
         I-O ZAIKO-F, OUTPUT CHUMON-F.
    MOVE 0 TO W-SHUKKA-EOF.
    PERFORM UNTIL W-SHUKKA-EOF = 1
      READ SHUKKA-F
           AT END      MOVE 1 TO W-SHUKKA-EOF
           NOT AT END  PERFORM MRP-PROC
      END-READ
    END-PERFORM.
    CLOSE SHUKKA-F BUHIN-F ZAIKO-F CHUMON-F.
    STOP RUN.
*
MRP-PROC.
    MOVE S-SEIHIN-CD TO Z-SHIZAI-CD.
    MOVE S-SHUKKA-SU TO W-HITSUYO-SU.
    ［a］.
    IF W-HITSUYO-SU > 0 THEN
       MOVE W-HITSUYO-SU TO W-SEIHIN-SU
       MOVE LOW-VALUE    TO B-BUHIN-KEY
       MOVE S-SEIHIN-CD  TO B-SEIHIN-CD
       ［b］
       PERFORM UNTIL B-SEIHIN-CD NOT = S-SEIHIN-CD
         MOVE B-BUHIN-CD TO Z-SHIZAI-CD
         COMPUTE W-HITSUYO-SU =
                  W-SEIHIN-SU * B-SHOYO-KOSU
         PERFORM CHECK-ZAIKO
         PERFORM READ-BUHIN-NEXT
       END-PERFORM
    END-IF.
*`;
const third=`CHECK-ZAIKO.
    READ ZAIKO-F
         INVALID KEY DISPLAY "ZAIKO-INV ERROR"
                     STOP RUN
    END-READ.
    COMPUTE W-YUKO-ZSU = Z-ZAIKO-SU - Z-WARIATE-SU.
    IF W-YUKO-ZSU <= 0 THEN
       PERFORM CHUMON-PROC
    ELSE
       IF W-HITSUYO-SU > W-YUKO-ZSU THEN
          ADD W-YUKO-ZSU TO Z-WARIATE-SU
          PERFORM REWRITE-ZAIKO
          SUBTRACT W-YUKO-ZSU FROM W-HITSUYO-SU
          PERFORM CHUMON-PROC
       ELSE
          ADD W-HITSUYO-SU TO Z-WARIATE-SU
          MOVE 0 TO W-HITSUYO-SU
          PERFORM REWRITE-ZAIKO
       END-IF
    END-IF.
*
START-BUHIN.
    START BUHIN-F ［c］
          INVALID KEY MOVE HIGH-VALUE TO BUHIN-R
          NOT INVALID KEY PERFORM READ-BUHIN-NEXT
    END-START.
*
READ-BUHIN-NEXT.
    READ BUHIN-F NEXT
         AT END MOVE HIGH-VALUE TO BUHIN-R
    END-READ.
*
CHUMON-PROC.
    IF Z-SHIZAI-CD(1:1) = "B" THEN
       MOVE S-SHUKKA-NO TO C-SHUKKA-NO
       MOVE Z-SHIZAI-CD TO C-BUHIN-CD
       MOVE W-HITSUYO-SU TO C-CHUMON-SU
       WRITE CHUMON-R
       MOVE 0 TO W-HITSUYO-SU
    END-IF.
*
REWRITE-ZAIKO.
    REWRITE ZAIKO-R
            INVALID KEY DISPLAY "ZAIKO-INV ERROR"
                        STOP RUN
    END-REWRITE.`;
const steps=['PERFORM CHECK-ZAIKO','PERFORM CHUMON-PROC','PERFORM MRP-PROC','PERFORM READ-BUHIN-NEXT','PERFORM START-BUHIN'];
const positions=['KEY > B-BUHIN-KEY','KEY < B-BUHIN-KEY','KEY = B-BUHIN-KEY','KEY NOT = B-BUHIN-KEY'];
const modes=['ACCESS MODE IS DYNAMIC','ACCESS MODE IS RANDOM','ACCESS MODE IS SEQUENTIAL'];
const reserves=['Z-ZAIKO-SU + Z-WARIATE-SU + Z-YOYUU-SU','Z-ZAIKO-SU + Z-WARIATE-SU - Z-YOYUU-SU',
  'Z-ZAIKO-SU - Z-WARIATE-SU + Z-YOYUU-SU','Z-ZAIKO-SU - Z-WARIATE-SU - Z-YOYUU-SU'];

export const q11=createLanguageDefinition(11,'COBOL：部品展開と在庫割当て','所要個数・在庫・出荷数','abc2d',
  'アオアイエ','部品展開図・索引と複合キー・在庫割当ての原形式を保持し，所要個数と在庫・出荷数を連動。',i=>{
    const {shipment,stock,partStocks,s1,s2}=conditions[i];
    const newUnits=shipment-stock, needs1=newUnits*s2[0], needs3=newUnits*s2[1], order=needs3-partStocks[1];
    const [shipping,inventory,components,orders]=q11Formats.map(panel=>panel.block(i));
    return {pages:[
      page(38,[
        p('次のCOBOLプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
        p('〔プログラムの説明〕'),
        p('製品出荷指示ファイルを読み込み，在庫を調べ，部品展開表を使って製造に必要な部品の個数を計算し，部品注文ファイルを作成するプログラムである。製品は幾つかの部品から構成され，製造工程で組み立てられる。図に部品展開表の例を示す。括弧内の数字は，親の製品を1個製造するために必要な子の部品の個数（以下，所要個数という）である。この例では，製品S1を1個製造するために，部品B1を'+s1[0]+'個，部品B2を'+s1[1]+'個，部品B3を'+s1[2]+'個必要とすることを示す。'),
        q11Bill.block(i),
        p('例えば，製品S2の在庫が'+stock+'個，部品B1の在庫が'+partStocks[0]+'個，部品B3の在庫が'+partStocks[1]+'個あるとき，製品S2を'+shipment+'個出荷するためには，製品S2の在庫'+stock+'個では不足であり，'+newUnits+'（＝'+shipment+'−'+stock+'）個を新たに製造する必要がある。そのために必要な'+needs1+'個の部品B1は，在庫から割り当てることができる。また，部品B3は'+needs3+'（＝'+newUnits+'×'+s2[1]+'）個必要であり，在庫の'+partStocks[1]+'個では不足なので，'+order+'（＝'+needs3+'−'+partStocks[1]+'）個を注文する必要がある。'),
        p('（1）在庫数のうち出荷又は製造のために割り当てた個数を，割当て済み数という。また，在庫数から割当て済み数を引いた個数を，有効在庫数という。'),
        p('（2）製品出荷指示ファイルは順ファイルで，そのレコード様式は次のとおりである。'),
        shipping,
        p('（3）在庫ファイルは索引ファイルで，そのレコード様式は次のとおりである。'),
        inventory,
        p('資材コード（製品コード又は部品コード）をキーとする。製品コードは先頭1けたが“S”，部品コードは先頭1けたが“B”である。'),
      ]),
      page(39,[
        p('（4）部品展開ファイルは索引ファイルで，そのレコード様式は次のとおりである。'),
        components,
        p('① 製品コードと部品コードの組合せをキーとする。\n② 所要個数は，製品コードと部品コードの組合せごとに設定される。\n先の部品展開表の例の図に対応する部品展開レコードの例を，表に示す。'),
        q11Table.block(i),
        p('（5）部品注文ファイルは順ファイルで，そのレコード様式は次のとおりである。'),
        orders,
        p('製品出荷指示ファイルの1レコードごとに必要な部品注文レコードが出力される。'),
        p('（6）すべてのデータに誤りはないものとする。'),
        p('〔プログラム〕\n（行番号）'),
        numbered('cobol',1,first),
      ]),
      page(40,[numbered('cobol',13,second)]),
      page(41,[numbered('cobol',61,third)]),
      page(42,[
        p('設問1 プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
        p('設問2 このプログラムの環境部のファイル管理記述段落で，BUHIN-Fの呼出し法の指定として正しくないものを，解答群の中から選べ。'),
        p('設問3 部品注文ファイルを作成し発注してから，部品が入庫され製品が組み立てられるまでは，出荷遅延が発生することが考えられる。また，予定外の出荷指示に対して，すぐに応じられないという問題も考えられる。これをある程度防ぐため，有効在庫数がある一定の個数（余裕在庫数）以下となった場合に部品注文ファイルを作成するように，在庫ファイルのレコード様式及びプログラムを変更する。［d］に入れる正しい答えを，解答群の中から選べ。'),
        q11Change.block(i),
      ],[bank(1,'ab',steps,'アオ','cobol'),bank(1,'c',positions,'ア','cobol'),
        standaloneBank(2,modes,'イ','cobol'),{...bank(3,'d',reserves,'エ','cobol'),label:'解答群'}],[0,0,1,3]),
    ],explanation:'aで製品の在庫を確認する。在庫で賄えない製品数を所要個数に掛けて，各部品の必要数を得る。bは部品展開ファイルの読取り開始を設定する。'+
      '複合キーの部品コードをLOW-VALUEで初期化したので，cはそのキーより大きい位置から読む。STARTで位置付け，READ NEXTで順に読むため，ランダム呼出しは指定できない。'+
      '余裕在庫数は割当て可能な在庫から残す数である。dでは在庫数から割当て済み数と余裕在庫数の両方を引き，その残りだけを割当てに使う。図の例では部品B3を'+order+'個注文する。'};
  },{answerVariation:'fixed'});
