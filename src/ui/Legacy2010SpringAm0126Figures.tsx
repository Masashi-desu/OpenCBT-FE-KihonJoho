import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { gateDiagram, ledOptions, ledSegments, legacy2010SpringAm0126Figures, profiles, tierDiagram, type FigureKind } from '../core/generators/legacy-2010-spring-am-01-26-figures';

type DrawingProps = BookletFigureProps & { kind: FigureKind; width: number; height: number; children: ReactNode };
function Drawing({ kind, caption, values, width, height, children }: DrawingProps) {
  const id = useId(), profile = profiles[kind];
  const alt = legacy2010SpringAm0126Figures.find(item => item.profile === profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', height: 'auto', maxWidth: 'none', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4} fontSize={15}>{children}</g>
      </svg>
    </div>
    {kind === 'cache' && <figcaption style={{ width: 'min(100%, calc(' + width + 'px * var(--image-scale, 1)))' }}>{caption}</figcaption>}
  </figure>;
}
function Label({ x, y, children, align = 'middle' }: { x: number; y: number; children: ReactNode; align?: 'start' | 'middle' | 'end' }) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={align}>{children}</text>;
}

function Cache(props: BookletFigureProps) {
  return <Drawing {...props} kind="cache" width={350} height={165}>
    <rect x={15} y={15} width={142} height={133}/>
    <Label x={31} y={38} align="start">CPU</Label>
    <rect x={31} y={47} width={126} height={76}/>
    <Label x={94} y={67}>キャッシュ</Label><Label x={94} y={88}>メモリ</Label>
    <Label x={94} y={110}>256kバイト</Label>
    <path d="M157 79H190"/>
    <rect x={190} y={15} width={142} height={133}/>
    <Label x={261} y={67}>主記憶</Label><Label x={261} y={104}>256Mバイト</Label>
  </Drawing>;
}

function Device({ x, y, name, where = 'top' }: { x: number; y: number; name: string; where?: 'top' | 'side' | 'bottom' }) {
  return <g data-server-role={name}>
    <rect x={x - 22} y={y - 12} width={44} height={24}/>
    <Label x={where === 'side' ? x + 30 : x} y={where === 'side' ? y + 6 : y + (where === 'bottom' ? 33 : -21)}
      align={where === 'side' ? 'start' : 'middle'}>{name}</Label>
  </g>;
}
function Tiers(props: BookletFigureProps) {
  const { layout, upper, other } = tierDiagram(props.values[0]);
  return <Drawing {...props} kind="tiers" width={380} height={238}>
    <g data-layout={layout}>
      {layout === 'bus' ? <>
        <path d="M50 93H320M135 62V93M256 62V93M94 93V122"/>
        <Device x={135} y={50} name={upper}/><Device x={256} y={50} name={other}/>
        <Device x={94} y={134} name="クライアント" where="bottom"/>
      </> : <>
        {layout === 'separated' && <path d="M57 77H260M81 53V77M152 77V106M152 130V159M108 159H320M212 159V188"/>}
        {layout === 'direct-db' && <path d="M81 53V68H152V106M152 130V159M108 159H320M212 159V188"/>}
        {layout === 'direct-client' && <path d="M57 77H260M81 53V77M152 77V106M152 130V163H212V188"/>}
        <Device x={81} y={41} name={upper}/><Device x={152} y={118} name={other} where="side"/>
        <Device x={212} y={200} name="クライアント" where="bottom"/>
        {layout === 'direct-db' && <Label x={192} y={93} align="start">専用の線</Label>}
        {layout === 'direct-client' && <Label x={231} y={173} align="start">専用の線</Label>}
      </>}
    </g>
  </Drawing>;
}

function Unit({ x, y }: { x: number; y: number }) {
  return <rect data-device="true" x={x} y={y - 15} width={55} height={30}/>;
}
function Availability(props: BookletFigureProps) {
  const [index] = props.values;
  return <Drawing {...props} kind="availability" width={320} height={145}>
    {index === 0 && <><path d="M28 73H62M117 73H145M200 73H238"/><Unit x={62} y={73}/><Unit x={145} y={73}/></>}
    {index === 1 && <>
      <path d="M28 73H55M55 45V101M55 45H82M55 101H82M137 45H165V101H137M165 73H196"/>
      <Unit x={82} y={45}/><Unit x={82} y={101}/>
    </>}
    {index === 2 && <>
      <path d="M18 73H45M45 45V101M45 45H72M45 101H72M127 45H151M127 101H151M206 45H233V101H206M233 73H261"/>
      {[45, 101].flatMap(y => [72, 151].map(x => <Unit key={x + ':' + y} x={x} y={y}/>))}
    </>}
    {index === 3 && <>
      <path d="M10 73H29M125 73H173M269 73H295"/>
      {[29, 173].map(x => <g key={x}>
        <path d={'M' + x + ' 45V101M' + x + ' 45h20M' + x + ' 101h20M' + (x + 75) + ' 45h21v56h-21'}/>
        <Unit x={x + 20} y={45}/><Unit x={x + 20} y={101}/>
      </g>)}
    </>}
  </Drawing>;
}

