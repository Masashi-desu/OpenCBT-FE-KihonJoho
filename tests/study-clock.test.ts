import test from "node:test";
import assert from "node:assert/strict";
import { StudyClock } from "../src/core/study-clock";

test("running time includes a gap while next-question generation and saving suppress timer updates", () => {
  const clock = new StudyClock(0);
  assert.equal(clock.collect(1000), 1);
  // No time is consumed while the question is being prepared.
  assert.equal(clock.collect(6600), 5);
  // Saving takes another two seconds; finishing immediately must include them.
  assert.equal(clock.collect(8600), 2);
  assert.equal(clock.collect(9000), 1);
});

test("explicit pause excludes idle time while retaining the fraction of a running second", () => {
  const clock = new StudyClock(0);
  assert.equal(clock.collect(750), 0);
  clock.reset(10750);
  assert.equal(clock.collect(11000), 1);
  assert.equal(clock.collect(11999), 0);
  assert.equal(clock.collect(12000), 1);
});

test("new or reopened sessions do not inherit another session's fractional time", () => {
  const clock = new StudyClock(0);
  assert.equal(clock.collect(900), 0);
  clock.reset(5000, true);
  assert.equal(clock.collect(5100), 0);
  assert.equal(clock.collect(6000), 1);
});
