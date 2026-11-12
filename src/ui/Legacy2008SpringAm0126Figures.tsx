import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2008SpringAm0126Figures, profiles, scatter } from '../core/generators/legacy-2008-spring-am-01-26-figures';

type Kind = keyof typeof profiles;
type DrawingProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2008SpringAm0126Figures.find(item => item.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</g>
      </svg>
    </div>
  </figure>;
}
function Label({ x, y, children, size = 15 }: { x: number; y: number; children: ReactNode; size?: number }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor="middle" fontSize={size}>{children}</text>;
}
function ScatterPlot(props: BookletFigureProps) {
  const { direction, points } = scatter(props.values[0]);
  const xPos = (value: number) => 135 + value * 16;
  const yPos = (value: number) => 80 - value * 7;
  return <Drawing {...props} kind="scatter" width={245} height={163}>
    <path d="M34 15V143H231"/>
    <Label x={29} y={21}>y</Label><Label x={232} y={157}>x</Label>
    <line data-regression="least-squares" x1={xPos(-5.8)} y1={yPos(-5.8 * direction)} x2={xPos(5.8)} y2={yPos(5.8 * direction)}/>
    {points.map(([x, y]) => <circle data-sample="true" key={x} cx={xPos(x)} cy={yPos(y)} r={3} fill="currentColor"/>)}
  </Drawing>;
}
function LogicExpression(props: BookletFigureProps) {
  const alt = legacy2008SpringAm0126Figures.find(item => item.profile === profiles.logic)!.alt(props.values);
  const tokens = alt.match(/否定[xyz]|[xyz∧∨（）]/g)!;
  return <Drawing {...props} kind="logic" width={272} height={53}>
    {tokens.map((token, i) => {
      const x = 15 + 22 * i, negated = token.startsWith('否定');
      return <g key={i}>
        <Label x={x} y={35} size={22}>{token.at(-1)}</Label>
        {negated && <line data-negation={token.at(-1)} x1={x - 7} x2={x + 7} y1={16} y2={16}/>}
      </g>;
    })}
  </Drawing>;
}

function GcdFlow(props: BookletFigureProps) {
  return <Drawing {...props} kind="gcd" width={482} height={362}>
    <path d="M241 38V63M241 110V174M175 195H81V184M307 195H402V184M241 217V248M241 302V327"/>
    <path d="M81 150V135H241M402 150V119H241"/>
    <path d="M75 191L81 184L87 191M396 191L402 184L408 191M232 129L241 135L232 141M250 113L241 119L250 125"/>
    <rect x={173} y={11} width={136} height={27} rx={13}/>
    <Label x={241} y={30}>開始</Label>
    <rect x={173} y={63} width={136} height={47}/>
    <Label x={241} y={82}>A → L</Label><Label x={241} y={102}>B → S</Label>
    <path d="M175 195L241 174L307 195L241 217Z"/><Label x={241} y={201}>L：S</Label>
    <Label x={166} y={188}>＞</Label><Label x={318} y={188}>＜</Label><Label x={251} y={234}>＝</Label>
    <rect x={13} y={150} width={136} height={34}/><Label x={81} y={172}>L − S → L</Label>
    <rect x={334} y={150} width={136} height={34}/><Label x={402} y={172}>S − L → S</Label>
    <rect x={173} y={248} width={136} height={54}/>
    <Label x={241} y={272}>A，B，L</Label><Label x={241} y={292}>の出力</Label>
    <rect x={173} y={327} width={136} height={27} rx={13}/>
    <Label x={241} y={346}>終了</Label>
  </Drawing>;
}
export const legacy2008SpringAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.scatter, component: ScatterPlot },
  { profile: profiles.logic, component: LogicExpression },
  { profile: profiles.gcd, component: GcdFlow },
];
