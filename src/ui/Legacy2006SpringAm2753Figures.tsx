import {useId} from 'react';
import type {BookletFigureProps,BookletFigureRenderer} from './booklet-figure-renderer-contract';
import {alt,chargeNames,classCases,classRelations,codeCases,controlNames,coordinateTable,dayCases,edges,names,plotCurves,profile,qualityCases,type FigureName} from '../core/generators/legacy-2006-spring-am-27-53-figures';
import {selectCase} from '../core/generators/legacy-2016-autumn-pm-09-13-support';

type Point=readonly [number,number];
const xy=([x,y]:Point)=>x+' '+y;

function Control({kind,arrow}:{kind:number;arrow:string}) {
  const post=kind===1, double=kind===0, upper=55;
  const lower=post?139:131, processY=post?58:112;
  const box=(x:number,y:number)=><><rect x={x-41} y={y-13} width="82" height="26"/><text fill="currentColor" stroke="none" x={x} y={y+6}>処理</text></>;
  const branch=['M 173 55 H 230 V 99 M 230 125 V 174 H 130',
    'M 87 139 H 54 V 32 H 130','M 173 55 H 230 V 174 H 130',
    'M 130 125 V 162 H 52 V 23 H 130'];
  return <g textAnchor="middle">
    <path d={post?'M 130 18 V 45 M 130 71 V 120 M 130 158 V 190':kind===3?'M 130 18 V 37 M 130 73 V 99 M 130 174 V 190':'M 130 18 V 37 M 130 73 V 99 M 130 125 V 190'}/>
    <path d={branch[kind]} markerEnd={arrow}/>
    {kind===3&&<path d="M 173 55 H 230 V 174 H 130" markerEnd={arrow}/>}
    <polygon points={post?'87,139 130,120 173,139 130,158':'87,55 130,37 173,55 130,73'}/>
    <text fill="currentColor" stroke="none" x="130" y={post?lower+5:upper+5}>条件</text>
    {box(130,processY)}
    {double&&box(230,112)}
  </g>;
}

const nodes:Record<string,Point>={A:[91,48],B:[307,48],C:[91,151],D:[307,151]};
function Uml({index,arrow,triangle,diamond}:{index:number;arrow:string;triangle:string;diamond:string}) {
  return <g textAnchor="middle">
    {classRelations.map(([a,b],i)=>{
      const type=classCases[index][i], from=nodes[a],to=nodes[b];
      const gap=from[0]===to[0]?16:51;
      const aligned=(a:Point,b:Point):Point=>[a[0]+Math.sign(b[0]-a[0])*gap,a[1]+Math.sign(b[1]-a[1])*gap];
      const start=aligned(from,to),stop=aligned(to,from);
      const padded:Point=type===1?[start[0]+Math.sign(to[0]-from[0])*9,start[1]+Math.sign(to[1]-from[1])*9]:start;
      return <path key={i} data-relation={a+b} data-terminator={type} d={'M '+xy(padded)+' L '+xy(stop)}
        markerStart={type===1?diamond:undefined} markerEnd={type===3?triangle:arrow} strokeDasharray={type===2?'6 4':undefined}/>;
    })}
    {Object.entries(nodes).map(([name,[x,y]])=><g key={name}>
      <rect x={x-51} y={y-16} width="102" height="32"/><text fill="currentColor" stroke="none" x={x} y={y+6}>クラス {name}</text>
    </g>)}
  </g>;
}

