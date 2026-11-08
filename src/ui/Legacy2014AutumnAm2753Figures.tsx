import { useId } from 'react';
import {
  criticalPathActivities, criticalPathAlt, criticalPathNodes, legacy2014AutumnAmCriticalPathProfile,
} from '../core/generators/legacy-2014-autumn-am-27-53-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

const eventRadius = 11.5;
function arrowLine(from: readonly [number, number], to: readonly [number, number]) {
  const [x1, y1] = from, [x2, y2] = to;
  const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
  const x = dx * eventRadius / length, y = dy * eventRadius / length;
  return { x1: x1 + x, y1: y1 + y, x2: x2 - x, y2: y2 - y };
}

function CriticalPath({ values, caption }: BookletFigureProps) {
  const id = useId(), arrow = 'url(#' + id + '-arrow)';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox="0 0 568 244" role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', marginInline: 'auto', width: 'calc(568px * var(--image-scale, 1))',
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{criticalPathAlt(values)}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" textAnchor="middle" fontSize="14" fill="none" stroke="currentColor" strokeWidth="1.15">
          {criticalPathNodes.map(([x, y], index) =>
            <circle key={index} data-event={index} cx={x} cy={y} r={eventRadius}/>)}
          {criticalPathActivities(values[0]).map(({ name, from, to, days, nameX, nameY, daysX, daysY }) =>
            <g key={name} data-activity={name} data-from={from} data-to={to} data-days={days}>
              <line {...arrowLine(criticalPathNodes[from], criticalPathNodes[to])} markerEnd={arrow}/>
              <text x={nameX} y={nameY} fill="currentColor" stroke="none">{name}</text>
              <text x={daysX} y={daysY} fill="currentColor" stroke="none">{days}</text>
            </g>)}
          <g data-activity-legend="">
            <circle cx="466" cy="61" r={eventRadius}/><circle cx="535" cy="61" r={eventRadius}/>
            <line {...arrowLine([466, 61], [535, 61])} markerEnd={arrow}/>
            <text x="450" y="31" textAnchor="start" fill="currentColor" stroke="none">凡例</text>
            <text x="501" y="52" fill="currentColor" stroke="none">作業</text>
            <text x="501" y="85" fill="currentColor" stroke="none">所要日数</text>
          </g>
        </g>
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

export const legacy2014AutumnAm27To53Renderers: BookletFigureRenderer[] = [
  { profile: legacy2014AutumnAmCriticalPathProfile, component: CriticalPath },
];
