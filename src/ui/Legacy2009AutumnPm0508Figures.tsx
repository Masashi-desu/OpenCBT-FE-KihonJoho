import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { drawingAlt, drawingIds, profile, type DrawingId } from '../core/generators/legacy-2009-autumn-pm-05-08-figures';
import { ticketAt } from '../core/generators/legacy-2009-autumn-pm-5-model';
import { coefficientArrays, newtonAt, newtonPrograms, partialFormula, type ProgramId } from '../core/generators/legacy-2009-autumn-pm-8-model';

type Props = BookletFigureProps & { id: DrawingId };
const surface = 'var(--surface)';
const ink = 'var(--diagram-ink)';

function Frame({id, values, caption, children}: Props & { children: ReactNode }) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Drawing(props: Props & { width:number; height:number; children:(arrow:string, triangle:string)=>ReactNode }) {
  const uid=useId(), {width,height,caption,children}=props;
  const title=uid+'-title', description=uid+'-desc', arrow=uid+'-arrow', triangle=uid+'-triangle';
  return <Frame {...props}><svg viewBox={'0 0 '+width+' '+height} role="img" aria-labelledby={title} aria-describedby={description}
    style={{ color:ink, width:'calc('+width+'px * var(--image-scale, 1))', maxWidth:'none', height:'auto', display:'block', marginInline:'auto' }}>
    <title id={title}>{caption}</title><desc id={description}>{drawingAlt(props.id,props.values[0])}</desc>
    <defs>
      <marker id={arrow} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1L8 4.5L1 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      <marker id={triangle} markerWidth="15" markerHeight="15" refX="14" refY="7.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1L14 7.5L1 14Z" fill={surface} stroke="currentColor" strokeWidth="1.5" />
      </marker>
    </defs>
    <g fontSize="16">{children('url(#'+arrow+')','url(#'+triangle+')')}</g>
  </svg></Frame>;
}
function Label({x,y,children,anchor='middle'}: {
  x:number; y:number; children:ReactNode; anchor?:'start'|'middle'|'end';
}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={anchor}>{children}</text>;
}
function Blank({x,y,label,width=90}: {x:number; y:number; label:string; width?:number}) {
  return <g data-blank={label}>
    <rect x={x-width/2} y={y-17} width={width} height="23" fill={surface} stroke="currentColor" strokeWidth="1.6"/>
    <Label x={x} y={y}>{label}</Label>
  </g>;
}
function ClassBox({x,y,width,name,attributes=[],operations=[],emptyAttribute=false}: {
  x:number; y:number; width:number; name:string; attributes?:readonly string[]; operations?:readonly string[]; emptyAttribute?:boolean;
}) {
  const head=34, row=22;
  const attrHeight=Math.max(attributes.length,1)*row;
  const height=head+attrHeight+Math.max(operations.length,1)*row+4;
  return <g>
    <rect x={x} y={y} width={width} height={height} fill={surface} stroke="currentColor" strokeWidth="1.5"/>
    <path d={'M'+x+' '+(y+head)+'h'+width+'m'+(-width)+' '+attrHeight+'h'+width} fill="none" stroke="currentColor" strokeWidth="1.5"/>
    {/^[abc]$/.test(name) ? <Blank x={x+width/2} y={y+23} label={name}/> : <Label x={x+width/2} y={y+23}>{name}</Label>}
    {!emptyAttribute && attributes.map((value,i)=><Label key={value} x={x+10} y={y+head+16+i*row} anchor="start">{value}</Label>)}
    {operations.map((value,i)=>{
      const lineY=y+head+attrHeight+17+i*row;
      return /^［[dfg]］$/.test(value)
        ? <Blank key={value} x={x+70} y={lineY} label={value[1]} width={112}/>
        : <Label key={i} x={x+10} y={lineY} anchor="start">{value}</Label>;
    })}
  </g>;
}
function Analysis(props:Props) {
  const c=ticketAt(props.values[0]);
  return <Drawing {...props} width={1090} height={790}>{(_, triangle)=><>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M335 117V220M156 272H260M410 272H545M565 126V220M695 126V220M630 344V420M335 302V475H545M715 475H815" />
      <path d="M805 566V530H985V566" />
      <path d="M890 530V502" markerEnd={triangle} />
      <path d="M402 667H569" />
    </g>
    <ClassBox x={260} y={35} width={150} name="顧客" attributes={['氏名']} />
    <ClassBox x={20} y={220} width={136} name="社員" attributes={['氏名']} />
    <ClassBox x={260} y={220} width={150} name="b" attributes={['発券日時']} />
    <ClassBox x={545} y={22} width={170} name="a" attributes={['名称','所在地']} />
    <ClassBox x={545} y={220} width={170} name="c" attributes={[c.service+'名',c.departure+'日時',c.arrival+'日時']} />
    <ClassBox x={545} y={420} width={170} name="座席" attributes={['番号','席種','空席状態']} />
    <ClassBox x={815} y={420} width={150} name="グレード" attributes={['価格']} />
    <ClassBox x={730} y={566} width={150} name={c.grades[1]} />
    <ClassBox x={910} y={566} width={150} name={c.grades[0]} />
    <ClassBox x={862} y={220} width={195} name="≪enumeration≫ 席種" attributes={c.seats} />
    {[
      [320,136,'1'],[313,211,'1..*'],[166,262,'1'],[235,262,'0..*'],[198,292,'販売担当者'],[434,263,'0..*'],[530,263,'1'],
      [550,147,'1'],[679,147,'1'],[536,211,'0..*'],[671,211,'0..*'],
      [615,365,'1'],[605,410,'1..*'],[311,323,'0..1'],[530,466,'1'],[744,465,'0..*'],[800,465,'1'],
      [416,660,'1'],[548,660,'0..*'],[442,689,'役割名'],[527,689,'役割名'],
    ].map(([x,y,label])=><Label key={x+'-'+y} x={Number(x)} y={Number(y)}>{label}</Label>)}
    <Label x={572} y={147} anchor="start">{'出発'+c.terminal}</Label>
    <Label x={704} y={147} anchor="start">{'到着'+c.terminal}</Label>
    <Label x={220} y={601} anchor="start">凡例</Label>
    <ClassBox x={252} y={618} width={150} name="クラスA" attributes={['属性']} operations={['操作']} />
    <ClassBox x={569} y={618} width={150} name="クラスB" attributes={['属性']} operations={['操作']} />
    <Label x={245} y={733} anchor="start">長方形はクラス，クラス間を結ぶ直線は関連を表す。</Label>
    <Label x={245} y={755} anchor="start">クラス間の多重度は線の上又は左に示す。クラスAの1個にクラスBの0個以上が関連する。</Label>
    <Label x={245} y={777} anchor="start">各クラスの近くで多重度の反対側に役割名を書くことがある。</Label>
  </>}</Drawing>;
}

