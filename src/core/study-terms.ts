import {stage1AmQa08SupplementTerms} from './stage1-am-qa08-supplement';
import { legacyAfternoonStudyTerms } from "./generators/legacy-afternoon-study-terms";
import type { Asset, Block, Question } from "./types";
import concepts from "./study-concepts.json";
import { studyAcronyms, type StudyTerm } from "./study-acronyms";
import {
  makeStage1AmStudyTerms,
  stage1AmStudySourceKeys,
  stage1AmRelatedTerms,
} from "./stage1-am-study-terms";
import {sample2022AStudyTerms} from "./sample-2022-a-study-terms";

// Related terms whose roles were reviewed against these original questions.
// They are definitions, not an assignment of a displayed choice letter.
const relatedBySource: Record<string, string[]> = {
  "2023-a-3": ["メモリインタリーブ", "DMA", "ライトバック", "キャッシュメモリ"],
  "2023-a-5": [
    "クリッピング",
    "レンダリング",
    "アンチエイリアシング",
    "シェーディング",
  ],
  "2023-a-7": ["ACID", "原子性", "一貫性", "独立性", "耐久性"],
  "2023-a-17": ["ERP", "SFA", "リテールサポート", "電子商取引"],
  "2023-a-19": ["CIO", "CEO", "CFO", "CTO"],
  "2024-a-7": ["ACID", "原子性", "一貫性", "独立性", "耐久性"],
  "2024-a-18": ["HR", "HEMS", "フィンテック", "破壊的イノベーション"],
  "2025-a-10": ["WAF", "WPA2", "SIEM", "UTM"],
  "2026-a-3": ["GPU", "TPM", "FPGA", "量子計算機"],
  "2026-a-4": ["PaaS", "IaaS", "SaaS", "ハウジング", "ホスティング"],
  "2026-a-10": ["CSIRT", "PSIRT", "SOC", "J-CRAT"],
};

const extraTerms: StudyTerm[] = [
  {
    term: "ping",
    meaning:
      "ICMPの要求・応答によって、相手の機器への到達性や応答時間を確認するコマンド。",
    related: ["ICMP"],
  },
  {
    term: "Wi-Fi",
    meaning:
      "無線LAN製品の相互接続性に関する認証などで使われるブランド名。ネットワーク名を示すSSIDや、認証・暗号化方式のWPA2とは役割が異なる。",
  },
  {
    term: "ABC分析",
    meaning:
      "売上や価値などの重要度に応じて対象をA・B・Cの群に分類する分析。A・B・Cは分類名であり、三つの英単語の頭文字ではない。",
  },
  {
    term: "ホスティング",
    meaning:
      "提供者のサーバなどを借りて利用するサービス。利用者の機器を設置する設備を借りるハウジングとは、借りる対象が異なる。",
  },
  {
    term: "アーリーマジョリティ",
    meaning:
      "新製品の採用に慎重だが、平均より早い時期に採用する層。早期に採用して他者に影響を与えるアーリーアダプタの後に続く。",
  },
  {
    term: "SQLインジェクション",
    meaning:
      "外部入力を通して意図しないSQL命令を実行させる攻撃。命令と値を分離し、値をプレースホルダへバインドする対策を取る。",
    related: ["SQL"],
  },
  {
    term: "クロスサイトスクリプティング",
    meaning:
      "不正なスクリプトをWebページに混入させ、閲覧者のブラウザで実行させる攻撃。出力先に応じたエスケープなどで対策する。",
  },
  {
    term: "ディレクトリトラバーサル",
    meaning:
      "パスの指定を悪用し、本来アクセスできないファイルへアクセスする攻撃。許可した識別子からファイルを選ぶなどの対策を取る。",
  },
  {
    term: "NULL",
    meaning:
      "データベースで値が不明又は存在しないことを示す。数値の0や空文字列とは異なり、主キーには設定できない。",
  },
  {
    term: "CO2",
    meaning:
      "二酸化炭素の化学式。温室効果ガスの排出量をCO2相当量に換算すると、異なるガスの影響を共通の尺度で比較できる。",
    aliases: ["CO₂", "CO 2"],
  },
];

const dictionary: StudyTerm[] = [
  ...studyAcronyms,
  ...sample2022AStudyTerms,
  ...concepts.filter(
    (c) =>
      !studyAcronyms.some(
        (a) => a.term === c.term || a.aliases?.includes(c.term),
      ) && !extraTerms.some((t) => t.term === c.term),
  ),
  ...extraTerms,
];

const stage1AmTerms = [
  ...stage1AmQa08SupplementTerms,
  ...makeStage1AmStudyTerms({
  acronyms: studyAcronyms,
  concepts,
  sample2022: sample2022AStudyTerms,
  extra: extraTerms,
  }),
];

