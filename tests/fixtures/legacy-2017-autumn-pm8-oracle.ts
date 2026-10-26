/** Independent original QS38–45 ledger. Never import production. */
export const alphabet=' .,?abcdefghijklmnopqrstuvwxyz';
// QS38 rule: fixed double-value contribution for values0..29, independently reviewed.
export const doubled=[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,1,3,5,7,9,11,13,15,17,19,21,23,25,27,29];
export const fixedRows=[['ipa  ','tests','make ','it.  '],['api  ','build','data ','ok?  '],['net  ','route','code ','go.  '],['ram  ','debug','file ','up,  ']];
export function sumReference(chars:string){const offset=chars.length%2;return [...chars].reduce((s,c,i)=>{const n=alphabet.indexOf(c);if(n<0)throw Error('UNKNOWN_CHAR');return s+((i+offset)%2===0?doubled[n]:n);},0);}
export const validReference=(chars:string)=>sumReference(chars)%30===0;
export function checkReference(payload:string){const matches=[...alphabet].filter(c=>validReference(payload+c));if(matches.length!==1)throw Error('NONUNIQUE_CHECK');return matches[0];}
export function completedReference(rows:string[]){const out=rows.map(row=>[...row,checkReference(row)]);out.push([...Array.from({length:5},(_,i)=>checkReference(rows.map(r=>r[i]).join(''))),'']);return out;}
export function casesReference(payload:string){const chars=[...payload],edited=[...chars],reversePositions=[...chars],adjacent=[...chars];edited[2]=alphabet[alphabet.indexOf(chars[2])+1];[reversePositions[0],reversePositions[2]]=[reversePositions[2],reversePositions[0]];[adjacent[0],adjacent[1]]=[adjacent[1],adjacent[0]];const check=checkReference(payload);return [edited.join('')+check,reversePositions.join('')+check,adjacent.join('')+check,[...chars].reverse().join('')+check];}
export function tableValidReference(grid:string[][]){const rows=grid.slice(0,-1).map(r=>r.join('')),columns=Array.from({length:grid[0].length-1},(_,i)=>grid.map(r=>r[i]).join(''));return [...rows,...columns].every(validReference);}
export const candidateSets=[[1,2,3,4],[2],[2,3],[2,3,4],[2,4],[]];
export const caseBankTexts=['1と2と3と4である','2である','2と3である','2と3と4である','2と4である','ない'];
export const booleanPairs=[['false','false'],['false','true'],['true','false'],['true','true']];
export const bBankTexts=['N − sum % N','sum % N','(N − sum % N) % N','(sum − N) % N'];
export const cBankTexts=['sum ÷ N ＝ 0','sum ÷ N ≠ 0','sum % N ＝ 0','sum % N ≠ 0'];
/** Literal source-program mutation model, separate from fixed positional table reference. */
export function candidateGenerate(payload:string,a1:boolean,b:number){let even=false,total=0;for(let i=payload.length-1;i>=0;i--){const n=alphabet.indexOf(payload[i]);total+=even===a1?n:Math.trunc(n*2/30)+n*2%30;even=!even;}const n=b===0?30-total%30:b===1?total%30:b===2?(30-total%30)%30:(total-30)%30;return n>=0&&n<30?alphabet[n]:null;}
export function candidateValidate(chars:string,a2:boolean,c:number){let odd=true,total=0;for(let i=chars.length-1;i>=0;i--){const n=alphabet.indexOf(chars[i]);total+=odd===a2?n:Math.trunc(n*2/30)+n*2%30;odd=!odd;}const invalid=c===0?Math.trunc(total/30)===0:c===1?Math.trunc(total/30)!==0:c===2?total%30===0:total%30!==0;return !invalid;}
export const originalGrid=[['i','p','a',' ',' ','f'],['t','e','s','t','s','i'],['m','a','k','e',' ','n'],['i','t','.',' ',' ','h'],['r','a','v','b','l','']];
export const officialLabels='エウエオウカ';
/** Visible original listing, QS41; control markers are separately asserted. */
export const programVisibleRows=[
 '○文字型関数： calcCheckCharacter(文字型： input[], 整数型： len)',
 '○整数型： N, sum, i, value, check_value','○論理型： is_even',
 '・N ← 30','・sum ← 0','・is_even ← false','i: len, i ＞ 0, −1',
 '・value ← getValue(input[i])','is_even ＝ a1','・sum ← sum ＋ value',
 '・sum ← sum ＋ (value × 2) ÷ N ＋ (value × 2) % N','',
 '・is_even ← not is_even','','・check_value ← b','・return getChar(check_value)','',
 '○論理型関数： validateCheckCharacter(文字型： input[], 整数型： len)',
 '○整数型： N, sum, i, value','○論理型： is_odd, ret_value',
 '・N ← 30','・sum ← 0','・is_odd ← true','・ret_value ← true','i: len, i ＞ 0, −1',
 '・value ← getValue(input[i])','is_odd ＝ a2','・sum ← sum ＋ value',
 '・sum ← sum ＋ (value × 2) ÷ N ＋ (value × 2) % N','','・is_odd ← not is_odd','',
 'c','・ret_value ← false','','・return ret_value',
];
