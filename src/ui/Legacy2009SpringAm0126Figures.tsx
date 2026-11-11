import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { adderWiring, legacy2009SpringAm0126Figures, logicExpressions, profiles, targetWiring, transferCases } from '../core/generators/legacy-2009-spring-am-01-26-figures';

type Kind = keyof typeof profiles;
type DrawingProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2009SpringAm0126Figures.find(item => item.profile === profile)!.alt(values);
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
function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const end = (offset: number) => (x2 - 8 * Math.cos(angle + offset)) + ' ' + (y2 - 8 * Math.sin(angle + offset));
  return <path d={`M${x1} ${y1}L${x2} ${y2}M${end(0.45)}L${x2} ${y2}L${end(-0.45)}`}/>;
}

function LogicExpression(props: BookletFigureProps) {
  const [value] = props.values;
  const expression = logicExpressions(Math.floor(value / 5)).all[value % 5];
  const tokens = expression.match(/NOT\(|[ABC()＋・]/g)!;
  const shapes: ReactNode[] = [];
  let offset = 0, x = 12;
  function symbol(token: string) {
    const width = /^[()]$/.test(token) ? 10 : 17;
    shapes.push(<text key={'symbol-' + shapes.length} x={x + width / 2} y={41} textAnchor="middle"
      fill="currentColor" stroke="none" fontSize={21} fontStyle={/^[ABC]$/.test(token) ? 'italic' : undefined}>{token}</text>);
    x += width;
  }
  function layout(depth: number) {
    while (offset < tokens.length) {
      const token = tokens[offset++];
      if (token === ')') return;
      if (token === '(') {
        symbol('(');
        layout(depth);
        symbol(')');
      } else if (token === 'NOT(') {
        const start = x;
        layout(depth + 1);
        const y = 13 + 7 * depth;
        shapes.push(<line key={'line-' + shapes.length} x1={start} y1={y} x2={x} y2={y} data-overline-depth={depth}/>);
      } else symbol(token);
    }
  }
  layout(0);
  return <Drawing {...props} kind="logicExpression" width={x + 12} height={53}>
    <g data-logic-expression={expression}>{shapes}</g>
  </Drawing>;
}

function Translation(props: BookletFigureProps) {
  const { steps: [compiled, library, executable], extra } = transferCases[props.values[0]];
  const slot = (x: number, y: number, letter: string) => <g>
    <rect x={x - 13} y={y - 17} width={26} height={34}/><Label x={x} y={y + 5}>{letter}</Label>
  </g>;
  return <Drawing {...props} kind="translation" width={683} height={136}>
    <Label x={63} y={105}>原始プログラム</Label><Label x={194} y={105}>コンパイラ</Label>
    <Label x={399} y={105}>リンカ</Label><Label x={625} y={105}>ローダ</Label>
    {slot(299, 100, compiled)}{slot(399, 30, library)}{slot(500, 100, executable)}
    {[[120, 152], [240, 280], [316, 365], [435, 481], [517, 589]].map(([x1, x2]) =>
      <Arrow key={x1} x1={x1} y1={100} x2={x2} y2={100}/>)}
    <Arrow x1={399} y1={51} x2={399} y2={83}/>
    {extra && <><Label x={550} y={36}>{extra}</Label><Arrow x1={496} y1={48} x2={428} y2={83}/></>}
  </Drawing>;
}

type GateKind = 'AND' | 'OR' | 'NOT';
function Gate({ kind, x, y }: { kind: GateKind; x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`} data-gate={kind}>
    {kind === 'AND' ? <path d="M0 -18H22A18 18 0 0 1 22 18H0Z"/>
      : kind === 'OR' ? <path d="M0 -18H11Q28 -18 42 0Q28 18 11 18H0Q10 0 0 -18Z"/>
      : <><path d="M0 -16L29 0 0 16Z"/><circle cx={33} cy={0} r={4}/></>}
  </g>;
}

function Legend(props: BookletFigureProps) {
  return <Drawing {...props} kind="gateLegend" width={378} height={75}>
    {(['AND', 'OR', 'NOT'] as const).map((kind, i) => {
      const x = 35 + 124 * i;
      return <g key={kind}>
        <Gate kind={kind} x={x} y={27}/>
        <path d={kind === 'NOT' ? `M${x - 10} 27h10m37 0h10`
          : `M${x - 10} 17H${x + (kind === 'OR' ? 4 : 0)}M${x - 10} 37H${x + (kind === 'OR' ? 4 : 0)}M${x + (kind === 'AND' ? 40 : 42)} 27h10`}/>
        <Label x={x + 19} y={66}>{kind}</Label>
      </g>;
    })}
  </Drawing>;
}

function Target(props: BookletFigureProps) {
  const { topInverted, lower, lowerInverted } = targetWiring[props.values[0]];
  return <Drawing {...props} kind="gateTarget" width={329} height={144}>
    <Label x={20} y={30}>A</Label><Label x={20} y={104}>B</Label><Label x={308} y={70}>X</Label>
    <path d={topInverted ? 'M35 25H56M93 25H143' : 'M35 25H143'}/>
    {topInverted && <Gate kind="NOT" x={56} y={25}/>}
    <path d="M35 99H113V45H143M183 35H214V55H235M272 65H293"/>
    {lower === 'B' ? <>
      <circle cx={113} cy={99} r={2.4} fill="currentColor"/><path d="M113 99H143"/>
    </> : <>
      <circle cx={81} cy={25} r={2.4} fill="currentColor"/>
      <path d="M81 25V94Q72 99 81 104V118H143"/>
    </>}
    {lowerInverted && <Gate kind="NOT" x={143} y={lower === 'B' ? 99 : 118}/>}
    <path d={lower === 'B' ? 'M180 99H220V75H235' : lowerInverted ? 'M180 118H220V75H235' : 'M143 118H220V75H235'}/>
    <Gate kind="AND" x={143} y={35}/><Gate kind="OR" x={230} y={65}/>
  </Drawing>;
}

function Choice(props: BookletFigureProps) {
  const index = props.values[0];
  return <Drawing {...props} kind="gateChoice" width={334} height={116}>
    <Label x={20} y={35}>A</Label><Label x={20} y={85}>B</Label><Label x={312} y={53}>X</Label>
    {index === 0 && <>
      <path d="M34 30H90V38H116M34 80H90V58H116M156 48H207M244 48H297"/>
      <Gate kind="AND" x={116} y={48}/><Gate kind="NOT" x={207} y={48}/>
    </>}
    {index === 1 && <>
      <path d="M34 30H210V38H235M34 80H94M131 80H215V58H235M272 48H297"/>
      <Gate kind="NOT" x={94} y={80}/><Gate kind="OR" x={230} y={48}/>
    </>}
    {index === 2 && <>
      <path d="M34 30H214V38H235M71 30V72H116M34 80H85V92H116M156 82H216V58H235M272 48H297"/>
      <circle cx={71} cy={30} r={2.4} fill="currentColor"/>
      <Gate kind="AND" x={116} y={82}/><Gate kind="OR" x={230} y={48}/>
    </>}
    {index === 3 && <>
      <path d="M34 30H143V38H155M34 80H94M131 80H143V58H155M195 48H215M252 48H297"/>
      <Gate kind="NOT" x={94} y={80}/><Gate kind="AND" x={155} y={48}/><Gate kind="NOT" x={215} y={48}/>
    </>}
  </Drawing>;
}

function Adder(props: BookletFigureProps) {
  const { upper, lower, inversion } = adderWiring[props.values[0]];
  const output = (y: number, role: 'z' | 'c', invert: boolean) => <>
    <path d={invert ? `M200 ${y}H223M260 ${y}H280` : `M200 ${y}H280`}/>
    {invert && <Gate kind="NOT" x={223} y={y}/>}
    <circle cx={283} cy={y} r={3}/><Label x={351} y={y + 5}>{role === 'z' ? 'z（和の1けた目）' : 'c（けた上げ）'}</Label>
  </>;
  return <Drawing {...props} kind="adder" width={424} height={131}>
    <Label x={20} y={30}>x</Label><Label x={20} y={52}>y</Label>
    <circle cx={35} cy={25} r={3}/><circle cx={35} cy={47} r={3}/>
    <path d="M38 25H147M38 47H147M68 25V42Q78 47 68 52V89H147M95 47V85Q105 89 95 93V111H147"/>
    <circle cx={68} cy={25} r={2.4} fill="currentColor"/><circle cx={95} cy={47} r={2.4} fill="currentColor"/>
    <rect x={147} y={17} width={53} height={38}/><Label x={173} y={41}>A</Label>
    <rect x={147} y={81} width={53} height={38}/><Label x={173} y={105}>B</Label>
    {output(36, upper, inversion === 'A')}{output(100, lower, inversion === 'B')}
  </Drawing>;
}

export const legacy2009SpringAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.logicExpression, component: LogicExpression },
  { profile: profiles.translation, component: Translation }, { profile: profiles.gateLegend, component: Legend },
  { profile: profiles.gateTarget, component: Target }, { profile: profiles.gateChoice, component: Choice },
  { profile: profiles.adder, component: Adder },
];
