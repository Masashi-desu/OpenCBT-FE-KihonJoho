import {useId,type ReactNode,type CSSProperties} from 'react';
import type {Scene} from '../core/types';
import {am2016Profiles as P} from '../core/generators/legacy-2016-spring-am-09-32-models';
import {assertAm2016Figure,am2016FigureAlt} from '../core/generators/legacy-2016-spring-am-09-32-figure-models';
export function Legacy2016SpringAm0932Figure({scene,caption}:{scene:Extract<Scene,{kind:'source_figure'}>;caption:string}) {
 const {profile,values:v}=scene;assertAm2016Figure(profile,v);const id='am16'+useId().replace(/[^a-z0-9]/gi,'');
 let width=720,height=300,children:ReactNode;
 const line=(d:string,key:string)=><path key={key} data-edge={key} d={d} fill="none" stroke="var(--diagram-ink)" strokeWidth={2}/>;
 const txt=(x:number,y:number,text:string,key:string)=><text key={"text-"+key} x={x} y={y} textAnchor="middle">{text}</text>;
 const dot=(x:number,y:number,key:string)=><circle key={key} data-junction={key} cx={x} cy={y} r={4} fill="var(--diagram-ink)"/>;
 const gate=(x:number,y:number,kind:number,key:string,xor=false)=>{
  const isOr=kind>=2,bubble=kind%2===1;
  return <g key={key} data-gate={key} data-operation={xor?'XOR':['AND','NAND','OR','NOR'][kind]}>
   {isOr&&line(`M${x} ${y-12} H${x+15} M${x} ${y+12} H${x+15}`,key+'inlets')}
   <path d={isOr?`M${x} ${y-24} Q${x+34} ${y-25} ${x+70} ${y} Q${x+34} ${y+25} ${x} ${y+24} Q${x+19} ${y} ${x} ${y-24} Z`:`M${x} ${y-24} H${x+36} Q${x+70} ${y-24} ${x+70} ${y} Q${x+70} ${y+24} ${x+36} ${y+24} H${x} Z`} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>
   {xor&&line(`M${x-9} ${y-24} Q${x+10} ${y} ${x-9} ${y+24}`,key+'xor')}
   {bubble&&<circle data-inversion={key} cx={x+75} cy={y} r={5} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>}
  </g>;
 };
 if(profile===P.lan){height=235;const[n,m]=v,total=n+m,step=640/total,serverX=40+step*n;children=<>
  {line('M30 100 H690','bus')}{line(`M${serverX} 100 V66`,'server-edge')}<rect x={serverX-5} y={95} width={10} height={10} fill="var(--diagram-ink)"/><rect data-device="server" x={serverX-52} y={18} width={104} height={48} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>{txt(serverX,50,'サーバ','server')}
  {Array.from({length:total},(_,i)=>{const x=40+step*(i+.5),printer=i>=n,half=total>6?43:49;return <g key={'device'+i} data-device={printer?'printer':'client'}>{line(`M${x} 100 V145`,'branch'+i)}<rect x={x-5} y={95} width={10} height={10} fill="var(--diagram-ink)"/>{printer?<path d={`M${x-half} 145 H${x+half} V200 Q${x+25} 187 ${x} 200 Q${x-25} 213 ${x-half} 200 Z`} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>:<rect x={x-half} y={145} width={half*2} height={56} fill="var(--diagram-surface)" stroke="var(--diagram-ink)" strokeWidth={2}/>}<text x={x} y={179} textAnchor="middle" fontSize={n+m>6?14:16}>{printer?'プリンタ':'クライアント'}</text></g>;})}
  <rect x={25} y={95} width={10} height={10} fill="var(--diagram-ink)"/><rect x={685} y={95} width={10} height={10} fill="var(--diagram-ink)"/>
 </>;}
 else if(profile===P.logic){children=<>
  {line('M35 138 H160','A-G1')}{line('M100 138 V68 H320','A-G2')}{line('M35 162 H160','B-G1')}{line('M100 162 V242 H320','B-G3')}
  {line('M230 150 H290','G1-output')}{line('M290 150 V92 H320','G1-G2')}{line('M290 150 V218 H320','G1-G3')}
  {line('M390 80 H450 V138 H510','G2-G4')}{line('M390 230 H450 V162 H510','G3-G4')}{line('M580 150 H660','G4-Y')}
  {gate(160,150,v[0],'G1')}{gate(320,80,v[1],'G2')}{gate(320,230,v[2],'G3')}{gate(510,150,v[3],'G4')}
  {dot(100,138,'A')}{dot(100,162,'B')}{dot(290,150,'w')}{txt(20,146,'A','A')}{txt(20,170,'B','B')}{txt(681,158,'Y','Y')}
 </>;}
 else {width=220;height=125;const mapping=[2,0,2,3],k=mapping[v[0]],xor=v[0]===2;children=<>
  {line('M38 48 H83','inputA')}{line('M38 72 H83','inputB')}{line('M153 60 H188','outputY')}{gate(83,60,k,'candidate',xor)}{txt(20,56,'A','A')}{txt(20,80,'B','B')}{txt(205,68,'Y','Y')}
 </>;}
 return <svg className="legacy2016-figure" style={{'--source-figure-width':`${width}px`} as CSSProperties} role="img" aria-labelledby={`${id}-title ${id}-desc`} data-profile={profile} viewBox={`0 0 ${width} ${height}`} width={width} height={height}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{am2016FigureAlt(profile,v)}</desc><g fill="var(--diagram-ink)" fontFamily="var(--font)" fontSize="22">{children}</g></svg>;
}
