import {useId,type ReactNode} from 'react';
import type {BookletFigureProps,BookletFigureRenderer} from './booklet-figure-renderer-contract';
import {architectureCases,branchCases,chargePlots,dfdCases,drawingAlt,drawingIds,lanCases,profile,type ChargeId,type DrawingId} from '../core/generators/legacy-2008-spring-am-27-53-figures';

type Props=BookletFigureProps&{id:DrawingId};
function Drawing({id,values,caption,width,height,children}:Props&{width:number;height:number;children:(arrow:string)=>ReactNode}) {
  const uid=useId(),title=uid+'-title',description=uid+'-desc',arrow=uid+'-arrow';
  const alt=drawingAlt(id,values[0]);
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={alt}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={title} aria-describedby={description}
        style={{color:'var(--diagram-ink)',width:`calc(${width}px * var(--image-scale, 1))`,maxWidth:'none',height:'auto',display:'block',marginInline:'auto'}}>
        <title id={title}>{caption}</title><desc id={description}>{alt}</desc>
        <defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g fontSize="16">{children('url(#'+arrow+')')}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Label({x,y,children,anchor='middle'}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end'}) {
  return <text x={x} y={y} textAnchor={anchor} fill="currentColor" stroke="none">{children}</text>;
}
function Box({x,y,width,height,label,vertical=false}:{
  x:number;y:number;width:number;height:number;label:string;vertical?:boolean;
}) {
  return <g>
    <rect x={x} y={y} width={width} height={height} fill="var(--surface)" stroke="currentColor" strokeWidth="1.5"/>
    {vertical?Array.from(label).map((character,i)=><Label key={i} x={x+width/2} y={y+(height-label.length*18)/2+15+i*18}>{character}</Label>):
      <Label x={x+width/2} y={y+height/2+5}>{label}</Label>}
  </g>;
}
function Architecture(props:Props) {
  const {mode,left,right,ends,processors}=architectureCases[props.values[0]];
  const simplex=mode==='simplex', duplex=mode==='duplex';
  return <Drawing {...props} width={655} height={215}>{()=> <>
    <g fill="none" stroke="currentColor" strokeWidth="1.6">
      {[83,106,129].map(y=><path key={y} d={`M20 ${y}h36l-7 -7h35`}/>)}
      {simplex?<path d="M118 101H244M336 101H470"/>:
        <path d="M118 101H172M212 90L244 62M212 112L244 144M336 62L382 90M336 144L382 112"/>}
      {!simplex&&(duplex?<path d="M422 62H470M422 144H470"/>:<path d="M422 101H470"/>)}
    </g>
    <Box x={84} y={43} width={34} height={120} label="通信制御装置" vertical/>
    {!simplex&&<>
      <Box x={172} y={duplex?48:58} width={40} height={duplex?110:86} label={left} vertical/>
      <Box x={382} y={duplex?48:58} width={40} height={duplex?110:86} label={right} vertical/>
    </>}
    {processors.map((name,i)=><Box key={i} x={244} y={simplex?80:41+i*82} width={92} height={42} label={name}/>)}
    {ends.map((name,i)=><Box key={name} x={470} y={duplex?41+i*82:80} width={168} height={42} label={name}/>)}
  </>}</Drawing>;
}
function Lan(props:Props) {
  const {clients,printers}=lanCases[props.values[0]],total=clients+printers;
  const positions=Array.from({length:total},(_,i)=>84+i*706/(total-1));
  return <Drawing {...props} width={880} height={212}>{()=> <>
    <path d="M22 100H855M442 67v33" stroke="currentColor" fill="none" strokeWidth="1.7"/>
    <Box x={383} y={25} width={118} height={42} label="サーバ"/>
    {[22,442,855].map(x=><rect key={x} x={x-4} y="96" width="8" height="8" fill="currentColor"/>)}
    {positions.map((x,i)=><g key={x} data-lan-device={i<clients?'client':'printer'}>
      <path d={`M${x} 100v32`} stroke="currentColor" fill="none" strokeWidth="1.5"/>
      <rect x={x-5} y="96" width="10" height="8" fill="currentColor"/>
      {i<clients?<Box x={x-58} y={132} width={116} height={44} label="クライアント"/>:<>
        <path d={`M${x-58} 132h116v44q-29 -13 -58 0t-58 0Z`} fill="var(--surface)" stroke="currentColor" strokeWidth="1.5"/>
        <Label x={x} y={159}>プリンタ</Label>
      </>}
    </g>)}
  </>}</Drawing>;
}
function Dfd(props:Props) {
  const {sender,input,task,output,next}=dfdCases[props.values[0]];
  const process=(x:number,labels:readonly string[])=><g>
    <ellipse cx={x} cy="75" rx="70" ry="31" fill="var(--surface)" stroke="currentColor" strokeWidth="1.5"/>
    {labels.map((label,i)=><Label key={label} x={x} y={80+(i-(labels.length-1)/2)*19}>{label}</Label>)}
  </g>;
  return <Drawing {...props} width={770} height={212}>{arrow=><>
    <Box x={20} y={53} width={130} height={44} label={sender}/>
    {process(320,task)}{process(571,next)}
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M150 75H248" markerEnd={arrow}/><path d="M390 75H499" markerEnd={arrow}/>
      <path d="M641 75H749" markerEnd={arrow}/><path d="M244 152l53 -49" markerEnd={arrow}/>
      <path d="M194 152h101m-101 31h101"/>
    </g>
    <Label x={194} y={63}>{input}</Label><Label x={441} y={63}>{output}</Label><Label x={244} y={174}>A</Label>
  </>}</Drawing>;
}
function Branch(props:Props) {
  const {statement}=branchCases[props.values[0]];
  return <Drawing {...props} width={459} height={281}>{arrow=><>
    <path d="M208 14v20m0 41v27m0 69v29m0 43v24M325 136H393V257H209"
      fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M228 257H210" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}/>
    <path d="M208 101l117 35-117 35-117-35Z" fill="var(--surface)" stroke="currentColor" strokeWidth="1.5"/>
    <Box x={143} y={34} width={130} height={41} label="処理1"/>
    <Box x={143} y={200} width={130} height={43} label="処理2"/>
    <Label x={208} y={142}>{statement}</Label><Label x={232} y={188}>Yes</Label><Label x={341} y={126}>No</Label>
  </>}</Drawing>;
}
function Charge(props:Props) {
  const plot=chargePlots[props.id as ChargeId];
  const points=plot.points.map(([x,y])=>`${35+x*17},${183-y*1.65}`).join(' ');
  return <Drawing {...props} width={227} height={205}>{()=> <>
    <path d="M35 17V183H218" fill="none" stroke="currentColor" strokeWidth="1.6"/>
    <Label x={29} y={195}>0</Label>
    <polyline points={points} data-fee-curve="true" fill="none" stroke="currentColor" strokeWidth="1.8"/>
  </>}</Drawing>;
}
function component(id:DrawingId) {
  if(id==='31-system')return Architecture;
  if(id==='32-lan')return Lan;
  if(id==='42-dfd')return Dfd;
  if(id==='48-flow')return Branch;
  return Charge;
}
export const legacy2008SpringAm2753FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=>{
    const View=component(id);
    return <View {...props} id={id}/>;
  },
}));
