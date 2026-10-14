import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = "public/explanations/ipa-2026-a-2/";
const html = fs.readFileSync(root + "index.html", "utf8");

// Minimal non-browser DOM adapter for exercising the actual entry script and its
// event handlers. It checks rendering/state, not CSS layout or browser file access.
class Node {
  id = ""; className = ""; value = ""; max = ""; hidden = false; disabled = false;
  type = ""; scope = ""; offsetLeft = 0; tabIndex = -1; focused = false;
  children: Node[] = [];
  parentElement: Node | null = null;
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  properties = new Map<string, string>();
  private content = "";
  private events = new Map<string, ((event: any) => void)[]>();
  constructor(readonly tagName = "div") {}
  get textContent(): string { return this.content + this.children.map(child => child.textContent).join(""); }
  set textContent(value: any) { this.content = String(value); this.children = []; }
  get classList() {
    const change = (name: string, active: boolean) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      if (active) classes.add(name); else classes.delete(name);
      this.className = [...classes].join(" ");
    };
    return { add: (name: string) => change(name, true), toggle: change };
  }
  style = { setProperty: (name: string, value: string) => this.properties.set(name, value), height: "" };
  append(...nodes: Node[]) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
  replaceChildren(...nodes: Node[]) { this.content = ""; this.children = []; this.append(...nodes); }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  getAttribute(name: string) { return this.attributes.get(name) ?? null; }
  descendants(): Node[] { return this.children.flatMap(child => [child, ...child.descendants()]); }
  matches(selector: string) {
    const algorithm = selector.match(/^\[data-algorithm="([^"]+)"\]$/);
    return algorithm ? this.dataset.algorithm === algorithm[1] : selector.startsWith(".") ? this.className.split(/\s+/).includes(selector.slice(1)) : this.tagName === selector;
  }
  querySelector(selector: string): Node { const node = this.descendants().find(child => child.matches(selector)); assert(node, `Missing selector ${selector}`); return node; }
  closest(selector: string): Node | null { return selector.split(",").some(part => this.matches(part)) ? this : this.parentElement?.closest(selector) ?? null; }
  addEventListener(name: string, listener: (event: any) => void) { this.events.set(name, [...this.events.get(name) ?? [], listener]); }
  removeEventListener(name: string, listener: (event: any) => void) { this.events.set(name, (this.events.get(name) ?? []).filter(value => value !== listener)); }
  dispatch(name: string, values: Record<string, unknown> = {}) { for (const listener of this.events.get(name) ?? []) listener({ target: this, preventDefault() {}, ...values }); }
  click() { if (!this.disabled) this.dispatch("click"); }
  getAnimations() { return []; }
  animate() { return { cancel() {} }; }
  scrollIntoView() {}
  focus() { this.focused = true; }
}

function boot(hostContext?: any, dark = false) {
  const body = new Node("body"), documentElement = new Node("html"), events = new Node();
  const staticNodes = [...html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*\bid="([^"]+)"[^>]*)>/g)].map(([, tag, attributes, id]) => {
    const node = new Node(tag); node.id = id;
    node.value = attributes.match(/\bvalue="([^"]*)"/)?.[1] ?? "";
    node.hidden = /\bhidden\b/.test(attributes);
    body.append(node); return node;
  });
  const $ = (id: string) => { const node = [...staticNodes, ...body.descendants()].find(node => node.id === id); assert(node, `Missing id ${id}`); return node; };
  $("speed").value = html.match(/<option value="(\d+)" selected>/)![1];
  const stats = { ready: 0, overlays: 0, disposed: 0 };
  const media = new Map<string, any>();
  const timers = new Map<number, () => void>(); let timerId = 0;
  const sandbox: any = vm.createContext({
    structuredClone,
    document: { body, documentElement, getElementById: $, hidden: false,
      createElement: (tag: string) => new Node(tag), createElementNS: (_ns: string, tag: string) => new Node(tag),
      addEventListener: events.addEventListener.bind(events) },
    matchMedia: (query: string) => {
      if (!media.has(query)) {
        const listeners = new Node();
        media.set(query, { matches: query.includes("reduced-motion") || dark,
          addEventListener: listeners.addEventListener.bind(listeners), removeEventListener: listeners.removeEventListener.bind(listeners),
          change(matches: boolean) { this.matches = matches; listeners.dispatch("change"); } });
      }
      return media.get(query);
    },
    setTimeout: (callback: () => void) => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: (id: number) => timers.delete(id),
    addEventListener: events.addEventListener.bind(events),
  });
  sandbox.window = sandbox;
  if (hostContext) {
    sandbox.OpenCBTDetail = { context: hostContext, ready: () => stats.ready++ };
    documentElement.dataset.theme = hostContext.theme;
  }
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(match => match[1]);
  for (const file of scripts) {
    vm.runInContext(fs.readFileSync(root + file, "utf8"), sandbox, { filename: file });
    if (file === "scrollbars.js") {
      assert.equal(typeof sandbox.OpenCBTSortScrollbars.installOverlayScrollbars, "function");
      sandbox.OpenCBTSortScrollbars = { installOverlayScrollbars: () => { stats.overlays++; return () => stats.disposed++; } };
    }
  }
  return { $, stats, media, sandbox, documentElement, events, timers,
    values: () => $("bars").children.map(slot => Number(slot.querySelector("button").dataset.value)),
    choose: (kind: string) => { $("algorithm-select").value = kind; $("algorithm-select").dispatch("change"); },
    seek: (index: number) => { $("seek").value = String(index); $("seek").dispatch("input"); },
    tick: () => { const [id, callback] = timers.entries().next().value!; timers.delete(id); callback(); },
  };
}

