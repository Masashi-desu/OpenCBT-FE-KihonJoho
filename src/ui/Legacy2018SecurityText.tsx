import type {CSSProperties} from 'react';
import {legacy2018SecurityUnits as units,legacy2018SecurityFigureAllowed as allowed} from '../core/generators/legacy-2018-pm-security';
const box:CSSProperties={display:'inline-block',border:'1px solid var(--diagram-border)',minWidth:'3em',minHeight:'1.2em',verticalAlign:'middle',textAlign:'center'};
export function Legacy2018SecurityText({profile,values}:{profile:string;values:number[];caption?:string}){
 if(!allowed(profile,values))throw Error('UNKNOWN_SECURITY_TEXT');
 if(profile==='legacy-2018-security-mandatory-notice')return <p data-security-mandatory style={{border:'1px solid var(--diagram-border)',padding:'.45em .7em'}}>{units[0].text}</p>;
 if(profile!=='legacy-2018-security-attack-evidence')throw Error('UNKNOWN_SECURITY_TEXT');
 if(values[0]===1)return <p data-security-instruction>設問2 表1中の<span style={box} role="img" aria-label="空欄" data-security-unnamed-box/>に入れる対策として最も適切な答えを，解答群の中から選べ。</p>;
 const u=units.find(x=>x.id==='cause-and-range')!;if(u.id!=='cause-and-range')throw Error('SOURCE_UNIT');
 const [before,after]=u.text.split(u.underlinedClause.literal),[first,rest]=before.split('脆');
 return <p data-security-evidence>{first}<ruby>脆<rt>ぜい</rt></ruby>{rest}<u data-security-underlined="">{u.underlinedClause.literal}</u>{after}</p>;
}
