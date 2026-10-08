import * as validators from "../generated/validators.js";
import mathSchema from "../../docs/public/schemas/formula.schema.json";
import {
  refKey,
  type Bundle,
  type Question,
  type Attribution,
  type Content,
} from "./types";
import { contentHash } from "./hash";
import { DataError } from "./errors";
export { DataError } from "./errors";
import { validateTemplateContract } from "./generation";
import { validateSourceFormat } from "./generation-formats";
import { validateSourceFigure } from "./source-figures";
import { validateGenerationCoverage } from "./generation-coverage";
import {
  activityNetworkRenderer,
  readActivityNetwork,
} from "./activity-network";
const fail = (code: string, message: string): never => {
  throw new DataError(code, message);
};
export function schema(kind: string, value: unknown) {
  const validate = (
    validators as unknown as Record<
      string,
      { (value: unknown): boolean; errors: unknown }
    >
  )[kind];
  if (!validate || !validate(value))
    fail("SCHEMA", `${kind}: ${JSON.stringify(validate?.errors)}`);
}
export function safeUrl(input: string) {
  const u = new URL(input);
  if (u.protocol !== "https:" || u.username || u.password)
    fail("UNSAFE_URL", "出典URLが安全ではありません。");
  return u.href;
}
const commands = new Set<string>(mathSchema.$defs.allowedLatexCommand.enum),
  environments = new Set<string>(mathSchema.$defs.allowedLatexEnvironment.enum);
