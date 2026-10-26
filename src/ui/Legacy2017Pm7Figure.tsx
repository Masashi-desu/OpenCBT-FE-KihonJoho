import React from'react';
import{pm7Figure,pm7Labels}from'../core/generators/legacy-2017-pm7-data';
/** Source-owned merged cells and blanks. Question JSON supplies no markup. */
export function Legacy2017Pm7Figure({profile,values}:{profile:string;values:number[]}){
 const f=pm7Figure(profile,values),frame=(x:string)=>x.split(/(【[^】]+】)/).map((s,i)=>s.startsWith('【')?<span className="pm7-blank" key={i} aria-label={'空欄'+s.slice(1,-1)}>{s.includes('無記名')?'\u00a0':s.slice(1,-1)}</span>:s);
 if(f.kind==='text')return <p className={'pm7-document'+(values[1]===0?' pm7-selection':'')}>{values[1]===0?<>{f.data.split('選択欄の選')[0]}選択欄の<span className="pm7-circled">選</span>{f.data.split('選択欄の選')[1]}</>:frame(f.data)}</p>;
 if(f.kind==='pair-bank'||f.kind==='matrix-bank')return<section className="pm7-document"><p>{f.caption}</p><div className="pm7-choice-bank">{f.data.map((_,i)=><div key={i}><span>{pm7Labels[i]}　</span><Legacy2017Pm7Figure profile={profile} values={[f.kind==='pair-bank'?1:2,i,...values.slice(2)]}/></div>)}</div></section>;
 if(f.kind==='pair'||f.kind==='matrix')return<table className="pm7-choice-table" aria-label={f.caption+' '+pm7Labels[values[1]]}><tbody>{f.kind==='pair'?f.data.map((x,i)=><tr key={i}><td>{x}</td></tr>):f.data.map((r,i)=><tr key={i}>{r.map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></table>;
 if(f.kind==='decision')return<div className="pm7-document"><table className="pm7-decision" data-pm7-table="decision"><caption>{f.caption}</caption><colgroup><col/>{f.data.remote.map((_,i)=><col key={i}/>)}</colgroup><tbody>
  <tr><th scope="row">遠隔地倉庫</th>{f.data.remote.map((x,i)=><td key={i}>{x}</td>)}</tr>
  <tr><th scope="row">A商品群</th>{f.data.groupA.map((x,i)=><td key={i}>{x}</td>)}</tr>
  <tr><th rowSpan={2} scope="rowgroup">{frame('【d】')}</th>{f.data.condition1.map((x,i)=><td key={i}>{x}</td>)}</tr>
  <tr>{f.data.condition2.map((x,i)=><td key={i}>{x}</td>)}</tr>
  {f.data.actions.map((r,ri)=><tr key={ri}><th scope="row">{4-ri}週間分の出荷予想量を在庫基準量とする</th>{r.flatMap((x,ci)=>{if(ci===3)return ri===0?[<td key={ci} colSpan={4} rowSpan={3} data-pm7-blank="e">{frame('【e】')}</td>]:[];if(ci>3&&ci<=6)return[];return[<td key={ci}>{x}</td>];})}</tr>)}
 </tbody></table></div>;
 if(f.kind==='inventory')return<div className="pm7-document"><table className="pm7-inventory" data-pm7-table="inventory"><caption>{f.caption}<span>単位：百箱</span></caption><thead><tr>{['商品','商品群','賞味期限の区分','在庫量'].map(x=><th key={x} rowSpan={2}>{x}</th>)}<th colSpan={4}>出荷予想量</th></tr><tr>{['1週目（当該週）','2週目','3週目','4週目'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{f.data.map(r=><tr key={r.product}><th scope="row">{r.product}</th><td>{r.group}</td><td>{r.shelf}</td><td>{r.stock}</td>{r.weekly.map((n,i)=><td key={i}>{n}</td>)}</tr>)}</tbody></table></div>;
 throw Error('PM7_FIGURE_KIND');
}
