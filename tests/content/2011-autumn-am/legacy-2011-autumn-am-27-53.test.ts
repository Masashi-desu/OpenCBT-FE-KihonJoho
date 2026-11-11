import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { answerCanVary, answerSignature } from '../../../src/core/generation';
import { additionalContracts, additionalDefinitions, additionalVersion, definitionForVersion, registerAdditionalDefinitions } from '../../../src/core/generators/index';
import type { Question } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2011AutumnAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2011-autumn-am-27-53';
import { legacy2011AutumnAm2753Figures as figures } from '../../../src/core/generators/legacy-2011-autumn-am-27-53-figures';
import source from '../../../src/core/generators/legacy-2011-autumn-am-27-53-source.json';
import { legacy2011AutumnAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2011AutumnAm2753Figures';
import { fixture } from '../../fixtures';
import { facts } from '../../fixtures/legacy-2011-autumn-am-27-53-facts';

const numbers=Array.from({length:27},(_,i)=>i+27);
const paperKeys='イエウアエアエエアエウウイエアエイウエエイエウイエアア';
const definition=(n:number)=>definitions[n-27];
const cases=(n:number)=>Array.from({length:definition(n).fields[0].maximum+1},(_,i)=>definition(n).build([i]));
const paragraphs=(q:GeneratedBody)=>q.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join('\n');
const options=(q:GeneratedBody)=>q.choices.map(choice=>{
  assert.equal(choice.length,1);
  const block=choice[0];
  assert.equal(block.type,'paragraph');
  return block.text;
});
function diagram(q:GeneratedBody) {
  const block=q.prompt[1];
  assert.equal(block.type,'diagram');
  return block;
}
function check(q:GeneratedBody, matches:readonly boolean[]) {
  assert.equal(matches.length,4);
  assert.deepEqual(matches.flatMap((yes,i)=>yes?[i]:[]),[q.correctIndex],paragraphs(q));
}
const label=(q:GeneratedBody,correct:string)=>check(q,options(q).map(value=>value===correct));
const assertAll= (q:GeneratedBody, predicate:(choice:string,index:number)=>boolean)=>check(q,options(q).map(predicate));

test('公式27問・4択・基準本文・有限入力と配布Block Schemaを照合',()=>{
  assert.equal(paperKeys.length,27);
  assert.deepEqual(definitions.map(row=>Number(row.source.split('-').at(-1))),numbers);
  const folder='docs/public/schemas';
  const ajv=new Ajv2020({strict:false,allErrors:true});
  addFormats(ajv);
  for(const file of fs.readdirSync(folder).filter(file=>file.endsWith('.schema.json')))
    ajv.addSchema(JSON.parse(fs.readFileSync(folder+'/'+file,'utf8')));
  const validate=ajv.getSchema('https://opencbt-fe-kihonjoho.example/schemas/3.0.0/common.schema.json#/$defs/block');
  assert(validate);
  for(const [i,n] of numbers.entries()){
    const d=definition(n), original=source[String(n) as keyof typeof source], base=d.build([0]);
    assert.equal(d.sourceAnswer,paperKeys[i]);
    assert.equal('アイウエ'[base.correctIndex!],paperKeys[i]);
    assert.deepEqual(options(base),original.choices);
    assert.equal(paragraphs(base).split('\n')[0],original.prompt);
    assert.deepEqual(d.reference,[0]);
    assert.equal(d.fields[0].minimum,0);
    const all=cases(n);
    assert(all.length>=3);
    assert.equal(new Set(all.map(q=>JSON.stringify(q.prompt))).size,all.length,String(n));
    for(const [j,q] of all.entries()){
      assert.equal(q.choices.length,4);
      assert.equal(new Set(options(q)).size,4);
      assert.ok(q.explanation.length>=55,'解説 '+n);
      assert.deepEqual(q,d.build([j]));
      for(const block of [...q.prompt,...q.choices.flat()]){
        assert(validate(block),n+' '+JSON.stringify(validate.errors));
      }
    }
    for(const invalid of [[],[0,0],[-1],[all.length],[0.5],[NaN]]) assert.throws(()=>d.build(invalid),{code:'PARAMETER_CONSTRAINT'});
  }
});

test('通常アプリのanswerCanVaryが全27系列の実際の正答内容の変化と一致',()=>{
  const definitionsCount=additionalDefinitions.length, contractsCount=additionalContracts.length;
  const distribution=fixture(), carrier=distribution.questions.find(question=>!question.answerParts);
  assert(carrier);
  const template=distribution.templates[0];
  try {
    registerAdditionalDefinitions(definitions);
    for(const [i,n] of numbers.entries()){
      const d=definitions[i], version=additionalVersion(d), id='generator-source-'+d.source;
      assert.equal(definitionForVersion(id,version),d);
      const signatures=new Set(cases(n).map(body=>{
        const question:Question={
          ...carrier, origin:{...carrier.origin,derivedFrom:[]},
          choices:body.choices.map((blocks,index)=>({id:'choice-'+index,content:{attribution:carrier.prompt.attribution,blocks}})),
          correctAnswer:{choiceId:'choice-'+body.correctIndex,attribution:carrier.correctAnswer.attribution},
        };
        return answerSignature(question);
      }));
      assert(signatures.size>=2,d.source);
      assert.equal(answerCanVary({...template,generatorRef:{id,version}}),signatures.size>1);
    }
  } finally {
    additionalDefinitions.splice(definitionsCount);
    additionalContracts.splice(contractsCount);
  }
});

for(const [key,review] of Object.entries(facts)){
  test('問'+key+'の対象・四択の役割・結論を一次資料と照合',()=>{
    const outputs=cases(Number(key));
    assert.equal(outputs.length,review.cases.length);
    assert.match(review.basis,/^https:\/\//);
    const visited=new Set<RegExp>();
    for(const q of outputs){
      const matches=review.cases.filter(([condition])=>condition.test(paragraphs(q)));
      assert.equal(matches.length,1);
      const [[condition,expected,explanation]]=matches;
      visited.add(condition);
      const used=new Set<string>();
      assertAll(q,value=>{
        const classes=Object.entries(review.options).filter(([,pattern])=>pattern.test(value));
        assert.equal(classes.length,1,value);
        const role=classes[0][0];
        assert(!used.has(role),value);
        used.add(role);
        return role===expected;
      });
      assert.match(q.explanation,explanation);
    }
    assert.equal(visited.size,review.cases.length);
  });
}

test('問28の注文データの項目順・型と全検査方式を照合',()=>{
  const rule:readonly (readonly [RegExp,string])[]=[
    [/受付順に1ずつ増え/,'シーケンスチェック'],[/同じ伝票番号が既に/,'重複チェック'],
    [/月2桁，日2桁を続けた8桁/,'フォーマットチェック'],[/入力日以前の営業日/,'論理チェック'],
  ];
  for(const q of cases(28)){
    const result=rule.filter(([pattern])=>pattern.test(paragraphs(q)));
    assert.equal(result.length,1);
    label(q,result[0][1]);
    assert(q.explanation.includes(result[0][1]));
    assert.equal(diagram(q).alt,'注文データ。伝票番号（文字）｜注文日（文字）｜商品コード（文字）｜数量（数値）｜顧客コード（文字）。');
  }
});

test('問29を候補の前後1分での必要バイト数から独立検算',()=>{
  for(const q of cases(29)){
    const m=paragraphs(q).match(/1秒間に([0-9,]+)回.*それぞれ(\d+)ビット.*このとき，(\d+)×10⁶バイト.*最大何分/);
    assert(m);
    const samples=Number(m[1].replaceAll(',','')), bit=Number(m[2]), capacity=Number(m[3])*1_000_000;
    assert.equal(bit,8);
    const perMinute=samples*60*bit/8, allowed=(minutes:number,rate:number)=>minutes*rate<=capacity&&(minutes+1)*rate>capacity;
    const values=options(q).map(Number);
    assert.deepEqual(values,[...values].sort((a,b)=>a-b));
    check(q,values.map(minutes=>allowed(minutes,perMinute)));
    assert(allowed(values[0],perMinute*10));
    assert(allowed(values[1],perMinute*8));
    assert(allowed(values[3],perMinute*4/5));
    assert(q.explanation.includes(values[2]+'分'));
  }
});

test('問32の関係演算を共通要素を持つ有限集合の全ケースで比較',()=>{
  const bits=(set:number,index:number)=>(set>>index)&1;
  const examples=Array.from({length:16},(_,left)=>Array.from({length:16},(_,right)=>[left,right])).flat().filter(([left,right])=>
    (left&right)>0&&left!==right&&left!==15&&right!==15);
  for(const q of cases(32)){
    const formula=paragraphs(q).match(/関係演算([RS∪−()]+)と同じ/);
    assert(formula);
    assert.match(paragraphs(q),/−は差集合，∩は共通集合，∪は和集合，×は直積，÷は商/);
    const description:Record<string,(l:number,r:number)=>number>={
      'R−(R−S)':(l,r)=>l&~(l&~r),'S−(S−R)':(l,r)=>r&~(r&~l),
      'R∪(S−R)':(l,r)=>l|(r&~l),'S∪(R−S)':(l,r)=>r|(l&~r),
    };
    const candidate=(text:string,left:number,right:number)=>{
      if(text==='R∩S') return Array.from({length:4},(_,j)=>bits(left,j)&&bits(right,j)?String(j):'').filter(Boolean);
      if(text==='R∪S') return Array.from({length:4},(_,j)=>bits(left,j)||bits(right,j)?String(j):'').filter(Boolean);
      if(text==='R×S') return Array.from({length:4},(_,j)=>Array.from({length:4},(_,k)=>bits(left,j)&&bits(right,k)?j+':'+k:'')).flat().filter(Boolean);
      assert.equal(text,'R÷S');
      return (right&~left)===0?['()']:[];
    };
    assertAll(q,text=>examples.every(([left,right])=>{
      const result=description[formula[1]](left,right);
      const expected=Array.from({length:4},(_,j)=>bits(result,j)?String(j):'').filter(Boolean);
      return JSON.stringify(candidate(text,left,right))===JSON.stringify(expected);
    }));
    assert(q.explanation.includes(options(q)[q.correctIndex!]));
  }
});

test('問33のUML多重度を反対端からの下限・上限で独立検算',()=>{
  for(const [index,q] of cases(33).entries()){
    const m=diagram(q).alt.match(/納品側に(1(?:\.\.\*)?)，請求側に([01](?:\.\.(?:1|\*))?)/);
    assert(m);
    if(index===0) assert.deepEqual(m.slice(1),['1..*','0..1']);
    const allows=(multiplicity:string,n:number)=>{
      const [min,max=min]=multiplicity.split('..');
      return n>=Number(min)&&(max==='*'||n<=Number(max));
    };
    assertAll(q,choice=>{
      if(choice.includes('分割請求')) return allows(m[2],2);
      if(choice.includes('請求しなくてよい')) return allows(m[2],0);
      if(choice.includes('複数回の納品')) return allows(m[1],2);
      assert.match(choice,/支払で相殺|同時に実行/);
      return false;
    });
    assert.match(q.explanation,/反対側の1件/);
  }
});

test('問35の四つの表操作が説明する行・列・結合・挿入を照合',()=>{
  const actualOperation=(statement:string)=>{
    if(statement.includes('二つ以上の表を連結')) return '結合';
    if(statement.includes('条件に合致した行を取り出す')) return '選択';
    if(statement.includes('特定の列を取り出す')) return '射影';
    if(statement.includes('新しい行を追加')) return '挿入';
    assert.match(statement,/特定の列を挿入/);
    return '列の追加';
  };
  const expected=[null,'射影','選択','挿入'];
  for(const [i,q] of cases(35).entries()) assertAll(q,statement=>{
    const named=statement.split('は，')[0], action=actualOperation(statement);
    return named===action&&(expected[i]===null||action===expected[i]);
  });
});

test('問37のOSI中継装置を指定された層の順序で照合',()=>{
  const layer:Record<string,string>={物理層:'リピータ',データリンク層:'ブリッジ',ネットワーク層:'ルータ'};
  for(const q of cases(37)){
    const found=[...paragraphs(q).matchAll(/(物理層|データリンク層|ネットワーク層)で中継する装置/g)].map(m=>m[1]);
    assert.equal(new Set(found).size,3);
    assertAll(q,choice=>choice.split('，').every((device,i)=>device===layer[found[i]]));
    assert(q.explanation.includes(found.map(item=>layer[item]).join('，')));
  }
});

test('問45のモジュール強度を設計書の制御とデータの関係から照合',()=>{
  const facts=[[/上位モジュールから渡される処理コード.*挿入処理.*更新処理.*削除処理/,'論理的強度'],
    [/同じ在庫データ.*独立した入口点/,'情報的強度'],[/金額集計へ渡し.*この順に実行/,'連絡的強度'],
    [/相互に無関係な.*理由だけ/,'暗合的強度']] as const;
  for(const q of cases(45)){
    const row=facts.find(([pattern])=>pattern.test(paragraphs(q)));
    assert(row);
    assertAll(q,choice=>choice.startsWith('これは“'+row[1]+'”'));
    assert(q.explanation.includes(row[1]));
  }
});

test('問46のオブジェクト指向の四要素を全候補で照合',()=>{
  for(const q of cases(46)){
    const rule=paragraphs(q), dynamic=/同じ操作名で実体に応じた動作/.test(rule);
    const required=['抽象化','カプセル化',dynamic?'ポリモーフィズム':'継承','クラス'];
    assertAll(q,choice=>{
      const terms=choice.split('，');
      assert.equal(terms.length,4);
      return required.every(term=>terms.includes(term));
    });
    assert(q.explanation.includes(required[2]));
  }
});

test('問51は原図で独立に列挙した経路の最長到達時刻で検算',()=>{
  const ends=['1→2','1→3','2→3','2→4','2→5','3→5','4→6','5→6'];
  for(const [i,q] of cases(51).entries()){
    const alt=diagram(q).alt, edges=[...alt.matchAll(/結合点(\d→\d)に作業([A-H])（(\d)日）/g)];
    assert.deepEqual(edges.map(e=>e[1]),ends);
    assert.deepEqual(edges.map(e=>e[2]),[...'ABCDEFGH']);
    assert.match(alt,/結合点4→5の破線はダミー作業/);
    assert.match(paragraphs(q),/結合点5の最早結合点時刻/);
    const times=edges.map(e=>Number(e[3]));
    if(i===0) assert.deepEqual(times,[3,2,1,4,2,2,1,1]);
    const [a,b,c,d,e,f]=times;
    const earliest=Math.max(a+e,b+f,a+c+f,a+d);
    label(q,String(earliest));
    assert.deepEqual(options(q),['4','5','6','7']);
    assert.match(q.explanation,new RegExp('最早結合点時刻は第'+earliest+'日'));
  }
});

test('問52のファンクションポイントを重みの反復加算と比率の逆算で照合',()=>{
  const names=['外部入力','外部出力','内部論理ファイル','外部インタフェースファイル','外部照会'];
  for(const [i,q] of cases(52).entries()){
    const block=q.prompt[1];
    assert.equal(block.type,'table');
    assert.deepEqual(block.columns,['ユーザファンクションタイプ','個数','重み付け係数']);
    assert.deepEqual(block.rows.map(row=>row[0]),names);
    assert.deepEqual(block.rows.map(row=>row[2]),['4','5','10','7','4']);
    if(i===0) assert.deepEqual(block.rows.map(row=>row[1]),['1','2','1','0','0']);
    assert.match(paragraphs(q),/複雑さの補正係数は0\.75/);
    const raw=block.rows.flatMap(row=>Array<number>(Number(row[1])).fill(Number(row[2]))).reduce((sum,weight)=>sum+weight,0);
    const values=options(q).map(Number);
    assert(values.every(Number.isInteger));
    check(q,values.map(value=>value*4===raw*3));
    assert.deepEqual(values.slice(1).map((value,i)=>value*[1,4,3][i]),[raw,raw*5,raw*4]);
    assert(q.explanation.includes('合計は'+raw));
  }
});

test('注文データ・多重度・最早結合点の全図を描画する',()=>{
  assert.deepEqual(figures.map(item=>item.profile),renderers.map(item=>item.profile));
  for(const [i,n] of [28,33,51].entries()){
    const figure=figures[i], renderer=renderers[i];
    for(const body of cases(n)){
      const block=diagram(body);
      assert.equal(block.scene.kind,'source_figure');
      const {profile,values}=block.scene;
      assert.equal(profile,figure.profile);
      figure.validate(values);
      assert.equal(figure.alt(values),block.alt);
      const html=renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values}));
      assert.match(html,/<svg.*role="img"/);
      assert.match(html,/tabindex="0"/i);
      assert.match(html,/currentColor/);
      assert(html.includes(block.alt));
      if(n===28) assert.equal([...html.matchAll(/<rect /g)].length,5);
      if(n===51){
        assert.equal([...html.matchAll(/stroke-dasharray="5 4"/g)].length,2);
        assert.match(html,/凡例.*作業名.*所要日数.*ダミー作業/);
      }
    }
    for(const values of [[-1],[0.5],[figure.domain[0][1]+1],[],[0,0]]) assert.throws(()=>figure.validate(values),{code:'FIGURE_PROFILE'});
  }
});
