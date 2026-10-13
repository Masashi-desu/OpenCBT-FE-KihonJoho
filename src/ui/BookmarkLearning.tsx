import type { Question } from "../core/types";

export function BookmarkLearning({
  areaLabel,
  learning,
}: {
  areaLabel: string;
  learning?: Question["learning"];
}) {
  const topics = learning?.topics ?? [],
    keywords = (learning?.keywords ?? []).filter((word) => !topics.includes(word));
  return (
    <div className="bookmark-meta">
      <span className="bookmark-genre">{areaLabel}</span>
      {topics.map((topic) => (
        <span className="bookmark-topic" key={topic}>{topic}</span>
      ))}
      {keywords.map((keyword) => (
        <span className="bookmark-keyword" key={keyword}>{keyword}</span>
      ))}
      <span>時間制限なし</span>
    </div>
  );
}
