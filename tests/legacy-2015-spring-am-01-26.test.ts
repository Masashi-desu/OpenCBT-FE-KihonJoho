import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2015SpringAm0126Definitions as definitions } from '../src/core/generators/legacy-2015-spring-am-01-26';
import { legacy2015SpringAm0126Figures as figures } from '../src/core/generators/legacy-2015-spring-am-01-26-figures';
import { legacy2015SpringAm0126Renderers as renderers } from '../src/ui/Legacy2015SpringAm0126Figures';
import type { GeneratedBody } from '../src/core/generators/definition';
import type { Block } from '../src/core/types';
import review from './fixtures/legacy-2015-spring-am-01-26-review.json';

const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const marks = 'アイウエ';
const all = (question: number) => {
  const definition = definitions[question - 1];
  assert.equal(definition.source, review.collectionId + '-' + question);
  return Array.from({ length: definition.fields[0].maximum + 1 }, (_, i) => definition.build([i]));
};
const bodyText = (b: Block) => b.type === 'diagram' ? b.alt : b.type === 'table' ? b.rows.flat().join('，') : 'text' in b ? b.text : '';
function choiceText(q: GeneratedBody) {
  return q.choices.map(choice => choice.map(bodyText).join(''));
}
function unique(q: GeneratedBody, found: boolean[]) {
  assert.equal(found.length, 4);
  assert.deepEqual(found.flatMap((value, i) => value ? [i] : []), [q.correctIndex]);
}
function render(b: Block) {
  assert(b.type === 'diagram' && b.scene.kind === 'source_figure');
  const { profile, values } = b.scene;
  const definition = figures.find(d => d.profile === profile), renderer = renderers.find(r => r.profile === profile);
  assert(definition && renderer);
  definition.validate(values);
  assert.equal(definition.alt(values), b.alt);
  return renderToStaticMarkup(createElement(renderer.component, {values,caption:b.caption}));
}
function numericChoices(q: GeneratedBody) {
  return choiceText(q).map(Number);
}
function prompt(q: GeneratedBody) { return q.prompt.map(bodyText).join('\n'); }

test('原問の26系列と104択の原順、全99実入力・当該年度だけの出題を確認する', () => {
  assert.equal(definitions.length, 26);
  assert.deepEqual(figures.map(f => f.profile), renderers.map(r => r.profile));
  const expectedPages = [4,4,5,5,5,6,6,6,7,7,8,8,9,10,10,11,11,11,12,12,12,13,13,13,14,14];
  assert.deepEqual(review.rows.map(q => q.page), expectedPages);
  let conditions = 0;
  for (const [i, d] of definitions.entries()) {
    const source = review.rows[i], variants = all(source.number), baseline = variants[0];
    assert.equal(d.title, source.title);
    assert.equal(d.sourceAnswer, source.key);
    assert.equal(marks[baseline.correctIndex!], source.key);
    assert.deepEqual(d.reference, [0]);
    if (source.choiceSHA256) {
      const choices = source.number === 3 ? baseline.choices.map(([b]) => b.type === 'formula'
        ? b.text.replace(/(-?)\\frac\{(\d+)\}\{(\d+)\}/, (_, minus, numerator, denominator) => (minus ? '−' : '') + numerator + '/' + denominator)
        : bodyText(b)) : choiceText(baseline);
      assert.equal(hash(JSON.stringify(choices)), source.choiceSHA256, d.source);
    }
    const stem = source.number === 3 ? bodyText(baseline.prompt[0]) + bodyText(baseline.prompt.at(-1)!) : bodyText(baseline.prompt[0]);
    assert.equal(hash(stem), source.stemSHA256, d.source);
    const prompts = new Set(variants.map(v => JSON.stringify(v.prompt)));
    assert.equal(prompts.size, variants.length, d.source);
    for (const b of variants) {
      assert.equal(b.choices.length, 4, d.source);
      assert.equal(new Set(choiceText(b)).size,4,d.source);
      assert.equal(b.contexts,undefined,'別冊子からのコンテキストなし');
      assert.deepEqual(b.prompt.map(block => block.type), baseline.prompt.map(block => block.type), d.source);
      assert.deepEqual(b.choices.map(choice => choice.map(block => block.type)),
        baseline.choices.map(choice => choice.map(block => block.type)), d.source);
      assert(b.explanation.length>=25);
    }
    const accessor = Object.defineProperty([0], '0', { get: () => 0 });
    for(const v of [[],[-1],[NaN],[0.5],[variants.length],[0,1],Array(1),accessor,Object.assign([0],{extra:1})])
      assert.throws(() => d.build(v), /PARAMETER_CONSTRAINT/);
    conditions += variants.length;
  }
  assert.equal(conditions, 99);
});

