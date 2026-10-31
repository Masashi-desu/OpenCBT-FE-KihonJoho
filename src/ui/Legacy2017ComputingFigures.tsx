import {useId} from "react";
import {legacy2017AvailabilityProfile,legacy2017DirectoryProfile,legacy2017ReplacementProfile,legacy2017PageChoices} from "../core/generators/legacy-2017-computing-models";
type Node={id:string;x:number;y:number;component?:boolean};
/** Kept annual-local until shared profile/schema/renderer registration. Native
 * text, wire endpoints and node identities are exposed for an independent SVG
 * connectivity oracle; none encodes a correct option or highlighted answer. */
export function Legacy2017ComputingFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const id=useId().replace(/:/g,"");if(values.length!==1||!Number.isInteger(values[0]))throw Error("FIGURE_DOMAIN");
 if(profile===legacy2017AvailabilityProfile){
  const kind=values[0];if(kind<0||kind>2)throw Error("FIGURE_DOMAIN");
  const nodes:Node[]=kind===0?[{id:"start",x:100,y:160},{id:"middle",x:480,y:160},{id:"end",x:880,y:160},{id:"R0",x:280,y:90,component:true},{id:"R1",x:280,y:230,component:true},{id:"R2",x:680,y:90,component:true},{id:"R3",x:680,y:230,component:true}]:kind===1?[{id:"start",x:100,y:160},{id:"end",x:880,y:160},{id:"R0",x:300,y:90,component:true},{id:"R1",x:660,y:90,component:true},{id:"R2",x:300,y:230,component:true},{id:"R3",x:660,y:230,component:true}]:[{id:"start",x:100,y:160},{id:"end",x:880,y:160},...Array.from({length:4},(_,i)=>({id:`R${i}`,x:490,y:40+80*i,component:true}))];
  const edges=kind===0?[["start","R0"],["start","R1"],["R0","middle"],["R1","middle"],["middle","R2"],["middle","R3"],["R2","end"],["R3","end"]]:kind===1?[["start","R0"],["R0","R1"],["R1","end"],["start","R2"],["R2","R3"],["R3","end"]]:Array.from({length:4},(_,i)=>[["start",`R${i}`],[`R${i}`,"end"]]).flat();
  const node=(key:string)=>nodes.find(n=>n.id===key)!;
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="装置の接続図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox="0 0 1000 330" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>稼働率Rの4装置とそれらを結ぶ線。{kind===0?"二つの並列組が直列。":kind===1?"二つの直列枝が並列。":"四つの装置が並列。"}</desc><g aria-hidden="true">
   <line x1="55" y1="160" x2="100" y2="160"/><line x1="880" y1="160" x2="925" y2="160"/>
   {edges.map(([from,to],i)=>{const a=node(from),b=node(to),turn=a.component?b.x:a.x;return <polyline key={i} data-from={from} data-to={to} points={`${a.x},${a.y} ${turn},${a.y} ${turn},${b.y} ${b.x},${b.y}`} fill="none"/>;})}
   {nodes.filter(n=>n.component).map(n=><g key={n.id} data-component={n.id} data-node-x={n.x} data-node-y={n.y}><rect x={n.x-75} y={n.y-25} width="150" height="50" style={{fill:"var(--surface)"}}/><text x={n.x} y={n.y} textAnchor="middle">R</text></g>)}
  </g></svg></div><figcaption>{caption}</figcaption></figure>;
 }
 if(profile===legacy2017DirectoryProfile){
  if(values[0]!==0)throw Error("FIGURE_DOMAIN");const nodes:{path:string;label:string;x:number;y:number}[]=[{path:"/",label:"ルート",x:500,y:35}];
  for(let level=1;level<=3;level++)for(let i=0;i<2**level;i++){const names=i.toString(2).padStart(level,"0").split("").map(n=>n==="0"?"A":"B");nodes.push({path:"/"+names.join("/"),label:names.at(-1)!,x:60+(i+.5)*880/2**level,y:35+level*100});}
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="ディレクトリの木。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox="0 0 1000 380" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>ルートを含む15個のディレクトリ。各節点から子のAとBへ接続し、3階層の木を構成する。</desc><g aria-hidden="true">
   {nodes.slice(1).map(n=>{const parent=n.path.slice(0,n.path.lastIndexOf("/"))||"/",p=nodes.find(p=>p.path===parent)!;return <line key={n.path} data-parent={parent} data-child={n.path} x1={p.x} y1={p.y+20} x2={n.x} y2={n.y-20}/>;})}
   {nodes.map(n=><text key={n.path} data-directory={n.path} x={n.x} y={n.y} textAnchor="middle">{n.label}</text>)}
  </g></svg></div><figcaption>{caption}</figcaption></figure>;
 }
 if(profile===legacy2017ReplacementProfile){
  if(values[0]!==0)throw Error("FIGURE_DOMAIN");const cols=[130,190,450,710],top=30,rowHeight=65;
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="FIFOとLRUの解答表。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox="0 0 850 390" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>アからエの4行。FIFOとLRUの置換回数を組にした解答群。</desc><g aria-hidden="true">
   <line x1={cols[1]} y1={top} x2={cols[3]} y2={top}/>
   {Array.from({length:5},(_,i)=><line key={i} x1={cols[0]} y1={top+(i+1)*rowHeight} x2={cols[3]} y2={top+(i+1)*rowHeight}/>)}
   {cols.map((x,i)=><line key={x} x1={x} y1={i===0?top+rowHeight:top} x2={x} y2={top+5*rowHeight}/>)}
   {["FIFO","LRU"].map((t,i)=><text key={t} data-heading={t} x={(cols[i+1]+cols[i+2])/2} y={top+rowHeight/2} textAnchor="middle">{t}</text>)}
   {legacy2017PageChoices.map((row,i)=>["アイウエ"[i],...row.map(String)].map((t,j)=><text key={`${i}-${j}`} data-cell={`${i}-${j}`} x={(cols[j]+cols[j+1])/2} y={top+(i+1.5)*rowHeight} textAnchor="middle">{t}</text>))}
  </g></svg></div><figcaption>{caption}</figcaption></figure>;
 }
 throw Error("FIGURE_PROFILE");
}
