/** Official spring answer-table p.1 visually checked (release-scoped projection; full feature fixture retained), 2026-10-19.
 * All cells are single choices; no unordered/no-correct-answer note occurs in
 * this answer table. Per-major semantic/source review is recorded separately.
 */
export type Legacy2017AnswerGroup={subquestion:number;slot:string;symbol:string;kind:"choice"};
const g=(subquestion:number,slots:string,symbols:string)=>{
  const names=slots.split(" "),answers=symbols.split(" ");
  if(names.length!==answers.length)throw Error("Answer transcription length");
  return names.map((slot,i)=>({subquestion,slot,symbol:answers[i],kind:"choice" as const}));
};
const key=(period:"h",number:number,groups:Legacy2017AnswerGroup[])=>({source:`2017h29${period}-fe-pm-${number}`,groups,status:"answer_image_reviewed_only" as const,sourcePage:1});
export const legacy2017AfternoonAnswers=[
 key("h",1,[...g(1,"answer","エ"),...g(2,"a","イ"),...g(3,"b c d","ウ ア オ")]),
 key("h",2,[...g(1,"a b c","イ エ イ"),...g(2,"d e","イ エ")]),
 key("h",3,[...g(1,"answer","ア"),...g(2,"a b","エ ア"),...g(3,"c d","ア ア")]),
 key("h",4,[...g(1,"a b","ウ ア"),...g(2,"c","ア"),...g(3,"answer","イ")]),
 key("h",5,[...g(1,"a b","イ カ"),...g(2,"c d","ウ イ"),...g(3,"answer","ウ")]),
 key("h",6,[...g(1,"a b c d","エ ア ウ ウ"),...g(2,"e f","ウ オ")]),
 key("h",7,[...g(1,"a b c","ウ ア ウ"),...g(2,"d e","カ エ"),...g(3,"f g h","イ ア ケ")]),
 key("h",8,[...g(1,"a b c d","イ オ キ イ"),...g(2,"e f g","イ カ ア")]),
 key("h",9,[...g(1,"a b c","カ キ エ"),...g(2,"d e","イ イ"),...g(3,"f g","ア イ")]),
 key("h",10,[...g(1,"a b c d","ウ イ エ ア"),...g(2,"e f g","エ エ ア")]),
 key("h",11,[...g(1,"a b c d","ア エ ア エ"),...g(2,"e f g","ア ウ ウ")]),
 key("h",12,[...g(1,"a b c","オ ウ イ"),...g(2,"d","エ"),...g(3,"e f","ア オ")]),
 key("h",13,[...g(1,"a","イ"),...g(2,"b c d","ア ウ ウ"),...g(3,"e f","イ エ")]),
];
