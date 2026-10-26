import {createElement,Fragment}from'react';import {renderToStaticMarkup}from'react-dom/server';
import {spring2018NativeFragment,spring2018ValidTuples}from'../src/core/generators/legacy-2018-spring-pm5-8-native';
import {Legacy2018SpringPmNativeText as Native,Legacy2018SpringPm6SourceTable}from'../src/ui/Legacy2018SpringPm5To8Native';
import {legacy2018SpringPm5Definition as d5}from'../src/core/generators/legacy-2018-spring-pm5';
import {Legacy2018SpringPm5Figure as f5}from'../src/ui/Legacy2018SpringPm5Figure';
import {legacy2018SpringPm5Records as r5}from'../scripts/import-legacy-2018-spring-pm5';
import {legacy2018SpringPm6Definition as d6}from'../src/core/generators/legacy-2018-spring-pm6';
import {Legacy2018SpringPm6Figure as f6}from'../src/ui/Legacy2018SpringPm6Figure';
import {legacy2018SpringPm6Records as r6}from'../scripts/import-legacy-2018-spring-pm6';
import {legacy2018SpringPm7Definition as d7}from'../src/core/generators/legacy-2018-spring-pm7';
import {Legacy2018SpringPm7Figure as f7}from'../src/ui/Legacy2018SpringPm7Figure';
import {legacy2018SpringPm7Records as r7}from'../scripts/import-legacy-2018-spring-pm7';
import {legacy2018SpringPm8Definition as d8}from'../src/core/generators/legacy-2018-spring-pm8';
import {Legacy2018SpringPm8Figure as f8}from'../src/ui/Legacy2018SpringPm8Figure';
import {legacy2018SpringPm8Records as r8}from'../scripts/import-legacy-2018-spring-pm8';
import type{Block}from'../src/core/types';import type{Spring2018Major}from'../src/core/generators/legacy-2018-spring-pm5-8-native';
export const definitions={5:d5,6:d6,7:d7,8:d8},factories={5:r5,6:r6,7:r7,8:r8},tuples=spring2018ValidTuples;
export function renderDraft(major:Spring2018Major,values:number[]){const b=definitions[major].build(values),figures={5:f5,6:f6,7:f7,8:f8};return renderToStaticMarkup(createElement('article',{'data-major':major},b.prompt.map((block,i)=>{if(block.type==='paragraph'){if(spring2018NativeFragment(major,block.text).known)return createElement(Native,{major,text:block.text,key:i});return createElement('p',{key:i},block.text);}if(block.type==='diagram'&&block.scene.kind==='source_figure')return createElement(figures[major],{profile:block.scene.profile,values:block.scene.values,caption:block.caption??'',key:i});if(block.type==='table'){if(major===6)return createElement(Legacy2018SpringPm6SourceTable,{block,key:i});return createElement('figure',{key:i},createElement('figcaption',null,block.caption),createElement('div',{className:'diagram-scroll',tabIndex:0},createElement('table',null,createElement('thead',null,createElement('tr',null,...block.columns.map((s,j)=>createElement('th',{key:j},s)))),createElement('tbody',null,...block.rows.map((row,j)=>createElement('tr',{key:j},...row.map((s,k)=>createElement('td',{key:k},s))))))));}throw Error('unexpected draft block');})));}