function bitValue(a: boolean, b: boolean, op: number) {
  const truth = [a!==b, !(a&&b),a&&b,a||b];
  return truth[op];
}
test('問1は各3手順を3・8ビットの全非零入力、四演算と比較する', () => {
  for (const [mode,q] of all(1).entries()) {
    assert.match(prompt(q),/少なくとも一つは1/);
    assert.match(prompt(q),/符号なしの2進数/);
    assert.match(bodyText(q.prompt[2]),[/XOR/,/Bの各ビットを反転/,/論理積（AND）/,/否定論理積（NAND）/][mode]);
    const counts = [0,0,0,0];
    let inputs=0;
    for (const width of [3,8]) for(let n=1;n<2**width;n++){
      const a=n.toString(2).padStart(width,'0'), b=(n-1).toString(2).padStart(width,'0');
      const right=a.lastIndexOf('1'), target=[...a].map((_, i)=>i===right);
      const c=[...a].map((x,i)=> {
        const aa=x==='1',bb=b[i]==='1';
        return [aa!==bb,!bb,aa&&bb,!(aa&&bb)][mode];
      });
      for(let op=0;op<4;op++) if([...a].every((x,i)=>bitValue(x==='1',c[i],op)===target[i]))counts[op]++;
      inputs++;
    }
    unique(q,counts.map(n=>n===inputs));
  }
});

function fraction(b: Block) {
  assert(b.type === 'formula');
  if (b.text === '0') return 0;
  const m = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(b.text);
  assert(m);
  return (m[1] ? -1 : 1)*Number(m[2])/Number(m[3]);
}
test('問3・4は床関数の全入力と非対称の遷移確率表で全択を検算する', () => {
  for (const q of all(3)) {
    const txt=bodyText(q.prompt.at(-1)!);
    const numbers=[...txt.matchAll(/[−-]?\d\.\d/g)].map(m=>Number(m[0].replace('−','-')));
    const [start]=numbers, finish=numbers.at(-2)!, shift=numbers.at(-1)!;
    const values=Array.from({length:Math.round((finish-start)*10)+1},(_,i)=>Math.round(start*10)+i+Math.round(shift*10));
    const floors=values.map(n=>n<0?-1:n<10?0:1);
    const expected=floors.reduce<number>((a,b)=>a+b,0)/values.length;
    const choices=q.choices.map(([b])=>fraction(b));
    assert.equal(new Set(choices).size,4);
    assert(choices.every((value, i) => i === 0 || choices[i - 1] < value));
    unique(q,choices.map(n=>n===expected));
  }
  for(const q of all(4)){
    const matrix=q.prompt.find(b=>b.type==='table');
    assert(matrix?.type==='table');
    const rowInput=matrix.columns[0].startsWith('入力');
    assert.deepEqual(matrix.rows,[['0','a','b'],['1','c','d']]);
    const probs=rowInput?{a:8,b:2,c:7,d:3}:{a:8,b:7,c:2,d:3};
    unique(q,choiceText(q).map(expr=>expr.split('，').every(sum=>
      [...sum.split('＝')[0]].reduce((n,c)=>n+(probs[c as keyof typeof probs]??0),0)===10)));
  }
});

test('問6の探索式と問10のECC式は処理の反復を独立に数えて判定する', () => {
  for(const q of all(6)){
    const half=/2分探索/.test(prompt(q));
    const costs=[16,256,65536].map(size=>{
      let count=0;
      if(half) for(let n=size;n;n=Math.floor(n/2))count++;
      else for(let n=0;n<size;n++)count++;
      return count;
    });
    assert.deepEqual(costs,half?[5,9,17]:[16,256,65536]);
    unique(q,choiceText(q).map(name=>name===(half?'log n':'n')));
  }
  for(const q of all(10)){
    const width=Number(/(\d+)ビットのデータバス幅に必要/.exec(prompt(q))?.[1]);
    let n=0, power=1;
    while(power<width){power*=2;n++;}
    assert.equal(power,width);
    unique(q,numericChoices(q).map(c=>c===n+2));
  }
});

