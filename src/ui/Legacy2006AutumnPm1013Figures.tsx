import React from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import type { LanguagePanel } from '../core/generators/legacy-2006-autumn-pm-10-13-support';
import { legacy2006AutumnPm1013Figures as figures } from '../core/generators/legacy-2006-autumn-pm-10-13-figures';

const tableStyle={borderCollapse:'collapse',width:'max-content'} as const;
const cellStyle={border:'1px solid currentColor',padding:'0.2em 0.5em',lineHeight:'1.35'} as const;
const codeStyle={margin:0,fontFamily:'monospace',fontSize:'1em',whiteSpace:'pre',lineHeight:'1.35'} as const;

function Bill({panel}:{panel:Extract<LanguagePanel,{kind:'components'}>}) {
  return <svg className="diagram-svg" viewBox="0 0 292 190" width="292" height="190" aria-hidden="true">
    {panel.lists.map(([name,children],index)=>{
      const y=26+index*92;
      return <g key={name} fontSize="16" fill="currentColor">
        <text x="14" y={y+5}>{name}</text>
        <path d={`M 77 ${y} H 138 M 104 ${y} V ${y+(children.length-1)*26}`} stroke="currentColor" fill="none"/>
        {children.map(([part,n],offset)=><g key={part}>
          <path d={`M 104 ${y+offset*26} H 138`} stroke="currentColor"/>
          <text x="146" y={y+offset*26+5}>{part}（{n}）</text>
        </g>)}
      </g>;
    })}
  </svg>;
}
function RecordFormat({panel}:{panel:Extract<LanguagePanel,{kind:'format'}>}) {
  if(panel.grouping) return <table style={tableStyle}><tbody>
    <tr><th colSpan={2} style={cellStyle}>{panel.grouping}</th><td rowSpan={2} style={{...cellStyle,textAlign:'center'}}>
      {panel.fields[2].text}<br/>{panel.fields[2].width}けた</td></tr>
    <tr>{panel.fields.slice(0,2).map(field=><td key={field.text} style={{...cellStyle,textAlign:'center'}}>
      {field.text}<br/>{field.width}けた</td>)}</tr></tbody></table>;
  return <table style={tableStyle}><tbody><tr>{panel.fields.map(field=><td key={field.text} style={{...cellStyle,textAlign:'center'}}>
    {field.text}<br/>{field.width}けた</td>)}</tr></tbody></table>;
}
function BitIllustration({panel}:{panel:Extract<LanguagePanel,{kind:'bits'}>}) {
  const arrow=React.useId(), replace=panel.pattern!==undefined, left=116, right=520, scale=20, top=48;
  const bitRow=(value:string,x:number,y:number,label:string)=><g fill="currentColor" fontSize="16">
    {label&&<text x={x-15} y={y+20} textAnchor="end">{label}</text>}
    <rect x={x} y={y} width={value.length*scale} height="28" fill="none" stroke="currentColor"/>
    {[...value].map((bit,i)=><text key={i} x={x+(i+0.5)*scale} y={y+20} textAnchor="middle">{bit}</text>)}
  </g>;
  const segment=(x:number,y:number,width:number)=><rect x={x} y={y-6} width={width*scale} height="40" fill="none" stroke="currentColor" strokeDasharray="5 4"/>;
  const pointer=(d:string)=><path d={d} fill="none" stroke="currentColor" markerEnd={'url(#'+arrow+')'}/>;
  const start=left+panel.prefix*scale, finish=right+panel.prefix*scale, half=panel.width*scale/2;
  return <svg className="diagram-svg" viewBox="0 0 870 267" width="870" height="267" aria-hidden="true">
    <defs><marker id={arrow} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 8 4 L 0 8 Z" fill="currentColor"/></marker></defs>
    {bitRow(panel.source,left,top,replace?'ビット列A：':'')}{bitRow(panel.target,right,top,'')}
    {pointer('M 450 62 H 503')}
    {replace?<>
      {segment(start,top,panel.width)}{segment(finish,top,panel.width)}
      {bitRow(panel.pattern!,left,118,'ビット列B：')}
      {bitRow(panel.replacement!,left,179,'ビット列C：')}
      {pointer(`M ${start+half} 82 V 132 H ${left+panel.width*scale+3}`)}
      {pointer(`M ${left+panel.width*scale} 193 H ${finish+half} V 83`)}
      <g fill="currentColor" fontSize="16"><text x={start+half+8} y="119">一致</text>
        <text x={finish+half+8} y="182">置換</text><text x={left+half} y="235" textAnchor="middle">n＝{panel.width}</text></g>
      <path d={`M ${left} 211 v 8 h ${panel.width*scale} v -8`} fill="none" stroke="currentColor"/>
    </>:<>
      <path d={`M ${left+panel.width*scale} ${top} v 28 M ${right+(16-panel.width)*scale} ${top} v 28`}
        stroke="currentColor" fill="none" strokeDasharray="4 3"/>
      {pointer(`M ${left+half} 47 V 25 H ${right+320-half} V 44`)}
      {pointer(`M ${left+half+160} 77 V 117 H ${right+160-half} V 81`)}
      <g fill="currentColor" fontSize="16"><text x="480" y="19" textAnchor="middle">はみ出したビット列を右端に設定</text>
        <text x="479" y="141" textAnchor="middle">左にシフト</text>
        <text x={left+half} y="106" textAnchor="middle">m＝{panel.width}</text></g>
    </>}
  </svg>;
}
function SourceTable({panel}:{panel:Extract<LanguagePanel,{kind:'table'}>}) {
  return <table style={tableStyle}>
    {!panel.hideHeadings&&<thead><tr>{panel.columns.map(column=><th key={column} scope="col" style={cellStyle}>{column}</th>)}</tr></thead>}
    <tbody>{panel.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>
      <td key={j} style={cellStyle}>{j===panel.codeColumn?<pre style={codeStyle}>{cell}</pre>:cell}</td>)}</tr>)}</tbody>
  </table>;
}
function Content({panel}:{panel:LanguagePanel}) {
  switch(panel.kind) {
    case 'components':return <Bill panel={panel}/>;
    case 'format':return <RecordFormat panel={panel}/>;
    case 'bits':return <BitIllustration panel={panel}/>;
    case 'table':return <SourceTable panel={panel}/>;
    case 'output':return <pre style={{...codeStyle,border:'1px solid currentColor',padding:'0.45em 0.65em',width:'max-content'}}>{panel.text}</pre>;
  }
}
function LanguageFigure({caption,values,figure}:BookletFigureProps&{figure:typeof figures[number]}) {
  const panel:LanguagePanel=figure.panel(values);
  const paperCaption=caption.startsWith('図')||caption.startsWith('表');
  return <figure className="managed-diagram source-figure" style={{minWidth:0,maxWidth:'100%'}}>
    <div className="diagram-scroll" role="group" tabIndex={0} aria-label={caption} aria-description={panel.alt}
      data-figure-profile={figure.profile} style={{color:'var(--diagram-ink)',fontSize:'calc(16px * var(--image-scale, 1))'}}>
      <Content panel={panel}/>
    </div>
    {paperCaption&&<figcaption>{caption}</figcaption>}
  </figure>;
}
export const legacy2006AutumnPm1013FigureRenderers:readonly BookletFigureRenderer[]=figures.map(figure=>({
  profile:figure.profile,component:props=><LanguageFigure {...props} figure={figure}/>,
}));
