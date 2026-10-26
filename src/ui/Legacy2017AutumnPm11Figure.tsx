import{Fragment}from'react';
import{legacy2017AutumnPm11Figure as inspect}from'../core/generators/legacy-2017-autumn-pm11-model';
import{legacy2017AutumnPm11Program1 as p1,legacy2017AutumnPm11Program2 as p2,legacy2017AutumnPm11Replacement2 as r2,legacy2017AutumnPm11Replacement3 as r3}from'../core/generators/legacy-2017-autumn-pm11';
function Inline({text}:{text:string}){return<>{text.split(/(\[[abcde]\])/).map((s,i)=>/^\[[abcde]\]$/.test(s)?<span key={i} data-pm11-blank={s[1]} className={`legacy-autumn-pm11-blank legacy-autumn-pm11-blank-${s[1]}`}>{s[1]}</span>:<Fragment key={i}>{s}</Fragment>)}</>;}
function Alpha(){return<span className="legacy-autumn-pm11-alpha-anchor"><svg className="legacy-autumn-pm11-alpha" viewBox="0 0 110 60" role="group" aria-label="α：sorter.sortの置換対象2行をまとめる右括弧と左向き矢印"><path data-pm11-alpha-bracket="2-lines" d="M5 4 Q14 4 14 13 V23 Q14 30 22 30 Q14 30 14 37 V47 Q14 56 5 56"/><path d="M80 30 H25"/><path className="legacy-autumn-pm11-alpha-head" d="M25 30 L37 23 L37 37 Z"/><text x={88} y={37}>α</text></svg></span>;}
export function Legacy2017AutumnPm11Figure({profile,values}:{profile:string;values:number[]}){const f=inspect(profile,values),m=f.model;return<div className="legacy-autumn-pm11-figure" role="group" aria-label={f.caption} data-legacy-autumn-pm11-profile={profile}>
 {profile.endsWith('-example')&&<><svg className="legacy-autumn-pm11-example" viewBox="0 0 880 215" role="group" aria-label="左の五つの入力行から右の整列後の五行への矢印対応">
 <defs><marker id={`autumn-pm11-arrow-${m.v}`} markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto"><path d="M0 0 L8 4 L0 8 Z"/></marker></defs>
 {[m.rows,m.example].map((rows,side)=><g key={side} data-pm11-example-side={side}>{rows.map((row,i)=><g key={i} data-pm11-example-row={i}>{row.map((s,j)=><g key={j}><rect x={10+side*500+j*120} y={15+i*34} width={120} height={34}/><text x={18+side*500+j*120} y={38+i*34}>{s}</text></g>)}</g>)}</g>)}
 {[0,1,2,3,4].map(i=><line key={i} x1={380} y1={32+i*34} x2={498} y2={32+[0,4,3,2,1][i]*34} markerEnd={`url(#autumn-pm11-arrow-${m.v})`} data-pm11-row-arrow={`${i}:${[0,4,3,2,1][i]}`}/>)}
 </svg><p className="legacy-autumn-pm11-caption">{f.caption}</p></>}
 {profile.endsWith('-output')&&<><pre className="legacy-autumn-pm11-output">{m.example.map(r=>r.join(' ')).join('\n')}</pre><p className="legacy-autumn-pm11-caption">{f.caption}</p></>}
 {(profile.endsWith('-program1')||profile.endsWith('-program2'))&&<><p>〔{f.caption}〕</p><div className="legacy-autumn-pm11-program">{(profile.endsWith('-program1')?p1:p2(values)).split('\n').map((s,i)=><div key={i} data-pm11-program-line={i+1}><code><Inline text={s}/></code>{profile.endsWith('-program2')&&s.includes('new TableSorter.OrderBy("num", 1, true)')&&<Alpha/>}</div>)}</div></>}
 {f.bank&&<><p>{values[1]<5?f.caption:'解答群'}</p><div className="legacy-autumn-pm11-bank">{f.bank.map((s,i)=><div key={i} data-pm11-option={i}><span>{'アイウエオ'[i]}</span><code>{s}</code></div>)}</div></>}
 {profile.endsWith('-replacement')&&<pre className="legacy-autumn-pm11-replacement">{values[1]===0?r2:r3}</pre>}
 </div>;}
