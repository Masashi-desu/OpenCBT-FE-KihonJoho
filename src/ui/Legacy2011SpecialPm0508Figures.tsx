import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  answerPrograms, drawingAlt, drawingIds, files, optionIds, profile, programs, reportLabels, type DrawingId,
} from '../core/generators/legacy-2011-special-pm-05-08-figures';
import { combinationAt } from '../core/generators/legacy-2011-special-pm-05-08-model';

type Props = BookletFigureProps & { id: DrawingId };
const ink = 'var(--diagram-ink)', surface = 'var(--surface)', shade = 'var(--soft-border)';
const cell = { border: '1px solid currentColor', padding: '.25em .4em', whiteSpace: 'nowrap' } as const;
const matrixStyle = { borderCollapse: 'collapse', width: 'max-content', color: ink, marginInline: 'auto' } as const;

function Frame({id,values,caption,children,before=false,note}:Props & {children:ReactNode;before?:boolean;note?:string}) {
  const label=<figcaption className={id.startsWith('8-option')?'sr-only':undefined}>{caption}</figcaption>;
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    {before&&label}
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    {note&&<p>{note}</p>}
    {!before&&label}
  </figure>;
}

function Svg({width,height,children}:{width:number;height:number;children:(arrow:string)=>ReactNode}) {
  const id=useId();
  return <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} style={{
    color:ink,width:`calc(${width}px * var(--image-scale, 1))`,maxWidth:'none',height:'auto',display:'block',marginInline:'auto',
  }}>
    <defs><marker id={id} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M1 1L6 3.5L1 6" fill="none" stroke="currentColor"/>
    </marker></defs>
    {children('url(#'+id+')')}
  </svg>;
}
function Text({x,y,children}:{x:number;y:number;children:ReactNode}) {
  return <text x={x} y={y} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}

function Records(props: Props) {
  return <Frame {...props}>
    <div style={{display:'grid',gridTemplateColumns:'max-content max-content',columnGap:'1.5em',rowGap:'.65em',
      width:'max-content',marginInline:'auto',fontSize:'calc(1em * var(--image-scale, 1))'}}>
      {files.map(([name,columns],i)=><table key={name} style={{...matrixStyle,marginInline:0,...(i===2?{gridColumn:'1 / -1'}:{})}}>
        <caption style={{textAlign:'left'}}>{name}</caption>
        <tbody><tr>{columns.map(field=><th key={field} scope="col" style={cell}>{field}</th>)}</tr></tbody>
      </table>)}
    </div>
  </Frame>;
}

