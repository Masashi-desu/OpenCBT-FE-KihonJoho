import React from'react';
import{useId}from'react';
import{legacy2019BitapPrograms,legacy2019BitapCodeAlt}from'../core/generators/legacy-2019-autumn-pm8';
import{legacy2019BitapModel}from'../core/generators/legacy-2019-autumn-pm8-model';
/** Year-only code geometry. Profiles stay outside the shared registry. */
export function Legacy2019AutumnPm8Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const id=useId().replace(/:/g,'');
 if(profile==='legacy-2019-autumn-pm8-bitap-text-array'){
  const m=legacy2019BitapModel(values);
  return <figure className="managed-diagram source-figure profile-legacy-2019-autumn-pm8-bitap-text-array"><div className="table-scroll" tabIndex={0} aria-label="対象文字列の配列。幅が足りない場合は左右にスクロールできます。"><table><caption>{caption}</caption><thead><tr>{[...m.text].map((_,i)=><th key={i} scope="col"><span className="table-heading-text">{i+1}</span></th>)}</tr></thead><tbody><tr>{[...m.text].map((c,i)=><td key={i}><span className="table-cell-value">{c}</span></td>)}</tr></tbody></table></div></figure>;
 }
 const n=Number(profile.replace('legacy-2019-autumn-pm8-bitap-program',''));
 if(![1,2,3].includes(n)||profile!=='legacy-2019-autumn-pm8-bitap-program'+n||values.length!==1||values[0]!==0)throw Error('PARAMETER_CONSTRAINT');
 const lines=legacy2019BitapPrograms[String(n)as keyof typeof legacy2019BitapPrograms],width=1680,row=43,height=lines.length*row+65;
 const ranges:{kind:string;start:number;end:number;x:number}[]=[],stack:{kind:string;start:number;x:number}[]=[];
 lines.forEach((line,i)=>{const s=line.trim(),x=58+(line.length-line.trimStart().length)*12;
  if(s.startsWith('■')&&s!=='■')stack.push({kind:'loop',start:i,x});
  else if(s.startsWith('▲'))stack.push({kind:'condition',start:i,x});
  else if(s==='■'||s==='▼'){const open=stack.pop();if(!open||open.kind!==(s==='■'?'loop':'condition'))throw Error('INVALID_CODE_SCOPE');ranges.push({...open,end:i});}
 });if(stack.length)throw Error('INVALID_CODE_SCOPE');
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="プログラム。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 ${width} ${height}`} style={{width:`calc(${width}px * var(--image-scale, 1))`,minWidth:'100%'}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2019BitapCodeAlt(n)}</desc><g aria-hidden="true">
 {ranges.map((r,i)=><line key={'range'+i} data-kind={r.kind} data-start={r.start+1} data-end={r.end+1} x1={r.x} x2={r.x} y1={35+r.start*row+8} y2={35+r.end*row-16} stroke="currentColor"/>)}
 {lines.map((line,i)=><text key={i} data-code-line={i+1} x={50} y={35+i*row} xmlSpace="preserve" fill="currentColor" stroke="none" style={{fontFamily:'ui-monospace,monospace',fontSize:22}}>{line}</text>)}
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
