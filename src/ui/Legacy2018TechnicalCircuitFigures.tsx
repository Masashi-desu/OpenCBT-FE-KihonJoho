import {useId} from "react";
import {legacy2018TechnicalCircuitAllowed,legacy2018TechnicalCircuitAlt} from "../core/generators/legacy-2018-technical-circuit";
/** Gate shapes, inversion bubbles and wires carry the actual question. */
export function Legacy2018TechnicalCircuitFigure({profile,values:v,caption}:{profile:string;values:number[];caption:string}){
 if(!legacy2018TechnicalCircuitAllowed(profile,v))throw Error("PARAMETER_CONSTRAINT");const id=useId().replace(/:/g,""),truth=profile==="legacy-2018-majority-truth-table",and="M 0 0 L 42 0 A 30 30 0 0 1 42 60 L 0 60 Z",or="M 0 0 Q 42 0 72 30 Q 42 60 0 60 Q 18 30 0 0 Z",xor="M -10 0 Q 8 30 -10 60";
 const gate=(kind:number,x:number,y:number,index:number)=><g key={index} data-gate={index} transform={`translate(${x} ${y})`}><path data-gate-outline="body" d={kind===0||kind===3?and:or} fill="var(--surface)" stroke="currentColor" strokeWidth="2.5"/>{(kind===1||kind===2)&&[15,45].map(y=><line key={y} data-input-pin={y} x1="0" y1={y} x2="7" y2={y}/>)}{kind===2&&<path data-gate-outline="xor" d={xor} fill="none" stroke="currentColor" strokeWidth="2.5"/>}{kind===3&&<circle data-inversion="output" cx="78" cy="30" r="6" fill="var(--surface)"/>}</g>;
 const end=(kind:number,x:number)=>x+(kind===3?84:72),pairEnd=end(v[0],210),midEnd=end(v[1],420),outEnd=end(v[2],600);
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の回路又は真理値表。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={truth?"0 0 500 600":"0 0 780 370"} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2018TechnicalCircuitAlt(profile,v)}</desc><g aria-hidden="true" fill="none">{truth?<>
  <rect x="70" y="30" width="360" height="500" fill="none"/>
  {Array.from({length:9},(_,i)=><line key={i} x1="70" y1={80+i*50} x2="430" y2={80+i*50}/>)}
  {[160,250,340].map((x,i)=><line key={x} x1={x} y1={i===2?30:80} x2={x} y2="530"/>)}
  <text x="205" y="55" textAnchor="middle">入力</text><text x="385" y="55" textAnchor="middle">出力</text>
  {["A","B","C","Y"].map((s,i)=><text key={s} x={115+i*90} y="105" textAnchor="middle">{s}</text>)}
  {Array.from({length:8},(_,i)=>{const a=i>>2,b=(i>>1)&1,c=i&1;return[a,b,c,Number(a+b+c>=2)].map((s,j)=><text key={`${i}-${j}`} data-truth-cell={`${i}-${j}`} x={115+j*90} y={155+i*50} textAnchor="middle">{s}</text>);})}
 </>:<>
  <text x="35" y="65">A</text><text x="35" y="95">B</text><text x="35" y="195">C</text>
  <path data-wire="A-upper" d="M 55 65 L 210 65"/><path data-wire="A-lower" d="M 95 65 L 95 86 Q 78 95 95 104 L 95 186 Q 78 195 95 204 L 95 265 L 210 265"/>
  <path data-wire="B-upper" d="M 55 95 L 210 95"/><path data-wire="B-middle" d="M 125 95 L 125 165 L 210 165"/>
  <path data-wire="C-middle" d="M 55 195 L 210 195"/><path data-wire="C-lower" d="M 155 195 L 155 256 Q 138 265 155 274 L 155 295 L 210 295"/>
  {[[95,65],[125,95],[155,195]].map(([x,y],i)=><circle key={i} data-junction={i} cx={x} cy={y} r="4" fill="currentColor"/>)}
  {gate(v[0],210,50,0)}{gate(v[0],210,150,1)}{gate(v[0],210,250,2)}{gate(v[1],420,110,3)}{gate(v[2],600,165,4)}
  <path data-wire="upper-middle" d={`M ${pairEnd} 80 L 365 80 L 365 125 L 420 125`}/><path data-wire="middle-middle" d={`M ${pairEnd} 180 L 390 180 L 390 155 L 420 155`}/>
  <path data-wire="middle-final" d={`M ${midEnd} 140 L 550 140 L 550 180 L 600 180`}/><path data-wire="lower-final" d={`M ${pairEnd} 280 L 550 280 L 550 210 L 600 210`}/><path data-wire="output" d={`M ${outEnd} 195 L 720 195`}/><text x="738" y="195">Y</text>
 </>}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
