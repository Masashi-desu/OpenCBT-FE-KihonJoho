import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {contentTextParts,ContentParagraph} from "../src/ui/ContentText";
import {Content} from "../src/ui/Content";
import {fixture} from "./fixtures";
test("paragraph numeric layout preserves exact input while protecting IPv4, signed decimals, fractions, dates and units",()=>{
  const text="IPは192.168.0.254、経路192.0.2.1/24、接続192.0.2.1:8080。−12.50秒、-1,234.50円、＋20％、1/72インチ、10⁶ビット、2.30件／秒、25 cm、2018-04-01。";
  const parts=contentTextParts(text);assert.equal(parts.map(p=>p.text).join(""),text);assert.deepEqual(parts.filter(p=>p.atomic).map(p=>p.text),["192.168.0.254","192.0.2.1/24","192.0.2.1:8080","−12.50秒","-1,234.50円","＋20％","1/72インチ","10⁶ビット","2.30件／秒","25 cm","2018-04-01"]);
  const html=renderToStaticMarkup(createElement(ContentParagraph,{text}));assert.equal((html.match(/class="content-text-token"/g)??[]).length,11);assert(!html.includes("tabindex"),"SSR must not add a tab stop before measuring actual overflow");
});
test("long URLs and identifier digits retain ordinary wrapping and no hidden separator or markup is inserted into source text",()=>{
  for(const text of ["https://example.test/123456789012345678901234567890?q=192.168.0.1&n=-25.0", "www.example.test/2018-04-01/25cm", "IPv4 HTML5 SHA256 x123 v1.2.3 10BASE-T", "通常の日本語と長い英単語abcdefghijk"]){const parts=contentTextParts(text);assert.equal(parts.map(p=>p.text).join(""),text);assert(parts.every(p=>!p.atomic),text);}
  for(const text of ["999.168.0.1","192.0.2.1/99","192.0.2.1:99999"])assert(contentTextParts(text).every(p=>!p.atomic));
  const html=renderToStaticMarkup(createElement(ContentParagraph,{text:'<img src=x onerror="alert(1)"> −12.50秒'}));assert(!html.includes("<img"));assert(html.includes("&lt;img"));assert(!html.includes("\u2060"));
});
test("shared Content applies token layout to paragraphs while existing code and numeric table cells retain their renderers",()=>{
  const b=fixture(),q=b.questions[0],content={...q.prompt,blocks:[{type:"paragraph" as const,text:"192.168.0.254 と −0.50秒"},{type:"code" as const,text:"192.168.0.254",language:"text"},{type:"table" as const,caption:"元の表",columns:["数値"],rows:[["2018"],["−0.50"]]}]},before=JSON.stringify(content),html=renderToStaticMarkup(createElement(Content,{content,bundle:b,assetUrls:{}}));
  assert.equal(JSON.stringify(content),before);assert.equal((html.match(/class="content-text-token"/g)??[]).length,2);assert(html.includes('<td><span class="table-cell-value">2018</span></td>'));assert(html.includes('<td><span class="table-cell-value">−0.50</span></td>'));assert(/<pre[^>]*>(?:<code[^>]*>)?192\.168\.0\.254(?:<\/code>)?<\/pre>/.test(html));
});
test("only reviewed hyphenated cryptographic names stay whole while URLs and other ASCII identifiers keep ordinary wrapping",()=>{
  const text="共通鍵KCipher-2、ハッシュSHA-256、AES/RSA。KCipher-2とSHA-256を区別する。";
  const parts=contentTextParts(text);assert.equal(parts.map(p=>p.text).join(""),text);assert.deepEqual(parts.filter(p=>p.atomic).map(p=>p.text),["KCipher-2","SHA-256","KCipher-2","SHA-256"]);
  const html=renderToStaticMarkup(createElement(ContentParagraph,{text}));assert.equal((html.match(/class="content-text-token"/g)??[]).length,4);assert(html.includes('>KCipher-2</span>'));assert(html.includes('>SHA-256</span>'));
  for(const text of ["MY-256 SHA-256suffix xKCipher-2 KCipher-2-extra prefix.SHA-256", "abcdefghijk-123456789012345678901234567890", "https://example.test/SHA-256/KCipher-2?q=-25.0", "www.example.test/KCipher-2"]){const parts=contentTextParts(text);assert.equal(parts.map(p=>p.text).join(""),text);assert(parts.every(p=>!p.atomic),text);}
});
test("ordered and unordered list items preserve complete strings and list structure while sharing paragraph token layout",()=>{
 const bundle=fixture(),q=bundle.questions[0],items=['始まりが“¥”、“.”、“..”のいずれでもないときは、左端に“.¥”が省略されているものとする。','192.168.0.254と−12.50秒、KCipher-2とSHA-256。','<img src=x onerror="alert(1)"> & 元の文字列'];
 const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
 for(const ordered of [true,false]){const content={...q.prompt,blocks:[{type:"list" as const,ordered,items}]},before=JSON.stringify(content),html=renderToStaticMarkup(createElement(Content,{content,bundle,assetUrls:{},showAttribution:false}));assert.equal(JSON.stringify(content),before);assert(html.includes(ordered?"<ol>":"<ul>"));assert.equal((html.match(/<li>/g)??[]).length,3);const rendered=[...html.matchAll(/<li><p(?: [^>]*)?>(.*?)<\/p><\/li>/g)].map(m=>decode(m[1].replace(/<[^>]+>/g,"")));assert.deepEqual(rendered,items);assert.equal((html.match(/class="content-text-token"/g)??[]).length,4);assert(!html.includes("<img"));assert(!html.includes("tabindex"));assert(!html.includes("\u2060"));}
});
test("numeric list tokens do not change paragraph, code, table or literal URL text",()=>{
 const bundle=fixture(),q=bundle.questions[0],text="−12.50秒 192.168.0.254",url="https://example.test/123456789012345678901234567890?q=192.168.0.1",content={...q.prompt,blocks:[{type:"paragraph" as const,text},{type:"list" as const,ordered:false,items:[text,url]},{type:"code" as const,language:"text",text},{type:"table" as const,caption:"表",columns:["値"],rows:[[text]]}]},html=renderToStaticMarkup(createElement(Content,{content,bundle,assetUrls:{}}));assert.equal((html.match(/class="content-text-token"/g)??[]).length,4);assert(html.includes(`<td><span class="table-cell-value">${text}</span></td>`));assert(html.includes(url));assert(!html.includes("<pre class=\"content-text-scroll\""));assert(/<pre[^>]*>(?:<code[^>]*>)?−12\.50秒 192\.168\.0\.254/.test(html));
});
test("the frozen existing public scope preserves all 16 lists and 46 items in eight questions",()=>{
 // Closed pre-change public scope, not a ceiling on future annual additions.
 const ids=["question-template-service-gain","question-template-security-log","question-template-source-2023-a-6","question-template-source-2023-b-6","question-template-source-2024-b-6","question-template-source-sample-2022-dec-b-15","question-template-source-sample-2022-dec-b-18","question-template-source-sample-2022-dec-b-20"],bundle=fixture(),questions=bundle.questions.filter(q=>ids.includes(q.id));assert.equal(questions.length,8);let lists=0,items=0;
 const decode=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
 for(const q of questions){const before=JSON.stringify(q);function visit(value:unknown){if(!value||typeof value!=="object")return;const b=value as {type?:string;ordered?:boolean;items?:string[]};if(b.type==="list"&&Array.isArray(b.items)){const html=renderToStaticMarkup(createElement(Content,{content:{attribution:q.prompt.attribution,blocks:[b as {type:"list";ordered:boolean;items:string[]}]},bundle,assetUrls:{},showAttribution:false}));assert(html.includes(b.ordered?"<ol>":"<ul>"));const texts=[...html.matchAll(/<li><p(?: [^>]*)?>(.*?)<\/p><\/li>/gs)].map(m=>decode(m[1].replace(/<[^>]+>/g,"")));assert.deepEqual(texts,b.items);lists++;items+=b.items.length;}for(const child of Object.values(value))if(typeof child==="object")if(Array.isArray(child))child.forEach(visit);else visit(child);}visit(q);assert.equal(JSON.stringify(q),before);}
 assert.equal(lists,16);assert.equal(items,46);
});

