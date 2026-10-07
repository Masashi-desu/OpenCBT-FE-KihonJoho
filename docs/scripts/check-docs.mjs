// Markdown、ナビゲーション、正本ファイルの参照を静的に確認する。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sidebar } from '../.vitepress/navigation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=fs.readdirSync(root).filter(f=>f.endsWith('.md'));
const links=sidebar.flatMap(group=>group.items.map(item=>item.link));
const route=file=>file==='index.md'?'/':`/${file.slice(0,-3)}`;
const failures=[];
for(const file of pages){
 const text=fs.readFileSync(path.join(root,file),'utf8');
 if(!links.includes(route(file)))failures.push(`${file}: サイドバーにない`);
 if(!/^# .+/m.test(text)||!/^## .+/m.test(text))failures.push(`${file}: 見出し・目次が不足`);
 if(/<(script|iframe|form)\b/i.test(text))failures.push(`${file}: 実行可能な埋め込みは禁止`);
 for(const m of text.matchAll(/\]\((\/[^)\s]+)\)/g)){
  const target=m[1].split('#')[0].split('?')[0];
  const candidates=[path.join(root,target==='/'?'index.md':target+'.md'),path.join(root,'public',target)];
  if(!candidates.some(p=>fs.existsSync(p)))failures.push(`${file}: リンク切れ ${m[1]}`);
 }
 for(const m of text.matchAll(/^<<< @\/(\S+)/gm)){
  if(!fs.existsSync(path.join(root,m[1].split('{')[0])))failures.push(`${file}: スニペット元がない ${m[1]}`);
 }
}
for(const link of links)if(!pages.some(file=>route(file)===link))failures.push(`サイドバーリンク切れ: ${link}`);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`ドキュメント ${pages.length}ページ: 全サイドバー経路・ファイルリンク・正本スニペット・実行可能な埋め込みの不在を確認`);
