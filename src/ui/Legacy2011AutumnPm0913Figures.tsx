import type { CSSProperties } from 'react';
import { legacy2011AutumnPm0913Figures as figures } from '../core/generators/legacy-2011-autumn-pm-09-13-figures';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';

const scaled = 'calc(1em * var(--image-scale, 1))';
const cell: CSSProperties = { border: '1px solid var(--diagram-border)', padding: '.22em .42em', whiteSpace: 'pre', textAlign: 'center', verticalAlign: 'top' };
const pre: CSSProperties = { margin: 0, whiteSpace: 'pre', fontSize: scaled, textAlign: 'left' };
const table: CSSProperties = { borderCollapse: 'collapse', fontSize: scaled };

export const legacy2011AutumnPm0913FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile,
  component({ values, caption }) {
    const panel = figure.panel(values), alt = figure.alt(values);
    return <figure className="managed-diagram source-figure" data-figure-profile={figure.profile}
      role="group" aria-label={caption} aria-description={alt}>
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>
        {panel.kind === 'output'
          ? <table style={table} aria-label={caption}><tbody><tr><td style={cell}>
            <pre style={pre}><code>{panel.text}</code></pre>
          </td></tr></tbody></table>
          : panel.kind === 'grids' && <div style={{ display: 'grid', gap: '.4em', width: 'max-content', justifyItems: 'start' }}>
            {panel.tables.map(({ headers, rows, caption: title }, i) => <table key={i} style={table} aria-label={title ?? caption}>
              {title && <caption>{title}</caption>}
              <thead><tr>{headers.map((label, column) => <th scope="col" key={column} style={cell}>{label}</th>)}</tr></thead>
              <tbody>{rows.map(([label, ...entries], row) => <tr key={row}>
                <th scope="row" style={cell}>{label}</th>
                {entries.map((entry, column) => <td key={column} style={cell}>
                  {headers[column + 1] === '変更内容' ? <pre style={pre}><code>{entry}</code></pre> : entry}
                </td>)}
              </tr>)}</tbody>
            </table>)}
          </div>}
        {panel.note && <p style={{ margin: '.35em 0 0', fontSize: scaled }}>注記 {panel.note}</p>}
      </div>
    </figure>;
  },
}));