test('問9・11は描画したアドレス参照、4台へのビット配置を独立に解釈する', () => {
  const routes=['間接','指標','相対','直接'];
  const memoryFigure = figures.find(f => f.profile === 'legacy-2015-spring-am-9-address');
  assert(memoryFigure);
  assert.deepEqual(memoryFigure.domain, [[0, 3]]);
  for (const invalid of [[], [-1], [4], [0, 20, 25]]) assert.throws(() => memoryFigure.validate(invalid), /FIGURE_DOMAIN/);
  for(const [index,q] of all(9).entries()){
    const picture=q.prompt[1];
    assert(picture.type === 'diagram' && picture.scene.kind === 'source_figure');
    assert.deepEqual(picture.scene.values, [index]);
    const img=render(picture);
    assert(img.includes('主記憶')&&img.includes('アドレス部'));
    const alt=bodyText(picture);
    const mode=alt.includes('指標レジスタ')?1:alt.includes('プログラムカウンタ')?2:alt.includes('には25')?0:3;
    assert.equal(mode,index);
    unique(q,choiceText(q).map(choice=>choice.startsWith(routes[mode])));
  }
  for(const [index,q] of all(11).entries()){
    const img=render(q.prompt[1]);
    const bits=[...img.matchAll(/data-disk-bit="(\d+)"/g)].map(m=>Number(m[1]));
    assert.equal(bits.length,16);
    assert.equal([...img.matchAll(/data-disk="\d+"/g)].length,4);
    assert.deepEqual(bits,index===0?[0,4,8,12,1,5,9,13,2,6,10,14,3,7,11,15]:[0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3]);
    const same=bits.slice(4).every((b,i)=>b===bits[i%4]);
    unique(q,choiceText(q).map(choice=>choice===(same?'ミラーリング':'ストライピング')));
  }
});

test('問12・13は単位換算、半回転、資源の厳密超過を全条件で照合する', () => {
  for(const q of all(12)){
    const m=/回転数が([\d,]+)回／分で，平均位置決め時間が(\d+)ミリ秒/.exec(prompt(q));
    assert(m);
    const rpm=Number(m[1].replaceAll(',','')), seek=Number(m[2]);
    const distances=numericChoices(q).map(n=>Math.abs((n-seek)*rpm-30000));
    unique(q,distances.map(n=>n===Math.min(...distances)));
    assert(numericChoices(q).every((n,i,a)=>i===0||a[i-1]<n));
  }
  for(const q of all(13)){
    const machines=Number(/物理マシン(\d+)台/.exec(prompt(q))?.[1]);
    const pct=Number(/(?:において|が)(\d+)％である/.exec(prompt(q))?.[1]);
    assert(machines>0&&pct>0);
    const first=Array.from({length:machines-1},(_,i)=>i+1).find(k=>(machines-k)*90<machines*pct);
    unique(q,numericChoices(q).map(n=>n===first));
    assert(prompt(q).includes('90％を超え'));
  }
});

test('問14は応答時間の発散・線形・一定を判別し、4曲線の図と照合する', () => {
  const rho=[0,.25,.5,.75,.875,.9375];
  const response=[
    rho.map(r=>[...Array(220)].reduce((sum,_,n)=>sum+(n+1)*(1-r)*r**n,0)),
    rho.map(r=>(1-r)*1+r*2),
    rho.map(()=>1),
  ];
  for(const [index,q] of all(14).entries()){
    const ordinates=response[index],deltas=ordinates.slice(1).map((x,i)=>(x-ordinates[i])/(rho[i+1]-rho[i]));
    const expected=deltas.every(x=>x===0)?3:deltas.every(x=>Math.abs(x-1)<1e-8)?1:
      deltas.at(-1)!>10*deltas[0]?0:2;
    if(index===0)assert(prompt(q).includes('ポアソン分布')&&prompt(q).includes('指数分布'));
    if(index===1)assert(prompt(q).includes('転送後は待たず'));
    if(index===2)assert(prompt(q).includes('受け付けない'));
    const kinds=q.choices.map(([b])=>Number(/data-response-curve="(\d+)"/.exec(render(b))?.[1]));
    assert.deepEqual(kinds,[0,1,2,3]);
    unique(q,kinds.map(k=>k===expected));
  }
});