const lifelines = [88,355,622,884,1050,1170] as const;
const activationRanges = [
  [[190,365],[412,550],[595,698],[745,920]], [[190,350],[412,535],[595,690],[745,880]],
  [[226,310],[446,520],[627,675],[780,835]], [[262,285],[480,500]], [[660,691]], [[815,850]],
] as const;
function wrap(text: string, columns: number) {
  return Array.from(text).reduce<string[]>((rows,character,i) => {
    if (i % columns === 0) rows.push(character);
    else rows[rows.length-1] += character;
    return rows;
  },[]);
}
function Actor({ x, y }: {x:number;y:number}) {
  return <g fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx={x} cy={y} r="7"/>
    <path d={'M'+x+' '+(y+7)+'v18m-11 -12h22m-11 12l-13 12m13-12l13 12'}/>
  </g>;
}
function Sequence(props:Props) {
  const c=ticketAt(props.values[0]);
  const inputs=[c.departure+'日時，出発地及び','到着地となる'+c.terminal+'名，',c.service+'名，グレード，人数，','席種を入力し，発券可否を','確認する。'];
  const steps = [
    [0,1,190,''],[1,2,226,'［d］'],[2,3,262,'［e］'],[3,2,285,'空席状態',true],[2,1,310,'可否',true],
    [0,1,412,'座席を確保する。'],[1,2,446,'座席を確保する。'],[2,3,480,'座席を確保する。'],[3,2,500,'座席',true],[2,1,520,'座席',true],
    [0,1,595,'顧客情報を登録する。'],[1,2,627,'顧客情報を登録する。'],[2,4,660,'顧客情報を登録する。'],[2,1,675,'顧客',true],
    [0,1,745,c.issue],[1,2,780,c.issue],[2,5,815,c.issue],
  ] as const;
  return <Drawing {...props} width={1255} height={1015}>{arrow=><>
    <Actor x={lifelines[0]} y={20}/>
    <Label x={lifelines[0]} y={72}>：販売担当者</Label>
    <path d="M25 78H150" stroke="currentColor"/>
    <g stroke="currentColor" strokeWidth="1.5">
      {lifelines.map((x,i)=><line key={x} x1={x} x2={x} y1={i===4?660:i===5?815:79} y2={920} strokeDasharray="7 5"/>)}
      {activationRanges.map((ranges,i)=>ranges.map(([top,bottom])=><rect key={i+'-'+top} x={lifelines[i]-5} y={top} width="10" height={bottom-top} fill={surface}/>))}
    </g>
    {[c.screen,c.management,'［c］'].map((label,i)=>{
      const x=lifelines[i+1];
      return <g key={label}>
        <rect x={x-110} y="39" width="220" height="40" fill={surface} stroke="currentColor" strokeWidth="1.5"/>
        <path d={'M'+(x-100)+' 71h200'} stroke="currentColor"/>
        {i===2?<><Label x={x-70} y={64}>：</Label><Blank x={x} y={64} label="c"/></>:<Label x={x} y={65}>{'：'+label}</Label>}
      </g>;
    })}
    {inputs.map((line,i)=><Label key={i} x={lifelines[0]+10} y={104+i*18} anchor="start">{line}</Label>)}
    {steps.map(([from,to,y,label,back])=>{
      const start=lifelines[from]+(from<to?5:-5);
      const end=lifelines[to]+(to>=4?-69:from<to?-5:5);
      const x=(start+end)/2;
      return <g key={y} data-message={y}>
        <line x1={start} x2={end} y1={y} y2={y} stroke="currentColor" strokeWidth="1.5" strokeDasharray={back?'6 4':undefined} markerEnd={arrow}/>
        {label.startsWith('［')?<Blank x={x} y={y-8} label={label[1]}/>:<Label x={x} y={y-7}>{label}</Label>}
        {to>=4 && <Label x={x} y={y-29}>≪create≫</Label>}
      </g>;
    })}
    <path d="M360 333H427V358H365" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd={arrow}/>
    <rect x="355" y="358" width="10" height="27" fill={surface} stroke="currentColor"/>
    <Label x={467} y={327}>発券可否を表示する。</Label>
    {[['顧客',1050,660],[c.ticket,1170,815]].map(([label,x,y])=><g key={label}>
      <rect x={Number(x)-69} y={Number(y)-19} width="138" height="38" fill={surface} stroke="currentColor" strokeWidth="1.5"/>
      <Label x={Number(x)} y={Number(y)+5}>{'：'+label}</Label>
      <path d={'M'+(Number(x)-58)+' '+(Number(y)+12)+'h116'} stroke="currentColor"/>
    </g>)}
    <Label x={30} y={949} anchor="start">凡例</Label>
    <Actor x={88} y={967}/>
    <Label x={111} y={982} anchor="start">はアクタを表す。</Label>
    <Label x={325} y={978}>：クラス名</Label><path d="M273 984H377" stroke="currentColor"/>
  </>}</Drawing>;
}
function Operations(props:Props) {
  const c=ticketAt(props.values[0]);
  return <Drawing {...props} width={895} height={260}>{()=> <>
    <ClassBox x={24} y={14} width={437} name={c.screen} emptyAttribute operations={[
      ...wrap(c.inputs+'を入力し，発券可否を確認する。',24),'座席を確保する。',c.issue,'［f］','［g］',
    ]}/>
    <ClassBox x={521} y={14} width={352} name={c.management} emptyAttribute operations={['［d］','座席を確保する。','顧客情報を登録する。',c.issue]}/>
  </>}</Drawing>;
}