type NodeKind = 'process'|'module'|'file'|'report'|'start'|'loop-start'|'loop-end'|'test';
function Node({x,y,text,kind,width=156,height=30}:{x:number;y:number;text:string;kind:NodeKind;width?:number;height?:number}) {
  const [left,top,right,bottom] = [x-width/2,y-height/2,x+width/2,y+height/2];
  let outline:ReactNode;
  if(kind==='file') outline=<path d={`M${left+8} ${top}H${right-8}Q${right+8} ${y} ${right-8} ${bottom}H${left+8}Q${left-8} ${y} ${left+8} ${top}M${right-8} ${top}Q${right-23} ${y} ${right-8} ${bottom}`}/>;
  else if(kind==='report') outline=<path d={`M${left} ${top}H${right}V${bottom-5}Q${x+width/4} ${bottom-19} ${x} ${bottom-5}T${left} ${bottom-5}Z`}/>;
  else if(kind==='test') outline=<path d={`M${x} ${top}L${right} ${y}L${x} ${bottom}L${left} ${y}Z`}/>;
  else if(kind==='loop-start') outline=<path d={`M${left} ${top+11}L${left+20} ${top}H${right-20}L${right} ${top+11}V${bottom}H${left}Z`}/>;
  else if(kind==='loop-end') outline=<path d={`M${left} ${top}H${right}V${bottom-11}L${right-20} ${bottom}H${left+20}L${left} ${bottom-11}Z`}/>;
  else outline=<rect x={left} y={top} width={width} height={height} rx={kind==='start'?height/2:undefined}/>;
  const lines=text.split('\n');
  return <g>
    <g fill={surface} stroke="currentColor" strokeWidth="1.4">{outline}
      {kind==='module'&&<path d={`M${left+11} ${top}V${bottom}M${right-11} ${top}V${bottom}`}/>}
      {kind==='test'&&<rect x={x-38} y={y-10} width={76} height={20} fill={text?surface:shade}/>}
    </g>
    {lines.map((line,i)=><Text key={i} x={x} y={y+4+(i-(lines.length-1)/2)*16}>{line}</Text>)}
  </g>;
}
function InputsAndOutputs(props: Props) {
  return <Frame {...props}><Svg width={440} height={310}>{arrow=><g fontSize="14">
    <g fill="none" stroke="currentColor" strokeWidth="1.4" markerEnd={arrow}>
      <path d="M105 53V67"/><path d="M105 102V122"/>
      <path d="M105 165v19h69v25"/><path d="M335 165v19h-69v25"/>
      <path d="M174 242v13h-69v11"/><path d="M266 242v13h69v11"/>
    </g>
    <Node x={105} y={32} text={'売上伝票\nファイル'} kind="file" width={118} height={42}/>
    <Node x={105} y={84} text="整列" kind="process" width={112} height={34}/>
    <Node x={105} y={144} text={'作業\nファイル'} kind="file" width={118} height={42}/>
    <Node x={335} y={144} text={'顧客マスタ\nファイル'} kind="file" width={118} height={42}/>
    <Node x={220} y={225} text="あて先作成" kind="module" width={130} height={32}/>
    <Node x={105} y={286} text={'あて先\nファイル'} kind="file" width={118} height={40}/>
    <Node x={335} y={286} text="合計表" kind="report" width={115} height={40}/>
  </g>}</Svg></Frame>;
}
const omitted = '注　網掛けの部分は，表示していない。';
function Flow(props: Props) {
  const x1=110,x2=348,x3=590;
  return <Frame {...props} note={omitted}><Svg width={737} height={470}>{arrow=><g fontSize="14">
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d={`M${x1} 26V168M${x2} 25V448M${x3} 25V320`}/>
      <path d={`M${x2+78} 174h24v77h-102M${x2+78} 288h24v75h-102M${x3+78} 145h24v74h-102`} />
      {[ [x2,251],[x2,363],[x3,219] ].map(([x,y])=><path key={y} d={`M${x+10} ${y}H${x}`} markerEnd={arrow}/>)}
    </g>
    {['あて先作成','初期処理','主処理','終了処理','終了'].map((text,i)=>
      <Node key={text} x={x1} y={26+i*35} text={text} kind={i===0||i===4?'start':'module'}/>)}
    <Node x={x2} y={26} text="主処理" kind="start"/>
    <Node x={x2} y={67} text={'繰返し1\n終了条件 α'} kind="loop-start" height={41}/>
    <Node x={x2} y={107} text="前処理" kind="module"/>
    <Node x={x2} y={143} text="顧客処理" kind="module" height={25}/>
    <Node x={x2} y={174} text="a" kind="test" height={40}/>
    <Node x={x2} y={228} text="招待券処理" kind="module" height={27}/>
    <Node x={x2} y={288} text="b" kind="test" height={43}/>
    <Node x={x2} y={342} text="あて先処理" kind="module" height={26}/>
    <Node x={x2} y={395} text="繰返し1" kind="loop-end" height={42}/>
    <Node x={x2} y={448} text="終了" kind="start"/>
    <Node x={x3} y={26} text="顧客処理" kind="start"/>
    <Node x={x3} y={67} text={'繰返し2\n終了条件 β'} kind="loop-start" height={41}/>
    <Node x={x3} y={107} text="金額集計処理" kind="module"/>
    <Node x={x3} y={145} text="" kind="test" height={40}/>
    <Node x={x3} y={197} text="応募券処理" kind="module" height={26}/>
    <Node x={x3} y={240} text="売上伝票処理" kind="module" height={28}/>
    <Node x={x3} y={280} text="繰返し2" kind="loop-end" height={38}/>
    <Node x={x3} y={320} text="終了" kind="start"/>
    {[ [x2,174],[x2,288],[x3,145] ].map(([x,y])=><g key={y}>
      <Text x={x+89} y={y-7}>No</Text><Text x={x+18} y={y+34}>Yes</Text>
    </g>)}
  </g>}</Svg></Frame>;
}
function Output(props: Props) {
  return <Frame {...props} note={omitted}><Svg width={457} height={144}>{()=><g fontSize="14">
    <g fill={surface} stroke="currentColor" strokeWidth="1.3">
      <path d="M16 6H441V114Q327 81 223 114T16 114Z"/>
      <path d="M43 35H414V100H43ZM294 35V100M43 56H414M43 78H414"/>
      {[0,1,2].map(i=><rect key={i} x={315} y={38+i*21.5} width={78} height={15} fill={i===0?shade:surface}/>)}
    </g>
    <Text x={227} y={25}>合計表</Text>
    {reportLabels.map((label,i)=><Text key={label} x={168} y={51+i*21.5}>{label}</Text>)}
    <Text x={354} y={71}>c</Text><Text x={354} y={93}>d</Text>
  </g>}</Svg></Frame>;
}
function ExampleMatrix(props: Props) {
  return <Frame {...props} before><table style={matrixStyle}>
    <thead><tr><th style={cell}>プレイヤA ＼ プレイヤB</th><th style={cell}>戦略 B-1</th><th style={cell}>戦略 B-2</th></tr></thead>
    <tbody>{['戦略 A-1','戦略 A-2'].map((name,i)=><tr key={name}>
      <th scope="row" style={cell}>{name}</th>
      {[0,1].map(j=><td key={j} style={{...cell,...(i===0&&j===0?{background:shade}:{})}}>
        （プレイヤAの利得，<br/>プレイヤBの利得）
      </td>)}
    </tr>)}</tbody>
  </table></Frame>;
}

