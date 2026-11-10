import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  applicantFields, applicantFlow, bitExamples, drawingIds, drawings, fixes, investmentTable, masked, maskNote,
  optionCells, optionDrawingIds, programOne, programThree, programTwo, pvNote, recordLayouts, schoolFields,
  spring2012Pm0508Profile, type DrawingId, type OptionDrawingId, type ProgramLine,
} from '../core/generators/legacy-2012-spring-pm-05-08-figures';
import { investmentModel, progressModel } from '../core/generators/legacy-2012-spring-pm-05-08-model';

type Props = BookletFigureProps & { id: DrawingId };
const ink = 'var(--diagram-ink)', border = '1px solid '+ink;
const cell = { border, padding:'0.3em 0.55em', whiteSpace:'nowrap' as const };
const tableStyle = { color:ink, borderCollapse:'collapse' as const, minWidth:'max-content', fontSize:'calc(0.95em * var(--image-scale, 1))' };
const mono = { color:ink, fontFamily:'monospace', fontSize:'calc(1em * var(--image-scale, 1))', whiteSpace:'pre' as const };
const hiddenCell = { ...cell, background:'var(--soft-border)' };
const centered = { marginInline:'auto', width:'max-content' };

function Frame({caption, alt, children, visible=true, captionFirst=false}: {caption:string;alt:string;children:ReactNode;visible?:boolean;captionFirst?:boolean}) {
  const heading=<figcaption className={visible?undefined:'sr-only'}>{caption}</figcaption>;
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={alt}>
    {captionFirst&&heading}
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      {children}
    </div>
    {!captionFirst&&heading}
  </figure>;
}
function Native({id,values,caption,children,visible=true,captionFirst=false}:Props & {children:ReactNode;visible?:boolean;captionFirst?:boolean}) {
  return <Frame {...{caption,children,visible,captionFirst}} alt={drawings[id].alt(values[0])}/>;
}

function Blank({name}:{name:string}) {
  return <span className="source-code-blank" data-source-blank={name} aria-label={'空欄'+name}>{name}</span>;
}

function RecordLayout(props:Props) {
  const fields=props.id==='5-applicant-record'?applicantFields:schoolFields;
  return <Native {...props}><table aria-label={props.caption} style={{...tableStyle,...centered}}><tbody><tr>
    {fields.map(label=><td key={label} style={cell}>{label}</td>)}
  </tr></tbody></table></Native>;
}

type FlowShape = 'file'|'process'|'document'|'input';
const nodeWidth=126, nodeHeight=31, rowHeight=44;

function FlowNode({x,y,label,kind}:{x:number;y:number;label:string;kind:FlowShape}) {
  const w=nodeWidth, h=nodeHeight;
  return <g transform={`translate(${x-w/2} ${y})`} data-flow-node={label}>
    {kind==='file' ? <path d={`M6 0H${w}Q${w-9} ${h/2} ${w} ${h}H6Q-6 ${h/2} 6 0Z`}/>
      : kind==='document' ? <path d={`M0 0H${w}V${h-3}Q${w*.75} ${h-10} ${w/2} ${h-3}T0 ${h-3}Z`}/>
      : kind==='input' ? <path d={`M10 0H${w}L${w-10} ${h}H0Z`}/>
      : <><rect width={w} height={h}/><path d={`M8 0V${h}M${w-8} 0V${h}`}/></>}
    <text x={w/2} y={h/2+5} fill="currentColor" stroke="none" textAnchor="middle">{label}</text>
  </g>;
}

