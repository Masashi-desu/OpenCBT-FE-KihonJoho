import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';
import meaningInput from './legacy-2018-autumn58-meaning.json';
import facts from './legacy-2018-autumn58-facts.json';
type ReviewedCase={text:string;facts:Record<string,boolean|null>;reason:string};
const meaning=meaningInput as unknown as {choices:{role:string;cases:ReviewedCase[]}[]};
/** Independent factual predicates over manually reviewed cases. Neither the
 * generator's answer index nor its condition branches supply the expected key. */
export function autumn58Issue(role:string,f:Record<string,boolean|null>):boolean{
 if(role==='media')return f.procedureRespected!==true||f.permissionRespected!==true;
 if(role==='incident')return f.requiredReportPerformed!==true||f.reportingRuleRespected!==true;
 if(role==='malware')return f.detected===true&&f.removed!==true;
 if(role==='risk')return f.criteriaBeforeAssessment===false||f.acceptanceComparedToCriteria===false;
 throw Error('UNREVIEWED_ROLE');
}
export function autumn58ReviewedText(text:string){
 const matches=meaning.choices.flatMap(choice=>choice.cases.filter(c=>c.text===text).map(c=>({role:choice.role,...c})));
 assert.equal(matches.length,1,'exact independently reviewed statement');return{...matches[0],issue:autumn58Issue(matches[0].role,matches[0].facts)};
}
export function assertAutumn58Meaning(body:GeneratedBody,values:number[]){
 assert.equal(body.prompt.length,1);assert(body.prompt[0].type==='paragraph');assert.equal(body.prompt[0].text,facts.originalQuestion.prompt);
 assert.equal(body.choices.length,4);const issues=body.choices.map((blocks,i)=>{
  assert.equal(blocks.length,1);assert(blocks[0].type==='paragraph');
  const expected=meaning.choices[i].cases[values[i]];assert(expected);assert.equal(blocks[0].text,expected.text);
  const reviewed=autumn58ReviewedText(blocks[0].text);assert.equal(reviewed.role,meaning.choices[i].role);return reviewed.issue;
 });
 assert.equal(issues.filter(Boolean).length,1);assert.equal(body.correctIndex,issues.findIndex(Boolean));
 const required=[values[0]?['書込み禁止・読取り許可']:['許可手順'],values[1]?['規定の期限内','再発防止策']:['規定に従って報告'],values[2]?['隔離，駆除，安全確認']:['検知したスパイウェアは駆除'],values[3]?['基準に合うか','受容判断の根拠']:['評価を始める前','評価を終えてから']].flat();
 for(const text of required)assert(body.explanation.includes(text),'condition-specific explanation: '+text);
 assert(body.explanation.includes('USBの利用やマルウェアの検知だけで直ちに不適合と決めるのではなく'));
 return issues;
}
