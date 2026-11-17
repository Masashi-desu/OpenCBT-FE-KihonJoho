import React from 'react';
import type { BookletFigureRenderer, BookletFigureProps } from './booklet-figure-renderer-contract';
import { legacy2006SpringAm5480Figures as figures, spring2006AmLayers, spring2006AmDeviceDepth, spring2006AmNormalForm,
  spring2006AmVisit, spring2006AmSchema, spring2006AmAnalyses, layerNames } from '../core/generators/legacy-2006-spring-am-54-80-figures';

const graphStyle={display:'block',maxWidth:'none'} as const;
type GraphicName={caption:string;alt:string};
function Graphic({width,height,caption,alt,children}:GraphicName&{width:number;height:number;children:React.ReactNode}) {
  const id=React.useId(),titleId=id+'-title',descriptionId=id+'-desc';
  return <svg className="diagram-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height}
    role="img" aria-labelledby={titleId} aria-describedby={descriptionId} style={graphStyle}>
    <title id={titleId}>{caption}</title><desc id={descriptionId}>{alt}</desc>{children}
  </svg>;
}
function Protocol({i,option,caption,alt}:{i:number;option:number}&GraphicName) {
  const {labels,row}=spring2006AmLayers(i,option);
  return <Graphic width={322} height={137} caption={caption} alt={alt}>
    <g stroke="currentColor" fill="none">
      {[20,52,84,116].map(y=><path key={y} d={`M 162 ${y} H 310`} strokeDasharray="4 4"/>)}
      <rect x="196" y={20+row*32} width="76" height="64" strokeWidth="1.8"/>
      <path d={`M 196 ${52+row*32} H 272`} strokeWidth="1.8"/>
    </g>
    <g fill="currentColor" fontSize="15">
      {layerNames.map((label,j)=><text key={label} x="8" y={40+j*32}>{label}</text>)}
      {labels.map((label,j)=><text key={label} x="234" y={40+(row+j)*32} textAnchor="middle">{label}</text>)}
    </g>
  </Graphic>;
}
const networkLayers=['アプリケーション層','プレゼンテーション層','セッション層','トランスポート層','ネットワーク層','データリンク層','物理層'];
function Network({i,caption,alt}:{i:number}&GraphicName){
  const depth=spring2006AmDeviceDepth(i), boxW=172, top=32, rowH=24, floor=top+7*rowH, y=top+(7-depth)*rowH;
  const marker=React.useId();
  const arrange=(x:number,depth:number,name:string)=><g key={name}>
    <text x={x+boxW/2} y={floor-depth*rowH-7} textAnchor="middle" fill="currentColor">{name}</text>
    {networkLayers.slice(7-depth).map((layer,j)=><g key={layer}>
      <rect x={x} y={floor-(depth-j)*rowH} width={boxW} height={rowH} stroke="currentColor" fill="none"/>
      <text x={x+boxW/2} y={floor-(depth-j)*rowH+17} textAnchor="middle" fill="currentColor">{layer}</text>
    </g>)}
  </g>;
  return <Graphic width={716} height={274} caption={caption} alt={alt}>
    <defs><marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="currentColor"/>
    </marker></defs>
    <g fontSize="14">
      {arrange(48,7,'ステーション1')}{arrange(272,depth,'装置A')}{arrange(496,7,'ステーション2')}
      <g fill="none" stroke="currentColor">
        <path d="M 12 222 H 334 M 390 222 H 703 M 130 200 V 222 M 305 200 V 222 M 412 200 V 222 M 582 200 V 222" strokeWidth="2"/>
        <path d={`M 52 4 V 216 Q 52 235 69 235 H 251 Q 278 235 278 216 V ${y+18}
          Q 278 ${y+9} 291 ${y+9} H 433 Q 440 ${y+9} 440 ${y+20} V 216 Q 440 235 457 235 H 643 Q 663 235 663 216 V 7`}
          strokeDasharray="6 4" markerEnd={'url(#'+marker+')'}/>
        <path d="M 531 260 H 586" strokeDasharray="6 4" markerEnd={'url(#'+marker+')'}/>
      </g>
      <g fill="currentColor">
        {[14,328,398,697].map(x=><rect key={x} x={x-4} y="218" width="9" height="8"/>)}
        {[130,305,412,582].map(x=><rect key={x} x={x-14} y="218" width="28" height="8"/>)}
        <text x="138" y="252">LANセグメント1</text><text x="491" y="252">LANセグメント2</text>
        <text x="593" y="265">データの流れ</text>
      </g>
    </g>
  </Graphic>;
}
function NormalForm({i,option,caption,alt}:{i:number;option:number}&GraphicName) {
  const {key,determinant,dependent,rows}=spring2006AmNormalForm(i), marker=React.useId();
  const labels=[...'abcdef'];
  const start=32,width=58,mid=(c:string)=>start+(labels.indexOf(c)+0.5)*width;
  const row=(values:string[],x:number,y:number)=><g key={values.join('')} transform={`translate(${x} ${y})`}>
    {values.map((value,j)=><g key={value}>
      <rect x={j*width} width={width} height="34" stroke="currentColor" fill="none"/>
      <text x={j*width+width/2} y="22" textAnchor="middle" fontSize="16" fill="currentColor">{value}</text>
    </g>)}
  </g>;
  if(option>=0){
    let x=10;
    const cells=rows[option].map(r=>{const before=x;x+=r.length*width+16;return row(r,before,7);});
    return <Graphic width={x} height={49} caption={caption} alt={alt}>{cells}</Graphic>;
  }
  const [one,two]=key.map(mid);
  return <Graphic width={416} height={174} caption={caption} alt={alt}>
    <defs><marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="currentColor"/>
    </marker></defs>
    {row(labels,start,74)}
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d={`M ${one} 74 V 54 H ${two} V 74 M ${(one+two)/2} 54 V 26 H ${mid('f')}`}/>
      {labels.filter(v=>!key.includes(v)).map(v=><path key={v} d={`M ${mid(v)} 26 V 74`} markerEnd={'url(#'+marker+')'}/>)}
      <path d={`M ${mid(determinant)} 108 V 149 H ${mid(dependent)} V 109`} markerEnd={'url(#'+marker+')'}/>
    </g>
  </Graphic>;
}
const circled='①②③④';
function Visitor({i,caption,alt}:{i:number}&GraphicName) {
  const {steps}=spring2006AmVisit(i), arrow=React.useId();
  const drawings=[0,1].map(viewer=>{
    const y=38+viewer*115, r=circled[steps[viewer*2]-1], w=circled[steps[viewer*2+1]-1];
    return <g key={viewer} fill="currentColor">
      <rect x="14" y={y+34} width="87" height="33" fill="none" stroke="currentColor"/>
      <text x="25" y={y+56}>閲覧者{viewer+1}</text>
      <rect x="250" y={y} width="245" height="115" fill="none" stroke="currentColor"/>
      <text x="259" y={y+19}>〔処理内容〕</text>
      <text x="262" y={y+41}>{r}　アクセスカウンタを</text>
      <text x="289" y={y+61}>読み込み，1を加算する</text>
      <text x="262" y={y+84}>{w}　アクセスカウンタに処理</text>
      <text x="289" y={y+105}>{r}の結果を書き込む</text>
      <g fill="none" stroke="currentColor" markerEnd={'url(#'+arrow+')'}>
        <path d={`M 102 ${y+49} L 249 ${y+51}`}/>
        <path d={`M 585 164 L 496 ${y+41}`}/>
        <path d={`M 497 ${y+91} L 585 164`}/>
      </g>
    </g>;
  });
  return <Graphic width={730} height={294} caption={caption} alt={alt}>
    <defs><marker id={arrow} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="currentColor"/>
    </marker></defs>
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="226" y="16" width="489" height="270"/>
      <ellipse cx="161" cy="151" rx="31" ry="133"/>
      <path d="M 552 129 V 225 A 72 18 0 0 0 696 225 V 129"/>
      <ellipse cx="624" cy="130" rx="72" ry="19"/>
      <rect x="585" y="150" width="70" height="54"/>
    </g>
    <g fill="currentColor" fontSize="15">
      <text x="632" y="40">サーバ</text>
      <text x="130" y="150">インター</text><text x="139" y="172">ネット</text>
      <text x="590" y="174">アクセス</text><text x="590" y="194">カウンタ</text>
      {drawings}
    </g>
  </Graphic>;
}
function Keys({i}:{i:number}) {
  return <ul role="list" style={{margin:0,padding:0,listStyle:'none',whiteSpace:'nowrap',width:'max-content',lineHeight:'1.85'}}>
    {spring2006AmSchema(i).map(row=><li key={row.name}>
      {row.name}（{row.fields.map((field,j)=><React.Fragment key={field.name}>
        {j>0?'，':''}<span style={{textDecorationLine:field.mark?'underline':undefined,
          textDecorationStyle:field.mark==='foreign'?'dashed':undefined,textUnderlineOffset:'0.24em'}}>{field.name}</span>
      </React.Fragment>)}）
    </li>)}
  </ul>;
}
function Analysis({i,option,caption,alt}:{i:number;option:number}&GraphicName) {
  const kind=spring2006AmAnalyses(i)[option], marker=React.useId(), hatch=React.useId();
  const shift=[0,13,-11,18][i], bar=[135,116,97,78,59,39].map((v,j)=>v+(j%2===0?shift:Math.round(shift/3)));
  const bends=[96+shift,126+Math.round(shift/2),184+shift];
  const leading=[42+shift,91-shift,154+shift,182-shift];
  return <Graphic width={280} height={214} caption={caption} alt={alt}>
    <defs>
      <marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="currentColor"/>
      </marker>
      <pattern id={hatch} width="7" height="7" patternUnits="userSpaceOnUse">
        <path d="M -1 1 L 1 -1 M 0 7 L 7 0 M 6 8 L 8 6" fill="none" stroke="currentColor"/>
      </pattern>
    </defs>
    <g stroke="currentColor" fill="none" strokeWidth="1.65">
      {kind===0&&<path data-chart="branch" d={`M 16 26 H ${bends[0]} V 62 H 16 M ${bends[0]} 44 H ${bends[2]} V 151 H ${bends[1]}
        M 16 103 H ${bends[0]} V 142 H 16 M ${bends[0]} 122 H ${bends[1]} V 171 H 16 M ${bends[2]} 97 H 255`} />}
      {kind===1&&<g data-chart="bars"><path d="M 18 18 V 191 H 264"/>
        {bar.map((height,j)=><rect key={j} x={18+j*37} y={191-height} width="37" height={height}/>)}
      </g>}
      {kind===2&&<g data-chart="region">
        <path d="M 35 14 V 184 H 248"/>
        <path d={`M 35 86 L ${103+shift} 111 L ${137+shift} 141 L ${152+shift} 184 H 35 Z`} fill={'url(#'+hatch+')'}/>
        <path d={`M 35 86 L 218 152 M 56 55 L 195 169 M ${106+shift} 30 L ${152+shift} 184`} />
      </g>}
      {kind===3&&<g data-chart="spine">
        <path d="M 16 102 H 258" strokeWidth="3" markerEnd={'url(#'+marker+')'}/>
        {leading.map((x,j)=>{
          const y=j%2===0?42:171, stem=x+36;
          return <g key={j}>
            <rect x={x-16} y={y+(j%2===0?-18:0)} width="36" height="17"/>
            <path d={`M ${x} ${y} L ${stem} 102 M ${x-30} ${(y+102)/2} H ${x+18}`}
              markerEnd={'url(#'+marker+')'}/>
          </g>;
        })}
      </g>}
    </g>
  </Graphic>;
}
function Chart({caption,values,profile}:{profile:string}&BookletFigureProps) {
  const [index]=values, suffix=profile.replace('legacy-2006-spring-am-',''), [number,,variant]=suffix.split('-');
  const option=Number(variant)-1;
  const alt=figures.find(row=>row.profile===profile)!.alt(values);
  const name={caption,alt};
  let content;
  switch(number){
    case '54':content=<Protocol {...name} i={index} option={option}/>;break;
    case '57':content=<Network {...name} i={index}/>;break;
    case '58':content=<NormalForm {...name} i={index} option={Number.isNaN(option)?-1:option}/>;break;
    case '61':content=<Visitor {...name} i={index}/>;break;
    case '63':content=<Keys i={index}/>;break;
    case '75':content=<Analysis {...name} i={index} option={option}/>;break;
  }
  return <figure className="source-figure managed-diagram" style={{minWidth:0,maxWidth:'100%'}}>
    <div className="diagram-scroll" tabIndex={0} role="group" aria-label={caption} aria-description={number==='63'?alt:undefined}
      data-figure-profile={profile} style={{color:'var(--diagram-ink)',fontSize:'calc(16px * var(--image-scale, 1))'}}>{content}</div>
  </figure>;
}
export const legacy2006SpringAm5480FigureRenderers:readonly BookletFigureRenderer[]=figures.map(figure=>({
  profile:figure.profile,component:props=><Chart {...props} profile={figure.profile}/>,
}));
