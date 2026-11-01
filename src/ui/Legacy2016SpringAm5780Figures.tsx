import type {CSSProperties} from 'react';
import type {Scene} from '../core/types';
import {spring2016Am5780Profiles as profiles,spring2016ParetoGeometry,spring2016Am5780FigureAlt} from '../core/generators/legacy-2016-spring-am-57-80-figures';
/** Only this source's elementary matrix/graph geometry; no downloaded artwork. */
export function Legacy2016SpringAm5780Figures({scene,caption}:{scene:Extract<Scene,{kind:"source_figure"}>;caption?:string}){
 const alt=spring2016Am5780FigureAlt(scene.profile,scene.values);
 if(scene.profile===profiles.ppm)return <svg className="legacy2016-figure" role="img" aria-label={alt} viewBox="0 0 500 390" style={{'--source-figure-width':'500px',color:'var(--diagram-ink)',fontFamily:'var(--font)'} as CSSProperties}>
  <title>{caption||'事業のマトリックス'}</title><g fill="none" stroke="currentColor" strokeWidth="2"><rect x="155" y="65" width="260" height="260"/><path d="M285 65V325M155 195H415"/></g>
  <g fill="currentColor" fontSize="18" textAnchor="middle"><text x="285" y="40">事業の強み（市場シェア）</text><text x="170" y="350">強</text><text x="403" y="350">弱</text><text x="442" y="88">高</text><text x="442" y="316">低</text></g>
  <text fill="currentColor" fontSize="18" x="118" y="74" style={{writingMode:'vertical-rl'}}>事業の魅力度（市場成長率）</text>
 </svg>;
 const g=spring2016ParetoGeometry(scene.values),left=25,bottom=192,bw=48,scale=150/g.drawingRange;
 return <svg className="legacy2016-figure" role="img" aria-label={alt} viewBox="0 0 320 220" style={{'--source-figure-width':'320px',color:'var(--diagram-ink)',fontFamily:'var(--font)'} as CSSProperties}>
  <title>{caption||'棒と折れ線の図'}</title><g fill="none" stroke="currentColor" strokeWidth="1.8"><path data-role="axes" d={`M${left} 20V${bottom}H305`}/>
   {g.bars.map((h,i)=><rect key={i} data-bar={i} x={left+i*bw} y={bottom-h*scale} width={bw} height={h*scale}/>)}
   <polyline data-line={g.role} points={g.line.map((h,i)=>`${left+i*bw},${bottom-h*scale}`).join(' ')}/>
  </g>
 </svg>;
}
