/** Private S2-02 preparation. Actual Java tests use an independent grouping reference. */
const inputs=[
 [3,2,1,1000,300,2000],[4,3,1,2000,300,1000],[5,2,1,1500,500,2500],[6,3,2,2400,400,1200],
 [5,4,2,2000,600,4000],[7,4,1,3000,800,1500],[8,5,3,4200,900,2100],[9,6,2,1000,700,3000],
] as const;
export type AutumnPm11Row=[string,string,string];
export type AutumnPm11Order={key:'lex'|'num';col:number;isReversed?:boolean};
export function legacy2017AutumnPm11Input(values:number[]){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=inputs.length)throw Error('PARAMETER_CONSTRAINT');return values[0];}
export function legacy2017AutumnPm11Sort(rows:AutumnPm11Row[],orders:AutumnPm11Order[],stripComma=false){
 const cmp=(a:string,b:string,key:string)=>{if(key==='lex')return a<b?-1:a>b?1:0;const s=(x:string)=>stripComma?x.replaceAll(',',''):x;if(!/^[+-]?\d+$/.test(s(a))||!/^[+-]?\d+$/.test(s(b)))throw Error('INTEGER_FORMAT');for(const n of[Number(s(a)),Number(s(b))])if(!Number.isSafeInteger(n)||n< -2147483648||n>2147483647)throw Error('INTEGER_FORMAT');return Number(s(a))-Number(s(b));};
 return rows.map((row,index)=>({row:[...row] as AutumnPm11Row,index})).sort((a,b)=>{for(const order of orders){if(!Number.isInteger(order.col)||order.col<0||order.col>2||!['lex','num'].includes(order.key))throw Error('ORDER_CONSTRAINT');const n=cmp(a.row[order.col],b.row[order.col],order.key);if(n!==0)return order.isReversed?-n:n;}return a.index-b.index;}).map(x=>x.row);
}
export function legacy2017AutumnPm11Model(values:number[]){const v=legacy2017AutumnPm11Input(values),[high,mid,low,a,b,c]=inputs[v],money=(n:number)=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
 const rows:AutumnPm11Row[]=[['apple',String(high),money(a)],['cherry',String(low),money(a)],['banana',String(low),money(b)],['banana',String(mid),money(c)],['apple',String(mid),money(b)]];
 const example=legacy2017AutumnPm11Sort(rows,[{key:'lex',col:0},{key:'num',col:1,isReversed:true}]),second=legacy2017AutumnPm11Sort(rows,[{key:'lex',col:2},{key:'lex',col:0}]),third=legacy2017AutumnPm11Sort(rows,[{key:'num',col:2},{key:'lex',col:0}],true),options=[rows[4],rows[0],rows[2],rows[3],rows[1]];
 if(new Set(options.map(r=>r.join(' '))).size!==5)throw Error('CHOICE_CONSTRAINT');
 return{v,rows,example,second,third,options,secondAnswer:options.findIndex(r=>r.join(' ')===second[0].join(' ')),thirdAnswer:options.findIndex(r=>r.join(' ')===third[2].join(' '))};
}
export const legacy2017AutumnPm11Banks=[
 ['Character, Comparator<String>','Character, String','String, Comparator<String>','String, String'],
 ['int i = 0; i < orderBys.length; i++','int i = 0; i < table.length; i++','OrderBy orderBy : orderBys','String[] row : table'],
 ['.get(col)','.get(orderBy.col)','[col]','[orderBy.col]'],
 ['!=','<','==','>'],
 ['-order','order','orderBy.isReversed ? -order : order','orderBy.isReversed ? order : -order'],
] as const;
export const legacy2017AutumnPm11Profiles=['legacy-2017-autumn-pm11-example','legacy-2017-autumn-pm11-output','legacy-2017-autumn-pm11-program1','legacy-2017-autumn-pm11-program2','legacy-2017-autumn-pm11-bank','legacy-2017-autumn-pm11-replacement'] as const;
export function legacy2017AutumnPm11Figure(profile:string,values:number[]){const m=legacy2017AutumnPm11Model([values[0]]),i=legacy2017AutumnPm11Profiles.indexOf(profile as typeof legacy2017AutumnPm11Profiles[number]);if(i<0)throw Error('SOURCE_FORMAT');const group=values[1];if(i===4&&(!Number.isInteger(group)||group<0||group>6||values.length!==2)||i===5&&(!Number.isInteger(group)||group<0||group>1||values.length!==2)||i!==4&&i!==5&&values.length!==1)throw Error('PARAMETER_CONSTRAINT');
 const bank=i===4?group<5?[...legacy2017AutumnPm11Banks[group]]:m.options.map(r=>r.join(' ')):undefined,caption=i===0?'図1 並べ替えの例':i===1?'図2 実行結果':i===2?'プログラム1':i===3?'プログラム2':i===4?group<5?`${'abcde'[group]}に関する解答群`:`設問${group-3} 解答群`:`設問${group+2}の置換内容`;
 return{model:m,bank,caption,alt:bank?`${caption}。${bank.map((s,j)=>`${'アイウエオ'[j]} ${s}`).join('。')}`:i===0?`${caption}。原5行から[0,4,3,2,1]の順へ5本の矢印。果物名辞書順、同名は第2列数値降順。`:i===1?`${caption}。${m.example.map(r=>r.join(' ')).join('／')}`:`${caption}。a/cは2枠ずつ、b/d/eは1枠ずつ。プログラム2の指定2行にαの矢印を保持。`};}
