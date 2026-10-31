import * as validators from "../../generated/validators.js";
import { contentHash } from "../hash";
import type { Question, Template } from "../types";
import type { GeneratedBody, GenerationDefinition } from "./definition";
import reviewed from "./reviewed-contracts/legacy-2017-development-core.json";

export const criticalPathDependencyId = "dependency-core-2024-a-13";
export type CoreQuestionBinder = (base: Question, template: Template, values: number[], instanceId: string, at: string) => Question;
export class CoreDependencyError extends Error {
  constructor(public readonly code: string, detail: string) { super(detail); this.name = "CoreDependencyError"; }
}
function fail(code: string, detail: string): never { throw new CoreDependencyError(code, detail); }

/** Descriptor-only JSON preflight, before schema/hash/property reads. Only
 * selected records are admitted; this is not whole-Bundle/rights validation. */
function jsonData(value: unknown, ancestors = new Set<object>()): void {
  const invalid = () => fail("CORE_RESOURCE_JSON", "Selected resource must be lossless JSON data");
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) invalid(); return; }
  if (typeof value !== "object") invalid();
  const object = value as object, array = Array.isArray(object), prototype = Object.getPrototypeOf(object);
  if (ancestors.has(object) || prototype !== (array ? Array.prototype : Object.prototype) && prototype !== null) invalid();
  ancestors.add(object);
  const keys = Reflect.ownKeys(object);
  const length = array ? Object.getOwnPropertyDescriptor(object, "length")!.value as number : 0;
  if (array && (keys.length !== length + 1 || !Array.from({ length }, (_, i) => Object.hasOwn(object, i)).every(Boolean))) invalid();
  for (const name of keys) {
    if (array && name === "length") continue;
    if (typeof name !== "string" || array && !/^(0|[1-9]\d*)$/.test(name)) invalid();
    const descriptor = Object.getOwnPropertyDescriptor(object, name)!;
    if (!descriptor.enumerable || !("value" in descriptor)) invalid();
    jsonData(descriptor.value, ancestors);
  }
  ancestors.delete(object);
}
function freezeOwned<T>(value: T): T {
  if (value && typeof value === "object") { for (const child of Object.values(value)) freezeOwned(child); Object.freeze(value); }
  return value;
}
/** Inspect array/id descriptors without invoking a getter to select records.
 * Unrelated IDs (including duplicates) remain outside this local boundary. */
function select<T extends { id: string }>(rows: readonly T[], id: string): T {
  if (!Array.isArray(rows)) fail("CORE_RESOURCE_JSON", "Resource array required");
  const length = Object.getOwnPropertyDescriptor(rows, "length")!.value as number;
  if (Reflect.ownKeys(rows).length !== length + 1) fail("CORE_RESOURCE_JSON", "Dense resource array required");
  const matches: T[] = [];
  for (let i = 0; i < length; i++) {
    const item = Object.getOwnPropertyDescriptor(rows, String(i));
    if (!item || !item.enumerable || !("value" in item) || !item.value || typeof item.value !== "object") fail("CORE_RESOURCE_JSON", "Resource data entry required");
    const identity = Object.getOwnPropertyDescriptor(item.value, "id");
    if (identity && !("value" in identity)) fail("CORE_RESOURCE_JSON", "Resource ID accessor is not allowed");
    if (identity?.value === id) matches.push(item.value);
  }
  if (matches.length !== 1) fail(matches.length ? "CORE_RESOURCE_DUPLICATE" : "CORE_RESOURCE_REQUIRED", `${id}: exactly one ID required before revision selection`);
  return matches[0];
}
function schema(kind: "question" | "template", value: Question | Template): void {
  if (!validators[kind](value)) fail("CORE_RESOURCE_SCHEMA", `${kind}: native schema required`);
}

/** Extract exactly the old bound-body representation. No source text or
 * diagram/attribution is reconstructed here. The caller owns its input. */
export function extractCriticalPathDependencyBody(bound: Question): GeneratedBody {
  jsonData(bound); schema("question", bound);
  if (bound.contexts.length !== 0 || bound.answerParts || !bound.explanation || bound.explanation.blocks.length !== 1 || bound.explanation.blocks[0].type !== "paragraph")
    fail("CORE_BINDING_FORMAT", "Core dependency requires no contexts and one explanation paragraph");
  const correctIndex = bound.choices.findIndex(choice => choice.id === bound.correctAnswer.choiceId);
  if (correctIndex < 0 || bound.choices.length !== 4) fail("CORE_BINDING_FORMAT", "Core dependency requires a resolved four-choice answer");
  return structuredClone({ prompt: bound.prompt.blocks, choices: bound.choices.map(choice => choice.content.blocks), correctIndex, explanation: bound.explanation.blocks[0].text });
}

/** Dependency-only. Constructor validates three owned records and calls the
 * actual core binder zero times. Keep the original eight-field delegation;
 * composition reviews only its four explicitly required vectors. */
export async function makeCriticalPathDependency(input: {
  questions: readonly Question[];
  templates: readonly Template[];
  bindCore: CoreQuestionBinder;
}): Promise<GenerationDefinition> {
  const bindCore = input.bindCore;
  if (typeof bindCore !== "function") fail("CORE_BINDER_REQUIRED", "Managed core binder required");
  const selected = {
    base: select(input.questions, reviewed.resources.base.id),
    template: select(input.templates, reviewed.resources.template.id),
    original: select(input.questions, reviewed.resources.officialOriginal.id),
  };
  for (const row of Object.values(selected)) jsonData(row);
  // Clone before the first async hash; caller mutation during suspension cannot
  // replace what is being verified. Never freeze the caller's records.
  const base = freezeOwned(structuredClone(selected.base)), template = freezeOwned(structuredClone(selected.template)), original = freezeOwned(structuredClone(selected.original));
  jsonData(reviewed.canonical.metadata);
  const metadata = structuredClone(reviewed.canonical.metadata) as Omit<GenerationDefinition, "build">;
  schema("question", base); schema("template", template); schema("question", original);
  for (const [kind, row, expected] of [["base", base, reviewed.resources.base], ["template", template, reviewed.resources.template], ["original", original, reviewed.resources.officialOriginal]] as const) {
    if (row.id !== expected.id || row.revision !== expected.revision) fail("CORE_RESOURCE_IDENTITY", `${kind}: current ID/revision required`);
    if (await contentHash(row) !== expected.sha256) fail("CORE_RESOURCE_REVIEW_REQUIRED", `${kind}: reviewed bytes changed`);
  }
  if (template.generatorRef.id !== reviewed.resources.generator.id || template.generatorRef.version !== reviewed.resources.generator.version ||
      template.baseQuestionRef.questionId !== base.id || template.baseQuestionRef.revision !== base.revision ||
      !base.origin.derivedFrom?.some(ref => ref.questionId === original.id && ref.revision === original.revision))
    fail("CORE_RESOURCE_REFERENCE", "Reviewed core generator and original/base/template links required");
  if (await contentHash(metadata) !== reviewed.canonical.metadataSha256) fail("CORE_CONTRACT_REVIEW_REQUIRED", "Reviewed wrapper metadata changed");
  return { ...metadata, build: values => extractCriticalPathDependencyBody(bindCore(structuredClone(base), structuredClone(template), [...values], reviewed.executionTokens.instanceId, reviewed.executionTokens.at)) };
}
