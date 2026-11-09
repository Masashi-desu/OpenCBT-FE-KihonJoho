import type { Bundle, Question } from "../core/types";
import { Content } from "./Content";
import { materialPages } from "./MaterialViewer";

export function SearchQuestionMaterials({ question, bundle, assetUrls }: {
  question: Question; bundle: Bundle; assetUrls: Record<string, string>;
}) {
  const contexts = materialPages(question).filter(page => page.context);
  const prerequisites = contexts.filter(page => page.commonReference);
  const section = ({ id, label, content }: (typeof contexts)[number]) => (
    <section key={id} aria-label={label}>
      <Content content={content} bundle={bundle} assetUrls={assetUrls} credit />
    </section>
  );
  return <>
    {contexts.filter(page => !page.commonReference).map(section)}
    <Content content={question.prompt} bundle={bundle} assetUrls={assetUrls} credit />
    {prerequisites.length > 0 && <details className="search-question-prerequisites">
      <summary>前提・表記ルール</summary>
      {prerequisites.map(section)}
    </details>}
  </>;
}
