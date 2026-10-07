import type { Question, Block } from "../core/types";
import { validateFormula, DataError } from "../core/validation";
type Katex = {
  render: (
    text: string,
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => void;
};
declare global {
  interface Window {
    katex?: Katex;
  }
}
let pending: Promise<void> | undefined;
const url = "https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/";
export const mathOptions = () => ({
  trust: false,
  throwOnError: true,
  strict: "error",
  output: "htmlAndMathml",
  displayMode: true,
  maxExpand: 100,
  maxSize: 10,
  macros: {},
});
export async function ensureMath(questions: Question[]) {
  const deadline = performance.now() + 10000;
  const formulas = questions
    .flatMap((q) =>
      [
        q.prompt,
        q.explanation,
        ...q.choices.map((c) => c.content),
        ...q.contexts.map((c) => c.content),
      ].flatMap((c) => c.blocks),
    )
    .filter(
      (b): b is Extract<Block, { type: "formula" }> =>
        b.type === "formula" && b.format === "latex",
    );
  if (!formulas.length) return;
  formulas.forEach((b) => validateFormula(b.text));
  if (!pending)
    pending = new Promise<void>((resolve, reject) => {
      const css = document.createElement("link"),
        js = document.createElement("script");
      css.rel = "stylesheet";
      css.href = url + "katex.min.css";
      css.integrity =
        "sha384-3rdsX6e5mueWyoweR9NIVmtEsUkokpBT/0ALqKKIBMr9j4qhHkaIkAcGgsE6uVlp";
      js.src = url + "katex.min.js";
      js.integrity =
        "sha384-QFFtAGzvvj+bfgCGxXJlNZZR1nXEZgvG8tDLCCY1F19xl20WlfTYgguB4VcNdxYk";
      css.crossOrigin = js.crossOrigin = "anonymous";
      css.referrerPolicy = js.referrerPolicy = "no-referrer";
      const timeout = setTimeout(() => fail(), 10000);
      let loaded = 0,
        settled = false;
      const fail = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        css.remove();
        js.remove();
        pending = undefined;
        reject(
          new DataError(
            "MATH_NETWORK",
            "数式表示の準備に失敗しました。接続を確認して再試行してください。",
          ),
        );
      };
      css.onerror = js.onerror = fail;
      css.onload = js.onload = () => {
        if (++loaded === 2 && !settled) {
          settled = true;
          clearTimeout(timeout);
          resolve();
        }
      };
      document.head.append(css, js);
    });
  await pending;
  if (performance.now() >= deadline)
    throw new DataError("MATH_NETWORK", "数式表示の準備が制限時間を超えました");
  const probe = document.createElement("div");
  probe.className = "math-probe";
  document.body.append(probe);
  try {
    if (!window.katex)
      throw new DataError("MATH_NETWORK", "数式描画機能を読み込めません");
    for (const f of formulas) window.katex.render(f.text, probe, mathOptions());
    const fonts = Promise.all(
      ["KaTeX_Main", "KaTeX_Math", "KaTeX_Size1"].map(async (f) => {
        const loaded = await document.fonts.load(`16px ${f}`);
        if (!loaded.length || loaded.some((font) => font.status !== "loaded"))
          throw new DataError("MATH_NETWORK", "数式フォントが読めません");
      }),
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        fonts,
        new Promise((_, rej) => {
          timer = setTimeout(
            () =>
              rej(new DataError("MATH_NETWORK", "数式フォントが読めません")),
            Math.max(0, deadline - performance.now()),
          );
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    if (e instanceof DataError) throw e;
    throw new DataError("MATH_RENDER", "数式の組版に失敗しました");
  } finally {
    probe.remove();
  }
  window.dispatchEvent(new Event("opencbt-math-ready"));
}
