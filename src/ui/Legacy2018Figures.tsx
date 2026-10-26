import {useId} from "react";
import {legacy2018CostCurves,legacy2018ProfitInputs,legacy2018PmFigureAlt} from "../core/generators/legacy-2018-pm";
import domains from "../core/generators/legacy-2018-figure-domains.json";

/** Annual-only managed renderer. Parent must register the exact two profiles;
 * unregistered source figures are not admitted by weakening shared schemas. */
export function Legacy2018Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){
  const domain=domains[profile as keyof typeof domains];
  if(!domain||values.length!==domain.length||values.some((n,i)=>!Number.isInteger(n)||n<domain[i][0]||n>domain[i][1]))throw Error("PARAMETER_CONSTRAINT");
  const id=useId().replace(/:/g,""),alt=legacy2018PmFigureAlt(profile,values);
  const plot=profile==="legacy-2018-cost-curves";
  const graph=plot?legacy2018CostCurves(values[0]):undefined;
  const labelY=graph?.map(c=>430-c.intercept-c.rise)??[];
  let last=-Infinity;[...labelY.keys()].sort((a,b)=>labelY[a]-labelY[b]).forEach(i=>{labelY[i]=Math.max(labelY[i],last+34);last=labelY[i];});
  const x=plot?undefined:legacy2018ProfitInputs([...values,1]);
  const rows=x?[["ケース","X","Y"],["販売数（千個）",1000*x.scale,1200*x.scale],["売上高（千円）",x.salesX,x.salesY],["変動費（千円）","",""],["固定費（千円）","",""],["利益（千円）",x.profitX,x.profitY]]:[];
  const cols=[35,355,610,865],rowY=25,rowH=59;
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図表。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 900 ${plot?520:405}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{alt}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="currentColor" strokeWidth="1.8"/></marker><pattern id={`${id}-shade`} patternUnits="userSpaceOnUse" width="6" height="6"><path d="M 0 6 L 6 0" fill="none" stroke="currentColor" strokeWidth="1" opacity=".25"/></pattern></defs><g aria-hidden="true">{plot?<>
      <line x1="90" y1="430" x2="90" y2="40" markerEnd={`url(#${id}-arrow)`}/><line x1="90" y1="430" x2="805" y2="430" markerEnd={`url(#${id}-arrow)`}/><text x="88" y="20" textAnchor="middle">費用</text><text x="820" y="435">売上高</text><text x="65" y="450">0</text>
      {graph!.map((c,i)=><g key={i} data-curve={i+1}><line x1="90" y1={430-c.intercept} x2="740" y2={430-c.intercept-c.rise} strokeDasharray={c.dash}/>{labelY[i]!==430-c.intercept-c.rise&&<line data-label-leader={i+1} x1="749" y1={430-c.intercept-c.rise} x2="770" y2={labelY[i]} strokeDasharray="3 4" style={{strokeWidth:1,opacity:.65}}/>}<text x="788" y={labelY[i]} textAnchor="middle">{"①②③④"[i]}</text></g>)}
    </>:<>
      {[3,4].flatMap(row=>[1,2].map(col=><rect key={`hidden-${row}-${col}`} data-hidden-cell={`${row}-${col}`} x={cols[col]} y={rowY+row*rowH} width={cols[col+1]-cols[col]} height={rowH} fill={`url(#${id}-shade)`}/>))}
      {Array.from({length:7},(_,i)=><line key={`row-${i}`} x1={cols[0]} y1={rowY+i*rowH} x2={cols[3]} y2={rowY+i*rowH}/>)}
      {cols.map((v,i)=><line key={`col-${i}`} x1={v} y1={rowY} x2={v} y2={rowY+6*rowH}/>)}
      {rows.flatMap((row,i)=>row.map((v,j)=>v!==""?<text key={`${i}-${j}`} data-cell={`${i}-${j}`} x={j===0?cols[j]+15:(cols[j]+cols[j+1])/2} y={rowY+(i+.5)*rowH} textAnchor={j===0?"start":"middle"}>{typeof v==="number"?v.toLocaleString("en-US"):v}</text>:null))}
    </>}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
