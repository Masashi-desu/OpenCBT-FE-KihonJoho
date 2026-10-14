import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  hasFixedColor, inspectPalette, inspectColorCss, inspectInlineColors, validateUiColors,
} from "../scripts/validate-ui-colors.mjs";
import { applyTheme } from "../src/ui/theme";

const paletteText = fs.readFileSync("src/ui/tokens.css", "utf8");
const palette = inspectPalette(paletteText);

test("all authored screens use a complete shared palette and generated explanation styles match it", () => {
  const result = validateUiColors();
  assert.deepEqual(result.issues, []);
  assert(result.files >= 30);
  assert(palette.tokens.has("--canvas") && palette.tokens.has("--scrollbar-thumb") && palette.tokens.has("--visual-pivot"));
  for (const file of ["theme.css", "scrollbars.css"]) assert.equal(
    fs.readFileSync(`public/explanations/ipa-2026-a-2/${file}`, "utf8"),
    fs.readFileSync(`src/ui/${file === "theme.css" ? "tokens.css" : file}`, "utf8"),
  );
});

test("guard rejects fixed colors and fallback literals while preserving transparent and inherited colors", () => {
  for (const value of ["#fff", "#1234", "#123456", "#12345678", "rgb(1 2 3 / 40%)", "hsl(120 50% 50%)", "oklch(60% .2 100)", "rebeccapurple", "var(--surface, #fff)"]) assert(hasFixedColor(value), value);
  for (const value of ["transparent", "currentColor", "inherit", "var(--ink)", "url('/brand-icon.svg')"]) assert(!hasFixedColor(value), value);
  const invalid = inspectColorCss(".panel{background:#fff;color:var(--ink,white);border-color:rebeccapurple}", "screen.css", palette.tokens);
  assert.equal(invalid.length, 3);
  assert.deepEqual(inspectColorCss(".panel{background:var(--surface);color:var(--ink);border-color:transparent}", "screen.css", palette.tokens), []);
});

test("guard rejects undefined color roles and local redefinitions of shared roles without mistaking lengths for colors", () => {
  assert(inspectColorCss(".panel{color:var(--text-typo)}", "screen.css", palette.tokens).some(issue => issue.includes("未定義")));
  assert(inspectColorCss(".panel{--surface:var(--soft-surface)}", "screen.css", palette.tokens).some(issue => issue.includes("上書き")));
  assert.deepEqual(inspectColorCss(".arrow{border-top:calc(var(--height,36px)/2) solid transparent;border-left:7px solid var(--accent);border-radius:var(--radius,8px)}", "screen.css", palette.tokens), []);
});

test("shared palette must define both themes and cannot contain undefined or cyclic aliases", () => {
  assert(inspectPalette(":root{--canvas:#fff;--ink:#000}:root.dark{--canvas:#111}").issues.some(issue => issue.includes("ダークテーマ")));
  assert(inspectPalette(":root{--canvas:var(--missing)}:root.dark{--canvas:#111}").issues.some(issue => issue.includes("未知")));
  assert(inspectPalette(":root{--canvas:var(--ink);--ink:var(--canvas)}:root.dark{--canvas:#111;--ink:#fff}").issues.some(issue => issue.includes("循環")));
  assert.deepEqual(palette.issues, []);
});

test("local learning colors require an explained visual variable and cannot redefine a common visualization role", () => {
  assert(inspectColorCss(":root{--visual-network:#123456}", "lesson.css", palette.tokens).some(issue => issue.includes("固定色")));
  assert.deepEqual(inspectColorCss(":root{/* visual-color: network nodes distinguish three processing groups */--visual-network:#123456}.node{fill:var(--visual-network)}", "lesson.css", palette.tokens), []);
  assert(inspectColorCss(":root{/* visual-color: comparison */--visual-compare:#123456}", "lesson.css", palette.tokens).some(issue => issue.includes("上書き")));
});

test("inline SVG, style objects, style assignments and attribute setters cannot bypass the shared palette", () => {
  const source = 'const view=<svg fill="var(--surface,#fff)" style={{color:"red"}}/>;node.style.backgroundColor="#123456";node.setAttribute("stroke","rgb(1,2,3)");node.style.setProperty("--canvas","var(--surface)");';
  const issues = inspectInlineColors(source, "view.tsx", palette.tokens);
  assert.equal(issues.filter(issue => issue.includes("固定色")).length, 4);
  assert(issues.some(issue => issue.includes("上書き")));
  assert.deepEqual(inspectInlineColors('const view=<svg fill="var(--surface)" stroke="currentColor"/>;const codeExample="color: #fff";', "view.tsx", palette.tokens), []);
});

test("browser theme metadata follows the common canvas role instead of a second fixed palette", () => {
  const oldDocument = globalThis.document, oldStyle = globalThis.getComputedStyle;
  const root = { dataset: { theme: "light" } }, metadata = new Map<string, string>();
  try {
    Object.assign(globalThis, { document: { documentElement: root, querySelector: () => ({ setAttribute: (key: string, value: string) => metadata.set(key, value) }) },
      getComputedStyle: () => ({ getPropertyValue: (key: string) => (root.dataset.theme === "dark" ? palette.dark : palette.light).get(key) ?? "" }) });
    for (const theme of ["light", "dark"] as const) {
      applyTheme(theme); assert.equal(root.dataset.theme, theme);
      assert.equal(metadata.get("content"), (theme === "dark" ? palette.dark : palette.light).get("--canvas"));
    }
  } finally {
    Object.assign(globalThis, { document: oldDocument, getComputedStyle: oldStyle });
  }
});
