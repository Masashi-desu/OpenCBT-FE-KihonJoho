import stemReview from "../fixtures/reviewed-stem-cohort.json";
import { legacyAfternoonDefinitions } from "../../src/core/generators/legacy-afternoon-definitions";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, installFixtureGenerators } from "../fixtures";
import { additionalDefinitions } from "../../src/core/generators";
import amCapacity from "../fixtures/stage1-am-capacity-review.json";
const amCapacityBySource = new Map(amCapacity.rows.map(r => [r.source, r]));
import { stage3MorningDefinitions, stage3AllMorningDefinitions } from "../../src/core/generators/stage3-morning-install";
import autumn2016FirstReview from "../fixtures/legacy-2016-autumn-am-01-40-review.json";
import autumn2016LastReview from "../fixtures/legacy-2016-autumn-am-41-80-review.json";
import stage3FundamentalsContracts from "../fixtures/legacy-2016-spring-fundamentals-input-contracts.json";
import stage3MiddleReview from "../fixtures/legacy-2016-spring-am-09-32-review.json";
import { knowledgeReview as stage3KnowledgeReview } from "../fixtures/legacy-2016-spring-am-33-56-oracle";
import stage3FinalReview from "../fixtures/legacy-2016-spring-am-57-80-review.json";
const stage3NumericCounts = new Map([[34,4],[35,4],[49,4],[54,4]]);
function stage3MiddleCount(number: number): number {
  const numeric=stage3NumericCounts.get(number);
  if(numeric !== undefined)return numeric;
  const review=stage3KnowledgeReview[number];
  assert(review,"every stage3 knowledge family needs its independent contract");
  return review.targets.length;
}
// These capacities come from the independently reviewed input/meaning records,
// never from counting the production field maxima or recording its answers.
const stage3Counts = new Map<number, number>([
  ...stage3FundamentalsContracts.counts.map((count, index) => [index + 1, count] as [number, number]),
  ...stage3MiddleReview.rows.map(row => [row.number, row.generationReview.finiteInputs] as [number, number]),
  ...[33,34,35,36,37,38,39,40,41,42,43,44,45,47,48,49,50,51,52,53,54,55]
    .map(number => [number, stage3MiddleCount(number)] as [number, number]),
  ...stage3FinalReview.questions.map(row => [row.number, row.generation.finiteInputs] as [number, number]),
]);
// Fixed denotes the reviewed question's answer role. 21/29 bind operands into
// that role;77 varies the actual correct drawing. Those signatures still vary.
const stage3FixedSignatures = new Map([[7,1],[9,1],[10,1],[11,1],[19,1],[21,4],[27,1],[29,4],
  [39,1],[40,1],[44,1],[45,1],[49,1],[53,1],[55,1],[77,12]]);
const isStage3Source = (source: string) => /^2016h28h-fe-am-\d+$/.test(source);
// These reviewed capacities are source-keyed so equal question numbers from
// spring/autumn cannot overwrite each other. They are not field-max counts.
const autumn2016Counts = new Map<string,number>([
  ...autumn2016FirstReview.rows.map(r=>[r.source,r.finiteInputs] as [string,number]),
  ...autumn2016LastReview.questions.map(r=>[`2016h28a-fe-am-${r.number}`,r.variableDesign.finiteConditions] as [string,number]),
]);
// Independent all-choice role review: these18 keep a fixed answer role. Q1
// binds eight different masks into AND, hence eight actual choice signatures.
// Q44/52 now ask distinct reviewed attack/schedule concepts and are variable.
const autumn2016FixedSignatures = new Map<number,number>([[1,8],[3,1],[5,1],[13,1],[14,1],[18,1],
  [19,1],[26,1],[37,1],[38,1],[39,1],[40,1],[41,1],[48,1],[49,1],[50,1],[78,1],[80,1]]);
