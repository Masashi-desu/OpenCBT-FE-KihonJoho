import type { ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  analysisLegend, axesColumns, axisNames, bubblePoints, characterColumns, characterRows, chartNames, codeBodies, currentAxes,
  designLegend, drawingAlt, drawingIds, effortRows, formulaData, marketColumns, marketTable, objectLinks, objectNodes, orderColumns,
  orderRows, parserArray, parserArrayRows, priorAxes, profile, scheduleTable, shaded, stateColumns, stateRows, type DrawingId,
} from '../core/generators/legacy-2011-autumn-pm-05-08-figures';
import { formatted, orderModel, parserModel, stages } from '../core/generators/legacy-2011-autumn-pm-05-08-model';

type Props=BookletFigureProps&{id:DrawingId};
const ink='var(--diagram-ink)', surface='var(--surface)', border='1px solid '+ink;
const cell={border,padding:'.28em .42em',whiteSpace:'nowrap'} as const;
const tableStyle={borderCollapse:'collapse',color:ink,minWidth:'max-content',fontSize:'calc(.95em * var(--image-scale, 1))'} as const;
const mono={color:ink,fontFamily:'monospace',fontSize:'calc(1em * var(--image-scale, 1))',whiteSpace:'pre'} as const;
const maskStyle={...cell,background:'var(--soft-border)'};
const blankPattern=/［([a-h])］/g;
const blank = (label:string) => <span className="source-code-blank" data-source-blank={label} aria-label={'空欄'+label}>{label}</span>;
function blankText(value:string) {
  return value.split(blankPattern).map((part,i)=>i%2?<span key={i}>{blank(part)}</span>:part);
}

