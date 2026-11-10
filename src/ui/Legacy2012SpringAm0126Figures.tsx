import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  adjacencyMatrix, graphChoices, ledMasks, ledSegments, legacy2012SpringAm0126Figures,
  profiles2012SpringAm0126 as profiles, siteCases, stateLabels, ticketCases, ticketEdges, vertexLabels,
} from '../core/generators/legacy-2012-spring-am-01-26-figures';

function Canvas({ profile, width, height, caption, values, children }: BookletFigureProps & {
  profile: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId(), alt = legacy2012SpringAm0126Figures.find(figure => figure.profile === profile)!.alt(values);
  const arrowId = id + '-arrow';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX={9} refY={5} markerUnits="userSpaceOnUse"
            markerWidth={11} markerHeight={11} orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.25}/>
          </marker>
        </defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.55} fontSize={15}>
          {children('url(#' + arrowId + ')')}
        </g>
      </svg>
    </div>
  </figure>;
}

function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor="middle">{children}</text>;
}

function Adjacency(props: BookletFigureProps) {
  const rows = adjacencyMatrix(props.values[0]);
  return <Canvas {...props} profile={profiles.matrix} width={177} height={132}>{() => <>
    <Label x={80} y={20}>〔隣接行列A〕</Label>
    <path d="M37 33H28V119H37M120 33H129V119H120"/>
    {rows.map((row, i) => <g key={i} data-matrix-row={row.join('')}>
      {row.map((value, j) => <Label key={j} x={45 + 22 * j} y={48 + 21 * i}>{value}</Label>)}
    </g>)}
  </>}</Canvas>;
}

const graphLayout = [[93, 26], [33, 132], [153, 132], [93, 97]] as const;
function GraphChoice(props: BookletFigureProps) {
  const edges = graphChoices[props.values[0]];
  return <Canvas {...props} profile={profiles.graph} width={194} height={152}>{() => <>
    {edges.map(([a, b]) => <line key={a + '-' + b} data-graph-edge={a + '-' + b}
      x1={graphLayout[a - 1][0]} y1={graphLayout[a - 1][1]} x2={graphLayout[b - 1][0]} y2={graphLayout[b - 1][1]}/>)}
    {graphLayout.map(([x, y], i) => <g key={i}>
      <circle cx={x} cy={y} r={3.1} fill="var(--diagram-surface)"/>
      <Label x={x + (i === 1 ? -13 : 15)} y={y + (i === 0 ? 0 : 1)}>{vertexLabels[i]}</Label>
    </g>)}
  </>}</Canvas>;
}

function TicketMachine(props: BookletFigureProps) {
  const index = props.values[0], { price, unit, from: emphasized } = ticketCases[index], count = price / unit;
  const left = 53, step = 66, lineY = 80, r = 17, endX = left + (count - 1) * step * 0.58, endY = 205;
  const x = (state: number) => left + state * step;
  return <Canvas {...props} profile={profiles.vendor} width={left + (count - 1) * step + 35} height={232}>{arrow => <>
    {ticketEdges(index).map(([from, to]) => {
      const start = x(from), finish = to < 0 ? endX : x(to);
      const attributes = { 'data-ticket-edge': stateLabels[from] + '-' + (to < 0 ? 'E' : stateLabels[to]), markerEnd: arrow };
      if (to < 0) {
        const angle = Math.atan2(endY - lineY, finish - start);
        return <line key={from + '-end'} {...attributes} data-highlighted={from === emphasized ? 'true' : undefined}
          x1={start + r * Math.cos(angle)} y1={lineY + r * Math.sin(angle)}
          x2={finish - r * Math.cos(angle)} y2={endY - r * Math.sin(angle)} strokeWidth={from === emphasized ? 3.2 : 1.45}/>;
      }
      if (to === from + 1) return <line key={from + '-' + to} {...attributes} x1={start + r} y1={lineY} x2={finish - r} y2={lineY}/>;
      const mid = (start + finish) / 2, arc = Math.max(0, 43 - (to - from) * 5);
      return <path key={from + '-' + to} {...attributes} d={'M' + (start + 10) + ' ' + (lineY - 13) + ' Q' +
        mid + ' ' + arc + ' ' + (finish - 10) + ' ' + (lineY - 13)}/>;
    })}
    <path d={'M8 ' + lineY + 'H' + (left - r - 14)} strokeWidth={6}/>
    <path d={'M' + (left - r - 14) + ' ' + (lineY - 11) + 'L' + (left - r) + ' ' + lineY + 'L' +
      (left - r - 14) + ' ' + (lineY + 11) + 'Z'} fill="currentColor" stroke="none"/>
    {Array.from({ length: count }, (_, state) => <g key={state} data-ticket-state={stateLabels[state]}>
      <circle cx={x(state)} cy={lineY} r={r} fill="var(--diagram-surface)"/>
      <Label x={x(state)} y={lineY + 5}>{stateLabels[state]}</Label>
    </g>)}
    <circle cx={endX} cy={endY} r={r} fill="var(--diagram-surface)"/>
    <circle cx={endX} cy={endY} r={r - 3.5}/>
    <Label x={endX} y={endY + 5}>E</Label>
  </>}</Canvas>;
}

