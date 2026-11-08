import { spring2014Pm9OriginalInput, spring2014Pm9WordExample } from './legacy-2014-spring-pm-9-source';
import { spring2014Pm11OriginalArticles, type Article } from './legacy-2014-spring-pm-11-source';

export const spring2014Pm0913CaseCount = 8;

const wrappingCases = [
  {width:50, punctuation:'.', input:spring2014Pm9OriginalInput, words:spring2014Pm9WordExample},
  {width:46, punctuation:'!', input:'   The    new   analysis   begins today!\n   Each report shows an example and a conclusion.\n Engineering staff review the work!     \n', words:'Read  the  chart and compare the two reports!'},
  {width:43, punctuation:'?', input:'    Can  the    editors     check the figures?\n  The final lines show the current results.\n    Did     the    pilot    tests agree?  \n', words:'Did  the tests    finish on time?'},
  {width:52, punctuation:';', input:'   The   editorial team  tested   several   designs;\n    Its       notes explain each decision.\n Other engineers reproduce each result;   \n', words:'Run  the  parser and record the result;'},
  {width:45, punctuation:'.', input:' The      main program opens the file and prints it.\n     Each    test     case exercises a separate route.\n An editor rereads the notes.    \n', words:'The    editor checks   the final line.'},
  {width:54, punctuation:'!', input:'   These practice files demonstrate the  print   layout!\n  Try   a  different    paragraph   with    two short   sentences!\n The editor marks each page.   \n', words:'Read each   test and measure  the line!'},
  {width:48, punctuation:'?', input:' Could the new   report   include the latest tables?\n    All    tables contain    numbers, captions and notes.\n   Is the position of each column clear?\n', words:'What     changed in this table?'},
  {width:56, punctuation:';', input:'    A  review   of the first file takes two working   days;\n   Detailed    examples  are shown   under    separate headings.\n   The last word also fits;     \n', words:'Verify  the  file  and sign the note;'},
];
export function formatSpring2014Text(input:string,width:number,indent?:string):string {
  let output = '', column = 0, last = indent;
  for (const token of input.match(/[^ \n]+|[ \n]/g) ?? []) {
    if (token==='\n' || column+token.length>width) {
      output += '\n';
      column = 0;
    }
    if (token==='\n' || (token===' ' && indent!==undefined && column===0)) continue;
    if (indent!==undefined && column===0 && last===indent) { output+=' '; column++; }
    output += token;
    column += token.length;
    if (token!==' ') last = token.at(-1);
  }
  return output;
}
export function spring2014Pm9Model(index:number) { return wrappingCases[index]; }

const testScoringCases = [
  [5,10],[4,8],[6,12],[7,9],[5,15],[4,11],[6,13],[7,7],
] as const;
export function spring2014Pm10Model(index:number) {
  const [history,cutoff] = testScoringCases[index];
  return {history,cutoff};
}
const articleCases: readonly (readonly [Article[],string])[] = [
  [spring2014Pm11OriginalArticles,'0003'],
  [[{id:'0011',headline:'交通案内',body:'乗車案内…',free:true},{id:'0009',headline:'旅行ガイド',body:'旅の計画…',free:true},{id:'0012',headline:'駅案内',body:'最寄り駅…',free:true}],'0009'],
  [[{id:'0027',headline:'クラウド入門',body:'利用方法…',free:false},{id:'0025',headline:'運用特集',body:'運用の手順…',free:true},{id:'0026',headline:'障害対策',body:'復旧の準備…',free:false}],'0025'],
  [[{id:'0008',headline:'自転車案内',body:'安全点検…',free:true},{id:'0007',headline:'整備特集',body:'整備の手順…',free:false},{id:'0006',headline:'道路案内',body:'道路の利用…',free:true}],'0008'],
  [[{id:'0016',headline:'会計入門',body:'記録方法…',free:true},{id:'0015',headline:'帳簿特集',body:'帳簿の管理…',free:true},{id:'0014',headline:'請求ガイド',body:'書類の種類…',free:true}],'0016'],
  [[{id:'0100',headline:'園芸特集',body:'種まき…',free:false},{id:'0102',headline:'樹木ガイド',body:'木の見分け方…',free:false},{id:'0101',headline:'季節の花',body:'花の手入れ…',free:true}],'0101'],
  [[{id:'0020',headline:'標本案内',body:'収集と保管…',free:true},{id:'0019',headline:'展示特集',body:'展示の歴史…',free:false},{id:'0018',headline:'展示ガイド',body:'見学の順路…',free:true}],'0018'],
  [[{id:'0033',headline:'英語入門',body:'発音の基礎…',free:true},{id:'0031',headline:'教材の選び方',body:'教材の種類…',free:true},{id:'0032',headline:'読解ガイド',body:'文章の読み方…',free:true}],'0032'],
];
export function subscriptionDisplay(articles:readonly Article[]) {
  const ordered = [...articles].sort((a,b)=>a.id.localeCompare(b.id,'en'));
  const permitted = ordered.find(article=>!article.free)?.id;
  return ['ゲスト','登録会員Ａ','有料会員Ｂ'].flatMap((reader,index)=>ordered.map(({id,headline,body,free})=>
    reader+': 記事「'+headline+'」'+(free || index===2 || (index===1 && id===permitted) ? body:'＜閲覧不可＞')));
}
export function spring2014Pm11Model(index:number) {
  const [articles,changed] = articleCases[index];
  const after = articles.map(article=>article.id===changed?{...article,free:false}:article);
  const denied = subscriptionDisplay(after).filter(line=>line.endsWith('＜閲覧不可＞')).length;
  return {articles,changed,after,denied};
}

