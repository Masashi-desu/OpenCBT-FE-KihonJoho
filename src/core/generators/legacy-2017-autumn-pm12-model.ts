/** Numeric/bit-only domain. No character-code mapping or character constants. */
const inputs=[
 [0xFFF3,0x7FFF,'11011','11110'],[0xFFFF,0xBFFF,'11011','01101'],
 [0xFFFE,0x7FFF,'110011','111001'],[0xFFFF,0x3FFF,'110011','101110'],
 [0xFFFE,0xFFFF,'10111','01110'],[0xFFFF,0x7FFF,'10111','11100'],
 [0xFFFD,0x7FFF,'101011','011110'],[0xFFFE,0xBFFF,'101011','110100'],
] as const;
export const legacy2017AutumnPm12Hex=(n:number)=>'#'+n.toString(16).toUpperCase().padStart(4,'0');
export function legacy2017AutumnPm12Input(values:number[]){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=8)throw Error('PARAMETER_CONSTRAINT');return values[0];}
/** Numeric 32-bit window/mask implementation, independent of the text/CASL oracles. */
export function legacy2017AutumnPm12Numeric(alpha:readonly number[],beta:string,gamma:string){
 if(alpha.length!==2||alpha.some(x=>!Number.isInteger(x)||x<0||x>65535)||!/^([01]){1,16}$/.test(beta)||!/^([01]){1,16}$/.test(gamma)||beta.length!==gamma.length)throw Error('BIT_INPUT');
 const n=beta.length,word=BigInt(alpha[0])*65536n+BigInt(alpha[1]),needle=BigInt(parseInt(beta,2)),replacement=BigInt(parseInt(gamma,2)),mask=(1n<<BigInt(n))-1n;let p=-1;
 for(let at=0;at<=32-n;at++)if((word>>BigInt(32-n-at)&mask)===needle){p=at;break;}
 const after=p<0?word:(word&~(mask<<BigInt(32-n-p)))|(replacement<<BigInt(32-n-p));
 return{p,n,after:[Number(after>>16n),Number(after&65535n)],maskAfter23:p>0&&p<16&&p+n>16?Number((mask<<BigInt(16-n))<<BigInt(16-p)&65535n):undefined};
}
export function legacy2017AutumnPm12Model(values:number[]){const v=legacy2017AutumnPm12Input(values),[left,right,beta,gamma]=inputs[v],result=legacy2017AutumnPm12Numeric([left,right],beta,gamma),k=result.p+beta.length-16;
 if(result.p<1||result.p>=16||k<3||k>4||result.maskAfter23===undefined)throw Error('SOURCE_FORMAT');
 const high=(n:number)=>(65535<<(16-n))&65535,options=[(1<<(k-1))-1,(1<<k)-1,high(k-2),high(k-1),high(k),high(k+1)];
 if(new Set(options).size!==6||options[4]!==result.maskAfter23)throw Error('CHOICE_CONSTRAINT');
 return{v,alpha:[left,right],beta,gamma,n:beta.length,p:result.p,k,after:result.after,mask:result.maskAfter23,options};
}
export const legacy2017AutumnPm12Banks=[
 ['AND GR7,GR2','OR GR7,GR2','SLL GR7,0,GR2','SRL GR7,0,GR2','XOR GR7,GR2'],
 ['JMI FOUND','JMI NEXT','JOV FOUND','JOV NEXT','JPL FOUND','JPL NEXT'],
 ['SLL GR6,-1,GR3','SLL GR6,0,GR3','SRA GR6,-1,GR3','SRA GR6,0,GR3','SRL GR6,-1,GR3','SRL GR6,0,GR3'],
 ['ADDL GR2,GR7','LD GR2,=0','LD GR2,=16','LD GR2,=32','SUBA GR2,GR7'],
 ['AND GR2,GR4','OR GR2,GR4','SLL GR2,0,GR4','SRL GR2,0,GR4','XOR GR2,=#FFFF'],
] as const;
export const legacy2017AutumnPm12Profiles=['legacy-2017-autumn-pm12-search','legacy-2017-autumn-pm12-program1','legacy-2017-autumn-pm12-program2','legacy-2017-autumn-pm12-replacement','legacy-2017-autumn-pm12-input','legacy-2017-autumn-pm12-bank','legacy-2017-autumn-pm12-question'] as const;
export const legacy2017AutumnPm12MaterialAssetIds=[79,80,81,82,83,84].map(n=>`asset-ipa-2017h29a-fe-pm-12-p${n}${n===81?'-instructions':''}`);
export function legacy2017AutumnPm12Figure(profile:string,values:number[]){const m=legacy2017AutumnPm12Model([values[0]]),i=legacy2017AutumnPm12Profiles.indexOf(profile as typeof legacy2017AutumnPm12Profiles[number]);if(i<0)throw Error('SOURCE_FORMAT');const group=values[1];if((i===5||i===6)&&(!Number.isInteger(group)||group<0||group>(i===5?5:2)||values.length!==2)||i!==5&&i!==6&&values.length!==1)throw Error('PARAMETER_CONSTRAINT');
 const bank=i===5?group<5?[...legacy2017AutumnPm12Banks[group]]:m.options.map(legacy2017AutumnPm12Hex):undefined,caption=i===0?'図1 部分ビット列の検索の概要':i===1?'プログラム1':i===2?'プログラム2':i===3?'設問2の置換命令':i===4?'設問4の設定':i===6?`設問${group+1}の問い`:['aに関する解答群','bに関する解答群','設問2 解答群','cに関する解答群','dに関する解答群','設問4 解答群'][group];
 return{model:m,bank,caption,alt:bank?`${caption}。${bank.map((s,j)=>`${'アイウエオカ'[j]} ${s}`).join('。')}`:i===0?'先頭0から末尾31のα、位置pからnビットの部分とβとの照合を示す概念図。pは未指定の記号。':i===4?`α=${m.alpha.map(legacy2017AutumnPm12Hex).join(',')}、β=(${m.beta})₂、n=${m.n}、γ=(${m.gamma})₂。`:`${caption}。原28行/43行と全注記、空欄a/b/c/d、数値の即値・アドレス・ビット操作だけを保持。`};}
