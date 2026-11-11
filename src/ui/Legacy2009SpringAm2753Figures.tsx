import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { arrowCases, arrowEdges, drawingAlt, drawingIds, mailAt, normalizationTables, profile, type DrawingId } from '../core/generators/legacy-2009-spring-am-27-53-figures';

type Props=BookletFigureProps & {id:DrawingId};
const ink='var(--diagram-ink)';
const surface='var(--surface)';
function Frame({id,values,caption,children}:Props & {children:ReactNode}) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    <figcaption className={id.startsWith('32-')?'sr-only':undefined}>{caption}</figcaption>
  </figure>;
}
function Drawing(props:Props & {width:number; height:number; children:(arrow:string)=>ReactNode}) {
  const {id,values,caption,width,height,children}=props, base=useId();
  const marker=base+'-arrow', title=base+'-title', desc=base+'-desc';
  return <Frame {...props}><svg viewBox={'0 0 '+width+' '+height} role="img" aria-labelledby={title} aria-describedby={desc}
    style={{color:ink,width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',display:'block',marginInline:'auto'}}>
    <title id={title}>{caption}</title><desc id={desc}>{drawingAlt(id,values[0])}</desc>
    <defs><marker id={marker} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
      <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </marker></defs>
    <g fontSize="16">{children('url(#'+marker+')')}</g>
  </svg></Frame>;
}
function Label({x,y,children}: {x:number;y:number;children:ReactNode}) {
  return <text x={x} y={y} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}
const schemaCell={border:'1px solid currentColor',padding:'.25em .55em',whiteSpace:'nowrap'} as const;
function Normalization(props:Props) {
  const option=drawingIds.indexOf(props.id);
  const rows=normalizationTables(props.values[0],option);
  return <Frame {...props}><div style={{width:'max-content',marginInline:'auto',color:ink,fontSize:'calc(1em * var(--image-scale, 1))'}}>
    {rows.map((row,index)=><table key={index} aria-label={'関係'+(index+1)} style={{borderCollapse:'collapse',marginBlockEnd:'.3em',width:'max-content'}}>
      <tbody><tr>{row.map(({label,primary})=><td key={label} style={schemaCell} data-primary-key={primary||undefined}>
        {primary?<u aria-label={label+'（主キー）'}>{label}</u>:label}
      </td>)}</tr></tbody>
    </table>)}
  </div></Frame>;
}
function Mail(props:Props) {
  const {server,client}=mailAt(props.values[0]);
  return <Drawing {...props} width={712} height={242}>{arrow=><>
    <g stroke="currentColor" strokeWidth="1.5" fill={surface}>
      <rect x="72" y="32" width="245" height="42"/><rect x="465" y="32" width="211" height="42"/>
      <rect x="72" y="180" width="245" height="42"/>
    </g>
    <g stroke="currentColor" strokeWidth="1.5" fill="none" markerEnd={arrow}>
      <path d="M140 180V74"/><path d="M244 74V180"/>
      <path d="M317 53H465" markerStart={arrow}/>
    </g>
    <Label x={194} y={59}>{server}</Label><Label x={570} y={59}>メールサーバ</Label><Label x={194} y={206}>{client}</Label>
    <Label x={77} y={128}>①メール送信</Label><Label x={311} y={128}>②メール受信</Label><Label x={391} y={40}>③メール転送</Label>
  </>}</Drawing>;
}
const nodes:Record<string,readonly [number,number]>={
  A:[70,140],B:[234,53],C:[225,140],D:[365,140],E:[506,53],F:[212,233],G:[355,233],H:[506,233],I:[656,140],
};
const offsets=[
  [-9,-10],[0,-10],[-10,15],[0,-10],[0,-10],[-8,-11],[15,-5],[0,-11],[0,-11],[14,-5],[12,12],
] as const;
function Arrow(props:Props) {
  const values=arrowCases[props.values[0]], radius=18;
  return <Drawing {...props} width={822} height={337}>{arrow=><>
    {arrowEdges.map(([start,end],i)=>{
      const [x1,y1]=nodes[start], [x2,y2]=nodes[end];
      const distance=Math.hypot(x2-x1,y2-y1);
      const dx=radius*(x2-x1)/distance,dy=radius*(y2-y1)/distance;
      const [ox,oy]=offsets[i];
      return <g key={start+end} data-edge={start+end}>
        <line x1={x1+dx} y1={y1+dy} x2={x2-dx} y2={y2-dy} stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}/>
        <Label x={(x1+x2)/2+ox} y={(y1+y2)/2+oy}>{values[i]}</Label>
      </g>;
    })}
    <g fill={surface} stroke="currentColor" strokeWidth="1.5">
      {Object.entries(nodes).map(([name,[x,y]])=><circle key={name} cx={x} cy={y} r={radius}/>)}
      <circle cx="628" cy="297" r={radius}/><circle cx="783" cy="297" r={radius}/>
      <path d="M646 297H765" fill="none" markerEnd={arrow}/>
    </g>
    {Object.entries(nodes).map(([name,[x,y]])=><Label key={name} x={x} y={y+5}>{name}</Label>)}
    <Label x={627} y={267}>凡例</Label><Label x={705} y={286}>作業所要日数</Label>
  </>}</Drawing>;
}

export const legacy2009SpringAm2753FigureRenderers: readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=>{
    const Component=id==='39-mail'?Mail:id==='51-arrow'?Arrow:Normalization;
    return <Component {...props} id={id}/>;
  },
}));
