import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2017KnowledgeReview as review,legacy2017KnowledgeStems as stems} from "./legacy-2017-knowledge-review";
/** Independent semantic facts. No production dictionary, truth flag or build
 * helper is imported. The meaning of each source option is fixed below. */
const scaleFacts=[
 ["一連の大きな処理を一括して実行しなければならないので、並列処理が困難な処理が中心のシステム","処理を相互に依存しない作業へ分割でき、各作業が別々のデータを扱ってサーバ間の同期を要しないので、サーバを追加して作業を分散できるシステム"],
 ["参照系の要求も単一サーバの排他区間で逐次処理しなければならず、その区間を分割できないので、サーバを追加しても処理を分散できないシステム","参照系のトランザクションが多いので、複数のサーバで分散処理を行っているシステム"],
 ["データを追加するトランザクションが多いので、データの整合性を取るためのオーバヘッドを小さくしなければならないシステム","データの追加先を互いに独立した区画に分け、区画をまたぐ更新や整合性調整を要しないので、追加サーバへ区画を割り当てて更新を分散できるシステム"],
 ["同一のマスタデータベースがシステム内に複数個配置されているので、マスタを更新する際にはデータベース間で整合性を保持しなければならないシステム","マスタの更新責任を独立した区画ごとに分担でき、区画間の同時更新や整合性調整を要しないので、追加サーバへ区画を移して更新を分散できるシステム"],
];
export const legacy2017ScaleOutFacts={
 roles:["作業の分割と同期","読取りの分散と排他区間","追加更新の区画間調整","複製マスタの更新責任"],
 reasons:[
  ["一括で並列化困難なボトルネックは台数追加だけで消えない","別データの独立作業、同期不要、追加台への分散を全て明示"],
  ["分割できない単一の排他区間が上限となる","実際に複数台で分散する参照要求は台数追加に適する"],
  ["整合性調整の費用が課題なら追加台数だけで負担が消えない","独立区画で区画横断更新も整合性調整も不要である条件が選択肢に読める"],
  ["同一マスタの更新整合性維持が課題として残る","更新責任の分担と区画横断調整不要を選択肢に読み、単なる並列性から推測しない"],
 ],
};
export function legacy2017KnowledgeOracle(source:string,body:GeneratedBody,values:number[]){
 const number=Number(source.replace("2017h29h-fe-am-","")),r=review.find(r=>r.number===number);assert(r,`Unknown knowledge source ${source}`);
 assert.equal(body.prompt.length,1);assert.equal(body.prompt[0].type,"paragraph");assert.equal(body.choices.length,4);assert.equal(body.contexts,undefined);assert.equal(body.answerParts,undefined);
 const prompt=(body.prompt[0] as {text:string}).text,options=body.choices.map(c=>{assert.equal(c.length,1);assert.equal(c[0].type,"paragraph");return (c[0]as{text:string}).text;});assert.equal(new Set(options).size,4);
 let truth:boolean[]=[];
 if(number===2){
  assert.match(prompt,/^0以外の数値を浮動小数点表示で表現する場合、/);assert.match(prompt,/ここで、仮数部の表現方法は、絶対値表現とする。$/);assert.deepEqual(options,r.choices);
  const operations=[{pattern:/最上位桁が0以外.*桁合わせ/,name:"正規化"},{pattern:/捨てる部分が0でなければ.*最下位桁に1を加える/,name:"切上げ"},{pattern:/下を捨て、残す桁の値は変えない/,name:"切捨て"},{pattern:/ある桁の和が基数以上.*上位の桁へ1を送る/,name:"桁上げ"}],matches=operations.filter(f=>f.pattern.test(prompt));assert.equal(matches.length,1);assert(operations[values[0]].pattern.test(prompt));truth=options.map(s=>s===matches[0].name);assert.match(body.explanation,/値を変えず.*有効桁/);assert.match(body.explanation,/絶対値/);
 }else if(number===7){
  assert.equal(prompt,stems[7]);assert.match(options[0],/ハッシュ値.*(?:位置|区画)/);assert.match(options[1],/ランダム|登録日時順|最終更新日時順/);assert.match(options[3],/セル.*(?:アドレス順|ポインタ)/);assert.equal(options[2],"顧客番号の昇順に配置されているデータ構造");
  if(values[0]!==0)for(const index of [0,1,3])assert.match(options[index],/顧客番号順には並べ/);
  truth=options.map(s=>s==="顧客番号の昇順に配置されているデータ構造");assert.match(body.explanation,/中央.*半分/);assert.match(body.explanation,/キー.*大小.*配置.*左右/);
 }else if(number===9){
  assert.equal(prompt,stems[9]);assert.equal(options[3],"プロセッサから主記憶への書込み頻度を減らす。");
  const roles=[[/一貫性（コヒーレンシ）を保ちながら/,/毎回同時に反映/,/書き込むたびに.*完了を待つ/],[/キャッシュミス.*書き戻しを不要/,/変更済み.*置き換える.*書込みを行わず/,/変更したデータ.*書き戻すための管理を不要/],[/マルチプロセッサ.*ライトスルー方式よりも簡単な回路/,/共有データ.*他のプロセッサ.*整合性.*不要/,/他のプロセッサへ通知.*ライトバック方式を選ぶだけでなくす/]];
  roles.forEach((facts,i)=>assert(facts[values[0]].test(options[i]),`unreviewed write-back slot ${i}`));
  // Source A describes a general consistency requirement, not a false fact.
  // It does not distinguish why write-back is chosen. B/C remove duties that
  // write-back still has. Only D states the source's specific objective.
  truth=[false,false,false,true];assert.match(body.explanation,/一貫性.*両方式.*固有の目的/);assert.match(body.explanation,/書戻し.*整合性.*不要になるわけではない/);
 }else if(number===12){
  assert.equal(prompt,stems[12]);truth=options.map((s,i)=>{assert(scaleFacts[i].includes(s),`Unreviewed scale-out condition ${i}`);assert.equal(legacy2017ScaleOutFacts.reasons[i].length,2);return s===scaleFacts[i][1];});assert.equal(truth.indexOf(true),values[0]);
  if(truth[0])assert.match(options[0],/相互に依存しない.*別々のデータ.*同期を要しない.*サーバを追加/);
  if(truth[2])assert.match(options[2],/独立した区画.*区画をまたぐ更新や整合性調整を要しない.*追加サーバ/);
  if(truth[3])assert.match(options[3],/更新責任.*独立した区画.*区画間の同時更新や整合性調整を要しない.*追加サーバ/);
  assert.match(body.explanation,/並列化できるというだけでその負担が消えるとはいえない/);
 }else if(number===13||number===15){
  assert.deepEqual(options,r.choices);const concepts=number===13?["モニタリング","ベンチマークテスト","シミュレーション","机上解析"]:["ページング方式","プログラムの再配置","メモリインタリーブ","ブロック化"];
  const asked=prompt.replace(/の説明として、適切なものはどれか。$/,""),target=concepts.indexOf(asked);assert.equal(target,values[0]);assert(target>=0);
  // The source statements independently identify monitoring / representative
  // execution / model experiment / no execution, or page mapping / relocation
  // / concurrent memory banks / grouped records. Names stay in the stem.
  const criteria=number===13?[/監視・計測.*稼働状態や資源/,/標準的なプログラムを実行/,/モデル.*模擬的に実験/,/実際には実行せず.*予測値.*推定/]:[/仮想記憶空間と実記憶空間.*固定長.*対応/,/異なった領域.*再配置/,/主記憶.*並行.*読み書き/,/補助記憶.*複数のレコード.*まとめ/];criteria.forEach((c,i)=>assert.match(options[i],c));truth=options.map((_,i)=>i===target);
 }else if(number===21){
  assert.deepEqual(options,r.choices);assert.match(prompt,/監視してメンテナンスすることが可能である。この目的で使用されているセンサはどれか。$/);
  const facts=[{quantity:"温度",name:"サーミスタ"},{quantity:"角速度",name:"ジャイロ"},{quantity:"変形",name:"ひずみゲージ"},{quantity:"磁界",name:"ホール素子"}],f=facts.filter(f=>prompt.startsWith(f.quantity+"を感知するセンサ"));assert.equal(f.length,1);assert.equal(f[0],facts[values[0]]);truth=options.map(s=>s===f[0].name);
  assert.match(body.explanation,/温度.*抵抗値/);assert.match(body.explanation,/ジャイロは角速度/);assert.match(body.explanation,/ひずみゲージ.*変形.*電気抵抗/);assert.match(body.explanation,/ホール素子.*磁界.*電圧/);
 }else if(number===24){
  assert.deepEqual(options,r.choices);assert.match(prompt,/^音声などのアナログデータをディジタル化するために用いられるPCMにおいて、/);
  const facts=[{pattern:/一定の周期でアナログ値のまま切り出す/,name:"標本化"},{pattern:/アナログ値.*有限個の段階の値に対応/,name:"量子化"},{pattern:/段階の値.*2進の符号に置き換える/,name:"符号化"}],f=facts.filter(f=>f.pattern.test(prompt));assert.equal(f.length,1);assert.equal(f[0],facts[values[0]]);truth=options.map(s=>s===f[0].name);assert.equal(truth[0],false);assert.match(body.explanation,/逆量子化は復号側/);
 }
 assert.deepEqual(truth.flatMap((b,i)=>b?[i]:[]),[body.correctIndex],`${source} full-choice unique suitability`);assert(body.explanation.length>80);
}
