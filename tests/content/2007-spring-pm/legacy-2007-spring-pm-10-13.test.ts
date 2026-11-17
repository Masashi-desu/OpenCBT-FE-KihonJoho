import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2007PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2007-spring-pm-10-13';
import { legacy2007SpringPm1013Figures as figures } from '../../../src/core/generators/legacy-2007-spring-pm-10-13-figures';
import { q12Board, q12Output } from '../../../src/core/generators/legacy-2007-spring-pm-12';
import { q13Bitmap } from '../../../src/core/generators/legacy-2007-spring-pm-13';
import { legacy2007SpringPm1013FigureRenderers as figureRenderers } from '../../../src/ui/Legacy2007SpringPm1013Figures';
import { referenceRoster, referenceTic, rosterCases, simulateRoster, simulateTic, type Point } from '../../fixtures/legacy-2007-spring-pm-language-reference';
import { caslMachine, fromWords, toWords } from '../../fixtures/legacy-2007-spring-pm-casl-machine';

const sourceKeys = ['アオエアイ','アウウイウオ','エカイカウ'];
const symbols = 'アイウエオカ';
export const choices = (body: GeneratedBody) => Object.fromEntries(body.answerParts!.map(part => [part.id.slice(5),part.choiceIds.map(id => {
  const block = body.choices[Number(id.split('-').at(-1)) - 1][0];
  assert(block.type === 'code' || block.type === 'paragraph' || block.type === 'diagram');
  return block.type === 'diagram' ? block.alt : block.text;
})]));
export const correct = (body: GeneratedBody) => Object.fromEntries(body.answerParts!.map(part => {
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' ? answer.partId === part.id
    : answer.kind === 'unordered' && answer.partIds.includes(part.id));
  assert(answer?.kind === 'choice' || answer?.kind === 'unordered');
  const id = answer.kind === 'choice' ? answer.choiceId : answer.choiceIds[answer.partIds.indexOf(part.id)];
  return [part.id.slice(5),part.choiceIds.indexOf(id)];
}));
export const code = (body: GeneratedBody, lang: string) => body.prompt.flatMap(block =>
  block.type === 'code' && block.language === lang ? [block.text] : []);
export const paragraphs = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const answerBanks = [
  {a:4,b:6,c:6,d:6,'2':4}, {a:4,b:4,c:4,d:4,x:5,y:5}, {a:6,b:6,c:6,d:6,'2':6},
];

test('問11〜13は公式選択肢順・採点単位・全4条件・全文代替テキストを保持する', () => {
  assert.deepEqual(drafts.map(row=>row.number),[11,12,13]);
  for (const [j,draft] of drafts.entries()) {
    const original=draft.original(), base=draft.definition.build([0]), expectedOrder = original.answerParts!.map(part=>part.id.slice(5));
    for (const body of [original,base]) {
      const answers = correct(body);
      assert.equal(expectedOrder.map(id=>symbols[answers[id]]).join(''),sourceKeys[j]);
      assert.equal(body.partAnswers!.length,5);
      assert.equal(body.answerParts!.length,j===1?6:5);
    }
    assert.deepEqual(Object.values(draft.originalPageAlt()).map(alt=>alt.trim().length>100),Array(j===2?4:5).fill(true));
    const variants=Array.from({length:4},(_,i)=>draft.definition.build([i]));
    assert.equal(new Set(variants.map(row=>JSON.stringify(row.prompt))).size,4);
    for (const body of variants) {
      assert.deepEqual(body.prompt.map(block=>block.type),base.prompt.map(block=>block.type));
      assert.deepEqual(body.answerParts!.map(part=>part.id.slice(5)),expectedOrder);
      assert.deepEqual(Object.fromEntries(Object.entries(choices(body)).map(([id,bank])=>[id,new Set(bank).size])),answerBanks[j]);
      if(j===1) assert(body.partAnswers!.some(answer=>answer.kind==='unordered'&&answer.partIds.length===2&&answer.presentation==='checklist'));
      assert(body.explanation.length>125);
    }
    for (const values of [[],[0,3],[-1],[4],[0.5],[NaN],Array<number>(1)]) assert.throws(()=>draft.definition.build(values),/範囲外/);
  }
});

test('問11は名簿を直接突き合わせた結果と全肢を照合する', () => {
  for(let i=0;i<4;i++) {
    const body=drafts[0].definition.build([i]), key=correct(body), options=choices(body);
    const gr=Number(/(\d)学年を修了/.exec(paragraphs(body))![1]);
    assert.equal(gr,[6,5,4,7][i]);
    const lines=code(body,'cobol').join('\n').split('\n');
    assert.equal(lines.length,98);
    assert.match(lines[86],new RegExp('^87 +IF OLD-NUM\\(OLD-CNT\\) < '+gr+' THEN$'));
    assert.deepEqual(options['2'].map(option=>Number(/行番号(\d+)/.exec(option)![1])),[53,82,90,92]);
    const fixtures=rosterCases(gr);
    for(const [field,bank] of Object.entries(options)) {
      const matches=bank.map((_,j)=>fixtures.every(input=>
        JSON.stringify(simulateRoster(input,gr,{...key,[field]:j}))===JSON.stringify(referenceRoster(input,gr))));
      assert.deepEqual(matches,bank.map((_,j)=>j===key[field]),field);
    }
  }
});

export const ticInputs = (body: GeneratedBody) => {
  const [symbols,, ,tester] = code(body,'java');
  const letters = /CIRCLE\('(.)'\), CROSS\('(.)'\)/.exec(symbols)!.slice(1);
  const moves=[.../int\[\]\[\] p = \{([\s\S]*?)\};/.exec(tester)![1].matchAll(/\{([0-2]), ([0-2])\}|null/g)];
  return { letters, steps:moves.map(move=>move[0]==='null'?null:[Number(move[1]),Number(move[2])] as Point) };
};

