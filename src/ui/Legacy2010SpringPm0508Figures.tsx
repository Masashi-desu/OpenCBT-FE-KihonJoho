import { useId,type ReactNode } from 'react';
import type { BookletFigureProps,BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  codeText,curveIds,drawingAlt,drawingIds,forceLabels,messages,optionIds,optionSheets,profile,programSheets,
  rateFormula,sortEdges,sortTree,type DrawingId,type RecordId,type Sheet,
} from '../core/generators/legacy-2010-spring-pm-05-08-figures';
import { deliveryAt,deliveryDate,deliveryDestinations,deliveryLayouts } from '../core/generators/legacy-2010-spring-pm-05-08-model';

type Props=BookletFigureProps & {id:DrawingId};
const ink='var(--diagram-ink)', surface='var(--surface)';
function Frame({id,values,caption,children}:Props & {children:ReactNode}){
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawingAlt(id,values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>{children}</div>
    <figcaption className={id.startsWith('6-curve-')||id.startsWith('8-option-')?'sr-only':undefined}>{caption}</figcaption>
  </figure>;
}
function Svg({width,height,title,description,children}:{width:number;height:number;title:string;description:string;children:(arrow:string)=>ReactNode}){
  const id=useId(), marker=id+'-arrow', t=id+'-title',d=id+'-desc';
  return <svg role="img" aria-labelledby={t} aria-describedby={d} viewBox={'0 0 '+width+' '+height}
    style={{color:ink,width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',display:'block',marginInline:'auto'}}>
    <title id={t}>{title}</title><desc id={d}>{description}</desc>
    <defs><marker id={marker} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M1 1L8 4.5L1 8" fill="none" stroke="currentColor" strokeWidth="1.4"/>
    </marker></defs>
    <g fontSize="15">{children('url(#'+marker+')')}</g>
  </svg>;
}
function Graphic(props:Props & {width:number;height:number;children:(arrow:string)=>ReactNode}){
  return <Frame {...props}><Svg title={props.caption} description={drawingAlt(props.id,props.values[0])} width={props.width} height={props.height}>
    {props.children}
  </Svg></Frame>;
}
function Text({x,y,children,anchor='middle'}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end'}){
  return <text x={x} y={y} fill="currentColor" textAnchor={anchor} stroke="none">{children}</text>;
}
const messagesY=[48,59,108,118,157,169,213,224,268,286,331,347];
function Messages(props:Props){
  const middle=['担当者','管理システム'] as const;
  return <Graphic {...props} width={890} height={379}>{arrow=><>
    <g fill={surface} stroke="currentColor" strokeWidth="1.5">
      <rect x="12" y="16" width="83" height="235"/><rect x="12" y="268" width="83" height="99"/>
      <rect x="399" y="16" width="95" height="351"/><rect x="789" y="16" width="94" height="351"/>
    </g>
    {['顧客','業者'].map((label,i)=><Text key={label} x={53} y={i===0?36:291}>{label}</Text>)}
    {middle.map((label,i)=><Text key={label} x={i===0?446:835} y={38}>{label}</Text>)}
    {messages.map(([from,to,label],i)=>{
      const right=from==='管理システム'||to==='管理システム', left=right?494:95, far=right?789:399;
      const forward=from==='顧客'||from==='業者'||to==='管理システム';
      const y=messagesY[i];
      return <g key={label} data-step={i+1}>
        <line x1={forward?left:far} x2={forward?far:left} y1={y} y2={y} stroke="currentColor" markerEnd={arrow}/>
        <Text x={left+10} y={y-7} anchor="start">{label}</Text>
      </g>;
    })}
  </>}</Graphic>;
}
function Records(props:Props){
  const fields=deliveryLayouts(props.values[0])[props.id as RecordId];
  return <Frame {...props}>
    <div role="list" aria-label={props.caption} style={{
      display:'flex',width:'max-content',marginInline:'auto',fontSize:'calc(1em * var(--image-scale, 1))',color:ink,
      borderBlock:'1px solid currentColor',borderInlineStart:'1px solid currentColor',
    }}>
      {fields.map(label=><div key={label} role="listitem" style={{borderInlineEnd:'1px solid currentColor',padding:'.38em .45em',whiteSpace:'nowrap'}}>{label}</div>)}
    </div>
  </Frame>;
}
const reportCell={padding:'.36em .45em',textAlign:'left',verticalAlign:'top',whiteSpace:'nowrap'} as const;
function Report(props:Props){
  const {carrier,issue,reservations,items,item}=deliveryAt(props.values[0]);
  const headings=['No.','配達先情報','予約番号',item+'の個数',item+'番号'];
  return <Frame {...props}><div style={{color:ink,width:'max-content',marginInline:'auto',fontSize:'calc(1em * var(--image-scale, 1))',border:'1px solid currentColor',padding:'.45em'}}>
    <p style={{textAlign:'center'}}>配達依頼リスト</p>
    <div style={{display:'flex',justifyContent:'space-between',gap:'1em'}}>
      <p>業者名　{carrier}</p><div>作成日　{deliveryDate(issue)}<br/>配達予定日　{deliveryDate(issue+1)}<br/>配達先件数　3</div>
    </div>
    <table aria-label="配達依頼リストの内訳" style={{borderCollapse:'collapse',marginBlockStart:'.35em'}}>
      <thead><tr style={{borderBlock:'1px dashed currentColor'}}>
        {headings.map(label=><th key={label} scope="col" style={reportCell}>{label}</th>)}
      </tr></thead>
      <tbody>{deliveryDestinations.map(([address,name],i)=><tr key={address} style={{borderBlockEnd:'1px dashed currentColor'}}>
        <th scope="row" style={reportCell}>{i+1}</th><td style={reportCell}>{address}<br/>{name}</td>
        <td style={reportCell}>{reservations[i]}</td><td style={reportCell}>{items[i].length}</td>
        <td style={reportCell}>{items[i].map(number=><div key={number}>{number}</div>)}</td>
      </tr>)}<tr><th scope="row" style={reportCell}>3</th>{headings.slice(1).map(label=><td key={label} style={reportCell}>⋮</td>)}</tr></tbody>
    </table>
  </div></Frame>;
}
function Processing(props:Props){
  const box=(x:number,y:number,label:string)=> <g key={label}>
    <rect x={x-51} y={y-20} width={102} height={40} fill={surface} stroke="currentColor" strokeWidth="1.4"/>
    <Text x={x} y={y+5}>{label}</Text>
  </g>;
  const file=(x:number,y:number,lines:readonly string[])=> <g>
    <path d={'M'+(x-52)+' '+(y-30)+'h122l-18 60h-122Z'} fill={surface} stroke="currentColor" strokeWidth="1.4"/>
    {lines.map((line,i)=><Text key={i} x={x} y={y+5+(i-(lines.length-1)/2)*20}>{line}</Text>)}
  </g>;
  return <Graphic {...props} width={848} height={422}>{()=><>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M138 107H163M265 107H296M398 107H430M532 107H564M404 42L430 107"/>
      <path d="M666 107C810 165 625 163 405 159S-52 171 20 226L35 233"/>
      <path d="M138 236H163M265 236H288M138 236L208 356H430M407 236L430 356M390 306L430 356M532 356H578"/>
    </g>
    {file(76,107,['ファイルA'])}
    <g>{file(347,42,[])}<rect x="305" y="27" width="84" height="30" fill={surface} stroke="currentColor" strokeWidth="1.4"/><Text x={347} y={47}>c</Text></g>
    {[[214,'B'],[347,'C'],[481,'D'],[615,'E']].map(([x,name])=>box(Number(x),107,'処理'+name))}
    {file(76,236,['中間','ファイル'])}{box(214,236,'処理F')}{file(347,236,['集計結果','ファイル'])}
    {file(333,306,['業者','ファイル'])}{box(481,356,'処理G')}
    <path d="M578 328H705V384Q673 368 642 384T578 384Z" fill={surface} stroke="currentColor" strokeWidth="1.4"/>
    <Text x={641} y={348}>配達依頼</Text><Text x={641} y={369}>リスト</Text>
  </>}</Graphic>;
}
function Formula(props:Props){
  const f=rateFormula(props.id as '6-design-rate'|'6-manufacture-rate');
  return <Graphic {...props} width={710} height={94}>{()=> <>
    <Text x={8} y={50} anchor="start">{f.label+' ＝'}</Text>
    <Text x={455} y={29}>{f.numerator}</Text>
    <path d="M284 43H626" stroke="currentColor"/>
    <Text x={455} y={68}>{f.denominator}</Text>
    <Text x={669} y={50}>×100</Text>
  </>}</Graphic>;
}
const chartCurves=[
  'M177 191 C194 143 223 131 261 130 C316 128 368 123 399 112 C445 96 460 65 470 42',
  'M177 191 C223 183 250 169 267 139 C281 112 281 89 303 76 C335 57 357 59 391 59 H470',
  'M177 191 L470 42',
];
function Curve(props:Props){
  const i=curveIds.findIndex(id=>id===props.id);
  return <Graphic {...props} width={535} height={267}>{arrow=><>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M177 191V22" markerEnd={arrow}/><path d="M177 191H519" markerEnd={arrow}/>
      <path d="M177 42H517M470 24V215" strokeDasharray="4 3"/>
      <path d="M151 42H177M470 226V192" markerEnd={arrow}/>
      <path d={chartCurves[i]} strokeWidth="2"/>
    </g>
    <text data-forecast-label="" x="3" y="47" fill="currentColor" fontSize="14">残存バグ件数の予測値</text>
    <text data-vertical-axis="" x="148" y="57" fill="currentColor" fontSize="14" style={{writingMode:'vertical-rl'}}>バグ摘出件数（累積）</text>
    <text data-vertical-zero="" x="165" y="187" fill="currentColor" textAnchor="middle">0</text>
    <Text x={185} y={209}>0</Text>
    <Text x={326} y={218}>検査項目の完了数</Text>
    <Text x={470} y={247}>検査項目総数</Text>
  </>}</Graphic>;
}
function Forces(props:Props){
  const labels=forceLabels(props.values[0]);
  const positions=[[298,12,316,97],[12,191,238,128],[298,191,316,128],[662,191,238,128],[298,403,316,97]] as const;
  return <Graphic {...props} width={912} height={510}>{()=> <>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M429 115H482V155H518L455 183L392 155H429Z"/>
      <path d="M429 394H482V355H518L455 328L392 355H429Z"/>
      <path d="M255 230H270V209L291 255L270 301V279H255Z"/>
      <path d="M655 230H640V209L619 255L640 301V279H655Z"/>
    </g>
    {labels.map(([title,description],i)=>{
      const [x,y,w,h]=positions[i], blank=/^［([cde])］，(.+)$/.exec(description);
      const lines=i===2?['中小企業を含めて競合が多く，','厳しい競争を繰り返している。']:
        i===3?['競争業者が多く，製品も類似','しているので，買い手の','交渉力が強い。']:[];
      return <g key={title}>
        <rect x={x} y={y} width={w} height={h} fill={surface} stroke="currentColor" strokeWidth="1.4"/>
        <text x={x+w/2} y={y+25} fill="currentColor" textAnchor="middle" textDecoration="underline">{title}</text>
        {blank?<g>
          <rect x={x+13} y={y+46} width="51" height="27" fill={surface} stroke="currentColor" strokeWidth="1.4"/>
          <Text x={x+38} y={y+64}>{blank[1]}</Text>
          {i===1?<><Text x={x+70} y={y+64} anchor="start">，売り手の</Text><Text x={x+16} y={y+94} anchor="start">{blank[2].slice(4)}</Text></>:
            <Text x={x+70} y={y+64} anchor="start">{'，'+blank[2]}</Text>}
        </g>:lines.map((line,j)=><Text key={line} x={x+w/2} y={y+55+j*22}>{line}</Text>)}
      </g>;
    })}
  </>}</Graphic>;
}
function SortTree(props:Props){
  const nodes=sortTree(props.values[0]), lookup=new Map(nodes.map(node=>[node.id,node])), cell=30,cellHeight=27;
  return <Graphic {...props} width={815} height={493}>{arrow=><>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      {sortEdges.map(([from,to])=>{
        const a=lookup.get(from)!,b=lookup.get(to)!;
        return <path key={from+'-'+to} d={'M'+a.x+' '+(a.y+cellHeight/2)+'L'+b.x+' '+(b.y-cellHeight/2)}/>;
      })}
      <path d="M112 54V124M112 161V257M112 257V333M112 371V463" markerEnd={arrow}/><path d="M82 257H142"/>
    </g>
    <Text x={114} y={27}>プログラムの説明との対応</Text>
    <Text x={114} y={133}>プログラムの説明の</Text><Text x={114} y={154}>（2）①（分割）</Text>
    <Text x={114} y={342}>プログラムの説明の</Text><Text x={114} y={363}>（2）②（併合）</Text>
    <Text x={368} y={45}>list</Text><Text x={368} y={456}>list</Text>
    {nodes.map(({id,x,y,values})=><g key={id} data-array-values={values.join(',')}>
      {values.map((value,i)=>{
        const start=x-values.length*cell/2+i*cell;
        return <g key={i}><rect x={start} y={y-cellHeight/2} width={cell} height={cellHeight} fill={surface} stroke="currentColor"/>
          <Text x={start+cell/2} y={y+5}>{value}</Text></g>;
      })}
    </g>)}
  </>}</Graphic>;
}
function ProgramSheet({sheet,title,width}:{sheet:Sheet;title:string;width:number}){
  const isOption=width<600, rowHeight=26,y=(i:number)=>23+i*rowHeight,x=(depth:number)=>53+depth*24, end=y(sheet.rows.length-1)+18;
  return <Svg width={width} height={end} title={title} description={codeText(sheet)}>{arrow=><g fontFamily="Monaco, Consolas, monospace" fontSize="15.5">
    {sheet.beta&&<g data-beta="true">
      <rect x="18" y={y(sheet.beta[0])-17} width="547" height={rowHeight*(sheet.beta[1]-sheet.beta[0]+1)} fill="none" stroke="currentColor"/>
      <path d={'M734 '+y(20)+'H576'} fill="none" stroke="currentColor" strokeWidth="2" markerEnd={arrow}/>
      <Text x={751} y={y(20)+5}>β</Text>
    </g>}
    {sheet.rails.map(rail=>{
      const railX=x(rail.depth)-12, top=y(rail.start)-12,bottom=y(rail.end)+4;
      return <g key={rail.start} data-control={rail.kind} fill="currentColor" stroke="currentColor">
        <path d={'M'+railX+' '+(top+7)+'V'+(bottom-7)} fill="none"/>
        {rail.kind==='loop'?<><rect x={railX-5.5} y={top} width="11" height="11"/><rect x={railX-5.5} y={bottom-11} width="11" height="11"/></>:
          <><path d={'M'+railX+' '+top+'l-6 11h12Z'}/><path d={'M'+railX+' '+bottom+'l-6 -11h12Z'}/></>}
        {rail.divider!==undefined&&<path d={'M'+(railX-12)+' '+(y(rail.divider)-4)+'h24'}/>}
      </g>;
    })}
    {sheet.rows.map((row,i)=>{
      const textX=x(row.depth)+(row.align??0)*9, blankX=textX+(row.blank==='b'?159:0),blankWidth=row.blank==='b'?280:300;
      return <g key={i} data-program-line={i}>
        <text x={textX} y={y(i)} fill="currentColor" xmlSpace="preserve">{row.text}</text>
        {row.comment&&<text x={485} y={y(i)} fill="currentColor">{row.comment}</text>}
        {row.blank&&<g>
          <rect x={blankX} y={y(i)-16} width={blankWidth} height="22" fill={surface} stroke="currentColor" strokeWidth="1.3"/>
          <Text x={blankX+blankWidth/2} y={y(i)}>{row.blank}</Text>
        </g>}
      </g>;
    })}
    {sheet.alpha!==undefined&&<g data-alpha="true">
      <path d={'M735 '+(y(sheet.alpha)-7)+'H181'} fill="none" stroke="currentColor" strokeWidth="2" markerEnd={arrow}/>
      <Text x={751} y={y(sheet.alpha)}>α</Text>
    </g>}
    {isOption&&<rect x="21" y="4" width={width-39} height={end-10} fill="none" stroke="currentColor"/>}
  </g>}</Svg>;
}
function Programs(props:Props){
  return <Frame {...props}>
    <ProgramSheet sheet={programSheets[0]} title="プログラム Sort" width={820}/>
    <ProgramSheet sheet={programSheets[1]} title="副プログラム Merge" width={820}/>
  </Frame>;
}
function OptionProgram(props:Props){
  const index=optionIds.findIndex(id=>id===props.id);
  return <Frame {...props}><ProgramSheet sheet={optionSheets[index]} title={props.caption} width={466}/></Frame>;
}
const components:Record<DrawingId,(props:Props)=>ReactNode>={
  '5-messages':Messages,'5-accept':Records,'5-carrier':Records,'5-region':Records,'5-reservation':Records,'5-totals':Records,
  '5-report':Report,'5-processing':Processing,'6-design-rate':Formula,'6-manufacture-rate':Formula,
  '6-curve-a':Curve,'6-curve-i':Curve,'6-curve-u':Curve,'7-forces':Forces,'8-tree':SortTree,'8-programs':Programs,
  '8-option-a':OptionProgram,'8-option-i':OptionProgram,'8-option-u':OptionProgram,'8-option-e':OptionProgram,
};
export const legacy2010SpringPm0508FigureRenderers:readonly BookletFigureRenderer[]=drawingIds.map(id=>({
  profile:profile(id),component:props=>{const Component=components[id];return <Component {...props} id={id}/>;},
}));
