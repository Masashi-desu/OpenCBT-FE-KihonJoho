import type { Question } from "../types";
import { legacy2017Pm1Definition } from "./legacy-2017-pm1";
import { legacy2017Pm2Definition } from "./legacy-2017-pm2";
import { legacy2017Pm3Definition } from "./legacy-2017-pm3";
import { legacy2017Pm4Definition } from "./legacy-2017-pm4";
import { legacy2017Pm5Definition } from "./legacy-2017-pm5";
import { legacy2017Pm6Definitions } from "./legacy-2017-pm6";
import { legacy2017Pm7Definition } from "./legacy-2017-pm7";
import { legacy2017Pm8Definition } from "./legacy-2017-pm8";
import { legacy2017Pm9Definition } from "./legacy-2017-pm9";
import { legacy2017Pm10Definition } from "./legacy-2017-pm10";
import { legacy2017Pm11Definition } from "./legacy-2017-pm11";
import { legacy2017Pm12Definition } from "./legacy-2017-pm12";
import { legacy2017Pm13Definition } from "./legacy-2017-pm13";
import { legacy2017AutumnAfternoonDefinitions } from "./legacy-2017-autumn-afternoon-definitions";
import { legacy2018SpringAfternoonDefinitions } from "./legacy-2018-spring-afternoon-definitions";

// Managed code is separate from the immutable current-format public roots.
// Admission to the distribution catalog remains an all-majors booklet gate.
export const legacyAfternoonDefinitions = [legacy2017Pm1Definition, legacy2017Pm2Definition,
  legacy2017Pm3Definition, legacy2017Pm4Definition, legacy2017Pm5Definition,
  ...legacy2017Pm6Definitions, legacy2017Pm7Definition, legacy2017Pm8Definition, legacy2017Pm9Definition,
  legacy2017Pm10Definition, legacy2017Pm11Definition, legacy2017Pm12Definition, legacy2017Pm13Definition,
  ...legacy2017AutumnAfternoonDefinitions, ...legacy2018SpringAfternoonDefinitions];
export function legacyAfternoonDefinition(generatorId: string) {
  return legacyAfternoonDefinitions.find(definition => generatorId === `generator-source-${definition.source}`);
}
const sourceChoiceSources = new Set(["2017h29h-fe-pm-1", "2017h29h-fe-pm-2", "2017h29h-fe-pm-3",
  "2017h29h-fe-pm-6", "2017h29h-fe-pm-7", "2017h29h-fe-pm-9", "2017h29h-fe-pm-10", "2017h29h-fe-pm-11", "2017h29h-fe-pm-12", "2017h29h-fe-pm-13",
  ...legacy2017AutumnAfternoonDefinitions.map(definition => definition.source),
  ...legacy2018SpringAfternoonDefinitions.map(definition => definition.source)]);
export function legacyAfternoonSourceChoices(question: Question) {
  return question.origin.kind !== "official_reprint" && question.origin.derivedFrom.some(ref =>
    [...sourceChoiceSources].some(source => ref.questionId === `question-template-source-${source}` ||
      ref.questionId === `question-ipa-${source}`));
}
