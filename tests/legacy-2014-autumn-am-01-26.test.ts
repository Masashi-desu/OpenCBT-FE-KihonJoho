import assert from 'node:assert/strict';
import { posix } from 'node:path';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import { legacy2014AutumnAm01To26Definitions as definitions } from '../src/core/generators/legacy-2014-autumn-am-01-26';
import { legacy2014AutumnAm0126Figures as figures } from '../src/core/generators/legacy-2014-autumn-am-01-26-figures';
import { legacy2014AutumnAm0126Renderers as renderers } from '../src/ui/Legacy2014AutumnAm0126Figures';
import official from '../src/core/generators/legacy-2014-autumn-am-01-26-source.json';

const marks='アイウエ', officialKeys='エアエエイアエエエイイウイエウイイウエウウエウエエイ';
const all=(number:number)=>{
  const d=definitions[number-1];
  return Array.from({length:d.fields[0].maximum+1},(_,i)=>d.build([i]));
};
const stringify=(b:Block)=>b.type==='diagram'?b.alt:b.type==='table'?b.rows.flat().join(' '):'text' in b?b.text:'';
const prompt=(q:GeneratedBody)=>q.prompt.map(stringify).join('\n');
const choices=(q:GeneratedBody)=>q.choices.map(c=>c.map(stringify).join('\n'));
const integers=(q:GeneratedBody)=>choices(q).map(text=>Number(text.replaceAll(',','')));
function unique(q:GeneratedBody, truth:boolean[]) {
  assert.equal(truth.length,4);
  assert.deepEqual(truth.flatMap((isCorrect,i)=>isCorrect?[i]:[]),[q.correctIndex]);
}
function shown(q:GeneratedBody, kind:'table'):Extract<Block,{type:'table'}>;
function shown(q:GeneratedBody, kind:'diagram'):Extract<Block,{type:'diagram'}>;
function shown(q:GeneratedBody, kind:'formula'):Extract<Block,{type:'formula'}>;
function shown(q:GeneratedBody, kind:Block['type']) {
  const block=q.prompt.find(item=>item.type===kind);
  assert(block);
  return block;
}
function render(b:Extract<Block,{type:'diagram'}>) {
  assert(b.scene.kind==='source_figure');
  const {profile,values}=b.scene;
  const f=figures.find(item=>item.profile===profile), r=renderers.find(item=>item.profile===profile);
  assert(f&&r);
  assert.equal(readBookletFigure(f,values),b.alt);
  const html=renderToStaticMarkup(createElement(r.component,{values,caption:b.caption}));
  assert.match(html, /<svg[^>]+viewBox=/);
  assert.match(html, /role="img"/);
  assert.match(html, /<desc\b/);
  assert.match(html, /class="diagram-scroll"/);
  assert.match(html, /var\(--diagram-ink\)/);
  return html;
}
function match(text:string, pattern:RegExp):RegExpMatchArray {
  const m=text.match(pattern);
  assert(m,pattern.toString());
  return m;
}

