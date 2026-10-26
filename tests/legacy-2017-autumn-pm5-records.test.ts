import test from 'node:test';import assert from 'node:assert/strict';
import metadata from './fixtures/legacy-2017-autumn-pm5-original-metadata.json';
import {legacy2017AutumnPm5Records,bindLegacy2017AutumnPm5Body,legacy2017AutumnPm5PageAlt} from '../scripts/import-legacy-2017-autumn-pm5';
import {legacy2017AutumnPm5Definition as d} from '../src/core/generators/legacy-2017-autumn-pm5';
import {schema} from '../src/core/validation';import {contentHash} from '../src/core/hash';
test('2017秋PM5 actual six raw/lossless metadata -> original/base/template with official erratum distinct scope and no false admission',async()=>{
  const result=await legacy2017AutumnPm5Records(structuredClone(metadata)),b=result.bundle;
  assert.equal(b.assets.length,6);assert.equal(b.sources.length,3);assert.equal(b.rights.length,2);assert.equal(b.questions.length,2);assert.equal(b.templates.length,1);assert.equal(result.validation.normalAppRegistered,false);assert.equal(result.validation.terms,'unconfirmed');
  const [original,base]=b.questions;schema('question',original);assert.equal(original.prompt.blocks.length,5);assert.equal(original.contexts.length,1);assert.equal(original.contexts[0].content.blocks.filter(x=>x.type==='image').length,1);assert.equal(original.assetRefs.length,6);assert.equal(base.assetRefs.length,1);assert.equal(base.contexts[0].content.attribution.sourceRefs[0].locator.page,2);
  assert.equal(original.prompt.attribution.sourceRefs.length,5);assert(original.contexts[0].content.attribution.rightsRefs.every(x=>x.endsWith('erratum')));assert(original.prompt.attribution.rightsRefs.every(x=>!x.endsWith('erratum')));assert(b.rights.every(x=>Object.values(x.uses).every(x=>x==='unconfirmed')));
  assert.equal(await contentHash(base),b.templates[0].originalContentSha256);assert.equal(legacy2017AutumnPm5PageAlt(23).includes('入金は，買上げ前に行うことができる。'),true);assert(legacy2017AutumnPm5PageAlt(2).includes('買上げ後にも'));
  // Actual registered schema now accepts the shape; distribution and rights remain held.
  schema('question',base);assert.equal(base.distribution,'excluded');assert.deepEqual(original.contextRefs,original.contexts.map(c=>c.id));assert.deepEqual(base.contextRefs,base.contexts.map(c=>c.id));
  for(let v=0;v<4;v++){const q=bindLegacy2017AutumnPm5Body(base,d.build([v]));assert.equal(q.choiceShuffleAllowed,false);assert.deepEqual(q.contexts,base.contexts);assert.deepEqual(q.assetRefs,base.assetRefs);assert.equal(q.choices.length,27);assert(q.prompt.blocks.filter(x=>x.type==='diagram').every(x=>x.attribution?.sourceRefs.length===1));}
});
test('2017秋PM5 metadata rejects altered raw provenance, wrong edition, synthetic bytes and altered erratum',async()=>{
  for(const mutation of ['page','sha','size','edition','pixels']){const input=structuredClone(metadata);if(mutation==='page')input.rendered.pages[0].page=22;if(mutation==='sha')input.rendered.pages[0].sha256='a'.repeat(64);if(mutation==='size')input.rendered.pages[0].byteLength++;if(mutation==='edition')input.collection.id='2017h29h-fe-pm';if(mutation==='pixels')input.rendered.rawImageExtraction[0].losslessWebpPixelsExact=false;await assert.rejects(legacy2017AutumnPm5Records(input));}
});