export function validateFormula(text: string) {
  if (
    !/^[\x20-\x7e\t\r\n]+$/.test(text) ||
    /[$%#@"'`]/.test(text) ||
    text.length > 1000
  )
    fail("MATH_SYNTAX", "数式の禁止文字又は上限違反");
  let depth = 0,
    env: undefined | { name: string; start: number; depth: number };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "\\") {
      const start = i,
        match = /^[A-Za-z]+/.exec(text.slice(i + 1)),
        command = match ? match[0] : text[i + 1];
      if (!commands.has(command))
        fail("MATH_COMMAND", `未許可の数式命令: ${command}`);
      i += command.length;
      if (command === "begin" || command === "end") {
        const name = /^\{([A-Za-z]+)\}/.exec(text.slice(i + 1));
        if (!name || !environments.has(name[1]))
          fail("MATH_STRUCTURE", "数式環境が未許可");
        i += name![0].length;
        if (command === "begin") {
          if (env) fail("MATH_STRUCTURE", "数式環境の入れ子");
          env = { name: name![1], start: i + 1, depth };
        } else {
          if (!env || env.name !== name![1] || env.depth !== depth)
            fail("MATH_STRUCTURE", "数式環境の不一致");
          const rows = text.slice(env!.start, start).split("\\\\");
          if (rows.length > 8 || rows.some((r) => r.split("&").length > 8))
            fail("MATH_STRUCTURE", "数式の行数上限");
          env = undefined;
        }
      } else if (command === "\\" && !env)
        fail("MATH_STRUCTURE", "環境外の改行");
    } else if (char === "{") {
      if (++depth > 16) fail("MATH_STRUCTURE", "数式括弧が深すぎる");
    } else if (char === "}") {
      if (--depth < 0) fail("MATH_STRUCTURE", "数式括弧の不一致");
    } else if (char === "&" && !env)
      fail("MATH_STRUCTURE", "環境外のセル区切り");
  }
  if (depth !== 0 || env) fail("MATH_STRUCTURE", "数式が閉じられていません");
}
export async function validateBundle(b: Bundle) {
  schema("catalog", b.catalog);
  if (b.catalog.scope !== "distribution")
    fail("RELEASE_GATE", "文書用カタログは配布対象にできません");
  const maps: Record<string, Map<string, any>> = {};
  for (const [kind, records] of Object.entries({
    question: b.questions,
    source: b.sources,
    rights: b.rights,
    asset: b.assets,
    set: b.sets,
    exam: b.exams,
    template: b.templates,
  })) {
    maps[kind] = new Map();
    for (const r of records) {
      schema(kind, r);
      const key = "revision" in r ? `${r.id}@${r.revision}` : r.id;
      if (maps[kind].has(key)) fail("DUPLICATE_ID", key);
      maps[kind].set(key, r);
    }
  }
  const actors = new Set(b.catalog.actors.map((a) => a.id));
  if (actors.size !== b.catalog.actors.length)
    fail("DUPLICATE_ID", "作成主体の重複");
  const get = (kind: string, key: string) =>
    maps[kind].get(key) || fail("REFERENCE", `${kind}:${key}`);
  for (const withdrawal of b.catalog.withdrawals)
    if (withdrawal.replacement)
      get("question", refKey(withdrawal.replacement));
  const rights = (
    refs: string[],
    adapted: boolean,
    trail = new Set<string>(),
  ) => {
    for (const id of refs) {
      if (trail.has(id)) fail("RIGHTS_CYCLE", id);
      const r = get("rights", id);
      if (
        r.uses.repositoryRedistribution !== "allowed" ||
        r.uses.browserDisplay !== "allowed" ||
        (adapted && r.uses.adaptation !== "allowed") ||
        r.thirdParty.status === "unresolved"
      )
        fail("RIGHTS_USE", id);
      rights(r.thirdParty.rightsRefs, adapted, new Set([...trail, id]));
    }
  };
  const attribute = (a: Attribution) => {
    if (a.origin !== "original" && !a.sourceRefs.length)
      fail("SOURCE_REQUIRED", "公式・改変素材に出典がありません");
    for (const r of a.sourceRefs) {
      const s = get("source", r.sourceId);
      if (a.origin !== "original" && s.availability !== "officially_published")
        fail("OFFICIAL_PUBLICATION", s.id);
    }
    rights(a.rightsRefs, a.origin === "adapted");
    for (const id of a.creatorIds) if (!actors.has(id)) fail("ACTOR_REF", id);
  };
  const content = (c: Content, used: Set<string>) => {
    attribute(c.attribution);
    for (const v of c.blocks) {
      if (v.type === "image") {
        get("asset", v.assetId);
        used.add(v.assetId);
      }
      if (
        v.type === "table" &&
        v.rows.some((r) => r.length !== v.columns.length)
      )
        fail("TABLE_SHAPE", v.caption);
      if (v.type === "formula" && v.format === "latex") validateFormula(v.text);
      if (v.type === "diagram") {
        attribute(v.attribution);
        if (
          ![
            "renderer-diagram-basic",
            activityNetworkRenderer.id,
            "renderer-source-figures",
          ].includes(v.rendererRef.id) ||
          v.rendererRef.version !== "1.0.0"
        )
          fail("RENDERER_REF", "未登録の図描画機能");
        const scene = v.scene;
        if (
          v.rendererRef.id === "renderer-source-figures" &&
          scene.kind !== "source_figure"
        )
          fail("RENDERER_REF", "図型と描画器が不一致");
        if (v.rendererRef.id === activityNetworkRenderer.id)
          readActivityNetwork(scene);
        if (scene.kind === "source_figure") {
          if (v.rendererRef.id !== "renderer-source-figures")
            fail("RENDERER_REF", "図型と描画器が不一致");
          validateSourceFigure(scene);
        } else if (scene.kind === "array") {
          if (
            new Set(scene.cells.map((c) => c.id)).size !== scene.cells.length ||
            scene.cells.some((c, i) => c.index !== i + 1)
          )
            fail("DIAGRAM_ID", "配列図のID又は添字");
        } else {
          const ids = new Set(scene.nodes.map((n) => n.id));
          if (
            ids.size !== scene.nodes.length ||
            new Set(scene.edges.map((e) => e.id)).size !== scene.edges.length
          )
            fail("DIAGRAM_ID", "図IDの重複");
          for (const e of scene.edges)
            if (!ids.has(e.from) || !ids.has(e.to) || e.from === e.to)
              fail("GRAPH_REF", "図の端点不一致");
          if (scene.kind === "flowchart") {
            if (
              scene.nodes.filter((n) => n.role === "start").length !== 1 ||
              scene.nodes.filter((n) => n.role === "end").length !== 1 ||
              scene.edges.some((e) => !e.directed)
            )
              fail("FLOW_STRUCTURE", "開始・終了又は辺の向きが不正です");
            for (const node of scene.nodes) {
              const incoming = scene.edges.filter((e) => e.to === node.id),
                outgoing = scene.edges.filter((e) => e.from === node.id);
              if (
                (node.role === "start" && incoming.length) ||
                (node.role === "end" && outgoing.length) ||
                (["start", "process"].includes(node.role!) &&
                  outgoing.length !== 1) ||
                (node.role === "decision" &&
                  (outgoing.length !== 2 ||
                    outgoing.some((e) => !e.label?.trim()) ||
                    outgoing[0].label === outgoing[1].label))
              )
                fail("FLOW_STRUCTURE", "フローチャートの分岐が不正です");
            }
          }
        }
      }
    }
  };
  for (const s of b.sources) safeUrl(s.url);
  for (const r of b.rights) {
    for (const e of r.evidence as { sourceId: string }[])
      get("source", e.sourceId);
    rights([r.id], false);
  }
  for (const a of b.assets) attribute(a.attribution);
  const lineage = (q: Question, trail = new Set<string>()): Set<string> => {
    const key = refKey({ questionId: q.id, revision: q.revision });
    if (trail.has(key)) fail("DERIVATION_CYCLE", key);
    const out = new Set([key]);
    for (const r of q.origin.derivedFrom)
      for (const ancestor of lineage(
        get("question", refKey(r)),
        new Set([...trail, key]),
      ))
        out.add(ancestor);
    return out;
  };
  for (const q of b.questions) {
    const withdrawn = new Set(
      b.catalog.withdrawals.map((w) => refKey(w.questionRef)),
    );
    if (
      withdrawn.has(refKey({ questionId: q.id, revision: q.revision })) ||
      q.origin.derivedFrom.some((r) => withdrawn.has(refKey(r)))
    )
      fail("RELEASE_GATE", `${q.id}: 取り下げた内容は配布できません`);
    if (q.distribution !== "included" || q.lifecycle !== "active")
      fail("RELEASE_GATE", q.id);
    if (
      Object.values(q.review.checks).some(
        (v) => !["pass", "not_applicable"].includes(v),
      )
    )
      fail("RELEASE_GATE", q.id);
    if (q.origin.kind !== "original" && !q.origin.sourceRefs.length)
      fail("SOURCE_REQUIRED", q.id);
    for (const r of q.origin.sourceRefs) get("source", r.sourceId);
    const ancestors = [...lineage(q)].map(
      (key) => get("question", key) as Question,
    );
    if (
      q.origin.kind === "official_reprint" &&
      q.prompt.attribution.origin !== "official"
    )
      fail("RIGHTS_PROVENANCE", `${q.id}: 再録本文は公式由来として記録する`);
    if (q.origin.kind === "official_adaptation") {
      if (q.prompt.attribution.origin !== "adapted")
        fail(
          "RIGHTS_PROVENANCE",
          `${q.id}: 公式依存の改変本文を独立作成へ変更できない`,
        );
      const roots = ancestors.filter(
        (a) => a.origin.kind === "official_reprint",
      );
      for (const root of roots) {
        for (const ref of root.origin.sourceRefs)
          if (
            !q.origin.sourceRefs.some(
              (r) =>
                r.sourceId === ref.sourceId &&
                r.locator.year === ref.locator.year &&
                r.locator.subject === ref.locator.subject &&
                r.locator.questionNumber === ref.locator.questionNumber,
            )
          )
            fail("SOURCE_INHERITANCE", `${q.id}: 原問題の出典を継承する`);
        for (const id of root.prompt.attribution.rightsRefs)
          if (!q.prompt.attribution.rightsRefs.includes(id))
            fail("RIGHTS_INHERITANCE", `${q.id}: 原部分の条件を継承する`);
      }
    }
    if (!q.choices.some((c) => c.id === q.correctAnswer.choiceId))
      fail("ANSWER_REF", q.id);
    if (new Set(q.choices.map((c) => c.id)).size !== q.choices.length)
      fail("DUPLICATE_ID", q.id);
    const contexts = new Set(q.contexts.map((c) => c.id));
    for (const id of q.contextRefs)
      if (!contexts.has(id)) fail("CONTEXT_REF", id);
    const used = new Set<string>();
    for (const c of [
      q.prompt,
      q.explanation,
      ...q.choices.map((c) => c.content),
      ...q.contexts.map((c) => c.content),
    ])
      content(c, used);
    attribute(q.correctAnswer.attribution);
    if (
      used.size !== q.assetRefs.length ||
      q.assetRefs.some((id) => !used.has(id))
    )
      fail("ASSET_REF", q.id);
  }
  for (const t of b.templates) {
    const q = get("question", refKey(t.baseQuestionRef));
    attribute(t.attribution);
    if (t.distribution !== "included" || t.lifecycle !== "active")
      fail("RELEASE_GATE", t.id);
    validateTemplateContract(t);
    validateSourceFormat(q, t);
    if ((await contentHash(q)) !== t.originalContentSha256)
      fail("TEMPLATE_ORIGINAL_HASH", t.id);
  }
  const usedAssets = new Set(b.questions.flatMap((q) => q.assetRefs));
  for (const a of b.assets)
    if (!usedAssets.has(a.id))
      fail("RELEASE_GATE", `${a.id}: 未使用の画像を配布カタログへ残せません`);
  for (const s of b.sets) {
    if (s.distribution !== "included") fail("RELEASE_GATE", s.id);
    const subjects = new Set<Question["subject"]>();
    for (const r of s.questionRefs) {
      const question = get("question", refKey(r));
      subjects.add(question.subject);
      if (s.subject !== "mixed" && question.subject !== s.subject)
        fail("SUBJECT", s.id);
    }
    if (s.subject === "mixed" && subjects.size !== 2)
      fail("SUBJECT", s.id);
    for (const e of s.examConfigRefs)
      if (get("exam", `${e.id}@${e.revision}`).subject !== s.subject)
        fail("SUBJECT", s.id);
    for (const g of s.generationBindings) {
      const t = get(
        "template",
        `${g.templateRef.id}@${g.templateRef.revision}`,
      );
      if (
        refKey(t.baseQuestionRef) !== refKey(g.questionRef) ||
        !s.questionRefs.some((r) => refKey(r) === refKey(g.questionRef))
      )
        fail("BINDING_REF", s.id);
    }
  }
  validateGenerationCoverage(b);
}
