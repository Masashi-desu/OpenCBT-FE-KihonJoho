import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import type {Block} from '../../src/core/types';import type {GeneratedBody} from '../../src/core/generators/definition';
import {Legacy2017BusinessFigure} from '../../src/ui/Legacy2017BusinessFigures';
import {legacy2017BusinessReview as review,legacy2017BusinessStems as stems} from './legacy-2017-business-review';
import {businessMediaTargets as media,businessMediaRoles as mediaRoles,businessMediaRequired as mediaRequired,businessAffiliateTargets as targets,businessAffiliateActions as actions,businessAffiliateRoutes as routes,businessFacilitation as facilitators,businessAnalysisTargets as analysis,businessAnalysisRoles as analysisRoles,businessCashflows as cashflows,businessCopyright as copyrights,businessSecretRequirements as requirements,businessSecretMissing as missing,businessExplanationFacts as explanationFacts} from './legacy-2017-business-facts';
import {readLegacy2017AffiliateSvg,legacy2017AffiliateReviewedDescription} from './legacy-2017-business-svg';
import contracts from './legacy-2017-business-contracts.json';
function text(b:Block){assert.equal(b.type,'paragraph');if(b.type!=='paragraph')throw Error();return b.text;}
export function legacy2017BusinessOracle(source:string,b:GeneratedBody,values:number[]){
 const n=Number(source.split('-').at(-1)),v=values[0],r=review.find(r=>r.number===n);assert(r);assert.equal(values.length,1);assert(Number.isInteger(v)&&v>=0);assert.equal(b.choices.length,4);assert.deepEqual(b.contexts??[],[]);assert.equal(b.partAnswers,undefined);
 const choices=b.choices.map(blocks=>{assert.equal(blocks.length,1);return text(blocks[0]);});let truth:boolean[]=[];
 if(n===73){assert.equal(b.prompt.length,1);assert.equal(text(b.prompt[0]),`${media[v]}の説明はどれか。`);assert.deepEqual(choices,r.choices);truth=mediaRoles.map(role=>role===mediaRequired[v]);}
 else if(n===74){assert.equal(b.prompt.length,2);const target=targets[v];assert(target);assert.equal(text(b.prompt[0]),stems[74].replace('モデル例の⑤',`モデル例の${['','①','②','③','④','⑤'][target]}`));assert.deepEqual(choices,r.choices);const f=b.prompt[1];assert(f.type==='diagram'&&f.scene.kind==='source_figure');if(f.type!=='diagram'||f.scene.kind!=='source_figure')throw Error();assert.equal(f.scene.profile,'legacy-2017-affiliate-workflow');assert.deepEqual(f.scene.values,[0]);assert.equal(f.caption,'アフィリエイトプログラムのモデル例');assert.equal(f.alt,legacy2017AffiliateReviewedDescription);
  const observed=readLegacy2017AffiliateSvg(renderToStaticMarkup(createElement(Legacy2017BusinessFigure,{profile:f.scene.profile,values:f.scene.values,caption:f.caption})));assert.deepEqual(observed.routes,routes.map(row=>row.slice(0,2)));truth=actions.map(role=>role===routes[target-1][2]);
 }else if(n===75){assert.equal(b.prompt.length,1);assert.equal(text(b.prompt[0]),stems[n]);const facts=facilitators[v];assert(facts);assert.deepEqual(choices,facts.map(row=>row[0]));truth=facts.map(row=>row[1]==='neutral-discussion');}
 else if(n===76){assert.equal(b.prompt.length,1);assert.equal(text(b.prompt[0]),`${analysis[v]}${v===0?'法':''}を説明したものはどれか。`);assert.deepEqual(choices,r.choices);truth=analysisRoles.map(role=>role===analysisRoles[v]);assert(choices[0].includes('検討し、'));assert(choices[2].includes('要因が'));}
 else if(n===77){assert.equal(b.prompt.length,1);assert.equal(text(b.prompt[0]),stems[n]);const facts=cashflows[v];assert(facts);assert.deepEqual(choices,facts.map(row=>row[0]));truth=facts.map(row=>row[1]==='operating');assert.deepEqual(facts.map(row=>row[1]),['financing','operating','financing','investing']);assert(facts.some(row=>row[2]==='in')&&facts.some(row=>row[2]==='out'));}
 else if(n===79){assert.equal(b.prompt.length,1);assert.equal(text(b.prompt[0]),stems[n]);const facts=copyrights[v];assert(facts);assert.deepEqual(choices,facts.map(row=>row[0]));truth=facts.map(row=>row[2]);}
 else if(n===80){assert.equal(b.prompt.length,1);assert(missing[v]!==undefined);const remaining=requirements[missing[v]],given=requirements.filter(t=>t!==remaining);assert.equal(new Set([...given,remaining]).size,3);assert.equal(text(b.prompt[0]),`不正競争防止法において、営業秘密となる要件は、“${given[0]}”、“${given[1]}”と、もう一つはどれか。`);assert.deepEqual(choices,['営業譲渡が可能なこと','期間が10年を超えないこと',remaining,'特許出願をしていること']);truth=choices.map(t=>requirements.includes(t)&&!given.includes(t));}
 else throw Error('UNREVIEWED_SOURCE');
 assert.equal(truth.filter(Boolean).length,1);assert.equal(b.correctIndex,truth.indexOf(true));
 for(const fragment of explanationFacts[n][explanationFacts[n].length===1?0:v])assert(b.explanation.includes(fragment),`${source}/${v} requires ${fragment}`);
 const contract=contracts.records.find(row=>row.source===source)?.outputs.find(o=>o.values[0]===v);assert(contract);assert.equal(createHash('sha256').update(b.explanation).digest('hex'),contract.explanationSha256,'All explanation text was reviewed with the independent role/condition facts; contradictory append/missing limitation is rejected');
 assert.doesNotMatch(b.explanation,/正答は[アイウエ]|選択肢は順に|左から[アイウエ]|生成の誤答|fixture/);
 return truth;
}