test("only seven reviewed complete WebAPI names are atomic with longest-name priority and exact source preservation",()=>{
  const names=["getOffererInfo","listOffererInfo","getProductInfo","listProductInfo","getResultInfo","getResultInfoForProduct","listResultInfo"];
  for(const name of names)for(const text of [name,`APIは${name}。`,`（${name}）`,`${name}(アクセスID)`,`「${name}」を呼び出す`]){
    const parts=contentTextParts(text);assert.equal(parts.map(p=>p.text).join(""),text);assert.deepEqual(parts.filter(p=>p.atomic).map(p=>p.text),[name]);
    const html=renderToStaticMarkup(createElement(ContentParagraph,{text}));assert.equal((html.match(/class="content-text-token"/g)??[]).length,1);assert(html.includes(`>${name}</span>`));assert(!html.includes("tabindex"));
  }
  const text="getResultInfoForProduct, getResultInfo, listResultInfo";
  assert.deepEqual(contentTextParts(text).filter(p=>p.atomic).map(p=>p.text),["getResultInfoForProduct","getResultInfo","listResultInfo"]);
});
test("API partial matches and URL contents remain ordinary while unrelated identifiers keep their previous wrapping",()=>{
  const names=["getOffererInfo","listOffererInfo","getProductInfo","listProductInfo","getResultInfo","getResultInfoForProduct","listResultInfo"];
  for(const name of names)for(const text of [`prefix${name}`,`${name}Suffix`,`${name}_1`,`${name}.extra`,`${name}-v2`,`prefix_${name}`,`prefix.${name}`,`prefix-${name}`,`$${name}`,`${name}$suffix`,`1${name}`,`https://example.test/${name}?next=${name}`,`www.example.test/${name}`]){
    const parts=contentTextParts(text);assert.equal(parts.map(p=>p.text).join(""),text);assert(parts.every(p=>!p.atomic),text);
  }
  for(const text of ["getAnotherInfo listOtherInfo OrdinaryCamelCase", "getProductInfo.extra", "getProductInfo-v2", "prefixgetProductInfo", "getProductInfoSuffix", "getProductInfo_1"]){assert(contentTextParts(text).every(p=>!p.atomic),text);}
});
test("reviewed API layout changes only paragraph and list spans while code, tables and stored content retain exact text",()=>{
  const bundle=fixture(),q=bundle.questions[0],text="getResultInfoForProduct / getProductInfo / −12.50秒 / KCipher-2 / 192.168.0.254",content={...q.prompt,blocks:[{type:"paragraph" as const,text},{type:"list" as const,ordered:false,items:[text]},{type:"code" as const,language:"text",text},{type:"table" as const,caption:"API表",columns:["名称"],rows:[[text]]}]},before=JSON.stringify(content),html=renderToStaticMarkup(createElement(Content,{content,bundle,assetUrls:{}}));
  assert.equal(JSON.stringify(content),before);assert.deepEqual(contentTextParts(text).filter(p=>p.atomic).map(p=>p.text),["getResultInfoForProduct","getProductInfo","−12.50秒","KCipher-2","192.168.0.254"]);assert.equal((html.match(/class="content-text-token"/g)??[]).length,10);assert(html.includes(`>${text}</span></td>`));assert(html.includes(text));assert(!html.includes("\u2060"));
});

