import type { Bundle, Question, Ref, Run, Selection } from "../../src/core/types";
import { refOf } from "../../src/core/types";
import { updatePartAnswer } from "../../src/core/session";
import contract from "../fixtures/legacy-2019-autumn/app-contract.json";

export { contract };
export const originalId = (n: number) => `question-ipa-${contract.sourceId}-${n}`;
export const baseId = (n: number) => `question-template-source-${contract.sourceId}-${n}`;
export const major = (q: Question) => Number(q.origin.sourceRefs.find(r => r.locator.questionNumber)?.locator.questionNumber);
export const partIds = (n: number) => n === 4 ? ["part-sub1","part-a","part-b","part-c","part-d"] :
  n === 11 ? ["part-a","part-b","part-c","part-d","part-e","part-sub2"] :
  Array.from({length:contract.fieldCounts[n-1]},(_,i)=>`part-${"abcdefghi"[i]}`);
export function refsFor(bundle: Bundle, ns: number[]): Ref[] {
  return ns.map(n => {const q=bundle.questions.find(q=>q.id===originalId(n));if(!q)throw Error(`Missing original ${n}`);return refOf(q);});
}
export function selection(bundle: Bundle, kind: "annual"|"mix", mode: "study"|"practice", ns?: number[]): Selection {
  return {subject:"B",kind,mode,size:"public",year:2019,bindingMode:kind==="annual"?"original_data":"generated_values",
    ...(kind==="annual"?{sourceCollectionId:contract.collectionId}:{mixProfileCollectionId:contract.collectionId}),
    ...(ns?{selectedQuestionRefs:refsFor(bundle,ns)}:{})};
}
export function legalChoices() {
  const result:number[][]=[];
  for(let mask=0;mask<64;mask++) {const general=[2,3,4,5,6,7].filter((_,i)=>mask&(1<<i));
    if(general.length===4)for(let language=9;language<=13;language++)result.push([1,...general,8,language]);}
  return result;
}
const alphabet="アイウエオカキクケコサシスセソタチツテト";
export function answerOriginal(run: Run, index: number, at: number): Run {
  run.session.currentIndex=index;const q=run.issued[index];
  contract.sourceMarks[major(q)-1].forEach((mark,i)=>{
    if(mark===null)return;
    const part=q.answerParts![i], choice=part.choiceIds[alphabet.indexOf(mark)];
    if(!choice)throw Error(`ANS mark has no choice: ${major(q)}/${i}/${mark}`);
    run=updatePartAnswer(run,part.id,choice,at);
  });
  return run;
}
// Workflow helper only: generated-content truth is checked by independent
// per-major normal meaning tests. This helper exercises answer/save APIs.
export function answerGeneratedWorkflow(run: Run, index: number, at: number): Run {
  run.session.currentIndex=index;
  for(const answer of run.issued[index].correctAnswer.parts??[]) {
    if(answer.kind!=="choice")throw Error("Autumn generated fields must be scored single choices");
    run=updatePartAnswer(run,answer.partId,answer.choiceId,at);
  }
  return run;
}