function Frame({id,values,caption,children,first=false,hidden=false}:Props & {children:ReactNode;first?:boolean;hidden?:boolean}) {
  const label=<figcaption className={hidden?'sr-only':undefined}>{caption}</figcaption>;
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    {first&&label}
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    {!first&&label}
  </figure>;
}
function DataTable({columns,rows}:{columns:readonly string[];rows:readonly (readonly string[])[]}) {
  return <table style={{...tableStyle,marginInline:'auto'}}><thead><tr>{columns.map((column,i)=><th scope="col" key={i} style={cell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map((row,i)=><tr key={i}>{row.map((value,j)=><td key={j} style={value===shaded?maskStyle:cell} aria-label={value===shaded?shaded:undefined}>
      {value!==shaded&&blankText(value)}
    </td>)}</tr>)}</tbody></table>;
}
function Slip(props:Props) {
  const i=props.values[0], o=orderModel(i);
  return <Frame {...props}><div style={{width:'max-content',marginInline:'auto',border,padding:'.65em',color:ink}}>
    <div style={{textAlign:'center',marginBottom:'.35em'}}>受注伝票</div>
    <div style={{display:'flex',gap:'.65em',marginBottom:'.45em',whiteSpace:'nowrap'}}>
      {([['受注番号',o.number],['得意先',o.customer],['受注日',o.date]] as const).map(([name,value])=>
        <span key={name}>{name} <span style={{border,padding:'.1em .35em'}}>{value}</span></span>)}
    </div>
    <DataTable columns={orderColumns} rows={orderRows(i)}/>
    <div style={{textAlign:'right',marginTop:'.45em'}}>合計 <span style={{border,padding:'.1em .35em'}}>{formatted(o.total)}</span></div>
  </div></Frame>;
}
function Svg({width,height,children}:{width:number;height:number;children:ReactNode}) {
  return <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} style={{display:'block',width:`calc(${width}px * var(--image-scale, 1))`,
    maxWidth:'none',height:'auto',marginInline:'auto',color:ink,fontSize:14}}>{children}</svg>;
}
function Text({x,y,children,anchor='start'}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end'}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={anchor}>{children}</text>;
}
function Objects(props:Props) {
  const nodes=objectNodes(props.values[0]), width=156;
  const placements=[[6,8,164],[188,8,76],[188,103,76],[370,103,76],[188,196,76],[370,196,76],
    [188,289,76],[370,289,76],[552,243,76],[552,329,76]];
  return <Frame {...props}><Svg width={716} height={410}><g stroke="currentColor" fill="none">
    {objectLinks.map(([a,b])=>{
      const [ax,ay,ah]=placements[a], [bx,by,bh]=placements[b];
      const y=a===0?(b===1?ay+44:ay+132):ay+ah/2;
      return <path key={a+'-'+b} d={`M${ax+width} ${y}L${bx} ${by+(b===1?44:bh/2)}`}/>;
    })}
    {nodes.map(([title,...rows],k)=>{
      const [x,y,height]=placements[k];
      return <g key={k} transform={`translate(${x} ${y})`}>
        <rect width={width} height={height}/><path d={`M0 23H${width}`}/>
        <text x={width/2} y={17} textAnchor="middle" fill="currentColor" stroke="none" textDecoration="underline">{title}</text>
        {rows.map((row,j)=><Text key={row} x={6} y={40+j*16}>{row}</Text>)}
      </g>;
    })}
  </g></Svg></Frame>;
}

function SvgBlank({x,y,label,width=72}:{x:number;y:number;label:string;width?:number}) {
  return <g data-source-blank={label}><rect x={x} y={y} width={width} height="18"/><Text x={x+width/2} y={y+14} anchor="middle">{label}</Text></g>;
}
type ClassNode = {x:number;y:number;w:number;title:string;fields?:string[];method?:string;head?:number};
function ClassBox({x,y,w,title,fields=[],method='',head=29}:{x:number;y:number;w:number;title:string;fields?:string[];method?:string;head?:number}) {
  const section=fields.length*20+15, height=head+section+(method?24:13);
  const field=(s:string,k:number,base:number)=>{
    const m=/^([－＋]?)［([a-h])］$/.exec(s);
    return m ? <g key={k}><Text x={7} y={base}>{m[1]}</Text><SvgBlank x={m[1]?24:7} y={base-13} label={m[2]} width={w-34}/></g> :
      <Text key={k} x={7} y={base}>{s}</Text>;
  };
  const match=/^［([a-c])］$/.exec(title);
  return <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={height}/>
    <path d={`M0 ${head}H${w}M0 ${head+section}H${w}`}/>
    {match?<SvgBlank x={7} y={5} label={match[1]} width={w-14}/>:<Text x={w/2} y={head/2+5} anchor="middle">{title}</Text>}
    {fields.map((value,k)=>field(value,k,head+17+k*20))}
    {method&&field(method,0,head+section+17)}
  </g>;
}
function Legend({kind}:{kind:'analysis'|'design'}) {
  const analysis=kind==='analysis';
  return <div style={{display:'flex',gap:'1em',alignItems:'start',color:ink,marginTop:'.55em',minWidth:'min(100%, 34rem)'}}>
    <div style={{flex:'0 0 auto'}}>
      <div>（凡例）</div>
      {analysis?<Svg width={230} height={200}><g stroke="currentColor" fill="none">
        <ClassBox x={2} y={3} w={74} title="クラスA" fields={['属性']} method="操作"/>
        <ClassBox x={154} y={3} w={74} title="クラスC" fields={['属性']} method="操作"/>
        <ClassBox x={2} y={112} w={74} title="クラスB" fields={['属性']} method="操作" head={21}/>
        <path d="M76 32H140m0 0 7 -4 7 4 -7 4ZM39 112V99m-4 0 4 -8 4 8Z"/>
        <Text x={81} y={27}>1..*</Text><Text x={142} y={27}>1</Text><Text x={49} y={106}>汎化</Text>
      </g></Svg>:<Svg width={88} height={108}><g stroke="currentColor" fill="none">
        <ClassBox x={2} y={3} w={84} title="クラスA" fields={['－属性','－／属性']} method="＋操作" head={22}/>
      </g></Svg>}
    </div>
    <div style={{whiteSpace:'normal',minWidth:analysis?'16em':'12em'}}>
      {(analysis?analysisLegend:designLegend.slice(2)).map(text=><div key={text}>{text}</div>)}
    </div>
  </div>;
}
function Classes(props:Props) {
  const design=props.id==='5-design', i=props.values[0], {maximum}=orderModel(i);
  const width=design?690:667;
  const nodes:ClassNode[]=design ? [
    {x:7,y:5,w:168,title:'受注',fields:['－［e］','－年月日：文字列','－／合計：数値'],method:'＋合計取得()：数値'},
    {x:220,y:5,w:172,title:'得意先',fields:['－名称：文字列'],method:'＋名称取得()：文字列'},
    {x:220,y:103,w:172,title:'受注明細',fields:['－No：数値','－数量：数値','－［f］'],method:'＋［g］'},
  ]:[
    {x:7,y:7,w:111,title:'受注',head:108},
    {x:215,y:7,w:108,title:'得意先'},
    {x:215,y:89,w:108,title:'受注明細',fields:['数量']},
    {x:437,y:89,w:112,title:'［a］'},
    {x:329,y:207,w:111,title:'［b］'},
    {x:547,y:207,w:111,title:'［c］'},
  ];
  return <Frame {...props}><div style={{width:`calc(${width}px * var(--image-scale, 1))`,marginInline:'auto'}}>
    <Svg width={width} height={design?290:271}><g fill="none" stroke="currentColor">
      {nodes.map(node=><ClassBox key={node.title} {...node}/>)}
      {design?<><path d="M175 47H220m-8 -4 8 4 -8 4M175 142l8 -5 8 5 -8 5ZM191 142H220m-8 -4 8 4 -8 4
        M392 157H467m-8 -4 8 4 -8 4M521 221v-16m-5 0 5 -9 5 9ZM444 239v-18H609v18
        M498 260h56m-48 -4 -8 4 8 4m48 -4 8 -5 8 5 -8 5Z"/>
        {[[467,134],[390,239],[570,239]].map(([x,y])=><g key={x}><rect x={x} y={y} width={108} height={design&&y===134?62:42}/>
          <rect x={x+8} y={y+13} width={92} height={16} fill="var(--soft-border)"/></g>)}
      </>:<>
        <path d="M118 40H215M118 126l8 -5 8 5 -8 5ZM134 126H215M323 126H437M384 207v-24H602v24
          M493 183v-28m-5 0 5 -9 5 9ZM440 238H532m0 0 7 -5 8 5 -8 5Z"/>
        <Text x={123} y={35}>1..*</Text><Text x={206} y={35}>1</Text>
        <Text x={122} y={119}>1</Text><Text x={211} y={119} anchor="end">{'1..'+maximum}</Text>
        <Text x={329} y={119}>0..*</Text><Text x={430} y={119} anchor="end">1</Text>
        <Text x={525} y={232} anchor="end">0..*</Text><SvgBlank x={446} y={215} width={37} label="d"/>
      </>}
    </g></Svg>
    {design&&designLegend.slice(0,2).map(text=><div key={text}>{text}</div>)}
    <Legend kind={design?'design':'analysis'}/>
  </div></Frame>;
}

function Formula(props:Props) {
  const [label,top,bottom]=formulaData[props.id as keyof typeof formulaData];
  return <Frame {...props} hidden><div style={{width:'max-content',marginInline:'auto',display:'flex',gap:'.55em',alignItems:'center',color:ink}}>
    <span>{label}＝</span><span style={{display:'inline-grid',textAlign:'center'}}>
      <span style={{borderBottom:border,padding:'.08em .3em'}}>{top}</span><span style={{padding:'.08em .3em'}}>{bottom}</span>
    </span>
  </div></Frame>;
}
function Staffing(props:Props) {
  const i=props.values[0];
  if (props.id==='6-efforts') return <Frame {...props} first><DataTable columns={['工程',...stages]} rows={effortRows(i)}/></Frame>;
  const t=scheduleTable(i);
  const periods=['第一期','第二期'];
  return <Frame {...props} first><table style={tableStyle}>
    <thead><tr><th colSpan={2} style={cell}>年</th><th colSpan={12} style={cell}>平成24年</th><th colSpan={9} style={cell}>平成25年</th></tr>
      <tr><th colSpan={2} style={cell}>月</th>{t.months.map((m,k)=><th key={k} scope="col" style={cell}>{m}</th>)}</tr></thead>
    <tbody>
      {periods.map((name,n)=><tr key={name}>
        {!n&&<th rowSpan={2} style={cell}>工程</th>}<th scope="row" style={cell}>{name}</th>
        {t.period(n).map((length,k)=>length?<td key={k} colSpan={length} style={{...cell,textAlign:'center'}}>{stages[k-1]??''}</td>:null)}
      </tr>)}
      {(['a','b'] as const).flatMap(type=>periods.map((name,n)=><tr key={type+name}>
        {!n&&<th rowSpan={2} style={cell}>{type==='a'?'A社':'B社'}の<br/>要員数</th>}<th scope="row" style={cell}>{name}</th>
        {t.people(type,n).map((value,k,values)=>{
          if(value===''){
            if(k>0&&values[k-1]==='') return null;
            const length=values.slice(k).findIndex(cell=>cell!=='');
            return <td key={k} colSpan={length===-1?values.length-k:length} style={cell}/>;
          }
          return <td key={k} style={{...(value===shaded?maskStyle:cell),textAlign:'center'}} aria-label={value===shaded?shaded:undefined}>
            {value!==shaded&&value}
          </td>;
        })}
      </tr>))}
    </tbody>
  </table></Frame>;
}

function MarketTable(props:Props) {
  const id=props.id, i=props.values[0], prior=id==='7-prior-axes';
  if (id==='7-data') {
    const rows=marketTable(i);
    return <Frame {...props} first><table style={{...tableStyle,marginInline:'auto'}}><thead><tr>
      <th scope="col" colSpan={2} style={cell}>指標</th>{marketColumns.slice(2).map(name=><th scope="col" key={name} style={cell}>{name}</th>)}
    </tr></thead><tbody>{rows.map(([label,period,...values],j)=><tr key={j}>
      {label&&<th rowSpan={2} style={cell}>{label}</th>}<th scope="row" style={cell}>{period}</th>
      {values.map((value,k)=><td style={{...cell,textAlign:'right'}} key={k}>{value}</td>)}
    </tr>)}</tbody></table></Frame>;
  }
  return <Frame {...props} first><table style={{...tableStyle,marginInline:'auto'}}>
    <thead><tr>{axesColumns.map(name=><th scope="col" key={name} style={cell}>{name}</th>)}</tr></thead>
    <tbody>{(prior?priorAxes:currentAxes).map((row,j)=><tr key={row[0]}>
      <th scope="row" style={cell}>{row[0]}</th>
      {prior?<td colSpan={2} style={{...cell,textAlign:'center'}}>{blankText(row[1])}</td>:
        <><td style={cell}>{row[1]}</td><td style={cell}>{row[2]}</td></>}
      {!j&&<td rowSpan={2} style={cell}>{row.at(-1)}</td>}
    </tr>)}</tbody>
  </table></Frame>;
}
const chartScales = [[0,3500,500,1500,5500,500],[0,25000,5000,0,45,5],[-45,45,10,-45,45,10],[-45,45,10,-45,45,10]];
const ticks=(from:number,to:number,step:number)=>Array.from({length:Math.floor(to/step)-Math.ceil(from/step)+1},(_,i)=>(Math.ceil(from/step)+i)*step);
function Chart({index,i}:{index:number;i:number}) {
  const [minX,maxX,stepX,minY,maxY,stepY]=chartScales[index], prior=index>=2;
  const left=60, top=18, width=345, height=360, bottom=top+height;
  const x=(n:number)=>left+width*(n-minX)/(maxX-minX);
  const y=(n:number)=>bottom-height*(n-minY)/(maxY-minY);
  const tickBottom=prior?y(0):bottom, tickLeft=prior?x(0):left;
  const [horizontal,vertical]=axisNames[index];
  const points=bubblePoints(i,index).sort((a,b)=>b.share-a.share);
  return <div style={{width:'max-content'}}>
    <Svg width={433} height={417}><g fill="none" stroke="currentColor" fontSize="12">
      <rect x={left} y={top} width={width} height={height}/>
      {prior&&<path d={`M${tickLeft} ${top}V${bottom}M${left} ${tickBottom}H${left+width}`}/>}
      {ticks(minX,maxX,stepX).filter(n=>!prior||n).map(n=><g key={n}>
        <path opacity={prior?1:.35} d={`M${x(n)} ${tickBottom}V${prior?tickBottom-8:top}`}/>
        <Text x={x(n)} y={prior?tickBottom-12:bottom+16} anchor="middle">{formatted(n)}</Text>
      </g>)}
      {ticks(minY,maxY,stepY).filter(n=>!prior||n).map(n=><g key={n}>
        <path opacity={prior?1:.35} d={`M${tickLeft} ${y(n)}H${prior?tickLeft+8:left+width}`}/>
        <Text x={prior?tickLeft+13:left-6} y={y(n)+4} anchor={prior?'start':'end'}>{formatted(n)}</Text>
      </g>)}
      {prior&&<Text x={tickLeft+4} y={tickBottom+13}>0</Text>}
      {points.map(({x:v,y:w,share,label},k)=><circle key={k} cx={x(v)} cy={y(w)} r={Math.sqrt(share)*7.1} strokeWidth="1.3" fill={surface}/>)}
      {points.map(({x:v,y:w,share,label},k)=>{
        if (!label) return null;
        if (!prior) return <SvgBlank key={k} x={x(v)-17} y={y(w)+(label==='［a］'?Math.sqrt(share)*7.1+4:-9)}
          label={label.slice(1,-1)} width={34}/>;
        if(share>=8) return <Text key={k} x={x(v)} y={y(w)+4} anchor="middle">{label}</Text>;
        const r=Math.sqrt(share)*7.1;
        const placeLeft=v<0;
        return <text key={k} x={x(v)+(placeLeft?-1:1)*(r+5)} y={y(w)+4} textAnchor={placeLeft?'end':'start'}
          stroke={surface} strokeWidth="4" fill="currentColor" style={{paintOrder:'stroke'}}>{label}</text>;
      })}
      <Text x={left+width/2} y={410} anchor="middle">{horizontal}</Text>
      <g transform={`translate(14 ${top+height/2}) rotate(-90)`}><Text x={0} y={0} anchor="middle">{vertical}</Text></g>
    </g></Svg>
    <div style={{textAlign:'center',color:ink}}>図{index+1}　{chartNames[index]}</div>
  </div>;
}
function Charts(props:Props) {
  const start=props.id==='7-current'?0:2;
  return <Frame {...props} hidden><div style={{display:'flex',gap:'.4em',width:'max-content',marginInline:'auto'}}>
    {[start,start+1].map(index=><Chart key={index} index={index} i={props.values[0]}/>)}
  </div></Frame>;
}

function CodeBlock({title,lines}:{title:string;lines:readonly string[]}) {
  return <div style={{width:'max-content',color:ink}}><div>{title}</div>
    <pre style={{...mono,margin:'.3em 0',lineHeight:1.52}}>{lines.map((line,i)=><div key={i}>{blankText(line)}</div>)}</pre></div>;
}
function ParserCode(props:Props) {
  const id=props.id, i=props.values[0], m=parserModel(i);
  return <Frame {...props} hidden><div style={{display:'flex',gap:'2em',width:'max-content',marginInline:'auto'}}>
    {id==='8-search'?<><CodeBlock title="〔副プログラム1〕" lines={codeBodies.forward}/><CodeBlock title="〔副プログラム2〕" lines={codeBodies.backward}/></>:
      id==='8-move'?<CodeBlock title="〔副プログラム3〕" lines={codeBodies.move}/>:
      id==='8-invalid'?<CodeBlock title="" lines={m.invalid.map((s,j)=>'代入文'+'①②③④'[j]+'　'+s)}/>:
      <><CodeBlock title="（代入文の例）" lines={[m.statement]}/><CodeBlock title="（出力結果の例）" lines={m.output}/></>}
  </div></Frame>;
}

const arrayStart=153, arrayCell=24;
function ArrayRow({label,row,y,start=arrayStart}:{label:string;row:readonly string[];y:number;start?:number}) {
  return <g>
    <Text x={7} y={y+17}>{label}</Text>
    {row.map((value,j)=><g key={j} transform={`translate(${start+j*arrayCell} ${y})`}>
      <rect width={arrayCell} height={24}/><Text x={arrayCell/2} y={17} anchor="middle">{value}</Text>
    </g>)}
  </g>;
}
function ParserArrays(props:Props) {
  const id=props.id, i=props.values[0], m=parserModel(i);
  const rows=parserArrayRows(i);
  const center=(j:number)=>arrayStart+j*arrayCell+arrayCell/2;
  const edge=(j:number)=>arrayStart+j*arrayCell;
  const outputFrom=edge(m.replaceStart)-36;
  const guides=(a:number,b:number,top:number,bottom:number) => <path d={`M${a} ${top}L${b} ${bottom}`}/>;
  return <Frame {...props} hidden={id!=='8-replace'}><Svg width={Math.max(610,edge(m.moveBefore.length+2)+15)} height={id==='8-replace'?155:id==='8-shift'?105:65}>
    <g stroke="currentColor" fill="none" fontFamily="monospace">
      {id==='8-arrays'?<><ArrayRow label="配列Sの内容" row={rows[0]} y={7}/><ArrayRow label="配列Vの内容" row={rows[1]} y={31}/></>:
        id==='8-next'?<><ArrayRow label="配列S" row={rows[0]} y={5}/><Text x={center(m.first)-6} y={49}>{'↑ next ← '+m.first}</Text></>:
        id==='8-replace'?<>
          <ArrayRow label="配列S" row={rows[0]} y={6}/>
          <ArrayRow label="出力" row={[...m.output[0]]} y={66} start={outputFrom}/>
          <ArrayRow label="配列S" row={parserArray(m.firstReplaced)} y={126}/>
          {guides(edge(m.replaceStart),outputFrom+5*arrayCell,30,66)}
          {guides(edge(m.replaceEnd),outputFrom+m.output[0].length*arrayCell,30,66)}
          {guides(outputFrom,edge(m.replaceStart),90,126)}
          {guides(outputFrom+4*arrayCell,edge(m.replaceStart+4),90,126)}
          <Text x={outputFrom+5*arrayCell} y={53}>①</Text><Text x={outputFrom+2*arrayCell} y={111}>②</Text>
        </>:<>
          <ArrayRow label="配列S（移動前）" row={parserArray(m.moveBefore)} y={6}/>
          <ArrayRow label="配列S（移動後）" row={parserArray(m.moved)} y={75}/>
          {guides(edge(m.moveFrom),edge(m.moveFrom+m.move),30,75)}
          {guides(edge(m.moveBefore.length+2),edge(m.moved.length+2),30,75)}
          <Text x={center(m.moveFrom)-5} y={53}>↑ from</Text>
        </>}
    </g>
  </Svg></Frame>;
}
function ParserTable(props:Props) {
  const code=props.id==='8-codes';
  return <Frame {...props} first><DataTable columns={code?characterColumns:stateColumns} rows={code?characterRows:stateRows}/></Frame>;
}
const renderers:Record<DrawingId,(props:Props)=>ReactNode>={
  '5-slip':Slip,'5-objects':Objects,'5-analysis':Classes,'5-design':Classes,
  '6-work-formula':Formula,'6-head-formula':Formula,'6-efforts':Staffing,'6-schedule':Staffing,
  '7-data':MarketTable,'7-current-axes':MarketTable,'7-current':Charts,'7-prior-axes':MarketTable,'7-prior':Charts,
  '8-example':ParserCode,'8-arrays':ParserArrays,'8-codes':ParserTable,'8-states':ParserTable,'8-invalid':ParserCode,
  '8-next':ParserArrays,'8-replace':ParserArrays,'8-search':ParserCode,'8-shift':ParserArrays,'8-move':ParserCode,
};
export const legacy2011AutumnPm0508FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>{
  const Render=renderers[id];
  return {profile:profile(id),component:props=><Render {...props} id={id}/>};
});
