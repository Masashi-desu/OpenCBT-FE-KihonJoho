type Axis = "x" | "y";
type Box = { left: number; top: number; right: number; bottom: number };
type Bar = {
  track: HTMLDivElement;
  thumb: HTMLDivElement;
  travel: number;
  range: number;
};
type Region = { element: HTMLElement; x: Bar; y: Bar };
const layerClass = "overlay-scrollbar-layer";
const thickness = 12;
const inset = 2;

/** One overlay for every native scroll region, without wrapping or resizing content. */
export function installOverlayScrollbars() {
  const root = document.documentElement;
  const regions = new Map<HTMLElement, Region>();
  const layers = new Map<HTMLElement, HTMLDivElement>();
  const observed = new Set<Element>();
  const transitions = new Map<Element, Set<string>>();
  let frame = 0;
  let needsScan = true;
  let disposed = false;
  let drag: { bar: Bar; element: HTMLElement; axis: Axis; pointer: number;
    origin: number; offset: number } | null = null;

  function schedule(scan = false) {
    needsScan ||= scan;
    if (!disposed && !frame) frame = requestAnimationFrame(update);
  }
  const resize = new ResizeObserver(() => schedule(true));
  function isOverlay(node: Node) {
    return (node instanceof Element ? node : node.parentElement)?.closest(`.${layerClass}`);
  }
  function layer(host: HTMLElement) {
    let result = layers.get(host);
    if (!result) {
      result = document.createElement("div");
      result.className = layerClass;
      result.setAttribute("aria-hidden", "true");
      host.append(result);
      layers.set(host, result);
    }
    return result;
  }
  function offset(element: HTMLElement, axis: Axis) {
    return axis === "y" ? element.scrollTop : element.scrollLeft;
  }
  function allowsScroll(element: HTMLElement, axis: Axis, style = getComputedStyle(element)) {
    const property = axis === "x" ? "overflowX" : "overflowY";
    const overflow = style[property];
    if (element === document.scrollingElement) {
      // The body's overflow is propagated to the viewport when html uses visible.
      const effective = overflow === "visible" ? getComputedStyle(document.body)[property] : overflow;
      return effective !== "hidden" && effective !== "clip";
    }
    return /^(auto|scroll)$/.test(overflow);
  }
  function scroll(element: HTMLElement, axis: Axis, value: number) {
    element.scrollTo({
      [axis === "y" ? "top" : "left"]: value,
      behavior: "instant",
    });
    schedule();
  }
  function makeBar(element: HTMLElement, axis: Axis): Bar {
    const track = document.createElement("div");
    const thumb = document.createElement("div");
    track.className = `overlay-scrollbar overlay-scrollbar-${axis === "y" ? "vertical" : "horizontal"}`;
    thumb.className = "overlay-scrollbar-thumb";
    track.append(thumb);
    const bar = { track, thumb, travel: 0, range: 0 };
    track.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || bar.travel <= 0) return;
      event.preventDefault();
      event.stopPropagation();
      const coordinate = axis === "y" ? event.clientY : event.clientX;
      if (event.target !== thumb) {
        const bounds = track.getBoundingClientRect();
        const size = axis === "y" ? thumb.offsetHeight : thumb.offsetWidth;
        const start = axis === "y" ? bounds.top : bounds.left;
        scroll(element, axis, (coordinate - start - size / 2) / bar.travel * bar.range);
      }
      if (element.hasAttribute("tabindex")) element.focus({ preventScroll: true });
      drag = { bar, element, axis, pointer: event.pointerId,
        origin: coordinate, offset: offset(element, axis) };
      track.classList.add("dragging");
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener("pointermove", (event) => {
      if (!drag || drag.bar !== bar || event.pointerId !== drag.pointer) return;
      const coordinate = axis === "y" ? event.clientY : event.clientX;
      scroll(element, axis, drag.offset + (coordinate - drag.origin) / bar.travel * bar.range);
    });
    const end = () => {
      if (drag?.bar === bar) drag = null;
      track.classList.remove("dragging");
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    track.addEventListener("lostpointercapture", end);
    // An overlaid track must not steal wheel/trackpad scrolling from its content.
    track.addEventListener("wheel", (event) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      let dx = event.deltaX, dy = event.deltaY;
      if (event.deltaMode === 1) { dx *= 16; dy *= 16; }
      if (event.deltaMode === 2) { dx *= element.clientWidth; dy *= element.clientHeight; }
      if (event.shiftKey && !dx) { dx = dy; dy = 0; }
      for (let node: HTMLElement | null = element; node; node = node.parentElement) {
        if (!regions.has(node)) continue;
        const left = node.scrollLeft, top = node.scrollTop;
        const style = getComputedStyle(node);
        node.scrollBy({
          left: allowsScroll(node, "x", style) ? dx : 0,
          top: allowsScroll(node, "y", style) ? dy : 0,
          behavior: "instant",
        });
        dx -= node.scrollLeft - left;
        dy -= node.scrollTop - top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) break;
        if (style.overscrollBehavior === "contain" || style.overscrollBehavior === "none") break;
      }
    }, { passive: false });
    return bar;
  }
  function remove(region: Region) {
    if (drag?.element === region.element) drag = null;
    region.x.track.remove();
    region.y.track.remove();
    regions.delete(region.element);
  }
  function scan() {
    const candidates = new Set<HTMLElement>([document.scrollingElement as HTMLElement]);
    for (const element of document.body.querySelectorAll("*")) {
      if (!(element instanceof HTMLElement) || isOverlay(element) || element === document.body) continue;
      const style = getComputedStyle(element);
      if (/^(auto|scroll)$/.test(style.overflowX) || /^(auto|scroll)$/.test(style.overflowY))
        candidates.add(element);
    }
    for (const region of regions.values()) {
      if (!candidates.has(region.element)) remove(region);
    }
    const nextObserved = new Set<Element>([document.body]);
    for (const element of candidates) {
      if (!regions.has(element)) regions.set(element, {
        element, x: makeBar(element, "x"), y: makeBar(element, "y"),
      });
      nextObserved.add(element);
      for (const child of element.children) {
        if (!isOverlay(child)) nextObserved.add(child);
      }
    }
    // Keep ancestors first even when a responsive change adds a new parent region.
    const ordered = [...candidates].map((element) => regions.get(element)!);
    regions.clear();
    for (const region of ordered) regions.set(region.element, region);
    for (const element of observed) {
      if (!nextObserved.has(element)) { resize.unobserve(element); observed.delete(element); }
    }
    for (const element of nextObserved) {
      if (!observed.has(element)) { resize.observe(element); observed.add(element); }
    }
  }
  function clientBox(element: HTMLElement): Box {
    const rect = element.getBoundingClientRect();
    const sx = element.offsetWidth ? rect.width / element.offsetWidth : 1;
    const sy = element.offsetHeight ? rect.height / element.offsetHeight : 1;
    const left = rect.left + element.clientLeft * sx;
    const top = rect.top + element.clientTop * sy;
    return { left, top, right: left + element.clientWidth * sx,
      bottom: top + element.clientHeight * sy };
  }
  function paint(bar: Bar, axis: Axis, box: Box, visible: number,
    total: number, position: number, crossing: boolean) {
    const length = (axis === "y" ? box.bottom - box.top : box.right - box.left) -
      inset * 2 - (crossing ? thickness : 0);
    bar.range = Math.max(0, total - visible);
    bar.track.hidden = bar.range <= 1 || length <= thickness;
    if (bar.track.hidden) return;
    const size = Math.min(length, Math.max(24, length * visible / total));
    bar.travel = length - size;
    const start = Math.max(0, Math.min(1, position / bar.range)) * bar.travel;
    Object.assign(bar.track.style, {
      left: `${axis === "y" ? box.right - thickness - inset : box.left + inset}px`,
      top: `${axis === "y" ? box.top + inset : box.bottom - thickness - inset}px`,
      width: `${axis === "y" ? thickness : length}px`,
      height: `${axis === "y" ? length : thickness}px`,
    });
    Object.assign(bar.thumb.style, axis === "y" ?
      { height: `${size}px`, transform: `translateY(${start}px)` } :
      { width: `${size}px`, transform: `translateX(${start}px)` });
  }
  function update() {
    frame = 0;
    if (needsScan) { needsScan = false; scan(); }
    const viewport = window.visualViewport;
    const bounds: Box = { left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0,
      right: (viewport?.offsetLeft ?? 0) + (viewport?.width ?? root.clientWidth),
      bottom: (viewport?.offsetTop ?? 0) + (viewport?.height ?? root.clientHeight) };
    const modal = [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")].at(-1);
    for (const { element, x, y } of regions.values()) {
      const dialog = element.closest<HTMLDialogElement>("dialog[open]");
      const host = dialog ?? document.body;
      if (x.track.parentElement !== layers.get(host)) layer(host).append(x.track, y.track);
      const style = getComputedStyle(element);
      if (!element.getClientRects().length || style.visibility !== "visible" ||
          style.opacity === "0" || (modal && !modal.contains(element))) {
        x.track.hidden = y.track.hidden = true;
        continue;
      }
      const box = element === document.scrollingElement ? { ...bounds } : clientBox(element);
      let invisible = false;
      for (let parent = element.parentElement; parent && parent !== document.body;
        parent = parent.parentElement) {
        const style = getComputedStyle(parent), clip = clientBox(parent);
        if (style.visibility !== "visible" || style.opacity === "0") { invisible = true; break; }
        if (/^(auto|scroll|hidden|clip)$/.test(style.overflowX)) {
          box.left = Math.max(box.left, clip.left); box.right = Math.min(box.right, clip.right);
        }
        if (/^(auto|scroll|hidden|clip)$/.test(style.overflowY)) {
          box.top = Math.max(box.top, clip.top); box.bottom = Math.min(box.bottom, clip.bottom);
        }
      }
      box.left = Math.max(box.left, bounds.left); box.right = Math.min(box.right, bounds.right);
      box.top = Math.max(box.top, bounds.top); box.bottom = Math.min(box.bottom, bounds.bottom);
      // Nested panes can share the page's edge on mobile. Separate their overlays
      // without reserving any space inside either scroll container.
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        const ancestor = regions.get(parent);
        if (!ancestor) continue;
        const right = Number.parseFloat(ancestor.y.track.style.left);
        const bottom = Number.parseFloat(ancestor.x.track.style.top);
        if (!ancestor.y.track.hidden && Math.abs(box.right - right - thickness - inset) < thickness)
          box.right = right - inset;
        if (!ancestor.x.track.hidden && Math.abs(box.bottom - bottom - thickness - inset) < thickness)
          box.bottom = bottom - inset;
      }
      if (invisible || box.right - box.left <= thickness || box.bottom - box.top <= thickness) {
        x.track.hidden = y.track.hidden = true;
        continue;
      }
      const horizontal = element.scrollWidth > element.clientWidth + 1 &&
        allowsScroll(element, "x", style);
      const vertical = element.scrollHeight > element.clientHeight + 1 &&
        allowsScroll(element, "y", style);
      paint(x, "x", box, element.clientWidth, horizontal ? element.scrollWidth : element.clientWidth,
        element.scrollLeft, vertical);
      paint(y, "y", box, element.clientHeight, vertical ? element.scrollHeight : element.clientHeight,
        element.scrollTop, horizontal);
    }
    for (const [host, overlay] of layers) {
      if (!host.isConnected || !overlay.childElementCount) { overlay.remove(); layers.delete(host); }
    }
    for (const element of transitions.keys()) {
      if (!element.isConnected || !element.getAnimations().some((animation) => animation.playState === "running"))
        transitions.delete(element);
    }
    if (transitions.size) schedule();
  }
  const mutation = new MutationObserver((records) => {
    if (records.some((record) => !isOverlay(record.target) &&
      (record.type !== "childList" || [...record.addedNodes, ...record.removedNodes]
        .some((node) => !isOverlay(node))))) schedule(true);
  });
  const onScroll = () => schedule();
  const onResize = () => schedule(true);
  const onTransition = (event: TransitionEvent) => {
    if (!(event.target instanceof Element) || isOverlay(event.target) ||
        !/^(transform|translate|scale|rotate|width|height|min-|max-|left|right|top|bottom|inset|margin|padding|flex|grid|visibility|opacity)/.test(event.propertyName)) return;
    if (event.type === "transitionrun") {
      const properties = transitions.get(event.target) ?? new Set<string>();
      properties.add(event.propertyName);
      transitions.set(event.target, properties);
    } else {
      const properties = transitions.get(event.target);
      properties?.delete(event.propertyName);
      if (!properties?.size) transitions.delete(event.target);
    }
    schedule(true);
  };
  root.setAttribute("data-overlay-scrollbars", "");
  mutation.observe(document.body, { subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ["class", "style", "hidden", "open"] });
  document.addEventListener("scroll", onScroll, true);
  document.addEventListener("load", onResize, true);
  document.addEventListener("transitionrun", onTransition, true);
  document.addEventListener("transitionend", onTransition, true);
  document.addEventListener("transitioncancel", onTransition, true);
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("scroll", onScroll);
  document.fonts.addEventListener("loadingdone", onResize);
  schedule(true);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    mutation.disconnect(); resize.disconnect();
    document.removeEventListener("scroll", onScroll, true);
    document.removeEventListener("load", onResize, true);
    document.removeEventListener("transitionrun", onTransition, true);
    document.removeEventListener("transitionend", onTransition, true);
    document.removeEventListener("transitioncancel", onTransition, true);
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onScroll);
    document.fonts.removeEventListener("loadingdone", onResize);
    for (const overlay of layers.values()) overlay.remove();
    root.removeAttribute("data-overlay-scrollbars");
  };
}
