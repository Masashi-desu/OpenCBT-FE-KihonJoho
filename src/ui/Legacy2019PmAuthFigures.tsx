import {useId,type ReactNode} from "react";
import domains from "../core/generators/legacy-2019-pm-auth-figure-domains.json";
import {legacy2019PmAuthFigureAlt} from "../core/generators/legacy-2019-pm-auth";
/** Annual managed geometry. This component is not a shared SourceFigure hook. */
export function Legacy2019PmAuthFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(!(profile in domains)||values.length!==1||values[0]!==0)throw Error("PARAMETER_CONSTRAINT");
 const id=useId().replace(/:/g,""),nodes:ReactNode[]=[];let next=0;const width=1120,height=profile.endsWith("network")?550:790;
 const text=(x:number,y:number,s:string,anchor:"middle"|"start"|"end"="middle")=>nodes.push(<text key={next++} x={x} y={y} textAnchor={anchor}>{s}</text>);
 const line=(x1:number,y1:number,x2:number,y2:number,arrow=false,dashed=false)=>nodes.push(<line key={next++} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={arrow?`url(#${id}-arrow)`:undefined} strokeDasharray={dashed?"10 7":undefined}/>);
 const box=(x:number,y:number,w:number,h:number,fill="var(--surface)",dashed=false)=>nodes.push(<rect key={next++} x={x} y={y} width={w} height={h} fill={fill} strokeDasharray={dashed?"10 7":undefined}/>);
 if(profile.endsWith("network")){
  box(25,100,1070,430,"none");box(45,190,1030,320,"none",true);
  nodes.push(<ellipse key={next++} cx={550} cy={40} rx={145} ry={28} fill="var(--surface)"/>);
  line(550,68,550,120);line(550,170,550,330);line(75,330,1045,330);
  for(const x of[270,840])line(x,290,x,330);for(const x of[180,420,670,920])line(x,330,x,380);
  // The bus includes terminal ports in addition to the six host/FW connections.
  for(const x of[75,180,270,420,550,670,840,920,1045])box(x-7,323,14,14,"currentColor");
  box(400,120,300,50);box(170,230,200,60);box(740,230,200,60);
  for(const x of[80,320,570,820])box(x,380,200,80);
  text(70,130,"A社","start");text(65,217,"社内LAN","start");text(550,40,"インターネット");text(550,145,"ファイアウォール");
  text(270,250,"A社認証");text(270,276,"サーバ");text(840,250,"プロキシ");text(840,276,"サーバ");
  for(const x of[180,420]){text(x,406,"業務システム");text(x,438,"サーバ");}
  for(const x of[670,920]){text(x,406,"クライアント");text(x,438,"PC");}
 }else{
  const xs=[160,440,680,960],headers=["B社クラウドサービス","Webブラウザ","IdP","A社認証サーバ"],widths=[290,230,180,270];
  xs.forEach((x,i)=>{line(x,75,x,680);box(x-widths[i]/2,20,widths[i],50);text(x,45,headers[i]);});
  // Each arrow connects the numbered sender's box to the following recipient's
  // box, just as the physical source diagram; the final browser box is blank.
  const senders=[1,0,1,2,1,2,3,2,1,0],recipients=[0,1,2,1,2,3,2,1,0,1],reply=new Set([2,4,7,8,10]),ys=Array.from({length:11},(_,i)=>115+i*49),half=29;
  for(let i=0;i<10;i++){const a=xs[senders[i]],b=xs[recipients[i]],direction=Math.sign(b-a);line(a+direction*half,ys[i],b-direction*half,ys[i+1],true,reply.has(i+1));}
  for(let i=0;i<11;i++){const x=xs[i===10?1:senders[i]];box(x-half,ys[i]-16,half*2,32);if(i<10)text(x,ys[i],"①②③④⑤⑥⑦⑧⑨⑩"[i]);}
  text(680,735,"（凡例）");line(900,720,780,720,true);text(920,720,"：送信","start");line(900,755,780,755,true,true);text(920,755,"：返信","start");
 }
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="原資料に基づくネットワーク・処理の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 ${width} ${height}`} style={{width:`calc(${width}px * var(--image-scale, 1))`,minWidth:"100%"}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2019PmAuthFigureAlt(profile)}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX={11} refY={6} markerWidth={8} markerHeight={8} orient="auto"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="currentColor"/></marker></defs><g aria-hidden="true" fill="none">{nodes}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
