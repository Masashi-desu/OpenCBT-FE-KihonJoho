import assert from "node:assert/strict";
import {posix} from "node:path";
import type {GeneratedBody} from "../../src/core/generators/definition";
// Q18 tests the original absolute-path definition against separately reviewed
// distractor mechanisms. The stem and correct definition are fixed.
export const decAFixedKnowledgeReview={
 18:{stem:"ファイルシステムの絶対パス名を説明したものはどれか。",correct:"ルートディレクトリから対象ファイルへ至るパス名",index:3,wrong:[
  ["対象ファイルへ至る幾つかのパス名のうち、最短のパス名","カレントディレクトリから対象ファイルへ至るパス名","ホームディレクトリから対象ファイルへ至るパス名"],
  ["同名ファイルを区別せず、ファイル名だけに縮めた最短のパス名","カレント変更によって指すファイルが変わるパス名","利用者のホームを起点とし、利用者ごとに対象が変わるパス名"],
  ["上位ディレクトリの名前を省き、通過する階層を最少にしたパス名","先頭の「..」から、カレントの親を起点にたどるパス名","ホームへ移動した後、そこからの相対位置で示すパス名"],
  ["対象への最短距離だけを表し、起点を指定しないパス名","カレントにあるファイルを、ディレクトリ名なしで示すパス名","ホームへ移動してから、先頭の「..」で親をたどるパス名"],
 ],mechanisms:[
  ["minimum-length-not-root","current-origin","home-origin"],
  ["basename-collision","current-change","different-user-homes"],
  ["ancestor-prefix-loss","parent-of-current","change-to-home-then-relative"],
  ["distance-without-origin","current-local-basename","parent-of-home"],
 ]},
} as const;
export function decAFixedKnowledgeOracle(n:18,b:GeneratedBody,v:number[]){
 const r=decAFixedKnowledgeReview[n];assert.equal(v.length,1);assert(v[0]>=0&&v[0]<r.wrong.length);
 assert.deepEqual(b.prompt,[{type:"paragraph",text:r.stem}]);
 const expected:string[]=[...r.wrong[v[0]]];expected.splice(r.index,0,r.correct);
 const displayed=b.choices.map(c=>{assert.equal(c.length,1);const p=c[0];assert.equal(p.type,"paragraph");return p.type==="paragraph"?p.text:"";});
 assert.deepEqual(displayed,expected);assert.equal(b.correctIndex,r.index);
 // All false options are matched to their separately reviewed mechanism. An
 // unreviewed qualifier, or a stale variant's entire option set, is rejected.
 assert.equal(new Set(r.mechanisms.flat()).size,r.wrong.length*3);
}
export function decAPathCounterexamples(){
 const resolve=(origin:string,path:string)=>posix.resolve(origin,path);
 const cwd=["/team/a/work","/team/b/work"],home=["/home/ana/files","/home/bob/files"],absolute="/archive/report.txt";
 // Every root-based spelling retains its identity after both kinds of change.
 for(const origin of [...cwd,...home]){assert.equal(resolve(origin,absolute),absolute);assert.equal(resolve(origin,"/archive/../docs/report.txt"),"/docs/report.txt");}
 // Same basename and same traversal distance identify different files. Losing
 // ancestor names or the origin cannot define a root-based file identity.
 assert.equal(posix.basename("/team/a/report.txt"),posix.basename("/team/b/report.txt"));
 assert.equal(posix.relative(cwd[0],"/team/a/report.txt"),posix.relative(cwd[1],"/team/b/report.txt"));
 assert.notEqual("/team/a/report.txt","/team/b/report.txt");
 for(const relative of ["report.txt","../report.txt"]){
  assert.notEqual(resolve(cwd[0],relative),resolve(cwd[1],relative));
  assert.notEqual(resolve(home[0],relative),resolve(home[1],relative));
 }
 // A relative spelling can be shorter than the absolute one, while its target
 // changes with its origin: neither character count nor depth defines absolute.
 assert("report.txt".length<absolute.length);assert.equal(resolve("/archive","report.txt"),absolute);
 assert.notEqual(resolve("/other","report.txt"),absolute);
}
