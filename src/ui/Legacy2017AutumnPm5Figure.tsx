import { useId, type ReactNode } from 'react';
import { legacy2017AutumnPm5Figure as inspect, legacy2017AutumnPm5Table1 as table1,
  legacy2017AutumnPm5Table2 as table2,legacy2017AutumnPm5Description as description, legacy2017AutumnPm5Flow as flow } from '../core/generators/legacy-2017-autumn-pm5-data';

const widthOf=(s:string)=>[...s].reduce((n,c)=>n+(c.charCodeAt(0)<128?.58:1),0);
const flowHoleWidth=(s:string)=>/[ef]/.test(s)?450:128;
const flowWidth=(s:string)=>s.split(/(［[bcef]］)/g).reduce((n,c)=>n+(/^［[bcef]］$/.test(c)?flowHoleWidth(c)+5:widthOf(c)*19),0);
function Lines({text,x,y,step=25,size=19}:{text:string;x:number;y:number;step?:number;size?:number}) {
  return <>{text.split('\n').map((line,i)=><text key={i} x={x} y={y+i*step} style={{fontSize:size}}>{line}</text>)}</>;
}
function wrap(text:string,max:number):string[] {
  const rows:string[]=[];for(const line of text.split('\n')) {let s='';for(const c of line.match(/［[bcef]］|./gu)??[]){if(flowWidth(s+c)>max*19){rows.push(s);s='';}s+=c;}rows.push(s);}return rows;
}
function FlowLines({text,x,y,max=29}:{text:string;x:number;y:number;max?:number}) {
  return <>{wrap(text,max).map((line,i)=>{
    let offset=x;const chunks=line.split(/(［[bcef]］)/g);
    return <g key={i} data-autumn-pm5-flow-line={i}>{chunks.map((chunk,j)=>{
      const start=offset;offset+=/^［[bcef]］$/.test(chunk)?flowHoleWidth(chunk)+5:widthOf(chunk)*19;
      if(/^［[bcef]］$/.test(chunk)){const width=flowHoleWidth(chunk);return <g key={j} data-autumn-pm5-hole={chunk[1]}><rect x={start} y={y+i*25-19} width={width} height={25} className="legacy-autumn-pm5-hole"/><text x={start+width/2} y={y+i*25} textAnchor="middle">{chunk[1]}</text></g>;}
      return <text key={j} x={start} y={y+i*25}>{chunk}</text>;
    })}</g>;
  })}</>;
}
function Entity({name,rows,x,y,w=215,keys=[]}:{name:string;rows:string[];x:number;y:number;w?:number;keys?:number[]}) {
  const h=40+rows.length*30;return <g data-autumn-pm5-entity={name}>
    <rect x={x} y={y} width={w} height={h}/><line x1={x} x2={x+w} y1={y+40} y2={y+40}/><text x={x+10} y={y+28}>{name}</text>
    {rows.map((s,i)=><g key={i} data-autumn-pm5-attribute={s}>{s==='a'?<><rect x={x+14} y={y+49+i*30} width={w-48} height={48} className="legacy-autumn-pm5-hole"/><text x={x+w/2-10} y={y+79+i*30} textAnchor="middle">a</text></>:<text x={x+10} y={y+67+i*30}>{s}</text>}{keys.includes(i)&&<line x1={x+10} x2={x+10+widthOf(s)*20} y1={y+72+i*30} y2={y+72+i*30} data-autumn-pm5-key={s}/>}</g>)}
  </g>;
}
function ER({arrow}:{arrow:string}) {
  const edge=(from:string,to:string,d:string)=><path key={from+to} d={d} markerEnd={`url(#${arrow})`} data-autumn-pm5-edge={from+'→'+to}/>;
  return <svg className="legacy-autumn-pm5-er-svg" viewBox="0 0 1180 800" role="group" aria-label="原の7表と1対多の関係">
    <defs><marker id={arrow} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto"><path d="M 1 1 L 9 5 L 1 9"/></marker></defs>
    <g className="legacy-autumn-pm5-connections">
      {edge('入金','消込','M 430 120 H 255')}{edge('得意先','入金','M 525 350 V 220')}
      {edge('得意先','月間買上げ','M 430 500 H 255')}{edge('得意先','買上げ','M 525 510 V 590')}
      {edge('月間買上げ','消込','M 150 460 V 190')}{edge('月間買上げ','買上げ','M 255 630 H 430')}
      {edge('商品','買上げ明細','M 830 240 V 410')}{edge('買上げ','買上げ明細','M 645 715 H 830 V 600')}
    </g>
    <Entity name="消込" rows={['a','','消込充当額','消込日']} x={40} y={30}/>
    <Entity name="入金" rows={['入金番号','得意先ID','入金額','入金日','充当額']} x={430} y={30} keys={[0]}/>
    <Entity name="商品" rows={['商品コード','商品名','単価']} x={720} y={110} keys={[0]}/>
    <Entity name="月間買上げ" rows={['月間買上げ番号','得意先ID','買上げ年月','月間買上げ額','消込額']} x={40} y={460} keys={[0]}/>
    <Entity name="得意先" rows={['得意先ID','得意先名','住所','電話番号']} x={430} y={350} keys={[0]}/>
    <Entity name="買上げ" rows={['買上げ伝票番号','買上げ日','得意先ID','月間買上げ番号']} x={430} y={590} keys={[0]}/>
    <Entity name="買上げ明細" rows={['買上げ伝票番号','明細番号','商品コード','数量','買上げ金額']} x={720} y={410} keys={[0,1]}/>
    <g data-autumn-pm5-legend="1対多"><text x={960} y={400}>（凡例）</text><rect x={960} y={422} width={185} height={155}/><line x1={960} x2={1145} y1={460} y2={460}/><Lines text={'表名\n属性名\n属性名\n⋮'} x={972} y={450}/><Lines text={'属性名の実線の下線は，\n主キーを示す。'} x={940} y={650}/><line x1={955} x2={1040} y1={705} y2={705} markerEnd={`url(#${arrow})`}/><text x={1048} y={712}>：1対多</text></g>
  </svg>;
}
function Flow() {
  const map=Object.fromEntries(flow), nodes:[string,number,number,number,number][]=[
    ['start',40,20,625,45],['select-payment',40,95,625,77],['first-payment',40,202,625,55],['payment-loop',40,287,625,67],
    ['select-month',40,384,625,105],['first-month',40,519,625,76],['payment-rest',40,625,625,55],['month-loop',40,710,625,67],
    ['month-rest',40,807,625,55],['compare',40,902,625,88],['finish-month',20,1050,645,343],['finish-payment',700,1050,665,343],
    ['next-month',40,1423,625,76],['month-end',40,1529,625,55],['next-payment',40,1660,625,76],['payment-end',40,1766,625,55],['end',40,1851,625,45],
  ];
  const line=(x1:number,y1:number,x2:number,y2:number,key:string)=><line key={key} x1={x1} y1={y1} x2={x2} y2={y2} data-autumn-pm5-connection={key}/>;
  return <svg className="legacy-autumn-pm5-flow-svg" viewBox="0 0 1400 2020" role="group" aria-label="原の消込み処理の流れ図">
    <g className="legacy-autumn-pm5-connections">
      {nodes.slice(0,10).map((n,i)=>i<9&&line(352.5,n[2]+n[4],352.5,nodes[i+1][2],n[0]+'→'+nodes[i+1][0]))}
      {line(352.5,990,352.5,1050,'compare-yes')}{line(665,946,1032.5,946,'compare-no-horizontal')}{line(1032.5,946,1032.5,1050,'compare-no-vertical')}
      {line(352.5,1393,352.5,1423,'finish-month→next-month')}{line(352.5,1499,352.5,1529,'next-month→month-end')}
      {line(352.5,1584,352.5,1660,'month-end→next-payment')}{line(1032.5,1393,1032.5,1622,'finish-payment-exit1')}{line(1032.5,1622,352.5,1622,'finish-payment-exit2')}
      <path d="M 365 1615 L 352.5 1622 L 365 1629" data-autumn-pm5-merge-arrow="left"/>
      {line(352.5,1736,352.5,1766,'next-payment→payment-end')}{line(352.5,1821,352.5,1851,'payment-end→end')}
      <text x={370} y={1022}>Yes</text><text x={693} y={929}>No</text>
      <path d="M 1030 132 H 720 l 22 -12 M 720 132 l 22 12" data-autumn-pm5-reference-arrow="α"/><text x={1050} y={141}>α</text>
      <path d="M 1030 436 H 720 l 22 -12 M 720 436 l 22 12" data-autumn-pm5-reference-arrow="β"/><text x={1050} y={445}>β</text>
    </g>
    {nodes.map(([id,x,y,w,h])=>{const title=id==='compare';const loopStart=id.endsWith('loop'),loopEnd=id.endsWith('end')&&id!=='end',loop=loopStart||loopEnd;const capsule=id==='start'||id==='end';return <g key={id} data-autumn-pm5-flow-node={id}>
      {title?<polygon points={`${x+w/2},${y} ${x+w},${y+h/2} ${x+w/2},${y+h} ${x},${y+h/2}`}/>:loopStart?<polygon data-autumn-pm5-loop="start" points={`${x+12},${y} ${x+w-12},${y} ${x+w},${y+12} ${x+w},${y+h} ${x},${y+h} ${x},${y+12}`}/>:loopEnd?<polygon data-autumn-pm5-loop="end" points={`${x},${y} ${x+w},${y} ${x+w},${y+h-12} ${x+w-12},${y+h} ${x+12},${y+h} ${x},${y+h-12}`}/>:<rect x={x} y={y} width={w} height={h} rx={capsule?22:0}/>}
      {title||capsule||loop?<Lines text={map[id]} x={x+w/2-(title?80:capsule?20:60)} y={y+(loop?27:31)}/>:<FlowLines text={map[id]} x={x+12} y={y+28} max={w/19-1.5}/>}
    </g>;})}
    <Lines text={'注記　“[X]”という記述でX表の処理中のレコードを表し，“[X].Y”という記述でX表の処理中のレコードの属性を表す。'} x={20} y={1950} size={17}/>
  </svg>;
}

