import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { detailRuntimeAssets } from "../scripts/detail-runtime";

test("detail host and runtime URLs change together when either managed asset changes", () => {
  const template = fs.readFileSync("public/explanations/host.html", "utf8");
  const runtime = "window.managedRuntime = 1;";
  const original = detailRuntimeAssets(template, runtime);
  assert.deepEqual(detailRuntimeAssets(template, runtime), original);
  for (const changed of [detailRuntimeAssets(template, runtime + "\n"), detailRuntimeAssets(template + "\n", runtime)]) {
    assert.notEqual(changed.hostFileName, original.hostFileName);
    assert.notEqual(changed.runtimeFileName, original.runtimeFileName);
  }
  assert.equal(new URL(original.html.match(/src="([^"]+)"/)![1], "https://example.test/OpenCBT/" + original.hostFileName).pathname,
    "/OpenCBT/" + original.runtimeFileName);
  assert.equal(original.runtime, runtime);
  assert.equal(original.html.replace(/runtime-[a-f0-9]+\.js/, "runtime.js"), template, "preserve CSP and the complete host document");
  assert.throws(() => detailRuntimeAssets(template.replace('src="./runtime.js"', ""), runtime));
});
