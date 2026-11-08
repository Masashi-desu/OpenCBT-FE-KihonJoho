import type { CSSProperties } from 'react';
import type { BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2014Am77Alt, autumn2014Am77Profile, autumn2014Am77Tables } from '../core/generators/legacy-2014-autumn-am-54-80-figures';
import { selectCase } from '../core/generators/legacy-2016-autumn-pm-09-13-support';

const cell: CSSProperties = { border:'1px solid var(--diagram-border)', padding:'.22em .65em', whiteSpace:'nowrap', textAlign:'center' };
export const legacy2014AutumnAm5480Renderers: BookletFigureRenderer[] = [{
  profile:autumn2014Am77Profile,
  component:({values,caption})=>{
    const rows=autumn2014Am77Tables[selectCase(values,autumn2014Am77Tables.length)];
    return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={autumn2014Am77Alt(values)}>
      <div className="diagram-scroll" tabIndex={0} aria-label={caption} style={{color:'var(--diagram-ink)'}}>
        <table aria-label="A社とB社の市場シェア" style={{borderCollapse:'collapse',fontSize:'calc(1em * var(--image-scale, 1))'}}>
          <caption style={{textAlign:'end'}}>単位 ％</caption>
          <colgroup span={2}/><colgroup span={2}/>
          <thead>
            <tr><td colSpan={2} rowSpan={2}/><th scope="colgroup" colSpan={2} style={cell}>B社</th></tr>
            <tr><th scope="col" style={cell}>戦略b1</th><th scope="col" style={cell}>戦略b2</th></tr>
          </thead>
          <tbody>{rows.map((row,index)=><tr key={index}>
            {index===0&&<th scope="rowgroup" rowSpan={2} style={cell}>A社</th>}
            <th scope="row" style={cell}>戦略a{index+1}</th>
            {row.map((pair,column)=><td key={column} style={cell}>{pair.join(', ')}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>;
  },
}];
