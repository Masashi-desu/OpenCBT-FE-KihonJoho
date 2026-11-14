import React from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2007AutumnPm1013Figures as figures } from '../core/generators/legacy-2007-autumn-pm-10-13-figures';

const tableStyle = { borderCollapse: 'collapse', width: 'max-content', whiteSpace: 'nowrap' } as const;
const codeStyle = { margin: 0, fontFamily: 'monospace', fontSize: '1em', whiteSpace: 'pre' } as const;
function LanguageFigure({ caption, values, figure }: BookletFigureProps & { figure: typeof figures[number] }) {
  const panel = figure.panel(values);
  return <figure className="managed-diagram source-figure" style={{ minWidth: 0, maxWidth: '100%' }}>
    <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption} aria-description={panel.alt} data-figure-profile={figure.profile}
      style={{ color: 'var(--diagram-ink)', fontSize: 'calc(16px * var(--image-scale, 1))' }}>
      {panel.kind === 'matrix' ? <table aria-label={caption} style={{ ...tableStyle, textAlign: 'center' }}>
        <thead><tr><th scope="col">ビット番号</th>
          {Array.from({ length: 16 }, (_, index) => <th scope="col" key={index} style={{ textAlign: 'center' }}>{15 - index}</th>)}</tr></thead>
        <tbody>{panel.rows.map((row, i) => <tr key={i}>
          <th scope="row" style={{ textAlign: 'right', paddingInline: '0.25em' }}>{i === 0 ? '(GR1) → ' : ''}語{i}</th>
          {row.map((bit, j) => <td key={j} data-shaded={panel.shades[i][j] || undefined}
            style={{ textAlign: 'center', minWidth: '1.4em', padding: '0.03em 0.12em', border: '1px solid currentColor',
              backgroundColor: panel.shades[i][j] ? 'var(--selected-surface)' : undefined }}>{bit}</td>)}
        </tr>)}</tbody>
      </table> : panel.kind === 'table' ? <table aria-label={caption} style={tableStyle}>
        <thead><tr>{panel.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
        <tbody>{panel.rows.map((row, i) => <tr key={i}>{row.map((cell, j) =>
          <td key={j}>{j === panel.codeColumn ? <pre style={codeStyle}>{cell}</pre> : cell}</td>)}</tr>)}</tbody>
      </table> : <pre style={{ ...codeStyle, padding: '0.25em 0.5em', border: '1px solid currentColor', width: 'max-content' }}>{panel.text}</pre>}
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2007AutumnPm1013FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile, component: props => <LanguageFigure {...props} figure={figure} />,
}));
