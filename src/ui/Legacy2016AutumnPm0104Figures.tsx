import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureRenderer, BookletFigureProps } from './booklet-figure-renderer-contract';
import { autumn2016Pm0104Profiles as profiles, autumn2016Pm0104FigureAlt as alt, autumn2016Pm0104Case, autumn2016Pm1Cases, autumn2016Pm3Cases, autumn2016Pm3Allowance, autumn2016Pm2Trees, autumn2016Pm0104Prose, autumn2016Pm2GrammarRows, autumn2016Pm3Queries, type Autumn2016PmTree } from '../core/generators/legacy-2016-autumn-pm-figures-01-04';

const cell: CSSProperties = {border:'1px solid var(--diagram-border)',padding:'.45em .65em',textAlign:'center',fontWeight:'normal',whiteSpace:'nowrap'};
const tab: CSSProperties = {borderCollapse:'collapse',width:'100%',color:'var(--diagram-ink)',background:'var(--diagram-surface)'};
const font: CSSProperties = {fontSize:'calc(1rem * var(--image-scale, 1))'};
const primary = (text: string) => <u data-primary-key>{text}</u>;
function Native({caption,children,width=680,captionPosition='bottom',fluid=false}:{caption:string;children:ReactNode;width?:number;captionPosition?:'top'|'bottom'|'accessible';fluid?:boolean}) {
  const captionNode=<figcaption className={captionPosition==='accessible'?'sr-only':undefined}>{caption}</figcaption>;
  return <figure className="managed-diagram source-figure" style={{maxWidth:'100%',minWidth:0}}>{captionPosition==='top'&&captionNode}<div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'}><div style={{...font,fontSize:fluid?'inherit':font.fontSize,textAlign:'left',width:fluid?'100%':`calc(${width}px * var(--image-scale, 1))`,maxWidth:fluid?'100%':'none'}}>{children}</div></div>{captionPosition!=='top'&&captionNode}</figure>;
}
// Only source-owned markers become answer boxes; optional grammar brackets
// remain normal text and the shared Content renderer is not broadened.
function BlankText({text}:{text:string}) {
  return <>{text.split(/(\[\[[a-g]?\]\])/g).map((piece,index)=>{
    const label=/^\[\[([a-g]?)\]\]$/.exec(piece);
    return label?<span key={index} data-answer-blank={label[1]||undefined} data-generic-blank={label[1]?undefined:true} aria-label={label[1]?'空欄'+label[1]:'空欄'} style={{display:'inline-block',border:'2px solid var(--diagram-border)',minWidth:'4em',padding:'.05em .25em',lineHeight:'1.3',textAlign:'center',verticalAlign:'baseline',boxSizing:'border-box'}}>{label[1]||'\u00a0'}</span>:piece;
  })}</>;
}
function Prose({number,values,caption}:BookletFigureProps & {number:1|2|3|4}) {
  const i=autumn2016Pm0104Case(values,number===3?8:4),text=autumn2016Pm0104Prose(number,i);
  return <Native caption={caption} captionPosition="accessible" fluid><p data-source-prose={number} style={{margin:0,fontSize:'inherit',lineHeight:1.9}}><BlankText text={text}/></p></Native>;
}
function Grammar({kind,values,caption}:BookletFigureProps & {kind:0|1|2}) {
  alt([profiles.lexical,profiles.expression,profiles.factor][kind],values);
  return <Native caption={caption} captionPosition="top" width={kind===0?760:520}><div data-source-grammar={kind} style={{display:'grid',gridTemplateColumns:'max-content 1.4em 1fr',gap:'.45em .6em',alignItems:'baseline',padding:'.4em .6em'}}>{autumn2016Pm2GrammarRows[kind].map(([left,right],index)=><div key={index} style={{display:'contents'}}><span>{left}</span><span>→</span><span><BlankText text={right}/></span></div>)}</div></Native>;
}
function Sql({kind,values,caption}:BookletFigureProps & {kind:0|1|2}) {
  alt([profiles.queryE,profiles.queryF,profiles.queryG][kind],values);
  return <Native caption={caption} captionPosition="accessible" width={820}><pre data-source-sql={kind} style={{whiteSpace:'pre',margin:0,font:'inherit',fontFamily:'ui-monospace, monospace',lineHeight:1.9,background:'var(--diagram-surface)',color:'var(--diagram-ink)'}}><BlankText text={autumn2016Pm3Queries[kind]}/></pre></Native>;
}
function Cia({values,caption}:BookletFigureProps) {
  alt(profiles.cia,values);
  return <Native caption={caption} captionPosition="top" width={440}><table style={tab}><thead><tr><th scope="col" style={cell}>3要素</th><th scope="col" style={cell}>対応</th></tr></thead><tbody>{['機密性','完全性','可用性'].map((text,i)=><tr key={text}><td style={cell}>{text}</td><td style={cell}><BlankText text={'[['+'abc'[i]+']]'} /></td></tr>)}</tbody></table></Native>;
}
function Drawing({profile,values,caption,width,height,children}:{profile:string;values:number[];caption:string;width:number;height:number;children:(arrow:string)=>ReactNode}) {
  const id=useId().replace(/:/g,''),arrow=`url(#${id}-arrow)`;
  return <figure className={'managed-diagram source-figure profile-'+profile} style={{maxWidth:'100%',minWidth:0}}><div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'}><svg viewBox={`0 0 ${width} ${height}`} style={{display:'block',width:`calc(${width}px * var(--image-scale, 1))`,maxWidth:'none',height:'auto',color:'var(--diagram-ink)'}} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-description'}><title id={id+'-title'}>{caption}</title><desc id={id+'-description'}>{alt(profile,values)}</desc><defs><marker id={id+'-arrow'} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L11 6L1 11" fill="none" stroke="currentColor" strokeWidth="1.5"/></marker></defs><g aria-hidden="true" fontSize="22">{children(arrow)}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
