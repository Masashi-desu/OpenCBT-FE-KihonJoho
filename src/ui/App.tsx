import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BookOpen,
  Bookmark as BookmarkIcon,
  CalendarDays,
  Shuffle,
  Play,
  Clock,
  History,
  Scale,
  ChevronLeft,
  ChevronRight,
  Flag,
  ListChecks,
  Check,
  CheckCircle2,
  Trash2,
  ExternalLink,
  RotateCcw,
  Pause,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
  FileText,
  Home,
  Square,
  Eye,
  ArrowRight,
  X,
  Sun,
  Moon,
} from "lucide-react";
import {
  type Bundle,
  type Run,
  type Selection,
  type Question,
  labels,
  areas,
} from "../core/types";
import { loadCatalog, loadAsset } from "../core/catalog";
import { selectQuestions } from "../core/selection";
import {
  prepareRun,
  startRun,
  finishRun,
  updateAnswer,
  remaining,
  elapsed,
  touch,
  validateRun,
} from "../core/session";
import {
  history,
  loadRun,
  saveRun,
  deleteRuns,
  maintainStorage,
  storeOriginalSnapshot,
  acquireRunLock,
  recentGeneration,
  listBookmarks,
  saveBookmark,
  saveBookmarks,
  deleteBookmark,
} from "../core/storage";
import {
  makeBookmark,
  bookmarkPreview,
  resultBookmarks,
  type Bookmark,
  type BookmarkOutcome,
} from "../core/bookmarks";
import { DataError, safeUrl } from "../core/validation";
import { Content, AttributionLine } from "./Content";
import { Dialog } from "./Dialog";
import { QuestionFooter, screenNotice } from "./QuestionFooter";
import { QuestionRail } from "./QuestionRail";
import { MaterialPane, MaterialToolbar, useMaterialViewer } from "./MaterialViewer";
import { ensureMath } from "./math";
import type { LicenseNotice } from "../../scripts/licenses";
import {
  applyTheme,
  readTheme,
  saveTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "./theme";

type View =
  | "menu"
  | "instructions"
  | "exam"
  | "result"
  | "review"
  | "history"
  | "bookmarks"
  | "licenses";
type HistoryItem = Awaited<ReturnType<typeof history>>[number];
type HistoryFilter = "all" | Selection["kind"];
const defaults: Selection = {
  subject: "A",
  kind: "annual",
  year: 2026,
  mode: "study",
  size: "public",
  bindingMode: "original_data",
};
const time = (seconds: number) =>
  `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const date = (at: string) =>
  new Date(at).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
const statusLabel: Record<string, string> = {
  ready: "開始前",
  running: "解答中",
  paused: "一時停止",
  completed: "終了",
  expired: "時間切れ",
  abandoned: "放棄",
  invalidated: "無効",
};

function BrandMark() {
  return (
    <>
      <span className="brand-icon" aria-hidden="true" />
      <span>
        OpenCBT<small>基本情報技術者試験</small>
      </span>
    </>
  );
}

function ThemeToggle({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <div className="theme-toggle" role="group" aria-label="表示モード">
      <button
        type="button"
        aria-label="ライトモード"
        title="ライトモード"
        aria-pressed={theme === "light"}
        onClick={() => onChange("light")}
      >
        <Sun size={19} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="ダークモード"
        title="ダークモード"
        aria-pressed={theme === "dark"}
        onClick={() => onChange("dark")}
      >
        <Moon size={19} aria-hidden="true" />
      </button>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>(readTheme),
    [bundle, setBundle] = useState<Bundle>(),
    [view, setView] = useState<View>("menu"),
    [selection, setSelection] = useState<Selection>(defaults),
    [run, setRun] = useState<Run>(),
    [items, setItems] = useState<HistoryItem[]>([]),
    [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all"),
    [bookmarks, setBookmarks] = useState<Bookmark[]>([]),
    [bookmarkPending, setBookmarkPending] = useState(false),
    [bookmarkMessage, setBookmarkMessage] = useState(""),
    [bookmarkError, setBookmarkError] = useState(""),
    [busy, setBusy] = useState("公開問題を読み込んでいます"),
    [error, setError] = useState(""),
    [dialog, setDialog] = useState<
      "list" | "finish" | "source" | "licenses" | "delete" | "leave" | null
    >(null),
    [deleteId, setDeleteId] = useState<string | undefined>(),
    [tick, setTick] = useState(Date.now()),
    [reviewIndex, setReviewIndex] = useState(0),
    [reviewFilter, setReviewFilter] = useState("all"),
    [mathRetry, setMathRetry] = useState(false),
    [listFilter, setListFilter] = useState("all");
  const current = useRef<Run | undefined>(undefined),
    queue = useRef(Promise.resolve()),
    releaseLock = useRef<(() => void) | undefined>(undefined),
    lockedId = useRef<string | undefined>(undefined),
    saveFailed = useRef(false),
    studyFraction = useRef(0),
    latestBusy = useRef(busy),
    lastTime = useRef({ wall: Date.now(), mono: performance.now() }),
    pendingSnapshot = useRef<string | undefined>(undefined),
    h1 = useRef<HTMLHeadingElement>(null);
  latestBusy.current = busy;
  const filteredHistoryItems = useMemo(
    () => items.filter(
      (item) => historyFilter === "all" || item.selection?.kind === historyFilter,
    ),
    [items, historyFilter],
  );
  useLayoutEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);
  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null)
        setTheme(event.newValue === "dark" ? "dark" : "light");
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);
  const navigate = useCallback((target: View) => {
    setView(target);
    setDialog(null);
    const path =
      (target === "exam" || target === "result" || target === "review") &&
      current.current
        ? `${target}/${current.current.session.id}`
        : target;
    window.history.replaceState(null, "", `#/${path}`);
    window.scrollTo(0, 0);
  }, []);
  const commit = useCallback((next: Run) => {
    if (saveFailed.current) return;
    current.current = next;
    setRun(next);
    queue.current = queue.current
      .then(async () => {
        if (saveFailed.current) return;
        await saveRun(next);
      })
      .catch((e) => {
        saveFailed.current = true;
        setError(
          `保存できませんでした。${e instanceof Error ? e.message : "保存領域を確認してください。"} 未保存の解答を保存済みとして扱いません。`,
        );
      });
  }, []);
  const lock = useCallback((id: string) => {
    if (lockedId.current === id) return;
    releaseLock.current?.();
    lockedId.current = id;
    releaseLock.current = acquireRunLock(id, () => {
      lockedId.current = undefined;
      saveFailed.current = true;
      setError(
        "この解答は別のタブで開いているか、排他保存に必要な機能を利用できません。他のタブを閉じて再読込みしてください。",
      );
    });
  }, []);
  const reopen = useCallback(
    async (id: string, target: View = "exam") => {
      setBusy("保存した問題と出典を確認しています");
      setError("");
      try {
        await queue.current;
        saveFailed.current = false;
        let next = await loadRun(id);
        if (
          next.exam.mode === "practice" &&
          next.session.status === "running" &&
          Date.now() < Date.parse(next.session.updatedAt)
        ) {
          next = finishRun(
            next,
            "invalidated",
            Date.parse(next.session.updatedAt),
            "clock_change",
          );
          await saveRun(next);
        }
        if (
          next.session.deadlineAt &&
          next.session.status === "running" &&
          remaining(next) === 0
        ) {
          next = finishRun(next, "expired");
          await saveRun(next);
        }
        if (next.exam.mode === "study" && next.session.status === "running") {
          next.session.status = "paused";
          next.session.pausedAt = new Date().toISOString();
          touch(next);
          await saveRun(next);
        }
        try {
          await ensureMath(next.issued);
          setMathRetry(false);
        } catch (e) {
          if (!next.result) throw e;
          setMathRetry(true);
        }
        if (next.session.status === "ready") {
          next = startRun(next);
          await saveRun(next);
        }
        lock(id);
        current.current = next;
        setRun(next);
        lastTime.current = { wall: Date.now(), mono: performance.now() };
        studyFraction.current = 0;
        if (next.session.status === "invalidated")
          setError(
            `この解答は無効として停止しています（${next.session.invalidationReason}）。新しい練習を選んでください。`,
          );
        if (target === "review") {
          setReviewIndex(0);
          navigate("review");
        } else navigate(next.result ? "result" : "exam");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        navigate("history");
      } finally {
        setBusy("");
      }
    },
    [lock, navigate],
  );
  const initialize = useCallback(async () => {
    setBusy("公開問題と利用条件を読み込んでいます");
    setError("");
    saveFailed.current = false;
    try {
      const b = await loadCatalog();
      await maintainStorage(b);
      setBundle(b);
      setItems(await history());
      setBookmarks(await listBookmarks());
      const hash = location.hash.split("/");
      if (["exam", "result", "review"].includes(hash[1]) && hash[2])
        await reopen(hash[2], hash[1] as View);
      else if (["history", "licenses", "bookmarks"].includes(hash[1]))
        navigate(hash[1] as View);
    } catch (e) {
      setError(
        `起動に必要なデータを確認できません。${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setBusy("");
    }
  }, [navigate, reopen]);
  useEffect(() => {
    void initialize();
    return () => releaseLock.current?.();
  }, [initialize]);
  useEffect(() => {
    h1.current?.focus();
  }, [view]);
  useEffect(() => {
    if (!bookmarkMessage) return;
    const timer = window.setTimeout(() => setBookmarkMessage(""), 4000);
    return () => window.clearTimeout(timer);
  }, [bookmarkMessage]);
  useEffect(() => {
    const handler = () => {
      const r = current.current;
      if (r && r.session.status === "running") {
        const invalid = finishRun(r, "invalidated");
        commit(invalid);
        setError(
          "問題画像を表示できません。解答を無効として停止しました。ネットワークと保存領域を確認してください。",
        );
      }
    };
    window.addEventListener("opencbt-asset-error", handler);
    return () => window.removeEventListener("opencbt-asset-error", handler);
  }, [commit]);
  useEffect(() => {
    const timer = setInterval(() => {
      const at = Date.now(),
        mono = performance.now(),
        previous = lastTime.current;
      lastTime.current = { wall: at, mono };
      setTick(at);
      const r = current.current;
      if (
        !r ||
        r.session.status !== "running" ||
        latestBusy.current ||
        saveFailed.current
      )
        return;
      if (
        r.exam.mode === "practice" &&
        Math.abs(at - previous.wall - (mono - previous.mono)) > 5000
      ) {
        commit(finishRun(r, "invalidated", at, "clock_change"));
        setError(
          "端末時計の大きな変更を検出したため、この時間付き練習を停止しました。新しい練習を開始してください。",
        );
        return;
      }
      if (r.session.deadlineAt && remaining(r, at) === 0) {
        const expired = finishRun(r, "expired", at);
        commit(expired);
        navigate("result");
        return;
      }
      if (r.exam.mode === "study") {
        studyFraction.current += Math.max(0, (mono - previous.mono) / 1000);
        const seconds = Math.floor(studyFraction.current);
        studyFraction.current -= seconds;
        r.session.activeElapsedSeconds += seconds;
      }
      if (at - Date.parse(r.session.updatedAt) >= 5000) {
        const next = { ...r, session: structuredClone(r.session) };
        next.session.activeElapsedSeconds = elapsed(next, at);
        commit(touch(next, at));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [commit, navigate]);
  const assetUrls = useAssetUrls(run?.assets);
  let chosen: ReturnType<typeof selectQuestions> | undefined,
    selectionError = "";
  try {
    if (bundle) chosen = selectQuestions(bundle, selection, (a) => a);
  } catch (e) {
    selectionError = e instanceof Error ? e.message : String(e);
  }
  const patch = (value: Partial<Selection>) =>
    setSelection((old) => ({ ...old, ...value }));
  const begin = async (launchSelection = selection) => {
    if (!bundle) return;
    setBusy("出題する問題を固定しています");
    setError("");
    saveFailed.current = false;
    try {
      await queue.current;
      const prepared = selectQuestions(bundle, launchSelection);
      setBusy("問題画像と数式を準備しています");
      const assets: Record<string, Blob> = {};
      await Promise.all(
        [...new Set(prepared.questions.flatMap((q) => q.assetRefs))].map(
          async (id) => {
            const a = bundle.assets.find((a) => a.id === id);
            if (!a) throw new DataError("ASSET_REF", id);
            assets[id] = await loadAsset(a);
          },
        ),
      );
      await ensureMath(prepared.questions);
      setBusy("元データと出題内容を保存しています");
      const ready = await prepareRun(
        bundle,
        launchSelection,
        assets,
        Date.now(),
        async (id, b, a) => {
          pendingSnapshot.current = id;
          await storeOriginalSnapshot(id, b, a);
        },
        prepared,
        await recentGeneration(),
      );
      await ensureMath(ready.issued);
      await saveRun(ready);
      const next = startRun(ready);
      await saveRun(next);
      pendingSnapshot.current = undefined;
      lock(next.session.id);
      current.current = next;
      setRun(next);
      lastTime.current = { wall: Date.now(), mono: performance.now() };
      studyFraction.current = 0;
      navigate("exam");
    } catch (e) {
      if (pendingSnapshot.current) {
        await deleteRuns([pendingSnapshot.current]).catch(() => {});
        pendingSnapshot.current = undefined;
      }
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  };
  const move = (index: number) => {
    const r = current.current;
    if (
      !r ||
      !["running", "paused"].includes(r.session.status) ||
      saveFailed.current ||
      index < 0 ||
      index >= r.session.entries.length
    )
      return;
    const next = { ...r, session: structuredClone(r.session) };
    if (next.session.status === "paused") {
      next.session.status = "running";
      delete next.session.pausedAt;
      lastTime.current = { wall: Date.now(), mono: performance.now() };
    }
    next.session.currentIndex = index;
    commit(touch(next));
    setDialog(null);
    document.querySelector(".reading-scroll")?.scrollTo(0, 0);
    h1.current?.focus();
  };
  const answer = (id: string | undefined) => {
    const r = current.current;
    if (!r) return;
    const next = updateAnswer(r, id);
    commit(next);
    if (next.result) navigate("result");
  };
  const flag = () => {
    const r = current.current;
    if (!r || r.session.status !== "running") return;
    const next = { ...r, session: structuredClone(r.session) };
    next.session.entries[next.session.currentIndex].reviewFlag =
      !next.session.entries[next.session.currentIndex].reviewFlag;
    commit(touch(next));
  };
  const reveal = () => {
    const r = current.current;
    if (!r || r.exam.mode !== "study" || r.session.status !== "running") return;
    const next = { ...r, session: structuredClone(r.session) };
    next.session.entries[next.session.currentIndex].revealed = true;
    commit(touch(next));
  };
  const pause = (goHome = false) => {
    const r = current.current;
    if (!r || r.exam.mode !== "study") return;
    const next = { ...r, session: structuredClone(r.session) };
    if (next.session.status === "running") {
      next.session.status = "paused";
      next.session.pausedAt = new Date().toISOString();
    } else if (next.session.status === "paused") {
      next.session.status = "running";
      delete next.session.pausedAt;
      lastTime.current = { wall: Date.now(), mono: performance.now() };
    }
    commit(touch(next));
    if (goHome) navigate("menu");
  };
  const finish = () => {
    const r = current.current;
    if (!r) return;
    const next = finishRun(
      r,
      r.session.deadlineAt && remaining(r) === 0 ? "expired" : "completed",
    );
    commit(next);
    navigate("result");
  };
  const showHistory = async () => {
    try {
      await queue.current;
      if (bundle) await maintainStorage(bundle);
      setItems(await history());
      navigate("history");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const showBookmarks = async () => {
    try {
      setBookmarks(await listBookmarks());
      setBookmarkMessage("");
      setBookmarkError("");
      navigate("bookmarks");
    } catch (e) {
      setBookmarkError(
        `ブックマークを読み込めませんでした。${e instanceof Error ? e.message : String(e)}`,
      );
    }
  };
  const removeBookmark = async (bookmark: Bookmark) => {
    setBookmarkPending(true);
    setBookmarkError("");
    try {
      await deleteBookmark(bookmark.id);
      setBookmarks(await listBookmarks());
      setBookmarkMessage(`${bookmark.title}をブックマークから削除しました。`);
    } catch (e) {
      setBookmarkError(
        `ブックマークを削除できませんでした。${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setBookmarkPending(false);
    }
  };
  const beginBookmark = (bookmark: Bookmark) =>
    begin({
      subject: bookmark.subject,
      kind: "bookmark",
      year: selection.year,
      mode: "study",
      size: "public",
      bindingMode: "generated_values",
      bookmarkQuestionRef: bookmark.questionRef,
    });
  const nextBookmarkQuestion = async () => {
    const r = current.current;
    if (
      !r ||
      r.selection.kind !== "bookmark" ||
      !["running", "paused"].includes(r.session.status)
    )
      return;
    commit(finishRun(r, "completed"));
    await queue.current;
    if (saveFailed.current) return;
    await begin(r.selection);
    if (current.current?.session.id === r.session.id) navigate("result");
  };
  const remove = async () => {
    setBusy("履歴と保存した問題を削除しています");
    try {
      await queue.current;
      await deleteRuns(deleteId ? [deleteId] : undefined);
      if (!deleteId || current.current?.session.id === deleteId) {
        releaseLock.current?.();
        lockedId.current = undefined;
        current.current = undefined;
        setRun(undefined);
      }
      setItems(await history());
      setDialog(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  };
  const currentIndex =
      view === "review" ? reviewIndex : (run?.session.currentIndex ?? 0),
    q = run?.issued[currentIndex],
    entry = run?.session.entries[currentIndex],
    isExam = view === "exam",
    isReview = view === "review",
    revealed = Boolean(isReview || entry?.revealed),
    canAnswer = Boolean(
      run?.session.status === "running" && isExam && !error && !busy,
    );
  const active = run && ["running", "paused"].includes(run.session.status);
  const canNavigate = Boolean(
    (isReview || (isExam && active)) && !error && !busy,
  );
  let currentBookmark: Bookmark | undefined;
  if (bundle && entry) {
    try {
      currentBookmark = makeBookmark(bundle, entry.questionRef);
    } catch {
      // Old or withdrawn saved questions remain reviewable only under their saved rules.
    }
  }
  const bookmarked = bookmarks.some((b) => b.id === currentBookmark?.id);
  const resultBookmarkGroups = useMemo(
    () => ({
      unanswered:
        bundle && run?.result
          ? resultBookmarks(bundle, run, "unanswered")
          : [],
      incorrect:
        bundle && run?.result
          ? resultBookmarks(bundle, run, "incorrect")
          : [],
    }),
    [bundle, run?.result],
  );
  const canBookmarkResult = (outcome: BookmarkOutcome) =>
    resultBookmarkGroups[outcome].some(
      (candidate) => !bookmarks.some((bookmark) => bookmark.id === candidate.id),
    );
  const bookmarkResult = async (outcome: BookmarkOutcome) => {
    if (!run?.result || bookmarkPending || !canBookmarkResult(outcome)) return;
    const label = outcome === "unanswered" ? "未解答" : "不正解";
    setBookmarkPending(true);
    setBookmarkMessage("");
    setBookmarkError("");
    try {
      const createdAt = new Date().toISOString();
      const added = await saveBookmarks(
        resultBookmarkGroups[outcome].map((bookmark) => ({
          ...bookmark,
          createdAt,
        })),
      );
      setBookmarks(await listBookmarks());
      setBookmarkMessage(
        added
          ? `${label}の問題を${added}件ブックマークに追加しました。`
          : `${label}の問題はすべてブックマークに追加済みです。`,
      );
    } catch (e) {
      setBookmarkError(
        `${label}の問題をブックマークに追加できませんでした。${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setBookmarkPending(false);
    }
  };
  const toggleBookmark = async () => {
    if (!currentBookmark || bookmarkPending) return;
    if (bookmarked) return removeBookmark(currentBookmark);
    setBookmarkPending(true);
    setBookmarkError("");
    try {
      await saveBookmark(currentBookmark);
      setBookmarks(await listBookmarks());
      setBookmarkMessage(
        `${currentBookmark.title}をブックマークに追加しました。`,
      );
    } catch (e) {
      setBookmarkError(
        `ブックマークに追加できませんでした。${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setBookmarkPending(false);
    }
  };
  useLayoutEffect(() => {
    if (isExam || isReview)
      document.querySelector(".answer-content")?.scrollTo(0, 0);
  }, [currentIndex, isExam, isReview]);
  const materialViewer = useMaterialViewer(
    isExam || isReview ? q : undefined,
    `${run?.session.id}:${currentIndex}:${view}`,
  );
  const navItems = [
    { id: "menu" as View, label: "学習をはじめる", icon: BookOpen },
    { id: "bookmarks" as View, label: "ブックマーク", icon: BookmarkIcon },
    { id: "history" as View, label: "履歴・復習", icon: History },
    { id: "licenses" as View, label: "ライセンス表記", icon: Scale },
  ];
  const goMenu = () => {
    if (isExam && active) setDialog("leave");
    else navigate("menu");
  };

  return (
    <div
      className={
        isExam || isReview ? "application exam-application" : "application"
      }
    >
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          h1.current?.focus();
        }}
      >
        本文へ移動
      </a>
      {!isExam && !isReview && (
        <aside className="sidebar">
          <a
            className="brand"
            href="#/menu"
            onClick={(e) => {
              e.preventDefault();
              goMenu();
            }}
          >
            <BrandMark />
          </a>
          <nav aria-label="メインメニュー">
            {navItems.map((n) => (
              <button
                key={n.id}
                className={view === n.id ? "nav-item active" : "nav-item"}
                aria-label={n.label}
                title={n.label}
                onClick={() =>
                  n.id === "history"
                    ? void showHistory()
                    : n.id === "bookmarks"
                      ? void showBookmarks()
                      : navigate(n.id)
                }
              >
                <n.icon size={19} aria-hidden="true" />
                <span className="nav-label">{n.label}</span>
                {view === n.id && (
                  <ChevronRight
                    className="nav-chevron"
                    size={15}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-theme">
            <ThemeToggle theme={theme} onChange={setTheme} />
          </div>
        </aside>
      )}
      <div className="workspace">
        {error && (
          <div className="error-banner" role="alert">
            <AlertCircle size={21} />
            <div>
              <strong>操作を続けられません</strong>
              <p>{error}</p>
              <div className="inline-actions">
                <button
                  disabled={Boolean(busy)}
                  onClick={() => {
                    setError("");
                    if (view === "instructions") void begin();
                    else void initialize();
                  }}
                >
                  <RotateCcw size={16} />
                  {view === "instructions" ? "再試行" : "再読込み"}
                </button>
                <button
                  onClick={() => {
                    setError("");
                    navigate("menu");
                  }}
                >
                  メニューへ
                </button>
                <button onClick={() => navigate("licenses")}>
                  ライセンス表記
                </button>
              </div>
            </div>
          </div>
        )}
        {busy && (
          <div className="loading-bar" role="status">
            <LoaderCircle size={17} className="spinning" />
            {busy}
          </div>
        )}
        {(bookmarkError || bookmarkMessage) && (
          <div
            key={bookmarkError || bookmarkMessage}
            className="bookmark-feedback"
            role={bookmarkError ? "alert" : "status"}
          >
            <span>{bookmarkError || bookmarkMessage}</span>
            <button
              className="icon-button"
              aria-label="ブックマークの通知を閉じる"
              onClick={() => {
                setBookmarkError("");
                setBookmarkMessage("");
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {mathRetry && (view === "result" || view === "review") && (
          <div className="notice-inline" role="status">
            <AlertCircle size={17} />
            <p>
              数式の描画を利用できません。保存した結果と数式の説明文は確認できます。
              <button
                onClick={() => {
                  if (run)
                    void ensureMath(run.issued)
                      .then(() => setMathRetry(false))
                      .catch(() => setMathRetry(true));
                }}
              >
                数式の読込みを再試行
              </button>
            </p>
          </div>
        )}
        <main
          id="main"
          className={isExam || isReview ? "exam-main" : "page-main"}
        >
          {view === "menu" && (
            <>
              <div className="eyebrow">YOUR NEXT PRACTICE</div>
              <h1 ref={h1} tabIndex={-1}>
                学習をはじめる
              </h1>
              <p className="page-intro">
                原文を読み、考え、解答する。自分のペースで基本情報の理解を深めましょう。
              </p>
              {active && (
                <div className="resume-callout">
                  <History size={23} />
                  <div>
                    <strong>前回の学習が残っています</strong>
                    <p>
                      {run.set.title} · {statusLabel[run.session.status]}
                      {run.session.deadlineAt ? "（時間は継続します）" : ""}
                    </p>
                    {run.selection.kind === "mix" &&
                      run.exam.duplicatePolicy === "lineage_unique" && (
                        <p className="subtle">
                          変更前の固定問題ミックスの保存記録です。新しい生成方式は、下のランダムミックスから開始できます。
                        </p>
                      )}
                    {run.instances.some(
                      (i) =>
                        i.generatorRef.version === "1.0.0" &&
                        i.generatorRef.id !== "generator-array-sum",
                    ) && (
                      <p className="subtle">
                        出題形式の修正前に保存した問題です。原問題の形式を維持する新版は、下のランダムミックスから新しく開始できます。
                      </p>
                    )}
                  </div>
                  <button onClick={() => void reopen(run.session.id)}>
                    <Play size={16} /> 続きから
                  </button>
                </div>
              )}
              <section className="selection-card">
                <div className="section-title">
                  <span className="step-dot">1</span>
                  <h2>科目を選択</h2>
                </div>
                <div className="subject-tabs" role="group" aria-label="科目">
                  {(["A", "B"] as const).map((s) => (
                    <button
                      key={s}
                      aria-pressed={selection.subject === s}
                      className={selection.subject === s ? "selected" : ""}
                      onClick={() => patch({ subject: s })}
                    >
                      <span className="subject-letter">{s}</span>
                      <span>
                        科目{s}
                        <small>
                          {s === "A"
                            ? "知識・基礎理論・マネジメント"
                            : "アルゴリズム・情報セキュリティ"}
                        </small>
                      </span>
                      {selection.subject === s && <CheckCircle2 size={21} />}
                    </button>
                  ))}
                </div>
                <div className="section-title">
                  <span className="step-dot">2</span>
                  <h2>出題セットを選択</h2>
                </div>
                <div
                  className="set-options"
                  role="group"
                  aria-label="出題セット"
                >
                  {[
                    {
                      kind: "annual" as const,
                      title: "年度別オリジナル",
                      text: "公開年度の問題を、原文・元の値・順序のまま。",
                      icon: CalendarDays,
                    },
                    {
                      kind: "mix" as const,
                      title: "ランダムミックス",
                      text: "原問題を基に対象・条件・数値と正答を毎回生成。分野ごとの問数を維持。",
                      icon: Shuffle,
                    },
                  ].map((v) => (
                    <button
                      key={v.kind}
                      className={
                        selection.kind === v.kind
                          ? "set-option selected"
                          : "set-option"
                      }
                      aria-pressed={selection.kind === v.kind}
                      onClick={() =>
                        patch({
                          kind: v.kind,
                          size: "public",
                          bindingMode:
                            v.kind === "mix"
                              ? "generated_values"
                              : "original_data",
                        })
                      }
                    >
                      <v.icon size={23} />
                      <strong>{v.title}</strong>
                      <span>{v.text}</span>
                      <span className="radio-dot" aria-hidden="true">
                        {selection.kind === v.kind && <Check size={12} />}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="config-grid">
                  {
                    <label className="field-label">
                      {selection.kind === "mix"
                        ? "分野構成の基準年度"
                        : "公開年度"}
                      <select
                        value={selection.year}
                        onChange={(e) =>
                          patch({ year: Number(e.target.value) })
                        }
                      >
                        {[2026, 2025, 2024, 2023].map((y) => (
                          <option key={y} value={y}>
                            {y}年度（令和{y - 2018}年度）
                          </option>
                        ))}
                      </select>
                    </label>
                  }
                  <fieldset className="mode-field">
                    <legend>学習モード</legend>
                    <div className="segmented">
                      {(["study", "practice"] as const).map((m) => (
                        <button
                          key={m}
                          aria-pressed={selection.mode === m}
                          className={selection.mode === m ? "selected" : ""}
                          onClick={() => patch({ mode: m })}
                        >
                          {m === "study" ? (
                            <BookOpen size={16} />
                          ) : (
                            <Clock size={16} />
                          )}{" "}
                          {m === "study" ? "学習・復習" : "時間付き練習"}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {selection.kind === "mix" && (
                    <label className="field-label">
                      出題数
                      <select
                        value={selection.size}
                        onChange={(e) =>
                          patch({ size: e.target.value as Selection["size"] })
                        }
                      >
                        <option value="public">
                          短い練習（{selection.subject === "A" ? 20 : 6}問）
                        </option>
                        <option value="full">
                          本番の問数（{selection.subject === "A" ? 60 : 20}問）
                        </option>
                      </select>
                    </label>
                  )}
                </div>
                {selection.kind === "annual" &&
                  selection.subject === "B" &&
                  selection.year === 2025 && (
                    <div className="notice-inline">
                      <AlertCircle size={17} />
                      <p>
                        問6はJIS文言の再配布条件を未確認のため除外しています。5問を収録。
                        <a
                          href="https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/2025r07.html"
                          target="_blank"
                          rel="noreferrer"
                        >
                          公式原資料で確認 <ExternalLink size={13} />
                        </a>
                      </p>
                    </div>
                  )}
                <div className="start-row">
                  <div className="set-summary">
                    {chosen ? (
                      <>
                        <strong>
                          {chosen.questions.length}
                          <small>問</small>
                        </strong>
                        <div>
                          {selection.mode === "study"
                            ? "時間制限なし"
                            : `${Math.round(chosen.exam.timeLimitSeconds! / 60)}分`}
                          <small>
                            {selection.mode === "study"
                              ? "正答の表示・一時停止ができます"
                              : "正答は終了後に表示します"}
                          </small>
                        </div>
                      </>
                    ) : (
                      <p className="selection-error">
                        {selectionError || "準備中"}
                      </p>
                    )}
                  </div>
                  <button
                    className="primary large"
                    disabled={Boolean(busy || !chosen || error)}
                    onClick={() => navigate("instructions")}
                  >
                    開始前の説明へ <ArrowRight size={18} />
                  </button>
                </div>
              </section>
              <div className="home-notes">
                <FileText size={19} />
                <p>
                  2023〜2026年度のIPA公開問題を収録。公開部分は本番の全問題ではありません。
                  <br />
                  公開情報をもとにCBTの画面・操作を再現しています。公式IRT評価点や合否は算出しません。
                  <br />
                  数式を含む問題の準備時は、KaTeX資産を外部CDNから取得します。
                </p>
                <button
                  className="text-button"
                  onClick={() => navigate("licenses")}
                >
                  出典・ライセンス <ChevronRight size={15} />
                </button>
              </div>
            </>
          )}
          {view === "instructions" && chosen && (
            <>
              <button
                className="text-button back-link"
                onClick={() => navigate("menu")}
              >
                <ArrowLeft size={16} /> セット選択に戻る
              </button>
              <div className="eyebrow">BEFORE YOU START</div>
              <h1 ref={h1} tabIndex={-1}>
                開始前の確認
              </h1>
              <p className="page-intro">
                {chosen.set.title} · 科目{selection.subject}
              </p>
              <section className="instruction-card">
                <div className="instruction-stats">
                  <div>
                    <ListChecks size={20} />
                    <strong>{chosen.questions.length}問</strong>
                    <span>出題数</span>
                  </div>
                  <div>
                    <Clock size={20} />
                    <strong>
                      {selection.mode === "study"
                        ? "制限なし"
                        : `${Math.round(chosen.exam.timeLimitSeconds! / 60)}分`}
                    </strong>
                    <span>
                      {selection.mode === "study"
                        ? "学習モード"
                        : "時間付き練習"}
                    </span>
                  </div>
                  <div>
                    <ShieldCheck size={20} />
                    <strong>端末内保存</strong>
                    <span>最終更新から180日</span>
                  </div>
                </div>
                <ul className="instruction-list">
                  <li>
                    選択済みの選択肢をもう一度押すと解答を解除できます。問題一覧から移動し、見直しの印を付けられます。
                  </li>
                  <li>
                    {selection.mode === "practice"
                      ? "開始後は再読込み・中断・終了確認中も残り時間が進みます。時間切れになると解答を確定します。"
                      : "正答・独自解説を必要なときに表示し、一時停止できます。正答を見た記録は残ります。"}
                  </li>
                  <li>
                    {selection.bindingMode === "generated_values"
                      ? "登録テンプレートの入力値を開始時に一度だけ生成・バインドします。バインドした問題は「改変あり」と表示し、元データも保持します。"
                      : "元データの数値・図・本文を維持します。元から改変済みの問題は、その改変表示を維持します。"}
                  </li>
                  <li>
                    ブラウザに正答を含めて配布します。学習用であり、正答を秘匿する試験ではありません。
                  </li>
                  <li>
                    電卓・メモ・ヒント・疑似言語の実行機能はありません。公式問題の詳細解説は一部を除き未収録です。
                  </li>
                  <li>
                    {selection.kind === "mix" && selection.size === "full"
                      ? "本番の問数・制限時間を使います。収録問題を分野比率で選ぶ学習練習で、実際の本番の問題分布を保証しません。"
                      : "制限時間はAを1問90秒、Bを1問300秒として算出した本アプリの設定です。公開部分を本番1回分とは扱いません。"}
                  </li>
                  <li>
                    数式がある場合は固定版KaTeX・CSS・フォントを外部CDNから取得します。IPアドレス等がCDNに届きますが、学習記録を送信しません。
                  </li>
                  <li>
                    学習結果は「学習正答率」です。公式IRT評価点・合否は計算しません。
                  </li>
                </ul>
                {Object.keys(chosen.quota).length > 0 && (
                  <div className="quota-chips">
                    {Object.entries(chosen.quota).map(([a, n]) => (
                      <span key={a}>
                        {areas[a]} {n}問
                      </span>
                    ))}
                  </div>
                )}
                <div className="instruction-footer">
                  <button
                    className="text-button"
                    onClick={() => navigate("licenses")}
                  >
                    <Scale size={17} />
                    ライセンス表記
                  </button>
                  <button
                    className="primary large"
                    disabled={Boolean(busy || error)}
                    onClick={() => void begin()}
                  >
                    {busy ? (
                      <LoaderCircle className="spinning" size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                    準備して開始
                  </button>
                </div>
              </section>
            </>
          )}
          {(isExam || isReview) && run && q && entry && (
            <>
              <header className="exam-toolbar">
                <div className="exam-app-toolbar">
                  <button
                    className="exam-brand"
                    onClick={() => (isReview ? navigate("result") : goMenu())}
                  >
                    <BrandMark />
                  </button>
                  <div className="toolbar-set">
                    <strong>
                      科目{q.subject} ·{" "}
                      {isReview
                        ? "復習"
                        : run.exam.mode === "study"
                          ? "学習"
                          : "時間付き練習"}
                    </strong>
                    <small>{run.set.title}</small>
                  </div>
                  <div
                    className="toolbar-tools"
                    role="group"
                    aria-label="学習・操作補助"
                  >
                    <div className="toolbar-study-actions">
                      <button
                        aria-label={
                          bookmarked
                            ? "ブックマークから削除"
                            : "ブックマークに追加"
                        }
                        aria-pressed={bookmarked}
                        disabled={
                          !currentBookmark ||
                          bookmarkPending ||
                          Boolean(busy || error)
                        }
                        onClick={() => void toggleBookmark()}
                      >
                        <BookmarkIcon
                          size={16}
                          fill={bookmarked ? "currentColor" : "none"}
                        />
                        {bookmarked ? "保存済み" : "ブックマーク"}
                      </button>
                      {!isReview && run.exam.mode === "study" && (
                        <>
                          <button
                            disabled={Boolean(error || busy)}
                            onClick={() => pause()}
                          >
                            <Pause size={16} />
                            {run.session.status === "paused"
                              ? "再開"
                              : "一時停止"}
                          </button>
                          <button
                            disabled={!canAnswer || entry.revealed}
                            onClick={reveal}
                          >
                            <Eye size={16} />
                            正答を見る
                          </button>
                        </>
                      )}
                      <button onClick={() => setDialog("list")}>
                        <ListChecks size={18} />
                        問題一覧
                      </button>
                    </div>
                  </div>
                </div>
                <div className="exam-cbt-toolbar">
                  <div className="exam-material-toolbar">
                    <MaterialToolbar viewer={materialViewer} />
                  </div>
                  <div className="exam-answer-toolbar">
                    <div className="exam-time">
                      <Clock size={19} />
                      <span>
                        {isReview
                          ? "終了した練習"
                          : run.session.status === "paused"
                            ? "一時停止"
                            : run.exam.mode === "study"
                              ? "経過時間"
                              : "残り時間"}
                        <strong>
                          {isReview
                            ? time(run.session.activeElapsedSeconds)
                            : run.exam.mode === "study"
                              ? time(run.session.activeElapsedSeconds)
                              : time(remaining(run, tick))}
                        </strong>
                      </span>
                    </div>
                    <button
                      className="finish-button"
                      onClick={() =>
                        isReview ? navigate("result") : setDialog("finish")
                      }
                    >
                      {isReview ? <ArrowLeft size={17} /> : <Square size={15} />}{" "}
                      {isReview ? "結果へ" : "終了"}
                    </button>
                  </div>
                </div>
              </header>
              <div
                className="exam-split"
                style={
                  {
                    "--question-font": "100%",
                    "--image-scale": 1,
                  } as React.CSSProperties
                }
              >
                <MaterialPane
                  viewer={materialViewer}
                  bundle={run.bundle}
                  assetUrls={assetUrls}
                />
                <section className="answer-pane" aria-label="解答領域">
                  <div className="answer-workspace">
                    <QuestionRail
                      entries={run.session.entries}
                      currentIndex={currentIndex}
                      disabled={!canNavigate}
                      onSelect={(index) =>
                        isReview ? setReviewIndex(index) : move(index)
                      }
                    />
                    <div className="answer-content">
                      <div className="answer-question">
                        <div className="answer-question-heading">
                          <h1 ref={h1} tabIndex={-1}>
                            問題 {currentIndex + 1}
                            <small> / {run.issued.length}</small>
                          </h1>
                        </div>
                      </div>
                      <fieldset
                        className="answer-choices"
                        disabled={!canAnswer}
                      >
                        <legend className="sr-only">解答を選択</legend>
                        {entry.choiceOrder.map((id, i) => {
                          const c = q.choices.find((c) => c.id === id)!;
                          const selected = entry.selectedChoiceId === id,
                            correct =
                              revealed && id === q.correctAnswer.choiceId;
                          return (
                            <label
                              key={id}
                              className={`answer-choice ${selected ? "selected" : ""} ${correct ? "correct" : ""}`}
                            >
                              <input
                                className="sr-only"
                                type="radio"
                                name="answer"
                                value={id}
                                checked={selected}
                                onChange={() => answer(id)}
                                onClick={() => {
                                  if (selected) answer(undefined);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === " ") {
                                    event.preventDefault();
                                    if (!event.repeat)
                                      answer(selected ? undefined : id);
                                  }
                                }}
                              />
                              <span className="choice-label">{labels[i]}</span>
                              <span className="choice-body">
                                {q.origin.kind === "official_reprint" ? (
                                  `原文の「${c.content.blocks[0].type === "paragraph" ? c.content.blocks[0].text : labels[i]}」`
                                ) : (
                                  <Content
                                    content={c.content}
                                    bundle={run.bundle}
                                    assetUrls={assetUrls}
                                    showAttribution={false}
                                  />
                                )}
                              </span>
                              {correct && <span className="sr-only">正答</span>}
                            </label>
                          );
                        })}
                      </fieldset>
                      {(revealed || isReview) && (
                        <section className="explanation">
                          <div className="explanation-title">
                            <CheckCircle2 size={20} />
                            <h2>
                              正答：
                              {
                                labels[
                                  entry.choiceOrder.indexOf(
                                    q.correctAnswer.choiceId,
                                  )
                                ]
                              }
                            </h2>
                          </div>
                          {isReview && (
                            <p>
                              あなたの解答：
                              {entry.selectedChoiceId
                                ? labels[
                                    entry.choiceOrder.indexOf(
                                      entry.selectedChoiceId,
                                    )
                                  ]
                                : "未解答"}{" "}
                              ·{" "}
                              {entry.selectedChoiceId ===
                              q.correctAnswer.choiceId
                                ? "正解"
                                : entry.selectedChoiceId
                                  ? "不正解"
                                  : "未解答"}
                            </p>
                          )}
                          <h3>
                            {q.explanation.attribution.origin === "original"
                              ? "独自解説・復習案内"
                              : "解説"}
                          </h3>
                          <Content
                            content={q.explanation}
                            bundle={run.bundle}
                            assetUrls={assetUrls}
                            showAttribution={false}
                          />
                          {entry.revealed && (
                            <small>学習中に正答を表示した問題です。</small>
                          )}
                        </section>
                      )}
                      {run.session.status === "paused" && (
                        <div className="pause-cover">
                          <Pause size={26} />
                          <h2>一時停止中</h2>
                          <p>
                            保存済みの解答から再開できます。予期しない終了では、保存前の操作が失われた可能性があります。
                          </p>
                          <button className="primary" onClick={() => pause()}>
                            <Play size={17} /> 再開
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <footer className="exam-footer">
                    <div className="exam-navigation">
                      {!isReview && (
                        <button
                          className={
                            entry.reviewFlag
                              ? "review-toggle marked"
                              : "review-toggle"
                          }
                          aria-label={
                            entry.reviewFlag
                              ? "見直しの印を外す"
                              : "あとで見直す"
                          }
                          title={
                            entry.reviewFlag
                              ? "見直しの印を外す"
                              : "あとで見直す"
                          }
                          aria-pressed={entry.reviewFlag}
                          disabled={!canAnswer}
                          onClick={flag}
                        >
                          <Flag
                            size={18}
                            aria-hidden="true"
                            fill={entry.reviewFlag ? "currentColor" : "none"}
                          />
                        </button>
                      )}
                      <button
                        disabled={!canNavigate || currentIndex === 0}
                        onClick={() =>
                          isReview
                            ? setReviewIndex((i) => i - 1)
                            : move(currentIndex - 1)
                        }
                      >
                        <ChevronLeft size={17} />
                        前へ
                      </button>
                      <button
                        className="primary"
                        disabled={
                          !canNavigate ||
                          (currentIndex === run.issued.length - 1 &&
                            (isReview || run.selection.kind !== "bookmark"))
                        }
                        onClick={() =>
                          isReview
                            ? setReviewIndex((i) => i + 1)
                            : run.selection.kind === "bookmark"
                              ? void nextBookmarkQuestion()
                              : move(currentIndex + 1)
                        }
                      >
                        {!isReview && run.selection.kind === "bookmark"
                          ? "次の類題"
                          : "次へ"}
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </footer>
                </section>
              </div>
              <QuestionFooter
                key={`${run.session.id}:${currentIndex}`}
                question={q}
                bundle={run.bundle}
                entry={entry}
                revealed={revealed}
                onSource={() => setDialog("source")}
                onLicenses={() => setDialog("licenses")}
              />
            </>
          )}
          {view === "result" && run?.result && (
            <>
              <div className="eyebrow">PRACTICE COMPLETED</div>
              <h1 ref={h1} tabIndex={-1}>
                {run.session.status === "expired"
                  ? "時間切れで終了しました"
                  : "おつかれさまでした"}
              </h1>
              <p className="page-intro">
                {run.set.title} · 科目{run.exam.subject}
              </p>
              <section className="result-card">
                {run.result.revealedCount > 0 && (
                  <p className="notice-inline">
                    学習中に正答を表示した問題：{run.result.revealedCount}
                    問。正答表示後の解答も集計に含みます。
                  </p>
                )}
                <div className="accuracy">
                  <div className="accuracy-ring">
                    <strong>
                      {run.result.learningAccuracyPercent}
                      <small>%</small>
                    </strong>
                  </div>
                  <div>
                    <h2>学習正答率</h2>
                    <p>正解数 ÷ 全出題数 × 100</p>
                    <small>公式IRT評価点・合否とは異なります。</small>
                  </div>
                </div>
                <div className="result-stats">
                  <Stat
                    icon={<CheckCircle2 size={19} />}
                    number={run.result.correct}
                    label="正解"
                  />
                  <Stat
                    icon={<X size={19} />}
                    number={run.result.incorrect}
                    label="不正解"
                  />
                  <Stat
                    icon={<Square size={19} />}
                    number={run.result.unanswered}
                    label="未解答"
                  />
                  <Stat
                    icon={<Clock size={19} />}
                    number={time(run.session.activeElapsedSeconds)}
                    label="経過時間"
                  />
                </div>
                <div
                  className="result-bookmark-actions"
                  role="group"
                  aria-label="ブックマークにまとめて追加"
                >
                  <button
                    disabled={
                      Boolean(busy) ||
                      bookmarkPending ||
                      !canBookmarkResult("unanswered")
                    }
                    onClick={() => void bookmarkResult("unanswered")}
                  >
                    <BookmarkIcon size={16} />
                    未解答をブックマークに追加
                  </button>
                  <button
                    disabled={
                      Boolean(busy) ||
                      bookmarkPending ||
                      !canBookmarkResult("incorrect")
                    }
                    onClick={() => void bookmarkResult("incorrect")}
                  >
                    <BookmarkIcon size={16} />
                    不正解をブックマークに追加
                  </button>
                </div>
                <div className="result-actions">
                  <div className="result-back-actions">
                    <button onClick={() => void showHistory()}>
                      <History size={18} />
                      履歴へ
                    </button>
                    <button
                      className="text-button"
                      onClick={() => navigate("menu")}
                    >
                      <Home size={17} />
                      メニューへ
                    </button>
                  </div>
                  <div className="result-navigation">
                    {run.selection.kind === "bookmark" && (
                      <button
                        className="primary"
                        disabled={Boolean(busy || error)}
                        onClick={() => void begin(run.selection)}
                      >
                        <Play size={18} /> 同じ問題で続けて練習
                      </button>
                    )}
                    <button
                      className="primary"
                      onClick={() => {
                        setReviewIndex(0);
                        navigate("review");
                      }}
                    >
                      <BookOpen size={18} />
                      問題を復習する
                    </button>
                  </div>
                </div>
              </section>
              <section className="question-results">
                <div className="section-heading">
                  <h2>問題ごとの結果</h2>
                  <select
                    aria-label="結果の絞り込み"
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                  >
                    <option value="all">すべて</option>
                    <option value="incorrect">不正解</option>
                    <option value="unanswered">未解答</option>
                    <option value="flagged">見直し</option>
                  </select>
                </div>
                {run.result.entries.map((e, i) =>
                  reviewFilter !== "all" &&
                  (reviewFilter === "flagged"
                    ? !run.session.entries[i].reviewFlag
                    : e.outcome !== reviewFilter) ? null : (
                    <button
                      className="result-row"
                      key={i}
                      onClick={() => {
                        setReviewIndex(i);
                        navigate("review");
                      }}
                    >
                      <span className="row-number">{i + 1}</span>
                      <span>
                        <strong>{questionName(run.issued[i])}</strong>
                        <small>
                          {areas[run.issued[i].learning.area]} · 改変
                          {run.session.entries[i].issuedContent.isModified
                            ? "あり"
                            : "なし"}
                        </small>
                      </span>
                      <span className={`outcome ${e.outcome}`}>
                        {e.outcome === "correct" ? (
                          <CheckCircle2 size={16} />
                        ) : e.outcome === "incorrect" ? (
                          <X size={16} />
                        ) : (
                          <Square size={16} />
                        )}{" "}
                        {e.outcome === "correct"
                          ? "正解"
                          : e.outcome === "incorrect"
                            ? "不正解"
                            : "未解答"}
                      </span>
                      {run.session.entries[i].reviewFlag && <Flag size={16} />}
                      <ChevronRight size={17} />
                    </button>
                  ),
                )}
              </section>
            </>
          )}
          {view === "bookmarks" && (
            <>
              <div className="eyebrow">YOUR BOOKMARKS</div>
              <h1 ref={h1} tabIndex={-1}>
                ブックマーク
              </h1>
              <p className="page-intro">
                保存した問題の類題を練習できます。「次の類題」で条件を変えた問題を続けて解けます。ブックマークはこのブラウザに保存します。履歴を削除しても残ります。サイトの保存領域を消去するとブックマークも消えます。
              </p>
              {bookmarks.length === 0 ? (
                <div className="empty-state">
                  <BookmarkIcon size={42} />
                  <h2>まだブックマークがありません</h2>
                  <p>
                    解答画面のヘッダーから、繰り返し練習したい問題を追加できます。
                  </p>
                  <button className="primary" onClick={() => navigate("menu")}>
                    問題を選ぶ <ArrowRight size={17} />
                  </button>
                </div>
              ) : (
                <div className="history-list">
                  {bookmarks.map((bookmark) => (
                    <article
                      key={bookmark.id}
                      className="history-card bookmark-card"
                    >
                      <span className="subject-letter">{bookmark.subject}</span>
                      <div className="history-info">
                        <h2>{bookmark.title}</h2>
                        <div className="bookmark-meta">
                          <span className="bookmark-genre">
                            {areas[bookmark.area] ?? bookmark.area}
                          </span>
                          <span>時間制限なし</span>
                        </div>
                        <p className="bookmark-preview">
                          {bundle &&
                            bookmarkPreview(bundle, bookmark.questionRef)}
                        </p>
                      </div>
                      <div className="history-actions">
                        <button
                          className="primary"
                          aria-label={`${bookmark.title}の類題を練習`}
                          disabled={Boolean(busy || error)}
                          onClick={() => void beginBookmark(bookmark)}
                        >
                          <Play size={16} /> 類題を練習
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${bookmark.title}のブックマークを削除`}
                          disabled={bookmarkPending}
                          onClick={() => void removeBookmark(bookmark)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {bundle && bookmarks.length > 0 && (
                <details className="bookmark-sources">
                  <summary>問題文の出典・利用条件</summary>
                  <p>問題文はIPA公開問題の冒頭から抜粋しています。</p>
                  {bookmarks.map((bookmark) => {
                    const source = bundle.questions.find(
                      (q) =>
                        q.id === bookmark.questionRef.questionId &&
                        q.revision === bookmark.questionRef.revision,
                    );
                    return source ? (
                      <article key={bookmark.id}>
                        <h2>{bookmark.title}</h2>
                        <AttributionLine
                          content={source.prompt}
                          bundle={bundle}
                        />
                      </article>
                    ) : null;
                  })}
                  <button
                    className="text-button"
                    onClick={() => navigate("licenses")}
                  >
                    ライセンス表記 <ChevronRight size={15} />
                  </button>
                </details>
              )}
            </>
          )}
          {view === "history" && (
            <>
              <div className="eyebrow">YOUR LEARNING RECORD</div>
              <div className="page-title-row">
                <h1 ref={h1} tabIndex={-1}>
                  履歴・復習
                </h1>
                <button
                  disabled={!items.length || Boolean(busy)}
                  onClick={() => {
                    setDeleteId(undefined);
                    setDialog("delete");
                  }}
                >
                  <Trash2 size={16} />
                  すべて削除
                </button>
              </div>
              <p className="page-intro">
                学習履歴はこのブラウザに保存し、最終更新から180日で削除します。ログイン・学習記録の外部送信はありません。サイトの保存領域を消去すると履歴も消えます。
              </p>
              <label className="history-filter">
                練習の種類
                <select
                  aria-label="履歴の絞り込み"
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value as HistoryFilter)}
                >
                  <option value="all">すべて</option>
                  <option value="annual">年度別問題</option>
                  <option value="mix">ランダムミックス</option>
                  <option value="bookmark">ブックマーク練習</option>
                </select>
              </label>
              {items.length === 0 ? (
                <div className="empty-state">
                  <History size={42} />
                  <h2>まだ学習履歴がありません</h2>
                  <p>最初の問題セットを選んで、学習を始めましょう。</p>
                  <button className="primary" onClick={() => navigate("menu")}>
                    問題を選ぶ <ArrowRight size={17} />
                  </button>
                </div>
              ) : filteredHistoryItems.length === 0 ? (
                <div className="empty-state">
                  <History size={42} />
                  <h2>この種類の学習履歴はありません</h2>
                  <button onClick={() => setHistoryFilter("all")}>
                    すべての履歴を表示
                  </button>
                </div>
              ) : (
                <div className="history-list">
                  {filteredHistoryItems.map((item) => (
                    <article key={item.id} className="history-card">
                      <span className="subject-letter">
                        {item.exam.subject}
                      </span>
                      <div className="history-info">
                        <span className="history-status">
                          {statusLabel[item.session.status]} ·{" "}
                          {date(item.session.updatedAt)}
                        </span>
                        <h2>{item.title}</h2>
                        <p>
                          {item.session.entries.length}問 ·{" "}
                          {item.exam.mode === "study" ? "学習" : "時間付き練習"}{" "}
                          ·{" "}
                          {item.session.bindingMode === "generated_values"
                            ? "生成値を使用"
                            : "元データを使用"}
                        </p>
                      </div>
                      {item.result && (
                        <strong className="history-score">
                          {item.result.learningAccuracyPercent}
                          <small>%</small>
                        </strong>
                      )}
                      <div className="history-actions">
                        <button
                          className="primary"
                          disabled={item.purged || Boolean(busy)}
                          onClick={() =>
                            void reopen(
                              item.id,
                              item.result ? "result" : "exam",
                            )
                          }
                        >
                          {item.result
                            ? "結果・復習"
                            : item.session.status === "running" ||
                                item.session.status === "paused"
                              ? "続きから"
                              : "確認"}
                          <ChevronRight size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${item.title}の履歴を削除`}
                          onClick={() => {
                            setDeleteId(item.id);
                            setDialog("delete");
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          {view === "licenses" && (
            <>
              <button
                className="text-button back-link"
                onClick={() => navigate("menu")}
              >
                <ArrowLeft size={16} />
                メニューに戻る
              </button>
              <div className="eyebrow">CREDITS & LICENSES</div>
              <h1 ref={h1} tabIndex={-1}>
                ライセンス表記
              </h1>
              <p className="page-intro">
                コード、問題、描画ライブラリの出典と利用条件を確認できます。
              </p>
              <LicensePage bundle={bundle} />
            </>
          )}
        </main>
        {!isExam && !isReview && (
          <footer className="page-footer">
            <span>OpenCBT-FE-KihonJoho</span>
            <span>{screenNotice}</span>
            <div className="footer-theme">
              <ThemeToggle theme={theme} onChange={setTheme} />
            </div>
          </footer>
        )}
      </div>
      {dialog === "licenses" && run && (
        <Dialog title="ライセンス表記" onClose={() => setDialog(null)}>
          <LicensePage bundle={run.bundle} />
        </Dialog>
      )}
      {dialog === "finish" && run && (
        <Dialog title="解答を終了しますか" onClose={() => setDialog(null)}>
          <p>終了すると解答を確定し、学習結果を表示します。</p>
          <div className="finish-counts">
            <span>
              未解答{" "}
              <strong>
                {run.session.entries.filter((e) => !e.selectedChoiceId).length}
              </strong>
              問
            </span>
            <span>
              見直し{" "}
              <strong>
                {run.session.entries.filter((e) => e.reviewFlag).length}
              </strong>
              問
            </span>
          </div>
          {run.exam.mode === "practice" && (
            <p className="subtle">確認中も残り時間は進みます。</p>
          )}
          <div className="dialog-actions">
            <button autoFocus onClick={() => setDialog(null)}>
              解答に戻る
            </button>
            <button className="primary" onClick={finish}>
              終了して結果を見る <Check size={17} />
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "leave" && run && (
        <Dialog title="メニューへ戻りますか" onClose={() => setDialog(null)}>
          <p>
            {run.exam.mode === "study"
              ? "学習を一時停止して保存します。履歴から再開できます。"
              : "解答を保存してメニューへ戻ります。残り時間は継続し、期限を過ぎると時間切れになります。"}
          </p>
          <div className="dialog-actions">
            <button autoFocus onClick={() => setDialog(null)}>
              解答に戻る
            </button>
            <button
              className="primary"
              onClick={() => {
                run.exam.mode === "study" ? pause(true) : navigate("menu");
              }}
            >
              メニューへ戻る
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "delete" && (
        <Dialog
          title={
            deleteId ? "この履歴を削除しますか" : "すべての履歴を削除しますか"
          }
          onClose={() => setDialog(null)}
        >
          <p>
            解答、結果、保存した元データ、生成した問題と画像を削除します。元に戻せません。
          </p>
          <div className="dialog-actions">
            <button autoFocus onClick={() => setDialog(null)}>
              キャンセル
            </button>
            <button
              className="danger"
              onClick={() => void remove()}
              disabled={Boolean(busy)}
            >
              <Trash2 size={17} />
              削除する
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "list" && run && (
        <Dialog title="問題一覧" onClose={() => setDialog(null)}>
          <div className="list-legend">
            <span>
              <Square size={14} />
              未解答
            </span>
            <span>
              <Check size={14} />
              解答済み
            </span>
            <span>
              <Flag size={14} />
              見直し
            </span>
          </div>
          <label className="field-label">
            一覧の絞り込み
            <select
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value)}
            >
              <option value="all">すべて</option>
              <option value="unanswered">未解答</option>
              <option value="flagged">見直し</option>
            </select>
          </label>
          <p className="subtle">
            未解答
            {run.session.entries.filter((e) => !e.selectedChoiceId).length}問 ·
            見直し{run.session.entries.filter((e) => e.reviewFlag).length}問
          </p>
          <div className="question-grid">
            {run.session.entries.map((e, i) =>
              (listFilter === "unanswered" && e.selectedChoiceId) ||
              (listFilter === "flagged" && !e.reviewFlag) ? null : (
                <button
                  key={i}
                  disabled={!canNavigate}
                  className={`${currentIndex === i ? "current " : ""}${e.selectedChoiceId ? "answered " : ""}${e.reviewFlag ? "marked" : ""}`}
                  aria-current={currentIndex === i ? "true" : undefined}
                  onClick={() => {
                    isReview ? setReviewIndex(i) : move(i);
                    setDialog(null);
                  }}
                >
                  <strong>{i + 1}</strong>
                  <span>
                    {e.selectedChoiceId ? (
                      <Check size={14} />
                    ) : (
                      <Square size={14} />
                    )}{" "}
                    {e.selectedChoiceId ? "解答済" : "未解答"}
                  </span>
                  {e.reviewFlag && (
                    <span>
                      <Flag size={13} />
                      見直し
                    </span>
                  )}
                  <small>
                    {e.issuedContent.originKind === "official_reprint"
                      ? "公式"
                      : e.issuedContent.originKind === "official_adaptation"
                        ? "公式改変"
                        : "独自"}{" "}
                    · 改変{e.issuedContent.isModified ? "あり" : "なし"}
                  </small>
                  <small>
                    {e.issuedContent.bindingPerformed ? "生成値" : "元データ"}
                    {e.revealed ? " · 正答表示済" : ""}
                  </small>
                </button>
              ),
            )}
          </div>
        </Dialog>
      )}
      {dialog === "source" && run && q && (
        <Dialog title="出典・改変の詳細" onClose={() => setDialog(null)}>
          <p className="origin-pill">
            {questionName(q)} · 改変
            {entry?.issuedContent.isModified ? "あり" : "なし"}
          </p>
          <h3>問題の原資料</h3>
          {q.origin.sourceRefs.length ? (
            q.origin.sourceRefs.map((r, i) => {
              const s = run.bundle.sources.find((s) => s.id === r.sourceId)!;
              return (
                <p key={i}>
                  <a
                    href={safeUrl(s.url) + `#page=${r.locator.page ?? 1}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.title} · 問{r.locator.questionNumber} · p.
                    {r.locator.page}
                    <ExternalLink size={14} />
                  </a>
                  <small className="block">
                    {s.publisher} · 確認日 {s.checkedOn}
                  </small>
                </p>
              );
            })
          ) : (
            <p>
              特定の公式問題に依存せず、本プロジェクトが独立に作成した問題です。
            </p>
          )}
          <h3>出題時の扱い</h3>
          <p>
            {entry?.issuedContent.bindingPerformed
              ? "原問題の画像・記述から定義した構造と計算規則へ入力値をバインドし、作図・正答・解説を生成しています。出題経路に基づき改変ありとして記録します。"
              : "バインド前の元データをそのまま使用しています。作成時の改変表示を保持します。"}
          </p>
          {q.origin.changes.map((c, i) => (
            <div className="change-item" key={i}>
              <strong>{c.summary}</strong>
              <small className="block">
                {c.at} ·{" "}
                {
                  run.bundle.catalog.actors.find((a) => a.id === c.actorId)
                    ?.name
                }{" "}
                · {c.kind}
              </small>
              {(!entry?.issuedContent.bindingPerformed || revealed) && (
                <p>{c.details}</p>
              )}
              {revealed && c.answerDetails && <p>{c.answerDetails}</p>}
            </div>
          ))}
          {entry?.generatedInstanceId && revealed && (
            <details>
              <summary>生成記録を確認</summary>
              {(() => {
                const instance = run.instances.find(
                  (i) => i.id === entry.generatedInstanceId,
                )!;
                return (
                  <dl>
                    <dt>元問題</dt>
                    <dd>
                      {instance.baseQuestionRef.questionId}@
                      {instance.baseQuestionRef.revision}
                    </dd>
                    <dt>テンプレート</dt>
                    <dd>
                      {instance.templateRef.id}@{instance.templateRef.revision}
                    </dd>
                    <dt>生成器</dt>
                    <dd>
                      {instance.generatorRef.id}@{instance.generatorRef.version}
                    </dd>
                    <dt>入力値</dt>
                    <dd>{JSON.stringify(instance.parameters)}</dd>
                    <dt>乱数シード</dt>
                    <dd>{instance.seed}</dd>
                  </dl>
                );
              })()}
            </details>
          )}
          {entry?.generatedInstanceId && !revealed && (
            <p className="subtle">
              生成値・乱数シード・基準問題の詳細は、正答確認又は終了後に表示します。
            </p>
          )}
          {entry?.issuedContent.bindingPerformed && revealed && (
            <details>
              <summary>保持した元データを確認</summary>
              {(() => {
                const base = run.bundle.questions.find(
                  (b) =>
                    b.id === entry.questionRef.questionId &&
                    b.revision === entry.questionRef.revision,
                )!;
                return (
                  <>
                    {base.contexts.map((c) => (
                      <Content
                        key={c.id}
                        content={c.content}
                        bundle={run.bundle}
                        assetUrls={assetUrls}
                      />
                    ))}
                    <Content
                      content={base.prompt}
                      bundle={run.bundle}
                      assetUrls={assetUrls}
                    />
                    <h3>元の選択肢</h3>
                    {base.choices.map((c, i) => (
                      <div key={c.id}>
                        {labels[i]}
                        <Content
                          content={c.content}
                          bundle={run.bundle}
                          assetUrls={assetUrls}
                        />
                      </div>
                    ))}
                    {revealed && (
                      <>
                        <p>
                          元の正答：
                          {
                            labels[
                              base.choices.findIndex(
                                (c) => c.id === base.correctAnswer.choiceId,
                              )
                            ]
                          }
                        </p>
                        <Content
                          content={base.explanation}
                          bundle={run.bundle}
                          assetUrls={assetUrls}
                        />
                      </>
                    )}
                  </>
                );
              })()}
            </details>
          )}
          <h3>素材ごとの条件</h3>
          <AttributionLine content={q.prompt} bundle={run.bundle} />
          {q.prompt.attribution.rightsRefs.map((id) => {
            const rights = run.bundle.rights.find((r) => r.id === id)!;
            return (
              <details key={id}>
                <summary>{rights.attributionText}</summary>
                <p>権利者：{rights.holders.join("・")}</p>
                <p>適用範囲：{rights.scope}</p>
                <p>
                  利用根拠：{rights.basis} · {rights.licenseId}
                </p>
                <p>{rights.thirdParty.notes}</p>
              </details>
            );
          })}
          {revealed && (
            <>
              <h3>正答・解説の出典</h3>
              <AttributionLine
                content={{
                  attribution: q.correctAnswer.attribution,
                  blocks: [],
                }}
                bundle={run.bundle}
              />
              <AttributionLine content={q.explanation} bundle={run.bundle} />
            </>
          )}
          <p className="subtle">
            独自解説・復習案内を公式作成の解説とは扱いません。
          </p>
        </Dialog>
      )}
    </div>
  );
}

function Stat({
  icon,
  number,
  label,
}: {
  icon: ReactNode;
  number: number | string;
  label: string;
}) {
  return (
    <div>
      {icon}
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}
function questionName(q: Question) {
  const r = q.origin.sourceRefs[0];
  return r
    ? `${r.locator.year}年度 科目${q.subject} 問${r.locator.questionNumber}`
    : "独自問題";
}
function useAssetUrls(assets: Record<string, Blob> | undefined) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    const u = Object.fromEntries(
      Object.entries(assets ?? {}).map(([id, blob]) => [
        id,
        URL.createObjectURL(blob),
      ]),
    );
    setUrls(u);
    return () => Object.values(u).forEach(URL.revokeObjectURL);
  }, [assets]);
  return urls;
}
function LicensePage({ bundle }: { bundle?: Bundle }) {
  const [notices, setNotices] = useState<(LicenseNotice & { text: string })[]>(
      [],
    ),
    [failure, setFailure] = useState(false);
  useEffect(() => {
    void fetch(
      new URL(
        `${import.meta.env.BASE_URL}notices/index.json`,
        location.href.split("#")[0],
      ),
    )
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(async (rows) => {
        const all = await Promise.all(
          (rows as LicenseNotice[]).map(async (r) => {
            if (!/^[a-zA-Z0-9.-]+\.txt$/.test(r.file))
              throw Error("LICENSE_PATH");
            safeUrl(r.sourceUrl);
            const res = await fetch(
              new URL(
                `${import.meta.env.BASE_URL}notices/${r.file}`,
                location.href.split("#")[0],
              ),
            );
            if (!res.ok) throw Error();
            return { ...r, text: await res.text() };
          }),
        );
        setNotices(all);
      })
      .catch(() => setFailure(true));
  }, []);
  return (
    <div className="license-sections">
      <section>
        <h2>本プロジェクト</h2>
        <p>
          OpenCBT-FE-KihonJohoは非公式の学習・操作練習ソフトウェアです。IPA・プロメトリック・試験運営事業者とは関係ありません。
        </p>
        <p>
          独自コードはMIT、独立に作成した問題・解説・図のデータはCC0-1.0。IPAから取り込んだ問題・正答・画像、依存ライブラリにはそれぞれの利用条件を適用します。
        </p>
      </section>
      <section>
        <h2>IPA公開問題</h2>
        <p>
          出典：独立行政法人情報処理推進機構（IPA）、2023〜2026年度
          基本情報技術者試験 科目A・科目B 公開問題／解答例。
        </p>
        <p>
          ©2023–2026
          独立行政法人情報処理推進機構。会社名・製品名は各社の商標又は登録商標です。問題単位の出典・図表の条件・改変表示は、解答画面と復習画面でも表示します。
        </p>
        <p>
          IPAは著作権を保持しています。公表問題の教育目的での利用条件に従い、年度・試験区分・科目・問番号等の出典と、改変した場合はその旨を表示します。第三者の素材には別の利用条件を適用します。
        </p>
        <a
          href="https://www.ipa.go.jp/shiken/faq.html"
          target="_blank"
          rel="noreferrer"
        >
          利用条件（FAQ「その他」）
          <ExternalLink size={15} />
        </a>
        <p>
          2025年度科目B問6はJIS文言の条件未確認のため配布していません。詳細解説は一部を除き未収録です。
        </p>
        {bundle && (
          <details>
            <summary>問題・独自記述の適用範囲・確認内容</summary>
            {bundle.rights.map((r) => (
              <article key={r.id}>
                <h3>{r.attributionText}</h3>
                <p>
                  {r.licenseId} · 権利者：{r.holders.join("、")} · 確認日：
                  {r.checkedOn}
                </p>
                <p>{r.scope}</p>
                <p>{r.thirdParty.notes}</p>
                <p>{r.assessmentNotes}</p>
                {r.evidence.map((e, i) => {
                  const source = bundle.sources.find(
                    (s) => s.id === e.sourceId,
                  );
                  return source ? (
                    <p key={i}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>{" "}
                      · {e.locator.section}
                    </p>
                  ) : null;
                })}
              </article>
            ))}
          </details>
        )}
      </section>
      <section>
        <h2>数式描画・アイコン・ライブラリ</h2>
        <p>
          ブランドロゴは独自のベクタ、操作アイコンはLucide。数式はKaTeX
          0.19.0を固定URL・SRI付きでjsDelivrから読み込みます。数式を使うセットの準備時に外部CDNへ通信し、IPアドレス等が送信されます。学習記録・解答は送信しません。
        </p>
        <p>
          LucideのISCとFeather由来アイコンのMITを含む原文通知、React等の通知を配布物に同梱しています。以下はCDNに依存しないローカルの全文です。
        </p>
        <p>
          CDNのサービス条件：
          <a
            href="https://www.jsdelivr.com/terms/terms-of-use"
            target="_blank"
            rel="noreferrer"
          >
            jsDelivr利用規約
          </a>{" "}
          ·{" "}
          <a
            href="https://www.jsdelivr.com/terms/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            プライバシーポリシー
          </a>
        </p>
        {failure && (
          <p role="alert">
            通知の読込みに失敗しました。再読込みするか、配布物のnoticesを確認してください。
          </p>
        )}
        {notices.map((n) => (
          <details key={n.file}>
            <summary>{n.title}</summary>
            <p>{n.scope}</p>
            <p>
              {n.licenseId}
              {n.version
                ? ` · ${n.packageName ? `${n.packageName} ` : ""}${n.version}`
                : ""} · 確認日：
              {n.checkedOn}
            </p>
            <p>
              <a href={n.sourceUrl} target="_blank" rel="noreferrer">
                条件・配布物の原資料
              </a>
            </p>
            <pre className="license-text">{n.text}</pre>
          </details>
        ))}
        {!notices.length && !failure && (
          <p>ライセンス通知を読み込んでいます。</p>
        )}
      </section>
    </div>
  );
}
