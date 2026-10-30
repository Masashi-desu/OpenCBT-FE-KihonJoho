import React from'react';
import{Legacy2019AutumnPm1Figure}from'./Legacy2019AutumnPm1Figures';import{Legacy2019AutumnPm2Pm3Figure}from'./Legacy2019AutumnPm2Pm3Figures';import{Legacy2019AutumnPm4Figure}from'./Legacy2019AutumnPm4Figures';import{Legacy2019AutumnPm8Figure}from'./Legacy2019AutumnPm8Figures';import{Legacy2019AutumnStressFigure}from'./Legacy2019AutumnStressFigure';import{Legacy2019AutumnProgressFigure}from'./Legacy2019AutumnProgressFigure';import{Legacy2019AutumnPackedFigure}from'./Legacy2019AutumnPackedFigure';import{Legacy2019AutumnMelonFigure}from'./Legacy2019AutumnMelonFigure';
/** Source-owned renderer; the native caller validates exact registered tuples. */
export function Legacy2019AutumnPmSourceFigure(p:{profile:string;values:number[];caption:string;alt:string}){
 const{profile}=p;
 if(profile.startsWith('legacy-2019-autumn-pm1-'))return <Legacy2019AutumnPm1Figure {...p}/>;
 if(profile.startsWith('legacy-2019-autumn-pm2-')||profile==='legacy-2019-autumn-pm3-library-schema')return <Legacy2019AutumnPm2Pm3Figure {...p}/>;
 if(profile.startsWith('legacy-2019-autumn-pm4-'))return <Legacy2019AutumnPm4Figure {...p}/>;
 if(profile.startsWith('legacy-2019-autumn-pm5-'))return <Legacy2019AutumnStressFigure {...p}/>;
 if(profile==='legacy-2019-autumn-pm6-test-progress')return <Legacy2019AutumnProgressFigure {...p}/>;
 if(profile.startsWith('legacy-2019-autumn-pm8-'))return <Legacy2019AutumnPm8Figure {...p}/>;
 if(profile.startsWith('legacy-2019-autumn-pm12-'))return <Legacy2019AutumnPackedFigure {...p}/>;
 if(profile==='legacy-2019-autumn-pm13-melon-packing')return <Legacy2019AutumnMelonFigure {...p}/>;
 throw Error('UNKNOWN_AUTUMN_SOURCE_PROFILE');
}
