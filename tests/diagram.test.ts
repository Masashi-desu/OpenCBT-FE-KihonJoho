import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Diagram } from "../src/ui/Content";
import { fixture } from "./fixtures";
import {
  readActivityNetwork,
  activityNetworkAlt,
} from "../src/core/activity-network";
import { validateBundle } from "../src/core/validation";

const diagram = () => {
  const q = fixture().questions.find(
    (q) => q.id === "question-template-critical-path",
  )!;
  const b = q.prompt.blocks.find((b) => b.type === "diagram")!;
  assert(b.type === "diagram");
  return b;
};

test("arrow diagram preserves unlabelled circles, separate work/duration labels and an in-figure legend", () => {
  const b = diagram(),
    before = JSON.stringify(b);
  const html = renderToStaticMarkup(createElement(Diagram, b));
  assert.equal((html.match(/class="activity-node"/g) ?? []).length, 7);
  assert.equal((html.match(/class="activity-edge"/g) ?? []).length, 8);
  assert.equal((html.match(/class="activity-name"/g) ?? []).length, 8);
  assert.equal((html.match(/class="activity-duration"/g) ?? []).length, 8);
  assert.equal((html.match(/class="dummy-edge"/g) ?? []).length, 3); // 2 activities + legend
  assert.match(html, /凡例/);
  assert.match(html, /作業名/);
  assert.match(html, /所要日数/);
  assert.match(html, /aria-describedby=/);
  assert.doesNotMatch(html, /diagram-alt|<details|<table|結合点|node-\d|0日/);
  assert.equal(JSON.stringify(b), before);
  assert(!activityNetworkAlt(b.scene).includes("120")); // No answer in the alternative description.
});

test("legacy saved arrow diagrams receive the same corrected presentation without changing their data", () => {
  const b = diagram();
  b.rendererRef = { id: "renderer-diagram-basic", version: "1.0.0" };
  assert(b.scene.kind === "graph");
  b.scene.nodes.forEach((n) => {
    n.x = 500;
    n.y = 500;
  }); // old layout is projected by the managed profile
  b.alt = "node-0からnode-1へA 30日";
  const before = JSON.stringify(b),
    html = renderToStaticMarkup(createElement(Diagram, b));
  assert.equal((html.match(/class="activity-node"/g) ?? []).length, 7);
  assert.match(html, /凡例/);
  assert.doesNotMatch(html, /diagram-alt|<details|<table|結合点|node-0/);
  assert.equal(JSON.stringify(b), before);
});

test("unknown renderer, missing activities and incorrect dummy dependencies are rejected", async () => {
  const b = diagram();
  assert(b.scene.kind === "graph");
  b.scene.edges[8].to = "node-4";
  assert.throws(() => readActivityNetwork(b.scene), {
    code: "ACTIVITY_NETWORK",
  });
  const invalid = fixture();
  const block = invalid.questions.find(
    (q) => q.id === "question-template-critical-path",
  )!.prompt.blocks[1];
  assert(block.type === "diagram");
  block.rendererRef.id = "renderer-unknown";
  await assert.rejects(validateBundle(invalid), { code: "RENDERER_REF" });
  const missing = diagram();
  assert(missing.scene.kind === "graph");
  missing.scene.edges[0].label = "A -1日";
  assert.throws(() => readActivityNetwork(missing.scene), {
    code: "ACTIVITY_NETWORK",
  });
});

test("text figure retains five numbered headings and their separate bullet conditions", () => {
  const q = fixture().questions.find(
    (q) => q.id === "question-template-security-log",
  )!;
  const rules = q.contexts.find((c) => c.presentation === "text_figure")!
    .content.blocks;
  assert.deepEqual(
    rules.filter((b) => b.type === "heading").map((b) => b.text),
    [
      "1. ログの取得",
      "2. ログの項目",
      "3. ログのアクセス管理",
      "4. ログの保存期間",
      "5. 改ざんへの対策",
    ],
  );
  assert.deepEqual(
    rules.filter((b) => b.type === "list").map((b) => b.items.length),
    [2, 1, 4, 1, 1],
  );
  assert(!rules.some((b) => b.type === "table" || b.type === "image"));
  assert.equal(q.choices.length, 10);
});