const tokenCases = [
  ['  THIS 1234  99#AB* .',' 1A2B C3.'],
  ['  EDIT 6734  51+XY* .',' 2C1A B3.'],
  ['  LINE 9687  83#RQ* .',' 3B2C A1.'],
  ['  FILE 0482  66-ZY* .',' 2A3C B1.'],
  ['  WORD 7429  36+CS* .',' 3C2B A1.'],
  ['  TEXT 2153  49#FD* .',' 2B1A C3.'],
  ['  OPEN 8023  57*KF+ .','  3A2B B1.'],
  ['  READ 3056  18+WX* .','  1C3A A2.'],
] as const;
export function tokensIn(text:string,base:number) {
  const parts = [...text.matchAll(/[^ .]+/g)];
  return parts.map(part=>{
    const firstOther = [...part[0]].find(character=>character<'0' || character>'9');
    return {address:base+part.index!,length:part[0].length,kind:firstOther===undefined?0:1,firstOther};
  });
}
export function spring2014Pm12Model(index:number) {
  const [example,trace] = tokenCases[index];
  const base = 100+index*20;
  const next = tokensIn(trace,base).map(row=>row.firstOther).filter(Boolean)[1]!;
  return {example,trace,base,next,table:tokensIn(example,base)};
}

type Customer = {id:number;name:string;post:number;address:string;phone:string;age:number;job:number};
export const originalSpring2014CustomerRows:readonly Customer[] = [
  {id:1,name:'滝本卓也',post:1070062,address:'東京都港区南青山…',phone:'03xxxxxxxx',age:66,job:111},
  {id:2,name:'中野浩二',post:1690051,address:'東京都新宿区西早稲田…',phone:'03xxxxxxxx',age:59,job:132},
  {id:3,name:'下山健',post:1110042,address:'東京都台東区寿…',phone:'03xxxxxxxx',age:37,job:214},
  {id:4,name:'飯山由美',post:1830003,address:'東京都府中市朝日町…',phone:'042xxxxxxx',age:19,job:312},
  {id:4999,name:'山本礼子',post:5300042,address:'大阪府大阪市北区天満橋…',phone:'06xxxxxxxx',age:29,job:112},
  {id:5000,name:'田中陽子',post:2400012,address:'神奈川県横浜市保土ケ谷…',phone:'045xxxxxxx',age:36,job:321},
];
export const originalSpring2014AnonymousRows = [
  [1,10,60,100],[2,16,50,100],[3,11,35,210],[4,18,0,312],[5,27,50,100],
  [6,20,25,312],[7,20,30,230],[8,25,60,100],[9,26,40,400],[10,22,30,222],
  [11,22,35,225],[4999,53,25,100],[5000,24,35,320],
];
export const originalSpring2014ProvidedRows = [
  ['2','00','20','230','4'],['3','00','60','500','4'],['4','01','20','241','5'],
  ['⋮','⋮','⋮','⋮','⋮'],['206','98','60','500','4'],['207','99','60','500','3'],
];
const sourceJobs = [100,110,120,200,210,220,230,240,300,310,320,330,400,410,420,430,500,510,520,530,
  600,610,620,630,700,710,720,730,800,810,820,830,900,910,920,930,940,950,960,970];
