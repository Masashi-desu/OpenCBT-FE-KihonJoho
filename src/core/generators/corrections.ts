import { type GenerationDefinition, p, programs } from "./definition";

// Keep version 3.0.0 available for stored runs; issue corrected definitions as 3.0.1.
export function withCorrections(d: GenerationDefinition): GenerationDefinition {
  if (!["2023-a-10", "2024-b-2", "2023-b-6", "2026-b-1"].includes(d.source))
    return d;
  const legacyBuild = d.build;
  return {
    ...d,
    version: "3.0.1",
    legacyBuild,
    build(values) {
      const body = legacyBuild(values);
      if (d.source === "2023-a-10") {
        const first = body.prompt[0];
        if (first.type !== "paragraph") throw Error("SOURCE_FORMAT");
        body.prompt[0] = p(
          first.text.replace(
            "WAFの設置場所として適切な箇所はどれか。",
            "復号後のHTTP通信を最初に検査できるWAFの設置場所はどれか。",
          ),
        );
      }
      if (d.source === "2024-b-2" && values[1] === 1) {
        const radix = values[0],
          digit = "int(digitsの(length − i ＋ 1)文字目)";
        body.choices = programs([
          `result ＋ ${digit} × ${radix}^(i − 1)`,
          `result ＋ ${digit}`,
          `result × ${radix} ＋ ${digit}`,
          `result ＋ ${digit} × ${radix}^i`,
        ]);
      }
      if (d.source === "2026-b-1") {
        // Ascending copies are also correct when source and destination do not
        // overlap. A range missing its first destination is always incorrect.
        const [shift, length] = values;
        body.choices[1] = programs([
          `${length}から${shift + 2}まで1ずつ減らす`,
        ])[0];
      }
      if (d.source === "2023-b-6") {
        const risk = values[0];
        const scan = body.contexts![2].blocks[0],
          evaluation = body.contexts![3].blocks[0];
        if (scan.type !== "list" || evaluation.type !== "list")
          throw Error("SOURCE_FORMAT");
        if (risk === 2)
          scan.items[3] =
            "大きなPDFは平文で社内サーバへ格納し、URLを通知する。サーバはURLだけで閲覧でき、認証しない。";
        if (risk === 3) {
          scan.items[1] =
            "PDFを全社員へ配った共通鍵で暗号化してメールへ添付する。";
          evaluation.items[1] =
            "添付ファイルの復号鍵は業務の担当者以外の社員にも与える。";
        }
      }
      return body;
    },
  };
}
