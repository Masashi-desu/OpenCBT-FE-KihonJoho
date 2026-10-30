import React from'react';
/** Private annual managed diagrams. No shared registration or arbitrary data code. */
import{useId}from'react';
import{legacy2019TeleworkFigureAlts}from'../core/generators/legacy-2019-autumn-pm1-model';
export function Legacy2019AutumnPm1Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(!['legacy-2019-autumn-pm1-telework-network-before','legacy-2019-autumn-pm1-telework-network-after'].includes(profile)||values.length!==1||values[0]!==0)throw Error('Invalid telework fixed figure');
 const after=profile.endsWith('-after'),id=useId(),height=after?1530:1160,roomTop=after?350:250,officeBus=after?480:380,devBus=after?1140:880,publicBus=officeBus,serverBus=after?1280:880;
 const text=(x:number,y:number,t:string,key:string,anchor:'start'|'middle'='middle')=><text data-label={key} key={key} x={x} y={y} textAnchor={anchor}>{t}</text>;
 const wire=(x1:number,y1:number,x2:number,y2:number,key:string)=><line data-wire={key} key={key} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={3}/>;
 const port=(x:number,y:number,key:string,terminal?:string)=><rect data-port={key} data-terminal={terminal} key={key} x={x-5} y={y-5} width={10} height={10} fill="var(--text-primary)"/>;
 const box=(x:number,y:number,w:number,h:number,label:string,key:string)=><g data-node={key} key={key}><rect x={x} y={y} width={w} height={h} fill="var(--surface)" strokeWidth={2}/>{text(x+w/2,y+h/2+9,label,key+'-text')}</g>;
 const room=(x:number,y:number,w:number,h:number,name:string,key:string)=><g data-room={key} key={key}><rect x={x} y={y} width={w} height={h} rx={12} fill="none" strokeDasharray="9 7" strokeWidth={2}/>{text(x+18,y+36,name,key+'-title','start')}</g>;
 const bus=(y:number,net:string,left:boolean,key:string)=>{const a=left?90:870,b=left?750:1580;return <g data-bus={key} key={key}>{wire(a,y,b,y,key+'-bus')}{port(left?b:a,y,key+'-fw',key+(left?'-cap-right':'-cap-left'))}{port(left?a:b,y,key+'-outer',key+(left?'-cap-left':'-cap-right'))}{text(left?330:key==='vpn-private'?1450:1240,y-35,net,key+'-network')}</g>;};
 const pair=(y:number,label:string,left:boolean,key:string)=>{const xs=left?[130,430]:[1050,1370],w=180;return <g data-pair={key} key={key}>{xs.map((x,i)=><g key={i}>{wire(x+w/2,y,x+w/2,y+75,key+'-'+i+'-stem')}{port(x+w/2,y,key+'-'+i+'-junction')}{box(x,y+75,w,85,label,key+'-'+i)}</g>)}{text(left?370:1300,y+130,'…',key+'-ellipsis')}</g>;};
 return <figure className={'managed-diagram source-figure profile-'+profile}><div className="diagram-scroll" tabIndex={0} aria-label="ネットワーク構成図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" data-telework-profile={profile} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 1700 ${height}`} width={1700} style={{display:'block',width:'calc(1700px * var(--image-scale, 1))',minWidth:'100%',maxWidth:'none',color:'var(--text-primary)',background:'var(--surface)',fontFamily:'sans-serif',fontSize:26,fill:'var(--text-primary)',stroke:'var(--text-primary)'}} role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}>
 <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{legacy2019TeleworkFigureAlts[after?1:0]}</desc>
 <g aria-hidden="true"><g stroke="none">{text(120,after?330:230,'A社','company-title','start')}</g>
 <rect data-frame="company" x={40} y={after?300:200} width={1620} height={after?1190:910} rx={20} fill="none" strokeWidth={2}/>
 {room(65,roomTop,600,after?360:330,'事務室','office')}{room(65,after?1010:750,600,330,'開発室','development')}{room(925,roomTop,700,after?1120:830,'サーバ室','server')}
 <g data-node="internet"><ellipse cx={810} cy={after?200:100} rx={110} ry={55} fill="var(--surface)" strokeWidth={2}/>{text(810,after?209:109,'インターネット','internet-text')}</g>
 {wire(810,after?255:155,810,roomTop,'internet-fw')}{box(750,roomTop,120,height-roomTop-100,'A社FW','firewall')}
 {bus(officeBus,'192.168.0.0/24',true,'office')}{pair(officeBus,'事務PC',true,'officePC')}
 {bus(devBus,'192.168.1.0/24',true,'development')}{pair(devBus,'開発PC',true,'developmentPC')}
 {bus(publicBus,'203.0.113.0/24',false,'public')}
 {after?<>{wire(1160,publicBus,1160,550,'vpn-external-stem')}{port(1160,publicBus,'vpn-external-junction')}{text(1160,400,'203.0.113.10','vpn-external-ip')}{box(1040,550,240,80,'VPNサーバ','vpn')}{port(1160,550,'vpn-external-nic')}{port(1160,630,'vpn-internal-nic')}{wire(1160,630,1160,720,'vpn-internal-stem')}{text(1040,680,'192.168.16.1','vpn-internal-ip')}{bus(720,'192.168.16.0/24',false,'vpn-private')}{port(1160,720,'vpn-internal-junction')}
 {wire(1490,publicBus,1490,550,'proxy-stem')}{port(1490,publicBus,'proxy-junction')}{text(1490,400,'203.0.113.20','proxy-ip')}{box(1380,550,220,80,'プロキシサーバ','proxy')}
 {bus(900,'192.168.64.0/20',false,'vdi')}{wire(1300,900,1300,960,'vdi-stem')}{port(1300,900,'vdi-junction')}
 <g data-node="vdi"><rect x={1030} y={960} width={550} height={180} fill="var(--surface)" strokeWidth={2}/>{text(1305,998,'VDIサーバ','vdi-text')}{box(1060,1020,200,75,'仮想マシン','vm-0')}{box(1350,1020,200,75,'仮想マシン','vm-1')}{text(1305,1068,'…','vm-ellipsis')}</g>
 <g data-node="thinclient"><rect x={190} y={45} width={420} height={190} fill="var(--surface)" strokeWidth={2}/><rect x={180} y={35} width={420} height={190} fill="var(--surface)" strokeWidth={2}/>{text(390,72,'シンクライアント端末','thinclient-text')}{box(215,90,350,60,'VDIクライアント','vdi-client')}{box(215,155,350,60,'VPNクライアント','vpn-client')}</g>{wire(610,190,702,190,'thinclient-internet')}
 </>:<>{wire(1300,publicBus,1300,455,'proxy-stem')}{port(1300,publicBus,'proxy-junction')}{text(1500,425,'203.0.113.20','proxy-ip')}{box(1180,455,240,80,'プロキシサーバ','proxy')}</>}
 {bus(serverBus,'192.168.128.0/20',false,'development-server')}{pair(serverBus,'開発サーバ',false,'developmentServer')}
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
