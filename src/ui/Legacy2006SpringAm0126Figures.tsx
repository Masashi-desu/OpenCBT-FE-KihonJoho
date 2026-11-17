import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2006SpringAm0126Figures, profiles, type FigureKind } from '../core/generators/legacy-2006-spring-am-01-26-figures';
import { floatBits, multiplyWidths, searchCases, triangleCases, vennCases } from '../core/generators/legacy-2006-spring-am-01-26-model';

type DrawingProps=BookletFigureProps&{kind:FigureKind;width:number;height:number; children:ReactNode};
function Drawing({kind,caption,values,width,height,children}:DrawingProps){
 const id=useId(),profile=profiles[kind],alt=legacy2006SpringAm0126Figures.find(f=>f.profile===profile)!.alt(values);
 return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0}
  aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
  <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
   viewBox={`0 0 ${width} ${height}`}
   style={{display:'block',width:`calc(${width}px * var(--image-scale, 1))`,height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
   <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
   <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4}>{children}</g>
  </svg>
 </div></figure>;
}
function Label({x,y,children,size=15,start=false}:{x:number;y:number;children:ReactNode;size?:number;start?:boolean}){
 return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={start?'start':'middle'} fontSize={size}>{children}</text>;
}
function Arrow({d}:{d:string}){
 const id=useId();
 return <><defs><marker id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
  <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/></marker></defs><path d={d} markerEnd={`url(#${id})`}/></>;
}
function Box({x,y,w,h=32,rounded=false,children}:{x:number;y:number;w:number;h?:number;rounded?:boolean;children:ReactNode}){
 return <g><rect x={x} y={y} width={w} height={h} rx={rounded?h/2:0}/><Label x={x+w/2} y={y+h/2+5}>{children}</Label></g>;
}
function Diamond({x,y,w,h,children}:{x:number;y:number;w:number;h:number;children:ReactNode}){
 return <g><path d={`M${x} ${y+h/2}L${x+w/2} ${y}L${x+w} ${y+h/2}L${x+w/2} ${y+h}Z`}/>
   <Label x={x+w/2} y={y+h/2+5}>{children}</Label></g>;
}
function FloatLayout(props:BookletFigureProps) {
 return <Drawing {...props} kind="float" width={730} height={158}>
  <Box x={18} y={64} w={37}>S</Box><Box x={55} y={64} w={90}>e</Box><Box x={145} y={64} w={200}>f</Box>
  <Label x={36} y={25}>1ビット</Label><Label x={100} y={19}>4ビット</Label><Label x={245} y={25}>11ビット</Label>
  <Arrow d="M36 30V57"/><Arrow d="M100 24V57"/><Arrow d="M245 30V57"/>
  <path d="M18 60q0-6 7-6h23q7 0 7 6M55 60q0-6 7-6h76q7 0 7 6M145 60q0-6 7-6h186q7 0 7 6"/>
  <path d="M145 101l-7 10h14Z" fill="currentColor"/>
  <Label x={145} y={132}>小数点の位置</Label>
  <Label x={365} y={57} start>S：仮数部の符号（0：正，1：負）</Label>
  <Label x={365} y={79} start>e：指数部（2を基数とし，負数は2の補数で表現）</Label>
  <Label x={365} y={101} start>f：仮数部（2進数・絶対値表現）</Label>
 </Drawing>;
}
function FloatChoice(props:BookletFigureProps){
 const index=props.values[0],[sign,e,f]=floatBits(Math.floor(index/4),index%4);
 return <Drawing {...props} kind="float-choices" width={336} height={52}>
  <Box x={8} y={7} w={39}>{sign}</Box><Box x={47} y={7} w={80}>{[...e].join(' ')}</Box><Box x={127} y={7} w={190}>{[...f].join(' ')}</Box>
 </Drawing>;
}

const circles=[[175,78],[143,131],[207,131]] as const;
const circleR=44;
const boundary='M25 16H325V204H25Z';
function Venn(props:BookletFigureProps){
 const id=useId(),shaded=vennCases[props.values[0]];
 return <Drawing {...props} kind="venn" width={350} height={224}>
  <defs>
   {circles.map(([x,y],i)=><clipPath key={'in'+i} id={id+'inside'+i}><circle cx={x} cy={y} r={circleR}/></clipPath>)}
   {circles.map(([x,y],i)=><clipPath key={'out'+i} id={id+'outside'+i}>
    <path clipRule="evenodd" d={boundary+`M${x-circleR} ${y}a${circleR} ${circleR} 0 1 0 ${2*circleR} 0a${circleR} ${circleR} 0 1 0 ${-2*circleR} 0Z`}/>
   </clipPath>)}
   <pattern id={id+'stripe'} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 5L5 0M4 6L6 4" stroke="currentColor" strokeWidth="1"/></pattern>
  </defs>
  {shaded.map(mask=>{
   const cell=<path d={boundary} stroke="none" fill={`url(#${id}stripe)`}/>;
   return <g key={mask}>{[0,1,2].reduce((child,i)=><g clipPath={`url(#${id}${mask&(4>>i)?'inside':'outside'}${i})`}>{child}</g>,cell)}</g>;
  })}
  <path d={boundary}/>{circles.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={circleR}/>)}
  <Label x={175} y={68}>A</Label><Label x={125} y={141}>B</Label><Label x={225} y={141}>C</Label>
 </Drawing>;
}

