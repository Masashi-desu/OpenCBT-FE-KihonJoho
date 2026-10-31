import type { Block, Content, Question } from "../types";
import { DataError } from "../errors";
import { sortedJson } from "../hash";

export const isLegacyMorningSource = (source: string) =>
  /^(?:2017h29[ha]|2018h30[ha]|2019h31h|2019r01a)-fe-am-(?:[1-9]|[1-7]\d|80)$/.test(source);
const commonProfiles: Record<string, string> = {
  "2017h29a-fe-am": "legacy-2017-autumn-am-common-gates",
  "2018h30h-fe-am": "legacy-2018-spring-am-common-gates",
  "2018h30a-fe-am": "legacy-2018-autumn-am-common-gates",
  "2019r01a-fe-am": "legacy-2019-autumn-am-common-gates",
};

export function morningQuestionCollection(q: Question): string | undefined {
  const l = q.origin.sourceRefs.find(r => r.locator.timeSlot === "午前" &&
    [2017, 2018, 2019].includes(r.locator.year ?? 0))?.locator;
  if (!l || !["春期", "秋期"].includes(l.period ?? "")) return;
  return l.year === 2017 ? `2017h29${l.period === "春期" ? "h" : "a"}-fe-am` :
    l.year === 2018 ? `2018h30${l.period === "春期" ? "h" : "a"}-fe-am` :
      l.period === "春期" ? "2019h31h-fe-am" : "2019r01a-fe-am";
}
export function isMorningCommonContext(q: Question, context: Question["contexts"][number]): boolean {
  const collection = morningQuestionCollection(q);
  return !!collection && Object.hasOwn(commonProfiles, collection) &&
    context.id === `context-${collection}-common` &&
    context.content.attribution.sourceRefs.some(r => r.locator.page === 2 && !r.locator.questionNumber);
}

/** Only the four source booklets with an actual page2 table can supply it.
 * Native material is preserved from the validated base, never from a bitmap. */
export function morningCommonContexts(q: Question, source: string): Question["contexts"] {
  const collection = source.replace(/-\d+$/, ""), expected = commonProfiles[collection];
  const common = q.contexts.filter(c => c.id === `context-${collection}-common`);
  if (!common.length) return [];
  if (!expected || common.length !== 1 || morningQuestionCollection(q) !== collection ||
      !isMorningCommonContext(q, common[0]))
    throw new DataError("SOURCE_FORMAT", "旧午前の共通資料が原冊子と一致しません");
  const blocks = common[0].content.blocks;
  const diagram = blocks.at(-1);
  const frame = collection === "2019r01a-fe-am" ? blocks.length === 3 &&
    blocks[0].type === "paragraph" && blocks[1].type === "paragraph" &&
    blocks[0].text === "各問題文中に注記がない限り，次の表記ルールが適用されているものとする。" &&
    blocks[1].text === "〔論理回路〕" : blocks.length === 1;
  if (!frame || diagram?.type !== "diagram" || diagram.scene.kind !== "source_figure" ||
      diagram.scene.profile !== expected || diagram.scene.values.length !== 1 || diagram.scene.values[0] !== 0)
    throw new DataError("SOURCE_FORMAT", "共通表記は登録済みの管理描画で保持します");
  return structuredClone(common);
}

/** Paragraph splitting does not change a material role. In particular the
 * reviewed PC-port condition appends an answer-before assumption paragraph.
 * Every structured block remains a separate slot with its original metadata. */
export function morningBlockRoles(blocks: readonly Block[]) {
  return blocks.filter((b,i)=>b.type!=="paragraph"||i===0||blocks[i-1].type!=="paragraph").map(b=>b.type);
}
function materialRuns(blocks: readonly Block[]) {
  const runs: Block[][]=[];
  for(const b of blocks){if(b.type==="paragraph"&&runs.at(-1)?.[0].type==="paragraph")runs.at(-1)!.push(b);else runs.push([b]);}
  return runs;
}

/** Source-local credits and reviewed caption presentation belong to the
 * original material slots, independently of shuffled answer labels. */
export function bindMorningContent(blocks: readonly Block[], base: Content, editors: readonly string[]): Content {
  const inputRuns=materialRuns(blocks), baseRuns=materialRuns(base.blocks);
  if(inputRuns.length!==baseRuns.length||inputRuns.some((run,i)=>run[0].type!==baseRuns[i][0].type))
    throw new DataError("SOURCE_FORMAT", "旧午前の素材構成が基準と一致しません");
  const originals=inputRuns.flatMap((run,i)=>run.map((_,j)=>baseRuns[i][j]??baseRuns[i][0]));
  const semantic = (block: Block) => {
    const value = {...block} as unknown as Record<string,unknown>;
    delete value.captionPresentation; delete value.sourceLabels;
    if(block.type === "diagram"){ delete value.id; delete value.attribution; }
    return JSON.stringify(sortedJson(value));
  };
  function attribution(a: Content["attribution"], changed: boolean) {
    const owned = structuredClone(a);
    if (changed && owned.origin === "official") {
      if (!editors.length) throw new DataError("SOURCE_FORMAT", "改変部分の編集者がありません");
      owned.origin = "adapted";
      owned.creatorIds = [...new Set([...owned.creatorIds,...editors])];
    }
    return owned;
  }
  return { attribution: attribution(base.attribution,JSON.stringify(blocks.map(semantic))!==JSON.stringify(base.blocks.map(semantic))), blocks: blocks.map((input, i) => {
    const b = structuredClone(input), original = originals[i];
    if ((b.type === "table" || b.type === "diagram") && (original.type === "table" || original.type === "diagram")) {
      if ((original.captionPresentation || original.sourceLabels) && b.caption !== original.caption)
        throw new DataError("SOURCE_FORMAT", "査読した図表名の役割が変わっています");
      if (original.captionPresentation) b.captionPresentation = original.captionPresentation;
      if (original.sourceLabels) b.sourceLabels = structuredClone(original.sourceLabels);
    }
    if (b.type === "diagram" && original.type === "diagram") b.attribution = attribution(original.attribution,semantic(input)!==semantic(original));
    return b;
  }) };
}
