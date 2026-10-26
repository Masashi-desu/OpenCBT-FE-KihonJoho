import {useId} from "react";
import {legacy2018EvmFigureAlt,legacy2018EvmModel} from "../core/generators/legacy-2018-pm-evm";
import domains from "../core/generators/legacy-2018-evm-figure-domains.json";
/** Three annual managed profiles. No source-data code is interpreted. */
export function Legacy2018EvmFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
  const bounds=domains[profile as keyof typeof domains];if(!bounds||values.length!==bounds.length||values.some((n,i)=>!Number.isInteger(n)||n<bounds[i][0]||n>bounds[i][1]))throw Error("PARAMETER_CONSTRAINT");
  const id=useId().replace(/:/g,""),timeline=profile==="legacy-2018-evm-timeline",plan=profile==="legacy-2018-evm-plan-table",model=!timeline&&!plan?legacy2018EvmModel(values[0],values[1]):undefined;
  const width=plan?900:1200,height=timeline?300:plan?390:760;
  const x=(month:number)=>120+(month-2)*78,y=(effort:number)=>660-effort/(400*values[1])*560;
  const series=model?[
    {name:"PV",points:model.pv.map((n,i)=>[x(i+2),y(n)]),dash:undefined},
    {name:"EV",points:model.ev.map((n,i)=>[x(i+3),y(n)]),dash:"14 9"},
    {name:"AC",points:model.ac.map((n,i)=>[x(i+3),y(n)]),dash:"2 7"},
  ]:[];
  const phaseEnds=[0,1,2,4,6,10,12],phaseLabels=[["基本","計画"],["要件","定義"],["外部","設計"],["内部","設計"],["製造・単体テスト"],["結合","テスト"]],tx=(n:number)=>160+n*80;
  const cols=[65,365,600,835],rowY=45,rowH=62,planRows=[["サブシステム","外部設計","内部設計"],...["S1","S2","共通機能","合計"].map((name,i)=>[name,([25,30,10,65][i]*values[0]).toFixed(2),i===0?"a":""])];
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="EVMの図表。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" style={{minWidth:timeline?850:plan?560:900}} viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2018EvmFigureAlt(profile,values)}</desc><defs><pattern id={`${id}-shade`} patternUnits="userSpaceOnUse" width="6" height="6"><path d="M 0 6 L 6 0" fill="none" stroke="currentColor" strokeWidth="1" opacity=".25"/></pattern><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="5" markerHeight="5" orient="auto"><path d="M 1 1 L 10 6 L 1 11" fill="none" stroke="currentColor"/></marker></defs><g aria-hidden="true">{timeline?<>
    <text x="65" y="45" textAnchor="middle">経過月数</text>{phaseEnds.map(n=><text key={n} data-month={n} x={tx(n)} y="45" textAnchor="middle">{n}</text>)}
    <rect x="30" y="80" width="1130" height="115" fill="none"/><line x1="160" y1="80" x2="160" y2="195"/><text x="95" y="125" textAnchor="middle">開発</text><text x="95" y="157" textAnchor="middle">工程</text>
    {phaseLabels.map((parts,i)=><g key={i} data-phase={i}><line data-schedule="phase" x1={tx(phaseEnds[i])} y1="100" x2={tx(phaseEnds[i+1])-3} y2="100" markerEnd={`url(#${id}-arrow)`}/>{i>0&&<line x1={tx(phaseEnds[i])} y1="80" x2={tx(phaseEnds[i])} y2="195"/>}{parts.map((part,j)=><text key={part} x={(tx(phaseEnds[i])+tx(phaseEnds[i+1]))/2} y={parts.length===1?153:137+j*31} textAnchor="middle">{part}</text>)}</g>)}
    <path data-contract="accepted" d={`M ${tx(2)} 208 Q ${tx(2)} 230 ${tx(2)+30} 230 H ${tx(12)-30} Q ${tx(12)} 230 ${tx(12)} 208`} fill="none"/><text x={(tx(2)+tx(12))/2} y="265" textAnchor="middle">N社が受注した範囲</text>
  </>:plan?<>
    {[2,3,4].map(row=><rect key={row} data-hidden-cell={`${row}-2`} x={cols[2]} y={rowY+row*rowH} width={cols[3]-cols[2]} height={rowH} fill={`url(#${id}-shade)`}/>)}
    {Array.from({length:6},(_,i)=><line key={`row-${i}`} x1={cols[0]} y1={rowY+i*rowH} x2={cols[3]} y2={rowY+i*rowH}/>)}{cols.map((n,i)=><line key={`col-${i}`} x1={n} y1={rowY} x2={n} y2={rowY+5*rowH}/>)}
    <rect x="648" y={rowY+rowH+12} width="140" height="38" fill="none"/>{planRows.flatMap((row,i)=>row.map((v,j)=>v!==""?<text key={`${i}-${j}`} data-cell={`${i}-${j}`} x={(cols[j]+cols[j+1])/2} y={rowY+(i+.5)*rowH} textAnchor="middle">{v}</text>:null))}
  </>:<>
    {Array.from({length:9},(_,i)=>{const n=i*50*model!.scale;return <g key={i}><line data-grid="horizontal" x1="120" y1={y(n)} x2="900" y2={y(n)} strokeDasharray="5 5" style={{strokeWidth:1,opacity:.6}}/><text data-axis-value="effort" x="98" y={y(n)} textAnchor="end">{n}</text></g>;})}
    {Array.from({length:11},(_,i)=>{const n=i+2;return <g key={n}><line data-grid="vertical" x1={x(n)} y1="100" x2={x(n)} y2="660" strokeDasharray="5 5" style={{strokeWidth:1,opacity:.6}}/><text data-axis-value="month" x={x(n)} y="691" textAnchor="middle">{n}</text></g>;})}
    {[..."工数（人月）"].map((letter,i)=><text key={i} x="25" y={310+30*i} textAnchor="middle">{letter}</text>)}<text x="510" y="735" textAnchor="middle">経過月数</text>
    <text x="605" y="27" textAnchor="end">結合テスト開始から1か月が経過した時点</text><path data-evaluation="one-month" d={`M 620 27 H ${x(11)} V 85`} fill="none" markerEnd={`url(#${id}-arrow)`} style={{strokeWidth:1.5}}/>
    <text x="605" y="65" textAnchor="end">結合テスト開始時点</text><path data-evaluation="start" d={`M 620 65 H ${x(10)} V 85`} fill="none" markerEnd={`url(#${id}-arrow)`} style={{strokeWidth:1.5}}/>
    <rect x="150" y="120" width="210" height="165" fill="var(--surface)"/><text x="255" y="145" textAnchor="middle">（凡例）</text>
    {series.map((s,i)=><g key={s.name} data-legend={s.name}><line x1="175" y1={180+i*40} x2="255" y2={180+i*40} strokeDasharray={s.dash}/>{i===0?<rect x="248" y={173+i*40} width="14" height="14" style={{fill:"currentColor"}}/>:<circle cx="255" cy={180+i*40} r="7" style={{fill:i===1?"currentColor":"var(--surface)"}}/>}<text x="285" y={180+i*40}>{s.name}</text></g>)}
    {series.map((s,i)=><g key={s.name} data-series={s.name}><polyline points={s.points.map(point=>point.join(",")).join(" ")} fill="none" strokeDasharray={s.dash}/>{s.points.map(([px,py],j)=>i===0?<rect key={j} x={px-5} y={py-5} width="10" height="10" style={{fill:"currentColor"}}/>:<circle key={j} cx={px} cy={py} r="5" style={{fill:i===1?"currentColor":"var(--surface)"}}/>)}</g>)}
    {[["alpha",model!.ac.at(-1)!,model!.ac.at(-1)!>=model!.pv[9]?1080:1000,"α"],["beta",model!.pv[9],model!.ac.at(-1)!>=model!.pv[9]?1000:1080,"β"]].map(([key,upper,bx,label])=>{const top=y(Number(upper)),bottom=y(model!.ev.at(-1)!);return <g key={key} data-gap={key}><line data-gap-edge="upper" x1={x(11)+9} y1={top} x2={Number(bx)} y2={top}/><line data-gap-edge="lower" x1={x(11)+9} y1={bottom} x2={Number(bx)} y2={bottom}/><path data-gap-bracket={key} d={`M ${Number(bx)+6} ${top} H ${Number(bx)+16} V ${bottom} H ${Number(bx)+6}`} fill="none"/><text x={Number(bx)+45} y={(top+bottom)/2} textAnchor="middle">{label}</text></g>;})}
  </>}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
