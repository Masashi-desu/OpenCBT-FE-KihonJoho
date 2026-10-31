/** Manually reviewed propositions. No production generator imports.
 * PDM is independently parsed as directed event edges, and Q64 uses two
 * independent attributes (recipient/time), rather than the choice index. */
import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2019ManagementExplanationReview} from "./legacy-2019-management-explanation-review";
export const legacy2019ManagementOriginalChoices:Record<number,string[]>={
 50:["Ajax","CSS","RSS","SNS"],
 52:["受付の開始から30分経過したら、試験を開始する。","受付の終了から10分経過したら、試験を開始する。","受付の終了から45分経過したら、試験を終了する。","試験の開始から20分経過したら、受付を終了する。"],
 56:["確実性や効率性の観点で、既存システムから新システムへの切替え手順や切替えに伴う問題点を確認する。","既存システムの実データのコピーを利用して、新システムでも十分な性能が得られることを確認する。","既存の他システムのプログラムと新たに開発したプログラムとのインタフェースの整合性を確認する。","新システムが、要求された全ての機能を満たしていることを確認する。"],
 58:["インタビューで監査対象部門から得た情報を裏付けるための文書や記録を入手するよう努める。","インタビューの中で気が付いた不備事項について、その場で監査対象部門に改善を指示する。","監査対象部門内の監査業務を経験したことのある管理者をインタビューの対象者として選ぶ。","複数の監査人でインタビューを行うと記録内容に相違が出ることがあるので、1人の監査人が行う。"],
 60:["バックアップ取得手順書を作成し、取得担当者を定めていた。","バックアップを取得した電子記録媒体からデータベースを復旧する試験を、事前に定めたスケジュールに従って実施していた。","バックアップを取得した電子記録媒体を、機密保持を含む契約を取り交わした外部の倉庫会社に委託保管していた。","バックアップを取得した電子記録媒体を、業務システムが稼働しているサーバの近くで保管していた。"],
 61:["業務に必要なデータの内容、データ間の関連や構造などを体系的に示したもの","業務プロセスを支援するシステムの機能や構成などを体系的に示したもの","情報システムの構築・運用に必要な技術的構成要素を体系的に示したもの","ビジネス戦略に必要な業務プロセスや情報の流れを体系的に示したもの"],
 62:["インターネットサイトで購入したDVDで視聴する映画","出版社が部数を決めてオフセット印刷した文庫本","定期的に決められたスケジュールでスマートフォンに配信されるインターネットニュース","利用者の要求に応じてインターネット上で配信される再放送のドラマ"],
 63:["競合する他社が発行するアニュアルレポートなどの刊行物を入手し、経営戦略や財務状況を把握する。","業績の評価や経営戦略の策定を行うために、業務システムなどに蓄積された膨大なデータを分析する。","電子化された学習教材を社員がネットワーク経由で利用することを可能にし、学習・成績管理を行う。","りん議や決裁など、日常の定型的業務を電子化することによって、手続を確実に行い、処理を迅速にする。"],
 64:["会員カードを用いて収集・蓄積した大量の購買データから、一人一人の嗜好を分析し、その顧客の前月の購買額に応じて、翌月のクーポン券を発行する。","会員登録をした来店客のスマートフォンから得られる位置データと、来店客の購買履歴データを基に、近くの売場にある推奨商品をスマートフォンに表示する。","系列店の過去数年分のPOSデータから月ごとに最も売れた商品のランキングを抽出し、現在の月に該当する商品の映像を店内のディスプレイに表示する。","走行中の自動車から、車両の位置、速度などを表すデータをクラウドに収集し分析することによって、各道路の現在の混雑状況をWebサイトに公開する。"],
};
type Fact={role:string;fit?:boolean;recipient?:"all"|"individual";timing?:"periodic"|"instant";mechanism?:"video"|"print"|"resource"};
const facts=new Map<string,Fact>();
function register(text:string,fact:Fact){assert(!facts.has(text));facts.set(text,fact);}
function batch(n:number,roles:string[]){legacy2019ManagementOriginalChoices[n].forEach((t,i)=>register(t,{role:roles[i]}));}
batch(50,["async","style","syndicate","social"]);
batch(56,["migration","performance","integration","function"]);
legacy2019ManagementOriginalChoices[58].forEach((s,i)=>register(s,{role:["evidence","intervene","experience-only","avoid-record-check"][i],fit:i===0}));
for(const [s,role] of [
 ["気付いた設定の不備を直すために、監査人がその場で本番システムの設定を変更する。","intervene"],
 ["監査対象の運用手続が適切かを確認する代わりに、監査人自身が実務の承認者となって運用を続ける。","intervene"],
 ["対象の実務を知らない場合でも、過去に監査を受けた経験だけで対象者を選び、実務の担当者には確認しない。","experience-only"],
 ["肩書の高い者であれば実際の処理を把握しているとみなし、回答を確認できる担当者への面談は省略する。","experience-only"],
 ["記録を残すと発言者が慎重になるので、面談の内容は文書にせず、監査人の記憶だけで報告する。","avoid-record-check"],
 ["面談記録を他の監査人と照合せず、相違や矛盾があっても確認しない。","avoid-record-check"],
] as const)register(s,{role,fit:false});
legacy2019ManagementOriginalChoices[60].forEach((s,i)=>register(s,{role:["procedure","restore-test","external-protection","offsite"][i],fit:i!==3}));
for(const [s,role,fit]of[
 ["バックアップ取得手順書を作成せず、取得担当者も定めないまま、取得するかどうかの判断を全て各自に任せていた。","procedure",false],
 ["バックアップを取得した電子記録媒体から復旧できることを確かめる試験は、一度も実施していなかった。","restore-test",false],
 ["バックアップを取得した電子記録媒体を外部の倉庫会社へ預けていたが、機密保持など保護に関する条件を合意していなかった。","external-protection",false],
 ["バックアップを取得した電子記録媒体を、機密保持や保護条件を合意した遠隔地の外部倉庫に保管していた。","external-protection",true],
 ["バックアップを取得した電子記録媒体を、業務システムと同じ災害の被害を受けない遠隔地の保管庫で、定めた手順に従い管理していた。","offsite",true],
] as const)register(s,{role,fit});
batch(61,["data","application","technology","business"]);
legacy2019ManagementOriginalChoices[62].forEach((s,i)=>register(s,{role:["media","forecast","schedule","request"][i],fit:i===3,...(i===3?{mechanism:"video" as const}:{})}));
register("注文を受けてから、必要な内容の書籍を必要部数だけ印刷するサービス",{role:"request",fit:true,mechanism:"print"});
register("利用者の要求時に、必要な仮想サーバの資源を割り当てるサービス",{role:"request",fit:true,mechanism:"resource"});
legacy2019ManagementOriginalChoices[63].forEach((s,i)=>register(s,{role:["collect-competitor","analyze-data","learning","workflow"][i],fit:i===1}));
for(const [s,role]of[
 ["競合企業の動向を把握するため、展示会で担当者から公開情報を聞き取り、競合商品の資料を収集する。","collect-competitor"],
 ["競合他社が公開する決算説明会を視聴して説明資料を集め、他社の事業計画や経営方針に関する説明を確認する。","collect-competitor"],
 ["遠隔地の社員がオンラインの授業へ参加し、講師から説明を受けて課題の回答を提出する。","learning"],
 ["安全教育の受講者が仮想環境で作業を体験し、教材に従って操作の練習と確認テストを行う。","learning"],
 ["申請を受け付けるとあらかじめ定めた承認者へ自動的に回付し、承認待ちの手続を通知する。","workflow"],
 ["申請した金額や所属に従い決裁経路を振り分け、電子的な承認と決裁の手順を進める。","workflow"],
]as const)register(s,{role,fit:false});
legacy2019ManagementOriginalChoices[64].forEach((s,i)=>register(s,{role:"feedback",recipient:i<2?"individual":"all",timing:i%2===0?"periodic":"instant"}));
const prompts:Record<number,string[]>={
 50:["JavaScriptの非同期通信の機能を使うことによって、動的なユーザインタフェースを画面全体の遷移を伴わずに実現する技術はどれか。","HTML文書の各要素について、文字の色や書体、余白、配置などの表示スタイルを指定する技術はどれか。","Webサイトの更新情報の見出しや概要などを構造化した形式で配信し、利用者が専用のリーダ等で取得できるようにする技術はどれか。","利用者がプロフィール等を登録し、利用者どうしのつながりを作って交流や情報発信を行うサービスはどれか。"],
 52:["開始-終了","開始-開始","終了-開始","終了-終了"].map(x=>`ある会場で資格試験を実施する際のアクティビティである“受付”と“試験”の依存関係のうち、プレシデンスダイアグラム法（PDM）の${x}関係はどれか。`),
 56:["移行テスト","性能テスト","システム間結合テスト","機能テスト"].map(x=>`システムの${x}を実施する主要な目的はどれか。`),
 58:["システム監査人がインタビュー実施時にすべきことのうち、最も適切なものはどれか。"],
 60:["A社では、自然災害などの際の事業継続を目的として、業務システムのデータベースのバックアップを取得している。その状況について、“情報セキュリティ管理基準（平成28年）”に従って実施した監査結果として判明した状況のうち、監査人が指摘事項として監査報告書に記載すべきものはどれか。"],
 61:["アプリケーションアーキテクチャ","データアーキテクチャ","テクノロジアーキテクチャ","ビジネスアーキテクチャ"].map(x=>`エンタープライズアーキテクチャを構成する${x}について説明したものはどれか。`),
 62:["オンデマンド型のサービスはどれか。"],63:["BI（Business Intelligence）の活用事例として、適切なものはどれか。"],
 64:[..."abcd"].map(x=>`ビッグデータの活用事例を、ビッグデータの分析結果のフィードバック先と反映タイミングで分類した場合、表中の${x}に該当する活用事例はどれか。`),
};
export function parsePdm(text:string){const m=/^(受付|試験)の(開始|終了)から(\d+)分経過したら、(受付|試験)を(開始|終了)する。$/.exec(text);assert(m,"unreviewed PDM statement");assert.notEqual(m[1],m[4]);return{from:{task:m[1],event:m[2]},to:{task:m[4],event:m[5]},lag:Number(m[3]),kind:`${m[2]}-${m[5]}`};}
export function assertLegacy2019Management(source:string,body:GeneratedBody,values:number[]){
 const n=Number(source.split("-").at(-1)),v=values[0];assert(prompts[n]);assert.equal(body.prompt.length,n===64?2:1);assert(body.prompt[0].type==="paragraph");assert.equal(body.prompt[0].text,prompts[n][prompts[n].length===1?0:v]);assert.equal(body.choices.length,4);assert.equal(body.answerParts,undefined);assert.equal(body.partAnswers,undefined);
 const text=body.choices.map(bs=>{assert.equal(bs.length,1);assert(bs[0].type==="paragraph");return bs[0].text;});let matches:boolean[];
 if(n===52){assert.deepEqual(text,legacy2019ManagementOriginalChoices[52]);const target=body.prompt[0].text.match(/PDM）の(.+)関係/)!;assert(target);const edges=text.map(parsePdm);assert.deepEqual(edges.map(e=>e.lag),[30,10,45,20]);matches=edges.map(e=>e.kind===target[1]);assert.deepEqual(edges[3],{from:{task:"試験",event:"開始"},to:{task:"受付",event:"終了"},lag:20,kind:"開始-終了"});}
 else{const actual=text.map(t=>{const f=facts.get(t);assert(f,`unreviewed proposition ${source}: ${t}`);return f;});
  const roles:Record<number,string[]>={50:["async","style","syndicate","social"],56:["migration","performance","integration","function"],58:["evidence","intervene","experience-only","avoid-record-check"],60:["procedure","restore-test","external-protection","offsite"],61:["data","application","technology","business"],62:["media","forecast","schedule","request"],63:["collect-competitor","analyze-data","learning","workflow"],64:["feedback","feedback","feedback","feedback"]};assert.deepEqual(actual.map(f=>f.role),roles[n]);
  if(n===64){const diagram=body.prompt[1];assert(diagram.type==="diagram");assert(diagram.scene.kind==="source_figure");assert.equal(diagram.scene.profile,"legacy-2019-data-feedback");assert.deepEqual(diagram.scene.values,[v]);assert(diagram.alt.includes(`問うセル${"abcd"[v]}を太枠で示す。`));assert(diagram.alt.includes("aは全体/期間ごと、bは全体/即時、cは個々/期間ごと、dは個々/即時"));const recipient=v<2?"all":"individual",timing=v%2===0?"periodic":"instant";matches=actual.map(f=>f.recipient===recipient&&f.timing===timing);assert.deepEqual(text,legacy2019ManagementOriginalChoices[64]);}
  else if(n===60){matches=actual.map(f=>f.fit===false);assert.deepEqual(actual.filter(f=>f.fit===false).map(f=>f.role),[["offsite"],["procedure"],["restore-test"],["external-protection"]][v],"input fault role mismatch");}else if([58,62,63].includes(n)){matches=actual.map(f=>f.fit===true);if(n===62)assert.equal(actual[3].mechanism,["video","print","resource"][v],"input on-demand mechanism mismatch");if(n===58||n===63){const original=legacy2019ManagementOriginalChoices[n];const signatures:Record<number,string[][]>={58:[[original[1],original[2],original[3]],["気付いた設定の不備を直すために、監査人がその場で本番システムの設定を変更する。","対象の実務を知らない場合でも、過去に監査を受けた経験だけで対象者を選び、実務の担当者には確認しない。","記録を残すと発言者が慎重になるので、面談の内容は文書にせず、監査人の記憶だけで報告する。"],["監査対象の運用手続が適切かを確認する代わりに、監査人自身が実務の承認者となって運用を続ける。","肩書の高い者であれば実際の処理を把握しているとみなし、回答を確認できる担当者への面談は省略する。","面談記録を他の監査人と照合せず、相違や矛盾があっても確認しない。"]],63:[[original[0],original[2],original[3]],["競合企業の動向を把握するため、展示会で担当者から公開情報を聞き取り、競合商品の資料を収集する。","遠隔地の社員がオンラインの授業へ参加し、講師から説明を受けて課題の回答を提出する。","申請を受け付けるとあらかじめ定めた承認者へ自動的に回付し、承認待ちの手続を通知する。"],["競合他社が公開する決算説明会を視聴して説明資料を集め、他社の事業計画や経営方針に関する説明を確認する。","安全教育の受講者が仮想環境で作業を体験し、教材に従って操作の練習と確認テストを行う。","申請した金額や所属に従い決裁経路を振り分け、電子的な承認と決裁の手順を進める。"]]};assert.deepEqual(n===58?text.slice(1):[text[0],text[2],text[3]],signatures[n][v],"input distractor mechanism mismatch");}}
  else{const target:Record<number,string[]>={50:["async","style","syndicate","social"],56:["migration","performance","integration","function"],61:["application","data","technology","business"]};matches=actual.map(f=>f.role===target[n][v]);}
 }
 assert.equal(matches.filter(Boolean).length,1,"unique independently classified answer");assert.equal(body.correctIndex,matches.indexOf(true),"independent answer mismatch");
 const e=legacy2019ManagementExplanationReview[n];for(const clause of e.common)assert(body.explanation.includes(clause),`explanation missing/polarity ${source}: ${clause}`);if(e.reasons){assert(body.explanation.startsWith(e.reasons[v]),`explanation condition ${source}`);for(let i=0;i<e.reasons.length;i++)if(i!==v)assert(!body.explanation.includes(e.reasons[i]),`explanation other condition ${source}`);}
}