// Literal expectations are grounded in the reviewed PM10 facts/prose; never
// import the implementation's private allowlist or an unregistered producer.
const reviewedCobolNames=["ALL-CR-TOTAL","ALL-ORD-NO","ALL-RANK","BLD-AVG","BLD-CR-TOTAL","BLD-INF","BLD-ORD-NO","BLD-RANK","BLD-TOTAL","PRT-PROC","PRT-REC","SRT-BLD","SRT-NO","SRT-REC","SRT-TOTAL"];
function assertAtomicText(text:string,expected:string[],parts=contentTextParts(text)){
 assert.equal(parts.map(p=>p.text).join(""),text,"exact original characters");assert.deepEqual(parts.filter(p=>p.atomic).map(p=>p.text),expected,"reviewed complete names only");
}
const decodeCodeText=(s:string)=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");

test("all15 source-reviewed COBOL identifiers pass408 actual tokenizer boundary cases without changing text or adding SSR tab stops",()=>{
 let cases=0;for(const name of reviewedCobolNames){
  for(const text of[name,`変数${name}。`,`（${name}）`,`(${name})`,`「${name}」`,`"${name}:"`,`MOVE ${name} TO X`,`値は${name}(CNT)`,`<${name}>`,`【${name}】`]){assertAtomicText(text,[name]);const html=renderToStaticMarkup(createElement(ContentParagraph,{text}));assert.equal((html.match(/class="content-text-token"/g)??[]).length,1);assert(html.includes(`>${name}</span>`));assert(!html.includes('tabindex'));assert.equal(decodeCodeText(html.replace(/<[^>]+>/g,'')),text);cases++;}
  for(const text of[`prefix${name}`,`${name}Suffix`,`${name}_1`,`${name}.extra`,`${name}-extra`,`prefix_${name}`,`prefix.${name}`,`prefix-${name}`,`$${name}`,`${name}$suffix`,`1${name}`,`${name}$`,`_${name}`,name.toLowerCase(),`https://example.test/${name}?next=${name}`,`http://example.test/${name}`,`www.example.test/${name}`]){assertAtomicText(text,[]);const html=renderToStaticMarkup(createElement(ContentParagraph,{text}));assert(!html.includes('content-text-token'));assert(!html.includes('content-text-scroll'));assert(!html.includes('tabindex'));cases++;}
 }
 for(const[text,expected]of [['BLD-RANK(SRT-BLD)',['BLD-RANK','SRT-BLD']],['MOVE BLD-ORD-NO(SRT-BLD) TO BLD-RANK(SRT-BLD)',['BLD-ORD-NO','SRT-BLD','BLD-RANK','SRT-BLD']],['SRT-FILE MAIN-PROC END-IF Business-Oriented',[]]]as[string,string[]][]){assertAtomicText(text,expected);cases++;}
 assert.equal(cases,408);
});

