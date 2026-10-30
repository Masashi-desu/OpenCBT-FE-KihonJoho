/** Test-only workspaces. Normal tests write only managed OS temporary files;
 * an explicit review runner may request persistent JSON evidence separately. */
import{after}from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import{tmpdir}from'node:os';
export function spring2019TemporaryDirectory(purpose:string){assert.match(purpose,/^[a-z0-9-]+$/);const dir=fs.mkdtempSync(path.join(tmpdir(),`opencbt-fe-2019-${purpose}-`));after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
const requested=process.env.OPENCBT_FE_REVIEW_OUTPUT;
if(requested)assert(path.isAbsolute(requested),'explicit review evidence output must be absolute');
// Register cleanup at file initialization, so it runs after every test in this
// test process rather than after the first individual evidence-producing test.
const evidenceDirectory=requested??spring2019TemporaryDirectory('evidence');
export function writeSpring2019Evidence(name:string,text:string){assert.match(name,/^[a-z0-9-]+\.json$/);fs.mkdirSync(evidenceDirectory,{recursive:true});fs.writeFileSync(path.join(evidenceDirectory,name),text);}
