import { before } from "node:test";
import { installFixtureGenerators } from "../../fixtures";
import { registerBookletBookmarkTests } from "../../helpers/booklet-bookmark-paths";
import { registerBookletBookmarkEndlessTests } from "../../helpers/booklet-bookmark-endless-paths";

before(installFixtureGenerators);
registerBookletBookmarkTests("2009-autumn-pm");
registerBookletBookmarkEndlessTests("2009-autumn-pm");
