/** Independent source/meaning oracle. No producer or production answer import.
 * Truth derives from fixed raw IPA/peer roles; inspect every actual alternative. */
import assert from 'node:assert/strict';
import {remainingAmOriginals as originals,remainingAmCases as cases,remainingAm55Independent as des} from './legacy-2018-autumn-remaining-am-review';
type Body={prompt:({type:string;text?:string})[];choices:({type:string;text?:string;columns?:string[];rows?:string[][]})[][];correctIndex?:number;explanation:string;contexts?:unknown[];answerParts?:unknown[]};
const alternate:Record<number,Record<number,string>>={
 44:{0:'無線区間で送受信するデータを暗号化し，通信内容の盗聴を防止する。',1:'無線区間のSSIDの盗聴を完全に防止する。',2:'アクセスポイントの証明書による認証を成立させ，偽のアクセスポイントへの接続を防止する。'},
 59:{0:'委託元責任者が，専門業者における媒体保管状況の確認を契約にも手続にも定めず，確認を実施しないまま引き渡している。',1:'委託元責任者が，専門業者との間で，機密保持について契約等による取り決めをしないまま引き渡している。',2:'委託元担当者が，引渡しの日付や内容を記録せず，専門業者による受領の確認も残さずに引き渡している。',3:'委託元担当者が，無断開封を防ぐ施錠容器に媒体を入れ，受渡しの担当者を確認するなど，定めた保護手順を満たして専門業者に引き渡している。'},
 61:{0:'実施中の調達実績や範囲の逸脱を計画と照合し，必要な是正措置を検討する。',1:'稼働後の効果の実績を分析し，未達の原因と改善策を検討する。',2:'稼働後に予定した効果測定の時期に，実績データを用いて達成した投資効果を評価する。'}
};
export function remainingAmOracle(source:string,body:Body,values:readonly number[]){
 const n=Number(source.split('-').at(-1));assert(source===`2018h30a-fe-am-${n}`);assert([44,45,55,56,59,60,61].includes(n));
 const expected=cases.find(c=>c.number===n&&JSON.stringify(c.values)===JSON.stringify(values));assert(expected,'UNREVIEWED_INPUT');
 const o=originals[String(n) as keyof typeof originals];assert.equal(body.prompt.length,1);assert.equal(body.prompt[0].type,'paragraph');assert.equal(body.choices.length,4);assert(!body.answerParts&&!body.contexts?.length);assert(body.explanation.length>40);
 const paragraphs=()=>body.choices.map(row=>{assert.equal(row.length,1);assert.equal(row[0].type,'paragraph');assert.equal(typeof row[0].text,'string');return row[0].text!;});
 let truth:boolean[];
 if(n===44||n===45){
  assert.equal(body.prompt[0].text,o.prompt);const rows=body.choices.map(row=>{assert.equal(row.length,1);assert.equal(row[0].type,'table');assert.deepEqual(row[0].columns,o.columns);assert.equal(row[0].rows?.length,1);assert.equal(row[0].rows![0].length,o.columns.length);return row[0].rows![0];});
  const originalRows=o.choices as readonly (readonly string[])[];
  if(n===44){
   for(let i=0;i<4;i++){const target=structuredClone(originalRows[i]) as string[];if(i<3&&values[i]){target[1]=alternate[44][i];if(i===1)target[0]='SSIDを通知しない設定にする。';}assert.deepEqual(rows[i],target);}
   // Each reviewed false pair mistakes filter/name operations for encryption,
   // spoof proof or authentication. Only the AP-path client isolation matches.
   truth=rows.map((r,i)=>i===3&&r[0].includes('端末同士の通信')&&r[1].includes('アクセスポイントを経由して'));
  }else{
   for(let i=0;i<4;i++){const target=[...originalRows[i]];if(i<2&&values[i])target[1]=i===0?'a.b.d':'a.b.e';assert.deepEqual(rows[i],target);}
   const ownIP=new Set(['AAA.168.1.5','AAA.168.1.10']),outsideIP=new Set(['BBB.45.67.89','BBB.45.67.90']);const ownDomain=new Set(['a.b.c']),outsideDomain=new Set(['a.b.d','a.b.e']);
   truth=rows.map(([ip,from,to])=>{assert(ownIP.has(ip)||outsideIP.has(ip));assert(ownDomain.has(from)||outsideDomain.has(from));assert(ownDomain.has(to)||outsideDomain.has(to));return outsideIP.has(ip)&&outsideDomain.has(from)&&outsideDomain.has(to);});
   for(const term of [...ownIP,...outsideIP,...ownDomain,...outsideDomain,'また，IPアドレスとドメイン名は詐称されていないものとする。'])assert(body.prompt[0].text!.includes(term));
  }
 }else{
  const texts=paragraphs();
  if(n===55){const e=values[0]===0?des.reference0Literal:des.native1Literal;assert.equal(body.prompt[0].text,e.prompt);assert.deepEqual(texts,e.choices);truth=[...e.truth];if(values[0])assert.match(body.explanation,/モデル内.*到着.*処理完了.*状態を更新/);else{assert.match(body.explanation,/観測.*時系列.*予測/);assert(!/ウ.*(?:離散事象シミュレーションである|無条件にシミュレーション)/.test(body.explanation));}}
  else if(n===56){assert.deepEqual(texts,o.choices);if(values[0]===0){assert.equal(body.prompt[0].text,o.prompt);assert.match(body.explanation,/^原問.*コールドスタート/);}else if(values[0]===1){assert.equal(body.prompt[0].text,'システム障害が発生したときに，更新前イメージを用いて未確定の更新を取り消し，更新前の状態に戻す回復処理はどれか。');assert.match(body.explanation,/^更新前.*ロールバック/);}else{assert.equal(body.prompt[0].text,'システム障害が発生したときに，バックアップを復元した後，その後の更新記録を順に再適用して，障害直前の状態に戻す回復処理はどれか。');assert.match(body.explanation,/^バックアップ.*ロールフォワード/);}truth=texts.map(t=>t===['コールドスタート','ロールバック','ロールフォワード'][values[0]]);}
  else{
   assert.equal(body.prompt[0].text,o.prompt);const wanted=[...o.choices] as string[];
   if(n===59&&values[0]){wanted[3]=alternate[59][3];wanted[values[0]-1]=alternate[59][values[0]-1];}
   if(n===60){if(values[0])wanted[1]='会計監査人';if(values[1])wanted[2]='内部監査人';}
   if(n===61)for(let i=0;i<3;i++)if(values[i])wanted[i]=alternate[61][i];
   assert.deepEqual(texts,wanted);
   if(n===59){const concern=values[0]===0?3:values[0]-1;truth=texts.map((t,i)=>i===concern);assert.match(body.explanation,values[0]===0?/^原問の段ボール箱/:values[0]===1?/^保管状況の確認/:values[0]===2?/^機密保持の取り決め/:/^受渡記録と受領確認/);}
   else if(n===60){truth=texts.map(t=>t==='経営者');assert.match(body.explanation,/最終責任は経営者/);}
   else{truth=texts.map(t=>t.includes('実施可否判断')&&t.includes('上位マネジメント'));assert.match(body.explanation,/事前評価.*実施可否/);}
  }
 }
 if(n===45||n===55&&values[0]===0){assert(!/[アイウエ](?:は|の記述|・[アイウエ])/.test(body.explanation),'FIXED_DISPLAY_LABEL');}
 if(n===59){assert(!body.explanation.includes('他の選択肢が記した'),'STALE_OTHER_CHOICE_CLAIM');assert.match(body.explanation,/各観点を，表示された状況に照らして比較する/);}
 assert.deepEqual(truth,[...expected.truth]);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));return{truth,correctIndex:truth.indexOf(true)};
}
