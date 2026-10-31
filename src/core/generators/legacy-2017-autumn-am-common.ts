import type {Attribution, Question} from '../types';

export const legacy2017AutumnAmCommonProfile='legacy-2017-autumn-am-common-gates';
export const legacy2017AutumnAmCommonDomain=[[0,0]] as const;
export const legacy2017AutumnAmCommonHeading='問題文中で共通に使用される表記ルール';
export const legacy2017AutumnAmCommonPremise='各問題文中に注記がない限り，次の表記ルールが適用されているものとする。';
export const legacy2017AutumnAmCommonNote='注記　入力部又は出力部に示されている○印は，論理状態の反転又は否定を表す。';
export const legacy2017AutumnAmCommonRows=[
 {id:'and',label:'論理積素子（AND）'},
 {id:'nand',label:'否定論理積素子（NAND）'},
 {id:'or',label:'論理和素子（OR）'},
 {id:'nor',label:'否定論理和素子（NOR）'},
 {id:'xor',label:'排他的論理和素子（XOR）'},
 {id:'xnor',label:'論理一致素子'},
 {id:'buffer',label:'バッファ'},
 {id:'not',label:'論理否定器（NOT）'},
 {id:'tristate',label:'スリーステートバッファ'},
] as const;
export function legacy2017AutumnAmCommonAlt(){
 return legacy2017AutumnAmCommonHeading+'。'+legacy2017AutumnAmCommonPremise+
 '表は図記号と説明の2列、次の9行。論理積は左が平面、右が半円の形に入力2本と出力1本。否定論理積はその出力部に○。論理和は入力側がくぼみ、出力側が尖った曲線形に入力2本と出力1本。否定論理和はその出力部に○。排他的論理和は論理和形の入力側にもう1本の曲線。論理一致は排他的論理和形の出力部に○。バッファは右向きの三角形に入力1本と出力1本。論理否定器はその出力部に○。スリーステートバッファは三角形にデータ入力、制御入力、出力。'+
 legacy2017AutumnAmCommonRows.map((r,i)=>`${i+1}行目、${r.label}`).join('。')+'。'+legacy2017AutumnAmCommonNote;
}
type Context=Question['contexts'][number];
export function legacy2017AutumnAmOriginalCommonContext(attribution:Attribution,assetId:string):Context{
 return {id:'context-2017h29a-fe-am-common',title:legacy2017AutumnAmCommonHeading,presentation:'text_figure',content:{attribution:structuredClone(attribution),blocks:[{type:'image',assetId,caption:legacy2017AutumnAmCommonHeading}]}};
}
export function legacy2017AutumnAmNativeCommonContext(attribution:Attribution):Context{
 return {id:'context-2017h29a-fe-am-common',title:legacy2017AutumnAmCommonHeading,presentation:'text_figure',content:{attribution:structuredClone(attribution),blocks:[{type:'diagram',id:'diagram-2017h29a-fe-am-common',rendererRef:{id:'renderer-source-figures',version:'1.0.0'},caption:'図記号と説明',attribution:structuredClone(attribution),alt:legacy2017AutumnAmCommonAlt(),scene:{kind:'source_figure',profile:legacy2017AutumnAmCommonProfile,values:[0]}}]}};
}
