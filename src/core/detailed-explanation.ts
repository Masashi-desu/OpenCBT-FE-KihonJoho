import type { Attribution, Bundle, DetailedExplanationRef, DetailParameters, Question, Run, SourceRef } from "./types";
import { labels } from "./types";
import { sha256 } from "./hash";
import { schema } from "./validation";

export type DetailPresentation = {
  id: string;
  title: string;
  attribution: Attribution;
  modificationSummary?: string;
};
export type DetailManifest = {
  apiVersion: 1;
  revision: number;
  title: string;
  search?: { summary: string; keywords: string[]; text: string };
  attribution: Attribution;
  presentations?: DetailPresentation[];
  references?: { title: string; sourceRefs: SourceRef[] };
  files: { path: string; mediaType: string; sha256: string }[];
};
export type DetailPackage = {
  manifest: DetailManifest;
  files: Record<string, { mediaType: string; bytes: Uint8Array }>;
};
export type DetailRoute = {
  sessionId: string;
  entryIndex: number;
  from: "exam" | "review";
  initialParameters: DetailParameters;
};
export const DETAIL_TIMEOUT_MS = 8000;
const fileLimit = 2 * 1024 * 1024;
const totalLimit = 8 * 1024 * 1024;
const mediaTypes: Record<string, string> = {
  html: "text/html", css: "text/css", js: "text/javascript", png: "image/png",
  jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", woff2: "font/woff2",
};

export function validDetailParameters(value: unknown): value is DetailParameters {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    Object.keys(value).length <= 32 && Object.entries(value).every(([key, v]) =>
      /^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(key) &&
      ((typeof v === "string" && [...v].length <= 200) || typeof v === "boolean" ||
        (typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 1e12)));
}

export function detailRouteHash(route: DetailRoute): string {
  return `#/detail/${encodeURIComponent(route.sessionId)}/${route.entryIndex}/${route.from}` +
    (Object.keys(route.initialParameters).length
      ? `?initial=${encodeURIComponent(JSON.stringify(route.initialParameters))}` : "");
}

export function parseDetailRoute(hash: string): DetailRoute | undefined {
  try {
    const [path, query = ""] = hash.split("?");
    const match = /^#\/detail\/([^/]+)\/(0|[1-9]\d*)\/(exam|review)$/.exec(path);
    if (!match || query.length > 16000) return;
    const sessionId = decodeURIComponent(match[1]), entryIndex = Number(match[2]);
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(sessionId) || !Number.isSafeInteger(entryIndex)) return;
    const initialParameters: unknown = JSON.parse(new URLSearchParams(query).get("initial") ?? "{}");
    if (!validDetailParameters(initialParameters)) return;
    return { sessionId, entryIndex, from: match[3] as DetailRoute["from"], initialParameters };
  } catch { return; }
}

export function canOpenDetail(run: Run, index: number, from: DetailRoute["from"]): boolean {
  const q = run.issued[index], entry = run.session.entries[index];
  return Boolean(q?.detailedExplanationRef && entry &&
    (from === "review" ? run.result && run.session.status !== "invalidated" :
      run.exam.mode === "study" && index === run.session.currentIndex && entry.revealed && !run.result));
}

/** Read-only copy of the issued content; never call the generator for explanation navigation. */
export function detailContext(run: Run, route: DetailRoute, theme: "light" | "dark") {
  if (route.sessionId !== run.session.id || !canOpenDetail(run, route.entryIndex, route.from))
    throw Error("詳細解説を開ける問題ではありません");
  const question = run.issued[route.entryIndex], entry = run.session.entries[route.entryIndex];
  const instance = run.instances.find((i) => i.id === entry.generatedInstanceId);
  return structuredClone({
    apiVersion: 1 as const,
    question,
    choiceOrder: entry.choiceOrder.map((id, index) => ({ id, label: labels[index] ?? String(index + 1) })),
    ...(question.answerParts ? {
      selectedPartChoices: { ...entry.selectedPartChoices },
      partChoiceOrders: question.answerParts.map(part => ({ partId: part.id,
        choiceOrder: entry.choiceOrder.filter(id => part.choiceIds.includes(id)).map((id, index) => ({ id, label: labels[index] ?? String(index + 1) })),
      })),
    } : {}),
    selectedChoiceId: entry.selectedChoiceId ?? null,
    initialParameters: { ...question.detailedExplanationRef?.initialParameters, ...route.initialParameters },
    generation: instance ? {
      templateRef: instance.templateRef, baseQuestionRef: instance.baseQuestionRef,
      generatorRef: instance.generatorRef, parameters: instance.parameters,
    } : null,
    theme,
  });
}
export type DetailContext = ReturnType<typeof detailContext>;

/** Read-only browsing from search; no issued run, answers or generator invocation. */
export function questionDetailContext(question: Question, theme: "light" | "dark"): DetailContext {
  return structuredClone({
    apiVersion: 1 as const, question,
    choiceOrder: question.choices.map((choice, i) => ({ id: choice.id, label: labels[i] ?? String(i + 1) })),
    ...(question.answerParts ? {
      selectedPartChoices: {}, partChoiceOrders: question.answerParts.map(part => ({ partId: part.id,
        choiceOrder: question.choices.filter(c => part.choiceIds.includes(c.id)).map((c, i) => ({ id: c.id, label: labels[i] ?? String(i + 1) })),
      })),
    } : {}),
    selectedChoiceId: null, initialParameters: question.detailedExplanationRef?.initialParameters ?? {},
    generation: null, theme,
  });
}

