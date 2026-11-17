export const sortCases = [
  { base:0, down:false, rows:[[0,1,4,3,2,5,6],[6,5,4,3,2,1,0],[3,3,1,5,4,5,2]], small:1000, large:1000000, logSmall:10, logLarge:20, ratio:10 },
  { base:1, down:true, rows:[[6,4,5,2,3,0,1],[0,1,2,3,4,5,6],[3,4,3,2,5,2,1]], small:100, large:10000, logSmall:7, logLarge:14, ratio:20 },
  { base:0, down:false, rows:[[1,2,5,4,3,6,7],[7,6,5,4,3,2,1],[8,3,8,4,5,5,1]], small:1024, large:1048576, logSmall:10, logLarge:20, ratio:5 },
  { base:1, down:true, rows:[[9,6,7,5,3,4,0],[1,3,4,5,6,7,8],[2,3,2,3,4,7,8]], small:256, large:65536, logSmall:8, logLarge:16, ratio:20 },
] as const;
export const displayNumber = (value:number) => value.toLocaleString('en-US');
