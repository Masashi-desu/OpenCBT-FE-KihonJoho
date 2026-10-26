import {Legacy2018HealthFigure} from './Legacy2018HealthFigures';
export {Legacy2018SpringPmNativeText,Legacy2018SpringPm6ForecastTable} from './Legacy2018SpringPm5To8Native';
export function Legacy2018SpringPm5Figure({profile,values,caption}:{profile:string;values:number[];caption:string}){return <div className="legacy-2018-spring-source-figure" data-caption-position={'bottom'}><Legacy2018HealthFigure profile={profile} values={values} caption={caption}/></div>;}
