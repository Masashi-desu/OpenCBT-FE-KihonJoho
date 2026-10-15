import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import type { Bundle, DetailedExplanationRef, Run } from "../core/types";
import {
  DETAIL_TIMEOUT_MS, detailContext, detailMessage, loadDetailPackage, validateDetailAttribution,
  type DetailContext, type DetailPackage, type DetailRoute,
} from "../core/detailed-explanation";
import { prepareDetailDocument } from "./detail-document";
import { AttributionLine } from "./Content";
import { DetailReferences } from "./DetailReferences";
import scrollbarCss from "./scrollbars.css?raw";
import themeCss from "./tokens.css?raw";
import type { Theme } from "./theme";

export const explanationBase = () => new URL(import.meta.env.BASE_URL, location.href.split("#")[0]);
export type PreparedDetail = ReturnType<typeof prepareDetailDocument> & { pkg: DetailPackage };

export function useDetailedExplanation(ref: DetailedExplanationRef | undefined, enabled: boolean, bundle?: Bundle) {
  const key = enabled && ref ? `${ref.directory}:${ref.revision}:${bundle?.catalogHash}` : "";
  const [state, setState] = useState<{ key: string; loading: boolean; prepared?: PreparedDetail }>({ key: "", loading: false });
  useEffect(() => {
    if (!key) { setState({ key, loading: false }); return; }
    const controller = new AbortController();
    setState({ key, loading: true });
    void loadDetailPackage(ref, explanationBase(), controller.signal).then((pkg) => {
      if (controller.signal.aborted) return;
      try {
        if (pkg && bundle) {
          validateDetailAttribution(pkg.manifest, bundle);
          setState({ key, loading: false, prepared: { pkg, ...prepareDetailDocument(pkg) } });
        } else setState({ key, loading: false });
      } catch { setState({ key, loading: false }); }
    });
    return () => controller.abort();
  }, [key]);
  const result = state.key === key ? state : { key, loading: Boolean(key), prepared: undefined };
  return { ...result, disable: () => setState({ key, loading: false }) };
}

export function DetailedExplanation({ run, route, theme, prepared, loading, onBack, onUnavailable }: {
  run: Run; route: DetailRoute; theme: Theme; prepared?: PreparedDetail; loading: boolean;
  onBack: () => void; onUnavailable: () => void;
}) {
  const [context] = useState(() => detailContext(run, route, theme));
  return <DetailViewer bundle={run.bundle} context={context} theme={theme} prepared={prepared}
    loading={loading} onBack={onBack} onUnavailable={onUnavailable} />;
}

export function DetailViewer({ bundle, context, theme, prepared, loading, onBack, onUnavailable, backLabel = "通常解説へ戻る" }: {
  bundle: Bundle; context: DetailContext; theme: Theme; prepared?: PreparedDetail; loading: boolean;
  onBack: () => void; onUnavailable: () => void; backLabel?: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [token] = useState(() => crypto.randomUUID());
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(1);
  const failed = useRef(false);
  const initialized = useRef(false);
  const latestTheme = useRef(theme);
  latestTheme.current = theme;
  const unavailable = useRef(onUnavailable);
  unavailable.current = onUnavailable;
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!loading && !prepared && !failed.current) {
      failed.current = true;
      unavailable.current();
    }
  }, [loading, prepared]);
  useEffect(() => {
    if (!prepared) return;
    const fail = () => {
      if (failed.current) return;
      failed.current = true;
      unavailable.current();
    };
    const timer = setTimeout(fail, DETAIL_TIMEOUT_MS);
    const receive = (event: MessageEvent) => {
      const message = detailMessage(event, frame.current?.contentWindow ?? null, token);
      if (message === "error") {
        clearTimeout(timer); fail();
      } else if (message === "ready" && !failed.current) {
        clearTimeout(timer); setReady(true);
      } else if (typeof message === "object" && !failed.current) {
        setHeight(message.height);
      }
    };
    window.addEventListener("message", receive);
    return () => { clearTimeout(timer); window.removeEventListener("message", receive); };
  }, [prepared, token]);
  useEffect(() => {
    if (ready) frame.current?.contentWindow?.postMessage({
      type: "opencbt:detail:theme", apiVersion: 1, token, theme,
    }, "*"); // The sandbox has an opaque origin; source + per-mount token authenticate replies.
  }, [theme, ready, token]);
  const initialize = () => {
    if (!prepared) return;
    // Never send issued content after a child navigates or reloads itself.
    if (initialized.current) {
      if (!failed.current) { failed.current = true; unavailable.current(); }
      return;
    }
    initialized.current = true;
    frame.current?.contentWindow?.postMessage({
      type: "opencbt:detail:init", apiVersion: 1, token, layout: "document",
      context: { ...context, theme: latestTheme.current }, html: prepared.html,
      assets: prepared.assets, scrollbarCss, themeCss,
    }, "*");
  };
  return (
    <section className="detail-page" aria-busy={!ready}>
      <header className="detail-header">
        <button className="text-button" onClick={onBack}><ArrowLeft size={18} />{backLabel}</button>
        <h1 tabIndex={-1} ref={heading}>
          {prepared?.pkg.manifest.title ?? "詳細解説"}
        </h1>
      </header>
      {!ready && <p className="detail-loading" role="status"><LoaderCircle size={18} className="spinning" />詳細解説を読み込んでいます</p>}
      {prepared && <>
        <iframe ref={frame} title={prepared.pkg.manifest.title} className={`detail-frame${ready ? " ready" : ""}`}
          style={{ height }}
          src={new URL(import.meta.env.DETAIL_HOST_PATH, explanationBase()).href}
          sandbox="allow-scripts" referrerPolicy="no-referrer" onLoad={initialize} />
        <AttributionLine content={{ attribution: prepared.pkg.manifest.attribution, blocks: [] }} bundle={bundle}
          sourceLabels={Object.fromEntries(prepared.pkg.manifest.attribution.sourceRefs.map((ref) => {
            const source = bundle.sources.find((s) => s.id === ref.sourceId);
            return [ref.sourceId, source?.title.split(": ").at(-1) ?? "原資料"];
          }))} />
        {prepared.pkg.manifest.references && <DetailReferences references={prepared.pkg.manifest.references} bundle={bundle} />}
      </>}
    </section>
  );
}
