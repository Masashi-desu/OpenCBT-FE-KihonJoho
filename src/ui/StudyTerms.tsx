import type { Asset, Question } from "../core/types";
import { questionStudyTerms } from "../core/study-terms";
import { contentTextParts, isStudyTermCobolIdentifier } from "./ContentText";

/** Keep only source-reviewed complete COBOL names whole; other text stays plain. */
export function StudyTermMeaning({meaning}:{meaning:string}) {
  const parts=contentTextParts(meaning);
  if (!parts.some(part=>part.atomic && isStudyTermCobolIdentifier(part.text))) return meaning;
  return <>{parts.map((part,i)=>part.atomic && isStudyTermCobolIdentifier(part.text)
    ? <span key={i} className="content-text-token">{part.text}</span> : part.text)}</>;
}

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
            <dd><StudyTermMeaning meaning={meaning}/></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
