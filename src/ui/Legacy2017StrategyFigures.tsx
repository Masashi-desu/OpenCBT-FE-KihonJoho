import {useId} from "react";

/** Annual-local MRP diagram; values select the location of the same auxiliary
 * input. All six original work boxes and five main arrows remain present. */
export function Legacy2017StrategyFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!=="legacy-2017-mrp-flow")throw Error("FIGURE_PROFILE");
 if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>2)throw Error("FIGURE_DOMAIN");
 const id=useId().replace(/:/g,""),boxes=[{x:30,w:140,lines:["大日程計画"]},{x:195,w:160,lines:["総所要量計算"]},{x:380,w:220,lines:["正味所要量計算","（不足分の計算）"]},{x:625,w:150,lines:["発注量計算"]},{x:800,w:130,lines:["手配計画"]},{x:955,w:130,lines:["手配指示"]}],target=boxes[values[0]+1],cx=target.x+target.w/2;
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="MRPの作業手順。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox="0 0 1115 230" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>大日程計画から総所要量計算、正味所要量計算（不足分の計算）、発注量計算、手配計画、手配指示へ順に進む。aから{target.lines[0]}へ補助入力の矢印が入る。</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor" strokeWidth="1.5"/></marker></defs><g aria-hidden="true">
 {boxes.map((b,i)=><g key={i} data-stage={i}><rect x={b.x} y="40" width={b.w} height="70" fill="none"/>{b.lines.map((line,j)=><text key={j} x={b.x+b.w/2} y={b.lines.length===1?75:60+j*30} textAnchor="middle">{line}</text>)}</g>)}
 {boxes.slice(0,-1).map((b,i)=><line key={i} data-main-arrow={i} x1={b.x+b.w} y1="75" x2={boxes[i+1].x-3} y2="75" markerEnd={`url(#${id}-arrow)`}/>)}
 <g data-input="a"><rect x={cx-55} y="155" width="110" height="45" fill="none"/><text x={cx} y="177.5" textAnchor="middle">a</text><line data-auxiliary-arrow="a" x1={cx} y1="155" x2={cx} y2="113" markerEnd={`url(#${id}-arrow)`}/></g>
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
