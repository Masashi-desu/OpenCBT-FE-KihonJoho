import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2005SpringAm0126Figures, profiles, type FigureKind } from '../core/generators/legacy-2005-spring-am-01-26-figures';
import { circuits, componentLabels, computerCases, conversionCases, parityMachineCases, stackCases, treeLabels,
  weatherCases, weatherNames, type Circuit } from '../core/generators/legacy-2005-spring-am-01-26-model';

type DrawingProps=BookletFigureProps & {kind:FigureKind; width:number; height:number; children:ReactNode};
function Drawing({kind,caption,values,width,height,children}:DrawingProps) {
  const profile=profiles[kind], id=useId();
  const alt=legacy2005SpringAm0126Figures.find(figure=>figure.profile===profile)!.alt(values);
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0}
    aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
    <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
      viewBox={'0 0 '+width+' '+height}
      style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
      <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</g>
    </svg>
  </div></figure>;
}
function Label({x,y,size=16,anchor='middle',children}:{x:number;y:number;size?:number;anchor?:'start'|'middle';children:ReactNode}) {
  return <text x={x} y={y} fontSize={size} textAnchor={anchor} stroke="none" fill="currentColor">{children}</text>;
}
function Arrow({d,dashed=false,bold=false}:{d:string;dashed?:boolean;bold?:boolean}) {
  const id=useId();
  return <><defs><marker id={id} viewBox="0 0 12 10" refX={10} refY={5} markerWidth={bold?7:8} markerHeight={bold?6:7} orient="auto">
    <path d="M1 1L10 5 1 9" fill={bold?'currentColor':'none'} stroke="currentColor"/>
  </marker></defs><path d={d} markerEnd={'url(#'+id+')'} strokeDasharray={dashed?'6 4':undefined}
    strokeWidth={bold?4:undefined}/></>;
}
function Box({x,y,w,h=29,label,radius=0}:{x:number;y:number;w:number;h?:number;label:string;radius?:number}) {
  return <g><rect x={x} y={y} width={w} height={h} rx={radius} fill="var(--diagram-surface)"/>
    <Label x={x+w/2} y={y+h/2+5}>{label}</Label></g>;
}

function Conversion(props:BookletFigureProps) {
  const {size}=conversionCases[props.values[0]];
  return <Drawing {...props} kind="conversion" width={635} height={336}>
    <path d="M191 31V295"/>
    <Box x={127} y={10} w={128} label="開始" radius={16}/>
    <path d="M140 53H255L242 83H127Z" fill="var(--diagram-surface)"/>
    <Label x={191} y={73}>j を入力</Label>
    <path d="M127 103l12-12h104l12 12v36H127z" fill="var(--diagram-surface)"/>
    <Label x={191} y={110}>変換</Label><Label x={191} y={131} size={14}>k：1，1，{size}（注）</Label>
    <Box x={127} y={152} w={128} h={33} label=""/>
    <Box x={152} y={158} w={79} h={21} label="a"/>
    <Box x={127} y={199} w={128} h={33} label=""/>
    <Box x={152} y={205} w={79} h={21} label="b"/>
    <path d="M127 245h128v32l-12 12H139l-12-12z" fill="var(--diagram-surface)"/>
    <Label x={191} y={278}>変換</Label><Box x={127} y={295} w={128} label="終了" radius={16}/>
    <Label x={288} y={257} anchor="start" size={14}>（注）ループ端の繰返し指定は，</Label>
    <Label x={330} y={277} anchor="start" size={14}>変数名：初期値，増分，終値を示す。</Label>
  </Drawing>;
}

function Weather(props:BookletFigureProps) {
  const {rates}=weatherCases[props.values[0]];
  const positions=[[280,95],[120,285],[440,285]];
  const arcs=[
    [0,0,'M268 74C185 17 375 17 292 74',280,28],
    [1,1,'M100 268C36 225 33 345 103 305',63,290],
    [2,2,'M460 268C524 225 527 345 457 305',499,290],
    [0,1,'M262 110Q179 153 132 263',175,171],
    [1,0,'M142 274Q236 224 269 117',219,243],
    [0,2,'M291 117Q331 220 418 272',334,230],
    [2,0,'M430 263Q388 160 300 109',410,174],
    [1,2,'M142 295Q279 350 418 295',280,341],
    [2,1,'M418 274Q280 224 142 274',280,239],
  ] as const;
  return <Drawing {...props} kind="weather" width={560} height={344}>
    {arcs.map(([from,to,d,x,y])=><g key={from+':'+to} data-weather-from={weatherNames[from]} data-weather-to={weatherNames[to]}>
      <Arrow d={d}/><Label x={x} y={y}>{rates[from][to]/10}</Label>
    </g>)}
    {positions.map(([x,y],i)=><g key={x}><circle cx={x} cy={y} r={24} fill="var(--diagram-surface)"/>
      <Label x={x} y={y+5}>{weatherNames[i]}</Label></g>)}
  </Drawing>;
}

