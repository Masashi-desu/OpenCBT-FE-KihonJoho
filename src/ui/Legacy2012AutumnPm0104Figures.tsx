import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { incidentAlt, linesAlt, messageAlt, mimeMessageLines, profiles, purchaseAlt, sharedAlt, syncAlt } from '../core/generators/legacy-2012-autumn-pm-01-04-figures';
import { incidentResponseRows, mimeLines, purchaseTables } from '../core/generators/legacy-2012-autumn-pm-01-04-models';

function Drawing({ caption, alt, width, height, children }: {
  caption: string; alt: string; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, maxWidth: 'none', height: 'auto', color: 'var(--diagram-ink)' }}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" fontSize="15">
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Label({ x, y, children, left = false }: { x: number; y: number; children: ReactNode; left?: boolean }) {
  return <text x={x} y={y} textAnchor={left ? 'start' : 'middle'} stroke="none" fill="currentColor">{children}</text>;
}

function Shared({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} alt={sharedAlt()} width={630} height={300}>{arrow => <>
    <Label x={315} y={23}>コンピュータX</Label><rect x="18" y="32" width="594" height="204"/>
    <Label x={119} y={56}>プロセスp1</Label><Label x={511} y={56}>プロセスp2</Label>
    {[30, 423].map(x => <g key={x}>
      <rect x={x} y="67" width="177" height="158" rx="11"/>
      <rect x={x + 6} y="75" width="165" height="142" strokeDasharray="6 4"/>
      <Label x={x + 88} y={95}>〔計算処理〕</Label>
      <Label x={x + 13} y={119} left>① 共有データyから</Label><Label x={x + 31} y={139} left>の読込み</Label>
      <Label x={x + 13} y={159} left>② 計算</Label>
      <Label x={x + 13} y={179} left>③ 共有データyへ</Label><Label x={x + 31} y={199} left>の書込み</Label>
    </g>)}
    <Label x={315} y={107}>共有メモリ</Label><rect x="263" y="116" width="104" height="102"/>
    <circle cx="315" cy="168" r="37"/>
    <Label x={315} y={155}>共有</Label><Label x={315} y={174}>データ</Label><Label x={315} y={193}>y</Label>
    <path d="M284 145L208 119M346 145L422 119M208 183L280 180M422 183L350 180" markerEnd={arrow}/>
    <Label x={18} y={265} left>注記</Label><path d="M65 260H104" markerEnd={arrow}/>
    <Label x={115} y={265} left>は共有データへのアクセス（読込み又は書込み）を表す。</Label>
  </>}</Drawing>;
}

function Sync({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} alt={syncAlt()} width={630} height={300}>{arrow => <>
    <Label x={315} y={23}>コンピュータX</Label><rect x="18" y="32" width="594" height="190"/>
    <Label x={120} y={53}>プロセスp1</Label><Label x={510} y={53}>プロセスp2</Label>
    {[32, 422].map(x => <g key={x}>
      <rect x={x} y="64" width="176" height="144" rx="10"/>
      <Label x={x + 81} y={96}>ℓ(s)</Label>
      <rect x={x + 16} y="111" width="144" height="38" strokeDasharray="6 4"/>
      <Label x={x + 88} y={135}>〔計算処理〕</Label>
      <Label x={x + 81} y={177}>u(s)</Label>
    </g>)}
    <Label x={315} y={77}>共有メモリ</Label><rect x="246" y="84" width="138" height="124"/>
    <rect x="255" y="91" width="120" height="39" rx="19"/>
    <Label x={315} y={109}>同期変数</Label><Label x={315} y={125}>s</Label>
    <circle cx="315" cy="171" r="32"/><Label x={315} y={157}>共有</Label>
    <Label x={315} y={175}>データ</Label><Label x={315} y={194}>y</Label>
    {[['M133 91L255 104', 133, 91], ['M133 171L256 121', 133, 171],
      ['M442 91L374 104', 442, 91], ['M442 171L374 121', 442, 171]].map(([line, x, y]) => <g key={line}>
      <circle cx={x} cy={y} r="2" fill="currentColor"/><path d={String(line)} strokeDasharray="7 4" markerEnd={arrow}/>
    </g>)}
    <path d="M192 131L285 167M438 131L345 167" markerStart={arrow} markerEnd={arrow}/>
    <Label x={18} y={248} left>注記</Label><path d="M65 243H103" markerStart={arrow} markerEnd={arrow}/>
    <Label x={115} y={248} left>は共有データへのアクセスを表す。</Label>
    <circle cx="65" cy="270" r="2" fill="currentColor"/>
    <path d="M65 270H103" strokeDasharray="7 4" markerEnd={arrow}/>
    <Label x={115} y={275} left>は同期変数sへの操作を表す。</Label>
  </>}</Drawing>;
}

