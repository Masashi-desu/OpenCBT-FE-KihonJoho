import {useId} from 'react';
import {autumnParameter} from '../core/generators/legacy-2017-autumn-pm1-4-preparation';
import {legacy2017AutumnPm1Source,legacy2017AutumnPm1TimelineAlt,legacy2017AutumnPm1TimelineProfile} from '../core/generators/legacy-2017-autumn-pm1-source';

/** Production-intended component, tested directly until shared registration. */
export function Legacy2017AutumnPm1Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const id=useId().replace(/:/g,'');
 if(profile!==legacy2017AutumnPm1TimelineProfile)throw Error('AUTUMN_PM1_PROFILE');autumnParameter(values,2);
 if(caption!=='図1　SSHセッションの流れ')throw Error('AUTUMN_PM1_CAPTION');
 return <figure className={'managed-diagram source-figure profile-'+profile} data-autumn-pm1-timeline="1"><div className="diagram-scroll" tabIndex={0} aria-label={caption+'。左右にスクロールできます。'}><svg className="source-figure-svg" viewBox="0 0 960 240" role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'} style={{width:'max(calc(960px * var(--image-scale, 1)), calc(100% * var(--image-scale, 1)))'}}><title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{legacy2017AutumnPm1TimelineAlt}</desc><defs><marker id={id+'-start'} markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto"><path d="M8 0L0 4L8 8" fill="none" stroke="currentColor"/></marker><marker id={id+'-end'} markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="currentColor"/></marker><marker id={id+'-arrow'} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker></defs><g aria-hidden="true" stroke="currentColor" fill="none"><path d="M100 45V170 M860 45V170 M390 112V170 M575 112V170"/>{['M100 80H860','M100 145H390','M390 145H575','M575 145H860'].map((d,i)=><path key={d} data-pm1-interval={i} d={d} markerStart={'url(#'+id+'-start)'} markerEnd={'url(#'+id+'-end)'}/>)}<path d="M80 200H925" markerEnd={'url(#'+id+'-arrow)'}/></g><g aria-hidden="true" fill="currentColor" textAnchor="middle" fontSize="21"><text x="100" y="28">SSHセッション開始</text><text x="860" y="28">SSHセッション終了</text><text x="480" y="64">SSHセッション</text><text x="245" y="130">安全な通信経路の確立</text><text x="482" y="130">利用者認証</text><text x="718" y="130">ログインセッション</text><text x="43" y="208">時間</text></g></svg></div><figcaption>{caption}</figcaption></figure>;
}
const source=legacy2017AutumnPm1Source(),accepted=new Set(['(4)　'+source.steps[3],'(5)　'+source.steps[4],source.userParagraphs[3]]);
export const isLegacy2017AutumnPm1Underlined=(text:string)=>accepted.has(text);
/** Only exact source-owned spans become markup; problem text is never HTML. */
export function Legacy2017AutumnPm1Paragraph({text}:{text:string}){
 if(!accepted.has(text))throw Error('AUTUMN_PM1_UNDERLINE_SOURCE');
 const span=source.underlines.find(span=>text.includes(span));if(!span)throw Error('AUTUMN_PM1_UNDERLINE_SOURCE');const at=text.indexOf(span);
 return <p>{text.slice(0,at)}<u style={{textDecorationLine:'underline',textDecorationStyle:'solid',textDecorationSkipInk:'none',textUnderlineOffset:'0.12em'}}>{span}</u>{text.slice(at+span.length)}</p>;
}
