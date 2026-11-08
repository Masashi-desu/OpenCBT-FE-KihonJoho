import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  legacy2015SpringPm0104Figures, spring2015Pm0104Profiles as f,
} from '../core/generators/legacy-2015-spring-pm-01-04-figures';
import {
  childrenTable, dnsSteps, householdTables, relationTables, reportRows, type SourceTable,
} from '../core/generators/legacy-2015-spring-pm-01-04-models';

function Drawing({ profile, values, caption, width, height, children }: BookletFigureProps & {
  profile: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId(), definition = legacy2015SpringPm0104Figures.find(d => d.profile === profile)!;
  definition.validate(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{definition.alt(values)}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fontSize="15" fill="none" stroke="currentColor" strokeWidth="1.4">{children('url(#' + id + '-arrow)')}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Text({ x, y, children, align = 'middle', underline = false }: {
  x: number; y: number; children: ReactNode; align?: 'start' | 'middle'; underline?: boolean;
}) {
  return <text x={x} y={y} textAnchor={align} fill="currentColor" stroke="none" textDecoration={underline ? 'underline' : undefined}>{children}</text>;
}
function Box({ x, y, w, h, label, rounded = false }: {
  x: number; y: number; w: number; h: number; label: string; rounded?: boolean;
}) {
  const lines = label.split('\n');
  return <g><rect x={x} y={y} width={w} height={h} rx={rounded ? 10 : undefined} fill="var(--diagram-surface)"/>
    {lines.map((line, i) => <Text key={i} x={x + w / 2} y={y + h / 2 + 5 + (i - (lines.length - 1) / 2) * 19}>{line}</Text>)}
  </g>;
}

function Network(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.network} width={755} height={339}>{() => <>
    <Text x={20} y={24} align="start">取引先の社内ネットワーク（一部）</Text>
    <rect x="14" y="33" width="277" height="109"/>
    <rect x="299" y="117" width="443" height="179"/>
    <path d="M25 63H357M69 63V90M177 63V90M421 87V133M421 160V180M421 207V241M455 147H510M309 241H728M357 241V256M459 241V256M560 241V256M690 241V256"/>
    {[25,69,177].map(x=><rect key={x} x={x-2} y="60" width="5" height="6" fill="currentColor"/>)}
    {[309,357,421,459,560,690,728].map(x=><rect key={x} x={x-2} y="238" width="5" height="6" fill="currentColor"/>)}
    <Box x={30} y={90} w={78} h={40} label={'取引先\nPC'}/>
    <Box x={138} y={90} w={78} h={40} label={'取引先\nPC'}/>
    <Text x={122} y={113}>…</Text>
    <Box x={224} y={47} w={61} h={32} label="FW3"/>
    <ellipse cx="421" cy="64" rx="65" ry="23" fill="var(--diagram-surface)"/>
    <Text x={421} y={69}>インターネット</Text>
    <Box x={387} y={133} w={68} h={28} label="FW1"/>
    <Box x={387} y={179} w={68} h={28} label="FW2"/>
    <Box x={510} y={133} w={68} h={28} label="RPS"/>
    <Box x={318} y={256} w={78} h={32} label={'Web\nサーバ'}/>
    <Box x={420} y={256} w={78} h={32} label={'DB\nサーバ'}/>
    <Box x={521} y={256} w={78} h={32} label={'社内\nPC'}/>
    <Box x={651} y={256} w={78} h={32} label={'社内\nPC'}/>
    <Text x={625} y={279}>…</Text>
    <Text x={306} y={315} align="start">K社内のネットワーク（一部）</Text>
    <Text x={14} y={268} align="start">FW：ファイアウォール</Text>
    <Text x={14} y={288} align="start">RPS：リバースプロキシサーバ</Text>
  </>}</Drawing>;
}

function Report(props: BookletFigureProps) {
  const heights = [58, 58, 112, 76], hatch = useId();
  return <Drawing {...props} profile={f.report} width={754} height={380}>{() => <>
    <defs><pattern id={hatch} patternUnits="userSpaceOnUse" width="6" height="6">
      <path d="M0 6L6 0" stroke="var(--diagram-border)" strokeWidth="0.6"/>
    </pattern></defs>
    <path d="M10 12H744V345H10ZM377 12V345M10 41H744"/>
    <Text x={194} y={32}>指摘事項</Text><Text x={560} y={32}>原因</Text>
    {reportRows.map((row,i) => {
      const y = 41 + heights.slice(0,i).reduce((a,b)=>a+b,0), h = heights[i];
      return <g key={i} data-report-row={i + 1}>
        {row.map((cell,j) => {
          const x = 10 + j * 367;
          if (!cell) return <rect key={j} x={x+1} y={y+1} width="365" height={h-2} fill={'url(#' + hatch + ')'} stroke="none"/>;
          const lines = cell.match(/.{1,23}/gu)!;
          return <g key={j}>{lines.map((line,k) =>
            <Text key={k} x={x+10} y={y+22+k*19} align="start" underline={j === 1}>{line}</Text>)}</g>;
        })}
        <path d={`M10 ${y + h}H744`}/>
      </g>;
    })}
    <Text x={12} y={369} align="start">注記　網掛けの部分は表示していない。</Text>
  </>}</Drawing>;
}

function Virtual(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.virtual} width={766} height={342}>{arrow => <>
    <Text x={76} y={33}>言語Xによる</Text><Text x={76} y={53}>原始プログラム</Text>
    <Box x={20} y={62} w={112} h={47} label="プログラム"/>
    <path d="M76 109L168 183" markerEnd={arrow}/>
    <Text x={125} y={142}>①</Text><Text x={65} y={159}>中間コード</Text><Text x={67} y={179}>への変換</Text>
    <Text x={229} y={167}>中間コード</Text><Box x={172} y={178} w={112} h={47} label="プログラム"/>
    <path d="M284 202L390 101M284 202L390 249" strokeDasharray="5 4" markerEnd={arrow}/>
    <Text x={331} y={193}>中間コード</Text><Text x={331} y={213}>の配布</Text>
    {[0,1].map(i => {
      const y = 76 + 150*i;
      return <g key={i} data-platform={i === 0 ? 'A' : 'B'}>
        <Text x={448} y={y-8}>中間コード</Text>
        <Box x={392} y={y} w={112} h={47} label="プログラム"/>
        <path d={`M504 ${y+23}H603`} markerEnd={arrow}/>
        <Text x={553} y={y+9}>中間コード</Text><Text x={553} y={y+43}>② の入力</Text>
        <Text x={676} y={y-20}>仮想計算機V</Text>
        <rect x="608" y={y-11} width="133" height="61" rx="13"/>
        <Box x={617} y={y+1} w={112} h={31} label="インタプリタ" rounded/>
        <circle cx="737" cy={y+32} r="20" fill="var(--diagram-surface)"/><Text x={737} y={y+37}>実行</Text>
        <Box x={608} y={y+53} w={133} h={35} label={'ハードウェア' + (i === 0 ? 'A' : 'B')}/>
      </g>;
    })}
    <Text x={448} y={318}>⋮</Text><Text x={673} y={333}>⋮</Text>
  </>}</Drawing>;
}

function Dynamic(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.dynamic} width={764} height={279}>{arrow => <>
    <Text x={84} y={51}>中間コード</Text>
    <Box x={22} y={62} w={124} h={54} label="主プログラム"/>
    <Box x={22} y={116} w={124} h={54} label="関数F"/>
    <path d="M146 89H280M146 142H195V90M146 151H280" markerEnd={arrow}/>
    <Text x={217} y={57}>中間コード</Text><Text x={217} y={77}>の入力</Text>
    <Text x={251} y={176}>③</Text>
    <rect x="268" y="45" width="254" height="179" rx="18"/>
    <Text x={395} y={34}>仮想計算機V</Text>
    <Box x={282} y={69} w={193} h={42} label="① インタプリタ" rounded/>
    <circle cx="485" cy="113" r="22" fill="var(--diagram-surface)"/><Text x={485} y={118}>実行</Text>
    <Box x={282} y={137} w={193} h={35} label="動的コンパイラ" rounded/>
    <Text x={380} y={192}>関数Fの実行形式</Text><Text x={380} y={213}>プログラムへの変換</Text>
    <path d="M473 82L561 57M475 155H561" markerEnd={arrow}/>
    <Text x={528} y={61}>②</Text>
    <Box x={562} y={35} w={175} h={43} label="プロファイル情報"/>
    <Box x={562} y={129} w={175} h={55} label={'関数Fの実行形式\nプログラム'}/>
    <Text x={667} y={211}>④</Text><circle cx="733" cy="193" r="22" fill="var(--diagram-surface)"/><Text x={733} y={198}>実行</Text>
  </>}</Drawing>;
}

