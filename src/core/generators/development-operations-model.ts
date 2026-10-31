import {field,p,strings,variableNotes,type GenerationDefinition} from "./definition";

/** The source asks for an appropriate collaboration method. Keep all four
 * roles; do not add a purpose that makes other good practices distractors. */
export function makeDevelopmentOperationsRole():Omit<GenerationDefinition,"source">{
 const descriptions=[
  ["運用テストの完了後に、開発部門がシステム仕様と運用方法を運用部門に説明する。","運用テストの実施前に、開発部門と運用部門がシステム仕様と運用方法を共有し、運用部門の確認結果をテスト計画へ反映する。"],
  ["運用テストは、開発部門の支援を受けずに、運用部門だけで実施する。","運用テストは、開発部門の支援を受けて、運用部門が実施する。"],
  ["運用部門は、システムの運用に関わる要件の抽出に参加しない。","運用部門からもシステムの運用に関わる要件の抽出に積極的に参加する。"],
  ["開発部門は運用テストを実施して、運用マニュアルを作成し、運用部門に引き渡す。","開発部門と運用部門が共同で運用テストの結果及び運用マニュアルを確認し、引渡し条件に合意する。"],
 ];
 const reasons=[
  ["完了後の説明だけでは、運用部門の確認を運用テストの準備へ反映できない。","テスト前に仕様と運用方法を共有し、運用部門の確認を計画へ反映する。"],
  ["開発部門の支援を得ずに運用部門だけへ任せると、設計の意図や問題への対応を十分に引き継げない。","運用部門のテストを開発部門が支援し、両部門が協力する。"],
  ["運用部門が要件の抽出に参加しないと、運用に必要な条件を設計へ反映しにくい。","運用部門も要件の抽出に参加し、運用に必要な条件を設計へ反映する。"],
  ["開発部門による実施と資料の引渡しだけでは、運用部門との共同確認や合意が不足する。","両部門がテスト結果と手順を共同で確認し、合意した条件で引き渡す。"],
 ];
 return {title:"開発と運用の連携",sourceAnswer:"ウ",version:"3.5.0",fields:["情報共有の時期","運用テストへの開発支援","運用要件への参加","運用テストと引渡しの共同確認"].map(n=>field(n,0,1)),reference:[0,0,1,0],notes:variableNotes+" 原の円滑かつ効果的に進める方法という肯定の問いを固定し、情報共有の時期/開発支援/運用要件への参加/運用テストと引渡しという4記述の役割を維持する。追加目的による正答の選別をやめ、各記述の実際の取組条件を0/1でバインドする。全16入力のうち適切な取組が一つだけの4入力を受理し、12入力を明示拒否。配置は生成入力に数えない。基準は原の全4択とウ正答を維持する。内容改訂により旧生成器3.2.0の保存履歴は最新版と非互換になり、旧回答/結果を新問題へ引き継がず再採点しない。",build:values=>{
  if(values.length!==4||values.some(v=>!Number.isInteger(v)||v<0||v>1)||values.reduce((a,b)=>a+b,0)!==1)throw Error("PARAMETER_CONSTRAINT");
  const choices=descriptions.map((pair,i)=>pair[values[i]]),correctIndex=values.indexOf(1);
  return {prompt:[p("システムの開発部門と運用部門が別々に組織化されているとき、システム開発を伴う新規サービスの設計及び移行を円滑かつ効果的に進めるための方法のうち、適切なものはどれか。")],choices:strings(choices),correctIndex,explanation:`適切なのは「${choices[correctIndex]}」。${reasons.map((pair,i)=>pair[values[i]]).join("")} 部門を分けていても、要件の抽出、テスト、引渡しを通じて情報を共有し、必要な支援と合意を得る。`};
 }};
}
