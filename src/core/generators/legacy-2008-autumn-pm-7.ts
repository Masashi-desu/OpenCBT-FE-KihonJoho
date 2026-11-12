import {code,p,table} from './definition';
import {bank,createDefinition} from './legacy-2008-autumn-pm-06-09-support';
import {drawing} from './legacy-2008-autumn-pm-06-09-figures';
import {copyAt,copyDepartments,copyHeader} from './legacy-2008-autumn-pm-7-model';

const fields=table('図1　利用実績ファイルのレコード様式',['利用日','利用部署','使用枚数','両面使用'],
  [['（8けた）','（1けた）','（4けた）','（1けた）']]);
export const copyDeclarations=(index:number)=>` 1  DATA DIVISION.
 2  FILE SECTION.
 3  FD  COPY-FILE.
 4  01  CP-REC.
 5      02  CP-DATE       PIC X(8).
 6      02  CP-DEPT       PIC 9(1).
 7      02  CP-CNT        PIC 9(4).
 8      02  CP-BOTH       PIC 9(1).
 9  WORKING-STORAGE SECTION.
10  01  TOTAL.
11      02  DEPT-TOTAL    PIC 9(4) OCCURS 5 VALUE ZERO.
12  77  READ-FLAG         PIC X(1) VALUE SPACE.
13      88  DATA-EOF      VALUE "E".
14  77  DEPT-CNT          PIC 9(2).
15  77  MARK-CNT          PIC 9(2).
16  77  HEADER            PIC X(47) VALUE
17      "${copyHeader(index)}".
18  01  DEPT              PIC X(40) VALUE
19      "${copyDepartments.map(name=>name.padEnd(8)).join('').trimEnd()}".
20  01  DEPT-HEADER REDEFINES DEPT.
21      02  DEPT-NAME     PIC X(8) OCCURS 5.
22  77  MARKER            PIC X(30) VALUE ALL "*".`;
export const copyProcedure=`23  PROCEDURE DIVISION.
24  MAIN-PROC.
25      OPEN INPUT COPY-FILE.
26      PERFORM UNTIL DATA-EOF
27          READ COPY-FILE AT END SET DATA-EOF TO TRUE
28                         NOT AT END PERFORM CNT-PROC
29          END-READ
30      END-PERFORM.
31      CLOSE COPY-FILE.
32      PERFORM PRT-PROC.
33      STOP RUN.
34  CNT-PROC.
35      ［a］.
36  PRT-PROC.
37      DISPLAY HEADER.
38      PERFORM VARYING DEPT-CNT FROM 1 BY 1 UNTIL DEPT-CNT > 5
39          IF DEPT-TOTAL(DEPT-CNT) NOT = ZERO THEN
40              ［b］
41              DISPLAY DEPT-NAME(DEPT-CNT) MARKER(1:MARK-CNT)
42          ELSE
43              DISPLAY DEPT-NAME(DEPT-CNT)
44          END-IF
45      END-PERFORM.`;
const show=(value:number)=>value.toLocaleString('en-US');
export const q7=createDefinition(7,'COBOL：コピー用紙の部署別集計','棒の単位・月間上限・両面使用率の基準',
  'aイ bウ cウ dア',
  '順ファイルの順次読込み、両面印刷1枚の数え方、部署コード、上限、五部署の棒・切上げ、全45行、追加位置と比率の4欄を維持する。目盛と上限を連動し、警告閾値と図の表示を変更する。',
  index=>{
    const {unit,limit,maximum}=copyAt(index);
    return {
      pages:[
        {number:27,blocks:[
          p('問7　次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('ある事業所では，環境活動の一環としてコピー用紙の削減を目標にかかげ，部署ごとの使用状況を月ごとに集計し，公開することにした。この事業所では，両面コピー機能がある1台のコピー機をすべての部署で共用している。このプログラムは，コピー機に記録された稼働情報を集計する。'),
          p('(1) コピー機の利用者は，部署ごとに配布されたICカードをコピー機にセットする。コピー機はセットされたICカードから利用部署を読み取り，内部に記録する。'),
          p('(2) 利用実績ファイル COPY-FILE は，コピー機に記録された情報から集計月分を抽出した，図1に示すレコード様式の順ファイルである。'),
          fields,
          p('① コピー機の利用1回に対して，1レコードが生成される。'),
          p('② 利用日には，西暦年が4けた，月及び日がそれぞれ2けたで格納される。'),
          p('③ 利用部署には，第1営業部，第2営業部，第1開発部，第2開発部，管理部の順に，それぞれ1から5まで割り振られた1けたの部署コードが格納される。'),
          p('④ 使用枚数には，使用したコピー用紙の枚数が格納される。両面コピー機能を利用して両面に印刷した場合でも1枚と数える。'),
          p('⑤ 両面コピー機能を利用した場合は両面使用に1が設定され，利用しなかった場合は0が設定される。'),
          p('(3) コピー用紙の使用量は，1部署当たり合計で毎月'+show(maximum)+'枚以下とする。'),
        ]},
        {number:28,blocks:[
          p('(4) 集計結果の表示例を図2に示す。'),drawing('7-output',index),
          p('① 利用部署の，第1営業部，第2営業部，第1開発部，第2開発部，管理部は，それぞれSales-1，Sales-2，Dev-1，Dev-2，Adminと表示する。'),
          p('② 部署ごとに月ごとの使用枚数を集計して，'+unit+'枚を＊印一つとした棒グラフで表示する。ただし，'+unit+'枚に満たない分は切り上げる。'),
          p('〔プログラム〕（行番号）'),code(copyDeclarations(index),'cobol'),
        ]},
        {number:29,blocks:[code(copyProcedure,'cobol'),p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。')],banks:[
          bank('ab',[
            'ADD 1 TO DEPT-TOTAL(CP-DEPT)','ADD CP-CNT TO DEPT-TOTAL(CP-DEPT)',
            'COMPUTE MARK-CNT = (DEPT-TOTAL(DEPT-CNT) + '+(unit-1)+') / '+unit,
            'COMPUTE MARK-CNT = DEPT-TOTAL(DEPT-CNT) / '+unit,
            'MOVE CP-CNT TO DEPT-TOTAL(CP-DEPT)','MOVE DEPT-TOTAL(DEPT-CNT) TO MARK-CNT',
          ],'イウ','cobol',1),
        ]},
        {number:30,blocks:[
          p('設問2　両面コピー機能を利用した枚数の比率を計算し，'+limit+'%未満の場合は図3のように棒の右端に“(!)”を表示するように，プログラムを変更する。次の表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          drawing('7-marked',index),drawing('7-changes',index),
        ],banks:[
          bank('c',['行番号30と31','行番号31と32','行番号35と36','行番号37と38'],'ウ',undefined,2,'cに関する解答群'),
          bank('d',[
            'COMPUTE BOTH-RATE =\n    DEPT-BOTH(DEPT-CNT) * 100 / DEPT-TOTAL(DEPT-CNT)',
            'COMPUTE BOTH-RATE = DEPT-BOTH(DEPT-CNT) / 100',
            'COMPUTE MARK-CNT = DEPT-TOTAL(DEPT-CNT) / '+unit,
            'MOVE DEPT-BOTH(DEPT-CNT) TO BOTH-RATE','MOVE DEPT-TOTAL(DEPT-CNT) TO MARK-CNT',
          ],'ア','cobol',2,'dに関する解答群'),
        ]},
      ],
      explanation:[
        'a：有効な1レコードが読まれるたび，部署 CP-DEPT の合計にその使用枚数 CP-CNT を加える。',
        'b：MARK-CNT は整数。正の合計に'+(unit-1)+'を足して'+unit+'で割り，小数部を切り捨てると，'+unit+'枚未満の端数を切り上げた棒の長さになる。合計0の部署は名前だけを表示する。',
        'c：CNT-PROC 内の行35の直後に置けば，正しく読めた各レコードを1回だけ集計できる。EOF後や印字時に置くとレコード単位にならない。',
        'd：両面利用の枚数×100÷部署の総使用枚数で百分率を求める。総数0は行39で分けている。'+limit+'%未満にだけ“(!)”が付き，ちょうど'+limit+'%なら付かない。',
      ].join('\n'),
    };
  });
