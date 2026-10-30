/** Managed Huffman data for the next whole PM major. No runtime registration.
 * Alpha remains the source's19-character example; only beta is parameterized. */
export const legacy2019Pm8AlphaText="AAAABBCDCDDACCAAAAA";
export const legacy2019Pm8AlphaFrequency=[10,2,4,3]as const;
export const legacy2019Pm8BetaFrequency=[[1,7,3,2],[1,9,2,1],[1,8,3,1],[2,8,2,1]]as const;
export const legacy2019Pm8OtherCodeTables=[["010","0","01","111"],["100","0","101","11"],["100","1","00","01"]]as const;
export function legacy2019Pm8Tree(frequency:readonly number[]){
 if(frequency.length!==4||frequency.some(n=>!Number.isInteger(n)||n<=0||n>19))throw Error("PARAMETER_CONSTRAINT");
 const parent=Array(7).fill(-1)as number[],left=[...parent],right=[...parent],freq=[...frequency,-1,-1,-1];let size=4;
 const nodes=()=>Array.from({length:size},(_,i)=>i).filter(i=>parent[i]<0).sort((i,j)=>freq[i]-freq[j]||i-j);
 let candidates=nodes();while(candidates.length>=2){const[i,j]=candidates;left[size]=i;right[size]=j;freq[size]=freq[i]+freq[j];parent[i]=parent[j]=size;size++;candidates=nodes();}
 const codes=Array.from({length:4},(_,leaf)=>{let k=leaf,code="";while(parent[k]>=0){code=(left[parent[k]]===k?"0":"1")+code;k=parent[k];}return code;});
 return{parent,left,right,freq,size,root:candidates[0],codes};
}
export function legacy2019Pm8Beta(index:number){if(!Number.isInteger(index)||index<0||index>=4)throw Error("PARAMETER_CONSTRAINT");const frequency=[...legacy2019Pm8BetaFrequency[index]],text=frequency.map((n,i)=>"ABCD"[i].repeat(n)).join(""),tree=legacy2019Pm8Tree(frequency),weighted=(codes:readonly string[])=>frequency.reduce((sum,n,i)=>sum+n*codes[i].length,0),denominator=2*text.length,round=(n:number)=>Math.floor((n*200+denominator)/(2*denominator))/100;
 const codeTables=[tree.codes,...legacy2019Pm8OtherCodeTables.map(c=>[...c])],bits=[weighted(codeTables[3]),weighted(codeTables[0]),weighted(codeTables[2])];
 return{frequency,text,tree,codeTables,bits,denominator,ratios:[...bits.map(n=>round(n).toFixed(2)),"0.92"]};
}
