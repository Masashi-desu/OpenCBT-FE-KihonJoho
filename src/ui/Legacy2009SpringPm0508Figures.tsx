import { useId,type ReactNode } from 'react';
import type { BookletFigureProps,BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { drawingAlt,drawingIds,profile,type DrawingId } from '../core/generators/legacy-2009-spring-pm-05-08-figures';
import { riskAt } from '../core/generators/legacy-2009-spring-pm-6-model';
import { demandAt } from '../core/generators/legacy-2009-spring-pm-7-model';
import { paintChoices,paintExample,paintInput,paintProgram,paintRails,paintTrace,sameColorExamples,type Pixel } from '../core/generators/legacy-2009-spring-pm-8-model';

// Static markup tests run in Node, where Vite's CSS loader is absent.
if(typeof document!=='undefined') void import('./Legacy2009SpringPm0508Figures.css');

type Props=BookletFigureProps&{ id:DrawingId };
const surface='var(--surface)';
const ink='var(--diagram-ink)';

function Frame({id,values,caption,children}:Props&{children:ReactNode}) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Drawing(props:Props&{width:number;height:number;children:(arrow:string)=>ReactNode}) {
  const uid=useId(), {width,height,caption,children}=props;
  const title=uid+'-title', description=uid+'-desc', arrow=uid+'-arrow';
  return <Frame {...props}><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={title} aria-describedby={description}
    style={{color:ink,width:`calc(${width}px * var(--image-scale, 1))`,maxWidth:'none',height:'auto',display:'block',marginInline:'auto'}}>
    <title id={title}>{caption}</title><desc id={description}>{drawingAlt(props.id,props.values[0])}</desc>
    <defs><marker id={arrow} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M1 1L8 4.5L1 8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </marker></defs>
    <g fontSize="16">{children('url(#'+arrow+')')}</g>
  </svg></Frame>;
}
function Label({x,y,children,anchor='middle'}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end'}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={anchor}>{children}</text>;
}
function Modules(props:Props) {
  return <Drawing {...props} width={750} height={230}>{()=> <>
    <path d="M89 102h45M245 72V30h419v42M531 102h64M245 133l65 42m145-42-52 42M438 202h226v-69"
      fill="none" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M15 99h30l45 25v15H15Z" fill={surface} stroke="currentColor" strokeWidth="1.6"/>
    <path d="M27 81h29c18 0 31 8 34 21-3 13-16 23-34 23H27c-17-10-17-35 0-44Z"
      fill={surface} stroke="currentColor" strokeWidth="1.6"/>
    <Label x={51} y={164}>ATM</Label>
    <g fill={surface} stroke="currentColor" strokeWidth="1.6">
      <rect x="134" y="72" width="222" height="61"/>
      <rect x="380" y="72" width="151" height="61"/>
      <rect x="288" y="175" width="150" height="49"/>
      <path d="M605 72h135c-12 20-12 41 0 61H605c-13-20-13-41 0-61Z"/>
      <ellipse cx="740" cy="102.5" rx="8" ry="30.5"/>
    </g>
    <Label x={245} y={98}>預払トランザクション</Label><Label x={245} y={120}>構成モジュール</Label>
    <Label x={455} y={98}>月末処理</Label><Label x={455} y={120}>モジュール</Label>
    <Label x={363} y={196}>データベース</Label><Label x={363} y={216}>更新モジュール</Label>
    <Label x={665} y={109}>データベース</Label>
  </>}</Drawing>;
}
function Sequence(props:Props) {
  return <Drawing {...props} width={470} height={60}>{arrow=><>
    {['a','b','c'].map((label,i)=><g key={label} data-blank={label}>
      <rect x={15+i*120} y="15" width="91" height="32" fill={surface} stroke="currentColor" strokeWidth="1.6"/>
      <Label x={60+i*120} y={37}>{label}</Label>
      <path d={`M${109+i*120} 31h22`} fill="none" stroke="currentColor" strokeWidth="1.6" markerEnd={arrow}/>
    </g>)}
    <Label x={380} y={37} anchor="start">処理C</Label>
  </>}</Drawing>;
}
function Fraction({numerator,denominator}:{numerator:string;denominator:string}) {
  return <span style={{display:'inline-grid',textAlign:'center',verticalAlign:'middle',lineHeight:1.35}}>
    <span style={{borderBottom:'1px solid currentColor',paddingInline:'.2em'}}>{numerator}</span><span>{denominator}</span>
  </span>;
}
function Formulas(props:Props) {
  return <Frame {...props}><div style={{color:ink,marginInline:'auto',display:'grid',gridTemplateColumns:'max-content max-content',
    gap:'1em 2.5em',width:'max-content',fontSize:'calc(1em * var(--image-scale, 1))',padding:'.55em .65em'}}>
    <div>平均＝<Fraction numerator="悲観値＋4×最頻値＋楽観値" denominator="6"/></div>
    <div>分散＝（<Fraction numerator="悲観値−楽観値" denominator="6"/>）<sup>2</sup></div>
    <div>標準偏差＝√<span style={{borderTop:'1px solid currentColor'}}>分散</span></div>
    <div>開発全体の標準偏差＝√<span style={{borderTop:'1px solid currentColor'}}>分散の合計</span></div>
  </div></Frame>;
}
const cell={border:'1px solid currentColor',padding:'.3em .6em',whiteSpace:'nowrap',textAlign:'center'} as const;
function Pert(props:Props) {
  const {rows,variance,sigma}=riskAt(props.values[0]);
  return <Frame {...props}><table aria-label={props.caption} style={{borderCollapse:'collapse',color:ink,marginInline:'auto',
    fontSize:'calc(1em * var(--image-scale, 1))',width:'max-content'}}>
    <thead><tr>
      <th style={cell} rowSpan={2} scope="col">作業名</th><th style={cell} colSpan={3} scope="colgroup">作業日数</th>
      <th style={cell} rowSpan={2} scope="col">平均作業日数</th><th style={cell} rowSpan={2} scope="col">分散</th>
      <th style={cell} rowSpan={2} scope="col">標準偏差</th>
    </tr><tr>{['悲観値','最頻値','楽観値'].map(title=><th style={cell} scope="col" key={title}>{title}</th>)}</tr></thead>
    <tbody>{rows.map((row,i)=><tr key={i}>
      <th style={cell} scope="row">{i===0?'M3の新規開発':'M2の改造'}</th>
      {row.map((value,j)=><td style={cell} key={j}>{value}</td>)}
    </tr>)}<tr>
      <th style={cell} scope="row">開発全体</th>
      {['悲観値','最頻値','楽観値','平均作業日数'].map(title=><td key={title} style={{...cell,backgroundColor:'var(--selected-surface)'}} aria-label={title+'は非表示'} data-hidden-pert="true"/>)}
      <td style={cell}>{variance}</td><td style={cell}>{sigma}</td>
    </tr></tbody>
  </table></Frame>;
}
function History(props:Props) {
  const {history}=demandAt(props.values[0]);
  return <Frame {...props}><table aria-label={props.caption} style={{borderCollapse:'collapse',color:ink,marginInline:'auto',
    fontSize:'calc(1em * var(--image-scale, 1))',width:'max-content'}}>
    <thead><tr><th style={cell}>年</th><th style={cell} colSpan={7} scope="colgroup">2008年</th></tr>
      <tr><th style={cell}>月</th>{[6,7,8,9,10,11,12].map(month=><th style={cell} key={month} scope="col">{month}月</th>)}</tr>
    </thead>
    <tbody><tr><th style={cell} scope="row">需要実績</th>{history.map((value,i)=><td style={cell} key={i}>{value}</td>)}</tr></tbody>
  </table></Frame>;
}
function Demand(props:Props) {
  const {months}=demandAt(props.values[0]);
  const left=66, bottom=381, x=(month:number)=>left+month*18, y=(value:number)=>bottom-value*.80;
  const patterns=[undefined,'2 4','9 5'];
  return <Drawing {...props} width={785} height={460}>{()=> <>
    <Label x={12} y={27} anchor="start">需要実績（個）</Label>
    <path d={`M${left} ${y(400)}V${bottom}h640`} fill="none" stroke="currentColor"/>
    {Array.from({length:9},(_,i)=>i*50).map(value=><g key={value}>
      <Label x={left-11} y={y(value)+5} anchor="end">{value}</Label>
      <path d={`M${left-5} ${y(value)}h5`} stroke="currentColor"/>
    </g>)}
    {[0,12,24].map((year,i)=><g key={year}>
      {[0,3,6,9].map(month=><g key={month}>
        <path d={`M${x(year+month)} ${bottom}v6`} stroke="currentColor"/>
        <Label x={x(year+month)} y={bottom+24}>{month+1}月</Label>
      </g>)}
      <Label x={x(year+4.5)} y={bottom+55}>{2006+i}年</Label>
    </g>)}
    {months.map((series,i)=><polyline key={i} data-demand-series={'XYZ'[i]} points={series.map((value,month)=>`${x(month)},${y(value)}`).join(' ')}
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray={patterns[i]}/>)}
    {[0,1,2].map((series,i)=><g key={series}>
      <path d={`M${435+i*106} 28h42`} stroke="currentColor" strokeWidth="1.6" strokeDasharray={patterns[i]}/>
      <Label x={484+i*106} y={33} anchor="start">製品{'XYZ'[i]}</Label>
    </g>)}
  </>}</Drawing>;
}
function Program(props:Props) {
  const y=(n:number)=>28+(n-1)*25;
  return <Drawing {...props} width={925} height={y(44)+20}>{()=> <g fontFamily="Monaco, Consolas, monospace">
    {paintRails.map(({from,to,kind})=><g key={from} data-control={from+'-'+to} fill="currentColor" stroke="currentColor">
      <path d={`M60 ${y(from)-5}V${y(to)-5}`} fill="none"/>
      {kind==='loop'?[from,to].map(n=><rect key={n} x="55" y={y(n)-10} width="10" height="10"/>):<>
        <path d={`M54 ${y(from)}L60 ${y(from)-11}L66 ${y(from)}Z`}/>
        <path d={`M54 ${y(to)-10}L60 ${y(to)+1}L66 ${y(to)-10}Z`}/>
      </>}
    </g>)}
    {paintProgram.map(([line,note,indent],i)=><g key={i} data-program-line={i+1}>
      <Label x={40} y={y(i+1)} anchor="end">{i+1}</Label>
      {line&&<Label x={indent?103:75} y={y(i+1)} anchor="start">{line}</Label>}
      {note&&<Label x={535} y={y(i+1)} anchor="start">{'/* '+note+' */'}</Label>}
    </g>)}
  </g>}</Drawing>;
}
function PixelGrid({rows,x,y,size,start,steps=[],wall=false}:{
  rows:readonly (readonly number[])[];x:number;y:number;size:number;start?:Pixel;steps?:readonly Pixel[];wall?:boolean;
}) {
  const width=rows[0].length, height=rows.length;
  const walls=Array.from({length:(width+2)*(height+2)},(_,i)=>[Math.floor(i/(width+2)),i%(width+2)] as const)
    .filter(([r,c])=>r===0||r===height+1||c===0||c===width+1);
  return <g className="legacy-2009-spring-pm-05-08-pixels" transform={`translate(${x}, ${y})`}>
    {wall&&walls.map(([r,c])=><rect key={r+','+c} x={(c-1)*size} y={(r-1)*size} width={size} height={size}
      fill="none" stroke="currentColor" strokeDasharray="2 2"/>)}
    {rows.flatMap((row,r)=>row.map((color,c)=>{
      const step=steps.findIndex(([v,h])=>v===r+1&&h===c+1)+1;
      return <g key={r+','+c} data-cell={`${r+1},${c+1}`}>
        <rect x={c*size} y={r*size} width={size} height={size} data-pixel={step?1:color}/>
        {step>0&&<text x={(c+.5)*size} y={(r+.5)*size} textAnchor="middle" dominantBaseline="central" data-paint-step={step}>{step}</text>}
      </g>;
    }))}
    {start&&<rect x={(start[1]-1)*size+1} y={(start[0]-1)*size+1} width={size-2} height={size-2}
      fill="none" strokeWidth="3" data-start="true"/>}
  </g>;
}
function Example(props:Props) {
  const {start:[r,c],image,result}=paintExample(props.values[0]), x=175, y=72, size=24;
  return <Drawing {...props} width={690} height={304}>{arrow=><>
    <Label x={x+4*size} y={29}>実行前</Label><Label x={455+4*size} y={29}>実行後</Label>
    <PixelGrid rows={image} x={x} y={y} size={size} start={[r,c]} wall/>
    <PixelGrid rows={result} x={455} y={y} size={size} wall/>
    <Label x={12} y={y+size/2+6} anchor="start">Image[1, 1]</Label>
    <path d={`M119 ${y+size/2}H${x+size/2}`} stroke="currentColor" markerEnd={arrow}/>
    <Label x={12} y={y+(r-.5)*size+6} anchor="start">{`Image[${r}, ${c}]`}</Label>
    <path d={`M119 ${y+(r-.5)*size}H${x+(c-.5)*size}`} stroke="currentColor" markerEnd={arrow}/>
  </>}</Drawing>;
}
function Same(props:Props) {
  return <Drawing {...props} width={396} height={119}>{()=> <>
    {sameColorExamples.map(({rows,start},i)=>{
      const x=[10,114,242][i];
      return <g key={i}>
        <Label x={x+rows[0].length*12} y={23}>{'①②③'[i]}</Label>
        <PixelGrid rows={rows} x={x} y={36} size={24} start={start}/>
      </g>;
    })}
  </>}</Drawing>;
}
function Choice(props:Props) {
  const index=props.values[0], {image}=paintInput(index);
  const option=paintChoices.findIndex(id=>id===props.id);
  return <Drawing {...props} width={188} height={188}>{()=>
    <PixelGrid rows={image} x={6} y={6} size={22} steps={paintTrace(index,option).slice(0,5)}/>
  }</Drawing>;
}
const components:Record<DrawingId,(props:Props)=>ReactNode>={
  '5-modules':Modules,'5-sequence':Sequence,'6-formula':Formulas,'6-pert':Pert,'7-series':Demand,'7-history':History,
  '8-example':Example,'8-program':Program,'8-same':Same,
  '8-choice-a':Choice,'8-choice-i':Choice,'8-choice-u':Choice,'8-choice-e':Choice,
};
export const legacy2009SpringPm0508FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=>{
    const Component=components[id];
    return <Component {...props} id={id}/>;
  },
}));
