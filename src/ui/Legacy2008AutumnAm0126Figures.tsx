import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { circuitOutputs, conversionCases, gridCases, heapCases, legacy2008AutumnAm0126Figures, legendItems, legendNote, profiles } from '../core/generators/legacy-2008-autumn-am-01-26-figures';

type Kind = keyof typeof profiles;
type DrawingProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2008AutumnAm0126Figures.find(item => item.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4} fontSize={15}>{children}</g>
      </svg>
    </div>
  </figure>;
}
function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor="middle">{children}</text>;
}

function Conversion(props: BookletFigureProps) {
  const { reverse, width } = conversionCases[props.values[0]];
  const x = 89;
  return <Drawing {...props} kind="conversion" width={493} height={315}>
    <path d="M89 34V55M89 82V101M89 144V163M89 191V208M89 236V254M89 282V293"/>
    <rect x={37} y={9} width={104} height={25} rx={12}/><Label x={x} y={27}>開始</Label>
    <path d="M46 55H150L132 82H28Z"/><Label x={x} y={74}>j を入力</Label>
    <path d="M45 101H132L141 110V144H37V110Z"/>
    <Label x={x} y={119}>変換</Label>
    <Label x={x} y={137}>{'k：' + (reverse ? width + '，−1，1' : '1，1，' + width)}</Label>
    <rect x={37} y={163} width={104} height={28}/><rect x={54} y={168} width={70} height={18}/><Label x={x} y={183}>a</Label>
    <rect x={37} y={208} width={104} height={28}/><rect x={54} y={213} width={70} height={18}/><Label x={x} y={228}>b</Label>
    <path d="M37 254H141V273L132 282H45L37 273Z"/><Label x={x} y={273}>変換</Label>
    <rect x={37} y={293} width={104} height={21} rx={10}/><Label x={x} y={309}>終了</Label>
    <text x={159} y={253} fill="currentColor" stroke="none">注　ループ端の繰返し指定は，</text>
    <text x={189} y={275} fill="currentColor" stroke="none">変数名：初期値，増分，終値を示す。</text>
  </Drawing>;
}

function Grid(props: BookletFigureProps) {
  const { width, height, column, row } = gridCases[props.values[0]];
  const step = 45, left = 31, top = 27, right = left + width * step, bottom = top + height * step;
  const points = [['P', left, bottom, -13, 18], ['Q', right, top, 15, -9],
    ['R', left + column * step, bottom - row * step, -11, -10]] as const;
  return <Drawing {...props} kind="grid" width={right + 36} height={bottom + 34}>
    {Array.from({ length: width + 1 }, (_, i) => <path key={'column-' + i} data-grid-column={i}
      d={'M' + (left + i * step) + ' ' + top + 'V' + bottom}/>)}
    {Array.from({ length: height + 1 }, (_, i) => <path key={'row-' + i} data-grid-row={i}
      d={'M' + left + ' ' + (top + i * step) + 'H' + right}/>)}
    {points.map(([name, x, y, dx, dy]) => <g key={name} data-grid-point={name}>
      <circle cx={x} cy={y} r={4} fill="currentColor"/><Label x={x + dx} y={y + dy}>{name}</Label>
    </g>)}
  </Drawing>;
}

function Heap(props: BookletFigureProps) {
  const { values } = heapCases[props.values[0]];
  const points = [[191, 25], [109, 77], [273, 77], [68, 129], [150, 129],
    [232, 129], [314, 129], [39, 186], [92, 186], [133, 186]];
  const nodeRadius = 17;
  const edge = (parent: number, child: number) => {
    const [x1, y1] = points[parent], [x2, y2] = points[child];
    const length = Math.hypot(x2 - x1, y2 - y1), dx = nodeRadius * (x2 - x1) / length, dy = nodeRadius * (y2 - y1) / length;
    return <line key={child} data-heap-edge={parent + '-' + child}
      x1={x1 + dx} y1={y1 + dy} x2={x2 - dx} y2={y2 - dy} strokeDasharray={child === 9 ? '3 3' : undefined}/>;
  };
  return <Drawing {...props} kind="heap" width={354} height={216}>
    {points.slice(1).map((_, i) => edge(Math.floor(i / 2), i + 1))}
    {values.map((value, i) => <g key={i} data-heap-node={i}>
      <circle cx={points[i][0]} cy={points[i][1]} r={nodeRadius}/>
      {i === 4 && <circle cx={points[i][0]} cy={points[i][1]} r={nodeRadius - 3}/>}
      <Label x={points[i][0]} y={points[i][1] + 5}>{value}</Label>
    </g>)}
    <Label x={174} y={107}>A</Label><Label x={points[9][0]} y={points[9][1] + 5}>＊</Label>
  </Drawing>;
}

