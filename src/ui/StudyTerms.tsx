import type { Asset, Question } from "../core/types";
import { questionStudyTerms } from "../core/study-terms";

export function StudyTerms({
  question,
  assets,
}: {
  question: Question;
  assets: Asset[];
}) {
  const terms = questionStudyTerms(question, assets);
  if (!terms.length) return null;
  return (
    <div className="study-terms">
      <h3>用語の補足</h3>
      <dl>
        {terms.map(({ term, expansion, meaning }) => (
          <div key={term}>
            <dt>
              {term}
              {expansion && <span lang="en">（{expansion}）</span>}
            </dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
