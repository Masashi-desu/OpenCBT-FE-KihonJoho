import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2005SpringPm0105Figures, profiles, recordColumns, type FigureKind } from '../core/generators/legacy-2005-spring-pm-01-05-figures';
import { heapCases, hex, listExample, replaceExample, schedule } from '../core/generators/legacy-2005-spring-pm-01-05-models';

type DrawingProps=BookletFigureProps & {kind:FigureKind; width:number; height:number; children:ReactNode};
function Drawing({kind,caption,values,width,height,children}:DrawingProps) {
  const profile=profiles[kind], id=useId();
  const alt=legacy2005SpringPm0105Figures.find(item=>item.profile===profile)!.alt(values);
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0}
    aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
    <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'} viewBox={'0 0 '+width+' '+height}
      style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',color:'var(--diagram-ink)'}}>
      <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</g>
    </svg>
  </div></figure>;
}
function Label({x,y,size=15,anchor='middle',children}:{x:number;y:number;size?:number;anchor?:'start'|'middle';children:ReactNode}) {
  return <text x={x} y={y} fontSize={size} textAnchor={anchor} stroke="none" fill="currentColor">{children}</text>;
}
function Arrow({d}:{d:string}) {
  const id=useId();
  return <><defs><marker id={id} viewBox="0 0 12 10" refX={10} refY={5} markerWidth={8} markerHeight={7} orient="auto">
    <path d="M1 1L10 5 1 9" fill="none" stroke="currentColor"/>
  </marker></defs><path d={d} markerEnd={'url(#'+id+')'}/></>;
}
function Box({x,y,w,h=28,label,radius=0,double=false}:{x:number;y:number;w:number;h?:number;label:string;radius?:number;double?:boolean}) {
  return <g><rect x={x} y={y} width={w} height={h} rx={radius} fill="var(--diagram-surface)"/>
    {double&&<path d={'M'+(x+7)+' '+y+'v'+h+'m'+(w-14)+' 0v-'+h}/>}
    <Label x={x+w/2} y={y+h/2+5}>{label}</Label></g>;
}
function Diamond({x,y,w,h,label}:{x:number;y:number;w:number;h:number;label:string}) {
  return <g><path d={'M'+x+' '+(y-h/2)+'l'+w/2+' '+h/2+'l-'+w/2+' '+h/2+'l-'+w/2+' -'+h/2+'z'} fill="var(--diagram-surface)"/>
    <Label x={x} y={y+5}>{label}</Label></g>;
}