function Automaton(props:BookletFigureProps) {
  const {digit,even}=parityMachineCases[props.values[0]];
  return <Drawing {...props} kind="automaton" width={440} height={183}>
    <Arrow d="M35 73H93" bold/>
    <Arrow d="M132 61Q220 19 308 61"/><Label x={220} y={32}>{digit}</Label>
    <Arrow d="M308 84Q220 128 132 84"/><Box x={191} y={119} w={58} h={23} label="a"/>
    <Arrow d="M109 92C68 176 37 87 93 81"/><Label x={52} y={140}>{1-digit}</Label>
    <Arrow d="M347 81C403 87 372 176 331 92"/><Box x={370} y={119} w={58} h={23} label="b"/>
    {[113,327].map((x,i)=><g key={x}><circle cx={x} cy={73} r={22} fill="var(--diagram-surface)"/>
      {even===(i===0)&&<circle cx={x} cy={73} r={18}/>}<Label x={x} y={78}>{i===0?'偶':'奇'}</Label>
    </g>)}
  </Drawing>;
}
function Tree(props:BookletFigureProps) {
  const value=props.values[0], nodes=treeLabels(Math.floor(value/4),value%4);
  const locations=[[126,26],[66,64],[185,64],[34,115],[98,115],[151,115],[217,115],[128,165],[173,165]];
  const parents=[-1,0,0,1,1,2,2,5,5];
  return <Drawing {...props} kind="tree" width={251} height={188}>
    {locations.map(([x,y],i)=>i>0&&<line key={i} x1={locations[parents[i]][0]} y1={locations[parents[i]][1]} x2={x} y2={y}/>)}
    {locations.map(([x,y],i)=><g key={i} data-tree-node={i} data-tree-parent={parents[i]}>
      <circle cx={x} cy={y} r={15} fill="var(--diagram-surface)"/><Label x={x} y={y+5}>{nodes[i]}</Label>
    </g>)}
  </Drawing>;
}

function Instructions(props:BookletFigureProps) {
  const ops=[...stackCases[props.values[0]].ops];
  return <Drawing {...props} kind="instructions" width={541} height={96}>
    {ops.map((op,i)=>{
      const x=54+i%5*108,y=i<5?28:76;
      return <g key={i}><Label x={x} y={y}>{op==='+'?'PUSH':'POP'}</Label>
        {i%5!==4&&<Arrow d={'M'+(x+30)+' '+(y-5)+'h48'}/>}</g>;
    })}
    <Arrow d="M517 23h17v23H8v25h19"/>
  </Drawing>;
}
function Stack(props:BookletFigureProps) {
  const top=stackCases[props.values[0]].top;
  return <Drawing {...props} kind="stack" width={300} height={216}>
    <path d="M112 37v171m74-171v171"/>
    <Label x={53} y={22}>PUSH</Label><Arrow d="M78 17h50v27"/>
    <Arrow d="M170 44V17h55"/><Label x={251} y={22}>POP</Label>
    {top.map((n,i)=>{
      const y=54+i*29;
      return <g key={i}><line x1={112} y1={y} x2={186} y2={y}/><Label x={149} y={y+20}>{n}</Label></g>;
    })}
    <path d="M112 199h74"/>
  </Drawing>;
}

type GateType='AND'|'OR'|'NOT';
function Gate({kind,x,y}:{kind:GateType;x:number;y:number}) {
  return <g data-gate={kind} transform={'translate('+x+' '+y+')'} fill="var(--diagram-surface)">
    {kind==='AND'&&<path d="M0 -15h18a15 15 0 0 1 0 30H0Z"/>}
    {kind==='OR'&&<path d="M0 -15Q28 -19 42 0Q28 19 0 15Q9 0 0 -15Z"/>}
    {kind==='NOT'&&<><path d="M0 -13L31 0 0 13z"/><circle cx={35} cy={0} r={4}/></>}
  </g>;
}
const gateWidths={AND:33,OR:42,NOT:39} as const;
function Gates(props:BookletFigureProps) {
  return <Drawing {...props} kind="gates" width={381} height={74}>
    {(['AND','OR','NOT'] as const).map((kind,i)=>{
      const x=37+i*126;
      return <g key={kind}><Gate kind={kind} x={x} y={26}/>
        {kind==='NOT'?<path d={'M'+(x-16)+' 26h16'}/>:<path d={'M'+(x-16)+' 19h'+(kind==='OR'?20:16)+'m-'+(kind==='OR'?20:16)+' 14h'+(kind==='OR'?20:16)}/>}
        <path d={'M'+(x+gateWidths[kind])+' 26h17'}/><Label x={x+19} y={64}>{kind}</Label></g>;
    })}
  </Drawing>;
}

