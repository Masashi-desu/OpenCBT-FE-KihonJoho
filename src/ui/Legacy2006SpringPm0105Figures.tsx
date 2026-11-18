import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2006SpringPm0105Figures, profiles, type FigureKind } from '../core/generators/legacy-2006-spring-pm-01-05-figures';
import { customerColumns, salesColumns } from '../core/generators/legacy-2006-spring-pm-01-05-models';

type DrawingProps = BookletFigureProps & { kind: FigureKind; width: number; height: number; children: ReactNode };
function Drawing({ kind, width, height, caption, values, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2006SpringPm0105Figures.find(figure => figure.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure"><div tabIndex={0} className="diagram-scroll" aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
    <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
      viewBox={'0 0 '+width+' '+height}
      style={{ display: 'block', width: 'calc('+width+'px * var(--image-scale, 1))', height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
      <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4}>{children}</g>
    </svg>
  </div></figure>;
}

function Label({ x, y, children, start = false, size = 15 }: { x: number; y: number; children: ReactNode; start?: boolean; size?: number }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={start ? 'start' : 'middle'} fontSize={size}>{children}</text>;
}
function Box({ x, y, w, h = 32, children }: { x: number; y: number; w: number; h?: number; children?: ReactNode }) {
  return <g><rect x={x} y={y} width={w} height={h}/><Label x={x+w/2} y={y+h/2+5}>{children}</Label></g>;
}
function Arrow({ d }: { d: string }) {
  const id = useId();
  return <><defs><marker id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
    <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
  </marker></defs><path d={d} markerEnd={'url(#'+id+')'}/></>;
}

function OtpSystem(props: BookletFigureProps) {
  return <Drawing {...props} kind="otp-system" width={650} height={143}>
    <rect x={28} y={34} width={85} height={58}/><rect x={35} y={40} width={71} height={12}/>
    {Array.from({length: 21}, (_,index) => <rect key={index} x={37+Math.floor(index/3)*10} y={57+(index%3)*10} width={6} height={6}/>)}
    <circle cx={216} cy={42} r={10}/><path d="M195 91V68q0-13 21-13t21 13v23M204 91V70m24 21V70"/>
    <path d="M313 34h25q24 0 24 24t-24 24h-25zM361 82v10h-48v-5zM362 58H398M542 58H566"/>
    <ellipse cx={470} cy={58} rx={72} ry={20}/><Label x={470} y={63}>ネットワーク</Label>
    <Box x={566} y={34} w={68} h={58}>サーバ</Box>
    <Arrow d="M185 55H121"/><Arrow d="M121 72H185"/><Arrow d="M246 55H304"/><Arrow d="M304 72H246"/>
    <Label x={153} y={48}>入力</Label><Label x={153} y={89}>表示</Label>
    <Label x={275} y={48}>入力</Label><Label x={275} y={89}>表示</Label>
    <Label x={70} y={114}>使い捨てパスワード</Label><Label x={70} y={135}>生成装置</Label>
    <Label x={216} y={114}>利用者</Label><Label x={338} y={114}>クライアントPC</Label>
  </Drawing>;
}

function OtpFlow(props: BookletFigureProps) {
  const lanes = [92, 239, 420, 685];
  return <Drawing {...props} kind="otp-flow" width={745} height={323}>
    <Label x={92} y={18}>使い捨てパスワード</Label><Label x={92} y={37}>生成装置</Label>
    <Label x={239} y={18}>利用者</Label><Label x={420} y={18}>クライアントPC</Label><Label x={685} y={18}>サーバ</Label>
    <path d="M92 44V116m0 70V273M239 26V47m0 45V104m0 82V207m0 49V273M420 26V65m0 51V166m0 57V273M685 26V65m0 51V166m0 57V273"/>
    {[[0,116,70],[1,47,45],[1,104,82],[1,207,49],[2,65,51],[2,166,57],[3,65,51],[3,166,57]].map(([lane,y,h],i) =>
      <rect key={i} x={lanes[lane]-14} y={y} width={28} height={h}/>)}
    <Arrow d="M253 73H406"/><Label x={331} y={65}>ログイン操作</Label>
    <Arrow d="M434 78H671"/><Label x={554} y={70}>利用者ID</Label>
    <Arrow d="M671 103H434"/><Label x={554} y={123}>パスワード要求</Label>
    <Arrow d="M406 108H253"/><Label x={330} y={103}>表示</Label>
    <Arrow d="M225 137H106"/><Label x={165} y={130}>K</Label>
    <Arrow d="M106 155H225"/><Label x={165} y={175}>otp(n)</Label>
    <Arrow d="M253 179H406"/><Label x={330} y={171}>パスワード入力</Label>
    <Arrow d="M434 185H671"/><Label x={554} y={178}>otp(n)</Label>
    <Arrow d="M671 209H434"/><Label x={554} y={229}>ログイン可否メッセージ</Label>
    <Arrow d="M406 215H253"/><Label x={330} y={209}>表示</Label>
    <Label x={420} y={96}>①</Label><Label x={685} y={96}>②</Label><Label x={420} y={203}>③</Label><Label x={685} y={203}>④</Label>
    <Label x={372} y={302}>{props.caption}</Label>
  </Drawing>;
}

function Fields({ x, y, title, fields }: { x: number; y: number; title: string; fields: readonly string[] }) {
  const width = 88;
  return <g><Label x={x} y={y-10} start>{title}</Label>
    {fields.map((field,i) => <Box key={field} x={x+i*width} y={y} w={width}>{field}</Box>)}
  </g>;
}
function FileLayout(props: BookletFigureProps) {
  return <Drawing {...props} kind="file-layout" width={654} height={184}>
    <Fields x={16} y={33} title="売上伝票ファイル" fields={salesColumns}/>
    <Fields x={502} y={33} title="応募者ファイル" fields={['顧客番号']}/>
    <Fields x={16} y={114} title="顧客マスタファイル" fields={customerColumns}/>
    <Fields x={345} y={114} title="あて先ファイル" fields={customerColumns}/>
    <Label x={327} y={172}>{props.caption}</Label>
  </Drawing>;
}
function FileNode({ x, y, top, bottom }: { x: number; y: number; top: string; bottom: string }) {
  return <g><path d={'M'+(x+11)+' '+y+'h127q12 24 0 48h-127q-22-24 0-48m127 0q-12 24 0 48'}/>
    <Label x={x+75} y={y+20}>{top}</Label><Label x={x+75} y={y+38}>{bottom}</Label>
  </g>;
}
function FileFlow(props: BookletFigureProps) {
  return <Drawing {...props} kind="file-flow" width={522} height={431}>
    <FileNode x={20} y={11} top="売上伝票" bottom="ファイル"/>
    <path d="M95 59V92M95 139V172M95 220L233 263M260 220V263M424 220L288 263M260 311V348"/>
    <Box x={26} y={92} w={138} h={47}>前処理</Box>
    <FileNode x={20} y={172} top="中間" bottom="ファイル"/>
    <FileNode x={185} y={172} top="応募者" bottom="ファイル"/>
    <FileNode x={349} y={172} top="顧客マスタ" bottom="ファイル"/>
    <rect x={184} y={263} width={152} height={48}/>
    <Label x={260} y={283}>あて先ファイル</Label><Label x={260} y={302}>作成</Label>
    <FileNode x={185} y={348} top="あて先" bottom="ファイル"/>
    <Label x={261} y={421}>{props.caption}</Label>
  </Drawing>;
}
function ModuleTree(props: BookletFigureProps) {
  const ys = [111, 200, 287], xs = [42,201,360], labels = [
    ['初期処理','主処理','終了処理'], ['処理A','あて先処理','処理B'], ['あて先編集','処理C','処理D'],
  ];
  return <Drawing {...props} kind="module-tree" width={520} height={362}>
    <rect x={182} y={14} width={156} height={48}/><Label x={260} y={33}>あて先ファイル</Label><Label x={260} y={51}>作成</Label>
    <path d="M260 62L101 111M260 62V111m0-49L419 111M260 143L101 200m159-57v57m0-57l159 57M260 232L101 287m159-55v55m0-55l159 55"/>
    <Arrow d="M257 77a10 10 0 1 0 12 13"/>
    <path d="M260 143l32 12-32 12-32-12z"/>
    {labels.map((row,i)=>row.map((label,j)=><Box key={label} x={xs[j]} y={ys[i]} w={118}>{label}</Box>))}
    <Label x={260} y={350}>{props.caption}</Label>
  </Drawing>;
}

export const legacy2006SpringPm0105FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles['otp-system'], component: OtpSystem },
  { profile: profiles['otp-flow'], component: OtpFlow },
  { profile: profiles['file-layout'], component: FileLayout },
  { profile: profiles['file-flow'], component: FileFlow },
  { profile: profiles['module-tree'], component: ModuleTree },
];
