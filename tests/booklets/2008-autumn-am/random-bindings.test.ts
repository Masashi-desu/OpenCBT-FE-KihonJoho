import { before } from "node:test";
import { installFixtureGenerators } from "../../fixtures";
import { registerBookletGenerationTests } from "../../helpers/generation-paths/exhaustive";

before(installFixtureGenerators);
registerBookletGenerationTests("2008-autumn-am");
