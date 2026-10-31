import { contentHash, sha256 } from "../hash";
import type { GeneratedBody, GenerationDefinition } from "./definition";

export type DefinitionMetadata = Omit<GenerationDefinition, "build">;
export type BodyHashCodec = "content-hash-v1" | "json-stringify-sha256-v1";
export type ReviewedInput = {
  values: readonly number[];
  expected:
    /** Omitted codec preserves the original sorted content-hash contract. */
    | { kind: "body"; sha256: string; codec?: BodyHashCodec }
    | { kind: "group-member"; groupId: string }
    | { kind: "reject"; name: string; message: string; code?: string };
};
export type ReviewedBodyGroup = {
  /** IDs are local to this source's contract. */
  id: string;
  codec: "json-ordered-values-body-v1";
  orderedInputs: readonly (readonly number[])[];
  sha256: string;
};
/** Supplied from an independently reviewed fixture, never inferred from build. */
export type DefinitionContract = {
  metadata: DefinitionMetadata;
  inputs: readonly ReviewedInput[];
  /** Group members occur in this same order in inputs; no per-case digest is substituted. */
  groups?: readonly ReviewedBodyGroup[];
};
export type ImmutableDefinition = Readonly<Omit<GenerationDefinition, "fields" | "reference" | "build">> & {
  readonly fields: readonly Readonly<GenerationDefinition["fields"][number]>[];
  readonly reference: readonly number[];
  build(values: number[]): GeneratedBody;
};
export type NativeDefinition = {
  definition: GenerationDefinition;
  contract: DefinitionContract;
};
export type DependencyInputMap = {
  /** Adapter input, with each required canonical input specified explicitly. */
  values: readonly number[];
  /** Reviewed bodies and semantic rejections may be read, always within fields. */
  reads: readonly { source: string; values: readonly number[] }[];
};
export type AdapterNode = {
  source: string;
  dependencies: readonly string[];
  dependencyInputs: readonly DependencyInputMap[];
  contract: DefinitionContract;
  create: (dependencies: {
    /** Only declared dependencies are visible; no mutable Map/array is exposed. */
    get(source: string): ImmutableDefinition;
  }) => GenerationDefinition | Promise<GenerationDefinition>;
};
export class CompositionError extends Error {
  constructor(public readonly code: string, detail: string) {
    super(detail);
    this.name = "CompositionError";
  }
}
function fail(code: string, detail: string): never { throw new CompositionError(code, detail); }
const key = (values: readonly number[]) => JSON.stringify(values);
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
function freezeOwned<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freezeOwned(child);
    Object.freeze(value);
  }
  return value;
}
function owned<T>(value: T): T { return freezeOwned(structuredClone(value)); }
/** Run before domain checks read contract properties. This descriptor-only
 * pass must not invoke a metadata getter, even for source/fields/reference. */
function metadataDataProperties(value: unknown, seen = new Set<object>()): void {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== (Array.isArray(value) ? Array.prototype : Object.prototype) && prototype !== null)
    fail("COMPOSITION_METADATA", "metadata requires plain JSON data objects");
  seen.add(value);
  for (const name of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name)!;
    if (!("value" in descriptor)) fail("COMPOSITION_METADATA", "metadata accessors are not allowed");
    metadataDataProperties(descriptor.value, seen);
  }
}
/** Metadata hashes describe JSON data. Reject shapes that JSON would silently
 * drop/coerce, rather than treating an omitted property as own undefined. */