test('問1〜26の原枠・4択・公式正答・102可変条件の役割を検査する',()=>{
  assert.equal(definitions.length,26);
  const pages=[4,4,4,4,5,5,5,6,6,6,7,7,8,8,9,9,10,10,11,11,11,11,12,12,13,13];
  assert.deepEqual(official.map(s=>s.physicalPage),pages);
  assert.deepEqual(official.map(s=>s.printedPage),pages);
  assert.equal(official.map(s=>s.sourceKey).join(''),officialKeys);
  assert.deepEqual(figures.map(f=>f.profile),renderers.map(r=>r.profile));
  let inputs=0;
  for(const [i,d] of definitions.entries()){
    const n=i+1, row=official[i], instances=all(n), ref=instances[0];
    assert.equal(d.source,'2014h26a-fe-am-'+n);
    assert.equal(d.sourceAnswer,officialKeys[i]);
    assert.equal(marks[ref.correctIndex!],officialKeys[i]);
    assert(row.fullAlt.startsWith('問'+n+' ')&&row.choices.length===4);
    assert.deepEqual(row.commonPhysicalPages,n===21?[3]:[]);
    assert.deepEqual(d.reference,[0]);
    if(n!==4&&n!==21)assert.deepEqual(choices(ref),row.choices,d.source);
    assert(new Set(instances.map(v=>JSON.stringify(v.prompt))).size===instances.length,d.source);
    const answerCount=new Set(instances.map(v=>v.correctIndex)).size;
    if(n===12||n===22){
      assert.equal(d.answerVariation,'fixed');
      assert.equal(answerCount,1);
    }else{
      assert.equal(d.answerVariation,undefined);
      assert(answerCount>1,d.source);
    }
    for(const q of instances){
      assert.equal(q.choices.length,4);
      assert.equal(new Set(choices(q)).size,4);
      assert.deepEqual(q.prompt.map(b=>b.type),ref.prompt.map(b=>b.type));
      assert.deepEqual(q.choices.map(c=>c.map(b=>b.type)),ref.choices.map(c=>c.map(b=>b.type)));
      assert(q.explanation.length>28);
    }
    for(const values of [[],[-1],[instances.length],[0.5],[NaN],[0,1],Array(1),Object.assign([0],{extra:true}),
      Object.defineProperty([0],'0',{get:()=>0})])
      assert.throws(()=>d.build(values),/PARAMETER_CONSTRAINT/);
    inputs+=instances.length;
  }
  assert.equal(inputs,102);
});

test('問1・2・3は位取りを別解法で展開して全候補を比較する',()=>{
  for(const q of all(1)){
    const [,numerator,denominator]=match(shown(q,'formula').text,/\\frac\{(\d+)\}\{(\d+)\}/);
    unique(q,choices(q).map(c=>{
      const [,digits]=match(c,/^0\.([0-9A-F]{2})$/);
      const parsed=[...digits].reduce((n,x,i)=>n+BigInt(parseInt(x,16))*16n**BigInt(1-i),0n);
      return parsed*BigInt(denominator)===BigInt(numerator)*256n;
    }));
  }
  for(const q of all(2)){
    const [,s]=match(prompt(q),/キー値が(\d{5})のとき/);
    const d=[...s].reverse().reduce((n,x,i)=>n+BigInt(x)*11n**BigInt(i),0n);
    const result=d.toString().slice(-4);
    const expected=BigInt(result)/2n;
    assert(prompt(q).includes('小数点以下は切捨て'));
    unique(q,choices(q).map(c=>{
      assert(/^\d{4}$/.test(c) && Number(c)<=4999);
      return BigInt(c)===expected;
    }));
  }
  for(const q of all(3)){
    const widths=[...prompt(q).matchAll(/(\d+)ビット/g)].map(m=>BigInt(m[1]));
    assert.equal(widths.length,2);
    const [a,b]=widths.map(w=>1n<<w);
    unique(q,choices(q).map(c=>BigInt(c)*b===a));
  }
});

type Expression = string | [string,Expression,Expression];
function infix(expression:string) {
  let i=0;
  const atom=():Expression=>{
    const token=expression[i++];
    if(token!=='(')return token;
    const child=sum();
    assert.equal(expression[i++],')');
    return child;
  };
  const product=():Expression=>{
    let left=atom();
    while(expression[i]==='*'){ i++;left=['*',left,atom()]; }
    return left;
  };
  const sum=():Expression=>{
    let left=product();
    while(expression[i]==='+'||expression[i]==='-'){
      const op=expression[i++];
      left=[op,left,product()];
    }
    return left;
  };
  const tree=sum();
  assert.equal(i,expression.length);
  return tree;
}
function postfix(expression:string) {
  const stack:Expression[]=[];
  for(const token of expression){
    if(/^[a-d]$/.test(token))stack.push(token);
    else{
      const right=stack.pop(),left=stack.pop();
      assert(left&&right&&'+-*'.includes(token));
      stack.push([token,left,right]);
    }
  }
  assert.equal(stack.length,1);
  return stack[0];
}
test('問4は原の組合せ表と行順を保ち、中置と後置を構文木で全件比較する',()=>{
  for(const [index,q] of all(4).entries()){
    const table=shown(q,'table');
    assert.deepEqual(table.columns,['選択肢','計算式','逆ポーランド表記法']);
    assert.deepEqual(table.rows.map(row=>row[0]),[...marks]);
    if(index===0)assert.deepEqual(table.rows.map(r=>r.slice(1).join(' ／ ').replaceAll('+','＋').replaceAll('*','＊').replaceAll('-','－')),official[3].choices);
    assert.deepEqual(choices(q),[...marks].map(mark=>'表の'+mark+'の組合せ'));
    unique(q,table.rows.map(([,left,right])=>JSON.stringify(infix(left))===JSON.stringify(postfix(right))));
  }
});

