import type {CSSProperties,ReactNode} from 'react';
import type {BookletFigureProps,BookletFigureRenderer} from './booklet-figure-renderer-contract';
import {drawingAlt,drawingIds,profile,type DrawingId} from '../core/generators/legacy-2008-autumn-pm-06-09-figures';
import {copyChanges} from '../core/generators/legacy-2008-autumn-pm-7-model';

type Props=BookletFigureProps&{id:DrawingId};
function Frame({id,values,caption,children}:Props&{children:ReactNode}) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
const monospace:CSSProperties={
  fontFamily:'ui-monospace, SFMono-Regular, Consolas, monospace',
  whiteSpace:'pre',
  margin:0,
  color:'var(--diagram-ink)',
  lineHeight:1.5,
};
const scaled:CSSProperties={width:'max-content',fontSize:'calc(1em * var(--image-scale, 1))',marginInline:'auto'};
function Panel(props:Props) {
  return <Frame {...props}><pre data-program-panel={props.id} style={{...monospace,...scaled,border:'1px solid currentColor',padding:'.65em .9em'}}>
    <code>{drawingAlt(props.id,props.values[0])}</code>
  </pre></Frame>;
}
const cell:CSSProperties={border:'1px solid currentColor',padding:'.34em .65em',verticalAlign:'top'};
function Changes(props:Props) {
  return <Frame {...props}><table data-program-panel={props.id} aria-label={props.caption}
    style={{...scaled,borderCollapse:'collapse',color:'var(--diagram-ink)'}}>
    <thead><tr><th scope="col" style={cell}>処置</th><th scope="col" style={cell}>変更内容</th></tr></thead>
    <tbody>{copyChanges(props.values[0]).map(([location,change])=><tr key={location}>
      <th scope="row" style={{...cell,whiteSpace:'nowrap'}}>{location}</th>
      <td style={cell}><pre style={monospace}><code>{change}</code></pre></td>
    </tr>)}</tbody>
  </table></Frame>;
}
export const legacy2008AutumnPm0609FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=>id==='7-changes'?<Changes {...props} id={id}/>:<Panel {...props} id={id}/>,
}));
