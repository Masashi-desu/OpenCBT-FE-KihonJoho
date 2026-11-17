import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2006AutumnAm0126Figures, profiles, type FigureKind } from '../core/generators/legacy-2006-autumn-am-01-26-figures';
import { architectureCases, bitsByDisk, floatCases, gateCases, letters, machineCases, pipelineCases, visit, type Expression } from '../core/generators/legacy-2006-autumn-am-01-26-model';

type DrawingProps = BookletFigureProps & { kind: FigureKind; width: number; height: number; children: ReactNode };
function Drawing({kind,caption,values,width,height,children}:DrawingProps){
 const id=useId(),profile=profiles[kind],alt=legacy2006AutumnAm0126Figures.find(def=>def.profile===profile)!.alt(values);
 return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
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
function Arrow({d}:{d:string}){
 const id=useId(); return <><defs><marker id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
  <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/></marker></defs><path d={d} markerEnd={`url(#${id})`}/></>;
}
function Float(props:BookletFigureProps){
 const {width,exponent,bias}=floatCases[props.values[0]],x=13,b=25,end=x+width*b,split=x+(exponent+1)*b;
 return <Drawing {...props} kind="float" width={690} height={202}>
  <rect x={x} y={29} width={end-x} height={34}/><path d={`M${x+b} 29V63M${split} 29V63`}/>
  {Array.from({length:width-1},(_,i)=><path key={i} d={`M${x+(i+1)*b} 54V63`}/>)}
  <Label x={x+b/2} y={20}>0</Label><Label x={x+b*1.5} y={20}>1</Label>
  <Label x={split-b/2} y={20}>{exponent}</Label><Label x={split+b/2} y={20}>{exponent+1}</Label><Label x={end-b/2} y={20}>{width-1}</Label>
  <Label x={x+b/2} y={51}>S</Label><Label x={(x+b+split)/2} y={51}>E</Label><Label x={(end+split)/2} y={51}>M</Label>
  <path d={`M${x+b} 66Q${x+b} 77 ${x+b+12} 77H${split-12}Q${split} 77 ${split} 66M${split} 66Q${split} 77 ${split+12} 77H${end-12}Q${end} 77 ${end} 66`}/>
  <Arrow d={`M${(end+split)/2} 78V82H245V95H276`}/><Label x={288} y={100} start>仮数部（M）：絶対値表現</Label>
  <Arrow d={`M${(x+b+split)/2} 78V123H276`}/><Label x={288} y={128} start>{'指数部（E）：実際の指数に'+bias+'を加算したもの'}</Label>
  <Label x={466} y={149}>{'0≦E≦'+(2**exponent-1)}</Label>
  <Arrow d={`M${x+b/2} 65V174H276`}/><Label x={288} y={179} start>仮数部の符号（S）：0は非負，1は負</Label>
 </Drawing>;
}
function StateLegend(props:BookletFigureProps){
 return <Drawing {...props} kind="state-legend" width={400} height={62}>
  <path d="M8 26H29" strokeWidth={5}/><path d="M26 19L34 26L26 33Z" fill="currentColor"/><circle cx={53} cy={26} r={18}/>
  <Label x={121} y={31}>初期状態</Label>
  <circle cx={225} cy={26} r={18}/><circle cx={225} cy={26} r={14}/><Label x={292} y={31}>受理状態</Label>
 </Drawing>;
}
function States(props:BookletFigureProps){
 const {run,repeat}=machineCases[props.values[0]],reset=1-run;
 const nodes=repeat===3?[[85,130],[248,50],[375,130],[246,230],[427,230]]:[[85,130],[248,50],[246,230],[427,230]];
 const accepted=repeat;
 return <Drawing {...props} kind="states" width={502} height={270}>
  <path d="M18 130H59" strokeWidth={5}/><path d="M55 122L64 130L55 138Z" fill="currentColor"/>
  <Arrow d="M77 153C41 190 111 208 98 154"/><Label x={51} y={196}>{reset}</Label>
  <Arrow d="M99 112Q159 47 225 51"/><Label x={136} y={76}>{run}</Label>
  <Arrow d="M228 61Q171 91 107 123"/><Label x={204} y={96}>{reset}</Label>
  {repeat===3?<><Arrow d="M267 63L355 116"/><Label x={314} y={77}>{run}</Label>
    <Arrow d="M352 131H109"/><Label x={238} y={148}>{reset}</Label>
    <Arrow d="M355 144L267 219"/><Label x={327} y={198}>{run}</Label></>:
   <><Arrow d="M250 75V205"/><Label x={264} y={143}>{run}</Label></>}
  <Arrow d="M227 216L104 146"/><Label x={165} y={194}>{reset}</Label>
  <Arrow d="M271 230H402"/><Label x={331} y={247}>{run}</Label>
  <Arrow d="M420 207C399 154 468 157 442 209"/><Label x={471} y={179}>0,1</Label>
  {nodes.map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={23}/>
    {i===accepted&&<circle cx={x} cy={y} r={19}/>}</g>)}
 </Drawing>;
}
type TreePosition={x:number;y:number;value:string};
function Tree(props:BookletFigureProps){
 const node=letters[props.values[0]][0], objects:TreePosition[]=[], branches:string[]=[], tour:string[]=[];
 function place([value,left,right]:Expression,x:number,y:number,step:number){
  objects.push({x,y,value});
  tour.push('L'+(x-22)+' '+(y-4));
  if(left&&right){
   branches.push(`M${x-7} ${y+10}L${x-step+7} ${y+47}`,`M${x+7} ${y+10}L${x+step-7} ${y+47}`);
   place(left,x-step,y+58,step/1.7);tour.push('L'+x+' '+(y+24));
   place(right,x+step,y+58,step/1.7);
  } else tour.push(`Q${x-25} ${y+20} ${x+18} ${y+20}`);
  tour.push('L'+(x+22)+' '+(y-4));
 }
 place(node,171,28,69);
 return <Drawing {...props} kind="tree" width={768} height={259}>
  {branches.map((d,i)=><path key={i} d={d}/>)}
  <Arrow d={'M149 4 '+tour.join(' ')+' L193 4'}/>
  {objects.map(({x,y,value},i)=><g key={i}><circle cx={x} cy={y} r={14}/><Label x={x} y={y+5}>{value}</Label></g>)}
  {['前置記法','中置記法','後置記法'].map((label,i)=><g key={label}>
    <Label x={356} y={45+i*47} start>{label}</Label><Label x={460} y={45+i*47} start>{visit(node,i)}</Label>
  </g>)}
 </Drawing>;
}
function Symbol({kind,x,y}:{kind:'AND'|'OR'|'NOT';x:number;y:number}){
 return <g transform={`translate(${x} ${y})`} data-gate={kind}>
  {kind==='NOT'?<><path d="M0 0H10M10 -11V11L29 0ZM37 0H54"/><circle cx={33} cy={0} r={4}/></>:
   <path d={kind==='AND'?'M0 -8H10M0 8H10M10 -15H25Q45 -15 45 0Q45 15 25 15H10ZM45 0H55':
    'M0 -8H12M0 8H12M10 -15Q31 -17 45 0Q31 17 10 15Q16 0 10 -15ZM45 0H55'}/>}
 </g>;
}
function Gates(props:BookletFigureProps){
 const kinds=['AND','OR','NOT'] as const;
 return <Drawing {...props} kind="gates" width={473} height={56}>
  {kinds.map((kind,i)=><g key={kind}><Symbol kind={kind} x={12+155*i} y={26}/>
   <Label x={76+155*i} y={31} start>{kind+'回路'}</Label></g>)}
 </Drawing>;
}
function Circuit(props:BookletFigureProps){
 const {firstAnd,secondOr}=gateCases[props.values[0]];
 return <Drawing {...props} kind="circuit" width={438} height={100}>
  <path d="M43 38H82M43 54H82M43 76H186V62H219M137 46H219M274 54H316M370 54H405"/>
  <Symbol kind={firstAnd?'AND':'OR'} x={82} y={46}/><Symbol kind={secondOr?'OR':'AND'} x={219} y={54}/><Symbol kind="NOT" x={316} y={54}/>
  <Label x={29} y={42}>A</Label><Label x={29} y={58}>B</Label><Label x={29} y={80}>C</Label>
  <Label x={176} y={40}>P</Label><Label x={295} y={46}>Q</Label><Label x={390} y={46}>R</Label>
 </Drawing>;
}
function Pipeline(props:BookletFigureProps){
 const raw=props.values[0], starts=pipelineCases[Math.floor(raw/4)].options[raw%4];
 return <Drawing {...props} kind="pipe" width={632} height={120}>
  {starts.map((start,row)=><g key={row}>
   <Label x={12} y={26+36*row} start>{'命令'+(row+1)}</Label>
   {[...'FDARE'].map((stage,i)=><g key={stage}><rect x={75+36*(start+i)} y={6+36*row} width={36} height={36}/>
    <Label x={93+36*(start+i)} y={30+36*row}>{stage}</Label></g>)}
  </g>)}
 </Drawing>;
}
function Architecture(props:BookletFigureProps){
 const {cache,memory}=architectureCases[props.values[0]];
 return <Drawing {...props} kind="architecture" width={401} height={177}>
  <rect x={27} y={14} width={174} height={126}/><rect x={48} y={45} width={153} height={73}/><rect x={240} y={14} width={145} height={126}/>
  <path d="M201 78H240"/><Label x={45} y={36} start>CPU</Label><Label x={124} y={66}>キャッシュ</Label>
  <Label x={124} y={84}>メモリ</Label><Label x={124} y={106}>{cache+'kバイト'}</Label>
  <Label x={313} y={59}>主記憶</Label><Label x={313} y={105}>{memory+'Mバイト'}</Label><Label x={200} y={165}>図　構成</Label>
 </Drawing>;
}
function Disk(props:BookletFigureProps){
 const columns=bitsByDisk(props.values[0]),y=78,rows=columns[0].length;
 return <Drawing {...props} kind="disk" width={590} height={287}>
  <rect x={22} y={13} width={139*(columns.length-1)+115} height={31}/><Label x={79+69.5*(columns.length-1)} y={34}>制御装置</Label>
  {columns.map((values,column)=>{
   const x=22+139*column;
   return <g key={column}><path d={`M${x+57} 44V${y}`}/>
    {values.map((value,i)=><g key={i}><rect x={x} y={y+32*i} width={115} height={32}/>
     {column<columns.length-1&&<path d={`M${x+115} ${y+32*i}h24`} strokeDasharray="3 4"/>}
     <Label x={x+57} y={y+21+32*i}>{'b'+String(value).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[Number(d)])}</Label>
    </g>)}
    <Label x={x+57} y={y+32*rows+17}>データ</Label><Label x={x+57} y={y+32*rows+36}>{'ディスク '+(column+1)}</Label>
   </g>;
  })}
 </Drawing>;
}
export const legacy2006AutumnAm0126FigureRenderers:readonly BookletFigureRenderer[]=[
 {profile:profiles.float,component:Float},{profile:profiles['state-legend'],component:StateLegend},{profile:profiles.states,component:States},
 {profile:profiles.tree,component:Tree},{profile:profiles.gates,component:Gates},{profile:profiles.circuit,component:Circuit},
 {profile:profiles.pipe,component:Pipeline},{profile:profiles.architecture,component:Architecture},{profile:profiles.disk,component:Disk},
];
