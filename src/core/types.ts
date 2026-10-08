export type Ref = { questionId: string; revision: number };
export type Subject = "A" | "B";
export type SubjectScope = Subject | "mixed";
export const subjectLabel = (subject: SubjectScope) =>
  subject === "mixed" ? "科目A・B" : `科目${subject}`;
export type EntityRef = { id: string; revision: number };
export type SourceRef = {
  sourceId: string;
  locator: {
    section: string;
    page?: number;
    year?: number;
    questionNumber?: string;
    exam?: string;
    subject?: string;
  };
};
export type Attribution = {
  origin: "original" | "official" | "adapted";
  sourceRefs: SourceRef[];
  rightsRefs: string[];
  creatorIds: string[];
};
export type Scene =
  | { kind: "source_figure"; profile: string; values: number[] }
  | {
      kind: "array";
      cells: { id: string; index: number; value: number | string }[];
    }
  | {
      kind: "graph" | "flowchart";
      nodes: {
        id: string;
        label: string;
        x: number;
        y: number;
        role?: string;
      }[];
      edges: {
        id: string;
        from: string;
        to: string;
        directed: boolean;
        label?: string;
      }[];
    };
export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level: number }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "code"; text: string; language: string }
  | { type: "formula"; text: string; alt: string; format?: "unicode" | "latex" }
  | { type: "table"; caption: string; columns: string[]; rows: string[][] }
  | { type: "image"; assetId: string; caption: string }
  | {
      type: "diagram";
      id: string;
      rendererRef: { id: string; version: string };
      caption: string;
      alt: string;
      attribution: Attribution;
      scene: Scene;
    };
