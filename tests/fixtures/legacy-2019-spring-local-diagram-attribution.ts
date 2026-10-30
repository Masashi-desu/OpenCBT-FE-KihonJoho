/** Candidate assembly only. Raw producer blocks stay unchanged. Shared runtime
 * bindAdditionalQuestion already supplies source-specific adapted diagram credits. */
import assert from "node:assert/strict";
import type {Attribution,Block} from "../../src/core/types";
export function legacy2019AttributedFigureBlocks(blocks:readonly Block[],attribution:Attribution):Block[]{
 assert.equal(attribution.origin,"adapted");assert(attribution.sourceRefs.length>0);assert(attribution.rightsRefs.includes("rights-original"));
 return structuredClone([...blocks]).map(b=>b.type==="diagram"?{...b,attribution:structuredClone(attribution)}:b);
}
