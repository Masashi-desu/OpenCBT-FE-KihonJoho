import { LegacyCommonGateSymbol } from './Legacy2017AutumnAmCommonRules';
import { legacy2017AutumnAmCommonRows,legacy2017AutumnAmCommonNote } from '../core/generators/legacy-2017-autumn-am-common';
import { autumn2016CircuitRows,autumn2016CommonProfile } from '../core/generators/legacy-2016-autumn-am-common';

type Circuit=typeof autumn2016CircuitRows[number]['id'];
function CircuitSymbol({kind,label}:{kind:Circuit;label:string}){
  return <svg viewBox="0 0 110 48" role="img" aria-label={label} data-common-circuit={kind}>
    <g fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      {kind==='resistor'&&<path d="M8 24 H28 L32 15 L39 33 L46 15 L53 33 L60 15 L67 33 L74 15 L78 24 H102"/>}
      {kind==='capacitor'&&<path d="M8 24 H51 M51 11 V37 M58 11 V37 M58 24 H102"/>}
      {kind==='diode'&&<><path d="M8 24 H45 M45 12 L65 24 L45 36 Z M65 10 V38 M65 24 H102"/></>}
      {kind==='transistor'&&<>{[false,true].map((inward,i)=><g key={i} transform={`translate(${i*56} 0)`} data-emitter-arrow={inward?'inward':'outward'} data-emitter-branch={inward?'upper':'lower'}>
        <path d="M3 24 H20 M20 11 V37 M20 17 L36 8 V2 M20 31 L36 40 V46"/>
        <path data-transistor-arrow="true" d={inward?'M32 7 L27 13 L35 12':'M26 34 L33 38 L26 39'} strokeWidth="1.6"/>
      </g>)}</>}
      {kind==='ground'&&<path d="M55 4 V21 M32 21 H76 M41 21 L33 39 M54 21 L46 39 M67 21 L59 39"/>}
      {kind==='amplifier'&&<><path d="M33 3 L77 24 L33 45 Z M8 14 H33 M8 34 H33 M77 24 H102"/><path data-positive-input="true" d="M39 14 H47 M43 10 V18"/><path data-negative-input="true" d="M39 34 H47"/></>}
    </g>
  </svg>;
}

/** Both literal tables from2016 autumn p3, including the source inversion
 * note and both transistor symbols; never an answer-specific helper. */
export function Legacy2016AutumnAmCommonRules({profile,values,caption}:{profile:string;values:number[];caption?:string}){
  if(profile!==autumn2016CommonProfile||values.length!==1||values[0]!==0)throw Error('AM_COMMON_PROFILE');
  return <section className="legacy2017-autumn-am-common" data-common-reference="2016h28a-fe-am-p3">
    <h3>2. 論理回路</h3>
    <div className="table-scroll"><table aria-label={caption?caption+'（論理回路）':'論理回路の図記号と説明'}>
      <thead><tr><th scope="col">図記号</th><th scope="col">説明</th></tr></thead>
      <tbody>{legacy2017AutumnAmCommonRows.map(r=><tr key={r.id}><td><LegacyCommonGateSymbol kind={r.id} label={r.label}/></td><td>{r.label}</td></tr>)}</tbody>
    </table></div>
    <p>{legacy2017AutumnAmCommonNote}</p>
    <h3>3. 回路記号</h3>
    <div className="table-scroll"><table aria-label={caption?caption+'（回路記号）':'回路記号の図記号と説明'}>
      <thead><tr><th scope="col">図記号</th><th scope="col">説明</th></tr></thead>
      <tbody>{autumn2016CircuitRows.map(r=><tr key={r.id}><td><CircuitSymbol kind={r.id} label={r.label}/></td><td>{r.label}</td></tr>)}</tbody>
    </table></div>
  </section>;
}
