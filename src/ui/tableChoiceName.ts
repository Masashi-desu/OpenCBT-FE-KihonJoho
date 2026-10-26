import type { Bundle, Content } from "../core/types";

const cellName = (text: string) =>
  text === "非表示" ? "原資料で非表示の部分" : text.trim() ? text : "空欄";

/** Native tables contribute only their caption to an implicit radio label.
 * This helper names table-containing choices; diagram-only names are separate.
 * This changes no question data or visible table structure.
 */
export function tableChoiceName(content: Content, bundle: Pick<Bundle, "assets">): string | undefined {
  if (!content.blocks.some(block => block.type === "table")) return undefined;
  return choiceBlocksName(content, bundle);
}

/** A diagram's separate image description is not part of its radio's native
 * name. Include the formal alternative without changing the visible figure.
 * Table-containing choices keep their existing table naming path.
 */
export function diagramChoiceName(content: Content, bundle: Pick<Bundle, "assets">): string | undefined {
  if (content.blocks.some(block => block.type === "table") || !content.blocks.some(block => block.type === "diagram")) return undefined;
  return choiceBlocksName(content, bundle);
}

function choiceBlocksName(content: Content, bundle: Pick<Bundle, "assets">): string {
  return content.blocks.map(block => {
    switch (block.type) {
      case "table": {
        const columns = block.columns.map(column => column.includes("＼")
          ? `${column.split("＼")[0]}は行、${column.split("＼")[1]}は列`
          : cellName(column));
        return [
          `表「${block.caption}」`,
          `列見出し：${columns.join("、")}`,
          ...block.rows.map((row, index) => `${index + 1}行目：${row.map(cellName).join("、")}`),
          "表の終わり",
        ].join("。");
      }
      case "paragraph":
      case "heading": return block.text;
      case "code": return block.language === "text"
        ? `補助テキストを読む（図・空欄は原文画像で確認） PDFの文字情報です。読取り順や図の接続、空欄の形は完全には表せません。 ${block.text}`
        : `${block.language === "sql" ? "SQL" : "疑似言語"} · 表示のみ ${block.text}`;
      case "list": return block.items.join(" ");
      case "formula": return block.format === "latex" ? block.alt : `${block.text} ${block.alt}`;
      case "diagram": return `${block.caption} ${block.alt}`;
      case "image": return `${bundle.assets.find(asset => asset.id === block.assetId)!.alt} ${block.caption}`;
    }
  }).join(" ");
}
