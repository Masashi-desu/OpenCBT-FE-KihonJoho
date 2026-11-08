import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2014Pm0104Alt, autumn2014Pm0104Profiles as f, legacy2014AutumnPm0104Figures } from '../core/generators/legacy-2014-autumn-pm-01-04-figures';
import { bookRelations, excitationRows, jkCases, networkCases, processNames, processSteps, readyRows, routerLines, type Relation, type Signal } from '../core/generators/legacy-2014-autumn-pm-01-04-models';

function Drawing({profile,values,caption,width,height,children}:BookletFigureProps&{
  profile:string; width:number; height:number; children:(arrow:string)=>ReactNode;
}){
  const id=useId();
  legacy2014AutumnPm0104Figures.find(entry=>entry.profile===profile)!.validate(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
        style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',color:'var(--diagram-ink)'}}>
        <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{autumn2014Pm0104Alt(profile,values[0])}</desc>
        <defs><marker id={id+'-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" fontSize="16">
          {children('url(#'+id+'-arrow)')}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Text({x,y,children,align='middle',underlined=false,monospace=false}:{
  x:number; y:number; children:ReactNode; align?:'middle'|'start'; underlined?:boolean; monospace?:boolean;
}){
  return <text x={x} y={y} textAnchor={align} stroke="none" fill="currentColor"
    textDecoration={underlined?'underline':undefined} fontFamily={monospace?'var(--font-mono)':undefined}>{children}</text>;
}
function Box({x,y,w,h,labels}:{x:number;y:number;w:number;h:number;labels:string[]}){
  return <g><rect x={x} y={y} width={w} height={h} fill="var(--diagram-surface)"/>
    {labels.map((label,i)=><Text key={i} x={x+w/2} y={y+h/2+5+(i-(labels.length-1)/2)*20}>{label}</Text>)}
  </g>;
}
function Network(props:BookletFigureProps){
  const n=networkCases[props.values[0]];
  const dmz=[['Webサーバ',n.web],['メールサーバ',n.mail]];
  const lan=[['メールマガジン','送信サーバ',n.mag],['会員管理サーバ',n.member],['業務用PC1','192.168.0.4'],['業務用PC100','192.168.0.103']];
  return <Drawing {...props} profile={f.network} width={839} height={359}>{()=> <>
    <ellipse cx="117" cy="32" rx="87" ry="20" fill="var(--diagram-surface)"/><Text x={117} y={38}>インターネット</Text>
    <rect x="20" y="68" width="802" height="231"/>
    <rect x="250" y="81" width="557" height="100" strokeDasharray="7 5"/><Text x={777} y={102}>DMZ</Text>
    <rect x="34" y="191" width="773" height="96" strokeDasharray="7 5"/><Text x={783} y={214}>LAN</Text>
    <path d="M117 52V131M165 148H751M117 166V224M46 224H749"/>
    <Box x={69} y={131} w={96} h={35} labels={['ルータ']}/>
    <Text x={135} y={124}>if0</Text><Text x={180} y={169}>if1</Text><Text x={135} y={185}>if2</Text>
    {dmz.map(([name,ip],i)=>{
      const x=403+220*i;
      return <g key={ip} data-network-ip={ip}>
        <path d={`M${x} 123V148`}/><rect x={x-4} y="145" width="8" height="6" fill="currentColor"/>
        <Box x={x-77} y={88} w={154} h={43} labels={[name,'（'+ip+'）']}/>
      </g>;
    })}
    {lan.map(([...labels],i)=>{
      const x=174+167*i+(i===3?26:0), ip=labels.pop()!;
      return <g key={ip} data-network-ip={ip}>
        <path d={`M${x} 224V232`}/><rect x={x-4} y="221" width="8" height="6" fill="currentColor"/>
        <Box x={x-78} y={233} w={156} h={52} labels={[...labels,'（'+ip+'）']}/>
      </g>;
    })}
    <Text x={607} y={257}>…</Text>
    <Text x={20} y={325} align="start">注記1　カッコ内は各機器のIPアドレスを表す。</Text>
    <Text x={20} y={348} align="start">注記2　if0，if1及びif2はルータのネットワークインタフェースを表す。</Text>
  </>}</Drawing>;
}
function Router(props:BookletFigureProps){
  return <Drawing {...props} profile={f.router} width={412} height={271}>{()=> <>
    <rect x="10" y="9" width="390" height="250"/>
    {routerLines(props.values[0]).map((rule,i)=><Text key={i} x={29} y={35+i*25} align="start" monospace>{rule}</Text>)}
  </>}</Drawing>;
}

function Jk({x,y,inputs}:{x:number;y:number;inputs?:readonly Signal[]}){
  return <g>
    {inputs?.map((signal,i)=>{
      const yIn=y+21+i*72,yOut=y+(signal==='Q'?21:93),side=i===0?y-14:y+129,xOut=x+174+i*14;
      if(signal==='Q'||signal==='Q̅')return <path key={i} data-jk-input={signal}
        d={`M${x+145} ${yOut}H${xOut}V${side}H${x-32}V${yIn}H${x}`}/>;
      return <g key={i} data-jk-input={signal}><path d={`M${x-39} ${yIn}H${x}`}/><Text x={x-49} y={yIn+6}>{signal}</Text></g>;
    })}
    <rect x={x} y={y} width="145" height="114" fill="var(--diagram-surface)"/>
    <path d={`M${x-39} ${y+57}H${x}M${x+145} ${y+21}h26M${x+145} ${y+93}h26`}/>
    {!inputs&&<path d={`M${x-39} ${y+21}H${x}M${x-39} ${y+93}H${x}`}/>}
    {['J','CLK','K'].map((label,i)=><Text key={label} x={x+9} y={y+27+36*i} align="start">{label}</Text>)}
    <Text x={x+128} y={y+27}>Q</Text><Text x={x+128} y={y+99}>Q̅</Text>
  </g>;
}
const fullClock=[0,1,0,1,0,1,0,1,0];
function Wave({x,y,clock,out,arrow,periodAt}:{x:number;y:number;clock:number[];out?:number[];arrow:string;periodAt?:number}){
  const step=51, left=x+74, bottom=y+(out?155:86), top=(base:number,value:number)=>base+(value?0:29);
  const lines=out?[clock,out]:[clock];
  return <g>
    {lines.map((row,j)=>{
      const y0=y+40+65*j;
      const path='M'+left+' '+top(y0,row[0])+row.map((v,i)=>'V'+top(y0,v)+'H'+(left+(i+1)*step)).join('');
      return <g key={j} data-wave-values={row.join('')}>
        <Text x={x+12} y={y0+5}>{j===0?'CLK':'Q'}</Text><Text x={left-17} y={y0+5}>1</Text>
        <Text x={left-17} y={y0+34}>0</Text><path d={path} strokeWidth="2"/>
      </g>;
    })}
    <path d={`M${left} ${bottom}H${left+step*clock.length+10}`} markerEnd={arrow}/>
    <Text x={left+step*clock.length+38} y={bottom+6}>時間</Text>
    {periodAt!==undefined&&<>
      <path d={`M${left+periodAt*step} ${y+19}h${step*2}`} markerStart={arrow} markerEnd={arrow}/>
      <Text x={left+(periodAt+1)*step} y={y+11}>1周期</Text>
    </>}
  </g>;
}
function SymbolFigure(props:BookletFigureProps){
  return <Drawing {...props} profile={f.symbol} width={328} height={158}>{()=><Jk x={86} y={18}/>}</Drawing>;
}
function Edge(props:BookletFigureProps){
  return <Drawing {...props} profile={f.edge} width={398} height={185}>{arrow=><Wave x={12} y={12} clock={[0,1,0,1]} out={[1,1,0,0]} arrow={arrow} periodAt={1}/>}</Drawing>;
}
function Feedback(props:BookletFigureProps){
  return <Drawing {...props} profile={f.feedback} width={616} height={258}>{arrow=> <>
    <Jk x={202} y={25} inputs={jkCases[props.values[0]].feedback}/>
    <Wave x={12} y={153} clock={fullClock} arrow={arrow}/>
  </>}</Drawing>;
}
function Counter(props:BookletFigureProps){
  return <Drawing {...props} profile={f.counter} width={616} height={186}>{arrow=><Wave x={12} y={11} clock={fullClock} out={[0,0,1,1,0,0,1,1,0]} arrow={arrow} periodAt={2}/>}</Drawing>;
}
function Example(props:BookletFigureProps){
  return <Drawing {...props} profile={f.example} width={363} height={168}>{()=><Jk x={84} y={25} inputs={jkCases[props.values[0]].example}/>}</Drawing>;
}

function Excitation(props:BookletFigureProps){
  return <Drawing {...props} profile={f.excitation} width={430} height={242}>{()=> <>
    <rect x="16" y="15" width="396" height="190"/>
    <path d="M146 15V53M276 15V205"/>
    <Text x={81} y={39}>J₁</Text><Text x={211} y={39}>K₁</Text><Text x={344} y={39}>Q₁→Q₂</Text>
    {excitationRows.map(([j,k,state],i)=>{
      const y=53+i*38;
      return <g key={state} data-excitation-transition={state}>
        <path d={`M16 ${y}H412`}/>
        {k?<><path d={`M146 ${y}v38`}/><Text x={81} y={y+25}>{j}</Text><Text x={211} y={y+25}>{k}</Text></>:
          <g data-excitation-blank={j}><rect x="35" y={y+5} width="222" height="28"/><Text x={146} y={y+25}>{j[1]}</Text></g>}
        <Text x={344} y={y+25}>{state}</Text>
      </g>;
    })}
    <Text x={16} y={229} align="start">注記　任意：0又は1のいずれの値もあり得る。</Text>
  </>}</Drawing>;
}

function Queue(props:BookletFigureProps&{cycled?:boolean}){
  return <Drawing {...props} profile={props.cycled?f.roundRobin:f.fifo} width={686} height={props.cycled?190:149}>{arrow=> <>
    <Text x={36} y={79}>到着</Text><Text x={110} y={61}>登録</Text><path d="M58 74H160" markerEnd={arrow}/>
    <rect x="162" y="49" width="203" height="49" fill="var(--diagram-surface)"/>
    {[195,301,341].map(x=><circle key={x} cx={x} cy="74" r="13"/>)}
    <Text x={247} y={79}>…</Text><Text x={261} y={37}>待ち行列</Text><Text x={261} y={119}>（実行可能状態）</Text>
    <Text x={424} y={61}>取出し</Text><path d="M365 74H474" markerEnd={arrow}/>
    <circle cx="489" cy="74" r="14"/><Text x={489} y={46}>実行</Text><Text x={489} y={107}>（実行状態）</Text>
    <path d="M503 74H618" markerEnd={arrow}/><Text x={643} y={79}>終了</Text>
    {props.cycled&&<><path d="M489 89V144H105V76" markerEnd={arrow}/><Text x={299} y={162}>中断</Text></>}
    <Text x={12} y={props.cycled?183:140} align="start">注記　○はプロセスを表す。</Text>
  </>}</Drawing>;
}
function Arrival(props:BookletFigureProps){return <Queue {...props}/>;}
function RoundRobin(props:BookletFigureProps){return <Queue {...props} cycled/>;}
function States(props:BookletFigureProps){
  return <Drawing {...props} profile={f.states} width={690} height={228}>{arrow=> <>
    <path d="M86 166H157M404 54H576" strokeDasharray="6 5" markerEnd={arrow}/>
    <path d="M239 134L295 78" markerEnd={arrow}/><Text x={248} y={94}>(a)</Text>
    <path d="M317 82L269 141" markerEnd={arrow}/><Text x={304} y={118}>(b)</Text>
    <path d="M373 79L427 136" markerEnd={arrow}/><Text x={420} y={101}>(c)</Text>
    <path d="M405 166H280" markerEnd={arrow}/><Text x={348} y={187}>(d)</Text>
    {([['生成',53,166,34],['実行可能',219,166,60],['実行',343,54,61],['待ち',464,166,59],['終了',617,54,41]] as const).map(([name,x,y,rx],i)=>
      <g key={name}><ellipse cx={x} cy={y} rx={rx} ry={i===0||i===4?24:33} strokeDasharray={i===0||i===4?'6 5':undefined} fill="var(--diagram-surface)"/>
        <Text x={x} y={y+5}>{name}</Text></g>)}
  </>}</Drawing>;
}
function Steps(props:BookletFigureProps){
  return <Drawing {...props} profile={f.steps} width={416} height={275}>{arrow=> <>
    <rect x="15" y="12" width="385" height="250"/>
    {processSteps(props.values[0]).map((step,i)=>{
      const y=38+50*i;
      return <g key={i} data-process-io={step.io?'yes':'no'}>
        <Text x={36} y={y}>{'①②③④⑤'[i]}</Text><Text x={63} y={y} align="start">{step.name}</Text>
        {i<4&&<path d={`M89 ${y+7}v26`} markerEnd={arrow}/>}
      </g>;
    })}
  </>}</Drawing>;
}
function Timeline(props:BookletFigureProps){
  const rows=readyRows(props.values[0]), left=52, top=39, cell=27, rowHeight=37;
  return <Drawing {...props} profile={f.timeline} width={815} height={246}>{()=> <>
    <rect x="13" y={top} width={left-13+27*cell} height={rowHeight*4}/>
    <path d={`M${left} ${top}v${4*rowHeight}`}/>
    {[3,6,9,12,15,18,21,24].map(t=><g key={t}>
      <path d={`M${left+t*cell} ${top}v${4*rowHeight}`} strokeDasharray="4 3"/>
      <Text x={left+t*cell} y={27}>{t*10}</Text>
    </g>)}
    <Text x={782} y={27}>（ミリ秒）</Text>
    {rows.map((cells,j)=>{
      const y=top+j*rowHeight;
      return <g key={j} data-process-row={processNames[j]} data-process-states={cells.slice(0,9).map(c=>c||'.').join('')}>
        {j>0&&<path d={`M13 ${y}H${left+27*cell}`}/>}
        <Text x={32} y={y+24}>{processNames[j]}</Text>
        {cells.map((v,i)=>v&&<Text key={i} x={left+(i+.5)*cell} y={y+24}>{v}</Text>)}
      </g>;
    })}
    <Text x={13} y={211} align="start">注記　○は10ミリ秒間の実行状態を表す。</Text>
    <Text x={67} y={235} align="start">－は10ミリ秒間の実行可能状態を表す。</Text>
  </>}</Drawing>;
}

function RelationTable({x,y,relation:r}:{x:number;y:number;relation:Relation}){
  const offsets=r.widths.map((_,i)=>r.widths.slice(0,i).reduce((a,b)=>a+b,0));
  return <g data-relation-table={r.name}>
    <Text x={x} y={y-7} align="start">{r.name}</Text>
    {[r.columns,...r.rows].map((row,j)=><g key={j}>{row.map((cell,i)=>{
      const start=x+offsets[i],top=y+j*31, width=r.widths[i], primary=j===0&&r.primary===i;
      return <g key={i} data-primary-key={primary?cell:undefined}>
        <rect x={start} y={top} width={width} height="31" fill={j===0?'var(--diagram-surface)':'none'}/>
        <Text x={start+width/2} y={top+21} underlined={primary}>{cell}</Text>
      </g>;
    })}</g>)}
  </g>;
}
function OldBooks(props:BookletFigureProps){
  return <Drawing {...props} profile={f.oldBooks} width={852} height={139}>{()=><RelationTable x={12} y={27} relation={bookRelations(props.values[0],false)[0]}/>}</Drawing>;
}
function NewBooks(props:BookletFigureProps){
  return <Drawing {...props} profile={f.newBooks} width={683} height={271}>{()=>
    bookRelations(props.values[0],true).map((relation,i)=><RelationTable key={relation.name} x={12} y={27+i*130} relation={relation}/>)
  }</Drawing>;
}

export const legacy2014AutumnPm0104FigureRenderers:BookletFigureRenderer[]=[
  {profile:f.network,component:Network},{profile:f.router,component:Router},
  {profile:f.symbol,component:SymbolFigure},{profile:f.edge,component:Edge},{profile:f.feedback,component:Feedback},
  {profile:f.counter,component:Counter},{profile:f.example,component:Example},{profile:f.excitation,component:Excitation},
  {profile:f.fifo,component:Arrival},{profile:f.roundRobin,component:RoundRobin},{profile:f.states,component:States},
  {profile:f.steps,component:Steps},{profile:f.timeline,component:Timeline},
  {profile:f.oldBooks,component:OldBooks},{profile:f.newBooks,component:NewBooks},
];
