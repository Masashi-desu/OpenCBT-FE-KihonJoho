import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  legacy2012AutumnAm0126Figures, nandCases, profiles2012AutumnAm0126 as profiles, reliabilityCases, searchFlowLabels,
} from '../core/generators/legacy-2012-autumn-am-01-26-figures';

function Canvas({ profile, width, height, caption, values, children }: BookletFigureProps & {
  profile: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  const alt = legacy2012AutumnAm0126Figures.find(definition => definition.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX={9} refY={5}
          markerWidth={7} markerHeight={7} orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.2}/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.6} fontSize={15}>
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
  </figure>;
}

function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor="middle">{children}</text>;
}

function SearchFlow(props: BookletFigureProps) {
  const labels = searchFlowLabels(props.values[0]);
  return <Canvas {...props} profile={profiles.binarySearch} width={620} height={430}>{arrow => <>
    <g data-flow-step="start"><rect x={252} y={12} width={126} height={28} rx={14}/><Label x={315} y={31}>開始</Label></g>
    <path d="M315 40V62" markerEnd={arrow}/>
    <g data-flow-step="initial-range">
      <rect x={248} y={62} width={134} height={48}/>
      <Label x={315} y={81}>1 → x</Label><Label x={315} y={101}>{labels.end} → y</Label>
    </g>
    <path d="M315 110V134"/>
    <g data-flow-step="check-range">
      <path d="M315 134L381 158L315 182L249 158Z"/>
      <Label x={315} y={163}>x：y</Label>
    </g>
    <path d="M315 182V207" markerEnd={arrow}/>
    <Label x={348} y={196}>{labels.continueSearch}</Label>
    <path d="M381 158H511V207" markerEnd={arrow}/>
    <Label x={421} y={150}>{labels.exhausted}</Label>
    <g data-flow-step="midpoint">
      <rect x={249} y={207} width={132} height={39}/>
      <rect x={276} y={213} width={78} height={27}/>
      <Label x={315} y={232}>a</Label>
    </g>
    <g data-flow-step="not-found"><rect x={445} y={207} width={132} height={39}/><Label x={511} y={232}>0 → m</Label></g>
    <path d="M315 246V275" markerEnd={arrow}/>
    <g data-flow-step="compare-element">
      <path d="M315 275L381 299L315 323L249 299Z"/>
      <Label x={315} y={304}>k：A(m)</Label>
    </g>
    <path d="M249 299H139V346" markerEnd={arrow}/>
    <path d="M315 323V346" markerEnd={arrow}/>
    <path d="M381 299H511M511 246V346" markerEnd={arrow}/>
    <Label x={224} y={290}>{labels.highBranch}</Label>
    <Label x={333} y={338}>{labels.lowBranch}</Label>
    <Label x={409} y={291}>＝</Label>
    <g data-flow-step="move-high">
      <rect x={73} y={346} width={132} height={36}/><Label x={139} y={370}>{labels.highUpdate}</Label>
    </g>
    <g data-flow-step="move-low">
      <rect x={249} y={346} width={132} height={36}/><Label x={315} y={370}>m＋1 → x</Label>
    </g>
    <g data-flow-step="end"><rect x={445} y={346} width={132} height={36} rx={18}/><Label x={511} y={370}>終了</Label></g>
    <path d="M315 382V408H45V125H315" markerEnd={arrow}/>
    <path d="M139 382V408"/>
  </>}</Canvas>;
}

