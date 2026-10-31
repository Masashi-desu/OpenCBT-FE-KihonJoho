import {useId} from 'react';
/** The source uses physical black/white reflectance. A dedicated local stylesheet
 * fixes only the model's physical colors; captions/table/pan retain sharedtokens. */
export function Legacy2017AutumnFoundationsFigure({profile,values,caption}:{profile:string;values:number[];caption:string}){
 if(profile!=='legacy-2017-line-following-car')throw Error('FIGURE_PROFILE');
 if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>1)throw Error('FIGURE_DOMAIN');
 const id=useId().replace(/:/g,''),rows=[['上げる','下げる','上げる','下げる'],['上げる','下げる','下げる','上げる'],['下げる','上げる','上げる','下げる'],['下げる','上げる','下げる','上げる']];
 const description='黒色の円の全体図と、その右側を上向きに走る車の拡大図。車の前方にセンサLが左、センサRが右にあり、中央の前輪、制御部、左右の後輪とそれぞれのモータL・Rが示される。二つのセンサの間から車体の下へ黒色の帯が続き、進行方向の矢印は上向き。'+(values[0]===0?'黒色に掛かる比率が大きいほど出力値は小さい。':'黒色に掛かる比率が大きいほど出力値は大きい。')+'解答群の表は、センサL出力値＞センサR出力値のときと、センサL出力値＜センサR出力値のときについて、モータL・モータRの回転速度を示す。アは上げる・下げる・上げる・下げる。イは上げる・下げる・下げる・上げる。ウは下げる・上げる・上げる・下げる。エは下げる・上げる・下げる・上げる。出力値が一致するときには両モータを初期値に戻す。';
 const labels=[{x:560,y:135,t:'センサL',anchor:'end'},{x:750,y:135,t:'センサR'},{x:770,y:75,t:'進行方向'},{x:750,y:190,t:'前輪'},{x:643,y:260,t:'制御部',anchor:'middle'},{x:790,y:305,t:'後輪'},{x:520,y:405,t:'モータL'},{x:725,y:405,t:'モータR'},{x:510,y:480,t:'円'}];
 const leaderPaths=['M 563 135 L 590 135','M 745 135 L 700 135','M 745 190 L 675 190','M 785 305 L 715 340','M 785 305 L 575 340','M 580 395 L 598 375','M 733 395 L 686 375'];
 return <figure className={`managed-diagram source-figure profile-${profile}`}><div className="diagram-scroll" tabIndex={0} aria-label="車と制御方法の表。幅が足りない場合は左右にスクロールできます。"><svg className="source-figure-svg" viewBox="0 0 900 1000" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-desc`}><title id={`${id}-title`}>{caption}</title><desc id={`${id}-desc`}>{description}</desc><defs><marker id={`${id}-head`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="var(--visual-line-track)" strokeWidth="1.5"/></marker></defs>
  <g className="physical-model" aria-hidden="true"><rect data-physical-surface="whole" x="20" y="20" width="860" height="540"/>
   <circle data-track-circle="whole" cx="190" cy="290" r="130" fill="none" style={{strokeWidth:7}}/><rect data-mini-car="outline" x="300" y="270" width="40" height="45" fill="none"/><rect data-mini-car="vehicle" x="315" y="282" width="10" height="22" fill="none"/>
   <path data-enlargement="connector" d="M 340 270 L 430 230 M 340 315 L 430 350" fill="none"/><rect data-enlargement="frame" x="430" y="50" width="430" height="480" fill="none"/>
   <path data-black-band="enlarged-circle" d="M 595 50 C 640 190 640 390 595 530 L 665 530 C 710 390 710 190 665 50 Z"/>
   <rect data-car-body="body" x="590" y="150" width="110" height="205" fill="none"/><polygon data-sensor="L" points="590,150 602,124 614,150"/><polygon data-sensor="R" points="676,150 688,124 700,150"/>
   <circle data-wheel="front" cx="645" cy="195" r="26" fill="none"/>{[637,645,653].map(x=><line key={x} data-wheel-tread="front" x1={x} y1="178" x2={x} y2="212"/>)}
   <rect data-control="controller" x="608" y="236" width="74" height="48" fill="none"/><rect data-wheel="L" x="562" y="326" width="30" height="54" fill="none"/><rect data-wheel="R" x="698" y="326" width="30" height="54" fill="none"/>
   <rect data-motor="L" x="596" y="335" width="35" height="35" fill="none"/><rect data-motor="R" x="659" y="335" width="35" height="35" fill="none"/><line data-axle="L" x1="592" y1="352" x2="596" y2="352"/><line data-axle="R" x1="694" y1="352" x2="698" y2="352"/>
   {[570,577,584,706,713,720].map(x=><line key={x} data-wheel-tread="rear" x1={x} y1="333" x2={x} y2="373"/>)}
   <path data-forward="up" d="M 730 100 L 730 55" fill="none" markerEnd={`url(#${id}-head)`}/>{leaderPaths.map((d,i)=><path key={i} data-label-leader={i+1} d={d} fill="none" markerEnd={`url(#${id}-head)`}/>)}
   {labels.map((w,i)=><text key={i} data-model-label={i+1} x={w.x} y={w.y} textAnchor={w.anchor==='end'?'end':w.anchor==='middle'?'middle':'start'} style={{fontSize:22}}>{w.t}</text>)}
  </g>
  <g data-motor-table="all" aria-hidden="true"><rect x="90" y="610" width="780" height="115" fill="none"/><line x1="480" y1="610" x2="480" y2="965"/><line x1="90" y1="675" x2="870" y2="675"/><line x1="285" y1="675" x2="285" y2="965"/><line x1="675" y1="675" x2="675" y2="965"/>
   {['＞','＜'].map((sign,i)=><g key={sign} data-comparison-header={sign}><text x={285+390*i} y="634" textAnchor="middle" style={{fontSize:22}}>センサL出力値{sign}センサR出力値</text><text x={285+390*i} y="659" textAnchor="middle" style={{fontSize:22}}>のとき</text></g>)}
   {['L','R','L','R'].map((motor,i)=><g key={i} data-motor-header={i}><text x={187.5+195*i} y="691" textAnchor="middle" style={{fontSize:22}}>モータ{motor}</text><text x={187.5+195*i} y="715" textAnchor="middle" style={{fontSize:22}}>回転速度</text></g>)}
   <rect x="40" y="725" width="830" height="240" fill="none"/><line x1="90" y1="725" x2="90" y2="965"/>{rows.map((row,i)=><g key={i} data-motor-row={'アイウエ'[i]}>{i>0&&<line x1="40" y1={725+60*i} x2="870" y2={725+60*i}/>}<text data-row-label={i} x="65" y={755+60*i} textAnchor="middle" style={{fontSize:24}}>{'アイウエ'[i]}</text>{row.map((value,col)=><text key={col} data-table-cell={`${i},${col}`} x={187.5+195*col} y={755+60*i} textAnchor="middle" style={{fontSize:24}}>{value}</text>)}</g>)}</g>
 </svg></div><figcaption>{caption}</figcaption></figure>;
}
