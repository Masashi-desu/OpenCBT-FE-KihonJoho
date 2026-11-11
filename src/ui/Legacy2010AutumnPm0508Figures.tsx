import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { drawingAlt, drawingIds, operationLabel, profile, programSheets, traceAt, traceMaskNote, type DrawingId } from '../core/generators/legacy-2010-autumn-pm-05-08-figures';
import { binary, inventoryAt, inventoryRecordFields } from '../core/generators/legacy-2010-autumn-pm-05-08-model';
type Props=BookletFigureProps & { id:DrawingId };
const ink='var(--diagram-ink)', surface='var(--surface)', shade='var(--soft-border)';
function Frame({id,values,caption,children,note}:{children:ReactNode;note?:string}&Props){
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    {note&&<p>{note}</p>}<figcaption>{caption}</figcaption>
  </figure>;
}
function Svg({width,height,children,title,description}:{width:number;height:number;children:(arrow:string)=>ReactNode;title:string;description:string}) {
  const id=useId();
  return <svg role="img" aria-labelledby={id+"-title"} aria-describedby={id+"-description"} viewBox={`0 0 ${width} ${height}`} style={{
    color:ink,width:`calc(${width}px * var(--image-scale, 1))`,maxWidth:'none',height:'auto',display:'block',marginInline:'auto',
  }}>
    <title id={id+"-title"}>{title}</title><desc id={id+"-description"}>{description}</desc>
    <defs><marker id={id} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M1 1L6 3.5L1 6" fill="none" stroke="currentColor"/>
    </marker></defs>
    {children('url(#'+id+')')}
  </svg>;
}
function Text({x,y,children}:{x:number;y:number;children:ReactNode}) {
  return <text x={x} y={y} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}