function Reliability(props: BookletFigureProps) {
  const { common, upper, lower } = reliabilityCases[props.values[0]];
  const step = 75, boxWidth = 56, first = 38, split = first + common * step + 3;
  const branchStart = split + 25, join = branchStart + Math.max(upper, lower) * step + 3;
  function boxes(group: string, count: number, start: number, y: number) {
    return Array.from({ length: count }, (_, index) => {
      const x = start + index * step;
      return <g key={index} data-reliability-group={group}>
        <rect x={x} y={y - 17} width={boxWidth} height={34} fill="var(--diagram-surface)"/>
        <Label x={x + boxWidth / 2} y={y + 5}>P</Label>
      </g>;
    });
  }
  return <Canvas {...props} profile={profiles.reliability} width={join + 38} height={158}>{() => <>
    <path d={'M14 79H' + split + 'M' + split + ' 37V121M' + split + ' 37H' + join +
      'M' + split + ' 121H' + join + 'M' + join + ' 37V121M' + join + ' 79h24'}/>
    {boxes('common', common, first, 79)}
    {boxes('upper', upper, branchStart, 37)}
    {boxes('lower', lower, branchStart, 121)}
  </>}</Canvas>;
}

const branchedLayout = [[136, 43], [136, 127], [301, 85], [465, 85]] as const;
const chainedLayout = [[136, 85], [301, 85], [465, 85]] as const;

function NandCircuit(props: BookletFigureProps) {
  const index = props.values[0], gates = nandCases[index], branched = index === 0 || index === 3;
  const layout = branched ? branchedLayout : chainedLayout;
  const inputs = branched ? [[23, 43], [23, 127]] : [[23, 71], [23, 99]];
  const signals = [...inputs, ...layout.slice(0, gates.length).map(([x, y]) => [x + 73, y])];
  const [lastX, lastY] = signals.at(-1)!;
  return <Canvas {...props} profile={profiles.nand} width={lastX + 84} height={174}>{() => <>
    <Label x={13} y={inputs[0][1] + 5}>X</Label>
    <Label x={13} y={inputs[1][1] + 5}>Y</Label>
    {gates.map(([top, bottom], gateIndex) => {
      const [x, y] = layout[gateIndex];
      const [aX, aY] = signals[top], [bX, bY] = signals[bottom];
      const aMid = (aX + x) / 2, bMid = (bX + x) / 2;
      return <g key={gateIndex} data-nand-gate={gateIndex + 1} data-nand-inputs={top + ',' + bottom}>
        {top === bottom ? <>
          <path d={'M' + aX + ' ' + aY + 'H' + aMid + 'M' + x + ' ' + (y - 14) + 'H' + aMid + 'V' + (y + 14) + 'H' + x}/>
          <circle cx={aMid} cy={aY} r={2.5} fill="currentColor" stroke="none"/>
        </> : <>
          <path d={'M' + aX + ' ' + aY + 'H' + aMid + 'V' + (y - 14) + 'H' + x}/>
          <path d={'M' + bX + ' ' + bY + 'H' + bMid + 'V' + (y + 14) + 'H' + x}/>
        </>}
        <path d={'M' + x + ' ' + (y - 25) + 'h33a25 25 0 0 1 0 50h-33z'} fill="var(--diagram-surface)"/>
        <path d={'M' + (x + 58) + ' ' + y + 'h4'}/>
        <circle cx={x + 67.5} cy={y} r={5.5} fill="var(--diagram-surface)" data-nand-inversion="true"/>
      </g>;
    })}
    <path d={'M' + lastX + ' ' + lastY + 'h55'}/>
    <Label x={lastX + 68} y={lastY + 5}>Z</Label>
  </>}</Canvas>;
}

function LogicChoice(props: BookletFigureProps) {
  const option = props.values[0], symbol = option % 2 ? '＋' : '・';
  return <Canvas {...props} profile={profiles.logicChoice} width={130} height={49}>{() => <>
    <g data-logic-choice-expression={option} fontSize={20}>
      <Label x={31} y={36}>X</Label>
      <Label x={65} y={36}>{symbol}</Label>
      <Label x={99} y={36}>Y</Label>
      {option >= 2 && <line data-logic-choice-overline="true" x1={22} y1={13} x2={109} y2={13}/>}
    </g>
  </>}</Canvas>;
}

export const legacy2012AutumnAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.binarySearch, component: SearchFlow },
  { profile: profiles.reliability, component: Reliability },
  { profile: profiles.nand, component: NandCircuit },
  { profile: profiles.logicChoice, component: LogicChoice },
];