function Subtract({arrow}:{arrow:string}) {
  return <g textAnchor="middle">
    <rect x="54" y="20" width="122" height="27" rx="13"/><text fill="currentColor" stroke="none" x="115" y="39">開始</text>
    <path d="M115 47 V66 M115 121 V151 M115 199 V232 M115 276 V301 M169 175 H286" markerEnd={arrow}/>
    <path d="M398 175 H493 V231 M343 199 V232 M493 272 V291"/>
    <path d="M343 272 V291 H573 V139 H115" markerEnd={arrow}/>
    <rect x="55" y="66" width="120" height="55"/>
    <text fill="currentColor" stroke="none" x="115" y="87">a → m</text><text fill="currentColor" stroke="none" x="115" y="110">b → n</text><text fill="currentColor" stroke="none" x="40" y="91">①</text>
    <polygon points="61,175 115,151 169,175 115,199"/><text fill="currentColor" stroke="none" x="115" y="180">m：n</text><text fill="currentColor" stroke="none" x="49" y="170">②</text>
    <polygon points="286,175 343,151 400,175 343,199"/><text fill="currentColor" stroke="none" x="343" y="180">m：n</text><text fill="currentColor" stroke="none" x="271" y="170">③</text>
    <polygon points="55,232 204,232 174,276 25,276"/><text fill="currentColor" stroke="none" x="115" y="260">m の値を印字</text><text fill="currentColor" stroke="none" x="25" y="242">⑥</text>
    <rect x="286" y="232" width="114" height="40"/><text fill="currentColor" stroke="none" x="343" y="258">m−n → m</text><text fill="currentColor" stroke="none" x="268" y="248">④</text>
    <rect x="436" y="232" width="114" height="40"/><text fill="currentColor" stroke="none" x="493" y="258">n−m → n</text><text fill="currentColor" stroke="none" x="420" y="248">⑤</text>
    <text fill="currentColor" stroke="none" x="135" y="223">＝</text><text fill="currentColor" stroke="none" x="183" y="166">≠</text><text fill="currentColor" stroke="none" x="363" y="220">＞</text><text fill="currentColor" stroke="none" x="413" y="166">＜</text>
    <rect x="54" y="301" width="122" height="27" rx="13"/><text fill="currentColor" stroke="none" x="115" y="321">終了</text>
  </g>;
}

function Quality({index,arrow}:{index:number;arrow:string}) {
  return <g>{qualityCases[index].figures.map((points,i)=>{
    const x0=63+290*i, y0=185, x=(j:number)=>x0+44*j, y=(num:number)=>y0-num;
    const gain=points.slice(1).map((n,j)=>n-points[j]);
    const tangent=(j:number)=>{
      if(j===0) return 0;
      if(j===points.length-1) return gain[j-1];
      const a=gain[j-1],b=gain[j];
      return a===0||b===0?0:2*a*b/(a+b);
    };
    const curve=points.slice(1).map((n,j)=>' C '+(x(j)+44/3)+' '+y(points[j]+tangent(j)/3)+' '+
      (x(j+1)-44/3)+' '+y(n-tangent(j+1)/3)+' '+x(j+1)+' '+y(n));
    return <g key={i}>
      <text fill="currentColor" stroke="none" x={x0+75} y="26" textAnchor="middle">サブシステム {'ab'[i]}</text>
      <path d={'M '+x0+' '+y0+' V 39 M '+x0+' '+y0+' H '+(x0+199)} markerEnd={arrow}/>
      <text fill="currentColor" stroke="none" x={x0-34} y="77" style={{writingMode:'vertical-rl'}}>検出数累積</text>
      <text fill="currentColor" stroke="none" x={x0+201} y={y0+6}>時間</text>
      <path data-curve={'ab'[i]} data-counts={points.join(',')} d={'M '+x0+' '+y0+curve.join('')}/>
    </g>;
  })}</g>;
}

function away(from:Point,to:Point,padding:number):Point{
  const distance=Math.hypot(to[0]-from[0],to[1]-from[1]);
  return [from[0]+(to[0]-from[0])*padding/distance,from[1]+(to[1]-from[1])*padding/distance];
}
function Critical({index,arrow}:{index:number;arrow:string}) {
  return <g textAnchor="middle">
    {edges.map(([from,to],i)=>{
      const a=coordinateTable[from],b=coordinateTable[to], x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;
      const name=String.fromCharCode(65+i),days=dayCases[index][i],vertical=a[0]===b[0];
      return <g key={name} data-edge={name+','+from+','+to+','+days}>
        <path d={'M '+xy(away(a,b,15))+' L '+xy(away(b,a,15))} markerEnd={arrow}/>
        <text fill="currentColor" stroke="none" x={x+(vertical?-17:0)} y={y-8}>{name}</text><text fill="currentColor" stroke="none" x={x+(vertical?17:0)} y={y+20}>{days}</text>
      </g>;
    })}
    {coordinateTable.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="15"/>)}
  </g>;
}