export function validateDetailManifest(value: unknown): asserts value is DetailManifest {
  schema("detailed_explanation", value);
  const manifest = value as DetailManifest;
  if (manifest.presentations && new Set(manifest.presentations.map(p => p.id)).size !== manifest.presentations.length)
    throw Error("詳細解説の表示識別子が重複しています");
  if (new Set(manifest.files.map((f) => f.path)).size !== manifest.files.length ||
    !manifest.files.some((f) => f.path === "index.html" && f.mediaType === "text/html") ||
    manifest.files.some((f) => mediaTypes[f.path.split(".").at(-1)!] !== f.mediaType))
    throw Error("詳細解説のファイル一覧が不正です");
}

export function validateDetailAttribution(manifest: DetailManifest, bundle: Bundle) {
  for (const presentation of manifest.presentations ?? [])
    validateDetailAttribution({ ...manifest, attribution: presentation.attribution, presentations: undefined }, bundle);
  const attr = manifest.attribution;
  if (manifest.references?.sourceRefs.some((ref) => !bundle.sources.some((source) =>
    source.id === ref.sourceId && source.availability === "officially_published")))
    throw Error("詳細解説の参考資料が不正です");
  if ((attr.origin !== "original" && !attr.sourceRefs.length) ||
    attr.sourceRefs.some((ref) => !bundle.sources.some((source) => source.id === ref.sourceId &&
      (attr.origin === "original" || source.availability === "officially_published"))) ||
    attr.creatorIds.some((id) => !bundle.catalog.actors.some((actor) => actor.id === id)))
    throw Error("詳細解説の出典・作成主体が不正です");
  const rights = (ids: string[], trail = new Set<string>()) => {
    for (const id of ids) {
      const right = bundle.rights.find((r) => r.id === id);
      if (!right || trail.has(id) || right.uses.browserDisplay !== "allowed" ||
        right.uses.repositoryRedistribution !== "allowed" ||
        (attr.origin === "adapted" && right.uses.adaptation !== "allowed") ||
        right.thirdParty.status === "unresolved") throw Error("詳細解説の素材条件が不正です");
      rights(right.thirdParty.rightsRefs, new Set([...trail, id]));
    }
  };
  rights(attr.rightsRefs);
}

async function readBytes(url: URL, max: number, signal: AbortSignal, fetcher: typeof fetch) {
  const response = await fetcher(url, {
    signal, cache: "no-cache", credentials: "omit", redirect: "error", referrerPolicy: "no-referrer",
  });
  if (!response.ok || Number(response.headers.get("content-length")) > max) throw Error("詳細解説を取得できません");
  const reader = response.body?.getReader();
  if (!reader) throw Error("詳細解説を取得できません");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) { await reader.cancel(); throw Error("詳細解説のサイズが上限を超えています"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

/** Optional resources are deliberately outside the session/catalog's required assets. */
export async function loadDetailPackage(
  ref: DetailedExplanationRef | undefined, appBase: URL, signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<DetailPackage | undefined> {
  if (!ref || !/^explanations\/[a-z][a-z0-9-]{2,79}\/$/.test(ref.directory)) return;
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(cancel, DETAIL_TIMEOUT_MS);
  try {
    const directory = new URL(ref.directory, appBase);
    const manifest: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(
      await readBytes(new URL("manifest.json", directory), 65536, controller.signal, fetcher)));
    validateDetailManifest(manifest);
    if (manifest.revision !== ref.revision) return;
    const files: DetailPackage["files"] = {};
    let total = 0;
    // Sequential, bounded reads keep the aggregate memory limit effective.
    for (const file of manifest.files) {
      const bytes = await readBytes(new URL(file.path, directory), Math.min(fileLimit, totalLimit - total), controller.signal, fetcher);
      if (await sha256(bytes) !== file.sha256) return;
      total += bytes.length;
      files[file.path] = { mediaType: file.mediaType, bytes };
    }
    return { manifest, files };
  } catch { return; }
  finally { clearTimeout(timer); signal?.removeEventListener("abort", cancel); }
}

export function detailMessage(event: Pick<MessageEvent, "source" | "origin" | "data">,
  source: Window | null, token: string): "ready" | "error" | { type: "resize"; height: number } | { type: "presentation"; id: string } | undefined {
  if (!source || event.source !== source || event.origin !== "null" ||
    event.data?.apiVersion !== 1 || event.data?.token !== token) return;
  if (event.data.type === "opencbt:detail:presentation" && typeof event.data.id === "string" && /^[a-z0-9][a-z0-9-]{0,79}$/.test(event.data.id))
    return { type: "presentation", id: event.data.id };
  if (event.data.type === "opencbt:detail:ready") return "ready";
  if (event.data.type === "opencbt:detail:error") return "error";
  if (event.data.type === "opencbt:detail:resize" && Number.isSafeInteger(event.data.height) && event.data.height > 0)
    return { type: "resize", height: event.data.height };
}

/** The sandbox selects a declared view; it cannot supply arbitrary rights or source data. */
export function detailPresentation(manifest: DetailManifest, id?: string): DetailPresentation | undefined {
  return manifest.presentations ? manifest.presentations.find(p => p.id === id)
    : { id: "default", title: manifest.title, attribution: manifest.attribution };
}
