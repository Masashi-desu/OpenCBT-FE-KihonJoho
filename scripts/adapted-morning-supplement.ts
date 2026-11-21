import assert from 'node:assert/strict';
import { additionalVersion } from '../src/core/generators';
import { bindBodyAnswers, ownContexts, type GenerationDefinition } from '../src/core/generators/definition';
import { contentHash } from '../src/core/hash';
import type { Attribution, Block, Question, Rights, Source, SourceRef, Template } from '../src/core/types';

type ReviewedMorningAdaptation = {
  paper: SourceRef;
  answer: SourceRef;
  commonPages: SourceRef[];
  paperRights: Rights;
  commonRightsIds: string[];
  officialKey: string;
  area: NonNullable<Question['learning']>['area'];
  checkedOn: string;
  change: string;
  review: string;
  references: { source: Source; locator: SourceRef['locator'] }[];
};

/** Builds a review candidate from independently edited text. The original
 * paper is a direct citation; its held page and text are not part of the pack. */
export async function makeAdaptedMorningSupplement(definition: GenerationDefinition, reviewed: ReviewedMorningAdaptation) {
  const { paper, answer, commonPages, paperRights, commonRightsIds, officialKey, checkedOn } = reviewed;
  const number = paper.locator.questionNumber;
  assert(number && answer.locator.questionNumber === number && definition.source.endsWith('-' + number));
  assert.equal(definition.sourceAnswer, officialKey);
  const reference = definition.build([...definition.reference]);
  assert(reference.choices.length === 4 && reference.correctIndex !== undefined && !reference.answerParts);
  assert.equal('アイウエ'[reference.correctIndex], officialKey);
  const references = reviewed.references.map(({ source, locator }) => ({ sourceId: source.id, locator }));
  const sourceRefs = [paper, ...commonPages];
  const own: Attribution = { origin: 'original', sourceRefs: references, rightsRefs: ['rights-original'], creatorIds: ['codex'] };
  const adapted: Attribution = { origin: 'adapted', sourceRefs: [...sourceRefs, ...references],
    rightsRefs: [paperRights.id, ...commonRightsIds, 'rights-original'], creatorIds: ['codex'] };
  const official: Attribution = { origin: 'official', sourceRefs: [answer], rightsRefs: [paperRights.id], creatorIds: ['ipa'] };
  const at = checkedOn + 'T00:00:00Z';
  const source = definition.source;
  const baseId = 'question-template-source-' + source;
  // Keep unique diagram IDs across the two records and their common notation.
  const blocksFor = (id: string) => {
    let sequence = 0;
    return (blocks: Block[]): Block[] => structuredClone(blocks).map(block => {
      assert(block.type !== 'image', 'an adapted text record cannot embed an unchecked source image');
      return block.type === 'diagram'
        ? { ...block, id: id.replace('question-', 'diagram-') + '-' + ++sequence, attribution: adapted }
        : block;
    });
  };
  const fixed: Question = {
    schemaVersion: '3.0.0', id: 'question-ipa-' + source, revision: 1, lifecycle: 'active', subject: 'A',
    learning: { area: reviewed.area, tags: [`legacy-${paper.locator.year}`], topics: [definition.title], keywords: [definition.title] },
    origin: { kind: 'official_adaptation', sourceRefs, derivedFrom: [], isModified: true, modificationBasis: 'official_source',
      changes: [{ at, actorId: 'codex', kind: 'wording', summary: '公式問題の条件・正答に沿って文面を独立編集',
        details: reviewed.change, affectsAnswer: false }] },
    contributors: [{ actorId: 'ipa', role: 'author' }, { actorId: 'codex', role: 'editor' }, { actorId: 'codex', role: 'verifier' }],
    prompt: { attribution: adapted, blocks: [] }, choices: [], contexts: [], contextRefs: [],
    correctAnswer: { choiceId: 'choice-original-' + (reference.correctIndex + 1), attribution: official },
    explanation: { attribution: own, blocks: [{ type: 'paragraph', text: reference.explanation }] },
    assetRefs: [], choiceShuffleAllowed: false, distribution: 'excluded',
    review: { checkedOn, reviewerIds: ['codex'], checks: {
      publication: 'pass', terms: 'pass', thirdParty: 'pass', transcription: 'pass', answer: 'pass', explanation: 'pass' },
      notes: reviewed.review },
  };
  const base = structuredClone(fixed);
  base.id = baseId;
  base.origin.derivedFrom = [{ questionId: fixed.id, revision: fixed.revision }];
  base.origin.changes.push({ at, actorId: 'codex', kind: 'wording', summary: '原形式を保った可変条件の基準問題を作成',
    details: definition.notes, affectsAnswer: true, answerDetails: reference.explanation });
  base.learning.tags.push('parameterized');
  for (const [record, choiceIdPrefix] of [[fixed, 'choice-original-'], [base, 'choice-value-']] as const) {
    const blocks = blocksFor(record.id);
    record.prompt.blocks = blocks(reference.prompt);
    record.choices = reference.choices.map((choice, i) => ({
      id: choiceIdPrefix + (i + 1), content: { attribution: adapted, blocks: blocks(choice) },
    }));
    record.contexts = ownContexts(reference, adapted).map(context => ({
      ...context, content: { ...context.content, blocks: blocks(context.content.blocks) },
    }));
    record.contextRefs = record.contexts.map(context => context.id);
  }
  bindBodyAnswers(base, reference, own);
  const template: Template = {
    schemaVersion: '3.0.0', id: 'template-source-' + source, revision: 1, title: definition.title,
    baseQuestionRef: { questionId: base.id, revision: base.revision },
    generatorRef: { id: 'generator-source-' + source, version: additionalVersion(definition) },
    parameterDomain: { values: {
      length: definition.fields.length,
      minimum: Math.min(...definition.fields.map(field => field.minimum)),
      maximum: Math.max(...definition.fields.map(field => field.maximum)),
    }, fields: structuredClone(definition.fields) },
    referenceParameters: { values: [...definition.reference] }, attribution: adapted, editorIds: ['codex'],
    lifecycle: 'active', distribution: 'excluded', bindingBasis: 'official_source',
    originalContentSha256: await contentHash(base),
  };
  return { questions: [fixed, base], templates: [template], assets: [], rights: [paperRights], sources: reviewed.references.map(({ source }) => source) };
}
