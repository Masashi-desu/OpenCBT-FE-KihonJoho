import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  autumn2015Pm0104FigureAlt as alt, autumn2015Pm0104Profiles as f, autumn2015Pm1Permissions,
  autumn2015Pm1Services, autumn2015Pm4Html, autumn2015Pm4Methods,
} from '../core/generators/legacy-2015-autumn-pm-01-04-figures';
import {
  autumn2015Pm2VisibleBits, autumn2015Pm2VisibleWord, autumn2015Pm2Words, autumn2015Pm3Tables,
} from '../core/generators/legacy-2015-autumn-pm-01-04-models';
import { pm1Text } from '../core/generators/legacy-2015-autumn-pm-01-04-text';

type DrawingProps = BookletFigureProps & {
  profile: string; width: number; height: number; showCaption?: boolean;
  children: (arrow: string, wideArrow: string) => ReactNode;
};
function Drawing({ values, caption, profile, width, height, showCaption = true, children }: DrawingProps) {
  const id = useId();
  const style: CSSProperties = {
    display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none', height: 'auto',
    color: 'var(--diagram-ink)',
  };
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'} style={style}>
        <title id={id + '-title'}>{caption}</title>
        <desc id={id + '-desc'}>{alt(profile, values)}</desc>
        <defs>
          <marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.3"/>
          </marker>
          <marker id={id + '-wide-arrow'} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="20" markerHeight="20" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M1 1L10 6L1 11Z" fill="var(--diagram-surface)" stroke="currentColor"/>
          </marker>
        </defs>
        <g aria-hidden="true" fontSize="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          {children('url(#' + id + '-arrow)', 'url(#' + id + '-wide-arrow)')}
        </g>
      </svg>
    </div>
    {showCaption && <figcaption>{caption}</figcaption>}
  </figure>;
}

function Text({ x, y, children, align = 'middle' }: {
  x: number; y: number; children: ReactNode; align?: 'start' | 'middle';
}) {
  return <text x={x} y={y} textAnchor={align} fill="currentColor" stroke="none">{children}</text>;
}

function LogFile({ x, y, label }: { x: number; y: number; label: string }) {
  return <g>
    <path d={`M${x + 16} ${y}h78l-16 42h-78Z`} fill="var(--diagram-surface)"/>
    {label && <><Text x={x + 47} y={y + 17}>ログ</Text><Text x={x + 47} y={y + 35}>ファイル</Text></>}
  </g>;
}
function LogCylinder({ x, y, external = false }: { x: number; y: number; external?: boolean }) {
  return <g data-log-container={external ? 'external' : 'aggregate'}>
    <path d={`M${x} ${y + 12}v43a51 12 0 0 0 102 0v-43Z`} fill="var(--diagram-surface)"/>
    <ellipse cx={x + 51} cy={y + 12} rx="51" ry="12" fill="var(--diagram-surface)"/>
    <Text x={x + 51} y={y + 41}>{external ? '外部ログ集積' : 'ログ集積'}</Text>
    <Text x={x + 51} y={y + 59}>ファイル</Text>
  </g>;
}

function Network(props: BookletFigureProps) {
  const junctions = [18, 87, 124, 242, 279, 471, 545, 690, 805];
  return <Drawing {...props} profile={f.network} width={934} height={523}>{(_arrow, wide) => <>
    <path d="M18 258H631M651 258H805M87 258V297M124 239V258M242 258V297M279 239V258M471 258V293M545 225V258M690 225V258"/>
    {junctions.map(x => <rect key={x} x={x - 3} y="255" width="6" height="6" fill="currentColor"/>)}
    <Text x={641} y={260}>…</Text>
    {[503, 648].map(x => <g key={x}><path d={`M${x} 204l84 -24v45h-84Z`}/><Text x={x + 42} y={216}>端末</Text></g>)}
    {autumn2015Pm1Services.map((service, i) => <Text key={service.name} x={373} y={76 + i * 20} align="start">
      {service.name}：{service.description}
    </Text>)}
    <Text x={373} y={156} align="start">端末：社員が利用する端末</Text>
    {autumn2015Pm1Services.map(({ name, position: [x, y], above }) => {
      const fileY = above ? y + 14 : y + 121;
      const detectorY = above ? y + 129 : y + 15;
      return <g key={name} data-business-server={name}>
        <rect x={x} y={y} width="145" height="180"/>
        <Text x={x + 72} y={above ? y - 26 : y + 202}>{name}</Text>
        <Text x={x + 72} y={above ? y - 8 : y + 220}>のサーバ</Text>
        <LogFile x={x + 25} y={fileY} label="ログファイル"/>
        <rect x={x + 13} y={detectorY} width="119" height="37" fill="var(--diagram-surface)"/>
        <Text x={x + 72} y={detectorY + 24}>検知処理</Text>
        <path d={`M${x + 72} ${above ? fileY + 47 : fileY - 5}V${above ? detectorY - 5 : detectorY + 41}`}
          strokeWidth="4" markerEnd={wide}/>
      </g>;
    })}
    <rect x="332" y="293" width="445" height="184"/>
    <Text x={555} y={500}>ログ管理システムのサーバ</Text>
    <path d="M94 312v-42h333v63 M124 225v45 M249 312v-42 M279 225v45" strokeWidth="6" markerEnd={wide} data-log-route="merge"/>
    <rect x="356" y="332" width="131" height="112" strokeDasharray="6 4"/>
    {[0, 1, 2, 3].map(i => <LogFile key={i} x={367 + i * 4} y={340 + i * 14} label={i === 3 ? 'ログファイル' : ''}/>)}
    <path d="M490 387H524" strokeWidth="4" markerEnd={wide}/><path d="M623 387H664" strokeWidth="4" markerEnd={wide}/><path d="M715 430V454H803" strokeWidth="4" markerEnd={wide}/>
    <rect x="524" y="363" width="99" height="49"/>
    <Text x={573} y={382}>ログ集積</Text><Text x={573} y={400}>処理</Text>
    <LogCylinder x={664} y={363}/><LogCylinder x={810} y={417} external/>
    <path d="M24 504h24" strokeWidth="4" markerEnd={wide}/>
    <Text x={56} y={511} align="start">はログを収集する流れを示す。</Text>
  </>}</Drawing>;
}

