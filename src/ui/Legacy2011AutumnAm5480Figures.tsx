import type { CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2011AutumnAm5480Figures as figures } from '../core/generators/legacy-2011-autumn-am-54-80-figures';

const cell: CSSProperties = {
  border: '1px solid var(--diagram-border)', padding: '.25em .55em', whiteSpace: 'nowrap', textAlign: 'center',
};
const tableStyle: CSSProperties = { borderCollapse: 'collapse', fontSize: 'calc(1em * var(--image-scale, 1))' };

export const legacy2011AutumnAm5480FigureRenderers: readonly BookletFigureRenderer[] = figures.map(figure => ({
  profile: figure.profile,
  component({ values, caption }) {
    const { columns, rows, note } = figure.table(values);
    const twoHeaderColumns = figure.profile === figures[0].profile;
    return <figure className="managed-diagram source-figure" data-figure-profile={figure.profile}
      role="group" aria-label={caption} aria-description={figure.alt(values)}>
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{ color: 'var(--diagram-ink)' }}>
        <table style={tableStyle} aria-label={caption}>
          {note && <caption style={{ textAlign: 'right' }}>{note}</caption>}
          <thead><tr>{columns.map((label, column) =>
            label ? <th key={column} style={cell} scope="col">{label}</th> : <td key={column} />)}</tr></thead>
          <tbody>{rows.map(([header, ...entries]) => {
            const summary = twoHeaderColumns && entries[0] === '';
            return <tr key={header}>
              <th scope="row" colSpan={summary ? 2 : 1} style={cell}>{header}</th>
              {(summary ? entries.slice(1) : entries).map((entry, i) => <td key={i} style={cell}>{entry}</td>)}
            </tr>;
          })}</tbody>
        </table>
      </div>
    </figure>;
  },
}));
