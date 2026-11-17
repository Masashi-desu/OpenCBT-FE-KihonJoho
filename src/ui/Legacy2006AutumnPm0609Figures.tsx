import {useId} from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { drawNames,drawingAlt,exampleWidths,profile,replacementLines,type DrawName } from '../core/generators/legacy-2006-autumn-pm-06-09-figures';
import { selectCase } from '../core/generators/legacy-2016-autumn-pm-09-13-support';

type WordPart=readonly [size:number,pattern:'m'|'n'|'rest'];
const leftWord=(m:number,kind:'m'|'n'):WordPart[]=>[[m,kind],[16-m,'rest']];
const combined=(m:number,n:number):WordPart[]=>[[m,'m'],[n,'n'],[16-m-n,'rest']];
const pitch=10.75, wordHeight=27;

function Word({x,y,label,parts,shade}:{
  x:number;y:number;label:string;parts:WordPart[];shade:string;
}) {
  let offset = x;
  return <g data-word={label} stroke="currentColor" strokeWidth="1.3">
    <text x={x-7} y={y+19} textAnchor="end" stroke="none" fill="currentColor">{label}</text>
    {parts.map(([size,pattern])=>{
      const start=offset,width=size*pitch;
      offset+=width;
      if(!size) return null;
      return <rect key={pattern} data-part={pattern} data-bits={size}
        x={start} y={y} width={width} height={wordHeight}
        fill={pattern==='n'?'currentColor':pattern==='m'?'url(#'+shade+')':'none'}/>;
    })}
  </g>;
}

function OutlineArrow({x,y}: {x:number;y:number}) {
  return <path d={'M '+x+' '+(y-6)+' h 44 v -8 l 16 14 -16 14 v -8 h -44 z'}
    fill="none" stroke="currentColor" strokeWidth="1.25"/>;
}
function NoteArrow({x,y,endX,endY}: {x:number;y:number;endX:number;endY:number}) {
  const a=Math.atan2(endY-y,endX-x);
  const arm=(offset:number)=>[endX-Math.cos(a+offset)*7,endY-Math.sin(a+offset)*7].join(',');
  return <g fill="none" stroke="currentColor" strokeWidth="1.15">
    <line x1={x} y1={y} x2={endX} y2={endY}/>
    <polyline points={arm(0.55)+' '+endX+','+endY+' '+arm(-0.55)}/>
  </g>;
}

function Unit({x,y,text}: {x:number;y:number;text:string}) {
  return <text x={x} y={y} fill="currentColor">{text}</text>;
}
function Format({index,retained}: {index:number;retained:boolean}) {
  const shade=useId();
  const [m,n]=exampleWidths[index];
  const left=112,right=415,end=right+pitch*16;
  const rem=right+pitch*(m+n);
  const controls={labelM:index?'m＝'+m+' ビット':'m ビット',labelN:index?'n＝'+n+' ビット':'n ビット',
    labelBoth:index?'m＋n＝'+(m+n)+' ビット':'m＋n ビット'};
  const parts=(which:'m'|'n')=>leftWord(which==='m'?m:n,which);
  const height=retained?143:275;
  const top=retained?54:201;
  return <svg aria-hidden="true" viewBox={'0 0 760 '+height}
    style={{display:'block',width:'calc(760px * var(--image-scale, 1))',maxWidth:'none',height:'auto',marginInline:'auto',color:'var(--diagram-ink)'}}
    fontSize={16} fontFamily="inherit">
    <defs>
      <pattern id={shade} width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M -1 1 L 1 -1 M 0 6 L 6 0 M 5 7 L 7 5" stroke="currentColor" fill="none" strokeWidth=".85"/>
      </pattern>
    </defs>
    {!retained&&<>
      <Unit x={15} y={26} text="COMBINE"/>
      <Unit x={left} y={39} text={controls.labelM}/>
      <Unit x={left} y={91} text={controls.labelN}/>
      <Unit x={right} y={65} text={controls.labelBoth}/>
      <Word x={left} y={47} label="C1" parts={parts('m')} shade={shade}/>
      <Word x={left} y={99} label="C2" parts={parts('n')} shade={shade}/>
      <OutlineArrow x={310} y={86}/>
      <Word x={right} y={72} label="GR0" parts={combined(m,n)} shade={shade}/>
      {m+n<16&&<>
        <NoteArrow x={end+19} y={85} endX={(rem+end)/2} endY={85}/>
        <Unit x={end+24} y={91} text="0を設定する。"/>
      </>}
      <Unit x={15} y={165} text="DIVIDE"/>
    </>}
    <Unit x={left} y={top-10} text={controls.labelBoth}/>
    <Word x={left} y={top} label="GR0" parts={combined(m,n)} shade={shade}/>
    <OutlineArrow x={310} y={top+13}/>
    <Unit x={right} y={top-35} text={controls.labelM}/>
    <Unit x={right} y={top+18} text={controls.labelN}/>
    <Word x={right} y={top-27} label="D1" parts={parts('m')} shade={shade}/>
    <Word x={right} y={top+26} label="D2" parts={parts('n')} shade={shade}/>
    <NoteArrow x={end+25} y={top+13} endX={right+pitch*(m+16)/2} endY={top-14}/>
    <NoteArrow x={end+25} y={top+13} endX={right+pitch*(n+16)/2} endY={top+40}/>
    {retained?<>
      <Unit x={end+32} y={top+10} text="元のデータを"/>
      <Unit x={end+32} y={top+30} text="保持する。"/>
    </>:<Unit x={end+32} y={top+19} text="0を格納する。"/>}
  </svg>;
}
function Replacements() {
  return <div className="content-blocks" style={{minWidth:'38em',color:'var(--diagram-ink)'}}>
    <table className="content-table">
      <thead><tr><th scope="col">処置</th><th scope="col">変更内容</th></tr></thead>
      <tbody>{replacementLines.map((lines,i)=><tr key={i}>
        <th scope="row">{i===0?'αを置換':'βを置換'}</th><td><pre>{lines.join('\n')}</pre></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
function Diagram({name,values,caption}:BookletFigureProps&{name:DrawName}) {
  const index=selectCase(values,4),alt=drawingAlt(name,index);
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={alt}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'の表示'}>
      {name==='9-replacements'?<Replacements/>:<Format index={index} retained={name==='9-keep-data'}/>}
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export const legacy2006AutumnPm0609FigureRenderers:readonly BookletFigureRenderer[]=drawNames.map(name=>({
  profile:profile(name),component:props=><Diagram {...props} name={name}/>,
}));
