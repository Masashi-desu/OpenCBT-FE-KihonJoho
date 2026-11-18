import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2005AutumnPm0105Figures, profiles, type FigureKind } from '../core/generators/legacy-2005-autumn-pm-01-05-figures';
import { expressions, hireReport, hrFileLayouts, hrRevisionLines, memory, network, sequence } from '../core/generators/legacy-2005-autumn-pm-01-05-models';

type DrawingProps=BookletFigureProps & {kind:FigureKind; width:number; height:number; children:ReactNode};
function Drawing({kind,caption,values,width,height,children}:DrawingProps) {
  const profile=profiles[kind], id=useId();
  const alt=legacy2005AutumnPm0105Figures.find(item=>item.profile===profile)!.alt(values);
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0} aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
    <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
      viewBox={'0 0 '+width+' '+height}
      style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',maxWidth:'none',height:'auto',color:'var(--diagram-ink)'}}>
      <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</g>
    </svg>
  </div></figure>;
}
function Label({x,y,size=15,anchor='middle',children}:{x:number;y:number;size?:number;anchor?:'start'|'middle'|'end';children:ReactNode}) {
  return <text x={x} y={y} fontSize={size} textAnchor={anchor} stroke="none" fill="currentColor">{children}</text>;
}
function Arrow({d,both=false}:{d:string;both?:boolean}) {
  const id=useId(), end=id+'-end', start=id+'-start';
  return <><defs>
    <marker id={end} viewBox="0 0 12 10" refX={10} refY={5} markerWidth={8} markerHeight={7} orient="auto">
      <path d="M1 1L10 5 1 9" fill="none" stroke="currentColor"/>
    </marker>
    {both&&<marker id={start} viewBox="0 0 12 10" refX={1} refY={5} markerWidth={8} markerHeight={7} orient="auto">
      <path d="M10 1L1 5 10 9" fill="none" stroke="currentColor"/>
    </marker>}
  </defs><path d={d} markerEnd={'url(#'+end+')'} markerStart={both?'url(#'+start+')':undefined}/></>;
}
function Lines({x,y,lines}:{x:number;y:number;lines:readonly string[]}) {
  return <>{lines.map((line,i)=><Label key={i} x={x} y={y+(i-(lines.length-1)/2)*17}>{line}</Label>)}</>;
}
function Rect({x,y,width,height=36,lines,radius=0}:{x:number;y:number;width:number;height?:number;lines:readonly string[];radius?:number}) {
  return <g><rect x={x} y={y} width={width} height={height} rx={radius}/>
    <Lines x={x+width/2} y={y+height/2+5} lines={lines}/>
  </g>;
}

function DnsNetwork(props:BookletFigureProps) {
  const {gateway,web,webSide,clientRows}=network(props.values[0]), left=168,right=512;
  const branch=webSide===0?left:right, webX=webSide===0?202:380;
  return <Drawing {...props} kind="dns-network" width={684} height={355}>
    <rect x={15} y={21} width={654} height={313} strokeDasharray="4 3"/>
    <Label x={342} y={48}>example.co.jp</Label>
    <path d="M168 64V317M512 64V317M168 95H275M409 95H512"/>
    <Rect x={275} y={71} width={134} height={49} lines={[gateway,'ネームサーバ']}/>
    {clientRows.map((clients, side)=><g key={side}>
      {[...clients.map(row=>row[0]),''].map((client,i)=>{
        const x=side===0?32:546,y=107+i*59,bus=side===0?left:right;
        return <g key={i}>
          <path d={'M'+(side===0?x+104:bus)+' '+(y+18)+'H'+(side===0?bus:x)}/>
          <Rect x={x} y={y} width={104} lines={[client]}/>
          <rect width={6} height={8} x={bus-3} y={y+14} fill="currentColor"/>
          {i===2&&<Label x={x+52} y={y+51}>⋮</Label>}
        </g>;
      })}
    </g>)}
    {[0,1,2].map((_,i)=>{
      const y=131+i*58, x0=webSide===0?branch:webX+102, x1=webSide===0?webX:branch;
      return <g key={i}><path d={'M'+x0+' '+(y+19)+'H'+x1}/>
        <Rect x={webX} y={y} width={102} height={40} lines={[web,'Web サーバ']}/>
        <rect width={6} height={8} x={branch-3} y={y+15} fill="currentColor"/>
      </g>;
    })}
  </Drawing>;
}

