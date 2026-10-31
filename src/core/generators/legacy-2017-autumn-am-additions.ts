import {field,figure,p,strings,variableNotes,type GenerationDefinition}from './definition';
export const legacy2017AutumnAmUsbProfile='legacy-2017-usb-plug-cross-sections';
export const legacy2017AutumnAmUsbAlts=[
 '長方形の外郭の中に、下寄りの水平片と横一列の四つの接点がある。',
 '横長で両端が丸い外郭の中に、横長の開口と上下二列それぞれ十二個の接点がある。上下の配置は対称である。',
 '上部が横長で、左右の下部に段差のある外郭の中に、横一列の五つの接点がある。',
 '左右の下隅が斜めになった外郭の中に、下向きに並ぶ五つの細長い部分がある。上辺に二つの突出部と三つの小さな突起がある。',
] as const;
export function legacy2017AutumnAmUsbAlt(index:number){if(!Number.isInteger(index)||index<0||index>3)throw Error('FIGURE_DOMAIN');return legacy2017AutumnAmUsbAlts[index];}
const descriptions=[
 '企業内外のデータを蓄積し，分類・加工・分析して活用することによって，企業の意思決定の迅速化を支援する手法',
 '企業内の慣行などにとらわれず，業務プロセスを抜本的に再構築することによって，コスト・品質・サービスなどを改善する手法',
 '企業内の業務の流れを可視化し，業務改善サイクルを適用することによって，継続的な業務改善を図る手法',
 '企業内の異なるシステムを互いに連結し，データやプロセスの統合を図ることによって，システムを全体として効率よく活用する手法',
];
const targets=['BI（Business Intelligence）','BPR（Business Process Reengineering）','BPM（Business Process Management）','EAI（Enterprise Application Integration）'];
const account=[
 'BIは、蓄積したデータを分類・加工・分析し、意思決定を支援する。',
 'BPRは、従来の慣行にとらわれず業務プロセスを抜本的に再構築する。',
 'BPMは、業務の流れの可視化と改善サイクルを通じて継続的に業務を改善する。',
 'EAIは、異なるシステム間を連結し、データやプロセスを統合する。',
];
function definition(n:number,title:string,answer:string,count:number,build:GenerationDefinition['build'],notes:string):GenerationDefinition{return {source:`2017h29a-fe-am-${n}`,title,sourceAnswer:answer,version:'3.2.0',fields:[field('出題対象',0,count-1)],reference:[0],notes:variableNotes+notes,build:v=>{if(v.length!==1||!Number.isInteger(v[0])||v[0]<0||v[0]>=count)throw Error('PARAMETER_CONSTRAINT');return build(v);}};}
export const legacy2017AutumnAmAdditionDefinitions:readonly GenerationDefinition[]=[
 definition(11,'USBプラグ側コネクタの断面','イ',2,([v])=>({prompt:[p(`USB Type-${v===0?'C':'A'}のプラグ側コネクタの断面図はどれか。ここで，図の縮尺は同一ではない。`)],choices:[0,1,2,3].map(i=>[figure(legacy2017AutumnAmUsbProfile,[i],'断面図',legacy2017AutumnAmUsbAlt(i))]),correctIndex:v===0?1:0,explanation:`${v===0?'USB Type-Cは、横長で両端が丸く、上下に対称な接点配置をもつイの断面である。':'USB Type-Aは、長方形の外郭と下寄りの片に並ぶ四つの接点をもつアの断面である。'} Type-Cの上下各十二接点の断面と、Type-Aの四接点で上下非対称な断面を区別する。ウには五つの横並びの接点と段差、エには斜めの両下隅と下向きに並ぶ五つの部分があり、ア・イとは外郭と内部配置が異なる。図は同じ縮尺で描かれていないので、図の幅だけで実物の大小を比べない。`}),
 ' 原4断面図と縮尺注記を固定し、Type-C/Aという識別対象だけを同じ問位置へbind。2条件/異なる正答内容2/直前回避後1。ウ/エの未確認規格名は付けない。元IPA簡略図から独自管理SVGを作り、USB仕様文書・写真・ロゴは取り込まない。原図固定画像を生成へ使わず、図alt/ARIAにも正答規格名を含めない。'),
 definition(65,'BI・BPR・BPM・EAIの説明','ア',4,([v])=>({prompt:[p(`${targets[v]}を説明したものはどれか。`)],choices:strings(descriptions),correctIndex:v,explanation:`${account[v]} アはデータ分析による意思決定の支援、イは業務プロセスの抜本的な再構築、ウは可視化と改善サイクルによる継続的な改善、エは異なるシステムの連結・統合を説明している。名称を説明へ対応させると、${targets[v]}には${'アイウエ'[v]}だけが該当する。`}),
 ' 名称から説明を選ぶ原方向と原4説明の全役割・順を固定。BI/BPR/BPM/EAIの実対象4を同じ位置へbindし、逆向きの名称選択や誤対応の否定問題へ変えない。4条件/異なる正答内容4/直前回避後3。特定の規格条文・第三者書籍や他年度のBPR問題への権利判断は行わない。'),
];
export const legacy2017AutumnAmAdditionStudyTerms=[
 {term:'USB Type-C',meaning:'上下に対称な接点配置をもつUSBコネクタ形式。',sources:['2017h29a-fe-am-11']},
 {term:'USB Type-A',meaning:'長方形の外郭と上下非対称な内部配置をもつUSBコネクタ形式。',sources:['2017h29a-fe-am-11']},
 {term:'BI',meaning:'蓄積したデータの分析によって意思決定を支援する考え方。',sources:['2017h29a-fe-am-65']},
 {term:'BPR',meaning:'業務プロセスを抜本的に再構築する考え方。',sources:['2017h29a-fe-am-65']},
 {term:'BPM',meaning:'業務の可視化と改善サイクルによって継続的な改善を進める考え方。',sources:['2017h29a-fe-am-65']},
 {term:'EAI',meaning:'異なるシステムを連結し、データやプロセスを統合する考え方。',sources:['2017h29a-fe-am-65']},
];
