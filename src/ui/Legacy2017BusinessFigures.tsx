import {useId} from "react";

/** Original affiliate model: all five numbered operations and nested pages. */
export function Legacy2017BusinessFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!=="legacy-2017-affiliate-workflow")throw Error("FIGURE_PROFILE");
 if(values.length!==1||values[0]!==0)throw Error("FIGURE_DOMAIN");
 const id=useId().replace(/:/g,""),wires=["M 90 140 L 90 285","M 725 160 L 725 88 L 340 88","M 240 105 L 240 335","M 725 250 L 725 352 L 365 352","M 395 285 L 395 140"];
 const words=[{x:65,y:52,t:"Webサイト運営者"},{x:240,y:88,t:"商品広告",anchor:"middle"},{x:65,y:388,t:"オンラインモールECサイト（広告主）"},{x:242.5,y:352,t:"商品の販売ページ",anchor:"middle"},{x:725,y:190,t:"Webサイト閲覧者",anchor:"middle"},{x:725,y:220,t:"（商品の買い手）",anchor:"middle"},{x:70,y:210,t:"①"},{x:555,y:68,t:"②"},{x:220,y:200,t:"③"},{x:555,y:330,t:"④"},{x:375,y:210,t:"⑤"},{x:255,y:225,t:"リンク先へ"},{x:255,y:253,t:"移動する。"}];
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="アフィリエイトのモデル例。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox="0 0 900 440" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>Webサイト運営者の枠に商品広告、オンラインモールECサイト（広告主）の枠に商品の販売ページがあり、別にWebサイト閲覧者（商品の買い手）の枠がある。①はWebサイト運営者からオンラインモールECサイトへ向かう。②はWebサイト閲覧者から商品広告へ向かう。③は商品広告から商品の販売ページへ向かい、リンク先へ移動すると記されている。④はWebサイト閲覧者から商品の販売ページへ向かう。⑤はオンラインモールECサイトからWebサイト運営者へ向かう。</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor" strokeWidth="1.5"/></marker></defs><g aria-hidden="true">
  <rect data-affiliate-box="operator" x="50" y="30" width="400" height="110" fill="none"/><rect data-affiliate-box="advertisement" x="140" y="70" width="200" height="35" fill="none"/>
  <rect data-affiliate-box="advertiser" x="50" y="285" width="400" height="120" fill="none"/><rect data-affiliate-box="sales-page" x="120" y="335" width="245" height="35" fill="none"/>
  <rect data-affiliate-box="viewer" x="590" y="160" width="270" height="90" fill="none"/>
  {wires.map((d,i)=><path key={i} data-affiliate-arrow={i+1} d={d} fill="none" markerEnd={`url(#${id}-arrow)`}/>)}
  {words.map((w,i)=><text key={i} x={w.x} y={w.y} textAnchor={w.anchor==="middle"?"middle":"start"} style={{fontSize:20}}>{w.t}</text>)}
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