type Point=readonly [number,number];
const side=214, altitude=side*Math.sqrt(3)/2;
const vertices=[[168,209-altitude],[61,209],[275,209]] as const;
const trianglePath=vertices.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join('')+'Z';
const point=(from:Point,to:Point,p:Point):Point=>{
 const [dx,dy]=[to[0]-from[0],to[1]-from[1]];
 const along=((p[0]-from[0])*dx+(p[1]-from[1])*dy)/(dx*dx+dy*dy);
 return [from[0]+dx*along,from[1]+dy*along];
};
function TriangleProperty(props:BookletFigureProps){
 const middle:Point=[170,169];
 const pairings=[{a:1,b:2,name:'x',off:[-9,5]},{a:0,b:2,name:'y',off:[0,-6]},{a:0,b:1,name:'z',off:[-4,-5]}] as const;
 return <Drawing {...props} kind="triangle-property" width={351} height={268}>
  <path d={trianglePath}/>
  {pairings.map(({a,b,name,off})=>{
   const [x,y]=point(vertices[a],vertices[b],middle);
   return <g key={name}><path d={`M${middle[0]} ${middle[1]}L${x} ${y}`}/><Label x={(middle[0]+x)/2+off[0]} y={(middle[1]+y)/2+off[1]}>{name}</Label></g>;
  })}
  <Label x={168} y={237}>x＋y＋z＝一定</Label><Label x={168} y={259}>{props.caption}</Label>
 </Drawing>;
}
function TriangleUse(props:BookletFigureProps){
 const cases=triangleCases[props.values[0]];
 return <Drawing {...props} kind="triangle-use" width={387} height={268}>
  <path d={trianglePath}/>
  <Label x={15} y={100} start size={13}>ワープロソフト</Label><Label x={231} y={100} start size={13}>表計算ソフト</Label>
  <Label x={168} y={234}>データベースソフト</Label>
  {cases.map(([base,left,right],i)=>{
   const amounts=[base,right,left];
   const x=vertices.reduce((n,[x],j)=>n+x*amounts[j],0)/100;
   const y=vertices.reduce((n,[,y],j)=>n+y*amounts[j],0)/100;
   return <g key={i}><circle cx={x} cy={y} r={3.5} fill="currentColor"/>
    <Label x={x+(x<80?-12:12)} y={y+5}>{'ABCD'[i]}</Label></g>;
  })}
  <Label x={168} y={259}>{props.caption}</Label>
 </Drawing>;
}
function Search(props:BookletFigureProps){
 const {from,to}=searchCases[props.values[0]];
 return <Drawing {...props} kind="search" width={666} height={427}>
  <Box x={295} y={11} w={148} rounded>開始</Box><path d="M369 43V66"/>
  <rect x={295} y={66} width={148} height={53}/><Label x={369} y={86}>{from+' → x'}</Label><Label x={369} y={108}>{to+' → y'}</Label>
  <path d="M369 119V151M369 194V226M369 258V281M369 329V362M442 172H538V226M538 258V364M442 305H538"/>
  <Diamond x={295} y={151} w={148} h={43}>x：y</Diamond>
  <Label x={464} y={166}>＞</Label><Label x={386} y={211}>≦</Label>
  <Box x={295} y={226} w={148}>［a］</Box><rect x={325} y={230} width={88} height={23}/>
  <Box x={465} y={226} w={146}>0 → m</Box>
  <Diamond x={295} y={281} w={148} h={48}>k：A(m)</Diamond>
  <path d="M295 305H220V362"/><Label x={279} y={298}>＜</Label><Label x={460} y={298}>＝</Label><Label x={386} y={349}>＞</Label>
  <Box x={147} y={362} w={146}>m − 1 → y</Box><Box x={295} y={362} w={148}>m ＋ 1 → x</Box>
  <Box x={465} y={364} w={146} rounded>終了</Box>
  <path d="M220 394V410H369V394"/><Arrow d="M220 410H55V136H369"/>
 </Drawing>;
}
function Multiplication(props:BookletFigureProps){
 const length=multiplyWidths[props.values[0]];
 return <Drawing {...props} kind="multiply" width={568} height={535}>
  <Box x={149} y={9} w={177} rounded>開始</Box><path d="M237 41V59"/>
  <rect x={131} y={59} width={212} height={90}/>
  {['被乗数 → X','乗数 → Y','0 → Z','1 → i'].map((label,i)=><Label key={i} x={237} y={79+19*i}>{label}</Label>)}
  <path d="M237 149V179M237 225V250M343 202H393V303H237M237 282V313M237 345V365M237 397V424"/>
  <Diamond x={131} y={179} w={212} h={46}>［a］：1</Diamond>
  <Label x={363} y={197}>≠</Label><Label x={254} y={241}>＝</Label>
  <Box x={131} y={250} w={212}>Z ＋ X → Z</Box>
  <Box x={131} y={313} w={212}>［b］</Box><rect x={203} y={317} width={68} height={23}/>
  <Box x={131} y={365} w={212}>i ＋ 1 → i</Box>
  <Diamond x={131} y={424} w={212} h={42}>{'i：'+length}</Diamond>
  <Label x={360} y={440}>＞</Label><Label x={253} y={481}>≦</Label>
  <Arrow d="M237 466V486H83V161H237"/><path d="M343 445H424V467"/>
  <path d="M363 467H510L492 493H345Z"/><Label x={427} y={485}>Z を出力する</Label><path d="M424 493V501"/>
  <Box x={346} y={501} w={156} h={25} rounded>終了</Box>
 </Drawing>;
}

