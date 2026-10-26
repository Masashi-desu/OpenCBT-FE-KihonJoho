import {Legacy2018Figure} from './Legacy2018Figures';
export {Legacy2018SpringPmNativeText,Legacy2018SpringPm6ForecastTable} from './Legacy2018SpringPm5To8Native';
export function Legacy2018SpringPm7Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){return <div className="legacy-2018-spring-source-figure" data-caption-position={profile==='legacy-2018-profit-table'? 'top':'bottom'}><Legacy2018Figure profile={profile} values={values} caption={caption}/></div>;}
