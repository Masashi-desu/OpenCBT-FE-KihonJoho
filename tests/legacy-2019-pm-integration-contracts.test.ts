/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {legacy2019AfternoonIntegrationDefinitions} from "../src/core/generators/legacy-2019-pm-integration";
import {contentHash} from "../src/core/hash";
import contract from "./fixtures/legacy-2019-pm-integration-contracts.json";
import {legacy2019PmIntegrationInputs as inputs,assertLegacy2019PmIntegrationBody as verify} from "./fixtures/legacy-2019-pm-integration-oracle";
test("2019 spring PM7 all27 reviewed body hashes detect drift while independent truth and wire checks remain mandatory",async()=>{const d=legacy2019AfternoonIntegrationDefinitions[0];assert.equal(d.answerVariation??"variable",contract.answerVariation);assert.equal(d.version,contract.version);assert.deepEqual(d.fields,contract.fields);assert.deepEqual(d.reference,contract.reference);assert.equal(d.sourceAnswer,contract.sourceAnswer);assert.equal(contract.outputs.length,27);for(const values of inputs()){const body=d.build(values);verify(body,values);const fixed=contract.outputs.find(r=>JSON.stringify(r.values)===JSON.stringify(values));assert(fixed);assert.equal(await contentHash(body),fixed.sha256);}});
