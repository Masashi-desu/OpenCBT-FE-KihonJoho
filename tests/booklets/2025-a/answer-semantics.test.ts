import { before } from "node:test";
import { installFixtureGenerators } from "../../fixtures";
import { registerBookletAnswerSemantics } from "../../helpers/current-answer-semantics";

before(installFixtureGenerators);
registerBookletAnswerSemantics("2025-a");
