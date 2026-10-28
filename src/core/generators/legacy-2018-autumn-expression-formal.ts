/** Only formal-booklet diagram aliases. Existing private six profiles and their
 * default renderer HTML are never redefined or mutated. */
import{autumn2018Tuple}from'./legacy-2018-autumn-pm-input';import{legacy2018ExpressionFigureAlt}from'./legacy-2018-pm-expression';
export const autumn2018ExpressionFormalProfiles=['main','parse','calculate','parsed','first-step','signed'].map(k=>'legacy-2018-autumn-pm8-expression-'+k);
export const autumn2018ExpressionHatchNote='注記 網掛け部分（値が格納されているとは限らない）は表示していない。';
export function autumn2018ExpressionFormalModel(profile:string,input:number[]){if(!autumn2018ExpressionFormalProfiles.includes(profile))throw Error('UNKNOWN_FORMAL_EXPRESSION_FIGURE');const values=autumn2018Tuple(input,[[0,3],[0,3],[0,3],[0,1]]),kind=profile.slice('legacy-2018-autumn-pm8-expression-'.length),oldProfile='legacy-2018-expression-'+kind,program=['main','parse','calculate'].includes(kind),title=kind==='main'?'〔プログラム〕':kind==='parse'?'〔プログラム（解析処理の部分）〕':kind==='calculate'?'〔プログラム（計算処理の部分）〕':undefined;return{values,kind,oldProfile,program,title,alt:legacy2018ExpressionFigureAlt(oldProfile,values)};}
