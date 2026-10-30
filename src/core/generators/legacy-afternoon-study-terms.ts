import { spring2019AfternoonStudyTerms } from "./legacy-2019-spring-afternoon-study-terms";
import { autumn2018AfternoonStudyTerms } from './legacy-2018-autumn-afternoon-study-terms';
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
import { legacy2017AutumnPm1StudyTerms } from "./legacy-2017-autumn-pm1-study-terms";
import { legacy2017AutumnPm2StudyTerms } from "./legacy-2017-autumn-pm2-study-terms";
import { legacy2017AutumnPm3StudyTerms } from "./legacy-2017-autumn-pm3-study-terms";
import { legacy2017AutumnPm4StudyTerms } from "./legacy-2017-autumn-pm4-study-terms";
import { legacy2017AutumnPm9StudyTerms } from "./legacy-2017-autumn-pm9-study-terms";
import { legacy2017AutumnPm10StudyTerms } from "./legacy-2017-autumn-pm10-study-terms";
import { legacy2017AutumnPm11StudyTerms } from "./legacy-2017-autumn-pm11-study-terms";
import { legacy2017AutumnPm12StudyTerms } from "./legacy-2017-autumn-pm12-study-terms";
import { legacy2017AutumnPm13StudyTerms } from "./legacy-2017-autumn-pm13-study-terms";
import { legacy2018SpringPm1StudyTerms } from "./legacy-2018-spring-pm1-study-terms";
import { legacy2018SpringPm2StudyTerms } from "./legacy-2018-spring-pm2-study-terms";
import { legacy2018SpringPm3StudyTerms } from "./legacy-2018-spring-pm3-study-terms";
import { legacy2018SpringPm4StudyTerms } from "./legacy-2018-spring-pm4-study-terms";
import { legacy2018SpringPm5To8StudyTerms } from "./legacy-2018-spring-pm5-8-study-terms";
import { legacy2018SpringPm9StudyTerms } from "./legacy-2018-spring-pm9-study-terms";
import { legacy2018OrderPaymentStudyTerms } from "./legacy-2018-pm-order-payment-study-terms";
import { legacy2018SpringPm11StudyTerms } from "./legacy-2018-spring-pm11-study-terms";
import { legacy2018SpringPm12StudyTerms } from "./legacy-2018-spring-pm12-study-terms";
import { legacy2018SpringPm13StudyTerms } from "./legacy-2018-spring-pm13-study-terms";

const terms: Record<string, StudyTerm[]> = { "1": legacy2017Pm1StudyTerms, "2": legacy2017Pm2StudyTerms,
  "3": legacy2017Pm3StudyTerms, "4": legacy2017Pm4StudyTerms, "5": legacy2017Pm5StudyTerms,
  "6": legacy2017Pm6StudyTerms, "7": legacy2017Pm7StudyTerms, "8": legacy2017Pm8StudyTerms,
  "10": legacy2017Pm10StudyTerms, "11": legacy2017Pm11StudyTerms };
const autumnTerms: Record<string, StudyTerm[]> = {
  "1": legacy2017AutumnPm1StudyTerms, "2": legacy2017AutumnPm2StudyTerms,
  "3": legacy2017AutumnPm3StudyTerms, "4": legacy2017AutumnPm4StudyTerms,
  "9": legacy2017AutumnPm9StudyTerms, "10": legacy2017AutumnPm10StudyTerms,
  "11": legacy2017AutumnPm11StudyTerms, "12": legacy2017AutumnPm12StudyTerms,
  "13": legacy2017AutumnPm13StudyTerms,
};
const spring2018Terms: Record<string, StudyTerm[]> = {
  "1": legacy2018SpringPm1StudyTerms, "2": legacy2018SpringPm2StudyTerms,
  "3": legacy2018SpringPm3StudyTerms, "4": legacy2018SpringPm4StudyTerms,
  ...Object.fromEntries([5,6,7,8].map(number => [String(number),
    legacy2018SpringPm5To8StudyTerms.filter(term => term.sources?.includes(`2018h30h-fe-pm-${number}`))])),
  "9": legacy2018SpringPm9StudyTerms, "10": legacy2018OrderPaymentStudyTerms,
  "11": legacy2018SpringPm11StudyTerms, "12": legacy2018SpringPm12StudyTerms,
  "13": legacy2018SpringPm13StudyTerms,
};
/** Only this reviewed booklet's actual source locators select its glossary. */
export function legacyAfternoonStudyTerms(question: Question): StudyTerm[] | undefined {
  const spring2019 = spring2019AfternoonStudyTerms(question);
  if (spring2019 !== undefined) return spring2019;
  const autumn2018 = autumn2018AfternoonStudyTerms(question);
  if (autumn2018 !== undefined) return autumn2018;
  const refs = question.origin.sourceRefs;
  const number = refs[0]?.locator.questionNumber;
  if (question.subject === "B" && number && spring2018Terms[number] && refs.every(ref =>
    ref.locator.year === 2018 && ref.locator.period === "春期" && ref.locator.timeSlot === "午後" &&
    ref.locator.questionNumber === number && ref.sourceId === `source-ipa-2018h30h-fe-pm-${number}-qs`))
    return structuredClone(spring2018Terms[number]);
  if (number && autumnTerms[number] && refs.every(ref => ref.locator.year === 2017 &&
    ref.locator.period === "秋期" && ref.locator.timeSlot === "午後" && ref.locator.questionNumber === number &&
    ref.sourceId === `source-ipa-2017h29a-fe-pm-${number}-qs`)) return structuredClone(autumnTerms[number]);
  if (!number || !terms[number] || !refs.every(ref => ref.locator.year === 2017 &&
    ref.locator.period === "春期" && ref.locator.timeSlot === "午後" && ref.locator.questionNumber === number &&
    ["source-ipa-2017h29h-fe-pm-qs", `source-ipa-2017h29h-fe-pm-${number}-qs`].includes(ref.sourceId))) return undefined;
  return structuredClone(terms[number]);
}