const callPositions:Record<string,readonly [number,number]> = {
  A:[285,28],B:[120,85],D:[285,85],J:[450,85],
  C:[120,142],E:[200,142],F:[285,142],G:[362,142],H:[327,199],I:[405,199],
};
function OverlayCalls(props:BookletFigureProps) {
  const related=['AB','AD','AJ','BC','DE','DF','DG','GH','GI'];
  return <Drawing {...props} kind="overlay-calls" width={565} height={250}>
    {related.map(([a,b])=><line key={a+b} x1={callPositions[a][0]} y1={callPositions[a][1]}
      x2={callPositions[b][0]} y2={callPositions[b][1]}/>)}
    {Object.entries(callPositions).map(([name,[x,y]])=><g key={name}>
      <circle cx={x} cy={y} r={15} fill="var(--diagram-surface)"/><Label x={x} y={y+5}>{name}</Label>
    </g>)}
    <Label x={280} y={238}>{props.caption}</Label>
  </Drawing>;
}
function OverlayOrder(props:BookletFigureProps) {
  const {alpha}=memory(props.values[0]), x=44+sequence.indexOf(alpha)*57;
  return <Drawing {...props} kind="overlay-order" width={660} height={110}>
    {sequence.map((module,index)=><g key={index}><Label x={44+index*57} y={28}>{module}</Label>
      {index+1<sequence.length&&<Label x={72+index*57} y={28}>→</Label>}
    </g>)}
    <Arrow d={'M'+x+' 67V36'}/><Label x={x} y={86}>α</Label>
    <Label x={325} y={102}>{props.caption}</Label>
  </Drawing>;
}

type Plan = {positions:Record<string,[number,number]>;edges:string[][]};
const layouts:readonly Plan[]=[
  {positions:{P0:[300,21],P1:[166,70],P2:[300,70],P3:[434,70]},edges:[['P0','P1','P2','P3']]},
  {positions:{Q0:[300,21],Q1:[166,70],Q2:[300,70],Q5:[434,70],Q3:[246,119],Q4:[354,119]},edges:[['Q0','Q1','Q2','Q5'],['Q2','Q3','Q4']]},
  {positions:{R0:[300,21],R1:[166,70],R2:[300,70],R8:[458,70],R3:[222,119],R4:[300,119],R5:[378,119],R6:[350,168],R7:[422,168]},
   edges:[['R0','R1','R2','R8'],['R2','R3','R4','R5'],['R5','R6','R7']]},
];
function OverlayPlan(props:BookletFigureProps) {
  const {positions,edges}=layouts[props.values[0]], bottom=Math.max(...Object.values(positions).map(pair=>pair[1]))+48;
  return <Drawing {...props} kind="overlay-plan" width={566} height={bottom+45}>
    <Arrow d={'M69 25V'+bottom}/><Lines x={36} y={bottom/2} lines={['主記','憶領域']}/>
    {edges.map(([parent,...children])=>{
      const [px]=positions[parent], level=positions[children[0]][1];
      const columns=[px,...children.map(child=>positions[child][0])];
      return <line key={parent} x1={Math.min(...columns)} x2={Math.max(...columns)} y1={level} y2={level}/>;
    })}
    {Object.entries(positions).map(([segment,[x,y]])=><g key={segment}>
      <rect x={x-5} y={y} width={10} height={49} fill="currentColor"/><Label x={x+29} y={y+29}>{segment}</Label>
    </g>)}
    <Label x={296} y={bottom+33}>{props.caption}</Label>
  </Drawing>;
}

