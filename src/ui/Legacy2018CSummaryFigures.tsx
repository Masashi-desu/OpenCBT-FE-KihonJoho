import{useId}from'react';
import{legacy2018CSummaryFigureAllowed,legacy2018CSummaryFigureAlt,legacy2018CSummaryRecordFigures as records}from'../core/generators/legacy-2018-pm-c-summary';
/** Fixed-width source records and literal printed bars; no axis substitute. */
export function Legacy2018CSummaryFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(!legacy2018CSummaryFigureAllowed(profile,values))throw Error('PARAMETER_CONSTRAINT');
 const id=useId().replace(/:/g,''),print=profile==='legacy-2018-c-summary-bar-print',width=1100,height=print?260:480;
 const glyphs=(s:string,x:number,y:number,key:string)=><text key={key} data-c-summary-text={key} x={x} y={y} xmlSpace="preserve" style={{fontFamily:'monospace',fontSize:24}}>{[...s].map((c,i)=><tspan key={i} x={x+15*i}>{c}</tspan>)}</text>;
 const label=(s:string,x:number,y:number,key:string)=><text key={key} x={x} y={y} textAnchor="middle" style={{fontSize:24}}>{s}</text>;
 const pair=values[0]===1?records.slice(0,2):records.slice(2,4),sums=[[11,1,100],[12,2,800],[13,2,1100],[15,3,700]];
 const formatted=(row:(string|number)[])=>row.map(c=>' '+String(c).padStart(9)).join('');
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label={`${caption}。左右にスクロールできます。`}><svg className="source-figure-svg" viewBox={`0 0 ${width} ${height}`} style={{width:`max(calc(${width}px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))`}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2018CSummaryFigureAlt(profile,values)}</desc><g aria-hidden="true">
 {print?<>
 {['時','件数','合計金額'].map((s,i)=>label(s,20+75+150*i,30,'head'+i))}
 {sums.map((row,i)=>glyphs(formatted(row)+' |'+'*'.repeat(Math.trunc(values[0]*row[2]/1100)),20,70+30*i,'print-row-'+i))}
 {label('注記 見出しの行は印字結果に含まれない。',550,220,'note')}
 </>:<>
 {pair[0].headers.map((s,i)=>label(s,20+([0,8,14,20,24][i]+[8,6,6,4,6][i]/2)*15,35,'input-header'+i))}
 <rect data-c-summary-record-box="input" x="20" y="52" width="450" height="260" fill="var(--surface)"/>
 {[8,14,20,24].map((n,i)=><line key={i} data-c-summary-field-boundary={i} x1={20+n*15} y1="52" x2={20+n*15} y2="312" strokeDasharray="5 5"/>)}
 {pair[0].rows.map((r,i)=>glyphs(r.join(''),20,80+30*i,'input-row-'+i))}
 {pair[1].headers.map((s,i)=>label(s,600+75+150*i,35,'output-header'+i))}
 {pair[1].rows.map((r,i)=>glyphs(formatted(r),600,80+30*i,'output-row-'+i))}
 {pair[0].notes.map((s,i)=>label((i?'':'注記 ')+s,245,350+30*i,'input-note'+i))}
 {pair[1].notes.map((s,i)=>label((i?'':'注記 ')+s,825,350+30*i,'output-note'+i))}
 {label(pair[0].caption,245,450,'input-caption')}{label(pair[1].caption,825,450,'output-caption')}
 </>}
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
