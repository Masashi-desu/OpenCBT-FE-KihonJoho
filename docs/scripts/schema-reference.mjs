// 意味はdescription、欠落時の扱いは$commentを正本として辞書を生成する。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const docs=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(docs,'public/schemas');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.schema.json')).sort();
const schemas=new Map(files.map(f=>[f,JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))]));
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('|','&#124;').replaceAll('\n',' ');
const referenced=s=>{
 if(!s.$ref)return s;
 const [url,fragment]=s.$ref.split('#');const source=schemas.get(url.split('/').at(-1));
 const target=fragment?fragment.split('/').slice(1).reduce((value,key)=>value?.[key.replaceAll('~1','/').replaceAll('~0','~')],source):source;
 if(!target)throw Error(`辞書の参照先なし: ${s.$ref}`);
 return {...target,...s};
};
const type=s=>{
 const target=referenced(s);
 const value=target.type||(target.oneOf?'oneOf（種類別）':target.const!==undefined?typeof target.const:target.enum?'string':'条件');
 return s.$ref?`${value} / ${s.$ref.split('/schemas/').at(-1).replace(/^\d+\.\d+\.\d+\//,'')}`:value;
};
const limits=s=>Object.entries(referenced(s)).filter(([k])=>['const','enum','pattern','format','minimum','maximum','minLength','maxLength','minItems','maxItems','uniqueItems','multipleOf','additionalProperties'].includes(k)).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join(' / ')||'子構造・種類別定義に従う';
let rowCount=0;
let out='# 全フィールド辞書\n\nこのページは `docs/public/schemas/*.schema.json` から自動生成する。**意味**は何を表し何に使うか、**欠落時の扱い**は省略した場合の解釈と拒否条件を説明する。文字数・型・列挙値等は別の列へ記載する。元Schemaの `description` と `$comment` がそれぞれの正本であり、このページを直接編集しない。表は横にスクロールでき、狭い画面でも読みたい列へ移動して確認できる。\n\n## 共通の欠落規則\n\n未知フィールドと `null` は全オブジェクトで拒否する。必須の欠落は拒否し、既定値や参照先の情報で補完しない。空配列・空文字・0・falseは省略と区別する。任意項目でも適用条件を満たす場合は必須となり、条件は各行の欠落欄、元Schemaの条件付き制約及び[参照整合性規則](/data-model)に従う。formula.formatの省略をunicodeと解釈する規則だけを明示的な初期値の例外とする。\n\n子フィールドの必須性は親オブジェクト又は該当する種類のブロックが存在する場合に適用する。配列要素を掲載した行は要素の意味であり、配列全体の必須性・空配列の可否は親の行に従う。$ref型の子フィールドは共有型又は参照Schemaの節で定義し、参照元の意味に指定したレコード種類へ解決する。\n\n固定問題の改変有無は作成時に定義し、出題時は元データ使用又は値の生成・バインドという経路から表示を確定する。バインドした内容は値が基準と同じでも改変あり、元データ使用では既存の改変表示を維持する。テキスト・図・履歴・hashの差から判定せず、経路・必須性・参照・保存内容の整合を検証する。[改変情報の定義](/diagram-generation)を参照する。\n\n<div class="schema-field-dictionary">\n';
function table(node,prefix=''){
 const rows=[];
 function add(s,p,required){
  if(!s.description||!s.$comment)throw Error(`意味又は欠落規則なし: ${p}`);
  rows.push([p,s.description,required,s.$comment,type(s),limits(s)]);rowCount++;
 }
 function walk(s,p){
  for(const [key,value]of Object.entries(s.properties||{})){
   const f=p?`${p}.${key}`:key;
   const required=(s.required||[]).includes(key)?'必須':value.$comment?.startsWith('条件付き：')?'条件付き':'任意';
   add(value,f,required);walk(value,f);
  }
  if(s.items){const item=s.items;add(item,`${p}[]`,'配列要素');walk(item,`${p}[]`);}
  for(const [i,branch]of (s.oneOf||[]).entries()){
   const target=referenced(branch);const label=target.properties?.type?.const??target.properties?.kind?.const??i;
   if(branch.$ref){
    const field={...branch,description:target.description,$comment:'種類別：このブロック種類を選んだ場合は参照Schemaの必須項目を満たす。別種類の代用や推定変換はしない。'};
    add(field,`${p}{${label}}`,'種類別');
   }else walk(branch,`${p}{${label}}`);
  }
 }
 walk(node,prefix);
 if(!rows.length)return '';
 return '\n| フィールド | 意味 | 必須／任意 | 欠落時の扱い | 型・参照先 | 制約 |\n| --- | --- | --- | --- | --- | --- |\n'+rows.map(r=>'| `'+esc(r[0])+'` | '+r.slice(1).map(esc).join(' | ')+' |').join('\n')+'\n';
}
for(const [file,s]of schemas){
 out+=`\n## ${s.title}（${file.replace('.schema.json','')}）\n\n[元Schema](/schemas/${file})。${esc(s.description)}\n`;
 if(s.properties)out+=table(s);
 for(const [name,d]of Object.entries(s.$defs||{}))out+=`\n### ${name}\n\n**意味：** ${esc(d.description)}\n\n**欠落時の扱い：** ${esc(d.$comment)}\n\n**型・制約：** ${esc(type(d))}。${esc(limits(d))}。\n`+table(d,name);
 if(s.allOf)out+='\n### 条件付き制約\n\n以下は元Schemaの構造上の条件である。参照先による科目・モード・生成枠の条件は[データモデル](/data-model)と[受入条件](/acceptance)にも従う。改変の意味を判定する規則ではない。\n\n```json\n'+JSON.stringify(s.allOf,null,2)+'\n```\n';
}
out+='\n</div>\n';
const file=path.join(docs,'schema-reference.md');
if(process.argv.includes('--check')){
 if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==out){console.error('フィールド辞書が古い: npm run doc:reference');process.exit(1);}
 console.log(`Schema由来の全フィールド辞書: ${rowCount}行の意味・欠落規則を確認、最新`);
}else{fs.writeFileSync(file,out);console.log(`フィールド辞書を更新: ${rowCount}行`);}
