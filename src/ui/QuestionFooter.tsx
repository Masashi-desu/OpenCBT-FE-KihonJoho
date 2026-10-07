import { useId, useState } from "react";
import { ChevronDown, ExternalLink, Scale } from "lucide-react";
import type {
  Attribution,
  Bundle,
  Content,
  Entry,
  Question,
  SourceRef,
} from "../core/types";
import { labels } from "../core/types";
import { safeUrl } from "../core/validation";

export const screenNotice =
  "非公式の学習教材です。公開情報をもとにCBTの画面・操作を再現しています。実際の試験画面・動作とは異なる場合があります。";

function sourceKey(ref: SourceRef) {
  const l = ref.locator;
  return JSON.stringify([
    ref.sourceId,
    l.section,
    l.page,
    l.year,
    l.exam,
    l.subject,
    l.questionNumber,
  ]);
}

function attributionKey(a: Attribution) {
  return JSON.stringify([
    a.origin,
    a.sourceRefs.map(sourceKey).sort(),
    [...a.rightsRefs].sort(),
    [...a.creatorIds].sort(),
  ]);
}

// Group identical conditions while keeping each affected material identifiable.
export function questionCredits(
  question: Question,
  bundle: Bundle,
  choiceOrder: string[],
  revealed: boolean,
) {
  const groups = new Map<
    string,
    { attribution: Attribution; scopes: Set<string> }
  >();
  const add = (scope: string, attribution: Attribution) => {
    const key = attributionKey(attribution);
    const group = groups.get(key);
    if (group) group.scopes.add(scope);
    else groups.set(key, { attribution, scopes: new Set([scope]) });
  };
  const content = (scope: string, value: Content) => {
    add(scope, value.attribution);
    for (const [index, block] of value.blocks.entries()) {
      const attribution =
        block.type === "diagram"
          ? block.attribution
          : block.type === "image"
            ? bundle.assets.find((a) => a.id === block.assetId)?.attribution
            : undefined;
      if (!attribution) continue;
      const kind = block.type === "diagram" ? "図表" : "画像";
      const caption =
        "caption" in block && block.caption
          ? block.caption
          : `${kind}${index + 1}`;
      add(
        attributionKey(attribution) === attributionKey(value.attribution)
          ? scope
          : `${scope}の${kind}「${caption}」`,
        attribution,
      );
    }
  };
  for (const id of question.contextRefs) {
    const context = question.contexts.find((c) => c.id === id)!;
    content(`資料「${context.title}」`, context.content);
  }
  content("問題本文", question.prompt);
  const choiceConditions = (value: Content) =>
    JSON.stringify(
      [
        ...new Set([
          attributionKey(value.attribution),
          ...value.blocks.flatMap((block) => {
            const a =
              block.type === "diagram"
                ? block.attribution
                : block.type === "image"
                  ? bundle.assets.find((asset) => asset.id === block.assetId)
                      ?.attribution
                  : undefined;
            return a ? [attributionKey(a)] : [];
          }),
        ]),
      ].sort(),
    );
  const sameChoices = question.choices.every(
    (c) =>
      choiceConditions(c.content) ===
      choiceConditions(question.choices[0].content),
  );
  for (const [index, id] of choiceOrder.entries()) {
    const choice = question.choices.find((c) => c.id === id)!;
    content(sameChoices ? "選択肢" : `選択肢 ${labels[index]}`, choice.content);
  }
  if (revealed) {
    add("正答", question.correctAnswer.attribution);
    content("解説", question.explanation);
  }
  return [...groups.values()];
}

function SourceLink({
  reference,
  bundle,
}: {
  reference: SourceRef;
  bundle: Bundle;
}) {
  const source = bundle.sources.find((s) => s.id === reference.sourceId);
  if (!source) return null;
  const l = reference.locator;
  const location =
    [
      l.year && `${l.year}年度`,
      l.exam,
      l.subject,
      l.questionNumber && `問${l.questionNumber}`,
    ]
      .filter(Boolean)
      .join(" ") || `${source.title} ${l.section}`;
  return (
    <span className="footer-source">
      {location} ·{" "}
      <a
        href={safeUrl(source.url) + (l.page ? `#page=${l.page}` : "")}
        target="_blank"
        rel="noopener noreferrer"
      >
        原資料{l.page ? ` p.${l.page}` : ""}
      </a>
    </span>
  );
}

