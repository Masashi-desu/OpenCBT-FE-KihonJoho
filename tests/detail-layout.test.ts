import test from "node:test";
import assert from "node:assert/strict";
import { observeDetailHeight } from "../src/ui/detail-layout";

test("embedded content height grows and shrinks independently of the old viewport", () => {
  let bottom = 1234.2, scrollY = 0, margin = "16px", callback = () => {}, pending = () => {};
  let requests = 0, disconnected = false, cancelled = 0;
  const body = { getBoundingClientRect: () => ({ bottom }), scrollHeight: 9000 };
  const doc = { body, defaultView: {
    get scrollY() { return scrollY; },
    getComputedStyle: () => ({ marginBottom: margin }),
    ResizeObserver: class {
      constructor(onResize: () => void) { callback = onResize; }
      observe(target: unknown) { assert.equal(target, body); }
      disconnect() { disconnected = true; }
    },
    requestAnimationFrame(run: () => void) { requests++; pending = run; return requests; },
    cancelAnimationFrame(id: number) { cancelled = id; },
  } } as unknown as Document;
  const heights: number[] = [];
  const layout = observeDetailHeight(doc, height => heights.push(height));
  assert.deepEqual(heights, [1251]);
  bottom = 2000;
  callback(); callback();
  assert.equal(requests, 1, "coalesce resize notifications in a frame");
  pending();
  assert.deepEqual(heights, [1251, 2016]);
  layout.update();
  assert.equal(heights.length, 2, "do not send unchanged heights");
  bottom = 120; scrollY = 10; margin = "0px";
  callback(); pending();
  assert.deepEqual(heights, [1251, 2016, 130], "closing content can shrink below the previous viewport");
  bottom = 0; scrollY = 0;
  layout.update();
  assert.equal(heights.at(-1), 1, "empty content still has a valid height");
  callback();
  layout.dispose();
  assert(disconnected);
  assert.equal(cancelled, requests);
  bottom = 500;
  pending(); callback(); layout.update();
  assert.equal(heights.at(-1), 1, "disposed documents stop reporting");
});
