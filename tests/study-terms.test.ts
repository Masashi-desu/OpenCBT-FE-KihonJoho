import { currentSourceOriginals } from "./fixtures/current-source-scope";
import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { fixture } from "./fixtures";
import { questionStudyTerms } from "../src/core/study-terms";
import { StudyTerms } from "../src/ui/StudyTerms";
import { additionalDefinitions } from "../src/core/generators";
import facts from "./fixtures/knowledge-pairs.json";
import type { Question } from "../src/core/types";

// Fixed review references, independent of the production glossary. Evidence:
// IPA syllabus terminology, NISTIR 7581/SP 800-145, IPA PSIRT/J-CRAT, NI PID.
const acronymFacts: Record<string, [string, string]> = {
  Ajax: ["Asynchronous JavaScript and XML", "非同期"],
  CPU: ["Central Processing Unit", "中央処理装置"],
  GPU: ["Graphics Processing Unit", "並列"],
  DMA: ["Direct Memory Access", "直接記憶アクセス"],
  TPM: ["Trusted Platform Module", "暗号鍵"],
  FPGA: ["Field Programmable Gate Array", "論理回路"],
  OS: ["Operating System", "基本ソフトウェア"],
  PC: ["Personal Computer", "個人用"],
  GUI: ["Graphical User Interface", "操作画面"],
  "3D": ["Three Dimensional", "三次元"],
  CG: ["Computer Graphics", "画像"],
  ASCII: ["American Standard Code for Information Interchange", "7ビット"],
  DBMS: ["Database Management System", "データベース管理"],
  ACID: [
    "Atomicity / Consistency / Isolation / Durability",
    "原子性・一貫性・独立性",
  ],
  SQL: ["Structured Query Language", "検索・挿入・更新・削除"],
  "E-R": ["Entity-Relationship", "実体と関連"],
  MTBF: ["Mean Time Between Failures", "平均故障間動作時間"],
  MTTR: ["Mean Time To Repair", "平均修復時間"],
  LAN: ["Local Area Network", "限られた範囲"],
  IP: ["Internet Protocol", "パケット"],
  IPv4: ["Internet Protocol version 4", "32ビット"],
  MAC: ["Media Access Control", "データリンク層"],
  OSI: ["Open Systems Interconnection", "7層"],
  ICMP: ["Internet Control Message Protocol", "エラーや制御情報"],
  DHCP: ["Dynamic Host Configuration Protocol", "動的に配布"],
  BOOTP: ["Bootstrap Protocol", "起動"],
  MIB: ["Management Information Base", "管理情報ベース"],
  IPFIX: ["IP Flow Information Export", "フロー情報"],
  "CSMA/CA": [
    "Carrier Sense Multiple Access with Collision Avoidance",
    "衝突を回避",
  ],
  SSID: ["Service Set Identifier", "識別する名前"],
  HTTP: ["Hypertext Transfer Protocol", "要求と応答"],
  HTTPS: ["Hypertext Transfer Protocol Secure", "暗号化・改ざん検出"],
  TLS: ["Transport Layer Security", "認証、暗号化、改ざん検出"],
  SSL: ["Secure Sockets Layer", "前身"],
  URL: ["Uniform Resource Locator", "場所とアクセス方法"],
  WAF: ["Web Application Firewall", "検知・遮断"],
  WPA2: ["Wi-Fi Protected Access 2", "無線LAN"],
  AES: ["Advanced Encryption Standard", "共通鍵"],
  SIEM: ["Security Information and Event Management", "ログを集約"],
  UTM: ["Unified Threat Management", "セキュリティ機能"],
  CA: ["Certification Authority", "認証局"],
  CSIRT: ["Computer Security Incident Response Team", "インシデント対応"],
  PSIRT: ["Product Security Incident Response Team", "製品・サービス"],
  SOC: ["Security Operations Center", "監視やログ分析"],
  "J-CRAT": [
    "Cyber Rescue and Advice Team against Targeted Attack of Japan",
    "標的型攻撃",
  ],
  BYOD: ["Bring Your Own Device", "個人が所有する端末"],
  PIN: ["Personal Identification Number", "暗証番号"],
  ID: ["Identifier", "識別"],
  IT: ["Information Technology", "情報技術"],
  ICT: ["Information and Communication Technology", "情報通信技術"],
  AI: ["Artificial Intelligence", "人工知能"],
  RPA: ["Robotic Process Automation", "定型業務"],
  HR: ["Human Resources", "人材・人事"],
  HEMS: ["Home Energy Management System", "家庭"],
  ERP: ["Enterprise Resource Planning", "企業全体"],
  SFA: ["Sales Force Automation", "営業活動"],
  CIO: ["Chief Information Officer", "最高情報責任者"],
  CEO: ["Chief Executive Officer", "最高経営責任者"],
  CFO: ["Chief Financial Officer", "最高財務責任者"],
  CTO: ["Chief Technology Officer", "最高技術責任者"],
  PaaS: ["Platform as a Service", "開発・実行基盤"],
  IaaS: ["Infrastructure as a Service", "計算資源"],
  SaaS: ["Software as a Service", "アプリケーション"],
  EDI: ["Electronic Data Interchange", "企業間"],
  POS: ["Point Of Sale", "販売時点"],
  "3C": ["Customer / Competitor / Company", "顧客・競合・自社"],
  PID: ["Proportional / Integral / Derivative", "比例・積分・微分"],
  UTC: ["Coordinated Universal Time", "協定世界時"],
  PDF: ["Portable Document Format", "ファイル形式"],
  DVD: ["Digital Versatile Disc", "光ディスク"],
};

