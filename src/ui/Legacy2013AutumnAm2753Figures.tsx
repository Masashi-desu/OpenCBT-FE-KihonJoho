import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  autumn2013Am2753Profiles, autumn2013ClassRelations, autumn2013DummyArrows, autumn2013Events,
  autumn2013RealArrows, autumn2013StaffingAlt, autumn2013UmlAlt, autumn2013WorkCases,
} from '../core/generators/legacy-2013-autumn-am-27-53-figures';

function Drawing({ caption, description, width, height, children }: {
  caption: string;
  description: string;
  width: number;
  height: number;
  children: (arrowMarker: string) => ReactNode;
}) {
  const id = useId();
  const arrow = id + '-arrow';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`,
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{description}</desc>
        <defs>
          <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
          </marker>
        </defs>
        <g aria-hidden="true" fontSize="16" textAnchor="middle" fill="none" stroke="currentColor" strokeWidth="1.3">
          {children(`url(#${arrow})`)}
        </g>
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} stroke="none" fill="currentColor">{children}</text>;
}

function ClassBox({ x, y, name }: { x: number; y: number; name: string }) {
  return <g data-class-name={name}>
    <rect x={x} y={y} width="118" height="72"/>
    <path d={`M${x} ${y + 24}h118m-118 24h118`}/>
    <Label x={x + 59} y={y + 18}>{name}</Label>
  </g>;
}

function ClassRelation({ values, caption }: BookletFigureProps) {
  const { parent, related, notation } = autumn2013ClassRelations[values[0]];
  return <Drawing caption={caption} description={autumn2013UmlAlt(values)} width={322} height={232}>{arrow =>
    <g data-uml-notation={notation}>
      <ClassBox x={102} y={11} name={parent}/>
      {notation === 'composition' ? <>
        <ClassBox x={16} y={146} name={related[0]}/>
        <ClassBox x={188} y={146} name={related[1]}/>
        <path d="M132 103v19H75v24M190 103v19h57v24"/>
        <path d="M132 83l7 10-7 10-7-10ZM190 83l7 10-7 10-7-10Z" fill="currentColor" data-composition-diamonds=""/>
        <Label x={122} y={117}>1</Label><Label x={201} y={117}>1</Label>
        <Label x={63} y={143}>*</Label><Label x={259} y={143}>*</Label>
      </> : <>
        <ClassBox x={102} y={146} name={related[0]}/>
        {notation === 'association' && <>
          <path d="M161 83v63"/>
          <Label x={146} y={104}>1</Label><Label x={146} y={141}>1</Label>
        </>}
        {notation === 'generalization' && <>
          <path d="M161 146V102"/>
          <path d="M161 83l-10 19h20Z" data-generalization-triangle=""/>
        </>}
        {notation === 'dependency' && <path d="M161 146V83" markerEnd={arrow} strokeDasharray="4 4"/>}
      </>}
    </g>
  }</Drawing>;
}

const radius = 14;
function edge(a: readonly [number, number], b: readonly [number, number]) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const distance = Math.hypot(dx, dy);
  const x = radius * dx / distance;
  const y = radius * dy / distance;
  return { x1: a[0] + x, y1: a[1] + y, x2: b[0] - x, y2: b[1] - y };
}
const legendStart = [528, 145] as const;
const legendEnd = [645, 145] as const;

function StaffingNetwork({ values, caption }: BookletFigureProps) {
  const { days } = autumn2013WorkCases[values[0]];
  return <Drawing caption={caption} description={autumn2013StaffingAlt(values)} width={676} height={221}>{arrow => <>
    {autumn2013Events.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={radius} data-activity-event={i}/>)}
    {autumn2013RealArrows.map(({ name, from, to, label, duration }, i) =>
      <g key={name} data-activity={name} data-from={from} data-to={to} data-days={days[i]}>
        <line {...edge(autumn2013Events[from], autumn2013Events[to])} markerEnd={arrow}/>
        <g data-activity-label=""><Label x={label[0]} y={label[1]}>{name}</Label></g>
        <g data-activity-days=""><Label x={duration[0]} y={duration[1]}>{days[i]}</Label></g>
      </g>)}
    {autumn2013DummyArrows.map(([from, to]) =>
      <line key={from} {...edge(autumn2013Events[from], autumn2013Events[to])} markerEnd={arrow}
        strokeDasharray="4 4" data-activity-dummy="" data-from={from} data-to={to}/>)}
    <g data-activity-legend="">
      <Label x={538} y={109}>凡例</Label>
      <circle cx={legendStart[0]} cy={legendStart[1]} r={radius}/>
      <circle cx={legendEnd[0]} cy={legendEnd[1]} r={radius} data-activity-legend-end=""/>
      <line {...edge(legendStart, legendEnd)} markerEnd={arrow}/>
      <Label x={586} y={138}>作業</Label><Label x={586} y={167}>日数</Label>
      <line x1="512" y1="192" x2="556" y2="192" strokeDasharray="4 4" markerEnd={arrow}/>
      <Label x={612} y={197}>ダミー作業</Label>
    </g>
  </>}</Drawing>;
}

export const legacy2013AutumnAm2753FigureRenderers: BookletFigureRenderer[] = [
  { profile: autumn2013Am2753Profiles.uml, component: ClassRelation },
  { profile: autumn2013Am2753Profiles.staffing, component: StaffingNetwork },
];