export function QuestionFooter({
  question,
  bundle,
  entry,
  revealed,
  onSource,
  onLicenses,
}: {
  question: Question;
  bundle: Bundle;
  entry: Entry;
  revealed: boolean;
  onSource: () => void;
  onLicenses: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const credits = questionCredits(
    question,
    bundle,
    entry.choiceOrder,
    revealed,
  );
  const rights = [
    ...new Set(credits.flatMap(({ attribution }) => attribution.rightsRefs)),
  ].map((id) => bundle.rights.find((right) => right.id === id)!);
  const sourceKeys = new Set(question.origin.sourceRefs.map(sourceKey));
  const summaries = [
    ...new Set(
      question.origin.changes
        .filter((c) => !["transcription", "layout"].includes(c.kind))
        .map((c) => c.summary),
    ),
  ];
  return (
    <footer
      className={`question-footer ${expanded ? "expanded" : "compact"}`}
      aria-label="出典・ライセンス・改変情報"
      tabIndex={expanded ? 0 : undefined}
    >
      <div className="question-footer-overview">
        <div
          className="footer-overview-content"
          role="group"
          aria-label="出典と権利の要約"
          tabIndex={expanded ? undefined : 0}
        >
          <div className="question-footer-heading">
            <span
              className={
                entry.issuedContent.isModified
                  ? "origin-pill modified"
                  : "origin-pill"
              }
            >
              {question.origin.kind === "official_reprint"
                ? "公式公開問題"
                : question.origin.kind === "official_adaptation"
                  ? "公式問題を基にした問題"
                  : "独自問題"}{" "}
              · 改変{entry.issuedContent.isModified ? "あり" : "なし"}
            </span>
            {question.origin.sourceRefs.length > 0 && (
              <div className="footer-sources">
                出典：
                {question.origin.sourceRefs.map((reference, index) => (
                  <SourceLink
                    key={index}
                    reference={reference}
                    bundle={bundle}
                  />
                ))}
              </div>
            )}
          </div>
          {!expanded && (
            <div className="footer-brief">
              <p className="footer-rights">
                {rights.map((right, index) => (
                  <span key={right.id}>
                    {index > 0 && " · "}
                    {right.attributionText}
                    {!right.licenseId.startsWith("LicenseRef-") &&
                      `（${right.licenseId}）`}
                  </span>
                ))}
              </p>
              <p className="exam-disclaimer">
                非公式の学習教材です。
              </p>
            </div>
          )}
        </div>
        <button
          className="footer-expand"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDown size={14} aria-hidden="true" />
          {expanded ? "詳細を閉じる" : "詳細を展開"}
        </button>
      </div>
      <div id={detailsId} hidden={!expanded}>
        <div className="question-footer-credits">
          {credits.map(({ attribution, scopes }, index) => (
            <p key={index}>
              <strong>{[...scopes].join("・")}：</strong>
              {attribution.origin === "original"
                ? "独自記述"
                : attribution.origin === "adapted"
                  ? "改変部分"
                  : "公式再録"}
              {attribution.rightsRefs.map((id) => {
                const right = bundle.rights.find((r) => r.id === id);
                return right ? (
                  <span key={id}>
                    {" "}
                    · {right.attributionText}
                    {!right.licenseId.startsWith("LicenseRef-") &&
                      `（${right.licenseId}）`}
                  </span>
                ) : null;
              })}
              {attribution.sourceRefs
                .filter((r) => !sourceKeys.has(sourceKey(r)))
                .map((reference, i) => (
                  <span key={i}>
                    {" "}
                    · <SourceLink reference={reference} bundle={bundle} />
                  </span>
                ))}
            </p>
          ))}
          {summaries.length > 0 && (
            <p className="footer-changes">改変：{summaries.join("／")}</p>
          )}
        </div>
        <div className="question-footer-links">
          <button onClick={onSource}>
            <ExternalLink size={13} />
            出典・改変詳細
          </button>
          <button onClick={onLicenses}>
            <Scale size={13} />
            ライセンス表記
          </button>
        </div>
        <p className="exam-disclaimer">{screenNotice}</p>
      </div>
    </footer>
  );
}
