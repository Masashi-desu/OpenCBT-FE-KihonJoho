import{useId}from'react';
import{legacy2017AutumnPlanningProfile,planningSalesValues,planningSalesAlt,planningHours}from'../core/generators/legacy-2017-autumn-planning-model';
/** The original nested total/subtotal table, without added unit-rate helpers. */
export function Legacy2017AutumnPlanningFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!==legacy2017AutumnPlanningProfile)throw Error('FIGURE_PROFILE');const x=planningSalesValues(values),id=useId().replace(/:/g,''),cells=[planningHours(x.total),planningHours(x.visit),planningHours(x.preparation+x.other),planningHours(x.preparation),planningHours(x.other),`${x.count}件`];
 const labels=[{key:'total',x:365,y:75,lines:['総業務時間']},{key:'visit',x:235,y:150,lines:['顧客','訪問','時間']},{key:'inside',x:495,y:125,lines:['社内業務時間']},{key:'preparation',x:495,y:180,lines:['訪問','準備','時間']},{key:'other',x:625,y:180,lines:['その他','業務','時間']},{key:'count',x:795,y:110,lines:['1日の','顧客','訪問','件数']}];
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="時間分析表。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" style={{minWidth:'calc(900px * var(--image-scale, 1))'}} viewBox="0 0 900 400" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{planningSalesAlt(values)}</desc><g aria-hidden="true">
 <text data-sales-source-title="true" x="690" y="22" textAnchor="end">{caption}</text>
 <rect data-sales-box="main" x="40" y="40" width="650" height="320" fill="none"/><rect data-sales-box="count" x="730" y="40" width="130" height="320" fill="none"/>
 {[[170,90,690,90],[430,140,690,140],[40,310,690,310],[730,310,860,310],[170,90,170,360],[300,90,300,360],[430,140,430,360],[560,140,560,360]].map(([x1,y1,x2,y2],i)=><line key={i} data-sales-rule={i} x1={x1} y1={y1} x2={x2} y2={y2}/>)}
 {labels.map(l=><text key={l.key} data-sales-heading={l.key} x={l.x} y={l.y} textAnchor="middle">{l.lines.map((t,i)=><tspan key={i} x={l.x} dy={i===0?0:40}>{t}</tspan>)}</text>)}
 {cells.map((value,i)=><text key={i} data-sales-value={i} x={i===5?795:105+i*130} y="345" textAnchor="middle">{value}</text>)}
 </g></svg></div></figure>;
}
