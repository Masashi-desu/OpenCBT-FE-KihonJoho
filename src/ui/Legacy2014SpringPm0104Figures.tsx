import { useId, type CSSProperties, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2014SpringPm0104Figures, spring2014Pm0104Alt, spring2014Pm0104Profiles as f } from '../core/generators/legacy-2014-spring-pm-01-04-figures';
import { displayedParallelIndexRows, ethernetCases, loopPrograms, parallelAssignments, parallelCases, partitionSizes, riskStages, sites, wordFields } from '../core/generators/legacy-2014-spring-pm-01-04-models';

type Profile=(typeof f)[keyof typeof f];
function Drawing({profile,values,caption,width,height,children}:BookletFigureProps & {
  profile:Profile;width:number;height:number;children:(arrow:string)=>ReactNode;
}) {
  const id=useId();
  legacy2014SpringPm0104Figures.find(item=>item.profile===profile)!.validate(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
        data-legacy-2014-spring-pm-figure={profile}
        style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',color:'var(--diagram-ink)'}}>
        <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{spring2014Pm0104Alt(profile,values[0])}</desc>
        <defs><marker id={id+'-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" fontSize="15">
          {children('url(#'+id+'-arrow)')}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
function Text({x,y,children,left=false,mono=false}:{x:number;y:number;children:ReactNode;left?:boolean;mono?:boolean}){
  return <text x={x} y={y} textAnchor={left?'start':'middle'} stroke="none" fill="currentColor"
    fontFamily={mono?'var(--font-mono)':undefined}>{children}</text>;
}
function Box({x,y,w,h,children,dashed=false,round=0}:{x:number;y:number;w:number;h:number;children?:ReactNode;dashed?:boolean;round?:number}){
  return <g><rect x={x} y={y} width={w} height={h} rx={round} strokeDasharray={dashed?'6 4':undefined} fill="var(--diagram-surface)"/>
    {children}</g>;
}
function Risk(props:BookletFigureProps){
  return <Drawing {...props} profile={f.risk} width={778} height={119}>{arrow=><>
    {riskStages.map(([title,...items],i)=>{
      const x=7+i*259;
      return <Box key={title} x={x} y={9} w={227} h={100}>
        <Text x={x+113.5} y={30}>{title}</Text><path d={`M${x} 39h227`}/>
        {items.map((item,j)=><Text key={item} x={x+7} y={58+j*20} left>・{item}</Text>)}
        {i<2&&<path d={`M${x+232} 64h23`} markerEnd={arrow}/>}
      </Box>;
    })}
  </>}</Drawing>;
}
function Word(props:BookletFigureProps){
  return <Drawing {...props} profile={f.word} width={634} height={100}>{()=><>
    <Text x={14} y={25} left>（ビット番号）</Text>
    {wordFields.map(([name,hi,lo])=>{
      const x=122+(15-hi)*30, w=(hi-lo+1)*30;
      return <g key={name} data-word-field={name} data-bit-hi={hi} data-bit-lo={lo}>
        <Text x={x+9} y={25}>{hi}</Text><Text x={x+w-9} y={25}>{lo}</Text>
        <Box x={x} y={32} w={w} h={49}>
          {name==='r 又は m'?<><Text x={x+w/2} y={50}>r 又は</Text><Text x={x+w/2} y={70}>m</Text></>:
            <Text x={x+w/2} y={61}>{name}</Text>}
        </Box>
      </g>;
    })}
  </>}</Drawing>;
}
function Parallel(props:BookletFigureProps){
  return <Drawing {...props} profile={f.parallel} width={649} height={325}>{arrow=><>
    <Text x={138} y={22}>プログラムAのプロセス</Text>
    <Box x={33} y={30} w={210} h={277} round={5}>
      <Text x={138} y={57}>データ作成</Text>
      <path d="M138 66V97" markerEnd={arrow}/>
      <Text x={138} y={117}>計算処理</Text>
      <Box x={51} y={129} w={174} h={100} dashed>
        <Text x={63} y={152} left>・計算用のn個の</Text><Text x={79} y={175} left>スレッドを生成</Text>
        <Text x={63} y={215} left>・同期処理</Text>
      </Box>
      <path d="M138 231v43" markerEnd={arrow}/><Text x={138} y={295}>結果出力</Text>
    </Box>
    {[['1',327,44],['2',391,132],['n',458,245]].map(([label,px,py])=>{
      const x=Number(px),y=Number(py);
      return <g key={label}>
        <path d={`M243 152L${x} ${y+4}`} markerEnd={arrow}/><path d={`M${x} ${y+49}L243 211`} markerEnd={arrow}/>
        <Text x={x+75} y={y-6}>スレッド{label}</Text>
        <Box x={x} y={y} w={150} h={49}><Text x={x+75} y={y+30}>部分計算処理</Text></Box>
      </g>;
    })}
    <Text x={522} y={220}>⋱</Text>
  </>}</Drawing>;
}
function Processor(props:BookletFigureProps){
  return <Drawing {...props} profile={f.processor} width={528} height={258}>{arrow=><>
    <Text x={264} y={20}>プログラムAのプロセス</Text>
    <Box x={24} y={28} w={480} h={47} round={5}/>
    <Box x={24} y={102} w={480} h={140} round={5}/>
    {[['1',97],['2',247],['n',427]].map(([label,pos])=>{
      const x=Number(pos);
      return <g key={label}>
        <Box x={x-57} y={35} w={114} h={33} round={5}><Text x={x} y={57}>スレッド{label}</Text></Box>
        <path d={`M${x} 143v22`} markerEnd={undefined}/>
        <path d={`M${x} 69v45`} markerEnd={arrow}/>
        <ellipse cx={x} cy={130} rx="54" ry="15" fill="var(--diagram-surface)"/><Text x={x} y={135}>CPU{label}</Text>
      </g>;
    })}
    <Text x={335} y={55}>…</Text><Text x={335} y={135}>…</Text>
    <path d="M97 165H427M247 165v22"/><Text x={409} y={185}>バス</Text>
    <Box x={180} y={187} w={134} h={29}><Text x={247} y={207}>共有メモリ</Text></Box>
    <Text x={264} y={235}>マルチプロセッサ</Text>
  </>}</Drawing>;
}

function LoopBox({x,y,w,heading,range,assignment,dashed=false}:{
  x:number;y:number;w:number;heading:string;range:string;assignment:string;dashed?:boolean;
}){
  return <g>
    <Text x={x+5} y={y-7} left>{heading}</Text>
    <Box x={x} y={y} w={w} h={61} dashed={dashed}>
      <path d={`M${x+17} ${y+13}v34`}/>
      {[13,47].map(offset=><rect key={offset} x={x+12} y={y+offset-4} width="10" height="9" fill="currentColor"/>)}
      <Text x={x+29} y={y+21} left mono>{range}</Text>
      <Text x={x+29} y={y+43} left mono>・{assignment}</Text>
    </Box>
  </g>;
}
function SplitLoop(props:BookletFigureProps & {indirect?:boolean}){
  const i=props.values[0], c=parallelCases[i], indirect=Boolean(props.indirect);
  const total=indirect?20:c.split, groups=indirect?c.groups:Array<number>(4).fill(total/4);
  const assignment=parallelAssignments[Number(indirect)];
  return <Drawing {...props} profile={indirect?f.indirect:f.split} width={805} height={355}>{arrow=><>
    <LoopBox x={17} y={143} w={300} heading={indirect?'プログラム4':'並列実行が可能なループ'} range={'i: 1, i ≦ '+total+', 1'} assignment={assignment}/>
    {partitionSizes(groups).map(([lo,hi],j)=>{
      const x=404+j*28,y=29+j*80;
      return <g key={lo} data-loop-first={lo} data-loop-last={hi}>
        <path d={`M317 172L${x} ${y+32}`} markerEnd={arrow}/>
        <LoopBox x={x} y={y} w={302} heading={'スレッド'+(j+1)} range={'i: '+lo+', i ≦ '+hi+', 1'} assignment={assignment} dashed/>
      </g>;
    })}
  </>}</Drawing>;
}
function Indirect(props:BookletFigureProps){return <SplitLoop {...props} indirect/>;}
function Dependence(props:BookletFigureProps){
  return <Drawing {...props} profile={f.dependence} width={381} height={282}>{()=>
    loopPrograms(props.values[0]).map(([range,assignment],i)=><g key={i} data-program={i+1}
      data-loop-range={range} data-loop-assignment={assignment}>
      <LoopBox x={22} y={29+i*90} w={337} heading={'プログラム'+(i+1)} range={range} assignment={assignment} dashed/>
    </g>)
  }</Drawing>;
}
function IpAnswerTable({values,caption}:BookletFigureProps){
  const [i,selection]=values;
  legacy2014SpringPm0104Figures.find(item=>item.profile===f.indices)!.validate(values);
  const separators=new Set(partitionSizes(parallelCases[i].groups).slice(0,-1).map(([,hi])=>hi));
  const cells=Array.from({length:20},(_,j)=>j+1), rows=displayedParallelIndexRows(i,selection);
  const cell=(column:number):CSSProperties=>({
    padding:'.32em .47em',textAlign:'center',minInlineSize:'1.35em',
    borderBlock:'1px solid var(--diagram-ink)',
    borderInlineEnd:separators.has(column)?'1px dashed var(--diagram-ink)':undefined,
  });
  const rowHead:CSSProperties={...cell(0),borderInline:'1px solid var(--diagram-ink)'};
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      <table data-legacy-2014-spring-pm-figure={f.indices} data-ip-selection={selection}
        style={{borderCollapse:'collapse',color:'var(--diagram-ink)',background:'var(--diagram-surface)',
          fontSize:'calc(1em * var(--image-scale, 1))',whiteSpace:'nowrap',borderInlineEnd:'1px solid var(--diagram-ink)'}}>
        <caption>{caption}</caption>
        <colgroup span={1}/><colgroup span={20}/>
        <thead>
          <tr><td/><th colSpan={20} scope="colgroup" style={{...cell(20),borderInlineStart:'1px solid var(--diagram-ink)'}}>ip</th></tr>
          <tr><th scope="col" style={rowHead}>i</th>
            {cells.map(column=><th key={column} scope="col" style={cell(column)} data-ip-heading={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>{rows.map(({mark,cells:valuesInRow})=><tr key={mark} data-ip-row={mark}>
          <th scope="row" style={rowHead}>{mark}</th>
          {valuesInRow.map((value,j)=><td key={j} data-ip-column={j+1} data-ip-value={value}
            data-ip-thread-end={separators.has(j+1)?'true':undefined} style={cell(j+1)}>{value}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </figure>;
}

function Network(props:BookletFigureProps){
  const c=ethernetCases[props.values[0]], rates=[c.main,c.sapporo,c.osaka,c.hiroshima];
  const edges=[[130,54,247,91,187,65],[409,82,552,44,477,47],[425,105,548,105,479,97],[411,131,552,170,477,164]];
  return <Drawing {...props} profile={f.network} width={688} height={221}>{()=><>
    <ellipse cx="336" cy="106" rx="89" ry="44" fill="var(--diagram-surface)"/>
    <Text x={336} y={112}>広域Ethernet</Text>
    {edges.map(([x1,y1,x2,y2,tx,ty],i)=><g key={i} data-site={sites[i]} data-mbps={rates[i]}>
      <path d={`M${x1} ${y1}L${x2} ${y2}`}/>
      <circle cx={i===0?x2:x1} cy={i===0?y2:y1} r="6" fill="var(--diagram-surface)"/>
      <Text x={tx} y={ty}>{rates[i]}Mbps</Text>
      <Text x={i===0?110:556} y={i===0?47:y2+5} left={i!==0}>{sites[i]}</Text>
    </g>)}
    <Text x={19} y={185} left>bps：ビット／秒、数字は契約した回線速度</Text>
    <circle cx="27" cy="201" r="6" fill="var(--diagram-surface)"/>
    <Text x={40} y={207} left>：アクセスポイント</Text>
  </>}</Drawing>;
}
function Sequence(props:BookletFigureProps){
  return <Drawing {...props} profile={f.sequence} width={556} height={522}>{arrow=><>
    <Text x={110} y={27}>ファイルサーバ</Text><Text x={352} y={27}>PC</Text>
    <path d="M110 33v454M352 33v454"/>
    {[0,1,2].map(j=>{
      const y=45+132*j;
      return <g key={j} data-sequence-block={j+1}>
        <path d={`M352 ${y}L110 ${y+51}`} markerEnd={arrow}/>
        <Text x={227} y={y+19}>読出し要求 ({j+1})</Text>
        <path d={`M110 ${y+51}L352 ${y+106}M110 ${y+72}L352 ${y+132}`} strokeDasharray="6 4" markerEnd={arrow}/>
        <Text x={227} y={y+92}>データブロック ({j+1})</Text>
        <rect x="101" y={y+51} width="9" height="21" fill="currentColor"/>
        <rect x="352" y={y+106} width="9" height="26" fill="currentColor"/>
      </g>;
    })}
    <path d="M352 45h43M352 151h43M383 45v106" markerStart={arrow} markerEnd={arrow}/>
    <Text x={394} y={103} left>応答時間</Text><Text x={229} y={468}>⋮</Text>
    <rect x="372" y="386" width="11" height="30" fill="currentColor"/>
    <Text x={392} y={397} left>データブロックの</Text><Text x={392} y={414} left>伝送に要する時間</Text>
  </>}</Drawing>;
}
function Devices(props:BookletFigureProps){
  const boxes=[['ファイルサーバ',18,143],['SW',169,63],['接続装置',241,105],['接続装置',499,105],['SW',613,63],['PC',685,63]] as const;
  return <Drawing {...props} profile={f.devices} width={782} height={135}>{()=><>
    <Text x={10} y={22} left>本社</Text><Text x={487} y={22} left>各営業所</Text>
    <Box x={10} y={31} w={345} h={65} dashed/><Box x={488} y={31} w={272} h={65} dashed/>
    <path d="M18 64H749"/>
    {boxes.map(([name,x,w])=><Box key={x} x={x} y={43} w={w} h={42}><Text x={x+w/2} y={69}>{name}</Text></Box>)}
    <ellipse cx="422" cy="64" rx="64" ry="31" fill="var(--diagram-surface)"/>
    <Text x={422} y={69}>広域Ethernet</Text>
    <Text x={12} y={117} left>SW：LANスイッチ</Text>
  </>}</Drawing>;
}

function Batch(props:BookletFigureProps){
  const batch=ethernetCases[props.values[0]].batch, xs=[97,245,490,640], baseline=44;
  const exchanges=(from:number,to:number,start:number,arrow:string)=>Array.from({length:batch},(_,j)=>{
    const y=start+j*11;
    return <g key={j} data-local-block={j+1}>
      {j>0&&<path d={`M${to} ${y}L${from} ${y+2}`} markerEnd={arrow}/>}
      <path d={`M${from} ${y+5}L${to} ${y+8}`} markerEnd={arrow} strokeDasharray="5 3"/>
    </g>;
  });
  return <Drawing {...props} profile={f.batch} width={738} height={556}>{arrow=><>
    {xs.map((x,i)=><g key={x}>
      <Text x={x} y={23}>{['ファイルサーバ','接続装置','接続装置','PC'][i]}</Text>
      <path d={`M${x} 29v483`}/>
      <Text x={x} y={486}>⋮</Text>
    </g>)}
    {[0,1].map(turn=>{
      const y=baseline+turn*261, label=turn*(batch)+1;
      return <g key={turn} data-batch-count={batch}>
        <path d={`M640 ${y}L490 ${y+5}L245 ${y+11}L97 ${y+17}`} markerMid={arrow} markerEnd={arrow}/>
        <Text x={174} y={y+9}>読出し要求 ({label})</Text>
        <Text x={369} y={y+1}>読出し要求 ({label})</Text>
        <Text x={563} y={y-6}>読出し要求 ({label})</Text>
        {exchanges(xs[0],xs[1],y+24,arrow)}
        <path d={`M245 ${y+137}L490 ${y+145}`} markerEnd={arrow} strokeDasharray="7 4"/>
        {turn===0&&<Text x={368} y={y+131}>データブロック ({batch}個)</Text>}
        {turn===0?exchanges(xs[2],xs[3],y+149,arrow):
          <path d={`M490 ${y+145}L640 ${y+152}`} markerEnd={arrow} strokeDasharray="7 4"/>}
      </g>;
    })}
    <Text x={110} y={baseline+261+48} left>読出し要求 ({batch+2})</Text>
    <Text x={52} y={541} left>注記　接続装置は、データブロック{batch}個をまとめて送ることができる。</Text>
  </>}</Drawing>;
}

export const legacy2014SpringPm0104Renderers:BookletFigureRenderer[]=[
  {profile:f.risk,component:Risk},{profile:f.word,component:Word},
  {profile:f.parallel,component:Parallel},{profile:f.processor,component:Processor},{profile:f.split,component:SplitLoop},
  {profile:f.dependence,component:Dependence},{profile:f.indirect,component:Indirect},{profile:f.indices,component:IpAnswerTable},
  {profile:f.network,component:Network},{profile:f.sequence,component:Sequence},{profile:f.devices,component:Devices},
  {profile:f.batch,component:Batch},
];
