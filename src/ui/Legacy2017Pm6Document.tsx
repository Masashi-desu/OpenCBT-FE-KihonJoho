import React from 'react';
import {pm6Document,pm6Input} from '../core/generators/legacy-2017-pm6';
import {pm6Managed,pm6Profile} from '../core/generators/legacy-2017-pm6-data';
const labels='アイウエオカキ';
function framed(text:string){return text.split(/(【[^】]+】)/).map((s,i)=>s.startsWith('【')?<span key={i} className="pm6-blank" data-blank={s.slice(1,-1)} aria-label={'空欄'+(s.includes('無記名')?'（無記名の指示枠）':s.slice(1,-1))}>{s.includes('無記名')?'\u00a0':s.slice(1,-1)}</span>:s);}
/** Fixed source-owned DOM only. No arbitrary markup or solution helper table. */
export function Legacy2017Pm6Document({profile,values}:{profile:string;values:number[]}){
 if(profile!==pm6Profile||values.length!==3||!(pm6Managed as readonly number[]).includes(values[0]))throw Error('PM6_PROFILE');pm6Input(values.slice(1));
 const doc=pm6Document(values.slice(1)),u=doc.units[values[0]],unit=<T,>(x:T)=>x;
 const t:any=u.kind==='table'?doc.tables.find(t=>t.id===u.tableId):undefined;
 let content:React.ReactNode;
 if(u.kind==='selection-notice'){const [a,b]=u.text!.split('選択欄の選');content=<p className="pm6-selection">{a}選択欄の<span className="pm6-circled">選</span>{b}</p>;}
 else if(u.kind==='subquestion-instruction')content=<p><strong>{u.label}　</strong>{framed(u.text!)}</p>;
 else if(u.kind==='blank-paragraph')content=<p>{framed(u.text!)}</p>;
 else if(u.kind==='fraction-equation')content=<p className="pm6-equation" role="math" aria-label={u.left+'は、'+u.numerator+'を'+u.denominator+'で割った値'}><span>{u.left}　{u.operator}　</span><span className="pm6-fraction"><span>{u.numerator}</span><span>{u.denominator}</span></span></p>;
 else if(u.kind==='choice-group'){const g=doc.choiceGroups[u.groupId! as keyof typeof doc.choiceGroups];content=<section data-group={u.groupId}><p>{u.text}</p><div className={'pm6-bank '+(u.groupId==='d'?'pm6-bank-prose':'')}>{g.values.map((x,i)=><p key={i} data-pm6-choice={u.groupId+':'+i}><span>{labels[i]}　</span>{String(x)}</p>)}</div></section>;}
 else if(t.id==='table1')content=<table data-pm6-table="table1"><caption>{t.caption}</caption><thead><tr><th rowSpan={2}>段階</th><th rowSpan={2}>区分</th><th colSpan={5}>工程</th></tr><tr>{['外部設計','内部設計','プログラム開発','結合テスト','総合テスト'].map(p=><th key={p}>{p}</th>)}</tr></thead><tbody>{t.rows.map((r:any,i:number)=><tr key={i}>{i%2===0&&<th rowSpan={2}>{r.stage}</th>}<th>{r.kind}</th>{r.values.map((x:any,j:number)=><td key={j} data-pm6-cell={'table1:'+i+':'+j} data-state={x===null?'hidden':'shown'} className={x===null?'pm6-hidden':''} aria-label={x===null?'網掛け・非表示':undefined}>{x}</td>)}</tr>)}</tbody></table>;
 else{
  const months:string[]=t.months;const stage=['一期開発','二期開発'];
  content=<table className="pm6-calendar" data-pm6-table={t.id}><caption>{t.caption}</caption><colgroup><col/><col/><col/>{months.map(m=><col key={m}/>)}</colgroup><thead><tr><th colSpan={3}>年</th><th colSpan={9}>2017</th><th colSpan={12}>2018</th></tr><tr><th colSpan={3}>月</th>{months.map(m=><th key={m}>{Number(m.slice(5))}</th>)}</tr></thead><tbody>{stage.map((s,si)=>{let last=0;const cells:React.ReactNode[]=[];for(const p of t.schedules[s]){const start=months.indexOf(p.start),end=months.indexOf(p.end);if(start>last)cells.push(<td key={'gap'+start} colSpan={start-last}/>);cells.push(<td key={p.phase} colSpan={end-start+1} data-phase={t.id+':'+s+':'+p.phase} data-start={start} data-end={end}>{p.phase}</td>);last=end+1;}if(last<21)cells.push(<td key="tail" colSpan={21-last}/>);return<tr key={s}>{si===0&&<th rowSpan={2}>工程</th>}<th colSpan={2}>{s}</th>{cells}</tr>;})}{stage.flatMap((s,si)=>['A社','B社'].map((c,ci)=>{const cells:React.ReactNode[]=[];const row=t.staffing[s][c];for(let m=0;m<row.length;m++){const x=row[m];if(x.state==='inactive-diagonal'){let end=m;while(end+1<row.length&&row[end+1].state==='inactive-diagonal')end++;cells.push(<td key={m} colSpan={end-m+1} data-monthcell={t.id+':'+s+':'+c} data-start={m} data-end={end} data-state="inactive-diagonal" className="pm6-diagonal" aria-label={months[m]+'から'+months[end]+'は作業なし・斜線'}><svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="30" x2="100" y2="0"/></svg></td>);m=end;}else cells.push(<td key={m} data-monthcell={t.id+':'+s+':'+c} data-start={m} data-end={m} data-state={x.state} className={x.state==='hidden'?'pm6-hidden':''} aria-label={x.state==='hidden'?x.month+' 網掛け・非表示':undefined}>{x.value}</td>);}
   return<tr key={s+c}>{si===0&&ci===0&&<th rowSpan={4}>要員数<br/>（人）</th>}{ci===0&&<th rowSpan={2}>{s}</th>}<th>{c}</th>{cells}</tr>;}))}</tbody></table>;
 }
 return unit(<div className="pm6-owned" data-pm6-unit={u.id} data-pm6-page={u.physicalPage}>{content}</div>);
}
