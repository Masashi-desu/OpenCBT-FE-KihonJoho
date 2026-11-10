import { useId, type CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2013AutumnPm0913Figures, type FigureTable } from '../core/generators/legacy-2013-autumn-pm-09-13-figures';

const cellStyle: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.18em .42em', whiteSpace: 'pre' };
const headingStyle: CSSProperties = { ...cellStyle, background: 'var(--diagram-surface)' };
const size = (width: number) => 'calc(' + width + 'px * var(--image-scale, 1))';

function LanguageTable({ table }: { table: FigureTable }) {
  const rows = (data: FigureTable['rows'], heading: boolean) => data.map((row, i) => (
    <tr key={i}>{row.map((entry, j) => {
      const { text, cols, rows, omitted } = typeof entry === 'string' ? { text: entry, cols: undefined, rows: undefined, omitted: false } : entry;
      if (heading || (table.sheet && j === 0))
        return <th key={j} colSpan={cols} rowSpan={rows} scope={heading ? (cols ? 'colgroup' : 'col') : 'row'} style={table.sheet ? headingStyle : cellStyle}>{text}</th>;
      if (omitted) return <td key={j} className="omitted-cell" style={cellStyle}><span className="sr-only">{text}</span></td>;
      return <td key={j} colSpan={cols} rowSpan={rows} style={cellStyle}>{text}</td>;
    })}</tr>
  ));
  return <table style={{ borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))' }}>
    {table.label && <caption>{table.label}</caption>}
    {table.head && <thead>{rows(table.rows.slice(0, table.head), true)}</thead>}
    <tbody>{rows(table.rows.slice(table.head ?? 0), false)}</tbody>
  </table>;
}

function CourtDrawing({ left, right, caption, alt }: { left: number[]; right: number[]; caption: string; alt: string }) {
  const id = useId();
  return <svg viewBox="0 0 455 200" width={size(455)} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
    <g fill="none" stroke="currentColor">
      <rect x="10" y="10" width="435" height="180" />
      <path d="M225 10V190M230 10V190" />
    </g>
    <g fill="currentColor" textAnchor="middle" dominantBaseline="middle" fontSize="18">
      <text x="206" y="100" writingMode="vertical-rl">フェンス</text>
      {[left, right].map((side, i) => side.map((number, j) => {
        const x = i === 0 ? 30 : 266, y = j === 0 ? 28 : 109;
        return <g key={number} data-court={number} data-side={i === 0 ? 'left' : 'right'}>
          <rect x={x} y={y} width="155" height="62" fill="none" stroke="currentColor" />
          <text x={x + 77.5} y={y + 31}>{number}番コート</text>
        </g>;
      }))}
    </g>
  </svg>;
}

const treePoints = [[263, 32], [166, 105], [360, 105], [109, 180], [224, 180], [360, 180], [55, 255], [163, 255]];
function DirectoryDrawing({ names, edges, caption, alt }: { names: string[]; edges: number[][]; caption: string; alt: string }) {
  const id = useId();
  return <svg viewBox="0 0 432 284" width={size(432)} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
    <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="8" refY="5" orient="auto">
      <path d="M1 1 9 5 1 9" fill="none" stroke="currentColor" />
    </marker></defs>
    <g fill="none" stroke="currentColor">
      {edges.map(([from, to]) => {
        const [x1, y1] = treePoints[from], [x2, y2] = treePoints[to];
        return <line key={to} data-directory-edge={from + '-' + to}
          x1={x1 + (x2 - x1) * .21} y1={y1 + 17} x2={x2 - (x2 - x1) * .21} y2={y2 - 17} markerEnd={'url(#' + id + '-arrow)'} />;
      })}
      {treePoints.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="44" ry="17" />)}
    </g>
    <g fill="currentColor" textAnchor="middle" dominantBaseline="middle" fontSize="16">
      {names.map((name, i) => <text key={i} x={treePoints[i][0]} y={treePoints[i][1]} data-directory={i}>“{name}”</text>)}
    </g>
  </svg>;
}

function ConversionDrawing({ caption, alt }: { caption: string; alt: string }) {
  const id = useId();
  return <svg viewBox="0 0 325 164" width={size(325)} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
    <g stroke="currentColor" fill="none">
      <rect x="115" y="12" width="172" height="43" />
      <path d="M158 12V55M201 12V55M244 12V55" />
      <path d="M132 60V111M125 102l7 9 7-9M153 111V60M146 69l7-9 7 9" />
      <rect x="115" y="117" width="43" height="39" />
    </g>
    <g fill="currentColor" textAnchor="middle" dominantBaseline="middle" fontSize="18">
      <text x="85" y="34">時間</text>
      {['m₁', 'm₂', 's₁', 's₂'].map((digit, i) => <text key={digit} x={136.5 + i * 43} y="34">{digit}</text>)}
      <text x="92" y="85">TOSEC</text><text x="202" y="85">TOTIME</text>
      <text x="94" y="136">秒</text>
    </g>
  </svg>;
}

export const legacy2013AutumnPm0913FigureRenderers: BookletFigureRenderer[] =
  legacy2013AutumnPm0913Figures.map(figure => ({
    profile: figure.profile,
    component: ({ values, caption }) => {
      const panel = figure.panel(values), alt = figure.alt(values);
      return <figure className="managed-diagram source-figure" data-autumn-2013-language-figure={figure.profile}>
        <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption} aria-description={alt} style={{ color: 'var(--diagram-ink)' }}>
          {panel.kind === 'tables' && <div style={{ display: 'flex', alignItems: 'start', gap: '1.25em', width: 'max-content' }}>
            {panel.tables.map((table, index) => <LanguageTable key={index} table={table} />)}
          </div>}
          {panel.kind === 'tables' && panel.note && <p>{panel.note}</p>}
          {panel.kind === 'fence' && <CourtDrawing {...panel} caption={caption} alt={alt} />}
          {panel.kind === 'tree' && <DirectoryDrawing {...panel} caption={caption} alt={alt} />}
          {panel.kind === 'conversion' && <ConversionDrawing caption={caption} alt={alt} />}
          {panel.kind === 'output' && <pre style={{ width: 'max-content', border: '1px solid var(--diagram-border)', padding: '.42em .65em',
            fontSize: 'calc(1em * var(--image-scale, 1))' }}><code>{panel.lines.join('\n')}</code></pre>}
        </div>
        <figcaption>{caption}</figcaption>
      </figure>;
    },
  }));