export function Legacy2017AutumnPm5Figure({profile,values,caption}:{profile:string;values:number[];caption:string}) {
  const f=inspect(profile,values),id=useId().replace(/:/g,'');if(caption!==f.caption)throw Error('FIGURE_CAPTION');
  let content:ReactNode;
  if(f.kind==='selection')content=<div className="legacy-autumn-pm5-selection">選択した問題は，選択欄の<span className="legacy-autumn-pm5-circled">選</span>をマークしてください。マークがない場合は，採点されません。</div>;
  else if(f.kind==='description')content=<p className="legacy-autumn-pm5-description-text">{description.split(/(［[bcd]］)/g).map((s,i)=>/^［[bcd]］$/.test(s)?<span key={i} className="legacy-autumn-pm5-inline-hole" data-autumn-pm5-inline-hole={s[1]}>{s[1]}</span>:s)}</p>;
  else if(f.kind==='er')content=<ER arrow={'autumn-pm5-arrow-'+id}/>;
  else if(f.kind==='flow')content=<Flow/>;
  else if(f.kind==='table1')content=<table><caption>{f.caption}</caption><thead><tr><th>表名</th><th>管理する情報</th></tr></thead><tbody>{table1.map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody></table>;
  else if(f.kind==='table2')content=<table><caption>{f.caption}</caption><thead><tr><th>表名</th><th>属性名</th><th>説明</th></tr></thead><tbody>{table2.map((r,i)=><tr key={i}>{(i===0||i===2||i===4)&&<td rowSpan={i===4?1:2}>{r[0]}</td>}<td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>;
  else if(f.kind.startsWith('instruction'))content=<p className="legacy-autumn-pm5-instruction">{f.kind==='instruction1'?<>設問1　図1中の<span className="legacy-autumn-pm5-empty" aria-label="空欄"/>に入れる属性の組みとして適切な答えを，解答群の中から選べ。</>:<>設問2　図2は，消込み処理の流れ図である。次の記述及び図2中の<span className="legacy-autumn-pm5-empty" aria-label="空欄"/>に入れる適切な答えを，解答群の中から選べ。</>}</p>;
  else {const key=f.kind.slice(5) as keyof typeof f.groups,entries=f.groups[key];content=<><p className="legacy-autumn-pm5-heading">{f.caption}</p><div className={'legacy-autumn-pm5-bank legacy-autumn-pm5-bank-'+key}>{entries.map((text,i)=><div key={i} data-autumn-pm5-choice={'アイウエオカ'[i]}><span>{'アイウエオカ'[i]}</span><span>{Array.isArray(text)?text.map((s,j)=><span key={j} className="legacy-autumn-pm5-key-pair">{s}</span>):text}</span></div>)}</div></>;}
  return <div className={'legacy-autumn-pm5-figure legacy-autumn-pm5-'+f.kind} data-autumn-pm5-profile={profile} aria-label={f.alt}>
    {content}{(f.kind==='er'||f.kind==='flow')&&<p className="legacy-autumn-pm5-caption" data-autumn-pm5-caption="bottom">{f.caption}</p>}
  </div>;
}
