/** Visible geometry reader with independent source topology. No production
 * renderer constants or dataset metadata are used to infer the expected wires. */
import assert from "node:assert/strict";
const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
const attrs=(s:string):Record<string,string>=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const tags=(html:string,name:string)=>[...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`,"g"))].map(m=>attrs(m[1]));
const texts=(html:string)=>([...html.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map(m=>({...attrs(m[1]),text:decode(m[2])})))as(Record<string,string>&{text:string})[];
const number=(a:Record<string,string>,k:string)=>Number(a[k]);
export function readLegacy2019PmAuthNetwork(html:string){
 const rects=tags(html,"rect"),ts=texts(html),lines=tags(html,"line"),ellipse=tags(html,"ellipse");assert.equal(ellipse.length,1);assert(ts.some(t=>t.text==="インターネット"&&Number(t.x)===Number(ellipse[0].cx)));
 const outer=rects.find(r=>r.x==="25"),lan=rects.find(r=>r["stroke-dasharray"]);assert(outer&&lan);assert(number(lan,"x")>number(outer,"x")&&number(lan,"y")>number(outer,"y"));assert(number(lan,"x")+number(lan,"width")<number(outer,"x")+number(outer,"width"));assert(number(ellipse[0],"cy")+number(ellipse[0],"ry")<number(outer,"y"));
 const hosts=rects.filter(r=>["200","300"].includes(r.width)),fw=hosts.find(r=>r.width==="300");assert(fw);assert.equal(hosts.length,7);assert(ts.some(t=>t.text==="A社")&&ts.some(t=>t.text==="社内LAN"));
 const readHost=(r:Record<string,string>)=>ts.filter(t=>Number(t.x)>=number(r,"x")&&Number(t.x)<=number(r,"x")+number(r,"width")&&Number(t.y)>=number(r,"y")&&Number(t.y)<=number(r,"y")+number(r,"height")).sort((a,b)=>Number(a.y)-Number(b.y)).map(t=>t.text).join("");
 assert.deepEqual(hosts.map(readHost).sort(),["ファイアウォール","A社認証サーバ","プロキシサーバ","業務システムサーバ","業務システムサーバ","クライアントPC","クライアントPC"].sort());
 const bus=lines.find(l=>l.y1===l.y2&&Number(l.x2)-Number(l.x1)>900);assert(bus);const y=number(bus,"y1"),busXs=[number(bus,"x1"),number(bus,"x2")];
 const wire=(x1:number,y1:number,x2:number,y2:number)=>assert(lines.some(l=>number(l,"x1")===x1&&number(l,"y1")===y1&&number(l,"x2")===x2&&number(l,"y2")===y2),"Missing source attachment wire");
 wire(number(ellipse[0],"cx"),number(ellipse[0],"cy")+number(ellipse[0],"ry"),number(fw,"x")+number(fw,"width")/2,number(fw,"y"));
 for(const h of hosts){const x=number(h,"x")+number(h,"width")/2;assert(x>=busXs[0]&&x<=busXs[1]);if(number(h,"y")<y)wire(x,number(h,"y")+number(h,"height"),x,y);else wire(x,y,x,number(h,"y"));if(h!==fw){assert(number(h,"y")>number(lan,"y"));assert(number(h,"y")+number(h,"height")<number(lan,"y")+number(lan,"height"));}}
 assert.equal(lines.length,9);const ports=rects.filter(r=>r.width==="14");assert.equal(ports.length,9);for(const h of hosts){const x=number(h,"x")+number(h,"width")/2;assert(ports.some(p=>number(p,"x")+7===x&&number(p,"y")+7===y));}for(const x of busXs)assert(ports.some(p=>number(p,"x")+7===x));return{hosts:7,wires:lines.length,ports:ports.length};
}
export function readLegacy2019PmAuthSequence(html:string){
 const ts=texts(html),lines=tags(html,"line"),rects=tags(html,"rect"),names=["B社クラウドサービス","Webブラウザ","IdP","A社認証サーバ"],headers=names.map(name=>{const t=ts.find(t=>t.text===name);assert(t);return t;});assert.deepEqual([...headers].sort((a,b)=>Number(a.x)-Number(b.x)).map(t=>t.text),names);
 const xs=headers.map(t=>Number(t.x)),life=lines.filter(l=>l.x1===l.x2);assert.equal(life.length,4);assert.deepEqual(life.map(l=>Number(l.x1)),xs);const boxes=rects.filter(r=>r.width==="58");assert.equal(boxes.length,11);const labels=ts.filter(t=>/^[①②③④⑤⑥⑦⑧⑨⑩]$/.test(t.text)).sort((a,b)=>Number(a.y)-Number(b.y));assert.deepEqual(labels.map(t=>t.text),[..."①②③④⑤⑥⑦⑧⑨⑩"]);
 const expectedFrom=[1,0,1,2,1,2,3,2,1,0],expectedTo=[0,1,2,1,2,3,2,1,0,1],reply=[false,true,false,true,false,false,true,true,false,true];
 const messages=lines.filter(l=>l["marker-end"]&&Number(l.y1)<700);assert.equal(messages.length,10);for(let i=0;i<10;i++){const label=labels[i],x=Number(label.x),y=Number(label.y);assert.equal(x,xs[expectedFrom[i]],"Numbered sender role differs from source");assert(boxes.some(r=>number(r,"x")+29===x&&number(r,"y")+16===y));const targetY=i<9?Number(labels[i+1].y):y+49,target=xs[expectedTo[i]],direction=Math.sign(target-x),message=messages.find(l=>Number(l.y1)===y);assert(message);assert.deepEqual([number(message,"x1"),number(message,"x2"),number(message,"y2")],[x+direction*29,target-direction*29,targetY]);assert.equal(Boolean(message["stroke-dasharray"]),reply[i]);assert(boxes.some(r=>number(r,"x")+29===target&&number(r,"y")+16===targetY));}
 const final=boxes.filter(r=>!labels.some(t=>Number(t.x)===number(r,"x")+29&&Number(t.y)===number(r,"y")+16));assert.equal(final.length,1);assert.equal(number(final[0],"x")+29,xs[1]);assert(number(final[0],"y")>Number(labels.at(-1)!.y));
 const legends=lines.filter(l=>l["marker-end"]&&Number(l.y1)>=700);assert.equal(legends.length,2);assert(legends.some(l=>!l["stroke-dasharray"])&&legends.some(l=>l["stroke-dasharray"]));assert(ts.some(t=>t.text==="：送信"&&Number(t.y)===Number(legends.find(l=>!l["stroke-dasharray"])!.y1)));assert(ts.some(t=>t.text==="：返信"&&Number(t.y)===Number(legends.find(l=>l["stroke-dasharray"])!.y1)));return{lifelines:4,messages:10,replyMessages:5,boxes:11};
}
