/** Managed Bitap implementation for the reviewed autumn2019 PM8 domain.
 * Displayed pseudocode is never evaluated. This model is not the test oracle. */
export const legacy2019BitapPatterns=['ACABAB','ACAABB','ACABBA','ACCBAB'] as const;
export const legacy2019BitapPrefixes=['AACBBA','ACBABA','ADABBA'] as const;
export function legacy2019BitapSearch(text:string,pattern:string){
 const masks=Array<number>(26).fill(0);for(let i=0;i<pattern.length;i++)masks[pattern.charCodeAt(i)-65]|=1<<i;
 const trace:{i:number;character:string;mask:number;alpha:number;status:number}[]=[];let status=0,found=-1;
 for(let i=0;i<text.length;i++){const alpha=((status<<1)|1)&65535,mask=masks[text.charCodeAt(i)-65];status=alpha&mask;trace.push({i:i+1,character:text[i],mask,alpha,status});if((status&(1<<(pattern.length-1)))!==0){found=i-pattern.length+2;break;}}
 return{masks,trace,found};
}
export function legacy2019BitapModel(values:readonly number[]){
 if(values.length!==2||!values.every(Number.isInteger)||values[0]<0||values[0]>3||values[1]<0||values[1]>2)throw Error('PARAMETER_CONSTRAINT');
 const pattern=legacy2019BitapPatterns[values[0]],prefix=legacy2019BitapPrefixes[values[1]],text=prefix+pattern+'AB',{masks,trace,found}=legacy2019BitapSearch(text,pattern);
 const a=[masks[0],masks[1],parseInt(masks[1].toString(2).padStart(16,'0').split('').reverse().join(''),2),masks[1]<<(16-pattern.length)],e=masks[text.charCodeAt(8)-65],def=[0,1,2,3,4,5,e];
 return{pattern,prefix,text,masks,trace,found,a,def,answers:{a:masks[1],b:0,c:0,d:trace[1].status,e,f:trace[8].status,g:61,h:6,i:89}};
}
/** Source procedure's Mode flag also runs the intentionally erroneous nesting. */
export function legacy2019BitapRegex(raw:string){let length=0,mode=0;const masks=Array<number>(26).fill(0);for(const c of raw){if(c==='['){mode=1;length++;}else if(c===']')mode=0;else{if(mode===0)length++;masks[c.charCodeAt(0)-65]|=1<<(length-1);}}return{length,masks};}
