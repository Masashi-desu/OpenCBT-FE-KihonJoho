import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { autumn2013Pm0104Alt, autumn2013Pm0104Profiles as f, fullAdderRows, exchangeNotes,
  type Autumn2013Pm0104Profile } from '../core/generators/legacy-2013-autumn-pm-01-04-figures';
import { baseballRows, baseballTableKeys, baseballTables, gateCases, gateChoices, vpnCases } from '../core/generators/legacy-2013-autumn-pm-01-04-models';

function Drawing({ caption, profile, values, width, height, children }: BookletFigureProps & {
  profile: Autumn2013Pm0104Profile; width: number; height: number; children: (arrow: string) => ReactNode;
}) {
  const id = useId();
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption + '。左右にスクロールできます。'}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id + '-title'} aria-describedby={id + '-desc'}
        data-legacy-2013-autumn-pm-figure={profile}
        style={{display:'block',width:`calc(${width}px * var(--image-scale, 1))`,maxWidth:'none',height:'auto',color:'var(--diagram-ink)'}}>
        <title id={id + '-title'}>{caption}</title><desc id={id + '-desc'}>{autumn2013Pm0104Alt(profile, values)}</desc>
        <defs><marker id={id + '-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </marker></defs>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" fontSize="15">
          {children('url(#' + id + '-arrow)')}
        </g>
      </svg>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Label({x,y,children,left=false}:{x:number;y:number;children:ReactNode;left?:boolean}) {
  return <text x={x} y={y} textAnchor={left ? 'start' : 'middle'} stroke="none" fill="currentColor">{children}</text>;
}
function Box({x,y,w,h,children,round=0}:{x:number;y:number;w:number;h:number;children?:ReactNode;round?:number}) {
  return <g><rect x={x} y={y} width={w} height={h} rx={round} fill="var(--diagram-surface)"/>{children}</g>;
}
function Gate({x,y,w,h,label,blank=false}:{x:number;y:number;w:number;h:number;label:string;blank?:boolean}) {
  return <g data-circuit-gate={blank ? 'blank' : label}>
    <Box x={x} y={y} w={w} h={h}>
      {blank && <rect x={x+7} y={y+h/2-12} width={w-14} height={24} strokeWidth="2"/>}
      {label && <Label x={x+w/2} y={y+h/2+5}>{label}</Label>}
    </Box>
  </g>;
}

function LogicChoice(props:BookletFigureProps) {
  const choice = gateChoices[props.values[0]];
  return <Drawing {...props} profile={f.option} width={374} height={100}>{() => <>
    <Label x={27} y={32}>X</Label><Label x={27} y={71}>Y</Label><Label x={350} y={52}>Z</Label>
    <path d="M38 27H168M38 66H168M241 47H338"/>
    {choice.first[0] && <><Gate x={73} y={14} w={59} h={26} label={choice.first[0]}/>
      <Gate x={73} y={53} w={59} h={26} label={choice.first[1]}/></>}
    <Gate x={168} y={10} w={73} h={74} label={choice.combine}/>
    {choice.last && <Gate x={259} y={34} w={59} h={26} label={choice.last}/>}
  </>}</Drawing>;
}

function Half(props:BookletFigureProps) {
  const blank = gateCases[props.values[0]].halfBlank;
  return <Drawing {...props} profile={f.half} width={400} height={176}>{() => <>
    <Label x={26} y={35}>X</Label><Label x={26} y={68}>Y</Label>
    <Label x={350} y={52}>Z</Label><Label x={350} y={132}>C</Label>
    <path d="M40 30H165M40 63H165M239 47H339M239 127H339M90 63V146H165M115 30V55Q131 63 115 71V110H165"/>
    <circle cx={90} cy={63} r={3} fill="currentColor"/><circle cx={115} cy={30} r={3} fill="currentColor"/>
    <Gate x={165} y={17} w={74} h={60} label={blank === 'Z' ? '' : 'XOR'} blank={blank === 'Z'}/>
    <Gate x={165} y={97} w={74} h={60} label={blank === 'C' ? '' : 'AND'} blank={blank === 'C'}/>
  </>}</Drawing>;
}

function Truth({ values, caption }:BookletFigureProps) {
  return <figure className="managed-diagram source-figure" role="group" aria-description={autumn2013Pm0104Alt(f.truth, values)}>
    <div className="table-scroll" tabIndex={0}>
      <table aria-label={caption}>
        <thead><tr>{['Cin','X','Y','C','Z'].map(col => <th key={col} scope="col">{col}</th>)}<th aria-label="注記" style={{border:'none'}}/></tr></thead>
        <tbody>{fullAdderRows.map((row, i) => <tr key={i} data-beta={i===3 || i===4 ? 'true' : undefined}>
          {row.map((value,j) => <td key={j}>{value}</td>)}
          {i === 3 ? <td rowSpan={2} style={{border:'none'}}>｝β</td> : i !== 4 && <td style={{border:'none'}}/>}
        </tr>)}</tbody>
      </table>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Full(props:BookletFigureProps) {
  return <Drawing {...props} profile={f.full} width={660} height={174}>{() => <>
    <Label x={27} y={39}>X</Label><Label x={27} y={86}>Y</Label><Label x={27} y={127}>Cin</Label>
    <Label x={616} y={39}>Z</Label><Label x={616} y={118}>C</Label>
    <path d="M42 34H74M42 81H74M209 34H275M410 34H602M410 81H501M42 122H258V81H275M209 81H234V113Q248 121 234 129V145H501M575 113H602"/>
    {[74,275].map(x => <Box key={x} x={x} y={15} w={135} h={84}>
      <Label x={x+12} y={39}>X</Label><Label x={x+12} y={86}>Y</Label>
      <Label x={x+121} y={39}>Z</Label><Label x={x+121} y={86}>C</Label>
      <Label x={x+68} y={62}>半加算器</Label>
    </Box>)}
    <Gate x={501} y={66} w={74} h={94} label="" blank/>
  </>}</Drawing>;
}

function Ripple(props:BookletFigureProps) {
  return <Drawing {...props} profile={f.ripple} width={880} height={130}>{arrow => <>
    {[1,2,3,4].map((bit,i) => {
      const x=42+i*220;
      return <g key={bit} data-adder-bit={bit}>
        <path d={`M${x-18} 31H${x}M${x-18} ${i===0?84:57}H${x}M${x+116} 31h14`}/>
        <Label x={x-28} y={36}>A{bit}</Label><Label x={x-28} y={i===0?89:62}>B{bit}</Label>
        <Label x={x+144} y={36}>S{bit}</Label>
        <Box x={x} y={14} w={116} h={90}>
          <Label x={x+12} y={36}>X</Label><Label x={x+12} y={i===0?89:62}>Y</Label>
          <Label x={x+105} y={36}>Z</Label><Label x={x+105} y={89}>C</Label>
          {i!==0 && <Label x={x+17} y={89}>Cin</Label>}
          <Label x={x+60} y={67}>{i===0?'半加算器':'全加算器'}</Label>
        </Box>
        <path d={`M${x+116} 84h${i===3?16:104}`} markerEnd={i===3?undefined:arrow}/>
        <Label x={x+(i===3?145:142)} y={i===3?89:77}>C{bit}</Label>
      </g>;
    })}
  </>}</Drawing>;
}

function Overflow(props:BookletFigureProps) {
  return <Drawing {...props} profile={f.overflow} width={575} height={106}>{() => <>
    <path d="M48 26H117M48 53H117M202 39H267"/>
    <Label x={28} y={31}>C3</Label><Label x={28} y={58}>C4</Label><Label x={290} y={44}>VF¹</Label>
    <Gate x={117} y={15} w={85} h={49} label="c" blank/>
    <Label x={15} y={89} left>注1　桁あふれが生じたときVFの値は1，それ以外のときVFの値は0。</Label>
  </>}</Drawing>;
}

function Zero(props:BookletFigureProps) {
  return <Drawing {...props} profile={f.zero} width={618} height={162}>{() => <>
    {[1,2,3,4].map((value,i) => <g key={value}>
      <Label x={27} y={30+24*i}>S{value}</Label><path d={`M46 ${25+24*i}H117`}/>
    </g>)}
    <path d="M202 36H278M202 88H278M363 62H425"/>
    <Gate x={117} y={13} w={85} h={46} label="d" blank/>
    <Gate x={117} y={65} w={85} h={46} label="d" blank/>
    <Gate x={278} y={30} w={85} h={64} label="AND"/>
    <Label x={451} y={67}>ZF¹</Label>
    <Label x={15} y={140} left>注1　S1〜S4が全て0のときZFの値は1，それ以外のときZFの値は0。</Label>
  </>}</Drawing>;
}

function Baseball({ caption, values }:BookletFigureProps) {
  const [index, position] = values, key = baseballTableKeys[position], model = baseballTables[key];
  return <figure className="managed-diagram source-figure" role="group"
    aria-description={autumn2013Pm0104Alt(f.baseball, values)} data-baseball-table={key}>
    <div className="table-scroll" tabIndex={0}>
      <table aria-label={caption}>
        <caption>{caption}</caption>
        <thead><tr>{model.columns.map((name,i) => {
          const primary = (model.keys as readonly number[]).includes(i);
          return <th key={name} scope="col" data-primary-key={primary || undefined}
            style={primary ? {textDecorationLine:'underline',textDecorationStyle:'solid',whiteSpace:'nowrap'} : {whiteSpace:'nowrap'}}>{name}</th>;
        })}</tr></thead>
        <tbody>{baseballRows(key,index).map((row,i) => <tr key={i}>
          {row.map((value,j) => <td key={j} style={{whiteSpace:'nowrap'}}>{value}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </figure>;
}

function Network(props:BookletFigureProps) {
  return <Drawing {...props} profile={f.network} width={850} height={224}>{() => <>
    <Box x={8} y={20} w={385} h={192}/><Box x={465} y={20} w={377} h={192}/>
    <path d="M81 77h28v19h34M81 115h28V96M240 96H259M330 125V146M379 166h17M460 166h19M529 125V146M600 96h21M718 96h20"/>
    <Label x={200} y={45}>M事業所</Label><Label x={657} y={45}>N事業所</Label>
    <Box x={28} y={64} w={53} h={26}><Label x={54} y={82}>PC</Label></Box>
    <Box x={28} y={102} w={53} h={26}><Label x={54} y={120}>PC</Label></Box>
    {[[143,'ファイア','ウォール'],[259,'VPN','ルータ'],[518,'VPN','ルータ'],[621,'ファイア','ウォール']].map(([left,a,b]) => {
      const x = Number(left);
      return <Box key={x} x={x} y={68} w={x===143||x===621?97:82} h={57}>
        <Label x={x+(x===143||x===621?48:41)} y={91}>{a}</Label><Label x={x+(x===143||x===621?48:41)} y={111}>{b}</Label>
      </Box>;
    })}
    <Box x={318} y={146} w={61} h={40}><Label x={349} y={163}>WAN</Label><Label x={349} y={179}>ルータ</Label></Box>
    <Box x={479} y={146} w={61} h={40}><Label x={510} y={163}>WAN</Label><Label x={510} y={179}>ルータ</Label></Box>
    <ellipse cx={428} cy={166} rx={32} ry={45} fill="var(--diagram-surface)"/>
    <Label x={428} y={158}>インター</Label><Label x={428} y={178}>ネット</Label>
    <Box x={738} y={58} w={87} h={77}>
      <Label x={782} y={81}>営業支援</Label><Label x={782} y={101}>システム</Label><Label x={782} y={121}>サーバ</Label>
    </Box>
  </>}</Drawing>;
}

function Exchange(props:BookletFigureProps) {
  const title = ['M事業所VPNルータ','N事業所VPNルータ'];
  return <Drawing {...props} profile={f.exchange} width={750} height={407}>{arrow => <>
    {[15,514].map((x,i) => {
      const local=i===0?'X':'Y', own=i===0?'A':'B', remote=i===0?'B':'A';
      return <g key={x}>
        <path d={`M${x+111} 72V257`}/>
        <Box x={x} y={16} w={221} h={32}><Label x={x+111} y={37}>{title[i]}</Label></Box>
        <Box x={x} y={64} w={221} h={30} round={10}><Label x={x+111} y={84}>乱数{local}の生成</Label></Box>
        <Box x={x} y={107} w={221} h={55} round={10}>
          <Label x={x+111} y={128}>鍵{own}の作成</Label>
          <Label x={x+111} y={150}>鍵{own}＝2<tspan dy={-6} fontSize="11">{local}</tspan><tspan dy={6}> mod Z</tspan></Label>
        </Box>
        <Box x={x} y={177} w={221} h={27} round={9}><Label x={x+111} y={196}>鍵A{i===0?'送信':'受信'}</Label></Box>
        <Box x={x} y={218} w={221} h={27} round={9}><Label x={x+111} y={237}>鍵B{i===0?'受信':'送信'}</Label></Box>
        <Box x={x} y={259} w={221} h={55} round={10}>
          <Label x={x+111} y={280}>DH鍵の作成</Label>
          <Label x={x+111} y={302}>DH鍵＝鍵{remote}<tspan dy={-6} fontSize="11">{local}</tspan><tspan dy={6}> mod Z</tspan></Label>
        </Box>
      </g>;
    })}
    <path d="M236 190H513" markerEnd={arrow}/><path d="M514 231H237" markerEnd={arrow}/>
    <Label x={375} y={182}>鍵Aの送付</Label><Label x={375} y={223}>鍵Bの送付</Label>
    {exchangeNotes('M','N').map((note,i) => <Label key={i} x={25} y={333+i*20} left>{note}</Label>)}
  </>}</Drawing>;
}

function DocumentShape({x,y,w,lines}:{x:number;y:number;w:number;lines:string[]}) {
  const h=22+lines.length*15;
  return <g><path d={`M${x+17} ${y}h${w-17}l-17 ${h}h-${w-17}Z`} fill="var(--diagram-surface)"/>
    {lines.map((text,i) => <Label key={i} x={x+w/2} y={y+20+i*15}>{text}</Label>)}
  </g>;
}
function Signature(props:BookletFigureProps) {
  const {sender,receiver}=vpnCases[props.values[0]];
  return <Drawing {...props} profile={f.signature} width={994} height={367}>{arrow => <>
    <Box x={12} y={44} w={437} h={311}/><Box x={532} y={44} w={448} h={311}/>
    <Label x={233} y={30}>{sender}事業所（送信側）VPNルータ</Label>
    <Label x={755} y={30}>{receiver}事業所（受信側）VPNルータ</Label>
    {['M123 87H331','M82 102V265','M150 295H332','M385 281V159','M434 87H548','M660 87H873','M920 105V175','M601 128V267','M660 295H862'].map(segment =>
      <path key={segment} d={segment} markerEnd={arrow}/>)}
    <Label x={224} y={76}>共通鍵で暗号化</Label>
    <Label x={143} y={180}>ハッシュ値を計算</Label>
    <Label x={281} y={287}>で署名作成</Label>
    <Label x={804} y={76}>で復号</Label><Label x={850} y={148}>ハッシュ値を計算</Label>
    <Label x={805} y={286}>で復号</Label>
    <ellipse cx={491} cy={104} rx={32} ry={57} fill="var(--diagram-surface)"/>
    <Label x={491} y={100}>インター</Label><Label x={491} y={120}>ネット</Label>
    <DocumentShape x={24} y={65} w={105} lines={['データ']}/>
    <DocumentShape x={24} y={266} w={128} lines={['認証用','ハッシュ値','567…']}/>
    <DocumentShape x={326} y={65} w={112} lines={['暗号文','***']}/>
    <DocumentShape x={326} y={106} w={112} lines={['署名','xxxxxxx']}/>
    <DocumentShape x={326} y={269} w={112} lines={['署名','xxxxxxx']}/>
    <DocumentShape x={546} y={65} w={119} lines={['暗号文','***']}/>
    <DocumentShape x={546} y={106} w={119} lines={['署名','xxxxxxx']}/>
    <DocumentShape x={546} y={269} w={119} lines={['署名','xxxxxxx']}/>
    <DocumentShape x={862} y={65} w={106} lines={['データ']}/>
    <DocumentShape x={849} y={177} w={123} lines={['署名検証用','ハッシュ値','567…']}/>
    <DocumentShape x={849} y={266} w={123} lines={['認証用','ハッシュ値','567…']}/>
    <path d="M919 254V245" strokeDasharray="4 3" markerEnd={arrow}/>
    <path d="M919 254V263" strokeDasharray="4 3" markerEnd={arrow}/>
    <Label x={752} y={255}>ハッシュ値の一致を確認</Label>
    {[[188,267,'a'],[712,58,'b'],[712,267,'c']].map(([x,y,label]) =>
      <Box key={label} x={Number(x)} y={Number(y)} w={55} h={27}><Label x={Number(x)+27} y={Number(y)+19}>{label}</Label></Box>)}
  </>}</Drawing>;
}

export const legacy2013AutumnPm0104FigureRenderers: BookletFigureRenderer[] = [
  {profile:f.option,component:LogicChoice}, {profile:f.half,component:Half}, {profile:f.truth,component:Truth},
  {profile:f.full,component:Full}, {profile:f.ripple,component:Ripple}, {profile:f.overflow,component:Overflow}, {profile:f.zero,component:Zero},
  {profile:f.baseball,component:Baseball}, {profile:f.network,component:Network}, {profile:f.exchange,component:Exchange},
  {profile:f.signature,component:Signature},
];
