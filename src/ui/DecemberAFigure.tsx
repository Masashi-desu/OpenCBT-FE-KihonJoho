import {useId,type ReactNode} from "react";
import {aTree,aGrid,aTransform,aNetworkDays,aNetworkEdges,aMultiplicityCases} from "../core/generators/sample-2022-dec-a-data";
import {sourceFigureAlt} from "../core/source-figures";
export type ArrayPanelTitleMode = "default" | "2019-autumn-am-9";
export function DecemberAFigure({profile,values:v,caption,panelTitleMode="default"}:{profile:string;values:number[];caption:string;panelTitleMode?:ArrayPanelTitleMode}){
  const id=useId().replace(/:/g,"");let key=0,height=450;const nodes:ReactNode[]=[];
  const text=(x:number,y:number,s:string|number,size=25)=>nodes.push(<text key={key++} x={x} y={y} style={{fontSize:size}} textAnchor="middle">{s}</text>);
  const line=(x1:number,y1:number,x2:number,y2:number,arrow=false,thick=false)=>nodes.push(<line key={key++} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={arrow?`url(#${id}-arrow)`:undefined} style={thick?{strokeWidth:7}:undefined}/>);
  const box=(x:number,y:number,w:number,h:number,label:string,rx=0)=>{nodes.push(<rect key={key++} x={x} y={y} width={w} height={h} rx={rx} fill="var(--surface)"/>);text(x+w/2,y+h/2,label);};
  const circle=(x:number,y:number,label?:string)=>{nodes.push(<circle key={key++} cx={x} cy={y} r={27} fill="var(--surface)"/>);if(label!==undefined)text(x,y,label);};
  const path=(d:string,arrow=false)=>nodes.push(<path key={key++} d={d} fill="none" markerEnd={arrow?`url(#${id}-arrow)`:undefined}/>);
  const loop=(x:number,y:number,label:string,end=false)=>{nodes.push(<polygon key={key++} points={end?`${x},${y} ${x+220},${y} ${x+220},${y+59} ${x+204},${y+75} ${x+16},${y+75} ${x},${y+59}`:`${x},${y+16} ${x+16},${y} ${x+204},${y} ${x+220},${y+16} ${x+220},${y+75} ${x},${y+75}`}/>);text(x+110,y+(end?37:24),label);};
  if(profile==="dec-a-binary-flow"){
    height=760;box(350,20,300,60,"開始",30);line(500,80,500,110,true);box(350,110,300,60,"j を入力");line(500,170,500,200,true);loop(390,200,"変換");text(500,252,`k：1，1，${v[0]}（注）`);line(500,275,500,315,true);box(350,315,300,60,"");box(395,325,210,40,"a");line(500,375,500,415,true);box(350,415,300,60,"");box(395,425,210,40,"b");line(500,475,500,515,true);loop(390,515,"変換",true);line(500,590,500,650,true);box(350,650,300,60,"終了",30);
  }else if(profile==="dec-a-automaton"){
    height=450;const pts=[[200,230],[500,230],[800,230]];line(65,230,167,230,true,true);path("M 178 210 C 90 90, 310 90, 222 210",true);text(195,95,"0／0");path("M 778 210 C 690 90, 910 90, 822 210",true);text(795,95,"1／1");path("M 228 213 Q 350 145 472 213",true);text(350,151,"1／0");path("M 528 213 Q 650 145 772 213",true);text(650,151,"1／1");path("M 472 247 Q 350 305 228 247",true);text(350,294,"0／0");path("M 780 250 Q 500 470 222 250",true);text(500,400,"0／0");pts.forEach(([x,y],i)=>circle(x,y,`S${i+1}`));
  }else if(profile==="dec-a-bst"){
    height=430;const tree=aTree(v[0],v[1],v[2]),pts=[[500,70],[285,215],[715,215],[180,360],[390,360],[610,360],[820,360]];
    if(v[1]===1)pts[5]=[610,360];if(v[1]===2)pts[5]=[820,360];
    for(const [a,b] of tree.edges)line(...pts[a] as [number,number],...pts[b] as [number,number]);tree.values.forEach((n,i)=>circle(pts[i][0],pts[i][1],String(n)));
  }else if(profile==="dec-a-array"){
    height=860;box(40,20,250,55,"開始",25);line(165,75,165,110,true);loop(55,110,"ループ1");text(165,162,"i：0，1，7（注）");line(165,185,165,220,true);loop(55,220,"ループ2");text(165,272,"j：0，1，7（注）");line(165,295,165,335,true);box(40,335,250,65,"");box(85,347,160,41,"a");line(165,400,165,445,true);loop(55,445,"ループ2",true);line(165,520,165,560,true);loop(55,560,"ループ1",true);line(165,635,165,680,true);box(40,680,250,55,"終了",25);text(165,785,"図1 流れ図");
    const panelTitles=panelTitleMode === "2019-autumn-am-9" ? ["図2 配列Aの状態","図3 実行後の配列Bの状態"] : ["図2 配列A","図3 配列B"];
    const a=aGrid(v[1]),b=Array.from({length:8},()=>Array(8).fill(false));for(let i=0;i<8;i++)for(let j=0;j<8;j++){const [r,c]=aTransform(i,j,v[0]);b[r][c]=a[i][j];}
    for(const [gi,grid] of [a,b].entries()){const x=380+gi*330,y=190,cell=30;for(let i=0;i<=8;i++){line(x,y+i*cell,x+8*cell,y+i*cell);line(x+i*cell,y,x+i*cell,y+8*cell);}for(let i=0;i<8;i++){text(x-19,y+i*cell+15,i,21);text(x+i*cell+15,y-22,i,21);for(let j=0;j<8;j++)if(grid[i][j])text(x+j*cell+15,y+i*cell+16,"＊",23);}line(x,y-55,x+8*cell,y-55,true);text(x+120,y-78,"j");line(x-43,y,x-43,y+8*cell,true);text(x-65,y+120,"i");text(x+120,y+280,panelTitles[gi]);}
  }else if(profile==="dec-a-hash"){
    height=410;text(430,40,"位置");text(570,40,"配列");for(const [i,label] of ["0","1","2","…","11","12"].entries()){if(i===3){line(510,75+i*44,510,119+i*44);line(630,75+i*44,630,119+i*44);text(430,97+i*44,label);text(570,97+i*44,"…");}else{box(510,75+i*44,120,44,"");text(430,97+i*44,label);}}
  }else if(profile==="dec-a-availability"){
    height=520;line(80,250,950,250);line(165,135,165,250);box(65,50,200,85,"サーバ");for(let i=0;i<v[1];i++){const x=400+i*450/(v[1]-1);line(x,165,x,250);box(x-95,95,190,70,"プリンタ");}for(let i=0;i<v[0];i++){const x=170+i*660/(v[0]-1);line(x,250,x,360);box(x-100,360,200,80,"クライアント");}text(920,288,"LAN");
  }else if(profile==="dec-a-buffer"){
    height=220;box(30,70,230,80,"送信タスク");box(390,50,220,120,"バッファ");text(500,135,"サイズ：L");line(260,110,390,110,true);text(325,80,"S");line(610,110,740,110,true);text(675,80,"R");box(740,70,230,80,"受信タスク");
  }else if(profile==="dec-a-multiplicity"){
    height=230;const [dl,du,el,eu]=aMultiplicityCases[v[0]],mult=(l:number,u:number)=>l===1&&u===1?"1":`${l}..${u===2?"＊":u}`;box(130,95,200,65,"部署");box(670,95,200,65,"従業員");line(330,127,670,127);text(390,166,mult(dl,du));text(610,166,mult(el,eu));text(500,75,"◀ 所属する");
  }else if(profile==="dec-a-network"){
    height=500;const pts=[[70,250],[235,250],[390,90],[390,250],[390,410],[560,90],[560,250],[735,250],[920,410]],days=[...aNetworkDays];days[0]=v[0];days[4]=v[1];for(const [i,[a,b]] of aNetworkEdges.entries()){const [x,y]=pts[a],[xx,yy]=pts[b],dx=xx-x,dy=yy-y,len=Math.hypot(dx,dy);line(x+dx/len*27,y+dy/len*27,xx-dx/len*29,yy-dy/len*29,true);const mx=(x+xx)/2,my=(y+yy)/2;text(mx,my-17,"ABCDEFGHIJ"[i],23);text(mx,my+21,days[i],23);}pts.forEach(([x,y])=>circle(x,y));circle(720,70);circle(935,70);line(747,70,906,70,true);text(827,38,"作業名");text(827,103,"所要日数");text(827,142,"凡例");
  }else if(profile==="dec-a-dispatch"){
    height=430;const boxes=[[155,30],[675,185],[155,335]],links=[[0,2],[0,1],[2,1]];for(const [i,[a,b]] of links.entries()){const [x,y]=boxes[a],[xx,yy]=boxes[b],dx=xx-x,dy=yy-y,len=Math.hypot(dx,dy),start=1/Math.max(Math.abs(dx/len)/100,Math.abs(dy/len)/30);const x1=x+100+dx/len*start,y1=y+30+dy/len*start,x2=xx+100-dx/len*start,y2=yy+30-dy/len*start;line(x1,y1,x2,y2,true,[2,0,1][v[0]]===i);line(x2,y2,x1,y1,true,[2,0,1][v[0]]===i);}boxes.forEach(([x,y],i)=>box(x,y,200,60,["派遣元企業","派遣先企業","労働者"][i]));
  }
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 1000 ${height}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{sourceFigureAlt(profile,v)}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="currentColor" strokeWidth="1.8"/></marker></defs><g aria-hidden="true">{nodes}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
