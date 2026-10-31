import {useId,type ReactNode} from 'react';
import domains from '../core/generators/legacy-2019-autumn-structures-figure-domains.json';
import {legacy2019BnfLines,legacy2019GraphEdges,legacy2019GraphChoice,legacy2019CriticalDurations,legacy2019AutumnStructuresAlt} from '../core/generators/legacy-2019-autumn-structures';
/** Managed annual renderer. Figure data selects only reviewed finite inputs. */
export function Legacy2019AutumnStructuresFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const domain=domains[profile as keyof typeof domains];if(!domain||values.length!==domain.length||values.some((v,i)=>!Number.isInteger(v)||v<domain[i][0]||v>domain[i][1]))throw Error('PARAMETER_CONSTRAINT');
 const id=useId().replace(/:/g,''),nodes:ReactNode[]=[];let k=0,width=620,height=240;
 const text=(x:number,y:number,s:string,anchor:'start'|'middle'|'end'='middle')=>nodes.push(<text key={k++} x={x} y={y} textAnchor={anchor}>{s}</text>);
 const line=(x1:number,y1:number,x2:number,y2:number,arrow=false,dash=false)=>nodes.push(<line key={k++} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={arrow?`url(#${id}-arrow)`:undefined} strokeDasharray={dash?'5 5':undefined}/>);
 const circle=(x:number,y:number,r=18)=>nodes.push(<circle key={k++} cx={x} cy={y} r={r} fill="var(--surface)"/>);
 if(profile==='legacy-2019-bnf-rules'){
  width=800;height=230;for(const [i,s] of legacy2019BnfLines(values[0]).entries())text(25,40+i*50,s,'start');
 }else if(profile==='legacy-2019-adjacency-matrix'){
  width=420;height=310;const names='abcdef',edges=legacy2019GraphEdges[values[0]];
  for(let r=0;r<6;r++){text(75,75+r*36,names[r]);text(115+r*42,34,names[r]);for(let c=0;c<6;c++)text(115+c*42,75+r*36,edges.some(e=>e===[names[r],names[c]].sort().join(''))?'1':'0');}
  nodes.push(<path key={k++} d="M 98 48 L 90 48 L 90 270 L 98 270 M 342 48 L 350 48 L 350 270 L 342 270"/>);
 }else if(profile==='legacy-2019-adjacency-graph'){
  width=620;height=300;const x=(c:string)=>65+'abcdef'.indexOf(c)*95,y=115;
  for(const e of legacy2019GraphChoice(values[0],values[1])){const a=x(e[0]),b=x(e[1]);if(b-a===95)line(a+20,y,b-20,y);else{const down=e[0]==='b',control=e==='be'?315:down?215:15;nodes.push(<path key={k++} d={`M ${a} ${y+(down?20:-20)} Q ${(a+b)/2} ${control} ${b} ${y+(down?20:-20)}`}/>);}}
  for(const c of 'abcdef'){circle(x(c),y,20);text(x(c),y+6,c);}
 }else if(profile==='legacy-2019-density-plot'){
  width=820;height=260;const [m,s,role]=values,mu=60+m*10,sd=10+s*2,base=205,scale=role===2?5:80/sd,X=(x:number)=>410+(x-mu)*scale;
  const normal=(x:number,center:number,sigma:number)=>Math.exp(-.5*((x-center)/sigma)**2)/(sigma*Math.sqrt(2*Math.PI));
  const density=(x:number)=>role===0?normal(x,mu,sd):role===1?normal(x,mu,sd/2):role===2?.1*normal(x,mu-50,3)+.9*normal(x,mu,sd):Math.sqrt(2/Math.PI)/(sd*1.5)*Math.exp(-.5*((x-mu)/(x<mu?sd:sd/2))**2);
  const lo=role===2?mu-70:mu-4.5*sd,hi=role===2?mu+70:mu+4.5*sd,peak=density(mu),yscale=145/peak,pts=Array.from({length:901},(_,i)=>{const x=lo+(hi-lo)*i/900;return`${X(x).toFixed(5)},${(base-density(x)*yscale).toFixed(5)}`;});
  line(20,base,800,base);nodes.push(<polyline key={k++} points={pts.join(' ')}/>);
  const markers=role===0?[mu,mu+sd]:role===1?[mu-sd/2,mu,mu+sd/2]:role===2?[mu-50,mu]:[mu-sd,mu];
  for(const value of markers){if(role===1&&value===mu){line(X(value),base,X(value),193,false,true);line(X(value),154,X(value),base-density(value)*yscale,false,true);}else line(X(value),base,X(value),base-density(value)*yscale,false,true);text(X(value),232,String(value));}
  if(role!==2){const left=role===0?mu:role===1?mu-sd/2:mu-sd,right=role===1?mu+sd/2:mu+(role===0?sd:0);line(X(left),195,X(right),195);line(X(left),190,X(left),200);line(X(right),190,X(right),200);text((X(left)+X(right))/2,174,String(sd));}
 }else if(profile==='legacy-2019-dfd-symbols'){
  width=700;height=285;
  nodes.push(<rect key={k++} x={30} y={45} width={75} height={50}/>,<rect key={k++} x={585} y={115} width={75} height={50}/>);
  line(105,70,168,70,true);line(205,86,265,143,true);line(265,160,323,211,true);line(357,211,428,154,true);line(467,140,585,140,true);
  line(230,143,300,143);line(230,160,300,160);circle(190,70,22);circle(340,225,22);circle(445,140,22);
 }else if(profile==='legacy-2019-critical-network'){
  width=850;height=400;const d=legacy2019CriticalDurations[values[0]],positions=[[45,145],[180,55],[260,245],[505,245],[600,55],[730,145]];
  const edges=[['A',0,1],['B',0,2],['C',1,2],['D',1,4],['E',2,3],['F',3,5],['G',4,5],['dummy',3,4]] as const;
  for(const [name,a,b] of edges){const [x1,y1]=positions[a],[x2,y2]=positions[b],length=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/length,uy=(y2-y1)/length;line(x1+20*ux,y1+20*uy,x2-21*ux,y2-21*uy,true,name==='dummy');if(name!=='dummy'){const mx=(x1+x2)/2,my=(y1+y2)/2,ox=name==='C'?-27:0; text(mx+ox,my-14,name);text(mx+ox,my+17,String(d['ABCDEFG'.indexOf(name)]));}}
  for(const [x,y]of positions)circle(x,y,20);
  text(545,303,'凡例');circle(540,335,15);circle(740,335,15);line(555,335,723,335,true);text(640,315,'作業名');text(640,358,'所要日数');line(540,382,610,382,true,true);text(620,388,'：ダミー作業','start');
 }else throw Error('UNKNOWN_LEGACY_2019_STRUCTURES_FIGURE');
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 ${width} ${height}`} style={{width:`max(calc(${width}px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))`}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2019AutumnStructuresAlt(profile,values)}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 11 6 L 1 11 Z" fill="currentColor" stroke="none"/></marker></defs><g aria-hidden="true" fill="none">{nodes}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
