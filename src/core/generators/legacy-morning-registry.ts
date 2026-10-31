import type { Question, Template } from "../types";
import type { GenerationDefinition } from "./definition";
import { effectivePublicDefinitions } from "./effective-public";
import {makeLegacyMorningProviders} from "./legacy-morning-providers";
import { makeCriticalPathDependency, type CoreQuestionBinder } from "./core-dependency";
import { makeLegacy2017MorningDefinitions } from "./legacy-2017-morning";
import { makeLegacy2018ReviewedMorningDefinitions } from "./legacy-2018-morning-reviewed";
import { makeLegacy2019MorningDefinitions } from "./legacy-2019-morning";
import { legacy2017InformationDefinitions } from "./legacy-2017-information";
import { legacy2018NumericDefinitions } from "./legacy-2018-numeric";
import { legacy2018ReviewedKnowledgeDefinitions } from "./legacy-2018-knowledge-reviewed";
import { legacy2019PlatformDefinitions } from "./legacy-2019-platform";
import { legacy2017AutumnAmAdditionDefinitions } from "./legacy-2017-autumn-am-additions";
import { legacy2019SpringAmCompletionDefinitions } from "./legacy-2019-spring-am-completion";
import { legacy2019AutumnRemainingAmDefinitions } from "./legacy-2019-autumn-remaining-am";
import { legacy2018Autumn58Definition } from "./legacy-2018-autumn58";

import {commonFramework65Definitions} from './common-framework65';

const morningSource = /^(?:2017h29[ha]|2018h30[ha]|2019h31h|2019r01a)-fe-am-(?:[1-9]|[1-7]\d|80)$/;

function single(pool: readonly GenerationDefinition[], source: string): GenerationDefinition {
  const matches = pool.filter(d => d.source === source);
  if (matches.length !== 1) throw Error("MORNING_CANONICAL_REQUIRED " + source);
  return { ...matches[0], version: matches[0].version ?? "3.2.0" };
}

function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Managed morning code only. The returned cohort is preparation capability,
 * not rights approval or catalog admission. No annual/PM modules, filesystem,
 * test fixtures, or question-supplied code participate in this composition. */
export async function makeLegacyMorningRegistry(input: {
  questions: readonly Question[];
  templates: readonly Template[];
  bindCore: CoreQuestionBinder;
}): Promise<readonly GenerationDefinition[]> {
  const core = await makeCriticalPathDependency(input);
  const providers = makeLegacyMorningProviders(effectivePublicDefinitions);
  const pool2017 = [
    ...providers,
    single(legacy2019PlatformDefinitions, "2019h31h-fe-am-35"),
    single(legacy2018NumericDefinitions, "2018h30a-fe-am-9"),
    single(legacy2018ReviewedKnowledgeDefinitions, "2018h30a-fe-am-76"),
    core,
  ];
  const year2017 = await makeLegacy2017MorningDefinitions(pool2017);
  const year2018 = makeLegacy2018ReviewedMorningDefinitions(year2017);
  const year2019 = await makeLegacy2019MorningDefinitions([
    ...providers, ...legacy2017InformationDefinitions,
  ]);
  // Preserve historical preparation factories. Current runtime capabilities add
  // the separately reviewed completion cohorts without rewriting their roots.
  const definitions = [...year2017, ...year2018, ...year2019,
    ...legacy2017AutumnAmAdditionDefinitions, ...legacy2019SpringAmCompletionDefinitions,
    ...legacy2019AutumnRemainingAmDefinitions, legacy2018Autumn58Definition, ...commonFramework65Definitions];
  if (new Set(definitions.map(d => d.source)).size !== definitions.length ||
      definitions.some(d => !morningSource.test(d.source)))
    throw Error("MORNING_REGISTRY_SCOPE");
  return Object.freeze(definitions.map(d => {
    const { build, ...metadata } = d;
    const owned = freeze(structuredClone(metadata));
    return Object.freeze({ ...owned, build: (values: number[]) =>
      structuredClone(build([...values])) });
  }));
}
