import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Entry } from "../core/types";

export function QuestionRail({
  entries,
  currentIndex,
  disabled,
  expandable = false,
  onSelect,
}: {
  entries: Entry[];
  currentIndex: number;
  disabled: boolean;
  expandable?: boolean;
  onSelect: (index: number) => void;
}) {
  const rail = useRef<HTMLElement>(null);
  const [layout, setLayout] = useState({
    height: 36,
    gap: 2,
    fontSize: 14,
    maxHeight: 0,
  });
  useLayoutEffect(() => {
    const element = rail.current;
    const workspace = element?.parentElement;
    if (!workspace) return;
    const stackedPanes = window.matchMedia(
      "(max-width: 800px), (max-width: 1100px) and (max-height: 480px)",
    );
    const fitNumbers = () => {
      const count = entries.length;
      if (!count) return;
      const maxHeight = stackedPanes.matches
        ? window.innerHeight * 0.6
        : workspace.clientHeight;
      const availableHeight = Math.max(
        0,
        (stackedPanes.matches && !expandable
          ? Math.min(workspace.clientHeight, maxHeight)
          : maxHeight) - 16,
      );
      const gap = Math.min(2, availableHeight / count / 10);
      const height = Math.min(
        36,
        Math.max(expandable ? 28 : 0, (availableHeight - (count - 1) * gap) / count),
      );
      const fontSize = Math.min(14, height * 0.75);
      setLayout((previous) =>
        previous.height === height &&
        previous.gap === gap &&
        previous.fontSize === fontSize &&
        previous.maxHeight === maxHeight
          ? previous
          : { height, gap, fontSize, maxHeight },
      );
    };
    fitNumbers();
    const observer = new ResizeObserver(fitNumbers);
    observer.observe(workspace);
    window.addEventListener("resize", fitNumbers);
    stackedPanes.addEventListener("change", fitNumbers);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitNumbers);
      stackedPanes.removeEventListener("change", fitNumbers);
    };
  }, [entries.length, expandable]);
  useLayoutEffect(() => {
    const element = rail.current,
      current = element?.querySelector('[aria-current="step"]');
    if (!expandable || !element || !current) return;
    const viewport = element.getBoundingClientRect(),
      button = current.getBoundingClientRect();
    if (button.top < viewport.top + 8)
      element.scrollTop += button.top - viewport.top - 8;
    else if (button.bottom > viewport.bottom - 8)
      element.scrollTop += button.bottom - viewport.bottom + 8;
  }, [currentIndex, entries.length, expandable, layout]);

  return (
    <nav
      className={`question-rail${expandable ? " expandable" : ""}`}
      aria-label="問題番号"
      ref={rail}
      style={
        {
          "--rail-height": `${layout.height}px`,
          "--rail-font": `${layout.fontSize}px`,
          rowGap: `${layout.gap}px`,
          gridTemplateRows: `repeat(${entries.length}, var(--rail-height))`,
          maxHeight: expandable && layout.maxHeight ? `${layout.maxHeight}px` : undefined,
        } as CSSProperties
      }
    >
      {entries.map((entry, index) => {
        const answered = Boolean(entry.selectedChoiceId);
        const current = index === currentIndex;
        const label = `問題 ${index + 1}、${answered ? "解答済み" : "未解答"}${entry.reviewFlag ? "、見直し" : ""}`;
        return (
          <button
            key={index}
            type="button"
            className={`question-rail-number ${answered ? "answered" : "unanswered"}${current ? " current" : ""}`}
            aria-label={label}
            title={label}
            aria-current={current ? "step" : undefined}
            disabled={disabled}
            onClick={() => onSelect(index)}
          >
            {index + 1}
          </button>
        );
      })}
    </nav>
  );
}