const tableStyle: CSSProperties = {
  inlineSize: 'max-content', maxInlineSize: 'none', fontSize: 'calc(1rem * var(--image-scale, 1))',
  color: 'var(--diagram-ink)',
};
function TableViewport({ caption, children }: { caption: string; children: ReactNode }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label={caption + '。左右にスクロールできます。'}>{children}</div>;
}

function Permissions({ caption }: BookletFigureProps) {
  const { columns, rows, note } = autumn2015Pm1Permissions;
  return <figure className="managed-diagram source-figure">
    <TableViewport caption={caption}>
      <table style={tableStyle}><caption>{caption}</caption><thead><tr>
        {columns.map((column, i) => <th scope="col" key={column} aria-label={i === 0 ? '対象' : undefined}>
          <span className="table-heading-text">{column}</span>
        </th>)}
      </tr></thead><tbody>{rows.map(([label, ...values]) => <tr key={label}>
        <th scope="row">{label}</th>
        {values.map((value, i) => <td key={i} className={value === null ? 'omitted-cell' : undefined}>
          {value === null ? <span className="sr-only">原資料で非表示の部分</span> : value}
        </td>)}
      </tr>)}</tbody></table>
    </TableViewport>
    <div>{note}</div>
  </figure>;
}

function Underlined({ values }: BookletFigureProps) {
  const first = values[0] === 0;
  const text = first ? pm1Text.requirements[6] : pm1Text.s5;
  const underlined = first ? '①ログ集積ファイルに書き込まれたログが一定条件' : '二つ';
  const [prefix, suffix] = text.split(underlined);
  return <p>{prefix}<u>{underlined}</u>{suffix}</p>;
}

function BitFields(props: BookletFigureProps) {
  const labels = [
    [30, 31], [66, 30], [100, 29], [134, 28], [168, 27], [202, 26], [236, 25],
    [270, 24], [304, 23], [339, 22], [373, 21], [516, '…'], [658, 0],
  ] as const;
  return <Drawing {...props} profile={f.bits} width={820} height={103}>{() => <>
    <path d="M14 38H675V94H14Z M47 38V94 M321 38V94"/>
    {labels.map(([x, label]) => <Text key={x} x={x} y={28}>{label}</Text>)}
    <Text x={681} y={28} align="start">（ビット番号）</Text>
    {['符', '号', '部'].map((text, i) => <Text key={text} x={30} y={54 + 16 * i}>{text}</Text>)}
    <Text x={184} y={61}>指数部</Text><Text x={184} y={83}>（8ビット）</Text>
    <Text x={498} y={61}>仮数部</Text><Text x={498} y={83}>（23ビット）</Text>
  </>}</Drawing>;
}

function BitWord(props: BookletFigureProps) {
  const [variant, index] = props.values;
  const values = autumn2015Pm2VisibleWord(autumn2015Pm2Words(variant)[index]);
  const visibleLabel = props.caption.length === 1 || index === 1 || index === 2;
  const x = (i: number) => i < 15 ? 30 + 34 * i : i === 15 ? 585 : 675;
  return <Drawing {...props} profile={f.word} width={708} height={77} showCaption={false}>{() => <>
    {visibleLabel && <Text x={14} y={18} align="start">{props.caption}</Text>}
    <path d="M14 45H692V71H14Z M47 45V71 M319 45V71"/>
    {autumn2015Pm2VisibleBits.map((bit, i) => <g key={bit} data-word-bit={bit}>
      <Text x={x(i)} y={37}>{bit}</Text><Text x={x(i)} y={65}>{values[i]}</Text>
    </g>)}
  </>}</Drawing>;
}

