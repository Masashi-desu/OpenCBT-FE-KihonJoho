import { useId, type ReactNode } from 'react';
import type { BookletFigureProps, BookletFigureRenderer } from './booklet-figure-renderer-contract';
import { legacy2004AutumnPm0105Figures, profiles, type FigureKind } from '../core/generators/legacy-2004-autumn-pm-01-05-figures';
import { addressAnswerRows, fLayouts, network, rankLayout, salesCases, salesColumns, salesLayout, salesReport } from '../core/generators/legacy-2004-autumn-pm-01-05-models';

type DrawingProps=BookletFigureProps & {kind:FigureKind;width:number;height:number;children:ReactNode};
function Drawing({kind,caption,values,width,height,children}:DrawingProps) {
  const profile=profiles[kind],id=useId();
  const alt=legacy2004AutumnPm0105Figures.find(item=>item.profile===profile)!.alt(values);
  return <figure className="managed-diagram source-figure"><div className="diagram-scroll" tabIndex={0}
    aria-label={caption+'。幅が足りない場合は左右にスクロールできます。'}>
    <svg data-source-figure={profile} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}
      viewBox={'0 0 '+width+' '+height}
      style={{display:'block',width:'calc('+width+'px * var(--image-scale, 1))',height:'auto',maxWidth:'none',color:'var(--diagram-ink)'}}>
      <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc>
      <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>{children}</g>
    </svg>
  </div></figure>;
}
function Label({x,y,size=15,children}:{x:number;y:number;size?:number;children:ReactNode}) {
  return <text x={x} y={y} fontSize={size} textAnchor="middle" fill="currentColor" stroke="none">{children}</text>;
}
function Row({labels,x,y,widths,h=33}:{labels:readonly string[];x:number;y:number;widths:readonly number[];h?:number}) {
  return <g>{labels.map((label,i)=>{
    const left=x+widths.slice(0,i).reduce((a,b)=>a+b,0), width=widths[i];
    return <g key={i}><rect x={left} y={y} width={width} height={h} fill="var(--diagram-surface)"/>
      <Label x={left+width/2} y={y+h/2+5}>{label}</Label></g>;
  })}</g>;
}
function Node({x,y,w,h=39,lines,file=false}:{x:number;y:number;w:number;h?:number;lines:readonly string[];file?:boolean}) {
  return <g>{file?<><path d={'M'+(x+7)+' '+y+'h'+(w-14)+'q14 '+h/2+' 0 '+h+'h-'+(w-14)+'q-14 -'+h/2+' 0 -'+h+'z'} fill="var(--diagram-surface)"/>
    <path d={'M'+(x+w-7)+' '+y+'q-14 '+h/2+' 0 '+h}/></>:<rect x={x} y={y} width={w} height={h} fill="var(--diagram-surface)"/>}
    {lines.map((line,i)=><Label key={i} x={x+w/2} y={y+h/2+5+(i-(lines.length-1)/2)*18}>{line}</Label>)}
  </g>;
}
function LinkMark({x,y}:{x:number;y:number}) {
  return <rect x={x-6} y={y-4} width={12} height={8} fill="currentColor"/>;
}

