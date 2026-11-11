import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { readBookletFigure, validateBookletFigureExtensions } from '../../../src/core/booklet-figure-extension-contract';
import { legacy2014SpringAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2014-spring-am-01-26';
import { legacy2014SpringAm0126Figures as figures } from '../../../src/core/generators/legacy-2014-spring-am-01-26-figures';
import { legacy2014SpringAm0126Renderers as renderers } from '../../../src/ui/Legacy2014SpringAm0126Figures';
import original from '../../../src/core/generators/legacy-2014-spring-am-01-26-source.json';

const keys='アウエウウウイアエエイアエエアイイウアエエウアウアイ';
const mark='アイウエ';
const instances=(n:number)=>{
  const d=definitions[n-1], field=d.fields[0];
  return Array.from({length:field.maximum+1},(_,i)=>d.build([i]));
};
const textOf=(blocks:Block[])=>blocks.map(b=>'text' in b?b.text:'').join('\n');
const prompt=(b:GeneratedBody)=>textOf(b.prompt);
const options=(b:GeneratedBody)=>b.choices.map(textOf);
function block<K extends Block['type']>(blocks:Block[],type:K):Extract<Block,{type:K}> {
  const item=blocks.find(b=>b.type===type);
  assert(item);
  return item as Extract<Block,{type:K}>;
}
function capture(s:string,pattern:RegExp) {
  const m=s.match(pattern);
  assert(m,pattern.toString());
  return m.slice(1);
}
function unique(body:GeneratedBody,flags:boolean[]) {
  assert.equal(flags.length,4);
  assert.deepEqual(flags.flatMap((v,i)=>v?[i]:[]),[body.correctIndex]);
}
function svg(item:Extract<Block,{type:'diagram'}>) {
  assert.equal(item.scene.kind,'source_figure');
  const {profile,values}=item.scene;
  const f=figures.find(d=>d.profile===profile), r=renderers.find(d=>d.profile===profile);
  assert(f&&r);
  assert.equal(readBookletFigure(f,values),item.alt);
  const rendered=renderToStaticMarkup(createElement(r.component,{values,caption:item.caption}));
  for(const token of ['<svg','<title','<desc','role="img"','diagram-scroll','var(--diagram-ink)','--image-scale'])
    assert(rendered.includes(token),token);
  return rendered;
}

test('原冊子の問1〜26・全選択肢・正答と101可変条件の出題構造',()=>{
  assert.equal(definitions.length,26);
  assert.deepEqual(validateBookletFigureExtensions([{scope:'2014-spring-am',figures}]),figures);
  assert.deepEqual(figures.map(f=>f.profile),renderers.map(r=>r.profile));
  let total=0;
  for(const [offset,d] of definitions.entries()) {
    const n=offset+1, row=original[offset], cases=instances(n), ref=cases[0];
    assert.equal(d.source,'2014h26h-fe-am-'+n);
    assert.deepEqual(d.reference,[0]);
    assert.equal(d.sourceAnswer,keys[offset]);
    assert.equal(row.sourceKey,keys[offset]);
    assert.equal(mark[ref.correctIndex!],keys[offset]);
    if(n===3){
      assert.deepEqual(ref.choices.map(c=>block(c,'formula').text),row.choices);
      assert(row.prompt.includes(block(ref.prompt,'formula').text));
    }else if(n===8){
      const pairs=ref.choices.map(c=>block(c,'table').rows[0]);
      assert.deepEqual(pairs.map(([a,b])=>'a '+a+'、b '+b),row.choices);
    }else if(n===22){
      assert.deepEqual(ref.choices.map(c=>capture(svg(block(c,'diagram')), /data-gate-kind="(\w+)"/)[0]),
        ['AND','OR','NAND','NOR']);
    }else if(n===26){
      assert.deepEqual(ref.choices.map(c=>block(c,'table').rows.map(([name,items])=>name+'（'+items.replaceAll('，',', ')+'）').join('、')),row.choices);
    }else{
      assert.deepEqual(options(ref),row.choices,d.source);
    }
    if(n!==3)assert.equal(ref.prompt[0].type==='paragraph'?ref.prompt[0].text:'',row.prompt,d.source);
    for(const q of cases) {
      assert.equal(q.choices.length,4);
      assert.equal(new Set(q.choices.map(c=>JSON.stringify(c))).size,4,d.source);
      assert.deepEqual(q.prompt.map(b=>b.type),ref.prompt.map(b=>b.type),d.source);
      assert.deepEqual(q.choices.map(c=>c.map(b=>b.type)),ref.choices.map(c=>c.map(b=>b.type)),d.source);
      assert(q.explanation.length>=40,d.source);
    }
    assert.equal(new Set(cases.map(q=>JSON.stringify(q.prompt))).size,cases.length,d.source);
    const signatures=cases.map(q=>JSON.stringify(q.choices[q.correctIndex!]));
    assert(new Set(signatures).size>1,d.source);
    for(const [i,signature] of signatures.entries())for(const [j,prior] of signatures.entries()) {
      if(i===j)continue;
      assert(signatures.some((value,k)=>k!==i&&k!==j&&value!==prior),d.source+': '+signature+'/'+prior);
    }
    for(const bad of [[],[-1],[cases.length],[0.1],[NaN],[0,1],Array(1),Object.assign([0],{extra:true}),
      Object.defineProperty([0],'0',{get:()=>0})])assert.throws(()=>d.build(bad),/PARAMETER_CONSTRAINT/);
    total+=cases.length;
  }
  assert.equal(total,101);
});

test('問1は小数の剰余反復で各候補の有限・循環を判定',()=>{
  for(const body of instances(1)) {
    const base=Number(capture(prompt(body),/(\d+)進数で表す/)[0]);
    const decimals=options(body);
    assert.deepEqual([...decimals].sort((a,b)=>Number(a)-Number(b)),decimals);
    unique(body,decimals.map(value=>{
      const digits=capture(value,/^0\.(\d{1,3})$/)[0], scale=10**digits.length;
      let remainder=Number(digits);
      const seen=new Set<number>();
      while(remainder>0&&!seen.has(remainder)) {
        seen.add(remainder);
        remainder=(remainder*base)%scale;
      }
      return remainder!==0;
    }));
  }
});

test('問2は全256符号を文字配列に分けて8ビットの全候補を照合',()=>{
  const positions=[0,7,2,3];
  for(const [i,body] of instances(2).entries()) {
    assert.match(prompt(body),/8ビット/);
    const strings=Array.from({length:256},(_,value)=>value.toString(2).padStart(8,'0'));
    unique(body,options(body).map(option=>{
      const [mask,op]=capture(option,/16進数([0-9A-F]{2})との(AND|OR|XOR)/);
      const maskBits=Number.parseInt(mask,16).toString(2).padStart(8,'0');
      return strings.map(bits=>{
        const result=[...bits].map((bit,j)=>{
          const yes=bit==='1', selected=maskBits[j]==='1';
          return op==='AND'?yes&&selected:op==='OR'?yes||selected:yes!==selected;
        });
        return result.every((bit,j)=>bit===(j!==positions[i]&&bits[j]==='1'));
      }).every(Boolean);
    }));
  }
});

test('問3は真理値表の8組で表示数式同士を比較',()=>{
  const truth=(s:string,values:Record<string,boolean>)=>s.split('＋').some(term=>
    term.split('・').every(atom=>atom.endsWith('̄')?!values[atom[0]]:values[atom]));
  const inputs=[false,true].flatMap(A=>[false,true].flatMap(B=>[false,true].map(C=>({A,B,C}))));
  for(const body of instances(3)) {
    assert.match(prompt(body),/論理積，＋は論理和，ĀはAの否定/);
    const formulas=[block(body.prompt,'formula'),...body.choices.map(choice=>block(choice,'formula'))];
    for(const formula of formulas){
      assert.equal(formula.format,'unicode');
      for(const [,letter] of formula.text.matchAll(/([ABC])̄/g))assert(formula.alt.includes(letter+'の否定'));
      assert(!formula.alt.includes('̄'));
    }
    const given=formulas[0].text;
    unique(body,body.choices.map(choice=>inputs.every(row=>truth(given,row)===truth(block(choice,'formula').text,row))));
  }
});

test('問5は読める全セルと独立な文字分類から拒否に到達する候補を照合',()=>{
  const chars={empty:'△',sign:'＋－'};
  for(const body of instances(5)) {
    const {columns,rows}=block(body.prompt,'table');
    assert.deepEqual(columns,['現在の状態','空白','数字','符号','小数点','その他']);
    assert.match(prompt(body),/初期状態をa.*状態がeになれば不合格.*左端.*△は空白/);
    const matrix=Object.fromEntries(rows.map(([name,...targets])=>[name,Object.fromEntries(columns.slice(1).map((column,i)=>[column,targets[i]]))]));
    unique(body,options(body).map(word=>{
      let state='a';
      for(const char of word) {
        const kind=char===chars.empty?'空白':chars.sign.includes(char)?'符号':char==='.'?'小数点':Number.isInteger(Number(char))?'数字':'その他';
        state=matrix[state][kind];
        if(state==='e')return true;
      }
      return false;
    }));
  }
});

test('問6は描画された枝と位置を木に復元し、独立なスタックで左右と節点を出力',()=>{
  for(const body of instances(6)) {
    assert.match(block(body.prompt,'code').text,/左の子.*Proc\(l\).*\n.*右の子.*Proc\(r\).*\n.*記号を出力/);
    const drawing=svg(block(body.prompt,'diagram'));
    const columns=Object.fromEntries([...drawing.matchAll(/data-tree-node="([^"]+)"><circle cx="(\d+)"/g)].map(m=>[m[1],Number(m[2])]));
    const edges=[...drawing.matchAll(/data-tree-edge="([^"]+)&gt;([^"]+)"/g)].map(m=>[m[1],m[2]]);
    assert.equal(Object.keys(columns).length,7);
    assert.equal(edges.length,6);
    const roots=Object.keys(columns).filter(node=>!edges.some(([,child])=>child===node));
    assert.equal(roots.length,1);
    const stack:[string,boolean][]=[[roots[0],false]];
    let output='';
    while(stack.length) {
      const [current,visited]=stack.pop()!;
      if(visited)output+=current;
      else {
        stack.push([current,true]);
        const children=edges.filter(([parent])=>parent===current).map(([,child])=>child).sort((a,b)=>columns[b]-columns[a]);
        for(const child of children)stack.push([child,false]);
      }
    }
    unique(body,options(body).map(option=>option===output));
  }
});

test('問7は表示された7命令を独立のリストで実行する',()=>{
  for(const body of instances(7)) {
    const codes=body.prompt.filter(b=>b.type==='code').map(b=>b.text);
    assert.equal(codes.length,2);
    assert.match(codes[0],/push.*\npop.*\nenq.*\ndeq/);
    let stack:string[]=[], queue:string[]=[];
    const steps=codes[1].split('\n');
    assert.equal(steps.length,7);
    const apply=(op:string,arg:string):string=>{
      if(op==='push')stack=[arg,...stack];
      if(op==='enq')queue=[arg,...queue];
      if(op==='pop'){assert(stack.length);const [head,...rest]=stack; stack=rest; return head;}
      if(op==='deq'){assert(queue.length);const [tail,...rest]=queue.reverse(); queue=rest.reverse(); return tail;}
      return '';
    };
    let result='';
    for(const step of steps) {
      const [op,inside]=capture(step.replace(/^x ← /,''),/^(push|pop|enq|deq)\((.*)\)$/);
      const nested=inside.match(/^(pop|deq)\(\)$/);
      result=apply(op,nested?apply(nested[1],''):inside);
    }
    unique(body,options(body).map(candidate=>candidate===result));
  }
});

test('問8は図の二つの終了値と処理候補で実際に配列を書き換える',()=>{
  for(const body of instances(8)) {
    const [first,second]=capture(prompt(body),/配列([XY])に格納した文字列の後ろに，配列([XY])/);
    const start=Number(prompt(body).match(/書込みはZ\((\d+)\)/)?.[1]??'1');
    const drawing=svg(block(body.prompt,'diagram'));
    assert(drawing.includes('変数名：初期値，増分，終値'));
    const stops=[...drawing.matchAll(/data-loop-end="([mn])"/g)].map(m=>m[1]);
    assert.equal(stops.length,2);
    unique(body,body.choices.map(choice=>{
      const [a,b]=block(choice,'table').rows[0];
      return [[2,5],[4,1],[1,3]].every(([m,n])=>{
        const byName:Record<string,string[]>={X:[...'ABCDE'].slice(0,m),Y:[...'vwxyz'].slice(0,n)};
        const lengths:Record<string,number>={m,n};
        const actual=Array<string>(start-1+m+n).fill('空');
        for(const [loop,process] of [a,b].entries()) {
          const [input,expr]=capture(process,/^([XY])\(k\)→Z\(([kmn＋0-9]+)\)$/);
          for(let k=1;k<=lengths[stops[loop]];k++){
            const to=expr.split('＋').reduce((sum,term)=>sum+(term==='k'?k:lengths[term]??Number(term)),0)-1;
            if(byName[input][k-1]===undefined||to<0||to>=actual.length)return false;
            actual[to]=byName[input][k-1];
          }
        }
        return actual.join('|')===Array<string>(start-1).fill('空').concat(byName[first],byName[second]).join('|');
      });
    }));
  }
});

test('問10は100アクセスの合計所要時間から四つのヒット率を評価',()=>{
  for(const body of instances(10)){
    const durations=[...prompt(body).matchAll(/(\d+)ナノ秒/g)].map(m=>Number(m[1]));
    assert.equal(durations.length,3);
    const [main,hit,mean]=durations;
    const values=options(body);
    assert.deepEqual([...values].sort((a,b)=>Number(a)-Number(b)),values);
    unique(body,values.map(ratio=>{
      assert.match(ratio,/^0\.\d{1,2}$/);
      const n=Math.round(Number(ratio)*100);
      return hit*n+main*(100-n)===mean*100;
    }));
  }
});

test('問13は表示された処理の先行関係を全順序候補で判定',()=>{
  for(const [i,body] of instances(13).entries()) {
    const labels=Object.fromEntries([...prompt(body).matchAll(/([①②③④⑤⑥]) ([^\n]+)/g)].map(m=>[m[1],m[2]]));
    assert.equal(Object.keys(labels).length,6);
    assert.match(prompt(body),/リクエスト処理ごとにDBへの接続と切断/);
    unique(body,options(body).map(choice=>{
      const steps=choice.split('，').map(label=>labels[label]);
      assert.equal(new Set(steps).size,6);
      const find=(s:string)=>steps.findIndex(step=>step.includes(s));
      const sql=find('SQL文'), access=find('アクセス'), format=find('の組立て')===sql
        ?steps.findIndex(step=>step.endsWith('の組立て')&&!step.startsWith('SQL文')):find('の組立て');
      const open=find('への接続'), close=find('切断'), send=find('への送信');
      if(!(open<access&&sql<access&&access<format&&format<send&&access<close))return false;
      return i===0?send<close:i===2?format<close&&close<send:close<format;
    }));
  }
});

test('問22は描画された各ゲート種と二入力全4行の真理値で照合',()=>{
  for(const body of instances(22)) {
    const statement=prompt(body);
    const wanted=(x:boolean,y:boolean)=>statement.includes('異なる')?x!==y:statement.includes('同じ')?x===y:statement.includes('出力Zに1');
    unique(body,body.choices.map(choice=>{
      const drawing=svg(block(choice,'diagram'));
      const [gate]=capture(drawing,/data-gate-kind="(AND|OR|NAND|NOR)"/);
      assert.equal((drawing.match(/<circle\b/g)??[]).length,gate.startsWith('N')?7:4);
      const op=(x:boolean,y:boolean)=>{
        switch(gate) {
          case 'AND':return x&&y;
          case 'OR':return x||y;
          case 'NAND':return !(x&&y);
          case 'NOR':return !(x||y);
          default:throw Error(gate);
        }
      };
      return [false,true].every(x=>[false,true].every(y=>op(op(x,y),op(!x,!y))===wanted(x,y)));
    }));
  }
});

test('問26は図の全9矢印と三つの表の直接従属・連結を照合',()=>{
  for(const body of instances(26)) {
    const drawing=svg(block(body.prompt,'diagram'));
    const pairs=[...drawing.matchAll(/data-dependency="([a-j])&gt;([a-j])"/g)].map(m=>[m[1],m[2]]);
    assert.equal(pairs.length,9);
    const attributes=new Set(pairs.flat());
    assert.equal(attributes.size,10);
    unique(body,body.choices.map(choice=>{
      const tables=block(choice,'table').rows.map(([,fields])=>fields.split('，'));
      assert.equal(tables.length,3);
      const connected=tables.slice(1).every(fields=>fields.some(field=>tables[0].includes(field)));
      return connected&&pairs.every(pair=>tables.some(fields=>pair.every(attribute=>fields.includes(attribute))));
    }));
  }
});

type ReviewedKnowledge = { roles:readonly RegExp[]; conditions:readonly (readonly [RegExp,RegExp])[] };
const stableKnowledge:Record<number,ReviewedKnowledge>={
  9:{
    roles:[/^DMA/,/^アドレス指定/,/^仮想記憶/,/^プログラム格納/],
    conditions:[
      [/CPUが順に読み出し/,/プログラム格納/],
      [/転送用の制御装置/,/^DMA/],
      [/実効アドレスをどのように計算/,/アドレス指定/],
      [/補助記憶へ置く/,/仮想記憶/],
    ],
  },
  11:{
    roles:[/電源が供給/,/エラーが発生.*検出/,/検出して自動的に訂正/,/データを暗号化/],
    conditions:[
      [/パリティチェック/,/エラーが発生.*検出/],
      [/電源系統の異常/,/電源が供給/],
      [/SECDED.*1ビット誤り/,/検出して自動的に訂正/],
      [/通信路上で読み取られても/,/データを暗号化/],
    ],
  },
  17:{
    roles:[/領域を作成/,/複数のファイル.*元に戻/,/データを保護/,/連続した領域に再配置/],
    conditions:[
      [/アーカイバ/,/複数のファイル.*元に戻/],
      [/論理フォーマット/,/領域を作成/],
      [/アクセス制御や利用制限/,/データを保護/],
      [/デフラグメンテーション/,/連続した領域に再配置/],
    ],
  },
  18:{
    roles:[/インタプリタ用の中間コード/,/異なるアーキテクチャ/,/処理効率を高めた/,/変数の内容を表示/],
    conditions:[
      [/最適化の説明/,/処理効率を高めた/],
      [/受取先の処理系が実行時に一命令ずつ解釈/,/インタプリタ用の中間コード/],
      [/クロスコンパイル/,/異なるアーキテクチャ/],
      [/実行時のトレース/,/変数の内容を表示/],
    ],
  },
  19:{
    roles:[/ソースコードを解析/,/ドライバ又はスタブ/,/経路から網羅度/,/経路をテストするためのデータ/],
    conditions:[
      [/静的テスト/,/ソースコードを解析/],
      [/外部モジュールは使えない/,/ドライバ又はスタブ/],
      [/行った後.*未確認の箇所/,/経路から網羅度/],
      [/実行されなかった分岐/,/経路をテストするためのデータ/],
    ],
  },
  20:{
    roles:[/^DRAM$/,/^EEPROM$/,/^SDRAM$/,/^SRAM$/],
    conditions:[
      [/フリップフロップ/,/^SRAM$/],
      [/電源を切った後も.*電気的に消去/,/^EEPROM$/],
      [/外部クロックに同期.*最も具体的/,/^SDRAM$/],
    ],
  },
  21:{
    roles:[/高速に書換え.*CPU/,/紫外線で全内容/,/周期的にデータの再書込み/,/ブロック単位で電気的/],
    conditions:[
      [/フラッシュメモリ/,/ブロック単位で電気的/],
      [/フリップフロップ.*SRAM/,/高速に書換え.*CPU/],
      [/石英窓.*EPROM/,/紫外線で全内容/],
      [/主記憶.*DRAM/,/周期的にデータの再書込み/],
    ],
  },
  23:{
    roles:[/コマンド.*マクロ/,/入力エラーを表示/,/全工程.*どこまで/,/前の状態に戻す/],
    conditions:[
      [/定型的な作業を頻繁に/,/コマンド.*マクロ/],
      [/複数の入力不備.*一回で全て/,/入力エラーを表示/],
      [/どれくらいの工程が残っている/,/全工程.*どこまで/],
      [/誤って一部を削除/,/前の状態に戻す/],
    ],
  },
  24:{
    roles:[/^キーフレーム法$/,/^ピクセルシェーダ$/,/^モーションキャプチャ$/,/^モーフィング$/],
    conditions:[
      [/センサやビデオカメラ/,/^モーションキャプチャ$/],
      [/開始時と終了時.*姿勢を補間/,/^キーフレーム法$/],
      [/照明やテクスチャ.*画素の色/,/^ピクセルシェーダ$/],
      [/顔画像.*対応点.*途中画像/,/^モーフィング$/],
    ],
  },
  25:{
    roles:[/^オプティマイザ$/,/^ガーベジコレクション$/,/^クラスタリング$/,/^マージソート$/],
    conditions:[
      [/アクセス経路を選択/,/^オプティマイザ$/],
      [/参照されなくなった古い行バージョン/,/^ガーベジコレクション$/],
      [/同じ部門番号をもつ行をなるべく近く/,/^クラスタリング$/],
      [/整列済みの二つの列の先頭を順に比較/,/^マージソート$/],
    ],
  },
};

test('問9・11・17〜21・23〜25の各状況を固定した全択の意味と照合',()=>{
  for(const [number,review] of Object.entries(stableKnowledge)){
    const cases=instances(Number(number));
    assert.equal(cases.length,review.conditions.length);
    for(const body of cases){
      const condition=review.conditions.filter(([q])=>q.test(prompt(body)));
      assert.equal(condition.length,1,number);
      const choiceTexts=options(body);
      assert.deepEqual(choiceTexts.map((choice,i)=>review.roles[i].test(choice)),[true,true,true,true],number);
      unique(body,choiceTexts.map(option=>condition[0][1].test(option)));
    }
  }
});

type AppliedKnowledge = readonly [question:RegExp, candidates:readonly (readonly [statement:RegExp, valid:boolean])[]];
const appliedKnowledge:Record<number,readonly AppliedKnowledge[]>={
  4:[
    [/正規分布/,[
      [/バスタブ.*連続/,false],[/全ての事象.*等しい/,false],[/平均値.*左右対称.*釣鐘状/,true],[/発生確率は一定.*離散/,false],
    ]],
    [/離散一様分布/,[
      [/待ち時間.*連続/,false],[/有限個.*同じ確率.*離散/,true],[/左右対称.*釣鐘状/,false],[/固定時間内.*発生回数/,false],
    ]],
    [/指数分布/,[
      [/次の発生までの待ち時間.*連続/,true],[/同じ確率.*離散/,false],[/左右対称.*釣鐘状/,false],[/固定時間内.*発生回数/,false],
    ]],
    [/ポアソン分布/,[
      [/待ち時間.*連続/,false],[/同じ確率.*離散/,false],[/左右対称.*釣鐘状/,false],[/固定時間内.*発生回数.*離散/,true],
    ]],
  ],
  12:[
    [/^磁気ディスク装置の性能/,[
      [/回転速度を上げるか位置決め時間を短縮すると短くなる/,true],[/前処理時間.*後処理時間も含む/,false],
      [/1シリンダ当たりのトラック数だけで決まる/,false],[/転送速度は.*回転待ち時間で決まる/,false],
    ]],
    [/位置決めが3ミリ秒短い/,[
      [/アクセス時間.*3ミリ秒短く/,true],[/検索の前処理時間.*必ず3ミリ秒短く/,false],
      [/トラック当たりの記憶容量.*必ず小さく/,false],[/転送速度.*短縮分に反比例/,false],
    ]],
    [/2倍のシリンダ/,[
      [/平均回転待ち時間.*2倍/,false],[/処理装置側.*後処理.*アクセス時間に含まれる/,false],
      [/記憶容量.*2倍/,true],[/媒体転送速度.*2倍/,false],
    ]],
    [/トラック当たりの容量を保ったまま/,[
      [/回転速度を上げると.*回転待ち時間が長く/,false],[/前処理時間が必ず同じ割合/,false],
      [/変更していないトラック数も2倍/,false],[/同じトラック.*転送速度.*2倍にすると2倍/,true],
    ]],
  ],
  14:[
    [/^スループットに関する記述/,[
      [/遊休時間.*影響を及ぼさない/,false],[/CPU性能.*オーバヘッド時間.*影響を受けない/,false],
      [/多重プログラミング.*向上には役立たない/,false],[/スプーリングは.*向上に役立つ/,true],
    ]],
    [/ジョブ間に毎回オペレータ/,[
      [/他の処理を進められなければ.*低下し得る/,true],[/入出力が遅くなっても.*変わらない/,false],
      [/重ねて実行できても.*変化しない/,false],[/キューへ退避.*必ずCPUを待たせる/,false],
    ]],
    [/より高速な装置へ交換/,[
      [/遊休時間.*一切影響しない/,false],[/入出力がボトルネックなら.*向上する場合/,true],
      [/並行動作でスループットは変わらない/,false],[/スプーリング.*常にCPUを長く待たせる/,false],
    ]],
    [/入出力を待っている間に別のジョブ/,[
      [/遊休時間を減らしても.*変化しない/,false],[/入出力を含めずCPUだけ/,false],
      [/別ジョブのCPU処理を重ねる.*上がる場合/,true],[/スプーリング.*完了するまで停止し続ける/,false],
    ]],
  ],
  15:[
    [/^フェールセーフ設計/,[
      [/センサが故障.*アームを強制的に停止/,true],[/数字以外.*正しい入力/,false],
      [/障害.*公衆回線.*処理を続行/,false],[/データ転送処理に障害.*復旧時にまとめて転送/,false],
    ]],
    [/蒸気が作業区画に流れ込まない/,[
      [/整数以外.*再入力/,false],[/給電が止まると.*ばねの力で蒸気の弁を閉じる/,true],
      [/測定の頻度を下げて.*記録を続ける/,false],[/流量データを本体へ保存.*回復後に送る/,false],
    ]],
    [/点検扉が開くと/,[
      [/無効な運転時間を入力できない/,false],[/回線が切れた.*予備回線で通知/,false],
      [/閉じたことを示す信号が得られない.*駆動を遮断/,true],[/遠隔監視ができない.*履歴を本体だけに記録/,false],
    ]],
  ],
  16:[
    [/^ページング方式の仮想記憶/,[
      [/システムダウン.*主記憶の内容が再現/,false],[/必要なページを動的に主記憶に割り当てる/,true],
      [/仮想記憶に置く.*主記憶へのアクセスよりも速める/,false],[/大小のページを使い分け/,false],
    ]],
    [/120ページ.*12ページだけ/,[
      [/電源停止後.*主記憶全体を自動復元/,false],[/全120ページを主記憶に同時に置かず/,true],
      [/補助記憶.*主記憶へ配置したページより速い/,false],[/ページを.*より小さくして/,false],
    ]],
    [/最初の8ページだけを使う/,[
      [/異常終了時.*命令の状態まで自動的に再現/,false],[/全ページが同時に収まらなくても.*使用中のページに枠を割り当て/,true],
      [/主記憶にないページ.*主記憶にある場合より速い/,false],[/総ページ数に応じて固定長ページの長さを変え/,false],
    ]],
  ],
};

test('問4・12・14〜16の図表なし条件は全択の主張と真偽を個別に照合',()=>{
  for(const [number,review] of Object.entries(appliedKnowledge)){
    const cases=instances(Number(number));
    assert.equal(cases.length,review.length);
    for(const body of cases){
      const caseMatches=review.filter(([q])=>q.test(prompt(body)));
      assert.equal(caseMatches.length,1,number);
      const statements=caseMatches[0][1];
      unique(body,options(body).map((option,i)=>{
        const [signature,valid]=statements[i];
        assert.match(option,signature,number);
        return valid;
      }));
    }
  }
});