function DhFlow(props:BookletFigureProps) {
  return <Drawing {...props} kind="dh-flow" width={691} height={316}>
    <Rect x={280} y={14} width={142} height={56} lines={['素数 p','自然数 α']}/>
    <Arrow d="M280 58L133 132"/><Arrow d="M422 58L558 132"/>
    <Label x={200} y={75}>公開データ</Label><Label x={504} y={75}>公開データ</Label>
    <Label x={106} y={117}>利用者A</Label><Label x={580} y={117}>利用者B</Label>
    <Rect x={53} y={136} width={186} height={71} lines={['Yₐ＝αのXₐ乗 mod p','K＝YᵦのXₐ乗 mod p']}/>
    <Rect x={454} y={136} width={186} height={71} lines={['Yᵦ＝αのXᵦ乗 mod p','K＝YₐのXᵦ乗 mod p']}/>
    <Arrow d="M239 156H454"/><Arrow d="M454 185H239"/>
    <Label x={344} y={149}>公開かぎYₐ</Label><Label x={344} y={179}>公開かぎYᵦ</Label>
    <Arrow d="M146 207V248"/><Arrow d="M552 207V248"/>
    <Rect x={100} y={248} width={92} lines={['暗号化']}/><Rect x={506} y={248} width={92} lines={['復号']}/>
    <Label x={85} y={230}>共通かぎK</Label><Label x={612} y={230}>共通かぎK</Label>
    <Arrow d="M19 267H100"/><Arrow d="M192 267H506"/><Arrow d="M598 267H675"/>
    <Label x={55} y={257}>平文</Label><Label x={347} y={257}>暗号文</Label><Label x={640} y={257}>平文</Label>
    <Label x={348} y={306}>{props.caption}</Label>
  </Drawing>;
}

function PostfixInput(props:BookletFigureProps) {
  const expression=[...expressions[props.values[0]]], x=142,w=33, width=x+expression.length*w+13;
  return <Drawing {...props} kind="postfix-input" width={width} height={57}>
    <Label x={69} y={33}>Exptextの内容</Label>
    {expression.map((letter,i)=><Rect key={i} x={x+i*w} y={8} width={w} height={36} lines={[letter]}/>)}
  </Drawing>;
}

function HrLayout(props:BookletFigureProps) {
  const fields=hrFileLayouts[props.values[0]], lens=fields.map(([name])=>Math.max(78,name.length*18+18));
  const width=lens.reduce((sum,cell)=>sum+cell,32);
  return <Drawing {...props} kind="hr-layout" width={width} height={52}>
    {fields.map(([name,primary],i)=>{
      const x=16+lens.slice(0,i).reduce((sum,size)=>sum+size,0), w=lens[i];
      return <g key={name}><Rect x={x} y={7} width={w} lines={[name]}/>
        {primary&&<line x1={x+(w-name.length*15)/2} x2={x+(w+name.length*15)/2} y1={33} y2={33}/>}
      </g>;
    })}
  </Drawing>;
}
function HrReport(props:BookletFigureProps) {
  const {date,rows}=hireReport(props.values[0]);
  const columns=['社員コード','社員名','部署名','職群','階級','職務名','部署名','職群','階級','職務名'];
  const widths=[100,115,102,85,67,82,102,85,67,82], margin=23;
  const boundaries=widths.map((_,i)=>margin+widths.slice(0,i).reduce((a,b)=>a+b,0));
  const width=widths.reduce((a,b)=>a+b,2*margin), leftNew=boundaries[2], leftOld=boundaries[6];
  function lineRow(content:readonly string[], y:number) {
    return content.map((cell,i)=><Label key={i} x={boundaries[i]+widths[i]/2} y={y}>{cell}</Label>);
  }
  return <Drawing {...props} kind="hr-report" width={width} height={296}>
    <path d={'M'+margin+' 18H'+(width-margin)+'V240C'+(width*0.73)+' 193 '+(width*0.27)+' 285 '+margin+' 240z'}/>
    <Label anchor="end" x={width-37} y={41}>{date}</Label><Label anchor="end" x={width-37} y={65}>人事部</Label>
    <Label x={width/2} y={68}>人事異動</Label>
    <Label x={(leftNew+leftOld)/2} y={95}>新</Label><Label x={(leftOld+width-margin)/2} y={95}>旧</Label>
    <path d={'M'+leftNew+' 83V206M'+leftOld+' 83V206M'+margin+' 124H'+(width-margin)}/>
    {lineRow(columns,116)}
    {rows.map((row,i)=><g key={row[0]}>{lineRow(row,147+i*25)}</g>)}
    {lineRow(columns.map(()=> '⋮'),223)}
    <Label x={width/2} y={280}>{props.caption}</Label>
  </Drawing>;
}

