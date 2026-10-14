import type { DetailPackage } from "../core/detailed-explanation";

const encodeCss = (text: string) => {
  const bytes = new TextEncoder().encode(text); let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
};
const decodeCss = (text: string) => new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(text), char => char.charCodeAt(0)));
// Even detached HTML parsing checks inline CSS against the main page's CSP.
// Keep styles as encoded, non-executable script data until the sandbox mounts.
// Skip comments and raw-text elements so JavaScript strings are untouched.
export function inertDetailHtml(html: string) {
  return html.replace(/<!--[\s\S]*?-->|<(script|textarea|title)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>[\s\S]*?<\/\1\s*>|<style\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/style\s*>/gi,
    (tag, _raw, attributes, css) => /^<style\b/i.test(tag)
      ? `<script type="text/opencbt-prepared-css"${attributes}>${encodeCss(css)}</script>` : tag);
}

/** Resolve only declared local resources before handing managed HTML to the isolated host. */
export function prepareDetailDocument(pkg: DetailPackage) {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const base = new URL("https://detail.invalid/package/");
  const assets: Record<string, string> = {};
  for (const [path, file] of Object.entries(pkg.files)) {
    let binary = "";
    for (let offset = 0; offset < file.bytes.length; offset += 8192)
      binary += String.fromCharCode(...file.bytes.subarray(offset, offset + 8192));
    assets[path] = `data:${file.mediaType};base64,${btoa(binary)}`;
  }
  const local = (path: string) => {
    const url = new URL(path, base);
    const relative = url.pathname.slice(base.pathname.length);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) ||
      url.search || !pkg.files[relative]) throw Error("詳細解説の資源参照が不正です");
    return { relative, fragment: url.hash };
  };
  const resource = (path: string) => {
    const { relative, fragment } = local(path);
    return assets[relative] + fragment;
  };
  const css = (text: string, path = "index.html") => {
    if (/@import\b/i.test(text)) throw Error("詳細解説のCSSは同梱ファイルへまとめてください");
    return text.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi, (_match, a, b, c) => {
      const value: string = (a ?? b ?? c).trim();
      if (value.startsWith("#") || value.startsWith("data:")) return `url("${value.replaceAll('"', '%22')}")`;
      return `url("${resource(new URL(value, new URL(path, base)).href)}")`;
    });
  };
  const doc = new DOMParser().parseFromString(inertDetailHtml(decoder.decode(pkg.files["index.html"].bytes)), "text/html");
  if (doc.querySelector("base, iframe, object, embed")) throw Error("詳細解説に未対応の埋め込みがあります");
  // The common host owns CSP/navigation policies, irrespective of package metadata.
  doc.querySelectorAll("meta[http-equiv]").forEach((element) => element.remove());
  for (const link of doc.querySelectorAll<HTMLLinkElement>("link")) {
    if (link.rel !== "stylesheet") { link.remove(); continue; }
    const { relative } = local(link.getAttribute("href") ?? "");
    if (pkg.files[relative].mediaType !== "text/css") throw Error("CSSの資源種別が不正です");
    const style = doc.createElement("script");
    style.type = "text/opencbt-prepared-css";
    style.textContent = encodeCss(css(decoder.decode(pkg.files[relative].bytes), relative));
    if (link.media) style.setAttribute("media", link.media);
    link.replaceWith(style);
  }
  for (const script of doc.querySelectorAll<HTMLScriptElement>("script[src]")) {
    const { relative } = local(script.getAttribute("src")!);
    if (pkg.files[relative].mediaType !== "text/javascript") throw Error("JSの資源種別が不正です");
    script.removeAttribute("src");
    script.removeAttribute("integrity");
    script.textContent = decoder.decode(pkg.files[relative].bytes);
  }
  for (const element of doc.querySelectorAll<HTMLElement>('[src], [poster], [srcset], [style], script[type="text/opencbt-prepared-css"]')) {
    if (element.getAttribute("type") === "text/opencbt-prepared-css")
      element.textContent = encodeCss(css(decodeCss(element.textContent ?? "")));
    if (element.hasAttribute("style")) element.setAttribute("style", css(element.getAttribute("style")!));
    for (const name of ["src", "poster"])
      if (element.hasAttribute(name)) element.setAttribute(name, resource(element.getAttribute(name)!));
    // Avoid browser-dependent srcset parsing; authors may use picture's individual sources.
    if (element.hasAttribute("srcset")) throw Error("画像候補はsrcで指定してください");
  }
  // External JS/CSS may contain literal closing tags inside strings or comments.
  for (const script of doc.querySelectorAll("script"))
    script.textContent = (script.textContent ?? "").replace(/<\/script/gi, "<\\/script");
  for (const style of doc.querySelectorAll("style"))
    style.textContent = (style.textContent ?? "").replace(/<\/style/gi, "<\\/style");
  return { html: doc.documentElement.outerHTML, assets };
}
