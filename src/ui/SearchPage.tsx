import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, LoaderCircle, Play, Search } from "lucide-react";
import type { Bundle, Question } from "../core/types";
import { areas, labels } from "../core/types";
import {
  SEARCH_PAGE_SIZE, detailSearchDocuments, emptySearch, findSearchDocuments, questionSearchDocuments,
  searchQuestionTitle, searchRouteHash, searchSnippet, type SearchDocument, type SearchRoute,
} from "../core/search";
import { questionDetailContext } from "../core/detailed-explanation";
import { loadAsset } from "../core/catalog";
import { safeUrl } from "../core/validation";
import { AttributionLine, Content } from "./Content";
import { DetailViewer, explanationBase, useDetailedExplanation } from "./DetailedExplanation";
import { Dialog } from "./Dialog";
import { QuestionFooter } from "./QuestionFooter";
import { StudyTerms } from "./StudyTerms";
import { ensureMath } from "./math";
import type { Theme } from "./theme";

type Navigate = (route: SearchRoute, replace?: boolean) => void;

export function SearchPage({ bundle, route, theme, onNavigate, onLicenses, onPractice, practiceDisabled, notifications }: {
  bundle: Bundle; route: SearchRoute; theme: Theme; onNavigate: Navigate; onLicenses: () => void;
  onPractice: (question: Question) => void; practiceDisabled: boolean; notifications?: ReactNode;
}) {
  const questions = useMemo(() => questionSearchDocuments(bundle), [bundle]);
  const [details, setDetails] = useState<SearchDocument[]>([]), [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(route.query);
  const heading = useRef<HTMLHeadingElement>(null), lastResult = useRef<string | undefined>(undefined);
  const unavailableDetails = useRef(new Set<string>());
  useEffect(() => { setDraft(route.query); }, [route.query]);
  useEffect(() => {
    const controller = new AbortController();
    unavailableDetails.current.clear();
    setDetails([]); setLoading(true);
    void detailSearchDocuments(bundle, explanationBase(), controller.signal).then(documents => {
      if (!controller.signal.aborted) { setDetails(documents.filter(document => !unavailableDetails.current.has(document.id))); setLoading(false); }
    });
    return () => controller.abort();
  }, [bundle]);
  useEffect(() => {
    if (route.view !== "results") { heading.current?.focus({ preventScroll: true }); return; }
    const id = lastResult.current;
    if (id) requestAnimationFrame(() => document.getElementById(id)?.focus());
    else heading.current?.focus({ preventScroll: true });
  }, [route.view, route.questionId]);
  const documents = useMemo(() => [...questions, ...details], [questions, details]);
  const matches = useMemo(() => findSearchDocuments(documents, route), [documents, route]);
  const pages = Math.max(1, Math.ceil(matches.length / SEARCH_PAGE_SIZE)), page = Math.min(route.page, pages);
  const visible = matches.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE);
  const years = [...new Set(questions.flatMap(document => document.year ? [document.year] : []))].sort((a, b) => b - a);
  const filter = (values: Partial<SearchRoute>) => onNavigate({ ...route, query: draft.trim(), ...values, view: "results", questionId: undefined, page: 1 }, true);
  const open = (document: SearchDocument, view = document.kind) => {
    lastResult.current = `search-result-${document.id}`;
    onNavigate({ ...route, view, questionId: document.question.id });
  };
  const question = questions.find(document => document.question.id === route.questionId)?.question;

  if (route.view !== "results") return question ? (
    <SearchQuestion key={question.id} question={question} bundle={bundle} route={route} theme={theme}
      notifications={notifications} onNavigate={onNavigate} onLicenses={onLicenses} onPractice={onPractice} practiceDisabled={practiceDisabled} onDetailUnavailable={() => {
        const ref = question.detailedExplanationRef;
        if (ref) unavailableDetails.current.add(`detail:${ref.directory}:${ref.revision}`);
        setDetails(documents => documents.filter(document => !unavailableDetails.current.has(document.id)));
      }} />
  ) : (
    <section className="empty-state">
      <h1 ref={heading} tabIndex={-1}>この問題は利用できません</h1>
      <p>公開中の問題から検索し直してください。</p>
      <button onClick={() => onNavigate({ ...route, view: "results", questionId: undefined }, true)}>検索結果へ戻る</button>
    </section>
  );

  return <section className="search-page" aria-labelledby="search-heading">
    <div className="eyebrow">FIND YOUR NEXT TOPIC</div>
    <h1 id="search-heading" ref={heading} tabIndex={-1}>検索</h1>
    <p className="page-intro">公開問題と詳細解説を、用語や問題文から探せます。スペースで区切ると、すべての語を含む内容を検索します。</p>
    <form className="search-form" role="search" onSubmit={event => { event.preventDefault(); filter({ query: draft.trim() }); }}>
      <label htmlFor="search-query">キーワード</label>
      <div className="search-input-row">
        <input id="search-query" type="search" value={draft} maxLength={200} placeholder="例：ソート、CPU、クラウド" autoComplete="off"
          onChange={event => setDraft(event.target.value)} />
        <button className="primary" type="submit"><Search size={18} />検索</button>
      </div>
      <div className="search-filters">
        <div className="search-kinds" role="group" aria-label="検索する対象">
          {([ ["all", "すべて"], ["question", "問題"], ["detail", "詳細解説"] ] as const).map(([kind, label]) =>
            <button key={kind} type="button" aria-pressed={route.kind === kind} onClick={() => filter({ kind })}>{label}</button>)}
        </div>
        <label>科目<select value={route.subject} onChange={event => filter({ subject: event.target.value as SearchRoute["subject"] })}>
          <option value="all">すべての科目</option><option value="A">科目A</option><option value="B">科目B</option>
        </select></label>
        <label>年度<select value={route.year} onChange={event => filter({ year: event.target.value === "all" ? "all" : Number(event.target.value) })}>
          <option value="all">すべての年度</option>{years.map(year => <option key={year} value={year}>{year}年度</option>)}
        </select></label>
        {(route.query || route.subject !== "all" || route.year !== "all" || route.kind !== "all") &&
          <button type="button" className="text-button" onClick={() => { setDraft(""); onNavigate({ ...emptySearch }, true); }}>条件をクリア</button>}
      </div>
    </form>
    <div className="search-results-heading" role="status" aria-live="polite">
      <p>{route.query ? `「${route.query}」の検索結果` : "収録されている内容"}：<strong>{matches.length}件</strong>
        {matches.length > 0 && <span> · {(page - 1) * SEARCH_PAGE_SIZE + 1}〜{Math.min(page * SEARCH_PAGE_SIZE, matches.length)}件を表示</span>}</p>
      {loading && <span className="search-loading"><LoaderCircle size={15} className="spinning" />詳細解説を確認中</span>}
    </div>
    {!matches.length ? <div className="empty-state"><Search size={36} /><h2>条件に一致する内容がありません</h2>
      <p>キーワードを短くするか、科目・年度・対象を変更してください。</p></div> : <div className="search-results">
      {visible.map(document => <article className="search-result" key={document.id}>
        <div className="search-result-meta"><span className="search-kind">{document.kind === "detail" ? "詳細解説" : "問題"}</span>
          <span>{document.kind === "detail" ? searchQuestionTitle(document.question) : areas[document.question.learning.area] ?? document.question.learning.area}</span></div>
        <h2><a id={`search-result-${document.id}`} href={searchRouteHash({ ...route, view: document.kind, questionId: document.question.id })}
          onClick={event => { event.preventDefault(); open(document); }}>{document.title}<ArrowRight size={17} aria-hidden="true" /></a></h2>
        <p className="search-result-snippet">{searchSnippet(document, route.query)}</p>
        <div className="search-result-topics">{(document.question.learning.topics ?? []).map(topic => <span key={topic}>{topic}</span>)}</div>
        {document.kind === "detail" && <button className="text-button" onClick={() => open(document, "question")}>対応する問題を見る</button>}
        <AttributionLine content={document.manifest ? { blocks: [], attribution: document.manifest.attribution } : document.question.prompt} bundle={bundle}
          sourceLabels={document.manifest ? Object.fromEntries(document.manifest.attribution.sourceRefs.map(ref =>
            [ref.sourceId, bundle.sources.find(source => source.id === ref.sourceId)?.title.split(": ").at(-1) ?? "原資料"])) : undefined} />
      </article>)}
    </div>}
    {pages > 1 && <nav className="search-pagination" aria-label="検索結果のページ">
      <button disabled={page <= 1} onClick={() => onNavigate({ ...route, page: page - 1 }, true)}><ChevronLeft size={17} />前のページ</button>
      <span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => onNavigate({ ...route, page: page + 1 }, true)}>次のページ<ChevronRight size={17} /></button>
    </nav>}
  </section>;
}

