import type { CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2014AutumnPm0913Figures, type Autumn2014PmLanguagePanel } from '../core/generators/legacy-2014-autumn-pm-09-13-figures';

const gridCell: CSSProperties = { border:'1px solid var(--diagram-border)',padding:'.16em .38em',whiteSpace:'pre' };
const chartCell: CSSProperties = { padding:'0 .25em',minWidth:'2.3ch',textAlign:'end',fontFamily:'monospace',lineHeight:1.1 };
function PanelTable({item}: {item:Autumn2014PmLanguagePanel['tables'][number]}) {
  const cellStyle = item.chart ? chartCell : gridCell;
  const headers = item.headers && <tr>{item.headers.map((cell,i)=><th key={i} scope="col" style={cellStyle}>{cell.text}</th>)}</tr>;
  return <table style={{borderCollapse:'collapse',fontSize:'calc(1em * var(--image-scale, 1))',marginBlockEnd:'.45em'}}>
    {item.label && <caption>{item.label}</caption>}
    {!item.chart && headers && <thead>{headers}</thead>}
    <tbody>{item.rows.map((row,r)=><tr key={r}>{row.map((cell,c)=>{
      const style = cell.shaded ? {...cellStyle,background:'var(--diagram-surface)'} : cellStyle;
      const value = cell.code ? <pre style={{margin:0,whiteSpace:'pre'}}><code>{cell.text}</code></pre> : cell.text;
      return item.rowHead && c===0 ? <th key={c} scope="row" style={style}>{value}</th>
        : <td key={c} colSpan={cell.colSpan} style={style}>{value}</td>;
    })}</tr>)}</tbody>
    {item.chart && headers && <tfoot>{headers}</tfoot>}
  </table>;
}
export const legacy2014AutumnPm0913FigureRenderers: BookletFigureRenderer[] = legacy2014AutumnPm0913Figures.map(figure=>({
  profile:figure.profile,
  component:({values,caption})=>{
    const panel=figure.panel(values);
    return <figure className="managed-diagram source-figure">
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{color:'var(--diagram-ink)'}}>
        <div style={panel.adjacent ? {display:'flex',gap:'.6em',width:'max-content'} : undefined}>
          {panel.tables.map((item,i)=><PanelTable key={i} item={item}/>)}
        </div>
        {panel.notes?.map(note=><p key={note}>{note}</p>)}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>;
  },
}));