test('問6・7・9は探索の反例、部分集合、整数クロックを使って検算する',()=>{
  const sorted=Array.from({length:31},(_,i)=>i);
  for(const q of all(6)){
    const linear=prompt(q).includes('線形探索に関する');
    const scan=(target:number)=>{
      let lo=0,hi=sorted.length-1,n=0,first=-1;
      while(lo<=hi){
        const at=linear?lo:Math.floor((lo+hi)/2);
        if(n++===0)first=at;
        if(sorted[at]===target)return {n,first};
        if(linear||sorted[at]<target)lo=at+1;
        else hi=at-1;
      }
      return {n,first};
    };
    const first=scan(0),last=scan(30),missing=scan(-1);
    assert.equal(first.first,linear?0:15);
    assert.equal(last.n,linear?31:5);
    assert.equal(missing.n,linear?31:5);
    unique(q,choices(q).map(option=>{
      if(option.includes('整列されている'))return !linear;
      if(option.includes('常に速く'))return false;
      if(option.includes('先頭から開始'))return first.first===0;
      assert(option.includes('n log₂ n'));
      return false;
    }));
  }
  for(const q of all(7)){
    const [,nText,kText]=match(prompt(q),/f\((\d+)，(\d+)\)の値/);
    const n=Number(nText),k=Number(kText);
    const expected=Array.from({length:2**n},(_,i)=>i.toString(2).replaceAll('0','').length).filter(count=>count===k).length;
    assert.match(shown(q,'formula').alt,/k＝0.*0＜k＜n.*k＝n/);
    unique(q,integers(q).map(value=>value===expected));
  }
  for(const q of all(9)){
    const [,hz]=match(prompt(q),/(\d+)GHz/),[,cycles]=match(prompt(q),/平均([\d.]+)クロック/);
    const tenths=BigInt(Math.round(Number(cycles)*10));
    const budget=BigInt(hz)*1_000_000_000n*10n;
    unique(q,integers(q).map(value=>BigInt(value)*10_000n*tenths===budget));
  }
});

test('問11と14はヒット・停止状態の全列挙で順位と稼働率の下限を検算する',()=>{
  for(const q of all(11)){
    const rows=shown(q,'table').rows;
    const route=(sequential:boolean)=>rows.map(([label,cached,c,h,m])=>{
      const cost=Array.from({length:100},(_,i)=>cached==='なし'?Number(m):
        (i<Number(h)||sequential?Number(c):0)+(i<Number(h)?0:Number(m))).reduce((a,b)=>a+b,0);
      return {label,cost};
    }).sort((a,b)=>a.cost-b.cost);
    const first=route(true), second=route(false);
    assert(first.every((r,i)=>i===0||r.cost>first[i-1].cost));
    assert.deepEqual(first.map(x=>x.label),second.map(x=>x.label));
    const expected=first.map(x=>x.label).join('，');
    unique(q,choices(q).map(choice=>choice===expected));
  }
  for(const q of all(14)){
    const [,direct,via,goal]=match(prompt(q),/の稼働率は([\d.]+)，東京〜名古屋の稼働率は([\d.]+)である。東京〜大阪の稼働率を([\d.]+)以上/);
    const perThousand=(x:string)=>BigInt(Math.round(Number(x)*1000));
    const threshold=perThousand(goal)*1000n*1000n;
    const works=(x:bigint)=>{
      const rates=[perThousand(direct),perThousand(via),x];
      return Array.from({length:8},(_,mask)=>mask).filter(mask=>(mask&1)!==0||(mask&6)===6)
        .map(mask=>rates.reduce((p,rate,i)=>p*((mask&(1<<i))!==0?rate:1000n-rate),1n))
        .reduce((a,b)=>a+b,0n);
    };
    unique(q,choices(q).map(choice=>{
      const x=perThousand(choice);
      return works(x)>=threshold && works(x-1n)<threshold;
    }));
  }
});

