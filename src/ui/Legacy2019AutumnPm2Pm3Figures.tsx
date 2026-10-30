import React from'react';
import{useId,type ReactNode}from'react';
import{legacy2019IpCases,legacy2019ParallelProgram}from'../core/generators/legacy-2019-autumn-pm2';
import{legacy2019LibrarySchema,legacy2019LibraryFigureAlt}from'../core/generators/legacy-2019-autumn-pm3';
export function Legacy2019AutumnPm2Pm3Figure({profile,values,caption,alt}:{profile:string;values:number[];caption:string;alt:string}){
const id=useId().replace(/:/g,''),nodes:ReactNode[]=[];let key=0;
  if(profile==="legacy-2019-autumn-pm3-library-schema")return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"><div role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`} style={{width:"max-content",minWidth:"100%",boxSizing:"border-box",padding:".65em .8em",border:"1px solid var(--line)",lineHeight:1.9}}><span id={`${id}-title`} className="sr-only">{caption}</span><span id={`${id}-desc`} className="sr-only">{legacy2019LibraryFigureAlt(values)}</span><div aria-hidden="true">{legacy2019LibrarySchema(values[0]).map(t=><div key={t.name} data-schema-table={t.name} style={{whiteSpace:"nowrap"}}>{t.name}（{t.columns.map((c,i)=><span key={c.name}>{i?"、":""}<span data-key={c.key??"none"} data-column={c.name} style={c.key?{textDecorationLine:"underline",textDecorationStyle:c.key==="primary"?"solid":"dashed",textUnderlineOffset:".22em",textDecorationThickness:".06em"}:undefined}>{c.name}</span></span>)}）</div>)}</div></div></div><figcaption>{caption}</figcaption></figure>;
  const text = (x: number,y: number,label: string | number) => nodes.push(<text key={key++} x={x} y={y} textAnchor="middle">{label}</text>);
  const line = (x1: number,y1: number,x2: number,y2: number,arrow = false) => nodes.push(<line key={key++} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={arrow ? `url(#${id}-arrow)` : undefined}/>);
  const polyline = (points: string,arrow = false) => nodes.push(<polyline key={key++} points={points} fill="none" markerEnd={arrow ? `url(#${id}-arrow)` : undefined}/>);
  const box = (x: number,y: number,w: number,h: number,label: string,round = false) => { nodes.push(<rect key={key++} x={x} y={y} width={w} height={h} rx={round ? h/2 : 0} fill="var(--surface)"/>); text(x+w/2,y+h/2,label); };
  let height=0,viewWidth=1000;

  if (profile === "legacy-2019-autumn-pm2-parallel-split") {
    height = 440;
    const data = legacy2019ParallelProgram(values[0],values[1]);
    nodes.push(<rect key={key++} x={20} y={45} width={440} height={360} fill="none"/>);
    text(240,20,`プログラム${data.program}`); text(240,85,"⋮"); text(240,350,"⋮");
    const positions = [[40,170,400,110],[585,65,395,110],[585,285,395,110]];
    positions.forEach(([x,y,w,h],i) => {
      nodes.push(<rect key={key++} data-loop={i} x={x} y={y} width={w} height={h} fill="none" strokeDasharray="9 6"/>);
      line(x+16,y+16,x+16,y+h-16);
      nodes.push(<rect key={key++} x={x+10} y={y+10} width={12} height={12} fill="currentColor"/>);
      nodes.push(<rect key={key++} x={x+10} y={y+h-22} width={12} height={12} fill="currentColor"/>);
      nodes.push(<text key={key++} x={x+36} y={y+24} textAnchor="start">{data.loops[i].control}</text>);
      nodes.push(<text key={key++} x={x+36} y={y+67} textAnchor="start">{data.loops[i].statement}</text>);
    });
    text(780,40,`スレッド${data.program}-1`); text(780,260,`スレッド${data.program}-2`);
    line(440,225,585,120,true); line(440,225,585,340,true);
  } else if (profile === "legacy-2019-autumn-pm2-parallel-ip") {
    height = 150; const item = legacy2019IpCases[values[0]], start=220, width=72;
    text(120,35,"要素番号"); text(120,95,"ip[]");
    for (let i=0;i<10;i++) {
      text(start+width*(i+.5),35,i+1);
      if (i<5) { nodes.push(<rect key={key++} x={start+width*i} y={65} width={width} height={60} fill="none"/>); text(start+width*(i+.5),95,item.prefix[i]); }
    }
    nodes.push(<rect key={key++} x={start+width*5} y={65} width={width*5} height={60} fill="none"/>);
    nodes.push(<rect key={key++} x={start+width*5+8} y={73} width={width*5-16} height={44} fill="none"/>); text(start+width*7.5,95,"e");
  } else if (profile === "legacy-2019-autumn-pm2-parallel-ip-option") {
    height = 105;viewWidth=500; const cells = legacy2019IpCases[values[0]].suffixes[values[1]], width=90,start=25;
    cells.forEach((n,i) => { nodes.push(<rect key={key++} x={start+width*i} y={20} width={width} height={65} fill="none"/>); text(start+width*(i+.5),52.5,n); });
  } else throw Error("AUTUMN_PM2_PROFILE");

return <figure className={'managed-diagram source-figure profile-'+profile}><div className="diagram-scroll" tabIndex={0}><svg className="source-figure-svg" viewBox={'0 0 '+viewWidth+' '+height} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'} style={{width:'calc('+viewWidth+'px * var(--image-scale, 1))',minWidth:'100%',fontFamily:'sans-serif',fontSize:22,color:'var(--text-primary)',fill:'var(--text-primary)',stroke:'var(--text-primary)'}}><title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{alt}</desc><defs><marker id={id+'-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs><g aria-hidden="true">{nodes}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
