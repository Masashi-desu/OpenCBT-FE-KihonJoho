import type { Bundle, Question, Subject } from "./types";
import { areas } from "./types";
import { questionStudyTerms, studyBlockText } from "./study-terms";
import { loadDetailPackage, validateDetailAttribution, type DetailManifest } from "./detailed-explanation";

export type SearchKind = "all" | "question" | "detail";
export type SearchRoute = {
  view: "results" | "question" | "detail";
  questionId?: string;
  query: string;
  subject: "all" | Subject;
  year: "all" | number;
  kind: SearchKind;
  page: number;
};
export const emptySearch: SearchRoute = { view: "results", query: "", subject: "all", year: "all", kind: "all", page: 1 };
export const SEARCH_PAGE_SIZE = 20;
export type SearchDocument = {
  id: string;
  kind: "question" | "detail";
  question: Question;
  title: string;
  summary: string;
  body: string;
  keywords: string[];
  year?: number;
  manifest?: DetailManifest;
};

export function normalizeSearch(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/\s+/g, " ").trim();
}
export function searchRouteHash(route: SearchRoute) {
  const query = new URLSearchParams();
  if (route.query) query.set("q", route.query);
  if (route.subject !== "all") query.set("subject", route.subject);
  if (route.year !== "all") query.set("year", String(route.year));
  if (route.kind !== "all") query.set("type", route.kind);
  if (route.page > 1) query.set("page", String(route.page));
  const path = route.view === "results" ? "#/search" : `#/search/${route.view}/${encodeURIComponent(route.questionId ?? "")}`;
  return path + (query.size ? `?${query}` : "");
}
export function parseSearchRoute(hash: string): SearchRoute | undefined {
  try {
    const [path, raw = ""] = hash.split("?");
    const match = /^#\/search(?:\/(question|detail)\/([^/]+))?$/.exec(path);
    if (!match || raw.length > 4096) return;
    const questionId = match[2] ? decodeURIComponent(match[2]) : undefined;
    if (questionId && !/^[a-zA-Z0-9-]{1,100}$/.test(questionId)) return;
    const query = new URLSearchParams(raw), text = query.get("q") ?? "";
    if ([...text].length > 200) return;
    const subject = query.get("subject"), year = Number(query.get("year")), kind = query.get("type"), page = Number(query.get("page"));
    return { view: (match[1] ?? "results") as SearchRoute["view"], questionId, query: text,
      subject: subject === "A" || subject === "B" ? subject : "all",
      year: Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : "all",
      kind: kind === "question" || kind === "detail" ? kind : "all",
      page: Number.isSafeInteger(page) && page > 0 && page <= 1000 ? page : 1 };
  } catch { return; }
}

export function searchableQuestions(bundle: Bundle) {
  // Unbound generator definitions are not a second copy of the published problem.
  const bases = new Set(bundle.templates.map(template => template.baseQuestionRef.questionId));
  return bundle.questions.filter(question => question.lifecycle === "active" && question.distribution === "included" && !bases.has(question.id))
    .sort((a, b) => (questionYear(b) ?? 0) - (questionYear(a) ?? 0) || a.subject.localeCompare(b.subject) ||
      Number(a.origin.sourceRefs[0]?.locator.questionNumber ?? 0) - Number(b.origin.sourceRefs[0]?.locator.questionNumber ?? 0) || a.id.localeCompare(b.id));
}
const questionYear = (question: Question) => question.origin.sourceRefs.find(ref => ref.locator.year)?.locator.year;
export function searchQuestionTitle(question: Question) {
  const ref = question.origin.sourceRefs.find(ref => ref.locator.year && ref.locator.questionNumber);
  return ref ? `${ref.locator.year}年度 科目${question.subject} 問${ref.locator.questionNumber}` : `科目${question.subject} · ${question.learning.topics?.[0] ?? "独自問題"}`;
}
function learningWords(question: Question) {
  return [areas[question.learning.area] ?? question.learning.area, ...question.learning.tags, ...question.learning.topics ?? [], ...question.learning.keywords ?? []];
}
export function questionSearchDocuments(bundle: Bundle): SearchDocument[] {
  return searchableQuestions(bundle).map(question => {
    const contexts = question.contextRefs.map(id => question.contexts.find(context => context.id === id)!);
    const contents = [...contexts.map(context => context.content), question.prompt, ...question.choices.map(choice => choice.content), question.explanation];
    const text = contents.flatMap(content => content.blocks.map(block => studyBlockText(block, bundle.assets))).join("\n");
    const terms = questionStudyTerms(question, bundle.assets).map(term => [term.term, term.expansion, term.meaning].filter(Boolean).join(" "));
    const excerptBlocks = question.prompt.blocks.filter(block => block.type !== "image");
    return { id: `question:${question.id}`, kind: "question", question, title: searchQuestionTitle(question),
      summary: (excerptBlocks.length ? excerptBlocks : question.prompt.blocks).map(block => studyBlockText(block, bundle.assets)).join("\n"),
      body: [...contexts.map(context => context.title), text, ...terms].join("\n"), keywords: learningWords(question), year: questionYear(question) };
  });
}