test('問15の並列構成を各装置の全稼働状態から正確に比較する', () => {
  for(const q of all(15)){
    const stem=prompt(q);
    const values=choiceText(q).map((c,i)=>{
      const count=[4,3,2,1][i], rate=Number(/(\d+)％/.exec(c)?.[1]);
      const minimum=count===1?1:stem.includes('全ての構成機が稼働')?count:stem.includes('少なくとも2台')?2:1;
      let sum=0;
      for(let mask=1;mask<2**count;mask++){
        if([...mask.toString(2)].filter(b=>b==='1').length<minimum)continue;
        let weight=100**(4-count)*(count>1&&stem.includes('接続装置（稼働率98％）')?98:100);
        for(let device=0;device<count;device++)weight*=mask&(1<<device)?rate:100-rate;
        sum+=weight;
      }
      return sum;
    });
    unique(q,values.map(n=>n===Math.max(...values)));
  }
});

test('問20は最終参照時刻、問21は分ごとの空きと投入順で独立に検算する', () => {
  for(const q of all(20)){
    const m=/ページ([\d，]+)の順にアクセス/.exec(prompt(q));
    assert(m);
    const accessed=m[1].split('，').map(Number);
    assert(prompt(q).includes('初期状態では主記憶にどのページも存在しない'));
    const lastSeen=new Map<number,number>();
    let victim: number | undefined;
    for(const [time,page] of accessed.entries()){
      victim=undefined;
      if(!lastSeen.has(page)&&lastSeen.size===4){
        const [oldest]=[...lastSeen.entries()].sort((a,b)=>a[1]-b[1])[0];
        victim=oldest;
        lastSeen.delete(oldest);
      }
      lastSeen.set(page,time);
    }
    assert.equal(accessed.at(-1),6);
    unique(q,numericChoices(q).map(page=>page===victim));
  }
  for(const q of all(21)){
    const m=/出力待ちの順に，([\d，]+)（分）/.exec(prompt(q));
    assert(m);
    const jobs=m[1].split('，').map(Number);
    const remaining=[0,0,0], busy=[0,0,0];
    let next=0, elapsed=0;
    while(next<jobs.length||remaining.some(Boolean)){
      if(next<jobs.length&&elapsed>0)assert(remaining.filter(x=>x===0).length<=1);
      for(let index=0;index<3&&next<jobs.length;index++){
        if(remaining[index]!==0)continue;
        remaining[index]=jobs[next++];
      }
      for(let i=0;i<3;i++) if(remaining[i]>0){busy[i]++;remaining[i]--;}
      elapsed++;
      assert(elapsed<60);
    }
    assert.equal(busy.reduce((a,b)=>a+b,0),jobs.reduce((a,b)=>a+b,0));
    const ordered=[0,1,2].sort((a,b)=>busy[b]-busy[a]).map(i=>'ABC'[i]).join('，');
    unique(q,choiceText(q).map(candidate=>candidate===ordered));
  }
});

test('問23は全入力で6ゲートと4本の選択式を別々に評価する', () => {
  for(const [mode,q] of all(23).entries()){
    const original=render(q.prompt[1]);
    assert(original.includes('data-gate')||original.includes('中央OR'));
    const actual=q.choices.map(([b])=>render(b));
    assert(actual.every(markup=>markup.includes('<svg')));
    if(mode===1)assert(actual[3].includes('X＝A＋B'));
    const truthTable=[false,true].flatMap(a=>[false,true].map(b=>[a,b] as const));
    const circuit=truthTable.map(([a,b])=>{
      const middle=!a||!b;
      const last=(a&&middle)||(b&&middle);
      return mode===0?last:!last;
    });
    const meanings=q.choices.map(([b],i)=>{
      const alt=bodyText(b);
      if(i===0)assert.match(alt,/A・B全体の否定/);
      if(i===1)assert.match(alt,/（Aの否定）・（Bの否定）/);
      if(i===2)assert.match(alt,/A・（Bの否定）/);
      if(i===3)assert.match(alt,mode===0?/Aの否定＋B/:/X＝A＋B/);
      return truthTable.map(([a,b])=>[ (a&&b)||!(a&&b), (a&&b)||(!a&&!b), (a&&!b)||(!a&&b),
        mode===0?(!a||b)&&(a||!b):a||b ][i]);
    });
    unique(q,meanings.map(seq=>seq.every((x,i)=>x===circuit[i])));
    assert.equal(new Set(meanings.map(value=>JSON.stringify(value))).size,mode===0?3:4);
  }
});

