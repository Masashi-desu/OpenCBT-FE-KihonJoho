import assert from "node:assert/strict";
/** Fixed from the original model and reviewed managed layout, independent of
 * the component's arrays. Every vertex and displayed label is checked. */
const boxes=[
 ["operator",50,30,400,110],["advertisement",140,70,200,35],["advertiser",50,285,400,120],["sales-page",120,335,245,35],["viewer",590,160,270,90],
] as const;
const paths=["M 90 140 L 90 285","M 725 160 L 725 88 L 340 88","M 240 105 L 240 335","M 725 250 L 725 352 L 365 352","M 395 285 L 395 140"];
const words=[
 [65,52,"start","Webサイト運営者"],[240,88,"middle","商品広告"],[65,388,"start","オンラインモールECサイト（広告主）"],[242.5,352,"middle","商品の販売ページ"],[725,190,"middle","Webサイト閲覧者"],[725,220,"middle","（商品の買い手）"],[70,210,"start","①"],[555,68,"start","②"],[220,200,"start","③"],[555,330,"start","④"],[375,210,"start","⑤"],[255,225,"start","リンク先へ"],[255,253,"start","移動する。"],
];
export const legacy2017AffiliateReviewedDescription="Webサイト運営者の枠に商品広告、オンラインモールECサイト（広告主）の枠に商品の販売ページがあり、別にWebサイト閲覧者（商品の買い手）の枠がある。①はWebサイト運営者からオンラインモールECサイトへ向かう。②はWebサイト閲覧者から商品広告へ向かう。③は商品広告から商品の販売ページへ向かい、リンク先へ移動すると記されている。④はWebサイト閲覧者から商品の販売ページへ向かう。⑤はオンラインモールECサイトからWebサイト運営者へ向かう。";
function attributes(tag:string){return Object.fromEntries([...tag.matchAll(/([a-zA-Z][\w:-]*)="([^"]*)"/g)].map(m=>[m[1],m[2]]));}
export function readLegacy2017AffiliateSvg(svg:string){
 const actual=[...svg.matchAll(/<rect\b[^>]*data-affiliate-box="[^"]+"[^>]*>/g)].map(m=>{const a=attributes(m[0]);assert.equal(a.fill,"none");return[a["data-affiliate-box"],Number(a.x),Number(a.y),Number(a.width),Number(a.height)];});assert.deepEqual(actual,boxes.map(b=>[...b]));assert.match(svg,/viewBox="0 0 900 440"/);
 const arrows=[...svg.matchAll(/<path\b[^>]*data-affiliate-arrow="[^"]+"[^>]*>/g)].map(m=>attributes(m[0]));assert.equal(arrows.length,5);const marker=svg.match(/<marker\b[^>]*id="([^"]+)"[^>]*>/);assert(marker);const ma=attributes(marker[0]);assert.equal(ma.orient,"auto");assert.equal(ma.viewBox,"0 0 10 10");assert.equal(ma.refX,"9");assert.equal(ma.refY,"5");const markerBody=svg.slice(marker.index!+marker[0].length,svg.indexOf("</marker>",marker.index));assert.match(markerBody,/<path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor" stroke-width="1.5">/);
 const touched=(x:number,y:number)=>actual.filter(([,bx,by,w,h])=>((x===Number(bx)||x===Number(bx)+Number(w))&&y>=Number(by)&&y<=Number(by)+Number(h))||((y===Number(by)||y===Number(by)+Number(h))&&x>=Number(bx)&&x<=Number(bx)+Number(w))).map(b=>b[0]);
 const routes=arrows.map((a,i)=>{assert.equal(a["data-affiliate-arrow"],String(i+1));assert.equal(a.d,paths[i],"Every intermediate vertex belongs to the reviewed line");assert.equal(a.fill,"none");assert.equal(a["marker-end"],`url(#${ma.id})`);const numbers=a.d.match(/-?\d+(?:\.\d+)?/g)!.map(Number),from=touched(numbers[0],numbers[1]),to=touched(numbers.at(-2)!,numbers.at(-1)!);assert.equal(from.length,1);assert.equal(to.length,1);return[from[0],to[0]];});
 assert.deepEqual(routes,[["operator","advertiser"],["viewer","advertisement"],["advertisement","sales-page"],["viewer","sales-page"],["advertiser","operator"]]);
 const displayed=[...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map(m=>{const a=attributes(m[1]);assert.equal(a.style,"font-size:20px");return[Number(a.x),Number(a.y),a["text-anchor"],m[2]];});assert.deepEqual(displayed,words);
 const description=svg.match(/<desc id="([^"]+)">([^<]*)<\/desc>/);assert(description);assert.equal(description[2],legacy2017AffiliateReviewedDescription);const title=svg.match(/<title id="([^"]+)">([^<]*)<\/title>/);assert(title);assert.equal(title[2],"アフィリエイトプログラムのモデル例");const tag=attributes(svg.match(/<svg\b[^>]*>/)![0]);assert.equal(tag.role,"img");assert.equal(tag["aria-labelledby"],title[1]);assert.equal(tag["aria-describedby"],description[1]);
 return{routes,words:displayed,description:description[2]};
}
