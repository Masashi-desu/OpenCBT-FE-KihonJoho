/** Spring2019 PM5 whole major; annual preparation,shared registry pending. */
import{p,figure,field,variableNotes,type GenerationDefinition}from'./definition';
import{legacy2019InspectionSource as s,legacy2019InspectionModel,legacy2019InspectionFigureAlt}from'./legacy-2019-pm-inspection-model';
export const legacy2019AfternoonInspectionDefinitions:GenerationDefinition[]=[{
 source:'2019h31h-fe-pm-5',title:'旧制度・午後：農産物の検査管理システム',sourceAnswer:'aカ bオ cエ dイ eオ',version:'3.2.0',answerVariation:'fixed',
 fields:[field('申込DBへ混入する他DB情報',0,1),field('誤った先頭の申込者API',0,1)],reference:[0,0],
 notes:variableNotes+' 原全7頁の5欄24固有30参照、b/c共用6ID、図1の全8アクセス、図2の5枠18項目/PK下線/空欄、表1全7API、図3/4全画面と注記を保持。aの誤った他DB情報とeの誤った先頭APIの引数機構を同役割で変える。原の最低回数/単一農産物ID入力/全正答を固定し、検査ID入力案は採用しない。図は管理描画へ置換した改変。表1は原1header行/4logicalcol/21subrowの結合構造、get/listの仕様を保つ。共通擬似言語p3/4は不使用。',
 build(values){
 const m=legacy2019InspectionModel(values),fig=(name:string,caption:string)=>figure('legacy-2019-inspection-'+name,[0],caption,legacy2019InspectionFigureAlt(name)),offsets=[0,6,6,12,19],counts=[6,6,6,7,5],correct=[5,4,3,1,4];
 const all=[...m.a,...m.bc,...m.d.map(String),...m.e.map(x=>x.join(', '))],foreign=values[0]?'利用者情報（利用者IDとパスワード）':'認証情報（アクセスID、利用者ID、ログイン日時、最終アクセス日時）';
 return{prompt:[
 p('旧制度・午後 問5。農産物の検査管理システムに関する次の記述を読んで、設問1〜3に答えよ。'),
 p('原冊子の選択欄に関する注意：'+s.page23.selectionNotice),p(s.page23.introduction),p('［農産物検査の業務手順］'),...s.page23.workflow.map((t,i)=>p('（'+(i+1)+'）'+t)),
 p('［検査管理システムの構成］'),p(s.page23.system),p(s.page24.authentication),fig('architecture',s.page24.figure1.caption),
 p('［検査管理システムが管理する情報］'),p(s.page24.ownership),fig('entities',s.page25.figure2.caption),
 p('［情報取得用WebAPIの説明］'),p('申込情報管理サーバと検査結果管理サーバが提供している情報取得用WebAPIの説明を、表1に示す。'),...s.page25.apiPremises.map(p),fig('api-table',s.table1.caption),
 p('設問1 本文中及び図2中の空欄a〜cに入れる正しい答えを、それぞれの解答群の中から選べ。bとcは同じ解答群からそれぞれ選ぶ。'),
 p('設問2 次の記述中の空欄dに入れる正しい答えを、解答群の中から選べ。'),p(s.page27.question2),fig('product-report',s.page27.figure3.caption),
 p('設問3 次の記述中の空欄eに入れる正しい答えを、解答群の中から選べ。'),p(s.page28and29.question3),fig('results-list',s.page28and29.figure4.caption),p(s.page28and29.paging)
 ],choices:all.map(t=>[p(t)]),answerParts:counts.map((count,i)=>({id:'part-'+'abcde'[i],label:'設問'+(i<3?1:i===3?2:3)+' '+'abcde'[i],choiceIds:Array.from({length:count},(_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:correct.map((index,i)=>({kind:'choice' as const,partId:'part-'+'abcde'[i],choiceId:'choice-value-'+(offsets[i]+index+1)})),
 explanation:'a：申込サーバのgetOffererInfoとlistOffererInfoは申込者情報を、getProductInfoとlistProductInfoは検査農産物情報を返す。したがって申込DBが格納するのは申込者情報及び検査農産物情報である。'+foreign+'を申込者情報に加えた候補は、他DBの情報を含み農産物情報も欠く。同じ他DB情報を正しい二種類に加えた候補も過剰である。認証情報と利用者情報だけの候補はどちらも認証DBの情報であり、農産物だけ又は申込者だけでは不足する。認証情報はログイン後の状態を管理するレコード、利用者情報は利用者IDとパスワードをもつレコードで、両者は別の情報である。b：検査農産物の申込者IDがgetOffererInfoへの参照となる。c：検査結果の検査農産物IDがgetProductInfoへの参照となる。アクセスIDは認証状態、利用者IDはログイン利用者、検査IDは結果自身、検査項目名は項目の説明であり、これらの参照の代用にはならない。農産物自身の主キーを申込者参照へ用いたり、申込者IDだけで個々の農産物を取得したりすることもできない。d：必要なのは農産物情報、申込者情報、対象農産物の全検査結果の三種類である。getProductInfoで農産物情報と申込者IDを取得し、getOffererInfoで申込者情報、getResultInfoForProductで全検査結果を取得すれば3回で揃う。申込者取得は農産物取得の後だが、結果取得はその前後のどちらでもよいので最短順は3通りある。2回では三種類を揃えられず、4〜8回は最低ではない。API内部の認証確認は情報取得用WebAPIの実行回数に加算しない。e：listResultInfoから検査日・検査ID降順の最多10結果と農産物IDを取得し、getProductInfoで農産物情報と申込者ID、getOffererInfoで申込者情報を取得する。この順なら各1回でよい。結果が最多10件なので、重複を除いた農産物IDと申込者IDも各最多10件となり、IDリスト上限を満たす。'+(values[1]?'getOffererInfoを先頭にすると、必要な申込者IDリストがまだ得られていない。':'listOffererInfoを先頭にしても、申込者ID順の頁であり、検査日順の結果頁を特定できない。')+'listProductInfoから始めた場合は申込者IDも得られ、getOffererInfoを呼ぶこと自体はできる。しかし農産物ID順の頁と一農産物の全結果では、求める全結果の検査日順の頁にならない。listProductInfoとlistOffererInfoの独立した頁も対応を保証しない。listResultInfoの直後にgetOffererInfoを呼ぶ候補は申込者IDが未取得であり、先にgetProductInfoが必要である。get系の戻り値の順序は指定されていないので、情報をIDで対応付け、結果一覧の表示順を保つ。'
 };
 }}];