type NodeKind = 'process'|'module'|'file'|'report'|'start'|'loop-start'|'loop-end'|'test';
function Node({x,y,text,kind,width=156,height=30}:{x:number;y:number;text:string;kind:NodeKind;width?:number;height?:number}) {
  const [left,top,right,bottom] = [x-width/2,y-height/2,x+width/2,y+height/2];
  let outline:ReactNode;
  if(kind==='file') outline=<path d={`M${left+8} ${top}H${right-8}Q${right+8} ${y} ${right-8} ${bottom}H${left+8}Q${left-8} ${y} ${left+8} ${top}M${right-8} ${top}Q${right-23} ${y} ${right-8} ${bottom}`}/>;
  else if(kind==='report') outline=<path d={`M${left} ${top}H${right}V${bottom-5}Q${x+width/4} ${bottom-19} ${x} ${bottom-5}T${left} ${bottom-5}Z`}/>;
  else if(kind==='test') outline=<path d={`M${x} ${top}L${right} ${y}L${x} ${bottom}L${left} ${y}Z`}/>;
  else if(kind==='loop-start') outline=<path d={`M${left} ${top+11}L${left+20} ${top}H${right-20}L${right} ${top+11}V${bottom}H${left}Z`}/>;
  else if(kind==='loop-end') outline=<path d={`M${left} ${top}H${right}V${bottom-11}L${right-20} ${bottom}H${left+20}L${left} ${bottom-11}Z`}/>;
  else outline=<rect x={left} y={top} width={width} height={height} rx={kind==='start'?height/2:undefined}/>;
  const lines=text.split('\n');
  return <g>
    <g fill={surface} stroke="currentColor" strokeWidth="1.4">{outline}
      {kind==='module'&&<path d={`M${left+11} ${top}V${bottom}M${right-11} ${top}V${bottom}`}/>}
    </g>
    {lines.map((line,i)=><Text key={i} x={x} y={y+4+(i-(lines.length-1)/2)*16}>{line}</Text>)}
  </g>;
}
function InputOutput(props:Props){
  return <Frame {...props}><Svg title={props.caption} description={drawingAlt(props.id,props.values[0])} width={540} height={400}>{()=> <g fontSize="15">
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M90 65V90H250V110M250 65V110M425 65V110"/>
      <path d="M250 150V185M425 150V185M250 230V260H337V280M425 230V260H337"/>
      <path d="M337 320V343H215V365M337 343H450V365"/>
    </g>
    <Node x={90} y={44} text="期首在庫" kind="file" width={145} height={42}/>
    <Node x={250} y={44} text="期中受入れ" kind="file" width={145} height={42}/>
    <Node x={425} y={44} text="期中払出し" kind="file" width={145} height={42}/>
    <Node x={250} y={130} text="受入情報作成" kind="module" width={156} height={40}/>
    <Node x={425} y={130} text="払出情報作成" kind="module" width={156} height={40}/>
    <Node x={250} y={208} text="受入情報" kind="file" width={145} height={45}/>
    <Node x={425} y={208} text="払出情報" kind="file" width={145} height={45}/>
    <Node x={337} y={300} text="棚卸計算" kind="module" width={156} height={40}/>
    <Node x={215} y={382} text="期末在庫" kind="file" width={145} height={34}/>
    <Node x={450} y={382} text="棚卸金額" kind="file" width={145} height={34}/>
  </g>}</Svg></Frame>;
}
function Records(props:Props){
  return <Frame {...props}><Svg title={props.caption} description={drawingAlt(props.id,props.values[0])} width={592} height={53}>{()=> <g fontSize="15">
    {inventoryRecordFields(props.values[0]).map((name,i)=><g key={name}>
      <rect x={12+i*142} y={7} width={142} height={36} fill={surface} stroke="currentColor"/>
      <Text x={83+i*142} y={30}>{name}</Text>
    </g>)}
  </g>}</Svg></Frame>;
}
function Flow(props:Props){
  const {reverse,processes:[first,second,third]}=inventoryAt(props.values[0]);
  return <Frame {...props}><Svg title={props.caption} description={drawingAlt(props.id,props.values[0])} width={980} height={1135}>{arrow=><g fontSize="15">
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M340 23V790M340 300H112V423M340 300H680V650H340M340 405H240V505H340M340 405H480V650H340"/>
      <path d="M340 650H112V423M340 650H480M360 1040H120M120 842V1070M120 936H360V1040H120"/>
      <path d="M840 1040H600M600 842V1070M600 936H840V1040H600"/>
      <path d="M352 650h-12" markerEnd={arrow}/><path d="M328 505h12" markerEnd={arrow}/>
      <path d="M132 1040h-12" markerEnd={arrow}/><path d="M612 1040h-12" markerEnd={arrow}/>
    </g>
    {[['棚卸計算',23],['変数の初期化',58],['各ファイルを開く',93],['受入情報読込み',128],['払出情報読込み',163]].map(([text,y],j)=>
      <Node key={j} x={340} y={Number(y)} text={String(text)} kind={j===0?'start':'module'} width={200} height={28}/>)}
    <Node x={340} y={229} text={'引当て\nKHが最大値\nかつ\nKUが最大値'} kind="loop-start" width={200} height={84}/>
    <Node x={340} y={300} text="KU：KH" kind="test" width={220} height={52}/>
    <Text x={229} y={287}>＜</Text><Text x={340} y={340}>＝</Text><Text x={455} y={287}>＞</Text>
    <Node x={112} y={347} text="期末在庫書込み" kind="module" width={200} height={28}/>
    <Node x={112} y={385} text="金額集計" kind="module" width={200} height={28}/>
    <Node x={112} y={423} text={first} kind="module" width={200} height={28}/>
    <Node x={680} y={347} text="誤り処理" kind="module" width={200} height={28}/>
    <Node x={680} y={397} text={'KU ← 最大値\nKH ← 最大値'} kind="process" width={200} height={62}/>
    <Node x={340} y={354} text="H ← H−U" kind="process" width={200} height={28}/>
    <Node x={340} y={405} text={reverse?'0：H':'H：0'} kind="test" width={200} height={52}/>
    <Text x={250} y={392}>C1</Text><Text x={368} y={447}>C2</Text><Text x={481} y={386}>（省略）</Text>
    <Node x={240} y={466} text="期末在庫書込み" kind="module" width={184} height={28}/>
    <Node x={240} y={505} text={second} kind="module" width={184} height={28}/>
    <Node x={480} y={552} text="受入情報読込み" kind="module" width={200} height={28}/>
    <Node x={340} y={582} text={third} kind="module" width={200} height={28}/>
    <Node x={340} y={620} text="払出情報読込み" kind="module" width={200} height={28}/>
    <Node x={340} y={675} text="引当て" kind="loop-end" width={200} height={35}/>
    <Node x={340} y={720} text="棚卸金額書込み" kind="module" width={200} height={28}/>
    <Node x={340} y={755} text="各ファイルを閉じる" kind="module" width={200} height={28}/>
    <Node x={340} y={790} text="終了" kind="start" width={200} height={28}/>
    <Text x={660} y={163}>注　KH，KU，H，Uは作業領域である。</Text>
    <Text x={660} y={186}>最大値は，突合せキーが取り得る値</Text>
    <Text x={660} y={209}>よりも大きな値である。</Text>
    {[{x:120,name:'受入情報読込み',type:'受入',target:'KU',quantity:'U',amount:'受入数量'},
      {x:600,name:'払出情報読込み',type:'払出',target:'KH',quantity:'H',amount:'払出数量'}].map(({x,name,type,target,quantity,amount})=><g key={name}>
        <Node x={x} y={842} text={name} kind="start" width={220} height={28}/>
        <Node x={x} y={882} text={type+'情報を読む'} kind="process" width={220} height={30}/>
        <Node x={x} y={936} text="ファイルの終わり" kind="test" width={220} height={50}/>
        <Node x={x} y={990} text={target+' ← 最大値'} kind="process" width={220} height={30}/>
        <Node x={x+240} y={990} text={quantity+' ← '+amount+'\n'+target+' ← 突合せキーの値'} kind="process" width={220} height={58}/>
        <Text x={x+122} y={921}>No</Text><Text x={x+22} y={975}>Yes</Text>
        <Node x={x} y={1070} text="終了" kind="start" width={220} height={28}/>
      </g>)}
  </g>}</Svg></Frame>;
}
function Program(props:Props & {number:1|2}){
  const sheet=programSheets[props.number-1], rowHeight=28, y=(row:number)=>22+row*rowHeight, x=(depth:number)=>105+depth*26;
  return <Frame {...props}><Svg title={props.caption} description={drawingAlt(props.id,props.values[0])} width={820} height={y(sheet.lines.length-1)+18}>{()=> <g fontSize="15.5" fontFamily="Monaco, Consolas, monospace">
    {sheet.rails.map((rail,i)=>{
      const railX=x(rail.depth)-12, top=y(rail.start)-13,bottom=y(rail.end)+3;
      return <g key={i} data-control={rail.kind} fill="currentColor" stroke="currentColor">
        <path d={'M'+railX+' '+(top+6)+'V'+(bottom-6)} fill="none"/>
        {rail.kind==='loop'?<><rect x={railX-6} y={top} width={12} height={12}/><rect x={railX-6} y={bottom-12} width={12} height={12}/></>:
          <><path d={'M'+railX+' '+top+'l-6 10h12Z'}/><path d={'M'+railX+' '+bottom+'l-6 -10h12Z'}/></>}
      </g>;
    })}
    {sheet.lines.map((line,i)=><g key={i} data-program-line={i}>
      {line.operation&&<text x={10} y={y(i)} fill="currentColor">{operationLabel(line.operation)+' →'}</text>}
      <text x={x(line.depth)} y={y(i)} fill="currentColor" xmlSpace="preserve">{line.text}</text>
      {line.continuation&&<text x={490} y={y(i)} fill="currentColor">{line.continuation}</text>}
    </g>)}
  </g>}</Svg></Frame>;
}
const bitWidth=24,bitHeight=25;
function Bits({bits,x,y,mask=0,blank,split}:{bits:string;x:number;y:number;mask?:number;blank?:string;split?:number}){
  const cut=blank?split??0:mask;
  return <g data-visible={cut?bits.slice(cut):bits}>
    <rect x={x} y={y} width={bits.length*bitWidth} height={bitHeight} fill={surface} stroke="currentColor"/>
    {mask>0&&<rect x={x} y={y} width={mask*bitWidth} height={bitHeight} fill={shade} stroke="currentColor"/>}
    {Array.from(bits).map((bit,i)=><g key={i}>
      {i>0&&i!==split&&<path d={'M'+(x+i*bitWidth)+' '+y+'v'+bitHeight} stroke="currentColor" strokeDasharray="1 2"/>}
      {i>=cut&&<Text x={x+(i+.5)*bitWidth} y={y+18}>{bit}</Text>}
    </g>)}
    {blank&&<g><rect x={x} y={y} width={(split??0)*bitWidth} height={bitHeight} fill={surface} stroke="currentColor"/><Text x={x+(split??0)*bitWidth/2} y={y+18}>{blank}</Text></g>}
    {split&&<path d={'M'+(x+split*bitWidth)+' '+y+'v'+bitHeight} stroke="currentColor" strokeWidth="1.6"/>}
  </g>;
}
function Trace(props:Props & {kind:1|2|3}){
  const {m,n,width,trace}=traceAt(props.values[0],props.kind), start=42, first=211;
  let lastY=first;
  const positions=trace.map((row,i)=>{if(i)lastY+=row.gap?112:trace[i-1].before?100:72;return lastY;});
  const end=positions.at(-1)!+bitHeight, svgWidth=start+width*bitWidth+80;
  return <Frame {...props} note={props.kind===1?undefined:traceMaskNote}><Svg title={props.caption} description={drawingAlt(props.id,props.values[0])} width={svgWidth} height={end+18}>{arrow=><g fontFamily="Monaco, Consolas, monospace" fontSize="15">
    {Array.from({length:width},(_,i)=><Text key={i} x={start+(i+.5)*bitWidth} y={18}>{width-i-1}</Text>)}
    <Text x={23} y={43}>R</Text><Bits x={start} y={25} bits={' '.repeat(width)}/>
    <Text x={23} y={107}>M</Text><Bits x={start} y={89} bits={binary(m,4)}/>
    <Text x={start+8*bitWidth-16} y={107}>N</Text><Bits x={start+8*bitWidth} y={89} bits={binary(n,4)}/>
    <g fill="none" stroke="currentColor">
      <path d={'M'+start+' 114v49M'+(start+4*bitWidth)+' 114l'+bitWidth+' 24'}/>
      {props.kind!==3&&<path d={'M'+(start+8*bitWidth)+' 114l-'+(3*bitWidth)+' 24M'+(start+12*bitWidth)+' 114v24'}/>}
    </g>
    <Text x={start+bitWidth} y={132}>①</Text><Bits x={start} y={138} bits={binary(m,5)}/>
    {props.kind!==3&&<><Text x={start+8*bitWidth} y={132}>②</Text><Bits x={start+5*bitWidth} y={138} bits={binary(n,8)}/></>}
    {trace.map((row,i)=>{
      const y=positions[i], previous=i?positions[i-1]:163, right=start+width*bitWidth;
      return <g key={i} data-trace-row={i}>
        {row.gap&&<Text x={start+width*bitWidth/2} y={y-56}>⋮</Text>}
        {i>0&&<g fill="none" stroke="currentColor">
          <path d={'M'+start+' '+(previous+bitHeight)+'L'+(start+(width-row.bits.length)*bitWidth+(row.bits.length===width&&(row.operation===7||row.operation===8)?bitWidth:0))+' '+y}/>
          <path d={'M'+(right-(trace[i-1].bits.length===width?0:(width-trace[i-1].bits.length)*bitWidth))+' '+(previous+bitHeight)+'L'+right+' '+y}/>
        </g>}
        {row.operation&&<Text x={start+(i===0&&props.kind!==3?9:width/2)*bitWidth} y={y-13}>{operationLabel(row.operation)}</Text>}
        {i===0&&props.kind!==3&&<g>
          <Text x={start+2.5*bitWidth} y={y-13}>④</Text>
          <path d={'M'+start+' '+(y-7)+'h'+(5*bitWidth)} fill="none" stroke="currentColor"/>
        </g>}
        {row.before&&<g>
          <Text x={23} y={y+53}>M</Text><Bits x={start} y={y+35} bits={binary(m,5)}/>
        </g>}
        <Text x={23} y={y+18}>{i===trace.length-1?'':'R'}</Text>
        <g data-trace-register="true"><Bits x={start+(width-row.bits.length)*bitWidth} y={y} bits={row.bits} split={row.split} mask={row.mask} blank={row.blank}/></g>
        {row.test&&<g>
          <path d={'M'+(right+24)+' '+(y+42)+'l-24 -17'} fill="none" stroke="currentColor" markerEnd={arrow}/>
          <Text x={right+29} y={y+58}>{operationLabel(row.test)}</Text>
        </g>}
      </g>;
    })}
  </g>}</Svg></Frame>;
}
const Components:Record<DrawingId,(props:Props)=>ReactNode>={
  '5-input-output':InputOutput,'5-record':Records,'5-flow':Flow,
  '8-program-1':props=><Program {...props} number={1}/>,
  '8-program-2':props=><Program {...props} number={2}/>,
  '8-trace-1':props=><Trace {...props} kind={1}/>,
  '8-trace-2':props=><Trace {...props} kind={2}/>,
  '8-trace-3':props=><Trace {...props} kind={3}/>,
};
export const legacy2010AutumnPm0508FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=>{const Component=Components[id];return <Component {...props} id={id}/>;},
}));
