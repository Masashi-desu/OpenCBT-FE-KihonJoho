import {useId,type ReactNode} from 'react';
import type {BookletFigureProps,BookletFigureRenderer} from './booklet-figure-renderer-contract';
import {branchOperators,drawingAlt,drawingIds,profile,scheduleCases,schedulePhases,systemObservations,taskStates,type DrawingId} from '../core/generators/legacy-2008-autumn-am-27-53-figures';

type Props=BookletFigureProps&{id:DrawingId};
function Drawing({id,values,caption,width,height,children}:Props&{width:number;height:number;children:(arrow:string)=>ReactNode}) {
  const uid=useId(),title=uid+'-title',description=uid+'-desc',arrow=uid+'-arrow';
  const alt=drawingAlt(id,values[0]);
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={alt}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={title} aria-describedby={description}
        style={{color:'var(--diagram-ink)',width:`calc(${width}px * var(--image-scale, 1))`,maxWidth:'none',height:'auto',display:'block',marginInline:'auto'}}>
        <title id={title}>{caption}</title><desc id={description}>{alt}</desc>
        <defs>
          <marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" strokeWidth="1.4"/>
          </marker>
        </defs>
        <g fontSize="16">{children('url(#'+arrow+')')}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Label({x,y,children,anchor='middle'}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end'}) {
  return <text x={x} y={y} textAnchor={anchor} fill="currentColor" stroke="none">{children}</text>;
}

function State(props:Props) {
  const positions=[[244,48],[125,124],[365,124]];
  const paths=[
    'M17 124H52','M157 109L212 66','M231 66L177 111','M262 66L315 111','M290 124H199','M317 48H360',
  ];
  return <Drawing {...props} width={488} height={156}>{arrow=><>
    {paths.map((d,i)=><path key={d} d={d} data-task-edge={i} fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}/>)}
    {positions.map(([x,y],i)=><g key={i}>
      <ellipse cx={x} cy={y} rx="71" ry="17" fill="var(--surface)" stroke="currentColor" strokeWidth="1.5"/>
      <Label x={x} y={y+5}>{taskStates[i]}</Label>
    </g>)}
  </>}</Drawing>;
}

function Uptime(props:Props) {
  const index=props.values[0], observation=systemObservations[index];
  let boundary=45;
  const intervals=observation.map(([kind,label,complete])=>{
    const left=boundary,width=kind==='稼働'?90:70;
    boundary+=width;
    return {kind,label,complete,left,right:boundary,top:kind==='稼働'?69:119};
  });
  const height=index===0?174:194;
  return <Drawing {...props} width={boundary+55} height={height}>{arrow=><>
    <path d={`M20 94H${boundary+24}`} fill="none" stroke="currentColor" strokeWidth="1.25" markerEnd={arrow}/>
    {intervals.map(({kind,label,complete,left,right,top},i)=>{
      const middle=(left+right)/2;
      const priorTop=intervals[i-1]?.top??94;
      const broken=kind==='修理'&&(i===0||intervals[i-1].kind==='稼働');
      return <g key={label} data-uptime-label={label}>
        <path d={`M${left} ${priorTop}V${top}H${right}`} fill="none" stroke="currentColor" strokeWidth="2"/>
        <Label x={middle} y={kind==='稼働'?87:112}>{kind}</Label>
        {broken&&<>
          <Label x={left} y={30}>故障発生</Label>
          <path d={`M${left} 37v24`} fill="none" stroke="currentColor" strokeWidth="2.2" markerEnd={arrow}/>
        </>}
        <path d={`M${left} 135v18`} fill="none" stroke="currentColor"/>
        {complete&&<path d={`M${right} 135v18`} fill="none" stroke="currentColor"/>}
        <path d={`M${left+20} 145H${left+2}`} fill="none" stroke="currentColor" markerEnd={arrow}/>
        <path d={`M${right-20} 145H${right-2}`} fill="none" stroke="currentColor" markerEnd={arrow}/>
        <Label x={middle} y={150}>{label}</Label>
        {!complete&&index!==0&&<Label x={middle} y={176}>継続中</Label>}
      </g>;
    })}
  </>}</Drawing>;
}

function Branch(props:Props) {
  const operator=branchOperators[props.values[0]];
  return <Drawing {...props} width={454} height={271}>{arrow=><>
    <path d="M196 17V45M196 115V163M196 198V245M313 80H387V227H197"
      fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M217 227H197" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}/>
    <path d="M196 45L313 80L196 115L79 80Z" fill="var(--surface)" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="128" y="163" width="136" height="35" fill="var(--surface)" stroke="currentColor" strokeWidth="1.5"/>
    <Label x={196} y={86}>{operator}</Label><Label x={216} y={140}>真</Label>
    <Label x={337} y={72}>偽</Label><Label x={196} y={186}>命令</Label>
  </>}</Drawing>;
}

function Allocation(props:Props) {
  const {work,time}=scheduleCases[props.values[0]];
  const left=18, top=18, col=132, header=58, row=32;
  const bottom=top+header+2*row;
  return <Drawing {...props} width={left*2+5*col} height={bottom+18}>{()=> <>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x={left} y={top} width={5*col} height={header+2*row}/>
      {[1,2,3,4].map(i=><path key={i} d={`M${left+i*col} ${top}V${bottom}`}/>)}
      {[0,1].map(i=><path key={i} d={`M${left} ${top+header+i*row}h${5*col}`}/>)}
      <path d={`M${left} ${top}l${col} ${header}`}/>
    </g>
    <Label x={left+col-8} y={top+20} anchor="end">工程名</Label><Label x={left+8} y={top+50} anchor="start">項目</Label>
    {schedulePhases.map((phase,i)=><Label key={phase} x={left+(i+1.5)*col} y={top+34}>{phase}</Label>)}
    {[['工数配分',...work.map(value=>value+'%')],['期間配分',...time.map(value=>value+'%')]].map((values,j)=>
      values.map((value,i)=><Label key={j+','+i} x={left+(i+.5)*col} y={top+header+21+j*row}>{value}</Label>))}
  </>}</Drawing>;
}

const components:Record<DrawingId,(props:Props)=>ReactNode>={
  '29-state':State,'34-uptime':Uptime,'44-branch':Branch,'46-allocation':Allocation,
};
export const legacy2008AutumnAm2753FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=>{
    const Component=components[id];
    return <Component {...props} id={id}/>;
  },
}));
