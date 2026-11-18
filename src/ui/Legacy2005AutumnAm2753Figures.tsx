import { useId } from 'react';
import { reliability35 } from '../core/generators/legacy-2005-autumn-am-27-53-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

function ReliabilityTimeline({ values, caption }: BookletFigureProps) {
  const id = useId();
  const periods = reliability35.panel(values);
  const width = periods.at(-1)!.end + 40;
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
        viewBox={'0 0 '+width+' 174'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id+'-title'}>{caption}</title>
        <desc id={id+'-desc'}>{reliability35.alt(values)}</desc>
        <defs>
          <marker id={id+'-arrow'} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0L8 4L0 8Z" fill="currentColor"/>
          </marker>
        </defs>
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d={'M18 90 H'+(width-17)} markerEnd={'url(#'+id+'-arrow)'}/>
          {periods.map(({ start, end, repair }, i) => {
            const y = repair ? 115 : 63;
            return <path key={i} d={'M'+start+' '+(i===0?90:repair?63:115)+' V'+y+' H'+end} strokeWidth="2.2"/>;
          })}
          {periods.map(({ start, end, repair }, i) => {
            const mid = (start + end) / 2;
            return <g key={i}>
              <path d={'M'+start+' 139 v12 M'+end+' 139 v12 M'+start+' 145 H'+(mid-13)+' M'+(mid+13)+' 145 H'+end}/>
              {i!==0 && !repair && <path d={'M'+start+' 141 l6 8 M'+start+' 149 l6 -8'}/>}
              {repair && <path d={'M'+(start+32)+' 30 Q'+(start+7)+' 39 '+start+' 75'} markerEnd={'url(#'+id+'-arrow)'}/>}
            </g>;
          })}
        </g>
        <g fill="currentColor" fontSize="15">
          {periods.map(({ start, end, repair, label }) => <g key={label} data-interval={label}>
            <text x={(start+end)/2} y={repair?108:83} textAnchor="middle">{repair?'修理':'稼働'}</text>
            <text x={(start+end)/2} y="150" textAnchor="middle">{label}</text>
            {repair && <><text x={start} y="85" textAnchor="middle">★</text><text x={start+29} y="24">故障発生</text></>}
          </g>)}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2005AutumnAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: reliability35.profile, component: ReliabilityTimeline },
];
