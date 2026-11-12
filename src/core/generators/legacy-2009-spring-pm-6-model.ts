const cases=[
  {jobs:[[20,12,8],[16,12,10]], coverage:0.95},
  {jobs:[[23,15,11],[19,15,13]], coverage:0.68},
  {jobs:[[27,16,9],[22,15,10]], coverage:0.95},
  {jobs:[[28,15,10],[25,17,13]], coverage:0.68},
] as const;
export function riskAt(index:number) {
  const {jobs,coverage}=cases[index];
  const exact=jobs.map(([bad,mode,good])=>({ mean:(bad+4*mode+good)/6,variance:((bad-good)/6)**2 }));
  const avg=jobs.reduce((sum,[bad,mode,good])=>sum+bad+4*mode+good,0)/6;
  const variance=exact[0].variance+exact[1].variance;
  const sigma=Number(Math.sqrt(variance).toFixed(1));
  const largest=Math.max(...exact.map(row=>Math.sqrt(row.variance)));
  const eOptions=index===0?[24,25,27,29]:[jobs[0][1]+jobs[1][1],avg,avg+Math.round(sigma),avg+Math.round(2*sigma)];
  const fOptions=[largest,sigma,2*largest,2*sigma];
  return {
    jobs,exact,avg,variance,sigma,eOptions,fOptions,coverage,
    tolerance:coverage===0.95?fOptions[3]:fOptions[1],
    rows:jobs.map((job,i)=>[...job,Number(exact[i].mean.toFixed(1)),exact[i].variance,Math.sqrt(exact[i].variance)]),
  };
}