function Network(props:BookletFigureProps) {
  const {routerE,routerG}=network(props.values[0]);
  return <Drawing {...props} kind="network" width={750} height={589}>
    <path d="M153 45H266M474 45H586M375 67V186"/>
    <ellipse cx={370} cy={45} rx={105} ry={25} fill="var(--diagram-surface)"/><Label x={370} y={50}>インターネット</Label>
    <Node x={42} y={25} w={119} lines={['WebサーバP']}/><Node x={586} y={25} w={119} lines={['FTPサーバQ']}/>
    <rect x={16} y={94} width={716} height={477} strokeDasharray="4 3"/><Label x={43} y={88}>X社</Label>
    <path d="M44 186H707M165 186V326M571 186V458M44 326H440M300 458H707"/>
    <Label x={104} y={175}>基幹LAN</Label><Label x={399} y={315}>Y部門</Label><Label x={678} y={447}>Z部門</Label>
    <Node x={324} y={102} w={101} lines={['関門サーバ']}/><Node x={289} y={148} w={65} h={24} lines={['a']}/>
    <Node x={111} y={225} w={108} lines={['ルータE']}/>
    <Label x={251} y={217} size={14}>{routerE[0]}</Label><Label x={251} y={281} size={14}>{routerE[1]}</Label>
    <Node x={518} y={371} w={106} lines={['ルータG']}/>
    <Label x={509} y={359} size={14}>{routerG[0]}</Label><Label x={506} y={437} size={14}>{routerG[1]}</Label>
    {[44,165,375,571,707].map(x=><LinkMark key={x} x={x} y={186}/>)}
    {[44,101,165,248,385,440].map(x=><LinkMark key={x} x={x} y={326}/>)}
    {[300,365,484,571,614,707].map(x=><LinkMark key={x} x={x} y={458}/>)}
    <path d="M101 326V385M248 326V385M385 326V385M365 458V515M484 458V515M614 458V515"/>
    <Node x={48} y={347} w={44} h={26} lines={['b']}/>
    <Node x={56} y={385} w={90} h={52} lines={['パソコン']}/>
    <Node x={203} y={385} w={90} h={52} lines={['パソコン']}/><Label x={316} y={412}>…</Label>
    <Node x={340} y={385} w={90} h={52} lines={['パソコン','F']}/>
    <Node x={637} y={480} w={48} h={27} lines={['c']}/>
    <Node x={320} y={515} w={90} h={46} lines={['パソコン']}/><Label x={422} y={542}>…</Label>
    <Node x={439} y={515} w={90} h={46} lines={['パソコン']}/>
    <Node x={569} y={515} w={90} h={46} lines={['Webサーバ','H']}/>
  </Drawing>;
}

function AddressOption(props:BookletFigureProps) {
  const rows=addressAnswerRows[props.values[0]];
  return <Drawing {...props} kind="address-option" width={305} height={84}>
    {rows.map((row,i)=><Row key={i} labels={row} x={12} y={9+i*33} widths={[140,140]}/>)}
  </Drawing>;
}
function SalesLayout(props:BookletFigureProps) {
  return <Drawing {...props} kind="sales-layout" width={522} height={53}>
    <Row labels={salesLayout} x={10} y={10} widths={[96,108,108,94,94]}/>
  </Drawing>;
}
function FOption(props:BookletFigureProps) {
  const labels=fLayouts[props.values[0]],widths=labels.map(value=>value.includes('合計')?124:106);
  return <Drawing {...props} kind="f-option" width={widths.reduce((a,b)=>a+b,20)} height={52}>
    <Row labels={labels} x={10} y={10} widths={widths}/>
  </Drawing>;
}

const rankWidths=[110,117,49,94,112,49,94,112] as const;
function GroupedHeader({columns,y}:{columns:readonly string[];y:number}) {
  const x=12, head=32;
  return <g>
    <Row labels={columns.slice(0,2)} x={x} y={y} widths={rankWidths.slice(0,2)} h={head*2}/>
    <Row labels={['支店データ','全支店データ']} x={x+227} y={y} widths={[255,255]} h={head}/>
    <Row labels={columns.slice(2)} x={x+227} y={y+head} widths={rankWidths.slice(2)} h={head}/>
  </g>;
}
function JoinedLayout(props:BookletFigureProps) {
  return <Drawing {...props} kind="joined-layout" width={760} height={85}>
    <GroupedHeader columns={rankLayout} y={10}/>
  </Drawing>;
}
function Report(props:BookletFigureProps & {branchFirst:boolean}) {
  const {rows,branchCode}=salesReport(props.values[0],props.branchFirst);
  return <Drawing {...props} kind={props.branchFirst?'report-branch':'report-all'} width={760} height={215}>
    <Row labels={['支店コード',branchCode]} x={12} y={10} widths={[110,117]}/>
    <GroupedHeader columns={salesColumns} y={43}/>
    {rows.map((row,i)=><Row key={i} labels={row} x={12} y={107+33*i} widths={rankWidths}/>)}
  </Drawing>;
}
function AllReport(props:BookletFigureProps){return <Report {...props} branchFirst={false}/>;}
function BranchReport(props:BookletFigureProps){return <Report {...props} branchFirst/>;}

