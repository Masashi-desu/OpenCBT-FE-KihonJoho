import { before } from "node:test";
import { installFixtureGenerators } from "../../fixtures";
import { registerBookletGenerationTests } from "../../helpers/generation-paths/exhaustive";

before(installFixtureGenerators);
registerBookletGenerationTests("2015-spring-pm");
