import facts from './legacy-2016-spring-fundamentals-source-facts.json';
import contracts from './legacy-2016-spring-fundamentals-input-contracts.json';
/** Fixed source facts imported from independent image review; no producer dependency. */
export const spring2016Review={facts,contracts,expectedKeys:[2,2,3,2,0,3,2,1],counts:[10,132,60,4,151,27,4,12],source:'2016h28h-fe-am',full80:80,remaining72:72};
export function spring2016OriginalFact(n:number){return (facts.questions as Record<string,typeof facts.questions['1']|typeof facts.questions['2']|typeof facts.questions['3']|typeof facts.questions['4']|typeof facts.questions['5']|typeof facts.questions['6']|typeof facts.questions['7']|typeof facts.questions['8']>)[String(n)];}

/** Local unpublished Q1 expansion; the old two bodies remain byte-identical. */
export const spring2016Q1CapacityReview={before:2,after:10,totalBefore:392,totalAfter:400,choicesBefore:1568,choicesAfter:1600,minimumMultiplier:2,maximumMultiplier:16,preservedBodySHA256:['f354e9563e6679ec9223647833c599e0538810e024e807ea334d80e739147b8c','34a7d849f7e4a3777ab6cb718c839d1038fa42f4ff0726054d23a2572e12bcfd'],inputAuthority:contracts.q1CapacityExtension};