function SiteReliability(props: BookletFigureProps) {
  const { disks, sites } = siteCases[props.values[0]];
  return <Canvas {...props} profile={profiles.reliability} width={650} height={306}>{() => <>
    <rect x={138} y={20} width={63} height={276}/>
    <Label x={169.5} y={161}>CPU</Label>
    {Array.from({ length: disks }, (_, i) => {
      const y = 42 + i * (disks === 3 ? 77 : 138);
      return <g key={i} data-system-disk={i + 1}>
        <path d={'M20 ' + y + 'v22a36 8 0 0 0 72 0v-22M92 ' + (y + 11) + 'h46'}/>
        <ellipse cx={56} cy={y} rx={36} ry={8} fill="var(--diagram-surface)"/>
        <Label x={56} y={y + 48}>磁気ディスク</Label>
      </g>;
    })}
    {sites.map((count, i) => {
      const top = 21 + 148 * i, label = i === 0 ? 'a' : 'b';
      return <g key={label} data-system-site={label}>
        <rect x={233} y={top} width={199} height={128} strokeDasharray="3 3"/>
        <Label x={266} y={top - 3}>サイト{label}</Label>
        {Array.from({ length: count }, (_, j) => {
          const x = 247 + j * 59, y = top + 10 + j * 36;
          return <g key={j} data-system-terminal={label + (j + 1)}>
            <path d={'M201 ' + (y + 15) + 'H' + x}/>
            <path d={'M' + x + ' ' + (y + 18) + 'h47v10h-47z'} fill="var(--diagram-surface)"/>
            <path d={'M' + (x + 12) + ' ' + y + 'h27l6 15l-6 6h-24q-18 -8 -3 -21z'} fill="var(--diagram-surface)"/>
            <Label x={x + 24} y={y + 44}>端末</Label>
          </g>;
        })}
      </g>;
    })}
    <g data-reliability-rate-table="true">
      <rect x={451} y={60} width={187} height={127}/>
      <path d="M548 60V187M451 91H638"/>
      <Label x={499} y={82}>装置</Label><Label x={593} y={82}>1台の稼働率</Label>
      {[['磁気ディスク', 'D'], ['CPU', 'C'], ['端末', 'T']].map(([name, rate], i) => <g key={rate} data-device-rate={rate}>
        <Label x={499} y={113 + 30 * i}>{name}</Label><Label x={593} y={113 + 30 * i}>{rate}</Label>
      </g>)}
    </g>
  </>}</Canvas>;
}

const bar = '0,0 5,-6 36,-6 42,0 36,6 5,6';
const segments = [
  [14, 6, 0], [58, 12, 90], [58, 59, 90], [14, 108, 0], [12, 59, 90], [12, 12, 90], [14, 57, 0],
] as const;

function Display({ mask, labels = false }: { mask: number; labels?: boolean }) {
  return <>
    {segments.map(([x, y, rotate], bit) => {
      const lit = !!(mask & (1 << bit));
      return <polygon key={bit} points={bar} transform={'translate(' + x + ' ' + y + ') rotate(' + rotate + ')'}
        data-led-segment={ledSegments[bit]} data-lit={lit ? 'true' : 'false'}
        fill={lit ? 'currentColor' : 'var(--diagram-surface)'}/>;
    })}
    <circle cx={75} cy={101} r={5.9} data-led-segment="Dt" data-lit={mask & 128 ? 'true' : 'false'}
      fill={mask & 128 ? 'currentColor' : 'var(--diagram-surface)'}/>
    {labels && <>
      <Label x={35} y={-5}>a</Label><Label x={77} y={39}>b</Label><Label x={77} y={83}>c</Label>
      <Label x={35} y={127}>d</Label><Label x={-6} y={83}>e</Label><Label x={-6} y={39}>f</Label>
      <Label x={35} y={46}>g</Label><Label x={95} y={107}>Dt</Label>
    </>}
  </>;
}

function LedCircuit(props: BookletFigureProps) {
  return <Canvas {...props} profile={profiles.ledCircuit} width={450} height={285}>{() => <>
    <rect x={9} y={19} width={79} height={177}/><Label x={48} y={38}>出力ポート</Label>
    <rect x={191} y={19} width={127} height={177}/>
    {ledSegments.map((label, bit) => {
      const y = 34 + bit * 21;
      return <g key={label} data-led-wire={'P' + bit + '-' + label}>
        <path d={'M88 ' + y + 'h32l4 -7l5 14l5 -14l5 14l5 -14l5 14l4 -7h38'}/>
        <Label x={104} y={y - 4}>{'P' + bit}</Label><Label x={205} y={y + 5}>{label}</Label>
      </g>;
    })}
    <g transform="translate(222 50)"><Display mask={0}/></g>
    <path data-led-ground="true" d="M254 196v13m-14 0h27m-24 0l-6 12m14 -12l-6 12m14 -12l-6 12"/>
    <g transform="translate(345 57)"><Display mask={0} labels/></g>
    <Label x={372} y={211}>凡例</Label>
    {[false, true].map((lit, index) => <g key={index} transform={'translate(335 ' + (231 + index * 27) + ')'}>
      <polygon points={bar} fill={lit ? 'currentColor' : 'var(--diagram-surface)'}/>
      <circle cx={56} cy={0} r={5.9} fill={lit ? 'currentColor' : 'var(--diagram-surface)'}/>
      <Label x={88} y={5}>{lit ? '点灯' : '消灯'}</Label>
    </g>)}
  </>}</Canvas>;
}

function LedChoice(props: BookletFigureProps) {
  return <Canvas {...props} profile={profiles.ledChoice} width={108} height={132}>{() =>
    <g transform="translate(10 11)"><Display mask={ledMasks[props.values[0]]}/></g>
  }</Canvas>;
}

export const legacy2012SpringAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.matrix, component: Adjacency },
  { profile: profiles.graph, component: GraphChoice },
  { profile: profiles.vendor, component: TicketMachine },
  { profile: profiles.reliability, component: SiteReliability },
  { profile: profiles.ledCircuit, component: LedCircuit },
  { profile: profiles.ledChoice, component: LedChoice },
];