const bundle = fixture();
function example(text: string): Question {
  const q = structuredClone(bundle.questions[0]);
  q.origin.sourceRefs = [];
  q.contextRefs = [];
  q.contexts = [];
  q.prompt.blocks = [{ type: "paragraph", text }];
  q.choices = [];
  q.explanation.blocks = [];
  return q;
}

test("every reviewed abbreviation expands to the correct name and Japanese role", () => {
  const terms = questionStudyTerms(
    example(Object.keys(acronymFacts).join("、")),
  );
  assert.equal(
    terms.filter((t) => t.expansion).length,
    Object.keys(acronymFacts).length,
  );
  for (const [name, [expansion, role]] of Object.entries(acronymFacts)) {
    const term = terms.find((t) => t.term === name)!;
    assert.equal(term.expansion, expansion, name);
    assert(term.meaning.includes(role), name);
  }
});

test("original description choices also explain the related technical terms", () => {
  for (const [source, expected] of [
    ["2023-a-19", ["CIO", "CEO", "CFO", "CTO"]],
    ["2024-a-18", ["HR", "HEMS", "フィンテック", "破壊的イノベーション"]],
    ["2025-a-10", ["WAF", "WPA2", "SIEM", "UTM"]],
    ["2026-a-3", ["GPU", "TPM", "FPGA", "量子計算機"]],
    ["2026-a-4", ["PaaS", "IaaS", "SaaS", "ハウジング", "ホスティング"]],
    ["2026-a-10", ["CSIRT", "PSIRT", "SOC", "J-CRAT"]],
  ] as const) {
    const question = bundle.questions.find(
      (q) => q.id === `question-ipa-${source}`,
    )!;
    const names = questionStudyTerms(question, bundle.assets).map(
      (t) => t.term,
    );
    for (const name of expected)
      assert(names.includes(name), `${source}: ${name}`);
    assert(
      !names.includes("PDF"),
      "image provenance is not question terminology",
    );
  }
});

test("all knowledge targets and choice orders retain reviewed meanings with correct expansions", () => {
  for (const fact of facts) {
    const definition = additionalDefinitions.find(
      (d) => d.source === fact.source,
    )!;
    const base = bundle.questions.find(
      (q) => q.id === `question-template-source-${fact.source}`,
    )!;
    for (let target = 0; target < fact.pairs.length; target++)
      for (let rotation = 0; rotation < 3; rotation++) {
        const body = definition.build([target, rotation]);
        const q = structuredClone(base);
        q.prompt.blocks = body.prompt;
        q.choices = body.choices.map((blocks, i) => ({
          id: `choice-${i}`,
          content: { attribution: q.explanation.attribution, blocks },
        }));
        q.explanation.blocks = [{ type: "paragraph", text: body.explanation }];
        const snapshot = structuredClone(q);
        const terms = questionStudyTerms(q, bundle.assets);
        assert.equal(new Set(terms.map((t) => t.term)).size, terms.length);
        for (const term of terms)
          if (term.expansion) {
            assert.equal(
              term.expansion,
              acronymFacts[term.term][0],
              `${fact.source}: ${term.term}`,
            );
            assert(term.meaning.includes(acronymFacts[term.term][1]));
          }
        for (const [name] of fact.pairs)
          if (acronymFacts[name])
            assert(
              terms.some((t) => t.term === name),
              `${fact.source}: choice concept ${name}`,
            );
        assert.deepEqual(q, snapshot);
      }
  }
});

test("terms do not collide with longer identifiers, other domains or unreferenced contexts", () => {
  assert.deepEqual(
    questionStudyTerms(example("SSID IPFIX CSMA/CA ID123 candidate")).map(
      (t) => t.term,
    ),
    ["IPFIX", "CSMA/CA", "SSID"],
  );
  const q = example("監査の独立性");
  q.contexts = [
    {
      id: "unused",
      title: "CIO",
      content: { ...q.prompt, blocks: [{ type: "paragraph", text: "GPU" }] },
    },
  ];
  assert.deepEqual(
    questionStudyTerms(q),
    [],
    "transaction isolation must not describe audit independence",
  );
  assert(
    questionStudyTerms(example("ＣＩＯ、PaaS、3C分析")).some(
      (t) => t.term === "CIO",
    ),
  );
});

