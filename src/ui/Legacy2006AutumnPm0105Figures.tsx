import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2006AutumnPm0105Figures, neededFields, profiles, ratioFields, salesFields, totalFields, type FigureKind } from '../core/generators/legacy-2006-autumn-pm-01-05-figures';
import { tabExample } from '../core/generators/legacy-2006-autumn-pm-4-model';
import { mixtureLabels } from '../core/generators/legacy-2006-autumn-pm-5-model';

type DrawingProps = BookletFigureProps & {kind:FigureKind;width:number;height:number;children:ReactNode};
function Drawing({kind,caption,values,width,height,children}:DrawingProps) {
 const id=useId(),profile=profiles[kind],alt=legacy2006AutumnPm0105Figures.find(f=>f.profile===profile)!.alt(values);
 return <figure className="managed-diagram source-figure"><div tabIndex={0} className="diagram-scroll" aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
  <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'} viewBox={`0 0 ${width} ${height}`}
   style={{display:'block',width:`calc(${width}px * var(--image-scale, 1))`,height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
   <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
   <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4}>{children}</g>
  </svg>
 </div></figure>;
}
function Label({x,y,children,start=false,size=15}:{x:number;y:number;children:ReactNode;start?:boolean;size?:number}){
 return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={start?'start':'middle'} fontSize={size}>{children}</text>;
}
function Arrow({d}:{d:string}) {
 const id=useId();
 return <><defs><marker id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
  <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
 </marker></defs><path d={d} markerEnd={`url(#${id})`}/></>;
}
function Box({x,y,w,h=32,rounded=false,children}:{x:number;y:number;w:number;h?:number;rounded?:boolean;children:ReactNode}) {
 return <g><rect x={x} y={y} width={w} height={h} rx={rounded?h/2:0}/><Label x={x+w/2} y={y+h/2+5}>{children}</Label></g>;
}
function Caption({x,y,children}:{x:number;y:number;children:ReactNode}){
 return <Label x={x} y={y}>{children}</Label>;
}
function Cells({values,widths,x=12,y=12,h=32}:{values:readonly string[];widths:readonly number[];x?:number;y?:number;h?:number}) {
 let left=x;
 return <>{values.map((text,i)=>{
  const start=left;left+=widths[i];
  return <Box key={i} x={start} y={y} w={widths[i]} h={h}>{text}</Box>;
 })}</>;
}
function SalesFormat(props:BookletFigureProps){
 return <Drawing {...props} kind="sales-format" width={802} height={138}>
  <Cells values={salesFields} widths={[80,63,72,97,119,68,70,52]} y={51}/>
  <path d="M155 44Q155 37 163 37H279Q287 37 287 30Q287 37 295 37H434Q443 37 443 44
    M443 44Q443 37 451 37H541Q550 37 550 30Q550 37 558 37H648Q656 37 656 44
    M511 91Q511 98 519 98H565Q573 98 573 105Q573 98 581 98H626Q633 98 633 91"/>
  <Label x={287} y={24}>会員情報</Label><Label x={550} y={24}>販売情報</Label>
  <path d="M633 51h19q-4 8 0 16q4 9 0 16h-19"/>
  <Label x={675} y={73}>…</Label><Label x={573} y={123}>販売した商品の数だけ繰り返す。</Label>
 </Drawing>;
}
function TabRun(props:BookletFigureProps) {
 const {input,dst,stops}=tabExample(props.values[0]), width=36, n=dst.length, names=dst;
 const x=84, ws=Array<number>(n).fill(width), w=x+n*width+17;
 return <Drawing {...props} kind="tab-run" width={w} height={177}>
  <Label x={35} y={22}>文字位置</Label><Label x={35} y={58}>Src</Label><Label x={35} y={116}>Dst</Label>
  {names.map((_,i)=><Label key={i} x={x+(i+.5)*width} y={22}>{i+1}</Label>)}
  <Cells values={Array.from({length:n},(_,i)=>input[i]??'')} widths={ws} x={x} y={35}/>
  <Cells values={names} widths={ws} x={x} y={94}/>
  {stops.map(n=><Label key={n} x={x+(n-.5)*width} y={90}>▼</Label>)}
  <Caption x={w/2} y={155}>{props.caption}</Caption>
 </Drawing>;
}
function TabStops(props:BookletFigureProps){
 const {stops}=tabExample(props.values[0]), lines=[...stops.map((n,i)=>['TabSet['+(i+1)+']',n]),['⋮','⋮'],['TabSet[m]','−1']];
 return <Drawing {...props} kind="tab-stops" width={586} height={31*lines.length+66}>
  {lines.map(([label,value],i)=><g key={i}><Label x={95} y={25+i*31}>{label}</Label><Box x={147} y={5+i*31} w={183} h={31}>{value}</Box></g>)}
  <Caption x={293} y={31*lines.length+41}>{props.caption}</Caption>
 </Drawing>;
}
function Fields({kind,fields,...props}:BookletFigureProps&{kind:FigureKind;fields:readonly string[]}){
 const widths=fields.map(value=>Math.max(90,17*value.length+19));
 const w=widths.reduce((sum,n)=>sum+n,32);
 return <Drawing {...props} kind={kind} width={w} height={84}>
  <Cells values={fields} widths={widths}/>
  <Caption x={w/2} y={69}>{props.caption}</Caption>
 </Drawing>;
}
const Needed=(props:BookletFigureProps)=><Fields {...props} kind="needed-file" fields={neededFields}/>;
const Ratio=(props:BookletFigureProps)=><Fields {...props} kind="ratio-file" fields={ratioFields(props.values[0])}/>;
const Totals=(props:BookletFigureProps)=><Fields {...props} kind="totals-file" fields={totalFields(props.values[0])}/>;
function FileNode({x,y,top,bottom}:{x:number;y:number;top:string;bottom:string}){
 return <g><path d={`M${x+12} ${y}h128q12 26 0 52h-128q-22 -26 0 -52m128 0q-12 26 0 52`}/>
  <Label x={x+69} y={y+21}>{top}</Label><Label x={x+69} y={y+39}>{bottom}</Label>
 </g>;
}
function Io(props:BookletFigureProps) {
 return <Drawing {...props} kind="io" width={532} height={334}>
  <FileNode x={55} y={14} top="必要量" bottom="ファイル"/>
  <FileNode x={299} y={117} top="標準混合割合" bottom="ファイル"/>
  <Box x={58} y={128} w={133}>必要量集計</Box>
  <Arrow d="M124 66V127"/><Arrow d="M294 143H191"/>
  <Arrow d="M124 160V219"/><Arrow d="M124 190H368V219"/>
  <FileNode x={55} y={219} top="集計" bottom="ファイル"/><FileNode x={299} y={219} top="エラー" bottom="ファイル"/>
  <Caption x={266} y={306}>{props.caption}</Caption>
 </Drawing>;
}
function Hierarchy(props:BookletFigureProps) {
 const ys=[91,164,237,310],lefts=[104,279,454], names=[
  ['初期処理','主処理','終了処理'],['前処理','集計処理','後処理'],
  ['初期化','必要量計算','集計'],['混合','単一','エラー'],
 ];
 return <Drawing {...props} kind="hierarchy" width={638} height={397}>
  <Box x={279} y={10} w={120}>必要量集計</Box>
  {ys.map((y,i)=><g key={y}>
   <Label x={42} y={y+21}>{'第'+(i+1)+'階層'}</Label>
   {names[i].map((name,j)=><Box key={j} x={lefts[j]} y={y} w={120}>{name}</Box>)}
   {i<3?<path d={`M339 ${i===0?42:ys[i-1]+32}V${y}M164 ${y}v-22H514v22`}/>:
    <path d={`M339 ${ys[i-1]+32}V${y-35}M339 ${y-9}V${y}M164 ${y}v-22H290M389 ${y-22}H514v22`}/>}
   {i<2&&<Arrow d={`M339 ${y-19}C312 ${y-20} 312 ${y-1} 341 ${y-3}q12 -2 12 -10`}/>}
   {i===3&&<path d={`M290 ${y-22}L339 ${y-35}L389 ${y-22}L339 ${y-9}Z`}/>}
  </g>)}
  <Caption x={318} y={376}>{props.caption}</Caption>
 </Drawing>;
}
function Decision({x,y,w,h,children}:{x:number;y:number;w:number;h:number;children:ReactNode}){
 return <g><path d={`M${x} ${y+h/2}L${x+w/2} ${y}L${x+w} ${y+h/2}L${x+w/2} ${y+h}Z`}/>
  <Box x={x+w/2-40} y={y+h/2-12} w={80} h={24}>{children}</Box>
 </g>;
}
function Dispatch(props:BookletFigureProps){
 return <Drawing {...props} kind="dispatch" width={760} height={493}>
  <Box x={17} y={12} w={223} rounded>主処理の開始</Box>
  <Box x={17} y={64} w={223}>前処理</Box>
  <path d="M129 44V64M129 96V118M17 143l26 -25h172l25 25v61H17zM129 204V229M129 261V282M17 282h223v65l-25 22H43l-26 -22zM129 369V385M129 417V438"/>
  <Label x={128} y={137}>繰返し</Label><Label x={128} y={160}>必要量ファイルの終わり</Label>
  <Label x={69} y={188}>又は</Label><Box x={93} y={169} w={76} h={25}>a</Box>
  <Box x={17} y={229} w={223}>集計処理</Box><Label x={128} y={351}>繰返し</Label>
  <Box x={17} y={385} w={223}>後処理</Box><Box x={17} y={438} w={223} rounded>主処理の終了</Box>
  <Box x={269} y={12} w={203} rounded>必要量計算の開始</Box>
  <path d="M371 44V94M371 155V192M371 254V303M371 335V379"/>
  <Decision x={269} y={94} w={203} h={61}>b</Decision><Decision x={269} y={192} w={203} h={62}>c</Decision>
  <Label x={485} y={117}>Yes</Label><Arrow d="M472 124H505"/><Box x={506} y={108} w={187}>混合</Box>
  <Label x={485} y={215}>Yes</Label><Arrow d="M472 223H505"/><Box x={506} y={207} w={187}>単一</Box>
  <Label x={386} y={171}>No</Label><Label x={386} y={272}>No</Label>
  <Box x={269} y={303} w={203}>エラー</Box>
  <Arrow d="M693 124H727V357H371"/><Arrow d="M693 223H727"/>
  <Box x={269} y={379} w={203} rounded>必要量計算の終了</Box>
  <Caption x={475} y={469}>{props.caption}</Caption>
 </Drawing>;
}
function MixFlow(props:BookletFigureProps) {
 const {vars,first,second,remainder,volume,percentage}=mixtureLabels(props.values[0]);
 const lines=['混合の開始','標準混合割合ファイルを読む',
  vars[first]+' ← '+volume+' × '+percentage(first)+' ÷ 100',
  vars[second]+' ← '+volume+' × '+percentage(second)+' ÷ 100',
  vars[remainder]+' ← ［d］','混合の終了'];
 return <Drawing {...props} kind="mix-flow" width={508} height={376}>
  {lines.map((text,i)=><g key={i}>
   {!!i&&<path d={`M253 ${42+(i-1)*54}v22`}/>}
   {i===4 ? <><rect x={36} y={10+i*54} width={436} height={32}/>
    <Label x={52} y={31+i*54} start>{vars[remainder]+' ←'}</Label><Box x={111} y={14+i*54} w={345} h={24}>d</Box></> :
    <Box x={36} y={10+i*54} w={436} rounded={i===0||i===5}>{text}</Box>}
  </g>)}
  <Caption x={254} y={351}>{props.caption}</Caption>
 </Drawing>;
}

export const legacy2006AutumnPm0105FigureRenderers:readonly BookletFigureRenderer[]=[
 {profile:profiles['sales-format'],component:SalesFormat},{profile:profiles['tab-run'],component:TabRun},
 {profile:profiles['tab-stops'],component:TabStops},{profile:profiles['needed-file'],component:Needed},
 {profile:profiles['ratio-file'],component:Ratio},{profile:profiles['totals-file'],component:Totals},
 {profile:profiles.io,component:Io},{profile:profiles.hierarchy,component:Hierarchy},
 {profile:profiles.dispatch,component:Dispatch},{profile:profiles['mix-flow'],component:MixFlow},
];