function Purchase({ caption, values }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={purchaseAlt(values)}>
    {purchaseTables(values[0], values[1]).map(item => <div className="table-scroll" tabIndex={0} key={item.title}>
      <table aria-label={item.title}>
        <caption>{item.title}</caption>
        <thead><tr>{item.columns.map((name, index) => <th key={name} scope="col" style={{ whiteSpace: 'nowrap' }}>
          {item.keys.includes(index) ? <u data-primary-key="true">{name}</u> : name}
        </th>)}</tr></thead>
        <tbody>{item.rows.map((row, index) => <tr key={index}>{row.map((text, column) =>
          <td key={column} style={{ whiteSpace: 'nowrap' }}>{text}</td>)}</tr>)}</tbody>
      </table>
    </div>)}
    <figcaption>{caption}</figcaption>
  </figure>;
}

function MimeMessage({ caption }: BookletFigureProps) {
  return <Drawing caption={caption} alt={messageAlt()} width={600} height={326}>{() => <>
    <rect x="17" y="12" width="565" height="267"/>
    {mimeMessageLines.map(([line, shaded], index) => <g key={index} fontFamily="monospace">
      {shaded && <rect x="26" y={17 + index * 20} width={line.length * 15} height="19" stroke="none" fill="var(--selected-surface)"/>}
      <Label x={26} y={32 + index * 20} left>{line.includes('delimiter') ?
        <>{line.split('delimiter')[0]}<tspan textDecoration="underline" fontStyle="italic">delimiter</tspan>{line.split('delimiter')[1]}</> : line}</Label>
    </g>)}
    <Label x={18} y={307} left>注記　網掛けは，その位置に格納される情報の種類を表している。</Label>
  </>}</Drawing>;
}

function MimeContent({ caption, values }: BookletFigureProps) {
  return <Drawing caption={caption} alt={linesAlt(values)} width={190} height={93}>{() => <>
    <rect x="15" y="10" width="160" height="72"/>
    <g fontFamily="monospace">{mimeLines(values[0]).lines.map((line, i) =>
      <Label x={23} y={30 + i * 20} left key={i}>{line}</Label>)}</g>
  </>}</Drawing>;
}

function Incident({ caption }: BookletFigureProps) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={incidentAlt()}>
    <div className="table-scroll" tabIndex={0}>
      <table aria-label={caption}>
        <thead><tr><th scope="col">対象</th><th scope="col">対策と対応</th></tr></thead>
        <tbody>{incidentResponseRows.map(([target, actions]) => <tr key={target}>
          <th scope="row" style={{ whiteSpace: 'nowrap' }}>{target}</th>
          <td><div className="table-cell-prose">{actions.split('\n').map(action => <div key={action}>{action}</div>)}</div></td>
        </tr>)}</tbody>
      </table>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2012AutumnPm0104FigureRenderers: readonly BookletFigureRenderer[] = [
  { profile: profiles.shared, component: Shared },
  { profile: profiles.sync, component: Sync },
  { profile: profiles.purchase, component: Purchase },
  { profile: profiles.message, component: MimeMessage },
  { profile: profiles.mimeLines, component: MimeContent },
  { profile: profiles.incident, component: Incident },
];
