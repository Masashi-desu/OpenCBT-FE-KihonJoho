/** Annual-local declarative source diagrams and tables. No registry/year import. */
export const legacy2017SystemsProfiles={multiply:"legacy-2017-multiplication-flow",adder:"legacy-2017-half-adder",dependency:"legacy-2017-functional-dependencies",ledger:"legacy-2017-accounting-model",home:"legacy-2017-ftth-home-network"} as const;
export const legacy2017MultiplicationWidths=[8,12,16];
export function legacy2017MultiplicationConditions(widthIndex:number,direction:number){
 const width=legacy2017MultiplicationWidths[widthIndex];if(!width||![0,1].includes(direction))throw Error("FIGURE_DOMAIN");
 return {width,register:width*2,initial:direction?`被乗数を${width-1}ビット左シフト → X`:"被乗数 → X",rows:[["Yの第0ビット","Xを1ビット左シフト、Yを1ビット右シフト"],["Yの第0ビット","Xを1ビット右シフト、Yを1ビット左シフト"],[`Yの第${width-1}ビット`,"Xを1ビット左シフト、Yを1ビット右シフト"],[`Yの第${width-1}ビット`,"Xを1ビット右シフト、Yを1ビット左シフト"]]};
}
export const legacy2017HalfAdderPairs=[
 [["排他的論理和","論理積"],["排他的論理和","論理積"]],
 [["否定論理積","否定論理和"],["論理和","論理積"]],
 [["否定論理和","排他的論理和"],["論理積","排他的論理和"]],
 [["論理積","論理和"],["排他的論理和","論理和"]],
];
export function legacy2017HalfAdderRows(v:number[]){if(v.length!==3||v.some(x=>x!==0&&x!==1))throw Error("PARAMETER_CONSTRAINT");return [legacy2017HalfAdderPairs[0][0],...v.map((x,i)=>legacy2017HalfAdderPairs[i+1][x])].map(r=>[...r]);}
export type Legacy2017DependencyModel={nodes:{name:string;x:number;y:number}[];edges:[string,string][];tables:string[][][]};
export const legacy2017DependencyModels:Legacy2017DependencyModel[]=[
 {nodes:[{name:"a",x:70,y:190},{name:"b",x:300,y:70},{name:"c",x:300,y:160},{name:"d",x:300,y:250},{name:"e",x:300,y:340},{name:"f",x:600,y:40},{name:"g",x:600,y:120},{name:"h",x:600,y:200},{name:"i",x:600,y:320},{name:"j",x:600,y:400}],edges:[["a","b"],["a","c"],["a","d"],["a","e"],["b","f"],["b","g"],["b","h"],["e","i"],["e","j"]],tables:[[["a"],["b","c","d","e"],["f","g","h","i","j"]],[["a","b","c","d","e"],["b","f","g","h"],["e","i","j"]],[["a","b","f","g","h"],["c","d"],["e","i","j"]],[["a","c","d"],["b","f","g","h"],["e","i","j"]]]},
 {nodes:[{name:"a",x:70,y:190},{name:"b",x:300,y:70},{name:"c",x:300,y:160},{name:"d",x:300,y:250},{name:"e",x:300,y:340},{name:"f",x:600,y:70},{name:"g",x:600,y:250},{name:"h",x:600,y:340},{name:"i",x:850,y:40},{name:"j",x:850,y:130}],edges:[["a","b"],["a","c"],["a","d"],["a","e"],["b","f"],["b","g"],["b","h"],["f","i"],["f","j"]],tables:[[["a"],["b","c","d","e"],["f","g","h","i","j"]],[["a","b","c","d","e"],["b","f","g","h"],["f","i","j"]],[["a","b","f","g","h"],["c","d","e"],["f","i","j"]],[["a","c","d","e"],["b","f","g","h"],["f","i","j"]]]},
 {nodes:[{name:"a",x:70,y:190},{name:"b",x:300,y:70},{name:"c",x:300,y:220},{name:"d",x:600,y:40},{name:"e",x:300,y:365},{name:"f",x:600,y:130},{name:"g",x:600,y:220},{name:"h",x:600,y:310},{name:"i",x:600,y:405},{name:"j",x:600,y:490}],edges:[["a","b"],["a","c"],["a","e"],["b","d"],["b","f"],["b","g"],["b","h"],["e","i"],["e","j"]],tables:[[["a"],["b","c","e"],["d","f","g","h","i","j"]],[["a","b","c","e"],["b","d","f","g","h"],["e","i","j"]],[["a","b","d","f","g","h"],["c"],["e","i","j"]],[["a","c"],["b","d","f","g","h"],["e","i","j"]]]},
];
export const legacy2017LedgerAccounts=[["208","売上"],["510","現金"],["511","預金"],["812","旅費"]];
export function legacy2017LedgerTables(target:number,amount="50,000"){
 if(![0,1].includes(target))throw Error("PARAMETER_CONSTRAINT");
 return {accounts:legacy2017LedgerAccounts.map(r=>[...r]),movements:[["a","b",amount,"0122"],[target?"510":"208",target?"借方":"貸方",amount,"0122"],["510","貸方","50,000","0124"],["812","借方","50,000","0124"]],transactions:[["0122","2017-04-04","A社"],["0124","2017-04-04","A社"]],rows:[["208","貸方"],["208","借方"],["510","貸方"],["510","借方"]]};
}
