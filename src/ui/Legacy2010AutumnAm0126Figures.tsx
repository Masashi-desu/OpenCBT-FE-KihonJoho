import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { lampCases, legacy2010AutumnAm0126Figures, logicCircuits, logicExpressions,
  profiles2010AutumnAm0126 as profiles, recoveryCases, taskDurations } from '../core/generators/legacy-2010-autumn-am-01-26-figures';

type DiagramProps = BookletFigureProps & { profile: string; width: number; height: number; children: (id: string) => ReactNode };
function Canvas({ profile, values, caption, width, height, children }: DiagramProps) {
  const id = useId(), alt = legacy2010AutumnAm0126Figures.find(item => item.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <defs>
          <marker id={id + '-arrow'} viewBox="0 0 10 10" refX={9} refY={5} markerUnits="userSpaceOnUse"
            markerWidth={11} markerHeight={11} orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.25}/>
          </marker>
        </defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} fontSize={15}>{children(id)}</g>
      </svg>
    </div>
  </figure>;
}
function Label({ x, y, children, align = 'middle' }: {
  x: number; y: number; children: ReactNode; align?: 'start' | 'middle' | 'end';
}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={align}>{children}</text>;
}

function Storage(props: BookletFigureProps) {
  const [i] = props.values, pcFilesystem = i % 2 === 0, dedicated = i < 2;
  const xs = dedicated ? [53, 147, 241] : [53, 122, 191], diskX = dedicated ? 147 : 234;
  const ellipse = (x: number, y: number) => <g data-filesystem="true">
    <ellipse cx={x} cy={y} rx={19} ry={14} fill="currentColor" opacity={0.22}/>
    <ellipse cx={x} cy={y} rx={19} ry={14}/>
  </g>;
  return <Canvas {...props} profile={profiles.storage} width={300} height={221}>{() => <>
    <g data-storage-network={dedicated ? 'dedicated' : 'lan'} data-filesystem-side={pcFilesystem ? 'pc' : 'storage'}>
      <path d="M22 32H277"/><Label x={257} y={23}>LAN</Label>
      {xs.map(x => <g key={x} data-storage-pc="true">
        <path d={'M' + x + ' 32v18'}/><rect x={x - 26} y={50} width={52} height={28}/>
        <Label x={x} y={70}>PC</Label>
        {pcFilesystem && ellipse(x, 82)}
      </g>)}
      {dedicated ? <>
        {[-2, 2].map(shift => <path key={shift} d={'M' + (xs[0] + shift + (pcFilesystem ? 14 : 15)) +
          ' ' + (pcFilesystem ? 92 : 78) + 'L' + (diskX + shift) + ' 132L' + (xs[2] + shift - 14) +
          ' ' + (pcFilesystem ? 92 : 78) + 'M' + (diskX + shift) + ' ' + (pcFilesystem ? 96 : 78) +
          'V' + (pcFilesystem ? 167 : 151)}/>)}
      </> : <path d={'M' + diskX + ' 32V' + (pcFilesystem ? 167 : 151)}/>}
      <rect x={diskX - 46} y={167} width={92} height={39}/>
      {[diskX - 26, diskX + 26].map(x => <g key={x}>
        <path d={'M' + (x - 10) + ' 182v11a10 4 0 0 0 20 0v-11'}/><ellipse cx={x} cy={182} rx={10} ry={4}/>
      </g>)}
      <Label x={diskX} y={191}>…</Label><Label x={diskX} y={219}>ストレージ</Label>
      {!pcFilesystem && ellipse(diskX, 164)}
    </g>
  </>}</Canvas>;
}

