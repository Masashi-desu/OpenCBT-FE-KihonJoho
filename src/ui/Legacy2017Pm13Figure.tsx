import type{ReactNode}from'react';
import{legacy2017Pm13Figure as inspect,legacy2017Pm13Rates as rates,legacy2017Pm13RegionNames as regions,legacy2017Pm13Prefectures as prefectures,legacy2017Pm13Macro as macro,legacy2017Pm13MacroFrames as frames}from'../core/generators/legacy-2017-pm13-data';
const fmt=(n:number)=>n.toLocaleString('en-US');
const cell=(address:string,value:ReactNode)=><td data-pm13-cell={address}>{typeof value==='number'?fmt(value):value}</td>;
function ColumnHeads({letters}:{letters:string[]}){return <thead><tr><th/>{letters.map((s,i)=><th key={i}>{s}</th>)}</tr></thead>;}
function CalculationHeader(){return <><tr><th>1</th><td colSpan={8}>料金計算表</td></tr><tr><th>2</th><td rowSpan={2}>発送先<br/>都道府県名</td><td colSpan={3}>発送商品数量</td><td rowSpan={2}>商品総重量<br/>（g）</td><td rowSpan={2}>重量<br/>区分</td><td rowSpan={2}>梱包後重量<br/>（g）</td><td rowSpan={2}>発送料金<br/>（円）</td></tr><tr><th>3</th>{['X','Y','Z'].map(s=><td key={s}>{s}</td>)}</tr></>;}
function Equation({kind}:{kind:'a'|'b'|'cd'}){
 const hole=(label:string,x:number,width:number)=><g data-pm13-equation-hole={label}><rect x={x} y={13} width={width} height={36} className="legacy-pm13-hole"/><text x={x+width/2} y={39} textAnchor="middle">{label}</text></g>;
 return <svg viewBox={`0 0 ${kind==='a'?800:kind==='b'?500:610} 65`} className={`legacy-pm13-equation legacy-pm13-equation-${kind}`} role="group" aria-label={kind==='a'?'セルC16の式、空欄a':kind==='b'?'セルF4の式、空欄b':'セルH4の式、空欄cとd'} data-pm13-equation={kind}>
 {kind==='a'?<><text x={20} y={39} data-pm13-equation-text="prefix">IF(料金計算!$A4=null, null, </text>{hole('a',410,340)}<text x={762} y={39} data-pm13-equation-text="suffix">)</text></>:kind==='b'?<><text x={20} y={39} data-pm13-equation-text="prefix">IF(E4=0, '−', </text>{hole('b',220,210)}<text x={442} y={39} data-pm13-equation-text="suffix">)</text></>:<><text x={20} y={39} data-pm13-equation-text="prefix">IF(</text>{hole('c',65,190)}<text x={270} y={39} data-pm13-equation-text="middle">, '−', </text>{hole('d',365,190)}<text x={568} y={39} data-pm13-equation-text="suffix">)</text></>}
 </svg>;
}
function Macro(){
 const step=32,top=30,depths=[0,0,0,1,0,0,0,1,1,1,1,1,2,2,3,3,4,4,5,6,5,5,4,3,2,1,1,2,1,1,0];
 const marker=(glyph:string,x:number,y:number,row:number)=>glyph==='■'?<rect x={x-7} y={y-15} width={14} height={14} data-pm13-marker="■"/>:<path d={glyph==='▲'?`M ${x-8} ${y} L ${x} ${y-16} L ${x+8} ${y} Z`:`M ${x-8} ${y-15} L ${x} ${y+1} L ${x+8} ${y-15} Z`} data-pm13-marker={glyph} data-pm13-marker-row={row}/>;
 return <svg className="legacy-pm13-macro" viewBox={`0 0 1080 ${top+step*macro.length}`} role="group" aria-label="原のマクロPackage_count全31行" data-pm13-macro="Package_count">
  {[...frames.loops.map(([from,to,depth])=>({from,to,depth,kind:'loop'})),...frames.conditions.map(([from,to,depth])=>({from,to,depth,kind:'condition'}))].map(f=><line key={f.kind+f.from} x1={18+f.depth*24} x2={18+f.depth*24} y1={top+(f.from-1)*step-9} y2={top+(f.to-1)*step-9} data-pm13-frame={`${f.kind}:${f.from}:${f.to}:${f.depth}`}/>)}
  {macro.map((source,index)=>{const glyph=source[0],controlled=['■','▲','▼'].includes(glyph),x=18+depths[index]*24,y=top+index*step,text=controlled||glyph==='・'?source.slice(1):source,hole=/［([ef])］/.exec(text),isEnd=text.length===0;return <g key={index} data-pm13-macro-row={index+1} transform={`translate(0 ${y})`}>
   {controlled&&marker(glyph,x,0,index+1)}
   {glyph==='・'&&<circle cx={x} cy={-7} r={2.7} data-pm13-marker="・"/>}
   {hole?<><rect x={x+18} y={-22} width={hole[1]==='e'?260:340} height={28} className="legacy-pm13-hole" data-pm13-hole={hole[1]}/><text x={x+18+(hole[1]==='e'?130:170)} textAnchor="middle" data-pm13-row-text="hole">{hole[1]}</text></>:!isEnd&&<text x={controlled||glyph==='・'?x+18:x-7} data-pm13-row-text="source">{text}</text>}
  </g>;})}
 </svg>;
}
export function Legacy2017Pm13Figure({profile,values}:{profile:string;values:number[]}){
 const f=inspect(profile,values),m=f.model;
 const heading=profile.endsWith('-bank')||profile.endsWith('-macro');
 const calcRow=(large=false)=><tr><th>4</th>{cell('料金計算!A4',m.destination)}{(large?m.shipping:m.example).map((n,i)=><td key={i} data-pm13-cell={`料金計算!${'BCD'[i]}4`}>{n}</td>)}{cell('料金計算!E4',large?m.shippingWeight:m.exampleWeight)}{cell('料金計算!F4',large?'×':m.exampleCategory)}{cell('料金計算!G4',large?'−':m.examplePacked)}{cell('料金計算!H4',large?'−':m.exampleRate)}</tr>;
 return <div className="legacy-pm13-figure" role="group" aria-label={f.caption} data-legacy-pm13-profile={profile}>
  {heading&&<p className="legacy-pm13-source-heading" data-pm13-caption="top">{profile.endsWith('-macro')?`〔${f.caption}〕`:f.caption}</p>}
  {f.bank&&<div className="legacy-pm13-bank">{f.bank.map((s,i)=><div key={i} data-pm13-option={i}><span>{'アイウエオカ'[i]}</span><span>{s}</span></div>)}</div>}
  {profile==='legacy-2017-pm13-a-equation'&&<Equation kind="a"/>}{profile==='legacy-2017-pm13-b-equation'&&<Equation kind="b"/>}{profile==='legacy-2017-pm13-cd-equation'&&<Equation kind="cd"/>}
  {profile==='legacy-2017-pm13-macro'&&<Macro/>}
  {profile==='legacy-2017-pm13-rate-sheet'&&<table><ColumnHeads letters={['A','B','C','D','E','⋯','M','N']}/><tbody>
   <tr><th>1</th><td colSpan={8}>料金表（単位：円）</td></tr><tr><th>2</th><td colSpan={2}>着地域区分</td>{regions.slice(0,3).map((s,i)=><td key={s} data-pm13-cell={`料金表!${'CDE'[i]}2`}>{s}</td>)}<td>⋯</td>{regions.slice(3).map((s,i)=><td key={s} data-pm13-cell={`料金表!${'MN'[i]}2`}>{s}</td>)}</tr>
   {Array.from({length:8},(_,r)=><tr key={r}><th>{r+3}</th>{r===0&&<td colSpan={2} rowSpan={8} className="legacy-pm13-vertical">都道府県名</td>}{[0,1,2].map(c=><td key={c} data-pm13-cell={`料金表!${'CDE'[c]}${r+3}`}>{prefectures[c][r]??''}</td>)}<td>⋯</td>{[3,4].map(c=><td key={c} data-pm13-cell={`料金表!${'MN'[c-3]}${r+3}`}>{prefectures[c][r]??''}</td>)}</tr>)}
   {rates.map((row,r)=><tr key={r}><th>{r+11}</th>{r===0&&<td rowSpan={5} className="legacy-pm13-vertical">重量区分</td>}{cell(`料金表!B${r+11}`,r+1)}{row.slice(0,3).map((n,i)=><td key={i} data-pm13-cell={`料金表!${'CDE'[i]}${r+11}`}>{fmt(n)}</td>)}<td>⋯</td>{row.slice(3).map((n,i)=><td key={i} data-pm13-cell={`料金表!${'MN'[i]}${r+11}`}>{fmt(n)}</td>)}</tr>)}
   <tr><th>16</th><td colSpan={2}/>{[0,1,2].map(c=><td key={c} data-pm13-cell={`料金表!${'CDE'[c]}16`}>{c===m.column?1:''}</td>)}<td>⋯</td>{[3,4].map(c=><td key={c} data-pm13-cell={`料金表!${'MN'[c-3]}16`}>{c===m.column?1:''}</td>)}</tr>
  </tbody></table>}
  {profile==='legacy-2017-pm13-product-sheet'&&<table className="legacy-pm13-product"><ColumnHeads letters={['A','B']}/><tbody><tr><th>1</th><td colSpan={2}>商品重量表</td></tr><tr><th>2</th><td>商品名</td><td>重量（g）</td></tr>{m.weights.map((n,i)=><tr key={i}><th>{i+3}</th>{cell(`商品重量!A${i+3}`,'XYZ'[i])}{cell(`商品重量!B${i+3}`,n)}</tr>)}</tbody></table>}
  {profile==='legacy-2017-pm13-weight-sheet'&&<table><ColumnHeads letters={['A','B','C','D','E']}/><tbody><tr><th>1</th><td colSpan={5}>重量区分表</td></tr><tr><th>2</th><td rowSpan={2}>重量<br/>区分</td><td rowSpan={2}>重量の上限<br/>（g）</td><td rowSpan={2}>箱重量<br/>（g）</td><td colSpan={2}>発送可能な商品の総重量の範囲（g）</td></tr><tr><th>3</th><td>から</td><td>まで</td></tr>{m.limits.map((n,i)=><tr key={i}><th>{i+4}</th>{[i+1,n,m.boxes[i],m.lower[i],m.upper[i]].map((x,j)=><td key={j} data-pm13-cell={`重量区分!${'ABCDE'[j]}${i+4}`}>{fmt(x)}</td>)}</tr>)}</tbody></table>}
  {profile==='legacy-2017-pm13-calculation-sheet'&&<table><ColumnHeads letters={'ABCDEFGH'.split('')}/><tbody><CalculationHeader/>{calcRow()}</tbody></table>}
  {profile==='legacy-2017-pm13-packing-sheet'&&<table><ColumnHeads letters={'ABCDEFGH'.split('')}/><tbody><CalculationHeader/>{calcRow(true)}
   <tr><th>5</th><td colSpan={8} className="legacy-pm13-outside"/></tr><tr><th>6</th><td colSpan={8} className="legacy-pm13-outside">梱包作業表</td></tr>
   <tr><th>7</th><td rowSpan={2}/><td colSpan={3}>梱包数量</td><td rowSpan={2}>商品総重量<br/>（g）</td><td rowSpan={2}>重量<br/>区分</td><td rowSpan={2}>発送料金<br/>（円）</td><td rowSpan={4} className="legacy-pm13-outside"/></tr><tr><th>8</th>{'XYZ'.split('').map(s=><td key={s}>{s}</td>)}</tr>
   <tr><th>9</th><td>残数量</td>{m.remaining.map((n,i)=><td key={i} data-pm13-cell={`料金計算!${'BCD'[i]}9`}>{n}</td>)}{cell('料金計算!E9',0)}{cell('料金計算!F9','−')}{cell('料金計算!G9','−')}</tr>
   <tr><th>10</th><td>作業数量</td>{m.lastWork.map((n,i)=><td key={i} data-pm13-cell={`料金計算!${'BCD'[i]}10`}>{n}</td>)}{cell('料金計算!E10',m.lastWorkWeight)}<td colSpan={2} className="legacy-pm13-outside"/></tr>
   {[11,12].map(n=><tr key={n}><th>{n}</th><td colSpan={8} className="legacy-pm13-outside"/></tr>)}<tr><th>13</th><td colSpan={8} className="legacy-pm13-outside">梱包指示表</td></tr>
   <tr><th>14</th><td rowSpan={2}>荷物番号</td><td colSpan={3}>発送商品数量</td><td rowSpan={2}>商品総重量<br/>（g）</td><td rowSpan={2}>重量<br/>区分</td><td rowSpan={2}>発送料金<br/>（円）</td><td rowSpan={2} className="legacy-pm13-outside"/></tr><tr><th>15</th>{'XYZ'.split('').map(s=><td key={s}>{s}</td>)}</tr>
   {m.packages.map((pack,i)=><tr key={i}><th>{16+i}</th>{[i+1,...pack.counts,pack.weight,pack.category,pack.rate].map((n,j)=><td key={j} data-pm13-cell={`料金計算!${'ABCDEFG'[j]}${16+i}`}>{fmt(n)}</td>)}<td className="legacy-pm13-outside"/></tr>)}
   <tr><th>{16+m.packages.length}</th>{'ABCDEFG'.split('').map(s=><td key={s}/>)}<td className="legacy-pm13-outside"/></tr><tr className="legacy-pm13-omitted"><th>⋮</th>{'ABCDEFG'.split('').map(s=><td key={s}>⋮</td>)}<td className="legacy-pm13-outside"/></tr><tr><th>25</th>{'ABCDEFG'.split('').map(s=><td key={s}/>)}<td className="legacy-pm13-outside"/></tr>
   <tr><th>26</th><td>計</td>{m.shipping.map((n,i)=><td key={i} data-pm13-cell={`料金計算!${'BCD'[i]}26`}>{n}</td>)}{cell('料金計算!E26',m.shippingWeight)}<td className="legacy-pm13-diagonal" aria-label="合計を求めない斜線"><svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="30" x2="100" y2="0"/></svg></td>{cell('料金計算!G26',m.totalRate)}<td className="legacy-pm13-outside"/></tr>
  </tbody></table>}
  {!heading&&!profile.endsWith('-equation')&&<p className="legacy-pm13-source-caption" data-pm13-caption="bottom">{f.caption}</p>}
 </div>;
}
