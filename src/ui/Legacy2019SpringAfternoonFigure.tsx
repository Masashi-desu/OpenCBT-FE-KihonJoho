/** Source-local router. Shared admission/caption validation stays with the
 * common LegacyAfternoonFigure route owned by the root integration. */
import{Legacy2019SpringExistingBank}from'./Legacy2019SpringExistingBank';
import{Legacy2019SpringPm9Figure}from'./Legacy2019SpringPm9Figure';
import{Legacy2019SpringPm11Figure}from'./Legacy2019SpringPm11Figure';
import{Legacy2019SpringPm12Figure}from'./Legacy2019SpringPm12Figure';
import{Legacy2019SpringPm13Figure}from'./Legacy2019SpringPm13Figure';
import{Legacy2019SpringAuthNetworkFigure}from'./Legacy2019SpringAuthNetworkFigure';
import{Legacy2019SpringIntegrationFigure}from'./Legacy2019SpringIntegrationFigure';
import{Legacy2019PmAuthFigure}from'./Legacy2019PmAuthFigures';
import{Legacy2019SpringNetworkMemoryFigure}from'./Legacy2019SpringNetworkMemoryFigure';
import{Legacy2019SpringInspectionFigure}from'./Legacy2019SpringInspectionFigure';
import{Legacy2019PmChangeFigure}from'./Legacy2019PmChangeFigures';
import{Legacy2019PmIntegrationFigure}from'./Legacy2019PmIntegrationFigures';
import{Legacy2019SpringPm8Figure}from'./Legacy2019SpringPm8Figure';
import{Legacy2019SpringRankingChangeFigure}from'./Legacy2019SpringRankingChangeFigure';
import{Legacy2019RankingFigure}from'./Legacy2019RankingFigures';
export function Legacy2019SpringAfternoonFigure(props:{profile:string;values:number[];caption:string}){const{profile}=props,m=/^legacy-2019-spring-pm(\d+)-/.exec(profile);
 if(m){const n=Number(m[1]);if(n===9)return<Legacy2019SpringPm9Figure {...props}/>;if(n===11)return<Legacy2019SpringPm11Figure {...props}/>;if(n===12)return<Legacy2019SpringPm12Figure {...props}/>;if(n===13)return<Legacy2019SpringPm13Figure {...props}/>;if(profile.endsWith('-bank'))return<Legacy2019SpringExistingBank {...props}/>;if(n===1)return<Legacy2019SpringAuthNetworkFigure {...props}/>;if(n===7)return<Legacy2019SpringIntegrationFigure {...props}/>;if(n===10)return<Legacy2019SpringRankingChangeFigure {...props}/>;if(n===2)return<Legacy2019SpringNetworkMemoryFigure {...props}/>;if(n===5)return<Legacy2019SpringInspectionFigure {...props}/>;if(n===8)return<Legacy2019SpringPm8Figure {...props}/>;}
 if(profile.startsWith('legacy-2019-auth-'))return<Legacy2019PmAuthFigure {...props}/>;
 if(profile==='legacy-2019-page-mapping'||profile==='legacy-2019-load-balance-network')return<Legacy2019SpringNetworkMemoryFigure {...props}/>;
 if(profile.startsWith('legacy-2019-inspection-'))return<Legacy2019SpringInspectionFigure {...props}/>;
 if(profile==='legacy-2019-change-timeline')return<Legacy2019PmChangeFigure {...props}/>;
 if(profile==='legacy-2019-manufacturing-turnover')return<Legacy2019PmIntegrationFigure {...props}/>;
 if(profile.startsWith('legacy-2019-huffman-'))return<Legacy2019SpringPm8Figure {...props}/>;
 if(profile.startsWith('legacy-2019-ranking-'))return<Legacy2019RankingFigure {...props}/>;
 throw Error('UNKNOWN_SPRING2019_PM_FIGURE');
}
