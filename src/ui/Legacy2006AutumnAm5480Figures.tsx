import React, { useId, type ReactNode } from 'react';
import type { BookletFigureRenderer, BookletFigureProps } from './booklet-figure-renderer-contract';
import { autumn2006AmOC, autumn2006AmScatterPoints, legacy2006AutumnAm5480Figures } from '../core/generators/legacy-2006-autumn-am-54-80-figures';

const ticks=[-20,-15,-10,-5,0,5,10,15,20,25];
const x=(v:number)=>146+v*5;
const y=(v:number)=>126-v*4.7;
type ChartDescription = { id: string; description: ReactNode };
function Scatter({i,option,id,description}:{i:number;option:number} & ChartDescription) {
  return <svg className="diagram-svg" viewBox="0 0 288 246" width="288" height="246" role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
    style={{display:'block',maxWidth:'100%',height:'auto'}}>
    {description}
    <g stroke="currentColor" fill="none" strokeWidth="1.65">
      <path d="M 6 126 H 284 M 146 232 V 20" />
      {ticks.filter(v=>v!==0).map(v=><path key={v} d={`M ${x(v)} 126 v -6 ${v!==25?`M 146 ${y(v)} h 6`:''}`} />)}
    </g>
    <g fill="currentColor">
      {[0,-20,-10,10,20].map(v=><text key={v} x={x(v)-(v===0?7:0)} y="142" textAnchor="middle" fontSize="12">{v===0?'0':String(v).replace('-','−')}</text>)}
      {[-20,-10,10,20].map(v=><text key={v} x="141" y={y(v)+4} textAnchor="end" fontSize="12">{String(v).replace('-','−')}</text>)}
      {autumn2006AmScatterPoints(option,i).map(([vx,vy],j)=><circle key={j} cx={x(vx)} cy={y(vy)} r="3.9" />)}
    </g>
  </svg>;
}

function OC({i,id,description}:{i:number} & ChartDescription) {
  const mx=(v:number)=>57+v*4.95, my=(v:number)=>303-v*247;
  const {positions:[p1,p2],levels:[l1,l2]}=autumn2006AmOC(i);
  const first={x:mx(p1),y:my(l1)}, second={x:mx(p2),y:my(l2)};
  const left=mx(0), top=my(1), bottom=my(0), end=mx(100);
  const w1=first.x-left,w2=second.x-first.x,w3=end-second.x;
  const path=`M ${left} ${top} C ${left+w1*0.35} ${top+9}, ${left+w1*0.72} ${first.y-18}, ${first.x} ${first.y}
    C ${first.x+w2*0.24} ${first.y+(second.y-first.y)*0.78}, ${second.x-w2*0.37} ${second.y-19}, ${second.x} ${second.y}
    C ${second.x+w3*0.38} ${second.y+(bottom-second.y)*0.53}, ${end-w3*0.16} ${bottom-3}, ${end} ${bottom}`;
  return <svg className="diagram-svg" viewBox="0 0 664 342" width="664" height="342" role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
    style={{display:'block',width:'100%',minWidth:'430px',height:'auto'}}>
    {description}
    <g stroke="currentColor" fill="none" strokeWidth="2">
      <path d={`M ${left} 34 V ${bottom} H 590 m -9 -5 9 5 -9 5 M ${left-6} 46 l 6 -12 6 12`} />
      <path d={path} data-oc-curve="true"/>
      {[first,second].map(({x,y})=><path key={x} d={`M ${left} ${y} H ${x} V ${bottom}`} strokeDasharray="3 4" />)}
    </g>
    <g fill="currentColor" fontSize="19">
      <text x="9" y="25">合格率</text><text x="15" y={top+6}>1.0</text>
      <text x="15" y={first.y+7}>L1</text><text x="15" y={second.y+7}>L2</text>
      <text x="45" y="329">0</text><text x={first.x-10} y="329">p1</text><text x={second.x-10} y="329">p2</text>
      <text x={end-16} y="329">100</text><text x="567" y="329">不良率（％）</text>
    </g>
  </svg>;
}
function Chart({caption,values,option}:{option:number}&BookletFigureProps) {
  const definition=legacy2006AutumnAm5480Figures[option+1];
  const id=useId();
  const description=<><title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{definition.alt(values)}</desc></>;
  return <div className="managed-diagram source-figure" data-figure-profile={definition.profile}
    style={{color:'var(--diagram-ink)',width:'100%',maxWidth:'max-content',marginInline:'auto'}}>
    {option<0?<div className="diagram-scroll" tabIndex={0}><OC i={values[0]} id={id} description={description}/></div>:<Scatter i={values[0]} option={option} id={id} description={description}/>}
  </div>;
}
export const legacy2006AutumnAm5480FigureRenderers:readonly BookletFigureRenderer[]=legacy2006AutumnAm5480Figures.map((figure,i)=>({
  profile:figure.profile,component:props=><Chart {...props} option={i-1}/>,
}));
