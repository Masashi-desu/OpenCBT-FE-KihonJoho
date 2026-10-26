import {autumnParameter} from './legacy-2017-autumn-pm1-4-preparation';
import {legacy2017AutumnPm13OriginalBanks as sourceBanks,legacy2017AutumnPm13OriginalDisplay as sourceDisplay} from './legacy-2017-autumn-pm13-source';
export type Autumn2017Pm13Log={minute:number;ip:string;url:string;hour:number;dayCode:number;key:string};
const urls=['http://○○○.com/index.html','http://www.△△△.co.jp/top.html','http://□□□.co.jp/index.html','http://◇◇◇.co.jp/index.html','http://○○○.com/news.html','http://□□□.co.jp/info.html'];
const days=['月','火','水','木','金','土','日'];
function dayText(date:Date,weekday:string){return date.getUTCFullYear()+'年'+(date.getUTCMonth()+1)+'月'+date.getUTCDate()+'日（'+weekday+'）';}
/** Reference0 preserves only published sparse cells; it does not invent/recover hidden source log rows. */
export function legacy2017AutumnPm13Model(values:number[]){const variant=autumnParameter(values,3),banks=structuredClone(sourceBanks);
 if(variant>0){banks.a[0]=['', 'IF(A2 = null, null, 切上げ(剰余(A2／60, 24), 0))','IF(A2 = null, null, 切上げ(剰余(A2, 1440)／60, 0))','IF(A2 = null, null, 四捨五入(剰余(A2／60, 24), 0))'][variant];banks.b[1]='=結合($B2, 水平照合(A$3, 曜日!$B$1:$H$2, 2, 0))';banks.b[4]='=結合(水平照合(A$3, 曜日!$B$1:$H$2, 2, 0), $B2)';banks.c[0]='照合検索(最大(Z3:Z10), Z3:Z10, A3:A10)';}
 if(variant===0)return{variant,banks,display:structuredClone(sourceDisplay),generatedLog:null as Autumn2017Pm13Log[]|null,matrix:null as number[][]|null,limits:'Only published sparse reference rows/visible cells/totals are asserted; hidden source logs are not reconstructed.'};
 const [year,month,date,count]=[[0,0,0,0],[2018,4,2,8120],[2019,4,1,9450],[2020,6,1,9998]][variant],start=new Date(Date.UTC(year,month-1,date)),end=new Date(start.getTime()+27*86400000),startMinute=start.getTime()/60000;
 const generatedLog:Autumn2017Pm13Log[]=Array.from({length:count},(_,i)=>{const day=(i*[0,3,5,9][variant])%28,hour=(i*7+Math.floor(i/28)*(variant+1))%24,minute=(i*13+variant*7)%60,time=startMinute+day*1440+hour*60+minute;return{minute:time,ip:'192.168.'+(10+10*(i%5))+'.'+(100+i%100),url:'',hour,dayCode:Math.floor(time/1440)%7,key:''};}).sort((a,b)=>a.minute-b.minute);
 const weights=variant===1?[0,0,1,2,1,3,4,5]:variant===2?[0,1,1,1,2,3,3,4,5]:[0,1,2,2,2,3,4,4,5],matrix=Array.from({length:7},()=>Array(24).fill(0)),urlCounts=new Map<string,number>();
 generatedLog.forEach((log,i)=>{log.url=urls[i<4?i:weights[(i+variant)%weights.length]];log.key=String(log.hour)+String(log.dayCode);matrix[(log.dayCode+3)%7][log.hour]++;urlCounts.set(log.url,(urlCounts.get(log.url)??0)+1);});
 const totals=matrix.map(row=>row.reduce((n,x)=>n+x,0)),hourTotals=Array.from({length:24},(_,h)=>matrix.reduce((n,row)=>n+row[h],0)),analysis={maxHour:String(hourTotals.indexOf(Math.max(...hourTotals))),minHour:String(hourTotals.indexOf(Math.min(...hourTotals))),maxDay:days[totals.indexOf(Math.max(...totals))],minDay:days[totals.indexOf(Math.min(...totals))]};
 const sparse=(log:Autumn2017Pm13Log,index:number)=>[String(index+2),String(log.minute),log.ip,log.url,String(log.hour),String(log.dayCode),log.key],logRows=[sparse(generatedLog[0],0),sparse(generatedLog[1],1),Array(7).fill('⋮'),sparse(generatedLog.at(-2)!,count-2),sparse(generatedLog.at(-1)!,count-1),[String(count+2),'','','','','','']],hours=sourceDisplay.visibleHours,
 aggregateRows=matrix.map((row,d)=>[days[d],...hours.map(h=>typeof h==='number'?String(row[h]):h),String(totals[d])]);aggregateRows.push(['計',...hours.map(h=>typeof h==='number'?String(hourTotals[h]):h),String(count)]);
 const display={period:{start:dayText(start,'月'),end:dayText(end,'日')},logRows,visibleHours:[...hours],aggregateRows,analysis,urlRows:[...urlCounts].slice(0,4).map(([url,n],i)=>[String(i+2),url,String(n)]).concat([['⋮','⋮','⋮']])};
 return{variant,banks,display,generatedLog,matrix,limits:'Generated conditions have complete deterministic synthetic logs. The presentation remains source-shaped sparse rows and omitted columns.'};
}
export const legacy2017AutumnPm13MacroLines=[
 '○マクロ: Page_count','○数値型: log_line, count_line','○文字列型: log_url, count_url','log_line ← 1','相対(ログ!A1, log_line, 2) ≠ null','count_line ← 1','log_url ← 相対(ログ!A1, log_line, 2)','count_url ← 相対(A1, count_line, 0)','［d］','count_line ← count_line + 1','count_url ← 相対(A1, count_line, 0)','［e］','相対(A1, count_line, 0) ← log_url','相対(A1, count_line, 1) ← 1','［f］','log_line ← log_line + 1'];
