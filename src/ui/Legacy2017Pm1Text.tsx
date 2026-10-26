import React from'react';
import{legacy2017Pm1UnderlinedSourceText,legacy2017Pm1UnderlineText}from'../core/generators/legacy-2017-pm1-source';
export{legacy2017Pm1UnderlinedSourceText};
/** Managed source annotation only; no string markup parsing. */
export function Legacy2017Pm1UnderlinedParagraph({text}:{text:string}){
 if(text!==legacy2017Pm1UnderlinedSourceText||text.length!==185)throw Error('PM1_UNDERLINE_SOURCE');const pieces=text.split(legacy2017Pm1UnderlineText);if(pieces.length!==2)throw Error('PM1_UNDERLINE_SCOPE');
 return <p data-pm1-source-paragraph="proposal">{pieces[0]}<u data-pm1-underline="1" style={{textDecorationLine:'underline',textDecorationStyle:'solid',textDecorationSkipInk:'none',textUnderlineOffset:'0.12em'}}>{legacy2017Pm1UnderlineText}</u>{pieces[1]}</p>;
}