function ListShape(props:BookletFigureProps) {
  const {elements}=listExample(props.values[0]), nodes=[...elements.slice(0,3),elements[11]];
  return <Drawing {...props} kind="list-shape" width={652} height={92}>
    <Label x={54} y={24}>ROOT</Label><Box x={28} y={33} w={52} label=""/>
    <circle cx={54} cy={47} r={4} fill="currentColor"/><Arrow d="M54 47H110"/>
    {nodes.map((node,i)=>{
      const x=[110,237,364,531][i], next=[237,364,474,0][i];
      return <g key={i}><Box x={x} y={33} w={53} label={hex(node.value)}/>
        <Box x={x+53} y={33} w={48} label={i===3?'0000':''}/>
        {i<3&&<><circle cx={x+77} cy={47} r={4} fill="currentColor"/>
          <Arrow d={'M'+(x+77)+' 47H'+next}/></>}
      </g>;
    })}
    <Label x={489} y={51}>…</Label><Arrow d="M507 47h24"/>
  </Drawing>;
}
function ListMemory(props:BookletFigureProps) {
  const {groups}=listExample(props.values[0]);
  return <Drawing {...props} kind="list-memory" width={608} height={272}>
    {groups.map((group,i)=>{
      const x=22+i*147;
      return <g key={i}><Label x={x+20} y={26}>番地</Label><Label x={x+83} y={26}>内容</Label>
        {group.map(([address,value],j)=>{
          const y=35+j*28;
          return <g key={address} data-memory-address={value==='⋮'?undefined:hex(address)}>
            <Label x={x+20} y={y+19}>{value==='⋮'?value:hex(address)}</Label><Box x={x+51} y={y} w={65} label={value==='［空欄］'?'':value}/>
          </g>;
        })}
      </g>;
    })}
  </Drawing>;
}
function ReplaceArrays(props:BookletFigureProps) {
  const {arrays,columns}=replaceExample(props.values[0]), w=54;
  return <Drawing {...props} kind="replace-arrays" width={74+columns*w} height={172}>
    <Label x={30} y={22}>添字</Label>
    {Array.from({length:columns},(_,n)=><Label key={n} x={56+n*w+w/2} y={22}>{n}</Label>)}
    {arrays.map((values,i)=><g key={i} data-array={'ASDB'[i]}>
      <Label x={28} y={53+i*31}>{'ASDB'[i]}[]</Label>
      {Array.from({length:columns},(_,n)=><Box key={n} x={56+n*w} y={31+i*31} w={w} h={31} label={values[n]??''}/>)}
    </g>)}
  </Drawing>;
}
function Heap(props:BookletFigureProps) {
  const values=heapCases[props.values[0]];
  const coordinates=[[310,43],[179,101],[441,101],[112,168],[246,168],[373,168],[508,168],[76,229],[146,229],[214,229]];
  const labelOffsets=[-31,-34,34,-34,34,-34,34,-34,29,36];
  return <Drawing {...props} kind="heap" width={609} height={265}>
    {coordinates.map(([x,y],i)=>i>0&&<line key={i} x1={coordinates[Math.floor((i+1)/2)-1][0]}
      y1={coordinates[Math.floor((i+1)/2)-1][1]} x2={x} y2={y}/>)}
    {coordinates.map(([x,y],i)=><g key={i} data-heap-index={i+1}>
      <circle cx={x} cy={y} r={18} fill="var(--diagram-surface)"/><Label x={x} y={y+5}>{values[i]}</Label>
      <Label x={x+labelOffsets[i]} y={y-12} size={13}>A[{i+1}]</Label>
    </g>)}
  </Drawing>;
}
function Timetable(props:BookletFigureProps) {
  const {rows}=schedule(props.values[0]);
  const dayPeriods=[{day:2,period:1},{day:2,period:2},{day:2,period:3},{day:2,period:4},
    {day:2,period:5},{day:3,period:1},{day:3,period:2}];
  const start=14, dayW=37, periodW=42, yearW=170;
  const first=start+dayW+periodW, right=first+4*yearW, top=14, y0=51;
  const heights=dayPeriods.map(key=>rows.some(row=>row[1]===key.day&&row[2]===key.period&&row[3]>1)?52:32);
  const bottom=y0+heights.reduce((a,b)=>a+b,0), mondayEnd=y0+heights.slice(0,5).reduce((a,b)=>a+b,0);
  return <Drawing {...props} kind="timetable" width={right+15} height={bottom+43}>
    <path d={'M'+start+' '+top+'H'+right+'V'+(bottom+26)+'H'+start+'Z'}/>
    <path d={'M'+start+' '+y0+'H'+right+'M'+start+' '+mondayEnd+'H'+right+'M'+start+' '+bottom+'H'+right}/>
    <Label x={start+dayW/2} y={35}>曜日</Label><Label x={start+dayW+periodW/2} y={35}>時限</Label>
    <path d={'M'+(start+dayW)+' '+top+'V'+(bottom+26)}/>
    <Label x={start+dayW/2} y={(y0+mondayEnd)/2+5}>月</Label>
    <Label x={start+dayW/2} y={(mondayEnd+bottom)/2+5}>火</Label>
    {[1,2,3,4].map((year,i)=>{
      const x=first+yearW*i;
      return <g key={year}><path d={'M'+x+' '+top+'V'+(bottom+26)}/><Label x={x+yearW/2} y={35}>{year}年次</Label>
        <Label x={x+yearW/2} y={bottom+20}>⋮</Label></g>;
    })}
    <Label x={start+dayW/2} y={bottom+20}>⋮</Label><Label x={start+dayW+periodW/2} y={bottom+20}>⋮</Label>
    {dayPeriods.map(({day,period},i)=>{
      const y=y0+heights.slice(0,i).reduce((a,b)=>a+b,0), h=heights[i];
      return <g key={day+':'+period}><path d={'M'+(start+dayW)+' '+y+'H'+right}/>
        <Label x={start+dayW+periodW/2} y={y+h/2+5}>{period}</Label>
        {[1,2,3,4].map((year,j)=>{
          const x=first+yearW*j, cells=rows.filter(row=>row[0]===year&&row[1]===day&&row[2]===period);
          if(!cells.length)return <path key={year} d={'M'+x+' '+(y+h)+'l'+yearW+' -'+h}/>;
          return <g key={year}><path d={'M'+(x+yearW/2)+' '+y+'v'+h} strokeDasharray="4 3"/>
            {cells.map((row,k)=>{
              const cy=y+(k+0.5)*h/cells.length;
              return <g key={k}>{k>0&&<path d={'M'+x+' '+(y+h/2)+'h'+yearW}/>}
                <Label x={x+yearW/4} y={cy+5} size={14}>{row[4]}</Label>
                <Label x={x+yearW*3/4} y={cy+5} size={14}>{row[5]}</Label></g>;
            })}
          </g>;
        })}
      </g>;
    })}
  </Drawing>;
}
function RecordLayout(props:BookletFigureProps) {
  const w=82;
  return <Drawing {...props} kind="record-layout" width={recordColumns.length*w+24} height={50}>
    {recordColumns.map((name,i)=><Box key={name} x={12+w*i} y={11} w={w} label={name}/>)}
  </Drawing>;
}
function FileExample(props:BookletFigureProps) {
  const {example,out}=schedule(props.values[0]), x=45, outputX=523, row=27;
  const widths=[56,54,54,62,86,97], positions=widths.map((_,i)=>x+widths.slice(0,i).reduce((a,b)=>a+b,0));
  return <Drawing {...props} kind="file-example" width={688} height={61+row*(out.length+1)}>
    <Label x={250} y={25}>既存システムの出力</Label><Label x={593} y={25}>新システムへの入力</Label>
    {recordColumns.map((name,i)=><Box key={name} x={positions[i]} y={38} w={widths[i]} h={row} label={name}/>)}
    <Box x={outputX} y={38} w={140} h={row} label="レコードの内容"/>
    {example.map((record,i)=><g key={i}><Label x={30} y={56+row*(i+1)}>{i+1}</Label>
      {record.map((value,j)=><Box key={j} x={positions[j]} y={38+row*(i+1)} w={widths[j]} h={row} label={String(value)}/>)}
    </g>)}
    {out.map((value,i)=><g key={i}><Label x={505} y={56+row*(i+1)}>{i+1}</Label>
      <Box x={outputX} y={38+row*(i+1)} w={140} h={row} label={value}/></g>)}
  </Drawing>;
}
function EditorFlow(props:BookletFigureProps) {
  const x=245,b=155,w=180;
  return <Drawing {...props} kind="editor-flow" width={449} height={642}>
    <path d="M245 31V492M245 533V550M245 578V603"/>
    <Box x={b} y={12} w={w} label="編集の開始" radius={15}/>
    <Box x={b} y={64} w={w} label="初期値設定" double/>
    <Box x={b} y={116} w={w} label="レコード読込み"/>
    <Diamond x={x} y={190} w={w} h={52} label="レコード終わり"/>
    <Arrow d="M335 190H397V542H245"/><Label x={355} y={179}>Yes</Label><Label x={265} y={234}>No</Label>
    <Box x={b} y={248} w={w} label="値の範囲の検査" double/>
    <Diamond x={x} y={320} w={w} h={52} label="ERROR"/>
    <Box x={b} y={381} w={w} label="主処理" double/>
    <Diamond x={x} y={452} w={w} h={52} label="ERROR"/>
    <Arrow d="M335 320H369V498H245V505"/><path d="M335 452H369"/>
    <Label x={350} y={311}>真</Label><Label x={264} y={365}>偽</Label>
    <Label x={350} y={443}>真</Label><Label x={263} y={489}>偽</Label>
    <Arrow d="M245 492H129V106H245"/>
    <Box x={b} y={505} w={w} label="エラー処理"/>
    <Box x={b} y={550} w={w} label="メッセージ出力"/>
    <Box x={b} y={603} w={w} label="終了" radius={15}/>
  </Drawing>;
}

