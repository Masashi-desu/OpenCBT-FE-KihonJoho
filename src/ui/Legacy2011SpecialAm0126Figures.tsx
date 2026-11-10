import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { adderCases, displayedTrees, flowCases, legacy2011SpecialAm0126Figures, logicExpressions, memoryCases, memoryRows, parityCases,
  profiles2011SpecialAm0126 as profiles, schedule, taskCases, type Tree } from '../core/generators/legacy-2011-special-am-01-26-figures';

type CanvasProps = BookletFigureProps & { profile: string; width: number; height: number; children: (id: string) => ReactNode };

function Canvas({ profile, width, height, caption, values, children }: CanvasProps) {
  const id = useId();
  const alt = legacy2011SpecialAm0126Figures.find(figure => figure.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt}</desc>
        <defs>
          <marker id={id + '-arrow'} viewBox="0 0 10 10" refX={9} refY={5} markerUnits="userSpaceOnUse"
            markerWidth={10} markerHeight={10} orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.3}/>
          </marker>
          <pattern id={id + '-io'} patternUnits="userSpaceOnUse" width={6} height={6}>
            <path d="M-2 2L2 -2M0 6L6 0M4 8L8 4" stroke="currentColor" strokeWidth={0.75} opacity={0.65}/>
          </pattern>
        </defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} fontSize={15}>
          {children(id)}
        </g>
      </svg>
    </div>
  </figure>;
}

function Label({ x, y, children, align = 'middle' }: {
  x: number; y: number; children: ReactNode; align?: 'start' | 'middle' | 'end';
}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={align}>{children}</text>;
}

function LogicExpression(props: BookletFigureProps) {
  const [value] = props.values;
  const expression = logicExpressions(Math.floor(value / 5)).formulas[value % 5];
  const tokens = expression.replaceAll('\\cdot ', '·').match(/\\overline\{|[ABC()+·}]/g)!;
  const shapes: ReactNode[] = [];
  let i = 0, x = 13;
  const draw = (depth: number) => {
    while (i < tokens.length) {
      const token = tokens[i++];
      if (token === '}') return;
      if (token === '\\overline{') {
        const start = x, key = i;
        draw(depth + 1);
        const y = 10 + depth * 7;
        shapes.push(<line key={'line-' + key} x1={start} x2={x} y1={y} y2={y} data-overline-depth={depth}/>);
      } else {
        const width = /^[()]$/.test(token) ? 10 : 16;
        shapes.push(<text key={i} x={x + width / 2} y={38} textAnchor="middle" fill="currentColor" stroke="none"
          fontSize={21} fontStyle={/^[ABC]$/.test(token) ? 'italic' : undefined}>{token}</text>);
        x += width;
      }
    }
  };
  draw(0);
  return <Canvas {...props} profile={profiles.logic} width={x + 13} height={51}>{() =>
    <g data-logic-expression={expression}>{shapes}</g>
  }</Canvas>;
}

function BinaryTree(props: BookletFigureProps) {
  const [value] = props.values, tree = displayedTrees(Math.floor(value / 4))[value % 4];
  const place = (node: Tree, x: number, y: number, spread: number): ReactNode => {
    const child = (next: Tree | undefined, offset: number) => next && <>
      <path d={'M' + x + ' ' + y + 'L' + (x + offset) + ' ' + (y + 51)}/>
      {place(next, x + offset, y + 51, spread / 1.62)}
    </>;
    return <g data-tree-value={node.value} data-tree-left={node.left?.value} data-tree-right={node.right?.value}>
      {child(node.left, -spread)}
      {child(node.right, spread)}
      <circle cx={x} cy={y} r={17} fill="var(--diagram-surface)"/>
      <Label x={x} y={y + 5}>{node.value}</Label>
    </g>;
  };
  return <Canvas {...props} profile={profiles.tree} width={290} height={200}>{() => place(tree, 145, 24, 59)}</Canvas>;
}

