import { before } from "node:test";
import { installFixtureGenerators } from "../../fixtures";
import { registerBookletBookmarkTests } from "../../helpers/booklet-bookmark-paths";
import { registerBookletBookmarkEndlessTests } from "../../helpers/booklet-bookmark-endless-paths";

before(installFixtureGenerators);
registerBookletBookmarkTests("2012-spring-am");
registerBookletBookmarkEndlessTests("2012-spring-am");
