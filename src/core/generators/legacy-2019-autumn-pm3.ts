import {code,field,figure,p,strings,variableNotes,type GenerationDefinition} from "./definition";
export type Legacy2019LibraryColumn={name:string;key?:"primary"|"foreign"};
export type Legacy2019LibraryTable={name:string;columns:Legacy2019LibraryColumn[]};
/** Reviewed logical schema. Primary/foreign underline marks are source media,
 * not executable DDL. In particular a view's logical key is not SQL ALTER. */
export function legacy2019LibrarySchema(stage:number):Legacy2019LibraryTable[]{
  const pk=(name:string):Legacy2019LibraryColumn=>({name,key:"primary"}),fk=(name:string):Legacy2019LibraryColumn=>({name,key:"foreign"}),n=(name:string):Legacy2019LibraryColumn=>({name});
  const info={name:"書籍情報表",columns:[pk("ISBNコード"),n("書籍名"),n("著者名"),n("出版社名"),n("出版年")]},loans={name:"貸出表",columns:[pk("貸出番号"),fk(stage===0?"ISBNコード":"書籍番号"),n("従業員番号"),n("貸出日"),n("返却予定日"),n("返却日")]};
  if(stage===0)return[info,loans];if(stage!==1)throw Error("PARAMETER_CONSTRAINT");info.columns.push(fk("ラック番号"));
  return[info,loans,{name:"書籍表",columns:[pk("書籍番号"),fk("ISBNコード"),n("購入日")]},{name:"書籍管理ビュー",columns:[pk("ISBNコード"),n("所蔵書籍数"),n("貸出中件数")]},{name:"ラック表",columns:[pk("ラック番号"),n("ラック名")]}];
}
export function legacy2019LibraryFigureAlt(values:number[]){if(values.length!==1||!Number.isInteger(values[0]))throw Error("PARAMETER_CONSTRAINT");return legacy2019LibrarySchema(values[0]).map(t=>`${t.name}（${t.columns.map(c=>c.name+(c.key==="primary"?"［実線下線：主キー］":c.key==="foreign"?"［破線下線：外部キー］":"")).join("、")}）`).join("。")+"。実線の下線付き項目は主キー、破線の下線付き項目は外部キー。";}
const isbn="ISBN978-4-905318-63-7";
export const legacy2019AutumnLibraryDefinitions:GenerationDefinition[]=[{
  source:"2019r01a-fe-pm-3",title:"旧制度・午後：書籍と貸出情報の関係データベース",sourceAnswer:"設問1 a=エ、b=イ／設問2 c=イ／設問3 d=ア、e=カ",
  fields:[field("fiscalStartYear",2017,2019),field("minimumLoans",3,5),field("acquisitionScenario",0,2)],reference:[2018,4,0],
  notes:variableNotes+" 原2019秋午後問3の全5頁、a〜eの5欄/4・4・4・4・6択、2つの主外部キー下線付き構成図、貸出ルール、CASE/MAX/NOT EXISTS/UNION ALLのSQL空欄、期間とGROUP/HAVINGの4コード候補、4要望/4修正、追加表の問いと削除手順4項目/6順列を維持。期間開始年度2017〜2019の3条件、貸出回数閾値3〜5の3条件、追加購入の既存ISBN/新ISBN既存ラック/新ISBN新ラックの3条件、全27入力。期末は翌年3月31日、選択肢の全日付/閾値も連動。新ISBNを加える2改変では書籍情報未登録とラック登録状態を同じ問いの前提へ明示し、必要なINSERT対象表の意味を変える。既存ISBNの書籍を別ラックへ移す操作を暗黙追加しない。元の1ISBN1冊/同日再貸出なし/検索ISBNは所蔵済みという設問1前提は保持し、設問3の変更後の複数冊設計と区別する。aの原ア/イ/ウはいずれもNULL時の意味が逆であり、問いの貸出中/可を反転して複数正答にしない。a/b/eは元の固定正答の役割を保ち、cの抽出/集約条件とdの必要表の意味を変える。図のキー表示は論理構成でありビューへ物理PRIMARY KEYをDDL定義したと主張しない。",
  build:v=>{
    const bounds=[[2017,2019],[3,5],[0,2]];if(v.length!==3||v.some((n,i)=>!Number.isInteger(n)||n<bounds[i][0]||n>bounds[i][1]))throw Error("PARAMETER_CONSTRAINT");
    const[year,minimum,scenario]=v,start=`${year}-04-01`,end=`${year+1}-03-31`;
    const acquisition=["既に所蔵している書籍とISBNコードが同じ書籍を追加購入した場合に","書籍情報表に未登録の新しいISBNコードの書籍を購入し、既にラック表に登録されているラックへ保管する場合に","書籍情報表に未登録の新しいISBNコードの書籍を購入し、保管先のラックも新設して新たなラック番号をラック表へ登録する場合に"][scenario];
    const choices=[
      ...["貸出表.返却日 IS NOT NULL THEN '貸出中' ELSE '貸出可'","貸出表.返却日 IS NOT NULL THEN '貸出中'\n  WHEN 貸出表.返却日 IS NULL THEN '貸出可'","貸出表.返却日 IS NULL THEN '貸出可' ELSE '貸出中'","貸出表.返却日 IS NULL THEN '貸出中'\n  WHEN 貸出表.返却日 IS NOT NULL THEN '貸出可'"].map(s=>[code(s,"sql")]),
      ...["DISTINCT 貸出表.貸出日","MAX(貸出表.貸出日)","MIN(貸出表.貸出日)","貸出表.貸出日"].map(s=>[code(s,"sql")]),
      ...[`AND (貸出表.貸出日 >= '${start}' OR 貸出表.貸出日 <= '${end}')\nGROUP BY 書籍情報表.ISBNコード, 書籍情報表.書籍名\nHAVING COUNT(*) >= ${minimum}`,
        `AND 貸出表.貸出日 BETWEEN '${start}' AND '${end}'\nGROUP BY 書籍情報表.ISBNコード, 書籍情報表.書籍名\nHAVING COUNT(*) >= ${minimum}`,
        `AND 貸出表.貸出日 >= '${start}' AND 貸出表.貸出日 <= '${end}'\n  AND COUNT(*) >= ${minimum}`,
        `GROUP BY 書籍情報表.ISBNコード, 書籍情報表.書籍名, 貸出表.貸出日\nHAVING 貸出表.貸出日 >= '${start}' AND 貸出表.貸出日 <= '${end}'\n  AND COUNT(*) >= ${minimum}`].map(s=>[code(s,"sql")]),
      ...strings(["書籍表","書籍表及びラック表","書籍情報表及び書籍表","書籍情報表、書籍表及びラック表"]),
      ...strings(["② → ① → ③ → ④","② → ① → ④ → ③","② → ③ → ① → ④","② → ③ → ④ → ①","② → ④ → ① → ③","② → ④ → ③ → ①"]),
    ];
    const prompt=[
      p("旧制度・午後 問3。書籍及び貸出情報を管理する関係データベースの設計及び運用に関する次の記述を読んで、設問1〜3に答えよ。"),
      p("D社の部署である資料室は、業務に関連する書籍を所蔵しており、従業員への貸出しを2015年4月から実施している。"),
      p("所蔵する書籍を管理するデータベースは、書籍の情報を管理する書籍情報表と貸出状況を管理する貸出表とで構成されている。データベース構成を、図1に示す。下線付きの項目は主キーを表し、下破線付きの項目は外部キーを表す。各書籍は1冊しか所蔵していない。"),
      figure("legacy-2019-autumn-pm3-library-schema",[0],"図1 データベース構成",legacy2019LibraryFigureAlt([0])),
      p("［貸出表に関する説明］"),
      p("(1) 従業員に書籍を貸し出す際は、一意の貸出番号、貸し出す書籍のISBNコード、従業員番号、貸出日及び返却予定日を設定し、返却日にはNULLを設定したレコードを追加する。"),
      p("(2) 書籍が返却されたら、対象のレコードの返却日に返却された日付を設定する。"),
      p(`設問1 次のSQL文は、ISBNコードが${isbn}の書籍の貸出状況を表示するSQL文である。ISBNコードで貸出表を検索し、最も新しい貸出日のレコードの返却日にNULLが設定されている場合は、『貸出中』が表示される。また、最も新しい貸出日のレコードの返却日に日付が設定されている場合、及び貸出実績のない書籍の場合は、『貸出可』が表示される。［a］、［b］に入れる正しい答えを、解答群の中から選べ。ここで、検索に使用するISBNコードの書籍は必ず所蔵されているものとする。また、返却された書籍はその日のうちに再び貸し出されることはない。`),
      code(`SELECT 貸出表.ISBNコード,\n  CASE WHEN ［a］\n  END AS 書籍状態\nFROM 貸出表\nWHERE 貸出表.ISBNコード = '${isbn}'\n  AND 貸出表.貸出日 = (SELECT ［b］ FROM 貸出表\n    WHERE 貸出表.ISBNコード = '${isbn}')\nUNION ALL\nSELECT DISTINCT 書籍情報表.ISBNコード, '貸出可' AS 書籍状態\nFROM 書籍情報表\nWHERE 書籍情報表.ISBNコード = '${isbn}'\n  AND NOT EXISTS (SELECT 貸出表.ISBNコード FROM 貸出表\n    WHERE 貸出表.ISBNコード = '${isbn}')`,"sql"),
      p(`設問2 ${year}年4月1日から${year+1}年3月31日までの間に${minimum}回以上貸し出した書籍の一覧を取得することにした。次のSQL文の［c］に入れる正しい答えを、解答群の中から選べ。`),
      code("SELECT 書籍情報表.ISBNコード, 書籍情報表.書籍名, COUNT(*) AS 貸出回数\nFROM 書籍情報表, 貸出表\nWHERE 書籍情報表.ISBNコード = 貸出表.ISBNコード\n［c］","sql"),
      p("設問3 従業員と資料室担当者の利便性を向上させる目的で、所蔵する書籍を管理するデータベースを再構築することにした。"),
      p("データベースの再構築に当たり、従業員と資料室担当者から要望が出された。次の記述中の［d］、［e］に入れる適切な答えを、解答群の中から選べ。"),
      p("［従業員と資料室担当者からの要望］"),
      p("要望1 ISBNコードが同じ書籍を複数冊所蔵できるようにしたい。"),p("要望2 書籍の購入日を管理できるようにしたい。"),p("要望3 ISBNコードごとに所蔵する書籍数及び貸出し中の書籍数（以下、貸出中件数という）が分かるようにしたい。"),p("要望4 ISBNコードが同じ書籍は同じラックに保管して、書籍が収納されているラックが分かるようにしたい。"),
      p("従業員と資料室担当者からの要望を反映したデータベース構成案を、図2に示す。下線付きの項目は主キーを表し、下破線付きの項目は外部キーを表す。"),
      figure("legacy-2019-autumn-pm3-library-schema",[1],"図2 要望を反映したデータベース構成案",legacy2019LibraryFigureAlt([1])),
      p("［要望に対するデータベース修正内容］"),
      p("修正1 要望1に対応するために書籍表を追加して、資料室で所蔵している各書籍に一意の書籍番号を割り振って、それを主キーとした。また、貸出表のISBNコードを、書籍番号に変更した。"),
      p("修正2 要望2に対応するために書籍表に購入日を設けた。"),p("修正3 要望3に対応するために書籍管理ビューを追加した。"),p("修正4 要望4に対応するためにラック表を追加して、書籍情報表に外部キーとしてラック番号を追加した。"),
      p(`要望を反映したデータベース構成案では、${acquisition}、レコードを追加する必要のある表は［d］である。`),
      p("また、需要がなくなった書籍を廃棄する場合は、ISBNコードが同じ書籍を全て廃棄する。データベースに対して行う操作は、次の①〜④を、［e］の順序で行う必要がある。"),
      p("① 書籍情報表の主キーが対象ISBNコードのレコードを削除する。"),p("② 書籍表から対象ISBNコードに対応する書籍番号を抽出する。"),p("③ 書籍表の対象ISBNコードに対応するレコードを削除する。"),p("④ 貸出表の対象書籍番号に対応するレコードを削除する。"),
    ];
    const counts=[4,4,4,4,6],offsets=[0,4,8,12,16],answers=[3,1,1,[0,2,3][scenario],5],names=["設問1 a","設問1 b","設問2 c","設問3 d","設問3 e"];
    return{prompt,choices,answerParts:counts.map((n,i)=>({id:`part-${"abcde"[i]}`,label:names[i],choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),partAnswers:answers.map((a,i)=>({kind:"choice" as const,partId:`part-${"abcde"[i]}`,choiceId:`choice-value-${offsets[i]+a+1}`})),
      explanation:`a：返却日がNULLなら未返却なので『貸出中』、日付があれば『貸出可』となるCASEが必要である。他の3候補はこの対応を逆にしている。b：対象ISBNに絞ってMAX(貸出表.貸出日)を求めれば最も新しい貸出日が得られる。同日に再貸出しがないので最新日は一意である。MINは最も古い履歴、DISTINCTや集約しない貸出日は複数履歴のとき単一値にならない。貸出履歴がない所蔵書籍はNOT EXISTS側がUNION ALLで『貸出可』の1行を返す。c：貸出日が${start}から${end}の両端を含む範囲にある行を抽出し、ISBNコードと書籍名でまとめ、HAVING COUNT(*) >= ${minimum}で集約した貸出回数を条件判定する。ORの範囲条件は期間外も残し、WHEREで集約結果を条件にする候補は処理段階が違う。貸出日までグループキーにすると、同日再貸出しがない前提ではISBNごとの各日が1回となり、期間全体の回数にならない。d：${scenario===0?"既存ISBNは書籍情報とラックの登録があるので、新しい物理的な1冊の書籍表だけを追加する。":scenario===1?"新ISBNの書籍情報表と物理的な1冊の書籍表を追加する。ラックは既に登録されているので追加しない。":"新ISBNの書籍情報表、新しい物理的な1冊の書籍表、新設するラック表に追加する。"}書籍管理ビューは表の更新を参照する派生情報であり、ここで直接追加する表ではない。e：②で書籍番号を取り出した後、その番号を参照する貸出表を④で先に削除し、③で書籍表、①でISBNの書籍情報表を削除する。子行を残したまま親行を削除する順序は参照制約を満たさず、書籍番号の抽出前に書籍表を消すと削除対象の対応を失う。従って② → ④ → ③ → ①となる。`};
  },
}];
