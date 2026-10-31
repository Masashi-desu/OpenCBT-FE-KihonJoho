import {useId} from "react";
import {legacy2018DevelopmentFigureAllowed,legacy2018DevelopmentFigureAlt} from "../core/generators/legacy-2018-development-math";
/** Two annual source profiles awaiting the parent's shared schema/renderer
 * registration. All labels and conditions are visible in the managed SVG. */
export function Legacy2018DevelopmentFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
  if(!legacy2018DevelopmentFigureAllowed(profile,values))throw Error("PARAMETER_CONSTRAINT");
  const id=useId().replace(/:/g,""),flow=profile==="legacy-2018-coverage-flow",alt=legacy2018DevelopmentFigureAlt(profile,values);
  const nodes=[[80,95],[335,95],[190,270],[470,270],[630,95]],edges=[[0,1],[0,2],[2,1],[1,4],[2,3],[3,4]],labels=[[208,75,208,117],[155,176,102,199],[244,175,299,211],[480,75,480,117],[330,249,330,294],[529,170,594,201]];
  const link=(from:number[],to:number[])=>{const dx=to[0]-from[0],dy=to[1]-from[1],length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;return{x1:from[0]+18*ux,y1:from[1]+18*uy,x2:to[0]-18*ux,y2:to[1]-18*uy};};
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 900 ${flow?500:350}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{alt}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="currentColor" strokeWidth="1.8"/></marker></defs><g aria-hidden="true">{flow?<>
    <line data-route="entry" x1="330" y1="10" x2="330" y2="40" markerEnd={`url(#${id}-arrow)`}/><rect x="220" y="40" width="220" height="60" fill="var(--surface)"/><text x="330" y="70" textAnchor="middle">処理1</text>
    <line data-route="to-decision" x1="330" y1="100" x2="330" y2="160" markerEnd={`url(#${id}-arrow)`}/><polygon points="330,160 510,220 330,280 150,220" fill="var(--surface)" stroke="currentColor" strokeWidth="2.5"/><text data-condition="decision" x="330" y="220" textAnchor="middle">{`A>${values[0]} ${values[2]?"and":"or"} B=${values[1]}`}</text>
    <line data-route="yes" x1="330" y1="280" x2="330" y2="340" markerEnd={`url(#${id}-arrow)`}/><text data-branch="yes" x="365" y="315">Yes</text><rect x="220" y="340" width="220" height="60" fill="var(--surface)"/><text x="330" y="370" textAnchor="middle">処理2</text>
    <polyline data-route="no" points="510,220 650,220 650,440 330,440" fill="none" stroke="currentColor" strokeWidth="2.5" markerEnd={`url(#${id}-arrow)`}/><text data-branch="no" x="555" y="203">No</text><line data-route="exit" x1="330" y1="400" x2="330" y2="485" markerEnd={`url(#${id}-arrow)`}/>
  </>:<>
    {edges.map(([from,to],i)=><g key={i} data-edge={"ABCDEF"[i]}><line {...link(nodes[from],nodes[to])} markerEnd={`url(#${id}-arrow)`}/><text data-task={"ABCDEF"[i]} x={labels[i][0]} y={labels[i][1]} textAnchor="middle">{"ABCDEF"[i]}</text><text data-days={"ABCDEF"[i]} x={labels[i][2]} y={labels[i][3]} textAnchor="middle">{values[i]}</text></g>)}
    {nodes.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="18" fill="var(--surface)"/>)}
    <g data-legend="task-duration"><text x="715" y="215">凡例</text><line x1="733" y1="270" x2="837" y2="270" markerEnd={`url(#${id}-arrow)`}/><circle cx="715" cy="270" r="18" fill="var(--surface)"/><circle cx="855" cy="270" r="18" fill="var(--surface)"/><text x="785" y="250" textAnchor="middle">作業名</text><text x="785" y="299" textAnchor="middle">所要日数</text></g>
  </>}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