test("COBOL protection does not include the31 remaining code/table-only source names, unknown identifiers, generic keywords or long URLs",()=>{
 const excluded=["ALL-AVG","ALL-TOTAL","CALC-PROC","DSP-AVG","END-IF","END-PERFORM","END-READ","END-RETURN","MAIN-PROC","PRT-ALL-RANK","PRT-BLD","PRT-BLD-RANK","PRT-FILE","PRT-SP1","PRT-SP2","PRT-SP3","PRT-SP4","PRT-TOTAL","REL-PROC","RET-PROC","RSL-BLD","RSL-EOF","RSL-FILE","RSL-FLAG","RSL-NO","RSL-REC","RSL-SCR","SRT-EOF","SRT-FILE","SRT-FLAG","WORKING-STORAGE"];
 assert.equal(excluded.length,31);for(const text of[...excluded,'UNKNOWN-COBOL-ID','Business-Oriented','ASCENDING DESCENDING INITIALIZE MOVE CNT SRT','LongOrdinaryASCIIIdentifierWithoutHyphens','https://example.test/'+reviewedCobolNames.join('/')+'?a=192.168.0.1&b=-25.0','www.example.test/'+reviewedCobolNames.join('/')]){assertAtomicText(text,[]);const html=renderToStaticMarkup(createElement(ContentParagraph,{text}));assert(!html.includes('content-text-token'));assert(!html.includes('tabindex'));}
});