function FlowRecord({x,y,name}:{x:number;y:number;name:keyof typeof recordLayouts}) {
  const fields=recordLayouts[name], column=91;
  return <g transform={`translate(${x} ${y})`}>
    <text y={-6} fill="currentColor" stroke="none">{name}</text>
    {fields.map((field,i)=><g key={field} transform={`translate(${i*column} 0)`}>
      <rect width={column} height={44}/>
      <text x={column/2} y={field.includes('\n')?17:27} textAnchor="middle" fill="currentColor" stroke="none">
        {field.split('\n').map((line,j)=><tspan key={line} x={column/2} dy={j?16:0}>{line}</tspan>)}
      </text>
    </g>)}
  </g>;
}
function ApplicantFlow(props:Props) {
  const extra=props.id==='5-flow-extra', { prior, merged, layouts }=applicantFlow(extra);
  const uid=useId(), left=178, right=327, middle=253, first=18, bottom=first+(prior.length-1)*rowHeight;
  const mergeStart=bottom+rowHeight+13, listY=mergeStart+5*rowHeight;
  const commonX=435, finalHeight=mergeStart+8*rowHeight+10;
  const current=['今年度受験者','集計','ファイル1'];
  const links=(x:number,y:number,count:number) => Array.from({length:count-1},(_,i)=>
    `M${x} ${y+i*rowHeight+nodeHeight}v${rowHeight-nodeHeight}`).join('');
  const kinds: FlowShape[]=['process','file','process','file','process','file','process','document'];
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={props.caption+'。幅が足りない場合は左右にスクロールできます。'}>
      <svg role="img" aria-labelledby={uid+'-title'} aria-describedby={uid+'-alt'} viewBox={`0 0 924 ${finalHeight}`}
        style={{color:ink,display:'block',width:'calc(924px * var(--image-scale, 1))',height:'auto',maxWidth:'none',marginInline:'auto'}}>
        <title id={uid+'-title'}>{props.caption}</title><desc id={uid+'-alt'}>{drawings[props.id].alt(props.values[0])}</desc>
        <g fill="none" stroke="currentColor" strokeWidth="1.15" fontSize="15" aria-hidden="true">
          <path d={links(left,bottom-2*rowHeight,current.length)+links(right,first,prior.length)+links(middle,mergeStart,merged.length)}/>
          <path d={`M${left} ${bottom+nodeHeight}v10H${right}v-10
            M${middle} ${bottom+nodeHeight+10}V${mergeStart}
            M${middle-145} ${listY+nodeHeight}v7H${middle+145}v-7`}/>
          {current.map((label,i)=><FlowNode key={label} x={left} y={bottom-(2-i)*rowHeight} label={label} kind={i===1?'process':'file'}/>)}
          {prior.map((label,i)=><FlowNode key={label} x={right} y={first+i*rowHeight} label={label} kind={i%2?'process':'file'}/>)}
          {merged.map((label,i)=><FlowNode key={label} x={middle} y={mergeStart+i*rowHeight} label={label} kind={kinds[i]}/>)}
          <FlowNode x={middle-145} y={listY} label="指定順位" kind="input"/>
          <FlowNode x={middle+145} y={listY} label="学校名" kind="file"/>
          {layouts.map((name,i)=><FlowRecord key={name} x={commonX} y={extra ? i===0?bottom:listY-54 : mergeStart-8+i*70} name={name}/>)}
        </g>
      </svg>
    </div>
    <figcaption>{props.caption}</figcaption>
  </figure>;
}

function MatchTable(props:Props) {
  return <Native {...props} captionFirst><div style={centered}>
    <table style={tableStyle} aria-label={props.caption}><thead>
      <tr><th colSpan={2} style={cell}>レコードの有無</th>{['学校コード','今年度受験者数','前年度受験者数'].map(label=>
        <th key={label} rowSpan={2} style={cell}>{label}</th>)}</tr>
      <tr><th style={cell}>ファイル1</th><th style={cell}>ファイル2</th></tr>
    </thead><tbody>
      <tr><td style={cell}>あり</td><td style={cell}>あり</td>{[0,1,2].map(col=><td key={col} style={hiddenCell} aria-label="網掛けの非表示部分"/>)}</tr>
      <tr><td style={cell}>あり</td><td style={cell}>なし</td><td style={hiddenCell} aria-label="網掛けの非表示部分"/>
        <td colSpan={2} style={{...cell,textAlign:'center'}}><Blank name="a"/></td></tr>
      <tr><td style={cell}>なし</td><td style={cell}>あり</td><td colSpan={2} style={{...cell,textAlign:'center'}}><Blank name="b"/></td>
        <td style={hiddenCell} aria-label="網掛けの非表示部分"/></tr>
    </tbody></table>
    <p style={{color:ink}}>{maskNote}</p>
  </div></Native>;
}

