/** Source-owned authoring factory. It writes nothing and grants no release
 * permission; rights and per-question reviews are explicit reviewed inputs. */
import assert from 'node:assert/strict';
import type { Asset, Attribution, Block, Bundle, Question, Rights, Source, SourceRef, Template } from '../src/core/types';
import { labels } from '../src/core/types';
import { contentHash } from '../src/core/hash';
import { validateAnswerDefinition } from '../src/core/answers';
import { bindBodyAnswers, type GeneratedBody } from '../src/core/generators/definition';
import type { AfternoonBookletDefinition } from '../src/core/generators/afternoon-booklet-extension-contract';

/** Private authoring input; the released catalogue contains reviewed records,
 * not this factory's data or a way to execute question-supplied code. */
export type Stage3AfternoonQuestionSpec = {
  number: number;
  title: string;
  pages: number[];
  topics: string[];
  keywords: string[];
  original: GeneratedBody;
  definition: AfternoonBookletDefinition;
  /** Complete, source-checked readable transcription for each original image. */
  originalPageAlt: Record<number, string>;
  /** Explicit code-owned context titles credited to the editor, not to IPA. */
  editorialContextTitles?: string[];
  /** Locators for independently written, factual reference notes. */
  editorialContextSources?: Record<string, SourceRef[]>;
};

export type Stage3AfternoonRecords = Pick<Bundle, 'questions' | 'templates' | 'assets' | 'sources' | 'rights' | 'sets' | 'exams'>;
const own: Attribution = { origin: 'original', sourceRefs: [], rightsRefs: ['rights-original'], creatorIds: ['codex'] };

export type AfternoonBookletRecordSource = {
  collectionId: string;
  year: number;
  period: string;
  officialTitle: string;
  questionPages: readonly [number, number];
  printedPageNumber?: (physicalPage: number) => number;
  pageAssetId: (page: number) => string;
  area: (number: number) => Question['learning']['area'];
  learningTag: string;
};

export function afternoonBookletSourceRef(booklet: AfternoonBookletRecordSource, number: number, page: number, answer = false): SourceRef {
  return {
    sourceId: `source-ipa-${booklet.collectionId}-${number}-${answer ? 'ans' : 'qs'}`,
    locator: { year: booklet.year, period: booklet.period, exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後',
      questionNumber: String(number), page, section: `${booklet.officialTitle} 問${number}${answer ? ' 解答例' : ''}` },
  };
}

