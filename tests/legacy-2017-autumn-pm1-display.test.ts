import test from 'node:test';import assert from 'node:assert/strict';import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {legacy2017AutumnPm1Definition as d} from '../src/core/generators/legacy-2017-autumn-pm1';
import {Legacy2017AutumnPm1Figure,Legacy2017AutumnPm1Paragraph,isLegacy2017AutumnPm1Underlined} from '../src/ui/Legacy2017AutumnPm1Figure';
import {legacy2017AutumnPm1StudyTerms as terms} from '../src/core/generators/legacy-2017-autumn-pm1-study-terms';
const profile='legacy-2017-autumn-pm1-session',caption='図1　SSHセッションの流れ';
const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
test('autumn PM1 dedicated real component preserves overall session, three intervals, direction and exact source underlines',()=>{
 for(let v=0;v<3;v++){
  const html=renderToStaticMarkup(createElement(Legacy2017AutumnPm1Figure,{profile,values:[v],caption}));
  for(const text of ['SSHセッション開始','SSHセッション終了','SSHセッション','安全な通信経路の確立','利用者認証','ログインセッション','時間'])assert(html.includes(text));
  assert(html.includes('M100 45V170 M860 45V170 M390 112V170 M575 112V170'));assert.deepEqual([...html.matchAll(/<path data-pm1-interval="(\d)" d="([^"]+)" marker-start="([^"]+)" marker-end="([^"]+)"/g)].map(m=>{assert(m[3].endsWith('-start)'));assert(m[4].endsWith('-end)'));return[m[1],m[2]]}),[['0','M100 80H860'],['1','M100 145H390'],['2','M390 145H575'],['3','M575 145H860']]);assert(html.includes('M8 0L0 4L8 8'));assert(html.includes('M0 0L8 4L0 8'));assert(html.includes('M80 200H925'));assert(!html.includes('auto-start-reverse'));assert(html.includes('<desc'));assert(!html.includes('<image'));
  const paragraphs=d.build([v]).prompt.filter(b=>b.type==='paragraph').filter(b=>isLegacy2017AutumnPm1Underlined(b.text));assert.equal(paragraphs.length,3);
  const spans=paragraphs.map(p=>{const h=renderToStaticMarkup(createElement(Legacy2017AutumnPm1Paragraph,{text:p.text}));assert.equal((h.match(/<u /g)??[]).length,1);assert.equal(decode(h.replace(/<[^>]*>/g,'')),p.text);return decode(h.match(/<u [^>]*>(.*?)<\/u>/s)![1]);});
  assert.deepEqual(spans,['①クライアントがサーバ認証を行う。','②共通鍵暗号方式による通信データの暗号化','③“パスワード認証”は，“公開鍵認証”に比べて，安全性が低いと考えられている。']);
 }
});
test('autumn PM1 direct component rejects foreign profiles, changed source caption, malformed domain and arbitrary underline text',()=>{
 for(const props of[{profile:'waf-network',values:[0],caption},{profile,values:[3],caption},{profile,values:[0,1],caption},{profile,values:[NaN],caption},{profile,values:[0],caption:'図だけ'}])assert.throws(()=>renderToStaticMarkup(createElement(Legacy2017AutumnPm1Figure,props)));
 for(const text of['①クライアントがサーバ認証を行う。','<u>別の本文</u>','“公開鍵認証”は不要'])assert.throws(()=>renderToStaticMarkup(createElement(Legacy2017AutumnPm1Paragraph,{text})),/AUTUMN_PM1_UNDERLINE_SOURCE/);
});
test('autumn PM1 terminology keeps protocol, key owner, transport and user authentication distinct',()=>{
 const names=new Map(terms.map(t=>[t.term,t]));
 for(const[term,expansion]of [['SSH','Secure Shell'],['DoS攻撃','Denial of Service'],['XSS','Cross-Site Scripting'],['CSRF','Cross-Site Request Forgery'],['利用者ID','Identifier']])assert.equal(names.get(term)!.expansion,expansion);
 assert.match(names.get('公開鍵認証')!.meaning,/クライアントの公開鍵を事前登録/);assert.match(names.get('サーバ認証')!.meaning,/サーバ公開鍵/);assert.match(names.get('セッション鍵')!.meaning,/署名を検証する公開鍵とは役割が異なる/);assert.match(names.get('パスワード認証')!.meaning,/先に確立した暗号化経路/);assert.match(names.get('中間者攻撃')!.meaning,/なりすまし/);assert.equal(names.size,terms.length);
});
