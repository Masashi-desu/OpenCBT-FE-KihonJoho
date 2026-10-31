export type Legacy2018NandPoint={x:number;y:number};
export type Legacy2018NandGate={id:string;x:number;y:number;inputs:[string,string]};
export type Legacy2018NandModel={width:number;height:number;gates:Legacy2018NandGate[];wires:Legacy2018NandPoint[][];inputs:{name:string;point:Legacy2018NandPoint}[];output:{name:string;point:Legacy2018NandPoint};last:string};
export const legacy2018AutumnSystemsNandProfile="legacy-2018-autumn-nand-circuit";
export const legacy2018AutumnNandAllowed=(profile:string,v:number[])=>profile===legacy2018AutumnSystemsNandProfile&&v.length===2&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=3);
/** Wiring coordinates are rendered literally. Oracle reconstructs components
 * from paths/circles and connected polylines rather than importing this model. */
export function legacy2018AutumnNandModel(target:number,choice:number):Legacy2018NandModel{
 if(!legacy2018AutumnNandAllowed(legacy2018AutumnSystemsNandProfile,[target,choice]))throw Error("PARAMETER_CONSTRAINT");
 const tall=choice>=2,inputs=["A","B","C","D"].map((name,i)=>({name,point:{x:30,y:tall?40+100*i:[50,80,170,200][i]}})),points=new Map(inputs.map(i=>[i.name,i.point])),gates:Legacy2018NandGate[]=[],wires:Legacy2018NandPoint[][]=[];
 const connect=(from:Legacy2018NandPoint,to:Legacy2018NandPoint)=>{const mid=(from.x+to.x)/2;wires.push(from.y===to.y?[from,to]:[from,{x:mid,y:from.y},{x:mid,y:to.y},to]);};
 const gate=(id:string,x:number,y:number,a:string,b:string)=>{gates.push({id,x,y,inputs:[a,b]});for(const [input,offset]of[[a,-12],[b,12]] as const){const from=points.get(input);if(!from)throw Error("NAND_WIRE_SOURCE");connect(from,{x,y:y+offset});}points.set(id,{x:x+65,y});return id;};
 let last:string,width:number;
 if(choice===0){const ab=gate("g1",90,65,"A","B"),cd=gate("g2",90,185,"C","D");last=gate("g3",240,125,ab,cd);width=360;}
 else if(choice===1){const ab=gate("g1",90,65,"A","B"),cd=gate("g2",90,185,"C","D"),andAB=gate("g3",240,65,ab,ab),andCD=gate("g4",240,185,cd,cd),nand=gate("g5",390,125,andAB,andCD);last=target===1?gate("g6",540,125,nand,nand):nand;width=target===1?660:520;}
 else{const inv=inputs.map((input,i)=>gate(`g${i+1}`,90,input.point.y,input.name,input.name)),orAB=gate("g5",240,90,inv[0],inv[1]),orCD=gate("g6",240,290,inv[2],inv[3]);if(choice===2){const joined=gate("g7",400,190,orAB,orCD);last=gate("g8",520,190,joined,joined);width=640;}else{const norAB=gate("g7",360,90,orAB,orAB),norCD=gate("g8",360,290,orCD,orCD),or=gate("g9",480,190,norAB,norCD);last=target===2?or:gate("g10",600,190,or,or);width=target===2?600:720;}}
 const output={name:"Y",point:{x:width-35,y:points.get(last)!.y}};connect(points.get(last)!,output.point);return{width,height:tall?380:250,gates,wires,inputs,output,last};
}
export function legacy2018AutumnNandAlt(v:number[]){const m=legacy2018AutumnNandModel(v[0],v[1]);return`入力は上からA、B、C、D、右端が出力Y。全${m.gates.length}個は2入力NAND素子で、小さな丸は出力の反転を示す。${m.gates.map(g=>`${g.id}の二つの入力は${g.inputs[0]}と${g.inputs[1]}`).join("。")}。${m.last}の出力をYへ接続する。同じ信号を二つの入力へ接続した素子も含む。`;}
