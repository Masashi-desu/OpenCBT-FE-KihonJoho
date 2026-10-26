import type { Bundle, Content, Question } from "../core/types";
import { labels } from "../core/types";
import { sortedJson } from "../core/hash";
import { AttributionLine } from "./Content";

/** Group identical conditions, while retaining the displayed choice labels and
 * the individual conditions of diagrams/images inside each material. */
export function questionMaterialCredits(question: Question, bundle: Bundle, choiceOrder: readonly string[]) {
  const materials = [
    { label: "問題本文", content: question.prompt },
    ...question.contextRefs.map(id => {
      const c = question.contexts.find(c => c.id === id)!;
      return { label: `参照資料「${c.title}」`, content: c.content };
    }),
    ...choiceOrder.map((id, i) => ({ label: `選択肢${labels[i] ?? i + 1}`,
      content: question.choices.find(c => c.id === id)!.content })),
  ];
  const groups = new Map<string, { labels: string[]; content: Content }>();
  function add(label: string, content: Content) {
    const key = JSON.stringify(sortedJson(content.attribution)), old = groups.get(key);
    if (old) old.labels.push(label);
    else groups.set(key, { labels: [label], content });
  }
  for (const { label, content } of materials) {
    add(label, content);
    for (const block of content.blocks) {
      const attribution = block.type === "diagram" ? block.attribution :
        block.type === "image" ? bundle.assets.find(a => a.id === block.assetId)?.attribution : undefined;
      if (attribution && JSON.stringify(sortedJson(attribution)) !== JSON.stringify(sortedJson(content.attribution)))
        add(`${label}の図・画像`, { attribution, blocks: [] });
    }
  }
  return [...groups.values()];
}

export function QuestionMaterialCredits({ question, bundle, choiceOrder }: {
  question: Question; bundle: Bundle; choiceOrder: readonly string[];
}) {
  return <>{questionMaterialCredits(question, bundle, choiceOrder).map((group, i) =>
    <section key={i} className="material-conditions">
      <h4>{group.labels.join("・")}</h4>
      <AttributionLine content={group.content} bundle={bundle}/>
      {group.content.attribution.rightsRefs.map(id => {
        const rights = bundle.rights.find(r => r.id === id)!;
        return <details key={id}>
          <summary>{rights.attributionText}</summary>
          <p>権利者：{rights.holders.join("・")}</p>
          <p>適用範囲：{rights.scope}</p>
          <p>利用根拠：{rights.basis} · {rights.licenseId}</p>
          <p>{rights.thirdParty.notes}</p>
        </details>;
      })}
    </section>)}</>;
}
