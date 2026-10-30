/** Whole spring PM7 candidate;connected to the annual preparation entry,not the shared registry. */
import{field,p,table,figure,variableNotes,type GenerationDefinition}from'./definition';import{legacy2019PmIntegrationTable,legacy2019PmIntegrationTableAlt}from'./legacy-2019-pm-integration-data';
const design=['A','B','C','A'],forecast=['E','F','F','G'],proc=['V','W','X','Y','X','X'],gText=['Eシステムだけである','Fシステムだけである','Eシステム及びFシステムである','ない'];
export const legacy2019AfternoonIntegrationDefinitions:GenerationDefinition[]=[{
 source:'2019h31h-fe-pm-7',title:'旧制度・午後：製造業における情報システムの統合',sourceAnswer:'設問1 a=ア、b=イ、c/d=ア/ウ（順不同）／設問2 e=ウ、f=ウ／設問3 g=イ',version:'3.2.0',fields:[field('製造関係',0,8),field('取扱高条件',0,2)],reference:[0,0],
 notes:variableNotes+' 原4頁の3表・7欄24固有択/28参照、c/d共用4IDと順不同一群を維持。9実製造/接続構造×取扱高3条件=27。7正セル/17非製造横線/全合計、各システム配置・共有・固定費・0.1%・0.1億円・統合後取扱高不変・G代替で新規経路なしを保持。e25.2/f9.7の数値対応は設計側の明示counterfactualで公式誤答意図と断定しない。費用1桁小数は整数0.1億円で確定し追加丸めなし。27入力/18正答内容/同答最多3、直前同答除外後24以上だが有限履歴/128再試行/実legacyRunの保証は未完。原の図なし構成を守り解答前へ接続一覧を追加しない。',
 build(values){
  const{rows,totals}=legacy2019PmIntegrationTable(values),edges=new Set<string>();rows.forEach((row,i)=>row.forEach((n,j)=>{if(n!==null){edges.add(proc[i]+design[j]);edges.add(proc[i]+forecast[j]);}}));const destinations=(name:string)=>[...edges].filter(e=>e[1]===name).map(e=>e[0]).sort(),neighbors=(name:string)=>[...edges].filter(e=>e[0]===name).map(e=>e[1]).sort(),a=['A','B','C'].sort((a,b)=>destinations(b).length-destinations(a).length)[0],b=destinations(a).length,max=Math.max(...'VWXY'.split('').map(n=>neighbors(n).length)),cd='VWXY'.split('').filter(n=>neighbors(n).length===max),replace='EF'.split('').filter(n=>destinations('G').every(p=>destinations(n).includes(p))),g=replace.length===2?2:replace[0]==='E'?0:replace[0]==='F'?1:3,volume=totals.reduce((a,b)=>a+b,0)/100,before=190+volume+edges.size,after=62+volume,money=(n:number)=>(n/10).toFixed(1),offsets=[0,3,8,8,12,16,20],counts=[3,5,4,4,4,4,4];
  return{prompt:[
   p('旧制度・午後 問7。製造業における情報システムの統合に関する次の記述を読んで、設問1〜3に答えよ。'),
   p('T社は、大手家電製品メーカであり、製品の設計及び需要予測は事業部ごとに行っている。各製造工場は、一つ以上の事業部の製品を製造している。2018年度に各製造工場が製造した製品の事業部別取扱高を、表1に示す。'),
   figure('legacy-2019-manufacturing-turnover',values,'表1 2018年度に各製造工場が製造した製品の事業部別取扱高',legacy2019PmIntegrationTableAlt(values)),
   p('T社は、事業部と製造工場ごとに情報システムを整備してきた経緯があり、設計システムには三つ、需要予測システムには三つ、調達システムには四つのシステムがある。各事業部が利用している設計システム及び需要予測システムを表2に、各製造工場が利用している調達システムを表3に示す。システムの名称が同一の場合は、事業部又は製造工場が同じシステムを共用していることを意味している。例えば、P事業部とS事業部は、設計システムとしてAシステムを共用している。'),
   table('表2 各事業部が利用している設計システム及び需要予測システム',['事業部','設計システム','需要予測システム'],'PQRS'.split('').map((n,i)=>[n+'事業部',design[i]+'システム',forecast[i]+'システム'])),
   table('表3 各製造工場が利用している調達システム',['製造工場','調達システム'],'HIJKLM'.split('').map((n,i)=>[n+'製造工場',proc[i]+'システム'])),
   p('T社では情報システムの運用保守コストの削減が求められており、本社の情報システム部門の主導によってプロジェクトを立ち上げ、設計システム、需要予測システム及び調達システムのそれぞれについて、複数のシステムを統合することにしている。'),
   p('設問1 データの受渡し（以下、データ連携という）に関する次の記述中の空欄に入る正しい答えを、解答群の中から選べ。'),
   p('調達システムは、製品の製造に必要な部品の在庫管理と発注処理を行っている。各製造工場が利用している調達システムは、その工場が製造する製品を担当している事業部が利用している設計システム及び需要予測システムとデータ連携している。設計システムと需要予測システムとの間のデータ連携はない。'),
   p('表1〜3によれば、最も多くの調達システムとデータ連携している設計システムは［a］システムであり、そのデータ連携先の調達システム数は［b］である。また、調達システムの中で、データ連携している設計システム数と需要予測システム数の合計が最も多いのは、［c］システムと［d］システムである。'),
   p('設問2 情報システムの運用保守コストに関する次の記述中の空欄に入る正しい答えを、解答群の中から選べ。'),
   p('本社の情報システム部門による調査の結果、情報システムの運用保守コストとして、設計システムのそれぞれには年間2億円、需要予測システムのそれぞれには年間3億円、調達システムのそれぞれには年間1億円が掛かっていることが分かった。'),
   p('それらに加えて、調達システムのそれぞれには、各製造工場が製造する製品の年間の取扱高の0.1%分の運用保守コストが掛かっていることが分かった。また、システム間のデータ連携のための経路（以下、データ連携経路という）の運用保守コストとして、データ連携経路一つ当たり年間0.1億円が掛かっていることが分かった。今後においても、今までデータ連携していないシステム間に新たなデータ連携経路を一つ作成した場合、データ連携経路の運用保守コストは年間0.1億円増加する。'),
   p('2018年度のT社の設計システム、需要予測システム、調達システム及びデータ連携経路の年間の運用保守コストの合計は［e］億円であった。設計システム、需要予測システム及び調達システムを全社でそれぞれ一つに統合できれば、これらのシステム及びデータ連携経路の年間の運用保守コストの合計は［f］億円になる。ここで、取扱高などの前提条件は変わらないものとする。また、一つのシステムを複数の事業部や製造工場で共用する場合でも、共用するシステムの運用保守コストは一つの事業部や製造工場が単独で利用する場合と変わらないものとする。'),
   p('設問3 Gシステムの廃棄に関する次の記述中の空欄に入る正しい答えを、解答群の中から選べ。'),
   p('本社の情報システム部門は、Gシステムの保守サポート期間の終了が迫っているので、Gシステムを廃棄し、他の需要予測システムによって代替できるかどうかを検討した。新たなデータ連携経路を作成することなくGシステムの代替が可能な需要予測システムは、［g］。'),
  ],choices:[...'ABC'.split(''),...[2,3,4,5,6].map(String),...'VWXY'.split(''),...[190,190+edges.size,before,240+edges.size].map(money),...[60,62,after,after+20].map(money),...gText].map(t=>[p(t)]),
   answerParts:counts.map((count,i)=>({id:`part-${'abcdefg'[i]}`,label:`設問${i<4?1:i<6?2:3} ${'abcdefg'[i]}`,choiceIds:Array.from({length:count},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),
   partAnswers:[{kind:'choice',partId:'part-a',choiceId:`choice-value-${'ABC'.indexOf(a)+1}`},{kind:'choice',partId:'part-b',choiceId:`choice-value-${3+[2,3,4,5,6].indexOf(b)+1}`},{kind:'unordered',partIds:['part-c','part-d'],choiceIds:cd.map(n=>`choice-value-${9+'VWXY'.indexOf(n)}`)},{kind:'choice',partId:'part-e',choiceId:'choice-value-15'},{kind:'choice',partId:'part-f',choiceId:'choice-value-19'},{kind:'choice',partId:'part-g',choiceId:`choice-value-${21+g}`}],
   explanation:`同名のシステムは共用なので、同じ相手への経路は一つとして数える。設計の連携先は${'ABC'.split('').map(n=>n+'：'+destinations(n).join('/')+'（'+destinations(n).length+'システム）').join('、')}であり、aは${a}、bは${b}である。調達側は${'VWXY'.split('').map(n=>n+'：'+neighbors(n).join('/')+'（'+neighbors(n).length+'システム）').join('、')}。設計と需要予測を併せた最多は${max}で、c/dは${cd.join('と')}を順不同で選ぶ。製造工場ごとに同じ経路を重複して数えたり、設計と需要予測の間へ経路を足したりしない。eの固定費は設計3×2+需要予測3×3+調達4×1=19.0億円、年間取扱高は${totals.join('+')}=${totals.reduce((a,b)=>a+b,0)}億円で、その0.1%は${money(volume)}億円。一意な連携経路は${edges.size}本なので${money(edges.size)}億円であり、合計19.0+${money(volume)}+${money(edges.size)}=${money(before)}億円になる。19.0だけでは取扱高と経路の費用がなく、${money(190+edges.size)}には取扱高比例費がない。設計と需要予測の固定費を四つの事業部ごとに数え、取扱高比例費を含めない計算は24.0+${money(edges.size)}=${money(240+edges.size)}となり、共用と費用範囲の両方が異なる。fは各種類を一つに統合するので固定費2+3+1=6.0億円。取扱高比例費${money(volume)}は変わらず、調達と設計、調達と需要予測の2経路だけが残るから6.0+${money(volume)}+0.2=${money(after)}億円である。6.0や6.2は費用成分を欠き、${money(after+20)}は統合後も設計システムを余分に一つ分数えた計算になる。Gの接続先は${destinations('G').join('/')}、Eは${destinations('E').join('/')}、Fは${destinations('F').join('/')}である。新規経路を作らないためには、Gの接続先を全て既存の接続先として持つ必要がある。一部の相手との接続だけや、包含関係を逆にした判定では足りない。gは「${gText[g]}」。`,
  };
 },
}];
