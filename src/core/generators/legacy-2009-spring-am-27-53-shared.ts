import { DataError } from '../errors';
import { field, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import source from './legacy-2009-spring-am-27-53-source.json';

type SourceQuestion = { page:number; key:string; title:string; prompt:string; choices:string[]; detail?:string };
const records:Record<string,SourceQuestion> = source;
export const original = (number:number) => records[String(number)];
export function finite(number:number, condition:string, notes:string, build:(index:number)=>GeneratedBody, fixed=false): GenerationDefinition {
  const {title,key}=original(number);
  return {
    source:'2009h21h-fe-am-'+number, title, sourceAnswer:key, reference:[0], version:'3.7.0',
    fields:[field(condition,0,3)], notes:variableNotes+' '+notes,
    ...(fixed?{answerVariation:'fixed' as const}:{}),
    build(values) {
      const [index]=values;
      if(values.length!==1||!Number.isSafeInteger(index)||index<0||index>3)
        throw new DataError('PARAMETER_CONSTRAINT','指定条件が候補の範囲外です。');
      return build(index);
    },
  };
}
type Case = readonly [prompt:string, index:number, explanation:string, options?:readonly string[]];
export function knowledge(number:number, condition:string, notes:string, explanation:string, cases:readonly Case[], fixed=false) {
  const source=original(number);
  const variants:readonly Case[]=[[source.prompt,'アイウエ'.indexOf(source.key),explanation],...cases];
  return finite(number,condition,notes,index=>{
    const [stem,correctIndex,explanation,options=source.choices]=variants[index];
    return {prompt:[p(stem)],choices:strings([...options]),correctIndex,explanation};
  },fixed);
}
