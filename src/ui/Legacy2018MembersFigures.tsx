import{useId}from'react';
import{legacy2018MembersCase,legacy2018MembersFigureAlt}from'../core/generators/legacy-2018-pm-members';
export function Legacy2018MembersFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const id=useId().replace(/:/g,''),tables=profile==='legacy-2018-members-tables';let kind=0;if(tables)legacy2018MembersCase(values);else{if(profile!=='legacy-2018-members-sql-scaffold'||values.length!==3||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>2)throw Error('UNKNOWN_LEGACY_2018_MEMBERS_FIGURE');kind=values[0];legacy2018MembersCase(values.slice(1));}
 const text=(x:number,y:number,s:string,anchor:'start'|'middle'='middle')=><text x={x} y={y} textAnchor={anchor}>{s}</text>;
 const table=(name:string,x:number,y:number,widths:number[],headers:string[],primary:number[],rows:(string|number)[][])=><g data-table={name}>{text(x,y-18,name,'start')}{[headers,...rows,headers.map(()=>'⋮')].map((row,i)=><g data-row={i} key={i}>{row.map((v,j)=>{const left=x+widths.slice(0,j).reduce((a,b)=>a+b,0),w=widths[j];return <g data-cell={j} key={j}><rect x={left} y={y+i*54} width={w} height="54" fill="none"/>{text(left+w/2,y+i*54+35,String(v))}{i===0&&primary.includes(j)&&<line data-primary={j} x1={left+14} x2={left+w-14} y1={y+43} y2={y+43}/>}</g>;})}</g>)}</g>;
 const height=tables?950:kind===1?250:150;
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="表とSQL文。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 1260 ${height}`} style={{width:'calc(1260px * var(--image-scale, 1))',fontSize:24}} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2018MembersFigureAlt(profile,values)}</desc><g aria-hidden="true">
 {tables?<>
 {table('保護者表',40,60,[180,230,270,420],['保護者番号','保護者氏名','電話番号','住所'],[0],[[12021,'情報花子','03-1111-2222','東京都○○区□□□']])}
 {table('児童表',40,320,[180,230,150,220],['児童番号','児童氏名','学年','保護者番号'],[0],[[12027,'情報一郎',6,12021],[14021,'情報二郎',4,12021]])}
 {table('活動表',40,640,[210,250],['児童番号','イベント番号'],[0,1],[[12027,18001],[14021,18001],[12027,18002]])}
 {table('イベント表',550,640,[200,230,240],['イベント番号','イベント名','開催日'],[0],[[18001,'歓迎会',20180407],[18002,'地域清掃',20180414]])}
 </>:<g data-scaffold={['a','b','c'][kind]} style={{fontFamily:'monospace',fontSize:22}}>
 {kind===0?<>{text(40,42,'SELECT DISTINCT 保護者表.保護者番号, 保護者表.保護者氏名','start')}<rect data-blank="a" x="80" y="65" width="600" height="48" fill="none"/>{text(380,97,'a')}</>:kind===1?<>{text(40,42,'SELECT イベント表.イベント名,','start')}<rect data-blank="b" x="525" y="10" width="220" height="48" fill="none"/>{text(635,42,'b')}{text(80,100,'FROM 活動表, イベント表','start')}{text(80,156,'WHERE 活動表.イベント番号 = イベント表.イベント番号','start')}{text(80,212,'GROUP BY イベント表.イベント名','start')}</>:<>{text(40,42,'DELETE FROM 保護者表','start')}{text(80,103,'WHERE','start')}<rect data-blank="c" x="180" y="70" width="750" height="48" fill="none"/>{text(555,102,'c')}</>}
 </g>}
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