function ProgressTable(props:Props) {
  const plan=props.id==='6-plan-table', model=progressModel(props.values[0]);
  const rows=plan?model.planRows:model.actualRows, weeks=plan?[1,2,3]:[1,2];
  return <Native {...props} captionFirst><div style={centered}>
    {!plan&&<p style={{textAlign:'end',color:ink}}>単位　時間</p>}
    <table aria-label={props.caption} style={tableStyle}><thead>
      <tr>
        <th rowSpan={2} style={cell}>設計分担</th><th rowSpan={2} style={cell}>メンバ</th>
        {!plan&&<th rowSpan={2} style={cell}>計画工数の総合計</th>}
        {weeks.map(week=><th key={week} colSpan={2} scope="colgroup" style={cell}>{'第'+week+'週'+(plan?'':'の週末時点')}</th>)}
        {plan&&<th rowSpan={2} style={cell}>計画工数の総合計<br/>（時間）</th>}
      </tr>
      <tr>{weeks.flatMap(week => (plan?['計画工数（時間）','計画進捗率（％）']:['実績工数の累積','残り工数']).map(title=>
        <th key={week+title} scope="col" style={cell}>{title}</th>))}</tr>
    </thead><tbody>{rows.map((row,i)=><tr key={row[0]}>{i===rows.length-1
      ? <><th colSpan={2} scope="row" style={cell}>合計</th>{row.slice(2).map((value,j)=><td key={j} style={{...cell,textAlign:'end'}}>{value}</td>)}</>
      : <><th scope="row" style={cell}>{row[0]}</th><td style={cell}>{row[1]}</td>
        {row.slice(2).map((value,j)=><td key={j} style={{...cell,textAlign:'end'}}>{value}</td>)}</>}
    </tr>)}</tbody></table>
  </div></Native>;
}

function CashTable(props:Props) {
  const mode=props.id==='7-lump-table'?'lump':'split', {years}=investmentModel(props.values[0]);
  const data=investmentTable(props.values[0],mode), size=mode==='lump'?3:4, first=mode==='lump'?5:1;
  return <Native {...props} captionFirst><div style={centered}>
    <p style={{textAlign:'end',color:ink}}>単位　百万円</p>
    <table aria-label={props.caption} style={tableStyle}><thead><tr>
      <th scope="col" style={cell}>年</th>{years.map(year=><th key={year} scope="col" style={cell}>{year}</th>)}
    </tr></thead><tbody>{data.map(([title,...values],i)=><tr key={title}><th scope="row" style={cell}>{title}</th>
      {values.map((value,j)=>{
        if (value===masked) return <td key={j} style={hiddenCell} aria-label="網掛けの非表示部分"/>;
        if (value==='［b］' || value==='［c］') return i===first
          ? <td key={j} rowSpan={size} style={{...cell,textAlign:'center'}}><Blank name={value[1]}/></td> : null;
        return <td key={j} style={{...cell,textAlign:'end'}}>{value}</td>;
      })}
    </tr>)}</tbody></table>
    <p style={{color:ink}}>{maskNote}<br/>{pvNote}</p>
  </div></Native>;
}

function Examples(props:Props) {
  const numbers=[7,6,5,4,3,2,1,0];
  return <Native {...props}><div style={{...centered,border,padding:'0.5em',display:'flex',gap:'1.3em'}}>
    {bitExamples(props.values[0]).map(({data,mask,positions,result},i)=><table key={i} aria-label={'例'+(i+1)}
      style={{...tableStyle,textAlign:'center',fontFamily:'monospace'}}><thead>
        <tr><th colSpan={9} style={{textAlign:'start'}}>{'（例'+(i+1)+'）'}</th></tr>
        <tr><th>ビット番号</th>{numbers.map(bit=><th key={bit} scope="col" style={{paddingInline:'0.22em'}}>{bit}</th>)}</tr>
      </thead><tbody>
        <tr><th scope="row">Data</th>{[...data].map((value,j)=><td key={j} style={{background:positions.includes(7-j)?'var(--soft-border)':undefined}}>{value}</td>)}</tr>
        <tr aria-hidden="true"><td/>{numbers.map(bit=><td key={bit}>{positions.includes(bit)?'│':''}</td>)}</tr>
        <tr><th scope="row">Mask</th>{[...mask].map((value,j)=><td key={j} style={{background:positions.includes(7-j)?'var(--soft-border)':undefined}}>{value}</td>)}</tr>
        <tr><th scope="row">返却値</th><td colSpan={8} style={{textAlign:'start'}}>{result}</td></tr>
      </tbody></table>)}
  </div></Native>;
}

