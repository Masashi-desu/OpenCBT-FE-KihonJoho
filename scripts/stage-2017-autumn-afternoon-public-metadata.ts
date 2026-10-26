/** Reviewed public descriptions, applied only after all individual rights and
 * question checks pass. Never strip a hold or legal restriction by regexp. */
import assert from "node:assert/strict";
import type { Autumn2017Records } from "./stage-2017-autumn-afternoon";
import { autumn2017LearningPayload } from "./stage-2017-autumn-afternoon";
import { legacyAfternoonPublicNotes } from "../src/core/generators/legacy-afternoon-public-notes";
import limitInput from "./source-evidence/stage2-2017-autumn-public-limits.json";
const limits = structuredClone(limitInput) as Record<string,{ before:string;after:string }>;
export type Autumn2017MetadataEdit = { path:string;before:string;after:string;reason:string };
export function apply2017AutumnPublicMetadata(number:number,records:Autumn2017Records):Autumn2017MetadataEdit[] {
  const source = `2017h29a-fe-pm-${number}`, note = legacyAfternoonPublicNotes[source], edits:Autumn2017MetadataEdit[] = [];
  assert(Number.isInteger(number) && number >= 1 && number <= 13 && note);
  assert(records.rights.length && records.rights.every(right => Object.values(right.uses).every(use => use === "allowed") &&
    ["none_identified","present_cleared"].includes(right.thirdParty.status)),"public_metadata_cannot_waive_material_hold");
  assert(records.questions.every(question => Object.values(question.review.checks).every(check => check === "pass")),"public_metadata_requires_reviewed_questions");
  const rights = structuredClone(records.rights), assets = structuredClone(records.assets);
  const payloads = records.questions.map(autumn2017LearningPayload);
  // Reject the complete metadata input before mutating any record.
  for(const question of records.questions) {
    assert([`question-ipa-${source}`,`question-template-source-${source}`].includes(question.id));
    if(question.origin.kind === "official_adaptation") assert(question.origin.changes.some(change =>
      change.kind === "wording" || change.kind === "numbers"),"public_adaptation_must_describe_its_change");
  }
  for(const record of records.sources) {
    assert(record.id.startsWith(`source-ipa-${source}-`),"foreign_public_source");
    const review = limits[record.id]; assert(review,"individual_public_source_scope_review_missing");
    assert(record.limits === review.before || record.limits === review.after,"source_limits_changed_requires_review");
  }
  const change = (path:string,before:string,after:string,reason:string) => { if(before !== after) edits.push({ path,before,after,reason }); };
  records.questions.forEach((question,qi) => {
    assert([`question-ipa-${source}`,`question-template-source-${source}`].includes(question.id));
    if(question.origin.kind === "official_adaptation") {
      let count = 0;
      question.origin.changes.forEach((entry,ci) => {
        if(entry.kind !== "wording" && entry.kind !== "numbers") return;
        for(const [key,text] of [["summary","原形式を保持して条件を変更"],["details",note]] as const) {
          change(`/questions/${qi}/origin/changes/${ci}/${key}`,entry[key],text,"reviewed_public_modification_description"); entry[key] = text;
        }
        count++;
      });
      assert(count > 0,"public_adaptation_must_describe_its_change");
    }
    const text = `2017年度秋期・旧午後問${number}。原資料と公式解答の全${question.answerParts!.length}解答欄を照合し、条件別の独立検算と原形式の査読を記録している。公式素材・付属資料の利用条件は各素材の権利記録で確認し、独自解説と区別する。公式の配点や合否評価を表すものではない。`;
    change(`/questions/${qi}/review/notes`,question.review.notes,text,"public_review_scope"); question.review.notes = text;
  });
  records.sources.forEach((record,si) => {
    assert(record.id.startsWith(`source-ipa-${source}-`),"foreign_public_source");
    const review = limits[record.id]; assert(review,"individual_public_source_scope_review_missing");
    assert(record.limits === review.before || record.limits === review.after,"source_limits_changed_requires_review");
    change(`/sources/${si}/limits`,record.limits!,review.after,"individual_reviewed_scope_preserving_material_limits");record.limits = review.after;
  });
  assert.deepEqual(records.rights,rights); assert.deepEqual(records.assets,assets);
  assert.deepEqual(records.questions.map(autumn2017LearningPayload),payloads,"public_metadata_cannot_change_learning_material");
  return edits;
}
