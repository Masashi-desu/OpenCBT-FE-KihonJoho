import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
/** Independently fixed from the 2024 A14 / 2017 spring AM56 source images.
 * Do not import production statements, truth flags, or calculation helpers. */
export const developmentOperationsReview={
 checkedOn:"2026-10-19",
 source:"2024-a-14",page:7,
 questionSha256:"c8a462741a1111950f7376e3ebd9bd0b2eff75d32fa9cfa3e39e97b7bf979789",
 answerSha256:"2f72e5e6ef0dafc14bbe8c52a174979b506c560ee26e67af223c1aabae70778e",
 references:["https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_qs.pdf#page=7","https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_fe_kamoku_a_ans.pdf#page=1","https://www.ipa.go.jp/shiken/faq.html"],
 originalAnswer:"ウ",
 stem:"システムの開発部門と運用部門が別々に組織化されているとき、システム開発を伴う新規サービスの設計及び移行を円滑かつ効果的に進めるための方法のうち、適切なものはどれか。",
 originalChoices:["運用テストの完了後に、開発部門がシステム仕様と運用方法を運用部門に説明する。","運用テストは、開発部門の支援を受けずに、運用部門だけで実施する。","運用部門からもシステムの運用に関わる要件の抽出に積極的に参加する。","開発部門は運用テストを実施して、運用マニュアルを作成し、運用部門に引き渡す。"],
 valid:[[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0]],
 roles:["共有の時期","支援の有無","要件抽出への参加","テスト結果/運用資料/引渡し条件の共同確認"],
 material:"両公式原画像・全4択・公式正答を確認。第三者の文章/図/規格引用の表示を認めなかった。教育目的のIPA利用条件の範囲で出典・改変を表示する。独自起草の生成記述・解説を公式解説や規格原文と扱わない。",
 terminology:"原問及び全8生成記述に英字略語はない。要件抽出/運用テスト/引渡しの役割を独自解説の各選択肢の理由として説明し、略語の正式名称を捏造しない。",
 precision:"数値計算/丸め/選択肢の数値間隔はない。4位置の取組条件を独立に真偽判断する原の負担を保つ。4有効入力のうち基準を避けても3、基準と直前を避けても少なくとも2が残る。無限周回で4問を越えて同入力を永久に避けられるという意味ではない。",
 history:"実配信済みrev7/3.2.0からrev8/3.5.0への原形式修正。旧問題の正答の誤りはこの査読で認めず、通常の非互換改訂とし撤回通知による保存セッション削除/再採点を行わない。",
};
const facts=[
 {yes:"運用テストの実施前に、開発部門と運用部門がシステム仕様と運用方法を共有し、運用部門の確認結果をテスト計画へ反映する。",no:developmentOperationsReview.originalChoices[0],yesReason:/テスト前に仕様と運用方法を共有/,noReason:/完了後の説明だけでは.*準備へ反映できない/},
 {yes:"運用テストは、開発部門の支援を受けて、運用部門が実施する。",no:developmentOperationsReview.originalChoices[1],yesReason:/運用部門のテストを開発部門が支援/,noReason:/支援を得ずに運用部門だけへ任せる/},
 {yes:developmentOperationsReview.originalChoices[2],no:"運用部門は、システムの運用に関わる要件の抽出に参加しない。",yesReason:/運用部門も要件の抽出に参加/,noReason:/要件の抽出に参加しないと/},
 {yes:"開発部門と運用部門が共同で運用テストの結果及び運用マニュアルを確認し、引渡し条件に合意する。",no:developmentOperationsReview.originalChoices[3],yesReason:/両部門がテスト結果と手順を共同で確認/,noReason:/実施と資料の引渡しだけでは.*共同確認や合意が不足/},
];
export function developmentOperationsOracle(body:GeneratedBody,values:number[]){
 assert.deepEqual(body.prompt,[{type:"paragraph",text:developmentOperationsReview.stem}]);assert.equal(body.choices.length,4);assert.equal(body.contexts,undefined);assert.equal(body.answerParts,undefined);
 const options=body.choices.map(c=>{assert.equal(c.length,1);assert.equal(c[0].type,"paragraph");return (c[0] as {text:string}).text;}),truth=options.map((s,i)=>{assert([facts[i].yes,facts[i].no].includes(s),`unreviewed slot ${i}: ${s}`);return s===facts[i].yes;});
 assert.deepEqual(truth.map(Number),values);assert.deepEqual(truth.flatMap((yes,i)=>yes?[i]:[]),[body.correctIndex]);assert.equal(new Set(options).size,4);
 options.forEach((_,i)=>assert.match(body.explanation,truth[i]?facts[i].yesReason:facts[i].noReason));assert(body.explanation.includes(options[body.correctIndex!]));
}
