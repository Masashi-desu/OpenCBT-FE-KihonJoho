import {field,figure,p,strings,table,variableNotes,type GenerationDefinition} from "./definition";
const decimal=(n:number)=>n.toFixed(2);
const names=["S1","S2","共通機能"];
const scenarioStates=[["L+","O+","O-"],["O-","O+","O+"],["O-","O-","L+"],["O+","L+","O+"],["O+","O+","O+"],["L+","L+","L+"],["L+","L+","O-"],["L+","O+","L+"]];
const combinations=[[1,4],[1,5],[2,3],[2,4],[3,5],[3,6],[4,5],[4,6]];
const trendChoices=["進捗状況とコスト状況のどちらも悪化傾向","進捗状況とコスト状況のどちらも改善傾向","進捗状況は改善傾向、コスト状況は悪化傾向","進捗状況は悪化傾向、コスト状況は改善傾向"];
const indicators=["BAC（完了までの総予算）","PV（出来高計画値）","EV（出来高実績値）","AC（コスト実績値）","SV（スケジュール差異）","CV（コスト差異）"];
const eRows=[["ア","BAC","AC","EV"],["イ","BAC","EV","AC"],["ウ","BAC","PV","EV"],["エ","PV","AC","EV"],["オ","PV","BAC","EV"],["カ","PV","EV","AC"]];
export function legacy2018EvmModel(trend:number,scale:number){
  if(!Number.isInteger(trend)||trend<0||trend>3||!Number.isInteger(scale)||scale<1||scale>2)throw Error("PARAMETER_CONSTRAINT");
  const pv=[0,32.5,65,105.625,146.25,186.875,227.5,268.125,308.75,341.25,373.75];
  const ev=trend===0?[32.5,65,130,150,220,255,290,308.75,315]:[30,60,90,130,170,210,240,...(trend===3?[248.75,261.25]:[278.75,321.25])];
  const ac=trend===0?[32.5,65,100,140,180,205,250,308.75,373.75]:[30,60,100,140,180,220,250,...(trend===3?[278.75,281.25]:[308.75,trend===1?336.25:386.25])];
  return{pv:pv.map(n=>n*scale),ev:ev.map(n=>n*scale),ac:ac.map(n=>n*scale),scale};
}
export function legacy2018EvmFigureAlt(profile:string,values:number[]):string{
  if(profile==="legacy-2018-evm-timeline"&&values.length===1&&values[0]===0)return "図1 刷新プロジェクトの結合テストまでのスケジュール。経過月数0〜1が基本計画、1〜2が要件定義、2〜4が外部設計、4〜6が内部設計、6〜10が製造・単体テスト、10〜12が結合テスト。N社が受注した範囲は外部設計開始から結合テスト終了まで。";
  if(profile==="legacy-2018-evm-plan-table"&&values.length===1&&Number.isInteger(values[0])&&values[0]>=1&&values[0]<=2)return `表3 外部設計と内部設計のサブシステムごとの計画工数。単位は人月。S1/S2/共通機能/合計の外部設計は${[25,30,10,65].map(n=>decimal(n*values[0])).join("、")}。内部設計のS1は空欄a、他の3セルは網掛けで表示していない。`;
  if(profile==="legacy-2018-evm-status"&&values.length===2){const m=legacy2018EvmModel(values[0],values[1]),order=[["PV",m.pv[9]],["EV",m.ev.at(-1)!],["AC",m.ac.at(-1)!]].sort((a,b)=>Number(b[1])-Number(a[1])).map(row=>row[0]);return `図2 各経過月末時点のEVM指標値。横軸は経過月数2〜12、縦軸は工数（人月）0〜${400*m.scale}。PVは実線と四角、EVは破線と黒丸、ACは点線と白丸。結合テスト開始時点は10か月、開始から1か月が経過した時点は11か月。PVは12か月まで、実績のEVとACは11か月までを示す。11か月時点の上からの順序は${order.join("、")}。αはACとEVの間、βはPVとEVの間の縦区間。`;}
  throw Error("PARAMETER_CONSTRAINT");
}
const managed=(profile:string,values:number[],caption:string)=>figure(profile,values,caption,legacy2018EvmFigureAlt(profile,values));
const groupCounts=[4,8,4,6,6,6],offsets=[0,4,12,16,22,28],partIds=["a","forecast","b","c","d","e"];
export const legacy2018EvmAfternoonDefinitions:GenerationDefinition[]=[{
  source:"2018h30h-fe-pm-6",title:"旧制度・午後：EVMによるプロジェクト管理",sourceAnswer:"設問1 a=ウ／設問2=ク／設問3 b=ア、c=カ、d=オ、e=イ",fields:[field("規模と工数の倍率",1,2),field("外部設計の進捗と費用の組",0,7),field("結合テスト後の傾向",0,3)],reference:[1,0,0],
  notes:variableNotes+" 全6頁、6欄34択、工程表/生産性/規模/非表示セル/8指標の意味/表5/3系列グラフ/固定6行のe解答表を維持する。倍率2×予測8×図4=64入力を全列挙。表5のPVは倍率適用後の正確な7/8を小数2桁へ丸め、21.88×2としない。予測は表示された丸め後の値から判定し、未丸め値の境界と矛盾させない。設問2のSPI/CPI一定による予測と、設問3の今後は計画どおりという残作業の予測を分離する。aの原4数値は同率拡大する。原図の無記名EV/AC点を数値転記したとは扱わず、管理モデルにより図を改変・再構成する。PVは工程計画から正確に計算し、累積実績は減少せず、SPI/CPIと差異の大小で4傾向が一致する。α/βは正の図示距離、指標CV/SV自体はEVからAC/PVを引く符号付き差異である。e1〜e3は1組1欄で原6行のラベル付き表を維持するため原問も生成版も順固定。共有profile/年度セット/ミックスは未登録。",
  build:values=>{
    if(values.length!==3||values.some((n,i)=>!Number.isInteger(n)||n<[1,0,0][i]||n>[2,7,3][i]))throw Error("PARAMETER_CONSTRAINT");
    const [scale,scenario,trend]=values,final=[2500,3000,1000].map(n=>n*scale);
    // Hundredth-person-month integers; round the exact seven-eighths only once.
    const forecast=final.map((f,i)=>{const pv=Math.floor((f*7+4)/8),state=scenarioStates[scenario][i],ev=state[0]==="O"?pv:[2115,2550,825][i]*scale,ac=ev+(state[1]==="+"?[45,30,35][i]:-([60,45,65][i]))*scale;return{final:f,pv,ev,ac};});
    const on=forecast.map(r=>r.ev>=r.pv),within=forecast.map(r=>r.ac<=r.ev),truth=[on[0]&&within[0],on[0]&&!within[0],!on[1],on[1]&&!within[1],!on[2],on[2]&&within[2]],correctStatements=truth.flatMap((v,i)=>v?[i+1]:[]),forecastAnswer=combinations.findIndex(pair=>pair.join()===correctStatements.join());
    if(correctStatements.length!==2||forecastAnswer<0)throw Error("PARAMETER_CONSTRAINT");
    const model=legacy2018EvmModel(trend,scale),ac=model.ac.at(-1)!,ev=model.ev.at(-1)!,bac=model.pv.at(-1)!,remaining=bac-ev;
    const correct=[2,forecastAnswer,trend,5,4,1];
    return {prompt:[
      p("旧制度・午後 問6。EVM（Earned Value Management）手法を用いたプロジェクト管理に関する次の記述を読んで、設問1〜3に答えよ。"),
      p("S社では、クライアントサーバシステムとして構築されている既存の営業システムを、Webシステムに刷新するプロジェクト（以下、刷新プロジェクトという）を立ち上げた。Webシステムとして構築する営業システムを、新営業システムと呼ぶ。N社は、この刷新プロジェクトにおける外部設計から結合テストまでを受注した。"),
      p("［刷新プロジェクトへのN社の対応］(1) S社から提示された刷新プロジェクトの結合テストまでのスケジュールは、図1のとおりである。"),managed("legacy-2018-evm-timeline",[0],"図1 刷新プロジェクトの結合テストまでのスケジュール"),
      p("(2) 新営業システムは、サブシステムS1（以下、S1という）、サブシステムS2（以下、S2という）及び共通機能の三つのサブシステムで構成される。N社はこの構成に合わせて外部設計から結合テストまでを実施するプロジェクト（以下、プロジェクトという）体制を構築し、プロジェクトマネージャは、システム企画部に所属するY君が担当する。"),
      p("(3) N社では、新営業システムと類似するWebシステムの開発をこれまで複数案件行っており、組織のプロセス資産として各開発工程の生産性のデータを保有している。N社が保有する各開発工程の生産性を、表1に示す。Y君は、要件定義の成果物である要件定義書とN社の過去の開発実績を参考にして、表2に示すとおりに新営業システムの開発規模を見積もった。ここで、KLOC（Kilo Lines Of Code）は、ソースコード1,000行を単位とする指標である。"),
      table("表1 各開発工程の生産性（単位 KLOC／人月）",["開発工程","生産性"],[["外部設計","8.00"],["内部設計","6.40"],["製造・単体テスト","3.20"],["結合テスト","8.00"]]),
      table("表2 新営業システムの開発規模（単位 KLOC）",["サブシステム","開発規模"],names.map((name,i)=>[name,decimal([200,240,80][i]*scale)])),
      p("Y君は、(1)〜(3)を前提に、各開発工程を完了させるために必要となる計画時点の工数（以下、計画工数という）を算出してプロジェクト計画を作成した。ここで、1か月の作業日数は20日とする。各開発工程における計画工数は、作業する各月に対して均等に割り当てる。例えば、外部設計に10.00人月と見積もった場合、外部設計の期間は2か月なので、各月に5.00人月を割り当てる。"),
      p("設問1 外部設計と内部設計のサブシステムごとの計画工数を、表3に示す。表3中の［a］に入れる正しい答えを、解答群の中から選べ。"),managed("legacy-2018-evm-plan-table",[scale],"表3 外部設計と内部設計のサブシステムごとの計画工数（単位 人月）"),p("注記 網掛けの部分は表示していない。"),
      p("設問2 次の記述中の空欄に入れる正しい答えを、解答群の中から選べ。N社では、進捗遅延やコスト超過を早期に検出することを目的として、EVM手法を用いたプロジェクト管理を行っている。EVM手法では、プロジェクトの計画と実績について、定量的な情報を用いて進捗状況やコスト状況を分析し、評価する。EVM手法で使う各指標（以下、EVM指標という）のN社での意味を、表4に示す。"),
      table("表4 EVM指標のN社での意味",["指標","名称","意味"],[
        ["BAC（人月）","完了までの総予算","プロジェクト計画時点に見積もったプロジェクト完了までの予定総工数のこと。"],
        ["PV（人月）","出来高計画値","プロジェクト計画時点において、プロジェクト状況の評価時点までの予定作業に割り当てていた予定工数のこと。プロジェクト完了時点におけるPVはBACと同じ値になる。"],
        ["EV（人月）","出来高実績値","プロジェクト状況の評価時点までに完了した作業に対して、プロジェクト計画時点において割り当てていた予定工数のこと。"],
        ["AC（人月）","コスト実績値","プロジェクト状況の評価時点までに完了した作業に対して、実際に必要とした工数のこと。"],
        ["SV（人月）","スケジュール差異","プロジェクト状況の評価時点におけるEVとPVの差のこと。スケジュール面から見た差異を示す。"],
        ["CV（人月）","コスト差異","プロジェクト状況の評価時点におけるEVとACの差のこと。コスト面から見た差異を示す。"],
        ["SPI","スケジュール効率指数","SPI＝EV／PV。スケジュール面から見た効率のこと。1未満の場合、進捗遅延していることを示す。"],
        ["CPI","コスト効率指数","CPI＝EV／AC。コスト面から見た効率のこと。1未満の場合、コスト超過していることを示す。"],
      ]),
      p("外部設計を開始してから35作業日（1.75か月）が経過した時点での、外部設計工程のサブシステムごとのEVM指標値を、表5に示す。ここで、表5のEVM指標値は、小数点第3位を四捨五入した値である。"),
      table("表5 外部設計工程のサブシステムごとのEVM指標値（単位 人月）",["サブシステム","外部設計終了時点 PV（出来高計画値）","外部設計開始から1.75か月経過時点 PV（出来高計画値）","同時点 EV（出来高実績値）","同時点 AC（コスト実績値）"],forecast.map((r,i)=>[names[i],...[r.final,r.pv,r.ev,r.ac].map(n=>decimal(n/100))])),
      p("次の(1)〜(6)の記述のうち、表5のEVM指標値から予測した、外部設計が終了する時点での見通しとして適切な組合せは、［設問2］である。ここで、予測に当たってSPI及びCPIは、表5の実績と同等であるものとする。"),
      p("(1) S1については、ACが外部設計終了時点のPVを超過しない。また、外部設計はスケジュール遅延せずに完了する。"),p("(2) S1については、ACが外部設計終了時点のPVを超過する。また、外部設計はスケジュール遅延せずに完了する。"),p("(3) S2については、外部設計はスケジュール遅延する。"),p("(4) S2については、ACが外部設計終了時点のPVを超過する。また、外部設計はスケジュール遅延せずに完了する。"),p("(5) 共通機能については、外部設計はスケジュール遅延する。"),p("(6) 共通機能については、ACが外部設計終了時点のPVを超過しない。また、外部設計はスケジュール遅延せずに完了する。"),
      p("設問3 次の記述中の空欄に入れる正しい答えを、解答群の中から選べ。ここで、e1〜e3に入れる答えは、eに関する解答群の中から組み合わせとして正しいものを選ぶものとする。"),
      p("図2は、外部設計を開始した時点から、結合テストを開始して1か月が経過した時点までの、各経過月末時点のEVM指標値をグラフにしたものである。Y君は、このグラフを用いてプロジェクトの現状分析を行うことにした。"),managed("legacy-2018-evm-status",[trend,scale],"図2 各経過月末時点のEVM指標値"),
      p("結合テスト開始後、［b］であることがグラフから読み取れる。また、αは［c］を表し、βは［d］を表している。"),
      p("次に、未完了である残作業の作業工数（以下、残作業工数という）を、\"［e1］−［e2］\"で求めた。この残作業工数は、プロジェクト計画時点の見積りに基づいているが、今後の作業は計画どおり進捗するものとして、この残作業工数に［e3］を加算し、プロジェクトの全ての作業が完了したときの総工数の予測値を見直した。"),
      table("eに関する解答群",["解答記号","e1","e2","e3"],eRows.map(r=>[...r])),
    ],choices:[...strings([25.75,30,31.25,37.5].map(n=>decimal(n*scale))),...strings(combinations.map(pair=>`(${pair[0]})と(${pair[1]})`)),...strings(trendChoices),...strings(indicators),...strings(indicators),...strings(eRows.map(r=>`解答群表の${r[0]}行（${r.slice(1).join("、")}）`))],
      answerParts:groupCounts.map((count,i)=>({id:`part-${partIds[i]}`,label:["設問1 a","設問2","設問3 b","設問3 c","設問3 d","設問3 e"][i],choiceIds:Array.from({length:count},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),partAnswers:correct.map((n,i)=>({kind:"choice" as const,partId:`part-${partIds[i]}`,choiceId:`choice-value-${offsets[i]+n+1}`})),
      explanation:`a：開発規模÷内部設計の生産性＝${decimal(200*scale)}÷6.40＝${decimal(31.25*scale)}人月。表3の網掛けの値は解答前に示していない。設問2：予定工数の進捗率は1.75÷2＝7/8で、表5は小数第3位を四捨五入する。表示されたEV÷PVが1未満なら遅延、EV÷ACが1未満ならコスト超過の見通しとなる。SPI/CPIを維持した完了時予測なので、各記述を両条件まで確認すると真なのは${correctStatements.map(n=>`(${n})`).join("と")}である。特に(1)と(2)は共にスケジュール遅延せずという条件を含むため、費用だけでは決められない。b：結合テスト開始の10か月と、その1か月後の11か月を比較する。EV/PVとEV/ACの変化から、${trendChoices[trend]}と分かる。c：αはEVとACの間のコスト差異CV。d：βはEVとPVの間のスケジュール差異SVである。グラフの区間の長さは正で示されるが、CV＝EV−AC、SV＝EV−PVはこの図では負の値であり、符号と距離を混同しない。e：今後の作業を計画どおりの工数で行うという別の仮定なので、未完了の計画工数はBAC−EV＝${decimal(bac)}−${decimal(ev)}＝${decimal(remaining)}人月。既に発生したACを加えたBAC−EV＋AC＝${decimal(remaining+ac)}人月が総工数の予測となる。設問2のCPI一定による補正をここへ流用しない。EVMはEarned Value Management（出来高管理）、BACはBudget at Completion、PVはPlanned Value、EVはEarned Value、ACはActual Cost、SVはSchedule Variance、CVはCost Variance、SPIはSchedule Performance Index、CPIはCost Performance Index。KLOCはKilo Lines Of Codeでソースコード1,000行を表す。`,
    };
  },
}];