for (const row of stemReview.rows.filter(row => row.outcome === "revised")) {
  const number = Number(row.source.split("-").at(-1));
  if (row.source.startsWith("2016h28h-fe-am-")) {
    stage3Counts.set(number, stage3Counts.get(number)! + 1);
    stage3FixedSignatures.delete(number);
  }
  if (row.source.startsWith("2016h28a-fe-am-")) {
    autumn2016Counts.set(row.source, autumn2016Counts.get(row.source)! + 1);
    autumn2016FixedSignatures.delete(number);
  }
}
const isAutumn2016Source=(source:string)=>/^2016h28a-fe-am-\d+$/.test(source);
const isAutumn2015Source = (source: string) => /^2015h27a-fe-am-\d+$/.test(source);
const isNativeStage3Source=(source:string)=>isStage3Source(source)||isAutumn2016Source(source);
import {
  bindQuestion,
  parametersForSeed,
  answerSignature,
  answerCanVary,
} from "../../src/core/generation";
import { schema, validateBundle } from "../../src/core/validation";
import { validateSourceFormat } from "../../src/core/generation-formats";
import { generationCoverage } from "../../src/core/generation-coverage";
import { prepareRun, validateRun } from "../../src/core/session";
import { selectQuestions } from "../../src/core/selection";
import { Diagram } from "../../src/ui/Content";
import { validateSourceFigure } from "../../src/core/source-figures";
import { type Block } from "../../src/core/types";
import fs from "node:fs";
import { sourceFigureDomains } from "../../src/core/source-figures";
import { activityNetworkRenderer, readActivityNetwork } from "../../src/core/activity-network";
import morningFigureDomains from "../../src/core/legacy-morning-figure-domains.json";
import {
  partitionFirst,
  doubleHash,
  mergeTailCount,
  matchingPrefixCount,
  expectedCounts,
} from "../../src/core/generators/subject-b";
import {
  circuitValue,
  projectDuration,
  scatterPoints,
} from "../../src/core/generators/subject-a";

// This file declares tests for the actual installed registry, including AM.
// Initialize here before enumerating it; shared raw fixtures stay side-effect free.
await installFixtureGenerators();