const leftCode=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
const parity=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
const invert=(code:string)=>code.replace(/[01]/g,char=>char==='0'?'1':'0');
function Jan({index,arrow}:{index:number;arrow:string}) {
  const input=codeCases[index],digits=[...input].map(Number),marks=parity[digits[0]];
  const left=digits.slice(1,7).map((n,i)=>marks[i]==='L'?leftCode[n]:[...invert(leftCode[n])].reverse().join('')).join('');
  const right=digits.slice(7).map(n=>invert(leftCode[n])).join('');
  const bars='101'+left+'01010'+right+'0000000'+'101';
  const pitch=2.8, x0=65, y0=20, end=x0+pitch*(3+42+5+35+3.5);
  const labelPositions=[x0-15,...Array.from({length:6},(_,i)=>x0+(6.5+7*i)*pitch),...Array.from({length:5},(_,i)=>x0+(53.5+7*i)*pitch)];
  return <g>
    {[...bars].map((value,i)=>value==='1'?<rect key={i} x={x0+i*pitch} y={y0} width={pitch} height="91" fill="currentColor" stroke="none"/>:null)}
    <g textAnchor="middle" data-digits={input}>{digits.map((digit,i)=><text fill="currentColor" stroke="none" key={i} x={labelPositions[i]} y="131">{digit}</text>)}</g>
    <rect x={end-8} y="114" width="16" height="20" fill="currentColor" stroke="none"/>
    <path d={'M '+(end+40)+' 158 H '+end+' V 134'} markerEnd={arrow}/>
    <text fill="currentColor" stroke="none" x={end+46} y="164">ここに検査数字が付加される</text>
  </g>;
}

function Tariff({kind,arrow}:{kind:number;arrow:string}){
  const x0=34,y0=170, values=plotCurves[kind];
  const plot=kind===0?[[x0,y0-values[0]],[x0+191,y0-values[3]]]:
    kind===1?[[x0,y0],[x0+104,y0-values[2]],[x0+191,y0-values[3]]]:
    values.map((v,i)=>[x0+i*64,y0-v]);
  return <g>
    <path d={'M '+x0+' '+y0+' V 15 M '+x0+' '+y0+' H 249'} markerEnd={arrow}/>
    <text fill="currentColor" stroke="none" x="17" y="184">0</text>
    <polyline data-rates={plot.flat().join(',')} points={plot.map(point=>point.join(',')).join(' ')}/>
  </g>;
}

function Diagram({name,values,caption}:BookletFigureProps&{name:FigureName}) {
  const index=selectCase(values,4), id=useId();
  const arrow='url(#'+id+'-arrow)',triangle='url(#'+id+'-triangle)',diamond='url(#'+id+'-diamond)';
  const control=controlNames.indexOf(name as typeof controlNames[number]),charge=chargeNames.indexOf(name as typeof chargeNames[number]);
  const [width,height]=control>=0?[285,204]:charge>=0?[265,197]:name==='39-uml'?[410,199]:name==='42-subtract'?[606,350]:
    name==='44-quality'?[605,210]:name==='46-critical'?[663,292]:[575,185];
  return <figure className="managed-diagram source-figure">
    <div tabIndex={0} aria-label={caption+'の表示'} className="diagram-scroll">
      <svg viewBox={'0 0 '+width+' '+height} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'} style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',height:'auto',maxWidth:'none',marginInline:'auto',color:'var(--diagram-ink)'}}
        stroke="currentColor" fill="none" strokeWidth="1.35" fontSize="16">
        <title id={id+'-title'}>{caption}</title>
        <desc id={id+'-desc'}>{alt(name,index)}</desc>
        <defs>
          <marker id={id+'-arrow'} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M 1 1 L 8 5 L 1 9"/>
          </marker>
          <marker id={id+'-triangle'} markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
            <polygon points="0,1 12,7 0,13" fill="var(--surface)"/>
          </marker>
          <marker id={id+'-diamond'} markerWidth="20" markerHeight="13" refX="9" refY="6" orient="auto" markerUnits="userSpaceOnUse">
            <polygon points="0,6 9,1 18,6 9,11" fill="var(--surface)"/>
          </marker>
        </defs>
        <g className="source-diagram-content">
          {control>=0?<Control kind={control} arrow={arrow}/>:charge>=0?<Tariff kind={charge} arrow={arrow}/>:
            name==='39-uml'?<Uml index={index} arrow={arrow} triangle={triangle} diamond={diamond}/>:
            name==='42-subtract'?<Subtract arrow={arrow}/>:name==='44-quality'?<Quality index={index} arrow={arrow}/>:
            name==='46-critical'?<Critical index={index} arrow={arrow}/>:<Jan index={index} arrow={arrow}/>}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
export const legacy2006SpringAm2753FigureRenderers:readonly BookletFigureRenderer[]=names.map(name=>({
  profile:profile(name),component:props=><Diagram {...props} name={name}/>,
}));
