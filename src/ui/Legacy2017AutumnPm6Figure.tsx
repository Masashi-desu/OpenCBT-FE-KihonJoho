import type {ReactNode} from 'react';
import {legacy2017AutumnPm6Figure as inspect,legacy2017AutumnPm6Names as names,legacy2017AutumnPm6Format as fmt} from '../core/generators/legacy-2017-autumn-pm6-data';
function Text({text}:{text:string}) {return <>{text.split(/(［[bcdef ]］)/g).map((s,i)=>/^［[bcdef ]］$/.test(s)?<span key={i} className="legacy-autumn-pm6-hole" data-autumn-pm6-hole={s[1]===' '?'empty':s[1]} aria-label={s[1]===' '?'空欄':undefined}>{s[1]===' '?'':s[1]}</span>:s)}</>;}
export function Legacy2017AutumnPm6Figure({profile,values,caption}:{profile:string;values:number[];caption:string}) {
 const f=inspect(profile,values),m=f.model;if(caption!==f.caption)throw Error('FIGURE_CAPTION');let content:ReactNode;
 if(f.kind==='selection')content=<div className="legacy-autumn-pm6-selection">選択した問題は，選択欄の<span className="legacy-autumn-pm6-circled">選</span>をマークしてください。マークがない場合は，採点されません。</div>;
 else if(f.kind==='table1')content=<table><caption>{caption}<span className="legacy-autumn-pm6-unit">単位　千円</span></caption><thead><tr><th rowSpan={2}>費目</th>{[2015,2016,2017].map(y=><th colSpan={2} key={y}>{y}年度</th>)}</tr><tr>{Array.from({length:3},(_,i)=><Columns key={i}/>)}</tr></thead><tbody>{[...names,'合計'].map((name,i)=><tr key={name}><th>{name}</th>{(i<5?m.costs[i]:m.totals).map((n,j)=><td key={j}>{fmt(n)}</td>)}</tr>)}</tbody></table>;
 else if(f.kind==='table2')content=<><table><caption>{caption}<span className="legacy-autumn-pm6-unit">単位　千円</span></caption><thead><tr><th>費目</th><th>予算</th></tr></thead><tbody>{[...names,'合計'].map((name,i)=><tr key={name}><th>{name}</th><td className={i===0||i===2?'legacy-autumn-pm6-masked':undefined} data-autumn-pm6-masked={i===0||i===2?'true':undefined}>{i===0||i===2?null:i===3?<span className="legacy-autumn-pm6-hole" data-autumn-pm6-hole="a">a</span>:fmt(i===5?m.total:m.budget[i])}</td></tr>)}</tbody></table><p className="legacy-autumn-pm6-note">注記　網掛けの部分は表示していない。</p></>;
 else if(f.kind.startsWith('bank-'))content=<><p className="legacy-autumn-pm6-bank-heading">{caption}</p><div className={'legacy-autumn-pm6-bank '+([1,3,4,6].includes(f.group)?'legacy-autumn-pm6-bank-inline':'')}>{f.banks[f.group].map((text,i)=><div key={i} data-autumn-pm6-choice={'アイウエオカ'[i]}><span>{'アイウエオカ'[i]}</span><span>{text}</span></div>)}</div></>;
 else content=<p className="legacy-autumn-pm6-text"><Text text={caption}/></p>;
 return <div className={'legacy-autumn-pm6-figure legacy-autumn-pm6-'+f.kind} data-autumn-pm6-profile={profile} aria-label={f.alt}>{content}</div>;
}
function Columns(){return <><th>予算</th><th>実績</th></>;}
