/** Independent source/fact oracle for the next batch; does not import builds. */
import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2019PlatformChoices as choices,legacy2019PlatformRoles as roles,legacy2019PlatformTargets as targets,legacy2019PlatformPrompts as prompts} from "./legacy-2019-platform-facts";
export const legacy2019PlatformExplanationReview:Record<string,{reasons:string[];common:string[]}>= {
s4:{reasons:["教師あり学習では、正解や誤りなどの教師情報を利用して、未知のデータに対する判定等を学ぶ。","強化学習では、行動の結果に対して与えられる報酬等を基に、より多くの報酬を得られる方策を学ぶ。","教師なし学習では、正解ラベルを与えず、データの統計的な性質などに基づきクラスタリング等を行う。"],common:["正解等の教師情報、行動への得点、正解を与えない分類","学習方法が教師あり又は教師なしと一意に決まらない","その記述を特定手法の正答にする条件は作らない"]},
s8:{reasons:["リエントラントは再入可能性であり、複数のプロセス等が同時に呼び出しても互いに干渉せず動作できる性質である。","リカーシブは再帰性であり、実行中に自分自身を呼び出す性質である。","リユーザブルは再使用可能性であり、再読込みせず繰り返して実行できる性質である。","リロケータブルは再配置可能性であり、配置する主記憶の位置を変更しても実行できる性質である。"],common:["同時呼出し、自己呼出し、逐次の再使用、配置先の変更","再使用可能であることだけでは同時呼出しによる干渉がないことまで保証しない","再帰性と再入可能性も同一の性質ではない"]},
s12:{reasons:["3Dプリンタは、熱溶解積層方式などにより材料を積み重ねる等の方法で立体物を造形する装置である。","感熱式プリンタは、感熱紙へ熱を加えて印刷する装置である。","プロジェクションマッピングは、建物や家具などの立体物の形状に合わせて映像等を投影する技術である。","3Dスキャナは、立体物の形状を読み取り、3Dデータ等として出力する装置である。"],common:["紙への印刷、立体物への投影、立体物の造形、立体形状の読取り","全て熱溶解積層方式を用いるという意味ではなく","原の「など」という限定を保持する"]},
s22:{reasons:["NAND回路はAND回路の出力を反転し、入力AとBがともに1の組だけ出力が0となる。","AND回路は二つの入力がともに1の組だけ出力が1となる。","OR回路は二つの入力がともに0の組だけ出力が0となる。","XOR回路は二つの入力の値が異なる組だけ出力が1となる。"],common:["入力00、01、10、11","ANDは0/0/0/1、NANDは1/1/1/0、ORは0/1/1/1、XORは0/1/1/0","解答前に真理値表や内部ゲートの形を追加していない"]},
s35:{reasons:["OpenFlowを使ったSDNは、データ転送と経路制御を論理的に分離し、転送を行う機器をソフトウェアの制御と組み合わせるネットワーク技術である。","CDNを構築する際のサーバ配置では、コンテンツを利用者へ効率よく届けるために配信サーバの配置を検討する。","BPMを支援するソフトウェア技術では、データフロー図やアクティビティ図等から業務プロセスの問題点を発見して改善に用いる。"],common:["物流の最適化、コンテンツ配信の配置、転送と制御の分離、業務の可視化","全ての方式がOpenFlowを必須とするという意味ではなく","CDN自体の意味をサーバの最適配置手法だけへ狭めず"]},
s36:{reasons:["CAPTCHAは、人間によるアクセスかどうかを判別するための仕組みである。","ハイブリッド暗号は、公開鍵暗号と共通鍵暗号を組み合わせ、鍵の受渡し等とメッセージの効率的な暗号化を両立させる。","パケットキャプチャは、通信を流れるパケットを取得して内容の表示・解析・集計等に用いる。","CRYPTRECは、電子政府で用いる暗号の安全性評価や、暗号の適切な実装・運用等に関する調査・検討を行う。"],common:["人間かどうかの判別、二つの暗号方式の組合せ、通信パケットの解析、暗号技術の評価活動","人間の本人性や、その操作が常に安全であることまで保証しない"]},
s79:{reasons:["著作物を著作者の意に反して変更・切除されない同一性保持権は、著作者人格権に含まれる。","複製権は、印刷や撮影・複写等の方法で著作物を複製することに関わる権利である。","公衆からの要求に応じて自動的に情報を送信することは、自動公衆送信に関する権利に対応する。","著作物の複製物を公衆へ貸し出すことは、貸与権の説明に対応する。"],common:["複製、公衆送信、貸与という財産的な権利と、同一性保持という人格的な権利","原四記述の分類","あらゆる複製・送信・貸与・改変が一律に禁止されると説明するものではない"]},
a18:{reasons:["本問はAの優先度が高いため、Bの実行中にAが起動するとBを実行可能状態にしてAを実行する。","本問はBの優先度が高いため、Aの実行中にBが起動するとAを実行可能状態にしてBを実行する。"],common:["より優先度の高い実行可能なタスクを選ぶ","優先度の低いタスクが起動しただけでは実行中の高優先度タスクを追い出さない","横取りされたタスクは引き続き実行可能","待ち状態へ移ったわけではない"]},
a19:{reasons:["増分バックアップは、直前のバックアップ以後に更新されたファイルを対象とし、バックアップ後に更新を示す情報をリセットする。","差分バックアップは、最初の全ファイルのバックアップ以後の更新を対象とし、差分を取得しても更新を示す情報を残す。"],common:["最初に全ファイルを取得して更新情報をリセットする","更新情報を消す増分方式と、更新情報を残して全体取得以後の変更を蓄積する差分方式","更新情報にかかわらず全てのファイルを取得する二つの記述","この設問が定めた更新情報の扱いを基準とする"]},
};
export const legacy2019PlatformKey=(source:string)=>(source.startsWith("2019h31h")?"s":"a")+source.split("-").at(-1);
/** All boolean inputs; no production truth table or stored answer index. */
export function legacy2019PlatformGateTruth(text:string,name:string){
 const values=[...([0,1]as const)].flatMap(a=>[0,1].map(b=>({a,b}))),target=values.map(({a,b})=>text.includes("ともに1のときだけ、出力Xが0")?Number(!(a===1&&b===1)):text.includes("ともに1のときだけ、出力Xが1")?Number(a===1&&b===1):text.includes("ともに0のときだけ、出力Xが0")?Number(!(a===0&&b===0)):text.includes("値が異なるときだけ、出力Xが1")?Number(a!==b):NaN);assert(target.every(Number.isInteger));
 const actual=values.map(({a,b})=>name==="AND回路"?a*b:name==="NAND回路"?1-a*b:name==="OR回路"?Math.min(1,a+b):name==="XOR回路"?(a+b)%2:NaN);return JSON.stringify(target)===JSON.stringify(actual);
}
/** Transition semantics, evaluated from the option's actual task/state words. */
export function legacy2019PlatformScheduleTruth(prompt:string,option:string){
 const priority=prompt.match(/([AB])の方が([AB])よりも優先度が高い/);assert(priority);assert.notEqual(priority[1],priority[2]);const m=option.match(/^([AB])の実行中に([AB])に起動がかかると、([AB])を(実行可能状態|待ち状態)にして([AB])を実行する。$/);assert(m);const[,running,arriving,changed,state,next]=m;assert.notEqual(running,arriving);assert.equal(running,changed);assert.equal(arriving,next);return arriving===priority[1]&&state==="実行可能状態";
}
/** Two files, two update rounds,16 complete small-domain histories. Desired
 * snapshots follow independent time intervals rather than archive-flag code. */