test("direct document entry renders eight bars and all seven working algorithm selectors without a host API", () => {
  const ui = boot();
  assert.equal(ui.sandbox.OpenCBTDetail, undefined);
  assert.equal(ui.stats.ready, 0); assert.equal(ui.stats.overlays, 1);
  assert.deepEqual(ui.values(), [8, 3, 5, 1, 7, 2, 6, 4]);
  assert.equal(ui.$("algorithm-select").children.length, 7);
  assert.equal(ui.$("choice-links").children.length, 4);
  assert.equal(ui.$("comparison-rows").children.length, 7);
  for (const [kind, name] of [["quick", "クイックソート"], ["bubble", "バブルソート"], ["selection", "選択ソート"], ["insertion", "挿入ソート"], ["merge", "マージソート"], ["heap", "ヒープソート"], ["shell", "シェルソート"]]) {
    ui.choose(kind);
    assert.equal(ui.$("algorithm-name").textContent, name);
    assert.deepEqual(ui.values(), [8, 3, 5, 1, 7, 2, 6, 4]);
    assert.equal(ui.$("count-comparisons").textContent, "0");
    assert.equal(ui.$("algorithm-select").value, kind);
    assert.equal(ui.$("merge-view").hidden, kind !== "merge");
    assert.equal(ui.$("heap-view").hidden, kind !== "heap");
    if (kind === "heap") assert.equal(ui.$("tree-content").children.filter(node => node.tagName === "g").length, 8);
    ui.seek(Number(ui.$("seek").max));
    assert.deepEqual(ui.values(), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert(ui.$("play").disabled); assert(ui.$("step-description").textContent.length > 0);
    ui.$("first").click();
    assert.deepEqual(ui.values(), [8, 3, 5, 1, 7, 2, 6, 4]);
  }
});

test("direct entry preserves applied values when switching algorithms and synchronizes playback, seeking and validation", () => {
  const ui = boot();
  ui.$("sequence").value = "99，0，2，2"; ui.$("apply-input").click();
  assert.deepEqual(ui.values(), [99, 0, 2, 2]);
  ui.choose("bubble"); assert.deepEqual(ui.values(), [99, 0, 2, 2]);
  ui.$("play").click(); assert.equal(ui.timers.size, 1); ui.tick();
  assert.equal(ui.$("seek").value, "1"); assert.equal(ui.$("play").getAttribute("aria-pressed"), "true");
  ui.$("next").click(); assert.equal(ui.timers.size, 0); assert.equal(ui.$("seek").value, "2");
  ui.$("previous").click(); assert.equal(ui.$("seek").value, "1");
  ui.choose("selection"); assert.equal(ui.$("seek").value, "0");
  ui.$("sequence").value = "1,2,3"; ui.$("apply-input").click();
  assert.equal(ui.$("input-error").hidden, false); assert.match(ui.$("input-error").textContent, /4〜10/);
  assert.deepEqual(ui.values(), [99, 0, 2, 2]);
  ui.$("sequence").value = "4、3、2、1"; ui.$("sequence").dispatch("keydown", { key: "Enter" });
  assert.deepEqual(ui.values(), [4, 3, 2, 1]); assert.equal(ui.$("input-error").hidden, true);
  ui.seek(Number(ui.$("seek").max) - 1); ui.$("play").click(); ui.tick();
  assert.equal(ui.$("play").getAttribute("aria-pressed"), "false"); assert.equal(ui.timers.size, 0);
  ui.$("default-input").click(); assert.deepEqual(ui.values(), [8, 3, 5, 1, 7, 2, 6, 4]);
});

test("host entry keeps saved generated targeting, choice order and theme without installing duplicate overlays", () => {
  const context = { question: { id: "generated-test", correctAnswer: { choiceId: "choice-value-2" } },
    generation: { generatorRef: { id: "generator-source-2026-a-2", version: "3.2.0" }, parameters: { values: [2, 1] } },
    choiceOrder: [4, 2, 1, 3].map((id, i) => ({ id: `choice-value-${id}`, label: ["ア", "イ", "ウ", "エ"][i] })),
    selectedChoiceId: "choice-value-1", initialParameters: { algorithm: "question" }, theme: "dark" };
  const before = JSON.stringify(context), ui = boot(context);
  assert.equal(ui.stats.ready, 1); assert.equal(ui.stats.overlays, 0);
  assert.equal(ui.documentElement.dataset.theme, "dark");
  assert.equal(ui.media.has("(prefers-color-scheme: dark)"), false);
  assert.equal(ui.$("standalone-sources").hidden, true);
  assert.equal(ui.$("algorithm-name").textContent, "選択ソート");
  assert.deepEqual(ui.$("choice-links").children.map(node => node.dataset.algorithm), ["quick", "selection", "insertion", "bubble"]);
  assert.match(ui.$("choice-links").children[1].textContent, /イ.*この問題の正答/);
  assert.match(ui.$("choice-links").children[2].textContent, /ウ.*あなたの解答/);
  ui.$("choice-links").children[2].click(); assert.equal(ui.$("algorithm-name").textContent, "挿入ソート");
  assert.equal(ui.$("algorithm-select").value, "insertion");
  assert.equal(ui.$("simulator").hidden, false); assert.equal(ui.$("algorithm-select").focused, true);
  assert.equal(JSON.stringify(context), before);
});

test("segmented panels pause hidden playback, preserve input and position, and isolate their keyboard controls", () => {
  const ui = boot();
  ui.$("sequence").value = "99,0,2,2"; ui.$("apply-input").click(); ui.choose("heap");
  ui.$("play").click(); ui.tick();
  const values = ui.values(), description = ui.$("step-description").textContent;
  ui.$("tab-question-choices").click();
  assert.equal(ui.timers.size, 0); assert.equal(ui.$("play").getAttribute("aria-pressed"), "false");
  assert.equal(ui.$("simulator").hidden, true); assert.equal(ui.$("question-choices").hidden, false); assert.equal(ui.$("comparison").hidden, true);
  ui.$("tab-question-choices").dispatch("keydown", { key: "ArrowRight" });
  assert.equal(ui.$("comparison").hidden, false); assert.equal(ui.$("question-choices").hidden, true);
  assert.equal(ui.$("tab-comparison").focused, true);
  ui.events.dispatch("keydown", { key: "End" });
  assert.equal(ui.$("seek").value, "1");
  ui.$("tab-comparison").dispatch("keydown", { key: "Home" });
  assert.equal(ui.$("simulator").hidden, false); assert.equal(ui.$("comparison").hidden, true);
  assert.equal(ui.$("algorithm-select").value, "heap"); assert.equal(ui.$("sequence").value, "99,0,2,2");
  assert.deepEqual(ui.values(), values); assert.equal(ui.$("step-description").textContent, description);
  for (const id of ["simulator", "question-choices", "comparison"]) {
    assert.equal(ui.$(`tab-${id}`).getAttribute("aria-selected"), String(id === "simulator"));
    assert.equal(ui.$(`tab-${id}`).tabIndex, id === "simulator" ? 0 : -1);
  }
  ui.$("play").click(); ui.tick(); assert.equal(ui.$("seek").value, "2");
  ui.$("tab-comparison").click(); ui.$("tab-comparison").dispatch("keydown", { key: "ArrowRight" });
  assert.equal(ui.$("simulator").hidden, false);
});

test("direct entry follows the system monochrome theme and disposes only its own resources", () => {
  const ui = boot(undefined, true);
  assert.equal(ui.documentElement.dataset.theme, "dark");
  assert.equal(ui.$("standalone-sources").hidden, false);
  ui.media.get("(prefers-color-scheme: dark)").change(false);
  assert.equal(ui.documentElement.dataset.theme, "light");
  ui.$("play").click(); ui.events.dispatch("pagehide", { persisted: true });
  assert.equal(ui.timers.size, 0); assert.equal(ui.stats.disposed, 0);
  ui.events.dispatch("pagehide", { persisted: false }); assert.equal(ui.stats.disposed, 1);
});