test("definitions cover referenced materials, lists, tables, formulas and image alternatives", () => {
  const q = example("");
  q.contextRefs = ["material"];
  q.contexts = [
    {
      id: "material",
      title: "資料",
      content: { ...q.prompt, blocks: [{ type: "paragraph", text: "MTBF" }] },
    },
  ];
  q.choices = [
    {
      id: "choice",
      content: {
        ...q.prompt,
        blocks: [
          { type: "list", items: ["MTTR"], ordered: false },
          { type: "table", caption: "表", columns: ["GPU"], rows: [["FPGA"]] },
          { type: "formula", text: "x", alt: "CPUの計算" },
          { type: "image", assetId: "term-image", caption: "装置" },
        ],
      },
    },
  ];
  const assets = [{ ...bundle.assets[0], id: "term-image", alt: "TPM" }];
  const terms = questionStudyTerms(q, assets);
  for (const name of ["MTBF", "MTTR", "GPU", "FPGA", "CPU", "TPM"])
    assert(terms.some((t) => t.term === name));
});

test("slashes separate listed abbreviations without splitting a compound into other meanings", () => {
  for (const text of ["SSL/TLS", "SSL／TLS", "SSL / TLS"]) {
    const terms = questionStudyTerms(example(text));
    for (const name of ["SSL", "TLS"])
      assert(terms.some((t) => t.term === name), `${text}: ${name}`);
  }
  for (const text of ["CSMA/CA", "CSMA ／ CA"]) {
    const terms = questionStudyTerms(example(text));
    assert.deepEqual(terms.map((t) => t.term), ["CSMA/CA"]);
    assert(terms[0].meaning.includes("衝突を回避"));
  }
  const terms = questionStudyTerms(example("CSMA/CA/CA"));
  assert(terms.some((t) => t.term === "CSMA/CA"));
  assert(terms.some((t) => t.term === "CA" && t.meaning.includes("認証局")));
});

test("all distributed snapshots, answers and existing explanations stay immutable", () => {
  for (const q of bundle.questions) {
    const saved = structuredClone(q);
    questionStudyTerms(q, bundle.assets);
    assert.deepEqual(q, saved, q.id);
  }
});

test("other-choice concept definitions match independently frozen knowledge references", () => {
  const extraRoles: Record<string, string> = {
    ping: "到達性",
    "Wi-Fi": "ブランド名",
    ABC分析: "重要度",
    ホスティング: "提供者のサーバ",
    アーリーマジョリティ: "平均より早い",
    SQLインジェクション: "命令と値を分離",
    クロスサイトスクリプティング: "閲覧者のブラウザ",
    ディレクトリトラバーサル: "ファイル",
    NULL: "0や空文字列とは異なり",
    CO2: "二酸化炭素",
    APOP: "POP3の認証コマンド名",
    FIN: "TCPヘッダの制御フラグ名",
  };
  let checked = 0;
  // These frozen word-for-word references cover the existing current189.
  // Source-specific legacy definitions are checked against independently
  // reviewed per-major term facts in legacy-2017-pm*-study-terms tests.
  for (const q of currentSourceOriginals(bundle)) {
    for (const term of questionStudyTerms(q, bundle.assets))
      if (!term.expansion) {
        if (extraRoles[term.term])
          assert(term.meaning.includes(extraRoles[term.term]));
        else
          assert(
            facts.some((f) =>
              f.pairs.some(
                ([name, meaning]) =>
                  name === term.term && term.meaning === `${meaning}。`,
              ),
            ),
            term.term,
          );
        checked++;
      }
  }
  assert(
    checked > 50,
    "check the distributed concept coverage, not only abbreviation examples",
  );
  const abc = questionStudyTerms(example("ABC分析"))[0];
  assert.equal(abc.expansion, undefined);
  assert(abc.meaning.includes("分類名"));
  assert(!questionStudyTerms(example("Wi-Fi"))[0].expansion);
});

test("rendering pairs each term with its expansion and meaning, escaping data safely", () => {
  const q = example("CIO MTTR <script>alert(1)</script>");
  const html = renderToStaticMarkup(
    createElement(StudyTerms, { question: q, assets: [] }),
  );
  assert(html.includes("<h3>用語の補足</h3>"));
  assert(html.includes('lang="en"'));
  assert(html.includes("Chief Information Officer"));
  assert(html.includes("最高情報責任者"));
  assert(html.includes("Mean Time To Repair"));
  assert(html.includes("平均修復時間"));
  assert(!html.includes("<script>"));
  assert.equal(
    renderToStaticMarkup(
      createElement(StudyTerms, { question: example("用語なし"), assets: [] }),
    ),
    "",
  );
});
