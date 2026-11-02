import test from "node:test";
import assert from "node:assert/strict";
import { effectivePublicDefinitions as additionalDefinitions } from "../src/core/generators/effective-public";

test("reviewed corrections are included in current definitions", () => {
  for (const source of ["2023-a-10", "2024-b-2", "2023-b-6", "2026-b-1"]) {
    const d = additionalDefinitions.find((d) => d.source === source)!;
    assert.equal(d.version, d.source === "2026-b-1" ? "3.6.0" : ["2024-a-10", "2025-a-13", "2025-a-16", "2025-a-17", "2026-a-8", "2026-a-11", "2026-a-15"].includes(d.source) || d.source.includes("-b-") || d.source === "2023-a-10" ? "3.4.0" : "3.2.0");
    assert.equal("legacyBuild" in d, false);
  }
});