export function legacy2019PlatformBackupTruth(prompt:string,option:string){
 const incremental=prompt.includes("増分バックアップ"),differential=prompt.includes("差分バックアップ");assert.notEqual(incremental,differential);const selective=option.includes("情報があるファイルだけ"),all=option.includes("全てのファイル");assert.notEqual(selective,all);const reset=option.includes("情報はリセットする"),keep=option.includes("情報は変更しないでそのまま残しておく");assert.notEqual(reset,keep);
 for(let first=0;first<4;first++)for(let second=0;second<4;second++){let flags=0;const actual:number[]=[];for(const changed of [first,second]){flags|=changed;actual.push(selective?flags:3);if(reset)flags=0;}const expected=incremental?[first,second]:[first,first|second];if(JSON.stringify(actual)!==JSON.stringify(expected))return false;}return true;
}
export function assertLegacy2019Platform(source:string,body:GeneratedBody,values:number[]){
 const key=legacy2019PlatformKey(source),v=values[0];assert(prompts[key]);assert.equal(values.length,1);assert(Number.isInteger(v)&&v>=0&&v<prompts[key].length);assert.equal(body.prompt.length,key==="s22"?2:1);assert(body.prompt[0].type==="paragraph");const prompt=body.prompt[0].text;assert.equal(prompt,prompts[key][v],"input prompt/premise mismatch");assert.equal(body.choices.length,4);assert.equal(body.answerParts,undefined);assert.equal(body.partAnswers,undefined);
 const texts=body.choices.map(bs=>{assert.equal(bs.length,1);assert(bs[0].type==="paragraph");return bs[0].text;});assert.deepEqual(texts,choices[key],"source choice proposition or role changed");
 if(key==="s22"){const f=body.prompt[1];assert(f.type==="diagram");assert.deepEqual(f.scene,{kind:"source_figure",profile:"legacy-2019-two-input-box",values:[0]});assert.equal(f.alt,"長方形の論理回路に左から入力Aと入力Bが入り、右へ出力Xが出る。内部の回路は示されていない。");}
 const truth=texts.map((text,i)=>key==="s22"?legacy2019PlatformGateTruth(prompt,text):key==="a18"?legacy2019PlatformScheduleTruth(prompt,text):key==="a19"?legacy2019PlatformBackupTruth(prompt,text):roles[key][i]===targets[key][v]);assert.equal(truth.filter(Boolean).length,1,"independent unique answer");assert.equal(body.correctIndex,truth.indexOf(true),"independent answer mismatch");
 const explanation=legacy2019PlatformExplanationReview[key];assert(body.explanation.startsWith(explanation.reasons[v]),"explanation input/answer mismatch");for(const clause of explanation.common)assert(body.explanation.includes(clause),"explanation required distinction/limit missing: "+clause);for(let i=0;i<explanation.reasons.length;i++)if(i!==v)assert(!body.explanation.includes(explanation.reasons[i]),"explanation other condition");
}
