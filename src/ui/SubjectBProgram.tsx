import { ContentBlank, type ContentBlankPart } from "./ContentText";

const blankMarker = (label: string) => `【${label || "空欄"}】`;
function splitBlanks(text: string, pattern: RegExp, unnamedA = false): (string | ContentBlankPart)[] {
  const parts: (string | ContentBlankPart)[] = [];
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    const label = match[1] ?? match[2];
    parts.push(text.slice(end, match.index), { blank: !label || label === "空欄" || (unnamedA && label === "a") ? "" : label });
    end = match.index + match[0].length;
  }
  parts.push(text.slice(end));
  return parts;
}

// Older sample bindings use bare 「空欄」 both as a placeholder and as prose.
// Recognize the actual slots in the source's sentence, leaving other uses alone.
const sampleProseSlots: Partial<Record<string, RegExp>> = {
  "sample-2022-apr-b-4": /(?<=\{)空欄([abc])(?=\})/g,
  "sample-2022-dec-b-1": /(?<=“)空欄(?=”)/g,
  "sample-2022-dec-b-3": /空欄(?=となる)/g,
  "sample-2022-dec-b-8": /空欄(?=の順となる)/g,
  "sample-2022-dec-b-9": /空欄(?=の順に出力される)/g,
  "sample-2022-dec-b-11": /空欄(?=\)として呼び出す)/g,
  "sample-2022-dec-b-13": /空欄(?=の条件を満たす)/g,
  "sample-2022-dec-b-14": /空欄(?=である)/g,
  "sample-2022-dec-b-15": /空欄([ab])(?=[、で])/g,
  "sample-2022-dec-b-16": /空欄(?=には同じ答えが入る)/g,
};

export function subjectBParagraphSegments(text: string, source: string) {
  let marked = text.replace(
    /^(次の(?:プログラム|記述)中の)空欄(【[a-z]】|[a-z])?(?:([と〜])(【[a-z]】|[a-z]))?(?=に入れる)/,
    (_, prefix, first, join, second) => {
      const slot = (token?: string) => token?.startsWith("【") ? token : blankMarker(token ?? "");
      return prefix + slot(first) + (second ? join + slot(second) : "");
    },
  );
  const proseSlots = sampleProseSlots[source];
  if (proseSlots) marked = marked.replace(proseSlots, (_, label) => blankMarker(typeof label === "string" ? label : ""));
  if (source === "sample-2022-dec-b-19")
    marked = marked.replace("表1中の空欄a1、a2", "表1中の【a1】、【a2】");
  return splitBlanks(marked, /【(空欄|[a-z]\d?)】/g);
}

export function subjectBTableBlank(source: string, caption: string, cell: string) {
  if (source === "2025-b-5" && caption === "表2　理論度数（人）" && /^[ab]$/.test(cell)) return cell;
  if (source === "sample-2022-dec-b-19" && /^表1\s/.test(caption) && /^空欄a[12]$/.test(cell)) return cell.slice(2);
  return undefined;
}

// Source pages sometimes separate stages within a single routine, too.
// Use anchors in the generated program rather than line numbers: variable
// inputs may add lines or change their contents without moving these boundaries.
const stageStarts: Partial<Record<string, RegExp>> = {
  "2023-b-1": /^ {8}\/\* floor\(sqrt/,
  "2023-b-3": /^ {4}while \(true\)/,
  "2023-b-5": /^ {4}(?:for \(iを.*vector1|temp ← 0|similarity ←)/,
  "2024-b-4": /^ {4}(?:while \(|return work$)/,
  "2024-b-5": /^ {4}(?:文字列型の配列: otherItems|整数型: i, itemCount|for \(orderに)/,
  "2025-b-1": /^ {4}for \(【b】\)/,
  "2025-b-4": /^ {4}(?:lenData ←|\/\* \(lenData)/,
  "2026-b-3": /^ {4}\/\* nが3より小さい場合/,
  "2026-b-5": /^ {4}for \([ij]を/,
  "sample-2022-apr-b-2": /^for \(left /,
  "sample-2022-apr-b-5": /^\/\* c1の次/,
  "sample-2022-dec-b-11": /^ {2}(?:for \(i |return bins$)/,
  "sample-2022-dec-b-13": /^ {2}(?:low ←|while \(|return −1$)/,
};

function programSpacing(text: string, source: string) {
  const lines = text.split(/\r?\n/);
  return lines.flatMap((line, index) => {
    const previous = lines[index - 1];
    const routineStart = line.startsWith("○") && !previous?.startsWith("/*");
    return previous?.trim() && (routineStart || stageStarts[source]?.test(line)) ? ["", line] : [line];
  }).join("\n");
}

// These three bindings historically use 【a】 for a single, unlettered slot.
const unnamedA = ["2025-b-2", "2026-b-2", "2026-b-3"];

export function SubjectBProgram({ text, source, answerChoice }: { text: string; source: string; answerChoice: boolean }) {
  const program = answerChoice ? text : programSpacing(text, source);
  return (
    <div className={answerChoice ? "subject-b-code-choice" : "subject-b-program"}>
      {!answerChoice && <div>［プログラム］</div>}
      <pre><code>{answerChoice ? program : splitBlanks(program, /【(空欄|[a-z])】|空欄([a-z])?/g, unnamedA.includes(source)).map((part, i) =>
        typeof part === "string" ? part : <ContentBlank key={i} blank={part.blank} />
      )}</code></pre>
    </div>
  );
}
