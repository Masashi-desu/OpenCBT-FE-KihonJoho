import { useId, type ReactNode } from 'react';
import type { BookletFigureProps,BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  accessCases,drawingAlt,drawingIds,entityNames,erEdges,normalOptions,normalizationRelations,notation,
  profile,projectCases,queryRelations,taskLinks,type DrawingId,
} from '../core/generators/legacy-2010-spring-am-27-53-figures';

type Props=BookletFigureProps & { id:DrawingId };
const ink='var(--diagram-ink)',surface='var(--surface)';
function Frame({id,values,caption,children}:Props & {children:ReactNode}){
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    <figcaption className={id.startsWith('30-option-')?'sr-only':undefined}>{caption}</figcaption>
  </figure>;
}
function Graphic(props:Props & {width:number;height:number;children:(marker:string)=>ReactNode}){
  const {width,height,id,values,caption,children}=props, base=useId(), title=base+'-title',desc=base+'-desc',arrow=base+'-arrow';
  return <Frame {...props}><svg viewBox={'0 0 '+width+' '+height} role="img" aria-labelledby={title} aria-describedby={desc}
    style={{color:ink,width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',display:'block',marginInline:'auto'}}>
    <title id={title}>{caption}</title><desc id={desc}>{drawingAlt(id,values[0])}</desc>
    <defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </marker></defs>
    <g fontSize="15">{children('url(#'+arrow+')')}</g>
  </svg></Frame>;
}
function Text({x,y,children,anchor='middle'}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end'}){
  return <text x={x} y={y} fill="currentColor" textAnchor={anchor} stroke="none">{children}</text>;
}
function Box({x,y,width,height=38,label}:{x:number;y:number;width:number;height?:number;label:string}){
  return <g><rect x={x-width/2} y={y-height/2} width={width} height={height} fill={surface} stroke="currentColor" strokeWidth="1.4"/>
    <Text x={x} y={y+5}>{label}</Text></g>;
}
function RelationRows(props:Props){
  const option=normalOptions.findIndex(id=>id===props.id);
  const rows=normalizationRelations(props.values[0],option<0?undefined:option);
  return <Frame {...props}><ul role="list" style={{
    width:'max-content',margin:'0 auto',padding:0,listStyle:'none',color:ink,fontSize:'calc(1em * var(--image-scale, 1))',
  }}>
    {rows.map(row=><li key={row.name} style={{whiteSpace:'nowrap',padding:'.25em .5em'}}>
      {row.name+'（'}{row.columns.map((column,i)=><span key={column}>
        {i>0?'，':''}{row.keys.includes(column)?<u>{column}</u>:column}
      </span>)}{'）'}
    </li>)}
  </ul></Frame>;
}
function QuerySchema(props:Props){
  return <Graphic {...props} width={670} height={88}>{()=>queryRelations(props.values[0]).map((row,i)=>{
    const x=16+i*332, cell=103;
    return <g key={row.name}>
      <Text x={x} y={25} anchor="start">{row.name}</Text>
      {row.columns.map((column,j)=><g key={column}>
        <rect x={x+j*cell} y={35} width={cell} height={36} fill={surface} stroke="currentColor"/>
        <text x={x+(j+.5)*cell} y={58} fill="currentColor" textAnchor="middle" textDecoration={row.keys.includes(column)?'underline':undefined}>{column}</text>
      </g>)}
    </g>;
  })}</Graphic>;
}
function Access(props:Props){
  const {top,bottom,device,line}=accessCases[props.values[0]];
  return <Graphic {...props} width={680} height={208}>{()=> <>
    <rect x="14" y="37" width="485" height="154" fill="none" stroke="currentColor" strokeWidth="1.4"/>
    <Text x={28} y={27} anchor="start">利用者宅内</Text>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M128 151H165M323 151H355V121H387M323 73H355V107H387M486 114H659"/>
    </g>
    <Box x={75} y={151} width={106} label={bottom}/>
    <Box x={244} y={151} width={158} label={device}/>
    <Box x={244} y={73} width={158} label={top}/>
    <Box x={436} y={114} width={100} label="装置A"/>
    <Text x={572} y={103}>{line}</Text>
  </>}</Graphic>;
}
function Dfd(props:Props){
  return <Graphic {...props} width={660} height={244}>{arrow=><>
    <g fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}>
      <path d="M111 73H178"/><path d="M225 93L260 127"/><path d="M277 148L320 183"/>
      <path d="M360 184L408 146"/><path d="M459 131H539"/>
    </g>
    <g fill={surface} stroke="currentColor" strokeWidth="1.5">
      <rect x="21" y="48" width="90" height="50"/><circle cx="205" cy="73" r="27"/>
      <path d="M235 127H300M235 148H300"/><circle cx="339" cy="202" r="27"/>
      <circle cx="432" cy="131" r="27"/><rect x="539" y="106" width="90" height="50"/>
    </g>
  </>}</Graphic>;
}
function Notation(props:Props){
  return <Graphic {...props} width={660} height={155}>{()=>notation.map(([left,right,description],i)=>{
    const y=40+i*71;
    return <g key={left}>
      <line x1="102" y1={y} x2="207" y2={y} stroke="currentColor"/>
      <Box x={62} y={y} width={80} label="A"/><Box x={247} y={y} width={80} label="B"/>
      <Text x={112} y={y-9} anchor="start">{left}</Text><Text x={199} y={y-9} anchor="end">{right}</Text>
      <Text x={307} y={y+5} anchor="start">{description}</Text>
    </g>;
  })}</Graphic>;
}
const entityPositions=[[90,110],[275,110],[90,245],[275,245],[465,245],[650,245]] as const;
const edgePositions=[
  {path:'M145 110H220',left:[152,99],right:[212,99],rightEnd:true},
  {path:'M90 129V226',left:[102,151],right:[102,218]},
  {path:'M145 245H220',left:[153,234],right:[212,234],rightEnd:true},
  {path:'M275 129V226',left:[287,151],right:[287,218]},
  {path:'M330 110H465V226',left:[341,99],right:[477,218]},
  {path:'M330 245H410',left:[339,234],right:[402,234],rightEnd:true},
  {path:'M520 245H595',left:[528,234],right:[587,234],rightEnd:true},
  {path:'M90 91V46H650V226',left:[76,82],right:[662,218]},
] as const;
function ErDiagram(props:Props){
  return <Graphic {...props} width={745} height={291}>{()=> <>
    {erEdges(props.values[0]).map(([, , lmark,rmark],i)=>{
      const edge=edgePositions[i];
      return <g key={edge.path}>
        <path d={edge.path} fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <Text x={edge.left[0]} y={edge.left[1]} anchor="start">{lmark}</Text>
        <Text x={edge.right[0]} y={edge.right[1]} anchor={'rightEnd' in edge?'end':'start'}>{rmark}</Text>
      </g>;
    })}
    {entityPositions.map(([x,y],i)=><Box key={i} x={x} y={y} width={110} label={entityNames[i]}/>)}
  </>}</Graphic>;
}
const projectNodes=[[42,110],[157,110],[264,50],[264,180],[376,110],[405,213],[520,110],[642,110]] as const;
function Project(props:Props){
  const {times}=projectCases[props.values[0]],radius=17;
  return <Graphic {...props} width={713} height={307}>{arrow=><>
    {taskLinks.map(([from,to],i)=>{
      const [x1,y1]=projectNodes[from-1],[x2,y2]=projectNodes[to-1], d=Math.hypot(x2-x1,y2-y1);
      const dx=radius*(x2-x1)/d,dy=radius*(y2-y1)/d,x=(x1+x2)/2,y=(y1+y2)/2;
      return <g key={i} data-work={'ABCDEFGHI'[i]}>
        <path d={'M'+(x1+dx)+' '+(y1+dy)+'L'+(x2-dx)+' '+(y2-dy)} fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}/>
        <Text x={x} y={y-13}>{'ABCDEFGHI'[i]}</Text><Text x={x} y={y+19}>{times[i]}</Text>
      </g>;
    })}
    <g fill={surface} stroke="currentColor" strokeWidth="1.5">
      {projectNodes.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={radius}/>)}
      <circle cx="523" cy="261" r={radius}/><circle cx="657" cy="261" r={radius}/>
      <path d="M540 261H640" markerEnd={arrow}/>
    </g>
    <Text x={535} y={231}>凡例</Text><Text x={590} y={251}>作業名</Text><Text x={590} y={284}>所要日数</Text>
  </>}</Graphic>;
}
const components:Record<DrawingId,(props:Props)=>ReactNode>={
  '30-ledger':RelationRows,'30-option-a':RelationRows,'30-option-i':RelationRows,'30-option-u':RelationRows,'30-option-e':RelationRows,
  '31-relations':QuerySchema,'35-access':Access,'45-dfd':Dfd,'46-notation':Notation,'46-erd':ErDiagram,'51-project':Project,
};
export const legacy2010SpringAm2753FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=>{const Component=components[id];return <Component {...props} id={id}/>;},
}));
