import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function ErrorDetails({ value }: { value: string }) {
  const [copyState, setCopyState] = useState<"copied" | "failed">();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <details className="error-details">
      <summary>エラーの詳細</summary>
      <div className="error-details-panel">
        <div className="error-details-tools">
          <span role="status" className={copyState === "failed" ? undefined : "sr-only"}>
            {copyState === "copied" && "コピーしました"}
            {copyState === "failed" && "コピーできませんでした"}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label="エラーの詳細をコピー"
            title={copyState === "copied" ? "コピーしました" : "エラーの詳細をコピー"}
            onClick={copy}
          >
            {copyState === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          </button>
        </div>
        <pre tabIndex={0} aria-label="エラーの詳細コード"><code>{value}</code></pre>
      </div>
    </details>
  );
}
