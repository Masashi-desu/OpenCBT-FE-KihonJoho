import React,{useId} from 'react';
import {legacy2017Pm3Source,legacy2017Pm3Profile,legacy2017Pm3FigureAlt} from '../core/generators/legacy-2017-pm3-data';
/** Private annual drawing. Four original tables, not a new ER diagram. */
export function Legacy2017Pm3Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!==legacy2017Pm3Profile)throw Error('FIGURE_PROFILE');
 if(values.length!==1||values[0]!==0||!Object.hasOwn(values,0))throw Error('FIGURE_DOMAIN');
 const block=legacy2017Pm3Source().orderedBlocks.find(b=>b.kind==='figure');if(!block||!('tables'in block))throw Error('SOURCE');
 const id=useId().replace(/:/g,''),layouts=[{x:20,y:55,widths:[140,160]},{x:400,y:55,widths:[160,200]},{x:20,y:190,widths:[150,160,180,670]},{x:20,y:325,widths:[160,180,150,150,160,360]}],rowHeight=46;
 const width=(s:string)=>[...s].reduce((n,c)=>n+(c.charCodeAt(0)>255?22:13),0);
 return <figure className={'managed-diagram source-figure profile-'+profile} data-pm3-figure="1" style={{maxWidth:'calc(1200px * var(--image-scale, 1))'}}><div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'}><svg className="source-figure-svg" viewBox="0 0 1200 435" style={{width:'max(calc(1200px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))',fontSize:22}} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}><title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{legacy2017Pm3FigureAlt()}</desc><g aria-hidden="true">{block.tables.map((t,i)=>{const l=layouts[i],total=l.widths.reduce((a,b)=>a+b,0);return <g key={t.caption} data-pm3-table={i}>
 <text style={{fontSize:22,dominantBaseline:'alphabetic'}} data-pm3-table-caption={i} x={l.x} y={l.y-12}>{t.caption}</text><g fill="none" stroke="currentColor"><rect data-pm3-frame={i} x={l.x} y={l.y} width={total} height={rowHeight*2}/><line data-pm3-row-divider={i} x1={l.x} y1={l.y+rowHeight} x2={l.x+total} y2={l.y+rowHeight}/>{l.widths.slice(0,-1).map((_,j)=><line key={j} data-pm3-column-divider={i+'-'+j} x1={l.x+l.widths.slice(0,j+1).reduce((a,b)=>a+b,0)} x2={l.x+l.widths.slice(0,j+1).reduce((a,b)=>a+b,0)} y1={l.y} y2={l.y+rowHeight*2}/>)}
 {t.primaryKeyColumns.map(j=>{const x=l.x+l.widths.slice(0,j).reduce((a,b)=>a+b,0)+10;return <line key={j} data-pm3-primary-key={i+'-'+j} x1={x} x2={x+width(t.headers[j])} y1={l.y+33} y2={l.y+33}/>;})}</g>
 {t.headers.map((h,j)=>{const x=l.x+l.widths.slice(0,j).reduce((a,b)=>a+b,0)+10;return <text style={{fontSize:22,dominantBaseline:'alphabetic'}} key={j} data-pm3-header={i+'-'+j} x={x} y={l.y+29} textLength={width(h)} lengthAdjust="spacingAndGlyphs">{h}</text>;})}
 {t.rows[0].map((h,j)=><text style={{fontSize:22,dominantBaseline:'alphabetic'}} key={j} data-pm3-data={i+'-'+j} x={l.x+l.widths.slice(0,j).reduce((a,b)=>a+b,0)+10} y={l.y+75}>{h}</text>)}
 </g>;})}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
