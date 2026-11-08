import type { CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2015SpringPm0913Figures, type SpringPmCell, type SpringPmTable } from '../core/generators/legacy-2015-spring-pm-09-13-figures';

const cellStyle: CSSProperties = { border:'1px solid var(--diagram-border)', padding:'.18em .38em', whiteSpace:'nowrap' };
const tableStyle: CSSProperties = { borderCollapse:'collapse', marginBlockEnd:'.6em', fontSize:'calc(1em * var(--image-scale, 1))' };
const preStyle: CSSProperties = { margin:0, whiteSpace:'pre' };
function contents(cell: SpringPmCell) {
  return cell.code ? <pre style={preStyle}><code>{cell.text}</code></pre> : cell.text;
}
function FigureTable({table}: {table:SpringPmTable}) {
  const hasTwoHeaderRows = Boolean(table.headers?.some(value => value.rowSpan === 2));
  const rows = hasTwoHeaderRows ? table.rows.slice(1) : table.rows;
  return <table style={tableStyle}>
    {table.label && <caption>{table.label}</caption>}
    {table.headers && <thead>
      <tr>{table.headers.map((value,i) => <th key={i} scope={value.colSpan ? 'colgroup' : 'col'}
        colSpan={value.colSpan} rowSpan={value.rowSpan} style={{ ...cellStyle, background:'var(--diagram-surface)' }}>{contents(value)}</th>)}</tr>
      {hasTwoHeaderRows && <tr>{table.rows[0].map((value,i) => <th key={i} scope="col" style={cellStyle}>{contents(value)}</th>)}</tr>}
    </thead>}
    <tbody>{rows.map((row,r) => <tr key={r}>{row.map((value,c) => {
      const style = value.shaded ? {...cellStyle,background:'var(--diagram-surface)'} : cellStyle;
      return table.rowHeading && c === 0
        ? <th key={c} scope="row" style={style}>{contents(value)}</th>
        : <td key={c} style={style} colSpan={value.colSpan} rowSpan={value.rowSpan} aria-label={value.shaded ? '網掛け' : undefined}>{contents(value)}</td>;
    })}</tr>)}</tbody>
  </table>;
}
export const legacy2015SpringPm0913FigureRenderers: BookletFigureRenderer[] = legacy2015SpringPm0913Figures.map(figure => ({
  profile: figure.profile,
  component: ({values,caption}) => {
    const panel = figure.panel(values);
    return <figure className="managed-diagram source-figure">
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{color:'var(--diagram-ink)'}}>
        {panel.tables.map((table,i) => <FigureTable key={i} table={table}/>)}
        {panel.note && <p>{panel.note}</p>}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>;
  },
}));
