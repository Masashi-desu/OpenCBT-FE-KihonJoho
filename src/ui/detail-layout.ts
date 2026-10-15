/** Measure natural content, never the viewport's scrollHeight (which cannot shrink). */
export function observeDetailHeight(doc: Document, report: (height: number) => void) {
  const view = doc.defaultView!;
  let frame = 0, previous = 0, disposed = false;
  const update = () => {
    if (disposed) return;
    const bottom = doc.body.getBoundingClientRect().bottom + view.scrollY;
    const margin = Number.parseFloat(view.getComputedStyle(doc.body).marginBottom) || 0;
    const height = Math.max(1, Math.ceil(bottom + margin));
    if (height !== previous) { previous = height; report(height); }
  };
  const observer = new view.ResizeObserver(() => {
    if (!disposed && !frame) frame = view.requestAnimationFrame(() => { frame = 0; update(); });
  });
  observer.observe(doc.body, { box: "border-box" });
  update();
  return {
    update,
    dispose() { disposed = true; observer.disconnect(); view.cancelAnimationFrame(frame); },
  };
}