const slashCompounds = studyAcronyms
  .filter((term) => term.term.includes("/"))
  .map((term) => ({ name: term.term, parts: term.term.split("/") }));

const normalize = (text: string) =>
  text.normalize("NFKC").replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/");
const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function mentions(text: string, term: string) {
  // Keep IP distinct from IPv4, ID from SSID/identifiers, and CA from CSMA/CA.
  const boundary = /[A-Za-z0-9]/.test(term[0]);
  // A slash can separate terms (SSL/TLS) or belong to one term (CSMA/CA).
  // Remove known compounds only when looking for one of their components.
  const searchable = boundary
    ? slashCompounds.reduce(
        (value, compound) =>
          compound.name !== term && compound.parts.includes(term)
            ? value.replaceAll(compound.name, " ")
            : value,
        text,
      )
    : text;
  return boundary
    ? new RegExp(`(^|[^A-Za-z0-9_-])${escaped(term)}(?![A-Za-z0-9_-])`).test(
        searchable,
      )
    : text.includes(term);
}

export function studyBlockText(block: Block, assets: Asset[] = []): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "code":
      return block.text;
    case "list":
      return block.items.join("\n");
    case "table":
      return [block.caption, ...block.columns, ...block.rows.flat()].join("\n");
    case "formula":
      return `${block.text}\n${block.alt}`;
    case "image":
      return `${block.caption}\n${assets.find((a) => a.id === block.assetId)?.alt ?? ""}`;
    case "diagram":
      return `${block.caption}\n${block.alt}`;
  }
}

export function studySourceKeys(question: Question): string[] {
  const oldMorning = stage1AmStudySourceKeys(question);
  if (oldMorning !== undefined) return oldMorning;
  return question.origin.sourceRefs.flatMap(({ sourceId, locator: l }) => {
    const subject = l.subject?.replace("科目", "").toLowerCase();
    if(sourceId.startsWith("source-ipa-sample-")&&l.questionNumber)
      return [`${sourceId.replace(/^source-ipa-/,"").replace(/-(qs|ans)$/,"")}-${l.questionNumber}`];
    return l.year && subject && l.questionNumber
      ? [`${l.year}-${subject}-${l.questionNumber}`]
      : [];
  });
}

/** Read-only supplements for the actual saved content, never a regenerated answer. */
export function questionStudyTerms(
  question: Question,
  assets: Asset[] = [],
): StudyTerm[] {
  const legacyTerms = legacyAfternoonStudyTerms(question);
  if (legacyTerms) return legacyTerms;
  const sources = studySourceKeys(question);
  const explanation = normalize(
    question.explanation.blocks
      .map((b) => studyBlockText(b, assets))
      .join("\n"),
  );
  const texts = [
    ...question.contextRefs.flatMap(
      (id) => question.contexts.find((c) => c.id === id)?.content.blocks ?? [],
    ),
    ...question.prompt.blocks,
    ...question.choices.flatMap((c) => c.content.blocks),
    ...question.explanation.blocks,
  ];
  // Original scans have a full supplementary text block; their image alt is
  // provenance (e.g. "原本PDF"), not additional question terminology.
  const hasTranscript = texts.some(
    (b) => b.type === "code" && b.language === "text",
  );
  const text = normalize(
    texts
      .map((b) =>
        b.type === "image" && hasTranscript
          ? b.caption
          : studyBlockText(b, assets),
      )
      .join("\n"),
  );
  const related = new Set([
    ...sources.flatMap((s) => relatedBySource[s] ?? []),
    ...stage1AmRelatedTerms(sources, stage1AmTerms),
  ]);
  const selected = new Set<string>();
  // A source-specific reviewed meaning takes priority for that source only.
  // Current189 retain their existing candidate order and definition objects.
  const available = [...stage1AmTerms, ...dictionary]
    .filter((term) => !term.sources || term.sources.some((s) => sources.includes(s)))
    .filter((term, index, all) => all.findIndex((other) => other.term === term.term) === index);
  for (const term of available) {
    if(term.term==="MAC"&&text.includes("メッセージ認証符号")&&!text.includes("MACアドレス"))continue;
    if (term.sources && !term.sources.some((s) => sources.includes(s)))
      continue;
    if (
      related.has(term.term) ||
      [term.term, ...(term.aliases ?? [])].some((name) => mentions(text, name))
    )
      selected.add(term.term);
  }
  // Expand only explicit dependencies; never scan our definitions for new terms.
  let previousSize = -1;
  while (previousSize !== selected.size) {
    previousSize = selected.size;
    for (const term of available)
      if (selected.has(term.term))
        for (const name of term.related ?? []) selected.add(name);
  }
  return available.filter(
    (term) =>
      selected.has(term.term) &&
      (term.expansion ||
        !explanation.includes(normalize(term.meaning).replace(/。$/, ""))),
  );
}
