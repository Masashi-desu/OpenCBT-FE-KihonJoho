import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Hand, Minus, PanelLeft, Plus } from "lucide-react";
import type { Bundle, Content as QuestionContent, Question } from "../core/types";
import { Content } from "./Content";

const zoomSteps = [50, 75, 100, 125, 150, 200, 300, 400];
const zoomModes = [
  ["auto", "自動ズーム"],
  ["actual", "実際のサイズ"],
  ["page", "ページのサイズに合わせる"],
  ["width", "幅に合わせる"],
];
type MaterialPage = {
  id: string;
  label: string;
  content: QuestionContent;
  context?: Question["contexts"][number];
};
type PageBounds = { top: number; bottom: number };

export function visibleMaterialPage(
  pages: readonly (PageBounds | null)[],
  viewport: PageBounds,
  current: number,
  leadingInset: number,
): number {
  // The last page can be fully visible below the top edge when scrolling clamps
  // at the end. Keep that page selected instead of fitting the preceding page.
  const fullyVisible = pages.flatMap((page, index) =>
    page && page.bottom > page.top &&
    page.top >= viewport.top - 1 && page.bottom <= viewport.bottom + 1
      ? [index]
      : [],
  );
  if (fullyVisible.includes(current)) return current;
  if (fullyVisible.length) return fullyVisible[0];
  let index = 0;
  pages.forEach((page, i) => {
    if (page && page.top <= viewport.top + leadingInset) index = i;
  });
  return index;
}

export function materialPages(question?: Question): MaterialPage[] {
  if (!question) return [];
  const pages = question.contextRefs.map((id) => {
    const context = question.contexts.find((item) => item.id === id)!;
    return { id, label: context.title, content: context.content, context };
  });
  const promptPages: MaterialPage[] = [];
  for (const block of question.prompt.blocks) {
    if (!promptPages.length || block.type === "image")
      promptPages.push({
        id: `prompt-${promptPages.length}`,
        label: block.type === "image" ? block.caption : "問題本文",
        content: { ...question.prompt, blocks: [] },
      });
    promptPages.at(-1)!.content.blocks.push(block);
  }
  return [...pages, ...promptPages];
}