function Program(props:Props) {
  const program=newtonPrograms[props.id as ProgramId], first=program.rows[0][0], last=program.rows.at(-1)![0];
  const y=(number:number)=>28+(number-first)*28+(first===1&&number>=5?18:0);
  const x=(indent:number)=>76+indent*25;
  return <Drawing {...props} width={1040} height={y(last)+23}>{()=> <g fontFamily="Monaco, Consolas, monospace" fontSize="16">
    {program.rails.map(([start,end])=><g key={start} data-control={start+'-'+end} fill="currentColor" stroke="currentColor">
      <path d={'M69 '+y(start)+'V'+y(end)} fill="none"/>
      <rect x="64" y={y(start)-10} width="10" height="10"/><rect x="64" y={y(end)-10} width="10" height="10"/>
    </g>)}
    {'omitted' in program&&program.omitted.map(({start,end,indent,label})=><g key={start} data-omitted={start+'-'+end}>
      <rect x={x(indent)} y={y(start)-16} width="340" height={y(end)-y(start)+24} fill="none" stroke="currentColor" strokeDasharray="4 3"/>
      <Label x={x(indent)+170} y={(y(start)+y(end))/2+5}>{label}</Label>
    </g>)}
    {program.rows.map(([number,indent,statement,comment])=>{
      const blank=/^(.*)［([bcd])］$/.exec(statement);
      return <g key={number} data-program-line={number}>
        <Label x={42} y={y(number)} anchor="end">{number}</Label>
        <Label x={x(indent)} y={y(number)} anchor="start">{blank?.[1]??statement}</Label>
        {blank && <Blank x={x(indent)+(blank[1].length===1?69:blank[1].length*10+61)} y={y(number)} label={blank[2]}/>}
        {comment && <Label x={540} y={y(number)} anchor="start">{comment}</Label>}
      </g>;
    })}
  </g>}</Drawing>;
}

