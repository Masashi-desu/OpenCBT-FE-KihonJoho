/** Proposed booklet profiles. This file does not register any global hook. */
import{autumn2018Pm2Figure,autumn2018Pm2Profiles}from'./legacy-2018-autumn-pm2';
import{autumn2018Pm3Figure,autumn2018Pm3Profiles}from'./legacy-2018-autumn-pm3';
import{autumn2018Pm4Figure,autumn2018Pm4Profiles}from'./legacy-2018-autumn-pm4';
import{autumn2018Pm13Figure,autumn2018Pm13Profiles}from'./legacy-2018-autumn-pm13';
import{legacy2018SecurityProfiles,legacy2018SecurityFigureAllowed}from'./legacy-2018-pm-security';
import{autumn2018ExpressionFormalProfiles,autumn2018ExpressionFormalModel}from'./legacy-2018-autumn-expression-formal';
import{autumn2018ExistingBankProfiles,autumn2018ExistingBank}from'./legacy-2018-autumn-existing-bank';
import{autumn2018Tuple}from'./legacy-2018-autumn-pm-input';
export const autumn2018PriorityProfiles=[...legacy2018SecurityProfiles,...autumn2018Pm2Profiles,...autumn2018Pm3Profiles,...autumn2018Pm4Profiles,...autumn2018ExpressionFormalProfiles,...autumn2018Pm13Profiles,...autumn2018ExistingBankProfiles];
export function assertAutumn2018PriorityProfile(profile:string,values:number[]){
 if(autumn2018ExistingBankProfiles.includes(profile as never)){autumn2018ExistingBank(profile,values);return;}
 if(legacy2018SecurityProfiles.includes(profile as never)){autumn2018Tuple(values,[[0,1]]);if(!legacy2018SecurityFigureAllowed(profile,values))throw Error('PARAMETER_CONSTRAINT');return;}
 if(autumn2018Pm2Profiles.includes(profile as never)){autumn2018Pm2Figure(profile,values);return;}
 if(autumn2018Pm3Profiles.includes(profile as never)){autumn2018Pm3Figure(profile,values);return;}
 if(autumn2018Pm4Profiles.includes(profile as never)){autumn2018Pm4Figure(profile,values);return;}
 if(autumn2018Pm13Profiles.includes(profile as never)){autumn2018Pm13Figure(profile,values);return;}
 if(autumn2018ExpressionFormalProfiles.includes(profile)){autumn2018ExpressionFormalModel(profile,values);return;}throw Error('UNKNOWN_AUTUMN2018_PRIORITY_PROFILE');
}
