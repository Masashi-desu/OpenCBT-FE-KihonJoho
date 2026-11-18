import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2005-spring-am-01-26-shared';
import { circuits, componentLabels, computerCases, conversionCases, parityMachineCases, stackCases, treeLabels, weatherCases, weatherNames, type Circuit } from './legacy-2005-spring-am-01-26-model';

export const profiles={
  conversion:'legacy-2005-spring-am-1-conversion',
  weather:'legacy-2005-spring-am-7-weather',
  automaton:'legacy-2005-spring-am-11-automaton',
  tree:'legacy-2005-spring-am-12-tree',
  instructions:'legacy-2005-spring-am-13-instructions',
  stack:'legacy-2005-spring-am-13-stack',
  gates:'legacy-2005-spring-am-17-gates',
  circuit:'legacy-2005-spring-am-17-circuit',
  computer:'legacy-2005-spring-am-26-computer',
} as const;
export type FigureKind=keyof typeof profiles;
export function circuitExpression(node:Circuit):string {
  if(typeof node==='string')return node;
  return node[0]==='NOT'?'NOT('+circuitExpression(node[1])+')':
    node[0]+'('+circuitExpression(node[1])+','+circuitExpression(node[2])+')';
}
const rules:Record<FigureKind,{count:number; description:(i:number)=>string}>={
  conversion:{count:4,description:i=>'開始。jを入力し，変換のループをk：1，1，'+conversionCases[i].size+
    'で実行する。ループの中はa，bの順。終了。繰返し指定は変数名：初期値，増分，終値の順。'},
  weather:{count:4,description:i=>weatherCases[i].rates.map((row,from)=>weatherNames[from]+'から翌日：'+
    row.map((rate,to)=>weatherNames[to]+' '+rate/10).join('、')).join('。')+'。'},
  automaton:{count:4,description:i=>{
    const {digit,even}=parityMachineCases[i];
    return '初期状態は偶。受理状態は'+(even?'偶':'奇')+'。偶→奇は'+digit+'、偶→偶は'+(1-digit)+'、奇→偶はa、奇→奇はb。';
  }},
  tree:{count:16,description:i=>{
    const vals=treeLabels(Math.floor(i/4),i%4);
    return '根から順に，各段を左から右へ示す。'+[vals.slice(0,1),vals.slice(1,3),vals.slice(3,7),vals.slice(7)]
      .map(layer=>layer.join('、')).join('／')+'。第3段で左から3番目のノードだけに子が二つある。';
  }},
  instructions:{count:4,description:i=>[...stackCases[i].ops].map(op=>op==='+'?'PUSH':'POP').join('→')+'。'},
  stack:{count:4,description:i=>'スタックの上から'+stackCases[i].top.join('、')+'。PUSHとPOPは上端で行う。'},
  gates:{count:1,description:()=> '左から論理積AND、論理和OR、否定NOTの回路記号。'},
  circuit:{count:20,description:i=>'AとBに対する回路。出力X＝'+circuitExpression(circuits[Math.floor(i/5)][i%5])+'。'},
  computer:{count:4,description:i=>{
    const order:readonly number[]=computerCases[i];
    const get=(role:number)=>componentLabels[order.indexOf(role)];
    return 'データ（実線）は入力装置→'+get(1)+'、'+get(1)+'→出力装置、'+get(1)+'→'+get(0)+'、'+get(1)+'→'+get(2)+'、'+get(2)+'→'+get(1)+
      '。制御（破線）は'+get(0)+'→入力装置、'+get(0)+'→'+get(1)+'、'+get(0)+'→'+get(2)+'、'+get(0)+'→出力装置。';
  }},
};
export const legacy2005SpringAm0126Figures:readonly BookletFigureDefinition[]=(Object.keys(profiles) as FigureKind[]).map(kind=>{
  const {count,description}=rules[kind];
  return {profile:profiles[kind],domain:[[0,count-1]],
    validate(values){finiteIndex(values,count,'FIGURE_PROFILE');},alt(values){return description(finiteIndex(values,count,'FIGURE_PROFILE'));}};
});
export function draw(kind:FigureKind,index:number,caption:string) {
  const {count,description}=rules[kind];
  return {...figure(profiles[kind],[index],caption,description(finiteIndex([index],count,'FIGURE_PROFILE'))),captionPresentation:'accessible' as const};
}
