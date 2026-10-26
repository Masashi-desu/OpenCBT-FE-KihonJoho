/** Independently reviewed against QS46-52 and ANS1. No generator import. */
export const autumnPm9Review = {
  pages: [46,47,48,49,50,51,52], counts: [5,6,6,5,4,6,5],
  originalIndexes: [4,5,2,4,3,4,1],
  conditions: [
    {text:"No! Madam, I'm Adam Graham. This is my gym.", calls:6, lastCount:20},
    {text:"X! Madam, I'm Adam Graham. This is my gym.", calls:5, lastCount:20},
    {text:"No! Madam, I'm Adam Thomas. This is my gym.", calls:7, lastCount:18},
    {text:"No! Madam, I'm Adam Abraham. This is my gym.", calls:6, lastCount:21},
  ],
  originalExamples: [['abc0cbe','bc0cb'],['ABc0CbE','Bc0Cb'],['AB!c0 CbE','B!c0 Cb'],['abc0cb1bc0cbe','bc0cb']],
  limits:'Independent substring enumeration and expression truth review; not evidence of ordinary App/schema admission or third-party permission.',
};
const char = (s:string) => /^[a-z0-9]$/i.test(s);
export const autumnPm9BPredicates = [
  (l:number,r:number,s:string)=>l===r,
  (l:number,r:number,s:string)=>l!==r,
  (l:number,r:number,s:string)=>s[l]===s[r],
  (l:number,r:number,s:string)=>s[l]!==s[r],
  (l:number,r:number,s:string)=>s[l].toLowerCase()===s[r].toLowerCase(),
  (l:number,r:number,s:string)=>s[l].toLowerCase()!==s[r].toLowerCase(),
];
/** Source loop positions, including positions meeting/crossing AFTER skips. */
export function autumnPm9BExecution(text:string,candidate:number) {
  const snapshots:{l:number;r:number;left:string;right:string;reject:boolean}[]=[];
  let answer=true;
  for(let l=0,r=text.length-1;l<r;l++,r--){
    while(!char(text[l]))l++;
    while(!char(text[r]))r--;
    const reject=autumnPm9BPredicates[candidate](l,r,text);
    snapshots.push({l,r,left:text[l],right:text[r],reject});
    if(reject){answer=false;break;}
  }
  return{answer,snapshots};
}
export const autumnPm9BCounterexamples = [
  {candidate:0,text:'a!b!a',expected:true,reason:'After skipping punctuation, l=r=2; source l==r rejects the middle character.'},
  {candidate:1,text:'aa',expected:true,reason:'At positions 0 and 1, l!=r rejects equal endpoint characters.'},
  {candidate:2,text:'aa',expected:true,reason:'Equal raw characters must not cause return 0.'},
  {candidate:3,text:'Aa',expected:true,reason:'Different case must compare equal after conversion.'},
  {candidate:4,text:'aa',expected:true,reason:'Equal lowercase characters must not cause return 0.'},
];
/** Source-reviewed expression strings for real-C mutation probes. */
export const autumnPm9CReviewedCandidates = [
  ['i','ith - &text[0]','ith - &text[0] + 1','hit - ith','hit - ith + 1'],
  ['l == r','l != r','chars[l] == chars[r]','chars[l] != chars[r]','tolower(chars[l]) == tolower(chars[r])','tolower(chars[l]) != tolower(chars[r])'],
  ['ch == str[i]','ch != str[i]','tolower(ch) == tolower(str[i])','tolower(ch) != tolower(str[i])','(ch == tolower(str[i])) || (tolower(ch) == str[i])','(ch == tolower(str[i])) && (tolower(ch) == str[i])'],
  ['textlen - psize','textlen - i - psize','textlen - i + psize','psize + 2','psize - 2'],
  ['i = count; i > 0','i = count; i >= 0','i = count - 1; i > 0','i = count - 1; i >= 0'],
];
/** All substrings, then source priority. No pointer loop or production helper. */
export function autumnPm9SubstringReference(text:string,longest:boolean) {
  const candidates: {start:number;end:number;output:string}[]=[];
  for(let a=0;a<text.length;a++)for(let b=a+1;b<text.length;b++){
    if(!char(text[a])||!char(text[b]))continue;
    const normalized=Array.from(text.slice(a,b+1)).filter(char).join('').toLowerCase();
    if(normalized===Array.from(normalized).reverse().join('')) candidates.push({start:a,end:b,output:text.slice(a,b+1)});
  }
  candidates.sort((a,b)=>a.start-b.start||(longest?b.end-a.end:a.end-b.end));
  return candidates[0]??{start:-1,end:-1,output:''};
}
/** Derive the number of rejected endpoint candidates, not the pointer loop. */
export function autumnPm9CallReference(text:string) {
  const selected=autumnPm9SubstringReference(text,true); let calls=0,lastCount=0;
  for(let i=0;i<text.length;i++){
    if(!char(text[i]))continue;
    const endings=Array.from(text,(_,k)=>k).filter(k=>k>i&&text[k].toLowerCase()===text[i].toLowerCase()).reverse();
    if(i===selected.start){const j=endings.indexOf(selected.end);calls+=j+1;lastCount=j===0?text.length-i-1:endings[j-1]-i-1;break;}
    calls+=endings.length+1;
    lastCount=endings.length?endings[endings.length-1]-i-1:text.length-i-1;
  }
  return {...selected,calls,lastCount};
}
/** Each candidate is independently interpreted in source order. */
export function autumnPm9AllOptionTruth() {
  const lengthCases=[[0,0,2],[3,3,6],[4,4,18],[1,1,2]];
  const a=[(i:number,l:number,r:number)=>i,(i:number,l:number)=>l,(i:number,l:number)=>l+1,(i:number,l:number,r:number)=>r-l,(i:number,l:number,r:number)=>r-l+1].map(f=>lengthCases.every(([i,l,r])=>f(i,l,r)===r-l+1));
  const pairs=[['a','a'],['A','a'],['a','A'],['A','A'],['a','b'],['0','1']];
  const bCorpus=['aa','Aa','aA','AA','ab','01','a!b!a','a!!!a','ab!bA','a!b!c'];
  const b=autumnPm9BPredicates.map((_,j)=>bCorpus.every(s=>autumnPm9BExecution(s,j).answer===(Array.from(s).filter(char).join('').toLowerCase()===Array.from(s).filter(char).reverse().join('').toLowerCase())));
  const c=[(x:string,y:string)=>x===y,(x:string,y:string)=>x!==y,(x:string,y:string)=>x.toLowerCase()===y.toLowerCase(),(x:string,y:string)=>x.toLowerCase()!==y.toLowerCase(),(x:string,y:string)=>x===y.toLowerCase()||x.toLowerCase()===y,(x:string,y:string)=>x===y.toLowerCase()&&x.toLowerCase()===y].map(f=>pairs.every(([x,y])=>f(x,y)===(x.toLowerCase()===y.toLowerCase())));
  const intervals=[[10,1,5],[43,4,15],[9,0,2],[20,3,9]];
  const d=[(n:number,i:number,s:number)=>n-s,(n:number,i:number,s:number)=>n-i-s,(n:number,i:number,s:number)=>n-i+s,(n:number,i:number,s:number)=>s+2,(n:number,i:number,s:number)=>s-2].map(f=>intervals.every(([n,i,s])=>f(n,i,s)===s-2));
  const e=[0,1,2,3].map(mode=>[0,1,2,3].every(n=>{const out:number[]=[];for(let i=mode<2?n:n-1;mode%2===0?i>0:i>=0;i--)out.push(i);return JSON.stringify(out)===JSON.stringify(Array.from({length:n},(_,j)=>n-1-j));}));
  return [a,b,c,d,e];
}
