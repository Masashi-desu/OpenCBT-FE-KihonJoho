import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { addressCases, flowCases, gateNames, legacy2007AutumnAm0126Figures, profiles, trees, type FigureKind, type Tree } from '../core/generators/legacy-2007-autumn-am-01-26-figures';

type DrawingProps = BookletFigureProps & { kind: FigureKind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2007AutumnAm0126Figures.find(item => item.profile === profile)!.alt(values);
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
function TreeNode({ node, x, y, step }: { node: Tree; x: number; y: number; step: number }) {
  const mark = typeof node === 'string' ? node : node[0];
  return <g>
    {typeof node !== 'string' && <>
      <path d={`M${x - 9} ${y + 11}L${x - step + 9} ${y + 45}M${x + 9} ${y + 11}L${x + step - 9} ${y + 45}`}/>
      <TreeNode node={node[1]} x={x - step} y={y + 56} step={step / 1.7}/>
      <TreeNode node={node[2]} x={x + step} y={y + 56} step={step / 1.7}/>
    </>}
    <circle cx={x} cy={y} r={14}/><Label x={x} y={y + 5}>{mark}</Label>
  </g>;
}
function BinaryTree(props: BookletFigureProps) {
  return <Drawing {...props} kind="tree" width={340} height={224}>
    <TreeNode node={trees[props.values[0]]} x={170} y={25} step={64}/>
  </Drawing>;
}

function SearchFlow(props: BookletFigureProps) {
  const [, zero] = flowCases[props.values[0]];
  return <Drawing {...props} kind="flow" width={500} height={478}>
    <path d="M210 40V63M210 107V128M210 157V188M210 228V255M210 289V325M210 371V398M210 430V449"/>
    <path d="M142 208H66V398M278 208H353V255M353 289V307H211M279 348H465V116H210M66 430V439H210"/>
    <path d="M218 111L210 116L218 121M218 302L210 307L218 312M202 434L210 439L202 444"/>
    <rect x={142} y={13} width={136} height={27} rx={13}/><Label x={210} y={33}>開始</Label>
    <rect x={142} y={63} width={136} height={44}/>
    <Label x={210} y={81}>{zero ? '0 → lo' : '1 → lo'}</Label>
    <Label x={210} y={100}>{zero ? 'n−1 → hi' : 'n → hi'}</Label>
    <rect x={142} y={128} width={136} height={29}/><Label x={210} y={147}>(lo＋hi)／2 → k</Label>
    <path d="M142 208L210 188L278 208L210 228Z"/><Label x={210} y={214}>A(k)：x</Label>
    <Label x={133} y={200}>＝</Label><Label x={293} y={201}>＞</Label><Label x={225} y={245}>＜</Label>
    <rect x={142} y={255} width={136} height={34}/><rect x={298} y={255} width={110} height={34}/>
    <rect x={169} y={260} width={82} height={24} strokeWidth={2.5}/><rect x={312} y={260} width={82} height={24} strokeWidth={2.5}/>
    <Label x={210} y={278}>a</Label><Label x={353} y={278}>b</Label>
    <path d="M142 348L210 325L279 348L210 371Z"/><Label x={210} y={353}>lo：hi</Label>
    <Label x={291} y={341}>≦</Label><Label x={225} y={387}>＞</Label>
    <rect x={10} y={398} width={112} height={32}/><Label x={66} y={420}>xは存在する</Label>
    <rect x={142} y={398} width={136} height={32}/><Label x={210} y={420}>xは存在しない</Label>
    <rect x={142} y={449} width={136} height={27} rx={13}/><Label x={210} y={469}>終了</Label>
  </Drawing>;
}

type GateName = typeof gateNames[number] | 'NOT';
function Gate({ name, x, y }: { name: GateName; x: number; y: number }) {
  return <g data-gate={name} transform={`translate(${x} ${y})`}>
    {name === 'NOT' ? <>
      <path d="M0 0H10M10 -10V10L30 0ZM38 0H58"/><circle cx={34} cy={0} r={4}/>
    </> : <>
      <path d={name === 'AND' || name === 'NAND' ? 'M0 -7H10M0 7H10M10 -13H24Q45 -13 45 0Q45 13 24 13H10Z' :
        'M0 -7H13M0 7H13M10 -13Q30 -15 45 0Q30 15 10 13Q17 0 10 -13Z'}/>
      {name === 'NAND' || name === 'NOR' ? <><circle cx={49} cy={0} r={4}/><path d="M53 0H58"/></> : <path d="M45 0H58"/>}
    </>}
  </g>;
}
function Legend(props: BookletFigureProps) {
  const gates = [...gateNames, 'NOT'] as const;
  return <Drawing {...props} kind="legend" width={422} height={72}>
    {gates.map((name, i) => <g key={name}><Gate name={name} x={14 + 83 * i} y={24}/><Label x={43 + 83 * i} y={62}>{name}回路</Label></g>)}
  </Drawing>;
}
function Circuit(props: BookletFigureProps) {
  const gate = gateNames[props.values[0]];
  return <Drawing {...props} kind="gate" width={352} height={147}>
    <path d="M30 23H145M30 37H145M54 23V90H83M73 37V119H83M141 90V91H145M141 119V105H145M203 30H221V57H244M203 98H221V71H244M302 64H319"/>
    <circle cx={27} cy={23} r={3}/><circle cx={27} cy={37} r={3}/><circle cx={322} cy={64} r={3}/>
    <circle cx={54} cy={23} r={2.5} fill="currentColor"/><circle cx={73} cy={37} r={2.5} fill="currentColor"/>
    <Gate name="NOT" x={83} y={90}/><Gate name="NOT" x={83} y={119}/>
    <Gate name={gate} x={145} y={30}/><Gate name={gate} x={145} y={98}/><Gate name={gate} x={244} y={64}/>
    <Label x={14} y={28}>X</Label><Label x={14} y={42}>Y</Label><Label x={339} y={69}>Z</Label>
  </Drawing>;
}

function Address(props: BookletFigureProps) {
  const { register, constant, value, effective, plus, label } = addressCases[props.values[0]];
  const registerY = register === null ? 222 : 162 + register * 26;
  return <Drawing {...props} kind="address" width={552} height={294}>
    <Label x={82} y={23}>命令部</Label><Label x={185} y={23}>レジスタ番号</Label><Label x={295} y={23}>アドレス定数</Label>
    <Label x={24} y={52}>命令</Label>
    <path d="M46 31H348V65H46ZM128 31V65M243 31V65"/>
    <Label x={185} y={52}>{register ?? '―'}</Label><Label x={295} y={52}>{constant ?? '―'}</Label>
    {register !== null && <>
      <Label x={94} y={126}>{label}</Label>
      <path strokeDasharray="5 4" d={`M185 65V91H41V${registerY}H103`}/>
      <path d={`M95 ${registerY - 5}L103 ${registerY}L95 ${registerY + 5}`}/>
      <rect x={126} y={149} width={70} height={104}/>
      {[0, 1, 2, 3].map(slot => <g key={slot}>
        {slot > 0 && <line x1={126} x2={196} y1={149 + slot * 26} y2={149 + slot * 26}/>}
        <Label x={113} y={167 + slot * 26}>{slot}</Label>
      </g>)}
      <Label x={161} y={registerY + 5}>{value}</Label>
    </>}
    {register === null && value !== null && <>
      <Label x={131} y={195}>{label}</Label><rect x={84} y={209} width={112} height={26}/>
      <Label x={140} y={227}>{value}</Label>
    </>}
    {constant !== null && <path d={plus ? 'M295 65V199M289 193L295 199L301 193' : 'M295 65V212H380'}/>}
    {value !== null && <path d={`M196 ${registerY}H251V212H${plus ? 282 : 380}`}/>}
    {plus && <><circle cx={295} cy={212} r={13}/><Label x={295} y={217}>＋</Label><path d="M308 212H380"/></>}
    <path d="M372 207L380 212L372 217M380 148V32H492V150M380 183V278M492 183V278M380 57H492M380 82H492M380 107H492M380 132H492M380 198H492M380 227H492"/>
    <path d="M371 160Q406 130 436 155T501 161M371 171Q406 141 436 166T501 172"/>
    <Label x={436} y={24}>主記憶アドレス</Label>
    {[0, 1, 2, 3].map(slot => <Label key={slot} x={519} y={49 + slot * 25}>{slot}番地</Label>)}
    <Label x={436} y={217} size={14}>処理対象データ</Label>
    <Label x={520} y={217} size={14}>{effective}番地</Label><Label x={519} y={261}>⋮</Label>
  </Drawing>;
}

export const legacy2007AutumnAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.tree, component: BinaryTree },
  { profile: profiles.flow, component: SearchFlow },
  { profile: profiles.legend, component: Legend },
  { profile: profiles.gate, component: Circuit },
  { profile: profiles.address, component: Address },
];
