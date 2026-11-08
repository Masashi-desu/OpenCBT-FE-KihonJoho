import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  am2753FigureAlt, am2753Profiles, spring2014PathActivities, spring2014PathNodes, spring2014SqlSchema, spring2014UmlLinks, spring2014WorkLabels,
} from '../core/generators/legacy-2014-spring-am-27-53-figures';

function Drawing({ caption, description, width, height, children }: {
  caption: string; description: string; width: number; height: number;
  children: (symbols: { arrow: string; triangle: string }) => ReactNode;
}) {
  const id = useId(), arrow = id + '-arrow', triangle = id + '-triangle';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', marginInline: 'auto', width: `calc(${width}px * var(--image-scale, 1))`,
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{description}</desc>
        <defs>
          <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
          </marker>
          <marker id={triangle} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto">
            <path d="M1 1L11 6L1 11Z" fill="none" stroke="currentColor"/>
          </marker>
        </defs>
        <g aria-hidden="true" fontSize="16" textAnchor="middle" fill="none" stroke="currentColor" strokeWidth="1.3">
          {children({ arrow: `url(#${arrow})`, triangle: `url(#${triangle})` })}
        </g>
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}
const T = ({ x, y, children, align = 'middle' }: { x: number; y: number; children: ReactNode; align?: 'middle' | 'start' }) =>
  <text x={x} y={y} textAnchor={align} stroke="none" fill="currentColor">{children}</text>;

function SqlSchema({ values, caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={am2753FigureAlt.schema(values)} width={650} height={86}>{() => <>
    {spring2014SqlSchema.map(({ name, columns }, i) => {
      const x = 12 + 324 * i;
      return <g key={name} data-sql-table={name}>
        <T x={x} y={28} align="start">{name}</T>
        {columns.map(([label, key], j) => <g key={label}>
          <rect x={x + 99 * j} y="37" width="99" height="30"/>
          <text x={x + 99 * j + 49.5} y="58" fill="currentColor" stroke="none"
            textDecoration={key ? 'underline' : undefined} data-primary-key={key ? label : undefined}>{label}</text>
        </g>)}
      </g>;
    })}
  </>}</Drawing>;
}
const umlBoxes = [[53, 17], [225, 17], [53, 127]] as const;
function Uml({ values, caption }: BookletFigureProps) {
  const { related, superClass } = spring2014UmlLinks[values[0]];
  return <Drawing caption={caption} description={am2753FigureAlt.uml(values)} width={396} height={190}>{({ triangle }) => <>
    {umlBoxes.map(([x, y], i) => <rect key={i} x={x} y={y} width="105" height="44" data-uml-box={i}/>)}
    <path d={related === 0 ? 'M158 39h67' : 'M277 61v88H158'} data-uml-association={related + '-1'}/>
    <path d={superClass === 0 ? 'M105 127V61' : 'M105 61v66'} markerEnd={triangle} data-uml-superclass={superClass}/>
  </>}</Drawing>;
}
function Work({ values, caption }: BookletFigureProps) {
  const s = spring2014WorkLabels[values[0]];
  const nodes = [
    [309, 12, 162, [s.root]], [111, 141, 146, [s.topLeft]], [303, 141, 173, [s.topMiddle]],
    [226, 273, 143, s.lowerLeft], [419, 273, 136, s.lowerRight],
  ] as const;
  return <Drawing caption={caption} description={am2753FigureAlt.work(values)} width={713} height={363}>{() => <>
    <path d="M390 72v69M184 141v-35H616M543 106v35M390 201v40M298 273v-32H645M487 241v32M605 241v32" data-wbs-links=""/>
    <path d="M616 106h36M184 201v37M645 241h34M487 333v29" strokeDasharray="5 4" data-wbs-continuation=""/>
    {nodes.map(([x, y, w, text], i) => <g key={i} data-wbs-node={i}>
      <rect x={x} y={y} width={w} height="60"/>
      {text.map((line, n) => <T key={line} x={x + w / 2} y={y + (text.length > 1 ? 26 : 36) + 19 * n}>{line}</T>)}
    </g>)}
    <T x={543} y={177}>…</T><T x={605} y={308}>…</T>
  </>}</Drawing>;
}
const radius = 13.5;
function lineBetween(a: readonly [number, number], b: readonly [number, number]) {
  const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
  const x = radius * dx / length, y = radius * dy / length;
  return { x1: a[0] + x, y1: a[1] + y, x2: b[0] - x, y2: b[1] - y };
}
function Path({ values, caption }: BookletFigureProps) {
  return <Drawing caption={caption} description={am2753FigureAlt.path(values)} width={730} height={220}>{({ arrow }) => <>
    {spring2014PathNodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={radius} data-event={i}/>)}
    {spring2014PathActivities(values[0]).map(({ label, from, to, days, labelX, labelY, daysX, daysY }) =>
      <g key={label} data-activity={label} data-from={from} data-to={to} data-days={days}>
        <line {...lineBetween(spring2014PathNodes[from], spring2014PathNodes[to])} markerEnd={arrow}/>
        <T x={labelX} y={labelY}>{label}</T><T x={daysX} y={daysY}>{days}</T>
      </g>)}
    <g data-activity-legend="">
      <circle cx="584" cy="86" r={radius}/><circle cx="708" cy="86" r={radius}/>
      <line {...lineBetween([584, 86], [708, 86])} markerEnd={arrow}/>
      <T x={590} y={53}>凡例</T><T x={646} y={79}>作業名</T><T x={646} y={106}>所要日数</T>
    </g>
  </>}</Drawing>;
}
export const legacy2014SpringAm27To53Renderers: BookletFigureRenderer[] = [
  { profile: am2753Profiles.schema, component: SqlSchema }, { profile: am2753Profiles.uml, component: Uml },
  { profile: am2753Profiles.work, component: Work }, { profile: am2753Profiles.path, component: Path },
];