export function useMaterialViewer(question: Question | undefined, contentKey: string) {
  const pages = useMemo(() => materialPages(question), [question]);
  const [listOpen, setListOpen] = useState(false);
  const [hand, setHand] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [zoomMode, setZoomMode] = useState("auto");
  const [scale, setScale] = useState(1);
  const [baseWidth, setBaseWidth] = useState(720);
  const [activePage, setActivePage] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pageElements = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
    scrollers: HTMLElement[];
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  useLayoutEffect(() => {
    viewport.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setActivePage(0);
    drag.current = null;
    setDragging(false);
    suppressClick.current = false;
    pageElements.current.length = pages.length;
  }, [contentKey, pages.length]);

  useLayoutEffect(() => {
    const container = viewport.current;
    const body = content.current;
    if (!container || !body) return;
    const update = () => {
      const availableWidth = Math.max(1, container.clientWidth);
      const availableHeight = Math.max(1, container.clientHeight - 44);
      const hasOriginalPage = pages.some((page) =>
        page.content.blocks.some((block) => block.type === "image"),
      );
      // A4 at 96 CSS pixels per inch. Text materials reflow in automatic mode.
      const width = hasOriginalPage
        ? 794
        : zoomMode === "auto"
          ? Math.min(720, availableWidth)
          : 720;
      setBaseWidth(width);
      const widthScale = availableWidth / width;
      const page = pageElements.current[activePage];
      const pageHeight = (page?.offsetHeight || 1) + 44;
      const nextScale =
        zoomMode === "auto"
          ? Math.min(1, widthScale)
          : zoomMode === "actual"
            ? 1
            : zoomMode === "width"
              ? widthScale
              : zoomMode === "page"
                ? Math.min(widthScale, availableHeight / pageHeight)
                : Number(zoomMode) / 100;
      setScale(Math.max(0.01, nextScale));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(body);
    return () => observer.disconnect();
  }, [pages, zoomMode, activePage, contentKey]);

  useLayoutEffect(() => {
    if (zoomMode !== "page") return;
    const container = viewport.current;
    const page = pageElements.current[activePage];
    if (container && page)
      container.scrollTo({
        top: page.getBoundingClientRect().top - container.getBoundingClientRect().top +
          container.scrollTop - 22 * scale,
        left: 0,
        behavior: "instant",
      });
  }, [zoomMode, scale, baseWidth, activePage, contentKey]);

  const goPage = (index: number) => {
    const container = viewport.current;
    const page = pageElements.current[index];
    if (!container || !page) return;
    const top =
      page.getBoundingClientRect().top - container.getBoundingClientRect().top +
      container.scrollTop - 22 * scale;
    container.scrollTo({ top, left: 0, behavior: "instant" });
    setActivePage(index);
  };
  const onScroll = () => {
    const container = viewport.current;
    if (!container) return;
    const top = container.getBoundingClientRect().top;
    setActivePage(visibleMaterialPage(
      pageElements.current.map((page) => page?.getBoundingClientRect() ?? null),
      { top, bottom: top + container.clientHeight },
      activePage,
      24 * scale,
    ));
  };
  const stepZoom = (direction: 1 | -1) => {
    const percent = Math.round(scale * 100);
    const next = direction === 1
      ? zoomSteps.find((value) => value > percent) ?? 400
      : [...zoomSteps].reverse().find((value) => value < percent) ?? 50;
    setZoomMode(String(next));
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    suppressClick.current = false;
    if (!hand || event.button !== 0 || !event.isPrimary) return;
    const target = event.target as HTMLElement;
    if (target.closest("a,button,input,select,textarea,summary")) return;
    const scrollers: HTMLElement[] = [];
    for (let node: HTMLElement | null = target; node; node = node.parentElement) {
      if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
        const style = getComputedStyle(node);
        if (/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`))
          scrollers.push(node);
      }
      if (node === event.currentTarget) break;
    }
    drag.current = {
      pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      originX: event.clientX, originY: event.clientY, scrollers, moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    setDragging(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    let dx = state.x - event.clientX, dy = state.y - event.clientY;
    state.x = event.clientX;
    state.y = event.clientY;
    if (Math.hypot(state.originX - state.x, state.originY - state.y) > 4)
      state.moved = true;
    // Consume each axis in the nearest scrollable figure, then the outer pane.
    for (const element of state.scrollers) {
      const left = element.scrollLeft, top = element.scrollTop;
      const elementScale = element === viewport.current ? 1 : scale;
      element.scrollLeft += dx / elementScale;
      element.scrollTop += dy / elementScale;
      dx -= (element.scrollLeft - left) * elementScale;
      dy -= (element.scrollTop - top) * elementScale;
    }
    event.preventDefault();
  };
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    suppressClick.current = drag.current.moved;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return {
    pages, listOpen, setListOpen, hand, setHand, dragging, zoomMode, setZoomMode,
    scale, baseWidth, activePage, viewport, content, pageElements, goPage,
    onScroll, stepZoom, onPointerDown, onPointerMove, stopDrag, suppressClick,
  };
}

type Viewer = ReturnType<typeof useMaterialViewer>;

export function MaterialToolbar({ viewer }: { viewer: Viewer }) {
  return (
    <div className="material-toolbar" role="group" aria-label="問題資料の表示操作">
      <button
        aria-label="問題資料の一覧" title="問題資料の一覧"
        aria-pressed={viewer.listOpen} aria-expanded={viewer.listOpen} aria-controls="material-page-list"
        onClick={() => viewer.setListOpen(!viewer.listOpen)}
      ><PanelLeft size={19} /></button>
      <button
        aria-label="ドラッグしてスクロール" title="ドラッグしてスクロール"
        aria-pressed={viewer.hand} onClick={() => viewer.setHand(!viewer.hand)}
      ><Hand size={19} /></button>
      <button
        aria-label="問題資料を拡大" title="拡大"
        disabled={viewer.scale >= 4} onClick={() => viewer.stepZoom(1)}
      ><Plus size={20} strokeWidth={3} /></button>
      <button
        aria-label="問題資料を縮小" title="縮小"
        disabled={viewer.scale <= 0.5} onClick={() => viewer.stepZoom(-1)}
      ><Minus size={20} strokeWidth={3} /></button>
      <select aria-label="問題資料のズーム" value={viewer.zoomMode}
        onChange={(event) => viewer.setZoomMode(event.target.value)}>
        {zoomModes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        {zoomSteps.map((percent) => <option key={percent} value={percent}>{percent}%</option>)}
      </select>
    </div>
  );
}

export function MaterialPane({ viewer, bundle, assetUrls }: {
  viewer: Viewer; bundle: Bundle; assetUrls: Record<string, string>;
}) {
  return (
    <section className="reading-pane" aria-label="問題資料">
      <nav id="material-page-list" className="material-page-list"
        aria-label="問題資料のページ一覧" hidden={!viewer.listOpen}>
        {viewer.pages.map((page, index) => {
          const image = page.content.blocks.find((block) => block.type === "image");
          const preview = page.content.blocks.flatMap((block) =>
            block.type === "paragraph" || block.type === "heading" ? [block.text] : [],
          ).join(" ").slice(0, 100);
          return (
            <button key={page.id} aria-label={`${index + 1}ページ：${page.label}`}
              aria-current={index === viewer.activePage ? "page" : undefined}
              onClick={() => viewer.goPage(index)}>
              <span className="material-thumbnail" aria-hidden="true">
                {image ? <img src={assetUrls[image.assetId]} alt="" draggable={false} />
                  : <span>{preview || page.label}</span>}
              </span>
              <span>{index + 1}</span>
            </button>
          );
        })}
      </nav>
      <div ref={viewer.viewport}
        tabIndex={0} aria-label="問題資料のスクロール領域"
        className={`reading-scroll${viewer.hand ? " hand-scroll" : ""}${viewer.dragging ? " dragging" : ""}`}
        onScroll={viewer.onScroll} onPointerDown={viewer.onPointerDown}
        onPointerMove={viewer.onPointerMove} onPointerUp={viewer.stopDrag}
        onPointerCancel={viewer.stopDrag} onLostPointerCapture={viewer.stopDrag}
        onDragStart={(event) => { if (viewer.hand) event.preventDefault(); }}
        onClickCapture={(event) => {
          if (viewer.suppressClick.current) {
            event.preventDefault(); event.stopPropagation(); viewer.suppressClick.current = false;
          }
        }}>
        <div ref={viewer.content} className="reading-content"
          style={{ width: viewer.baseWidth, zoom: viewer.scale, "--image-scale": 1 } as React.CSSProperties}>
          {viewer.pages.map((page, index) => (
            <div className={`material-page${page.context ? " material-context" : ""}`} key={page.id}
              ref={(element) => { viewer.pageElements.current[index] = element; }}>
              {page.context?.presentation === "text_figure" ? (
                <div className="text-figure-material">
                  <figure className="text-figure" aria-label={page.context.title}>
                    <div className="text-figure-body">
                      <Content content={page.content} bundle={bundle} assetUrls={assetUrls} showAttribution={false} />
                    </div>
                    <figcaption>{page.context.title}</figcaption>
                  </figure>
                </div>
              ) : (
                <>
                  {page.context && <h3>{page.context.title}</h3>}
                  <Content content={page.content} bundle={bundle} assetUrls={assetUrls} showAttribution={false} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