function RelationTable({ x, y, model }: { x: number; y: number; model: SourceTable }) {
  const offsets = model.widths.map((_,i) => model.widths.slice(0,i).reduce((a,b)=>a+b,0));
  const rows = [model.columns, ...model.rows];
  return <g data-relation-table={model.name}>
    <Text x={x} y={y-5} align="start">{model.name}</Text>
    {rows.map((row,r) => <g key={r}>
      {row.map((cell,i) => {
        const left=x+offsets[i], top=y+27*r, width=model.widths[i];
        return <g key={i} data-primary-key={r===0 && i===model.primary ? cell : undefined}>
          <rect x={left} y={top} width={width} height="27" fill={r===0 ? 'var(--diagram-surface)' : 'none'}/>
          <Text x={left+width/2} y={top+19} underline={r===0 && i===model.primary}>{cell}</Text>
        </g>;
      })}
    </g>)}
  </g>;
}

function Household(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.household} width={643} height={274}>{() => <>
    <RelationTable x={52} y={25} model={householdTables[0]}/>
    <RelationTable x={52} y={106} model={householdTables[1]}/>
  </>}</Drawing>;
}
function Relations(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.relations} width={640} height={349}>{() => <>
    <RelationTable x={12} y={24} model={relationTables[0]}/>
    <RelationTable x={12} y={132} model={relationTables[1]}/>
    <RelationTable x={12} y={249} model={relationTables[2]}/>
    <RelationTable x={204} y={249} model={relationTables[3]}/>
  </>}</Drawing>;
}
function Children(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.children} width={536} height={141}>{() =>
    <RelationTable x={12} y={24} model={childrenTable}/>
  }</Drawing>;
}

