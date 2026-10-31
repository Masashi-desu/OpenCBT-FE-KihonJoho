import {useId} from 'react';
import domains from '../core/generators/legacy-2017-development-figure-domains.json';
import {legacy2017DevelopmentCurvePaths as curves,legacy2017DevelopmentCurveDescriptions as curveDescriptions,legacy2017DevelopmentCoverageWires as wires} from '../core/generators/legacy-2017-development-models';

/** Managed annual diagrams only. All visible source inputs also have a full
 * description; the graph choices do not embed shuffled option labels. */
export function Legacy2017DevelopmentFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 const domain=domains[profile as keyof typeof domains];
 if(!domain)throw Error('FIGURE_PROFILE');
 if(values.length!==domain.length||values.some((n,i)=>!Number.isInteger(n)||n<domain[i][0]||n>domain[i][1]))throw Error('FIGURE_DOMAIN');
 const id=useId().replace(/:/g,''),arrow=`${id}-join-arrow`,coverage=profile==='legacy-2017-coverage-two-decisions';
 const width=coverage?800:440,height=coverage?590:360;
 const description=coverage?'上からX>1を判定し、真なら(X÷2)をXへ代入、偽なら代入を迂回して合流する。次にA=2 or B=0を判定し、真なら(X+1)をXへ代入、偽なら代入を迂回して下で合流する。両方の判定は全ての実行で到達する。':`縦軸は累積バグ件数、横軸はテスト項目消化件数。${curveDescriptions[values[1]]}。`;
 const label=(name:string,x:number,y:number,text:string)=><text key={name} data-flow-label={name} x={x} y={y} textAnchor="middle">{text}</text>;
 return <figure className={`managed-diagram source-figure profile-${profile}`} aria-label={coverage?undefined:description}><div className="diagram-scroll" tabIndex={0} aria-label={`${caption}。幅が足りない場合は左右にスクロールできます。`}><svg className="source-figure-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{coverage?caption:`${caption}。${curveDescriptions[values[1]]}。`}</title><desc id={`${id}-desc`}>{description}</desc>{coverage?<>
  <defs><marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor" strokeWidth="1.5"/></marker></defs>
  <g aria-hidden="true"><g data-flow-decision="first"><polygon points="360,80 480,130 360,180 240,130" fill="none"/>{label('first-condition',360,130,'X > 1')}</g><g data-flow-decision="second"><polygon points="360,320 510,370 360,420 210,370" fill="none"/>{label('second-condition',360,370,'A = 2 or B = 0')}</g>
   <g data-flow-assignment="first"><rect x="530" y="175" width="180" height="60" fill="none"/>{label('first-assignment',620,205,'(X ÷ 2) → X')}</g><g data-flow-assignment="second"><rect x="530" y="415" width="180" height="60" fill="none"/>{label('second-assignment',620,445,'(X + 1) → X')}</g>
   {wires.map(w=><path key={w.id} data-flow-wire={w.id} d={w.d} fill="none" {...(w.head?{markerEnd:`url(#${arrow})`}:{})}/>)}{label('first-true',505,110,'真')}{label('first-false',330,205,'偽')}{label('second-true',535,350,'真')}{label('second-false',330,445,'偽')}
  </g>
 </>:<g aria-hidden="true"><path data-chart-axis="y" d="M 95 25 L 95 280" fill="none"/><path data-chart-axis="x" d="M 95 280 L 390 280" fill="none"/><text data-chart-label="y" x="55" y="75" style={{writingMode:'vertical-rl'}}>累積バグ件数</text><text data-chart-label="x" x="245" y="325" textAnchor="middle">テスト項目消化件数</text><path data-bug-curve="true" d={curves[values[0]][values[1]]} fill="none"/></g>}</svg></div><figcaption>{caption}</figcaption></figure>;
}
