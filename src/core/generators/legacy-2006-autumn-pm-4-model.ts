export const tabExamples = [
  { gap:4, src:'ab\tcde\tfghi\tj' },
  { gap:3, src:'xy\tab\tcde\tf' },
  { gap:5, src:'mno\tpqrs\ttuv\tw' },
  { gap:6, src:'klmn\topqrs\tuv\tx' },
] as const;

export function tabExample(index:number) {
  const { gap,src }=tabExamples[index];
  const dst:string[]=[];
  for(const char of src) {
    if(char==='\t') for(let spaces=gap-dst.length%gap;spaces>0;spaces--) dst.push('△');
    else dst.push(char);
  }
  const input=[...src].map(char=>char==='\t'?'TAB':char).concat('EOS');
  dst.push('EOS');
  const stops=Array.from({length:Math.floor((dst.length-1)/gap)},(_,i)=>(i+1)*gap+1);
  return {gap,input,dst,stops};
}