/** Only complete, verified optional packages become searchable. Never run their JS. */
export async function detailSearchDocuments(bundle: Bundle, base: URL, signal?: AbortSignal, fetcher: typeof fetch = fetch): Promise<SearchDocument[]> {
  const owners = new Map<string, Question>();
  for (const question of searchableQuestions(bundle)) {
    const ref = question.detailedExplanationRef;
    if (ref) {
      // One managed lesson can open different reviewed diagrams for each source.
      const initial = ref.initialParameters ? JSON.stringify(Object.entries(ref.initialParameters).sort(([a], [b]) => a.localeCompare(b))) : "";
      const key = `${ref.directory}:${ref.revision}${initial ? `:${initial}` : ""}`;
      owners.set(key, owners.get(key) ?? question);
    }
  }
  const jobs = [...owners.entries()], result: SearchDocument[] = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, async () => {
    while (next < jobs.length && !signal?.aborted) {
      const [key, question] = jobs[next++];
      const pkg = await loadDetailPackage(question.detailedExplanationRef, base, signal, fetcher);
      if (!pkg || signal?.aborted) continue;
      try {
        validateDetailAttribution(pkg.manifest, bundle);
        const { manifest } = pkg;
        result.push({ id: `detail:${key}`, kind: "detail", question, manifest, title: manifest.title,
          summary: manifest.search?.summary ?? `${searchQuestionTitle(question)}の詳細解説`,
          body: manifest.search?.text ?? "", keywords: [...learningWords(question), ...manifest.search?.keywords ?? []], year: questionYear(question) });
      } catch { /* An unavailable optional explanation does not hide its question. */ }
    }
  }));
  return result.sort((a, b) => a.title.localeCompare(b.title, "ja") || a.id.localeCompare(b.id));
}

export function findSearchDocuments(documents: readonly SearchDocument[], route: SearchRoute): SearchDocument[] {
  const terms = normalizeSearch(route.query).split(" ").filter(Boolean);
  return documents.flatMap(document => {
    if ((route.kind !== "all" && document.kind !== route.kind) ||
      (route.subject !== "all" && document.question.subject !== route.subject) ||
      (route.year !== "all" && document.year !== route.year)) return [];
    const title = normalizeSearch(document.title), keywords = normalizeSearch(document.keywords.join(" "));
    const searchable = normalizeSearch([document.title, document.summary, document.body, ...document.keywords].join("\n"));
    if (!terms.every(term => searchable.includes(term))) return [];
    const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 4 : keywords.includes(term) ? 2 : 1), 0);
    return [{ document, score }];
  }).sort((a, b) => b.score - a.score || (b.document.year ?? 0) - (a.document.year ?? 0) ||
    a.document.question.subject.localeCompare(b.document.question.subject) ||
    Number(a.document.question.origin.sourceRefs[0]?.locator.questionNumber ?? 0) - Number(b.document.question.origin.sourceRefs[0]?.locator.questionNumber ?? 0) ||
    a.document.id.localeCompare(b.document.id)).map(item => item.document);
}

export function searchSnippet(document: SearchDocument, query: string) {
  const terms = normalizeSearch(query).split(" ").filter(Boolean);
  const fields = [document.summary, document.body].filter(Boolean);
  const selected = fields.find(field => terms.some(term => normalizeSearch(field).includes(term))) ?? fields[0] ?? document.title;
  const text = selected.replace(/\s+/g, " ").trim();
  const at = terms.map(term => text.toLocaleLowerCase("ja-JP").indexOf(term)).find(index => index >= 0) ?? 0;
  const start = Math.max(0, at - 35), end = start + 160;
  return `${start ? "…" : ""}${text.slice(start, end)}${text.length > end ? "…" : ""}`;
}
