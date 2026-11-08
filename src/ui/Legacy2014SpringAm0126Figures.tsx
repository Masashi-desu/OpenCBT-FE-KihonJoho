import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  concatenationCases, dependencyCases, gateKinds, legacy2014SpringAm0126Figures, spring2014Am0126Profiles as profiles, treeCases,
} from '../core/generators/legacy-2014-spring-am-01-26-figures';

function Figure({diagram,values,caption,width,height,children,gateKind}:BookletFigureProps & {
  diagram:keyof typeof profiles; width:number; height:number; children:(arrow:string)=>ReactNode; gateKind?:string;
}) {
  const id=useId(), definition=legacy2014SpringAm0126Figures.find(d=>d.profile===profiles[diagram])!;
  definition.validate(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
        data-legacy-2014-spring-am-diagram={diagram} data-gate-kind={gateKind}
        style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',color:'var(--diagram-ink)'}}>
        <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{definition.alt(values)}</desc>
        <defs><marker id={id+'-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" fontSize="16">
          {children('url(#'+id+'-arrow)')}
        </g>
      </svg>
    </div>
  </figure>;
}

function Text({x,y,children,left=false}:{x:number;y:number;children:ReactNode;left?:boolean}) {
  return <text x={x} y={y} textAnchor={left?'start':'middle'} fill="currentColor" stroke="none">{children}</text>;
}

type Tree=(typeof treeCases)[number];
type Position={label:string;x:number;y:number};
function TreeDrawing(props:BookletFigureProps) {
  const nodes:Position[]=[], edges:[Position,Position][]=[];
  let column=0;
  const place=(node:Tree,depth:number):Position=>{
    const [label,left,right]=node;
    const leftPos=left?place(left,depth+1):undefined;
    const position={label,x:36+column*55,y:32+depth*58};
    column++;
    nodes.push(position);
    const rightPos=right?place(right,depth+1):undefined;
    if(leftPos)edges.push([position,leftPos]);
    if(rightPos)edges.push([position,rightPos]);
    return position;
  };
  place(treeCases[props.values[0]],0);
  return <Figure {...props} diagram="tree" width={402} height={237}>{()=> <>
    {edges.map(([a,b])=><path key={a.label+b.label} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} data-tree-edge={a.label+'>'+b.label}/>)}
    {nodes.map(({label,x,y})=><g key={label} data-tree-node={label}>
      <circle cx={x} cy={y} r="16" fill="var(--diagram-surface)"/><Text x={x} y={y+5}>{label}</Text>
    </g>)}
  </>}</Figure>;
}

function Concatenation(props:BookletFigureProps) {
  const {ends}=concatenationCases[props.values[0]];
  return <Figure {...props} diagram="concatenation" width={508} height={391}>{()=> <>
    <path d="M139 35V357"/>
    <rect x="37" y="7" width="204" height="32" rx="16" fill="var(--diagram-surface)"/>
    <Text x={139} y={29}>開始</Text>
    {ends.map((end,i)=>{
      const y=52+i*148;
      return <g key={i} data-loop-end={end}>
        <path d={`M37 ${y+14}l14 -14h176l14 14v36H37z`} fill="var(--diagram-surface)"/>
        <Text x={139} y={y+19}>ループ {i+1}</Text><Text x={139} y={y+40}>k：1，1，{end}</Text>
        <rect x="37" y={y+61} width="204" height="31" fill="var(--diagram-surface)"/>
        <rect x="101" y={y+66} width="76" height="21" />
        <Text x={139} y={y+82}>{'ab'[i]}</Text>
        <path d={`M37 ${y+103}h204v31l-14 12H51l-14 -12z`} fill="var(--diagram-surface)"/>
        <Text x={139} y={y+130}>ループ {i+1}</Text>
      </g>;
    })}
    <rect x="37" y="357" width="204" height="32" rx="16" fill="var(--diagram-surface)"/>
    <Text x={139} y={379}>終了</Text>
    <Text x={263} y={69} left>（注）ループ端の繰返し指定は，</Text>
    <Text x={296} y={91} left>変数名：初期値，増分，終値</Text>
    <Text x={296} y={113} left>を示す。</Text>
  </>}</Figure>;
}

function Circuit(props:BookletFigureProps) {
  const kind=gateKinds[props.values[0]], curved=kind==='OR'||kind==='NOR', inverted=kind==='NAND'||kind==='NOR';
  const pin=inverted?52:44;
  const gates=[[176,43],[176,123],[280,83]];
  return <Figure {...props} diagram="circuit" width={394} height={168} gateKind={kind}>{()=> <>
    <Text x={26} y={39}>X</Text><Text x={26} y={57}>Y</Text><Text x={365} y={89}>Z</Text>
    <path d="M43 34H176M43 52H176M71 34V112H107M94 52V137H107"/>
    <circle cx="71" cy="34" r="3" fill="currentColor"/><circle cx="94" cy="52" r="3" fill="currentColor"/>
    {[112,137].map(y=><g key={y} transform={`translate(107 ${y})`}>
      <path d="M0 -10L19 0L0 10z" fill="var(--diagram-surface)"/>
      <circle cx="23" cy="0" r="4" fill="var(--diagram-surface)"/>
      <path d={y===112?'M27 0H53V2H69':'M27 0H53V-5H69'}/>
    </g>)}
    <path d={`M${176+pin} 43H250V74H280M${176+pin} 123H250V92H280M${280+pin} 83H351`}/>
    {gates.map(([x,y])=><g key={x+':'+y} transform={`translate(${x} ${y})`}>
      <path d={curved?'M0 -17Q28 -20 44 0Q28 20 0 17Q9 0 0 -17z':'M0 -17H24A17 17 0 0 1 24 17H0z'}
        fill="var(--diagram-surface)"/>
      {!curved&&<path d="M41 0H44"/>}
      {inverted&&<circle cx="48" cy="0" r="4" fill="var(--diagram-surface)"/>}
      {curved&&<path d="M0 -9H4M0 9H4"/>}
    </g>)}
  </>}</Figure>;
}

function Dependencies(props:BookletFigureProps) {
  const [[root,firstLevel],...mid]=dependencyCases[props.values[0]];
  const y=(i:number)=>31+i*34;
  return <Figure {...props} diagram="dependencies" width={470} height={190}>{arrow=> <>
    <Text x={40} y={y(0)+5}>{root}</Text>
    {[...firstLevel].map((node,i)=><g key={node} data-dependency={root+'>'+node}>
      <Text x={202} y={y(i)+5}>{node}</Text>
      <path d={`M56 ${y(0)+i*3}L185 ${y(i)}`} markerEnd={arrow}/>
    </g>)}
    {[...'fghij'].map((node,i)=><Text key={node} x={429} y={y(i)+5}>{node}</Text>)}
    {mid.flatMap(([from,children])=>[...children].map((to,i)=><path key={from+to} data-dependency={from+'>'+to}
      d={`M218 ${y(firstLevel.indexOf(from))+i*3}L412 ${y('fghij'.indexOf(to))}`} markerEnd={arrow}/>))}
  </>}</Figure>;
}

export const legacy2014SpringAm0126Renderers:BookletFigureRenderer[]=[
  {profile:profiles.tree,component:TreeDrawing},
  {profile:profiles.concatenation,component:Concatenation},
  {profile:profiles.circuit,component:Circuit},
  {profile:profiles.dependencies,component:Dependencies},
];
