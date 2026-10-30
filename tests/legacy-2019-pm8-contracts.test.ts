/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {contentHash} from "../src/core/hash";
import {legacy2019AfternoonHuffmanDefinitions} from "../src/core/generators/legacy-2019-pm-huffman";
import contracts from "./fixtures/legacy-2019-pm8-contracts.json";
import {assertLegacy2019Pm8Body} from "./fixtures/legacy-2019-pm8-body-oracle";
test("2019 PM8 freezes the four raw output bodies separately from independent semantic validation",async()=>{const d=legacy2019AfternoonHuffmanDefinitions[0];assert.equal(d.source,contracts.source);assert.equal(d.version,contracts.version);assert.deepEqual(d.fields,contracts.fields);assert.deepEqual(d.reference,contracts.reference);assert.equal(d.sourceAnswer,contracts.sourceAnswer);assert.deepEqual(contracts.outputs.map(o=>o.values),[[0],[1],[2],[3]]);for(const o of contracts.outputs){const b=d.build(o.values);assertLegacy2019Pm8Body(b,o.values);assert.equal(await contentHash(b),o.sha256);}});
