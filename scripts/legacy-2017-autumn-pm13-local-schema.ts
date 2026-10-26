/** Dev-only shape validation uses the real registered schema and exact tuples. */
import assert from 'node:assert/strict';
import type {Question} from '../src/core/types';
import {schema} from '../src/core/validation';
import {readLegacyAfternoonFigure} from '../src/core/legacy-afternoon-figures';
import {legacy2017AutumnPm13Profiles} from '../src/core/generators/legacy-2017-autumn-pm13';
export function assertAutumn2017Pm13LocalShape(value:unknown){
 assert(legacy2017AutumnPm13Profiles.length===14&&new Set(legacy2017AutumnPm13Profiles).size===14);
 schema('question',value);const question=value as Question;
 const figures=[question.prompt,...question.contexts.map(c=>c.content),...question.choices.map(c=>c.content)].flatMap(c=>c.blocks.filter(b=>b.type==='diagram'));
 for(const b of figures){assert(b.scene.kind==='source_figure'&&legacy2017AutumnPm13Profiles.includes(b.scene.profile));const expected=readLegacyAfternoonFigure(b.scene.profile,b.scene.values);assert.equal(b.caption,expected.caption);assert.equal(b.alt,expected.alt);}
 return{scope:'registered_core_schema_only',normalApp:'not_registered'} as const;
}
