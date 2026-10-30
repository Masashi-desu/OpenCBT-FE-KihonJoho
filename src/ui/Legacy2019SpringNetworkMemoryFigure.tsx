/** PM2/PM4 source-local geometry; PM2 source note is restored before its caption. */
import{useId,type ReactNode}from'react';
import{legacy2019PhysicalPageData,legacy2019MemoryFigureAlt}from'../core/generators/legacy-2019-pm-memory';
import{legacy2019LoadBalanceAddresses,legacy2019LoadBalanceFigureAlt}from'../core/generators/legacy-2019-pm-load-balance';
export function Legacy2019SpringNetworkMemoryFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 profile=profile==='legacy-2019-spring-pm2-mapping'?'legacy-2019-page-mapping':profile;
 if(!['legacy-2019-page-mapping','legacy-2019-load-balance-network'].includes(profile)||values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>3)throw Error('PARAMETER_CONSTRAINT');
 const id=useId().replace(/:/g,''),nodes:ReactNode[]=[];let key=0,height:number,viewWidth=1000;
 const text=(x:number,y:number,label:string|number)=>nodes.push(<text key={key++}x={x}y={y}textAnchor="middle">{label}</text>);
 const line=(x1:number,y1:number,x2:number,y2:number,arrow=false)=>nodes.push(<line key={key++}x1={x1}y1={y1}x2={x2}y2={y2}markerEnd={arrow?`url(#${id}-arrow)`:undefined}/>);
 const box=(x:number,y:number,w:number,h:number,label:string)=>{nodes.push(<rect key={key++}x={x}y={y}width={w}height={h}rx={0}fill="var(--surface)"/>);text(x+w/2,y+h/2,label);};
  if(profile==="legacy-2019-page-mapping") {
    height=840;const data=legacy2019PhysicalPageData[values[0]],top=120,row=48;
    text(155,75,"仮想アドレス空間");text(500,75,"ページテーブル");text(850,75,"物理アドレス空間");
    const shade=(x:number,y:number,w:number,h:number)=>{
      nodes.push(<rect key={key++} x={x} y={y} width={w} height={h} fill={`url(#${id}-omitted)`}/>);
    };
    nodes.push(<defs key={key++}><pattern id={`${id}-omitted`} width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="var(--soft-surface)" stroke="none"/><path d="M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6" stroke="var(--line)" strokeWidth="1"/></pattern></defs>);
    for(let i=0;i<8;i++){
      const y=top+row*i;
      text(95,y+row/2,i+1);nodes.push(<rect key={key++} x={110} y={y} width={80} height={row} fill="none"/>);text(150,y+row/2,"ABCDEFGH"[i]);
      text(395,y+row/2,i+1);nodes.push(<rect key={key++} x={410} y={y} width={35} height={row} fill="none"/>);text(427.5,y+row/2,1);
      if(i<4){nodes.push(<rect key={key++} x={445} y={y} width={145} height={row} fill="none"/>);nodes.push(<rect key={key++} x={453} y={y+8} width={129} height={row-16} fill="none"/>);text(517.5,y+row/2,`a${i+1}`);}else shade(445,y,145,row);
      text(795,y+row/2,i+1);nodes.push(<rect key={key++} x={810} y={y} width={80} height={row} fill="none"/>);text(850,y+row/2,data[i]);
    }
    for(const [x,w,h]of [[110,80,90],[410,35,90],[445,145,90],[810,80,44]])nodes.push(<rect key={key++} x={x} y={504} width={w} height={h} fill="none" strokeDasharray="5 5"/>);
    shade(110,594,80,48);text(95,618,"m");shade(410,594,35,48);shade(445,594,145,48);text(395,618,"m");shade(810,548,80,48);text(795,572,"n");
    line(95,750,95,642,true);text(130,785,"仮想ページ番号");
    line(395,700,395,642,true);text(330,740,"仮想ページ番号");
    line(427.5,765,427.5,642,true);text(430,805,"存在ビット");
    line(517.5,700,517.5,642,true);text(565,740,"物理ページ番号");
    line(795,665,795,596,true);text(860,705,"物理ページ番号");
  } else if(profile==="legacy-2019-load-balance-network") {
    height=650;viewWidth=1290;const a=legacy2019LoadBalanceAddresses(values[0]);
    nodes.push(<rect key={key++} x={15} y={75} width={425} height={430} fill="none"/>);nodes.push(<rect key={key++} x={545} y={75} width={730} height={510} fill="none"/>);text(220,45,"教室");text(910,45,"eラーニングシステム");
    line(180,100,180,485);for(const y of [110,165,250,300,355,415,475])nodes.push(<rect key={key++} x={173} y={y-13} width={14} height={26} fill="currentColor"/>);
    for(const y of [135,220,385]){box(40,y,110,60,"");text(95,y+18,"クライ");text(95,y+45,"アント");line(150,y+30,180,y+30);}text(95,335,"⋮");text(220,550,"⋮");
    box(280,265,135,75,"");text(347.5,287,"プロキシ");text(347.5,320,"サーバ");line(180,300,280,300);line(415,300,460,300);
    nodes.push(<ellipse key={key++} cx={485} cy={300} rx={25} ry={110} fill="none"/>);Array.from("インターネット").forEach((c,i)=>text(485,220+i*26,c));line(510,300,580,300);
    for(const [x,top,bottom]of [[580,100,520],[870,105,550]]){line(x,top,x,bottom);for(const y of [top+10,185,300,335,405,505,bottom-10])nodes.push(<rect key={key++} x={x-7} y={y-13} width={14} height={26} fill="currentColor"/>);}
    box(615,165,180,40,"DNSサーバ");line(580,185,615,185);box(615,385,180,40,"負荷分散装置");line(580,405,615,405);line(795,405,870,405);
    for(const[y,name]of [[150,"アプリケーション"],[300,"アプリケーション"],[470,"コンテンツ"]] as const){box(1060,y,205,70,"");text(1162.5,y+23,name);text(1162.5,y+54,y===150?"サーバ1":y===300?"サーバ2":"サーバ");line(870,y+35,1060,y+35);}
    const ip=(x:number,y:number,role:keyof typeof a)=>nodes.push(<text key={key++} data-network-role={role} x={x} y={y} textAnchor="middle">{a[role]}</text>);
    ip(325,235,"proxy");ip(705,140,"dns");ip(705,360,"publicBalancer");ip(770,455,"privateBalancer");ip(965,170,"app1");ip(965,320,"app2");ip(965,490,"content");
    nodes.push(<text key={key++} x={15} y={625} textAnchor="start">注記 x.x.x.xは，IPアドレスを表す。</text>);
  } else throw new Error("UNKNOWN_LEGACY_2019_FIGURE");
 const alt=profile==='legacy-2019-load-balance-network'?legacy2019LoadBalanceFigureAlt(values):legacy2019MemoryFigureAlt(values);
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll"tabIndex={0}aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg"viewBox={`0 0 ${viewWidth} ${height}`}style={profile==='legacy-2019-load-balance-network'?{width:"max(calc(780px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))"}:undefined}role="img"aria-labelledby={`${id}-title`}aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{alt}</desc><defs><marker id={`${id}-arrow`}viewBox="0 0 12 12"refX="11"refY="6"markerWidth="6"markerHeight="6"orient="auto-start-reverse"><path d="M 1 1 L 11 6 L 1 11"fill="none"stroke="currentColor"strokeWidth="1.8"/></marker></defs><g aria-hidden="true">{nodes}</g></svg></div>{profile==='legacy-2019-page-mapping'&&<p data-source-figure-note="pm2">注記 網掛けの部分は表示していない。</p>}<figcaption>{caption}</figcaption></figure>;
}