function FileNode({x,y,lines,width=131,db=false}:{x:number;y:number;lines:readonly string[];width?:number;db?:boolean}) {
  const box=db?'M'+(x+9)+' '+y+'h'+(width-18)+'q18 20 0 40h-'+(width-18)+'q-18 -20 0 -40':
    'M'+(x+12)+' '+y+'h'+(width-12)+'l-12 40H'+x+'z';
  return <g><path d={box}/><Lines x={x+width/2} y={y+25} lines={lines}/></g>;
}
function HrCreate(props:BookletFigureProps) {
  return <Drawing {...props} kind="hr-create" width={593} height={736}>
    <path d="M293 46V111m0 36V197m0 36V298m0 36V408m0 36V496m0 36V591m0 36V670"/>
    <Rect x={243} y={10} width={100} lines={['開始']} radius={17}/>
    <Rect x={243} y={670} width={100} lines={['終了']} radius={17}/>
    {[['処理1',111],['整列1',197],['整列2',298],['処理2',408],['処理3',496],['処理4',591]].map(([name,y])=>
      <Rect key={name} x={243} y={Number(y)} width={100} lines={[String(name)]}/>)}
    <FileNode x={29} y={65} lines={['職務変更','ファイル']}/><Arrow d="M158 86L243 122"/>
    <FileNode x={420} y={155} lines={['S1','ファイル']}/><Arrow d="M343 134L421 175"/><Arrow d="M421 177L343 215"/>
    <FileNode x={420} y={247} lines={['S2','ファイル']}/><Arrow d="M343 220L421 266"/>
    <FileNode x={29} y={247} lines={['昇格候補','ファイル']}/><Arrow d="M160 265L243 312"/>
    <FileNode x={420} y={360} lines={['S3','ファイル']}/><Arrow d="M343 321L420 379"/><Arrow d="M420 381L343 427"/>
    <FileNode x={29} y={357} lines={['［a］','ファイル']}/><Arrow d="M160 378L243 427"/>
    <FileNode x={29} y={450} lines={['昇格者','ファイル']}/><Arrow d="M243 435L160 468"/>
    <FileNode x={29} y={508} lines={['社員表']} db/><Arrow d="M160 528H243"/>
    <FileNode x={420} y={542} lines={['S4','ファイル']}/><Arrow d="M343 523L420 562"/><Arrow d="M420 565L343 607"/>
    <FileNode x={29} y={553} lines={['［b］','ファイル']}/><Arrow d="M160 573L243 610"/>
    <FileNode x={29} y={626} lines={['階級更新','ファイル']}/><Arrow d="M243 618L160 648"/>
    <path d="M346 211h31M346 313h31" strokeDasharray="3 3"/>
    <Label x={378} y={215} size={13} anchor="start">社員コードで昇順に整列する。</Label>
    <Label x={378} y={317} size={13} anchor="start">社員コードで昇順に整列する。</Label>
    <Label x={297} y={726}>{props.caption}</Label>
  </Drawing>;
}
function HrUpdate(props:BookletFigureProps) {
  const stages=[['階級更新','ファイル'],['S2','ファイル'],['昇格者','ファイル'],['異動','ファイル']];
  const x=317;
  return <Drawing {...props} kind="hr-update" width={604} height={789}>
    <path d="M367 46V121m0 36V227m0 36V333m0 36V439m0 36V577m0 36V723"/>
    <Rect x={x} y={10} width={100} lines={['開始']} radius={17}/>
    <Rect x={x} y={723} width={100} lines={['終了']} radius={17}/>
    {stages.map((names,i)=>{
      const top=72+106*i, y=top+49;
      return <g key={i}><FileNode x={28} y={top} lines={names}/>
        <Arrow d={'M159 '+(top+20)+'H285L317 '+(y+10)}/>
        <FileNode x={133} y={y-2} lines={['社員表']} db/>
        <Arrow d={'M264 '+(y+18)+'H317'} both/><Rect x={x} y={y} width={100} lines={['処理'+(5+i)]}/>
      </g>;
    })}
    <Rect x={x} y={577} width={100} lines={['処理9']}/>
    {[['異動','ファイル'],['社員表'],['部署表'],['職務表'],['旧社員表']].map((names,i)=>{
      const top=490+i*43;
      return <g key={i}><FileNode x={32} y={top} width={125} lines={names} db={i>0}/>
        <Arrow d={'M157 '+(top+20)+'L317 '+(585+i*5)}/>
      </g>;
    })}
    <Arrow d="M417 594H460V672"/>
    <path d="M450 672h139v44q-34-12-69 0t-70 0z"/>
    <Lines x={519} y={691} lines={['人事異動の','発表資料']}/>
    <Label x={306} y={780}>{props.caption}</Label>
  </Drawing>;
}

