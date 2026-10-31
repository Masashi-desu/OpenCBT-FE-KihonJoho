import React from 'react';
import {legacy2017AutumnAmCommonProfile,legacy2017AutumnAmCommonRows,legacy2017AutumnAmCommonHeading,legacy2017AutumnAmCommonPremise,legacy2017AutumnAmCommonNote} from '../core/generators/legacy-2017-autumn-am-common';
type Gate=typeof legacy2017AutumnAmCommonRows[number]['id'];
function GateSymbol({kind,label}:{kind:Gate;label:string}){
 const invert=['nand','nor','xnor','not'].includes(kind),and=['and','nand'].includes(kind),or=['or','nor','xor','xnor'].includes(kind),xor=['xor','xnor'].includes(kind),out=and?48:52;
 return <svg viewBox="0 0 80 46" role="img" aria-label={label} data-common-gate={kind}>
  <g fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeLinejoin="round">
   {and?<><path data-gate-body="and" d="M20 9 H36 A12 12 0 0 1 36 33 H20 Z"/><path data-gate-inputs="2" d="M5 15 H20 M5 27 H20"/></>:or?<><path data-gate-body="or" d="M18 9 Q40 7 52 21 Q40 35 18 33 Q29 21 18 9 Z"/>{xor&&<path data-xor-curve="true" d="M13 9 Q24 21 13 33"/>}<path data-gate-inputs="2" d="M5 15 H21 M5 27 H21"/></>:<><path data-gate-body="triangle" d="M22 9 L52 21 L22 33 Z"/><path data-gate-inputs="1" d="M5 21 H22"/>{kind==='tristate'&&<path data-control-input="true" d="M32 1 V13"/>}</>}
   {invert&&<circle data-output-negation="true" cx={out+3} cy="21" r="3"/>}
   <path data-gate-output="1" d={`M${out+(invert?6:0)} 21 H72`}/>
  </g>
 </svg>;
}
/** Literal source-owned common reference; no answer-specific helper content. */
export function Legacy2017AutumnAmCommonRules({profile,values,caption}:{profile:string;values:number[];caption?:string}){
 if(profile!==legacy2017AutumnAmCommonProfile||!Array.isArray(values)||values.length!==1||values[0]!==0)throw Error('AM_COMMON_PROFILE');
 return <LegacyCommonGateTable collection="2017h29a-fe-am" caption={caption}/>;
}
/** The source pixels confirm the same table text/structure in these three booklets. */
export function LegacyCommonGateTable({collection,caption}:{collection:"2017h29a-fe-am"|"2018h30h-fe-am"|"2018h30a-fe-am";caption?:string}){
 return <section className="legacy2017-autumn-am-common" data-common-reference={collection+"-p2"}>
  <h3>{legacy2017AutumnAmCommonHeading}</h3><p>{legacy2017AutumnAmCommonPremise}</p>
  <div className="table-scroll"><table aria-label={caption}><thead><tr><th scope="col">図記号</th><th scope="col">説明</th></tr></thead>
   <tbody>{legacy2017AutumnAmCommonRows.map(r=><tr key={r.id}><td><GateSymbol kind={r.id} label={r.label}/></td><td>{r.label}</td></tr>)}</tbody>
  </table></div><p>{legacy2017AutumnAmCommonNote}</p>
 </section>;
}
