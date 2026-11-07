import { before } from "node:test";
import { installFixtureGenerators } from "../../fixtures";
import { registerBookletOpenEndedTests } from "../../helpers/booklet-open-ended-paths";
import { registerBookletEndlessPracticeTests } from "../../helpers/booklet-endless-practice-paths";

before(installFixtureGenerators);
registerBookletOpenEndedTests("2015-autumn-pm");
registerBookletEndlessPracticeTests("2015-autumn-pm");
