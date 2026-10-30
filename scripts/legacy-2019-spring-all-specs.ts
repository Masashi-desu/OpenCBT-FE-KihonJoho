/** All13 source-local specs, without annual2019/AM imports, registration or I/O. */
import assert from'node:assert/strict';
import{spring2019Pm13SourceBody}from'../src/core/generators/legacy-2019-spring-pm13';
import{legacy2019SpringAfternoonDefinitions}from'../src/core/generators/legacy-2019-spring-afternoon-definitions';
import type{Spring2019PreparedSpec,Spring2019MaterialGroup}from'./import-legacy-2019-spring-pm-preparation';
import{spring2019BodyPages,spring2019BankPages,spring2019OfficialAnswerLabels,spring2019OfficialChoiceCounts,spring2019OfficialAnswerBanks,spring2019OfficialThemes}from'./legacy-2019-spring-afternoon-booklet';
const topics=[['情報セキュリティ','利用者認証'],['仮想記憶','ページ置換'],['データベース','SQL'],['ネットワーク','負荷分散'],['ソフトウェア設計','状態遷移'],['プロジェクトマネジメント','変更管理'],['システム戦略','システム統合'],['アルゴリズム','ハフマン符号'],['C','バイト頻度集計'],['COBOL','整列と順位'],['Java','迷路と列挙'],['アセンブラ','ビット操作'],['表計算','会員管理']];
const materialPlans:Record<number,{id:string;pages:number[]}[]>={8:[{id:'common',pages:[3,4]}],11:[{id:'api',pages:[77,78]}],12:[{id:'casl',pages:[79,80,81,82,83,84]}],13:[{id:'common',pages:[3,4]},{id:'sheet',pages:[85,86,87,88,89,90]}]};
export const spring2019AllSpecs:Spring2019PreparedSpec[]=legacy2019SpringAfternoonDefinitions.map((definition,at)=>{
 const number=at+1;assert.equal(definition.source,`2019h31h-fe-pm-${number}`);
 const banks=spring2019OfficialAnswerBanks[at],groups=[...new Set(banks)].map(bank=>banks.map((b,i)=>b===bank?i:-1).filter(i=>i>=0)),counts=spring2019OfficialChoiceCounts[at],body=definition.build([...definition.reference]);
 const materialGroups:Spring2019MaterialGroup[]=(materialPlans[number]??[]).map((plan,i)=>{const ctx=body.contexts?.[i];assert(ctx);assert.deepEqual(ctx.blocks.map(b=>{assert(b.type==='image');return b.assetId;}),plan.pages.map(page=>`asset-ipa-2019h31h-fe-pm-${number}-p${page}`));return{id:plan.id,title:ctx.title,pages:[...plan.pages],caption(page){const block=ctx.blocks[plan.pages.indexOf(page)];assert(block?.type==='image'&&block.caption);return block.caption;}};});
 return{number,...(number===13?{originalExplanation:spring2019Pm13SourceBody(0).explanation}:{}),area:number===6?'management':number===7?'strategy':'technology',pages:spring2019BodyPages[at],definition,choicePages:groups.flatMap((group,i)=>Array(counts[group[0]]).fill(spring2019BankPages[at][i])),officialMarks:spring2019OfficialAnswerLabels[at],fieldChoiceCounts:counts,sharedBanks:groups.filter(g=>g.length>1),topics:topics[at],keywords:[...topics[at],spring2019OfficialThemes[at]],materialGroups,
 diagramPages(block){if(block.scene.kind!=='source_figure')throw Error('SPRING2019_SOURCE_FIGURE');const{profile,values}=block.scene;if(profile===`legacy-2019-spring-pm${number}-bank`)return[spring2019BankPages[at][values.at(-1)!]];
  if(number===1)return[(profile==='legacy-2019-auth-network'||profile==='legacy-2019-spring-pm1-network')?5:7];
  if(number===2&&profile==='legacy-2019-spring-pm2-mapping')return[10];
  if(number===5){const kind=profile.slice('legacy-2019-spring-pm5-'.length);return[{architecture:24,entities:25,'api-table':26,'product-report':27,'results-list':28}[kind as 'architecture']??23];}
  if(number===7&&profile==='legacy-2019-spring-pm7-turnover')return[35];
  if(number===8){const kind=profile.slice('legacy-2019-spring-pm8-'.length);return[{'alpha-tree':40,'alpha-path':41,'alpha-arrays':42,ratio:41,program1:44,program2:46}[kind as 'ratio']??39];}
  if(number===9){const kind=profile.slice('legacy-2019-spring-pm9-'.length),group=values[1];return kind==='example'?[group===0?47:50]:kind==='program'?[[48,49],[50],[50,51]][group]:kind==='changes'?[50]:[47,48,49,50,51];}
  if(number===10&&profile==='legacy-2019-spring-pm10-change-table')return[56];
  if(number===11){const kind=profile.slice('legacy-2019-spring-pm11-'.length),group=values[2];return kind==='maze'?[58]:kind==='history'?[63]:kind==='program'?[[59],[60],[61],[62],[62],[63]][group]:[58,59,60,61,62,63];}
  if(number===12){const kind=profile.slice('legacy-2019-spring-pm12-'.length),group=values[2];return kind==='region'?[64]:kind==='program'?[[65,66],[66],[67]][group]:[64,65,66,67,68];}
  if(number===13){const kind=profile.slice('legacy-2019-spring-pm13-'.length);return[{sales:69,members:70,ranks:71,classification:71,product:74,macro:75}[kind as 'sales']??69];}
  return[...spring2019BodyPages[at]];
 }
 };
});