function useSearchAssets(question: Question, bundle: Bundle, attempt: number) {
  const [state, setState] = useState<{ loading: boolean; error: string; urls: Record<string, string> }>({ loading: true, error: "", urls: {} });
  useEffect(() => {
    let active = true;
    const urls: Record<string, string> = {};
    setState({ loading: true, error: "", urls: {} });
    void Promise.all([ensureMath([question]), ...question.assetRefs.map(async id => {
      const asset = bundle.assets.find(asset => asset.id === id);
      if (!asset) throw Error("問題の画像が見つかりません。");
      return [id, await loadAsset(asset)] as const;
    })]).then(values => {
      if (!active) return;
      for (const value of values.slice(1)) {
        const [id, blob] = value as readonly [string, Blob]; urls[id] = URL.createObjectURL(blob);
      }
      setState({ loading: false, error: "", urls });
    }).catch(() => { if (active) setState({ loading: false, error: "問題の画像・数式を読み込めませんでした。通信を確認して再試行してください。", urls: {} }); });
    const imageError = () => { if (active) setState(previous => ({ ...previous, error: "問題の画像を表示できません。再試行してください。" })); };
    window.addEventListener("opencbt-asset-error", imageError);
    return () => { active = false; Object.values(urls).forEach(URL.revokeObjectURL); window.removeEventListener("opencbt-asset-error", imageError); };
  }, [question, bundle, attempt]);
  return state;
}