export type Content = { attribution: Attribution; blocks: Block[] };
export type Question = {
  schemaVersion: "3.0.0";
  id: string;
  revision: number;
  lifecycle: "active" | "withdrawn";
  subject: "A" | "B";
  learning: { area: string; tags: string[] };
  origin: {
    kind: "official_reprint" | "official_adaptation" | "original";
    sourceRefs: SourceRef[];
    derivedFrom: Ref[];
    changes: {
      at: string;
      actorId: string;
      kind: string;
      summary: string;
      details: string;
      affectsAnswer: boolean;
      answerDetails?: string;
    }[];
    isModified: boolean;
    modificationBasis: "none" | "official_source" | "base_question";
    independentCreationNotes?: string;
  };
  contributors: { actorId: string; role: string }[];
  contexts: {
    id: string;
    title: string;
    presentation?: "text" | "text_figure";
    content: Content;
  }[];
  contextRefs: string[];
  prompt: Content;
  choices: { id: string; content: Content }[];
  correctAnswer: { choiceId: string; attribution: Attribution };
  explanation: Content;
  assetRefs: string[];
  choiceShuffleAllowed: boolean;
  distribution: "included" | "docs_only" | "excluded";
  review: {
    checkedOn: string;
    reviewerIds: string[];
    checks: Record<string, string>;
    notes: string;
  };
};
export type Asset = {
  schemaVersion: string;
  id: string;
  path: string;
  mediaType: string;
  sha256: string;
  width: number;
  height: number;
  byteLength: number;
  alt: string;
  attribution: Attribution;
};
export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedOn?: string;
  checkedOn: string;
  availability: string;
  [key: string]: unknown;
};
export type Rights = {
  id: string;
  checkedOn: string;
  assessmentNotes: string;
  evidence: SourceRef[];
  holders: string[];
  basis: string;
  uses: {
    repositoryRedistribution: string;
    browserDisplay: string;
    adaptation: string;
  };
  attributionText: string;
  licenseId: string;
  scope: string;
  thirdParty: { status: string; notes: string; rightsRefs: string[] };
  [key: string]: unknown;
};
export type Template = {
  schemaVersion: string;
  id: string;
  revision: number;
  title: string;
  baseQuestionRef: Ref;
  generatorRef: { id: string; version: string };
  parameterDomain: {
    values: { length: number; minimum: number; maximum: number };
    fields?: { name: string; minimum: number; maximum: number }[];
  };
  referenceParameters: { values: number[] };
  attribution: Attribution;
  editorIds: string[];
  lifecycle: string;
  distribution: string;
  bindingBasis: "official_source" | "base_question";
  originalContentSha256: string;
};
export type SetRecord = {
  schemaVersion: string;
  id: string;
  revision: number;
  title: string;
  subject: SubjectScope;
  questionRefs: Ref[];
  examConfigRefs: EntityRef[];
  distribution: string;
  generationBindings: { questionRef: Ref; templateRef: EntityRef }[];
};
export type Exam = {
  schemaVersion: string;
  id: string;
  revision: number;
  title: string;
  subject: SubjectScope;
  mode: "study" | "practice";
  questionCount?: number;
  timeLimitSeconds?: number;
  questionOrder: "set" | "shuffle";
  choiceOrder: "fixed" | "shuffle";
  duplicatePolicy: "lineage_unique" | "instance_unique" | "cycle_unique" | "random_reuse";
  shortagePolicy: "block";
  practiceScope?: "full_exam" | "public_subset" | "learning_set";
  quotas?: { algorithm: number; security: number };
};
export type Catalog = {
  schemaVersion: string;
  id: string;
  revision: number;
  scope: string;
  generationCoverage?: "complete" | "partial";
  actors: { id: string; name: string; kind: string }[];
  files: Record<string, { path: string; sha256: string }[]>;
  withdrawals: {
    questionRef: Ref;
    reason: string;
    replacement?: Ref;
    [key: string]: unknown;
  }[];
};
export type Bundle = {
  catalog: Catalog;
  catalogHash: string;
  questions: Question[];
  sources: Source[];
  rights: Rights[];
  assets: Asset[];
  sets: SetRecord[];
  exams: Exam[];
  templates: Template[];
};
export type Entry = {
  questionRef: Ref;
  issuedContent: {
    bindingPerformed: boolean;
    isModified: boolean;
    originKind: Question["origin"]["kind"];
    contentSha256: string;
  };
  choiceOrder: string[];
  selectedChoiceId?: string;
  reviewFlag: boolean;
  revealed: boolean;
  generatedInstanceId?: string;
};
export type Session = {
  schemaVersion: "3.0.0";
  id: string;
  revision: number;
  setRef: EntityRef;
  examConfigRef: EntityRef;
  snapshot: {
    catalogId: string;
    catalogRevision: number;
    catalogSha256: string;
  };
  status:
    | "ready"
    | "running"
    | "paused"
    | "completed"
    | "expired"
    | "abandoned"
    | "invalidated";
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  deadlineAt?: string;
  pausedAt?: string;
  endedAt?: string;
  activeElapsedSeconds: number;
  currentIndex: number;
  entries: Entry[];
  storage: "indexeddb";
  expiresAt: string;
  invalidationReason?:
    | "data_error"
    | "withdrawn"
    | "clock_change"
    | "missing_snapshot"
    | "storage_error";
  bindingMode: "original_data" | "generated_values";
};
export type Instance = {
  schemaVersion: string;
  id: string;
  sessionId: string;
  entryIndex: number;
  createdAt: string;
  templateRef: EntityRef;
  baseQuestionRef: Ref;
  generatorRef: { id: string; version: string };
  parameterSelection: "seeded";
  seed: string;
  parameters: { values: number[] };
  question: Question;
  contentSha256: string;
  bindingPerformed: true;
};
export type Result = {
  schemaVersion: string;
  id: string;
  sessionId: string;
  sessionRevision: number;
  generatedAt: string;
  calculationVersion: string;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  revealedCount: number;
  learningAccuracyPercent: number;
  entries: {
    questionRef: Ref;
    outcome: string;
    generatedInstanceId?: string;
  }[];
  validity: string;
  notice: string;
};
export type Run = {
  session: Session;
  bundle: Bundle;
  issued: Question[];
  instances: Instance[];
  exam: Exam;
  set: SetRecord;
  assets: Record<string, Blob>;
  result?: Result;
  selection: Selection;
};
export type Selection = {
  subject: SubjectScope;
  kind: "annual" | "mix" | "bookmark";
  year?: number;
  mode: "practice" | "study" | "endless";
  size?: "public" | "full";
  bindingMode: "original_data" | "generated_values";
  bookmarkQuestionRef?: Ref;
  // An explicit endless pool: source refs for bookmarks, base refs for other groups.
  questionRefs?: Ref[];
};
export const labels = [..."アイウエオカキクケコ"];
export const areas: Record<string, string> = {
  technology: "テクノロジ",
  management: "マネジメント",
  strategy: "ストラテジ",
  algorithm: "アルゴリズム",
  security: "情報セキュリティ",
};
export const refOf = (q: Question): Ref => ({
  questionId: q.id,
  revision: q.revision,
});
export const refKey = (r: Ref) => `${r.questionId}@${r.revision}`;
