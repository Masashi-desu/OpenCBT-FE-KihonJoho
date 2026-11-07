import { Fragment, useId, type CSSProperties, type ReactNode } from 'react';
import { legacy2015AutumnPm0913Figures } from '../core/generators/legacy-2015-autumn-pm-09-13-figures';
import type { LanguagePanel, Worksheet } from '../core/generators/legacy-2015-autumn-pm-09-13-support';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';

const ink = 'var(--diagram-ink)';
const border = '1px solid currentColor';
const tableStyle = { borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))' } as const;
const cellStyle = { border, padding: '.2em .4em', whiteSpace: 'nowrap', verticalAlign: 'top' } as const;
const preStyle = { margin: 0, whiteSpace: 'pre', fontSize: 'calc(1em * var(--image-scale, 1))' } as const;

function Drawing({ width, height, alt, children }: { width: number; height: number; alt: string; children: ReactNode }) {
  return <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label={alt}
    style={{ display: 'block', width: 'calc(' + width + 'px * var(--image-scale, 1))', maxWidth: 'none', color: ink }}>
    {children}
  </svg>;
}

function FloorPlan({ alt }: { alt: string }) {
  return <Drawing width={560} height={156} alt={alt}>
    <g fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M14 121V18H546V121H226 M14 121H49 M71 121H189 M211 121H226 M226 18V27 M226 48V93 M226 114V121 M408 18V74 M408 74H418 M437 74H546"/>
      <path d="M49 118H71 M49 124H71 M189 118H211 M189 124H211 M223 27V48 M229 27V48 M223 93V114 M229 93V114 M418 71H437 M418 77H437"/>
    </g>
    <g fill="currentColor" textAnchor="middle">
      <text x="118" y="61">システム課オフィス</text><text x="118" y="83">（レベル1）</text>
      <text x="323" y="61">マシンルーム</text><text x="323" y="83">（レベル2）</text>
      <text x="478" y="41">ライブラリ</text><text x="478" y="63">（レベル3）</text>
      <text x="60" y="142">11</text><text x="200" y="142">12</text>
      <text x="208" y="42">21</text><text x="208" y="108">22</text><text x="427" y="94">31</text>
      <text x="127" y="142">外部（レベル0）</text>
    </g>
  </Drawing>;
}

function CacheDiagram({ alt }: { alt: string }) {
  return <Drawing width={480} height={205} alt={alt}>
    <g fill="none" stroke="currentColor" strokeWidth={1.5}>
      <ellipse cx="187" cy="24" rx="79" ry="17" strokeDasharray="6 3"/>
      <rect x="112" y="67" width="150" height="30"/>
      <rect x="326" y="67" width="107" height="30"/>
      <rect x="20" y="131" width="339" height="38"/>
      <path d="M29 137H314V163H29Z M124 137V163 M219 137V163"/>
      <path d="M179 66V54H170L187 42L204 54H195V66Z M179 130V116H170L187 103L204 116H195V130Z"/>
      <path d="M265 82L278 70V76H311V70L324 82L311 94V88H278V94Z"/>
    </g>
    <g fill="currentColor" textAnchor="middle">
      <text x="187" y="29">アプリケーション</text>
      <text x="187" y="87">ブロックアクセサ</text><text x="379" y="87">キャッシュ</text>
      <text x="76" y="155">ブロック[0]</text><text x="171" y="155">ブロック[1]</text><text x="266" y="155">ブロック[2]</text>
      <text x="338" y="155">…</text><text x="187" y="185">ブロックデバイス</text>
      <text x="187" y="203">（[]内はブロックのインデックス値）</text>
    </g>
  </Drawing>;
}

