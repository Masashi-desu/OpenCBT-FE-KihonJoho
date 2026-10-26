import {useId} from "react";
import {legacy2018LogicConfiguration,legacy2018LogicFigureAlt} from "../core/generators/legacy-2018-pm-logic";
import domains from "../core/generators/legacy-2018-logic-figure-domains.json";
/** Annual managed renderer, awaiting exact profile/domain hooks. */
export function Legacy2018LogicFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
  const bounds=domains[profile as keyof typeof domains];if(!bounds||values.length!==bounds.length||values.some((n,i)=>!Number.isInteger(n)||n<bounds[i][0]||n>bounds[i][1]))throw Error("PARAMETER_CONSTRAINT");
  const id=useId().replace(/:/g,""),composition=profile==="legacy-2018-gate-composition",c=composition?legacy2018LogicConfiguration(values[0]):undefined;
  const alt=legacy2018LogicFigureAlt(profile,values),width=composition?980:680;
  return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="論理回路の図。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox={`0 0 ${width} 410`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{alt}</desc><g aria-hidden="true">
    <text x="85" y="80" textAnchor="end">{composition?"入力":"X"}</text><text x="85" y="320" textAnchor="end">{composition?"入力":"Y"}</text>
    <path data-wire="x-both" d="M 105 80 H 230 M 160 80 V 280 H 230" fill="none"/>
    <path data-wire="y-both" d="M 105 320 H 230 M 130 320 V 120 H 150 Q 160 100 170 120 H 230" fill="none"/>
    <circle data-junction="x" className="junction" cx="160" cy="80" r="4"/><circle data-junction="y" className="junction" cx="130" cy="320" r="4"/>
    <rect x="230" y="55" width="210" height="90" fill="var(--surface)"/><text data-gate="upper" x="335" y="100" textAnchor="middle">{c?.known??"b"}</text>
    {!composition&&<rect x="270" y="75" width="130" height="50" fill="none"/>}
    <rect x="230" y="255" width="210" height="90" fill="var(--surface)"/><rect x="270" y="275" width="130" height="50" fill="none"/><text data-gate="lower" x="335" y="300" textAnchor="middle">{composition?"a":"c"}</text>
    {composition?<>
      <path data-wire="upper-final" d="M 440 100 H 530 V 180 H 620" fill="none"/><path data-wire="lower-final" d="M 440 300 H 530 V 220 H 620" fill="none"/>
      <rect x="620" y="155" width="200" height="90" fill="var(--surface)"/><text data-gate="final" x="720" y="200" textAnchor="middle">{c!.final}</text><line data-wire="output" x1="820" y1="200" x2="880" y2="200"/><text x="900" y="200">出力</text>
    </>:<><line data-wire="sum" x1="440" y1="100" x2="535" y2="100"/><text data-output="sum" x="560" y="100">Z</text><line data-wire="carry" x1="440" y1="300" x2="535" y2="300"/><text data-output="carry" x="560" y="300">C</text></>}
  </g></svg></div><figcaption>{caption}</figcaption></figure>;
}
