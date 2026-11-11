import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  connections, customerColumns, drawingIds, drawings, dummy, ledgerAt, operations, optionIds, orderColumns,
  profile, projectAt, recordsAt, subnetAt, treeAt, type DrawingId,
} from '../core/generators/legacy-2010-autumn-am-27-53-figures';

type Props=BookletFigureProps&{id:DrawingId};
const ink='var(--diagram-ink)', surface='var(--surface)';
const cell={border:'1px solid currentColor',padding:'.23em .44em',whiteSpace:'nowrap'} as const;
function Frame({id,values,caption,children,graphic=false}:Props&{children:ReactNode;graphic?:boolean}) {
  return <figure className="managed-diagram source-figure"
    {...(graphic ? {} : {role:'group','aria-label':caption,'aria-description':drawings[id].alt(values)})}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>;
}
function Svg({id: drawing,values,caption,width,height,children}:Props&{width:number;height:number;children:(arrow:string)=>ReactNode}) {
  const id=useId(), titleId=id+'-title', descriptionId=id+'-description', arrowId=id+'-arrow';
  return <svg role="img" aria-labelledby={titleId} aria-describedby={descriptionId}
    viewBox={`0 0 ${width} ${height}`} style={{
    display:'block',marginInline:'auto',width:`calc(${width}px * var(--image-scale, 1))`,height:'auto',maxWidth:'none',color:ink,
  }}>
    <title id={titleId}>{caption}</title>
    <desc id={descriptionId}>{drawings[drawing].alt(values)}</desc>
    <defs><marker id={arrowId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M1 1L6 3.5L1 6" fill="none" stroke="currentColor"/>
    </marker></defs>
    <g aria-hidden="true">{children('url(#'+arrowId+')')}</g>
  </svg>;
}
function Text({x,y,children,anchor='middle'}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end'}) {
  return <text x={x} y={y} textAnchor={anchor} fill="currentColor" stroke="none">{children}</text>;
}
function Box({x,y,width,height,label}:{x:number;y:number;width:number;height:number;label:string}) {
  const lines=label.split('\n');
  return <g>
    <rect x={x-width/2} y={y-height/2} width={width} height={height} fill={surface} stroke="currentColor"/>
    {lines.map((line,i)=><Text key={i} x={x} y={y+5+(i-(lines.length-1)/2)*17}>{line}</Text>)}
  </g>;
}
function Ledger(props:Props) {
  const row=ledgerAt(props.values);
  return <Frame {...props}>
    <div style={{color:ink,fontSize:'calc(1em * var(--image-scale, 1))',width:'max-content',marginInline:'auto'}}>
      <div>{row.name}（<u>{row.key}</u>，{row.first.join('，')}，</div>
      <div style={{paddingInlineStart:'5em'}}>{row.second.join('，')}）</div>
    </div>
  </Frame>;
}
function DataTable({caption,columns,rows}:{caption:string;columns:string[];rows:readonly (readonly string[])[]}) {
  return <table style={{color:ink,borderCollapse:'collapse'}}>
    <caption style={{textAlign:'left'}}>{caption}</caption>
    <thead><tr>{columns.map(column=><th key={column} scope="col" style={cell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map((row,i)=><tr key={i}>{row.map((value,j)=><td key={j} style={cell}>{value}</td>)}</tr>)}</tbody>
  </table>;
}
function Records(props:Props) {
  const {orders,customers}=recordsAt(props.values);
  return <Frame {...props}>
    <div style={{display:'flex',gap:'3em',alignItems:'flex-start',width:'max-content',marginInline:'auto',fontSize:'calc(1em * var(--image-scale, 1))'}}>
      <DataTable caption="注文" columns={orderColumns} rows={orders}/>
      <DataTable caption="顧客" columns={customerColumns} rows={customers}/>
    </div>
  </Frame>;
}
function Operation(props:Props) {
  const {table,action,row}=operations[optionIds.indexOf(props.id as typeof optionIds[number])];
  return <Frame {...props}>
    <div style={{color:ink,display:'flex',alignItems:'center',gap:'.55em',width:'max-content',fontSize:'calc(1em * var(--image-scale, 1))'}}>
      <span>{'“'+table+'”表'+(action==='追加'?'に行':'の行')}</span>
      <table style={{borderCollapse:'collapse'}} aria-label="対象行"><tbody>
        <tr>{row.map(value=><td key={value} style={cell}>{value}</td>)}</tr>
      </tbody></table>
      <span>{'を'+action+'する。'}</span>
    </div>
  </Frame>;
}
function Subnets(props:Props) {
  const {ports,hosts}=subnetAt(props.values);
  const nodes=[87,222,382,517], gateways=[154,449];
  return <Frame {...props} graphic><Svg {...props} width={608} height={208}>{()=><g fontSize="15">
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M24 102H284M324 102H583" strokeWidth="3"/>
      {gateways.map(x=><path key={x} d={`M${x} 57V102`}/>)}
      {nodes.map(x=><path key={x} d={`M${x} 102V142`}/>)}
      {[24,...nodes,...gateways,284,324,583].map(x=><rect key={x} x={x-5} y={98} width="10" height="8" fill="currentColor"/>)}
    </g>
    <Box x={304} y={34} width={558} height={46} label="ルータ"/>
    {gateways.map((x,i)=><Text key={x} x={x+10} y={77} anchor="start">{ports[i]}</Text>)}
    {nodes.map((x,i)=><g key={x}><Box x={x} y={158} width={54} height={33} label={'ABCD'[i]}/>
      <Text x={x} y={194}>{hosts[i]}</Text></g>)}
  </g>}</Svg></Frame>;
}
function Ftth(props:Props) {
  return <Frame {...props} graphic><Svg {...props} width={686} height={143}>{()=><g fontSize="15">
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="18" y="30" width="413" height="99"/>
      <path d="M107 52L153 73M107 109L153 87M222 80H259M332 80H348M420 80H661"/>
    </g>
    <Text x={424} y={24} anchor="end">利用者宅内</Text>
    <Text x={80} y={84}>⋮</Text>
    <Box x={79} y={52} width={58} height={28} label="PC"/>
    <Box x={79} y={109} width={58} height={28} label="PC"/>
    <Box x={187} y={80} width={68} height={29} label="ハブ"/>
    <Box x={294} y={80} width={70} height={29} label="装置A"/>
    <Box x={384} y={80} width={72} height={29} label="ONU"/>
    <Text x={449} y={70} anchor="start">光ファイバケーブル（FTTH）</Text>
  </g>}</Svg></Frame>;
}
function Tree(props:Props) {
  const [top,left,right,child1,child2]=treeAt(props.values);
  return <Frame {...props} graphic><Svg {...props} width={602} height={246}>{()=><g fontSize="15">
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M294 47V82M108 100V76H520M294 75V101M440 76V101M294 143V168M210 187V168H542M371 168V187M482 168V187"/>
      <path d="M520 76h37M542 168h36M108 143v20M371 224v19" strokeDasharray="4 4"/>
    </g>
    <Box x={294} y={30} width={152} height={35} label={top}/>
    <Box x={108} y={122} width={135} height={42} label={left}/>
    <Box x={294} y={122} width={158} height={42} label={right}/>
    <Text x={440} y={127}>…</Text>
    <Box x={210} y={205} width={124} height={37} label={child1}/>
    <Box x={371} y={205} width={128} height={37} label={child2}/>
    <Text x={482} y={210}>…</Text>
  </g>}</Svg></Frame>;
}
const events=[[40,105],[155,105],[262,42],[277,105],[293,173],[420,105],[553,105]] as const;
const positions=[[95,125],[208,94],[215,126],[217,153],[333,91],[347,126],[363,159],[489,126]] as const;
const radius=13;
function arrowBetween(from:number,to:number) {
  const [x,y]=events[from-1],[X,Y]=events[to-1], length=Math.hypot(X-x,Y-y);
  const a=(X-x)/length*radius,b=(Y-y)/length*radius;
  return `M${x+a} ${y+b}L${X-a} ${Y-b}`;
}
function Project(props:Props) {
  const times=projectAt(props.values);
  return <Frame {...props} graphic><Svg {...props} width={662} height={258}>{arrow=><g fontSize="15">
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      {connections.map(([from,to])=><path key={from+'-'+to} d={arrowBetween(from,to)} markerEnd={arrow}/>)}
      {dummy.map(([from,to])=><path key={from+'-'+to} data-dummy={from+'-'+to} d={arrowBetween(from,to)}
        markerEnd={arrow} strokeDasharray="5 4"/>)}
      {events.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={radius} fill={surface}/>)}
      <circle cx="468" cy="190" r="13"/><circle cx="610" cy="190" r="13"/>
      <path d="M481 190H597" markerEnd={arrow}/><path d="M457 238H512" markerEnd={arrow} strokeDasharray="5 4"/>
    </g>
    {events.map(([x,y],i)=><Text key={i} x={x} y={y+5}>{i+1}</Text>)}
    {positions.map(([x,y],i)=><Text key={i} x={x} y={y}>{times[i]}</Text>)}
    <Text x={477} y={163}>凡例</Text><Text x={539} y={211}>所要日数</Text>
    <Text x={523} y={243} anchor="start">：ダミー作業</Text>
  </g>}</Svg></Frame>;
}
function Drawing(props:Props) {
  switch(props.id) {
    case '29-ledger':return <Ledger {...props}/>;
    case '33-records':return <Records {...props}/>;
    case '37-network':return <Subnets {...props}/>;
    case '38-ftth':return <Ftth {...props}/>;
    case '51-breakdown':return <Tree {...props}/>;
    case '52-network':return <Project {...props}/>;
    default:return <Operation {...props}/>;
  }
}
export const legacy2010AutumnAm2753FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=><Drawing {...props} id={id}/>,
}));