function BitDiagram({ alt, long }: { alt: string; long: boolean }) {
  const arrow = useId();
  const lanes: { label: string; x: number; width: number; text?: string; labelX?: number }[] = long
    ? [{ label: 'ビット列X', x: 256, width: 38, text: 'x', labelX: 249 },
      { label: 'ビット列Y', x: 122, width: 342 }, { label: 'ビット列Z', x: 122, width: 380 }]
    : [{ label: 'ビット列A', x: 122, width: 110, text: 'a' },
      { label: 'ビット列B', x: 122, width: 110 }, { label: 'ビット列C', x: 122, width: 220 }];
  const arrows = long
    ? [[256, 47, 276, 81], [294, 47, 276, 81], [122, 111, 122, 149], [276, 111, 276, 149], [276, 111, 314, 149], [464, 111, 502, 149]]
    : [[122, 47, 190, 81], [232, 47, 190, 81], [122, 111, 122, 149], [190, 111, 190, 149], [190, 111, 300, 149], [232, 111, 342, 149]];
  const boundary = long ? 276 : 190;
  return <Drawing width={long ? 530 : 370} height={long ? 212 : 185} alt={alt}>
    <defs><marker id={arrow} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M0 1L6 3.5L0 6" fill="none" stroke="currentColor"/>
    </marker></defs>
    <g fill="none" stroke="currentColor" strokeWidth={1.2}>
      {lanes.map(({ label, x, width }, index) => <rect key={label} x={x} y={[17, 81, 149][index]} width={width} height={30}/>)}
      {arrows.map(([x1, y1, x2, y2], index) =>
        <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={'url(#' + arrow + ')'} />)}
      <path d={'M122 114Q122 120 132 120H' + ((122 + boundary) / 2 - 7) +
        'Q' + (122 + boundary) / 2 + ' 120 ' + (122 + boundary) / 2 + ' 128Q' + (122 + boundary) / 2 + ' 120 ' +
        ((122 + boundary) / 2 + 7) + ' 120H' + (boundary - 9) + 'Q' + boundary + ' 120 ' + boundary + ' 114'}/>
      <path strokeDasharray="4 3" d={long
        ? 'M276 81V111 M276 149V179 M314 149V179'
        : 'M190 81V111 M190 149V179 M300 149V179'}/>
      {long && <>
        <path d="M160 81V111 M198 81V111 M256 81V111 M294 81V111 M332 81V111 M388 81V111 M426 81V111 M160 149V179 M198 149V179 M256 149V179 M294 149V179 M332 149V179 M370 149V179 M426 149V179 M464 149V179"/>
        <path d="M198 81H256 M198 111H256 M332 81H388 M332 111H388 M198 149H256 M198 179H256 M370 149H426 M370 179H426"
          stroke="var(--diagram-surface)" strokeWidth={3}/>
        <path d="M198 81H256 M198 111H256 M332 81H388 M332 111H388 M198 149H256 M198 179H256 M370 149H426 M370 179H426" strokeDasharray="2 2"/>
      </>}
    </g>
    <g fill="currentColor">
      {lanes.map(({ label, x, width, text, labelX }, index) => <Fragment key={label}>
        <text x={labelX ?? 116} y={[37, 101, 169][index]} textAnchor="end">{label}</text>
        {text && <text x={x + width / 2} y={37} textAnchor="middle">{text}</text>}
      </Fragment>)}
      <text x={(122 + boundary) / 2} y="143" textAnchor="middle">{long ? 'm' : 'n'}</text>
      {long ? <>
        <text x="295" y="169" textAnchor="middle">x</text>
        <text x="128" y="200">語1</text><text x="164" y="200">語2</text>
        <text x="429" y="200">語N</text><text x="468" y="200">語N+1</text>
      </> : <>
        <text x="149" y="101">b1</text><text x="202" y="101">b2</text>
        <text x="149" y="169">b1</text><text x="241" y="169">a</text><text x="313" y="169">b2</text>
      </>}
    </g>
  </Drawing>;
}

function WorksheetTable({ sheet }: { sheet: Worksheet }) {
  const merges = sheet.merges ?? [];
  return <table style={tableStyle} data-sheet-columns={sheet.columns.length - 1}>
    <colgroup>{sheet.columns.map((label, index) => <col key={label} style={{ width: sheet.widths[index] + 'ch' }}/>)}</colgroup>
    <thead><tr>{sheet.columns.map(label => <th key={label} scope="col" style={cellStyle}>{label}</th>)}</tr></thead>
    <tbody>{sheet.rows.map((row, r) => <tr key={r}>
      {row.map((value, column) => {
        const merge = merges.find(range => range.row === r && range.column === column);
        if (!merge && merges.some(range => r >= range.row && r < range.row + range.rowSpan &&
          column >= range.column && column < range.column + range.colSpan)) return null;
        const style: CSSProperties = column === sheet.spacerColumn
          ? { ...cellStyle, borderTop: 'none', borderBottom: 'none' }
          : { ...cellStyle, textAlign: /^-?[\d,]+$/.test(value) ? 'right' : undefined };
        if (column === 0) return <th key={column} scope="row" style={style}>{value}</th>;
        return <td key={column} style={style} rowSpan={merge?.rowSpan} colSpan={merge?.colSpan}>{value}</td>;
      })}
    </tr>)}</tbody>
  </table>;
}

