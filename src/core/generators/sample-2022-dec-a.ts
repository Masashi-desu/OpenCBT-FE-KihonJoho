import {decemberAKnowledgeDefinitions} from "./sample-2022-dec-a-knowledge";
import {decemberANumericalDefinitions} from "./sample-2022-dec-a-numerical";
export const decemberADefinitions=[...decemberAKnowledgeDefinitions,...decemberANumericalDefinitions].sort((a,b)=>Number(a.source.split("-").at(-1))-Number(b.source.split("-").at(-1)));
