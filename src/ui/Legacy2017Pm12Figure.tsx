import{legacy2017Pm12Figure as inspect,legacy2017Pm12Hex as hex}from'../core/generators/legacy-2017-pm12-data';
import{Legacy2017Pm12Program}from'./Legacy2017Pm12Program';
export function Legacy2017Pm12Figure({profile,values}:{profile:string;values:number[]}){
 const f=inspect(profile,values),m=f.model;
 const heading=profile.endsWith('-bank')||profile.includes('-program-');
 return <div className="legacy-pm12-figure" role="group" aria-label={f.caption} data-legacy-pm12-profile={profile}>
 {heading&&<p className="legacy-pm12-source-heading" data-pm12-caption="top">{profile.includes('-program-')?`〔${f.caption}〕`:f.caption}</p>}
 {profile==='legacy-2017-pm12-program-add64'&&<Legacy2017Pm12Program kind="add64"/>}
 {profile==='legacy-2017-pm12-program-mul32'&&<Legacy2017Pm12Program kind="mul32"/>}
 {f.bank&&<div className="legacy-pm12-bank">{f.bank.map((s,i)=><div key={i} data-pm12-option={i}><span>{'アイウエオカキク'[i]}</span><span>{s}</span></div>)}</div>}
 {profile==='legacy-2017-pm12-storage64'&&<table><thead><tr>{['N','N＋1','N＋2','N＋3'].map(s=><th key={s}>{s}番地</th>)}</tr></thead><tbody><tr>{['最上位16ビット','第2位16ビット','第3位16ビット','最下位16ビット'].map(s=><td key={s}>{s}</td>)}</tr></tbody></table>}
 {profile==='legacy-2017-pm12-storage32'&&<table><thead><tr><th>N番地</th><th>N＋1番地</th></tr></thead><tbody><tr><td>上位16ビット</td><td>下位16ビット</td></tr></tbody></table>}
 {profile==='legacy-2017-pm12-values'&&<div>{[m.left,m.right].map((row,j)=><table key={j}><thead><tr>{row.map((_,i)=><th key={i}>(GR{j+1}){i?`＋${i}`:''}番地</th>)}</tr></thead><tbody><tr>{row.map((n,i)=><td key={i}>{hex(n)}</td>)}</tr></tbody></table>)}</div>}
 {!heading&&<p className="legacy-pm12-source-caption" data-pm12-caption="bottom">{f.caption}</p>}
 </div>;
}
