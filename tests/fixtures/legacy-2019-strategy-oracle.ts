/** Manually fixed facts from source images and primary concept references.
 * No production imports. Definitions in other years are not used as truth. */
import assert from "node:assert/strict";
import {legacy2019StrategyPrompts} from "./legacy-2019-strategy-prompt-review";
import {legacy2019StrategyExplanationReview} from "./legacy-2019-strategy-explanation-review";
import type {GeneratedBody} from "../../src/core/generators/definition";
export const legacy2019StrategyOriginalChoices:Record<number,string[]>={
66:["新しい業務の在り方や運用に関わる業務手順、入出力情報、組織、責任、権限、業務上の制約などの項目","新しい業務の遂行に必要なアプリケーションシステムに関わる利用者の作業、システム機能の実現範囲、機能間の情報の流れなどの項目","経営戦略や情報戦略に関わる経営上のニーズ、システム化・システム改善を必要とする業務上の課題、求められる成果・目標などの項目","システム基盤に関わる可用性、性能、拡張性、運用性、保守性、移行性などの項目"],
68:["チャレンジャ戦略","ニッチ戦略","フォロワ戦略","リーダ戦略"],
69:["ROAS（Return On Advertising Spend）","コンバージョン率","バナー広告のクリック率","ページビュー"],
70:["競争を経て広く採用され、結果として事実上の標準となる。","製品の品質を向上する革新的な製造工程を開発する。","独創的かつ高い技術を基に革新的な新製品を開発する。","半導体の製造プロセスをもっている他企業に製造を委託する。"],
73:["ITの活用によって経済全体の生産性が高まり、更にSCMの進展によって需給ギャップが解消されるので、インフレなき成長が持続するという概念である。","ITを用いて、再生可能エネルギーや都市基盤の効率的な管理・運営を行い、人々の生活の質を高め、継続的な経済発展を実現するという概念である。","商取引において、実店舗販売とインターネット販売を組み合わせ、それぞれの長所を生かして連携させることによって、全体の売上を拡大する仕組みである。","ソーシャルメディアのコミュニティ機能などを活用して、主に個人間で、個人が保有している遊休資産を共有したり、貸借したりする仕組みである。"],
74:["情報技術を利用する機会又は能力によって、地域間又は個人間に生じる経済的又は社会的な格差","情報の正当性を保証するために使用される電子的な署名","ディスプレイに映像、文字などの情報を表示する電子看板","不正利用を防止するためにデータに識別情報を埋め込む技術"],
75:["株主に対し、企業の経営状況の透明化を図る。","グリーン購入に向けて社内体制を整備する。","災害時における従業員のボランティア活動を支援する制度を構築する。","社内に倫理ヘルプラインを設置する。"],
76:["1部門を切り離して別会社として独立させ、機動力のある多角化戦略を展開する。","合併、買収によって、自社にない経営資源を相手企業から得て、スピーディな戦略展開を図る。","時間を掛けて研究・開発を行い、その成果を経営戦略の基礎とする。","事業分野ごとの仮想企業を作り、経営資源配分の効率化、意思決定の迅速化、創造性の発揮を促進する。"],
80:["ANSI","IEEE","IETF","NIST"],
};
const roles:Record<number,string[]>={66:["operation","function","business-goal","quality"],68:["challenge","niche","follow","leader"],69:["ad-return","purchase-rate","click-rate","page-count"],70:["de-facto","process","product","external-manufacturing"],73:["new-economy-theory","smart-city","omnichannel","sharing"],74:["divide","signature","signage","watermark"],75:["disclosure","environment","volunteer","ethics"],76:["separate-company","ma","internal-rd","company"],80:["ansi","ieee","ietf","nist"]};
const facts=new Map<string,{role:string;qualityCase?:number}>();
for(const[n,choices]of Object.entries(legacy2019StrategyOriginalChoices))choices.forEach((text,i)=>{assert(!facts.has(text));facts.set(text,{role:roles[Number(n)][i],...(n==="66"&&i===3?{qualityCase:0}:{})});});
facts.set("障害時に許容する停止時間、同時に利用できる最大人数、各利用者の応答時間、処理量増大に備える拡張余地などの項目",{role:"quality",qualityCase:1});
facts.set("保守作業中にサービスを利用できる範囲、障害後の復旧時間、新環境へ切り替える際の停止時間などの項目",{role:"quality",qualityCase:2});
const target:Record<number,string[]>={66:["quality","quality","quality"],68:["niche","challenge","follow","leader"],69:["purchase-rate","ad-return","click-rate","page-count"],70:["process","product","de-facto","external-manufacturing"],73:["sharing","smart-city","omnichannel","new-economy-theory"],74:["signage","divide","signature","watermark"],75:["environment","disclosure","volunteer","ethics"],76:["company","separate-company","ma","internal-rd"],80:["ietf","ansi","ieee","nist"]};
const promptFacts:Record<number,readonly[RegExp,string][]>={
 66:[[/^非機能要件項目はどれか。$/,"quality"]],
 68:[[/特定顧客、特定製品.*資源を集中.*専門化/,"niche"],[/首位の企業に対抗.*シェアの拡大/,"challenge"],[/直接の対抗を避けて追随/,"follow"],[/最大のシェア.*市場全体の需要の拡大/,"leader"]],
 69:[[/サイトアクセス者の総人数.*購入に至る人数の割合/,"purchase-rate"],[/投じた広告費.*売上金額/,"ad-return"],[/表示された回数.*クリックされた回数の割合/,"click-rate"],[/閲覧されたページの延べ表示回数/,"page-count"]],
 70:[[/^プロセスイノベーション/,"process"],[/^プロダクトイノベーション/,"product"],[/^デファクトスタンダード/,"de-facto"],[/^半導体製造の外部委託/,"external-manufacturing"]],
 73:[[/^シェアリングエコノミー/,"sharing"],[/^スマートシティ/,"smart-city"],[/^オムニチャネル/,"omnichannel"],[/^ニューエコノミー論/,"new-economy-theory"]],
 74:[[/^ディジタルサイネージ/,"signage"],[/^ディジタルデバイド/,"divide"],[/^ディジタル署名/,"signature"],[/^電子透かし/,"watermark"]],
 75:[[/環境対策の観点/,"environment"],[/株主に対する説明責任の観点/,"disclosure"],[/社会貢献活動の支援の観点/,"volunteer"],[/企業倫理の相談体制の観点/,"ethics"]],
 76:[[/^社内カンパニー制/,"company"],[/^分社化/,"separate-company"],[/^M&A/,"ma"],[/^内部開発戦略/,"internal-rd"]],
 80:[[/インターネット.*技術仕様をRFC/,"ietf"],[/米国の民間.*米国国家規格の承認/,"ansi"],[/電気・電子分野.*IEEE 802/,"ieee"],[/米国の連邦機関.*計量や標準・技術の研究/,"nist"]],
};
export function assertLegacy2019Strategy(source:string,body:GeneratedBody,values:number[]){
 const n=Number(source.split("-").at(-1)),v=values[0];assert(target[n]);assert.equal(body.prompt.length,1);assert(body.prompt[0].type==="paragraph");const prompt=body.prompt[0].text;assert.equal(prompt,legacy2019StrategyPrompts[n][n===66?0:v],"input prompt premise mismatch");const matches=promptFacts[n].filter(([pattern])=>pattern.test(prompt));assert.equal(matches.length,1,"unique prompt predicate");assert.equal(matches[0][1],target[n][v],"input target predicate mismatch");assert.equal(body.choices.length,4);assert.equal(body.answerParts,undefined);assert.equal(body.partAnswers,undefined);
 const actual=body.choices.map(bs=>{assert.equal(bs.length,1);assert(bs[0].type==="paragraph");const f=facts.get(bs[0].text);assert(f,`unreviewed choice ${source}`);return f;});assert.deepEqual(actual.map(f=>f.role),roles[n]);if(n===66)assert.equal(actual[3].qualityCase,v,"quality condition mismatch");if(n===69){assert(prompt.includes("見直し前後"));assert(prompt.includes("効果を直接示す値"));}
 const truth=actual.map(f=>f.role===matches[0][1]);assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true),"independent answer mismatch");
 const e=legacy2019StrategyExplanationReview[n];for(const clause of e.common)assert(body.explanation.includes(clause),`explanation missing/polarity ${source}: ${clause}`);assert(body.explanation.startsWith(e.reasons[v]),`explanation condition ${source}`);for(let i=0;i<e.reasons.length;i++)if(i!==v)assert(!body.explanation.includes(e.reasons[i]),`explanation other condition ${source}`);
}