function SearchQuestion({ question, bundle, route, theme, onNavigate, onLicenses, onPractice, practiceDisabled, onDetailUnavailable, notifications }: {
  question: Question; bundle: Bundle; route: SearchRoute; theme: Theme; onNavigate: Navigate; onLicenses: () => void; onDetailUnavailable: () => void;
  onPractice: (question: Question) => void; practiceDisabled: boolean; notifications?: ReactNode;
}) {
  const [revealed, setRevealed] = useState(route.view === "detail"), [source, setSource] = useState(false), [attempt, setAttempt] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null), detailScroll = useRef(0), previousView = useRef(route.view);
  const assets = useSearchAssets(question, bundle, attempt);
  const detail = useDetailedExplanation(question.detailedExplanationRef, true, bundle);
  useEffect(() => {
    if (question.detailedExplanationRef && !detail.loading && !detail.prepared) onDetailUnavailable();
  }, [detail.loading, detail.prepared]);
  const context = useMemo(() => questionDetailContext(question, theme), [question]);
  const backTo = (next: SearchRoute) => {
    if (window.history.state?.searchFrom === searchRouteHash(next) && window.history.length > 1) window.history.back();
    else onNavigate(next, true);
  };
  const ordinary = () => { setRevealed(true); backTo({ ...route, view: "question" }); };
  useEffect(() => {
    if (route.view === "question") {
      if (previousView.current === "detail") requestAnimationFrame(() => {
        window.scrollTo({ top: detailScroll.current, behavior: "instant" });
        (document.querySelector<HTMLButtonElement>(".search-detail-link") ?? heading.current)?.focus({ preventScroll: true });
      });
      else heading.current?.focus({ preventScroll: true });
    }
    previousView.current = route.view;
  }, [route.view]);
  const toResults = () => backTo({ ...route, view: "results", questionId: undefined });
  return <>
    <section className="search-question" hidden={route.view === "detail"}>
      <button className="text-button back-link" onClick={toResults}><ArrowLeft size={17} />検索結果へ戻る</button>
      <div className="eyebrow">QUESTION</div><h1 ref={heading} tabIndex={-1}>{searchQuestionTitle(question)}</h1>
      <div className="search-question-topics"><span>{areas[question.learning.area] ?? question.learning.area}</span>
        {(question.learning.topics ?? []).map(topic => <span key={topic}>{topic}</span>)}</div>
      {assets.loading ? <p role="status"><LoaderCircle size={17} className="spinning" />問題を読み込んでいます</p> : assets.error ?
        <p role="alert">{assets.error} <button onClick={() => setAttempt(value => value + 1)}>再試行</button></p> : <>
        <div className="search-question-material">
          {question.contextRefs.map(id => {
            const material = question.contexts.find(value => value.id === id)!;
            return <section key={id} aria-label={material.title}><Content content={material.content} bundle={bundle} assetUrls={assets.urls} credit /></section>;
          })}
          <Content content={question.prompt} bundle={bundle} assetUrls={assets.urls} credit />
        </div>
        <div className="search-question-actions" role="group" aria-label="問題の操作">
          <button className="primary search-reveal" aria-expanded={revealed} aria-controls={revealed ? "search-explanation" : undefined} onClick={() => setRevealed(value => !value)}>
            {revealed ? "正答・解説を閉じる" : "正答・解説を表示"}</button>
          {detail.prepared && <button className="search-detail-link" onClick={() => {
            detailScroll.current = window.scrollY; onNavigate({ ...route, view: "detail" });
          }}>詳細解説を見る<ArrowRight size={17} /></button>}
          <button className="search-practice" disabled={practiceDisabled} onClick={() => onPractice(question)}><Play size={17} />類題を解く</button>
        </div>
        {revealed && <section id="search-explanation" className="search-explanation" aria-label="正答と解説">
          <h2>正答：{labels[question.choices.findIndex(choice => choice.id === question.correctAnswer.choiceId)]}</h2>
          <Content content={question.explanation} bundle={bundle} assetUrls={assets.urls} credit />
          <StudyTerms question={question} assets={bundle.assets} />
        </section>}
      </>}
      <QuestionFooter question={question} bundle={bundle} revealed={revealed} alwaysExpanded onSource={() => setSource(true)} onLicenses={onLicenses} />
    </section>
    {route.view === "detail" && <>
      <DetailViewer key={question.id} context={context} notifications={notifications} bundle={bundle} theme={theme} prepared={detail.prepared} loading={detail.loading}
        onBack={ordinary} onUnavailable={() => { onDetailUnavailable(); detail.disable(); setRevealed(true); onNavigate({ ...route, view: "question" }, true); }} />
      <QuestionFooter question={question} bundle={bundle} revealed alwaysExpanded onSource={() => setSource(true)} onLicenses={onLicenses} />
    </>}
    {source && <Dialog title="出典・改変の詳細" onClose={() => setSource(false)}>
      <p>{searchQuestionTitle(question)} · 改変{question.origin.isModified ? "あり" : "なし"}</p>
      {question.origin.sourceRefs.map((ref, i) => {
        const source = bundle.sources.find(value => value.id === ref.sourceId)!;
        return <p key={i}><a href={safeUrl(source.url) + `#page=${ref.locator.page ?? 1}`} target="_blank" rel="noreferrer">{source.title} · p.{ref.locator.page}</a>
          <small className="block">{source.publisher} · 確認日 {source.checkedOn}</small></p>;
      })}
      {question.origin.changes.map((change, i) => <div key={i} className="change-item"><strong>{change.summary}</strong><p>{change.details}</p></div>)}
      <p>素材ごとの利用条件は問題下部の出典情報、ライセンス全文は「ライセンス表記」から確認できます。</p>
    </Dialog>}
  </>;
}
