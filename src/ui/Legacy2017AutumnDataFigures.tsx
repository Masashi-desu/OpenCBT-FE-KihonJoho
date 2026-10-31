import {useId} from 'react';
import {legacy2017AutumnDataFigureAlt as alt,legacy2017AutumnDataProfiles as profiles,validateLegacy2017AutumnDataFigure as validate} from '../core/generators/legacy-2017-autumn-data-figures';
/** Managed annual drawings. No HTML or code is interpreted from question data. */
export function Legacy2017AutumnDataFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 validate(profile,values);const[v,part]=values,id=useId().replace(/:/g,'');
 const text=(key:string,x:number,y:number,s:string)=><text key={key} data-label={key} x={x} y={y} textAnchor="middle">{s}</text>;
 let width=900,height=300,content;
 if(profile===profiles.logic&&part===0){
  const wires=[['A-not','80,85 250,85'],['B-not','80,205 250,205'],['notA-middle','311,85 355,85 355,125 397,125'],['notB-middle','311,205 355,205 355,165 397,165'],['A-top','130,85 130,40 570,40'],['B-bottom','130,205 130,250 570,250'],['middle-top','465,145 515,145 515,80 570,80'],['middle-bottom','515,145 515,210 570,210'],['top-final','650,60 695,60 695,125 747,125'],['bottom-final','650,230 695,230 695,165 747,165'],['final-X',`${v===0?815:831},145 860,145`]];
  content=<>{wires.map(([name,points])=><polyline key={name} data-wire={name} points={points} fill="none"/>)}
   <polygon data-gate="notA" points="250,60 250,110 295,85" fill="none"/><circle data-inversion="notA" cx="303" cy="85" r="8" fill="none"/>
   <polygon data-gate="notB" points="250,180 250,230 295,205" fill="none"/><circle data-inversion="notB" cx="303" cy="205" r="8" fill="none"/>
   <path data-gate="middle" d="M 390 115 Q 410 145 390 175 Q 445 175 465 145 Q 445 115 390 115 Z" fill="none"/>
   <path data-gate="top" d="M 570 20 L 610 20 Q 650 20 650 60 Q 650 100 610 100 L 570 100 Z" fill="none"/>
   <path data-gate="bottom" d="M 570 190 L 610 190 Q 650 190 650 230 Q 650 270 610 270 L 570 270 Z" fill="none"/>
   <path data-gate="final" d="M 740 115 Q 760 145 740 175 Q 795 175 815 145 Q 795 115 740 115 Z" fill="none"/>
   {v===1&&<circle data-inversion="final" cx="823" cy="145" r="8" fill="none"/>}
   {[[130,85],[130,205],[515,145]].map(([cx,cy],i)=><circle className="junction" key={i} data-junction={i} cx={cx} cy={cy} r="4"/>)}
   {text('A',50,85,'A')}{text('B',50,205,'B')}{text('X',880,145,'X')}
  </>;
 }else if(profile===profiles.logic){
  width=400;height=110;
  const tokens=part===4?['X','=','(','A','+','B',')','・','(','A','+','B',')']:['X','=','A','・','B','+','A','・','B'];
  const xs=part===4?[20,55,95,115,145,175,195,215,235,255,285,315,335]:[20,55,95,120,140,175,210,235,255];
  const bars=part===1?[[199,266]]:part===2?[[199,221],[244,266]]:part===3?[[129,151],[199,221]]:v===0?[[104,126],[304,326]]:[[244,266],[304,326]];
  content=<>{tokens.map((s,i)=>text(`symbol-${i}`,xs[i],58,s))}{bars.map(([x1,x2],i)=><line key={i} data-negation-bar={i} x1={x1} x2={x2} y1="34" y2="34"/>)}</>;
 }else{
  width=720;height=390;const employee=v===2?'0..*':'1..*',manager=v===1?'1':'0..1';
  content=<>{[['部門',180,50],['社員',520,50],['事業部',180,280]].map(([name,x,y])=><g key={name} data-uml-class={name}><rect x={x} y={y} width="150" height="65" fill="none"/>{text(`class-${name}`,Number(x)+75,Number(y)+32.5,String(name))}</g>)}
   <line data-uml-edge="membership" x1="330" y1="82.5" x2="520" y2="82.5"/>
   <polyline data-uml-edge="management" points="330,100 435,100 435,312.5 330,312.5" fill="none"/>
   <line data-uml-edge="generalization" x1="255" y1="140" x2="255" y2="280"/>
   <polygon data-uml-generalization="部門" points="255,115 244,140 266,140" fill="none"/>
   <polygon data-uml-reading="membership" points="377,30 365,38 377,46" style={{fill:'currentColor'}}/>
   <polygon data-uml-reading="management" points="477,180 469,194 485,194" style={{fill:'currentColor'}}/>
   {text('membership-name',435,38,'所属する')}{text('management-name',495,225,'管理する')}
   {text('membership-department',350,65,'1')}{text('membership-employee',490,65,employee)}
   {text('management-department',365,130,'1..*')}{text('management-division',365,340,manager)}
  </>;
 }
 // Formula choices retain their 400px source canvas rather than expanding to
 // the full circuit width. Keep the caption in the same bounded figure.
 const formulaChoice=profile===profiles.logic&&part>0;
 return <figure className={`managed-diagram source-figure profile-${profile}`} style={formulaChoice?{maxWidth:'calc(400px * var(--image-scale, 1))'}:undefined}>
  <div className="diagram-scroll" tabIndex={0} aria-label={`${caption}。幅が足りない場合は左右にスクロールできます。`}>
   <svg className="source-figure-svg" style={{minWidth:`calc(${width}px * var(--image-scale, 1))`,...(formulaChoice?{width:'calc(400px * var(--image-scale, 1))'}:{})}} viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}>
    <title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{alt(profile,values)}</desc><g aria-hidden="true">{content}</g>
   </svg>
  </div><figcaption>{caption}</figcaption>
 </figure>;
}
