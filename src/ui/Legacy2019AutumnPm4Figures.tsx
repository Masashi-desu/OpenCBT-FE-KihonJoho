import React from'react';
import{useId}from'react';
type Input={values:number[];alt:string;caption:string};
export const profiles=['legacy-2019-autumn-pm4-nat-selection','legacy-2019-autumn-pm4-nat-rewrite-table','legacy-2019-autumn-pm4-nat-instruction','legacy-2019-autumn-pm4-nat-dns64-statement','legacy-2019-autumn-pm4-nat64-packets'];
const Blank=({name}:{name?:string})=><span className="nat-blank" aria-label={name?`空欄${name}`:'空欄'}>{name??'　'}</span>;
function textRuns(text:string){return text.split(/(［a[123]］)/).map((r,i)=>/^［a[123]］$/.test(r)?<Blank key={i} name={r.slice(1,-1)}/>:r);}
export function Legacy2019AutumnPm4Figure({profile,values,caption,alt}:{profile:string}&Input){
 const id=useId().replaceAll(':','');
 if(!profiles.includes(profile)||!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype||Reflect.ownKeys(values).length!==values.length+1||Array.from({length:values.length},(_,i)=>Object.getOwnPropertyDescriptor(values,String(i))).some(s=>!s||!s.enumerable||!('value'in s)))throw Error('NAT_PROFILE_VALUES');
 if(values.some(v=>!Number.isSafeInteger(v)||Object.is(v,-0)))throw Error('NAT_PROFILE_VALUES');
 if(profile==='legacy-2019-autumn-pm4-nat64-packets'?(values.length!==2||!values.every(Number.isSafeInteger)||values[0]<0||values[0]>15||values[1]<0||values[1]>5):(values.length!==1||values[0]!==0))throw Error('NAT_PROFILE_VALUES');
 if(profile==='legacy-2019-autumn-pm4-nat-selection')return <p className="nat-notice" data-source-unit="selection-notice">選択した問題は，選択欄の<span className="nat-circle" aria-label="丸囲みの選">選</span>をマークしてください。マークがない場合は，採点されません。</p>;
 if(profile==='legacy-2019-autumn-pm4-nat-instruction')return <p data-source-unit="subquestion-2">設問2 次の記述中の<Blank/>に入れる正しい答えを，解答群の中から選べ。ここで，a1～a3に入れる答えは，aに関する解答群の中から組合せとして正しいものを選ぶものとする。</p>;
 if(profile==='legacy-2019-autumn-pm4-nat-dns64-statement')return <p data-source-unit="nat64-step1">{textRuns(alt)}</p>;
 if(profile==='legacy-2019-autumn-pm4-nat-rewrite-table')return <div className="nat-pan nat-table" tabIndex={0} role="group" aria-label="表1。左右にスクロールできます。"><table><caption>{caption}</caption><thead><tr><td className="nat-corner" aria-hidden="true"/><th scope="col">書換え対象</th><th scope="col">書換え前</th><th scope="col">書換え後</th></tr></thead><tbody>
 <tr><th rowSpan={2} scope="rowgroup">送信<br/>パケット</th><td>送信元IPアドレス</td><td>LAN内機器のIPアドレス</td><td>ルータのグローバルIPアドレス</td></tr><tr><td>送信元ポート番号</td><td>LAN内機器のポート番号</td><td>ルータのポート番号</td></tr>
 <tr><th rowSpan={2} scope="rowgroup">受信<br/>パケット</th><td>宛先IPアドレス</td><td>ルータのグローバルIPアドレス</td><td>LAN内機器のIPアドレス</td></tr><tr><td>宛先ポート番号</td><td>ルータのポート番号</td><td>LAN内機器のポート番号</td></tr></tbody></table></div>;
 if(profile!=='legacy-2019-autumn-pm4-nat64-packets')throw Error('NAT_PROFILE');
 const n=networkProfiles[values[0]],ports=portProfiles[values[1]];if(!n||!ports)throw Error('NAT_VALUE');
 const r4=`192.168.0.${n[0]}`,s4=`192.168.0.${n[1]}`,r6=`fc00::${n[2]}`,c6=`fc00::${n[3]}`,s6=`64:ff9b::c0a8:${n[1].toString(16)}`;
 const packets=[{id:'outbound-v6',label:'IPv6パケット',values:[s6,String(ports[0]),c6,String(ports[1])]},{id:'outbound-v4',label:'IPv4パケット',values:[{blank:'b'},String(ports[0]),{blank:'c'},String(ports[2])]},{id:'return-v4',label:'IPv4パケット',values:[{blank:'c'},String(ports[2]),{blank:'b'},String(ports[0])]},{id:'return-v6',label:'IPv6パケット',values:[c6,String(ports[1]),{blank:'d'},String(ports[0])]}];
 const fieldNames=['宛先IPアドレス','宛先ポート番号','送信元IPアドレス','送信元ポート番号'],ys=[170,370,570,770];
 const arrows=[{id:'send',x1:180,y1:243,x2:360,y2:243,label:'送信',tx:250,ty:232},{id:'translate-out',x1:595,y1:335,x2:595,y2:370,label:'変換',tx:630,ty:359},{id:'forward-out',x1:830,y1:443,x2:1000,y2:443,label:'転送',tx:910,ty:432},{id:'reply',x1:1000,y1:643,x2:830,y2:643,label:'返信',tx:910,ty:632},{id:'translate-in',x1:595,y1:735,x2:595,y2:770,label:'変換',tx:630,ty:759},{id:'forward-in',x1:360,y1:843,x2:180,y2:843,label:'転送',tx:250,ty:832}];
 return <figure className="nat-packet"><div className="nat-pan" tabIndex={0} role="group" aria-label="NAT64の図。左右にスクロールできます。"><svg className="nat-svg" width="1180" height="1050" viewBox="0 0 1180 1050" role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}><title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc><defs><marker id={id+'-arrow'} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7"/></marker></defs><g aria-hidden="true">
 <g data-equipment="client6"><rect x="30" y="30" width="150" height="930"/><text x="105" y="62">IPv6機器</text><text x="105" y="90">IPアドレス</text><text x="105" y="118" data-ip="client6">{c6}</text></g>
 <g data-equipment="translator"><rect x="340" y="30" width="510" height="930"/><text x="595" y="62">NAT64ルータ</text><text x="475" y="100">IPv6のIPアドレス</text><text x="715" y="100">IPv4のIPアドレス</text><text x="475" y="128" data-ip="router6">{r6}</text><text x="715" y="128" data-ip="router4">{r4}</text></g>
 <g data-equipment="server4"><rect x="1000" y="30" width="150" height="930"/><text x="1075" y="62">IPv4機器</text><text x="1075" y="90">IPアドレス</text><text x="1075" y="118" data-ip="server4">{s4}</text></g>
 {packets.map((b,i)=><g key={b.id} data-packet={b.id}><rect x="360" y={ys[i]} width="470" height="165"/><text x="375" y={ys[i]+26} className="nat-left">{b.label}</text>{b.values.map((v,j)=><g key={j} data-field={j}><text x="390" y={ys[i]+56+j*30} className="nat-left">{fieldNames[j]} ― </text>{typeof v==='object'?<g data-blank={v.blank}><rect x="636" y={ys[i]+35+j*30} width="155" height="26"/><text x="714" y={ys[i]+56+j*30}>{v.blank}</text></g>:<text x="636" y={ys[i]+56+j*30} className="nat-left" data-value={v}>{v}</text>}</g>)}</g>)}
 {arrows.map(a=><g key={a.id} data-arrow={a.id}><line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} markerEnd={`url(#${id}-arrow)`}/><text x={a.tx} y={a.ty}>{a.label}</text></g>)}
 <text x="30" y="994" className="nat-left" data-prefix-note="true">注記 プレフィクスは，64:ff9b:0:0:0:0とする。</text><text x="590" y="1032">{caption}</text></g></svg></div></figure>;
}
// Independently supplied fixed rendering parameter table; tested against producer binding.
export const networkProfiles=[[1,2,1,2],[1,3,1,3],[1,4,2,3],[1,5,2,4],[2,1,3,1],[2,3,3,2],[2,4,3,4],[2,5,4,1],[3,1,4,2],[3,2,4,3],[3,4,5,2],[3,5,5,3],[4,1,5,4],[4,2,6,1],[4,3,6,2],[8,9,8,9]];
export const portProfiles=[[80,50000,60000],[81,51000,61000],[82,52000,62000],[83,53000,63000],[84,54000,64000],[85,55000,65000]];
