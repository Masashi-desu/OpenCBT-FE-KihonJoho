import assert from "node:assert/strict";
import type { GeneratedBody } from "../../src/core/generators/definition";
import type { Block } from "../../src/core/types";
import {legacy2018DecemberBaselineChoices} from "./legacy-2018-dec-alias-review";
import {decAKnowledgeOracle} from "./dec-a-knowledge-review";
import {decAFixedKnowledgeOracle,decAPathCounterexamples} from "./dec-a-fixed-knowledge-review";
import {decAGeneratorOracle} from "./dec-a-generator-oracle";

const text = (b:Block) => b.type==="paragraph"||b.type==="code" ? b.text : b.type==="list" ? b.items.join("\n") : "";
const number = (s:string) => Number(s.replaceAll(",",""));
const close = (a:number,b:number) => assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
/** Reviewed domain counts are fixed separately from the generator. Rejections
 * have an independent mathematical reason, not a permissive catch-all. */
export const legacy2018DomainCounts:Record<string,readonly [number,number]>={
  "2018h30h-fe-am-4":[6,0],
  "2018h30h-fe-am-17":[4,0],
  "2018h30h-fe-am-60":[3,0],"2018h30a-fe-am-7":[3,0],
  "2018h30a-fe-am-77":[9,0],
  "2018h30h-fe-am-24":[4,0],"2018h30a-fe-am-31":[10,0],
  "2018h30h-fe-am-41":[4,0],"2018h30h-fe-am-65":[4,0],"2018h30h-fe-am-74":[4,0],
  "2018h30h-fe-am-32":[12,0],"2018h30a-fe-am-37":[3,0],
  "2018h30h-fe-am-1":[6,2],"2018h30h-fe-am-52":[11,1],"2018h30h-fe-am-53":[6,3],
  "2018h30h-fe-am-54":[14,22],"2018h30h-fe-am-67":[12,0],"2018h30h-fe-am-78":[9,0],
  "2018h30a-fe-am-1":[10,0],"2018h30a-fe-am-9":[6,0],"2018h30a-fe-am-11":[6,0],
  "2018h30a-fe-am-54":[24,0],"2018h30a-fe-am-57":[4,0],"2018h30a-fe-am-68":[69,231],"2018h30a-fe-am-75":[157,5],
  "2018h30a-fe-am-4":[40,0],"2018h30a-fe-am-5":[12,0],
};
export function legacy2018BindingAllowed(source:string,v:number[]):boolean {
  switch(source){
    case "2018h30h-fe-am-1":return v[1]<2**(v[0]-1);
    case "2018h30h-fe-am-52":return !(v[0]===3&&v[1]===4); // 60 appears twice.
    case "2018h30h-fe-am-53":return (v[0]%2===0||v[1]%2===0)&&v[1]!==2*v[0];
    case "2018h30h-fe-am-54":{const units=4*v[0]+5*v[1]+10*v[2];return units%(v[3]===2?2:12)===0;}
    case "2018h30a-fe-am-68":{
      const [z,l,q,d]=v;if(!(l<q&&q<z))return false;
      // D/5000 = 2*d. Divisibility checks an exact 5000-unit answer.
      const numerator=2*d*(z-q),denominator=z-l;return numerator%denominator===0&&numerator/denominator>=4;
    }
    case "2018h30a-fe-am-75":return ![[6,4],[6,14],[9,1],[9,6],[12,8]].some(([p,l])=>p===v[0]&&l===v[1]);
    default:assert(source in legacy2018DomainCounts);return true;
  }
}
function choose(body:GeneratedBody, expected:number) {
  const matches=body.choices.flatMap((blocks,i)=>{
    const value=number(blocks.map(text).join(""));return Math.abs(value-expected)<1e-9?[i]:[];
  });
  assert.equal(matches.length,1,"actual displayed choices must have one numerical answer");
  assert.equal(body.correctIndex,matches[0]);
  assert(body.explanation.includes(String(expected))||body.explanation.includes(String(Number(expected.toFixed(1)))),"explanation must show the derived result");
}
/** Independent solutions consume the displayed statements/tables, never a
 * production answer helper, answer ID, lookup map or review-derived result.
 */