type GateKind = typeof legendItems[number][0];
function Gate({ kind, x, y }: { kind: GateKind; x: number; y: number }) {
  return <g transform={'translate(' + x + ' ' + y + ')'} data-gate={kind}>
    {kind === 'AND' ? <path d="M0 -16H19A16 16 0 0 1 19 16H0Z"/>
      : kind === 'NOT' ? <><path d="M0 -14L27 0 0 14Z"/><circle cx={31} cy={0} r={4}/></>
      : <><path d="M0 -16H11Q26 -16 36 0Q26 16 11 16H0Q8 0 0 -16Z"/>
        {kind === 'XOR' && <path d="M-5 -16Q3 0 -5 16"/>}</>}
  </g>;
}
const gateOutput = (kind: GateKind) => kind === 'AND' || kind === 'NOT' ? 35 : 36;
const gateInput = (kind: GateKind) => kind === 'XOR' ? -2 : kind === 'OR' ? 3 : 0;

function GateLegend(props: BookletFigureProps) {
  return <Drawing {...props} kind="gateLegend" width={440} height={100}>
    {legendItems.map(([kind], index) => {
      const x = 26 + 109 * index, input = x + gateInput(kind);
      return <g key={kind}>
        <Gate kind={kind} x={x} y={28}/>
        {kind === 'NOT' ? <path d={'M' + (x - 15) + ' 28H' + x}/> : <>
          <path d={'M' + (x - 15) + ' 19H' + input}/>
          <path d={'M' + (x - 15) + ' 37H' + input}/>
        </>}
        <path d={'M' + (x + gateOutput(kind)) + ' 28h12'}/>
        <Label x={x + 17} y={60}>{kind}</Label>
      </g>;
    })}
    <text x={9} y={88} fill="currentColor" stroke="none" fontSize={12}>{legendNote}</text>
  </Drawing>;
}

function ParityCircuit(props: BookletFigureProps) {
  const index = props.values[0], { gate, inverted } = circuitOutputs[index % circuitOutputs.length];
  const extended = index >= circuitOutputs.length;
  const first = 40, second = 116, join = 205, output = join + gateOutput(gate), input = join + gateInput(gate);
  const inputGroup = (y: number) => <g>
    <path d={'M17 ' + (y - 9) + 'H' + (first - 2) + 'M17 ' + (y + 9) + 'H' + (first - 2)}/>
    <Gate kind="XOR" x={first} y={y}/>
    {extended && <>
      <path d={'M' + (first + 36) + ' ' + y + 'H92V' + (y + 5) + 'H' + (second - 2)}/>
      <path d={'M17 ' + (y + 28) + 'H92V' + (y + 23) + 'H' + (second - 2)}/>
      <Gate kind="XOR" x={second} y={y + 14}/>
    </>}
  </g>;
  const start = extended ? second + 36 : first + 36;
  const upper = 25 + (extended ? 14 : 0), lower = 90 + (extended ? 14 : 0), middle = 62 + (extended ? 14 : 0);
  return <Drawing {...props} kind="parityCircuit" width={334} height={extended ? 126 : 112}>
    {inputGroup(25)}{inputGroup(90)}
    <path d={'M' + start + ' ' + upper + 'H179V' + (middle - 9) + 'H' + input +
      'M' + start + ' ' + lower + 'H179V' + (middle + 9) + 'H' + input}/>
    <Gate kind={gate} x={join} y={middle}/>
    {inverted ? <>
      <path d={'M' + output + ' ' + middle + 'H272M307 ' + middle + 'H326'}/>
      <Gate kind="NOT" x={272} y={middle}/>
    </> : <path d={'M' + output + ' ' + middle + 'h17'}/>}
  </Drawing>;
}

export const legacy2008AutumnAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.conversion, component: Conversion },
  { profile: profiles.grid, component: Grid },
  { profile: profiles.heap, component: Heap },
  { profile: profiles.gateLegend, component: GateLegend },
  { profile: profiles.parityCircuit, component: ParityCircuit },
];
