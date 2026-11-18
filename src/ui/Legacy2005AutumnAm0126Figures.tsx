import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2005AutumnAm0126Figures, profiles, type FigureKind } from '../core/generators/legacy-2005-autumn-am-01-26-figures';
import { bits, circuitKinds, treeArities, xorCases } from '../core/generators/legacy-2005-autumn-am-01-26-model';

type DrawingProps = BookletFigureProps & { kind: FigureKind; width: number; height: number; children: ReactNode };
function Drawing({ kind, values, caption, width, height, children }: DrawingProps) {
  const profile=profiles[kind], id=useId();
  const alt=legacy2005AutumnAm0126Figures.find(figure=>figure.profile===profile)!.alt(values);
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
    <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'} viewBox={'0 0 '+width+' '+height}
      style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
      <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</g>
    </svg>
  </div></figure>;
}
function Label({x,y,children,size=15}: {x:number;y:number;size?:number;children:ReactNode}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor="middle" fontSize={size}>{children}</text>;
}

function XorChain(props: BookletFigureProps) {
  const {input,a,b,c}=xorCases[props.values[0]], output=input^a^b^c;
  const boxes=[109,266,423], starts=[64,231,388,545];
  return <Drawing {...props} kind="xor-chain" width={653} height={112}>
    <Label x={36} y={49}>入力</Label><Label x={36} y={68}>ビット列</Label><Label x={36} y={91}>{bits(input)}</Label>
    <Label x={617} y={49}>出力</Label><Label x={617} y={68}>ビット列</Label><Label x={617} y={91}>{bits(output)}</Label>
    {starts.map(x=><path key={x} d={'M'+x+' 45h20v-6l12 11-12 11v-6h-20z'}/>)}
    {[a,b,c].map((value,index)=><g key={index}>
      <Label x={boxes[index]+52} y={21}>ユニット{'ABC'[index]}</Label>
      <rect x={boxes[index]} y={30} width={104} height={66}/>
      <path d={'M'+boxes[index]+' 54h104'} strokeDasharray="2 2"/>
      <Label x={boxes[index]+52} y={47}>排他的論理和</Label>
      <Label x={boxes[index]+52} y={73}>内部かぎ</Label><Label x={boxes[index]+52} y={90}>{bits(value)}</Label>
    </g>)}
  </Drawing>;
}

function FullTree(props: BookletFigureProps) {
  const arity=treeArities[props.values[0]], leafCount=arity*arity, step=20;
  const leaves=Array.from({length:leafCount},(_,i)=>30+step*i);
  const parents=Array.from({length:arity},(_,i)=>(leaves[i*arity]+leaves[(i+1)*arity-1])/2);
  const center=(leaves[0]+leaves[leaves.length-1])/2, width=leaves.at(-1)!+95;
  return <Drawing {...props} kind="full-tree" width={width} height={182}>
    <Label x={24} y={22}>例</Label><Label x={width-32} y={145}>k＝2</Label>
    {parents.map((x,j)=><g key={j}><line x1={center} y1={42} x2={x} y2={90}/>
      {leaves.slice(j*arity,(j+1)*arity).map(leaf=><line key={leaf} x1={x} y1={96} x2={leaf} y2={139}/>)}
    </g>)}
    <circle cx={center} cy={42} r={8} fill="var(--diagram-surface)"/>
    {parents.map((x,i)=><circle key={i} cx={x} cy={92} r={7} fill="var(--diagram-surface)"/>)}
    {leaves.map((x,i)=><circle key={i} cx={x} cy={143} r={6} fill="var(--diagram-surface)"/>)}
  </Drawing>;
}

type GateType = 'AND'|'OR'|'XOR'|'NOT';
function Gate({kind,x,y,stems=true}: {kind:GateType;x:number;y:number;stems?:boolean}) {
  const orShape='M4 -13Q27 -18 45 0Q27 18 4 13Q12 0 4 -13z';
  return <g data-gate={kind} transform={'translate('+x+' '+y+')'}>
    {kind==='AND' && <path d="M3 -14H20a14 14 0 0 1 0 28H3z"/>}
    {(kind==='OR'||kind==='XOR') && <path d={orShape}/>}
    {kind==='XOR' && <path d="M-2 -14Q6 0 -2 14"/>}
    {kind==='NOT' && <><path d="M3 -12L34 0 3 12z"/><circle cx={39} cy={0} r={4}/></>}
    {stems && (kind==='NOT' ? <path d="M-12 0H3m40 0h12"/> : <path d={'M-14 -7h'+(kind==='AND'?17:21)+'m-'+(kind==='AND'?17:21)+' 14h'+(kind==='AND'?17:21)+'m'+(kind==='AND'?31:38)+' -7h12'}/>)}
  </g>;
}

function GateLegend(props: BookletFigureProps) {
  return <Drawing {...props} kind="gate-legend" width={455} height={72}>
    {(['AND','OR','XOR','NOT'] as const).map((kind,i)=><g key={kind}>
      <Gate kind={kind} x={37+i*108} y={23}/><Label x={58+i*108} y={60}>{kind}</Label>
    </g>)}
  </Drawing>;
}

function LogicChoice(props: BookletFigureProps) {
  const kind=circuitKinds[props.values[0]], second=kind==='AND'?'AND':kind==='NOR'?'OR':'XOR', negate=kind==='NOR'||kind==='XNOR';
  return <Drawing {...props} kind="logic-choice" width={negate?237:185} height={103}>
    <Gate kind="XOR" x={29} y={25}/><Gate kind="XOR" x={29} y={77}/>
    <path d="M74 25h21v19h34M74 77h21V58h34"/>
    <Gate kind={second} x={123} y={51} stems={false}/>
    {negate
      ? <><path d="M168 51h15"/><Gate kind="NOT" x={180} y={51} stems={false}/><path d="M223 51h12"/></>
      : <path d={'M'+(second==='AND'?157:168)+' 51h15'}/>}
  </Drawing>;
}

export const legacy2005AutumnAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles['xor-chain'], component: XorChain },
  { profile: profiles['full-tree'], component: FullTree },
  { profile: profiles['gate-legend'], component: GateLegend },
  { profile: profiles['logic-choice'], component: LogicChoice },
];
