import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import rows from './legacy-2014-spring-am-01-26-source.json';

export const source=Object.fromEntries(rows.map(row=>[row.number,row])) as Record<number,typeof rows[number]>;
export const marks='アイウエ';

export function define(n:number,fieldLabel:string,count:number,review:string,build:(index:number)=>GeneratedBody,answerFixed=false):GenerationDefinition {
  const row=source[n];
  return {
    source:'2014h26h-fe-am-'+n,
    title:row.title,sourceAnswer:row.sourceKey,version:'3.2.0',fields:[field(fieldLabel,0,count-1)],reference:[0],
    notes:variableNotes+' '+review,
    ...(answerFixed?{answerVariation:'fixed' as const}:{}),
    build(values) {
      if(!Array.isArray(values)||values.length!==1||Reflect.ownKeys(values).length!==2)
        throw Error('PARAMETER_CONSTRAINT');
      const index=Object.getOwnPropertyDescriptor(values,'0');
      if(!index||!('value' in index)||!Number.isSafeInteger(index.value)||index.value<0||index.value>=count)
        throw Error('PARAMETER_CONSTRAINT');
      return build(index.value);
    },
  };
}

export function text(n:number,index:number,prompt:string,correctIndex:number,explanation:string,choices=source[n].choices):GeneratedBody {
  return {prompt:[p(index===0?source[n].prompt:prompt)],choices:strings(choices),correctIndex,explanation};
}

export function knowledge(n:number,fieldLabel:string,cases:readonly (readonly [prompt:string,correct:number,explanation:string])[]) {
  return define(n,fieldLabel,cases.length,'問いの方向・四択の役割を維持し、対象又は状況から各候補を比較する。',index=>
    text(n,index,...cases[index]), new Set(cases.map(row=>row[1])).size===1);
}