function Gate({x,y}:{x:number;y:number}){
 return <g transform={`translate(${x} ${y})`}>
  <path d="M0 -10H15M0 10H15M15 -22H42Q63 -22 63 0Q63 22 42 22H15ZM71 0H81"/>
  <circle cx={67} cy={0} r={4}/>
 </g>;
}
function NandLegend(props:BookletFigureProps){
 return <Drawing {...props} kind="nand-legend" width={116} height={68}><Gate x={13} y={34}/></Drawing>;
}
function Nand(props:BookletFigureProps){
 const i=props.values[0],parallel=i<2;
 return <Drawing {...props} kind="nand" width={557} height={229}>
  {parallel?<>
   <Gate x={129} y={63}/><Gate x={129} y={157}/><Gate x={369} y={110}/>
   <path d="M210 63H280V100H369M210 157H280V120H369M450 110H506"/>
   {i===0?<>
    <path d="M42 53H129M83 53V73H129M42 147H129M83 147V167H129"/>
    <circle cx={83} cy={53} r={3} fill="currentColor"/><circle cx={83} cy={147} r={3} fill="currentColor"/>
    <Label x={30} y={58}>X</Label><Label x={30} y={152}>Y</Label>
   </>:<>
    <path d="M42 31H86V147H129M86 53H129M42 188H112V73H129M112 167H129"/>
    <circle cx={86} cy={53} r={3} fill="currentColor"/><circle cx={112} cy={167} r={3} fill="currentColor"/>
    <Label x={30} y={36}>X</Label><Label x={30} y={193}>Y</Label>
   </>}
  </>:<>
   <Gate x={76} y={96}/><Gate x={230} y={96}/><Gate x={389} y={96}/>
   <path d="M157 96H183V86H230M183 96V106H230M311 96H345V86H389M470 96H506"/>
   <circle cx={183} cy={96} r={3} fill="currentColor"/>
   <Label x={30} y={91}>X</Label><path d="M42 86H76"/>
   {i===2?<>
    <path d="M58 86V106H76M42 146H359V106H389"/>
    <circle cx={58} cy={86} r={3} fill="currentColor"/><Label x={30} y={151}>Y</Label>
   </>:<>
    <path d="M42 106H76M345 96V106H389"/>
    <circle cx={345} cy={96} r={3} fill="currentColor"/><Label x={30} y={111}>Y</Label>
   </>}
  </>}
  <circle cx={507} cy={parallel?110:96} r={3} fill="currentColor"/>
  <Label x={523} y={parallel?115:101}>Z</Label>
 </Drawing>;
}
export const legacy2006SpringAm0126FigureRenderers:readonly BookletFigureRenderer[]=[
 {profile:profiles.float,component:FloatLayout},{profile:profiles['float-choices'],component:FloatChoice},
 {profile:profiles.venn,component:Venn},{profile:profiles['triangle-property'],component:TriangleProperty},
 {profile:profiles['triangle-use'],component:TriangleUse},{profile:profiles.search,component:Search},
 {profile:profiles.multiply,component:Multiplication},{profile:profiles['nand-legend'],component:NandLegend},{profile:profiles.nand,component:Nand},
];