function jsonMetadata(value: unknown, source: string, path = "$", ancestors = new Set<object>()): void {
  const invalid = () => fail("COMPOSITION_METADATA", `${source}: metadata is not lossless JSON at ${path}`);
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) invalid(); return; }
  if (typeof value !== "object") invalid();
  const object = value as object, array = Array.isArray(object);
  if (ancestors.has(object) || !array && Object.getPrototypeOf(object) !== Object.prototype && Object.getPrototypeOf(object) !== null) invalid();
  ancestors.add(object);
  const keys = Reflect.ownKeys(object);
  if (array && (keys.length !== object.length + 1 || !Array.from({ length: object.length }, (_, i) => Object.hasOwn(object, i)).every(Boolean))) invalid();
  for (const name of keys) {
    if (array && name === "length") continue;
    if (typeof name !== "string" || array && !/^(0|[1-9]\d*)$/.test(name)) invalid();
    const descriptor = Object.getOwnPropertyDescriptor(object, name)!;
    if (!descriptor.enumerable || !("value" in descriptor)) invalid();
    jsonMetadata(descriptor.value, source, `${path}.${String(name)}`, ancestors);
  }
  ancestors.delete(object);
}
function metadata(definition: GenerationDefinition): DefinitionMetadata {
  const rest: Record<string, unknown> = {};
  // Inspect descriptors before copying: spread/structuredClone could otherwise
  // erase non-enumerable keys or invoke accessors before validation.
  for (const name of Reflect.ownKeys(definition)) {
    if (name === "build") continue;
    const descriptor = Object.getOwnPropertyDescriptor(definition, name)!;
    if (typeof name !== "string" || !descriptor.enumerable || !("value" in descriptor))
      fail("COMPOSITION_METADATA", "metadata requires enumerable string data properties");
    Object.defineProperty(rest, name, { value: descriptor.value, enumerable: true });
  }
  jsonMetadata(rest, typeof rest.source === "string" ? rest.source : "unknown");
  return structuredClone(rest) as DefinitionMetadata;
}
function inputKey(values: readonly number[], source: string): string {
  if (!Array.isArray(values) || !Array.from(values).every(Number.isSafeInteger))
    fail("COMPOSITION_INPUT", `${source}: finite integer input required`);
  return key(values);
}
function validateDomain(fields: readonly Readonly<GenerationDefinition["fields"][number]>[], values: readonly number[], source: string) {
  if (values.length !== fields.length || values.some((v, i) => !Number.isSafeInteger(v) || v < fields[i].minimum || v > fields[i].maximum))
    fail("COMPOSITION_DOMAIN", `${source}: input outside reviewed field domain ${key(values)}`);
}
function successful(expected: ReviewedInput["expected"]) { return expected.kind === "body" || expected.kind === "group-member"; }
function validHash(hash: unknown): hash is string { return typeof hash === "string" && /^[a-f0-9]{64}$/.test(hash); }
type CodeShape = { own: false } | { own: true; value: string };
/** Inspect the whole lookup path without evaluating a getter. A code inherited
 * from any prototype is different from the reviewed absence of code. */
function dataDescriptor(value: object, name: string): PropertyDescriptor | undefined {
  const seen = new Set<object>();
  for (let current: object | null = value; current && !seen.has(current); current = Object.getPrototypeOf(current)) {
    seen.add(current);
    const descriptor = Object.getOwnPropertyDescriptor(current, name);
    if (descriptor) return descriptor;
  }
}
function rejectionCode(value: object, declaration = false): CodeShape | undefined {
  const own = Object.getOwnPropertyDescriptor(value, "code");
  if (own) return "value" in own && typeof own.value === "string" && (!declaration || own.enumerable)
    ? { own: true, value: own.value } : undefined;
  return dataDescriptor(value, "code") ? undefined : { own: false };
}
/** Run before structuredClone can call an expected-code accessor or discard an
 * inherited/non-enumerable code. Other outer contract shapes stay out of scope. */