type DiagramBlock = Extract<Block, { type: "diagram" }>;
const escapeHTML = (text: string) => text.replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[char]!));
function diagramMarkup(block: DiagramBlock): string {
  // Match Content's actual source-material boundary instead of dropping notices.
  return renderToStaticMarkup(createElement(Diagram, { ...block, materialAttribution: block.attribution }));
}
function assertDiagramMarkup(block: DiagramBlock, html: string, nativeAM: boolean): void {
  assert(!html.includes("<img"));
  assert(!html.includes("<details"));
  assert(!html.includes("diagram-alt"));
  const scene = block.scene;
  const profile = scene.kind === "source_figure" ? scene.profile : "";
  if (profile === "legacy-2010-autumn-am-29-ledger") {
    assert(html.includes('role="group" aria-label="' + escapeHTML(block.caption) + '"'));
    assert(html.includes('aria-description="' + escapeHTML(block.alt) + '"'));
    assert.equal([...html.matchAll(/class="diagram-scroll"/g)].length, 1);
    assert.match(html, /<u>[^<]+番号<\/u>/);
    return;
  }
  if (scene.kind === "source_figure" && profile === "legacy-2015-autumn-am-27-relation") {
    assert(html.includes('role="img" aria-label="' + escapeHTML(block.alt) + '"'));
    assert.equal([...html.matchAll(/class="diagram-scroll"/g)].length, 1);
    assert.equal(html.includes('<u data-primary-key='), scene.values[1] !== 0);
    return;
  }
  const namedHTML = nativeAM && ["legacy-2019-database-diagnosis", "legacy-2019-data-feedback",
    "legacy-2019-truth-table", "legacy-2019-score-relation"].includes(profile);
  if (namedHTML) {
    assert(scene.kind === "source_figure");
    assert(html.startsWith('<figure class="managed-diagram source-figure profile-' + profile + '"'));
    assert(!html.includes("<svg"), "native source table/relation remains semantic HTML");
    const scrollNames: Record<string, string> = {
      "legacy-2019-database-diagnosis": "原因の表。幅が足りない場合は左右にスクロールできます。",
      "legacy-2019-data-feedback": "分析結果の分類表。幅が足りない場合は左右にスクロールできます。",
      "legacy-2019-truth-table": "入力と出力の真理値表。幅が足りない場合は左右にスクロールできます。",
      "legacy-2019-score-relation": "得点表の列。学生番号と科目を組み合わせた主キーは実線下線で示します。",
    };
    assert(html.includes('<div class="diagram-scroll" tabindex="0" aria-label="' + scrollNames[profile] + '">'));
    const captions = [...html.matchAll(/<(?:figcaption|caption)\b[^>]*>([\s\S]*?)<\/(?:figcaption|caption)>/g)];
    assert.deepEqual(captions.map(m => m[1]), [escapeHTML(block.caption)]);
    if (profile === "legacy-2019-score-relation") {
      assert(!html.includes("<table"));
      const p = /<p\b[^>]*>([\s\S]*?)<\/p>/.exec(html)![1];
      assert.equal(p.replace(/<[^>]*>/g, ""), "得点（学生番号、科目、点数）");
      const keys = [...p.matchAll(/<span\b([^>]*)>([^<]*)<\/span>/g)];
      assert.deepEqual(keys.map(m => m[2]), ["学生番号", "科目"]);
      for (const key of keys) {
        assert(key[1].includes("text-decoration-line:underline"));
        assert(key[1].includes("text-decoration-style:solid"));
      }
    } else {
      assert.equal([...html.matchAll(/<table\b/g)].length, 1);
      const tbody = /<tbody>([\s\S]*?)<\/tbody>/.exec(html)![1];
      const rows = [...tbody.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)];
      if (profile === "legacy-2019-database-diagnosis") {
        assert(html.includes('<table data-diagnosis-table="2019h31h-am15"'));
        assert(html.includes('<th scope="col">想定原因</th><th scope="col">調査項目</th>'));
        assert.deepEqual(rows.map(m => /data-investigation="([^"]+)"/.exec(m[1])![1]), [..."abcd"]);
        const causes = [
          ["同一サーバに他のシステムを共存させたことによる負荷の増加", "接続クライアント数の増加による通信量の増加"],
          ["非定型検索による膨大な処理時間を要するSQL文の実行"],
          ["フラグメンテーションによるディスクI/Oの増加"], ["データベースバッファの容量の不足"],
        ];
        rows.forEach((row, i) => {
          assert.deepEqual([...row[2].matchAll(/<li>([^<]*)<\/li>/g)].map(m => m[1]), causes[i]);
          const cells = [...row[2].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)];
          assert.equal(cells.length, 2);
          assert.equal(cells[1][2], "abcd"[i]);
          assert.equal(cells[1][1].includes('data-questioned="true"'), i === scene.values[0]);
          if (i === scene.values[0]) assert(cells[1][1].includes("border:2px solid var(--line)"));
        });
      } else if (profile === "legacy-2019-data-feedback") {
        assert(html.includes('<table data-feedback-table="2019h31h-am64"'));
        assert(html.includes('<th scope="colgroup" colSpan="2">分析結果の反映タイミング</th>'));
        assert(html.includes('<th scope="col">一定期間ごと</th><th scope="col">即時</th>'));
        assert(html.includes('<th scope="rowgroup" rowSpan="2">分析結果の<br/>フィードバック先</th>'));
        assert.deepEqual(rows.map(row => /<th scope="row">([^<]*)<\/th>/.exec(row[2])![1]), ["顧客全体", "顧客個々"]);
        const cells = [...tbody.matchAll(/<td\b([^>]*)>([^<]*)<\/td>/g)];
        assert.deepEqual(cells.map(m => m[2]), [..."abcd"]);
        cells.forEach((cell, i) => {
          assert(cell[1].includes('data-feedback-cell="' + "abcd"[i] + '"'));
          assert.equal(cell[1].includes('data-questioned="true"'), i === scene.values[0]);
          if (i === scene.values[0]) {
            assert(cell[1].includes('aria-label="' + "abcd"[i] + '、問うセル、太枠"'));
            assert(cell[1].includes("border:3px solid var(--text-primary)"));
          }
        });
      } else {
        assert.equal(profile, "legacy-2019-truth-table");
        assert(html.includes('<th scope="colgroup" colSpan="2">入力</th><th scope="col">出力</th>'));
        assert(html.includes('<th scope="col">A</th><th scope="col">B</th><th scope="col">X</th>'));
        // Independently evaluate AND, XOR, NOR and NAND in the source's 00→11 order.
        const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
        const operations = [(a: number, b: number) => a & b, (a: number, b: number) => a ^ b,
          (a: number, b: number) => Number(!(a | b)), (a: number, b: number) => Number(!(a & b))];
        assert.deepEqual(rows.map(row => [...row[2].matchAll(/<td>([01])<\/td>/g)].map(m => Number(m[1]))),
          inputs.map(([a, b]) => [a, b, operations[scene.values[0]](a, b)]));
      }
    }
    return;
  }
  const compositeHTML = nativeAM && /<(?:table|ol|ul)\b/.test(html);
  if (!compositeHTML) {
    if(profile.startsWith("legacy-2016-autumn-am-")){
      assert.equal([...html.matchAll(/<svg\b/g)].length,1);
      assert(html.includes('role="img"'));
      assert(html.includes('class="legacy2016-figure"'));
      if(profile.match(/-(?:marketing|bom|oc|inventory)$/)){
        assert(html.includes('aria-label="'+escapeHTML(block.alt)+'"'));
        assert(html.includes('<title>'+escapeHTML(block.caption)+'</title>'));
      }else{
        assert(/aria-labelledby="[^"]+"/.test(html));assert(/aria-describedby="[^"]+"/.test(html));
        const title=/<title\b[^>]*>([\s\S]*?)<\/title>/.exec(html);assert(title);assert.equal(title[1],escapeHTML(block.caption));
        const desc=/<desc\b[^>]*>([\s\S]*?)<\/desc>/.exec(html);assert(desc);assert.equal(desc[1],escapeHTML(block.alt));
      }
      assert.equal([...html.matchAll(/class="diagram-scroll"/g)].length,1);
      assert(!/NaN|undefined|Infinity/.test(html));return;
    }
    if (profile === "legacy-2016-spring-am-ppm" || profile === "legacy-2016-spring-am-pareto") {
      assert.equal([...html.matchAll(/<svg\b/g)].length, 1);
      assert(html.includes('role="img"'));
      assert(html.includes('aria-label="' + escapeHTML(block.alt) + '"'));
      assert(html.includes('<title>' + escapeHTML(block.caption) + '</title>'));
      assert(!html.includes("NaN"));
      if (profile === "legacy-2016-spring-am-ppm") {
        assert.equal([...html.matchAll(/<rect\b/g)].length,1);
        assert(html.includes('x="155" y="65" width="260" height="260"'));
        assert(html.includes('d="M285 65V325M155 195H415"'));
        for(const text of ["事業の強み（市場シェア）","事業の魅力度（市場成長率）","強","弱","高","低"])
          assert(html.includes('>' + text + '</text>'));
      } else {
        assert(scene.kind === "source_figure");
        const rectangles=[...html.matchAll(/<rect\b([^>]*)>/g)];
        assert.equal(rectangles.length,scene.values[0] === 1 ? 4 : 5);
        for(const rect of rectangles)for(const coordinate of ["x","y","width","height"]){
          const value=new RegExp('\\b'+coordinate+'="([^"]+)"').exec(rect[1]);
          assert(value && Number.isFinite(Number(value[1])));
          if(coordinate === "width" || coordinate === "height")assert(Number(value[1]) > 0);
        }
        const lines=[...html.matchAll(/<polyline\b[^>]*points="([^"]+)"/g)];
        assert.equal(lines.length,1);assert.equal(lines[0][1].split(" ").length,6);
        assert(html.includes('data-role="axes"'));assert(!html.includes("<text"));
      }
      return;
    }
    assert(html.includes("<desc"));
    return;
  }
  // Common pages retain independently named glyphs and visible source explanations.
  if (html.includes('data-common-reference="')) {
    if(profile==="legacy-2016-autumn-am-common-symbols"){
      assert.equal([...html.matchAll(/<table\b/g)].length,2);
      for(const kind of ['論理回路','回路記号'])assert(html.includes('<table aria-label="'+escapeHTML(block.caption+'（'+kind+'）')+'"'));
      assert.deepEqual([...html.matchAll(/data-common-gate="([^"]+)"/g)].map(m=>m[1]),['and','nand','or','nor','xor','xnor','buffer','not','tristate']);
      assert.deepEqual([...html.matchAll(/data-common-circuit="([^"]+)"/g)].map(m=>m[1]),['resistor','capacitor','diode','transistor','ground','amplifier']);
      const rows=[...html.matchAll(/<tr><td><svg\b([^>]*)>[\s\S]*?<\/svg><\/td><td>([^<]+)<\/td><\/tr>/g)];assert.equal(rows.length,15);
      for(const row of rows){assert(row[1].includes('role="img"'));assert(row[1].includes('aria-label="'+row[2]+'"'));}
      assert(html.includes('data-emitter-arrow="outward" data-emitter-branch="lower"'));
      assert(html.includes('data-emitter-arrow="inward" data-emitter-branch="upper"'));
      assert(html.includes('data-positive-input="true"')&&html.includes('data-negative-input="true"'));
      assert(html.includes('○')&&html.includes('論理状態の反転又は否定'));return;
    }
    assert(scene.kind === "source_figure" && /-am-(?:(?:[1-9]|[1-7]\d|80)-)?common-gates$/.test(scene.profile));
    assert(html.includes('<table aria-label="' + escapeHTML(block.caption) + '"'));
    assert(html.includes('<th scope="col">図記号</th><th scope="col">説明</th>'));
    assert.deepEqual([...html.matchAll(/data-common-gate="([^"]+)"/g)].map(m => m[1]),
      ["and", "nand", "or", "nor", "xor", "xnor", "buffer", "not", "tristate"]);
    const glyphRows = [...html.matchAll(/<tr><td><svg\b([^>]*)>[\s\S]*?<\/svg><\/td><td>([^<]+)<\/td><\/tr>/g)]
      .filter(m => m[1].includes('data-common-gate="'));
    assert.equal(glyphRows.length, 9);
    for (const row of glyphRows) {
      assert(row[1].includes('role="img"'));
      assert(row[1].includes('aria-label="' + row[2] + '"'), "glyph name equals its visible source explanation");
    }
    assert(html.includes("○") && html.includes("論理状態の反転又は否定"));
  } else {
    assert(html.includes('role="group"'));
    assert(html.includes('aria-description="' + escapeHTML(block.alt) + '"'));
    assert(/<(?:table|ol|ul)\b/.test(html), "HTML drawing retains its source table/flow structure");
  }
}


export {
  legacyAfternoonDefinitions,
  test,
  assert,
  fixture,
  installFixtureGenerators,
  additionalDefinitions,
  amCapacity,
  amCapacityBySource,
  stage3MorningDefinitions,
  stage3AllMorningDefinitions,
  autumn2016FirstReview,
  autumn2016LastReview,
  stage3Counts,
  stage3FixedSignatures,
  isStage3Source,
  autumn2016Counts,
  autumn2016FixedSignatures,
  isAutumn2016Source,
  isNativeStage3Source,
  isAutumn2015Source,
  bindQuestion,
  parametersForSeed,
  answerSignature,
  answerCanVary,
  schema,
  validateBundle,
  validateSourceFormat,
  generationCoverage,
  prepareRun,
  validateRun,
  selectQuestions,
  Diagram,
  validateSourceFigure,
  fs,
  sourceFigureDomains,
  activityNetworkRenderer,
  readActivityNetwork,
  morningFigureDomains,
  partitionFirst,
  doubleHash,
  mergeTailCount,
  matchingPrefixCount,
  expectedCounts,
  circuitValue,
  projectDuration,
  scatterPoints,
  diagramMarkup,
  assertDiagramMarkup,
  escapeHTML
};
export type { DiagramBlock };