function ProgramLines({lines,withCost}:{lines:readonly ProgramLine[];withCost:boolean}) {
  return <div style={{...mono,display:'grid',gridTemplateColumns:withCost?'max-content max-content':'max-content',columnGap:'1em'}}>
    {withCost&&<><span>（処理量）</span><span/></>}
    {lines.map((row,i)=><ProgramLineRow key={i} {...{row,withCost}}/>)}
  </div>;
}
function ProgramLineRow({row,withCost}:{row:ProgramLine;withCost:boolean}) {
  return <>
    {withCost&&<span style={{textAlign:'end'}}>{row.cost}</span>}
    <span data-code-row={row.text}>{row.text.split(/(［[ab]］)/).map((piece,i)=>i%2
      ? <Blank name={piece[1]} key={i}/> : piece)}{row.alpha&&<span aria-label="αの行">　←────── α</span>}</span>
  </>;
}
function Program(props:Props) {
  const i=props.values[0], one=props.id==='8-program-one';
  const lines=one?programOne:props.id==='8-program-two'?programTwo(i):programThree(i);
  return <Native {...props} visible={false}><div style={centered}>
    <div style={{color:ink}}>{props.caption}</div><ProgramLines {...{lines}} withCost={!one}/>
  </div></Native>;
}
function Fixes(props:Props) {
  return <Native {...props} visible={false}><div style={{...centered,display:'flex',gap:'2em'}}>
    {fixes.map(({title,lines})=><div key={title}><div style={{color:ink}}>{title}</div>
      <ProgramLines {...{lines}} withCost={false}/></div>)}
  </div></Native>;
}
function ChoiceFigure({id,values,caption}:BookletFigureProps & {id:OptionDrawingId}) {
  const cells=optionCells(id,values[0],values[1]);
  const vertical=id!=='5-ab-option', rows=vertical?cells.map(value=>[value]):[cells];
  return <Frame {...{caption}} alt={cells.join('｜')} visible={false}>
    <table aria-label={caption} style={{...tableStyle,marginInline:'auto'}}><tbody>
      {rows.map((row,i)=><tr key={i}>{row.map((value,j)=><td key={j} style={{...cell,textAlign:vertical?'end':'center'}}>{value}</td>)}</tr>)}
    </tbody></table>
  </Frame>;
}

const components:Record<DrawingId,(props:Props)=>ReactNode> = {
  '5-applicant-record':RecordLayout, '5-school-record':RecordLayout, '5-flow':ApplicantFlow,
  '5-match-table':MatchTable, '5-flow-extra':ApplicantFlow, '6-plan-table':ProgressTable, '6-actual-table':ProgressTable,
  '7-lump-table':CashTable, '7-split-table':CashTable, '8-examples':Examples, '8-program-one':Program,
  '8-program-two':Program, '8-program-three':Program, '8-fix-options':Fixes,
};
export const legacy2012SpringPm0508FigureRenderers: readonly BookletFigureRenderer[] = [
  ...drawingIds.map(id=>{const Component=components[id];return {
    profile:spring2012Pm0508Profile(id), component:(props:BookletFigureProps)=><Component {...props} {...{id}}/>,
  };}),
  ...optionDrawingIds.map(id=>({
    profile:spring2012Pm0508Profile(id), component:(props:BookletFigureProps)=><ChoiceFigure {...props} {...{id}}/>,
  })),
];