type Wire={x:number;y:number};
type GatePlacement={kind:GateType;x:number;y:number;children:Wire[]};
function CircuitFigure(props:BookletFigureProps) {
  const value=props.values[0], circuit=circuits[Math.floor(value/5)][value%5];
  const inputs: {name:'A'|'B';y:number}[]=[], gates:GatePlacement[]=[];
  let nextY=24;
  function layout(node:Circuit, x:number):Wire {
    if(typeof node==='string') {
      const y=nextY;
      inputs.push({name:node,y});nextY+=29;
      return {x:39,y};
    }
    const children=node[0]==='NOT'?[layout(node[1],x-77)]:[layout(node[1],x-77),layout(node[2],x-77)];
    const y=children.reduce((result,child)=>result+child.y,0)/children.length;
    gates.push({kind:node[0],x,y,children});
    return {x:x+gateWidths[node[0]],y};
  }
  const output=layout(circuit,225);
  return <Drawing {...props} kind="circuit" width={308} height={Math.max(79,nextY+1)}>
    {inputs.map(({name,y})=><Label key={y} x={24} y={y+5}>{name}</Label>)}
    {gates.map(({kind,x,y,children})=><g key={x+':'+y}>
      {children.map((child,i)=>{
        const gateY=children.length===1?y:y+(i===0?-7:7);
        const elbow=x-15, port=x+(kind==='OR'?4:0);
        return <path key={i} d={'M'+child.x+' '+child.y+'H'+elbow+'V'+gateY+'H'+port}/>;
      })}
      <Gate kind={kind} x={x} y={y}/>
    </g>)}
    <path d={'M'+output.x+' '+output.y+'H272'}/><Label x={288} y={output.y+5}>X</Label>
  </Drawing>;
}
function Computer(props:BookletFigureProps) {
  const order:readonly number[]=computerCases[props.values[0]], ys=[50,128,206];
  const [control,memory,arithmetic]=[0,1,2].map(component=>ys[order.indexOf(component)]);
  function vertical(from:number,to:number,x:number,offset:number,side:'left'|'right') {
    const direction=Math.sign(to-from);
    if(Math.abs(to-from)<100)return 'M'+x+' '+(from+direction*15)+'V'+(to-direction*15);
    const port=side==='left'?231:318;
    return 'M'+port+' '+(from+9)+'H'+offset+'V'+(to+9)+'H'+port;
  }
  return <Drawing {...props} kind="computer" width={715} height={250}>
    <Arrow d={'M140 '+memory+'H231'}/><Arrow d={'M318 '+memory+'H420'}/>
    <Arrow d={vertical(memory,control,263,337,'right')}/>
    <Arrow d={vertical(memory,arithmetic,246,174,'left')}/>
    <Arrow d={vertical(arithmetic,memory,281,387,'right')}/>
    <Arrow d={'M231 '+(control-6)+'H91V'+(memory-Math.sign(memory-control)*15)} dashed/>
    <Arrow d={'M318 '+(control-5)+'H466V'+(memory-Math.sign(memory-control)*15)} dashed/>
    <Arrow d={'M318 '+(control+6)+'H361V'+(memory+7)+'H318'} dashed/>
    <Arrow d={'M231 '+(control+7)+'H196V'+(arithmetic+5)+'H231'} dashed/>
    <Box x={42} y={memory-15} w={99} h={30} label="入力装置"/><Box x={420} y={memory-15} w={94} h={30} label="出力装置"/>
    {ys.map((y,i)=><Box key={i} x={231} y={y-15} w={87} h={30} label={componentLabels[i]}/>)}
    <Arrow d="M526 28h52"/><Label x={588} y={33} anchor="start">データの流れ</Label>
    <Arrow d="M526 55h52" dashed/><Label x={588} y={60} anchor="start">制御の流れ</Label>
  </Drawing>;
}
export const legacy2005SpringAm0126FigureRenderers:readonly BookletFigureRenderer[]=[
  {profile:profiles.conversion,component:Conversion},
  {profile:profiles.weather,component:Weather},
  {profile:profiles.automaton,component:Automaton},
  {profile:profiles.tree,component:Tree},
  {profile:profiles.instructions,component:Instructions},
  {profile:profiles.stack,component:Stack},
  {profile:profiles.gates,component:Gates},
  {profile:profiles.circuit,component:CircuitFigure},
  {profile:profiles.computer,component:Computer},
];
