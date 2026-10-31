import {field,p,strings,variableNotes,type GenerationDefinition} from "./definition";
export function family(period:"h"|"a",number:number,title:string,answer:string,stems:string[],choices:string[],reference:number,reasons:string[],choiceOverrides:Record<number,Record<number,string>>={}):GenerationDefinition{
  return {source:`2018h30${period}-fe-am-${number}`,title,sourceAnswer:answer,fields:[field("問う対象・条件",0,3)],reference:[reference],notes:variableNotes+" 原問の問いの方向、媒体、4選択肢の役割を保ち、四つの異なる対象・機能・条件を同じ位置へバインドする。単なる名称差替え・並替えや同じ正答の言換えにしない。全4入力の全択を独立して固定した知識資料で検査する。"+(Object.keys(choiceOverrides).length?" 条件1でフラット型組織を問うときは、説明の中に正答の呼称が露出する『フラット型の』だけを省く改変を行う。階層を少なくする実条件と原値の全文は維持し、名称の文字列一致による新たな手掛かりを防ぐ。":""),build:values=>{
    if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>3)throw Error("PARAMETER_CONSTRAINT");
    const target=values[0];return {prompt:[p(stems[target])],choices:strings(choices.map((text,i)=>choiceOverrides[target]?.[i]??text)),correctIndex:target,explanation:reasons[target]+" 他の選択肢との違い："+reasons.filter((_,i)=>i!==target).join(" ")};
  }};
}
