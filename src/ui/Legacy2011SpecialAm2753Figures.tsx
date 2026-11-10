import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  multiplicityAlt, multiplicityAt, profiles2011SpecialAm2753 as profiles, scheduleAlt, scheduleAt,
} from '../core/generators/legacy-2011-special-am-27-53-figures';

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
          <marker id={id + '-arrow'} markerWidth="7" markerHeight="7" refX="6" refY="3.5"
            orient="auto" markerUnits="strokeWidth">
            <path d="M1 1L6 3.5L1 6" fill="none" stroke="currentColor"/>
          </marker>
        </defs>
        {children(`url(#${id}-arrow)`)}
      </svg>
    </div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}

function Multiplicity({ values, caption }: BookletFigureProps) {
  const [organization, employee] = multiplicityAt(values);
  return <Panel caption={caption} description={multiplicityAlt(values)} width={358} height={88}>
    {() => <g aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="22" y="18" width="94" height="44"/>
        <rect x="242" y="18" width="94" height="44"/>
        <path d="M116 40H242"/>
      </g>
      <g fill="currentColor" fontSize="17">
        <text x="69" y="46" textAnchor="middle">組織</text>
        <text x="289" y="46" textAnchor="middle">社員</text>
        <text x="126" y="62">{organization}</text>
        <text x="232" y="62" textAnchor="end">{employee}</text>
      </g>
    </g>}
  </Panel>;
}

const radius = 14;
const labels: Record<string, readonly [number, number, number, number]> = {
  A: [74, 48, 74, 71], B: [162, 48, 162, 71], D: [262, 48, 262, 71],
  F: [262, 166, 262, 189], H: [353, 166, 353, 189], I: [444, 166, 444, 189],
};
const beforeLabels: typeof labels = {
  ...labels, C: [172, 100, 156, 121], G: [394, 98, 381, 122], E: [273, 94, 238, 114],
};
const afterLabels: typeof labels = {
  ...labels, C: [171, 103, 146, 121], G: [393, 98, 381, 122],
  E1: [228, 87, 201, 99], E2: [279, 78, 265, 98], E3: [274, 131, 240, 152],
};

function arrowBetween(nodes: readonly (readonly [number, number])[], from: number, to: number) {
  const [x, y] = nodes[from], [endX, endY] = nodes[to];
  const distance = Math.hypot(endX - x, endY - y);
  const dx = (endX - x) / distance, dy = (endY - y) / distance;
  return `M${x + dx * radius} ${y + dy * radius}L${endX - dx * radius} ${endY - dy * radius}`;
}

function Schedule({ values, caption, after }: BookletFigureProps & { after: boolean }) {
  const nodes = [
    [29, 54], [118, 54], [211, 54], [306, 54],
    [211, 172], [306, 172], [400, 172], [495, 172],
    ...(after ? [[218, 118], [320, 107]] as const : []),
  ] as const;
  const edges = scheduleAt(values, after);
  const labelCoordinates: Record<string, readonly [number, number, number, number]> = after ? afterLabels : beforeLabels;
  return <Panel caption={caption} description={scheduleAlt(values, after)}
    width={700} height={198}>
    {arrow => <g aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        {nodes.map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r={radius}/>)}
        {edges.map(({ from, to, name, dummy }) => <path key={name} data-task={name}
          d={arrowBetween(nodes, from, to)} markerEnd={arrow} strokeDasharray={dummy ? '3 4' : undefined}
          strokeWidth={/^E[123]?$/.test(name) ? 2.4 : undefined}/>)}
        {!after && <g>
          <circle cx="549" cy="55" r="13"/>
          <circle cx="658" cy="55" r="13"/>
          <path d="M562 55H645" markerEnd={arrow}/>
          <path d="M536 101H576" strokeDasharray="3 4" markerEnd={arrow}/>
        </g>}
      </g>
      <g fill="currentColor" fontSize="16" textAnchor="middle">
        <text x="30" y="24">{after ? '図2' : '図1'}</text>
        {edges.filter(edge => !edge.dummy).map(({ name, days }) => {
          const [nameX, nameY, daysX, daysY] = labelCoordinates[name];
          return <g key={name}>
            <text x={nameX} y={nameY}>{name}</text>
            <text x={daysX} y={daysY}>{days}</text>
          </g>;
        })}
        {!after && <>
          <text x="553" y="25">凡例</text>
          <text x="605" y="46">作業名</text>
          <text x="605" y="78">所要日数</text>
          <text x="635" y="106">：ダミー作業</text>
        </>}
      </g>
    </g>}
  </Panel>;
}

function InitialPlan(props: BookletFigureProps) {
  return <Schedule {...props} after={false}/>;
}
function RevisedPlan(props: BookletFigureProps) {
  return <Schedule {...props} after/>;
}

export const legacy2011SpecialAm2753FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.multiplicity, component: Multiplicity },
  { profile: profiles.before, component: InitialPlan },
  { profile: profiles.after, component: RevisedPlan },
];
