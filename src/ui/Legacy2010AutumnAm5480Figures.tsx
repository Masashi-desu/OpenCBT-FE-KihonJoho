import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  abcChoiceFigures, abcCurves, dispatchEdges, dispatchFigure, dispatchNames, dispatchTargets, scatterChoiceFigures, scatterPlots,
} from '../core/generators/legacy-2010-autumn-am-54-80-figures';

const plotStyle: CSSProperties = { display: 'block', width: 'min(100%, calc(250px * var(--image-scale, 1)))', height: 'auto', color: 'var(--diagram-ink)' };
const dispatchStyle: CSSProperties = { ...plotStyle, width: 'min(100%, calc(435px * var(--image-scale, 1)))' };
type FigureText = { caption: string; description: string };
function Svg({ caption, description, viewBox, style = plotStyle, children }: FigureText & {
  viewBox: string; style?: CSSProperties; children: ReactNode;
}) {
  const id = useId();
  return <svg viewBox={viewBox} style={style} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}>
    <title id={`${id}-title`}>{caption}</title>
    <desc id={`${id}-desc`}>{description}</desc>
    <g aria-hidden="true">{children}</g>
  </svg>;
}

function AbcCurve({ index, choice, ...text }: FigureText & { index: number; choice: number }) {
  const points = abcCurves[index][choice].map((height, i) => [20 + 25 * i, 146 - height * 1.24]);
  const smooth = points.slice(1).map(([x, y], i) => {
    const [beforeX, beforeY] = points[i];
    return `Q${beforeX},${beforeY} ${(beforeX + x) / 2},${(beforeY + y) / 2}`;
  }).join(' ');
  const curve = `M${points[0].join(',')} ${smooth} L${points.at(-1)!.join(',')}`;
  return <Svg {...text} viewBox="0 0 240 158">
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 18V146H232" />
      <path d={curve} />
    </g>
  </Svg>;
}

const scatterX = (value: number) => 120 + value * 4;
const scatterY = (value: number) => 104 - value * 4;
const scatterTicks = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25];

function Scatter({ index, choice, ...text }: FigureText & { index: number; choice: number }) {
  return <Svg {...text} viewBox="0 0 240 208">
    <g stroke="currentColor" strokeWidth="1.4">
      <path d="M9 104H232M120 14V194" />
      {scatterTicks.filter(value => value !== 0).map(value =>
        <path key={value} d={`M${scatterX(value)} 104v-6 ${Math.abs(value) <= 20 ? `M120 ${scatterY(value)}h6` : ''}`} />)}
    </g>
    <g fill="currentColor" fontSize="10.5" textAnchor="middle">
      <text x="112" y="116">0</text>
      {[-20, -10, 10, 20].map(value => <g key={value}>
        <text x={scatterX(value)} y="118">{value}</text>
        <text x="106" y={scatterY(value) + 3}>{value}</text>
      </g>)}
      {scatterPlots[index][choice].map(([x, y], i) =>
        <circle key={i} cx={scatterX(x)} cy={scatterY(y)} r="2.8" />)}
    </g>
  </Svg>;
}

const endpoints = [[118, 52, 261, 91], [59, 73, 59, 156], [261, 111, 118, 177]] as const;

function Dispatch({ index, ...text }: FigureText & { index: number }) {
  const id = useId();
  const boxes = [[0, 32], [261, 80], [0, 156]] as const;
  return <Svg {...text} viewBox="0 0 382 224" style={dispatchStyle}>
    <defs>
      <marker id={id} viewBox="0 0 9 9" refX="8" refY="4.5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
        <path d="M1 1l7 3.5L1 8" stroke="currentColor" strokeWidth="1.4" fill="none" />
      </marker>
    </defs>
    <g fill="none" stroke="currentColor">
      {dispatchEdges.map((_, edge) => {
        const [x1, y1, x2, y2] = endpoints[edge];
        return <line key={edge} x1={x1} y1={y1} x2={x2} y2={y2}
          strokeWidth={edge === dispatchTargets[index] ? 3.6 : 1.4} markerStart={`url(#${id})`} markerEnd={`url(#${id})`} />;
      })}
      {boxes.map(([x, y], i) => <rect key={i} x={x} y={y} width="118" height="41" strokeWidth="1.4" />)}
    </g>
    <g fill="currentColor" fontSize="16" textAnchor="middle" dominantBaseline="middle">
      {boxes.map(([x, y], i) => <text key={i} x={x + 59} y={y + 20}>{dispatchNames[i]}</text>)}
    </g>
  </Svg>;
}

export const legacy2010AutumnAm5480FigureRenderers: readonly BookletFigureRenderer[] = [
  ...abcChoiceFigures.map((entry, choice): BookletFigureRenderer => ({
    profile: entry.profile,
    component({ values, caption }) {
      return <span data-figure-profile={entry.profile}>
        <AbcCurve index={values[0]} choice={choice} caption={caption} description={entry.alt(values)} />
      </span>;
    },
  })),
  ...scatterChoiceFigures.map((entry, choice): BookletFigureRenderer => ({
    profile: entry.profile,
    component({ values, caption }) {
      return <span data-figure-profile={entry.profile}>
        <Scatter index={values[0]} choice={choice} caption={caption} description={entry.alt(values)} />
      </span>;
    },
  })),
  {
    profile: dispatchFigure.profile,
    component({ values, caption }) {
      return <span data-figure-profile={dispatchFigure.profile}>
        <Dispatch index={values[0]} caption={caption} description={dispatchFigure.alt(values)} />
      </span>;
    },
  },
];
