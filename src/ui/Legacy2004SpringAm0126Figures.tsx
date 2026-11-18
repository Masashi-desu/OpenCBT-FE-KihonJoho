import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { branchCases, branchGates, scans, sumCases, sumRows } from '../core/generators/legacy-2004-spring-am-01-26-models';
import { legacy2004SpringAm0126Figures, profiles, type FigureKind } from '../core/generators/legacy-2004-spring-am-01-26-figures';

type DrawingProps = BookletFigureProps & {kind: FigureKind; width: number; height: number; children: ReactNode};
function Drawing({kind,values,caption,width,height,children}: DrawingProps) {
  const id = useId();
  const profile = profiles[kind];
  const alt = legacy2004SpringAm0126Figures.find(item=>item.profile===profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
        viewBox={'0 0 '+width+' '+height}
        style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
        <title id={id+'-title'}>{caption}</title>
        <desc id={id+'-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</g>
      </svg>
    </div>
  </figure>;
}
function Label({x,y,size=16,children}: {x:number; y:number; size?:number; children:ReactNode}) {
  return <text x={x} y={y} fontSize={size} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}
function Arrow({d}: {d:string}) {
  const id = useId();
  return <>
    <defs><marker id={id} viewBox="0 0 12 10" refX={10} refY={5} markerWidth={8} markerHeight={7} orient="auto">
      <path d="M1 1L10 5 1 9" fill="none" stroke="currentColor"/>
    </marker></defs>
    <path d={d} markerEnd={'url(#'+id+')'}/>
  </>;
}
function Diamond({x,y,children}: {x:number; y:number; children:ReactNode}) {
  return <g>
    <path d={'M'+x+' '+(y-24)+'l76 24 -76 24 -76 -24Z'} fill="var(--diagram-surface)"/>
    <Label x={x} y={y+5}>{children}</Label>
  </g>;
}
function Terminal({x,y,children}: {x:number; y:number; children:ReactNode}) {
  return <g><rect x={x-56} y={y-14} width={112} height={28} rx={14} fill="var(--diagram-surface)"/>
    <Label x={x} y={y+5}>{children}</Label></g>;
}
function Operation({x,y,children}: {x:number; y:number; children:ReactNode}) {
  return <g><rect x={x-67} y={y-16} width={134} height={32} fill="var(--diagram-surface)"/>
    <Label x={x} y={y+5}>{children}</Label></g>;
}

function SumTable(props: BookletFigureProps) {
  const i=props.values[0];
  const {a,b,carry}=sumCases[i];
  return <Drawing {...props} kind="sum-table" width={362} height={236}>
    <rect x={12} y={12} width={338} height={212}/>
    <path d="M95 12V224M178 12V224M264 42V224M178 42H350M12 76H350"/>
    <Label x={54} y={48}>A</Label><Label x={137} y={48}>B</Label>
    <Label x={264} y={33}>{a+'と'+b+(carry?'と1':'')+'の和'}</Label>
    <Label x={221} y={64}>C</Label><Label x={307} y={64}>S</Label>
    {sumRows(i).map((row,j)=>{
      const y=76+j*37;
      return <g key={j} data-sum-row={row.join(',')}>
        {j>0&&<path d={'M12 '+y+'H350'}/>}
        {row.map((value,k)=><Label key={k} x={[54,137,221,307][k]} y={y+24}>{value}</Label>)}
      </g>;
    })}
  </Drawing>;
}

const exitX={1:248,2:514} as const;
function BranchTree(props: BookletFigureProps) {
  const [ff,ft,tf,tt]=branchCases[props.values[0]];
  const paths=[
    {d:tt,x:124,y:244,start:'M124 168V244',a:1,b:1},
    {d:tf,x:216,y:191,start:'M200 144H216V191',a:1,b:0},
    {d:ft,x:346,y:264,start:'M346 168V264',a:0,b:1},
    {d:ff,x:455,y:219,start:'M422 144H455V219',a:0,b:0},
  ];
  const firstOne = Math.min(...paths.filter(item=>item.d===1).map(item=>item.y));
  const firstTwo = Math.min(...paths.filter(item=>item.d===2).map(item=>item.y));
  const drawRoute=(x:number,y:number,end:number)=>{
    const crossings=[];
    if (x<exitX[1]&&end>exitX[1]&&y>firstOne)crossings.push(exitX[1]);
    if (x<346&&end>346&&y<264)crossings.push(346);
    if (x<455&&end>455&&y<219)crossings.push(455);
    return crossings.map(at=>'H'+(at-6)+'q6 -12 12 0').join('')+'H'+end;
  };
  return <Drawing {...props} kind="branch-tree" width={583} height={340}>
    <path d="M124 20V40M124 88V120M200 64H346V120"/>
    <Label x={140} y={111} size={14}>真</Label><Label x={235} y={54} size={14}>偽</Label>
    <Label x={141} y={187} size={14}>真</Label><Label x={223} y={137} size={14}>偽</Label>
    <Label x={362} y={187} size={14}>真</Label><Label x={454} y={137} size={14}>偽</Label>
    {paths.map(item=><g key={item.y} data-branch-input={''+item.a+item.b} data-branch-exit={item.d}>
      <Arrow d={item.start+drawRoute(item.x,item.y,exitX[item.d])}/>
    </g>)}
    <path d={'M248 '+firstOne+'V300M514 '+firstTwo+'V300'}/>
    <Diamond x={124} y={64}>A</Diamond><Diamond x={124} y={144}>B</Diamond><Diamond x={346} y={144}>B</Diamond>
    <Terminal x={248} y={314}>exit 1</Terminal><Terminal x={514} y={314}>exit 2</Terminal>
  </Drawing>;
}
function BranchOption(props: BookletFigureProps) {
  const gate=branchGates[props.values[0]];
  return <Drawing {...props} kind="branch-option" width={345} height={159}>
    <path d="M93 12V34M93 82V118M169 58H270V118"/>
    <Label x={110} y={102} size={14}>真</Label><Label x={200} y={49} size={14}>偽</Label>
    <g data-logic={gate} data-true="1" data-false="2"><Diamond x={93} y={58}>{'A '+gate+' B'}</Diamond></g>
    <Terminal x={93} y={132}>exit 1</Terminal><Terminal x={270} y={132}>exit 2</Terminal>
  </Drawing>;
}
function ArraySearch(props: BookletFigureProps) {
  const {begin,bound,limit,continues,advance,step}=scans[props.values[0]];
  return <Drawing {...props} kind="array-search" width={416} height={374}>
    <path d="M155 43V65M155 97V127M155 175V210M155 258V286M231 151H326V294M326 294V310"/>
    <Arrow d="M231 234H326"/>
    <Arrow d="M155 318V348H38V111H155"/>
    <Terminal x={155} y={29}>開始</Terminal>
    <g data-begin={begin}><Operation x={155} y={81}>{begin+' → k'}</Operation></g>
    <g data-bound={bound} data-exits-on={limit}><Diamond x={155} y={151}>{'k : '+bound}</Diamond></g>
    <Label x={246} y={141}>{limit}</Label><Label x={173} y={194}>{continues}</Label>
    <Diamond x={155} y={234}>X : A(k)</Diamond>
    <Label x={247} y={224}>＝</Label><Label x={174} y={276}>≠</Label>
    <g data-advance={advance+step}><Operation x={155} y={302}>{'k '+advance+' '+step+' → k'}</Operation></g>
    <Terminal x={326} y={324}>終了</Terminal>
  </Drawing>;
}
export const legacy2004SpringAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  {profile:profiles['sum-table'], component:SumTable},
  {profile:profiles['branch-tree'], component:BranchTree},
  {profile:profiles['branch-option'], component:BranchOption},
  {profile:profiles['array-search'], component:ArraySearch},
];
