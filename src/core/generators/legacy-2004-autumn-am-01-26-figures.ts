import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { finiteIndex } from './legacy-2004-autumn-am-01-26-shared';
import { addressPairs, hashCases, logicCases, tree } from './legacy-2004-autumn-am-01-26-models';

export const profiles={
  tree:'legacy-2004-autumn-am-12-tree',
  'hash-array':'legacy-2004-autumn-am-14-hash-array',
  'gate-legend':'legacy-2004-autumn-am-17-gate-legend',
  'logic-chain':'legacy-2004-autumn-am-17-logic-chain',
  address:'legacy-2004-autumn-am-18-address',
} as const;
export type FigureKind=keyof typeof profiles;
const rules:Record<FigureKind,{count:number;alt:(index:number)=>string}>={
  tree:{count:4,alt:index=>{
    const {target,nodes}=tree(index);
    return '根'+nodes[0].value+'。削除する節は'+target+'。'+
      nodes.slice(1).map(node=>nodes[node.p].value+'の'+(node.left?'左':'右')+'の子は'+node.value+'。').join('');
  }},
  'hash-array':{count:4,alt:index=>{
    const ending=hashCases[index].mod-1;
    return '位置0，1，2，…，'+(ending-1)+'，'+ending+'の配列。全欄空欄。';
  }},
  'gate-legend':{count:1,alt:()=> '左からAND回路、OR回路、NOT回路の記号。'},
  'logic-chain':{count:4,alt:index=>{
    const {first,second}=logicCases[index];
    return 'PはAとBの'+first+'、QはPとCの'+second+'、RはQのNOT。入力は左から、出力は右へ進む。';
  }},
  address:{count:4,alt:index=>{
    const [source,destination]=addressPairs[index];
    return '命令のアドレス部の値'+source+'から主記憶の'+source+'番地を指す。'+source+'番地の内容は'+destination+'。'+
      'そこから主記憶の'+destination+'番地を指し、その番地の内容はデータ。';
  }},
};
export const legacy2004AutumnAm0126Figures:readonly BookletFigureDefinition[]=(Object.keys(profiles) as FigureKind[]).map(kind=>{
  const {count,alt}=rules[kind];
  return {profile:profiles[kind],domain:[[0,count-1]],validate(values){finiteIndex(values,count,'FIGURE_PROFILE');},
    alt(values){return alt(finiteIndex(values,count,'FIGURE_PROFILE'));}};
});
export function draw(kind:FigureKind,index:number,caption:string) {
  const {count,alt}=rules[kind];
  return {...figure(profiles[kind],[index],caption,alt(finiteIndex([index],count,'FIGURE_PROFILE'))),captionPresentation:'accessible' as const};
}