function rejectionDeclarations(contract: DefinitionContract, source: string): void {
  const invalid = () => fail("COMPOSITION_CONTRACT", `${source}: lossless own rejection code required`);
  const inputs = Object.getOwnPropertyDescriptor(contract, "inputs");
  if (!inputs) return;
  if (!("value" in inputs)) invalid();
  if (!Array.isArray(inputs.value)) return;
  for (let i = 0; i < inputs.value.length; i++) {
    const row = Object.getOwnPropertyDescriptor(inputs.value, String(i));
    if (!row || !("value" in row) || !row.value || typeof row.value !== "object") invalid();
    const expectedProperty = Object.getOwnPropertyDescriptor(row!.value, "expected");
    if (!expectedProperty || !("value" in expectedProperty)) invalid();
    const expected = expectedProperty!.value;
    if (!expected || typeof expected !== "object") continue;
    for (const name of Reflect.ownKeys(expected))
      if (!("value" in Object.getOwnPropertyDescriptor(expected, name)!)) invalid();
    const kind = dataDescriptor(expected, "kind");
    if (kind && !("value" in kind)) invalid();
    if (kind?.value === "reject" && !rejectionCode(expected, true)) invalid();
  }
}
function snapshotContract(contract: DefinitionContract): DefinitionContract {
  metadataDataProperties(contract.metadata);
  const source = contract.metadata.source;
  if (!Array.isArray(contract.metadata.fields) || Array.from(contract.metadata.fields).some(f => !f || !Number.isSafeInteger(f.minimum) || !Number.isSafeInteger(f.maximum) || f.minimum > f.maximum))
    fail("COMPOSITION_DOMAIN", `${source}: invalid reviewed field bounds`);
  inputKey(contract.metadata.reference, source);
  validateDomain(contract.metadata.fields, contract.metadata.reference, source);
  jsonMetadata(contract.metadata, source);
  rejectionDeclarations(contract, source);
  const copy = owned(contract);
  if (!source || !Array.isArray(copy.inputs) || !copy.inputs.length)
    fail("COMPOSITION_CONTRACT", `${source}: reviewed inputs required`);
  const keys = new Set<string>();
  for (const row of copy.inputs) {
    const id = inputKey(row.values, source);
    if (keys.has(id)) fail("COMPOSITION_CONTRACT", `${source}: duplicate reviewed input ${id}`);
    keys.add(id);
    if (successful(row.expected)) {
      validateDomain(copy.metadata.fields, row.values, source);
      if (row.expected.kind === "body") {
        if (!validHash(row.expected.sha256)) fail("COMPOSITION_CONTRACT", `${source}: body hash required`);
        if (row.expected.codec !== undefined && row.expected.codec !== "content-hash-v1" && row.expected.codec !== "json-stringify-sha256-v1")
          fail("COMPOSITION_CODEC", `${source}: unsupported body codec`);
      }
    } else if (row.expected.kind !== "reject" || typeof row.expected.name !== "string" || !row.expected.name || typeof row.expected.message !== "string" || !row.expected.message || row.expected.code !== undefined && typeof row.expected.code !== "string")
      fail("COMPOSITION_CONTRACT", `${source}: exact rejection required`);
  }
  const groups = copy.groups === undefined ? [] : copy.groups;
  if (!Array.isArray(groups)) fail("COMPOSITION_GROUP", `${source}: groups must be an explicit array`);
  const groupIds = new Set<string>(), members = new Set<string>();
  for (const group of groups) {
    if (!group || typeof group.id !== "string" || !group.id || groupIds.has(group.id)) fail("COMPOSITION_GROUP", `${source}: unique group ID required`);
    groupIds.add(group.id);
    if (group.codec !== "json-ordered-values-body-v1") fail("COMPOSITION_CODEC", `${source}: unsupported group codec`);
    if (!validHash(group.sha256) || !Array.isArray(group.orderedInputs) || !group.orderedInputs.length)
      fail("COMPOSITION_GROUP", `${source}: ordered members and fixed group hash required`);
    const ordered: string[] = [];
    for (const values of group.orderedInputs) {
      const id = inputKey(values, source);
      validateDomain(copy.metadata.fields, values, source);
      if (members.has(id)) fail("COMPOSITION_GROUP", `${source}: duplicate/two-group member ${id}`);
      members.add(id); ordered.push(id);
      const row = copy.inputs.find(row => key(row.values) === id);
      if (!row || row.expected.kind !== "group-member" || row.expected.groupId !== group.id)
        fail("COMPOSITION_GROUP", `${source}: missing/extra/rejected group member ${id}`);
    }
    const declaredOrder = copy.inputs.filter(row => row.expected.kind === "group-member" && row.expected.groupId === group.id).map(row => key(row.values));
    if (JSON.stringify(ordered) !== JSON.stringify(declaredOrder))
      fail("COMPOSITION_GROUP", `${source}: group member order/coverage changed`);
  }
  for (const row of copy.inputs) if (row.expected.kind === "group-member" && (!groupIds.has(row.expected.groupId) || !members.has(key(row.values))))
    fail("COMPOSITION_GROUP", `${source}: unassigned group member ${key(row.values)}`);
  if (!copy.inputs.some(row => successful(row.expected) && key(row.values) === key(copy.metadata.reference)))
    fail("COMPOSITION_CONTRACT", `${source}: successful reviewed reference required`);
  return copy;
}
function sameRejection(error: unknown, expected: Extract<ReviewedInput["expected"], { kind: "reject" }>) {
  if (!(error instanceof Error)) return false;
  const name = dataDescriptor(error, "name"), message = dataDescriptor(error, "message");
  const actualCode = rejectionCode(error), expectedCode = rejectionCode(expected, true);
  // Preserve default Error.prototype.name and inherited data values for these
  // two existing fields; only code gets the reviewed own/absent shape rule.
  return name && "value" in name && name.value === expected.name &&
    message && "value" in message && message.value === expected.message &&
    actualCode && expectedCode && actualCode.own === expectedCode.own &&
    (!actualCode.own || expectedCode.own && actualCode.value === expectedCode.value);
}
type ReviewedRejection = Extract<ReviewedInput["expected"], { kind: "reject" }>;
function rejectionError(rejected: ReviewedRejection): Error {
  const error = new Error(rejected.message);
  error.name = rejected.name;
  if (Object.hasOwn(rejected, "code")) Object.defineProperty(error, "code", { value: rejected.code, enumerable: true });
  return Object.freeze(error);
}
type Checked = { definition: ImmutableDefinition; bodies: ReadonlyMap<string, GeneratedBody>; rejections: ReadonlyMap<string, ReviewedRejection> };
async function checkDefinition(definition: GenerationDefinition, contract: DefinitionContract, allowUnreviewedNative: boolean): Promise<Checked> {
  const source = contract.metadata.source;
  if (definition.source !== source) fail("COMPOSITION_SOURCE", `${source}: factory returned ${definition.source}`);
  const actual = metadata(definition);
  if (await contentHash(actual) !== await contentHash(contract.metadata))
    fail("COMPOSITION_METADATA", `${source}: reviewed metadata changed`);
  const build = definition.build, bodies = new Map<string, GeneratedBody>();
  const rejections = new Map<string, ReviewedRejection>();
  for (const row of contract.inputs) {
    let body: GeneratedBody | undefined, error: unknown, threw = false;
    try { body = build([...row.values]); } catch (caught) { threw = true; error = caught; }
    if (threw && error instanceof CompositionError) throw error;
    if (row.expected.kind === "reject") {
      if (!threw || !sameRejection(error, row.expected)) fail("COMPOSITION_REJECTION", `${source}: rejection changed at ${key(row.values)}`);
      rejections.set(key(row.values), row.expected);
    } else {
      if (threw) fail("COMPOSITION_BODY", `${source}: unexpected rejection at ${key(row.values)}`);
      if (!body || typeof body !== "object" || body instanceof Promise)
        fail("COMPOSITION_BODY", `${source}: reviewed body changed at ${key(row.values)}`);
      const snapshot = owned(body);
      if (row.expected.kind === "body") {
        const hash = row.expected.codec === "json-stringify-sha256-v1" ? await sha256(JSON.stringify(snapshot)) : await contentHash(snapshot);
        if (hash !== row.expected.sha256) fail("COMPOSITION_BODY", `${source}: reviewed body changed at ${key(row.values)}`);
      }
      bodies.set(key(row.values), snapshot);
    }
  }
  // No per-case digest is invented for a legacy group. The original ordered
  // {values,body} serialization and its single reviewed digest are authoritative.
  for (const group of contract.groups ?? []) {
    const members = group.orderedInputs.map(values => ({ values: [...values], body: bodies.get(key(values))! }));
    if (await sha256(JSON.stringify(members)) !== group.sha256)
      fail("COMPOSITION_GROUP", `${source}: reviewed group changed ${group.id}`);
  }
  // Own the metadata and each returned body; never freeze the caller's definition.
  // Reviewed successful inputs use validated snapshots. Other native inputs still
  // execute trusted build code: arbitrary mutable closures cannot be frozen here.
  const result = freezeOwned({ ...structuredClone(actual), build: (values: number[]): GeneratedBody => {
    inputKey(values, source);
    const id = key(values), cached = bodies.get(id), rejected = rejections.get(id);
    if (cached) return owned(cached);
    if (rejected) throw rejectionError(rejected);
    if (!allowUnreviewedNative) fail("COMPOSITION_UNREVIEWED_INPUT", `${source}: adapter input not reviewed ${id}`);
    validateDomain(actual.fields, values, source);
    return owned(build([...values]));
  } });
  return { definition: result, bodies, rejections };
}

