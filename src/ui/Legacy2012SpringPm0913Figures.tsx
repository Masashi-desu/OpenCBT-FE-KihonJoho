import { useId, type CSSProperties } from 'react';
import { legacy2012SpringPm0913Figures as figures } from '../core/generators/legacy-2012-spring-pm-09-13-figures';
import type { LanguageFigurePanel } from '../core/generators/legacy-2012-spring-pm-09-13-support';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';

const scaled = 'calc(1em * var(--image-scale, 1))';
const cell: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.22em .42em', whiteSpace: 'pre', textAlign: 'center' };
const pre: CSSProperties = { margin: 0, whiteSpace: 'pre', fontSize: scaled };
const table: CSSProperties = { borderCollapse: 'collapse', fontSize: scaled };

function Digits({ panel, caption, alt }: { panel: Extract<LanguageFigurePanel, { kind: 'digits' }>; caption: string; alt: string }) {
  const id = useId();
  const pair = panel.layout === 'pair';
  const width = pair ? 416 : 270, height = pair ? 156 : 246;
  const finalY = pair ? 124 : 210;
  const group = (value: string, label: string, x: number, y: number) =>
    <g key={label} data-digit-row={label}>
      <text x={x - 4} y={y + 16} textAnchor="end" fill="currentColor">{label}</text>
      {[...value].map((digit, i) => <g key={i}>
        <rect x={x + i * 22} y={y} width="22" height="24" fill="none" stroke="currentColor" />
        <text x={x + i * 22 + 11} y={y + 16} textAnchor="middle" fill="currentColor">{`'${digit}'`}</text>
      </g>)}
    </g>;
  return <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
    style={{ display: 'block', width: `calc(${width}px * var(--image-scale, 1))`, height: 'auto', maxWidth: 'none' }}>
    <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{alt}</desc>
    <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
    </marker></defs>
    <g aria-hidden="true" fontSize="14">
      {panel.inputs.map((value, i) => group(value, '数字列' + (i + 1), pair ? 88 + i * 215 : 101, pair ? 18 : 14 + i * 31))}
      {pair && <>
        <path d="M132 45L206 94L330 45" fill="none" stroke="currentColor"/>
        <text x="187" y="74" fill="currentColor">加算</text>
      </>}
      <path d={pair ? 'M206 94V122' : 'M131 165V208'} fill="none" stroke="currentColor" markerEnd={`url(#${id}-arrow)`}/>
      {group(panel.output, pair ? '結果領域' : '総和', pair ? 151 : 101, finalY)}
    </g>
  </svg>;
}

export const legacy2012SpringPm0913FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile,
  component({ values, caption }) {
    const panel = figure.panel(values), alt = figure.alt(values);
    return <figure className="managed-diagram source-figure" data-figure-profile={figure.profile}
      role="group" aria-label={caption} aria-description={alt}>
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>
        {panel.kind === 'digits' ? <Digits panel={panel} caption={caption} alt={alt}/> : panel.kind === 'output'
          ? <table style={table} aria-label={caption}><tbody><tr><td style={{ ...cell, textAlign: 'left' }}>
            <pre style={pre}><code>{panel.text}</code></pre>
          </td></tr></tbody></table>
          : <div style={{ display: 'grid', gap: '.4em', width: 'max-content', justifyItems: 'start' }}>
            {panel.tables.map(({ headers, rows, caption: title }, i) => <table key={i} style={table} aria-label={title ?? caption}>
              {title && <caption>{title}</caption>}
              <thead><tr>{headers.map((label, column) => <th scope="col" key={column} style={cell}>{label}</th>)}</tr></thead>
              <tbody>{rows.map(([label, ...entries], row) => <tr key={row}>
                <th scope="row" style={cell}>{label}</th>
                {entries.map((entry, column) => <td key={column} style={entry.includes('\n') ? { ...cell, textAlign: 'left', fontFamily: 'monospace' } : cell}>{entry}</td>)}
              </tr>)}</tbody>
            </table>)}
          </div>}
        {panel.note && <p style={{ margin: '.35em 0 0', fontSize: scaled }}>注記 {panel.note}</p>}
      </div>
    </figure>;
  },
}));
