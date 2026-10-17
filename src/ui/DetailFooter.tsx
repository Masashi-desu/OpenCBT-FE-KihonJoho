import { useState } from "react";
import { ExternalLink, Scale } from "lucide-react";
import type { Bundle } from "../core/types";
import type { DetailPresentation } from "../core/detailed-explanation";
import { Dialog } from "./Dialog";
import { SourceLink, screenNotice } from "./QuestionFooter";

/** Credits describe the visible lesson, independently of the question used to open it. */
export function DetailFooter({ presentation, bundle, onLicenses }: {
  presentation: DetailPresentation; bundle: Bundle; onLicenses: () => void;
}) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const { title, attribution, modificationSummary } = presentation;
  const rights = attribution.rightsRefs.map(id => bundle.rights.find(right => right.id === id)!);
  const adapted = attribution.origin === "adapted";
  return <>
    <footer className="question-footer expanded" aria-label="出典・ライセンス・改変情報" tabIndex={0}>
      <div className="question-footer-overview">
        <div className="footer-overview-content" role="group" aria-label="出典と権利の要約">
          <div className="question-footer-heading">
            <span className={adapted ? "origin-pill modified" : "origin-pill"}>
              詳細解説 · {adapted ? "原資料に基づく改変あり" : attribution.origin === "original" ? "独自作成" : "公式再録"}
            </span>
            {!attribution.sourceRefs.length && <span>{title}</span>}
            {attribution.sourceRefs.length > 0 && <div className="footer-sources">
              出典：{attribution.sourceRefs.map((reference, index) => <SourceLink key={index} reference={reference} bundle={bundle} />)}
            </div>}
          </div>
        </div>
      </div>
      <div className="question-footer-credits">
        {rights.map(right => <p key={right.id}>
          <strong>{right.basis === "own_work" ? "独自解説・追加表現" : "原資料に基づく部分"}：</strong>
          {right.attributionText}{!right.licenseId.startsWith("LicenseRef-") && `（${right.licenseId}）`}
        </p>)}
        {modificationSummary && <p className="footer-changes">改変：{modificationSummary}</p>}
      </div>
      <div className="question-footer-links">
        <button onClick={() => setSourceOpen(true)}><ExternalLink size={13} />出典・改変詳細</button>
        <button onClick={onLicenses}><Scale size={13} />ライセンス表記</button>
      </div>
      <p className="exam-disclaimer">{screenNotice}</p>
    </footer>
    {sourceOpen && <Dialog title="表示中の詳細解説の出典・改変" onClose={() => setSourceOpen(false)}>
      <p>{title}</p>
      {attribution.sourceRefs.map((reference, index) => <p key={index}><SourceLink reference={reference} bundle={bundle} /></p>)}
      {modificationSummary && <p>改変：{modificationSummary}</p>}
      <p>作成：{attribution.creatorIds.map(id => bundle.catalog.actors.find(actor => actor.id === id)?.name ?? id).join("・")}</p>
      {rights.map(right => <section key={right.id}>
        <h3>{right.attributionText}</h3>
        <p>{right.scope}</p>
        <p>ライセンス：{right.licenseId}</p>
        <p>{right.assessmentNotes}</p>
      </section>)}
    </Dialog>}
  </>;
}