function Bits(props: Props) {
  const {n,selected}=combinationAt(props.values[0]), offset=58*n+99;
  return <Frame {...props}><Svg width={offset+164+n*29} height={94}>{()=><g fontSize="15">
    <Text x={27} y={51}>(1)</Text><Text x={offset-35} y={51}>(2)</Text>
    <Text x={offset+14} y={51}>配列S</Text><Text x={offset+14} y={74}>（要素番号）</Text>
    {Array.from({length:n},(_,i)=>{
      const x=66+58*i, array=offset+79+29*i, chosen=selected.includes(i+1);
      return <g key={i}>
        {chosen&&<Text x={x} y={22}>選択</Text>}
        <text x={x} y={55} textAnchor="middle" fill="currentColor" fontSize="31">{chosen?'★':'☆'}</text>
        <Text x={x} y={75}>{i+1}</Text>
        <rect x={array} y={35} width={29} height={24} fill={surface} stroke="currentColor"/>
        <Text x={array+14.5} y={52}>{Number(chosen)}</Text>
        <Text x={array+14.5} y={75}>{i+1}</Text>
      </g>;
    })}
  </g>}</Svg></Frame>;
}

type Sheet = ReturnType<typeof programs>[number];
const rowHeight=24;
const xForDepth=(depth:number)=>25+22*depth;
const yForRow=(row:number)=>20+rowHeight*row;

function ProgramSheet({sheet,wide}:{sheet:Sheet;wide:boolean}) {
  const width=wide?760:335, height=yForRow(sheet.lines.length-1)+14;
  return <Svg width={width} height={height}>{()=><g fontFamily="Monaco, Consolas, monospace" fontSize="15">
    {sheet.alpha&&<g fill="none" stroke="currentColor">
      <rect data-alpha="true" x="8" y={yForRow(4)-17} width="338" height={rowHeight*4} strokeDasharray="5 3"/>
      <path d={`M571 ${yForRow(6)-14}H366m14 -7 -14 7 14 7`} strokeWidth="2"/>
      <text x="587" y={yForRow(6)-9} fill="currentColor" stroke="none">α</text>
    </g>}
    {sheet.rails.map(({kind,depth,start,end,divider})=>{
      const x=xForDepth(depth), y1=yForRow(start)-5, y2=yForRow(end)-5;
      return <g key={start} data-control={kind} data-start={start} data-end={end} fill="currentColor">
        <path d={`M${x} ${y1}V${y2}`} fill="none" stroke="currentColor"/>
        {kind==='loop'?<>
          <rect x={x-6} y={y1-6} width="12" height="12"/><rect x={x-6} y={y2-6} width="12" height="12"/>
        </>:<>
          <path d={`M${x-7} ${y1+5}l7 -12 7 12ZM${x-7} ${y2-5}l7 12 7 -12Z`}/>
          {divider!==undefined&&<path d={`M${x-6} ${yForRow(divider)-5}h40`} fill="none" stroke="currentColor"/>}
        </>}
      </g>;
    })}
    {sheet.lines.map(({text,depth=0,kind,comment},i)=>text&&<g key={i} data-program-line={i}>
      <text x={xForDepth(depth)+(kind==='declaration'?-10:kind==='step'?-4:15)} y={yForRow(i)} fill="currentColor">
        {kind==='declaration'?'○':kind==='step'?'・':''}{text}
      </text>
      {comment&&<text x={395} y={yForRow(i)} fill="currentColor">{comment}</text>}
    </g>)}
  </g>}</Svg>;
}
function Program(props: Props) {
  const sheets=props.id==='8-code'?programs(props.values[0]):[answerPrograms[optionIds.indexOf(props.id as typeof optionIds[number])]];
  return <Frame {...props} before>
    <div style={{width:'max-content',marginInline:'auto'}}>
      {sheets.map((sheet,i)=><ProgramSheet key={i} sheet={sheet} wide={props.id==='8-code'}/>)}
    </div>
  </Frame>;
}

function Drawing(props: Props) {
  switch (props.id) {
    case '5-files':return <Records {...props}/>;
    case '5-input-output':return <InputsAndOutputs {...props}/>;
    case '5-flow':return <Flow {...props}/>;
    case '5-output':return <Output {...props}/>;
    case '7-matrix-example':return <ExampleMatrix {...props}/>;
    case '8-bits':return <Bits {...props}/>;
    default:return <Program {...props}/>;
  }
}

export const legacy2011SpecialPm0508FigureRenderers: readonly BookletFigureRenderer[] = drawingIds.map(id=>({
  profile:profile(id),component:props=><Drawing {...props} id={id}/>,
}));