function Recovery(props: BookletFigureProps) {
  const { up, down } = recoveryCases[props.values[0]];
  return <Canvas {...props} profile={profiles.recovery} width={632} height={210}>{id => {
    const arrow = 'url(#' + id + '-arrow)';
    return <g data-uptime-symbol={up} data-downtime-symbol={down}>
      <path d="M25 89H369M25 89V120H369M415 89H605V120H415M122 89V120M196 89V120M343 89V120M441 89V120M530 89V120"/>
      <Label x={72} y={110}>{up}₁</Label><Label x={160} y={110}>{down}₁</Label>
      <Label x={270} y={110}>{up}₂</Label><Label x={392} y={108}>…</Label>
      <Label x={486} y={110}>{up}ₙ</Label><Label x={568} y={110}>{down}ₙ</Label>
      {[[122, '1'], [343, '2'], [530, 'n']].map(([x, order]) => <g key={x}>
        <Label x={Number(x)} y={24}>{order}回目の</Label><Label x={Number(x)} y={45}>故障</Label>
        <path d={'M' + x + ' 55V86'} markerEnd={arrow}/>
      </g>)}
      {[196, 441, 605].map(x => <g key={x}>
        <path d={'M' + x + ' 163V123'} markerEnd={arrow}/><Label x={x} y={187}>回復</Label>
      </g>)}
    </g>;
  }}</Canvas>;
}

function Series(props: BookletFigureProps) {
  return <Canvas {...props} profile={profiles.series} width={405} height={148}>{() => <>
    <path d="M10 74H44M168 74H207M331 74H375"/>
    {[[44, 'A', 'C'], [207, 'B', 'D']].map(([left, top, bottom]) => {
      const x = Number(left);
      return <g key={x} data-parallel={top + ' ' + bottom}>
        <path d={'M' + x + ' 32h26M' + x + ' 32v84h26M' + (x + 98) + ' 32h26v84h-26'}/>
        <rect x={x + 26} y={12} width={72} height={40}/><rect x={x + 26} y={96} width={72} height={40}/>
        <Label x={x + 62} y={38}>{top}</Label><Label x={x + 62} y={122}>{bottom}</Label>
      </g>;
    })}
  </>}</Canvas>;
}

function Resources(props: BookletFigureProps) {
  const rows = taskDurations[props.values[0]];
  return <Canvas {...props} profile={profiles.resources} width={552} height={161}>{id => <>
    {rows.map((steps, i) => {
      const y = i === 0 ? 11 : 87;
      return <g key={y} data-task={'AB'[i]}>
        <Label x={50} y={y + 28}>タスク{'AB'[i]}</Label>
        {steps.map((time, j) => {
          const x = 104 + j * 152;
          return <g key={j} data-phase={j === 1 ? 'resource' : 'cpu'} data-duration={time}>
            <rect x={x} y={y} width={115} height={51}/>
            <Label x={x + 57.5} y={y + 20}>{j === 1 ? '資源R' : 'CPU'}</Label>
            <Label x={x + 57.5} y={y + 40}>{time}ミリ秒</Label>
            {j < 2 && <path d={'M' + (x + 115) + ' ' + (y + 26) + 'h36'} markerEnd={'url(#' + id + '-arrow)'}/>}
          </g>;
        })}
      </g>;
    })}
  </>}</Canvas>;
}

