// A, B, C use bits 4, 2 and 1 respectively when identifying the Venn regions.
export const vennCases=[[3,6],[2,3,6],[2,4,6],[0]] as const;
export const vennChoices=[
 String.raw`\neg(A\cap B\cap C)\cap B`,
 String.raw`(A\cup B)\cap\neg C`,
 String.raw`(\neg A\cap B\cap C)\cup(A\cap B\cap\neg C)`,
 String.raw`\neg(A\cup B\cup C)`,
] as const;
export const floats=[
 {value:0.25,f:.5,e:[1,-7,-1,1],signs:[0,0,0,1]},
 {value:1.5,f:.75,e:[1,-7,-1,1],signs:[0,0,0,1]},
 {value:-.75,f:.75,e:[0,-4,1,0],signs:[0,0,0,1]},
 {value:.09375,f:.75,e:[3,-3,-2,3],signs:[0,0,0,1]},
] as const;
export const floatParts=['S','e','f'] as const;
export const floatBits=(i:number,j:number)=>{
 const datum=floats[i];
 return [String(datum.signs[j]),(datum.e[j]&15).toString(2).padStart(4,'0'),(datum.f*2048).toString(2).padStart(11,'0')];
};

// Rows give the distances to the base, left, and right, normalized to a
// common altitude of 100. Coordinates are derived only for figure rendering.
export const triangleCases=[
 [[50,0,50],[16,20,64],[7,72,21],[0,0,100]],
 [[0,100,0],[33,37,30],[19,33,48],[26,24,50]],
 [[41,21,38],[33,39,28],[53,16,31],[49,12,39]],
 [[49,0,51],[38,34,28],[29,40,31],[55,45,0]],
] as const;

export const searchCases=[
 {from:'1',to:'n',upper:false},{from:'2',to:'n−1',upper:false},
 {from:'3',to:'n',upper:true},{from:'1',to:'n−2',upper:true},
] as const;
export const multiplyWidths=[16,12,20,24] as const;
export const nandCases=[
 [['X','X'],['Y','Y'],['N1','N2']],
 [['X','Y'],['X','Y'],['N1','N2']],
 [['X','X'],['N1','N1'],['N2','Y']],
 [['X','Y'],['N1','N1'],['N2','N2']],
] as const;
