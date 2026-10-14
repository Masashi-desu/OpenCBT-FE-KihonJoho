import { useId } from "react";
import type { Bundle } from "../core/types";
import type { DetailManifest } from "../core/detailed-explanation";
import { safeUrl } from "../core/validation";

export function DetailReferences({ references, bundle }: {
  references: NonNullable<DetailManifest["references"]>; bundle: Bundle;
}) {
  const headingId = useId();
  return <section className="detail-references" aria-labelledby={headingId}>
    <h2 id={headingId}>{references.title}</h2>
    <ul>
      {references.sourceRefs.map((ref, index) => {
        const source = bundle.sources.find(value => value.id === ref.sourceId);
        if (!source) return null;
        return <li key={index}><a href={safeUrl(source.url) + (ref.locator.page ? `#page=${ref.locator.page}` : "")}
          target="_blank" rel="noopener noreferrer" title={source.title}
          aria-label={source.title + (ref.locator.page ? ` p.${ref.locator.page}` : "")}>
          {source.title.split(": ").at(-1)}{ref.locator.page ? ` p.${ref.locator.page}` : ""}
        </a></li>;
      })}
    </ul>
  </section>;
}
