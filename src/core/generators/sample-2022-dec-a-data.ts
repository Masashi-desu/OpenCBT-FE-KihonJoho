// Geometry and source-shaped input data. These are not test expectations.
export const aAutomatonInputs=["0011001110","0110110010","1100011011","1011100100","1110010110","0011101101"];
export const aTreeValues=[[16,15,19,10,14],[17,14,19,10,16,18],[18,16,19,15,14,20],[20,18,19,10,14,15,16]];
export const aTreeEdges=[[[0,1],[0,2],[1,3],[1,4]],[[0,1],[0,2],[1,3],[1,4],[2,5]],[[0,1],[0,2],[1,3],[1,4],[2,5]],[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]];
export function aTree(variant:number,candidate:number,offset:number){
  const values=[...aTreeValues[candidate]];
  // Repair one candidate and introduce a local ordering defect in the old valid
  // candidate. This changes ordering constraints rather than merely shuffling.
  if(variant===1&&candidate===1)values[4]=18;
  if(variant===2){if(candidate===2)values[4]=17;if(candidate===1)values[4]=18;}
  if(variant===3){if(candidate===3){values[0]=18;values[1]=14;values[2]=20;values[4]=16;values[5]=19;values[6]=21;}if(candidate===1)values[4]=18;}
  // Source values are integer. The repaired first candidate uses 14/15 swap.
  if(variant===1&&candidate===0){values[1]=14;values[4]=15;}
  return {values:values.map(n=>n+offset),edges:aTreeEdges[candidate]};
}
export function aGrid(pattern:number){return Array.from({length:8},(_,i)=>Array.from({length:8},(_,j)=>pattern===0?(j===1||i===0&&j>=1&&j<=6||i===3&&j>=1&&j<=4):pattern===1?(j===1||i===7&&j>=1&&j<=6):(j===1||i===0&&j>=1&&j<=5||i===3&&j>=1&&j<=5||j===5&&i<=3)));}
export function aTransform(i:number,j:number,operation:number):[number,number]{return [[7-i,7-j],[7-j,i],[i,7-j],[j,7-i]][operation] as [number,number];}
export const aCacheCases=[
  [[15,0,0],[30,0,0],[70,20,60],[80,10,90]],
  [[10,0,0],[20,0,0],[60,10,50],[100,10,50]],
  [[30,0,0],[60,0,0],[20,5,80],[40,10,75]],
  [[40,0,0],[60,0,0],[30,10,80],[20,5,90]],
];
export const aAllocationCases=[[90,30,40,40,70,30],[20,20,20,40,30,20],[20,20,20,40,20,30],[20,20,20,30,40,20]];
export const aNetworkEdges=[[0,1],[1,2],[1,3],[1,4],[2,5],[3,6],[4,8],[5,7],[6,7],[7,8]];
export const aNetworkDays=[2,2,1,4,2,3,3,2,1,4];
export const aMultiplicityCases=[[1,2,0,2],[1,1,1,1],[0,1,1,2],[1,1,1,2]];
