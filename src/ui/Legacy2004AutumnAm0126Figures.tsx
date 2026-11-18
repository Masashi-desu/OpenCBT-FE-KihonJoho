import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2004AutumnAm0126Figures, profiles, type FigureKind } from '../core/generators/legacy-2004-autumn-am-01-26-figures';
import { addressPairs, hashCases, logicCases, tree, type Gate } from '../core/generators/legacy-2004-autumn-am-01-26-models';

type DrawingProps=BookletFigureProps & {kind:FigureKind;width:number;height:number;children:ReactNode};
function Drawing({kind,values,caption,width,height,children}:DrawingProps) {
  const profile=profiles[kind],id=useId();
  const alt=legacy2004AutumnAm0126Figures.find(item=>item.profile===profile)!.alt(values);
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0}
    aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
    <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
      viewBox={'0 0 '+width+' '+height}
      style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
      <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</g>
    </svg>
  </div></figure>;
}
function Label({x,y,size=16,children}:{x:number;y:number;size?:number;children:ReactNode}) {
  return <text x={x} y={y} fontSize={size} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}
function Arrow({d}:{d:string}) {
  const id=useId();
  return <><defs><marker id={id} viewBox="0 0 12 10" refX={10} refY={5} markerWidth={8} markerHeight={7} orient="auto">
    <path d="M1 1L10 5 1 9" fill="none" stroke="currentColor"/>
  </marker></defs><path d={d} markerEnd={'url(#'+id+')'}/></>;
}

function SearchTree(props:BookletFigureProps) {
  const {target,nodes}=tree(props.values[0]);
  return <Drawing {...props} kind="tree" width={675} height={298}>
    {nodes.map(({x,y,p},i)=>p>=0&&<line key={i} x1={nodes[p].x} y1={nodes[p].y} x2={x} y2={y}/>)}
    {nodes.map(({value,x,y,p,left},i)=><g key={i} data-node={i} data-parent={p} data-left={left?'yes':'no'}>
      <circle cx={x} cy={y} r={17} strokeWidth={value===target?3:1.5} fill="var(--diagram-surface)"/>
      <Label x={x} y={y+6}>{value}</Label>
    </g>)}
  </Drawing>;
}

function HashArray(props:BookletFigureProps) {
  const {mod}=hashCases[props.values[0]];
  return <Drawing {...props} kind="hash-array" width={311} height={247}>
    <Label x={83} y={29}>位置</Label><Label x={188} y={29}>配列</Label>
    {['0','1','2','⋮',String(mod-2),String(mod-1)].map((value,i)=>{
      const y=40+28*i+(i>3?28:0), h=i===3?56:28;
      return <g key={value}><rect x={110} y={y} width={157} height={h}/>
        <Label x={i===3?188:83} y={y+h/2+6}>{value}</Label></g>;
    })}
  </Drawing>;
}

const gateEnd={AND:49,OR:57,NOT:52} as const;
function Shape({kind,x,y}:{kind:Gate;x:number;y:number}) {
  return <g data-logic-gate={kind} transform={'translate('+x+' '+y+')'} fill="var(--diagram-surface)">
    {kind==='AND'&&<path d="M0 -20h29a20 20 0 0 1 0 40H0Z"/>}
    {kind==='OR'&&<path d="M0 -20Q36 -25 57 0Q36 25 0 20Q13 0 0 -20Z"/>}
    {kind==='NOT'&&<><path d="M0 -19L43 0 0 19Z"/><circle cx={47.5} cy={0} r={4.5}/></>}
  </g>;
}
function InputWires({gate,x,y,width=23}:{gate:Gate;x:number;y:number;width?:number}) {
  const port=x+(gate==='OR'?6:0);
  if(gate==='NOT')return <path d={'M'+(port-width)+' '+y+'H'+port}/>;
  return <path d={'M'+(port-width)+' '+(y-9)+'H'+port+'M'+(port-width)+' '+(y+9)+'H'+port}/>;
}
function GateLegend(props:BookletFigureProps) {
  return <Drawing {...props} kind="gate-legend" width={434} height={87}>
    {(['AND','OR','NOT'] as const).map((kind,i)=>{
      const x=31+142*i, y=31;
      return <g key={kind}><Shape x={x} y={y} kind={kind}/>
        <InputWires gate={kind} x={x} y={y} width={21}/><path d={'M'+(x+gateEnd[kind])+' '+y+'h21'}/>
        <Label x={x+25} y={73}>{kind}</Label></g>;
    })}
  </Drawing>;
}
function LogicChain(props:BookletFigureProps) {
  const {first,second}=logicCases[props.values[0]], firstX=84,secondX=255,lastX=427, y=46;
  const firstPort=firstX+(first==='OR'?6:0), secondPort=secondX+(second==='OR'?6:0);
  return <Drawing {...props} kind="logic-chain" width={583} height={111}>
    <Label x={29} y={y-13}>A</Label><Label x={29} y={y+7}>B</Label><Label x={29} y={y+48}>C</Label>
    <path d={'M44 '+(y-18)+'H'+firstPort+'M44 '+(y+2)+'H'+firstPort}/>
    <Shape x={firstX} y={y-8} kind={first}/>
    <path d={'M'+(firstX+gateEnd[first])+' '+(y-8)+'H'+secondPort}/>
    <Label x={196} y={y-17}>P</Label>
    <path d={'M44 '+(y+44)+'H210V'+(y+12)+'H'+secondPort}/>
    <Shape x={secondX} y={y+2} kind={second}/>
    <path d={'M'+(secondX+gateEnd[second])+' '+(y+2)+'H'+lastX}/><Label x={367} y={y-9}>Q</Label>
    <Shape x={lastX} y={y+2} kind="NOT"/>
    <path d={'M'+(lastX+gateEnd.NOT)+' '+(y+2)+'H553'}/><Label x={527} y={y-9}>R</Label>
  </Drawing>;
}
function Address(props:BookletFigureProps) {
  const [from,to]=addressPairs[props.values[0]];
  return <Drawing {...props} kind="address" width={602} height={321}>
    <Label x={95} y={33}>命令部</Label><Label x={210} y={33}>アドレス部</Label>
    <rect x={37} y={43} width={231} height={35}/><path d="M152 43v35"/>
    <Label x={211} y={66}>{from}</Label><circle cx={234} cy={61} r={3.4} fill="currentColor"/>
    <Label x={413} y={51}>アドレス</Label><Label x={521} y={33}>主記憶</Label>
    <path d="M462 43h118v241q-26 12-55 0q-31-15-63 0z"/>
    {[76,109,142,207,244].map(y=><path key={y} d={'M462 '+y+'h118'}/>)}
    <Label x={521} y={67}>⋮</Label><Label x={521} y={132}>{to}</Label><Label x={521} y={179}>⋮</Label>
    <Label x={521} y={232}>データ</Label><Label x={521} y={273}>⋮</Label>
    <Label x={444} y={132}>{from}</Label><Label x={444} y={232}>{to}</Label><circle cx={542} cy={126} r={3.4} fill="currentColor"/>
    <Arrow d="M234 61C232 108 242 126 302 126H422"/>
    <Arrow d="M542 126C531 158 491 154 460 154H338C278 154 278 225 343 225H422"/>
  </Drawing>;
}

export const legacy2004AutumnAm0126FigureRenderers:readonly BookletFigureRenderer[]=[
  {profile:profiles.tree,component:SearchTree},
  {profile:profiles['hash-array'],component:HashArray},
  {profile:profiles['gate-legend'],component:GateLegend},
  {profile:profiles['logic-chain'],component:LogicChain},
  {profile:profiles.address,component:Address},
];
