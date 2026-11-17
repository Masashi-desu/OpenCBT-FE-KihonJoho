import {useId,type ReactNode} from 'react';
import type {BookletFigureProps,BookletFigureRenderer} from './booklet-figure-renderer-contract';
import {legacy2007SpringPm0105Figures,profiles,type FigureKind} from '../core/generators/legacy-2007-spring-pm-01-05-figures';
import {registerCases,wordHex} from '../core/generators/legacy-2007-spring-pm-1-model';
import {assignmentColumns,divisions,organizationColumns} from '../core/generators/legacy-2007-spring-pm-2-model';
import {activities} from '../core/generators/legacy-2007-spring-pm-3-model';
import {sortCases} from '../core/generators/legacy-2007-spring-pm-4-model';
import {fields,mergeCases} from '../core/generators/legacy-2007-spring-pm-5-model';

type DrawingProps=BookletFigureProps & {kind:FigureKind; width:number; height:number; children:ReactNode};
function Drawing({kind,caption,values,width,height,children}:DrawingProps) {
  const id=useId(),profile=profiles[kind], alt=legacy2007SpringPm0105Figures.find(item=>item.profile===profile)!.alt(values);
  return <figure className="managed-diagram source-figure">
    <div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
      <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'} viewBox={`0 0 ${width} ${height}`}
        style={{display:'block',width:`calc(${width}px * var(--image-scale, 1))`,height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
        <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
        <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.4}>{children}</g>
      </svg>
    </div>
  </figure>;
}
type Point={x:number;y:number};
function Label({x,y,children,size=15,start=false,end=false,under=false}:Point & {children:ReactNode;size?:number;start?:boolean;end?:boolean;under?:boolean}) {
  return <text x={x} y={y} fill="currentColor" stroke="none" textAnchor={start?'start':end?'end':'middle'} fontSize={size}
    textDecoration={under?'underline':undefined}>{children}</text>;
}
function Box({x,y,w,h,lines,form='box'}:Point & {w:number;h:number;lines:readonly string[];form?:'box'|'round'|'diamond'|'sub'|'loop'|'end'|'blank'|'dashed'}) {
  return <g>
    {form==='diamond'?<path d={`M${x} ${y+h/2}l${w/2} ${-h/2} ${w/2} ${h/2} ${-w/2} ${h/2}Z`}/>:
      form==='loop'?<path d={`M${x} ${y+h}v${15-h}l15 -15h${w-30}l15 15v${h-15}Z`}/>:
      form==='end'?<path d={`M${x} ${y}h${w}v${h-10}l-10 10h${20-w}l-10 -10Z`}/>:
      <rect x={x} y={y} width={w} height={h} rx={form==='round'?h/2:form==='dashed'?12:undefined}
        strokeDasharray={form==='dashed'?'5 4':undefined}/>}
    {(form==='sub'||form==='blank')&&<path d={`M${x+9} ${y}v${h}M${x+w-9} ${y}v${h}`}/>}
    {form==='blank'&&<rect x={x+w/2-36} y={y+4} width={72} height={h-8} strokeWidth={2.2}/>}
    {lines.map((line,i)=><Label key={i} x={x+w/2} y={y+h/2+5+(i-(lines.length-1)/2)*16}>{line}</Label>)}
  </g>;
}
function Word(props:BookletFigureProps) {
  return <Drawing {...props} kind="word" width={606} height={130}>
    <path d="M20 40H476V102H20ZM20 70H476M248 40V102M362 70V102"/>
    <Label x={30} y={29}>15</Label><Label x={230} y={29}>8</Label><Label x={263} y={29}>7</Label><Label x={471} y={29}>0</Label>
    <Label x={488} y={29} start>（ビット番号）</Label>
    <Label x={134} y={60}>命令部</Label><Label x={362} y={60}>オペランド部</Label>
    <Label x={134} y={91}>op</Label><Label x={305} y={91}>r</Label><Label x={419} y={91}>v</Label>
    <Label x={248} y={123}>図1　命令語の形式</Label>
  </Drawing>;
}
function Registers(props:BookletFigureProps) {
  const words=registerCases[props.values[0]].registers;
  return <Drawing {...props} kind="registers" width={317} height={209}>
    <Label x={81} y={23}>（レジスタ番号）</Label><Label x={169} y={23}>内容</Label>
    {words.map((value,i)=><g key={i}><rect x={131} y={35+i*27} width={76} height={27}/>
      <Label x={110} y={54+i*27}>{i+1}</Label><Label x={169} y={54+i*27}>{wordHex(value)}</Label>
    </g>)}
    <Label x={159} y={195}>図2　レジスタ1〜5の内容</Label>
  </Drawing>;
}
function Organization(props:BookletFigureProps) {
  return <Drawing {...props} kind="organization" width={870} height={185}>
    {divisions.map((group,i)=>{
      const x=10+i*285,y=20,last=y+25+(group.staff.length-1)*26;
      return <g key={group.code}><Box x={x} y={y} w={67} h={50} lines={[group.name,'（'+group.code+'）']}/>
        <path d={`M${x+67} ${y+25}H${x+91}V${last}`}/>
        {group.staff.map(([code,name],j)=><g key={code}>
          <path d={`M${x+91} ${y+25+j*26}h17`}/>
          <Label x={x+109} y={y+30+j*26} start>{'（'+code+'）'+name}</Label>
        </g>)}
      </g>;
    })}
    <Label x={370} y={171}>図1　A社の部門と所属の情報</Label>
  </Drawing>;
}
function Row({line,x,y,widths,under=true}: Point & {line:readonly string[];widths:readonly number[];under?:boolean}) {
  let position=x;
  return <g>
    <Label x={x-10} y={y+24} end>{line[0]}</Label>
    {line.slice(1).map((word,i)=>{
      const left=position, width=widths[i]; position+=width;
      return <g key={word}><rect x={left} y={y} width={width} height={37}/>
        {word.startsWith('［')&&<rect x={left+8} y={y+4} width={width-16} height={28} strokeWidth={2.4}/>}
        <Label x={left+width/2} y={y+24} under={under&&i===0}>{word.replace(/[［］]/g,'')}</Label></g>;
    })}
  </g>;
}
function Plans(props:BookletFigureProps) {
  return <Drawing {...props} kind="organization-plans" width={727} height={233}>
    <Row line={organizationColumns[0]} x={111} y={30} widths={[104,104,104,104]}/>
    <Row line={organizationColumns[1]} x={111} y={88} widths={[104,104,104,104]}/>
    <Row line={organizationColumns[2]} x={111} y={146} widths={[103,103]}/>
    <Row line={organizationColumns[3]} x={405} y={146} widths={[100,100,100]}/>
    <Label x={370} y={221}>図2　案1〜3</Label>
  </Drawing>;
}
function Assignments(props:BookletFigureProps) {
  return <Drawing {...props} kind="organization-assignment" width={626} height={170}>
    {assignmentColumns.map((line,i)=><Row key={line[0]} line={line} x={92+i%2*299} y={26+Math.floor(i/2)*58} widths={[103,103]}/>)}
    <Label x={315} y={151}>図3　案4</Label>
  </Drawing>;
}
function Network(props:BookletFigureProps) {
  const id=useId(), arrow=`url(#${id})`;
  const positions=[[31,90],[105,90],[180,90],[265,209],[265,153],[265,25],[384,90],[464,90],[544,90],[630,90]];
  const labels=[[68,82],[143,82],[219,47],[328,47],[424,82],[224,117],[322,119],[181,157],[417,171],[504,82],[588,82]];
  const edges=[...activities,[null,5,6,null] as const];
  return <Drawing {...props} kind="network" width={663} height={256}>
    <defs><marker id={id} viewBox="0 0 9 9" refX={8} refY={4.5} markerWidth={7} markerHeight={7} orient="auto">
      <path d="M1 1L8 4.5L1 8" fill="none" stroke="currentColor"/>
    </marker></defs>
    {edges.map(([mark,from,to],i)=>{
      const [x,y]=positions[from-1],[xx,yy]=positions[to-1], dx=xx-x,dy=yy-y,r=16/Math.hypot(dx,dy);
      return <g key={i}><line x1={x+r*dx} y1={y+r*dy} x2={xx-r*dx} y2={yy-r*dy} markerEnd={arrow} strokeDasharray={mark?undefined:'5 4'}/>
         {mark&&<Label x={labels[i][0]} y={labels[i][1]}>{mark}</Label>}</g>;
    })}
    {positions.map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={15}/><Label x={x} y={y+5}>{i+1}</Label></g>)}
    <Label x={330} y={245}>図　日程計画のアローダイアグラム</Label>
  </Drawing>;
}
function Sorting(props:BookletFigureProps) {
  const {base,rows}=sortCases[props.values[0]];
  return <Drawing {...props} kind="sorting" width={578} height={209}>
    <Label x={65} y={23}>A[]の要素番号</Label>
    {rows[0].map((_,i)=><Label key={i} x={154+58*i} y={23}>{base+i}</Label>)}
    {rows.map((row,idx)=><g key={idx}><Label x={88} y={54+53*idx}>{'例'+(idx+1)}</Label>
      {row.map((value,i)=><g key={i}><rect x={125+58*i} y={33+53*idx} width={58} height={31}/>
        <Label x={154+58*i} y={54+53*idx}>{value}</Label></g>)}
    </g>)}
    <Label x={318} y={196}>図　1次元配列 A[] の内容例</Label>
  </Drawing>;
}
function RecordLayout(props:BookletFigureProps) {
  return <Drawing {...props} kind="record" width={651} height={50}>
    <Row line={['',...fields]} x={10} y={5} widths={[99,135,212,173]} under={false}/>
  </Drawing>;
}
function Merge(props:BookletFigureProps) {
  const down=mergeCases[props.values[0]].order==='降順', limit=down?'最小値':'最大値';
  return <Drawing {...props} kind="merge" width={780} height={958}>
    <path d="M345 39V51M345 80V91M345 120V131M345 160V173M345 242V259M345 311V332M345 405V420M345 448V471M345 519V535M345 563V586M345 615V625M345 655V669M255 285H167V457H345M435 285H596V472M596 520V535M596 563V575H345M352 570L345 575L352 580"/>
    <Box x={235} y={10} w={220} h={29} lines={['主処理']} form="round"/>
    <Box x={235} y={51} w={220} h={29} lines={['各ファイルを開く']}/>
    <Box x={235} y={91} w={220} h={29} lines={['M入力処理']} form="sub"/>
    <Box x={235} y={131} w={220} h={29} lines={['T入力処理']} form="sub"/>
    <Box x={235} y={173} w={220} h={69} lines={['照合','Kₘ＝'+limit+' かつ','Kₜ＝'+limit]} form="loop"/>
    <rect x={141} y={250} width={587} height={333} rx={12} strokeDasharray="5 4"/>
    <Label x={512} y={241} start>注　M′は作業用記憶である。</Label>
    <Box x={255} y={259} w={180} h={52} lines={['Kₘ：Kₜ']} form="diamond"/>
    <Label x={246} y={277}>{down?'＞':'＜'}</Label><Label x={448} y={277}>{down?'＜':'＞'}</Label><Label x={361} y={325}>＝</Label>
    <Box x={235} y={332} w={220} h={73} lines={['Tの空白以外の項目を','M′の対応する項目に','転記する']}/>
    <path d="M497 365H458M468 360L458 365L468 370"/><Label x={509} y={370}>α</Label>
    <Box x={235} y={420} w={220} h={28} lines={['T入力処理']} form="sub"/>
    <Box x={235} y={471} w={220} h={48} lines={['M′を新マスタファイルに','出力する']}/>
    <Box x={486} y={472} w={220} h={48} lines={['Tを新マスタファイルに','出力する']}/>
    <path d="M743 493H710M720 488L710 493L720 498"/><Label x={753} y={499}>β</Label>
    <Box x={235} y={535} w={220} h={28} lines={['a']} form="blank"/>
    <Box x={486} y={535} w={220} h={28} lines={['b']} form="blank"/>
    <Box x={235} y={586} w={220} h={29} lines={['照合']} form="end"/>
    <Box x={235} y={625} w={220} h={30} lines={['各ファイルを閉じる']}/>
    <Box x={235} y={669} w={220} h={29} lines={['終了']} form="round"/>
    <InputFlow x={28} master limit={limit}/><InputFlow x={401} master={false} limit={limit}/>
    <Label x={385} y={948}>図1　更新プログラムの流れ</Label>
  </Drawing>;
}
function InputFlow({x,master,limit}:{x:number;master:boolean;limit:string}) {
  const kind=master?'M':'T', key=master?'Kₘ':'Kₜ', c=x+75, right=x+231;
  return <g>
    <path d={`M${c} 733V741M${c} 782V790M${c} 827V850M${x+150} 809H${right}V829M${right} ${master?885:854}V890H${c}M${c} 878V895`}/>
    <Box x={x} y={708} w={150} h={25} lines={[kind+'入力処理']} form="round"/>
    <Box x={x} y={741} w={150} h={41} lines={master?['マスタファイルを読む']:['トランザクション','ファイルを読む']}/>
    <Box x={x} y={790} w={150} h={37} lines={['ファイルの終わり']} form="diamond"/>
    <Label x={c-18} y={844}>Yes</Label><Label x={x+166} y={805}>No</Label>
    <Box x={x} y={850} w={150} h={28} lines={[key+'←'+limit]}/>
    <Box x={x+154} y={829} w={154} h={25} lines={[key+'←'+kind+'の会員番号']}/>
    {master&&<><path d={`M${right} 854V860`}/><Box x={x+154} y={860} w={154} h={25} lines={['M′←M']}/></>}
    <Box x={x} y={895} w={150} h={24} lines={['終了']} form="round"/>
  </g>;
}
function Change(props:BookletFigureProps) {
  const down=mergeCases[props.values[0]].order==='降順', limit=down?'最小値':'最大値';
  return <Drawing {...props} kind="change" width={800} height={627}>
    <path d="M215 38V49M215 79V90M215 119V130M215 159V170M215 238V253M120 277H79V357M215 301V448M310 277H494V310M494 365V448M599 338H696V448M389 338H370V385M370 434V483H494M494 477V494M696 477V494M215 477V494M79 438V535H215M215 523V545M494 523V535H215M696 523V535H215M222 530L215 535L222 540M215 570V574M215 599V603"/>
    <Box x={116} y={10} w={198} h={28} lines={['主処理']} form="round"/>
    <Box x={116} y={49} w={198} h={30} lines={['各ファイルを開く']}/>
    <Box x={116} y={90} w={198} h={29} lines={['M入力処理']} form="sub"/>
    <Box x={116} y={130} w={198} h={29} lines={['T入力処理']} form="sub"/>
    <Box x={116} y={170} w={198} h={68} lines={['照合','Kₘ＝'+limit+' かつ','Kₜ＝'+limit]} form="loop"/>
    <Box x={120} y={253} w={190} h={48} lines={['更新区分']} form="diamond"/>
    <Label x={101} y={269}>条件X1</Label><Label x={249} y={315}>条件X2</Label><Label x={353} y={269}>条件X3</Label>
    <Box x={20} y={357} w={118} h={81} lines={['図1の破線','で囲んだ','部分と同じ']} form="dashed"/>
    <Box x={389} y={310} w={210} h={55} lines={['Kₘ：Kₜ']} form="diamond"/>
    <Label x={375} y={330}>{down?'＞':'＜'}</Label><Label x={615} y={330}>{down?'＜':'＞'}</Label><Label x={510} y={380}>＝</Label>
    <Box x={282} y={385} w={175} h={49} lines={['M′を新マスタファイルに','出力する']}/>
    <Box x={116} y={448} w={198} h={29} lines={['エラー処理1']} form="sub"/>
    <Box x={410} y={448} w={168} h={29} lines={['T入力処理']} form="sub"/>
    <Box x={612} y={448} w={168} h={29} lines={['エラー処理2']} form="sub"/>
    <Box x={116} y={494} w={198} h={29} lines={['T入力処理']} form="sub"/>
    <Box x={410} y={494} w={168} h={29} lines={['M入力処理']} form="sub"/>
    <Box x={612} y={494} w={168} h={29} lines={['T入力処理']} form="sub"/>
    <Box x={116} y={545} w={198} h={25} lines={['照合']} form="end"/>
    <Box x={116} y={574} w={198} h={25} lines={['各ファイルを閉じる']}/>
    <Box x={116} y={603} w={198} h={21} lines={['終了']} form="round"/>
    <Label x={556} y={610}>図2　変更後の更新プログラムの流れ</Label>
  </Drawing>;
}
export const legacy2007SpringPm0105FigureRenderers:readonly BookletFigureRenderer[]=[
  {profile:profiles.word,component:Word},{profile:profiles.registers,component:Registers},
  {profile:profiles.organization,component:Organization},{profile:profiles['organization-plans'],component:Plans},
  {profile:profiles['organization-assignment'],component:Assignments},{profile:profiles.network,component:Network},
  {profile:profiles.sorting,component:Sorting},{profile:profiles.record,component:RecordLayout},
  {profile:profiles.merge,component:Merge},{profile:profiles.change,component:Change},
];
