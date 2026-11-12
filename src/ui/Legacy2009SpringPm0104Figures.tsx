import { useId, type ReactNode } from 'react';
import { erOptions, legacy2009SpringPm0104Figures, pixelRows, profiles } from '../core/generators/legacy-2009-spring-pm-01-04-figures';
import { imageCases, imageRows } from '../core/generators/legacy-2009-spring-pm-01-04-models';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

type Kind = keyof typeof profiles;
type DrawingProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId();
  const profile = profiles[kind];
  const alt = legacy2009SpringPm0104Figures.find(item => item.profile === profile)!.alt(values);
  const renderedWidth = 'calc(' + width + 'px * var(--image-scale, 1))';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: renderedWidth, height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4} fontSize={15}>{children}</g>
      </svg>
    </div>
    <figcaption style={{ width: 'min(100%, ' + renderedWidth + ')' }}>{caption}</figcaption>
  </figure>;
}

function Label({ x, y, children, align = 'middle' }: {
  x: number; y: number; children: ReactNode; align?: 'start' | 'middle' | 'end';
}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={align}>{children}</text>;
}

function PixelPicture(props: BookletFigureProps) {
  const rows = pixelRows(props.values[0]);
  return <Drawing {...props} kind="pixelPicture" width={191} height={23 * rows.length + 10}>
    {rows.map((row, y) => <g key={y} data-pixel-row={row}>
      {[...row].map((bit, x) => <circle key={x} cx={15 + x * 23} cy={17 + y * 23} r={8.4}
        fill={bit === '1' ? 'currentColor' : 'none'}/>)}
    </g>)}
  </Drawing>;
}

function BitGrid(props: BookletFigureProps) {
  const rows = imageRows(imageCases[props.values[0]].example);
  return <Drawing {...props} kind="bitGrid" width={211} height={200}>
    <rect x={9} y={7} width={192} height={184}/>
    {rows.map((row, y) => <g key={y} data-bit-row={row}>
      {y > 0 && <path d={`M9 ${7 + y * 23}H201`}/>}
      {[...row].map((bit, x) => <Label key={x} x={21 + x * 24} y={24 + y * 23}>{bit}</Label>)}
    </g>)}
  </Drawing>;
}

function CodeFormat(props: BookletFigureProps) {
  const fields = [
    { from: 13, to: 153, label: '（a）けた数情報', length: '（m−2）ビット' },
    { from: 153, to: 245, label: '（b）区切り', length: '1ビット' },
    { from: 245, to: 433, label: '（c）ランレングス情報', length: 'mビット' },
  ];
  return <Drawing {...props} kind="codeFormat" width={447} height={99}>
    <path d="M13 49H433V87H13ZM153 49V87M245 49V87"/>
    {fields.map(({ from, to, label, length }) => <g key={label}>
      <path d={`M${from} 18V46M${to} 18V46M${from} 34H${to}m-6-4 6 4-6 4M${from + 6} 30l-6 4 6 4`}/>
      <Label x={(from + to) / 2} y={18}>{length}</Label><Label x={(from + to) / 2} y={74}>{label}</Label>
    </g>)}
  </Drawing>;
}

function RecipeEr(props: BookletFigureProps) {
  const { from, to, relation, cardinality } = erOptions[props.values[0]];
  return <Drawing {...props} kind="recipeEr" width={374} height={79}>
    <rect x={13} y={24} width={115} height={37}/><rect x={246} y={24} width={115} height={37}/>
    <path d="M128 43H246"/>{cardinality === '多対多' && <path d="M137 38L128 43L137 48M237 38L246 43L237 48"/>}
    <Label x={70} y={48}>{from}</Label><Label x={303} y={48}>{to}</Label><Label x={187} y={35}>{'（' + relation + '）'}</Label>
  </Drawing>;
}

function Network(props: BookletFigureProps) {
  const equipment = [
    { x: 108, y: 53, width: 90, label: ['ルータ'] },
    { x: 108, y: 104, width: 182, label: ['ファイアウォールA'] },
    { x: 294, y: 104, width: 127, label: ['Webサーバ'] },
    { x: 441, y: 104, width: 128, label: ['メールサーバ'] },
    { x: 199, y: 187, width: 183, label: ['ファイアウォールB'] },
    { x: 294, y: 269, width: 128, label: ['データベース', 'サーバ'] },
    { x: 441, y: 269, width: 128, label: ['管理用PC'] },
  ];
  return <Drawing {...props} kind="network" width={595} height={327}>
    <ellipse cx={108} cy={22} rx={96} ry={19}/><Label x={108} y={27}>インターネット</Label>
    <path d="M108 41V53M108 89V104M108 140V160M294 140V160M441 140V160
      M15 160H512M199 160V187M199 223V247M115 247H512M294 247V269M441 247V269"/>
    <path d="M15 160H512M115 247H512" strokeWidth={2.6}/>
    {[15, 108, 199, 294, 441, 512].map(x => <rect key={x} x={x - 4} y={156} width={8} height={8} fill="currentColor"/>)}
    {[115, 199, 294, 441, 512].map(x => <rect key={x} x={x - 4} y={243} width={8} height={8} fill="currentColor"/>)}
    <Label x={543} y={166}>DMZ</Label><Label x={550} y={252}>社内LAN</Label>
    {equipment.map(({ x, y, width, label }) => <g key={label[0]}>
      <rect x={x - width / 2} y={y} width={width} height={label.length === 1 ? 36 : 51}/>
      {label.map((line, i) => <Label key={line} x={x} y={y + 23 + i * 18}>{line}</Label>)}
    </g>)}
  </Drawing>;
}

export const legacy2009SpringPm0104FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.pixelPicture, component: PixelPicture }, { profile: profiles.bitGrid, component: BitGrid },
  { profile: profiles.codeFormat, component: CodeFormat }, { profile: profiles.recipeEr, component: RecipeEr },
  { profile: profiles.network, component: Network },
];