type Knowledge = {question: number; targets: RegExp[]; choices: RegExp[]};
const knowledge: Knowledge[] = [
  {question:2,targets:[/桁落ち/,/オーバフロー/,/丸め誤差/,/情報落ち/],
    choices:[/ほぼ等しい.*減算/,/最大値を超える/,/四捨五入.*切捨て/,/加算.*下位の桁/]},
  {question:5,targets:[/スタック/,/キュー/,/配列/,/ポインタをもつ木/],
    choices:[/最後に格納.*最初/,/最初に格納.*最初/,/添字/,/階層関係/]},
  {question:7,targets:[/再配置可能/,/再帰的/,/オーバレイ/,/再入可能/],
    choices:[/どこのアドレス/,/自分自身を呼び出/,/必要な部分を補助記憶/,/複数のタスク.*正しい結果/]},
  {question:8,targets:[/コンポーネント化/,/ブラウザ側で動作するスクリプト/,/mainメソッド/,/対応するブラウザのWebページ/],
    choices:[/^JavaBeans$/,/^JavaScript$/,/^Javaアプリケーション$/,/^Javaアプレット$/]},
  {question:17,targets:[/バッファリング/,/ジョブスケジューリング/,/プロキシ/,/スプーリング/],
    choices:[/キーボード.*主記憶/,/ジョブの実行順序/,/直接通信相手に送らず/,/低速な装置.*磁気ディスク/]},
  {question:18,targets:[/必要な部分だけを同じ主記憶領域/,/ページイン.*ページアウト/s,/使用中の領域を移動.*空き領域/,/一時的に中断.*補助記憶へ退避/],
    choices:[/^オーバレイ$/,/^スラッシング$/,/^メモリコンパクション$/,/^ロールアウト$/]},
  {question:19,targets:[/残りの処理時間の短い/,/ラウンドロビン/,/ノンプリエンプティブ/,/優先度に基づくプリエンプティブ/],
    choices:[/残りの実行時間/,/決められた時間内.*中断/,/自ら待ち状態.*終了/,/優先度が高い方/]},
  {question:24,targets:[/$^/,/$^/,/拡大や縮小を行わない/,/^ビットマップフォントよりも/],
    choices:[/漢字/,/幅を一定/,/高速/,/任意の倍率/]},
  {question:25,targets:[/レイトレーシング/,/シェーディング/,/クリッピング/,/テクスチャマッピング/],
    choices:[/反射や屈折.*透過/,/陰影/,/はみ出す箇所/,/表面に画像を貼り付け/]},
  {question:26,targets:[/ビューを提供/,/埋込みSQL/,/3層スキーマアーキテクチャ/,/$^/],
    choices:[/関係演算.*新たな表/,/対話的に使われるSQL/,/物理的な格納構造/,/緊密に結合/]},
];
test('知識選択10系列は各出題対象と全4説明・名称を査読済みの意味で照合する', () => {
  for(const {question,targets,choices} of knowledge)for(const q of all(question)){
    const selected=targets.flatMap((target,i)=>target.test(prompt(q))?[i]:[]);
    assert.equal(selected.length,1,'target q'+question);
    const semanticIds=choiceText(q).map(option=>{
      const matched=choices.flatMap((fact,i)=>fact.test(option)?[i]:[]);
      assert.equal(matched.length,1,'choice q'+question+': '+option);
      return matched[0];
    });
    assert.equal(new Set(semanticIds).size,4);
    unique(q,semanticIds.map(id=>id===selected[0]));
  }
});

test('問16・22は信頼性の比とメモリの比較条件から各説明の真偽を確認する', () => {
  const availability=(run:number,down:number)=>run/(run+down);
  assert(availability(8,2)>availability(8,3));
  assert(availability(9,4)<availability(8,2)); // Both durations increased.
  assert.notEqual(availability(7,3),availability(9,1));
  assert.equal(availability(2,3),availability(4,6));
  assert.equal(availability(10,10),.5);
  const trueFacts=[/予防保守は，MTBFを長く/,/平均修復時間を短縮すると，稼働率は向上/,/同じとき，稼働率は50％/];
  for(const [i,q] of all(16).entries()){
    const recognized=choiceText(q).map(s=>trueFacts[i].test(s));
    unique(q,recognized);
  }
  for(const q of all(22)){
    const stem=prompt(q);
    const fact=stem.includes('場合のDRAM')?/構成が単純.*単価が安/:
      stem.includes('セルの構成')?/フリップフロップ/:/リフレッシュ.*不要/;
    unique(q,choiceText(q).map(s=>fact.test(s)));
  }
});