export function legacy2018NumericOracle(source:string, body:GeneratedBody, values:number[]) {
  const prose=body.prompt.map(text).join("\n");
  const data=body.prompt.find(b=>b.type==="table");
  const rows=data?.type==="table"?data.rows:[];
  const key=source.replace("2018h30","").replace("-fe-am-","");
  assert.equal(body.choices.length,4);
  assert.equal(new Set(body.choices.map(c=>JSON.stringify(c))).size,4);
  switch(key) {
    case "h4":assert.match(prose,/入力記号、出力記号の集合が\{0，1\}/);decAGeneratorOracle(4,body,values);break;
    case "h17":decAFixedKnowledgeOracle(18,body,values);decAPathCounterexamples();break;
    case "h60":case "a7": {
      // These two exact-source aliases reuse the independently hand-reviewed
      // canonical fact table, not its production truth map. Annual original
      // choices/source images and a frozen all-binding content hash remain in
      // the 2018 fixture, so later canonical edits require annual re-review.
      assert.equal(body.prompt.length,1);assert(body.prompt[0].type==="paragraph");
      if(key==="h60")assert.match(prose,/^情報セキュリティ監査において、(可用性|機密性|完全性)を確認するチェック項目はどれか。$/);
      else assert.equal(prose,"プログラムのコーディング規則に規定する事項のうち、適切なものはどれか。");
      decAKnowledgeOracle(key==="h60"?48:9,body,values);break;
    }
    case "a77": {
      assert.match(prose,/先入先出法によって算出した当月度の売上原価/);assert(data?.type==="table");assert.deepEqual(data.columns,["日付","摘要","受入個数","払出個数","単価（円）"]);
      const scale=values[0],shift=values[1]*5;assert.deepEqual(rows,[["1日","前月繰越",String(100*scale),"",String(200+shift)],["5日","仕入",String(50*scale),"",String(215+shift)],["15日","売上","",String(70*scale),""],["20日","仕入",String(100*scale),"",String(223+shift)],["25日","売上","",String(60*scale),""],["30日","翌月繰越","",String(120*scale),""]]);
      const items:number[]=[];let soldCost=0,receiptsCost=0,receiptsQuantity=0,averageQuantity=0,averageCost=0,movingCost=0,soldQuantity=0;
      for(const row of rows.slice(0,5)){
        if(row[2]){const q=number(row[2]),price=number(row[4]);for(let i=0;i<q;i++)items.push(price);receiptsCost+=q*price;receiptsQuantity+=q;averageQuantity+=q;averageCost+=q*price;}
        if(row[3]){const q=number(row[3]);assert(items.length>=q);for(let i=0;i<q;i++)soldCost+=items.shift()!;const average=averageCost/averageQuantity;movingCost+=q*average;averageCost-=q*average;averageQuantity-=q;soldQuantity+=q;}
      }
      assert.equal(items.length,number(rows[5][3]));assert.equal(soldQuantity,130*scale);const monthlyCost=receiptsCost/receiptsQuantity*soldQuantity;
      close(movingCost,Math.round(movingCost));close(monthlyCost,Math.round(monthlyCost));
      const shown=body.choices.map(c=>number(c.map(text).join("")));assert.deepEqual(shown,[soldCost-160*scale,soldCost,Math.round(movingCost),Math.round(monthlyCost)]);choose(body,soldCost);assert(body.explanation.includes(`${Math.round(movingCost)}円は移動平均法`));assert(body.explanation.includes(`${Math.round(monthlyCost)}円は月次総平均法`));break;
    }
    case "h41": {
      const subjects=["SQLインジェクション","クロスサイトスクリプティング","ディレクトリトラバーサル","バッファオーバーフロー"],match=prose.match(/^(.+)による被害を防ぐ方法として、適切なものはどれか。$/);assert(match);const asked=match[1];
      assert.equal(asked,subjects[values[0]]);const shown=body.choices.map(c=>c.map(text).join(""));assert.deepEqual(shown,legacy2018DecemberBaselineChoices[source]);
      // Independently reviewed protection boundaries: SQL syntax vs bound data,
      // HTML output context, authorized path, and allocated memory capacity.
      const protections=new Map(shown.map((s,i)=>[s,subjects[i]]));
      assert.deepEqual(shown.flatMap((s,i)=>protections.get(s)===asked?[i]:[]),[body.correctIndex]);assert(body.explanation.includes(shown[body.correctIndex!]));break;
    }
    case "h65": {
      const statements=["企業が社会的な責任を果たすために、環境・社会・倫理などへ配慮して活動する考え方を何というか。","製品などを所定の環境基準に照らして審査し、環境ラベルの使用を認める取組はどれか。","事業を実施する前に、環境に及ぼす影響を調査・予測・評価する取組を何というか。","国や地方公共団体などが、環境への配慮を積極的に行っていると評価された製品・サービスを選んで購入する取組を何というか。"],terms=["CSR","エコマーク認定","環境アセスメント","グリーン購入"];
      assert.equal(prose,statements[values[0]]);const asked=statements.indexOf(prose);assert(asked>=0);const shown=body.choices.map(c=>c.map(text).join(""));assert.deepEqual(shown,terms);assert.deepEqual(shown.flatMap((label,i)=>label===terms[asked]?[i]:[]),[body.correctIndex]);assert(body.explanation.includes(terms[asked]));break;
    }
    case "h74": {
      const concepts=["コンテンツ管理","ロングテール","アフィリエイト","ドロップシッピング"],match=prose.match(/^(.+)の説明はどれか。$/);assert(match);const asked=match[1];assert.equal(asked,concepts[values[0]]);
      const shown=body.choices.map(c=>c.map(text).join(""));assert.deepEqual(shown,legacy2018DecemberBaselineChoices[source]);
      const facts=new Map(shown.map((description,i)=>[description,concepts[i]]));assert.deepEqual(shown.flatMap((s,i)=>facts.get(s)===asked?[i]:[]),[body.correctIndex]);assert(body.explanation.includes(shown[body.correctIndex!]));break;
    }
    case "h24": {
      assert(data?.type==="table");assert.deepEqual(data.columns,["伝票番号","注文日","商品コード","数量","顧客コード"]);assert.deepEqual(rows,[["（文字）","（文字）","（文字）","（数値）","（文字）"]]);
      const conditions=["伝票番号の連番に抜けがないか","同一の伝票番号が重複していないか","注文日が指定された年月日の文字の並びか","注文日が入力日以前の営業日かどうか"],checks=["シーケンスチェック","重複チェック","フォーマットチェック","論理チェック"];
      assert.equal(prose.trim(),`次のような注文データが入力されたとき、${conditions[values[0]]}を検査するチェックはどれか。`);
      const displayed=body.choices.map(c=>c.map(text).join(""));assert.deepEqual(displayed,checks);
      // Frozen fact categories: continuity, same key, character layout and
      // business/date relation. The generator's index is never used as fact.
      const criterion=conditions.indexOf(conditions.find(c=>prose.includes(c))!);
      assert.deepEqual(displayed.flatMap((label,i)=>checks.indexOf(label)===criterion?[i]:[]),[body.correctIndex]);assert(body.explanation.includes(checks[criterion]));break;
    }
    case "a31": {
      assert.match(prose,/伝送時間は何秒/);const rate=Number(prose.match(/([\d.]+)Mビット／秒/)![1]),megabytes=Number(prose.match(/用いて(\d+)Mバイト/)![1]),efficiency=Number(prose.match(/伝送効率を(\d+)％/)![1]);
      assert.equal(megabytes,values[0]*3);assert.equal(rate,values[1]*1.5);assert.equal(efficiency,50);
      // Accumulate eight bits per byte; dividing effective bit/s cancels M.
      let megabits=0;for(let i=0;i<megabytes;i++)megabits+=8;
      const seconds=megabits*100/(rate*efficiency);assert(Number.isInteger(seconds));
      assert.deepEqual(body.choices.map(c=>Number(c.map(text).join(""))),[seconds/8,seconds/4,seconds/2,seconds]);choose(body,seconds);break;
    }
    case "h32": {
      assert.match(prose,/PCに割り振ってはいけないIPアドレス/);
      const toInteger=(s:string)=>s.split(".").reduce((n,o)=>n*256+Number(o),0)>>>0;
      const address=prose.match(/ネットワークアドレス：(\d+\.\d+\.\d+\.\d+)/)![1],maskText=prose.match(/サブネットマスク：(\d+\.\d+\.\d+\.\d+)/)![1],network=toInteger(address),mask=toInteger(maskText),hostMask=(~mask)>>>0,broadcast=(network|hostMask)>>>0;
      assert.equal((network&mask)>>>0,network);assert.equal(hostMask,2**values[0]-1);assert.equal(network%256,(hostMask+1)*values[1]);assert.equal(maskText,`255.255.255.${255-hostMask}`);
      const hosts=new Set(Array.from({length:hostMask-1},(_,i)=>network+i+1));
      const shown=body.choices.map(c=>toInteger(c.map(text).join("")));
      assert.deepEqual(shown.slice(0,3).map(n=>n-network),[1,4,hostMask-1]);assert.equal(shown[3],values[2]?broadcast:network);
      const forbidden=shown.flatMap((n,i)=>!hosts.has(n)?[i]:[]);assert.deepEqual(forbidden,[body.correctIndex]);assert(body.explanation.includes(body.choices[forbidden[0]].map(text).join("")));break;
    }
    case "a37": {
      assert.match(prose,/暗号文が与えられている/);assert.match(prose,/ブルートフォース攻撃/);assert.match(prose,/試行回数の最大値/);
      const bits=Number(prose.match(/AES-(\d+)/)![1]);assert.equal(bits,[128,192,256][values[0]]);
      // Multiply two choices per key bit instead of importing a key-count helper.
      let possibilities=1n;for(let i=0;i<bits;i++)possibilities*=2n;
      const shown=body.choices.map(c=>c.map(text).join(""));assert.deepEqual(shown,[String(bits),`2^${bits/2}`,`2^${bits-1}`,`2^${bits}`]);
      const numeric=shown.map(s=>s.startsWith("2^")?1n<<BigInt(s.slice(2)):BigInt(s));
      assert.deepEqual(numeric.flatMap((n,i)=>n===possibilities?[i]:[]),[body.correctIndex]);assert(body.explanation.includes(`2^${bits}回`));break;
    }
    case "h1": {
      assert.match(prose,/負数を2の補数/);assert.match(prose,/商は、絶対値の小数点以下を切り捨て/);
      const width=number(prose.match(/最下位(\d+)ビット/)![1]),bits=prose.match(/“([01]+)”/)![1],divisor=number(prose.match(/整数値を(\d+)で割った/)![1]);
      assert.equal(width,values[0]);assert.equal(bits.length,width);assert.equal(divisor,2**width);
      const unsigned=[...bits].reduce((n,b)=>n*2+number(b),0);assert.equal(unsigned,2*values[1]+1);
      const signed=Array.from({length:256},(_,i)=>i-128).filter(n=>((n%divisor)+divisor)%divisor===unsigned);
      const remainders=signed.map(n=>({n,r:n-(n<0?-Math.floor(-n/divisor):Math.floor(n/divisor))*divisor}));
      const truth=body.choices.map((blocks,i)=>{
        const s=blocks.map(text).join("");const r=Number(s.match(/(?:ならば|かかわらず)(−?\d+)$/)![1].replace("−","-"));
        const domain=remainders.filter(x=>s.includes("正ならば")?x.n>0:s.includes("負ならば")?x.n<0:true);
        assert(domain.length>0);return domain.every(x=>x.r===r)?i:-1;
      }).filter(i=>i>=0);assert.deepEqual(truth,[body.correctIndex]);break;
    }
    case "h52": {
      assert.match(prose,/各プログラムの開発工数は、全て等しい/);
      const total=number(prose.match(/([\d,]+)本のプログラム/)![1]),done=number(prose.match(/うち([\d,]+)本が完成/)![1]);
      assert.equal(done,values[0]*600);assert.equal(total,3000);assert(data?.type==="table");assert.deepEqual(data.columns,["基本設計","詳細設計","プログラム設計","プログラミング","テスト"]);assert.equal(rows.length,1);assert.equal(rows[0].length,5);
      const weights=rows[0].map(number);assert.deepEqual(weights.slice(0,3),[0.08,0.16,0.20]);close(weights.reduce((a,b)=>a+b,0),1);close(weights[3],values[1]/20);close(weights[4],(56-values[1]*5)/100);
      const milestones=[1,1,1,done/total,0],progress=weights.reduce((a,w,i)=>a+w*milestones[i],0)*100;close(progress,Math.trunc(progress+1e-8));choose(body,progress);break;
    }
    case "h53": {
      const work=number(prose.match(/工数が([\d,]+)人月/)![1]),coefficient=number(prose.match(/期間＝([\d.]+)×/)![1]);
      assert.match(prose,/工数の1\/3乗/);assert.equal(work,values[0]**6);assert.equal(coefficient,values[1]/2);
      let root=1;while(root*root*root<work)root++;assert.equal(root*root*root,work);choose(body,root*coefficient);break;
    }
    case "h54": {
      const coefficient=number(prose.match(/補正係数は([\d.]+)/)![1]);close(coefficient,values[3]/4);
      assert.deepEqual(rows.map(r=>number(r[2])),[4,5,10]);assert.deepEqual(rows.map(r=>r[0]),["外部入力","外部出力","内部論理ファイル"]);
      let subtotal=0;for(const [i,row] of rows.entries()){assert.equal(number(row[1]),values[i]);for(let n=0;n<number(row[1]);n++)subtotal+=number(row[2]);}
      choose(body,subtotal*coefficient);break;
    }
    case "h67": {
      assert.equal(rows.length,6);const v=rows.map(r=>r.slice(1).map(number));
      assert.deepEqual(v.map(r=>r.slice(0,2)),[[20,0],[40,0],[0,10],[0,20],[20,10],[40,20]]);
      const economies=v[1][2]/v[1][0]<v[0][2]/v[0][0]&&v[3][2]/v[3][1]<v[2][2]/v[2][1];
      const joint=v[4][2]<v[0][2]+v[2][2]&&v[5][2]<v[1][2]+v[3][2];
      assert.equal(economies,Boolean(values[0]));assert.equal(joint,Boolean(values[1]));assert.equal(v[0][2],1500+100*values[2]);
      const truth=body.choices.map((c,i)=>{const s=c.map(text).join("");const e=s.includes("スケールメリットはある")||s.includes("ともにある"),j=s.includes("シナジー効果はある")||s.includes("ともにある");return e===economies&&j===joint?i:-1;}).filter(i=>i>=0);
      assert.deepEqual(truth,[body.correctIndex]);assert.match(body.explanation,/単位コスト/);break;
    }
    case "h78": {
      assert.deepEqual(rows.map(r=>r[0]),["1","4","5","7","10","30"]);
      assert.deepEqual(rows.map(r=>[r[2],r[3],r[4]]),[[String(10*values[0]),"",String(100+10*values[1])],[String(40*values[0]),"",String(120+10*values[1])],["",String(30*values[0]),"—"],[String(30*values[0]),"",String(130+10*values[1])],[String(10*values[0]),"",String(110+10*values[1])],["",String(30*values[0]),"—"]]);
      const stock:number[]=[];for(const row of rows){if(row[2])for(let n=0;n<number(row[2]);n++)stock.push(number(row[4]));if(row[3]){assert(stock.length>=number(row[3]));stock.splice(0,number(row[3]));}}
      assert.equal(rows.length,6);assert.equal(number(rows[0][2]),10*values[0]);assert.equal(number(rows[0][4]),100+10*values[1]);assert.equal(stock.length,30*values[0]);
      choose(body,stock.reduce((a,b)=>a+b,0));break;
    }
    case "a1": {
      assert.match(prose,/16進数の小数/);assert.match(prose,/10進数の分数/);const s=prose.match(/小数0\.([0-9A-F]+)/)![1];assert.equal(s,`${values[0]}${values[1]}8`);
      const numerator=BigInt(`0x${s}`),denominator=16n**BigInt(s.length);
      const truth=body.choices.map((c,i)=>{const [a,b]=c.map(text).join("").split("/").map(BigInt);return a*denominator===b*numerator?i:-1;}).filter(i=>i>=0);
      assert.deepEqual(truth,[body.correctIndex]);break;
    }
    case "a4": {
      assert.match(prose,/出現頻度の異なる/);assert.match(prose,/ハフマン符号化/);assert.match(prose,/aに入る符号/);assert(data?.type==="table");assert.deepEqual(data.columns,["文字","出現頻度（%）","符号"]);assert.deepEqual(rows.map(r=>r[0]),["A","B","C","D","E"]);assert.equal(rows[3][2],"空欄a");
      const frequencies=rows.map(r=>number(r[1])),reviewed=[26,25,24,11+values[2],14-values[2]];if(values[0])[reviewed[0],reviewed[3]]=[reviewed[3],reviewed[0]];assert.deepEqual(frequencies,reviewed);assert.equal(frequencies.reduce((a,b)=>a+b),100);assert.equal(new Set(frequencies).size,5);
      const known=[
        [["00","01","10","空欄a","111"],["01","00","11","空欄a","101"],["10","11","00","空欄a","011"],["11","10","01","空欄a","001"]],
        [["110","01","10","空欄a","111"],["100","00","11","空欄a","101"],["010","11","00","空欄a","011"],["000","10","01","空欄a","001"]],
      ];assert.deepEqual(rows.map(r=>r[2]),known[values[0]][values[1]]);
      const leaves=[...frequencies];let optimalCost=0;while(leaves.length>1){leaves.sort((a,b)=>a-b);const joined=leaves.shift()!+leaves.shift()!;optimalCost+=joined;leaves.push(joined);}
      const truth=body.choices.flatMap((choice,i)=>{
        const word=choice.map(text).join("");assert.match(word,/^[01]{2,3}$/);const all=rows.map((r,j)=>j===3?word:r[2]);
        const prefixFree=all.every((a,j)=>all.every((b,k)=>j===k||!b.startsWith(a)));
        const cost=all.reduce((sum,code,j)=>sum+code.length*frequencies[j],0);
        return prefixFree&&cost===optimalCost?[i]:[];
      });assert.deepEqual(truth,[body.correctIndex]);assert(body.explanation.includes(body.choices[truth[0]].map(text).join("")));assert.equal(optimalCost,225);break;
    }
    case "a5": {
      assert.match(prose,/ENQ n：待ち行列にデータnを挿入/);assert.match(prose,/DEQ：待ち行列からデータを取り出す/);assert.match(prose,/次にDEQ操作を行った/);
      const sequence=prose.match(/空の待ち行列に対し、(.+)の操作を行った/)![1].split("、");assert.equal(sequence.length,10);assert.equal(sequence[8],values[0]?`ENQ ${values[1]+6*values[2]}`:"DEQ");
      const queue:number[]=[],added:number[]=[];for(const op of sequence){if(op==="DEQ"){assert(queue.length>0);queue.shift();}else{const found=op.match(/^ENQ (\d+)$/);assert(found);const n=number(found[1]);queue.push(n);added.push(n);}}
      assert.deepEqual(added,Array.from({length:values[0]?7:6},(_,i)=>values[1]+i*values[2]));assert(queue.length>0);choose(body,queue[0]);break;
    }
    case "a9": {
      const clock=number(prose.match(/周波数が(\d+)MHz/)![1]);assert.equal(clock,(values[0]?200:350)*values[1]);
      const instructions=rows.flatMap(row=>Array.from({length:number(row[2])*10},()=>number(row[1])));assert.equal(instructions.length,1000);
      choose(body,clock*1000/instructions.reduce((a,b)=>a+b,0));assert.match(body.explanation,/Million Instructions Per Second/);break;
    }
    case "a11": {
      assert.match(prose,/データバス幅(?:2のn乗|2ⁿ)ビット/);
      let width=number(prose.match(/とき、(\d+)ビット/)![1]);assert.equal(width,2**values[0]);let exponent=0;while(width>1){assert.equal(width%2,0);width/=2;exponent++;}
      const extra=number(prose.match(/ビットがn＋(\d+)/)![1]);assert.equal(extra,2);choose(body,exponent+extra);break;
    }
    case "a54": {
      const fp=number(prose.match(/ところ、(\d+)FP/)![1]),training=number(prose.match(/合計で(\d+)人月/)![1]),percent=number(prose.match(/工数の(\d+)%/)![1]),productivity=number(prose.match(/当たり(\d+)FP/)![1]);
      assert.equal(fp,values[0]*100);assert.equal(training,values[1]*10);assert.equal(percent,values[2]*10);assert.match(prose,/開発と導入・教育を合わせた工数/);
      const jobs=fp/productivity+training,manager=jobs*percent/100;choose(body,jobs+manager);break;
    }
    case "a57": {
      assert.match(prose,/できる、1か月のサービス/);assert.match(prose,/午前8時から午後10時/);assert.match(prose,/計画停止は行わない/);assert.match(prose,/最大何時間/);
      const days=number(prose.match(/営業日数は(\d+)日/)![1]),available=number(prose.match(/可用性を([\d.]+)%以上/)![1]);assert.equal(days,values[0]*10);assert.equal(available,100-values[1]/2);
      const totalMinutes=days*(22*60-8*60),downTenths=1000-Math.round(available*10),allowedMinutes=totalMinutes*downTenths/1000;choose(body,allowedMinutes/60);break;
    }
    case "a68": {
      assert.match(prose,/需要との関係が1次式/);const list=body.prompt.find(b=>b.type==="list");assert(list?.type==="list");assert(list.ordered);assert.equal(list.items.length,3);
      const p0=number(list.items[0].match(/(\d+)円/)![1]),p1=number(list.items[1].match(/(\d+)円/)![1]),q1=number(list.items[1].match(/需要は(\d+)個/)![1]),p2=number(list.items[2].match(/(\d+)円/)![1]);
      assert.deepEqual([p0,p1,p2,q1],[values[0]*500,values[1]*500,values[2]*500,values[3]*10000]);
      const slope=(q1-0)/(p1-p0),intercept=-slope*p0;choose(body,slope*p2+intercept);break;
    }
    case "a75": {
      const profit=number(prose.match(/利益を(\d+)円/)![1]),loss=number(prose.match(/当たり(\d+)円の廃棄/)![1]);assert.equal(profit,values[0]*100);assert.equal(loss,values[1]*100);
      assert.match(prose,/利益の期待値が最大/);assert.equal(rows.length,4);assert(data?.type==="table");
      assert.deepEqual(rows.map(r=>r[0]),["4","5","6","7"]);
      const outcomes=rows.map(row=>{const stock=number(row[0]);let hundredfold=0,probability=0;for(let j=1;j<row.length;j++){if(row[j]==="—")continue;const percent=number(row[j].replace("%","")),sales=number(data.columns[j]);assert(sales<=stock);hundredfold+=percent*(sales*profit-(stock-sales)*loss);probability+=percent;}assert.equal(probability,100);return hundredfold/100;});
      const best=Math.max(...outcomes);assert.equal(outcomes.filter(n=>n===best).length,1);const candidate=rows[outcomes.indexOf(best)][0];assert.equal(body.choices[body.correctIndex!].map(text).join(""),candidate);assert(body.explanation.includes(`${best}円`));break;
    }
    default: assert.fail(`Unregistered independent oracle: ${source}`);
  }
}
