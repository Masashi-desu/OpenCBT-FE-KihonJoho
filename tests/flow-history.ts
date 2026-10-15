import previous from "./fixtures/pre-flow-revisions.json";
import type { Bundle, Question, Template, SetRecord } from "../src/core/types";

// Fixed release snapshot before adding the flowchart lesson. Never regenerated
// by tests or by the manifest builder; older lesson fixtures compose this step.
export function restorePreFlow(bundle: Bundle) {
  for (const [id, question] of Object.entries(previous.questions))
    bundle.questions[bundle.questions.findIndex(q => q.id === id)] = structuredClone(question) as Question;
  bundle.templates[bundle.templates.findIndex(t => t.id === previous.template.id)] = structuredClone(previous.template) as Template;
  for (const [id, set] of Object.entries(previous.sets))
    bundle.sets[bundle.sets.findIndex(s => s.id === id)] = structuredClone(set) as SetRecord;
  bundle.catalog.revision = previous.catalogRevision;
  return bundle;
}