test("COBOL parentheses and literal markup keep exact escaped text while adding only complete-name spans",()=>{
 const text='<img src=x onerror="bad()"> ALL-RANK & BLD-AVG: \'quoted\' </p><script>bad()</script>\nBLD-RANK(SRT-BLD) 日本語😀';assertAtomicText(text,['ALL-RANK','BLD-AVG','BLD-RANK','SRT-BLD']);const html=renderToStaticMarkup(createElement(ContentParagraph,{text}));assert(!/<img\b|<script\b/i.test(html));assert.equal(decodeCodeText(html.replace(/<[^>]+>/g,'')),text);assert(!html.includes('\u2060'));assert(!html.includes('\u200b'));assert(!html.includes('tabindex'));
});

test("COBOL layout spans apply only to paragraph/list while code table and stored content remain exact",()=>{
 const bundle=fixture(),q=bundle.questions[0],text='MOVE BLD-ORD-NO(SRT-BLD) TO BLD-RANK(SRT-BLD)',url='https://example.test/ALL-RANK/BLD-RANK',content={...q.prompt,blocks:[{type:'paragraph'as const,text},{type:'list'as const,ordered:true,items:[text,url]},{type:'code'as const,language:'cobol',text},{type:'table'as const,caption:'原の表',columns:['値'],rows:[[text]]}]},before=JSON.stringify(content),questionBefore=JSON.stringify(q),html=renderToStaticMarkup(createElement(Content,{content,bundle,assetUrls:{},showAttribution:false}));assert.equal(JSON.stringify(content),before);assert.equal(JSON.stringify(q),questionBefore);assert.equal((html.match(/class="content-text-token"/g)??[]).length,8);const code=html.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);assert(code);assert.equal(decodeCodeText(code[1]),text);assert(!code[1].includes('<span'));assert(html.includes(`<td><span class="table-cell-prose">${text}</span></td>`));assert(html.includes(`<p>${url}</p>`));assert(!html.includes('tabindex'));
});

test("old API crypto numeric and address groups retain their literal atomic values beside a new COBOL name",()=>{
 const text='getResultInfoForProduct / getProductInfo / −12.50秒 / KCipher-2 / 192.168.0.254 / ALL-RANK';assertAtomicText(text,['getResultInfoForProduct','getProductInfo','−12.50秒','KCipher-2','192.168.0.254','ALL-RANK']);
 const numeric='192.0.2.1/24 192.0.2.1:8080 −12.50秒 -1,234.50円 ＋20％ 1/72インチ 10⁶ビット 2.30件／秒 25 cm 2018-04-01';assertAtomicText(numeric,['192.0.2.1/24','192.0.2.1:8080','−12.50秒','-1,234.50円','＋20％','1/72インチ','10⁶ビット','2.30件／秒','25 cm','2018-04-01']);
});

test("COBOL expectations reject omitted names general nowrap dollar or URL partials and inserted character mutations",()=>{
 const text='ALL-RANK',good=contentTextParts(text);assertAtomicText(text,['ALL-RANK'],good);assert.throws(()=>assertAtomicText(text,['ALL-RANK'],good.map(p=>({...p,atomic:false}))),assert.AssertionError);
 assert.throws(()=>assertAtomicText('UNKNOWN-COBOL-ID',[],[{text:'UNKNOWN-COBOL-ID',atomic:true}]),assert.AssertionError);assert.throws(()=>assertAtomicText('$ALL-RANK',[],[{text:'$',atomic:false},{text:'ALL-RANK',atomic:true}]),assert.AssertionError);assert.throws(()=>assertAtomicText('https://example.test/ALL-RANK',[],[{text:'https://example.test/',atomic:false},{text:'ALL-RANK',atomic:true}]),assert.AssertionError);
 for(const altered of ['ALL -RANK','A\u200bLL-RANK'])assert.throws(()=>assertAtomicText(text,['ALL-RANK'],[{text:altered,atomic:true}]),assert.AssertionError);
});