type Stage={label:readonly string[];file?:boolean};
function listStages(data:readonly Stage[],center:number) {
  return data.map(({label,file},i)=>{
    const width=file?114:181;
    return <Node key={i} x={center-width/2} y={75+59*i} w={width} h={40} lines={label} file={file}/>;
  });
}
function Pipeline(props:BookletFigureProps & {branchFirst:boolean}) {
  const allLeft:Stage[]=[{label:['売上上位'+salesCases[props.values[0]].limit+'商品の','抽出']},{label:['F','ファイル'],file:true}];
  const allRight:Stage[]=[{label:['支店ごとの順位付け']},{label:['G','ファイル'],file:true}];
  const branchLeft:Stage[]=[{label:['売上合計の計算']},{label:['L','ファイル'],file:true},{label:['ステップ1']},
    {label:['L1','ファイル'],file:true},{label:['ステップ2']},{label:['L2','ファイル'],file:true}];
  const branchRight:Stage[]=[{label:['売上上位商品の抽出']},{label:['M','ファイル'],file:true},
      {label:['商品コードで整列']},{label:['M1','ファイル'],file:true}];
  const left=props.branchFirst?branchLeft:allLeft, right=props.branchFirst?branchRight:allRight;
  const y=75+59*left.length;
  return <Drawing {...props} kind={props.branchFirst?'pipeline-branch':'pipeline-all'} width={636} height={y+264}>
    <path d={'M315 39V56H173V'+(y-8)+'H454V56H315M315 '+(y-8)+'V'+(y+220)}/>
    <Node x={258} y={8} w={114} h={42} lines={['売上実績','ファイル']} file/>
    {listStages(left,173)}{listStages(right,454)}
    <Node x={218} y={y+6} w={194} h={50} lines={['全支店データと','支店別データの照合']}/>
    <Node x={258} y={y+68} w={114} h={44} lines={[props.branchFirst?'N':'H','ファイル']} file/>
    <path d={'M180 '+(y+156)+'H216'}/>
    <Node x={55} y={y+133} w={124} h={46} lines={['商品マスタ','ファイル']} file/>
    <Node x={216} y={y+128} w={198} h={56} lines={['支店別売上実績表の','作成']}/>
    <path d={'M252 '+(y+199)+'h126v45q-31-12-63 0t-63 0z'} fill="var(--diagram-surface)"/>
    <Label x={315} y={y+225}>売上実績表</Label>
  </Drawing>;
}
function AllPipeline(props:BookletFigureProps){return <Pipeline {...props} branchFirst={false}/>;}
function BranchPipeline(props:BookletFigureProps){return <Pipeline {...props} branchFirst/>;}

export const legacy2004AutumnPm0105FigureRenderers:readonly BookletFigureRenderer[]=[
  {profile:profiles.network,component:Network},{profile:profiles['address-option'],component:AddressOption},
  {profile:profiles['sales-layout'],component:SalesLayout},{profile:profiles['joined-layout'],component:JoinedLayout},
  {profile:profiles['report-all'],component:AllReport},{profile:profiles['report-branch'],component:BranchReport},
  {profile:profiles['pipeline-all'],component:AllPipeline},{profile:profiles['pipeline-branch'],component:BranchPipeline},
  {profile:profiles['f-option'],component:FOption},
];