test('問17の図を読み、2CPUと排他資源の割当てを1ミリ秒ごとに検算する',()=>{
  for(const q of all(17)){
    const diagram=shown(q,'diagram'), html=render(diagram);
    const ms=[...html.matchAll(/data-task-ms="(\d+)"/g)].map(m=>Number(m[1]));
    assert.equal(ms.length,6);
    assert.notEqual(ms[0],ms[3],'初回CPUが同時に終わるケースは禁止');
    const rows=[ms.slice(0,3),ms.slice(3,6)], phase=[0,0], elapsed=[0,0];
    let owner=-1,tick=0;
    for(;phase.some(x=>x<3);tick++){
      const awaiting=phase.flatMap((p,i)=>p===1?[i]:[]);
      if(owner<0&&awaiting.length){
        assert.equal(awaiting.length,1);
        owner=awaiting[0];
      }
      for(const [i,stage] of phase.entries()){
        if(stage>=3 || stage===1&&owner!==i)continue;
        elapsed[i]++;
        if(elapsed[i]===rows[i][stage]){
          phase[i]++;elapsed[i]=0;
          if(stage===1)owner=-1;
        }
      }
      assert(tick<500);
    }
    unique(q,integers(q).map(n=>n===tick));
    assert(prompt(q).includes('CPU，資源Rともに空いている')&&prompt(q).includes('同時に開始'));
  }
});

test('問21は表示SVGの接続・素子と四候補を全入力の独立真理値表で比較する',()=>{
  const input=[[0,0],[0,1],[1,0],[1,1]], truths:Record<string,string>={
    AND:'0001',NAND:'1110',OR:'0111',NOR:'1000',XOR:'0110',
  };
  for(const q of all(21)){
    const html=render(shown(q,'diagram'));
    const names=[...html.matchAll(/data-gate="G\d" data-operation="([A-Z]+)"/g)].map(m=>m[1]);
    assert.equal(names.length,4);
    for(const edge of ['A-G1','B-G1','A-G2','B-G3','G1-G2','G1-G3','G2-G4','G3-G4','G4-Y'])
      assert(html.includes('data-edge="'+edge+'"'));
    const apply=(name:string,a:number,b:number)=>Number(truths[name][a*2+b]);
    const expected=input.map(([a,b])=>{
      const w=apply(names[0],a,b), u=apply(names[1],a,w), v=apply(names[2],b,w);
      return apply(names[3],u,v);
    }).join('');
    const choices=q.choices.map(([b])=>{
      assert(b.type==='diagram');
      return match(render(b),/data-gate="candidate" data-operation="([A-Z]+)"/)[1];
    });
    assert.deepEqual(choices,['OR','AND','XOR','NOR']);
    unique(q,choices.map(name=>truths[name]===expected));
  }
});