function Flow(props: BookletFigureProps) {
  const { initial, limit, sum, next } = flowCases[props.values[0]];
  return <Canvas {...props} profile={profiles.flow} width={340} height={435}>{id => <>
    <path d="M158 42V173M158 236V363H34V153H157" markerEnd={'url(#' + id + '-arrow)'}/>
    <path d="M251 204H310V381H158V397"/>
    <g fill="var(--diagram-surface)">
      <rect x={107} y={12} width={102} height={30} rx={15}/>
      <rect x={84} y={60} width={148} height={40}/>
      <rect x={84} y={117} width={148} height={32}/>
      <path d="M158 173L251 204L158 235L65 204Z"/>
      <rect x={84} y={261} width={148} height={35}/>
      <rect x={84} y={314} width={148} height={35}/>
      <rect x={106} y={397} width={104} height={29} rx={15}/>
    </g>
    <Label x={158} y={33}>開始</Label>
    <Label x={102} y={79}>①</Label><Label x={158} y={86}>{initial} → x</Label>
    <Label x={158} y={138}>1 → i</Label>
    <Label x={158} y={200}>②</Label><Label x={158} y={222}>i：{limit}</Label>
    <Label x={170} y={252}>≦</Label><Label x={265} y={201}>＞</Label>
    <Label x={102} y={281}>③</Label><Label x={165} y={284}>{sum}</Label>
    <Label x={102} y={334}>④</Label><Label x={165} y={337}>{next}</Label>
    <Label x={158} y={417}>終了</Label>
  </>}</Canvas>;
}

function Memory(props: BookletFigureProps) {
  const index = props.values[0];
  const { register, base } = memoryCases[index];
  const entries = memoryRows(index).flatMap((entry, i) =>
    i % 2 === 1 && i < 9 ? [entry, ['⋮', '⋮'] as const] : [entry]);
  return <Canvas {...props} profile={profiles.memory} width={450} height={391}>{() => <>
    <Label x={265} y={29} align="end">主記憶</Label><Label x={306} y={29}>番地</Label>
    {entries.map(([address, value], i) => {
      const y = 39 + i * 24;
      return <g key={i} data-memory-address={address} data-memory-value={value}>
        <rect x={339} y={y} width={86} height={24}/>
        <Label x={306} y={y + 17}>{address}</Label>
        <Label x={382} y={y + 17}>{value}</Label>
      </g>;
    })}
    <Label x={10} y={202} align="start">ベースレジスタ {register}</Label>
    <rect x={160} y={184} width={61} height={27}/><Label x={190.5} y={202}>{base}</Label>
  </>}</Canvas>;
}

function Timeline(props: BookletFigureProps) {
  const { rows, end } = schedule(taskCases[props.values[0]], false);
  const unit = 28, left = 104;
  return <Canvas {...props} profile={profiles.timeline} width={left + end * unit + 16} height={184}>{id => <>
    {rows.map((phases, j) => {
      const y = 54 + 86 * j, task = 'AB'[j], finish = phases.at(-1)!.end;
      return <g key={task} data-timeline-task={task}>
        <Label x={4} y={y + 4} align="start">タスク {task}</Label>
        <path d={'M' + left + ' ' + y + 'H' + (left + finish * unit)}/>
        {phases.map(({ start, end, kind }) => {
          const x = left + start * unit, width = (end - start) * unit;
          return <g key={start} data-phase={kind} data-start={start} data-end={end}>
            {kind !== '待ち' && <rect x={x} y={kind === 'CPU' ? y - 16 : y} width={width} height={16}
              fill={kind === 'CPU' ? 'currentColor' : 'url(#' + id + '-io)'} stroke="none"/>}
            <Label x={x + width / 2} y={y - 24}>{kind === 'I/O' ? 'I/O(' + task + ')' : kind}</Label>
          </g>;
        })}
        {Array.from({ length: finish + 1 }, (_, i) => {
          const x = left + i * unit;
          return <path key={i} d={'M' + x + ' ' + (y - 16) + 'v32'}/>;
        })}
      </g>;
    })}
  </>}</Canvas>;
}