function Relations({ values, caption }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure">
    <TableViewport caption={caption}>
      {autumn2015Pm3Tables(values[0], values[1]).map(t => <table key={t.name} style={{ ...tableStyle, marginBlockEnd: '1em' }}>
        <caption>{t.name}</caption><thead><tr>{t.columns.map((column, i) => <th key={column} scope="col">
          {t.keys.includes(i) ? <u data-primary-key aria-label={column + '（主キー）'}>{column}</u> : column}
        </th>)}</tr></thead><tbody>
          {t.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}><span className="table-cell-value">{cell}</span></td>)}</tr>)}
        </tbody>
      </table>)}
    </TableViewport>
    <figcaption>{caption}</figcaption>
  </figure>;
}

const purchaseNodes = [
  { id: 'start', x: 60, y: 46, width: 156, label: 'サイトの閲覧開始', terminal: true },
  { id: 'notice', x: 65, y: 97, width: 146, label: 'お知らせの表示' },
  { id: 'before', x: 12, y: 148, width: 104, label: '商品の閲覧' },
  { id: 'login', x: 151, y: 148, width: 105, label: 'ログイン' },
  { id: 'after', x: 317, y: 46, width: 106, label: '商品の閲覧' },
  { id: 'pick', x: 452, y: 46, width: 106, label: '商品の選択' },
  { id: 'review', x: 317, y: 97, width: 241, label: '選択済み商品の確認' },
  { id: 'order', x: 317, y: 148, width: 106, label: '注文' },
  { id: 'pay', x: 452, y: 148, width: 106, label: '決済' },
  { id: 'logout', x: 619, y: 97, width: 103, label: 'ログアウト' },
  { id: 'end', x: 592, y: 148, width: 158, label: 'サイトの閲覧終了', terminal: true },
] as const;

const purchaseArrows = [
  ['start-notice', 'M138 77V97'], ['notice-before', 'M88 128V148'], ['notice-login', 'M187 128V148'],
  ['before-loop', 'M62 179v17H2v-25h10'], ['before-login', 'M116 162H151'],
  ['login-failure', 'M200 179v17h-72v-25h23'], ['login-success', 'M256 162h28V57h33'],
  ['after-loop', 'M340 77v12h-42V69h19'], ['after-pick', 'M423 56H452'], ['pick-after', 'M452 68H423'],
  ['after-review', 'M370 77V97'], ['pick-review', 'M505 77V97'],
  ['review-order', 'M370 128V148'], ['order-pay', 'M423 163H452'],
  ['upper-logout', 'M371 46V29H670V97'], ['direct-logout', 'M558 112H619'],
  ['return', 'M583 112V35q10 -6 0 -12V10H341V46'], ['logout-end', 'M670 128V148'],
] as const;

function Purchase(props: BookletFigureProps) {
  return <Drawing {...props} profile={f.purchase} width={757} height={229}>{arrow => <>
    {purchaseNodes.map(node => <g key={node.id} data-purchase-node={node.id}>
      <rect x={node.x} y={node.y} width={node.width} height="31" rx={'terminal' in node ? 15 : 0}/>
      <Text x={node.x + node.width / 2} y={node.y + 22}>{node.label}</Text>
    </g>)}
    <path d="M505 46V29" data-purchase-link="pick-upper-logout"/>
    <path d="M370 179v22h207v-89 M558 163h19" data-purchase-link="order-pay-join"/>
    {purchaseArrows.map(([link, path]) => <path key={link} d={path} data-purchase-link={link}
      markerEnd={arrow} data-crossing={link === 'return' ? 'without-connection' : undefined}/>)}
    <Text x={164} y={214}>失敗</Text><Text x={281} y={180}>成功</Text>
  </>}</Drawing>;
}

function Methods({ caption }: BookletFigureProps) {
  return <TableViewport caption={caption}>
    <table style={tableStyle} aria-label={caption}><thead><tr><th scope="col" aria-label="記号"/>
      <th scope="col">特徴</th><th scope="col">方法</th>
    </tr></thead><tbody>{autumn2015Pm4Methods.map(([id, description], i) =>
      <tr key={id}><th scope="row">{id}</th><td><span className="table-cell-prose" style={{ maxInlineSize: '30em' }}>{description}</span></td>
        {i === 0 && <td rowSpan={3} data-answer-blank="b">［b］</td>}
      </tr>)}
    </tbody></table>
  </TableViewport>;
}

function HtmlExample({ values, caption }: BookletFigureProps) {
  const [before, after] = autumn2015Pm4Html[values[0]].split('セッションID');
  return <div className="diagram-scroll" tabIndex={0} aria-label={caption}>
    <pre style={{ fontSize: 'calc(0.95rem * var(--image-scale, 1))', whiteSpace: 'pre', margin: 0 }}>
      <code>{'例：' + before}<u>セッションID</u>{after}</code>
    </pre>
  </div>;
}

export const legacy2015AutumnPm0104FigureRenderers: BookletFigureRenderer[] = [
  { profile: f.network, component: Network }, { profile: f.permissions, component: Permissions },
  { profile: f.underlined, component: Underlined }, { profile: f.bits, component: BitFields },
  { profile: f.word, component: BitWord }, { profile: f.relations, component: Relations },
  { profile: f.purchase, component: Purchase }, { profile: f.methods, component: Methods },
  { profile: f.html, component: HtmlExample },
];