function HrRevised(props:BookletFigureProps) {
  const lines=hrRevisionLines(props.values[0]);
  return <Drawing {...props} kind="hr-revised" width={656} height={106}>
    {lines.map((line,i)=>{
      const x=18, y=21+i*24;
      const widths=line.map(run=>[...run.text].reduce((sum,letter)=>sum+(/[\x20-\x7e]/.test(letter)?8:16),0));
      return <g key={i}>{line.map(({text,changed},j)=>{
        const start=x+widths.slice(0,j).reduce((sum,width)=>sum+width,0);
        const width=widths[j];
        const wave='M'+start+' '+(y+4)+Array.from({length:Math.floor(width/6)},()=> 'q1.5 -2 3 0t3 0').join('');
        return <g key={text}><text x={start} y={y} fontSize={16} stroke="none" fill="currentColor"
          textLength={width} lengthAdjust="spacingAndGlyphs">{text}</text>
          {changed&&<path d={wave} strokeWidth={1} data-revised-clause="yes"/>}
        </g>;
      })}</g>;
    })}
  </Drawing>;
}

export const legacy2005AutumnPm0105FigureRenderers:readonly BookletFigureRenderer[]=[
  {profile:profiles['dns-network'],component:DnsNetwork},
  {profile:profiles['overlay-calls'],component:OverlayCalls},
  {profile:profiles['overlay-order'],component:OverlayOrder},
  {profile:profiles['overlay-plan'],component:OverlayPlan},
  {profile:profiles['dh-flow'],component:DhFlow},
  {profile:profiles['postfix-input'],component:PostfixInput},
  {profile:profiles['hr-report'],component:HrReport},
  {profile:profiles['hr-create'],component:HrCreate},
  {profile:profiles['hr-update'],component:HrUpdate},
  {profile:profiles['hr-layout'],component:HrLayout},
  {profile:profiles['hr-revised'],component:HrRevised},
];
