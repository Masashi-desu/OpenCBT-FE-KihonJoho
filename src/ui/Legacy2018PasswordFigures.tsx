import{useId}from'react';
import{legacy2018PasswordCase,legacy2018PasswordFigureAlt}from'../core/generators/legacy-2018-pm-password';
/** Fixed source illustration values, including every original ellipsis.
 * Neither image is presented as a complete cryptographic input/output vector. */
export function Legacy2018PasswordFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 legacy2018PasswordCase(values);if(!['legacy-2018-password-basic','legacy-2018-password-salted'].includes(profile))throw Error('UNKNOWN_LEGACY_2018_PASSWORD_FIGURE');
 const salted=profile==='legacy-2018-password-salted',id=useId().replace(/:/g,''),height=salted?1100:760;
 const text=(x:number,y:number,s:string,anchor:'start'|'middle'|'end'='middle')=><text x={x} y={y} textAnchor={anchor}>{s}</text>;
 const node=(name:string,x:number,y:number,w:number,value:string)=><g data-node={name}><rect x={x} y={y} width={w} height="45" fill="var(--surface)"/><text x={x+w/2} y={y+29} textAnchor="middle" style={{fontSize:20,fontFamily:'monospace'}}>{value}</text></g>;
 const edge=(name:string,points:string)=><polyline data-edge={name} points={points} fill="none" markerEnd={`url(#${id}-arrow)`}/>;
 const frame=(top:number,h:number,label:string)=><g><rect x="30" y={top} width="1050" height={h} fill="none" strokeDasharray="10 8"/><rect x="45" y={top-24} width="260" height="44" fill="var(--surface)"/>{text(175,top+6,label)}</g>;
 const browser=(top:number)=><g><rect x="55" y={top} width="240" height="150" rx="18" fill="none"/>{text(175,top+29,'Webブラウザ')}{text(175,top+58,'パスワード')}</g>;
 const file=(x:number,y:number,w:number,h:number)=><g><rect x={x} y={y} width={w} height={h} rx="18" fill="none"/><ellipse cx={x+15} cy={y+h/2} rx="15" ry={h/2} fill="none"/>{text(x+w/2,y-15,'パスワードファイル')}</g>;
 const compare=(a:number,b:number)=><g data-comparison="stored-and-computed"><path d={`M 960 ${a} H 980 V ${b} H 960`} fill="none"/><line x1="980" y1={(a+b)/2} x2="1020" y2={(a+b)/2} markerEnd={`url(#${id}-arrow)`}/>{text(1030,(a+b)/2+8,'照合','start')}</g>;
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="保存と照合の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" style={{width:'calc(1120px * var(--image-scale, 1))',fontSize:22}} viewBox={`0 0 1120 ${height}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2018PasswordFigureAlt(profile,values)}</desc><defs><marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="currentColor" style={{strokeWidth:1.8}}/></marker></defs><g aria-hidden="true">
 {salted?<>
 {frame(50,520,'パスワードの保存')}{frame(630,440,'パスワードの照合')}
 <rect x="335" y="100" width="725" height="960" rx="18" fill="none"/>{text(700,90,'サーバ')}{browser(140)}{browser(720)}
 {node('save.browserP',80,210,180,'ncCr-q$x0w')}{node('save.receivedP',790,210,180,'ncCr-q$x0w')}{text(880,195,'受信したパスワード')}
 {node('save.salt',400,290,160,'cV4Ak#a…')}{text(480,277,'ソルト')}{node('save.concatS',650,290,160,'cV4Ak#a…')}{node('save.concatP',810,290,160,'ncCr-q$x0w')}
 {file(430,460,550,100)}{text(550,486,'ソルト')}{text(870,486,'ハッシュ値')}{node('file.S',460,500,180,'cV4Ak#a…')}{node('file.H',770,500,200,'be8a943a32d…')}
 {edge('save.browserP->save.receivedP','260,232.5 790,232.5')}{text(500,214,'送信')}
 {edge('save.receivedP->save.concatP','880,255 880,290')}{edge('save.salt->save.concatS','560,312.5 650,312.5')}
 <path data-concat="save" d="M650 342 V354 H970 V342 M810 354 V370 H870" fill="none"/>{edge('save.concatSP->file.H','870,370 1035,370 1035,522.5 970,522.5')}<text x="930" y="390" textAnchor="middle" style={{fontSize:20}}>ハッシュ化して</text><text x="930" y="415" textAnchor="middle" style={{fontSize:20}}>保存</text>
 {edge('save.salt->file.S','480,335 480,500')}{text(540,410,'保存')}
 {node('verify.browserP',80,790,180,'ncCr-q$x0w')}{node('verify.receivedP',560,790,200,'ncCr-q$x0w')}{text(660,775,'受信したパスワード')}
 {node('verify.concatS',400,910,160,'cV4Ak#a…')}{node('verify.concatP',560,910,200,'ncCr-q$x0w')}
 {node('verify.storedH',780,750,180,'be8a943a32d…')}{node('verify.computedH',780,990,180,'be8a943a32d…')}
 {edge('verify.browserP->verify.receivedP','260,812.5 560,812.5')}{text(400,793,'送信')}
 {edge('verify.receivedP->verify.concatP','660,835 660,910')}
 {edge('file.S->verify.concatS','550,545 550,665 480,665 480,910')}{text(420,875,'読み出し')}
 {edge('file.H->verify.storedH','870,545 870,750')}{text(930,710,'読み出し')}
 <path data-concat="verify" d="M400 963 V975 H760 V963 M580 975 V1012.5" fill="none"/>{edge('verify.concatSP->verify.computedH','580,1012.5 780,1012.5')}{text(660,1000,'ハッシュ化')}{compare(772.5,1012.5)}
 </>:<>
 {frame(50,305,'パスワードの保存')}{frame(400,325,'パスワードの照合')}
 <rect x="335" y="100" width="725" height="615" rx="18" fill="none"/>{text(700,90,'サーバ')}{browser(140)}{browser(490)}
 {node('save.browserP',80,210,180,'i*ejEf/3as')}{node('save.receivedP',400,210,180,'i*ejEf/3as')}{text(490,195,'受信したパスワード')}
 {file(700,155,270,130)}{text(830,204,'ハッシュ値')}{node('file.H',730,215,190,'a4bde8ac02f7…')}
 {edge('save.browserP->save.receivedP','260,232.5 400,232.5')}{text(325,213,'送信')}{edge('save.receivedP->file.H','580,232.5 730,237.5')}{text(620,120,'ハッシュ化して')}{text(620,150,'保存')}
 {node('verify.browserP',80,560,180,'i*ejEf/3as')}{node('verify.receivedP',400,560,180,'i*ejEf/3as')}{text(490,545,'受信したパスワード')}
 {node('verify.storedH',730,470,190,'a4bde8ac02f7…')}{node('verify.computedH',730,640,190,'a4bde8ac02f7…')}
 {edge('verify.browserP->verify.receivedP','260,582.5 400,582.5')}{text(325,563,'送信')}{edge('file.H->verify.storedH','825,260 825,470')}{text(900,435,'読み出し')}
 {edge('verify.receivedP->verify.computedH','490,605 490,662.5 730,662.5')}{text(610,645,'ハッシュ化')}
 <g data-comparison="stored-and-computed"><path d="M920 492.5 H980 V662.5 H920" fill="none"/><line x1="980" y1="577.5" x2="1020" y2="577.5" markerEnd={`url(#${id}-arrow)`}/>{text(1030,585.5,'照合','start')}</g>
 </>}
 </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
