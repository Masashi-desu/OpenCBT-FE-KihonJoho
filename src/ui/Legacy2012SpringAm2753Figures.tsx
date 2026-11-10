import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  spring2012Am2753Profiles, spring2012Projection, spring2012RelationAlt, spring2012Redundancy, spring2012RedundancyAlt,
  spring2012ProjectAlt, spring2012ProjectDummy, spring2012ProjectDurations, spring2012ProjectEdges,
} from '../core/generators/legacy-2012-spring-am-27-53-figures';

function Panel({ caption, description, width, height, children }: {
  caption: string;
  description: string;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`,
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{description}</desc>
        <defs>
          <marker id={id + '-arrow'} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto-start-reverse" markerUnits="strokeWidth">
            <path d="M 0 0 L 7 3.5 L 0 7 Z" fill="currentColor"/>
          </marker>
        </defs>
        {children(`url(#${id}-arrow)`)}
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

function Relation({ values, caption }: BookletFigureProps) {
  const { columns } = spring2012Projection(values);
  return <Panel caption={caption} description={spring2012RelationAlt(values)} width={370} height={70}>
    {() => <g aria-hidden="true">
      <text x="15" y="21" fill="currentColor" fontSize="17">R</text>
      {columns.map((column, index) => <g key={column}>
        <rect x={15 + index * 68} y="28" width="68" height="30" fill="none" stroke="currentColor"/>
        <text x={49 + index * 68} y="49" textAnchor="middle" fill="currentColor" fontSize="17">{column}</text>
      </g>)}
    </g>}
  </Panel>;
}

function Database({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="M-46 0V40Q0 54 46 40V0" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <ellipse cy="0" rx="46" ry="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <text y="27" textAnchor="middle" fill="currentColor" fontSize="16">データ</text>
  </g>;
}

function Internet({ x }: { x: number }) {
  return <g transform={`translate(${x} 130)`}>
    <ellipse rx="77" ry="20" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M0 20V48" stroke="currentColor" strokeWidth="1.5"/>
    <text y="6" textAnchor="middle" fill="currentColor" fontSize="16">インターネット</text>
  </g>;
}

function Redundancy({ values, caption }: BookletFigureProps) {
  const { left, right, monitor, mode, effect } = spring2012Redundancy(values);
  return <Panel caption={caption} description={spring2012RedundancyAlt(values)} width={765} height={364}>
    {arrow => <g aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="35" y="16" width="116" height="34"/>
        <rect x="391" y="16" width="165" height="34"/>
        <path d="M35 178H221M378 178H744" strokeWidth="2"/>
        <path d="M92 178V210M446 178V210M685 178V210"/>
        <rect x="46" y="210" width="92" height="53"/>
        <rect x="400" y="210" width="92" height="53"/>
        <rect x="639" y="210" width="92" height="53"/>
        <path d="M92 263V300M446 263L530 300M685 263L602 300"/>
        <path d="M250 244H287V233L307 251L287 269V258H250Z"/>
        {mode !== 'manual' && <path d="M639 249H492" markerEnd={arrow}
          markerStart={mode === 'active' ? arrow : undefined}/>}
      </g>
      <g fill="currentColor">
        {[35, 92, 136, 221, 378, 446, 568, 685, 744].map(x => <rect key={x} x={x - 4} y="174" width="8" height="8"/>)}
      </g>
      <Internet x={136}/>
      <Internet x={568}/>
      <Database x={92} y={300}/>
      <Database x={566} y={300}/>
      <g fill="currentColor" textAnchor="middle" fontSize="16">
        <text x="93" y="39">元の構成</text>
        <text x="473.5" y="39">二重化された構成</text>
        <text x="92" y="232">サーバ</text>
        <text x="92" y="252">（稼働）</text>
        <text x="446" y="232">サーバ1</text>
        <text x="446" y="252">（{left}）</text>
        <text x="685" y="232">サーバ2</text>
        <text x="685" y="252">（{right}）</text>
        <text x="565" y="235">{monitor}</text>
      </g>
      <g fill="currentColor" fontSize="16">
        <text x="391" y="78">{effect[0]}</text>
        <text x="391" y="100">{effect[1]}</text>
      </g>
    </g>}
  </Panel>;
}

const nodes = [[36, 110], [123, 46], [183, 173], [332, 173], [397, 46], [488, 110]] as const;
const labelPositions = [
  { name: [65, 71], days: [83, 99] },
  { name: [115, 130], days: [102, 160] },
  { name: [157, 92], days: [140, 113] },
  { name: [258, 33], days: [258, 70] },
  { name: [257, 162], days: [257, 196] },
  { name: [407, 132], days: [420, 158] },
  { name: [446, 68], days: [435, 99] },
] as const;
const radius = 16;

function trimmedEdge(from: number, to: number) {
  const [x, y] = nodes[from], [endX, endY] = nodes[to];
  const distance = Math.hypot(endX - x, endY - y);
  const dx = (endX - x) / distance, dy = (endY - y) / distance;
  return `M${x + dx * radius} ${y + dy * radius}L${endX - dx * (radius + 1)} ${endY - dy * (radius + 1)}`;
}

function Project({ values, caption }: BookletFigureProps) {
  const durations = spring2012ProjectDurations(values);
  return <Panel caption={caption} description={spring2012ProjectAlt(values)} width={706} height={242}>
    {arrow => <g aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        {nodes.map(([x, y]) => <circle key={x} cx={x} cy={y} r={radius}/>)}
        {spring2012ProjectEdges.map(({ label, from, to }) => <path key={label} d={trimmedEdge(from, to)} markerEnd={arrow}/>)}
        <path d={trimmedEdge(spring2012ProjectDummy.from, spring2012ProjectDummy.to)} strokeDasharray="5 3" markerEnd={arrow}/>
        <circle cx="542" cy="167" r="16"/>
        <circle cx="669" cy="167" r="16"/>
        <path d="M558 167H652" markerEnd={arrow}/>
        <path d="M526 224H572" strokeDasharray="5 3" markerEnd={arrow}/>
      </g>
      <g fill="currentColor" textAnchor="middle" fontSize="16">
        {spring2012ProjectEdges.map(({ label }, i) => <g key={label}>
          <text x={labelPositions[i].name[0]} y={labelPositions[i].name[1]}>{label}</text>
          <text x={labelPositions[i].days[0]} y={labelPositions[i].days[1]}>{durations[i]}</text>
        </g>)}
        <text x="547" y="134">凡例</text>
        <text x="606" y="158">作業名</text>
        <text x="606" y="188">所要日数</text>
        <text x="641" y="229">：ダミー作業</text>
      </g>
    </g>}
  </Panel>;
}

export const legacy2012SpringAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: spring2012Am2753Profiles.relation, component: Relation },
  { profile: spring2012Am2753Profiles.redundancy, component: Redundancy },
  { profile: spring2012Am2753Profiles.project, component: Project },
];