function RecordTable({ panel }: { panel: Extract<LanguagePanel, { kind: 'record' }> }) {
  const rows: [string, string[][]][] = [
    ['桁数', panel.widths.map(group => group.map(width => width + '桁'))], ['データ例', panel.example],
  ];
  return <table style={tableStyle}>
    <thead><tr><th scope="col" style={cellStyle}>項目名</th>{panel.labels.map((label, index) =>
      <th key={label} scope="col" colSpan={panel.widths[index].length} style={cellStyle}>{label}</th>)}</tr></thead>
    <tbody>{rows.map(([label, groups]) =>
      <tr key={label}><th scope="row" style={cellStyle}>{label}</th>{groups.flatMap((group, i) => group.map((text, j) =>
        <td key={i + '-' + j} style={{ ...cellStyle, borderLeftStyle: j ? 'dashed' : undefined, borderRightStyle: j < group.length - 1 ? 'dashed' : undefined }}>{text}</td>))}</tr>)}</tbody>
  </table>;
}

function FixedOutput({ rows }: { rows: Extract<LanguagePanel, { kind: 'fixed-output' }>['rows'] }) {
  const rowStyle = { display: 'grid', gridTemplateColumns: '18ch 20ch 20ch minmax(18ch, auto)' };
  return <div style={{ ...preStyle, fontFamily: 'monospace', border, padding: '.3em .5em', width: 'max-content' }}>
    <div style={rowStyle}>{['1 …', '19 …', '39 …', '59 …'].map(label => <span key={label}>{label}</span>)}</div>
    <div style={rowStyle}>{['カードID 名前', 'レベル1', 'レベル2', 'レベル3'].map(label => <span key={label}>{label}</span>)}</div>
    {rows.map(({ id, name, level, text }, index) => <div key={index} style={{ ...rowStyle, marginTop: id && index > 0 ? '1em' : undefined }}>
      <span>{id ? id + '  ' + name : ''}</span>
      {[1, 2, 3].map(column => <span key={column}>{level === column ? text : ''}</span>)}
    </div>)}
  </div>;
}

function Panel({ panel }: { panel: LanguagePanel }) {
  switch (panel.kind) {
    case 'room': return <FloorPlan alt={panel.alt}/>;
    case 'cache': return <CacheDiagram alt={panel.alt}/>;
    case 'insert-word': case 'insert-words': return <BitDiagram alt={panel.alt} long={panel.kind === 'insert-words'}/>;
    case 'worksheet': return <WorksheetTable sheet={panel.sheet}/>;
    case 'record': return <RecordTable panel={panel}/>;
    case 'fixed-output': return <><FixedOutput rows={panel.rows}/><p>{panel.note}</p></>;
    case 'code': return <><pre style={{ ...preStyle, border, padding: '.3em .5em', width: 'max-content' }}><code>{panel.lines.join('\n')}</code></pre>{panel.note && <p>{panel.note}</p>}</>;
    case 'grid': case 'change-table': return <>
      <table style={tableStyle}>
        {panel.columns.length > 0 && <thead><tr>{panel.columns.map(label => <th key={label} style={cellStyle} scope="col">{label}</th>)}</tr></thead>}
        <tbody>{panel.rows.map((row, i) => <tr key={i}>{row.map((text, j) => <td key={j}
          style={panel.kind === 'grid' && panel.dashed ? {
            ...cellStyle, borderTopStyle: i > 0 ? 'none' : undefined, borderBottomStyle: i + 1 < panel.rows.length ? 'none' : undefined,
            borderLeftStyle: j > 0 ? 'dashed' : undefined, borderRightStyle: j + 1 < row.length ? 'dashed' : undefined, fontFamily: 'monospace',
          } : cellStyle}>
          {panel.kind === 'change-table' && j === 1 ? <pre style={preStyle}><code>{text}</code></pre> : text}
        </td>)}</tr>)}</tbody>
      </table>
      {panel.note && <p>{panel.note}</p>}
    </>;
  }
}

export const legacy2015AutumnPm0913FigureRenderers: BookletFigureRenderer[] = legacy2015AutumnPm0913Figures.map(figure => ({
  profile: figure.profile,
  component: ({ values, caption }) => {
    const panel = figure.panel(values);
    return <figure className="managed-diagram source-figure">
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: ink }}>
        <Panel panel={panel}/>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>;
  },
}));
