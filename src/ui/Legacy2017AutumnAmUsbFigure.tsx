import React from 'react';
import {legacy2017AutumnAmUsbAlt,legacy2017AutumnAmUsbProfile}from '../core/generators/legacy-2017-autumn-am-additions';
/** Geometry is a project-managed redraw of the four individual IPA exam
 * schematics. No specification, photograph, product asset or logo is loaded. */
export function Legacy2017AutumnAmUsbFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!==legacy2017AutumnAmUsbProfile)throw Error('FIGURE_PROFILE');if(values.length!==1)throw Error('FIGURE_DOMAIN');const i=values[0],alt=legacy2017AutumnAmUsbAlt(i);
 return <svg className="legacy2017-autumn-am-usb" data-usb-section={i} role="img" aria-label={alt} viewBox="0 0 180 82"><title>{caption}</title><desc>{alt}</desc>
 {i===0?<g><rect data-part="shell" x="14" y="12" width="152" height="52" rx="4"/><rect data-part="cavity" x="18" y="16" width="144" height="44" rx="1"/><rect data-part="lower-piece" x="18" y="43" width="144" height="17"/>{[36,67,98,129].map((x,j)=><rect key={j} data-contact={j} x={x} y="40" width="14" height="6"/>)}</g>:null}
 {i===1?<g><rect data-part="shell" x="14" y="14" width="152" height="50" rx="17"/><rect data-part="cavity" x="18" y="18" width="144" height="42" rx="13"/><rect data-part="opening" x="29" y="28" width="122" height="22" rx="11"/>{[0,1].map(row=>Array.from({length:12},(_,j)=><rect key={row+'-'+j} data-row={row} data-contact={j} x={41+j*8} y={row===0?26:47} width="5" height="5"/>))}</g>:null}
 {i===2?<g><polygon data-part="shell" points="14,12 166,12 166,34 154,44 154,64 26,64 26,44 14,34"/><polygon data-part="cavity" points="18,16 162,16 162,32 150,42 150,60 30,60 30,42 18,32"/><rect data-part="opening" x="30" y="30" width="120" height="30"/>{[36,60,84,108,132].map((x,j)=><rect key={j} data-contact={j} x={x} y="26" width="18" height="7"/>)}</g>:null}
 {i===3?<g><rect data-part="upper-post" x="36" y="5" width="4" height="7"/><rect data-part="upper-post" x="142" y="5" width="4" height="7"/>{[48,88,128].map(x=><rect key={x} data-part="upper-bump" x={x} y="10" width="4" height="2"/>)}<polygon data-part="shell" points="14,12 166,12 166,32 154,44 26,44 14,32"/><polygon data-part="cavity" points="18,16 162,16 162,30 152,40 28,40 18,30"/><rect data-part="opening" x="38" y="16" width="104" height="14"/>{[52,69,86,103,120].map((x,j)=><path key={j} data-contact={j} d={`M${x},27 V36 H${x+5} V27`}/>)}</g>:null}
 </svg>;
}
