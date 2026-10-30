import type {Block} from "../types";
import {code,field,p,strings,table,variableNotes,type GenerationDefinition} from "./definition";
/** Tenths are kept as integers, including every translated display value. */
const fixedStats=[[1532,1695,1402,473,713,421],[1528,1682,1404,481,731,436],[1532,1799,1428,532,896,456],[1541,1801,1393,504,932,411]];
export const legacy2019AfternoonDatabaseDefinitions:GenerationDefinition[]=[{
  source:"2019h31h-fe-pm-3",title:"旧制度・午後：定期健康診断の関係データベース",sourceAnswer:"設問1 a=ア、b=ウ、c=ア／設問2 d=エ、e=ウ／設問3 f=ア",
  fields:[field("decade",0,2),field("selectedSex",0,1),field("yearOrder",0,1),field("gradeOrder",0,1),field("heightTranslation",-1,1)],reference:[0,0,0,0,0],
  notes:variableNotes+" 原2019春午後問3の全5頁、6解答欄a〜f、6/5/4/5/5/6択、2表DDL・ビューDDL・集計SQL・体格推移表・身長階級表・誤った度数分布表・外部結合SQLを維持。3つの10年範囲、男/女、年度/学年の昇降順各2条件、身長統計と階級境界の±5cm移動3条件を同じ位置へバインドする全72入力。10年をLIKEで選ぶ対象条件とORDER BYの処理及び正答の意味が変わり、名前や択順だけの変更ではない。図1の省略行とSQL出力順の注記、四捨五入桁、DECIMALの精度/位取り、CASE変換、複合主キー/参照制約、右外部結合のON句条件とNULL補完、COUNT(*)の誤りを解答前へ保持する。方向を降順にした生成では図1の先頭側端年を一行、末尾側端年を三学年で示し、設問3が参照する年も末尾側端年に連動する。原にない受診者の全実データを捏造して統計の検算済みと称さず、示された集計値・制約・SQLの意味と独立反例を検査する。原PDFは画像のみであり、CASE ELSEとbオの引用符内の横線の元Unicodeは特定できない。生成側では両方を長音符ー（U+30FC）へ統一した改変表記とし、原と同一Unicodeと断定しない。原問題は元画像を保持する。",
  build:v=>{
    const bounds=[[0,2],[0,1],[0,1],[0,1],[-1,1]];if(v.length!==5||v.some((n,i)=>!Number.isInteger(n)||n<bounds[i][0]||n>bounds[i][1]))throw Error("PARAMETER_CONSTRAINT");
    const [decade,sex,yearOrder,gradeOrder,translation]=v,firstYear=2010+decade*10,lastYear=firstYear+9,prefix=String(firstYear).slice(0,3),gender=sex?"女":"男",genderText=sex?"女子":"男子",shift=translation*50;
    const startYear=yearOrder?lastYear:firstYear,targetYear=yearOrder?firstYear:lastYear,grades=gradeOrder?[3,2,1]:[1,2,3];
    const stats=(row:number)=>fixedStats[row].map((n,i)=>((n+(i<3?shift:0))/10).toFixed(1));
    const rows=[[String(startYear),String(grades[0]),gender,...stats(0)],Array(9).fill("⋮"),...grades.map(grade=>[String(targetYear),String(grade),gender,...stats(grade)])];
    const cuts=Array.from({length:6},(_,i)=>1400+shift+100*i),classNames=[`${cuts[0]/10}cm未満`,...cuts.slice(0,-1).map((low,i)=>`${low/10}cm以上${cuts[i+1]/10}cm未満`),`${cuts[5]/10}cm以上`];
    const classes=classNames.map((name,i)=>[name,((i?cuts[i-1]:0)/10).toFixed(1),((i<6?cuts[i]-1:9999)/10).toFixed(1)]);
    const maximum=(1801+shift)/10,emptyBoundary=cuts[5]/10;
    const prompt:Block[]=[
      p("旧制度・午後 問3。定期健康診断のデータが登録されているデータベースに関する次の記述を読んで、設問1〜3に答えよ。"),
      p("D中学校では、年に1回、定期健康診断を実施し、結果をデータベースに登録している。"),
      p("身長と体重の測定結果は、身長の単位はcm、体重の単位はkgとして、いずれも0.1刻みで健診結果表に登録している。定期健康診断を受ける生徒の生年月日、性別などの属性情報は、受診者情報表に登録している。"),
      p("健診結果表を作成するSQL文の一部と、受診者情報表を作成するSQL文を次に示す。"),
      code("CREATE TABLE 健診結果表 (\n  年度 CHAR(4),\n  受診者ID CHAR(10),\n  学年 INT,\n  身長 DECIMAL(4, 1),\n  体重 DECIMAL(4, 1),\n  ⋮\n  肺活量 INT,\n  PRIMARY KEY(年度, 受診者ID),\n  FOREIGN KEY(受診者ID)\n    REFERENCES 受診者情報表(受診者ID)\n)","sql"),
      code("CREATE TABLE 受診者情報表 (\n  受診者ID CHAR(10),\n  氏名 VARCHAR(50),\n  ふりがな VARCHAR(50),\n  生年月日 DATE,\n  性別 SMALLINT,\n  特記事項 VARCHAR(512),\n  PRIMARY KEY(受診者ID)\n)","sql"),
      p("ここで、DECIMAL(x, y)は固定小数点数を扱うデータ型であり、xは精度であって、表示する数全体の桁数を示し、yは位取りであって、小数点以下の数字の桁数を示す。例えば、データベースに175.5を登録するには、xには4を、yには1を指定する。"),
      p("健診結果表及び受診者情報表のデータ（以下、定期健康診断データという）から、身長と体重を統計データとして参照するために、測定結果ビューを使用する。測定結果ビューを作成するSQL文を次に示す。"),
      code("CREATE VIEW 測定結果ビュー (年度, 学年, 性別, 生年月日, 身長, 体重) AS\n  SELECT 健診結果表.年度, 健診結果表.学年,\n    CASE 受診者情報表.性別\n      WHEN 0 THEN '男'\n      WHEN 1 THEN '女'\n      ELSE 'ー'\n    END,\n    受診者情報表.生年月日, 健診結果表.身長, 健診結果表.体重\n  FROM 健診結果表, 受診者情報表\n  WHERE 健診結果表.受診者ID = 受診者情報表.受診者ID","sql"),
      p(`設問1 ${firstYear}年度から${lastYear}年度までの定期健康診断データを基に、${genderText}生徒の体格の推移を見る。次のSQL文の実行結果を用いて、図1に示す体格推移表を作成した。平均身長と平均体重は小数第2位を四捨五入した値である。SQL文中の［a］〜［c2］に入れる正しい答えを、解答群の中から選べ。ここで、c1とc2に入れる答えは、cに関する解答群の中から組合せとして正しいものを選ぶものとする。`),
      code("SELECT 年度, 学年, 性別,\n  AVG(身長) AS 平均身長, MAX(身長) AS 最大身長, MIN(身長) AS 最小身長,\n  AVG(体重) AS 平均体重, MAX(体重) AS 最大体重, MIN(体重) AS 最小体重\nFROM 測定結果ビュー WHERE 年度 ［a］ AND 性別 = ［b］\nGROUP BY 年度, 学年, 性別\nORDER BY 年度 ［c1］, 学年 ［c2］","sql"),
      table("図1 体格推移表",["年度","学年","性別","平均身長","最大身長","最小身長","平均体重","最大体重","最小体重"],rows),
      p("注記 行の並び順はSQL文の出力順と同じである。"),
      p("設問2 次の記述中の［d］、［e］に入れる正しい答えを、解答群の中から選べ。"),
      p("D中学校では、転入生を受け入れる場合、転出元の中学校から受領した定期健康診断の結果の情報をデータベースに登録する。健診結果表には、受診者IDと年度に［d］制約を設定し、受診者IDに受診者情報表の受診者IDへの［e］制約を設定している。この制約に従うと、転入生の定期健康診断の結果の情報の健診結果表への登録は、受診者情報表に転入生の情報を登録した後に行う必要がある。"),
      p("設問3 次の記述中の［f］に入れる正しい答えを、解答群の中から選べ。"),
      p(`図2に示す身長階級表を作成し、これに対応させて、${targetYear}年度の${genderText}生徒の定期健康診断データを基に、図3に示す身長度数分布表を作成したところ、『人数が相違している』との指摘があった。`),
      table("図2 身長階級表",["身長階級","階級下限","階級上限"],classes),
      table("図3 身長度数分布表",["身長階級","人数"],classNames.map((name,i)=>[name,String([3,104,302,182,32,1,1][i])])),
      p("図3に示す身長度数分布表の作成は、次の(1)〜(3)の手順で行った。(1) 図2に示す身長階級表をデータベースに作成した。(2) 新たなSQL文を作成した。(3) (2)で作成したSQL文の実行結果を用いて、図3に示す身長度数分布表を作成した。"),
      p("調査の結果、(2)で作成したSQL文に誤りがあることが分かった。(2)で作成したSQL文は、次のとおりである。このSQL文は、対象とした全生徒を必ずいずれかの身長区分に分類して集計するために、身長階級表からは全レコードを、測定結果ビューからはON句に指定した結合条件に一致するレコードを抽出している。"),
      code(`SELECT 身長階級, 階級下限, COUNT(*) AS 人数\nFROM 測定結果ビュー RIGHT OUTER JOIN 身長階級表 ON\n  身長 BETWEEN 階級下限 AND 階級上限\n  AND 年度 = '${targetYear}'\n  AND 性別 = '${gender}'\nGROUP BY 身長階級, 階級下限, 階級上限\nORDER BY 階級下限 ASC`,"sql"),
      p(`図1を見ると、${targetYear}年度は${genderText}全学年での最大身長が${maximum.toFixed(1)}cmであり、${emptyBoundary}cm以上の生徒は存在しないが、図3の身長度数分布表では、${emptyBoundary}cm以上の人数が1となっている。この原因は、(2)で作成したSQL文では［f］とすべき箇所をCOUNT(*)としていることである。その結果、測定結果ビューと身長階級表を結合した結果において、NULLとなっているレコードもカウントしているからである。`),
    ];
    const choices:Block[][]=[...strings([`LIKE '${prefix}_'`,`LIKE '${firstYear}'`,`LIKE '${lastYear}'`,`= '${prefix}%'`,`= '${prefix}_'`,`= '${prefix}*'`]),...strings(["0","1","'男'","'女'","'ー'"]),...[ ["ASC","ASC"],["ASC","DESC"],["DESC","ASC"],["DESC","DESC"] ].map(row=>[table("cに関する解答群",["c1","c2"],[row])]),...strings(["UNIQUE","検査","参照","主キー","非NULL"]),...strings(["UNIQUE","検査","参照","主キー","非NULL"]),...strings(["COUNT(身長)","COUNT(身長階級)","MAX(身長)","MAX(身長階級)","身長","身長階級"])];
    const counts=[6,5,4,5,5,6],offsets=[0,6,11,15,20,25],answers=[0,sex?3:2,yearOrder*2+gradeOrder,3,2,0],labels=["設問1 a","設問1 b","設問1 c（c1・c2）","設問2 d","設問2 e","設問3 f"];
    return{prompt,choices,answerParts:counts.map((count,i)=>({id:`part-${"abcdef"[i]}`,label:labels[i],choiceIds:Array.from({length:count},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),partAnswers:answers.map((a,i)=>({kind:"choice" as const,partId:`part-${"abcdef"[i]}`,choiceId:`choice-value-${offsets[i]+a+1}`})),
      explanation:`a：年度はCHAR(4)の文字列である。LIKE '${prefix}_' の下線は任意の1文字に一致するので、${firstYear}〜${lastYear}の10年度を抽出する。LIKEで単一年度を指定する二択は10年全体を選ばず、等号比較の三択では%、_、*は一致条件のワイルドカードにならない。b：ビューでは元表の数値0/1をCASEで文字列の男/女へ変換している。${genderText}を抽出する条件は性別 = '${gender}'。数値0/1は元表の値であり、反対の性別や未定義を表すーとも異なる。c：図1は年度${yearOrder?"降順":"昇順"}、同じ年度の学年${gradeOrder?"降順":"昇順"}なので、${yearOrder?"DESC":"ASC"}と${gradeOrder?"DESC":"ASC"}の組合せになる。d：PRIMARY KEY(年度, 受診者ID)は二列の組を一意かつ非NULLにする複合主キー制約。UNIQUEだけ又は非NULLだけとは同じではない。e：FOREIGN KEY ... REFERENCESは参照制約であり、親の受診者情報が先に必要になる。検査制約・主キー・非NULL・UNIQUEはこの親行の存在を指定しない。f：右外部結合では、対応する生徒がいない${emptyBoundary}cm以上の階級も残り、測定結果ビュー側の値はNULLになる。COUNT(*)はこの補完行を1行と数える。COUNT(身長)なら、実際に対応したNULLでない身長だけを数え、空の階級を0にできる。COUNT(身長階級)は右表の階級名があるので補完行も数える。MAXは最大値を求める処理であり人数を求めず、単独の列名はこの人数の集約式にならない。`};
  },
}];
