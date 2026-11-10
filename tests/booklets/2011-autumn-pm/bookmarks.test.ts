import { before } from "node:test";
import { installFixtureGenerators } from "../../fixtures";
import { registerBookletBookmarkTests } from "../../helpers/booklet-bookmark-paths";
import { registerBookletBookmarkEndlessTests } from "../../helpers/booklet-bookmark-endless-paths";

before(installFixtureGenerators);
registerBookletBookmarkTests("2011-autumn-pm");
registerBookletBookmarkEndlessTests("2011-autumn-pm");
