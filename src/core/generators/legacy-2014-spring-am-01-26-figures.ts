import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

const prefix = 'legacy-2014-spring-am-';
export const spring2014Am0126Profiles = {
  tree: prefix+'6-binary-tree',
  concatenation: prefix+'8-concatenation',
  circuit: prefix+'22-gate-circuit',
  dependencies: prefix+'26-dependencies',
} as const;
const profiles = spring2014Am0126Profiles;

type Tree = readonly [symbol:string, left?:Tree, right?:Tree];
export const treeCases:readonly Tree[] = [
  ['＋',['a'],['＊',['－',['b'],['c']],['d']]],
  ['＊',['－',['a'],['＋',['b'],['c']]],['d']],
  ['－',['＊',['a'],['b']],['＋',['c'],['d']]],
  ['＋',['＊',['a'],['－',['b'],['c']]],['d']],
];
export const concatenationCases = [
  { first:'X', second:'Y', start:1, ends:['m','n'] },
  { first:'Y', second:'X', start:1, ends:['n','m'] },
  { first:'X', second:'Y', start:3, ends:['m','n'] },
  { first:'Y', second:'X', start:2, ends:['n','m'] },
] as const;
export const gateKinds = ['AND','OR','NAND','NOR'] as const;

type Dependency = readonly [determinant:string, values:string];
export const dependencyCases:readonly (readonly [Dependency, Dependency, Dependency])[] = [
  [['a','bcde'],['b','fgh'],['e','ij']],
  [['a','bcde'],['c','fgi'],['d','hj']],
  [['a','bcde'],['e','fhi'],['b','gj']],
  [['a','bcde'],['d','gij'],['c','fh']],
];

function treeAlt(tree:Tree):string {
  const [symbol,left,right]=tree;
  const descriptions=[
    left&&symbol+'の左の子は'+left[0]+'。',
    right&&symbol+'の右の子は'+right[0]+'。',
    left&&treeAlt(left),
    right&&treeAlt(right),
  ];
  return descriptions.filter(Boolean).join('');
}

const descriptors:Record<string,{last:number;alt:(i:number)=>string}>={
  [profiles.tree]:{
    last:treeCases.length-1,
    alt:i=>'2分木の根は'+treeCases[i][0]+'。'+treeAlt(treeCases[i]),
  },
  [profiles.concatenation]:{
    last:concatenationCases.length-1,
    alt:i=>{
      const {ends}=concatenationCases[i];
      return '開始、ループ1 k：1，1，'+ends[0]+'、処理a、ループ1終端、ループ2 k：1，1，'+ends[1]+
        '、処理b、ループ2終端、終了。ループ端の繰返し指定は，変数名：初期値，増分，終値を示す。';
    },
  },
  [profiles.circuit]:{
    last:gateKinds.length-1,
    alt:i=>'XとYを上の'+gateKinds[i]+'素子へ入力する。XとYをそれぞれ反転し，下の'+gateKinds[i]+
      '素子へも入力する。二つの素子の出力を右端の'+gateKinds[i]+'素子に入力し，その出力をZとする。分岐の接続点は黒丸。',
  },
  [profiles.dependencies]:{
    last:dependencyCases.length-1,
    alt:i=>'項目間の従属性。'+dependencyCases[i].map(([key,values])=>key+'から'+[...values].join('，')+'へそれぞれ矢印。').join(''),
  },
};

export const legacy2014SpringAm0126Figures:BookletFigureDefinition[]=Object.entries(descriptors).map(([profile,d])=>({
  profile,domain:[[0,d.last]],
  validate(values) {
    if(values.length!==1 || !Number.isSafeInteger(values[0]) || values[0]<0 || values[0]>d.last)
      throw Error('FIGURE_DOMAIN');
  },
  alt:([i])=>d.alt(i),
}));
export function spring2014Am0126Figure(profile:string,i:number,caption:string) {
  const descriptor=legacy2014SpringAm0126Figures.find(item=>item.profile===profile);
  if(!descriptor)throw Error('FIGURE_PROFILE');
  descriptor.validate([i]);
  return figure(profile,[i],caption,descriptor.alt([i]));
}
