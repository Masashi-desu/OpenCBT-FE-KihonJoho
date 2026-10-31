import {useId} from "react";
import {legacy2017AutumnPlatformMemoryAlt,legacy2017AutumnPlatformMemoryProfile,legacy2017AutumnPlatformMemorySizes} from "../core/generators/legacy-2017-autumn-platform";

/** Annual managed drawing; shared renderer/schema registration stays pending.
 * Minimum readable widths preserve the four adjacent source compartments. The
 * annotated k-byte values, rather than drawing scale, carry the memory sizes. */
export function Legacy2017AutumnPlatformFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
  if(profile!==legacy2017AutumnPlatformMemoryProfile)throw Error("FIGURE_PROFILE");
  if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>2)throw Error("FIGURE_DOMAIN");
  const v=values[0],sizes=legacy2017AutumnPlatformMemorySizes[v],weights=sizes.map(n=>Math.max(300,n)),total=weights.reduce((a,b)=>a+b,0);
  const widths=weights.map(n=>Math.round(800*n/total*10)/10);widths[3]=Math.round((800-widths[0]-widths[1]-widths[2])*10)/10;
  const lefts=widths.map((_,i)=>Math.round((40+widths.slice(0,i).reduce((a,b)=>a+b,0))*10)/10),id=useId().replace(/:/g,"");
  return <figure className={`managed-diagram source-figure profile-${profile}`}>
    <div className="diagram-scroll" tabIndex={0} aria-label="メモリマップ。幅が足りない場合は左右にスクロールできます。">
      <svg className="source-figure-svg" style={{minWidth:"calc(900px * var(--image-scale, 1))"}} viewBox="0 0 900 200" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}>
        <title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2017AutumnPlatformMemoryAlt(v)}</desc>
        <g aria-hidden="true">
          {sizes.map((size,i)=><g key={i}>
            <rect data-memory-region={i} x={lefts[i]} y="35" width={widths[i]} height="75" fill="none"/>
            <text data-memory-label={i} x={lefts[i]+widths[i]/2} y={i===1?61:75} textAnchor="middle">
              {i===1?<><tspan x={lefts[i]+widths[i]/2}>セグメ</tspan><tspan x={lefts[i]+widths[i]/2} dy="26">ント2</tspan></>:i===3?"空き":`セグメント${i+1}`}
            </text>
            <text data-memory-size={i} style={{fontSize:22}} x={lefts[i]+widths[i]/2} y="150" textAnchor="middle">{size}kバイト</text>
          </g>)}
        </g>
      </svg>
    </div><figcaption>{caption}</figcaption>
  </figure>;
}
