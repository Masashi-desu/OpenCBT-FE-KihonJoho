/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {legacy2019AfternoonAuthDefinitions} from "../src/core/generators/legacy-2019-pm-auth";
import {contentHash} from "../src/core/hash";
import contract from "./fixtures/legacy-2019-pm-auth-contracts.json";
import {legacy2019PmAuthInputs as inputs,assertLegacy2019PmAuthBody as verify} from "./fixtures/legacy-2019-pm-auth-oracle";
test("2019 spring PM1 all64 reviewed body hashes detect drift while independent truth and wire checks remain mandatory",async()=>{const d=legacy2019AfternoonAuthDefinitions[0];assert.equal(d.answerVariation,contract.answerVariation);assert.equal(d.version,contract.version);assert.deepEqual(d.fields,contract.fields);assert.deepEqual(d.reference,contract.reference);assert.equal(d.sourceAnswer,contract.sourceAnswer);assert.equal(contract.outputs.length,64);for(const values of inputs()){const body=d.build(values);verify(body,values);const fixed=contract.outputs.find(r=>JSON.stringify(r.values)===JSON.stringify(values));assert(fixed);assert.equal(await contentHash(body),fixed.sha256);}});
