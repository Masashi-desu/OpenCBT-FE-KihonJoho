import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {legacy2017AutumnPm9Definition as d,legacy2017AutumnPm9Program as program} from '../src/core/generators/legacy-2017-autumn-pm9';
import {legacy2017AutumnPm9Model as model,legacy2017AutumnPm9Trace as trace,legacy2017AutumnPm9Profiles as profiles,legacy2017AutumnPm9Figure as inspect} from '../src/core/generators/legacy-2017-autumn-pm9-model';
import {Legacy2017AutumnPm9Figure as Figure} from '../src/ui/Legacy2017AutumnPm9Figure';
import {autumnPm9Review as review,autumnPm9SubstringReference as reference,autumnPm9CallReference as callReference,autumnPm9AllOptionTruth as truth,autumnPm9BExecution as bExecution,autumnPm9BCounterexamples as bCounterexamples,autumnPm9CReviewedCandidates as cCandidates} from './fixtures/legacy-2017-autumn-pm9-oracle';
test('秋PM9 全4入力・7欄37択を独立列挙/固定査読値と照合する',()=>{
  for(const [v,input] of review.conditions.entries()){
    const m=model([v]),body=d.build([v]);assert.equal(m.text,input.text);assert.deepEqual(reference(input.text,true).output,m.trace.output);
    const independent=callReference(input.text);assert.equal(independent.calls,input.calls);assert.equal(independent.lastCount,input.lastCount);assert.equal(m.trace.calls.length,input.calls);assert.equal(m.trace.calls.at(-1)!.count,input.lastCount);
    assert.deepEqual(body.answerParts!.map(p=>p.choiceIds.length),review.counts);assert.equal(body.choices.length,37);
    const indexes=body.partAnswers!.map((a,i)=>{assert.equal(a.kind,'choice');return body.answerParts![i].choiceIds.indexOf(a.choiceId);});
    assert.deepEqual(indexes,[4,5,2,4,3,input.calls-2,1]); if(v===0)assert.deepEqual(indexes,review.originalIndexes);
    assert(body.explanation.includes(`計${input.calls}回`));assert(body.explanation.includes(`最後のcountは${input.lastCount}`));
    assert.deepEqual(m.g.length,5);assert.equal(new Set(m.g).size,5);
  }
  assert.equal(model([0]).text.length,43);assert(!model([0]).text.includes('Adam.')); // source has a space, not a period
});
test('秋PM9 a〜eの全26択を別の式/文字比較/添字列で検査する',()=>{
  const t=truth();for(const [i,row] of t.entries()){assert.equal(row.filter(Boolean).length,1);assert.equal(row.indexOf(true),review.originalIndexes[i]);}
});
test('秋PM9 bは記号skip後の実位置を検査し、各誤答の反例と同位置/交差を保持する',()=>{
  for(const c of bCounterexamples){assert.notEqual(bExecution(c.text,c.candidate).answer,c.expected);assert(c.reason);}
  assert(bExecution('a!b!a',5).snapshots.some(s=>s.l===s.r&&s.l===2));
  assert(bExecution('a!!!a',5).snapshots.some(s=>s.l>s.r));
  for(const s of ['a!b!a','a!!!a','Aa','a!b!c'])assert.equal(bExecution(s,5).answer,reference(s,true).start===0&&reference(s,true).end===s.length-1);
});
test('秋PM9 0〜5文字の全3906入力を二つの順序で独立部分文字列列挙と照合する',()=>{
  const alphabet=['a','b','A',' ','!'];let checked=0;
  for(let n=0;n<=5;n++)for(let value=0;value<5**n;value++){
    let k=value,s='';for(let j=0;j<n;j++){s+=alphabet[k%5];k=Math.floor(k/5);}
    for(const longest of [false,true])assert.equal(trace(s,longest).output,reference(s,longest).output,JSON.stringify({s,longest}));
    const expected=callReference(s),actual=trace(s,true);assert.equal(actual.calls.length,expected.calls);assert.equal(actual.calls.at(-1)?.count??0,expected.lastCount);checked++;
  }assert.equal(checked,3906);
  for(const [text,expected] of review.originalExamples)assert.equal(trace(text,false).output,expected);
  assert.equal(trace('abc0cb1bc0cbe',true).output,'bc0cb1bc0cb');
});
test('秋PM9 原55行・空欄3個・変更表6項目・全37択を実component SSRで保持する',()=>{
  assert.equal(program.split('\n').length,55);
  for(let v=0;v<4;v++){
    const body=d.build([v]);const figures=body.prompt.filter(b=>b.type==='diagram');assert.equal(figures.length,11);
    for(const f of figures){assert(f.scene.kind==='source_figure');assert.equal(f.caption,inspect(f.scene.profile,f.scene.values).caption);assert(!f.alt.includes('undefined'));const html=renderToStaticMarkup(createElement(Figure,{profile:f.scene.profile,values:f.scene.values}));assert(!html.includes('undefined'));assert(html.includes('data-legacy-autumn-pm9-profile'));}
    const h=(p:string,values=[v])=>renderToStaticMarkup(createElement(Figure,{profile:p,values}));
    const code=h(profiles[1]);assert.equal((code.match(/data-pm9-line=/g)||[]).length,55);assert.deepEqual([...code.matchAll(/data-pm9-blank="(.)"/g)].map(m=>m[1]),['a','b','c']);
    const changed=h(profiles[2]);assert.deepEqual([...changed.matchAll(/data-pm9-blank="(.)"/g)].map(m=>m[1]),['d','e']);
    for(let i=0;i<7;i++)assert.equal((h(profiles[3],[v,i]).match(/data-pm9-option=/g)||[]).length,review.counts[i]);
    const prose=body.prompt.flatMap(b=>b.type==='paragraph'?[b.text]:[]).join('\n');for(const s of ['英数字1文字','記号及び空白文字','引数の値に誤りはない','終端ナル文字','count以内'])assert(prose.includes(s));
  }
});
test('秋PM9 正答補完した実C原プログラム/最長版をコンパイルし独立解と照合する',()=>{
  const folder=mkdtempSync(join(tmpdir(),'autumn-pm9-'));
  try{
    let c=program.replace('[a]','hit - ith + 1').replace('[b]','tolower(chars[l]) != tolower(chars[r])').replace('[c]','tolower(ch) == tolower(str[i])');
    const inputs=review.conditions.map(x=>x.text).concat(review.originalExamples.map(x=>x[0]));
    for(const longest of [false,true]){
      let source=c;
      if(longest){source=source.replace('const char* find_char(const char*, char);','const char* find_last_char(const char*, char, int);').replace('    const char* hit;','    unsigned int textlen = strlen(text);\n    const char* hit;').replace('find_char(ith + 1, *ith)','find_last_char(ith + 1, *ith, textlen - i - 1)').replace('find_char(hit + 1, *ith)','find_last_char(ith + 1, *ith, psize - 2)').replace('const char* find_char(const char* str, char ch)','const char* find_last_char(const char* str, char ch, int count)').replace("for (i = 0; str[i] != '\\0'; i++)",'for (i = count - 1; i >= 0; i--)');}
      source='#include <string.h>\n'+source+'\nint main(int argc, char** argv) { if(argc != 2) return 2; find_palindrome(argv[1]); return 0; }\n';
      const file=join(folder,'q.c'),exe=join(folder,'q');writeFileSync(file,source);const compile=spawnSync('cc',['-std=c11','-Wall','-Wextra','-Werror',file,'-o',exe],{encoding:'utf8'});assert.equal(compile.status,0,compile.stderr);
      for(const input of inputs){const run=spawnSync(exe,[input],{encoding:'utf8',timeout:2000});assert.equal(run.status,0,run.stderr);assert.equal(run.stdout.trimEnd(),reference(input,longest).output);}
    }
  }finally{rmSync(folder,{recursive:true,force:true});}
});
test('秋PM9 不正入力/不明profile/解答群引数を拒否する',()=>{
  for(const x of [[],[-1],[4],[0.5],[0,1]])assert.throws(()=>d.build(x));
  assert.throws(()=>trace('日本語',true));assert.throws(()=>inspect('unknown',[0]));assert.throws(()=>inspect(profiles[3],[0]));assert.throws(()=>inspect(profiles[0],[0,1]));
});
test('秋PM9 a〜e全26候補のC差込みをASan/UBSan/timeoutで検査し、誤候補は反例を持つ',(t)=>{
  const folder=mkdtempSync(join(tmpdir(),'autumn-pm9-mutants-'));const failures:{group:string;candidate:number;input:string;reason:string}[]=[];
  try{
    const corpus=['abca','aba','Aa','AA','a!!!a','a!b!a','aba!abba','abc0cb1bc0cbe',...review.conditions.map(x=>x.text)];
    for(let group=0;group<5;group++)for(let j=0;j<cCandidates[group].length;j++){
      const expressions=cCandidates.map((row,k)=>row[k===group?j:review.originalIndexes[k]]);
      let source=program.replace('[a]',expressions[0]).replace('[b]',expressions[1]).replace('[c]',expressions[2]);const longest=group>=3;
      if(longest)source=source.replace('const char* find_char(const char*, char);','const char* find_last_char(const char*, char, int);').replace('    const char* hit;','    unsigned int textlen = strlen(text);\n    const char* hit;').replace('find_char(ith + 1, *ith)','find_last_char(ith + 1, *ith, textlen - i - 1)').replace('find_char(hit + 1, *ith)',`find_last_char(ith + 1, *ith, ${expressions[3]})`).replace('const char* find_char(const char* str, char ch)','const char* find_last_char(const char* str, char ch, int count)').replace("for (i = 0; str[i] != '\\0'; i++)",`for (${expressions[4]}; i--)`);
      source='#include <string.h>\n#include <stdlib.h>\n'+source+'\nint main(int argc,char**argv){if(argc!=2)return 2;size_t n=strlen(argv[1]);char*s=malloc(n+1);if(!s)return 3;memcpy(s,argv[1],n+1);find_palindrome(s);free(s);return 0;}\n';
      const file=join(folder,'mutant.c'),exe=join(folder,'mutant');writeFileSync(file,source);
      const compile=spawnSync('cc',['-std=c11','-fsanitize=address,undefined','-fno-sanitize-recover=all',file,'-o',exe],{encoding:'utf8'});assert.equal(compile.status,0,compile.stderr);
      let mismatch=false;
      for(const input of corpus){const run=spawnSync(exe,[input],{encoding:'utf8',timeout:500,env:{...process.env,ASAN_OPTIONS:'detect_leaks=0:halt_on_error=1'}});const expected=reference(input,longest).output;
        if(run.status!==0||run.stdout.trimEnd()!==expected){mismatch=true;failures.push({group:'abcde'[group],candidate:j,input,reason:run.error?'timeout':run.status!==0?'sanitizer/runtime rejection':'output differs from substring reference'});break;}
      }
      assert.equal(mismatch,j!==review.originalIndexes[group],JSON.stringify({group,j,failures}));
    }
    assert.equal(failures.length,21);t.diagnostic(JSON.stringify({allMutantCounterexamples:failures})); // 26 candidates minus one correct per group
  }finally{rmSync(folder,{recursive:true,force:true});}
});
test('秋PM9 実際の全37選択肢を独立原字面/数値役割へ接続し、真偽と正答IDを照合する',()=>{
 for(const[v,c]of review.conditions.entries()){
  const b=d.build([v]),actual=b.choices.map(bs=>{assert.equal(bs.length,1);assert(bs[0].type==='code'||bs[0].type==='paragraph');return bs[0].text;});assert.deepEqual(actual.slice(0,26),cCandidates.flat(),'producer a–e candidate text differs from source-reviewed literal bank');
  const selected=reference(c.text,true),endings=Array.from(c.text,(_,i)=>i).filter(i=>i>selected.start&&c.text[i].toLowerCase()===c.text[selected.start].toLowerCase()).reverse(),before=endings.filter(e=>e>selected.end),counts=[c.text.length-selected.start-1,...before.map(e=>e-selected.start-1)],g=[selected.end-selected.start-1,...counts.reverse()],f=[2,3,4,5,6,7],call=callReference(c.text);
  assert.deepEqual(actual.slice(26,32),f.map(String));assert.deepEqual(actual.slice(32),g.map(String),'producer g candidates differ from independently derived endpoint ranges');const t=[...truth(),f.map(x=>x===call.calls),g.map(x=>x===call.lastCount)];
  for(let part=0;part<7;part++){assert.equal(t[part].filter(Boolean).length,1);const answer=b.partAnswers![part];assert(answer.kind==='choice');assert.equal(answer.choiceId,b.answerParts![part].choiceIds[t[part].indexOf(true)]);}
 }
});
