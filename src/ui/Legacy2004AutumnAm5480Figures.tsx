import React, { useId, type ReactNode } from 'react';
import type { BookletFigureDefinition } from '../core/booklet-figure-extension-contract';
import { arrowDiagram, arrowEdges, relationCases, relationDiagram } from '../core/generators/legacy-2004-autumn-am-54-80-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

function Figure({ definition, values, caption, width, height, children }: BookletFigureProps & {
  definition: BookletFigureDefinition;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure" style={{ maxWidth: '100%', minWidth: 0, position: 'relative' }}>
    <div className="diagram-scroll" role="group" tabIndex={0}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}
      style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-description'}>{definition.alt(values)}</desc>
        <defs><marker id={id + '-arrow'} orient="auto" markerWidth="6" markerHeight="6" refX="6" refY="3">
          <path d="M0 0L6 3L0 6Z" fill="currentColor" />
        </marker></defs>
        <g aria-hidden="true">{children('url(#' + id + '-arrow)')}</g>
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

const junction = [[0, 0], [34, 145], [150, 145], [273, 235], [273, 55], [428, 55], [428, 235], [550, 145]];
const labelPositions = [[93, 115], [181, 76], [183, 207], [240, 145], [351, 25], [350, 203], [515, 68], [513, 213]];
function ScheduleArrows(props: BookletFigureProps) {
  return <Figure {...props} definition={arrowDiagram} width={584} height={268}>{arrow => <>
    {arrowEdges(props.values[0]).map(({ from, to, label, days, dummy }, i) => {
      const [ax, ay] = junction[from], [bx, by] = junction[to];
      const length = Math.hypot(bx - ax, by - ay);
      const dx = (bx - ax) / length, dy = (by - ay) / length;
      const [tx, ty] = labelPositions[i] ?? [0, 0];
      return <g key={from + ':' + to}>
        <line x1={ax + 17 * dx} y1={ay + 17 * dy} x2={bx - 18 * dx} y2={by - 18 * dy}
          stroke="currentColor" markerEnd={arrow} strokeDasharray={dummy ? '3 3' : undefined} />
        {!dummy && <text x={tx} y={ty} textAnchor="middle" fill="currentColor" fontSize="15">
          {label}<tspan x={tx} dy="17">（{days}日）</tspan>
        </text>}
      </g>;
    })}
    {junction.slice(1).map(([x, y], i) => <g key={i}>
      <circle cx={x} cy={y} r="17" fill="none" stroke="currentColor" />
      <text x={x} y={y + 5} textAnchor="middle" fill="currentColor" fontSize="15">{i + 1}</text>
    </g>)}
  </>}</Figure>;
}

function RelationTables(props: BookletFigureProps) {
  return <Figure {...props} definition={relationDiagram} width={460} height={214}>{() =>
    relationCases[props.values[0]].tables.map(({ label, fields, underlined }, row) => {
      const y = row * 68 + 27;
      return <g key={label}>
        <text x="8" y={y - 5} fill="currentColor" fontSize="15">{label}</text>
        {fields.map((field, index) => <g key={field}>
          <rect x={index * 108 + 8} y={y} width="108" height="30" stroke="currentColor" fill="none" />
          <text x={index * 108 + 62} y={y + 20} textAnchor="middle" fill="currentColor" fontSize="15"
            textDecoration={underlined.includes(index) ? 'underline' : undefined}>{field}</text>
        </g>)}
      </g>;
    })}</Figure>;
}

export const legacy2004AutumnAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: arrowDiagram.profile, component: ScheduleArrows },
  { profile: relationDiagram.profile, component: RelationTables },
];