// IPA 2018 spring PM10 QS52–55: CR-DATE-X appears in program note1;
// Table2 and the independently reviewed term meanings attest the other names.
// CR-DATE is a substring, not another ordinary-display identifier.
const added2018CobolNames=["CR-DATE-X","ORD-CODE","ORD-DATA","ORD-EOF","PRT-NO","RCP-EOF","W-CNT","WAT-REC"];
test("all23 reviewed paragraph names preserve exact text at ASCII namespace and URL boundaries",()=>{
 const names=[...reviewedCobolNames,...added2018CobolNames];assert.equal(new Set(names).size,23);
 for(const name of names){
  for(const text of[name,`注記${name}に格納する。`,`（${name}）`,`${name}(CNT)`,`「${name}」`,`/${name}`,`${name}/x`,`prefix/${name}`]){
   assertAtomicText(text,[name]);const html=renderToStaticMarkup(createElement(ContentParagraph,{text}));assert.equal((html.match(/class="content-text-token"/g)??[]).length,1);assert.equal(decodeCodeText(html.replace(/<[^>]+>/g,'')),text);assert(!html.includes('tabindex'));
  }
  for(const text of[`x${name}`,`${name}x`,`1${name}`,`${name}1`,`_${name}`,`${name}_x`,`.${name}`,`${name}.x`,`$${name}`,`${name}$x`,`-${name}`,`${name}-x`,name.toLowerCase(),`https://example.test/${name}?next=${name}`,`www.example.test/${name}`])assertAtomicText(text,[]);
 }
 for(const name of ['CR-DATE','MAIN-PROC','ORD-AMNT','ORD-DATE','ORD-DT','ORD-FILE','ORD-NO','ORD-PROC','ORD-REC','ORD-TIME','PRT-DIFF','PRT-FILE','PRT-ORD','PRT-RCP','PRT-RSLT','RCP-AMNT','RCP-CODE','RCP-DATA','RCP-DATE','RCP-DT','RCP-FILE','RCP-NO','RCP-PROC','RCP-REC','RCP-TIME','WAT-FILE','CURRENT-DATE','INTEGER-OF-DATE','READ','SET','MOVE','WRITE','PERFORM','EVALUATE','INITIALIZE','DISPLAY','COMPUTE'])assertAtomicText(name,[]);
 const text='CR-DATE-XとCR-DATE、ORD-CODE = 1 OR 2、https://example.test/ORD-EOF。 WAT-REC FROM ORD-DATA / PRT-NO / PRT-REC / RCP-EOF / W-CNT';assertAtomicText(text,['CR-DATE-X','ORD-CODE','WAT-REC','ORD-DATA','PRT-NO','PRT-REC','RCP-EOF','W-CNT']);
});

test("2018 identifiers change only paragraph and list spans while code table and literal markup keep their characters",()=>{
 const bundle=fixture(),q=bundle.questions[0],text=added2018CobolNames.join(' '),content={...q.prompt,blocks:[{type:'paragraph'as const,text},{type:'list'as const,ordered:false,items:[text]},{type:'code'as const,language:'cobol',text},{type:'table'as const,caption:'原の表',columns:['値'],rows:[[text]]}]},before=JSON.stringify(content),html=renderToStaticMarkup(createElement(Content,{content,bundle,assetUrls:{},showAttribution:false}));assert.equal(JSON.stringify(content),before);assert.equal((html.match(/class="content-text-token"/g)??[]).length,16);assert(html.includes(`<pre><code>${text}</code></pre>`));assert(html.includes(`<td><span class="table-cell-prose">${text}</span></td>`));
 const literal='<img src=x onerror="bad()"> CR-DATE-X & ORD-EOF </p><script>bad()</script>\nW-CNT 日本語😀',rendered=renderToStaticMarkup(createElement(ContentParagraph,{text:literal}));assertAtomicText(literal,['CR-DATE-X','ORD-EOF','W-CNT']);assert.equal(decodeCodeText(rendered.replace(/<[^>]+>/g,'')),literal);assert(!/<img\b|<script\b/i.test(rendered));assert(!/[\u200b\u2060]/.test(rendered));
});
