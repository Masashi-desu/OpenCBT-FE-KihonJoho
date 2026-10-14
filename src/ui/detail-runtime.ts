// Bundled as a classic script for the sandbox, using the same scrollbar implementation.
import { installOverlayScrollbars } from "./scrollbars";
import type { DetailContext } from "../core/detailed-explanation";

type DetailApi = {
  readonly context: DetailContext;
  readonly assets: Readonly<Record<string, string>>;
  ready: () => void;
  onThemeChange: (listener: (theme: "light" | "dark") => void) => () => void;
};
declare global { interface Window { OpenCBTDetail?: DetailApi } }

function mountDetailRuntime() {
  let token = "", parentOrigin = "", initialized = false, failed = false;
  let requestedReady = false, rendered = false;
  const themeListeners = new Set<(theme: "light" | "dark") => void>();
  const notify = (type: "ready" | "error") => {
    if (token) window.parent.postMessage({ type: `opencbt:detail:${type}`, apiVersion: 1, token }, parentOrigin);
  };
  const fail = () => { if (!failed) { failed = true; notify("error"); } };
  const ready = () => { requestedReady = true; if (rendered && !failed) notify("ready"); };
  const freeze = (value: unknown) => {
    if (value && typeof value === "object") {
      Object.freeze(value);
      for (const child of Object.values(value)) freeze(child);
    }
  };
  const applyTheme = (theme: "light" | "dark") => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    themeListeners.forEach((listener) => listener(theme));
  };
  window.addEventListener("error", fail, true);
  window.addEventListener("unhandledrejection", fail);
  window.addEventListener("securitypolicyviolation", fail);
  window.addEventListener("message", async (event) => {
    const data = event.data;
    if (event.source !== window.parent || !data || data.apiVersion !== 1) return;
    if (initialized) {
      if (event.origin === parentOrigin && data.token === token && data.type === "opencbt:detail:theme" &&
        (data.theme === "light" || data.theme === "dark")) {
        try { applyTheme(data.theme); } catch { fail(); }
      }
      return;
    }
    if (data.type !== "opencbt:detail:init" || typeof data.token !== "string" ||
      typeof data.html !== "string" || !data.context || !data.assets) return;
    initialized = true;
    token = data.token;
    parentOrigin = event.origin;
    try {
      freeze(data.context); freeze(data.assets);
      const api: DetailApi = Object.freeze({
        context: data.context, assets: data.assets, ready,
        onThemeChange(listener) { themeListeners.add(listener); return () => { themeListeners.delete(listener); }; },
      });
      Object.defineProperty(window, "OpenCBTDetail", { value: api, writable: false, configurable: false });
      const doc = new DOMParser().parseFromString(data.html, "text/html");
      for (const data of doc.querySelectorAll('script[type="text/opencbt-prepared-css"]')) {
        const style = doc.createElement("style");
        for (const attribute of data.attributes) if (attribute.name !== "type") style.setAttribute(attribute.name, attribute.value);
        style.textContent = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(data.textContent ?? ""), char => char.charCodeAt(0)));
        data.replaceWith(style);
      }
      const scripts = [...doc.querySelectorAll("script")];
      const markers = scripts.map((script) => {
        const marker = doc.createElement("span"); marker.hidden = true;
        script.replaceWith(marker); return marker;
      });
      document.documentElement.lang = doc.documentElement.lang || "ja";
      document.head.append(...doc.head.childNodes);
      document.body.replaceChildren(...doc.body.childNodes);
      const style = document.createElement("style");
      // The host supplies the authoritative colors after package styles. A
      // package's standalone palette copy cannot drift the embedded UI theme.
      style.textContent = (typeof data.themeCss === "string" ? data.themeCss + "\n" : "") + data.scrollbarCss;
      document.head.append(style);
      installOverlayScrollbars();
      applyTheme(api.context.theme);
      // Preserve document order for dependency scripts, without evaluating problem data.
      for (let i = 0; i < scripts.length && !failed; i++) {
        const script = document.createElement("script");
        const original = scripts[i];
        for (const attribute of original.attributes) {
          if (!["src", "integrity", "async", "defer"].includes(attribute.name))
            script.setAttribute(attribute.name, attribute.value);
        }
        script.textContent = original.textContent;
        if (script.type === "module") {
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve(); script.onerror = reject;
            markers[i].replaceWith(script);
          });
        } else markers[i].replaceWith(script);
      }
      rendered = true;
      if (requestedReady && !failed) notify("ready");
    } catch { fail(); }
  });
}
mountDetailRuntime();
