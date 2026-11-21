import React, { useId } from 'react';
import { huffmanTraceColumns, spring2004Pm3Figure } from '../core/generators/legacy-2004-spring-pm-3-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

const columnsX = [0, 117, 167, 231, 295, 359, 423, 478, 533];
const columnWidths = [102, 36, 36, 36, 36, 36, 36, 36, 36];
const top = 31;
const rowHeight = 27;
const middle = (row: number) => top + (row + 0.5) * rowHeight;

function HuffmanTrace({ caption, values }: BookletFigureProps) {
  const id = useId();
  const { labels, columns, fourOrder } = huffmanTraceColumns(values[0]);
  const arrows = [
    [2, 0, 0], [2, 1, 1], [2, 2, 2], [2, 3, 3], [2, 4, 3],
    ...fourOrder.map((to, from) => [3, from, to]),
    [4, 0, 0], [4, 1, 1], [4, 2, 2], [4, 3, 2],
  ];
  return <figure className="managed-diagram source-figure" style={{ maxWidth: '100%', minWidth: 0, position: 'relative' }}>
    <div className="diagram-scroll" role="group" tabIndex={0}
      aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}
      style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <svg viewBox="-2 -2 575 225" role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
        style={{ display: 'block', width: 'calc(575px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-description'}>{spring2004Pm3Figure.alt(values)}</desc>
        <defs>
          <marker id={id + '-arrow'} orient="auto" markerWidth="6" markerHeight="6" refX="6" refY="3">
            <path d="M0 0L6 3L0 6Z" fill="currentColor" />
          </marker>
        </defs>
        <g aria-hidden="true" fill="currentColor" fontSize="14" textAnchor="middle">
          {columns.map((column, stage) => {
            const x = columnsX[stage], width = columnWidths[stage];
            return <g key={stage}>
              <text x={x + width / 2} y="20">{stage === 0 ? '文字｜回数' : labels[stage]}</text>
              {column.map((value, row) => <g key={row}>
                <rect x={x} y={top + rowHeight * row} width={width} height={rowHeight}
                  fill={value === '…' ? 'currentColor' : 'none'} fillOpacity="0.12" stroke="currentColor" />
                <text x={x + width / 2} y={middle(row) + 5}>{value}</text>
              </g>)}
            </g>;
          })}
          {arrows.map(([stage, from, to]) => <line key={stage + '-' + from}
            x1={columnsX[stage] + columnWidths[stage]} y1={middle(from)} x2={columnsX[stage + 1]} y2={middle(to)}
            stroke="currentColor" markerEnd={'url(#' + id + '-arrow)'} />)}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const spring2004Pm3FigureRenderer: BookletFigureRenderer = {
  profile: spring2004Pm3Figure.profile,
  component: HuffmanTrace,
};
