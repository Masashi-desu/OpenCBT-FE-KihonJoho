import {useId} from "react";
import {legacy2018TechnicalFigureAllowed,legacy2018TechnicalFigureAlt,legacy2018TechnicalNext} from "../core/generators/legacy-2018-technical-traces";
/** Stack answer glyphs use their natural width or the available width, then
 * apply image-scale. A single narrow glyph does not need a560px canvas.
 * The four annual profiles remain unregistered in the shared renderer/schema.
 * The SVG displays actual cells/lines; data attributes are review locators. */
export function Legacy2018TechnicalFigure({profile,values:v,caption}:{profile:string;values:number[];caption:string}){
 if(!legacy2018TechnicalFigureAllowed(profile,v))throw Error("PARAMETER_CONSTRAINT");
 const id=useId().replace(/:/g,""),grid=profile==="legacy-2018-shortest-grid",stack=profile==="legacy-2018-stack-state",list=profile==="legacy-2018-array-list",width=stack?220:list?900:760,height=stack?310:list?350:grid?400:290;
 const [w,h,rx,ry]=v,gx=110,gy=350,dx=100,dy=60;
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" style={stack?{width:"min(calc(220px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))"}:undefined} viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2018TechnicalFigureAlt(profile,v)}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="currentColor" strokeWidth="1.8"/></marker></defs><g aria-hidden="true">{grid?<>
  {Array.from({length:w+1},(_,i)=><line key={`v${i}`} data-grid-line="vertical" x1={gx+i*dx} y1={gy-h*dy} x2={gx+i*dx} y2={gy}/>)}
  {Array.from({length:h+1},(_,i)=><line key={`h${i}`} data-grid-line="horizontal" x1={gx} y1={gy-i*dy} x2={gx+w*dx} y2={gy-i*dy}/>)}
  {[["P",gx,gy,-27,22],["Q",gx+w*dx,gy-h*dy,22,-20],["R",gx+rx*dx,gy-ry*dy,-28,-21]].map(([name,x,y,ox,oy])=><g key={String(name)} data-point={name}><circle cx={Number(x)} cy={Number(y)} r="6" fill="currentColor"/><text x={Number(x)+Number(ox)} y={Number(y)+Number(oy)} textAnchor="middle">{name}</text></g>)}
 </>:stack?<>
  <polyline data-stack-outline="open-top" points="65,35 65,255 155,255 155,35" fill="none" stroke="currentColor" strokeWidth="2.5"/>
  {[105,155,205].map(y=><line key={y} x1="65" y1={y} x2="155" y2={y}/>)}
  {[...v].reverse().map((n,i)=><text key={i} data-stack-cell={i} x="110" y={130+i*50} textAnchor="middle">{n}</text>)}
 </>:list?<>
  {[0,1].map(row=><g key={row} data-array={row===0?"box":"next"}><text x="65" y={110+row*145} textAnchor="end">{row===0?"box":"next"}</text>
   <rect x="100" y={90+row*145} width="750" height="50" fill="none"/>
   {Array.from({length:10},(_,i)=><g key={i}><text data-index={i} x={137.5+i*75} y={65+row*145} textAnchor="middle">{i}</text>{i>0&&<line x1={100+i*75} y1={90+row*145} x2={100+i*75} y2={140+row*145}/>}<text data-array-cell={i} x={137.5+i*75} y={115+row*145} textAnchor="middle">{row===0?(i===0?"":"ABCDEFGHI"[i-1]):(legacy2018TechnicalNext(v[0])[i]===-1?"":legacy2018TechnicalNext(v[0])[i])}</text></g>)}
  </g>)}
 </>:<>
  <rect data-box="processor" x="290" y="45" width="455" height="165" fill="none"/><text x="517.5" y="70" textAnchor="middle">プロセッサ</text>
  <rect data-box="memory" x="45" y="105" width="170" height="75" fill="var(--surface)"/><text x="130" y="142.5" textAnchor="middle">主記憶</text>
  <rect data-box="a" x="335" y="105" width="145" height="75" fill="var(--surface)"/><text x="407.5" y="142.5" textAnchor="middle">a</text>
  <rect data-box="decoder" x="535" y="105" width="180" height="75" fill="var(--surface)"/><text x="625" y="142.5" textAnchor="middle">命令デコーダ</text>
  <line data-fetch="memory-a" x1="215" y1="142.5" x2="335" y2="142.5" markerEnd={`url(#${id}-arrow)`}/><line data-fetch="a-decoder" x1="480" y1="142.5" x2="535" y2="142.5" markerEnd={`url(#${id}-arrow)`}/>
 </>}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
