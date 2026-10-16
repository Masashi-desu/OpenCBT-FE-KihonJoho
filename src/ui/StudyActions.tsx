import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

export function StudyActions({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = () => {
    setOpen(false);
    toggle.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    actions.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const viewport = window.matchMedia("(max-width: 800px)");
    const resize = () => setOpen(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    viewport.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      viewport.removeEventListener("change", resize);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="toolbar-tools"
      role="group"
      aria-label="学習・操作補助"
      data-open={open || undefined}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={toggle}
        className="toolbar-menu-toggle icon-button"
        aria-label={open ? "学習メニューを閉じる" : "学習メニューを開く"}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <div
        ref={actions}
        id={id}
        className="toolbar-study-actions"
        onClick={(event) => {
          if (
            open && event.target instanceof Element &&
            event.target.closest("button:not(:disabled)")
          ) close();
        }}
      >
        {children}
      </div>
    </div>
  );
}
