import type { CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2014SpringPm0913Figures, type Spring2014PmLanguagePanel } from '../core/generators/legacy-2014-spring-pm-09-13-figures';

const cellStyle:CSSProperties={border:'1px solid var(--diagram-border)',padding:'.16em .38em',whiteSpace:'pre'};
const sheetHeading:CSSProperties={...cellStyle,background:'var(--diagram-surface)'};

function PanelTable({table}:{table:Spring2014PmLanguagePanel['tables'][number]}) {
  return <table style={{borderCollapse:'collapse',fontSize:'calc(1em * var(--image-scale, 1))',marginBlockEnd:'.45em'}}>
    {table.label && <caption>{table.label}</caption>}
    {table.columns && <thead><tr>{table.columns.map((cell,i)=><th key={i} scope="col" style={table.worksheet?sheetHeading:cellStyle}>{cell}</th>)}</tr></thead>}
    <tbody>{table.rows.map((row,r)=><tr key={r}>{row.map((cell,c)=>{
      const value=table.mono?<pre style={{margin:0,whiteSpace:'pre'}}><code>{cell}</code></pre>:cell;
      if(table.worksheet&&c===0) return <th key={c} scope="row" style={sheetHeading}>{value}</th>;
      if(table.worksheet&&r===0) return <th key={c} scope="col" style={cellStyle}>{value}</th>;
      return <td key={c} style={cellStyle}>{value}</td>;
    })}</tr>)}</tbody>
  </table>;
}

export const legacy2014SpringPm0913FigureRenderers:BookletFigureRenderer[] = legacy2014SpringPm0913Figures.map(figure=>({
  profile:figure.profile,
  component:({values,caption})=>{
    const panel=figure.panel(values);
    return <figure className="managed-diagram source-figure" data-spring-2014-language-figure={figure.profile}>
      <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption} aria-description={figure.alt(values)} style={{color:'var(--diagram-ink)'}}>
        {panel.tables.map((table,i)=><PanelTable key={i} table={table}/>)}
        {panel.notes?.map(note=><p key={note}>{note}</p>)}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>;
  },
}));
