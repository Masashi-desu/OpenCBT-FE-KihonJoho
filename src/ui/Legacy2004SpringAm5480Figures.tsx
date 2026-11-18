import React, { useId, type ReactNode } from 'react';
import type { BookletFigureDefinition } from '../core/booklet-figure-extension-contract';
import { activityFigure, histogram, histogramFigure, inventoryFigure, tradeHeader, trades, workPlan } from '../core/generators/legacy-2004-spring-am-54-80-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

function Figure({ definition, values, caption, width, height, children }: BookletFigureProps & {
  definition: BookletFigureDefinition;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure" style={{ maxWidth: '100%', minWidth: 0, position: 'relative' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}
      style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-description'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-description'}>{definition.alt(values)}</desc>
        <defs><marker id={id + '-arrow'} orient="auto" markerWidth="6" markerHeight="6" refX="6" refY="3">
          <path d="M0 0L6 3L0 6Z" fill="currentColor" />
        </marker></defs>
        <g aria-hidden="true" fill="currentColor" fontSize="15" textAnchor="middle">{children('url(#' + id + '-arrow)')}</g>
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

const nodeX = [26, 128, 230, 332, 434, 536];
const upperPaths: Record<string, { path: string; x: number; y: number }> = {
  E: { path: 'M136 111L152 87H207L222 111', x: 180, y: 82 },
  F: { path: 'M133 110L154 44H311L326 110', x: 231, y: 38 },
  G: { path: 'M238 140L251 164H310L324 140', x: 281, y: 159 },
  H: { path: 'M235 141L257 200H411L429 141', x: 333, y: 194 },
};
function Activities(props: BookletFigureProps) {
  return <Figure {...props} definition={activityFigure} width={566} height={232}>{arrow => <>
    {workPlan(props.values[0]).map(({ from, to, name, days }) => {
      const ax = nodeX[from], bx = nodeX[to];
      const { path, x, y } = upperPaths[name] ?? { path: 'M' + (ax + 16) + ' 125H' + (bx - 17), x: (ax + bx) / 2, y: 119 };
      return <g key={name}>
        <path d={path} fill="none" stroke="currentColor" markerEnd={arrow} />
        <text x={x} y={y}>{name}<tspan x={x} dy="21">{days}</tspan></text>
      </g>;
    })}
    {nodeX.map(x => <circle key={x} cx={x} cy="125" r="16" fill="none" stroke="currentColor" />)}
    <text x={nodeX[0]} y="159">開始</text><text x={nodeX[5]} y="159">終了</text>
  </>}</Figure>;
}

function Inventory(props: BookletFigureProps) {
  const offsets = [5, 80, 230, 323, 421];
  const rowHeight = 32;
  return <Figure {...props} definition={inventoryFigure} width={427} height={235}>{() => <>
    <g stroke="currentColor" fill="none">
      {offsets.map(x => <line key={x} x1={x} x2={x} y1="5" y2="229" />)}
      {Array.from({ length: 8 }, (_, i) => 5 + i * rowHeight).map(y =>
        <line key={y} x1={offsets[0]} x2={offsets[4]} y1={y} y2={y} />)}
    </g>
    {tradeHeader.map((label, column) => <text key={label} x={(offsets[column] + offsets[column + 1]) / 2} y="26">{label}</text>)}
    {trades(props.values[0]).map(({date, what, qty, price}, row) => [date, what, qty, price].map((value, column) => {
      const y = 5 + (row + 1) * rowHeight;
      if (value === null) return <line key={date + ':blank'} x1={offsets[column]} x2={offsets[column + 1]} y1={y + rowHeight} y2={y}
        stroke="currentColor" />;
      return <text key={date + ':' + column} x={(offsets[column] + offsets[column + 1]) / 2} y={y + 21}>{value}</text>;
    }))}
  </>}</Figure>;
}

function Distribution(props: BookletFigureProps) {
  const [lower, upper, heights] = histogram(props.values[0], props.values[1]);
  const left = 28, bottom = 154, size = 235 / heights.length, top = 13;
  const scale = (bottom - top - 10) / Math.max(...heights);
  return <Figure {...props} definition={histogramFigure} width={278} height={193}>{() => <>
    <path d={'M' + left + ' ' + top + 'V' + bottom + 'H272'} stroke="currentColor" fill="none" />
    {[lower, upper].map((tick, i) => <g key={tick}>
      <line x1={left + size * tick} x2={left + size * tick} y1={top} y2={bottom} stroke="currentColor" strokeDasharray="3 4" />
      <text x={left + size * tick} y="175">{i ? 'SU' : 'SL'}</text>
    </g>)}
    {heights.map((height, i) => height > 0 && <rect key={i} x={left + i * size} y={bottom - height * scale}
      width={size} height={height * scale} fill="none" stroke="currentColor" />)}
    <text x="11" y="75">度<tspan x="11" dy="18">数</tspan></text>
    <text x={left + size * (lower + upper) / 2} y="175">バグ摘出率</text>
  </>}</Figure>;
}
export const legacy2004SpringAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: activityFigure.profile, component: Activities },
  { profile: inventoryFigure.profile, component: Inventory },
  { profile: histogramFigure.profile, component: Distribution },
];