const grid = {borderCollapse:'collapse', marginInline:'auto', color:ink, fontSize:'calc(1em * var(--image-scale, 1))', width:'max-content'} as const;
const cell = {border:'1px solid currentColor', padding:'.27em .65em', whiteSpace:'nowrap'} as const;
function Printed(props:Props) {
  const original=props.id==='8-printed-1';
  const c=newtonAt(props.values[0]);
  const rows=original?c.cubicRows:c.quarticRows;
  const shadedRows=original?c.comparison.map(line=>line-1):[1];
  return <Frame {...props}><table aria-label={props.caption} style={{...grid,fontFamily:'Monaco, Consolas, monospace'}}>
    <thead><tr>{['行番号','x','f','d'].map(heading=><th key={heading} scope="col" style={cell}>{heading}</th>)}</tr></thead>
    <tbody>{rows.map((row,i)=><tr key={i}>
      <th scope="row" style={cell}>{i+1}</th>
      {row.map((value,column)=>{
        const shaded=column===0&&shadedRows.includes(i);
        return <td key={column} data-shaded={shaded||undefined} style={{...cell,textAlign:'right',background:shaded?'var(--selected-surface)':undefined}}>
          {value}{shaded&&<span className="sr-only">（網掛け）</span>}
        </td>;
      })}
    </tr>)}</tbody>
  </table></Frame>;
}
function Coefficients(props:Props) {
  return <Frame {...props}>{coefficientArrays.map(({label,columns,cells})=><table key={label} aria-label={label} style={{...grid,marginBlockEnd:'.65em'}}>
    <thead><tr><th style={cell}>要素番号</th>{columns.map((value,i)=><th key={i} scope="col" style={cell}>{value}</th>)}</tr></thead>
    <tbody><tr><th scope="row" style={cell}>{label}</th>{cells.map((value,i)=><td key={i} style={cell}>{value}</td>)}</tr></tbody>
  </table>)}</Frame>;
}

function Partial(props:Props) {
  const c=newtonAt(props.values[0]);
  const expression=partialFormula(c.quartic,c.near);
  return <Frame {...props}>
    <div style={{color:ink,fontFamily:'Monaco, Consolas, monospace',fontSize:'calc(1em * var(--image-scale, 1))',
      width:'max-content',marginInline:'auto',display:'flex',whiteSpace:'pre'}}>
      <span style={{position:'relative',display:'inline-block',paddingBlockEnd:'calc(1.4em + 16px)',textAlign:'center'}}>
        <span>{expression}</span>
        <svg aria-hidden="true" viewBox="0 0 1000 13" preserveAspectRatio="none" width="100%" height="13"
          style={{position:'absolute',insetInlineStart:0,insetBlockStart:'1.4em'}}>
          <path d="M1 1Q1 7 13 7H489Q500 7 500 12Q500 7 511 7H987Q999 7 999 1"
            fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
        </svg>
        <span style={{position:'absolute',insetInline:0,insetBlockStart:'calc(1.4em + 12px)'}}>(A)</span>
      </span>
      <span>{' ＋ '+c.quartic[4].toFixed(1)}</span>
    </div>
  </Frame>;
}

const components: Record<DrawingId,(props:Props)=>ReactNode> = {
  '5-analysis':Analysis, '5-sequence':Sequence, '5-operations':Operations,
  '8-program-1':Program, '8-program-2':Program, '8-b':Program, '8-cd':Program,
  '8-printed-1':Printed, '8-coefficients':Coefficients, '8-printed-2':Printed, '8-partial':Partial,
};
export const legacy2009AutumnPm0508FigureRenderers: readonly BookletFigureRenderer[] = drawingIds.map(id=>({
  profile:profile(id), component:props=>{
    const Component=components[id];
    return <Component {...props} id={id}/>;
  },
}));
