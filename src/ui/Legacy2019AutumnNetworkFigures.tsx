import {useId,type ReactNode} from 'react';
import domains from '../core/generators/legacy-2019-autumn-network-figure-domains.json';
import {legacy2019AutumnNetworkAlt} from '../core/generators/legacy-2019-autumn-network';
/** Managed finite annual drawings. Values select a reviewed scene, never code. */
export function Legacy2019AutumnNetworkFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const domain=domains[profile as keyof typeof domains];if(!domain||values.length!==1||values[0]!==0)throw Error('PARAMETER_CONSTRAINT');
 const id=useId().replace(/:/g,''),nodes:ReactNode[]=[];let key=0,width=720,height=440;
 const text=(x:number,y:number,t:string,anchor:'start'|'middle'|'end'='middle')=>nodes.push(<text key={key++} x={x} y={y} textAnchor={anchor}>{t}</text>);
 const line=(x1:number,y1:number,x2:number,y2:number,arrow=false)=>nodes.push(<line key={key++} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={arrow?`url(#${id}-arrow)`:undefined}/>);
 const box=(x:number,y:number,w:number,h:number)=>nodes.push(<rect key={key++} x={x} y={y} width={w} height={h} fill="var(--surface)"/>);
 if(profile==='legacy-2019-two-phase-locking'){
  text(275,30,'A');text(525,75,'B');line(125,62,125,414,true);text(80,220,'時');text(80,246,'間');
  for(let i=0;i<4;i++){const ya=75+i*90,yb=120+i*90;box(195,ya-20,160,40);box(445,yb-20,160,40);text(275,ya+7,['read W','update X','update Y','update Z'][i]);text(525,yb+7,['①','②','③','④'][i]);if(i<3){line(275,ya+20,275,ya+70,true);line(525,yb+20,525,yb+70,true);}}
 }else if(profile==='legacy-2019-home-network'){
  width=900;height=250;box(25,35,555,180);text(570,20,'利用者宅内','end');
  box(50,62,90,40);box(50,158,90,40);box(195,110,100,42);box(335,110,100,42);box(475,110,85,42);
  // Original wires have no arrow heads. PC/hub endpoints are kept distinct.
  line(140,82,195,131);line(140,178,195,131);line(295,131,335,131);line(435,131,475,131);line(560,131,740,131);
  text(95,89,'PC');text(95,185,'PC');for(const y of[119,130,141])nodes.push(<circle key={key++} cx={95} cy={y} r={1.5} fill="currentColor" stroke="none"/>);
  text(245,138,'ハブ');text(385,138,'装置A');text(517.5,138,'ONU');text(670,79,'光ファイバ');text(670,105,'ケーブル');nodes.push(<ellipse key={key++} cx={815} cy={131} rx={75} ry={46} fill="var(--surface)"/>);text(815,126,'インター');text(815,152,'ネット');
 }else throw Error('UNKNOWN_LEGACY_2019_NETWORK_FIGURE');
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 ${width} ${height}`} style={{width:`max(calc(${width}px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))`}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2019AutumnNetworkAlt(profile)}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 11 6 L 1 11 Z" fill="currentColor" stroke="none"/></marker></defs><g aria-hidden="true" fill="none">{nodes}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
