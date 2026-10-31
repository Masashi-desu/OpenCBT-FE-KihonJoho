import {legacy2018DevelopmentMathDefinitions} from "./legacy-2018-development-math";
import {legacy2018DevelopmentKnowledgeDefinitions} from "./legacy-2018-development-knowledge";
/** Annual-only staging; no shared registry/catalog hook is installed here. */
export const legacy2018DevelopmentDefinitions=[...legacy2018DevelopmentMathDefinitions,...legacy2018DevelopmentKnowledgeDefinitions].sort((a,b)=>Number(a.source.split("-").at(-1))-Number(b.source.split("-").at(-1)));