test('問23の時刻図と問25の単位を解釈し、積算・概算で全候補を比較する',()=>{
  for(const q of all(23)){
    const p=prompt(q), b=shown(q,'diagram'), html=render(b);
    const [,v,a]=match(p,/(\d+)V電源で動作し，運転中に(\d+)A/);
    const on=[...match(html,/data-operating-intervals="([01]{4})"/)[1]].map(Number);
    const ranges=[...b.alt.matchAll(/(\d+)分から(\d+)分まで(運転|停止)/g)].map(m=>({from:Number(m[1]),to:Number(m[2]),run:m[3]==='運転'}));
    const end=Number(match(p,/0分から(\d+)分まで運転/)[1]);
    assert.equal(ranges.length,4);
    assert.deepEqual(ranges.map(r=>Number(r.run)),on);
    assert.equal(ranges.at(-1)?.to,end);
    let minuteW=0;
    for(let minute=0;minute<end;minute++)
      if(ranges.some(r=>r.run&&r.from<=minute&&minute<r.to))minuteW+=Number(v)*Number(a);
    unique(q,integers(q).map(value=>value*60===minuteW));
    assert(p.includes('実効値')&&p.includes('停止時に電流は流れない')&&p.includes('力率は1'));
  }
  for(const q of all(25)){
    const p=prompt(q),[,w,h,b,f]=match(p,/(\d+)×(\d+)ピクセル，(\d+)ビットフルカラーで(\d+)フレーム/);
    assert(p.includes('データ圧縮は行わない'));
    const bits=[w,h,b,f].map(Number).reduce((a,b)=>a*b,1);
    const distances=choices(q).map(c=>{
      const [,v,unit]=match(c,/^([\d.]+)([kM])ビット／秒$/);
      return Math.abs(bits-Number(v)*(unit==='M'?1e6:1e3));
    });
    const best=Math.min(...distances);
    unique(q,distances.map(distance=>distance===best));
  }
});

test('問24は過去月の周辺和を変えずに明細を変更し、全出力粒度の識別可能性を調べる',()=>{
  const histories=[[[1,4],[5,2]],[[2,3],[4,3]]];
  const totals=(history:number[][])=>[
    history.map(row=>row.reduce((a,b)=>a+b)),
    history[0].map((_,j)=>history.reduce((n,row)=>n+row[j],0)),
  ];
  assert.deepEqual(totals(histories[0]),totals(histories[1]));
  for(const q of all(24)){
    const rows=shown(q,'table').rows;
    const customerOwner=rows[0][1].includes('担当者コード'), productOwner=rows[1][1].includes('担当者コード');
    assert(customerOwner!==productOwner);
    assert(rows[0][1].includes('3か月前受注額')&&rows[1][1].includes('3か月前受注額'));
    const dimensions=new Map([
      ['顧客別の商品別受注実績',['customer','product']],
      ['商品別の顧客別受注実績',['product','customer']],
      ['商品別の担当者別受注実績',['product','staff']],
      ['担当者別の顧客別受注実績',['staff','customer']],
    ]);
    const group=(history:number[][],keys:string[])=>{
      const result=new Map<string,number>();
      history.forEach((row,customer)=>row.forEach((sales,product)=>{
        const ids:Record<string,number>={customer,product,staff:customerOwner?customer:product};
        const key=keys.map(k=>ids[k]).join('/');
        result.set(key,(result.get(key)??0)+sales);
      }));
      return JSON.stringify([...result].sort(([a],[b])=>a.localeCompare(b)));
    };
    unique(q,choices(q).map(c=>{
      const keys=dimensions.get(c);
      assert(keys);
      return group(histories[0],keys)===group(histories[1],keys);
    }));
  }
});

