/** S2-02 private preparation; no registry/App admission. */
export const legacy2017AutumnPm10Rates = [[300,100],[400,100],[500,200],[300,200],[400,200],[500,100]] as const;
export function legacy2017AutumnPm10Input(values:number[]) {if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=6)throw Error('PARAMETER_CONSTRAINT');return values[0];}
export function legacy2017AutumnPm10Model(values:number[]) {const v=legacy2017AutumnPm10Input(values),[day,night]=legacy2017AutumnPm10Rates[v],tariffs=Array.from({length:24},(_,h)=>h<6||h>=20?night:day);return{v,day,night,tariffs,packed:tariffs.map(n=>String(n).padStart(3,'0')).join('')};}
export type AutumnPm10Timestamp={year:number;month:number;day:number;hour:number;minute:number};
/** Original subtraction/borrow-free hour calculation, then source hour-index loop. */
export function legacy2017AutumnPm10Calculate(input:AutumnPm10Timestamp,output:AutumnPm10Timestamp,values:number[]) {
  const m=legacy2017AutumnPm10Model(values),time=(t:AutumnPm10Timestamp)=>Date.UTC(t.year,t.month-1,t.day,t.hour,t.minute);
  for(const t of[input,output]){if(!Object.values(t).every(Number.isInteger)||t.year<1601||t.year>9999||t.hour<0||t.hour>23||t.minute<0||t.minute>59)throw Error('DATE_INPUT');const d=new Date(time(t));if(d.getUTCFullYear()!==t.year||d.getUTCMonth()+1!==t.month||d.getUTCDate()!==t.day)throw Error('DATE_INPUT');}
  if(time(output)<time(input))throw Error('DATE_ORDER');
  const dayNumber=(t:AutumnPm10Timestamp)=>Date.UTC(t.year,t.month-1,t.day)/86400000;
  let units=(dayNumber(output)*24+output.hour)-(dayNumber(input)*24+input.hour);if(input.minute<output.minute)units++;
  const full=units*m.day;if(units>9999||full>999999)throw Error('FEE_CAPACITY');
  let index=input.hour,discounted=0;const chargedHours:number[]=[];
  for(let cnt=1;cnt<=units;cnt++){chargedHours.push(index);discounted+=m.tariffs[index];index++;if(index>23)index=0;}
  if(discounted>999999)throw Error('FEE_CAPACITY');
  return{units,full,discounted,chargedHours};
}
export const legacy2017AutumnPm10Banks=[
 ['順呼出し（ACCESS MODE IS SEQUENTIAL）','動的呼出し（ACCESS MODE IS DYNAMIC）','乱呼出し（ACCESS MODE IS RANDOM）'],
 ['ADD PRM-FEE TO ACCT-FEE','MOVE ACCT-FEE TO PRM-FEE','MOVE PRM-FEE TO ACCT-FEE','MOVE PRM-NO TO ACCT-NO'],
 ['*','+','-','/'],
 ['ADD 1 TO W-HRS','ADD ACCT-O-HH TO W-HRS','SUBTRACT 1 FROM W-HRS','SUBTRACT ACCT-I-HH FROM W-HRS'],
 ['COMPUTE W-IDX = ACCT-I-HH + 1','COMPUTE W-IDX = ACCT-I-HH - 1','MOVE 1 TO W-IDX','MOVE ACCT-I-HH TO W-IDX'],
 ['W-CNT = W-HRS','W-CNT > W-HRS','W-HRS = W-IDX','W-IDX = 24','W-IDX = W-CNT','W-IDX > 24'],
] as const;
export const legacy2017AutumnPm10Profiles=['legacy-2017-autumn-pm10-record','legacy-2017-autumn-pm10-program1','legacy-2017-autumn-pm10-program2','legacy-2017-autumn-pm10-changes','legacy-2017-autumn-pm10-bank'] as const;
export function legacy2017AutumnPm10Figure(profile:string,values:number[]){
 const m=legacy2017AutumnPm10Model([values[0]]),i=legacy2017AutumnPm10Profiles.indexOf(profile as typeof legacy2017AutumnPm10Profiles[number]);if(i<0)throw Error('SOURCE_FORMAT');
 const group=values[1];if(i===0&&(!Number.isInteger(group)||group<0||group>2||values.length!==2)||i===4&&(!Number.isInteger(group)||group<0||group>5||values.length!==2)||i!==0&&i!==4&&values.length!==1)throw Error('PARAMETER_CONSTRAINT');
 const caption=i===0?['図1 精算ファイルのレコード様式','図2 プログラム1のパラメタの様式','図3 プログラム2のパラメタの様式'][group]:i===1?'プログラム1':i===2?'プログラム2':i===3?'表1 プログラム2の変更内容':['解答群','aに関する解答群','bに関する解答群','cに関する解答群','dに関する解答群','e、fに関する解答群'][group];
 const bank=i===4?[...legacy2017AutumnPm10Banks[group]]:undefined;
 return{model:m,caption,bank,alt:bank?`${caption}。${bank.map((s,j)=>`${'アイウエオカ'[j]} ${s}`).join('。')}`:i===3?`${caption}。課金単価は0〜5時/20〜23時${m.night}円、6〜19時${m.day}円。72桁の24要素表、空欄d/e/fと標識領域の注記を保持。`:`${caption}。原の欄名・桁数、21行と43行のプログラム、空欄a/b/cを保持。`};
}
