import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { Legacy2016SpringAm0932Figure } from './legacy-2016-spring-am-09-32-figures';
import {
  autumn2014Am0126Profiles as p, legacy2014AutumnAm0126Figures, logicAdapterProfiles, logicKinds, operationCases, taskCases,
} from '../core/generators/legacy-2014-autumn-am-01-26-figures';

function Drawing({profile, values, caption, width, height, children}:BookletFigureProps & {
  profile:string; width:number; height:number; children:(arrow:string)=>ReactNode;
}) {
  const id=useId(), d=legacy2014AutumnAm0126Figures.find(figure=>figure.profile===profile)!;
  d.validate(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
        style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',color:'var(--diagram-ink)'}}>
        <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{d.alt(values)}</desc>
        <defs><marker id={id+'-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" fontSize="16">
          {children('url(#'+id+'-arrow)')}
        </g>
      </svg>
    </div>
  </figure>;
}
function Text({x,y,children}:{x:number;y:number;children:ReactNode}) {
  return <text x={x} y={y} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}
function Tasks(props:BookletFigureProps) {
  return <Drawing {...props} profile={p.tasks} width={553} height={168}>{arrow=> <>
    {taskCases[props.values[0]].map((times,i)=>{
      const y=21+i*72;
      return <g key={i} data-task={'AB'[i]}>
        <Text x={48} y={y+28}>タスク{'AB'[i]}</Text>
        {times.map((time,j)=>{
          const x=102+j*151;
          return <g key={j} data-task-ms={time}>
            <rect x={x} y={y} width="111" height="47" fill="var(--diagram-surface)"/>
            <Text x={x+55.5} y={y+19}>{j===1?'資源R':'CPU'}</Text>
            <Text x={x+55.5} y={y+38}>{time}ミリ秒</Text>
            {j<2&&<path d={`M${x+111} ${y+23}H${x+147}`} markerEnd={arrow}/>}
          </g>;
        })}
      </g>;
    })}
  </>}</Drawing>;
}
function Timeline(props:BookletFigureProps) {
  const {tick,on}=operationCases[props.values[0]];
  const x=(i:number)=>82+i*92, y=(run:number)=>run?42:99;
  const path=on.map((run,i)=>'V'+y(run)+'H'+x(i+1)).join('');
  return <Drawing {...props} profile={p.timeline} width={504} height={147}>{arrow=> <>
    <Text x={33} y={47}>運転</Text><Text x={33} y={104}>停止</Text>
    <path d={`M58 99H476`} markerEnd={arrow}/>
    {[0,1,2,3,4].map(i=><g key={i}>
      <path d={`M${x(i)} 23V100`} strokeDasharray="4 3" stroke="var(--diagram-border)"/>
      <Text x={x(i)} y={126}>{i*tick}</Text>
    </g>)}
    <path d={'M'+x(0)+' 99'+path+'V99'} strokeWidth="2.4" data-operating-intervals={on.join('')}/>
    <Text x={484} y={126}>分</Text>
  </>}</Drawing>;
}
function Logic(props:BookletFigureProps) {
  return <div className="diagram-scroll" tabIndex={0} aria-label={props.caption}><Legacy2016SpringAm0932Figure scene={{kind:'source_figure',profile:logicAdapterProfiles.logic,values:[...logicKinds[props.values[0]]]}} caption={props.caption}/></div>;
}
function Gate(props:BookletFigureProps) {
  return <div className="diagram-scroll" tabIndex={0} aria-label={props.caption}><Legacy2016SpringAm0932Figure scene={{kind:'source_figure',profile:logicAdapterProfiles.gate,values:props.values}} caption={props.caption}/></div>;
}
export const legacy2014AutumnAm0126Renderers:BookletFigureRenderer[] = [
  {profile:p.tasks,component:Tasks},{profile:p.logic,component:Logic},{profile:p.gate,component:Gate},{profile:p.timeline,component:Timeline},
];
