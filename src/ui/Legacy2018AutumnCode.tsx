import { Fragment } from "react";

/** Source-owned wide brackets are answer holes. ASCII array subscripts and
 * unrelated Content retain their ordinary code presentation. */
export function Legacy2018AutumnCode({ text }: { text: string }) {
  return <>{text.split(/(［(?:[a-g]|c[1-3]|　)］)/g).map((part, index) =>
    /^［(?:[a-g]|c[1-3]|　)］$/.test(part)
      ? <span className="autumn2018-blank" data-source-blank={part.slice(1, -1).trim() || "anonymous"}
          aria-label={part.slice(1, -1).trim() ? `空欄${part.slice(1, -1)}` : "空欄"} key={index}>{part.slice(1, -1)}</span>
      : <Fragment key={index}>{part}</Fragment>)}</>;
}
