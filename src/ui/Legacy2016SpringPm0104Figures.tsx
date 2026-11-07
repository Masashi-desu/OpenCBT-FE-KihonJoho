import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  spring2016Pm0104FigureAlt as alt, spring2016Pm0104Profiles as f,
  spring2016Pm2Cases, spring2016Pm2GraphValue, spring2016Pm2Label, spring2016Pm2Links,
  spring2016Pm2Live, spring2016Pm2Memory, spring2016Pm3Tables,
  spring2016Pm4Cases, spring2016Pm4Networks,
} from '../core/generators/legacy-2016-spring-pm-figures-01-04';

type DrawingProps = BookletFigureProps & {
  profile: string;
  width: number;
  height: number;
  children: (arrow: string) => ReactNode;
};

function Drawing({ values, caption, profile, width, height, children }: DrawingProps) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={id + '-title'}
        aria-describedby={id + '-desc'} style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))',
          maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt(profile, values)}</desc>
        <defs>
          <marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.3"/>
          </marker>
        </defs>
        <g aria-hidden="true" fontSize="17" fill="none" stroke="currentColor" strokeWidth="1.5">
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Text({ x, y, children, centered = false }: {
  x: number; y: number; children: ReactNode; centered?: boolean;
}) {
  return <text x={x} y={y} textAnchor={centered ? 'middle' : 'start'} fill="currentColor" stroke="none">{children}</text>;
}

function Q1Network(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.q1Network} width={770} height={380}>{() => <>
    <rect x="12" y="26" width="128" height="78" rx="9"/>
    <rect x="23" y="55" width="106" height="36"/>
    <Text x={23} y={46}>利用者</Text><Text x={76} y={79} centered>利用者端末</Text>
    <ellipse cx="226" cy="73" rx="76" ry="21"/>
    <path d="M129 73H150M302 73H346"/>
    <Text x={226} y={79} centered>インターネット</Text>
    <rect x="319" y="26" width="439" height="329" rx="9"/>
    <Text x={330} y={47}>A社</Text>
    <rect x="346" y="55" width="50" height="36"/>
    <Text x={371} y={79} centered>FW</Text>
    <rect x="435" y="31" width="139" height="74" rx="8" strokeDasharray="7 4"/>
    <Text x={446} y={50}>DMZ</Text>
    <path d="M396 73H447"/>
    <rect x="447" y="56" width="111" height="35"/>
    <Text x={502} y={79} centered>Webサーバ</Text>
    <rect x="331" y="113" width="415" height="227" rx="8" strokeDasharray="7 4"/>
    <Text x={698} y={137}>LAN</Text>
    <path d="M371 91V147M340 147H730M461 147V165"/>
    {[340, 371, 461, 730].map(x => <rect key={x} x={x - 3} y="144" width="6" height="6" fill="currentColor"/>)}
    <rect x="350" y="165" width="379" height="165"/>
    <Text x={539} y={188} centered>DBサーバ</Text>
    <rect x="356" y="198" width="181" height="122"/><rect x="541" y="198" width="181" height="122"/>
    {['会員情報', '氏名', 'メールアドレス', '訪れた飲食店情報', 'ログイン情報', '（IDとパスワード）など']
      .map((label, index) => <Text key={label} x={index === 0 ? 362 : 369} y={217 + index * 19}>{label}</Text>)}
    {['公開情報', '飲食店情報', '評価情報'].map((label, index) =>
      <Text key={label} x={index === 0 ? 548 : 555} y={217 + index * 19}>{label}</Text>)}
    <Text x={24} y={313}>FW：ファイアウォール</Text><Text x={24} y={338}>DB：データベース</Text>
  </>}</Drawing>;
}

function Cell({ x, y, mark, pointers, garbage = false }: {
  x: number; y: number; mark: number; pointers: readonly (number | null)[]; garbage?: boolean;
}) {
  return <g data-mark-bit={mark} data-garbage={garbage}>
    <path d={`M${x} ${y}h60v29h-60z M${x + 14} ${y}v29 M${x + 37} ${y}v29`}
      strokeDasharray={garbage ? '4 3' : undefined}/>
    <Text x={x + 7} y={y + 21} centered>{mark}</Text>
    {pointers.map((pointer, index) => pointer === null
      ? <path key={index} d={`M${x + 14 + 23 * index} ${y + 29}l23 -29`}/>
      : null)}
  </g>;
}

function CellStructure(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.q2Cell} width={480} height={135}>{arrow => <>
    <path d="M37 38H454V76H37Z M53 38V76 M104 38V76 M155 38V76"/>
    <path d="M52 35Q53 27 69 27H139Q154 27 155 35"/>
    <path d="M78 60V95" markerEnd={arrow}/><path d="M129 60V95" markerEnd={arrow}/>
    <path d="M45 107V79" strokeDasharray="4 3" markerEnd={arrow}/>
    <Text x={104} y={22} centered>ポインタ</Text><Text x={302} y={63} centered>データ領域</Text>
    <Text x={46} y={127} centered>マークビット</Text>
  </>}</Drawing>;
}

