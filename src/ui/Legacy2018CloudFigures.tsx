import{useId}from'react';
import{legacy2018CloudFigureAllowed,legacy2018CloudFigureAlt}from'../core/generators/legacy-2018-pm-cloud';
/** One annual-only topology. Source group/port answers are not added to it. */
export function Legacy2018CloudFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(!legacy2018CloudFigureAllowed(profile,values))throw Error('PARAMETER_CONSTRAINT');
 const id=useId().replace(/:/g,''),marker=`url(#${id}-arrow)`,nodes=[
 {x:60,y:20,w:170,h:36,text:['クライアント']},
 {x:210,y:180,w:160,h:40,text:['負荷分散装置']},{x:730,y:180,w:160,h:40,text:['負荷分散装置']},
 ...[50,200,350].map(x=>({x,y:290,w:120,h:72,text:['フロント','サーバ']})),
 ...[600,750,900].map(x=>({x,y:290,w:120,h:72,text:['レプリケー','ションサーバ']})),
 {x:80,y:450,w:140,h:40,text:['DBサーバ']},{x:280,y:450,w:160,h:40,text:['キューサーバ']},{x:550,y:450,w:220,h:40,text:['ストレージサーバ']},
 ...[50,200,350].map(x=>({x,y:580,w:120,h:72,text:['バック','サーバ']}))
 ];
 const buses=['290,220 290,255 110,255 410,255','810,220 810,255 660,255 960,255','110,362 110,400 600,400','260,362 260,400','410,362 410,400','660,362 660,400 960,400 960,362','810,362 810,400','110,580 110,540 660,540','260,580 260,540','410,580 410,540'];
 const arrows=['230,38 525,38 525,70','500,130 500,155 290,155 290,180','550,130 550,155 810,155 810,180','110,255 110,290','260,255 260,290','410,255 410,290','660,255 660,290','810,255 810,290','960,255 960,290','150,400 150,450','360,400 360,450','600,400 600,450','720,400 720,450','150,540 150,490','360,540 360,490','660,540 660,490'];
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="システム構成の図。左右にスクロールできます。"><svg className="source-figure-svg" viewBox="0 0 1050 710" style={{width:"max(calc(1050px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))"}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2018CloudFigureAlt(profile,values)}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 10 6 L 1 11 Z" fill="currentColor" stroke="currentColor"/></marker></defs><g aria-hidden="true">{buses.map((points,i)=><polyline key={'b'+i} data-cloud-bus={i} points={points} fill="none"/>)}{arrows.map((points,i)=><polyline key={'a'+i} data-cloud-arrow={i} points={points} fill="none" markerEnd={marker}/>)}<g data-cloud-node="internet"><ellipse cx="525" cy="100" rx="470" ry="30" fill="var(--surface)"/><text x="525" y="100" textAnchor="middle">インターネット</text></g>{nodes.map((n,i)=><g key={i} data-cloud-node={i}><rect x={n.x} y={n.y} width={n.w} height={n.h} fill="var(--surface)"/><text style={{fontSize:18}} x={n.x+n.w/2} y={n.y+n.h/2-(n.text.length-1)*12} textAnchor="middle">{n.text.map((t,j)=><tspan key={j} x={n.x+n.w/2} dy={j?24:0}>{t}</tspan>)}</text></g>)}{[330,880].map(x=><text key={x} data-cloud-ellipsis="pool" x={x} y="330" textAnchor="middle">…</text>)}<text data-cloud-ellipsis="pool" x="330" y="620" textAnchor="middle">…</text><text x="790" y="620">DB：データベース</text></g></svg></div><figcaption>{caption}</figcaption></figure>;
}
