import { before } from "node:test";
import { installFixtureGenerators } from "../../fixtures";
import { registerBookletOpenEndedTests } from "../../helpers/booklet-open-ended-paths";
import { registerBookletEndlessPracticeTests } from "../../helpers/booklet-endless-practice-paths";

before(installFixtureGenerators);
registerBookletOpenEndedTests("2012-spring-am");
registerBookletEndlessPracticeTests("2012-spring-am");
