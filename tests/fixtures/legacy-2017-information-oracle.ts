import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2017InformationExplanationFacts} from "./legacy-2017-information-explanations";
import {legacy2017InformationReview as reviews,legacy2017InformationStems as stems} from "./legacy-2017-information-review";
/** Separate semantic criteria, binary-prefix classification and resolver
 * simulation. No producer arrays, ranges or correct-index formula imported. */
export function legacy2017InformationOracle(source:string,body:GeneratedBody,values:number[]){
 const number=Number(source.replace("2017h29h-fe-am-","")),r=reviews.find(r=>r.number===number);assert(r,`Missing information oracle ${source}`);assert.equal(body.prompt.length,1);assert.equal(body.prompt[0].type,"paragraph");assert.equal(body.choices.length,4);assert.equal(body.contexts,undefined);assert.equal(body.answerParts,undefined);
 const prompt=(body.prompt[0]as{text:string}).text,options=body.choices.map(c=>{assert.equal(c.length,1);assert.equal(c[0].type,"paragraph");return (c[0]as{text:string}).text;});assert.equal(new Set(options).size,4);let truth:boolean[]=[];
 if(number===27){
  assert.equal(prompt,stems[27]);assert.equal(options[3],r.choices[3]);
  const roles=[[/インデックスに含まれている.*インデックスの値で結合/,/各行.*インデックスを使って一致する行を検索/,/木構造のインデックスを探索/],[/ハッシュ表を作成/,/^一方の表.*ハッシュ値を計算して区画へ格納.*もう一方の表.*ハッシュ値が指す区画/,/^両方の表.*ハッシュ値で区画に分け.*対応する区画内/],[/一方の表.*順に読み出し.*もう一方の表/,/並べ替えず.*各行.*全行/,/並べ替えず.*二重の繰返し.*全ての組合せ/]];
  roles.forEach((rules,i)=>assert.match(options[i],rules[values[0]]));truth=options.map(s=>/並べ替えたそれぞれの表.*先頭から順に結合/.test(s));assert.match(body.explanation,/片方.*順に読み出す.*だけでは.*両表.*並べ/);
 }else if(number===28){
  assert.deepEqual(options,r.choices);assert.match(prompt,/^分散データベースシステムにおいて、.*方式はどれか。$/);
  const criteria=[{rule:/複数サイト.*確定可能かどうかを問い合わせ.*全てのサイトが確定可能.*確定する/,name:"2相コミット"},{rule:/競合する処理が同時に実行されない.*アクセスを制限/,name:"排他制御"},{rule:/失敗した.*更新を取り消し.*実行前の状態に戻す/,name:"ロールバック"},{rule:/障害復旧.*ログ.*確定済みの更新を再実行/,name:"ロールフォワード"}],matched=criteria.filter(c=>c.rule.test(prompt));assert.equal(matched.length,1);assert.equal(matched[0],criteria[values[0]]);truth=options.map(s=>s===matched[0].name);assert.match(body.explanation,/取り消し.*ログ.*再適用/);
 }else if(number===29){
  assert.deepEqual(options,r.choices);assert.match(prompt,/^ビッグデータの活用例として、.*プロセスはどれか。$/);const cases=[/大量のデータから統計学的手法.*新たな知識（傾向やパターン）を見つけ出す/,/過去の購買データ.*傾向を学習.*予測するためのパターン/,/顧客データ.*類似性を統計的に調べ.*顧客群を見つけ出す/];assert.match(prompt,cases[values[0]]);truth=options.map(s=>s==="データマイニング");assert.match(body.explanation,/ウェアハウス.*統合・蓄積.*ディクショナリ.*定義.*メタデータ.*説明.*プロセスそのものと区別/);
 }else if(number===31){
  assert.deepEqual(options,r.choices);assert.match(prompt,/^OSI基本参照モデルの.*機器はどれか。$/);
  const criteria=[{rule:/トランスポート層以上が異なるLAN.*プロトコル変換/,name:"ゲートウェイ"},{rule:/データリンク層.*宛先MAC.*フレームを中継/,name:"ブリッジ"},{rule:/物理層.*信号を再生.*伝送距離/,name:"リピータ"},{rule:/ネットワーク層.*宛先IP.*パケットを中継/,name:"ルータ"}],matched=criteria.filter(c=>c.rule.test(prompt));assert.equal(matched.length,1);assert.equal(matched[0],criteria[values[0]]);truth=options.map(s=>s===matched[0].name);assert.match(body.explanation,/この問のゲートウェイ.*トランスポート層以上/);assert.match(body.explanation,/デフォルトゲートウェイ.*ルータ.*区別/);
 }else if(number===34){
  assert.deepEqual(options,r.choices);const m=prompt.match(/^IPv4アドレス(\d+)\.0\.0\.0を含むアドレスクラスはどれか。$/);assert(m);const byte=Number(m[1]);assert.equal(byte,[10,126,128,191,192,223,224,239][values[0]]);const bits=byte.toString(2).padStart(8,"0"),prefixes=[{name:"クラスA",prefix:"0"},{name:"クラスB",prefix:"10"},{name:"クラスC",prefix:"110"},{name:"クラスD",prefix:"1110"}],match=prefixes.filter(f=>bits.startsWith(f.prefix));assert.equal(match.length,1);truth=options.map(s=>s===match[0].name);assert.match(body.explanation,/歴史的.*先頭ビット/);assert.match(body.explanation,/割当て可能かとは別の分類/);
 }else if(number===36){
  assert.deepEqual(options,r.choices);const m=prompt.match(/^攻撃者が用意したサーバXのIPアドレスが、([AB])社WebサーバのFQDNに対応するIPアドレスとして、([AB])社DNSキャッシュサーバに記憶された。/);assert(m);assert.equal(m[1],["A","B"][values[0]]);assert.equal(m[2],["A","B"][values[1]]);assert.match(prompt,/ここで、A社、B社の各従業員は自社のDNSキャッシュサーバを利用して名前解決を行う。$/);
  // Each resolver initially maps both names to the legitimate servers. Only
  // the one stored name in the one cache is changed; resolve every option.
  const caches:Record<string,Record<string,string>>={A:{A:"real-A",B:"real-B"},B:{A:"real-A",B:"real-B"}};caches[m[2]][m[1]]="X";
  truth=options.map(s=>{const option=s.match(/^([AB])社Webサーバにアクセスしようとする([AB])社従業員$/);assert(option);return caches[option[2]][option[1]]==="X";});assert.match(body.explanation,new RegExp(`偽情報が入ったのは${m[2]}社.*名前は${m[1]}社`));assert.match(body.explanation,/他社DNS.*別の名前.*一律に影響/);
 }else if(number===37||number===38){
  assert.deepEqual(options,r.choices);const names=number===37?["SQLインジェクション","ディレクトリトラバーサル攻撃","クロスサイトスクリプティング","セッションハイジャック"]:["ブルートフォース攻撃","代数的攻撃","線形解読法","差分解読法"];
  const asked=number===37?prompt.match(/^(.+)に該当するものはどれか。$/):prompt.match(/^共通鍵暗号の鍵を見つけ出そうとする、(.+)に該当するものはどれか。$/);assert(asked);const target=names.indexOf(asked[1]);assert(target>=0);assert.equal(target,values[0]);
  const descriptions=number===37?[/入力データ.*命令文.*SQL文を実行/,/パス名.*意図していないファイル.*閲覧/,/HTML出力.*欠陥.*ブラウザ.*スクリプト/,/セッションID.*不正に取得.*なりすま/]:[/平文と暗号文.*全ての鍵候補を一つずつ/,/平文と暗号文と鍵.*代数式/,/平文.*暗号文.*統計的相関/,/平文を一定量変化.*暗号文の変化/];descriptions.forEach((pattern,i)=>assert.match(options[i],pattern));truth=options.map((_,i)=>i===target);if(number===37)assert.match(body.explanation,/不正な処理.*データベース・ファイル・ブラウザ・セッション/);
 }else if(number===40){
  assert.deepEqual(options,r.choices);const properties:Record<string,string>={AES:"symmetric-block","KCipher-2":"symmetric-stream",RSA:"asymmetric","SHA-256":"hash"};
  const match=[{rule:/^公開鍵暗号方式の暗号アルゴリズムはどれか。$/,type:"asymmetric"},{rule:/^共通鍵暗号方式のブロック暗号に該当するアルゴリズムはどれか。$/,type:"symmetric-block"},{rule:/^共通鍵暗号方式のストリーム暗号に該当するアルゴリズムはどれか。$/,type:"symmetric-stream"},{rule:/^暗号学的ハッシュ関数はどれか。$/,type:"hash"}].filter(f=>f.rule.test(prompt));assert.equal(match.length,1);assert.equal(match[0].type,["asymmetric","symmetric-block","symmetric-stream","hash"][values[0]]);truth=options.map(s=>properties[s]===match[0].type);assert.match(body.explanation,/SHA-256.*ハッシュ関数.*復号できる暗号方式とは区別/);
 }
 assert.deepEqual(truth.flatMap((yes,i)=>yes?[i]:[]),[body.correctIndex],`${source}: four-choice unique answer`);assert(body.explanation.length>80);const explanationFacts=legacy2017InformationExplanationFacts(number,values);assert(explanationFacts.length>=4);for(const fact of explanationFacts)assert(body.explanation.includes(fact.clause),`${source}: missing or mismatched explanation: ${fact.clause}`);
}
