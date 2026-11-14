import React, { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2007SpringAm5480Figures as figures, routeNode, spring2007AmRoutes, spring2007AmSchemas } from '../core/generators/legacy-2007-spring-am-54-80-figures';

function Schemas({ caption, values }: BookletFigureProps) {
  const tables = spring2007AmSchemas(values[0]).tables;
  return <figure className="managed-diagram source-figure" style={{ minWidth: 0, maxWidth: '100%' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption} aria-description={figures[0].alt(values)}
      data-figure-profile={figures[0].profile} style={{ fontSize: 'calc(16px * var(--image-scale, 1))' }}>
      {tables.map(([name, columns, keyCount]) => <table key={name} style={{ width: 'max-content', whiteSpace: 'nowrap', marginBlockEnd: '0.7em' }}>
        <caption>{name}</caption><thead><tr>{columns.map((column, i) => <th key={column} scope="col">
          {i < keyCount ? <u>{column}</u> : column}</th>)}</tr></thead>
      </table>)}
    </div>
  </figure>;
}
const positions = [[60,177],[230,60],[230,177],[230,294],[420,60],[420,177],[420,294],[610,60],[610,177],[790,177]];
function labelPoint(from: number, to: number) {
  const [startX, startY] = positions[from], [endX, endY] = positions[to];
  const fraction = from === 0 || to === 9 ? 0.52 : 0.78;
  return [startX + 45 + (endX - startX - 90) * fraction, startY + (endY - startY) * fraction - 7];
}
function Routes({ caption, values }: BookletFigureProps) {
  const marker = useId(), title = useId(), desc = useId();
  const alt = figures[1].alt(values);
  return <figure className="managed-diagram source-figure" style={{ minWidth: 0, maxWidth: '100%' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption} aria-description={alt}
      data-figure-profile={figures[1].profile} style={{ color: 'var(--diagram-ink)' }}>
      <svg viewBox="0 0 850 340" role="img" aria-labelledby={title} aria-describedby={desc}
        style={{ width: 'calc(850px * var(--image-scale, 1))', maxWidth: 'none', display: 'block' }}>
        <title id={title}>{caption}</title><desc id={desc}>{alt}</desc>
        <defs><marker id={marker} viewBox="0 0 8 8" refX="7" refY="4" orient="auto" markerWidth="8" markerHeight="8">
          <path d="M0 0L8 4L0 8Z" fill="currentColor" />
        </marker></defs>
        <g aria-hidden="true">
          {spring2007AmRoutes(values[0]).map(({ from, to }, i) => <path key={i} stroke="currentColor" fill="none"
            d={`M${positions[from][0] + 45},${positions[from][1]} L${positions[to][0] - 45},${positions[to][1]}`} markerEnd={`url(#${marker})`} />)}
          {spring2007AmRoutes(values[0]).map(({ from, to, cost }, i) => {
            const [x, y] = labelPoint(from, to);
            return <text key={i} data-route={from + '-' + to} x={x} y={y} textAnchor="middle" fontSize="16"
              stroke="var(--diagram-surface)" strokeWidth="4" paintOrder="stroke" fill="currentColor">{cost}</text>;
          })}
          {positions.map(([x, y], i) => <g key={i}><rect x={x - 45} y={y - 21} width="90" height="42" fill="var(--diagram-surface)" stroke="currentColor" />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fill="currentColor">{routeNode(i)}</text></g>)}
        </g>
      </svg>
    </div>
  </figure>;
}
export const legacy2007SpringAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: figures[0].profile, component: Schemas }, { profile: figures[1].profile, component: Routes },
];