function Memory({ values, caption, marked = false }: BookletFigureProps & { marked?: boolean }) {
  const marks = spring2016Pm2Memory(values[0], marked);
  return <Drawing values={values} caption={caption} profile={marked ? f.q2Sweep : f.q2Memory}
    width={540} height={marked ? 62 : 85}>{() => <>
    {marks.map((mark, index) => {
      const x = 15 + index * 60 + (index >= 6 ? 26 : 0), y = marked ? 14 : 40;
      return <g key={index}>
        <Cell x={x} y={y} mark={mark} pointers={marked ? [] : [null, null]} garbage={marked && mark === 0}/>
        {!marked && index !== 5 && <>
          <path d={`M${x} 37Q${x + 2} 27 ${x + 10} 26H${x + 50}Q${x + 58} 27 ${x + 60} 37`}/>
          <Text x={x + 30} y={22} centered>セル</Text>
        </>}
      </g>;
    })}
    <path d={marked ? 'M379 14q-6 8 0 15t0 15M395 14q-6 8 0 15t0 15' : 'M379 40q-6 8 0 15t0 15M395 40q-6 8 0 15t0 15'}/>
  </>}</Drawing>;
}

const positions = [[12, 102], [12, 171], [91, 171], [176, 102], [176, 171], [286, 102], [286, 171]];

function LiveCells({ index, after, marked, arrow }: {
  index: number; after: boolean; marked: boolean; arrow: string;
}) {
  const target = after ? spring2016Pm2Cases[index].target : 3;
  const links = spring2016Pm2Links(index), live = spring2016Pm2Live(index, after);
  const [tx, ty] = positions[target];
  const rootPath = target === 4 ? 'M126 45L176 171'
    : target === 6 ? 'M134 37L352 69V156L316 171'
    : `M134 37L${tx + 6} ${ty}`;
  return <>
    <rect x="3" y="76" width="354" height="134"/>
    <ellipse cx="90" cy="32" rx="48" ry="20"/>
    <Text x={90} y={39} centered>LIVE</Text>
    <path d="M63 49L32 102" markerEnd={arrow}/>
    <path d={rootPath} markerEnd={arrow} data-root-target={target}/>
    <Text x={148} y={27}>ポインタX</Text>
    {links.flatMap((pointers, from) => pointers.map((to, slot) => {
      if (to === null) return null;
      const [x, y] = positions[from], [nextX, nextY] = positions[to];
      const start = x + 25 + slot * 23;
      const path = x === nextX
        ? `M${start} ${y + 18}V${nextY}`
        : nextY === y
          ? `M${start} ${y + 14}H${nextX}`
          : `M${start} ${y + 14}H${x + 35}V151H312V131`;
      return <path key={from + '-' + slot} d={path} markerEnd={arrow} data-cell-link={from + '-' + to}/>;
    }))}
    {positions.map(([x, y], cell) => <g key={cell} data-cell={cell}>
      <Cell x={x} y={y} mark={marked && live.has(cell) ? 1 : 0} pointers={links[cell]} garbage={!live.has(cell)}/>
      <Text x={x + 30} y={y + (cell === 4 || cell === 6 ? 48 : -7)} centered>{spring2016Pm2Label(index, cell)}</Text>
    </g>)}
  </>;
}

function LiveExample({ values, caption, marked = false }: BookletFigureProps & { marked?: boolean }) {
  const index = values[0];
  return <Drawing values={values} caption={caption} profile={marked ? f.q2Marked : f.q2Live}
    width={marked ? 370 : 755} height={marked ? 229 : 265}>{arrow => marked
      ? <g transform="translate(6 3)"><LiveCells index={index} after={true} marked={true} arrow={arrow}/></g>
      : <>
        <Text x={13} y={25}>(a) LIVEがセルAを指している状態</Text>
        <Text x={392} y={25}>(b) {index === 0 ? 'セルAとセルBがガーベジになった状態' : 'ポインタXの接続先が変わった状態'}</Text>
        <g transform="translate(8 42)"><LiveCells index={index} after={false} marked={false} arrow={arrow}/></g>
        <g transform="translate(387 42)"><LiveCells index={index} after={true} marked={false} arrow={arrow}/></g>
      </>}
  </Drawing>;
}

function Efficiency(props: BookletFigureProps) {
  const [index, choice] = props.values;
  const samples = Array.from({ length: 51 }, (_, n) => n / 50);
  const points = samples.map(x => (46 + 187 * x).toFixed(2) + ',' +
    (145 - 96 * spring2016Pm2GraphValue(index, choice, x)).toFixed(2)).join(' ');
  return <Drawing {...props} profile={f.q2Graph} width={310} height={178}>{arrow => <>
    <path d="M46 145V29" markerEnd={arrow}/><path d="M46 145H270" markerEnd={arrow}/>
    <path d="M233 145V34" strokeDasharray="5 4"/>
    <polyline points={points} data-efficiency-choice={choice}/>
    <Text x={19} y={20}>GCの効率</Text><Text x={231} y={166} centered>1</Text><Text x={272} y={151}>L/M</Text>
  </>}</Drawing>;
}

