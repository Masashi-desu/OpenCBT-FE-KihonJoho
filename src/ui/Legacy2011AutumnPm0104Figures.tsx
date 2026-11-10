import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { codesAlt, excerptRows, ipsAlt, networkAlt, organizationAlt, profiles, relationsAlt, risksAlt, waveAlt }
  from '../core/generators/legacy-2011-autumn-pm-01-04-figures';
import { adcModel, networkModel, organizationCases, organizationRelations, riskClasses, riskModel, riskNames, vulnerabilities }
  from '../core/generators/legacy-2011-autumn-pm-01-04-models';

type DiagramFrame = { caption: string; alt: string; profile: string };
const horizontalLabel = (caption: string) => caption + '。幅が足りない場合は左右にスクロールできます。';

function Drawing({ caption, alt, profile, width, height, children }: DiagramFrame & {
  width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId(), arrowId = id + '-arrow';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={horizontalLabel(caption)}>
      <svg data-source-figure={profile} viewBox={'0 0 ' + width + ' ' + height} role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none',
          height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <defs><marker id={arrowId} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth={1.25}/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} fontSize={15}>{children('url(#' + arrowId + ')')}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Label({ x, y, align = 'middle', children }: { x: number; y: number; align?: 'start' | 'end' | 'middle'; children: ReactNode }) {
  return <text x={x} y={y} textAnchor={align} fill="currentColor" stroke="none">{children}</text>;
}

function Rect({ x, y, width, height, children }: { x: number; y: number; width: number; height: number; children: ReactNode }) {
  return <g><rect x={x} y={y} width={width} height={height}/><Label x={x + width / 2} y={y + height / 2 + 5}>{children}</Label></g>;
}

const sampleLabelOffsets = [[-7,-11], [0,-14], [9,4], [0,22], [8,8], [0,-12], [8,6], [8,8], [-7,2], [8,6], [8,3]];
function WavePanel({ values, arrow, scale = false, first = false }: {
  values: ReturnType<typeof adcModel>; arrow: string; scale?: boolean; first?: boolean;
}) {
  const x = (i: number) => 55 + 29 * i;
  const y = (level: number) => 270 - 29 * level;
  const curve = values.samples.map((value, i) => {
    if (!i) return 'M' + x(i) + ' ' + y(value / 10);
    const mid = (x(i - 1) + x(i)) / 2;
    return 'C' + mid + ' ' + y(values.samples[i - 1] / 10) + ' ' + mid + ' ' + y(value / 10) + ' ' + x(i) + ' ' + y(value / 10);
  }).join(' ');
  return <g data-wave-panel={scale ? 'quantized' : 'samples'}>
    <path d="M55 270V24" markerEnd={arrow}/><path d="M55 270H376" markerEnd={arrow}/>
    <Label x={55} y={17}>{first ? '電圧(v)' : 'v'}</Label>
    <Label x={382} y={275} align="start">{first ? '時間(t)' : 't'}</Label>
    <path d="M55 303V326m29-23v23M55 314H84m-29 0 7-5m-7 5 7 5m22-5-7-5m7 5-7 5"/>
    <Label x={70} y={335}>d</Label>
    {scale ? <>
      {Array.from({ length: 8 }, (_, i) => <g key={i} data-voltage-level={i}>
        <path d={'M55 ' + y(i) + 'H351'}/><Label x={49} y={y(i) + 5} align="end">v{i}</Label>
      </g>)}
      <path d="M55 36H351"/><Label x={47} y={40} align="end">vmax</Label>
      <path d="M43 52q8 5 15 0t15 0M43 57q8 5 15 0t15 0" data-axis-break="true"/>
      <path d="M21 270V241m-4 0h8m-8 29h8m-4 0-3-5m3 5 3-5m-3-24-3 5m3-5 3 5" data-quantization-step="true"/>
      <Label x={8} y={259}>q</Label>
    </> : <Label x={40} y={277}>0</Label>}
    <path d={curve} data-analog-wave="true" strokeWidth={2}/>
    {values.samples.map((sample, i) => {
      const level = values.levels[i], at = y(sample / 10), [dx, dy] = sampleLabelOffsets[i];
      return <g key={i} data-sample={i} data-tenths={sample}>
        <path d={'M' + x(i) + ' 270v-8'}/><Label x={x(i)} y={290}>t{i}</Label>
        <path d={'M' + (x(i) - 4) + ' ' + (at - 4) + 'l8 8m-8 0 8-8'}/>
        {!scale && <Label x={x(i) + dx} y={at + dy} align={dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle'}>v(t{i})</Label>}
        {scale && <circle data-quantized-level={level} cx={x(i)} cy={y(level)} r={4} fill="var(--diagram-surface)"/>}
      </g>;
    })}
  </g>;
}

function Wave({ caption, values }: BookletFigureProps) {
  const [index, quantization] = values, data = adcModel(index);
  return <Drawing profile={profiles.wave} caption={caption} alt={waveAlt(values)} width={quantization ? 850 : 450} height={342}>
    {arrow => <>
      <WavePanel values={data} arrow={arrow} first={!quantization}/>
      {quantization === 1 && <>
        <path d="M402 167h38" markerEnd={arrow}/>
        <g transform="translate(446 0)"><WavePanel values={data} arrow={arrow} scale/></g>
      </>}
    </>}
  </Drawing>;
}

function TableFigure({ caption, alt, profile, children, top = false }: DiagramFrame & { children: ReactNode; top?: boolean }) {
  return <figure className="managed-diagram source-figure" data-source-figure={profile} role="group" aria-label={caption} aria-description={alt}>
    {top && <figcaption>{caption}</figcaption>}
    <div className="table-scroll" tabIndex={0} aria-label={horizontalLabel(caption)}>{children}</div>
    {!top && <figcaption>{caption}</figcaption>}
  </figure>;
}
const tableStyle = { width: 'max-content', fontSize: 'calc(15px * var(--image-scale, 1))' } as const;

function AdcCodes({ caption, values }: BookletFigureProps) {
  const { codeRow } = adcModel(values[0]);
  return <TableFigure profile={profiles.adcCodes} caption={caption} alt={codesAlt(values)} top>
    <table aria-label={caption} style={tableStyle}>
      <thead><tr><th scope="col">時刻</th>{codeRow.map((_, i) => <th key={i} scope="col">t{i}</th>)}</tr></thead>
      <tbody><tr><th scope="row">符号</th>{codeRow.map((value, i) =>
        <td key={i} data-code-time={i} className={value ? undefined : 'omitted-cell'} aria-label={value ? undefined : '網掛け'}>{value}</td>)}</tr></tbody>
    </table>
  </TableFigure>;
}

function Organization({ caption, values }: BookletFigureProps) {
  const [index, expanded] = values, { company, departments, sections } = organizationCases[index];
  return <Drawing profile={profiles.organization} caption={caption} alt={organizationAlt(values)} width={805} height={expanded ? 197 : 130}>
    {() => <>
      <Rect x={347} y={10} width={110} height={32}>{company}</Rect>
      <path d="M402 42v34M135 76V60H670v16"/>
      {departments.map((department, i) => {
        const center = [135, 402, 670][i];
        return <g key={department} data-department={department}>
          <Rect x={center - 56} y={76} width={112} height={34}>{department}</Rect>
          {expanded === 1 && <>
            <path d={'M' + center + ' 110v20m-64 20v-20h128v20'}/>
            {sections[i].map((section, j) => <g key={section} data-section={section}>
              <Rect x={center + (j ? 64 : -64) - 54} y={150} width={108} height={34}>{section}</Rect>
            </g>)}
          </>}
        </g>;
      })}
    </>}
  </Drawing>;
}

function Relations({ caption, values }: BookletFigureProps) {
  const [index, group] = values;
  return <TableFigure profile={profiles.relations} caption={caption} alt={relationsAlt(values)}>
    {organizationRelations(index, group).map(item => <table key={item.name} aria-label={item.name} style={tableStyle} data-relation={item.name}>
      <caption>{item.name}</caption>
      <thead><tr>{item.columns.map((column, i) => <th key={column} scope="col">{i === 0 ? <u>{column}</u> : column}</th>)}</tr></thead>
      {item.row.length > 0 && <tbody><tr>{item.row.map((cell, i) => <td key={i}>{cell}</td>)}</tr></tbody>}
    </table>)}
  </TableFigure>;
}

function Network({ caption, values }: BookletFigureProps) {
  const [backboneA, backboneB, routerA, routerB, web1] = networkModel(values[0]).ports;
  const ports = [backboneA, backboneB, routerA, routerB, web1];
  const locations = [[153, 276], [500, 276], [153, 343], [500, 343], [246, 418]] as const;
  return <Drawing profile={profiles.network} caption={caption} alt={networkAlt(values)} width={915} height={485}>
    {() => <>
      <ellipse cx={282} cy={41} rx={104} ry={26}/><Label x={282} y={46}>インターネット</Label>
      <path d="M282 67V132"/>
      <rect x={15} y={90} width={885} height={379} strokeDasharray="7 5"/>
      <Label x={33} y={80} align="start">社外</Label><Label x={33} y={111} align="start">社内</Label>
      <Rect x={191} y={132} width={182} height={35}>ファイアウォール</Rect>
      <path d="M373 150H890M282 167V250M26 250H598M165 250V291M512 250V291M165 320V397M512 320V350" data-network-route="backbone"/>
      <Label x={126} y={238} align="start">基幹ネットワーク</Label><Label x={690} y={139}>DMZ</Label>
      {[454, 624, 795].map((x, i) => <g key={x} data-dmz-server={i}>
        <path d={'M' + x + ' 150v26'}/>
        <rect x={x - 66} y={176} width={132} height={52}/>
        <Label x={x} y={197}>{['メール','DNS','社外公開用'][i]}</Label>
        <Label x={x} y={215}>{i === 2 ? 'Webサーバ' : 'サーバ'}</Label>
      </g>)}
      <Rect x={122} y={291} width={86} height={29}>ルータ</Rect><Rect x={469} y={291} width={86} height={29}>ルータ</Rect>
      <path d="M26 397H493M441 350H853M227 397v32M400 397v32M620 350v18M789 350v18"/>
      <Label x={223} y={384}>ネットワークA</Label><Label x={680} y={338}>ネットワークB</Label>
      {[227, 400].map((x, i) => <g key={x} data-internal-web={i + 1}>
        <rect x={x - 70} y={429} width={140} height={34}/>
        <Label x={x} y={443}>社内システム</Label><Label x={x} y={458}>Webサーバ{i + 1}</Label>
      </g>)}
      <Rect x={565} y={368} width={110} height={30}>業務用PC</Rect><Label x={704} y={388}>…</Label>
      <Rect x={734} y={368} width={110} height={30}>業務用PC</Rect>
      {locations.map(([x, y], i) => <g key={i} data-network-port={i} data-ip={ports[i]}>
        <Label x={x} y={y} align={i === 4 ? "start" : "end"}>{ports[i]}</Label>
      </g>)}
      {[[26,250],[165,250],[282,250],[512,250],[598,250],[890,150],[454,150],[624,150],[795,150],
        [26,397],[165,397],[227,397],[400,397],[493,397],[441,350],[512,350],[620,350],[789,350],[853,350]]
        .map(([x,y]) => <rect key={x + '-' + y} x={x - 3} y={y - 3} width={6} height={6} fill="currentColor"/>)}
    </>}
  </Drawing>;
}

function IpAddresses({ caption, values }: BookletFigureProps) {
  const { candidates } = networkModel(values[0]);
  return <TableFigure profile={profiles.ipAddresses} caption={caption} alt={ipsAlt(values)} top>
    <table aria-label={caption} style={tableStyle}>
      <tbody>{[candidates.slice(0,5), candidates.slice(5)].map((row, i) => <tr key={i}>
        {row.map(value => <td key={value} data-ip-candidate={value}>{value}</td>)}
      </tr>)}</tbody>
    </table>
  </TableFigure>;
}

const border = '2px dashed var(--diagram-ink)';
const outlineStyle = (outline: 'first' | 'middle' | 'last'): CSSProperties => ({
  borderInline: border, ...(outline === 'first' ? { borderTop: border } : {}), ...(outline === 'last' ? { borderBottom: border } : {}),
});
function RiskTables({ caption, values }: BookletFigureProps) {
  const [index, kind] = values, { ratings, acceptable, integrity } = riskModel(index);
  return <TableFigure profile={profiles.riskTables} caption={caption} alt={risksAlt(values)} top>
    {kind === 0 ? <table aria-label={caption} style={tableStyle}>
      <thead>
        <tr><th colSpan={2} scope="colgroup">脅威</th><th colSpan={2} scope="colgroup">脆弱性</th></tr>
        <tr><th scope="col">種類</th><th scope="col">値</th><th scope="col">種類</th><th scope="col">値</th></tr>
      </thead>
      <tbody>{riskNames.map((name, i) => <tr key={name} data-threat={name}>
        <th scope="row">{name}</th><td>{ratings[i][0]}</td><td>{vulnerabilities[i]}</td><td>{ratings[i][1]}</td>
      </tr>)}</tbody>
    </table> : kind === 1 ? <table aria-label={caption} style={tableStyle}>
      <tbody>{riskClasses.map((name, i) => <tr key={name} data-risk-limit={name}><th scope="row">{name}</th><td>{acceptable[i]}</td></tr>)}</tbody>
    </table> : <table aria-label={caption} style={tableStyle}>
      <thead>
        <tr><th colSpan={3} scope="colgroup">情報資産</th><th colSpan={2} scope="colgroup">脅威</th>
          <th colSpan={2} scope="colgroup">脆弱性</th><th scope="colgroup">リスク</th></tr>
        <tr><th rowSpan={2} scope="col">名称</th><th colSpan={2} scope="colgroup">価値</th><th rowSpan={2} scope="col">内容</th>
          <th rowSpan={2} scope="col">値</th><th rowSpan={2} scope="col">内容</th><th rowSpan={2} scope="col">値</th>
          <th rowSpan={2} scope="col">値</th></tr>
        <tr><th scope="col">分類</th><th scope="col">値</th></tr>
      </thead>
      <tbody>{excerptRows.map((row, i) => <tr key={i}>
        {row.assetSpan && <th rowSpan={row.assetSpan} scope="rowgroup">{row.asset}</th>}
        {row.span && <>
          <th rowSpan={row.span}>{row.kind}</th>
          <td rowSpan={row.span} className={row.valueOfAsset ? undefined : 'omitted-cell'} aria-label={row.valueOfAsset ? undefined : '網掛け'}>{row.valueOfAsset}</td>
        </>}
        {row.marker !== undefined ? <td colSpan={5} aria-label="表示を省略">⋮</td> : <>
          <td>{riskNames[row.hazard!]}</td><td className="omitted-cell" aria-label="網掛け"/>
          <td>{vulnerabilities[row.hazard!]}</td><td className="omitted-cell" aria-label="網掛け"/>
          <td data-outlined-risk={row.outline} style={row.outline ? outlineStyle(row.outline) : undefined}>
            {row.integrity === undefined ? row.value : integrity[row.integrity]}
          </td>
        </>}
      </tr>)}</tbody>
    </table>}
  </TableFigure>;
}

export const legacy2011AutumnPm0104FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.wave, component: Wave }, { profile: profiles.adcCodes, component: AdcCodes },
  { profile: profiles.organization, component: Organization }, { profile: profiles.relations, component: Relations },
  { profile: profiles.network, component: Network }, { profile: profiles.ipAddresses, component: IpAddresses },
  { profile: profiles.riskTables, component: RiskTables },
];