type GateKind = 'AND' | 'OR' | 'NAND' | 'NOR';
function BinaryGate({ x, y, kind }: { x: number; y: number; kind: GateKind }) {
  const negated = kind === 'NAND' || kind === 'NOR';
  const and = kind === 'AND' || kind === 'NAND';
  return <g transform={'translate(' + x + ' ' + y + ')'} data-gate={kind}>
    <path d="M-13 -10H4M-13 10H4"/>
    {and ? <path d="M0 -19H24A19 19 0 0 1 24 19H0Z" fill="var(--diagram-surface)"/>
      : <path d="M0 -19H13Q32 -19 43 0Q32 19 13 19H0Q10 0 0 -19Z" fill="var(--diagram-surface)"/>}
    {negated && <circle cx={47} cy={0} r={4} fill="var(--diagram-surface)"/>}
    <path d={negated ? 'M51 0H57' : 'M43 0H57'}/>
  </g>;
}
function Not({ x, y }: { x: number; y: number }) {
  return <g transform={'translate(' + x + ' ' + y + ')'} data-gate="NOT">
    <path d="M0 -16L32 0L0 16Z"/><circle cx={36} cy={0} r={4} fill="var(--diagram-surface)"/>
    <path d="M40 0H46"/>
  </g>;
}
function Circuit(props: BookletFigureProps) {
  const { middle, final } = logicCircuits[props.values[0]];
  return <Canvas {...props} profile={profiles.circuit} width={690} height={215}>{() => <>
    <Label x={27} y={76}>A</Label><Label x={27} y={148}>B</Label>
    <path d="M42 71H154M42 143H154M86 71V33H427M86 143V177H427M200 71H240V97H277M200 143H240V117H277"/>
    <circle cx={86} cy={71} r={2.6} fill="currentColor"/><circle cx={86} cy={143} r={2.6} fill="currentColor"/>
    <Not x={154} y={71}/><Not x={154} y={143}/><BinaryGate x={290} y={107} kind={middle}/>
    <path d="M347 107H383V53H427M383 107V157H427"/>
    <circle cx={383} cy={107} r={2.6} fill="currentColor"/>
    <BinaryGate x={440} y={43} kind="AND"/><BinaryGate x={440} y={167} kind="AND"/>
    <path d="M497 43H531V97H562M497 167H531V117H562"/>
    <BinaryGate x={575} y={107} kind={final}/><path d="M632 107h18"/><Label x={670} y={112}>X</Label>
  </>}</Canvas>;
}

function Expression(props: BookletFigureProps) {
  const [i] = props.values;
  const expression = logicExpressions[Math.floor(i / 4)][i % 4];
  const tokens = expression.match(/!\([^)]+\)|![AB]|[AB()+·]/g)!;
  const shapes: ReactNode[] = [];
  let x = 42;
  const add = (value: string, key: string) => {
    const width = /^[()]$/.test(value) ? 11 : 16;
    shapes.push(<text key={key} x={x + width / 2} y={39} textAnchor="middle" fill="currentColor" stroke="none"
      fontSize={22} fontStyle={/^[AB]$/.test(value) ? 'italic' : undefined}>{value}</text>);
    x += width;
  };
  tokens.forEach((token, index) => {
    if (!token.startsWith('!')) add(token, String(index));
    else {
      const start = x, content = token.startsWith('!(') ? token.slice(2, -1) : token.slice(1);
      [...content].forEach((item, j) => add(item, index + '-' + j));
      shapes.push(<line key={index + '-overline'} x1={start + 1} x2={x - 1} y1={17} y2={17} data-overline="true"/>);
    }
  });
  return <Canvas {...props} profile={profiles.expression} width={x + 13} height={52}>{() =>
    <g data-expression={expression}><Label x={20} y={39}>X＝</Label>{shapes}</g>
  }</Canvas>;
}

function Lamps(props: BookletFigureProps) {
  const { invert } = lampCases[props.values[0]];
  return <Canvas {...props} profile={profiles.lamps} width={463} height={118}>{() => <>
    {invert.map((inverted, i) => {
      const y = i === 0 ? 37 : 79;
      return <g key={i} data-lamp-input={'AB'[i]} data-inverted={String(inverted)}>
        <Label x={104} y={y + 5} align="end">スイッチ{'AB'[i]}</Label>
        {inverted ? <><path d={'M115 ' + y + 'H139M185 ' + y + 'H216'}/><Not x={139} y={y}/></>
          : <path d={'M115 ' + y + 'H216'}/>}
      </g>;
    })}
    <rect x={216} y={19} width={108} height={78}/><Label x={270} y={64}>論理回路</Label>
    <path d="M324 58H349"/><Label x={356} y={64} align="start">出力（照明）</Label>
  </>}</Canvas>;
}

export const legacy2010AutumnAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.storage, component: Storage }, { profile: profiles.recovery, component: Recovery },
  { profile: profiles.series, component: Series }, { profile: profiles.resources, component: Resources },
  { profile: profiles.circuit, component: Circuit }, { profile: profiles.expression, component: Expression },
  { profile: profiles.lamps, component: Lamps },
];
