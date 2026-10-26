/** Dev-only validation now uses the actually registered core schema. */
import assert from 'node:assert/strict';
import type {Question} from '../src/core/types';
import {schema} from '../src/core/validation';
import {readLegacyAfternoonFigure} from '../src/core/legacy-afternoon-figures';
export function assertAutumn2017LocalQuestionShape(value:unknown,profiles:string[]){
 assert(profiles.length&&new Set(profiles).size===profiles.length&&profiles.every(p=>/^legacy-2017-autumn-pm[1-4]-[a-z-]+$/.test(p)),'closed locally owned profile names');
 schema('question',value);const question=value as Question;
 const figures=[question.prompt,...question.contexts.map(c=>c.content),...question.choices.map(c=>c.content)].flatMap(c=>c.blocks.filter(b=>b.type==='diagram'));
 assert(figures.length&&figures.every(b=>b.scene.kind==='source_figure'&&profiles.includes(b.scene.profile)),'only source-owned registered profiles');
 for(const b of figures){assert(b.scene.kind==='source_figure');const expected=readLegacyAfternoonFigure(b.scene.profile,b.scene.values);assert.equal(b.caption,expected.caption);assert.equal(b.alt,expected.alt);}
 return{scope:'registered_core_schema_only',profiles:[...profiles],normalApp:'not_registered'} as const;
}
