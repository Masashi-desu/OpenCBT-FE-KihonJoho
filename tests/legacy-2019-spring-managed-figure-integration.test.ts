import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup as ssr} from 'react-dom/server';
import {legacy2019SpringAfternoonDefinitions as definitions} from '../src/core/generators/legacy-2019-spring-afternoon-definitions';
import profiles from '../src/core/generators/legacy-2019-spring-profiles.json';
import {LegacyAfternoonFigure} from '../src/ui/LegacyAfternoonFigure';
import {schema} from '../src/core/validation';
import type {Block, Question} from '../src/core/types';
import {spring2019TestBundle} from './fixtures/legacy-2019-spring-prepared-fixture';
import {bindLegacyAfternoonQuestion} from '../src/core/generators/legacy-afternoon-binding';

// Dispatch/native-schema integration only. Independent per-major oracles and
// primary source/layout reviews establish meaning and fidelity separately.
test('all358 finite S205 inputs use the exact51 registered profiles and render each current tuple without mutating source blocks', () => {
  const unique = new Map<string, Extract<Block, {type: 'diagram'}>>();
  const carriers = new Map<string, Question>();
  let inputs = 0;
  for (const definition of definitions) {
    const records = spring2019TestBundle(Number(definition.source.split('-').at(-1)));
    const template = records.templates[0], base = records.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
    assert(base);
    const visit = (at: number, values: number[]) => {
      if (at < definition.fields.length) {
        const field = definition.fields[at];
        for (let value = field.minimum; value <= field.maximum; value++) visit(at + 1, [...values, value]);
        return;
      }
      let body;
      try {body = definition.build(values);} catch (error) {
        assert.equal((error as Error).message, 'PARAMETER_CONSTRAINT'); return;
      }
      inputs++;
      const question = bindLegacyAfternoonQuestion(base, template, definition, values, `qa-managed-${inputs}`, '2026-10-29T00:00:00Z');
      schema('question', question);
      for (const block of [...question.prompt.blocks, ...question.choices.flatMap(c => c.content.blocks), ...question.contexts.flatMap(c => c.content.blocks)]) {
        if (block.type !== 'diagram') continue;
        assert.equal(block.scene.kind, 'source_figure');
        assert(block.scene.kind === 'source_figure');
        const {profile, values: tuple} = block.scene;
        assert(profiles.includes(profile), profile);
        if (!carriers.has(profile)) carriers.set(profile, question);
        const key = JSON.stringify([profile, tuple, block.caption]);
        if (!unique.has(key)) unique.set(key, structuredClone(block));
      }
    };
    visit(0, []);
  }
  assert.equal(inputs, 358);
  const seen = new Set<string>(), first = new Map<string, Extract<Block, {type: 'diagram'}>>();
  for (const block of unique.values()) {
    assert(block.scene.kind === 'source_figure');
    const {profile, values} = block.scene, before = structuredClone(block);
    const html = ssr(createElement(LegacyAfternoonFigure, {profile, values, caption: block.caption}));
    assert(html.length > 0, profile);
    assert(!html.includes('<script'));
    assert.deepEqual(block, before);
    seen.add(profile); if (!first.has(profile)) first.set(profile, block);
  }
  assert.deepEqual([...seen].sort(), [...profiles].sort());
  for (const [profile, block] of first) {
    assert(block.scene.kind === 'source_figure');
    const values = block.scene.values;
    assert.throws(() => ssr(createElement(LegacyAfternoonFigure, {profile, values, caption: block.caption + ' 未確認'})));
    assert.throws(() => ssr(createElement(LegacyAfternoonFigure, {profile, values: [...values, 999], caption: block.caption})));
    const unknown = structuredClone(carriers.get(profile)!); let changed = 0;
    for (const b of [unknown.prompt, ...unknown.choices.map(c => c.content), ...unknown.contexts.map(c => c.content)].flatMap(c => c.blocks))
      if (b.type === 'diagram' && b.scene.kind === 'source_figure' && b.scene.profile === profile) {b.scene.profile += '-qa-unknown'; changed++;}
    assert(changed > 0);
    assert.throws(() => schema('question', unknown), {code: 'SCHEMA'});
  }
});
