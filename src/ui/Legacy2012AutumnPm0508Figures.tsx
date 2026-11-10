import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import {
  assignmentFields, autumn2012Pm0508Profile, courseRecordFields, distanceTrace, drawings, gradeFields, gradeNotes,
  inventoryReport, masked, matrixNote, railwayCode, stockColumns, stockNotes, stockRows, type DrawingId,
} from '../core/generators/legacy-2012-autumn-pm-05-08-figures';
import { courseCases, railwayModel, stationPairs } from '../core/generators/legacy-2012-autumn-pm-05-08-model';

type Props = BookletFigureProps & { id: DrawingId };
const ink = 'var(--diagram-ink)', surface = 'var(--diagram-surface)', border = '1px solid '+ink;
const cell = { border, padding:'0.3em 0.55em', whiteSpace:'nowrap' as const };
const tableStyle = { color:ink, borderCollapse:'collapse' as const, minWidth:'max-content', fontSize:'calc(0.95em * var(--image-scale, 1))' };
const hiddenCell = { ...cell, background:'var(--soft-border)' };
const mono = { color:ink, fontSize:'calc(1em * var(--image-scale, 1))', minWidth:'max-content', whiteSpace:'pre' as const };
const note = (text:string)=> <div style={{ color:ink }}>{text}</div>;

function NativeFigure({id,values,caption,children,captionVisible=true}:Props & {children:ReactNode;captionVisible?:boolean}) {
  return <figure className="managed-diagram source-figure" role="group" aria-label={caption} aria-description={drawings[id].alt(values[0])}>
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      {children}
    </div>
    <figcaption className={captionVisible?undefined:'sr-only'}>{caption}</figcaption>
  </figure>;
}
function SvgFigure({id,values,caption,width,height,children}:Props & {width:number;height:number;children:(arrow:string)=>ReactNode}) {
  const uid=useId(), arrow=uid+'-arrow';
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      <svg role="img" aria-labelledby={uid+'-title'} aria-describedby={uid+'-desc'} viewBox={`0 0 ${width} ${height}`}
        style={{color:ink,display:'block',width:`calc(${width}px * var(--image-scale, 1))`,height:'auto',maxWidth:'none',marginInline:'auto'}}>
        <title id={uid+'-title'}>{caption}</title><desc id={uid+'-desc'}>{drawings[id].alt(values[0])}</desc>
        <defs><marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor"/>
        </marker></defs>
        <g fill="none" stroke="currentColor" strokeWidth="1.15" fontSize="14" aria-hidden="true">{children(`url(#${arrow})`)}</g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Blank({value}:{value:string}) {
  return <span className="source-code-blank" data-source-blank={value} aria-label={'空欄'+value}>{value}</span>;
}
function MarkedCell({value}:{value:string}) {
  const blank=/^［([a-g])］$/.exec(value);
  if(value===masked) return <td style={hiddenCell} aria-label="網掛けの非表示部分"/>;
  return <td style={cell}>{blank?<Blank value={blank[1]}/>:value.endsWith('¹⁾')?<>{value.slice(0,-2)}<sup>1)</sup></>:value}</td>;
}
function RecordLayout(props:Props) {
  const {id,caption}=props;
  if(id==='5-grade') return <NativeFigure {...props}>
    <div style={{width:'max-content',marginInline:'auto'}}>
      <table aria-label={caption} style={tableStyle}><tbody>
        <tr>{gradeFields.map((field,i)=><td key={field} rowSpan={2} style={cell}>{i<2?<u>{field}</u>:field}</td>)}
          <td colSpan={3} style={cell}>答案1</td><td rowSpan={2} style={cell}>…</td><td colSpan={3} style={cell}>答案n</td></tr>
        <tr>{[...assignmentFields,...assignmentFields].map((name,i)=><td key={i} style={cell}>{name}</td>)}</tr>
      </tbody></table>
      {gradeNotes.map((text,i)=><div key={text} style={{color:ink}}>注記{i+1}　{text}</div>)}
    </div>
  </NativeFigure>;
  const fields=courseRecordFields[id as keyof typeof courseRecordFields], keys=id==='5-result'?2:1;
  return <NativeFigure {...props}><div style={{width:'max-content',marginInline:'auto'}}>
    <table aria-label={caption} style={tableStyle}><tbody><tr>{fields.map((field,i)=><td key={field} style={cell}>
      {i<keys?<u>{field}</u>:field}</td>)}</tr></tbody></table>
    {note('注記　下線はキー項目を表す。')}
  </div></NativeFigure>;
}

