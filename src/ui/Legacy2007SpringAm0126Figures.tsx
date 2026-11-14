import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2007SpringAm0126Figures, profiles, treeFor, type FigureKind } from '../core/generators/legacy-2007-spring-am-01-26-figures';
import { matches, sequences, type Node } from '../core/generators/legacy-2007-spring-am-01-26-model';

type DrawingProps = BookletFigureProps & { kind: FigureKind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2007SpringAm0126Figures.find(item => item.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4}>{children}</g>
      </svg>
    </div>
  </figure>;
}
function Label({ x, y, children, size = 15 }: { x: number; y: number; children: ReactNode; size?: number }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor="middle" fontSize={size}>{children}</text>;
}
function Field({ x, y, w, h, children, rounded }: { x: number; y: number; w: number; h: number; children: string[]; rounded?: boolean }) {
  return <g><rect x={x} y={y} width={w} height={h} rx={rounded ? h / 2 : undefined}/>
    {children.map((label, i) => <Label key={i} x={x + w / 2} y={y + h / 2 + 5 + (i - (children.length - 1) / 2) * 17}>{label}</Label>)}
  </g>;
}
function Normal(props: BookletFigureProps) {
  const shade = useId();
  const u = 249, floor = 137;
  return <Drawing {...props} kind="normal" width={360} height={171}>
    <defs><pattern id={shade} width={5} height={5} patternUnits="userSpaceOnUse"><path d="M0 5L5 0" stroke="currentColor" strokeWidth={0.6}/></pattern></defs>
    <path d="M249 91C284 128 312 136 336 137H249Z" fill={`url(#${shade})`}/>
    <path d="M15 137H345M179 12V137M249 91V137M22 137C46 136 74 128 109 91C129 67 151 25 179 25C207 25 229 67 249 91C284 128 312 136 336 137"/>
    <path d="M304 77L269 115M269 105V115H278"/>
    <Label x={179} y={floor + 22}>0</Label><Label x={u} y={floor + 22}>u</Label><Label x={309} y={72}>P</Label>
  </Drawing>;
}
function NodeDrawing({ node, x, y, shift }: {node: Node; x: number; y: number; shift: number}) {
  const [value,left,right] = node;
  return <g>
    {left && <><path d={`M${x - 12} ${y + 9}L${x - shift + 10} ${y + 30}`}/><NodeDrawing node={left} x={x - shift} y={y + 43} shift={shift / 1.9}/></>}
    {right && <><path d={`M${x + 12} ${y + 9}L${x + shift - 10} ${y + 30}`}/><NodeDrawing node={right} x={x + shift} y={y + 43} shift={shift / 1.9}/></>}
    <circle cx={x} cy={y} r={15}/><Label x={x} y={y + 5}>{value}</Label>
  </g>;
}
function Tree(props: BookletFigureProps) {
  return <Drawing {...props} kind="tree" width={370} height={231}>
    <NodeDrawing node={treeFor(props.values[0])} x={185} y={24} shift={76}/>
  </Drawing>;
}
function Search(props: BookletFigureProps) {
  const [, needle, start] = matches[props.values[0]];
  return <Drawing {...props} kind="search" width={580} height={557}>
    <path d="M226 39V55M226 133V168M226 216V237M351 192H432V237M432 283V300H226M226 283V319M226 377V398M351 430H432V508H226M226 460V474M226 501V521M101 348H45V148H226"/>
    <path d="M219 143L226 148L219 153M233 295L226 300L233 305M233 503L226 508L233 513"/>
    <Field x={135} y={10} w={182} h={29} rounded>{['開始']}</Field>
    <Field x={135} y={55} w={182} h={78}>{[start + ' → i', start + ' → j', '0 → k', needle.length + ' → jmax']}</Field>
    <path d="M101 192L226 168L351 192L226 216Z M101 348L226 319L351 348L226 377Z M101 430L226 398L351 430L226 460Z"/>
    <Label x={226} y={197}>A[i]：B[j]</Label><Label x={238} y={230}>＝</Label><Label x={371} y={185}>≠</Label>
    <Field x={135} y={237} w={182} h={46}>{['i＋1 → i', 'j＋1 → j']}</Field>
    <Field x={342} y={237} w={180} h={46}>{['i−j＋' + (start + 1) + ' → i', start + ' → j']}</Field>
    <Label x={226} y={345}>A[i]＝“△”</Label><Label x={226} y={362}>or B[j]＝“△”</Label>
    <Label x={82} y={340}>No</Label><Label x={245} y={392}>Yes</Label>
    <Label x={226} y={435}>B[j]＝“△”</Label><Label x={373} y={424}>No</Label><Label x={248} y={471}>Yes</Label>
    <Field x={135} y={474} w={182} h={27}>{['i−jmax → k']}</Field>
    <Field x={135} y={521} w={182} h={27} rounded>{['終了']}</Field>
  </Drawing>;
}
function Gate(props: BookletFigureProps) {
  return <Drawing {...props} kind="gate" width={265} height={96}>
    <rect x={80} y={17} width={113} height={61}/><path d="M52 32H80M52 65H80M193 48H221"/>
    <Label x={38} y={37}>A</Label><Label x={38} y={70}>B</Label><Label x={236} y={53}>X</Label>
  </Drawing>;
}
function Cycles(props: BookletFigureProps) {
  const seq = [...sequences[props.values[0]].seq];
  return <Drawing {...props} kind="cycles" width={510} height={70}>
    {seq.map((value, i) => {
      const x = 32 + i * 87;
      return <g key={i}><circle cx={x} cy={32} r={25}/><Label x={x} y={37}>{value}</Label>
        {i < seq.length - 1 && <path d={`M${x+25} 32H${x+62}M${x+54} 28L${x+62} 32L${x+54} 36`}/>}</g>;
    })}
  </Drawing>;
}
export const legacy2007SpringAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.normal, component: Normal }, { profile: profiles.tree, component: Tree },
  { profile: profiles.search, component: Search }, { profile: profiles.gate, component: Gate },
  { profile: profiles.cycles, component: Cycles },
];
