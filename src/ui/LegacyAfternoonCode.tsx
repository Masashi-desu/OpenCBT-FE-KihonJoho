import type { Attribution } from "../core/types";
import { legacy2017Pm9Definition } from "../core/generators/legacy-2017-pm9";
import { legacy2017Pm12Definition } from "../core/generators/legacy-2017-pm12";

const registered = new Map<string, Set<string>>();
for (const definition of [legacy2017Pm9Definition, legacy2017Pm12Definition]) {
  const texts = new Set<string>();
  for (let value = definition.fields[0].minimum; value <= definition.fields[0].maximum; value++)
    for (const block of definition.build([value]).prompt)
      if (block.type === "code") texts.add(`${block.language}\n${block.text}`);
  registered.set(`source-ipa-${definition.source}-qs`, texts);
}

/** A bracketed array subscript in arbitrary code is not a source blank. Only
 * these complete, registered program texts admit the reviewed hole notation. */
export function LegacyAfternoonCode({ text, language, attribution }: { text: string; language: string; attribution: Attribution }) {
  const source = attribution.sourceRefs.find(ref => registered.get(ref.sourceId)?.has(`${language}\n${text}`));
  if (!source) return text;
  return <>{text.split(/(\[[a-g]\]|［[a-g]］)/).map((part, index) =>
    /^(?:\[[a-g]\]|［[a-g]］)$/.test(part)
      ? <span className="source-code-blank" data-source-blank={part[1]} aria-label={`空欄${part[1]}`} key={index}>{part[1]}</span>
      : part)}</>;
}
