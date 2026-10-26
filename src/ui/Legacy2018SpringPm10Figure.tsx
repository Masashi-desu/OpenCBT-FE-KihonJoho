import {legacy2018SpringPm10Figure as inspect} from '../core/generators/legacy-2018-spring-pm10';
import {Legacy2018OrderPaymentFigure} from './Legacy2018OrderPaymentFigures';
import {Legacy2018SpringPmCode,Legacy2018SpringPmBank,Legacy2018SpringPmInline} from './Legacy2018SpringPmCode';
export function Legacy2018SpringPm10Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){const f=inspect(profile,values);if(f.caption!==caption)throw Error('SOURCE_FORMAT');return <div data-source-profile={profile}>
 {f.kind==='old_figure'?<Legacy2018OrderPaymentFigure profile={f.oldProfile} values={values} caption={caption}/>:f.kind==='program'?<Legacy2018SpringPmCode caption={caption} text={f.text} showCaption={false}/>:f.kind==='instruction'?<p><Legacy2018SpringPmInline text={f.text}/></p>:<div className="spring2018-scroll" tabIndex={0}><Legacy2018SpringPmBank caption={caption} text={f.text} columns={2}/></div>}
 </div>;}