const cellStyle: CSSProperties = {
  border: '1px solid var(--diagram-border)', padding: '.35em .65em', textAlign: 'center', whiteSpace: 'nowrap',
};
function DatabaseTables({ values, caption }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <div style={{ width: 'max-content', fontSize: 'calc(1rem * var(--image-scale, 1))' }}>
        {spring2016Pm3Tables(values[0], values[1]).map(t => <table key={t.name} style={{
          borderCollapse: 'collapse', marginBottom: '1em', color: 'var(--diagram-ink)', background: 'var(--diagram-surface)',
        }}>
          <caption style={{ textAlign: 'left' }}>{t.name}</caption>
          <thead><tr>{t.columns.map((column, index) =>
            <th key={column} scope="col" style={cellStyle}>{t.keys.includes(index) ? <u data-primary-key>{column}</u> : column}</th>)}</tr></thead>
          <tbody>{[...t.rows, t.columns.map(() => '⋮')].map((row, index) => <tr key={index}>
            {row.map((item, column) => <td key={column} style={cellStyle}>{item}</td>)}
          </tr>)}</tbody>
        </table>)}
      </div>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Q4Network(props: BookletFigureProps) {
  const mirrored = spring2016Pm4Cases[props.values[0]].senderNetwork === 1;
  const x = (original: number) => mirrored ? 760 - original : original;
  const leftRouter = mirrored ? 'H' : 'G', rightRouter = mirrored ? 'G' : 'H';
  const line = (from: number, to: number, y: number, dataSegment: string) =>
    <line x1={x(from)} x2={x(to)} y1={y} y2={y} data-network-segment={dataSegment}/>;
  const device = (original: number, y: number, name: string, width: number, subnet?: number) => <g data-device={name} data-subnet={subnet}>
    <rect x={x(original) - width / 2} y={y} width={width} height="34"/>
    <Text x={x(original)} y={y + 23} centered>{name}</Text>
  </g>;
  const dot = (original: number, y: number) =>
    <rect key={original} x={x(original) - 3} y={y - 3} width="6" height="6" fill="currentColor"/>;
  return <Drawing {...props} profile={f.q4Network} width={760} height={221}>{() => <>
    <Text x={x(480)} y={23} centered>基幹ネットワーク</Text>
    {line(360, 602, 39, 'backbone')}
    {line(28, 244, 142, 'branch')}
    {line(267, 463, 142, 'same-segment')}
    {line(507, 730, 142, 'different-segment')}
    <Text x={x(110)} y={130} centered>{spring2016Pm4Networks[mirrored ? 1 : 0]}</Text>
    <Text x={x(653)} y={130} centered>{spring2016Pm4Networks[mirrored ? 0 : 1]}</Text>
    {[360, 421, 548, 602].map(p => dot(p, 39))}
    {[28, 153, 218, 244, 267, 295, 351, 421, 463, 507, 548, 626, 730].map(p => dot(p, 142))}
    {[421, 548].map(p => <path key={p} d={`M${x(p)} 39V65 M${x(p)} 99V142`}/>)}
    {[153, 351, 626].map(p => <path key={p} d={`M${x(p)} 142V174`}/>)}
    <path d={`M${x(218)} 99V142 M${x(295)} 99V142`}/>
    {device(256, 65, 'ブリッジC', 106, mirrored ? 1 : 0)}
    {device(421, 65, 'ルータ' + leftRouter, 96, mirrored ? 1 : 0)}
    {device(548, 65, 'ルータ' + rightRouter, 96, mirrored ? 0 : 1)}
    {device(153, 174, 'ホストE', 90, mirrored ? 1 : 0)}
    {device(351, 174, 'ホストD', 90, mirrored ? 1 : 0)}
    {device(626, 174, 'ホストF', 90, mirrored ? 0 : 1)}
  </>}</Drawing>;
}

export const legacy2016SpringPm0104FigureRenderers: BookletFigureRenderer[] = [
  { profile: f.q1Network, component: Q1Network },
  { profile: f.q2Cell, component: CellStructure },
  { profile: f.q2Memory, component: Memory },
  { profile: f.q2Live, component: LiveExample },
  { profile: f.q2Marked, component: props => <LiveExample {...props} marked/> },
  { profile: f.q2Sweep, component: props => <Memory {...props} marked/> },
  { profile: f.q2Graph, component: Efficiency },
  { profile: f.q3Tables, component: DatabaseTables },
  { profile: f.q4Network, component: Q4Network },
];
