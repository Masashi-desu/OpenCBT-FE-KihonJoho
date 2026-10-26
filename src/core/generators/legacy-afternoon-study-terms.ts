import type { Question } from "../types";
import type { StudyTerm } from "../study-acronyms";
import { legacy2017Pm1StudyTerms } from "./legacy-2017-pm1-study-terms";
import { legacy2017Pm2StudyTerms } from "./legacy-2017-pm2-study-terms";
import { legacy2017Pm3StudyTerms } from "./legacy-2017-pm3-study-terms";
import { legacy2017Pm4StudyTerms } from "./legacy-2017-pm4-study-terms";
import { legacy2017Pm5StudyTerms } from "./legacy-2017-pm5-study-terms";
import { legacy2017Pm6StudyTerms } from "./legacy-2017-pm6-study-terms";
import { legacy2017Pm7StudyTerms } from "./legacy-2017-pm7-study-terms";
import { legacy2017Pm8StudyTerms } from "./legacy-2017-pm8-study-terms";
import { legacy2017Pm10StudyTerms } from "./legacy-2017-pm10-study-terms";
import { legacy2017Pm11StudyTerms } from "./legacy-2017-pm11-study-terms";

const terms: Record<string, StudyTerm[]> = { "1": legacy2017Pm1StudyTerms, "2": legacy2017Pm2StudyTerms,
  "3": legacy2017Pm3StudyTerms, "4": legacy2017Pm4StudyTerms, "5": legacy2017Pm5StudyTerms,
  "6": legacy2017Pm6StudyTerms, "7": legacy2017Pm7StudyTerms, "8": legacy2017Pm8StudyTerms,
  "10": legacy2017Pm10StudyTerms, "11": legacy2017Pm11StudyTerms };
/** Only this reviewed booklet's actual source locators select its glossary. */
export function legacyAfternoonStudyTerms(question: Question): StudyTerm[] | undefined {
  const refs = question.origin.sourceRefs;
  const number = refs[0]?.locator.questionNumber;
  if (!number || !terms[number] || !refs.every(ref => ref.locator.year === 2017 &&
    ref.locator.period === "春期" && ref.locator.timeSlot === "午後" && ref.locator.questionNumber === number &&
    ["source-ipa-2017h29h-fe-pm-qs", `source-ipa-2017h29h-fe-pm-${number}-qs`].includes(ref.sourceId))) return undefined;
  return structuredClone(terms[number]);
}