function Label({x,y,text,anchor='middle'}:{x:number;y:number;text:string;anchor?:'start'|'middle'|'end'}) {
  const lines=text.split('\n');
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={anchor}>{lines.map((line,i)=>
    <tspan key={i} x={x} dy={i===0 ? -7.5*(lines.length-1):15}>{line}</tspan>)}</text>;
}
type Box = 'rect'|'sub'|'round'|'decision'|'loop'|'loop-end'|'document'|'file'|'hidden';
function FlowBox({x,y,w,h,text,shape='rect'}:{x:number;y:number;w:number;h:number;text:string;shape?:Box}) {
  const path = shape==='decision'?`M0 ${h/2}L${w/2} 0 ${w} ${h/2} ${w/2} ${h}Z`
    : shape==='loop'?`M0 8l8-8h${w-16}l8 8v${h-8}H0Z`
      : shape==='loop-end'?`M0 0H${w}v${h-8}l-8 8H8l-8-8Z`
        : shape==='document'?`M0 0H${w}v${h-4}q${-w/4} -9 ${-w/2} 0t${-w/2} 0Z`
          : shape==='file'?`M6 0H${w-6}q12 ${h/2} 0 ${h}H6q-12 ${-h/2} 0 ${-h}Z`:null;
  const inline = /^(.*)［([a-g])］(.*)$/.exec(text);
  const visualWidth = (part:string) => [...part].reduce((sum,char)=>sum+(char.codePointAt(0)!>127?14:7.5),0);
  const holeWidth = 30;
  const start = inline ? (w-visualWidth(inline[1])-holeWidth-visualWidth(inline[3]))/2 : 0;
  const holeX = inline ? start+visualWidth(inline[1]) : 0;
  return <g transform={`translate(${x} ${y})`} data-flow-node={text||'網掛け'}>
    {path?<path d={path}/>:<rect width={w} height={h} rx={shape==='round'?h/2:0} fill={shape==='hidden'?'var(--soft-border)':undefined}/>}
    {shape==='sub'&&<path d={`M8 0v${h}m${w-16} 0v${-h}`}/>}
    {shape==='file'&&<path d={`M${w-6} 0q-12 ${h/2} 0 ${h}`}/>}
    {shape==='document'&&<path d={`M6 -1v-5h${w}v${h}m-${w-1}-${h+1}v-5h${w}v${h}`}/>}
    {/^[a-g]$/.test(text)&&<rect x={w/2-25} y={h/2-9} width={50} height={18} strokeWidth="2.2"/>}
    {inline ? <>
      <Label x={start} y={h/2+4} text={inline[1]} anchor="start"/>
      <rect x={holeX} y={h/2-10} width={holeWidth} height={20} strokeWidth="2.2"/>
      <Label x={holeX+holeWidth/2} y={h/2+4} text={inline[2]}/>
      <Label x={holeX+holeWidth+2} y={h/2+4} text={inline[3]} anchor="start"/>
    </>:text&&<Label x={w/2} y={h/2+4} text={text}/>}
  </g>;
}
function AnswerFlow(props:Props) {
  const files=[['講座\nファイル',100],['受講者\nファイル',165]] as const;
  return <SvgFigure {...props} width={695} height={233}>{arrow=><>
    <rect x={132} y={73} width={367} height={138} rx={16} strokeDasharray="6 4"/>
    <Label x={145} y={201} text="受講管理システム" anchor="start"/>
    {files.map(([name,y])=><FlowBox key={name} x={22} y={y} w={89} h={37} text={name} shape="file"/>)}
    <FlowBox x={152} y={19} w={86} h={43} text={'提出された\n答案'} shape="document"/>
    <FlowBox x={278} y={17} w={82} h={40} text={'添削と\n採点'}/>
    <FlowBox x={397} y={19} w={86} h={43} text={'添削済み\n答案'} shape="document"/>
    <FlowBox x={154} y={89} w={101} h={54} text={'提出日\n入力'} shape="round"/>
    <FlowBox x={384} y={89} w={99} h={54} text={'点数・\n返送日入力'} shape="round"/>
    <FlowBox x={271} y={155} w={101} h={38} text={'成績\nファイル'} shape="file"/>
    <FlowBox x={522} y={165} w={86} h={43} text="模範解答" shape="document"/>
    <FlowBox x={622} y={96} w={65} h={43} text={'受講者に\n返送'}/>
    {['M238 38H278','M360 38H397','M196 62V89','M440 62V89','M110 118H132','M110 183H132',
      'M204 143v31H271','M433 143v31H372','M490 36H568V109H622','M568 158V128H622'].map(d=><path key={d} d={d} markerEnd={arrow}/>)}
  </>}</SvgFigure>;
}
function GradeFlow(props:Props) {
  const c=courseCases[props.values[0]];
  const left=[
    [130,12,192,27,'修了判定プログラム','round'],[102,52,248,27,'初期処理','sub'],
    [102,92,248,38,'全成績レコードの処理\n成績ファイルの終わり','loop'],[102,143,248,27,'講座ファイル入力','sub'],
    [102,183,248,46,'a','decision'],[102,245,248,51,`受講期間の月数≠${c.advanced}`,'decision'],
    [102,312,248,30,'提出回数←0，合計点←0','rect'],[102,355,248,28,'提出回数と合計点の計算','sub'],
    [15,395,422,103,`（受講期間の月数＝${c.beginner}かつ提出回数≧${c.beginnerMinimum}）\n又は（受講期間の月数＝${c.intermediate}かつ提出回数≧${c.intermediateMinimum}）`,'decision'],
    [99,511,254,27,'平均点←合計点÷受講期間の月数','rect'],
    [102,552,248,46,`平均点≧${c.pass}`,'decision'],[102,612,248,48,'c','decision'],
    [60,674,332,56,'提出回数＝受講期間の月数','decision'],
    [102,745,248,30,'成績レコードの判定区分←［d］','rect'],
    [377,717,246,30,'成績レコードの判定区分←［e］','rect'],
    [605,656,100,32,'','hidden'],[102,802,248,27,'成績ファイル出力','sub'],
    [102,842,248,27,'成績ファイル入力','sub'],
    [102,882,248,29,'全成績レコードの処理','loop-end'],[102,924,248,27,'終了処理','sub'],
    [169,965,114,27,'終了','round'],
  ] as const;
  const right=[
    [665,361,229,27,'提出回数と合計点の計算','round'],[654,400,251,27,'i←1','rect'],
    [654,440,251,40,'全課題の合計\ni＞受講期間の月数','loop'],[654,493,251,56,'b','decision'],
    [644,565,271,48,'提出回数←提出回数＋1\n合計点←合計点＋成績レコー\nドの答案iの点数','rect'],
    [654,626,251,27,'i←i＋1','rect'],[654,665,251,27,'全課題の合計','loop-end'],[717,705,125,27,'終了','round'],
  ] as const;
  return <SvgFigure {...props} width={1071} height={1022}>{arrow=><>
    <path d="M226 39V52M226 79V92M226 130V143M226 170V183M226 229V245M226 296V312M226 342V355M226 383V395M226 498V511M226 538V552M226 598V612M226 660V674M226 730V745M226 775V802M226 829V842M226 869V882M226 911V924M226 951V965"/>
    <path d="M350 206H720V835H226M350 270H720M437 446H655V656M350 575H655M655 688V793H226M350 636H500V717M392 702H500M500 747V793H226" markerEnd={arrow}/>
    {left.map(([x,y,w,h,text,shape],i)=><FlowBox key={i} {...{x,y,w,h,text,shape}}/>)}
    <g transform="translate(115 0)"><path d="M779.5 388V400m0 27v13m0 40v13m0 56v16m0 48v13m0 27v12m0 27v13M905 521H940V617H779.5" markerEnd={arrow}/>
    {right.map(([x,y,w,h,text,shape],i)=><FlowBox key={i} {...{x,y,w,h,text,shape}}/>)}
    <Label x={918} y={516} text="No"/><Label x={798} y={558} text="Yes"/></g>
    {[[364,201,'No'],[242,239,'Yes'],[364,265,'No'],[242,308,'Yes'],[455,441,'No'],[243,507,'Yes'],
      [365,571,'No'],[243,607,'Yes'],[365,631,'No'],[243,669,'Yes'],[406,696,'No'],[242,740,'Yes']].map(([x,y,text])=><Label key={x+':'+y} x={Number(x)} y={Number(y)} text={String(text)}/>)}
    <Label x={22} y={1010} text="注記　網掛けの部分は表示していない。" anchor="start"/>
  </>}</SvgFigure>;
}
function DiscountFlow(props:Props) {
  const c=courseCases[props.values[0]];
  const left=[
    [86,14,256,26,'割引残存期間抽出プログラム','round'],
    [60,52,307,38,'各ファイルを開く\n（成績ファイルは順次アクセス）','rect'],
    [60,103,307,27,'成績ファイルを読む','rect'],
    [60,143,307,39,'割引残存期間抽出処理\n成績ファイルの終わり','loop'],
    [60,195,307,28,'講座ファイル入力','sub'],[60,236,307,52,`受講期間の月数≠${c.advanced}`,'decision'],
    [60,302,307,50,'判定区分：“優秀”','decision'],[269,367,296,50,'判定区分：“不合格”','decision'],
    [134,432,161,29,`割引対象期間←${c.honorMonths}`,'rect'],[337,432,160,29,`割引対象期間←${c.retryMonths}`,'rect'],
    [60,482,307,27,'割引残存期間計算','sub'],[60,522,307,43,'受講者コード，講座番号，割引残存期間を\n結果ファイルに書き込む','rect'],
    [60,578,307,27,'成績ファイルを読む','rect'],[60,618,307,27,'割引残存期間抽出処理','loop-end'],
    [60,658,307,27,'各ファイルを閉じる','rect'],[153,698,121,27,'終了','round'],
  ] as const;
  const right=[
    [641,162,240,27,'割引残存期間計算','round'],[613,206,297,51,'現在日付の年＝起算日の年','decision'],
    [660,282,200,30,'変数m←現在日付の月','rect'],[873,282,127,30,'変数m←［f］','rect'],
    [640,331,242,30,'割引残存期間←［g］－変数m','rect'],
    [613,380,297,52,'割引残存期間＜0','decision'],[640,451,242,28,'割引残存期間←99','rect'],
    [695,500,132,26,'終了','round'],
  ] as const;
  return <SvgFigure {...props} width={1010} height={751}>{arrow=><>
    <path d="M213.5 40V52m0 38v13m0 27v13m0 39v13m0 28v13m0 52v14m0 50v80m0 29v21m0 27v13m0 43v13m0 27v13m0 27v13m0 27v13"/>
    <path d="M367 262H581V571H213.5M367 327H417V367M565 392H581M417 417V432M417 461V472H213.5" markerEnd={arrow}/>
    {left.map(([x,y,w,h,text,shape],i)=><FlowBox key={i} {...{x,y,w,h,text,shape}}/>)}
    <path d="M761 189V206M761 257V282M761 312V331M910 231.5H936.5V282M936.5 312V322H761M761 361V380M761 432V451M761 479V500M910 406H947V490H761" markerEnd={arrow}/>
    {right.map(([x,y,w,h,text,shape],i)=><FlowBox key={i} {...{x,y,w,h,text,shape}}/>)}
    {[[383,257,'No'],[231,297,'Yes'],[385,322,'No'],[231,368,'Yes'],[575,386,'No'],[436,427,'Yes'],
      [925,226,'No'],[779,271,'Yes'],[928,401,'No'],[779,445,'Yes']].map(([x,y,text])=>
      <Label key={x+':'+y} x={Number(x)} y={Number(y)} text={String(text)}/>)}
    <Label x={610} y={720} text="注記　講座ファイル入力は表2と同じ。" anchor="start"/>
  </>}</SvgFigure>;
}