type Rules = { stem:RegExp; correct:RegExp }[];
const knowledge = new Map<number,Rules>([
  [5,[
    {stem:/スタック/,correct:/別の計算を行った後/}, {stem:/FIFOキュー/,correct:/格納された順番/},
    {stem:/固定長の配列/,correct:/中間にある途中結果だけ変更/},
  ]],
  [8,[
    {stem:/^XML/,correct:/利用者独自のタグ.*属性情報や論理構造/},
    {stem:/^HTML/,correct:/既定の要素.*構造や意味/}, {stem:/^CSS/,correct:/色や余白.*規則/},
  ]],
  [10,[
    {stem:/^内部割込み/,correct:/ゼロで除算/}, {stem:/タスクBを待ち状態から実行可能/,correct:/入出力が完了/},
    {stem:/残りの電力でOSが退避処理/,correct:/電源異常/}, {stem:/検査ビットとの不一致/,correct:/パリティエラー/},
  ]],
  [15,[
    {stem:/初期故障期間の対策/,correct:/設計や製造のミス.*故障解析/},
    {stem:/振動計の値/,correct:/時間計画保全や状態監視保全/},
    {stem:/運転時間のメータ/,correct:/累積動作時間.*経時保全/},
  ]],
  [16,[
    {stem:/LRU方式/,correct:/最後に参照されてから最も長い/},
    {stem:/LFU/,correct:/参照頻度の最も低い/}, {stem:/FIFO方式/,correct:/読み込んでから最も長い/},
  ]],
  [18,[
    {stem:/スプーリング機能/,correct:/低速の入出力装置.*補助記憶装置を介して/},
    {stem:/マルチプログラミング/,correct:/CPUが遊休.*他のタスクにCPUを割り当てる/},
    {stem:/割込みを受け付けた直後/,correct:/一時中断.*制御プログラムに制御を移す/},
    {stem:/バッファプール/,correct:/主記憶に入出力済みのデータ.*補助記憶からの読出しを省く/},
  ]],
  [19,[
    {stem:/絶対パス名/,correct:/^ルートディレクトリ/},
    {stem:/相対パス名/,correct:/^カレントディレクトリ/},
  ]],
  [20,[
    {stem:/オリジナルと同じ配布条件を適用/,correct:/^コピーレフト$/},
    {stem:/同じライセンスの適用は求めない/,correct:/^BSDライセンス$/},
    {stem:/著作者の権利/,correct:/^コピーライト$/},
    {stem:/いずれか一方の条件を選べる/,correct:/^デュアルライセンス$/},
  ]],
  [26,[
    {stem:/スキーマ/,correct:/データ定義の集合/}, {stem:/ビュー/,correct:/仮想的な表/},
    {stem:/データ操作/,correct:/データベース操作の総称/}, {stem:/整合性制約/,correct:/一貫性を保持するための各種制約/},
  ]],
]);

test('知識9系列の各出題条件を、独立に査読した全択の意味と比較する',()=>{
  for(const [number,rules] of knowledge){
    for(const q of all(number)){
      const targets=rules.filter(rule=>rule.stem.test(prompt(q)));
      assert.equal(targets.length,1,prompt(q));
      const options=choices(q);
      unique(q,options.map(option=>targets[0].correct.test(option)));
      if(number===16) assert(!/Least|Frequently|Recently|First In/.test(prompt(q)));
      if(number===18&&prompt(q).includes('バッファプール')) assert(options.every(option=>!option.includes('バッファプール')));
    }
  }
  // FIFOとLRUとLFUでは異なるブロックになる例。固定の閾値は置換順位を定めない。
  const reference=[['A',0,8,3],['B',1,4,3],['C',2,7,1]] as const;
  assert.deepEqual([1,2,3].map(index=>[...reference].sort((a,b)=>Number(a[index])-Number(b[index]))[0][0]),['A','B','C']);
  // 同じ相対文字列を別のカレントから開くと変わるが、絶対名は変わらない。
  assert.notEqual(posix.resolve('/u/a','record'),posix.resolve('/u/b','record'));
  assert.equal(posix.resolve('/u/a','/record'),posix.resolve('/u/b','/record'));
});


test('問12は電源投入直後の格納要件を保ち、保持性と最初に読めるかで全択を判定する',()=>{
  const devices = new Map([
    ['DRAM',{persists:false, accessibleBeforeSetup:true}],
    ['HDD',{persists:true, accessibleBeforeSetup:false}],
    ['ROM',{persists:true, accessibleBeforeSetup:true}],
    ['SRAM',{persists:false, accessibleBeforeSetup:true}],
  ]);
  const independentScenarios = [/電源投入時に最初/,/停電が何時間続くか分からない/,/制御回路は未設定/,/その装置を使わず自己診断/];
  for(const [i,q] of all(12).entries()){
    const visible=prompt(q);
    assert.match(visible,independentScenarios[i]);
    assert.match(visible,/電源投入時に最初に実行される.*プログラムの格納/);
    assert.match(visible,/主記憶のバッテリバックアップはしない/);
    assert(!choices(q).some(choice=>visible.includes(choice)));
    unique(q,choices(q).map(choice=>{
      const device=devices.get(choice);
      assert(device);
      return device.persists && device.accessibleBeforeSetup;
    }));
    assert(q.explanation.includes('ROM')&&q.explanation.includes('HDD'));
  }
});

