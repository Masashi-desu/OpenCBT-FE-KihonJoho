import assert from 'node:assert/strict';
import type { GeneratedBody } from '../../src/core/generators/definition';
import { blockText } from '../../src/core/generators/legacy-2016-autumn-pm-09-13-support';
import { legacy2014SpringPm0913Figures as figures } from '../../src/core/generators/legacy-2014-spring-pm-09-13-figures';

const alphabet='アイウエオカキクケコ';
export const visiblePrompt=(body:GeneratedBody)=>body.prompt.map(blockText).join('\n');
export const codeBlocks=(body:GeneratedBody,language:string)=>body.prompt.flatMap(
  block=>block.type==='code'&&block.language===language?[block.text]:[]);
export const choice=(body:GeneratedBody,id:string)=>blockText(body.choices[Number(id.split('-').at(-1))-1][0]);
export function choices(body:GeneratedBody,name:string){
  const part=body.answerParts!.find(value=>value.id==='part-'+name)!;
  const answer=body.partAnswers!.find(value=>value.kind==='choice'&&value.partId===part.id);
  assert(answer?.kind==='choice');
  return {choices:part.choiceIds.map(id=>choice(body,id)),selected:choice(body,answer.choiceId),
    key:alphabet[part.choiceIds.indexOf(answer.choiceId)]};
}
export function panel(body:GeneratedBody,name:string){
  const block=body.prompt.find(value=>value.type==='diagram'&&value.scene.kind==='source_figure'&&value.scene.profile.endsWith('-'+name));
  assert(block?.type==='diagram'&&block.scene.kind==='source_figure',name);
  const {profile,values}=block.scene;
  const figure=figures.find(item=>item.profile===profile)!;
  assert.equal(figure.alt(values),block.alt);
  return figure.panel(values);
}
export const complete=(code:string,body:GeneratedBody,overrides:Record<string,string>={})=>
  code.replaceAll(/\[([a-g])\]/g,(_,name:string)=>overrides[name]??choices(body,name).selected);
export const textWithoutMarks=(visible:string)=>visible.replaceAll('△',' ').replaceAll('↓\n','\n').replace(/↓$/,'\n');

export function cExamples(body:GeneratedBody){
  const width=Number(/最大文字数を(\d+)とした/.exec(visiblePrompt(body))![1]);
  const edits=panel(body,'edits').tables[0].rows;
  const punctuation=/lch = '(.)'/.exec(edits[0][1])![1];
  const examples=['wrapping','indenting'].map(name=>{
    const [input,output]=panel(body,name).tables;
    return {input:textWithoutMarks(input.rows[0][0]),output:textWithoutMarks(output.rows[0][0])};
  });
  return {width,edits,punctuation,examples};
}

type JavaArticle={id:string;title:string;story:string;free:boolean};
export function javaInputs(body:GeneratedBody){
  const articles=[...visiblePrompt(body).matchAll(/Article.create\("(\d+)", "([^"]+)", "([^"]+)", (true|false)\);/g)]
    .map(([,id,title,story,free])=>({id,title,story,free:free==='true'}));
  const changed=/記事識別子 "(\d+)"/.exec(visiblePrompt(body))![1];
  return {articles,changed};
}
export function javaReference(articles:JavaArticle[],changed?:string){
  const sorted=[...articles].sort((a,b)=>a.id<b.id?-1:1);
  const available=(article:JavaArticle)=>article.id!==changed&&article.free;
  return ['ゲスト','登録会員Ａ','有料会員Ｂ'].flatMap((reader,access)=>{
    let first=true;
    return sorted.map(article=>{
      const permitted=access===2||available(article)||access===1&&first;
      if(!available(article))first=false;
      return reader+': 記事「'+article.title+'」'+(permitted?article.story:'＜閲覧不可＞');
    });
  });
}
