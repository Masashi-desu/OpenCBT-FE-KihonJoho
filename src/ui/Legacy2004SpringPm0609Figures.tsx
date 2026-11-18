import { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2004SpringPm0609Figures, recordFields } from '../core/generators/legacy-2004-spring-pm-06-09-figures';

function RecordLayout({values,caption}: BookletFigureProps) {
  const id=useId();
  const {fixed,group,detail}=recordFields(values[0]);
  const {profile,alt}=legacy2004SpringPm0609Figures[0];
  const column=104, rows=detail ? 102 : 68;
  const width=16+column*(fixed.length+(detail?.length??0));
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      <svg role="img" data-source-figure={profile} aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
        viewBox={'0 0 '+width+' '+rows}
        style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
        <title id={id+'-title'}>{caption}</title>
        <desc id={id+'-desc'}>{alt(values)}</desc>
        <g aria-hidden="true" stroke="currentColor" strokeWidth="1.5" fill="none">
          <rect x={8} y={8} width={width-16} height={rows-16}/>
          {fixed.slice(1).map((field,i)=><path key={field.name} d={'M'+(8+(i+1)*column)+' 8V'+(rows-8)}/>)}
          {group&&<>
            <path d={'M'+(8+fixed.length*column)+' 8V'+(rows-8)+'M'+(8+fixed.length*column)+' 35H'+(width-8)}/>
            {detail?.slice(1).map((field,i)=><path key={field.name} d={'M'+(8+(fixed.length+i+1)*column)+' 35V'+(rows-8)}/>)}
          </>}
        </g>
        <g aria-hidden="true" stroke="none" fill="currentColor" textAnchor="middle" fontSize={14}>
          {fixed.map((field,i)=><g key={field.name} data-record-field={field.name} data-digits={field.digits}>
            <text x={8+(i+0.5)*column} y={detail?46:29}>{field.name}</text>
            <text x={8+(i+0.5)*column} y={detail?69:50}>{field.digits+'けた'}</text>
          </g>)}
          {group&&<text x={8+(fixed.length+(detail?.length??0)/2)*column} y={27}>{group}</text>}
          {detail?.map((field,i)=><g key={field.name} data-record-field={field.name} data-digits={field.digits}>
            <text x={8+(fixed.length+i+0.5)*column} y={field.digits?58:70}>{field.name}</text>
            {field.digits>0&&<text x={8+(fixed.length+i+0.5)*column} y={81}>{field.digits+'けた'}</text>}
          </g>)}
        </g>
      </svg>
    </div>
  </figure>;
}
export const legacy2004SpringPm0609FigureRenderers: readonly BookletFigureRenderer[] = [{
  profile:legacy2004SpringPm0609Figures[0].profile, component:RecordLayout,
}];
