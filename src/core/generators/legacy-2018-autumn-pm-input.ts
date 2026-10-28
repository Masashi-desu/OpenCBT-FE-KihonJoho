/** Source-local finite tuple guard. Inspect descriptors before reading values. */
export function autumn2018Tuple(input:number[],bounds:readonly (readonly[number,number])[]):number[]{
 if(!Array.isArray(input)||input.length!==bounds.length||Reflect.ownKeys(input).some(k=>k!=='length'&&(!/^(0|[1-9]\d*)$/.test(String(k))||Number(k)>=bounds.length)))throw Error('PARAMETER_CONSTRAINT');
 return bounds.map(([min,max],i)=>{const d=Object.getOwnPropertyDescriptor(input,String(i));if(!d||!('value'in d)||!Number.isSafeInteger(d.value)||d.value<min||d.value>max)throw Error('PARAMETER_CONSTRAINT');return d.value as number;});
}