function MainFlow(props:BookletFigureProps) {
  const x=339, h=66;
  const steps=[
    {y:97,variable:'NENJI',prefix:'G',reset:'YOBI'},
    {y:239,variable:'YOBI',prefix:'D',reset:'JIGEN'},
    {y:381,variable:'JIGEN',prefix:'T',reset:'HYOJJUN'},
  ];
  return <Drawing {...props} kind="main-flow" width={730} height={728}>
    <path d="M339 38V494" />
    <Box x={255} y={12} w={168} label="主処理の開始" radius={15}/>
    {steps.map(({y,variable,prefix,reset},i)=><g key={variable}>
      <Diamond x={x} y={y} w={218} h={h} label={variable+'：I_'+variable}/>
      <path d={'M230 '+y+'H125V'+(y+20)+'m0 85v2h214M448 '+y+'H512'} />
      <Label x={225} y={y-8}>＜</Label><Label x={457} y={y-8}>＞</Label><Label x={356} y={y+48}>＝</Label>
      <Box x={512} y={y-14} w={171} label={'エラー情報設定'+(i+1)}/><path d={'M683 '+y+'H705V667'}/>
      <rect x={20} y={y+20} width={211} height={85} fill="var(--diagram-surface)"/>
      <Label x={43} y={y+13}>処理{i+1}</Label><Label x={125} y={y+42}>“{prefix}”に続けて I_{variable} を出力</Label>
      <rect x={61} y={y+51} width={129} height={20} fill="currentColor" opacity={0.18} stroke="none"/>
      <Label x={125} y={y+91}>{reset} ← 0</Label>
    </g>)}
    <rect x={209} y={485} width={281} height={88} rx={15} strokeDasharray="5 4"/>
    <Diamond x={x} y={527} w={218} h={h} label="条件X"/>
    <path d="M230 527H125V583M448 527H512"/>
    <Label x={212} y={516}>判定Y</Label><Label x={477} y={516}>（省略）</Label>
    <Box x={512} y={513} w={171} label="エラー情報設定4"/><path d="M683 527H705V667H339"/>
    <rect x={20} y={583} width={211} height={66} fill="var(--diagram-surface)"/>
    <Label x={43} y={575}>処理4</Label><Label x={125} y={603}>I_KAMOKU を出力</Label>
    <Label x={125} y={623}>I_KYOIN を出力</Label><rect x={61} y={630} width={129} height={15} fill="currentColor" opacity={0.18} stroke="none"/>
    <path d="M125 649v18H339v13"/>
    <Box x={255} y={681} w={168} label="戻る" radius={15}/>
  </Drawing>;
}

export const legacy2005SpringPm0105FigureRenderers:readonly BookletFigureRenderer[]=[
  {profile:profiles['list-shape'],component:ListShape},{profile:profiles['list-memory'],component:ListMemory},
  {profile:profiles['replace-arrays'],component:ReplaceArrays},{profile:profiles.heap,component:Heap},
  {profile:profiles.timetable,component:Timetable},{profile:profiles['record-layout'],component:RecordLayout},
  {profile:profiles['file-example'],component:FileExample},{profile:profiles['editor-flow'],component:EditorFlow},
  {profile:profiles['main-flow'],component:MainFlow},
];
