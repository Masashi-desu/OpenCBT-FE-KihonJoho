/** Parent-reviewed nine real manufacturing structures;not label permutations. */
export const legacy2019PmIntegrationManufacturing=[[10, 1, 8, 4, 2, 8], [3, 4, 2, 8, 8, 8], [12, 8, 1, 8, 2, 2], [3, 2, 4, 8, 8, 8], [5, 8, 2, 8, 2, 8], [5, 2, 2, 8, 8, 8], [1, 12, 2, 8, 2, 8], [1, 2, 2, 12, 8, 8], [9, 8, 2, 8, 2, 4]] as const;
export function legacy2019PmIntegrationTable(values:number[]){
 if(values.length!==2||!Number.isInteger(values[0])||values[0]<0||values[0]>8||!Number.isInteger(values[1])||values[1]<0||values[1]>2)throw Error('PARAMETER_CONSTRAINT');
 const masks=legacy2019PmIntegrationManufacturing[values[0]],factor=[5,4,6][values[1]],pool=[[500],[200,200],[300],[50,150,100]],next=[0,0,0,0],rows=masks.map(mask=>pool.map((p,j)=>(mask&(1<<j))?p[next[j]++]*factor/5:null)),totals=pool.map(p=>p.reduce((a,b)=>a+b,0)*factor/5);return{rows,totals};
}
export function legacy2019PmIntegrationTableAlt(values:number[]){const{rows,totals}=legacy2019PmIntegrationTable(values);return'表1 2018年度の事業部別取扱高、単位は億円。見出しは製造工場と事業部、事業部の下にP、Q、R、S。'+rows.map((row,i)=>`${'HIJKLM'[i]}製造工場：${row.map((n,j)=>`${'PQRS'[j]}事業部${n===null?'−':n}`).join('、')}`).join('。')+'。合計：'+totals.map((n,j)=>`${'PQRS'[j]}事業部${n}`).join('、')+'。注記：−は当該工場が当該事業部の製品を製造していないことを示す。';}
