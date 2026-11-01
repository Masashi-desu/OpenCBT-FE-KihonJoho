import {useId,type CSSProperties} from 'react';
import {legacy2016SpringAm3356FlowAllowed,legacy2016SpringAm3356FlowAlt} from '../core/generators/legacy-2016-spring-am-33-56';

/** Original two independent decisions, branch orientation and merges. Labels
 * bind to the same input as the body; this is not an answer illustration. */
export function Legacy2016SpringAm3356FlowFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(!legacy2016SpringAm3356FlowAllowed(profile,values))throw Error('PARAMETER_CONSTRAINT');
 const id=useId().replace(/:/g,''),[a,b,x1,x2,y1,y2]=values;
 return <figure className={'managed-diagram source-figure profile-'+profile}>
  <div className="diagram-scroll" tabIndex={0} aria-label="問題の流れ図。幅が足りない場合は左右にスクロールできます。">
   <svg className="legacy2016-figure" style={{'--source-figure-width':'650px'} as CSSProperties} viewBox="0 0 650 650" role="img" aria-labelledby={id+'-title'} aria-describedby={id+'-desc'}>
    <title id={id+'-title'}>{caption}</title><desc id={id+'-desc'}>{legacy2016SpringAm3356FlowAlt(values)}</desc>
    <defs><marker id={id+'-arrow'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor" strokeWidth="1.5"/></marker></defs>
    <g aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
     <path data-edge="entry" d="M 230 20 V 60"/>
     <path data-decision="a" d="M 230 60 L 350 110 L 230 160 L 110 110 Z"/>
     <path data-edge="a-yes" d="M 230 160 V 195"/><path data-edge="a-no" d="M 350 110 H 500 V 195"/>
     <rect data-statement="x-yes" x="110" y="195" width="240" height="60"/><rect data-statement="x-no" x="380" y="195" width="240" height="60"/>
     <path data-edge="x-yes-merge" d="M 230 255 V 345"/><path data-edge="x-no-merge" d="M 500 255 V 305 H 230" markerEnd={'url(#'+id+'-arrow)'}/>
     <path data-decision="b" d="M 230 345 L 350 395 L 230 445 L 110 395 Z"/>
     <path data-edge="b-yes" d="M 230 445 V 480"/><path data-edge="b-no" d="M 350 395 H 500 V 480"/>
     <rect data-statement="y-yes" x="110" y="480" width="240" height="60"/><rect data-statement="y-no" x="380" y="480" width="240" height="60"/>
     <path data-edge="y-yes-exit" d="M 230 540 V 630"/><path data-edge="y-no-merge" d="M 500 540 V 590 H 230" markerEnd={'url(#'+id+'-arrow)'}/>
    </g>
    <g aria-hidden="true" fill="currentColor" stroke="none" textAnchor="middle" fontSize="25">
     <text data-condition="a" x="230" y="119">a＝{a}</text><text data-condition="b" x="230" y="404">b＝{b}</text>
     <text x="270" y="183">Yes</text><text x="387" y="99">No</text><text x="270" y="468">Yes</text><text x="387" y="384">No</text>
     <text data-assignment="x-yes" x="230" y="234">x＝{x1}</text><text data-assignment="x-no" x="500" y="234">x＝{x2}</text>
     <text data-assignment="y-yes" x="230" y="519">y＝{y1}</text><text data-assignment="y-no" x="500" y="519">y＝{y2}</text>
    </g>
   </svg>
  </div><figcaption>{caption}</figcaption>
 </figure>;
}
