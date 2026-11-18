import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  description, koch, names, profile, routes, targetFigures, widths, type FigureName, type Point,
} from '../core/generators/legacy-2006-spring-pm-06-09-figures';
import { selectCase } from '../core/generators/legacy-2016-autumn-pm-09-13-support';

function Polyline({ points }: { points: readonly Point[] }) {
  return <polyline points={points.map(point => point.join(',')).join(' ')}
    fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />;
}

function Steps() {
  return <>
    <text x={46} y={47}>①</text>
    <Polyline points={koch([124, 45], [440, 45], 0)} />
    <text x={124} y={67} textAnchor="middle">(x1, y1)</text>
    <text x={440} y={67} textAnchor="middle">(x2, y2)</text>
    <text x={46} y={192}>②</text>
    <Polyline points={koch([124, 189], [440, 189], 1)} />
    <text x={124} y={212} textAnchor="middle">(x1, y1)</text>
    <text x={229} y={212} textAnchor="middle">(x3, y3)</text>
    <text x={282} y={87} textAnchor="middle">(x4, y4)</text>
    <text x={335} y={212} textAnchor="middle">(x5, y5)</text>
    <text x={440} y={212} textAnchor="middle">(x2, y2)</text>
    <text x={46} y={339}>③</text>
    <Polyline points={koch([124, 336], [440, 336], 2)} />
  </>;
}

function Target({ index }: { index: number }) {
  const width = widths[index];
  const corner = 112;
  const top = 70;
  const side = 176;
  const points = routes(width)[targetFigures[index]];
  const coordinate = (x: number, y: number) => '(' + x + ', ' + y + ')';
  return <>
    {points.map(([start, end], i) => <Polyline key={i} points={koch(start, end, 2).map(([x, y]) =>
      [corner + x * side / width, top + y * side / width])} />)}
    <text x={corner - 5} y={top - 11} textAnchor="middle">{coordinate(0, 0)}</text>
    <text x={corner + side + 10} y={top - 11} textAnchor="middle">{coordinate(width, 0)}</text>
    <text x={corner - 15} y={top + side + 22} textAnchor="middle">{coordinate(0, width)}</text>
    <text x={corner + side + 13} y={top + side + 22} textAnchor="middle">{coordinate(width, width)}</text>
  </>;
}

function Oblong() {
  return <>
    <g stroke="currentColor" fill="none" strokeWidth="1.7">
      <path d="M94 27 V171 H368 M90 34 L94 27 L98 34 M361 167 L368 171 L361 175" />
      <rect x={147} y={63} width={181} height={72} />
    </g>
    <circle cx={147} cy={135} r={3} fill="currentColor" />
    <circle cx={328} cy={63} r={3} fill="currentColor" />
    <text x={73} y={189} textAnchor="end">(0, 0)</text>
    <text x={368} y={196}>x</text>
    <text x={71} y={37}>y</text>
    <text x={139} y={157}>A (x1, y1)</text>
    <text x={333} y={57}>B (x2, y2)</text>
  </>;
}

const dimensions: Record<FigureName, readonly [number, number]> = {
  '6-koch-steps': [500, 355],
  '6-koch-target': [400, 318],
  '9-oblong': [440, 210],
};

function Diagram({ name, values, caption }: BookletFigureProps & { name: FigureName }) {
  const index = selectCase(values, 4);
  const titleId = useId();
  const descriptionId = useId();
  const [width, height] = dimensions[name];
  const drawing: Record<FigureName, ReactNode> = {
    '6-koch-steps': <Steps />,
    '6-koch-target': <Target index={index} />,
    '9-oblong': <Oblong />,
  };
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + 'の表示'}>
      <svg role="img" aria-labelledby={titleId} aria-describedby={descriptionId}
        viewBox={'0 0 ' + width + ' ' + height} fontSize={16} fontFamily="inherit" fill="currentColor"
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          maxWidth: 'none', height: 'auto', marginInline: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={titleId}>{caption}</title>
        <desc id={descriptionId}>{description(name, index)}</desc>
        {drawing[name]}
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2006SpringPm0609FigureRenderers: readonly BookletFigureRenderer[] =
  names.map(name => ({ profile: profile(name), component: props => <Diagram {...props} name={name} /> }));