function Network(props: BookletFigureProps) {
  alt(profiles.network,props.values);
  const stack=(x:number,y:number,text:string,width=145)=><g><rect x={x-12} y={y-12} width={width} height="52"/><rect x={x-6} y={y-6} width={width} height="52"/><rect x={x} y={y} width={width} height="52"/><text x={x+width/2} y={y+33} textAnchor="middle" fill="currentColor" stroke="none">{text}</text></g>;
  return <Drawing {...props} profile={profiles.network} width={800} height={555}>{()=> <>
    <g fill="var(--diagram-surface)" stroke="currentColor" strokeWidth="2"><rect x="205" y="145" width="565" height="355" rx="20"/><rect x="490" y="155" width="265" height="180" rx="8" strokeDasharray="9 6"/><rect x="220" y="355" width="535" height="125" rx="8" strokeDasharray="9 6"/><path d="M145 68H430M430 94V230M430 278V398M455 253H740M240 398H740" fill="none"/>
    <ellipse cx="430" cy="68" rx="120" ry="31"/><text x="430" y="76" textAnchor="middle" fill="currentColor" stroke="none">インターネット</text>
    {stack(22,42,'タブレット')}{stack(505,272,'サーバ群X',175)}{stack(275,423,'PC',110)}{stack(575,423,'サーバ群Y',160)}
    <rect x="397" y="230" width="66" height="48"/><rect x="596" y="184" width="145" height="49"/><path d="M665 233V253M585 253V260M325 398V411M655 398V411" fill="none"/>
    {[ [585,253],[665,253],[740,253],[240,398],[325,398],[430,398],[655,398],[740,398] ].map(([x,y],i)=><rect key={i} data-junction={i} x={x-4} y={y-4} width="8" height="8" fill="currentColor"/>)}
    </g><g fill="currentColor"><text x="220" y="177">A社</text><text x="505" y="182">DMZ</text><text x="235" y="381">LAN</text><text x="430" y="263" textAnchor="middle">FW</text><text x="668" y="217" textAnchor="middle">RPサーバ</text><text x="20" y="530">FW：ファイアウォール</text></g>
  </>}</Drawing>;
}
function Firewall({values,caption}: BookletFigureProps) {
  const i=autumn2016Pm0104Case(values),port=autumn2016Pm1Cases[i].dbPort;
  return <Native caption={caption}><table style={tab}><thead><tr><th style={cell} rowSpan={2} scope="col">項番</th><th style={cell} colSpan={3} scope="colgroup">条件</th><th style={cell} rowSpan={2} scope="col">動作</th></tr><tr>{['送信元','宛先','宛先ポート番号'].map(text=><th key={text} style={cell} scope="col">{text}</th>)}</tr></thead><tbody>{[['1','任意','RPサーバ','443','許可'],['2','任意','DBサーバ',String(port),'許可'],['3','任意','任意','任意','拒否']].map((row,i)=><tr key={i}>{row.map((text,k)=><td key={k} style={cell}>{text}</td>)}</tr>)}</tbody></table><p>注記　項番が小さいものから順に突き合わせ，最初に一致したものが適用される。</p></Native>;
}
function Dfa(props: BookletFigureProps) {
  alt(profiles.dfa,props.values);
  const x=[60,240,205,420,600,760,930],y=[240,240,65,240,240,240,240];
  return <Drawing {...props} profile={profiles.dfa} width={1000} height={405}>{arrow=><>
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <path data-transition="0-digit-1" d="M86 240H213" markerEnd={arrow}/><path data-transition="0-a-2" d="M78 220L187 85" markerEnd={arrow}/><path data-transition="2-digit-3" d="M225 83L402 220" markerEnd={arrow}/><path data-transition="1-dot-3" d="M266 240H393" markerEnd={arrow}/><path data-transition="3-e-4" d="M446 240H573" markerEnd={arrow}/><path data-transition="4-sign-5" d="M626 240H733" markerEnd={arrow}/><path data-transition="5-digit-6" d="M786 240H903" markerEnd={arrow}/>
      <path data-transition="1-b-4" d="M250 267Q420 365 590 267" markerEnd={arrow}/><path data-transition="4-digit-6" d="M610 267Q765 330 920 267" markerEnd={arrow}/>
      {[1,3,6].map(n=><path key={n} data-transition={`${n}-digit-${n}`} d={`M${x[n]-14} 216C${x[n]-55} 130 ${x[n]+55} 130 ${x[n]+14} 216`} markerEnd={arrow}/>)}
      {x.map((cx,n)=><g key={n} data-state={n}><circle cx={cx} cy={y[n]} r="26" fill="var(--diagram-surface)"/>{[3,6].includes(n)&&<circle data-accepting={n} cx={cx} cy={y[n]} r="21"/>}</g>)}
      <rect x="80" y="130" width="65" height="34" fill="var(--diagram-surface)"/><rect x="393" y="345" width="65" height="34" fill="var(--diagram-surface)"/>
    </g><g fill="currentColor" textAnchor="middle">{x.map((cx,n)=><text key={n} x={cx} y={y[n]+8}>{n}</text>)}<text x="150" y="226">数字</text><text x="325" y="143">数字</text><text x="330" y="228">.</text><text x="510" y="225">e</text><text x="680" y="224">符号</text><text x="845" y="224">数字</text><text x="765" y="330">数字</text>{[1,3,6].map(n=><text key={n} x={x[n]} y="137">数字</text>)}<text x="112" y="154">a</text><text x="425" y="370">b</text></g>
  </>}</Drawing>;
}
function TreeDrawing({values,caption,example=false}:BookletFigureProps & {example?:boolean}) {
  const i=autumn2016Pm0104Case(values),tree:Autumn2016PmTree=example?['op',['op','v','w'],'x']:autumn2016Pm2Trees[i];
  if(example&&i)throw Error('PARAMETER_CONSTRAINT');
  let leaf=0;const nodes:{path:string;label:string;x:number;y:number}[]=[],edges:{from:string;to:string}[]=[];
  function layout(t:Autumn2016PmTree,p='r',depth=0):number {
    const y=45+depth*100;
    if(typeof t==='string'){const x=55+leaf++*105;nodes.push({path:p,label:t,x,y});return x;}
    const lx=layout(t[1],p+'l',depth+1),rx=layout(t[2],p+'r',depth+1),x=(lx+rx)/2;
    nodes.push({path:p,label:t[0],x,y});edges.push({from:p,to:p+'l'},{from:p,to:p+'r'});return x;
  }
  layout(tree);const height=Math.max(...nodes.map(n=>n.y))+45,width=example?330:550;
  return <Drawing values={values} caption={caption} profile={example?profiles.example:profiles.tree} width={width} height={height+30}>{arrow=><>
    <g stroke="currentColor" strokeWidth="2" fill="none">{edges.map(edge=>{const a=nodes.find(n=>n.path===edge.from)!,b=nodes.find(n=>n.path===edge.to)!;return <path key={edge.to} data-tree-parent={edge.from} data-tree-child={edge.to} d={`M${a.x} ${a.y+12}L${b.x} ${b.y-18}`}/>;})}
      {example&&<><path data-traversal="v-return" d="M171 53Q82 126 31 248Q30 286 62 254L98 165" markerEnd={arrow}/><path data-traversal="w-return" d="M117 163Q165 274 186 245Q192 218 126 160" markerEnd={arrow}/><path data-traversal="x-return" d="M201 58Q259 175 284 150Q299 128 206 57" markerEnd={arrow}/></>}
    </g><g fill="currentColor" fontSize="25" textAnchor="middle">{nodes.map(n=><text key={n.path} data-tree-node={n.path} x={n.x} y={n.y+7}>{n.label}</text>)}</g>
  </>}</Drawing>;
}
function DataTable({caption,columns,rows,keys}:{caption:string;columns:string[];rows:string[][];keys:number[]}) {
  return <table style={{...tab,marginBottom:'1.3em'}}><caption style={{textAlign:'left',padding:'.2em'}}>{caption}</caption><thead><tr>{columns.map((text,i)=><th style={cell} scope="col" key={i}>{keys.includes(i)?primary(text):text}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((text,j)=><td style={cell} key={j}>{text}</td>)}</tr>)}</tbody></table>;
}
function BeforeTables({values,caption}:BookletFigureProps) {
  const i=autumn2016Pm0104Case(values);
  return <Native caption={caption} width={720}><DataTable caption="従業員表" columns={['従業員番号','氏名','住所','…','通勤手当']} rows={ [['00980125','情報太郎','東京都文京区○○○','…',String(autumn2016Pm3Allowance(i))],['⋮','⋮','⋮','⋮','⋮']] } keys={[0]}/></Native>;
}
function AfterTables({values,caption}:BookletFigureProps) {
  const c=autumn2016Pm3Cases[autumn2016Pm0104Case(values)];
  return <Native caption={caption} width={680}><DataTable caption="従業員表" columns={['従業員番号','氏名','住所','…']} rows={ [['00980125','情報太郎','東京都文京区○○○','…'],['⋮','⋮','⋮','⋮']] } keys={[0]}/><div style={{maxWidth:'80%'}}><DataTable caption="通勤費表" columns={['従業員番号','交通機関コード','交通費']} rows={ [['00980125','B02',String(c.costs[0])],['00980125','S01',String(c.costs[1])],['⋮','⋮','⋮']] } keys={[0,1]}/><DataTable caption="交通機関表" columns={['交通機関コード','交通機関名']} rows={ [['B01','○○バス'],['B02','△△バス'],['⋮','⋮'],['C01','自家用車'],['⋮','⋮']] } keys={[0]}/></div></Native>;
}
function Training({values,caption}:BookletFigureProps) {
  const c=autumn2016Pm3Cases[autumn2016Pm0104Case(values)];
  return <Native caption={caption} width={420}><DataTable caption="講習会受講表" columns={['従業員番号','受講日']} rows={ [['00980125',c.date],['⋮','⋮']] } keys={[0,1]}/></Native>;
}
function Inequality({values,caption}:BookletFigureProps) {
  alt(profiles.inequality,values);
  return <Native caption={caption} captionPosition="accessible" width={780}><div data-transfer-inequality style={{whiteSpace:'nowrap',fontFamily:'serif',fontSize:'1.2em',padding:'.5em',textAlign:'center'}}><BlankText text="[[b]]＋3×t＋[[c]]＋(3×t＋[[d]])×n≦5"/></div></Native>;
}
function Transfers({values,caption}:BookletFigureProps) {
  alt(profiles.transfers,values);
  return <Native caption={caption} width={920}><table style={tab}><thead><tr>{['データの状態','要求','結果','時間（秒）'].map(text=><th key={text} style={cell} scope="col">{text}</th>)}</tr></thead><tbody><tr><td style={cell}>キャッシュ<br/>されていない</td><td style={cell}>データの転送</td><td style={cell}>当該データ（vバイト）の受信</td><td style={cell}>3×t＋v÷e</td></tr><tr><td style={cell} rowSpan={2}>キャッシュ<br/>されている</td><td style={cell} rowSpan={2}>データの再転送の要否確認</td><td style={cell}>〈再転送が不要な場合〉<br/>再転送が不要であるとの応答</td><td style={cell}>t</td></tr><tr><td style={cell}>〈再転送が必要な場合〉<br/>当該データ（vバイト）の受信</td><td style={cell}>3×t＋v÷e</td></tr></tbody></table></Native>;
}
export const legacy2016AutumnPm0104FigureRenderers: BookletFigureRenderer[] = [
  {profile:profiles.cia,component:Cia},{profile:profiles.inequality,component:Inequality},
  {profile:profiles.prose1,component:props=><Prose {...props} number={1}/>},{profile:profiles.prose2,component:props=><Prose {...props} number={2}/>},{profile:profiles.prose3,component:props=><Prose {...props} number={3}/>},{profile:profiles.prose4,component:props=><Prose {...props} number={4}/>},
  {profile:profiles.lexical,component:props=><Grammar {...props} kind={0}/>},{profile:profiles.expression,component:props=><Grammar {...props} kind={1}/>},{profile:profiles.factor,component:props=><Grammar {...props} kind={2}/>},
  {profile:profiles.queryE,component:props=><Sql {...props} kind={0}/>},{profile:profiles.queryF,component:props=><Sql {...props} kind={1}/>},{profile:profiles.queryG,component:props=><Sql {...props} kind={2}/>},
  {profile:profiles.network,component:Network},{profile:profiles.rules,component:Firewall},{profile:profiles.dfa,component:Dfa},
  {profile:profiles.example,component:props=><TreeDrawing {...props} example/>},{profile:profiles.tree,component:TreeDrawing},
  {profile:profiles.before,component:BeforeTables},{profile:profiles.after,component:AfterTables},{profile:profiles.training,component:Training},{profile:profiles.transfers,component:Transfers},
];
