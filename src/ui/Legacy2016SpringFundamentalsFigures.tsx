import {useId,type ReactNode,type CSSProperties} from 'react';
import type {Scene} from '../core/types';
import domains from '../core/generators/legacy-2016-spring-fundamentals-figure-domains.json';
import {spring2016Profiles as P,spring2016Trees,spring2016Ranks} from '../core/generators/legacy-2016-spring-fundamentals-models';
import {spring2016FigureAlt} from '../core/generators/legacy-2016-spring-fundamentals';
export function assertSpring2016Figure(scene:Extract<Scene,{kind:'source_figure'}>){const d=(domains as Record<string,{fields:number[][]}>)[scene.profile];if(!d||scene.values.length!==d.fields.length||scene.values.some((v,i)=>!Number.isInteger(v)||v<d.fields[i][0]||v>d.fields[i][1]))throw Error('FIGURE_PROFILE');}
export function Legacy2016SpringFundamentalsFigure({scene,caption}:{scene:Extract<Scene,{kind:'source_figure'}>;caption:string}){
 assertSpring2016Figure(scene);const id='s16'+useId().replace(/[^a-z0-9]/gi,''),v=scene.values,profile=scene.profile;
 let width=720,height=240,children:ReactNode;
 const arrow=(d:string,key:string,thick=false)=><path key={key} data-edge={key} d={d} fill="none" stroke="var(--diagram-ink)" strokeWidth={thick?4:2} markerEnd={`url(#${id})`}/>;
 const text=(x:number,y:number,value:ReactNode,key:string,anchor:'start'|'middle'|'end'='middle')=><text key={key} data-label={key} x={x} y={y} textAnchor={anchor}>{value}</text>;
 const circle=(x:number,y:number,key:string,r=29)=><circle key={key} cx={x} cy={y} r={r} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>;
 if(profile===P.dfa){const a=v[0],b=1-a;children=<>
 {arrow('M 45 150 L 141 150','start',true)}
 {[170,360,550].map((x,i)=>circle(x,150,'state'+i))}{circle(550,150,'accept',23)}
 {arrow('M 199 150 L 330 150','next1')}{arrow('M 389 150 L 520 150','next2')}
 {text(265,140,a,'a')}{text(455,140,b,'b')}
 {[170,360,550].map((x,i)=><g key={'loop'+i}>{arrow(`M ${x-18} 126 C ${x-45} 65 ${x+45} 65 ${x+18} 126`,'edge'+i)}{text(x,60,i===0?b:i===1?a:'0，1','looplabel'+i)}</g>)}
 </>;}
 else if(profile===P.bst){width=720;height=440;const paths=spring2016Trees[v[0]],rank=spring2016Ranks(paths);
 // Tidy contours preserve the original equal diagonal steps at the reference,
 // while separating every row for the151 admitted shapes.
 const layout=(path:string):Record<string,number>=>{const left=paths.includes(path+'L')?layout(path+'L'):undefined,right=paths.includes(path+'R')?layout(path+'R'):undefined;let spread=1;if(left&&right){for(let depth=0;depth<4;depth++){const l=Object.entries(left).filter(([p])=>p.length===path.length+1+depth).map(([,x])=>x),r=Object.entries(right).filter(([p])=>p.length===path.length+1+depth).map(([,x])=>x);if(l.length&&r.length)spread=Math.max(spread,(Math.max(...l)-Math.min(...r)+2)/2);}}return{[path]:0,...Object.fromEntries(Object.entries(left??{}).map(([p,x])=>[p,x-spread])),...Object.fromEntries(Object.entries(right??{}).map(([p,x])=>[p,x+spread]))};};
 const positions=layout(''),xs=Object.values(positions),middle=(Math.min(...xs)+Math.max(...xs))/2,unit=Math.min(62,620/(Math.max(...xs)-Math.min(...xs)||1)),pos=(s:string)=>[360+(positions[s]-middle)*unit,45+s.length*82];children=<>
 {paths.filter(s=>s!=='').map(s=>{const[x,y]=pos(s.slice(0,-1)),[u,w]=pos(s),dx=u-x,dy=w-y,len=Math.hypot(dx,dy);return <line key={'edge'+s} data-from={s.slice(0,-1)} data-to={s} x1={x+dx*22/len} y1={y+dy*22/len} x2={u-dx*22/len} y2={w-dy*22/len} stroke="var(--diagram-ink)" strokeWidth={2}/>;})}
 {paths.map(s=>{const[x,y]=pos(s),label=s===''?rank['']:s==='L'?rank.L:s==='R'?'a':s==='RRL'?'b':'';return <g key={'node'+s} data-node={s}><circle cx={x} cy={y} r={22} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>{label!==''&&text(x,y+8,label,'label'+s)}</g>;})}
 </>;}
 else if(profile===P.factorial){width=680;height=180;children=<>
 {text(55,65,'n > 0 のとき，','condition1','start')}{text(245,65,'F(n) =','fn','start')}<rect x={342} y={40} width={124} height={39} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>{text(404,68,'a','blank')}
 {text(55,115,'n = 0 のとき，','condition0','start')}{text(245,115,'F(n) =','fn0','start')}{text(342,115,'1','base','start')}
 </>;}
 else {const[c,s]=v;width=720;height=490;children=<>
 <rect x={212} y={22} width={216} height={46} rx={23} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>{text(320,54,'開始','starttext')}
 {arrow('M320 68 L320 112','a1')}<rect x={212} y={112} width={216} height={81} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>{text(320,146,`q←${c}`,'q')}{text(320,178,'r←x','r')}
 {arrow('M320 193 L320 238','a2')}<path data-shape="condition" d="M320 238 L428 266 L320 294 L212 266 Z" fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>{text(320,275,'r < y','cond')}
 {arrow('M428 266 L580 266 L580 340','yes')}{text(472,255,'Yes','yeslabel')}<rect x={472} y={340} width={216} height={46} rx={23} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>{text(580,372,'終了','end')}
 {arrow('M320 294 L320 339','no')}{text(352,322,'No','nolabel')}<rect x={212} y={339} width={216} height={81} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>{text(320,372,'r←r-y','subtract')}{text(320,404,`q←q+${s}`,'increment')}
 {arrow('M320 420 L320 458 L152 458 L152 220 L320 220','back')}
 </>;}

 return <svg className="legacy2016-figure" style={{'--source-figure-width':`${width}px`} as CSSProperties} role="img" aria-labelledby={`${id}-title ${id}-desc`} viewBox={`0 0 ${width} ${height}`} width={width} height={height} data-profile={profile}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{spring2016FigureAlt(profile,v)}</desc><defs><marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--diagram-ink)"/></marker></defs><g fill="var(--diagram-ink)" fontFamily="var(--font)" fontSize="24">{children}</g></svg>;
}
