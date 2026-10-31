import {useId} from 'react';
import {legacy2017AutumnSecurityTransportAlt,legacy2017AutumnSecurityTransportProfile} from '../core/generators/legacy-2017-autumn-security';
/** Controlled source-form diagram. All lines and shapes carry currentColor.
 * Shared source_figure admission remains pending; this component is private. */
export function Legacy2017AutumnSecurityFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!==legacy2017AutumnSecurityTransportProfile)throw Error('FIGURE_PROFILE');if(values.length!==1||values[0]!==0)throw Error('FIGURE_DOMAIN');const id=useId().replace(/:/g,'');
 const boxes=[['client',120,65,280,220],['server',520,65,280,220],['application',132,82,256,58],['client-program',132,185,256,83],['database',532,82,256,58],['server-program',532,185,256,83],['attacker',330,385,260,58]] as const;
 const wires=[['app-client','260,140 260,185'],['client-bus','260,268 260,325'],['db-server','660,140 660,185'],['server-bus','660,268 660,325'],['bus','60,325 860,325']] as const;
 const labels=[['client','クライアント',260,45],['server','サーバ',660,45],['application','アプリケーション',260,119],['database','データベース',660,119],['client-program','データベース接続\nプログラム',260,215],['server-program','データベース接続\nプログラム',660,215],['attacker','攻撃者による盗聴',460,423]] as const;
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="通信構成図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" style={{minWidth:'calc(920px * var(--image-scale, 1))'}} viewBox="0 0 920 470" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}>
 <title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{legacy2017AutumnSecurityTransportAlt}</desc>
 <defs><marker id={`${id}-arrow`} markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L11,6 L1,11" fill="none" stroke="currentColor" strokeWidth="2"/></marker></defs>
 <g aria-hidden="true">{boxes.map(([name,x,y,width,height])=><rect key={name} data-transport-box={name} x={x} y={y} width={width} height={height} fill="none"/>)}{wires.map(([name,points])=><polyline key={name} data-transport-wire={name} points={points} fill="none"/>)}{[60,860].map((x,i)=><rect key={x} data-transport-end={i} x={x-10} y="315" width="20" height="20" fill="currentColor"/>)}<polyline data-transport-tap="attacker" points="460,325 460,385" fill="none" strokeDasharray="4 4" markerEnd={`url(#${id}-arrow)`}/>{labels.map(([name,text,x,y])=><text key={name} data-transport-label={name} x={x} y={y} textAnchor="middle">{text.split('\n').map((line,i)=><tspan key={i} x={x} dy={i?30:0}>{line}</tspan>)}</text>)}</g></svg></div><figcaption>{caption}</figcaption></figure>;
}
