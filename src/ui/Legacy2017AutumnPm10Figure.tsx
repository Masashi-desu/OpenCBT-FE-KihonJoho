import {Fragment} from 'react';
import {legacy2017AutumnPm10Figure as inspect} from '../core/generators/legacy-2017-autumn-pm10-model';
import {legacy2017AutumnPm10Program1 as p1,legacy2017AutumnPm10Program2 as p2,legacy2017AutumnPm10Changes as changes} from '../core/generators/legacy-2017-autumn-pm10';
function Inline({text}:{text:string}){return <>{text.split(/(\[[abcdef]\])/).map((s,i)=>/^\[[abcdef]\]$/.test(s)?<span key={i} className={`legacy-autumn-pm10-blank legacy-autumn-pm10-blank-${s[1]}`} data-pm10-blank={s[1]}>{s[1]}</span>:<Fragment key={i}>{s}</Fragment>)}</>;}
function Record({which}:{which:number}){const labels=which===0?['利用番号','入庫時刻','出庫時刻','駐車料金']:which===1?['利用番号','入庫時刻']:['利用番号','出庫時刻','駐車料金'],digits=which===0?[8,12,12,6]:which===1?[8,12]:[8,12,6],width=which===0?680:which===1?350:555;return <svg className="legacy-autumn-pm10-record" viewBox={`0 0 ${width} 100`} role="group" aria-label={`図${which+1}の各フィールドと桁数`}>
 {labels.map((s,i)=>{const gap=which===2&&i===2?40:0,x=10+i*165+gap;return <g key={s} data-pm10-field={s}><rect x={x} y={12} width={165} height={73}/><text x={x+82.5} y={41} textAnchor="middle">{s}</text><text x={x+82.5} y={69} textAnchor="middle">{digits[i]}桁</text></g>;})}
 </svg>;}
export function Legacy2017AutumnPm10Figure({profile,values}:{profile:string;values:number[]}){
 const f=inspect(profile,values);return <div className="legacy-autumn-pm10-figure" role="group" aria-label={f.caption} data-legacy-autumn-pm10-profile={profile}>
 {profile.endsWith('-record')&&<><Record which={values[1]}/><p className="legacy-autumn-pm10-caption">{f.caption}</p></>}
 {(profile.endsWith('-program1')||profile.endsWith('-program2'))&&<><p>〔{f.caption}〕</p><p>（行番号）</p><div className="legacy-autumn-pm10-program">{(profile.endsWith('-program1')?p1:p2(f.model.day)).split('\n').map((s,i)=><div className="legacy-autumn-pm10-line" data-pm10-line={i+1} key={i}><span>{i+1}</span><code><Inline text={s}/></code></div>)}</div></>}
 {profile.endsWith('-changes')&&<><p className="legacy-autumn-pm10-caption">{f.caption}</p><table><thead><tr><th>処理</th><th>変更内容</th></tr></thead><tbody>{changes([f.model.v]).map(([where,text])=><tr key={where}><td>{where}</td><td><pre><Inline text={text}/></pre></td></tr>)}</tbody></table></>}
 {f.bank&&<><p>{f.caption}</p><div className="legacy-autumn-pm10-bank">{f.bank.map((s,i)=><div key={i} data-pm10-option={i}><span>{'アイウエオカ'[i]}</span><code>{s}</code></div>)}</div></>}
 </div>;
}
