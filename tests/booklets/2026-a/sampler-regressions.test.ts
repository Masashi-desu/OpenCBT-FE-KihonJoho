import {before} from "node:test";
import {installFixtureGenerators} from "../../fixtures";
import {registerBookletSamplerRegressionTests} from "../../helpers/booklet-sampler-regressions";

before(installFixtureGenerators);
registerBookletSamplerRegressionTests("2026-a");