function Report(props:Props) {
  const current=props.id==='6-current', r=inventoryReport(props.values[0],current);
  const counts=(label:string,rows:string[][])=><table aria-label={label} style={tableStyle}><tbody>
    {rows.map(([name,value])=><tr key={name}><th scope="row" style={{...cell,border:'none',fontWeight:'normal',textAlign:'start'}}>{name}</th>
      <MarkedCell value={value}/></tr>)}</tbody></table>;
  return <NativeFigure {...props}><div style={{border,color:ink,padding:'0.6em',width:'max-content',marginInline:'auto',fontSize:tableStyle.fontSize}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:'1.5em'}}><span>宛先：システム部長</span><span>報告日：{r.date}</span></div>
    <div>磁気テープ棚卸結果報告書</div><div>(1) 棚卸実施日：{r.inspected}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1em'}}>
      <div>(2) 移動記録：{counts('移動記録',r.movement)}</div>
      <div>(3) 実地確認済み本数：{counts('実地確認済み本数',r.onSite)}</div>
    </div>
    <div>(4) 貸出先：{current?<><span style={hiddenCell} aria-label="網掛けの非表示部分">　　</span>。<br/>
      なお，このうちの1本は所在を確認中。確認後，別途報告いたします。</>:r.borrowers}</div>
    <div>棚卸実施者：ライブラリアン ○○ ○○，立会者 {r.witness}</div>
    {current&&note('注記　網掛けの部分は表示していない。')}
  </div></NativeFigure>;
}
function StockLedger(props:Props) {
  const rows=stockRows(props.values[0],props.id==='7-stock-a'?'A':'B');
  return <NativeFigure {...props}><div style={{width:'max-content',marginInline:'auto'}}>
    <table aria-label={props.caption} style={tableStyle}><thead><tr>{stockColumns.map((column,i)=><th key={i} scope="col" style={cell}>{column}</th>)}</tr></thead>
      <tbody>{rows.map(([label,...values])=><tr key={label}><th scope="row" style={cell}>{label}</th>
        {values.map((value,i)=><MarkedCell key={i} value={value}/>)}</tr>)}</tbody></table>
    {stockNotes.map(text=><div key={text} style={{color:ink}}>{text}</div>)}
  </div></NativeFigure>;
}
function DistanceTrace(props:Props) {
  return <NativeFigure {...props}><div style={{width:'max-content',marginInline:'auto',...mono}}>
    <div style={{display:'grid',gridTemplateColumns:'auto auto',gap:'0.8em 2.5em'}}>
      {distanceTrace(props.values[0]).map((rows,phase)=><div key={phase} data-distance-phase={phase}>
        <div>{phase?'Via ＝ '+phase:'初期値'}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5, 3em)',textAlign:'right'}}>{rows.flatMap((row,i)=>row.map((value,j)=>
          <code key={i+':'+j} data-distance-cell={i+1+':'+(j+1)}>{value.startsWith('［')?<Blank value={value[1]}/>:value}</code>))}</div>
      </div>)}
    </div>
    {note('注記　'+matrixNote)}
  </div></NativeFigure>;
}
function ControlLane({symbol,ends}:{symbol:string;ends:boolean}) {
  const terminal=symbol==='■'||symbol==='▲'||symbol==='▼';
  const start=symbol==='▲'||symbol==='■'&&!ends, end=symbol==='▼'||symbol==='■'&&ends;
  return <span data-control-symbol={symbol} aria-hidden="true" style={{display:'inline-block',width:'1.25em',position:'relative',textAlign:'center'}}>
    <span style={{position:'absolute',insetInlineStart:'50%',top:start?'50%':0,bottom:end?'50%':0,borderInlineStart:border}}/>
    {symbol==='├'&&<span style={{position:'absolute',insetInlineStart:'20%',insetInlineEnd:0,top:'50%',borderTop:border}}/>}
    {terminal?symbol:'\u00a0'}
  </span>;
}
function Program(props:Props) {
  const id=props.id as keyof typeof railwayCode;
  return <NativeFigure {...props} captionVisible={false}><pre style={{...mono,position:'relative',width:'max-content',marginInline:'auto',lineHeight:'1.45em'}} data-source-program={id}>
    {id==='8-program'&&<span aria-hidden="true" data-source-dashed="" style={{position:'absolute',left:'1.25em',right:0,
      top:'5.8em',height:'10.15em',border:'1px dashed '+ink,pointerEvents:'none'}}/>}
    {railwayCode[id].map((line,i)=>{
      const prefix=line.match(/^(?:[│├▲▼■](?: |$))+/)?.[0]??'', text=line.slice(prefix.length);
      return <span key={i} data-program-line={i+1} data-control-prefix={prefix.trimEnd()} style={{display:'block'}}>
        {[...prefix.trimEnd()].filter(c=>c!==' ').map((symbol,j)=><ControlLane key={j} symbol={symbol} ends={!text}/>)}
        {text.split(/(［[ef]］)/).map((part,j)=>/^［[ef]］$/.test(part)?<Blank key={j} value={part[1]}/>:part)}
      </span>;
    })}
  </pre></NativeFigure>;
}
function RailGraph(props:Props) {
  const s=railwayModel(props.values[0]);
  const primary=props.id==='8-route', full=props.id==='8-extended-route';
  const points=primary?[[74,95],[197,40],[126,96],[157,148],[246,128]]
    : full?[[62,54],[177,27],[239,87],[304,54],[110,87],[168,87],[62,116],[112,142],[188,142],[237,27]]
      :[[62,54],[177,27],[239,87],[304,54]];
  const edges=primary?['M74 95Q84 37 197 40','M197 40L126 96','M74 95Q83 136 157 148','M126 96L157 148',
    'M197 40Q290 60 246 128','M157 148Q213 154 246 128']
    : full?['M62 54Q96 28 177 27','M177 27Q232 41 239 87','M177 27H237L304 54','M62 54L110 87H239',
      'M62 54Q37 95 62 116Q78 140 112 142H188Q217 128 239 87']
      :['M62 54Q103 28 177 27','M62 54L110 87H239','M62 54Q31 108 91 135Q190 166 239 87',
        'M177 27Q232 41 239 87','M177 27H236L304 54'];
  const labels:readonly (readonly [number,number,string|number])[]=primary?
    [[105,46,s.edges[0]],[175,72,s.edges[1]],[91,143,s.edges[2]],[157,118,s.edges[3]],[263,66,s.edges[4]],[212,165,s.edges[5]]]
    : full?[[83,68,s.segmentB[0]],[143,80,s.segmentB[1]],[204,80,s.segmentB[2]]]
      :[[112,27,'A'],[163,107,'B'],[89,153,'C'],[219,49,'D'],[267,25,'E'],
        [166,79,s.segmentB.reduce((sum:number,v)=>sum+v,0)]];
  return <SvgFigure {...props} width={365} height={214}>{()=> <>
    {edges.map((d,i)=><path key={d} d={d} data-track={primary?stationPairs[i].join('-'):undefined}/>)}
    {points.map(([x,y],i)=><g key={i} data-station={i+1}><circle cx={x} cy={y} r={10.5} fill={surface}/><Label x={x} y={y+4} text={String(i+1)}/></g>)}
    {labels.map(([x,y,label],i)=><Label key={i} x={x} y={y} text={String(label)}/>)}
    {primary? <><Label x={13} y={188} text="注記　○は駅，その中の数字は駅番号。" anchor="start"/>
      <Label x={13} y={204} text="経路に付した数字は2駅間の距離。" anchor="start"/></>:
      <Label x={13} y={188} text={full?'注記　2駅間の距離は一部だけを表示している。':'注記　A～Eは区間名を表す。'} anchor="start"/>}
  </>}</SvgFigure>;
}

const renderers:Record<DrawingId,(props:Props)=>ReactNode>={
  '5-answer-flow':AnswerFlow,'5-student':RecordLayout,'5-course-file':RecordLayout,'5-grade':RecordLayout,
  '5-grade-flow':GradeFlow,'5-result':RecordLayout,'5-discount-flow':DiscountFlow,
  '6-prior':Report,'6-current':Report,'7-stock-a':StockLedger,'7-stock-b':StockLedger,
  '8-route':RailGraph,'8-program':Program,'8-distance-trace':DistanceTrace,'8-half-program':Program,
  '8-extended-route':RailGraph,'8-trunk-route':RailGraph,'8-four-routes':Program,'8-minimum-program':Program,
};
export const legacy2012AutumnPm0508FigureRenderers:readonly BookletFigureRenderer[]=(Object.keys(renderers) as DrawingId[]).map(id=>{
  const Render=renderers[id];
  return {profile:autumn2012Pm0508Profile(id),component:props=><Render {...props} id={id}/>};
});