type BinaryGateKind = 'AND' | 'OR' | 'XOR' | 'XNOR';

function BinaryGate({ x, y, kind }: { x: number; y: number; kind: BinaryGateKind }) {
  return <g transform={'translate(' + x + ' ' + y + ')'} data-gate={kind}>
    <path d="M-13 -8H3M-13 8H3"/>
    {kind === 'AND' ? <path d="M0 -16H21A16 16 0 0 1 21 16H0Z" fill="var(--diagram-surface)"/>
      : <path d="M0 -16H10Q28 -16 37 0Q28 16 10 16H0Q10 0 0 -16Z" fill="var(--diagram-surface)"/>}
    {(kind === 'XOR' || kind === 'XNOR') && <path d="M-8 -16Q2 0 -8 16"/>}
    {kind === 'XNOR' && <circle cx={40.5} cy={0} r={3.5} fill="var(--diagram-surface)"/>}
    <path d={kind === 'XNOR' ? 'M44 0H50' : 'M37 0H50'}/>
  </g>;
}

function Parity(props: BookletFigureProps) {
  const [value] = props.values;
  const [first, second, final, inverted] = parityCases[Math.floor(value / 4)][value % 4];
  return <Canvas {...props} profile={profiles.parity} width={290} height={151}>{() => <>
    <BinaryGate x={29} y={43} kind={first}/>
    <BinaryGate x={29} y={106} kind={second}/>
    <path d="M79 43H107V67H124M79 106H107V83H124"/>
    <BinaryGate x={137} y={75} kind={final}/>
    {inverted ? <g data-gate="NOT">
      <path d="M187 75H206M206 59L235 75L206 91Z"/>
      <circle cx={239} cy={75} r={4} fill="var(--diagram-surface)"/><path d="M243 75H261"/>
    </g> : <path d="M187 75H205"/>}
  </>}</Canvas>;
}

function Adder(props: BookletFigureProps) {
  const { swap, invertSum, invertCarry } = adderCases[props.values[0]];
  const sum = invertSum ? 'z（和の1けた目の反転）' : 'z（和の1けた目）';
  const carry = invertCarry ? 'c（けた上げの反転）' : 'c（けた上げ）';
  return <Canvas {...props} profile={profiles.adder} width={invertSum || invertCarry ? 505 : 456} height={141}>{() => <>
    <Label x={24} y={31}>x</Label><Label x={24} y={47}>y</Label>
    <path d="M45 26H163M45 42H163M82 26V38M82 46V98H163M115 42V94M115 102V114H163"/>
    <circle cx={82} cy={26} r={3.5} fill="currentColor"/><circle cx={115} cy={42} r={3.5} fill="currentColor"/>
    <rect x={163} y={18} width={49} height={33}/><rect x={163} y={90} width={49} height={32}/>
    <Label x={187.5} y={39}>A</Label><Label x={187.5} y={111}>B</Label>
    <path d="M212 34H280M212 106H280"/>
    <g data-adder-output-a={swap ? 'c' : 'z'}><Label x={290} y={39} align="start">{swap ? carry : sum}</Label></g>
    <g data-adder-output-b={swap ? 'z' : 'c'}><Label x={290} y={111} align="start">{swap ? sum : carry}</Label></g>
  </>}</Canvas>;
}

export const legacy2011SpecialAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.logic, component: LogicExpression },
  { profile: profiles.tree, component: BinaryTree },
  { profile: profiles.flow, component: Flow },
  { profile: profiles.memory, component: Memory },
  { profile: profiles.timeline, component: Timeline },
  { profile: profiles.parity, component: Parity },
  { profile: profiles.adder, component: Adder },
];
