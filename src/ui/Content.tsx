import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import type {
  Content as ContentData,
  Bundle,
  Scene,
  Block,
} from "../core/types";
import { safeUrl } from "../core/validation";
import { mathOptions } from "./math";
import { SourceFigure } from "./SourceFigure";
import {
  activityNetworkAlt,
  activityNetworkRenderer,
  isLegacyActivityNetwork,
  readActivityNetwork,
} from "../core/activity-network";
export function AttributionLine({
  content,
  bundle,
}: {
  content: ContentData;
  bundle: Bundle;
}) {
  const a = content.attribution;
  return (
    <small className="material-credit">
      {a.origin === "original"
        ? "本プロジェクトの独自記述"
        : a.origin === "adapted"
          ? "原資料に基づく改変部分"
          : "IPA公開問題"}
      {a.rightsRefs.map((id) => {
        const r = bundle.rights.find((r) => r.id === id);
        return r ? <span key={id}> · {r.attributionText}</span> : null;
      })}
      {a.sourceRefs.map((r) => {
        const s = bundle.sources.find((s) => s.id === r.sourceId);
        return s ? (
          <a
            key={r.sourceId}
            href={
              safeUrl(s.url) + (r.locator.page ? `#page=${r.locator.page}` : "")
            }
            target="_blank"
            rel="noreferrer"
          >
            原資料{r.locator.page ? ` p.${r.locator.page}` : ""}
          </a>
        ) : null;
      })}
    </small>
  );
}
export function Diagram({
  scene,
  alt,
  caption,
  rendererRef,
}: {
  scene: Scene;
  alt: string;
  caption: string;
  rendererRef: { id: string; version: string };
}) {
  if (scene.kind === "source_figure")
    return <SourceFigure scene={scene} caption={caption} />;
  if (
    rendererRef.id === activityNetworkRenderer.id ||
    (rendererRef.id === "renderer-diagram-basic" &&
      isLegacyActivityNetwork(scene))
  )
    return <ActivityNetwork scene={scene} caption={caption} />;
  return <BasicDiagram scene={scene} alt={alt} caption={caption} />;
}

function ActivityNetwork({
  scene,
  caption,
}: {
  scene: Scene;
  caption: string;
}) {
  const id = useId().replace(/:/g, ""),
    { nodes, activities, dummies } = readActivityNetwork(scene),
    radius = 25;
  const endpoints = (from: string, to: string) => {
    const a = nodes.find((n) => n.id === from)!,
      b = nodes.find((n) => n.id === to)!,
      dx = b.x - a.x,
      dy = b.y - a.y,
      length = Math.hypot(dx, dy);
    return {
      x1: a.x + (dx * radius) / length,
      y1: a.y + (dy * radius) / length,
      x2: b.x - (dx * (radius + 2)) / length,
      y2: b.y - (dy * (radius + 2)) / length,
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      nx: dy / length,
      ny: -dx / length,
    };
  };
  return (
    <figure className="managed-diagram activity-network">
      <div
        className="diagram-scroll"
        tabIndex={0}
        aria-label="アローダイアグラム。幅が足りない場合は左右にスクロールできます。"
      >
        <svg
          className="activity-network-scene"
          viewBox="0 0 1000 500"
          role="img"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
        >
          <title id={`${id}-title`}>{caption}</title>
          <desc id={`${id}-description`}>{activityNetworkAlt(scene)}</desc>
          <defs>
            <marker
              id={`${id}-arrow`}
              viewBox="0 0 12 12"
              refX="11"
              refY="6"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 1 1 L 11 6 L 1 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </marker>
          </defs>
          <g aria-hidden="true">
            {activities.map((a) => {
              const p = endpoints(a.from, a.to);
              return (
                <g key={a.id} className="activity-edge" data-activity={a.name}>
                  <line
                    x1={p.x1}
                    y1={p.y1}
                    x2={p.x2}
                    y2={p.y2}
                    markerEnd={`url(#${id}-arrow)`}
                  />
                  <text
                    className="activity-name"
                    x={p.x + p.nx * 21}
                    y={p.y + p.ny * 21}
                  >
                    {a.name}
                  </text>
                  <text
                    className="activity-duration"
                    x={p.x - p.nx * 25}
                    y={p.y - p.ny * 25}
                  >
                    {a.days}
                  </text>
                </g>
              );
            })}
            {dummies.map((d) => {
              const p = endpoints(d.from, d.to);
              return (
                <line
                  key={d.id}
                  className="dummy-edge"
                  x1={p.x1}
                  y1={p.y1}
                  x2={p.x2}
                  y2={p.y2}
                  markerEnd={`url(#${id}-arrow)`}
                />
              );
            })}
            {nodes.map((n) => (
              <circle
                key={n.id}
                className="activity-node"
                cx={n.x}
                cy={n.y}
                r={radius}
              />
            ))}
            <g className="activity-legend">
              <text x="703" y="321" textAnchor="start">
                凡例
              </text>
              <circle cx="727" cy="379" r={radius} />
              <line
                x1="752"
                y1="379"
                x2="919"
                y2="379"
                markerEnd={`url(#${id}-arrow)`}
              />
              <circle cx="946" cy="379" r={radius} />
              <text x="836" y="354">
                作業名
              </text>
              <text x="836" y="411">
                所要日数
              </text>
              <line
                className="dummy-edge"
                x1="704"
                y1="460"
                x2="805"
                y2="460"
                markerEnd={`url(#${id}-arrow)`}
              />
              <text x="818" y="460" textAnchor="start">
                ：ダミー作業
              </text>
            </g>
          </g>
        </svg>
      </div>
    </figure>
  );
}

