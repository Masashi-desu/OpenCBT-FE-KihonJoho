import {useId} from "react";
import {legacy2017CostProfile,legacy2017CostTable,legacy2017CostTableAlt} from "../core/generators/legacy-2017-cost-table";
/** Annual-only managed source table. Shared profile/schema hooks are pending;
 * preview calls this renderer explicitly and never weakens the shared schema. */
export function Legacy2017Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!==legacy2017CostProfile)throw Error("FIGURE_PROFILE");const {rows}=legacy2017CostTable(values),id=useId().replace(/:/g,""),cols=[20,65,310,445,580,710,840,970],top=20,split=65,header=112,rowHeight=60,bottom=352;
 const cell=(row:number,col:number,text:string)=>{
  const x=(cols[col]+cols[col+1])/2,y=header+(row+.5)*rowHeight;
  return <text key={`${row}-${col}`} data-cell={`${row}-${col}`} x={col===1?cols[col]+12:x} y={y} textAnchor={col===1?"start":"middle"} style={{fontSize:22}}>{col===1&&row===0?<><tspan x={cols[col]+12} dy="-12">サンプルを購入して</tspan><tspan x={cols[col]+12} dy="25">社内で改造</tspan></>:col>=2?Number(text).toLocaleString("en-US"):text}</text>;
 };
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の表。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" style={{width:"max(calc(900px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))"}} viewBox="0 0 1000 380" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2017CostTableAlt(values)}</desc><g aria-hidden="true">
  <line x1={cols[1]} y1={top} x2={cols[7]} y2={top}/><line x1={cols[4]} y1={split} x2={cols[7]} y2={split}/>
  {Array.from({length:5},(_,i)=><line key={`row-${i}`} x1={cols[0]} y1={header+i*rowHeight} x2={cols[7]} y2={header+i*rowHeight}/>)}
  {cols.map((x,i)=><line key={`col-${i}`} x1={x} y1={i===0?header:i===5||i===6?split:top} x2={x} y2={bottom}/>)}
  <text data-heading="method" x={(cols[1]+cols[2])/2} y={66} textAnchor="middle" style={{fontSize:22}}>開発方法</text>
  {[[2,"購入費"],[3,"委託費"]].map(([col,label])=><text key={col} data-heading={Number(col)===2?"purchase":"external"} x={(cols[Number(col)]+cols[Number(col)+1])/2} y={51} textAnchor="middle" style={{fontSize:22}}>{label}<tspan x={(cols[Number(col)]+cols[Number(col)+1])/2} dy="30">（万円）</tspan></text>)}
  <text data-heading="monthly-people" x={(cols[4]+cols[7])/2} y={43} textAnchor="middle" style={{fontSize:22}}>月当たりの人数（人）</text>
  {["作成工程","改造工程","評価工程"].map((name,i)=><text key={name} data-heading={`phase-${i}`} x={(cols[4+i]+cols[5+i])/2} y={89} textAnchor="middle" style={{fontSize:22}}>{name}</text>)}
  {rows.flatMap((r,i)=>r.map((text,j)=>cell(i,j,text)))}
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