/** Pure, local composition. No registry singleton, implicit fallback, module
 * imports from data, or Cartesian-domain enumeration. Contract coverage is the
 * explicit reviewed finite input set, not a claim about every native input.
 * Adapter create may inspect metadata only; canonical builds must be lazy so
 * input-specific reads can be checked. Precomputing legacy factories require a
 * separately reviewed integration adapter; this API does not silently admit them. */
export async function composeGenerationDefinitions(input: {
  native: readonly NativeDefinition[];
  adapters: readonly AdapterNode[];
}): Promise<readonly ImmutableDefinition[]> {
  const natives = input.native.map(node => ({ definition: { ...metadata(node.definition), build: node.definition.build }, contract: snapshotContract(node.contract) }));
  const adapters = input.adapters.map(node => ({ ...node, dependencies: owned(node.dependencies), dependencyInputs: owned(node.dependencyInputs), contract: snapshotContract(node.contract) }));
  const declared = new Set<string>();
  const declare = (source: string) => {
    if (!source || declared.has(source)) fail("COMPOSITION_DUPLICATE", `duplicate source ${source}`);
    declared.add(source);
  };
  natives.forEach(node => declare(node.contract.metadata.source));
  adapters.forEach(node => {
    declare(node.source);
    if (node.source !== node.contract.metadata.source) fail("COMPOSITION_SOURCE", `${node.source}: contract source mismatch`);
    if (!node.dependencies.length || new Set(node.dependencies).size !== node.dependencies.length)
      fail("COMPOSITION_DEPENDENCY", `${node.source}: unique explicit dependencies required`);
  });
  for (const node of adapters) for (const dep of node.dependencies)
    if (!declared.has(dep)) fail("COMPOSITION_MISSING", `${node.source}: missing ${dep}`);
  // Reject the entire invalid graph before invoking any factory or build.
  const ready = new Set(natives.map(node => node.contract.metadata.source));
  let pending = [...adapters].sort((a, b) => compare(a.source, b.source));
  const ordered: typeof adapters = [];
  while (pending.length) {
    const layer = pending.filter(node => node.dependencies.every(source => ready.has(source)));
    if (!layer.length) fail("COMPOSITION_CYCLE", pending.map(node => node.source).join(","));
    ordered.push(...layer); layer.forEach(node => ready.add(node.source));
    pending = pending.filter(node => !ready.has(node.source));
  }
  const checked = new Map<string, Checked>();
  for (const node of [...natives].sort((a, b) => compare(a.contract.metadata.source, b.contract.metadata.source)))
    checked.set(node.contract.metadata.source, await checkDefinition(node.definition, node.contract, true));
  for (const node of ordered) {
    const maps = new Map<string, Set<string>>(), usedDependencies = new Set<string>();
    for (const row of node.dependencyInputs) {
      const id = inputKey(row.values, node.source);
      const reviewed = node.contract.inputs.find(input => key(input.values) === id);
      if (maps.has(id) || !reviewed) fail("COMPOSITION_INPUT_MAP", `${node.source}: unexpected/duplicate input map ${id}`);
      if (successful(reviewed.expected) && !row.reads.length) fail("COMPOSITION_INPUT_MAP", `${node.source}: empty successful dependency map`);
      const readKeys = new Set<string>();
      maps.set(id, readKeys);
      for (const read of row.reads) {
        if (!node.dependencies.includes(read.source)) fail("COMPOSITION_UNDECLARED", `${node.source}: undeclared ${read.source}`);
        const values = inputKey(read.values, read.source), readId = `${read.source}:${values}`;
        validateDomain(checked.get(read.source)!.definition.fields, read.values, read.source);
        if (readKeys.has(readId)) fail("COMPOSITION_INPUT_MAP", `${node.source}: duplicate dependency read`);
        readKeys.add(readId);
        const canonical = checked.get(read.source)!;
        if (!canonical.bodies.has(values) && !canonical.rejections.has(values)) fail("COMPOSITION_INPUT_MAP", `${node.source}: canonical input not reviewed ${readId}`);
        usedDependencies.add(read.source);
      }
    }
    if (maps.size !== node.contract.inputs.length || usedDependencies.size !== node.dependencies.length)
      fail("COMPOSITION_INPUT_MAP", `${node.source}: reviewed dependency coverage incomplete`);
    let dependencyViolation: CompositionError | undefined;
    const deny = (errorCode: string, detail: string): never => {
      dependencyViolation ??= new CompositionError(errorCode, detail);
      throw dependencyViolation;
    };
    let activeReads: Set<string> | undefined;
    let activeRejections: ReviewedRejection[] | undefined;
    const views = new Map<string, ImmutableDefinition>();
    for (const source of node.dependencies) {
      const dependency = checked.get(source)!;
      views.set(source, freezeOwned({ ...structuredCloneMetadata(dependency.definition), build: (values: number[]) => {
        if (!activeReads) deny("COMPOSITION_CREATE_READ", `${node.source}: create may read metadata only`);
        let input: string;
        try {
          input = inputKey(values, source);
          validateDomain(dependency.definition.fields, values, source);
        } catch (error) {
          if (error instanceof CompositionError) deny(error.code, error.message);
          throw error;
        }
        const id = `${source}:${input}`;
        if (!activeReads!.delete(id)) deny("COMPOSITION_INPUT_MAP", `${node.source}: wrong/extra canonical read ${id}`);
        const rejected = dependency.rejections.get(input);
        if (rejected) {
          // Consuming a known rejection is a real dependency read. Its exact
          // outcome must survive catches, including fallback bodies that would
          // otherwise satisfy the adapter's separately declared expectation.
          activeRejections!.push(rejected);
          throw rejectionError(rejected);
        }
        const body = dependency.bodies.get(input);
        if (!body) deny("COMPOSITION_INPUT_MAP", `${node.source}: canonical input not reviewed ${id}`);
        return owned(body!);
      } }));
    }
    const dependencies = Object.freeze({ get(source: string): ImmutableDefinition {
      const dependency = views.get(source);
      return dependency ?? deny("COMPOSITION_UNDECLARED", `${node.source}: undeclared lookup ${source}`);
    } });
    const definition = await node.create(dependencies);
    if (dependencyViolation) throw dependencyViolation;
    const adapterBuild = definition.build;
    const traced = { ...metadata(definition), build: (values: number[]) => {
      const expected = maps.get(inputKey(values, node.source));
      if (!expected) deny("COMPOSITION_UNREVIEWED_INPUT", `${node.source}: adapter input not reviewed`);
      activeReads = new Set(expected);
      activeRejections = [];
      let body: GeneratedBody | undefined, error: unknown, threw = false;
      try { body = adapterBuild([...values]); } catch (caught) { threw = true; error = caught; }
      const missing = [...activeReads], rejected = activeRejections;
      activeReads = undefined; activeRejections = undefined;
      if (dependencyViolation) throw dependencyViolation;
      if (missing.length) deny("COMPOSITION_INPUT_MAP", `${node.source}: unused canonical reads ${missing.join(",")}`);
      if (rejected.some(expected => !threw || !sameRejection(error, expected)))
        deny("COMPOSITION_REJECTION", `${node.source}: canonical rejection must propagate unchanged`);
      if (threw) throw error;
      return body!;
    } };
    const verified = await checkDefinition(traced, node.contract, false);
    if (dependencyViolation) throw dependencyViolation;
    checked.set(node.source, verified);
  }
  return Object.freeze([...checked.values()].map(node => node.definition).sort((a, b) => compare(a.source, b.source)));
}
function structuredCloneMetadata(definition: ImmutableDefinition) {
  const { build: _build, ...rest } = definition;
  return structuredClone(rest);
}
