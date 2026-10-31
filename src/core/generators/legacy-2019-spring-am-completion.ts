import {field,figure,p,strings,variableNotes,type GenerationDefinition} from './definition';

function define(number:number,title:string,count:number,build:GenerationDefinition['build'],notes:string):GenerationDefinition{
 return{source:`2019h31h-fe-am-${number}`,title,sourceAnswer:'ア',version:'3.2.0',fields:[field('誤条件',0,count-1)],reference:[0],answerVariation:'fixed',notes:variableNotes+' '+notes,build:values=>{
  if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=count)throw Error('PARAMETER_CONSTRAINT');return build(values);
 }};
}
export function legacy2019SpringCauseEffectAlt(values:number[]):string{
 if(values.length!==1||values[0]!==0)throw Error('PARAMETER_CONSTRAINT');
 return '右端の枠aへ向かう水平の主幹に、下左の枠bからの斜めの矢印が接続する。';
}
const dcWrong=[
 ['受電設備からCPUなどのLSIまで、同じ電圧のまま給電できる。','停電の危険がないので、電源バックアップ用のバッテリを不要にできる。','トランスを用いて容易に昇圧、降圧ができる。'],
 ['整流後の直流を降圧せずに、CPUへそのまま供給できる。','停電しても、蓄電池や発電機を用いずに、直流給電装置だけで無期限に給電を続けられる。','直流電圧をトランスへ直接入力し、その巻数比だけで出力電圧を変えられる。'],
 ['機器ごとの必要電圧をそろえずに、全て同じ直流電圧で動作させられる。','整流装置が全て停止しても、バックアップ電源なしでサーバの消費電力を供給し続けられる。','直流だけをトランスに流すと磁束が変動し続けるので、容易に電圧を変えられる。'],
];
const dcReasons=[
 '直流給電でも各機器やCPUに適した電圧への変換は必要であり、停電対策の蓄電池も必要となる。トランスは電流による磁束の変化を利用するため、一定の直流をそのまま通して昇圧・降圧することはできない。',
 '整流装置の出力とCPUの動作電圧は同一とは限らず、必要な電圧へ変換する。商用電源が止まれば蓄電池や発電機などのエネルギー源が必要であり、給電装置だけで無期限の電力を作ることはできない。トランスの巻数比による電圧変換には磁束の時間変化が必要なので、直流の直接入力だけでは成立しない。',
 '同じ直流方式でも必要電圧は機器によって異なり、それに合わせる。整流装置が全て停止したときに負荷へ給電し続けるには別の電源が要る。一定の直流による定常磁束は変化し続けず、トランスで電圧を変えるにはスイッチングなどによる変化が必要である。',
];
export const legacy2019SpringAmCompletionDefinitions:GenerationDefinition[]=[
 define(23,'直流給電の利点',3,([v])=>({prompt:[p('データセンタなどで採用されているサーバ、ネットワーク機器に対する直流給電の利点として、適切なものはどれか。')],choices:strings(['交流から直流への変換、直流から交流への変換で生じる電力損失を低減できる。',...dcWrong[v]]),correctIndex:0,explanation:'直流給電では交流と直流の相互変換を減らすことで、変換で生じる電力損失を低減できる。'+dcReasons[v]+' CPUはCentral Processing Unit（中央処理装置）、LSIはLarge Scale Integration（大規模集積回路）である。直流給電の採用だけで、異なる負荷の電圧条件や電源の故障・停電がなくなるわけではない。'}),'原の利点を選ぶ4説明択、変換損失の固定正答と電圧条件/停電バックアップ/トランスの3誤答役割を維持。原条件0と、降圧不要/無限給電/巻数比直接変換、異なる負荷電圧/整流停止/定常磁束の各誤命題を区別する3条件。電源の具体的製品仕様や新前提を本文に加えない。'),
 define(77,'特性要因図の因果関係',3,([v])=>({prompt:[p('図は特性要因図の一部を表したものである。a、bの関係はどれか。'),figure('legacy-2019-spring-cause-effect',[0],'特性要因図の一部',legacy2019SpringCauseEffectAlt([0]))],choices:strings(['bはaの原因である。',['bはaの手段である。','bはaの実現のための手段である。','bはaの測定のための手段である。'][v],'bはaの属性である。','bはaの目的である。']),correctIndex:0,explanation:'特性要因図は結果である特性と、それに影響する要因との関係を表す。主幹の先のaが特性、枝側のbがその原因（要因）なので、bはaの原因である。'+['原因を、aを実現するための手段一般と取り違えない。','aが生じる要因と、aを実現するために選ぶ手段とは別の関係である。','aが生じる要因と、aの状態や値を測るための手段とは別の関係である。'][v]+' bはa自体が持つ属性でも、aの目指す目的でもない。QCはQuality Control（品質管理）の略で、特性要因図はQC七つ道具の一つである。'}),'図のa/bの役割、問い方向、原因/手段/属性/目的の4関係を固定する。原条件0の全択は厳密保持。手段誤答だけを実現手段/測定手段という異なる誤解へbindした小域3条件。単なる属性の言換え、名前/位置/選択肢の順替えを意味容量に数えず、raw3・新たな下位誤命題2・正答固定を分けて査読する。'),
];
