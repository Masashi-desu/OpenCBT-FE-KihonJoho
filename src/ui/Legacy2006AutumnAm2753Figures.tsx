import { useId } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { dfdModel, drawingAlt, figureNames, profile, qualityModel, stateArrows, type FigureName } from '../core/generators/legacy-2006-autumn-am-27-53-figures';
import { selectCase } from '../core/generators/legacy-2016-autumn-pm-09-13-support';

type Point = readonly [x:number,y:number];
type Segment = readonly [from:Point,to:Point];

function Arrow({ from,to }: {from:Point;to:Point}) {
  const [x,y]=to, angle=Math.atan2(y-from[1],x-from[0]), length=8, spread=0.57;
  const arm=(delta:number)=>[x-Math.cos(angle+delta)*length,y-Math.sin(angle+delta)*length].join(',');
  return <g fill="none"><line x1={from[0]} y1={from[1]} x2={x} y2={y}/><polyline points={arm(spread)+' '+x+','+y+' '+arm(-spread)}/></g>;
}

function towards(from:Point,to:Point,padding:number):Point {
  const x=to[0]-from[0],y=to[1]-from[1],length=Math.hypot(x,y);
  return [from[0]+x*padding/length,from[1]+y*padding/length];
}

function States({index}:{index:number}) {
  const points: Record<string,Point> = {a:[178,47],b:[78,174],c:[278,174]};
  return <g>
    {stateArrows(index).map(([from,to],i)=>{
      const start=points[from],end=points[to];
      const parallel=i<2?6:0;
      const angle=Math.atan2(end[1]-start[1],end[0]-start[0]);
      const dx=-Math.sin(angle),dy=Math.cos(angle);
      const place=([x,y]:Point):Point=>[x+dx*parallel,y+dy*parallel];
      const shift = i===2 || i===3 ? -17 : 17;
      return <g key={i} data-transition={from+'→'+to}>
        <Arrow from={place(towards(start,end,24))} to={place(towards(end,start,24))}/>
        <text x={(start[0]+end[0])/2+dx*(parallel+shift)} y={(start[1]+end[1])/2+dy*(parallel+shift)}
          textAnchor="middle" dominantBaseline="central" stroke="none">{'①②③④'[i]}</text>
      </g>;
    })}
    {Object.entries(points).map(([label,[x,y]])=><g key={label}>
      <circle cx={x} cy={y} r={24} fill="none"/>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" stroke="none">{label}</text>
    </g>)}
  </g>;
}

const dfdRows=[
  [0,0,1,2,1,1],[0,0,1,1,2,2],[0,0,1,1,1],[0,0,1,1,2,1,1],
];

function Dfd({index}:{index:number}) {
  const {steps}=dfdModel[index];
  const span=492/(steps.length-1);
  const points:Point[]=steps.map((_,i)=>[40+i*span,48+48*dfdRows[index][i]]);
  function join(i:number):Segment {
    const from=points[i],to=points[i+1];
    const start=steps[i]==='○'?towards(from,to,18):steps[i]==='□'?[from[0]+26,from[1]] as const:[from[0]+12,from[1]+7] as const;
    const stop=steps[i+1]==='○'?towards(to,from,18):steps[i+1]==='□'?[to[0]-26,to[1]] as const:[to[0]-12,to[1]-7] as const;
    return [start,stop];
  }
  return <g>
    {points.slice(1).map((_,i)=>{const [from,to]=join(i);return <Arrow key={i} from={from} to={to}/>;})}
    {steps.map((step,i)=>{
      const [x,y]=points[i];
      return <g key={i} data-symbol={step}>
        {step==='□'?<rect x={x-26} y={y-17} width="52" height="34" fill="none"/>:
          step==='○'?<circle cx={x} cy={y} r="18" fill="none"/>:
          <path d={'M '+(x-23)+' '+(y-7)+' h 46 M '+(x-23)+' '+(y+7)+' h 46'} fill="none"/>}
      </g>;
    })}
  </g>;
}

function Quality({index}:{index:number}) {
  const {at,left,errors,leftExpected,errorsExpected}=qualityModel[index];
  const x=(value:number)=>87+value*5.68;
  const y=(value:number)=>261-value*2.12;
  const predicted=(start:number,mid:number,end:number)=>'M '+x(0)+' '+y(start)+
    ' C '+x(at*0.50)+' '+y(start)+' '+x(at*0.75)+' '+y((start+mid)/2)+' '+x(at)+' '+y(mid)+
    ' C '+x(at+(100-at)*0.40)+' '+y((mid+end)/2)+' '+x(62)+' '+y(end)+' '+x(80)+' '+y(end);
  const progress=(start:number,end:number)=>'M '+x(0)+' '+y(start)+
    ' C '+x(at*0.50)+' '+y(start)+' '+x(at*0.75)+' '+y((start+end)*0.50)+' '+x(at)+' '+y(end);
  return <g>
    <Arrow from={[x(0),y(0)]} to={[x(0),y(104)]}/>
    <Arrow from={[x(100),y(0)]} to={[x(100),y(104)]}/>
    <Arrow from={[x(0),y(0)]} to={[x(101),y(0)]}/>
    <Arrow from={[x(at),y(-10)]} to={[x(at),y(-1)]}/>
    <path d={predicted(100,leftExpected,0)} data-quantity="remaining-plan" fill="none" strokeDasharray="2 5"/>
    <path d={predicted(0,errorsExpected,100)} data-quantity="errors-plan" fill="none" strokeDasharray="2 5"/>
    <path d={progress(100,left)} data-quantity="remaining-actual" fill="none"/>
    <path d={progress(0,errors)} data-quantity="errors-actual" fill="none"/>
    <g stroke="none">
      <text x="13" y="31" style={{writingMode:'vertical-rl'}}>未消化テスト項目数</text>
      <text x="675" y="30" style={{writingMode:'vertical-rl'}}>累積誤り検出数</text>
      <text x="615" y="288">日数</text>
      <text x={x(at)+8} y="287">（現時点）</text>
      <text x={x(at)+10} y={y(left)-10}>未消化テスト項目数</text>
      <text x={x(1)} y={y(errors)-5}>累積誤り検出数</text>
      <text x={x(67)} y="80">累積誤り検出数</text>
      <text x={x(67)} y="103">の予測</text>
      <text x={x(66)} y="180">未消化テスト項目数</text>
      <text x={x(66)} y="203">の予測</text>
    </g>
  </g>;
}

const renderers = {
  '29-process-states': {component:States, width:362, height:218},
  '39-dfd': {component:Dfd, width:575, height:178},
  '45-test-quality': {component:Quality, width:718, height:302},
};

function Diagram({name,values,caption}:BookletFigureProps & {name:FigureName}) {
  const index=selectCase(values,4);
  const id=useId();
  const {component:Renderer,width,height}=renderers[name];
  return <figure className="managed-diagram source-figure">
    <figcaption>{caption}</figcaption>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'の表示'}>
      <svg width={width} height={height} viewBox={'0 0 '+width+' '+height} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
        style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',color:'var(--diagram-ink)',marginInline:'auto'}}
        stroke="currentColor" fill="currentColor" strokeWidth="1.65" fontSize={17}>
        <title id={id+'-title'}>{caption}</title>
        <desc id={id+'-desc'}>{drawingAlt(name,index)}</desc>
        <Renderer index={index}/>
      </svg>
    </div>
  </figure>;
}
export const legacy2006AutumnAm2753FigureRenderers:readonly BookletFigureRenderer[]=figureNames.map(name=>({
  profile:profile(name),component:props=><Diagram {...props} name={name}/>,
}));
