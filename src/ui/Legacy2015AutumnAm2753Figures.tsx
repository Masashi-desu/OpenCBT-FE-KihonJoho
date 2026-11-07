import { useId, type ReactNode } from 'react';
import {
  arrowAlt, arrowDays, arrowDummies, arrowEdges, branchAlt, branchConditions, legacy2015AutumnAm2753Profiles, orderRelations, relationAlt,
} from '../core/generators/legacy-2015-autumn-am-27-53-figures';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

function Relation({ values: [index, option], caption }: BookletFigureProps) {
  const { name, attributes, primaryKey } = orderRelations(index)[option];
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <div role="img" aria-label={relationAlt(index, option)}
        style={{ whiteSpace: 'nowrap', width: 'max-content', fontSize: 'calc(1rem * var(--image-scale, 1))', color: 'var(--diagram-ink)' }}>
        <span aria-hidden="true">{name}（{attributes.map((attribute, index) => <span key={attribute}>
          {index > 0 && '，'}{primaryKey.includes(attribute) ? <u data-primary-key={attribute}>{attribute}</u> : attribute}
        </span>)}）</span>
      </div>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

function Drawing({ caption, description, width, height, children }: {
  caption: string;
  description: string;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  const arrowId = id + '-arrow';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{description}</desc>
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.3"/>
          </marker>
        </defs>
        <g aria-hidden="true" fontSize="16" textAnchor="middle" fill="none" stroke="currentColor" strokeWidth="1.5">
          {children(`url(#${arrowId})`)}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Branch({ values: [index], caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={branchAlt(index)} width={375} height={208}>{arrow => <>
    <path d="M159 12V33M159 33L33 70L159 107L285 70Z" />
    <path data-branch="true" d="M159 107V131M159 165V197" />
    <path data-branch="false" d="M285 70H332V185H159" markerEnd={arrow} />
    <rect x="89" y="131" width="140" height="34" />
    <g fill="currentColor" stroke="none">
      <text data-condition="true" x="159" y="76">{branchConditions[index]}</text>
      <text x="181" y="125">真</text>
      <text x="309" y="63">偽</text>
      <text x="159" y="153">命令</text>
    </g>
  </>}</Drawing>;
}

const points: Record<number, readonly [number, number]> = {
  1: [29, 103], 2: [124, 103], 3: [245, 29], 4: [245, 103], 5: [245, 177], 6: [365, 103], 7: [464, 103],
};
const activityLabels = [[76, 124], [174, 60], [181, 126], [168, 159], [305, 57], [302, 125], [313, 163], [412, 124]] as const;
const nodeRadius = 15;

function edgeLine(from: number, to: number) {
  const [x1, y1] = points[from], [x2, y2] = points[to];
  const length = Math.hypot(x2 - x1, y2 - y1);
  const dx = (x2 - x1) / length * nodeRadius;
  const dy = (y2 - y1) / length * nodeRadius;
  return `M${x1 + dx} ${y1 + dy}L${x2 - dx} ${y2 - dy}`;
}

function Network({ values: [index], caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={arrowAlt(index)} width={515} height={283}>{arrow => <>
    {arrowEdges.map(([from, to], edge) => <path key={`${from}-${to}`} data-activity={`${from}-${to}`}
      d={edgeLine(from, to)} markerEnd={arrow} data-days={arrowDays[index][edge]} />)}
    {arrowDummies.map(([from, to]) => <path key={`${from}-${to}`} data-dummy={`${from}-${to}`}
      d={edgeLine(from, to)} markerEnd={arrow} strokeDasharray="6 4" />)}
    {Object.entries(points).map(([node, [x, y]]) => <circle key={node} cx={x} cy={y} r={nodeRadius} />)}
    <g fill="currentColor" stroke="none">
      {Object.entries(points).map(([node, [x, y]]) => <text key={node} x={x} y={y + 6}>{node}</text>)}
      {activityLabels.map(([x, y], indexOfEdge) => <text key={indexOfEdge} x={x} y={y}>{arrowDays[index][indexOfEdge]}</text>)}
      <text x="343" y="206">凡例</text><text x="407" y="246">所要日数</text>
      <text x="431" y="273">ダミー作業</text>
    </g>
    <circle cx="344" cy="223" r="11" /><circle cx="470" cy="223" r="11" />
    <path d="M355 223H458" markerEnd={arrow} />
    <path d="M332 267H382" markerEnd={arrow} strokeDasharray="6 4" />
  </>}</Drawing>;
}

export const legacy2015AutumnAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: legacy2015AutumnAm2753Profiles.relation, component: Relation },
  { profile: legacy2015AutumnAm2753Profiles.branch, component: Branch },
  { profile: legacy2015AutumnAm2753Profiles.network, component: Network },
];