const outlines = [
  '20,8 60,8 68,15 60,22 20,22 12,15', '62,25 69,18 76,25 76,59 69,66 62,59',
  '62,75 69,68 76,75 76,109 69,116 62,109', '20,112 60,112 68,119 60,126 20,126 12,119',
  '4,75 11,68 18,75 18,109 11,116 4,109', '4,25 11,18 18,25 18,59 11,66 4,59',
  '20,60 60,60 68,67 60,74 20,74 12,67',
];
function SegmentDisplay({ x, y, mask, annotated = false }: { x: number; y: number; mask: number; annotated?: boolean }) {
  const lit = (i: number) => Boolean(mask & 1 << i);
  const fill = (i: number) => lit(i) ? 'currentColor' : 'var(--diagram-surface)';
  return <g transform={'translate(' + x + ' ' + y + ')'}>
    {outlines.map((points, i) => <polygon key={i} data-segment={ledSegments[i]} data-on={lit(i)} points={points} fill={fill(i)}/>)}
    <circle cx={88} cy={120} r={7} data-segment="Dt" data-on={lit(7)} fill={fill(7)}/>
    {annotated && <>
      <Label x={40} y={2}>a</Label><Label x={94} y={45}>b</Label><Label x={53} y={94}>c</Label>
      <Label x={40} y={148}>d</Label><Label x={-8} y={94}>e</Label><Label x={-8} y={45}>f</Label>
      <Label x={41} y={56}>g</Label><Label x={103} y={125} align="start">Dt</Label>
    </>}
  </g>;
}
function LedWiring(props: BookletFigureProps) {
  return <Drawing {...props} kind="ledWiring" width={695} height={315}>
    <rect x={20} y={26} width={110} height={221}/><Label x={75} y={51}>出力ポート</Label>
    <rect x={280} y={26} width={156} height={221}/>
    {ledSegments.map((segment, i) => { const y = 52 + i * 25; return <g key={segment} data-port={i} data-terminal={segment}>
      <path d={'M130 ' + y + 'h43l5 -9l8 18l8 -18l8 18l8 -18l8 18l5 -9H280'}/>
      <Label x={150} y={y - 5}>{'P' + i}</Label><Label x={290} y={y + 5} align="start">{segment}</Label>
    </g>; })}
    <SegmentDisplay x={322} y={74} mask={0}/>
    <path d="M358 247V267M340 267H376M347 267l-7 14M358 267l-7 14M369 267l-7 14"/>
    <SegmentDisplay x={505} y={68} mask={0} annotated/>
    <Label x={529} y={244}>凡例</Label>
    <polygon points="500,257 530,257 536,263 530,269 500,269 494,263" fill="var(--diagram-surface)"/>
    <circle cx={555} cy={263} r={6}/><Label x={573} y={268} align="start">消灯</Label>
    <polygon points="500,282 530,282 536,288 530,294 500,294 494,288" fill="currentColor"/>
    <circle cx={555} cy={288} r={6} fill="currentColor"/><Label x={573} y={294} align="start">点灯</Label>
  </Drawing>;
}
function LedState(props: BookletFigureProps) {
  return <Drawing {...props} kind="ledState" width={132} height={154}><SegmentDisplay x={16} y={10} mask={ledOptions[props.values[0]]}/></Drawing>;
}

function Gate({ x, y, kind }: { x: number; y: number; kind: number }) {
  const curve = kind % 2 === 0 ? 'M0 -19H24A19 19 0 0 1 24 19H0Z' : 'M0 -19H13Q31 -19 43 0Q31 19 13 19H0Q8 0 0 -19Z';
  return <g transform={'translate(' + x + ' ' + y + ')'} data-gate={kind}>
    <path d={curve} fill="var(--diagram-surface)"/>
    {kind >= 2 && <circle cx={47} cy={0} r={4} fill="var(--diagram-surface)"/>}
  </g>;
}
function Logic(props: BookletFigureProps) {
  const [upper, lower, last] = gateDiagram(props.values[0]);
  const not = (y: number) => <g data-inverter="true">
    <path d={'M113 ' + (y - 11) + 'L137 ' + y + 'L113 ' + (y + 11) + 'Z'} fill="var(--diagram-surface)"/>
    <circle cx={141} cy={y} r={4} fill="var(--diagram-surface)"/>
  </g>;
  return <Drawing {...props} kind="logic" width={405} height={175}>
    <Label x={11} y={37} align="start">X</Label><Label x={11} y={65} align="start">Y</Label>
    <path d="M30 32H193M30 59H193M55 32V103H113M83 59V142H113M145 103H167V116H193M145 142H193"/>
    <circle cx={55} cy={32} r={3} fill="currentColor"/><circle cx={83} cy={59} r={3} fill="currentColor"/>
    {not(103)}{not(142)}
    <path d={'M' + (upper >= 2 ? 241 : 233) + ' 46H271V74H300M' + (lower >= 2 ? 241 : 233) + ' 129H271V100H300'}/>
    <path d={'M' + (last >= 2 ? 349 : 341) + ' 87H371'}/>
    <Gate x={190} y={46} kind={upper}/><Gate x={190} y={129} kind={lower}/><Gate x={298} y={87} kind={last}/>
    <Label x={382} y={92} align="start">Z</Label>
  </Drawing>;
}

export const legacy2010SpringAm0126FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.cache, component: Cache }, { profile: profiles.tiers, component: Tiers },
  { profile: profiles.availability, component: Availability }, { profile: profiles.ledWiring, component: LedWiring },
  { profile: profiles.ledState, component: LedState }, { profile: profiles.logic, component: Logic },
];
