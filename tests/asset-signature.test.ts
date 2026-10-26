import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {hasAssetSignature}from '../src/core/asset-signature';import {readDistributionBundle}from '../scripts/distribution-files';
test('shared asset signature gate admits the three declared static image types and rejects mismatched headers, extensions, truncated signatures and unsupported MIME',()=>{
 const cases=[{path:'assets/test.png',mediaType:'image/png',raw:new Uint8Array([137,80,78,71,13,10,26,10])},{path:'assets/test.jpg',mediaType:'image/jpeg',raw:new Uint8Array([255,216,255])},{path:'assets/test.webp',mediaType:'image/webp',raw:new TextEncoder().encode('RIFF0000WEBP')}];
 for(const [i,c]of cases.entries()){assert(hasAssetSignature(c,c.raw));assert(!hasAssetSignature(c,c.raw.slice(0,-1)));for(const other of cases.filter((_,j)=>i!==j)){assert(!hasAssetSignature(c,other.raw));assert(!hasAssetSignature({...c,path:other.path},c.raw));}}
 assert(!hasAssetSignature({path:'assets/test.png',mediaType:'image/avif'},cases[0].raw));assert(!hasAssetSignature({path:'assets/test.svg',mediaType:'image/svg+xml'},new TextEncoder().encode('<svg/>')));
});
test('all currently distributed assets retain their existing valid bytes and signatures',()=>{const b=readDistributionBundle();for(const a of b.assets)assert(hasAssetSignature(a,new Uint8Array(fs.readFileSync('public/data/'+a.path))),a.id);});