function BasicDiagram({
  scene,
  alt,
  caption,
}: {
  scene: Exclude<Scene, { kind: "source_figure" }>;
  alt: string;
  caption: string;
}) {
  const box = useRef<HTMLDivElement>(null),
    arrowId = useId().replace(/:/g, ""),
    [layout, setLayout] = useState<{
      fallback: boolean;
      edges: { id: string; x1: number; y1: number; x2: number; y2: number }[];
    }>({ fallback: false, edges: [] });
  useLayoutEffect(() => {
    if (scene.kind === "array" || !box.current) return;
    const element = box.current;
    const measure = () => {
      const parent = element.getBoundingClientRect();
      if (!parent.width) return;
      const boxes = Array.from(
        element.querySelectorAll<HTMLElement>(".diagram-node"),
      ).map((n) => n.getBoundingClientRect());
      const overlap = boxes.some(
        (a, i) =>
          a.left < parent.left ||
          a.right > parent.right ||
          a.top < parent.top ||
          a.bottom > parent.bottom ||
          boxes
            .slice(i + 1)
            .some(
              (b) =>
                a.left < b.right + 6 &&
                a.right + 6 > b.left &&
                a.top < b.bottom + 6 &&
                a.bottom + 6 > b.top,
            ),
      );
      if (overlap) {
        setLayout({ fallback: true, edges: [] });
        return;
      }
      const edges = scene.edges.map((e) => {
        const ai = scene.nodes.findIndex((n) => n.id === e.from),
          bi = scene.nodes.findIndex((n) => n.id === e.to),
          a = scene.nodes[ai],
          b = scene.nodes[bi],
          dx = b.x - a.x,
          dy = b.y - a.y;
        const offset = (rect: DOMRect) =>
          1 /
          Math.max(
            Math.abs(dx) / ((rect.width / parent.width) * 500 + 8),
            Math.abs(dy) / ((rect.height / parent.height) * 500 + 8),
          );
        const from = offset(boxes[ai]),
          to = offset(boxes[bi]);
        return {
          id: e.id,
          x1: a.x + dx * from,
          y1: a.y + dy * from,
          x2: b.x - dx * to,
          y2: b.y - dy * to,
        };
      });
      setLayout({ fallback: overlap, edges });
    };
    setLayout({ fallback: false, edges: [] });
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    Array.from(element.querySelectorAll(".diagram-node")).forEach((n) =>
      observer.observe(n),
    );
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [scene]);
  if (scene.kind === "array")
    return (
      <figure className="managed-diagram">
        <div className="array-cells" aria-label={alt}>
          {scene.cells.map((c) => (
            <div className="array-cell" key={c.id}>
              <span>添字 {c.index}</span>
              <strong>{c.value}</strong>
            </div>
          ))}
        </div>
        <figcaption>{caption}</figcaption>
      </figure>
    );
  return (
    <figure className="managed-diagram">
      <div className="diagram-scroll">
        <div
          ref={box}
          className="node-scene"
          role="img"
          aria-label={alt}
          hidden={layout.fallback}
        >
          <svg viewBox="0 0 1000 1000" aria-hidden="true">
            <defs>
              <marker
                id={arrowId}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {scene.edges.map((e) => {
              const line = layout.edges.find((l) => l.id === e.id);
              return line ? (
                <g key={e.id}>
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={
                      e.label?.startsWith("ダミー") ? "8 7" : undefined
                    }
                    markerEnd={e.directed ? `url(#${arrowId})` : undefined}
                  />
                  {e.label && (
                    <text
                      x={
                        (line.x1 + line.x2) / 2 +
                        (e.label.startsWith("ダミー") ? 22 : 0)
                      }
                      y={
                        (line.y1 + line.y2) / 2 -
                        (e.label.startsWith("ダミー") ? 0 : 24)
                      }
                      textAnchor={
                        e.label.startsWith("ダミー") ? "start" : "middle"
                      }
                    >
                      {e.label.startsWith("ダミー") ? "0日" : e.label}
                    </text>
                  )}
                </g>
              ) : null;
            })}
          </svg>
          {scene.nodes.map((n) => (
            <div
              key={n.id}
              className={`diagram-node ${n.role ?? "graph"}`}
              style={{ left: `${n.x / 10}%`, top: `${n.y / 10}%` }}
            >
              {n.label}
            </div>
          ))}
        </div>
      </div>
      <figcaption>{caption}</figcaption>
      {layout.fallback && (
        <p role="alert">
          図を表示できません。文字拡大を戻して再表示してください。
        </p>
      )}
    </figure>
  );
}
function Formula({ block }: { block: Extract<Block, { type: "formula" }> }) {
  const ref = useRef<HTMLDivElement>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    const draw = () => {
      if (block.format === "latex" && ref.current) {
        try {
          if (!window.katex) throw Error();
          window.katex.render(block.text, ref.current, mathOptions());
          setError(false);
        } catch {
          setError(true);
        }
      }
    };
    draw();
    window.addEventListener("opencbt-math-ready", draw);
    return () => window.removeEventListener("opencbt-math-ready", draw);
  }, [block]);
  return (
    <figure className="formula">
      {block.format === "latex" ? (
        <div ref={ref} aria-label={block.alt} />
      ) : (
        <div>{block.text}</div>
      )}
      <figcaption>
        {error ? "数式表示が利用できません。 " : ""}
        {block.alt}
      </figcaption>
    </figure>
  );
}
export function Content({
  content,
  bundle,
  assetUrls,
  credit = false,
  showAttribution = true,
}: {
  content: ContentData;
  bundle: Bundle;
  assetUrls: Record<string, string>;
  credit?: boolean;
  showAttribution?: boolean;
}) {
  return (
    <div className="content-blocks">
      {content.blocks.map((b, i) => {
        if (b.type === "paragraph") return <p key={i}>{b.text}</p>;
        if (b.type === "heading") {
          const H = `h${b.level}` as "h2" | "h3" | "h4";
          return <H key={i}>{b.text}</H>;
        }
        if (b.type === "list") {
          const List = b.ordered ? "ol" : "ul";
          return (
            <List key={i}>
              {b.items.map((t, j) => (
                <li key={j}>{t}</li>
              ))}
            </List>
          );
        }
        if (b.type === "table")
          return (
            <div className="table-scroll" key={i}>
              <table>
                <caption>{b.caption}</caption>
                <thead>
                  <tr>
                    {b.columns.map((c, j) =>
                      c.includes("＼") ? (
                        <th
                          key={j}
                          className="diagonal-heading"
                          aria-label={`${c.split("＼")[0]}は行、${c.split("＼")[1]}は列`}
                        >
                          <span
                            className="diagonal-row-label"
                            aria-hidden="true"
                          >
                            {c.split("＼")[0]}
                          </span>
                          <span
                            className="diagonal-column-label"
                            aria-hidden="true"
                          >
                            {c.split("＼")[1]}
                          </span>
                        </th>
                      ) : (
                        <th key={j} scope="col">
                          {c}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, j) => (
                    <tr key={j}>
                      {r.map((c, k) => (
                        <td
                          key={k}
                          className={
                            c === "非表示" ? "omitted-cell" : undefined
                          }
                        >
                          {c === "非表示" ? (
                            <span className="sr-only">
                              原資料で非表示の部分
                            </span>
                          ) : (
                            c
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        if (b.type === "code") {
          const code = (
            <pre>
              <code>{b.text}</code>
            </pre>
          );
          return b.language === "text" ? (
            <details className="supplementary-text" key={i}>
              <summary>補助テキストを読む（図・空欄は原文画像で確認）</summary>
              <p className="subtle">
                PDFの文字情報です。読取り順や図の接続、空欄の形は完全には表せません。
              </p>
              {code}
            </details>
          ) : (
            <div className="code-block" key={i}>
              <span>
                {b.language === "sql" ? "SQL" : "疑似言語"} · 表示のみ
              </span>
              {code}
            </div>
          );
        }
        if (b.type === "formula") return <Formula block={b} key={i} />;
        if (b.type === "diagram")
          return (
            <div key={i}>
              <Diagram
                scene={b.scene}
                alt={b.alt}
                caption={b.caption}
                rendererRef={b.rendererRef}
              />
              {showAttribution && (
                <AttributionLine
                  content={{ attribution: b.attribution, blocks: [] }}
                  bundle={bundle}
                />
              )}
            </div>
          );
        if (b.type === "image") {
          const asset = bundle.assets.find((a) => a.id === b.assetId)!;
          return (
            <figure className="original-page" key={i}>
              <img
                src={assetUrls[b.assetId]}
                width={asset.width}
                height={asset.height}
                alt={asset.alt}
                onError={() =>
                  window.dispatchEvent(new Event("opencbt-asset-error"))
                }
              />
              <figcaption>{b.caption}</figcaption>
              {showAttribution && (
                <AttributionLine
                  content={{ attribution: asset.attribution, blocks: [] }}
                  bundle={bundle}
                />
              )}
            </figure>
          );
        }
        return null;
      })}
      {credit && showAttribution && (
        <AttributionLine content={content} bundle={bundle} />
      )}
    </div>
  );
}