export async function makeAfternoonBookletRecords(booklet: AfternoonBookletRecordSource, input: {
  specs: readonly Stage3AfternoonQuestionSpec[];
  assets: readonly Asset[];
  sources: readonly Source[];
  rights: readonly Rights[];
  reviews: Readonly<Record<number, Question['review']>>;
  checkedOn: string;
}): Promise<Stage3AfternoonRecords> {
  const records: Stage3AfternoonRecords = { questions: [], templates: [], assets: [], sources: structuredClone([...input.sources]),
    rights: structuredClone([...input.rights]), sets: [], exams: [] };
  const numbers = input.specs.map(spec => spec.number), sourceIds = new Set(input.sources.map(source => source.id));
  assert(numbers.length > 0 && numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 13));
  assert.deepEqual(numbers, [...new Set(numbers)].sort((a, b) => a - b));
  const assets = new Map(input.assets.map(asset => [asset.id, asset]));
  assert.equal(assets.size, input.assets.length);
  const usedAssets = new Set<string>();
  for (const spec of input.specs) {
    const n = spec.number, source = booklet.collectionId + '-' + n, definition = spec.definition;
    assert.equal(definition.source, source);
    assert(sourceIds.has(`source-ipa-${source}-qs`) && sourceIds.has(`source-ipa-${source}-ans`));
    assert(input.rights.some(right => right.id === 'rights-ipa-' + source));
    assert(input.reviews[n], 'each question requires its own explicit review');
    assert(spec.pages.length && spec.pages.every(page => page >= booklet.questionPages[0] && page <= booklet.questionPages[1]));
    const mainAssets = spec.pages.map(page => {
      const asset = assets.get(booklet.pageAssetId(page)); assert(asset);
      assert.equal(asset.alt, spec.originalPageAlt[page], 'source-reviewed full-page transcription');
      assert(asset.alt.trim().length > 100); return asset;
    });
    const official: Attribution = { origin: 'official', sourceRefs: spec.pages.map(page => afternoonBookletSourceRef(booklet, n, page)),
      rightsRefs: ['rights-ipa-' + source], creatorIds: ['ipa'] };
    const adapted: Attribution = { ...structuredClone(official), origin: 'adapted', rightsRefs: [...official.rightsRefs, 'rights-original'], creatorIds: ['ipa', 'codex'] };
    let figureIndex = 0;
    const blocks = (items: readonly Block[], attribution: Attribution) => structuredClone([...items]).map(block => block.type === 'diagram'
      ? { ...block, id: `diagram-${source}-${++figureIndex}`, attribution: structuredClone(attribution) } : block);
    const contexts = (body: GeneratedBody, base: boolean): Question['contexts'] => (body.contexts ?? []).map((context, index) => {
      const images = context.blocks.filter((block): block is Extract<Block, { type: 'image' }> => block.type === 'image');
      const editorial = spec.editorialContextTitles?.includes(context.title);
      const materialAttributions=images.map(image=>{const asset=assets.get(image.assetId);assert(asset);return asset.attribution;});
      const materialAttribution:Attribution|undefined=materialAttributions.length?{
        origin:materialAttributions.some(a=>a.origin==='adapted')?'adapted':'official',
        sourceRefs:[...new Map(materialAttributions.flatMap(a=>a.sourceRefs).map(r=>[JSON.stringify(r),r])).values()],
        rightsRefs:[...new Set(materialAttributions.flatMap(a=>a.rightsRefs))],creatorIds:[...new Set(materialAttributions.flatMap(a=>a.creatorIds))],
      }:undefined;
      const attribution = editorial ? { ...own, sourceRefs: spec.editorialContextSources?.[context.title] ?? [] }
        : materialAttribution ?? (base ? adapted : official);
      assert(attribution, 'every reference image has reviewed material attribution');
      for (const image of images) { assert(assets.has(image.assetId)); usedAssets.add(image.assetId); }
      return { id: `context-${source}-${index + 1}`, title: context.title, ...(context.presentation ? { presentation: context.presentation } : {}),
        content: { attribution: structuredClone(attribution), blocks: blocks(context.blocks, attribution) } };
    });
    const originalBody = spec.original;
    assert(originalBody.answerParts?.length && originalBody.partAnswers?.length);
    const symbols = new Map<string, string>();
    for (const part of originalBody.answerParts) for (const [index, id] of part.choiceIds.entries()) {
      assert(index < labels.length); if (symbols.has(id)) assert.equal(symbols.get(id), labels[index]);
      symbols.set(id, labels[index]);
    }
    const sourceToOriginal = new Map(originalBody.choices.map((_, index) => ['choice-value-' + (index + 1), 'choice-original-' + (index + 1)]));
    const originalChoice = (id: string) => { const mapped = sourceToOriginal.get(id); assert(mapped, 'original choice preserves its source bank'); return mapped; };
    const originalContexts = contexts(originalBody, false);
    const original: Question = {
      schemaVersion: '3.0.0', id: 'question-ipa-' + source, revision: 1, lifecycle: 'active', subject: 'B',
      learning: { area: booklet.area(n),
        tags: [booklet.learningTag, 'legacy-afternoon'], topics: [...spec.topics], keywords: [...spec.keywords] },
      origin: { kind: 'official_reprint', sourceRefs: structuredClone(official.sourceRefs), derivedFrom: [], isModified: false,
        modificationBasis: 'official_source', changes: [{ at: input.checkedOn + 'T00:00:00Z', actorId: 'codex', kind: 'layout',
          summary: '原頁と全解答群・解答欄を保持', details: '公式の原画像と原問番号を保持し、必要な訂正・付属資料は個別の出典で表示します。', affectsAnswer: false }] },
      contributors: [{ actorId: 'ipa', role: 'author' }, { actorId: 'codex', role: 'editor' }, { actorId: 'codex', role: 'verifier' }],
      prompt: { attribution: structuredClone(official), blocks: mainAssets.map((asset, index) => ({ type: 'image', assetId: asset.id,
        caption: `原資料 問${n}（印刷p.${booklet.printedPageNumber?.(spec.pages[index]) ?? spec.pages[index] - 1}／PDF p.${spec.pages[index]}）` })) },
      contexts: originalContexts, contextRefs: originalContexts.map(context => context.id),
      choices: originalBody.choices.map((_, index) => { const symbol = symbols.get('choice-value-' + (index + 1)); assert(symbol);
        return { id: 'choice-original-' + (index + 1), content: { attribution: structuredClone(official), blocks: [{ type: 'paragraph', text: symbol }] } }; }),
      answerParts: originalBody.answerParts.map(part => ({ ...structuredClone(part), choiceIds: part.choiceIds.map(originalChoice) })),
      correctAnswer: { attribution: { ...structuredClone(official), sourceRefs: [afternoonBookletSourceRef(booklet, n, 1, true)] },
        parts: originalBody.partAnswers.map(answer => answer.kind === 'choice' ? { ...answer, choiceId: originalChoice(answer.choiceId) }
          : answer.kind === 'unordered' ? { ...answer, partIds: [...answer.partIds], choiceIds: answer.choiceIds.map(originalChoice) } : structuredClone(answer)) },
      explanation: { attribution: structuredClone(own), blocks: [{ type: 'paragraph', text: originalBody.explanation }] },
      assetRefs: [...new Set([...mainAssets.map(asset => asset.id), ...originalContexts.flatMap(context => context.content.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : []))])],
      choiceShuffleAllowed: false, distribution: 'excluded', review: structuredClone(input.reviews[n]),
    };
    validateAnswerDefinition(original);
    original.assetRefs.forEach(id => usedAssets.add(id));
    const body = definition.build([...definition.reference]), base = structuredClone(original);
    assert(original.answerParts);
    assert(body.answerParts?.length === original.answerParts.length);
    base.id = 'question-template-source-' + source;
    base.origin.kind = 'official_adaptation'; base.origin.isModified = true; base.origin.derivedFrom = [{ questionId: original.id, revision: 1 }];
    base.origin.changes.push({ at: input.checkedOn + 'T00:00:00Z', actorId: 'codex', kind: 'wording', summary: '原形式を保った改変問題',
      details: definition.publicNotes, affectsAnswer: true, answerDetails: body.explanation });
    base.prompt = { attribution: structuredClone(adapted), blocks: blocks(body.prompt, adapted) };
    base.choices = body.choices.map((items, index) => ({ id: 'choice-value-' + (index + 1), content: { attribution: structuredClone(adapted), blocks: blocks(items, adapted) } }));
    base.contexts = contexts(body, true); base.contextRefs = base.contexts.map(context => context.id);
    base.assetRefs = [...new Set(base.contexts.flatMap(context => context.content.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])))];
    assert.deepEqual(base.assetRefs, definition.fixedReferenceAssetIds ?? [], 'fixed source references and declaration order agree');
    bindBodyAnswers(base, body, own);
    base.explanation = { attribution: structuredClone(own), blocks: [{ type: 'paragraph', text: body.explanation }] };
    base.learning.tags.push('parameterized');
    const template: Template = { schemaVersion: '3.0.0', id: 'template-source-' + source, revision: 1, title: spec.title,
      baseQuestionRef: { questionId: base.id, revision: 1 }, generatorRef: { id: 'generator-source-' + source, version: definition.version ?? '3.2.0' },
      parameterDomain: { values: { length: definition.fields.length, minimum: Math.min(...definition.fields.map(field => field.minimum)), maximum: Math.max(...definition.fields.map(field => field.maximum)) }, fields: structuredClone(definition.fields) },
      referenceParameters: { values: [...definition.reference] }, attribution: structuredClone(adapted), editorIds: ['codex'], lifecycle: 'active', distribution: 'excluded',
      bindingBasis: 'official_source', originalContentSha256: await contentHash(base) };
    records.questions.push(original, base); records.templates.push(template);
  }
  records.assets = input.assets.filter(asset=>usedAssets.has(asset.id)).map(asset=>structuredClone(asset));
  return records;
}
