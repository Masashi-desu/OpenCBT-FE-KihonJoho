import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import { readBookletFigure, validateBookletFigureExtensions } from '../../../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Block, Question } from '../../../src/core/types';
import { spring2014Pm01To04Specs as specs } from '../../../scripts/legacy-2014-spring-pm-01-04-specs';
import { legacy2014SpringPm0104Figures as figures } from '../../../src/core/generators/legacy-2014-spring-pm-01-04-figures';
import { legacy2014SpringPm0104Renderers as renderers } from '../../../src/ui/Legacy2014SpringPm0104Figures';
import originals from '../../../src/core/generators/legacy-2014-spring-pm-01-04-banks.json';

const marks='アイウエオカキクケ';
const official=[['エ','イ','イカ'],['オ','キ','ア','ア','ア'],['オ','ア','ウ','イ','イ'],['ウ','エ','ウ','イ']];
const locations=[[6,7,8,9,10,11],[12,13,14,15],[16,17,18,19,20],[21,22,23,24]];
const bankIndices=[[0,1,2],[0,1,1,2,1],[0,1,1,2,3],[0,1,2,3]];
const text=(body:GeneratedBody)=>body.prompt.flatMap(b=>'text'in b?[b.text]:[]).join('\n');
const variants=(n:number)=>[0,1,2,3].map(i=>specs[n-1].definition.build([i]));
function captures(s:string,re:RegExp) {
  const match=s.match(re);assert(match,re.toString());return match.slice(1);
}
function table(body:GeneratedBody,caption:string) {
  const block=body.prompt.find(b=>b.type==='table'&&b.caption.startsWith(caption));
  assert(block?.type==='table',caption);return block;
}
function diagram(body:GeneratedBody,suffix:string) {
  const block=body.prompt.find(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile.endsWith(suffix));
  assert(block?.type==='diagram');return block;
}
function render(block:Block) {
  assert(block.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene;
  const d=figures.find(f=>f.profile===profile), renderer=renderers.find(r=>r.profile===profile);
  assert(d&&renderer);
  assert.equal(readBookletFigure(d,values),block.alt);
  const html=renderToStaticMarkup(createElement(renderer.component,{values,caption:block.caption}));
  const structure=profile.endsWith('ip-answer-table')?['<table','<caption','scope="row"','scope="colgroup"']:['role="img"','<desc'];
  for(const required of [...structure,'diagram-scroll','var(--diagram-ink)','--image-scale',profile])
    assert(html.includes(required),required);
  return html;
}
function ipRows(html:string){
  const headings=[...html.matchAll(/data-ip-heading="(\d+)">(\d+)<\/th>/g)];
  assert.deepEqual(headings.map(m=>m.slice(1)),Array.from({length:20},(_,i)=>[String(i+1),String(i+1)]));
  return [...html.matchAll(/<tr data-ip-row="([アイウエ])">([\s\S]*?)<\/tr>/g)].map(([,mark,row])=>{
    const cells=[...row.matchAll(/<td data-ip-column="(\d+)" data-ip-value="(\d+)"(?: data-ip-thread-end="(true)")?[^>]*>(\d+)<\/td>/g)];
    assert.equal(cells.length,20);
    const separators:number[]=[];
    const values=cells.map(([,column,value,separator,visible],i)=>{
      assert.equal(Number(column),i+1);
      assert.equal(value,visible);
      if(separator)separators.push(Number(column));
      return Number(visible);
    });
    return {mark,values,separators};
  });
}
function group(body:GeneratedBody) {
  assert(body.answerParts&&body.partAnswers);
  return body.partAnswers.map(answer=>{
    assert(answer.kind==='choice'||answer.kind==='unordered');
    const ids=answer.kind==='choice'?[answer.partId]:answer.partIds;
    const bank=body.answerParts!.find(part=>part.id===ids[0])!.choiceIds;
    for(const id of ids)assert.deepEqual(body.answerParts!.find(part=>part.id===id)?.choiceIds,bank);
    const correct=(answer.kind==='choice'?[answer.choiceId]:answer.choiceIds).map(id=>bank.indexOf(id));
    const options=bank.map(id=>{
      const [block]=body.choices[Number(id.split('-').at(-1))-1];
      if(block.type==='diagram'){
        const rows=ipRows(render(block));assert.equal(rows.length,1);
        return rows[0].values.join(' ');
      }
      return block.type==='table'?block.rows[0].join(' '):'text'in block?block.text:'';
    });
    return {ids,bank,correct,options};
  });
}
function truths(answer:ReturnType<typeof group>[number],isCorrect:(option:string)=>boolean){
  assert.deepEqual(answer.options.flatMap((choice,i)=>isCorrect(choice)?[i]:[]),[...answer.correct].sort((a,b)=>a-b));
}

test('原19頁・18欄・全公式選択肢を保持し、16実条件356候補を検査',()=>{
  assert.deepEqual(validateBookletFigureExtensions([{scope:'2014-spring-pm',figures}]),figures);
  assert.deepEqual(figures.map(f=>f.profile),renderers.map(r=>r.profile));
  const banks=[originals.q1,originals.q2,originals.q3,originals.q4];
  let slots=0,candidates=0;
  for(const [i,s] of specs.entries()){
    const n=i+1,d=s.definition,base=s.original;
    assert.equal(d.source,'2014h26h-fe-pm-'+n);
    assert.deepEqual(s.pages,locations[i]);
    assert.deepEqual(Object.keys(s.originalPageAlt).map(Number),s.pages);
    assert(Object.values(s.originalPageAlt).every(alt=>alt.length>100&&!alt.includes('choice-value-')));
    assert.deepEqual(group(base).map(g=>g.correct.map(key=>marks[key]).join('')),official[i]);
    assert.deepEqual(group(base).map(g=>g.options),bankIndices[i].map(j=>banks[i][j]));
    assert.deepEqual(d.reference,[0]);
    assert.deepEqual(d.fields.map(f=>[f.minimum,f.maximum]),[[0,3]]);
    const all=variants(n);
    assert.equal(new Set(all.map(q=>JSON.stringify(q.prompt))).size,4);
    assert.equal(new Set(all.map(q=>JSON.stringify(group(q).map(g=>g.correct.map(i=>g.options[i]))))).size,4);
    slots+=base.answerParts!.length;
    for(const q of all){
      assert.deepEqual(q.prompt.map(b=>b.type),base.prompt.map(b=>b.type));
      assert.deepEqual(q.answerParts?.map(part=>part.choiceIds.length),base.answerParts?.map(part=>part.choiceIds.length));
      assert.equal(q.choices.length,base.choices.length);
      for(const answer of group(q)){
        assert.equal(new Set(answer.options).size,answer.options.length);
        assert(answer.correct.every(index=>index>=0&&index<answer.options.length));
        candidates+=answer.options.length;
      }
      q.prompt.filter(b=>b.type==='diagram').forEach(render);
    }
    for(const bad of [[],[-1],[4],[0.3],[NaN],[0,0],Array(1),Object.assign([0],{extra:1})])
      assert.throws(()=>d.build(bad),/PARAMETER_CONSTRAINT/);
  }
  assert.equal(slots,18);
  assert.equal(candidates,356);
});

test('問1は実表示のCIA・全7脅威・閾値と事故対策を独立に照合',()=>{
  const incidentChecks=[
    [/返却された後.*プロジェクトXに貸与/,/台帳.*削除日.*実施者|返却された開発用PC.*全データを完全消去/],
    [/削除済み領域からデータを復元/,/復元できない方法.*USBメモリ.*消去|実施記録を確認.*未確認の媒体は返却しない/],
    [/復号用の情報.*同じ袋/,/鍵に関する情報.*別の経路|容器に固定.*所在を確認/],
    [/不要な外部接続用サービス.*早い段階で検知する仕組みもなかった/,/サービスを停止.*到達を遮断|アクセスを監視.*管理者へ通知/],
  ] as const;
  for(const body of variants(1)){
    const [cia,count,mitigations]=group(body);
    const valueRows=table(body,'表2').rows;
    const reasons=valueRows.find(r=>r[0]==='3')![5].split('\n');
    const classify=(row:string)=>row.includes('漏れた')?'C':row.includes('不整合')?'I':row.includes('利用できない')?'A':'';
    const expected=reasons.slice(1).map(classify);
    truths(cia,option=>captures(option,/（ii）([CIA])、（iii）([CIA])/).join('')===expected.join(''));
    const limit=Number(captures(text(body),/全て(\d+)以下ならばリスクを受容/)[0]);
    const ciaValues=valueRows.find(row=>row[0]==='4')!.slice(2,5).map(Number);
    const threatRows=table(body,'表3').rows, vulnerabilityRows=table(body,'表4').rows, riskTable=table(body,'表5').rows;
    assert.equal(threatRows.length,7);assert.equal(vulnerabilityRows.length,7);
    let risks=0;
    for(const [j,[,id,,number]] of threatRows.entries()){
      const control=vulnerabilityRows.find(row=>row[0]===id)!;
      const measures=control[2].includes('対策なし')?0:control[2].split('\n').length;
      const vuln=Number(control[3]);
      assert.equal(vuln,Math.max(1,3-measures));
      const scores=ciaValues.map(value=>Array.from({length:Number(number)},()=>value).reduce((sum,v)=>sum+v,0)*vuln);
      if(j<2)assert.deepEqual(riskTable[j].slice(9).map(Number),scores);
      else assert(riskTable[j].slice(9).every(item=>item==='［網掛け］'));
      if(scores.some(score=>score>limit))risks++;
    }
    truths(count,option=>Number(option)===risks);
    const checks=incidentChecks.filter(([incident])=>incident.test(text(body)));
    assert.equal(checks.length,1);
    truths(mitigations,option=>checks[0][1].test(option));
    assert.equal(mitigations.ids.length,2);
    const q={choices:body.choices.map((_,i)=>({id:'choice-value-'+(i+1)})),
      answerParts:body.answerParts,correctAnswer:{parts:body.partAnswers}} as Question;
    validateAnswerDefinition(q);
    const [a,b]=mitigations.ids, [x,y]=mitigations.correct.map(index=>mitigations.bank[index]);
    const fixed=Object.fromEntries([cia,count].map(g=>[g.ids[0],g.bank[g.correct[0]]]));
    assert.equal(gradeAnswer(q,{selectedPartChoices:{...fixed,[a]:x,[b]:y}}).outcome,'correct');
    assert.equal(gradeAnswer(q,{selectedPartChoices:{...fixed,[a]:y,[b]:x}}).outcome,'correct');
    assert.equal(gradeAnswer(q,{selectedPartChoices:{...fixed,[a]:x,[b]:x}}).outcome,'incorrect');
    assert.equal(gradeAnswer(q,{selectedPartChoices:{...fixed,[a]:x}}).outcome,'unanswered');
  }
});

test('問2は描画のビット欄を使い16文字の命令を独立に実行',()=>{
  for(const body of variants(2)){
    const [addressAnswer,a,b,c,d]=group(body);
    const html=render(diagram(body,'instruction-word'));
    const positions=[...html.matchAll(/data-word-field="([^"]+)" data-bit-hi="(\d+)" data-bit-lo="(\d+)"/g)];
    assert.deepEqual(positions.map(p=>p.slice(1)),[['op','15','12'],['r 又は m','11','10'],['x','9','8'],['b','7','6'],['d','5','0']]);
    const binary=(value:number)=>value.toString(2).padStart(16,'0');
    const hex=(value:string)=>Number.parseInt(value,16);
    const split=(word:number)=>positions.map(pos=>Number.parseInt(binary(word).slice(15-Number(pos[2]),16-Number(pos[3])),2));
    const address=(word:number,registers:number[])=>{
      const [,,x,y,offset]=split(word);
      return [x,y].filter(index=>index!==0).reduce((sum,index)=>sum+registers[index],offset);
    };
    const first=table(body,'図2').rows.map(row=>hex(row[1]));
    const input=hex(captures(text(body),/命令：([0-9A-F]{4})h/)[0]);
    truths(addressAnswer,value=>hex(value)===address(input,first));
    const registers=table(body,'図3').rows.map(row=>hex(row[1]));
    const memory=new Map(table(body,'図4').rows.filter(row=>row[0]!=='⋮').map(([p,v])=>[hex(p),hex(v)]));
    let pc=16, cc='00';
    const observed=new Map<number,{r:number[];taken:boolean}>();
    for(let step=0;pc<=22;step++){
      assert(step<8);
      const word=memory.get(pc);
      assert(word!==undefined);
      const [op,r]=split(word), destination=address(word,registers);
      const mask=binary(r).slice(-2);
      const taken=op===4&&[...mask].some((value,j)=>value==='1'&&cc[j]==='1');
      if(op!==4){
        const operand=memory.get(destination);
        assert(operand!==undefined);
        const right=binary(operand);
        const output=[...binary(registers[r])].map((left,j)=>Number(op===1?left==='1'||right[j]==='1':
          op===2?left==='1'&&right[j]==='1':left!==right[j])).join('');
        registers[r]=Number.parseInt(output,2);cc=output.includes('1')?'01':'10';
      }
      observed.set(pc,{r:[...registers],taken});
      pc=taken?destination:pc+1;
    }
    truths(a,value=>hex(value)===observed.get(17)?.r[0]);truths(b,value=>hex(value)===observed.get(17)?.r[1]);
    truths(c,value=>value===(observed.get(19)?.taken?'分岐する':'分岐しない'));
    truths(d,value=>hex(value)===observed.get(22)?.r[2]);
    assert.equal(a.bank.join(),b.bank.join());assert.equal(b.bank.join(),d.bank.join());
    assert.match(text(body),/解答は重複して選んでもよい/);
  }
});

test('問3は整数探索、添字の依存関係、並列書込み先の交差で全択を検算',()=>{
  for(const [i,body] of variants(3).entries()){
    const [speed,prior,following,conditional,indices]=group(body);
    const [prep,calc,output,target]=captures(text(body),/処理時間の割合が(\d+)：(\d+)：(\d+)の場合，.*高速化率を(\d+)以上/).map(Number);
    let minimum=1;
    while(target*((prep+output)*minimum+calc)>(prep+calc+output)*minimum){minimum++;assert(minimum<=20);}
    truths(speed,option=>Number(option)===minimum);
    const dep=render(diagram(body,'loop-dependencies'));
    const programs=[...dep.matchAll(/data-program="\d+" data-loop-range="([^"]+)" data-loop-assignment="([^"]+)"/g)];
    assert.equal(programs.length,3);
    const [before,after]=programs.slice(0,2).map(([,range,assignment])=>{
      const [first]=captures(range,/i: (\d+), i ≦ n, 1/).map(Number);
      const [offset]=captures(assignment,/a\[i([−+]1)\]/).map(term=>Number(term.replace('−','-')));
      const current={write:first,read:first+offset}, next={write:first+1,read:first+1+offset};
      assert.notEqual(current.write,next.write);
      assert.notEqual(current.read,next.read);
      return current.write===next.read?/更新した値が次の繰返しで参照/:/参照した値が次の繰返しで更新/;
    });
    truths(prior,option=>before.test(option));truths(following,option=>after.test(option));
    const [,range,assignment]=programs[2];
    assert.equal(assignment,'a[i] ← a[i+m] + b[i]');
    const [offset]=captures(range,/^i: 1, i ≦ n(−[123])?, 1$/);
    const upper=(n:number)=>n-Number(offset?.slice(1)??'0');
    truths(conditional,option=>{
      const [sign,bound]=captures(option,/^m (≧|≦) (0|n(?:−[123])?)$/);
      for(let n=6;n<=21;n++){
        const end=upper(n), threshold=bound==='0'?0:n-Number(bound.slice(2)||'0');
        const written=Array.from({length:end},(_,j)=>j+1);
        for(let m=-2*n;m<=3*n;m++){
          if(m===0||!(sign==='≧'?m>=threshold:m<=threshold))continue;
          if(written.some(index=>written.includes(index+m)))return false;
        }
      }
      return true;
    });
    const allRows=diagram(body,'ip-answer-table'), full=ipRows(render(allRows));
    assert.deepEqual(full.map(row=>row.mark),['ア','イ','ウ','エ']);
    assert.deepEqual(full.map(row=>row.values.join(' ')),indices.options);
    const oneRowChoices=indices.bank.map(id=>body.choices[Number(id.split('-').at(-1))-1][0]);
    for(const [j,choice] of oneRowChoices.entries()){
      assert(choice.type==='diagram'&&choice.scene.kind==='source_figure');
      assert.deepEqual(choice.scene.values,[i,j+1]);
      assert(choice.alt.includes(full[j].mark+'：')&&choice.alt.includes('i＝1〜20'));
      assert.deepEqual(ipRows(render(choice)),[full[j]]);
    }
    const four=render(diagram(body,'indirect-writes'));
    const ranges=[...four.matchAll(/data-loop-first="(\d+)" data-loop-last="(\d+)"/g)].map(m=>[Number(m[1]),Number(m[2])]);
    assert.equal(ranges.length,4);
    assert(full.every(row=>row.separators.join()===ranges.slice(0,-1).map(range=>range[1]).join()));
    assert.deepEqual(ranges.flatMap(([lo,hi])=>Array.from({length:hi-lo+1},(_,j)=>lo+j)),Array.from({length:20},(_,j)=>j+1));
    truths(indices,choice=>{
      const cells=choice.split(' ').map(Number);
      assert.equal(cells.length,20);
      const targets=ranges.map(([lo,hi])=>cells.slice(lo-1,hi));
      return targets.every((a,j)=>targets.slice(j+1).every(b=>!a.some(value=>b.includes(value))));
    });
    if(i>0)assert(new Set(indices.options[indices.correct[0]].split(' ')).size<20);
    assert.match(text(body),/スレッド間で共有され，変数iはスレッドごと/);
    assert.match(text(body),/オーバヘッドは考慮しない/);
    const example=render(diagram(body,'split-loop'));
    const exampleStops=[...example.matchAll(/data-loop-first="(\d+)" data-loop-last="(\d+)"/g)].map(m=>[Number(m[1]),Number(m[2])]);
    assert.equal(exampleStops.length,4);
    assert(exampleStops.every(([lo,hi],j)=>hi-lo===exampleStops[0][1]-1&&(j===0?lo===1:lo===exampleStops[j-1][1]+1)));
  }
});

test('問4は応答・ビット伝送イベントを積算し、十進丸めと最小契約値を検算',()=>{
  const l2Review=[/ネットワーク層の機能をもつ装置を経由/,/アドレス設定を同一/,/様々な通信プロトコル/,/TCP\/IP以外のプロトコルを使うことができない/];
  for(const body of variants(4)){
    const [l2,ungrouped,grouped,speed]=group(body);
    assert.match(text(body),/①広域Ethernetはデータリンク層/);
    assert.deepEqual(l2.options.map((opt,j)=>l2Review[j].test(opt)),[true,true,true,true]);
    truths(l2,option=>l2Review[2].test(option));
    const topology=render(diagram(body,'4-network'));
    const bySite=Object.fromEntries([...topology.matchAll(/data-site="([^"]+)" data-mbps="(\d+)"/g)].map(m=>[m[1],Number(m[2])]));
    assert.deepEqual(Object.keys(bySite),['東京本社','札幌営業所','大阪営業所','広島営業所']);
    const [far,osaka]=captures(text(body),/との間が(\d+)ミリ秒，大阪営業所と東京本社との間が(\d+)ミリ秒/).map(Number);
    const [mb,kb]=captures(text(body),/(\d+)Mバイトのファイルをブロック長が(\d+)kバイト/).map(Number);
    const cap=render(diagram(body,'batch-sequence'));
    const batches=[...cap.matchAll(/data-batch-count="(\d+)"/g)].map(m=>Number(m[1]));
    assert.equal(new Set(batches).size,1);
    const [batch]=batches;
    assert.equal((cap.match(/data-local-block=/g)??[]).length,batch*3);
    const [deadline]=captures(text(body),/(\d+)秒以内に転送/).map(Number);
    const elapsed=(access:number,latency:number,grouping:number)=>{
      let bytesRemaining=mb*1_000_000, event=0, milliseconds=0;
      while(bytesRemaining>0){
        if(event%grouping===0)milliseconds+=latency;
        const length=Math.min(bytesRemaining,kb*1000);
        milliseconds+=8*length/(1000*Math.min(bySite.東京本社,access));
        bytesRemaining-=length;event++;
      }
      return milliseconds;
    };
    const decimal=(ms:number)=>((BigInt(Math.round(ms))+5n)/10n).toString().padStart(3,'0').replace(/(\d{2})$/,'.$1');
    truths(ungrouped,value=>value===decimal(elapsed(bySite.広島営業所,far,1)));
    truths(grouped,value=>value===decimal(elapsed(bySite.札幌営業所,far,batch)));
    let minimum=1;
    while(elapsed(minimum,osaka,1)>deadline*1000+1e-8){minimum++;assert(minimum<=bySite.東京本社);}
    truths(speed,value=>Number(value)===minimum);
    assert.match(text(body),/再送はない/);
    assert.match(text(body),/読出し要求とデータブロックの転送時間は考慮しない/);
    assert.match(text(body),/1Mバイト＝1,000kバイトとし，小数第3位を四捨五入/);
    for(const g of [ungrouped,grouped,speed]){
      const numbers=g.options.map(Number);
      assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b));
      if(g===speed)assert(g.options.every(value=>/^\d+$/.test(value)));
      else assert(g.options.every(value=>/^\d+\.\d{2}$/.test(value)));
    }
  }
});


test('問3の図表はケースと選択肢番号を独立に制限する',()=>{
  const profile=figures.find(entry=>entry.profile.endsWith('ip-answer-table'));
  assert(profile);
  assert.deepEqual(profile.domain,[[0,3],[0,4]]);
  for(const values of [[],[0],[0,0,0],[-1,0],[4,0],[0,-1],[0,5],[1,1.1],Array(2)]){
    assert.throws(()=>readBookletFigure(profile,values),/図の値/);
  }
});