const ageBands = [
  [0,20,25,30,35,40,50,60],[0,18,24,30,36,45,55,65],
  [0,17,23,29,35,42,53,64],[0,19,24,30,37,44,56,66],
  [0,21,26,32,38,46,57,68],[0,20,26,31,37,45,56,64],
  [0,18,23,28,35,41,52,65],[0,21,27,33,40,48,60,69],
];
const jobMarks = [
  [100,120,210,230,320],[100,130,210,330],[200,110,230,320],
  [300,110,220,320],[300,120,210,320],[200,110,220,330],
  [200,120,230,310],[300,120,240,330],
];
const cutoff = [3,2,4,5,6,3,4,5];
const jobAlternatives = [111,112,121,211,212,221,225,231,245,311,321,333,411,421,513,523,612];
function caseCustomers(index:number):Customer[] {
  return Array.from({length:5000},(_,offset)=>{
    const id = offset+1;
    const group = offset<47 ? offset : offset<62 ? (offset-47)%5 : 10+Math.floor((offset-62)/(index+2))%31;
    const post = ((7*group+index*3)%100)*100000+(id*1467)%100000;
    return {id,name:'例示顧客'+id.toString().padStart(4,'0'),post,
      address:'地区'+(group%7+1)+'…',phone:'00xxxxxxxx',
      age:(group*17+index*2)%86,job:jobAlternatives[(group*7+index)%jobAlternatives.length]};
  });
}
export function anonymizeSpring2014Customer(customer:Customer,ages:readonly number[],marked:readonly number[]) {
  const {id,post,age,job}=customer;
  const major = Math.trunc(job/100)*100, middle = Math.trunc(job/10)*10;
  return [id,Math.trunc(post/100000),ages.filter(boundary=>boundary<=age).at(-1)!,
    marked.includes(major)?major:marked.includes(middle)?middle:job];
}
export function spring2014Pm13Model(index:number) {
  const ages=ageBands[index], marked=jobMarks[index], minimum=cutoff[index];
  const jobs=index===1?sourceJobs.map(job=>job===970?130:job).sort((a,b)=>a-b):sourceJobs;
  const sampleAge = index===0?23:ages[1]+2;
  const sampleMajor = marked[0], sampleMiddle=marked.find(code=>code%100!==0&&Math.trunc(code/100)!==Math.trunc(sampleMajor/100)&&jobs.includes(code))!;
  const countRows = new Map<number,{post:number;age:number;job:number;count:number}>();
  const customers=index===0?[]:caseCustomers(index);
  for (const customer of customers) {
    const [,post,age,job] = anonymizeSpring2014Customer(customer,ages,marked);
    const key=post*100000+age*1000+job;
    const previous=countRows.get(key);
    countRows.set(key,{post,age,job,count:(previous?.count ?? 0)+1});
  }
  const visible = (customers.length?customers.filter(({id})=>id<=11||id>4998):[]).map(
    row=>anonymizeSpring2014Customer(row,ages,marked));
  const provided = [...countRows.entries()].sort(([a],[b])=>a-b).filter(([,row])=>row.count>=minimum)
    .map(([,row],i)=>[String(i+2),String(row.post).padStart(2,'0'),String(row.age),String(row.job),String(row.count)]);
  const providedSample = provided.length>5?[...provided.slice(0,3),Array<string>(5).fill('⋮'),...provided.slice(-2)]:provided;
  const examples = customers.filter(({id})=>id<=4||id>4998);
  return {ages,marked,minimum,jobs,sampleAge,sampleMajor,sampleMiddle,customers,
    input:index===0?originalSpring2014CustomerRows:examples,
    anonymous:index===0?originalSpring2014AnonymousRows:visible,
    provided:index===0?originalSpring2014ProvidedRows:providedSample,
    groupCount:index===0?206:provided.length};
}