function Dns(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.dns} width={718} height={234}>{arrow => <>
    <rect x="13" y="19" width="266" height="175"/><Text x={146} y={214}>端末</Text>
    <Box x={53} y={33} w={180} h={33} label="アプリケーション"/>
    <rect x="53" y="108" width="180" height="70" fill="var(--diagram-surface)"/>
    <Text x={143} y={129}>DNSリゾルバ</Text>
    <Box x={66} y={138} w={154} h={28} label="サーチリスト"/>
    <path d="M133 66V108M233 120L391 52M470 70V114" markerEnd={arrow}/>
    <path d="M153 108V66M392 68L233 139M496 114V70" strokeDasharray="6 4" markerEnd={arrow}/>
    <Box x={392} y={33} w={181} h={37} label="A社のDNSサーバ"/>
    <path d="M397 154L409 167H586V129L572 115M404 161L415 174H593V137L587 129"/>
    <Box x={392} y={114} w={181} h={40} label="外部のDNSサーバ"/>
    <Text x={604} y={136} align="start">凡例</Text>
    <path d="M606 153H642" markerEnd={arrow}/><Text x={650} y={158} align="start">問合せ</Text>
    <path d="M606 174H642" strokeDasharray="6 4" markerEnd={arrow}/><Text x={650} y={179} align="start">結果</Text>
  </>}</Drawing>;
}

function Sequence(props: BookletFigureProps) {
  const lanes=[104,345,586];
  return <Drawing {...props} profile={f.sequence} width={696} height={356}>{arrow => <>
    {['アプリケーション','DNSリゾルバ','A社のDNSサーバ'].map((label,i) => <g key={label}>
      <Box x={lanes[i]-87} y={10} w={174} h={32} label={label}/>
      <path d={`M${lanes[i]} 42V343`}/>
    </g>)}
    {dnsSteps.map(([from,to,line1,line2,reply],i) => {
      const y=88+i*47, x=(lanes[from]+lanes[to])/2;
      return <g key={i} data-dns-step={i+1}>
        <Text x={x} y={y-(line2 ? 25 : 8)}>{line1}</Text>
        {line2 && <Text x={x} y={y-8}>{line2}</Text>}
        <path d={`M${lanes[from]} ${y}H${lanes[to]}`} strokeDasharray={reply?'6 4':undefined} markerEnd={arrow}/>
      </g>;
    })}
  </>}</Drawing>;
}

export const legacy2015SpringPm0104FigureRenderers: BookletFigureRenderer[] = [
  { profile: f.network, component: Network }, { profile: f.report, component: Report },
  { profile: f.virtual, component: Virtual }, { profile: f.dynamic, component: Dynamic },
  { profile: f.household, component: Household }, { profile: f.relations, component: Relations },
  { profile: f.children, component: Children }, { profile: f.dns, component: Dns }, { profile: f.sequence, component: Sequence },
];
