import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2017ManagementReview as reviews,legacy2017ManagementStems as stems} from "./legacy-2017-management-review";
import {legacy2017ManagementExplanationFacts} from "./legacy-2017-management-explanations";
/** Reviewed suitability facts, separate from the producer's flags and strings.
 * The source's generic time/author/member descriptions are insufficient to
 * establish the specifically asked purpose/form/independence, not universally
 * false statements about those activities or participants. */
export const legacy2017AuditPurposeFacts=[
 [
  {text:"監査依頼者に監査報告書を提出する前に、被監査部門に監査報告を行うため",suitable:false,reason:"提出の順序だけで、原案への意見交換で確かめる事項を示さない。"},
  {text:"監査依頼者へ提出する前に、被監査部門の説明や記録と照合し、報告内容の事実関係を確かめるため",suitable:true,reason:"原案の根拠を説明/記録と照合し事実誤認を防ぐ目的。"},
 ],
 [
  {text:"監査報告書に記載する改善勧告について、被監査部門の責任者の承認を受けるため",suitable:false,reason:"被監査部門に監査判断/勧告の承認権を与える目的ではない。"},
  {text:"改善勧告の前提とした事実に食違いがないか、被監査部門の責任者と確認するため",suitable:true,reason:"勧告そのものの承認でなく、その根拠事実の認識を照合する。"},
 ],
 [
  {text:"監査報告書の指摘事項を被監査部門が受け入れるかだけを確認し、根拠とした事実の認識は確認しないため",suitable:false,reason:"受容だけを問い、事実誤認の確認を放棄している。"},
  {text:"監査報告書に記載する指摘事項及び改善勧告について、事実誤認がないことを確認するため",suitable:true,reason:"公式原問の正答。指摘/勧告の前提となる事実を確かめる。"},
 ],
 [
  {text:"監査報告書の記載内容に関して調査が不足している事項を被監査部門に口頭で確認することによって、不足事項の追加調査に代えるため",suitable:false,reason:"証拠不足を口頭確認だけで代替する。必要な追加調査を省略する理由にならない。"},
  {text:"記載内容について事実認識を確認し、調査が不足している事項が判明すれば必要な追加調査へつなげるため",suitable:true,reason:"事実認識を合わせ、不足証拠には追加調査を維持する。"},
 ],
] as const;
export const legacy2017AuditTeamFacts=[
 [
  {text:"システム監査人が監査依頼者に代わって、被監査部門へ改善を命令する。",suitable:false,reason:"監査結果の報告と、管理側の改善命令の権限を混同する。"},
  {text:"監査依頼者が監査報告に基づく改善指示を行えるように、システム監査人は監査結果を監査依頼者に報告する。",suitable:true,reason:"公式正答。監査人が結果を報告し、監査依頼者が改善を指示する役割。"},
 ],
 [
  {text:"業務監査の一部として情報システムの監査を行う場合には、利用部門のメンバによる監査チームを編成して行う。",suitable:false,reason:"利用部門に所属することだけでは必要能力と対象からの独立性が保証されない。参加自体の一律禁止とはしない。"},
  {text:"業務監査の一部として情報システムの監査を行う場合には、監査に必要な専門能力をもち、監査対象業務から独立したメンバで監査チームを編成する。",suitable:true,reason:"必要な専門能力と監査対象業務からの独立性が文中に明示されている。"},
 ],
 [
  {text:"システム監査人が他の専門家の支援を受ける場合には、支援の範囲・方法、及び監査結果の判断は、他の専門家の責任において行う。",suitable:false,reason:"他専門家の支援を利用しても最終判断の責任を委譲しない。"},
  {text:"システム監査人が他の専門家の支援を受ける場合にも、支援の範囲・方法、及び監査結果の判断は、システム監査人の責任において行う。",suitable:true,reason:"支援の利用範囲/方法と監査結果判断を監査人の責任に保つ。"},
 ],
 [
  {text:"情報システム部門における開発状況の監査を行う場合には、開発内容を熟知した情報システム部門のメンバによる監査チームを編成して行う。",suitable:false,reason:"開発内容の熟知という条件だけでは、対象からの独立性と必要な監査能力が保証されない。"},
  {text:"情報システム部門における開発状況の監査を行う場合には、対象の開発業務に関与しておらず、監査に必要な専門能力と独立性を備えたメンバで監査チームを編成する。",suitable:true,reason:"対象開発への非関与/専門能力/独立性を全て解答前に明示する。"},
 ],
] as const;
export function legacy2017ManagementOracle(source:string,body:GeneratedBody,values:number[]){
 const number=Number(source.split("-").at(-1)),r=reviews.find(r=>r.number===number);assert(r,source);
 assert.equal(body.prompt.length,1);assert.equal(body.prompt[0].type,"paragraph");const prompt=(body.prompt[0]as{text:string}).text;
 assert.equal(body.choices.length,4);const options=body.choices.map(c=>{assert.equal(c.length,1);assert.equal(c[0].type,"paragraph");return(c[0]as{text:string}).text;});assert.equal(new Set(options).size,4);assert.match(prompt,/どれか。$/);assert.doesNotMatch(prompt,/不適切|誤って|該当しない/);
 let truth:boolean[]=[];
 if(number===47){
  assert.equal(prompt,stems[47]);assert.equal(options[2],r.choices[2]);
  const conditions=[[/作成者が説明し、参加者が質問やコメント/,/順番に司会者.*全員が発言.*司会者を交代/,/成果物を複数のレビュアに配布又は回覧/],[/自分のソースコードだけ.*他の参加者.*行わない/,/二人.*互いのコード.*文書化されたレビュー手順や正式な役割は定めず/,/都合のよい時点.*メール.*正式なレビュー手順や役割は定めない/],[/入力例.*アルゴリズム.*作成者が主導.*役割分担や結果の記録は行わない/,/順番に司会.*欠陥の分類や正式なレビュー記録は作成しない/,/同僚一人.*口頭.*共通の手順や役割分担は設けない/]];
  [0,1,3].forEach((slot,i)=>assert.match(options[slot],conditions[values[0]][i]));assert.match(options[2],/モデレータ.*明確な役割.*チェックリスト.*正式な記録/);
  // A in the original has no stated author-led/no-formal-process conditions;
  // never infer these absent facts to switch the question to walkthrough.
  truth=[false,false,true,false];
 }else if(number===50||number===54||number===57){
  assert.deepEqual(options,r.choices);
  const names=number===50?["ペアプログラミング","リファクタリング","テストファースト","プロトタイピング"]:number===54?["責任分担表","ガントチャート","トレンドチャート","アローダイアグラム"]:["サービスレベル管理","容量・能力管理","変更管理","インシデント及びサービス要求管理"];
  const matching=names.flatMap((name,i)=>prompt.includes(name)?[i]:[]);assert.deepEqual(matching,[values[0]]);
  if(number===50)assert.match(prompt,/^ソフトウェア開発の活動のうち、アジャイル開発においても重視されている.*はどれか。$/);
  if(number===54)assert.match(prompt,/^システム開発の進捗管理などに用いられる.*の説明はどれか。$/);
  if(number===57)assert.match(prompt,/^ITサービスマネジメントの活動のうち、.*として行うものはどれか。$/);
  const optionCriteria=number===50?[/2人.*協力.*一つのプログラム/,/外部仕様を変更.*なく.*内部構造を変更/,/テストケースを先に.*プログラムをコーディング/,/フィードバック.*試作品.*早期/]:number===54?[/人と責任.*マトリックス/,/日程.*計画と実績.*帯状/,/進捗.*予算.*折れ線/,/順序や相互関係.*ネットワーク/]:[/満足度.*合意.*サービス目標.*改善/,/ディスクの空き容量.*しきい値/,/変更.*影響度/,/障害報告.*既知の誤り/];optionCriteria.forEach((c,i)=>assert.match(options[i],c));truth=options.map((_,i)=>i===matching[0]);
 }else if(number===58||number===60){
  assert.equal(prompt,stems[number]);const facts=number===58?legacy2017AuditPurposeFacts:legacy2017AuditTeamFacts;
  truth=options.map((s,i)=>{const matches=facts[i].filter(f=>f.text===s);assert.equal(matches.length,1,`unreviewed ${source} option ${i}`);assert(matches[0].reason.length>15);return matches[0].suitable;});
  assert.deepEqual(truth,values.map(v=>v===1));
  if(number===60){if(truth[1])assert.match(options[1],/専門能力.*監査対象業務から独立/);if(truth[3])assert.match(options[3],/対象の開発業務に関与しておらず.*専門能力と独立性/);}
 }else if(number===59){
  assert.deepEqual(options,r.choices);assert.match(prompt,/^.*リスクに対するコントロールを監査する際のチェックポイントはどれか。$/);
  const risks=[{pattern:/漏えい、改ざん、不正使用/,check:1},{pattern:/古いドキュメント.*現行システム.*食い違う/,check:0},{pattern:/形式や記述方法.*担当者ごと.*読み違い/,check:2},{pattern:/プロトタイプ型開発.*必要なドキュメントが作成されず/,check:3}],f=risks.filter(r=>r.pattern.test(prompt));assert.equal(f.length,1);assert.equal(f[0],risks[values[0]]);truth=options.map((_,i)=>i===f[0].check);
 }else if(number===61){
  assert.deepEqual(options,r.choices);assert.match(prompt,/際に用いる手法はどれか。$/);
  const facts=[{pattern:/リスクや投資価値.*カテゴリ.*情報化投資.*最適な資源配分/,name:"ITポートフォリオ"},{pattern:/顧客・市場、競合、自社.*三つ.*環境を分析/,name:"3C分析"},{pattern:/組織全体.*業務・データ・アプリケーション・技術.*整合する構造/,name:"エンタープライズアーキテクチャ"},{pattern:/優れた他組織.*比較基準.*差を分析.*改善/,name:"ベンチマーキング"}],f=facts.filter(f=>f.pattern.test(prompt));assert.equal(f.length,1);assert.equal(f[0],facts[values[0]]);truth=options.map(s=>s===f[0].name);
 }else if(number===62){
  assert.deepEqual(options,r.choices);assert.match(prompt,/^ITサービスをアウトソーシングする際の、.*リスクへの対応策はどれか。$/);
  const facts=[{pattern:/システム保守品質・運用品質の低下リスク/,check:2},{pattern:/自社人材の能力強化.*委託先.*支援の計画が合意されない/,check:0},{pattern:/サービスごとの料金内訳.*明らかでなく.*サービス費用.*確認できない/,check:1},{pattern:/自社側.*費用を査定できる人材がなく.*評価できない/,check:3}],f=facts.filter(f=>f.pattern.test(prompt));assert.equal(f.length,1);assert.equal(f[0],facts[values[0]]);truth=options.map((_,i)=>i===f[0].check);
 }
 assert.deepEqual(truth.flatMap((b,i)=>b?[i]:[]),[body.correctIndex],`${source}: all four independently reviewed suitability values`);
 for(const f of legacy2017ManagementExplanationFacts(number))assert(body.explanation.includes(f.clause),`${source}: explanation mapping/condition ${f.clause}`);
 assert(body.explanation.length>100);assert.doesNotMatch(body.explanation,/原の|生成の誤答|別原問|転載|同じ位置へ|追加しない/);
}
