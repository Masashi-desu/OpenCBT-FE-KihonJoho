export const copyDepartments=['Sales-1','Sales-2','Dev-1','Dev-2','Admin'] as const;
const copyCases=[
  {unit:100,limit:50,totals:[1150,780,680,1650,450],both:[650,300,400,600,225]},
  {unit:200,limit:60,totals:[2310,1590,1400,3301,975],both:[1500,1050,700,2500,590]},
  {unit:125,limit:40,totals:[1600,1125,795,2010,525],both:[510,445,318,1000,110]},
  {unit:250,limit:70,totals:[3200,2010,1750,4500,1220],both:[2400,1100,980,3400,900]},
] as const;

export function copyAt(index:number) {
  const data=copyCases[index];
  return {...data,maximum:data.unit*30,scale:data.unit*10};
}
export function copyHeader(index:number) {
  return '  DEPT  ----+----1----+----2----+----3  (x'+copyAt(index).scale+')';
}
export function copyOutput(index:number,marked:boolean) {
  const {unit,limit,totals,both}=copyAt(index);
  const lines=totals.map((total,i)=>{
    const marks='*'.repeat(Math.ceil(total/unit));
    const suffix=marked&&total>0&&100*both[i]<limit*total?'(!)':'';
    return copyDepartments[i].padEnd(8)+marks+suffix;
  });
  return [copyHeader(index),...lines].join('\n');
}
export function copyChanges(index:number):[string,string][] {
  const {limit}=copyAt(index);
  return [
    ['行番号11と12の間に追加','    02  DEPT-BOTH    PIC 9(4) OCCURS 5 VALUE ZERO.\n77  BOTH-RATE        PIC 9(3).'],
    ['［c］の間に追加','IF CP-BOTH = 1 THEN\n    ADD CP-CNT TO DEPT-BOTH(CP-DEPT)\nEND-IF.'],
    ['行番号41を変更',[
      '［d］','IF BOTH-RATE >= '+limit+' THEN',
      '    DISPLAY DEPT-NAME(DEPT-CNT) MARKER(1:MARK-CNT)',
      'ELSE','    DISPLAY DEPT-NAME(DEPT-CNT) MARKER(1:MARK-CNT) "(!)"',
      'END-IF',
    ].join('\n')],
  ];
}
