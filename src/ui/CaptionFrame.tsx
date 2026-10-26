import type { ReactNode } from "react";
import type { CaptionMetadata } from "../core/types";

/** Keep semantic names available to assistive technology, without inventing
 * visible source titles. Original labels retain their separately reviewed position. */
export function CaptionFrame({ metadata, children }: { metadata: CaptionMetadata; children: ReactNode }) {
  if (metadata.captionPresentation !== "accessible") return children;
  const labels = metadata.sourceLabels ?? [], side = labels.filter(l => l.position === "start");
  return <div className="caption-accessible">
    {labels.filter(l => l.position !== "start").map((label, i) =>
      <span key={i} className={`source-caption-label source-label-${label.position}`} aria-hidden="true">{label.text}</span>)}
    <div className={side.length ? "source-caption-with-side" : undefined}>
      {side.map((label, i) => <span key={i} className="source-caption-label" aria-hidden="true">{label.text}</span>)}
      <div className="source-caption-body">{children}</div>
    </div>
  </div>;
}