test('問13は構成ごとの費用・常時運転・障害後の調達時間を独立に比較する',()=>{
  for(const [i,q] of all(13).entries()){
    const visible=prompt(q);
    const plans=choices(q).map(option=>({
      shared:option.includes('共同利用型'),
      running:option.includes('待機系サイトとして稼働'),
      needsHardwareAfterFailure:option.includes('障害発生時には必要なハードウェア'),
      updatesContinuously:option.includes('常時データやプログラムの更新'),
    }));
    assert.equal(plans.filter(p=>p.shared).length,1);
    assert.equal(plans.filter(p=>p.running).length,1);
    assert.equal(plans.filter(p=>p.needsHardwareAfterFailure).length,1);
    if(i===0){
      assert.match(visible,/ホットサイト/);
      unique(q,plans.map(plan=>plan.running&&plan.updatesContinuously));
      continue;
    }
    assert(!/待機系サイト|ホットサイト|共同利用型のサイト|媒体を搬入|バックアップしておいたデータやプログラムの媒体/.test(visible));
    assert.match(visible,/適切なバックアップシステム構成の記述/);
    const restore=Number(match(visible,/復元作業は(\d+)時間/)[1]);
    if(visible.includes('4社')){
      const [,unitCost,budget]=match(visible,/1社分の代替設備に月(\d+)万円掛かり，4社全体で出せる費用も月(\d+)万円/);
      const limit=Number(match(visible,/(\d+)時間以内に業務を再開/)[1]);
      const access=Number(match(visible,/利用できるまでに最大(\d+)時間/)[1]);
      assert.match(visible,/同時には1社だけ/);
      unique(q,plans.map(plan=>Number(unitCost)*(plan.shared?1:4)<=Number(budget)&&access+restore<=limit));
      continue;
    }
    const procurement=Number(match(visible,/代替機(?:を調達すると|は)(\d+)時間/)[1]);
    const dedicated=/他社との設備の共用は契約上認められない|確保済みの自社施設で行う/.test(visible);
    const operatingBudget=!visible.includes('予備機を動かし続ける電力と運用人員は確保できない');
    const storageBudget=!visible.includes('平時に2組目の機器を設置し続ける費用は認められない');
    const deadline=Number(match(visible,/停止後(\d+)時間以内が目標|期限は(\d+)時間/).slice(1).find(Boolean));
    unique(q,plans.map(plan=>{
      const setup=plan.needsHardwareAfterFailure?procurement:0;
      return (!dedicated||!plan.shared) && (operatingBudget||!plan.running) &&
        (storageBudget||plan.needsHardwareAfterFailure) && setup+(plan.running?0:restore)<=deadline;
    }));
  }
});

test('問22は現在入力だけが同じ二つの履歴で出力の保持が必要なことを検算する',()=>{
  const stableStates = new Map([
    ['NANDゲート',{usesHistory:false, digital:true}],
    ['加算器',{usesHistory:false, digital:true}],
    ['コンデンサ',{usesHistory:true, digital:false}],
    ['フリップフロップ',{usesHistory:true, digital:true}],
  ]);
  const requiredHistory=[/二つの安定状態/,/次のクロックまで前の値/,/ボタンを離しても/,/異常信号が0に戻った後も/];
  for(const [i,q] of all(22).entries()){
    const visible=prompt(q);
    assert.match(visible,requiredHistory[i]);
    assert.match(visible,/順序回路/);
    const seenThenCleared=[1,0], neverSeen=[0,0];
    assert.equal(seenThenCleared.at(-1),neverSeen.at(-1));
    unique(q,choices(q).map(option=>{
      const candidate=stableStates.get(option);
      assert(candidate);
      if(!candidate.digital)return false;
      const output=(history:number[])=>candidate.usesHistory?history[0]:history.at(-1);
      return output(seenThenCleared)!==output(neverSeen);
    }));
  }
});
