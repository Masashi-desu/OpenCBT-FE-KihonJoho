import { useId, type ReactNode } from 'react';
import { authenticationFlows, carryRows, legacy2009AutumnPm0104Figures, profiles } from '../core/generators/legacy-2009-autumn-pm-01-04-figures';
import { formatted, packets } from '../core/generators/legacy-2009-autumn-pm-01-04-models';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';

type Kind = keyof typeof profiles;
type DrawingProps = BookletFigureProps & { kind: Kind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId();
  const profile = profiles[kind];
  const alt = legacy2009AutumnPm0104Figures.find(item => item.profile === profile)!.alt(values);
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

function HalfAdder(props: BookletFigureProps) {
  return <Drawing {...props} kind="halfAdder" width={293} height={185}>
    <path d="M45 29H165M45 73H165M90 73V153H165M116 29V67Q129 73 116 79V118H165M238 51H260M238 135H260"/>
    <circle cx={116} cy={29} r={2.4} fill="currentColor"/><circle cx={90} cy={73} r={2.4} fill="currentColor"/>
    <rect x={165} y={16} width={73} height={69}/><rect x={172} y={38} width={59} height={26}/>
    <rect x={165} y={101} width={73} height={68}/>
    <Label x={34} y={34}>X</Label><Label x={34} y={78}>Y</Label>
    <Label x={202} y={57}>a</Label><Label x={202} y={140}>AND</Label>
    <Label x={270} y={56}>Z</Label><Label x={270} y={140}>C</Label>
  </Drawing>;
}

function FullAdder(props: BookletFigureProps) {
  return <Drawing {...props} kind="fullAdder" width={536} height={166}>
    <path d="M42 91H78M42 132H78M42 36H236M172 91H236M330 32H495M330 91H395M172 132H395M477 112H495"/>
    <rect x={78} y={77} width={94} height={70}/><rect x={236} y={17} width={94} height={88}/>
    <rect x={395} y={77} width={82} height={70}/><rect x={402} y={98} width={68} height={27}/>
    <Label x={24} y={40}>Cᵢₙ</Label><Label x={25} y={95}>X</Label><Label x={25} y={137}>Y</Label>
    <Label x={125} y={117}>半加算器1</Label><Label x={283} y={66}>半加算器2</Label>
    <Label x={365} y={85}>C₂</Label><Label x={283} y={126}>C₁</Label>
    <Label x={436} y={117}>b</Label><Label x={508} y={37}>Z</Label><Label x={508} y={117}>C</Label>
  </Drawing>;
}

function CarryTable(props: BookletFigureProps) {
  const rows = carryRows(props.values[0]);
  const columns = ['Cᵢₙ', 'X', 'Y', 'C₁', 'C₂'];
  return <Drawing {...props} kind="carryTable" width={305} height={278}>
    <rect x={15} y={9} width={275} height={252}/>
    {[1, 2, 4].map(i => <path key={i} d={'M' + (15 + 55 * i) + ' 9V37'}/>)}
    <path d="M178 9V261M181 9V261"/>
    {columns.map((label, i) => <Label key={label} x={42.5 + 55 * i} y={28}>{label}</Label>)}
    {rows.map((row, index) => {
      const y = 37 + index * 28, blank = row.length === 4;
      return <g key={index} data-carry-row={row.join(',')}>
        <path d={'M15 ' + y + 'H290M70 ' + y + 'v28M125 ' + y + 'v28'}/>
        {!blank && <path d={'M235 ' + y + 'v28'}/>}
        {blank && <rect x={201} y={y + 3} width={67} height={22}/>}
        {row.map((value, i) => <Label key={i} x={blank && i === 3 ? 235 : 42.5 + 55 * i} y={y + 19}>{blank && i === 3 ? 'c' : value}</Label>)}
      </g>;
    })}
  </Drawing>;
}

function Ripple(props: BookletFigureProps) {
  return <Drawing {...props} kind="rippleAdder" width={692} height={115}>
    {[0, 1, 2, 3].map(index => {
      const x = 39 + 162 * index, suffix = '₁₂₃₄'[index];
      return <g key={index}>
        <rect x={x} y={14} width={94} height={79}/>
        <path d={`M${x - 10} 26H${x}M${x - 10} ${index === 0 ? 81 : 50}H${x}M${x + 94} 26h11M${x + 94} 81h${index < 3 ? 68 : 11}`}/>
        <Label x={x - 17} y={31} align="end">{'A' + suffix}</Label>
        <Label x={x - 17} y={index === 0 ? 86 : 55} align="end">{'B' + suffix}</Label>
        <Label x={x + 108} y={31} align="start">{'S' + suffix}</Label>
        <Label x={x + (index < 3 ? 128 : 115)} y={index < 3 ? 74 : 86}>{'C' + suffix}</Label>
        <Label x={x + 47} y={58}>{index === 0 ? '半加算器' : '全加算器'}</Label>
      </g>;
    })}
  </Drawing>;
}

function Warehouse(props: BookletFigureProps) {
  return <Drawing {...props} kind="warehouse" width={715} height={258}>
    <rect x={55} y={32} width={214} height={186}/>
    <path d="M55 32L89 11H306L269 32M306 11V195L269 218M55 94H269L306 71M55 156H269L306 133"/>
    {['3階', '2階', '1階'].map((floor, i) => <Label key={floor} x={45} y={65 + 62 * i} align="end">{floor}</Label>)}
    {[0, 1, 2, 3].map(i => <g key={i}>
      <rect x={62 + 50 * i} y={105} width={42} height={41}/>
      {[0, 1, 2].map(shelf => <path key={shelf} d={`M${68 + 50 * i} ${114 + 9 * shelf}h30v6h-30Z`}/>)}
    </g>)}
    <path strokeDasharray="5 3" d="M262 103L438 38M262 149L438 204"/>
    <rect x={438} y={26} width={212} height={202}/>
    <path d="M438 26L465 10H674L650 26M674 10V205L650 228"/>
    <Label x={634} y={47} align="end">棚番号095</Label>
    {[0, 1, 2, 3].map(row => [0, 1, 2, 3].map(column => {
      const x = 445 + 49 * column, y = 56 + 41 * row;
      return <g key={row + '-' + column}>
        <rect x={x} y={y} width={44} height={36}/>
        {row === 2 && <Label x={x + 22} y={y + 24}>{'3-' + (column + 1)}</Label>}
      </g>;
    }))}
    <path d="M680 125h16l9 9v27h-25ZM696 125v9h9M680 154h-50v12m-6-5 6 5 6-5"/>
    <Label x={635} y={247}>書類を箱に入れる</Label>
  </Drawing>;
}

function EntityRelationship(props: BookletFigureProps) {
  const nodes = [
    ['階数', 12, 13], ['区画', 12, 77], ['棚', 143, 77], ['箱', 274, 77],
    ['書類預託', 405, 77], ['部署', 274, 13], ['書類', 405, 13],
  ] as const;
  return <Drawing {...props} kind="er" width={517} height={128}>
    <path d="M61 51V77m-4-6 4 6 4-6M454 51V77m-4-6 4 6 4-6
      M110 96H143m-6-4 6 4-6 4M241 96H274m-6-4 6 4-6 4M372 96H405m-6-4 6 4-6 4
      M372 32H405m-6-4 6 4-6 4"/>
    {nodes.map(([name, x, y]) => <g key={name}>
      <rect x={x} y={y} width={98} height={38}/><Label x={x + 49} y={y + 24}>{name}</Label>
    </g>)}
  </Drawing>;
}

function Packet(props: BookletFigureProps) {
  const { header, max } = packets[props.values[0]];
  return <Drawing {...props} kind="packet" width={461} height={114}>
    <path d="M11 13H450V64H11ZM161 13V64M11 72Q11 80 19 80H223Q230 80 230 87Q230 80 237 80H442Q450 80 450 72"/>
    <Label x={86} y={35}>ヘッダ</Label><Label x={86} y={55}>{'（' + header + 'バイト）'}</Label>
    <Label x={306} y={35}>測定値の列</Label><Label x={306} y={55}>（4バイト×設定した個数）</Label>
    <Label x={230} y={105}>{'最大' + formatted(max) + 'バイト'}</Label>
  </Drawing>;
}

function Authentication(props: BookletFigureProps) {
  const { input, steps, notes, client } = authenticationFlows[props.values[0]];
  const left = 278, right = 508, first = 38, gap = 46;
  const height = first + gap * steps.length + 11;
  const annotations: Partial<Record<number, string[]>> = notes;
  return <Drawing {...props} kind="authentication" width={822} height={height}>
    <path d={`M${left} 24V${height - 11}M${right} 24V${height - 11}`}/>
    <Label x={left} y={17}>端末</Label><Label x={right} y={17}>サーバ</Label>
    {input.map((line, i) => <Label key={line} x={left - 8} y={first + i * 17} align="end">{line}</Label>)}
    {steps.map((message, i) => {
      const y = first + gap * i, outbound = i % 2 === 0;
      const from = outbound ? left : right, to = outbound ? right : left;
      return <g key={message}>
        <path d={`M${from} ${y}L${to} ${y + 17}m${outbound ? -8 : 8}-7l${outbound ? 8 : -8} 7l${outbound ? -9 : 9} 3`}/>
        <Label x={(left + right) / 2} y={y + 3}>{message}</Label>
        {annotations[i]?.map((line, row) => <Label key={line} x={right + 10} y={y + 14 + row * 17} align="start">{line}</Label>)}
      </g>;
    })}
    {client?.map((line, i) => <Label key={line} x={left - 8} y={first + gap + 17 + 17 * i} align="end">{line}</Label>)}
  </Drawing>;
}

function Token(props: BookletFigureProps) {
  return <Drawing {...props} kind="token" width={585} height={83}>
    <rect x={13} y={18} width={183} height={47} rx={23}/>
    <rect x={34} y={26} width={103} height={31}/>
    <rect x={149} y={31} width={31} height={22} rx={11}/>
    <path d="M222 42H165m7-5-7 5 7 5"/>
    <Label x={85.5} y={47}>13571113</Label>
    <Label x={231} y={47} align="start">このボタンを押すとパスワードが表示される。</Label>
  </Drawing>;
}

export const legacy2009AutumnPm0104FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.halfAdder, component: HalfAdder }, { profile: profiles.fullAdder, component: FullAdder },
  { profile: profiles.carryTable, component: CarryTable }, { profile: profiles.rippleAdder, component: Ripple },
  { profile: profiles.warehouse, component: Warehouse }, { profile: profiles.er, component: EntityRelationship },
  { profile: profiles.packet, component: Packet }, { profile: profiles.authentication, component: Authentication },
  { profile: profiles.token, component: Token },
];