test('問12は全四条件の実行例・アンチ対角線・全5記述を独立盤面モデルと照合する', () => {
  const anti:Point[]=[[0,2],[0,0],[1,1],[2,2],[2,0],[0,1]];
  const horizontal:Point[]=[[0,1],[0,0],[1,1],[1,0],[2,1],[2,2]];
  for(let i=0;i<4;i++) {
    const body=drafts[1].definition.build([i]), key=correct(body), options=choices(body);
    const {letters,steps}=ticInputs(body);
    const full=referenceTic(steps,letters);
    assert.equal(q12Output.panel([i]).text,full.slice(20).join('\n'));
    assert.deepEqual(q12Board.panel([i]).rows,full.slice(-4,-1).map(row=>[row[0],row[2],row[4]]));
    assert.deepEqual(full.slice(-5).filter(line=>line.startsWith('Turn')),['Turn : CIRCLE : CIRCLE_WON']);
    for(const field of 'abcd') {
      const matches=options[field].map((_,j)=>[steps,anti,horizontal].every(path=>
        JSON.stringify(simulateTic(path,letters,{...key,[field]:j}))===JSON.stringify(referenceTic(path,letters))));
      assert.deepEqual(matches,options[field].map((_,j)=>j===key[field]),field);
    }
    const repeat: (Point|null)[]=[[0,0],[1,1],null,null,[2,2],null,[0,1],[2,0],null];
    const trace=referenceTic(repeat,letters), occupied=(rows:string[])=>rows.join('').replaceAll(' ','').length;
    const afterTwo=occupied(trace.slice(5,8)), afterTwice=occupied(trace.slice(9,12));
    const erasedBetween=afterTwo-afterTwice, failure=trace.slice(12,14).includes('Game is over.');
    const repeatTurns = trace.filter(row=>row==='undo').length-trace.filter(row=>row==='Game is over.').length;
    assert.deepEqual([erasedBetween===2,erasedBetween===0,erasedBetween===1,repeatTurns<=2,failure],
      options.x.map((_,j)=>j===key.x||j===key.y));
  }
});

test('問13は全命令候補をCOMET IIの命令実行・集合による領域管理と照合する', () => {
  for(let i=0;i<4;i++) {
    const body=drafts[2].definition.build([i]), key=correct(body), banks=choices(body), sources=code(body,'casl2');
    const {count,width,bits}=q13Bitmap.panel([i]);
    assert.equal(Number(/連続する(\d+)要素/.exec(paragraphs(body))![1]),count);
    assert.equal(Number(/連続する(\d+)語/.exec(paragraphs(body))![1]),width);
    if(i===0) assert.equal(bits.join(''),'1100100001101110');
    const firstWord=Number.parseInt(/最初の語の値が#([0-9A-F]{4})/.exec(paragraphs(body))![1],16);
    assert.equal(Number(banks['2'][key['2']]),fromWords([firstWord]).indexOf(false));
    assert.deepEqual(banks['2'].map(option=>Number(option)===fromWords([firstWord]).indexOf(false)),banks['2'].map((_,j)=>j===key['2']));
    const full=count/16, wires=Array(full).fill(0xffff), sparse=[0,15,16,count-1];
    const scenarios=[[firstWord,...wires.slice(1)],wires,wires.map(()=>0),toWords(Array.from({length:count},(_,j)=>!sparse.includes(j))),[0x4000,...wires.slice(1)]];
    const chosen=Object.fromEntries([...'abcd'].map(name=>[name,banks[name][key[name]]]));
    const matches=(fragments:Record<string,string>)=>scenarios.every(words=>{
      const machine=caslMachine(sources,fragments,words), state=fromWords(words);
      const match=()=>JSON.stringify(machine.map())===JSON.stringify(toWords(state));
      const allocate=()=>{
        const item=state.indexOf(false), call=machine.call(1,0);
        if (!call?.preserved || call.value!==(item<0?-1:machine.base+item*width)) return false;
        if(item>=0) state[item]=true;
        return match() && (item<0 || item%16===call.found);
      };
      const release=(item:number)=>{
        const call=machine.call(2,machine.base+item*width);
        if(!call?.preserved) return false;
        state[item]=false;return match();
      };
      for(let n=0;n<=count;n++) if(!allocate()) return false;
      for(const item of sparse) if(!release(item)) return false;
      for(let n=0;n<=sparse.length;n++) if(!allocate()) return false;
      state.fill(false);
      const zeroed=machine.call(0,0);
      return Boolean(zeroed?.preserved)&&match()&&allocate();
    });
    for (const name of 'abcd') assert.deepEqual(banks[name].map(option=>matches({...chosen,[name]:option})),
      banks[name].map((_,j)=>j===key[name]), name+' case '+i);
  }
});

test('全図を原形式・四条件・関連付け・共有の表現で描画する', () => {
  assert.deepEqual(figureRenderers.map(renderer=>renderer.profile),figures.map(figure=>figure.profile));
  for(const [n,renderer] of figureRenderers.entries()) for(const i of [0,1,2,3]) {
    const out=renderToStaticMarkup(React.createElement(renderer.component,{caption:figures[n].profile,values:[i]}));
    assert.match(out,/class="diagram-scroll"/);
    assert.match(out,/aria-description="[^"]{8,}"/);
    assert.match(out,/<(?:table|svg|pre)\b/);
    assert(out.includes('data-figure-profile="'+renderer.profile+'"'));
  }
});
